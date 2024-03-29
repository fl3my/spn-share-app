import { z } from "zod";
import { DeliveryMethod } from "../models/enums";

export const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  postcode: z.string(),
});

export const newRequestSchema = z.object({
  donationItemId: z.string(),
  deliveryMethod: z.nativeEnum(DeliveryMethod),
  address: addressSchema,
  additionalNotes: z.string().optional(),
  dateTimeRange: z
    .object({
      start: z.coerce.date(),
      end: z.coerce.date(),
    })
    .refine(
      ({ start, end }) => {
        // Convert dates to YYYY-MM-DD format
        const startDate = start.toISOString().split("T")[0];
        const endDate = end.toISOString().split("T")[0];

        // Check if the dates are the same
        return startDate === endDate;
      },
      {
        message: "Start and end dates must be on the same day",
      }
    )
    .refine(
      ({ start, end }) => {
        // Check if the end date is after the start date
        return end >= start;
      },
      {
        message: "End date cannot be before start date",
      }
    ),
});
