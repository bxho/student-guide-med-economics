# دليل الطالب — Unity Companion starter

This directory is a **Unity source scaffold**, not a compiled Unity WebGL build.

## Included
- Seven animation states: Idle, Walk, Run, Jump, Dragged, Tired, Sleep.
- Seven evolution stages with separate per-stage animation clips.
- SpriteRenderer frame animation and pointer dragging.
- XP entry point accepts a unique study-task ID and awards XP only once per task.
- XP, evolution stage, and completed task IDs are saved locally using Unity PlayerPrefs.

## Generate a playable demo scene
1. Open a Unity 2D project in Unity Hub and copy this folder's `Assets` directory into the project.
2. Wait for Unity to finish importing the scripts.
3. Choose `Tools → Student Guide → Build Companion Demo (7 Stages)`.
4. Open `Assets/StudentGuideCompanionDemo/CompanionDemo.unity` and press Play.
5. Use the in-scene Arabic test controls to try idle, walk, run, jump, tired and sleep; the companion also wanders autonomously. Drag it with the mouse to test the dragged state.
6. Use the demo-only XP button and duplicate-ID test. Demo progress is isolated under `StudentGuide.Companion.Demo`.

The generated pixel-art sprites are **temporary test artwork**, not the final character art. To match the intended character designs, replace these generated sprites with the approved original character sheets and assign the frames to each stage/state.

## Build WebGL
After the demo scene runs and any compile/runtime errors are fixed, select WebGL in Build Profiles and build to a folder such as `Build/WebGL`. Embed that output only after verifying it in a browser.

## XP contract
Call `AddCompletedStudyTaskXP(taskId, xpAmount)` only from the integration layer after a task transitions from incomplete to complete. `taskId` must be the stable unique ID of that task. Repeated calls for the same ID are ignored, including after a reload because completed IDs are saved. Do not award XP from focus sessions, cards, notes, feeding, or a standalone daily-mission button.

## Current limitation
No Unity editor/compiler or prepared WebGL build is included here, so this source has not been compiled and the site is not yet running Unity. To embed it in the existing GitHub Pages app, export a WebGL build and wire the generated loader/canvas into the site's companion view. A real build must be tested in a browser before claiming it is live.
