import { useState, useEffect } from "react";
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { useApi } from "@/hooks/useApi";
import { Search, RefreshCcw, Building2, Users, Settings2, ShieldCheck, CreditCard, Zap, History, Save, Receipt, CheckCircle2, XCircle, AlertCircle, Info, ChevronDown, Plus, X, Hammer } from 'lucide-react';
import Link from 'next/link';
import { clsx } from "clsx";
import { toast } from "react-toastify";
import Loader from '@/components/ui/feedback/Loader';

// Declare Razorpay type
declare global {
    interface Window {
        Razorpay: any;
    }
}

interface School {
    id: string;
    schoolName: string;
    schoolCode: string;
    schoolLogo: string | null;
    isActive: boolean;
    count: {
        currentUsers: number;
        allowedUsers: number;
        bonusUsers: number;
        model: string;
    };
    subscription: any[];
}

interface Organization {
    id: string;
    name: string;
    logo: string | null;
    isActive: boolean;
    owner: {
        name: string;
        email: string;
    };
    _count: {
        schools: number;
    };
}

interface SchoolConfig {
    planModel: "MODEL_A" | "MODEL_B";
    allowedUsers: number;
    extraUserPrice: number;
    gracePeriodDays: number;
    isReadOnlyAfterGrace: boolean;
    autoSuspendAfterGrace: boolean;
}

interface FeatureConfig {
    key: string;
    name: string;
    status: "ENABLED" | "DISABLED";
    monthlyPrice: number;
    activatedOn: string | null;
    isMandatory: boolean;
}

interface MembershipPlan {
    id: string;
    name: string;
    price: number;
    discountedPrice: number | null;
    durationDays: number;
    userLimit: number;
    createdAt?: string;
}

