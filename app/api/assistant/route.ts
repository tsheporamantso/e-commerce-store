import { NextRequest, NextResponse } from "next/server";
import {
  callAnthropic,
  type AnthropicContentBlock,
  type AnthropicMessage,
} from "@/lib/anthropic";
import {
  assistantTools,
  runAssistantTool,
  type AssistantToolName,
} from "@/utils/assistant-tools";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are the shopping assistant for an online furniture store.
- Only describe products by calling the provided tools. Never invent product names, prices, or descriptions.
- When you mention a product, include its name and price.
- Keep replies short and conversational (2-4 sentences), like a helpful store assistant, not a search engine dump.
- If nothing matches, say so plainly and suggest the user browse the full catalog.
- Do not answer questions unrelated to this store's products; politely redirect to shopping topics.`;

const MAX_AGENT_STEPS = 5;

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ClientRequestBody = {
  messages: ChatMessage[];
};

export async function POST(req: NextRequest) {
  let body: ClientRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: "messages array is required" }, { status: 400 });
  }

  // Convert the simple client chat history into Anthropic message format.
  const conversation: AnthropicMessage[] = body.messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const toolCallsMade: { name: string; input: Record<string, unknown> }[] = [];

  try {
    for (let step = 0; step < MAX_AGENT_STEPS; step++) {
      const response = await callAnthropic({
        system: SYSTEM_PROMPT,
        messages: conversation,
        tools: assistantTools,
      });

      // Agent loop terminates once Claude responds without requesting a tool.
      if (response.stop_reason !== "tool_use") {
        const reply = response.content
          .filter((block): block is Extract<AnthropicContentBlock, { type: "text" }> =>
            block.type === "text",
          )
          .map((block) => block.text)
          .join("\n")
          .trim();

        return NextResponse.json({
          reply: reply || "I couldn't find an answer to that — try rephrasing?",
          toolCalls: toolCallsMade,
        });
      }

      // Record the assistant turn (including its tool_use blocks) in the conversation.
      conversation.push({ role: "assistant", content: response.content });

      // Execute every requested tool call and feed results back as a user turn.
      const toolResultBlocks: AnthropicContentBlock[] = [];
      for (const block of response.content) {
        if (block.type !== "tool_use") continue;

        toolCallsMade.push({ name: block.name, input: block.input });

        let resultPayload: unknown;
        try {
          resultPayload = await runAssistantTool(
            block.name as AssistantToolName,
            block.input,
          );
        } catch (toolError) {
          resultPayload = {
            error: toolError instanceof Error ? toolError.message : "Tool execution failed",
          };
        }

        toolResultBlocks.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: JSON.stringify(resultPayload),
        });
      }

      conversation.push({ role: "user", content: toolResultBlocks });
    }

    // Safety valve: too many tool round-trips without a final answer.
    return NextResponse.json({
      reply:
        "I looked into a few things but couldn't wrap up an answer — could you narrow down what you're after?",
      toolCalls: toolCallsMade,
    });
  } catch (error) {
    console.error("Assistant agent error:", error);
    const message = error instanceof Error ? error.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
