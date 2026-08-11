import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/dashboard/layout/DashboardLayout';
import { useApi } from '@/hooks/useApi';
import { ArrowLeft, Mail, Phone, MapPin, Briefcase, Calendar, FileText, CheckCircle, Clock, X } from 'lucide-react';

import { clsx } from 'clsx';

interface EmployeeDetail {
    id: string;
    employeeCode: string;
    employeeType: string;
    status: string;
    company: string;
    createdAt: string;
    user: {
        name: string;
        email: string;
        phone: string;
        profilePic: string | null;
        address: string;
        city: string;
        state: string;
        country: string;
        pincode: string;
        sex: string;
        bloodType: string;
    };
    documents: {
        id: string;
        fileName: string;
        fileUrl: string;
        fileType: string;
        fileSize: number;
        createdAt: string;
    }[];
    stats: Record<string, number>;
}

import { toast } from 'react-hot-toast';
import { Loader } from '@/components/ui/feedback/Loader';
import { decodeId } from "@/lib/utils/hashId";

export default function EmployeeProfilePage() {
    const router = useRouter();
    const { id: rawId } = router.query;
    const id = rawId ? decodeId(rawId as string) : undefined;
    const { data: employee, loading, error, get, patch } = useApi<EmployeeDetail>();
    const [activeTab, setActiveTab] = useState<'overview' | 'documents'>('overview');
    const [actionLoading, setActionLoading] = useState(false);

    const handleStatusChange = async (currentStatus: string) => {
        const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        setActionLoading(true);
        try {
            await patch(`/v1/superadmin/employees/${id}`, { status: newStatus });
            toast.success(`Employee ${newStatus === 'ACTIVE' ? 'activated' : 'suspended'} successfully`);
            get(`/v1/superadmin/employees/${id}`);
        } catch (err) {
            toast.error('Failed to update status');
        } finally {
            setActionLoading(false);
        }
    };



    const [selectedDocument, setSelectedDocument] = useState<{ url: string; type: string } | null>(null);

    useEffect(() => {
        if (id) {
            get(`/v1/superadmin/employees/${id}`);
        }
    }, [id]);

    const isLoading = loading || (!employee && !error);

    if (isLoading) {
        return (
            <DashboardLayout role="superadmin">
                <div className="flex h-[80vh] items-center justify-center">
                    <Loader size="lg" />
                </div>
            </DashboardLayout>
        );
    }

    if (error || !employee) {
        return (
            <DashboardLayout role="superadmin">
                <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
                    <p className="text-gray-500">Employee not found</p>
                    <button onClick={() => router.back()} className="text-indigo-600 hover:underline">Go Back</button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="superadmin">
            <Head>
                <title>{employee.user.name} - LearnXChain</title>
            </Head>

            <div className="space-y-6">
                {/* Header / Back Button */}
                <div>
                    <button
                        onClick={() => router.back()}
                        className="mb-4 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Employees
                    </button>
                </div>

                {/* Profile Header Card */}
                <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-900 sm:p-8">
                    <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 translate-y-[-50%] rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/20" />

                    <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
                        <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-md dark:border-gray-800">
                            {employee.user.profilePic ? (
                                <img src={employee.user.profilePic} alt={employee.user.name} className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-indigo-100 text-2xl font-bold text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                                    {employee.user.name.charAt(0)}
                                </div>
                            )}
                        </div>

                        <div className="flex-1">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{employee.user.name}</h1>
                                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{employee.employeeType.replace(/_/g, ' ')}</p>
                                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <Mail className="h-4 w-4" />
                                            {employee.user.email}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Phone className="h-4 w-4" />
                                            {employee.user.phone}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Briefcase className="h-4 w-4" />
                                            {employee.employeeCode}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className={clsx(
                                        "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium",
                                        employee.status === 'ACTIVE'
                                            ? "bg-green-50 text-green-700 dark:bg-green-900/10 dark:text-green-400"
                                            : "bg-red-50 text-red-700 dark:bg-red-900/10 dark:text-red-400"
                                    )}>
                                        <span className={clsx("mr-1.5 h-2 w-2 rounded-full", employee.status === 'ACTIVE' ? "bg-green-600" : "bg-red-600")}></span>
                                        {employee.status}
                                    </span>
                                    <button
                                        onClick={() => handleStatusChange(employee.status)}
                                        disabled={actionLoading}
                                        className={clsx(
                                            "inline-flex items-center justify-center rounded-lg px-3 py-1 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900",
                                            employee.status === 'ACTIVE'
                                                ? "bg-red-50 text-red-700 hover:bg-red-100 focus:ring-red-500 dark:bg-red-900/10 dark:text-red-400 dark:hover:bg-red-900/20"
                                                : "bg-green-50 text-green-700 hover:bg-green-100 focus:ring-green-500 dark:bg-green-900/10 dark:text-green-400 dark:hover:bg-green-900/20"
                                        )}
                                    >
                                        {actionLoading ? (
                                            <Loader className="" />
                                        ) : employee.status === 'ACTIVE' ? (
                                            <X className="mr-1.5 h-3 w-3" />
                                        ) : (
                                            <CheckCircle className="mr-1.5 h-3 w-3" />
                                        )}
                                        {employee.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-800">
                    <nav className="-mb-px flex space-x-8">
                        {['overview', 'documents'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={clsx(
                                    "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium capitalization transition-colors",
                                    activeTab === tab
                                        ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:text-gray-300"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {activeTab === 'overview' && (
                            <>
                                {/* Personal Details */}
                                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
                                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3>
                                    <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Gender</dt>
                                            <dd className="mt-1 text-sm text-gray-900 dark:text-white capitalize">{employee.user.sex.toLowerCase()}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Blood Type</dt>
                                            <dd className="mt-1 text-sm text-gray-900 dark:text-white">{employee.user.bloodType || '-'}</dd>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</dt>
                                            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                                                {employee.user.address}, {employee.user.city}, {employee.user.state}, {employee.user.country} - {employee.user.pincode}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>

                                {/* Employment Details */}
                                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
                                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Employment Information</h3>
                                    <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Company</dt>
                                            <dd className="mt-1 text-sm text-gray-900 dark:text-white">{employee.company}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Joined Date</dt>
                                            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                                                {new Date(employee.createdAt).toLocaleDateString()}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </>
                        )}

                        {activeTab === 'documents' && (
                            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
                                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Employee Documents</h3>
                                {employee.documents.length === 0 ? (
                                    <p className="text-gray-500">No documents uploaded.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {employee.documents.map((doc) => (
                                            <div key={doc.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/5">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                                        <FileText className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">{doc.fileName}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {new Date(doc.createdAt).toLocaleDateString()} • {(doc.fileSize / 1024).toFixed(1)} KB
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setSelectedDocument({ url: doc.fileUrl, type: doc.fileType })}
                                                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                                                >
                                                    View
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Stats Sidebar */}
                    <div className="space-y-6">
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Ticket Statistics</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between rounded-xl bg-purple-50 p-4 dark:bg-purple-900/10">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-full bg-purple-100 p-2 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                                            <Briefcase className="h-4 w-4" />
                                        </div>
                                        <span className="font-medium text-gray-900 dark:text-white">Total Assigned</span>
                                    </div>
                                    <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                        {Object.values(employee.stats || {}).reduce((a, b) => a + b, 0)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between rounded-xl bg-green-50 p-4 dark:bg-green-900/10">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-full bg-green-100 p-2 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                                            <CheckCircle className="h-4 w-4" />
                                        </div>
                                        <span className="font-medium text-gray-900 dark:text-white">Resolved</span>
                                    </div>
                                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                        {(employee.stats?.['RESOLVED'] || 0) + (employee.stats?.['CLOSED'] || 0)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between rounded-xl bg-amber-50 p-4 dark:bg-amber-900/10">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-full bg-amber-100 p-2 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                                            <Clock className="h-4 w-4" />
                                        </div>
                                        <span className="font-medium text-gray-900 dark:text-white">Pending</span>
                                    </div>
                                    <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                                        {(employee.stats?.['OPEN'] || 0) + (employee.stats?.['IN_PROGRESS'] || 0)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Document Modal */}
            {selectedDocument && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-all" onClick={() => setSelectedDocument(null)}>
                    <div className="relative h-[85vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Document Preview</h3>
                            <button
                                onClick={() => setSelectedDocument(null)}
                                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5 dark:hover:text-gray-300"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="h-[calc(85vh-73px)] w-full bg-gray-50 dark:bg-gray-950">
                            <iframe
                                src={selectedDocument.url}
                                className="h-full w-full border-0"
                                title="Document Preview"
                            />
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
