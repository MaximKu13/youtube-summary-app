'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

interface SummaryResult {
  summary: string
  transcript: string
}

function Dashboard() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [isValidUrl, setIsValidUrl] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(null)
  const [showTranscript, setShowTranscript] = useState(false)

  // YouTube URL validation regex
  const YOUTUBE_URL_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    
    if (!token) {
      router.push('/auth')
    } else {
      setIsLoading(false)
    }
  }, [router])

  // Validate URL as user types
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value
    setUrl(newUrl)
    
    // Reset states
    setError('')
    setIsValidUrl(false)
    setSummaryResult(null)

    // Don't show error while typing
    if (!newUrl) return

    // Check if it's a valid YouTube URL
    if (YOUTUBE_URL_REGEX.test(newUrl)) {
      setIsValidUrl(true)
    } else {
      setError('Please enter a valid YouTube video URL')
    }
  }

  // Extract video ID from URL
  const extractVideoId = (url: string): string | null => {
    const match = url.match(YOUTUBE_URL_REGEX)
    return match ? match[4] : null
  }

  const handleSubmit = async () => {
    if (!isValidUrl) return

    setIsProcessing(true)
    setError('')
    setSummaryResult(null)
    const videoId = extractVideoId(url)

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoId }),
      })

      if (!response.ok) {
        throw new Error('Failed to get summary')
      }

      const result = await response.json()
      setSummaryResult(result)

    } catch (err) {
      setError('Failed to generate summary. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">
            YouTube Video Summarizer
          </h1>
          <button 
            onClick={() => {
              localStorage.removeItem('token')
              sessionStorage.removeItem('token')
              router.push('/auth')
            }}
            className="text-red-600 hover:text-red-700 px-4 py-2 rounded border border-red-600 hover:border-red-700"
          >
            Logout
          </button>
        </div>
        
        <div className="space-y-6">
          {/* URL Input */}
          <div className="relative">
            <input 
              type="text"
              value={url}
              onChange={handleUrlChange}
              placeholder="Paste YouTube URL here (e.g., https://youtube.com/watch?v=...)"
              className={`w-full p-4 border rounded shadow-sm focus:ring-2 focus:border-transparent pr-10 ${
                error ? 'border-red-500 focus:ring-red-500' : 
                isValidUrl ? 'border-green-500 focus:ring-green-500' : 
                'focus:ring-blue-500'
              }`}
            />
            {isValidUrl && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3 text-red-700">{error}</div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button 
            onClick={handleSubmit}
            disabled={!isValidUrl || isProcessing}
            className={`w-full bg-green-500 text-white px-4 py-3 rounded shadow-sm transition-colors
              ${isValidUrl && !isProcessing ? 'hover:bg-green-600' : 'opacity-50 cursor-not-allowed'}`}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Generating Summary...
              </div>
            ) : (
              'Get Summary'
            )}
          </button>

          {/* Summary Result */}
          {summaryResult && (
            <div className="mt-8 space-y-4">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-semibold mb-4">Summary</h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {summaryResult.summary}
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowTranscript(!showTranscript)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {showTranscript ? 'Hide Transcript' : 'Show Full Transcript'}
                </button>
              </div>

              {showTranscript && (
                <div className="bg-gray-50 p-6 rounded-lg shadow-sm border">
                  <h2 className="text-xl font-semibold mb-4">Full Transcript</h2>
                  <p className="text-gray-600 whitespace-pre-line">
                    {summaryResult.transcript}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default Dashboard