'use client'
import { useState, useEffect } from 'react'
import { Trash2, ExternalLink, Loader2, RefreshCw, Youtube, PlusCircle, X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

const SubscriptionManager = () => {
  const [subscriptions, setSubscriptions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  
  // Add channel states
  const [showAddChannel, setShowAddChannel] = useState(false)
  const [channelInput, setChannelInput] = useState('')
  const [channelPreview, setChannelPreview] = useState(null)
  const [addingChannel, setAddingChannel] = useState(false)

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('/api/subscriptions')
      if (!response.ok) {
        throw new Error('Failed to fetch subscriptions')
      }
      const data = await response.json()
      setSubscriptions(data)
      setError('')
    } catch (err) {
      setError('Failed to load subscriptions. Please try again.')
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const validateChannel = async () => {
    if (!channelInput.trim()) return
    
    setAddingChannel(true)
    setError('')
    
    try {
      const response = await fetch('/api/channels/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel_input: channelInput.trim() })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to validate channel')
      }
      
      setChannelPreview(data)
    } catch (err) {
      setError(err.message)
      setChannelPreview(null)
    } finally {
      setAddingChannel(false)
    }
  }

  const subscribeToChannel = async () => {
    if (!channelPreview) return
    
    setAddingChannel(true)
    try {
      const response = await fetch('/api/subscriptions/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel_input: channelPreview.channel_id })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to subscribe to channel')
      }
      
      setSuccess('Successfully subscribed to channel!')
      setChannelInput('')
      setChannelPreview(null)
      setShowAddChannel(false)
      
      fetchSubscriptions()
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setAddingChannel(false)
    }
  }

  const handleUnsubscribe = async (subscriptionId, channelName) => {
    if (!confirm(`Are you sure you want to unsubscribe from ${channelName}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to remove subscription')
      }

      setSubscriptions(subscriptions.filter(sub => sub.id !== subscriptionId))
      setSuccess(`Unsubscribed from ${channelName}`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to unsubscribe. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Your Subscriptions</h2>
          <p className="text-gray-600">
            Managing {subscriptions.length} channel{subscriptions.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddChannel(!showAddChannel)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusCircle className="h-5 w-5" />
            Add Channel
          </button>
          <button
            onClick={() => fetchSubscriptions()}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 text-green-700 border-green-200">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {showAddChannel && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Add New Channel</h3>
            <button
              onClick={() => {
                setShowAddChannel(false)
                setChannelInput('')
                setChannelPreview(null)
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-3 flex items-center">
                <Youtube className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Channel URL or @handle"
                value={channelInput}
                onChange={(e) => setChannelInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && validateChannel()}
              />
            </div>
            <button
              onClick={validateChannel}
              disabled={addingChannel || !channelInput.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {addingChannel ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Validate'
              )}
            </button>
          </div>

          {channelPreview && (
            <div className="mt-4 border rounded-lg p-4 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {channelPreview.thumbnail_url && (
                    <img
                      src={channelPreview.thumbnail_url}
                      alt={channelPreview.channel_name}
                      className="w-12 h-12 rounded-full"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold">{channelPreview.channel_name}</h3>
                    {channelPreview.subscriber_count && (
                      <p className="text-sm text-gray-500">
                        {new Intl.NumberFormat().format(channelPreview.subscriber_count)} subscribers
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={subscribeToChannel}
                  disabled={addingChannel}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <PlusCircle className="h-5 w-5" />
                  Subscribe
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4">
        {subscriptions.map((subscription) => (
          <div
            key={subscription.id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {subscription.thumbnail_url && (
                  <img
                    src={subscription.thumbnail_url}
                    alt={subscription.channel_name}
                    className="w-12 h-12 rounded-full"
                  />
                )}
                
                <div>
                  <h3 className="font-semibold text-lg">{subscription.channel_name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>
                      Subscribed {new Date(subscription.subscribed_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://youtube.com/channel/${subscription.channel_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <ExternalLink className="h-5 w-5" />
                </a>
                <button
                  onClick={() => handleUnsubscribe(subscription.id, subscription.channel_name)}
                  className="p-2 text-red-400 hover:text-red-600"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            {subscription.latest_video && (
              <div className="mt-3 pl-16">
                <div className="text-sm text-gray-500">Latest video:</div>
                <a
                  href={`https://youtube.com/watch?v=${subscription.latest_video.video_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  {subscription.latest_video.title}
                </a>
              </div>
            )}
          </div>
        ))}

        {subscriptions.length === 0 && !showAddChannel && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900">No subscriptions yet</h3>
            <p className="mt-2 text-gray-500">
              Start by adding some YouTube channels to get updates and summaries.
            </p>
            <button
              onClick={() => setShowAddChannel(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Your First Channel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default SubscriptionManager