export interface FeatureConfig {
  name: string;
  subModules?: string[];
}

export const FeaturesListObj: FeatureConfig[] = [
  { name: "Library", subModules: ["Books", "Members"] },
  { name: "Hostel", subModules: ["Rooms", "Residents"] },
  { name: "Transport" },
  { name: "Accounts" },
  { name: "HRM" },
  { name: "Reports" },
  { name: "Peoples" },
  { name: "Settings" },
  { name: "Support" },
  { name: "Academics" },
  { name: "Management" },
  { name: "Announcements" },
  { name: "Notification" },
  { name: "Registration" },
];
