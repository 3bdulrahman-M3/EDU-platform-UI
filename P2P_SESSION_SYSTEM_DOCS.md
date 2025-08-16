# Peer-to-Peer Session System - Frontend Implementation

## Overview

This document provides a comprehensive guide to the Peer-to-Peer (P2P) Session System frontend implementation. The system is designed as an MVP with mock data that can be easily replaced with Django backend APIs and eventually enhanced with WebRTC for live video sessions.

## 🏗️ Architecture

### Core Components

1. **Mock Session Service** (`src/lib/mockSessionService.ts`)

   - Simulates all session-related API calls
   - Maintains in-memory data for development
   - Easy to replace with real API calls

2. **Enhanced TypeScript Types** (`src/types/index.ts`)

   - Extended Session interface with P2P-specific properties
   - New interfaces for BookingRequest, SessionMaterial, Notification

3. **UI Components**

   - `SessionCard`: Enhanced for P2P functionality
   - `StatusBadge`: Color-coded status indicators
   - `ParticipantList`: Avatar-based participant display
   - `NotificationDropdown`: Real-time notifications

4. **Pages**
   - `/sessions`: Browse and search sessions
   - `/my-sessions`: Manage personal sessions (tutor/student views)
   - `/sessions/[id]`: Detailed session view with P2P features

## 📋 Features Implemented

### 1. Session Management

- **Browse Sessions**: Filter by subject, level, date, status
- **Session Details**: Comprehensive view with materials and participants
- **Join Requests**: Students can request to join sessions
- **Approval System**: Tutors can approve/reject join requests

### 2. Role-Based Access

- **Tutor View**: Create sessions, manage requests, upload materials
- **Student View**: Browse sessions, request to join, view materials
- **Status Tracking**: Pending approval, approved, scheduled, completed, cancelled

### 3. Notifications

- Real-time notification system
- Booking request alerts
- Session reminders
- Status updates

### 4. Materials Management

- File uploads (mock implementation)
- Link sharing
- Notes and resources
- Download functionality

## 🔧 Technical Implementation

### Mock Service API

```typescript
// Core session operations
getSessions(filters?: any): Promise<Session[]>
getSessionDetails(id: number): Promise<Session>
createSession(data: Partial<Session>): Promise<Session>

// P2P specific operations
joinSession(sessionId: number, userId: number, message?: string): Promise<BookingRequest>
approveRequest(sessionId: number, userId: number): Promise<Session>
rejectRequest(sessionId: number, userId: number): Promise<Session>
cancelSession(sessionId: number, userId: number): Promise<Session>

// User-specific operations
getMySessions(userId: number): Promise<Session[]>
getCreatedSessions(userId: number): Promise<Session[]>
getJoinedSessions(userId: number): Promise<Session[]>

// Booking requests
getBookingRequests(sessionId: number): Promise<BookingRequest[]>

// Notifications
getNotifications(userId: number): Promise<Notification[]>
markNotificationAsRead(notificationId: number): Promise<void>

// Materials
uploadMaterial(sessionId: number, material: Partial<SessionMaterial>): Promise<SessionMaterial>
```

### Enhanced Session Interface

```typescript
interface Session {
  id: number;
  title: string;
  description: string;
  subject: string; // NEW: Subject category
  level: "beginner" | "intermediate" | "advanced"; // NEW: Difficulty level
  date: string; // UTC datetime
  duration: number; // NEW: Duration in minutes
  max_participants: number;
  creator: User;
  participants: Participant[];
  status:
    | "pending_approval"
    | "approved"
    | "scheduled"
    | "ongoing"
    | "completed"
    | "cancelled"
    | "expired"; // ENHANCED
  created_at: string;
  updated_at: string;

  // P2P specific properties
  materials?: SessionMaterial[]; // NEW: Session materials
  booking_requests?: BookingRequest[]; // NEW: Pending requests
}
```

### New Interfaces

```typescript
interface Participant {
  id: number;
  user: User;
  joined_at: string;
  role: "student" | "tutor";
  status: "pending" | "approved" | "rejected"; // NEW: Request status
}

interface BookingRequest {
  id: number;
  user: User;
  session_id: number;
  requested_at: string;
  status: "pending" | "approved" | "rejected";
  message?: string; // Optional message from student
}

interface SessionMaterial {
  id: number;
  title: string;
  type: "file" | "link" | "note";
  url?: string;
  file_name?: string;
  uploaded_by: User;
  uploaded_at: string;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  type: "reminder" | "booking_request" | "session_update" | "general";
  created_at: string;
  read: boolean;
  session_id?: number;
}
```

