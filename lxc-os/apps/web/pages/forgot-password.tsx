import Head from 'next/head'
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/home/navbar/Navbar";
import Footer from "@/components/home/footer/Footer";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/feedback/Loader";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setIsSuccess(false);

    try {
      const response = await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Forgot Password - LearnXChain</title>
        <meta name="description" content="Reset your LearnXChain account password" />
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
          <div className="flex items-center justify-center px-4 py-20 pt-32 min-h-[calc(100vh-80px)]">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="w-full max-w-md"
            >
              <div className="bg-white/60 dark:bg-[#0C1018] backdrop-blur-xl border-2 border-gray-100 dark:border-white/5 rounded-3xl p-8 shadow-2xl overflow-hidden relative">
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
                <div className="text-center mb-8 relative z-10">
                  <h1 className="text-3xl font-[var(--font-grotesk)] font-bold text-gray-900 dark:text-white mb-2">Forgot Password?</h1>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">
                    {isSuccess
                      ? "Check your email for reset instructions"
                      : "Enter your email address and we'll send you a link to reset your password"}
                  </p>
                </div>

                {/* Success Message */}
                {isSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 bg-green-50 dark:bg-green-500/10 border-2 border-green-100 dark:border-green-500/20 text-green-600 dark:text-green-400 text-sm px-4 py-3 rounded-xl font-bold"
                  >
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div>
                        <p className="font-bold mb-1">Email sent successfully!</p>
                        <p className="text-green-600/80 dark:text-green-300/80 font-medium">
                          We've sent password reset instructions to <strong>{email}</strong>.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Form */}
                {!isSuccess ? (
                  <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 dark:bg-red-500/10 border-2 border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl font-bold"
                      >
                        {error}
                      </motion.div>
                    )}

                    <div>
                      <label htmlFor="email" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border-2 border-gray-100 dark:border-white/10 bg-white/50 dark:bg-[#0C1018]/50 backdrop-blur-md px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:border-[#0057C8] focus:ring-2 focus:ring-[#0057C8]/30 transition-all font-medium"
                      />
                    </div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#0057C8]/30 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center justify-center gap-2">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full"
                            />
                            <span>Sending...</span>
                          </div>
                        ) : "Send Reset Link"}
                      </Button>
                    </motion.div>
                  </form>
                ) : (
                  <div className="space-y-4 relative z-10">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={() => {
                          setIsSuccess(false);
                          setEmail("");
                        }}
                        className="w-full bg-white dark:bg-[#0C1018] border-2 border-gray-100 dark:border-white/5 text-gray-700 dark:text-[#1A9FFF] font-bold py-3.5 rounded-xl hover:bg-gray-50 dark:hover:bg-[#0C1018]/80 hover:border-[#0057C8]/50 dark:hover:border-[#0057C8]/50 transition-all shadow-sm"
                      >
                        Resend Email
                      </Button>
                    </motion.div>
                  </div>
                )}

                {/* Back to login link */}
                <div className="mt-6 text-center relative z-10">
                  <Link
                    href="/login"
                    className="text-[#0057C8] dark:text-[#1A9FFF] hover:underline text-sm font-bold transition-all inline-flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    Back to login
                  </Link>
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

