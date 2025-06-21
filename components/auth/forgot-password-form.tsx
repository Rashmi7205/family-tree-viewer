"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import Link from "next/link"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons"
import { FirebaseError } from "firebase/app"

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordForm() {
  const { resetPassword } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  async function onSubmit(data: ForgotPasswordFormValues) {
    setIsLoading(true)

    try {
      await resetPassword(data.email)
      setIsSubmitted(true)
    } catch (error) {
      let errorMessage = "Failed to send reset email. Please try again."

      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/user-not-found":
            errorMessage = "No account found with this email address."
            break
          case "auth/invalid-email":
            errorMessage = "Please enter a valid email address."
            break
          default:
            errorMessage = "Failed to send reset email. Please try again."
        }
      }

      toast({
        variant: "destructive",
        title: "Password reset failed",
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <Icons.check className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Password reset email sent</h3>
              <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                <p>Please check your inbox and follow the instructions to reset your password.</p>
              </div>
            </div>
          </div>
        </div>
        <Button asChild className="w-full">
          <Link href="/auth/signin">Return to Sign In</Link>
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          autoComplete="email"
          disabled={isLoading}
          {...register("email")}
        />
        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
        Send Reset Link
      </Button>
      <div className="text-center text-sm">
        <Link href="/auth/signin" className="font-medium text-primary hover:underline">
          Back to Sign In
        </Link>
      </div>
    </form>
  )
}
