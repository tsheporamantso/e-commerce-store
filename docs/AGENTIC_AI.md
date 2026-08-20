# Shopping Assistant (Agentic AI)

A chat widget, bottom-right on every page, backed by a real **tool-use agent loop**
against the Anthropic Messages API — not a single prompt/response.

## Why this counts as "agentic"

The model doesn't get product data handed to it. On each turn it decides whether
to call a tool, the server executes that tool against the live database, feeds
the result back, and the model decides again — up to 5 round-trips — before
producing a final answer. This mirrors the loop described in the roadmap:
**LLM decides → action executes → observation returned → LLM decides again.**

## Files

| File | Role |
|---|---|
| `lib/anthropic.ts` | Thin fetch wrapper around the Anthropic Messages API (no SDK dependency). |
| `utils/assistant-tools.ts` | Tool schemas + executors: `search_products`, `get_featured_products`, `get_product_details`. Each executor queries Prisma directly — the model can never invent a product. |
| `app/api/assistant/route.ts` | The agent loop itself: calls Claude, executes any requested tools, appends results, loops until Claude stops requesting tools (or a 5-step safety cap is hit). |
| `components/assistant/ShoppingAssistant.tsx` | Client chat widget. Sends the full message history each turn (the API is stateless) and renders the reply. |

## Setup

1. Get an API key at https://console.anthropic.com/
2. Add it to `.env`:
   ```
   ANTHROPIC_API_KEY="sk-ant-..."
   ```
3. Run the app as normal — the assistant button appears bottom-right on every page.

## Try it for free first — mock mode

No API key or credits needed. Add this to `.env`:
```
MOCK_ANTHROPIC="true"
```

With this set, `lib/anthropic.ts` intercepts every call that would normally
hit the real Anthropic API and returns a scripted response instead — see
`mockAnthropicResponse()` in that file. It still runs the *real* agent loop:

1. **Step 1**: the mock "decides" to call `search_products` or
   `get_featured_products` based on keywords in your message.
2. `app/api/assistant/route.ts` executes that tool for real, against your
   actual Postgres database via Prisma.
3. **Step 2**: the mock reads the real tool result and writes a canned reply
   from it.

Run `npm run dev`, open the chat widget, and watch your terminal — every
decision and tool result is logged with an `[AGENT LOOP]` / `[MOCK]` prefix,
so you can see the loop (decide → act → observe → decide again) happening
turn by turn. Once you're comfortable with the mechanics and ready to spend
real credits, just set `MOCK_ANTHROPIC="false"` (or remove it) and add your
real `ANTHROPIC_API_KEY`.

## Extending it

To give the agent a new capability, add a tool schema to `assistantTools` in
`utils/assistant-tools.ts` and a matching `case` in `runAssistantTool`. Good
next steps:
- `add_to_cart` — let the assistant add an item directly (would need to accept
  a client-side cart action rather than a server-only DB write).
- `get_order_status` — read a signed-in user's recent orders via Clerk `userId`.
- Swap the `contains` search in `search_products` for a pgvector similarity
  search once embeddings are added — same tool interface, smarter results.