export default function AssignPlanPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectionMode, setSelectionMode] = useState<"SCHOOL" | "ORGANIZATION">("SCHOOL");
    const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
    const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
    const [config, setConfig] = useState<SchoolConfig | null>(null);
    const [features, setFeatures] = useState<FeatureConfig[]>([]);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [isGlobalModalOpen, setIsGlobalModalOpen] = useState(false);
    const [globalSettings, setGlobalSettings] = useState<any[]>([]);
    const [featureCatalog, setFeatureCatalog] = useState<any[]>([]);
    const [membershipPlans, setMembershipPlans] = useState<MembershipPlan[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
    const [selectedFeature, setSelectedFeature] = useState<FeatureConfig | null>(null);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [couponCode, setCouponCode] = useState<string>("");
    const [isAutoRenew, setIsAutoRenew] = useState(false);

    const { data: schools, get: getSchools, loading: schoolsLoading } = useApi<School[]>();
    const { data: organizations, get: getOrgs, loading: orgsLoading } = useApi<Organization[]>();
    const { get: getConfig, post: postConfig, patch: patchConfig, loading: configLoading } = useApi<any>();
    const { get: getFeatures, patch: patchFeature, loading: featuresLoading } = useApi<FeatureConfig[]>();
    const { get: getInvoices, loading: invoicesLoading } = useApi<any[]>();
    const { get: getGlobalSettings, post: postGlobalSettings, loading: globalLoading } = useApi<any[]>();
    const { get: getPlans, loading: plansLoading } = useApi<any>();
    const { post: createOrder } = useApi<any>();
    const { post: verifyPayment } = useApi<any>();
    const { post: postOrgAssign, loading: orgAssignLoading } = useApi<any>();

    // Load global settings on mount
    useEffect(() => {
        const loadGlobals = async () => {
            try {
                const res = await getGlobalSettings("/v1/superadmin/subscription-control/global-settings", {
                    autoToast: false
                });
                if (res) {
                    setGlobalSettings(res);

                    // Initialize feature catalog from global settings (if present)
                    const catalogSetting = res.find((s: any) => s.key === "FEATURE_CATALOG");
                    if (catalogSetting) {
                        try {
                            const parsed = JSON.parse(catalogSetting.value || "[]");
                            if (Array.isArray(parsed)) {
                                setFeatureCatalog(parsed);
                            }
                        } catch {
                            // ignore parse errors and keep default empty catalog
                        }
                    }
                }
            } catch (error) {
                toast.error("Failed to load global settings");
            }
        };
        loadGlobals();
    }, []);

    // Load membership plans when Model B is active OR when an organization is selected
    useEffect(() => {
        const loadPlans = async () => {
            const isOrgMode = selectionMode === "ORGANIZATION" && !!selectedOrg;
            if (config?.planModel === "MODEL_B" || isOrgMode) {
                try {
                    const res = await getPlans("/v1/superadmin/membership-plans", {
                        autoToast: false,
                        onError: () => {
                            toast.error("Failed to load membership plans");
                        }
                    });
                    if (res?.data) {
                        setMembershipPlans(res.data);
                    }
                } catch (error) {
                    toast.error("Failed to load membership plans");
                }
            } else {
                setMembershipPlans([]);
            }
        };
        loadPlans();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [config?.planModel, selectedOrg, selectionMode]);

    // Initial load: all schools (for quick access)
    useEffect(() => {
        const loadInitialSchools = async () => {
            try {
                await getSchools(`/v1/superadmin/subscription-control/schools`, {
                    autoToast: false,
                    onError: () => {
                        toast.error("Failed to load schools");
                    }
                });
            } catch {
                // already toasted above
            }
        };
        loadInitialSchools();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Initial load: organizations
    useEffect(() => {
        if (selectionMode === "ORGANIZATION") {
            getOrgs(`/v1/superadmin/groups`, {
                autoToast: false,
                onError: () => {
                    toast.error("Failed to load organizations");
                }
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectionMode]);

    useEffect(() => {
        if (searchTerm.length >= 2) {
            if (selectionMode === "SCHOOL") {
                getSchools(`/v1/superadmin/subscription-control/schools?search=${searchTerm}`, {
                    autoToast: false,
                    onError: () => {
                        toast.error("Failed to search schools");
                    }
                });
            } else {
                getOrgs(`/v1/superadmin/groups?search=${searchTerm}`, {
                    autoToast: false,
                    onError: () => {
                        toast.error("Failed to search organizations");
                    }
                });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, selectionMode]);

    const handleSelectSchool = async (school: School) => {
        setSelectedSchool(school);
        setSearchTerm("");

        try {
            const configRes = await getConfig(`/v1/superadmin/subscription-control/${school.id}`, {
                autoToast: false
            });
            if (configRes) {
                setConfig(configRes.config);
                setSelectedSchool(configRes.school);
            } else {
                toast.error("Failed to load school configuration");
                return;
            }

            const featuresRes = await getFeatures(`/v1/superadmin/subscription-control/${school.id}/features`, {
                autoToast: false
            });
            if (featuresRes) {
                setFeatures(featuresRes);
            } else {
                toast.error("Failed to load school features");
            }

            const invoicesRes = await getInvoices(`/v1/superadmin/subscription-control/${school.id}/invoices`, {
                autoToast: false
            });
            if (invoicesRes) {
                setInvoices(invoicesRes);
            } else {
                toast.error("Failed to load invoices");
            }

            toast.success(`Loaded configuration for ${school.schoolName}`);
        } catch (error) {
            toast.error("Failed to load school configuration");
        }
    };

    const handleUpdateModel = async (model: "MODEL_A" | "MODEL_B") => {
        if (!selectedSchool || !config) {
            toast.error("Please select a school first");
            return;
        }

        try {
            const res = await patchConfig(`/v1/superadmin/subscription-control/${selectedSchool.id}`, { planModel: model }, {
                autoToast: false
            });
            if (res) {
                setConfig(res);
                toast.success(`Plan model switched to ${model === 'MODEL_A' ? 'Model A (Pay-Per-Feature)' : 'Model B (User Limit)'}`);

                // If switching to Model B (Fixed Plan), ensure all features are enabled
                if (model === "MODEL_B" && features.length > 0) {
                    try {
                        await Promise.all(
                            features.map((feature) =>
                                feature.status === "ENABLED"
                                    ? Promise.resolve()
                                    : patchFeature(
                                        `/v1/superadmin/subscription-control/${selectedSchool.id}/features`,
                                        {
                                            featureKey: feature.key,
                                            status: "ENABLED",
                                            // Keep existing price metadata; billing is via plan for Model B
                                            monthlyPrice: feature.monthlyPrice,
                                            isMandatory: feature.isMandatory,
                                        },
                                        { autoToast: false }
                                    )
                            )
                        );

                        // Refresh features state so UI stays consistent when switching back to Model A
                        const updatedFeatures = await getFeatures(
                            `/v1/superadmin/subscription-control/${selectedSchool.id}/features`,
                            { autoToast: false }
                        );
                        if (updatedFeatures) {
                            setFeatures(updatedFeatures);
                        }
                    } catch (err) {
                        console.error("Failed to auto-enable features for Model B", err);
                        toast.error("Failed to auto-enable all features for Model B");
                    }
                }
            } else {
                toast.error("Failed to update plan model");
            }
        } catch (error) {
            toast.error("Failed to update plan model");
        }
    };

    const handleToggleFeature = async (featureKey: string, currentStatus: string) => {
        if (!selectedSchool) {
            toast.error("Please select a school first");
            return;
        }

        const feature = features.find(f => f.key === featureKey);
        if (!feature) {
            toast.error("Feature not found");
            return;
        }

        // If disabling, just toggle directly
        if (currentStatus === 'ENABLED') {
            try {
                const res = await patchFeature(`/v1/superadmin/subscription-control/${selectedSchool.id}/features`, {
                    featureKey,
                    status: 'DISABLED'
                }, {
                    autoToast: false
                });
                if (res) {
                    // Refresh features
                    const updatedFeatures = await getFeatures(`/v1/superadmin/subscription-control/${selectedSchool.id}/features`, {
                        autoToast: false
                    });
                    if (updatedFeatures) setFeatures(updatedFeatures);
                    toast.success(`${feature.name} disabled successfully`);
                } else {
                    toast.error("Failed to disable feature");
                }
            } catch (error) {
                toast.error("Failed to disable feature");
            }
            return;
        }

        // If enabling, initiate payment flow (Model A - Pay-Per-Feature)
        if (feature.monthlyPrice > 0) {
            handleActivateFeatureWithPayment(feature);
        } else {
            // If free, just enable directly
            try {
                const res = await patchFeature(`/v1/superadmin/subscription-control/${selectedSchool.id}/features`, {
                    featureKey,
                    status: 'ENABLED'
                }, {
                    autoToast: false
                });
                if (res) {
                    const updatedFeatures = await getFeatures(`/v1/superadmin/subscription-control/${selectedSchool.id}/features`, {
                        autoToast: false
                    });
                    if (updatedFeatures) setFeatures(updatedFeatures);
                    toast.success(`${feature.name} enabled successfully`);
                } else {
                    toast.error("Failed to enable feature");
                }
            } catch (error) {
                toast.error("Failed to enable feature");
            }
        }
    };

    const handleActivateFeatureWithPayment = async (feature: FeatureConfig) => {
        if (!selectedSchool) {
            toast.error("Please select a school first");
            return;
        }

        // Prevent multiple simultaneous payment attempts
        if (isProcessingPayment) {
            toast.error("Payment is already being processed. Please wait.");
            return;
        }

        setSelectedFeature(feature);
        setIsProcessingPayment(true);

        let scriptElement: HTMLScriptElement | null = null;

        // Define function to open Razorpay modal for feature
        const openRazorpayModal = (orderRes: any, feature: FeatureConfig) => {
            if (!window.Razorpay) {
                setIsProcessingPayment(false);
                setSelectedFeature(null);
                toast.error("Payment gateway not available. Please refresh the page.");
                return;
            }

            const options = {
                key: orderRes.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: orderRes.amount,
                currency: orderRes.currency || 'INR',
                name: 'LearnXChain',
                description: `${feature.name} Feature - ${selectedSchool?.schoolName}`,
                order_id: orderRes.orderId,
                handler: async (response: any) => {
                    try {
                        if (!response.razorpay_order_id || !response.razorpay_payment_id || !response.razorpay_signature) {
                            toast.error("Invalid payment response");
                            setIsProcessingPayment(false);
                            setSelectedFeature(null);
                            return;
                        }

                        // Verify payment
                        const verifyRes = await verifyPayment("/v1/finance/subscription/verify-payment", {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            schoolId: selectedSchool?.id,
                            featureKey: feature.key,
                            featureName: feature.name,
                            amount: feature.monthlyPrice,
                        }, {
                            autoToast: false,
                            onError: (error: any) => {
                                toast.error(error?.message || "Payment verification failed");
                            }
                        });

                        if (verifyRes) {
                            toast.success(`Feature "${feature.name}" activated successfully!`);
                            // Refresh features
                            const updatedFeatures = await getFeatures(`/v1/superadmin/subscription-control/${selectedSchool.id}/features`, {
                                autoToast: false
                            });
                            if (updatedFeatures) setFeatures(updatedFeatures);
                            // Refresh invoices
                            const invoicesRes = await getInvoices(`/v1/superadmin/subscription-control/${selectedSchool.id}/invoices`, {
                                autoToast: false
                            });
                            if (invoicesRes) setInvoices(invoicesRes);
                        } else {
                            toast.error("Payment verification failed");
                        }
                    } catch (error: any) {
                        toast.error(error?.message || "Payment verification failed");
                    } finally {
                        setIsProcessingPayment(false);
                        setSelectedFeature(null);
                    }
                },
                prefill: {
                    name: selectedSchool?.schoolName || '',
                    email: '',
                },
                theme: {
                    color: '#6366f1',
                },
                modal: {
                    ondismiss: () => {
                        setIsProcessingPayment(false);
                        setSelectedFeature(null);
                        // Don't show error toast on user cancellation
                    }
                }
            };

            try {
                const razorpay = new window.Razorpay(options);
                razorpay.open();
            } catch (error: any) {
                setIsProcessingPayment(false);
                setSelectedFeature(null);
                toast.error(error?.message || "Failed to open payment modal");
            }
        };

        try {
            // Create Razorpay order for feature activation
            // Calculate amount in paise (Razorpay expects amount in smallest currency unit)
            const amountInPaise = Math.round(feature.monthlyPrice * 100);

            const orderRes = await createOrder("/v1/finance/subscription/create-feature-order", {
                schoolId: selectedSchool.id,
                featureKey: feature.key,
                featureName: feature.name,
                amount: feature.monthlyPrice,
                isFeatureActivation: true,
            }, {
                autoToast: false,
                onError: (error: any) => {
                    setIsProcessingPayment(false);
                    setSelectedFeature(null);
                    const errorMessage = error?.response?.data?.message || error?.message || "Failed to create payment order";
                    console.error("Feature payment order creation error:", error);
                    toast.error(errorMessage);
                }
            });

            if (!orderRes || !orderRes.orderId) {
                setIsProcessingPayment(false);
                setSelectedFeature(null);
                toast.error("Invalid order response. Please try again.");
                return;
            }

            // Check if Razorpay is already loaded
            if (window.Razorpay) {
                openRazorpayModal(orderRes, feature);
                return;
            }

            // Load Razorpay script dynamically
            scriptElement = document.createElement('script');
            scriptElement.src = 'https://checkout.razorpay.com/v1/checkout.js';
            scriptElement.id = 'razorpay-checkout-script';

            scriptElement.onload = () => {
                openRazorpayModal(orderRes, feature);
            };

            scriptElement.onerror = () => {
                setIsProcessingPayment(false);
                setSelectedFeature(null);
                if (scriptElement && scriptElement.parentNode) {
                    scriptElement.parentNode.removeChild(scriptElement);
                }
                toast.error("Failed to load payment gateway. Please check your internet connection.");
            };

            // Check if script already exists
            const existingScript = document.getElementById('razorpay-checkout-script');
            if (existingScript) {
                existingScript.remove();
            }

            document.body.appendChild(scriptElement);
        } catch (error: any) {
            setIsProcessingPayment(false);
            setSelectedFeature(null);
            if (scriptElement && scriptElement.parentNode) {
                scriptElement.parentNode.removeChild(scriptElement);
            }
            toast.error(error?.message || "Failed to initiate payment");
        }
    };

    const handleSaveGeneralConfig = async () => {
        if (!selectedSchool || !config) {
            toast.error("Please select a school first");
            return;
        }
        try {
            const res = await patchConfig(`/v1/superadmin/subscription-control/${selectedSchool.id}`, config, {
                autoToast: false
            });
            if (res) {
                setConfig(res);
                toast.success("Settings saved successfully");
            } else {
                toast.error("Failed to save settings");
            }
        } catch (error) {
            toast.error("Failed to save settings");
        }
    };

    const handleSaveGlobalSettings = async (updatedSettings: any[]) => {
        try {
            const res = await postGlobalSettings("/v1/superadmin/subscription-control/global-settings", { settings: updatedSettings }, {
                autoToast: false
            });
            if (res) {
                setGlobalSettings(res);
                toast.success("Global settings updated successfully");
                setIsGlobalModalOpen(false);
            } else {
                toast.error("Failed to update global settings");
            }
        } catch (error) {
            toast.error("Failed to update global settings");
        }
    };

    const handleAction = async (action: string, paymentId?: string) => {
        if (!selectedSchool) {
            toast.error("Please select a school first");
            return;
        }

        const actionMessages: Record<string, string> = {
            'MARK_PAID': 'Payment marked as completed',
            'SEND_REMINDER': 'Reminder sent successfully',
            'WAIVE_OVERAGE': 'Overage fees waived successfully'
        };

        try {
            const res = await postConfig(`/v1/superadmin/subscription-control/${selectedSchool.id}/actions`, {
                action,
                paymentId
            }, {
                autoToast: false
            });
            if (res) {
                const message = res.message || actionMessages[action] || "Action completed successfully";
                toast.success(message);
                // Refresh invoices if needed
                if (action === 'MARK_PAID') {
                    const invoicesRes = await getInvoices(`/v1/superadmin/subscription-control/${selectedSchool.id}/invoices`, {
                        autoToast: false
                    });
                    if (invoicesRes) setInvoices(invoicesRes);
                }
            } else {
                toast.error("Action failed");
            }
        } catch (error) {
            toast.error("Action failed");
        }
    };

    const handleSelectPlan = async (plan: MembershipPlan) => {
        if (!selectedSchool) {
            toast.error("Please select a school first");
            return;
        }

        // Prevent multiple simultaneous payment attempts
        if (isProcessingPayment) {
            toast.error("Payment is already being processed. Please wait.");
            return;
        }

        setSelectedPlan(plan);
        setIsProcessingPayment(true);

        let scriptElement: HTMLScriptElement | null = null;

        // Define function to open Razorpay modal
        const openRazorpayModal = (orderRes: any, plan: MembershipPlan) => {
            if (!window.Razorpay) {
                setIsProcessingPayment(false);
                setSelectedPlan(null);
                toast.error("Payment gateway not available. Please refresh the page.");
                return;
            }

            const options = {
                key: orderRes.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: orderRes.amount,
                currency: orderRes.currency || 'INR',
                name: 'LearnXChain',
                description: `${plan.name} - ${selectedSchool?.schoolName}`,
                [orderRes.isAutoRenew ? 'subscription_id' : 'order_id']: orderRes.subscriptionId || orderRes.orderId,
                handler: async (response: any) => {
                    try {
                        if (!response.razorpay_order_id || !response.razorpay_payment_id || !response.razorpay_signature) {
                            toast.error("Invalid payment response");
                            setIsProcessingPayment(false);
                            setSelectedPlan(null);
                            return;
                        }

                        // Verify payment
                        const verifyRes = await verifyPayment("/v1/finance/subscription/verify-payment", {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            schoolId: selectedSchool?.id,
                            planId: plan.id,
                            couponCode: couponCode || undefined,
                        }, {
                            autoToast: false,
                            onError: (error: any) => {
                                toast.error(error?.message || "Payment verification failed");
                            }
                        });

                        if (verifyRes) {
                            toast.success(`Plan "${plan.name}" assigned successfully!`);
                            // Refresh school config
                            if (selectedSchool) {
                                const configRes = await getConfig(`/v1/superadmin/subscription-control/${selectedSchool.id}`, {
                                    autoToast: false
                                });
                                if (configRes) {
                                    setConfig(configRes.config);
                                    setSelectedSchool(configRes.school);
                                }
                                // Refresh invoices
                                const invoicesRes = await getInvoices(`/v1/superadmin/subscription-control/${selectedSchool.id}/invoices`, {
                                    autoToast: false
                                });
                                if (invoicesRes) setInvoices(invoicesRes);
                                // Reload plans to update active status
                                const plansRes = await getPlans("/v1/superadmin/membership-plans", {
                                    autoToast: false
                                });
                                if (plansRes?.data) {
                                    setMembershipPlans(plansRes.data);
                                }
                            }
                        } else {
                            toast.error("Payment verification failed");
                        }
                    } catch (error: any) {
                        toast.error(error?.message || "Payment verification failed");
                    } finally {
                        setIsProcessingPayment(false);
                        setSelectedPlan(null);
                    }
                },
                prefill: {
                    name: selectedSchool?.schoolName || '',
                    email: '',
                },
                theme: {
                    color: '#6366f1',
                },
                modal: {
                    ondismiss: () => {
                        setIsProcessingPayment(false);
                        setSelectedPlan(null);
                        // Don't show error toast on user cancellation
                    }
                }
            };

            try {
                const razorpay = new window.Razorpay(options);
                razorpay.open();
            } catch (error: any) {
                setIsProcessingPayment(false);
                setSelectedPlan(null);
                toast.error(error?.message || "Failed to open payment modal");
            }
        };

        try {
            // Create Razorpay order - API calculates amount internally and supports couponCode
            const orderRes = await createOrder("/v1/finance/subscription/create-plan-order", {
                schoolId: selectedSchool.id,
                planId: plan.id,
                couponCode: couponCode || undefined,
                isAutoRenew,
            }, {
                autoToast: false,
                onError: (error: any) => {
                    setIsProcessingPayment(false);
                    setSelectedPlan(null);
                    const errorMessage = error?.response?.data?.message || error?.message || "Failed to create payment order";
                    console.error("Plan payment order creation error:", error);
                    toast.error(errorMessage);
                }
            });

            // Zero-amount flow (e.g., 100% coupon) – backend already created subscription & payment
            if (orderRes?.zeroAmount) {
                toast.success(`Plan "${plan.name}" assigned successfully${couponCode ? " with coupon applied" : ""}!`);

                if (selectedSchool) {
                    // Refresh school config
                    const configRes = await getConfig(`/v1/superadmin/subscription-control/${selectedSchool.id}`, {
                        autoToast: false
                    });
                    if (configRes) {
                        setConfig(configRes.config);
                        setSelectedSchool(configRes.school);
                    }
                    // Refresh invoices
                    const invoicesRes = await getInvoices(`/v1/superadmin/subscription-control/${selectedSchool.id}/invoices`, {
                        autoToast: false
                    });
                    if (invoicesRes) setInvoices(invoicesRes);
                    // Reload plans to update active status
                    const plansRes = await getPlans("/v1/superadmin/membership-plans", {
                        autoToast: false
                    });
                    if (plansRes?.data) {
                        setMembershipPlans(plansRes.data);
                    }
                }

                setIsProcessingPayment(false);
                setSelectedPlan(null);
                return;
            }

            if (!orderRes || !orderRes.orderId) {
                setIsProcessingPayment(false);
                setSelectedPlan(null);
                // createOrder already handled error toast via onError, so we just return
                return;
            }

            // Check if Razorpay is already loaded
            if (window.Razorpay) {
                openRazorpayModal(orderRes, plan);
                return;
            }

            // Load Razorpay script dynamically
            scriptElement = document.createElement('script');
            scriptElement.src = 'https://checkout.razorpay.com/v1/checkout.js';
            scriptElement.id = 'razorpay-checkout-script';

            scriptElement.onload = () => {
                openRazorpayModal(orderRes, plan);
            };

            scriptElement.onerror = () => {
                setIsProcessingPayment(false);
                setSelectedPlan(null);
                if (scriptElement && scriptElement.parentNode) {
                    scriptElement.parentNode.removeChild(scriptElement);
                }
                toast.error("Failed to load payment gateway. Please check your internet connection.");
            };

            // Check if script already exists
            const existingScript = document.getElementById('razorpay-checkout-script');
            if (existingScript) {
                existingScript.remove();
            }

            document.body.appendChild(scriptElement);
        } catch (error: any) {
            setIsProcessingPayment(false);
            setSelectedPlan(null);
            if (scriptElement && scriptElement.parentNode) {
                scriptElement.parentNode.removeChild(scriptElement);
            }
            toast.error(error?.message || "Failed to initiate payment");
        }
    };

    return (
        <DashboardLayout role="superadmin">
            <Head>
                <title>School Subscription Control - LearnXChain</title>
                <meta name="description" content="LearnXChain subscription control — manage school monetization models, feature access, user limits, and membership plans." />
            </Head>

            <div className="space-y-6 pb-20">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">School Subscription & Feature Control</h1>
                        <p className="text-gray-500 dark:text-gray-400">Manage monetization models, feature access, and usage limits per school.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href="/dashboard/superadmin/feature-catalog"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:scale-95 dark:bg-gray-900 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
                        >
                            <Hammer className="h-4 w-4" />
                            Feature Catalog
                        </Link>
                        <button
                            onClick={() => setIsGlobalModalOpen(true)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:scale-95 dark:bg-gray-900 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
                        >
                            <Settings2 className="h-4 w-4" />
                            Global Automation Rules
                        </button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: School Selection & Model */}
                    <div className="lg:col-span-1 space-y-6">
                        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
                            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Select School</h2>
                            <div className="flex gap-2 mb-4 p-1 bg-gray-100 dark:bg-white/5 rounded-xl">
                                <button
                                    onClick={() => { setSelectionMode("SCHOOL"); setSelectedOrg(null); setSelectedSchool(null); }}
                                    className={clsx(
                                        "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                                        selectionMode === "SCHOOL" ? "bg-white dark:bg-gray-800 shadow-sm text-indigo-600" : "text-gray-500 hover:text-gray-700"
                                    )}
                                >
                                    Individual School
                                </button>
                                <button
                                    onClick={() => { setSelectionMode("ORGANIZATION"); setSelectedSchool(null); setSelectedOrg(null); }}
                                    className={clsx(
                                        "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                                        selectionMode === "ORGANIZATION" ? "bg-white dark:bg-gray-800 shadow-sm text-indigo-600" : "text-gray-500 hover:text-gray-700"
                                    )}
                                >
                                    Organization
                                </button>
                            </div>

                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={selectionMode === "SCHOOL" ? "Search school name or code..." : "Search organization name..."}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-gray-900 dark:text-white"
                                />
                                {schoolsLoading && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <Loader className="" />
                                    </div>
                                )}

                                {selectionMode === "SCHOOL" && schools && schools.length > 0 && (searchTerm.length >= 1 || !selectedSchool) && (
                                    <div className="absolute z-50 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-xl dark:border-white/10 dark:bg-gray-900 overflow-hidden">
                                        <div className="max-h-60 overflow-y-auto">
                                            {schools.map(school => (
                                                <button
                                                    key={school.id}
                                                    onClick={() => handleSelectSchool(school)}
                                                    className="flex w-full items-center gap-3 border-b border-gray-50 px-4 py-3 text-left hover:bg-indigo-50 dark:border-white/5 dark:hover:bg-white/5 transition-colors"
                                                >
                                                    <div className="h-10 w-10 overflow-hidden rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                                                        {school.schoolLogo ? (
                                                            <img src={school.schoolLogo} alt="" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <Building2 className="h-5 w-5 text-gray-400" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-gray-900 dark:text-white truncate">{school.schoolName}</div>
                                                        <div className="text-xs text-gray-500">{school.schoolCode}</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectionMode === "ORGANIZATION" && (() => {
                                    // Groups API returns paginated { data, meta } shape
                                    const orgsArray: Organization[] = Array.isArray(organizations)
                                        ? organizations
                                        : (organizations as any)?.data ?? [];
                                    return orgsArray.length > 0 && !selectedOrg && (
                                        <div className="absolute z-50 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-xl dark:border-white/10 dark:bg-gray-900 overflow-hidden">
                                            <div className="max-h-60 overflow-y-auto">
                                                {orgsArray.map(org => (
                                                    <button
                                                        key={org.id}
                                                        onClick={() => {
                                                            setSelectedOrg(org);
                                                            setSearchTerm("");
                                                            toast.success(`Selected organization: ${org.name}`);
                                                        }}
                                                        className="flex w-full items-center gap-3 border-b border-gray-50 px-4 py-3 text-left hover:bg-indigo-50 dark:border-white/5 dark:hover:bg-white/5 transition-colors"
                                                    >
                                                        <div className="h-10 w-10 overflow-hidden rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                                                            {org.logo ? (
                                                                <img src={org.logo} alt="" className="h-full w-full object-cover" />
                                                            ) : (
                                                                <Building2 className="h-5 w-5 text-gray-400" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-medium text-gray-900 dark:text-white truncate">{org.name}</div>
                                                            <div className="text-xs text-gray-500">{org.owner?.email}</div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            {selectedSchool && selectionMode === "SCHOOL" && (
                                <div className="mt-6 space-y-4 rounded-xl bg-gray-50 p-4 dark:bg-white/5">
                                    <div className="flex items-center gap-4 border-b border-gray-200 pb-4 dark:border-white/10">
                                        <div className="h-14 w-14 overflow-hidden rounded-xl border-4 border-white bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                                            {selectedSchool.schoolLogo ? (
                                                <img src={selectedSchool.schoolLogo} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-gray-400">
                                                    <Building2 className="h-6 w-6" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">{selectedSchool.schoolName}</h3>
                                            <p className="text-sm text-indigo-500 font-medium">{selectedSchool.schoolCode}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500">Active Users</p>
                                            <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedSchool.count.currentUsers || 0}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Status</p>
                                            <span className={clsx(
                                                "inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                                                selectedSchool.isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                            )}>
                                                {selectedSchool.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedOrg && selectionMode === "ORGANIZATION" && (
                                <div className="mt-6 space-y-4 rounded-xl bg-gray-50 p-4 dark:bg-white/5">
                                    <div className="flex items-center gap-4 border-b border-gray-200 pb-4 dark:border-white/10">
                                        <div className="h-14 w-14 overflow-hidden rounded-xl border-4 border-white bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                                            {selectedOrg.logo ? (
                                                <img src={selectedOrg.logo} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-gray-400">
                                                    <Building2 className="h-6 w-6" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">{selectedOrg.name}</h3>
                                            <p className="text-sm text-indigo-500 font-medium">{selectedOrg.owner?.name}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500">Total Branches</p>
                                            <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedOrg._count?.schools || 0}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Admin Email</p>
                                            <p className="text-[10px] font-semibold text-gray-900 dark:text-white truncate">{selectedOrg.owner?.email}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>

                        {selectedSchool && config && (
                            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
                                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Active Plan Model</h2>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => handleUpdateModel("MODEL_A")}
                                        className={clsx(
                                            "w-full flex items-center justify-between gap-4 p-4 rounded-xl border-2 transition-all",
                                            config.planModel === "MODEL_A"
                                                ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20"
                                                : "border-gray-100 hover:border-gray-200 dark:border-white/5 dark:hover:border-white/10"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={clsx("p-2 rounded-lg", config.planModel === "MODEL_A" ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40" : "bg-gray-100 text-gray-500 dark:bg-white/5")}>
                                                <Zap className="h-5 w-5" />
                                            </div>
                                            <div className="text-left">
                                                <div className="font-bold text-gray-900 dark:text-white">Model A</div>
                                                <div className="text-xs text-gray-500">Pay-Per-Feature + Unlimited Users</div>
                                            </div>
                                        </div>
                                        {config.planModel === "MODEL_A" && (
                                            <CheckCircle2 className="h-6 w-6 text-indigo-600" />
                                        )}
                                    </button>

                                    <button
                                        onClick={() => handleUpdateModel("MODEL_B")}
                                        className={clsx(
                                            "w-full flex items-center justify-between gap-4 p-4 rounded-xl border-2 transition-all",
                                            config.planModel === "MODEL_B"
                                                ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20"
                                                : "border-gray-100 hover:border-gray-200 dark:border-white/5 dark:hover:border-white/10"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={clsx("p-2 rounded-lg", config.planModel === "MODEL_B" ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40" : "bg-gray-100 text-gray-500 dark:bg-white/5")}>
                                                <ShieldCheck className="h-5 w-5" />
                                            </div>
                                            <div className="text-left">
                                                <div className="font-bold text-gray-900 dark:text-white">Model B</div>
                                                <div className="text-xs text-gray-500">Fixed Plan + User Limit</div>
                                            </div>
                                        </div>
                                        {config.planModel === "MODEL_B" && (
                                            <CheckCircle2 className="h-6 w-6 text-indigo-600" />
                                        )}
                                    </button>

                                    {(selectedSchool.count.currentUsers / ((config?.allowedUsers || 0) + (selectedSchool.count.bonusUsers || 0) || 1)) > 0.9 && config.planModel === 'MODEL_B' && (
                                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-900/20">
                                            <div className="flex gap-3">
                                                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                                                <div>
                                                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">Near User Limit</p>
                                                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">School is at 90%+ capacity. Suggesting upgrade to Model A or increasing limits.</p>
                                                    <button
                                                        onClick={() => handleAction('SEND_REMINDER')}
                                                        className="mt-2 text-xs font-bold text-amber-800 underline dark:text-amber-200"
                                                    >
                                                        Send Upgrade Suggestion
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Right Column: Dynamic Config & Invoices */}
                    <div className="lg:col-span-2 space-y-6">
                        {!selectedSchool && !selectedOrg ? (
                            <div className="flex h-96 items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/5">
                                <div className="text-center">
                                    <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                        {selectionMode === "SCHOOL" ? "No School Selected" : "No Organization Selected"}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Please search and select {selectionMode === "SCHOOL" ? "a school" : "an organization"} to manage its subscription.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {selectionMode === "ORGANIZATION" && selectedOrg ? (
                                    /* ──────────── ORGANIZATION MODE ──────────── */
                                    <>
                                        <div className="mb-6 p-4 rounded-2xl bg-indigo-50 border border-indigo-100 dark:bg-indigo-900/10 dark:border-indigo-500/20">
                                            <div className="flex gap-3">
                                                <Info className="h-5 w-5 text-indigo-500 shrink-0" />
                                                <div>
                                                    <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-200">Organization Plan Assignment</h4>
                                                    <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1">
                                                        Assigning a plan here will apply it to the entire organization. All schools linked to this group will inherit this plan. Individual feature control is available per-school in "Individual School" mode.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900 overflow-hidden">
                                            <div className="p-6 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <ShieldCheck className="h-5 w-5 text-indigo-500" />
                                                    <h2 className="font-semibold text-gray-900 dark:text-white">Assign Membership Plan</h2>
                                                </div>
                                                <span className="text-xs font-medium text-gray-500 italic">Organization-wide</span>
                                            </div>
                                            <div className="p-6">
                                                {plansLoading ? (
                                                    <div className="flex items-center justify-center py-12">
                                                        <Loader className="" />
                                                    </div>
                                                ) : membershipPlans.length === 0 ? (
                                                    <div className="text-center py-12">
                                                        <ShieldCheck className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                                                        <p className="text-sm text-gray-500">No membership plans available. Create plans first.</p>
                                                        <Link href="/dashboard/superadmin/membership-plans" className="mt-3 inline-block text-xs font-semibold text-indigo-600 hover:underline">
                                                            Go to Membership Plans →
                                                        </Link>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {membershipPlans.map((plan) => {
                                                            const finalPrice = plan.discountedPrice || plan.price;
                                                            const isSelected = selectedPlan?.id === plan.id;
                                                            const isAssigning = orgAssignLoading && isSelected;
                                                            return (
                                                                <div
                                                                    key={plan.id}
                                                                    className={clsx(
                                                                        "rounded-xl border-2 p-5 transition-all",
                                                                        isSelected
                                                                            ? "border-indigo-300 bg-indigo-50/30 dark:bg-indigo-900/10"
                                                                            : "border-gray-200 hover:border-gray-300 dark:border-white/10 dark:hover:border-white/20"
                                                                    )}
                                                                >
                                                                    <div className="flex items-start justify-between mb-3">
                                                                        <div>
                                                                            <h3 className="font-bold text-gray-900 dark:text-white text-lg">{plan.name}</h3>
                                                                            <p className="text-xs text-gray-500 mt-1">{plan.durationDays} days duration</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="mb-4">
                                                                        <div className="flex items-baseline gap-2">
                                                                            <span className="text-2xl font-bold text-gray-900 dark:text-white">₹{finalPrice}</span>
                                                                            {plan.discountedPrice && plan.price !== plan.discountedPrice && (
                                                                                <span className="text-sm text-gray-400 line-through">₹{plan.price}</span>
                                                                            )}
                                                                        </div>
                                                                        {plan.userLimit > 0 && (
                                                                            <p className="text-xs text-gray-500 mt-1">Up to {plan.userLimit} users</p>
                                                                        )}
                                                                    </div>
                                                                    <button
                                                                        onClick={async () => {
                                                                            setSelectedPlan(plan);
                                                                            const result = await postOrgAssign("/v1/superadmin/groups/assign", {
                                                                                groupId: selectedOrg.id,
                                                                                planId: plan.id,
                                                                                durationDays: plan.durationDays,
                                                                            }, {
                                                                                autoToast: false,
                                                                                onError: (err: any) => {
                                                                                    toast.error(err?.response?.data?.message || err?.apiMessage || "Failed to assign plan");
                                                                                },
                                                                            });
                                                                            if (result) {
                                                                                toast.success(`Plan "${plan.name}" assigned to ${selectedOrg.name}`);
                                                                            }
                                                                            setSelectedPlan(null);
                                                                        }}
                                                                        disabled={isAssigning}
                                                                        className={clsx(
                                                                            "w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all",
                                                                            isAssigning
                                                                                ? "bg-indigo-400 text-white cursor-wait"
                                                                                : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95"
                                                                        )}
                                                                    >
                                                                        {isAssigning ? (
                                                                            <span className="flex items-center justify-center gap-2">
                                                                                <Loader className="" />
                                                                                Assigning...
                                                                            </span>
                                                                        ) : (
                                                                            <span className="flex items-center justify-center gap-2">
                                                                                <CreditCard className="h-4 w-4" />
                                                                                Assign to Org
                                                                            </span>
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        </section>
                                    </>
                                ) : (
                                    /* ──────────── SCHOOL MODE ──────────── */
                                    <>
                                        {/* Feature Control Table */}
                                        {config?.planModel === "MODEL_A" ? (
                                            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900 overflow-hidden">
                                                <div className="p-6 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Settings2 className="h-5 w-5 text-indigo-500" />
                                                        <h2 className="font-semibold text-gray-900 dark:text-white">Feature Access Control</h2>
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-500 italic">Pay-Per-Feature Active</span>
                                                </div>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left text-sm">
                                                        <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-white/5 dark:text-gray-300">
                                                            <tr>
                                                                <th className="px-6 py-4 font-medium">Feature</th>
                                                                <th className="px-6 py-4 font-medium">Monthly Price</th>
                                                                <th className="px-6 py-4 font-medium">Status</th>
                                                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                                            {features.map(feature => (
                                                                <tr key={feature.key} className="hover:bg-gray-50 dark:hover:bg-white/5">
                                                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{feature.name}</td>
                                                                    <td className="px-6 py-4 font-mono text-gray-600 dark:text-gray-400">₹{feature.monthlyPrice}</td>
                                                                    <td className="px-6 py-4">
                                                                        <span className={clsx(
                                                                            "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                                                                            feature.status === 'ENABLED' ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-gray-400"
                                                                        )}>
                                                                            {feature.status}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-right">
                                                                        <button
                                                                            onClick={() => handleToggleFeature(feature.key, feature.status)}
                                                                            disabled={isProcessingPayment && selectedFeature?.key === feature.key}
                                                                            className={clsx(
                                                                                "text-xs font-semibold px-3 py-1 rounded-lg transition-all",
                                                                                feature.status === 'ENABLED'
                                                                                    ? "text-red-600 hover:bg-red-50"
                                                                                    : isProcessingPayment && selectedFeature?.key === feature.key
                                                                                        ? "text-indigo-400 cursor-wait opacity-50"
                                                                                        : "text-indigo-600 hover:bg-indigo-50"
                                                                            )}
                                                                        >
                                                                            {isProcessingPayment && selectedFeature?.key === feature.key ? (
                                                                                <span className="flex items-center gap-1">
                                                                                    <Loader className="" />
                                                                                    Processing...
                                                                                </span>
                                                                            ) : feature.status === 'ENABLED' ? (
                                                                                'Disable'
                                                                            ) : (
                                                                                'Enable'
                                                                            )}
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </section>
                                        ) : (
                                            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900 overflow-hidden">
                                                <div className="p-6 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <ShieldCheck className="h-5 w-5 text-indigo-500" />
                                                        <h2 className="font-semibold text-gray-900 dark:text-white">Membership Plans</h2>
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-500 italic">Model B - Fixed Plan</span>
                                                </div>
                                                <div className="p-6">
                                                    {/* Coupon code input */}
                                                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                                        <div className="flex-1">
                                                            <label className="mb-1 block text-xs font-medium text-gray-500">
                                                                Coupon Code (optional)
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={couponCode}
                                                                onChange={(e) => setCouponCode(e.target.value.trim().toUpperCase())}
                                                                placeholder="Enter coupon code"
                                                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-gray-900 dark:text-white"
                                                            />
                                                            <p className="mt-1 text-[11px] text-gray-400">
                                                                If the coupon fully discounts the plan (100%), payment will be auto-processed
                                                                without opening Razorpay.
                                                            </p>
                                                        </div>

                                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30">
                                                            <div className="flex-1">
                                                                <p className="text-sm font-bold text-indigo-900 dark:text-indigo-100 italic">Setup Auto-Payment Mandate</p>
                                                                <p className="text-[10px] text-indigo-700 dark:text-indigo-300">Automatically renew plan on expiry via bank account/card</p>
                                                            </div>
                                                            <button
                                                                onClick={() => setIsAutoRenew(!isAutoRenew)}
                                                                className={clsx(
                                                                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
                                                                    isAutoRenew ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-700"
                                                                )}
                                                            >
                                                                <span
                                                                    className={clsx(
                                                                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                                                        isAutoRenew ? "translate-x-6" : "translate-x-1"
                                                                    )}
                                                                />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {plansLoading ? (
                                                        <div className="flex items-center justify-center py-12">
                                                            <Loader className="" />
                                                        </div>
                                                    ) : membershipPlans.length === 0 ? (
                                                        <div className="text-center py-12">
                                                            <ShieldCheck className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                                                            <p className="text-sm text-gray-500 mb-4">No membership plans available</p>
                                                            <button
                                                                onClick={() => handleUpdateModel("MODEL_A")}
                                                                className="px-6 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-all dark:bg-white/5 dark:text-white"
                                                            >
                                                                Switch to Pay-Per-Feature
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {membershipPlans.map((plan) => {
                                                                const finalPrice = plan.discountedPrice || plan.price;
                                                                const isSelected = selectedPlan?.id === plan.id;
                                                                const activeSubscription = selectedSchool?.subscription?.[0];
                                                                const isActive = activeSubscription?.planId === plan.id;

                                                                return (
                                                                    <div
                                                                        key={plan.id}
                                                                        className={clsx(
                                                                            "rounded-xl border-2 p-5 transition-all",
                                                                            isActive
                                                                                ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20"
                                                                                : isSelected
                                                                                    ? "border-indigo-300 bg-indigo-50/30 dark:bg-indigo-900/10"
                                                                                    : "border-gray-200 hover:border-gray-300 dark:border-white/10 dark:hover:border-white/20"
                                                                        )}
                                                                    >
                                                                        <div className="flex items-start justify-between mb-3">
                                                                            <div>
                                                                                <h3 className="font-bold text-gray-900 dark:text-white text-lg">{plan.name}</h3>
                                                                                <p className="text-xs text-gray-500 mt-1">{plan.durationDays} days duration</p>
                                                                            </div>
                                                                            {isActive && (
                                                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                                                    <CheckCircle2 className="h-3 w-3" />
                                                                                    Active
                                                                                </span>
                                                                            )}
                                                                        </div>

                                                                        <div className="mb-4">
                                                                            <div className="flex items-baseline gap-2">
                                                                                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                                                                    ₹{finalPrice}
                                                                                </span>
                                                                                {plan.discountedPrice && plan.price !== plan.discountedPrice && (
                                                                                    <span className="text-sm text-gray-400 line-through">₹{plan.price}</span>
                                                                                )}
                                                                            </div>
                                                                            {plan.userLimit > 0 && (
                                                                                <p className="text-xs text-gray-500 mt-1">
                                                                                    Up to {plan.userLimit} users
                                                                                </p>
                                                                            )}
                                                                        </div>

                                                                        <button
                                                                            onClick={() => {
                                                                                if (selectionMode === "ORGANIZATION" && selectedOrg) {
                                                                                    // Call organization assignment API
                                                                                    setIsProcessingPayment(true);
                                                                                    setSelectedPlan(plan);
                                                                                    postConfig("/v1/superadmin/groups/assign", {
                                                                                        groupId: selectedOrg.id,
                                                                                        planId: plan.id,
                                                                                        durationDays: plan.durationDays
                                                                                    }).then(res => {
                                                                                        toast.success(`Plan "${plan.name}" assigned to ${selectedOrg.name}`);
                                                                                        setIsProcessingPayment(false);
                                                                                        setSelectedPlan(null);
                                                                                    }).catch(err => {
                                                                                        toast.error(err?.response?.data?.message || "Failed to assign plan");
                                                                                        setIsProcessingPayment(false);
                                                                                    });
                                                                                } else {
                                                                                    handleSelectPlan(plan);
                                                                                }
                                                                            }}
                                                                            disabled={isProcessingPayment || isActive}
                                                                            className={clsx(
                                                                                "w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all",
                                                                                isActive
                                                                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-white/5"
                                                                                    : isProcessingPayment && isSelected
                                                                                        ? "bg-indigo-400 text-white cursor-wait"
                                                                                        : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95"
                                                                            )}
                                                                        >
                                                                            {isProcessingPayment && isSelected ? (
                                                                                <span className="flex items-center justify-center gap-2">
                                                                                    <Loader className="" />
                                                                                    Processing...
                                                                                </span>
                                                                            ) : isActive ? (
                                                                                "Currently Active"
                                                                            ) : (
                                                                                <span className="flex items-center justify-center gap-2">
                                                                                    <CreditCard className="h-4 w-4" />
                                                                                    {selectionMode === "ORGANIZATION" ? "Assign to Org" : "Assign Plan"}
                                                                                </span>
                                                                            )}
                                                                        </button>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/10">
                                                        <button
                                                            onClick={() => handleUpdateModel("MODEL_A")}
                                                            className="w-full px-6 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-all dark:bg-white/5 dark:text-white"
                                                        >
                                                            Switch to Pay-Per-Feature Model
                                                        </button>
                                                    </div>
                                                </div>
                                            </section>
                                        )}

                                        {/* Usage & Rules */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="font-semibold flex items-center gap-2">
                                                        <Users className="h-5 w-5 text-indigo-500" />
                                                        Usage & Limits
                                                    </h3>
                                                    <button
                                                        onClick={() => handleAction('WAIVE_OVERAGE')}
                                                        className="text-[10px] uppercase tracking-wider font-bold text-indigo-500 hover:underline"
                                                    >
                                                        Waive Overages
                                                    </button>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-500">Active Users</span>
                                                        <span className="font-bold">
                                                            {selectedSchool?.count.currentUsers} /{" "}
                                                            {(config?.allowedUsers || 0) +
                                                                (selectedSchool?.count.bonusUsers || 0)}
                                                        </span>
                                                    </div>
                                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden dark:bg-white/5">
                                                        <div
                                                            className={clsx(
                                                                "h-full transition-all",
                                                                ((selectedSchool?.count.currentUsers ?? 0) / ((config?.allowedUsers || 0) + (selectedSchool?.count.bonusUsers || 0) || 1)) > 0.9 ? "bg-amber-500" : "bg-indigo-500"
                                                            )}
                                                            style={{ width: `${Math.min(((selectedSchool?.count.currentUsers ?? 0) / ((config?.allowedUsers || 0) + (selectedSchool?.count.bonusUsers || 0) || 1)) * 100, 100)}%` }}
                                                        />
                                                    </div>
                                                    {/* Base vs Extra seats indicator for MODEL_B */}
                                                    {config?.planModel === "MODEL_B" && (
                                                        <div className="mt-2 text-xs text-gray-500 space-y-1">
                                                            {(() => {
                                                                const activeSub = selectedSchool?.subscription?.[0] as any;
                                                                const frozenUserLimit =
                                                                    activeSub?.userLimit ?? config.allowedUsers;
                                                                const extraSeats = Math.max(
                                                                    0,
                                                                    (config.allowedUsers || 0) - (frozenUserLimit || 0)
                                                                );
                                                                return (
                                                                    <>
                                                                        <p>
                                                                            Base seats:{" "}
                                                                            <span className="font-semibold">
                                                                                {frozenUserLimit || 0}
                                                                            </span>
                                                                            , Extra seats:{" "}
                                                                            <span className="font-semibold">
                                                                                {extraSeats}
                                                                            </span>
                                                                        </p>
                                                                    </>
                                                                );
                                                            })()}
                                                        </div>
                                                    )}

                                                    <div className="pt-2">
                                                        <label className="text-xs font-medium text-gray-500 block mb-1">Adjust Allowed Users</label>
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="number"
                                                                value={config?.allowedUsers}
                                                                onChange={(e) => setConfig({ ...config!, allowedUsers: parseInt(e.target.value) })}
                                                                className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-gray-900"
                                                            />
                                                            <button
                                                                onClick={handleSaveGeneralConfig}
                                                                className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold"
                                                            >
                                                                Apply
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </section>

                                            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
                                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                                    <Hammer className="h-5 w-5 text-indigo-500" />
                                                    Rules & Automation
                                                </h3>
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-sm font-medium">Read-Only Mode</p>
                                                            <p className="text-[10px] text-gray-500">After grace period ends</p>
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                const newValue = !config?.isReadOnlyAfterGrace;
                                                                setConfig({ ...config!, isReadOnlyAfterGrace: newValue });
                                                                toast.success(`Read-Only Mode ${newValue ? 'enabled' : 'disabled'}. Don't forget to save!`);
                                                            }}
                                                            className={clsx(
                                                                "relative inline-flex h-5 w-10 items-center rounded-full transition-colors",
                                                                config?.isReadOnlyAfterGrace ? "bg-indigo-600" : "bg-gray-200 dark:bg-white/10"
                                                            )}
                                                        >
                                                            <span className={clsx("inline-block h-3 w-3 transform rounded-full bg-white transition-transform", config?.isReadOnlyAfterGrace ? "translate-x-6" : "translate-x-1")} />
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-sm font-medium">Auto-Suspend</p>
                                                            <p className="text-[10px] text-gray-500">Immediate action on expiry</p>
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                const newValue = !config?.autoSuspendAfterGrace;
                                                                setConfig({ ...config!, autoSuspendAfterGrace: newValue });
                                                                toast.success(`Auto-Suspend ${newValue ? 'enabled' : 'disabled'}. Don't forget to save!`);
                                                            }}
                                                            className={clsx(
                                                                "relative inline-flex h-5 w-10 items-center rounded-full transition-colors",
                                                                config?.autoSuspendAfterGrace ? "bg-red-600" : "bg-gray-200 dark:bg-white/10"
                                                            )}
                                                        >
                                                            <span className={clsx("inline-block h-3 w-3 transform rounded-full bg-white transition-transform", config?.autoSuspendAfterGrace ? "translate-x-6" : "translate-x-1")} />
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={handleSaveGeneralConfig}
                                                        className="w-full mt-2 bg-gray-900 text-white rounded-xl py-2.5 text-xs font-bold hover:bg-gray-800 transition-all dark:bg-indigo-600 dark:hover:bg-indigo-500"
                                                    >
                                                        Save Automation Rules
                                                    </button>
                                                </div>
                                            </section>
                                        </div>

                                        {/* Invoices */}
                                        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900 overflow-hidden">
                                            <div className="p-6 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <History className="h-5 w-5 text-indigo-500" />
                                                    <h2 className="font-semibold text-gray-900 dark:text-white">Billing History</h2>
                                                </div>
                                                <button
                                                    onClick={() => handleAction('SEND_REMINDER')}
                                                    className="text-xs font-semibold text-indigo-600 flex items-center gap-1"
                                                >
                                                    <RefreshCcw className="h-3 w-3" />
                                                    Resend Last Invoice
                                                </button>
                                            </div>
                                            {invoices.length === 0 ? (
                                                <div className="py-12 text-center">
                                                    <Receipt className="mx-auto h-12 w-12 text-gray-200 mb-3" />
                                                    <p className="text-sm text-gray-500">No generated invoices yet.</p>
                                                </div>
                                            ) : (
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left text-sm">
                                                        <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500 dark:bg-white/5">
                                                            <tr>
                                                                <th className="px-6 py-4">Date</th>
                                                                <th className="px-6 py-4">Invoice #</th>
                                                                <th className="px-6 py-4">Amount</th>
                                                                <th className="px-6 py-4">Status</th>
                                                                <th className="px-6 py-4 text-right">Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                                            {invoices.map(inv => (
                                                                <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                                                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                                                        {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : '-'}
                                                                    </td>
                                                                    <td className="px-6 py-4 font-medium">{inv.invoiceNumber || 'INV-' + inv.id.slice(-6)}</td>
                                                                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">₹{inv.amount}</td>
                                                                    <td className="px-6 py-4">
                                                                        <span className={clsx(
                                                                            "inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                                                                            inv.status === 'COMPLETED' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                                                                        )}>
                                                                            {inv.status}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-right space-x-2">
                                                                        {inv.invoiceUrl && (
                                                                            <button
                                                                                onClick={() => window.open(inv.invoiceUrl, '_blank')}
                                                                                className="text-indigo-600 border border-indigo-200 px-3 py-1 rounded-lg text-[10px] font-bold hover:bg-indigo-50 dark:border-indigo-500/40 dark:hover:bg-indigo-500/10"
                                                                            >
                                                                                Download
                                                                            </button>
                                                                        )}
                                                                        {inv.status !== 'COMPLETED' ? (
                                                                            <button
                                                                                onClick={() => handleAction('MARK_PAID', inv.id)}
                                                                                className="text-white bg-indigo-600 px-3 py-1 rounded-lg text-[10px] font-bold shadow-sm"
                                                                            >
                                                                                Mark Paid
                                                                            </button>
                                                                        ) : (
                                                                            <span className="text-emerald-600 font-bold text-[10px]">VERIFIED</span>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </section>
                                    </>
                                    /* end school mode */
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Global Settings Modal */}
            {isGlobalModalOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-gray-900 border dark:border-white/10 overflow-hidden">
                        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Global Automation & Defaults</h3>
                            <button onClick={() => setIsGlobalModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Usage & Overage Defaults</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-gray-500">Price per Extra User (₹)</label>
                                        <input
                                            type="number"
                                            defaultValue={JSON.parse(globalSettings.find(s => s.key === 'DEFAULT_EXTRA_USER_PRICE')?.value || '5')}
                                            id="global-extra-user-price"
                                            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-indigo-500/50 dark:bg-white/5"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-gray-500">Default Allowed Users</label>
                                        <input
                                            type="number"
                                            defaultValue={JSON.parse(globalSettings.find(s => s.key === 'DEFAULT_ALLOWED_USERS')?.value || '300')}
                                            id="global-allowed-users"
                                            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-indigo-500/50 dark:bg-white/5"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-white/10">
                                {/* Feature Catalog — link to dedicated page */}
                                <div className="mt-6 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                                            Feature Catalog
                                        </h4>
                                    </div>

                                    <a
                                        href="/dashboard/superadmin/feature-catalog"
                                        className="flex items-center justify-between rounded-xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-3 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors group"
                                    >
                                        <div>
                                            <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">Open Feature Catalog Editor</p>
                                            <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-0.5">
                                                Auto-imports features from the admin sidebar. Edit prices, add custom features & sub-features.
                                            </p>
                                        </div>
                                        <ChevronDown className="w-4 h-4 text-indigo-500 -rotate-90 group-hover:translate-x-0.5 transition-transform" />
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-gray-100 p-6 dark:border-gray-800 flex justify-end gap-3">
                            <button onClick={() => setIsGlobalModalOpen(false)} className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400">Cancel</button>
                            <button
                                onClick={() => {
                                    const extraPrice = (document.getElementById('global-extra-user-price') as HTMLInputElement).value;
                                    const allowedUsers = (document.getElementById('global-allowed-users') as HTMLInputElement).value;
                                    const updates: any[] = [
                                        { key: 'DEFAULT_EXTRA_USER_PRICE', value: parseFloat(extraPrice) },
                                        { key: 'DEFAULT_ALLOWED_USERS', value: parseInt(allowedUsers) },
                                    ];
                                    handleSaveGlobalSettings(updates);
                                }}
                                className="rounded-xl bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
