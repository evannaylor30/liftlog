/**
 * Normalize DATABASE_URL from env (Vercel/UI often adds trailing newline or quotes).
 * “Invalid URL” from Prisma/pg usually means the URI cannot be parsed — often an
 * unescaped password (@ # : / ?) or stray quotes around the whole value.
 */
export function getTrimmedDatabaseUrl(): string {
  let url = process.env.DATABASE_URL
  if (url == null || !String(url).trim()) {
    throw new Error('Missing DATABASE_URL')
  }

  url = String(url).trim()

  if (
    (url.startsWith('"') && url.endsWith('"')) ||
    (url.startsWith("'") && url.endsWith("'"))
  ) {
    throw new Error(
      'DATABASE_URL must not be wrapped in quotes in environment variables',
    )
  }

  if (!/^postgres(ql)?:\/\//i.test(url)) {
    throw new Error('DATABASE_URL must start with postgresql:// or postgres://')
  }

  return url
}
