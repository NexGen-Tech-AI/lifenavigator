# LifeNavigator Calendar Integration System

## Overview
We've implemented a comprehensive calendar integration system that allows users to connect and sync calendars from multiple providers including Google Calendar, Outlook, Office 365, Apple Calendar, Yahoo Calendar, and CalDAV servers.

## Key Features

### 1. Multi-Provider Support
- **Google Calendar** - Full OAuth integration with Google Calendar API
- **Outlook/Office 365** - Microsoft Graph API integration for personal and work accounts
- **Apple Calendar** - iCloud calendar integration
- **Yahoo Calendar** - Yahoo calendar sync
- **CalDAV** - Support for any CalDAV-compliant calendar server
- **Local Calendars** - Built-in calendars for users without integrations

### 2. Database Architecture
Created comprehensive tables for calendar management:
- `calendar_connections` - OAuth tokens and connection settings
- `calendars` - Individual calendars from each connection
- `calendar_events` - Synced events with full metadata
- `calendar_sync_queue` - Background sync job management
- `calendar_webhooks` - Real-time update subscriptions
- `calendar_integration_logs` - Audit trail and debugging

### 3. OAuth Flow Implementation
- Secure OAuth 2.0 flow for each provider
- CSRF protection with state tokens
- Automatic token refresh handling
- Encrypted token storage

### 4. Calendar Management UI
Located at `/dashboard/settings/integrations`:
- Visual provider selection with feature badges
- Connection status and sync indicators
- Per-connection settings and management
- Easy disconnect/reconnect functionality

### 5. Calendar View Integration
Enhanced the main calendar view at `/dashboard/calendar`:
- Unified view of all connected calendars
- Toggle visibility for each calendar
- Color-coded events by calendar source
- Sync status and manual sync button
- Prompt to connect calendars for new users

### 6. API Endpoints

#### Connection Management
- `GET /api/v1/calendar/connections` - List all connections
- `POST /api/v1/calendar/connections` - Create CalDAV connection
- `DELETE /api/v1/calendar/connections/[id]` - Remove connection
- `PATCH /api/v1/calendar/connections/[id]` - Update settings

#### OAuth Flow
- `GET /api/v1/calendar/connect?provider={provider}` - Start OAuth
- `GET /api/v1/calendar/callback` - OAuth callback handler

#### Calendar & Event Management
- `GET /api/v1/calendar/calendars` - List all calendars
- `PATCH /api/v1/calendar/calendars` - Update calendar settings
- `GET /api/v1/calendar/events` - Fetch events with filtering
- `POST /api/v1/calendar/events` - Create local events

#### Synchronization
- `POST /api/v1/calendar/connections/[id]/sync` - Sync specific connection
- `POST /api/v1/calendar/sync-all` - Sync all active connections

## Configuration Required

### Environment Variables
Add these to your `.env.local` file:

```env
# Google Calendar
GOOGLE_CALENDAR_CLIENT_ID=your_google_client_id
GOOGLE_CALENDAR_CLIENT_SECRET=your_google_client_secret

# Microsoft (Outlook/Office 365)
OUTLOOK_CLIENT_ID=your_outlook_client_id
OUTLOOK_CLIENT_SECRET=your_outlook_client_secret
OFFICE365_CLIENT_ID=your_office365_client_id
OFFICE365_CLIENT_SECRET=your_office365_client_secret

# Apple Calendar
APPLE_CLIENT_ID=your_apple_client_id
APPLE_CLIENT_SECRET=your_apple_client_secret

# Yahoo Calendar
YAHOO_CLIENT_ID=your_yahoo_client_id
YAHOO_CLIENT_SECRET=your_yahoo_client_secret
```

### OAuth Setup Steps

#### Google Calendar
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials
5. Add redirect URI: `https://your-domain.com/api/v1/calendar/callback`
6. Add scopes: `calendar.readonly`, `calendar.events.readonly`

#### Microsoft (Outlook/Office 365)
1. Go to [Azure App Registration](https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps)
2. Register new application
3. Add redirect URI: `https://your-domain.com/api/v1/calendar/callback`
4. Add API permissions: `Calendars.Read`, `Calendars.ReadWrite`
5. Create client secret

#### Apple Calendar
1. Sign in to [Apple Developer](https://developer.apple.com)
2. Create new App ID with Sign in with Apple capability
3. Configure calendar access
4. Create service ID for web authentication

## Security Features
- OAuth tokens encrypted at rest
- Row Level Security (RLS) on all tables
- CSRF protection on OAuth flows
- Rate limiting on sync operations
- Audit logging for all operations

## Usage Flow

### For Users
1. Navigate to **Settings → Calendar Integrations**
2. Click "Connect" on desired calendar provider
3. Authorize access in provider's OAuth screen
4. Return to LifeNavigator with calendars synced
5. View all events in unified calendar view
6. Toggle calendar visibility as needed
7. Events sync automatically every 15 minutes

### For Developers
1. Run database migration: `supabase migration up`
2. Configure OAuth credentials in environment
3. Deploy OAuth callback handlers
4. Test with each provider
5. Monitor sync queue for issues

## Sync Architecture
- Initial full sync on connection
- Incremental syncs every 15 minutes
- Manual sync available anytime
- Webhook support for real-time updates (Google, Microsoft)
- Conflict resolution for locally modified events

## Limitations & Considerations
- Free tier: Limited to 3 calendar connections
- Events synced: Past 1 year, future 1 year (configurable)
- Rate limits vary by provider
- Some providers require paid developer accounts
- CalDAV support depends on server implementation

## Future Enhancements
1. **Two-way sync** - Create/edit events in external calendars
2. **Recurring event editing** - Full RRULE support
3. **Shared calendar permissions** - Granular access control
4. **Mobile app integration** - Native calendar sync
5. **Advanced filtering** - By attendee, location, etc.
6. **Calendar analytics** - Time tracking and insights
7. **Meeting room booking** - For Office 365
8. **Travel time** - Automatic buffer time for locations

## Troubleshooting

### Common Issues
1. **"Provider not configured"** - Add OAuth credentials to environment
2. **Token expired** - Automatic refresh should handle, manual reconnect if needed
3. **Sync failed** - Check provider API status and rate limits
4. **Missing events** - Verify calendar visibility settings
5. **Duplicate events** - Clear cache and force full sync

### Debug Mode
Enable detailed logging:
```typescript
// In sync functions
console.log('Calendar sync details:', {
  provider,
  calendarsFound,
  eventssynced,
  errors
})
```

The calendar integration system provides a seamless way for users to centralize all their calendars in LifeNavigator, ensuring they never miss important events across their personal, work, and other calendars.