
import { useEffect, useState } from "react";
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Megaphone, Search, Plus, MoreVertical, Edit, Trash2, Calendar, Users, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import client from "@/lib/api/client";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/forms/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Loader } from "@/components/ui/feedback/Loader";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";

const noticeSchema = z.object({
    title: z.string().min(1, "Title is required"),
    message: z.string().min(1, "Message is required"),
    noticeDate: z.string().min(1, "Notice date is required"),
    publishDate: z.string().min(1, "Publish date is required"),
    recipients: z.array(z.string()).min(1, "Select at least one recipient type"),
    attachment: z.any().optional(),
});

type NoticeFormValues = z.infer<typeof noticeSchema>;

interface Notice {
    id: string;
    title: string;
    message: string;
    noticeDate: string;
    publishDate: string;
    attachment: string | null;
    recipients: { userType: string }[];
    creator: { name: string };
    createdAt: string;
}

const USER_TYPES = [
    { label: "Students", value: "STUDENT" },
    { label: "Teachers", value: "TEACHER" },
    { label: "Parents", value: "PARENT" },
    { label: "Admin", value: "ADMIN" },
    { label: "Accountant", value: "ACCOUNTANT" },
    { label: "Librarian", value: "LIBRARIAN" },
    { label: "Receptionist", value: "RECEPTIONIST" },
];

