export interface Child {
  id: string;
  name: string;
  rollNo: string | null;
  routeId: string | null;
  profilePic: string | null;
  className: string;
}

export interface ParentDashboardData {
  studentInfo: {
    name: string;
    class: string;
    rollNo: string | null;
    routeId: string | null;
    profilePic: string | null;
    schoolName: string;
  };
  stats: {
    attendancePercentage: number;
    pendingHomework: number;
    upcomingExamsCount: number;
    feeStatus: string;
    feePendingAmount: number;
  };
  notices: any[];
  recentHomework: any[];
}
