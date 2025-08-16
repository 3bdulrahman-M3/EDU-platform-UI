# Live Session Implementation Guide

## Overview

This guide covers the complete implementation of live session functionality, including session starting, joining, and ending workflows.

## Frontend Implementation ✅

### 1. **Live Session Page** (`/sessions/[id]/live`)

- ✅ **Waiting Room**: Shows participants before session starts
- ✅ **Live Session View**: Video grid and controls during session
- ✅ **Session Ended**: Shows when session is completed
- ✅ **Role-based Access**: Different views for creators vs participants

### 2. **API Integration** ✅

- ✅ **Start Session**: `POST /api/sessions/{id}/start/`
- ✅ **End Session**: `POST /api/sessions/{id}/end/`
- ✅ **Join Live Session**: `POST /api/sessions/{id}/join_live/`
- ✅ **Leave Live Session**: `POST /api/sessions/{id}/leave_live/`

### 3. **UI Components** ✅

- ✅ **Video Grid**: Display participants in grid layout
- ✅ **Audio/Video Controls**: Toggle microphone and camera
- ✅ **Participant List**: Show who's in the session
- ✅ **Chat Interface**: Real-time messaging (mock)
- ✅ **Settings Modal**: Audio/video device settings

## Backend Implementation Required

### 1. **Django Models**

```python
# models.py
class Session(models.Model):
    # ... existing fields ...
    status = models.CharField(max_length=20, choices=[
        ('pending_approval', 'Pending Approval'),
        ('approved', 'Approved'),
        ('scheduled', 'Scheduled'),
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('expired', 'Expired'),
    ])
    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)

class LiveSessionParticipant(models.Model):
    session = models.ForeignKey(Session, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)
    left_at = models.DateTimeField(null=True, blank=True)
    audio_enabled = models.BooleanField(default=False)
    video_enabled = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
```

### 2. **Django Views**

```python
# views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils import timezone

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_session(request, session_id):
    """Start a live session (creators only)"""
    try:
        session = get_object_or_404(Session, id=session_id)

        # Check if user is the creator
        if session.creator != request.user:
            return Response(
                {'error': 'Only the session creator can start the session'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Check if session is in correct state
        if session.status != 'scheduled':
            return Response(
                {'error': 'Session must be scheduled to start'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Start the session
        session.status = 'ongoing'
        session.started_at = timezone.now()
        session.save()

        # Add creator as first live participant
        LiveSessionParticipant.objects.create(
            session=session,
            user=request.user,
            audio_enabled=False,
            video_enabled=False
        )

        return Response({
            'message': 'Session started successfully',
            'session': {
                'id': session.id,
                'status': session.status,
                'started_at': session.started_at,
                'participants': session.livesessionparticipant_set.filter(is_active=True).count()
            }
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def end_session(request, session_id):
    """End a live session (creators only)"""
    try:
        session = get_object_or_404(Session, id=session_id)

        # Check if user is the creator
        if session.creator != request.user:
            return Response(
                {'error': 'Only the session creator can end the session'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Check if session is ongoing
        if session.status != 'ongoing':
            return Response(
                {'error': 'Session is not currently ongoing'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # End the session
        session.status = 'completed'
        session.ended_at = timezone.now()
        session.save()

        # Mark all participants as inactive
        LiveSessionParticipant.objects.filter(
            session=session,
            is_active=True
        ).update(
            is_active=False,
            left_at=timezone.now()
        )

        return Response({
            'message': 'Session ended successfully',
            'session': {
                'id': session.id,
                'status': session.status,
                'ended_at': session.ended_at
            }
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_live_session(request, session_id):
    """Join a live session (participants only)"""
    try:
        session = get_object_or_404(Session, id=session_id)

        # Check if session is ongoing
        if session.status != 'ongoing':
            return Response(
                {'error': 'Session is not currently ongoing'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if user is approved participant
        if not session.participants.filter(user=request.user, status='approved').exists():
            return Response(
                {'error': 'You must be an approved participant to join'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Check if already in live session
        existing_participant = LiveSessionParticipant.objects.filter(
            session=session,
            user=request.user,
            is_active=True
        ).first()

        if existing_participant:
            return Response(
                {'error': 'You are already in this live session'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Join the live session
        LiveSessionParticipant.objects.create(
            session=session,
            user=request.user,
            audio_enabled=False,
            video_enabled=False
        )

        return Response({
            'message': 'Joined live session successfully',
            'session': {
                'id': session.id,
                'participants': session.livesessionparticipant_set.filter(is_active=True).count()
            }
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def leave_live_session(request, session_id):
    """Leave a live session"""
    try:
        session = get_object_or_404(Session, id=session_id)

        # Find and mark participant as inactive
        participant = LiveSessionParticipant.objects.filter(
            session=session,
            user=request.user,
            is_active=True
        ).first()

        if participant:
            participant.is_active = False
            participant.left_at = timezone.now()
            participant.save()

        return Response({
            'message': 'Left live session successfully'
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_live_session_participants(request, session_id):
    """Get current live session participants"""
    try:
        session = get_object_or_404(Session, id=session_id)

        participants = LiveSessionParticipant.objects.filter(
            session=session,
            is_active=True
        ).select_related('user')

        return Response({
            'participants': [{
                'id': p.id,
                'user': {
                    'id': p.user.id,
                    'first_name': p.user.first_name,
                    'last_name': p.user.last_name,
                    'username': p.user.username
                },
                'joined_at': p.joined_at,
                'audio_enabled': p.audio_enabled,
                'video_enabled': p.video_enabled
            } for p in participants]
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
```

