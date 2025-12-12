'use client'

import { useEffect, useState } from 'react'
import { X, Download, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if running as PWA
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
    setIsStandalone(isInStandaloneMode)

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)

    // Check if user already dismissed the prompt
    const dismissed = localStorage.getItem('pwa-prompt-dismissed')
    const dismissedDate = dismissed ? new Date(dismissed) : null
    const daysSinceDismissed = dismissedDate
      ? (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24)
      : 999

    // Don't show if already installed or recently dismissed (within 7 days)
    if (isInStandaloneMode || (dismissed && daysSinceDismissed < 7)) {
      return
    }

    // Listen for beforeinstallprompt event (Android)
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // For iOS, show prompt after 3 seconds if not installed
    if (iOS && !isInStandaloneMode) {
      const timer = setTimeout(() => {
        setShowPrompt(true)
      }, 3000)

      return () => {
        clearTimeout(timer)
        window.removeEventListener('beforeinstallprompt', handler)
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    }

    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-prompt-dismissed', new Date().toISOString())
  }

  if (!showPrompt || isStandalone) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-md">
      <div className="bg-gradient-to-r from-black via-gray-900 to-black border border-white/10 rounded-lg shadow-2xl p-4">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="flex-1 pr-4">
            <h3 className="text-white font-semibold text-sm mb-1">
              Install FocusTimer
            </h3>
            <p className="text-gray-400 text-xs mb-3">
              {isIOS
                ? 'Add to your home screen for a better experience'
                : 'Install our app for quick access and offline support'}
            </p>

            {isIOS ? (
              <div className="text-xs text-gray-300 space-y-1">
                <p className="flex items-center gap-1">
                  <span className="font-bold">1.</span> Tap the Share button
                  <svg className="w-4 h-4 inline" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z"/>
                  </svg>
                </p>
                <p className="flex items-center gap-1">
                  <span className="font-bold">2.</span> Select &quot;Add to Home Screen&quot;
                </p>
              </div>
            ) : (
              <Button
                onClick={handleInstallClick}
                className="w-full bg-white text-black hover:bg-gray-200 text-sm py-2"
              >
                <Download className="w-4 h-4 mr-2" />
                Install App
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
