/* Electronics Repair Simulator: engine.
   Game data, job generation, circuit model, instruments, soldering, repair rules, scoring and save/import.
   Extracted unchanged from the original game; every old screen renderer has been removed.
   The interface lives in js/ui/*.js and talks to this file only through A.*, S, J and UI. */
'use strict';
const $=s=>document.querySelector(s),SAVE='ers_save_v1';
const P={fuse2A:['Fuse 2A',6,'fuse',2],cap100:['Capacitor 100µF',5,'cap',100],cap470:['Capacitor 470µF',8,'cap',470],cap1000:['Capacitor 1000µF',12,'cap',1000],res220:['Resistor 220Ω',2,'res',220],res1k:['Resistor 1kΩ',2,'res',1000],res10k:['Resistor 10kΩ',2,'res',10000],d4007:['Diode 1N4007',4,'dio',0],q3904:['Transistor 2N3904',7,'trn',0],r7805:['Regulator 7805',11,'reg',0],i555:['Timer IC 555',18,'ic',0]};
const POOL=['fuse2A','d4007','cap470','res1k','q3904','r7805','cap100','res10k','d4007','cap1000','i555','res220'];
const PF={fuse:'F',cap:'C',res:'R',dio:'D',trn:'Q',reg:'U',ic:'U'};
const MODES={fuse:['open'],cap:['bulge','leaky'],res:['burnt','drift'],dio:['short','dopen'],trn:['short'],reg:['dead'],ic:['dead']};
const VIS={open:0,bulge:0,burnt:0,leaky:1,drift:1,dead:1,short:2,dopen:2};
const LOOK={open:'The glass is blackened and the filament is gone.',bulge:'The top is domed and leaking brown residue.',burnt:'The body is scorched black.',leaky:'A faint crust surrounds the seal.',drift:'The color bands are browned by heat.',dead:'The package is slightly discolored.',short:'',dopen:''};
const SYM={open:'Dead: no power at all',bulge:'Supply ripple: hum and flicker',leaky:'Supply ripple: hum and flicker',burnt:'Bias path open: no output',drift:'Output level wrong and distorted',short:'Overcurrent: protection trips',dopen:'Rail collapses under load',dead:'No activity from the chip'};
const DEV=[['Phone Charger','won’t charge any phone'],['Desk Lamp Dimmer','flickers, then dies'],['Portable Radio','is silent'],['USB Hub','drops every device'],['Game Controller','won’t power on'],['Bluetooth Speaker','hums and cuts out'],['Wi-Fi Router','keeps rebooting'],['Guitar Amplifier','is completely dead'],['Monitor Power Board','clicks but stays black'],['Drone Controller','shuts off mid-flight']];
const SK={eyes:['Sharp Eyes',1,'Subtle damage becomes visible on the board and in inspection.'],data:['Datasheet Library',1,'The multimeter shows the expected reading beside each measurement.'],haggle:['Haggler',3,'Parts cost 10% less per rank.'],pay:['Reputation',3,'Jobs pay 10% more per rank.']};
const RANKS=['Apprentice','Bench Tech','Repair Tech','Senior Tech','Master Tech','Legend'];
const sh=k=>P[k][0].split(' ').pop(),fmt=v=>v>=1000?(v/1000)+'k':''+Math.round(v);
let S,J=null,UI={screen:'menu',tab:'inspect',sel:null,msg:'',lcd:'',res:null,busy:0,done:null};
const def=()=>({xp:0,rep:0,money:200,done:{},inv:{},sk:{},sp:0,hist:[],set:{snd:true,hint:true},tut:0,job:null});
function load(){try{S=Object.assign(def(),JSON.parse(localStorage.getItem(SAVE)||'{}'))}catch(e){S=def()}J=S.job||null}
function save(){S.job=J;try{localStorage.setItem(SAVE,JSON.stringify(S))}catch(e){}}
let AC;
function beep(f,d=.1){if(!S.set.snd)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),g=AC.createGain();o.frequency.value=f;g.gain.value=.05;o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+d)}catch(e){}}
function rng(s){return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function mk(id){
 const b=id[0]=='b',lv=+(b?id.slice(1):id),r=rng(lv*977+(b?31337:7)+SEED),n=Math.min(12,5+Math.floor((lv-1)/9)+(b?1:0));
 const pl=POOL.slice();for(let i=pl.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[pl[i],pl[j]]=[pl[j],pl[i]]}
 const cnt={},comps=pl.slice(0,n).map(k=>{const t=P[k][2],p=PF[t];cnt[p]=(cnt[p]||0)+1;return{ref:p+cnt[p],req:k,has:k,type:t,mode:null,cold:false}});
 let cand=comps.filter(c=>lv>=3||['fuse','cap','res'].includes(c.type));
 if(!cand.length){const c=comps[0];c.req=c.has='fuse2A';c.type='fuse';c.ref='F9';cand=[c]}
 for(let i=cand.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[cand[i],cand[j]]=[cand[j],cand[i]]}
 const k=Math.min(cand.length,5,1+Math.floor((lv-1)/12)+(b?1:0));
 cand.slice(0,k).forEach(c=>{if(lv>=15&&r()<.25)c.cold=true;else if(lv>=5&&r()<.2)c.dirt=true;else{const m=MODES[c.type];c.mode=m[Math.floor(r()*m.length)]}});
 return{id,lv,bonus:b,dev:DEV[(lv-1+(b?3:0))%10],comps,mist:0,log:{}};
}
const gc=ref=>J&&J.comps.find(c=>c.ref===ref);
function look0(c){if(!c.has)return'Empty pads, bare copper.';const t=[],m=c.mode,v=VIS[m];
 if(m&&(v==0||(v==1&&eyes())))t.push(LOOK[m]);if(c.cold&&eyes())t.push('The solder joints are dull and cracked.');
 if(c.dirt)t.push('Grime and corrosion coat the pins.');if(c.has!==c.req)t.push('Wrong marking. The board calls for '+sh(c.req)+'.');return t.length?t.join(' '):'Looks healthy.'}
function read0(c){const k=c.has;if(!k)return'No part: empty pads';if(c.cold||c.dirt)return'Unstable: flickers, then OL';const[,,t,v]=P[k],m=c.mode,j=1+((c.ref.charCodeAt(0)+c.ref.charCodeAt(1))%9-4)/100;
 if(t=='fuse')return m?'OL (open circuit)':'0.2 Ω continuity';
 if(t=='cap')return Math.round(v*(m=='bulge'?.3:m=='leaky'?.55:j))+' µF';
 if(t=='res')return m=='burnt'?'OL (open circuit)':fmt(v*(m=='drift'?1.8:j))+' Ω';
 if(t=='dio')return m=='short'?'0.00 V both ways (short)':m=='dopen'?'OL both ways (open)':'Fwd 0.58 V, reverse OL';
 if(t=='trn')return m=='short'?'C–E 0.4 Ω (short)':'B–E 0.65 V, C–E OL';
 if(t=='reg')return m?'Pins read 0.1 kΩ (internal fault)':'Pins read 1.2 kΩ';
 return m?'Pins read 0.1 kΩ (internal fault)':'Pins read 8.5 kΩ'}
function expect(c){const[,,t,v]=P[c.req];return{fuse:'under 1 Ω',cap:v+' µF ±20%',res:fmt(v)+' Ω ±5%',dio:'Fwd ≈0.6 V, reverse OL',trn:'C–E OL',reg:'≈1.2 kΩ',ic:'≈8.5 kΩ'}[t]}
const done=()=>Object.keys(S.done).filter(k=>k[0]!='b').length;
const next=()=>{for(let n=1;n<=60;n++)if(!S.done[n])return n;return 0};
const price=k=>Math.max(1,Math.round(P[k][1]*(1-.1*(S.sk.haggle||0))));
const A={};
A.buy=k=>{const c=price(k);if(S.money<c)return;S.money-=c;S.inv[k]=(S.inv[k]||0)+1;UI.msg='Bought '+P[k][0]+'.';beep(660);redraw()};
A.skill=k=>{if(S.sp<1||(S.sk[k]||0)>=SK[k][1])return;S.sp--;S.sk[k]=(S.sk[k]||0)+1;render()};
A.snd=()=>{S.set.snd=!S.set.snd;render()};
A.hint=()=>{S.set.hint=!S.set.hint;render()};
A.reset=()=>{if(confirm('Erase all progress?')){localStorage.removeItem(SAVE);S=def();J=null;go('menu')}};
function hist(j,win,earn,st){S.hist.unshift({n:({f:'Free ',p:'Practice ',c:'Challenge '}[j.mode]||(j.bonus?'Bonus ':'Level '))+j.lv,d:j.dev[0],win,earn,stars:st,t:new Date().toLocaleDateString()});S.hist.length=Math.min(S.hist.length,60)}
A.start=id=>{if(J&&J.id==id){go('job');return}if(J){if(!confirm('Abandon the current job? ($10 fee)'))return;S.money=Math.max(0,S.money-10);hist(J,false,0,0)}
 J=mk(id);UI.tab='inspect';UI.sel=null;UI.res=null;UI.lcd='';go('job')};
A.quit=()=>{if(!confirm('Give up this job? ($10 fee)'))return;S.money=Math.max(0,S.money-10);hist(J,false,0,0);J=null;go('levels')};
let SEED=0;
const eyes=()=>S.sk.eyes||UI.tool=='mag';
const TOOLS=[['scr','Screwdriver','Opens and closes the case. Tap the device or a corner screw.'],['twz','Tweezers','Places a part on empty pads. Select the empty spot, then choose the part.'],['mm','Multimeter','Probes a part and shows the reading in the banner.'],['iron','Soldering iron','Reflows the solder joints of a part.'],['mag','Magnifier','Reveals subtle damage and cracked joints on every part.'],['brush','Cleaning brush','Scrubs grime off pins and contacts.'],['wire','Jumper wire','Bridges a part for the next test. Tap again to remove it.'],['rem','Removal tool','Desolders a part and lifts it off the board.']];
const IC={scr:'<path d="M4 20l8-8M10 14l6-6 4 4-6 6z"/>',twz:'<path d="M7 21L11 3M17 21L13 3M11 3h2"/>',mm:'<rect x="6" y="3" width="12" height="18" rx="2"/><path d="M9 7h6M9 12h.1M15 12h.1M9 16h.1M15 16h.1"/>',iron:'<path d="M3 21l6-6M9 15l8-8 3 3-8 8zM17 7l3-3"/>',mag:'<circle cx="10" cy="10" r="6"/><path d="M15 15l6 6"/>',brush:'<path d="M5 21h8M7 21v-8h4v8M8 13l3-9 3 1-2 8"/>',wire:'<path d="M3 15c4-8 6 8 9 0s6 4 9-4"/>',rem:'<path d="M5 20l6-6M9 6h6l4 4-7 7M8 9l7 7"/>'};
const MN={f:'Free repair',p:'Practice',c:'Challenge'};
const CU=['Maria Santos','Tom Becker','Aisha Khan','Liam O’Neil','Chen Wei','Priya Nair','Diego Ramos','Hannah Berg','Omar Haddad','Yuki Tanaka','Grace Mwangi','Ivan Petrov'];
const DV=[
['Flashlight','flickers, then dies','FL',`<g transform="rotate(-12 180 125)"><rect x="50" y="105" width="170" height="40" rx="10" fill="#4a525a"/><path d="M220 95h45l30-24v108l-30-24h-45z" fill="#6b747d"/><ellipse cx="295" cy="125" rx="9" ry="52" fill="#ffe9a6"/><rect x="110" y="98" width="24" height="9" rx="3" fill="#ff9a2e"/></g>`],
['Toy Robot','won’t move or talk','TR',`<rect x="120" y="40" width="120" height="70" rx="12" fill="#c0392b"/><circle cx="153" cy="72" r="11" fill="#fff"/><circle cx="207" cy="72" r="11" fill="#fff"/><path d="M180 40V22" stroke="#aaa" stroke-width="4"/><circle cx="180" cy="18" r="6" fill="#ff9a2e"/><rect x="110" y="115" width="140" height="80" rx="10" fill="#2a6fb0"/><circle cx="135" cy="210" r="18" fill="#333"/><circle cx="225" cy="210" r="18" fill="#333"/>`],
['Desk Fan','spins slowly, then stops','FN',`<circle cx="180" cy="100" r="80" fill="none" stroke="#889" stroke-width="5"/><g fill="#5c9fd0"><ellipse cx="180" cy="62" rx="16" ry="34"/><ellipse cx="180" cy="62" rx="16" ry="34" transform="rotate(120 180 100)"/><ellipse cx="180" cy="62" rx="16" ry="34" transform="rotate(240 180 100)"/></g><circle cx="180" cy="100" r="12" fill="#333"/><rect x="170" y="180" width="20" height="38" fill="#555"/><rect x="130" y="216" width="100" height="14" rx="6" fill="#444"/>`],
['USB Cable','charges only when wiggled','UC',`<path d="M70 190C70 60 290 60 290 170" fill="none" stroke="#2b2b2b" stroke-width="9"/><rect x="48" y="190" width="44" height="36" rx="4" fill="#9aa"/><rect x="58" y="226" width="24" height="12" fill="#ddd"/><rect x="268" y="168" width="44" height="30" rx="4" fill="#9aa"/><rect x="276" y="198" width="28" height="10" fill="#ddd"/>`],
['Earphones','has no sound','EP',`<path d="M180 22v38M180 60C110 60 90 130 100 170M180 60C250 60 270 130 260 170" fill="none" stroke="#e8e8e8" stroke-width="5"/><ellipse cx="100" cy="185" rx="18" ry="24" fill="#f4f4f4"/><ellipse cx="260" cy="185" rx="18" ry="24" fill="#f4f4f4"/><rect x="172" y="8" width="16" height="14" fill="#bbb"/>`],
['Bluetooth Speaker','hums and cuts out','SP',`<rect x="105" y="25" width="150" height="200" rx="18" fill="#2b2f35" stroke="#555" stroke-width="3"/><circle cx="180" cy="75" r="24" fill="#111" stroke="#777"/><circle cx="180" cy="160" r="48" fill="#111" stroke="#777" stroke-width="3"/><circle cx="180" cy="160" r="18" fill="#444"/><circle cx="235" cy="45" r="5" fill="#3ddc84"/>`],
['Portable Radio','is silent','RD',`<rect x="50" y="80" width="260" height="140" rx="14" fill="#8a5a33"/><circle cx="125" cy="150" r="46" fill="#222" stroke="#bbb" stroke-width="3"/><path d="M95 150h60M110 130h30M110 170h30" stroke="#666"/><rect x="195" y="108" width="95" height="26" fill="#d9c9a0"/><path d="M205 121h75" stroke="#a33"/><circle cx="215" cy="180" r="14" fill="#ddd"/><circle cx="262" cy="180" r="14" fill="#ddd"/><path d="M270 80L320 15" stroke="#aaa" stroke-width="4"/>`],
['Power Bank','won’t charge or discharge','PB',`<rect x="120" y="30" width="120" height="190" rx="18" fill="#3b4a5a"/><rect x="140" y="55" width="80" height="14" rx="5" fill="#111"/><g fill="#3ddc84"><rect x="140" y="90" width="14" height="14"/><rect x="160" y="90" width="14" height="14"/><rect x="180" y="90" width="14" height="14"/></g><rect x="160" y="205" width="40" height="10" fill="#111"/>`],
['Phone Charger','won’t charge any phone','CH',`<rect x="120" y="60" width="120" height="110" rx="12" fill="#e8e8e8"/><rect x="150" y="30" width="10" height="30" fill="#bbb"/><rect x="200" y="30" width="10" height="30" fill="#bbb"/><rect x="165" y="170" width="30" height="12" fill="#ccc"/><path d="M180 182v28c0 22 40 10 60 28" stroke="#ddd" stroke-width="6" fill="none"/>`],
['Smartphone','keeps rebooting','SM',`<rect x="130" y="10" width="100" height="230" rx="16" fill="#1d2127" stroke="#8892a0" stroke-width="3"/><rect x="138" y="30" width="84" height="190" rx="4" fill="#2a5d7a"/><circle cx="180" cy="20" r="3" fill="#555"/><circle cx="180" cy="232" r="5" fill="none" stroke="#777"/>`],
['Tablet','is stuck on a black screen','TB',`<rect x="60" y="30" width="240" height="190" rx="14" fill="#1d2127" stroke="#8892a0" stroke-width="3"/><rect x="76" y="44" width="208" height="162" rx="4" fill="#2a5d7a"/><circle cx="68" cy="125" r="3" fill="#555"/>`],
['Laptop','shuts off after a minute','LT',`<path d="M90 40h180l12 130H78z" fill="#1d2127" stroke="#8892a0" stroke-width="3"/><path d="M100 50h160l9 110H91z" fill="#2a5d7a"/><path d="M50 172h260l16 40H34z" fill="#6b747d"/><rect x="150" y="190" width="60" height="12" rx="4" fill="#444"/>`],
['Monitor','flickers and goes dark','MT',`<rect x="50" y="25" width="260" height="160" rx="8" fill="#1d2127" stroke="#8892a0" stroke-width="3"/><rect x="62" y="37" width="236" height="132" fill="#2a5d7a"/><rect x="165" y="185" width="30" height="35" fill="#555"/><rect x="125" y="218" width="110" height="12" rx="5" fill="#444"/>`],
['Television','clicks but stays black','TV',`<rect x="30" y="30" width="300" height="170" rx="6" fill="#111" stroke="#667" stroke-width="4"/><rect x="42" y="42" width="276" height="140" fill="#274c6b"/><path d="M80 200l-12 30M280 200l12 30" stroke="#667" stroke-width="6"/><circle cx="180" cy="192" r="3" fill="#3ddc84"/>`],
['Wi-Fi Router','keeps rebooting','RT',`<path d="M110 90V20M180 90V10M250 90V20" stroke="#222" stroke-width="9" stroke-linecap="round"/><rect x="50" y="90" width="260" height="70" rx="10" fill="#2b2f35" stroke="#555" stroke-width="3"/><g fill="#3ddc84"><circle cx="90" cy="125" r="5"/><circle cx="115" cy="125" r="5"/><circle cx="140" cy="125" r="5"/></g><circle cx="165" cy="125" r="5" fill="#ff9a2e"/><rect x="200" y="140" width="90" height="10" fill="#111"/>`],
['Printer','won’t feed paper','PR',`<rect x="60" y="90" width="240" height="100" rx="10" fill="#cfd4d9"/><rect x="95" y="50" width="170" height="44" fill="#fff" stroke="#999"/><rect x="95" y="160" width="170" height="14" fill="#444"/><rect x="85" y="190" width="190" height="40" fill="#fff" stroke="#999"/><circle cx="270" cy="115" r="5" fill="#3ddc84"/>`],
['Drone','shuts off in flight','DR',`<path d="M110 60L250 190M250 60L110 190" stroke="#2b2f35" stroke-width="10"/><rect x="148" y="100" width="64" height="50" rx="12" fill="#c0392b"/><g fill="#8ab"><ellipse cx="100" cy="52" rx="42" ry="9"/><ellipse cx="260" cy="52" rx="42" ry="9"/><ellipse cx="100" cy="198" rx="42" ry="9"/><ellipse cx="260" cy="198" rx="42" ry="9"/></g><circle cx="180" cy="130" r="9" fill="#111"/>`],
['Motherboard','does not post','MB',`<rect x="60" y="15" width="240" height="220" rx="6" fill="#1f6b46" stroke="#0b2a1a" stroke-width="3"/><rect x="100" y="55" width="80" height="80" fill="#9aa" stroke="#667"/><rect x="108" y="63" width="64" height="64" fill="#555"/><g fill="#222"><rect x="220" y="30" width="10" height="110"/><rect x="238" y="30" width="10" height="110"/><rect x="256" y="30" width="10" height="110"/></g><g fill="#3b5bb0"><circle cx="90" cy="170" r="10"/><circle cx="120" cy="170" r="10"/><circle cx="150" cy="170" r="10"/></g><rect x="80" y="205" width="140" height="14" fill="#ddd"/>`]];
const plv=()=>1+Math.floor(S.xp/150);
const payBase=j=>Math.round((60+j.lv*12)*(j.bonus?1.5:1)*(j.mode?{f:.8,p:0,c:2}[j.mode]:1)*(1+.1*(S.sk.pay||0))*(1+Math.min(.25,S.rep*.01)));
const clock=t=>{const s=Math.max(0,Math.ceil((t-Date.now())/1000));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
function dec(j){const i=Math.min(17,Math.floor((j.lv-1)*.29)+(j.lv%2)+(j.bonus?1:0)),r=rng(j.lv*31+i);j.di=i;j.cust=CU[Math.floor(r()*CU.length)];j.model=DV[i][2]+'-'+(100+Math.floor(r()*900));j.dev=[DV[i][0],DV[i][1]]}
A.tool=t=>{UI.tool=t;UI.msg='';beep(500,.05);redraw()};
A.help=()=>{const b=J.comps.find(c=>!c.has||c.has!==c.req||c.mode||c.cold||c.dirt||c.corr);if(!b){UI.msg='Hint: every part looks right. Close the case and run the power test.';redraw();return}
 J.hints=(J.hints||0)+1;const N={fuse:'fuse',cap:'capacitor',res:'resistor',dio:'diode',trn:'transistor',reg:'regulator',ic:'chip'};
 UI.msg=J.hints<2?(b.cold||b.dirt||b.corr?'Hint: something has poor contact. Look closely at joints and pins.':!b.has?'Hint: a part is missing from the board.':'Hint: suspect a '+(TYN[b.type]||'part').toLowerCase()+' on this board.'):'Hint: check '+b.ref+' closely.';redraw()};
function win(){const st=J.mist==0?3:J.mist<=2?2:1,m=J.mode,e=Math.round(payBase(J)*[0,1,1.1,1.25][st]*(1-.1*Math.min(3,J.hints||0))),xp=Math.round((30+J.lv*5)*st*(m=='p'?0:m=='f'?.5:m=='c'?1.5:1)),l0=plv();let sp=0;
 if(!m){const prev=S.done[J.id]||0;if(!prev)sp++;if(st==3&&prev<3)sp++;S.sp+=sp;S.done[J.id]=Math.max(prev,st)}
 S.money+=e;S.xp+=xp;if(m!='p')S.rep+=st+(m=='c'?2:0);hist(J,true,e,st);UI.done={st,earn:e,sp,bonus:J.bonus};J=null;go('result');UI.msg='+'+xp+' XP'+(plv()>l0?'. Level up! You are now level '+plv()+'.':'');redraw()}
function mode(m){if(J){if(!confirm('Abandon the current job? ($10 fee)'))return;S.money=Math.max(0,S.money-10);hist(J,false,0,0)}
 const d=done(),L=m=='c'?Math.min(60,d+1):1+Math.floor(Math.random()*Math.min(60,m=='p'?Math.max(2,Math.ceil((d+1)/2)):d+1));
 SEED=1+Math.floor(Math.random()*99999);J=mk(String(L));J.seed=SEED;SEED=0;J.id=m;J.mode=m;if(m=='c')J.dl=Date.now()+(240+J.comps.length*20)*1000;dec(J);UI.tool='scr';UI.res=null;UI.sel=null;go('job')}
A.free=()=>mode('f');
A.prac=()=>mode('p');
A.chal=()=>mode('c');
{const os=A.start;A.start=id=>{os(id);if(J&&!J.cust){dec(J);UI.tool='scr';render()}}}
setInterval(()=>{if(!J||!J.dl)return;const e=$('#tm');if(e)e.textContent=clock(J.dl);if(Date.now()>=J.dl){hist(J,false,0,0);S.rep=Math.max(0,S.rep-2);J=null;go('workshop');UI.msg='Time is up. The customer collected the device.';redraw()}},1000);
`el100|Electrolytic 100µF/16V|4|ecap
el470|Electrolytic 470µF/16V|7|ecap
el470lv|Electrolytic 470µF/6.3V|6|ecap
cc100n|Ceramic 100nF|2|ccap
cc10n|Ceramic 10nF|2|ccap
led_w|LED white|3|led
led_r|LED red|3|led
zen51|Zener 5.1V|4|zen
zen33|Zener 3.3V|4|zen
mos_n|MOSFET N-ch 30V|8|mos
mos_p|MOSFET P-ch 20V|8|mos
ind10|Inductor 10µH|5|ind
ind47|Inductor 47µH|5|ind
xfm12|Transformer 12V|16|xfm
rly5|Relay 5V|9|rly
swt1|Switch SPST|4|swt
bat18|Li-ion 3.7V|15|bat
bat74|Li-ion 7.4V|24|bat
con10|Connector 10-pin|5|con
con6|Connector 6-pin|4|con
usbc|Port USB-C|8|usb
usbm|Port Micro-USB|6|usb
chg|Charger IC TP4056|12|chg
mcu8|MCU 8-bit|20|mcu
spk8|Speaker 8Ω|9|spk
spk4|Speaker 4Ω|9|spk
mic1|Microphone electret|6|mic
mot1|DC motor 6V|14|mot
sen1|Sensor module|8|sen
osc8|Oscillator 8MHz|7|osc
xtl16|Crystal 16MHz|5|xtl
xtl8|Crystal 8MHz|5|xtl
scn_s|Display 5.5in|40|scn
scn_l|Display 10in|55|scn`.split('\n').forEach(l=>{const[k,n,c,t]=l.split('|');P[k]=[n,+c,t,0]});
Object.defineProperty(P,'trc',{value:['Trace',0,'trc',0],enumerable:false});
Object.assign(PF,{ecap:'C',ccap:'C',led:'LD',zen:'ZD',mos:'Q',ind:'L',xfm:'T',rly:'K',swt:'SW',bat:'BT',con:'J',usb:'J',chg:'U',mcu:'U',spk:'LS',mic:'MK',mot:'M',sen:'S',osc:'Y',xtl:'X',trc:'TR',scn:'LCD'});
const TYN={},FN={},MEAS={},OKR={},POL={},RD={},FIX={},TRIP={};
`fuse|Fuse|Protects the circuit from overcurrent|Continuity|-|0
cap|Capacitor|Stores charge and filters the supply|Capacitance|-|0
res|Resistor|Limits current|Resistance|-|0
dio|Diode|Passes current one way only|Diode test|-|1
trn|Transistor|Amplifies or switches signals|Junction test|-|0
reg|Voltage regulator|Holds a steady rail voltage|Pin resistance|-|0
ic|Timer IC|Generates timing pulses|Pin resistance|-|0
ecap|Electrolytic capacitor|Smooths the supply and absorbs ripple|Capacitance and ESR|Rated capacitance, low ESR|1
ccap|Ceramic capacitor|Filters high-frequency noise|Capacitance, continuity|Rated capacitance, no short|0
led|LED|Shows status with light|Diode test|Fwd 1.9 V, reverse OL|1
zen|Zener diode|Clamps a rail to a fixed voltage|Diode test|Fwd 0.7 V, blocks below rated voltage|1
mos|MOSFET|Switches power on and off|Diode test, drain-source|D–S OL, gate OL|0
ind|Inductor|Stores energy in the power stage|Winding resistance|Winding 0.3 Ω|0
xfm|Transformer|Steps the voltage down|Primary and secondary resistance|Primary 40 Ω, secondary 0.5 Ω|0
rly|Relay|Switches a load with a coil|Coil resistance, contacts|Coil 70 Ω, contacts open at rest|0
swt|Switch|Turns the circuit on and off|Continuity|Closed 0.1 Ω, open OL|0
bat|Battery|Powers the device|Cell voltage|3.7 V under load|1
con|Connector|Joins boards and cables|Continuity per pin|All pins 0.2 Ω|0
usb|USB port|Takes power and data in|Pin continuity, VBUS|VBUS 5 V, pins 0.3 Ω|0
chg|Charging IC|Controls battery charging|Pin resistance|Pins read 2.2 kΩ|0
mcu|Microcontroller|Runs the device logic|Pin resistance|Pins read 12 kΩ|0
spk|Speaker|Turns signal into sound|Coil resistance|Coil 8 Ω|0
mic|Microphone|Turns sound into signal|Bias voltage|Bias 2.0 V, small AC output|1
mot|Motor|Provides motion|Winding resistance|Winding 6 Ω|0
sen|Sensor|Detects a physical input|Output voltage|Output follows the input|0
osc|Oscillator|Supplies a clock signal|Output signal|Clock present at the output pin|0
xtl|Crystal|Sets a precise frequency|Ring test|Rings at the rated frequency|0
trc|PCB trace|Carries current between parts|Continuity|Continuity 0.1 Ω|0
scn|Display panel|Shows the image|Backlight and pixel test|Backlight on, no dead lines|0`.split('\n').forEach(l=>{const[t,n,f,m,o,p]=l.split('|');TYN[t]=n;FN[t]=f;MEAS[t]=m;if(o!='-')OKR[t]=o;if(p=='1')POL[t]=1});
`edry|ecap|1|The seal is crusty and the top is slightly bulged.|30% capacity, ESR very high|Supply ripple: hum and flicker|r|0
ebulge|ecap|0|The vent on top has popped and leaks.|10% capacity, ESR very high|Supply collapses under load|r|0
ccrack|ccap|1|A hairline crack runs across the body.|Shorted (0.2 Ω)|Overcurrent: protection trips|r|1
ledopen|led|0|The die is dark and the lens is clouded.|OL both ways (open)|Indicator never lights|r|0
zshort|zen|2||0.00 V both ways (short)|Rail clamped to ground|r|1
mshort|mos|2||D–S 0.3 Ω (short)|Overcurrent: protection trips|r|1
mgate|mos|2||Gate leaks to source (2 kΩ)|Output stuck off|r|0
iopen|ind|1|The winding is discolored.|OL (open winding)|Power stage dead: no rail|r|0
xopen|xfm|2||Primary OL (open winding)|No secondary voltage|r|0
xburn|xfm|0|The case is scorched and smells burnt.|Primary 0.3 Ω (shorted turns)|Overcurrent: protection trips|r|1
rstuck|rly|2||Contacts read 0 Ω at rest (welded)|Load stays on|r|0
rcoil|rly|2||Coil OL (open)|Relay never clicks|r|0
sbroke|swt|0|The lever is snapped off.|OL in every position|Switch does nothing|r|0
bdead|bat|2||0.9 V (under 3 V)|Won’t hold a charge|r|0
bswell|bat|0|The cell is swollen and puffy.|3.1 V and sagging|Dies as soon as a load is applied|r|0
bwire|bat|1|A lead is frayed near the tab.|OL at the lead, 3.8 V at the cell|Intermittent power|w|0
cbent|con|0|Several pins are bent out of line.|Pins 3 and 4 shorted|Board link fails|r|0
cloose|con|1|The cable is not fully seated.|Pin 2 intermittent|Cuts out when tapped|c|0
ubent|usb|0|The port shell is bent and the tongue is crooked.|VBUS OL when plugged in|Cable won’t seat: no charge|r|0
cdead|chg|1|The package is hot-spotted and discolored.|Pins read 0.1 kΩ|Battery never charges|r|0
mdead|mcu|2||Pins read 0.1 kΩ (internal fault)|Device never boots|r|0
spkopen|spk|2||OL (open voice coil)|No sound|r|0
spkwire|spk|1|A lead is frayed at the terminal.|Unstable 8 Ω, drops to OL|Crackling, cuts out|w|0
micdead|mic|2||Bias 0 V, no output|Voice not picked up|r|0
motburn|mot|0|The windings are dark and smell burnt.|Winding OL|Motor never spins|r|0
motwire|mot|1|A lead is frayed at the brush holder.|Winding unstable, flickers to OL|Motor stutters|w|0
sendead|sen|2||Output stuck at 0 V|Input never detected|r|0
oscdead|osc|2||No clock at the output pin|Chip never starts|r|0
xtlcrack|xtl|1|The can has a hairline crack.|Ring test fails|Erratic timing, random resets|r|0
trcbreak|trc|1|A hairline break cuts the trace.|OL across the trace|Part of the circuit is dead|t|0
scrack|scn|0|The glass is cracked across the panel.|Dark lines and dead zones|Black lines across the picture|r|0
sback|scn|2||Image barely visible, no backlight|Image is barely visible|r|0
pdmg|*|0|A part was cracked by a slip of the tool.|Physically cracked|Part damaged during the repair|r|0`.split('\n').forEach(l=>{const[m,t,v,lk,rd,sy,fx,tr]=l.split('|');(MODES[t]=MODES[t]||[]).push(m);VIS[m]=+v;LOOK[m]=lk;RD[m]=rd;SYM[m]=sy;FIX[m]=fx;if(tr=='1')TRIP[m]=1});
const SZ=['usb','con','scn','spk','mot','bat'];
const STP={S:['Remove the case screws','scr'],C:['Pry off the back cover','rem'],B:['Disconnect the battery','twz'],H:['Lift the protective shield','iron'],R:['Unlatch the ribbon cable','twz']};
const OPS=['SB','SCB','SC','C','C','SCB','SCB','CB','C','SCBHR','SCBR','SCBH','SCR','SCR','SC','SCR','SCB','SH'];
const DC=['bat18 swt1 led_w res220 trc fuse2A el100 d4007 q3904','bat18 mot1 swt1 spk8 mcu8 res1k trc led_w q3904 el100 d4007','xfm12 mot1 swt1 fuse2A d4007 el470 res1k trc rly5 cc100n','usbc usbm trc res10k cc100n fuse2A','spk4 mic1 swt1 trc res10k cc100n con10','bat18 chg usbc spk8 mcu8 xtl16 el470 res1k led_w trc','xfm12 spk8 swt1 ind10 el470 d4007 q3904 res10k cc100n trc','bat18 chg usbc ind10 mos_n el100 res1k led_w trc fuse2A zen51','xfm12 d4007 el470 fuse2A zen51 res1k mos_n trc usbc cc100n','bat18 chg usbc mcu8 xtl16 scn_s spk4 mic1 con10 res10k cc100n trc','bat18 chg usbc mcu8 osc8 scn_l spk4 con10 ind10 res10k cc100n trc','bat18 chg usbc mcu8 osc8 scn_l mos_n ind10 el470 con10 sen1 trc','xfm12 scn_l fuse2A d4007 el470 mos_n r7805 con10 res1k swt1 trc','xfm12 scn_l fuse2A d4007 el470 mos_n r7805 con10 sen1 rly5 trc','xfm12 r7805 mcu8 xtl16 led_w el470 d4007 con10 res1k ind10 trc','xfm12 mot1 sen1 rly5 fuse2A mcu8 d4007 el470 q3904 con10 trc','bat18 mot1 chg mcu8 osc8 mos_n sen1 ind10 res1k led_w con10 trc','r7805 mcu8 osc8 xtl16 ind10 el470 mos_n con10 cc100n res10k zen51 trc'].map(s=>s.replace(/scn_l/g,'scn_l'));
DC[3]=DC[3].replace('usbm','con6');
const isOn=k=>{const i=J.ops.indexOf(k);return i>=0&&!J.rm[i]},acc=j=>j.ops.every((k,i)=>!'SC'.includes(k)||j.rm[i]);
function build(j){const r=rng(j.lv*977+(j.bonus?31337:7)+(j.seed||0)+5),ks=DC[j.di].split(' '),n=Math.min(ks.length,5+Math.floor((j.lv-1)/9)+(j.bonus?1:0)),cnt={};
 j.ops=[...OPS[j.di]];j.rm=[...j.ops].map(()=>false);j.ever=j.rm.slice();
 j.comps=ks.slice(0,n).map(k=>{const t=P[k][2],p=PF[t];cnt[p]=(cnt[p]||0)+1;const pl=r()<.5?'L':'R';return{ref:p+cnt[p],req:k,has:k,type:t,mode:null,cold:false,dirt:false,corr:false,pl,o:pl,sh:j.ops.includes('H')&&['mcu','chg','osc','xtl','ic','reg'].includes(t),mk:0,rep:0}});
 let cand=j.comps.filter(c=>MODES[c.type]&&MODES[c.type].some(m=>j.lv>=3||VIS[m]==0));if(!cand.length)cand=[j.comps[0]];
 for(let i=cand.length-1;i>0;i--){const x=Math.floor(r()*(i+1));[cand[i],cand[x]]=[cand[x],cand[i]]}
 cand.slice(0,Math.min(cand.length,5,1+Math.floor((j.lv-1)/12)+(j.bonus?1:0))).forEach(c=>{let ms=MODES[c.type].filter(m=>j.lv>=3||VIS[m]==0);if(!ms.length)ms=MODES[c.type];
  if(j.lv>=15&&c.type!='trc'&&r()<.2)c.cold=true;else if(j.lv>=8&&['bat','con','usb'].includes(c.type)&&r()<.3)c.corr=true;else if(j.lv>=5&&c.type!='trc'&&r()<.2)c.dirt=true;else c.mode=ms[Math.floor(r()*ms.length)]});
 j.v3=1;j.open=acc(j);if(j.open)j.opened=1}
function look(c){const b=look0(c);if(c.sh&&isOn('H'))return'Hidden under the protective shield.';const x=c.corr&&c.has?'Green-white corrosion crusts the pins. ':'';return x+(x&&b=='Looks healthy.'?'':b)}
function read(c){if(!c.has)return'No part: empty pads';if(c.cold||c.dirt)return'Unstable: flickers, then OL';if(c.corr)return'60 Ω: corroded contacts';return RD[c.mode]||OKR[c.type]||read0(c)}
const xp3=c=>OKR[c.type]||expect(c);
function cstate(c){if(!c.has)return'Removed';if(c.mode=='pdmg')return'Damaged by player';if(c.rep&&!c.mode&&!c.cold&&!c.dirt&&!c.corr)return c.rep=='replaced'?'Replaced':'Repaired';return['Normal','Suspected','Faulty'][c.mk||0]}
function gate(c,t){if(!J.open)return'Open the device first.';
 if(c.sh&&isOn('H'))return'The protective shield covers this part. Lift it first with the soldering iron.';
 if(['iron','rem','wire','twz'].includes(t)){
  if(isOn('B')){J.mist++;let m='Sparks! The battery is still connected. Disconnect it before working on the board. Mistake recorded.';
   if(J.lv>=10){const a=J.comps.filter(x=>x.has&&x.type!='trc'&&!x.mode);if(a.length){const d=a[Math.floor(Math.random()*a.length)];d.mode='pdmg';m+=' A short damaged '+d.ref+'.'}}return m}
  if(['scn','con'].includes(c.type)&&isOn('R'))return'Unlatch the ribbon cable first (tweezers).'}
 return''}
function chk(c,k,o,rep){if(c.has&&!rep)return'Remove the old part first.';if(c.type=='trc')return'PCB traces are repaired, not replaced.';
 if(!(J.mode=='p'||S.inv[k]>0))return'You do not have that part.';
 if(P[k][2]!=c.type)return`Wrong type: this position takes a ${TYN[c.type].toLowerCase()}, but ${P[k][0]} is a ${TYN[P[k][2]].toLowerCase()}.`;
 if(k!=c.req)return`${SZ.includes(c.type)?'Wrong size or connector':'Incorrect specification'}: the board needs ${P[c.req][0]}, but this is ${P[k][0]}.`;
 if(POL[c.type]&&o!=c.pl)return`Wrong polarity: the board marks + on the ${c.pl=='L'?'left':'right'}. A reversed part would be destroyed.`;
 if(c.corr)return'The pads are corroded. Clean the corrosion first (brush).';return''}
function rmCore(c){if(c.type=='trc')return'PCB traces cannot be removed. Repair them instead.';if(!c.has)return'Nothing is fitted on these pads.';const g=gate(c,'rem');if(g)return g;
 let m;if(c.mode)m='Removed the faulty '+P[c.has][0]+'. It was scrapped.';else{S.inv[c.has]=(S.inv[c.has]||0)+1;m='Removed '+P[c.has][0]+'. The good part went back to your parts bin.'}
 c.has=null;c.mode=null;c.cold=false;c.jump=false;c.rep=0;J.fixed=1;UI.res=null;beep(300);return m}
function exec(c,a){const m=c.mode,ok=s=>{J.fixed=1;UI.res=null;c.rep='repaired';beep(600);return s};
 if(a=='corr')return c.corr?(c.corr=false,ok('Cleaned the corrosion off '+c.ref+'.')):'No corrosion on '+c.ref+'.';
 if(a=='clean')return c.dirt?(c.dirt=false,ok('Cleaned '+c.ref+'.')):'Nothing to clean on '+c.ref+'.';
 if(!c.has)return'There is no part at '+c.ref+' to work on.';
 if(a=='solder')return c.cold?(c.cold=false,ok('Reflowed the joints on '+c.ref+'.')):'The joints on '+c.ref+' are already good.';
 const n={wire:'w',trace:'t',reconn:'c'}[a];if(FIX[m]!=n)return{wire:'No broken lead on ',trace:'The trace is intact at ',reconn:'The cable is already seated at '}[a]+c.ref+'.';
 c.mode=null;return ok({wire:'Spliced and soldered the broken lead.',trace:'Bridged the break with a soldered jumper wire.',reconn:'Reseated the cable fully.'}[a])}
A.do=a=>{const[ref,ac]=a.split('|'),c=gc(ref);UI.tool={clean:'brush',corr:'brush',solder:'iron',wire:'wire',trace:'wire',reconn:'twz',rm:'rem'}[ac];UI.sel=ref;const g=gate(c,UI.tool);UI.msg=g||(ac=='rm'?rmCore(c):exec(c,ac));redraw()};
A.pick=ref=>{const c=gc(ref),t=UI.tool;UI.sel=ref;UI.msg='';
 if(t=='mm'||t=='mag'){const g=gate(c,'x');if(g)UI.msg=g;else if(t=='mm'){const r=read(c);J.log[ref]=r;UI.msg='Multimeter on '+ref+': '+r+(S.sk.data?' (expected '+xp3(c)+')':'');beep(520,.06)}else{J.mag=1;UI.msg='Magnifier: '+look(c)}}
 else if(t=='wire'&&!['bat','spk','mot','trc'].includes(c.type)){const g=gate(c,'wire');if(g)UI.msg=g;else{c.jump=!c.jump;UI.res=null;UI.msg=c.jump?'Jumper wire fitted across '+ref+'.':'Jumper removed from '+ref+'.'}}
 else if(t=='twz'&&c.type!='con')UI.msg=c.has?'Tweezers reseat connectors or place parts on empty pads.':'Choose a part below to place it.';
 else if(t=='scr')UI.msg='The screwdriver is for the case screws. Pick another tool for components.';
 else{A.do(ref+'|'+({brush:c.corr?'corr':'clean',iron:'solder',wire:c.type=='trc'?'trace':'wire',twz:'reconn',rem:'rm'}[t]));return}
 redraw()};
A.rm=ref=>{UI.msg=rmCore(gc(ref));redraw()};
A.reflow=ref=>{UI.msg=exec(gc(ref),'solder');redraw()};
A.inst=a=>{const[ref,k,o]=a.split('|'),c=gc(ref);if(!c)return;const e=gate(c,'twz')||chk(c,k,o);if(e){UI.msg=(e.startsWith('Sparks')||e.includes('first')||e.startsWith('Open')?'':'Invalid: ')+e;beep(150);redraw();return}
 if(J.mode!='p')S.inv[k]--;c.has=k;c.mode=null;c.cold=false;c.dirt=false;c.jump=false;c.o=o||c.pl;c.rep='replaced';J.fixed=1;UI.res=null;UI.msg='Installed '+P[k][0]+' at '+ref+'.';beep(600);redraw()};
A.rep=a=>{const[ref,k,o]=a.split('|'),c=gc(ref),e=chk(c,k,o,1);if(e){UI.msg='Invalid: '+e;beep(150);redraw();return}
 const m=rmCore(c);if(!c.has)A.inst(a);else{UI.msg=m;redraw()}};
A.mark=ref=>{const c=gc(ref);c.mk=((c.mk||0)+1)%3;redraw()};
A.read=()=>{J.read=1;redraw()};
A.ext=()=>{J.vis=1;const o=J.comps.filter(c=>['scn','usb','swt','led','spk','mic'].includes(c.type)&&c.has&&(c.corr||(c.mode&&VIS[c.mode]==0))).map(c=>c.ref+': '+(c.mode&&VIS[c.mode]==0?LOOK[c.mode]:'corrosion is visible in the opening.'));UI.msg='Exterior check: '+(o.length?o.join(' '):'no visible damage from the outside.');redraw()};
A.step=i=>{i=+i;const o=J.ops,r=J.rm,tl=STP[o[i]][1],out=r[i],nm=x=>STP[o[x]][0].toLowerCase(),p=out?o.findIndex((x,j)=>j>i&&r[j]):o.findIndex((x,j)=>j<i&&!r[j]);
 if(p>=0)UI.msg=out?'Refit in reverse order. First undo: '+nm(p)+'.':'Not yet. First: '+nm(p)+'.';
 else if(UI.tool!=tl){J.mist++;let m='Wrong tool: this step needs the '+TOOLS.find(t=>t[0]==tl)[1].toLowerCase()+'. Mistake recorded.';
  if(J.lv>=20){const a=J.comps.filter(c=>c.has&&c.type!='trc'&&!c.mode);if(a.length){const d=a[Math.floor(Math.random()*a.length)];d.mode='pdmg';m+=' You slipped and damaged '+d.ref+'.'}}UI.msg=m;beep(150)}
 else{r[i]=!out;if(!out)J.ever[i]=true;J.open=acc(J);if(J.open)J.opened=1;UI.res=null;UI.msg=(out?'Refitted: ':'Done: ')+nm(i)+'.';beep(450)}
 redraw()};
A.screw=()=>{if(!J)return;let i=J.ops.findIndex((x,j)=>!J.rm[j]);if(i<0)i=J.ops.length-1;A.step(i)};
A.test=()=>{if(!J||UI.busy)return;const o=J.rm.findIndex((x,j)=>x&&'BR'.includes(J.ops[j]));if(o>=0){UI.msg='Cannot power it up: '+(J.ops[o]=='B'?'the battery is disconnected':'the display ribbon is unlatched')+'. Refit it first, then test. You can test with the case still open.';redraw();return}
 UI.busy=1;UI.res=null;UI.msg='';redraw();setTimeout(()=>{if(!J)return;const f=[],note=[];let tr=0;
 J.comps.forEach(c=>{const bad=!c.has||c.mode||c.cold||c.dirt||c.corr;
  if(c.jump){note.push('Jumper on '+c.ref+(bad?' cleared a symptom.':' changed nothing.'));f.push('Jumper wire still fitted at '+c.ref);return}
  if(!c.has)f.push('Missing part at '+c.ref);else{if(c.mode)f.push(SYM[c.mode]+' ('+c.ref+')');if(c.mode=='short'||TRIP[c.mode])tr=1;if(c.cold)f.push('Intermittent contact at '+c.ref);if(c.dirt)f.push('Dirty contacts at '+c.ref);if(c.corr)f.push('Corroded contacts at '+c.ref);if(c.bridge){f.push('Solder bridge short at '+c.ref);tr=1}if(c.padx)f.push('Damaged pad at '+c.ref);if(c.js&&Object.values(c.js).includes('new'))f.push(c.ref+' is not soldered')}});
 J.tested=1;UI.busy=0;UI.res={f:f.concat(note),ok:!f.length};
 if(tr&&J.mode!='p'){S.money=Math.max(0,S.money-25);J.mist++;UI.msg='Protection tripped on a short. Repair bill: $25.'}
 beep(UI.res.ok?880:180,.3);if(UI.res.ok&&J.rm.every(x=>!x))win();else{if(UI.res.ok)UI.msg='Live test passed with the case still open. Refit everything to complete the job.';redraw()}},900)};
function stages(){const j=J,n=Object.keys(j.log).length;return[['Receive the device',1],['Read the customer complaint',j.read],['Inspect the exterior',j.vis],['Open the device',j.opened],['Disconnect battery, shield and cables',j.ops.every((k,i)=>'SC'.includes(k)||j.ever[i])],['Inspect internal parts',j.mag],['Use diagnostic tools ('+n+' probed)',n>0],['Identify the faulty part',j.comps.some(c=>c.mk==2)],['Repair or replace',j.fixed],['Reassemble the device',j.fixed&&j.rm.every(x=>!x)],['Run the functional test',j.tested],['Complete the job',0]]}
TOOLS.push(['psu','Bench supply','Powers the board with an adjustable voltage and a current limit.'],['usb','USB tester','Reads the voltage and current at a USB port.'],['bat','Battery tester','Checks the voltage and health of a battery cell.'],['therm','Thermal camera','Shows hot spots on a powered board. Unlocks after 20 career levels.'],['scope','Oscilloscope','Draws the waveform at a probe point. Unlocks after 30 career levels.']);
Object.assign(IC,{psu:'<rect x="4" y="6" width="16" height="12" rx="2"/><path d="M8 12h3M15 10v4"/>',usb:'<rect x="7" y="3" width="10" height="8"/><path d="M9 11v10h6V11"/>',bat:'<rect x="3" y="8" width="16" height="9" rx="2"/><path d="M21 11v3M7 11v3"/>',therm:'<circle cx="12" cy="12" r="8"/><path d="M12 7v6l3 2"/>',scope:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M5 13c3-6 5 6 7 0s4 3 7-2"/>'});
const unl=t=>t=='therm'?done()>=20:t=='scope'?done()>=30:true;
const TUT={scr:'The screwdriver opens and closes the device. Select it, then press "Do it" next to a screw step, or tap the device.',
twz:'Tweezers lift ribbon-cable latches and disconnect the battery. They also place a new part: select the empty spot on the board, then choose the part below.',
mm:'A multimeter measures electricity. 1) Pick a mode. 2) Tap a pad to put the red probe there, then another pad for the black probe, or tap a whole part to probe both of its pads. 3) Read the display. Resistance, continuity and diode test need the power OFF. Volts need power ON (bench supply). Current needs the red lead in the A jack and both probes on one part.',
iron:'The iron melts solder at 217 °C. Set the temperature, hold "Hold to heat" until the pad is hot, press "Apply solder" (once or twice), wait for the joint to cool, then inspect it. Too hot or too long damages parts and pads. Too little heat makes a dull cold joint. Too much solder makes a bridge.',
mag:'The magnifier reveals small details: cracks, faint burn marks and dull solder joints. Select it, then tap a part.',
brush:'The brush removes dirt and green corrosion from pins and pads. Tap a part that looks grimy. Corroded pads must be cleaned before a new part goes in.',
wire:'Jumper wire has two jobs. On a battery, speaker, motor or PCB trace it repairs a broken lead or track. On a damaged pad it rebuilds the pad. On other parts it bridges the part for the next test.',
rem:'The removal tool desolders a part and lifts it off. On harder levels heat the joints with the iron first, then lift within a few seconds. It also wicks away excess solder.',
psu:'The bench supply powers the board safely. Set the voltage to the board’s rating, set a low current limit (0.25 A to 0.5 A), then switch the output on. If the current hits the limit and the voltage collapses, you have a short: switch off and find it.',
usb:'The USB tester plugs into a USB port and shows the voltage and current there. A healthy port with power shows about 5 V. No voltage points to a broken port, a bad joint or a fault before it.',
bat:'The battery tester measures a cell’s voltage and internal resistance. A good Li-ion cell is near 3.7 V. Under about 3.0 V it is dead. A swollen cell is dangerous and must be replaced.',
therm:'The thermal camera shows heat. Switch the board on with the bench supply, then look for bright hot spots. Shorted or failing parts run much hotter than their neighbours.',
scope:'The oscilloscope draws how a signal changes over time. Tap a part to probe its output. A steady line is DC, ripple on top means a weak capacitor, and a clock or switching part should show a clean repeating wave.'};
const MH={dcv:'DC volts: needs the board powered. Voltage vanishes after an open part and stays high before it.',acv:'AC volts: reads the AC part of a signal. Ripple means a filter capacitor is weak. Transformer outputs show AC.',ohm:'Resistance: power OFF. OL means open or blocked by a capacitor. Near 0 Ω means a short or a wire.',cont:'Continuity: power OFF. The meter beeps when the path is closed (under 30 Ω). OL means broken.',dio:'Diode test: power OFF. Red on the anode (+ side) shows the forward drop, about 0.6 V for a diode. Reversed shows OL. 0.000 both ways is a short.',a:'Current: power ON, red lead in the A jack, probes on both pads of one part. Open circuits read 0 A. Shorts read a lot.'};
const BAT=c=>c.mode=='bdead'?.9:c.mode=='bswell'?3.1:3.7;
const OPN=new Set(['open','burnt','dopen','ledopen','iopen','xopen','rcoil','sbroke','bwire','ubent','trcbreak','motburn','spkopen','pdmg']),SHT=new Set(['ccrack','zshort','mshort','xburn','cbent']),FLKM=new Set(['cloose','spkwire','motwire']),DR={leaky:1,bulge:.6,ebulge:.6,edry:.2,bswell:.8,bdead:1.5};
const isOpen=c=>!c.has||OPN.has(c.mode)||c.padx||(c.js&&Object.values(c.js).includes('new')),isShort=c=>SHT.has(c.mode)||c.bridge,isFlk=c=>c.cold||c.dirt||FLKM.has(c.mode);
const RT={};
`fuse|0.2|
cap|I|leaky=85e3,bulge=2.2e5
ecap|I|edry=3.3e5,ebulge=2.4e4
ccap|I|ccrack=0.2
dio|I|short=0.3
led|I|
zen|I|zshort=0.5
trn|I|short=0.4
mos|I|mshort=0.3,mgate=2e3
reg|1.2e3|dead=100
ic|8.5e3|dead=100
ind|0.3|
xfm|40|xburn=0.3
rly|I|rstuck=0.2
swt|0.1|
bat|0.2|bdead=8,bswell=3
con|0.2|cbent=0.05
usb|0.3|
chg|2.2e3|cdead=100
mcu|12e3|mdead=100
spk|8|
mic|2.2e3|
mot|6|
sen|4.7e3|
osc|8e3|oscdead=220
xtl|I|
trc|0.1|
scn|120|`.split('\n').forEach(l=>{const[t,h,m]=l.split('|');RT[t]=[h=='I'?Infinity:+h,Object.fromEntries((m||'').split(',').filter(Boolean).map(x=>{const[k,v]=x.split('=');return[k,+v]}))]});
function rc(c){if(!c.has||isOpen(c))return Infinity;if(c.bridge)return .3;let r;
 if(c.type=='res'){const v=P[c.has][3];r=c.mode=='drift'?v*1.8:v*(1+((c.ref.charCodeAt(0)+c.ref.charCodeAt(1))%9-4)/100)}
 else{const[h,m]=RT[c.type]||[1,{}];r=c.mode&&c.mode in m?m[c.mode]:h;if(c.has=='spk4'&&r==8)r=4}
 return c.corr?r+60:r}
const nid=p=>p=='GND'?-1:J.comps.findIndex(c=>c.ref==p.split('.')[0])+(p.endsWith('.B')?1:0);
function rpath(a,b){if(a==b)return[0,false];const n=J.comps.length,g=a=='GND'||b=='GND';let x=nid(a),y=nid(b);if(x<0)x=n;if(y<0)y=n;if(x>y)[x,y]=[y,x];let r=0,f=false;for(let i=x;i<y;i++){r+=rc(J.comps[i]);if(isFlk(J.comps[i]))f=true}
 if(g)r+=330;else if(x==y)r=.1;return[r,f]}
const rated=()=>J.comps.some(c=>c.type=='reg'||c.type=='xfm')?9:5;
function sim(){J.psu=J.psu||{on:false,v:5,il:.5};J.mm=J.mm||{mode:'dcv',r:null,b:'GND',jack:'v'};
 const cs=J.comps,n=cs.length,p0=J.psu,V=Array(n+1).fill(0),fl=Array(n+1).fill(false),ac=Array(n+1).fill(0),st={on:false,src:'',V,flk:fl,ac,I:0,cc:false,short:false,heat:cs.map(()=>26)};
 let s=0,v0=0;const bi=cs.findIndex(c=>c.type=='bat'&&c.has&&!isOpen(c));
 if(p0.on){st.src='psu';v0=p0.v}else if(bi>=0&&isOn('B')){st.src='bat';s=bi+1;v0=BAT(cs[bi])}
 st.on=!!st.src&&v0>0;if(!st.on)return st;
 const sh=cs.findIndex((c,i)=>i>=s&&c.has&&isShort(c)),op=cs.findIndex((c,i)=>i>=s&&isOpen(c)),ld=cs.filter(c=>['mot','spk','led','scn'].includes(c.type)&&c.has&&!isOpen(c)).length,Rl=60/(1+.3*ld);
 if(sh>=0&&(op<0||sh<op)){st.short=true;st.cc=st.src=='psu';st.I=st.cc?p0.il:v0/.15;for(let k=s;k<=sh;k++)V[k]=Math.min(v0,st.cc?st.I*.5*(sh+1-k):v0*.08);for(let k=sh+1;k<=n;k++)V[k]=.05}
 else{let I=op>=0?0:v0/Rl;if(st.src=='psu'&&I>p0.il){I=p0.il;st.cc=true;v0=I*Rl}st.I=I;let v=v0;V[s]=v;
  for(let i=s;i<n;i++){const c=cs[i];let o;if(isOpen(c))o=0;else if(c.type=='reg')o=c.mode?.2:Math.min(v-.1,5);else if(c.type=='chg')o=c.mode?0:Math.min(v-.1,4.2);else o=v-(DR[c.mode]||0)-(c.corr?.8:0)-(c.type=='dio'?.1:.02);
   v=Math.max(0,o);V[i+1]=v;fl[i+1]=fl[i]||isFlk(c)}}
 const RP={edry:.42,ebulge:.9,leaky:.55,bulge:.5};let rp=.008;ac[0]=V[0]>.3?rp:0;
 cs.forEach((c,i)=>{if(RP[c.mode])rp+=RP[c.mode];ac[i+1]=V[i+1]<.3?0:(c.type=='xfm'&&!c.mode&&V[i]>.5?12:rp)});
 cs.forEach((c,i)=>{let t=26+st.I*15;if(!c.has)t=26;else if(isShort(c))t=96;else if(['mdead','cdead'].includes(c.mode)||c.type=='reg'&&c.mode||c.mode=='dead')t=80;else if(DR[c.mode]&&c.type!='bat')t=52;else if(c.type=='bat'&&c.mode)t=50;else if(c.type=='reg')t=38+Math.max(0,p0.v-5)*3;st.heat[i]=Math.round(t*10)/10});
 return st}
function nodeV(p,st){if(p=='GND')return 0;const c=gc(p.split('.')[0]);if(c&&c.type=='bat'&&p.endsWith('.B')&&st.src!='psu'&&c.has&&!isOpen(c))return BAT(c);return st.V[nid(p)]||0}
const fV=v=>v==0?'0.000 V':Math.abs(v)<1?(v*1000).toFixed(0)+' mV':v.toFixed(3)+' V',fR=r=>r>4e7?'OL':r<1000?(r<10?r.toFixed(2):r.toFixed(1))+' Ω':r<1e6?(r/1e3).toFixed(2)+' kΩ':(r/1e6).toFixed(2)+' MΩ',fI=i=>i<1?(i*1000).toFixed(1)+' mA':i.toFixed(2)+' A';
function mmRead(){const m=J.mm,st=sim(),R=m.r,B=m.b||'GND',mode=m.mode;if(!R)return{t:'----',n:'Place the red probe on a pad, or tap a whole part.',h:MH[mode]};
 if(mode=='a'?m.jack!='a':m.jack=='a')return{t:'Err',n:mode=='a'?'Current mode needs the red lead in the A jack.':'Move the red lead back to the VΩ jack.',h:MH[mode]};
 const rn=R.split('.')[0],bn=B.split('.')[0],same=rn==bn&&R!='GND',c=same?gc(rn):null;let t,h=MH[mode],n='',beep=false;
 if(mode=='dcv'){const d=nodeV(R,st)-nodeV(B,st),f=st.flk[nid(R)]||st.flk[nid(B)];t=fV(d)+(f&&st.on?' (unstable)':'');
  h=!st.on?'Nothing is powering the board. Turn the bench supply on, or measure the battery straight across its pads.':Math.abs(d)<.3?'Almost no voltage here while the board is powered: look for an open part upstream.':'Voltage present. Compare it with the pads before and after to find where it drops or vanishes.'}
 else if(mode=='acv'){const d=Math.abs((R=='GND'?0:st.ac[nid(R)])-(B=='GND'?0:st.ac[nid(B)]));t=fV(d).replace(' V',' V~');h=d>.3&&d<5?'High AC ripple on a DC rail: suspect a weak or leaking filter capacitor upstream.':h}
 else if(mode=='a'){if(!same){t='Err';n='Put both probes on the two pads of one part so the meter sits in series.'}else{const x=!st.on||isOpen(c)?0:st.I;t=fI(x);h=x==0?'Zero current: the circuit is off or open.':x>.45?'Very high current: look for a short.':'Normal operating current.'}}
 else if(st.on){t='----';n='The circuit is powered. Switch the bench supply off and disconnect the battery before measuring resistance, continuity or diodes.'}
 else if(mode=='dio'){let x='OL';if(c&&['dio','led','zen'].includes(c.type)){const an=c.pl=='L'?'A':'B',fw=R.endsWith('.'+an);if(c.has&&!isOpen(c)){if(isShort(c)||c.mode=='short'||c.mode=='zshort')x='0.000 V';else if(fw)x=((c.type=='led'?1.85:c.type=='zen'?.72:.58)+(c.ref.charCodeAt(1)%5)/100).toFixed(3)+' V'}}else{const[r]=rpath(R,B);if(r<2)x='0.000 V'}
  t=x;beep=x=='0.000 V';h=x=='OL'?'OL: no forward conduction this way. Try swapping the probes. OL both ways means open.':x=='0.000 V'?'0.000 V: a short.':'Forward drop read. A healthy silicon diode gives about 0.5 to 0.7 V.'}
 else{const[r,f]=rpath(R,B);if(mode=='cont'){beep=r<30;t=fR(r)+(f&&r<30?' (unstable)':'');h=beep?'Closed path.':'No path: open or blocked by a capacitor.'}else{t=fR(r)+(f&&r<4e7?' (unstable)':'');h=r>4e7?'OL: open, or a capacitor is blocking DC.':r<1?'Under 1 Ω: a short or plain wire.':'Compare with the part value.'}}
 if(S.sk.data&&c)h+=' Expected: '+xp3(c)+'.';return{t,n,h,beep}}
function psuCheck(){const p=J.psu;if(!p.on)return;if(p.v>rated()*1.25){p.on=false;UI.msg='Overvoltage protection: the output was switched off. This board is rated for '+rated()+' V.';return}
 if(sim().short&&p.il>.5){p.on=false;J.mist++;UI.msg='Short circuit! The current limit was above 0.5 A, so the supply cut the output. Use a low limit on a suspect board. Mistake recorded.'}}
A.pson=()=>{const p=J.psu;p.on=!p.on;UI.msg=p.on?'Output on.':'Output off.';psuCheck();UI.res=null;beep(p.on?600:300,.06);redraw()};
A.psv=d=>{const p=J.psu;p.v=Math.max(0,Math.min(15,Math.round((p.v+ +d)*10)/10));psuCheck();redraw()};
A.psvs=v=>{J.psu.v=+v;psuCheck();redraw()};
A.psi=v=>{J.psu.il=+v;psuCheck();redraw()};
const pads=c=>J.lv>10?['A','B']:['AB'],tau=c=>['xfm','usb','con','bat','mot','spk','swt','rly'].includes(c.type)?1.6:['ecap','cap','trc','scn'].includes(c.type)?1:.5,lim=c=>(['led','ecap','ccap','mcu','chg','ic','reg','osc','xtl','mic','sen','trn','mos','dio','zen'].includes(c.type)?300:370)+(J.lv<=10?60:0);
const jT=(c,p)=>{const h=c.ht&&c.ht[p];return h?25+(h.Tj-25)*Math.exp(-(Date.now()-h.t0)/(J.lv<=10?5000:2500)):25};
const cp=c=>UI.pd&&pads(c).includes(UI.pd)?UI.pd:pads(c)[0];
function sg(c,t){const g=gate(c,'iron');if(g){UI.msg=g;redraw();return 1}if(!c||!c.has||c.type=='trc'){UI.msg='There is no soldered part here.';redraw();return 1}if(t&&c.padx){UI.msg='This pad is damaged. Rebuild it with the jumper wire first.';redraw();return 1}}
A.heat=a=>{const[ref,ms]=a.split('|'),c=gc(ref);if(!c)return;UI.sel=ref;UI.T=UI.T||350;if(sg(c,1))return;const p=cp(c),t=Math.max(0,+ms)/1000,T=UI.T,Tj=25+(T-25)*(1-Math.exp(-t/tau(c)));
 c.ht=c.ht||{};c.ht[p]={Tj,t0:Date.now()};if(Tj>=217)c.hot=Date.now();let m='Pad '+p+' reached '+Math.round(Tj)+' °C. ';
 if(Tj>lim(c)){c.mode='pdmg';c.ovh=1;J.mist++;m+='Overheated! The part is damaged.'}else if(Tj>(J.lv<=10?440:420)){c.padx=true;J.mist++;m+='The pad lifted off the board. Rebuild it with the jumper wire.'}
 else m+=Tj>=217?'The solder is molten. Apply solder now.':'Not hot enough to melt solder (217 °C). Hold longer or raise the temperature.';
 UI.msg=m;UI.res=null;beep(Tj>=217?700:300,.08);redraw()};
A.apply=ref=>{const c=gc(ref);if(!c||sg(c,1))return;const p=cp(c),hot=jT(c,p)>=217;c.u=c.u||{};c.u[p]=(c.u[p]||0)+1;if(!hot){c.cs=c.cs||{};c.cs[p]=1}
 UI.msg=hot?'Solder flows into pad '+p+' (dose '+c.u[p]+').':'The solder balled up: pad '+p+' was too cool.';beep(hot?650:250,.06);redraw()};
A.cool=ref=>{const c=gc(ref);if(!c)return;const ps=pads(c).filter(p=>c.u&&c.u[p]);if(!ps.length){UI.msg='Apply solder to a heated pad first.';redraw();return}
 if(ps.some(p=>jT(c,p)>=100)){UI.msg='The joint is still hot. Keep still, wait a few seconds, then inspect it.';redraw();return}
 const mn=J.lv<=10?1:2,mx=J.lv<=10?3:2;c.js=c.js||{};const out=[];ps.forEach(p=>{const u=c.u[p],r=(c.cs&&c.cs[p])||u<mn?'cold':u>mx?'excess':'good';c.js[p]=r;out.push(p+': '+({good:'good joint, smooth and shiny',cold:'cold joint, dull and grainy',excess:'too much solder, a bridge formed'}[r]));if(c.ht)delete c.ht[p]});
 c.u=null;c.cs=null;const v=Object.values(c.js);c.bridge=v.includes('excess');if(v.includes('cold'))c.cold=true;else if(v.every(s=>s=='good'))c.cold=false;
 if(v.every(s=>s=='good')&&c.rep!='replaced')c.rep='repaired';J.fixed=1;UI.res=null;UI.msg='Inspection: '+out.join('; ')+'.'+(c.bridge?' Remove the excess with the removal tool.':v.includes('cold')?' Heat it again and add solder.':'');beep(v.every(s=>s=='good')?880:200,.15);redraw()};
A.tmp=d=>{UI.T=Math.max(200,Math.min(450,(UI.T||350)+ +d));redraw()};
A.pdsel=p=>{UI.pd=p;redraw()};
{const r0=rmCore;rmCore=function(c){if(c.bridge&&c.has){c.bridge=false;c.js={};pads(c).forEach(p=>c.js[p]='new');J.fixed=1;UI.res=null;return'Wicked away the excess solder. The joints must be soldered again.'}
 if(c.has&&c.type!='trc'&&J.lv>10&&!(c.hot&&Date.now()-c.hot<8000)&&!(c.js&&Object.values(c.js).includes('new')))return'The solder is solid. Heat the joints with the soldering iron first, then lift the part within a few seconds.';
 const m=r0(c);if(!c.has){c.js=null;c.ht=null;c.u=null;c.cs=null;c.bridge=false}return m}}
{const i0=A.inst;A.inst=a=>{const c=gc(a.split('|')[0]),had=c&&c.has;i0(a);if(c&&!had&&c.has){c.js={};pads(c).forEach(p=>c.js[p]='new');c.ht=null;c.u=null;c.cs=null;c.cold=false;c.bridge=false;UI.msg+=' Now solder its joints with the iron.'}}}
{const g0=gate;gate=function(c,t){if(J.psu&&J.psu.on&&['iron','rem','wire','twz'].includes(t)){J.mist++;return'The bench supply is on. Switch it off before soldering or removing parts. Mistake recorded.'}return g0(c,t)}}
{const d0=A.do;A.do=a=>{const[ref,ac]=a.split('|');if(ac=='solder'){UI.tool='iron';UI.sel=ref;UI.msg='Soldering station ready: heat the joint, apply solder, then cool and inspect.';redraw();return}d0(a)}}
{const b0=build;build=function(j){b0(j);const rk=c=>({usb:0,chg:1,bat:2}[c.type]??3);j.comps.sort((x,y)=>rk(x)-rk(y));j.psu={on:false,v:5,il:.5};j.mm={mode:'dcv',r:null,b:'GND',jack:'v'};j.comps.forEach(c=>{if(c.type=='bat')c.pl=c.o='R';if(c.cold)c.js=j.lv>10?{A:'cold',B:'cold'}:{AB:'cold'}})}}
function wave(p,st){if(!p)return{pts:'0,68 240,68',txt:'No probe placed. Tap a part.'};if(!st.on)return{pts:'0,68 240,68',txt:'0.00 V: nothing is powered. Switch the bench supply on.'};
 const k=nid(p),c=gc(p.split('.')[0]),v=p=='GND'?0:st.V[k]||0,a=p=='GND'?0:st.ac[k]||0,ok=c&&c.has&&!isOpen(c)&&v>1;let kd='dc',amp=0,fr=0;
 if(a>=11){kd='ac';amp=17;fr=50}else if(ok&&c.type=='osc'&&!c.mode){kd='sq';amp=v;fr=8e6}else if(ok&&c.type=='xtl'&&!c.mode){kd='sin';amp=v*.4;fr=16e6}else if(ok&&c.type=='mos'&&!c.mode){kd='pwm';amp=v;fr=1e5}else if(ok&&c.type=='mcu'&&!c.mode){kd='sq';amp=v;fr=1e3}
 const Y=Math.max(1,kd=='ac'?amp:v+amp*1.3+a*2),z=kd=='ac'?45:80,sc=(kd=='ac'?38:70)/Y,pt=[];
 for(let i=0;i<=120;i++){const t=i/120*2,ph=t%1;let y=v;if(kd=='sq')y=ph<.5?amp:0;if(kd=='sin')y=v+amp*Math.sin(6.283*t);if(kd=='pwm')y=ph<.4?amp:0;if(kd=='ac')y=amp*Math.sin(6.283*t);if(kd=='dc')y=v+a*1.414*Math.sin(12.566*t);pt.push(i*2+','+(z-y*sc).toFixed(1))}
 const f=fr>=1e6?fr/1e6+' MHz':fr>=1e3?fr/1e3+' kHz':fr+' Hz';
 return{pts:pt.join(' '),txt:kd=='dc'?fV(v)+' DC'+(a>.02?', ripple '+(a*1000).toFixed(0)+' mV':', clean'):({ac:'AC mains-derived sine, 17 V peak, ',sq:'clock/logic square wave, ',sin:'crystal sine, ',pwm:'switching waveform, '}[kd])+f+', amplitude '+fV(amp)}}
A.wick=ref=>{const c=gc(ref);if(!c.bridge){UI.msg='No excess solder to remove here. Use the removal tool to lift a part.';redraw();return}if(sg(c,0))return;UI.msg=rmCore(c);redraw()};
A.pad=id=>{const m=J.mm,c=id=='GND'?null:gc(id.split('.')[0]);if(c){const g=gate(c,'x');if(g){UI.msg=g;redraw();return}}
 if(UI.tool=='scope'||UI.nx!='b'){m.r=id;UI.nx='b'}else{m.b=id;UI.nx='r'}if(c)J.log[c.ref]=mmRead().t;UI.msg='';if(mmRead().beep)beep(880,.15);else beep(520,.05);redraw()};
A.mmode=x=>{J.mm.mode=x;if(mmRead().beep)beep(880,.15);redraw()};
A.jack=x=>{J.mm.jack=x;redraw()};
A.nx=x=>{UI.nx=x;redraw()};
A.msnd=()=>{S.set.snd=!S.set.snd;redraw()};
A.swp=()=>{const m=J.mm;[m.r,m.b]=[m.b,m.r];if(!m.r)m.r='GND';redraw()};
{const t0=A.tool;A.tool=t=>{if(!unl(t)){UI.msg='Locked: finish '+(t=='therm'?20:30)+' career levels to unlock the '+TOOLS.find(x=>x[0]==t)[1].toLowerCase()+'.';redraw();return}t0(t)}}
{const pk0=A.pick;A.pick=ref=>{const t=UI.tool,c=gc(ref);
 if(t=='mm'||t=='scope'){UI.sel=ref;const g=gate(c,'x');if(g){UI.msg=g;redraw();return}const pp=POL[c.type]?(c.pl=='L'?['A','B']:['B','A']):['A','B'];J.mm.r=ref+'.'+(t=='scope'?'B':pp[0]);J.mm.b=t=='mm'?ref+'.'+pp[1]:'GND';UI.nx='r';const r=mmRead();J.log[ref]=r.t;UI.msg='';beep(r.beep?880:520,r.beep?.15:.05);redraw();return}
 if(t=='iron'){UI.sel=ref;UI.pd=null;UI.msg='';redraw();return}
 if(t=='wire'&&c.padx){if(sg(c,0))return;c.padx=false;J.fixed=1;UI.res=null;c.rep='repaired';UI.msg='Rebuilt the damaged pad with a soldered jumper wire.';beep(600);redraw();return}
 if(t=='therm'){UI.sel=ref;const st=sim();UI.msg=unl('therm')?(st.on?'Thermal camera: '+ref+' is at '+st.heat[J.comps.indexOf(c)].toFixed(1)+' °C.':'The board is cold. Switch the bench supply on first.'):'';J.log[ref]='thermal';redraw();return}
 if(t=='usb'||t=='bat'){UI.sel=ref;if(c.type!=(t=='usb'?'usb':'bat'))UI.msg=t=='usb'?'Plug the USB tester into a USB port.':'Clamp the battery tester onto a battery cell.';else{J[t=='usb'?'ut':'bt']=ref;J.log[ref]=t+' tester';UI.msg=''}redraw();return}
 if(t=='psu'){UI.sel=ref;UI.msg='Use the bench supply panel to power the board.';redraw();return}
 pk0(ref)}}
let HD=null;
document.addEventListener('pointerdown',e=>{const b=e.target.closest&&e.target.closest('[data-hold]');if(!b||HD)return;e.preventDefault();HD={r:b.dataset.hold,t:Date.now(),iv:setInterval(()=>{const c=gc(HD&&HD.r),el=$('#jt');if(c&&el)el.textContent='('+Math.round(25+(UI.T-25)*(1-Math.exp(-(Date.now()-HD.t)/1000/tau(c))))+' °C)'},60)}});
const hu=()=>{if(!HD)return;clearInterval(HD.iv);const h=HD;HD=null;A.heat(h.r+'|'+(Date.now()-h.t))};
document.addEventListener('pointerup',hu);
document.addEventListener('pointercancel',hu);
document.addEventListener('contextmenu',e=>{if(e.target.closest&&e.target.closest('[data-hold]'))e.preventDefault()});
const CAT=[['Passive parts','res cap ecap ccap ind xfm'],['Semiconductors','dio led zen trn mos'],['Power and chips','fuse reg ic chg mcu osc xtl'],['Electromechanical','swt rly mot spk mic sen bat'],['Connectors and displays','con usb scn']];
['cap100','cap470','cap1000'].forEach(k=>{const v=P[k];Object.defineProperty(P,k,{value:v,enumerable:false,writable:true,configurable:true})});
function mig1(){if(S.m1)return;const M={cap100:'el100',cap470:'el470'};let r=0;
 Object.keys(S.inv).forEach(k=>{if(M[k]){S.inv[M[k]]=(S.inv[M[k]]||0)+S.inv[k];delete S.inv[k]}else if(k=='cap1000'){r+=S.inv[k]*12;delete S.inv[k]}});S.money+=r;S.m1=1}
const svs=m=>{const e=$('#svs');if(e)e.textContent=m};
function impSave(t){let o;try{o=JSON.parse(t)}catch(e){return'That is not a valid save.'}
 if(!o||typeof o!='object'||typeof o.money!='number'||!o.done||typeof o.done!='object'||!o.inv||typeof o.inv!='object')return'This does not look like a repair simulator save.';
 if(!confirm('Replace your current progress with this save?'))return'Import cancelled.';
 S=Object.assign(def(),o);S.set=Object.assign({snd:true,hint:true},S.set||{});J=S.job||null;mig1();UI.sel=null;UI.res=null;UI.msg='Save imported.';render();return''}
A.sexp=()=>{save();const t=JSON.stringify(S);let ok=0;
 try{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type:'application/json'}));a.download='electronics_repair_save.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000);ok=1}catch(e){}
 try{navigator.clipboard&&navigator.clipboard.writeText(t).catch(()=>{})}catch(e){}
 const ta=$('#svt');if(ta)ta.value=t;svs(ok?'Save exported. The text is also in the box above as a backup.':'Download was blocked. Copy the text from the box above and keep it.')};
A.simp=()=>{const f=$('#svf');f&&f.click()};
A.spaste=()=>{const ta=$('#svt'),m=impSave(ta?ta.value.trim():'');if(m)svs(m)};
document.addEventListener('change',e=>{if(e.target.id=='svf'&&e.target.files[0]){const r=new FileReader();r.onload=()=>{const m=impSave(String(r.result));if(m)svs(m)};r.readAsText(e.target.files[0]);e.target.value=''}});
/* ---- fault knowledge base, compatibility rules, consequences, safety, pause, scope maths ---- */
(function(){
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const num=(re,s)=>{const m=re.exec(s);return m?+m[1]:0};
P.fuse1A=['Fuse 1A',6,'fuse',1];
P.fuse5A=['Fuse 5A',6,'fuse',5];
const newDev=(lv,b)=>Math.min(17,Math.floor((lv-1)*.29)+(b?1:0));
dec=function(j){const i=newDev(j.lv,j.bonus),r=rng(j.lv*31+i);j.di=i;j.cust=CU[Math.floor(r()*CU.length)];j.model=DV[i][2]+'-'+(100+Math.floor(r()*900));j.dev=[DV[i][0],DV[i][1]];if(j.lv==11&&!j.mode&&!j.bonus)j.seed=(j.seed||0)+3};
const SC=`First Light|A neighbor's flashlight will not switch on at all. Start simple: look first, then measure.
Flicker Fix|The flashlight flickers when tapped, then goes dark.
Dropped and Dark|After a fall onto concrete the flashlight no longer lights.
Dim Beam|Since the battery was swapped the beam is weak and yellow.
Robot Won't Walk|A child's toy robot lights up but does not move.
Silent Robot|The robot walks, yet its voice has gone quiet.
Robot Reboots|The robot restarts every few seconds and then freezes.
Slow Spin|A desk fan spins slowly and then stops.
Hot Motor|The fan's motor housing is hot to the touch after a minute.
Hum Without Spin|The fan hums but the blades never turn.
Stops on High|The fan works on low but cuts out on the high setting.
Wiggle to Charge|A phone charges only when the cable is wiggled.
Slow Charger Cable|A cable charges a phone but very slowly.
After the Surge|A cable stopped working after a power surge.
Earphones: No Sound|Both earbuds are silent, although the plug looks fine.
Crackling Earbuds|Static crackles through the earphones on every call.
Callers Can't Hear Me|The earphone microphone has gone completely quiet.
Dead Controls|The inline volume buttons do nothing.
Hum and Dropouts|A Bluetooth speaker hums and cuts out.
Won't Pair|The speaker powers on but never connects to a phone.
Dead After Charging|The speaker died after being left charging overnight.
Silent Radio|A portable radio is silent. It may be mains-powered, so work safely.
Crackling Dial|The radio crackles whenever the volume knob is turned.
Buzzing Radio|A loud 100 Hz buzz sits under every station.
Heirloom Radio|A family keepsake radio is dead. Take extra care with mains voltage.
Bank Won't Charge|A power bank does not accept charge and shows no lights.
No Output|The power bank charges but gives no power to phones.
Swollen Pack|The power bank's case is bulging. Handle Li-ion cells with care.
Clicks and Dies|A phone charger clicks once and then goes silent.
Whining Charger|The charger whines and phones charge very slowly.
Overheating Brick|A charger becomes too hot to hold within minutes.
Cheap Charger|A no-name charger keeps tripping the breaker.
Phone Reboots|A smartphone reboots whenever the screen brightens.
Won't Charge|A smartphone will not charge from any cable.
Dark Screen|The phone vibrates and rings but the screen stays dark.
Black Tablet|A tablet shows nothing but a black screen.
Dies at 40%|A tablet shuts off whenever the battery reaches about 40%.
Wobbly Port|A tablet charges only when the cable is held at an angle.
Shuts Off in a Minute|A laptop shuts off about a minute after it boots.
Laptop Won't Charge|The charging light is off and the battery slowly drains.
Beeping Laptop|The laptop beeps repeatedly and will not start.
Coffee Spill|A laptop took a spill. Expect corrosion as well as failed parts.
Flicker and Dark|A monitor flickers and then goes dark.
Monitor Clicks|The monitor clicks every few seconds but never shows a picture.
Standby Only|A monitor's standby light is on, yet it never wakes.
Clicks, Stays Black|A television clicks when switched on but stays black.
No Backlight|The TV sound works but the picture is almost invisible.
TV Buzz|A television buzzes loudly and smells of hot dust.
Random Shutdown|A television switches itself off at random.
Router Reboots|A Wi-Fi router keeps restarting through the day.
Lights Out|A router has no lights at all, with its adapter plugged in.
Overheated Router|The router runs very hot and drops connections.
Won't Feed Paper|A printer pulls the paper in and then jams.
Stalled Motor|The printer's feed motor stalls and clicks.
Error Loop|A printer shows an error code on every start-up.
Dead Printer|A printer will not even show its power light.
Drops From the Sky|A drone shuts off in mid-flight.
Twitching Motor|One drone motor twitches and will not spin up.
Won't Arm|The drone's flight controller powers up but refuses to arm.
Final Exam: Dead Board|A workstation motherboard does not POST. Several faults hide on it.`.split('\n').map(l=>l.split('|'));
const KB={
open:['Blown fuse','A fuse opens when current exceeds its rating, or after a surge. Nothing after it gets power.','Measure DC volts before and after the fuse: voltage before, none after. With power off, resistance reads OL.','Replace it with a fuse of exactly the same current rating.','Always replace a fuse with the same rating, and ask what made it blow.'],
bulge:['Bulged capacitor','Heat, age or over-voltage made the electrolytic swell.','Look at the top of the can: it is domed. The supply shows heavy ripple on AC volts or the scope.','Replace it with the same capacitance and an equal or higher voltage rating, polarity correct.','A domed electrolytic is already failed: it can no longer smooth the supply.'],
leaky:['Leaky capacitor','The electrolyte has leaked or dried, so it filters less.','The rail carries ripple (AC volts or scope) and there may be brown residue around the base.','Replace it, matching capacitance, voltage rating and polarity.','Failing capacitors cause hum, flicker and resets before they fail completely.'],
burnt:['Burnt resistor','Overheating burnt the resistive element open.','Resistance reads OL and the body is dark. The path it fed is dead.','Replace it with the same value.','A resistor that burnt out was carrying too much power: check what draws the current.'],
drift:['Drifted resistor','Heat changed its value, so the circuit is biased wrongly.','Resistance reads far from the colour-band value.','Replace it with the same value and tolerance.','Resistors set currents and voltages: a wrong value shifts the whole circuit.'],
short:['Shorted diode','The junction failed and now conducts both ways.','Diode test reads 0.000 V in both directions. The supply draws too much current.','Replace it with the same type, cathode band matching the silkscreen.','A shorted diode lets current flow where it should be blocked.'],
dopen:['Open diode','The junction failed open and blocks current.','Diode test reads OL both ways. The voltage after it is missing.','Replace it with the same type.','Diodes should pass about 0.6 V forward and block in reverse.'],
dead:['Dead regulator or IC','The silicon failed from heat, overload or a surge.','Input voltage is present but there is no output, or no activity on the scope.','Replace it with the exact part, pin 1 aligned.','Always check the input and output of a regulator before blaming it.'],
edry:['Dried-out electrolytic','Age and heat evaporated the electrolyte, so capacitance fell and ESR rose.','The rail shows ripple on AC volts or the scope.','Replace it with the same capacitance, an equal or higher voltage rating, polarity correct.','Heat ages electrolytic capacitors. Ripple on a supply points to them first.'],
ebulge:['Vented electrolytic','Over-voltage, heat or reverse polarity made it vent.','The can top is domed or split, with brown residue. Ripple is high.','Replace it, checking voltage rating and polarity.','The + mark and the stripe tell you the polarity: reversing it can make a capacitor burst.'],
ccrack:['Cracked ceramic capacitor','Board flexing cracked the ceramic body, so it lost capacitance.','Noise appears on the rail on the scope, and a hairline crack may be visible.','Replace it with the same value.','Ceramic capacitors are brittle. Bending a board can crack them.'],
ledopen:['Open LED','The LED die or bond wire failed, so no current flows.','The LED stays dark even though voltage reaches it. Diode test shows OL.','Replace it with a compatible LED, anode on the + side.','An LED passes current one way only, so polarity matters.'],
zshort:['Shorted zener','The junction shorted and pulls the rail to ground.','The rail voltage collapses and the resistance across the zener reads near zero.','Replace it with the same zener voltage.','A zener clamps a rail to a fixed voltage; shorted, it clamps it to nothing.'],
mshort:['Shorted MOSFET','Drain and source are shorted, usually from overload or heat.','Resistance from drain to source is near zero and the supply trips on overcurrent.','Replace it with the same channel type and rating.','A shorted switch cannot turn the load off, so current never stops.'],
mgate:['Damaged MOSFET gate','A surge or static damaged the gate, so it never switches.','Voltage reaches the drain but the load never turns on and the gate does not respond.','Replace it with the same channel type and rating.','Gates are fragile: static discharge can destroy them silently.'],
iopen:['Open inductor','The winding broke, so no current passes.','Resistance reads OL where it should be a few ohms or less.','Replace it with the same inductance.','Inductors are coils of wire: a broken coil is an open circuit.'],
xopen:['Open transformer winding','A winding wire broke inside the transformer.','No secondary AC voltage appears and the winding resistance reads OL.','Replace the transformer with the same voltage rating.','Transformers step voltage down; no secondary output means a failed winding.'],
xburn:['Burnt transformer','Overload overheated the windings.','The body is discoloured and smells burnt. Output is low or missing.','Replace it and find the overload.','A burnt transformer means something downstream drew too much current.'],
rstuck:['Stuck relay contacts','The contacts welded together from arcing.','The load stays on regardless of the control signal. Continuity beeps with the coil off.','Replace the relay with the same coil voltage and contact rating.','Relays switch large loads with a small signal; arcing wears the contacts.'],
rcoil:['Open relay coil','The coil wire broke, so the relay never clicks.','Coil resistance reads OL instead of tens of ohms. There is no click.','Replace the relay with the same coil voltage.','A relay needs a working coil to move its contacts.'],
sbroke:['Broken switch','The lever or contact broke.','Continuity does not change when the lever moves.','Replace the switch with the same type.','A switch is just a controlled gap in the circuit.'],
bdead:['Dead Li-ion cell','The cell was over-discharged or has aged out.','The battery tester shows low voltage or very high internal resistance.','Replace the cell with the same chemistry and voltage.','Never charge a deeply discharged Li-ion cell. Replace it.'],
bswell:['Swollen Li-ion cell','Gas from ageing or overcharge puffed the cell.','The pack is visibly bulged. The cell is dangerous.','Replace it. Never puncture or heat a swollen cell.','A swollen Li-ion cell can ignite. Treat it as a hazard.'],
bwire:['Broken battery lead','A solder joint or wire at the battery broke.','The cell tests fine on its own, yet no voltage reaches the board.','Re-solder or reconnect the lead.','Many "dead battery" faults are only a broken wire.'],
cbent:['Bent connector pins','Pins bent or pushed back, so contact is poor.','Continuity across the connector fails and a pin looks crooked.','Replace the connector.','Connectors take mechanical abuse, so they fail more often than chips.'],
cloose:['Loose connector','The ribbon or cable is not fully seated.','Intermittent continuity: the reading changes when the cable moves.','Re-seat the cable and lock it.','Re-seat connectors before replacing parts: it costs nothing.'],
ubent:['Damaged USB port','The port shell or pins were bent by a hard plug-in or a yank.','The USB tester shows no VBUS at the port even with a good cable.','Replace the port.','USB ports take mechanical stress and are a common repair.'],
cdead:['Dead charging IC','The charge controller failed from a surge or heat.','There is input voltage but the battery never receives charge.','Replace it, pin 1 aligned.','Charging ICs sit between a USB port and a Li-ion cell, so they take surges.'],
mdead:['Dead microcontroller','The chip failed from a surge, heat or static.','The oscillator runs, yet nothing toggles on the chip pins.','Replace it with the exact part, pin 1 aligned.','If the power and clock are good but nothing runs, suspect the chip.'],
spkopen:['Open speaker coil','The voice coil wire broke.','Resistance reads OL. A working speaker reads close to its rated impedance.','Replace the speaker with the same impedance.','A speaker is a coil: broken means silent.'],
spkwire:['Broken speaker lead','The thin lead wire broke near the terminal.','The speaker coil measures fine, yet no signal reaches it.','Re-solder the lead.','Fine wires break at flexing points.'],
micdead:['Dead microphone','The electret capsule failed.','There is no signal and the capsule does not respond to sound.','Replace it, polarity correct.','Electret microphones need bias and polarity.'],
motburn:['Burnt motor','Stalling overheated the windings.','Resistance across the motor is open or very low, with a burnt smell.','Replace the motor.','A stalled motor draws large current and cooks its own winding.'],
motwire:['Broken motor lead','A wire broke at the motor terminal.','The motor is fine on the supply, yet no current reaches it.','Re-solder the lead.','Vibration breaks leads at the terminals.'],
sendead:['Dead sensor','The sensor failed or lost its supply.','The sensor output is flat when its input changes.','Replace the sensor.','Check the supply to a sensor before you replace it.'],
oscdead:['Dead oscillator','The clock oscillator stopped.','The scope shows no clock waveform on its output.','Replace it with the same frequency.','No clock means a digital chip cannot run.'],
xtlcrack:['Cracked crystal','The quartz cracked after a drop, so it cannot resonate.','The scope shows no oscillation at the crystal.','Replace it with the same frequency.','A crystal sets the timing; a cracked one gives none.'],
trcbreak:['Broken PCB trace','A copper track cracked from flexing or corrosion.','Continuity fails along the trace although both ends look fine.','Bridge it with a wire or repair the trace.','A trace is a wire: breaks stop the signal. Test continuity along it.'],
scrack:['Cracked display','Impact cracked the glass or panel.','Visible cracks. The image is distorted or dark in places.','Replace the display panel.','Cracked glass cannot be repaired. Replace the panel.'],
sback:['Failed backlight','The backlight driver or LEDs failed.','The picture is faintly visible under a torch but the screen looks dark.','Replace the display or backlight.','A dark but present picture points to the backlight.'],
pdmg:['Part damaged during repair','A slip or poor handling damaged a good part.','It tests bad even though it was fine before you started.','Replace it.','Slow, careful handling avoids creating new faults.'],
cold:['Cold solder joint','The joint never fully melted, so contact is intermittent.','The joint looks dull and grainy, and readings change when you press the part.','Reflow the joint above 217 °C without overheating the part.','A good joint is shiny and smooth. Too little heat leaves a cold joint.'],
dirt:['Dirty contacts','Dust and residue block the contacts.','Resistance is erratic. Dirt is visible under the magnifier.','Clean with the brush and alcohol.','Cleaning is the cheapest repair. Try it first.'],
corr:['Corroded pads','Moisture or leaking cells corroded the pads.','Green or white crust around the pads.','Clean the corrosion with the brush before fitting any part.','Corrosion hides under parts. Clean it before soldering.']};
{const b0=build;build=function(j){b0(j);j.f0=j.comps.filter(c=>c.mode||c.cold||c.dirt||c.corr).map(c=>({ref:c.ref,type:c.type,req:c.req,m:c.mode||(c.cold?'cold':c.dirt?'dirt':'corr')}))}}
const isMains=()=>!!J&&J.comps.some(c=>c.type=='xfm');
const BLOCK=['usb','con','scn','mot','bat'],SENS=['mcu','chg','osc','xtl','ic','reg','mos','trn','sen','scn','led','zen'];
const ecs=n=>({uf:num(/(\d+)µF/,n),v:num(/([\d.]+)V/,n)});
function compat(c,k){const q=c.req0||c.req;if(k==q)return{lv:'exact'};const A0=P[q],B=P[k],t=c.type;
 if(BLOCK.includes(t))return{lv:'block'};
 if(t=='res')return{lv:'bad',fx:'drift',why:`${B[0]} sets a different current and bias than the ${A0[0]} the circuit was designed for, so the output level is wrong.`};
 if(t=='ecap'){const a=ecs(A0[0]),b=ecs(B[0]);if(b.v<a.v)return{lv:'bad',fx:'ebulge',pen:10,why:`The ${b.v} V rating is below the ${a.v} V the circuit needs. Overstressed electrolytics vent and burst.`};if(b.uf<a.uf*.8)return{lv:'bad',fx:'edry',why:`${b.uf} µF is too little capacitance to smooth the supply, so ripple stays.`};return{lv:'ok',note:`it has at least the capacitance (${b.uf} µF) and voltage rating (${b.v} V) the circuit needs.`}}
 if(t=='ccap')return{lv:'bad',fx:'ccrack',why:'The wrong bypass value fails to filter this noise frequency, so noise stays on the rail.'};
 if(t=='fuse')return B[3]>A0[3]?{lv:'bad',unsafe:1,pen:15,why:`A ${B[3]} A fuse is too large for a ${A0[3]} A circuit. The wiring can overheat before it opens: an unsafe repair.`}:{lv:'bad',fx:'open',why:`A ${B[3]} A fuse is too small. It blows at normal current.`};
 if(t=='led')return{lv:'ok',note:'LEDs of another colour work in the same circuit, though their forward voltage and brightness differ.'};
 if(t=='zen'){const a=num(/([\d.]+)V/,A0[0]),b=num(/([\d.]+)V/,B[0]);return b<a?{lv:'bad',fx:'zshort',why:`A ${b} V zener clamps the rail below the ${a} V it needs, so the rail collapses.`}:{lv:'bad',unsafe:1,pen:10,why:`A ${b} V zener lets the rail rise above ${a} V, which can damage the parts it feeds.`}}
 if(t=='mos')return{lv:'bad',fx:'mgate',why:'N-channel and P-channel MOSFETs switch in opposite ways. The wrong channel never turns on correctly.'};
 if(t=='ind')return{lv:'bad',unsafe:1,why:'The wrong inductance changes the switching ripple and current, so the power stage runs out of spec.'};
 if(t=='spk'){const a=num(/(\d+)Ω/,A0[0]),b=num(/(\d+)Ω/,B[0]);return b>=a?{lv:'ok',note:'a higher impedance is safe, just a little quieter.'}:{lv:'bad',unsafe:1,pen:10,why:`A ${b} Ω speaker draws more current than the amplifier was built for, which overloads the output stage.`}}
 if(t=='xtl')return{lv:'bad',unsafe:1,why:'The wrong crystal frequency makes the chip run at the wrong clock speed.'};
 return{lv:'bad',unsafe:1,why:`${B[0]} does not match the board specification (${A0[0]}).`}}
const WHY={fuse:'The same current rating opens before the wiring overheats.',res:'The same value keeps the designed current and bias.',ecap:'Capacitance and voltage rating both match.',ccap:'The same value filters the same frequencies.',led:'It is the same LED type.',zen:'The same clamp voltage protects the rail properly.',mos:'The same channel type and rating switch correctly.',ind:'The same inductance keeps the converter in spec.',spk:'The same impedance matches the amplifier.',xtl:'The same frequency keeps the clock right.'};
chk=function(c,k,o,rep){if(c.has&&!rep)return'Remove the old part first.';if(c.type=='trc')return'PCB traces are repaired, not replaced.';
 if(!(J.mode=='p'||S.inv[k]>0))return'You do not have that part.';
 if(P[k][2]!=c.type)return`Wrong type: this position takes a ${TYN[c.type].toLowerCase()}, but ${P[k][0]} is a ${TYN[P[k][2]].toLowerCase()}.`;
 if(compat(c,k).lv=='block')return`Wrong size or connector: the board needs ${P[c.req0||c.req][0]}, but this is ${P[k][0]}. It does not physically fit.`;
 if(c.corr)return'The pads are corroded. Clean the corrosion first (brush).';return''};
{const r0=rmCore;rmCore=function(c){const m=r0(c);if(!c.has){if(c.req0){c.req=c.req0;delete c.req0}c.bad=null;c.rev=false;['esdd','badDone','revDone','esdDone'].forEach(x=>delete c[x])}return m}}
{const i0=A.inst;A.inst=function(a){const[ref,k,o]=a.split('|'),c=gc(ref),had=c&&c.has;i0(a);if(!c||had||!c.has||c.has!==k)return;
 const cp=compat(c,k),q=c.req0||c.req,m=['Installed '+P[k][0]+' at '+ref+'.'];c.bad=null;c.rev=false;UI.cons=null;
 if(cp.lv=='ok'){if(!c.req0)c.req0=c.req;c.req=k;m.push('Acceptable substitute: '+cp.note)}
 else if(cp.lv=='bad'){c.bad=cp;J.mist++;m.push('Warning: this does not match the board spec ('+P[q][0]+'). '+cp.why+' Mistake recorded.')}
 else if(WHY[c.type])m.push('Matches the board specification. '+WHY[c.type]);
 if(POL[c.type]){if((o||c.pl)!==c.pl){c.rev=true;J.mist++;m.push('Reversed polarity: the board marks + on the '+(c.pl=='L'?'left':'right')+'. Powering it on would damage it. Remove it and refit it the right way round.')}else m.push('Polarity is correct.')}
 if(J.esd===false&&SENS.includes(c.type)){c.esdd=true;J.mist++;m.push('You handled a static-sensitive part without your ESD strap. It may be damaged.')}
 UI.msg=m.join(' ');redraw()}}
function cons(){const n=[];J.comps.forEach(c=>{if(!c.has||c.jump)return;
 if(c.rev&&!c.revDone){c.revDone=1;const t=c.type;if(t=='ecap'){c.mode='ebulge';S.money=Math.max(0,S.money-10);n.push(`${c.ref}: the electrolytic capacitor was reverse-biased, so it vented and is now bulged (repair bill $10).`)}else if(t=='bat'){c.mode='bdead';S.money=Math.max(0,S.money-25);n.push(`${c.ref}: the battery was connected backwards. Protection tripped and the cell is ruined (bill $25).`)}else n.push(`${c.ref}: a reversed ${TYN[t].toLowerCase()} blocks or misdirects current, so the circuit cannot work. Refit it the right way round.`)}
 if(c.bad&&!c.badDone){c.badDone=1;const b=c.bad;if(b.fx&&!c.mode)c.mode=b.fx;if(b.pen)S.money=Math.max(0,S.money-b.pen);n.push(`${c.ref}: ${b.why}`+(b.pen?` (repair bill $${b.pen})`:''))}
 if(c.esdd&&!c.esdDone){c.esdDone=1;const m=(MODES[c.type]||[])[0];if(m&&!c.mode)c.mode=m;n.push(`${c.ref}: static discharge damaged the part. It no longer works.`)}});return n}
{const t0=A.test;A.test=function(){UI.cons=(J&&!J.open&&!UI.busy)?cons():null;t0()}}
{const s0=A.step;A.step=function(i){if(J&&!J.opened&&!J.rm[+i]&&isMains()&&!(J.s1&&J.s2)){UI.msg='Mains-powered device: complete the safety checklist first. Unplug it and discharge the capacitors.';beep(150);redraw();return}s0(i)}}
A.sfty=k=>{if(!J)return;if(k=='esd'){J.esd=J.esd===false;UI.msg=J.esd===false?'ESD strap off: static can silently damage chips, MOSFETs and displays.':'ESD strap worn: static is safely drained to ground.'}else{J[k]=!J[k];UI.msg=J[k]?(k=='s1'?'Unplugged from the wall.':'Capacitors discharged through a bleeder resistor.'):'Step undone.'}redraw()};
A.pause=()=>{if(!J||J.paused)return;J.paused=1;if(J.dl)J.pt=Date.now();redraw()};
A.resume=()=>{if(!J)return;J.paused=0;J.pt=0;redraw()};
setInterval(()=>{if(J&&J.paused&&J.dl&&J.pt){const n=Date.now();J.dl+=n-J.pt;J.pt=n}},200);
{const w0=win;win=function(){const j=J;w0();if(UI.done&&j){const sub=(j.comps||[]).filter(c=>c.req0).map(c=>`${c.ref}: ${P[c.has][0]} replaced ${P[c.req0][0]}.`);UI.done.f0=j.f0||[];UI.done.mist=j.mist||0;UI.done.sub=sub;UI.done.sc=j.mode?null:(j.bonus?['Bonus job','']:SC[j.lv-1]);UI.done.lv=j.lv;redraw()}}}
const TD=[[1e-7,'0.1 µs'],[1e-6,'1 µs'],[1e-5,'10 µs'],[1e-4,'0.1 ms'],[1e-3,'1 ms'],[5e-3,'5 ms'],[2e-2,'20 ms']],VD=[0.5,1,2,5,10];
UI.td=UI.td==null?5:UI.td;
UI.vd=UI.vd==null?2:UI.vd;
function sigOf(){const p=J.mm.r,st=sim();if(!p)return{kd:'none',msg:'No probe placed. Tap a part (or GND) to place the probe.'};if(!st.on)return{kd:'off',msg:'0 V: nothing is powered. Switch the bench supply output on.'};
 const k=nid(p),c=gc(p.split('.')[0]),v=p=='GND'?0:st.V[k]||0,a=p=='GND'?0:st.ac[k]||0,ok=c&&c.has&&!isOpen(c)&&v>1;let kd='dc',amp=0,fr=0;
 if(a>=11){kd='ac';amp=17;fr=50}else if(ok&&c.type=='osc'&&!c.mode){kd='sq';amp=v;fr=8e6}else if(ok&&c.type=='xtl'&&!c.mode){kd='sin';amp=v*.4;fr=16e6}else if(ok&&c.type=='mos'&&!c.mode){kd='pwm';amp=v;fr=1e5}else if(ok&&c.type=='mcu'&&!c.mode){kd='sq';amp=v;fr=1e3}
 return{kd,v,a,amp,fr}}
const fq=f=>f>=1e6?+(f/1e6).toFixed(2)+' MHz':f>=1e3?+(f/1e3).toFixed(2)+' kHz':+f.toFixed(1)+' Hz';
function scopeView(){const s=sigOf(),td=TD[UI.td][0],vd=VD[UI.vd];
 if(s.kd=='none'||s.kd=='off')return{pts:'0,67.5 240,67.5',read:s.msg,note:''};
 const kd=s.kd,fr=kd=='dc'?100:s.fr,y0=kd=='ac'?45:67.5,val=t=>{const ph=(t*fr)%1;return kd=='sq'?(ph<.5?s.amp:0):kd=='pwm'?(ph<.4?s.amp:0):kd=='sin'?s.v+s.amp*Math.sin(6.2832*fr*t):kd=='ac'?s.amp*Math.sin(6.2832*50*t):s.v+s.a*1.414*Math.sin(6.2832*100*t)};
 const cycles=fr*8*td,pts=[];let clip=false;const Y=v=>{let y=y0-v/vd*22.5;if(y<1||y>89)clip=true;return Math.max(1,Math.min(89,y)).toFixed(1)};
 if(cycles>60){const hi=kd=='ac'?s.amp:Math.max(s.v+(kd=='sin'?s.amp:0),s.amp||s.v),lo=kd=='ac'?-s.amp:(kd=='sin'?s.v-s.amp:0);for(let x=0;x<240;x++)pts.push(x+','+Y(x%2?hi:lo))}
 else for(let x=0;x<=240;x++)pts.push(x+','+Y(val(x/30*td)));
 const vpp=kd=='dc'?s.a*2.83:kd=='ac'?s.amp*2:kd=='sin'?s.amp*2:s.amp,vdc=kd=='dc'?s.v:kd=='sq'?s.amp/2:kd=='pwm'?s.amp*.4:kd=='sin'?s.v:0;
 const rd=`<b>${{dc:'DC with ripple',sq:'Square wave',sin:'Sine wave',pwm:'PWM switching',ac:'AC sine'}[kd]}</b><br>Peak-to-peak: ${vpp<1?(vpp*1000).toFixed(0)+' mV':vpp.toFixed(2)+' V'} · Average: ${vdc.toFixed(2)} V · ${kd=='dc'?'Ripple frequency':'Frequency'}: ${fq(fr)}`;
 const nt=cycles>60?'The signal is too fast for this time base. Choose a faster time/div.':clip?'The trace runs off the screen. Choose a larger volts/div.':(kd=='dc'&&s.a>.02?'Ripple on a DC rail means a weak filter capacitor.':'');
 return{pts:pts.join(' '),read:rd,note:nt}}
A.std=i=>{UI.td=+i;redraw()};
A.svd=i=>{UI.vd=+i;redraw()};
A.sauto=()=>{const s=sigOf();if(!s.kd||s.kd=='none'||s.kd=='off')return;const fr=s.kd=='dc'?100:s.fr;let bi=5,bd=1e9;TD.forEach((t,i)=>{const d=Math.abs(Math.log(fr*8*t[0]/3));if(d<bd){bd=d;bi=i}});UI.td=bi;const pk=Math.max(s.v||0,s.amp||0,.5)+(s.a||0)*2;let vi=VD.length-1;for(let i=0;i<VD.length;i++){if(pk<=VD[i]*3.2){vi=i;break}}UI.vd=vi;redraw()};
A.pname=()=>{const e=$('#pn');if(e){S.name=e.value.trim().slice(0,16);UI.msg='Name saved.';redraw()}};
const SAFE=[['ESD protection','Static electricity from your body can destroy chips, MOSFETs and displays without any visible sign.','Wear an ESD strap. If you turn it off and handle a sensitive part, that part may be damaged.'],['Battery polarity and Li-ion safety','Reversing a battery makes a short circuit. A swollen or punctured Li-ion cell can catch fire.','A reversed battery trips protection and ruins the cell. Swollen cells must be replaced, never heated or punctured.'],['Capacitor polarity and discharge','Electrolytic capacitors have a + side. Reversed or over-voltage, they vent. Large ones keep a charge after unplugging.','A reversed or under-rated electrolytic vents on power-up. Mains devices ask you to discharge capacitors first.'],['Current limiting','A current limit stops a fault from drawing damaging current while you diagnose.','The bench supply has a current limit. Start low (0.25 A to 0.5 A) so a short cannot burn parts.'],['Short-circuit risks','A short lets huge current flow, heating wires and parts within seconds.','A shorted part trips the supply or the protection and costs you a repair bill. Measure resistance with power off first.'],['Safe low-voltage testing','Test on the bench supply at the board rating instead of live mains.','All boards here run on the bench supply at low voltage.'],['Mains voltage hazards','Mains voltage can kill. Never open or probe a mains-powered device unless trained, and always unplug it.','Mains devices need the unplugged and discharged checklist before the case opens. This game never uses real mains.'],['Soldering safety','A soldering iron burns skin and its fumes irritate lungs.','Hold to heat only as long as needed. Too much heat damages parts, and a cold joint fails later.']];
window.ERS_ENG={SC,KB,compat,cons,TD,VD,sigOf,scopeView,SAFE,fq,isMains,newDev,num,esc};
})();
const cls=m=>{const e=$('#cls');if(e)e.textContent=m};
const cloud=async f=>{if(!window.ERS_CLOUD||!ERS_CLOUD.ready()){cls('Cloud save is not set up yet.');return}cls('Working…');try{await f()}catch(e){cls('Cloud save failed: '+(e&&e.message?e.message:'try again.'))}};
A.cup=()=>cloud(async()=>{save();cls(await ERS_CLOUD.upload(JSON.stringify(S)))});
A.cdn=()=>cloud(async()=>{const t=await ERS_CLOUD.download();if(!t){cls('No cloud save found for this account.');return}const m=impSave(t);if(m)cls(m)});
A.cout=()=>cloud(async()=>{cls(await ERS_CLOUD.signOut())});
if('serviceWorker' in navigator&&location.protocol!=='file:')window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
{const s1=A.step;A.step=function(i){i=+i;if(J&&J.rm[i]&&J.ops[i]=='S'){const lo=(J.parts||[]).filter(p=>p.t=='screw'&&!p.tray).length;if(lo){UI.msg='Collect the case screws in the parts tray first ('+lo+' still loose on the bench).';beep(150);redraw();return}}s1(i);if(J&&J.ops[i]=='S'&&!J.rm[i]){J.parts=(J.parts||[]).filter(p=>p.t!='screw');J.sc=[0,0,0,0]}}}
