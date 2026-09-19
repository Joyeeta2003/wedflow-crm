# WedFlow CRM - Complete Project Documentation

## 📋 Project Overview

WedFlow CRM is a comprehensive wedding photography and videography management system designed to streamline business operations for wedding photography companies. It handles client management, bookings, crew assignments, equipment tracking, and delivery management.

**Project Status:** Active Development  
**Last Updated:** September 18, 2026  
**Primary Purpose:** Wedding CRM for photography/videography business management

---

## 🏗️ Architecture

### Technology Stack

#### Frontend
- **Framework:** Angular 21.2.0
- **Language:** TypeScript 5.9.2
- **Styling:** SCSS
- **Build Tool:** Angular CLI 21.2.14
- **Package Manager:** npm 10.9.3
- **Icons:** Lucide Angular
- **Testing:** Vitest 4.0.8

#### Backend
- **Runtime:** Node.js
- **Framework:** Express.js 4.18.2
- **Database:** PostgreSQL
- **Authentication:** JWT (jsonwebtoken 9.0.2)
- **Email Service:** Resend 3.2.0
- **Password Hashing:** bcrypt 5.1.1
- **Environment:** dotenv 16.3.1
- **Development:** nodemon 3.0.1

### Project Structure

```
wedflow-crm/
├── Frontend/                    # Angular Frontend Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/     # Reusable UI components
│   │   │   ├── pages/          # Page components
│   │   │   └── services/       # API services
│   │   ├── index.html
│   │   ├── main.ts
│   │   └── styles.scss
│   ├── package.json
│   ├── angular.json
│   └── tsconfig.json
├── backend/                    # Node.js Backend Server
│   ├── server.js              # Main server file
│   ├── schema.sql             # Database schema
│   ├── migrations/            # Database migrations
│   ├── package.json
│   └── .env                   # Environment variables
├── src/                       # Legacy source files
└── package.json               # Root package.json
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v18+)
- PostgreSQL database
- npm or yarn

### Environment Setup

#### Backend Setup
1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables (create `.env` file):
```env
DATABASE_URL=postgresql://user:password@localhost:5432/wedflow_crm
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wedflow_crm
DB_USER=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=your_jwt_secret_key
RESEND_API_KEY=your_resend_api_key
TURNSTILE_SECRET_KEY=your_turnstile_secret
```

4. Run database migrations:
```bash
node execute-migration.js
```

5. Start backend server:
```bash
npm run dev
```
Backend runs on `http://localhost:5001`

#### Frontend Setup
1. Navigate to frontend directory:
```bash
cd Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```
Frontend runs on `http://localhost:4200`

---

## 🗄️ Database Schema

### Core Tables

#### Users Table
- User management system (clients, staff, admins)
- Authentication via OTP
- Role-based access control
- Workspace isolation

#### Bookings Table
- Client bookings with package associations
- Workflow stage tracking
- Payment tracking
- Venue and event details

#### Booking Events Table
- Event days for each booking
- Date and venue management
- Event type categorization

#### Crew Assignments Table
- Staff-to-event assignments
- Role-based assignments
- Time and location tracking
- Assignment status management

#### Packages Table
- Wedding photography packages
- Duration and pricing
- Deliverables and crew requirements

#### Equipment Table
- Equipment inventory management
- Assignment tracking
- Maintenance records

#### Payments Table
- Payment schedule management
- Transaction tracking
- Payment status monitoring

---

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP for login
- `POST /api/auth/verify-otp` - Verify OTP and authenticate

### User Management
- `GET /api/users` - List all users (admin only)
- `POST /api/users` - Create new user (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)
- `GET /api/staff-members` - Get staff members for assignment

### Bookings
- `GET /api/bookings` - List all bookings
- `POST /api/bookings` - Create new booking (admin only)
- `GET /api/bookings/:id` - Get specific booking details
- `PUT /api/bookings/:id` - Update booking (admin only)

### Booking Events
- `GET /api/booking-events` - List all booking events
- `POST /api/booking-events` - Create booking event
- `PUT /api/booking-events/:id` - Update booking event
- `DELETE /api/booking-events/:id` - Delete booking event

