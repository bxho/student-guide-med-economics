/* Student Guide companion WebGL bridge.
 * Kept isolated until the Unity build and task-completion integration are tested.
 */
(function (global) {
  'use strict';

  const DEFAULT_OBJECT_NAME = 'StudentGuideCompanion';
  let unityInstance = null;
  let objectName = DEFAULT_OBJECT_NAME;

  function attach(instance, targetName) {
    if (!instance || typeof instance.SendMessage !== 'function') {
      throw new TypeError('A valid Unity WebGL instance is required.');
    }
    unityInstance = instance;
    objectName = typeof targetName === 'string' && targetName.trim()
      ? targetName.trim()
      : DEFAULT_OBJECT_NAME;
    return true;
  }

  function onStudyTaskCompleted(taskId, xpAmount) {
    if (!unityInstance) return { ok: false, reason: 'unity-not-attached' };
    if (typeof taskId !== 'string' || !taskId.trim() || /[|\r\n]/.test(taskId)) {
      return { ok: false, reason: 'invalid-task-id' };
    }
    const xp = Number(xpAmount);
    if (!Number.isSafeInteger(xp) || xp <= 0) {
      return { ok: false, reason: 'invalid-xp' };
    }

    try {
      unityInstance.SendMessage(
        objectName,
        'OnStudyTaskCompleted',
        taskId.trim() + '|' + String(xp)
      );
      return { ok: true };
    } catch (error) {
      return { ok: false, reason: 'send-message-failed', error: String(error) };
    }
  }

  function detach() {
    unityInstance = null;
  }

  global.studentGuideCompanionBridge = Object.freeze({
    attach,
    onStudyTaskCompleted,
    detach
  });
})(window);
