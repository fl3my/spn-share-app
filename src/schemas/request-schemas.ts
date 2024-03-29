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
});
