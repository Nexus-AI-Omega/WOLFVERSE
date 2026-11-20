#!/usr/bin/env python3
"""Reproducible original Foundation icons and short synthesized UI sounds.
Requires Pillow, numpy and soundfile only for asset regeneration, not gameplay.
Does not import any Minecraft textures, models, voices or music.
"""
from pathlib import Path
import json, uuid, math
from PIL import Image, ImageDraw
import numpy as np
import soundfile as sf
ROOT=Path(__file__).resolve().parents[1]

def write_json(path,obj):
 path.parent.mkdir(parents=True,exist_ok=True);path.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')

def main():
 meta=ROOT/'project.json'
 if not meta.exists():
  write_json(meta,{'name':'WOLFVERSE','subtitle':'BEYOND MINECRAFT','developer':'Nexus-AI-Omega','version':[0,1,0],
   'min_engine_version':[1,21,90],'server_api':'2.0.0','server_ui_api':'2.0.0','preview_allowed_by_user':True,
   'core_requires_experiments':False,'ids':{k:str(uuid.uuid4()) for k in ['bp','bpm','script','rp','rpm']}})
 p=json.loads(meta.read_text());v=p['version'];ids=p['ids'];bp=ROOT/'behavior_pack';rp=ROOT/'resource_pack'
 def manifest(label,key,module_key,kind):
  return {'format_version':2,'header':{'name':'WOLFVERSE '+label+' · Foundation 0.1','description':'BEYOND MINECRAFT · Nexus-AI-Omega · Development build; device testing pending.','uuid':ids[key],'version':v,'min_engine_version':p['min_engine_version']},'modules':[{'type':kind,'uuid':ids[module_key],'version':v}]}
 b=manifest('BP','bp','bpm','data');r=manifest('RP','rp','rpm','resources')
 b['modules'].append({'type':'script','language':'javascript','uuid':ids['script'],'version':v,'entry':'scripts/main.js'})
 b['dependencies']=[{'uuid':ids['rp'],'version':v},{'module_name':'@minecraft/server','version':p['server_api']},{'module_name':'@minecraft/server-ui','version':p['server_ui_api']}]
 write_json(bp/'manifest.json',b);write_json(rp/'manifest.json',r)
 write_json(bp/'items/codex.json',{'format_version':'1.21.90','minecraft:item':{'description':{'identifier':'wolfverse:codex','menu_category':{'category':'items'}},'components':{'minecraft:display_name':{'value':'item.wolfverse:codex.name'},'minecraft:icon':'wolfverse_codex','minecraft:max_stack_size':1,'minecraft:hand_equipped':False,'minecraft:interact_button':'WOLFVERSE öffnen','minecraft:use_animation':'none','minecraft:use_modifiers':{'use_duration':0.1,'movement_modifier':1.0},'wolfverse:open_codex':{}}}})
 write_json(bp/'recipes/codex.json',{'format_version':'1.20.10','minecraft:recipe_shaped':{'description':{'identifier':'wolfverse:codex_recipe'},'tags':['crafting_table'],'unlock':[{'item':'minecraft:paper'}],'pattern':[' P ','PIP',' P '],'key':{'P':{'item':'minecraft:paper'},'I':{'item':'minecraft:iron_ingot'}},'result':{'item':'wolfverse:codex','count':1}}})
 write_json(rp/'textures/item_texture.json',{'resource_pack_name':'WOLFVERSE','texture_name':'atlas.items','texture_data':{'wolfverse_codex':{'textures':'textures/items/wolfverse/codex'}}})
 for locale,text in [('de_DE','WOLFVERSE-Codex'),('en_US','WOLFVERSE Codex')]:
  path=rp/'texts'/f'{locale}.lang';path.parent.mkdir(parents=True,exist_ok=True);path.write_text('item.wolfverse:codex.name='+text+'\n')
 dark='#0b151d';edge='#29424d';cyan='#6be3ee';green='#8de9b3';white='#e1eeeb'
 def icon(kind):
  im=Image.new('RGBA',(32,32),(0,0,0,0));d=ImageDraw.Draw(im)
  d.rounded_rectangle((1,1,30,30),radius=5,fill=dark,outline=edge,width=1)
  if kind=='wolf':
   d.polygon([(5,5),(13,10),(19,10),(27,5),(25,22),(16,28),(7,22)],fill='#31505a',outline=cyan)
   d.polygon([(8,11),(14,15),(12,19),(8,17)],fill=white);d.polygon([(24,11),(18,15),(20,19),(24,17)],fill=white)
   d.rectangle((10,15,12,16),fill=cyan);d.rectangle((20,15,22,16),fill=green)
   d.polygon([(12,21),(20,21),(16,25)],fill=dark);d.line((16,25,16,27),fill=green,width=1)
  elif kind=='codex':
   d.rounded_rectangle((7,5,25,27),2,fill='#17303d',outline=cyan,width=1);d.rectangle((5,5,8,27),fill='#6dca9d');d.line((11,10,13,21,16,15,20,21,22,10),fill=white,width=2);d.line((11,24,22,24),fill=green,width=1)
  elif kind=='profile':
   d.ellipse((11,6,21,16),fill=cyan);d.polygon([(7,26),(9,20),(16,18),(23,20),(25,26)],fill=green)
  elif kind=='quest':
   d.rectangle((8,5,24,27),fill='#28434c',outline=cyan);d.line((11,10,21,10),fill=white,width=2);d.line((11,15,19,15),fill=white,width=1);d.line((11,21,14,24,21,18),fill=green,width=2)
  elif kind=='shop':
   d.polygon([(12,5),(21,5),(19,10),(23,17),(24,24),(20,27),(11,27),(7,24),(8,17),(13,10)],fill='#254e4e',outline=green);d.ellipse((12,15,20,23),outline=cyan,width=2);d.line((11,10,21,10),fill=white,width=2)
  elif kind=='settings':
   for a in range(0,360,45):
    x=16+11*math.cos(math.radians(a));y=16+11*math.sin(math.radians(a));d.rectangle((round(x)-2,round(y)-2,round(x)+2,round(y)+2),fill=green)
   d.ellipse((7,7,25,25),fill=cyan);d.ellipse((12,12,20,20),fill=dark)
  return im
 for kind in ['profile','quest','shop','settings']:
  path=rp/'textures/ui/wolfverse'/f'{kind}.png';path.parent.mkdir(parents=True,exist_ok=True);icon(kind).save(path)
 path=rp/'textures/items/wolfverse/codex.png';path.parent.mkdir(parents=True,exist_ok=True);icon('codex').save(path)
 for pack in [bp,rp]:icon('wolf').resize((128,128),Image.Resampling.NEAREST).save(pack/'pack_icon.png')
 spark=Image.new('RGBA',(8,8));d=ImageDraw.Draw(spark);d.line((3,0,3,7),fill=(125,245,222,230));d.line((0,3,7,3),fill=(125,245,222,230));d.rectangle((2,2,4,4),fill=(220,255,248,255));path=rp/'textures/particle/wolfverse/spark.png';path.parent.mkdir(parents=True,exist_ok=True);spark.save(path)
 write_json(rp/'particles/level_up.json',{'format_version':'1.10.0','particle_effect':{'description':{'identifier':'wolfverse:level_up','basic_render_parameters':{'material':'particles_alpha','texture':'textures/particle/wolfverse/spark'}},'components':{'minecraft:emitter_rate_instant':{'num_particles':12},'minecraft:emitter_lifetime_once':{'active_time':0.1},'minecraft:emitter_shape_sphere':{'radius':0.4,'direction':'outwards'},'minecraft:particle_initial_speed':0.6,'minecraft:particle_motion_dynamic':{'linear_acceleration':[0,0.5,0]},'minecraft:particle_appearance_billboard':{'size':[0.06,0.06],'facing_camera_mode':'rotate_xyz','uv':{'texture_width':8,'texture_height':8,'uv':[0,0],'uv_size':[8,8]}},'minecraft:particle_lifetime_expression':{'max_lifetime':0.8}}}})
 sounds={};rate=22050
 for name,duration,notes in [('ui_open',0.085,[660,990]),('level_up',0.42,[523.25,659.25,783.99]),('quest_complete',0.30,[587.33,880])]:
  t=np.arange(int(rate*duration))/rate;audio=np.zeros_like(t)
  for index,f in enumerate(notes):
   start=duration*0.45*index/max(1,len(notes)-1);local=np.maximum(t-start,0);env=np.where(t>=start,np.minimum(local/0.008,1)*np.exp(-local/(duration*0.4)),0)
   audio+=np.sin(2*np.pi*f*local)*env
  peak=max(float(np.max(np.abs(audio))),1e-9);audio=(audio/peak*0.22).astype('float32')
  path=rp/'sounds/wolfverse'/f'{name}.ogg';path.parent.mkdir(parents=True,exist_ok=True);sf.write(path,audio,rate,format='OGG',subtype='VORBIS')
  sounds['wolfverse.'+name]={'category':'neutral','sounds':[{'name':'sounds/wolfverse/'+name,'is3D':False}]}
 write_json(rp/'sounds/sound_definitions.json',{'format_version':'1.14.0','sound_definitions':sounds})
 assets=ROOT/'assets';assets.mkdir(exist_ok=True)
 (assets/'brand.svg').write_text('''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="300" viewBox="0 0 1200 300"><rect width="1200" height="300" rx="20" fill="#0b151d"/><path d="M0 262H1200M0 38H1200" stroke="#29424d"/><path d="M55 62L130 105L205 62L191 205L130 249L69 205Z" fill="#17303d" stroke="#6be3ee" stroke-width="4"/><path d="M84 139L117 153M176 139L143 153" stroke="#8de9b3" stroke-width="8"/><path d="M112 194H148L130 214Z" fill="#e1eeeb"/><text x="260" y="136" font-family="sans-serif" font-weight="700" font-size="72" letter-spacing="7" fill="#e1eeeb">WOLFVERSE</text><text x="265" y="182" font-family="sans-serif" font-size="22" letter-spacing="8" fill="#6be3ee">BEYOND MINECRAFT</text><text x="265" y="237" font-family="sans-serif" font-size="16" fill="#8de9b3">CREATED BY NEXUS-AI-OMEGA</text></svg>''')
 write_json(ROOT/'research/original-assets.json',{'provenance':'Original procedural Foundation art and sound; no copied Minecraft/third-party media','generator':'tools/create_assets.py','model_assets_created':False,'in_game_screenshots_created':False,'sound_sample_rate':rate,'sound_peak_target':0.22})
 print('Original Foundation assets generated; pack UUIDs preserved in project.json.')

if __name__=='__main__':main()