## 🎨 UI Components

### SessionCard Enhancements

- **Request to Join**: Instead of direct join, students request approval
- **Status Indicators**: Shows pending requests, approved status
- **Role-Based Actions**: Different buttons for tutors vs students

### StatusBadge Component

- **Color-coded statuses**: Yellow (pending), Green (approved), Blue (scheduled), etc.
- **Multiple sizes**: sm, md, lg for different contexts
- **Consistent styling**: Border and background colors

### ParticipantList Component

- **Avatar display**: Initials with color coding
- **Status indicators**: Pending approval shown with yellow dot
- **Overflow handling**: Shows "+X more" for large groups

### NotificationDropdown Component

- **Real-time updates**: Fetches notifications when opened
- **Type-based icons**: Different icons for different notification types
- **Mark as read**: Click to dismiss notifications
- **Time ago display**: Shows relative time

## 📱 Pages Implementation

### Sessions Browse Page (`/sessions`)

- **Advanced filtering**: Subject, level, date range, status
- **Search functionality**: Search by title, description, tutor name
- **Responsive grid**: Cards layout with hover effects
- **Loading states**: Skeleton loading for better UX

### My Sessions Page (`/my-sessions`)

- **Tabbed interface**: "As Tutor" and "As Student" views
- **Statistics dashboard**: Total, upcoming, ongoing, completed sessions
- **Role-specific actions**: Manage requests (tutor) vs cancel booking (student)

### Session Details Page (`/sessions/[id]`)

- **Comprehensive view**: All session information in one place
- **Booking requests management**: For tutors to approve/reject requests
- **Materials section**: Display and upload session materials
- **Live session button**: Placeholder for future WebRTC integration
- **Request modal**: Students can add messages when requesting to join

## 🔄 State Management

### Authentication Context

- **User state**: Current user information and authentication status
- **Role-based access**: Different views based on user role
- **Session persistence**: Maintains login state across page reloads

### Local State Management

- **Loading states**: For all async operations
- **Error handling**: Comprehensive error messages and recovery
- **Success feedback**: Toast messages for successful actions

## 🚀 Integration Guide

### 1. Replace Mock Service with Django API

```typescript
// Replace mockSessionService with real API calls
// Example: src/lib/sessionAPI.ts

export const sessionAPI = {
  getSessions: async (filters?: any): Promise<Session[]> => {
    const response = await api.get("/api/sessions/", { params: filters });
    return response.data;
  },

  joinSession: async (
    sessionId: number,
    message?: string
  ): Promise<BookingRequest> => {
    const response = await api.post(`/api/sessions/${sessionId}/request/`, {
      message,
    });
    return response.data;
  },

  // ... other methods
};
```

### 2. Django Backend Requirements

#### Models

```python
class Session(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    subject = models.CharField(max_length=100)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES)
    date = models.DateTimeField()
    duration = models.IntegerField()  # minutes
    max_participants = models.IntegerField()
    creator = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class BookingRequest(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    session = models.ForeignKey(Session, on_delete=models.CASCADE)
    message = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=REQUEST_STATUS_CHOICES)
    requested_at = models.DateTimeField(auto_now_add=True)

class SessionMaterial(models.Model):
    session = models.ForeignKey(Session, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    material_type = models.CharField(max_length=20, choices=MATERIAL_TYPE_CHOICES)
    file = models.FileField(upload_to='session_materials/', null=True, blank=True)
    url = models.URLField(blank=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)
```

#### API Endpoints

```python
# URLs
urlpatterns = [
    path('sessions/', SessionViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('sessions/<int:pk>/', SessionViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'})),
    path('sessions/<int:pk>/request/', SessionViewSet.as_view({'post': 'request_join'})),
    path('sessions/<int:pk>/approve/<int:user_id>/', SessionViewSet.as_view({'post': 'approve_request'})),
    path('sessions/<int:pk>/reject/<int:user_id>/', SessionViewSet.as_view({'post': 'reject_request'})),
    path('my-sessions/', SessionViewSet.as_view({'get': 'my_sessions'})),
    path('notifications/', NotificationViewSet.as_view({'get': 'list'})),
    path('notifications/<int:pk>/read/', NotificationViewSet.as_view({'post': 'mark_read'})),
]
```

### 3. WebRTC Integration (Future)

