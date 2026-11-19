// Optional image-generation endpoint. The configured Gemini image model may require paid billing.
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" };
export async function onRequest({ request, env }) {
  if (request.method === "OPTIONS") return new Response(null, { headers: cors });
  if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405, headers: cors });
  if (!env.GEMINI_API_KEY) return Response.json({ error: "Server API key is not configured." }, { status: 500, headers: cors });
  try {
    const { prompt } = await request.json();
    if (!prompt || typeof prompt !== "string") throw new Error("Enter an image description.");
    const model = env.GEMINI_IMAGE_MODEL || "gemini-3.1-flash-image";
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: `Generate an image: ${prompt.slice(0, 2000)}` }] }] })
    });
    const data = await r.json();
    if (!r.ok) return Response.json({ error: data.error?.message || "Image model unavailable. This model may require paid billing." }, { status: r.status, headers: cors });
    const part = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData?.data || p.inline_data?.data);
    const inline = part?.inlineData || part?.inline_data;
    if (!inline) return Response.json({ error: "No image returned. Check image-model access and billing." }, { status: 502, headers: cors });
    return Response.json({ mimeType: inline.mimeType || inline.mime_type || "image/png", data: inline.data }, { headers: cors });
  } catch (e) { return Response.json({ error: e.message }, { status: 400, headers: cors }); }
}
