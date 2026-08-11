import React from "react";
import { UnifiedBottomNav, NavItem } from "./UnifiedBottomNav";

export const AdminBottomNav: React.FC = () => {
  const NAV_ITEMS: NavItem[] = [
    { label: "Home", icon: "home-outline", route: "/dashboard/admin" },
    { label: "Students", icon: "people-outline", route: "/dashboard/admin/students" },
    { label: "Teachers", icon: "school-outline", route: "/dashboard/admin/teachers" },
    { label: "Attendance", icon: "checkbox-outline", route: "/dashboard/admin/attendance" },
    { label: "Finance", icon: "wallet-outline", route: "/dashboard/admin/finance" },
    { label: "More", icon: "grid-outline", route: "/dashboard/admin/more" },
  ];

  return <UnifiedBottomNav items={NAV_ITEMS} />;
};

