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
