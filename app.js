
const KEY='myHealthJourneyData';
const defaultData={
  weight:81.2, startWeight:82, goalWeight:64, waist:null,
  bp:[{date:'Today 7:15 AM',s:132,d:84,p:72}],
  steps:7842, stepGoal:8000, water:1.8, waterGoal:2.5,
  sleep:'7h 12m', fasting:'14h 32m', fastingGoal:14,
  checks:{bp:true,med:true,fast:true,steps:false,exercise:false},
  history:{weight:[82,81.8,81.6,81.5,81.4,81.2,81.2],bp:[145,141,139,137,134,132,131],steps:[8421,7892,9103,6842,8201,10421,7200],fast:[14,15,13,15,14,16,13]}
};
let data=JSON.parse(localStorage.getItem(KEY)||'null')||defaultData;
let activeTab='home';
let deferredPrompt=null;

const $=s=>document.querySelector(s);
function save(){localStorage.setItem(KEY,JSON.stringify(data))}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}
function pct(v,max){return Math.min(100,Math.round(v/max*100))}
function avg(a){return Math.round(a.reduce((x,y)=>x+y,0)/a.length)}
function score(){
  const c=data.checks;
  return Math.round((Object.values(c).filter(Boolean).length/Object.keys(c).length)*100);
}
function bars(values, labels=[]){
  const max=Math.max(...values);
  return `<div class="bars">${values.map((v,i)=>`<div class="bar-wrap"><div style="width:100%"><div class="bar" style="height:${Math.max(8,(v/max)*88)}px"></div><div class="bar-label">${labels[i]||''}</div></div></div>`).join('')}</div>`
}
function card(html,cls='card'){return `<section class="${cls}">${html}</section>`}

function render(){
  $('#pageTitle').textContent={home:'My Health Journey',health:'Health',log:'Log',insights:'Insights',more:'More'}[activeTab];
  document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.tab===activeTab));
  $('#app').innerHTML={home:home,health:health,log:log,insights:insights,more:more}[activeTab]();
}

