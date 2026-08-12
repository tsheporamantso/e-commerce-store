import { prisma } from "@/lib/prisma";
import { formatCurrency } from "./format";

/**
 * Tool definitions for the shopping assistant agent (Anthropic Messages API format).
 * Each tool is a real read action against the store's own database — the model
 * never invents product data, it has to call one of these to get facts.
 */
export const assistantTools = [
  {
    name: "search_products",
    description:
      "Search the store's product catalog by name or company/brand. Returns matching products with id, name, company, price, and description. Use this whenever the user asks about specific items, categories, or brands.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "Search term to match against product name or company.",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_featured_products",
    description:
      "Get the store's currently featured/highlighted products. Use this when the user asks for recommendations, best sellers, or 'what should I buy'.",
    input_schema: {
      type: "object" as const,
      properties: {},
    },
  },
  {
    name: "get_product_details",
    description:
      "Get full details for a single product by its exact id. Use this after search_products or get_featured_products to answer follow-up questions about one specific item.",
    input_schema: {
      type: "object" as const,
      properties: {
        productId: {
          type: "string",
          description: "The exact product id (uuid) to look up.",
        },
      },
      required: ["productId"],
    },
  },
];

export type AssistantToolName = (typeof assistantTools)[number]["name"];

type ToolResultProduct = {
  id: string;
  name: string;
  company: string;
  price: string;
  description: string;
};

const toResultShape = (product: {
  id: string;
  name: string;
  company: string;
  price: number;
  description: string;
}): ToolResultProduct => ({
  id: product.id,
  name: product.name,
  company: product.company,
  price: formatCurrency(product.price),
  description: product.description,
});

/**
 * Executes a tool call requested by the model and returns a JSON-serializable
 * result to send back as a tool_result content block.
 */
export async function runAssistantTool(
  name: AssistantToolName,
  input: Record<string, unknown>,
): Promise<unknown> {
  switch (name) {
    case "search_products": {
      const query = typeof input.query === "string" ? input.query : "";
      const products = await prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { company: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 10,
        orderBy: { createdAt: "desc" },
      });
      return {
        count: products.length,
        products: products.map(toResultShape),
      };
    }

    case "get_featured_products": {
      const products = await prisma.product.findMany({
        where: { featured: true },
        take: 10,
      });
      return {
        count: products.length,
        products: products.map(toResultShape),
      };
    }

    case "get_product_details": {
      const productId = typeof input.productId === "string" ? input.productId : "";
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });
      if (!product) {
        return { error: `No product found with id ${productId}` };
      }
      return { product: toResultShape(product) };
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}
