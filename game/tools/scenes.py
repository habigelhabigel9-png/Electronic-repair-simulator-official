from lib import *
from bench import w
W,H=800,300
def deskbg(W=800,H=300,seed=2,m=True,pad=18):
    s=wood(W,H,'#5f3a22',seed)
    if m: s+=mat(pad,pad,W-2*pad,H-2*pad,20)
    return s+f'<g opacity=".25">{lamp(W*.45,H*.4,W*.6)}</g>'
def fin(W,H,body,name,vg=.7): w(name,svg(W,H,body+f'<rect width="{W}" height="{H}" fill="url(#vig)" opacity="{vg}"/>'))
def boardparts():
    return (qfp(150,120,76,76,'ATMEGA328P')+ecap(300,70,24,'#1d3f8f')+ecap(344,100,20,'#1d3f8f')+to220(70,70,0,'7805')+resistor(240,200,0,(1,0,2),.9,True,30)+resistor(300,215,0,(2,2,1),.9,True,30)
      +led(60,190,'#ff3b30',True)+hdr(330,40,5)+xtal(250,140)+cer(60,130,'#e8962a','104',.9)+smd(210,55,0)+smd(220,55,0,'#8a5a2a')+smd(110,215,90)+smd(125,215,90,'#8a5a2a')+dip(130,215,8,'NE555P',0,.9))
def home():
    W,H=800,440
    b=deskbg(W,H,9,True,14)
    b+=pcb(70,70,440,300,4,-3,'POWER-BRD REV C',boardparts(),4,34).replace('<g transform="translate(70 70)','<g transform="translate(70 70)',1)
    b+=iron(690,230,-148,1.05,True)+'<path d="M392 188Q380 160 398 140Q412 120 396 98" stroke="#fff" stroke-width="5" fill="none" opacity=".12" filter="url(#sh)"/>'
    b+=spool(120,400,.0)+tweezer(560,395,-4,.9)+lensp(690,100,62)+driver(300,410,-3,.7)
    fin(W,H,b,'scene-home.svg',.55)
def solder_wisp(x,y): return f'<path d="M{x} {y}Q{x-14} {y-26} {x+4} {y-46}Q{x+18} {y-66} {x} {y-88}" stroke="#fff" stroke-width="6" fill="none" opacity=".13" filter="url(#sh)"/>'
def courses():
    b=deskbg(800,300,3)
    # colour-code card
    card=g(190,150,-4,1,shadow(6,10,130,100,.45)+'<rect x="-130" y="-98" width="260" height="196" rx="8" fill="#ece3cb"/><rect x="-130" y="-98" width="260" height="22" rx="8" fill="#3a2a1a"/><text y="-82" font-size="12" fill="#e9d9a8" text-anchor="middle" font-weight="700">RESISTOR COLOUR CODE</text>'+''.join(f'<rect x="{-118+i*23.2}" y="-66" width="21" height="46" rx="3" fill="{BANDS[i]}" stroke="#0004"/><text x="{-107.5+i*23.2}" y="-4" font-size="14" fill="#222" text-anchor="middle" font-weight="700">{i}</text>' for i in range(10))+resistor(0,50,0,(2,2,1),1.5,False,0)+'<path d="M-100 80H100" stroke="#8a7a5a"/>')
    b+=card+dmm(520,150,8,.62,'1.00')+batt(630,255,-8,.9,'9V')+resistor(430,250,4,(1,0,2),1.1,True,28)+led(690,70,'#ffd23a',True,1.2)
    fin(800,300,b,'scene-courses.svg')
