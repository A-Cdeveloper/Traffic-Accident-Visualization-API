// lib/validations/accidents.ts
import { z } from "zod";

// ISO date format regex: YYYY-MM-DD
const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

// Custom date validator that parses ISO date string (YYYY-MM-DD) as UTC
const isoDateSchema = z
  .string()
  .regex(isoDateRegex, "Date must be in ISO format (YYYY-MM-DD)")
  .refine(
    (val) => {
      const date = new Date(val + "T00:00:00.000Z");
      return !isNaN(date.getTime());
    },
    {
      message: "Invalid date",
    }
  )
  .transform((val) => new Date(val + "T00:00:00.000Z")); // Parse as UTC

export const accidentsQuerySchema = z
  .object({
    pstation: z
      .string()
      .min(1, "Pstation is required")
      .max(100, "Pstation name too long")
      .trim(),
    startDate: isoDateSchema.optional(),
    endDate: isoDateSchema.optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.endDate >= data.startDate;
      }
      return true;
    },
    {
      message: "startDate cannot be greater than endDate",
      path: ["startDate"],
    }
  );
