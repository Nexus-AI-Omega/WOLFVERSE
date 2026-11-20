#!/usr/bin/env python3
"""Opt-in official-runtime probes in a NEW disposable test world; no real players.
Provide an extracted, lawfully obtained official BDS directory. Acknowledge its EULA
separately. Never point this script at a production server; it writes server.properties.
"""
from pathlib import Path
from datetime import datetime, timezone
import argparse, hashlib, json, os, queue, re, shutil, subprocess, threading, time
from validate import ROOT, content_files, fingerprint, validate

WORLD = 'WOLFVERSE_QA_DISPOSABLE'

def run_phase(server, phase, timeout=100):
    env=os.environ.copy();env['LD_LIBRARY_PATH']=str(server)
    proc=subprocess.Popen([str(server/'bedrock_server')],cwd=server,env=env,stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True,bufsize=1)
    stream=queue.Queue();lines=[];result=None;sent=False;ready=False
    def consume():
        for line in proc.stdout:
            stream.put(line)
        stream.put(None)
    reader=threading.Thread(target=consume,daemon=True);reader.start()
    deadline=time.monotonic()+timeout
    try:
        while time.monotonic()<deadline:
            try:line=stream.get(timeout=max(0.1,min(2,deadline-time.monotonic())))
            except queue.Empty:
                if proc.poll() is not None:break
                continue
            if line is None:break
            lines.append(line)
            if '[WOLFVERSE] READY' in line:ready=True
            if not sent and ready and any('Server started' in l for l in lines):
                if phase == 1:proc.stdin.write('tickingarea add circle 0 64 0 2 wolfverseqa true\n')
                proc.stdin.write(f'scriptevent wolfverse_qa:run {phase}\n')
                proc.stdin.flush();sent=True
            if '[WOLFVERSE_QA] RESULT ' in line:
                payload=line.split('[WOLFVERSE_QA] RESULT ',1)[1].strip()
                result=json.loads(payload);break
    finally:
        if proc.poll() is None:
            try:proc.stdin.write('stop\n');proc.stdin.flush()
            except (BrokenPipeError,OSError):pass
            try:proc.wait(timeout=25)
            except subprocess.TimeoutExpired:proc.kill();proc.wait(timeout=10)
        reader.join(timeout=5)
        while not stream.empty():
            line=stream.get_nowait()
            if line:lines.append(line)
    text=''.join(lines)
    # No player identities or credentials are present in this isolated, empty allow-list run.
    text=re.sub(r'(Session ID:|Correlation ID:)\s*[^\n]+',r'\1 [runtime-generated id omitted]',text)
    bad=[line.strip() for line in lines if re.search(r'\[(?:Scripting|Item|Json|Recipes|Particles)\]\s*\[(?:error|Error)\]|ERROR\]\s*\[(?:Scripting|Item|Json|Recipes|Particles)\]|INIT_FAILED|Unhandled promise|SyntaxError|ReferenceError',line)]
    version=re.search(r'Version:\s*([^\s]+)',text)
    return {'phase':phase,'exit_code':proc.returncode,'ready':ready,'server_version':version.group(1) if version else None,
            'result':result,'content_or_script_errors':bad,'passed':ready and result is not None and result.get('passed') and not bad and proc.returncode==0},text

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--server-dir',type=Path,required=True)
    parser.add_argument('--acknowledge-disposable-server',action='store_true')
    args=parser.parse_args();server=args.server_dir.resolve()
    if not args.acknowledge_disposable_server:
        parser.error('Use --acknowledge-disposable-server only for a disposable test runtime; server.properties is overwritten.')
    if not (server/'bedrock_server').is_file():parser.error('Official BDS executable not found')
    validation=validate()
    if not validation['passed']:raise SystemExit('Pack static validation must pass first.')
    world=server/'worlds'/WORLD
    marker=server/'.wolfverse-disposable-probe'
    if world.exists() and not marker.exists():raise SystemExit('Refusing unknown existing QA world without marker')
    if world.exists():shutil.rmtree(world)
    marker.write_text('Only WOLFVERSE QA world and staged wolfverse packs may be replaced here.\n')
    settings={'server-name':'WOLFVERSE isolated QA','level-name':WORLD,'level-seed':'2026','level-type':'FLAT',
              'gamemode':'survival','difficulty':'easy','allow-cheats':'true','online-mode':'true','allow-list':'true',
              'server-port':'19142','server-portv6':'19143','enable-lan-visibility':'false','max-players':'1',
              'view-distance':'4','tick-distance':'4','content-log-file-enabled':'true','content-log-console-output-enabled':'true',
              'texturepack-required':'true','emit-server-telemetry':'false','player-idle-timeout':'1'}
    (server/'server.properties').write_text(''.join(f'{k}={v}\n' for k,v in settings.items()))
    (server/'allowlist.json').write_text('[]\n')
    world.mkdir(parents=True)
    for pack,slug in [('behavior_pack','behavior_packs'),('resource_pack','resource_packs')]:
        staged=server/slug/'wolfverse_qa'
        if staged.exists():shutil.rmtree(staged)
        staged.mkdir(parents=True)
        for path in content_files(ROOT,pack):
            target=staged/path.relative_to(ROOT/pack);target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(path,target)
        manifest=json.loads((staged/'manifest.json').read_text())
        if pack=='behavior_pack':
            (staged/'scripts/qa_probe.js').write_text((ROOT/'tests/bds_probe.js').read_text())
            with (staged/'scripts/main.js').open('a') as f:f.write("\nimport './qa_probe.js';\n")
        (world/f'world_{slug}.json').write_text(json.dumps([{'pack_id':manifest['header']['uuid'],'version':manifest['header']['version']}])+'\n')
    reports=[];directory=ROOT/'test-results';directory.mkdir(exist_ok=True)
    for phase in (1,2):
        report,text=run_phase(server,phase)
        (directory/f'bds-phase-{phase}.log').write_text(text)
        reports.append(report);print(f"BDS phase {phase}: {'PASS' if report['passed'] else 'FAIL'}",flush=True)
        if not report['passed']:break
    binary_hash=hashlib.sha256((server/'bedrock_server').read_bytes()).hexdigest()
    result={'recorded_at_utc':datetime.now(timezone.utc).isoformat(),'official_runtime_binary_sha256':binary_hash,
            'all_passed':len(reports)==2 and all(r['passed'] for r in reports),'phases':reports,'pack_sha256':fingerprint(),
            'real_players_connected':0,'test_only_script_in_release':False,
            'limits':['actual engine with empty allow-list, not an authenticated client session','real Entity Dynamic Properties and Block Container, not Player rejoin storage','form construction is NOT native UI rendering','World Dynamic Property restart persistence, not crash durability','no client graphics/audio, Realm, multiplayer or FPS evidence']}
    (directory/'bds-verification.json').write_text(json.dumps(result,indent=2)+'\n')
    return 0 if result['all_passed'] else 1

if __name__=='__main__':raise SystemExit(main())
