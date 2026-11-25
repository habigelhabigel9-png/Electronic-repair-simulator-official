/* New interface core: router, shell, icons, events. Talks to the engine through S, J, UI and A only. */
const esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const ICN={home:'M3 11l9-8 9 8M5 10v10h14V10M10 20v-6h4v6',learn:'M2 9l10-5 10 5-10 5zM6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5M22 9v5',bench:'M3 5h18v4H3zM5 9v11M19 9v11M9 13h6M3 20h18',chip:'M7 7h10v10H7zM9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4',chart:'M4 20V11M10 20V4M16 20v-7M22 20H2',user:'M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4 21c1-5 4-7 8-7s7 2 8 7',gear:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 13a7.5 7.5 0 0 0 0-2l2-1.500-2-3.500-2.400 1a7.500 7.500 0 0 0-1.700-1L15 3h-4l-.3 2.500a7.500 7.500 0 0 0-1.700 1l-2.400-1-2 3.500 2 1.500a7.500 7.500 0 0 0 0 2l-2 1.500 2 3.500 2.400-1a7.500 7.500 0 0 0 1.700 1L11 21h4l.3-2.500a7.500 7.500 0 0 0 1.700-1l2.400 1 2-3.500z',check:'M5 13l4 4L19 7',lock:'M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3',play:'M7 4l13 8-13 8z',star:'M12 3l2.700 5.600 6.100.9-4.400 4.300 1 6.100L12 17l-5.400 2.900 1-6.100L3.200 9.500l6.100-.9z',clock:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',bolt:'M13 2L4 14h7l-1 8 9-12h-7z',coin:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v10M9.500 10h4a1.500 1.500 0 0 1 0 3h-3a1.500 1.500 0 0 0 0 3h4',left:'M15 5l-7 7 7 7',right:'M9 5l7 7-7 7',x:'M6 6l12 12M18 6L6 18',plus:'M12 5v14M5 12h14',minus:'M5 12h14',pause:'M8 5v14M16 5v14',bulb:'M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10c1 1 1 2 1 3h6c0-1 0-2 1-3a6 6 0 0 0-4-10z',book:'M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h10',shield:'M12 3l8 3v6c0 5-3.500 8-8 9-4.500-1-8-4-8-9V6zM9 12l2 2 4-4',trophy:'M8 4h8v5a4 4 0 0 1-8 0zM8 6H4c0 3 1 4 4 4M16 6h4c0 3-1 4-4 4M12 13v4M8 21h8M9 17h6',tool:'M14.500 6.500a4 4 0 0 0 5 5L21 10l-3-3-1.500 1.500M14 7L4 17l3 3 10-10',search:'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-5-5',box:'M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10',cart:'M3 4h3l2 12h10l2-8H7M9 20h.01M17 20h.01',save:'M5 4h12l3 3v13H5zM8 4v5h8V4M8 20v-6h8v6',cloud:'M7 18a4 4 0 0 1-.5-8 5.500 5.500 0 0 1 10.500 1A3.500 3.500 0 0 1 17 18z',flag:'M5 21V4M5 5h11l-2 4 2 4H5',eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',info:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v6M12 7.500h.01',fire:'M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z',warn:'M12 3l10 18H2zM12 10v5M12 18h.01',dice:'M5 5h14v14H5zM9 9h.01M15 9h.01M12 12h.01M9 15h.01M15 15h.01'};
const ic=(n,c)=>`<svg class="i ${c||''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ICN[n]||ICN.info}"/></svg>`;
const toolIc=k=>`<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[k]||''}</svg>`;
/* ---- routing ---- */
const NAVS=[['home','Home','home'],['learn','Learn','learn'],['workshop','Workshop','bench'],['library','Library','chip'],['progress','Progress','chart']];
const ALIAS={menu:'home',career:'progress',levels:'workshop',job:'job',workshop:'workshop',inventory:'library',shop:'library',skills:'progress',history:'progress',settings:'me',tutorial:'learn',result:'result',learn:'learn',lesson:'lesson',profile:'me',safety:'safety'};
const GROUP={home:'home',learn:'learn',lab:'learn',lesson:'learn',safety:'learn',workshop:'workshop',job:'workshop',result:'workshop',library:'library',comp:'library',progress:'progress',me:'me'};
const VIEWS={};
UI.screen='home';UI.tab=UI.tab||'ticket';
function go(s,arg){if(s=='inventory'){UI.libTab='parts'}else if(s=='shop'){UI.libTab='store'}else if(s=='skills'){UI.progTab='skills'}else if(s=='history'){UI.progTab='log'}else if(s=='career'||s=='levels'){UI.progTab='map'}
 if(s=='workshop'&&J)s='job';
 UI.screen=ALIAS[s]||s;UI.arg=arg==null?'':arg;UI.msg='';
 const h='#/'+UI.screen+(UI.arg!==''?'/'+UI.arg:'');if(location.hash!==h){UI._hs=1;try{history.pushState(null,'',h)}catch(e){location.hash=h}UI._hs=0}
 render()}
function parseHash(){const m=/^#\/([a-z]+)(?:\/(.+))?$/.exec(location.hash);if(!m||!VIEWS[m[1]])return false;if(m[1]=='job'&&!J)return false;UI.screen=m[1];UI.arg=m[2]||'';return true}
window.addEventListener('popstate',()=>{if(parseHash())render()});
function render(){save();paint(true);if(UI.screen!='job')window.scrollTo(0,0);const m=document.getElementById('main');if(m)m.scrollTop=0}
function redraw(){save();paint(false)}
let _t=0;function toast(m){const e=document.getElementById('toast');if(!e||!m)return;e.textContent=m;e.className='show';clearTimeout(_t);_t=setTimeout(()=>e.className='',3800)}
/* ---- shell ---- */
const stars=()=>Object.keys(S.done).reduce((a,k)=>a+(S.done[k]||0),0);
function rankName(){return RANKS[Math.min(5,Math.floor(done()/10))]}
function chips(){const pl=plv(),xp=S.xp%150;return`<button class="chip lvl" data-act="go" data-a="me" aria-label="Profile and settings"><b>${pl}</b><span><i style="width:${xp/1.5}%"></i></span></button><span class="chip" title="Money">${ic('coin')}$${S.money}</span><span class="chip amber" title="Stars earned">${ic('star')}${stars()}</span>`}
function shell(body){const g=GROUP[UI.screen]||'home';
 const nav=NAVS.map(([k,l,i])=>`<button class="nv${g==k?' on':''}" data-act="nav" data-a="${k}" ${g==k?'aria-current="page"':''}>${ic(i)}<span>${l}</span></button>`).join('');
 return`<div class="app"><aside class="side"><div class="brand"><svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="#0b7a5e"/><path d="M6 20h6l3-8 4 12 3-8h4" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg><div><b>ERS Academy</b><small>Electronics repair training</small></div></div><nav class="snav" aria-label="Main">${nav}</nav><div class="sfoot"><button class="who" data-act="go" data-a="me"><span class="av">${esc((S.name||'T').slice(0,1).toUpperCase())}</span><span><b>${esc(S.name||'Technician')}</b><small>${rankName()} · level ${plv()}</small></span></button></div></aside>
 <header class="top"><div class="brand sm"><svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="#0b7a5e"/><path d="M6 20h6l3-8 4 12 3-8h4" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg><b>ERS Academy</b></div><div class="chips">${chips()}</div></header>
 <main class="main" id="main">${body}</main><nav class="tabs" aria-label="Main">${nav}</nav></div>`}
function paint(full){const root=document.getElementById('app'),sc=UI.screen,V=VIEWS[sc]||VIEWS.home;
 if(sc=='job'&&!J){UI.screen='workshop';return paint(full)}
 if(V.custom){V.paint(full);return}
 UI._wk=0;document.body.classList.remove('wkmode');
 const m=document.getElementById('main'),st=m&&!full?m.scrollTop:0;
 root.innerHTML=shell(V.html());const m2=document.getElementById('main');if(m2)m2.scrollTop=st;
 V.mount&&V.mount();if(typeof mountWidgets=='function')mountWidgets();
 if(UI.msg&&sc!='result'){toast(UI.msg);UI.msg=''}}
/* ---- events ---- */
document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b||b.disabled)return;const f=A[b.dataset.act];if(f){e.preventDefault();f(b.dataset.a)}});
document.addEventListener('keydown',e=>{if(e.key=='Enter'||e.key==' '){const g=e.target.closest&&e.target.closest('.cp,.pad,.scw,.dv');if(g){e.preventDefault();if(g.dataset.act)A[g.dataset.act](g.dataset.a);else if(g.classList.contains('scw'))A.screwTap(g.dataset.i)}}
 if(e.key=='Escape'&&UI.screen=='job'&&J&&!/INPUT|TEXTAREA/.test(e.target.tagName))A.pause&&A.pause()});
A.go=a=>{const[r,x]=String(a).split('|');go(r,x)};
A.nav=a=>{if(UI.screen=='job'&&J&&J.dl&&!J.paused)A.pause();go(a)};
A.back=()=>history.length>1?history.back():go('home');
A.cont=()=>{if(J)return go('job');const nx=nextLesson();if(nx&&!done()&&!lessonsDone())return go('lesson',nx);const n=next();if(n)return A.start(String(n));go('workshop')};
