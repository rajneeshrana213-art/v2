import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { IJwtUserObj } from '@/lib/types';
import { useRouter } from 'next/router';

interface AuthContextType {
    user: any | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    adminPlanStatus: {
        status: "NONE" | "ACTIVE" | "GRACE" | "EXPIRED_AFTER_GRACE";
        planModel: "MODEL_A" | "MODEL_B";
        loading: boolean;
    };
    adminFeatures: { key: string; status: "ENABLED" | "DISABLED"; routes?: string[] }[];
    groupOrgSubStatus: {
        status: "NONE" | "ACTIVE" | "GRACE" | "EXPIRED_AFTER_GRACE";
        loading: boolean;
    };
    refreshAdminData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isDev = typeof window !== 'undefined'
  ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  : (process.env.NODE_ENV === 'development');

const aiBaseUrl = isDev ? 'http://localhost:5000' : 'https://chat.learnxchain.com';

export const ROLE_DASHBOARDS: Record<string, string> = {
    superadmin: '/dashboard/superadmin',
    admin: '/dashboard/admin',
    teacher: '/dashboard/teacher',
    student: '/dashboard/student',
    parent: '/dashboard/parent',
    library: '/dashboard/library',
    hostel: '/dashboard/hostel',
    transport: '/dashboard/transport',
    account: '/dashboard/account',
    staff: '/dashboard/staff',
    employee: '/dashboard/employee',
    driver: '/dashboard/driver',
    academics: '/dashboard/academics',
    group_admin: '/dashboard/group-admin',
    forum_user: `${aiBaseUrl}/lxc`,
};

import client from '@/lib/api/client';

export function AuthProvider({ children }: { children: ReactNode }) {
    const { data: session, status: sessionStatus } = useSession();
    const loading = sessionStatus === 'loading';
    const router = useRouter();

    // Once data is fetched successfully, never set loading=true again.
    // This prevents sidebar flicker on every navigation.
    const dataFetchedOnce = React.useRef(false);

    const [adminPlanStatus, setAdminPlanStatus] = React.useState<{
        status: "NONE" | "ACTIVE" | "GRACE" | "EXPIRED_AFTER_GRACE";
        planModel: "MODEL_A" | "MODEL_B";
        loading: boolean;
    }>({
        status: "NONE",
        planModel: "MODEL_A",
        loading: true,
    });
    const [adminFeatures, setAdminFeatures] = React.useState<
        { key: string; status: "ENABLED" | "DISABLED"; routes?: string[] }[]
    >([]);
    const [groupOrgSubStatus, setGroupOrgSubStatus] = React.useState<{
        status: "NONE" | "ACTIVE" | "GRACE" | "EXPIRED_AFTER_GRACE";
        loading: boolean;
    }>({ status: "NONE", loading: true });

    const loadAdminData = React.useCallback(async () => {
        const user = session?.user as any;
        if (!user) {
       
            if (!dataFetchedOnce.current) {
                setAdminPlanStatus(p => ({ ...p, loading: false }));
                setGroupOrgSubStatus(p => ({ ...p, loading: false }));
            }
            return;
        }

        if (user.role === 'admin') {
            try {
                const res = await client.get("/v1/dashboard/admin-subscription-status");
                const payload = res.data?.data;
                const nextStatus = payload?.status ?? "NONE";
                const nextPlanModel = payload?.planModel ?? "MODEL_A";

                dataFetchedOnce.current = true;
                setAdminPlanStatus({
                    status: nextStatus,
                    planModel: nextPlanModel,
                    loading: false,  // once set false, never goes back to true
                });

                const featureRes = await client.get("/v1/dashboard/admin-features");
                const rawFeatures = Array.isArray(featureRes.data) ? featureRes.data : [];
                setAdminFeatures(
                    rawFeatures.map((f: any) => ({
                        key: f.key,
                        status: f.status,
                        routes: Array.isArray(f.routes) ? f.routes : [],
                    }))
                );
            } catch (error) {
                console.error("Failed to load admin data in AuthContext", error);
                // On error: only set loading=false if we never loaded before
                if (!dataFetchedOnce.current) {
                    setAdminPlanStatus(p => ({ ...p, loading: false }));
                }
            }
        } else if (user.role === 'group_admin') {
            try {
                console.log("[DEBUG] AuthContext: Fetching group-admin subscription status...");
                const res = await client.get("/v1/dashboard/group-admin-subscription-status");
                console.log("[DEBUG] AuthContext: Group sub status response:", res.data);
                const payload = res.data?.data;
                const nextStatus = payload?.status ?? "NONE";
                dataFetchedOnce.current = true;
                setGroupOrgSubStatus({ status: nextStatus, loading: false });
            } catch (error) {
                console.error("[DEBUG] AuthContext: Failed to load group-admin sub status", error);
                if (!dataFetchedOnce.current) {
                    setGroupOrgSubStatus(p => ({ ...p, loading: false }));
                }
            }
        } else {
            dataFetchedOnce.current = true;
            setAdminPlanStatus(p => ({ ...p, loading: false }));
            setGroupOrgSubStatus(p => ({ ...p, loading: false }));
        }
    }, [session?.user]);

   
    useEffect(() => {
        const role = (session?.user as any)?.role;
        if (sessionStatus === 'authenticated' && (role === 'admin' || role === 'group_admin')) {
            // If already fetched once, run silently without touching loading state
            loadAdminData();
        } else if (sessionStatus === 'unauthenticated') {
            dataFetchedOnce.current = false;
            setAdminPlanStatus({ status: "NONE", planModel: "MODEL_A", loading: false });
            setGroupOrgSubStatus({ status: "NONE", loading: false });
            setAdminFeatures([]);
        }
    }, [sessionStatus, session?.user, loadAdminData]);

    useEffect(() => {
        const handleRefresh = () => loadAdminData();
        window.addEventListener("featuresUpdated", handleRefresh);
        return () => window.removeEventListener("featuresUpdated", handleRefresh);
    }, [loadAdminData]);

    const login = async (email: string, password: string) => {
        const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
        });

        if (result?.error) {
            throw new Error(result.error);
        }

        // Navigation will happen naturally via session update or we can force it
        // NextAuth doesn't refresh useSession immediately on redirect:false sometimes if not on same page
    };

    // Auto-Navigate after login when session becomes available
    useEffect(() => {
        if (!router.isReady) return; // Wait until router query is fully hydrated!

        if (session?.user && router.pathname === '/login') {
            const callbackUrl = router.query.callbackUrl as string;
            if (callbackUrl) {
                const isSafe = 
                    callbackUrl.startsWith('/') || 
                    callbackUrl.startsWith('http://localhost') || 
                    callbackUrl.includes('localhost:') || 
                    callbackUrl.includes('127.0.0.1:') || 
                    callbackUrl.includes('learnxchain.com');
                
                if (isSafe) {
                    window.location.href = callbackUrl;
                    return;
                }
            }
            const target = ROLE_DASHBOARDS[(session.user as any).role] || '/dashboard';
            router.push(target);
        }
    }, [session, router, router.isReady]);

    const logout = async () => {
        await signOut({ callbackUrl: '/login' });
    };

    return (
        <AuthContext.Provider value={{
            user: session?.user || null,
            loading,
            login,
            logout,
            isAuthenticated: !!session?.user,
            adminPlanStatus,
            adminFeatures,
            groupOrgSubStatus,
            refreshAdminData: loadAdminData
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
