# Cold-press cotton paper grain for the closing letter (.letter-paper), seamless 512x512, colour-law safe
# (docs/DESIGN.md): light = wine (#5C000E) shadows + white highlights over the light paper;
# dark = black shadows + wine highlights over the dark paper (white alpha is not allowed on dark surfaces).
# Usage: python scripts/textures/letter-paper.py public/ornaments/letter-paper.webp
#        python scripts/textures/letter-paper.py public/ornaments/letter-paper-dark.webp dark
# (also writes a *-preview.png next to the output; do not commit it)
import sys, numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter
N=512; rng=np.random.default_rng(7)
def octave(sigma, w):
    h=gaussian_filter(rng.standard_normal((N,N)), sigma, mode='wrap')
    return w*h/h.std()
# medium bumps (cold-press tooth) + fine fibre grain
h = octave(1.9,1.0) + octave(1.1,0.6) + octave(0.7,0.2) + octave(4,0.35)  # soft: little sub-pixel grit
# pressed felt tooth: rounded bumps
h = np.tanh(h*0.7)
# light from top-left
gy, gx = np.gradient(h)
# wrap-correct gradients
gx = (np.roll(h,-1,1)-np.roll(h,1,1))/2; gy=(np.roll(h,-1,0)-np.roll(h,1,0))/2
shade = -(gx*0.7 + gy*0.7)   # >0 lit, <0 shadow
shade = shade/np.abs(shade).std()
# subtle large-scale mottling (cotton density)
mott = gaussian_filter(rng.standard_normal((N,N)), 24, mode='wrap'); mott/=mott.std()
out=np.zeros((N,N,4),np.uint8)
DARK = len(sys.argv) > 2 and sys.argv[2] == 'dark'
dark = 1.4 if DARK else 1.0
sh = np.clip(-shade,0,None); li=np.clip(shade,0,None)
a_sh = np.clip(sh*3.6*dark + np.clip(mott,0,None)*1.5, 0, 14)
a_li = np.clip(li*10, 0, 36)
mask = a_sh >= a_li*0.6
SH, LI = ((0,0,0),(92,0,14)) if DARK else ((92,0,14),(255,255,255))
for c in range(3): out[...,c]=np.where(mask,SH[c],LI[c])
out[...,3]=np.where(mask,a_sh,a_li).astype(np.uint8)
out[...,3]=(out[...,3]//2)*2
Image.fromarray(out,'RGBA').save(sys.argv[1],'WEBP',lossless=True,quality=100,method=6)
# preview over the light paper colour, 2x2 tiles
base=np.array([23,0,4] if DARK else [248,244,244],float)
im=out.astype(float); al=im[...,3:4]/255
comp=(im[...,:3]*al+base*(1-al)).astype(np.uint8)
Image.fromarray(np.tile(comp,(2,2,1))).save(sys.argv[1].replace('.webp','-preview.png'))
