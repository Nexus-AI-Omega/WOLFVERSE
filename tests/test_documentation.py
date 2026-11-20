"""Authored documentation/metadata checks, not upstream link or game certification."""
from pathlib import Path
import json, re, unittest
from urllib.parse import unquote
ROOT=Path(__file__).resolve().parents[1]

class Documentation(unittest.TestCase):
    def test_authored_local_markdown_links_resolve(self):
        files=[ROOT/'README.md',ROOT/'LICENSE.md',ROOT/'CHANGELOG.md',*sorted((ROOT/'documentation').rglob('*.md')),*sorted((ROOT/'test-results').glob('*.md'))]
        bad=[]
        for file in files:
            for link in re.findall(r'!?\[[^\]]*\]\(([^)]+)\)',file.read_text()):
                target=link.split('#',1)[0].split(' "',1)[0]
                if not target or target.startswith(('http:','https:','mailto:','data:')):continue
                path=(file.parent/unquote(target)).resolve()
                if not path.is_relative_to(ROOT) or not path.exists():bad.append(str(file.relative_to(ROOT))+': '+target)
        self.assertEqual(bad,[])
    def test_project_identity_matches_manifests(self):
        project=json.loads((ROOT/'project.json').read_text())
        for pack,key in [('behavior_pack','bp'),('resource_pack','rp')]:
            header=json.loads((ROOT/pack/'manifest.json').read_text())['header']
            self.assertEqual(header['uuid'],project['ids'][key]);self.assertEqual(header['version'],project['version'])
    def test_required_research_evidence_exists(self):
        for name in ['api-types.json','fox-component-inventory.json','bds-download.json','original-assets.json','server-package.json','server-ui-package.json']:
            self.assertIsInstance(json.loads((ROOT/'research'/name).read_text()),dict)
    def test_final_reports_match_present_pack_files(self):
        # Verification runner rewrites the static/local report later; BDS source binding must already match.
        import sys
        sys.path.insert(0,str(ROOT/'tools'))
        from validate import fingerprint
        path=ROOT/'test-results/bds-verification.json'
        if path.exists():
            report=json.loads(path.read_text());self.assertTrue(report['all_passed']);self.assertEqual(report['pack_sha256'],fingerprint())

if __name__=='__main__':unittest.main()
