import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

/**
 * Minimal safe markdown → HTML renderer.
 * Escapes raw HTML first so user-supplied content cannot inject scripts.
 * Supports: ## headings, **bold**, `code`, unordered lists, blank-line paragraphs.
 */
function renderMarkdown(md: string): string {
    // 1. Escape raw HTML to prevent XSS
    const escaped = md
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    const lines = escaped.split("\n");
    const out: string[] = [];
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // Inline: **bold**
        line = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        // Inline: `code`
        line = line.replace(/`([^`]+)`/g, '<code class="rounded bg-[#0057C8]/10 dark:bg-[#0057C8]/20 px-1.5 py-0.5 text-xs font-mono text-[#0057C8] dark:text-[#1A9FFF]">$1</code>');

        // ### h3
        if (/^###\s+/.test(line)) {
            if (inList) { out.push("</ul>"); inList = false; }
            out.push(`<h3 class="text-xl font-[var(--font-grotesk)] font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3">${line.replace(/^###\s+/, "")}</h3>`);
        }
        // ## h2
        else if (/^##\s+/.test(line)) {
            if (inList) { out.push("</ul>"); inList = false; }
            out.push(`<h2 class="text-2xl font-[var(--font-grotesk)] font-bold text-gray-900 dark:text-white mt-8 mb-4">${line.replace(/^##\s+/, "")}</h2>`);
        }
        // # h1
        else if (/^#\s+/.test(line)) {
            if (inList) { out.push("</ul>"); inList = false; }
            out.push(`<h1 class="text-3xl font-[var(--font-grotesk)] font-extrabold text-gray-900 dark:text-white mt-10 mb-5">${line.replace(/^#\s+/, "")}</h1>`);
        }
        // list item: - or *
        else if (/^[-*]\s+/.test(line)) {
            if (!inList) { out.push('<ul class="space-y-2.5 my-4">'); inList = true; }
            out.push(`<li class="flex items-start gap-3 text-base text-gray-600 dark:text-gray-400 font-medium leading-relaxed"><span class="mt-2.5 h-2 w-2 rounded-full bg-[#5CDD2B] flex-shrink-0"></span><span>${line.replace(/^[-*]\s+/, "")}</span></li>`);
        }
        // blank line
        else if (line.trim() === "") {
            if (inList) { out.push("</ul>"); inList = false; }
            out.push('<div class="h-4"></div>');
        }
        // normal paragraph line
        else {
            if (inList) { out.push("</ul>"); inList = false; }
            out.push(`<p class="text-base text-gray-600 dark:text-gray-400 font-medium leading-relaxed mb-4">${line}</p>`);
        }
    }

    if (inList) out.push("</ul>");
    return out.join("\n");
}
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/home/navbar/Navbar";
import Footer from "@/components/home/footer/Footer";
import {
    ArrowLeft,
    MapPin,
    Clock,
    CheckCircle2,
    ArrowRight,
    Send,
    Briefcase,
    X,
} from "lucide-react";
import { Loader } from "@/components/ui/feedback/Loader";
import toast from "react-hot-toast";

