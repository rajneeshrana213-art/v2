import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/layout/DashboardLayout';
import { useApi } from '@/hooks/useApi';
import { ArrowLeft, Building2, MapPin, Mail, Phone, User, Calendar, Award, BookOpen, GraduationCap, Users, Plus, Trash2, ShieldCheck, X } from 'lucide-react';
import Link from 'next/link';
import { Loader } from '@/components/ui/feedback/Loader';
import { decodeId } from "@/lib/utils/hashId";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'react-hot-toast';


export default function SchoolProfile() {
    const router = useRouter();
    const { id: rawId } = router.query;
    const id = rawId ? decodeId(rawId as string) : undefined;
    const { data: school, loading, get } = useApi<any>();
    const { loading: submitting, post, del } = useApi<any>();
    
    // Modal state
    const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        sex: 'MALE',
        bloodType: 'O+'
    });

    useEffect(() => {
        if (id) {
            get(`/v1/superadmin/schools/${id}`);
        }
    }, [id, get]);

    const handleAddAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await post(`/v1/superadmin/schools/${id}/admins`, formData);
            toast.success('Administrator added successfully');
            setIsAddAdminOpen(false);
            setFormData({ name: '', email: '', phone: '', sex: 'MALE', bloodType: 'O+' });
            get(`/v1/superadmin/schools/${id}`); // Refresh
        } catch (error: any) {
            toast.error(error.message || 'Failed to add administrator');
        }
    };

    const handleDeleteAdmin = async (adminId: string) => {
        if (!confirm('Are you sure you want to remove this administrator?')) return;
        try {
            await del(`/v1/superadmin/schools/${id}/admins`, { adminId });
            toast.success('Administrator removed successfully');
            get(`/v1/superadmin/schools/${id}`); // Refresh
        } catch (error: any) {
            toast.error(error.message || 'Failed to remove administrator');
        }
    };

    if (loading || !school) {
        return (
            <DashboardLayout role="superadmin">
                <div className="min-h-screen flex justify-center items-center">
                    <Loader size="lg" />
                </div>
            </DashboardLayout>
        );
    }

    // Fallback for missing admin user
    const admin = school.user || {};

    return (
        <DashboardLayout role="superadmin">
            <div className="space-y-6 animate-in fade-in duration-500">

                {/* Navigation */}
                <Link
                    href="/dashboard/superadmin/schools"
                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Schools
                </Link>

                {/* Header Section */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden">
                    {/* Background Decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                    <div className="flex flex-col md:flex-row gap-6 relative z-10">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-gray-700 shadow-lg flex items-center justify-center overflow-hidden shrink-0">
                            {school.schoolLogo ? (
                                <img src={school.schoolLogo} alt={school.schoolName} className="w-full h-full object-cover" />
                            ) : (
                                <Building2 className="w-12 h-12 text-gray-400" />
                            )}
                        </div>

                        <div className="flex-1 space-y-2">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">{school.schoolName}</h1>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${school.isActive
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
                                            : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'}`}>
                                            {school.isActive ? 'Active' : 'Disabled'}
                                        </span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            Joined {new Date(school.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-300">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    {school.user?.city || school.user?.state 
                                        ? `${school.user?.city || ''}${school.user?.city && school.user?.state ? ', ' : ''}${school.user?.state || ''}`
                                        : 'Location not specified'
                                    } · {school.schoolCode || 'No Code'}
                                </div>
                            </div>
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
                                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg">
                                    {admin.profilePic ? (
                                        <img src={admin.profilePic} alt={admin.name} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        admin.name?.charAt(0) || 'A'
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">{admin.name || 'N/A'}</p>
                                    <p className="text-xs text-gray-500">School Administrator</p>
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors">
                                    <Mail className="w-4 h-4 shrink-0" />
                                    <span className="truncate">{admin.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors">
                                    <Phone className="w-4 h-4 shrink-0" />
                                    <span>{admin.phone}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors">
                                    <MapPin className="w-4 h-4 shrink-0" />
                                    <span className="line-clamp-2">{admin.address || 'No address provided'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Admins section */}
                    <div className="lg:col-span-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm h-fit">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4" />
                                Extra Admins
                            </h3>
                            <button 
                                onClick={() => setIsAddAdminOpen(true)}
                                className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 transition-colors"
                                title="Add Extra Admin"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        {school.users && school.users.filter((u: any) => u.id !== school.userId).length > 0 ? (
                            <div className="space-y-4">
                                {school.users.filter((u: any) => u.id !== school.userId).map((extraAdmin: any) => (
                                    <div key={extraAdmin.id} className="group relative flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm font-medium">
                                            {extraAdmin.profilePic ? (
                                                <img src={extraAdmin.profilePic} alt={extraAdmin.name} className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                extraAdmin.name?.charAt(0) || 'A'
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{extraAdmin.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{extraAdmin.email}</p>
                                        </div>
                                        <button 
                                            onClick={() => handleDeleteAdmin(extraAdmin.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl">
                                <p className="text-xs text-gray-500 italic">No extra admins assigned</p>
                            </div>
                        )}
                    </div>

                    {/* Stats & Details Grid */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Key Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <StatCard
                                label="Total Students"
                                value={school._count?.students || 0}
                                icon={GraduationCap}
                                color="text-blue-600 dark:text-blue-400"
                                bg="bg-blue-50 dark:bg-blue-900/10"
                            />
                            <StatCard
                                label="Total Teachers"
                                value={school._count?.teachers || 0}
                                icon={Users}
                                color="text-violet-600 dark:text-violet-400"
                                bg="bg-violet-50 dark:bg-violet-900/10"
                            />
                            <StatCard
                                label="Classes"
                                value={school._count?.Class || 0}
                                icon={BookOpen}
                                color="text-emerald-600 dark:text-emerald-400"
                                bg="bg-emerald-50 dark:bg-emerald-900/10"
                            />
                            <StatCard
                                label="Plan"
                                value={school.subscription?.[0]?.plan?.name || "Free"}
                                icon={Award}
                                color="text-amber-600 dark:text-amber-400"
                                bg="bg-amber-50 dark:bg-amber-900/10"
                            />
                        </div>

                        {/* Subscription & Billing — real-time expiry-aware */}
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Subscription &amp; Billing</h3>
                            {school.subscription?.[0] ? (() => {
                                const sub = school.subscription[0];
                                const now = new Date();
                                const endDate = sub.endDate ? new Date(sub.endDate) : null;
                                const isExpired = endDate ? now > endDate : false;
                                const daysLeft = endDate
                                    ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                                    : null;

                                return (
                                    <div className="flex flex-col gap-3">
                                        {/* Expired banner */}
                                        {isExpired && (
                                            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm dark:border-red-500/30 dark:bg-red-950/20">
                                                <span className="mt-0.5 text-red-500">⚠</span>
                                                <div>
                                                    <p className="font-semibold text-red-700 dark:text-red-300">
                                                        Subscription expired on {endDate?.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </p>
                                                    <p className="mt-0.5 text-xs text-red-600/80 dark:text-red-300/70">
                                                        This school has lost access to paid modules. Assign a new plan to restore access.
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        <div className={`flex justify-between items-center p-4 rounded-xl border ${
                                            isExpired
                                                ? 'bg-red-50/60 border-red-200 dark:bg-red-950/20 dark:border-red-500/30'
                                                : daysLeft !== null && daysLeft <= 7
                                                    ? 'bg-amber-50/60 border-amber-200 dark:bg-amber-950/20 dark:border-amber-500/30'
                                                    : 'bg-gray-50 border-gray-100 dark:bg-gray-800/50 dark:border-gray-800'
                                        }`}>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Current Plan</p>
                                                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{sub.plan.name}</p>
                                                {isExpired ? (
                                                    <span className="inline-flex items-center gap-1 mt-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-700 dark:bg-red-500/20 dark:text-red-300">
                                                        ✕ Expired
                                                    </span>
                                                ) : daysLeft !== null && daysLeft <= 7 ? (
                                                    <span className="inline-flex items-center gap-1 mt-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                                                        ⚠ Expiring Soon
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 mt-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                                                        ✓ Active
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-gray-500">
                                                    {isExpired ? 'Expired On' : 'Renews On'}
                                                </p>
                                                <p className={`text-sm font-bold ${isExpired ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
                                                    {endDate ? endDate.toLocaleDateString() : 'N/A'}
                                                </p>
                                                {!isExpired && daysLeft !== null && (
                                                    <p className={`text-xs mt-0.5 ${daysLeft <= 7 ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-gray-400'}`}>
                                                        {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })() : (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    <p>No active subscription found.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {/* Add Admin Modal */}
            <Dialog open={isAddAdminOpen} onOpenChange={setIsAddAdminOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Extra Administrator</DialogTitle>
                    </DialogHeader>
                    
                    <form onSubmit={handleAddAdmin} className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                            <input 
                                required
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                                placeholder="Admin Name"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                            <input 
                                required
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                                placeholder="admin@school.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                            <input 
                                required
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                                placeholder="+1 (555) 000-0000"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
                                <select 
                                    value={formData.sex}
                                    onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                                >
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                    <option value="OTHERS">Others</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Blood Type</label>
                                <input 
                                    type="text"
                                    value={formData.bloodType}
                                    onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                                    placeholder="O+"
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <button 
                                type="button" 
                                onClick={() => setIsAddAdminOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                disabled={submitting}
                                className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {submitting ? 'Adding...' : 'Add Administrator'}
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
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
