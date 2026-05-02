import { createClient } from '@supabase/supabase-js'
import { getServerEnv } from './env'

type RequestLike = {
  headers?: Record<string, string | string[] | undefined>
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

function readAuthHeader(headers: RequestLike['headers']) {
  if (!headers) {
    return undefined
  }

  const value = headers.authorization
  if (Array.isArray(value)) {
    return value[0]
  }

  return value
}

function getAccessToken(headers: RequestLike['headers']) {
  const authHeader = readAuthHeader(headers)
  if (!authHeader) {
    throw new AuthError('Missing Authorization header')
  }

  const [scheme, token] = authHeader.split(' ')
  if (scheme !== 'Bearer' || !token) {
    throw new AuthError('Authorization header must be Bearer token')
  }

  return token
}

export async function requireAuthUser(request: RequestLike) {
  const token = getAccessToken(request.headers)
  const env = getServerEnv()
  const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey)

  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) {
    throw new AuthError('Invalid or expired access token')
  }

  return data.user
}