### Crew Assignments
- `GET /api/crew-assignments` - List crew assignments
- `POST /api/crew-assignments` - Create crew assignment (admin only)
- `GET /api/crew-assignments/:id` - Get specific assignment
- `PUT /api/crew-assignments/:id` - Update assignment (admin only)
- `DELETE /api/crew-assignments/:id` - Delete assignment (admin only)

### Packages
- `GET /api/packages` - List all packages
- `POST /api/packages` - Create package (admin only)
- `PUT /api/packages/:id` - Update package (admin only)
- `DELETE /api/packages/:id` - Delete package (admin only)

### Clients
- `GET /api/clients` - List all clients
- `POST /api/clients` - Create new client
- `GET /api/clients/:id` - Get specific client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Payments
- `POST /api/payments` - Create payment
- `PUT /api/payments/:id` - Update payment
- `DELETE /api/payments/:id` - Delete payment

### Deliveries
- `POST /api/deliveries` - Create delivery
- `PUT /api/deliveries/:id` - Update delivery
- `DELETE /api/deliveries/:id` - Delete delivery

---

## 🎨 Frontend Pages & Features

### Public Pages
1. **Landing Page** (`/`) - Marketing landing page
2. **Login** (`/login`) - User authentication
3. **Verify OTP** (`/verify-otp`) - OTP verification
4. **Freelancer Login** (`/freelancerlogin`) - Freelancer authentication
5. **Freelancer Register** (`/freelancer-register`) - Freelancer registration

### Protected Pages (Dashboard Shell)
1. **Dashboard** (`/dashboard`) - Main dashboard with statistics
2. **Packages** (`/packages`) - Package management
3. **Clients** (`/clients`) - Client management
4. **User Management** (`/users`) - User and staff management
5. **Bookings** (`/bookings`) - Booking management
6. **Booking Detail** (`/bookings/:id`) - Detailed booking view with tabs:
   - Crew Tab - Event days and crew assignments
   - Payments Tab - Payment schedule and tracking
   - Deliveries Tab - Delivery management
   - Studio Tracker Tab - Production job tracking
   - Media Tab - Media storage management
   - Reminders Tab - Reminder scheduling
   - Invoice Tab - Invoice management
7. **Crew Assignments** (`/crew-assignments`) - Crew assignment management
8. **Marketplace** (`/marketplace`) - Freelancer marketplace
9. **Storage** (`/storage`) - File storage management
10. **Equipment** (`/equipment`) - Equipment inventory management

---

## 🔐 Authentication & Authorization

### Authentication Flow
1. User enters email on login page
2. System sends OTP via email (using Resend API)
3. User enters OTP for verification
4. System generates JWT token upon successful verification
5. Token stored in localStorage
6. HTTP interceptor adds token to all API requests

### Authorization Levels
- **Admin**: Full access to all features including user management
- **Staff**: Access to assignments, bookings, and relevant operations
- **Client**: Limited access to own bookings and related information
- **Freelancer**: Access to marketplace and assignment details

### Security Features
- JWT token authentication
- Workspace-based data isolation
- Rate limiting for OTP requests
- Turnstile CAPTCHA verification
- Password hashing with bcrypt
- SQL injection prevention via parameterized queries

---

## 🎯 Key Features

### 1. Booking Management
- Create and manage wedding bookings
- Track booking workflow stages (21 stages)
- Associate packages with bookings
- Manage event dates and venues
- Payment tracking and scheduling

### 2. Crew Assignment
- Assign photographers, videographers, drone operators
- Role-based crew allocation
- Time and location management
- Availability checking
- Assignment status tracking

### 3. Package Management
- Create customizable wedding packages
- Define crew requirements per package
- Set pricing and payment schedules
- Manage deliverables
- Define payment terms

### 4. Client Management
- Client database with contact information
- Booking history per client
- Communication tracking
- Status management

### 5. Equipment Management
- Equipment inventory tracking
- Assignment to events and staff
- Maintenance scheduling
- Availability management

### 6. Marketplace Integration
- Freelancer marketplace for external talent
- Work request management
- Assignment from marketplace to bookings
- Availability matching

