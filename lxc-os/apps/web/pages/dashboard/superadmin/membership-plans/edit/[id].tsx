import { useState, useEffect } from 'react';
import Head from 'next/head';
import DashboardLayout from '@/components/dashboard/layout/DashboardLayout';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import { ArrowLeft, CheckCircle, CreditCard, Users, Clock, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAccessToken } from '@/lib/api/client';
import { Loader } from '@/components/ui/feedback/Loader';
import { decodeId } from "@/lib/utils/hashId";

export default function EditMembershipPlanPage() {
    const router = useRouter();
    const { id: rawId } = router.query;
    const id = rawId ? decodeId(rawId as string) : undefined;
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        discountedPrice: '',
        durationDays: '',
        userLimit: '0',
        branchLimit: '1',
        planType: 'PLATFORM',
    });

    useEffect(() => {
        if (id) {
            fetchPlanDetails(id as string);
        }
    }, [id]);

    const fetchPlanDetails = async (planId: string) => {
        try {
            const res = await fetch(`/api/v1/superadmin/membership-plans/${planId}`, {
                headers: {
                    'Authorization': `Bearer ${getAccessToken()}`
                }
            });
            const data = await res.json();
            if (res.ok) {
                const plan = data.data;
                setFormData({
                    name: plan.name,
                    price: plan.price.toString(),
                    discountedPrice: plan.discountedPrice ? plan.discountedPrice.toString() : '',
                    durationDays: plan.durationDays.toString(),
                    userLimit: plan.userLimit ? plan.userLimit.toString() : '0',
                    branchLimit: plan.branchLimit ? plan.branchLimit.toString() : '1',
                    planType: plan.planType || 'PLATFORM',
                });
            } else {
                toast.error('Failed to load plan details');
                router.push('/dashboard/superadmin/membership-plans');
            }
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong');
        } finally {
            setFetching(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        if (!formData.name) {
            toast.error('Plan Name is required');
            return false;
        }
        if (!formData.price || Number(formData.price) < 0) {
            toast.error('Valid Price is required');
            return false;
        }
        if (!formData.durationDays || Number(formData.durationDays) <= 0) {
            toast.error('Valid Duration is required');
            return false;
        }
        if (formData.discountedPrice && Number(formData.discountedPrice) > Number(formData.price)) {
            toast.error('Discounted price cannot be greater than the original price');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);

        const updatePromise = new Promise(async (resolve, reject) => {
            try {
                const payload = {
                    name: formData.name,
                    price: Number(formData.price),
                    discountedPrice: formData.discountedPrice ? Number(formData.discountedPrice) : undefined,
                    durationDays: Number(formData.durationDays),
                    userLimit: Number(formData.userLimit),
                    branchLimit: Number(formData.branchLimit),
                    planType: formData.planType,
                };

                const res = await fetch(`/api/v1/superadmin/membership-plans/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getAccessToken()}`
                    },
                    body: JSON.stringify(payload),
                });

                const data = await res.json();

                if (res.ok) {
                    resolve(data);
                    router.push('/dashboard/superadmin/membership-plans');
                } else {
                    reject(new Error(data.message || 'Failed to update plan'));
                }
            } catch (error) {
                reject(error);
            }
        });

        await toast.promise(updatePromise, {
            loading: 'Updating membership plan...',
            success: 'Membership Plan updated successfully',
            error: (err: any) => err.message || 'Something went wrong',
        });

        setLoading(false);
    };

    if (fetching) {
        return (
            <DashboardLayout role="superadmin">
                <div className="flex justify-center items-center h-screen">
                    <Loader size="lg" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="superadmin">
            <Head>
                <title>Edit Membership Plan - LearnXChain</title>
            </Head>

            <div className="mx-auto max-w-4xl space-y-8 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5 text-gray-500" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                            Edit Membership Plan
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Update pricing and user limits
                        </p>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800"
                >
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* Basic Details Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                                <Tag className="text-blue-600" size={20} />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Plan Details</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Plan Type *</label>
                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, planType: 'PLATFORM' }))}
                                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                                                formData.planType === 'PLATFORM'
                                                    ? 'border-purple-600 bg-purple-50/50 text-purple-600 dark:border-purple-500 dark:bg-purple-950/20 dark:text-purple-400 font-semibold'
                                                    : 'border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800/50'
                                            }`}
                                        >
                                            <CreditCard size={18} />
                                            Platform SaaS Plan
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, planType: 'RIT' }))}
                                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                                                formData.planType === 'RIT'
                                                    ? 'border-purple-600 bg-purple-50/50 text-purple-600 dark:border-purple-500 dark:bg-purple-950/20 dark:text-purple-400 font-semibold'
                                                    : 'border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800/50'
                                            }`}
                                        >
                                            <Users size={18} />
                                            RIT AI Plan
                                        </button>
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Plan Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Starter Plan"
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800 transition-all font-medium"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price (₹) *</label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            placeholder="0.00"
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Discounted Price (Optional)</label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <input
                                            type="number"
                                            name="discountedPrice"
                                            value={formData.discountedPrice}
                                            onChange={handleInputChange}
                                            placeholder="0.00"
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800 transition-all"
                                        />
                                    </div>
                                </div> */}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duration (Days) *</label>
                                    <div className="relative">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <input
                                            type="number"
                                            name="durationDays"
                                            value={formData.durationDays}
                                            onChange={handleInputChange}
                                            placeholder="30"
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800 transition-all"
                                        />
                                    </div>
                                    <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                                        Tip: Enter 99999 for a Lifetime plan.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Limits Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                                <Users className="text-purple-600" size={20} />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {formData.planType === 'RIT' ? 'RIT AI Limits' : 'User Limits'}
                                </h3>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl text-blue-800 dark:text-blue-300 text-sm mb-4">
                                {formData.planType === 'RIT'
                                    ? 'Set the maximum number of active RIT AI classroom users allowed. Set to 0 for no limit.'
                                    : 'Set the maximum number of total users allowed for this school. Set to 0 for no limit.'}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="relative group">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-hover:text-blue-600 transition-colors">
                                        {formData.planType === 'RIT' ? 'AI User Limit' : 'Total User Limit'}
                                    </label>
                                    <input
                                        type="number"
                                        name="userLimit"
                                        value={formData.userLimit}
                                        onChange={handleInputChange}
                                        min="0"
                                        placeholder="e.g. 500"
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 dark:border-gray-700 dark:bg-gray-800 transition-all font-medium"
                                    />
                                </div>

                                <div className="relative group">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-hover:text-blue-600 transition-colors">
                                        Branch Limit
                                    </label>
                                    <input
                                        type="number"
                                        name="branchLimit"
                                        value={formData.branchLimit}
                                        onChange={handleInputChange}
                                        min="1"
                                        placeholder="e.g. 10"
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 dark:border-gray-700 dark:bg-gray-800 transition-all font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-4 pt-6 mt-8 border-t border-gray-100 dark:border-gray-800">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-6 py-2.5 rounded-xl font-medium text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-blue-700 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader size="sm" variant="white" /> : <CheckCircle className="h-5 w-5" />}
                                {loading ? 'Updating Plan...' : 'Update Membership Plan'}
                            </button>
                        </div>

                    </form>
                </motion.div>
            </div>
        </DashboardLayout>
    );
}
