"use client"

import { useAuth } from "@/lib/auth/auth-context"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { sendEmailVerification } from "firebase/auth"
import { useToast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons"

export default function VerifyEmailPage() {
  const { user, logout ,userProfile} = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isResending, setIsResending] = useState(false)

  const handleResendVerification = async () => {
    if (!user) return

    setIsResending(true)
    try {
      await sendEmailVerification(user)
      toast({
        title: "Verification email sent",
        description: "Please check your inbox for the verification link.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to send verification email",
        description: "Please try again later.",
      })
    } finally {
      setIsResending(false)
    }
  }

  const handleSignOut = async () => {
    await logout()
    router.push("/auth/signin")
  }

  if (!user) {
    router.push("/auth/signin")
    return null
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md space-y-6 bg-white dark:bg-slate-950 p-8 rounded-lg shadow-lg">
        <div className="text-center space-y-4">
          <div className="rounded-full bg-yellow-100 p-3 mx-auto w-fit dark:bg-yellow-900/20">
            <Icons.mail className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h1 className="text-2xl font-bold">Verify Your Email</h1>
          <p className="text-slate-600 dark:text-slate-400">
            We've sent a verification link to <strong>{user.email}</strong>. Please check your inbox and click the link
            to verify your account.
          </p>
        </div>

        <div className="space-y-4">
          <Button onClick={handleResendVerification} disabled={isResending} className="w-full">
            {isResending && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Resend Verification Email
          </Button>

          <Button onClick={handleSignOut} variant="outline" className="w-full">
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  )
}
