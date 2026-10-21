/* Built-in companion selection only. Custom local Shimeji upload was removed. */
(function () {
  'use strict';
  function removeLocalUploadControls() {
    ['studentGuideShimejiChoose', 'studentGuideShimejiReset', 'studentGuideShimejiFile'].forEach(id => {
      const node = document.getElementById(id);
      if (node) node.remove();
    });
    document.querySelectorAll('button').forEach(button => {
      const label = (button.textContent || '').trim();
      if (/رفع\s*شميجي|اختيار\s*Shimeji\s*للتطبيق|اختيار\s*صورة\s*Shimeji\s*من\s*الجهاز/i.test(label)) button.remove();
    });
    try { localStorage.removeItem('studentGuideShimejiImageData'); } catch (_) {}
    document.body.classList.remove('student-guide-custom-shimeji-active');
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', removeLocalUploadControls, { once: true });
  } else {
    removeLocalUploadControls();
  }
  const observer = new MutationObserver(removeLocalUploadControls);
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
