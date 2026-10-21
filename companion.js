/* Study companion MVP. Local-only progress for this phase; no cloud sync for companion data yet. */
(function(){
'use strict';
const STORE='studentGuideCompanion_v2';
const $=(s,root=document)=>root.querySelector(s);
const load=()=>{try{const prev=JSON.parse(localStorage.getItem('studentGuideCompanion_v1')||'{}'),now=JSON.parse(localStorage.getItem(STORE)||'{}');const merged={...{chosen:null,introSeen:false,xp:0,coins:0,outfit:0,mood:'happy',roomItems:0,secret:false,missionDay:'',missionDone:false,badges:[],streak:0,lastCheckin:''},...prev,...now};delete merged.hunger;delete merged.cleanliness;delete merged.happiness;delete merged.energy;delete merged.careDay;delete merged.careActions;delete merged.lastCareAt;delete merged.car;return merged}catch(_){return {chosen:null,introSeen:false,xp:0,coins:0,outfit:0,mood:'happy',roomItems:0,secret:false,missionDay:'',missionDone:false,badges:[],streak:0,lastCheckin:''}}};
let data=load(), panelOpen=false, selected='medicine';
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
 flame:{name:'رفيق النار',coat:'#ff642e',fur:'#ffd34f',accent:'#ff9b38',kind:'flame',emoji:'🔥'},
 wildRobot:{name:'روز — الروبوت السري',coat:'#687e68',fur:'#9aa99f',accent:'#75f5ec',kind:'wildRobot',emoji:'🤖'},
 batman:{name:'باتمان — الرفيق السري',coat:'#252e3d',fur:'#e4bd9e',accent:'#f1d15f',kind:'anime-batman',emoji:'🦇'},

};
// Remove previously selected characters that are no longer part of the original companion roster.
if(data.chosen&&!COMPANIONS[data.chosen]){data.chosen='medicine';save()}
function companionName(kind){return data.customName||((COMPANIONS[kind]||COMPANIONS.medicine).name)}
function art(kind,stage=0,outfit=0){
 const c=COMPANIONS[kind]||COMPANIONS.medicine;
 if(kind==='flame')return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 200" width="160" height="200" role="img" aria-label="رفيق النار"><defs><linearGradient id="fireGrad" x1="0" y1="1" x2="0" y2="0"><stop stop-color="#ff342b"/><stop offset=".55" stop-color="#ff7b21"/><stop offset="1" stop-color="#ffe66b"/></linearGradient></defs><ellipse cx="80" cy="184" rx="43" ry="7" fill="#ff792b" opacity=".2"/><path d="M80 18 C100 48 65 58 105 87 C139 116 116 170 83 178 C42 187 17 150 39 116 C52 95 63 86 58 57 C77 72 84 87 80 18Z" fill="url(#fireGrad)" stroke="#d93b22" stroke-width="3"/><path d="M80 91 C98 111 91 122 101 137 C112 157 89 171 75 166 C52 158 64 137 72 124 C78 114 78 103 80 91Z" fill="#fff0a0"/><circle cx="68" cy="119" r="4" fill="#54251e"/><circle cx="91" cy="119" r="4" fill="#54251e"/><path d="M70 137 Q80 146 90 137" fill="none" stroke="#54251e" stroke-width="4" stroke-linecap="round"/><path d="M47 132 Q32 126 31 113 M113 132 Q129 124 130 110" fill="none" stroke="#ff7b21" stroke-width="8" stroke-linecap="round"/></svg>';
 if(String(c.kind).startsWith('anime-')){
  const k=c.kind;
  const P={
   'anime-luffy':{skin:'#f3c29d',hair:'#29211d',cloth:'#c92f36',trim:'#f4c74c',pants:'#684a35'},
   'anime-zoro':{skin:'#efc19e',hair:'#4b8c43',cloth:'#39724e',trim:'#d9d7b5',pants:'#263c30'},
   'anime-sanji':{skin:'#f0c29f',hair:'#e5c153',cloth:'#26364c',trim:'#eee7d8',pants:'#172233'},
   'anime-naruto':{skin:'#f2c29e',hair:'#f4b52e',cloth:'#e97825',trim:'#aeb9c7',pants:'#38465c'},
   'anime-sasuke':{skin:'#efc09d',hair:'#202735',cloth:'#343d50',trim:'#9db6e8',pants:'#202737'},
   'anime-mech':{skin:'#dcebf5',hair:'#f3a72b',cloth:'#317ba6',trim:'#54eaff',pants:'#173c59'},
   'anime-bruce':{skin:'#e8b994',hair:'#201f24',cloth:'#d8a52b',trim:'#fff0ac',pants:'#27252a'},
   'anime-batman':{skin:'#e4bd9e',hair:'#171e2a',cloth:'#252e3d',trim:'#f1d15f',pants:'#151b27'},
   'anime-levi':{skin:'#efc4a4',hair:'#35342f',cloth:'#526a53',trim:'#dce3d6',pants:'#303c32'},
   'anime-titan':{skin:'#b75b50',hair:'#3a292a',cloth:'#823833',trim:'#ff9474',pants:'#3b2529'}
  };
  const a=P[k]||P['anime-luffy'],S=a.skin,H=a.hair,C=a.cloth,T=a.trim,B=a.pants;
  const R=(x,y,w,h,f,extra='')=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+f+'" '+extra+'/>';
  let p='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 200" width="160" height="200" shape-rendering="crispEdges" role="img" aria-label="'+c.name+' pixel anime companion"><rect width="160" height="200" fill="none"/>';
  // Pixel body first so the head remains the focal point.
  p+=R(42,111,76,61,C,'stroke="'+B+'" stroke-width="4"')+R(48,119,64,26,T)+R(54,142,52,27,B);
  p+=R(49,169,25,17,B)+R(88,169,25,17,B)+R(44,183,32,8,'#181d29')+R(84,183,34,8,'#181d29');
  p+=R(31,119,18,39,C,'stroke="'+B+'" stroke-width="4"')+R(111,119,18,39,C,'stroke="'+B+'" stroke-width="4"')+R(29,151,18,11,S)+R(112,151,18,11,S);
  if(k==='anime-luffy')p+=R(44,112,72,42,'#c92f36')+R(49,115,62,5,'#f4c74c')+R(75,118,10,36,'#f4c74c')+R(53,146,54,7,'#f4c74c')+R(49,153,62,17,'#684a35');
  if(k==='anime-zoro')p+=R(45,111,70,43,'#39724e')+R(51,116,58,13,'#d9d7b5')+R(56,130,48,6,'#263c30')+R(51,143,58,6,'#263c30')+R(46,151,68,9,'#d9d7b5')+R(23,100,5,49,'#bfc9d3')+R(18,97,6,9,'#dce5ed')+R(132,99,5,49,'#bfc9d3')+R(136,96,6,9,'#dce5ed');
  if(k==='anime-sanji')p+=R(45,111,70,57,'#26364c')+R(65,113,30,29,'#eee7d8')+R(76,132,8,35,'#eee7d8')+R(73,121,14,8,'#a43e3e')+R(77,129,6,8,'#a43e3e')+R(49,149,62,5,'#141f30');
  if(k==='anime-naruto')p+=R(44,111,72,45,'#e97825')+R(49,116,62,9,'#f4b52e')+R(52,132,56,8,'#f0e9d9')+R(49,148,62,8,'#f4b52e')+R(44,157,72,11,'#38465c');
  if(k==='anime-sasuke')p+=R(44,111,72,48,'#343d50')+R(49,116,62,9,'#d8dfeb')+R(65,125,30,27,'#202737')+R(48,151,64,6,'#9db6e8')+R(92,120,21,28,'#343d50');
  if(k==='anime-mech')p+=R(43,109,74,58,'#317ba6','stroke="#173c59" stroke-width="5"')+R(51,117,58,20,'#e7f7ff')+R(69,139,22,22,'#54eaff')+R(75,145,10,10,'#f5ffff')+R(49,160,62,7,'#54eaff')+R(27,117,15,25,'#dcebf5')+R(118,117,15,25,'#dcebf5');
  if(k==='anime-bruce')p+=R(44,111,72,56,'#d8a52b')+R(49,118,62,7,'#fff0ac')+R(52,137,56,6,'#fff0ac')+R(48,152,64,7,'#27252a');
  if(k==='anime-batman')p+=R(42,109,76,61,'#252e3d','stroke="#111722" stroke-width="5"')+R(49,117,62,22,'#3e495c')+R(61,121,38,26,'#1b2330')+R(71,132,18,20,'#f1d15f')+R(49,150,62,8,'#151b27')+R(47,155,66,7,'#d7bd69');
  if(k==='anime-levi')p+=R(44,111,72,56,'#526a53')+R(49,116,62,11,'#dce3d6')+R(61,127,38,25,'#dce3d6')+R(49,151,62,7,'#303c32')+R(34,126,15,25,'#aebfae')+R(111,126,15,25,'#aebfae');
  if(k==='anime-titan')p+=R(37,107,86,67,'#823833','stroke="#3b2529" stroke-width="5"')+R(45,115,70,12,'#ff9474')+R(52,131,56,17,'#3b2529')+R(47,153,66,9,'#b75b50')+R(27,117,17,32,'#b75b50')+R(116,117,17,32,'#b75b50');
  // Large, pixel-stepped face and neck.
  p+=R(67,91,26,22,S)+R(54,38,52,57,S)+R(47,49,7,25,S)+R(106,49,7,25,S)+R(54,38,52,6,'#fff0dc','opacity=".24"')+R(54,85,52,8,'#9a6657','opacity=".16"');
  if(k==='anime-luffy'){
   p+=R(45,34,70,12,H)+R(49,25,62,12,H)+R(57,18,46,10,H)+R(48,39,10,14,H)+R(102,38,10,14,H);
   p+=R(37,20,86,8,'#d8ad55')+R(43,12,74,9,'#f2d47d')+R(52,5,56,8,'#f2d47d')+R(37,21,86,4,'#bd3338')+R(48,13,62,3,'#d7ad55');
  }else if(k==='anime-zoro'){
   p+=R(49,31,62,12,H)+R(52,23,13,12,H)+R(67,17,12,16,H)+R(81,21,12,12,H)+R(96,26,15,11,H)+R(46,40,12,11,H)+R(103,39,11,12,H)+R(51,36,58,5,'#c9d8a1')+R(55,39,50,4,'#203d2c');
  }else if(k==='anime-sanji'){
   p+=R(48,31,64,11,H)+R(52,23,54,10,H)+R(60,17,40,9,H)+R(48,36,12,12,H)+R(100,36,12,12,H)+R(51,31,18,9,H)+R(62,38,17,10,H)+R(75,45,17,8,H)+R(86,50,15,8,H)+R(94,56,9,8,H);
  }else if(k==='anime-naruto'){
   p+=R(49,31,62,11,H)+R(45,23,13,14,H)+R(54,14,12,17,H)+R(66,8,10,19,H)+R(77,15,12,14,H)+R(89,10,11,18,H)+R(101,21,13,14,H)+R(105,32,10,12,H)+R(47,38,66,7,'#aeb9c7')+R(52,39,56,4,'#596577')+R(73,39,14,4,'#dbe4ef');
  }else if(k==='anime-sasuke'){
   p+=R(49,31,62,11,H)+R(43,24,14,16,H)+R(55,16,13,18,H)+R(68,10,12,20,H)+R(80,19,12,13,H)+R(93,14,13,17,H)+R(104,25,12,13,H)+R(48,38,12,13,H)+R(101,39,12,12,H);
  }else if(k==='anime-mech'){
   p+=R(48,31,64,13,'#e7f7ff','stroke="#173c59" stroke-width="4"')+R(54,20,52,12,'#dcebf5','stroke="#173c59" stroke-width="4"')+R(64,13,32,8,'#f3a72b')+R(39,41,10,17,'#317ba6')+R(111,41,10,17,'#317ba6')+R(54,48,52,10,'#317ba6')+R(59,51,13,5,'#54eaff')+R(88,51,13,5,'#54eaff')+R(70,63,20,5,'#173c59');
  }else if(k==='anime-bruce'){
   p+=R(49,30,62,12,H)+R(53,22,54,11,H)+R(61,17,38,7,H)+R(47,36,12,10,H)+R(101,36,12,10,H)+R(52,39,56,5,'#17171b');
  }else if(k==='anime-batman'){
   p+=R(49,39,62,45,'#252e3d','stroke="#101521" stroke-width="4"')+R(43,39,13,20,'#252e3d')+R(48,27,16,18,'#252e3d')+R(57,15,15,23,'#252e3d')+R(88,15,15,23,'#252e3d')+R(98,27,16,18,'#252e3d')+R(105,39,13,20,'#252e3d')+R(56,59,18,6,'#f2f5fb')+R(87,59,18,6,'#f2f5fb')+R(75,67,10,9,'#151b27')+R(69,78,22,5,'#151b27');
  }else if(k==='anime-levi'){
   p+=R(49,30,62,12,H)+R(54,23,52,9,H)+R(64,18,34,7,H)+R(47,37,11,9,H)+R(102,37,11,9,H)+R(49,30,62,5,'#55544d')+R(52,35,15,7,H)+R(95,35,14,7,H);
  }else if(k==='anime-titan'){
   p+=R(44,35,72,14,H,'stroke="#3b2529" stroke-width="4"')+R(48,23,15,16,H)+R(64,13,12,20,H)+R(78,7,12,23,H)+R(92,16,12,17,H)+R(104,26,13,14,H)+R(41,42,11,14,H)+R(109,42,11,14,H)+R(45,53,9,28,'#b75b50')+R(106,53,9,28,'#b75b50');
  }
  p+=R(48,55,6,12,S)+R(106,55,6,12,S);
  const eye=k==='anime-batman'?'#f4f7ff':k==='anime-mech'?'#54eaff':k==='anime-sasuke'?'#8da9ef':k==='anime-titan'?'#fff0d9':'#29232a';
  const eyeY=(data.mood==='tired'||data.mood==='sad')?61:57;
  if(k!=='anime-batman'&&k!=='anime-mech'&&k!=='anime-titan'){
   p+=R(58,eyeY,15,5,H)+R(87,eyeY,15,5,H)+R(60,eyeY+4,10,7,eye)+R(89,eyeY+4,10,7,eye)+R(63,eyeY+5,4,5,'#171821')+R(92,eyeY+5,4,5,'#171821');
   if(data.mood==='angry')p+=R(56,eyeY-3,19,4,H)+R(86,eyeY-3,19,4,H);
   if(k==='anime-sanji')p+=R(78,47,26,25,H)+R(82,54,20,13,H);
  }else if(k==='anime-batman')p+=R(56,60,20,5,'#f4f7ff')+R(85,60,20,5,'#f4f7ff');
  else if(k==='anime-mech')p+=R(57,54,18,7,'#54eaff')+R(86,54,18,7,'#54eaff')+R(60,56,12,3,'#ffffff')+R(89,56,12,3,'#ffffff');
  else p+=R(56,57,20,6,'#302126')+R(84,57,20,6,'#302126')+R(58,59,16,5,'#fff0d9')+R(86,59,16,5,'#fff0d9');
  if(k==='anime-luffy')p+=R(59,73,10,3,'#9b5148')+R(59,76,3,4,'#9b5148');
  if(k==='anime-naruto')p+=R(49,70,8,2,'#b87960')+R(48,75,9,2,'#b87960')+R(103,70,8,2,'#b87960')+R(103,75,9,2,'#b87960');
  if(k==='anime-zoro')p+=R(87,73,18,3,'#8d5c4d')+R(90,77,13,3,'#8d5c4d');
  if(k==='anime-sanji')p+=R(87,73,15,3,'#b77b66')+R(96,76,8,4,'#b77b66');
  if(k==='anime-levi')p+=R(51,45,12,5,'#35342f')+R(99,45,12,5,'#35342f');
  if(k==='anime-titan')p+=R(52,77,56,8,'#2a2023')+R(57,77,8,5,'#fff0d9')+R(69,77,8,5,'#fff0d9')+R(81,77,8,5,'#fff0d9')+R(93,77,8,5,'#fff0d9');
  if(k!=='anime-batman'&&k!=='anime-mech'&&k!=='anime-titan'){
   if(data.mood==='surprised')p+=R(76,78,9,9,'#5f302e')+R(79,79,3,3,'#f8d2bd');
   else if(data.mood==='sad'||data.mood==='tired')p+=R(72,83,18,3,'#713f3a')+R(76,80,10,3,S);
   else if(data.mood==='angry')p+=R(72,83,18,3,'#713f3a');
   else p+=R(71,81,20,4,'#6e342e')+R(75,81,12,2,'#fff0df');
  }
  if(k==='anime-batman')p+=R(73,78,14,6,'#151b27');
  if(k==='anime-mech')p+=R(70,68,20,5,'#173c59')+R(74,69,12,2,'#54eaff');
  if(k==='anime-titan')p+=R(53,83,54,8,'#251d22')+R(57,83,7,4,'#fff0d9')+R(69,83,7,4,'#fff0d9')+R(81,83,7,4,'#fff0d9')+R(93,83,7,4,'#fff0d9');
  if(k==='anime-luffy')p+=R(37,4,86,4,'#f2d47d')+R(43,8,74,3,'#d8ad55')+R(72,95,16,5,'#c92f36');
  if(k==='anime-zoro')p+=R(24,98,4,46,'#c7d1dc')+R(20,95,6,8,'#e8edf2')+R(132,98,4,46,'#c7d1dc')+R(136,95,6,8,'#e8edf2');
  if(k==='anime-bruce')p+=R(31,122,8,28,'#d8a52b')+R(121,122,8,28,'#d8a52b');
  if(k==='anime-batman')p+=R(44,108,72,7,'#171e2a')+R(69,111,22,16,'#f1d15f')+R(75,115,10,8,'#252e3d');
  if(k==='anime-titan')p+=R(38,93,14,10,'#b75b50')+R(108,93,14,10,'#b75b50')+R(45,101,70,7,'#823833');
  p+='</svg>';
  return p;
 }
 const coat=['#dcecff','#4b77ca','#f0f4ff','#263d71','#d95f59','#4eaf8b','#d4a54a','#8e67bc'][((Number(outfit)||0)%8+8)%8]||c.coat;
 const tier=Math.min(7,1+Math.floor(Math.max(0,Number(data.xp)||0)/100));
 const mood=data.mood||'happy';
 const R=(x,y,w,h,fill,extra='')=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+fill+'" '+extra+'/>';
 let p='';
 // Shadow and pixel feet/body: deliberate square silhouettes, no smooth gradients.
 // Distinct pixel silhouettes: Riko is a tall mech; others have role-specific builds.
 if(kind==='eren'||kind==='armin'||kind==='mikasa'){
   p+=R(28,101,40,6,'#101b32','opacity=".3"');
   p+=R(29,82,14,17,'#4a3329')+R(53,82,14,17,'#4a3329')+R(25,94,20,7,'#26312f')+R(51,94,20,7,'#26312f');
   p+=R(25,71,46,22,'#4d554b')+R(21,76,54,13,'#5d6656')+R(31,71,34,7,'#d5d0b6');
   p+=R(26,78,8,16,'#68715f')+R(62,78,8,16,'#68715f')+R(35,77,7,15,'#e0d8c0')+R(54,77,7,15,'#e0d8c0');
   p+=R(43,75,10,14,'#c8d0c2')+R(38,87,20,4,'#3e4d43');
   if(kind==='mikasa')p+=R(25,70,46,9,'#7c303a')+R(31,72,34,7,'#a53d49')+R(42,78,12,12,'#8e303d');
 } else if(kind==='hijab'){
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
 if(kind==='eren'){
   p+=R(24,22,48,11,'#3a302b')+R(28,16,40,10,'#4b392f')+R(23,29,10,15,'#4b392f')+R(30,24,12,8,'#4b392f')+R(50,23,12,9,'#4b392f')+R(62,29,10,13,'#4b392f');
   p+=R(30,22,8,7,'#5c493e')+R(54,21,8,7,'#5c493e');
 } else if(kind==='armin'){
   p+=R(24,22,48,11,'#e3c98f')+R(28,16,40,10,'#e8d4a5')+R(23,29,10,14,'#d6bd82')+R(30,24,12,8,'#f0dcae')+R(50,23,12,9,'#e5cf99')+R(62,29,10,13,'#d7bf87');
   p+=R(31,21,9,6,'#f5e7c3')+R(55,22,7,6,'#f5e7c3');
 } else if(kind==='mikasa'){
   p+=R(24,22,48,11,'#1e2028')+R(28,16,40,10,'#262832')+R(23,29,10,14,'#20222b')+R(30,24,12,8,'#292b35')+R(50,23,12,9,'#252731')+R(62,29,10,13,'#20222b');
   p+=R(29,21,10,6,'#3b3d47')+R(54,22,8,6,'#393b45');
 } else if(c.kind==='animal'||c.kind==='cat'){
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
   if(mood==='sleepy'||mood==='sad'){
     p+=R(34,42,10,3,'#49362f')+R(52,42,10,3,'#49362f');
   } else {
     p+=R(34,39,10,12,'#fff')+R(52,39,10,12,'#fff');
     p+=R(37,42,5,8,'#27354d')+R(55,42,5,8,'#27354d');
     p+=R(38,42,2,3,'#fff')+R(56,42,2,3,'#fff');
     p+=R(32,35,13,3,'#51372f')+R(51,35,13,3,'#51372f');
     if(mood==='angry')p+=R(32,33,14,4,'#49362f')+R(50,33,14,4,'#49362f');
     if(mood==='surprised')p+=R(36,39,7,13,'#27354d')+R(54,39,7,13,'#27354d');
   }
   if(c.kind==='glasses'){
     p+=R(30,38,17,3,'#182a37')+R(30,38,3,12,'#182a37')+R(44,38,3,12,'#182a37')+R(32,47,13,3,'#182a37');
     p+=R(50,38,17,3,'#182a37')+R(50,38,3,12,'#182a37')+R(64,38,3,12,'#182a37')+R(52,47,13,3,'#182a37')+R(47,41,4,3,'#182a37');
   }
   if(c.kind!=='hijab'){
     p+=R(34,54,8,4,'#fff0dc')+R(54,54,8,4,'#fff0dc');
   }
   if(mood==='sleepy') p+=R(42,57,12,3,'#754d42');
   else if(mood==='sad') p+=R(41,60,6,3,'#754d42')+R(47,57,6,3,'#754d42')+R(45,51,4,5,'#73c8f5');
   else if(mood==='angry') p+=R(41,57,12,4,'#754d42')+R(42,57,10,2,'#e8b1a3');
   else if(mood==='surprised') p+=R(43,55,10,9,'#754d42')+R(46,56,4,4,'#fff0dc');
   else if(mood==='curious') p+=R(45,56,6,7,'#754d42');
   else if(mood==='excited') p+=R(40,56,16,7,'#a83d58')+R(43,56,10,3,'#fff');
   else p+=R(41,57,5,3,'#754d42')+R(46,60,5,3,'#754d42')+R(51,57,5,3,'#754d42');
 }
 // Neckwear and unique role badges.
 p+=R(42,68,12,6,c.accent)+R(45,73,6,6,'#fff0a6');
 if(kind==='eren')p+=R(34,78,6,14,'#34453e')+R(56,78,6,14,'#34453e')+R(41,80,14,5,'#d6d8c5');
 if(kind==='armin')p+=R(34,78,6,14,'#e9e0c7')+R(56,78,6,14,'#e9e0c7')+R(41,80,14,5,'#d7c48c');
 if(kind==='mikasa')p+=R(32,69,32,6,'#9d3945')+R(39,74,18,8,'#b94b55')+R(43,77,10,10,'#8e303d');
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
function stage(){return data.allModesUnlocked?3:(data.xp>=700?3:data.xp>=300?2:data.xp>=100?1:0)}
function rank(){return ['صغير','يافع','بالغ','أسطوري'][stage()]}
function levelProgress(){if(data.allModesUnlocked)return 100;const starts=[0,100,300,700],ends=[100,300,700,1000],i=stage();return i===3?100:Math.max(0,Math.min(100,Math.round((data.xp-starts[i])/(ends[i]-starts[i])*100)))}
function chosen(){return COMPANIONS[data.chosen]&&(data.chosen!=='wildRobot'||data.robotUnlocked)&&(data.chosen!=='batman'||data.batmanUnlocked)?data.chosen:'medicine'}
function renderCompanionArt(target,kind){if(!target)return;if(window.StudentGuideRobot3D)window.StudentGuideRobot3D.unmount(target);if(kind==='wildRobot'){target.innerHTML='';target.classList.add('companion-3d-art');window.StudentGuideRobot3D?.mount(target)}else{target.classList.remove('companion-3d-art');target.innerHTML=art(kind,stage(),data.outfit)}}
function getStudy(){try{return window.studentGuideExportState?window.studentGuideExportState():null}catch(_){return null}}
function computeProgress(){
 const s=getStudy(); if(!s)return;
 const tasks=(s.tasks||[]).filter(t=>t.done).length;
 const sessions=Number(s.sessions||0), cards=(s.cards||[]).length, notes=(s.notes||[]).length;
 const reviewed=(s.cards||[]).reduce((sum,c)=>sum+Number(c.reps||0),0);
 const xp=tasks*25; // الخبرة من المهام الدراسية المكتملة فقط.
 if(xp!==data.xp){data.xp=xp;data.coins=Math.max(data.coins,Math.floor(xp/10));if(data.xp>=700)data.secret=true;save();renderBuddy();}
}
function syncLater(){clearTimeout(syncTimer);syncTimer=setTimeout(computeProgress,220)}
function bubble(msg){const b=$('#companionBubble');if(!b)return;b.textContent=msg;b.classList.add('show');clearTimeout(bubble.t);bubble.t=setTimeout(()=>b.classList.remove('show'),4300)}
function greeting(){const s=getStudy(),done=s?(s.tasks||[]).filter(t=>t.done).length:0;return ['جاهز ننجز خطوة صغيرة اليوم؟','أنا فخور باستمرارك. كل مراجعة تقرّبك من هدفك!','خلينا نراجع مهمة واحدة، وبعدها نأخذ استراحة.'][Math.floor(Date.now()/86400000)%3]+' '+(done?'أنجزت '+done+' مهمة؛ واصل!':'ابدأ بمهمة صغيرة اليوم.')}
function renderBuddy(){
 const dock=$('#companionDock');if(!dock)return;
 if(window.StudentGuideFireWebmejiSync)window.StudentGuideFireWebmejiSync(chosen());
 renderCompanionArt($('#companionArt'),chosen());
 $('#companionLabel').textContent=companionName(chosen());
 $('#companionLevel').textContent='طور '+Math.min(7,1+Math.floor(Math.max(0,Number(data.xp)||0)/100))+' من 7 · '+data.xp+' XP';
 $('#companionStage').textContent='الطور السحري '+Math.min(7,1+Math.floor(Math.max(0,Number(data.xp)||0)/100))+' من 7 · '+rank();
}
const cheers=['أنت قادر عليها! ابدأ بخمس دقائق فقط.','كل صفحة تفهمها تقرّبك من هدفك.','لا تحتاج للكمال؛ المهم أن تواصل.','خذ نفسًا عميقًا، ثم أنجز خطوة صغيرة.','تقدّمك ولو كان بسيطًا يستحق الفخر.','هل نراجع سؤالًا واحدًا معًا؟','استراحة قصيرة ثم نعود أقوى!','أنت تبني مستقبلك خطوة خطوة.'];
let wanderTimer=null, cheerTimer=null, wandering=false;
function encourage(){if(document.hidden||$('#companionDock')?.hidden||$('#companionOverlay')&&!$('#companionOverlay').hidden)return;bubble(cheers[Math.floor(Math.random()*cheers.length)])}
function wander(){
 const buddy=$('#companionBuddy'),dock=$('#companionDock');
 if(!buddy||!dock||dock.hidden||document.hidden||panelOpen||($('#companionOverlay')&&!$('#companionOverlay').hidden)){scheduleWander(3500);return}
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){scheduleWander(9000);return}
 const w=buddy.offsetWidth||96,h=buddy.offsetHeight||112;
 const maxX=Math.max(8,innerWidth-w-8),maxY=Math.max(72,innerHeight-h-12);
 const x=8+Math.random()*Math.max(1,maxX-8),y=Math.max(72,Math.random()*(maxY-72));
 buddy.style.position='fixed';buddy.style.bottom='auto';buddy.style.left=x+'px';buddy.style.top=y+'px';buddy.style.zIndex='801';
 buddy.classList.add('walking');wandering=true;
 setTimeout(()=>{buddy.classList.remove('walking');wandering=false;scheduleWander(5000+Math.random()*6500)},1800+Math.random()*900);
}
function renderHabitat(){const i=stage(),home=$('#habitatHome'),scene=$('#habitatScene');if(!home||!scene)return;const houses=[{name:'مأوى صغير',desc:'بداية الرحلة',emoji:'📦',className:'home-poor'},{name:'كوخ بسيط',desc:'مكان دافئ للراحة',emoji:'🛖',className:'home-cabin'},{name:'بيت مريح',desc:'أثاث ونوافذ مضيئة',emoji:'🏡',className:'home-comfort'},{name:'قصر الرفيق',desc:'بيت أسطوري وسط النجوم',emoji:'🏰',className:'home-royal'}];const h=houses[i];$('#habitatTitle').textContent=h.name;$('#habitatLevel').textContent='المستوى '+(i+1)+' · '+rank();$('#habitatCoins').textContent=data.coins;home.className='habitat-home '+h.className;home.innerHTML='<div class="habitat-house-roof"></div><div class="habitat-house-body"><span class="habitat-house-icon">'+h.emoji+'</span><span class="habitat-house-door"></span><span class="habitat-house-window window-one"></span><span class="habitat-house-window window-two"></span></div><div class="habitat-house-caption">'+h.desc+'</div>';$('#habitatPet').innerHTML=art(chosen(),stage(),data.outfit);scene.className='habitat-scene scene-level-'+i;$('#habitatSky').innerHTML='<div class="pixel-skyline" aria-hidden="true"><i class="pixel-cloud cloud-a"></i><i class="pixel-cloud cloud-b"></i><i class="pixel-sun"></i><i class="pixel-star star-a"></i><i class="pixel-star star-b"></i><i class="pixel-star star-c"></i></div>';$('#habitatSubpage').hidden=true;$('#habitatSubpage').innerHTML='';}
function openHabitat(){const view=$('#companionHabitat');if(!view)return;clearTimeout(wanderTimer);closePanel();view.hidden=false;renderHabitat();}
function closeHabitat(){const view=$('#companionHabitat');if(view)view.hidden=true;scheduleWander(3000);}
function showHabitatSubpage(type){const sub=$('#habitatSubpage');sub.hidden=false;if(type==='interior'){sub.innerHTML='<div class="anime-room-heading"><span class="anime-room-kicker">COMPANION HOME · 3D ROOM</span><h3>🏠 غرفة '+escapeHtml(companionName(chosen()))+'</h3><p>عالم أنمي دافئ بعمق ثلاثي الأبعاد يتطور مع مستواك.</p></div><div class="habitat-interior anime-3d-room level-interior-'+stage()+'"><div class="room-back-wall"><div class="room-window-3d"><span class="window-sky"><i class="pixel-star"></i><i class="pixel-cloud-mini"></i><i class="pixel-star"></i></span><span class="window-horizon"></span><span class="window-hills"></span></div><div class="room-wall-poster"><span class="pixel-emblem">✦</span><small>LEVEL<br>UP!</small></div><div class="room-shelf-3d"><i class="pixel-book book-a"></i><i class="pixel-book book-b"></i><i class="pixel-plant"></i><i class="pixel-trophy"></i></div><div class="room-wall-light"></div></div><div class="room-side-wall"></div><div class="room-floor-3d"><div class="room-floor-grid"></div><div class="room-rug-3d"></div><div class="room-bed-3d"><div class="bed-headboard"></div><div class="bed-pillow"></div><div class="bed-blanket"></div><div class="bed-foot"></div></div><div class="room-nightstand"><span class="pixel-book book-night"></span><i></i></div><div class="room-lamp-3d"><i></i><b></b><span></span></div><div class="room-plant-3d"><i class="pixel-plant"></i><b></b></div><div class="room-pet-3d">'+art(chosen(),stage(),data.outfit)+'</div><div class="room-decor-3d">'+(data.roomItems?Array(Math.min(8,data.roomItems)).fill('<span class="pixel-plant"></span>').join(''):'')+'</div></div><div class="room-level-plaque">✦ '+['بداية بسيطة','كوخ دافئ','جناح أنيق','جناح أسطوري'][stage()]+' ✦</div></div><p class="room-status">🪴 قطع الديكور: '+data.roomItems+' <span>🪙 رصيدك: '+data.coins+'</span></p><button type="button" id="habitatDecorBuy">🪴 أضف ديكور (3 عملات)</button><button type="button" id="habitatCityBack">العودة إلى البيت</button>';sub.querySelector('#habitatDecorBuy').addEventListener('click',()=>{if(data.coins<3){bubble('تحتاج 3 عملات لشراء الديكور.');return}data.coins-=3;data.roomItems++;save();renderHabitat();refreshPanel();showHabitatSubpage('interior')});sub.querySelector('#habitatCityBack').addEventListener('click',()=>sub.hidden=true);return;}else{sub.innerHTML='<h3>🛍️ متجر الرفيق</h3><p>رصيدك: 🪙 '+data.coins+' عملة</p><div class="habitat-shop-grid"><button type="button" data-buy="decor"><span class="pixel-plant"></span> ديكور البيت <strong>3 عملات</strong></button><button type="button" data-buy="outfit"><span class="pixel-shirt"></span> زي جديد <strong>3 عملات</strong></button></div><p class="habitat-shop-note">البيت يتحسن مع مستوياتك؛ يمكنك شراء اللمسات الإضافية من هنا.</p><button type="button" id="habitatShopBack">العودة إلى البيت</button>';}sub.querySelectorAll('#habitatCityBack,#habitatShopBack').forEach(b=>b.addEventListener('click',()=>{sub.hidden=true}));sub.querySelectorAll('[data-buy]').forEach(b=>b.addEventListener('click',()=>{const item=b.dataset.buy,cost=3;if(data.coins<cost){bubble('تحتاج '+cost+' عملات لإتمام الشراء.');return}data.coins-=cost;if(item==='decor')data.roomItems++;if(item==='outfit')data.outfit=(data.outfit+1)%8;save();renderHabitat();refreshPanel();showHabitatSubpage(type);bubble('تم الشراء! شكراً لك.');}));}
function scheduleWander(ms){clearTimeout(wanderTimer);wanderTimer=setTimeout(wander,ms)}
function startAutonomy(){
 scheduleWander(2200);
 clearTimeout(cheerTimer);
 const nextCheer=()=>{cheerTimer=setTimeout(()=>{encourage();nextCheer()},32000+Math.random()*22000)};nextCheer();
}
function openPanel(){const app=document.querySelector('#appContent');if(app&&app.classList.contains('auth-locked')){panelOpen=false;const panel=$('#companionPanel');if(panel)panel.hidden=true;return false}panelOpen=true;$('#companionPanel').hidden=false;refreshPanel();return true}
function closePanel(){panelOpen=false;$('#companionPanel').hidden=true}
function refreshPanel(){
 const s=getStudy()||{tasks:[],sessions:0,cards:[]},done=(s.tasks||[]).filter(t=>t.done).length,total=(s.tasks||[]).length;
 renderCompanionArt($('#companionPanelArt'),chosen());
 $('#companionPanelName').textContent=companionName(chosen());
 $('#companionRank').textContent=rank()+' · '+data.xp+' نقطة خبرة';
 $('#companionTaskStat').textContent=done+'/'+total;$('#companionCoinStat').textContent=data.coins;$('#companionSessionStat').textContent=s.sessions||0;
 $('#companionPanelXp').style.width=levelProgress()+'%';
 $('#companionRoomNote').textContent=data.roomItems?'غرفتك صارت أدفأ! لديك '+data.roomItems+' قطعة ديكور.':'غرفتك جاهزة لأول قطعة ديكور.';
 $('#companionSecret').textContent=data.allModesUnlocked?'كل الأطوار مفتوحة لجميع الرفقاء! ✨':(data.robotUnlocked?'الرفيق السري متاح: روز 🤖':(data.secret?'فتحت التحول السري! ✨':'أكمل إنجازاتك لاكتشاف التحولات النادرة.'));
}
function overlay(first){
 const ov=$('#companionOverlay');ov.hidden=false;
 $('#companionIntroTitle').textContent=first?'اختر رفيق رحلتك':'أهلًا بعودتك!';
 $('#companionIntroCopy').textContent=first?'رحلتك الدراسية تبدأ الآن. اختر رفيقًا يكبر ويتطور مع إنجازاتك.':'رفيقك كان ينتظرك. مستعد لخطوة جديدة؟';
 $('#companionChoose').hidden=!first;$('#companionWelcome').hidden=first;
 $('#companionSkip').hidden=!first;
}
function finishIntro(){
 data.chosen=selected;
 // Companion choice is cosmetic and must not overwrite the student's academic major.
 data.introSeen=true;save();$('#companionOverlay').hidden=true;$('#companionSkip').textContent='تخطي المشهد';renderBuddy();refreshPanel();bubble('تم اختيار '+companionName(chosen())+'.');syncLater();
}
function inject(){
 if($('#companionDock'))return;
 const dock=document.createElement('div');dock.id='companionDock';dock.hidden=true;dock.innerHTML='<button id="companionLaunch" type="button" aria-label="افتح رفيق الدراسة"><span>✨ رفيقي</span><span id="companionLevel">صغير · 0 XP</span></button><div id="companionBuddy" tabindex="0" role="button" aria-label="تفاعل مع الرفيق"><div id="companionBubble" aria-live="polite"></div><div id="companionArt"></div></div><span id="companionLabel" hidden></span>';
 const panel=document.createElement('section');panel.id='companionPanel';panel.hidden=true;panel.setAttribute('aria-label','لوحة الرفيق');panel.innerHTML='<div class="companion-panel-head"><div style="display:flex;align-items:center;gap:8px"><div id="companionPanelArt" style="width:58px;height:66px"></div><div><h3 id="companionPanelName">رفيقي</h3><div id="companionRank" style="font-size:12px;color:#687793"></div></div></div><button class="companion-x" id="companionClose" type="button" aria-label="إغلاق">✕</button></div><div class="companion-meter"><span id="companionPanelXp"></span></div><div id="companionStage" class="companion-stage"></div><div class="companion-stats"><div class="companion-stat">مهام مكتملة<strong id="companionTaskStat">0/0</strong></div><div class="companion-stat">عملات<strong id="companionCoinStat">0</strong></div><div class="companion-stat">جلسات تركيز<strong id="companionSessionStat">0</strong></div></div><p class="companion-message" id="companionRoomNote">غرفتك تنتظرك.</p><p class="companion-message" id="companionSecret">أكمل إنجازاتك لاكتشاف التحولات النادرة.</p><div class="companion-panel-actions"><button id="companionTalk" type="button">💬 شجعني</button><button id="companionOutfit" type="button">👕 تغيير الزي (3 عملات)</button><button id="companionSwitch" type="button">🦊 تبديل الرفيق</button><button id="companionHouse" type="button">🏡 بيت الرفيق</button><button id="companionRoom" type="button">🪴 ديكور الغرفة</button><button id="companionAchievements" type="button">🏆 الإنجازات</button><button id="companionDailyMission" type="button">🎯 مهمة اليوم</button><button id="companionSocialOpen" type="button">👥 الأصدقاء</button></div><form id="companionSecretCodeForm" class="companion-secret-code" autocomplete="off"><label for="companionSecretCodeInput">🔐 كود سري</label><div><input id="companionSecretCodeInput" type="password" inputmode="numeric" maxlength="3" placeholder="•••" aria-label="أدخل الكود السري"><button type="submit">تفعيل</button></div><small id="companionSecretCodeStatus" aria-live="polite">هناك رفيق مخفي وأطوار سرية.</small></form><div id="companionExtra" class="companion-mini" aria-live="polite"></div>';
 const overlay=document.createElement('div');overlay.id='companionOverlay';overlay.hidden=true;overlay.innerHTML='<section class="companion-card" dir="rtl"><button class="companion-skip" id="companionSkip" type="button">تخطي المشهد</button><p class="companion-kicker">دليل الطالب · رحلتك الدراسية</p><h2 id="companionIntroTitle">اختر رفيق رحلتك</h2><p id="companionIntroCopy">رحلتك الدراسية تبدأ الآن.</p><div class="companion-heroes companion-heroes-all" id="companionChoose"></div><div id="companionWelcome" hidden><div style="width:140px;height:150px;margin:0 auto" id="companionWelcomeArt"></div></div><button class="companion-primary" id="companionBegin" type="button">ابدأ الرحلة ←</button><button class="companion-secondary" id="companionReturn" type="button" hidden>متابعة الدراسة</button><div class="companion-stage">الرفيق يتطور مع إنجازاتك · حفظ محلي في هذه النسخة</div></section>';
 document.body.append(dock,panel,overlay);
 const habitat=document.createElement('section');habitat.id='companionHabitat';habitat.hidden=true;habitat.dir='rtl';habitat.innerHTML='<header class="habitat-top"><button type="button" id="habitatBack">← رجوع</button><div class="habitat-title"><strong id="habitatTitle">بيت الرفيق</strong><small id="habitatLevel"></small></div><div class="habitat-wallet">🪙 <span id="habitatCoins">0</span></div></header><div id="habitatScene" class="habitat-scene"><div id="habitatSky" class="habitat-sky"></div><div id="habitatHome" class="habitat-home"></div><div id="habitatPet" class="habitat-pet"></div><div class="habitat-ground"></div></div><div class="habitat-bottom"><button type="button" id="habitatInterior">🛋️ داخل البيت</button><button type="button" id="habitatShop">🛍️ المتجر</button><button type="button" id="habitatCompanionMenu">🐾 قائمة الرفيق</button></div><div id="habitatSubpage" class="habitat-subpage" hidden></div>';document.body.append(habitat);
 const studyForUnlock=getStudy();const flameUnlocked=!!studyForUnlock?.fireCompanionUnlocked;$('#companionChoose').innerHTML=Object.keys(COMPANIONS).filter(key=>(key!=='flame'||flameUnlocked)&&(key!=='wildRobot'||data.robotUnlocked)&&(key!=='batman'||data.batmanUnlocked)).map(key=>'<button class="companion-hero '+(key===chosen()?'selected':'')+'" type="button" data-companion-choice="'+key+'" aria-pressed="'+(key===chosen())+'"><span>'+art(key,0,0)+'</span><strong>'+COMPANIONS[key].name+'</strong><small>'+({medicine:'المثابرة والدقة',economics:'الذكاء والتخطيط',robot:'رفيق تقني',lina:'رفيقة المذاكرة',kai:'طاقة وموسيقى',mimi:'لطافة ومرح',zayd:'تفكير وتركيز',sara:'تشجيع وود',adam:'شجاعة وثبات',eren:'إرادة لا تستسلم',armin:'ذكاء وشجاعة',mikasa:'قوة ووفاء'}[key]||'رفيق الدراسة')+'</small></button>').join('');
}
function showExtra(html){$('#companionExtra').innerHTML=html}
function todayKey(){const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
function ensureDailyMission(){if(data.missionDay!==todayKey()){data.missionDay=todayKey();data.missionDone=false;save()}}
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
 $('#companionCompleteMission').addEventListener('click',()=>{ensureDailyMission();if(data.missionDone)return;data.missionDone=true;data.badges=Array.isArray(data.badges)?data.badges:[];if(!data.badges.includes('first-mission'))data.badges.push('first-mission');save();renderBuddy();refreshPanel();showExtra('<strong>أحسنت! أنجزت مهمة اليوم 🎉</strong><span>الخبرة تُمنح للمهام الدراسية التي تضيفها وتكملها من قائمة الدراسة.</span><span>شارات الرفيق: '+data.badges.length+'</span>');bubble('فخور بك! أنجزت مهمة اليوم. خذ لحظة للاحتفال بتقدمك.');});
}
function studyStreakStats(byDay={}){return window.studentGuideStudyStreakStats?window.studentGuideStudyStreakStats(byDay):{current:0,best:0}}function showStudyAchievements(){const s=getStudy()||{},st=studyStreakStats(s.focusByDay||{}),badges=Array.isArray(data.badges)?data.badges.length:0;showExtra('<strong>إنجازات المذاكرة</strong><span>📘 '+((s.tasks||[]).filter(t=>t.done).length)+' مهمة دراسية مكتملة</span><span>🌟 '+data.xp+' XP</span><span>🔥 سلسلة المذاكرة الحالية: '+st.current+' يوم</span><span>🏅 شارة 10 أيام: '+(st.best>=10?'مفتوحة 🔥':'مقفلة 🔒')+'</span><span>💎 شارة 100 يوم: '+(st.best>=100?'مفتوحة':'مقفلة 🔒')+'</span><span>✨ '+badges+' شارات رفيق إضافية</span>')}
function bind(){
 $('#companionLaunch').addEventListener('click',()=>{openPanel();bubble('أنا هنا! '+greeting())});
 $('#settingsChooseCompanion')?.addEventListener('click',()=>{
   selected=chosen();
   const overlay=$('#companionOverlay'),choose=$('#companionChoose');
   if(!overlay||!choose){bubble('تعذر فتح قائمة اختيار الرفيق.');return}
   overlay.hidden=false;
   $('#companionIntroTitle').textContent='اختر رفيقك';
   $('#companionIntroCopy').textContent='اختر الشخصية التي تريدها رفيقًا نشطًا على الشاشة.';
   choose.hidden=false;
   $('#companionWelcome').hidden=true;
   $('#companionSkip').hidden=false;
   $('#companionSkip').textContent='إلغاء';
   $('#companionBegin').textContent='اختيار '+companionName(selected)+' ←';
   choose.querySelectorAll('[data-companion-choice]').forEach(btn=>{
     const on=btn.dataset.companionChoice===selected;
     btn.classList.toggle('selected',on);
     btn.setAttribute('aria-pressed',String(on));
   });
 });
 $('#companionBuddy').addEventListener('click',()=>{if(!panelOpen){bubble(greeting());openPanel()}else bubble('اضغط على أزرار الرفيق لتجربة حركة مختلفة.')});
 $('#companionBuddy').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openPanel();bubble(greeting())}});
 $('#companionClose').addEventListener('click',closePanel);
  $('#companionSocialOpen').addEventListener('click',()=>{closePanel();const nav=document.querySelector('[data-view="community"]');if(nav)nav.click();const tab=document.querySelector('[data-social-tab="direct"]');if(tab)tab.click()});
 $('#companionTalk').addEventListener('click',()=>bubble(greeting()));




 $('#companionHouse').addEventListener('click',openHabitat);
 $('#habitatBack').addEventListener('click',closeHabitat);
 $('#habitatInterior').addEventListener('click',()=>showHabitatSubpage('interior'));


 $('#habitatShop').addEventListener('click',()=>showHabitatSubpage('shop'));
 $('#habitatCompanionMenu').addEventListener('click',()=>openPanel());
 $('#companionOutfit').addEventListener('click',()=>{if(!data.allModesUnlocked&&data.coins<3){bubble('تحتاج 3 عملات لتغيير الزي. أكمل مهمة دراسية أولًا.');return}if(!data.allModesUnlocked)data.coins-=3;data.outfit=(data.outfit+1)%4;save();renderBuddy();refreshPanel();bubble(data.allModesUnlocked?'تم تغيير الزي؛ جميع الأطوار مفتوحة!':'زي جديد! أنفقت 3 عملات من رصيدك.')});
 $('#companionSecretCodeForm').addEventListener('submit',e=>{e.preventDefault();const input=$('#companionSecretCodeInput'),status=$('#companionSecretCodeStatus'),code=input.value.trim();input.value='';if(code==='121'){data.batmanUnlocked=true;data.chosen='batman';selected='batman';save();renderBuddy();refreshPanel();status.textContent='تم فتح باتمان، الرفيق السري! 🦇';bubble('تم فتح باتمان، الرفيق السري!');return}if(code==='12'){data.robotUnlocked=true;data.chosen='wildRobot';selected='wildRobot';save();renderBuddy();refreshPanel();status.textContent='تم فتح روز، الرفيق الروبوتي السري! 🤖';bubble('تم فتح روز، الرفيق الروبوتي السري!');return}if(code==='13'){data.allModesUnlocked=false;data.xp=1000;data.secret=true;save();renderBuddy();refreshPanel();status.textContent='تم رفع مستوى الرفيق إلى الحد الأقصى فقط! ⭐';bubble('وصلت إلى أعلى مستوى؛ فتح جميع الأطوار غير مشمول بهذا الكود.');return}if(code==='14'){data.allModesUnlocked=false;data.xp=0;data.secret=false;save();renderBuddy();refreshPanel();status.textContent='تمت إعادة الأطوار والمستوى إلى البداية. 🔄';bubble('تمت إعادة مستوى الأطوار إلى البداية؛ الرفقاء السريون المفتوحون ما زالوا محفوظين.');return}status.textContent='الكود غير صحيح؛ حاول مرة أخرى.';bubble('الكود غير صحيح.');});
 $('#companionSwitch').textContent='✨ رفيق مختلف';
 $('#companionSwitch').addEventListener('click',()=>{const studyForUnlock=getStudy();const keys=Object.keys(COMPANIONS).filter(key=>(key!=='flame'||!!studyForUnlock?.fireCompanionUnlocked)&&(key!=='wildRobot'||data.robotUnlocked)&&(key!=='batman'||data.batmanUnlocked)),i=keys.indexOf(chosen());data.chosen=keys[(i+1)%keys.length];selected=data.chosen;save();renderBuddy();refreshPanel();$('#companionSwitch').textContent='✨ التالي: '+companionName(keys[(keys.indexOf(data.chosen)+1)%keys.length]);bubble('تم اختيار '+companionName(data.chosen)+'! لكل رفيق شكل ولون وشخصية مختلفة.')});
 $('#companionRoom').addEventListener('click',()=>{if(data.coins<3){bubble('تحتاج 3 عملات لإضافة ديكور. أكمل مهمة اليوم أولًا.');return}data.coins-=3;data.roomItems++;save();refreshPanel();$('#companionRoomNote').textContent='غرفتك فيها الآن '+data.roomItems+' قطع ديكور.';showExtra('<strong>🏠 غرفتك تتطور</strong><span>🪴 🛋️ 🖼️ ✨</span><span>أضفت قطعة ديكور رقم '+data.roomItems+'. رصيدك '+data.coins+' عملة.</span>')});
 $('#companionAchievements').addEventListener('click',showStudyAchievements);
 $('#companionDailyMission').addEventListener('click',dailyMission);
 $('#companionSkip').addEventListener('click',()=>finishIntro());
 $('#companionBegin').addEventListener('click',()=>{if(!data.chosen)data.chosen=selected;finishIntro()});
 $('#companionReturn').addEventListener('click',()=>{$('#companionOverlay').hidden=true;data.introSeen=true;save()});
 document.querySelectorAll('[data-companion-choice]').forEach(btn=>btn.addEventListener('click',()=>{selected=btn.dataset.companionChoice;document.querySelectorAll('[data-companion-choice]').forEach(b=>{const on=b===btn;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on))});$('#companionBegin').textContent='اختيار '+(COMPANIONS[selected]?.name||'الرفيق')+' ←'}));
 // Drag the mascot within the viewport.
 const buddy=$('#companionBuddy');let drag=null;
 // A deliberate long press anywhere on the page opens the companion menu.
 let holdTimer=null,holdStart=null;
 const cancelHold=()=>{clearTimeout(holdTimer);holdTimer=null;holdStart=null};
 document.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;if(e.target.closest('button,a,input,textarea,select,[contenteditable="true"],#companionBuddy,#companionPanel,#companionOverlay'))return;holdStart={x:e.clientX,y:e.clientY};holdTimer=setTimeout(()=>{holdTimer=null;openPanel();bubble('قائمة الرفيق جاهزة لك!');},650)},{passive:true});
 document.addEventListener('pointermove',e=>{if(!holdStart)return;if(Math.abs(e.clientX-holdStart.x)>12||Math.abs(e.clientY-holdStart.y)>12)cancelHold()},{passive:true});
 document.addEventListener('pointerup',cancelHold,{passive:true});document.addEventListener('pointercancel',cancelHold,{passive:true});document.addEventListener('contextmenu',e=>{if(!e.target.closest('input,textarea,[contenteditable="true"]')){e.preventDefault();openPanel();bubble('قائمة الرفيق جاهزة لك!')}});

 buddy.style.touchAction='none';
 buddy.addEventListener('pointerdown',e=>{if(e.button!==0&&e.pointerType==='mouse')return;const r=buddy.getBoundingClientRect();drag={x:e.clientX-r.left,y:e.clientY-r.top,pointerId:e.pointerId};clearTimeout(wanderTimer);buddy.classList.add('being-held');buddy.style.transition='none';buddy.setPointerCapture(e.pointerId);e.preventDefault()});
 buddy.addEventListener('pointermove',e=>{if(!drag||drag.pointerId!==e.pointerId)return;const x=Math.max(0,Math.min(innerWidth-buddy.offsetWidth,e.clientX-drag.x));const y=Math.max(60,Math.min(innerHeight-buddy.offsetHeight,e.clientY-drag.y));buddy.style.position='fixed';buddy.style.bottom='auto';buddy.style.left=x+'px';buddy.style.top=y+'px';buddy.style.zIndex='801'});
 const end=e=>{if(!drag||e&&drag.pointerId!==e.pointerId)return;drag=null;buddy.classList.remove('being-held');buddy.style.transition='';scheduleWander(2800)};buddy.addEventListener('pointerup',end);buddy.addEventListener('pointercancel',end);
 document.addEventListener('click',e=>{if(e.target.closest('#appContent button, #appContent form'))syncLater()});
 document.addEventListener('submit',e=>{if(e.target.closest('#appContent'))syncLater()});
 const app=$('#appContent');
 const mo=new MutationObserver(()=>{const visible=!app.classList.contains('auth-locked');$('#companionDock').hidden=!visible;if(visible){computeProgress();renderBuddy();if(!data.introSeen){selected=data.chosen||'medicine';data.introSeen=true;save();bubble('أهلًا! أنا رفيقك الدراسي. اضغط «رفيقي» لفتح أدواتي.')}else if(!sessionStorage.getItem('companionWelcomeSeen')){sessionStorage.setItem('companionWelcomeSeen','1');bubble('أهلًا بعودتك! اضغط «رفيقي» لفتح أدواتك دون تعطيل الصفحة.')}}});
 mo.observe(app,{attributes:true,attributeFilter:['class']});
 // App might already be unlocked on a warm reload.
 if(!app.classList.contains('auth-locked')){$('#companionDock').hidden=false;if(!data.introSeen){data.introSeen=true;save();renderBuddy();bubble('أهلًا! أنا رفيقك الدراسي. اضغط «رفيقي» لفتح أدواتي.')}else renderBuddy()}
}
window.addEventListener('student-guide-companion-customized',()=>{try{Object.assign(data,JSON.parse(localStorage.getItem('studentGuideCompanion_v2')||'{}'));renderBuddy();refreshPanel();if(!$('#companionHabitat')?.hidden)renderHabitat()}catch(_){}});
function init(){
 inject();
 const app=document.querySelector('#appContent');
 const syncDockVisibility=()=>{const dock=$('#companionDock');if(!dock)return;dock.hidden=app?app.classList.contains('auth-locked'):false;};
 syncDockVisibility();
 if(app){new MutationObserver(syncDockVisibility).observe(app,{attributes:true,attributeFilter:['class']});}
 bind();renderBuddy();startAutonomy();
 const moods=['happy','curious','excited','sleepy','surprised','angry','sad'];let moodIndex=0;setInterval(()=>{if(document.hidden)return;moodIndex=(moodIndex+1)%moods.length;data.mood=moods[moodIndex];renderBuddy();if(!$('#companionHabitat')?.hidden)$('#habitatPet').innerHTML=art(chosen(),stage(),data.outfit);if(!$('#companionOverlay')?.hidden)$('#companionChoose').querySelectorAll('[data-companion-choice]').forEach(b=>{const k=b.dataset.companionChoice;b.querySelector('span').innerHTML=art(k,0,0)});},3200);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();