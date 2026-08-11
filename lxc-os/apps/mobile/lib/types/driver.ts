export interface Route {
  id: string;
  name: string;
  busId: string | null;
  schoolId: string;
}

export interface Trip {
  id: string;
  driverId: string;
  busId: string;
  routeId: string;
  type: "MORNING" | "RETURN";
  status: "ACTIVE" | "COMPLETED";
  startedAt: string;
  endedAt: string | null;
  route?: Route;
  busAttendance?: {
    studentId: string;
    status: "BOARDED" | "ALIGHTED" | "MISSED";
  }[];
}

export interface DriverDashboardData {
  driverId: string;
  busId: string | null;
  schoolId: string;
  driverName: string;
  profilePic: string | null;
  email: string;
  phone: string;
  license: string;
  busNumber: string;
  schoolName: string;
  activeTrip: Trip | null;
  assignedRoute: Route | null;
}
