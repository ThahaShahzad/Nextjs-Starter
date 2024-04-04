'use client'
import { signOut } from '@/lib/actions/auth/auth'
import { useRouter } from 'next/navigation'

export default function SignOutBtn() {
  const router = useRouter()
  const handleSignOut = async () => {
    const response = await signOut()

    if (response.success) {
      return router.push('/')
    }
  }
  return (
    <button onClick={handleSignOut} className='w-full text-left'>
      Sign out
    </button>
  )
}
