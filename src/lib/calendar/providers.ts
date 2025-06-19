export interface CalendarProvider {
  id: string
  name: string
  icon: string
  color: string
  authUrl: string
  scopes: string[]
  features: string[]
  description: string
}

export const CALENDAR_PROVIDERS: Record<string, CalendarProvider> = {
  GOOGLE: {
    id: 'GOOGLE',
    name: 'Google Calendar',
    icon: '/icons/google-calendar.svg',
    color: '#4285F4',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scopes: [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events.readonly'
    ],
    features: ['events', 'reminders', 'tasks', 'holidays', 'shared_calendars'],
    description: 'Connect your Google Calendar to sync all your events and schedules'
  },
  OUTLOOK: {
    id: 'OUTLOOK',
    name: 'Outlook Calendar',
    icon: '/icons/outlook.svg',
    color: '#0078D4',
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    scopes: [
      'https://graph.microsoft.com/calendars.read',
      'https://graph.microsoft.com/calendars.readwrite',
      'offline_access'
    ],
    features: ['events', 'meetings', 'tasks', 'shared_calendars'],
    description: 'Sync your Outlook calendar including work and personal events'
  },
  OFFICE365: {
    id: 'OFFICE365',
    name: 'Office 365',
    icon: '/icons/office365.svg',
    color: '#D83B01',
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    scopes: [
      'https://graph.microsoft.com/calendars.read',
      'https://graph.microsoft.com/calendars.readwrite',
      'offline_access'
    ],
    features: ['events', 'meetings', 'rooms', 'teams_integration', 'shared_calendars'],
    description: 'Connect your Office 365 calendar for enterprise-level integration'
  },
  APPLE: {
    id: 'APPLE',
    name: 'Apple Calendar',
    icon: '/icons/apple-calendar.svg',
    color: '#000000',
    authUrl: 'https://appleid.apple.com/auth/authorize',
    scopes: ['calendar'],
    features: ['events', 'reminders', 'shared_calendars', 'time_zones'],
    description: 'Sync your Apple Calendar across all your devices'
  },
  YAHOO: {
    id: 'YAHOO',
    name: 'Yahoo Calendar',
    icon: '/icons/yahoo.svg',
    color: '#6001D2',
    authUrl: 'https://api.login.yahoo.com/oauth2/request_auth',
    scopes: ['calendar-read'],
    features: ['events', 'reminders', 'weather'],
    description: 'Connect your Yahoo Calendar for basic event synchronization'
  },
  CALDAV: {
    id: 'CALDAV',
    name: 'CalDAV',
    icon: '/icons/caldav.svg',
    color: '#FF6B6B',
    authUrl: 'manual',
    scopes: [],
    features: ['events', 'custom_server', 'open_standard'],
    description: 'Connect any CalDAV-compatible calendar server'
  }
}

export interface OAuthConfig {
  clientId: string
  clientSecret?: string
  redirectUri: string
  responseType: string
  accessType?: string
  prompt?: string
  includeGrantedScopes?: boolean
}

export function getOAuthUrl(provider: CalendarProvider, config: OAuthConfig): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: config.responseType,
    scope: provider.scopes.join(' ')
  })

  // Provider-specific parameters
  switch (provider.id) {
    case 'GOOGLE':
      params.append('access_type', config.accessType || 'offline')
      params.append('prompt', config.prompt || 'consent')
      params.append('include_granted_scopes', 'true')
      break
    case 'OUTLOOK':
    case 'OFFICE365':
      params.append('response_mode', 'query')
      params.append('prompt', 'select_account')
      break
    case 'APPLE':
      params.append('response_mode', 'form_post')
      break
  }

  return `${provider.authUrl}?${params.toString()}`
}

export interface CalendarFeature {
  id: string
  name: string
  description: string
  icon: string
}

export const CALENDAR_FEATURES: Record<string, CalendarFeature> = {
  events: {
    id: 'events',
    name: 'Events',
    description: 'Sync calendar events and appointments',
    icon: '📅'
  },
  reminders: {
    id: 'reminders',
    name: 'Reminders',
    description: 'Import reminders and to-dos',
    icon: '⏰'
  },
  tasks: {
    id: 'tasks',
    name: 'Tasks',
    description: 'Sync tasks and task lists',
    icon: '✅'
  },
  meetings: {
    id: 'meetings',
    name: 'Meetings',
    description: 'Meeting rooms and video conferencing',
    icon: '👥'
  },
  shared_calendars: {
    id: 'shared_calendars',
    name: 'Shared Calendars',
    description: 'Access calendars shared with you',
    icon: '👫'
  },
  holidays: {
    id: 'holidays',
    name: 'Holidays',
    description: 'Import holiday calendars',
    icon: '🎉'
  },
  weather: {
    id: 'weather',
    name: 'Weather',
    description: 'Weather information in calendar',
    icon: '🌤️'
  },
  teams_integration: {
    id: 'teams_integration',
    name: 'Teams Integration',
    description: 'Microsoft Teams meeting integration',
    icon: '💼'
  },
  rooms: {
    id: 'rooms',
    name: 'Room Booking',
    description: 'Book meeting rooms and resources',
    icon: '🏢'
  },
  time_zones: {
    id: 'time_zones',
    name: 'Time Zones',
    description: 'Multi-timezone support',
    icon: '🌍'
  },
  custom_server: {
    id: 'custom_server',
    name: 'Custom Server',
    description: 'Connect to your own calendar server',
    icon: '🖥️'
  },
  open_standard: {
    id: 'open_standard',
    name: 'Open Standard',
    description: 'Uses open CalDAV standard',
    icon: '🔓'
  }
}