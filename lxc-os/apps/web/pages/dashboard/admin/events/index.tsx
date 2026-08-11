
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
import { CalendarDays, Search, Plus, MoreVertical, Edit, Trash2, Calendar, Users, Clock, Filter } from 'lucide-react';
import client from "@/lib/api/client";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/forms/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Loader } from "@/components/ui/feedback/Loader";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";

const eventSchema = z.object({
    title: z.string().min(1, "Title is required"),
    category: z.enum(["CELEBRATION", "TRAINING", "MEETING", "HOLIDAYS", "CAMP"]),
    start: z.string().min(1, "Start date is required"),
    end: z.string().min(1, "End date is required"),
    description: z.string().optional(),
    targetAudience: z.enum(["ALL", "STUDENTS", "STAFFS"]),
}).refine((data) => {
    return new Date(data.end) > new Date(data.start);
}, {
    message: "End time must be after start time",
    path: ["end"],
}).refine((data) => {
   
    return new Date(data.start) >= new Date();
}, {
    message: "Start time cannot be in the past",
    path: ["start"],
});

type EventFormValues = z.infer<typeof eventSchema>;

interface Event {
    id: string;
    title: string;
    category: string;
    start: string;
    end: string;
    description: string | null;
    targetAudience: string;
    attachment: string | null;
}

const CATEGORIES = [
    { label: "Celebration", value: "CELEBRATION" },
    { label: "Training", value: "TRAINING" },
    { label: "Meeting", value: "MEETING" },
    { label: "Holidays", value: "HOLIDAYS" },
    { label: "Camp", value: "CAMP" },
];

