import Head from 'next/head'
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/home/navbar/Navbar";
import Footer from "@/components/home/footer/Footer";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import Loader from '@/components/ui/feedback/Loader';

export default function ResetPasswordPage() {
    const router = useRouter();
    const { token } = router.query;

    const [formData, setFormData] = useState({
        newPassword: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (formData.newPassword.length < 8) {
            setError("Password must be at least 8 characters long");
            return;
        }

        if (!token) {
            setError("Reset token is missing. Please check your email link again.");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            const response = await fetch("/api/v1/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,
                    newPassword: formData.newPassword
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to reset password. The link may be expired.");
            }

            setIsSuccess(true);
            // Auto redirect to login after 3 seconds
            setTimeout(() => {
                router.push("/login");
            }, 3000);
        } catch (err: any) {
            setError(err.message || "Something went wrong. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Head>
                <title>Reset Password - LearnXChain</title>
                <meta name="description" content="Set a new password for your account" />
            </Head>
            <div className="min-h-screen bg-white dark:bg-[#0B0E14] transition-colors duration-300 relative">
                {/* Global Page Background Architecture */}
                <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                    {/* Radial Mesh Gradient */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#0057C815_0%,transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_-20%,#0057C820_0%,transparent_50%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_40%,#5CDD2B08_0%,transparent_40%)] dark:bg-[radial-gradient(circle_at_80%_40%,#5CDD2B10_0%,transparent_40%)]" />
                    
                    {/* Static Grid Pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
                    
                    {/* Animated Ambient Light Orbs */}
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.15, 0.25, 0.15],
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-[20%] left-[-5%] w-[35%] h-[35%] bg-[#0057C8] rounded-full blur-[120px]"
                    />
                </div>

                <div className="relative z-10">
                    <Navbar simplified />
                    <div className="flex items-center justify-center px-4 py-20 pt-32 min-h-[calc(100vh-80px)]">
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.5, type: "spring" }}
                            className="w-full max-w-md"
                        >
                            <div className="relative rounded-3xl border-2 border-gray-100 dark:border-white/5 bg-white/60 dark:bg-[#0C1018] backdrop-blur-xl p-8 sm:p-10 shadow-2xl overflow-hidden">
                                <div className="relative z-10">
                                    {/* Logo */}
                                    <div className="flex justify-center mb-8">
                                        <Link href="/" className="flex items-center gap-3 group">
                                            <motion.div
                                                whileHover={{ scale: 1.1, rotate: [0, -10, 10, -10, 0] }}
                                                transition={{ duration: 0.5 }}
                                                className="relative h-12 w-12"
                                            >
                                                <div className="absolute inset-0 bg-[#0057C8]/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                                                <div className="relative h-12 w-12">
                                                    <Image
                                                        src="/logo.png"
                                                        alt="Logo"
                                                        width={48}
                                                        height={48}
                                                        className="object-contain"
                                                        priority
                                                    />
                                                </div>
                                            </motion.div>
                                            <span className="text-2xl font-[var(--font-grotesk)] font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent tracking-tight">
                                                Learn<span className="text-[#5CDD2B]">X</span>Chain
                                            </span>
                                        </Link>
                                    </div>

                                    {isSuccess ? (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="text-center py-8"
                                        >
                                            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-50 dark:bg-green-500/10 mb-6">
                                                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-500" />
                                            </div>
                                            <h2 className="text-2xl font-[var(--font-grotesk)] font-bold text-gray-900 dark:text-white mb-4">Password Updated!</h2>
                                            <p className="text-gray-600 dark:text-gray-400 font-medium mb-8 max-w-[280px] mx-auto">
                                                Your security credentials have been synchronized. Redirecting you to login...
                                            </p>
                                            <div className="h-1 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: "100%" }}
                                                    transition={{ duration: 3 }}
                                                    className="h-full bg-gradient-to-r from-[#0057C8] to-[#1A9FFF]"
                                                />
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <>
                                            <div className="text-center mb-8">
                                                <h1 className="text-3xl font-[var(--font-grotesk)] font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Security Shield</h1>
                                                <p className="text-sm font-bold text-[#0057C8] dark:text-[#1A9FFF] uppercase tracking-widest">Set New Password</p>
                                            </div>

                                            <form onSubmit={handleSubmit} className="space-y-5">
                                                {error && (
                                                    <motion.div
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        className="bg-red-50 dark:bg-red-500/10 border-2 border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-500 text-xs font-bold px-4 py-3 rounded-2xl flex items-center gap-2"
                                                    >
                                                        <div className="h-1.5 w-1.5 rounded-full bg-red-600 dark:bg-red-500 animate-pulse" />
                                                        {error}
                                                    </motion.div>
                                                )}

                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 tracking-widest ml-1">Secure Password</label>
                                                    <div className="relative group/input">
                                                        <input
                                                            name="newPassword"
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="••••••••"
                                                            value={formData.newPassword}
                                                            onChange={handleChange}
                                                            required
                                                            className="w-full rounded-2xl bg-white/50 dark:bg-[#0C1018]/50 border-2 border-gray-100 dark:border-white/10 px-4 py-4 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-700 focus:outline-none focus:border-[#0057C8] focus:ring-4 focus:ring-[#0057C8]/10 transition-all font-medium"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0057C8] dark:hover:text-white transition-colors"
                                                        >
                                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 tracking-widest ml-1">Confirm Protocol</label>
                                                    <input
                                                        name="confirmPassword"
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder="••••••••"
                                                        value={formData.confirmPassword}
                                                        onChange={handleChange}
                                                        required
                                                        className="w-full rounded-2xl bg-white/50 dark:bg-[#0C1018]/50 border-2 border-gray-100 dark:border-white/10 px-4 py-4 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-700 focus:outline-none focus:border-[#0057C8] focus:ring-4 focus:ring-[#0057C8]/10 transition-all font-medium"
                                                    />
                                                </div>

                                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                                    <Button
                                                        type="submit"
                                                        disabled={isSubmitting}
                                                        className="w-full h-14 bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] text-white font-bold text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-[#0057C8]/30 active:scale-[0.98] transition-all disabled:opacity-50"
                                                    >
                                                        {isSubmitting ? (
                                                            <div className="flex items-center gap-2">
                                                                <Loader size="sm" variant="white" />
                                                                Updating...
                                                            </div>
                                                        ) : "Establish New Access"}
                                                    </Button>
                                                </motion.div>
                                            </form>

                                            <div className="mt-8 text-center pt-6 border-t border-gray-200 dark:border-white/5">
                                                <Link
                                                    href="/login"
                                                    className="text-[10px] font-bold uppercase text-[#0057C8] dark:text-[#1A9FFF] hover:underline tracking-widest transition-colors flex items-center justify-center gap-2"
                                                >
                                                    Back to Security Terminal
                                                </Link>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                    <Footer simplified />
                </div>
            </div>
        </>
    );
}
