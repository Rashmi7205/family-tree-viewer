
import type { Metadata } from "next"
import SignInForm from "@/components/auth/signin-form"

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your account",
}

export default function SignInPage() {



  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md space-y-6 bg-white dark:bg-slate-950 p-8 rounded-lg shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Sign In</h1>
          <p className="text-slate-600 dark:text-slate-400">Enter your credentials to access your account</p>
        </div>
        <SignInForm />
      </div>
    </div>
  )
}
