"""Refresh source-attributed macro histories. Standard library only; no API key.
FRED's public observation tables preserve provider metadata. Fail closed on changes.
"""
import concurrent.futures, datetime as dt, html, json, math, re, pathlib, urllib.request, csv, io, subprocess, time
ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/data/macro-history.json'
COUNTRIES = {'AUD':('Australia','AU'), 'CHF':('Switzerland','CH'), 'CAD':('Canada','CA'), 'EUR':('Euro area','EZ'), 'GBP':('United Kingdom','GB'), 'JPY':('Japan','JP'), 'NZD':('New Zealand','NZ'), 'USD':('United States','US')}

def specs():
    for currency,(name,code) in COUNTRIES.items():
        for metric in ('inflation','unemployment','gdp'):
            freq = 'Quarterly' if metric == 'gdp' or (metric == 'inflation' and code in ('AU','NZ')) or (metric == 'unemployment' and code in ('CH','NZ')) else 'Monthly'
            f = freq[0]
            sid = {'inflation':f'CPALTT01{code}{f}659N','unemployment':f'LRHUTTTT{code}{f}156S','gdp':f'NAEXKP01{code}Q657S'}[metric]
            transform = None
            if metric == 'inflation' and currency != 'EUR':
                iso={'AUD':'AUS','CHF':'CHE','CAD':'CAN','GBP':'GBR','JPY':'JPN','NZD':'NZL','USD':'USA'}[currency]
                sid,transform=f'{iso}CPIALL{f}INMEI','yoy'
            if currency == 'USD' and metric == 'inflation': sid='CPIAUCNS'
            if currency == 'USD' and metric == 'unemployment': sid='UNRATE'
            if currency == 'EUR' and metric == 'unemployment': sid='LRHUTTTTEZM156S'
            if currency == 'EUR' and metric == 'inflation': sid,transform = 'CP0000EZ19M086NEST','yoy'
            if currency == 'EUR' and metric == 'gdp': sid,transform = 'CLVMNACSCAB1GQEA19','qoq'
            yield currency,metric,name,sid,freq,transform

def clean(s): return html.unescape(re.sub('<[^>]+>', ' ', s)).strip()

def parse_table(body, sid, freq, metric, transform):
    rows = re.findall(r'<tr[^>]*>\s*<th[^>]*>(.*?)</th>\s*<td[^>]*>(.*?)</td>\s*</tr>',body,re.S)
    metadata = {clean(k):clean(v) for k,v in rows if not re.fullmatch(r'\d{4}-\d{2}-\d{2}',clean(k))}
    if metadata.get('Series ID') != sid or metadata.get('Frequency') != freq: raise ValueError('Series identity/frequency mismatch')
    unit = metadata.get('Units','').lower()
    expected = ('millions of chained 2010 euros' if sid=='CLVMNACSCAB1GQEA19' else 'index') if transform else {'inflation':'growth rate same period previous year','unemployment':'percent','gdp':'growth rate previous period'}[metric]
    if expected not in unit: raise ValueError('Unexpected units: '+unit)
    expected_adjustment = 'Not Seasonally Adjusted' if metric == 'inflation' else 'Seasonally Adjusted'
    if metadata.get('Seasonal Adjustment') != expected_adjustment: raise ValueError('Unexpected seasonal adjustment')
    # Long FRED tables append additional observations from a literal JS string.
    # Parse only date/value literals; never execute provider JavaScript.
    rows += re.findall(r'#(\d{4}-\d{2}-\d{2})\|[ \t]*([-+0-9.eE]+)',body)
    values={}
    today=dt.date.today().isoformat()
    for k,v in rows:
        date,value=clean(k),clean(v)
        if not re.fullmatch(r'\d{4}-\d{2}-\d{2}',date) or date>today: continue
        try: n=float(value)
        except ValueError: continue
        if math.isfinite(n): values[date]=n
    if transform:
        result={}
        for date,n in values.items():
            d=dt.date.fromisoformat(date)
            months=d.year*12+d.month-1-(12 if transform=='yoy' else 3)
            prior=f'{months//12:04d}-{months%12+1:02d}-01'
            if prior in values and values[prior]>0: result[date]=(n/values[prior]-1)*100
        values=result
    points=[{'date':d,'value':round(v,5)} for d,v in sorted(values.items()) if d>='2015-01-01']
    if len(points)<8: raise ValueError('Insufficient valid observations')
    return metadata,points

def download(url, accept='text/csv'):
    # curl has bounded total time as well as connect time; retry only transient errors.
    # A proxy can leave a completed HTML response open: accept only a complete document.
    for attempt in range(2):
        result=subprocess.run(['curl','--silent','--show-error','--fail','--location',
            '--connect-timeout','10','--max-time','30','--header','Accept: '+accept,url],capture_output=True,text=True)
        body=result.stdout
        if result.returncode==0 or (result.returncode==28 and accept=='text/html' and '</html>' in body.lower()):
            if body.strip(): return body
        if attempt==0: time.sleep(2)
    raise ValueError('Provider request failed: '+str(result.returncode))

