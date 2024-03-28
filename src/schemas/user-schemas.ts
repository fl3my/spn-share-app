import { z } from "zod";

import { Role } from "../models/enums";

export const newUserSchema = z.object({
  firstname: z.string().min(2),
  lastname: z.string().min(2),
  role: z.nativeEnum(Role),
  email: z.string().email(),
  mobile: z.string().min(10),
  password: z.string().min(6),
});

export const updatedUserSchema = z.object({
  firstname: z.string().min(2).optional(),
  lastname: z.string().min(2).optional(),
  role: z.nativeEnum(Role).optional(),
  mobile: z.string().min(10).optional(),
  email: z.string().email().optional(),
});
