"""Generates synthetic placeholder frames (no photos, no copyrighted material). Needs numpy + Pillow."""
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
rng = np.random.default_rng(7)
def scene(name, w, h, top, bot, glow, gx, gy, gr, fx, ground=.74):
    y = np.linspace(0, 1, h)[:, None, None]
    img = np.broadcast_to(np.array(top, float) * (1 - y) + np.array(bot, float) * y, (h, w, 3)).copy()
    X, Y = np.meshgrid(np.linspace(0, 1, w), np.linspace(0, 1, h))
    d = np.sqrt(((X - gx) * w / h) ** 2 + (Y - gy) ** 2)
    img += np.array(glow, float) * np.exp(-(d / gr) ** 2)[..., None]
    m = Image.new("L", (w, h), 0); dr = ImageDraw.Draw(m)
    dr.polygon([(0, h), (0, int(h * ground)), (w, int(h * (ground - .03))), (w, h)], fill=255)
    cx, fh, cy = int(w * fx), int(h * .22), int(h * ground)
    dr.ellipse([cx - fh // 9, cy - fh - fh // 5, cx + fh // 9, cy - fh + fh // 12], fill=255)
    dr.polygon([(cx - fh // 6, cy - fh + fh // 10), (cx + fh // 6, cy - fh + fh // 10), (cx + fh // 8, cy), (cx - fh // 8, cy)], fill=255)
    m = np.array(m.filter(ImageFilter.GaussianBlur(max(1, w // 900))), float)[..., None] / 255
    img = img * (1 - m) + 8 * m
    v = 1 - .55 * ((X - .5) ** 2 * 2 + (Y - .5) ** 2 * 2.4)[..., None]
    img = img * np.clip(v, .3, 1) + rng.normal(0, 7, (h, w, 1))
    Image.fromarray(np.clip(img, 0, 255).astype("uint8")).save(f"media/sample-images/{name}.jpg", quality=82, optimize=True, progressive=True)
L, WD, PT = (1920, 1080), (1920, 804), (1080, 1350)
S = [("s01",*WD,(18,22,38),(190,90,40),(255,140,40),.62,.7,.28,.35),("s02",*PT,(30,48,60),(120,150,150),(200,210,190),.5,.5,.3,.5),
("s03",*L,(6,10,22),(14,20,40),(60,130,200),.2,.4,.2,.7),("s04",*L,(60,20,40),(220,120,90),(255,190,120),.5,.62,.25,.75),
("s05",*PT,(20,30,44),(90,100,110),(230,200,150),.7,.3,.22,.3),("s06",*L,(20,14,10),(70,45,25),(255,170,70),.82,.4,.18,.3),
("s07",*WD,(35,15,8),(170,80,30),(255,120,30),.4,.55,.22,.62),("s08",*PT,(40,50,40),(150,140,90),(240,220,150),.35,.4,.3,.6),
("s09",*L,(10,18,26),(40,80,90),(120,220,200),.3,.5,.18,.78),("s10",*PT,(22,10,40),(120,50,90),(255,100,150),.5,.55,.26,.4),
("s11",*L,(24,24,26),(80,84,90),(200,205,215),.6,.35,.35,.5),("s12",*L,(30,10,10),(110,30,20),(255,80,50),.25,.6,.2,.68)]
for a in S: scene(*a)
scene("portrait", 800, 1000, (30,30,34), (110,100,90), (230,210,180), .5, .35, .3, .5)
