import React from "react";
import { UnifiedBottomNav, NavItem } from "./UnifiedBottomNav";

export const ParentBottomNav: React.FC = () => {
    const NAV_ITEMS: NavItem[] = [
        { label: "Home", icon: "home-outline", route: "/dashboard/parent" },
        { label: "Attendance", icon: "checkbox-outline", route: "/pages/parent-attendance" },
        { label: "Homework", icon: "book-outline", route: "/pages/parent-homework" },
        { label: "Fees", icon: "card-outline", route: "/pages/fees" },
        { label: "Profile", icon: "person-outline", route: "/pages/profile" },
    ];

    return <UnifiedBottomNav items={NAV_ITEMS} />;
};

