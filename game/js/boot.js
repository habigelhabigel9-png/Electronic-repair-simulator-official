/* Start-up: restore the save, prepare shared SVG defs and art, then show the right screen. */
window.DEVIMG={1:'dev-1.svg',2:'dev-2.svg',3:'dev-3.svg',4:'dev-4.svg',10:'dev-10.svg',12:'dev-12.svg',13:'dev-13.svg',14:'dev-14.svg',15:'dev-15.svg',16:'dev-16.svg'};
(function(){
 load();mig1();
 Object.keys(ART.DEVART).forEach(i=>{DV[i][3]=ART.DEVART[i]()});
 if(window.DEVIMG)Object.keys(DEVIMG).forEach(i=>{DV[i][3]=`<image href="assets/${DEVIMG[i]}" width="360" height="250" preserveAspectRatio="xMidYMid meet"/>`});
 document.body.insertAdjacentHTML('afterbegin',`<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${ART.A_DEFS}${ART.A_DEFS2}${ART.DEV_DEFS}</defs>${ZDEFS}</svg>`);
 if(!parseHash()){UI.screen='home';UI.arg=''}
 if(UI.screen=='job'&&!J){UI.screen='workshop'}
 render();
 if(!S.tut&&!done()&&!lessonsDone())setTimeout(showTour,300);
})();