def freshness(points, freq):
    age=(dt.date.today()-dt.date.fromisoformat(points[-1].get('periodEnd',points[-1]['date']))).days
    return 'stale' if age>(240 if freq=='Quarterly' else 120) else 'ok'

def parse_oecd(body, iso, freq, flow):
    result={}
    for r in csv.DictReader(io.StringIO(body)):
        if r.get('REF_AREA')!=iso or r.get('FREQ')!=freq: continue
        expected={'MEASURE':'CPI','UNIT_MEASURE':'PA','EXPENDITURE':'_T','ADJUSTMENT':'N','TRANSFORMATION':'GY','METHODOLOGY':'N'}
        if any(r.get(k)!=v for k,v in expected.items()) or flow not in r.get('DATAFLOW',''): raise ValueError('Unexpected OECD dimensions')
        period=r['TIME_PERIOD']
        if freq=='Q' and re.fullmatch(r'\d{4}-Q[1-4]',period): date=f'{period[:4]}-{(int(period[-1])-1)*3+1:02d}-01'
        elif freq=='M' and re.fullmatch(r'\d{4}-\d{2}',period): date=period+'-01'
        else: raise ValueError('Invalid OECD period')
        if r.get('OBS_STATUS') in ('F','M') or not r.get('OBS_VALUE'): continue
        value=float(r['OBS_VALUE'])
        if not math.isfinite(value) or abs(value)>100: raise ValueError('Invalid CPI observation')
        if date<=dt.date.today().isoformat(): result[date]=round(value,5)
    points=[{'date':d,'value':v} for d,v in sorted(result.items())]
    if len(points)<8: raise ValueError('Insufficient OECD history')
    return points

def parse_eurostat(raw, dimensions, quarterly=False):
    if raw.get('source')!='ESTAT':raise ValueError('Unexpected Eurostat source')
    for key,val in dimensions.items():
        if set(raw['dimension'][key]['category']['index'])!={val}:raise ValueError('Unexpected Eurostat dimensions: '+key)
    if set(raw['id'])!=set(dimensions)|{'time'}:raise ValueError('Unfiltered Eurostat dimension')
    points=[]
    for period,index in sorted(raw['dimension']['time']['category']['index'].items()):
        v=raw.get('value',{}).get(str(index))
        if quarterly:
            if not re.fullmatch(r'\d{4}-Q[1-4]',period):raise ValueError('Invalid quarter')
            date=f'{period[:4]}-{(int(period[-1])-1)*3+1:02d}-01'
        else:
            if not re.fullmatch(r'\d{4}-\d{2}',period):raise ValueError('Invalid month')
            date=period+'-01'
        if v is not None and math.isfinite(v) and abs(v)<=100 and date<=dt.date.today().isoformat():points.append({'date':date,'value':v})
    if len(points)<8:raise ValueError('Insufficient Eurostat history')
    return points

def direct_series():
    result={}
    iso={'AUD':'AUS','CHF':'CHE','CAD':'CAN','GBP':'GBR','JPY':'JPN','NZD':'NZL'}
    flow='DSD_PRICES@DF_PRICES_ALL'
    url='https://sdmx.oecd.org/public/rest/v1/data/OECD.SDD.TPS,'+flow+',1.0/AUS+CHE+CAN+GBR+JPN+NZL.M+Q.N.CPI.PA._T.N.GY?startPeriod=2015'
    body=download(url)
    for c,code in iso.items():
        freq='Q' if c in ('AUD','NZD') else 'M'
        try:
            points=parse_oecd(body,code,freq,flow)
            result[(c,'inflation')]={'seriesId':flow+':'+code+':'+freq,'country':COUNTRIES[c][0],
                'frequency':'Quarterly' if freq=='Q' else 'Monthly','source':'OECD','provider':'OECD SDMX',
                'sourceTitle':'National headline CPI, all items, year-on-year percentage change (COICOP 1999)',
                'sourceUrl':'https://data-explorer.oecd.org/vis?df[ag]=OECD.SDD.TPS&df[id]='+flow,
                'retrievalUrl':url,'sourceUpdated':None,'retrievedAt':dt.datetime.now(dt.timezone.utc).isoformat(),
                'transform':None,'status':freshness(points,'Quarterly' if freq=='Q' else 'Monthly'),'points':points}
        except Exception as e: print(c,'OECD:',e,flush=True)
    # New COICOP classification carries the continuing Japan/Switzerland histories.
    try:
        newflow='DSD_PRICES_COICOP2018@DF_PRICES_C2018_ALL'
        newurl='https://sdmx.oecd.org/public/rest/v1/data/OECD.SDD.TPS,'+newflow+',1.0/CHE+JPN.M.N.CPI.PA._T.N.GY?startPeriod=2015'
        newbody=download(newurl)
        for c in ('CHF','JPY'):
            points=parse_oecd(newbody,iso[c],'M',newflow)
            old=result.get((c,'inflation'))
            if old and points[-1]['date']>old['points'][-1]['date']:
                old.update(seriesId=newflow+':'+iso[c]+':M',points=points,status=freshness(points,'Monthly'),sourceTitle='National headline CPI, all items, year-on-year percentage change (COICOP 2018)',sourceUrl='https://data-explorer.oecd.org/vis?df[ag]=OECD.SDD.TPS&df[id]='+newflow,retrievalUrl=newurl)
    except Exception as e: print('OECD COICOP 2018:',e,flush=True)
    # Current euro-area geography, consistently applied to all three series.
    euro_specs=[
        ('unemployment','une_rt_m',{'geo':'EA21','sex':'T','age':'TOTAL','unit':'PC_ACT','s_adj':'SA','freq':'M'},False,'Unemployment, total labour force, seasonally adjusted'),
        ('inflation','prc_hicp_minr',{'geo':'EA21','coicop18':'TOTAL','unit':'RCH_A','freq':'M'},False,'Headline HICP, ECOICOP version 2, year-on-year percentage change'),
        ('gdp','namq_10_gdp',{'geo':'EA21','na_item':'B1GQ','unit':'CLV_PCH_PRE','s_adj':'SCA','freq':'Q'},True,'Real GDP, quarter-on-quarter percentage change, seasonally and calendar adjusted')]
    for metric,dataset,dims,quarterly,title in euro_specs:
        try:
            url='https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/'+dataset+'?lang=en&'+'&'.join(k+'='+v for k,v in dims.items())+'&sinceTimePeriod='+('2015-Q1' if quarterly else '2015-01')
            raw=json.loads(download(url,'application/json'));points=parse_eurostat(raw,dims,quarterly)
            freq='Quarterly' if quarterly else 'Monthly'
            result[('EUR',metric)]={'seriesId':dataset+':EA21','geography':'EA21','country':'Euro area','frequency':freq,'source':'Eurostat','provider':'Eurostat API','sourceTitle':'Euro area (21 countries): '+title,'sourceUrl':'https://ec.europa.eu/eurostat/databrowser/view/'+dataset+'/default/table','retrievalUrl':url,'sourceUpdated':raw.get('updated'),'retrievedAt':dt.datetime.now(dt.timezone.utc).isoformat(),'transform':None,'status':freshness(points,freq),'points':points}
        except Exception as e: print('Eurostat',metric,e,flush=True)
    return result