function icon(name){
 const paths={
  weight:'<path d="M4 5h16l-1 15H5L4 5Z"/><path d="M9 5a3 3 0 0 1 6 0M8 11h8M9 15h6"/>',
  heart:'<path d="M20.8 8.8c0 5.2-8.8 11-8.8 11s-8.8-5.8-8.8-11A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z"/><path d="M3.5 12h4l2-4 3.2 8 2.1-4h5.7"/>',
  timer:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6M12 5V2"/>',
  walk:'<circle cx="14" cy="4" r="2"/><path d="m12 8-3 4 3 2 1 6M12 9l4 3 3 0M9 12l-3 5M16 12l-2 4 4 4"/>',
  water:'<path d="M12 3s-6 7-6 11a6 6 0 0 0 12 0c0-4-6-11-6-11Z"/>',
  sleep:'<path d="M20 15.5A8 8 0 0 1 8.5 4 8 8 0 1 0 20 15.5Z"/>',
  food:'<path d="M4 3v7M7 3v7M4 7h3M5.5 10v11M15 3v18M15 3c4 2 5 6 0 8"/>',
  meds:'<path d="m4 14 6-6a4.2 4.2 0 0 1 6 6l-6 6a4.2 4.2 0 0 1-6-6Z"/><path d="m8 10 6 6"/>',
  chart:'<path d="M4 19V5M4 19h17"/><path d="m7 15 4-4 3 2 5-7"/>',
  more:'<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>'
 }; return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]||paths.chart}</svg>`;
}

function home(){
  const s=score(), remain=Math.max(0,data.weight-data.goalWeight), progress=(data.startWeight-data.weight)/(data.startWeight-data.goalWeight);
  return `<div class="hero"><div><div class="eyebrow">TODAY</div><h2>Good day, Vignesh 🌱</h2><p>Small steps. Every day.</p></div><div class="score">${s}</div></div>
  <div class="section-title">Today</div>
  <div class="grid">
    ${metric(icon('weight'),'Weight',`${data.weight.toFixed(1)} kg`,'↓ this week')}
    ${metric(icon('heart'),'BP',data.bp[0]?`${data.bp[0].s}/${data.bp[0].d}`:'—','Latest reading')}
    ${metric(icon('timer'),'Fasting',data.fasting,`Goal ${data.fastingGoal}h`)}
    ${metric(icon('walk'),'Walking',data.steps.toLocaleString(),`/ ${data.stepGoal.toLocaleString()} steps`)}
    ${metric(icon('water'),'Water',`${data.water} L`,`/ ${data.waterGoal} L`)}
    ${metric(icon('sleep'),'Sleep',data.sleep,'Good')}
  </div>
  ${card(`<div class="row"><strong>Today's checklist</strong><span class="muted">${Object.values(data.checks).filter(Boolean).length}/5</span></div>
    ${check('bp','Log blood pressure')}${check('med','Take medication')}${check('fast','Complete fasting goal')}${check('steps','Reach 8,000 steps')}${check('exercise','Strength exercise')}`, 'card checklist-card')}
  ${card(`<div class="row"><strong>Journey to 64 kg</strong><b>${remain.toFixed(1)} kg left</b></div><div style="margin:14px 0 8px" class="progress"><div style="width:${Math.max(0,progress*100)}%"></div></div><div class="row muted"><span>${data.weight.toFixed(1)} kg</span><span>64 kg</span></div>`)}
  `;
}
function metric(i,t,v,s){return `<div class="metric"><div class="ico">${i}</div><div class="label">${t}</div><div class="value">${v}</div><div class="sub">${s}</div></div>`}
function check(k,label){return `<div class="check" data-check="${k}"><span>${data.checks[k]?'☑':'☐'}</span><span>${label}</span>${data.checks[k]?'<b>Done</b>':''}</div>`}

function health(){
  const bp=data.bp[0];
  const high=bp && (bp.s>180||bp.d>120);
  return `<div class="tabs"><button class="tab active">Overview</button><button class="tab">History</button><button class="tab">Trends</button></div>
  ${high?`<div class="alert">⚠️ This is a very high reading. Sit quietly and repeat the measurement after at least 1 minute. If it remains this high, contact a healthcare professional. If you have concerning symptoms such as chest pain, shortness of breath, weakness/numbness, vision changes or difficulty speaking, seek emergency care.</div>`:''}
  ${card(`<div class="row"><div><div class="muted">Latest Blood Pressure</div><div class="big-number">${bp?bp.s+'/'+bp.d:'—'}</div><div class="muted">${bp?bp.p+' bpm • '+bp.date:''}</div></div><span class="green">♥</span></div><div class="section-title">7-day systolic trend</div>${bars(data.history.bp,['M','T','W','T','F','S','S'])}<button class="btn full" onclick="openBp()">＋ Add BP reading</button>`)}
  ${card(`<div class="muted">Weight & Body</div><div class="big-number">${data.weight.toFixed(1)} kg</div><div class="muted">Goal 64 kg • ${Math.max(0,data.startWeight-data.weight).toFixed(1)} kg lost</div><div class="section-title">Weight trend</div>${bars(data.history.weight,['M','T','W','T','F','S','S'])}`)}
  `;
}

function log(){
 return `<div class="section-title">What would you like to log?</div>${[
 [icon('heart'),'Blood Pressure','Systolic, diastolic, pulse','openBp()'],
 [icon('weight'),'Weight','Weight and waist','openWeight()'],
 [icon('timer'),'Fasting','Start or end a fast','openFasting()'],
 [icon('walk'),'Walking','Steps and active minutes','openSteps()'],
 [icon('food'),'Meal','Meal and nutrition habits','openMeal()'],
 [icon('sleep'),'Sleep','Duration and quality','openSleep()']
 ].map(x=>`<div class="card log-tile" onclick="${x[3]}"><div class="round-icon">${x[0]}</div><div><h3>${x[1]}</h3><p>${x[2]}</p></div><span>›</span></div>`).join('')}`;
}

function insights(){
 return `${card(`<strong>What's working for you?</strong>
 <div class="insight"><div class="round-icon">${icon('walk')}</div><div><strong>Walking</strong><p>On higher-step days, your evening BP can be compared with lower-step days as more data accumulates.</p></div></div>
 <div class="insight"><div class="round-icon">${icon('sleep')}</div><div><strong>Sleep</strong><p>Keep collecting sleep and BP data to identify your personal patterns.</p></div></div>
 <div class="insight"><div class="round-icon">${icon('timer')}</div><div><strong>Fasting</strong><p>You are currently targeting a ${data.fastingGoal}-hour fasting window.</p></div></div>`)}
 ${card(`<strong>Weekly consistency</strong><div class="section-title">Walking</div><div class="progress"><div style="width:${pct(data.steps,data.stepGoal)}%"></div></div><p class="muted">${data.steps.toLocaleString()} / ${data.stepGoal.toLocaleString()} steps today</p><div class="section-title">BP logging</div><div class="progress"><div style="width:100%"></div></div><p class="muted">Keep recording morning and evening readings when appropriate.</p>`)}`;
}

function more(){
 return `${card(`<strong>My Health Journey</strong><p class="muted">A private, offline-first tracker. Your current entries are stored in this browser on this device.</p>`)}
 ${card(`<div class="log-tile" onclick="openSimple('Medications','Medication name')"><div class="round-icon">${icon('meds')}</div><div><h3>Medications</h3><p>Track scheduled doses</p></div>›</div>
 <div class="log-tile" onclick="openMeal()"><div class="round-icon">${icon('food')}</div><div><h3>Food & Nutrition</h3><p>Track simple food habits</p></div>›</div>
 <div class="log-tile" onclick="openSleep()"><div class="round-icon">${icon('sleep')}</div><div><h3>Sleep</h3><p>Duration and quality</p></div>›</div>
 <div class="log-tile" onclick="exportData()"><div class="round-icon">${icon('chart')}</div><div><h3>Export my data</h3><p>Download a JSON backup</p></div>›</div>
 <div class="log-tile" onclick="resetDemo()"><div class="round-icon">${icon('more')}</div><div><h3>Reset demo data</h3><p>Restore the sample dashboard</p></div>›</div>`)}`;
}

function openModal(title,body){
 $('#modalRoot').innerHTML=`<div class="modal-backdrop" onclick="if(event.target===this)closeModal()"><div class="modal"><div class="row"><h2>${title}</h2><button class="icon-btn" onclick="closeModal()">✕</button></div>${body}</div></div>`;
}
function closeModal(){$('#modalRoot').innerHTML=''}
function field(id,label,value,type='text',placeholder=''){return `<div class="field"><label>${label}</label><input id="${id}" type="${type}" value="${value??''}" placeholder="${placeholder}"></div>`}
function openBp(){openModal('Add Blood Pressure',`${field('sys','Systolic','132','number')}${field('dia','Diastolic','84','number')}${field('pulse','Pulse','72','number')}<p class="muted">Take two readings about one minute apart and record both when possible.</p><div class="actions"><button class="btn secondary" onclick="closeModal()">Cancel</button><button class="btn" onclick="saveBp()">Save reading</button></div>`)}
function saveBp(){const s=+$('#sys').value,d=+$('#dia').value,p=+$('#pulse').value;if(!s||!d){toast('Please enter systolic and diastolic');return}data.bp.unshift({date:new Date().toLocaleString(),s,d,p});data.history.bp.push(s);data.history.bp=data.history.bp.slice(-7);data.checks.bp=true;save();closeModal();render();toast('Blood pressure saved')}
function openWeight(){openModal('Log Weight',`${field('weight','Weight (kg)',data.weight,'number')}${field('waist','Waist (cm)',data.waist||'','number','Optional')}<div class="actions"><button class="btn secondary" onclick="closeModal()">Cancel</button><button class="btn" onclick="saveWeight()">Save</button></div>`)}
function saveWeight(){const w=+$('#weight').value;if(!w){toast('Enter your weight');return}data.weight=w;data.waist=$('#waist').value?+$('#waist').value:null;data.history.weight.push(w);data.history.weight=data.history.weight.slice(-7);save();closeModal();render();toast('Weight saved')}
function openFasting(){openModal('Fasting',`${field('fast','Current fasting duration',data.fasting)}${field('goal','Goal (hours)',data.fastingGoal,'number')}<div class="actions"><button class="btn secondary" onclick="closeModal()">Cancel</button><button class="btn" onclick="saveFast()">Save</button></div>`)}
function saveFast(){data.fasting=$('#fast').value;data.fastingGoal=+$('#goal').value||14;data.checks.fast=true;save();closeModal();render();toast('Fasting updated')}
function openSteps(){openModal('Walking',`${field('steps','Steps',data.steps,'number')}${field('stepGoal','Daily goal',data.stepGoal,'number')}${field('active','Active minutes','30','number')}<div class="actions"><button class="btn secondary" onclick="closeModal()">Cancel</button><button class="btn" onclick="saveSteps()">Save</button></div>`)}
function saveSteps(){data.steps=+$('#steps').value||0;data.stepGoal=+$('#stepGoal').value||8000;data.checks.steps=data.steps>=data.stepGoal;data.history.steps.push(data.steps);data.history.steps=data.history.steps.slice(-7);save();closeModal();render();toast('Walking updated')}
function openMeal(){openModal('Meal',`${field('meal','Meal','Lunch')}${field('foods','Food / notes','') }<div class="actions"><button class="btn secondary" onclick="closeModal()">Cancel</button><button class="btn" onclick="closeModal();toast('Meal saved')">Save</button></div>`)}
function openSleep(){openModal('Sleep',`${field('sleep','Sleep duration',data.sleep)}<div class="field"><label>Quality</label><select id="quality"><option>5 / 5</option><option selected>4 / 5</option><option>3 / 5</option><option>2 / 5</option><option>1 / 5</option></select></div><div class="actions"><button class="btn secondary" onclick="closeModal()">Cancel</button><button class="btn" onclick="data.sleep=$('#sleep').value;save();closeModal();render();toast('Sleep saved')">Save</button></div>`)}
function openSimple(title,label){openModal(title,`${field('simple',label,'')}<div class="actions"><button class="btn" onclick="closeModal();toast('Saved')">Save</button></div>`)}
function exportData(){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='my-health-journey-backup.json';a.click();toast('Backup downloaded')}
function resetDemo(){if(confirm('Reset all local data to the demo values?')){localStorage.removeItem(KEY);data=JSON.parse(JSON.stringify(defaultData));render();toast('Demo data restored')}}
document.addEventListener('click',e=>{
 const nav=e.target.closest('.nav-item'); if(nav){activeTab=nav.dataset.tab;render()}
 const chk=e.target.closest('[data-check]'); if(chk){data.checks[chk.dataset.check]=!data.checks[chk.dataset.check];save();render()}
});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('#installBtn').hidden=false});
$('#installBtn').addEventListener('click',async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();deferredPrompt=null});
if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{});
render();
