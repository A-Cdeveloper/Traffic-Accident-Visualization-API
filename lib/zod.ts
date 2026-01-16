// lib/validations/accidents.ts
import { z } from "zod";

export const accidentsQuerySchema = z.object({
  pstation: z
    .string()
    .min(1, "Pstation is required")
    .max(100, "Pstation name too long")
    .trim(),
  years: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      const years = val.split(",").map((y) => {
        const num = parseInt(y.trim(), 10);
        if (isNaN(num) || num < 2000 || num > new Date().getFullYear()) {
          throw new Error(`Invalid year: ${y.trim()}`);
        }
        return num;
      });
      return years;
    }),
});
