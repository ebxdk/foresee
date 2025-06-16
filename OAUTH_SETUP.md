# OAuth Setup Guide for Connected Apps

This guide explains how to set up OAuth credentials for each connected app in your application.

## Environment Variables

Add these variables to your Replit secrets (not .env files):

```bash
# Google OAuth (for Calendar, Meet, Google Fit)
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
EXPO_PUBLIC_GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Microsoft OAuth (for Outlook, Teams)
EXPO_PUBLIC_MICROSOFT_CLIENT_ID=your_microsoft_client_id_here

# Slack OAuth
EXPO_PUBLIC_SLACK_CLIENT_ID=your_slack_client_id_here
EXPO_PUBLIC_SLACK_CLIENT_SECRET=your_slack_client_secret_here

# Asana OAuth
EXPO_PUBLIC_ASANA_CLIENT_ID=your_asana_client_id_here

# ClickUp OAuth
EXPO_PUBLIC_CLICKUP_CLIENT_ID=your_clickup_client_id_here
EXPO_PUBLIC_CLICKUP_CLIENT_SECRET=your_clickup_client_secret_here

# Zoom OAuth
EXPO_PUBLIC_ZOOM_CLIENT_ID=your_zoom_client_id_here
EXPO_PUBLIC_ZOOM_CLIENT_SECRET=your_zoom_client_secret_here
```

## Setup Instructions by App

### 1. Google Apps (Calendar, Meet, Google Fit)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the APIs:
   - Google Calendar API
   - Google Fit API (if using)
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. **Important**: For Authorized redirect URIs, add:
   - For development: `http://localhost:19000` and `https://localhost:19000`
   - For production: You'll get the actual redirect URI when you build the app
   - **DO NOT** use custom schemes like `myapp://` - Expo handles this automatically
7. Copy Client ID and Client Secret

### 2. Microsoft Apps (Outlook, Teams)

1. Go to [Azure App Registration](https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade)
2. Click "New registration"
3. For redirect URI:
   - Platform: Web
   - URI: `http://localhost:19000` (for development)
4. Under "API permissions", add:
   - Microsoft Graph → Calendars.Read
   - Microsoft Graph → Team.ReadBasic.All
5. Copy Application (client) ID

### 3. Slack

1. Go to [Slack API](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. Under "OAuth & Permissions":
   - Add redirect URL: `http://localhost:19000` (for development)
   - Add OAuth scopes: `channels:read`, `users:read`, `chat:write`
4. Copy Client ID and Client Secret

### 4. Asana

1. Go to [Asana Developers](https://app.asana.com/0/developer-console)
2. Create a new app
3. Set redirect URL: `http://localhost:19000` (for development)
4. Copy Client ID

### 5. ClickUp

1. Go to [ClickUp API](https://app.clickup.com/api)
2. Create a new app
3. Set redirect URL: `http://localhost:19000` (for development)
4. Add OAuth scopes: `task:read`, `team:read`
5. Copy Client ID and Client Secret

### 6. Zoom

1. Go to [Zoom Marketplace](https://marketplace.zoom.us/)
2. "Develop" → "Build App" → "OAuth"
3. Set redirect URL: `http://localhost:19000` (for development)
4. Add scopes: `meeting:read`, `user:read`
5. Copy Client ID and Client Secret

## Important Notes

### Redirect URIs
- **For development**: Use `http://localhost:19000` and `https://localhost:19000`
- **For production**: Expo will provide the correct redirect URI when you build
- **DO NOT** use custom schemes like `myapp://` - Expo AuthSession handles redirects automatically
- The app automatically generates the correct redirect URI using `makeRedirectUri()`

### For your current Google setup:
1. **Remove** the `myapp://oauth/google` URI you just added
2. **Add** these instead:
   - `http://localhost:19000`
   - `https://localhost:19000`
3. Click "Create" to generate your OAuth client

### Scopes
Each app requests specific permissions (scopes). The current configuration requests:
- **Google Calendar**: Read calendar events
- **Outlook**: Read calendar events
- **Slack**: Read channels, users, send messages
- **Asana**: Default project access
- **ClickUp**: Read tasks and teams
- **Zoom**: Read meetings and user info
- **Teams**: Read basic team info

### Security
- Never commit your credentials to version control
- Use Replit's secrets tab for environment variables
- Use different OAuth apps for development and production
- Consider using environment-specific client IDs

### Testing
1. Start with one app (e.g., Google Calendar)
2. Test the full OAuth flow in Expo Go
3. Verify tokens are stored securely
4. Test API calls with stored tokens
5. Test token refresh functionality

## Production Setup

When you're ready for production:
1. Build your app with `expo build` or `eas build`
2. Get the production redirect URI from Expo
3. Update all OAuth apps with the production redirect URI
4. Use production client IDs and secrets

## Troubleshooting

### Common Issues
1. **Invalid redirect URI**: Make sure you're using localhost URLs for development
2. **Scope errors**: Check if requested scopes are approved
3. **Token expiry**: Implement refresh token logic
4. **CORS issues**: Not applicable for mobile apps

### Debug Mode
Add console logs in `services/oauthService.ts` to debug OAuth flows:
```javascript
console.log('Auth request:', authRequest);
console.log('Auth result:', result);
```

## Next Steps

After setting up OAuth:
1. Implement data fetching services for each app
2. Create data synchronization logic
3. Add periodic token refresh
4. Implement data privacy controls
5. Add connection status monitoring 