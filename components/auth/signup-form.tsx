"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons"
import { FirebaseError } from "firebase/app"

const signUpSchema = z
  .object({
    displayName: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

type SignUpFormValues = z.infer<typeof signUpSchema>

export default function SignUpForm() {
  const { signUp, signInWithGoogle} = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
  })

  async function onSubmit(data: SignUpFormValues) {
    setIsLoading(true)

    try {
      await signUp(data.email, data.password, data.displayName)

      toast({
        title: "Account created",
        description: "Please check your email to verify your account.",
      })

      router.push("/auth/verify-email")
    } catch (error) {
      let errorMessage = "Failed to create account. Please try again."

      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/email-already-in-use":
            errorMessage = "An account with this email already exists."
            break
          case "auth/weak-password":
            errorMessage = "Password is too weak. Please choose a stronger password."
            break
          case "auth/invalid-email":
            errorMessage = "Please enter a valid email address."
            break
          default:
            errorMessage = "Failed to create account. Please try again."
        }
      }

      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    try {
      await signInWithGoogle()
      router.push("/")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Google sign up failed",
        description: "Please try again later.",
      })
    } finally {
      setIsGoogleLoading(false)
    }
  }
   const { userProfile, loading } = useAuth();
    useEffect(() => {
      console.log(userProfile);
      if (!loading && userProfile) {
        router.push("/dashboard");
      }

    }, [loading]);

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="displayName">Full Name</Label>
          <Input
            id="displayName"
            placeholder="John Doe"
            autoComplete="name"
            disabled={isLoading}
            {...register("displayName")}
          />
          {errors.displayName && <p className="text-sm text-red-500">{errors.displayName.message}</p>}
        </div>
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
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            disabled={isLoading}
            {...register("password")}
          />
          {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            disabled={isLoading}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Create Account
        </Button>
      </form>

      <div className="flex items-center">
        <Separator className="flex-1" />
        <span className="mx-2 text-xs text-slate-500 dark:text-slate-400">OR</span>
        <Separator className="flex-1" />
      </div>

      <div className="space-y-3">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading}
        >
          {isGoogleLoading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.google className="mr-2 h-4 w-4" />
          )}
          Sign up with Google
        </Button>
      </div>

      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link href="/auth/signin" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  )
}
