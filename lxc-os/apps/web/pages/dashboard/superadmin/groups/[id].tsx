import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/layout/DashboardLayout';
import { useApi } from '@/hooks/useApi';
import { decodeId, encodeId } from '@/lib/utils/hashId';
import {
    Building, Building2, ArrowLeft, User, School, Mail, Phone, MapPin, Users, GraduationCap, UserCheck, CreditCard,
    Calendar, Edit, Power, Trash2, ExternalLink, AlertTriangle, X, Loader2, Award, BookOpen
} from 'lucide-react';
import { Loader } from '@/components/ui/feedback/Loader';

interface GroupDetail {
    id: string;
    name: string;
    logo: string | null;
    isActive: boolean;
    createdAt: string;
    owner: {
        id: string;
        name: string;
        email: string;
        phone: string;
        profilePic: string | null;
        createdAt: string;
    };
    schools: Array<{
        id: string;
        schoolName: string;
        schoolLogo: string | null;
        isActive: boolean;
        createdAt: string;
    }>;
    _count: {
        schools: number;
    };
    address: string;
    counts: {
        totalStudents: number;
        totalTeachers: number;
        totalParents: number;
        totalUsers: number;
    };
    subscription: {
        planName: string;
        status: string;
        startDate: string;
        endDate: string;
        userLimit: number | null;
        branchLimit: number | null;
    } | null;
}

