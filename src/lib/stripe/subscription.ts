import { storeSubscriptionPlans } from '@/config/subscriptions'
import { db } from '@/lib/db/index'
import { stripe } from '@/lib/stripe/index'
import { validateRequest } from '@/lib/auth/lucia'

export async function getUserSubscriptionPlan() {
  const { session, user } = await validateRequest()

  if (!session || !user) {
    throw new Error('User not found.')
  }

  const subscription = await db.subscription.findFirst({
    where: {
      userId: user.id
    }
  })

  if (!subscription)
    return {
      id: undefined,
      name: undefined,
      description: undefined,
      stripePriceId: undefined,
      price: undefined,
      stripeSubscriptionId: null,
      stripeCurrentPeriodEnd: null,
      stripeCustomerId: null,
      isSubscribed: false,
      isCanceled: false
    }

  const isSubscribed =
    subscription.stripePriceId &&
    subscription.stripeCurrentPeriodEnd &&
    subscription.stripeCurrentPeriodEnd.getTime() + 86_400_000 > Date.now()

  const plan = isSubscribed
    ? storeSubscriptionPlans.find((plan) => plan.stripePriceId === subscription.stripePriceId)
    : null

  let isCanceled = false
  if (isSubscribed && subscription.stripeSubscriptionId) {
    const stripePlan = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId)
    isCanceled = stripePlan.cancel_at_period_end
  }

  return {
    ...plan,
    stripeSubscriptionId: subscription.stripeSubscriptionId,
    stripeCurrentPeriodEnd: subscription.stripeCurrentPeriodEnd,
    stripeCustomerId: subscription.stripeCustomerId,
    isSubscribed,
    isCanceled
  }
}
