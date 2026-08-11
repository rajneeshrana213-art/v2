import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users, CreditCard, AlertTriangle } from "lucide-react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";

interface LimitExceededModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUsers: number;
    allowedUsers: number;
    userType?: string; // e.g., "Student", "Teacher", "Staff"
}

export function LimitExceededModal({
    isOpen,
    onClose,
    currentUsers,
    allowedUsers,
    userType = "User"
}: LimitExceededModalProps) {
    const router = useRouter();

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-rose-100 dark:border-rose-900/30 shadow-2xl overflow-hidden rounded-2xl">
                {/* Header Decoration */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-500 to-amber-500" />

                <DialogHeader className="pt-6 relative z-10">
                    <div className="mx-auto mb-4 bg-rose-50 dark:bg-rose-500/10 h-16 w-16 rounded-full flex items-center justify-center border border-rose-100 dark:border-rose-500/20 shadow-sm relative overflow-hidden">
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        >
                            <AlertTriangle className="h-8 w-8 text-rose-500" />
                        </motion.div>
                        <div className="absolute inset-0 bg-rose-500/10 animate-ping opacity-50 rounded-full" />
                    </div>
                    <DialogTitle className="text-xl text-center font-bold text-gray-900 dark:text-white">
                        User Limit Reached
                    </DialogTitle>
                    <DialogDescription className="text-center font-medium mt-2 text-gray-500 dark:text-gray-400">
                        You've reached your subscription limit of <strong className="text-gray-900 dark:text-gray-200">{allowedUsers} users</strong>.
                        You cannot add another {userType}.
                    </DialogDescription>
                </DialogHeader>

                <div className="my-6 px-4">
                    <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4 border border-gray-100 dark:border-white/5 space-y-4">
                        <div className="flex justify-between items-center text-sm font-medium">
                            <span className="text-gray-600 dark:text-gray-400">Current Users:</span>
                            <span className="text-gray-900 dark:text-white font-bold">{currentUsers}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-medium">
                            <span className="text-gray-600 dark:text-gray-400">Plan Limit:</span>
                            <span className="text-indigo-600 dark:text-indigo-400 font-bold">{allowedUsers}</span>
                        </div>

                        <div className="space-y-2 mt-2">
                            <div className="flex justify-between text-xs font-bold text-gray-500">
                                <span>Capacity Used</span>
                                <span className="text-rose-500">100%</span>
                            </div>
                            <div className="h-2.5 w-full bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-rose-500 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="sm:justify-between flex-row gap-2 mt-2 px-2 pb-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="w-1/2 rounded-xl text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 font-semibold transition-all h-11"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={() => {
                            onClose();
                            router.push("/dashboard/admin/membership");
                        }}
                        className="w-1/2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 border-none font-bold transition-all h-11 group"
                    >
                        <CreditCard className="mr-2 h-4 w-4 group-hover:-translate-y-0.5 transition-transform" />
                        Upgrade Plan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
