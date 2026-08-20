/**
 * Minimal Anthropic Messages API client using plain fetch — no SDK dependency
 * required. Kept deliberately small so the agent loop in the route handler
 * stays easy to follow.
 */

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const DEFAULT_MODEL = "claude-sonnet-5";

export type AnthropicContentBlock =
  | { type: "text"; text: string }
  | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> }
  | { type: "tool_result"; tool_use_id: string; content: string; is_error?: boolean };

export type AnthropicMessage = {
  role: "user" | "assistant";
  content: string | AnthropicContentBlock[];
};

export type AnthropicToolDefinition = {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
};

type AnthropicResponse = {
  id: string;
  content: AnthropicContentBlock[];
  stop_reason: "end_turn" | "tool_use" | "max_tokens" | "stop_sequence" | null;
};

/**
 * MOCK MODE — for learning/testing the agent loop with zero API credits.
 *
 * Set MOCK_ANTHROPIC="true" in .env and every call to callAnthropic() below
 * will be intercepted here instead of hitting the real Anthropic API. This
 * lets you watch the full tool-use loop (decide -> act -> observe -> decide
 * again) run end to end in your terminal, for free.
 *
 * It is deliberately dumb — no real language understanding, just enough
 * pattern-matching to trigger a realistic two-step loop:
 *   Step 1: "decide" to call a tool based on keywords in the user's message.
 *   Step 2: once tool results come back, read them and write a canned reply.
 *
 * Delete this whole block (and the check in callAnthropic) once you're ready
 * to pay for real API credits — nothing else in the app needs to change.
 */
function mockAnthropicResponse(messages: AnthropicMessage[]): AnthropicResponse {
  const lastMessage = messages[messages.length - 1];

  // If the last message is an array, it's a tool_result we just sent back
  // to "Claude" — meaning this is the SECOND call in the loop. Real replies
  // are plain strings, so an array here can only be our tool results.
  const isReturningFromToolCall =
    lastMessage.role === "user" && Array.isArray(lastMessage.content);

  if (isReturningFromToolCall) {
    const toolResultBlock = (lastMessage.content as AnthropicContentBlock[]).find(
      (block): block is Extract<AnthropicContentBlock, { type: "tool_result" }> =>
        block.type === "tool_result",
    );

    console.log("[MOCK] Step 2 — reading tool result and writing a final answer");

    let summary = "[MOCK] I looked, but couldn't find anything useful.";
    if (toolResultBlock) {
      try {
        const parsed = JSON.parse(toolResultBlock.content) as {
          products?: { name: string; company: string; price: string }[];
          product?: { name: string; company: string; price: string; description: string };
          error?: string;
        };

        if (parsed.products?.length) {
          const list = parsed.products
            .map((p) => `${p.name} (${p.company}) — ${p.price}`)
            .join("; ");
          summary = `[MOCK] Here's what turned up: ${list}.`;
        } else if (parsed.products) {
          summary = "[MOCK] I searched, but nothing matched that.";
        } else if (parsed.product) {
          summary = `[MOCK] ${parsed.product.name} by ${parsed.product.company} — ${parsed.product.price}. ${parsed.product.description}`;
        } else if (parsed.error) {
          summary = `[MOCK] ${parsed.error}`;
        }
      } catch {
        // Fall back to the default summary if the tool result wasn't JSON.
      }
    }

    return {
      id: "mock-final-answer",
      stop_reason: "end_turn",
      content: [{ type: "text", text: summary }],
    };
  }

  // First call in the loop: "decide" which tool to use based on the user's
  // most recent plain-text message.
  const userText = typeof lastMessage.content === "string" ? lastMessage.content : "";
  const lower = userText.toLowerCase();

  const wantsFeatured = lower.includes("featured") || lower.includes("recommend");
  const toolName = wantsFeatured ? "get_featured_products" : "search_products";
  const toolInput = wantsFeatured ? {} : { query: userText };

  console.log(`[MOCK] Step 1 — deciding to call tool: ${toolName}`, toolInput);

  return {
    id: "mock-tool-call",
    stop_reason: "tool_use",
    content: [
      {
        type: "tool_use",
        id: `mock_tool_${Date.now()}`,
        name: toolName,
        input: toolInput,
      },
    ],
  };
}

export async function callAnthropic({
  system,
  messages,
  tools,
  maxTokens = 1024,
}: {
  system: string;
  messages: AnthropicMessage[];
  tools?: AnthropicToolDefinition[];
  maxTokens?: number;
}): Promise<AnthropicResponse> {
  if (process.env.MOCK_ANTHROPIC === "true") {
    // Simulate a bit of network latency so the "Thinking..." state in the
    // widget is visible, same as it would be with the real API.
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockAnthropicResponse(messages);
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to your .env file to use the shopping assistant.",
    );
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      max_tokens: maxTokens,
      system,
      messages,
      ...(tools ? { tools } : {}),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${errorText}`);
  }

  return response.json();
}
