"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth"
import { auth } from "@/lib/firebase/config"
import { IUser } from "../../models/User"


interface AuthContextType {
  user: User | null
  userProfile: IUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithFacebook: () => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  refreshUserProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<IUser | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUserProfile = async (firebaseUser: User) => {
    try {
      const token = await firebaseUser.getIdToken()
      const response = await fetch("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const profile = await response.json()
        setUserProfile(profile)
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    }
  }

  const refreshUserProfile = async () => {
    if (user) {
      await fetchUserProfile(user)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)

      if (firebaseUser) {
        await fetchUserProfile(firebaseUser)
      } else {
        setUserProfile(null)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signUp = async (email: string, password: string, displayName: string) => {
    const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password)

    // Update the user's display name
    await updateProfile(newUser, { displayName })

    // Send email verification
    await sendEmailVerification(newUser)

    // Create user profile in database
    const token = await newUser.getIdToken()
    await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        email,
        displayName,
        uid: newUser.uid,
        provider: "email",
      }),
    })
  }

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    const { user: newUser } = await signInWithPopup(auth, provider)

    // Create or update user profile in database
    const token = await newUser.getIdToken()
    await fetch("/api/auth/social-signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        email: newUser.email,
        displayName: newUser.displayName,
        photoURL: newUser.photoURL,
        uid: newUser.uid,
        provider: "google",
      }),
    })
  }

  const signInWithFacebook = async () => {
    const provider = new FacebookAuthProvider()
    const { user: newUser } = await signInWithPopup(auth, provider)

    // Create or update user profile in database
    const token = await newUser.getIdToken()
    await fetch("/api/auth/social-signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        email: newUser.email,
        displayName: newUser.displayName,
        photoURL: newUser.photoURL,
        uid: newUser.uid,
        provider: "facebook",
      }),
    })
  }

  const logout = async () => {
    await signOut(auth)
  }

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email)
  }

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithFacebook,
    logout,
    resetPassword,
    refreshUserProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
