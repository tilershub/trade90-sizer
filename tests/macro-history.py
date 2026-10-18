import importlib.util, pathlib, unittest
spec=importlib.util.spec_from_file_location('macro',pathlib.Path(__file__).parents[1]/'scripts/update-macro-history.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
def table(unit='Index 2015=100',freq='Monthly',sid='TEST',missing=None):
    fields={'Series ID':sid,'Frequency':freq,'Units':unit,'Seasonal Adjustment':'Not Seasonally Adjusted'}
    rows=list(fields.items())
    for year in (2023,2024):
        for month in range(1,13):
            date=f'{year}-{month:02d}-01'
            rows.append((date,'.' if date==missing else str(100 if year==2023 else 110)))
    return ''.join(f'<tr><th>{k}</th><td>{v}</td></tr>' for k,v in rows)
class ParseTest(unittest.TestCase):
    def test_yoy_and_missing_periods(self):
        _,points=m.parse_table(table(missing='2023-03-01'),'TEST','Monthly','inflation','yoy')
        self.assertEqual(len(points),11)
        self.assertTrue(all(p['value']==10 for p in points))
        self.assertNotIn('2024-03-01',[p['date'] for p in points])
    def test_wrong_series_and_unit_rejected(self):
        for body in (table(sid='OTHER'),table(unit='Dollars')):
            with self.assertRaises(ValueError):m.parse_table(body,'TEST','Monthly','inflation','yoy')
    def test_extra_rows_are_read_without_executing_scripts(self):
        body=table()+ '<div id="extra-rows">#2025-01-01|121.0</div>'
        _,points=m.parse_table(body,'TEST','Monthly','inflation','yoy')
        self.assertEqual(points[-1],{'date':'2025-01-01','value':10.0})
    def test_html_challenge_rejected(self):
        with self.assertRaises(ValueError):m.parse_table('<html>Sign in</html>','TEST','Monthly','inflation','yoy')
if __name__=='__main__':unittest.main()
