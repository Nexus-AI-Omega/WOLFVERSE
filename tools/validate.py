#!/usr/bin/env python3
"""Bounded project/pack checks. Not an official complete schema/runtime certification."""
from pathlib import Path
import argparse, hashlib, json, re, struct, uuid

ROOT = Path(__file__).resolve().parents[1]
PACKS = ('behavior_pack', 'resource_pack')
EXCLUDED = {'.DS_Store'}

def content_files(root, pack):
    base = root / pack
    if base.is_symlink():
        raise ValueError(f'Symlink not permitted: {pack}')
    for path in sorted(base.rglob('*')):
        if path.is_symlink():
            raise ValueError(f'Symlink not permitted: {path.relative_to(root)}')
        if path.is_file() and path.name not in EXCLUDED and not path.name.endswith('.d.ts'):
            yield path

def fingerprint(root=ROOT):
    result = {}
    for pack in PACKS:
        for path in content_files(root, pack):
            result[path.relative_to(root).as_posix()] = hashlib.sha256(path.read_bytes()).hexdigest()
    return result

def validate(root=ROOT):
    root = Path(root).resolve()
    errors, warnings, files, docs, textures = [], [], [], {}, []
    def check(condition, message):
        if not condition:
            errors.append(message)
    try:
        for pack in PACKS:
            check((root / pack / 'manifest.json').is_file(), f'{pack}: missing manifest')
            files.extend(content_files(root, pack))
    except ValueError as e:
        errors.append(str(e))
    for path in files:
        relative = path.relative_to(root).as_posix()
        check(path.suffix in {'.json', '.js', '.png', '.ogg', '.lang'}, f'{relative}: unapproved file type')
        if path.suffix == '.json':
            try:
                docs[relative] = json.loads(path.read_text(encoding='utf-8'))
            except (ValueError, UnicodeError) as e:
                errors.append(f'{relative}: invalid JSON: {e}')
        if path.suffix == '.png':
            data = path.read_bytes()
            if len(data) >= 24 and data[:8] == b'\x89PNG\r\n\x1a\n':
                width, height = struct.unpack('>II', data[16:24])
                check(0 < width <= 512 and 0 < height <= 512, f'{relative}: texture exceeds Foundation budget')
                textures.append({'path': relative, 'width': width, 'height': height, 'rgba_bytes_estimate': width*height*4})
            else:
                errors.append(f'{relative}: invalid PNG signature/header')
        if path.suffix == '.ogg':
            check(path.read_bytes().startswith(b'OggS'), f'{relative}: invalid Ogg signature')
        if path.suffix in {'.js', '.json', '.lang'}:
            text = path.read_text(encoding='utf-8')
            check(not re.search(r'(?:gh[pousr]_[A-Za-z0-9]{25,}|github_pat_[A-Za-z0-9_]{25,}|sk-[A-Za-z0-9]{30,}|AKIA[A-Z0-9]{16})', text), f'{relative}: possible secret')
        if path.suffix == '.js':
            check(not re.search(r'\b(?:eval|Function)\s*\(|https?://|@minecraft/server-net|@minecraft/server-admin', text), f'{relative}: forbidden network/dynamic code in Core')
            for dependency in re.findall(r"(?:import|export)\s+(?:[^;\"']*?\s+from\s+)?[\"']([^\"']+)[\"']", text):
                if dependency.startswith('.'):
                    target = (path.parent / dependency).resolve()
                    check(target.is_relative_to(root / 'behavior_pack' / 'scripts') and target.is_file(), f'{relative}: unresolved/unsafe import {dependency}')
                else:
                    check(dependency in {'@minecraft/server', '@minecraft/server-ui'}, f'{relative}: unsupported import {dependency}')
    bp = docs.get('behavior_pack/manifest.json', {})
    rp = docs.get('resource_pack/manifest.json', {})
    seen_uuids = set()
    for name, pack in [('BP', bp), ('RP', rp)]:
        check(pack.get('format_version') == 2, f'{name}: manifest v2 required')
        header = pack.get('header', {})
        check(header.get('min_engine_version') == [1,21,90], f'{name}: unexpected minimum engine')
        check(header.get('version') == [0,1,0], f'{name}: unexpected release version')
        for part in [header, *pack.get('modules', [])]:
            value = part.get('uuid')
            try:
                parsed = uuid.UUID(value)
                check(parsed.version == 4, f'{name}: UUID must be v4')
            except (ValueError, TypeError, AttributeError):
                errors.append(f'{name}: invalid UUID')
            check(value not in seen_uuids, f'{name}: duplicate UUID')
            seen_uuids.add(value)
    deps = bp.get('dependencies', [])
    bound = {x.get('module_name'): x.get('version') for x in deps if 'module_name' in x}
    check(bound == {'@minecraft/server':'2.0.0','@minecraft/server-ui':'2.0.0'}, 'BP: exact supported API bindings required')
    check(any(x.get('uuid') == rp.get('header', {}).get('uuid') and x.get('version') == [0,1,0] for x in deps), 'BP: RP dependency missing')
    check(any(m.get('entry') == 'scripts/main.js' and m.get('type') == 'script' and m.get('language') == 'javascript' for m in bp.get('modules', [])), 'BP: script entry missing')
    item = docs.get('behavior_pack/items/codex.json', {}).get('minecraft:item', {})
    components = item.get('components', {})
    check(item.get('description', {}).get('identifier') == 'wolfverse:codex', 'Codex identifier missing')
    check('wolfverse:open_codex' in components and components.get('minecraft:max_stack_size') == 1, 'Codex component/stack size mismatch')
    script = root/'behavior_pack/scripts/main.js'
    check(script.is_file() and "registerCustomComponent('wolfverse:open_codex'" in script.read_text(encoding='utf-8'), 'Codex registration missing')
    texture_map = docs.get('resource_pack/textures/item_texture.json', {}).get('texture_data', {})
    check(components.get('minecraft:icon') in texture_map, 'Codex atlas reference missing')
    def texture_exists(stem):
        return isinstance(stem, str) and (root/'resource_pack'/f'{stem}.png').is_file()
    for value in texture_map.values():
        check(texture_exists(value.get('textures')), 'Item atlas texture missing')
    for path, doc in docs.items():
        if path.startswith('behavior_pack/') and path.endswith('.json'):
            for key in ['minecraft:entity','minecraft:item','minecraft:recipe_shaped']:
                identifier = doc.get(key, {}).get('description', {}).get('identifier')
                if identifier:
                    check(identifier.startswith('wolfverse:'), f'{path}: overriding external namespace')
        if 'particle_effect' in doc:
            definition = doc['particle_effect']['description']
            check(definition['identifier'].startswith('wolfverse:'), f'{path}: wrong particle namespace')
            check(texture_exists(definition['basic_render_parameters']['texture']), f'{path}: missing particle texture')
    sound_defs = docs.get('resource_pack/sounds/sound_definitions.json', {}).get('sound_definitions', {})
    for name, value in sound_defs.items():
        check(name.startswith('wolfverse.'), f'Sound namespace: {name}')
        for sound in value.get('sounds', []):
            stem = sound if isinstance(sound,str) else sound.get('name', '')
            check((root/'resource_pack'/f'{stem}.ogg').is_file(), f'Sound file missing: {stem}')
    for name in ['ui_open', 'quest_complete', 'level_up']:
        check(f'wolfverse.{name}' in sound_defs, f'Missing effect sound: {name}')
    for name in ['profile','quest','shop','settings']:
        check(texture_exists(f'textures/ui/wolfverse/{name}'), f'Missing UI icon {name}')
    for language in ['de_DE','en_US']:
        path = root/'resource_pack/texts'/f'{language}.lang'
        check(path.is_file() and 'item.wolfverse:codex.name=' in path.read_text(encoding='utf-8'), f'Missing localization {language}')
    warnings.append('Project-specific static checks, not exhaustive official schema validation or device certification.')
    try:
        hashes = fingerprint(root)
    except ValueError:
        hashes = {}
    return {'passed':not errors,'errors':errors,'warnings':warnings,'files':len(files),'pack_sha256':hashes,
            'texture_count':len(textures),'texture_rgba_bytes_estimate':sum(t['rgba_bytes_estimate'] for t in textures),'textures':textures}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root',type=Path,default=ROOT)
    parser.add_argument('--report',type=Path)
    args=parser.parse_args()
    result=validate(args.root)
    if args.report:
        args.report.parent.mkdir(parents=True,exist_ok=True)
        args.report.write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps({k:v for k,v in result.items() if k not in {'pack_sha256','textures'}},indent=2))
    return 0 if result['passed'] else 1

if __name__=='__main__':
    raise SystemExit(main())
