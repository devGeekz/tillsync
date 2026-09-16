import { z } from 'zod';

export const registerSchema = z.object({
  tenantName: z.string().min(2),
  phone: z.string().min(9),
  name: z.string().min(2),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  phone: z.string().min(9),
  password: z.string().min(8),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;