
import AuthForm from '@/components/auth/AuthForm'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function LoginPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-black/95 flex flex-col justify-center pt-24 pb-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-center text-3xl font-bold text-white">
            Accedi al tuo account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Per continuare su Movie Social Time
          </p>
        </div>
        <AuthForm />
      </div>
      <Footer />
    </>
  )
}
