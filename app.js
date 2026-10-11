'use strict';
const KEY='hj2',$=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let db=load(),tab='today',metric='bp',range=7;
function load(){try{const d=JSON.parse(localStorage.getItem(KEY));if(d&&d.v===1&&Array.isArray(d.log))return d}catch(e){}return{v:1,settings:null,log:[]}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(db))}catch(e){toast('Could not save (storage full or blocked)')}}
const day=t=>{const d=new Date(t);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const tk=()=>day(Date.now()),of=t=>db.log.filter(e=>e.type===t),last=t=>of(t).slice(-1)[0];
function add(e){e.id=Date.now().toString(36)+Math.random().toString(36).slice(2,5);e.t=e.t||Date.now();db.log.push(e);db.log.sort((a,b)=>a.t-b.t);save();render();return e.id}
function del(id){db.log=db.log.filter(e=>e.id!==id);save();render()}
const waterToday=()=>of('water').filter(e=>day(e.t)===tk()).reduce((s,e)=>s+e.ml,0);
function activeFast(){const s=last('fast_start'),e=last('fast_end');return s&&(!e||e.t<s.t)?s:null}
function fmtH(h){const m=Math.round(h*60);return Math.floor(m/60)+'h '+String(m%60).padStart(2,'0')+'m'}
function weekDelta(){const w=of('weight');if(w.length<2)return null;const l=w[w.length-1],r=w.find(e=>e!==l&&e.t>=l.t-7*864e5);return r?l.kg-r.kg:null}
function bpInfo(s,d){return s>180||d>120?['Very high','b']:s>=140||d>=90?['Stage 2 range','b']:s>=130||d>=80?['Stage 1 range','w']:s>=120?['Elevated','w']:['Normal range','']}
function streak(){const ds=new Set(db.log.map(e=>day(e.t)));let n=0,t=Date.now();if(!ds.has(day(t)))t-=864e5;while(ds.has(day(t))){n++;t-=864e5}return n}
function checks(){const s=db.settings,has=t=>of(t).some(e=>day(e.t)===tk()),f=activeFast(),le=last('fast_end');
 const ok=(f&&(Date.now()-f.t)/36e5>=s.fastGoal)||(le&&day(le.t)===tk()&&le.hours>=s.fastGoal);
 return[['Log blood pressure',has('bp')],['Log weight',has('weight')],[`Drink ${s.waterGoal} L of water`,waterToday()>=s.waterGoal*1000],[`Complete ${s.fastGoal}h fast`,!!ok]]}
const I={water:'<path d="M12 3s-6 7-6 11a6 6 0 0 0 12 0c0-4-6-11-6-11Z"/>',meal:'<path d="M5 3v7M8 3v7M5 7h3M6.5 10v11M16 3v18M16 3c4 2 5 6 0 8"/>',fast:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/>',pill:'<path d="m4 14 6-6a4.2 4.2 0 0 1 6 6l-6 6a4.2 4.2 0 0 1-6-6Z"/><path d="m8 10 6 6"/>',bp:'<path d="M20.8 8.8c0 5.2-8.8 11-8.8 11s-8.8-5.8-8.8-11A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z"/>',weight:'<path d="M4 5h16l-1 15H5L4 5Z"/><path d="M9 5a3 3 0 0 1 6 0M9 15h6"/>',home:'<path d="m3 10 9-7 9 7v10H4z"/>',chart:'<path d="M4 19V5M4 19h17M7 15l4-4 3 2 5-7"/>',list:'<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',save:'<path d="M12 3v12m0 0-4-4m4 4 4-4M5 21h14"/>'};
const ic=(n,s=24)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true">${I[n]}</svg>`;
function toast(m,undo){const t=$('#toast');t.innerHTML=esc(m)+(undo?'<button id="ud">Undo</button>':'');t.classList.add('on');if(undo)$('#ud').onclick=()=>{undo();t.classList.remove('on')};clearTimeout(toast.h);toast.h=setTimeout(()=>t.classList.remove('on'),undo?5000:2400)}
function sheet(h){const s=$('#sheet');if(!h){s.hidden=true;s.innerHTML='';return}s.hidden=false;s.innerHTML=`<div class="sh" role="dialog" aria-modal="true">${h}</div>`;const i=s.querySelector('input,select');i&&i.focus()}
const fld=(id,l,v='',t='number',x='')=>`<label for="${id}">${l}</label><input id="${id}" name="${id}" type="${t}" value="${esc(v)}" ${x}>`;
const btns=(ok='Save')=>`<div class="row"><button type="button" class="btn s" data-a="close">Cancel</button><button class="btn">${ok}</button></div>`;
const form=(k,t,b,ok)=>sheet(`<h3>${t}</h3><form data-k="${k}">${b}${btns(ok)}</form>`);

function render(){
 if(!db.settings){$('#nav').innerHTML='';return $('#app').innerHTML=setupView(false)}
 $('#nav').innerHTML=[['today','Today','home'],['trends','Trends','chart'],['history','History','list'],['backup','Backup','save']].map(([k,t,i])=>`<button class="nb ${tab===k?'on':''}" data-tab="${k}" ${tab===k?'aria-current="page"':''}>${ic(i,22)}${t}</button>`).join('');
 $('#app').innerHTML=({today:todayView,trends:trendsView,history:historyView,backup:backupView})[tab]();
}
function setupView(edit){const s=db.settings||{},w=last('weight');return`<div class="hero"><small>${edit?'GOALS':'WELCOME'}</small><h1>${edit?'Your goals':'Let’s set up'}</h1><p>Takes 30 seconds. Everything stays on this device.</p></div><form data-k="setup" class="card" style="margin-top:16px">${fld('name','Your name',s.name||'','text','required maxlength=30')}${edit?'':fld('cur','Current weight (kg)',w?w.kg:'','number','required min=20 max=300 step=0.1')}${fld('goal','Goal weight (kg)',s.goalWeight||'','number','required min=20 max=300 step=0.1')}${fld('wg','Daily water goal (litres)',s.waterGoal||2.5,'number','required min=0.5 max=8 step=0.1')}${fld('fg','Fasting goal (hours)',s.fastGoal||14,'number','required min=1 max=48')}<div class="row"><button class="btn full">${edit?'Save goals':'Start'}</button></div></form>`}
function todayView(){
 const s=db.settings,f=activeFast(),bp=last('bp'),w=last('weight'),wd=weekDelta(),c=checks(),n=c.filter(x=>x[1]).length,h=new Date().getHours();
 const bi=bp&&bpInfo(bp.s,bp.d),le=last('fast_end');
 const Q=[['water','+250 ml','water'],['meal','Meal','meal'],['fast',f?'End fast':'Start fast','fast'],['pill','Meds (soon)',''],['bp','BP','bp'],['weight','Weight','weight']];
 return`<div class="hero"><small>${new Date().toLocaleDateString([],{weekday:'short',day:'numeric',month:'short'}).toUpperCase()}</small><h1>${h<12?'Good morning':h<17?'Good afternoon':'Good evening'}, ${esc(s.name)}</h1><p>${n} of ${c.length} done today · ${streak()}-day logging streak</p></div>
 <h2>Quick log</h2><div class="q">${Q.map(q=>`<button class="qb" ${q[2]?`data-q="${q[2]}"`:'disabled'}>${ic(q[0])}${q[1]}</button>`).join('')}</div>
 <h2>Today</h2><div class="grid">
 <div class="card t"><div class="l">Water</div><div class="v">${(waterToday()/1000).toFixed(2).replace(/\.?0+$/,'')} L</div><div class="s">of ${s.waterGoal} L</div></div>
 <div class="card t"><div class="l">Fasting</div><div class="v">${f?fmtH((Date.now()-f.t)/36e5):le?fmtH(le.hours):'—'}</div><div class="s">${f?'Running · ':le?'Last fast · ':''}Goal ${s.fastGoal}h</div></div>
 <div class="card t"><div class="l">Last BP</div><div class="v">${bp?bp.s+' / '+bp.d:'—'}</div><div class="s">${bp?`<span class="chip ${bi[1]}">${bi[0]}</span>`:'Not logged yet'}</div></div>
 <div class="card t"><div class="l">Weight</div><div class="v">${w?w.kg.toFixed(1)+' kg':'—'}</div><div class="s">${wd==null?`Goal ${s.goalWeight} kg`:(wd<=0?'↓ ':'↑ ')+Math.abs(wd).toFixed(1)+' kg this week'}</div></div></div>
 <h2>Checklist</h2><div class="card" style="padding:4px 14px">${c.map(x=>`<div class="ck"><span class="bx ${x[1]?'on':''}">${x[1]?'✓':''}</span>${esc(x[0])}</div>`).join('')}</div>`}
const avg=a=>a.reduce((x,y)=>x+y,0)/a.length,fd=t=>new Date(t).toLocaleDateString([],{day:'numeric',month:'short'});
function chart(lines,o){
 const W=340,H=190,L=34,R=14,T=16,B=26,vs=lines.flatMap(l=>l.pts.map(p=>p[1]));let lo=Math.min(...vs),hi=Math.max(...vs);
 (o.bands||[]).forEach(b=>{lo=Math.min(lo,b[0]);hi=Math.max(hi,b[1])});if(o.goal!=null){lo=Math.min(lo,o.goal);hi=Math.max(hi,o.goal)}
 const pad=((hi-lo)||1)*.12;lo-=pad;hi+=pad;
 const X=t=>L+(t-o.from)/(o.to-o.from)*(W-L-R),Y=v=>T+(hi-v)/(hi-lo)*(H-T-B),fx=v=>(hi-lo)<10?v.toFixed(1):Math.round(v);
 let g=[0,1,2,3].map(i=>{const v=lo+(hi-lo)*i/3;return`<line x1="${L}" x2="${W-R}" y1="${Y(v)}" y2="${Y(v)}" style="stroke:var(--l)"/><text x="${L-5}" y="${Y(v)+3}" text-anchor="end" style="fill:var(--m);font-size:9px">${fx(v)}</text>`}).join('');
 g+=(o.bands||[]).map(b=>`<rect x="${L}" y="${Y(b[1])}" width="${W-L-R}" height="${Y(b[0])-Y(b[1])}" fill="${b[2]}" opacity=".18"/>`).join('');
 if(o.goal!=null)g+=`<line x1="${L}" x2="${W-R}" y1="${Y(o.goal)}" y2="${Y(o.goal)}" stroke="#B3261E" stroke-width="1.4" stroke-dasharray="5 4" opacity=".75"/>`;
 g+=lines.map(l=>{const p=l.pts.map(q=>[X(q[0]),Y(q[1])]),e=p[p.length-1];return(p.length>1?`<polyline points="${p.map(q=>q.join(',')).join(' ')}" fill="none" stroke="${l.c}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`:'')+p.map((q,i)=>`<circle cx="${q[0]}" cy="${q[1]}" r="${i===p.length-1?4.5:2.6}" fill="${l.c}"/>`).join('')+`<text x="${Math.min(e[0],W-R)}" y="${e[1]-9}" text-anchor="end" style="fill:var(--ink);font-size:10px;font-weight:700">${fx(l.pts[l.pts.length-1][1])}</text>`}).join('');
 g+=`<text x="${L}" y="${H-6}" style="fill:var(--m);font-size:9px">${fd(o.from)}</text><text x="${W-R}" y="${H-6}" text-anchor="end" style="fill:var(--m);font-size:9px">${fd(o.to)}</text>`;
 return`<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="${esc(o.label)}">${g}</svg>`}
function trendsView(){
 const now=Date.now(),from=now-range*864e5,s=db.settings,inR=e=>e.t>=from,o={from,to:now};let lines=[],stats='',leg='',note='',add='bp',n=0,label='';
 if(metric==='bp'){const a=of('bp').filter(inR);n=a.length;lines=[{pts:a.map(e=>[e.t,e.s]),c:'#145A46'},{pts:a.map(e=>[e.t,e.d]),c:'#B08A2E'}];o.bands=[[90,129,'#145A46'],[60,79,'#D0B16E']];
  if(n){const l=a[n-1],bi=bpInfo(l.s,l.d);stats=`<div class="v">${l.s} / ${l.d} <span class="chip ${bi[1]}">${bi[0]}</span></div><div class="s">Average ${Math.round(avg(a.map(e=>e.s)))} / ${Math.round(avg(a.map(e=>e.d)))} · ${n} reading${n>1?'s':''}</div>`}
  leg='<span><b style="color:#145A46">●</b> Systolic</span><span><b style="color:#B08A2E">●</b> Diastolic</span>';note='Shaded bands = commonly used targets (under 130/80). Your doctor may set different ones.';label='Blood pressure trend'}
 else if(metric==='weight'){const a=of('weight').filter(inR);n=a.length;lines=[{pts:a.map(e=>[e.t,e.kg]),c:'#145A46'}];o.goal=s.goalWeight;
  if(n){const d=a[n-1].kg-a[0].kg;stats=`<div class="v">${a[n-1].kg.toFixed(1)} kg</div><div class="s">${n>1?(d<=0?'↓ ':'↑ ')+Math.abs(d).toFixed(1)+' kg over this period · ':''}${Math.abs(a[n-1].kg-s.goalWeight).toFixed(1)} kg ${a[n-1].kg>s.goalWeight?'to go':'past goal'}</div>`}
  note=`Dashed line = your goal (${s.goalWeight} kg).`;add='weight';label='Weight trend'}
 else if(metric==='water'){const m={};of('water').filter(inR).forEach(e=>{const k=day(e.t);m[k]=(m[k]||0)+e.ml});const k=Object.keys(m);n=k.length;
  lines=[{pts:k.map(d=>{const t=new Date(d+'T12:00:00').getTime();return[Math.min(Math.max(t,from),now),m[d]/1000]}),c:'#145A46'}];o.goal=s.waterGoal;
  if(n)stats=`<div class="v">${avg(k.map(d=>m[d]/1000)).toFixed(1)} L / day</div><div class="s">Average over ${n} logged day${n>1?'s':''} · goal ${s.waterGoal} L</div>`;
  note='Daily totals. Dashed line = your daily goal.';add='waterc';label='Daily water trend'}
 else{const a=of('sleep').filter(inR);n=a.length;lines=[{pts:a.map(e=>[e.t,e.hours]),c:'#145A46'}];o.bands=[[7,9,'#145A46']];
  if(n)stats=`<div class="v">${avg(a.map(e=>e.hours)).toFixed(1)} h average</div><div class="s">${n} night${n>1?'s':''} logged · average quality ${avg(a.map(e=>e.q)).toFixed(1)}/5</div>`;
  note='Shaded band = 7 to 9 hours, common guidance for adults. Needs vary by person.';add='sleep';label='Sleep trend'}
 o.label=label;const addT={bp:'Add BP reading',weight:'Log weight',waterc:'Add water',sleep:'Log sleep'}[add];
 return`<h2 style="margin-top:22px;font-size:22px">Trends</h2><div style="display:flex;gap:8px;overflow-x:auto;padding:2px 0">${Object.keys(M).map(k=>`<button class="btn ${metric===k?'':'s'}" style="min-height:44px;padding:0 14px" data-m="${k}" aria-pressed="${metric===k}">${M[k]}</button>`).join('')}</div>
 <div style="display:flex;gap:8px;margin:12px 0">${[[7,'1W'],[30,'1M'],[90,'3M'],[365,'1Y']].map(([d,t])=>`<button class="btn ${range===d?'':'s'}" style="flex:1;min-height:44px;padding:0" data-r="${d}" aria-pressed="${range===d}">${t}</button>`).join('')}</div>
 <div class="card">${n?`<div class="t">${stats}</div>${chart(lines,o)}<div style="display:flex;gap:16px;font-size:12px">${leg}</div><p class="m" style="line-height:1.45;margin:8px 0 0">${note}</p>`:`<p class="m" style="margin:6px 0 14px">No ${M[metric].toLowerCase()} entries in this period yet.</p>`}<button class="btn full" style="margin-top:14px" data-q="${add}">＋ ${addT}</button></div>`}
const M={bp:'Blood pressure',weight:'Weight',water:'Water',sleep:'Sleep'};
function desc(e){return({water:`+${e.ml} ml water`,meal:`${esc(e.kind)}${e.note?': '+esc(e.note):''}`,bp:`BP ${e.s}/${e.d}${e.p?' · '+e.p+' bpm':''}`,weight:`Weight ${e.kg} kg`,fast_start:'Started a fast',fast_end:`Ended fast · ${fmtH(e.hours)}`,sleep:`Sleep ${e.hours} h · quality ${e.q}/5`})[e.type]||esc(e.type)}
function historyView(){const L=db.log.slice().reverse().slice(0,200);return`<h2 style="margin-top:22px">History</h2><div class="card" style="padding:4px 14px">${L.length?L.map(e=>`<div class="it"><div>${desc(e)}<small>${new Date(e.t).toLocaleString([],{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</small></div><button class="btn d" data-del="${e.id}" aria-label="Delete entry">Delete</button></div>`).join(''):'<p class="m">Nothing logged yet.</p>'}</div>`}
function backupView(){return`<h2 style="margin-top:22px">Backup & goals</h2><div class="card"><p class="m" style="margin-top:0">${db.log.length} entries stored on this device only. Export regularly: clearing browser data erases them.</p><div class="row" style="margin-top:0"><button class="btn" data-a="export">Export backup</button><button class="btn s" data-a="import">Restore…</button></div><input id="imp" type="file" accept=".json,application/json" hidden></div><div class="card" style="margin-top:12px"><div class="row" style="margin-top:0"><button class="btn s" data-a="goals">Edit goals</button><button class="btn d" data-a="erase">Erase all</button></div></div>`}

function quick(k){
 if(k==='sleep')return form('sleep','Log last night’s sleep',fld('h','Hours slept','','number','required min=0.5 max=16 step=0.25 inputmode=decimal')+`<label for="q">Quality</label><select id="q" name="q">${[5,4,3,2,1].map(n=>`<option ${n===4?'selected':''} value="${n}">${n} / 5</option>`).join('')}</select>`);
 if(k==='waterc')return form('waterc','Add water',fld('ml','Amount (ml)','','number','required min=10 max=3000 inputmode=numeric'));
 if(k==='water'){const id=add({type:'water',ml:250});return toast('+250 ml',()=>del(id))}
 if(k==='meal'){const h=new Date().getHours();return form('meal','Log meal',`<label for="kind">Meal</label><select id="kind" name="kind">${['Breakfast','Lunch','Snack','Dinner'].map(m=>`<option ${m===(h<11?'Breakfast':h<15?'Lunch':h<18?'Snack':'Dinner')?'selected':''}>${m}</option>`).join('')}</select>${fld('note','What did you eat? (optional)','','text','maxlength=120')}`)}
 if(k==='bp')return form('bp','Add blood pressure',`${fld('s','Systolic','','number','required min=50 max=300 inputmode=numeric')}${fld('d','Diastolic','','number','required min=30 max=200 inputmode=numeric')}${fld('p','Pulse (optional)','','number','min=30 max=250')}<p class="m">Sit quietly for 5 minutes first. Two readings a minute apart are best.</p>`)
 if(k==='weight'){const w=last('weight');return form('weight','Log weight',fld('kg','Weight (kg)',w?w.kg:'','number','required min=20 max=300 step=0.1'))}
 if(k==='fast'){const f=activeFast();return f?sheet(`<h3>End fast?</h3><p>You've fasted ${fmtH((Date.now()-f.t)/36e5)}.</p><div class="row"><button class="btn s" data-a="close">Keep going</button><button class="btn" data-a="endfast">End fast</button></div>`):form('fast','Start a fast',fld('ago','Started how many hours ago?',0,'number','min=0 max=48 step=0.25'),'Start')}
}
document.addEventListener('submit',ev=>{ev.preventDefault();const f=ev.target,k=f.dataset.k,v=n=>f.elements[n]&&f.elements[n].value,N=n=>parseFloat(v(n));
 if(k==='setup'){const old=db.settings;db.settings={name:v('name').trim(),goalWeight:N('goal'),waterGoal:N('wg'),fastGoal:N('fg')};if(!old&&v('cur'))add({type:'weight',kg:N('cur')});save();sheet();render();return}
 sheet();
 if(k==='sleep'){add({type:'sleep',hours:N('h'),q:+v('q')});toast('Sleep saved')}
 if(k==='waterc'){add({type:'water',ml:N('ml')});toast('Water added')}
 if(k==='bp'){const s=N('s'),d=N('d');if(d>=s){toast('Systolic should be higher than diastolic');return}add({type:'bp',s,d,p:N('p')||0});if(s>180||d>120)sheet(`<div class="alert"><b>This is a very high reading.</b> Sit quietly and repeat it after at least a minute. If it stays this high, contact a healthcare professional. If you have chest pain, shortness of breath, weakness or numbness, vision changes or difficulty speaking, seek emergency care now.</div><div class="row"><button class="btn" data-a="close">I understand</button></div>`);else toast('Blood pressure saved')}
 if(k==='weight'){add({type:'weight',kg:N('kg')});toast('Weight saved')}
 if(k==='meal'){add({type:'meal',kind:v('kind'),note:v('note').trim()});toast('Meal saved')}
 if(k==='fast'){add({type:'fast_start',t:Date.now()-(N('ago')||0)*36e5});toast('Fast started')}
});
document.addEventListener('click',ev=>{const b=ev.target.closest('button,[data-q]');if(!b)return;const D=b.dataset;
 if(D.m){metric=D.m;render()}else if(D.r){range=+D.r;render()}else if(D.tab){tab=D.tab;render();scrollTo(0,0)}else if(D.q)quick(D.q);else if(D.del){if(confirm('Delete this entry?'))del(D.del)}
 else if(D.a==='close')sheet();
 else if(D.a==='endfast'){const f=activeFast();sheet();if(f){add({type:'fast_end',hours:+((Date.now()-f.t)/36e5).toFixed(2)});toast('Fast ended')}}
 else if(D.a==='export'){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(db,null,2)],{type:'application/json'}));a.download=`health-journey-backup-${tk()}.json`;a.click();toast('Backup downloaded')}
 else if(D.a==='import')$('#imp').click();
 else if(D.a==='goals'){$('#app').innerHTML=setupView(true)}
 else if(D.a==='erase'){if(confirm('Erase ALL data on this device? Export a backup first.')&&confirm('Really erase everything?')){db={v:1,settings:null,log:[]};save();render()}}
});
document.addEventListener('change',ev=>{if(ev.target.id!=='imp')return;const f=ev.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(d.v!==1||!Array.isArray(d.log)||!d.log.every(e=>e&&e.id&&typeof e.t==='number'&&e.type))throw 0;if(confirm(`Replace current data with this backup (${d.log.length} entries)?`)){db=d;save();render();toast('Backup restored')}}catch(e){toast('That file is not a valid backup')}};r.readAsText(f)});
setInterval(()=>{if(db.settings&&tab==='today'&&$('#sheet').hidden&&activeFast()&&document.activeElement===document.body)render()},60000);
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
render();
