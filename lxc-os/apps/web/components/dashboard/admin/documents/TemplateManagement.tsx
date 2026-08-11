import React, { useState, useEffect } from "react";
import { encodeId } from "@/lib/utils/hashId";
import { Plus, Edit, Trash2, FileText, CheckCircle, Info, Globe, School as SchoolIcon, Eye, Layout as LayoutIcon, Printer, BadgeCheck, FileType, Search } from "lucide-react";
import { Input } from "@/components/ui/forms/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";
import client from "@/lib/api/client";
import { useAuth } from "@/lib/context/AuthContext";
import { useRouter } from "next/router";
import TemplatePreviewModal from "./TemplatePreviewModal";
import { ConfirmModal } from "@/components/ui/modals/ConfirmModal";
import { cn } from "@/lib/utils";

export default function TemplateManagement() {
    const { user } = useAuth();
    const router = useRouter();
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [templateToPreview, setTemplateToPreview] = useState<any>(null);
    const [templateToDelete, setTemplateToDelete] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const isSuperAdmin = user?.role === "superadmin";

    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedType, setSelectedType] = useState("all");

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const response = await client.get("/v1/dashboard/admin/documents/templates");
            setTemplates(response.data);
        } catch (err: any) {
            toast.error(err.message || "Failed to load templates");
        } finally {
            setLoading(false);
        }
    };

    const filteredTemplates = templates.filter((template) => {
        const matchesTab =
            activeTab === "all" ||
            (activeTab === "common" && !template.schoolId) ||
            (activeTab === "school" && template.schoolId);

        const matchesSearch =
            template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.school?.schoolName?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType =
            selectedType === "all" ||
            template.type === selectedType;

        return matchesTab && matchesSearch && matchesType;
    });

    const handleEdit = (template: any) => {
        router.push(`/dashboard/superadmin/documents/templates/${encodeId(template.id)}`);
    };

    const handleCreate = () => {
        router.push(`/dashboard/superadmin/documents/templates/new`);
    };

    const handlePreview = (template: any) => {
        setTemplateToPreview(template);
        setIsPreviewOpen(true);
    };

    const confirmDelete = (template: any) => {
        setTemplateToDelete(template);
    };

    const executeDeleteTemplate = async () => {
        if (!templateToDelete) return;
        setIsDeleting(true);
        try {
            await client.delete(`/v1/dashboard/admin/documents/templates/${templateToDelete.id}`);
            toast.success("Template deleted");
            fetchTemplates();
        } catch (err: any) {
            toast.error(err.message || "Failed to delete template");
        } finally {
            setIsDeleting(false);
            setTemplateToDelete(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="hidden md:flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900/50 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm">
                <div className="min-w-0">
                    <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight dark:text-white truncate">Document Templates</h3>
                    <p className="text-[10px] md:text-sm text-gray-500 dark:text-gray-400 font-medium pb-2 truncate">Configure layouts for ID cards, Certificates, and Reports</p>
                </div>
                {isSuperAdmin && (
                    <Button onClick={handleCreate} className="w-full md:w-auto gap-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl md:rounded-2xl px-6 h-11 md:h-12 shadow-lg shadow-indigo-200 dark:shadow-none font-bold">
                        <Plus className="h-5 w-5" /> Create Template
                    </Button>
                )}
            </div>

            {/* Filters Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 bg-gray-50/50 dark:bg-slate-900/30 p-3 md:p-4 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 dark:border-white/5 items-center">
                <div className="relative group">
                    <Input
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        leftIcon={<Search className="h-4 w-4" />}
                        containerClassName="rounded-xl md:rounded-2xl border-none shadow-none bg-white dark:bg-slate-800/50 h-10 md:h-11"
                        className="text-sm"
                    />
                </div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="rounded-xl md:rounded-2xl h-10 md:h-11 border-none bg-white dark:bg-slate-800/50 font-medium text-sm">
                        <div className="flex items-center gap-2">
                            <FileType className="h-4 w-4 text-indigo-500" />
                            <SelectValue placeholder="All types" />
                        </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="ID_CARD">ID Cards</SelectItem>
                        <SelectItem value="CERTIFICATE">Certificates</SelectItem>
                        <SelectItem value="REPORT_CARD">Report Cards</SelectItem>
                    </SelectContent>
                </Select>
                <div className="bg-white dark:bg-slate-800/50 p-1 rounded-xl md:rounded-2xl flex items-center shadow-sm border border-gray-100 dark:border-white/5 h-10 md:h-11">
                    <button
                        onClick={() => setActiveTab("all")}
                        className={cn(
                            "flex-1 py-1.5 md:py-2 text-[10px] md:text-xs font-bold rounded-lg md:rounded-xl transition-all",
                            activeTab === "all" ? "bg-gray-900 text-white dark:bg-white dark:text-black shadow-lg" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5"
                        )}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setActiveTab("common")}
                        className={cn(
                            "flex-1 py-1.5 md:py-2 text-[10px] md:text-xs font-bold rounded-lg md:rounded-xl transition-all",
                            activeTab === "common" ? "bg-indigo-600 text-white shadow-lg" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5"
                        )}
                    >
                        Common
                    </button>
                    <button
                        onClick={() => setActiveTab("school")}
                        className={cn(
                            "flex-1 py-1.5 md:py-2 text-[10px] md:text-xs font-bold rounded-lg md:rounded-xl transition-all",
                            activeTab === "school" ? "bg-emerald-600 text-white shadow-lg" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5"
                        )}
                    >
                        School
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-6 md:gap-8">
                {filteredTemplates.map((template) => (
                    <Card key={template.id} className="group overflow-hidden border-none shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 dark:bg-gray-900 dark:border-white/5 rounded-[1.5rem] md:rounded-[2.5rem] bg-white">
                        <div className={cn(
                            "h-3 w-full",
                            template.type === 'ID_CARD' ? "bg-amber-400" :
                                template.type === 'CERTIFICATE' ? "bg-indigo-500" : "bg-emerald-500"
                        )} />
                        <CardHeader className="p-5 md:p-6 pb-4">
                            <div className="flex justify-between items-start mb-6">
                                {/* Left Section: Stacked Badges */}
                                <div className="flex flex-col gap-2 shrink-0 group-hover:translate-x-1 transition-transform duration-300">
                                    <Badge variant="soft" className="w-fit uppercase text-[9px] md:text-[10px] tracking-widest font-black px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-none shadow-sm">
                                        {template.type?.replace('_', ' ')}
                                    </Badge>
                                    {!template.schoolId ? (
                                        <Badge className="w-fit uppercase text-[9px] md:text-[10px] tracking-widest font-black px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-none flex gap-1.5 items-center shadow-sm">
                                            <Globe className="h-3.5 w-3.5" /> Common
                                        </Badge>
                                    ) : (
                                        <Badge className="w-fit uppercase text-[9px] md:text-[10px] tracking-widest font-black px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none flex gap-1.5 items-center max-w-[120px] shadow-sm">
                                            <SchoolIcon className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{template.school?.schoolName || "School"}</span>
                                        </Badge>
                                    )}
                                </div>

                                {/* Right Section: Glowing Icon Container */}
                                <div className="relative">
                                    {template.isDefault && (
                                        <div className="absolute -left-3 -top-1 z-10 h-7 w-7 md:h-8 md:w-8 bg-green-500 rounded-full flex items-center justify-center text-white shadow-xl ring-4 ring-white dark:ring-gray-900 animate-in zoom-in-50 duration-500" title="Default Template">
                                            <BadgeCheck className="h-4 w-4 md:h-5 md:w-5" />
                                        </div>
                                    )}
                                    <div className={cn(
                                        "h-16 w-16 md:h-22 md:w-22 rounded-2xl md:rounded-[32px] flex items-center justify-center shrink-0 shadow-2xl transition-all group-hover:scale-105 duration-500 relative overflow-hidden",
                                        template.type === 'ID_CARD' ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 shadow-amber-500/10" :
                                            template.type === 'CERTIFICATE' ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 shadow-indigo-500/10" :
                                                "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-emerald-500/10"
                                    )}>
                                        {/* Glow effect */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />

                                        {template.type === 'ID_CARD' ? <FileType className="h-8 w-8 md:h-11 md:w-11 relative z-10" /> :
                                            template.type === 'CERTIFICATE' ? <LayoutIcon className="h-8 w-8 md:h-11 md:w-11 relative z-10" /> :
                                                <FileText className="h-8 w-8 md:h-11 md:w-11 relative z-10" />}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 mt-4 md:text-center w-full">
                                <CardTitle className="text-base md:text-xl font-black dark:text-white tracking-tight uppercase leading-snug line-clamp-2" title={template.name}>
                                    {template.name}
                                </CardTitle>
                                <CardDescription className="text-xs md:text-sm dark:text-slate-400 font-medium leading-relaxed line-clamp-3 md:line-clamp-4 px-0 md:px-2" title={template.description}>
                                    {template.description || "Sophisticated document template designed for clarity and excellence."}
                                </CardDescription>
                            </div>
                        </CardHeader>

                        <CardContent className="px-6 pb-6 pt-2 w-full max-w-full">
                            {isSuperAdmin && (
                                <div className="flex flex-wrap items-center gap-2.5 mt-4">
                                    <Button
                                        className="flex-1 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 text-white font-black uppercase tracking-widest text-[10px] h-10 gap-2 shadow-lg shadow-slate-200 dark:shadow-none transition-all active:scale-95"
                                        onClick={() => handlePreview(template)}
                                    >
                                        <Eye className="h-4 w-4" /> Preview
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="rounded-xl h-10 w-10 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all active:scale-95"
                                        onClick={() => handleEdit(template)}
                                        title="Edit Template"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="rounded-xl h-10 w-10 border-transparent hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-500 transition-all active:scale-95 bg-rose-50/50 dark:bg-rose-500/5"
                                        onClick={() => confirmDelete(template)}
                                        title="Delete Template"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                            {!isSuperAdmin && (
                                <Button
                                    className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-10 gap-2 transition-all mt-4"
                                    onClick={() => handlePreview(template)}
                                >
                                    <Eye className="h-4 w-4" /> View Template
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredTemplates.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center py-32 bg-gray-50/50 dark:bg-slate-900/30 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-white/5 mx-auto max-w-2xl px-12 text-center group transition-all hover:border-indigo-200 dark:hover:border-indigo-400/20">
                    <div className="h-20 w-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-gray-200 dark:shadow-none transition-transform group-hover:scale-110">
                        <FileText className="h-10 w-10 text-indigo-400" />
                    </div>
                    <p className="font-black text-xl text-gray-900 dark:text-white uppercase tracking-tight">No templates found</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 font-medium mt-2 max-w-sm">
                        {searchQuery || selectedType !== "all"
                            ? "No templates match your current filter criteria. Try adjusting your search or filters."
                            : "Start by creating your first document template to manage school certificates and ID cards."}
                    </p>
                    {(searchQuery || selectedType !== "all" || activeTab !== "all") && (
                        <Button
                            variant="link"
                            onClick={() => {
                                setSearchQuery("");
                                setSelectedType("all");
                                setActiveTab("all");
                            }}
                            className="mt-4 text-indigo-600 dark:text-indigo-400 font-bold"
                        >
                            Reset all filters
                        </Button>
                    )}
                </div>
            )}

            <TemplatePreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                template={templateToPreview}
            />

            <ConfirmModal
                isOpen={!!templateToDelete}
                onClose={() => setTemplateToDelete(null)}
                onConfirm={executeDeleteTemplate}
                title="Delete Template"
                description={`Are you sure you want to delete the template "${templateToDelete?.name}"? This action cannot be undone.`}
                confirmText="Delete Template"
                cancelText="Keep Template"
                isLoading={isDeleting}
                variant="danger"
            />
        </div>
    );
}
