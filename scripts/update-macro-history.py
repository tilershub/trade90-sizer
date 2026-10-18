"""Refresh source-attributed macro histories. Standard library only; no API key.
FRED's public observation tables preserve provider metadata. Fail closed on changes.
"""
import concurrent.futures, datetime as dt, html, json, math, re, pathlib, urllib.request
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

def retrieve(spec):
    currency,metric,name,sid,freq,transform=spec
    req=urllib.request.Request(f'https://fred.stlouisfed.org/data/{sid}.txt',headers={'User-Agent':'Trade90 macro research (tradeninety.com)'})
    with urllib.request.urlopen(req, timeout=45) as response: body=response.read().decode()
    meta,points=parse_table(body,sid,freq,metric,transform)
    return {'seriesId':sid,'country':name,'frequency':freq,'source':meta['Source'],'sourceTitle':meta['Title'],'sourceUrl':f'https://fred.stlouisfed.org/series/{sid}','sourceUpdated':meta.get('Last Updated'), 'retrievedAt':dt.datetime.now(dt.timezone.utc).isoformat(),'transform':transform,'status':'ok','points':points}

def main():
    data=json.loads(OUT.read_text()) if OUT.exists() else {'schemaVersion':1,'countries':{}}
    failures=[]
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        jobs={pool.submit(retrieve,s):s for s in specs()}
        for job in concurrent.futures.as_completed(jobs):
            currency,metric,name,sid,freq,transform=jobs[job]
            country=data['countries'].setdefault(currency,{'name':name,'series':{}})
            try:
                country['series'][metric]=job.result()
                print(currency,metric,len(country['series'][metric]['points']),country['series'][metric]['points'][-1]['date'],flush=True)
            except Exception as e:
                failures.append(f'{currency}/{metric}: {e}')
                old=country['series'].setdefault(metric,{'seriesId':sid,'country':name,'frequency':freq,'sourceUrl':f'https://fred.stlouisfed.org/series/{sid}','points':[]})
                old['status']='refresh_failed'
                print('FAILED',failures[-1],flush=True)
    data['checkedAt']=dt.datetime.now(dt.timezone.utc).isoformat()
    OUT.parent.mkdir(parents=True,exist_ok=True)
    tmp=OUT.with_suffix('.tmp');tmp.write_text(json.dumps(data,indent=2)+'\n');tmp.replace(OUT)
    if failures: print('\n'.join(failures))
    if not any(s.get('points') for c in data['countries'].values() for s in c['series'].values()): raise SystemExit('No usable series')
if __name__=='__main__': main()
