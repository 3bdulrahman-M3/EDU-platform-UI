// Google OAuth Configuration
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

// Google OAuth helper functions
export const googleAuthConfig = {
  clientId: GOOGLE_CLIENT_ID,
  scope: "openid email profile",
};

// Function to test Google token format
export const testGoogleToken = (credential: string) => {
  try {
    // Check if it's a valid JWT format (3 parts separated by dots)
    const parts = credential.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid JWT format");
    }

    // Try to decode the payload
    const payload = JSON.parse(atob(parts[1]));

    console.log("=== GOOGLE TOKEN TEST ===");
    console.log("Token format: Valid JWT");
    console.log("Payload keys:", Object.keys(payload));
    console.log("Email:", payload.email);
    console.log("Google ID:", payload.sub);
    console.log("Name:", payload.given_name, payload.family_name);
    console.log("=========================");

    return {
      isValid: true,
      payload,
      email: payload.email,
      googleId: payload.sub,
      firstName: payload.given_name,
      lastName: payload.family_name,
    };
  } catch (error) {
    console.error("Google token test failed:", error);
    return {
      isValid: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Function to handle Google login
export const handleGoogleLogin = async (credential: string) => {
  try {
    // Test the token first
    const tokenTest = testGoogleToken(credential);
    if (!tokenTest.isValid) {
      throw new Error(`Invalid Google token: ${tokenTest.error}`);
    }

    // Decode the JWT token to get user info
    const payload = JSON.parse(atob(credential.split(".")[1]));

    return {
      email: payload.email,
      firstName: payload.given_name,
      lastName: payload.family_name,
      picture: payload.picture,
      googleId: payload.sub, // This matches the backend's google_id field
    };
  } catch (error) {
    console.error("Error decoding Google credential:", error);
    throw new Error("Failed to process Google login");
  }
};

// Function to validate Google token on backend
export const validateGoogleToken = async (credential: string) => {
  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
      }/auth/google/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: credential }), // Backend expects 'token' field
      }
    );

    if (!response.ok) {
      throw new Error("Google authentication failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Error validating Google token:", error);
    throw error;
  }
};

/*
NOTE: Your backend references a `verify_google_token` service that needs to be implemented.
This service should:
1. Verify the Google JWT token using Google's public keys
2. Extract user information from the token
3. Return user data in the format expected by your backend

Example implementation in your backend:
```python
# services.py
import os
import requests
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.conf import settings
from django.core.exceptions import ValidationError

def verify_google_token(token):
    """
    Verify Google ID token and return user info
    """
    try:
        # Get Google Client ID from environment
        google_client_id = os.getenv('GOOGLE_CLIENT_ID')
        if not google_client_id:
            raise ValidationError("Google Client ID not configured")

        # Verify the token with clock skew tolerance
        idinfo = id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            google_client_id,
            clock_skew_in_seconds=10  # Allow 10 seconds of clock skew
        )

        # Extract user information
        google_id = idinfo['sub']
        email = idinfo['email']
        first_name = idinfo.get('given_name', '')
        last_name = idinfo.get('family_name', '')

        return {
            'google_id': google_id,
            'email': email,
            'first_name': first_name,
            'last_name': last_name,
            'email_verified': idinfo.get('email_verified', False)
        }

    except ValueError as e:
        raise ValidationError(f"Invalid Google token: {str(e)}")
    except Exception as e:
        raise ValidationError(f"Error verifying Google token: {str(e)}")

# views.py - Update your google_auth view:
@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    """
    Handle Google OAuth authentication
    """
    serializer = GoogleAuthSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Verify Google token
        google_user_info = verify_google_token(serializer.validated_data['token'])
        
        # Check if user exists
        try:
            user = User.objects.get(google_id=google_user_info['google_id'])
            is_new_user = False
        except User.DoesNotExist:
            # Check if user exists with email but no google_id
            try:
                user = User.objects.get(email=google_user_info['email'])
                # Link existing user with Google ID
                user.google_id = google_user_info['google_id']
                user.first_name = google_user_info['first_name']
                user.last_name = google_user_info['last_name']
                user.save()
                is_new_user = False
            except User.DoesNotExist:
                # Create new user with default role
                user = User.objects.create_user(
                    email=google_user_info['email'],
                    username=google_user_info['email'],  # Use email as username
                    first_name=google_user_info['first_name'],
                    last_name=google_user_info['last_name'],
                    google_id=google_user_info['google_id'],
                    role='student'  # Default role - will be updated in role selection
                )
                is_new_user = True
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserProfileSerializer(user).data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            },
            'isNewUser': is_new_user  # This is crucial for frontend flow
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
```

IMPORTANT: You need to set the GOOGLE_CLIENT_ID environment variable in your Django backend:
1. Create a .env file in your Django project root
2. Add: GOOGLE_CLIENT_ID=your_google_client_id_here
3. Make sure your Django settings.py loads the .env file with python-dotenv
4. Install google-auth: pip install google-auth

CRITICAL FIX: Add clock_skew_in_seconds=10 to handle timing issues between frontend and backend clocks.

CRITICAL FIX 2: Make sure your backend returns isNewUser: true for new Google users so the role selection page shows.
*/
