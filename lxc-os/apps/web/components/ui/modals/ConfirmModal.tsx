import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2 } from "lucide-react";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
    variant?: "danger" | "warning" | "default";
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isLoading = false,
    variant = "danger",
}: ConfirmModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-900">
                <div className="px-6 py-8">
                    <div className="flex flex-col items-center text-center space-y-4">
                        {/* Icon Circle */}
                        <div
                            className={`h-16 w-16 rounded-full flex items-center justify-center ${variant === "danger"
                                ? "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400"
                                : variant === "warning"
                                    ? "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
                                    : "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400"
                                }`}
                        >
                            {variant === "danger" ? (
                                <Trash2 className="h-8 w-8" />
                            ) : (
                                <AlertTriangle className="h-8 w-8" />
                            )}
                        </div>

                        <DialogHeader className="pt-2 text-center items-center">
                            <DialogTitle className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
                                {title}
                            </DialogTitle>
                            <DialogDescription className="text-sm font-medium text-gray-500 dark:text-gray-400 max-w-[300px] leading-relaxed mx-auto">
                                {description}
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                </div>

                <DialogFooter className="bg-gray-50 dark:bg-slate-800 px-6 py-5 flex flex-row justify-between items-center sm:justify-between gap-3 border-t border-gray-100 dark:border-white/5 m-0 mt-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 rounded-2xl h-12 font-bold bg-white dark:bg-slate-900 border-none shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-all text-gray-700 dark:text-gray-300"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex-1 rounded-2xl h-12 font-bold shadow-lg transition-all text-white ${variant === "danger"
                            ? "bg-rose-600 hover:bg-rose-700 shadow-rose-200 dark:shadow-none"
                            : variant === "warning"
                                ? "bg-amber-600 hover:bg-amber-700 shadow-amber-200 dark:shadow-amber-900/20"
                                : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 dark:shadow-indigo-900/20"
                            }`}
                    >
                        {isLoading ? "Processing..." : confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
