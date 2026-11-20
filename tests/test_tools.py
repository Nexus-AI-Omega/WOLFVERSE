"""Static pack/build tooling tests; not game or device tests."""
from pathlib import Path
import io, json, shutil, sys, tempfile, unittest, zipfile
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'tools'))
from validate import ROOT, validate
from build import build

class PackTools(unittest.TestCase):
    def setUp(self):
        self.temporary=tempfile.TemporaryDirectory();self.root=Path(self.temporary.name)
        for pack in ('behavior_pack','resource_pack'):shutil.copytree(ROOT/pack,self.root/pack)
    def tearDown(self):self.temporary.cleanup()
    def test_current_pack_passes(self):self.assertTrue(validate(self.root)['passed'])
    def test_missing_manifest_is_a_reported_failure(self):
        (self.root/'behavior_pack/manifest.json').unlink();self.assertFalse(validate(self.root)['passed'])
    def test_invalid_json_is_not_accepted(self):
        (self.root/'behavior_pack/items/codex.json').write_text('{bad');self.assertFalse(validate(self.root)['passed'])
    def test_broken_texture_reference_is_detected(self):
        (self.root/'resource_pack/textures/items/wolfverse/codex.png').unlink();self.assertFalse(validate(self.root)['passed'])
    def test_unsafe_script_import_is_detected(self):
        with (self.root/'behavior_pack/scripts/main.js').open('a') as f:f.write("\nimport '../../outside.js';\n")
        self.assertFalse(validate(self.root)['passed'])
    def test_symbolic_links_are_rejected(self):
        (self.root/'resource_pack/link.png').symlink_to(self.root/'resource_pack/pack_icon.png')
        self.assertFalse(validate(self.root)['passed'])
    def test_fake_secret_shaped_string_is_detected(self):
        with (self.root/'behavior_pack/scripts/main.js').open('a') as f:f.write('\n// '+'gh'+'p_'+'A'*36)
        self.assertFalse(validate(self.root)['passed'])
    def test_bad_png_header_is_detected(self):
        (self.root/'resource_pack/pack_icon.png').write_bytes(b'not an image');self.assertFalse(validate(self.root)['passed'])
    def test_api_version_drift_is_detected(self):
        path=self.root/'behavior_pack/manifest.json';data=json.loads(path.read_text());data['dependencies'][1]['version']='9.9.9';path.write_text(json.dumps(data))
        self.assertFalse(validate(self.root)['passed'])
    def test_builds_are_byte_reproducible_and_contain_only_pack_files(self):
        a=build(self.root,self.root/'release-a');b=build(self.root,self.root/'release-b');self.assertEqual(a['sha256'],b['sha256'])
        with zipfile.ZipFile(self.root/'release-a'/a['file']) as outer:
            self.assertEqual(set(outer.namelist()),{'WOLFVERSE_BP.mcpack','WOLFVERSE_RP.mcpack'})
            for name in outer.namelist():
                with zipfile.ZipFile(io.BytesIO(outer.read(name))) as inner:
                    self.assertIsNone(inner.testzip());self.assertIn('manifest.json',inner.namelist())
                    self.assertTrue(all(not x.endswith('.d.ts') for x in inner.namelist()))
                    self.assertFalse(any('qa_probe' in x or 'test' in x for x in inner.namelist()))
    def test_output_cannot_be_a_pack_subdirectory(self):
        with self.assertRaises(ValueError):build(self.root,self.root/'behavior_pack/generated')

if __name__=='__main__':unittest.main()
