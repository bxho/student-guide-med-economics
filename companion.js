/* Study companion MVP. Local-only progress for this phase; no cloud sync for companion data yet. */
(function(){
'use strict';
const STORE='studentGuideCompanion_v1';
const $=(s,root=document)=>root.querySelector(s);
const load=()=>{try{return {...{chosen:null,introSeen:false,xp:0,coins:0,outfit:0,mood:'happy',roomItems:0,secret:false},...JSON.parse(localStorage.getItem(STORE)||'{}')}}catch(_){return {chosen:null,introSeen:false,xp:0,coins:0,outfit:0,mood:'happy',roomItems:0,secret:false}}};
let data=load(), panelOpen=false, selected='medicine', miniScore=0, syncTimer=null;
const save=()=>{try{localStorage.setItem(STORE,JSON.stringify(data))}catch(_){bubble('مساحة الحفظ المحلي ممتلئة؛ صدّر بيانات دليل الطالب كنسخة احتياطية.')}};
const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function art(kind,stage=0,outfit=0){
 const fox=kind==='economics', coat=fox?'#39866b':['#dcecff','#4b77ca','#f0f4ff','#263d71'][outfit%4], fur=fox?'#ed963f':'#d5a23e', ear=fox?'#e98734':'#c9922d', muzzle='#fff4df';
 const spots=fox?'':'<circle cx="35" cy="48" r="2.2" fill="#5a3b20"/><circle cx="61" cy="48" r="2.2" fill="#5a3b20"/><circle cx="30" cy="58" r="2" fill="#5a3b20"/><circle cx="66" cy="58" r="2" fill="#5a3b20"/>';
 const hat=outfit===1?'<path d="M23 32 Q48 12 73 32 L68 38 L28 38Z" fill="#fff"/><path d="M19 37 H77" stroke="#75a9e8" stroke-width="5"/>':'';
 const age=stage===0?0:stage===1?3:stage===2?6:9, scale=stage===0?.88:stage===1?.96:stage===2?1.03:1.08;
 return '<svg viewBox="0 0 96 112" role="img" aria-label="'+(fox?'الثعلب الاقتصادي':'الفهد الطبي')+'" xmlns="http://www.w3.org/2000/svg"><g transform="translate(48 57) scale('+scale+') translate(-48 -57)"><ellipse cx="48" cy="103" rx="25" ry="5" fill="#172b4b" opacity=".12"/><path d="M29 78 Q9 78 15 59 Q20 49 28 59" fill="none" stroke="'+fur+'" stroke-width="9" stroke-linecap="round"/><path d="M31 75 L25 93 L40 93 L45 78 M53 78 L57 93 L72 93 L65 75" fill="'+coat+'" stroke="#25395c" stroke-width="2"/><path d="M29 72 Q48 62 67 72 L65 89 Q48 98 31 89Z" fill="'+coat+'" stroke="#25395c" stroke-width="2"/><path d="M35 86 L61 86" stroke="#fff" stroke-width="2" opacity=".8"/><path d="M28 42 L23 18 L42 31 M54 31 L73 18 L68 43" fill="'+ear+'" stroke="#5a3b20" stroke-width="2" stroke-linejoin="round"/><path d="M29 25 L34 36 M65 25 L60 36" stroke="#f6c0b1" stroke-width="5"/><ellipse cx="48" cy="48" rx="'+(28+age*.35)+'" ry="'+(27+age*.25)+'" fill="'+fur+'" stroke="#5a3b20" stroke-width="2"/>'+spots+'<ellipse cx="48" cy="58" rx="19" ry="13" fill="'+muzzle+'"/><ellipse cx="39" cy="48" rx="4" ry="5" fill="#172033"/><ellipse cx="57" cy="48" rx="4" ry="5" fill="#172033"/><circle cx="40" cy="46" r="1.3" fill="#fff"/><circle cx="58" cy="46" r="1.3" fill="#fff"/><path d="M44 57 Q48 61 52 57" fill="none" stroke="#583d32" stroke-width="2" stroke-linecap="round"/><path d="M38 63 Q48 70 58 63" fill="none" stroke="#8c5e4c" stroke-width="2" stroke-linecap="round"/>'+hat+(fox?'<path d="M37 76 L48 83 L59 76" fill="none" stroke="#e3c65e" stroke-width="3"/>':'<path d="M48 72 L42 80 L48 87 L54 80Z" fill="#fff" stroke="#7e9bc8" stroke-width="1.5"/>')+(stage>=3?'<path d="M16 42 Q5 29 18 21 M78 42 Q91 29 78 21" fill="none" stroke="#ffe58b" stroke-width="3" stroke-linecap="round"/>':'')+'</g></svg>';
}
function stage(){return data.xp>=700?3:data.xp>=300?2:data.xp>=100?1:0}
function rank(){return ['صغير','يافع','بالغ','أسطوري'][stage()]}
function chosen(){return data.chosen==='economics'?'economics':'medicine'}
function getStudy(){try{return window.studentGuideExportState?window.studentGuideExportState():null}catch(_){return null}}
function computeProgress(){
 const s=getStudy(); if(!s)return;
 const tasks=(s.tasks||[]).filter(t=>t.done).length;
 const sessions=Number(s.sessions||0), cards=(s.cards||[]).length;
 const xp=tasks*25+sessions*10+cards*3;
 if(xp>data.xp){data.xp=xp;data.coins=Math.max(data.coins,Math.floor(xp/10));if(data.xp>=700)data.secret=true;save();renderBuddy();}
}
function syncLater(){clearTimeout(syncTimer);syncTimer=setTimeout(computeProgress,220)}
function bubble(msg){const b=$('#companionBubble');if(!b)return;b.textContent=msg;b.classList.add('show');clearTimeout(bubble.t);bubble.t=setTimeout(()=>b.classList.remove('show'),4300)}
function greeting(){const s=getStudy(),done=s?(s.tasks||[]).filter(t=>t.done).length:0;return ['جاهز ننجز خطوة صغيرة اليوم؟','أنا فخور باستمرارك. كل مراجعة تقرّبك من هدفك!','خلينا نراجع مهمة واحدة، وبعدها نأخذ استراحة.'][Math.floor(Date.now()/86400000)%3]+' '+(done?'أنجزت '+done+' مهمة؛ واصل!':'ابدأ بمهمة صغيرة اليوم.')}
function renderBuddy(){
 const dock=$('#companionDock');if(!dock)return;
 $('#companionArt').innerHTML=art(chosen(),stage(),data.outfit);
 $('#companionLabel').textContent=chosen()==='medicine'?'الفهد الطبي':'الثعلب الاقتصادي';
 $('#companionLevel').textContent=rank()+' · '+data.xp+' XP';
 $('#companionXp').style.width=Math.min(100,(data.xp%100))+'%';
 $('#companionStage').textContent='المستوى '+(stage()+1)+' من 4';
}
function openPanel(){panelOpen=true;$('#companionPanel').hidden=false;refreshPanel()}
function closePanel(){panelOpen=false;$('#companionPanel').hidden=true}
function refreshPanel(){
 const s=getStudy()||{tasks:[],sessions:0,cards:[]},done=(s.tasks||[]).filter(t=>t.done).length,total=(s.tasks||[]).length;
 $('#companionPanelArt').innerHTML=art(chosen(),stage(),data.outfit);
 $('#companionPanelName').textContent=chosen()==='medicine'?'الفهد الطبي':'الثعلب الاقتصادي';
 $('#companionRank').textContent=rank()+' · '+data.xp+' نقطة خبرة';
 $('#companionTaskStat').textContent=done+'/'+total;$('#companionCoinStat').textContent=data.coins;$('#companionSessionStat').textContent=s.sessions||0;
 $('#companionXp').style.width=Math.min(100,data.xp%100)+'%';
 $('#companionRoomNote').textContent=data.roomItems?'غرفتك صارت أدفأ! لديك '+data.roomItems+' قطعة ديكور.':'غرفتك جاهزة لأول قطعة ديكور.';
 $('#companionSecret').textContent=data.secret?'فتحت التحول السري! ✨':'أكمل إنجازاتك لاكتشاف التحولات النادرة.';
}
function overlay(first){
 const ov=$('#companionOverlay');ov.hidden=false;
 $('#companionIntroTitle').textContent=first?'اختر رفيق رحلتك':'أهلًا بعودتك!';
 $('#companionIntroCopy').textContent=first?'رحلتك الدراسية تبدأ الآن. اختر رفيقًا يكبر ويتطور مع إنجازاتك.':'رفيقك كان ينتظرك. مستعد لخطوة جديدة؟';
 $('#companionChoose').hidden=!first;$('#companionWelcome').hidden=first;
 $('#companionSkip').hidden=!first;
}
function finishIntro(){
 if(!data.chosen)data.chosen=selected;
 const s=getStudy();if(s&&s.major!==(data.chosen==='medicine'?'medicine':'economics')){const next={...s,major:data.chosen};if(window.studentGuideImportState)window.studentGuideImportState(next);if(window.studentCloudSave)window.studentCloudSave(next)}
 data.introSeen=true;save();$('#companionOverlay').hidden=true;renderBuddy();bubble(greeting());syncLater();
}
function inject(){
 if($('#companionDock'))return;
 const dock=document.createElement('div');dock.id='companionDock';dock.hidden=true;dock.innerHTML='<button id="companionLaunch" type="button" aria-label="افتح رفيق الدراسة"><span>✨ رفيقي</span><span id="companionLevel">صغير · 0 XP</span></button><div id="companionBuddy" tabindex="0" role="button" aria-label="تفاعل مع الرفيق"><div id="companionBubble" aria-live="polite"></div><div id="companionArt"></div></div><span id="companionLabel" hidden></span>';
 const panel=document.createElement('section');panel.id='companionPanel';panel.hidden=true;panel.setAttribute('aria-label','لوحة الرفيق');panel.innerHTML='<div class="companion-panel-head"><div style="display:flex;align-items:center;gap:8px"><div id="companionPanelArt" style="width:58px;height:66px"></div><div><h3 id="companionPanelName">رفيقي</h3><div id="companionRank" style="font-size:12px;color:#687793"></div></div></div><button class="companion-x" id="companionClose" type="button" aria-label="إغلاق">✕</button></div><div class="companion-meter"><span id="companionXp"></span></div><div id="companionStage" class="companion-stage"></div><div class="companion-stats"><div class="companion-stat">مهام مكتملة<strong id="companionTaskStat">0/0</strong></div><div class="companion-stat">عملات<strong id="companionCoinStat">0</strong></div><div class="companion-stat">جلسات تركيز<strong id="companionSessionStat">0</strong></div></div><p class="companion-message" id="companionRoomNote">غرفتك تنتظرك.</p><p class="companion-message" id="companionSecret">أكمل إنجازاتك لاكتشاف التحولات النادرة.</p><div class="companion-panel-actions"><button id="companionTalk" type="button">💬 شجعني</button><button id="companionMove" type="button">🐾 تمشية</button><button id="companionSleep" type="button">🌙 نوم</button><button id="companionOutfit" type="button">👕 تغيير الزي</button><button id="companionRoom" type="button">🏠 الغرفة</button><button id="companionMiniGame" type="button">⭐ لعبة سريعة</button><button id="companionAchievements" type="button">🏆 الإنجازات</button></div><div id="companionExtra" class="companion-mini" aria-live="polite"></div>';
 const overlay=document.createElement('div');overlay.id='companionOverlay';overlay.hidden=true;overlay.innerHTML='<section class="companion-card" dir="rtl"><button class="companion-skip" id="companionSkip" type="button">تخطي المشهد</button><p class="companion-kicker">STUDENT GUIDE · YOUR STUDY QUEST</p><h2 id="companionIntroTitle">اختر رفيق رحلتك</h2><p id="companionIntroCopy">رحلتك الدراسية تبدأ الآن.</p><div class="companion-heroes" id="companionChoose"><button class="companion-hero selected" type="button" data-companion-choice="medicine" aria-pressed="true"><span id="companionIntroCheetah"></span><strong>الطب · الفهد</strong><small>المثابرة والدقة</small></button><button class="companion-hero" type="button" data-companion-choice="economics" aria-pressed="false"><span id="companionIntroFox"></span><strong>الاقتصاد · الثعلب</strong><small>الذكاء والتخطيط</small></button></div><div id="companionWelcome" hidden><div style="width:140px;height:150px;margin:0 auto" id="companionWelcomeArt"></div></div><button class="companion-primary" id="companionBegin" type="button">ابدأ الرحلة ←</button><button class="companion-secondary" id="companionReturn" type="button" hidden>متابعة الدراسة</button><div class="companion-stage">الرفيق يتطور مع إنجازاتك · حفظ محلي في هذه النسخة</div></section>';
 document.body.append(dock,panel,overlay);
 $('#companionIntroCheetah').innerHTML=art('medicine',0,0);$('#companionIntroFox').innerHTML=art('economics',0,0);
}
function showExtra(html){$('#companionExtra').innerHTML=html}
function bind(){
 $('#companionLaunch').addEventListener('click',()=>{openPanel();bubble('أنا هنا! '+greeting())});
 $('#companionBuddy').addEventListener('click',()=>{if(!panelOpen){bubble(greeting());openPanel()}else bubble('اضغط على أزرار الرفيق لتجربة حركة مختلفة.')});
 $('#companionBuddy').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openPanel();bubble(greeting())}});
 $('#companionClose').addEventListener('click',closePanel);
 $('#companionTalk').addEventListener('click',()=>bubble(greeting()));
 $('#companionMove').addEventListener('click',()=>{const el=$('#companionBuddy');el.classList.remove('sleeping');el.classList.add('walking');bubble('جولة قصيرة! خذ نفسًا ثم ارجع لمهمتك.');setTimeout(()=>el.classList.remove('walking'),1800)});
 $('#companionSleep').addEventListener('click',()=>{const el=$('#companionBuddy');el.classList.toggle('sleeping');bubble(el.classList.contains('sleeping')?'غفوة قصيرة... أنا جاهز لما ترجع.':'صحيت! نكمل؟')});
 $('#companionOutfit').addEventListener('click',()=>{data.outfit=(data.outfit+1)%4;save();renderBuddy();refreshPanel();bubble('زي جديد! إنجازاتك تفتح المزيد من المظاهر مستقبلًا.')});
 $('#companionRoom').addEventListener('click',()=>{data.roomItems++;save();$('#companionRoomNote').textContent='أضفت قطعة ديكور رقم '+data.roomItems+' إلى غرفتك (تجريبي).';showExtra('<span>🪴</span><span>🛋️</span><span>🖼️</span><span>✨ ديكور الغرفة</span>')});
 $('#companionMiniGame').addEventListener('click',()=>{miniScore=0;showExtra('<strong>اجمع 5 نجوم!</strong> <span id="miniScore">0/5</span><button type="button" id="miniStar">⭐ اجمع نجمة</button>');$('#miniStar').addEventListener('click',()=>{miniScore++;$('#miniScore').textContent=miniScore+'/5';if(miniScore>=5){data.coins+=5;data.xp+=10;save();renderBuddy();refreshPanel();showExtra('<strong>أحسنت! +5 عملات و+10 XP 🎉</strong>')}})});
 $('#companionAchievements').addEventListener('click',()=>showExtra('<strong>إنجازاتك</strong><span>📘 '+((getStudy()?.tasks||[]).filter(t=>t.done).length)+' مهمة</span><span>🌟 '+data.xp+' XP</span><span>'+ (data.secret?'✨ التحول السري مفتوح':'🔒 التحول السري عند 700 XP')+'</span>'));
 $('#companionSkip').addEventListener('click',()=>finishIntro());
 $('#companionBegin').addEventListener('click',()=>{if(!data.chosen)data.chosen=selected;finishIntro()});
 $('#companionReturn').addEventListener('click',()=>{$('#companionOverlay').hidden=true;data.introSeen=true;save()});
 document.querySelectorAll('[data-companion-choice]').forEach(btn=>btn.addEventListener('click',()=>{selected=btn.dataset.companionChoice;document.querySelectorAll('[data-companion-choice]').forEach(b=>{const on=b===btn;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on))});$('#companionBegin').textContent='اختيار '+(selected==='medicine'?'الفهد':'الثعلب')+' ←'}));
 // Drag the mascot within the viewport.
 const buddy=$('#companionBuddy');let drag=null;
 buddy.addEventListener('pointerdown',e=>{if(e.button!==0&&e.pointerType==='mouse')return;const r=buddy.getBoundingClientRect();drag={x:e.clientX-r.left,y:e.clientY-r.top};buddy.setPointerCapture(e.pointerId)});
 buddy.addEventListener('pointermove',e=>{if(!drag)return;const x=Math.max(0,Math.min(innerWidth-buddy.offsetWidth,e.clientX-drag.x));const y=Math.max(60,Math.min(innerHeight-buddy.offsetHeight,e.clientY-drag.y));buddy.style.position='fixed';buddy.style.left=x+'px';buddy.style.top=y+'px';buddy.style.zIndex='801'});
 const end=()=>{drag=null};buddy.addEventListener('pointerup',end);buddy.addEventListener('pointercancel',end);
 document.addEventListener('click',e=>{if(e.target.closest('#appContent button, #appContent form'))syncLater()});
 document.addEventListener('submit',e=>{if(e.target.closest('#appContent'))syncLater()});
 const app=$('#appContent');
 const mo=new MutationObserver(()=>{const visible=!app.classList.contains('auth-locked');dock.hidden=!visible;if(visible){computeProgress();if(!data.introSeen){selected=data.chosen||'medicine';overlay(true)}else{renderBuddy();if(!sessionStorage.getItem('companionWelcomeSeen')){sessionStorage.setItem('companionWelcomeSeen','1');overlay(false);$('#companionWelcomeArt').innerHTML=art(chosen(),stage(),data.outfit);$('#companionReturn').hidden=false;$('#companionBegin').hidden=true}}}});
 mo.observe(app,{attributes:true,attributeFilter:['class']});
 // App might already be unlocked on a warm reload.
 if(!app.classList.contains('auth-locked')){dock.hidden=false;if(!data.introSeen)overlay(true);else renderBuddy()}
}
function init(){
 inject();bind();renderBuddy();
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{}); 
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();