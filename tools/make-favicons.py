#!/usr/bin/env python3
"""Regenerates every favicon from the ORIGINAL artwork (assets/favicon-source.png, never modified).
Each icon = solid #4A5254 square, full-bleed, with the logo centred at ~66% (17% margin per side, inside the maskable safe zone).
Usage (from the site root):  python3 tools/make-favicons.py      (needs Pillow)"""
from PIL import Image
BG=(0x4A,0x52,0x54,255); MARGIN=0.17
src=Image.open('assets/favicon-source.png').convert('RGBA')
logo=src.crop(src.getchannel('A').point(lambda a:255 if a>8 else 0).getbbox())      # tight crop of the artwork (aspect ratio kept)
def icon(size):
    big=size*4 if size<64 else size                                                 # supersample the tiny ones, then reduce
    inner=big*(1-2*MARGIN); k=min(inner/logo.width,inner/logo.height)
    lg=logo.resize((max(1,round(logo.width*k)),max(1,round(logo.height*k))),Image.LANCZOS)
    c=Image.new('RGBA',(big,big),BG); c.alpha_composite(lg,((big-lg.width)//2,(big-lg.height)//2))
    return c.resize((size,size),Image.LANCZOS) if big!=size else c
for size,name in ((16,'favicon-16x16.png'),(32,'favicon-32x32.png'),(180,'apple-touch-icon.png'),(192,'favicon-192x192.png'),(512,'favicon-512x512.png')):
    icon(size).convert('RGB').save(name,optimize=True)
icon(256).save('favicon.ico',sizes=[(16,16),(32,32),(48,48)])
print('done')
