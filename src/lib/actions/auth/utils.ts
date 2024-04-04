import { db } from '@/lib/db'
import { verifyEmailSchema } from '@/lib/types/auth'
import { TimeSpan, createDate, isWithinExpirationDate } from 'oslo'
import { generateRandomString, alphabet } from 'oslo/crypto'
import { z } from 'zod'

export const generateEmailVerificationCode = async ({ userId, email }: { userId: string; email: string }) => {
  try {
    await db.emailVerificationCode.deleteMany({
      where: {
        userId
      }
    })
    const code = generateRandomString(8, alphabet('0-9'))
    await db.emailVerificationCode.create({
      data: {
        userId,
        email,
        code,
        expiresAt: createDate(new TimeSpan(15, 'm')) // 15 minutes
      }
    })
    return code
  } catch (error) {
    console.error('Error generating verification code:', error)
    throw {
      message: error
    } // Re-throw to allow for proper error handling
  }
}

export const isValidVerificationCode = async (values: z.infer<typeof verifyEmailSchema>) => {
  const { code, userId, email } = values

  try {
    const databaseCode = await db.emailVerificationCode.findUnique({ where: { userId, code } })
    if (!databaseCode) throw 'Code not found'
    // Additional checks outside the transaction
    if (!isWithinExpirationDate(databaseCode?.expiresAt)) {
      throw 'Code expired'
    }
    if (databaseCode?.email !== email) {
      throw 'Code not found'
    }
    await db.emailVerificationCode.delete({ where: { userId } })
    return true
  } catch (error) {
    console.error('Error verifying verification code:', error)
    throw {
      message: error
    } // Re-throw to allow for proper error handling
  } finally {
    await db.$disconnect()
  }
}
