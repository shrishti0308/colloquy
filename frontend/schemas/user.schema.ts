import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must not exceed 50 characters")
    .trim(),
});

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must not exceed 50 characters")
    .trim()
    .optional(),
  email: z.email("Invalid email address").toLowerCase().trim().optional(),
  role: z.enum(["user", "interviewer", "admin"]).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
