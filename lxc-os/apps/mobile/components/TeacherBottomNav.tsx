import React from "react";
import { UnifiedBottomNav, NavItem } from "./UnifiedBottomNav";

export const TeacherBottomNav: React.FC = () => {
    const NAV_ITEMS: NavItem[] = [
        { label: "Home", icon: "home-outline", route: "/dashboard/teacher" },
        { label: "Attendance", icon: "checkbox-outline", route: "/pages/teacher-attendance" },
        { label: "Chat", icon: "chatbubbles-outline", route: "/pages/communication" },
        { label: "Notices", icon: "megaphone-outline", route: "/pages/notices" },
        { label: "Profile", icon: "person-outline", route: "/pages/profile" },
    ];

    return <UnifiedBottomNav items={NAV_ITEMS} />;
};