def lesson1():
    b=deskbg(800,300,4)
    tri=g(180,150,-3,1,shadow(6,10,110,100,.45)+'<rect x="-120" y="-100" width="240" height="200" rx="8" fill="#ece3cb"/><path d="M0 -76L-70 60H70Z" fill="none" stroke="#3a2a1a" stroke-width="4"/><path d="M-35 -8H35M0 -8V60" stroke="#3a2a1a" stroke-width="3"/><text y="-8" font-size="34" fill="#a8332b" text-anchor="middle" font-weight="800" dy="-12">V</text><text x="-36" y="46" font-size="34" fill="#1d3f8f" text-anchor="middle" font-weight="800">I</text><text x="36" y="46" font-size="34" fill="#0f6a3c" text-anchor="middle" font-weight="800">R</text>')
    wires='<path d="M330 214C380 262 520 262 560 214" stroke="#d33" stroke-width="5" fill="none"/><path d="M330 214C370 150 400 150 440 150" stroke="#222" stroke-width="5" fill="none"/>'
    b+=tri+wires+batt(400,230,0,1,'9V')+resistor(520,150,0,(1,0,2),1.8,True,40)+dmm(680,150,6,.62,'9.00')
    fin(800,300,b,'scene-lesson-1.svg')
def lesson2():
    b=deskbg(800,300,5)
    big=resistor(400,150,0,(1,0,2),5.2,True,70)
    lab=''
    for x,t,c in((300,'1st digit','1'),(360,'2nd digit','0'),(420,'multiplier','×100'),(500,'tolerance','±5%')):
        lab+=f'<path d="M{x} 100V70" stroke="#e9d9a8" stroke-width="1.4" stroke-dasharray="3 3"/><rect x="{x-34}" y="46" width="68" height="24" rx="4" fill="#ece3cb"/><text x="{x}" y="62" font-size="11" fill="#3a2a1a" text-anchor="middle" font-weight="700">{t}</text>'
    b+=big+lab+f'<text x="400" y="262" font-size="22" fill="#e9d9a8" text-anchor="middle" font-weight="700">brown · black · red = 1 kΩ</text>'
    fin(800,300,b,'scene-lesson-2.svg')
def lesson3():
    b=deskbg(800,300,6)
    pb=pcb(90,40,420,230,12,0,'PSU-STD REV A',ecap(80,80,26,'#1d3f8f','',0,True,True)+ecap(150,80,26,'#1d3f8f')+fuse(250,150,0,True)+resistor(320,70,0,(2,2,1),1.2,True,26)+to220(340,150,0,'7805')+ecap(80,170,22,'#1d3f8f'),4,26)
    b+=pb+lensp(210,150,92)+g(660,150,0,1,shadow(5,8,70,60,.4)+'<rect x="-70" y="-60" width="140" height="120" rx="8" fill="#ece3cb"/><text y="-30" font-size="13" fill="#3a2a1a" text-anchor="middle" font-weight="700">LOOK FOR</text><text y="-8" font-size="12" fill="#3a2a1a" text-anchor="middle">domed capacitor top</text><text y="12" font-size="12" fill="#3a2a1a" text-anchor="middle">brown residue</text><text y="32" font-size="12" fill="#3a2a1a" text-anchor="middle">black glass fuse</text>')
    fin(800,300,b,'scene-lesson-3.svg')
def lesson4():
    b=deskbg(800,300,7)
    pb=pcb(60,50,430,220,5,0,'DRV-BRD REV B',fuse(100,80,0,False)+resistor(230,70,0,(1,0,2),1.2,True,26)+ecap(330,90,24,'#1d3f8f')+qfp(180,170,60,60,'LM358',0,6)+led(380,170,'#3ddc84',False),4,24)
    pr=lambda x,y,a,c:g(x,y,a,1,f'<rect x="0" y="-8" width="90" height="16" rx="8" fill="{c}"/><rect x="90" y="-4" width="60" height="8" fill="url(#mH)"/><path d="M150 -4L182 -1V1L150 4Z" fill="url(#mH)"/>')
    b+=pb+'<path d="M700 40C640 40 600 110 470 178" stroke="#d33" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M700 260C640 250 560 230 400 170" stroke="#17191c" stroke-width="7" fill="none" stroke-linecap="round"/>'+pr(430,185,-208,'#d33').replace('<g','<g',1)+dmm(700,150,4,.7,'0.02')
    fin(800,300,b,'scene-lesson-4.svg')
