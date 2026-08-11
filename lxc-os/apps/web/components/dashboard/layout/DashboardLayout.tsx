import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import {
  Bell,
  ChevronDown,
  ChevronLeft,
  LogOut,
  Menu,
  Moon,
  Search,
  SunMedium,
  LayoutDashboard,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import {
  PROFILE_ROUTE,
  Role,
  dashboardConfig,
  NavSection,
  NavItem,
} from "../config/dashboardConfig";
import { useAuth } from "@/lib/context/AuthContext";
import client from "@/lib/api/client";
import { cn } from "@/lib/utils";
import GlobalSearch from "./GlobalSearch";


type DashboardLayoutProps = {
  role: Role;
  children: React.ReactNode;
  actions?: React.ReactNode;
  customSubGreeting?: React.ReactNode;
};

export default function DashboardLayout({ role, children, actions, customSubGreeting }: DashboardLayoutProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { logout, user, loading, adminPlanStatus, adminFeatures, groupOrgSubStatus } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);


  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mountedSidebar, setMountedSidebar] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [greeting, setGreeting] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
    () => {
      const config = dashboardConfig[role];
      const initial: Record<string, boolean> = {};
      config.sections.forEach((section) => {
        if (section.collapsible) {
          // By default, collapsible sections should start *closed* unless explicitly set
          initial[section.label] =
            section.defaultOpen === undefined ? false : section.defaultOpen;
        }
      });
      return initial;
    }
  );

  const [isRestored, setIsRestored] = useState(false);


  useEffect(() => {
    if (!mounted) return;

    try {
      const stored = localStorage.getItem(`sidebar_expanded_${role}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setExpandedSections((prev) => ({
          ...prev,
          ...parsed,
        }));
      }
    } catch (error) {
      // console.warn("Failed to restore sidebar state:", error);
    } finally {
      setIsRestored(true);
    }
  }, [mounted, role]);


  useEffect(() => {
    if (!mounted || !isRestored) return;

    try {
      localStorage.setItem(`sidebar_expanded_${role}`, JSON.stringify(expandedSections));
    } catch (error) {
      //console.warn("Failed to save sidebar state:", error);
    }
  }, [expandedSections, mounted, isRestored, role]);



  const isRitDashboard = router.asPath.split('?')[0] === "/dashboard/superadmin/rit";
  const config = isRitDashboard
    ? {
      role: "superadmin" as Role,
      label: "RIT AI Dashboard",
      accentColor: "from-indigo-500 to-purple-500",
      sections: [
        {
          label: "Overview",
          items: [
            {
              label: "Overview",
              href: "/dashboard/superadmin/rit",
              icon: Sparkles,
              exact: true,
            },
            {
              label: "Back to Super Admin",
              href: "/dashboard/superadmin",
              icon: ArrowLeft,
            },
          ],
        },
      ],
    }
    : dashboardConfig[role];
  const [sidebarPreferences, setSidebarPreferences] = useState<Record<string, boolean>>({});


  const [sidebarPrefsFetched, setSidebarPrefsFetched] = useState(false);

  // Load sidebar preferences for admin — fires ONCE after mount
  useEffect(() => {
    const isAdmin = user?.role === "admin" && role === "admin";
    if (!isAdmin || !mounted || sidebarPrefsFetched) return;

    setSidebarPrefsFetched(true);

    // Sync localStorage first for instant paint
    try {
      const prefs = localStorage.getItem("sidebarPreferences");
      if (prefs) setSidebarPreferences(JSON.parse(prefs));
    } catch (e) { }


    client.get("/v1/admin/settings/sidebar-preferences")
      .then((res: any) => {
        if (res.data?.preferences) {
          setSidebarPreferences(res.data.preferences);
          localStorage.setItem("sidebarPreferences", JSON.stringify(res.data.preferences));
        }
      })
      .catch((err: any) => {
        console.error("Failed to fetch sidebar preferences:", err);
      });

    const handlePreferencesUpdated = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setSidebarPreferences(customEvent.detail);
      }
    };

    window.addEventListener("sidebarPreferencesUpdated", handlePreferencesUpdated);
    return () => window.removeEventListener("sidebarPreferencesUpdated", handlePreferencesUpdated);
  }, [role, mounted, user?.role, sidebarPrefsFetched]);

  // Filter config based on sidebar preferences (strictly for admin role)
  const getFilteredConfig = () => {
    // Only apply filtering if the prop role is 'admin' AND the logged-in user role is 'admin'
    // This ensures superadmin and other roles are NEVER affected, even if viewing /admin routes
    const isAdmin = user?.role === "admin" && role === "admin";

    if (!isAdmin) {
      return config;
    }

    // MODEL_A feature-based route filtering (data-driven from FEATURE_CATALOG routes)
    const isModelA = adminPlanStatus.planModel === "MODEL_A";
    const hasPlanAccess =
      adminPlanStatus.status === "ACTIVE" || adminPlanStatus.status === "GRACE";

    // If the plan has expired, collapse the sidebar to Membership-only regardless
    // of which features are toggled. Features are only meaningful within an active plan.
    if (!hasPlanAccess && !adminPlanStatus.loading) {
      return {
        ...config,
        sections: config.sections.filter((s) =>
          ["Overview", "Membership", "System", "Support Management"].includes(s.label)
        ),
      };
    }

    const enabledFeatureRoutes = adminFeatures
      .filter((f) => (f.status || "").toUpperCase() === "ENABLED")
      .flatMap((f) => (Array.isArray(f.routes) ? f.routes : []));
    const allFeatureRoutes = adminFeatures
      .flatMap((f) => (Array.isArray(f.routes) ? f.routes : []));

    // Sections that are never feature-gated
    const alwayAllowedSections = new Set([
      "Overview", "System", "Support Management", "Membership",
    ]);

    // Convert section label → feature key (mirrors sidebarFeatureSync.toKey)
    const toFeatureKey = (label: string) =>
      label.toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, "");

    // Set of feature keys that are explicitly ENABLED 
    const enabledKeys = new Set(
      adminFeatures
        .filter((f) => (f.status || "").toUpperCase() === "ENABLED")
        .map((f) => (f.key || "").toUpperCase())
    );
    // Set of ALL known feature keys (whether enabled or disabled)
    const allKnownKeys = new Set(
      adminFeatures.map((f) => (f.key || "").toUpperCase())
    );

    /**
     * Returns true if a sidebar section should be visible.
     * Works even when FEATURE_CATALOG routes are not set up.
     */
    const isSectionAllowed = (sectionLabel: string): boolean => {
      if (alwayAllowedSections.has(sectionLabel)) return true;
      // MODEL_B with active plan → all sections visible
      if (!isModelA && hasPlanAccess) return true;
      // Still loading → show everything to avoid flicker (children are blocked anyway)
      if (adminPlanStatus.loading) return true;
      const key = toFeatureKey(sectionLabel);
      // Section maps to a known feature → only show if that feature is enabled
      if (allKnownKeys.has(key)) return enabledKeys.has(key);
      // Section has no corresponding feature in catalog → always show (utility/shared)
      return true;
    };

    const alwaysAllowedHrefs = new Set([
      "/admin",
      "/dashboard/admin",
      "/dashboard/admin/membership",
      "/dashboard/admin/feedback",
      "/dashboard/admin/support-tickets",
    ]);

    const isRouteAllowed = (href: string) => {
      if (alwaysAllowedHrefs.has(href)) return true;
      // MODEL_B active plan → all routes allowed
      if (!isModelA && hasPlanAccess) return true;
      // If features are still loading, don't hide anything yet
      if (adminPlanStatus.loading) return true;
      // Route belongs to an enabled feature → allowed
      if (enabledFeatureRoutes.some((r) => href === r || href.startsWith(r + "/") || r.startsWith(href + "/"))) return true;
      // Route doesn't belong to any known feature → always allow (shared/utility pages)
      if (!allFeatureRoutes.some((r) => href === r || href.startsWith(r + "/") || r.startsWith(href + "/"))) return true;
      return false;
    };

    // Prevent flash of unpurchased sections while subscription check is in-flight.
    // planModel is unknown during loading (empty string → isModelA = false), so we
    // can't rely on isModelA here. Guard explicitly with adminPlanStatus.loading.
    if (adminPlanStatus.loading) {
      return {
        ...config,
        sections: config.sections.filter((s) => alwayAllowedSections.has(s.label)),
      };
    }

    if (Object.keys(sidebarPreferences).length === 0 && !isModelA) {
      return config;
    }

    const filteredSections = config.sections
      .map((section) => {
        // Step 1: Filter items within the section
        const filteredItems = section.items.filter((item) => {
          const itemKey = `item:${section.label}:${item.href}`;
          const itemPrefEnabled = sidebarPreferences[itemKey] !== false; // Default to true
          return itemPrefEnabled && isRouteAllowed(item.href);
        });


        const prefEnabled = sidebarPreferences[`section:${section.label}`] !== false;
        if (!prefEnabled) return null;

        const mapsToKnownFeature = allKnownKeys.has(toFeatureKey(section.label));
        const featureEnabled = mapsToKnownFeature ? isSectionAllowed(section.label) : true;

        const hasVisibleItems = filteredItems.length > 0;

        if (featureEnabled || hasVisibleItems) {

          return {
            ...section,
            items: filteredItems,
          };
        }

        return null; // Hide entire section
      })
      .filter(Boolean) as NavSection[];

    return {
      ...config,
      sections: filteredSections,
    };
  };

  // Derive an effective config for admin based on subscription / plan model
  const effectiveConfig = getFilteredConfig();

  const isActive = (item: NavItem) => {
    if (typeof router.asPath !== "string") return false;

    // Remove query params for comparison
    const currentPath = router.asPath.split('?')[0];

    if (item.href === "/") return currentPath === "/";
    if (item.exact) return currentPath === item.href;

    const baseActive = currentPath === item.href || currentPath.startsWith(item.href + "/");
    if (!baseActive) return false;

    // Check if there's a more specific match in the sidebar
    // This prevents parent paths from being active when a child path is also in the sidebar
    const allItems = effectiveConfig.sections.flatMap(s => s.items);
    const hasMoreSpecificMatch = allItems.some(other => {
      if (other.href === item.href) return false;
      return (currentPath === other.href || currentPath.startsWith(other.href + "/")) &&
        other.href.length > item.href.length;
    });

    return !hasMoreSpecificMatch;
  };

  // Auto-expand sections based on active route
  useEffect(() => {
    if (!mounted || !effectiveConfig) return;

    setExpandedSections((prev) => {
      const next = { ...prev };
      let changed = false;

      effectiveConfig.sections.forEach((section) => {
        if (section.collapsible) {
          const hasActiveItem = section.items.some(isActive);

          // If the section should be expanded but isn't
          if (hasActiveItem && !next[section.label]) {
            next[section.label] = true;
            changed = true;
          }
        }
      });

      return changed ? next : prev;
    });
  }, [router.asPath, mounted, effectiveConfig]);
  /*
  const effectiveConfig =
    role === "admin"
      ? (() => {
        const hasPlanAccess =
          adminPlanStatus.status === "ACTIVE" ||
          adminPlanStatus.status === "GRACE";
        const hasAnyActiveFeature = adminFeatures.some(
          (f) => f.status === "ENABLED"
        );

        // MODEL_B: show full sidebar regardless of individual feature toggles
        // But always include Membership section
        if (adminPlanStatus.planModel === "MODEL_B") {
          const membershipSection = {
            label: "Membership",
            items: [
              {
                label: "Membership & Billing",
                href: "/dashboard/admin/membership",
              },
            ],
          };

          // Check if Membership section already exists
          const hasMembershipSection = config.sections.some(
            (s) => s.label === "Membership"
          );

          if (!hasMembershipSection) {
            return {
              ...config,
              sections: [...config.sections, membershipSection],
            };
          }
          return config;
        }

        // If there's no active plan and no active features, show Dashboard + Membership only
        if (!hasPlanAccess && !hasAnyActiveFeature && !adminPlanStatus.loading) {
          return {
            ...config,
            sections: [
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
              {
                label: "Membership",
                items: [
                  {
                    label: "Membership & Billing",
                    href: "/dashboard/admin/membership",
                  },
                ],
              },
            ],
          };
        }

        // If still loading, show Dashboard + Membership as default
        if (adminPlanStatus.loading) {
          return {
            ...config,
            sections: [
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
              {
                label: "Membership",
                items: [
                  {
                    label: "Membership & Billing",
                    href: "/dashboard/admin/membership",
                  },
                ],
              },
            ],
          };
        }

        const filteredSections = config.sections
          .map((section) => {
            const filteredItems = section.items.filter((item) => {
              // Dashboard link is always available
              if (item.href === "/admin") return true;
              // Membership link is always available
              if (item.href === "/dashboard/admin/membership") return true;

              // In MODEL_A mode, show a nav item only if at least one enabled feature
              // declares this route in its dynamic `routes` array. This is fully data-driven
              // from the FEATURE_CATALOG; nothing is hard-coded here.
              const enabledFeatures = adminFeatures.filter(
                (f) => f.status === "ENABLED"
              );
              const match = enabledFeatures.find((f) =>
                Array.isArray(f.routes) ? f.routes.includes(item.href) : false
              );
              return !!match;
            });

            if (filteredItems.length === 0) {
              return null;
            }

            return {
              ...section,
              items: filteredItems,
            };
          })
          .filter(Boolean) as NavSection[];

        // Ensure Dashboard is always in Overview section
        const overviewSection = filteredSections.find(
          (s) => s.label === "Overview"
        );
        if (overviewSection) {
          const hasDashboard = overviewSection.items.some(
            (item) => item.href === "/admin"
          );
          if (!hasDashboard) {
            overviewSection.items.unshift({
              label: "Dashboard",
              href: "/admin",
              icon: LayoutDashboard,
              exact: true,
            });
          }
        } else {
          // If no Overview section, add it with Dashboard
          filteredSections.unshift({
            label: "Overview",
            items: [
              {
                label: "Dashboard",
                href: "/admin",
                icon: LayoutDashboard,
                exact: true,
              },
            ],
          });
        }

        // Ensure Membership section is always present
        const membershipSection = {
          label: "Membership",
          items: [
            {
              label: "Membership & Billing",
              href: "/dashboard/admin/membership",
            },
          ],
        };

        const hasMembershipSection = filteredSections.some(
          (s) => s.label === "Membership"
        );

        if (!hasMembershipSection) {
          filteredSections.push(membershipSection);
        }

        return {
          ...config,
          sections: filteredSections,
        };
      })()
      : config;
  */
  // REove to apply restriction


  const renderNavItem = (item: NavItem) => {
    const active = isActive(item);

    return (
      <Link
        key={item.href}
        href={item.href}
        className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-colors ${active
          ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5"
          }`}
      >
        <span
          className={`inline-flex items-center gap-2 ${sidebarCollapsed ? "justify-center" : ""
            }`}
        >
          {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
          {!sidebarCollapsed && <span>{item.label}</span>}
        </span>
        {!sidebarCollapsed && item.badge && (
          <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  const renderSection = (section: NavSection) => {
    const isCollapsible = section.collapsible;
    const isOpen = !isCollapsible || (expandedSections[section.label] ?? false);

    const toggleSection = () => {
      if (!isCollapsible) return;
      setExpandedSections((prev) => ({
        ...prev,
        // Default to "closed" when toggling from an undefined state
        [section.label]: !(prev[section.label] ?? false),
      }));
    };

    return (
      <div key={section.label} className="space-y-2">
        <button
          type="button"
          className={`flex w-full items-center px-3 text-xs font-semibold uppercase tracking-wide text-gray-400 transition hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 ${!mountedSidebar || !sidebarCollapsed ? "justify-between" : "justify-center"
            }`}
          onClick={toggleSection}
          aria-expanded={isOpen}
        >
          {!sidebarCollapsed && (
            <>
              <span>{section.label}</span>
              {isCollapsible && (
                <span className="ml-2 inline-flex h-4 w-4 items-center justify-center">
                  <ChevronDown
                    className={`h-3 w-3 transition-transform ${isOpen ? "rotate-0" : "-rotate-90"
                      }`}
                  />
                </span>
              )}
            </>
          )}
        </button>
        {(!isCollapsible || isOpen) && (
          <div className="space-y-1.5">
            {section.items.map((item) => renderNavItem(item))}
          </div>
        )}
      </div>
    );
  };

  const ThemeToggle = () => {
    const isDark = mounted && theme === "dark";

    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600 dark:border-white/10 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-indigo-400 dark:hover:text-indigo-300",
          !mounted && "animate-pulse opacity-50"
        )}
        aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
        disabled={!mounted}
      >
        {mounted ? (
          isDark ? (
            <SunMedium className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )
        ) : (
          <span className="h-4 w-4" />
        )}
      </button>
    );
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setProfileMenuOpen(false);
      // logout function handles redirect
    } catch (error) {
      console.error("Logout failed", error);
      router.push("/");
    }
  };

  const handleMenuClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      // Mobile / tablet: open slide-in sidebar
      setSidebarOpen(true);
    } else {
      // Desktop: toggle collapsed state
      setSidebarCollapsed((prev) => !prev);
    }
  };

  useEffect(() => {
    setMountedSidebar(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
          e.preventDefault();
          setMobileSearchOpen(true);
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const hour = new Date().getHours();
    const period =
      hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening";
    const firstName = user?.name?.split(" ")[0] || "Admin";
    setGreeting(`Good ${period}, ${firstName}!`);
  }, [user?.name]);

  const roleHomePaths: Partial<Record<Role, string>> = {
    superadmin: "/dashboard/superadmin",
    admin: "/dashboard/admin",
    teacher: "/dashboard/teacher",
    student: "/dashboard/student",
    employee: "/dashboard/employee",
    parent: "/dashboard/parent",
    driver: "/dashboard/driver",
    transport: "/dashboard/transport",
    accounts: "/dashboard/accounts",
    hostel: "/dashboard/hostel",
    academics: "/dashboard/academics",
    library: "/dashboard/library",
    staff: "/dashboard/staff",
  };

  // MODEL_A per-feature route guard: redirect if admin navigates to a locked page directly
  useEffect(() => {
    if (!user || loading || user.role !== "admin" || role !== "admin") return;
    if (adminPlanStatus.loading) return;

    // MODEL_B with active plan: unrestricted
    const hasPlanAccess =
      adminPlanStatus.status === "ACTIVE" || adminPlanStatus.status === "GRACE";
    if (adminPlanStatus.planModel === "MODEL_B" && hasPlanAccess) return;

    const currentPath =
      typeof router.asPath === "string" ? router.asPath.split("?")[0] : "";

    const alwaysAllowed = [
      "/dashboard/admin",
      "/dashboard/admin/membership",
      "/dashboard/admin/feedback",
      "/dashboard/admin/support-tickets",
    ];
    if (alwaysAllowed.some((p) => currentPath === p || currentPath.startsWith(p + "/"))) return;

    const allFeatureRoutes = adminFeatures.flatMap((f) =>
      Array.isArray(f.routes) ? f.routes : []
    );
    const enabledRoutes = adminFeatures
      .filter((f) => f.status === "ENABLED")
      .flatMap((f) => (Array.isArray(f.routes) ? f.routes : []));

    // Determine if current path belongs to any feature
    const ownerFeature = adminFeatures.find(
      (f) =>
        Array.isArray(f.routes) &&
        f.routes.some(
          (r) => currentPath === r || currentPath.startsWith(r + "/")
        )
    );

    // If the route belongs to a feature that is NOT enabled → block
    if (ownerFeature && ownerFeature.status !== "ENABLED") {
      router.replace("/dashboard/admin/membership");
    }
  }, [router.asPath, adminFeatures, adminPlanStatus, user, loading, role]);

  // Prevent logged-in users from accessing other roles' dashboard routes
  useEffect(() => {
    if (loading) return;

    // If not authenticated, send to login
    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role === "forum_user") {
      const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const aiBaseUrl = isDev ? 'http://localhost:5000' : 'https://learnxchain.com';
      window.location.href = `${aiBaseUrl}/dashboard/forum`;
      return;
    }

    const userRole = user.role as Role;

    // Allow admins and superadmins to view all dashboards
    const canAccessRole =
      userRole === role || userRole === "admin" || userRole === "superadmin";

    if (!canAccessRole) {
      const targetPath = roleHomePaths[userRole] ?? `/dashboard/${userRole}`;
      const currentPath =
        typeof router.asPath === "string"
          ? router.asPath.split("?")[0]
          : router.asPath;

      if (currentPath !== targetPath) {
        router.replace(targetPath);
      }
    }
  }, [loading, user, role, router]);

  // Admin subscription / plan guard: redirect admins without an active plan
  // to the membership page. An expired subscription always forces the redirect —
  // feature-enable state is a sub-gate WITHIN an active plan, not a bypass for
  // a missing/expired one.
  useEffect(() => {
    if (!user || loading || adminPlanStatus.loading) return;
    if (user.role !== "admin" || role !== "admin") return;

    const hasPlanAccess =
      adminPlanStatus.status === "ACTIVE" || adminPlanStatus.status === "GRACE";

    const currentPath =
      typeof router.asPath === "string"
        ? router.asPath.split("?")[0]
        : "";

    const isOnMembershipPage =
      currentPath.startsWith("/dashboard/admin/membership");
    const isOnExemptPage =
      currentPath.startsWith("/dashboard/admin/feedback") ||
      currentPath.startsWith("/dashboard/admin/support-tickets");

    // If subscription is expired/missing, hard redirect to membership — no exceptions
    // based on feature state. Features only gate individual routes within a live plan.
    if (!hasPlanAccess && !isOnMembershipPage && !isOnExemptPage) {
      router.replace("/dashboard/admin/membership");
    }
  }, [user, loading, role, router.asPath, adminPlanStatus]);

  // Group-admin subscription guard: redirect group_admin without an active org plan
  // to the billing page and block dashboard access.
  useEffect(() => {
    if (!user || loading || groupOrgSubStatus.loading) return;
    if (user.role !== "group_admin" || role !== "group_admin") return;

    const hasAccess = groupOrgSubStatus.status === "ACTIVE" || groupOrgSubStatus.status === "GRACE";
    const currentPath =
      typeof router.asPath === "string" ? router.asPath.split("?")[0] : "";

    const isOnBillingPage = currentPath.startsWith("/dashboard/group-admin/billing");

    if (!hasAccess && !isOnBillingPage) {
      router.replace("/dashboard/group-admin/billing");
    }
  }, [user, loading, role, router.asPath, groupOrgSubStatus]);

  const isDashboardHome = () => {
    if (typeof router.asPath !== "string") return false;

    const currentPath = router.asPath.split("?")[0];

    const expectedPath = roleHomePaths[role] ?? `/dashboard/${role}`;

    return currentPath === expectedPath;
  };

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      {/* Mobile sidebar overlay - Only exists when open on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity opacity-100"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      {/* Combined Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-gray-200 bg-white/80 backdrop-blur-xl transition-all duration-300 dark:border-white/10 dark:bg-gray-900/80 lg:sticky lg:top-0 lg:h-screen lg:z-40 ${sidebarCollapsed ? "w-20" : "w-72"
          } ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-4 lg:px-6">
          <Link href="/" className="flex items-center gap-2 min-w-0">
            {/* Logo: school logo from assets if available, otherwise LearnXChain logo (no gradient background) */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg relative">
              {user && user.schoolId ? (
                <Image
                  src={user.schoolLogo || "/logo.png"}
                  alt="School logo"
                  fill
                  className="object-cover"
                />
              ) : (
                <Image
                  src="/logo.png"
                  alt="LearnXChain logo"
                  fill
                  className="object-contain"
                />
              )}
            </div>
            {!sidebarCollapsed && (
              <span
                className="font-bold text-gray-900 dark:text-white truncate"
                title={user && user.schoolId ? (user.schoolName || user.name) : "LearnXChain"}
              >
                {user && user.schoolId ? (user.schoolName || user.name) : "LearnXChain"}
              </span>
            )}
          </Link>
          <div className="flex items-center gap-2">
            {!sidebarCollapsed && <ThemeToggle />}
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white lg:hidden"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
          <div className="space-y-6">
            {effectiveConfig.sections.map((section) => renderSection(section))}
          </div>
        </div>

        <div className="border-t border-gray-200 p-3 dark:border-white/10 lg:p-4">
          <div
            className={`flex items-center ${sidebarCollapsed ? "justify-center" : "justify-between"
              } gap-2 rounded-xl bg-gray-50 p-2 dark:bg-gray-900`}
          >
            {/* User Profile Mini - simplified logic for brevity if needed, but keeping existing is fine if complex */}
            {/* ... User profile logic ... */}
            {!sidebarCollapsed ? (
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="h-8 w-8 shrink-0 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-white font-medium text-xs relative">
                  {user?.profilePic ? (
                    <Image
                      src={user.profilePic}
                      alt={user.name || "User avatar"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span>{user?.name?.charAt(0) || "U"}</span>
                  )}
                </div>
                <div className="flex flex-col truncate">
                  <span className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {user?.name || 'User'}
                  </span>
                  <span className="truncate text-xs text-gray-500 dark:text-gray-400">
                    {user?.role || role}
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-8 w-8 shrink-0 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-white font-medium text-xs relative">
                {user?.profilePic ? (
                  <Image
                    src={user.profilePic}
                    alt={user.name || "User avatar"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span>{user?.name?.charAt(0) || "U"}</span>
                )}
              </div>
            )}

            {!sidebarCollapsed && (
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-white hover:text-red-500 hover:shadow-sm dark:hover:bg-gray-800 dark:hover:text-red-400 transition-all"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Allow expanding sidebar if collapsed (optional UI element) */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="mt-2 flex w-full items-center justify-center rounded-lg py-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5 dark:hover:text-gray-300"
          >
            {sidebarCollapsed ? (
              <span className="h-1 w-1 rounded-full bg-gray-400" />
            ) : (
              <span className="text-xs font-medium">Collapse Sidebar</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-col min-h-screen flex-1 w-full overflow-hidden">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-gray-950/80">
          {/* Relative container so search can be absolutely centered */}
          <div className="relative flex items-center justify-between gap-4 px-4 py-3 lg:px-6">
            {/* Left: menu + title */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600 dark:border-white/10 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-indigo-400 dark:hover:text-indigo-300"
                onClick={handleMenuClick}
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="hidden flex-col lg:flex">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-gray-400">
                  {config.label}
                  <span className="h-1 w-1 rounded-full bg-emerald-400" />
                  Active
                </div>

              </div>
            </div>

            {/* Center: absolutely centered search bar (desktop / tablet only) */}
            <div className="pointer-events-none absolute inset-x-0 top-1/2 hidden -translate-y-1/2 md:flex justify-center px-4">
              <div className="pointer-events-auto w-full max-w-xl">
                <GlobalSearch />
              </div>
            </div>

            {/* Right: notifications + profile */}
            <div className="flex items-center gap-2">
              {/* Mobile search button - only visible on small screens */}
              <button
                type="button"
                className="flex md:hidden h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600 dark:border-white/10 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-indigo-400 dark:hover:text-indigo-300"
                onClick={() => setMobileSearchOpen(true)}
                aria-label="Open search"
              >
                <Search className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600 dark:border-white/10 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-indigo-400 dark:hover:text-indigo-300"
              >
                <Bell className="h-4 w-4" />
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-2 py-1 text-xs shadow-sm transition hover:border-indigo-300 hover:text-indigo-600 dark:border-white/10 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-indigo-400 dark:hover:text-indigo-300"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800 text-[10px] font-semibold text-white shadow-sm relative">
                    {user?.profilePic ? (
                      <Image
                        src={user.profilePic}
                        alt={user.name || "User avatar"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span>{user?.name?.charAt(0) || "U"}</span>
                    )}
                  </span>
                  <span className="hidden flex-col leading-tight sm:flex text-left">
                    <span className="font-medium text-gray-900 dark:text-gray-50">
                      {user?.name || 'User'}
                    </span>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                      {user?.role || config.label}
                    </span>
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 z-40 mt-2 w-44 rounded-xl border border-gray-200 bg-white p-1 text-xs shadow-lg dark:border-white/10 dark:bg-gray-900">
                    <button
                      type="button"
                      onClick={() => {
                        router.push(PROFILE_ROUTE);
                        setProfileMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-white/5"
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800 text-[10px] font-semibold text-white shadow-sm relative">
                        {user?.profilePic ? (
                          <Image
                            src={user.profilePic}
                            alt={user.name || "User avatar"}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <span>{user?.name?.charAt(0) || "U"}</span>
                        )}
                      </div>
                      <span>Profile</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-white/5"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Mobile search overlay */}
        {mobileSearchOpen && (
          <div
            className="fixed inset-0 z-50 flex flex-col p-4 pt-14 bg-black/50 md:hidden"
            onClick={() => setMobileSearchOpen(false)}
          >
            <div
              className="bg-white dark:bg-gray-900 rounded-xl p-3 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <GlobalSearch autoFocus onClose={() => setMobileSearchOpen(false)} />
            </div>
          </div>
        )}



        {/* Page content */}
        <main className="flex-1 bg-gradient-to-b from-gray-50 via-gray-50 to-gray-100 px-4 py-4 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900 lg:px-8 lg:py-6">
          <div className="mx-auto w-full max-w-[1600px]">
            {isDashboardHome() && greeting && role !== "student" && (
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-1">
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
                    {greeting}
                  </h1>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {customSubGreeting || "Here is what's happening in your space today."}
                  </div>
                </div>
                {actions && (
                  <div className="flex items-center gap-3">
                    {actions}
                  </div>
                )}
              </div>
            )}
            <div className="w-full">
              {/* Block page content while subscription check is in-flight for admin.
                   Skip the block entirely for MODEL_B (fixed plan) users — they have
                   unrestricted access and should never see the spinner. */}
              {role === "admin" && user?.role === "admin" && adminPlanStatus.loading && adminPlanStatus.planModel !== "MODEL_B" ? (
                <div className="flex min-h-[60vh] items-center justify-center">
                  <div className="flex flex-col items-center gap-3 text-gray-400 dark:text-gray-500">
                    <svg className="h-7 w-7 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    <span className="text-sm">Verifying access...</span>
                  </div>
                </div>
              ) : role === "group_admin" && user?.role === "group_admin" && groupOrgSubStatus.loading ? (
                <div className="flex min-h-[60vh] items-center justify-center">
                  <div className="flex flex-col items-center gap-3 text-gray-400 dark:text-gray-500">
                    <svg className="h-7 w-7 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    <span className="text-sm">Verifying access...</span>
                  </div>
                </div>
              ) : (
                children
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


