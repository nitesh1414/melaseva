# Mela Seva - Geo-Tagged Asset, Complaint Management & Smart Navigation Platform

A production-ready, full-stack application for managing temporary electrical assets, public complaints, QR-code-based identification, and smart navigation at large public events (Melas, Kumbh, fairs, festivals, exhibitions).

## 🏗️ Architecture

```
mela-seva/
├── backend/          # Node.js + Express REST API + Socket.IO
├── web/              # React.js + Vite Admin & Public Portal
├── mobile/           # React Native + Expo Mobile App
├── shared/           # Shared constants, validation, types
└── docs/             # Documentation
```

## 📋 Core Features

### Asset & GIS Management
- Geo-tagged asset creation with GPS coordinates
- QR code generation and assignment per asset
- GIS survey tools for field staff
- Asset map visualization with layer controls
- Bulk asset import via Excel/CSV

### Complaint Management
- Public complaint registration via QR code scan
- Pre-filled location and asset data from QR
- Configurable complaint categories per department
- Full status workflow: NEW → RECEIVED → VERIFICATION → ASSIGNED → IN_PROGRESS → RESOLVED → CLOSED
- Complaint assignment, reassignment, and escalation
- SLA tracking with automatic breach detection
- Duplicate complaint detection

### Control Room Dashboard
- Real-time complaint monitoring via Socket.IO
- Live GIS map with complaint markers
- Department-wise and sector-wise statistics
- KPI cards with key metrics
- Hourly/daily trend charts
- Quick complaint assignment interface

### Smart Navigation
- Public-facing facility map accessible via QR code
- Nearby facility discovery (Hospitals, Police, Toilets, Parking, etc.)
- Turn-by-turn navigation via Google/Apple Maps
- No login required for public access

### Mobile Application (Field Staff)
- QR code scanning with device camera
- Assigned complaint view and management
- GPS-aware complaint resolution
- Photo capture for evidence
- Offline support with sync
- Push notifications

### Multi-Event Support
- Platform reusable across different events/organizations
- Complete data isolation per event
- Configurable departments, categories, SLA rules per event

### Additional Features
- Role-Based Access Control (RBAC) with 8+ roles
- Multilingual support (English, Hindi, extensible)
- SMS notification system with configurable templates
- Comprehensive audit logging
- MIS/Reporting with Excel/CSV/PDF export
- Public feedback system
- PWA-ready public portal

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Web Frontend** | React 18, Vite, React Router, Tailwind CSS, Leaflet/Mapbox, Recharts, TanStack Query |
| **Mobile** | React Native, Expo, React Navigation, Expo Camera, Maps |
| **Backend** | Node.js, Express.js, Socket.IO, JWT, Multer, Sharp |
| **Database** | MongoDB with Mongoose ODM, Geospatial indexes |
| **Maps** | Leaflet + OpenStreetMap (Mapbox optional) |
| **Real-time** | Socket.IO for live updates |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6+
- npm or yarn

### 1. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and secrets

npm install
npm run seed    # Create sample event, users, assets, facilities
npm run dev     # Start development server on port 5000
```

### 2. Web Frontend Setup

```bash
cd web
cp .env.example .env
npm install
npm run dev     # Start Vite dev server on port 5173
```

### 3. Mobile App Setup

```bash
cd mobile
npm install
npx expo start  # Start Expo development server
```

## 🔐 Default Credentials

After running `npm run seed`:

| Role | Mobile | Password |
|------|--------|----------|
| Super Admin | 9999999999 | Admin@123 |
| Field Staff | 9876543200 | User@123 |

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Login with mobile/email + password
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user profile

### Complaints
- `POST /api/complaints` - Create complaint (public)
- `GET /api/complaints` - List complaints (with filters)
- `GET /api/complaints/:id` - Get complaint details
- `PUT /api/complaints/:id/assign` - Assign complaint
- `PUT /api/complaints/:id/status` - Update status
- `PUT /api/complaints/:id/resolve` - Resolve complaint
- `GET /api/complaints/track` - Public complaint tracking
- `GET /api/complaints/dashboard/:eventId` - Dashboard stats
- `GET /api/complaints/map/:eventId` - Map data

### Assets
- `POST /api/assets` - Create asset
- `GET /api/assets` - List assets
- `GET /api/assets/:id` - Get asset details
- `PUT /api/assets/:id` - Update asset
- `GET /api/assets/map/:eventId` - Map data
- `GET /api/assets/nearby` - Nearby assets (geospatial)

### QR Codes
- `POST /api/qr-codes/generate` - Generate QR for asset
- `POST /api/qr-codes/bulk-generate` - Bulk generate
- `GET /api/qr-codes/scan/:code` - Public QR scan endpoint

### Facilities
- `GET /api/facilities/nearby` - Nearby facilities (geospatial)
- `GET /api/facilities/map/:eventId` - Map data

### Masters
- Departments, Zones, Sectors, Roads
- Complaint Categories, SLA Rules
- SMS Templates, System Settings
- Audit Logs, Notifications

## 📱 Public QR Workflow

```
User scans QR on pole/asset
        ↓
