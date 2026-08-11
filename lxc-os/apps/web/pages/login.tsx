import Head from 'next/head'
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import Navbar from "@/components/home/navbar/Navbar";
import Footer from "@/components/home/footer/Footer";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { Lock } from "lucide-react";
import { Eye } from "lucide-react";
import { EyeOff } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { Sparkles } from "lucide-react";
import { Building2 } from "lucide-react";
import { MessageSquare } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { signIn } from "next-auth/react";


export default function LoginPage() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const { login } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (router.query.error) {
            if (router.query.error === "AccessDenied") {
                setError("Only registered users can log in with Google. Please contact your administrator.");
            } else {
                setError("An error occurred during authentication. Please try again.");
            }
        }
    }, [router.query.error]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        if (e.target.name === "email") {
            value = value.toLowerCase();
        }
        setFormData({
            ...formData,
            [e.target.name]: value,
        });
        setError("");
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: prev[e.target.name as keyof typeof prev].trim(),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            await login(formData.email.trim(), formData.password.trim());
            // Redirect is handled inside login()
        } catch (err: any) {
            setError(err.message || "Invalid email or password. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Head>
                <title>Login - LearnXChain</title>
                <meta name="description" content="Sign in to your LearnXChain account" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
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

                    <div className="relative flex items-center justify-center px-4 py-20 pt-32 min-h-[calc(100vh-80px)]">
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.5, type: "spring" }}
                            className="w-full max-w-2xl"
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
                                                        alt="LearnXChain Logo"
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

                                    {/* Header */}
                                    <div className="text-center mb-8">
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 }}
                                            className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#0057C8]/20 bg-[#0057C8]/5 dark:bg-[#0057C8]/10 px-4 py-1.5 text-sm font-bold text-[#0057C8] dark:text-[#1A9FFF] backdrop-blur-md"
                                        >
                                            <Sparkles className="h-4 w-4 text-[#FFC555]" />
                                            <span>Welcome back</span>
                                        </motion.div>
                                        <h1 className="text-3xl sm:text-4xl font-[var(--font-grotesk)] font-bold text-gray-900 dark:text-white mb-2">
                                            Sign in to your account
                                        </h1>
                                        <p className="text-gray-600 dark:text-gray-400 font-medium">
                                            Continue to School dashboard
                                        </p>
                                    </div>

                                    {/* Form */}
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-red-50 dark:bg-red-500/10 border-2 border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2 font-bold"
                                            >
                                                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {error}
                                            </motion.div>
                                        )}

                                        <div>
                                            <label htmlFor="email" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                                Email Address or Username
                                            </label>
                                            <div className="relative">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                                                    <Mail className="h-5 w-5" />
                                                </div>
                                                <input
                                                    id="email"
                                                    name="email"
                                                    type="text"
                                                    placeholder="you@example.com or Username"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    required
                                                    className="w-full rounded-xl border-2 border-gray-100 dark:border-white/10 bg-white/50 dark:bg-[#0C1018]/50 backdrop-blur-md pl-12 pr-4 py-3.5 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:border-[#0057C8] focus:ring-2 focus:ring-[#0057C8]/30 transition-all font-medium"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="password" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                                Password
                                            </label>
                                            <div className="relative">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                                                    <Lock className="h-5 w-5" />
                                                </div>
                                                <input
                                                    id="password"
                                                    name="password"
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Enter your password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    required
                                                    className="w-full rounded-xl border-2 border-gray-100 dark:border-white/10 bg-white/50 dark:bg-[#0C1018]/50 backdrop-blur-md pl-12 pr-12 py-3.5 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:border-[#0057C8] focus:ring-2 focus:ring-[#0057C8]/30 transition-all font-medium"
                                                />
                                                <motion.button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-[#0057C8] dark:hover:text-[#1A9FFF] transition-colors"
                                                >
                                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                </motion.button>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <label className="flex items-center cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-gray-300 dark:border-white/10 bg-white dark:bg-[#0C1018] text-[#0057C8] focus:ring-2 focus:ring-[#0057C8]/30 focus:ring-offset-0 cursor-pointer"
                                                />
                                                <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-[#0057C8] dark:group-hover:text-[#1A9FFF] transition-colors">
                                                    Remember me
                                                </span>
                                            </label>
                                            <Link
                                                href="/forgot-password"
                                                className="text-sm font-bold text-[#0057C8] dark:text-[#1A9FFF] hover:underline transition-all"
                                            >
                                                Forgot password?
                                            </Link>
                                        </div>

                                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                            <Button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] text-white font-bold py-3.5 shadow-lg shadow-[#0057C8]/30 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <span className="relative z-10 flex items-center justify-center gap-2">
                                                    {isSubmitting ? (
                                                        <>
                                                            <motion.div
                                                                animate={{ rotate: 360 }}
                                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                                className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full"
                                                            />
                                                            Signing in...
                                                        </>
                                                    ) : (
                                                        <>
                                                            Sign in
                                                            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                                        </>
                                                    )}
                                                </span>
                                            </Button>
                                        </motion.div>
                                    </form>
                                    {/* Social Login Buttons */}
                                    <div className="relative my-6">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-200 dark:border-white/10" />
                                        </div>
                                        <div className="relative flex justify-center">
                                            <span className="px-4 text-xs font-bold text-gray-500 dark:text-gray-400 bg-white dark:bg-[#0C1018] rounded-full">
                                                or continue with
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <motion.button
                                            type="button"
                                            onClick={() => signIn("google")}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full flex items-center justify-center gap-3 rounded-xl border-2 border-gray-100 dark:border-white/10 bg-white/50 dark:bg-[#0C1018]/50 backdrop-blur-md px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-white/10 transition-all shadow-sm"
                                        >
                                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                            </svg>
                                            Sign in with Google
                                        </motion.button>
                                    </div>
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

