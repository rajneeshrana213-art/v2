import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  UserCog,
  BusFront,
  Wallet,
  ShieldCheck,
  FileText,
  MessageSquare,
  BarChart3,
  CalendarDays,
  Bell,
  Layers,
  CalendarOff,
  Crown,
  Ticket,
  ArrowRightLeft,
  TrendingUp,
  LifeBuoy,
  MonitorPlay,
  Settings,
  Shield,
  Boxes,
  Building,
  CheckSquare,
  Clock,
  CreditCard,
  Library,
  Mail,
  Megaphone,
  Receipt,
  School,
  MapPin,
  MailCheck,
  ClipboardList,
  Sun,
  UserCheck,
  FileStack,
  Home,
  Star,
  Paperclip,
  Trophy,
  Globe,
  Briefcase,
  Smartphone,
  Sparkles,
  ArrowLeft,
  Cpu,
} from "lucide-react";

export type Role =
  | "superadmin"
  | "admin"
  | "teacher"
  | "student"
  | "employee"
  | "parent"
  | "driver"
  | "transport"
  | "accounts"
  | "hostel"
  | "academics"
  | "library"
  | "staff"
  | "group_admin"
  | "forum_user"
  | "rit";

export type NavItem = {
  label: string;
  href: string;
  icon?: LucideIcon;
  badge?: string;
  exact?: boolean;
};

export type NavSection = {
  label: string;
  items: NavItem[];

  collapsible?: boolean;
  defaultOpen?: boolean;
};

export type RoleDashboardConfig = {
  role: Role;
  label: string;
  accentColor: string;
  sections: NavSection[];
};

export const PROFILE_ROUTE = "/dashboard/profile";