export default function CareerDetailPage() {
    const router = useRouter();
    const { id } = router.query;
    const [role, setRole] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showApply, setShowApply] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        fullName: "",
        email: "",
        phone: "",
        resumeUrl: "",
        coverLetter: ""
    });

    useEffect(() => {
        if (!id) return;
        fetch(`/api/v1/careers/jobs/${id}`)
            .then(res => res.json())
            .then(data => {
                setRole(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch("/api/v1/careers/apply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, jobId: id }),
            });
            if (res.ok) {
                toast.success("Application submitted successfully!");
                setShowApply(false);
                setForm({ fullName: "", email: "", phone: "", resumeUrl: "", coverLetter: "" });
            } else {
                toast.error("Failed to submit application");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#0B0E14] flex items-center justify-center transition-colors">
                <Loader size="lg" />
            </div>
        );
    }

    if (!role || role.message === "Job not found") {
        return (
            <div className="min-h-screen bg-white dark:bg-[#0B0E14] transition-colors relative">
                {/* Global Page Background Architecture */}
                <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#0057C815_0%,transparent_50%)]" />
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
                </div>
                
                <div className="relative z-10">
                    <Navbar />
                    <div className="flex items-center justify-center min-h-[70vh] px-4">
                        <div className="text-center max-w-lg">
                            <div className="inline-flex rounded-full bg-red-50 dark:bg-red-500/10 p-4 mb-6">
                                <X size={40} className="text-red-500" />
                            </div>
                            <h1 className="text-3xl font-[var(--font-grotesk)] font-bold text-gray-900 dark:text-white mb-4">
                                Role Discontinued
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 font-medium">
                                This position is no longer accepting applications or has been moved.
                            </p>
                            <Link
                                href="/careers"
                                className="inline-flex items-center gap-3 rounded-2xl bg-[#0057C8] px-8 py-4 text-base font-bold text-white shadow-xl shadow-[#0057C8]/20 hover:bg-[#1A9FFF] transition-all"
                            >
                                <ArrowLeft size={18} />
                                Back to Openings
                            </Link>
                        </div>
                    </div>
                    <Footer />
                </div>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>{role.title} - Careers - LearnXChain</title>
                <meta name="description" content={role.description} />
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
                            opacity: [0.1, 0.2, 0.1],
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-[10%] right-[-5%] w-[40%] h-[40%] bg-[#0057C8] rounded-full blur-[120px]"
                    />
                    <motion.div
                        animate={{
                            scale: [1.2, 1, 1.2],
                            opacity: [0.05, 0.15, 0.05],
                        }}
                        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-[20%] left-[-5%] w-[35%] h-[35%] bg-[#5CDD2B] rounded-full blur-[120px]"
                    />
                </div>

                <div className="relative z-10">
                    <Navbar />

                    <main>
                        {/* Section 1: Header - Odd (Deep Blue Wash) */}
                        <section className="bg-transparent bg-gradient-to-b from-[#0057C8]/5 to-transparent pt-32 pb-20">
                            <div className="relative mx-auto max-w-4xl px-6 sm:px-8">
                                {/* Back link */}
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="mb-10"
                                >
                                    <Link
                                        href="/careers"
                                        className="inline-flex items-center gap-2 text-sm font-bold text-[#0057C8] dark:text-[#1A9FFF] hover:text-[#5CDD2B] transition-colors"
                                    >
                                        <ArrowLeft size={16} />
                                        <span>Back to Opportunities</span>
                                    </Link>
                                </motion.div>

                                {/* Header Card */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="rounded-[2.5rem] border-2 border-gray-100 dark:border-white/5 bg-white/60 dark:bg-[#0C1018] p-8 sm:p-12 shadow-2xl backdrop-blur-xl relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#0057C8] via-[#1A9FFF] to-[#5CDD2B]" />
                                    
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8 mb-10">
                                        <div>
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="rounded-full bg-[#0057C8]/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-[#0057C8] dark:text-[#1A9FFF]">
                                                    {role.tag}
                                                </span>
                                            </div>
                                            <h1 className="text-4xl sm:text-5xl font-[var(--font-grotesk)] font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
                                                {role.title}
                                            </h1>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.05, y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setShowApply(true)}
                                            className="flex-shrink-0 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] px-10 py-5 text-base font-bold text-white shadow-xl shadow-[#0057C8]/20 hover:shadow-[#0057C8]/40 transition-all"
                                        >
                                            <Send size={18} />
                                            Apply for Role
                                        </motion.button>
                                    </div>

                                    <div className="flex flex-wrap gap-4">
                                        <span className="inline-flex items-center gap-2 rounded-2xl border-2 border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300">
                                            <MapPin size={16} className="text-[#5CDD2B]" />
                                            {role.location}
                                        </span>
                                        <span className="inline-flex items-center gap-2 rounded-2xl border-2 border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300">
                                            <Clock size={16} className="text-[#1A9FFF]" />
                                            {role.type}
                                        </span>
                                        <span className="inline-flex items-center gap-2 rounded-2xl border-2 border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300">
                                            <Briefcase size={16} className="text-[#0057C8]" />
                                            LearnXChain OS
                                        </span>
                                    </div>
                                </motion.div>
                            </div>
                        </section>

                        {/* Section 2: Details - Even (Neon Green Wash) */}
                        <section className="bg-transparent bg-gradient-to-b from-[#5CDD2B]/5 to-transparent pb-32">
                            <div className="mx-auto max-w-4xl px-6 sm:px-8">
                                <div className="space-y-8">
                                    {/* About */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="rounded-[2.5rem] border-2 border-gray-100 dark:border-white/5 bg-white/60 dark:bg-[#0C1018] p-10 shadow-xl backdrop-blur-xl"
                                    >
                                        <h2 className="text-2xl font-[var(--font-grotesk)] font-bold text-gray-900 dark:text-white mb-6">
                                            Mission & Context
                                        </h2>
                                        <div
                                            className="prose-base dark:prose-invert max-w-none"
                                            dangerouslySetInnerHTML={{ __html: renderMarkdown(role.description ?? "") }}
                                        />
                                    </motion.div>

                                    {/* Responsibilities */}
                                    {role.responsibilities?.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="rounded-[2.5rem] border-2 border-gray-100 dark:border-white/5 bg-white/60 dark:bg-[#0C1018] p-10 shadow-xl backdrop-blur-xl"
                                        >
                                            <h2 className="text-2xl font-[var(--font-grotesk)] font-bold text-gray-900 dark:text-white mb-8">
                                                Core Responsibilities
                                            </h2>
                                            <ul className="space-y-5">
                                                {role.responsibilities.map((item: string, i: number) => (
                                                    <motion.li
                                                        key={i}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.25 + i * 0.05 }}
                                                        className="flex items-start gap-4"
                                                    >
                                                        <div className="mt-1.5 h-6 w-6 rounded-full bg-[#5CDD2B]/20 flex items-center justify-center flex-shrink-0">
                                                            <CheckCircle2 className="h-4 w-4 text-[#5CDD2B]" />
                                                        </div>
                                                        <span className="text-lg text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                                                            {item}
                                                        </span>
                                                    </motion.li>
                                                ))}
                                            </ul>
                                        </motion.div>
                                    )}

                                    {/* Requirements */}
                                    {role.requirements?.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="rounded-[2.5rem] border-2 border-gray-100 dark:border-white/5 bg-white/60 dark:bg-[#0C1018] p-10 shadow-xl backdrop-blur-xl"
                                        >
                                            <h2 className="text-2xl font-[var(--font-grotesk)] font-bold text-gray-900 dark:text-white mb-8">
                                                Requirements & Skillset
                                            </h2>
                                            <ul className="space-y-5">
                                                {role.requirements.map((item: string, i: number) => (
                                                    <motion.li
                                                        key={i}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.35 + i * 0.05 }}
                                                        className="flex items-start gap-4"
                                                    >
                                                        <div className="mt-1.5 h-6 w-6 rounded-full bg-[#1A9FFF]/20 flex items-center justify-center flex-shrink-0">
                                                            <ArrowRight className="h-4 w-4 text-[#1A9FFF]" />
                                                        </div>
                                                        <span className="text-lg text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                                                            {item}
                                                        </span>
                                                    </motion.li>
                                                ))}
                                            </ul>
                                        </motion.div>
                                    )}

                                    {/* Perks */}
                                    {role.perks?.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 }}
                                            className="rounded-[2.5rem] border-2 border-gray-100 dark:border-white/5 bg-white/60 dark:bg-[#0C1018] p-10 shadow-xl backdrop-blur-xl"
                                        >
                                            <h2 className="text-2xl font-[var(--font-grotesk)] font-bold text-gray-900 dark:text-white mb-8">
                                                Perks & Growth
                                            </h2>
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                {role.perks.map((perk: string, i: number) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: 0.45 + i * 0.05 }}
                                                        className="flex items-center gap-3 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 px-6 py-4 text-base font-bold text-gray-700 dark:text-gray-300"
                                                    >
                                                        <CheckCircle2 className="h-5 w-5 text-[#5CDD2B]" />
                                                        {perk}
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Final CTA */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                        className="rounded-[2.5rem] border-2 border-[#0057C8]/20 bg-[#0057C8]/5 p-12 text-center backdrop-blur-xl"
                                    >
                                        <h2 className="text-3xl font-[var(--font-grotesk)] font-bold text-gray-900 dark:text-white mb-4">
                                            Ready to transform education?
                                        </h2>
                                        <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 font-medium">
                                            We review every application carefully. A team member will reach
                                            out if there&apos;s a potential match.
                                        </p>
                                        <motion.button
                                            whileHover={{ scale: 1.05, y: -4 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setShowApply(true)}
                                            className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] px-12 py-5 text-lg font-bold text-white shadow-2xl shadow-[#0057C8]/30 transition-all"
                                        >
                                            <Send size={20} />
                                            Submit Your Profile
                                        </motion.button>
                                    </motion.div>
                                </div>
                            </div>
                        </section>
                    </main>

                    <Footer />
                </div>

                {/* APPLY MODAL */}
                <AnimatePresence>
                    {showApply && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowApply(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6"
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 50, scale: 0.9 }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                onClick={(e) => e.stopPropagation()}
                                className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] border-2 border-gray-100 dark:border-white/5 bg-white dark:bg-[#0C1018] shadow-3xl z-[101]"
                            >
                                <div className="sticky top-0 bg-white/95 dark:bg-[#0C1018]/95 backdrop-blur-xl border-b-2 border-gray-100 dark:border-white/5 px-8 py-8 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-extrabold text-[#0057C8] dark:text-[#1A9FFF] uppercase tracking-widest mb-1">
                                            Application Portal
                                        </p>
                                        <h2 className="text-2xl font-[var(--font-grotesk)] font-bold text-gray-900 dark:text-white">
                                            {role.title}
                                        </h2>
                                    </div>
                                    <button
                                        onClick={() => setShowApply(false)}
                                        className="rounded-2xl p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleApply} className="px-8 py-10 space-y-8">
                                    <div className="grid gap-8 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">
                                                Full Name *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={form.fullName}
                                                onChange={e => setForm({ ...form, fullName: e.target.value })}
                                                placeholder="e.g. Rahul Sharma"
                                                className="w-full rounded-2xl border-2 border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 px-5 py-4 text-base font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#0057C8]/50 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">
                                                Email Address *
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                value={form.email}
                                                onChange={e => setForm({ ...form, email: e.target.value })}
                                                placeholder="rahul@example.com"
                                                className="w-full rounded-2xl border-2 border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 px-5 py-4 text-base font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#0057C8]/50 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-8 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">
                                                Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                value={form.phone}
                                                onChange={e => setForm({ ...form, phone: e.target.value })}
                                                placeholder="+91 98765 43210"
                                                className="w-full rounded-2xl border-2 border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 px-5 py-4 text-base font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#0057C8]/50 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">
                                                Resume Link *
                                            </label>
                                            <input
                                                type="url"
                                                required
                                                value={form.resumeUrl}
                                                onChange={e => setForm({ ...form, resumeUrl: e.target.value })}
                                                placeholder="Public Google Drive / Portfolio Link"
                                                className="w-full rounded-2xl border-2 border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 px-5 py-4 text-base font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#0057C8]/50 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">
                                            Why are you a good fit? *
                                        </label>
                                        <textarea
                                            rows={5}
                                            required
                                            value={form.coverLetter}
                                            onChange={e => setForm({ ...form, coverLetter: e.target.value })}
                                            placeholder="Tell us about your most relevant work and interest in education tech..."
                                            className="w-full rounded-2xl border-2 border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 px-5 py-4 text-base font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#0057C8]/50 transition-all resize-none"
                                        />
                                    </div>

                                    <div className="pt-4">
                                        <motion.button
                                            disabled={submitting}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] px-8 py-5 text-lg font-bold text-white shadow-2xl shadow-[#0057C8]/20 hover:shadow-[#0057C8]/40 transition-all disabled:opacity-50"
                                        >
                                            {submitting ? <Loader size="sm" /> : <Send size={20} />}
                                            {submitting ? "Processing..." : "Submit Application"}
                                        </motion.button>
                                        
                                        <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-6 font-medium">
                                            Privacy Notice: Your data will be used solely for recruitment purposes at LearnXChain.
                                        </p>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}
