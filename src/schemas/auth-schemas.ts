import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  firstname: z.string().min(2),
  lastname: z.string().min(2),
  mobile: z.string().min(10),
  email: z.string().email(),
  password: z.string().min(6),
});

export const profileSchema = z.object({
  _id: z.string(),
  firstname: z.string().min(2),
  lastname: z.string().min(2),
  mobile: z.string().min(10),
  address: z.object({
    street: z.string().min(2),
    city: z.string().min(2),
    postcode: z.string().min(2),
  }),
});
