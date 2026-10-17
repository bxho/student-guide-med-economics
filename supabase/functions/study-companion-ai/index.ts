// Authenticated study companion AI proxy. Keep OPENAI_API_KEY in Supabase Edge Function secrets only.
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
  const openAiKey = Deno.env.get("OPENAI_API_KEY");
  if (!supabaseUrl || !anonKey) return json({ error: "إعداد التحقق من الحساب غير مكتمل." }, 503);
  if (!openAiKey) return json({ error: "لم يُضف مسؤول المشروع سر OPENAI_API_KEY في إعدادات Edge Functions بعد." }, 503);

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
    if (raw.length > 40_000) return json({ error: "المحاضرة طويلة جدًا لطلب واحد؛ قسّمها إلى أجزاء أصغر." }, 413);
    body = JSON.parse(raw);
  } catch {
    return json({ error: "صيغة الطلب غير صحيحة." }, 400);
  }
  if (!Array.isArray(body.messages)) return json({ error: "أرسل رسائل المحادثة أولًا." }, 400);

  const messages = body.messages.slice(-8).flatMap((m: any) => {
    if (!m || !["user", "assistant"].includes(m.role) || typeof m.content !== "string") return [];
    const content = m.content.trim().slice(0, 32_000);
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
اجعل الرد مفيدًا ومباشرًا ومنظمًا. إذا طلب المستخدم JSON فأخرج JSON صالحًا فقط دون Markdown. عند تحليل محاضرة، استخدم النص المرسل وحده ولا تختلق معلومات؛ أنشئ نقاطًا وأسئلة استرجاع نشط مفيدة بدل نسخ الجمل حرفيًا.`;

  try {
    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: "Bearer " + openAiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        temperature: 0.25,
        max_tokens: 3000,
      }),
    });
    const result = await aiRes.json().catch(() => ({}));
    if (!aiRes.ok) {
      console.error("OpenAI provider error", aiRes.status, result?.error?.code || "provider_error");
      if (aiRes.status === 401) return json({ error: "مفتاح مزود الذكاء الاصطناعي غير صالح؛ راجع السر في Supabase." }, 502);
      if (aiRes.status === 429) return json({ error: "وصل حساب النموذج إلى حد الاستخدام أو الرصيد. تحقق من إعدادات المزود." }, 503);
      return json({ error: "تعذر إكمال الرد الآن. حاول مرة أخرى بعد قليل." }, 502);
    }
    const reply = result?.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim()) return json({ error: "لم يصل رد صالح من النموذج." }, 502);
    return json({ reply: reply.trim() });
  } catch {
    return json({ error: "تعذر الاتصال بخدمة الذكاء الاصطناعي." }, 502);
  }
});
