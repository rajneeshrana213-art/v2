
import Head from "next/head";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import client from "@/lib/api/client";
import { MonitorPlay, Calendar, Clock, User, Building, MoreVertical, CheckCircle2, XCircle, Plus, Search, X, Mail, Phone, Building2, ExternalLink, MapPin, AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { Loader } from '@/components/ui/feedback/Loader';


export default function DemosPage() {
    const [demos, setDemos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState<any>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isFetchingDetails, setIsFetchingDetails] = useState(false);

    // New states for scheduling and filtering
    const [activeTab, setActiveTab] = useState<'Upcoming' | 'Completed' | 'Cancelled'>('Upcoming');
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [leads, setLeads] = useState<any[]>([]);
    const [isFetchingLeads, setIsFetchingLeads] = useState(false);
    const [leadSearchTerm, setLeadSearchTerm] = useState("");

    const [demoForm, setDemoForm] = useState({
        leadId: "",
        scheduledAt: "",
        meetingLink: "",
        notes: ""
    });

    const fetchDemos = async () => {
        try {
            setLoading(true);
            const res = await client.get("/v1/dashboard/employee/demos");
            setDemos(res.data || []);
        } catch (err) {
            console.error("Failed to fetch demos:", err);
            toast.error("Failed to load demos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDemos();
    }, []);

    const fetchLeads = async () => {
        try {
            setIsFetchingLeads(true);
            const response = await client.get("/v1/leads", { params: { limit: 100 } });
            setLeads(response.data.leads || []);
        } catch (err) {
            console.error("Failed to fetch leads:", err);
            toast.error("Failed to load leads for scheduling");
        } finally {
            setIsFetchingLeads(false);
        }
    };

    const handleScheduleDemo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!demoForm.leadId) {
            toast.error("Please select a lead first");
            return;
        }

        setIsSubmitting(true);
        try {
            await client.post(`/v1/leads/${demoForm.leadId}/demos`, {
                scheduledAt: new Date(demoForm.scheduledAt).toISOString(),
                notes: demoForm.notes,
                meetingLink: demoForm.meetingLink
            });
            toast.success("Demo scheduled successfully");
            setIsScheduleModalOpen(false);
            setDemoForm({ leadId: "", scheduledAt: "", meetingLink: "", notes: "" });
            fetchDemos();
        } catch (err: any) {
            console.error("Failed to schedule demo:", err);
            toast.error(err.response?.data?.error || "Failed to schedule demo");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateStatus = async (demoId: string, newStatus: string) => {
        try {
            await client.patch(`/v1/dashboard/employee/demos/${demoId}/status`, { status: newStatus });
            toast.success(`Demo marked as ${newStatus.toLowerCase()}`);
            fetchDemos();
        } catch (err: any) {
            console.error("Failed to update demo status:", err);
            toast.error(err.response?.data?.error || "Failed to update demo status");
        }
    };

    const filteredDemos = demos.filter(demo => {
        const demoDate = new Date(demo.scheduledAt);
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (activeTab === 'Upcoming') {
            // Upcoming shows SCHEDULED demos that are either today or in the future
            return demo.status === 'SCHEDULED' && demoDate >= startOfToday;
        }
        if (activeTab === 'Completed') {
            // Completed shows COMPLETED demos OR past SCHEDULED demos (optional: could highlight them in upcoming)
            // But usually, COMPLETED is strictly COMPLETED status.
            return demo.status === 'COMPLETED';
        }
        if (activeTab === 'Cancelled') return demo.status === 'CANCELLED';

        // Add a case for "Pending Action" if we want to show past due scheduled demos
        return true;
    });

    // Special filter for "Outdated" demos that need status update
    const overdueDemos = demos.filter(demo => {
        const demoDate = new Date(demo.scheduledAt);
        const now = new Date();
        return demo.status === 'SCHEDULED' && demoDate < now;
    });

    const filteredLeads = leads.filter(lead =>
        lead.schoolName.toLowerCase().includes(leadSearchTerm.toLowerCase()) ||
        lead.name.toLowerCase().includes(leadSearchTerm.toLowerCase())
    );

    const handleViewDetails = async (leadId: string) => {
        try {
            setIsFetchingDetails(true);
            setIsDetailsModalOpen(true);
            const response = await client.get(`/v1/leads/${leadId}`);
            setSelectedLead(response.data);
        } catch (err) {
            console.error("Failed to fetch lead details:", err);
            toast.error("Failed to load lead details");
            setIsDetailsModalOpen(false);
        } finally {
            setIsFetchingDetails(false);
        }
    };

    return (
        <>
            <Head>
                <title>Demos & Meetings - LearnXChain</title>
            </Head>
            <DashboardLayout role="employee">
                <div className="w-full mx-auto space-y-6 pb-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Demos & Meetings</h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                                Manage your scheduled school demonstrations and sales meetings.
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setIsScheduleModalOpen(true);
                                fetchLeads();
                            }}
                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all"
                        >
                            <Plus className="h-4 w-4" />
                            Schedule New Demo
                        </button>
                    </div>

                    {/* Search & Tabs Placeholder */}
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/10 pb-1">
                        <div className="flex gap-8">
                            {['Upcoming', 'Completed', 'Cancelled'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={cn(
                                        "pb-4 text-sm font-bold transition-all border-b-2",
                                        activeTab === tab ? "text-indigo-600 border-indigo-600" : "text-gray-400 border-transparent hover:text-gray-600"
                                    )}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <AnimatePresence>
                        {overdueDemos.length > 0 && activeTab === 'Upcoming' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-[2rem] p-6 mb-8"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                                    <h3 className="font-bold text-amber-900 dark:text-amber-100">Action Required: {overdueDemos.length} Past Demos</h3>
                                </div>
                                <p className="text-sm text-amber-700 dark:text-amber-300 mb-6">
                                    These demos have passed their scheduled time. Please mark them as completed or cancelled.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {overdueDemos.map(demo => (
                                        <div key={demo.id} className="bg-white/50 dark:bg-gray-900/50 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/20">
                                            <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">{demo.lead?.schoolName}</div>
                                            <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">{new Date(demo.scheduledAt).toLocaleDateString()}</div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleUpdateStatus(demo.id, 'COMPLETED')}
                                                    className="flex-1 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all border border-emerald-100 dark:border-emerald-900/50"
                                                >
                                                    Completed
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(demo.id, 'CANCELLED')}
                                                    className="flex-1 py-2 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all border border-rose-100 dark:border-rose-900/50"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Demos List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading ? (
                            Array(3).fill(0).map((_, i) => (
                                <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl p-6 animate-pulse">
                                    <div className="h-6 w-3/4 bg-gray-100 dark:bg-gray-800 rounded mb-4"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 w-1/2 bg-gray-100 dark:bg-gray-800 rounded"></div>
                                        <div className="h-4 w-1/3 bg-gray-100 dark:bg-gray-800 rounded"></div>
                                    </div>
                                </div>
                            ))
                        ) : filteredDemos.length > 0 ? (
                            filteredDemos.map((demo) => (
                                <div key={demo.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
                                                <MonitorPlay className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{demo.lead?.schoolName}</h3>
                                                <p className="text-xs text-gray-500 font-medium tracking-tight uppercase">{demo.lead?.name}</p>
                                            </div>
                                        </div>

                                        {activeTab === 'Upcoming' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleUpdateStatus(demo.id, 'COMPLETED')}
                                                    className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all border border-emerald-100 dark:border-emerald-900/50"
                                                >
                                                    Mark Completed
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(demo.id, 'CANCELLED')}
                                                    className="px-3 py-1.5 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all border border-rose-100 dark:border-rose-900/50"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-6 space-y-3">
                                        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                                            <Calendar className="h-4 w-4" />
                                            {new Date(demo.scheduledAt).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                                            <Clock className="h-4 w-4" />
                                            {new Date(demo.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        {demo.meetingLink && (
                                            <a
                                                href={demo.meetingLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-all"
                                            >
                                                <ExternalLink className="h-3 w-3" />
                                                Join Meeting
                                            </a>
                                        )}
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">Confirmed</span>
                                        <button
                                            onClick={() => handleViewDetails(demo.leadId)}
                                            className="text-xs font-bold text-indigo-600 hover:text-indigo-500"
                                        >
                                            View Lead Details
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center bg-gray-50 dark:bg-gray-800/20 rounded-3xl border-2 border-dashed border-gray-100 dark:border-white/5">
                                <MonitorPlay className="h-16 w-16 text-gray-200 mx-auto" />
                                <p className="text-gray-500 mt-4 font-medium">No {activeTab.toLowerCase()} demos found.</p>
                                <button
                                    onClick={() => setIsScheduleModalOpen(true)}
                                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all mx-auto"
                                >
                                    <Plus className="h-4 w-4" /> Schedule your first demo
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Lead Details Modal */}
                <AnimatePresence>
                    {isDetailsModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsDetailsModalOpen(false)}
                                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-xl bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl overflow-hidden"
                            >
                                {isFetchingDetails ? (
                                    <div className="p-20 flex flex-col items-center justify-center space-y-4">
                                        <Loader size="lg" />
                                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Loading Details...</p>
                                    </div>
                                ) : selectedLead ? (
                                    <div className="flex flex-col h-full">
                                        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center">
                                                    <Building2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{selectedLead.schoolName}</h3>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className={cn(
                                                            "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                                                            selectedLead.status === 'NEW' ? "bg-blue-100 text-blue-600" :
                                                                selectedLead.status === 'FOLLOW_UP' ? "bg-amber-100 text-amber-600" :
                                                                    selectedLead.status === 'DEMO_SCHEDULED' ? "bg-indigo-100 text-indigo-600" :
                                                                        selectedLead.status === 'CONVERTED' ? "bg-emerald-100 text-emerald-600" :
                                                                            "bg-gray-100 text-gray-600"
                                                        )}>
                                                            {selectedLead.status?.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setIsDetailsModalOpen(false)}
                                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                                            >
                                                <X className="h-5 w-5 text-gray-400" />
                                            </button>
                                        </div>

                                        <div className="p-8 space-y-8">
                                            {/* Contact Person */}
                                            <div className="grid grid-cols-2 gap-8">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Person</p>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                        <User className="h-4 w-4 text-indigo-500" />
                                                        {selectedLead.name}
                                                    </p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Source</p>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                        {selectedLead.source || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Details Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-white/5">
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center shadow-sm">
                                                            <Mail className="h-4 w-4 text-gray-400" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Email Address</span>
                                                            <span className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[150px]">{selectedLead.email}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center shadow-sm">
                                                            <Phone className="h-4 w-4 text-gray-400" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Phone Number</span>
                                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{selectedLead.phone}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className="h-8 w-8 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center shadow-sm mt-1">
                                                            <MapPin className="h-4 w-4 text-gray-400" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">School Address</span>
                                                            <span className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">{selectedLead.address}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 flex gap-4">
                                            <button
                                                onClick={() => setIsDetailsModalOpen(false)}
                                                className="flex-1 px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-semibold text-gray-700 dark:text-white hover:bg-gray-50 transition-all"
                                            >
                                                Close Details
                                            </button>
                                        </div>
                                    </div>
                                ) : null}
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Schedule Demo Modal */}
                <AnimatePresence>
                    {isScheduleModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsScheduleModalOpen(false)}
                                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl overflow-hidden"
                            >
                                <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Schedule New Demo</h3>
                                    <button
                                        onClick={() => setIsScheduleModalOpen(false)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                                    >
                                        <X className="h-5 w-5 text-gray-400" />
                                    </button>
                                </div>

                                <form onSubmit={handleScheduleDemo} className="p-8 space-y-6">
                                    {/* Lead Selection */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select School/Lead</label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search leads..."
                                                value={leadSearchTerm}
                                                onChange={(e) => setLeadSearchTerm(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-2xl outline-none text-sm focus:ring-2 focus:ring-indigo-500/20"
                                            />
                                        </div>
                                        <div className="mt-2 max-h-48 overflow-y-auto border border-gray-100 dark:border-white/5 rounded-2xl divide-y divide-gray-50 dark:divide-white/5">
                                            {isFetchingLeads ? (
                                                <div className="p-8 text-center"><Loader size="lg" /></div>
                                            ) : filteredLeads.length > 0 ? (
                                                filteredLeads.map(lead => (
                                                    <button
                                                        key={lead.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setDemoForm({ ...demoForm, leadId: lead.id });
                                                            setLeadSearchTerm(lead.schoolName);
                                                        }}
                                                        className={cn(
                                                            "w-full px-4 py-3 text-left hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex items-center justify-between group",
                                                            demoForm.leadId === lead.id ? "bg-indigo-50 dark:bg-indigo-900/40" : ""
                                                        )}
                                                    >
                                                        <div>
                                                            <div className="text-sm font-bold text-gray-900 dark:text-white">{lead.schoolName}</div>
                                                            <div className="text-[10px] text-gray-500 uppercase tracking-widest">{lead.name}</div>
                                                        </div>
                                                        {demoForm.leadId === lead.id && <CheckCircle2 className="h-4 w-4 text-indigo-600" />}
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="p-4 text-center text-xs text-gray-500 italic">No matching leads found</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date & Time</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <input
                                                    type="datetime-local"
                                                    required
                                                    min={(() => {
                                                        const now = new Date();
                                                        return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                                                    })()}
                                                    value={demoForm.scheduledAt}
                                                    onChange={(e) => setDemoForm({ ...demoForm, scheduledAt: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-2xl outline-none text-sm focus:ring-2 focus:ring-indigo-500/20"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Meeting Link (Optional)</label>
                                            <div className="relative">
                                                <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <input
                                                    type="url"
                                                    placeholder="Zoom/Meet Link"
                                                    value={demoForm.meetingLink}
                                                    onChange={(e) => setDemoForm({ ...demoForm, meetingLink: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-2xl outline-none text-sm focus:ring-2 focus:ring-indigo-500/20"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Notes</label>
                                            <textarea
                                                placeholder="Preparation notes..."
                                                value={demoForm.notes}
                                                onChange={(e) => setDemoForm({ ...demoForm, notes: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-2xl outline-none text-sm focus:ring-2 focus:ring-indigo-500/20 min-h-[100px] resize-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsScheduleModalOpen(false)}
                                            className="flex-1 px-6 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-white rounded-xl font-semibold text-sm hover:bg-gray-100 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || !demoForm.leadId}
                                            className="flex-1 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-500 shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {isSubmitting ? <Loader size="sm" variant="white" /> : <Plus className="h-4 w-4" />}
                                            {isSubmitting ? "Scheduling..." : "Schedule Demo"}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </DashboardLayout>
        </>
    );
}
