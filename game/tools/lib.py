import random, math
def R(seed): return random.Random(seed)
DEFS='''<defs>
<linearGradient id="mH" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f7f9"/><stop offset=".35" stop-color="#b9c3cb"/><stop offset=".7" stop-color="#7c8892"/><stop offset="1" stop-color="#c9d1d8"/></linearGradient>
<linearGradient id="mV" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6c7882"/><stop offset=".3" stop-color="#f1f5f8"/><stop offset=".6" stop-color="#aab4bd"/><stop offset="1" stop-color="#5d6973"/></linearGradient>
<linearGradient id="brass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6dc8e"/><stop offset=".5" stop-color="#c79a3b"/><stop offset="1" stop-color="#8a6420"/></linearGradient>
<radialGradient id="gold" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff2bd"/><stop offset=".55" stop-color="#d8b04a"/><stop offset="1" stop-color="#8a6a1c"/></radialGradient>
<linearGradient id="mask" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#25a06a"/><stop offset=".5" stop-color="#17744c"/><stop offset="1" stop-color="#0f5236"/></linearGradient>
<linearGradient id="blk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4b5258"/><stop offset=".15" stop-color="#2a2f33"/><stop offset="1" stop-color="#101315"/></linearGradient>
<linearGradient id="yel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd84a"/><stop offset="1" stop-color="#d49a0c"/></linearGradient>
<linearGradient id="red" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff6a5c"/><stop offset="1" stop-color="#a81f18"/></linearGradient>
<linearGradient id="blu" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#16346e"/><stop offset=".35" stop-color="#4f7fd6"/><stop offset="1" stop-color="#14285a"/></linearGradient>
<radialGradient id="lens" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#ffffff" stop-opacity=".55"/><stop offset=".5" stop-color="#bfe3f2" stop-opacity=".12"/><stop offset="1" stop-color="#7ab0c8" stop-opacity=".25"/></radialGradient>
<radialGradient id="glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe2a0" stop-opacity=".75"/><stop offset="1" stop-color="#ffb84a" stop-opacity="0"/></radialGradient>
<radialGradient id="vig" cx=".5" cy=".45" r=".75"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".62"/></radialGradient>
<radialGradient id="cap" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#e9eef2"/><stop offset=".6" stop-color="#a5b0b9"/><stop offset="1" stop-color="#6b7782"/></radialGradient>
<filter id="sh" x="-30%" y="-30%" width="170%" height="180%"><feGaussianBlur stdDeviation="4"/></filter>
<filter id="sh2" x="-30%" y="-30%" width="170%" height="180%"><feGaussianBlur stdDeviation="9"/></filter>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".006 .22" numOctaves="4" seed="7"/><feColorMatrix values="0 0 0 0 .1  0 0 0 0 .05  0 0 0 0 .02  0 0 0 -2.2 1.25"/></filter>
<filter id="grain2" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.4 .75"/></filter>
<filter id="rough" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="3" seed="11"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 .95"/></filter>
<pattern id="peg" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="11" cy="11" r="3.1" fill="#1a1109"/><circle cx="11" cy="12" r="3.1" fill="none" stroke="#ffffff22"/></pattern>
</defs>'''
def svg(w,h,body,extra=''):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" font-family="Arial,Helvetica,sans-serif">{DEFS}{extra}{body}</svg>'
def g(x,y,rot=0,s=1,inner=''):
    return f'<g transform="translate({x} {y}) rotate({rot}) scale({s})">{inner}</g>'
def shadow(x,y,rx,ry,op=.45,rot=0): return f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="#000" opacity="{op}" filter="url(#sh)" transform="rotate({rot} {x} {y})"/>'
def wood(w,h,base='#6b4328',seed=1):
    r=R(seed);s=f'<rect width="{w}" height="{h}" fill="{base}"/><rect width="{w}" height="{h}" filter="url(#grain)" opacity="1"/>'
    pw=h/ max(1,round(h/150));y=pw
    s+=f'<rect width="{w}" height="{h}" fill="url(#vig)" opacity=".0"/>'
    i=0
    while y<h-2:
        s+=f'<rect x="0" y="{y-1}" width="{w}" height="2.2" fill="#1a0f07" opacity=".7"/><rect x="0" y="{y+1}" width="{w}" height="1.2" fill="#fff" opacity=".08"/>'
        x=r.uniform(60,w-60)
        s+=f'<rect x="{x}" y="{y-pw}" width="2" height="{pw}" fill="#1a0f07" opacity=".55"/>'
        y+=pw;i+=1
    return s
