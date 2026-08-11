import React, { useState, useEffect, useMemo } from "react";
import { X, Save, FileText, Layout, Globe, School as SchoolIcon, Search, Info, HelpCircle, Variable, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/forms/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "react-toastify";
import client from "@/lib/api/client";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/context/AuthContext";

interface TemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    template?: any;
}

export default function TemplateModal({ isOpen, onClose, onSuccess, template }: TemplateModalProps) {
    const { user } = useAuth();
    const isSuperAdmin = user?.role === "superadmin";

    const [formData, setFormData] = useState({
        name: template?.name || "",
        description: template?.description || "",
        type: template?.type || "CERTIFICATE",
        category: template?.category || "BONAFIDE",
        content: template?.content || "This is to certify that {{name}} is a student of {{class}}.",
        isDefault: template?.isDefault || false,
        schoolId: template?.schoolId || null,
    });
    const [loading, setLoading] = useState(false);
    const [schools, setSchools] = useState<any[]>([]);
    const [schoolSearch, setSchoolSearch] = useState("");

    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: template?.name || "",
                description: template?.description || "",
                type: template?.type || "CERTIFICATE",
                category: template?.category || "BONAFIDE",
                content: typeof template?.content === 'string' ? template.content : (template?.content ? JSON.stringify(template.content, null, 2) : "This is to certify that {{name}} is a student of {{class}}."),
                isDefault: template?.isDefault || false,
                schoolId: template?.schoolId || null,
            });
        }
    }, [isOpen, template]);

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
        if (isSuperAdmin && isOpen) {
            fetchSchools();
        }
    }, [isSuperAdmin, isOpen]);

    const fetchSchools = async () => {
        try {
            const res = await client.get("/v1/superadmin/schools?limit=200");
            setSchools(res.data.data || []);
        } catch (err: any) {
            console.error("Failed to fetch schools", err);
            toast.error("Failed to load schools list. Please try again.");
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
            setLoading(true);
            if (template?.id) {
                await client.put(`/v1/dashboard/admin/documents/templates/${template.id}`, formData);
                toast.success("Template updated");
            } else {
                await client.post("/v1/dashboard/admin/documents/templates", formData);
                toast.success("Template created");
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.message || "Failed to save template");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[150] flex justify-end">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm dark:bg-slate-950/40"
                    />
                    <motion.div
                        initial={{ x: "100%", opacity: 0.5 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: "100%", opacity: 0.5 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="relative w-full max-w-5xl bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col h-full border-l border-gray-100 dark:border-slate-800"
                    >
                        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
                            <div className="p-6 border-b flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50 dark:border-slate-700">
                                <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2 dark:text-white">
                                    <Layout className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                    {template ? "Edit Template" : "New Template"}
                                </h3>
                                <Button type="button" variant="ghost" size="icon" onClick={onClose}>
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            <div className="p-8 space-y-6 flex-1 overflow-y-auto">
                                {isSuperAdmin && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-500">Target School</label>
                                            <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-full uppercase tracking-tighter">Required for specific schools</span>
                                        </div>
                                        <Select
                                            value={formData.schoolId || "common"}
                                            onValueChange={(v) => setFormData({ ...formData, schoolId: v === "common" ? null : v })}
                                        >
                                            <SelectTrigger className="w-full h-12 rounded-2xl border-gray-200 dark:border-white/10 dark:bg-slate-950">
                                                <SelectValue placeholder="Select target">
                                                    {formData.schoolId === null || formData.schoolId === "common" ? "Common Template" : schools.find(s => s.id === formData.schoolId)?.schoolName}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent className="max-h-[300px] rounded-2xl border-gray-200 dark:border-white/10 dark:bg-slate-900 shadow-2xl">
                                                <div className="p-2 border-b dark:border-white/10 sticky top-0 bg-white dark:bg-slate-900 z-10">
                                                    <div className="relative">
                                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                                                        <input
                                                            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-gray-50 dark:bg-slate-800 border-none outline-none focus:ring-1 focus:ring-indigo-500"
                                                            placeholder="Search schools..."
                                                            value={schoolSearch}
                                                            onChange={(e) => setSchoolSearch(e.target.value)}
                                                            onClick={(e) => e.stopPropagation()}
                                                            onKeyDown={(e) => e.stopPropagation()}
                                                        />
                                                    </div>
                                                </div>
                                                <SelectItem value="common" className="rounded-xl focus:bg-indigo-50 dark:focus:bg-indigo-900/20 mt-1">
                                                    <div className="flex items-center gap-2 py-1">
                                                        <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                                            <Globe className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-sm">Common Template</span>
                                                            <span className="text-[10px] text-gray-400">Available to all schools on the platform</span>
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                                {filteredSchools.map((school) => (
                                                    <SelectItem key={school.id} value={school.id} className="rounded-xl focus:bg-indigo-50 dark:focus:bg-indigo-900/20">
                                                        <div className="flex items-center gap-2 py-1">
                                                            <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                                <SchoolIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-sm">{school.schoolName}</span>
                                                                <span className="text-[10px] text-gray-400">{school.city || "Organization"}</span>
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                                {filteredSchools.length === 0 && schoolSearch && (
                                                    <div className="p-4 text-center text-xs text-gray-400">No schools match your search</div>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-500 flex gap-1 items-center">
                                            Template Name <Info className="h-3 w-3" />
                                        </label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Ex: Classic Bonafide"
                                            className="h-12 rounded-2xl dark:bg-slate-950 dark:border-white/10"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-500">Document Type</label>
                                            <HelpCircle className="h-3 w-3 text-gray-300" />
                                        </div>
                                        <Select
                                            value={formData.type}
                                            onValueChange={(v) => setFormData({ ...formData, type: v })}
                                        >
                                            <SelectTrigger className="h-12 rounded-2xl dark:bg-slate-950 dark:border-white/10"><SelectValue /></SelectTrigger>
                                            <SelectContent className="rounded-2xl border-gray-200 dark:border-white/10 dark:bg-slate-900">
                                                <SelectItem value="ID_CARD" className="rounded-xl">ID Card</SelectItem>
                                                <SelectItem value="CERTIFICATE" className="rounded-xl">Certificate</SelectItem>
                                                <SelectItem value="REPORT_CARD" className="rounded-xl">Report Card</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-[9px] text-gray-400 italic">Broad category for the document layout</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-500">Category</label>
                                        <span className="text-[9px] text-indigo-500 font-bold uppercase tracking-tight">Specific usage</span>
                                    </div>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(v) => setFormData({ ...formData, category: v })}
                                    >
                                        <SelectTrigger className="h-12 rounded-2xl dark:bg-slate-950 dark:border-white/10"><SelectValue /></SelectTrigger>
                                        <SelectContent className="rounded-2xl border-gray-200 dark:border-white/10 dark:bg-slate-900">
                                            {availableCategories.map((cat) => (
                                                <SelectItem key={cat.value} value={cat.value} className="rounded-xl">
                                                    {cat.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-[9px] text-gray-400 italic">The exact purpose of this template</p>
                                </div>

                                <div className="space-y-2 pt-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-500">Description</label>
                                    <Input
                                        value={formData.description}
                                        onChange={(e: any) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Brief purpose of this template"
                                        className="h-12 rounded-2xl dark:bg-slate-950 dark:border-white/10"
                                    />
                                </div>

                                <div className="space-y-4 pt-4 border-t dark:border-white/5">
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-500 flex items-center gap-1">
                                                <FileText className="h-3 w-3" /> Template Content
                                            </label>
                                            <p className="text-[9px] text-gray-500 dark:text-slate-400 font-medium">Use HTML or Markdown for the layout</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {["name", "class", "admissionNo"].map(v => (
                                                <button
                                                    key={v}
                                                    type="button"
                                                    onClick={() => insertVariable(v)}
                                                    className="px-2 py-1 text-[8px] font-black uppercase tracking-tighter bg-gray-100 hover:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-indigo-900/30 text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg border dark:border-white/10 transition-colors flex items-center gap-1"
                                                >
                                                    <Variable className="h-2 w-2" /> {v}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <textarea
                                        rows={20}
                                        className="w-full min-h-[500px] rounded-[2rem] border border-gray-200 dark:border-white/10 p-6 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none dark:bg-slate-950 dark:text-slate-100 font-mono resize-y"
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        placeholder="<html>Your layout here...</html>"
                                    />
                                    <div className="flex items-start gap-2 p-4 bg-blue-50/50 dark:bg-indigo-900/10 rounded-2xl border border-blue-100/50 dark:border-indigo-500/20">
                                        <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0 mt-0.5">
                                            <Info className="h-3 w-3 text-blue-600 dark:text-indigo-400" />
                                        </div>
                                        <p className="text-[10px] leading-relaxed text-blue-700 dark:text-indigo-300 font-medium italic">
                                            Click the buttons above to insert dynamic variables. These will be replaced by actual student data during document generation.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isDefault"
                                        checked={formData.isDefault}
                                        onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                    />
                                    <label htmlFor="isDefault" className="text-sm font-medium text-gray-700 dark:text-slate-300">Set as default for this category</label>
                                </div>
                            </div>

                            <div className="p-6 bg-gray-50 dark:bg-slate-800/50 border-t dark:border-slate-700 flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                                <Button
                                    type="submit"
                                    className="bg-indigo-600 hover:bg-indigo-700 gap-2 min-w-[120px]"
                                    disabled={loading}
                                >
                                    {loading ? "Saving..." : <><Save className="h-4 w-4" /> Save Template</>}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
