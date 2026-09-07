# Mela Seva API Documentation

Base URL: `/api`

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### Response Format

**Success:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {},
  "pagination": null
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": []
}
```

---

## Auth Endpoints

### POST /api/auth/login
Login with mobile/email and password.

**Request:**
```json
{
  "mobile": "9999999999",
  "password": "Admin@123"
}
```
OR
```json
{
  "email": "admin@melaseva.com",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { "_id": "...", "name": "...", "role": "SUPER_ADMIN", ... },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

### POST /api/auth/refresh
Refresh access token.

**Request:**
```json
{ "refreshToken": "eyJ..." }
```

### POST /api/auth/logout
Logout and invalidate refresh token.

### GET /api/auth/me
Get current user profile.

### PUT /api/auth/change-password
Change password.

**Request:**
```json
{ "currentPassword": "old123", "newPassword": "new123" }
```

---

## Complaint Endpoints

### POST /api/complaints
Create a new complaint. Public endpoint (no auth required).

**Request (multipart/form-data):**
```
event: ObjectId
asset: ObjectId (optional)
department: ObjectId
category: String
description: String
priority: CRITICAL|HIGH|MEDIUM|LOW
complainant.name: String
complainant.mobile: String
complainant.email: String (optional)
complaintPhotos: File[] (optional, max 3)
source: QR_SCAN|WEB|MOBILE|PHONE|WALK_IN
language: en|hi
```

### GET /api/complaints
List complaints with filters. Auth required.

**Query Params:**
- `page` (default: 1)
- `limit` (default: 20)
- `status` - Filter by status
- `department` - Filter by department ID
- `priority` - Filter by priority
- `search` - Search complaint number, name, mobile
- `startDate`, `endDate` - Date range
- `sort` - Sort field (default: -createdAt)

### GET /api/complaints/:id
Get complaint details with full history.

### PUT /api/complaints/:id/assign
Assign complaint to officer.

**Request:**
```json
{
  "assignedTo": "userId",
  "priority": "HIGH",
  "assignedRemarks": "Urgent electrical issue"
}
```

### PUT /api/complaints/:id/status
Update complaint status.

**Request:**
```json
{
  "status": "IN_PROGRESS",
  "remarks": "Officer arrived at location"
}
```

### PUT /api/complaints/:id/resolve
Resolve complaint (multipart/form-data).

**Request:**
```
remarks: String
actionTaken: String
resolutionPhoto: File (optional)
gps.latitude: Number
gps.longitude: Number
```

### GET /api/complaints/track
Public complaint tracking.

**Query Params:**
- `complaintNumber` (required)
- `mobile` (optional)

### GET /api/complaints/dashboard/:eventId
Dashboard statistics.

### GET /api/complaints/map/:eventId
Complaint map data with coordinates.

---

## Asset Endpoints

### POST /api/assets
Create asset. Auth required.

### GET /api/assets
List assets with filters.

### GET /api/assets/:id
Get asset details.

### PUT /api/assets/:id
Update asset.

### DELETE /api/assets/:id
Soft delete asset.

### GET /api/assets/map/:eventId
Asset map data.

### GET /api/assets/nearby
Find nearby assets.

**Query Params:**
- `latitude` (required)
- `longitude` (required)
- `radius` (meters, default: 500)
- `event` (optional)
- `assetType` (optional)

---

## QR Code Endpoints

### POST /api/qr-codes/generate
Generate QR code for asset.

**Request:**
```json
{ "assetId": "ObjectId", "event": "ObjectId" }
```

### POST /api/qr-codes/bulk-generate
Bulk generate QR codes.

**Request:**
```json
{ "assetIds": ["id1", "id2"], "event": "ObjectId" }
```

### GET /api/qr-codes
List QR codes.

### GET /api/qr-codes/scan/:code
Public endpoint - scan QR code and get asset info.

---

## Facility Endpoints

### POST /api/facilities
Create facility.

### GET /api/facilities
List facilities.

### GET /api/facilities/:id
Get facility details.

### GET /api/facilities/nearby
Find nearby facilities.

**Query Params:**
- `latitude`, `longitude`, `radius`, `event`, `type`

### GET /api/facilities/map/:eventId
Facility map data.

---

## Masters Endpoints

### Departments
- `POST /api/masters/departments`
- `GET /api/masters/departments`
- `PUT /api/masters/departments/:id`

### Complaint Categories
- `POST /api/masters/complaint-categories`
- `GET /api/masters/complaint-categories`

### SLA Rules
- `POST /api/masters/sla-rules`
- `GET /api/masters/sla-rules`

### Zones/Sectors/Roads
- `POST /api/masters/zones` | `GET /api/masters/zones`
- `POST /api/masters/sectors` | `GET /api/masters/sectors`
- `POST /api/masters/roads` | `GET /api/masters/roads`

### Audit Logs
- `GET /api/masters/audit-logs`

### Notifications
- `GET /api/masters/notifications`
- `PUT /api/masters/notifications/:id/read`

### SMS Templates
- `POST /api/masters/sms-templates`
- `GET /api/masters/sms-templates`

### Settings
- `GET /api/masters/settings`
- `PUT /api/masters/settings`

---

## Feedback Endpoints

### POST /api/feedback
Submit public feedback.

**Request:**
```json
{
  "event": "ObjectId",
  "rating": 4,
  "service": "Electricity",
  "comments": "Good service",
  "complaint": "ObjectId (optional)",
  "name": "Optional",
  "mobile": "Optional"
}
```

### GET /api/feedback
List feedback (admin).

---

## Event Endpoints

### POST /api/events
Create event (auto-creates default departments, categories, SLA rules).

### GET /api/events
List events.

### GET /api/events/:id
Get event details.

### PUT /api/events/:id
Update event.

---

## User Endpoints

### POST /api/users
Create user.

### GET /api/users
List users.

### GET /api/users/:id
Get user details.

### PUT /api/users/:id
Update user.

### PUT /api/users/:id/reset-password
Reset user password.

### DELETE /api/users/:id
Soft delete user.

---

## WebSocket Events (Socket.IO)

### Client Events
- `join_event` - Join event room for real-time updates
- `join_complaint` - Join complaint room
- `leave_event` - Leave event room

### Server Events
- `notification` - New notification (complaint created, status changed, etc.)

---

## Status Values

### Complaint Status
`NEW`, `RECEIVED`, `VERIFICATION`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`, `REJECTED`, `DUPLICATE`, `INVALID`, `REOPENED`, `ESCALATED`

### Complaint Priority
`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`

### Asset Status
`ACTIVE`, `INACTIVE`, `DAMAGED`, `UNDER_MAINTENANCE`, `REMOVED`, `TEMPORARY`, `VERIFIED`, `UNVERIFIED`

### User Roles
`SUPER_ADMIN`, `EVENT_ADMIN`, `CONTROL_ROOM_OPERATOR`, `DEPARTMENT_ADMIN`, `DEPARTMENT_OFFICER`, `FIELD_STAFF`, `SURVEYOR`, `MIS_EXECUTIVE`
