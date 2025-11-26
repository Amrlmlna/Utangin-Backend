# UTANGIN Backend Implementation Documentation

## Overview
This document details the implementation of the UTANGIN backend API, which provides services for managing personal loans between individuals. The backend is built using NestJS and integrates with Supabase for authentication and database operations.

## Tech Stack
- **Framework**: NestJS
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth with JWT
- **Scheduling**: NestJS Schedule for background tasks
- **QR Generation**: qrcode library

## Implemented Services

### 1. Auth Service
Handles user authentication and authorization with Supabase integration.

#### Endpoints:
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login existing user
- `POST /auth/logout` - Logout user
- `GET /auth/profile` - Get current user profile (requires JWT)

#### Features:
- User registration with email/password
- Secure login with JWT token generation
- Profile access with JWT authentication
- Supabase integration for authentication

### 2. Users Service
Manages user profiles and data.

#### Endpoints:
- `POST /users` - Create a new user
- `GET /users` - Get all users (requires JWT)
- `GET /users/:id` - Get specific user by ID (requires JWT)
- `PUT /users/:id` - Update user by ID (requires JWT)
- `DELETE /users/:id` - Delete user by ID (requires JWT)

#### Features:
- Complete CRUD operations for user management
- Reputation score management
- Soft delete with `deleted_at` field
- Validation for all user data

### 3. Agreements Service
Handles loan agreements between lenders and borrowers.

#### Endpoints:
- `POST /agreements` - Create a new loan agreement (requires JWT)
- `GET /agreements` - Get all agreements (requires JWT)
- `GET /agreements/user/:userId` - Get agreements for specific user (requires JWT)
- `GET /agreements/:id` - Get specific agreement (requires JWT)
- `PUT /agreements/:id` - Update agreement (requires JWT)
- `PUT /agreements/:id/confirm/:party` - Confirm agreement by lender/borrower (requires JWT)
- `PUT /agreements/:id/paid` - Mark agreement as paid (requires JWT)
- `DELETE /agreements/:id` - Delete agreement (requires JWT)

#### Features:
- Loan agreement creation with amount, interest, due date
- Dual confirmation system for lender and borrower
- Status tracking (pending, active, paid, overdue, disputed)
- Payment tracking and status updates

### 4. Notifications Service
Manages user notifications for payments, reminders, and confirmations.

#### Endpoints:
- `POST /notifications` - Create a new notification (requires JWT)
- `GET /notifications` - Get all notifications (requires JWT)
- `GET /notifications/user/:userId` - Get notifications for specific user (requires JWT)
- `GET /notifications/agreement/:agreementId` - Get notifications for specific agreement (requires JWT)
- `GET /notifications/:id` - Get specific notification (requires JWT)
- `PUT /notifications/:id` - Update notification (requires JWT)
- `PUT /notifications/:id/read` - Mark notification as read (requires JWT)
- `PUT /notifications/:id/unread` - Mark notification as unread (requires JWT)
- `DELETE /notifications/:id` - Delete notification (requires JWT)

#### Features:
- Multiple notification types (reminder, confirmation, payment, escalation, summary)
- Multiple delivery methods (push, email, WhatsApp)
- Read/unread status tracking
- Scheduled notifications for reminders

### 5. QR Service
Handles QR code generation and verification for agreement confirmations.

#### Endpoints:
- `POST /qr/generate/:agreementId` - Generate QR code for agreement (requires JWT)
- `POST /qr/verify` - Verify QR code data (requires JWT)
- `POST /qr/confirm` - Confirm agreement using QR code (requires JWT)

#### Features:
- QR code generation with agreement details
- Secure verification with timestamp and verification codes
- Expiration time for QR codes (1 hour)
- Agreement confirmation with dual verification

## Background Workers

### Notification Scheduler
Automated tasks that run at scheduled intervals:

1. **Daily Reminder Check** - Runs every day at 8:00 AM
   - Checks for agreements due in the next 24 hours
   - Sends reminders to borrowers

2. **Overdue Alert** - Runs every day at 9:00 AM
   - Checks for overdue agreements
   - Sends overdue notifications to borrowers

3. **Weekly Summary** - Runs every Sunday at 12:00 PM
   - Generates weekly summaries for users

## Security Features

### Authentication
- JWT-based authentication using Passport strategy
- All API endpoints (except public auth routes) require valid JWT tokens
- Secure token validation through Supabase integration

### Validation
- Comprehensive DTO validation using class-validator
- Input sanitization and validation
- Type checking for all data inputs

### Data Protection
- Encrypted authentication tokens
- Proper authorization checks
- Secure database access through Supabase

## Database Integration

### Supabase Integration
- Direct integration with Supabase PostgreSQL database
- Uses Supabase client for all database operations
- Leveraging existing migration schema

### Schema Support
- Full support for all tables defined in migration:
  - users, agreements, obligations, notifications, ratings, identity_verifications, audit_logs
- Proper foreign key relationships maintained
- Custom enum types supported (agreement_status, notification_type, delivery_method)

## Environmental Configuration

### Required Environment Variables
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_KEY` - Your Supabase service role key
- `JWT_SECRET` - Secret for JWT token generation (defaults to 'default_secret' if not provided)

## Running the Application

### Development
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

## Testing

### Running Tests
```bash
npm run test
npm run test:e2e
```

## API Security Notes

- All endpoints except authentication routes require JWT tokens
- Tokens are validated against Supabase
- Each request is authenticated before processing
- Proper error handling for unauthorized requests