def lesson5():
    b=deskbg(800,300,8)
    caps=''.join(ecap(110+i*92,170,34 if i!=2 else 34,'#1d3f8f','',0,i==2,i==2) for i in range(4))
    b+=caps+scope(590,150,0,.72)+f'<text x="205" y="250" font-size="12" fill="#e9d9a8" text-anchor="middle" font-weight="700">GOOD</text><text x="297" y="250" font-size="12" fill="#ff9a7a" text-anchor="middle" font-weight="700">FAILING</text>'
    fin(800,300,b,'scene-lesson-5.svg')
def lesson6():
    b=deskbg(800,300,9)
    b+=psu(600,185,0,.85)+to220(190,140,0,'7805',2.0)+g(400,110,0,1,'<path d="M-50 40Q-30 -50 0 -20T50 -40" stroke="#a8332b" stroke-width="5" fill="none"/><circle cx="-50" cy="40" r="8" fill="url(#mH)"/>')
    # ESD strap
    b+=g(660,70,-8,1,'<path d="M-70 10Q-40 -30 0 -10T70 -10" stroke="#222" stroke-width="7" fill="none"/><rect x="-96" y="-4" width="34" height="26" rx="6" fill="#1d3f8f"/><rect x="62" y="-14" width="30" height="24" rx="12" fill="url(#mH)"/>')
    b+=ecap(380,235,30,'#1d3f8f')+resistor(330,270,6,(1,0,3),1.0,True,30)
    fin(800,300,b,'scene-lesson-6.svg')
def levels():
    b=pegboard(800,300)+'<rect x="0" y="0" width="800" height="300" fill="url(#vig)" opacity=".5"/>'
    xs=[110,250,390,530,670]
    ds=[phone(xs[0],130,-4,.62),radio(xs[1],130,3,.52),to220(xs[2],110,0,'LM317',1.1),psu(xs[3],130,-2,.5),batt(xs[4],120,12,.9,'18650')]
    for (x,t) in zip(xs,('Level 7','Level 12','Level 3','Level 21','Bonus')):
        b+=f'<path d="M{x} 22V40" stroke="#c0a070" stroke-width="2"/>'
    b+=''.join(ds)+''.join(tag(x,238,(-1)**i*4,1,t,'#e6d9bb',92,54) for i,(x,t) in enumerate(zip(xs,('7','12','3','21','B'))))
    fin(800,300,b,'scene-levels.svg')
def shop():
    b=wood(800,300,'#4a2f1c',12)
    dr=''
    for r in range(2):
        for c in range(4):
            x=24+c*194;y=26+r*136
            dr+=f'<rect x="{x}" y="{y}" width="184" height="124" rx="6" fill="#26343a"/><rect x="{x+4}" y="{y+4}" width="176" height="116" rx="4" fill="#31444c"/><rect x="{x+4}" y="{y+4}" width="176" height="38" rx="4" fill="#fff" opacity=".05"/><rect x="{x+42}" y="{y+16}" width="100" height="30" rx="2" fill="#e6d9bb"/><text x="{x+92}" y="{y+36}" font-size="13" fill="#3a2a1a" text-anchor="middle" font-weight="700">{["RESISTORS","CAPACITORS","DIODES / LED","TRANSISTORS","ICs","FUSES","CONNECTORS","SWITCHES"][r*4+c]}</text><rect x="{x+66}" y="{y+74}" width="52" height="14" rx="7" fill="url(#brass)"/><rect x="{x+66}" y="{y+74}" width="52" height="5" rx="3" fill="#fff" opacity=".4"/>'
    b+=dr+'<rect width="800" height="300" fill="url(#vig)" opacity=".5"/>'
    fin(800,300,b,'scene-shop.svg',.2)