export const dashboardConfig: Record<Role, RoleDashboardConfig> = {
  superadmin: {
    role: "superadmin",
    label: "Super Admin",
    accentColor: "from-indigo-500 to-purple-500",
    sections: [
      {
        label: "Overview",
        items: [
          {
            label: "Analytics",
            href: "/dashboard/superadmin",
            icon: LayoutDashboard,
            exact: true,
          },
          {
            label: "System Health",
            href: "/dashboard/superadmin/system-health",
            icon: ShieldCheck,
          },
          {
            label: "Manage App",
            href: "/dashboard/superadmin/manage-app",
            icon: Smartphone,
          },
          {
            label: "Rit Dashboard",
            href: "/dashboard/superadmin/rit",
            icon: Sparkles,
          },
          {
            label: "Deleted Records",
            href: "/dashboard/superadmin/deleted-records",
            icon: FileStack,
          },
        ],
      },
      {
        label: "Organisation",
        items: [
          {
            label: "Schools",
            href: "/dashboard/superadmin/schools",
            icon: GraduationCap,
          },
          {
            label: "Organizations",
            href: "/dashboard/superadmin/groups",
            icon: Building,
          },
          {
            label: "Assign Plan",
            href: "/dashboard/superadmin/assign-plan",
            icon: Layers,
          },
          {
            label: "Template Management",
            href: "/dashboard/superadmin/documents",
            icon: FileText,
          },
          {
            label: "SEO Optimization",
            href: "/dashboard/superadmin/seo",
            icon: Globe,
          },
        ],
      },
      {
        label: "Employee Management",
        items: [
          {
            label: "Employee Dashboard",
            href: "/dashboard/superadmin/employee-dashboard",
            icon: LayoutDashboard,
          },
          {
            label: "Employees",
            href: "/dashboard/superadmin/employees",
            icon: Users,
          },
          {
            label: "Leave Requests",
            href: "/dashboard/superadmin/leave-requests",
            icon: CalendarOff,
          },
           {
            label: "Careers",
            href: "/dashboard/superadmin/careers",
            icon: Briefcase,
          },
        ],
      },
      {
        label: "Accounts Management",
        collapsible: true,
        items: [
          {
            label: "Accounts Dashboard",
            href: "/superadmin/accounts-dashboard",
            icon: LayoutDashboard,
          },
          {
            label: "Membership Plans",
            href: "/superadmin/membership-plans",
            icon: Crown,
          },
          {
            label: "Coupon Code",
            href: "/dashboard/superadmin/coupon-codes",
            icon: Ticket,
          },
          {
            label: "Transaction",
            href: "/superadmin/transaction",
            icon: ArrowRightLeft,
          },
          {
            label: "Income & Expense",
            href: "/superadmin/income-expense",
            icon: TrendingUp,
          },
        ],
      },
      //   {
      //   label: "Sales & CRM",
      //   collapsible: true,
      //   items: [
      //     {
      //       label: "Leads Management",
      //       href: "/dashboard/superadmin/leads",
      //       icon: Users,
      //     },
      //     {
      //       label: "Demos & Meetings",
      //       href: "/dashboard/superadmin/demos",
      //       icon: MonitorPlay,
      //     },
      //     {
      //       label: "School Onboarding",
      //       href: "/dashboard/superadmin/onboarding",
      //       icon: GraduationCap,
      //     },
      //     {
      //       label: "Performance (KPI)",
      //       href: "/dashboard/superadmin/performance",
      //       icon: TrendingUp,
      //     },
      //   ],
      // },
      {
        label: "Support Management",
        collapsible: true,
        items: [
          {
            label: "Support Dashboard",
            href: "/superadmin/support-dashboard",
            icon: LayoutDashboard,
          },
          {
            label: "Feedback",
            href: "/dashboard/superadmin/feedback",
            icon: MessageSquare,
          },
          {
            label: "Support Tickets",
            href: "/dashboard/superadmin/support-tickets",
            icon: LifeBuoy,
          },
          {
            label: "Demo Requests",
            href: "/superadmin/demo-requests",
            icon: MonitorPlay,
          },
        ],
      },
    ],
  },
  rit: {
    role: "rit",
    label: "RIT AI Dashboard",
    accentColor: "from-indigo-500 to-purple-500",
    sections: [
      {
        label: "Security",
        items: [
          {
            label: "Model Router",
            href: "/dashboard/superadmin/rit/models",
            icon: Cpu,
          },
        ],
      },
      {
        label: "Content",
        items: [
          {
            label: "Overview",
            href: "/dashboard/superadmin/rit",
            icon: Sparkles,
            exact: true,
          },
          {
            label: "Speech & Media",
            href: "/dashboard/superadmin/rit/speech-media",
            icon: Globe,
          },
          {
            label: "Agent Registry",
            href: "/dashboard/superadmin/rit/agents",
            icon: Users,
          },
          {
            label: "Templates & PBL",
            href: "/dashboard/superadmin/rit/templates",
            icon: FileText,
          },
        ],
      },
      {
        label: "Exit",
        items: [
          {
            label: "Back to Super Admin",
            href: "/dashboard/superadmin",
            icon: ArrowLeft,
          },
        ],
      },
    ],
  },
  admin: {
    role: "admin",
    label: "Admin",
    accentColor: "from-blue-500 to-cyan-500",
    sections: [
      // ===== OVERVIEW =====
      {
        label: "Overview",
        items: [
          {
            label: "Dashboard",
            href: "/admin",
            icon: LayoutDashboard,
            exact: true,
          },
        ],
      },

      // ===== PEOPLE =====
      {
        label: "People",
         collapsible: true,
        defaultOpen: false,
        items: [
          {
            label: "Students",
            href: "/dashboard/admin/students",
            icon: GraduationCap,
          },
          {
            label: "Teachers",
            href: "/dashboard/admin/teachers",
            icon: Users,
          },
          {
            label: "Staff",
            href: "/dashboard/admin/staff",
            icon: UserCog,
          },
          {
            label: "Parents",
            href: "/dashboard/admin/parents",
            icon: UserCheck,
          },
        ],
      },

      // ===== ACADEMICS =====
      {
        label: "Academics",
        collapsible: true,
        defaultOpen: true,
        items: [
          {
            label: "Classes & Sections",
            href: "/dashboard/admin/classes",
            icon: School,
          },
          {
            label: "Subjects",
            href: "/dashboard/admin/subjects",
            icon: BookOpen,
          },
          {
            label: "Timetable",
            href: "/dashboard/admin/timetable",
            icon: Clock,
          },
          {
            label: "Attendance",
            href: "/dashboard/admin/attendance",
            icon: CheckSquare,
          },
          {
            label: "Exams & Results",
            href: "/dashboard/admin/exams",
            icon: FileText,
          },
          {
            label: "Student Promotion",
            href: "/dashboard/admin/student-promotion",
            icon: TrendingUp,
          },
        ],
      },

      // ===== OPERATIONS =====
      {
        label: "Operations",
        collapsible: true,
        defaultOpen: false,
        items: [
          {
            label: "Transport",
            href: "/dashboard/admin/transport",
            icon: BusFront,
          },
          // {
          //   label: "Hostel",
          //   href: "/dashboard/admin/hostel",
          //   icon: Home,
          // },
          {
            label: "Library",
            href: "/dashboard/admin/library",
            icon: Library,
          },
          {
            label: "Fees & Accounts",
            href: "/dashboard/admin/finance",
            icon: Wallet,
          },
        ],
      },

      // ===== Application =====
      {
        label: "Communication",
         collapsible: true,
        defaultOpen: false,
        items: [
          {
            label: "Chat & Meetings",
            href: "/dashboard/admin/communication",
            icon: MessageSquare,
          },
          // {
          //   label: "SMS / Email",
          //   href: "/dashboard/admin/notifications",
          //   icon: Mail,
          // },
        ],
      },

      // ===== REPORTS & DOCUMENTS =====
      {
        label: "Reports & Documents",
        collapsible: true,
        defaultOpen: false,
        items: [
          {
            label: "Reports & Analytics",
            href: "/dashboard/admin/reports",
            icon: BarChart3,
          },
          {
            label: "Smart Documents",
            href: "/dashboard/admin/documents",
            icon: FileStack,
          },
          {
            label: "ID Cards",
            href: "/dashboard/admin/id-cards",
            icon: CreditCard,
          },
        ],
      },

   
      // ===== MANAGEMENT =====
      {
        label: "Management",
        collapsible: true,
        defaultOpen: true,
        items: [
          {
            label: "Notices",
            href: "/dashboard/admin/notices",
            icon: Megaphone,
          },
          {
            label: "Events",
            href: "/dashboard/admin/events",
            icon: CalendarDays,
          },
          {
            label: "Holidays",
            href: "/dashboard/admin/holidays",
            icon: Sun,
          },
          {
            label: "Leave Requests",
            href: "/dashboard/admin/leave-requests",
            icon: ClipboardList,
          },
        ],
      },
         // ===== SYSTEM =====
      {
        label: "System",

        collapsible: true,
        defaultOpen: false,
        items: [
          {
            label: "School Settings",
            href: "/dashboard/admin/settings",
            icon: Settings,
          },
           {
            label: "Roles & Permissions",
            href: "/dashboard/admin/roles",
            icon: Shield,
          },
        ],
      },

      // ==== Support ===
      {
        label: "Support Management",
        collapsible: true,
        items: [
          {
            label: "Feedback",
            href: "/dashboard/admin/feedback",
            icon: MessageSquare,
          },
          {
            label: "Support Tickets",
            href: "/dashboard/admin/support-tickets",
            icon: LifeBuoy,
          },
          {
            label: "Membership & Plan",
            href: "/dashboard/admin/membership",
            icon: Crown,
          },
        ],
      },
    ],
  },
  group_admin: {
    role: "group_admin",
    label: "Group Admin",
    accentColor: "from-indigo-600 to-blue-600",
    sections: [
      {
        label: "Overview",
        items: [
          {
            label: "Group Analytics",
            href: "/dashboard/group-admin",
            icon: LayoutDashboard,
            exact: true,
          },
          {
            label: "Branches",
            href: "/dashboard/group-admin/branches",
            icon: School,
          },
        ],
      },
      {
        label: "Organization",
        items: [
          {
            label: "Global Settings",
            href: "/dashboard/group-admin/settings",
            icon: Settings,
          },
          {
            label: "Billing",
            href: "/dashboard/group-admin/billing",
            icon: CreditCard,
          },
        ],
      },
      {
        label: "Support",
        items: [
          {
            label: "Support Tickets",
            href: "/dashboard/group-admin/tickets",
            icon: LifeBuoy,
          },
        ],
      },
    ],
  },

  teacher: {
    role: "teacher",
    label: "Teacher",
    accentColor: "from-emerald-500 to-teal-500",
    sections: [
      {
        label: "Daily Control",
        items: [
          {
            label: "Dashboard",
            href: "/dashboard/teacher",
            icon: LayoutDashboard,
            exact: true,
          },
          {
            label: "Attendance",
            href: "/dashboard/teacher/attendance",
            icon: CheckSquare,
          },
          {
            label: "My Attendance",
            href: "/dashboard/teacher/attendance/my-attendance",
            icon: UserCheck,
          },
        ],
      },
      {
        label: "Academic Management",
        items: [
          {
            label: "My Classes",
            href: "/dashboard/teacher/classes",
            icon: School,
          },
          {
            label: "Homework / Assignments",
            href: "/dashboard/teacher/homework",
            icon: FileText,
          },
          {
            label: "Timetable",
            href: "/dashboard/teacher/timetable",
            icon: Clock,
          },
          {
            label: "Exam",
            href: "/dashboard/teacher/exam",
            icon: Clock,
          },
          {
            label: "PYQ",
            href: "/dashboard/teacher/pyq",
            icon: FileStack,
          },
        ],
      },
      {
        label: "Self Enhancement",
        items: [
          {
            label: "Enhancement Hub",
            href: "/dashboard/teacher/enhancement",
            icon: School,
          },
          {
            label: "Doubt Forum",
            href: "/dashboard/teacher/doubt-forum",
            icon: FileText,
          },
        ],
      },
      {
        label: "Communication & Admin",
        items: [
          {
            label: "Chat & Meetings",
            href: "/dashboard/teacher/communication",
            icon: MessageSquare,
          },
          {
            label: "Notices",
            href: "/dashboard/teacher/notices",
            icon: Bell,
          },
          {
            label: "Leave Requests",
            href: "/dashboard/teacher/leaves",
            icon: CalendarOff,
          },
          {
            label: "Student Leaves",
            href: "/dashboard/teacher/student-leaves",
            icon: ClipboardList,
          },
        ],
      },
      {
        label: "Account",
        items: [
          {
            label: "Profile",
            href: "/dashboard/teacher/profile",
            icon: UserCog,
          },
        ],
      },
      {
        label: "Help & Support",
        items: [
          {
            label: "Support Tickets",
            href: "/dashboard/teacher/tickets",
            icon: LifeBuoy,
          },
        ],
      },
    ],
  },
  student: {
    role: "student",
    label: "Student",
    accentColor: "from-violet-500 to-fuchsia-500",
    sections: [
      {
        label: "Learning Hub",
        items: [
          {
            label: "Dashboard",
            href: "/dashboard/student",
            icon: LayoutDashboard,
            exact: true,
          },
          {
            label: "Timetable",
            href: "/dashboard/student/timetable",
            icon: Clock,
          },
          {
            label: "Homework",
            href: "/dashboard/student/homework",
            icon: BookOpen,
          },
          {
            label: "PYQs",
            href: "/dashboard/student/pyq",
            icon: FileStack,
          },
          {
            label: "Self Enhancement",
            href: "/dashboard/student/enhancement",
            icon: Trophy,
          },
          {
            label: "Leaderboard",
            href: "/dashboard/student/leaderboard",
            icon: Crown,
          },
          {
            label: "Doubt Forum",
            href: "/dashboard/student/doubt-forum",
            icon: MessageSquare,
          },
        ],
      },
      {
        label: "Academic Progress",
        items: [
          {
            label: "Attendance",
            href: "/dashboard/student/attendance",
            icon: CheckSquare,
          },
          {
            label: "Exams & Results",
            href: "/dashboard/student/exams",
            icon: FileText,
          },
          {
            label: "Notices",
            href: "/dashboard/student/notices",
            icon: Bell,
          },
          {
            label: "Leave Requests",
            href: "/dashboard/student/leave",
            icon: ClipboardList,
          },
        ],
      },
      {
        label: "Library",
        items: [
          {
            label: "Browse Books",
            href: "/dashboard/student/library",
            icon: Library,
          },
          {
            label: "My Books",
            href: "/dashboard/student/library/my-books",
            icon: BookOpen,
          },
        ],
      },
      {
        label: "Communication",
        items: [
          {
            label: "Chat, Friends & Meetings",
            href: "/dashboard/student/communication",
            icon: MessageSquare,
          },
        ],
      },
      {
        label: "Account",
        items: [
          {
            label: "Fees & Billing",
            href: "/dashboard/student/fees",
            icon: Wallet,
          },
          {
            label: "My Profile",
            href: "/dashboard/student/profile",
            icon: UserCog,
          },
        ],
      },
      {
        label: "Help & Support",
        items: [
          {
            label: "Support Tickets",
            href: "/dashboard/student/tickets",
            icon: LifeBuoy,
          },
        ],
      },
    ],
  },
  employee: {
    role: "employee",
    label: "Employee",
    accentColor: "from-sky-500 to-blue-500",
    sections: [
      {
        label: "Overview",
        items: [
          {
            label: "My Dashboard",
            href: "/dashboard/employee",
            icon: LayoutDashboard,
            exact: true,
          },
        ],
      },
      {
        label: "Sales & CRM",
        items: [
          {
            label: "Leads Management",
            href: "/dashboard/employee/leads",
            icon: Users,
          },
          {
            label: "Demos & Meetings",
            href: "/dashboard/employee/demos",
            icon: MonitorPlay,
          },
          {
            label: "School Onboarding",
            href: "/dashboard/employee/onboarding",
            icon: GraduationCap,
          },
          {
            label: "Performance (KPI)",
            href: "/dashboard/employee/performance",
            icon: TrendingUp,
          },
        ],
      },
      {
        label: "Success & Support",
        items: [
          {
            label: "Support Tickets",
            href: "/dashboard/employee/tickets",
            icon: LifeBuoy,
          },
        ],
      },

      {
        label: "Leave & Attendance",
        items: [
          {
            label: "Leave Management",
            href: "/dashboard/employee/leave",
            icon: Users,
          },
          {
            label: "Attendance",
            href: "/dashboard/employee/attendance",
            icon: MonitorPlay,
          },
        ],
      },
    ],
  },
  parent: {
    role: "parent",
    label: "Parent",
    accentColor: "from-amber-500 to-orange-500",
    sections: [
      {
        label: "Learning Hub",
        items: [
          {
            label: "Dashboard",
            href: "/dashboard/parent",
            icon: LayoutDashboard,
            exact: true,
          },
          {
            label: "Attendance",
            href: "/dashboard/parent/attendance",
            icon: CheckSquare,
          },
          {
            label: "Homework",
            href: "/dashboard/parent/homework",
            icon: BookOpen,
          },
        ],
      },
      {
        label: "Academic Progress",
        items: [
          {
            label: "Exams & Results",
            href: "/dashboard/parent/exams",
            icon: FileText,
          },
          {
            label: "Notices",
            href: "/dashboard/parent/notices",
            icon: Bell,
          },
          {
            label: "Leave Requests",
            href: "/dashboard/parent/leave",
            icon: ClipboardList,
          },
        ],
      },
      {
        label: "Communication",
        items: [
          {
            label: "Chat & Meetings",
            href: "/dashboard/parent/communication",
            icon: MessageSquare,
          },
        ],
      },
      {
        label: "Account",
        items: [
          {
            label: "Fees & Billing",
            href: "/dashboard/parent/fees",
            icon: Wallet,
          },
          {
            label: "Profile",
            href: "/dashboard/parent/profile",
            icon: UserCog,
          },
        ],
      },
      {
        label: "Help & Support",
        items: [
          {
            label: "Support Tickets",
            href: "/dashboard/parent/tickets",
            icon: LifeBuoy,
          },
        ],
      },
    ],
  },
  driver: {
    role: "driver",
    label: "Driver",
    accentColor: "from-lime-500 to-emerald-500",
    sections: [
      {
        label: "Trip Control",
        items: [
          {
            label: "Dashboard",
            href: "/dashboard/driver",
            icon: LayoutDashboard,
            exact: true,
          },
          {
            label: "Pickup Checklist",
            href: "/dashboard/driver/pickup",
            icon: CheckSquare,
          },
          {
            label: "Route Stops",
            href: "/dashboard/driver/route",
            icon: MapPin,
          },
        ],
      },
      {
        label: "Communication",
        items: [
          {
            label: "Notifications",
            href: "/dashboard/driver/notifications",
            icon: Bell,
          },
        ],
      },
      {
        label: "Account",
        items: [
          {
            label: "My Profile",
            href: "/dashboard/driver/profile",
            icon: UserCog,
          },
        ],
      },
      {
        label: "Help & Support",
        items: [
          {
            label: "Support Tickets",
            href: "/dashboard/driver/tickets",
            icon: LifeBuoy,
          },
        ],
      },
    ],
  },
  transport: {
    role: "transport",
    label: "Transport",
    accentColor: "from-teal-500 to-cyan-500",
    sections: [
      {
        label: "Overview",
        items: [
          {
            label: "Transport Desk",
            href: "/dashboard/transport",
            icon: LayoutDashboard,
            exact: true,
          },
          {
            label: "Calendar",
            href: "/dashboard/transport/calendar",
            icon: CalendarDays,
          },
        ],
      },
      {
        label: "Fleet",
        items: [
          {
            label: "Buses",
            href: "/dashboard/transport/buses",
            icon: BusFront,
          },
          {
            label: "Drivers",
            href: "/dashboard/transport/drivers",
            icon: Users,
          },
          {
            label: "Routes",
            href: "/dashboard/transport/routes",
            icon: FileText,
          },
        ],
      },
      {
        label: "Compliance",
        items: [
          {
            label: "Permits",
            href: "/dashboard/transport/permits",
            icon: ShieldCheck,
          },
          {
            label: "Incidents",
            href: "/dashboard/transport/incidents",
            icon: FileText,
          },
        ],
      },
    ],
  },
  accounts: {
    role: "accounts",
    label: "Accounts",
    accentColor: "from-emerald-500 to-green-500",
    sections: [
      {
        label: "Overview",
        items: [
          {
            label: "Finance Dashboard",
            href: "/dashboard/accounts",
            icon: LayoutDashboard,
            exact: true,
          },
          {
            label: "Collections",
            href: "/dashboard/accounts/collections",
            icon: Wallet,
          },
        ],
      },
      {
        label: "Fees",
        items: [
          {
            label: "Student Fees",
            href: "/dashboard/accounts/student-fees",
            icon: GraduationCap,
          },
          {
            label: "Transport Fees",
            href: "/dashboard/accounts/transport-fees",
            icon: BusFront,
          },
        ],
      },
      {
        label: "Insights",
        items: [
          {
            label: "Reports",
            href: "/dashboard/accounts/reports",
            icon: BarChart3,
          },
          {
            label: "Audit",
            href: "/dashboard/accounts/audit",
            icon: ShieldCheck,
          },
        ],
      },
    ],
  },
  hostel: {
    role: "hostel",
    label: "Hostel",
    accentColor: "from-emerald-500 to-green-500",
    sections: [
      {
        label: "Overview",
        items: [
          {
            label: "Hostel Dashboard",
            href: "/dashboard/hostel",
            icon: LayoutDashboard,
            exact: true,
          },
          {
            label: "Collections",
            href: "/dashboard/hostel/collections",
            icon: Wallet,
          },
        ],
      },
      {
        label: "Fees",
        items: [
          {
            label: "Student Fees",
            href: "/dashboard/hostel/student-fees",
            icon: GraduationCap,
          },
          {
            label: "Transport Fees",
            href: "/dashboard/hostel/transport-fees",
            icon: BusFront,
          },
        ],
      },
      {
        label: "Insights",
        items: [
          {
            label: "Reports",
            href: "/dashboard/hostel/reports",
            icon: BarChart3,
          },
          {
            label: "Audit",
            href: "/dashboard/hostel/audit",
            icon: ShieldCheck,
          },
        ],
      },
    ],
  },
  academics: {
    role: "academics",
    label: "Academics",
    accentColor: "from-emerald-500 to-green-500",
    sections: [
      {
        label: "Overview",
        items: [
          {
            label: "Academics Dashboard",
            href: "/dashboard/academics",
            icon: LayoutDashboard,
            exact: true,
          },
          {
            label: "Collections",
            href: "/dashboard/academics/collections",
            icon: Wallet,
          },
        ],
      },
      {
        label: "Fees",
        items: [
          {
            label: "Student Fees",
            href: "/dashboard/academics/student-fees",
            icon: GraduationCap,
          },
          {
            label: "Transport Fees",
            href: "/dashboard/academics/transport-fees",
            icon: BusFront,
          },
        ],
      },
      {
        label: "Insights",
        items: [
          {
            label: "Reports",
            href: "/dashboard/academics/reports",
            icon: BarChart3,
          },
          {
            label: "Audit",
            href: "/dashboard/academics/audit",
            icon: ShieldCheck,
          },
        ],
      },
    ],
  },
  library: {
    role: "library",
    label: "Library",
    accentColor: "from-emerald-500 to-green-500",
    sections: [
      {
        label: "Overview",
        items: [
          {
            label: "Library Dashboard",
            href: "/dashboard/library",
            icon: LayoutDashboard,
            exact: true,
          },
          {
            label: "Collections",
            href: "/dashboard/library/collections",
            icon: Wallet,
          },
        ],
      },
      {
        label: "Fees",
        items: [
          {
            label: "Student Fees",
            href: "/dashboard/library/student-fees",
            icon: GraduationCap,
          },
          {
            label: "Transport Fees",
            href: "/dashboard/library/transport-fees",
            icon: BusFront,
          },
        ],
      },
      {
        label: "Insights",
        items: [
          {
            label: "Reports",
            href: "/dashboard/library/reports",
            icon: BarChart3,
          },
          {
            label: "Audit",
            href: "/dashboard/library/audit",
            icon: ShieldCheck,
          },
        ],
      },
    ],
  },
  staff: {
    role: "staff",
    label: "Staff",
    accentColor: "from-emerald-500 to-green-500",
    sections: [
      {
        label: "Overview",
        items: [
          {
            label: "Staff Dashboard",
            href: "/dashboard/staff",
            icon: LayoutDashboard,
            exact: true,
          },
          {
            label: "Collections",
            href: "/dashboard/staff/collections",
            icon: Wallet,
          },
        ],
      },
      {
        label: "Fees",
        items: [
          {
            label: "Student Fees",
            href: "/dashboard/staff/student-fees",
            icon: GraduationCap,
          },
          {
            label: "Transport Fees",
            href: "/dashboard/staff/transport-fees",
            icon: BusFront,
          },
        ],
      },
      {
        label: "Insights",
        items: [
          {
            label: "Reports",
            href: "/dashboard/staff/reports",
            icon: BarChart3,
          },
          {
            label: "Audit",
            href: "/dashboard/staff/audit",
            icon: ShieldCheck,
          },
        ],
      },
    ],
  },

  forum_user: {
    role: "forum_user",
    label: "Forum",
    accentColor: "from-violet-500 to-purple-500",
    sections: [
      {
        label: "Overview",
        items: [
          {
            label: "Forum Dashboard",
            href: "/dashboard/forum",
            icon: LayoutDashboard,
            exact: true,
          },
          {
            label: "Browse Doubts",
            href: "/dashboard/forum/doubts",
            icon: MessageSquare,
          },
          {
            label: "Leaderboard",
            href: "/dashboard/forum/leaderboard",
            icon: Trophy,
          },
        ],
      },
      {
        label: "My Activity",
        items: [
          {
            label: "My Answers",
            href: "/dashboard/forum/my-answers",
            icon: CheckSquare,
          },
          {
            label: "My Coins",
            href: "/dashboard/forum/coins",
            icon: Star,
          },
          {
            label: "My Profile",
            href: "/dashboard/forum/profile",
            icon: Users,
          },
        ],
      },
    ],
  },
};
