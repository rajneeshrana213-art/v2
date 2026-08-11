import React from "react";
import { UnifiedBottomNav, NavItem } from "./UnifiedBottomNav";

export const DriverBottomNav: React.FC = () => {
    const NAV_ITEMS: NavItem[] = [
        { label: "Home", icon: "home-outline", route: "/dashboard/driver" },
        { label: "Pickups", icon: "checkbox-outline", route: "/pages/pickup" },
        { label: "Routes", icon: "map-outline", route: "/pages/route" },
        { label: "Profile", icon: "person-outline", route: "/pages/profile" },
    ];

    return <UnifiedBottomNav items={NAV_ITEMS} />;
};

