
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { TrendingUp } from "lucide-react";

export default function SuperAdminPerformancePage() {
  return (
    <>
      <Head>
        <title>Performance (KPI) - SuperAdmin | LearnXChain</title>
      </Head>
      <DashboardLayout role="superadmin">
        <div className="w-full mx-auto space-y-8 pb-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Performance (KPI)</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                View performance metrics and KPIs across all employees.
              </p>
            </div>
          </div>

          {/* Placeholder Content */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl p-12 shadow-sm">
            <div className="text-center">
              <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Performance Metrics
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                This page will display performance metrics and KPIs for all employees. Coming soon!
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}

