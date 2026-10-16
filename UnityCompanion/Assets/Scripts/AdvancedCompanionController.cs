using System;
using System.Collections.Generic;
using UnityEngine;

/// <summary>
/// Runtime controller for the Student Guide companion.
/// XP is awarded only through AddCompletedStudyTaskXP, called after the app
/// confirms that a real study task changed to completed.
/// </summary>
[RequireComponent(typeof(SpriteRenderer), typeof(BoxCollider2D))]
public sealed class AdvancedCompanionController : MonoBehaviour
{
    public enum AnimationState { Idle, Walk, Run, Jump, Dragged, Tired, Sleep }
    public enum EvolutionStage { Stage1, Stage2, Stage3, Stage4, Stage5, Stage6, Stage7 }

    [Serializable]
    public sealed class AnimationClipData
    {
        public AnimationState state;
        public Sprite[] frames = Array.Empty<Sprite>();
        [Range(1f, 60f)] public float frameRate = 8f;
        public bool loop = true;
    }

    [Serializable]
    public sealed class StageAnimationData
    {
        public EvolutionStage stage;
        public List<AnimationClipData> animations = new List<AnimationClipData>();
    }

    [Header("Stage animation data")]
    [SerializeField] private EvolutionStage currentStage = EvolutionStage.Stage1;
    [SerializeField] private AnimationState currentState = AnimationState.Idle;
    [SerializeField] private List<StageAnimationData> allStagesData = new List<StageAnimationData>();

    [Header("Study progress only")]
    [SerializeField, Min(1)] private int baseXPNeeded = 100;
    [SerializeField] private int currentXP;
    public int CurrentXP => currentXP;
    public EvolutionStage CurrentStage => currentStage;
    public AnimationState CurrentState => currentState;
    public event Action<int, EvolutionStage> ProgressChanged;

    [Header("Pointer dragging")]
    [SerializeField, Min(0.01f)] private float dragSmoothTime = 0.08f;
    private SpriteRenderer spriteRenderer;
    private Camera mainCamera;
    private int frameIndex;
    private float frameTimer;
    private bool dragging;
    private Vector3 dragVelocity;
    private Vector3 dragOffset;
    private readonly Dictionary<AnimationState, AnimationClipData> activeAnimations =
        new Dictionary<AnimationState, AnimationClipData>();

    private void Awake()
    {
        spriteRenderer = GetComponent<SpriteRenderer>();
        mainCamera = Camera.main;
        RebuildStageAnimations();
    }

    private void Start() => PlayAnimation(AnimationState.Idle);

    private void Update()
    {
        AnimateFrames();
        if (dragging && mainCamera != null)
        {
            Vector3 mouse = Input.mousePosition;
            mouse.z = Mathf.Abs(mainCamera.transform.position.z - transform.position.z);
            Vector3 target = mainCamera.ScreenToWorldPoint(mouse) + dragOffset;
            target.z = transform.position.z;
            transform.position = Vector3.SmoothDamp(transform.position, target, ref dragVelocity,
                dragSmoothTime, Mathf.Infinity, Time.deltaTime);
        }
    }

    private void OnMouseDown()
    {
        if (mainCamera == null) mainCamera = Camera.main;
        if (mainCamera == null) return;
        Vector3 mouse = Input.mousePosition;
        mouse.z = Mathf.Abs(mainCamera.transform.position.z - transform.position.z);
        dragOffset = transform.position - mainCamera.ScreenToWorldPoint(mouse);
        dragging = true;
        PlayAnimation(AnimationState.Dragged);
    }

    private void OnMouseUp()
    {
        if (!dragging) return;
        dragging = false;
        PlayAnimation(AnimationState.Idle);
    }

    public void PlayAnimation(AnimationState state)
    {
        if (!activeAnimations.TryGetValue(state, out AnimationClipData clip) ||
            clip.frames == null || clip.frames.Length == 0) return;

        currentState = state;
        frameIndex = 0;
        frameTimer = 0f;
        spriteRenderer.sprite = clip.frames[0];
    }

    private void AnimateFrames()
    {
        if (!activeAnimations.TryGetValue(currentState, out AnimationClipData clip) ||
            clip.frames == null || clip.frames.Length == 0) return;

        frameTimer += Time.deltaTime;
        float frameDuration = 1f / Mathf.Max(1f, clip.frameRate);
        while (frameTimer >= frameDuration)
        {
            frameTimer -= frameDuration;
            if (frameIndex + 1 < clip.frames.Length) frameIndex++;
            else if (clip.loop) frameIndex = 0;
            else { frameIndex = clip.frames.Length - 1; frameTimer = 0f; }
            spriteRenderer.sprite = clip.frames[frameIndex];
        }
    }

    /// <summary>
    /// Call once only when a study task becomes completed for the first time.
    /// Do not call for focus sessions, notes, cards, daily prompts, or feeding.
    /// </summary>
    public void AddCompletedStudyTaskXP(int xpAmount)
    {
        if (xpAmount <= 0) return;
        currentXP = Mathf.Max(0, currentXP + xpAmount);
        while ((int)currentStage < (int)EvolutionStage.Stage7 &&
               currentXP >= XPRequiredForCurrentStage())
        {
            currentXP -= XPRequiredForCurrentStage();
            currentStage = (EvolutionStage)((int)currentStage + 1);
            RebuildStageAnimations();
            PlayAnimation(AnimationState.Idle);
        }
        ProgressChanged?.Invoke(currentXP, currentStage);
    }

    private int XPRequiredForCurrentStage()
    {
        return Mathf.RoundToInt(baseXPNeeded * Mathf.Pow(1.5f, (int)currentStage));
    }

    private void RebuildStageAnimations()
    {
        activeAnimations.Clear();
        StageAnimationData stageData = allStagesData.Find(x => x != null && x.stage == currentStage);
        if (stageData == null || stageData.animations == null) return;
        foreach (AnimationClipData clip in stageData.animations)
        {
            if (clip != null) activeAnimations[clip.state] = clip;
        }
    }

#if UNITY_WEBGL && !UNITY_EDITOR
    // Called by the page bridge when the web app confirms a completed task.
    public void OnStudyTaskCompleted(string xpText)
    {
        if (int.TryParse(xpText, out int xp)) AddCompletedStudyTaskXP(xp);
    }
#endif
}
