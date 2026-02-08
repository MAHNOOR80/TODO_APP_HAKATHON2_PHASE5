# API Contract: Suggestions API

**Feature**: 007-cloud-native-k8s-deployment
**Date**: 2026-01-24
**Base Path**: `/api/v1/suggestions`

## Overview

RESTful API for managing autonomous agent suggestions. Users can view active suggestions and dismiss them. Suggestions are created by background agents, not directly by users.

## Authentication

All endpoints require authentication via Better Auth session cookie.

```http
Cookie: session=<session-token>
```

Unauthenticated requests receive:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

## Endpoints

### GET /api/v1/suggestions

List active (non-dismissed) suggestions for the authenticated user.

**Request**:
```http
GET /api/v1/suggestions?limit=20&offset=0&type=overdue_reminder HTTP/1.1
Host: backend:4000
Cookie: session=<session-token>
```

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | integer | No | 20 | Max suggestions to return (1-100) |
| `offset` | integer | No | 0 | Pagination offset |
| `type` | string | No | all | Filter by suggestion_type |
| `dismissed` | boolean | No | false | Include dismissed suggestions |

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "taskId": "660e8400-e29b-41d4-a716-446655440001",
        "suggestionType": "overdue_reminder",
        "message": "Task 'Buy groceries' was due 2 days ago",
        "metadata": {
          "daysOverdue": 2,
          "taskTitle": "Buy groceries"
        },
        "dismissed": false,
        "createdAt": "2026-01-24T10:00:00.000Z",
        "expiresAt": null,
        "task": {
          "id": "660e8400-e29b-41d4-a716-446655440001",
          "title": "Buy groceries",
          "dueDate": "2026-01-22T17:00:00.000Z",
          "priority": "medium",
          "completed": false
        }
      }
    ],
    "pagination": {
      "total": 5,
      "limit": 20,
      "offset": 0,
      "hasMore": false
    }
  },
  "error": null
}
```

**Empty Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "suggestions": [],
    "pagination": {
      "total": 0,
      "limit": 20,
      "offset": 0,
      "hasMore": false
    }
  },
  "error": null
}
```

---

### GET /api/v1/suggestions/:id

Get a specific suggestion by ID.

**Request**:
```http
GET /api/v1/suggestions/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Host: backend:4000
Cookie: session=<session-token>
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "taskId": "660e8400-e29b-41d4-a716-446655440001",
    "suggestionType": "overdue_reminder",
    "message": "Task 'Buy groceries' was due 2 days ago",
    "metadata": {
      "daysOverdue": 2,
      "taskTitle": "Buy groceries"
    },
    "dismissed": false,
    "createdAt": "2026-01-24T10:00:00.000Z",
    "expiresAt": null,
    "task": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "title": "Buy groceries",
      "dueDate": "2026-01-22T17:00:00.000Z",
      "priority": "medium",
      "completed": false
    }
  },
  "error": null
}
```

**Not Found Response** (404 Not Found):
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "NOT_FOUND",
    "message": "Suggestion not found"
  }
}
```

**Forbidden Response** (403 Forbidden):
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have access to this suggestion"
  }
}
```

---

### PATCH /api/v1/suggestions/:id/dismiss

Dismiss a suggestion. Dismissed suggestions are hidden from the default list view.

**Request**:
```http
PATCH /api/v1/suggestions/550e8400-e29b-41d4-a716-446655440000/dismiss HTTP/1.1
Host: backend:4000
Cookie: session=<session-token>
Content-Type: application/json

{}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "dismissed": true,
    "dismissedAt": "2026-01-24T12:00:00.000Z"
  },
  "error": null
}
```

**Already Dismissed Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "dismissed": true,
    "dismissedAt": "2026-01-24T11:00:00.000Z"
  },
  "error": null
}
```

---

### DELETE /api/v1/suggestions/:id

Permanently delete a suggestion. Typically not needed as dismiss is preferred.

**Request**:
```http
DELETE /api/v1/suggestions/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Host: backend:4000
Cookie: session=<session-token>
```

**Success Response** (204 No Content):
```
(empty body)
```

---

### GET /api/v1/suggestions/count

Get count of active (non-dismissed) suggestions for notification badges.

**Request**:
```http
GET /api/v1/suggestions/count HTTP/1.1
Host: backend:4000
Cookie: session=<session-token>
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "count": 3,
    "byType": {
      "overdue_reminder": 2,
      "prioritization": 1,
      "schedule_adjustment": 0,
      "neglected_task": 0,
      "general_insight": 0
    }
  },
  "error": null
}
```

## User Preferences Endpoint

### GET /api/v1/user/preferences

Get user preferences including autonomous agent settings.

**Request**:
```http
GET /api/v1/user/preferences HTTP/1.1
Host: backend:4000
Cookie: session=<session-token>
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "autonomousAgentsEnabled": true
  },
  "error": null
}
```

---

### PATCH /api/v1/user/preferences

Update user preferences.

**Request**:
```http
PATCH /api/v1/user/preferences HTTP/1.1
Host: backend:4000
Cookie: session=<session-token>
Content-Type: application/json

{
  "autonomousAgentsEnabled": false
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "autonomousAgentsEnabled": false
  },
  "error": null
}
```

## Suggestion Types

| Type | Description | Has Task |
|------|-------------|----------|
| `overdue_reminder` | Task is past its due date | Yes |
| `prioritization` | Suggest changing task priority | Yes |
| `schedule_adjustment` | Suggest rescheduling tasks | Yes |
| `neglected_task` | Task hasn't been updated recently | Yes |
| `general_insight` | General productivity observation | No |

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid session |
| `FORBIDDEN` | 403 | User cannot access this resource |
| `NOT_FOUND` | 404 | Suggestion not found |
| `VALIDATION_ERROR` | 400 | Invalid request parameters |
| `INTERNAL_ERROR` | 500 | Server error |

## Rate Limiting

Suggestions API is subject to standard API rate limits:
- 100 requests per minute per user
- 429 Too Many Requests response when exceeded

## Websocket Events (Future)

For real-time suggestion notifications:

```json
{
  "event": "suggestion:created",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "suggestionType": "overdue_reminder",
    "message": "Task 'Buy groceries' was due 2 days ago"
  }
}
```

Note: WebSocket implementation is optional for Phase 4. Polling via `/count` endpoint is acceptable.
