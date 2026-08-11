import Head from "next/head";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { AlertCircle, CalendarDays, ChevronDown, ChevronUp, Check, Crown, Layers, Puzzle, Shield, Sparkles, Tag } from 'lucide-react';
import toast from "react-hot-toast";
import client from "@/lib/api/client";
import { useAuth } from "@/lib/context/AuthContext";
import { Loader } from '@/components/ui/feedback/Loader';

type PlanModel = "MODEL_A" | "MODEL_B";

type FeatureStatus = "ENABLED" | "DISABLED";

type FeatureConfig = {
  key: string;
  name: string;
  status: FeatureStatus;
  monthlyPrice: number;
  activatedOn: string | null;
  isMandatory: boolean;
};

type Plan = {
  id: string;
  name: string;
  price: number;
  discountedPrice?: number | null;
  durationDays: number;
  userLimit: number;
};

type AdminSubscriptionData = {
  status: string;
  isInGrace: boolean;
  planModel: PlanModel;
  allowedUsers: number;
  activeUsersCount: number;
  endDate: string | null;
  planName: string | null;
  planId: string | null;
  extraUserPrice: number;
  billingPeriod?: string;
  remainingDays?: number;
};

type BillingPeriod = "MONTH" | "YEAR" | "THREE_YEARS";

// Static human-readable descriptions for each feature module key
const FEATURE_DESCRIPTIONS: Record<string, { description: string; capabilities: string[] }> = {
  people: {
    description: "Manage all student and staff profiles, attendance, roles, and HR workflows across your campus.",
    capabilities: [
      "Student enrollment & profile management",
      "Staff & teacher records",
      "Attendance tracking (daily & period-wise)",
      "Role & permission management",
      "Parent portal access",
      "Biometric & RFID integration",
    ],
  },
  academics: {
    description: "The complete academic engine — timetables, subjects, exams, grading, and progress reports.",
    capabilities: [
      "Timetable & schedule builder",
      "Subject & curriculum management",
      "Exam scheduling & mark entry",
      "Report cards & grade analytics",
      "Assignment & homework tracking",
      "Syllabus completion tracking",
    ],
  },
  operations: {
    description: "Day-to-day operational workflows including finance, inventory, and campus management.",
    capabilities: [
      "Fee collection & receipts",
      "Expense & budget tracking",
      "Inventory & asset management",
      "Transport route management",
      "Hostel & accommodation records",
      "Vendor & procurement management",
    ],
  },
  communication: {
    description: "Unified communication hub for announcements, notices, SMS, email, and in-app messaging.",
    capabilities: [
      "Bulk SMS & email notifications",
      "Notice board & announcements",
      "Parent-teacher messaging",
      "Event & circular management",
      "Push notification broadcasts",
      "Emergency alert system",
    ],
  },
  management: {
    description: "Administrative controls for admissions, certificates, library, and campus governance.",
    capabilities: [
      "Online admission workflows",
      "ID card & certificate generation",
      "Library catalogue & issue tracking",
      "Alumni records & communication",
      "Audit logs & compliance reports",
      "Multi-branch / campus management",
    ],
  },
  reports_documents: {
    description: "Comprehensive reporting suite and document generation engine — analytics, exports, certificates, and bulk printing.",
    capabilities: [
      "Reports & analytics dashboard (attendance, finance, transport, HR)",
      "Export reports to PDF, Excel, and CSV",
      "Smart document & certificate generation",
      "Bulk document printing for entire classes",
      "Customisable document templates",
      "QR-code verified document authenticity",
      "Issuance logs & audit trail",
    ],
  },
};

