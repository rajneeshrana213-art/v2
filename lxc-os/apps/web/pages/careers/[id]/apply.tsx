import Head from "next/head";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/home/navbar/Navbar";
import Footer from "@/components/home/footer/Footer";
import { roles } from "@/lib/careersData";
import {
    ArrowLeft,
    Send,
    Briefcase,
    MapPin,
    Clock,
} from "lucide-react";

export default function ApplyPage() {
    const router = useRouter();
    const { id } = router.query;

    const role = roles.find((r) => r.id === id);

    if (!role) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-[#05070B] dark:via-[#070B11] dark:to-[#05070B]">
                <Navbar />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Role not found
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            This position may no longer be available.
                        </p>
                        <Link
                            href="/careers"
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-md"
                        >
                            <ArrowLeft size={16} />
                            Back to Careers
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>Apply – {role.title} - LearnXChain</title>
                <meta
                    name="description"
                    content={`Apply for ${role.title} at LearnXChain`}
                />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-[#05070B] dark:via-[#070B11] dark:to-[#05070B]">
                <Navbar />

                <main className="relative">
                    {/* Background */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <motion.div
                            animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
                            transition={{
                                duration: 22,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            className="absolute left-[-200px] top-[10%] h-[500px] w-[500px] rounded-full bg-indigo-400/15 dark:bg-indigo-500/20 blur-[140px]"
                        />
                        <motion.div
                            animate={{
                                x: [0, -40, 0],
                                y: [0, -25, 0],
                                scale: [1, 1.15, 1],
                            }}
                            transition={{
                                duration: 26,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            className="absolute right-[-200px] top-[40%] h-[500px] w-[500px] rounded-full bg-purple-400/12 dark:bg-purple-500/18 blur-[140px]"
                        />
                        <div
                            className="absolute inset-0 opacity-[0.04] dark:opacity-[0.03]"
                            style={{
                                backgroundImage: `
                  linear-gradient(rgba(99, 102, 241, 0.2) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(99, 102, 241, 0.2) 1px, transparent 1px)
                `,
                                backgroundSize: "48px 48px",
                            }}
                        />
                    </div>

                    <div className="relative mx-auto max-w-2xl px-6 sm:px-8 pt-28 lg:pt-36 pb-20">
                        {/* Back link */}
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="mb-8"
                        >
                            <Link
                                href={`/careers/${role.id}`}
                                className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                                <ArrowLeft size={16} />
                                Back to {role.title}
                            </Link>
                        </motion.div>

                        {/* Role Summary Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="rounded-2xl border border-gray-200/70 dark:border-white/[0.06] bg-white/90 dark:bg-white/[0.03] backdrop-blur-xl p-6 mb-6"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div
                                    className={`rounded-lg ${role.tagBg} p-2.5`}
                                >
                                    <Briefcase
                                        size={18}
                                        className={role.tagColor}
                                    />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                                        Applying for
                                    </p>
                                    <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                                        {role.title}
                                    </h1>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100/60 dark:bg-white/[0.04] px-2.5 py-1 text-[11px] text-gray-600 dark:text-gray-400">
                                    <MapPin size={10} />
                                    {role.location}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100/60 dark:bg-white/[0.04] px-2.5 py-1 text-[11px] text-gray-600 dark:text-gray-400">
                                    <Clock size={10} />
                                    {role.type}
                                </span>
                            </div>
                        </motion.div>

                        {/* Application Form */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.5 }}
                            className="rounded-2xl border border-gray-200/70 dark:border-white/[0.06] bg-white/90 dark:bg-white/[0.03] backdrop-blur-xl p-7 sm:p-9"
                        >
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                Your Application
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                We review every thoughtful application. A founder will reach out
                                directly.
                            </p>

                            <form
                                className="space-y-5"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    // Handle form submission
                                }}
                            >
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                            Full Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="John Doe"
                                            className="w-full rounded-xl border border-gray-200/40 dark:border-white/[0.06] bg-white/60 dark:bg-white/[0.03] px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                            Email Address <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            placeholder="john@example.com"
                                            className="w-full rounded-xl border border-gray-200/40 dark:border-white/[0.06] bg-white/60 dark:bg-white/[0.03] px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            placeholder="+91 98765 43210"
                                            className="w-full rounded-xl border border-gray-200/40 dark:border-white/[0.06] bg-white/60 dark:bg-white/[0.03] px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                            Current Location
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. New Delhi"
                                            className="w-full rounded-xl border border-gray-200/40 dark:border-white/[0.06] bg-white/60 dark:bg-white/[0.03] px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                        LinkedIn / Portfolio URL
                                    </label>
                                    <input
                                        type="url"
                                        placeholder="https://linkedin.com/in/yourprofile"
                                        className="w-full rounded-xl border border-gray-200/40 dark:border-white/[0.06] bg-white/60 dark:bg-white/[0.03] px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                        Resume Link <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="url"
                                        required
                                        placeholder="Google Drive / Dropbox link to your resume"
                                        className="w-full rounded-xl border border-gray-200/40 dark:border-white/[0.06] bg-white/60 dark:bg-white/[0.03] px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                        Why this role? <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        rows={5}
                                        required
                                        placeholder="Tell us what excites you about this role and what you'd bring to LearnXChain..."
                                        className="w-full rounded-xl border border-gray-200/40 dark:border-white/[0.06] bg-white/60 dark:bg-white/[0.03] px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                        Anything else you&apos;d like to share?
                                    </label>
                                    <textarea
                                        rows={3}
                                        placeholder="Projects, open source, achievements, or anything relevant..."
                                        className="w-full rounded-xl border border-gray-200/40 dark:border-white/[0.06] bg-white/60 dark:bg-white/[0.03] px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all resize-none"
                                    />
                                </div>

                                <motion.button
                                    type="submit"
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-sm font-semibold text-white shadow-xl shadow-indigo-500/20 hover:shadow-2xl hover:shadow-indigo-500/40 transition-all"
                                >
                                    <Send size={16} />
                                    Submit Application
                                </motion.button>

                                <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center leading-relaxed">
                                    By submitting, you agree that we may contact you regarding this
                                    role and keep your profile on file for future opportunities.
                                </p>
                            </form>
                        </motion.div>
                    </div>
                </main>

                <Footer />
            </div>
        </>
    );
}
