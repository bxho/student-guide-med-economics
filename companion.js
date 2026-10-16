/* Study companion MVP. Local-only progress for this phase; no cloud sync for companion data yet. */
(function(){
'use strict';
const STORE='studentGuideCompanion_v1';
const $=(s,root=document)=>root.querySelector(s);
const load=()=>{try{return {...{chosen:null,introSeen:false,xp:0,coins:0,outfit:0,mood:'happy',roomItems:0,car:0,secret:false,missionDay:'',missionDone:false,chatCount:0,badges:[]},...JSON.parse(localStorage.getItem(STORE)||'{}')}}catch(_){return {chosen:null,introSeen:false,xp:0,coins:0,outfit:0,mood:'happy',roomItems:0,secret:false}}};
let data=load(), panelOpen=false, selected='medicine', miniScore=0, syncTimer=null;
const save=()=>{try{localStorage.setItem(STORE,JSON.stringify(data))}catch(_){bubble('مساحة الحفظ المحلي ممتلئة؛ صدّر بيانات دليل الطالب كنسخة احتياطية.')}};
const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const COMPANIONS={
 medicine:{name:'الفهد الطبي',coat:'#3478b9',fur:'#d6a15e',accent:'#eaf4ff',kind:'animal',emoji:'⚕'},
 economics:{name:'الثعلب الاقتصادي',coat:'#23866c',fur:'#ed963f',accent:'#fff0cf',kind:'animal',emoji:'📈'},
 robot:{name:'ريكو',coat:'#168fbd',fur:'#e8f4ff',accent:'#44d8ff',kind:'robot',emoji:'⚡'},
 lina:{name:'لينا',coat:'#8053a6',fur:'#d6a27e',accent:'#f6d7ec',kind:'hijab',emoji:'📚'},
 kai:{name:'كاي',coat:'#0f8b83',fur:'#c9a17f',accent:'#59e0c4',kind:'headphones',emoji:'🎵'},
 mimi:{name:'ميمي',coat:'#d88722',fur:'#eaa04c',accent:'#ffe4a4',kind:'cat',emoji:'🐾'},
 zayd:{name:'زيد',coat:'#26724e',fur:'#b98057',accent:'#a9e6bf',kind:'glasses',emoji:'🧠'},
 sara:{name:'سارة',coat:'#bd466d',fur:'#c98a62',accent:'#ffb0c8',kind:'cap',emoji:'♥'},
 adam:{name:'آدم',coat:'#344da8',fur:'#c28b69',accent:'#9eb6ff',kind:'dark',emoji:'★'}
};
function companionName(kind){return (COMPANIONS[kind]||COMPANIONS.medicine).name}
function art(kind,stage=0,outfit=0){
 const c=COMPANIONS[kind]||COMPANIONS.medicine, coat=['#dcecff','#4b77ca','#f0f4ff','#263d71'][outfit%4]||c.coat;
 const age=stage===0?0:stage===1?3:stage===2?6:9, scale=stage===0?.92:stage===1?.97:stage===2?1.03:1.08;
 const ears=c.kind==='cat'||c.kind==='animal'?'<path d="M28 42 L23 18 L42 31 M54 31 L73 18 L68 43" fill="'+c.fur+'" stroke="#553b32" stroke-width="2" stroke-linejoin="round"/><path d="M29 25 L34 36 M65 25 L60 36" stroke="#f6c0b1" stroke-width="5"/>':'';
 const face=c.kind==='robot'?'<rect x="23" y="28" width="50" height="43" rx="13" fill="#d9f4ff" stroke="#456b8e" stroke-width="3"/><rect x="29" y="35" width="38" height="28" rx="9" fill="#102c50"/><path d="M37 48 Q40 43 43 48 M53 48 Q56 43 59 48" stroke="'+c.accent+'" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M48 28 V19" stroke="'+c.accent+'" stroke-width="3"/><circle cx="48" cy="16" r="4" fill="'+c.accent+'"/>':
 c.kind==='hijab'?'<path d="M20 48 Q17 14 48 15 Q79 14 76 48 L70 77 Q48 91 26 77Z" fill="'+c.coat+'" stroke="#4b345d" stroke-width="2"/><ellipse cx="48" cy="49" rx="20" ry="25" fill="'+c.fur+'"/>':
 '<ellipse cx="48" cy="48" rx="'+(27+age*.35)+'" ry="'+(27+age*.25)+'" fill="'+c.fur+'" stroke="#5a3b20" stroke-width="2"/>';
 const mood=data.mood||'happy';
 const eyes=c.kind==='robot'?'':'<ellipse cx="39" cy="48" rx="6" ry="'+(mood==='sleepy'?1.8:7)+'" fill="#fff" stroke="#49362f" stroke-width="1.5"/><ellipse cx="57" cy="48" rx="6" ry="'+(mood==='sleepy'?1.8:7)+'" fill="#fff" stroke="#49362f" stroke-width="1.5"/>'+(mood==='sleepy'?'':'<ellipse cx="40" cy="49" rx="3.4" ry="4.5" fill="#27354d"/><ellipse cx="58" cy="49" rx="3.4" ry="4.5" fill="#27354d"/><circle cx="41" cy="47" r="1.8" fill="#fff"/><circle cx="59" cy="47" r="1.8" fill="#fff"/>')+'<path d="'+(mood==='curious'?'M32 39 Q39 34 44 39 M52 39 Q59 32 64 38':mood==='sleepy'?'M33 43 Q39 40 44 43 M52 43 Q57 40 63 43':'M33 41 Q39 37 44 41 M52 41 Q57 37 63 41')+'" fill="none" stroke="#51372f" stroke-width="2.4" stroke-linecap="round"/>';
 const hair=c.kind==='dark'?'<path d="M22 47 Q17 17 45 17 Q73 15 75 43 L68 36 L61 29 L54 38 L42 29 L32 41 L28 52Z" fill="#20283b" stroke="#141b2a" stroke-width="2"/>':
 c.kind==='cap'?'<path d="M22 35 Q48 8 72 34 L66 42 L29 42Z" fill="#d84e65"/><path d="M18 41 Q47 37 78 43 L70 48 L25 48Z" fill="#f28ba0"/>':
 c.kind==='glasses'?'<path d="M22 44 Q18 17 47 19 Q73 18 74 43 L65 36 L55 31 L45 39 L34 32Z" fill="#242d32"/>':'';
 const glasses=c.kind==='glasses'?'<rect x="30" y="42" width="16" height="13" rx="4" fill="none" stroke="#182a37" stroke-width="2.5"/><rect x="50" y="42" width="16" height="13" rx="4" fill="none" stroke="#182a37" stroke-width="2.5"/><path d="M46 47 H50" stroke="#182a37" stroke-width="2"/>':'';
 const headphones=c.kind==='headphones'?'<path d="M23 49 V42 A25 25 0 0 1 73 42 V49" fill="none" stroke="#202a3c" stroke-width="6"/><rect x="18" y="44" width="10" height="18" rx="4" fill="'+c.accent+'"/><rect x="68" y="44" width="10" height="18" rx="4" fill="'+c.accent+'"/>':'';
 const muzzle=c.kind==='robot'||c.kind==='hijab'?'':'<ellipse cx="48" cy="58" rx="19" ry="13" fill="#fff4df"/>';
 const mouth=c.kind==='robot'?'':'<ellipse cx="32" cy="59" rx="5" ry="2.5" fill="#f39b9f" opacity=".65"/><ellipse cx="64" cy="59" rx="5" ry="2.5" fill="#f39b9f" opacity=".65"/>'+(mood==='sleepy'?'<path d="M43 61 Q48 59 53 61" fill="none" stroke="#754d42" stroke-width="2.4" stroke-linecap="round"/>':mood==='curious'?'<ellipse cx="48" cy="62" rx="3" ry="4" fill="#754d42"/>':mood==='excited'?'<path d="M39 59 Q48 75 57 59Z" fill="#a83d58" stroke="#754d42" stroke-width="1.8"/>':'<path d="M38 59 Q48 72 58 59 Q48 64 38 59Z" fill="#a83d58" stroke="#754d42" stroke-width="1.8"/>');
 const collar=c.kind==='cat'?'<path d="M37 76 L48 83 L59 76" fill="none" stroke="#e3c65e" stroke-width="3"/>':'<path d="M48 72 L42 80 L48 87 L54 80Z" fill="'+c.accent+'" stroke="#fff" stroke-width="1.5"/>';
 const extra=c.kind==='animal'?'<circle cx="35" cy="48" r="2" fill="#5a3b20"/><circle cx="61" cy="48" r="2" fill="#5a3b20"/>':'';
 const tier=Math.min(7,1+Math.floor(Math.max(0,Number(data.xp)||0)/100));
 const magicalFx='<ellipse cx="48" cy="103" rx="25" ry="5" fill="#9f8cff" opacity=".35"/>'+
   (tier>=2?'<path d="M28 72 Q9 59 16 43 Q28 49 31 62 M68 72 Q87 59 80 43 Q68 49 65 62" fill="#7ce7ff" fill-opacity=".55" stroke="#7ce7ff" stroke-width="2"/>':'')+
   (tier>=3?'<ellipse cx="48" cy="25" rx="29" ry="7" fill="none" stroke="#8feaff" stroke-width="2" opacity=".9"/><circle cx="20" cy="24" r="2.5" fill="#fff0a6"/><circle cx="76" cy="24" r="2.5" fill="#fff0a6"/>':'')+
   (tier>=4?'<path d="M36 91 Q29 101 38 105 Q40 99 44 96 M52 96 Q58 101 57 106 Q68 100 60 91" fill="#42d9ff" stroke="#d5fbff" stroke-width="1.5"><animate attributeName="opacity" values=".65;1;.65" dur=".7s" repeatCount="indefinite"/></path>':'')+
   (tier>=5?'<path d="M16 30 l3 -6 l3 6 l-3 3Z M75 38 l3 -6 l3 6 l-3 3Z M47 10 l3 -6 l3 6 l-3 3Z" fill="#ffe58b"/>':'')+
   (tier>=6?'<path d="M24 15 Q48 -1 72 15" fill="none" stroke="#ffd66e" stroke-width="3" stroke-linecap="round"/><circle cx="48" cy="9" r="4" fill="#fff4bd" stroke="#ffd66e" stroke-width="2"/>':'')+
   (tier>=7?'<circle cx="48" cy="53" r="43" fill="none" stroke="#ffd66e" stroke-width="1.5" stroke-dasharray="3 5" opacity=".9"/><path d="M10 54 l5 -8 l5 8 l-5 8Z M76 54 l5 -8 l5 8 l-5 8Z" fill="#ffd66e"/>':'');
 return '<svg class="creature-3d-art" viewBox="0 0 96 112" role="img" aria-label="'+c.name+'، الطور السحري '+tier+' من 7" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="furLight" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff4dc"/><stop offset=".38" stop-color="'+c.fur+'"/><stop offset="1" stop-color="#704d45"/></linearGradient><linearGradient id="coatLight" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".18" stop-color="'+coat+'"/><stop offset="1" stop-color="#172b4b"/></linearGradient><radialGradient id="faceGlow" cx=".32" cy=".2" r=".9"><stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset=".48" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#17213b" stop-opacity=".3"/></radialGradient><filter id="creatureDepth" x="-40%" y="-30%" width="180%" height="190%"><feGaussianBlur in="SourceAlpha" stdDeviation="2.5" result="blur"/><feOffset dy="3" dx="2" result="offset"/><feComponentTransfer><feFuncA type="linear" slope=".28"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g filter="url(#creatureDepth)" transform="translate(48 57) scale('+scale+') translate(-48 -57)"><ellipse cx="48" cy="103" rx="25" ry="5" fill="#172b4b" opacity=".18"/><path d="M29 78 Q9 78 15 59 Q20 49 28 59" fill="none" stroke="'+c.fur+'" stroke-width="10" stroke-linecap="round"/><path d="M29 77 Q13 77 17 60" fill="none" stroke="#fff" stroke-width="2.5" opacity=".28" stroke-linecap="round"/><path d="M31 75 L25 93 L40 93 L45 78 M53 78 L57 93 L72 93 L65 75" fill="url(#coatLight)" stroke="#25395c" stroke-width="2"/><path d="M31 77 L37 80 L33 91 L28 91Z M59 80 L64 77 L69 91 L62 91Z" fill="#101b36" opacity=".35"/><path d="M29 72 Q48 62 67 72 L65 89 Q48 98 31 89Z" fill="url(#coatLight)" stroke="#25395c" stroke-width="2"/><path d="M34 74 Q48 66 62 74" fill="none" stroke="#fff" stroke-width="3" opacity=".42" stroke-linecap="round"/><path d="M35 86 L61 86" stroke="#fff" stroke-width="2" opacity=".65"/><path d="M29 57 Q48 70 67 57" fill="none" stroke="#172b4b" stroke-width="2" opacity=".18"/>'+ears+face+'<ellipse cx="48" cy="49" rx="26" ry="27" fill="url(#faceGlow)" pointer-events="none"/>'+extra+eyes+muzzle+mouth+hair+glasses+headphones+collar+(stage>=3?'<path d="M16 42 Q5 29 18 21 M78 42 Q91 29 78 21" fill="none" stroke="#ffe58b" stroke-width="3" stroke-linecap="round"/>':'')+magicalFx+'</g></svg>';
}
function stage(){return data.xp>=700?3:data.xp>=300?2:data.xp>=100?1:0}
function rank(){return ['صغير','يافع','بالغ','أسطوري'][stage()]}
function levelProgress(){const starts=[0,100,300,700],ends=[100,300,700,1000],i=stage();return i===3?100:Math.max(0,Math.min(100,Math.round((data.xp-starts[i])/(ends[i]-starts[i])*100)))}
function chosen(){return COMPANIONS[data.chosen]?data.chosen:'medicine'}
function getStudy(){try{return window.studentGuideExportState?window.studentGuideExportState():null}catch(_){return null}}
function computeProgress(){
 const s=getStudy(); if(!s)return;
 const tasks=(s.tasks||[]).filter(t=>t.done).length;
 const sessions=Number(s.sessions||0), cards=(s.cards||[]).length, notes=(s.notes||[]).length;
 const reviewed=(s.cards||[]).reduce((sum,c)=>sum+Number(c.reps||0),0);
 const xp=tasks*25+sessions*10+cards*3+notes*5+reviewed*2;
 if(xp>data.xp){data.xp=xp;data.coins=Math.max(data.coins,Math.floor(xp/10));if(data.xp>=700)data.secret=true;save();renderBuddy();}
}
function syncLater(){clearTimeout(syncTimer);syncTimer=setTimeout(computeProgress,220)}
function bubble(msg){const b=$('#companionBubble');if(!b)return;b.textContent=msg;b.classList.add('show');clearTimeout(bubble.t);bubble.t=setTimeout(()=>b.classList.remove('show'),4300)}
function greeting(){const s=getStudy(),done=s?(s.tasks||[]).filter(t=>t.done).length:0;return ['جاهز ننجز خطوة صغيرة اليوم؟','أنا فخور باستمرارك. كل مراجعة تقرّبك من هدفك!','خلينا نراجع مهمة واحدة، وبعدها نأخذ استراحة.'][Math.floor(Date.now()/86400000)%3]+' '+(done?'أنجزت '+done+' مهمة؛ واصل!':'ابدأ بمهمة صغيرة اليوم.')}
function renderBuddy(){
 const dock=$('#companionDock');if(!dock)return;
 $('#companionArt').innerHTML=art(chosen(),stage(),data.outfit);
 $('#companionLabel').textContent=companionName(chosen());
 $('#companionLevel').textContent='طور '+Math.min(7,1+Math.floor(Math.max(0,Number(data.xp)||0)/100))+' من 7 · '+data.xp+' XP';
 $('#companionStage').textContent='الطور السحري '+Math.min(7,1+Math.floor(Math.max(0,Number(data.xp)||0)/100))+' من 7 · '+rank();
}
const cheers=['أنت قادر عليها! ابدأ بخمس دقائق فقط.','كل صفحة تفهمها تقرّبك من هدفك.','لا تحتاج للكمال؛ المهم أن تواصل.','خذ نفسًا عميقًا، ثم أنجز خطوة صغيرة.','تقدّمك ولو كان بسيطًا يستحق الفخر.','هل نراجع سؤالًا واحدًا معًا؟','استراحة قصيرة ثم نعود أقوى!','أنت تبني مستقبلك خطوة خطوة.'];
let wanderTimer=null, cheerTimer=null, wandering=false, sleeping=false, sleepTransition=false;
function encourage(){if(document.hidden||$('#companionDock')?.hidden||$('#companionOverlay')&&!$('#companionOverlay').hidden)return;bubble(cheers[Math.floor(Math.random()*cheers.length)])}
function wander(){
 const buddy=$('#companionBuddy'),dock=$('#companionDock');if(!buddy||!dock||dock.hidden||document.hidden||panelOpen||sleeping||sleepTransition||$('#companionOverlay')&&!$('#companionOverlay').hidden){scheduleWander(3500);return}
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){scheduleWander(9000);return}
 const w=buddy.offsetWidth||96,h=buddy.offsetHeight||112;
 const maxX=Math.max(8,innerWidth-w-8),maxY=Math.max(72,innerHeight-h-12);
 const x=8+Math.random()*Math.max(1,maxX-8), y=Math.max(72,Math.random()*(maxY-72));
 buddy.style.position='fixed';buddy.style.bottom='auto';buddy.style.left=x+'px';buddy.style.top=y+'px';buddy.style.zIndex='801';
 buddy.classList.add('walking');wandering=true;
 setTimeout(()=>{buddy.classList.remove('walking');wandering=false;scheduleWander(5000+Math.random()*6500)},1800+Math.random()*900);
}
function renderHabitat(){const i=stage(),home=$('#habitatHome'),scene=$('#habitatScene');if(!home||!scene)return;const houses=[{name:'مأوى صغير',desc:'بداية الرحلة',emoji:'📦',className:'home-poor'},{name:'كوخ بسيط',desc:'مكان دافئ للنوم',emoji:'🛖',className:'home-cabin'},{name:'بيت مريح',desc:'أثاث ونوافذ مضيئة',emoji:'🏡',className:'home-comfort'},{name:'قصر الرفيق',desc:'بيت أسطوري وسط النجوم',emoji:'🏰',className:'home-royal'}];const h=houses[i];$('#habitatTitle').textContent=h.name;$('#habitatLevel').textContent='المستوى '+(i+1)+' · '+rank();$('#habitatCoins').textContent=data.coins;home.className='habitat-home '+h.className;home.innerHTML='<div class="habitat-house-roof"></div><div class="habitat-house-body"><span class="habitat-house-icon">'+h.emoji+'</span><span class="habitat-house-door"></span><span class="habitat-house-window window-one"></span><span class="habitat-house-window window-two"></span></div><div class="habitat-house-caption">'+h.desc+'</div>';$('#habitatPet').innerHTML=art(chosen(),stage(),data.outfit);scene.className='habitat-scene scene-level-'+i;$('#habitatSky').innerHTML=i===0?'<span class="habitat-cloud cloud-one">☁</span><span class="habitat-cloud cloud-two">☁</span>':i===1?'<span class="habitat-cloud cloud-one">☁</span><span class="habitat-lamp">✦</span>':i===2?'<span class="habitat-sparkle">✦　✧　✦</span><span class="habitat-lamp">✦</span>':'<span class="habitat-sparkle">✦　✧　✦　✧　✦</span><span class="habitat-moon">☾</span>';$('#habitatSubpage').hidden=true;$('#habitatSubpage').innerHTML='';}
function openHabitat(){const portal=$('#companionPortal'),view=$('#companionHabitat');if(!view)return;clearTimeout(wanderTimer);if(sleeping){sleeping=false;sleepTransition=false;const buddy=$('#companionBuddy');if(buddy)buddy.hidden=false;$('#companionSleep').textContent='🌙 نوم';}portal.hidden=true;closePanel();view.hidden=false;renderHabitat();}
function closeHabitat(){const view=$('#companionHabitat');if(view)view.hidden=true;if(sleeping){const p=$('#companionPortal');if(p)p.hidden=false}else scheduleWander(3000);}
function showHabitatSubpage(type){const sub=$('#habitatSubpage');sub.hidden=false;if(type==='interior'){sub.innerHTML='<div class="anime-room-heading"><span class="anime-room-kicker">COMPANION HOME · 3D ROOM</span><h3>🏠 غرفة '+escapeHtml(companionName(chosen()))+'</h3><p>عالم أنمي دافئ بعمق ثلاثي الأبعاد يتطور مع مستواك.</p></div><div class="habitat-interior anime-3d-room level-interior-'+stage()+'"><div class="room-back-wall"><div class="room-window-3d"><span class="window-sky">☁　✦　☁</span><span class="window-horizon"></span></div><div class="room-wall-poster">✦<small>KEEP<br>GROWING</small></div><div class="room-shelf-3d"><i>📚</i><i>🪴</i><i>🏆</i></div><div class="room-wall-light"></div></div><div class="room-side-wall"></div><div class="room-floor-3d"><div class="room-floor-grid"></div><div class="room-rug-3d"></div><div class="room-bed-3d"><div class="bed-headboard"></div><div class="bed-pillow"></div><div class="bed-blanket"></div><div class="bed-foot"></div></div><div class="room-nightstand"><span>📕</span><i></i></div><div class="room-lamp-3d"><i></i><b></b><span></span></div><div class="room-plant-3d"><i>🌿</i><b></b></div><div class="room-pet-3d">'+art(chosen(),stage(),data.outfit)+'</div><div class="room-decor-3d">'+(data.roomItems?Array(Math.min(8,data.roomItems)).fill('<span>🪴</span>').join(''):'')+'</div></div><div class="room-level-plaque">✦ '+['بداية بسيطة','كوخ دافئ','جناح أنيق','جناح أسطوري'][stage()]+' ✦</div></div><p class="room-status">🪴 قطع الديكور: '+data.roomItems+' <span>🪙 رصيدك: '+data.coins+'</span></p><button type="button" id="habitatDecorBuy">🪴 أضف ديكور (3 عملات)</button><button type="button" id="habitatCityBack">العودة إلى البيت</button>';sub.querySelector('#habitatDecorBuy').addEventListener('click',()=>{if(data.coins<3){bubble('تحتاج 3 عملات لشراء الديكور.');return}data.coins-=3;data.roomItems++;save();renderHabitat();refreshPanel();showHabitatSubpage('interior')});sub.querySelector('#habitatCityBack').addEventListener('click',()=>sub.hidden=true);return;}if(type==='car'){const cars=[{name:'سكوتر صغير',emoji:'🛵',cost:0},{name:'سيارة المدينة',emoji:'🚙',cost:5},{name:'سيارة النجوم',emoji:'🏎️',cost:12}];sub.innerHTML='<h3>🚗 مرآب الرفيق</h3><p>اختر مركبتك</p><div class="habitat-car-scene"><div class="car-skyline">🏙️　🌳　🏢　🌴</div><div class="car-road"></div><div class="car-show">'+cars[data.car||0].emoji+'</div></div><div class="habitat-shop-grid">'+cars.map((car,index)=>'<button type="button" data-car="'+index+'">'+car.emoji+'<strong>'+car.name+'</strong><small>'+(index===(data.car||0)?'مركبتك الحالية':car.cost===0?'مجانية':'شراء · '+car.cost+' عملات')+'</small></button>').join('')+'</div><p>رصيدك: 🪙 '+data.coins+'</p><button type="button" id="habitatCityBack">العودة إلى البيت</button>';sub.querySelector('#habitatCityBack').addEventListener('click',()=>sub.hidden=true);sub.querySelectorAll('[data-car]').forEach(b=>b.addEventListener('click',()=>{const n=Number(b.dataset.car),cost=cars[n].cost;if(n!==data.car&&cost>0&&data.coins<cost){bubble('تحتاج '+cost+' عملات.');return}if(n!==data.car&&cost>0)data.coins-=cost;data.car=n;save();renderHabitat();refreshPanel();showHabitatSubpage('car')}));return;}if(type==='city'){sub.innerHTML='<h3>🏙️ مدينة الرفيق</h3><p>تجول بين المكتبة والعيادة والساحة؛ ومع تقدم مستواك تتغير أجواء المدينة.</p><div class="companion-city-scene city-level-'+stage()+'"><div class="city-skyline"><span>☁</span><span>☀</span></div><div class="city-buildings"><div class="city-building city-clinic"><b>✚</b><small>العيادة</small></div><div class="city-building city-library"><b>▤</b><small>المكتبة</small></div><div class="city-building city-cafe"><b>☕</b><small>المقهى</small></div><div class="city-building city-school"><b>✦</b><small>الأكاديمية</small></div></div><div class="city-trees">🌳　🌿　🌳　🌿　🌳</div><div class="city-street"><span>🚙</span><i></i><i></i><i></i></div></div><p>المناطق المفتوحة: '+(stage()+1)+' من 4 · رصيدك '+data.coins+' عملة.</p><button type="button" id="habitatCityBack">العودة إلى البيت</button>'}else{sub.innerHTML='<h3>🛍️ متجر الرفيق</h3><p>رصيدك: 🪙 '+data.coins+' عملة</p><div class="habitat-shop-grid"><button type="button" data-buy="decor">🪴 ديكور البيت <strong>3 عملات</strong></button><button type="button" data-buy="outfit">👕 زي جديد <strong>3 عملات</strong></button><button type="button" data-buy="treat">🍪 مكافأة <strong>2 عملة</strong></button></div><p class="habitat-shop-note">البيت يتحسن مع مستوياتك؛ يمكنك شراء اللمسات الإضافية من هنا.</p><button type="button" id="habitatShopBack">العودة إلى البيت</button>';}sub.querySelectorAll('#habitatCityBack,#habitatShopBack').forEach(b=>b.addEventListener('click',()=>{sub.hidden=true}));sub.querySelectorAll('[data-buy]').forEach(b=>b.addEventListener('click',()=>{const item=b.dataset.buy,cost=item==='treat'?2:3;if(data.coins<cost){bubble('تحتاج '+cost+' عملات لإتمام الشراء.');return}data.coins-=cost;if(item==='decor')data.roomItems++;if(item==='outfit')data.outfit=(data.outfit+1)%4;save();renderHabitat();refreshPanel();showHabitatSubpage(type);bubble(item==='treat'?'الرفيق يقول: شكرًا على المكافأة! 🐾':'تم الشراء! شكراً لك.');}));}
function positionPortal(){const buddy=$('#companionBuddy'),portal=$('#companionPortal');if(!buddy||!portal)return;const r=buddy.getBoundingClientRect(),w=portal.offsetWidth||120,h=portal.offsetHeight||150;portal.style.left=Math.max(8,Math.min(innerWidth-w-8,r.left+(r.width-w)/2))+'px';portal.style.top=Math.max(62,Math.min(innerHeight-h-8,r.top+r.height-h+8))+'px'}
function enterDreamPortal(){const buddy=$('#companionBuddy'),portal=$('#companionPortal');if(!buddy||!portal||sleepTransition)return;sleepTransition=true;clearTimeout(wanderTimer);buddy.classList.remove('walking');positionPortal();portal.hidden=false;portal.classList.remove('portal-waking');portal.classList.add('portal-opening');buddy.classList.add('entering-portal');$('#companionSleep').textContent='☀️ إيقاظ الرفيق';setTimeout(()=>{buddy.hidden=true;buddy.classList.remove('entering-portal');portal.classList.remove('portal-opening');portal.classList.add('portal-sleeping');sleeping=true;sleepTransition=false;portal.querySelector('.dream-portal-label').textContent='الرفيق نائم · اضغط لإيقاظه';},1050)}
function wakeFromPortal(){const buddy=$('#companionBuddy'),portal=$('#companionPortal');if(!buddy||!portal||sleepTransition)return;sleepTransition=true;buddy.hidden=false;buddy.classList.add('emerging-portal');portal.classList.remove('portal-sleeping','portal-opening');portal.classList.add('portal-waking');$('#companionSleep').textContent='🌙 نوم';setTimeout(()=>{portal.hidden=true;portal.classList.remove('portal-waking');buddy.classList.remove('emerging-portal');sleeping=false;sleepTransition=false;bubble('صحيت! رجعت من بوابة الأحلام. نكمل؟');scheduleWander(5000)},900)}
function scheduleWander(ms){clearTimeout(wanderTimer);wanderTimer=setTimeout(wander,ms)}
function startAutonomy(){
 scheduleWander(2200);
 clearTimeout(cheerTimer);
 const nextCheer=()=>{cheerTimer=setTimeout(()=>{encourage();nextCheer()},32000+Math.random()*22000)};nextCheer();
}
function openPanel(){panelOpen=true;$('#companionPanel').hidden=false;refreshPanel()}
function closePanel(){panelOpen=false;$('#companionPanel').hidden=true}
function refreshPanel(){
 const s=getStudy()||{tasks:[],sessions:0,cards:[]},done=(s.tasks||[]).filter(t=>t.done).length,total=(s.tasks||[]).length;
 $('#companionPanelArt').innerHTML=art(chosen(),stage(),data.outfit);
 $('#companionPanelName').textContent=companionName(chosen());
 $('#companionRank').textContent=rank()+' · '+data.xp+' نقطة خبرة';
 $('#companionTaskStat').textContent=done+'/'+total;$('#companionCoinStat').textContent=data.coins;$('#companionSessionStat').textContent=s.sessions||0;
 $('#companionPanelXp').style.width=levelProgress()+'%';
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
 // Companion choice is cosmetic and must not overwrite the student's academic major.
 data.introSeen=true;save();$('#companionOverlay').hidden=true;renderBuddy();bubble(greeting());syncLater();
}
function inject(){
 if($('#companionDock'))return;
 const dock=document.createElement('div');dock.id='companionDock';dock.hidden=true;dock.innerHTML='<button id="companionLaunch" type="button" aria-label="افتح رفيق الدراسة"><span>✨ رفيقي</span><span id="companionLevel">صغير · 0 XP</span></button><div id="companionBuddy" tabindex="0" role="button" aria-label="تفاعل مع الرفيق"><div id="companionBubble" aria-live="polite"></div><div id="companionArt"></div></div><span id="companionLabel" hidden></span>';
 const panel=document.createElement('section');panel.id='companionPanel';panel.hidden=true;panel.setAttribute('aria-label','لوحة الرفيق');panel.innerHTML='<div class="companion-panel-head"><div style="display:flex;align-items:center;gap:8px"><div id="companionPanelArt" style="width:58px;height:66px"></div><div><h3 id="companionPanelName">رفيقي</h3><div id="companionRank" style="font-size:12px;color:#687793"></div></div></div><button class="companion-x" id="companionClose" type="button" aria-label="إغلاق">✕</button></div><div class="companion-meter"><span id="companionPanelXp"></span></div><div id="companionStage" class="companion-stage"></div><div class="companion-stats"><div class="companion-stat">مهام مكتملة<strong id="companionTaskStat">0/0</strong></div><div class="companion-stat">عملات<strong id="companionCoinStat">0</strong></div><div class="companion-stat">جلسات تركيز<strong id="companionSessionStat">0</strong></div></div><p class="companion-message" id="companionRoomNote">غرفتك تنتظرك.</p><p class="companion-message" id="companionSecret">أكمل إنجازاتك لاكتشاف التحولات النادرة.</p><div class="companion-panel-actions"><button id="companionTalk" type="button">💬 شجعني</button><button id="companionMove" type="button">🐾 تمشية</button><button id="companionSleep" type="button">🌙 نوم</button><button id="companionOutfit" type="button">👕 تغيير الزي (3 عملات)</button><button id="companionSwitch" type="button">🦊 تبديل الرفيق</button><button id="companionRoom" type="button">🏠 الغرفة</button><button id="companionMiniGame" type="button">⭐ لعبة سريعة</button><button id="companionAchievements" type="button">🏆 الإنجازات</button><button id="companionDailyMission" type="button">🎯 مهمة اليوم</button></div><div id="companionExtra" class="companion-mini" aria-live="polite"></div><section class="companion-chat" aria-label="مساعد الدراسة"><h4>💡 اسأل رفيقك</h4><div id="companionChatLog" class="companion-chat-log" aria-live="polite"><p class="companion-chat-msg buddy-msg">أقدر أساعدك تختار خطوة مذاكرة صغيرة. اكتب لي ما الذي يشغلك.</p></div><form id="companionChatForm" class="companion-chat-form"><input id="companionChatInput" maxlength="300" autocomplete="off" placeholder="مثلاً: كيف أبدأ المذاكرة؟" aria-label="رسالتك للرفيق"><button type="submit">إرسال</button></form><div class="companion-chat-note">مساعد ذكاء اصطناعي للدراسة؛ يتطلب تسجيل الدخول وتفعيل الخدمة السحابية.</div></section>';
 const overlay=document.createElement('div');overlay.id='companionOverlay';overlay.hidden=true;overlay.innerHTML='<section class="companion-card" dir="rtl"><button class="companion-skip" id="companionSkip" type="button">تخطي المشهد</button><p class="companion-kicker">STUDENT GUIDE · YOUR STUDY QUEST</p><h2 id="companionIntroTitle">اختر رفيق رحلتك</h2><p id="companionIntroCopy">رحلتك الدراسية تبدأ الآن.</p><div class="companion-heroes companion-heroes-all" id="companionChoose"></div><div id="companionWelcome" hidden><div style="width:140px;height:150px;margin:0 auto" id="companionWelcomeArt"></div></div><button class="companion-primary" id="companionBegin" type="button">ابدأ الرحلة ←</button><button class="companion-secondary" id="companionReturn" type="button" hidden>متابعة الدراسة</button><div class="companion-stage">الرفيق يتطور مع إنجازاتك · حفظ محلي في هذه النسخة</div></section>';
 document.body.append(dock,panel,overlay);
 const habitat=document.createElement('section');habitat.id='companionHabitat';habitat.hidden=true;habitat.dir='rtl';habitat.innerHTML='<header class="habitat-top"><button type="button" id="habitatBack">← رجوع</button><div class="habitat-title"><strong id="habitatTitle">بيت الرفيق</strong><small id="habitatLevel"></small></div><div class="habitat-wallet">🪙 <span id="habitatCoins">0</span></div></header><div id="habitatScene" class="habitat-scene"><div id="habitatSky" class="habitat-sky"></div><div id="habitatHome" class="habitat-home"></div><div id="habitatPet" class="habitat-pet"></div><div class="habitat-ground"></div></div><div class="habitat-bottom"><button type="button" id="habitatInterior">🛋️ داخل البيت</button><button type="button" id="habitatCar">🚗 سيارتي</button><button type="button" id="habitatCity">🏙️ المدينة</button><button type="button" id="habitatShop">🛍️ المتجر</button><button type="button" id="habitatCompanionMenu">🐾 قائمة الرفيق</button></div><div id="habitatSubpage" class="habitat-subpage" hidden></div>';document.body.append(habitat);
 const portal=document.createElement('button');portal.type='button';portal.id='companionPortal';portal.hidden=true;portal.setAttribute('aria-label','بوابة الأحلام؛ اضغط لإيقاظ الرفيق');portal.innerHTML='<span class="dream-portal-ring"><span class="dream-portal-core"></span><span class="dream-portal-spark">✦</span></span><span class="dream-portal-label">بوابة الأحلام</span>';document.body.append(portal);
 $('#companionChoose').innerHTML=Object.keys(COMPANIONS).map(key=>'<button class="companion-hero '+(key===chosen()?'selected':'')+'" type="button" data-companion-choice="'+key+'" aria-pressed="'+(key===chosen())+'"><span>'+art(key,0,0)+'</span><strong>'+COMPANIONS[key].name+'</strong><small>'+({medicine:'المثابرة والدقة',economics:'الذكاء والتخطيط',robot:'رفيق تقني',lina:'رفيقة المذاكرة',kai:'طاقة وموسيقى',mimi:'لطافة ومرح',zayd:'تفكير وتركيز',sara:'تشجيع وود',adam:'شجاعة وثبات'}[key]||'رفيق الدراسة')+'</small></button>').join('');
}
function showExtra(html){$('#companionExtra').innerHTML=html}
function todayKey(){const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
function ensureDailyMission(){if(data.missionDay!==todayKey()){data.missionDay=todayKey();data.missionDone=false;save()}}
function chatReply(raw){
 const q=String(raw||'').trim().toLowerCase();
 const study=getStudy()||{tasks:[],sessions:0,cards:[],notes:[]};
 if(/قلق|خايف|متوتر|ضغط|تعب|محبط/.test(q))return 'خذ نفسًا ببطء. ما مطلوب منك تنجز كل شيء الآن؛ اختر جزءًا صغيرًا واشتغل عليه 10 دقائق، وبعدها قيّم شعورك.';
 if(/خطة|جدول|أبدأ|ابدأ|مذاكر/.test(q))return 'خلينا نبدأ بخطة بسيطة: 1) اختر موضوعًا واحدًا. 2) ذاكر 20 دقيقة. 3) أغلق المصدر واكتب 3 نقاط تتذكرها. 4) راجع ما فاتك لخمس دقائق.';
 if(/طب|تشريح|فسيولوج|دواء|مرض/.test(q))return 'للمواد الطبية: افهم الفكرة أولًا، ثم اربطها بسبب ونتيجة، وبعدها اختبر نفسك بأسئلة قصيرة. اكتب اسم الموضوع وسأساعدك في تنظيم طريقة مراجعته.';
 if(/اقتصاد|عرض|طلب|سوق|تكلفة|ناتج/.test(q))return 'للاقتصاد: عرّف المفهوم، اشرح آلية عمله، ثم طبّقه على مثال واقعي. جرّب رسم علاقة المتغيرات قبل حفظ التفاصيل.';
 if(/تركيز|مشتت|جوال|تشتت/.test(q))return 'جرّب مؤقت تركيز 20 دقيقة، أبعد الهاتف، وحدد نتيجة واحدة للجلسة. بعد ذلك خذ استراحة قصيرة.';
 if(/إنجاز|تقدم|مستوى|نقاط/.test(q))return 'تقدمك الحالي '+data.xp+' نقطة خبرة و'+data.coins+' عملة. المهام المكتملة في لوحة الدراسة: '+(study.tasks||[]).filter(t=>t.done).length+'. كل خطوة صغيرة تُحسب!';
 if(/مرحبا|السلام|هلا|أهل/.test(q))return 'أهلًا بك! 🌟 أنا معك خطوة بخطوة. ما الموضوع الذي تريد أن نبدأ به اليوم؟';
 return 'وصلتني رسالتك. جرّب أن تحدد المادة والجزء الصعب فيها، أو أخبرني هل تحتاج خطة مذاكرة أم طريقة تركيز أم تشجيعًا. ملاحظة: هذه نسخة إرشادية محلية وليست نموذج ذكاء اصطناعي متصلًا.';
}
function appendChat(text,who){
 const log=$('#companionChatLog');if(!log)return;
 const p=document.createElement('p');p.className='companion-chat-msg '+(who==='you'?'you-msg':'buddy-msg');p.textContent=text;log.appendChild(p);
 while(log.children.length>12)log.removeChild(log.firstChild);log.scrollTop=log.scrollHeight;
}
function dailyMission(){
 ensureDailyMission();
 if(data.missionDone){showExtra('<strong>أنجزت مهمة اليوم بالفعل! 🏆</strong><span>ارجع غدًا لتحدٍ جديد، أو اختر مهمة من قائمة الدراسة.</span>');return}
 const tasks=(getStudy()?.tasks||[]),done=tasks.filter(t=>t.done).length;
 showExtra('<strong>🎯 مهمة اليوم</strong><span>اختر موضوعًا واحدًا وذاكره 15 دقيقة، ثم اكتب 3 نقاط تتذكرها.</span><button type="button" id="companionCompleteMission">أنجزت المهمة</button><span>مهمات الدراسة المكتملة حاليًا: '+done+'</span>');
 $('#companionCompleteMission').addEventListener('click',()=>{ensureDailyMission();if(data.missionDone)return;data.missionDone=true;data.xp+=25;data.coins+=3;data.badges=Array.isArray(data.badges)?data.badges:[];if(!data.badges.includes('first-mission'))data.badges.push('first-mission');save();renderBuddy();refreshPanel();showExtra('<strong>أحسنت! +25 XP و+3 عملات 🎉</strong><span>شهادة الاستمرار: '+data.badges.length+' شارة</span>');bubble('فخور بك! أنجزت مهمة اليوم. خذ لحظة للاحتفال بتقدمك.');});
}
function bind(){
 $('#companionLaunch').addEventListener('click',()=>{openPanel();bubble('أنا هنا! '+greeting())});
 $('#companionBuddy').addEventListener('click',()=>{if(!panelOpen){bubble(greeting());openPanel()}else bubble('اضغط على أزرار الرفيق لتجربة حركة مختلفة.')});
 $('#companionBuddy').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openPanel();bubble(greeting())}});
 $('#companionClose').addEventListener('click',closePanel);
 $('#companionTalk').addEventListener('click',()=>bubble(greeting()));
 $('#companionChatForm').addEventListener('submit',async e=>{e.preventDefault();const input=$('#companionChatInput'),button=$('#companionChatForm button'),q=input.value.trim();if(!q||button.disabled)return;appendChat(q,'you');input.value='';data.chatCount=(data.chatCount||0)+1;save();const history=Array.from($('#companionChatLog').querySelectorAll('.companion-chat-msg')).slice(-8).map(el=>({role:el.classList.contains('you-msg')?'user':'assistant',content:el.textContent}));button.disabled=true;button.textContent='يفكر…';try{const cfg=window.STUDENT_GUIDE_SUPABASE||{};const token=window.studentGuideGetAccessToken?await window.studentGuideGetAccessToken():null;if(!token){appendChat('للدردشة بالذكاء الاصطناعي الحقيقي، سجّل الدخول بحسابك أولًا. وضع المعاينة لا يرسل رسائل إلى الخدمة.','buddy');return}if(!cfg.url||!cfg.anonKey)throw new Error('إعداد الاتصال غير متوفر');const response=await fetch(cfg.url.replace(/\/+$/, '')+'/functions/v1/study-companion-ai',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token,'apikey':cfg.anonKey},body:JSON.stringify({messages:history})});const payload=await response.json().catch(()=>({}));if(!response.ok)throw new Error(payload.error||'تعذر الوصول للمساعد ('+response.status+')');if(typeof payload.reply!=='string'||!payload.reply.trim())throw new Error('وصل رد غير صالح من المساعد');appendChat(payload.reply.trim(),'buddy')}catch(err){appendChat('لم أستطع الاتصال بالمساعد الآن. '+(err.message||'تحقق من اتصالك وحاول مرة أخرى.'),'buddy')}finally{button.disabled=false;button.textContent='إرسال'}});
 $('#companionChatInput').addEventListener('focus',()=>{if(!panelOpen)openPanel()});

 $('#companionMove').addEventListener('click',()=>{const el=$('#companionBuddy');el.classList.remove('sleeping');el.classList.add('walking');bubble('جولة قصيرة! خذ نفسًا ثم ارجع لمهمتك.');setTimeout(()=>el.classList.remove('walking'),1800)});
 $('#companionSleep').addEventListener('click',()=>{if(sleeping){wakeFromPortal();return}enterDreamPortal()});
 $('#companionPortal').addEventListener('click',()=>{if(!sleepTransition)openHabitat()});
 $('#habitatBack').addEventListener('click',closeHabitat);
 $('#habitatInterior').addEventListener('click',()=>showHabitatSubpage('interior'));
 $('#habitatCar').addEventListener('click',()=>showHabitatSubpage('car'));
 $('#habitatCity').addEventListener('click',()=>showHabitatSubpage('city'));
 $('#habitatShop').addEventListener('click',()=>showHabitatSubpage('shop'));
 $('#habitatCompanionMenu').addEventListener('click',()=>openPanel());
 $('#companionOutfit').addEventListener('click',()=>{if(data.coins<3){bubble('تحتاج 3 عملات لتغيير الزي. أنجز مهمة اليوم أو لعبة النجوم أولًا.');return}data.coins-=3;data.outfit=(data.outfit+1)%4;save();renderBuddy();refreshPanel();bubble('زي جديد! أنفقت 3 عملات من رصيدك.')});
 $('#companionSwitch').textContent='✨ رفيق مختلف';
 $('#companionSwitch').addEventListener('click',()=>{const keys=Object.keys(COMPANIONS),i=keys.indexOf(chosen());data.chosen=keys[(i+1)%keys.length];selected=data.chosen;save();renderBuddy();refreshPanel();$('#companionSwitch').textContent='✨ التالي: '+companionName(keys[(keys.indexOf(data.chosen)+1)%keys.length]);bubble('تم اختيار '+companionName(data.chosen)+'! لكل رفيق شكل ولون وشخصية مختلفة.')});
 $('#companionRoom').addEventListener('click',()=>{if(data.coins<3){bubble('تحتاج 3 عملات لإضافة ديكور. أكمل مهمة اليوم أو لعبة النجوم.');return}data.coins-=3;data.roomItems++;save();refreshPanel();$('#companionRoomNote').textContent='غرفتك فيها الآن '+data.roomItems+' قطع ديكور.';showExtra('<strong>🏠 غرفتك تتطور</strong><span>🪴 🛋️ 🖼️ ✨</span><span>أضفت قطعة ديكور رقم '+data.roomItems+'. رصيدك '+data.coins+' عملة.</span>')});
 $('#companionMiniGame').addEventListener('click',()=>{miniScore=0;showExtra('<strong>اجمع 5 نجوم!</strong> <span id="miniScore">0/5</span><button type="button" id="miniStar">⭐ اجمع نجمة</button>');$('#miniStar').addEventListener('click',()=>{if(miniScore>=5)return;miniScore++;$('#miniScore').textContent=miniScore+'/5';if(miniScore>=5){data.coins+=5;data.xp+=10;save();renderBuddy();refreshPanel();showExtra('<strong>أحسنت! +5 عملات و+10 XP 🎉</strong>')}})});
 $('#companionAchievements').addEventListener('click',()=>showExtra('<strong>إنجازاتك</strong><span>📘 '+((getStudy()?.tasks||[]).filter(t=>t.done).length)+' مهمة دراسية</span><span>🌟 '+data.xp+' XP · 🪙 '+data.coins+' عملة</span><span>🏅 '+(Array.isArray(data.badges)?data.badges.length:0)+' شارات</span><span>'+ (data.secret?'✨ التحول السري مفتوح':'🔒 التحول السري عند 700 XP')+'</span>'));
 $('#companionDailyMission').addEventListener('click',dailyMission);
 $('#companionSkip').addEventListener('click',()=>finishIntro());
 $('#companionBegin').addEventListener('click',()=>{if(!data.chosen)data.chosen=selected;finishIntro()});
 $('#companionReturn').addEventListener('click',()=>{$('#companionOverlay').hidden=true;data.introSeen=true;save()});
 document.querySelectorAll('[data-companion-choice]').forEach(btn=>btn.addEventListener('click',()=>{selected=btn.dataset.companionChoice;document.querySelectorAll('[data-companion-choice]').forEach(b=>{const on=b===btn;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on))});$('#companionBegin').textContent='اختيار '+(selected==='medicine'?'الفهد':'الثعلب')+' ←'}));
 // Drag the mascot within the viewport.
 const buddy=$('#companionBuddy');let drag=null;
 // A deliberate long press anywhere on the page opens the companion menu.
 let holdTimer=null,holdStart=null;
 const cancelHold=()=>{clearTimeout(holdTimer);holdTimer=null;holdStart=null};
 document.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;if(e.target.closest('button,a,input,textarea,select,[contenteditable="true"],#companionBuddy,#companionPanel,#companionOverlay'))return;holdStart={x:e.clientX,y:e.clientY};holdTimer=setTimeout(()=>{holdTimer=null;openPanel();bubble('قائمة الرفيق جاهزة لك!');},650)},{passive:true});
 document.addEventListener('pointermove',e=>{if(!holdStart)return;if(Math.abs(e.clientX-holdStart.x)>12||Math.abs(e.clientY-holdStart.y)>12)cancelHold()},{passive:true});
 document.addEventListener('pointerup',cancelHold,{passive:true});document.addEventListener('pointercancel',cancelHold,{passive:true});document.addEventListener('contextmenu',e=>{if(!e.target.closest('input,textarea,[contenteditable="true"]')){e.preventDefault();openPanel();bubble('قائمة الرفيق جاهزة لك!')}});

 buddy.addEventListener('pointerdown',e=>{if(e.button!==0&&e.pointerType==='mouse')return;const r=buddy.getBoundingClientRect();drag={x:e.clientX-r.left,y:e.clientY-r.top};clearTimeout(wanderTimer);buddy.setPointerCapture(e.pointerId)});
 buddy.addEventListener('pointermove',e=>{if(!drag)return;const x=Math.max(0,Math.min(innerWidth-buddy.offsetWidth,e.clientX-drag.x));const y=Math.max(60,Math.min(innerHeight-buddy.offsetHeight,e.clientY-drag.y));buddy.style.position='fixed';buddy.style.bottom='auto';buddy.style.left=x+'px';buddy.style.top=y+'px';buddy.style.zIndex='801'});
 const end=()=>{drag=null;scheduleWander(2800)};buddy.addEventListener('pointerup',end);buddy.addEventListener('pointercancel',end);
 document.addEventListener('click',e=>{if(e.target.closest('#appContent button, #appContent form'))syncLater()});
 document.addEventListener('submit',e=>{if(e.target.closest('#appContent'))syncLater()});
 const app=$('#appContent');
 const mo=new MutationObserver(()=>{const visible=!app.classList.contains('auth-locked');$('#companionDock').hidden=!visible;if(visible){computeProgress();renderBuddy();if(!data.introSeen){selected=data.chosen||'medicine';data.introSeen=true;save();bubble('أهلًا! أنا رفيقك الدراسي. اضغط «رفيقي» لفتح أدواتي.')}else if(!sessionStorage.getItem('companionWelcomeSeen')){sessionStorage.setItem('companionWelcomeSeen','1');bubble('أهلًا بعودتك! اضغط «رفيقي» لفتح أدواتك دون تعطيل الصفحة.')}}});
 mo.observe(app,{attributes:true,attributeFilter:['class']});
 // App might already be unlocked on a warm reload.
 if(!app.classList.contains('auth-locked')){dock.hidden=false;if(!data.introSeen){data.introSeen=true;save();renderBuddy();bubble('أهلًا! أنا رفيقك الدراسي. اضغط «رفيقي» لفتح أدواتي.')}else renderBuddy()}
}
function init(){
 inject();bind();renderBuddy();startAutonomy();
 const moods=['happy','curious','excited','sleepy'];let moodIndex=0;setInterval(()=>{if(document.hidden)return;moodIndex=(moodIndex+1)%moods.length;data.mood=moods[moodIndex];renderBuddy();if(!$('#companionHabitat')?.hidden)$('#habitatPet').innerHTML=art(chosen(),stage(),data.outfit);if(!$('#companionOverlay')?.hidden)$('#companionChoose').querySelectorAll('[data-companion-choice]').forEach(b=>{const k=b.dataset.companionChoice;b.querySelector('span').innerHTML=art(k,0,0)});},3200);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{}); 
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();