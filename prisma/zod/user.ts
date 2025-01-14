import * as z from "zod"
import { CompleteSession, relatedSessionSchema } from "./index"

export const userSchema = z.object({
  id: z.string(),
  name: z.string().nullish(),
  email: z.string().nullish(),
  hashedPassword: z.string().nullish(),
  isEmailVerified: z.boolean(),
  profilePictureUrl: z.string().nullish(),
  google_id: z.string().nullish(),
})

export interface CompleteUser extends z.infer<typeof userSchema> {
  sessions: CompleteSession[]
}

/**
 * relatedUserSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedUserSchema: z.ZodSchema<CompleteUser> = z.lazy(() => userSchema.extend({
  sessions: relatedSessionSchema.array(),
}))
