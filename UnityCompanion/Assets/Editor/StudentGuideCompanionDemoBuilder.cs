#if UNITY_EDITOR
using System;
using System.IO;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

/// <summary>
/// Creates a complete, procedural pixel-art demo rig so the companion can be
/// previewed without a separately supplied sprite sheet. Run from Tools menu.
/// </summary>
public static class StudentGuideCompanionDemoBuilder
{
    private const int Size = 64;
    private const string Root = "Assets/StudentGuideCompanionDemo";
    private const string SpritesRoot = Root + "/Sprites";
    private const string ScenePath = Root + "/CompanionDemo.unity";
    private static readonly string[] States =
        { "Idle", "Walk", "Run", "Jump", "Dragged", "Tired", "Sleep" };

    [MenuItem("Tools/Student Guide/Build Companion Demo (7 Stages)")]
    public static void BuildDemo()
    {
        Directory.CreateDirectory(SpritesRoot);
        for (int stage = 1; stage <= 7; stage++)
        {
            string stageFolder = SpritesRoot + "/Stage" + stage;
            Directory.CreateDirectory(stageFolder);
            foreach (string state in States)
            {
                string stateFolder = stageFolder + "/" + state;
                Directory.CreateDirectory(stateFolder);
                for (int frame = 0; frame < 3; frame++)
                {
                    string path = stateFolder + "/frame_" + frame + ".png";
                    File.WriteAllBytes(path, DrawFrame(stage, state, frame).EncodeToPNG());
                    UnityEngine.Object.DestroyImmediate(LoadTextureForDestroy(path));
                    AssetDatabase.ImportAsset(path, ImportAssetOptions.ForceUpdate);
                    ConfigureSprite(path);
                }
            }
        }

        AssetDatabase.Refresh();
        CreateDemoScene();
        Debug.Log("Student Guide companion demo created. Open Assets/StudentGuideCompanionDemo/CompanionDemo.unity and press Play.");
    }

    private static Texture2D LoadTextureForDestroy(string path)
    {
        // Textures are not loaded by EncodeToPNG; this method is a harmless null guard.
        return null;
    }

    private static void ConfigureSprite(string path)
    {
        var importer = AssetImporter.GetAtPath(path) as TextureImporter;
        if (importer == null) return;
        importer.textureType = TextureImporterType.Sprite;
        importer.spriteImportMode = SpriteImportMode.Single;
        importer.filterMode = FilterMode.Point;
        importer.textureCompression = TextureImporterCompression.Uncompressed;
        importer.alphaIsTransparency = true;
        importer.spritePixelsPerUnit = Size;
        importer.SaveAndReimport();
    }

