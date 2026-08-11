import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { BarChart3, FileText, Users, Wallet, ArrowLeft } from "lucide-react";

export default function AdminFinanceReportsPage() {
  return (
    <>
      <Head>
        <title>Finance Reports – Admin | LearnXChain</title>
      </Head>
      <DashboardLayout role="admin">
        <div className="space-y-6">
          <Link
            href="/dashboard/admin/finance"
            className="group inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Finance Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
                Finance Reports
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Quick access to key fee & collection reports.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ReportCard
              icon={Wallet}
              title="Collections Summary"
              description="Detailed breakdown of collections by fee head and monthly trends."
              href="/dashboard/admin/finance/reports/collection-summary"
              tone="emerald"
              badge="Daily ops"
            />
            <ReportCard
              icon={Users}
              title="Student Fees"
              description="Monitor student-wise dues, defaulters, and overall fee health."
              href="/dashboard/admin/finance/student-fees"
              tone="indigo"
              badge="Dues"
            />
            <ReportCard
              icon={BarChart3}
              title="Accounts Dashboard"
              description="Visual dashboard of demand, collections, class-wise dues, and aging."
              href="/dashboard/admin/finance"
              tone="violet"
              badge="Overview"
            />
            <ReportCard
              icon={FileText}
              title="Audit & Security"
              description="See high-level audit metrics and top users by finance operations."
              href="/dashboard/admin/finance/audit"
              tone="amber"
              badge="Audit"
            />
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}

function ReportCard({
  icon: Icon,
  title,
  description,
  href,
  tone,
  badge,
}: {
  icon: any;
  title: string;
  description: string;
  href: string;
  tone: "emerald" | "indigo" | "violet" | "amber";
  badge: string;
}) {
  const toneMap: Record<typeof tone, string> = {
    emerald: "bg-emerald-50 text-emerald-600",
    indigo: "bg-indigo-50 text-indigo-600",
    violet: "bg-violet-50 text-violet-600",
    amber: "bg-amber-50 text-amber-600",
  } as any;

  return (
    <Link href={href}>
      <Card className="group h-full cursor-pointer transition hover:border-indigo-200 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-full text-xs ${toneMap[tone]}`}
          >
            <Icon className="h-4 w-4" />
          </div>
          <Badge variant="outline" className="text-[10px] uppercase">
            {badge}
          </Badge>
        </CardHeader>
        <CardContent>
          <CardTitle className="text-sm font-semibold">{title}</CardTitle>
          <CardDescription className="mt-1 text-xs">
            {description}
          </CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}


