/* Lets each student choose a local Shimeji image/GIF for the Webmeji movement engine. */
(function () {
  'use strict';
  const STORE = 'studentGuideShimejiImageData';
  const DEFAULT_FIRE = 'https://opengameart.org/sites/default/files/1535543564422Instagram_last.png';
  const MAX_BYTES = 1200 * 1024;
  function setFrames(src) {
    const config = window.STUDENT_GUIDE_FIRE_CONFIG;
    if (!config) return;
    Object.values(config).forEach(action => {
      if (action && Array.isArray(action.frames)) action.frames.splice(0, action.frames.length, src);
    });
    const sprite = document.getElementById('student-guide-fire-webmeji');
    if (sprite) sprite.src = src;
    if (window.StudentGuideFireWebmejiSync) {
      let chosen = 'medicine';
      try { chosen = JSON.parse(localStorage.getItem('studentGuideCompanion_v2') || '{}').chosen || 'medicine'; } catch (_) {}
      window.StudentGuideFireWebmejiSync(chosen);
    }
  }
  function addControls() {
    const panel = document.getElementById('companionPanel');
    const actions = panel && panel.querySelector('.companion-panel-actions');
    if (!actions || document.getElementById('studentGuideShimejiChoose')) return;
    const choose = document.createElement('button');
    choose.id = 'studentGuideShimejiChoose';
    choose.type = 'button';
    choose.textContent = '🖼️ اختيار Shimeji من جهازي';
    choose.title = 'اختر صورة أو GIF محفوظًا على جهازك';
    const reset = document.createElement('button');
    reset.id = 'studentGuideShimejiReset';
    reset.type = 'button';
    reset.textContent = '↩️ العودة للرفيق المعتاد';
    const input = document.createElement('input');
    input.id = 'studentGuideShimejiFile';
    input.type = 'file';
    input.accept = 'image/png,image/jpeg,image/webp,image/gif';
    input.hidden = true;
    input.setAttribute('aria-label', 'اختر صورة Shimeji من الجهاز');
    choose.addEventListener('click', () => input.click());
    input.addEventListener('change', () => {
      const file = input.files && input.files[0];
      if (!file) return;
      if (!['image/png','image/jpeg','image/webp','image/gif'].includes(file.type)) {
        alert('اختر صورة PNG أو JPG أو WebP أو GIF.');
        input.value = '';
        return;
      }
      if (file.size > MAX_BYTES) {
        alert('حجم الصورة كبير. اختر ملفًا أصغر من 1.2 ميغابايت حتى يمكن حفظه على هذا الجهاز.');
        input.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const value = String(reader.result || '');
          if (!value.startsWith('data:image/')) throw new Error('Invalid image');
          localStorage.setItem(STORE, value);
          setFrames(value);
          document.body.classList.add('student-guide-custom-shimeji-active');
          choose.textContent = '✅ تم اختيار Shimeji — اختر غيره';
          const status = document.getElementById('companionBubble');
          if (status) status.textContent = 'تم اختيار Shimeji وحفظه على هذا الجهاز.';
        } catch (_) {
          alert('تعذر حفظ الصورة. جرّب ملفًا أصغر.');
        }
        input.value = '';
      };
      reader.onerror = () => { alert('تعذر قراءة الصورة من الجهاز.'); input.value = ''; };
      reader.readAsDataURL(file);
    });
    reset.addEventListener('click', () => {
      try { localStorage.removeItem(STORE); } catch (_) {}
      setFrames(DEFAULT_FIRE);
      document.body.classList.remove('student-guide-custom-shimeji-active');
      choose.textContent = '🖼️ اختيار Shimeji من جهازي';
      const status = document.getElementById('companionBubble');
      if (status) status.textContent = 'عاد الرفيق إلى الاختيار المعتاد.';
    });
    actions.insertBefore(choose, actions.querySelector('#companionHouse'));
    actions.insertBefore(reset, actions.querySelector('#companionHouse'));
    panel.appendChild(input);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addControls);
  const observer = new MutationObserver(addControls);
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
