# EventHub Mini Project - User Flow Documentation

## Overview

EventHub is a comprehensive event management platform that supports three main user roles: **Guest**, **User**, and **Organizer**. The platform enables event discovery, ticket purchasing with bank transfer payment, and complete event management capabilities.

## User Roles & Permissions

### 1. **Guest** (Unauthenticated)
- Can browse events on homepage
- Can view event details
- Can see event countdowns and basic information
- **Cannot**: Book tickets, create events, access user features
- **Navigation**: Limited to homepage and authentication pages

### 2. **User** (Authenticated Event Attendee)
- All Guest permissions, plus:
- Book and purchase event tickets
- Manage ticket quantities in checkout
- Upload payment proof for bank transfers
- Track transaction status and history
- Use points and voucher codes
- Write reviews after attending events
- **Navigation**: Homepage, Checkout, Payment, Transactions, Reviews

### 3. **Organizer** (Authenticated Event Creator)
- All User permissions, plus:
- Create and manage events
- Set up multiple ticket types with different pricing
- Create promotional vouchers and referral codes
- View organizer dashboard with analytics
- Manage pending payment confirmations
- View event reviews and ratings
- **Navigation**: All pages including Create Event and Organizer Dashboard

---

## Complete User Flows

### 🔐 **Authentication Flow**

#### Sign Up Process:
1. **Role Selection**: User chooses "Event Attendee" or "Event Organizer"
2. **Form Fields**:
   - Full Name (or Organization Name for organizers)
   - Email Address
   - Phone Number
   - Password
3. **Account Creation**: System creates user with selected role
4. **Auto Sign In**: User is automatically signed in and redirected to homepage

#### Sign In Process:
1. **Credentials**: Email and password
2. **Role-based Redirect**: Users go to homepage, organizers can access dashboard
3. **Session Management**: JWT token stored in localStorage for authentication

### 🎫 **Event Discovery Flow (All Users)**

#### Homepage Experience:
1. **Hero Section**: 
   - Search bar for events
   - Filter by category, date, location, price
   - Sort by date, popularity, price
2. **Stats Display**: Total events, upcoming events, active organizers
3. **Event Cards**: 
   - Event image, name, date, location
   - Countdown timer to event
   - Price range and availability
   - Rating and review count
   - **Guest**: "Sign in to Book" button
   - **User**: "Book Now" button  
   - **Organizer**: "View Details" button (no booking)

### 🛒 **Ticket Booking Flow (Users Only)**

#### Step 1: Event Selection
1. User clicks "Book Now" on event card
2. Redirects to `/checkout?event={eventId}`

#### Step 2: Checkout Process
1. **Event Details Display**: Name, date, time, location
2. **Ticket Selection**: 
   - Interactive TicketSelector component
   - Multiple ticket types (General, VIP, Early Bird)
   - Quantity selector per ticket type
   - Real-time price calculation
3. **Points & Vouchers**:
   - Option to use points balance (if available)
   - Voucher code input field
   - Automatic discount calculation
4. **Price Breakdown**:
   - Subtotal calculation
   - Points discount applied
   - Voucher discount applied
   - Final amount display
5. **Payment Timer**: 2-hour countdown starts
6. **Proceed to Payment**: Only enabled if tickets selected

#### Step 3: Payment Process (`/payment`)
1. **Bank Transfer Instructions**:
   - Bank account details (BCA)
   - Account number and name
   - Transfer amount confirmation
2. **Proof of Payment Upload**:
   - File upload (JPG/PNG only, max 5MB)
   - Image preview before submission
   - File validation
3. **Transaction Submission**:
   - Creates transaction record
   - Status: "waiting_admin" 
   - Awaits organizer confirmation

#### Step 4: Transaction Tracking (`/transactions`)
1. **Status Updates**:
   - `waiting_payment`: User has 2 hours to pay
   - `waiting_admin`: Payment proof uploaded, awaiting confirmation
   - `confirmed`: Organizer approved payment
   - `completed`: Event finished, points awarded
   - `rejected`: Payment proof rejected
   - `expired`: Payment window expired
2. **Time-based Actions**:
   - Payment expiry countdown
   - Automatic seat restoration if expired
   - Points award after event completion (10% of amount)

### 🎪 **Event Creation Flow (Organizers Only)**

