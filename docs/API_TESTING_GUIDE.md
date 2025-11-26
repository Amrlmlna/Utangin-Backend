# UTANGIN Backend API Testing Guide

## Prerequisites
- Ensure the backend server is running
- Environment variables are properly set:
  - SUPABASE_URL
  - SUPABASE_KEY
  - JWT_SECRET (optional, defaults to 'default_secret')

## Testing Endpoints

### 1. Auth Service

#### Register a new user
- **Endpoint**: `POST /auth/register`
- **Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "User Example",
  "phone": "+6281234567890",
  "ktp_number": "1234567890123456",
  "address": "Jl. Example No. 123, City, Country"
}
```
- **Response**:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Example",
    // ... other user fields
  },
  "token": "jwt_token"
}
```

#### Login
- **Endpoint**: `POST /auth/login`
- **Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```
- **Response**:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Example",
    // ... other user fields
  },
  "token": "jwt_token"
}
```

#### Get profile
- **Endpoint**: `GET /auth/profile`
- **Headers**:
  - Authorization: Bearer {jwt_token}
- **Response**: User object with all profile data

### 2. Users Service

#### Create a user (requires JWT)
- **Endpoint**: `POST /users`
- **Headers**:
  - Authorization: Bearer {jwt_token}
- **Request Body**:
```json
{
  "email": "newuser@example.com",
  "name": "New User",
  "phone": "+6281234567891",
  "ktp_number": "1234567890123457"
}
```

#### Get all users
- **Endpoint**: `GET /users`
- **Headers**:
  - Authorization: Bearer {jwt_token}

#### Get user by ID
- **Endpoint**: `GET /users/{user_id}`
- **Headers**:
  - Authorization: Bearer {jwt_token}

#### Update user
- **Endpoint**: `PUT /users/{user_id}`
- **Headers**:
  - Authorization: Bearer {jwt_token}
- **Request Body**: Partial user object with fields to update

### 3. Agreements Service

#### Create an agreement
- **Endpoint**: `POST /agreements`
- **Headers**:
  - Authorization: Bearer {jwt_token}
- **Request Body**:
```json
{
  "lender_id": "lender_uuid",
  "borrower_id": "borrower_uuid",
  "amount": 1000000,
  "interest_rate": 5.0,
  "due_date": "2025-12-31",
  "repayment_schedule": [
    {
      "amount": 500000,
      "due_date": "2025-11-30"
    },
    {
      "amount": 500000,
      "due_date": "2025-12-31"
    }
  ],
  "escalation_settings": "email reminder after 3 days"
}
```

#### Get all agreements
- **Endpoint**: `GET /agreements`
- **Headers**:
  - Authorization: Bearer {jwt_token}

#### Get agreements for a user
- **Endpoint**: `GET /agreements/user/{user_id}`
- **Headers**:
  - Authorization: Bearer {jwt_token}

#### Update agreement
- **Endpoint**: `PUT /agreements/{agreement_id}`
- **Headers**:
  - Authorization: Bearer {jwt_token}
- **Request Body**: Partial agreement object

#### Confirm agreement
- **Endpoint**: `PUT /agreements/{agreement_id}/confirm/{party}`
- **Headers**:
  - Authorization: Bearer {jwt_token}
- **Path Parameters**:
  - agreement_id: UUID of the agreement
  - party: 'lender' or 'borrower'

#### Mark agreement as paid
- **Endpoint**: `PUT /agreements/{agreement_id}/paid`
- **Headers**:
  - Authorization: Bearer {jwt_token}

### 4. Notifications Service

#### Create a notification
- **Endpoint**: `POST /notifications`
- **Headers**:
  - Authorization: Bearer {jwt_token}
- **Request Body**:
```json
{
  "user_id": "user_uuid",
  "agreement_id": "agreement_uuid",
  "type": "reminder",
  "title": "Payment Due Reminder",
  "message": "Your payment is due tomorrow",
  "delivery_method": "push"
}
```

#### Get all notifications
- **Endpoint**: `GET /notifications`
- **Headers**:
  - Authorization: Bearer {jwt_token}

#### Get notifications for user
- **Endpoint**: `GET /notifications/user/{user_id}`
- **Headers**:
  - Authorization: Bearer {jwt_token}

#### Mark notification as read
- **Endpoint**: `PUT /notifications/{notification_id}/read`
- **Headers**:
  - Authorization: Bearer {jwt_token}

#### Mark notification as unread
- **Endpoint**: `PUT /notifications/{notification_id}/unread`
- **Headers**:
  - Authorization: Bearer {jwt_token}

### 5. QR Service

#### Generate QR code for agreement
- **Endpoint**: `POST /qr/generate/{agreement_id}`
- **Headers**:
  - Authorization: Bearer {jwt_token}
- **Response**:
```json
{
  "qr_code_url": "data:image/png;base64,...",
  "qr_code_data": "json_string_with_agreement_details"
}
```

#### Verify QR code data
- **Endpoint**: `POST /qr/verify`
- **Headers**:
  - Authorization: Bearer {jwt_token}
- **Request Body**:
```json
{
  "qr_data": "json_string_with_agreement_details"
}
```

#### Confirm agreement via QR
- **Endpoint**: `POST /qr/confirm`
- **Headers**:
  - Authorization: Bearer {jwt_token}
- **Request Body**:
```json
{
  "qr_data": "json_string_with_agreement_details",
  "confirmed_by": "lender" | "borrower"
}
```

## Testing Sequence

To properly test the full workflow, follow this sequence:

1. Register two users (lender and borrower)
2. Create an agreement between them
3. Generate a QR code for the agreement
4. Verify the QR code and confirm by both parties
5. Test notifications by checking scheduled reminders
6. Update the agreement status to 'paid' when complete
7. Verify all data is correctly stored in the database

## Expected Response Format

All successful requests return a 200 status code with JSON response. Error responses return appropriate status codes (400, 401, 404, 500) with error messages in the format:
```json
{
  "message": "Error description"
}
```