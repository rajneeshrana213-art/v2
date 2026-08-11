import Head from "next/head";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { StatsOverview } from "@/components/dashboard/superadmin/StatsOverview";
import { useApi } from "@/hooks/useApi";
import { Loader } from '@/components/ui/feedback/Loader';


// Dynamic imports for heavy chart/widget components
const RevenueChart = dynamic(() => import("@/components/dashboard/superadmin/RevenueChart").then(m => ({ default: m.RevenueChart })), { ssr: false });
const RecentActivity = dynamic(() => import("@/components/dashboard/superadmin/RecentActivity").then(m => ({ default: m.RecentActivity })), { ssr: false });
const SystemHealthWidget = dynamic(() => import("@/components/dashboard/superadmin/SystemHealthWidget").then(m => ({ default: m.SystemHealthWidget })), { ssr: false });
const SupportStats = dynamic(() => import("@/components/dashboard/superadmin/SupportStats").then(m => ({ default: m.SupportStats })), { ssr: false });
const InsightsSection = dynamic(() => import("@/components/dashboard/superadmin/InsightsSection").then(m => ({ default: m.InsightsSection })), { ssr: false });
const AlertsWidget = dynamic(() => import("@/components/dashboard/superadmin/AlertsWidget").then(m => ({ default: m.AlertsWidget })), { ssr: false });

interface DashboardData {
  userStatistics: any;
  schoolStatistics: any;
  financialMetrics: any;
  systemHealth: any;
  recentActivity: any;
  supportAndFeedback: any;
  insights: any;
  alerts: any;
}

export default function SuperAdminDashboardPage() {
  const { data, loading, error, get } = useApi<DashboardData>();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      await get("/v1/superadmin/dashboard");
      setIsInitialLoad(false);
    };
    fetchData();
  }, [get]);

  if (error) {
    return (
      <DashboardLayout role="superadmin">
        <div className="flex h-[50vh] items-center justify-center">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-red-600">Error loading dashboard</h2>
            <p className="text-gray-500">{error.message || "Failed to load dashboard data"}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (loading || isInitialLoad || !data) {
    return (
      <DashboardLayout role="superadmin">
        <div className="flex h-[80vh] items-center justify-center">
          <Loader size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <Head>
        <title>SuperAdmin Dashboard - LearnXChain</title>
        <meta name="description" content="LearnXChain super admin dashboard — monitor revenue, system health, support stats, and activity across all schools." />
      </Head>
      <DashboardLayout role="superadmin">
        <div className="flex flex-col gap-6">

          {/* Top Row: Key Stats */}
          <StatsOverview stats={data} />

          {/* Second Row: Revenue & Health */}
          <div className="grid gap-6 lg:grid-cols-4">
            <div className="lg:col-span-3 h-full">
              <RevenueChart data={data.financialMetrics.monthlyRevenue} />
            </div>
            <div className="flex flex-col gap-6">
              <SystemHealthWidget health={data.systemHealth} />
              <SupportStats support={data.supportAndFeedback} />
            </div>
          </div>

          {/* Third Row: Insights (Schools, Geo, Plans) */}
          <InsightsSection insights={data.insights} />

          {/* Fourth Row: Recent Activity & Alerts */}
          <div className="grid gap-6 lg:grid-cols-4">
            <div className="lg:col-span-3">
              <RecentActivity recentActivity={data.recentActivity} />
            </div>
            <div>
              <AlertsWidget alerts={data.alerts} />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
