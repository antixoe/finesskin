import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Fie needs GEMINI_API_KEY in backend/.env.local." }, { status: 503 });
  }

  const body = await request.json() as { messages?: Array<{ role: "user" | "model"; text: string }> };
  const messages = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
  const contents = messages.map((message) => ({ role: message.role, parts: [{ text: String(message.text).slice(0, 2000) }] }));

  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: "You are Fie, a warm, practical assistant for skincare routines, self-care, wellness, relationships, study, work, and everyday girl-life questions. Be concise, kind, inclusive, and never shame users. For medical or urgent concerns, recommend a qualified professional. Do not diagnose skin or health conditions." }] },
      contents,
      generationConfig: { temperature: 0.7, maxOutputTokens: 700 },
    }),
  });

  if (!response.ok) return Response.json({ error: "Gemini could not answer right now." }, { status: 502 });
  const data = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  return Response.json({ reply: data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "I’m not sure how to answer that yet." });
}
