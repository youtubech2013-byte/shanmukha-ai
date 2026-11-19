const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};
export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === "OPTIONS") return new Response(null, { headers: cors });
  if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405, headers: cors });
  if (!env.GEMINI_API_KEY) return Response.json({ error: "Server API key is not configured." }, { status: 500, headers: cors });
  try {
    const body = await request.json();
    const parts = [];
    const history = Array.isArray(body.history) ? body.history.slice(-12) : [];
    for (const item of history) {
      parts.push({ text: `${item.role === "assistant" ? "Assistant" : "User"}: ${String(item.text || "").slice(0, 5000)}` });
    }
    parts.push({ text: `You are SHANMUKHA AI, a helpful, friendly assistant. Reply in the same language as the user (Telugu or English); if they mix languages, you may mix naturally. Be clear, accurate, age-appropriate and concise. User: ${String(body.message || "Please describe this image.").slice(0, 8000)}` });
    if (body.image && body.image.data && body.image.mimeType) {
      if (!/^image\/(png|jpeg|webp)$/.test(body.image.mimeType)) throw new Error("Only PNG, JPEG and WebP images are supported.");
      if (body.image.data.length > 5_600_000) throw new Error("Image is too large.");
      parts.push({ inline_data: { mime_type: body.image.mimeType, data: body.image.data } });
    }
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL || "gemini-2.5-flash-lite"}:generateContent?key=${env.GEMINI_API_KEY}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts }], generationConfig: { temperature: 0.7, maxOutputTokens: 1800 } })
    });
    const data = await response.json();
    if (!response.ok) return Response.json({ error: data.error?.message || "Gemini API request failed." }, { status: response.status, headers: cors });
    const text = data.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("").trim();
    return Response.json({ text: text || "I couldn't create a response. Please try again." }, { headers: cors });
  } catch (err) {
    return Response.json({ error: err.message || "Unexpected server error." }, { status: 400, headers: cors });
  }
}