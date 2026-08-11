import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

type FieMessage = { role: "user" | "model"; text: string };

function normalizeMessages(messages: FieMessage[]) {
  const normalized: FieMessage[] = [];

  for (const message of messages) {
    const text = String(message.text ?? "").trim().slice(0, 2000);
    if (!text) continue;

    // Fie's welcome message is local UI state, so Gemini must receive a user turn first.
    if (normalized.length === 0 && message.role === "model") continue;

    const previous = normalized.at(-1);
    if (previous?.role === message.role) {
      previous.text = `${previous.text}\n${text}`.slice(0, 4000);
    } else {
      normalized.push({ role: message.role, text });
    }
  }

  return normalized;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Fie needs GEMINI_API_KEY in backend/.env.local." }, { status: 503 });
  }

  let body: { messages?: FieMessage[] };
  try {
    body = await request.json() as { messages?: FieMessage[] };
  } catch {
    return Response.json({ error: "Fie received an invalid chat request." }, { status: 400 });
  }

  const messages = normalizeMessages(Array.isArray(body.messages) ? body.messages.slice(-12) : []);
  if (!messages.some((message) => message.role === "user")) {
    return Response.json({ error: "Please send a message to Fie first." }, { status: 400 });
  }
  const contents = messages.map((message) => ({ role: message.role, parts: [{ text: message.text }] }));

  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: "You are Fie, a warm, practical assistant for skincare routines, self-care, wellness, relationships, study, work, and everyday girl-life questions. Be concise, kind, inclusive, and never shame users. For medical or urgent concerns, recommend a qualified professional. Do not diagnose skin or health conditions." }] },
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 700 },
      }),
    });

    const data = await response.json() as { error?: { message?: string }; candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    if (!response.ok) {
      const reason = data.error?.message?.replace(/\s+/g, " ").trim();
      return Response.json({ error: reason ? `Gemini refused the request: ${reason}` : "Gemini could not answer right now." }, { status: 502 });
    }

    const reply = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();
    return Response.json({ reply: reply || "I’m not sure how to answer that yet." });
  } catch {
    return Response.json({ error: "Fie could not reach Gemini. Check the backend network connection." }, { status: 502 });
  }
}
