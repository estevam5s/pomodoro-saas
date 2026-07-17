import type { Metadata, Viewport } from "next"
import ChatWidgetMount from "@/components/ChatWidgetMount";
import { ScrollFX } from "@/components/scroll-fx";
import { CookieConsent } from "@/components/cookie-consent";
import { Inter } from "next/font/google"
import "./globals.css"
import type React from "react"
import { AuthProvider } from "@/contexts/AuthContext"
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt"

const inter = Inter({ subsets: ["latin"] })

const siteUrl = "https://focustimer-saas.vercel.app"
const siteName = "FocusTimer SaaS"
const siteTitle = "FocusTimer - Maximize Your Productivity with Pomodoro Technique"
const siteDescription = "Professional Pomodoro Timer SaaS platform for developers and professionals. Track your time, boost productivity, and achieve your goals with advanced analytics and insights. Start your 7-day free trial today!"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: `%s | ${siteName}`
  },
  description: siteDescription,
  keywords: [
    "pomodoro timer",
    "productivity",
    "time management",
    "focus timer",
    "task management",
    "saas",
    "pomodoro technique",
    "work timer",
    "productivity app",
    "focus app",
    "time tracking",
    "developer productivity"
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    title: siteTitle,
    description: siteDescription,
    siteName: siteName,
    images: [
      {
        url: "/saas.png",
        width: 1200,
        height: 630,
        alt: "FocusTimer SaaS - Professional Pomodoro Timer Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/saas.png"],
    creator: "@focustimer",
  },
  icons: { icon: "/brand-logo.png", shortcut: "/brand-logo.png", apple: "/brand-logo.png" },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: siteName,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

async function getBrandStyle(): Promise<string> {
  try {
    const { createClient } = await import("@supabase/supabase-js")
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY || "",
      { auth: { autoRefreshToken: false, persistSession: false } },
    )
    const { data } = await sb.from("brand_settings").select("*").eq("id", 1).maybeSingle()
    const b: any = data || {}
    return `:root{--logo-site-px:${b.logo_site_px ?? 40}px;--logo-login-px:${b.logo_login_px ?? 48}px;--logo-dashboard-px:${b.logo_dashboard_px ?? 36}px;--logo-admin-px:${b.logo_admin_px ?? 36}px;--favicon-px:${b.favicon_px ?? 32}px;}`
  } catch {
    return ":root{--logo-site-px:40px;--logo-login-px:48px;--logo-dashboard-px:36px;--logo-admin-px:36px;--favicon-px:32px;}"
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const brandStyle = await getBrandStyle()
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white antialiased`}><style dangerouslySetInnerHTML={{ __html: brandStyle }} /><ScrollFX />
        <AuthProvider>
          {children}
          <PWAInstallPrompt />
        </AuthProvider>
      <ChatWidgetMount appName="FocusTimer" accent="#ef4444" />
        <CookieConsent /></body>
    </html>
  )
}
