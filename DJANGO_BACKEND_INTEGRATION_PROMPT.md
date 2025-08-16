# Django Backend Integration Prompt for P2P Session System

## Overview

You need to integrate your Django backend with a React/Next.js frontend that implements a Peer-to-Peer Session system. The frontend is already built with mock data and is ready for real API integration.

## Frontend Architecture Summary

- **Framework**: Next.js 14 with TypeScript and Tailwind CSS
- **State Management**: React Context (AuthContext) + useState/useEffect
- **Mock Service**: `src/lib/mockSessionService.ts` (ready to replace with real API calls)
- **Key Components**: SessionCard, StatusBadge, ParticipantList, NotificationDropdown
- **Pages**: `/sessions`, `/my-sessions`, `/sessions/[id]`
- **Authentication**: JWT-based with Google OAuth support

## Required Django Models

### 1. Session Model

```python
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Session(models.Model):
    LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]

    STATUS_CHOICES = [
        ('pending_approval', 'Pending Approval'),
        ('approved', 'Approved'),
        ('scheduled', 'Scheduled'),
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('expired', 'Expired'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    subject = models.CharField(max_length=100)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES)
    date = models.DateTimeField()  # Store in UTC
    duration = models.IntegerField(help_text="Duration in minutes")
    max_participants = models.IntegerField(default=10)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_sessions')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending_approval')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    @property
    def is_full(self):
        return self.participants.filter(status='approved').count() >= self.max_participants

    @property
    def available_spots(self):
        return max(0, self.max_participants - self.participants.filter(status='approved').count())

    @property
    def participant_count(self):
        return self.participants.filter(status='approved').count()
```

### 2. Participant Model

```python
class Participant(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    ROLE_CHOICES = [
        ('student', 'Student'),
        ('tutor', 'Tutor'),
    ]

    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['session', 'user']
```

### 3. BookingRequest Model

```python
class BookingRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name='booking_requests')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    requested_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['session', 'user']
```

### 4. SessionMaterial Model

```python
class SessionMaterial(models.Model):
    TYPE_CHOICES = [
        ('file', 'File'),
        ('link', 'Link'),
        ('note', 'Note'),
    ]

    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name='materials')
    title = models.CharField(max_length=200)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    url = models.URLField(blank=True)
    file = models.FileField(upload_to='session_materials/', blank=True)
    file_name = models.CharField(max_length=255, blank=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)
```

### 5. Notification Model

```python
class Notification(models.Model):
    TYPE_CHOICES = [
        ('reminder', 'Reminder'),
        ('booking_request', 'Booking Request'),
        ('session_update', 'Session Update'),
        ('general', 'General'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    session = models.ForeignKey(Session, on_delete=models.CASCADE, null=True, blank=True)
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
```

## Required Django Serializers

### 1. User Serializer

```python
from rest_framework import serializers
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'date_joined']
```

### 2. Session Serializer

```python
from rest_framework import serializers
from .models import Session, Participant, BookingRequest, SessionMaterial

class SessionSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    participants = serializers.SerializerMethodField()
    materials = serializers.SerializerMethodField()
    booking_requests = serializers.SerializerMethodField()
    is_full = serializers.ReadOnlyField()
    available_spots = serializers.ReadOnlyField()
    participant_count = serializers.ReadOnlyField()
    can_join = serializers.SerializerMethodField()

    class Meta:
        model = Session
        fields = '__all__'

    def get_participants(self, obj):
        return ParticipantSerializer(obj.participants.all(), many=True).data

    def get_materials(self, obj):
        return SessionMaterialSerializer(obj.materials.all(), many=True).data

    def get_booking_requests(self, obj):
        return BookingRequestSerializer(obj.booking_requests.all(), many=True).data

    def get_can_join(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False

        # Check if user is already a participant
        if obj.participants.filter(user=request.user).exists():
            return False

        # Check if session is full
        if obj.is_full:
            return False

        # Check if session status allows joining
        return obj.status in ['scheduled', 'approved']
```

### 3. Participant Serializer

```python
class ParticipantSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Participant
        fields = '__all__'
```

### 4. BookingRequest Serializer

```python
class BookingRequestSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = BookingRequest
        fields = '__all__'
```

### 5. SessionMaterial Serializer

```python
class SessionMaterialSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)

    class Meta:
        model = SessionMaterial
        fields = '__all__'
```

