"""Additional policy research inputs, isolated from the comparison-chart series.
Public official APIs; failures retain history but invalidate the affected input.
"""
import concurrent.futures, datetime as dt, importlib.util, json, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('macro', ROOT / 'scripts/update-macro-history.py')
macro = importlib.util.module_from_spec(spec)
spec.loader.exec_module(macro)
OUT = ROOT / 'public/data/policy-inputs.json'

def record(sid, title, url, source, frequency, points, **extra):
    return dict(seriesId=sid, sourceTitle=title, source=source, sourceUrl=url,
                frequency=frequency, points=points, status=macro.freshness(points, frequency),
                retrievedAt=dt.datetime.now(dt.timezone.utc).isoformat(), **extra)

def oecd(flow, areas, expenditure, members):
    url=f'https://sdmx.oecd.org/public/rest/v1/data/OECD.SDD.TPS,{flow},1.0/{areas}.M+Q.N.CPI.PA.{expenditure}.N.GY?startPeriod=2020'
    body=macro.download(url)
    result={}
    for currency,iso,freq,key in members:
        points=macro.parse_oecd(body,iso,freq,flow,expenditure)
        title='Headline CPI, year-on-year' if expenditure=='_T' else 'CPI excluding food and energy, year-on-year'
        result[(currency,key)]=record(flow+':'+iso+':'+freq+':'+expenditure,title,
            'https://data-explorer.oecd.org/vis?df[ag]=OECD.SDD.TPS&df[id]='+flow,
            'OECD','Quarterly' if freq=='Q' else 'Monthly',points,retrievalUrl=url)
    return result

def pce():
    result={}
    for sid,key in [('PCEPI','targetInflation'),('PCEPILFE','coreInflation')]:
        url=f'https://fred.stlouisfed.org/data/{sid}.txt'
        meta,points=macro.parse_table(macro.download(url,'text/html'),sid,'Monthly','inflation','yoy','Seasonally Adjusted')
        if meta['Source']!='U.S. Bureau of Economic Analysis': raise ValueError('Unexpected PCE source')
        result[('USD',key)]=record(sid,meta['Title']+' — year-on-year change',
            f'https://fred.stlouisfed.org/series/{sid}','BEA via FRED','Monthly',points,
            sourceUpdated=meta.get('Last Updated'),retrievalUrl=url,transform='year-on-year from index')
    return result

def euro():
    dims={'geo':'EA21','coicop18':'TOT_X_NRG_FOOD','unit':'RCH_A','freq':'M'}
    url='https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/prc_hicp_minr?lang=en&'+ '&'.join(k+'='+v for k,v in dims.items())+'&sinceTimePeriod=2020-01'
    raw=json.loads(macro.download(url,'application/json'))
    points=macro.parse_eurostat(raw,dims)
    return {('EUR','coreInflation'):record('prc_hicp_minr:EA21:TOT_X_NRG_FOOD',
        'HICP excluding energy, food, alcohol and tobacco, year-on-year',
        'https://ec.europa.eu/eurostat/databrowser/view/prc_hicp_minr/default/table',
        'Eurostat','Monthly',points,geography='EA21',sourceUpdated=raw.get('updated'),retrievalUrl=url)}

def main():
    old=json.loads(OUT.read_text()) if OUT.exists() else {'schemaVersion':1,'countries':{}}
    groups=[
        ([('AUD','coreInflation'),('GBP','coreInflation'),('NZD','coreInflation')],
         lambda:oecd('DSD_PRICES@DF_PRICES_ALL','AUS+GBR+NZL','_TXCP01_NRG',[
             ('AUD','AUS','M','coreInflation'),('GBP','GBR','M','coreInflation'),('NZD','NZL','Q','coreInflation')])),
        ([('CHF','coreInflation'),('JPY','coreInflation'),('CAD','coreInflation')],
         lambda:oecd('DSD_PRICES_COICOP2018@DF_PRICES_C2018_ALL','CHE+JPN+CAN','_TXCP01_NRG',[
             ('CHF','CHE','M','coreInflation'),('JPY','JPN','M','coreInflation'),('CAD','CAN','M','coreInflation')])),
        ([('AUD','targetInflation')],lambda:oecd('DSD_PRICES@DF_PRICES_ALL','AUS','_T',[('AUD','AUS','M','targetInflation')])),
        ([('USD','targetInflation'),('USD','coreInflation')],pce),
        ([('EUR','coreInflation')],euro)]
    failures=[]
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        jobs={pool.submit(fn):keys for keys,fn in groups}
        for job in concurrent.futures.as_completed(jobs):
            keys=jobs[job]
            try:
                for (currency,key),value in job.result().items():
                    old['countries'].setdefault(currency,{'series':{}})['series'][key]=value
                    print(currency,key,value['status'],value['points'][-1],flush=True)
                    if value['status']!='ok':failures.append(currency+'/'+key+': stale')
            except Exception as exc:
                for currency,key in keys:
                    value=old['countries'].setdefault(currency,{'series':{}})['series'].setdefault(key,{'points':[]})
                    value.update(status='refresh_failed',lastError=str(exc))
                failures.append(str(keys)+': '+str(exc))
    old['checkedAt']=dt.datetime.now(dt.timezone.utc).isoformat()
    tmp=OUT.with_suffix('.tmp');tmp.write_text(json.dumps(old,indent=2)+'\n');tmp.replace(OUT)
    if failures:raise SystemExit('\n'.join(failures))

if __name__=='__main__':main()
