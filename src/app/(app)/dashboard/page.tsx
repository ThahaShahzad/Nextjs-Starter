import SignOutBtn from '@/components/auth/SignOutBtn'
// import TestEmailButton from '@/components/emails/TestEmailButton'
import { validateRequest } from '@/lib/auth/lucia'

export default async function Home() {
  const { user } = await validateRequest()

  return (
    <main className=''>
      <h1 className='text-2xl font-bold my-2'>Profile</h1>
      <pre className='bg-secondary p-4 rounded-lg my-2'>{JSON.stringify(user, null, 2)}</pre>
      {/* <TestEmailButton email={user?.email} /> */}
      <SignOutBtn />
    </main>
  )
}
