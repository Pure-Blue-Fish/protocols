// ABOUTME: Streaming chat API endpoint using Gemini 2.5 Flash Preview
// ABOUTME: Uses OpenAI compatibility layer for cleaner system message support

import OpenAI from "openai";
import { buildSystemPrompt, type ChatMessage } from "@/lib/chat";
import type { Language } from "@/lib/protocols";

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

export async function POST(request: Request) {
  const { messages, lang } = (await request.json()) as {
    messages: ChatMessage[];
    lang: Language;
  };

  const systemPrompt = buildSystemPrompt(lang);

  // Convert to OpenAI format
  const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  const stream = await openai.chat.completions.create({
    model: "gemini-2.5-flash-preview-05-20",
    messages: openaiMessages,
    stream: true,
  });

  // Return SSE stream
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content;
          if (text) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
            );
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (error) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: String(error) })}\n\n`
          )
        );
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