export default function GroupDetail() {
    const router = useRouter();
    const { id: encodedId } = router.query;
    const { loading, get, patch, del } = useApi<GroupDetail>();
    const [group, setGroup] = useState<GroupDetail | null>(null);
    const [editLoading, setEditLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const groupId = encodedId ? decodeId(encodedId as string) : null;

    useEffect(() => {
        if (!groupId) return;
        get(`/v1/superadmin/groups/${groupId}`).then((data) => {
            if (data) setGroup(data);
        });
    }, [groupId]);

    const handleEdit = async () => {
        if (!group) return;
        setEditLoading(true);
        await router.push(`/dashboard/superadmin/groups/create?edit=${encodeId(group.id)}`);
        setEditLoading(false);
    };

    const handleToggleStatus = async () => {
        if (!group || !groupId) return;
        const action = group.isActive ? 'disable' : 'enable';
        if (!confirm(`Are you sure you want to ${action} ${group.name}?`)) return;
        const result = await patch(`/v1/superadmin/groups/${groupId}`, { isActive: !group.isActive }, {
            successMessage: `Organization ${action}d successfully`,
        });
        if (result) setGroup((prev) => prev ? { ...prev, isActive: !prev.isActive } : prev);
    };

    const handleDelete = async () => {
        if (!group || !groupId) return;
        setDeleteLoading(true);
        const result = await del(`/v1/superadmin/groups/${groupId}`, undefined, {
            successMessage: 'Organization deleted successfully',
        });
        setDeleteLoading(false);
        if (result) router.push('/dashboard/superadmin/groups');
        else setShowDeleteModal(false);
    };

    return (
        <DashboardLayout role="superadmin">
            {/* Delete Confirmation Modal */}
            {showDeleteModal && group && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => !deleteLoading && setShowDeleteModal(false)}
                    />
                    <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md p-6 border border-gray-200 dark:border-gray-800">
                        <button
                            onClick={() => setShowDeleteModal(false)}
                            disabled={deleteLoading}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-40"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                                <AlertTriangle className="w-7 h-7 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Delete Organization</h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Are you sure you want to delete <span className="font-medium text-gray-900 dark:text-gray-100">{group.name}</span>?
                                    This will affect all linked schools and cannot be undone.
                                </p>
                            </div>
                            <div className="flex gap-3 w-full mt-2">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={deleteLoading}
                                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-40"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleteLoading}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-70"
                                >
                                    {deleteLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Deleting…
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-6 animate-in fade-in duration-500">
                {/* Navigation */}
                <Link
                    href="/dashboard/superadmin/groups"
                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Organizations
                </Link>

                {loading || !group ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader size="lg" />
                    </div>
                ) : (
                    <>
                        {/* Header Section */}
                        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden">
                            {/* Background Decoration */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                            <div className="flex flex-col md:flex-row gap-6 relative z-10 items-start md:items-center justify-between">
                                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-gray-700 shadow-lg flex items-center justify-center overflow-hidden shrink-0">
                                        {group.logo ? (
                                            <img src={group.logo} alt={group.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Building2 className="w-12 h-12 text-gray-400" />
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">{group.name}</h1>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${group.isActive
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
                                                : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'}`}>
                                                {group.isActive ? 'Active' : 'Disabled'}
                                            </span>
                                            <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                Created {new Date(group.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleToggleStatus}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${group.isActive
                                            ? 'text-amber-600 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/40'
                                            : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40'
                                            }`}
                                    >
                                        <Power className="w-4 h-4" />
                                        {group.isActive ? 'Disable' : 'Enable'}
                                    </button>
                                    <button
                                        onClick={handleEdit}
                                        disabled={editLoading}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-100/40 transition-colors disabled:opacity-70"
                                    >
                                        {editLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit className="w-4 h-4" />}
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteModal(true)}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* Admin Info Card */}
                            <div className="lg:col-span-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm h-fit">
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Administrator
                                </h3>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg overflow-hidden shrink-0">
                                            {group.owner.profilePic ? (
                                                <img src={group.owner.profilePic} alt={group.owner.name} className="w-full h-full object-cover" />
                                            ) : (
                                                group.owner.name?.charAt(0) || 'A'
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-gray-100">{group.owner.name || 'N/A'}</p>
                                            <p className="text-xs text-gray-500">Organization Administrator</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors">
                                            <Mail className="w-4 h-4 shrink-0" />
                                            <span className="truncate">{group.owner.email}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors">
                                            <Phone className="w-4 h-4 shrink-0" />
                                            <span>{group.owner.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors">
                                            <MapPin className="w-4 h-4 shrink-0" />
                                            <span className="line-clamp-2">{group.address || 'No address provided'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats & Details Grid */}
                            <div className="lg:col-span-2 space-y-6">

                                {/* Key Stats */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <StatCard
                                        label="Branches"
                                        value={group._count.schools}
                                        icon={School}
                                        color="text-indigo-600 dark:text-indigo-400"
                                        bg="bg-indigo-50 dark:bg-indigo-900/10"
                                    />
                                    <StatCard
                                        label="Students"
                                        value={group.counts.totalStudents}
                                        icon={GraduationCap}
                                        color="text-emerald-600 dark:text-emerald-400"
                                        bg="bg-emerald-50 dark:bg-emerald-900/10"
                                    />
                                    <StatCard
                                        label="Teachers"
                                        value={group.counts.totalTeachers}
                                        icon={Users}
                                        color="text-blue-600 dark:text-blue-400"
                                        bg="bg-blue-50 dark:bg-blue-900/10"
                                    />
                                    <StatCard
                                        label="Parents"
                                        value={group.counts.totalParents}
                                        icon={UserCheck}
                                        color="text-amber-600 dark:text-amber-400"
                                        bg="bg-amber-50 dark:bg-amber-900/10"
                                    />
                                </div>

                                {/* Subscription & Billing */}
                                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                            <CreditCard className="w-5 h-5 text-indigo-600" />
                                            Subscription & Billing
                                        </h3>
                                        {group.subscription && (
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${group.subscription.status === 'ACTIVE'
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
                                                : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
                                                }`}>
                                                {group.subscription.status}
                                            </span>
                                        )}
                                    </div>

                                    {group.subscription ? (
                                        <div className="space-y-6">
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 gap-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Current Plan</p>
                                                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{group.subscription.planName}</p>
                                                </div>
                                                <div className="sm:text-right">
                                                    <p className="text-sm font-medium text-gray-500">Valid Until</p>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                                        {new Date(group.subscription.endDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                                                    <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">User Limit</p>
                                                    <div className="flex items-end justify-between">
                                                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                                            {group.subscription.userLimit ? `${group.counts.totalUsers} / ${group.subscription.userLimit}` : 'Unlimited'}
                                                        </p>
                                                        <p className="text-xs text-gray-400 mb-1">Total Users</p>
                                                    </div>
                                                    {group.subscription.userLimit && (
                                                        <div className="mt-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                                                            <div 
                                                                className="bg-indigo-600 h-full rounded-full" 
                                                                style={{ width: `${Math.min((group.counts.totalUsers / group.subscription.userLimit) * 100, 100)}%` }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                                                    <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">Branch Limit</p>
                                                    <div className="flex items-end justify-between">
                                                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                                            {group.subscription.branchLimit ? `${group._count.schools} / ${group.subscription.branchLimit}` : 'Unlimited'}
                                                        </p>
                                                        <p className="text-xs text-gray-400 mb-1">Total Branches</p>
                                                    </div>
                                                    {group.subscription.branchLimit && (
                                                        <div className="mt-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                                                            <div 
                                                                className="bg-indigo-600 h-full rounded-full" 
                                                                style={{ width: `${Math.min((group._count.schools / group.subscription.branchLimit) * 100, 100)}%` }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                            <p>No active subscription found for this organization.</p>
                                            <button className="mt-3 text-sm font-semibold text-indigo-600 hover:text-indigo-700">Assign Subscription</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Branches */}
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Branches <span className="text-gray-400 font-normal text-sm">({group?.schools.length})</span>
                            </h2>
                            {group.schools.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-full mb-3">
                                        <School className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">No branches linked to this organization yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {group.schools.map((school) => (
                                        <Link
                                            key={school.id}
                                            href={`/dashboard/superadmin/schools/${encodeId(school.id)}`}
                                            className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-indigo-500/50 hover:shadow-sm transition-all"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden border border-gray-200 dark:border-gray-700">
                                                {school.schoolLogo ? (
                                                    <img src={school.schoolLogo} alt={school.schoolName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <School className="w-5 h-5 text-gray-400" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{school.schoolName}</p>
                                                <span className={`text-[10px] font-bold uppercase ${school.isActive ? 'text-emerald-600' : 'text-red-500'}`}>
                                                    {school.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            <ExternalLink className="w-4 h-4 text-gray-400 shrink-0" />
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}

// Helper Components
const StatCard = ({ label, value, icon: Icon, color, bg }: any) => (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center text-center gap-2 hover:shadow-md transition-shadow">
        <div className={`p-2.5 rounded-full ${bg} ${color}`}>
            <Icon className="w-5 h-5" />
        </div>
        <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</div>
        </div>
    </div>
);
