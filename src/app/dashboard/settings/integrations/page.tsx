'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Calendar,
  Plus,
  Settings,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Link as LinkIcon,
  Loader2,
  ChevronRight,
  Power,
  Eye,
  EyeOff
} from 'lucide-react'
import { CALENDAR_PROVIDERS, CALENDAR_FEATURES } from '@/lib/calendar/providers'

interface CalendarConnection {
  id: string
  provider: string
  accountEmail: string
  accountName?: string
  isActive: boolean
  syncStatus: string
  lastSyncAt?: string
  calendars: number
  events: number
}

export default function IntegrationsPage() {
  const router = useRouter()
  const [connections, setConnections] = useState<CalendarConnection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    loadConnections()
  }, [])

  const loadConnections = async () => {
    try {
      const response = await fetch('/api/v1/calendar/connections')
      if (response.ok) {
        const data = await response.json()
        setConnections(data.connections || [])
      }
    } catch (error) {
      console.error('Failed to load connections:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnect = (providerId: string) => {
    // Start OAuth flow
    window.location.href = `/api/v1/calendar/connect?provider=${providerId}`
  }

  const handleDisconnect = async (connectionId: string) => {
    if (!confirm('Are you sure you want to disconnect this calendar? Your events will no longer sync.')) {
      return
    }

    try {
      const response = await fetch(`/api/v1/calendar/connections/${connectionId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setConnections(connections.filter(c => c.id !== connectionId))
      }
    } catch (error) {
      console.error('Failed to disconnect:', error)
    }
  }

  const handleSync = async (connectionId: string) => {
    try {
      await fetch(`/api/v1/calendar/connections/${connectionId}/sync`, {
        method: 'POST'
      })
      // Reload connections to get updated sync status
      loadConnections()
    } catch (error) {
      console.error('Failed to sync:', error)
    }
  }

  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'SYNCING':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
      case 'ERROR':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Calendar Integrations
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Connect your calendars to sync all your events in one place
        </p>
      </div>

      {/* Connected Calendars */}
      {connections.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Connected Calendars
          </h2>
          <div className="space-y-4">
            {connections.map((connection) => {
              const provider = CALENDAR_PROVIDERS[connection.provider]
              return (
                <div
                  key={connection.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${provider?.color}20` }}
                      >
                        <Calendar className="w-6 h-6" style={{ color: provider?.color }} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {provider?.name || connection.provider}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {connection.accountEmail}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm">
                          <span className="text-gray-500">
                            {connection.calendars} calendars
                          </span>
                          <span className="text-gray-500">
                            {connection.events} events
                          </span>
                          <div className="flex items-center space-x-1">
                            {getSyncStatusIcon(connection.syncStatus)}
                            <span className="text-gray-500">
                              Last synced {connection.lastSyncAt ? new Date(connection.lastSyncAt).toLocaleString() : 'Never'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleSync(connection.id)}
                        className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        title="Sync now"
                      >
                        <RefreshCw className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => router.push(`/dashboard/settings/integrations/${connection.id}`)}
                        className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        title="Settings"
                      >
                        <Settings className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDisconnect(connection.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        title="Disconnect"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Available Providers */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {connections.length > 0 ? 'Add Another Calendar' : 'Connect Your First Calendar'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.values(CALENDAR_PROVIDERS).map((provider) => {
            const isConnected = connections.some(c => c.provider === provider.id)
            return (
              <div
                key={provider.id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${
                  isConnected ? 'opacity-60' : 'hover:shadow-lg cursor-pointer'
                } transition-all`}
                onClick={() => !isConnected && handleConnect(provider.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${provider.color}20` }}
                  >
                    <Calendar className="w-6 h-6" style={{ color: provider.color }} />
                  </div>
                  {isConnected && (
                    <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full">
                      Connected
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {provider.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {provider.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {provider.features.slice(0, 3).map((featureId) => {
                    const feature = CALENDAR_FEATURES[featureId]
                    if (!feature) return null
                    return (
                      <span
                        key={featureId}
                        className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                      >
                        {feature.icon} {feature.name}
                      </span>
                    )
                  })}
                  {provider.features.length > 3 && (
                    <span className="text-xs px-2 py-1 text-gray-500">
                      +{provider.features.length - 3} more
                    </span>
                  )}
                </div>
                {!isConnected && (
                  <button className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    <Plus className="w-4 h-4 mr-2" />
                    Connect
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* CalDAV Setup Modal */}
      {showAddModal && selectedProvider === 'CALDAV' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Connect CalDAV Calendar
            </h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Server URL
                </label>
                <input
                  type="url"
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://caldav.example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Connect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Features Info */}
      <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
          Why Connect Your Calendars?
        </h3>
        <ul className="space-y-2 text-blue-800 dark:text-blue-200">
          <li className="flex items-start">
            <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>View all your events from different calendars in one unified view</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>Never miss an appointment with cross-calendar conflict detection</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>Get AI-powered insights about your time management and schedule optimization</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>Automatic sync keeps your calendars up-to-date across all platforms</span>
          </li>
        </ul>
      </div>
    </div>
  )
}