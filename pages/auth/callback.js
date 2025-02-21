import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../utils/supabaseClient'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      await supabase.auth.getSession() // Just get the session
      router.push('/login') // Always redirect to login
    }

    handleAuthCallback()
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Logging you in...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </div>
  )
} 