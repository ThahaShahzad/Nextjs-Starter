'use client'
import { Button } from '../ui/button'
import { sendEmail } from '@/lib/email'

export default function TestEmailButton({ email }: { email: string | undefined }) {
  const sendEmailAction = async () => {
    try {
      const res = await fetch('/api/email', { method: 'POST', body: JSON.stringify({ email }) })
      console.log(res)
    } catch (error) {
      console.log(error)
    }
  }
  return <Button onClick={sendEmailAction}>send email test</Button>
}
