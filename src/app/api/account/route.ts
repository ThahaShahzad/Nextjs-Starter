import { validateRequest } from '@/lib/auth/lucia'
import { db } from '@/lib/db/index'
import { revalidatePath } from 'next/cache'

export async function PUT(request: Request) {
  const { session, user } = await validateRequest()
  if (!session) return new Response('Error', { status: 400 })
  const body = (await request.json()) as { name?: string; email?: string }

  await db.user.update({ where: { id: user?.id }, data: { ...body } })
  revalidatePath('/account')
  return new Response(JSON.stringify({ message: 'ok' }), { status: 200 })
}
