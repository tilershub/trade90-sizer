#!/usr/bin/env python3
"""Parse RBNZ B2 downloadable government-bond benchmark closing yields.
Select original 2Y and 10Y columns only; reject swaps and missing observations.
"""
import datetime as dt,io,json,re,sys,urllib.request,zipfile
from xml.etree import ElementTree as ET
URL="https://www.rbnz.govt.nz/-/media/project/sites/rbnz/files/statistics/series/b/b2/hb2-daily-close.xlsx"
NS={"m":"http://schemas.openxmlformats.org/spreadsheetml/2006/main","r":"http://schemas.openxmlformats.org/officeDocument/2006/relationships"}
def index(ref):
 m=re.match(r'([A-Z]+)',ref or '')
 if not m:return None
 n=0
 for c in m.group(1):n=n*26+ord(c)-64
 return n-1
def read_xlsx(content):
 with zipfile.ZipFile(io.BytesIO(content)) as z:
  shared=[]
  if 'xl/sharedStrings.xml' in z.namelist():
   root=ET.fromstring(z.read('xl/sharedStrings.xml'))
   shared=[''.join(x.text or '' for x in v.findall('.//m:t',NS)) for v in root.findall('m:si',NS)]
  result=[]
  for sheet in [name for name in z.namelist() if re.fullmatch(r'xl/worksheets/sheet\d+.xml',name)]:
   rows=[]
   root=ET.fromstring(z.read(sheet))
   for r in root.findall('.//m:sheetData/m:row',NS):
    cells={}
    for c in r.findall('m:c',NS):
     value=c.find('m:v',NS);idx=index(c.attrib.get('r'))
     if idx is None:continue
     if c.attrib.get('t')=='inlineStr':v=''.join(x.text or '' for x in c.findall('.//m:t',NS))
     elif value is None:continue
     elif c.attrib.get('t')=='s':
      try:v=shared[int(value.text or '')]
      except (IndexError,ValueError):continue
     else:
      try:v=float(value.text or '')
      except ValueError:v=value.text or ''
     cells[idx]=v
    rows.append((int(r.attrib.get('r',0)),cells))
   candidate=None
   for pos,(rowno,cell) in enumerate(rows[:40]):
    tokens={i:re.sub(r'\s+',' ',str(v)).lower().strip() for i,v in cell.items()}
    twos=[i for i,x in tokens.items() if re.fullmatch(r'2.?year(s)?|2.?yr(s)?|2.?y',x)]
    tens=[i for i,x in tokens.items() if re.fullmatch(r'10.?year(s)?|10.?yr(s)?|10.?y',x)]
    for a in twos:
     for b in tens:
      # Restrict to matching benchmark order with 5Y between them;
      # never pick a swap column with a similar heading.
      if a>=4 and b>a and 1<=b-a<=4 and any(re.search(r'^5.?year|^5.?yr|^5.?y',tokens.get(j,'')) for j in range(a+1,b)):
       candidate=(rowno,a,b)
       break
     if candidate:break
    if candidate:break
   if not candidate:continue
   for rowno,cell in rows:
    if rowno<=candidate[0]:continue
    when=cell.get(0)
    if isinstance(when,(float,int)) and when>30000:
     date=(dt.datetime(1899,12,30)+dt.timedelta(days=float(when))).date()
    elif isinstance(when,str):
     try:date=dt.date.fromisoformat(when[:10])
     except ValueError:
      try:date=dt.datetime.strptime(when,'%d %b %Y').date()
      except ValueError:continue
    else:continue
    a,b=cell.get(candidate[1]),cell.get(candidate[2])
    if isinstance(a,(float,int)) and isinstance(b,(float,int)) and -10<a<35 and -10<b<35 and date<=dt.date.today():
     result.append({'date':date.isoformat(),'2Y':round(a,6),'10Y':round(b,6)})
  if result:return sorted({r['date']:r for r in result}.values(),key=lambda x:x['date'])[-400:]
  raise ValueError('No matching dated 2Y/5Y/10Y government benchmark columns found in RBNZ B2 workbook')
def main():
 req=urllib.request.Request(URL,headers={'User-Agent':'TRADE90 research source audit (tradeninety.com)','Accept':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})
 with urllib.request.urlopen(req,timeout=24) as response:raw=response.read(8_000_000)
 rows=read_xlsx(raw)
 if not rows:raise ValueError('No source observations')
 print(json.dumps(rows))
if __name__=='__main__':
 try:main()
 except Exception as e:
  sys.stderr.write(str(e)+'\n');sys.exit(1)
