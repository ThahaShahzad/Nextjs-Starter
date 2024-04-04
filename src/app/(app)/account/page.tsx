import UserSettings from './UserSettings'
import PlanSettings from './PlanSettings'
import { checkAuth, validateRequest } from '@/lib/auth/lucia'
import { getUserSubscriptionPlan } from '@/lib/stripe/subscription'

export default async function Account() {
  await checkAuth()
  const { session } = await validateRequest()
  const subscriptionPlan = await getUserSubscriptionPlan()

  return (
    <main>
      <h1 className='text-2xl font-semibold my-4'>Account</h1>
      <div className='space-y-4'>
        <PlanSettings subscriptionPlan={subscriptionPlan} session={session} />
        <UserSettings session={session} />
      </div>
    </main>
  )
}