def inventory():
    b=deskbg(800,300,13,False)+'<rect x="22" y="22" width="756" height="256" rx="14" fill="#1a1f22"/><rect x="22" y="22" width="756" height="256" rx="14" fill="none" stroke="#3a4247" stroke-width="3"/>'
    items=[lambda x,y:resistor(x,y,0,(1,0,2),.8,False,20),lambda x,y:ecap(x,y,20,'#1d3f8f'),lambda x,y:led(x,y,'#ff3b30',False,1.1),lambda x,y:to220(x,y,0,'7805',.8),lambda x,y:diode(x,y,0,.8),lambda x,y:cer(x,y),lambda x,y:fuse(x,y,0,False,.9),lambda x,y:dip(x,y,8,'NE555',0,.9),lambda x,y:xtal(x,y),lambda x,y:hdr(x,y,4),lambda x,y:usbc(x,y),lambda x,y:resistor(x,y,0,(2,2,1),.8,False,20)]
    for i in range(12):
        c=i%6;r=i//6;x=42+c*122;y=42+r*118
        b+=f'<rect x="{x}" y="{y}" width="112" height="108" rx="6" fill="#0d1113"/><rect x="{x}" y="{y}" width="112" height="108" rx="6" fill="none" stroke="#ffffff1a"/>'+items[i](x+56,y+52)
    b+='<rect x="22" y="22" width="756" height="256" rx="14" fill="url(#lens)" opacity=".18"/>'
    fin(800,300,b,'scene-inventory.svg')
def skills():
    b=pegboard(800,300)
    b+=driver(200,70,0,.9)+driver(200,120,0,.9,'#1d3f8f')+tweezer(190,175,0,.9)+tweezer(190,215,0,.9)+iron(640,75,0,.8,False)+dmm(430,160,0,.5,'')+lensp(590,205,44)+spool(735,200,.8)+f'<text x="320" y="272" font-size="12" fill="#2a1d13" opacity=".0">tools</text>'
    b+=''.join(f'<path d="M{x} {y}h40" stroke="#2a1d13" stroke-width="3" opacity=".0"/>' for x,y in [(0,0)])
    fin(800,300,b,'scene-skills.svg',.55)
def history():
    b=deskbg(800,300,14)
    page=lambda x:f'<rect x="{x}" y="-120" width="190" height="240" fill="#efe7d2"/>'+''.join(f'<path d="M{x+14} {-96+i*20}H{x+176}" stroke="#9fb4c4" stroke-width="1"/>' for i in range(11))+f'<path d="M{x+30} -120V120" stroke="#d5655a" stroke-width="1.2"/>'
    lines=''.join(f'<path d="M{-170+10} {-96+i*20+14}q8 -8 16 0t16 0t16 0t16 0t16 0" stroke="#2a3a8a" stroke-width="1.4" fill="none" opacity=".65"/>' for i in range(5))+''.join(f'<path d="M{20} {-96+i*20+14}q8 -8 16 0t16 0t16 0t16 0" stroke="#2a3a8a" stroke-width="1.4" fill="none" opacity=".65"/>' for i in range(7))
    b+=g(300,150,-2,1,shadow(6,10,200,125,.5)+'<rect x="-206" y="-128" width="412" height="256" rx="6" fill="#4a2a1a"/>'+page(-198)+page(8)+'<path d="M-8 -120V120" stroke="#000" opacity=".25" stroke-width="8" filter="url(#sh)"/>'+lines+stamp(-90,70,'PASSED',-10,'#1f7a3a')+stamp(110,-10,'REPAIRED',8,'#a8332b'))
    b+=g(600,100,20,1,shadow(4,8,70,6,.4)+'<rect x="-80" y="-7" width="150" height="14" rx="7" fill="#1d3f8f"/><rect x="70" y="-4" width="24" height="8" fill="url(#mH)"/><path d="M94 -4L108 0L94 4Z" fill="#222"/>')+tag(660,220,-6,1.1,'#0425','#e6d9bb',100,60)
    fin(800,300,b,'scene-history.svg')
