// lib/validations/accidents.ts
import { z } from "zod";
import { VALID_ACCIDENT_TYPES, VALID_CATEGORIES } from "@/lib/accidentLabels";

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
    accidentType: z
      .string()
      .refine(
        (val) =>
          VALID_ACCIDENT_TYPES.includes(
            val as (typeof VALID_ACCIDENT_TYPES)[number]
          ),
        {
          message: `accidentType must be one of: ${VALID_ACCIDENT_TYPES.join(
            ", "
          )}`,
        }
      )
      .optional(),
    categories: z
      .string()
      .optional()
      .transform((val) => {
        if (!val) return undefined;
        const categories = val.split(",").map((c) => c.trim());
        // Validate each category
        const invalid = categories.filter(
          (c) =>
            !VALID_CATEGORIES.includes(c as (typeof VALID_CATEGORIES)[number])
        );
        if (invalid.length > 0) {
          throw new Error(
            `Invalid categories: ${invalid.join(
              ", "
            )}. Must be one of: ${VALID_CATEGORIES.join(", ")}`
          );
        }
        return categories;
      }),
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
