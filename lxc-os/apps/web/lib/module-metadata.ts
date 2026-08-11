/**
 * Module metadata mapping for sidebar permissions
 * Maps module names to their display information
 */
export interface ISidebarPermission {
  moduleKey: string;
  moduleName: string;
  icon: string;
  route: string;
  visible: boolean;
}

// Module metadata mapping
const MODULE_METADATA: Record<string, Omit<ISidebarPermission, 'visible'>> = {
  registration: {
    moduleKey: "RegistrationModule",
    moduleName: "Registration",
    icon: "ti ti-user-plus",
    route: "/registration",
  },
  peoples: {
    moduleKey: "PeoplesModule",
    moduleName: "Peoples",
    icon: "ti ti-users",
    route: "/peoples",
  },
  academics: {
    moduleKey: "AcademicsModule",
    moduleName: "Academics",
    icon: "ti ti-school",
    route: "/academics",
  },
  management: {
    moduleKey: "ManagementModule",
    moduleName: "Management",
    icon: "ti ti-settings",
    route: "/management",
  },
  hrm: {
    moduleKey: "HRMModule",
    moduleName: "HRM",
    icon: "ti ti-briefcase",
    route: "/hrm",
  },
  accounts: {
    moduleKey: "AccountsModule",
    moduleName: "Accounts",
    icon: "ti ti-cash",
    route: "/accounts",
  },
  visitor: {
    moduleKey: "VisitorModule",
    moduleName: "Visitor",
    icon: "ti ti-user-check",
    route: "/visitor",
  },
  announcements: {
    moduleKey: "AnnouncementsModule",
    moduleName: "Announcements",
    icon: "ti ti-bell",
    route: "/announcements",
  },
  settings: {
    moduleKey: "SettingsModule",
    moduleName: "Settings",
    icon: "ti ti-settings",
    route: "/settings",
  },
  support: {
    moduleKey: "SupportModule",
    moduleName: "Support",
    icon: "ti ti-help",
    route: "/support",
  },
  transport: {
    moduleKey: "TransportModule",
    moduleName: "Transport",
    icon: "ti ti-truck",
    route: "/transport",
  },
  library: {
    moduleKey: "LibraryModule",
    moduleName: "Library",
    icon: "ti ti-book",
    route: "/library",
  },
  hostel: {
    moduleKey: "HostelModule",
    moduleName: "Hostel",
    icon: "ti ti-home",
    route: "/hostel",
  },
  communication: {
    moduleKey: "CommunicationModule",
    moduleName: "Communication",
    icon: "ti ti-message",
    route: "/communication",
  },
  exam: {
    moduleKey: "ExamModule",
    moduleName: "Exam",
    icon: "ti ti-file-text",
    route: "/exam",
  },
};

export const getModuleMetadata = (moduleName: string): Omit<ISidebarPermission, 'visible'> | null => {
  const normalizedName = moduleName.toLowerCase().replace('module', '');
  return MODULE_METADATA[normalizedName] || null;
};

export const getAllModuleMetadata = (): Omit<ISidebarPermission, 'visible'>[] => {
  return Object.values(MODULE_METADATA);
};