```typescript
// Placeholder for WebRTC integration
const handleEnterLiveSession = async () => {
  // 1. Get WebRTC credentials from backend
  const credentials = await api.get(
    `/api/sessions/${sessionId}/webrtc-credentials/`
  );

  // 2. Initialize WebRTC connection
  const peerConnection = new RTCPeerConnection(credentials.config);

  // 3. Set up media streams
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });

  // 4. Connect to signaling server
  const signalingSocket = new WebSocket(credentials.signaling_url);

  // 5. Handle peer connections
  // ... WebRTC implementation
};
```

## 🧪 Testing

### Mock Data Testing

```typescript
// Reset mock data for testing
import { mockSessionService } from "@/lib/mockSessionService";

// Reset all data
mockSessionService.resetMockData();

// Test specific scenarios
const testSession = await mockSessionService.createSession({
  title: "Test Session",
  subject: "Programming",
  level: "beginner",
  // ... other fields
});
```

### Component Testing

```typescript
// Example test for SessionCard
import { render, screen, fireEvent } from "@testing-library/react";
import SessionCard from "@/components/SessionCard";

test("shows request button for available sessions", () => {
  const mockSession = {
    /* session data */
  };
  render(<SessionCard session={mockSession} />);

  expect(screen.getByText("Request to Join")).toBeInTheDocument();
});
```

## 📊 Performance Considerations

### 1. Lazy Loading

- **Component lazy loading**: Load heavy components on demand
- **Image optimization**: Use Next.js Image component for materials
- **Pagination**: Implement for large session lists

### 2. Caching Strategy

- **Session data caching**: Cache session details to reduce API calls
- **User preferences**: Cache user settings and preferences
- **Offline support**: Service worker for basic offline functionality

### 3. Real-time Updates

- **WebSocket integration**: For live notifications and session updates
- **Polling fallback**: Graceful degradation when WebSocket unavailable
- **Optimistic updates**: Update UI immediately, sync with server

## 🔒 Security Considerations

### 1. Authentication

- **JWT tokens**: Secure token-based authentication
- **Role-based access**: Verify user permissions on both frontend and backend
- **Session validation**: Validate session ownership before actions

### 2. Data Validation

- **Input sanitization**: Clean user inputs before processing
- **File upload security**: Validate file types and sizes
- **XSS prevention**: Sanitize user-generated content

### 3. API Security

- **Rate limiting**: Prevent abuse of API endpoints
- **CORS configuration**: Proper cross-origin resource sharing
- **HTTPS enforcement**: Secure all communications

## 🚀 Deployment

### 1. Environment Configuration

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

### 2. Build Optimization

```bash
# Production build
npm run build

# Analyze bundle
npm run analyze

# Start production server
npm start
```

### 3. Monitoring

- **Error tracking**: Integrate Sentry for error monitoring
- **Performance monitoring**: Track Core Web Vitals
- **User analytics**: Monitor user behavior and session usage

## 📈 Future Enhancements

### 1. Real-time Features

- **Live chat**: Real-time messaging during sessions
- **Screen sharing**: Collaborative screen sharing
- **Whiteboard**: Interactive drawing and annotation

### 2. Advanced Scheduling

- **Recurring sessions**: Weekly/monthly session series
- **Calendar integration**: Google Calendar, Outlook sync
- **Time zone handling**: Automatic timezone conversion

### 3. Analytics Dashboard

- **Session analytics**: Attendance, engagement metrics
- **User insights**: Learning progress, session history
- **Performance reports**: Tutor and student performance

### 4. Mobile App

- **React Native**: Cross-platform mobile app
- **Push notifications**: Native mobile notifications
- **Offline mode**: Basic functionality without internet

## 🤝 Contributing

### Code Style

- **TypeScript**: Strict type checking enabled
- **ESLint**: Consistent code formatting
- **Prettier**: Automatic code formatting
- **Husky**: Pre-commit hooks for quality checks

### Git Workflow

```bash
# Feature branch workflow
git checkout -b feature/p2p-sessions
git add .
git commit -m "feat: implement P2P session booking system"
git push origin feature/p2p-sessions
# Create pull request
```

### Documentation

- **Component documentation**: Storybook for UI components
- **API documentation**: OpenAPI/Swagger for backend APIs
- **User guides**: Comprehensive user documentation

---

## 📞 Support

For questions or issues with the P2P Session System:

1. **Documentation**: Check this guide and inline code comments
2. **Issues**: Create GitHub issues with detailed descriptions
3. **Discussions**: Use GitHub Discussions for general questions
4. **Code Review**: Submit pull requests for improvements

---

_This documentation is maintained alongside the codebase and should be updated as the system evolves._
