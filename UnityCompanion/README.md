# دليل الطالب — Unity Companion starter

This directory is a **Unity source scaffold**, not a compiled Unity WebGL build.

## Included
- Seven animation states: Idle, Walk, Run, Jump, Dragged, Tired, Sleep.
- Seven evolution stages with separate per-stage animation clips.
- SpriteRenderer frame animation and pointer dragging.
- XP entry point restricted to completed study tasks: `AddCompletedStudyTaskXP(int xpAmount)`.

## Add the Cyber-Bot sprite sheet
1. Open this folder as part of a Unity 2D project (create a project in Unity Hub, then copy the `Assets` folder into it).
2. Import the supplied Cyber-Bot sheet as a Sprite (2D and UI).
3. Set Sprite Mode to Multiple, open Sprite Editor, slice each frame, and apply.
4. Create a GameObject with SpriteRenderer, BoxCollider2D, and AdvancedCompanionController.
5. Populate all seven Stage Animation Data entries in the Inspector. Assign each state its ordered frames and frame rate. The sheet in the conversation is a visual reference; it is not automatically available as a sliced Unity asset in this source scaffold.
6. Test in Unity Editor, then select WebGL in Build Profiles and build to a folder such as `Build/WebGL`.

## XP contract
Call `AddCompletedStudyTaskXP` only from the integration layer after a task transitions from incomplete to complete. Do not award XP from focus sessions, cards, notes, feeding, or a standalone daily-mission button.

## Current limitation
No Unity editor/compiler or prepared WebGL build is included here, so this source has not been compiled and the site is not yet running Unity. To embed it in the existing GitHub Pages app, export a WebGL build and wire the generated loader/canvas into the site's companion view. A real build must be tested in a browser before claiming it is live.
