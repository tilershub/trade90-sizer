import importlib.util, pathlib, unittest
ROOT=pathlib.Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('inputs', ROOT/'scripts/update-policy-inputs.py')
inputs=importlib.util.module_from_spec(spec);spec.loader.exec_module(inputs)

class PolicyInputs(unittest.TestCase):
    def test_core_does_not_accept_headline_dimensions(self):
        header='DATAFLOW,REF_AREA,FREQ,METHODOLOGY,MEASURE,UNIT_MEASURE,EXPENDITURE,ADJUSTMENT,TRANSFORMATION,TIME_PERIOD,OBS_VALUE\n'
        body=header+''.join(f'OECD.SDD.TPS:DSD_PRICES@DF_PRICES_ALL(1.0),GBR,M,N,CPI,PA,_T,N,GY,2025-{i:02d},2.5\n' for i in range(1,9))
        with self.assertRaises(ValueError): inputs.macro.parse_oecd(body,'GBR','M','DSD_PRICES@DF_PRICES_ALL','_TXCP01_NRG')
        core=body.replace(',_T,',',_TXCP01_NRG,')
        self.assertEqual(len(inputs.macro.parse_oecd(core,'GBR','M','DSD_PRICES@DF_PRICES_ALL','_TXCP01_NRG')),8)
    def test_pce_identity_units_and_yoy(self):
        def row(k,v):return f'<tr><th>{k}</th><td>{v}</td></tr>'
        meta=''.join(row(k,v) for k,v in {'Series ID':'PCEPI','Frequency':'Monthly','Units':'Index 2017=100','Seasonal Adjustment':'Seasonally Adjusted'}.items())
        body=meta+''.join(row(f'{y}-{m:02d}-01',100 if y==2024 else 103) for y in [2024,2025] for m in range(1,13))
        _,points=inputs.macro.parse_table(body,'PCEPI','Monthly','inflation','yoy','Seasonally Adjusted')
        self.assertEqual(points[-1]['value'],3)
        with self.assertRaises(ValueError):inputs.macro.parse_table(body,'PCEPILFE','Monthly','inflation','yoy','Seasonally Adjusted')
        with self.assertRaises(ValueError):inputs.macro.parse_table(body.replace('Index 2017=100','Percent'),'PCEPI','Monthly','inflation','yoy','Seasonally Adjusted')

if __name__=='__main__':unittest.main()
