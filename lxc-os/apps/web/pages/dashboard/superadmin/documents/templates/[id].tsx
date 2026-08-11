import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { ArrowLeft, Save, FileText, Layout, Globe, School as SchoolIcon, Search, Info, HelpCircle, Variable } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/forms/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "react-toastify";
import client from "@/lib/api/client";
import { useAuth } from "@/lib/context/AuthContext";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { decodeId } from "@/lib/utils/hashId";

export default function EditTemplatePage() {
    const router = useRouter();
    const { id: rawId } = router.query;
    const id = rawId ? (rawId === "new" ? "new" : decodeId(rawId as string)) : undefined;
    const { user } = useAuth();
    const isSuperAdmin = user?.role === "superadmin";

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [schools, setSchools] = useState<any[]>([]);
    const [schoolSearch, setSchoolSearch] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        type: "CERTIFICATE",
        category: "BONAFIDE",
        content: "This is to certify that {{name}} is a student of {{class}}.",
        isDefault: false,
        schoolId: null as string | null,
    });

    const categoryMap: Record<string, { label: string, value: string }[]> = {
        ID_CARD: [
            { label: "Student ID Card", value: "STUDENT_ID" },
            { label: "Staff ID Card", value: "STAFF_ID" },
        ],
        CERTIFICATE: [
            { label: "Bonafide Certificate", value: "BONAFIDE" },
            { label: "NOC (No Objection)", value: "NOC" },
            { label: "Transfer Certificate", value: "TRANSFER" },
            { label: "Character Certificate", value: "CHARACTER" },
            { label: "Experience Certificate", value: "EXPERIENCE" },
            { label: "Achievement Certificate", value: "ACHIEVEMENT" },
        ],
        REPORT_CARD: [
            { label: "Final Exam Report", value: "FINAL_EXAM" },
            { label: "Term Report Card", value: "TERM_REPORT" },
        ]
    };

    const availableCategories = useMemo(() => {
        return categoryMap[formData.type] || [];
    }, [formData.type]);

    useEffect(() => {
        const isValid = availableCategories.some(c => c.value === formData.category);
        if (!isValid && availableCategories.length > 0) {
            setFormData(prev => ({ ...prev, category: availableCategories[0].value }));
        }
    }, [formData.type, availableCategories]);

    useEffect(() => {
        if (id && id !== "new") {
            fetchTemplate();
        } else if (id === "new") {
            setIsLoading(false);
        }
        if (isSuperAdmin) {
            fetchSchools();
        }
    }, [id, isSuperAdmin]);

    const fetchTemplate = async () => {
        try {
            setIsLoading(true);
            const response = await client.get(`/v1/dashboard/admin/documents/templates/${id}`);
            const t = response.data;
            setFormData({
                name: t.name || "",
                description: t.description || "",
                type: t.type || "CERTIFICATE",
                category: t.category || "BONAFIDE",
                content: typeof t.content === 'string' ? t.content : (t.content ? JSON.stringify(t.content, null, 2) : ""),
                isDefault: t.isDefault || false,
                schoolId: t.schoolId || null,
            });
        } catch (error: any) {
            toast.error("Failed to load template details.");
            router.push("/dashboard/superadmin/documents");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSchools = async () => {
        try {
            const res = await client.get("/v1/superadmin/schools?limit=200");
            setSchools(res.data.data || []);
        } catch (err: any) {
            console.error("Failed to fetch schools", err);
        }
    };

    const filteredSchools = schools.filter(s =>
        s.schoolName.toLowerCase().includes(schoolSearch.toLowerCase())
    );

    const insertVariable = (variable: string) => {
        setFormData(prev => ({
            ...prev,
            content: prev.content + ` {{${variable}}}`
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            if (id && id !== "new") {
                await client.put(`/v1/dashboard/admin/documents/templates/${id}`, formData);
                toast.success("Template updated successfully");
            } else {
                await client.post("/v1/dashboard/admin/documents/templates", formData);
                toast.success("Template created successfully");
            }
            router.push("/dashboard/superadmin/documents");
        } catch (err: any) {
            toast.error(err.message || "Failed to save template");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout role="superadmin">
                <div className="flex justify-center items-center h-full min-h-[500px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="superadmin">
            <Head>
                <title>{id === "new" ? "Create Template" : "Edit Template"} | LearnXChain</title>
            </Head>

            <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
                <div className="flex items-center gap-3 md:gap-4 px-1 md:px-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push("/dashboard/superadmin/documents")}
                        className="rounded-full bg-white dark:bg-slate-900 shadow-sm border border-gray-100 dark:border-slate-800 shrink-0"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="min-w-0">
                        <h1 className="text-lg md:text-2xl font-black uppercase tracking-tight dark:text-white truncate">
                            {id === "new" ? "Create Template" : "Edit Template"}
                        </h1>
                        <p className="text-[10px] md:text-sm text-gray-500 font-medium mt-0.5 truncate">
                            {id === "new" ? "Design a new document layout." : "Modify existing structural content."}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-800/50 p-4 md:p-8 space-y-6 md:space-y-8">

                    {isSuperAdmin && (
                        <div className="space-y-2 max-w-2xl">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-slate-400">Target School</label>
                                <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/40 px-3 py-1 rounded-full uppercase tracking-wider">Required context</span>
                            </div>
                            <Select
                                value={formData.schoolId || "common"}
                                onValueChange={(v) => setFormData({ ...formData, schoolId: v === "common" ? null : v })}
                            >
                                <SelectTrigger className="w-full h-14 rounded-2xl bg-gray-50 dark:bg-slate-950 border-none font-medium">
                                    <SelectValue placeholder="Select target" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px] rounded-2xl border-none shadow-2xl dark:bg-slate-900">
                                    <div className="p-2 border-b dark:border-white/10 sticky top-0 bg-white dark:bg-slate-900 z-10">
                                        <div className="relative">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-slate-950 border-none outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                                placeholder="Search schools..."
                                                value={schoolSearch}
                                                onChange={(e) => setSchoolSearch(e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                                onKeyDown={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                    </div>
                                    <div className="p-2">
                                        <SelectItem value="common" className="rounded-xl py-2 cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                                    <Globe className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                                </div>
                                                <div className="flex flex-col text-left">
                                                    <span className="font-bold text-sm">Common Template</span>
                                                    <span className="text-[11px] text-gray-500 font-medium">Available platform-wide</span>
                                                </div>
                                            </div>
                                        </SelectItem>
                                        {filteredSchools.map((school) => (
                                            <SelectItem key={school.id} value={school.id} className="rounded-xl py-2 cursor-pointer mt-1">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                                                        <SchoolIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                                    </div>
                                                    <div className="flex flex-col text-left">
                                                        <span className="font-bold text-sm">{school.schoolName}</span>
                                                        <span className="text-[11px] text-gray-500 font-medium shrink-0 max-w-[200px] truncate">{school.city || "Organization"}</span>
                                                    </div>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </div>
                                    {filteredSchools.length === 0 && schoolSearch && (
                                        <div className="p-6 text-center text-sm font-medium text-gray-500">No schools match your search :(</div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column */}
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-slate-400 flex gap-2 items-center mb-3">
                                    Template Name <Info className="h-4 w-4" />
                                </label>
                                <Input
                                    value={formData.name}
                                    onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ex: Classic Bonafide v2"
                                    className="h-14 rounded-2xl bg-gray-50 dark:bg-slate-950 border-none px-5 font-medium"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-slate-400 flex gap-2 items-center mb-3">
                                    Description
                                </label>
                                <Input
                                    value={formData.description}
                                    onChange={(e: any) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief explanation of this layout's purpose"
                                    className="h-14 rounded-2xl bg-gray-50 dark:bg-slate-950 border-none px-5 font-medium"
                                />
                            </div>

                            <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-950 p-5 rounded-2xl">
                                <input
                                    type="checkbox"
                                    id="isDefault"
                                    checked={formData.isDefault}
                                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                    className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                                />
                                <label htmlFor="isDefault" className="text-sm font-bold text-gray-700 dark:text-slate-300 cursor-pointer select-none">
                                    Set as the active default template for this category
                                </label>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-slate-400">Document Type</label>
                                    <HelpCircle className="h-4 w-4 text-gray-300" />
                                </div>
                                <Select
                                    value={formData.type}
                                    onValueChange={(v) => setFormData({ ...formData, type: v })}
                                >
                                    <SelectTrigger className="h-14 rounded-2xl bg-gray-50 dark:bg-slate-950 border-none px-5 font-medium"><SelectValue /></SelectTrigger>
                                    <SelectContent className="rounded-2xl border-none shadow-2xl dark:bg-slate-900">
                                        <SelectItem value="ID_CARD" className="rounded-xl py-3 font-medium">ID Card Format</SelectItem>
                                        <SelectItem value="CERTIFICATE" className="rounded-xl py-3 font-medium">Certificate Layout</SelectItem>
                                        <SelectItem value="REPORT_CARD" className="rounded-xl py-3 font-medium">Academic Report Card</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-slate-400">Template Category</label>
                                </div>
                                <Select
                                    value={formData.category}
                                    onValueChange={(v) => setFormData({ ...formData, category: v })}
                                >
                                    <SelectTrigger className="h-14 rounded-2xl bg-gray-50 dark:bg-slate-950 border-none px-5 font-medium"><SelectValue /></SelectTrigger>
                                    <SelectContent className="rounded-2xl border-none shadow-2xl dark:bg-slate-900">
                                        {availableCategories.map((cat) => (
                                            <SelectItem key={cat.value} value={cat.value} className="rounded-xl py-3 font-medium">
                                                {cat.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Editor Row */}
                    <div className="space-y-4 md:space-y-6 pt-4 md:pt-6 border-t border-gray-100 dark:border-slate-800">
                        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-4 md:gap-6">
                            <div className="space-y-1 md:space-y-2">
                                <label className="text-xs md:text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white flex items-center gap-2">
                                    <FileText className="h-4 md:h-5 w-4 md:w-5 text-indigo-500" /> Source Editor
                                </label>
                                <p className="text-[10px] md:text-xs text-gray-500 dark:text-slate-400 font-medium max-w-xl">Standard HTML/CSS supported. Use variables for dynamic data injection.</p>
                            </div>
                            <div className="flex flex-nowrap overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide gap-2 w-full xl:w-auto">
                                {["name", "class", "admissionNo", "school.name", "school.address", "academicYear", "issueDate"].map(v => (
                                    <button
                                        key={v}
                                        type="button"
                                        onClick={() => insertVariable(v)}
                                        className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl transition-all flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                                    >
                                        <Variable className="h-3 w-3" /> {v}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="relative group">
                            <textarea
                                className="w-full min-h-[400px] md:min-h-[600px] rounded-[1.5rem] md:rounded-[2rem] border-2 border-transparent bg-gray-50 dark:bg-slate-950 p-4 md:p-8 text-xs md:text-sm focus:ring-0 focus:border-indigo-400 outline-none dark:text-slate-300 font-mono resize-y shadow-inner leading-relaxed transition-all"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                placeholder="&lt;!-- Structure your document here --&gt;&#10;&lt;div class='wrapper'&gt;...&lt;/div&gt;"
                            />
                        </div>

                        <div className="flex items-start gap-4 p-5 bg-blue-50/50 dark:bg-indigo-900/10 rounded-2xl border border-blue-100/50 dark:border-indigo-500/20 max-w-4xl">
                            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0 mt-0.5">
                                <Info className="h-4 w-4 text-blue-600 dark:text-indigo-400" />
                            </div>
                            <p className="text-xs leading-relaxed text-blue-800 dark:text-indigo-300 font-medium">
                                Use the variable pills above to rapidly insert curly-brace expressions. During document generation, these tags (e.g., <code className="bg-white/50 dark:bg-black/20 px-1 py-0.5 rounded mx-1">{"{{student.name}}"}</code>) will map exactly to the underlying database hooks.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col-reverse md:flex-row justify-end gap-3 md:gap-4 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="h-12 md:h-14 px-8 rounded-xl md:rounded-2xl font-bold bg-gray-50 hover:bg-gray-100 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800 border-none w-full md:w-auto"
                            onClick={() => router.push("/dashboard/superadmin/documents")}
                        >
                            Discard
                        </Button>
                        <Button
                            type="submit"
                            className="h-12 md:h-14 px-10 rounded-xl md:rounded-2xl font-black uppercase tracking-wider bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 dark:shadow-none transition-all hover:-translate-y-0.5 w-full md:w-auto"
                            disabled={isSaving}
                        >
                            {isSaving ? "Publishing..." : <><Save className="h-5 w-5 mr-2" /> Save Template</>}
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
