import {
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { bootstrapProfile } from '../../lib/api'
import { supabase } from '../../lib/supabaseClient'
import { AuthContext, type AuthContextValue } from './AuthContext'

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<AuthContextValue['session']>(null)
  const [isLoading, setIsLoading] = useState(true)
  const bootstrappedUserIdRef = useRef<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadSession() {
      const { data } = await supabase.auth.getSession()
      if (isMounted) {
        setSession(data.session)
        setIsLoading(false)
      }
    }

    loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, nextSession) => {
      setSession(nextSession)
      setIsLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!session) {
      bootstrappedUserIdRef.current = null
      return
    }

    const currentSession = session

    if (bootstrappedUserIdRef.current === currentSession.user.id) {
      return
    }

    async function runBootstrap() {
      try {
        await bootstrapProfile(currentSession.access_token)
        bootstrappedUserIdRef.current = currentSession.user.id
      } catch (error) {
        // Surface for debugging while we are in early local development.
        console.error('Profile bootstrap failed', error)
      }
    }

    void runBootstrap()
  }, [session])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isLoading,
      signOut: async () => {
        await supabase.auth.signOut()
      },
    }),
    [session, isLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
