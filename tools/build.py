#!/usr/bin/env python3
"""Deterministic local BP/RP packages; no download, publication or credential access."""
from pathlib import Path
import argparse, hashlib, io, json, zipfile
from validate import ROOT, PACKS, content_files, validate

ZIP_DATE = (2026, 1, 1, 0, 0, 0)

def zip_bytes(entries):
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
        for name,data in sorted(entries):
            info=zipfile.ZipInfo(name,ZIP_DATE)
            info.compress_type=zipfile.ZIP_DEFLATED
            info.external_attr=0o100644 << 16
            z.writestr(info,data,compress_type=zipfile.ZIP_DEFLATED,compresslevel=9)
    return buffer.getvalue()

def build(root=ROOT, output=None):
    root=Path(root).resolve()
    output=Path(output or root/'artifacts').resolve()
    if output.is_relative_to(root/'behavior_pack') or output.is_relative_to(root/'resource_pack'):
        raise ValueError('Output cannot be inside a pack')
    result=validate(root)
    if not result['passed']:
        raise ValueError('Pack validation failed: '+ '; '.join(result['errors']))
    entries=[]
    for pack,slug in zip(PACKS,['BP','RP']):
        entries.append((f'WOLFVERSE_{slug}.mcpack',zip_bytes([(p.relative_to(root/pack).as_posix(),p.read_bytes()) for p in content_files(root,pack)])))
    data=zip_bytes(entries)
    # Test both nested archives before publishing local output.
    with zipfile.ZipFile(io.BytesIO(data)) as outer:
        assert outer.testzip() is None
        for name in outer.namelist():
            with zipfile.ZipFile(io.BytesIO(outer.read(name))) as inner:
                assert inner.testzip() is None
                assert 'manifest.json' in inner.namelist()
                assert all(not x.startswith('/') and '..' not in Path(x).parts and not x.endswith('.d.ts') for x in inner.namelist())
    output.mkdir(parents=True,exist_ok=True)
    path=output/'WOLFVERSE-Foundation-0.1.0.mcaddon'
    path.write_bytes(data)
    report={'file':path.name,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'zip_crc_passed':True,
            'deterministic_zip_date':list(ZIP_DATE),'pack_sha256':result['pack_sha256'],'contains_world_or_third_party_runtime':False}
    (output/'build.json').write_text(json.dumps(report,indent=2)+'\n')
    return report

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root',type=Path,default=ROOT)
    parser.add_argument('--output',type=Path)
    args=parser.parse_args()
    report=build(args.root,args.output)
    print(json.dumps({k:v for k,v in report.items() if k!='pack_sha256'},indent=2))

if __name__=='__main__':
    main()
