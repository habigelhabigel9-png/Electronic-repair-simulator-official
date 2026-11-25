from lib import *
from scenes import deskbg,fin,boardparts
from bench import w
import math
# ---------- device renders (360x250, transparent) ----------
def dsvg(n,body): w(f'dev-{n}.svg',svg(360,250,body))
def rr(x,y,wd,h,r,f,extra=''): return f'<rect x="{x}" y="{y}" width="{wd}" height="{h}" rx="{r}" fill="{f}" {extra}/>'
def hi(x,y,wd,h,r,o=.25): return f'<rect x="{x}" y="{y}" width="{wd}" height="{h}" rx="{r}" fill="#fff" opacity="{o}"/>'
def devices():
    # 1 toy robot
    b=shadow(180,232,110,10,.5)
    b+=rr(120,150,38,70,10,'url(#blu)')+rr(202,150,38,70,10,'url(#blu)')+rr(112,214,54,14,6,'#2a2f33')+rr(194,214,54,14,6,'#2a2f33')
    b+=rr(70,100,34,80,16,'url(#mH)')+rr(256,100,34,80,16,'url(#mH)')+hi(74,104,10,70,5,.4)+hi(260,104,10,70,5,.4)
    b+=rr(100,86,160,84,16,'url(#blu)')+hi(104,90,150,22,12,.25)+rr(130,108,100,46,8,'#0e1c3f')
    b+=''.join(f'<circle cx="{x}" cy="131" r="9" fill="{c}"/><circle cx="{x}" cy="131" r="4" fill="#fff" opacity=".5"/>' for x,c in((156,'#ff5a4d'),(180,'#ffd84a'),(204,'#4fe08a')))
    b+=rr(124,28,112,64,14,'url(#mH)')+hi(128,32,100,16,8,.5)+rr(138,44,84,34,8,'#0b1220')
    b+=''.join(f'<circle cx="{x}" cy="61" r="11" fill="#bfe9ff"/><circle cx="{x+2}" cy="62" r="5" fill="#0b1220"/><circle cx="{x-2}" cy="57" r="2.4" fill="#fff"/>' for x in(161,199))
    b+='<path d="M180 28V10" stroke="#9aa7b3" stroke-width="5"/><circle cx="180" cy="8" r="8" fill="url(#red)"/>'+rr(168,76,24,5,2,'#e8a317')
    dsvg(1,b)
    # 2 desk fan
    b=shadow(180,236,90,9,.5)+'<path d="M180 160V214" stroke="url(#mV)" stroke-width="20"/>'+f'<ellipse cx="180" cy="222" rx="82" ry="14" fill="#2a2f33"/><ellipse cx="180" cy="218" rx="82" ry="14" fill="#3b4148"/>'
    b+='<circle cx="180" cy="102" r="92" fill="#0d1b2a" opacity=".18"/>'
    for i in range(3):
        a=i*120+15;b+=f'<g transform="rotate({a} 180 102)"><path d="M180 102C150 70 160 24 196 26C206 56 200 88 180 102Z" fill="#7fb6e6" opacity=".92"/><path d="M180 102C165 76 168 44 190 32" stroke="#fff" opacity=".5" stroke-width="3" fill="none"/></g>'
    b+='<circle cx="180" cy="102" r="16" fill="url(#mH)"/><circle cx="180" cy="102" r="7" fill="#2a2f33"/>'
    for r in (34,56,78,92):b+=f'<circle cx="180" cy="102" r="{r}" fill="none" stroke="#c9d1d8" stroke-width="{3.4 if r==92 else 1.8}"/>'
    for a in range(0,360,30):b+=f'<path d="M180 102L{180+92*math.cos(math.radians(a)):.1f} {102+92*math.sin(math.radians(a)):.1f}" stroke="#aeb8c1" stroke-width="1.4"/>'
    b+=rr(166,150,28,20,6,'#4a5560')+'<circle cx="180" cy="160" r="5" fill="#d7382d"/>'
    dsvg(2,b)
    # 3 USB cable
    b=shadow(180,230,140,9,.45)
    cab='M60 150C20 110 70 60 120 90S200 190 230 140S300 60 300 110'
    b+=f'<path d="{cab}" stroke="#000" stroke-width="12" fill="none" opacity=".35" transform="translate(4 8)" filter="url(#sh)"/><path d="{cab}" stroke="#1d2125" stroke-width="10" fill="none" stroke-linecap="round"/><path d="{cab}" stroke="#5a646d" stroke-width="2.4" fill="none" stroke-linecap="round" transform="translate(-2 -2)"/>'
    b+=rr(28,136,40,28,6,'#252a2f')+rr(8,140,28,20,3,'url(#mH)')+rr(12,146,16,4,1,'#15191c')+rr(12,152,16,4,1,'#15191c')+hi(30,138,36,8,3,.2)
    b+=rr(292,96,40,28,6,'#252a2f')+f'<path d="M330 100h12l6 4v12l-6 4h-12Z" fill="url(#mH)"/><rect x="334" y="106" width="8" height="4" fill="#15191c"/>'
    dsvg(3,b)
    # 4 earphones
    b=shadow(180,232,130,8,.4)
    for x,fl in((92,1),(268,-1)):
        b+=f'<g transform="translate({x} 80)"><ellipse cx="0" cy="8" rx="34" ry="30" fill="#000" opacity=".35" filter="url(#sh)"/><ellipse cx="0" cy="0" rx="32" ry="28" fill="#f4f6f8"/><ellipse cx="-8" cy="-10" rx="16" ry="10" fill="#fff" opacity=".8"/><ellipse cx="{8*fl}" cy="4" rx="16" ry="14" fill="#d5dbe0"/><path d="M{-6} -4h12M-6 2h12M-6 8h12" stroke="#9aa5ad" stroke-width="1.6"/><rect x="{-4+fl*14}" y="22" width="8" height="40" rx="4" fill="#e6ebef" transform="rotate({-12*fl} 0 22)"/></g>'
    for x,fl in((92,1),(268,-1)):b+=f'<path d="M{x+(-14 if fl==1 else 14)} 140C{x} 190 170 170 180 196" stroke="#e8edf1" stroke-width="5" fill="none" stroke-linecap="round"/>'
    b+='<path d="M180 196V210" stroke="#e8edf1" stroke-width="5"/>'+rr(172,206,16,14,4,'#2a2f33')+rr(176,218,8,14,2,'url(#mH)')+'<rect x="176" y="226" width="8" height="3" fill="#2a2f33"/>'
    dsvg(4,b)
    # 10 tablet
    b=shadow(180,232,150,9,.5)+rr(26,40,308,186,16,'#15191c')+'<rect x="26" y="40" width="308" height="186" rx="16" fill="url(#mV)" opacity=".25"/>'+rr(38,52,284,162,8,'#0f2a47')
    b+='<defs><linearGradient id="scr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a7ad0"/><stop offset="1" stop-color="#0f3a73"/></linearGradient></defs>'+rr(38,52,284,162,8,'url(#scr)')
    b+=''.join(rr(52+(i%4)*64,70+(i//4)*52,50,40,10,c) for i,c in enumerate(['#ffffff40','#ffd84acc','#4fe08acc','#ff6a5ccc','#ffffff30','#c28bffcc','#5cc8ffcc','#ffffff40']))
    b+='<path d="M38 52L200 52L120 214H38Z" fill="#fff" opacity=".08"/><circle cx="30" cy="133" r="3" fill="#2a2f33"/>'
    dsvg(10,b)
    # 12 monitor
    b=shadow(180,236,120,8,.5)+'<path d="M150 190L210 190L222 222H138Z" fill="url(#mV)"/>'+'<ellipse cx="180" cy="226" rx="82" ry="10" fill="#2a2f33"/><ellipse cx="180" cy="223" rx="82" ry="10" fill="#4a5560"/>'
    b+=rr(24,22,312,176,10,'#15191c')+'<defs><linearGradient id="mscr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1c5ea8"/><stop offset=".6" stop-color="#2fb3d8"/><stop offset="1" stop-color="#6ee3b8"/></linearGradient></defs>'+rr(32,30,296,152,4,'url(#mscr)')
    b+=rr(44,42,120,86,6,'#ffffffcc')+rr(176,42,140,30,4,'#0f2a4766')+rr(176,82,140,46,4,'#0f2a4733')+'<path d="M32 30L190 30L110 182H32Z" fill="#fff" opacity=".1"/>'+f'<circle cx="180" cy="190" r="2.6" fill="#3ddc84"/>'
    dsvg(12,b)
    # 13 television
    b=shadow(180,238,150,8,.5)+rr(60,218,22,16,3,'#2a2f33')+rr(278,218,22,16,3,'#2a2f33')
    b+=rr(10,26,340,196,8,'#101316')+rr(16,32,328,184,4,'#000')+'<defs><linearGradient id="tvs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a7bd5"/><stop offset=".55" stop-color="#f6c36a"/><stop offset=".56" stop-color="#2f7d4a"/><stop offset="1" stop-color="#14442a"/></linearGradient></defs>'+rr(16,32,328,184,4,'url(#tvs)')
    b+='<circle cx="270" cy="88" r="24" fill="#fff3b0"/><path d="M16 150L70 100 120 140 190 80 250 140 344 120V216H16Z" fill="#1f4f33" opacity=".7"/><path d="M16 32L210 32L120 216H16Z" fill="#fff" opacity=".08"/>'+'<circle cx="180" cy="224" r="2.6" fill="#d7382d"/>'
    dsvg(13,b)
    # 14 router
    b=shadow(180,226,140,10,.5)
    for x,a in((70,-14),(180,0),(290,14)):b+=f'<g transform="translate({x} 120) rotate({a})"><rect x="-6" y="-86" width="12" height="90" rx="6" fill="#1b1f23"/><rect x="-6" y="-86" width="5" height="90" rx="3" fill="#fff" opacity=".18"/></g>'
    b+='<path d="M26 132L60 116H300L334 132V198Q334 212 320 212H40Q26 212 26 198Z" fill="url(#blk)"/><path d="M26 132L60 116H300L334 132Z" fill="#fff" opacity=".12"/><rect x="40" y="150" width="280" height="42" rx="6" fill="#0c0f12"/>'
    b+=''.join(f'<circle cx="{66+i*34}" cy="171" r="5" fill="{c}"/>' for i,c in enumerate(['#3ddc84','#3ddc84','#3ddc84','#ffd84a','#3ddc84','#5cc8ff']))+'<text x="290" y="175" font-size="11" fill="#7d8892" font-weight="700" text-anchor="end" font-family="monospace">WLAN</text>'
    dsvg(14,b)
    # 15 printer
    b=shadow(180,236,150,9,.5)
    b+=rr(70,22,220,60,6,'#e9edf0')+rr(80,28,200,40,3,'#fff')+'<path d="M96 40h168M96 50h140M96 60h160" stroke="#9aa7b3" stroke-width="2.4"/>'
    b+=rr(24,78,312,120,16,'url(#mV)')+hi(24,78,312,34,16,.35)+rr(24,150,312,48,14,'#c3ccd4')+rr(46,112,200,34,5,'#1d2226')+rr(250,108,66,40,6,'#101316')+rr(256,114,54,20,3,'#3ddc84')+'<text x="283" y="129" font-size="11" fill="#0c3a1c" text-anchor="middle" font-weight="800" font-family="monospace">READY</text>'
    b+=rr(60,196,240,16,4,'#d7dde2')+rr(90,186,180,10,2,'#fff')+rr(116,198,128,10,2,'#aab3ba')
    dsvg(15,b)
    # 16 drone
    b=shadow(180,232,130,9,.45)
    for x,y in((78,66),(282,66),(78,176),(282,176)):
        b+=f'<path d="M180 121L{x} {y}" stroke="#2a2f33" stroke-width="12" stroke-linecap="round"/><path d="M180 121L{x} {y}" stroke="#4a5560" stroke-width="4" stroke-linecap="round"/><circle cx="{x}" cy="{y}" r="46" fill="#8fbfe8" opacity=".25"/><circle cx="{x}" cy="{y}" r="46" fill="none" stroke="#fff" stroke-opacity=".5" stroke-dasharray="4 5"/><g transform="rotate(30 {x} {y})"><ellipse cx="{x}" cy="{y}" rx="46" ry="6" fill="#1d2226" opacity=".85"/><ellipse cx="{x}" cy="{y}" rx="6" ry="46" fill="#1d2226" opacity=".45"/></g><circle cx="{x}" cy="{y}" r="11" fill="#3b4148"/><circle cx="{x}" cy="{y}" r="4" fill="url(#mH)"/>'
    b+=rr(140,92,80,58,18,'#e9edf0')+hi(144,96,72,16,8,.6)+rr(150,106,60,30,10,'#1b2430')+'<circle cx="180" cy="152" r="11" fill="#101316"/><circle cx="180" cy="152" r="6" fill="#2a6aa0"/><circle cx="154" cy="146" r="4" fill="#ff4a3a"/><circle cx="206" cy="146" r="4" fill="#3ddc84"/>'
    dsvg(16,b)
# ---------- lesson scenes ----------
def breadboard(x,y,wd,h):
    s=f'<rect x="{x+4}" y="{y+10}" width="{wd}" height="{h}" rx="8" fill="#000" opacity=".5" filter="url(#sh)"/><rect x="{x}" y="{y}" width="{wd}" height="{h}" rx="8" fill="#ece8da"/><rect x="{x}" y="{y}" width="{wd}" height="{h}" rx="8" filter="url(#grain2)" opacity=".25"/>'
    s+=f'<rect x="{x+8}" y="{y+8}" width="{wd-16}" height="12" fill="#d7382d" opacity=".35"/><rect x="{x+8}" y="{y+22}" width="{wd-16}" height="12" fill="#2a6df4" opacity=".35"/><rect x="{x+8}" y="{y+h-34}" width="{wd-16}" height="12" fill="#d7382d" opacity=".35"/><rect x="{x+8}" y="{y+h-20}" width="{wd-16}" height="12" fill="#2a6df4" opacity=".35"/><rect x="{x+10}" y="{y+h/2-3}" width="{wd-20}" height="6" fill="#c9c4b2"/>'
    for r in list(range(6))+list(range(6,12)):
        yy=y+42+r*((h-100)/11)
        if abs(yy-(y+h/2))<6:continue
        for c in range(int((wd-30)/14)):s+=f'<rect x="{x+16+c*14}" y="{yy}" width="5" height="5" rx="1" fill="#2a2f33"/>'
    return s
def scenes2():
    b=deskbg(800,300,22)+breadboard(60,40,520,220)+resistor(190,110,0,(1,0,2),1.0,True,34)+resistor(330,110,0,(2,2,1),1.0,True,34)+resistor(460,110,0,(3,3,2),1.0,True,34)+led(520,190,'#ff3b30',True,1.2)+batt(670,200,-6,1.0,'9V')
    b+='<path d="M120 100Q120 60 160 60H400" stroke="#d7382d" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M120 200Q200 230 300 200" stroke="#2a6df4" stroke-width="5" fill="none" stroke-linecap="round"/>'+dmm(700,80,6,.5,'9.00')
    fin(800,300,b,'scene-series.svg')
    b=deskbg(800,300,23)+breadboard(40,40,420,220)+resistor(150,120,0,(1,0,3),1.2,True,34)+resistor(150,190,0,(1,0,3),1.2,True,34)
    b+=g(360,150,0,1,shadow(5,10,40,40,.4)+'<rect x="-40" y="-40" width="80" height="80" rx="6" fill="#2a5fd1"/><rect x="-40" y="-40" width="80" height="26" rx="6" fill="#fff" opacity=".2"/><circle r="22" fill="url(#brass)"/><path d="M-12 -12L12 12" stroke="#5a3a0a" stroke-width="5"/><text y="34" font-size="10" fill="#cfe0ff" text-anchor="middle" font-weight="700">10K</text>')+dmm(620,150,-4,.9,'4.50')+'<path d="M470 120Q540 70 580 110" stroke="#d33" stroke-width="6" fill="none"/><path d="M470 200Q540 250 590 210" stroke="#111" stroke-width="6" fill="none"/>'
    fin(800,300,b,'scene-divider.svg')
    sym=lambda x,y,p:f'<g transform="translate({x} {y})" fill="none" stroke="#12263a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">{p}</g>'
    sh=g(190,150,-3,1,shadow(6,10,170,110,.5)+'<rect x="-170" y="-110" width="340" height="220" rx="6" fill="#f1ecdf"/><path d="M-160 -70H160M-160 -20H160M-160 30H160M-160 80H160" stroke="#9fb4c4" stroke-width="1"/>')
    sh+=sym(190-120,150-85,'<path d="M0 0H20l5-12 8 24 8-24 8 24 5-12H80"/>')+sym(190-120,150-34,'<path d="M0 0H30M50 0H80M30 -14V14M50 -14V14"/>')+sym(190-120,150+16,'<path d="M0 0H25M55 0H80M25 -14V14L55 0ZM55 -14V14"/>')+sym(190-120,150+66,'<path d="M0 0H25M55 0H80M25 -14V14L55 0ZM55 -14V14M40 -22l8-6M50 -18l8-6"/>')
    b=deskbg(800,300,24)+sh+resistor(500,70,6,(1,0,2),1.1,True,30)+ecap(430,125,18)+led(560,130,'#ff3b30',True,1.1)+diode(520,200,-6,1.0)+tag(690,80,5,1,'R1','#e6d9bb',70,44)+tag(690,140,-4,1,'C1','#e6d9bb',70,44)+tag(690,200,3,1,'D1','#e6d9bb',70,44)
    fin(800,300,b,'scene-symbols.svg')
    b=deskbg(800,300,25)
    parts=[lambda x,y:fuse(x,y,0,False,1.2),lambda x,y:ecap(x,y,24),lambda x,y:cer(x,y,'#e8962a','104',1.3),lambda x,y:to220(x,y,0,'7805',1.0),lambda x,y:dip(x,y,8,'NE555',0,1.4),lambda x,y:xtl_(x,y),lambda x,y:led(x,y,'#ffd23a',False,1.5),lambda x,y:diode(x,y,0,1.0),lambda x,y:resistor(x,y,0,(1,0,2),1.2,True,28),lambda x,y:usbc(x,y,0)]
    for i,f in enumerate(parts):
        c=i%5;r=i//5;x=100+c*150;y=100+r*110;b+=f(x,y)+f'<text x="{x}" y="{y+70}" font-size="11" fill="#9fb4c4" text-anchor="middle" font-weight="700" opacity="0">.</text>'
    b+=g(700,60,4,1,'<text font-size="1"></text>')
    fin(800,300,b,'scene-ident.svg')
    b=deskbg(800,300,26)+pcb(70,50,420,220,6,-2,'SOLDER-PRACTICE',resistor(110,80,0,(1,0,2),1.0,True,26)+led(210,110,'#ff3b30',True,1.0)+ecap(300,90,22)+hdr(330,170,5)+qfp(130,160,60,60,'ATMEGA')+smd(260,170,0),4,26)+iron(640,200,-152,1.1,True)+spool(560,70,.8)+'<path d="M250 138Q240 110 256 90Q268 70 252 50" stroke="#fff" stroke-width="5" fill="none" opacity=".14" filter="url(#sh)"/>'
    fin(800,300,b,'scene-solder.svg')
def xtl_(x,y):
    from lib import xtal
    return xtal(x,y,0)
if __name__=='__main__':
    devices();scenes2()
