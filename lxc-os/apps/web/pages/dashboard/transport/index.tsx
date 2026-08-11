import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";

export default function TransportDashboardPage() {
  return (
    <>
      <Head>
        <title>Transport Dashboard - LearnXChain</title>
      </Head>
      <DashboardLayout role="transport">
        <div className="space-y-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              See your upcoming classes, work, and progress at a glance.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4 text-sm dark:border-white/10 dark:bg-gray-900/60">
              <div className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Today&apos;s classes
              </div>
              <div className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-50">
                5
              </div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                First class at 8:30 AM
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4 text-sm dark:border-white/10 dark:bg-gray-900/60">
              <div className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Pending assignments
              </div>
              <div className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-50">
                3
              </div>
              <div className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                1 due today
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4 text-sm dark:border-white/10 dark:bg-gray-900/60">
              <div className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Overall performance
              </div>
              <div className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-50">
                87%
              </div>
              <div className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                Keep it up!
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}


