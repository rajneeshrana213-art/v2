
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
import { Sun, Search, Plus, MoreVertical, Edit, Trash2, Calendar, Clock } from 'lucide-react';
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
import { format, differenceInDays } from "date-fns";

const holidaySchema = z.object({
    name: z.string().min(1, "Holiday name is required"),
    date: z.string().min(1, "Main date is required"),
    fromday: z.string().optional(),
    toDay: z.string().optional(),
    description: z.string().optional(),
}).refine((data) => {
    if (data.fromday && data.toDay) {
        return new Date(data.toDay) >= new Date(data.fromday);
    }
    return true;
}, {
    message: "End date must be greater than or equal to start date",
    path: ["toDay"],
}).refine((data) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(data.date) >= today;
}, {
    message: "Holiday date cannot be in the past",
    path: ["date"],
});

type HolidayFormValues = z.infer<typeof holidaySchema>;

interface Holiday {
    id: string;
    name: string;
    date: string;
    fromday: string | null;
    toDay: string | null;
    description: string | null;
}

export default function HolidaysPage() {
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors }
    } = useForm<HolidayFormValues>({
        resolver: zodResolver(holidaySchema),
        defaultValues: {
            date: format(new Date(), "yyyy-MM-dd"),
        }
    });

    useEffect(() => {
        fetchHolidays();
    }, []);

    const fetchHolidays = async () => {
        try {
            setLoading(true);
            const response = await client.get("/v1/dashboard/admin/management/holidays");
            setHolidays(response.data);
        } catch (error: any) {
            toast.error("Failed to load holidays");
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: HolidayFormValues) => {
        try {
            setIsSubmitting(true);
            if (editingHoliday) {
                await client.put("/v1/dashboard/admin/management/holidays", {
                    id: editingHoliday.id,
                    ...data
                });
                toast.success("Holiday updated successfully");
            } else {
                await client.post("/v1/dashboard/admin/management/holidays", data);
                toast.success("Holiday added successfully");
            }
            setIsDialogOpen(false);
            fetchHolidays();
            reset();
            setEditingHoliday(null);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to save holiday");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (holiday: Holiday) => {
        setEditingHoliday(holiday);
        setValue("name", holiday.name);
        setValue("date", format(new Date(holiday.date), "yyyy-MM-dd"));
        setValue("fromday", holiday.fromday ? format(new Date(holiday.fromday), "yyyy-MM-dd") : "");
        setValue("toDay", holiday.toDay ? format(new Date(holiday.toDay), "yyyy-MM-dd") : "");
        setValue("description", holiday.description || "");
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this holiday?")) return;
        try {
            await client.delete(`/v1/dashboard/admin/management/holidays?id=${id}`);
            toast.success("Holiday removed");
            fetchHolidays();
        } catch (error: any) {
            toast.error("Failed to delete holiday");
        }
    };

    const columns: ColumnDef<Holiday>[] = [
        {
            key: "name",
            header: "Holiday Name",
            render: (name) => (
                <span className="font-bold text-gray-900 dark:text-white uppercase tracking-tight">{name}</span>
            )
        },
        {
            key: "date",
            header: "Schedule",
            render: (_, holiday) => {
                const start = holiday.fromday ? new Date(holiday.fromday) : new Date(holiday.date);
                const end = holiday.toDay ? new Date(holiday.toDay) : null;
                const duration = end ? differenceInDays(end, start) + 1 : 1;

                return (
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                            <Calendar className="h-3 w-3 text-amber-500" />
                            {format(start, "MMM dd, yyyy")} {end && ` - ${format(end, "MMM dd, yyyy")}`}
                        </div>
                        <Badge tone="warning" variant="soft" className="w-fit text-[9px] font-black uppercase tracking-widest">
                            {duration} {duration > 1 ? "Days" : "Day"}
                        </Badge>
                    </div>
                );
            }
        },
        {
            key: "description",
            header: "Description",
            render: (desc) => (
                <span className="text-xs text-gray-500 line-clamp-1 max-w-[300px]">
                    {desc || "Public Holiday"}
                </span>
            )
        },
        {
            key: "actions",
            header: "Actions",
            align: "right",
            render: (_, holiday) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(holiday)}>
                            <Edit className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-rose-600" onClick={() => handleDelete(holiday.id)}>
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ];

    const filteredHolidays = holidays.filter(h =>
        h.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout role="admin">
            <Head>
                <title>Holiday Calendar | Admin Dashboard</title>
            </Head>

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                            <Sun className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                School Holidays
                            </h1>
                            <p className="text-sm text-gray-500 font-medium tracking-tight">Manage official school holidays and vacations</p>
                        </div>
                    </div>

                    <Dialog open={isDialogOpen} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) {
                            setEditingHoliday(null);
                            reset();
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 bg-amber-500 hover:bg-amber-600 font-bold uppercase text-[10px] tracking-widest px-6 h-11 shadow-lg shadow-amber-500/20">
                                <Plus className="h-4 w-4" /> Add Holiday
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-xl">
                            <DialogHeader>
                                <DialogTitle>{editingHoliday ? "Edit Holiday" : "Add New Holiday"}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                                <Input
                                    label="Holiday Name"
                                    placeholder="e.g., Summer Vacation"
                                    {...register("name")}
                                    error={errors.name?.message}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="From Date"
                                        type="date"
                                        min={format(new Date(), "yyyy-MM-dd")}
                                        {...register("fromday")}
                                    />
                                    <Input
                                        label="To Date"
                                        type="date"
                                        min={format(new Date(), "yyyy-MM-dd")}
                                        {...register("toDay")}
                                    />
                                </div>

                                <Input
                                    label="Main Holiday Date (for listing)"
                                    type="date"
                                    min={format(new Date(), "yyyy-MM-dd")}
                                    {...register("date")}
                                    error={errors.date?.message}
                                    description="Usually the first day or the observed day."
                                />

                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-gray-700 dark:text-slate-200">Description</label>
                                    <textarea
                                        className="w-full min-h-[80px] p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900/60 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                        placeholder="Reason for holiday..."
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
                                        className="bg-amber-500 hover:bg-amber-600 min-w-[120px] text-white"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? <Loader size="sm" variant="white" /> : (editingHoliday ? "Update Holiday" : "Add Holiday")}
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
                                placeholder="Search holidays..."
                                className="pl-9 bg-white dark:bg-gray-800 rounded-xl border-none shadow-sm h-11"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={columns}
                            data={filteredHolidays}
                            loading={loading}
                            emptyState={
                                <div className="py-12 flex flex-col items-center gap-3">
                                    <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                        <Sun className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 font-medium">No holidays found</p>
                                    <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>
                                        Schedule a holiday
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
