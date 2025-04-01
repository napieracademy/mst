
import AuthForm from '@/components/auth/AuthForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black/95 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold text-white">
          Accedi al tuo account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Per continuare su Movie Social Time
        </p>
      </div>
      <AuthForm />
    </div>
  )
}
