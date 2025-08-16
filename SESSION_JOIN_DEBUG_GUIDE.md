# Session Join 400 Error Debugging Guide

## Problem Description

Users are experiencing a 400 (Bad Request) error when attempting to join sessions.

## Root Cause Analysis

### 1. **User ID Mismatch Issue** ✅ FIXED

- **Problem**: SessionCard component was using hardcoded user ID `1` instead of current user ID
- **Fix**: Updated to use `user?.id` from auth context
- **Files Modified**: `src/components/SessionCard.tsx`

### 2. **API Payload Issues**

- **Problem**: API might expect different payload structure
- **Current Payload**: `{ message?: string }`
- **Potential Issues**:
  - Missing required fields
  - Wrong field names
  - Invalid data types

### 3. **Authentication Issues**

- **Problem**: User might not be properly authenticated
- **Check**: Verify auth token is present and valid
- **Fix**: Ensure user is logged in before joining

### 4. **Session Status Issues**

- **Problem**: Session might not be in joinable state
- **Valid Statuses**: `scheduled`, `approved`
- **Invalid Statuses**: `completed`, `cancelled`, `expired`

## Debugging Steps

### Step 1: Check Browser Console

1. Open browser developer tools (F12)
2. Go to Console tab
3. Try to join a session
4. Look for error messages and logs

### Step 2: Check Network Tab

1. Go to Network tab in developer tools
2. Try to join a session
3. Look for the failed request
4. Check:
   - Request URL
   - Request payload
   - Response status
   - Response body

### Step 3: Verify Authentication

```javascript
// In browser console, check:
console.log("Auth token:", localStorage.getItem("authToken"));
console.log("User data:", localStorage.getItem("user"));
```

### Step 4: Check Session Data

```javascript
// Verify session is joinable
console.log("Session status:", session.status);
console.log("Session participants:", session.participants);
console.log("Max participants:", session.max_participants);
```

## Common 400 Error Causes

### 1. **Missing Required Fields**

```json
// Expected by backend
{
  "user_id": 123,
  "message": "Optional message"
}

// Currently sending
{
  "message": "Optional message"
}
```

### 2. **Invalid Session ID**

- Session doesn't exist
- Session ID is not a number
- Session is not accessible to current user

### 3. **Session Full**

- Maximum participants reached
- No available spots

### 4. **User Already Joined**

- User is already a participant
- User has pending request

### 5. **Invalid Session Status**

- Session is completed/cancelled
- Session is not yet approved

## Fixes Applied

### 1. **Fixed User ID Usage**

```typescript
// Before (BROKEN)
const isJoined = session.participants?.some((p) => p.user.id === 1) || false;
const isCreator = session.creator?.id === 1;

// After (FIXED)
const isJoined =
  session.participants?.some((p) => p.user.id === user?.id) || false;
const isCreator = session.creator?.id === user?.id;
```

### 2. **Enhanced Error Handling**

```typescript
// Added detailed error logging
console.log("Attempting to join session:", session.id);
console.log("Current user:", user);

// Added specific error messages for different status codes
if (response?.status === 400) {
  setError(
    `Bad request: ${
      response.data?.message || response.data?.detail || "Invalid request data"
    }`
  );
} else if (response?.status === 401) {
  setError("You must be logged in to join sessions");
}
```

### 3. **Fixed Session Status Check**

```typescript
// Before (BROKEN)
session.status === "upcoming";

// After (FIXED)
session.status === "scheduled";
```

## Testing Steps

### 1. **Test with Valid Session**

1. Create a session as instructor
2. Log in as different user (student)
3. Try to join the session
4. Check console for logs

### 2. **Test Error Scenarios**

1. Try to join non-existent session
2. Try to join full session
3. Try to join completed session
4. Try to join without being logged in

### 3. **Test API Directly**

```bash
# Test with curl
curl -X POST http://localhost:8000/api/sessions/1/join/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Test request"}'
```

## Backend API Expectations

### Expected Endpoint

```
POST /api/sessions/{session_id}/join/
```

### Expected Headers

```
Authorization: Bearer <token>
Content-Type: application/json
```

### Expected Payload

```json
{
  "message": "Optional message from user"
}
```

### Expected Response

```json
{
  "id": 1,
  "user": {
    "id": 123,
    "first_name": "John",
    "last_name": "Doe"
  },
  "session_id": 1,
  "requested_at": "2024-01-01T12:00:00Z",
  "status": "pending",
  "message": "Optional message"
}
```

## Next Steps

1. **Test the fixes** with the updated code
2. **Check browser console** for detailed error messages
3. **Verify backend API** matches frontend expectations
4. **Update API documentation** if needed
5. **Add unit tests** for join functionality

## Monitoring

### Add to Error Tracking

```typescript
// Log all join session attempts
console.log("Join session attempt:", {
  sessionId: session.id,
  userId: user?.id,
  sessionStatus: session.status,
  timestamp: new Date().toISOString(),
});
```

### Add Success Tracking

```typescript
// Log successful joins
console.log("Session joined successfully:", {
  sessionId: session.id,
  userId: user?.id,
  timestamp: new Date().toISOString(),
});
```

This debugging guide should help identify and resolve the 400 error when joining sessions.
