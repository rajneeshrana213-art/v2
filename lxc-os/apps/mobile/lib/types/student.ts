export interface StudentStats {
  attendancePercentage: number;
  pendingHomework: number;
  upcomingExamsCount: number;
  feeStatus: string;
  feePendingAmount: number;
}

export interface Lesson {
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  teacher: string;
  room: string;
  class?: string;
}

export interface Exam {
  id?: string;
  title: string;
  scheduleDate: string;
  subject: string | { name: string };
  type?: string;
  time?: string;
  syllabus?: string;
}

export type ExamSchedule = Exam;
export type ExamResult = ResultRecord;

export interface ResultRecord {
  id: string;
  score: number;
  createdAt: string;
  exam: {
    title: string;
    subject: {
      name: string;
    };
  };
  assignment?: {
    title: string;
    subject: {
      name: string;
    };
  };
}

export interface Notice {
  id: string;
  title: string;
  description: string;
  message?: string;
  category: string;
  attachment?: string | null;
  createdAt: string;
  creator?: { name: string };
  isRead?: boolean;
}

export interface Homework {
  id: string;
  title: string;
  subject: string;
  description: string;
  dueDate: string;
  status: "Submitted" | "Not Submitted";
  type: "ASSIGNMENT" | "HOMEWORK";
  submittedAt?: string | null;
  file?: string | null;
  attachment?: string | null;
}

export interface HomeworkResponse {
  homework: Homework[];
  studentId: string;
}

export interface StudentDashboardData {
  personalInfo: {
    name: string;
    class: string;
    rollNo: string;
    profilePic?: string;
    email?: string;
    phone?: string;
    admissionDate?: string;
  };
  stats: StudentStats;
  todaySchedule: Lesson[];
  upcomingExams: Exam[];
  recentHomework: Homework[];
  notices: Notice[];
}
export interface AttendanceRecord {
  date: string;
  status: "Present" | "Absent" | "Late" | "Holiday" | "None";
}

export interface AttendanceData {
  percentage: number;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  recentRecords: AttendanceRecord[];
}

export interface FeeHead {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  status: "Pending" | "Paid" | "Partial";
}

export interface PaymentHistory {
  id: string;
  amount: number;
  date: string;
  method: string;
  status: string;
  invoiceNumber?: string;
  invoiceUrl?: string;
  receiptNumber?: string;
  receiptUrl?: string;
}

export interface FeeData {
  totalAssigned: number;
  totalPaid: number;
  totalPending: number;
  personalInfo?: {
    id: string;
    schoolId: string;
    userId: string;
    name: string;
    email: string;
    phone: string;
  };
  pendingFees: FeeHead[];
  paymentHistory: PaymentHistory[];
}

export interface TimetableLesson {
  id?: string;
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  teacher: string;
  room: string;
  class?: string;
}

export interface WeeklyTimetable {
  MONDAY: TimetableLesson[];
  TUESDAY: TimetableLesson[];
  WEDNESDAY: TimetableLesson[];
  THURSDAY: TimetableLesson[];
  FRIDAY: TimetableLesson[];
  SATURDAY: TimetableLesson[];
  SUNDAY: TimetableLesson[];
}

export interface LeaveRequest {
  id: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export interface LeaderboardEntry {
  id: string;
  studentId: string;
  academicScore?: number;
  enhancementScore?: number;
  rank?: number;
  student: {
    user: {
      name: string;
      profilePic?: string;
    };
  };
}

export interface Doubt {
  id: string;
  title: string;
  content: string;
  status: "OPEN" | "ANSWERED" | "CLOSED";
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  chapter?: string;
  difficulty?: string;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  user: {
    name: string;
    profilePic?: string;
  };
  subject: {
    name: string;
  };
  _count: {
    replies: number;
  };
}

export interface DoubtReply {
  id: string;
  content: string;
  attachmentUrl?: string;
  upvotes: number;
  role?: string;
  createdAt: string;
  user: {
    name: string;
    profilePic?: string;
  };
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[];
}

export interface Quiz {
  id: string;
  title: string;
  timeLimit: number;
  points: number;
  subject?: { name: string };
  questions: QuizQuestion[];
  quizResults: { id: string }[];
}

export interface Article {
  id: string;
  title: string;
  content: string;
  submissionType: string;
  instructions?: string;
  createdAt: string;
  NewspaperSubmission: { id: string; content: string }[];
}

export interface EnhancementStats {
  quizzesTaken: number;
  articlesRead: number;
}

export interface PYQ {
  id: string;
  title: string;
  year: number;
  fileUrl: string;
  subject: {
    name: string;
  };
  class: {
    name: string;
  };
  uploader: {
    name: string;
  };
  createdAt: string;
}

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  isbn: string | null;
  publisher: string | null;
  category: string;
  availableCopies: number;
}

export interface IssuedBook {
  title: string;
  isbn: string | null;
  issueDate: string;
  dueDate?: string;
  returnDate?: string;
  fine: number;
}

export interface LibraryInfo {
  currentBooks: IssuedBook[];
  pastBooks: IssuedBook[];
}

export interface TransportStop {
  name: string;
  location: string;
}

export interface TransportInfo {
  busNumber: string;
  driverName?: string;
  routeName?: string;
  stops: TransportStop[];
}
