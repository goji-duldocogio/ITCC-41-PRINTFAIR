/* pc retrieval UI, shares demonstration localStorage with mobile ui in the same browser profile. */
(() => {
  'use strict';
  const KEY='printfair-m2-prototype-2026';
  const input=document.querySelector('#k-code');
  const message=document.querySelector('#message');
  const result=document.querySelector('#result');
  const getState=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}};
  const show=(text,kind='error')=>{message.textContent=text;message.className=kind;};
  const clean=()=>{result.hidden=true;input.value='';message.textContent='';message.className='';input.focus();};
  function retrieve() {
    result.hidden=true;
    const code=input.value.trim().toUpperCase();
    if(!code) return show('Enter the code from your mobile request.');
    const state=getState();
    if(!state) return show('For demo for now, open PrintFair in another tab of the same browser.');
    const r=state.requests?.find(x=>String(x.code||'').toUpperCase()===code);
    if(!r) return show('Code not found. Check the code in My Requests.');
    if(r.status!=='Reserved') return show(`This request is ${String(r.status).toLowerCase()}; the code is no longer valid.`);
    const time=state.previewTime||new Date().toISOString();
    if(new Date(`${r.createdAt.slice(0,10)}T16:30:00+08:00`).getTime()<=new Date(time).getTime()) {
      r.status='Expired'; r.reason='Unused retrieval code expired';
      r.history ||= []; r.history.push({status:'Expired',at:time,reason:r.reason});
      localStorage.setItem(KEY,JSON.stringify(state));
      return show('This code has expired. The request remains in your history.');
    }
    r.status='Retrieved';
    r.retrievedAt=time;
    r.countedPages=r.pages;
    r.stationId='new5';
    r.reason='Document retrieved from PrintFair PC demo';
    r.history ||= [];r.history.push({status:'Retrieved',at:time,reason:r.reason});
    localStorage.setItem(KEY,JSON.stringify(state));
    document.querySelector('#filename').textContent=r.file;
    document.querySelector('#details').textContent=`${r.pages} pages requested · Range ${r.pageRange} · Retrieved`;
    result.hidden=false;
    show('Code accepted. The retrieval is now recorded in PrintFair.','success');
  }
  document.querySelector('#retrieve').addEventListener('click',retrieve);
  input.addEventListener('keydown',event=>{if(event.key==='Enter')retrieve();});
  document.querySelector('#reset').addEventListener('click',clean);
})();