def profile():
    b=deskbg(800,300,15)
    badge=g(260,150,-4,1,shadow(8,12,100,130,.5)+'<path d="M-30 -150V-112M30 -150V-112" stroke="#1d3f8f" stroke-width="10"/><rect x="-100" y="-120" width="200" height="262" rx="14" fill="#f1ecdf"/><rect x="-100" y="-120" width="200" height="50" rx="14" fill="#1f5a44"/><rect x="-100" y="-90" width="200" height="20" fill="#1f5a44"/><text y="-90" font-size="16" fill="#f1ecdf" text-anchor="middle" font-weight="800" letter-spacing="1">TECHNICIAN</text><rect x="-64" y="-52" width="128" height="104" rx="6" fill="#cfd8d4"/><circle cy="-18" r="24" fill="#8a9a94"/><path d="M-46 52Q0 -12 46 52Z" fill="#8a9a94"/><rect x="-80" y="68" width="160" height="10" rx="3" fill="#3a2a1a" opacity=".7"/><rect x="-80" y="88" width="110" height="8" rx="3" fill="#3a2a1a" opacity=".4"/><rect x="-80" y="108" width="160" height="22" fill="#fff"/>'+''.join(f'<rect x="{-78+i*5.6}" y="110" width="{1+(i*7)%3}" height="18" fill="#111"/>' for i in range(27)))
    patch=lambda x,y,c,t:g(x,y,0,1,shadow(3,6,34,34,.4)+f'<circle r="34" fill="{c}"/><circle r="29" fill="none" stroke="#f3e6b8" stroke-width="2" stroke-dasharray="4 3"/><text y="6" font-size="14" fill="#f3e6b8" text-anchor="middle" font-weight="800">{t}</text>')
    b+=badge+patch(480,90,'#1f5a44','TECH')+patch(560,170,'#7a3b12','BENCH')+patch(640,100,'#1d3f8f','SENIOR')+g(620,230,0,1,shadow(4,8,60,30,.4)+'<rect x="-70" y="-28" width="140" height="56" rx="6" fill="#d7a84a"/><text y="6" font-size="16" fill="#3a2a10" text-anchor="middle" font-weight="800">CERTIFIED</text>')
    fin(800,300,b,'scene-profile.svg')
def settings():
    b=wood(800,300,'#3a3f44',16).replace('#3a3f44','#2c3136')+'<rect x="20" y="20" width="760" height="260" rx="14" fill="#c9d0d6"/><rect x="20" y="20" width="760" height="260" rx="14" fill="url(#mH)" opacity=".5"/><rect x="30" y="30" width="740" height="240" rx="10" fill="#2a2f34"/>'
    b+=''.join(knob(90+i*110,100,26,(-60+i*35)) for i in range(5))+''.join(toggle(110+i*80,220,i%2==0) for i in range(6))
    b+=''.join(f'<text x="{90+i*110}" y="150" font-size="12" fill="#c9d0d6" text-anchor="middle" font-weight="700">{t}</text>' for i,t in enumerate(('VOLUME','HINTS','BRIGHT','SPEED','LEVEL')))
    b+='<rect x="640" y="60" width="110" height="60" rx="6" fill="#0a0d0f"/><text x="695" y="100" font-size="26" fill="#3ddc84" font-family="monospace" text-anchor="middle">12.0V</text>'+psu(695,215,0,.0)
    b+='<path d="M600 230C640 280 700 280 740 230" stroke="#d33" stroke-width="6" fill="none"/><path d="M590 238C650 290 710 290 750 238" stroke="#222" stroke-width="6" fill="none"/>'
    fin(800,300,b,'scene-settings.svg',.35)
