import * as z from "zod"

export const emailVerificationCodeSchema = z.object({
  id: z.number().int(),
  code: z.string(),
  userId: z.string(),
  email: z.string(),
  expiresAt: z.date(),
  sentAt: z.date(),
})
