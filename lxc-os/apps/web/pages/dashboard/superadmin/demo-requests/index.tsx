import React, { useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/layout/DashboardLayout';
import { useApi } from '@/hooks/useApi';
import { DemoRequestCard, DemoRequest } from '@/components/dashboard/superadmin/demo-requests/DemoRequestCard';
import { CalendarClock, History } from 'lucide-react';
import { Loader } from '@/components/ui/feedback/Loader';
import { Button } from '@/components/ui/button';

interface DemoResponse {
    success: boolean;
    data: DemoRequest[];
    pagination?: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
        limit: number;
    };
}

export default function DemoRequestsPage() {
    const [page, setPage] = React.useState(1);
    const { data, loading, error, get } = useApi<DemoResponse>();

    useEffect(() => {
        get(`/v1/superadmin/demo-requests?page=${page}&limit=10`);
    }, [get, page]);

    // Split requests into Upcoming (future) and Past
    // Since we don't have a reliable "scheduled date" for all requests (some just have createdAt),
    // we'll treat any request created in the last 24 hours or with a future preferred date as "Upcoming/New"
    // and older ones as "Past".
    // Actually, let's just split by status if we had one, but we don't.
    // Implementation plan said: "Split requests into "Upcoming" and "Past" based on dateTime or preferredDate."
    // The 'dateTime' in schema seems to be creation time mostly (default now()).
    // Let's iterate and check parsed data for preferred date, if not present, use createdAt.

    const requests = data?.data || [];

    const now = new Date();
    const upcomingRequests: DemoRequest[] = [];
    const pastRequests: DemoRequest[] = [];

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    requests.forEach((req) => {
        let hasPreferredDate = false;
        let isUpcoming = false;
        try {
            if (req.school.includes('|')) {
                const parts = req.school.split('|');
                const jsonStr = parts.slice(1).join('|').trim();
                const parsed = JSON.parse(jsonStr);
                if (parsed.preferredDate) {
                    hasPreferredDate = true;
                    const preferred = new Date(parsed.preferredDate);
                    // If preferred date is today or future, it's upcoming
                    if (!isNaN(preferred.getTime()) && preferred >= today) {
                        isUpcoming = true;
                    }
                }
            }
        } catch (e) {
            // ignore parse error
        }

        if (hasPreferredDate) {
            if (isUpcoming) {
                upcomingRequests.push(req);
            } else {
                pastRequests.push(req);
            }
        } else {

            // Fallback: if created in last 7 days, consider it "New/Coming" if no specific date
            // Or simpler: Just put everything in "Past" if it doesn't have a future preferred creation date?
            // Let's assume if it is not resolved/actioned it is upcoming. But we don't have status field on schema.
            // So let's use the logic: Has Future/Today Preferred Date -> Upcoming. Else -> Past (or just Inbound History).

            // Better logic as requested: "two coloum one for comming and one fopr past"
            // Let's put everything that is "New" (e.g. recent) in Coming if no date.
            // Actually, let's just map all "Future Preferred Date" to Upcoming.
            // And everything else to Past/All.
            // But if a user just submitted a request 1 minute ago without preferred date, it should probably be in "Upcoming" / "New".

            const reqDateStr = req.dateTime || req.createdAt;
            const reqDate = new Date(reqDateStr);
            const reqDay = new Date(reqDate.getFullYear(), reqDate.getMonth(), reqDate.getDate());

            if (reqDay >= today) {
                upcomingRequests.push(req);
            } else {
                pastRequests.push(req);
            }
        }
    });

    // Sort: Upcoming by date (nearest first), Past by date (newest first)
    // upcomingRequests.sort((a,b) => ... ) - mostly already sorted by API desc

    return (
        <>
            <Head>
                <title>Demo Requests - LearnXChain</title>
            </Head>
            <DashboardLayout role="superadmin">
                <div className="flex flex-col gap-8 h-full">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Demo Requests</h1>
                        <p className="text-gray-500 dark:text-gray-400">Manage incoming demo bookings and history</p>
                    </div>

                    {(loading && !data) ? (
                        <div className="flex flex-1 items-center justify-center min-h-[400px]">
                            <Loader size="lg" />
                        </div>
                    ) : error ? (
                        <div className="flex flex-1 items-center justify-center min-h-[400px] text-red-500">
                            Failed to load requests
                        </div>
                    ) : (
                        <div className="grid lg:grid-cols-2 gap-8 h-full">
                            {/* Upcoming / New Column */}
                            <div className="flex flex-col gap-6">
                                <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-800">
                                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                                        <CalendarClock size={20} />
                                    </div>
                                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                        New & Upcoming
                                        <span className="ml-2 text-sm font-normal text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                                            {upcomingRequests.length}
                                        </span>
                                    </h2>
                                </div>

                                <div className="space-y-4">
                                    {upcomingRequests.length > 0 ? (
                                        upcomingRequests.map(req => (
                                            <DemoRequestCard key={req.id} request={req} />
                                        ))
                                    ) : (
                                        <div className="text-center py-12 text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                                            No new or upcoming requests
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Past / History Column */}
                            <div className="flex flex-col gap-6">
                                <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-800">
                                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400">
                                        <History size={20} />
                                    </div>
                                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                        Past History
                                        <span className="ml-2 text-sm font-normal text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                                            {pastRequests.length}
                                        </span>
                                    </h2>
                                </div>

                                <div className="space-y-4 opacity-80">
                                    {pastRequests.length > 0 ? (
                                        pastRequests.map(req => (
                                            <DemoRequestCard key={req.id} request={req} isPast={true} />
                                        ))
                                    ) : (
                                        <div className="text-center py-12 text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                                            No past history
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && data?.pagination && data.pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-800 pt-6 mt-4">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Page <span className="font-medium text-gray-900 dark:text-gray-100">{data.pagination.currentPage}</span> of{" "}
                                <span className="font-medium text-gray-900 dark:text-gray-100">{data.pagination.totalPages}</span>
                                <span className="ml-2">({data.pagination.totalItems} total requests)</span>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="bg-white dark:bg-gray-900"
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.min(data.pagination!.totalPages, p + 1))}
                                    disabled={page === data.pagination.totalPages}
                                    className="bg-white dark:bg-gray-900"
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </>
    );
}