### 7. Storage & Media
- File storage management
- Media tracking per booking
- Assignment to photographers
- Delivery tracking

---

## 🐛 Known Issues & Fixes

### Recent Fixes
1. **Crew Assignment Modal Performance**
   - Issue: Cursor buffering when hovering over Assign button
   - Fix: Implemented OnPush change detection and smart caching

2. **Event Day Creation**
   - Issue: Event days not appearing in UI after creation
   - Fix: Removed admin requirement from booking-events API endpoints

3. **Staff Member Loading**
   - Issue: Staff members not loading for assignment
   - Fix: Created dedicated `/api/staff-members` endpoint using users table

4. **Authentication Requirements**
   - Issue: Multiple endpoints requiring admin privileges unnecessarily
   - Fix: Adjusted API endpoints to allow authenticated users for crew operations

---

## 🔧 Development Commands

### Backend
```bash
cd backend
npm run dev        # Start development server with nodemon
npm start          # Start production server
```

### Frontend
```bash
cd Frontend
npm run dev        # Start development server
npm run build      # Build for production
npm test           # Run tests
```

### Database
```bash
cd backend
node execute-migration.js        # Run pending migrations
node verify-migration.js         # Verify migration status
node test-db-connection.js      # Test database connection
```

---

## 📊 Workflow Stages

The system tracks 21 workflow stages for each booking:

1. Booking Confirmed
2. Advance Received
3. Contract Signed
4. Planning Stage
5. Crew Assigned
6. Pre-Wedding Scheduled
7. Event Completed
8. Data Received
9. Editing Assigned
10. Editing In Progress
11. QC Review
12. Client Review
13. Revision Requested
14. Payment Pending
15. Full Payment Received
16. Album Designing
17. Album Printing
18. Ready For Delivery
19. Delivered
20. Completed
21. Archived

---

## 🌟 Third-Party Integrations

### Resend (Email Service)
- OTP email delivery
- Notifications and alerts
- Marketing communications

### Turnstile (CAPTCHA)
- Human verification for login
- Security enhancement

### PostgreSQL
- Primary database
- Complex queries and relationships
- Data integrity and consistency

---

## 📝 Configuration Files

### Backend Configuration
- `.env` - Environment variables
- `package.json` - Dependencies and scripts
- `schema.sql` - Database structure

### Frontend Configuration
- `angular.json` - Angular CLI configuration
- `tsconfig.json` - TypeScript configuration
- `package.json` - Dependencies and scripts
- `app.config.ts` - Application configuration

---

## 🚦 Current Development Status

### Active Development Areas
- Crew assignment optimization
- Event day management
- Staff member integration
- Authentication flow improvements
- Performance optimization

### Recently Completed
- API endpoint permission adjustments
- Frontend performance optimization
- Database connection verification
- Staff member loading from user management

### Known Limitations
- Some endpoints still require admin privileges (being addressed)
- Frontend performance on large datasets
- Real-time updates not implemented
- Limited mobile responsiveness

---

## 📞 Support & Contact

For project-specific questions or issues, refer to the development team or project documentation in the repository.

---

## 🔄 Update History

**September 18, 2026**
- Fixed crew assignment modal performance issues
- Resolved event day creation problems
- Implemented staff member loading from user management
- Adjusted API endpoint permissions
- Optimized frontend change detection

**Previous Updates**
- Initial project setup
- Authentication system implementation
- Database schema creation
- Basic CRUD operations for all entities
- Frontend routing and navigation
- Dashboard implementation

---

## 🎯 Future Roadmap

### Planned Features
- Real-time notifications
- Mobile app development
- Advanced reporting and analytics
- Payment gateway integration
- Calendar integration
- Advanced search and filtering
- Bulk operations
- Enhanced security features
- API rate limiting
- Caching layer implementation

### Technical Improvements
- Database query optimization
- Frontend state management
- Component library creation
- Automated testing pipeline
- CI/CD implementation
- Docker containerization
- Cloud deployment options

---

## 📄 License & Ownership

This is a proprietary wedding CRM system developed for internal business use. All rights reserved.

---

**Document Version:** 1.0  
**Last Updated:** September 18, 2026  
**Maintained By:** Development Team