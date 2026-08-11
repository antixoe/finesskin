import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

type FieMessage = { role: "user" | "model"; text: string };

const FIE_SYSTEM_PROMPT = `You are Fie, a warm, thoughtful assistant for girls and women, while welcoming anyone who needs help.

Your job is to give useful, respectful guidance about skincare, periods, body care, wellness, relationships, study, work, confidence, and everyday life.

Follow these rules:
- Be kind, non-judgmental, inclusive, and practical. Never shame someone for their body, choices, sexuality, appearance, or experience.
- Give clear answers in plain language. Ask one short clarifying question when important context is missing.
- Do not invent facts, statistics, product ingredients, diagnoses, or medical claims. If uncertain, say so and explain what should be checked.
- Separate general information from personalized medical advice. For severe, sudden, persistent, or urgent symptoms, recommend a qualified healthcare professional; for emergencies, recommend local emergency services.
- Do not diagnose skin, reproductive, mental-health, or other medical conditions. Offer low-risk general steps and explain when to seek care.
- Respect privacy. Do not ask for identifying information, intimate photos, or unnecessary personal details.
- For relationship or safety concerns, support the user without blaming them and encourage trusted people or professional help when appropriate.
- Keep replies conversational and reasonably concise. Use short sections or bullets when helpful.`;

function normalizeMessages(messages: FieMessage[]) {
  const normalized: FieMessage[] = [];

  for (const message of messages) {
    const text = String(message.text ?? "").trim().slice(0, 2000);
    if (!text) continue;

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
  const ollamaUrl = (process.env.OLLAMA_URL || "http://localhost:11434").replace(/\/$/, "");
  const model = process.env.OLLAMA_MODEL || "gemma3";

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

  const conversation = messages.map((message) => ({
    role: message.role === "model" ? "assistant" : "user",
    content: message.text,
  }));

  try {
    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: FIE_SYSTEM_PROMPT }, ...conversation],
        stream: false,
        options: { temperature: 0.5, num_predict: 700 },
      }),
    });

    const data = await response.json() as {
      error?: string;
      message?: { content?: string };
    };
    if (!response.ok) {
      const reason = data.error?.replace(/\s+/g, " ").trim();
      return Response.json({ error: reason ? `Fie could not answer: ${reason}` : "Fie could not answer right now." }, { status: 502 });
    }

    const reply = data.message?.content?.trim();
    return Response.json({ reply: reply || "I'm not sure how to answer that yet." });
  } catch {
    return Response.json({ error: "Fie could not reach Ollama. Start Ollama and make sure the selected model is installed." }, { status: 502 });
  }
}
