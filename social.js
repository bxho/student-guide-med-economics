/* دليل الطالب: رسائل خاصة وملفات شخصية ومنشورات إنجاز للأصدقاء فقط. */
(()=>{'use strict';
const $=s=>document.querySelector(s),$$=s=>Array.from(document.querySelectorAll(s));
const state={client:null,user:null,profile:null,targetId:null,channel:'direct',channelSub:null};
const safe=(s)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const say=(s)=>{const e=$('#socialDirectStatus');if(e)e.textContent=s};
const petName=()=>state.profile?.companion_name||'رفيقي';
const petColor=()=>state.profile?.companion_style?.color||'#2fbd9a';
const ensureProfile=async()=>{if(!state.client||!state.user)return;let {data,error}=await state.client.from('student_profiles').select('*').eq('user_id',state.user.id).maybeSingle();if(error)throw error;if(!data){const seed={user_id:state.user.id,username:(state.user.id||'').replace(/-/g,'').slice(0,8).toLowerCase(),display_name:(state.user.user_metadata?.display_name||(state.user.email||'طالب').split('@')[0]).slice(0,40)||'طالب',avatar_url:null,companion_name:'رفيقي',companion_style:{color:'#2fbd9a',accessory:'none',outfit:'classic'}};const r=await state.client.from('student_profiles').upsert(seed).select().single();if(r.error)throw r.error;data=r.data}state.profile=data;applyCompanionCustomization();renderProfileForm()};
const applyCompanionCustomization=()=>{if(!state.profile)return;try{const key='studentGuideCompanion_v2',old=JSON.parse(localStorage.getItem(key)||'{}'),style=state.profile.companion_style||{},outfitMap={classic:0,sport:1,royal:2,space:3};old.customName=state.profile.companion_name||'رفيقي';old.outfit=outfitMap[style.outfit]??0;localStorage.setItem(key,JSON.stringify(old));const color=style.color||'#2fbd9a';document.documentElement.style.setProperty('--social-accent',color);const filters={'#2fbd9a':'hue-rotate(0deg) saturate(1)','#4385ff':'hue-rotate(165deg) saturate(1.25)','#b06cff':'hue-rotate(245deg) saturate(1.2)','#ff9d43':'hue-rotate(315deg) saturate(1.25)','#ff6699':'hue-rotate(285deg) saturate(1.15)'};document.documentElement.style.setProperty('--social-pet-filter',filters[color]||'hue-rotate(0deg)');window.dispatchEvent(new Event('student-guide-companion-customized'))}catch(e){console.warn('Companion customization could not be applied',e)}};
const renderProfileForm=()=>{
 if(!state.profile)return;
 $('#socialMyId').textContent=state.user.id;$('#socialUsername').value=state.profile.username||'';$('#socialDisplayName').value=state.profile.display_name||'طالب';
 $('#socialAvatarPreview').hidden=!state.profile.avatar_url;if(state.profile.avatar_url)$('#socialAvatarPreview').src=state.profile.avatar_url;
 $('#socialProfileHeroAvatar').hidden=!state.profile.avatar_url;$('#socialProfileHeroAvatar').src=state.profile.avatar_url||'';$('#socialProfileHeroFallback').hidden=!!state.profile.avatar_url;
 $('#socialProfileHeroName').textContent=state.profile.display_name||'ملفي الشخصي';$('#socialProfileHeroHandle').textContent='@'+(state.profile.username||'username');$('#socialProfileHeroBio').textContent=state.profile.bio||'أضف نبذة قصيرة تعرّف بها أصدقاءك عن نفسك.';
 $('#socialCompanionName').value=petName();$('#socialBio').value=state.profile.bio||'';$('#socialBioCount').textContent=String((state.profile.bio||'').length);
 $('#socialCompanionColor').value=petColor();$('#socialCompanionOutfit').value=state.profile.companion_style?.outfit||'classic';$('#socialCompanionAccessory').value=state.profile.companion_style?.accessory||'none';$('#socialCompanionSwatch').style.background=petColor();
};
const updateProfilePreview=()=>{
 const name=$('#socialDisplayName').value.trim()||'ملفي الشخصي',username=$('#socialUsername').value.trim()||'username',bio=$('#socialBio').value.trim();
 $('#socialProfileHeroName').textContent=name;$('#socialProfileHeroHandle').textContent='@'+username;$('#socialProfileHeroBio').textContent=bio||'أضف نبذة قصيرة تعرّف بها أصدقاءك عن نفسك.';
 $('#socialBioCount').textContent=String($('#socialBio').value.length);$('#socialCompanionSwatch').style.background=$('#socialCompanionColor').value;
};
['socialUsername','socialDisplayName','socialBio','socialCompanionColor'].forEach(id=>$('#'+id)?.addEventListener('input',updateProfilePreview));
$('#socialAvatarFile')?.addEventListener('change',()=>{const file=$('#socialAvatarFile').files?.[0];if(!file)return;const preview=$('#socialAvatarPreview'),hero=$('#socialProfileHeroAvatar'),fallback=$('#socialProfileHeroFallback');if(!/^image\/(png|jpeg|webp)$/.test(file.type)||file.size>3145728)return;const url=URL.createObjectURL(file);preview.src=url;preview.hidden=false;hero.src=url;hero.hidden=false;fallback.hidden=true;});

const loadProfiles=async ids=>{const uniq=[...new Set(ids.filter(Boolean))];if(!uniq.length)return{};const {data,error}=await state.client.from('student_profiles').select('user_id,username,display_name,avatar_url,companion_name,companion_style').in('user_id',uniq);if(error)throw error;return Object.fromEntries((data||[]).map(p=>[p.user_id,p]))};
const fmt=t=>new Date(t).toLocaleString('ar',{dateStyle:'short',timeStyle:'short'});

let friendsRenderVersion=0;
const renderFriends=async()=>{
 const box=$('#socialFriendsList');if(!box||!state.client||!state.user)return;
 const renderVersion=++friendsRenderVersion;
 box.innerHTML='<p class="note">جارٍ تحميل الأصدقاء…</p>';
 try{
  const {data:rows,error}=await state.client.from('student_friends').select('user_id,friend_id,status').eq('status','accepted').or('user_id.eq.'+state.user.id+',friend_id.eq.'+state.user.id);
  if(error)throw error;if(renderVersion!==friendsRenderVersion)return;
  const ids=[...new Set((rows||[]).map(r=>r.user_id===state.user.id?r.friend_id:r.user_id).filter(id=>id&&id!==state.user.id))];
  if(!ids.length){box.innerHTML='<p class="note">لا توجد صداقات مقبولة بعد. ابحث عن اسم مستخدم وأرسل طلب صداقة.</p>';return}
  const {data:profiles,error:pe}=await state.client.from('student_profiles').select('user_id,username,display_name,avatar_url').in('user_id',ids);
  if(pe)throw pe;if(renderVersion!==friendsRenderVersion)return;
  const uniqueProfiles=[...new Map((profiles||[]).map(p=>[p.user_id,p])).values()].filter(p=>ids.includes(p.user_id));
  box.innerHTML='';
  if(!uniqueProfiles.length){box.innerHTML='<p class="note">تعذر العثور على ملفات الأصدقاء.</p>';return}
  uniqueProfiles.forEach(p=>{
   const btn=document.createElement('div');btn.className='social-friend-card';btn.setAttribute('role','group');btn.setAttribute('aria-label','الصديق '+(p.display_name||p.username||''));
   const avatarLink=document.createElement('button');avatarLink.type='button';avatarLink.className='social-friend-avatar-button';avatarLink.title='عرض الملف الشخصي';avatarLink.setAttribute('aria-label','فتح الملف الشخصي لـ '+(p.display_name||p.username||'الصديق'));
   const img=p.avatar_url?document.createElement('img'):document.createElement('span');if(p.avatar_url){img.src=p.avatar_url;img.alt='';img.loading='lazy'}else{img.className='avatar-placeholder';img.textContent='👤'}avatarLink.append(img);avatarLink.addEventListener('click',event=>{event.stopPropagation();openFriendProfile(p.user_id)});
   const text=document.createElement('button');text.type='button';text.className='social-friend-main';text.setAttribute('aria-label','فتح محادثة '+(p.display_name||p.username||'الصديق'));
   const name=document.createElement('strong'),username=document.createElement('small');name.textContent=p.display_name||'طالب';username.textContent='@'+(p.username||'');text.append(name,username);text.addEventListener('click',()=>openFriendChat(p));
   const open=document.createElement('span');open.className='social-friend-action-label';open.textContent='مراسلة ←';btn.append(avatarLink,text,open);box.append(btn);
  });
 }catch(e){if(renderVersion===friendsRenderVersion)box.innerHTML='<p class="note">تعذر تحميل قائمة الأصدقاء: '+safe(e.message)+'</p>'}
};
let chatSwitchVersion=0;
let messageLoadVersion=0;
const openFriendChat=async p=>{
 if(!p?.user_id||!state.client||!state.user)return;
 const switchVersion=++chatSwitchVersion;
 const requestedId=p.user_id;
 try{
  const {data:links,error}=await state.client.from('student_friends').select('status').eq('status','accepted').or('and(user_id.eq.'+state.user.id+',friend_id.eq.'+requestedId+'),and(user_id.eq.'+requestedId+',friend_id.eq.'+state.user.id+')');
  if(switchVersion!==chatSwitchVersion)return;
  if(error)throw error;if(!links?.some(link=>link.status==='accepted')){say('المراسلة متاحة للأصدقاء المقبولين فقط.');return}
  state.targetId=requestedId;const target=$('#socialTargetId');if(target)target.value=p.username||'';
  const profile=$('#socialFriendProfile');if(profile)profile.hidden=true;
  showTab('direct');await updateChatHeader(requestedId);if(switchVersion!==chatSwitchVersion||state.targetId!==requestedId)return;
  await loadMessages('direct',requestedId);
  if(switchVersion===chatSwitchVersion&&state.targetId===requestedId){const input=$('#socialDirectInput');if(input)input.focus()}
 }catch(e){if(switchVersion===chatSwitchVersion)say('تعذر فتح المحادثة: '+safe(e.message))}
};
const openFriendProfile=async userId=>{
 const panel=$('#socialFriendProfile');if(!panel||!state.client||!state.user)return;
 try{
  const {data:links,error:le}=await state.client.from('student_friends').select('status').eq('status','accepted').or('and(user_id.eq.'+state.user.id+',friend_id.eq.'+userId+'),and(user_id.eq.'+userId+',friend_id.eq.'+state.user.id+')');if(le)throw le;
  if(!links?.length){say('الملف الشخصي متاح للأصدقاء المقبولين فقط.');return}
  const {data:p,error}=await state.client.from('student_profiles').select('user_id,username,display_name,avatar_url,bio,companion_name,companion_style').eq('user_id',userId).maybeSingle();if(error)throw error;if(!p){say('تعذر العثور على الملف الشخصي.');return}
  showTab('direct');panel.hidden=false;panel.innerHTML='';
  const head=document.createElement('div');head.className='social-friend-profile-head';
  const avatar=p.avatar_url?document.createElement('img'):document.createElement('div');if(p.avatar_url){avatar.src=p.avatar_url;avatar.alt=p.display_name||p.username}else{avatar.className='social-profile-avatar-placeholder';avatar.textContent='👤'}
  const info=document.createElement('div'),name=document.createElement('h3'),handle=document.createElement('p');name.textContent=p.display_name||'طالب';handle.textContent='@'+p.username;info.append(name,handle);head.append(avatar,info);panel.append(head);
  const bio=document.createElement('p');bio.className='social-profile-bio';bio.textContent=p.bio||'لم يضف نبذة بعد.';panel.append(bio);
  const companion=document.createElement('p');companion.className='note';companion.textContent='الرفيق: '+(p.companion_name||'رفيقي');panel.append(companion);
  const actions=document.createElement('div');actions.className='social-profile-actions';
  const chat=document.createElement('button');chat.type='button';chat.className='btn primary';chat.textContent='إرسال رسالة';chat.onclick=async()=>{panel.hidden=true;await openFriendChat(p)};
  const close=document.createElement('button');close.type='button';close.className='btn';close.textContent='إغلاق الملف';close.onclick=()=>panel.hidden=true;actions.append(chat,close);panel.append(actions);
  const title=document.createElement('h4');title.textContent='إنجازات هذا الصديق';panel.append(title);
  const {data:posts,error:pe}=await state.client.from('student_achievement_posts').select('id,title,description,created_at').eq('user_id',userId).order('created_at',{ascending:false}).limit(20);if(pe)throw pe;
  const list=document.createElement('div');list.className='social-achievement-feed';
  (posts||[]).forEach(post=>{const card=document.createElement('article');card.className='social-achievement-card';const t=document.createElement('h4'),d=document.createElement('p'),m=document.createElement('div');t.textContent='🏆 '+post.title;d.textContent=post.description||'';m.className='social-achievement-meta';m.textContent=fmt(post.created_at);card.append(t,d,m);list.append(card)});
  if(!posts?.length){const empty=document.createElement('p');empty.className='note';empty.textContent='لم يشارك هذا الصديق إنجازات بعد.';list.append(empty)}panel.append(list);
 }catch(e){say('تعذر فتح الملف الشخصي: '+safe(e.message))}
};
const renderFriendRequests=async()=>{
 const box=$('#socialFriendRequests');if(!box||!state.client||!state.user)return;
 try{const {data:rows,error}=await state.client.from('student_friends').select('user_id,friend_id,created_at,status').eq('friend_id',state.user.id).eq('status','pending').order('created_at',{ascending:false});if(error)throw error;box.innerHTML='';
 if(!rows?.length){box.innerHTML='<p class="note">لا توجد طلبات صداقة جديدة.</p>';return}
 const {data:directory,error:de}=await state.client.from('student_profile_directory').select('user_id,username,display_name,avatar_url').in('user_id',rows.map(r=>r.user_id));if(de)throw de;const profiles=Object.fromEntries((directory||[]).map(p=>[p.user_id,p]));
 rows.forEach(r=>{const p=profiles[r.user_id]||{},card=document.createElement('article');card.className='social-request-card';const info=document.createElement('div'),name=document.createElement('strong'),handle=document.createElement('small');name.textContent=p.display_name||'طالب';handle.textContent='@'+(p.username||'');info.append(name,handle);const actions=document.createElement('div');actions.className='social-request-actions';
 const accept=document.createElement('button');accept.type='button';accept.className='btn primary small';accept.textContent='قبول';accept.onclick=async()=>{accept.disabled=true;const {error}=await state.client.from('student_friends').update({status:'accepted',responded_at:new Date().toISOString()}).eq('user_id',r.user_id).eq('friend_id',state.user.id).eq('status','pending');if(error){accept.disabled=false;say('تعذر قبول الطلب: '+error.message);return}say('تم قبول طلب الصداقة.');await renderFriends();await renderFriendRequests();await renderSentFriendRequests();await loadNotifications()};
 const reject=document.createElement('button');reject.type='button';reject.className='btn small';reject.textContent='رفض';reject.onclick=async()=>{reject.disabled=true;const {error}=await state.client.from('student_friends').delete().eq('user_id',r.user_id).eq('friend_id',state.user.id).eq('status','pending');if(error){reject.disabled=false;say('تعذر رفض الطلب: '+error.message);return}say('تم رفض طلب الصداقة.');await renderFriendRequests();await loadNotifications()};actions.append(accept,reject);card.append(info,actions);box.append(card)})}
 catch(e){box.innerHTML='<p class="note">تعذر تحميل طلبات الصداقة: '+safe(e.message)+'</p>'}
};
const renderSentFriendRequests=async()=>{
 const box=$('#socialSentRequests');if(!box||!state.client||!state.user)return;
 try{const {data:rows,error}=await state.client.from('student_friends').select('user_id,friend_id,created_at,status').eq('user_id',state.user.id).eq('status','pending').order('created_at',{ascending:false});if(error)throw error;box.innerHTML='';
 if(!rows?.length){box.innerHTML='<p class="note">لا توجد طلبات معلّقة أرسلتها.</p>';return}
 const {data:directory,error:de}=await state.client.from('student_profile_directory').select('user_id,username,display_name').in('user_id',rows.map(r=>r.friend_id));if(de)throw de;const profiles=Object.fromEntries((directory||[]).map(p=>[p.user_id,p]));
 rows.forEach(r=>{const p=profiles[r.friend_id]||{},card=document.createElement('article');card.className='social-request-card';const info=document.createElement('div'),name=document.createElement('strong'),handle=document.createElement('small');name.textContent=p.display_name||'طالب';handle.textContent='@'+(p.username||'');info.append(name,handle);const cancel=document.createElement('button');cancel.type='button';cancel.className='btn small';cancel.textContent='إلغاء الطلب';cancel.onclick=async()=>{cancel.disabled=true;const {error}=await state.client.from('student_friends').delete().eq('user_id',state.user.id).eq('friend_id',r.friend_id).eq('status','pending');if(error){cancel.disabled=false;say('تعذر إلغاء الطلب: '+error.message);return}say('تم إلغاء طلب الصداقة.');await renderSentFriendRequests();await loadNotifications()};card.append(info,cancel);box.append(card)})}
 catch(e){box.innerHTML='<p class="note">تعذر تحميل الطلبات المرسلة: '+safe(e.message)+'</p>'}
};
const loadNotifications=async()=>{
 const box=$('#socialNotifications'),badge=$('#socialNotificationCount'),bellBadge=$('#notificationBellCount');if(!state.client||!state.user)return;
 try{const {data,error}=await state.client.from('student_notifications').select('id,actor_id,kind,reference_id,created_at,read_at').order('created_at',{ascending:false}).limit(30);if(error)throw error;const rows=data||[],unread=rows.filter(n=>!n.read_at).length;if(badge){badge.textContent=String(unread);badge.hidden=!unread}if(bellBadge){bellBadge.textContent=String(unread);bellBadge.hidden=!unread}if(!box)return;box.innerHTML='';
 if(!rows.length){box.innerHTML='<p class="note">لا توجد إشعارات بعد.</p>';return}
 const {data:directory,error:de}=await state.client.from('student_profile_directory').select('user_id,username,display_name,avatar_url').in('user_id',rows.map(n=>n.actor_id).filter(Boolean));if(de)throw de;const profiles=Object.fromEntries((directory||[]).map(p=>[p.user_id,p]));
 rows.forEach(n=>{const p=profiles[n.actor_id]||{},item=document.createElement('button');item.type='button';item.className='social-notification'+(!n.read_at?' unread':'');const title=document.createElement('strong'),meta=document.createElement('small');title.textContent=n.kind==='friend_request'?(n.read_at?'طلب صداقة':'طلب صداقة جديد'):n.kind==='friend_accepted'?(n.read_at?'تم قبول الصداقة':'تم قبول طلبك'):(n.read_at?'رسالة':'رسالة جديدة');meta.textContent=(p.display_name||p.username||'طالب')+' · '+fmt(n.created_at);item.append(title,meta);item.onclick=async()=>{$('#notificationDropdown')?.setAttribute('hidden','');$('#notificationBell')?.setAttribute('aria-expanded','false');document.querySelector('[data-view="community"]')?.click();if(!n.read_at)await state.client.from('student_notifications').update({read_at:new Date().toISOString()}).eq('id',n.id);if(n.kind==='friend_request'){showTab('direct');await renderFriendRequests()}else if(n.actor_id){const {data:links}=await state.client.from('student_friends').select('status').eq('status','accepted').or('and(user_id.eq.'+state.user.id+',friend_id.eq.'+n.actor_id+'),and(user_id.eq.'+n.actor_id+',friend_id.eq.'+state.user.id+')');if(links?.length){state.targetId=n.actor_id;$('#socialTargetId').value=p.username||'';$('#socialDirectInput').disabled=false;$('#socialDirectForm').querySelector('button').disabled=false;showTab('direct');await loadMessages('direct')}else say('لا يمكن فتح هذه المحادثة لأن الصداقة غير مقبولة.')}await loadNotifications()};box.append(item)})}
 catch(e){if(box)box.innerHTML='<p class="note">تعذر تحميل الإشعارات: '+safe(e.message)+'</p>';console.warn('Social notifications:',e)}
};
const addFriendByUsername=async username=>{
 username=String(username||'').trim().replace(/^@/,'').toLowerCase();if(!/^[a-z0-9_]{3,24}$/.test(username)){say('اكتب اسم مستخدم من 3 إلى 24 حرفًا أو رقمًا أو شرطة سفلية.');return}
 try{const {data:p,error}=await state.client.from('student_profile_directory').select('user_id,username,display_name').eq('username',username).maybeSingle();if(error)throw error;if(!p){say('لم أجد مستخدمًا بهذا الاسم.');return}if(p.user_id===state.user.id){say('لا يمكنك إضافة حسابك لنفسك.');return}
 const {data:existing,error:ee}=await state.client.from('student_friends').select('user_id,friend_id,status').or('and(user_id.eq.'+state.user.id+',friend_id.eq.'+p.user_id+'),and(user_id.eq.'+p.user_id+',friend_id.eq.'+state.user.id+')');if(ee)throw ee;
 if((existing||[]).some(r=>r.status==='accepted')){say('أنتم أصدقاء بالفعل.');return}if((existing||[]).some(r=>r.user_id===p.user_id&&r.friend_id===state.user.id&&r.status==='pending')){say('هذا الشخص أرسل لك طلب صداقة بالفعل؛ يمكنك قبوله من طلبات الصداقة.');await renderFriendRequests();return}if((existing||[]).some(r=>r.user_id===state.user.id&&r.friend_id===p.user_id&&r.status==='pending')){say('طلب الصداقة أُرسل بالفعل وينتظر الرد.');return}
 const {error:friendError}=await state.client.from('student_friends').insert({user_id:state.user.id,friend_id:p.user_id,status:'pending'});if(friendError){if(friendError.code==='23505'){say('يوجد طلب صداقة سابق بينكما.');return}throw friendError}$('#socialFriendUsername').value='';say('أُرسل طلب صداقة إلى @'+p.username+'. ستظهر المحادثة بعد القبول.');await renderFriends();await renderFriendRequests();await loadNotifications()}
 catch(e){say('تعذّر إرسال طلب الصداقة: '+(e.message||'خطأ غير معروف'))}
};

const drawMessages=async(container,rows)=>{
 if(!container)return;
 container.innerHTML='';
 if(!rows?.length){container.innerHTML='<div class="social-chat-empty"><div>✉</div><strong>لا توجد رسائل بعد</strong><p>ابدأ المحادثة برسالة بسيطة.</p></div>';return}
 const profiles=await loadProfiles(rows.flatMap(m=>[m.sender_id,m.recipient_id]));
 rows.forEach(m=>{
  const p=profiles[m.sender_id]||{},name=p.display_name||'طالب',color=p.companion_style?.color||'#2fbd9a';
  const el=document.createElement('article');el.className='social-message'+(m.sender_id===state.user.id?' mine':'');
  const av=document.createElement(p.avatar_url?'img':'div');av.className='social-pet-avatar'+(p.avatar_url?' social-user-photo':'');
  if(p.avatar_url){av.src=p.avatar_url;av.alt=name;av.loading='lazy'}else{av.style.setProperty('--pet-color',color);av.textContent=(name.trim().slice(0,1)||'👤')}
  const body=document.createElement('div');body.className='social-msg-content';
  const meta=document.createElement('div');meta.className='social-msg-meta';
  const cname=document.createElement('span');cname.className='social-msg-name';cname.textContent=name;
  const time=document.createElement('time');time.dateTime=m.created_at;time.textContent=fmt(m.created_at);
  meta.append(cname,time);
  const text=document.createElement('div');text.className='social-msg-body';text.textContent=m.body;
  body.append(meta,text);el.append(av,body);container.append(el);
 });
 container.scrollTop=container.scrollHeight;
};

const updateChatHeader=async(targetId=state.targetId)=>{
 const avatar=$('#socialChatAvatar'),name=$('#socialChatName'),handle=$('#socialChatHandle'),input=$('#socialDirectInput'),send=$('#socialDirectForm button');
 if(!targetId||!state.client){if(avatar)avatar.textContent='✉';if(name)name.textContent='اختر صديقًا للمحادثة';if(handle)handle.textContent='رسائلك الخاصة تظهر هنا';if(input)input.disabled=true;if(send)send.disabled=true;return}
 if(name)name.textContent='جارٍ فتح المحادثة…';
 const profiles=await loadProfiles([targetId]);if(state.targetId!==targetId)return;const p=profiles[targetId]||{};
 if(name)name.textContent=p.display_name||'صديق';if(handle)handle.textContent='@'+(p.username||'')+' · محادثة خاصة';
 if(avatar){avatar.innerHTML='';if(p.avatar_url){const img=document.createElement('img');img.src=p.avatar_url;img.alt=p.display_name||p.username||'صديق';avatar.append(img)}else avatar.textContent=(p.display_name||p.username||'ص').trim().slice(0,1)}
 if(input)input.disabled=false;if(send)send.disabled=false;
};
const getMessages=async(channel,targetId=state.targetId)=>{if(channel!=='direct'||!targetId)return[];const q=state.client.from('student_social_messages').select('*').eq('channel','direct').or('and(sender_id.eq.'+state.user.id+',recipient_id.eq.'+targetId+'),and(sender_id.eq.'+targetId+',recipient_id.eq.'+state.user.id+')').order('created_at',{ascending:true}).limit(100);const {data,error}=await q;if(error)throw error;return data||[]};
const loadMessages=async(channel,targetId=state.targetId)=>{
 if(channel!=='direct'||!targetId)return;const loadVersion=++messageLoadVersion;
 try{
  await updateChatHeader(targetId);if(state.targetId!==targetId||loadVersion!==messageLoadVersion)return;
  const rows=await getMessages('direct',targetId);if(state.targetId!==targetId||loadVersion!==messageLoadVersion)return;
  const unread=rows.filter(m=>m.recipient_id===state.user.id&&!m.read_at).map(m=>m.id);
  if(unread.length){const {error}=await state.client.from('student_social_messages').update({read_at:new Date().toISOString()}).in('id',unread);if(error)console.warn('Could not mark messages read:',error)}
  await state.client.from('student_notifications').update({read_at:new Date().toISOString()}).eq('user_id',state.user.id).eq('actor_id',targetId).eq('kind','message').is('read_at',null);
  if(state.targetId!==targetId||loadVersion!==messageLoadVersion)return;
  await drawMessages($('#socialDirectMessages'),rows);if(state.targetId!==targetId||loadVersion!==messageLoadVersion)return;
  await loadNotifications();
 }catch(e){if(state.targetId===targetId&&loadVersion===messageLoadVersion)say('تعذر تحميل الرسائل: '+e.message)}
};
const sendMessage=async(channel,body)=>{if(channel!=='direct')throw Error('المتاح حاليًا هو المحادثات الخاصة فقط.');const text=String(body||'').trim();if(!text)return;if(!state.targetId||state.targetId===state.user.id)throw Error('اختر صديقًا لبدء المحادثة.');const row={sender_id:state.user.id,channel:'direct',body:text,companion_name:petName(),recipient_id:state.targetId};const {error}=await state.client.from('student_social_messages').insert(row);if(error)throw error;await loadMessages('direct');say('✅ تم إرسال رسالتك بنجاح. ستصل إشعارات الرسائل الجديدة للطرف الآخر إذا سمح بالإشعارات وكان التطبيق بالخلفية.');};
const notifyIncomingMessage=m=>{if(!m||m.recipient_id!==state.user?.id||m.sender_id===state.user?.id||!document.hidden||!('Notification' in window)||Notification.permission!=='granted')return;loadProfiles([m.sender_id]).then(profiles=>{const p=profiles[m.sender_id]||{};const n=new Notification('رسالة جديدة من '+(p.display_name||p.companion_name||'صديق'),{body:String(m.body||'').slice(0,180),tag:'student-guide-message-'+m.id});n.onclick=async()=>{window.focus();const profiles=await loadProfiles([m.sender_id]);const p=profiles[m.sender_id]||{};state.targetId=m.sender_id;const id=$('#socialTargetId');if(id)id.value=p.username||'';showTab('direct');loadMessages('direct');n.close()}}).catch(e=>console.warn('تعذر عرض إشعار الرسالة:',e))};
const showTab=tab=>{$$('.social-panel').forEach(p=>p.hidden=true);const p=$('#social-'+tab);if(p)p.hidden=false;$$('[data-social-tab]').forEach(b=>b.classList.toggle('primary',b.dataset.socialTab===tab));state.channel=tab;if(tab==='direct'){renderFriends();renderFriendRequests();renderSentFriendRequests();loadNotifications()}if(tab==='profile')ensureProfile().catch(e=>say(e.message));if(tab==='feed')loadAchievements()};
const loadAchievements=async()=>{const box=$('#socialAchievementFeed');box.innerHTML='<p class="note">جارٍ تحميل الإنجازات…</p>';try{const {data,error}=await state.client.from('student_achievement_posts').select('*').order('created_at',{ascending:false}).limit(100);if(error)throw error;const profiles=await loadProfiles((data||[]).map(p=>p.user_id));box.innerHTML='';(data||[]).forEach(p=>{const prof=profiles[p.user_id]||{};const card=document.createElement('article');card.className='social-achievement-card';const title=document.createElement('h4');title.textContent='🏆 '+p.title;const desc=document.createElement('p');desc.textContent=p.description||'';const meta=document.createElement('div');meta.className='social-achievement-meta';meta.textContent=(prof.display_name||'طالب')+' · '+fmt(p.created_at);card.append(title,desc,meta);if(p.user_id===state.user.id){const del=document.createElement('button');del.className='btn small';del.textContent='حذف منشوري';del.onclick=async()=>{if(!confirm('حذف هذا الإنجاز؟'))return;const r=await state.client.from('student_achievement_posts').delete().eq('id',p.id);if(r.error)alert(r.error.message);else loadAchievements()};card.append(del)}box.append(card)});if(!data?.length)box.innerHTML='<p class="note">لا توجد إنجازات منشورة. شارك أول إنجاز عندما تكون مستعدًا.</p>'}catch(e){box.innerHTML='<p class="note">تعذر تحميل الإنجازات: '+safe(e.message)+'</p>'}};
const setup=async()=>{if(state.channelSub&&state.client){try{await state.client.removeChannel(state.channelSub)}catch(_){}}state.channelSub=null;const getClient=window.studentGuideGetSupabaseClient,getUser=window.studentGuideGetUser;state.client=getClient?.();state.user=getUser?.();if(!state.client||!state.user){$$('[data-social-tab]').forEach(b=>b.disabled=true);['socialAddFriend','socialDirectFind','socialDirectForm','socialProfileForm','socialAchievementForm'].forEach(id=>{const e=$('#'+id);if(e)e.querySelectorAll('button,input,textarea,select').forEach(x=>x.disabled=true)});say('سجّل الدخول لاستخدام الأصدقاء والمحادثات.');return}$$('[data-social-tab]').forEach(b=>b.disabled=false);['socialAddFriend','socialDirectFind','socialDirectForm','socialProfileForm','socialAchievementForm'].forEach(id=>{const e=$('#'+id);if(e)e.querySelectorAll('button,input,textarea,select').forEach(x=>x.disabled=false)});$('#socialDirectInput').disabled=!state.targetId;$('#socialDirectForm').querySelector('button').disabled=!state.targetId;await ensureProfile();await updateChatHeader();await renderFriends();await renderFriendRequests();await renderSentFriendRequests();await loadNotifications();if(state.targetId)await loadMessages('direct');if(state.client.channel){state.channelSub=state.client.channel('student-friends-live').on('postgres_changes',{event:'*',schema:'public',table:'student_social_messages'},payload=>{const m=payload.new||payload.old;if(m?.channel==='direct'){if(state.channel==='direct'&&state.targetId&&[m.sender_id,m.recipient_id].includes(state.targetId))loadMessages('direct');if(payload.eventType==='INSERT')notifyIncomingMessage(m)}}).on('postgres_changes',{event:'*',schema:'public',table:'student_friends'},()=>{renderFriends();renderFriendRequests();renderSentFriendRequests();loadNotifications()}).on('postgres_changes',{event:'INSERT',schema:'public',table:'student_notifications',filter:'user_id=eq.'+state.user.id},()=>loadNotifications()).on('postgres_changes',{event:'INSERT',schema:'public',table:'student_achievement_posts'},()=>{if(state.channel==='feed')loadAchievements()}).subscribe()}};

const requestMessageNotificationsSafe=()=>{try{if('Notification'in window&&Notification.permission==='default')Promise.resolve(Notification.requestPermission()).catch(()=>{})}catch(_){}};
// Capture these controls before any other handler so a failed initializer cannot reload the entire app.
document.addEventListener('click',event=>{
 const tab=event.target.closest?.('[data-social-tab]');
 if(!tab||!$('#view-community'))return;
 event.preventDefault();event.stopImmediatePropagation();
 if(tab.dataset.socialTab==='direct')requestMessageNotificationsSafe();
 showTab(tab.dataset.socialTab);
},true);
// The add-friend and direct-find forms each have their own submit handlers below.
// Do not register a second capture-phase submit handler; it caused duplicate submissions.

document.addEventListener('DOMContentLoaded',()=>{if(!$('#view-community'))return;
const requestMessageNotifications=()=>{if(!('Notification' in window)||Notification.permission!=='default')return;try{const permission=Notification.requestPermission();if(permission&&typeof permission.catch==='function')permission.catch(()=>{})}catch(_){}};document.querySelectorAll('[data-social-tab]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.socialTab==='direct')requestMessageNotifications();showTab(b.dataset.socialTab)}));$('#notificationBell')?.addEventListener('click',async()=>{const bell=$('#notificationBell'),drop=$('#notificationDropdown');if(!bell||!drop)return;const opening=drop.hasAttribute('hidden');if(opening){drop.removeAttribute('hidden');bell.setAttribute('aria-expanded','true');await loadNotifications()}else{drop.setAttribute('hidden','');bell.setAttribute('aria-expanded','false')}});
document.addEventListener('click',event=>{const center=$('.notification-center'),drop=$('#notificationDropdown'),bell=$('#notificationBell');if(center&&drop&&!center.contains(event.target)){drop.setAttribute('hidden','');bell?.setAttribute('aria-expanded','false')}});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){const drop=$('#notificationDropdown');drop?.setAttribute('hidden','');$('#notificationBell')?.setAttribute('aria-expanded','false')}});
$('#socialRefreshRequests')?.addEventListener('click',()=>renderFriendRequests());$('#socialRefreshNotifications')?.addEventListener('click',()=>loadNotifications());
$('#socialDirectFind').onsubmit=async e=>{e.preventDefault();const username=$('#socialTargetId').value.trim().replace(/^@/,'').toLowerCase();if(!/^[a-z0-9_]{3,24}$/.test(username)){say('اكتب اسم المستخدم فقط.');return}const {data:p,error}=await state.client.from('student_profile_directory').select('user_id,username').eq('username',username).maybeSingle();if(error)throw error;if(!p){say('لم أجد حسابًا بهذا الاسم.');return}const {data:links,error:le}=await state.client.from('student_friends').select('status').eq('status','accepted').or('and(user_id.eq.'+state.user.id+',friend_id.eq.'+p.user_id+'),and(user_id.eq.'+p.user_id+',friend_id.eq.'+state.user.id+')');if(le)throw le;if(!links?.length){say('المراسلة متاحة للأصدقاء المقبولين فقط.');return}await openFriendChat(p);if(state.targetId===p.user_id)say('تم فتح المحادثة الخاصة.')};
$('#socialAddFriend').onsubmit=async e=>{e.preventDefault();await addFriendByUsername($('#socialFriendUsername').value)};
$('#socialAvatarFile').addEventListener('change',()=>{const file=$('#socialAvatarFile').files?.[0],preview=$('#socialAvatarPreview');if(!file)return;preview.src=URL.createObjectURL(file);preview.hidden=false});
$('#socialDirectForm').onsubmit=async e=>{e.preventDefault();try{await sendMessage('direct',$('#socialDirectInput').value);$('#socialDirectInput').value=''}catch(err){say(err.message)}};
$('#socialProfileForm').onsubmit=async e=>{e.preventDefault();const username=$('#socialUsername').value.trim().toLowerCase();if(!/^[a-z0-9_]{3,24}$/.test(username)){say('اسم المستخدم يجب أن يكون من 3 إلى 24 حرفًا إنجليزيًا أو رقمًا أو شرطة سفلية.');return}const {data:duplicate,error:dupError}=await state.client.from('student_profiles').select('user_id').eq('username',username).maybeSingle();if(dupError){say(dupError.message);return}if(duplicate&&duplicate.user_id!==state.user.id){say('اسم المستخدم مستخدم بالفعل. اختر اسمًا آخر.');return}let avatarUrl=state.profile?.avatar_url||null;const avatarFile=$('#socialAvatarFile').files?.[0];if(avatarFile){if(!/^image\/(png|jpeg|webp)$/.test(avatarFile.type)||avatarFile.size>3145728){say('اختر صورة PNG أو JPG أو WebP لا تتجاوز 3 ميغابايت.');return}const ext=avatarFile.type==='image/png'?'png':avatarFile.type==='image/webp'?'webp':'jpg';const path=state.user.id+'/avatar.'+ext;const upload=await state.client.storage.from('profile-avatars').upload(path,avatarFile,{upsert:true,contentType:avatarFile.type});if(upload.error){say(upload.error.message);return}avatarUrl=state.client.storage.from('profile-avatars').getPublicUrl(path).data.publicUrl}const profile={user_id:state.user.id,username,display_name:$('#socialDisplayName').value.trim(),avatar_url:avatarUrl,companion_name:$('#socialCompanionName').value.trim(),bio:$('#socialBio').value.trim(),companion_style:{color:$('#socialCompanionColor').value,outfit:$('#socialCompanionOutfit').value,accessory:$('#socialCompanionAccessory').value},updated_at:new Date().toISOString()};const {data,error}=await state.client.from('student_profiles').upsert(profile).select().single();if(error){say(String(error.code)==='23505'?'اسم المستخدم مستخدم بالفعل. اختر اسمًا آخر.':error.message);return}state.profile=data;applyCompanionCustomization();say('تم حفظ ملفك وتخصيص الرفيق.');await renderFriends()};
$('#socialCopyId').onclick=()=>{navigator.clipboard?.writeText(state.user.id).then(()=>say('تم نسخ ID')).catch(()=>say('معرّفك: '+state.user.id))};
$('#socialAchievementForm').onsubmit=async e=>{e.preventDefault();try{const include=$('#socialAchievementIncludeStats').checked;let stats={};if(include){const s=window.studentGuideExportState?.()||{};stats={completedTasks:(s.tasks||[]).filter(t=>t.done).length,sessions:Number(s.sessions||0),cards:(s.cards||[]).length}}const {error}=await state.client.from('student_achievement_posts').insert({user_id:state.user.id,title:$('#socialAchievementTitle').value.trim(),description:$('#socialAchievementDesc').value.trim(),stats});if(error)throw error;$('#socialAchievementTitle').value='';$('#socialAchievementDesc').value='';$('#socialAchievementIncludeStats').checked=false;await loadAchievements()}catch(err){say('تعذر نشر الإنجاز: '+err.message)}};
window.addEventListener('student-guide-auth-changed',()=>setup().catch(e=>console.warn(e)));setTimeout(()=>setup().catch(e=>console.warn('Social setup:',e)),1000);
});
})();