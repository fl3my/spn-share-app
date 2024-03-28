import { z } from "zod";

// Define a schema for the query parameters
export const queryParamsSchema = z.object({
  daysAfterBestBefore: z
    .number({ coerce: true })
    .int()
    .nonnegative()
    .default(0),
  daysAfterProduction: z
    .number({ coerce: true })
    .int()
    .nonnegative()
    .default(7),
  category: z.string().optional(),
  searchTerm: z.string().optional(),
});