### 6. Notification Serializer

```python
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
```

## Required Django Views

### 1. Session Views

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import datetime
import pytz

class SessionViewSet(viewsets.ModelViewSet):
    serializer_class = SessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Session.objects.all()

        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Filter by subject
        subject_filter = self.request.query_params.get('subject', None)
        if subject_filter:
            queryset = queryset.filter(subject__icontains=subject_filter)

        # Filter by level
        level_filter = self.request.query_params.get('level', None)
        if level_filter:
            queryset = queryset.filter(level=level_filter)

        return queryset

    def perform_create(self, serializer):
        # Handle timezone conversion
        date_data = self.request.data.get('date')
        if date_data:
            # Frontend sends datetime with timezone offset
            # Convert to UTC before saving
            user_timezone = self.request.data.get('timezone_offset', 0)
            try:
                # Parse the datetime and adjust for timezone
                dt = datetime.fromisoformat(date_data.replace('Z', '+00:00'))
                utc_dt = dt.astimezone(pytz.UTC)
                serializer.save(creator=self.request.user, date=utc_dt)
            except ValueError:
                # Fallback to direct parsing if timezone info is missing
                serializer.save(creator=self.request.user)
        else:
            serializer.save(creator=self.request.user)

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        session = self.get_object()
        message = request.data.get('message', '')

        # Check if user can join
        if session.is_full:
            return Response({'error': 'Session is full'}, status=status.HTTP_400_BAD_REQUEST)

        if session.participants.filter(user=request.user).exists():
            return Response({'error': 'Already joined'}, status=status.HTTP_400_BAD_REQUEST)

        # Create booking request
        booking_request = BookingRequest.objects.create(
            session=session,
            user=request.user,
            message=message
        )

        # Create notification for session creator
        Notification.objects.create(
            user=session.creator,
            title=f"New booking request for {session.title}",
            message=f"{request.user.first_name} {request.user.last_name} wants to join your session.",
            type='booking_request',
            session=session
        )

        return Response(BookingRequestSerializer(booking_request).data)

    @action(detail=True, methods=['post'])
    def approve_request(self, request, pk=None):
        session = self.get_object()
        user_id = request.data.get('user_id')

        if session.creator != request.user:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

        try:
            booking_request = session.booking_requests.get(user_id=user_id, status='pending')
            booking_request.status = 'approved'
            booking_request.save()

            # Create participant
            Participant.objects.create(
                session=session,
                user=booking_request.user,
                status='approved'
            )

            # Create notification
            Notification.objects.create(
                user=booking_request.user,
                title=f"Booking request approved for {session.title}",
                message=f"Your request to join {session.title} has been approved.",
                type='session_update',
                session=session
            )

            return Response({'message': 'Request approved'})
        except BookingRequest.DoesNotExist:
            return Response({'error': 'Request not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def reject_request(self, request, pk=None):
        session = self.get_object()
        user_id = request.data.get('user_id')

        if session.creator != request.user:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

        try:
            booking_request = session.booking_requests.get(user_id=user_id, status='pending')
            booking_request.status = 'rejected'
            booking_request.save()

            # Create notification
            Notification.objects.create(
                user=booking_request.user,
                title=f"Booking request rejected for {session.title}",
                message=f"Your request to join {session.title} has been rejected.",
                type='session_update',
                session=session
            )

            return Response({'message': 'Request rejected'})
        except BookingRequest.DoesNotExist:
            return Response({'error': 'Request not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        session = self.get_object()

        # Check if user is creator or participant
        if session.creator != request.user and not session.participants.filter(user=request.user).exists():
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

        session.status = 'cancelled'
        session.save()

        # Notify all participants
        for participant in session.participants.all():
            Notification.objects.create(
                user=participant.user,
                title=f"Session cancelled: {session.title}",
                message=f"The session {session.title} has been cancelled.",
                type='session_update',
                session=session
            )

        return Response({'message': 'Session cancelled'})

    @action(detail=False, methods=['get'])
    def my_sessions(self, request):
        # Sessions created by user
        created_sessions = Session.objects.filter(creator=request.user)

        # Sessions joined by user
        joined_sessions = Session.objects.filter(participants__user=request.user)

        return Response({
            'created': SessionSerializer(created_sessions, many=True, context={'request': request}).data,
            'joined': SessionSerializer(joined_sessions, many=True, context={'request': request}).data
        })
```

### 2. Notification Views

```python
class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        notification.read = True
        notification.save()
        return Response({'message': 'Marked as read'})

    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        Notification.objects.filter(user=request.user, read=False).update(read=True)
        return Response({'message': 'All marked as read'})
```

### 3. SessionMaterial Views

```python
class SessionMaterialViewSet(viewsets.ModelViewSet):
    serializer_class = SessionMaterialSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SessionMaterial.objects.filter(session_id=self.kwargs.get('session_pk'))

    def perform_create(self, serializer):
        session_id = self.kwargs.get('session_pk')
        session = Session.objects.get(id=session_id)

        if session.creator != self.request.user:
            raise PermissionDenied("Only session creator can upload materials")

        serializer.save(uploaded_by=self.request.user, session_id=session_id)
```

## Required URL Configuration

### 1. Main URLs

```python
# urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SessionViewSet, NotificationViewSet, SessionMaterialViewSet

router = DefaultRouter()
router.register(r'sessions', SessionViewSet, basename='session')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/sessions/<int:session_pk>/materials/', SessionMaterialViewSet.as_view({'get': 'list', 'post': 'create'}), name='session-materials'),
    path('api/sessions/<int:session_pk>/materials/<int:pk>/', SessionMaterialViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='session-material-detail'),
]
```

## Required API Endpoints

Based on the frontend mock service, you need these endpoints:

### 1. Session Endpoints

- `GET /api/sessions/` - List all sessions (with filters)
- `GET /api/sessions/{id}/` - Get session details
- `POST /api/sessions/` - Create new session
- `PUT /api/sessions/{id}/` - Update session
- `DELETE /api/sessions/{id}/` - Delete session
- `POST /api/sessions/{id}/join/` - Request to join session
- `POST /api/sessions/{id}/approve_request/` - Approve booking request
- `POST /api/sessions/{id}/reject_request/` - Reject booking request
- `POST /api/sessions/{id}/cancel/` - Cancel session
- `GET /api/sessions/my_sessions/` - Get user's sessions

### 2. Notification Endpoints

- `GET /api/notifications/` - Get user's notifications
- `POST /api/notifications/{id}/mark_as_read/` - Mark notification as read
- `POST /api/notifications/mark_all_as_read/` - Mark all as read

### 3. Material Endpoints

- `GET /api/sessions/{session_id}/materials/` - Get session materials
- `POST /api/sessions/{session_id}/materials/` - Upload material
- `PUT /api/sessions/{session_id}/materials/{id}/` - Update material
- `DELETE /api/sessions/{session_id}/materials/{id}/` - Delete material

## Frontend Integration Steps

### 1. Replace Mock Service

Replace `src/lib/mockSessionService.ts` with real API calls:

```typescript
// src/lib/sessionAPI.ts
import { apiConfig } from "./apiConfig";
import {
  Session,
  BookingRequest,
  SessionMaterial,
  Notification,
} from "@/types";

export const sessionAPI = {
  // Get all sessions
  getSessions: async (filters?: any): Promise<Session[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.subject) params.append("subject", filters.subject);
    if (filters?.level) params.append("level", filters.level);

    const response = await apiConfig.get(`/sessions/?${params}`);
    return response.data;
  },

  // Get session details
  getSessionDetails: async (id: number): Promise<Session> => {
    const response = await apiConfig.get(`/sessions/${id}/`);
    return response.data;
  },

  // Create session
  createSession: async (data: Partial<Session>): Promise<Session> => {
    const response = await apiConfig.post("/sessions/", data);
    return response.data;
  },

  // Join session
  joinSession: async (
    sessionId: number,
    message?: string
  ): Promise<BookingRequest> => {
    const response = await apiConfig.post(`/sessions/${sessionId}/join/`, {
      message,
    });
    return response.data;
  },

  // Approve request
  approveRequest: async (sessionId: number, userId: number): Promise<void> => {
    await apiConfig.post(`/sessions/${sessionId}/approve_request/`, {
      user_id: userId,
    });
  },

  // Reject request
  rejectRequest: async (sessionId: number, userId: number): Promise<void> => {
    await apiConfig.post(`/sessions/${sessionId}/reject_request/`, {
      user_id: userId,
    });
  },

  // Cancel session
  cancelSession: async (sessionId: number): Promise<void> => {
    await apiConfig.post(`/sessions/${sessionId}/cancel/`);
  },

  // Get my sessions
  getMySessions: async (): Promise<{
    created: Session[];
    joined: Session[];
  }> => {
    const response = await apiConfig.get("/sessions/my_sessions/");
    return response.data;
  },

  // Get notifications
  getNotifications: async (): Promise<Notification[]> => {
    const response = await apiConfig.get("/notifications/");
    return response.data;
  },

  // Mark notification as read
  markNotificationAsRead: async (notificationId: number): Promise<void> => {
    await apiConfig.post(`/notifications/${notificationId}/mark_as_read/`);
  },

  // Upload material
  uploadMaterial: async (
    sessionId: number,
    material: FormData
  ): Promise<SessionMaterial> => {
    const response = await apiConfig.post(
      `/sessions/${sessionId}/materials/`,
      material,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  },
};
```

### 2. Update Components

Update all components to use the real API instead of the mock service:

```typescript
// In components/pages, replace:
import { mockSessionService } from "@/lib/mockSessionService";
// With:
import { sessionAPI } from "@/lib/sessionAPI";

// Replace all mockSessionService calls with sessionAPI calls
```

### 3. Handle Timezone Conversion

Ensure your frontend sends timezone offset with session creation:

```typescript
// In SessionForm component
const handleSubmit = async (formData: any) => {
  const payload = {
    ...formData,
    timezone_offset: new Date().getTimezoneOffset(), // Send timezone offset
  };

  const session = await sessionAPI.createSession(payload);
  // Handle success
};
```

## Testing Checklist

### 1. Authentication

- [ ] JWT tokens are properly handled
- [ ] Google OAuth integration works
- [ ] Protected routes redirect unauthenticated users
- [ ] User sessions persist across browser reloads

### 2. Session Management

- [ ] Create sessions with proper timezone handling
- [ ] List sessions with filters
- [ ] View session details
- [ ] Join sessions (create booking requests)
- [ ] Approve/reject booking requests
- [ ] Cancel sessions
- [ ] Upload and manage materials

### 3. Notifications

- [ ] Real-time notifications work
- [ ] Mark notifications as read
- [ ] Notification badges update correctly

### 4. Error Handling

- [ ] API errors are properly displayed
- [ ] Network errors are handled gracefully
- [ ] Form validation works correctly

## Performance Considerations

### 1. Database Optimization

- Add indexes on frequently queried fields
- Use `select_related` and `prefetch_related` for related data
- Implement pagination for large datasets

### 2. Caching

- Cache session lists and details
- Use Redis for session storage
- Implement API response caching

### 3. File Uploads

- Configure proper file storage (AWS S3, etc.)
- Implement file size limits
- Add virus scanning for uploaded files

## Security Considerations

### 1. Authentication

- Implement proper JWT token refresh
- Add rate limiting for API endpoints
- Validate user permissions for all operations

### 2. Data Validation

- Validate all input data
- Sanitize user-generated content
- Implement CSRF protection

### 3. File Uploads

- Validate file types and sizes
- Scan uploaded files for malware
- Store files securely

## Deployment Notes

### 1. Environment Variables

```bash
# Django settings
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=your-domain.com
DATABASE_URL=your-database-url
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 2. CORS Configuration

```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "https://your-frontend-domain.com",
    "http://localhost:3000",  # For development
]

CORS_ALLOW_CREDENTIALS = True
```

### 3. Static Files

- Configure static file serving
- Set up media file storage
- Implement CDN for better performance

## Next Steps After Integration

1. **Test thoroughly** - Ensure all features work as expected
2. **Optimize performance** - Add caching and database optimization
3. **Add real-time features** - Implement WebSocket for live notifications
4. **WebRTC integration** - Add video/audio capabilities for live sessions
5. **Mobile optimization** - Ensure responsive design works on all devices
6. **Analytics** - Add user behavior tracking
7. **Monitoring** - Set up error tracking and performance monitoring

## Support and Debugging

If you encounter issues during integration:

1. Check the browser's Network tab for API errors
2. Verify Django logs for backend errors
3. Ensure CORS is properly configured
4. Validate JWT token handling
5. Test timezone conversion thoroughly
6. Verify file upload permissions and storage

The frontend is designed to be modular and easily replaceable, so you can gradually migrate from mock data to real API calls while maintaining functionality.
