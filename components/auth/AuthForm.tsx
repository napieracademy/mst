
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

  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-gray-900 px-4 py-8 shadow sm:rounded-lg sm:px-10">
        <Auth
          supabaseClient={supabase}
          view="sign_in"
          appearance={{
            theme: ThemeSupa,
            style: {
              button: {
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                padding: '10px 15px',
                border: 'none',
              },
              container: {
                gap: '1rem',
              },
              input: {
                borderRadius: '8px',
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                color: 'white',
              },
              label: {
                color: '#9ca3af',
              },
            },
            variables: {
              default: {
                colors: {
                  brand: '#3b82f6',
                  brandAccent: '#2563eb',
                  inputBackground: '#1f2937',
                  inputBorder: '#374151',
                  inputText: 'white',
                  inputPlaceholder: '#9ca3af',
                }
              }
            }
          }}
          providers={['google', 'twitter']}
          redirectTo={`${origin}/auth/callback`}
          theme="dark"
        />
      </div>
    </div>
  )
}
