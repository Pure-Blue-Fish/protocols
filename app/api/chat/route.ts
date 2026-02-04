// ABOUTME: Streaming chat API endpoint using Gemini with function calling
// ABOUTME: Handles protocol editing/creation via tool calls

import { GoogleGenAI, FunctionCallingConfigMode, type Content } from "@google/genai";
import { buildSystemPrompt, type ChatMessage } from "@/lib/chat";
import { toolDeclarations, executeTool } from "@/lib/chat-tools";
import type { Language } from "@/lib/protocols";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
  const { messages, lang } = (await request.json()) as {
    messages: ChatMessage[];
    lang: Language;
  };

  const systemPrompt = buildSystemPrompt(lang);

  // Convert messages to Gemini format
  const contents: Content[] = messages.map((m) => ({
    role: m.role === "assistant" ? ("model" as const) : ("user" as const),
    parts: [{ text: m.content }],
  }));

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        // Initial generation with tools
        let response = await ai.models.generateContentStream({
          model: "gemini-2.5-flash",
          contents,
          config: {
            systemInstruction: systemPrompt,
            tools: [{ functionDeclarations: toolDeclarations }],
            toolConfig: {
              functionCallingConfig: {
                mode: FunctionCallingConfigMode.AUTO,
              },
            },
          },
        });

        let fullText = "";
        let functionCalls: Array<{ name: string; args: Record<string, unknown> }> = [];

        // Stream the response
        for await (const chunk of response) {
          // Check for function calls
          if (chunk.functionCalls && chunk.functionCalls.length > 0) {
            for (const fc of chunk.functionCalls) {
              if (fc.name) {
                functionCalls.push({
                  name: fc.name,
                  args: (fc.args || {}) as Record<string, unknown>,
                });
              }
            }
          }

          // Stream text content
          const text = chunk.text;
          if (text) {
            fullText += text;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
            );
          }
        }

        // Handle function calls if any
        if (functionCalls.length > 0) {
          for (const fc of functionCalls) {
            // Notify client that tool is being executed
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ toolCall: { name: fc.name, args: fc.args } })}\n\n`
              )
            );

            // Execute the tool
            const result = await executeTool(fc.name, fc.args);

            // Notify client of result
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ toolResult: result })}\n\n`
              )
            );

            // Continue conversation with tool result
            const followUpContents: Content[] = [
              ...contents,
              {
                role: "model" as const,
                parts: [
                  {
                    functionCall: {
                      name: fc.name,
                      args: fc.args,
                    },
                  },
                ],
              },
              {
                role: "user" as const,
                parts: [
                  {
                    functionResponse: {
                      name: fc.name,
                      response: result as unknown as Record<string, unknown>,
                    },
                  },
                ],
              },
            ];

            // Get follow-up response (no tools needed for this)
            const followUpResponse = await ai.models.generateContentStream({
              model: "gemini-2.5-flash",
              contents: followUpContents,
              config: {
                systemInstruction: systemPrompt,
              },
            });

            for await (const chunk of followUpResponse) {
              const text = chunk.text;
              if (text) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
                );
              }
            }
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (error) {
        console.error("Chat error:", error);
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
