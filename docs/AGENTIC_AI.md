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

## Extending it

To give the agent a new capability, add a tool schema to `assistantTools` in
`utils/assistant-tools.ts` and a matching `case` in `runAssistantTool`. Good
next steps:
- `add_to_cart` — let the assistant add an item directly (would need to accept
  a client-side cart action rather than a server-only DB write).
- `get_order_status` — read a signed-in user's recent orders via Clerk `userId`.
- Swap the `contains` search in `search_products` for a pgvector similarity
  search once embeddings are added — same tool interface, smarter results.
