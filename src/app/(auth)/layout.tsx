import { validateRequest } from '@/lib/auth/lucia'
import { redirect } from 'next/navigation'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const { session } = await validateRequest()
  if (session) redirect('/dashboard')

  return <div className='bg-muted h-screen flex justify-center items-center'>{children}</div>
}
