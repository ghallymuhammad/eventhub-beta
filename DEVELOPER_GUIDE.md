# EventHub - Developer Guide

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Folder Structure & Functions](#folder-structure--functions)
3. [User Flows by Entity](#user-flows-by-entity)
4. [API Endpoints](#api-endpoints)
5. [Database Schema](#database-schema)
6. [Email System](#email-system)
7. [Authentication & Authorization](#authentication--authorization)
8. [Development Setup](#development-setup)
9. [Testing Guide](#testing-guide)

---

## 🎯 Project Overview

**EventHub** is a modern event management platform built with Next.js 15, TypeScript, Prisma, and PostgreSQL. It features role-based access control, payment processing, email notifications, and ticket management.

### Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS 4.0
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **Email**: Nodemailer with Gmail SMTP
- **File Upload**: Supabase Storage
- **Testing**: Jest, Testing Library

---

## 📁 Folder Structure & Functions

### Root Level
```
/
├── app/                    # Next.js 13+ App Router
├── backend/               # Separate backend service (optional)
├── components/            # Reusable React components
├── database/             # Database documentation and schemas
├── docs/                 # Project documentation
├── lib/                  # Utility libraries and services
├── prisma/               # Prisma schema and migrations
├── public/               # Static assets
└── src/                  # Source code for controllers, services, types
```

### `/app` - Next.js App Router
```
app/
├── layout.tsx                    # Root layout with providers
├── (auth)/                      # Auth route group
│   ├── layout.tsx              # Auth-specific layout
│   ├── signin/                 # User/Organizer signin
│   ├── signup/                 # User registration
│   └── reset-password/         # Password reset
├── (default)/                   # Main application routes
│   ├── layout.tsx              # Default layout with navigation
│   ├── page.tsx                # Homepage
│   ├── checkout/               # Event checkout flow
│   ├── create-event/           # Event creation (legacy)
│   ├── create-event-new/       # New event creation form
│   ├── events/                 # Event listing and details
│   ├── organizer/              # Organizer dashboard
│   ├── organizer-profile/      # Organizer profile management
│   ├── payment/                # Payment processing
│   ├── payment-proof/          # Payment proof upload
│   ├── profile/                # User profile and transactions
│   ├── reviews/                # Event reviews
│   ├── search/                 # Event search functionality
│   └── transactions/           # Transaction history
├── admin/                       # Admin panel (separate access)
│   ├── layout.tsx              # Admin layout with protection
│   ├── signin/                 # Admin-only signin
│   └── page.tsx                # Admin dashboard
├── api/                        # API endpoints
│   ├── auth/                   # Authentication endpoints
│   ├── events/                 # Event CRUD operations
│   ├── organizer/              # Organizer-specific APIs
│   ├── profile/                # User profile APIs
│   ├── transactions/           # Payment and transaction APIs
│   └── admin/                  # Admin-only APIs
├── css/                        # Custom CSS styles
└── unauthorized/               # Unauthorized access page
```

### `/components` - Reusable Components
```
components/
├── ui/                         # UI components
│   ├── header.tsx              # Main navigation header
│   ├── footer.tsx              # Site footer
│   └── logo.tsx                # Logo component
├── providers/                  # Context providers
│   └── SessionProvider.tsx     # NextAuth session provider
├── ProtectedRoute.tsx          # Route protection wrapper
├── TicketSelector.tsx          # Event ticket selection
├── UserRoleIndicator.tsx       # User role display
├── Countdown.tsx               # Event countdown timer
├── AnimatedBackground.tsx      # Animated background effects
└── [other components]          # Various UI components
```

### `/lib` - Core Libraries
```
lib/
├── emailService.ts             # Email service with Gmail SMTP
└── api.ts                      # API utility functions
```

### `/src` - Source Code
```
src/
├── components/                 # Additional components
│   ├── ConfirmationDialog.tsx  # Modal confirmations
│   └── ProtectedRoute.tsx      # Route guards
├── controllers/                # Business logic controllers
│   └── eventController.ts      # Event management logic
├── lib/                        # Core libraries
│   ├── auth.ts                 # NextAuth configuration
│   └── prisma.ts               # Prisma client setup
├── models/                     # Data models (if any)
├── services/                   # Service layer
│   ├── eventService.ts         # Event business logic
│   ├── pointsService.ts        # Points system logic
│   └── userService.ts          # User management logic
└── types/                      # TypeScript type definitions
```

### `/prisma` - Database Layer
```
prisma/
├── schema.prisma               # Database schema definition
└── seed.ts                     # Database seeding script
```

### `/backend` - Separate Backend Service
```
backend/
├── src/
│   ├── server.ts               # Express server setup
│   ├── controllers/            # API controllers
│   ├── routes/                 # Route definitions
│   ├── services/               # Business services
│   ├── middleware/             # Custom middleware
│   └── lib/                    # Backend utilities
├── package.json                # Backend dependencies
└── tsconfig.json               # TypeScript config
```

---

## 👥 User Flows by Entity

### 🔵 **Regular User Flow**

#### 1. **Registration & Authentication**
```mermaid
graph TD
    A[Visit /signin] --> B[No account? Click signup]
    B --> C[Fill registration form]
    C --> D[Auto-role detection: USER]
    D --> E[Account created]
    E --> F[Redirect to homepage]
```

**Steps:**
1. Visit `/signin`
2. Click "Don't have an account? Sign up"
3. Fill registration form with email, name, password
4. System auto-detects role as `USER` (default)
5. Account created and redirected to homepage

#### 2. **Event Discovery & Purchase**
```mermaid
graph TD
    A[Homepage] --> B[Browse events or search]
    B --> C[Click event for details]
    C --> D[Select ticket type/quantity]
    D --> E[Apply coupon/points if available]
    E --> F[Proceed to checkout]
    F --> G[Review order & payment info]
    G --> H[Confirm transaction]
    H --> I[Upload payment proof within 2 hours]
    I --> J[Wait for admin approval]
    J --> K[Receive ticket email with JPG]
```

**Key Pages:**
- `/` - Homepage with featured events
- `/events` - Event listing with search/filter
- `/events/[id]` - Event details with ticket selection
- `/checkout` - Order review and payment
- `/payment-proof?transaction=[id]` - Payment proof upload
- `/profile?tab=transactions` - Transaction history

#### 3. **Profile Management**
```mermaid
graph TD
    A[/profile] --> B[View personal info]
    B --> C[Update profile details]
    A --> D[View transaction history]
    A --> E[Check points balance]
    A --> F[View referral code]
```

**Features:**
- Edit personal information
- View transaction history with status
- Track points balance and history
- Share referral code for bonuses
- Download/resend tickets

---

### 🟡 **Event Organizer Flow**

#### 1. **Registration & Authentication**
```mermaid
graph TD
    A[Visit /signin] --> B[Enter organizer email]
    B --> C[Email contains: organizer, event, music, company, corp]
    C --> D[Auto-role detection: ORGANIZER]
    D --> E[Login successful]
    E --> F[Redirect to /organizer dashboard]
```

**Email Patterns for Auto-Detection:**
- `organizer@company.com`
- `events@musiccorp.com`
- `contact@eventorganization.id`

#### 2. **Event Creation & Management**
```mermaid
graph TD
    A[/organizer] --> B[Create New Event]
    B --> C[Fill event details form]
    C --> D[Upload event image]
    D --> E[Set ticket types & pricing]
    E --> F[Submit for admin approval]
    F --> G[Wait for admin review]
    G --> H[Admin approves/rejects]
    H --> I[If approved: Publish event]
    I --> J[Monitor registrations & payments]
```

**Key Pages:**
- `/organizer` - Organizer dashboard
- `/create-event-new` - New event creation form
- `/organizer-profile` - Organizer profile management

#### 3. **Payment & Revenue Management**
```mermaid
graph TD
    A[User purchases ticket] --> B[Payment proof uploaded]
    B --> C[Admin reviews payment]
    C --> D[Admin approves payment]
    D --> E[Revenue tracked in organizer dashboard]
    E --> F[Analytics and reports available]
```

---

### 🔴 **Admin Flow**

#### 1. **Admin Authentication**
```mermaid
graph TD
    A[Visit /admin/signin] --> B[Enter admin email]
    B --> C[Email contains: admin, superadmin, administrator]
    C --> D[Admin credentials verified]
    D --> E[Access admin dashboard]
    E --> F[Manage events, users, transactions]
```

**Admin Access:**
- Separate signin page: `/admin/signin`
- Email patterns: `admin@eventhub.com`, `superadmin@system.com`
- Enhanced security with role verification

#### 2. **Event Management**
```mermaid
graph TD
    A[Admin Dashboard] --> B[Review pending events]
    B --> C[Approve/Reject events]
    C --> D[Provide rejection reason if needed]
    D --> E[Event status updated]
    E --> F[Organizer notified]
```

#### 3. **Payment Approval Flow**
```mermaid
graph TD
    A[User uploads payment proof] --> B[Admin sees pending payments]
    B --> C[Admin reviews payment evidence]
    C --> D[Admin approves/rejects]
    D --> E[If approved: Generate ticket]
    E --> F[Send JPG ticket via email]
    F --> G[Update transaction status]
    G --> H[User receives ticket]
```

**Key Admin Functions:**
- Event approval/rejection
- Payment verification and approval
- User management
- Transaction oversight
- System analytics

---

## 🔌 API Endpoints

### Authentication APIs
```
POST /api/auth/signin          # User signin
POST /api/auth/signup          # User registration
POST /api/auth/signout         # User signout
```

### Event APIs
```
GET    /api/events             # List all events
GET    /api/events/[id]        # Get event details
POST   /api/events             # Create new event (organizer)
PUT    /api/events/[id]        # Update event (organizer)
DELETE /api/events/[id]        # Delete event (organizer)
```

### Transaction APIs
```
POST   /api/transactions                    # Create transaction
GET    /api/transactions/[id]               # Get transaction details
POST   /api/transactions/payment-proof      # Upload payment proof
PATCH  /api/transactions/[id]/status        # Update status (organizer)
```

### Admin APIs
```
GET    /api/admin/events                    # List all events for approval
PATCH  /api/admin/events/[id]/approve       # Approve/reject events
GET    /api/admin/transactions              # List all transactions
PATCH  /api/admin/transactions/[id]/approve # Approve/reject payments
```

### User APIs
```
GET    /api/profile            # Get user profile
PUT    /api/profile            # Update user profile
GET    /api/profile/transactions # Get user transactions
```

---

## 🗄️ Database Schema

### Core Models

#### User
```typescript
{
  id: string              // Unique identifier
  email: string           // Email (unique)
  password: string        // Hashed password
  name: string           // Full name
  role: Role             // USER | ORGANIZER | ADMIN
  profilePicture?: string // Profile image URL
  phoneNumber?: string   // Phone number
  referralCode: string   // Unique referral code
  referredBy?: string    // Referrer user ID
  pointsBalance: number  // Current points balance
  createdAt: DateTime    // Registration date
  updatedAt: DateTime    // Last update
}
```

#### Event
```typescript
{
  id: string              // Unique identifier
  title: string          // Event name
  description: string    // Short description
  fullDescription?: string // Detailed description
  date: DateTime         // Event date and time
  time: string          // Event time (formatted)
  location: string      // Venue location
  category: string      // Event category
  image?: string        // Event poster URL
  capacity: number      // Maximum attendees
  price?: number        // Base ticket price
  isPublished: boolean  // Published status
  status: EventStatus   // PENDING | APPROVED | REJECTED | PUBLISHED
  rejectionReason?: string // If rejected
  organizerId: string   // Organizer user ID
  createdAt: DateTime   // Creation date
}
```

#### Transaction
```typescript
{
  id: string                    // Unique identifier
  userId: string               // Buyer user ID
  eventId: string              // Event ID
  totalAmount: number          // Final amount paid
  originalAmount: number       // Original price
  discountAmount: number       // Discount applied
  pointsUsed: number          // Points redeemed
  status: TransactionStatus   // Payment status
  paymentProof?: string       // Payment evidence URL
  paymentDeadline?: DateTime  // Upload deadline (2 hours)
  adminDeadline?: DateTime    // Admin action deadline (3 days)
  rejectionReason?: string    // If rejected
  approvedAt?: DateTime       // Approval timestamp
  approvedBy?: string         // Admin who approved
  ticketId?: string           // Generated ticket ID
  ticketSentAt?: DateTime     // Email sent timestamp
  createdAt: DateTime         // Transaction date
}
```

### Transaction Status Flow
```
WAITING_PAYMENT → User uploads proof → PENDING → Admin approval → CONFIRMED
                                              → Admin rejection → REJECTED
```

---

## 📧 Email System

### Gmail SMTP Configuration
```typescript
// Environment variables required
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=muh.ghally@gmail.com
SMTP_PASS=your_app_password      // Gmail App Password
SMTP_FROM_EMAIL=muh.ghally@gmail.com
SMTP_FROM_NAME=EventHub
```

### Email Types

#### 1. **Payment Confirmation Email**
- **Trigger**: User uploads payment proof
- **Recipients**: User who made payment
- **Content**: Payment received confirmation, next steps
- **API**: `POST /api/transactions/payment-proof`

#### 2. **Ticket Delivery Email**
- **Trigger**: Admin approves payment
- **Recipients**: User who purchased ticket
- **Content**: Event details + JPG ticket attachment
- **Features**: 
  - Professional ticket design
  - QR code for verification
  - Event details and branding
- **API**: `PATCH /api/admin/transactions/[id]/approve`

### Ticket Generation Features
```typescript
// Ticket includes:
- Event title, date, time, location
- Attendee name and ticket ID
- QR code with verification data
- Professional EventHub branding
- Anti-fraud security elements
```

---

## 🔐 Authentication & Authorization

### Role-Based Access Control

#### User Roles
1. **USER** (Default)
   - Browse and purchase events
   - Manage profile and transactions
   - Use points and referral system

2. **ORGANIZER**
   - All USER permissions
   - Create and manage events
   - View event analytics
   - Manage event payments

3. **ADMIN**
   - All system permissions
   - Approve/reject events
   - Approve/reject payments
   - User management
   - System oversight

### Email-Based Role Detection
```typescript
const getUserRoleFromEmail = (email: string): string => {
  const emailLower = email.toLowerCase();
  
  // Organizer patterns
  if (emailLower.includes('organizer') || 
      emailLower.includes('event') || 
      emailLower.includes('music') ||
      emailLower.includes('company') ||
      emailLower.includes('corp') ||
      emailLower.includes('organization')) {
    return 'ORGANIZER';
  }
  
  // Admin users redirected to admin signin
  if (emailLower.includes('admin')) {
    throw new Error('Admin users should use the admin signin page');
  }
  
  // Default to regular user
  return 'USER';
};
```

### Protected Routes
```typescript
// Middleware protects routes based on role
- /admin/*          → ADMIN only
- /organizer/*      → ORGANIZER + ADMIN
- /create-event/*   → ORGANIZER + ADMIN
- /profile/*        → Authenticated users only
```

---

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Gmail account with App Password
- Git

### Installation
```bash
# Clone repository
git clone https://github.com/ghallymuhammad/eventhub-miniproject.git
cd eventhub-beta

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your configurations

# Setup database
createdb eventhub
npx prisma migrate dev
npx prisma db seed

# Start development server
npm run dev
```

### Environment Configuration
```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/eventhub"
DIRECT_URL="postgresql://postgres:password@localhost:5432/eventhub"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Gmail SMTP (Get App Password from Google Account)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM_EMAIL="your-email@gmail.com"
SMTP_FROM_NAME="EventHub"

# Supabase (for file uploads)
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-key"
```

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests
npm run db:seed      # Seed database
npm run db:reset     # Reset and reseed database
```

---

## 🧪 Testing Guide

### Test User Accounts
```bash
# Regular User
Email: user@demo.com
Password: demo123
Role: USER

# Event Organizer
Email: organizer@eventcompany.com
Password: demo123
Role: ORGANIZER

# Admin
Email: admin@eventhub.com
Password: admin123
Role: ADMIN
```

### Testing Scenarios

#### 1. **User Registration & Role Detection**
- Test with different email patterns
- Verify automatic role assignment
- Test admin email redirection

#### 2. **Event Creation Flow**
- Create event as organizer
- Test admin approval process
- Verify event publication

#### 3. **Purchase & Payment Flow**
- Select tickets and checkout
- Upload payment proof
- Test admin payment approval
- Verify email ticket delivery

#### 4. **Email System Testing**
- Configure Gmail App Password
- Test confirmation emails
- Test ticket generation and delivery
- Verify JPG ticket format and QR codes

### Running Tests
```bash
# Unit tests
npm run test

# Integration tests
npm run test:coverage

# Watch mode for development
npm run test:watch
```

---

## 🚀 Production Deployment

### Build Process
```bash
# Build application
npm run build

# Test production build locally
npm run start
```

### Environment Variables for Production
- Set secure `NEXTAUTH_SECRET`
- Configure production database URL
- Set up production Gmail SMTP
- Configure Supabase for file uploads
- Set proper CORS origins

### Security Considerations
- Use environment variables for all secrets
- Enable HTTPS in production
- Configure proper CORS policies
- Set up rate limiting
- Monitor email sending limits
- Implement proper error logging

---

## 📞 Support & Contributing

### Getting Help
- Check the documentation in `/docs`
- Review existing issues on GitHub
- Test with provided demo accounts

### Contributing
1. Fork the repository
2. Create a feature branch
3. Follow the existing code style
4. Add tests for new features
5. Submit a pull request

---

**Last Updated**: October 2025  
**Version**: 1.0.0  
**Maintainer**: Muhammad Ghally (muh.ghally@gmail.com)
