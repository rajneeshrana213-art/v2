import React, { useState, useEffect } from 'react';
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Briefcase, Users, FileText, MoreVertical, Edit, Trash2, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { Loader } from "@/components/ui/feedback/Loader";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Job {
    id: string;
    title: string;
    location: string;
    type: string;
    tag: string;
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    createdAt: string;
    _count: {
        applications: number;
    };
}

interface Application {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    status: string;
    createdAt: string;
    job: {
        title: string;
    };
    resumeUrl?: string;
    coverLetter?: string;
}

export default function CareersDashboard() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("jobs");
    const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
    const [editingJob, setEditingJob] = useState<any>(null);

    // Form states for Job
    const [formData, setFormData] = useState({
        title: "",
        location: "Remote",
        type: "Full-time",
        tag: "Engineering",
        description: "",
        status: "DRAFT"
    });

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === "jobs") {
                const res = await fetch("/api/v1/superadmin/careers/jobs");
                const data = await res.json();
                setJobs(data);
            } else {
                const res = await fetch("/api/v1/superadmin/careers/applications");
                const data = await res.json();
                setApplications(data);
            }
        } catch (error) {
            toast.error("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdateJob = async (e: React.FormEvent) => {
        e.preventDefault();
        const method = editingJob ? "PUT" : "POST";
        const url = editingJob
            ? `/api/v1/superadmin/careers/jobs/${editingJob.id}`
            : "/api/v1/superadmin/careers/jobs";

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast.success(editingJob ? "Job updated" : "Job created");
                setIsJobDialogOpen(false);
                setEditingJob(null);
                setFormData({ title: "", location: "Remote", type: "Full-time", tag: "Engineering", description: "", status: "DRAFT" });
                fetchData();
            } else {
                toast.error("Failed to save job");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const handleDeleteJob = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            const res = await fetch(`/api/v1/superadmin/careers/jobs/${id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Job deleted");
                fetchData();
            }
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    const updateApplicationStatus = async (id: string, status: string) => {
        try {
            const res = await fetch(`/api/v1/superadmin/careers/applications/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (res.ok) {
                toast.success("Status updated");
                fetchData();
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    }

    return (
        <DashboardLayout role="superadmin">
            <Head>
                <title>Careers Management | Super Admin</title>
            </Head>

            <div className="p-6 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Careers Portal</h1>
                        <p className="text-gray-500 dark:text-gray-400">Manage job openings and track applicant progress.</p>
                    </div>
                    <Dialog open={isJobDialogOpen} onOpenChange={setIsJobDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md">
                                <Plus className="mr-2 h-4 w-4" /> Post New Job
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[550px]">
                            <DialogHeader>
                                <DialogTitle>{editingJob ? "Edit Job Posting" : "Create New Job Posting"}</DialogTitle>
                                <DialogDescription>
                                    Fill in the details for the job opening.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateOrUpdateJob} className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Job Title</Label>
                                        <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Senior Backend Engineer" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="location">Location</Label>
                                        <Input id="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="e.g. Remote, New Delhi" required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="type">Employment Type</Label>
                                        <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Full-time">Full-time</SelectItem>
                                                <SelectItem value="Part-time">Part-time</SelectItem>
                                                <SelectItem value="Contract">Contract</SelectItem>
                                                <SelectItem value="Internship">Internship</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="tag">Category</Label>
                                        <Select value={formData.tag} onValueChange={(v) => setFormData({ ...formData, tag: v })}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Engineering">Engineering</SelectItem>
                                                <SelectItem value="Product">Product</SelectItem>
                                                <SelectItem value="Sales">Sales</SelectItem>
                                                <SelectItem value="Marketing">Marketing</SelectItem>
                                                <SelectItem value="Operations">Operations</SelectItem>
                                                <SelectItem value="Design">Design</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Job Description (Supports Markdown-ish)</Label>
                                    <textarea
                                        id="description"
                                        className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Describe the role, responsibilities, and requirements..."
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status">Publish Status</Label>
                                    <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="DRAFT">Draft</SelectItem>
                                            <SelectItem value="PUBLISHED">Published</SelectItem>
                                            <SelectItem value="ARCHIVED">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsJobDialogOpen(false)}>Cancel</Button>
                                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">Save Job</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Tabs defaultValue="jobs" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full max-w-[400px] grid-cols-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                        <TabsTrigger value="jobs" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm">
                            <Briefcase className="mr-2 h-4 w-4" /> Manage Jobs
                        </TabsTrigger>
                        <TabsTrigger value="applicants" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm">
                            <Users className="mr-2 h-4 w-4" /> Applicants
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="jobs" className="mt-6">
                        {loading ? (
                            <div className="flex justify-center items-center h-64"><Loader size="lg" /></div>
                        ) : jobs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-xl bg-gray-50 dark:bg-gray-900/40">
                                <Briefcase className="h-10 w-10 text-gray-400 mb-2" />
                                <p className="text-gray-500">No job postings yet. Create one to start hiring!</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {jobs.map((job) => (
                                    <div key={job.id} className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:shadow-xl transition-all duration-300">
                                        <div className="flex items-start justify-between mb-4">
                                            <Badge variant={job.status === 'PUBLISHED' ? 'success' : job.status === 'DRAFT' ? 'secondary' : 'outline' as any}>
                                                {job.status}
                                            </Badge>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => {
                                                        setEditingJob(job);
                                                        setFormData({
                                                            title: job.title,
                                                            location: job.location,
                                                            type: job.type,
                                                            tag: job.tag,
                                                            description: (job as any).description || "",
                                                            status: job.status
                                                        });
                                                        setIsJobDialogOpen(true);
                                                    }}>
                                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteJob(job.id)}>
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{job.title}</h3>
                                        <div className="flex items-center text-sm text-gray-500 mb-4">
                                            <span>{job.location} • {job.type}</span>
                                        </div>
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                                            <div className="flex items-center text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                                                <Users className="mr-1.5 h-4 w-4" /> {job._count.applications} Applicants
                                            </div>
                                            <span className="text-xs text-gray-400">Created {new Date(job.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="applicants" className="mt-6">
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 uppercase text-xs font-bold text-gray-500">
                                        <tr>
                                            <th className="px-6 py-4">Applicant</th>
                                            <th className="px-6 py-4">Job Role</th>
                                            <th className="px-6 py-4">Date Joined</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {loading ? (
                                            <tr><td colSpan={5} className="text-center py-10"><Loader size="md" /></td></tr>
                                        ) : applications.length === 0 ? (
                                            <tr><td colSpan={5} className="text-center py-10 text-gray-500">No applicants yet.</td></tr>
                                        ) : (
                                            applications.map((app) => (
                                                <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-semibold text-gray-900 dark:text-white">{app.fullName}</div>
                                                        <div className="text-xs text-gray-500">{app.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-medium">{app.job.title}</td>
                                                    <td className="px-6 py-4 text-gray-500">{new Date(app.createdAt).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4">
                                                        <Select value={app.status} onValueChange={(val) => updateApplicationStatus(app.id, val)}>
                                                            <SelectTrigger className="w-[130px] h-8 text-xs">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="PENDING">Pending</SelectItem>
                                                                <SelectItem value="REVIEWING">Reviewing</SelectItem>
                                                                <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
                                                                <SelectItem value="REJECTED">Rejected</SelectItem>
                                                                <SelectItem value="HIRED">Hired</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700">
                                                                    <Eye className="h-4 w-4 mr-1.5" /> View
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="max-w-2xl">
                                                                <DialogHeader>
                                                                    <DialogTitle>Application Details</DialogTitle>
                                                                </DialogHeader>
                                                                <div className="space-y-6 pt-4">
                                                                    <div className="grid grid-cols-2 gap-8">
                                                                        <div className="space-y-1">
                                                                            <Label className="text-gray-400">Full Name</Label>
                                                                            <p className="font-semibold text-gray-900 dark:text-white">{app.fullName}</p>
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <Label className="text-gray-400">Job Title</Label>
                                                                            <p className="font-semibold text-indigo-600 dark:text-indigo-400">{app.job.title}</p>
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <Label className="text-gray-400">Email Address</Label>
                                                                            <p className="font-medium">{app.email}</p>
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <Label className="text-gray-400">Phone Number</Label>
                                                                            <p className="font-medium">{app.phone || 'N/A'}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label className="text-gray-400">Resume Link</Label>
                                                                        <div>
                                                                            {app.resumeUrl ? (
                                                                                <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm text-indigo-600 hover:underline">
                                                                                    <FileText className="mr-1.5 h-4 w-4" /> View Resume
                                                                                </a>
                                                                            ) : (
                                                                                <span className="text-sm text-gray-500 italic">No resume provided</span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label className="text-gray-400">Cover Letter</Label>
                                                                        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                                                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                                                                                {app.coverLetter || "No cover letter provided."}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </DialogContent>
                                                        </Dialog>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
