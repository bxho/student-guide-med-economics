(() => {
'use strict';
const $ = (s, root=document) => root.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const wait = ms => new Promise(r => setTimeout(r, ms));
let pending = null, running = false;
function status(text, progress) {
 const box=$('#libraryAutoStatus'), line=$('#libraryAutoStatusText'), bar=$('#libraryAutoProgress');
 if(box) box.hidden=false; if(line) line.textContent=text; if(bar) bar.style.width=Math.max(4,Math.min(100,progress||4))+'%';
}
function visualSvg(title, points, subject) {
 const colors=['#dff4e8','#e4edff','#fff0d8'], ink=['#28845c','#456fd0','#bd7b25'];
 const rows=points.slice(0,3).map((p,i)=>'<rect x="32" y="'+(170+i*98)+'" width="576" height="78" rx="16" fill="'+colors[i]+'"/><circle cx="65" cy="'+(209+i*98)+'" r="17" fill="'+ink[i]+'"/><text x="65" y="'+(215+i*98)+'" font-size="15" text-anchor="middle" fill="#fff" font-weight="700">'+(i+1)+'</text><text x="94" y="'+(200+i*98)+'" font-size="15" fill="#182b26" font-weight="700">'+esc(p.length>56?p.slice(0,53)+'…':p)+'</text><text x="94" y="'+(226+i*98)+'" font-size="11" fill="#52645d">'+esc(subject||'مراجعة سريعة')+'</text>').join('');
 const height=Math.max(290,190+Math.min(3,points.length)*98);
 return '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="'+height+'" viewBox="0 0 640 '+height+'"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f1fff5"/><stop offset="1" stop-color="#edf2ff"/></linearGradient></defs><rect width="640" height="100%" rx="24" fill="url(#g)"/><circle cx="570" cy="45" r="62" fill="#b6e8c7" opacity=".5"/><text x="32" y="35" font-size="11" fill="#2f7c42" font-weight="700">دليل الطالب · خريطة المراجعة</text><text x="32" y="77" font-size="23" fill="#17251b" font-weight="800">'+esc(title).slice(0,70)+'</text><text x="32" y="105" font-size="12" fill="#63756a">أهم الأفكار في لمحة واحدة</text>'+rows+'<text x="32" y="'+(height-15)+'" font-size="10" fill="#6d7d70">إنفوغرافيك مولّد من النقاط المستخرجة · راجع المصدر الأصلي</text></svg>';
}
async function loadScript(src) {
 return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(new Error('تعذر تحميل أداة قراءة الملف. جرّب ملف TXT أو MD.'));document.head.appendChild(s);});
}
async function extractText(file, ext) {
 if(ext==='txt'||ext==='md') return await file.text();
 if(ext==='pdf') {
  if(!window.pdfjsLib) await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
  if(!window.pdfjsLib) throw new Error('قارئ PDF غير متاح.');
  window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  const pdf=await window.pdfjsLib.getDocument({data:await file.arrayBuffer()}).promise, pages=[];
  for(let i=1;i<=pdf.numPages;i++){status('استخراج النص من صفحة '+i+' من '+pdf.numPages+'…',10+Math.round(i/pdf.numPages*35));const p=await pdf.getPage(i),c=await p.getTextContent();pages.push(c.items.map(x=>x.str||'').join(' '));}
  return pages.join('\n\n').trim();
 }
 if(['png','jpg','jpeg','webp'].includes(ext)) {
  if(!window.Tesseract) await loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js');
  status('قراءة النص داخل الصورة… قد يستغرق ذلك بعض الوقت.',25);
  const r=await window.Tesseract.recognize(file,'ara+eng',{logger:m=>{if(m.status==='recognizing text'&&m.progress)status('التعرّف على النص '+Math.round(m.progress*100)+'%…',25+Math.round(m.progress*25));}});
  return String(r.data?.text||'').trim();
 }
 if(['mp3','m4a','wav','ogg'].includes(ext)) throw new Error('تم حفظ الصوت، لكن تحويل الصوت إلى نص غير مفعّل بعد. ارفع تفريغاً نصياً للصوت للحصول على مراجعة تلقائية.');
 throw new Error('تم حفظ الملف، لكن استخراج النص التلقائي غير مدعوم لهذا النوع حتى الآن.');
}
async function runAutoStudy(item, modal) {
 if(running) return; running=true;
 const file=item.file, ext=(file.name.split('.').pop()||'').toLowerCase();
 const submit=$('#fileForm button[type=submit]'), oldLabel=submit?.textContent;
 try {
  status('قراءة محتوى الملف…',8);
  let text=await extractText(file,ext);
  if(text.length<100) throw new Error('حُفظ الملف، لكن لم أستخرج منه نصاً كافياً. جرّب PDF قابلاً لتحديد النص أو ملف TXT/MD.');
  if(text.length>28000) text=text.slice(0,28000);
  if(!window.studentGuideAnalyzeText||!window.studentGuideAddAIFlashcards||!window.studentGuideSaveGeneratedVisual) throw new Error('خدمة المراجعة تحتاج تحديثاً. أعد تحميل الصفحة ثم جرّب مجدداً.');
  status('الذكاء الاصطناعي يستخرج الملخص والأسئلة والبطاقات…',52);
  const title=file.name.replace(/\.[^.]+$/,'');
  const out=await window.studentGuideAnalyzeText(title,item.subject||'عام',text);
  const points=Array.isArray(out.points)?out.points.filter(x=>typeof x==='string'&&x.trim()).slice(0,15):[];
  const cards=Array.isArray(out.cards)?out.cards.filter(x=>x&&x.question&&x.answer).slice(0,24):[];
  const questions=Array.isArray(out.questions)?out.questions.filter(x=>x&&x.question&&x.answer).slice(0,18):[];
  if(!points.length&&!cards.length&&!questions.length) throw new Error('لم ينتج الذكاء الاصطناعي عناصر مراجعة صالحة.');
  status('حفظ البطاقات وصورة المراجعة…',82);
  const saved=window.studentGuideAddAIFlashcards(cards,item.subject||'عام',file.name);
  const svg=visualSvg(title,points,item.subject);
  await window.studentGuideSaveGeneratedVisual(svg,title+' — خريطة المراجعة.svg',item.subject||'عام',item.year||'عام',item.topic||'');
  const result=document.createElement('section');result.className='library-ai-result';result.id='libraryAiResult';
  result.innerHTML='<div class="library-ai-result-head"><span class="library-ai-spark">✦</span><div><strong>مراجعتك جاهزة</strong><p>'+esc(file.name)+' · راجع المحتوى مع الملف الأصلي</p></div></div><div class="library-ai-columns"><article><b>🧠 النقاط الأساسية</b><ul>'+ (points.map(p=>'<li>'+esc(p)+'</li>').join('')||'<li>لم يتم استخراج نقاط كافية.</li>')+'</ul></article><article><b>❓ أسئلة تدريبية</b><div class="library-ai-questions">'+(questions.map((q,i)=>'<details><summary>'+(i+1)+'. '+esc(q.question)+'</summary><p>'+esc(q.answer)+'</p></details>').join('')||'<p>لم يتم إنشاء أسئلة.</p>')+'</div></article></div><div class="library-ai-visual"><b>🎨 صورة المراجعة</b><p>إنفوغرافيك مبسّط يجمع أهم النقاط، محفوظ داخل المكتبة كملف SVG.</p><div class="library-ai-visual-preview">'+svg+'</div><a class="btn small soft" href="data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)+'" download="'+esc(title)+'-review.svg">تنزيل الصورة</a></div><div class="library-ai-actions"><button class="btn primary" type="button" id="libraryOpenCards">فتح بطاقات المراجعة ('+saved+')</button><button class="btn" type="button" id="libraryCloseResults">إغلاق</button></div>';
  $('#libraryAiResult')?.remove(); $('#fileForm').after(result);
  $('#libraryOpenCards').addEventListener('click',()=>{modal.hidden=true;document.body.classList.remove('library-modal-open');document.querySelector('[data-view="flashcards"]')?.click();});
  $('#libraryCloseResults').addEventListener('click',()=>{result.remove();modal.hidden=true;document.body.classList.remove('library-modal-open');});
  status('اكتملت المراجعة: '+points.length+' نقاط، '+saved+' بطاقة، '+questions.length+' سؤال.',100);
  $('#libraryList')?.scrollIntoView({behavior:'smooth',block:'start'});
 } catch(e) {status(e.message||'تعذر إعداد المراجعة التلقائية.',100);}
 finally {if(submit)submit.textContent=oldLabel||'حفظ في المكتبة';running=false;}
}
function setupCreate() {
 const section=$('#view-library'), title=section?.querySelector('.section-title'), form=$('#fileForm');
 if(!section||!title||!form||$('#libraryCreateModal'))return;
 const oldPanel=form.closest('.panel'), note=oldPanel.querySelector('.note');
 title.classList.add('library-title-row');
 const launch=document.createElement('button');launch.type='button';launch.className='btn primary library-create-launch';launch.innerHTML='<span>＋</span> إنشاء';title.appendChild(launch);
 const modal=document.createElement('div');modal.id='libraryCreateModal';modal.className='library-modal';modal.hidden=true;
 modal.innerHTML='<div class="library-modal-backdrop" data-library-close></div><section class="library-modal-card" role="dialog" aria-modal="true" aria-labelledby="libraryModalTitle"><header class="library-modal-head"><div><span class="library-modal-kicker">مساحة تعلمك</span><h3 id="libraryModalTitle">ماذا تريد أن تضيف؟</h3><p>ارفع مادة وسنجهّز لك مراجعة أولية منها تلقائيًا.</p></div><button type="button" class="library-modal-close" data-library-close aria-label="إغلاق">×</button></header><div class="library-create-options"><div class="library-option active"><span>📄</span><div><strong>رفع ملف دراسي</strong><small>PDF أو نص أو صورة أو صوت</small></div></div><button type="button" class="library-option" id="libraryCreateFolder"><span>📁</span><div><strong>إنشاء مجلد</strong><small>رتّب المواد بالطريقة التي تناسبك</small></div></button></div><div class="library-modal-form"></div><div class="library-modal-note"></div><div id="libraryAutoStatus" class="library-auto-status" hidden aria-live="polite"><span class="library-status-spinner"></span><div><strong>نجهّز مادة المراجعة</strong><p id="libraryAutoStatusText">قراءة الملف…</p><div class="library-auto-progress"><span id="libraryAutoProgress"></span></div></div></div><footer class="library-modal-foot"><span>ملفاتك تبقى في مكتبتك الخاصة.</span><button type="button" class="btn" data-library-close>إلغاء</button></footer></section>';
 document.body.appendChild(modal);modal.querySelector('.library-modal-form').appendChild(form);if(note)modal.querySelector('.library-modal-note').appendChild(note);oldPanel.hidden=true;
 const open=()=>{modal.hidden=false;document.body.classList.add('library-modal-open');setTimeout(()=>$('#fileInput')?.focus(),50);};
 const close=()=>{if(running)return;modal.hidden=true;document.body.classList.remove('library-modal-open');};
 launch.addEventListener('click',open);
 modal.addEventListener('click',e=>{if(e.target.closest('[data-library-close]'))close();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)close();});
 $('#libraryCreateFolder').addEventListener('click',()=>{close();$('#newFolderBtn')?.click();});
 form.addEventListener('submit',()=>{
  const f=$('#fileInput')?.files?.[0];if(f)pending={file:f,subject:$('#fileSubject')?.value||'عام',year:$('#fileYear')?.value||'عام',topic:$('#fileTopic')?.value||''};
  setTimeout(()=>{if(pending&&pending.file===f)runAutoStudy(pending,modal).finally(()=>{pending=null;});},700);
 });
 // The library is for every education stage, not only university.
 const year=$('#fileYear');if(year){const old=year.value;year.innerHTML='<option value="عام">عام / غير محدد</option><option value="ابتدائي">ابتدائي</option><option value="متوسط">متوسط</option><option value="ثانوي">ثانوي</option><option value="السنة الأولى">جامعة — السنة الأولى</option><option value="السنة الثانية">جامعة — السنة الثانية</option><option value="السنة الثالثة">جامعة — السنة الثالثة</option><option value="السنة الرابعة">جامعة — السنة الرابعة</option><option value="السنة الخامسة">جامعة — السنة الخامسة</option><option value="السنة السادسة">جامعة — السنة السادسة</option><option value="دراسات عليا">دراسات عليا</option>';if([...year.options].some(o=>o.value===old))year.value=old;}
 const yf=$('#fileYearFilter');if(yf)yf.innerHTML='<option value="all">كل المراحل</option><option>عام</option><option>ابتدائي</option><option>متوسط</option><option>ثانوي</option><option>السنة الأولى</option><option>السنة الثانية</option><option>السنة الثالثة</option><option>السنة الرابعة</option><option>السنة الخامسة</option><option>السنة السادسة</option><option>دراسات عليا</option>';
 const subj=$('#fileSubject');if(subj){const parent=subj.parentElement,inp=document.createElement('input');inp.id='fileSubject';inp.className=subj.className;inp.placeholder='المادة أو المجال (رياضيات، علوم، تاريخ…)';inp.setAttribute('list','generalSubjectOptions');inp.value=subj.value||'';subj.replaceWith(inp);const list=document.createElement('datalist');list.id='generalSubjectOptions';list.innerHTML=['رياضيات','علوم','لغة عربية','لغة إنجليزية','تاريخ','جغرافيا','فيزياء','كيمياء','أحياء','حاسوب','تشريح','فسيولوجيا','اقتصاد','مراجعة عامة'].map(x=>'<option value="'+x+'">').join('');parent.appendChild(list);}
}
function setupFlips() {
 const list=$('#flashList');if(!list||list.dataset.flipReady)return;list.dataset.flipReady='1';
 const wire=()=>list.querySelectorAll('.flash-card').forEach(card=>{if(card.dataset.flipReady)return;card.dataset.flipReady='1';card.tabIndex=0;card.setAttribute('role','button');card.setAttribute('aria-label','اقلب البطاقة لإظهار الإجابة');card.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&!e.target.closest('button')){e.preventDefault();card.classList.toggle('is-flipped');}});});
 list.addEventListener('click',e=>{if(e.target.closest('button'))return;const card=e.target.closest('.flash-card');if(card)card.classList.toggle('is-flipped');});
 new MutationObserver(wire).observe(list,{childList:true});wire();
 document.addEventListener('click',e=>{const b=e.target.closest('[data-reveal]');if(b){const c=b.closest('.flash-card');if(c)setTimeout(()=>c.classList.toggle('is-flipped',c.classList.contains('revealed')),0);}});
}
function start(){setupCreate();setupFlips();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();