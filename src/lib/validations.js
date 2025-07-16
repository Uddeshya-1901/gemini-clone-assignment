import { z } from "zod";

export const phoneSchema = z.object({
  countryCode: z.string().min(1, "Please select a country"),
  phoneNumber: z
    .string()
    .min(8, "Phone number must be at least 8 digits")
    .max(15, "Phone number must be at most 15 digits")
    .regex(/^\d+$/, "Phone number must contain only digits"),
});

export const otpSchema = z.object({
  otp: z
    .string()
    .min(6, "OTP must be 6 digits")
    .max(6, "OTP must be 6 digits")
    .regex(/^\d{6}$/, "OTP must be 6 digits"),
});

export const chatroomSchema = z.object({
  title: z
    .string()
    .min(1, "Chatroom name is required")
    .max(50, "Chatroom name must be at most 50 characters"),
});

export const messageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty"),
  type: z.enum(["text", "image"]).default("text"),
});
