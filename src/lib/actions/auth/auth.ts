'use server'
import { z } from 'zod'
import { signInSchema, signUpSchema, verifyEmailSchema } from '../../types/auth'
import { generateId } from 'lucia'
import { db } from '@/lib/db'
import { lucia, validateRequest } from '@/lib/auth/lucia'
import { cookies } from 'next/headers'
import * as argon2 from 'argon2'
import { sendEmail } from '@/lib/email'
import { generateEmailVerificationCode, isValidVerificationCode } from './utils'
import { getErrorMessage, getErrors } from '@/lib/utils'

export const signUp = async (values: z.infer<typeof signUpSchema>) => {
  try {
    const { email, password } = signUpSchema.parse(values)
    const hashedPassword = await argon2.hash(password)
    const userId = generateId(15)

    await db.user.create({
      data: {
        id: userId,
        email: email,
        hashedPassword,
        isEmailVerified: false
      }
    })

    const code = await generateEmailVerificationCode({ userId, email })

    await sendEmail({
      email,
      subject: `Verify your email - ${process.env.NEXT_PUBLIC_PROJECT_NAME}`,
      code
    })

    return {
      success: true,
      data: { userId },
      error: ''
    }
  } catch (error: any) {
    return {
      success: false,
      data: { userId: '' },
      error: getErrors(error?.message)
    }
  }
}

export const signIn = async (values: z.infer<typeof signInSchema>) => {
  try {
    const { email, password } = signInSchema.parse(values)

    const existingUser = await db.user.findFirst({
      where: {
        email: email
      }
    })

    if (!existingUser) {
      return {
        error: 'User not found',
        data: { userId: '', email: '' },
        success: false
      }
    }

    if (!existingUser.hashedPassword) {
      return {
        error: 'User not found',
        data: { userId: '', email: '' },
        success: false
      }
    }

    if (existingUser.isEmailVerified === false) {
      return {
        error: 'Email not verified',
        data: { userId: existingUser.id, email },
        success: false
      }
    }

    const isValidPassword = await argon2.verify(existingUser.hashedPassword, password)

    if (!isValidPassword) {
      return {
        error: 'Incorrect username or password',
        data: { userId: '', email: '' },
        success: false
      }
    }

    const session = await lucia.createSession(existingUser.id, {})
    const sessionCookie = lucia.createSessionCookie(session.id)
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)

    return {
      success: true,
      data: { userId: '', email: '' },
      error: ''
    }
  } catch (error: any) {
    return {
      error: getErrors(error?.message),
      data: { userId: '', email: '' },
      success: false
    }
  }
}

export const signOut = async () => {
  try {
    const { session } = await validateRequest()
    if (!session)
      return {
        success: true
      }
    await lucia.invalidateSession(session.id)
    const sessionCookie = lucia.createBlankSessionCookie()
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
    return {
      success: true
    }
  } catch (error: any) {
    return {
      error: getErrors(error?.message)
    }
  }
}

export const verifyEmailCode = async (values: z.infer<typeof verifyEmailSchema>) => {
  try {
    const { userId } = verifyEmailSchema.parse(values)

    await isValidVerificationCode(values)

    await db.user.update({
      where: {
        id: userId
      },
      data: {
        isEmailVerified: true
      }
    })

    return {
      success: true,
      error: ''
    }
  } catch (error: any) {
    return {
      error: getErrorMessage(error),
      success: false
    }
  }
}

export const resendVerificationEmail = async (user: { userId: string; email: string }) => {
  try {
    const { userId, email } = user

    const existedCode = await db.emailVerificationCode.findFirst({
      where: {
        userId
      }
    })

    if (!existedCode) {
      return {
        error: 'Code not found, contact support'
      }
    }

    const sentAt = new Date(existedCode.sentAt)
    const isOneMinuteHasPassed = new Date().getTime() - sentAt.getTime() > 60000 // 1 minute

    if (!isOneMinuteHasPassed) {
      return {
        error:
          'Email already sent next email in ' +
          (60 - Math.floor((new Date().getTime() - sentAt.getTime()) / 1000)) +
          ' seconds'
      }
    }

    const code = await generateEmailVerificationCode({ userId, email })

    await sendEmail({
      email,
      subject: 'Verify your email',
      code
    })

    return {
      success: true,
      error: ''
    }
  } catch (error) {
    return {
      error: getErrorMessage(error),
      success: false
    }
  }
}
