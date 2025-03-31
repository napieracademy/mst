'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'

export default function AuthForm() {
  const supabase = createClientComponentClient()
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const handleAuthStateChange = async (event: string, session: any) => {
    if (event === 'SIGNED_IN') {
      console.log('Utente autenticato:', session?.user)
      // Qui puoi aggiungere logica aggiuntiva dopo il login
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <Auth
        supabaseClient={supabase}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: '#404040',
                brandAccent: '#2d2d2d',
              },
            },
          },
        }}
        providers={[]}
        redirectTo={`${origin}/auth/callback`}
        theme="light"
        onAuthStateChange={handleAuthStateChange}
      />
    </div>
  )
} 