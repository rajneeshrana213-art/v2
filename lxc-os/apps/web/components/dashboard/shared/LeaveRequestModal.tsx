import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/feedback/Loader";
import { getISTDateString } from "@/lib/utils/date-utils";

interface LeaveRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { fromDate: string; toDate: string; reason: string }) => Promise<void>;
    title?: string;
    description?: string;
}

export const LeaveRequestModal: React.FC<LeaveRequestModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    title = "Apply for Leave",
    description = "Please provide the dates and reason for your leave request.",
}) => {
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fromDate || !toDate || !reason) return;

        setIsSubmitting(true);
        try {
            await onSubmit({ fromDate, toDate, reason });
            setFromDate("");
            setToDate("");
            setReason("");
            onClose();
        } catch (error) {
            console.error("Failed to submit leave request", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const today = getISTDateString();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="From Date"
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            min={today}
                            required
                        />
                        <Input
                            label="To Date"
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            min={fromDate || today}
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-700 dark:text-slate-200">
                            Reason
                        </label>
                        <textarea
                            className="flex min-h-[100px] w-full rounded-xl border border-gray-200 bg-white dark:bg-slate-900/60 px-3 py-2 text-sm text-gray-900 dark:text-slate-100 shadow-sm focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/50 outline-none transition-all dark:border-white/10"
                            placeholder="Explain the reason for leave..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center gap-2">
                                    <Loader size="sm" variant="white" />
                                    <span>Submitting...</span>
                                </div>
                            ) : "Submit Request"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
