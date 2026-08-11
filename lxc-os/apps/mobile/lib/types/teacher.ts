export interface TeacherStats {
  todayClasses: number;
  homeworkToReview: number;
  attendancePending: boolean;
  noticesCount: number;
}

export interface TeacherLesson {
  id?: string;
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  class: string;
  room: string;
}

export interface TeacherNotice {
  id: string;
  title: string;
  content?: string;
  createdAt: string;
}

export interface TeacherDashboardData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    profilePic: string | null;
    dateOfJoin: string;
    subjects: string[];
    school: string;
  };
  stats: TeacherStats;
  todaySchedule: TeacherLesson[];
  notices: TeacherNotice[];
  recentDoubts?: any[];
  recentSubmissions?: any[];
}
