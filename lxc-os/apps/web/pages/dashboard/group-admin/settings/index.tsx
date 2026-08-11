import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import {
    Building2,
    Upload,
    Save,
    Shield,
    Globe,
    Mail,
    User as UserIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import client from "@/lib/api/client";
import { toast } from "react-hot-toast";

const GroupSettingsPage = () => {
    const [settings, setSettings] = useState({
        name: "",
        logo: "",
        owner: {
            name: "",
            email: ""
        }
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await client.get("/v1/group-admin/settings");
            setSettings(response.data);
        } catch (error) {
            console.error("Failed to fetch settings", error);
            toast.error("Failed to load organization settings");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            await client.patch("/v1/group-admin/settings", {
                name: settings.name,
                logo: settings.logo
            });
            toast.success("Settings updated successfully");
        } catch (error) {
            console.error("Failed to save settings", error);
            toast.error("Failed to update settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout role="group_admin">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="group_admin">
            <div className="p-6 max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Organization Settings</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage your organization's global profile and preferences.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Sidebar navigation for settings could go here */}
                    <div className="md:col-span-1 space-y-4">
                        <div className="bg-white dark:bg-gray-800 p-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <button className="w-full flex items-center gap-3 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg font-medium">
                                <Building2 className="w-4 h-4" />
                                Group Profile
                            </button>
                            <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
                                <Shield className="w-4 h-4" />
                                Security
                            </button>
                            <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
                                <Globe className="w-4 h-4" />
                                Global Policies
                            </button>
                        </div>
                    </div>

                    <div className="md:col-span-2 space-y-6">
                        <form onSubmit={handleSave} className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
                            <div className="flex flex-col items-center gap-4 mb-8">
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-4 border-white dark:border-gray-800 shadow-md">
                                        {settings.logo ? (
                                            <img src={settings.logo} alt="Logo" className="w-full h-full object-cover" />
                                        ) : (
                                            <Building2 className="w-12 h-12 text-gray-400" />
                                        )}
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                            <Upload className="w-8 h-8 text-white" />
                                        </div>
                                    </div>
                                    <button type="button" className="absolute -bottom-2 -right-2 p-2 bg-indigo-600 rounded-lg text-white shadow-lg hover:bg-indigo-700 transition-colors">
                                        <Upload className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="text-center">
                                    <h3 className="font-bold">Organization Logo</h3>
                                    <p className="text-sm text-gray-500">Square images work best. Max 2MB.</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Organization Name</label>
                                    <Input
                                        value={settings.name}
                                        onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                                        placeholder="e.g., Global Education Group"
                                        className="h-12 border-gray-200 dark:border-gray-600"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Organization Owner</label>
                                        <div className="relative">
                                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <Input
                                                value={settings.owner.name}
                                                disabled
                                                className="pl-10 h-12 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-600 grayscale opacity-60"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Owner Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <Input
                                                value={settings.owner.email}
                                                disabled
                                                className="pl-10 h-12 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-600 grayscale opacity-60"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-indigo-600 hover:bg-indigo-700 px-8 py-6 h-auto text-lg flex items-center gap-2"
                                >
                                    {saving ? "Saving..." : <><Save className="w-5 h-5" /> Save Changes</>}
                                </Button>
                            </div>
                        </form>

                        <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl p-6 border border-red-100 dark:border-red-900/20">
                            <h3 className="text-red-800 dark:text-red-400 font-bold mb-2">Danger Zone</h3>
                            <p className="text-red-600 dark:text-red-500/80 text-sm mb-4 italic">Deleting your organization is permanent and will suspend all branches immediately.</p>
                            <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20">
                                Delete Organization
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default GroupSettingsPage;
