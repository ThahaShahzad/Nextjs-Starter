import { EmailVerificationTemplate } from '@/components/emails/EmailVerificationTemplate'
import { resend } from '@/lib/email/index'
import { emailSchema } from '@/lib/email/utils'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  console.log(body)
  const { email, subject, code } = emailSchema.parse(body)
  try {
    console.log('asd', email, subject, code)
    const data = await resend.emails.send({
      from: 'RM <admin@tufaha.org>',
      to: [email],
      subject: subject ?? 'Verify your email',
      react: <EmailVerificationTemplate code={code} />
    })
    console.log(data)
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error })
  }
}
