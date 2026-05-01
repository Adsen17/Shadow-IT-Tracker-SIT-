import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { ToastProvider } from "@/components/ui/BrutalToast"
import { GlobalShortcut } from "@/components/layout/GlobalShortcut"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Shadow IT Tracker",
  description: "Internal SaaS security and governance product for tracking shadow IT.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ToastProvider>
            <GlobalShortcut />
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
