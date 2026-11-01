#!/usr/bin/env python3
"""Read exact Bank of England nominal gilt 2Y/10Y fitted spot observations.
BoE latest archive is ZIP of XLSX workbooks, no public API. All parsing uses stdlib.
Never interpolate dates or maturities; no OIS/real yields allowed as substitutes.
"""
import datetime as dt, io, json, re, sys, urllib.request, zipfile
from xml.etree import ElementTree as ET
URL="https://www.bankofengland.co.uk/-/media/boe/files/statistics/yield-curves/latest-yield-curve-data.zip"
NS={"m":"http://schemas.openxmlformats.org/spreadsheetml/2006/main","r":"http://schemas.openxmlformats.org/officeDocument/2006/relationships"}
def index(ref):
    m=re.match(r"([A-Z]+)",ref or "")
    if not m:return None
    n=0
    for c in m.group(1):n=n*26+ord(c)-64
    return n-1
def text(cell,strings):
    if cell.attrib.get("t")=="inlineStr":return "".join(v.text or "" for v in cell.findall(".//m:t",NS))
    v=cell.find("m:v",NS)
    if v is None:return ""
    val=v.text or ""
    if cell.attrib.get("t")=="s":
        try:return strings[int(val)]
        except (ValueError,IndexError):return ""
    try:return float(val)
    except ValueError:return val
def read_spot(content):
    with zipfile.ZipFile(io.BytesIO(content)) as z:
        shared=[]
        if "xl/sharedStrings.xml" in z.namelist():
            root=ET.fromstring(z.read("xl/sharedStrings.xml"))
            shared=["".join(x.text or "" for x in si.findall(".//m:t",NS)) for si in root.findall("m:si",NS)]
        workbook=ET.fromstring(z.read("xl/workbook.xml"))
        relations=ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
        relmap={x.attrib["Id"]:x.attrib["Target"] for x in relations}
        choices=[]
        for sh in workbook.findall(".//m:sheet",NS):
            if re.search(r"spot curve$",sh.attrib.get("name",""),re.I):
                target=relmap.get(sh.attrib.get("{"+NS["r"]+"}id"),"")
                target=target.lstrip("/")
                if not target.startswith("xl/"):target="xl/"+target
                if target in z.namelist():choices.append(target)
        if not choices:raise ValueError("Bank of England fitted spot worksheet missing")
        for target in choices:
            sheet=ET.fromstring(z.read(target))
            rows=[]
            for row in sheet.findall(".//m:sheetData/m:row",NS):
                cells={index(c.attrib.get("r")):text(c,shared) for c in row.findall("m:c",NS)}
                rows.append((int(row.attrib.get("r",0)),cells))
            header=[]
            for n,cells in rows[:9]:
                found={int(round(float(v))):i for i,v in cells.items() if i and isinstance(v,(int,float)) and abs(v-round(v))<1e-5 and v in (2,10)}
                if 2 in found and 10 in found and found[2]!=found[10]:
                    header=[n,found[2],found[10]]
                    break
            if not header:continue
            result=[]
            for n,c in rows:
                if n<=header[0]:continue
                raw=c.get(0)
                if isinstance(raw,(int,float)):
                    date=(dt.datetime(1899,12,30)+dt.timedelta(days=float(raw))).date()
                elif isinstance(raw,str):
                    try:date=dt.date.fromisoformat(raw[:10])
                    except ValueError:continue
                else:continue
                a,b=c.get(header[1]),c.get(header[2])
                if isinstance(a,(int,float)) and isinstance(b,(int,float)) and -10<a<35 and -10<b<35 and date<=dt.datetime.utcnow().date():
                    result.append({"date":date.isoformat(),"2Y":float(a),"10Y":float(b)})
            if result:return result[-400:]
    raise ValueError("No dated 2-year/10-year spot observations in BoE nominal workbook")
def main():
    req=urllib.request.Request(URL,headers={"User-Agent":"TRADE90 research source audit (tradeninety.com)","Accept":"application/zip"})
    with urllib.request.urlopen(req,timeout=25) as res:raw=res.read(25_000_000)
    with zipfile.ZipFile(io.BytesIO(raw)) as archive:
        candidates=[n for n in archive.namelist() if re.search(r"GLC.?Nominal",n,re.I) and re.search(r"daily",n,re.I) and n.lower().endswith((".xlsx",".xls"))]
        if not candidates:raise ValueError("BoE latest archive has no nominal daily XLSX workbook: "+",".join(archive.namelist())[:250])
        results=[]
        for n in candidates:
            if n.lower().endswith(".xlsx"):results+=read_spot(archive.read(n))
        results=sorted({r["date"]:r for r in results}.values(),key=lambda r:r["date"])
        if not results:raise ValueError("BoE archive does not contain validated 2Y and 10Y spot records")
        sys.stdout.write(json.dumps(results[-400:]))
if __name__=="__main__":
    try:main()
    except Exception as e:
        sys.stderr.write(str(e)+"\n")
        sys.exit(1)
