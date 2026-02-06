// ABOUTME: Streaming AI chat endpoint for schedule management
// ABOUTME: Auto-detects provider: Gemini (default) or OpenAI fallback

import { headers } from "next/headers";
import { GoogleGenAI, FunctionCallingConfigMode, type Content } from "@google/genai";
import OpenAI from "openai";
import { buildScheduleSystemPrompt } from "@/lib/schedule-ai";
import {
  openaiToolDefinitions,
  geminiToolDeclarations,
  executeScheduleTool,
} from "@/lib/schedule-ai-tools";
import type { Language } from "@/lib/i18n";

type Provider = "gemini" | "openai";

function detectProvider(): Provider {
  if (process.env.GEMINI_API_KEY) return "gemini";
  if (process.env.OPENAI_API_KEY) return "openai";
  throw new Error("No AI API key configured. Set GEMINI_API_KEY or OPENAI_API_KEY.");
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// --- Gemini streaming ---
async function streamGemini(
  systemPrompt: string,
  messages: ChatMessage[],
  encoder: TextEncoder,
  controller: ReadableStreamDefaultController,
) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const contents: Content[] = messages.map((m) => ({
    role: m.role === "assistant" ? "model" as const : "user" as const,
    parts: [{ text: m.content }],
  }));

  const response = await ai.models.generateContentStream({
    model: "gemini-2.5-flash",
    contents,
    config: {
      systemInstruction: systemPrompt,
      tools: [{ functionDeclarations: geminiToolDeclarations }],
      toolConfig: {
        functionCallingConfig: { mode: FunctionCallingConfigMode.AUTO },
      },
    },
  });

  let fullText = "";
  const functionCalls: Array<{ name: string; args: Record<string, unknown> }> = [];

  for await (const chunk of response) {
    if (chunk.functionCalls?.length) {
      for (const fc of chunk.functionCalls) {
        if (fc.name) {
          functionCalls.push({
            name: fc.name,
            args: (fc.args || {}) as Record<string, unknown>,
          });
        }
      }
    }
    const text = chunk.text;
    if (text) {
      fullText += text;
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
    }
  }

  if (functionCalls.length > 0) {
    for (const fc of functionCalls) {
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ toolCall: { name: fc.name, args: fc.args } })}\n\n`)
      );

      const result = await executeScheduleTool(fc.name, fc.args);

      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ toolResult: result })}\n\n`)
      );

      // Follow-up with tool result
      const followUpContents: Content[] = [
        ...contents,
        {
          role: "model" as const,
          parts: [{ functionCall: { name: fc.name, args: fc.args } }],
        },
        {
          role: "user" as const,
          parts: [{ functionResponse: { name: fc.name, response: result as unknown as Record<string, unknown> } }],
        },
      ];

      const followUp = await ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents: followUpContents,
        config: { systemInstruction: systemPrompt },
      });

      for await (const chunk of followUp) {
        const text = chunk.text;
        if (text) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
        }
      }
    }
  }
}

// --- OpenAI streaming ---
async function streamOpenAI(
  systemPrompt: string,
  messages: ChatMessage[],
  encoder: TextEncoder,
  controller: ReadableStreamDefaultController,
) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  type MessageParam = { role: "system" | "user" | "assistant"; content: string | null; tool_calls?: Array<{ id: string; type: "function"; function: { name: string; arguments: string } }> } | { role: "tool"; tool_call_id: string; content: string };

  const openaiMessages: MessageParam[] = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: openaiMessages as OpenAI.ChatCompletionMessageParam[],
    tools: openaiToolDefinitions,
    tool_choice: "auto",
    stream: true,
  });

  let fullText = "";
  const toolCalls = new Map<number, { id: string; name: string; arguments: string }>();

  for await (const chunk of response) {
    const delta = chunk.choices[0]?.delta;
    if (!delta) continue;

    if (delta.content) {
      fullText += delta.content;
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: delta.content })}\n\n`));
    }

    if (delta.tool_calls) {
      for (const tc of delta.tool_calls) {
        const existing = toolCalls.get(tc.index);
        if (existing) {
          existing.arguments += tc.function?.arguments || "";
        } else {
          toolCalls.set(tc.index, {
            id: tc.id || "",
            name: tc.function?.name || "",
            arguments: tc.function?.arguments || "",
          });
        }
      }
    }
  }

  if (toolCalls.size > 0) {
    const toolResults: MessageParam[] = [];

    toolResults.push({
      role: "assistant",
      content: fullText || null,
      tool_calls: Array.from(toolCalls.values()).map((tc) => ({
        id: tc.id,
        type: "function" as const,
        function: { name: tc.name, arguments: tc.arguments },
      })),
    });

    for (const tc of toolCalls.values()) {
      let args: Record<string, unknown>;
      try { args = JSON.parse(tc.arguments); } catch { args = {}; }

      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ toolCall: { name: tc.name, args } })}\n\n`)
      );

      const result = await executeScheduleTool(tc.name, args);

      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ toolResult: result })}\n\n`)
      );

      toolResults.push({
        role: "tool",
        tool_call_id: tc.id,
        content: JSON.stringify(result),
      });
    }

    const followUp = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [...openaiMessages, ...toolResults] as OpenAI.ChatCompletionMessageParam[],
      stream: true,
    });

    for await (const chunk of followUp) {
      const text = chunk.choices[0]?.delta?.content;
      if (text) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
      }
    }
  }
}

// --- Main handler ---
export async function POST(request: Request) {
  const headerStore = await headers();
  if (headerStore.get("x-is-manager") !== "true") {
    return new Response(JSON.stringify({ error: "Manager access required" }), { status: 403 });
  }

  const { messages, week, lang } = (await request.json()) as {
    messages: ChatMessage[];
    week: string;
    lang?: Language;
  };

  const provider = detectProvider();
  const systemPrompt = await buildScheduleSystemPrompt(week, lang || "he");

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        if (provider === "gemini") {
          await streamGemini(systemPrompt, messages, encoder, controller);
        } else {
          await streamOpenAI(systemPrompt, messages, encoder, controller);
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (error) {
        console.error(`Schedule chat error (${provider}):`, error);
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: String(error) })}\n\n`)
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
