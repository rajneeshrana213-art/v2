import React, { useState, useEffect } from 'react';
import { encodeId } from "@/lib/utils/hashId";
// import DashboardLayout from '@/components/layout/DashboardLayout';
import { useRouter } from 'next/router';
import {
    Plus, Edit, Trash2, Users, CreditCard, Calendar, Check, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/dashboard/layout/DashboardLayout';
import { getAccessToken } from '@/lib/api/client';
import { Loader } from "@/components/ui/feedback/Loader";
import { ConfirmModal } from '@/components/ui/modals/ConfirmModal';


interface Plan {
    id: string;
    name: string;
    price: number;
    discountedPrice?: number;
    durationDays: number;
    userLimit: number;
    branchLimit: number;
    planType: 'PLATFORM' | 'RIT';
    createdAt: string;
}

interface PlansResponse {
    data: Plan[];
    pagination: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
        limit: number;
    };
}


export default function MembershipPlansPage() {
    const router = useRouter();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [activeTab, setActiveTab] = useState<'PLATFORM' | 'RIT'>('PLATFORM');
    const [ritCategory, setRitCategory] = useState<'school' | 'college' | 'competitive'>('school');
    const [pagination, setPagination] = useState<PlansResponse['pagination'] | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [planToDelete, setPlanToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchPlans(page, activeTab, ritCategory);
    }, [page, activeTab, ritCategory]);

    const fetchPlans = async (currentPage: number, type: 'PLATFORM' | 'RIT', category?: string) => {
        setLoading(true);
        try {
            let url = `/api/v1/superadmin/membership-plans?page=${currentPage}&limit=10&planType=${type}`;
            if (type === 'RIT' && category) {
                url += `&category=${category}`;
            }
            const res = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${getAccessToken()}`
                }
            });
            const result: PlansResponse = await res.json();
            if (res.ok) {
                setPlans(result.data);
                setPagination(result.pagination);
            } else {
                toast.error('Failed to fetch plans');
            }

        } catch (error) {
            console.error(error);
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (type: 'PLATFORM' | 'RIT') => {
        setActiveTab(type);
        setPage(1);
    };

    const handleDelete = (id: string) => {
        setPlanToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!planToDelete) return;
        setIsDeleting(true);

        try {
            const res = await fetch(`/api/v1/superadmin/membership-plans/${planToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${getAccessToken()}`
                }
            });
            if (res.ok) {
                toast.success('Plan deleted successfully');
                fetchPlans(page, activeTab);
            } else {
                toast.error('Failed to delete plan');
            }
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong');
        } finally {
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
            setPlanToDelete(null);
        }
    };

    return (
        <DashboardLayout role="superadmin">
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                            Membership Plans
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Manage subscription plans and user limits
                        </p>
                    </div>
                    <button
                        onClick={() => router.push(`/dashboard/superadmin/membership-plans/create?type=${activeTab}`)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                        <Plus size={20} />
                        Create New Plan
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 gap-6">
                    <button
                        onClick={() => handleTabChange('PLATFORM')}
                        className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-all duration-200 ${
                            activeTab === 'PLATFORM'
                                ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400 font-semibold'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                    >
                        <CreditCard size={18} />
                        Platform SaaS Plans
                    </button>
                    <button
                        onClick={() => handleTabChange('RIT')}
                        className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-all duration-200 ${
                            activeTab === 'RIT'
                                ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400 font-semibold'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                    >
                        <Users size={18} />
                        RIT AI Plans
                    </button>
                </div>

                {/* Sub-tabs for RIT AI plans */}
                {activeTab === 'RIT' && (
                    <div className="flex flex-wrap gap-2 p-1 bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/60 rounded-xl w-fit">
                        {(['school', 'college', 'competitive'] as const).map((cat) => (
                            <button
                                key={cat}
                                onClick={() => {
                                    setRitCategory(cat);
                                    setPage(1);
                                }}
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                                    ritCategory === cat
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                {cat === 'school' ? '🏫 School' : cat === 'college' ? '🎓 College' : '🎯 Competitive'}
                            </button>
                        ))}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader size="lg" />
                    </div>
                ) : plans.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <CreditCard size={48} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Plans Found</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Create your first membership plan to get started.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
                            >
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => router.push(`/dashboard/superadmin/membership-plans/edit/${encodeId(plan.id)}`)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(plan.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">
                                        {plan.name.startsWith('RIT_AI_')
                                            ? plan.name.replace(/^RIT_AI_(SCHOOL|COLLEGE|COMPETITIVE)_/, '').replace(/_/g, ' ')
                                            : plan.name}
                                    </h3>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                                            ₹{plan.discountedPrice || plan.price}
                                        </span>
                                        {plan.discountedPrice && (
                                            <span className="text-lg text-gray-400 line-through">₹{plan.price}</span>
                                        )}
                                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                                            / {plan.durationDays >= 99999 ? 'Lifetime' : `${plan.durationDays} days`}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                            <Users size={16} /> {plan.planType === 'RIT' ? 'AI User Limit' : 'Total Users'}
                                        </span>
                                        <span className="font-semibold text-gray-900 dark:text-white">{plan.userLimit === 0 ? 'Unlimited' : plan.userLimit}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                            <Calendar size={16} /> Branch Limit
                                        </span>
                                        <span className="font-semibold text-gray-900 dark:text-white">{plan.branchLimit}</span>
                                    </div>
                                    <div className="h-px bg-gray-100 dark:bg-gray-700 my-2"></div>
                                </div>

                                <div className="w-full bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center text-xs text-gray-500 dark:text-gray-400">
                                    Created on {new Date(plan.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-4 rounded-2xl shadow-sm mt-4">
                        <div className="flex flex-1 justify-between sm:hidden">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                disabled={page === pagination.totalPages}
                                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700 dark:text-gray-400">
                                    Showing <span className="font-medium">{(page - 1) * pagination.limit + 1}</span> to <span className="font-medium">{Math.min(page * pagination.limit, pagination.totalItems)}</span> of <span className="font-medium">{pagination.totalItems}</span> plans
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                                >
                                    <Calendar className="w-4 h-4 rotate-90" />
                                </button>
                                <span className="text-sm font-medium">
                                    Page {page} of {pagination.totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                    disabled={page === pagination.totalPages}
                                    className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                                >
                                    <Calendar className="w-4 h-4 -rotate-90" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Membership Plan"
                description="Are you sure you want to delete this membership plan? This action cannot be undone."
                isLoading={isDeleting}
            />
        </DashboardLayout>

    );
}