const TARGETS = [
    { label: "All Members", value: "ALL" },
    { label: "Students Only", value: "STUDENTS" },
    { label: "Staff Only", value: "STAFFS" },
];

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        control,
        formState: { errors }
    } = useForm<EventFormValues>({
        resolver: zodResolver(eventSchema),
        defaultValues: {
            category: "CELEBRATION",
            targetAudience: "ALL",
            start: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
            end: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        }
    });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await client.get("/v1/dashboard/admin/management/events");
            setEvents(response.data);
        } catch (error: any) {
            toast.error("Failed to load events");
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: EventFormValues) => {
        try {
            setIsSubmitting(true);
            if (editingEvent) {
                await client.put("/v1/dashboard/admin/management/events", {
                    id: editingEvent.id,
                    ...data
                });
                toast.success("Event updated successfully");
            } else {
                await client.post("/v1/dashboard/admin/management/events", data);
                toast.success("Event created successfully");
            }
            setIsDialogOpen(false);
            fetchEvents();
            reset();
            setEditingEvent(null);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to save event");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (event: Event) => {
        setEditingEvent(event);
        setValue("title", event.title);
        setValue("category", event.category as any);
        setValue("start", format(new Date(event.start), "yyyy-MM-dd'T'HH:mm"));
        setValue("end", format(new Date(event.end), "yyyy-MM-dd'T'HH:mm"));
        setValue("description", event.description || "");
        setValue("targetAudience", event.targetAudience as any);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this event?")) return;
        try {
            await client.delete(`/v1/dashboard/admin/management/events?id=${id}`);
            toast.success("Event deleted");
            fetchEvents();
        } catch (error: any) {
            toast.error("Failed to delete event");
        }
    };

    const columns: ColumnDef<Event>[] = [
        {
            key: "title",
            header: "Event",
            render: (title, event) => (
                <div className="flex flex-col gap-1">
                    <span className="font-bold text-gray-900 dark:text-white uppercase tracking-tight">{title}</span>
                    <div className="flex items-center gap-2">
                        <Badge tone={
                            event.category === 'CELEBRATION' ? 'success' :
                                event.category === 'TRAINING' ? 'info' :
                                    event.category === 'MEETING' ? 'warning' : 'neutral'
                        } variant="soft" className="text-[9px] font-black tracking-widest px-2">
                            {event.category}
                        </Badge>
                        <span className="text-[10px] text-gray-400 font-medium">Target: {event.targetAudience}</span>
                    </div>
                </div>
            )
        },
        {
            key: "start",
            header: "Timeline",
            render: (_, event) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                        <Calendar className="h-3 w-3 text-indigo-500" />
                        {format(new Date(event.start), "MMM dd, yyyy")}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        <Clock className="h-3 w-3" />
                        {format(new Date(event.start), "p")} - {format(new Date(event.end), "p")}
                    </div>
                </div>
            )
        },
        {
            key: "description",
            header: "Details",
            render: (desc) => (
                <span className="text-xs text-gray-500 line-clamp-1 max-w-[200px]">
                    {desc || "No description provided"}
                </span>
            )
        },
        {
            key: "actions",
            header: "Actions",
            align: "right",
            render: (_, event) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(event)}>
                            <Edit className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-rose-600" onClick={() => handleDelete(event.id)}>
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ];

    const filteredEvents = events.filter(e => {
        const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === "all" || e.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    return (
        <DashboardLayout role="admin">
            <Head>
                <title>Event Management | Admin Dashboard</title>
            </Head>

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                            <CalendarDays className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                Event Calendar
                            </h1>
                            <p className="text-sm text-gray-500 font-medium tracking-tight">Schedule school events, meetings, and celebrations</p>
                        </div>
                    </div>

                    <Dialog open={isDialogOpen} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) {
                            setEditingEvent(null);
                            reset();
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 font-bold uppercase text-[10px] tracking-widest px-6 h-11 shadow-lg shadow-emerald-500/20">
                                <Plus className="h-4 w-4" /> Add Event
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-xl">
                            <DialogHeader>
                                <DialogTitle>{editingEvent ? "Edit Event" : "Add New Event"}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                                <Input
                                    label="Event Title"
                                    placeholder="e.g., Science Exhibition 2024"
                                    {...register("title")}
                                    error={errors.title?.message}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-gray-700 dark:text-slate-200">Category</label>
                                        <Controller
                                            name="category"
                                            control={control}
                                            render={({ field }) => (
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger className="h-10 text-xs">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {CATEGORIES.map(cat => (
                                                            <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.category && <p className="text-[11px] text-rose-300">{errors.category.message}</p>}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-gray-700 dark:text-slate-200">Target Audience</label>
                                        <Controller
                                            name="targetAudience"
                                            control={control}
                                            render={({ field }) => (
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger className="h-10 text-xs">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {TARGETS.map(t => (
                                                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.targetAudience && <p className="text-[11px] text-rose-300">{errors.targetAudience.message}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Starts At"
                                        type="datetime-local"
                                        min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                                        {...register("start")}
                                        error={errors.start?.message}
                                    />
                                    <Input
                                        label="Ends At"
                                        type="datetime-local"
                                        min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                                        {...register("end")}
                                        error={errors.end?.message}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-gray-700 dark:text-slate-200">Description</label>
                                    <textarea
                                        className="w-full min-h-[80px] p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900/60 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                        placeholder="Add more details about the event..."
                                        {...register("description")}
                                    />
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
                                        className="bg-emerald-600 hover:bg-emerald-700 min-w-[120px]"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? <Loader size="sm" variant="white" /> : (editingEvent ? "Update Event" : "Create Event")}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Find events..."
                            className="pl-9 bg-white dark:bg-gray-800 rounded-xl border-none shadow-sm h-11"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-400" />
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-[180px] h-11 bg-white dark:bg-gray-800 rounded-xl">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {CATEGORIES.map(cat => (
                                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Main Content */}
                <Card className="border-none shadow-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-[2rem]">
                    <CardContent className="pt-6">
                        <DataTable
                            columns={columns}
                            data={filteredEvents}
                            loading={loading}
                            emptyState={
                                <div className="py-12 flex flex-col items-center gap-3">
                                    <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                        <CalendarDays className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 font-medium">No events scheduled</p>
                                    <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>
                                        Schedule your first event
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
