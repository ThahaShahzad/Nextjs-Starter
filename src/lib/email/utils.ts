import { z } from 'zod'

export const emailSchema = z.object({
  name: z.string().min(3).nullish(),
  email: z.string().email(),
  subject: z.string().min(3).nullish(),
  code: z.string().min(3).nullish()
})
