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
    [SerializeField] private string saveKey = "StudentGuide.Companion";
    private readonly HashSet<string> completedTaskIds = new HashSet<string>();
    public int CurrentXP => currentXP;
    public EvolutionStage CurrentStage => currentStage;
    public AnimationState CurrentState => currentState;
    public event Action<int, EvolutionStage> ProgressChanged;

    [Header("Autonomous movement")]
    [SerializeField] private bool autonomousMovement = true;
    [SerializeField, Min(0.1f)] private float roamRadius = 2f;
    [SerializeField, Min(0.1f)] private float walkSpeed = 0.7f;
    [SerializeField, Min(0.1f)] private float runSpeed = 1.35f;
    private Vector3 homePosition;
    private Vector3 roamTarget;
    private float autonomyTimer;

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
        LoadProgress();
        RebuildStageAnimations();
    }

    private void Start()
    {
        homePosition = transform.position;
        roamTarget = homePosition;
        autonomyTimer = UnityEngine.Random.Range(1f, 2.5f);
        PlayAnimation(AnimationState.Idle);
    }

    private void Update()
    {
        UpdateAutonomy();
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

    private void UpdateAutonomy()
    {
        if (!autonomousMovement || dragging) return;
        autonomyTimer -= Time.deltaTime;

        if (currentState == AnimationState.Walk || currentState == AnimationState.Run)
        {
            float speed = currentState == AnimationState.Run ? runSpeed : walkSpeed;
            transform.position = Vector3.MoveTowards(transform.position, roamTarget, speed * Time.deltaTime);
            Vector3 scale = transform.localScale;
            if (Mathf.Abs(roamTarget.x - transform.position.x) > 0.02f)
                scale.x = Mathf.Abs(scale.x) * (roamTarget.x < transform.position.x ? -1f : 1f);
            transform.localScale = scale;
            if (Vector2.Distance(transform.position, roamTarget) < 0.05f || autonomyTimer <= 0f)
            {
                PlayAnimation(AnimationState.Idle);
                autonomyTimer = UnityEngine.Random.Range(1.2f, 3f);
            }
            return;
        }

        if (autonomyTimer > 0f) return;

        switch (currentState)
        {
            case AnimationState.Jump:
                PlayAnimation(AnimationState.Idle);
                autonomyTimer = UnityEngine.Random.Range(1f, 2.2f);
                break;
            case AnimationState.Tired:
                PlayAnimation(UnityEngine.Random.value < 0.35f ? AnimationState.Sleep : AnimationState.Idle);
                autonomyTimer = currentState == AnimationState.Sleep ? 4f : UnityEngine.Random.Range(1f, 2.5f);
                break;
            case AnimationState.Sleep:
                PlayAnimation(AnimationState.Idle);
                autonomyTimer = UnityEngine.Random.Range(1.5f, 3f);
                break;
            default:
                float roll = UnityEngine.Random.value;
                if (roll < 0.48f)
                {
                    roamTarget = homePosition + new Vector3(UnityEngine.Random.Range(-roamRadius, roamRadius), 0f, 0f);
                    roamTarget.y = homePosition.y;
                    roamTarget.z = homePosition.z;
                    PlayAnimation(roll < 0.14f ? AnimationState.Run : AnimationState.Walk);
                    autonomyTimer = UnityEngine.Random.Range(1.2f, 3.2f);
                }
                else if (roll < 0.62f)
                {
                    PlayAnimation(AnimationState.Jump);
                    autonomyTimer = 0.65f;
                }
                else if (roll < 0.73f)
                {
                    PlayAnimation(AnimationState.Tired);
                    autonomyTimer = 2f;
                }
                else
                {
                    PlayAnimation(AnimationState.Idle);
                    autonomyTimer = UnityEngine.Random.Range(1.3f, 3.4f);
                }
                break;
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
        autonomyTimer = 0f;
        PlayAnimation(AnimationState.Dragged);
    }

    private void OnMouseUp()
    {
        if (!dragging) return;
        dragging = false;
        homePosition = transform.position;
        autonomyTimer = UnityEngine.Random.Range(1f, 2.5f);
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
    /// Awards XP once per unique study-task ID. Call only after the app confirms
    /// the task transitioned from incomplete to completed.
    /// </summary>
    public bool AddCompletedStudyTaskXP(string taskId, int xpAmount)
    {
        if (string.IsNullOrWhiteSpace(taskId) || xpAmount <= 0) return false;
        taskId = taskId.Trim();
        if (!completedTaskIds.Add(taskId)) return false;

        currentXP = Mathf.Max(0, currentXP + xpAmount);
        while ((int)currentStage < (int)EvolutionStage.Stage7 &&
               currentXP >= XPRequiredForCurrentStage())
        {
            currentXP -= XPRequiredForCurrentStage();
            currentStage = (EvolutionStage)((int)currentStage + 1);
            RebuildStageAnimations();
            PlayAnimation(AnimationState.Idle);
        }

        SaveProgress();
        ProgressChanged?.Invoke(currentXP, currentStage);
        return true;
    }

    private void SaveProgress()
    {
        PlayerPrefs.SetInt(saveKey + ".xp", currentXP);
        PlayerPrefs.SetInt(saveKey + ".stage", (int)currentStage);
        PlayerPrefs.SetString(saveKey + ".tasks", string.Join("\n", completedTaskIds));
        PlayerPrefs.Save();
    }

    private void LoadProgress()
    {
        currentXP = Mathf.Max(0, PlayerPrefs.GetInt(saveKey + ".xp", currentXP));
        currentStage = (EvolutionStage)Mathf.Clamp(
            PlayerPrefs.GetInt(saveKey + ".stage", (int)currentStage),
            (int)EvolutionStage.Stage1, (int)EvolutionStage.Stage7);
        string savedTasks = PlayerPrefs.GetString(saveKey + ".tasks", "");
        foreach (string id in savedTasks.Split('\n'))
        {
            if (!string.IsNullOrWhiteSpace(id)) completedTaskIds.Add(id);
        }
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
    public void OnStudyTaskCompleted(string payload)
    {
        // Expected payload: uniqueTaskId|xpAmount. A stable task ID prevents
        // duplicate XP when the bridge fires twice or the page is refreshed.
        if (string.IsNullOrWhiteSpace(payload)) return;
        string[] parts = payload.Split('|');
        if (parts.Length != 2 || !int.TryParse(parts[1], out int xp)) return;
        AddCompletedStudyTaskXP(parts[0], xp);
    }
#endif
}
