#!/usr/bin/env python3
"""Run actual local checks and save bounded, sanitized evidence. Does not run game/device tests."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib, json, re, subprocess, sys
from validate import ROOT, fingerprint

def main():
    directory=ROOT/'test-results';directory.mkdir(exist_ok=True)
    commands=[('node-unit',['npm','test']),('api-typecheck',['npm','run','typecheck']),
              ('python-tooling',[sys.executable,'-m','unittest','discover','-s','tests','-p','test_*.py','-v']),
              ('pack-validation',[sys.executable,'tools/validate.py','--report','test-results/pack-validation.json']),
              ('build',[sys.executable,'tools/build.py'])]
    reports=[]
    for name,command in commands:
        completed=subprocess.run(command,cwd=ROOT,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,timeout=180)
        text=completed.stdout
        (directory/f'{name}.log').write_text(text)
        record={'name':name,'command':command,'exit_code':completed.returncode,'passed':completed.returncode==0}
        if name=='node-unit':
            for key in ['tests','pass','fail','skipped']:
                match=re.search(r'^# '+key+r' (\d+)\s*$',text,re.M)
                if match:record[key]=int(match.group(1))
        reports.append(record)
        print(name+': '+('PASS' if record['passed'] else 'FAIL'),flush=True)
    report={'recorded_at_utc':datetime.now(timezone.utc).isoformat(),'categories':['Node domain/service/runtime simulation','API 2.0.0 type binding','Python tooling','pack static checks','deterministic build'],
            'checks':reports,'all_passed':all(r['passed'] for r in reports),'pack_sha256':fingerprint(),
            'not_proven':['native UI/touch and sound/graphics on iPad','real Player storage across client rejoin','Realm deployment','two real players','FPS/endurance','fox companions and later milestones']}
    data=json.dumps(report,indent=2)+'\n'
    (directory/'verification.json').write_text(data)
    print('Evidence: test-results/verification.json')
    return 0 if report['all_passed'] else 1

if __name__=='__main__':
    raise SystemExit(main())
