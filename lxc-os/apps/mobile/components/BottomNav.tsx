import React from "react";
import { UnifiedBottomNav, NavItem } from "./UnifiedBottomNav";

export const BottomNav: React.FC = () => {
    const NAV_ITEMS: NavItem[] = [
        { label: "Home", icon: "home-outline", route: "/dashboard/student" },
        { label: "Schedule", icon: "calendar-outline", route: "/pages/timetable" },
        { label: "Chat", icon: "chatbubbles-outline", route: "/pages/communication" },
        { label: "Library", icon: "library-outline", route: "/pages/browse_books" },
        { label: "Doubts", icon: "help-circle-outline", route: "/pages/doubts" },
        { label: "Profile", icon: "person-circle-outline", route: "/pages/profile" },
    ];

    return <UnifiedBottomNav items={NAV_ITEMS} />;
};