export default function AdminMembershipPage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeModel, setActiveModel] = useState<PlanModel>("MODEL_A");
  const [features, setFeatures] = useState<FeatureConfig[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);

  const [subData, setSubData] = useState<AdminSubscriptionData | null>(null);
  const [showUserLimitModal, setShowUserLimitModal] = useState(false);
  const [purchaseQuantity, setPurchaseQuantity] = useState(50);
  const [isProcessingLimit, setIsProcessingLimit] = useState(false);

  const [isProcessingFeature, setIsProcessingFeature] = useState(false);
  const [isProcessingPlan, setIsProcessingPlan] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [featureBillingPeriod, setFeatureBillingPeriod] =
    useState<BillingPeriod>("YEAR");
  const [planBillingPeriod, setPlanBillingPeriod] =
    useState<BillingPeriod>("YEAR");

  const [featureCatalog, setFeatureCatalog] = useState<any[]>([]);
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);
  const [activeCouponFeature, setActiveCouponFeature] = useState<string | null>(null);

  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [pendingPlan, setPendingPlan] = useState<Plan | null>(null);
  const [pendingOrder, setPendingOrder] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.schoolId) return;

      setLoading(true);
      setError(null);

      try {
        const [statusRes, featuresRes, plansRes] = await Promise.all([
          client.get(`/v1/dashboard/admin-subscription-status?t=${Date.now()}`),
          client.get("/v1/dashboard/admin-features"),
          client.get("/v1/superadmin/membership-plans"),
        ]);

        const statusPayload = statusRes.data?.data;
        setSubData(statusPayload);
        const planModel: PlanModel =
          (statusPayload?.planModel as PlanModel) ?? "MODEL_A";

        setActiveModel(planModel);
        setFeatures(featuresRes.data || []);
        setPlans(plansRes.data?.data || []);
      } catch (err: any) {
        console.error("Failed to load membership data", err);
        setError(err?.message || "Failed to load membership data");
        toast.error("Failed to load membership details");
      } finally {
        setLoading(false);
      }

      // Feature catalog is best-effort — a 403 or any error just means
      // cards fall back to static descriptions without breaking the page.
      try {
        const settingsRes = await client.get("/v1/superadmin/subscription-control/global-settings");
        const settingsArr: { key: string; value: string }[] = settingsRes.data?.data || [];
        const catalogSetting = settingsArr.find((s) => s.key === "FEATURE_CATALOG");
        if (catalogSetting) {
          try { setFeatureCatalog(JSON.parse(catalogSetting.value)); } catch { /* malformed JSON */ }
        }
      } catch { /* no-op — admin may not have access; static descriptions are used instead */ }
    };

    loadData();
  }, [user?.schoolId]);

  const refreshSubscriptionStatus = async () => {
    try {
      const res = await client.get(`/v1/dashboard/admin-subscription-status?t=${Date.now()}`);
      if (res.data.success) {
        setSubData(res.data.data);
        if (res.data.data.planModel) {
          setActiveModel(res.data.data.planModel);
        }
      }
    } catch (err) {
      console.error("Failed to refresh status", err);
    }
  };

  const handlePurchaseUserLimit = async () => {
    if (!user?.schoolId || isProcessingLimit) return;
    setIsProcessingLimit(true);

    let scriptElement: HTMLScriptElement | null = null;

    const openRazorpayModal = (orderRes: any) => {
      const anyWindow = window as any;
      if (!anyWindow.Razorpay) {
        setIsProcessingLimit(false);
        toast.error("Payment gateway not available.");
        return;
      }

      const options = {
        key: orderRes.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderRes.amount,
        currency: orderRes.currency || "INR",
        name: "LearnXChain",
        description: `Purchase ${orderRes.quantity} User Limits`,
        order_id: orderRes.orderId,
        handler: async (response: any) => {
          try {
            await client.post("/v1/finance/subscription/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              schoolId: user.schoolId,
              extraUserQuantity: orderRes.quantity,
            });
            toast.success("User limits increased successfully!");
            setShowUserLimitModal(false);
            refreshSubscriptionStatus();
          } catch (err: any) {
            toast.error(err?.message || "Verification failed");
          } finally {
            setIsProcessingLimit(false);
          }
        },
        prefill: { name: user?.name || "" },
        theme: { color: "#6366f1" },
        modal: { ondismiss: () => setIsProcessingLimit(false) },
      };

      const rz = new anyWindow.Razorpay(options);
      rz.open();
    };

    try {
      const res = await client.post("/v1/finance/subscription/create-user-limit-order", {
        schoolId: user.schoolId,
        quantity: purchaseQuantity,
      });

      const order = res.data;
      const anyWindow = window as any;
      if (anyWindow.Razorpay) {
        openRazorpayModal(order);
        return;
      }

      scriptElement = document.createElement("script");
      scriptElement.src = "https://checkout.razorpay.com/v1/checkout.js";
      scriptElement.onload = () => openRazorpayModal(order);
      document.body.appendChild(scriptElement);
    } catch (err: any) {
      toast.error(err?.message || "Failed to initiate payment");
      setIsProcessingLimit(false);
    }
  };

  const handleSelectModel = (model: PlanModel) => {
    setActiveModel(model);
  };

  const handleToggleFeature = async (feature: FeatureConfig) => {
    if (!user?.schoolId) {
      toast.error("School information not available");
      return;
    }

    if (feature.status === "ENABLED") {
      toast("This feature is already active for your school.", {
        icon: "ℹ️",
      } as any);
      return;
    }

    if (feature.monthlyPrice <= 0) {
      try {
        await client.patch(
          `/v1/superadmin/subscription-control/${user.schoolId}/features`,
          {
            featureKey: feature.key,
            status: "ENABLED",
          }
        );
        toast.success(`"${feature.name}" enabled successfully`);

        const refreshed = await client.get<FeatureConfig[]>(
          `/v1/superadmin/subscription-control/${user.schoolId}/features`
        );
        setFeatures(refreshed.data || []);
      } catch (err: any) {
        console.error("Failed to enable feature", err);
        toast.error("Failed to enable feature");
      }
      return;
    }

    await handleActivateFeatureWithPayment(feature);
  };

  const handleActivateFeatureWithPayment = async (feature: FeatureConfig) => {
    if (!user?.schoolId) {
      toast.error("School information not available");
      return;
    }

    if (isProcessingFeature) return;

    setIsProcessingFeature(true);

    let scriptElement: HTMLScriptElement | null = null;

    const openRazorpayModal = (orderRes: any) => {
      const anyWindow = window as any;

      if (!anyWindow.Razorpay) {
        setIsProcessingFeature(false);
        toast.error("Payment gateway not available. Please refresh the page.");
        return;
      }

      const options = {
        key: orderRes.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderRes.amount,
        currency: orderRes.currency || "INR",
        name: "LearnXChain",
        description: `${feature.name} Feature - ${user?.name || ""}`,
        order_id: orderRes.orderId,
        handler: async (response: any) => {
          try {
            if (
              !response.razorpay_order_id ||
              !response.razorpay_payment_id ||
              !response.razorpay_signature
            ) {
              toast.error("Invalid payment response");
              setIsProcessingFeature(false);
              return;
            }

            const verifyRes = await client.post(
              "/v1/finance/subscription/verify-payment",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                schoolId: user.schoolId,
                featureKey: feature.key,
                couponCode: couponCode || undefined,
              }
            );

            if (verifyRes?.data) {
              toast.success(
                `Feature "${feature.name}" activated successfully!`
              );
              refreshSubscriptionStatus();

              const refreshed = await client.get<FeatureConfig[]>(
                `/v1/superadmin/subscription-control/${user.schoolId}/features`
              );
              setFeatures(refreshed.data || []);

              window.dispatchEvent(new CustomEvent("featuresUpdated"));
            } else {
              toast.error("Payment verification failed");
            }
          } catch (err: any) {
            console.error("Feature payment verification error", err);
            toast.error(err?.message || "Payment verification failed");
          } finally {
            setIsProcessingFeature(false);
          }
        },
        prefill: {
          name: user?.name || "",
        },
        theme: {
          color: "#6366f1",
        },
        modal: {
          ondismiss: () => {
            setIsProcessingFeature(false);
          },
        },
      };

      try {
        const rz = new anyWindow.Razorpay(options);
        rz.open();
      } catch (err: any) {
        console.error("Failed to open Razorpay modal", err);
        setIsProcessingFeature(false);
        toast.error(err?.message || "Failed to open payment modal");
      }
    };

    try {
      const catalogEntry = featureCatalog.find(
        (c: any) => c.key?.toLowerCase() === feature.key?.toLowerCase()
      );

      const billingAmount = featureBillingPeriod === "THREE_YEARS"
        ? (catalogEntry?.threeYearlyPrice || feature.monthlyPrice * 30)
        : featureBillingPeriod === "YEAR"
          ? (catalogEntry?.yearlyPrice || feature.monthlyPrice * 10)
          : feature.monthlyPrice;

      const orderRes = await client.post(
        "/v1/finance/subscription/create-feature-order",
        {
          schoolId: user.schoolId,
          featureKey: feature.key,
          featureName: feature.name,
          amount: billingAmount,
          billingPeriod: featureBillingPeriod,
          couponCode: couponCode || undefined,
        }
      );

      const order = orderRes.data;

      if (order?.zeroAmount) {
        toast.success(
          `Feature "${feature.name}" activated successfully${couponCode ? " with coupon applied" : ""
          }!`
        );
        refreshSubscriptionStatus();

        const refreshed = await client.get<FeatureConfig[]>(
          `/v1/superadmin/subscription-control/${user.schoolId}/features`
        );
        setFeatures(refreshed.data || []);

        window.dispatchEvent(new CustomEvent("featuresUpdated"));
        setIsProcessingFeature(false);
        setCouponCode("");
        return;
      }

      if (!order || !order.orderId) {
        setIsProcessingFeature(false);
        toast.error("Invalid order response. Please try again.");
        return;
      }

      const anyWindow = window as any;
      if (anyWindow.Razorpay) {
        openRazorpayModal(order);
        return;
      }

      scriptElement = document.createElement("script");
      scriptElement.src = "https://checkout.razorpay.com/v1/checkout.js";
      scriptElement.id = "razorpay-checkout-script";

      scriptElement.onload = () => {
        openRazorpayModal(order);
      };

      scriptElement.onerror = () => {
        setIsProcessingFeature(false);
        if (scriptElement && scriptElement.parentNode) {
          scriptElement.parentNode.removeChild(scriptElement);
        }
        toast.error(
          "Failed to load payment gateway. Please check your internet connection."
        );
      };

      const existingScript = document.getElementById(
        "razorpay-checkout-script"
      );
      if (existingScript) {
        existingScript.remove();
      }

      document.body.appendChild(scriptElement);
    } catch (err: any) {
      console.error("Failed to initiate feature payment", err);
      setIsProcessingFeature(false);
      if (scriptElement && scriptElement.parentNode) {
        scriptElement.parentNode.removeChild(scriptElement);
      }
      toast.error(err?.message || "Failed to initiate payment");
    }
  };
  const openRazorpayModal = (orderRes: any, plan: Plan) => {
    const anyWindow = window as any;
    if (!anyWindow.Razorpay) {
      setIsProcessingPlan(false);
      toast.error("Payment gateway not available. Please refresh the page.");
      return;
    }

    const options = {
      key: orderRes.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: orderRes.amount,
      currency: orderRes.currency || "INR",
      name: "LearnXChain",
      description: `${plan.name} Plan - ${user?.name || ""}`,
      order_id: orderRes.orderId,
      handler: async (response: any) => {
        try {
          const verifyRes = await client.post(
            "/v1/finance/subscription/verify-payment",
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              schoolId: user?.schoolId,
              planId: plan.id,
              couponCode: couponCode || undefined,
              billingPeriod: planBillingPeriod,
            }
          );

          if (verifyRes?.data?.subscription) {
            toast.success(`Plan "${plan.name}" activated successfully!`);
            refreshSubscriptionStatus();
            setActiveModel("MODEL_B");
            setCouponCode("");
          } else {
            toast.error("Payment verification failed");
          }
        } catch (err: any) {
          toast.error(err?.message || "Payment verification failed");
        } finally {
          setIsProcessingPlan(false);
        }
      },
      prefill: { name: user?.name || "" },
      theme: { color: "#059669" },
      modal: { ondismiss: () => setIsProcessingPlan(false) },
    };

    const rz = new anyWindow.Razorpay(options);
    rz.open();
  };

  const handleConfirmPayment = () => {
    if (pendingOrder && pendingPlan) {
      openRazorpayModal(pendingOrder, pendingPlan);
      setShowSummaryModal(false);
    }
  };

  const handlePurchasePlan = async (plan: Plan) => {
    if (!user?.schoolId) {
      toast.error("School information not available");
      return;
    }

    if (isProcessingPlan) return;
    setIsProcessingPlan(true);

    let scriptElement: HTMLScriptElement | null = null;

    try {
      const orderRes = await client.post(
        "/v1/finance/subscription/create-plan-order",
        {
          schoolId: user.schoolId,
          planId: plan.id,
          couponCode: couponCode || undefined,
          billingPeriod: planBillingPeriod,
        }
      );

      const order = orderRes.data;

      if (order?.zeroAmount) {
        toast.success(`Plan "${plan.name}" activated successfully!`);
        refreshSubscriptionStatus();
        setActiveModel("MODEL_B");
        setCouponCode("");
        setIsProcessingPlan(false);
        return;
      }

      if (!order || !order.orderId) {
        setIsProcessingPlan(false);
        toast.error("Invalid order response.");
        return;
      }

      setPendingPlan(plan);
      setPendingOrder(order);
      setSummaryData(order.breakdown);
      setShowSummaryModal(true);

      const anyWindow = window as any;
      if (!anyWindow.Razorpay) {
        scriptElement = document.createElement("script");
        scriptElement.src = "https://checkout.razorpay.com/v1/checkout.js";
        scriptElement.id = "razorpay-checkout-script";
        document.body.appendChild(scriptElement);
      }
    } catch (err: any) {
      console.error(err);
      setIsProcessingPlan(false);
      toast.error(err?.message || "Failed to initiate payment");
    }
  };

  const renderModelToggle = () => (
    <div className="inline-flex rounded-full border border-gray-200 bg-white p-1 text-xs shadow-sm dark:border-white/10 dark:bg-gray-900">
      <button
        type="button"
        onClick={() => handleSelectModel("MODEL_A")}
        className={`flex items-center gap-1 rounded-full px-3 py-1 font-medium transition ${activeModel === "MODEL_A"
          ? "bg-indigo-600 text-white shadow-sm"
          : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
          }`}
      >
        <Puzzle className="h-3.5 w-3.5" />
        Pay‑Per‑Feature
      </button>
      <button
        type="button"
        onClick={() => handleSelectModel("MODEL_B")}
        className={`ml-1 flex items-center gap-1 rounded-full px-3 py-1 font-medium transition ${activeModel === "MODEL_B"
          ? "bg-emerald-600 text-white shadow-sm"
          : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
          }`}
      >
        <Layers className="h-3.5 w-3.5" />
        Fixed Plan
      </button>
    </div>
  );

  return (
    <>
      <Head>
        <title>Membership & Billing - Admin | LearnXChain</title>
      </Head>
      <DashboardLayout role="admin">
        <div className="space-y-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
                Membership & Billing
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Choose whether you want to pay only for specific modules or unlock
                everything in a single plan. Complete payments yourself and start
                immediately.
              </p>
            </div>
            {renderModelToggle()}
          </div>

          {loading ? (
            <div className="flex items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 p-10 dark:border-white/10 dark:bg-gray-900/60">
              <Loader size="lg" />
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                Loading membership options...
              </span>
            </div>
          ) : error ? (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/70 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-950/20 dark:text-red-200">
              <AlertCircle className="mt-0.5 h-4 w-4" />
              <div>
                <p className="font-medium">Unable to load membership details</p>
                <p className="mt-1 text-xs opacity-80">
                  {error}. Please refresh the page or contact your superadmin if
                  the issue persists.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-6">
                {/* ── Expired Plan Warning Banner ── */}
                {subData && (subData.status === "EXPIRED_AFTER_GRACE" || subData.status === "NONE") && subData.planName && (
                  <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4 shadow-sm dark:border-red-500/30 dark:bg-red-950/20">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500 dark:text-red-400" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                          Your <span className="font-bold">{subData.planName}</span> subscription has expired
                        </p>
                        <p className="mt-1 text-xs text-red-600/80 dark:text-red-300/70">
                          {subData.endDate
                            ? `Expired on ${new Date(subData.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}. `
                            : ""}
                          Renew your plan below to restore full access immediately.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Active Plan Detail Card */}
                {subData && subData.status === "ACTIVE" && (
                  <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-gray-900/60">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                          <Crown className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">
                            {subData.planName || "Active Plan"}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <span>Expires: {subData.endDate ? new Date(subData.endDate).toLocaleDateString() : "N/A"}</span>
                            {subData.endDate && (
                              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                                {Math.ceil((new Date(subData.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 sm:items-end">
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">User Limit</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-gray-50">
                              {subData.activeUsersCount} / {subData.allowedUsers}
                            </p>
                          </div>
                          <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                            <div
                              className={`h-full bg-indigo-500 transition-all ${(subData.activeUsersCount / subData.allowedUsers) > 0.9 ? 'bg-red-500' : ''
                                }`}
                              style={{ width: `${Math.min(100, (subData.activeUsersCount / subData.allowedUsers) * 100)}%` }}
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => setShowUserLimitModal(true)}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          + Add extra user limit
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Overview cards */}
                <div className="grid gap-4 md:grid-cols-2">
                  {/* MODEL A card */}
                  <button
                    type="button"
                    onClick={() => handleSelectModel("MODEL_A")}
                    className={`relative w-full overflow-hidden rounded-2xl border p-5 text-left shadow-sm transition hover:shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${activeModel === "MODEL_A"
                      ? "border-indigo-300 bg-indigo-50/70 dark:border-indigo-500/40 dark:bg-indigo-950/30"
                      : "border-gray-200 bg-white hover:border-indigo-200 dark:border-white/10 dark:bg-gray-900/70 dark:hover:border-indigo-500/30"
                      }`}
                  >
                    <div className="absolute inset-x-0 -top-24 h-48 bg-gradient-to-b from-indigo-400/10 to-transparent blur-3xl" />
                    <div className="relative space-y-3">
                      <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-indigo-700 shadow-sm dark:bg-indigo-950/80 dark:text-indigo-100">
                        <Puzzle className="h-3.5 w-3.5" />
                        <span>MODEL A • Pay‑Per‑Feature</span>
                      </div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                        Start lean, pay only for the modules you use
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Enable premium modules like Fees, Transport, AI Reports and
                        more as your school grows. Billing is per‑feature, with
                        unlimited users.
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-200">
                        <li>• Unlimited users, feature‑based billing</li>
                        <li>• Turn modules on / off as your needs grow</li>
                        <li>• Perfect for pilots or smaller campuses</li>
                      </ul>
                      <div className="mt-4 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleSelectModel("MODEL_A")}
                          className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-500/60 ${activeModel === "MODEL_A"
                            ? "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700"
                            : "bg-white text-indigo-700 shadow-sm hover:bg-indigo-50 dark:bg-gray-800 dark:text-indigo-200 dark:hover:bg-gray-700"
                            }`}
                        >
                          {activeModel === "MODEL_A" ? (
                            <>
                              <Check className="mr-1.5 h-4 w-4" />
                              Selected
                            </>
                          ) : (
                            "Switch to Pay‑Per‑Feature"
                          )}
                        </button>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          You can activate individual modules and pay for each.
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* MODEL B card */}
                  <button
                    type="button"
                    onClick={() => handleSelectModel("MODEL_B")}
                    className={`relative w-full overflow-hidden rounded-2xl border p-5 text-left shadow-sm transition hover:shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${activeModel === "MODEL_B"
                      ? "border-emerald-300 bg-emerald-50/70 dark:border-emerald-500/40 dark:bg-emerald-950/25"
                      : "border-gray-200 bg-white hover:border-emerald-200 dark:border-white/10 dark:bg-gray-900/70 dark:hover:border-emerald-500/30"
                      }`}
                  >
                    <div className="absolute inset-x-0 -top-24 h-48 bg-gradient-to-b from-emerald-400/10 to-transparent blur-3xl" />
                    <div className="relative space-y-3">
                      <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-emerald-700 shadow-sm dark:bg-emerald-950/80 dark:text-emerald-100">
                        <Layers className="h-3.5 w-3.5" />
                        <span>MODEL B • Fixed Plan</span>
                      </div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                        All key modules bundled in one predictable plan
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Unlock all core features with a clear user limit. Keep
                        billing predictable while you scale your campus.
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-200">
                        <li>• All core modules included in one plan</li>
                        <li>• User‑based pricing with clear limits</li>
                        <li>• Grace period and automation controls</li>
                      </ul>
                      <div className="mt-4 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleSelectModel("MODEL_B")}
                          className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-500/60 ${activeModel === "MODEL_B"
                            ? "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
                            : "bg-white text-emerald-700 shadow-sm hover:bg-emerald-50 dark:bg-gray-800 dark:text-emerald-200 dark:hover:bg-gray-700"
                            }`}
                        >
                          {activeModel === "MODEL_B" ? (
                            <>
                              <Check className="mr-1.5 h-4 w-4" />
                              Selected
                            </>
                          ) : (
                            "Switch to Fixed Plan"
                          )}
                        </button>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Choose a plan, apply coupon, pay, and start instantly.
                        </span>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Detail sections */}
                {activeModel === "MODEL_A" ? (
                  <section className="space-y-4 rounded-2xl border border-indigo-200 bg-indigo-50/60 p-5 dark:border-indigo-500/30 dark:bg-indigo-950/20">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-200">
                          <Sparkles className="h-4 w-4" />
                          Pay‑Per‑Feature Modules
                        </h2>
                        <p className="mt-1 text-xs text-indigo-900/80 dark:text-indigo-100/70">
                          Select a module to unlock it instantly. Pricing is exclusive of +18% GST.
                        </p>
                      </div>
                      <div className="inline-flex rounded-full border border-indigo-200 bg-white/90 p-0.5 text-[11px] font-medium text-indigo-700 shadow-sm dark:border-indigo-500/40 dark:bg-indigo-950/70 dark:text-indigo-100">
                        <button
                          type="button"
                          onClick={() => setFeatureBillingPeriod("YEAR")}
                          className={`rounded-full px-2 py-0.5 transition ${featureBillingPeriod === "YEAR"
                            ? "bg-indigo-600 text-white"
                            : "text-indigo-700 hover:bg-indigo-50 dark:text-indigo-100 dark:hover:bg-indigo-900/40"
                            }`}
                        >
                          Yearly
                        </button>
                        <button
                          type="button"
                          onClick={() => setFeatureBillingPeriod("THREE_YEARS")}
                          className={`rounded-full px-2 py-0.5 transition ${featureBillingPeriod === "THREE_YEARS"
                            ? "bg-indigo-600 text-white"
                            : "text-indigo-700 hover:bg-indigo-50 dark:text-indigo-100 dark:hover:bg-indigo-900/40"
                            }`}
                        >
                          3 Years
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.trim())}
                          placeholder="Coupon"
                          className="h-7 w-24 rounded-lg border border-indigo-200 bg-white px-2 text-[11px] text-gray-700 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-100 dark:border-indigo-500/40 dark:bg-gray-900 dark:text-gray-100"
                        />
                        {isProcessingFeature && (
                          <div className="inline-flex items-center gap-1 rounded-full bg-indigo-600/10 px-3 py-1 text-[11px] font-medium text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-100">
                            <Loader className="" />
                            Processing payment...
                          </div>
                        )}
                      </div>
                    </div>

                    {features.length === 0 ? (
                      <div className="flex items-center justify-center rounded-xl border border-dashed border-indigo-200/70 bg-white/60 p-6 text-xs text-indigo-900/70 dark:border-indigo-500/30 dark:bg-indigo-950/40 dark:text-indigo-50/80">
                        No feature catalog found yet. Please contact your
                        superadmin.
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2">
                        {features.map((feature) => {
                          const isActive = feature.status === "ENABLED";
                          const isExpanded = expandedFeature === feature.key;
                          const catalogEntry = featureCatalog.find(
                            (c: any) => c.key?.toLowerCase() === feature.key?.toLowerCase()
                          );
                          const desc = FEATURE_DESCRIPTIONS[feature.key?.toLowerCase() ?? ""];
                          const monthlyPrice = feature.monthlyPrice;

                          // Use dynamic prices from catalog if available, otherwise fallback to standard discount
                          const yearlyPrice = catalogEntry?.yearlyPrice || (monthlyPrice * 10);
                          const threeYearlyPrice = catalogEntry?.threeYearlyPrice || (monthlyPrice * 30);

                          const displayPrice = featureBillingPeriod === "THREE_YEARS"
                            ? threeYearlyPrice
                            : featureBillingPeriod === "YEAR"
                              ? yearlyPrice
                              : monthlyPrice;
                          const subFeatures: any[] = catalogEntry?.subFeatures || [];
                          const routes: string[] = catalogEntry?.routes || [];
                          const capabilities: string[] =
                            desc?.capabilities?.length
                              ? desc.capabilities
                              : subFeatures.map((sf: any) => sf.name);

                          return (
                            <div
                              key={feature.key}
                              className={`relative overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-md ${isActive
                                ? "border-emerald-200 bg-white dark:border-emerald-500/30 dark:bg-gray-900"
                                : "border-indigo-100/80 bg-white dark:border-indigo-500/20 dark:bg-gray-900"
                                }`}
                            >
                              {/* Active status accent bar */}
                              {isActive && (
                                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400" />
                              )}

                              <div className="p-5">
                                {/* ── Header ── */}
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center gap-2">
                                      <Puzzle className="h-4 w-4 shrink-0 text-indigo-500 dark:text-indigo-400" />
                                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                                        {feature.name}
                                      </h3>
                                    </div>
                                    {feature.isMandatory && (
                                      <span className="inline-flex w-fit items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                                        <Shield className="h-2.5 w-2.5" />
                                        Core Feature — Always Included
                                      </span>
                                    )}
                                  </div>
                                  {isActive ? (
                                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-100">
                                      <Check className="h-3 w-3" />
                                      Active
                                    </span>
                                  ) : (
                                    <span className="inline-flex shrink-0 items-center rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                      Inactive
                                    </span>
                                  )}
                                </div>

                                {/* ── Description ── */}
                                {(desc?.description || catalogEntry?.description) && (
                                  <p className="mt-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                                    {desc?.description || catalogEntry?.description}
                                  </p>
                                )}

                                {/* ── Pricing ── */}
                                <div className="mt-4 flex items-baseline gap-1.5">
                                  {monthlyPrice > 0 ? (
                                    <>
                                      <span className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                                        ₹{displayPrice.toFixed(0)}
                                      </span>
                                      <span className="text-xs text-gray-400 dark:text-gray-500">
                                        {featureBillingPeriod === "THREE_YEARS" ? "/ 3 yrs" : featureBillingPeriod === "YEAR" ? "/ year" : "/ month"}
                                      </span>
                                      {featureBillingPeriod === "YEAR" && (
                                        <span className="ml-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                                          2 months free
                                        </span>
                                      )}
                                      {featureBillingPeriod === "THREE_YEARS" && (
                                        <span className="ml-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                                          6 months free
                                        </span>
                                      )}
                                    </>
                                  ) : (
                                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                      Free Module
                                    </span>
                                  )}
                                </div>
                                {monthlyPrice > 0 && (
                                  <p className="mt-0.5 text-[10px] text-gray-400 dark:text-gray-500">
                                    +18% GST &nbsp;·&nbsp;{" "}
                                    {featureBillingPeriod === "THREE_YEARS"
                                      ? `₹${monthlyPrice.toFixed(0)} / mo effective`
                                      : featureBillingPeriod === "YEAR"
                                        ? `₹${monthlyPrice.toFixed(0)} / mo effective`
                                        : `₹${yearlyPrice.toFixed(0)} / yr if billed annually`}
                                  </p>
                                )}

                                {/* ── Activation date ── */}
                                {isActive && feature.activatedOn && (
                                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[11px] text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                                    <CalendarDays className="h-3 w-3" />
                                    Activated on{" "}
                                    {new Date(feature.activatedOn).toLocaleDateString("en-IN", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </div>
                                )}

                                {/* ── What's included (capabilities) ── */}
                                {capabilities.length > 0 && (
                                  <div className="mt-4">
                                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                      What's included
                                    </p>
                                    <ul className="space-y-1.5">
                                      {capabilities
                                        .slice(0, isExpanded ? capabilities.length : 3)
                                        .map((cap, i) => (
                                          <li
                                            key={i}
                                            className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300"
                                          >
                                            <Check className="mt-0.5 h-3 w-3 shrink-0 text-indigo-500 dark:text-indigo-400" />
                                            {cap}
                                          </li>
                                        ))}
                                    </ul>
                                    {(capabilities.length > 3 || subFeatures.length > 0 || routes.length > 0) && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setExpandedFeature(isExpanded ? null : feature.key)
                                        }
                                        className="mt-2 flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                                      >
                                        {isExpanded ? (
                                          <>
                                            <ChevronUp className="h-3 w-3" /> Show less
                                          </>
                                        ) : (
                                          <>
                                            <ChevronDown className="h-3 w-3" />
                                            {capabilities.length > 3
                                              ? `+${capabilities.length - 3} more`
                                              : "View full details"}
                                          </>
                                        )}
                                      </button>
                                    )}
                                  </div>
                                )}

                                {/* ── Sub-modules (expanded only) ── */}
                                {isExpanded && subFeatures.length > 0 && (
                                  <div className="mt-4">
                                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                      Sub-modules
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {subFeatures.map((sf: any, i: number) => (
                                        <span
                                          key={i}
                                          className="inline-flex items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-900/30 dark:text-indigo-200"
                                        >
                                          <Tag className="h-2.5 w-2.5" />
                                          {sf.name}
                                          {sf.price > 0 && (
                                            <span className="text-indigo-400 dark:text-indigo-500">
                                              {" "}· ₹{sf.price}
                                            </span>
                                          )}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* ── Pages unlocked (expanded only) ── */}
                                {isExpanded && routes.length > 0 && (
                                  <div className="mt-4">
                                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                      Pages you unlock
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                      {routes.map((route: string, i: number) => (
                                        <span
                                          key={i}
                                          className="inline-flex items-center rounded-md bg-gray-100 px-1.5 py-0.5 font-mono text-[9px] text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                        >
                                          {route.replace("/dashboard/admin/", "~/admin/")}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* ── Expand toggle when no capabilities list present ── */}
                                {capabilities.length === 0 &&
                                  !isExpanded &&
                                  (subFeatures.length > 0 || routes.length > 0) && (
                                    <button
                                      type="button"
                                      onClick={() => setExpandedFeature(feature.key)}
                                      className="mt-3 flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                                    >
                                      <ChevronDown className="h-3 w-3" /> View details
                                    </button>
                                  )}
                              </div>

                              {/* ── CTA Footer ── */}
                              <div className="border-t border-gray-100 px-5 py-3 dark:border-white/5">
                                {isActive ? (
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      This module is live on your campus.
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                      <Check className="h-3.5 w-3.5" /> Enabled
                                    </span>
                                  </div>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleToggleFeature(feature)}
                                      disabled={isProcessingFeature}
                                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-60"
                                    >
                                      <Sparkles className="h-3.5 w-3.5" />
                                      Activate Feature
                                      {monthlyPrice > 0 && (
                                        <span className="opacity-75">
                                          — ₹{displayPrice.toFixed(0)}{featureBillingPeriod === "YEAR" ? "/yr" : "/mo"}
                                        </span>
                                      )}
                                    </button>

                                    {/* ── Coupon Input for Feature ── */}
                                    {!isActive && monthlyPrice > 0 && (
                                      <div className="mt-2 group/coupon">
                                        {activeCouponFeature === feature.key ? (
                                          <div className="flex gap-2 animate-in slide-in-from-top-1 duration-200">
                                            <input
                                              type="text"
                                              placeholder="Enter Coupon"
                                              value={couponCode}
                                              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                              className="flex-1 rounded-lg border border-indigo-200 bg-white px-2.5 py-1.5 text-[10px] uppercase font-bold text-indigo-700 outline-none ring-indigo-500/20 focus:ring-2 dark:border-indigo-500/20 dark:bg-indigo-900/50"
                                            />
                                            <button
                                              onClick={() => setActiveCouponFeature(null)}
                                              className="rounded-lg bg-gray-100 px-2 py-1.5 text-[10px] font-bold text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        ) : (
                                          <button
                                            onClick={() => {
                                              setActiveCouponFeature(feature.key);
                                              setCouponCode("");
                                            }}
                                            className="flex items-center gap-1 text-[10px] font-bold text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 opacity-60 group-hover/coupon:opacity-100 transition-opacity"
                                          >
                                            <Tag className="h-2.5 w-2.5" /> Have a coupon?
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>
                ) : (
                  <section className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 dark:border-emerald-500/30 dark:bg-emerald-950/20">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-200">
                          <Sparkles className="h-4 w-4" />
                          Fixed Membership Plans
                        </h2>
                        <p className="mt-1 text-xs text-emerald-900/80 dark:text-emerald-100/70">
                          Plans are shown with full-year pricing for clarity. Select a plan to upgrade instantly via Razorpay.
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2 md:flex-row md:items-center">
                        <div className="inline-flex rounded-full border border-emerald-200 bg-white px-0.5 text-[11px] font-medium text-emerald-700 shadow-sm dark:border-emerald-500/40 dark:bg-emerald-950/70 dark:text-emerald-100">
                          <button
                            type="button"
                            onClick={() => setPlanBillingPeriod("YEAR")}
                            className={`rounded-full px-2 py-0.5 transition ${planBillingPeriod === "YEAR"
                              ? "bg-emerald-600 text-white"
                              : "text-emerald-700 hover:bg-emerald-50 dark:text-emerald-100 dark:hover:bg-emerald-900/40"
                              }`}
                          >
                            Yearly
                          </button>
                          <button
                            type="button"
                            onClick={() => setPlanBillingPeriod("THREE_YEARS")}
                            className={`rounded-full px-2 py-0.5 transition ${planBillingPeriod === "THREE_YEARS"
                              ? "bg-emerald-600 text-white"
                              : "text-emerald-700 hover:bg-emerald-50 dark:text-emerald-100 dark:hover:bg-emerald-900/40"
                              }`}
                          >
                            3 Years
                          </button>
                        </div>
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.trim())}
                          placeholder="Apply coupon code"
                          className="h-9 rounded-xl border border-emerald-200 bg-white px-3 text-xs text-gray-700 placeholder:text-gray-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:border-emerald-500/40 dark:bg-emerald-950/60 dark:text-gray-100 dark:placeholder:text-emerald-200/60 dark:focus:border-emerald-400 dark:focus:ring-emerald-900/40"
                        />
                        <span className="text-[11px] text-emerald-800/80 dark:text-emerald-100/70">
                          Coupons are applied automatically at checkout.
                        </span>
                      </div>
                    </div>

                    {plans.length === 0 ? (
                      <div className="flex items-center justify-center rounded-xl border border-dashed border-emerald-200/70 bg-white/60 p-6 text-xs text-emerald-900/70 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-50/80">
                        No membership plans are configured yet. Please contact your
                        superadmin.
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {plans.map((plan) => (
                          <div
                            key={plan.id}
                            className="flex flex-col justify-between rounded-2xl border border-emerald-100 bg-white/90 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md dark:border-emerald-500/20 dark:bg-emerald-950/60 dark:hover:border-emerald-300/70"
                          >
                            <div className="space-y-3">
                              <div className="flex items-center justify-between gap-2">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                                  {plan.name}
                                </h3>
                              </div>
                              <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                                  ₹
                                  {(
                                    (plan.discountedPrice || plan.price) *
                                    (planBillingPeriod === "THREE_YEARS" ? 36 : planBillingPeriod === "YEAR" ? 12 : 1)
                                  ).toFixed(0)}
                                </span>
                                {plan.discountedPrice && (
                                  <span className="text-xs text-gray-400 line-through">
                                    ₹{plan.price.toFixed(0)}
                                  </span>
                                )}
                                <span className="text-xs text-gray-500 dark:text-gray-300">
                                  {planBillingPeriod === "THREE_YEARS"
                                    ? "/ 36 cycles"
                                    : planBillingPeriod === "YEAR"
                                      ? "/ 12 cycles"
                                      : `/ ${plan.durationDays} days`}
                                </span>
                                <span className="ml-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-100">
                                  +18% GST
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-300">
                                Up to{" "}
                                <span className="font-semibold text-gray-900 dark:text-gray-50">
                                  {plan.userLimit}
                                </span>{" "}
                                active users included. Extra users can be added
                                later via your superadmin.
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => handlePurchasePlan(plan)}
                              disabled={isProcessingPlan || (subData?.planId === plan.id && (subData?.status === "ACTIVE" || subData?.status === "GRACE"))}
                              className={`mt-4 inline-flex items-center justify-center rounded-xl px-3 py-2 text-xs font-medium shadow-sm transition focus:outline-none focus:ring-2 ${
                                (subData?.planId === plan.id && (subData?.status === "ACTIVE" || subData?.status === "GRACE"))
                                  ? "bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400"
                                  : (subData?.planId === plan.id && subData?.status !== "ACTIVE" && subData?.status !== "GRACE")
                                    ? "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/50 dark:bg-red-500 dark:hover:bg-red-600"
                                    : "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500/50 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                              }`}
                            >
                              {isProcessingPlan ? (
                                <>
                                  <Loader className="" />
                                  Processing...
                                </>
                              ) : (subData?.planId === plan.id && (subData?.status === "ACTIVE" || subData?.status === "GRACE")) ? (
                                <>
                                  <Check className="mr-1.5 h-3.5 w-3.5" />
                                  Current Plan
                                </>
                              ) : subData?.planId === plan.id ? (
                                <>
                                  <AlertCircle className="mr-1.5 h-3.5 w-3.5" />
                                  Expired — Renew Now
                                </>
                              ) : (
                                "Buy Plan Now"
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                )}

                <div className="mt-2 rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 p-4 text-sm text-gray-600 dark:border-white/10 dark:bg-gray-900/60 dark:text-gray-300">
                  <div className="mb-1 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    <Crown className="h-3.5 w-3.5 text-amber-500" />
                    <span>How this works</span>
                  </div>
                  <p>
                    Once your payment is successful, your membership is updated
                    automatically. You can always switch between Pay‑Per‑Feature and
                    Fixed Plan later by coordinating with your superadmin; this page
                    lets you initiate and complete payments yourself.
                  </p>
                </div>

                {/* User Limit Purchase Modal */}
                {showUserLimitModal && (() => {
                  const prorationMultiplier = Math.max((subData?.remainingDays || 0) / 30, 0);
                  const pricePerUser = (subData?.extraUserPrice || 5) * prorationMultiplier;

                  return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">Purchase Extra User Limit</h2>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          Add more seats to your current plan. Each user seat costs ₹{subData?.extraUserPrice || 5} / month.
                          <br /><br />
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                            Pro-rated for {subData?.remainingDays || 0} remaining days on your current active plan.
                          </span>
                        </p>

                        <div className="mt-6 space-y-4">
                          <div>
                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Number of Users</label>
                            <input
                              type="number"
                              min={1}
                              value={purchaseQuantity || ""}
                              onChange={(e) => setPurchaseQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                              placeholder="Enter number of users..."
                              className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm focus:border-indigo-500 focus:outline-none dark:border-white/10 dark:bg-gray-800"
                            />
                            <div className="mt-2 flex gap-2">
                              <button
                                type="button"
                                onClick={() => setPurchaseQuantity(50)}
                                className={`flex-1 rounded-lg border py-1.5 text-xs font-semibold transition ${purchaseQuantity === 50 ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-indigo-200 bg-white text-indigo-600 hover:bg-indigo-50 dark:border-indigo-500/30 dark:bg-gray-800 dark:text-indigo-400 dark:hover:bg-indigo-900/40'}`}
                              >
                                50 Users <span className="font-bold opacity-80">(10% Off)</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setPurchaseQuantity(100)}
                                className={`flex-1 rounded-lg border py-1.5 text-xs font-semibold transition ${purchaseQuantity === 100 ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-indigo-200 bg-white text-indigo-600 hover:bg-indigo-50 dark:border-indigo-500/30 dark:bg-gray-800 dark:text-indigo-400 dark:hover:bg-indigo-900/40'}`}
                              >
                                100 Users <span className="font-bold opacity-80">(20% Off)</span>
                              </button>
                            </div>
                          </div>

                          <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
                            {(() => {
                              let discountPct = 0;
                              if (purchaseQuantity >= 100) discountPct = 0.20;
                              else if (purchaseQuantity >= 50) discountPct = 0.10;

                              const rawBaseAmount = purchaseQuantity * pricePerUser;
                              const discountAmount = rawBaseAmount * discountPct;
                              const baseAmount = rawBaseAmount - discountAmount;
                              const gstAmount = baseAmount * 0.18;
                              const totalAmount = baseAmount + gstAmount;

                              return (
                                <>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Base Amount</span>
                                    <span className="font-semibold text-gray-900 dark:text-gray-50">₹{rawBaseAmount.toFixed(2)}</span>
                                  </div>
                                  {discountPct > 0 && (
                                    <div className="mt-1 flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
                                      <span>Combo Discount ({(discountPct * 100).toFixed(0)}%)</span>
                                      <span className="font-semibold">- ₹{discountAmount.toFixed(2)}</span>
                                    </div>
                                  )}
                                  <div className="mt-1 flex justify-between text-sm">
                                    <span className="text-gray-500">GST (18%)</span>
                                    <span className="font-semibold text-gray-900 dark:text-gray-50">₹{gstAmount.toFixed(2)}</span>
                                  </div>
                                  <hr className="my-2 border-gray-200 dark:border-white/5" />
                                  <div className="flex justify-between text-lg font-bold">
                                    <span className="text-gray-900 dark:text-gray-50">Total Payable</span>
                                    <span className="text-indigo-600 dark:text-indigo-400">₹{totalAmount.toFixed(0)}</span>
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        </div>

                        <div className="mt-6 flex gap-3">
                          <button
                            onClick={() => setShowUserLimitModal(false)}
                            className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
                          >
                            Cancel
                          </button>
                          <button
                            disabled={isProcessingLimit}
                            onClick={handlePurchaseUserLimit}
                            className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                          >
                            {isProcessingLimit ? <Loader className="" /> : "Pay & Add Users"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Processing Overlay */}
                {(isProcessingFeature || isProcessingPlan || isProcessingLimit) && (
                  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/60 backdrop-blur-sm dark:bg-black/60">
                    <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-8 shadow-2xl dark:bg-gray-900">
                      <Loader className="" />
                      <p className="font-semibold text-gray-900 dark:text-gray-50">Processing Your Payment...</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Please do not refresh or close this window.</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          {/* Payment Summary Modal */}
          {showSummaryModal && summaryData && pendingPlan && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-200 dark:border-white/10">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">Payment Summary</h2>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Review your {pendingPlan.name} plan details before proceeding to payment.
                </p>

                <div className="mt-6 space-y-4">
                  <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">Base Plan Price</span>
                      <span className="text-gray-900 dark:text-gray-100 font-bold">₹{summaryData.basePlanPrice.toLocaleString()}</span>
                    </div>

                    {summaryData.extraUserSeats > 0 && (
                      <div className="mt-2 flex justify-between items-center text-sm">
                        <span className="text-gray-500 dark:text-gray-400 font-medium">Extra Students ({summaryData.extraUserSeats})</span>
                        <span className="text-gray-900 dark:text-gray-100 font-semibold">+ ₹{summaryData.extraUserCharge.toLocaleString()}</span>
                      </div>
                    )}

                    {summaryData.discountApplied > 0 && (
                      <div className="mt-2 flex justify-between items-center text-sm">
                        <span className="text-green-600 dark:text-green-400 font-medium">Coupon Discount</span>
                        <span className="text-green-600 dark:text-green-400 font-semibold">- ₹{summaryData.discountApplied.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="mt-2 flex justify-between items-center text-sm">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">GST (18%)</span>
                      <span className="text-gray-900 dark:text-gray-100 font-semibold">+ ₹{summaryData.gstAmount.toLocaleString()}</span>
                    </div>

                    <hr className="my-3 border-gray-200 dark:border-white/5" />

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">Total Payable</span>
                      <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">₹{summaryData.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => {
                      setShowSummaryModal(false);
                      setIsProcessingPlan(false);
                    }}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmPayment}
                    className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 transition shadow-sm"
                  >
                    Pay Now
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}

