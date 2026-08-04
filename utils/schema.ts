import { z } from "zod";

export const productSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "name must be at least more than 2 characters.",
    })
    .max(100, {
      message: "name must not exceed 100 characters.",
    }),
  company: z.string(),
  featured: z.coerce.boolean().optional().default(false),
  price: z.coerce.number().int().min(0, {
    message: "price must be a positive number.",
  }),
  description: z.string().refine(
    (description) => {
      const wordCount = description.split(" ").length;
      return wordCount >= 10 && wordCount <= 1000;
    },
    { message: "description must be between 10 and 100 words" },
  ),
});