Public page opens: /asset/{code}
        ↓
Asset info displayed with map
        ↓
User chooses: Report Problem / Navigate / Nearby
        ↓
Complaint form pre-filled with asset/location data
        ↓
User submits → Control room notified
        ↓
Complaint assigned → Field officer notified
        ↓
Officer resolves → Control room closes
        ↓
SMS sent to complainant
```

## 👥 User Roles

| Role | Access |
|------|--------|
| **Super Admin** | Full system access, manage all events |
| **Event Admin** | Manage assigned event |
| **Control Room Operator** | Monitor/assign complaints, real-time dashboard |
| **Department Admin** | Manage department users and complaints |
| **Department Officer** | View/resolve assigned complaints |
| **Field Staff** | View/update assigned complaints |
| **Surveyor** | Add assets, GPS capture, QR assignment |
| **MIS Executive** | View dashboards, reports, assign complaints |

## 🗄️ Database Schema

### Key Collections
- `users` - System users with roles
- `events` - Mela/Event configurations
- `departments` - Per-event departments
- `assets` - Geo-tagged assets with location
- `qrCodes` - QR code mappings
- `complaints` - Complaints with full workflow
- `facilities` - Public facility locations
- `zones`, `sectors`, `roads` - GIS hierarchy
- `complaintCategories` - Configurable categories
- `slaRules` - SLA configurations
- `smsTemplates` - Multi-language templates
- `feedback` - Public feedback
- `auditLogs` - Complete audit trail
- `notifications` - In-app/push/SMS notifications

All collections use:
- Geospatial indexes (2dsphere) for location queries
- Soft deletion (isDeleted flag)
- Audit fields (createdBy, updatedBy, timestamps)
- Status fields with workflow validation

## 🌍 GIS & Geospatial Features

- MongoDB 2dsphere indexes on all location fields
- `$near` queries for proximity search
- `$geoWithin` for boundary containment
- Map clustering for performance
- Layer-based visualization (assets, complaints, facilities)
- Heatmap support
- Route/navigation integration

## 🔒 Security

- JWT authentication with refresh tokens
- Role-Based Access Control (RBAC)
- Rate limiting on all APIs
- Input validation with express-validator
- MongoDB injection protection
- XSS protection with Helmet
- CORS configuration
- File upload validation and size limits
- Audit logging of all actions
- Password hashing with bcrypt

## 🌐 Multilingual Support

Built-in support for:
- English (en)
- Hindi (hi)
- Marathi (mr) - architecture ready

All UI labels, complaint categories, SMS templates, and content support translation via i18next.

## 📊 Reporting

- Daily/weekly/monthly complaint reports
- Department-wise analysis
- SLA compliance reports
- Officer performance metrics
- Asset inventory reports
- GIS-based spatial reports
- Export to Excel, CSV, PDF

## 🔄 Real-time Features

Using Socket.IO:
- Live complaint feed in control room
- Instant assignment notifications
- Status change updates
- SLA breach alerts
- New complaint alerts

## 📦 Deployment

### Backend
```bash
cd backend
npm run build
NODE_ENV=production npm start
```

### Web
```bash
cd web
npm run build
# Serve dist/ with Nginx or any static server
```

### Mobile
```bash
cd mobile
# Android
eas build --platform android
# iOS
eas build --platform ios
```

## 📄 Environment Variables

See `backend/.env.example` and `web/.env.example` for all configuration options.

Key variables:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `SMS_API_URL/KEY` - SMS provider credentials
- `STORAGE_PROVIDER` - File storage (local/s3)
- `MAP_PROVIDER` - Map service (osm/mapbox)

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# API tests
cd backend && npm run test:api
```

## 📝 License

This is a custom-built platform for event management. All rights reserved.

## 🤝 Contributing

This is a production platform. For modifications:
1. Follow the existing code patterns
2. Keep business logic in the backend
3. Use the established API response format
4. Add audit logging for all mutations
5. Test with seed data before deploying

---

Built with ❤️ for public event management and citizen services.
