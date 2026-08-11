import { useState, useEffect } from "react";
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/forms/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { School, CreditCard, Calendar, Settings, Upload, Save, Plus, CheckCircle2, Lock, Eye, EyeOff, Layout } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import client from "@/lib/api/client";
import { toast } from "react-toastify";
import { dashboardConfig } from "@/components/dashboard/config/dashboardConfig";
import { useAuth } from "@/lib/context/AuthContext";
import { Loader } from "@/components/ui/feedback/Loader";

export default function AdminSettingsPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("school");

    // School Profile State
    const [schoolData, setSchoolData] = useState({ schoolName: "", schoolLogo: "" });
    const [logoPreview, setLogoPreview] = useState("");
    const [logoFile, setLogoFile] = useState<File | null>(null);

    // Payment State
    const [paymentData, setPaymentData] = useState({ keyId: "", keySecret: "" });
    const [showSecret, setShowSecret] = useState(false);

    // Academic Setup State
    const [academicYears, setAcademicYears] = useState<any[]>([]);
    const [isAddingYear, setIsAddingYear] = useState(false);
    const [newYear, setNewYear] = useState({ year: "", startDate: "", endDate: "", isActive: false });

    useEffect(() => {
        fetchSchoolData();
        fetchPaymentData();
        fetchAcademicYears();
    }, []);

    const fetchSchoolData = async () => {
        try {
            const res = await client.get("/v1/admin/settings/school");
            setSchoolData({
                schoolName: res.data.schoolName || "",
                schoolLogo: res.data.schoolLogo || ""
            });
            setLogoPreview(res.data.schoolLogo || "");
        } catch (err) {
            toast.error("Failed to fetch school data");
        }
    };

    const fetchPaymentData = async () => {
        try {
            const res = await client.get("/v1/admin/settings/payment");
            setPaymentData(res.data);
        } catch (err) {
            toast.error("Failed to fetch payment configuration");
        }
    };

    const fetchAcademicYears = async () => {
        try {
            const res = await client.get("/v1/admin/settings/academic-years");

            const data = res?.data;
            // Ensure we always store an array in state to avoid runtime errors
            if (Array.isArray(data)) {
                setAcademicYears(data);
            } else if (Array.isArray((data as any)?.years)) {
                setAcademicYears((data as any).years);
            } else {
                // Fallback to empty array if the shape is unexpected
                setAcademicYears([]);
            }
        } catch (err) {
            toast.error("Failed to fetch academic years");
            setAcademicYears([]);
        }
    };

    const handleSchoolSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();
        formData.append("schoolName", schoolData.schoolName);
        if (logoFile) {
            formData.append("schoolLogo", logoFile);
        }

        try {
            await client.patch("/v1/admin/settings/school", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            toast.success("School profile updated successfully");
            fetchSchoolData();
        } catch (err) {
            toast.error("Failed to update school profile");
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await client.patch("/v1/admin/settings/payment", paymentData);
            toast.success("Payment configuration updated successfully");
            fetchPaymentData();
        } catch (err) {
            toast.error("Failed to update payment configuration");
        } finally {
            setLoading(false);
        }
    };

    const handleAddAcademicYear = async () => {
        if (!newYear.year || !newYear.startDate || !newYear.endDate) {
            return toast.error("Please fill all fields");
        }
        setLoading(true);
        try {
            await client.post("/v1/admin/settings/academic-years", newYear);
            toast.success("Academic year added successfully");
            setIsAddingYear(false);
            setNewYear({ year: "", startDate: "", endDate: "", isActive: false });
            fetchAcademicYears();
        } catch (err) {
            toast.error("Failed to add academic year");
        } finally {
            setLoading(false);
        }
    };

    const toggleYearActive = async (id: string, currentStatus: boolean) => {
        if (currentStatus) return; // Already active

        setLoading(true);
        try {
            await client.patch(`/v1/admin/settings/academic-years?id=${id}`, { isActive: true });
            toast.success("Active academic year updated");
            fetchAcademicYears();
        } catch (err) {
            toast.error("Failed to update active year");
        } finally {
            setLoading(false);
        }
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const tabs = [
        { id: "school", label: "School Profile", icon: School },
        { id: "payment", label: "Payment Gateway", icon: CreditCard },
        { id: "academics", label: "Academic Setup", icon: Calendar },
        { id: "sidebar", label: "Sidebar Customization", icon: Layout },
    ].filter(tab => tab.id !== "sidebar" || user?.role === "admin");

    return (
        <>
            <Head>
                <title>Settings - Admin Dashboard</title>
            </Head>
            <DashboardLayout role="admin">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-outfit">Settings</h1>
                            <p className="text-xs text-gray-500">Manage your school profile, payments, and academics</p>
                        </div>
                    </div>

                    <div className="flex space-x-1 rounded-xl bg-gray-100/50 dark:bg-gray-800/30 p-1 w-full lg:w-[650px] border border-gray-200 dark:border-white/5 backdrop-blur-md overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-[11px] font-semibold whitespace-nowrap transition-all duration-300 ${activeTab === tab.id
                                    ? "bg-white text-indigo-600 shadow-md transform scale-[1.02] dark:bg-gray-700 dark:text-indigo-300"
                                    : "text-gray-500 hover:text-gray-700 hover:bg-white/40 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-white/5"
                                    }`}
                            >
                                <tab.icon className="h-3.5 w-3.5" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, scale: 0.98, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: -10 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                        >
                            {activeTab === "school" && (
                                <Card accent="indigo" className="border-none shadow-2xl">
                                    <CardHeader>
                                        <CardTitle className="text-base">School Information</CardTitle>
                                        <CardDescription>Update your school's basic information and identity</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleSchoolSubmit} className="space-y-6">
                                            <div className="grid gap-8 md:grid-cols-2">
                                                <div className="space-y-5">
                                                    <Input
                                                        label="School Name"
                                                        value={schoolData.schoolName}
                                                        onChange={(e) => setSchoolData({ ...schoolData, schoolName: e.target.value })}
                                                        placeholder="Enter school name"
                                                    />
                                                    <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                                                        <div className="flex items-start gap-4">
                                                            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                                                                <Settings className="h-4 w-4" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[12px] font-bold text-indigo-700 dark:text-indigo-300">Brand Identity</p>
                                                                <p className="text-[11px] leading-relaxed text-indigo-600/80 dark:text-indigo-400/80">Your school name and logo will be used across invoices, reports, and the public portal. Make sure they represent your institution clearly.</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-[2rem] bg-gray-50/50 dark:bg-gray-800/30 transition-all hover:border-indigo-500/50 group">
                                                    <div className="relative">
                                                        <div className="h-32 w-32 rounded-3xl bg-white dark:bg-gray-800 shadow-2xl overflow-hidden border-4 border-white dark:border-gray-700 group-hover:scale-105 transition-transform duration-300">
                                                            {logoPreview ? (
                                                                <img src={logoPreview} alt="Logo Preview" className="h-full w-full object-cover" />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center text-gray-400">
                                                                    <School className="h-12 w-12" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <label
                                                            htmlFor="logo-upload"
                                                            className="absolute -bottom-3 -right-3 p-2 bg-indigo-600 text-white rounded-xl shadow-xl cursor-pointer hover:bg-indigo-700 transform hover:scale-110 transition-all"
                                                        >
                                                            <Upload className="h-4 w-4" />
                                                        </label>
                                                        <input
                                                            id="logo-upload"
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={handleLogoChange}
                                                        />
                                                    </div>
                                                    <div className="mt-6 text-center">
                                                        <p className="text-[11px] font-bold text-gray-700 dark:text-gray-300">Upload School Logo</p>
                                                        <p className="mt-1 text-[10px] text-gray-500 font-medium">PNG, JPG up to 5MB</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-end pt-4">
                                                <Button type="submit" disabled={loading} className="h-10 px-6 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25">
                                                    {loading ? <Loader className="" /> : <Save className="mr-2 h-4 w-4" />}
                                                    Save Profile
                                                </Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            )}

                            {activeTab === "payment" && (
                                <Card accent="emerald" className="border-none shadow-2xl">
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                                                <CreditCard className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-base text-gray-900 dark:text-white">Razorpay Configuration</CardTitle>
                                                <CardDescription>Setup your payment gateway credentials for fee collections</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handlePaymentSubmit} className="space-y-6">
                                            <div className="grid gap-5">
                                                <Input
                                                    label="Razorpay Key ID"
                                                    value={paymentData.keyId}
                                                    onChange={(e) => setPaymentData({ ...paymentData, keyId: e.target.value })}
                                                    placeholder="rzp_test_..."
                                                />
                                                <Input
                                                    label="Razorpay Key Secret"
                                                    type={showSecret ? "text" : "password"}
                                                    value={paymentData.keySecret}
                                                    onChange={(e) => setPaymentData({ ...paymentData, keySecret: e.target.value })}
                                                    placeholder="Enter secret key"
                                                    rightIcon={
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowSecret(!showSecret)}
                                                            className="text-gray-400 hover:text-indigo-400 transition-colors"
                                                        >
                                                            {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                        </button>
                                                    }
                                                />
                                            </div>

                                            <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex gap-4">
                                                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-600">
                                                    <Lock className="h-4 w-4" />
                                                </div>
                                                <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-300">
                                                    <span className="font-bold underline block mb-1">Security Standards</span>
                                                    Your credentials are encrypted using industry-standard AES-256 before storage. Never share your Key Secret with anyone. These keys enable automated reconciliation and settlements.
                                                </p>
                                            </div>

                                            <div className="flex justify-end pt-4">
                                                <Button type="submit" disabled={loading} className="h-10 px-6 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/25 border-none">
                                                    {loading ? <Loader className="" /> : <Save className="mr-2 h-4 w-4" />}
                                                    Update Credentials
                                                </Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            )}

                            {activeTab === "academics" && (
                                <div className="grid gap-6">
                                    <Card accent="indigo" className="border-none shadow-2xl">
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                                                        <Calendar className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-base text-gray-900 dark:text-white">Academic Years</CardTitle>
                                                        <CardDescription>Configure session periods and manage the active academic session</CardDescription>
                                                    </div>
                                                </div>
                                                <Button
                                                    onClick={() => setIsAddingYear(true)}
                                                    disabled={isAddingYear}
                                                    className="h-10 px-4 text-xs bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25"
                                                >
                                                    <Plus className="mr-2 h-3.5 w-3.5" /> Add New Session
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            {isAddingYear && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    className="mb-8 p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 space-y-5"
                                                >
                                                    <h4 className="font-bold text-[10px] uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Create New Academic Session</h4>
                                                    <div className="grid gap-5 md:grid-cols-3">
                                                        <Input
                                                            label="Session Name"
                                                            placeholder="e.g., 2025-26"
                                                            value={newYear.year}
                                                            onChange={(e) => setNewYear({ ...newYear, year: e.target.value })}
                                                        />
                                                        <Input
                                                            label="Start Date"
                                                            type="date"
                                                            value={newYear.startDate}
                                                            onChange={(e) => setNewYear({ ...newYear, startDate: e.target.value })}
                                                        />
                                                        <Input
                                                            label="End Date"
                                                            type="date"
                                                            value={newYear.endDate}
                                                            onChange={(e) => setNewYear({ ...newYear, endDate: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="flex justify-end gap-3 pt-2">
                                                        <Button variant="ghost" onClick={() => setIsAddingYear(false)} className="h-9 text-xs">Cancel</Button>
                                                        <Button onClick={handleAddAcademicYear} disabled={loading} className="h-9 px-6 text-xs bg-indigo-600 hover:bg-indigo-700">
                                                            {loading && <Loader className="" />}
                                                            Confirm Session
                                                        </Button>
                                                    </div>
                                                </motion.div>
                                            )}

                                            <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-white/5 bg-white/30 dark:bg-gray-900/40 backdrop-blur-xl">
                                                <table className="w-full text-left text-[11px]">
                                                    <thead className="bg-gray-50/80 dark:bg-gray-800/80 text-gray-500 uppercase font-bold tracking-widest">
                                                        <tr>
                                                            <th className="px-6 py-4">Session Year</th>
                                                            <th className="px-6 py-4">Commencement</th>
                                                            <th className="px-6 py-4">Conclusion</th>
                                                            <th className="px-6 py-4 text-center">Current Status</th>
                                                            <th className="px-6 py-4 text-right">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                                        {Array.isArray(academicYears) && academicYears.length > 0 ? academicYears.map((year) => (
                                                            <tr key={year.id} className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5 transition-all duration-300">
                                                                <td className="px-6 py-5 font-bold text-gray-900 dark:text-white text-xs">{year.year}</td>
                                                                <td className="px-6 py-5 text-gray-500 dark:text-gray-400">{new Date(year.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                                                <td className="px-6 py-5 text-gray-500 dark:text-gray-400">{new Date(year.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                                                <td className="px-6 py-5 text-center">
                                                                    {year.isActive ? (
                                                                        <Badge tone="success" variant="solid" className="px-3 shadow-md shadow-emerald-500/20">Active Session</Badge>
                                                                    ) : (
                                                                        <Badge tone="neutral" variant="soft">Inactive</Badge>
                                                                    )}
                                                                </td>
                                                                <td className="px-6 py-5 text-right">
                                                                    <Button
                                                                        disabled={year.isActive || loading}
                                                                        onClick={() => toggleYearActive(year.id, year.isActive)}
                                                                        className={`h-8 px-4 text-[10px] font-bold transition-all flex items-center gap-1.5 ${year.isActive ? "bg-emerald-500/10 text-emerald-600 opacity-60" : "bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-indigo-500/20"}`}
                                                                    >
                                                                        {loading && !year.isActive ? (
                                                                            <Loader size="sm" variant="white" />
                                                                        ) : (
                                                                            year.isActive ? <CheckCircle2 className="h-3.5 w-3.5" /> : null
                                                                        )}
                                                                        {year.isActive ? "Current" : "Set As Active"}
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        )) : (
                                                            <tr>
                                                                <td colSpan={5} className="h-32 text-center text-gray-500 italic opacity-60">
                                                                    No academic sessions have been configured yet.
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {activeTab === "sidebar" && (
                                <SidebarCustomizationTab />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </DashboardLayout>
        </>
    );
}

// Sidebar Customization Component
function SidebarCustomizationTab() {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [preferences, setPreferences] = useState<Record<string, any>>({});
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
    const [adminFeatures, setAdminFeatures] = useState<{ key: string; status: string }[]>([]);
    const [featuresLoading, setFeaturesLoading] = useState(true);

    useEffect(() => {
        fetchPreferences();
        fetchAdminFeatures();
    }, []);

    const fetchAdminFeatures = async () => {
        try {
            const res = await client.get("/v1/dashboard/admin-features");
            setAdminFeatures(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.warn("Failed to load admin features for sidebar customization");
        } finally {
            setFeaturesLoading(false);
        }
    };

    const fetchPreferences = async () => {
        try {
            setLoading(true);
            // Try to load from localStorage first (for immediate access)
            const localPrefs = localStorage.getItem("sidebarPreferences");
            if (localPrefs) {
                try {
                    const parsed = JSON.parse(localPrefs);
                    setPreferences(parsed);
                } catch (e) {
                    // Invalid JSON, continue to API
                }
            }

            // Also try to load from API
            try {
                const res = await client.get("/v1/admin/settings/sidebar-preferences");
                if (res.data?.preferences) {
                    setPreferences(res.data.preferences);
                    // Sync to localStorage
                    localStorage.setItem("sidebarPreferences", JSON.stringify(res.data.preferences));
                }
            } catch (err: any) {
                // If API fails, use localStorage if available
                if (!localPrefs && err.response?.status !== 404) {
                    console.warn("Failed to load sidebar preferences from API");
                }
            }
        } catch (err) {
            console.error("Error loading preferences:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            // Save to API first
            await client.post("/v1/admin/settings/sidebar-preferences", { preferences });

            // If successful, update localStorage for immediate access
            localStorage.setItem("sidebarPreferences", JSON.stringify(preferences));

            toast.success("Sidebar preferences saved successfully");

            // Reload page to apply changes only after successful save
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (err: any) {
            console.error("Failed to save sidebar preferences:", err);
            const errorMessage = err.response?.data?.error || "Failed to save sidebar preferences";
            toast.error(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    const toggleSection = (sectionLabel: string) => {
        const key = `section:${sectionLabel}`;
        setPreferences((prev) => {
            const next = {
                ...prev,
                [key]: prev[key] === false ? true : false,
            };
            window.dispatchEvent(new CustomEvent("sidebarPreferencesUpdated", { detail: next }));
            return next;
        });
    };

    const toggleItem = (sectionLabel: string, itemHref: string) => {
        const key = `item:${sectionLabel}:${itemHref}`;
        setPreferences((prev) => {
            const next = {
                ...prev,
                [key]: prev[key] === false ? true : false,
            };
            window.dispatchEvent(new CustomEvent("sidebarPreferencesUpdated", { detail: next }));
            return next;
        });
    };

    const isSectionEnabled = (sectionLabel: string): boolean => {
        const key = `section:${sectionLabel}`;
        // Default to true if not set
        return preferences[key] !== false;
    };

    const isItemEnabled = (sectionLabel: string, itemHref: string): boolean => {
        const key = `item:${sectionLabel}:${itemHref}`;
        // Default to true if not set
        return preferences[key] !== false;
    };

    const toggleSectionExpanded = (sectionLabel: string) => {
        setExpandedSections((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(sectionLabel)) {
                newSet.delete(sectionLabel);
            } else {
                newSet.add(sectionLabel);
            }
            return newSet;
        });
    };

    // Get admin config sections from the imported dashboardConfig
    // Strictly use the 'admin' config as this component is for admin sidebar customization
    // For MODEL_A (pay-per-feature) admins, only show sections they have purchased.
    const allSections = dashboardConfig?.admin?.sections || [];

    // Same logic as DashboardLayout.isSectionAllowed — mirrors feature-gating
    const alwayAllowedSections = new Set(["Overview", "System", "Support Management", "Membership"]);
    const toFeatureKey = (label: string) =>
        label.toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, "");
    const enabledKeys = new Set(adminFeatures.filter((f) => f.status === "ENABLED").map((f) => f.key.toUpperCase()));
    const allKnownKeys = new Set(adminFeatures.map((f) => f.key.toUpperCase()));

    const isSectionAccessible = (sectionLabel: string): boolean => {
        if (alwayAllowedSections.has(sectionLabel)) return true;
        // While features are loading, show all (prevents flash-disappear)
        if (featuresLoading) return true;
        // If no features came back (e.g. MODEL_B or API error), show all
        if (allKnownKeys.size === 0) return true;
        const key = toFeatureKey(sectionLabel);
        // Section maps to a known feature → only show if that feature is enabled
        if (allKnownKeys.has(key)) return enabledKeys.has(key);
        // Not a feature-gated section → always show
        return true;
    };

    const sections = allSections.filter((section: any) => isSectionAccessible(section.label));
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Sidebar Customization</h3>
                    <p className="text-sm text-muted-foreground">
                        Toggle sections and items to customize your school dashboard sidebar.
                    </p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                    {saving ? (
                        <><Loader size="sm" variant="white" /> Saving...</>
                    ) : (
                        <><Save className="mr-2 h-4 w-4" /> Save Preferences</>
                    )}
                </Button>
            </div>

            <Card accent="indigo" className="border-none shadow-2xl">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                            <Layout className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-base text-gray-900 dark:text-white">Review Sidebar Sections</CardTitle>
                            <CardDescription>Customize which menu items appear in your sidebar</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20">
                            <p className="text-xs text-indigo-700 dark:text-indigo-300">
                                <span className="font-bold">Tip:</span> Toggle sections and individual menu items to customize your sidebar.
                                Disabled items will be hidden from your navigation menu.
                            </p>
                        </div>

                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                            {sections.map((section: any) => {
                                const sectionEnabled = isSectionEnabled(section.label);
                                const isExpanded = expandedSections.has(section.label);

                                return (
                                    <div
                                        key={section.label}
                                        className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-gray-900"
                                    >
                                        {/* Section Header */}
                                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50">
                                            <div className="flex items-center gap-3 flex-1">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={sectionEnabled}
                                                        onChange={() => toggleSection(section.label)}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                                                </label>
                                                <span className="font-semibold text-sm text-gray-900 dark:text-white">
                                                    {section.label}
                                                </span>
                                            </div>
                                            {section.items && section.items.length > 0 && (
                                                <button
                                                    onClick={() => toggleSectionExpanded(section.label)}
                                                    className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                                >
                                                    <svg
                                                        className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>

                                        {/* Section Items */}
                                        {isExpanded && section.items && section.items.length > 0 && (
                                            <div className="border-t border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-gray-900/50">
                                                {section.items.map((item: any) => {
                                                    const itemEnabled = isItemEnabled(section.label, item.href);
                                                    return (
                                                        <div
                                                            key={item.href}
                                                            className="flex items-center justify-between p-3 px-6 border-b border-gray-100 dark:border-white/5 last:border-b-0"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                {item.icon && (
                                                                    <item.icon className="h-4 w-4 text-gray-400" />
                                                                )}
                                                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                                                    {item.label}
                                                                </span>
                                                            </div>
                                                            <label className="relative inline-flex items-center cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={itemEnabled && sectionEnabled}
                                                                    onChange={() => toggleItem(section.label, item.href)}
                                                                    disabled={!sectionEnabled}
                                                                    className="sr-only peer"
                                                                />
                                                                <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600 ${!sectionEnabled ? "opacity-50 cursor-not-allowed" : ""}`}></div>
                                                            </label>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-white/10">
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                                className="h-10 px-6 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25"
                            >
                                {saving ? (
                                    <>
                                        <Loader className="" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Preferences
                                    </>
                                )}
                            </Button>
                        </div> */}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
