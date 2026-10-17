// Authenticated study companion AI proxy. Keep GEMINI_API_KEY in Supabase Edge Function secrets only.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: corsHeaders });
const requestCounts = new Map<string, { count: number; start: number }>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 12;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "الطريقة غير مدعومة." }, 405);

  const authorization = req.headers.get("authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) return json({ error: "سجّل الدخول أولًا لاستخدام المساعد." }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const geminiKey = Deno.env.get("GEMINI_API_KEY");
  if (!supabaseUrl || !anonKey) return json({ error: "إعداد التحقق من الحساب غير مكتمل." }, 503);
  if (!geminiKey) return json({ error: "لم يُضف سر GEMINI_API_KEY في إعدادات Supabase Edge Functions." }, 503);

  let userId: string;
  try {
    const authRes = await fetch(supabaseUrl + "/auth/v1/user", {
      headers: { apikey: anonKey, Authorization: "Bearer " + match[1] },
    });
    if (!authRes.ok) return json({ error: "انتهت جلسة الدخول؛ سجّل الدخول مجددًا." }, 401);
    const user = await authRes.json();
    if (typeof user?.id !== "string") return json({ error: "تعذر التحقق من الحساب." }, 401);
    userId = user.id;
  } catch {
    return json({ error: "تعذر التحقق من جلسة الحساب." }, 502);
  }

  const now = Date.now();
  const bucket = requestCounts.get(userId);
  if (bucket && now - bucket.start < WINDOW_MS && bucket.count >= MAX_PER_WINDOW) {
    return json({ error: "وصلت للحد المؤقت: 12 رسالة في الدقيقة. انتظر قليلًا ثم حاول." }, 429);
  }
  if (!bucket || now - bucket.start >= WINDOW_MS) requestCounts.set(userId, { count: 1, start: now });
  else bucket.count++;

  let body: { messages?: unknown };
  try {
    const raw = await req.text();
    if (raw.length > 45_000) return json({ error: "الطلب طويل جدًا؛ قسّم المحاضرة إلى أجزاء أصغر." }, 413);
    body = JSON.parse(raw);
  } catch {
    return json({ error: "صيغة الطلب غير صحيحة." }, 400);
  }
  if (!Array.isArray(body.messages)) return json({ error: "أرسل رسائل المحادثة أولًا." }, 400);

  const messages = body.messages.slice(-8).flatMap((m: any) => {
    if (!m || !["user", "assistant"].includes(m.role) || typeof m.content !== "string") return [];
    const content = m.content.trim().slice(0, 40_000);
    return content ? [{ role: m.role, content }] : [];
  });
  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return json({ error: "اكتب رسالة جديدة للمساعد." }, 400);
  }

  const systemPrompt = `أنت رفيق دراسة عربي ودود داخل تطبيق دليل الطالب لطلاب الطب والاقتصاد.
أجب باللغة العربية الواضحة، واستخدم الإنجليزية فقط عند الحاجة للمصطلحات العلمية.
ساعد في شرح المفاهيم، بناء خطط المذاكرة، الأسئلة التدريبية، التذكر النشط، وتنظيم الوقت.
كن دقيقًا؛ إذا لم تكن متأكدًا فصرّح بذلك ولا تختلق مراجع أو حقائق. في موضوعات الطب، قدّم شرحًا تعليميًا عامًا لا تشخيصًا أو وصفة علاجية شخصية، ووجّه الحالات الطارئة إلى الرعاية الطبية العاجلة.
لا تدّع أنك قرأت ملفات الطالب أو بياناته؛ لا تصلك إلا رسائل المحادثة المرسلة هنا.
اجعل الرد مفيدًا ومباشرًا ومنظمًا، وبحد أقصى نحو 500 كلمة.`;

  try {
    const prompt = [
      { role: "system", content: systemPrompt },
      ...messages,
    ].map((m) => (m.role === "assistant" ? "المساعد: " : "المستخدم: ") + m.content).join("\n\n");
    const aiRes = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent", {
      method: "POST",
      headers: { "x-goog-api-key": geminiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 6000 },
      }),
    });
    const result = await aiRes.json().catch(() => ({}));
    if (!aiRes.ok) {
      console.error("Gemini provider error", aiRes.status, result?.error?.status || "provider_error");
      if (aiRes.status === 400 || aiRes.status === 403) return json({ error: "تعذر استخدام Gemini. تحقق من صلاحية المفتاح وإعدادات Google AI Studio." }, 502);
      if (aiRes.status === 404) return json({ error: "النموذج غير متاح لهذا المشروع. تحقق من نماذج Gemini المتاحة لمفتاحك." }, 502);
      if (aiRes.status === 429) return json({ error: "وصل استخدام Gemini إلى الحد المؤقت المجاني؛ انتظر قليلًا ثم حاول." }, 503);
      return json({ error: "تعذر إكمال الرد الآن. حاول مرة أخرى بعد قليل." }, 502);
    }
    const reply = result?.candidates?.[0]?.content?.parts?.map((p: any) => typeof p.text === "string" ? p.text : "").join("");
    if (typeof reply !== "string" || !reply.trim()) return json({ error: "لم يصل رد صالح من Gemini." }, 502);
    return json({ reply: reply.trim() });
  } catch {
    return json({ error: "تعذر الاتصال بخدمة الذكاء الاصطناعي." }, 502);
  }
});