    private static Texture2D DrawFrame(int stage, string state, int frame)
    {
        var t = new Texture2D(Size, Size, TextureFormat.RGBA32, false);
        t.filterMode = FilterMode.Point;
        var clear = new Color32(0, 0, 0, 0);
        var p = new Color32[Size * Size];
        for (int i = 0; i < p.Length; i++) p[i] = clear;
        Color32 outline = new Color32(34, 39, 67, 255);
        Color32 body = StageColor(stage);
        Color32 light = new Color32(244, 249, 255, 255);
        Color32 accent = AccentColor(stage);
        int bob = state == "Jump" ? 9 : state == "Sleep" ? -2 : state == "Dragged" ? -1 :
                  (state == "Idle" && frame == 1 ? 1 : state == "Walk" || state == "Run" ? frame % 2 : 0);
        int cx = 32;
        int cy = 29 + bob;
        if (state == "Dragged") cx += frame - 1;

        // Stage-specific ears / antennae / horns, with a visible silhouette upgrade every stage.
        if (stage == 1) { Ellipse(p, cx - 15, cy + 10, 8, 11, outline); Ellipse(p, cx + 7, cy + 10, 8, 11, outline); }
        if (stage >= 2) { Triangle(p, cx - 15, cy + 12, cx - 9, cy + 25, cx - 3, cy + 12, outline); Triangle(p, cx + 3, cy + 12, cx + 9, cy + 25, cx + 15, cy + 12, outline); }
        if (stage >= 4) { Rect(p, cx - 22, cy + 11, cx - 17, cy + 21, accent); Rect(p, cx + 17, cy + 11, cx + 22, cy + 21, accent); }
        if (stage >= 6) { Triangle(p, cx - 16, cy + 18, cx - 25, cy + 32, cx - 8, cy + 26, light); Triangle(p, cx + 8, cy + 26, cx + 25, cy + 32, cx + 16, cy + 18, light); }
        if (stage == 7) { Rect(p, cx - 8, cy + 26, cx - 4, cy + 32, accent); Rect(p, cx - 3, cy + 29, cx + 3, cy + 35, accent); Rect(p, cx + 4, cy + 26, cx + 8, cy + 32, accent); }

        // Feet react to the animation state.
        int leftFootY = cy - 19 + (state == "Run" && frame == 1 ? 4 : state == "Jump" ? 7 : 0);
        int rightFootY = cy - 19 + (state == "Run" && frame == 2 ? 4 : state == "Jump" ? 7 : 0);
        if (state == "Sleep") { leftFootY = cy - 18; rightFootY = cy - 18; }
        Rect(p, cx - 12, leftFootY - 6, cx - 3, leftFootY + 1, outline);
        Rect(p, cx + 3, rightFootY - 6, cx + 12, rightFootY + 1, outline);
        Rect(p, cx - 10, leftFootY - 4, cx - 4, leftFootY, accent);
        Rect(p, cx + 4, rightFootY - 4, cx + 10, rightFootY, accent);

        Ellipse(p, cx - 18, cy - 2, 36, 33, outline);
        Ellipse(p, cx - 15, cy, 30, 28, body);
        Ellipse(p, cx - 10, cy - 8, 20, 13, light);

        // Face changes for tired / sleeping / happy idle and movement.
        if (state == "Sleep")
        {
            Rect(p, cx - 10, cy + 3, cx - 5, cy + 4, outline);
            Rect(p, cx + 5, cy + 3, cx + 10, cy + 4, outline);
            Rect(p, cx - 2, cy - 3, cx + 3, cy - 2, outline);
            Rect(p, cx + 16, cy + 18, cx + 20, cy + 23, accent);
            Rect(p, cx + 21, cy + 24, cx + 25, cy + 29, accent);
        }
        else if (state == "Tired")
        {
            Rect(p, cx - 10, cy + 2, cx - 4, cy + 3, outline);
            Rect(p, cx + 4, cy + 2, cx + 10, cy + 3, outline);
            Rect(p, cx - 3, cy - 5, cx + 4, cy - 4, outline);
        }
        else
        {
            Rect(p, cx - 10, cy + 1, cx - 6, cy + 7, outline);
            Rect(p, cx + 6, cy + 1, cx + 10, cy + 7, outline);
            Rect(p, cx - 7, cy + 4, cx - 6, cy + 6, light);
            Rect(p, cx + 7, cy + 4, cx + 8, cy + 6, light);
            Rect(p, cx - 3, cy - 4, cx + 3, cy - 2, outline);
            if (state == "Run" || state == "Jump") Rect(p, cx - 2, cy - 6, cx + 3, cy - 4, outline);
        }

        // Pixel accents and stage aura.
        Rect(p, cx - 15, cy - 4, cx - 12, cy - 1, accent);
        Rect(p, cx + 12, cy - 4, cx + 15, cy - 1, accent);
        if (stage >= 3) { Rect(p, cx - 24, cy + 1, cx - 20, cy + 5, accent); Rect(p, cx + 20, cy + 1, cx + 24, cy + 5, accent); }
        if (stage >= 5) { Rect(p, cx - 22, cy - 10, cx - 18, cy - 6, light); Rect(p, cx + 18, cy - 10, cx + 22, cy - 6, light); }
        if (state == "Jump") { Rect(p, cx - 25, cy - 1, cx - 21, cy + 3, accent); Rect(p, cx + 21, cy - 1, cx + 25, cy + 3, accent); }
        if (state == "Dragged") { Rect(p, cx - 27, cy + 6, cx - 23, cy + 10, accent); Rect(p, cx + 23, cy - 4, cx + 27, cy, accent); }

        t.SetPixels32(p);
        t.Apply(false, false);
        return t;
    }

    private static Color32 StageColor(int stage)
    {
        Color32[] colors = {
            new Color32(0,0,0,0), new Color32(112,198,255,255),
            new Color32(103,224,198,255), new Color32(164,151,255,255),
            new Color32(255,179,111,255), new Color32(255,129,174,255),
            new Color32(130,224,255,255), new Color32(255,224,115,255)
        };
        return colors[Mathf.Clamp(stage, 1, 7)];
    }

    private static Color32 AccentColor(int stage)
    {
        Color32[] colors = {
            new Color32(0,0,0,0), new Color32(255,244,177,255),
            new Color32(63,174,161,255), new Color32(111,87,221,255),
            new Color32(235,112,70,255), new Color32(219,72,136,255),
            new Color32(49,151,213,255), new Color32(255,174,55,255)
        };
        return colors[Mathf.Clamp(stage, 1, 7)];
    }

