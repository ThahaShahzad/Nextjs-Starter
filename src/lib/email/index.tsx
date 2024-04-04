import { Resend } from 'resend'
import { env } from '@/lib/env.mjs'
import { emailSchema } from './utils'
import { z } from 'zod'
import { EmailVerificationTemplate } from '@/components/emails/EmailVerificationTemplate'
import { getErrors } from '../utils'

export const resend = new Resend(env.RESEND_API_KEY)

export async function sendEmail(values: z.infer<typeof emailSchema>) {
  const { email, subject, code } = emailSchema.parse(values)
  try {
    const data = await resend.emails.send({
      from: 'RM <admin@tufaha.org>',
      to: [email],
      subject: subject ?? `Email sent by ${process.env.NEXT_PUBLIC_PROJECT_NAME}.`,
      react: <EmailVerificationTemplate code={code} />
    })
    console.log(data)
    return data
  } catch (error: any) {
    console.log(getErrors(error?.message))
    return { error: getErrors(error?.message) }
  }
}