#### Step 1: Basic Event Information
1. **Event Details**:
   - Event name and description
   - Category selection (Music, Tech, Arts, etc.)
   - Start/end date and time
   - Location
   - Event image upload
2. **Capacity Settings**:
   - Total seats available
   - Free vs. Paid event toggle

#### Step 2: Ticket Configuration
1. **Ticket Types Setup**:
   - Multiple ticket types (General, VIP, Early Bird)
   - Individual pricing per type  
   - Seat allocation per type
   - Description for each type
2. **Pricing Strategy**:
   - Free events (0 IDR)
   - Paid events with IDR pricing
   - Different prices for different ticket types

#### Step 3: Promotions & Marketing
1. **Voucher Creation**:
   - Percentage or fixed amount discounts
   - Validity date ranges
   - Usage limits
   - Minimum purchase requirements
   - Event-specific or organizer-wide
2. **Referral Vouchers**:
   - Special codes for user acquisition
   - Fixed discount values
   - Validity periods
   - Usage tracking

#### Step 4: Event Publishing
1. **Preview & Review**: Final event details review
2. **Publish Event**: Makes event visible on homepage
3. **Status Tracking**: Draft → Published → Active → Completed

### 📊 **Organizer Dashboard Flow**

#### Dashboard Overview:
1. **Key Metrics**:
   - Total events created
   - Total revenue generated  
   - Total tickets sold
   - Average rating across events
2. **Event Management**:
   - List of all events with status
   - Ticket sales progress bars
   - Revenue per event
   - Review counts and ratings
3. **Payment Confirmations**:
   - Pending transactions requiring approval
   - Payment proof viewing
   - Approve/reject functionality
   - Customer information display

#### Transaction Management:
1. **Review Payment Proofs**: View uploaded images
2. **Approve Payments**: Confirm valid payments
3. **Reject Payments**: Reject invalid proofs with reason
4. **Automatic Seat Management**: Seats restored if rejected/expired

### ⭐ **Review & Rating Flow (Users Only)**

#### Review Eligibility:
1. **Post-Event Only**: Reviews available after event completion
2. **Attendance Required**: Must have confirmed ticket
3. **One Review Per Event**: Single review per user per event

#### Review Process:
1. **Rating Selection**: 1-5 star rating system
2. **Review Text**: Optional written review
3. **Submission**: Review appears on organizer profile
4. **Rating Calculation**: Updates organizer's average rating

### 💰 **Points & Rewards System**

#### Points Earning:
1. **Transaction Completion**: 10% of final amount as points
2. **Event Attendance**: Bonus points for attended events
3. **Points Balance**: Tracked in user account

#### Points Usage:
1. **Checkout Discount**: Use points to reduce ticket prices
2. **1:1 IDR Conversion**: 1 point = 1 IDR discount
3. **Partial Usage**: Can use partial points balance

---

## Technical Implementation Details

### Authentication & Authorization:
- **JWT Tokens**: Stored in localStorage for session management
- **Protected Routes**: ProtectedRoute component with role checking
- **Role-based Navigation**: Dynamic menu based on user role

### Payment System:
- **Bank Transfer Only**: No credit card integration
- **Proof Upload**: JPG/PNG image validation
- **Time Limits**: 2-hour payment window
- **Status Tracking**: Real-time transaction status updates

### Data Flow:
- **Mock Data**: Currently using static data arrays
- **State Management**: React useState for local state
- **Local Storage**: User session and temporary data storage

### Mobile Responsiveness:
- **Responsive Design**: TailwindCSS responsive classes
- **Mobile-first Approach**: Optimized for mobile devices
- **Touch-friendly UI**: Large buttons and touch targets

---

## Database Integration Points

When connecting to a real database, the following data flows need API integration:

1. **User Authentication**: Sign up, sign in, session management
2. **Event Management**: CRUD operations for events and ticket types  
3. **Transaction Processing**: Payment tracking and status updates
4. **File Upload**: Payment proof and event image storage
5. **Real-time Updates**: Transaction status, seat availability
6. **Review System**: Post-event review collection and display
7. **Analytics**: Dashboard metrics and reporting
8. **Notification System**: Email alerts and in-app notifications

The DBML schema provides the complete database structure needed to support all these user flows.
