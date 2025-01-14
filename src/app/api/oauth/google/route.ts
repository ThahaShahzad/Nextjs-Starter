import { generateCodeVerifier, generateState } from 'arctic'
import { google } from '@/lib/auth/oauth'
import { cookies } from 'next/headers'

export async function GET(): Promise<Response> {
  const state = generateState()
  const codeVerifier = generateCodeVerifier()
  const url = await google.createAuthorizationURL(state, codeVerifier, {
    scopes: ['email', 'profile']
  })

  cookies().set('codeVerifier', codeVerifier, {
    httpOnly: true
  })

  cookies().set('google_oauth_state', state, {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: 'lax'
  })

  return Response.redirect(url)
}