def mat(x,y,w,h,r=26):
    return (f'<rect x="{x+4}" y="{y+14}" width="{w}" height="{h}" rx="{r}" fill="#000" opacity=".55" filter="url(#sh2)"/>'
    f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="#1f2a28"/>'
    f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" filter="url(#grain2)" opacity=".5"/>'
    f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="none" stroke="#3b4a46" stroke-width="3"/>'
    f'<rect x="{x+9}" y="{y+9}" width="{w-18}" height="{h-18}" rx="{r-8}" fill="none" stroke="#8fb5a8" stroke-opacity=".35" stroke-width="1.6" stroke-dasharray="7 5"/>')
def pegboard(w,h):
    return f'<rect width="{w}" height="{h}" fill="#7a5a3a"/><rect width="{w}" height="{h}" filter="url(#rough)" opacity=".35"/><rect width="{w}" height="{h}" fill="url(#peg)"/>'
def lamp(cx,cy,r): return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="url(#glow)"/>'
def vig(w,h,o=1): return f'<rect width="{w}" height="{h}" fill="url(#vig)" opacity="{o}"/>'
def lead(x1,y1,x2,y2,w=3): return f'<path d="M{x1} {y1}L{x2} {y2}" stroke="#7d8892" stroke-width="{w}" stroke-linecap="round"/><path d="M{x1} {y1-.8}L{x2} {y2-.8}" stroke="#e7edf1" stroke-width="{w/3}" stroke-linecap="round" opacity=".8"/>'
BANDS={0:'#111',1:'#7a3b12',2:'#d12a22',3:'#f08a1c',4:'#f2d21a',5:'#2c9a3a',6:'#2a5fd1',7:'#8a3fd0',8:'#8c8c8c',9:'#f4f4f4','g':'#d9b44a','s':'#c0c6cc'}
def resistor(x,y,rot=0,b=(1,0,2),s=1,sh=True,bl=44):
    bd=''.join(f'<rect x="{-14+i*10 }" y="-8.4" width="5" height="16.8" fill="{BANDS[k]}"/>' for i,k in enumerate(list(b)+['g']))
    return g(x,y,rot,s,(shadow(3,9,bl*.7,5,.4) if sh else '')+lead(-bl,0,bl,0,3)+
     '<path d="M-22 -7 Q-26 -11 -17 -10 H17 Q26 -11 22 -7 V7 Q26 11 17 10 H-17 Q-26 11 -22 7Z" fill="#d9c08d"/>'
     '<path d="M-22 -7 Q-26 -11 -17 -10 H17 Q26 -11 22 -7 V-2 H-22Z" fill="#fff" opacity=".35"/>'
     +f'<g clip-path="inset(0)">{bd}</g><path d="M-22 7 Q-26 11 -17 10 H17 Q26 11 22 7 V3 H-22Z" fill="#000" opacity=".22"/>')
def ecap(x,y,r=22,col='#1d3f8f',lab='470µF 16V',rot=0,bulge=False,leak=False):
    st=''.join(f'<path d="M0 0L{r*.82*math.cos(a):.1f} {r*.82*math.sin(a):.1f}" stroke="#7d8892" stroke-width="1"/>' for a in (math.pi/2,math.pi/2+2.09,math.pi/2+4.19))
    lk='<path d="M-8 6 Q0 20 12 12 Q18 4 8 -2Z" fill="#6b4a1e" opacity=".85"/>' if leak else ''
    return g(x,y,rot,1,shadow(5,r*.45,r*1.1,r*.5,.45)+f'<circle r="{r}" fill="{col}"/><path d="M{-r} 0A{r} {r} 0 0 1 {r} 0" fill="#000" opacity=".22"/>'
      f'<path d="M{-r*.9} 0A{r*.9} {r*.9} 0 0 1 {-r*.2} {-r*.88}L{-r*.55} {-r*.55}" fill="#fff" opacity=".18"/>'
      f'<rect x="{-r}" y="{-r}" width="{r*.34}" height="{2*r}" fill="#dfe5ea" opacity=".85" clip-path="circle({r}px at {r}px {r}px)"/>'
      f'<circle r="{r*.8}" fill="url(#cap)"/>{st}<circle r="{r*.8}" fill="none" stroke="#fff" stroke-opacity=".5"/>'+lk+
      f'<text y="{r*1.55}" font-size="{r*.38}" fill="#fff" opacity="0" text-anchor="middle">{lab}</text>'+
      (f'<ellipse cx="0" cy="-2" rx="{r*.55}" ry="{r*.3}" fill="#8b7a3a" opacity=".5"/>' if bulge else ''))
def cer(x,y,col='#e8962a',lab='104',s=1):
    return g(x,y,0,s,shadow(3,7,13,5,.4)+lead(-5,10,-6,28,2.4)+lead(5,10,6,28,2.4)+f'<ellipse rx="13" ry="14" fill="{col}"/><ellipse cx="-4" cy="-5" rx="6" ry="4.5" fill="#fff" opacity=".4"/><text y="4" font-size="8" fill="#5a2e00" text-anchor="middle" font-weight="700">{lab}</text>')
def led(x,y,col='#ff3b30',on=False,s=1):
    return g(x,y,0,s,(f'<circle r="26" fill="{col}" opacity=".35" filter="url(#sh)"/>' if on else '')+shadow(3,9,11,5,.4)+lead(-4,8,-4,30,2.4)+lead(4,8,4,26,2.4)+f'<path d="M-10 8V-4A10 10 0 0 1 10 -4V8Z" fill="{col}"/><path d="M-10 8V-4A10 10 0 0 1 10 -4V8Z" fill="#fff" opacity=".18"/><ellipse cx="-4" cy="-6" rx="3" ry="5" fill="#fff" opacity=".6"/><rect x="-12" y="7" width="24" height="3" rx="1" fill="{col}" opacity=".8"/>')
def qfp(x,y,w=70,h=70,lab='ATMEGA328P',rot=0,pins=8):
    p=''
    for i in range(pins):
        t=(i+.5)*w/pins
        p+=f'<rect x="{t-1.6-w/2}" y="{-h/2-9}" width="3.2" height="10" fill="url(#mH)"/><rect x="{t-1.6-w/2}" y="{h/2-1}" width="3.2" height="10" fill="url(#mH)"/>'
        t=(i+.5)*h/pins
        p+=f'<rect x="{-w/2-9}" y="{t-1.6-h/2}" width="10" height="3.2" fill="url(#mH)"/><rect x="{w/2-1}" y="{t-1.6-h/2}" width="10" height="3.2" fill="url(#mH)"/>'
    return g(x,y,rot,1,shadow(6,10,w*.62,h*.5,.5)+p+f'<rect x="{-w/2}" y="{-h/2}" width="{w}" height="{h}" rx="3" fill="url(#blk)"/><rect x="{-w/2+1}" y="{-h/2+1}" width="{w-2}" height="{h-2}" rx="3" fill="none" stroke="#fff" stroke-opacity=".12"/><circle cx="{-w/2+9}" cy="{-h/2+9}" r="3" fill="#080a0b"/><text y="3" font-size="{max(6,w/9)}" fill="#c9d0d6" text-anchor="middle" font-weight="700" opacity=".9">{lab}</text><text y="{max(6,w/9)+7}" font-size="{max(4,w/14)}" fill="#8a949c" text-anchor="middle">2231  PU</text>')
def dip(x,y,n=8,lab='NE555P',rot=0,s=1):
    w=n*5+4;p=''.join(f'<rect x="{-w/2+4+i*10-1.5}" y="-14" width="3" height="28" fill="url(#mH)"/>' for i in range(n//2))
    return g(x,y,rot,s,shadow(4,9,w*.6,10,.5)+p+f'<rect x="{-w/2}" y="-9" width="{w}" height="18" rx="2" fill="url(#blk)"/><circle cx="{-w/2+5}" cy="0" r="2.4" fill="#060708"/><text x="2" y="3" font-size="7" fill="#c9d0d6" text-anchor="middle" font-weight="700">{lab}</text>')
def to220(x,y,rot=0,lab='7805',s=1):
    return g(x,y,rot,s,shadow(4,12,24,8,.5)+''.join(lead(i,18,i,40,2.6) for i in(-10,0,10))+'<rect x="-22" y="-30" width="44" height="14" rx="2" fill="url(#mH)"/><circle cx="0" cy="-23" r="4.4" fill="#2a2f33"/><rect x="-22" y="-17" width="44" height="36" rx="2" fill="url(#blk)"/>'+f'<text y="5" font-size="9" fill="#d0d6db" text-anchor="middle" font-weight="700">{lab}</text><text y="14" font-size="5.5" fill="#8a949c" text-anchor="middle">L78 ST</text>')
def diode(x,y,rot=0,s=1):
    return g(x,y,rot,s,shadow(3,8,24,4,.4)+lead(-40,0,40,0,2.6)+'<rect x="-18" y="-7" width="36" height="14" rx="5" fill="url(#blk)"/><rect x="9" y="-7" width="5" height="14" fill="#d7dce0"/><rect x="-18" y="-7" width="36" height="5" rx="3" fill="#fff" opacity=".12"/>')
def fuse(x,y,rot=0,blown=False,s=1):
    return g(x,y,rot,s,shadow(3,9,30,5,.4)+'<rect x="-30" y="-8" width="9" height="16" rx="2" fill="url(#brass)"/><rect x="21" y="-8" width="9" height="16" rx="2" fill="url(#brass)"/>'+f'<rect x="-21" y="-7" width="42" height="14" fill="{"#3a322b" if blown else "#e9f1f4"}" opacity=".85"/><rect x="-21" y="-7" width="42" height="4" fill="#fff" opacity=".5"/>'+('<path d="M-21 0H-6M6 0H21" stroke="#2a2a2a" stroke-width="1.2"/><path d="M-6 0 L-3 -4 0 3 3 -3 6 0" stroke="#000" opacity=".4" fill="none"/>' if blown else '<path d="M-21 0Q0 -4 21 0" stroke="#8a8f94" stroke-width="1.2" fill="none"/>'))
def batt(x,y,rot=0,s=1,lab='18650'):
    return g(x,y,rot,s,shadow(4,10,48,6,.45)+'<rect x="-46" y="-12" width="92" height="24" rx="12" fill="#1f7a3a"/><rect x="-46" y="-12" width="92" height="9" rx="6" fill="#fff" opacity=".2"/><rect x="-46" y="-12" width="30" height="24" rx="12" fill="url(#mH)"/><rect x="32" y="-6" width="16" height="12" rx="3" fill="url(#mH)"/>'+f'<text x="4" y="4" font-size="9" fill="#fff" font-weight="700" text-anchor="middle">{lab}</text>')
def hdr(x,y,n=4,rot=0):
    return g(x,y,rot,1,shadow(3,6,n*6,5,.4)+f'<rect x="{-n*5}" y="-5" width="{n*10}" height="10" fill="#1c1f22"/>'+''.join(f'<rect x="{-n*5+i*10+3.5}" y="-1.5" width="3" height="3" fill="url(#gold)"/>' for i in range(n)))
def usbc(x,y,rot=0):
    return g(x,y,rot,1,shadow(3,6,20,6,.5)+'<rect x="-18" y="-8" width="36" height="16" rx="8" fill="url(#mH)"/><rect x="-14" y="-4" width="28" height="8" rx="4" fill="#15191c"/><rect x="-11" y="-1" width="22" height="2" fill="url(#gold)"/>')
def xtal(x,y,rot=0): return g(x,y,rot,1,shadow(3,5,16,5,.4)+'<rect x="-14" y="-6" width="28" height="12" rx="6" fill="url(#mH)"/><text y="3" font-size="6.5" fill="#222" text-anchor="middle">16.000</text>')
def smd(x,y,rot=0,col='#2a2a2a',w=8,h=4.4): return g(x,y,rot,1,f'<rect x="{-w/2-1.6}" y="{-h/2}" width="3" height="{h}" fill="#c9ced2"/><rect x="{w/2-1.4}" y="{-h/2}" width="3" height="{h}" fill="#c9ced2"/><rect x="{-w/2}" y="{-h/2}" width="{w}" height="{h}" fill="{col}"/>')
def pcb(x,y,w,h,seed=1,rot=0,silk='MAIN-BOARD REV C',parts='',holes=4,dens=26):
    r=R(seed);t='';hl=''
    for i in range(dens):
        px,py=r.uniform(24,w-24),r.uniform(24,h-24);pts=[(px,py)]
        for k in range(r.randint(2,4)):
            ox,oy=pts[-1];d=r.choice([(1,0),(0,1),(1,1),(1,-1),(-1,0),(0,-1)]);L=r.uniform(18,70)
            pts.append((min(w-12,max(12,ox+d[0]*L)),min(h-12,max(12,oy+d[1]*L))))
        ps=' '.join(f'{a:.0f},{b:.0f}' for a,b in pts)
        t+=f'<polyline points="{ps}" fill="none" stroke="#0c4a31" stroke-width="5.4" stroke-linejoin="round" stroke-linecap="round" opacity=".9"/><polyline points="{ps}" fill="none" stroke="#3cc287" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round" opacity=".55"/><polyline points="{ps}" fill="none" stroke="#b6f0d0" stroke-width=".8" stroke-linejoin="round" opacity=".4"/>'
        for (a,b) in (pts[0],pts[-1]): t+=f'<circle cx="{a:.0f}" cy="{b:.0f}" r="4.2" fill="url(#gold)"/><circle cx="{a:.0f}" cy="{b:.0f}" r="1.5" fill="#103522"/>'
    corners=[(14,14),(w-14,14),(14,h-14),(w-14,h-14)][:holes]
    for a,b in corners: hl+=f'<circle cx="{a}" cy="{b}" r="8" fill="url(#gold)"/><circle cx="{a}" cy="{b}" r="4.4" fill="#0a0d0e"/>'
    sk=f'<rect x="10" y="{h-26}" width="{len(silk)*6+10}" height="14" fill="none" stroke="#e8f6ee" stroke-opacity=".75"/><text x="15" y="{h-15.5}" font-size="9" fill="#e8f6ee" opacity=".85" font-family="monospace">{silk}</text>'
    return g(x,y,rot,1,f'<rect x="5" y="14" width="{w}" height="{h}" rx="12" fill="#000" opacity=".5" filter="url(#sh)"/><rect width="{w}" height="{h}" rx="12" fill="#07261a"/><rect x="2" y="2" width="{w-4}" height="{h-4}" rx="11" fill="url(#mask)"/><rect x="2" y="2" width="{w-4}" height="{h-4}" rx="11" filter="url(#grain2)" opacity=".28"/>'+t+hl+sk+parts+f'<rect x="2" y="2" width="{w-4}" height="{h-4}" rx="11" fill="none" stroke="#ffffff" stroke-opacity=".22" stroke-width="1.2"/>')
def dmm(x,y,rot=0,s=1,txt='0.00',jack=True):
    return g(x,y,rot,s,shadow(8,16,92,150,.5)+'<rect x="-84" y="-150" width="168" height="300" rx="26" fill="url(#yel)"/><rect x="-84" y="-150" width="168" height="300" rx="26" fill="#fff" opacity=".1"/><rect x="-72" y="-138" width="144" height="276" rx="19" fill="#26292c"/><rect x="-60" y="-126" width="120" height="66" rx="6" fill="#b8cfa2"/><rect x="-60" y="-126" width="120" height="66" rx="6" fill="#fff" opacity=".12"/>'
      f'<text x="52" y="-80" font-size="34" font-family="monospace" fill="#233322" text-anchor="end">{txt}</text><text x="-54" y="-112" font-size="9" fill="#233322" font-family="monospace">DC  AUTO</text>'
      '<circle cx="0" cy="12" r="54" fill="#1a1d20"/><circle cx="0" cy="12" r="46" fill="url(#mV)"/><circle cx="0" cy="12" r="34" fill="#2a2e33"/><path d="M0 -18V8" stroke="#fff" stroke-width="5" stroke-linecap="round"/>'
      +''.join(f'<text x="{62*math.cos(math.radians(a)):.0f}" y="{12+62*math.sin(math.radians(a)):.0f}" font-size="9" fill="#e8edf0" text-anchor="middle" font-weight="700">{l}</text>' for a,l in ((-150,'V~'),(-110,'V⎓'),(-70,'Ω'),(-30,'•))'),(10,'A'),(50,'hFE')))
      +'<rect x="-60" y="82" width="120" height="44" rx="8" fill="#17191b"/>'+''.join(f'<circle cx="{cx}" cy="108" r="11" fill="#08090a"/><circle cx="{cx}" cy="108" r="6" fill="{c}"/>' for cx,c in((-38,'#555'),(0,'#d33'),(38,'#555'))))
def scope(x,y,rot=0,s=1,trace=True):
    tr=''.join(f'<path d="M-96 {sy}H96M{sx} -70V70" stroke="#2c5a3f" stroke-width=".7"/>' for sy in range(-60,70,30) for sx in [0]) +''.join(f'<path d="M{sx} -70V70" stroke="#2c5a3f" stroke-width=".7"/>' for sx in range(-80,100,32))
    wv=' '.join(f'{-96+i*4},{ -30*math.sin(i*.4)+5:.1f}' for i in range(49)) if trace else ''
    return g(x,y,rot,s,shadow(10,16,190,110,.5)+'<rect x="-190" y="-110" width="380" height="220" rx="16" fill="#9aa5ae"/><rect x="-190" y="-110" width="380" height="220" rx="16" fill="url(#mH)" opacity=".5"/><rect x="-184" y="-104" width="368" height="208" rx="12" fill="#323a41"/>'
     '<rect x="-170" y="-90" width="212" height="150" rx="8" fill="#0b1510"/><rect x="-160" y="-80" width="192" height="130" rx="4" fill="#07120c"/><g transform="translate(-64 -15) scale(.95 .9)">'+tr+f'<polyline points="{wv}" fill="none" stroke="#5dff9b" stroke-width="2.4" filter="url(#sh)" opacity=".7"/><polyline points="{wv}" fill="none" stroke="#c9ffe0" stroke-width="1.4"/></g>'
     '<rect x="-160" y="-80" width="192" height="130" rx="4" fill="url(#lens)" opacity=".6"/>'
     +''.join(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#15181b"/><circle cx="{cx}" cy="{cy}" r="{r-3}" fill="url(#mV)"/><path d="M{cx} {cy-r+4}V{cy}" stroke="#222" stroke-width="2.4"/>' for cx,cy,r in((92,-62,19),(142,-62,19),(92,-12,15),(142,-12,15)))
     +''.join(f'<circle cx="{-140+i*54}" cy="86" r="11" fill="url(#mV)" stroke="#111" stroke-width="3"/>' for i in range(4))+''.join(f'<rect x="{80+i*28}" y="30" width="20" height="11" rx="2" fill="#1d2226"/>' for i in range(3)))
def iron(x,y,rot=0,s=1,hot=True):
    return g(x,y,rot,s,shadow(6,10,150,12,.45)+'<rect x="-150" y="-12" width="150" height="24" rx="12" fill="#2c3136"/><rect x="-150" y="-12" width="150" height="8" rx="4" fill="#fff" opacity=".13"/><rect x="-136" y="-12" width="90" height="24" fill="#d9531e"/><rect x="-136" y="-12" width="90" height="8" fill="#fff" opacity=".22"/>'
       +''.join(f'<path d="M{-130+i*12} -12V12" stroke="#000" opacity=".25"/>' for i in range(8))+'<rect x="0" y="-9" width="42" height="18" fill="url(#mH)"/><path d="M42 -7L96 -2V2L42 7Z" fill="url(#mH)"/><path d="M96 -2L112 0L96 2Z" fill="#c9a24a"/>'
       +(f'<circle cx="112" cy="0" r="16" fill="#ff8a1a" opacity=".5" filter="url(#sh)"/><circle cx="110" cy="0" r="3" fill="#ffd9a0"/>' if hot else '')+'<path d="M-150 0Q-200 20 -230 -4" stroke="#1d2125" stroke-width="5" fill="none"/>')
def tweezer(x,y,rot=0,s=1):
    return g(x,y,rot,s,shadow(6,10,130,5,.4)+'<path d="M-120 -9L120 -1L120 1L-120 9Z" fill="url(#mH)"/><path d="M-120 -9L-30 -5L-30 5L-120 9Z" fill="#2a2f35"/><path d="M-120 -9L120 -1" stroke="#fff" opacity=".7"/><path d="M120 -1L132 -.4V.4L120 1Z" fill="#cfd6dc"/>')
def driver(x,y,rot=0,s=1,col='#d0342c'):
    return g(x,y,rot,s,shadow(6,10,130,9,.45)+f'<rect x="-120" y="-13" width="86" height="26" rx="13" fill="{col}"/><rect x="-120" y="-13" width="86" height="9" rx="5" fill="#fff" opacity=".3"/><rect x="-70" y="-13" width="20" height="26" fill="#1b1d20"/><rect x="-34" y="-5" width="104" height="10" fill="url(#mH)"/><path d="M70 -5L100 -3V3L70 5Z" fill="url(#mH)"/>'+''.join(f'<rect x="{-112+i*11}" y="-13" width="4" height="26" fill="#000" opacity=".18"/>' for i in range(5)))
def spool(x,y,s=1): return g(x,y,0,s,shadow(5,10,50,50,.4)+'<circle r="46" fill="#9aa3ab"/><circle r="46" fill="url(#mH)" opacity=".6"/><circle r="36" fill="#d4d8dc"/><circle r="12" fill="#2b2f33"/>'+''.join(f'<circle r="{r}" fill="none" stroke="#b5bcc3" stroke-width="3"/>' for r in(18,23,28,33))+'<path d="M46 -4Q80 0 96 16" stroke="#cfd5da" stroke-width="3" fill="none"/>')
def lensp(x,y,r=70,s=1): return g(x,y,0,s,shadow(8,r*.8,r*1.1,r*.5,.35)+f'<circle r="{r+5}" fill="none" stroke="#1d2023" stroke-width="12"/><circle r="{r+5}" fill="none" stroke="url(#mH)" stroke-width="12" opacity=".4"/><circle r="{r}" fill="#9fcde0" opacity=".12"/><circle r="{r}" fill="url(#lens)"/><path d="M{-r*.6} {-r*.4}A{r*.8} {r*.8} 0 0 1 {-r*.1} {-r*.78}" stroke="#fff" stroke-width="5" opacity=".7" fill="none" stroke-linecap="round"/>')
def phone(x,y,rot=0,s=1,open_=False):
    return g(x,y,rot,s,shadow(8,14,60,115,.5)+'<rect x="-58" y="-112" width="116" height="224" rx="20" fill="#1a1d21"/><rect x="-58" y="-112" width="116" height="224" rx="20" fill="url(#mV)" opacity=".25"/><rect x="-52" y="-106" width="104" height="212" rx="15" fill="'+('#2a3037' if open_ else '#0e1318')+'"/>'+(
       '<rect x="-44" y="-92" width="88" height="130" rx="8" fill="url(#mask)"/><rect x="-30" y="-80" width="30" height="30" rx="3" fill="url(#blk)"/><rect x="6" y="-78" width="28" height="22" rx="2" fill="url(#mH)"/><circle cx="-24" cy="-30" r="6" fill="url(#gold)"/>'
       '<rect x="-44" y="46" width="88" height="48" rx="8" fill="#1f7a3a"/><text y="75" font-size="9" fill="#fff" text-anchor="middle" font-weight="700">LI-ION 3.85V</text>' if open_ else
       '<rect x="-46" y="-98" width="92" height="196" rx="11" fill="#12202d"/><path d="M-46 -20L46 -60V-98H-46Z" fill="#fff" opacity=".07"/><rect x="-28" y="-90" width="56" height="9" rx="4" fill="#05080b"/><text y="-8" font-size="22" fill="#cfe6f5" text-anchor="middle" font-weight="700">12:08</text><circle cx="0" cy="88" r="6" fill="none" stroke="#889" opacity=".6"/>'))
def radio(x,y,rot=0,s=1):
    return g(x,y,rot,s,shadow(8,12,120,70,.5)+'<rect x="-118" y="-66" width="236" height="132" rx="16" fill="#6b3b1f"/><rect x="-118" y="-66" width="236" height="132" rx="16" fill="url(#vig)" opacity=".4"/><rect x="-106" y="-54" width="108" height="108" rx="10" fill="#2a1d14"/>'+''.join(f'<path d="M-100 {-46+i*8}H-4" stroke="#8a7a62" stroke-width="2"/>' for i in range(13))+'<rect x="12" y="-50" width="94" height="36" rx="4" fill="#e9dfbf"/><path d="M20 -32H98" stroke="#555"/><path d="M62 -48V-16" stroke="#c33" stroke-width="2"/>'+'<circle cx="38" cy="22" r="18" fill="url(#mV)"/><circle cx="82" cy="22" r="14" fill="url(#mV)"/><path d="M38 8V20M82 10V20" stroke="#222" stroke-width="3"/>')
def psu(x,y,rot=0,s=1,on=True):
    return g(x,y,rot,s,shadow(8,12,150,60,.5)+'<rect x="-150" y="-56" width="300" height="112" rx="10" fill="#3b4148"/><rect x="-150" y="-56" width="300" height="112" rx="10" fill="url(#mH)" opacity=".25"/><rect x="-136" y="-44" width="104" height="48" rx="4" fill="#0a0d0f"/>'
      +f'<text x="-40" y="-8" font-size="26" fill="#ff5b4a" font-family="monospace" text-anchor="end">{"05.00" if on else "00.00"}</text><text x="-34" y="-8" font-size="9" fill="#ff5b4a">V</text>'
      +'<circle cx="22" cy="-10" r="20" fill="url(#mV)"/><path d="M22 -26V-10" stroke="#222" stroke-width="3"/><circle cx="82" cy="-10" r="20" fill="url(#mV)"/><path d="M82 -26V-10" stroke="#222" stroke-width="3"/>'
      +''.join(f'<circle cx="{cx}" cy="32" r="9" fill="#111"/><circle cx="{cx}" cy="32" r="5" fill="{c}"/>' for cx,c in((-110,'#d33'),(-80,'#222'),(-50,'#3a3')))+f'<circle cx="124" cy="-30" r="5" fill="{"#3ddc84" if on else "#444"}"/>')
def clipboard(x,y,rot=0,s=1,lines=6):
    return g(x,y,rot,s,shadow(8,12,80,110,.45)+'<rect x="-76" y="-104" width="152" height="208" rx="10" fill="#6a4a2c"/><rect x="-64" y="-86" width="128" height="180" fill="#f1ecdf"/>'+''.join(f'<path d="M-52 {-60+i*22}H52" stroke="#9aa" stroke-width="1.2"/><rect x="-56" y="{-68+i*22}" width="8" height="8" fill="none" stroke="#444"/>' for i in range(lines))+'<rect x="-30" y="-110" width="60" height="22" rx="5" fill="url(#mH)"/>')
def tag(x,y,rot=0,s=1,txt='Job',col='#e6d9bb',w=96,h=60):
    return g(x,y,rot,s,shadow(4,8,w*.55,h*.5,.4)+f'<path d="M{-w/2+14} {-h/2}H{w/2}V{h/2}H{-w/2+14}L{-w/2} {h/2-14}V{-h/2+14}Z" fill="{col}"/><path d="M{-w/2+14} {-h/2}H{w/2}V{-h/2+6}H{-w/2+6}Z" fill="#fff" opacity=".35"/><circle cx="{-w/2+13}" cy="{-h/2+13}" r="4.2" fill="#2a1d13"/><path d="M{-w/2+13} {-h/2+13}Q{-w/2-14} {-h/2-30} {-w/2-40} {-h/2-8}" stroke="#a8332b" stroke-width="2" fill="none"/><text x="{w/2-10}" y="4" font-size="13" fill="#3a2a1a" text-anchor="end" font-weight="700">{txt}</text><path d="M{-w/2+26} {h/2-14}H{w/2-10}M{-w/2+26} {h/2-8}H{w/2-26}" stroke="#7a6a4a" stroke-width="1.2"/>')
def knob(x,y,r=18,rot=0,col='#2a2e33'): return g(x,y,rot,1,f'<circle cy="4" r="{r}" fill="#000" opacity=".5" filter="url(#sh)"/><circle r="{r}" fill="{col}"/><circle r="{r-3}" fill="url(#mV)" opacity=".5"/><circle r="{r-6}" fill="{col}"/><path d="M0 {-r+5}V0" stroke="#fff" stroke-width="3" stroke-linecap="round"/>')
def toggle(x,y,on=True): return g(x,y,0,1,'<rect x="-14" y="-9" width="28" height="18" rx="9" fill="#111"/>'+f'<circle cx="{7 if on else -7}" cy="0" r="7" fill="url(#mH)"/><circle cx="{-18}" cy="-16" r="3.2" fill="{"#3ddc84" if on else "#444"}"/>')
def stamp(x,y,txt='PASSED',rot=-12,col='#b3261e'): return g(x,y,rot,1,f'<rect x="-52" y="-16" width="104" height="32" rx="4" fill="none" stroke="{col}" stroke-width="3" opacity=".8"/><text y="7" font-size="19" fill="{col}" text-anchor="middle" font-weight="800" opacity=".8" letter-spacing="2">{txt}</text>')
