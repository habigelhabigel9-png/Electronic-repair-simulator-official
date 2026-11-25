from lib import *
import os
OUT=__import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)),'..','assets')
os.makedirs(OUT,exist_ok=True)
def w(name,s): open(f'{OUT}/{name}','w',encoding='utf8').write(s)
# --- desk 1200x820: walnut bench, ESD mat with ruler edge, lamp pool
def desk():
    W,H=1200,820
    b=wood(W,H,'#6a4026',5)
    b+=f'<rect width="{W}" height="{H}" fill="url(#vig)"/>'
    b+=mat(70,30,1060,760)
    t=''
    for i in range(20,1040,20):
        L=14 if i%100==0 else 7
        t+=f'<path d="M{70+i} 30v{L}M{70+i} 790v-{L}" stroke="#a8cfc0" stroke-opacity=".5"/>'
        if i%100==0 and i: t+=f'<text x="{70+i-6}" y="62" font-size="11" fill="#a8cfc0" opacity=".55">{i//100}</text>'
    for j in range(20,740,20):
        L=14 if j%100==0 else 7
        t+=f'<path d="M70 {30+j}h{L}M1130 {30+j}h-{L}" stroke="#a8cfc0" stroke-opacity=".5"/>'
    b+=t
    b+='<g opacity=".5"><rect x="990" y="740" width="110" height="26" rx="5" fill="#0d1311"/><text x="1000" y="758" font-size="13" fill="#8fd3b8" font-weight="700" letter-spacing="2">ESD SAFE</text></g>'
    b+=f'<g opacity=".28">'+lamp(600,320,600)+'</g>'+f'<rect width="{W}" height="{H}" fill="url(#vig)" opacity=".6"/>'
    w('bench-desk.svg',svg(W,H,b))
def prop(name,pw,ph,body): w(name,svg(pw,ph,g(pw/2,ph/2,0,1,body)))
def props():
    prop('prop-dmm.svg',230,360,dmm(0,0,0,1,'').replace('fill="#555"','fill="#17191b"'))
    prop('prop-scope.svg',430,270,scope(0,0))
    prop('prop-iron.svg',520,150,iron(60,0,0,1,True)+spool(-190,6,.0)+'')
    prop('prop-spool.svg',230,150,spool(-20,0,1.3))
    prop('prop-tweezers.svg',320,60,tweezer(0,0))
    prop('prop-driver.svg',300,70,driver(0,0))
    prop('prop-lens.svg',210,210,lensp(0,0,78))
def leads_unused():
    W,H=1200,820
    s=''
    def cable(d,c,hi):
        return f'<path d="{d}" stroke="#000" stroke-width="9" fill="none" stroke-linecap="round" opacity=".35" transform="translate(3 6)" filter="url(#sh)"/><path d="{d}" stroke="{c}" stroke-width="6" fill="none" stroke-linecap="round"/><path d="{d}" stroke="{hi}" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".5" transform="translate(-1.5 -1.5)"/>'
    s+=cable('M157 462C140 640 270 720 380 705','#15171a','#9aa')+cable('M195 462C230 640 330 690 430 642','#c0392b','#ff9a8a')
    for (x,y,a,c) in ((380,705,-6,'#15171a'),(430,642,-22,'#c0392b')):
        s+=g(x,y,a,1,f'<rect x="-4" y="-7" width="62" height="14" rx="7" fill="{c}"/><rect x="-4" y="-7" width="62" height="5" rx="3" fill="#fff" opacity=".28"/><rect x="58" y="-3.5" width="46" height="7" fill="url(#mH)"/><path d="M104 -3.5L132 -.8V.8L104 3.5Z" fill="url(#mH)"/>')
    w('prop-leads.svg',svg(W,H,s))
if __name__=='__main__': desk();props()
def extras():
    w('wood-tile.svg',svg(600,400,wood(600,400,'#4a2d19',31)+'<rect width="600" height="400" fill="#000" opacity=".25"/>'))
    prop('prop-psu.svg',340,160,psu(0,0,0,1,False))
if __name__=='__main__': extras()