def safety():
    b=deskbg(800,300,17)
    b+=g(170,150,-4,1,shadow(6,14,110,50,.45)+'<path d="M-118 -6Q-150 -2 -148 20M118 -6Q150 -2 148 20" stroke="#1f5a44" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M-110 -30H110Q122 -30 122 -16V28Q122 50 100 50H18Q4 50 0 36Q-4 50 -18 50H-100Q-122 50 -122 28V-16Q-122 -30 -110 -30Z" fill="#cfe6f0" fill-opacity=".28" stroke="#1f5a44" stroke-width="9" stroke-linejoin="round"/><path d="M-90 -16Q-40 -22 -20 -12" stroke="#fff" stroke-width="5" opacity=".7" fill="none" stroke-linecap="round"/><path d="M-8 6H8" stroke="#1f5a44" stroke-width="10"/>')
    b+=g(380,170,0,1,'<path d="M-90 20Q-40 -50 0 0T90 -10" stroke="#222" stroke-width="8" fill="none"/><rect x="-124" y="2" width="50" height="34" rx="8" fill="#1d3f8f"/><rect x="-124" y="2" width="50" height="12" rx="6" fill="#fff" opacity=".25"/><rect x="82" y="-24" width="34" height="34" rx="17" fill="url(#mH)"/>'+shadow(0,40,100,8,.3))
    b+=g(600,150,-4,1,shadow(5,12,50,20,.3)+'<path d="M0 -90L80 70H-80Z" fill="#f2c230" stroke="#1a1a1a" stroke-width="7" stroke-linejoin="round"/><path d="M-14 -20L14 -20L8 30H-8Z" fill="#1a1a1a"/><circle cy="46" r="7" fill="#1a1a1a"/>')
    b+=g(720,190,0,1,shadow(5,10,26,60,.45)+'<rect x="-22" y="-60" width="44" height="120" rx="14" fill="url(#red)"/><rect x="-10" y="-80" width="20" height="26" rx="4" fill="#222"/><rect x="-22" y="-24" width="44" height="26" fill="#f4f4f4"/><path d="M22 -70Q50 -70 50 -40" stroke="#222" stroke-width="4" fill="none"/>')
    fin(800,300,b,'scene-safety.svg')
def tutorial():
    b=deskbg(800,300,18)
    b+=phone(120,150,-8,.8)+driver(280,80,-12,.8)+phone(450,150,4,.8,True)+tweezer(580,205,-6,.7)+dmm(690,150,6,.58,'')+''.join(f'<circle cx="{x}" cy="262" r="14" fill="#d7a84a"/><text x="{x}" y="267" font-size="14" fill="#3a2a10" text-anchor="middle" font-weight="800">{n}</text>' for x,n in((120,1),(280,2),(450,3),(560,4),(690,5)))
    fin(800,300,b,'scene-tutorial.svg')
def career():
    b=deskbg(800,300,19)
    medal=lambda x,y,c,t:g(x,y,0,1,shadow(4,10,34,44,.4)+f'<path d="M-18 -90L0 -40L18 -90" fill="#a8332b"/><circle cy="0" r="38" fill="url(#brass)"/><circle r="30" fill="{c}"/><text y="7" font-size="18" fill="#f6e7b0" text-anchor="middle" font-weight="800">{t}</text>')
    b+=medal(140,150,'#1f5a44','1')+medal(260,150,'#7a3b12','2')+medal(380,150,'#1d3f8f','3')+iron(600,210,-12,.8,True)+resistor(560,90,6,(1,0,2),1.2,True,30)+led(690,95,'#3ddc84',True,1.3)
    b+=f'<text x="260" y="250" font-size="13" fill="#e9d9a8" text-anchor="middle" font-weight="700" opacity=".0">rank</text>'
    fin(800,300,b,'scene-career.svg')
def empty():
    b=deskbg(800,300,20)+g(400,160,0,1,'<rect x="-190" y="-100" width="380" height="200" rx="10" fill="none" stroke="#9fd3be" stroke-opacity=".45" stroke-width="2" stroke-dasharray="10 8"/>')+tweezer(120,230,-4,.8)+driver(680,240,3,.8)+dmm(110,120,0,.45,'')+scope(690,100,0,.36)+lensp(400,160,50)
    fin(800,300,b,'scene-empty.svg',.6)
def result():
    b=deskbg(800,300,21)+clipboard(220,150,-3,1.2)+psu(520,170,0,.9)+stamp(240,200,'PASSED',-12,'#1f7a3a')
    fin(800,300,b,'scene-result.svg')
if __name__=='__main__':
    for f in (home,courses,lesson1,lesson2,lesson3,lesson4,lesson5,lesson6,levels,shop,inventory,skills,history,profile,settings,safety,tutorial,career,empty,result): f()
