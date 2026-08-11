# API Reference

> Complete API documentation for LearnXChain

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

---

## Authentication Endpoints

### Login

**POST** `/auth/login`

Authenticate user and receive access tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "admin"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

### Register

**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "role": "student"
}
```

### Forgot Password

**POST** `/auth/forgot-password`

Request password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

### Change Password

**POST** `/auth/change-password`

Change user password (requires authentication).

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

---

## Student Endpoints

### Get All Students

**GET** `/v1/student`

Retrieve list of all students.

**Query Parameters:**
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 10)
- `search` (string, optional) - Search by name or email
- `classId` (string, optional) - Filter by class
- `status` (string, optional) - Filter by status (ACTIVE/INACTIVE)

**Response:**
```json
{
  "success": true,
  "data": {
    "students": [
      {
        "id": "student_id",
        "user": {
          "name": "Jane Smith",
          "email": "jane@example.com",
          "phone": "+1234567890"
        },
        "admissionNumber": "ADM-2025-0001",
        "class": {
          "id": "class_id",
          "name": "Grade 10-A"
        },
        "status": "ACTIVE"
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "totalPages": 10
    }
  }
}
```

### Get Student by ID

**GET** `/v1/student/[id]`

Retrieve detailed information about a specific student.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "student_id",
    "admissionNumber": "ADM-2025-0001",
    "user": {
      "name": "Jane Smith",
      "email": "jane@example.com",
      "phone": "+1234567890",
      "address": "123 Main St",
      "city": "New York",
      "bloodType": "O+"
    },
    "class": {
      "id": "class_id",
      "name": "Grade 10-A"
    },
    "dateOfBirth": "2010-05-15T00:00:00.000Z",
    "fatherName": "John Smith",
    "motherName": "Mary Smith",
    "status": "ACTIVE"
  }
}
```

### Create Student

**POST** `/v1/student`

Create a new student record.

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "password": "password123",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "country": "USA",
  "pincode": "10001",
  "bloodType": "O+",
  "sex": "FEMALE",
  "dateOfBirth": "2010-05-15",
  "fatherName": "John Smith",
  "motherName": "Mary Smith",
  "classId": "class_id",
  "schoolId": "school_id"
}
```

### Update Student

**PUT** `/v1/student/[id]`

Update student information.

**Request Body:** (all fields optional)
```json
{
  "name": "Jane Smith Updated",
  "phone": "+1234567891",
  "address": "456 New St"
}
```

### Delete Student

**DELETE** `/v1/student/[id]`

Delete a student record.

**Response:**
```json
{
  "success": true,
  "message": "Student deleted successfully"
}
```

### Get Student Attendance

**GET** `/v1/student/[id]/attendance`

Get attendance records for a student.

**Query Parameters:**
- `startDate` (string, optional) - Start date (YYYY-MM-DD)
- `endDate` (string, optional) - End date (YYYY-MM-DD)
- `month` (number, optional) - Month (1-12)
- `year` (number, optional) - Year

**Response:**
```json
{
  "success": true,
  "data": {
    "attendance": [
      {
        "id": "attendance_id",
        "date": "2025-01-15T00:00:00.000Z",
        "status": "PRESENT",
        "lesson": {
          "subject": "Mathematics"
        }
      }
    ],
    "summary": {
      "total": 20,
      "present": 18,
      "absent": 2,
      "percentage": 90
    }
  }
}
```

### Get Student Fees

**GET** `/v1/student/[id]/fees`

Get fee details for a student.

**Response:**
```json
{
  "success": true,
  "data": {
    "feePlan": {
      "id": "plan_id",
      "totalAmount": 50000,
      "paidAmount": 30000,
      "pendingAmount": 20000
    },
    "payments": [
      {
        "id": "payment_id",
        "amount": 10000,
        "status": "SUCCESS",
        "paymentDate": "2025-01-10T00:00:00.000Z",
        "method": "ONLINE"
      }
    ]
  }
}
```

---

## Teacher Endpoints

### Get All Teachers

**GET** `/v1/teacher`

Retrieve list of all teachers.

**Query Parameters:**
- `page`, `limit`, `search`, `status` (same as students)

### Get Teacher by ID

**GET** `/v1/teacher/[id]`

### Create Teacher

**POST** `/v1/teacher`

**Request Body:**
```json
{
  "name": "Dr. Robert Johnson",
  "email": "robert@example.com",
  "phone": "+1234567890",
  "password": "password123",
  "dateOfBirth": "1985-03-20",
  "qualification": "M.Sc. Mathematics",
  "workExperience": "10 years",
  "salary": 50000,
  "subjects": ["subject_id_1", "subject_id_2"]
}
```

### Update Teacher

**PUT** `/v1/teacher/[id]`

### Delete Teacher

**DELETE** `/v1/teacher/[id]`

---

## Admin Endpoints

### Class Management

#### Get All Classes

**GET** `/v1/admin/class`

#### Create Class

**POST** `/v1/admin/class`

**Request Body:**
```json
{
  "name": "Grade 10-A",
  "capacity": 40,
  "teacherId": "teacher_id",
  "schoolId": "school_id"
}
```

### Subject Management

#### Get All Subjects

**GET** `/v1/admin/subject`

#### Create Subject

**POST** `/v1/admin/subject`

**Request Body:**
```json
{
  "name": "Mathematics",
  "code": "MATH101",
  "description": "Advanced Mathematics",
  "schoolId": "school_id"
}
```

### Timetable Management

#### Get Timetable

**GET** `/v1/admin/timetable`

**Query Parameters:**
- `classId` (required) - Class ID
- `day` (optional) - Day of week (MONDAY, TUESDAY, etc.)

#### Create Timetable Entry

**POST** `/v1/admin/timetable`

**Request Body:**
```json
{
  "classId": "class_id",
  "subjectId": "subject_id",
  "teacherId": "teacher_id",
  "day": "MONDAY",
  "startTime": "09:00",
  "endTime": "10:00",
  "room": "Room 101"
}
```

### Exam Management

#### Create Exam

**POST** `/v1/admin/exam`

**Request Body:**
```json
{
  "name": "Mid-Term Exam",
  "classId": "class_id",
  "subjectId": "subject_id",
  "date": "2025-02-15",
  "duration": 120,
  "totalMarks": 100
}
```

### Notice Management

#### Get All Notices

**GET** `/v1/admin/notice`

#### Create Notice

**POST** `/v1/admin/notice`

**Request Body:**
```json
{
  "title": "School Holiday Announcement",
  "content": "School will remain closed on...",
  "targetAudience": "ALL",
  "priority": "HIGH",
  "schoolId": "school_id"
}
```

---

## Finance Endpoints

### Fee Head Management

#### Get All Fee Heads

**GET** `/v1/finance/fee-head`

#### Create Fee Head

**POST** `/v1/finance/fee-head`

**Request Body:**
```json
{
  "name": "Tuition Fee",
  "description": "Monthly tuition fee",
  "amount": 5000,
  "frequency": "MONTHLY",
  "schoolId": "school_id"
}
```

### Payment Processing

#### Create Payment

**POST** `/v1/finance/payment`

**Request Body:**
```json
{
  "studentId": "student_id",
  "amount": 10000,
  "paymentMethod": "ONLINE",
  "description": "Tuition fee payment"
}
```

#### Get Payment by ID

**GET** `/v1/finance/payment/[id]`

### Invoice Generation

#### Generate Invoice

**POST** `/v1/finance/invoice/generate`

**Request Body:**
```json
{
  "studentId": "student_id",
  "feeHeads": ["fee_head_id_1", "fee_head_id_2"],
  "dueDate": "2025-02-01"
}
```

### Financial Reports

#### Get Revenue Report

**GET** `/v1/finance/reports/revenue`

**Query Parameters:**
- `startDate` (required) - Start date
- `endDate` (required) - End date
- `groupBy` (optional) - GROUP_BY_DAY, GROUP_BY_MONTH, GROUP_BY_YEAR

---

## Transport Endpoints

### Bus Management

#### Get All Buses

**GET** `/v1/transport/bus`

#### Create Bus

**POST** `/v1/transport/bus`

**Request Body:**
```json
{
  "busNumber": "BUS-001",
  "registrationNumber": "DL-01-AB-1234",
  "capacity": 50,
  "driverId": "driver_id",
  "schoolId": "school_id"
}
```

### Route Management

#### Get All Routes

**GET** `/v1/transport/route`

#### Create Route

**POST** `/v1/transport/route`

**Request Body:**
```json
{
  "name": "Route 1",
  "busId": "bus_id",
  "stops": [
    {
      "name": "Stop 1",
      "latitude": 28.6139,
      "longitude": 77.2090,
      "arrivalTime": "07:00"
    }
  ],
  "schoolId": "school_id"
}
```

### Trip Tracking

#### Start Trip

**POST** `/v1/transport/trip/start`

**Request Body:**
```json
{
  "busId": "bus_id",
  "routeId": "route_id",
  "driverId": "driver_id"
}
```

#### End Trip

**POST** `/v1/transport/trip/[id]/end`

---

## Hostel Endpoints

### Room Management

#### Get All Rooms

**GET** `/v1/hostel/room`

#### Create Room

**POST** `/v1/hostel/room`

**Request Body:**
```json
{
  "roomNumber": "101",
  "hostelId": "hostel_id",
  "capacity": 4,
  "floor": 1,
  "type": "SHARED"
}
```

### Room Allocation

#### Allocate Room

**POST** `/v1/hostel/allocation`

**Request Body:**
```json
{
  "studentId": "student_id",
  "roomId": "room_id",
  "startDate": "2025-01-01",
  "endDate": "2025-12-31"
}
```

---

## Library Endpoints

### Book Management

#### Get All Books

**GET** `/v1/library/book`

**Query Parameters:**
- `search` - Search by title, author, ISBN
- `category` - Filter by category
- `available` - Filter by availability (true/false)

#### Create Book

**POST** `/v1/library/book`

**Request Body:**
```json
{
  "title": "Introduction to Algorithms",
  "author": "Thomas H. Cormen",
  "isbn": "978-0262033848",
  "category": "Computer Science",
  "quantity": 5,
  "libraryId": "library_id"
}
```

### Book Issue/Return

#### Issue Book

**POST** `/v1/library/issue`

**Request Body:**
```json
{
  "bookId": "book_id",
  "userId": "user_id",
  "dueDate": "2025-02-15"
}
```

#### Return Book

**POST** `/v1/library/return`

**Request Body:**
```json
{
  "issueId": "issue_id"
}
```

---

## Notification Endpoints

### Send Notification

**POST** `/v1/notification/send`

**Request Body:**
```json
{
  "title": "Exam Schedule",
  "message": "Your exam is scheduled for...",
  "recipients": ["user_id_1", "user_id_2"],
  "channels": ["EMAIL", "SMS", "PUSH"],
  "priority": "HIGH"
}
```

### Get User Notifications

**GET** `/v1/notification/user/[userId]`

**Query Parameters:**
- `unreadOnly` (boolean) - Get only unread notifications
- `page`, `limit` - Pagination

---

## Dashboard Endpoints

### Admin Dashboard

**GET** `/v1/dashboard/admin`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalStudents": 1250,
    "totalTeachers": 85,
    "totalRevenue": 5000000,
    "pendingFees": 500000,
    "attendanceToday": {
      "present": 1100,
      "absent": 150
    },
    "recentActivities": []
  }
}
```

### Student Dashboard

**GET** `/v1/dashboard/student/[studentId]`

### Teacher Dashboard

**GET** `/v1/dashboard/teacher/[teacherId]`

---

## Error Responses

All endpoints may return error responses in the following format:

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "field": "email",
    "message": "Invalid email format"
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Not found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Authentication endpoints**: 5 requests per minute
- **Read endpoints**: 100 requests per minute
- **Write endpoints**: 30 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642521600
```

---

## Webhooks

### Payment Webhook

**POST** `/api/webhooks/payment`

Razorpay payment webhook for payment status updates.

**Headers:**
```
X-Razorpay-Signature: <signature>
```

---

## Postman Collection

Import the Postman collection for easy API testing:

1. Download collection: `postman/LearnXChain.postman_collection.json`
2. Import into Postman
3. Set environment variables:
   - `baseUrl`: http://localhost:3000/api
   - `accessToken`: (obtained from login)

---

**Last Updated:** January 2026