export default function NoticesPage() {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors }
    } = useForm<NoticeFormValues>({
        resolver: zodResolver(noticeSchema),
        defaultValues: {
            recipients: ["STUDENT", "TEACHER"],
            noticeDate: format(new Date(), "yyyy-MM-dd"),
            publishDate: format(new Date(), "yyyy-MM-dd"),
        }
    });

    const selectedRecipients = watch("recipients") || [];

    useEffect(() => {
        fetchNotices();
    }, []);

    const fetchNotices = async () => {
        try {
            setLoading(true);
            const response = await client.get("/v1/dashboard/admin/management/notices");
            setNotices(response.data);
        } catch (error: any) {
            toast.error("Failed to load notices");
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: NoticeFormValues) => {
        try {
            setIsSubmitting(true);
            const formData = new FormData();
            formData.append("title", data.title);
            formData.append("message", data.message);
            formData.append("noticeDate", data.noticeDate);
            formData.append("publishDate", data.publishDate);
            data.recipients.forEach(r => formData.append("recipients[]", r));

            if (data.attachment instanceof File) {
                formData.append("attachment", data.attachment);
            } else if (typeof data.attachment === "string") {
                formData.append("attachment", data.attachment);
            }

            if (editingNotice) {
                formData.append("id", editingNotice.id);
                await client.put("/v1/dashboard/admin/management/notices", formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                toast.success("Notice updated successfully");
            } else {
                await client.post("/v1/dashboard/admin/management/notices", formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                toast.success("Notice published successfully");
            }
            setIsDialogOpen(false);
            fetchNotices();
            reset();
            setEditingNotice(null);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to save notice");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (notice: Notice) => {
        setEditingNotice(notice);
        setValue("title", notice.title);
        setValue("message", notice.message);
        setValue("noticeDate", format(new Date(notice.noticeDate), "yyyy-MM-dd"));
        setValue("publishDate", format(new Date(notice.publishDate), "yyyy-MM-dd"));
        setValue("recipients", notice.recipients.map(r => r.userType));
        setValue("attachment", notice.attachment);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this notice?")) return;
        try {
            await client.delete(`/v1/dashboard/admin/management/notices?id=${id}`);
            toast.success("Notice deleted");
            fetchNotices();
        } catch (error: any) {
            toast.error("Failed to delete notice");
        }
    };

    const toggleRecipient = (value: string) => {
        const current = [...selectedRecipients];
        const index = current.indexOf(value);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(value);
        }
        setValue("recipients", current);
    };

    const columns: ColumnDef<Notice>[] = [
        {
            key: "title",
            header: "Notice Details",
            render: (title, notice) => (
                <div className="flex flex-col gap-1">
                    <span className="font-bold text-gray-900 dark:text-white">{title}</span>
                    <span className="text-xs text-gray-500 line-clamp-1">{notice.message}</span>
                </div>
            )
        },
        {
            key: "recipients",
            header: "Target",
            render: (recipients: { userType: string }[]) => (
                <div className="flex flex-wrap gap-1">
                    {recipients.map(r => (
                        <Badge key={r.userType} tone="info" variant="soft" className="text-[10px] uppercase">
                            {r.userType}
                        </Badge>
                    ))}
                </div>
            )
        },
        {
            key: "noticeDate",
            header: "Notice Date",
            render: (date) => (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Calendar className="h-3 w-3" />
                    <span className="text-xs font-medium">{format(new Date(date), "MMM dd, yyyy")}</span>
                </div>
            )
        },
        {
            key: "attachment",
            header: "Attachment",
            render: (url) => url ? (
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 font-bold text-[10px] uppercase tracking-wider"
                >
                    <FileText className="h-3 w-3" /> View Project
                </a>
            ) : (
                <span className="text-gray-300 text-[10px] font-bold uppercase tracking-wider">—</span>
            )
        },
        {
            key: "creator",
            header: "Posted By",
            render: (creator) => (
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                        {creator?.name?.charAt(0) || "A"}
                    </div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{creator?.name}</span>
                </div>
            )
        },
        {
            key: "actions",
            header: "Actions",
            align: "right",
            render: (_, notice) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(notice)}>
                            <Edit className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-rose-600" onClick={() => handleDelete(notice.id)}>
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ];

    const filteredNotices = notices.filter(n =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.message.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout role="admin">
            <Head>
                <title>Notice Board | Admin Dashboard</title>
            </Head>

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                            <Megaphone className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                Notice Board
                            </h1>
                            <p className="text-sm text-gray-500 font-medium tracking-tight">Post announcements and important updates for school members</p>
                        </div>
                    </div>

                    <Dialog open={isDialogOpen} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) {
                            setEditingNotice(null);
                            reset();
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 font-bold uppercase text-[10px] tracking-widest px-6 h-11 shadow-lg shadow-indigo-500/20">
                                <Plus className="h-4 w-4" /> Create Notice
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-xl">
                            <DialogHeader>
                                <DialogTitle>{editingNotice ? "Edit Notice" : "Create New Notice"}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                                <Input
                                    label="Notice Title"
                                    placeholder="e.g., Annual Sports Meet 2024"
                                    {...register("title")}
                                    error={errors.title?.message}
                                />
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-gray-700 dark:text-slate-200">Message</label>
                                    <textarea
                                        className="w-full min-h-[100px] p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900/60 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                        placeholder="Type your announcement here..."
                                        {...register("message")}
                                    />
                                    {errors.message && <p className="text-[11px] text-rose-300">{errors.message.message}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Notice Date"
                                        type="date"
                                        min={format(new Date(), "yyyy-MM-dd")}
                                        {...register("noticeDate")}
                                        error={errors.noticeDate?.message}
                                    />
                                    <Input
                                        label="Publish Date"
                                        type="date"
                                        min={format(new Date(), "yyyy-MM-dd")}
                                        {...register("publishDate")}
                                        error={errors.publishDate?.message}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-gray-700 dark:text-slate-200 flex items-center gap-2">
                                        <FileText className="h-4 w-4" /> Attachment (Image or Document)
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="file"
                                            className="hidden"
                                            id="notice-attachment"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) setValue("attachment", file);
                                            }}
                                        />
                                        <label
                                            htmlFor="notice-attachment"
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-gray-300 dark:border-white/10 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all cursor-pointer text-xs font-medium text-gray-600 dark:text-gray-400"
                                        >
                                            <Plus className="h-4 w-4" /> {watch("attachment") ? (watch("attachment") as any).name || "Change File" : "Upload File"}
                                        </label>
                                        {watch("attachment") && typeof watch("attachment") === "string" && (
                                            <a href={watch("attachment") as string} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-indigo-600 uppercase">Current Attachment</a>
                                        )}
                                        {watch("attachment") && (
                                            <button
                                                type="button"
                                                onClick={() => setValue("attachment", null)}
                                                className="text-[10px] font-bold text-rose-500 uppercase"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-medium text-gray-700 dark:text-slate-200 flex items-center gap-2">
                                        <Users className="h-4 w-4" /> Targeted Recipients
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {USER_TYPES.map(type => (
                                            <button
                                                key={type.value}
                                                type="button"
                                                onClick={() => toggleRecipient(type.value)}
                                                className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-tight transition-all border ${selectedRecipients.includes(type.value)
                                                    ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20"
                                                    : "bg-white dark:bg-slate-800 border-gray-200 dark:border-white/5 text-gray-500 dark:text-gray-400 hover:border-indigo-400"
                                                    }`}
                                            >
                                                {type.label}
                                            </button>
                                        ))}
                                    </div>
                                    {errors.recipients && <p className="text-[11px] text-rose-300">{errors.recipients.message}</p>}
                                </div>

                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setIsDialogOpen(false)}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="bg-indigo-600 hover:bg-indigo-700 min-w-[120px]"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? <Loader size="sm" variant="white" /> : (editingNotice ? "Update Notice" : "Publish Notice")}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Main Content */}
                <Card className="border-none shadow-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-[2rem]">
                    <CardHeader className="pb-4">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search notices..."
                                className="pl-9 bg-white dark:bg-gray-800 rounded-xl border-none shadow-sm h-11"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={columns}
                            data={filteredNotices}
                            loading={loading}
                            emptyState={
                                <div className="py-12 flex flex-col items-center gap-3">
                                    <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                        <Megaphone className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 font-medium">No notices found</p>
                                    <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>
                                        Post your first notice
                                    </Button>
                                </div>
                            }
                        />
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