### 3. **URL Configuration**

```python
# urls.py
from django.urls import path
from . import views

urlpatterns = [
    # ... existing URLs ...
    path('sessions/<int:session_id>/start/', views.start_session, name='start_session'),
    path('sessions/<int:session_id>/end/', views.end_session, name='end_session'),
    path('sessions/<int:session_id>/join_live/', views.join_live_session, name='join_live_session'),
    path('sessions/<int:session_id>/leave_live/', views.leave_live_session, name='leave_live_session'),
    path('sessions/<int:session_id>/live_participants/', views.get_live_session_participants, name='get_live_session_participants'),
]
```

## Live Session Workflow

### 1. **Session Creator Workflow**

1. **Create Session** → Status: `scheduled`
2. **Approve Participants** → Participants can join
3. **Start Session** → Status: `ongoing`
4. **Manage Live Session** → Control audio/video, monitor participants
5. **End Session** → Status: `completed`

### 2. **Participant Workflow**

1. **Request to Join** → Creates booking request
2. **Wait for Approval** → Creator approves/rejects
3. **Join Live Session** → When session starts
4. **Participate** → Audio/video, chat, raise hand
5. **Leave Session** → Automatically or manually

### 3. **Session States**

- **`scheduled`**: Session is ready, waiting to start
- **`ongoing`**: Live session is active
- **`completed`**: Session has ended
- **`cancelled`**: Session was cancelled

## Testing Steps

### 1. **Test Session Creation**

```bash
# Create a session as instructor
# Verify status is 'scheduled'
```

### 2. **Test Participant Approval**

```bash
# Login as student
# Request to join session
# Login as instructor
# Approve the request
```

### 3. **Test Session Starting**

```bash
# Login as instructor
# Go to session details
# Click "Start Session"
# Verify status changes to 'ongoing'
```

### 4. **Test Live Session Joining**

```bash
# Login as approved student
# Go to session details
# Click "Join Live Session"
# Verify participant appears in live session
```

### 5. **Test Session Ending**

```bash
# Login as instructor
# In live session, click "End Session"
# Verify status changes to 'completed'
```

## Future Enhancements

### 1. **WebRTC Integration**

- Real-time video/audio streaming
- Screen sharing
- Whiteboard collaboration

### 2. **Real-time Features**

- Live chat with WebSocket
- Participant status updates
- Hand raising notifications

### 3. **Recording**

- Session recording
- Playback functionality
- Download options

### 4. **Advanced Controls**

- Mute all participants
- Remove participants
- Breakout rooms

## Error Handling

### Common Issues:

1. **Session not in correct state** → Check status before actions
2. **User not authorized** → Verify permissions
3. **Already in session** → Check existing participation
4. **Session full** → Check participant limits

### Error Responses:

- **400**: Bad request (wrong state, already joined, etc.)
- **403**: Forbidden (not authorized)
- **404**: Session not found
- **500**: Server error

This implementation provides a solid foundation for live session functionality that can be extended with WebRTC and real-time features.
