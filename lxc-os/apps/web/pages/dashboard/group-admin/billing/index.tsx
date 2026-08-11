import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import {
    CreditCard,
    Download,
    History,
    TrendingUp,
    Calendar,
    AlertCircle,
    CheckCircle2,
    Loader2,
    History as HistoryIcon,
    Download as DownloadIcon,
    ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import client from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/context/AuthContext";
import toast from "react-hot-toast";

interface Invoice {
    id: string;
    invoiceNumber: string;
    amount: number;
    status: string;
    paymentDate: string;
    description: string;
    receiptUrl?: string;
    invoiceUrl?: string;
}

interface BillingData {
    plan: {
        id: string;
        name: string;
        price: number;
        endDate: string;
        status: string;
        userLimit: number;
    } | null;
    usage: {
        branchCount: number;
        studentCount: number;
        branchLimit: number;
    };
    invoices: Invoice[];
    availablePlans: {
        id: string;
        name: string;
        price: number;
        userLimit: number;
        durationDays: number;
    }[];
}

const BillingPage = () => {
    const { user } = useAuth();
    const [billingData, setBillingData] = useState<BillingData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isUpgrading, setIsUpgrading] = useState(false);

    useEffect(() => {
        if (user?.schoolGroupId) {
            fetchBillingData();
        }
    }, [user?.schoolGroupId]);

    const fetchBillingData = async () => {
        try {
            setLoading(true);
            console.log("[DEBUG] Fetching billing data from /v1/group-admin/billing...");
            const res = await client.get("/v1/group-admin/billing");
            console.log("[DEBUG] Received billing data:", res.data);
            setBillingData(res.data);
        } catch (error) {
            console.error("[DEBUG] Failed to fetch billing data", error);
            toast.error("Failed to load billing information");
        } finally {
            setLoading(false);
        }
    };

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleSpecificUpgrade = async (targetPlan: any) => {
        if (!user?.schoolGroupId || !billingData) return;

        try {
            setIsUpgrading(true);
            const res = await loadRazorpay();
            if (!res) {
                toast.error("Razorpay SDK failed to load. Are you online?");
                return;
            }

            const orderRes = await client.post("/v1/finance/subscription/create-group-order", {
                groupId: user.schoolGroupId,
                planId: targetPlan.id,
                billingPeriod: "YEAR"
            });

            const order = orderRes.data;

            const options = {
                key: order.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency || "INR",
                name: "LearnXChain",
                description: `Upgrade to ${targetPlan.name}`,
                order_id: order.orderId,
                handler: async (response: any) => {
                    try {
                        const verifyRes = await client.post("/v1/finance/subscription/verify-payment", {
                            ...response,
                            groupId: user.schoolGroupId,
                            planId: targetPlan.id,
                            billingPeriod: "YEAR"
                        });
                        console.log("[DEBUG] Verification response:", verifyRes.data);
                        toast.success("Upgrade successful!");
                        fetchBillingData();
                    } catch (err) {
                        console.error("[DEBUG] Verification error:", err);
                        toast.error("Payment verification failed");
                    } finally {
                        setIsUpgrading(false);
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                    contact: user.phone || "",
                },
                theme: { color: "#4f46e5" },
                modal: {
                    ondismiss: () => setIsUpgrading(false)
                }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();
        } catch (error: any) {
            console.error("[DEBUG] Upgrade error:", error);
            toast.error(error.response?.data?.message || "Failed to initiate upgrade");
            setIsUpgrading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout role="group_admin">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
            </DashboardLayout>
        );
    }

    const plan = billingData?.plan || {
        id: "",
        name: "No Active Plan",
        price: 0,
        endDate: "",
        status: "NONE",
        userLimit: 5000
    };

    const usage = billingData?.usage || {
        branchCount: 0,
        studentCount: 0,
        branchLimit: 10
    };

    const invoices = billingData?.invoices || [];
    const availablePlans = billingData?.availablePlans || [];

    return (
        <DashboardLayout role="group_admin">
            <div className="p-6 max-w-6xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Billing & Subscriptions</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage your organization's subscription plan and view payment history.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Current Plan Card */}
                        <div className={cn(
                            "rounded-3xl p-8 shadow-xl relative overflow-hidden transition-all",
                            plan.status === "NONE" 
                                ? "bg-white dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700" 
                                : "bg-gradient-to-br from-indigo-600 to-blue-700 text-white"
                        )}>
                            {plan.status !== "NONE" && (
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl text-white" />
                            )}
                            
                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="space-y-2">
                                    <div className={cn(
                                        "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md",
                                        plan.status === "NONE" ? "bg-gray-100 text-gray-600" : "bg-white/20"
                                    )}>
                                        <TrendingUp className="w-3 h-3" />
                                        {plan.status === "NONE" ? "NO ACTIVE PLAN" : "CURRENT PLAN"}
                                    </div>
                                    <h2 className={cn(
                                        "text-4xl font-black",
                                        plan.status === "NONE" ? "text-gray-900 dark:text-white" : ""
                                    )}>{plan.name}</h2>
                                    <p className={plan.status === "NONE" ? "text-gray-500" : "text-indigo-100 opacity-90"}>
                                        {plan.endDate ? `Renews on ${new Date(plan.endDate).toLocaleDateString()}` : "Select a membership plan below to get started."}
                                    </p>
                                </div>
                                
                                {plan.status !== "NONE" ? (
                                    <div className="flex flex-col gap-3">
                                        <div className="text-right">
                                            <span className="text-3xl font-bold">₹{plan.price.toLocaleString()}</span>
                                            <span className="text-indigo-200">/year</span>
                                        </div>
                                        <Button 
                                            onClick={() => document.getElementById('plans-selection')?.scrollIntoView({ behavior: 'smooth' })}
                                            className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold px-6 py-6 h-auto rounded-xl shadow-lg"
                                        >
                                            Change Plan
                                        </Button>
                                    </div>
                                ) : (
                                    <Button 
                                        onClick={() => document.getElementById('plans-selection')?.scrollIntoView({ behavior: 'smooth' })}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-6 h-auto rounded-xl shadow-lg"
                                    >
                                        Browse Plans
                                    </Button>
                                )}
                            </div>

                            <div className={cn(
                                "mt-8 pt-8 border-t grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10",
                                plan.status === "NONE" ? "border-gray-100 dark:border-gray-700" : "border-white/10"
                            )}>
                                <div className="space-y-1">
                                    <p className={plan.status === "NONE" ? "text-gray-400 text-xs" : "text-indigo-200 text-xs"}>BRANCHES</p>
                                    <p className="font-bold">{usage.branchCount} Schools</p>
                                </div>
                                <div className="space-y-1">
                                    <p className={plan.status === "NONE" ? "text-gray-400 text-xs" : "text-indigo-200 text-xs"}>STUDENT LIMIT</p>
                                    <p className="font-bold">{plan.userLimit.toLocaleString()} Students</p>
                                </div>
                                <div className="space-y-1">
                                    <p className={plan.status === "NONE" ? "text-gray-400 text-xs" : "text-indigo-200 text-xs"}>SUPPORT</p>
                                    <p className="font-bold">Priority 24/7</p>
                                </div>
                                <div className="space-y-1">
                                    <p className={plan.status === "NONE" ? "text-gray-400 text-xs" : "text-indigo-200 text-xs"}>STATUS</p>
                                    <p className="font-bold flex items-center gap-1.5 capitalize">
                                        {plan.status === 'ACTIVE' ? (
                                            <><CheckCircle2 className="w-4 h-4 text-green-400" /> Active</>
                                        ) : plan.status === 'NONE' ? (
                                            <><AlertCircle className="w-4 h-4 text-gray-400" /> Inactive</>
                                        ) : (
                                            <><AlertCircle className="w-4 h-4 text-orange-400" /> {plan.status.toLowerCase()}</>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Plans Selection Section */}
                        <div id="plans-selection" className="space-y-6">
                            <div className="flex items-center gap-2">
                                < ShieldCheck className="w-5 h-5 text-indigo-600" />
                                <h3 className="text-xl font-bold">Organization Membership Plans</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {availablePlans.map((p) => (
                                    <div key={p.id} className={cn(
                                        "p-6 rounded-2xl border-2 transition-all group",
                                        plan.id === p.id 
                                            ? "border-indigo-600 bg-indigo-50/10 dark:bg-indigo-900/10" 
                                            : "border-gray-100 dark:border-gray-700 hover:border-indigo-300 hover:shadow-md"
                                    )}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="font-bold text-lg">{p.name}</h4>
                                                <p className="text-sm text-gray-500">Up to {p.userLimit.toLocaleString()} Students</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-xl">₹{p.price.toLocaleString()}</p>
                                                <p className="text-[10px] text-gray-400 uppercase tracking-widest">per year</p>
                                            </div>
                                        </div>
                                        <Button 
                                            onClick={() => handleSpecificUpgrade(p)}
                                            disabled={isUpgrading || plan.id === p.id}
                                            className={cn(
                                                "w-full rounded-xl py-6",
                                                plan.id === p.id ? "bg-gray-100 text-gray-400" : "bg-indigo-600 hover:bg-indigo-700"
                                            )}
                                        >
                                            {plan.id === p.id ? "Current Plan" : isUpgrading ? "Processing..." : "Select Plan"}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Invoices */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <HistoryIcon className="w-5 h-5 text-indigo-500" />
                                    Payment History
                                </h3>
                                <Button variant="ghost" size="sm" className="text-indigo-600 hover:bg-indigo-50">View All</Button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-gray-100 dark:border-gray-700">
                                            <th className="pb-4 font-semibold text-sm text-gray-500">Invoice</th>
                                            <th className="pb-4 font-semibold text-sm text-gray-500">Date</th>
                                            <th className="pb-4 font-semibold text-sm text-gray-500">Amount</th>
                                            <th className="pb-4 font-semibold text-sm text-gray-500">Status</th>
                                            <th className="pb-4 font-semibold text-sm text-gray-500 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {invoices.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="py-8 text-center text-gray-400">No payment records found</td>
                                            </tr>
                                        ) : invoices.map((inv) => (
                                            <tr key={inv.id} className="group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                                <td className="py-4 font-medium text-gray-900 dark:text-white uppercase text-[10px]">{inv.invoiceNumber}</td>
                                                <td className="py-4 text-sm text-gray-600 dark:text-gray-400">{inv.paymentDate}</td>
                                                <td className="py-4 font-bold text-gray-900 dark:text-white">₹{inv.amount.toLocaleString()}</td>
                                                <td className="py-4">
                                                    <span className={cn(
                                                        "px-2.5 py-1 rounded-lg text-xs font-bold",
                                                        inv.status === 'COMPLETED' ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"
                                                    )}>
                                                        {inv.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-right">
                                                    {(inv.invoiceUrl || inv.receiptUrl) ? (
                                                        <a 
                                                            href={inv.invoiceUrl || inv.receiptUrl} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="p-2 text-gray-400 hover:text-indigo-600 transition-colors inline-block"
                                                        >
                                                            <DownloadIcon className="w-4 h-4" />
                                                        </a>
                                                    ) : (
                                                        <span className="text-gray-300">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Summary Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-indigo-500" />
                                Org Status
                            </h3>
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Connected Schools</span>
                                        <span className="font-bold">{usage.branchCount}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Total Students</span>
                                        <span className="font-bold">{usage.studentCount.toLocaleString()}</span>
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] uppercase font-bold text-gray-400">
                                        <span>School Limit</span>
                                        <span>{usage.branchCount} / {usage.branchLimit}</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-indigo-500" 
                                            style={{ width: `${Math.min(100, (usage.branchCount / usage.branchLimit) * 100)}%` }} 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-indigo-500" />
                                Payment Gateway
                            </h3>
                            <div className="p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-center py-6">
                                <CreditCard className="w-8 h-8 text-gray-300 mb-2" />
                                <p className="text-xs text-gray-500">Payments are processed securely via Razorpay.</p>
                            </div>
                            <Button variant="ghost" className="w-full mt-4 text-xs text-gray-400" onClick={() => window.open('https://razorpay.com', '_blank')}>
                                Learn about security
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default BillingPage;
