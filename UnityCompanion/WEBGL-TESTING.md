# تجهيز تجربة الرفيق الإلكتروني

## الحالة الحالية
هذه الملفات تجهّز الربط، لكنها **ليست نسخة WebGL مبنية ولا تعني أن Unity يعمل داخل الموقع**. يلزم Unity Editor وملفات الصور الأصلية لتوليد نسخة قابلة للتشغيل.

## ملفات التجهيز
- `Assets/Scripts/AdvancedCompanionController.cs`: منطق الشخصية والحركات ومراحل التطور.
- `companion-webgl-bridge.js`: جسر يرسل إنجاز المهمة إلى كائن Unity بعد اكتمال المهمة.
- `README.md`: خطوات إعداد مشروع Unity.

## خطوات بناء نسخة قابلة للتجربة
1. افتح Unity Hub وأنشئ مشروع 2D متوافقًا مع إصدار Unity الذي تستخدمه.
2. انسخ مجلد `Assets` إلى المشروع.
3. أضف صور الشخصيات الأصلية إلى المشروع؛ لا توجد ورقة رسوم مقسّمة مضمّنة في هذا المستودع حتى الآن.
4. استورد الصور كـ Sprites، واستخدم Sprite Editor لتقسيم الإطارات.
5. أنشئ كائنًا باسم `StudentGuideCompanion` وأضف إليه `SpriteRenderer` و`BoxCollider2D` و`AdvancedCompanionController`.
6. املأ بيانات الحركات لكل واحد من الأطوار السبعة، ثم اختبر Idle وWalk وRun وJump وDragged وTired وSleep داخل Unity Editor.
7. من Build Profiles اختر WebGL وأنشئ البناء.
8. ضع ناتج البناء في مسار مخصص، ثم حمّل ملف `companion-webgl-bridge.js` في صفحة التطبيق بعد ملف Unity loader.
9. بعد إنشاء Unity instance، اربطه عبر:
   ```js
   window.studentGuideCompanionBridge.attach(unityInstance, 'StudentGuideCompanion');
   ```
10. من مسار إنجاز المهمة الحقيقي فقط، أرسل المعرّف الفريد ومقدار XP:
    ```js
    window.studentGuideCompanionBridge.onStudyTaskCompleted(taskId, xpAmount);
    ```
11. اختبر أن المهمة نفسها لا تمنح XP مرتين، وأن جميع الحالات والمراحل تعمل، على الهاتف والكمبيوتر، قبل نشر البناء.

## حدود الجسر
- لا يمنح الجسر XP بنفسه؛ إنه يرسل الإشارة فقط. يجب أن يستدعيه التطبيق عند انتقال مهمة دراسية حقيقية من غير مكتملة إلى مكتملة.
- يمنع الجسر معرّف المهمة الفارغ أو الذي يحتوي على فاصل الرسالة، ويرفض XP غير الصحيح.
- لا يوجد Unity instance متاح قبل تحميل WebGL، لذا تعيد الدالة سببًا واضحًا بدل الادعاء بإرسال XP.
- لا تدمج هذه الملفات في `main` قبل نجاح البناء والاختبار ومراجعة المستخدم.
