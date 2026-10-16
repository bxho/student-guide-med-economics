#if UNITY_EDITOR
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

/// <summary>In-scene controls for quickly verifying all seven animation states and stages.</summary>
public sealed class StudentGuideCompanionDemoUI : MonoBehaviour
{
    private AdvancedCompanionController companion;
    private string lastAction = "اضغط زرًا لاختبار الحركة.";
    private int testTaskCounter;

    private void Awake()
    {
        companion = FindObjectOfType<AdvancedCompanionController>();
    }

    private void OnGUI()
    {
        if (companion == null) companion = FindObjectOfType<AdvancedCompanionController>();
        GUILayout.BeginArea(new Rect(12, 12, Mathf.Min(340, Screen.width - 24), Screen.height - 24), GUI.skin.box);
        GUILayout.Label("دليل الطالب — اختبار الرفيق");
        GUILayout.Label("الطور: " + (companion != null ? ((int)companion.CurrentStage + 1) + " / 7" : "—"));
        GUILayout.Label("الخبرة: " + (companion != null ? companion.CurrentXP.ToString() : "—"));
        GUILayout.Label("الحركة الحالية: " + (companion != null ? companion.CurrentState.ToString() : "—"));
        GUILayout.Space(8);
        GUILayout.Label("اختبار الحركات");
        GUILayout.BeginHorizontal();
        StateButton("خمول", AdvancedCompanionController.AnimationState.Idle);
        StateButton("مشي", AdvancedCompanionController.AnimationState.Walk);
        StateButton("ركض", AdvancedCompanionController.AnimationState.Run);
        GUILayout.EndHorizontal();
        GUILayout.BeginHorizontal();
        StateButton("قفز", AdvancedCompanionController.AnimationState.Jump);
        StateButton("تعب", AdvancedCompanionController.AnimationState.Tired);
        StateButton("نوم", AdvancedCompanionController.AnimationState.Sleep);
        GUILayout.EndHorizontal();
        GUILayout.Space(8);
        if (GUILayout.Button("إضافة 40 XP تجريبية (محلية فقط)"))
        {
            testTaskCounter++;
            bool added = companion != null && companion.AddCompletedStudyTaskXP("demo-only-" + testTaskCounter, 40);
            lastAction = added ? "أضيفت خبرة تجريبية محليًا." : "تعذر إضافة الخبرة.";
        }
        if (GUILayout.Button("اختبار منع التكرار (نفس المعرّف)"))
        {
            bool first = companion != null && companion.AddCompletedStudyTaskXP("demo-duplicate-test", 10);
            bool second = companion != null && companion.AddCompletedStudyTaskXP("demo-duplicate-test", 10);
            lastAction = first && !second ? "نجح الاختبار: لم تُحسب المهمة مرتين." : "تحقق من نتيجة الاختبار.";
        }
        if (GUILayout.Button("إعادة ضبط تقدم الاختبار"))
        {
            PlayerPrefs.DeleteKey("StudentGuide.Companion.Demo.xp");
            PlayerPrefs.DeleteKey("StudentGuide.Companion.Demo.stage");
            PlayerPrefs.DeleteKey("StudentGuide.Companion.Demo.tasks");
            PlayerPrefs.Save();
            lastAction = "أُعيد ضبط التخزين المحلي. أعد تشغيل المشهد لقراءة القيم الافتراضية.";
        }
        GUILayout.Space(8);
        GUILayout.Label(lastAction, GUI.skin.box);
        GUILayout.EndArea();
    }

    private void StateButton(string label, AdvancedCompanionController.AnimationState state)
    {
        if (GUILayout.Button(label) && companion != null)
        {
            companion.PlayAnimation(state);
            lastAction = "تم طلب حركة: " + label;
        }
    }
}
#endif
