/* Connect Webmeji's fire sprite to the existing Student Guide companion panel. */
(function () {
  'use strict';
  const FIRE_ID = 'student-guide-fire-webmeji';
  const STORE = 'studentGuideCompanion_v2';
  let lastKind = null;

  function storedKind() {
    try {
      const state = JSON.parse(localStorage.getItem(STORE) || '{}');
      return state.chosen || 'medicine';
    } catch (_) { return 'medicine'; }
  }

  function attachClick() {
    const sprite = document.getElementById(FIRE_ID);
    const container = sprite && sprite.closest('.webmeji-container');
    if (!container) return;
    if (container.dataset.studentGuideBound === '1') return;
    container.dataset.studentGuideBound = '1';
    container.setAttribute('role', 'button');
    container.setAttribute('aria-label', 'افتح قائمة Shimeji');
    container.title = 'اضغط لفتح قائمة الرفيق';
    container.addEventListener('click', function () {
      const existingBuddy = document.getElementById('companionBuddy');
      if (existingBuddy) existingBuddy.click();
    });
  }

  function sync(kind) {
    const selected = kind || storedKind();
    lastKind = selected;
    let customImage = false;
    try { customImage = !!localStorage.getItem('studentGuideShimejiImageData'); } catch (_) {}
    document.body.classList.toggle('student-guide-fire-active', selected === 'flame' || customImage);
    document.body.classList.toggle('student-guide-custom-shimeji-active', customImage);

    attachClick();
  }

  window.StudentGuideFireWebmejiSync = sync;
  const observer = new MutationObserver(attachClick);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { sync(lastKind || storedKind()); });
  } else {
    sync(storedKind());
  }
})();
