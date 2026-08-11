import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/layout/DashboardLayout';
import {
    Plus, Edit, Trash2, Tag, Calendar, Percent, DollarSign, Check, X, Search, Filter, Layers, Copy, Hash, Sparkles, ChevronLeft, ChevronRight
} from 'lucide-react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { getAccessToken } from '@/lib/api/client';
import { Loader } from "@/components/ui/feedback/Loader";
import { formatISTDateKey, getISTDateString } from "@/lib/utils/date-utils";

interface Plan {
    id: string;
    name: string;
}

interface Coupon {
    id: string;
    code: string;
    description?: string;
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    discountValue: number;
    scope: 'GLOBAL' | 'SPECIFIC_PLAN' | 'SPECIFIC_FEATURE';
    planId?: string | null;
    featureKey?: string | null;
    plan?: { name: string };
    startDate: string;
    expiryDate: string;
    maxUsage?: number | null;
    usedCount: number;
    isActive: boolean;
    createdAt: string;
}

interface Stats {
    total: number;
    active: number;
    redeemed: number;
}

export default function CouponCodesPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [stats, setStats] = useState<Stats>({ total: 0, active: 0, redeemed: 0 });
    const [loading, setLoading] = useState(true);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentCoupon, setCurrentCoupon] = useState<Partial<Coupon>>({
        scope: 'GLOBAL',
        discountType: 'PERCENTAGE',
        isActive: true
    });

    // Delete Confirmation Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [couponToDelete, setCouponToDelete] = useState<string | null>(null);

    // State for Dynamic Features Catalog
    const [featuresList, setFeaturesList] = useState<{ key: string; name: string }[]>([]);

    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCoupons();
        }, 300);
        return () => clearTimeout(timer);
    }, [activeTab, page, searchTerm]);

    useEffect(() => {
        fetchPlans();
        fetchFeaturesCatalog();
    }, []);

    const fetchFeaturesCatalog = async () => {
        try {
            const res = await fetch('/api/v1/superadmin/subscription-control/global-settings', {
                headers: {
                    'Authorization': `Bearer ${getAccessToken()}`
                }
            });
            const data = await res.json();
            if (res.ok && Array.isArray(data)) {
                const catalogSetting = data.find((s: any) => s.key === "FEATURE_CATALOG");
                if (catalogSetting && catalogSetting.value) {
                    try {
                        const parsed = JSON.parse(catalogSetting.value);
                        if (Array.isArray(parsed)) {
                            setFeaturesList(parsed.map(f => ({ key: f.key, name: f.name })));
                            return;
                        }
                    } catch (e) {
                        console.error("Failed to parse FEATURE_CATALOG", e);
                    }
                }
            }
            // Fallback to static list if fetch fails or catalog is broken
            setFeaturesList([
                { key: 'temp people', name: 'People' },
                { key: 'temp academics', name: 'Academics' },
                { key: 'temp operations', name: 'Operations' },
                { key: 'temp communication', name: 'Communication' },
                { key: 'temp management', name: 'Management' },
                { key: 'temp reports_documents', name: 'Reports & Documents' }
            ]);
        } catch (error) {
            console.error("Failed to fetch features catalog", error);
            // Fallback
            setFeaturesList([
                { key: 'temp people', name: 'People' },
                { key: 'temp academics', name: 'Academics' },
                { key: 'temp operations', name: 'Operations' },
                { key: 'temp communication', name: 'Communication' },
                { key: 'temp management', name: 'Management' },
                { key: 'temp reports_documents', name: 'Reports & Documents' }
            ]);
        }
    };

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                isActive: (activeTab === 'active').toString()
            });
            if (searchTerm) params.append('search', searchTerm);

            const res = await fetch(`/api/v1/superadmin/coupons?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${getAccessToken()}`
                }
            });
            const data = await res.json();
            if (res.ok) {
                setCoupons(data.coupons);
                setStats(data.stats);
                setPagination(data.pagination);
            } else {
                toast.error('Failed to fetch coupons');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load coupons');
        } finally {
            setLoading(false);
        }
    };

    const fetchPlans = async () => {
        try {
            const res = await fetch('/api/v1/superadmin/membership-plans', {
                headers: {
                    'Authorization': `Bearer ${getAccessToken()}`
                }
            });
            const data = await res.json();
            if (res.ok) {
                setPlans(data.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch plans", error);
        }
    };

    const confirmDelete = (id: string) => {
        setCouponToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!couponToDelete) return;

        const id = toast.loading('Deleting coupon...');
        try {
            const res = await fetch(`/api/v1/superadmin/coupons/${couponToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${getAccessToken()}`
                }
            });

            if (!res.ok) throw new Error('Failed to delete');

            toast.update(id, {
                render: 'Coupon deleted successfully',
                type: 'success',
                isLoading: false,
                autoClose: 3000
            });
            fetchCoupons();
            setIsDeleteModalOpen(false);
            setCouponToDelete(null);
        } catch (error) {
            toast.update(id, {
                render: 'Failed to delete coupon',
                type: 'error',
                isLoading: false,
                autoClose: 3000
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!currentCoupon.code || !currentCoupon.description || !currentCoupon.expiryDate || !currentCoupon.discountValue) {
            toast.error('Please fill in all required fields');
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (new Date(currentCoupon.expiryDate) < today) {
            toast.error('Expiry date cannot be in the past');
            return;
        }

        if (currentCoupon.discountType === 'PERCENTAGE' && Number(currentCoupon.discountValue) > 100) {
            toast.error('Percentage discount cannot exceed 100%');
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading(isEditMode ? 'Updating coupon...' : 'Creating coupon...');

        const payload: any = {
            code: currentCoupon.code,
            description: currentCoupon.description,
            discountType: currentCoupon.discountType,
            discountValue: Number(currentCoupon.discountValue),
            scope: currentCoupon.scope,
            planId: currentCoupon.scope === 'SPECIFIC_PLAN' ? currentCoupon.planId : null,
            featureKey: currentCoupon.scope === 'SPECIFIC_FEATURE' ? currentCoupon.featureKey : null,
            expiryDate: currentCoupon.expiryDate,
            maxUsage: currentCoupon.maxUsage ? Number(currentCoupon.maxUsage) : null,
            isActive: currentCoupon.isActive
        };

        const url = isEditMode
            ? `/api/v1/superadmin/coupons/${currentCoupon.id}`
            : '/api/v1/superadmin/coupons';

        const method = isEditMode ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAccessToken()}`
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to save');

            toast.update(toastId, {
                render: isEditMode ? 'Coupon updated successfully' : 'Coupon created successfully',
                type: 'success',
                isLoading: false,
                autoClose: 3000
            });

            setIsModalOpen(false);
            fetchCoupons();
        } catch (error: any) {
            toast.update(toastId, {
                render: error.message,
                type: 'error',
                isLoading: false,
                autoClose: 3000
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const openCreateModal = () => {
        setIsEditMode(false);
        setCurrentCoupon({
            scope: 'GLOBAL',
            discountType: 'PERCENTAGE',
            isActive: true,
            maxUsage: 100,
            // Default expiry 30 days from now
            expiryDate: formatISTDateKey(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
        });
        setIsModalOpen(true);
    };

    const openEditModal = (coupon: Coupon) => {
        setIsEditMode(true);
        setCurrentCoupon({
            ...coupon,
            expiryDate: formatISTDateKey(new Date(coupon.expiryDate)), // Stable input date in IST
        });
        setIsModalOpen(true);
    };

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success('Code copied to clipboard');
    };

    return (
        <DashboardLayout role="superadmin">
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                            Coupon Manager
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Create and manage discount codes for membership plans.
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative flex-1 max-w-md w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by code or description..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none"
                        />
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 transform hover:-translate-y-0.5 font-medium"
                    >
                        <Plus size={20} />
                        Create Coupon
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatsCard
                        title="Total Coupons"
                        value={stats.total}
                        icon={<Tag className="text-blue-500" />}
                        bg="bg-blue-50 dark:bg-blue-900/10"
                        border="border-blue-100 dark:border-blue-800"
                    />
                    <StatsCard
                        title="Active Coupons"
                        value={stats.active}
                        icon={<Check className="text-green-500" />}
                        bg="bg-green-50 dark:bg-green-900/10"
                        border="border-green-100 dark:border-green-800"
                    />
                    <StatsCard
                        title="Total Redemptions"
                        value={stats.redeemed}
                        icon={<Hash className="text-purple-500" />}
                        bg="bg-purple-50 dark:bg-purple-900/10"
                        border="border-purple-100 dark:border-purple-800"
                    />
                </div>

                {/* Coupons List */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {activeTab === 'active' ? 'Active Coupons' : 'Inactive & Expired Coupons'}
                        </h3>

                        {/* Tabs Navigation */}
                        <div className="flex bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl w-full md:w-auto">
                            <button
                                onClick={() => {
                                    setActiveTab('active');
                                    setPage(1);
                                }}
                                className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'active'
                                    ? 'bg-white dark:bg-gray-800 text-purple-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                            >
                                Active ({stats.active})
                            </button>
                            <button
                                onClick={() => {
                                    setActiveTab('inactive');
                                    setPage(1);
                                }}
                                className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'inactive'
                                    ? 'bg-white dark:bg-gray-800 text-purple-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                            >
                                Inactive ({stats.total - stats.active})
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader size="lg" />
                        </div>
                    ) : coupons.filter(c => activeTab === 'active' ? c.isActive : !c.isActive).length === 0 ? (
                        <div className="text-center py-20">
                            <Tag size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                {activeTab === 'active' ? 'No Active Coupons' : 'No Inactive Coupons'}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-2">
                                {activeTab === 'active' ? 'Try creating a new coupon.' : 'Expired or deactivated coupons will appear here.'}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                                            <th className="p-4 font-semibold">Code</th>
                                            <th className="p-4 font-semibold">Discount</th>
                                            <th className="p-4 font-semibold">Scope</th>
                                            <th className="p-4 font-semibold">Usage</th>
                                            <th className="p-4 font-semibold">Expiry</th>
                                            <th className="p-4 font-semibold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {coupons.map((coupon) => (
                                            <tr
                                                key={coupon.id}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group"
                                            >
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="h-10 w-10 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400 cursor-pointer hover:bg-pink-200 dark:hover:bg-pink-900/50 transition-colors"
                                                            onClick={() => copyToClipboard(coupon.code)}
                                                            title="Click to copy"
                                                        >
                                                            <Copy size={16} />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                                {coupon.code}
                                                                {!coupon.isActive && (
                                                                    <span className="px-2 py-0.5 rounded text-[10px] bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                                                                        Inactive
                                                                    </span>
                                                                )}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                                                                {coupon.description || 'No description'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                        {coupon.discountType === 'PERCENTAGE' ? (
                                                            <>{coupon.discountValue}%</>
                                                        ) : (
                                                            <>₹{coupon.discountValue}</>
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            {coupon.scope === 'GLOBAL' ? 'Global' : coupon.scope === 'SPECIFIC_PLAN' ? 'Specific Plan' : 'Specific Feature'}
                                                        </span>
                                                        {coupon.scope === 'SPECIFIC_PLAN' && coupon.plan && (
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                {coupon.plan.name}
                                                            </span>
                                                        )}
                                                        {coupon.scope === 'SPECIFIC_FEATURE' && coupon.featureKey && (
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                {featuresList.find(f => f.key === coupon.featureKey)?.name || coupon.featureKey}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-full max-w-[80px] h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-blue-500 rounded-full"
                                                                style={{
                                                                    width: `${Math.min(((coupon.usedCount || 0) / (coupon.maxUsage || 1)) * 100, 100)}%`
                                                                }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                            {coupon.usedCount} / {coupon.maxUsage ? coupon.maxUsage : '∞'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                                                    {format(new Date(coupon.expiryDate), 'MMM dd, yyyy')}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => openEditModal(coupon)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => confirmDelete(coupon.id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Page <span className="font-semibold text-gray-900 dark:text-white">{page}</span> of {pagination.totalPages}
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <ChevronLeft size={20} className="text-gray-600 dark:text-gray-400" />
                                        </button>
                                        <button
                                            onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                            disabled={page === pagination.totalPages}
                                            className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <ChevronRight size={20} className="text-gray-600 dark:text-gray-400" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 dark:border-gray-700 transform transition-all scale-100">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {isEditMode ? 'Edit Coupon' : 'Create New Coupon'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Coupon Code</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={currentCoupon.code || ''}
                                        onChange={(e) => setCurrentCoupon({ ...currentCoupon, code: e.target.value.toUpperCase() })}
                                        className="w-full px-4 py-2 pl-10 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                        placeholder="e.g. SUMMER2024"
                                        required
                                    />
                                    <Tag size={18} className="absolute left-3 top-2.5 text-gray-400" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Discount Type</label>
                                    <select
                                        value={currentCoupon.discountType}
                                        onChange={(e) => setCurrentCoupon({ ...currentCoupon, discountType: e.target.value as any })}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                                    >
                                        <option value="PERCENTAGE">Percentage (%)</option>
                                        <option value="FIXED_AMOUNT">Fixed Amount (₹)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Value</label>
                                    <input
                                        type="number"
                                        value={currentCoupon.discountValue || ''}
                                        onChange={(e) => setCurrentCoupon({ ...currentCoupon, discountValue: Number(e.target.value) })}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                                        placeholder="e.g. 20"
                                        required
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Applicability Scope</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <label className={`cursor-pointer border-2 rounded-xl p-3 flex items-center justify-center gap-2 transition-all ${currentCoupon.scope === 'GLOBAL' ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300' : 'border-gray-200 dark:border-gray-700 hover:border-purple-200'}`}>
                                        <input
                                            type="radio"
                                            name="scope"
                                            className="hidden"
                                            checked={currentCoupon.scope === 'GLOBAL'}
                                            onChange={() => setCurrentCoupon({ ...currentCoupon, scope: 'GLOBAL' })}
                                        />
                                        <Layers size={18} className={currentCoupon.scope === 'GLOBAL' ? 'text-purple-600' : 'text-gray-400'} />
                                        <span className="font-semibold text-sm">Global</span>
                                    </label>
                                    <label className={`cursor-pointer border-2 rounded-xl p-3 flex items-center justify-center gap-2 transition-all ${currentCoupon.scope === 'SPECIFIC_PLAN' ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300' : 'border-gray-200 dark:border-gray-700 hover:border-purple-200'}`}>
                                        <input
                                            type="radio"
                                            name="scope"
                                            className="hidden"
                                            checked={currentCoupon.scope === 'SPECIFIC_PLAN'}
                                            onChange={() => setCurrentCoupon({ ...currentCoupon, scope: 'SPECIFIC_PLAN' })}
                                        />
                                        <Check size={18} className={currentCoupon.scope === 'SPECIFIC_PLAN' ? 'text-purple-600' : 'text-gray-400'} />
                                        <span className="font-semibold text-sm">Specific Plan</span>
                                    </label>
                                    <label className={`cursor-pointer border-2 rounded-xl p-3 flex items-center justify-center gap-2 transition-all ${currentCoupon.scope === 'SPECIFIC_FEATURE' ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300' : 'border-gray-200 dark:border-gray-700 hover:border-purple-200'}`}>
                                        <input
                                            type="radio"
                                            name="scope"
                                            className="hidden"
                                            checked={currentCoupon.scope === 'SPECIFIC_FEATURE'}
                                            onChange={() => setCurrentCoupon({ ...currentCoupon, scope: 'SPECIFIC_FEATURE' })}
                                        />
                                        <Sparkles size={18} className={currentCoupon.scope === 'SPECIFIC_FEATURE' ? 'text-purple-600' : 'text-gray-400'} />
                                        <span className="font-semibold text-sm">Specific Feature</span>
                                    </label>
                                </div>
                            </div>

                            {currentCoupon.scope === 'SPECIFIC_PLAN' && (
                                <div className="space-y-2 animate-fadeIn">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Plan</label>
                                    <select
                                        value={currentCoupon.planId || ''}
                                        onChange={(e) => setCurrentCoupon({ ...currentCoupon, planId: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                                        required
                                    >
                                        <option value="">Select a plan...</option>
                                        {plans.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {currentCoupon.scope === 'SPECIFIC_FEATURE' && (
                                <div className="space-y-2 animate-fadeIn">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Feature</label>
                                    <select
                                        value={currentCoupon.featureKey || ''}
                                        onChange={(e) => setCurrentCoupon({ ...currentCoupon, featureKey: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                                        required
                                    >
                                        <option value="">Select a feature...</option>
                                        {featuresList.map(f => (
                                            <option key={f.key} value={f.key}>{f.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Expiry Date</label>
                                    <input
                                        type="date"
                                        value={currentCoupon.expiryDate || ''}
                                        min={getISTDateString()}
                                        onChange={(e) => setCurrentCoupon({ ...currentCoupon, expiryDate: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Max Usage Limit</label>
                                    <input
                                        type="number"
                                        value={currentCoupon.maxUsage || ''}
                                        onChange={(e) => setCurrentCoupon({ ...currentCoupon, maxUsage: Number(e.target.value) })}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                                        placeholder="No limit"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                                <textarea
                                    value={currentCoupon.description || ''}
                                    onChange={(e) => setCurrentCoupon({ ...currentCoupon, description: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none resize-none h-20"
                                    placeholder="Brief description of the offer..."
                                    required
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/20 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader size="sm" variant="white" />
                                            {isEditMode ? 'Saving...' : 'Creating...'}
                                        </>
                                    ) : (
                                        isEditMode ? 'Save Changes' : 'Create Coupon'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-100 dark:border-gray-700 transform transition-all scale-100 p-6 text-center">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Coupon?</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            Are you sure you want to delete this coupon? This action cannot be undone and will affect all future transactions.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setCouponToDelete(null);
                                }}
                                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

function StatsCard({ title, value, icon, bg, border }: { title: string, value: number, icon: React.ReactNode, bg: string, border: string }) {
    return (
        <div className={`p-6 rounded-2xl ${bg} border ${border} flex items-center gap-4 transition-transform hover:scale-[1.02]`}>
            <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
            </div>
        </div>
    );
}
