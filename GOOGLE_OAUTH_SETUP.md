# Google OAuth Setup Guide

## Prerequisites

1. A Google Cloud Console account
2. Your Next.js application running on localhost:3000

## Setup Steps

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized origins:
     - `http://localhost:3000`
     - `https://yourdomain.com` (for production)
   - Add authorized redirect URIs:
     - `http://localhost:3000`
     - `https://yourdomain.com` (for production)
5. Copy the Client ID

### 2. Environment Variables

Create a `.env.local` file in your project root with:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### 3. Backend API Endpoints

Your backend needs to implement these endpoints:

#### POST /api/auth/google/

Handles Google authentication and returns:

```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "student",
    "google_id": "google_user_id"
  },
  "tokens": {
    "access": "access_token",
    "refresh": "refresh_token"
  },
  "isNewUser": true
}
```

#### POST /api/auth/google/complete/

Completes Google registration with role selection:

```json
{
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "google_id": "google_user_id",
  "role": "student"
}
```

### 4. Security Considerations

1. **Token Validation**: Always validate Google tokens on your backend
2. **HTTPS**: Use HTTPS in production
3. **CORS**: Configure CORS properly on your backend
4. **Rate Limiting**: Implement rate limiting on auth endpoints
5. **Input Validation**: Validate all user inputs
6. **Error Handling**: Don't expose sensitive information in error messages

### 5. Testing

1. Start your development server: `npm run dev`
2. Go to `/auth/login` or `/auth/register`
3. Click the Google login button
4. Complete the OAuth flow
5. For new users, you should be redirected to role selection
6. For existing users, you should be logged in directly

### 6. Production Deployment

1. Update your Google OAuth credentials with production domains
2. Set environment variables in your hosting platform
3. Ensure HTTPS is enabled
4. Test the complete flow in production

## Troubleshooting

### Common Issues

1. **"Invalid Client ID"**: Check your Google Client ID in environment variables
2. **"Redirect URI mismatch"**: Ensure redirect URIs match exactly in Google Console
3. **"API not enabled"**: Make sure Google+ API is enabled in your project
4. **CORS errors**: Check your backend CORS configuration

### Debug Mode

The application includes extensive console logging for debugging. Check the browser console for detailed information about the authentication flow.
