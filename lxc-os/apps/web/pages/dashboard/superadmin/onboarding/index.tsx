
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { GraduationCap, Plus } from "lucide-react";

export default function SuperAdminOnboardingPage() {
  return (
    <>
      <Head>
        <title>School Onboarding - SuperAdmin | LearnXChain</title>
      </Head>
      <DashboardLayout role="superadmin">
        <div className="w-full mx-auto space-y-8 pb-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">School Onboarding</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Track and manage school onboarding processes across the organization.
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all">
              <Plus className="h-4 w-4" />
              New Onboarding
            </button>
          </div>

          {/* Placeholder Content */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl p-12 shadow-sm">
            <div className="text-center">
              <GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                School Onboarding
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                This page will display all school onboarding processes. Coming soon!
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}

