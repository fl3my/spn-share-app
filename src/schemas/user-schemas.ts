import { z } from "zod";

import { Role } from "../models/enums";

export const newUserSchema = z.object({
  firstname: z.string().min(2),
  lastname: z.string().min(2),
  role: z.nativeEnum(Role),
  address: z.object({
    street: z.string().min(2),
    city: z.string().min(2),
    postcode: z.string().min(2),
  }),
  email: z.string().email(),
  mobile: z.string().min(10),
  password: z.string().min(6),
});

export const updatedUserSchema = z.object({
  firstname: z.string().min(2),
  lastname: z.string().min(2),
  role: z.nativeEnum(Role),
  address: z.object({
    street: z.string().min(2),
    city: z.string().min(2),
    postcode: z.string().min(2),
  }),
  mobile: z.string().min(10),
  email: z.string().email(),
});
