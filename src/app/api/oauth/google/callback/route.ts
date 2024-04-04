import { lucia } from '@/lib/auth/lucia'
import { cookies } from 'next/headers'
import { OAuth2RequestError } from 'arctic'
import { generateId } from 'lucia'
import { google } from '@/lib/auth/oauth'
import { db } from '@/lib/db'

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const searchParams = url.searchParams

  const code = searchParams.get('code')
  const state = searchParams.get('state')

  if (!code || !state) {
    return Response.json(
      { error: 'Invalid request' },
      {
        status: 400
      }
    )
  }

  const codeVerifier = cookies().get('codeVerifier')?.value
  const savedState = cookies().get('google_oauth_state')?.value

  if (!code || !state || !savedState || !codeVerifier || state !== savedState) {
    return new Response(null, {
      status: 400
    })
  }
  try {
    const tokens = await google.validateAuthorizationCode(code, codeVerifier)
    const googleUserResponse = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`
      },
      method: 'GET'
    })
    const googleUser: GoogleUser = await googleUserResponse.json()

    const existingUser = await db.user.findUnique({ where: { google_id: googleUser.id } })
    if (existingUser) {
      const session = await lucia.createSession(existingUser.id, {})
      const sessionCookie = lucia.createSessionCookie(session.id)
      cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
      return new Response(null, {
        status: 302,
        headers: {
          Location: '/dashboard'
        }
      })
    }

    const userId = generateId(15)

    await db.user.create({
      data: {
        id: userId,
        google_id: googleUser.id,
        name: googleUser.name,
        email: googleUser.email,
        profilePictureUrl: googleUser.picture
      }
    })

    const session = await lucia.createSession(userId, {})
    const sessionCookie = lucia.createSessionCookie(session.id)
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
    return new Response(null, {
      status: 302,
      headers: {
        Location: '/dashboard'
      }
    })
  } catch (e) {
    console.log(e)
    // the specific error message depends on the provider
    if (e instanceof OAuth2RequestError) {
      // invalid code
      return new Response(null, {
        status: 400
      })
    }
    return new Response(null, {
      status: 500
    })
  }
}

interface GoogleUser {
  id: string
  email: string
  name: string
  picture: string
}
