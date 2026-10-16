/* Study companion MVP. Local-only progress for this phase; no cloud sync for companion data yet. */
(function(){
'use strict';
const STORE='studentGuideCompanion_v2';
const $=(s,root=document)=>root.querySelector(s);
const load=()=>{try{const prev=JSON.parse(localStorage.getItem('studentGuideCompanion_v1')||'{}'),now=JSON.parse(localStorage.getItem(STORE)||'{}');return {...{chosen:null,introSeen:false,xp:0,coins:0,outfit:0,mood:'happy',roomItems:0,car:0,secret:false,missionDay:'',missionDone:false,badges:[],hunger:80,cleanliness:80,happiness:80,energy:80,careDay:'',careActions:0,lastCareAt:Date.now(),streak:0,lastCheckin:''},...prev,...now}}catch(_){return {chosen:null,introSeen:false,xp:0,coins:0,outfit:0,mood:'happy',roomItems:0,secret:false,hunger:80,cleanliness:80,happiness:80,energy:80,careDay:'',careActions:0,lastCareAt:Date.now(),streak:0,lastCheckin:''}}};
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
function companionName(kind){return data.customName||((COMPANIONS[kind]||COMPANIONS.medicine).name)}
function art(kind,stage=0,outfit=0){
 const c=COMPANIONS[kind]||COMPANIONS.medicine;
 const coat=['#dcecff','#4b77ca','#f0f4ff','#263d71'][outfit%4]||c.coat;
 const tier=Math.min(7,1+Math.floor(Math.max(0,Number(data.xp)||0)/100));
 const mood=data.mood||'happy';
 const R=(x,y,w,h,fill,extra='')=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+fill+'" '+extra+'/>';
 let p='';
 // Shadow and pixel feet/body: deliberate square silhouettes, no smooth gradients.
 // Distinct pixel silhouettes: Riko is a tall mech; others have role-specific builds.
 if(kind==='hijab'){
   p+=R(25,101,46,6,'#101b32','opacity=".25"');
   p+=R(30,80,17,22,'#263b65')+R(51,80,17,22,'#263b65')+R(25,96,25,7,'#172640')+R(49,96,25,7,'#172640');
   p+=R(23,69,52,30,coat)+R(28,73,42,24,coat)+R(33,70,32,6,c.accent);
   p+=R(25,79,8,17,c.coat)+R(65,79,8,17,c.coat)+R(46,74,5,23,'#f6d7ec');
   p+=R(34,82,7,5,c.accent)+R(57,82,7,5,c.accent);
 } else if(kind==='cat'){
   p+=R(27,101,42,6,'#101b32','opacity=".3"');
   p+=R(25,80,14,18,'#263b65')+R(57,80,14,18,'#263b65')+R(20,94,22,7,'#172640')+R(54,94,22,7,'#172640');
   p+=R(26,73,44,19,coat)+R(22,78,52,10,coat)+R(31,71,34,7,c.accent);
   p+=R(21,79,8,14,c.fur)+R(71,79,8,14,c.fur)+R(32,78,5,13,'#fff0c9')+R(59,78,5,13,'#fff0c9');
   p+=R(64,76,15,5,c.fur)+R(75,72,8,5,c.fur)+R(79,68,7,5,c.fur);
 } else if(kind==='headphones'){
   p+=R(28,101,40,6,'#101b32','opacity=".3"');
   p+=R(30,82,13,17,'#263b65')+R(53,82,13,17,'#263b65')+R(26,94,19,7,'#172640')+R(51,94,19,7,'#172640');
   p+=R(30,72,36,22,coat)+R(25,76,46,13,coat)+R(32,71,32,7,c.accent);
   p+=R(35,76,6,17,'#fff')+R(57,76,6,17,'#172b4b')+R(39,83,18,5,c.accent);
   p+=R(30,92,36,3,'#fff','opacity=".65"');
 } else if(kind==='glasses'){
   p+=R(28,101,40,6,'#101b32','opacity=".3"');
   p+=R(30,82,13,17,'#263b65')+R(53,82,13,17,'#263b65')+R(26,94,19,7,'#172640')+R(51,94,19,7,'#172640');
   p+=R(29,72,38,18,'#214f3d')+R(24,76,48,11,'#26724e')+R(32,71,32,7,c.accent);
   p+=R(43,75,10,14,'#e8f4ff')+R(35,88,26,3,'#a9e6bf')+R(31,79,5,9,'#d7f2e0')+R(60,79,5,9,'#d7f2e0');
 } else {
   p+=R(28,101,40,6,'#101b32','opacity=".3"');
   p+=R(29,82,14,17,'#263b65')+R(53,82,14,17,'#263b65');
   p+=R(25,94,20,7,'#172640')+R(51,94,20,7,'#172640');
   if(kind==='cap'){
     p+=R(27,71,42,22,coat)+R(22,76,52,13,coat)+R(32,71,32,7,c.accent);
     p+=R(28,84,40,4,'#fff')+R(45,77,7,12,'#ffb0c8');
   } else if(kind==='dark'){
     p+=R(27,70,42,22,'#20283b')+R(22,76,52,13,'#263d71')+R(32,71,32,7,'#4b77ca');
     p+=R(32,77,8,13,'#101b32')+R(56,77,8,13,'#101b32')+R(43,78,10,9,'#9eb6ff');
   } else if(kind==='animal'){
     p+=R(29,72,38,18,coat)+R(24,76,48,11,coat)+R(32,71,32,7,c.accent);
     p+=R(32,77,7,13,'#fff0cf')+R(57,77,7,13,'#fff0cf')+R(44,77,8,13,c.accent);
   } else {
     p+=R(29,72,38,18,coat)+R(24,76,48,11,coat)+R(32,71,32,7,c.accent);
     p+=R(34,75,5,14,'#ffffff','opacity=".65"')+R(57,75,5,14,'#172b4b','opacity=".3"');
   }
 }
 // Ears and silhouette vary by creature type.
 if(c.kind==='animal'||c.kind==='cat'){
   p+=R(24,25,8,20,c.fur)+R(28,17,8,13,c.fur)+R(32,25,8,8,c.fur);
   p+=R(64,25,8,20,c.fur)+R(60,17,8,13,c.fur)+R(56,25,8,8,c.fur);
   p+=R(29,24,4,8,'#f6c0b1')+R(63,24,4,8,'#f6c0b1');
 } else if(c.kind==='robot'){
   p+=R(20,39,7,18,'#456b8e')+R(69,39,7,18,'#456b8e');
   p+=R(39,13,18,6,c.accent)+R(44,7,8,7,c.accent);
 } else if(c.kind==='hijab'){
   p+=R(20,30,56,34,c.coat)+R(24,22,48,34,c.coat)+R(29,17,38,12,c.coat);
   p+=R(20,49,9,21,c.coat)+R(67,49,9,21,c.coat)+R(28,63,40,8,c.coat);
 }
 // Main pixel head.
 const headColor=c.kind==='robot'?'#d9f4ff':(c.kind==='hijab'?c.fur:c.fur);
 p+=R(28,30,40,34,headColor)+R(32,24,32,8,headColor)+R(24,38,8,20,headColor)+R(64,38,8,20,headColor);
 p+=R(32,30,32,4,'#fff4dc','opacity=".55"')+R(28,46,4,12,'#704d45','opacity=".22"')+R(64,46,4,12,'#704d45','opacity=".28"');
 // Species-specific hair/cap and accessories.
 if(c.kind==='dark'){
   p+=R(24,26,48,10,'#20283b')+R(28,20,40,9,'#20283b')+R(32,16,30,7,'#141b2a')+R(24,31,8,12,'#20283b');
 } else if(c.kind==='cap'){
   p+=R(28,20,40,7,'#d84e65')+R(24,27,48,7,'#d84e65')+R(20,32,56,5,'#f28ba0')+R(27,29,42,3,'#ffb0c8');
 } else if(c.kind==='glasses'){
   p+=R(27,23,42,8,'#242d32')+R(32,19,32,7,'#242d32')+R(24,30,10,7,'#242d32');
 } else if(c.kind==='cat'){
   p+=R(32,23,32,6,'#fff0c9')+R(36,19,24,5,c.fur);
 } else if(c.kind==='animal'){
   p+=R(32,23,32,6,'#fff0c9')+R(36,19,24,5,c.fur);
 } else if(c.kind==='headphones'){
   p+=R(24,29,7,23,'#202a3c')+R(65,29,7,23,'#202a3c')+R(20,42,8,14,c.accent)+R(68,42,8,14,c.accent);
 } else if(c.kind==='hijab'){
   p+=R(24,27,8,34,c.coat)+R(64,27,8,34,c.coat)+R(28,21,40,7,c.coat);
 }
 if(c.kind==='robot'){
   p+=R(28,34,40,25,'#102c50')+R(34,41,8,7,c.accent)+R(54,41,8,7,c.accent);
   p+=R(38,52,20,3,'#ffffff')+R(42,56,12,3,c.accent);
 } else {
   // Eyes and eyebrows, pixelated expressions.
   if(mood==='sleepy'){
     p+=R(34,42,10,3,'#49362f')+R(52,42,10,3,'#49362f');
   } else {
     p+=R(34,39,10,12,'#fff')+R(52,39,10,12,'#fff');
     p+=R(37,42,5,8,'#27354d')+R(55,42,5,8,'#27354d');
     p+=R(38,42,2,3,'#fff')+R(56,42,2,3,'#fff');
     p+=R(32,35,13,3,'#51372f')+R(51,35,13,3,'#51372f');
   }
   if(c.kind==='glasses'){
     p+=R(30,38,17,3,'#182a37')+R(30,38,3,12,'#182a37')+R(44,38,3,12,'#182a37')+R(32,47,13,3,'#182a37');
     p+=R(50,38,17,3,'#182a37')+R(50,38,3,12,'#182a37')+R(64,38,3,12,'#182a37')+R(52,47,13,3,'#182a37')+R(47,41,4,3,'#182a37');
   }
   if(c.kind!=='hijab'){
     p+=R(34,54,8,4,'#fff0dc')+R(54,54,8,4,'#fff0dc');
   }
   if(mood==='sleepy') p+=R(42,57,12,3,'#754d42');
   else if(mood==='curious') p+=R(45,56,6,7,'#754d42');
   else if(mood==='excited') p+=R(40,56,16,7,'#a83d58')+R(43,56,10,3,'#fff');
   else p+=R(41,57,5,3,'#754d42')+R(46,60,5,3,'#754d42')+R(51,57,5,3,'#754d42');
 }
 // Neckwear and unique role badges.
 p+=R(42,68,12,6,c.accent)+R(45,73,6,6,'#fff0a6');
 if(c.kind==='medicine') p+=R(45,77,6,10,'#fff')+R(42,80,12,4,'#e84b60');
 if(c.kind==='economics') p+=R(43,78,4,8,'#fff0a6')+R(47,75,4,11,'#fff0a6')+R(51,72,4,14,'#fff0a6');
 if(c.kind==='robot') p+=R(36,78,24,5,'#102c50')+R(42,79,12,3,c.accent);
 // Seven visible upgrade stages use stronger pixel effects rather than smooth SVG gradients.
 if(tier>=2){p+=R(13,57,7,8,'#7ce7ff')+R(17,49,7,8,'#7ce7ff')+R(76,57,7,8,'#7ce7ff')+R(72,49,7,8,'#7ce7ff');}
 if(tier>=3){p+=R(28,13,40,4,'#8feaff')+R(20,17,8,4,'#8feaff')+R(68,17,8,4,'#8feaff');}
 if(tier>=4){p+=R(31,91,6,6,'#42d9ff')+R(35,97,6,5,'#d5fbff')+R(59,91,6,6,'#42d9ff')+R(55,97,6,5,'#d5fbff');}
 if(tier>=5){p+=R(15,30,4,4,'#ffe58b')+R(19,26,4,4,'#ffe58b')+R(76,35,4,4,'#ffe58b')+R(80,31,4,4,'#ffe58b');}
 if(tier>=6){p+=R(40,7,16,4,'#ffd66e')+R(36,11,24,4,'#ffd66e')+R(44,3,8,4,'#fff4bd');}
 if(tier>=7){p+=R(8,48,4,8,'#ffd66e')+R(12,44,4,8,'#ffd66e')+R(84,48,4,8,'#ffd66e')+R(80,44,4,8,'#ffd66e')+R(28,5,4,4,'#fff')+R(64,5,4,4,'#fff');}
 return '<svg class="creature-pixel-art '+(kind==='robot'?'pixel-standard-body':'pixel-standard-body')+'" viewBox="0 0 96 112" role="img" aria-label="'+escapeHtml(c.name)+'، الطور السحري '+tier+' من 7" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" style="image-rendering:pixelated"><g>'+p+'</g></svg>';
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
function renderHabitat(){const i=stage(),home=$('#habitatHome'),scene=$('#habitatScene');if(!home||!scene)return;const houses=[{name:'مأوى صغير',desc:'بداية الرحلة',emoji:'📦',className:'home-poor'},{name:'كوخ بسيط',desc:'مكان دافئ للنوم',emoji:'🛖',className:'home-cabin'},{name:'بيت مريح',desc:'أثاث ونوافذ مضيئة',emoji:'🏡',className:'home-comfort'},{name:'قصر الرفيق',desc:'بيت أسطوري وسط النجوم',emoji:'🏰',className:'home-royal'}];const h=houses[i];$('#habitatTitle').textContent=h.name;$('#habitatLevel').textContent='المستوى '+(i+1)+' · '+rank();$('#habitatCoins').textContent=data.coins;home.className='habitat-home '+h.className;home.innerHTML='<div class="habitat-house-roof"></div><div class="habitat-house-body"><span class="habitat-house-icon">'+h.emoji+'</span><span class="habitat-house-door"></span><span class="habitat-house-window window-one"></span><span class="habitat-house-window window-two"></span></div><div class="habitat-house-caption">'+h.desc+'</div>';$('#habitatPet').innerHTML=art(chosen(),stage(),data.outfit);scene.className='habitat-scene scene-level-'+i;$('#habitatSky').innerHTML='<div class="pixel-skyline" aria-hidden="true"><i class="pixel-cloud cloud-a"></i><i class="pixel-cloud cloud-b"></i><i class="pixel-sun"></i><i class="pixel-star star-a"></i><i class="pixel-star star-b"></i><i class="pixel-star star-c"></i></div>';$('#habitatSubpage').hidden=true;$('#habitatSubpage').innerHTML='';}
function openHabitat(){const portal=$('#companionPortal'),view=$('#companionHabitat');if(!view)return;clearTimeout(wanderTimer);if(sleeping){sleeping=false;sleepTransition=false;const buddy=$('#companionBuddy');if(buddy)buddy.hidden=false;$('#companionSleep').textContent='🌙 نوم';}portal.hidden=true;closePanel();view.hidden=false;renderHabitat();}
function closeHabitat(){const view=$('#companionHabitat');if(view)view.hidden=true;if(sleeping){const p=$('#companionPortal');if(p)p.hidden=false}else scheduleWander(3000);}
function showHabitatSubpage(type){const sub=$('#habitatSubpage');sub.hidden=false;if(type==='interior'){sub.innerHTML='<div class="anime-room-heading"><span class="anime-room-kicker">COMPANION HOME · 3D ROOM</span><h3>🏠 غرفة '+escapeHtml(companionName(chosen()))+'</h3><p>عالم أنمي دافئ بعمق ثلاثي الأبعاد يتطور مع مستواك.</p></div><div class="habitat-interior anime-3d-room level-interior-'+stage()+'"><div class="room-back-wall"><div class="room-window-3d"><span class="window-sky"><i class="pixel-star"></i><i class="pixel-cloud-mini"></i><i class="pixel-star"></i></span><span class="window-horizon"></span><span class="window-hills"></span></div><div class="room-wall-poster"><span class="pixel-emblem">✦</span><small>LEVEL<br>UP!</small></div><div class="room-shelf-3d"><i class="pixel-book book-a"></i><i class="pixel-book book-b"></i><i class="pixel-plant"></i><i class="pixel-trophy"></i></div><div class="room-wall-light"></div></div><div class="room-side-wall"></div><div class="room-floor-3d"><div class="room-floor-grid"></div><div class="room-rug-3d"></div><div class="room-bed-3d"><div class="bed-headboard"></div><div class="bed-pillow"></div><div class="bed-blanket"></div><div class="bed-foot"></div></div><div class="room-nightstand"><span class="pixel-book book-night"></span><i></i></div><div class="room-lamp-3d"><i></i><b></b><span></span></div><div class="room-plant-3d"><i class="pixel-plant"></i><b></b></div><div class="room-pet-3d">'+art(chosen(),stage(),data.outfit)+'</div><div class="room-decor-3d">'+(data.roomItems?Array(Math.min(8,data.roomItems)).fill('<span class="pixel-plant"></span>').join(''):'')+'</div></div><div class="room-level-plaque">✦ '+['بداية بسيطة','كوخ دافئ','جناح أنيق','جناح أسطوري'][stage()]+' ✦</div></div><p class="room-status">🪴 قطع الديكور: '+data.roomItems+' <span>🪙 رصيدك: '+data.coins+'</span></p><button type="button" id="habitatDecorBuy">🪴 أضف ديكور (3 عملات)</button><button type="button" id="habitatCityBack">العودة إلى البيت</button>';sub.querySelector('#habitatDecorBuy').addEventListener('click',()=>{if(data.coins<3){bubble('تحتاج 3 عملات لشراء الديكور.');return}data.coins-=3;data.roomItems++;save();renderHabitat();refreshPanel();showHabitatSubpage('interior')});sub.querySelector('#habitatCityBack').addEventListener('click',()=>sub.hidden=true);return;}if(type==='car'){const cars=[{name:'سكوتر صغير',emoji:'<span class="pixel-vehicle pixel-scooter"></span>',cost:0},{name:'سيارة المدينة',emoji:'<span class="pixel-vehicle pixel-car"></span>',cost:5},{name:'سيارة النجوم',emoji:'<span class="pixel-vehicle pixel-star-car"></span>',cost:12}];sub.innerHTML='<h3>🚗 مرآب الرفيق</h3><p>اختر مركبتك</p><div class="habitat-car-scene"><div class="car-skyline pixel-cityline"><i></i><i></i><i></i><b></b><b></b></div><div class="car-road"></div><div class="car-show">'+cars[data.car||0].emoji+'</div></div><div class="habitat-shop-grid">'+cars.map((car,index)=>'<button type="button" data-car="'+index+'">'+car.emoji+'<strong>'+car.name+'</strong><small>'+(index===(data.car||0)?'مركبتك الحالية':car.cost===0?'مجانية':'شراء · '+car.cost+' عملات')+'</small></button>').join('')+'</div><p>رصيدك: 🪙 '+data.coins+'</p><button type="button" id="habitatCityBack">العودة إلى البيت</button>';sub.querySelector('#habitatCityBack').addEventListener('click',()=>sub.hidden=true);sub.querySelectorAll('[data-car]').forEach(b=>b.addEventListener('click',()=>{const n=Number(b.dataset.car),cost=cars[n].cost;if(n!==data.car&&cost>0&&data.coins<cost){bubble('تحتاج '+cost+' عملات.');return}if(n!==data.car&&cost>0)data.coins-=cost;data.car=n;save();renderHabitat();refreshPanel();showHabitatSubpage('car')}));return;}if(type==='city'){sub.innerHTML='<h3>🏙️ مدينة الرفيق</h3><p>تجول بين المكتبة والعيادة والساحة؛ ومع تقدم مستواك تتغير أجواء المدينة.</p><div class="companion-city-scene city-level-'+stage()+'"><div class="city-skyline pixel-city-sky"><i class="pixel-cloud cloud-a"></i><i class="pixel-sun"></i></div><div class="city-buildings"><div class="city-building city-clinic"><b class="pixel-cross"></b><small>العيادة</small></div><div class="city-building city-library"><b class="pixel-books"></b><small>المكتبة</small></div><div class="city-building city-cafe"><b class="pixel-cup"></b><small>المقهى</small></div><div class="city-building city-school"><b class="pixel-star"></b><small>الأكاديمية</small></div></div><div class="city-trees pixel-tree-row"><i></i><i></i><i></i><i></i><i></i></div><div class="city-street"><span class="pixel-vehicle pixel-car"></span><i></i><i></i><i></i></div></div><p>المناطق المفتوحة: '+(stage()+1)+' من 4 · رصيدك '+data.coins+' عملة.</p><button type="button" id="habitatCityBack">العودة إلى البيت</button>'}else{sub.innerHTML='<h3>🛍️ متجر الرفيق</h3><p>رصيدك: 🪙 '+data.coins+' عملة</p><div class="habitat-shop-grid"><button type="button" data-buy="decor"><span class="pixel-plant"></span> ديكور البيت <strong>3 عملات</strong></button><button type="button" data-buy="outfit"><span class="pixel-shirt"></span> زي جديد <strong>3 عملات</strong></button><button type="button" data-buy="treat"><span class="pixel-cookie"></span> مكافأة <strong>2 عملة</strong></button></div><p class="habitat-shop-note">البيت يتحسن مع مستوياتك؛ يمكنك شراء اللمسات الإضافية من هنا.</p><button type="button" id="habitatShopBack">العودة إلى البيت</button>';}sub.querySelectorAll('#habitatCityBack,#habitatShopBack').forEach(b=>b.addEventListener('click',()=>{sub.hidden=true}));sub.querySelectorAll('[data-buy]').forEach(b=>b.addEventListener('click',()=>{const item=b.dataset.buy,cost=item==='treat'?2:3;if(data.coins<cost){bubble('تحتاج '+cost+' عملات لإتمام الشراء.');return}data.coins-=cost;if(item==='decor')data.roomItems++;if(item==='outfit')data.outfit=(data.outfit+1)%4;save();renderHabitat();refreshPanel();showHabitatSubpage(type);bubble(item==='treat'?'الرفيق يقول: شكرًا على المكافأة! 🐾':'تم الشراء! شكراً لك.');}));}
function positionPortal(){const buddy=$('#companionBuddy'),portal=$('#companionPortal');if(!buddy||!portal)return;const r=buddy.getBoundingClientRect(),w=portal.offsetWidth||120,h=portal.offsetHeight||150;portal.style.left=Math.max(8,Math.min(innerWidth-w-8,r.left+(r.width-w)/2))+'px';portal.style.top=Math.max(62,Math.min(innerHeight-h-8,r.top+r.height-h+8))+'px'}
function enterDreamPortal(){const buddy=$('#companionBuddy'),portal=$('#companionPortal');if(!buddy||!portal||sleepTransition)return;sleepTransition=true;clearTimeout(wanderTimer);buddy.classList.remove('walking');positionPortal();portal.hidden=false;portal.classList.remove('portal-waking');portal.classList.add('portal-opening');buddy.classList.add('entering-portal');$('#companionSleep').textContent='☀️ إيقاظ الرفيق';setTimeout(()=>{buddy.hidden=true;buddy.classList.remove('entering-portal');portal.classList.remove('portal-opening');portal.classList.add('portal-sleeping');sleeping=true;sleepTransition=false;portal.querySelector('.dream-portal-label').textContent='الرفيق نائم · اضغط لإيقاظه';},1050)}
function wakeFromPortal(){const buddy=$('#companionBuddy'),portal=$('#companionPortal');if(!buddy||!portal||sleepTransition)return;sleepTransition=true;buddy.hidden=false;buddy.classList.add('emerging-portal');portal.classList.remove('portal-sleeping','portal-opening');portal.classList.add('portal-waking');$('#companionSleep').textContent='🌙 نوم';setTimeout(()=>{portal.hidden=true;portal.classList.remove('portal-waking');buddy.classList.remove('emerging-portal');sleeping=false;sleepTransition=false;bubble('صحيت! رجعت من بوابة الأحلام. نكمل؟');scheduleWander(5000)},900)}
function scheduleWander(ms){clearTimeout(wanderTimer);wanderTimer=setTimeout(wander,ms)}
function startAutonomy(){
 scheduleWander(2200);
 clearTimeout(cheerTimer);
 const nextCheer=()=>{cheerTimer=setTimeout(()=>{encourage();nextCheer()},32000+Math.random()*22000)};nextCheer();
}
function openPanel(){const app=document.querySelector('#appContent');if(app&&app.classList.contains('auth-locked')){panelOpen=false;const panel=$('#companionPanel');if(panel)panel.hidden=true;return false}applyCareDecay();panelOpen=true;$('#companionPanel').hidden=false;refreshPanel();return true}
function closePanel(){panelOpen=false;$('#companionPanel').hidden=true}
function refreshPanel(){
 updateCare();
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
 const dock=document.createElement('div');dock.id='companionDock';dock.hidden=true;dock.innerHTML='<button id="companionLaunch" type="button" aria-label="افتح رفيق الدراسة"><span>✨ رفيقي</span><span id="companionLevel">صغير · 0 XP</span></button><div id="companionBuddy" tabindex="0" role="button" aria-label="تفاعل مع الرفيق الجالس على كرسي"><div id="companionBubble" aria-live="polite"></div><div class="companion-seat" aria-hidden="true"><div id="companionArt"></div><div class="companion-chair"><i></i><b></b><em></em></div></div></div><span id="companionLabel" hidden></span>';
 const panel=document.createElement('section');panel.id='companionPanel';panel.hidden=true;panel.setAttribute('aria-label','لوحة الرفيق');panel.innerHTML='<div class="companion-panel-head"><div style="display:flex;align-items:center;gap:8px"><div id="companionPanelArt" style="width:58px;height:66px"></div><div><h3 id="companionPanelName">رفيقي</h3><div id="companionRank" style="font-size:12px;color:#687793"></div></div></div><button class="companion-x" id="companionClose" type="button" aria-label="إغلاق">✕</button></div><div class="companion-meter"><span id="companionPanelXp"></span></div><div id="companionStage" class="companion-stage"></div><div class="companion-stats"><div class="companion-stat">مهام مكتملة<strong id="companionTaskStat">0/0</strong></div><div class="companion-stat">عملات<strong id="companionCoinStat">0</strong></div><div class="companion-stat">جلسات تركيز<strong id="companionSessionStat">0</strong></div></div><p class="companion-message" id="companionRoomNote">غرفتك تنتظرك.</p><p class="companion-message" id="companionSecret">أكمل إنجازاتك لاكتشاف التحولات النادرة.</p><div class="companion-panel-actions"><button id="companionTalk" type="button">💬 شجعني</button><button id="companionMove" type="button">🐾 تمشية</button><button id="companionSleep" type="button">🌙 نوم</button><button id="companionOutfit" type="button">👕 تغيير الزي (3 عملات)</button><button id="companionSwitch" type="button">🦊 تبديل الرفيق</button><button id="companionRoom" type="button">🏠 الغرفة</button><button id="companionMiniGame" type="button">⭐ لعبة سريعة</button><button id="companionAchievements" type="button">🏆 الإنجازات</button><button id="companionDailyMission" type="button">🎯 مهمة اليوم</button></div><div id="companionExtra" class="companion-mini" aria-live="polite"></div><section class="companion-care"><h4>💗 العناية اليومية</h4><div class="care-meter"><span>🍎 الشبع</span><div><i id="careHunger"></i></div><b id="careHungerText"></b></div><div class="care-meter"><span>🧼 النظافة</span><div><i id="careClean"></i></div><b id="careCleanText"></b></div><div class="care-meter"><span>😊 السعادة</span><div><i id="careHappy"></i></div><b id="careHappyText"></b></div><div class="care-meter"><span>⚡ الطاقة</span><div><i id="careEnergy"></i></div><b id="careEnergyText"></b></div><div class="care-actions"><button type="button" data-care="feed">🍎 إطعام</button><button type="button" data-care="wash">🧼 تنظيف</button><button type="button" data-care="play">🎾 لعب</button><button type="button" data-care="rest">😴 راحة</button></div><p id="careStatus" aria-live="polite">اعتنِ برفيقك يوميًا ليرتفع مزاجه.</p></section>';
 const overlay=document.createElement('div');overlay.id='companionOverlay';overlay.hidden=true;overlay.innerHTML='<section class="companion-card" dir="rtl"><button class="companion-skip" id="companionSkip" type="button">تخطي المشهد</button><p class="companion-kicker">STUDENT GUIDE · YOUR STUDY QUEST</p><h2 id="companionIntroTitle">اختر رفيق رحلتك</h2><p id="companionIntroCopy">رحلتك الدراسية تبدأ الآن.</p><div class="companion-heroes companion-heroes-all" id="companionChoose"></div><div id="companionWelcome" hidden><div style="width:140px;height:150px;margin:0 auto" id="companionWelcomeArt"></div></div><button class="companion-primary" id="companionBegin" type="button">ابدأ الرحلة ←</button><button class="companion-secondary" id="companionReturn" type="button" hidden>متابعة الدراسة</button><div class="companion-stage">الرفيق يتطور مع إنجازاتك · حفظ محلي في هذه النسخة</div></section>';
 document.body.append(dock,panel,overlay);
 const habitat=document.createElement('section');habitat.id='companionHabitat';habitat.hidden=true;habitat.dir='rtl';habitat.innerHTML='<header class="habitat-top"><button type="button" id="habitatBack">← رجوع</button><div class="habitat-title"><strong id="habitatTitle">بيت الرفيق</strong><small id="habitatLevel"></small></div><div class="habitat-wallet">🪙 <span id="habitatCoins">0</span></div></header><div id="habitatScene" class="habitat-scene"><div id="habitatSky" class="habitat-sky"></div><div id="habitatHome" class="habitat-home"></div><div id="habitatPet" class="habitat-pet"></div><div class="habitat-ground"></div></div><div class="habitat-bottom"><button type="button" id="habitatInterior">🛋️ داخل البيت</button><button type="button" id="habitatCar">🚗 سيارتي</button><button type="button" id="habitatCity">🏙️ المدينة</button><button type="button" id="habitatShop">🛍️ المتجر</button><button type="button" id="habitatCompanionMenu">🐾 قائمة الرفيق</button></div><div id="habitatSubpage" class="habitat-subpage" hidden></div>';document.body.append(habitat);
 const portal=document.createElement('button');portal.type='button';portal.id='companionPortal';portal.hidden=true;portal.setAttribute('aria-label','بوابة الأحلام؛ اضغط لإيقاظ الرفيق');portal.innerHTML='<span class="dream-portal-ring"><span class="dream-portal-core"></span><span class="dream-portal-spark">✦</span></span><span class="dream-portal-label">بوابة الأحلام</span>';document.body.append(portal);
 $('#companionChoose').innerHTML=Object.keys(COMPANIONS).map(key=>'<button class="companion-hero '+(key===chosen()?'selected':'')+'" type="button" data-companion-choice="'+key+'" aria-pressed="'+(key===chosen())+'"><span>'+art(key,0,0)+'</span><strong>'+COMPANIONS[key].name+'</strong><small>'+({medicine:'المثابرة والدقة',economics:'الذكاء والتخطيط',robot:'رفيق تقني',lina:'رفيقة المذاكرة',kai:'طاقة وموسيقى',mimi:'لطافة ومرح',zayd:'تفكير وتركيز',sara:'تشجيع وود',adam:'شجاعة وثبات'}[key]||'رفيق الدراسة')+'</small></button>').join('');
}
function showExtra(html){$('#companionExtra').innerHTML=html}
function todayKey(){const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
function ensureDailyMission(){if(data.missionDay!==todayKey()){data.missionDay=todayKey();data.missionDone=false;save()}}
function appendChat(text,who){
 const log=$('#companionChatLog');if(!log)return;
 const p=document.createElement('p');p.className='companion-chat-msg '+(who==='you'?'you-msg':'buddy-msg');p.textContent=text;log.appendChild(p);
 while(log.children.length>12)log.removeChild(log.firstChild);log.scrollTop=log.scrollHeight;
}
function careClamp(v){return Math.max(0,Math.min(100,Math.round(Number(v)||0)))}
function applyCareDecay(){const now=Date.now(),last=Number(data.lastCareAt)||now,hours=Math.max(0,Math.min(72,(now-last)/3600000));if(hours<1)return;data.hunger=careClamp((data.hunger??80)-hours*1.4);data.cleanliness=careClamp((data.cleanliness??80)-hours*.9);data.happiness=careClamp((data.happiness??80)-hours*.6);data.energy=careClamp((data.energy??80)-hours*1.1);data.lastCareAt=now;save()}
function updateCare(){[['hunger','careHunger','careHungerText'],['cleanliness','careClean','careCleanText'],['happiness','careHappy','careHappyText'],['energy','careEnergy','careEnergyText']].forEach(([k,b,t])=>{const v=careClamp(data[k]??80),el=$('#'+b),tx=$('#'+t);if(el)el.style.width=v+'%';if(tx)tx.textContent=v+'%'}) ;const st=$('#careStatus');if(st)st.textContent='سلسلة العناية: '+(data.streak||0)+' يوم · '+(data.careActions||0)+' عناية اليوم.'}
function careFor(action){applyCareDecay();const today=new Date().toDateString();if(data.careDay!==today){data.careDay=today;data.careActions=0}const costs={feed:1,wash:1,play:2,rest:1},cost=costs[action]||1;if(data.coins<cost){bubble('تحتاج '+cost+' عملة. أنجز مهمة اليوم لتحصل على عملات.');return}if(action==='play'&&(data.energy??80)<15){bubble('رفيقك متعب؛ دعه يرتاح أولًا.');return}data.coins-=cost;if(action==='feed'){data.hunger=careClamp((data.hunger??80)+28);data.happiness=careClamp((data.happiness??80)+5)}if(action==='wash'){data.cleanliness=careClamp((data.cleanliness??80)+35);data.happiness=careClamp((data.happiness??80)+3)}if(action==='play'){data.happiness=careClamp((data.happiness??80)+25);data.energy=careClamp((data.energy??80)-12);data.xp+=3}if(action==='rest'){data.energy=careClamp((data.energy??80)+30);data.happiness=careClamp((data.happiness??80)+2)}data.careActions++;data.lastCareAt=Date.now();if(data.lastCheckin!==today){const y=new Date(Date.now()-86400000).toDateString();data.streak=data.lastCheckin===y?(data.streak||0)+1:1;data.lastCheckin=today}save();renderBuddy();refreshPanel();const msgs={feed:'أكل لذيذ! 🍎 رفيقك صار أشبع.',wash:'صار نظيفًا ومنتعشًا! ✨',play:'وقت ممتع! زادت سعادته وربحت 3 XP.',rest:'استراحة هادئة… بدأت طاقته تعود.'};if($('#careStatus'))$('#careStatus').textContent=msgs[action];bubble(msgs[action]||'شكرًا على اهتمامك!')}
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
 $('#companionPanel').querySelectorAll('[data-care]').forEach(btn=>btn.addEventListener('click',()=>careFor(btn.dataset.care)));

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
window.addEventListener('student-guide-companion-customized',()=>{try{Object.assign(data,JSON.parse(localStorage.getItem('studentGuideCompanion_v2')||'{}'));renderBuddy();refreshPanel();if(!$('#companionHabitat')?.hidden)renderHabitat()}catch(_){}});
function init(){
 inject();bind();renderBuddy();startAutonomy();
 const moods=['happy','curious','excited','sleepy'];let moodIndex=0;setInterval(()=>{if(document.hidden)return;moodIndex=(moodIndex+1)%moods.length;data.mood=moods[moodIndex];renderBuddy();if(!$('#companionHabitat')?.hidden)$('#habitatPet').innerHTML=art(chosen(),stage(),data.outfit);if(!$('#companionOverlay')?.hidden)$('#companionChoose').querySelectorAll('[data-companion-choice]').forEach(b=>{const k=b.dataset.companionChoice;b.querySelector('span').innerHTML=art(k,0,0)});},3200);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{}); 
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();