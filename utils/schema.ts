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

function validateImageFile() {
  const maxUploadSize = 1024 * 1024;
  const acceptedFileType = ["image/"];
  return z
    .instanceof(File)
    .refine(
      (file) => {
        return !file || file.size <= maxUploadSize;
      },
      { message: "File size must be less than 1MB" },
    )
    .refine(
      (file) => {
        return (
          !file || acceptedFileType.some((type) => file.type.startsWith(type))
        );
      },
      { message: "File must be an image" },
    );
}

export const imageSchema = z.object({
  image: validateImageFile(),
});

export function validationWithZodSchema<T>(
  schema: z.ZodType<T>,
  data: unknown,
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const error = result.error.issues.map(({ message }) => message);
    throw new Error(error.join(", "));
  }
  return result.data;
}
