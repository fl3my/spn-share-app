import { z } from "zod";

import {
  Category,
  DateType,
  MeasurementType,
  StorageRequirement,
} from "../models/enums";

export const measurementSchema = z.object({
  type: z.nativeEnum(MeasurementType),
  value: z.coerce.number().min(1).max(100),
});

export const dateInfoSchema = z
  .object({
    dateType: z.nativeEnum(DateType),
    date: z.coerce.date(),
  })
  .refine(
    (data) => {
      const currentDate = new Date();

      // Set to start of date
      currentDate.setHours(0, 0, 0, 0);

      // Use by dates cannot be in the past
      if (data.dateType === DateType.USE_BY && data.date < currentDate) {
        return false;
      }

      return true;
    },
    {
      message: "'Use by' dates cannot be in the past.",
    }
  )
  .refine(
    (data) => {
      // Set date 7 days before
      const bestBeforeDate = new Date();
      bestBeforeDate.setHours(0, 0, 0, 0);
      bestBeforeDate.setDate(bestBeforeDate.getDate() - 7);

      // Best before dates must be from 7 days before onwards
      if (
        data.dateType === DateType.BEST_BEFORE &&
        data.date < bestBeforeDate
      ) {
        return false;
      }

      return true;
    },
    {
      message: "'Best before' dates cannot be more than 7 days old.",
    }
  )
  .refine(
    (data) => {
      const currentDate = new Date();

      // Set to start of day
      currentDate.setHours(0, 0, 0, 0);

      // Production date cannot be in the future
      if (
        data.dateType === DateType.PRODUCTION_DATE &&
        data.date > currentDate
      ) {
        return false;
      }

      return true;
    },
    {
      message: "'Production date' cannot be in the future.",
    }
  );

const addressSchema = z.object({
  street: z.string().min(2),
  city: z.string().min(2),
  postcode: z.string().min(2),
});

export const donationItemSchema = z.object({
  name: z.string(),
  description: z.string(),
  storageRequirement: z.nativeEnum(StorageRequirement),
  category: z.nativeEnum(Category),
  measurement: measurementSchema,
  dateInfo: dateInfoSchema,
  address: addressSchema,
});

export const updateDonationItemSchema = z.object({
  name: z.string(),
  description: z.string(),
  storageRequirement: z.nativeEnum(StorageRequirement),
  category: z.nativeEnum(Category),
  measurement: measurementSchema,
  dateInfo: dateInfoSchema,
});
