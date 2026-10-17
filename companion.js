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
 sara:{name:'سارة',coat:'#bd466d',fur:'#c98a62',accent:'#ffb0c8',kind:'cap',emoji:'♥'},
 adam:{name:'آدم',coat:'#344da8',fur:'#c28b69',accent:'#9eb6ff',kind:'dark',emoji:'★'},
 eren:{name:'إيرين ييغر',coat:'#5b493c',fur:'#4b392f',accent:'#b9d4ad',kind:'eren',emoji:'⚔️'},
 armin:{name:'أرمين أرليرت',coat:'#c4a36c',fur:'#e6c9a0',accent:'#e8d8a8',kind:'armin',emoji:'🪽'},
 mikasa:{name:'ميكاسا أكرمان',coat:'#6f2e38',fur:'#222733',accent:'#a93d4a',kind:'mikasa',emoji:'🧣'},
 luffy:{name:'لوفي',coat:'#b92d32',fur:'#57362a',accent:'#f6c85f',kind:'anime-luffy',emoji:'🍖'},
 zoro:{name:'زورو',coat:'#32694a',fur:'#4e8a53',accent:'#b8d58a',kind:'anime-zoro',emoji:'⚔️'},
 sanji:{name:'سانجي',coat:'#26364b',fur:'#e5c36d',accent:'#f0d18a',kind:'anime-sanji',emoji:'🍳'},
 naruto:{name:'ناروتو',coat:'#e87824',fur:'#f2b747',accent:'#e7a62e',kind:'anime-naruto',emoji:'🍥'},
 sasuke:{name:'ساسكي',coat:'#30384e',fur:'#202c45',accent:'#8da7d7',kind:'anime-sasuke',emoji:'⚡'},
 narutoMech:{name:'ناروتو الآلي',coat:'#3979a7',fur:'#dcecff',accent:'#56e3ff',kind:'anime-mech',emoji:'🤖'},
 bruceLee:{name:'بروس لي',coat:'#d9a82e',fur:'#242329',accent:'#f6d66c',kind:'anime-bruce',emoji:'🥋'},
 batman:{name:'باتمان',coat:'#252b3b',fur:'#1a2030',accent:'#f6d66c',kind:'anime-batman',emoji:'🦇'},
 levi:{name:'ليڤاي أكرمان',coat:'#344c3e',fur:'#28312c',accent:'#d2dfd1',kind:'anime-levi',emoji:'🗡️'},
 erenTitan:{name:'إيرين العملاق',coat:'#923e3a',fur:'#7e292a',accent:'#ff8d63',kind:'anime-titan',emoji:'🔥'}
};
function companionName(kind){return data.customName||((COMPANIONS[kind]||COMPANIONS.medicine).name)}
function art(kind,stage=0,outfit=0){
 const c=COMPANIONS[kind]||COMPANIONS.medicine;
 if(String(c.kind).startsWith('anime-')){
  const k=c.kind, titan=k==='anime-titan', mech=k==='anime-mech';
  const palettes={
   'anime-luffy':{skin:'#f5c9a7',hair:'#30241f',cloth:'#c72f38',trim:'#f4c64e',dark:'#74232a'},
   'anime-zoro':{skin:'#f0c5a5',hair:'#4e8846',cloth:'#356b4a',trim:'#c8d99b',dark:'#203f31'},
   'anime-sanji':{skin:'#f0c5a3',hair:'#e4c05c',cloth:'#27374b',trim:'#eee5d1',dark:'#172335'},
   'anime-naruto':{skin:'#f2c5a1',hair:'#f3b12e',cloth:'#e87524',trim:'#f8d34c',dark:'#a9431f'},
   'anime-sasuke':{skin:'#edc1a0',hair:'#202635',cloth:'#30394d',trim:'#7e9fd7',dark:'#161c2b'},
   'anime-mech':{skin:'#dbeaf3',hair:'#f4a52b',cloth:'#347ba6',trim:'#58e9ff',dark:'#173c59'},
   'anime-bruce':{skin:'#e9bd9a',hair:'#252329',cloth:'#d6a32a',trim:'#fff0ae',dark:'#6d4b18'},
   'anime-batman':{skin:'#e7c3a4',hair:'#1a2030',cloth:'#293142',trim:'#f5d15f',dark:'#101521'},
   'anime-levi':{skin:'#f0c6a6',hair:'#35352f',cloth:'#4d6650',trim:'#d9e0d5',dark:'#2b3a30'},
   'anime-titan':{skin:'#ad554b',hair:'#3a2929',cloth:'#813733',trim:'#ff9270',dark:'#3a2528'}
  };
  const a=palettes[k]||palettes['anime-luffy'],S=a.skin,H=a.hair,C=a.cloth,T=a.trim,D=a.dark;
  const hair={
   'anime-luffy':'<path d="M45 65 L32 42 L47 47 L42 28 L61 42 L70 20 L82 43 L101 27 L103 45 L122 39 L112 66Z" fill="'+H+'" stroke="#211a18" stroke-width="3" stroke-linejoin="round"/><path d="M39 48 Q80 38 119 49 L117 59 L42 59Z" fill="#c72f38" stroke="#76232a" stroke-width="2"/><path d="M47 50 Q80 44 111 50" fill="none" stroke="#f26c60" stroke-width="2"/>',
   'anime-zoro':'<path d="M43 67 L36 35 L53 44 L57 22 L72 43 L91 25 L98 46 L119 36 L113 68Z" fill="'+H+'" stroke="#294333" stroke-width="3"/><path d="M48 50 L111 50" stroke="#8dbf72" stroke-width="3"/><path d="M46 59 L39 79 M115 59 L121 79" stroke="#4e8846" stroke-width="5"/>',
   'anime-sanji':'<path d="M42 66 Q35 37 59 27 Q92 14 113 40 L117 60 L103 54 L98 39 Q82 55 49 48Z" fill="'+H+'" stroke="#78602c" stroke-width="3"/><path d="M101 59 Q121 60 110 82 Q106 88 99 82" fill="none" stroke="#b28c35" stroke-width="5"/>',
   'anime-naruto':'<path d="M42 66 L31 41 L49 48 L46 27 L64 43 L73 19 L85 42 L105 27 L103 48 L123 39 L112 68Z" fill="'+H+'" stroke="#a96a23" stroke-width="3" stroke-linejoin="round"/><path d="M42 48 L112 48 L115 59 L41 59Z" fill="#9da9b7" stroke="#515d70" stroke-width="3"/><path d="M50 51 L105 51" stroke="#e6eaf0" stroke-width="2"/><path d="M44 56 L34 62 M112 56 L123 62" stroke="#596679" stroke-width="3"/>',
   'anime-sasuke':'<path d="M40 67 L37 35 L53 43 L62 19 L74 42 L96 24 L101 47 L119 37 L111 69Z" fill="'+H+'" stroke="#121824" stroke-width="3"/><path d="M47 47 L108 47" stroke="#46516a" stroke-width="3"/><path d="M51 60 L43 76 M109 60 L118 75" stroke="#202635" stroke-width="5"/>',
   'anime-mech':'<path d="M38 68 L29 39 L49 47 L46 24 L64 42 L75 17 L87 42 L108 26 L105 48 L124 39 L115 68Z" fill="#f6ae35" stroke="#22506c" stroke-width="3"/><path d="M39 48 L114 48 L116 60 L38 60Z" fill="#8c9aa9" stroke="#254f6a" stroke-width="3"/><path d="M46 53 L107 53" stroke="#5deaff" stroke-width="3"/>',
   'anime-bruce':'<path d="M44 63 Q39 31 67 27 Q96 24 111 50 L109 65Z" fill="'+H+'" stroke="#17171b" stroke-width="3"/><path d="M48 49 Q77 37 105 49" fill="none" stroke="#4d4a52" stroke-width="3"/>',
   'anime-batman':'<path d="M39 70 L29 13 L56 34 L76 5 L95 34 L124 13 L114 71 L101 54 L53 54Z" fill="'+H+'" stroke="#101521" stroke-width="4" stroke-linejoin="round"/><path d="M42 58 L112 58" stroke="#515b6d" stroke-width="3"/>',
   'anime-levi':'<path d="M42 66 L39 35 L54 42 L63 22 L75 42 L94 28 L99 48 L116 40 L110 67Z" fill="'+H+'" stroke="#252923" stroke-width="3"/><path d="M47 48 L107 48" stroke="#686a61" stroke-width="3"/>',
   'anime-titan':'<path d="M35 69 L23 35 L42 43 L39 15 L59 37 L72 5 L86 36 L108 15 L107 43 L129 30 L116 72 L102 57 L50 57Z" fill="'+H+'" stroke="#2b2021" stroke-width="4"/>'
  }[k]||'';
  const face=titan
   ?'<path d="M43 53 Q80 36 117 53 L112 100 L96 122 L80 132 L64 122 L48 100Z" fill="'+S+'" stroke="#5b292a" stroke-width="3"/><path d="M43 75 L66 68 L77 79 L62 84Z M84 79 L96 68 L117 75 L99 84Z" fill="#fff0d8" stroke="#4a2428" stroke-width="3"/><path d="M45 92 L64 91 L72 100 L80 95 L89 100 L97 91 L115 92 L105 108 L91 115 L80 110 L69 115 L54 108Z" fill="#291e23"/><path d="M51 92 L65 95 M95 95 L109 92" stroke="#ff947a" stroke-width="3"/>'
   :'<path d="M45 54 Q42 42 57 36 Q80 25 103 36 Q119 43 115 64 L111 91 Q105 111 80 115 Q56 111 49 91Z" fill="'+S+'" stroke="#865c51" stroke-width="2.5"/><path d="M47 69 Q60 61 75 69 L70 77 L50 77Z" fill="#fffdf5"/><path d="M85 69 Q100 61 114 69 L111 77 L90 77Z" fill="#fffdf5"/><ellipse cx="62" cy="71" rx="5.5" ry="8" fill="'+(k==='anime-sasuke'?'#6b83d7':k==='anime-mech'?'#51eaff':'#49352d')+'"/><ellipse cx="99" cy="71" rx="5.5" ry="8" fill="'+(k==='anime-sasuke'?'#6b83d7':k==='anime-mech'?'#51eaff':'#49352d')+'"/><ellipse cx="63" cy="72" rx="2" ry="4" fill="#171923"/><ellipse cx="100" cy="72" rx="2" ry="4" fill="#171923"/><path d="M47 65 L73 62 M88 62 L113 65" stroke="'+H+'" stroke-width="4" stroke-linecap="round"/><path d="M79 77 L75 88 L82 90" fill="none" stroke="#bc8270" stroke-width="2"/>';
  const mouth=(data.mood==='sad'||data.mood==='tired')?'<path d="M70 101 Q80 92 90 101" fill="none" stroke="#713f3a" stroke-width="3" stroke-linecap="round"/>':(data.mood==='angry')?'<path d="M69 101 L91 101" stroke="#713f3a" stroke-width="3" stroke-linecap="round"/>':(data.mood==='surprised')?'<ellipse cx="80" cy="101" rx="5" ry="7" fill="#713f3a"/>':'<path d="M68 98 Q80 109 92 98" fill="none" stroke="#713f3a" stroke-width="3" stroke-linecap="round"/>';
  let body='<path d="M48 117 Q80 107 112 117 L127 162 L112 173 L48 173 L33 162Z" fill="'+C+'" stroke="'+D+'" stroke-width="3"/><path d="M54 119 L80 143 L106 119" fill="none" stroke="'+T+'" stroke-width="5"/><path d="M69 142 L91 142 L88 171 L72 171Z" fill="'+D+'" opacity=".65"/><path d="M45 128 L27 149 L34 158 L53 142 M115 128 L133 149 L126 158 L107 142" fill="'+C+'" stroke="'+D+'" stroke-width="3"/><path d="M61 173 L59 185 L76 185 L80 173 L84 185 L101 185 L99 173" fill="#252b39" stroke="'+D+'" stroke-width="3"/>';
  if(k==='anime-luffy')body='<path d="M48 117 Q80 108 112 117 L126 161 L112 173 L48 173 L34 161Z" fill="#d2343b" stroke="#78232b" stroke-width="3"/><path d="M51 119 Q80 151 109 119" fill="none" stroke="#f6c64e" stroke-width="5"/><path d="M58 133 L102 133" stroke="#f5c64e" stroke-width="3"/><path d="M44 127 L26 148 L35 158 L53 143 M116 127 L134 148 L125 158 L107 143" fill="#f1c4a2" stroke="#8b4f3b" stroke-width="3"/><path d="M59 173 L57 185 L76 185 L80 173 L84 185 L103 185 L100 173" fill="#5c4a37" stroke="#30241f" stroke-width="3"/>';
  if(k==='anime-zoro')body='<path d="M48 117 L112 117 L127 164 L112 174 L48 174 L33 164Z" fill="#386e4a" stroke="#203e30" stroke-width="3"/><path d="M53 121 L107 121 L99 139 L61 139Z" fill="#d9d8b0"/><path d="M62 141 L98 141 L94 173 L66 173Z" fill="#203e30"/><path d="M45 127 L23 147 L33 158 L55 141 M115 127 L137 147 L127 158 L105 141" fill="#386e4a" stroke="#203e30" stroke-width="3"/><path d="M57 173 L56 185 L76 185 L80 173 L84 185 L104 185 L101 173" fill="#d9d8b0"/><path d="M28 147 L20 139 M131 147 L139 139" stroke="#d9d8b0" stroke-width="4"/>';
  if(k==='anime-sanji')body='<path d="M48 117 L112 117 L127 164 L112 174 L48 174 L33 164Z" fill="#27374b" stroke="#172335" stroke-width="3"/><path d="M55 120 L80 145 L105 120" fill="#eee5d1" stroke="#b8b9b6" stroke-width="2"/><path d="M75 145 L85 145 L91 172 L69 172Z" fill="#eee5d1"/><path d="M45 127 L25 147 L34 157 L54 141 M115 127 L135 147 L126 157 L106 141" fill="#27374b" stroke="#172335" stroke-width="3"/><path d="M57 173 L56 185 L76 185 L80 173 L84 185 L104 185 L101 173" fill="#202b3c"/>';
  if(k==='anime-naruto')body='<path d="M48 117 L112 117 L127 164 L112 174 L48 174 L33 164Z" fill="#e87524" stroke="#a9431f" stroke-width="3"/><path d="M50 121 L110 121 L102 139 L58 139Z" fill="#f3b12e"/><path d="M63 140 L97 140 L93 173 L67 173Z" fill="#e9edf2"/><path d="M45 127 L25 147 L34 158 L54 141 M115 127 L135 147 L126 158 L106 141" fill="#e87524" stroke="#a9431f" stroke-width="3"/><path d="M57 173 L56 185 L76 185 L80 173 L84 185 L104 185 L101 173" fill="#39465b"/>';
  if(k==='anime-sasuke')body='<path d="M48 117 L112 117 L127 164 L112 174 L48 174 L33 164Z" fill="#30394d" stroke="#161c2b" stroke-width="3"/><path d="M51 120 L109 120 L98 141 L62 141Z" fill="#c8d5e7"/><path d="M63 142 L97 142 L93 173 L67 173Z" fill="#202635"/><path d="M45 127 L25 147 L34 158 L54 141 M115 127 L135 147 L126 158 L106 141" fill="#30394d" stroke="#161c2b" stroke-width="3"/><path d="M57 173 L56 185 L76 185 L80 173 L84 185 L104 185 L101 173" fill="#222838"/><path d="M96 131 L117 153" stroke="#7e9fd7" stroke-width="3"/>';
  if(mech)body='<path d="M48 117 L112 117 L127 164 L112 174 L48 174 L33 164Z" fill="#347ba6" stroke="#173c59" stroke-width="4"/><path d="M53 122 L107 122 L100 143 L60 143Z" fill="#eaf7ff" stroke="#58e9ff" stroke-width="3"/><circle cx="80" cy="150" r="10" fill="#58e9ff" stroke="#eafcff" stroke-width="3"/><path d="M45 127 L24 147 L33 158 L54 141 M115 127 L136 147 L127 158 L106 141" fill="#dbeaf3" stroke="#347ba6" stroke-width="4"/><path d="M57 173 L56 185 L76 185 L80 173 L84 185 L104 185 L101 173" fill="#173c59"/>';
  if(k==='anime-bruce')body='<path d="M48 117 L112 117 L127 164 L112 174 L48 174 L33 164Z" fill="#d6a32a" stroke="#6d4b18" stroke-width="3"/><path d="M50 121 L110 121 L100 138 L60 138Z" fill="#fff0ae"/><path d="M62 140 L98 140 L93 173 L67 173Z" fill="#d6a32a"/><path d="M45 127 L25 147 L34 158 L54 141 M115 127 L135 147 L126 158 L106 141" fill="#e9bd9a" stroke="#6d4b18" stroke-width="3"/><path d="M57 173 L56 185 L76 185 L80 173 L84 185 L104 185 L101 173" fill="#24232a"/>';
  if(k==='anime-batman')body='<path d="M48 117 L112 117 L127 164 L112 174 L48 174 L33 164Z" fill="#293142" stroke="#101521" stroke-width="4"/><path d="M51 120 L109 120 L101 142 L59 142Z" fill="#4b5568" stroke="#111722" stroke-width="2"/><path d="M57 123 L80 139 L103 123 L96 147 L64 147Z" fill="#202938" stroke="#68758a" stroke-width="1.5"/><path d="M63 126 L80 136 L97 126 L91 142 L69 142Z" fill="#151d29"/><path d="M56 148 L73 151 L70 168 L56 166Z M104 148 L87 151 L90 168 L104 166Z" fill="#343e50" stroke="#141b28" stroke-width="2"/><path d="M75 150 L85 150 L88 173 L72 173Z" fill="#151c29" stroke="#69768a" stroke-width="1.5"/><path d="M45 127 L25 147 L34 158 L54 141 M115 127 L135 147 L126 158 L106 141" fill="#293142" stroke="#101521" stroke-width="3"/><path d="M29 145 L37 151 L33 158 L25 152Z M131 145 L123 151 L127 158 L135 152Z" fill="#586478"/><path d="M57 173 L56 185 L76 185 L80 173 L84 185 L104 185 L101 173" fill="#101521"/><path d="M54 169 L76 169 L76 176 L54 176Z M84 169 L106 169 L106 176 L84 176Z" fill="#4b5568" stroke="#151b27" stroke-width="1.5"/>';
  if(k==='anime-levi')body='<path d="M48 117 L112 117 L127 164 L112 174 L48 174 L33 164Z" fill="#4d6650" stroke="#2b3a30" stroke-width="3"/><path d="M51 120 L109 120 L99 141 L61 141Z" fill="#d9e0d5"/><path d="M62 142 L98 142 L94 173 L66 173Z" fill="#d9e0d5"/><path d="M45 127 L25 147 L34 158 L54 141 M115 127 L135 147 L126 158 L106 141" fill="#4d6650" stroke="#2b3a30" stroke-width="3"/><path d="M57 173 L56 185 L76 185 L80 173 L84 185 L104 185 L101 173" fill="#303d32"/><path d="M62 145 L54 164 M98 145 L106 164" stroke="#a7b8a7" stroke-width="3"/>';
  if(titan)body='<path d="M42 117 L118 117 L139 165 L119 178 L41 178 L21 165Z" fill="#813733" stroke="#3a2528" stroke-width="4"/><path d="M48 122 L112 122 L103 146 L57 146Z" fill="#ff9270"/><path d="M61 147 L99 147 L94 178 L66 178Z" fill="#3a2528"/><path d="M41 126 L15 150 L27 164 L54 143 M119 126 L145 150 L133 164 L106 143" fill="#ad554b" stroke="#3a2528" stroke-width="4"/><path d="M54 177 L51 188 L76 188 L80 177 L84 188 L109 188 L106 177" fill="#3a2528"/>';
  let gear='';
  if(k==='anime-zoro')gear='<path d="M48 115 Q80 123 112 115 L110 130 Q80 140 50 130Z" fill="#c8d99b" stroke="#203f31" stroke-width="2"/><path d="M62 124 L98 124" stroke="#203f31" stroke-width="3"/><path d="M30 139 L17 116 M130 139 L143 116" stroke="#dfe7ee" stroke-width="4" stroke-linecap="round"/><path d="M14 113 L20 104 L25 115Z M140 113 L146 104 L151 115Z" fill="#dfe7ee"/>';
  if(k==='anime-batman')gear='<path d="M43 116 Q80 132 117 116 L112 139 L80 153 L48 139Z" fill="#171e2b" stroke="#101521" stroke-width="3"/><path d="M70 132 L80 138 L90 132 L88 147 L72 147Z" fill="#f5d15f" stroke="#fff0a3" stroke-width="1.5"/><path d="M50 117 L42 101 M110 117 L118 101" stroke="#293142" stroke-width="4"/><path d="M47 138 L113 138 L109 149 L51 149Z" fill="#d4b65f" stroke="#161c28" stroke-width="3"/><path d="M55 140 L64 140 L63 147 L54 147Z M70 140 L78 140 L78 147 L69 147Z M84 140 L92 140 L92 147 L83 147Z M98 140 L106 140 L105 147 L97 147Z" fill="#f4d77c" stroke="#715d31" stroke-width="1.2"/><path d="M51 149 L45 158 L51 164 L57 153 M109 149 L115 158 L109 164 L103 153" fill="#222a39" stroke="#111722" stroke-width="2"/>';
  if(k==='anime-mech')gear='<path d="M38 64 L25 56 L31 46 L45 52 M122 64 L135 56 L129 46 L115 52" fill="#347ba6" stroke="#58e9ff" stroke-width="3"/><circle cx="80" cy="78" r="27" fill="none" stroke="#58e9ff" stroke-width="2" stroke-dasharray="4 4"/>';
  const brows=(k==='anime-sasuke'||k==='anime-titan')?'<path d="M47 62 L72 68 M88 68 L113 62" stroke="#302326" stroke-width="5" stroke-linecap="round"/>':'';
  return '<svg class="creature-anime-art anime-'+k.replace('anime-','')+'" viewBox="0 0 160 194" role="img" aria-label="'+escapeHtml(c.name)+'" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="skin-'+k+'" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff0dc" stop-opacity=".6"/><stop offset="1" stop-color="'+S+'"/></linearGradient><linearGradient id="cloth-'+k+'" x1="0" y1="0" x2="0.9" y2="1"><stop stop-color="'+T+'"/><stop offset=".45" stop-color="'+C+'"/><stop offset="1" stop-color="'+D+'"/></linearGradient><filter id="shadow-'+k+'" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#121a2d" flood-opacity=".24"/></filter></defs><ellipse cx="80" cy="188" rx="43" ry="5" fill="#101b3230"/><g filter="url(#shadow-'+k+')">'+body+'<path d="M47 124 L37 151 L47 157 L61 133 M113 124 L123 151 L113 157 L99 133" fill="url(#cloth-'+k+')" stroke="'+D+'" stroke-width="3"/>'+gear+'<path d="M44 55 Q40 32 58 23 Q80 10 102 23 Q120 32 116 55 L112 94 Q105 116 80 120 Q55 116 48 94Z" fill="url(#skin-'+k+')" stroke="'+D+'" stroke-width="2.5"/>'+face+brows+hair[k]+'<path d="M48 85 Q55 82 62 85 M98 85 Q105 82 112 85" stroke="#c88776" stroke-width="2" fill="none" opacity=".7"/>'+mouth+(k==='anime-luffy'?'<path d="M47 94 Q80 103 113 94" fill="none" stroke="#a45d50" stroke-width="2"/>':'')+(k==='anime-naruto'?'<path d="M49 82 L57 80 M49 89 L57 87 M103 80 L111 82 M103 87 L111 89" stroke="#b47a61" stroke-width="2.5"/>':'')+(k==='anime-batman'?'<path d="M43 55 L53 31 L68 43 L80 22 L92 43 L107 31 L117 55 L111 75 L103 66 L92 71 L88 77 L72 77 L68 71 L57 66 L49 75Z" fill="#202735" stroke="#101521" stroke-width="3" stroke-linejoin="round"/><path d="M49 65 L72 65 L67 71 L51 72Z M88 65 L111 65 L109 72 L93 71Z" fill="#f0f5ff" stroke="#aab9cd" stroke-width="1.5"/><path d="M72 76 L80 81 L88 76" fill="none" stroke="#0e1420" stroke-width="3"/><path d="M56 87 L72 91 M88 91 L104 87" stroke="#8e9aab" stroke-width="2" opacity=".8"/>':'')+(k==='anime-titan'?'<path d="M49 102 L63 115 M111 102 L97 115" stroke="#ff9270" stroke-width="4"/>':'')+'</g></svg>';
 }
 const coat=['#dcecff','#4b77ca','#f0f4ff','#263d71'][outfit%4]||c.coat;
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
 const xp=tasks*25; // الخبرة من المهام الدراسية المكتملة فقط.
 if(xp!==data.xp){data.xp=xp;data.coins=Math.max(data.coins,Math.floor(xp/10));if(data.xp>=700)data.secret=true;save();renderBuddy();}
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
function showHabitatSubpage(type){const sub=$('#habitatSubpage');sub.hidden=false;if(type==='interior'){sub.innerHTML='<div class="anime-room-heading"><span class="anime-room-kicker">COMPANION HOME · 3D ROOM</span><h3>🏠 غرفة '+escapeHtml(companionName(chosen()))+'</h3><p>عالم أنمي دافئ بعمق ثلاثي الأبعاد يتطور مع مستواك.</p></div><div class="habitat-interior anime-3d-room level-interior-'+stage()+'"><div class="room-back-wall"><div class="room-window-3d"><span class="window-sky"><i class="pixel-star"></i><i class="pixel-cloud-mini"></i><i class="pixel-star"></i></span><span class="window-horizon"></span><span class="window-hills"></span></div><div class="room-wall-poster"><span class="pixel-emblem">✦</span><small>LEVEL<br>UP!</small></div><div class="room-shelf-3d"><i class="pixel-book book-a"></i><i class="pixel-book book-b"></i><i class="pixel-plant"></i><i class="pixel-trophy"></i></div><div class="room-wall-light"></div></div><div class="room-side-wall"></div><div class="room-floor-3d"><div class="room-floor-grid"></div><div class="room-rug-3d"></div><div class="room-bed-3d"><div class="bed-headboard"></div><div class="bed-pillow"></div><div class="bed-blanket"></div><div class="bed-foot"></div></div><div class="room-nightstand"><span class="pixel-book book-night"></span><i></i></div><div class="room-lamp-3d"><i></i><b></b><span></span></div><div class="room-plant-3d"><i class="pixel-plant"></i><b></b></div><div class="room-pet-3d">'+art(chosen(),stage(),data.outfit)+'</div><div class="room-decor-3d">'+(data.roomItems?Array(Math.min(8,data.roomItems)).fill('<span class="pixel-plant"></span>').join(''):'')+'</div></div><div class="room-level-plaque">✦ '+['بداية بسيطة','كوخ دافئ','جناح أنيق','جناح أسطوري'][stage()]+' ✦</div></div><p class="room-status">🪴 قطع الديكور: '+data.roomItems+' <span>🪙 رصيدك: '+data.coins+'</span></p><button type="button" id="habitatDecorBuy">🪴 أضف ديكور (3 عملات)</button><button type="button" id="habitatCityBack">العودة إلى البيت</button>';sub.querySelector('#habitatDecorBuy').addEventListener('click',()=>{if(data.coins<3){bubble('تحتاج 3 عملات لشراء الديكور.');return}data.coins-=3;data.roomItems++;save();renderHabitat();refreshPanel();showHabitatSubpage('interior')});sub.querySelector('#habitatCityBack').addEventListener('click',()=>sub.hidden=true);return;}else{sub.innerHTML='<h3>🛍️ متجر الرفيق</h3><p>رصيدك: 🪙 '+data.coins+' عملة</p><div class="habitat-shop-grid"><button type="button" data-buy="decor"><span class="pixel-plant"></span> ديكور البيت <strong>3 عملات</strong></button><button type="button" data-buy="outfit"><span class="pixel-shirt"></span> زي جديد <strong>3 عملات</strong></button></div><p class="habitat-shop-note">البيت يتحسن مع مستوياتك؛ يمكنك شراء اللمسات الإضافية من هنا.</p><button type="button" id="habitatShopBack">العودة إلى البيت</button>';}sub.querySelectorAll('#habitatCityBack,#habitatShopBack').forEach(b=>b.addEventListener('click',()=>{sub.hidden=true}));sub.querySelectorAll('[data-buy]').forEach(b=>b.addEventListener('click',()=>{const item=b.dataset.buy,cost=3;if(data.coins<cost){bubble('تحتاج '+cost+' عملات لإتمام الشراء.');return}data.coins-=cost;if(item==='decor')data.roomItems++;if(item==='outfit')data.outfit=(data.outfit+1)%4;save();renderHabitat();refreshPanel();showHabitatSubpage(type);bubble('تم الشراء! شكراً لك.');}));}
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
 const panel=document.createElement('section');panel.id='companionPanel';panel.hidden=true;panel.setAttribute('aria-label','لوحة الرفيق');panel.innerHTML='<div class="companion-panel-head"><div style="display:flex;align-items:center;gap:8px"><div id="companionPanelArt" style="width:58px;height:66px"></div><div><h3 id="companionPanelName">رفيقي</h3><div id="companionRank" style="font-size:12px;color:#687793"></div></div></div><button class="companion-x" id="companionClose" type="button" aria-label="إغلاق">✕</button></div><div class="companion-meter"><span id="companionPanelXp"></span></div><div id="companionStage" class="companion-stage"></div><div class="companion-stats"><div class="companion-stat">مهام مكتملة<strong id="companionTaskStat">0/0</strong></div><div class="companion-stat">عملات<strong id="companionCoinStat">0</strong></div><div class="companion-stat">جلسات تركيز<strong id="companionSessionStat">0</strong></div></div><p class="companion-message" id="companionRoomNote">غرفتك تنتظرك.</p><p class="companion-message" id="companionSecret">أكمل إنجازاتك لاكتشاف التحولات النادرة.</p><div class="companion-panel-actions"><button id="companionTalk" type="button">💬 شجعني</button><button id="companionOutfit" type="button">👕 تغيير الزي (3 عملات)</button><button id="companionSwitch" type="button">🦊 تبديل الرفيق</button><button id="companionHouse" type="button">🏡 بيت الرفيق</button><button id="companionRoom" type="button">🪴 ديكور الغرفة</button><button id="companionAchievements" type="button">🏆 الإنجازات</button><button id="companionDailyMission" type="button">🎯 مهمة اليوم</button><button id="companionSocialOpen" type="button">👥 الأصدقاء</button></div><div id="companionExtra" class="companion-mini" aria-live="polite"></div>';
 const overlay=document.createElement('div');overlay.id='companionOverlay';overlay.hidden=true;overlay.innerHTML='<section class="companion-card" dir="rtl"><button class="companion-skip" id="companionSkip" type="button">تخطي المشهد</button><p class="companion-kicker">دليل الطالب · رحلتك الدراسية</p><h2 id="companionIntroTitle">اختر رفيق رحلتك</h2><p id="companionIntroCopy">رحلتك الدراسية تبدأ الآن.</p><div class="companion-heroes companion-heroes-all" id="companionChoose"></div><div id="companionWelcome" hidden><div style="width:140px;height:150px;margin:0 auto" id="companionWelcomeArt"></div></div><button class="companion-primary" id="companionBegin" type="button">ابدأ الرحلة ←</button><button class="companion-secondary" id="companionReturn" type="button" hidden>متابعة الدراسة</button><div class="companion-stage">الرفيق يتطور مع إنجازاتك · حفظ محلي في هذه النسخة</div></section>';
 document.body.append(dock,panel,overlay);
 const habitat=document.createElement('section');habitat.id='companionHabitat';habitat.hidden=true;habitat.dir='rtl';habitat.innerHTML='<header class="habitat-top"><button type="button" id="habitatBack">← رجوع</button><div class="habitat-title"><strong id="habitatTitle">بيت الرفيق</strong><small id="habitatLevel"></small></div><div class="habitat-wallet">🪙 <span id="habitatCoins">0</span></div></header><div id="habitatScene" class="habitat-scene"><div id="habitatSky" class="habitat-sky"></div><div id="habitatHome" class="habitat-home"></div><div id="habitatPet" class="habitat-pet"></div><div class="habitat-ground"></div></div><div class="habitat-bottom"><button type="button" id="habitatInterior">🛋️ داخل البيت</button><button type="button" id="habitatShop">🛍️ المتجر</button><button type="button" id="habitatCompanionMenu">🐾 قائمة الرفيق</button></div><div id="habitatSubpage" class="habitat-subpage" hidden></div>';document.body.append(habitat);
 $('#companionChoose').innerHTML=Object.keys(COMPANIONS).map(key=>'<button class="companion-hero '+(key===chosen()?'selected':'')+'" type="button" data-companion-choice="'+key+'" aria-pressed="'+(key===chosen())+'"><span>'+art(key,0,0)+'</span><strong>'+COMPANIONS[key].name+'</strong><small>'+({medicine:'المثابرة والدقة',economics:'الذكاء والتخطيط',robot:'رفيق تقني',lina:'رفيقة المذاكرة',kai:'طاقة وموسيقى',mimi:'لطافة ومرح',zayd:'تفكير وتركيز',sara:'تشجيع وود',adam:'شجاعة وثبات',eren:'إرادة لا تستسلم',armin:'ذكاء وشجاعة',mikasa:'قوة ووفاء'}[key]||'رفيق الدراسة')+'</small></button>').join('');
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
 $('#companionOutfit').addEventListener('click',()=>{if(data.coins<3){bubble('تحتاج 3 عملات لتغيير الزي. أكمل مهمة دراسية أولًا.');return}data.coins-=3;data.outfit=(data.outfit+1)%4;save();renderBuddy();refreshPanel();bubble('زي جديد! أنفقت 3 عملات من رصيدك.')});
 $('#companionSwitch').textContent='✨ رفيق مختلف';
 $('#companionSwitch').addEventListener('click',()=>{const keys=Object.keys(COMPANIONS),i=keys.indexOf(chosen());data.chosen=keys[(i+1)%keys.length];selected=data.chosen;save();renderBuddy();refreshPanel();$('#companionSwitch').textContent='✨ التالي: '+companionName(keys[(keys.indexOf(data.chosen)+1)%keys.length]);bubble('تم اختيار '+companionName(data.chosen)+'! لكل رفيق شكل ولون وشخصية مختلفة.')});
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
 const moods=['happy','curious','excited'];let moodIndex=0;setInterval(()=>{if(document.hidden)return;moodIndex=(moodIndex+1)%moods.length;data.mood=moods[moodIndex];renderBuddy();if(!$('#companionHabitat')?.hidden)$('#habitatPet').innerHTML=art(chosen(),stage(),data.outfit);if(!$('#companionOverlay')?.hidden)$('#companionChoose').querySelectorAll('[data-companion-choice]').forEach(b=>{const k=b.dataset.companionChoice;b.querySelector('span').innerHTML=art(k,0,0)});},3200);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();