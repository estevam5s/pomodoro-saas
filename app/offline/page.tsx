'use client'

import { WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-white/10 p-6">
            <WifiOff className="w-16 h-16 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-4">
          You&apos;re Offline
        </h1>

        <p className="text-gray-400 mb-8">
          It looks like you&apos;ve lost your internet connection.
          Don&apos;t worry, your progress is saved locally and will sync when you&apos;re back online.
        </p>

        <div className="space-y-4">
          <Button
            onClick={handleRetry}
            className="w-full bg-white text-black hover:bg-gray-200"
          >
            Try Again
          </Button>

          <p className="text-sm text-gray-500">
            The app will automatically reconnect when your connection is restored
          </p>
        </div>

        <div className="mt-12 p-4 bg-white/5 rounded-lg">
          <h3 className="font-semibold mb-2">Available Offline:</h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>✓ View your timer</li>
            <li>✓ Access saved sessions</li>
            <li>✓ Review statistics</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
