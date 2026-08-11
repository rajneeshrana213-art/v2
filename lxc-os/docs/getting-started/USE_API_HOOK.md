# useApi Hook Documentation

The `useApi` hook is a powerful, generic React hook designed to simplify HTTP requests in your Next.js application. It provides built-in state management for loading, data, and errors, along with advanced features like request cancellation, custom headers, and integrated toast notifications.

## Features

- **Generic Type Support**: different response types are fully typed via TypeScript generics.
- **Unified Interface**: Use `get`, `post`, `put`, `patch`, and `del` methods from a single hook.
- **Request Cancellation**: Automatically aborts previous pending requests to prevent race conditions (can be manually aborted too).
- **Auto Toast Notifications**: success and error messages are handled automatically (customizable).
- **Smart Data Handling**: Automatically stringifies JSON bodies and leaves `FormData` intact.
- **Memory Leak Protection**: Cleans up subscriptions and aborts requests on component unmount.

## Interface

### `useApi<T>()`

Returns an object with the following properties:

| Property | Type | Description |
|Data | `T \| null` | The successful response data. |
| `error` | `any \| null` | The error object if the request failed. |
| `loading` | `boolean` | `true` if a request is currently in progress. |
| `get` | `(url, options?) => Promise` | Performs a GET request. |
| `post` | `(url, body?, options?) => Promise` | Performs a POST request. |
| `put` | `(url, body?, options?) => Promise` | Performs a PUT request. |
| `patch` | `(url, body?, options?) => Promise` | Performs a PATCH request. |
| `del` | `(url, options?) => Promise` | Performs a DELETE request. |
| `abort` | `() => void` | Manually cancels the current request. |
| `reset` | `() => void` | Resets `data`, `error`, and `loading` states. |

### Configuration Options (`options`)

You can pass these options to any request method:

| Option | Type | Default | Description |
|onSuccess | `(data: T) => void` | - | Callback function to run on success. |
| `onError` | `(error: any) => void` | - | Callback function to run on failure. |
| `successMessage` | `string` | - | Message to show in a success toast. |
| `errorMessage` | `string` | - | Custom error message override for the failure toast. |
| `headers` | `Record<string, string>` | - | Custom headers to include in the request. |
| `autoToast` | `boolean` | `true` | Whether to automatically show error toasts. |

---

## Usage Examples (Real-world Scenarios)

### 1. GET Request - Fetching Class Attendance

```typescript
interface AttendanceRecord {
  id: string;
  studentId: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  date: string;
}

const { data: attendance, loading, get } = useApi<AttendanceRecord[]>();

useEffect(() => {
  // Fetch attendance for a specific class on mount
  get('/api/v1/attendance/class/class-123?date=2024-03-20');
}, []);
```

### 2. GET by ID - Fetching Student Details

```typescript
interface StudentProfile {
  id: string;
  name: string;
  rollNumber: string;
  parentContact: string;
}

const { data: student, loading, get } = useApi<StudentProfile>();

const fetchStudent = (studentId: string) => {
  get(`/api/v1/student/${studentId}`);
};
```

### 3. POST Request (JSON) - Booking a Demo

```typescript
interface DemoBookingInput {
  fullName: string;
  email: string;
  schoolName: string;
  board: 'CBSE' | 'ICSE' | 'Other';
}

const { post, loading } = useApi<{ bookingId: string }>();

const handleBookDemo = async (data: DemoBookingInput) => {
  await post('/api/v1/demo/book', data, {
    successMessage: 'Demo booked successfully! Check your email.',
    onSuccess: (response) => {
      router.push(`/demo/success/${response.bookingId}`);
    }
  });
};
```

### 4. POST Request (FormData) - Uploading Assignment Submission

```typescript
const { post, loading } = useApi<{ fileUrl: string }>();

const submitAssignment = async (file: File, assignmentId: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('assignmentId', assignmentId);
  formData.append('studentId', 'student-xyz'); 

  // Content-Type is handled automatically (multipart/form-data)
  await post('/api/v1/assignments/submit', formData, {
    successMessage: 'Assignment uploaded successfully!',
  });
};
```

### 5. PUT Request - Updating Teacher Profile

```typescript
const { put, loading } = useApi<TeacherProfile>();

const updateProfile = async (teacherId: string, updates: { bio?: string; subjects?: string[] }) => {
  await put(`/api/v1/teacher/${teacherId}`, updates, {
    successMessage: 'Profile updated successfully!',
  });
};
```

### 6. PATCH Request - Marking Single Attendance

```typescript
const { patch } = useApi<AttendanceRecord>();

const markLate = async (attendanceId: string) => {
  await patch(`/api/v1/attendance/${attendanceId}`, { status: 'LATE' }, {
    onSuccess: (updatedRecord) => {
        // Optimistically update UI or re-fetch
    }
  });
};
```

### 7. DELETE Request - Removing a Student from Class

```typescript
const { del } = useApi();

const removeStudent = async (studentId: string, classId: string) => {
  if (!confirm('Are you sure you want to remove this student?')) return;

  await del(`/api/v1/class/${classId}/student/${studentId}`, {
    successMessage: 'Student removed from class.',
    onSuccess: () => {
      // Refresh class list
    }
  });
};
```

### 8. Advanced: Custom Headers (e.g., Exporting Reports)

```typescript
const { get, abort } = useApi<Blob>();

const downloadReport = () => {
  get('/api/v1/reports/attendance-summary', {
    headers: {
      'Accept': 'application/pdf', // Requesting PDF format
      'x-report-period': 'monthly'
    },
    errorMessage: 'Failed to generate report',
    onSuccess: (blobData) => {
      // Handle file download logic here
    }
  });
};
```