    private static void Set(Color32[] p, int x, int y, Color32 c)
    {
        if (x >= 0 && x < Size && y >= 0 && y < Size) p[y * Size + x] = c;
    }

    private static void Rect(Color32[] p, int x0, int y0, int x1, int y1, Color32 c)
    {
        for (int y = y0; y <= y1; y++)
            for (int x = x0; x <= x1; x++) Set(p, x, y, c);
    }

    private static void Ellipse(Color32[] p, int cx, int cy, int rx, int ry, Color32 c)
    {
        float rxx = Mathf.Max(1, rx * rx);
        float ryy = Mathf.Max(1, ry * ry);
        for (int y = cy - ry; y <= cy + ry; y++)
            for (int x = cx - rx; x <= cx + rx; x++)
            {
                float dx = x - cx, dy = y - cy;
                if (dx * dx / rxx + dy * dy / ryy <= 1f) Set(p, x, y, c);
            }
    }

    private static void Triangle(Color32[] p, int x1, int y1, int x2, int y2, int x3, int y3, Color32 c)
    {
        int minX = Mathf.Min(x1, Mathf.Min(x2, x3)), maxX = Mathf.Max(x1, Mathf.Max(x2, x3));
        int minY = Mathf.Min(y1, Mathf.Min(y2, y3)), maxY = Mathf.Max(y1, Mathf.Max(y2, y3));
        float denom = (y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3);
        if (Mathf.Abs(denom) < 0.001f) return;
        for (int y = minY; y <= maxY; y++)
            for (int x = minX; x <= maxX; x++)
            {
                float a = ((y2 - y3) * (x - x3) + (x3 - x2) * (y - y3)) / denom;
                float b = ((y3 - y1) * (x - x3) + (x1 - x3) * (y - y3)) / denom;
                float c3 = 1f - a - b;
                if (a >= 0 && b >= 0 && c3 >= 0) Set(p, x, y, c);
            }
    }

    private static void CreateDemoScene()
    {
        var scene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);
        var camera = Camera.main;
        if (camera != null)
        {
            camera.orthographic = true;
            camera.orthographicSize = 3.2f;
            camera.transform.position = new Vector3(0, 0, -10);
            camera.backgroundColor = new Color(0.08f, 0.11f, 0.2f);
            camera.clearFlags = CameraClearFlags.SolidColor;
        }

        var companion = new GameObject("StudentGuideCompanion");
        companion.transform.position = Vector3.zero;
        companion.transform.localScale = new Vector3(2.5f, 2.5f, 1f);
        companion.AddComponent<SpriteRenderer>();
        companion.AddComponent<BoxCollider2D>();
        var controller = companion.AddComponent<AdvancedCompanionController>();

        var serialized = new SerializedObject(controller);
        var stages = serialized.FindProperty("allStagesData");
        stages.arraySize = 7;
        for (int s = 0; s < 7; s++)
        {
            var stageData = stages.GetArrayElementAtIndex(s);
            stageData.FindPropertyRelative("stage").enumValueIndex = s;
            var animations = stageData.FindPropertyRelative("animations");
            animations.arraySize = States.Length;
            for (int a = 0; a < States.Length; a++)
            {
                var clip = animations.GetArrayElementAtIndex(a);
                clip.FindPropertyRelative("state").enumValueIndex = a;
                clip.FindPropertyRelative("frameRate").floatValue = States[a] == "Run" ? 12f : States[a] == "Sleep" ? 3f : 7f;
                clip.FindPropertyRelative("loop").boolValue = true;
                var frames = clip.FindPropertyRelative("frames");
                frames.arraySize = 3;
                for (int f = 0; f < 3; f++)
                {
                    string path = SpritesRoot + "/Stage" + (s + 1) + "/" + States[a] + "/frame_" + f + ".png";
                    frames.GetArrayElementAtIndex(f).objectReferenceValue = AssetDatabase.LoadAssetAtPath<Sprite>(path);
                }
            }
        }
        serialized.ApplyModifiedPropertiesWithoutUndo();
        EditorUtility.SetDirty(controller);
        EditorSceneManager.MarkSceneDirty(scene);
        Directory.CreateDirectory(Root);
        EditorSceneManager.SaveScene(scene, ScenePath);
        AssetDatabase.SaveAssets();
        Selection.activeGameObject = companion;
    }
}
#endif