def retrieve(spec):
    currency,metric,name,sid,freq,transform=spec
    body=download(f'https://fred.stlouisfed.org/data/{sid}.txt', 'text/html')
    meta,points=parse_table(body,sid,freq,metric,transform)
    if currency=='GBP' and metric=='unemployment':
        # OECD assigns the middle month to UK rolling three-month observations.
        for point in points:
            d=dt.date.fromisoformat(point['date']);month=d.year*12+d.month-1+2
            point['periodEnd']=(dt.date(month//12,month%12+1,1)-dt.timedelta(days=1)).isoformat()

    return {'seriesId':sid,'country':name,'frequency':freq,'source':meta['Source'],'sourceTitle':meta['Title'],'sourceUrl':f'https://fred.stlouisfed.org/series/{sid}','sourceUpdated':meta.get('Last Updated'), 'retrievedAt':dt.datetime.now(dt.timezone.utc).isoformat(),'transform':transform,'provider':'FRED','status':freshness(points,freq),'points':points}

def main():
    data=json.loads(OUT.read_text()) if OUT.exists() else {'schemaVersion':1,'countries':{}}
    failures=[]
    try: direct=direct_series()
    except Exception as e:
        print('Direct provider error:',e,flush=True); direct={}
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        jobs={pool.submit(lambda spec: direct.get((spec[0],spec[1])) or retrieve(spec),s):s for s in specs()}
        for job in concurrent.futures.as_completed(jobs):
            currency,metric,name,sid,freq,transform=jobs[job]
            country=data['countries'].setdefault(currency,{'name':name,'series':{}})
            try:
                country['series'][metric]=job.result()
                if country['series'][metric]['status']=='stale': failures.append(f'{currency}/{metric}: source observations are stale')
                print(currency,metric,len(country['series'][metric]['points']),country['series'][metric]['points'][-1]['date'],flush=True)
            except Exception as e:
                failures.append(f'{currency}/{metric}: {e}')
                old=country['series'].setdefault(metric,{'seriesId':sid,'country':name,'frequency':freq,'sourceUrl':f'https://fred.stlouisfed.org/series/{sid}','points':[]})
                old['status']='refresh_failed'
                old['lastError']=str(e)
                print('FAILED',failures[-1],flush=True)
    data['checkedAt']=dt.datetime.now(dt.timezone.utc).isoformat()
    OUT.parent.mkdir(parents=True,exist_ok=True)
    tmp=OUT.with_suffix('.tmp');tmp.write_text(json.dumps(data,indent=2)+'\n');tmp.replace(OUT)
    if failures:
        print('\n'.join(failures))
        raise SystemExit(f'{len(failures)} economic series failed to refresh; cached observations are not a successful update')
    if not any(s.get('points') for c in data['countries'].values() for s in c['series'].values()): raise SystemExit('No usable series')
if __name__=='__main__': main()
