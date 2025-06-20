import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "../lib/auth/auth-context"
import { Toaster } from 'react-hot-toast';


const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DugraDham Family Tree Viewer",
  description: "Build, visualize, and share your family history",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
         <Toaster />
      </body>
    </html>
  )
}
