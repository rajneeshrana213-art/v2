import Head from 'next/head';
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import Navbar from "@/components/home/navbar/Navbar";
import Footer from "@/components/home/footer/Footer";
import { Button } from "@/components/ui/button";
import {
    User,
    Mail,
    Lock,
    Phone,
    Building2,
    MapPin,
    Globe,
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    ArrowRight,
    Sparkles
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function OrganizationRegistration() {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const [formData, setFormData] = useState({
        // User Info
        name: "",
        email: "",
        phone: "",
        password: "",
        // Org Info
        organizationName: "",
        address: "",
        city: "",
        state: "",
        country: "India",
        pincode: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch("/api/v1/group-admin/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Registration failed");
            }

            toast.success("Organization registered successfully!");
            setStep(3); // Success step
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Head>
                <title>Register Organization - LearnXChain</title>
                <meta name="description" content="Register your school group or organization with LearnXChain" />
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-[#0B0E14] dark:via-[#0F1419] dark:to-[#0B0E14]">
                <Navbar />

                {/* Decorative Background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-[100px]" />
                    <div className="absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-purple-500/5 dark:bg-purple-500/10 blur-[120px]" />
                </div>

                <div className="relative flex items-center justify-center px-4 py-20 pt-32 min-h-[calc(100vh-80px)]">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-2xl"
                    >
                        <div className="relative rounded-3xl border-2 border-gray-200/50 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-2xl p-8 sm:p-10 shadow-2xl">

                            <AnimatePresence mode="wait">
                                {step === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="space-y-6"
                                    >
                                        <div className="text-center mb-8">
                                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-200/50 dark:border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:text-indigo-300">
                                                <User className="h-4 w-4" />
                                                <span>Step 1: Admin Profile</span>
                                            </div>
                                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Admin Account</h1>
                                            <p className="text-gray-600 dark:text-gray-400">Personal details for the organization's primary administrator</p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-6">
                                            <FormInput
                                                label="Full Name"
                                                name="name"
                                                icon={<User />}
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="John Doe"
                                            />
                                            <FormInput
                                                label="Email Address"
                                                name="email"
                                                type="email"
                                                icon={<Mail />}
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="john@example.com"
                                            />
                                            <FormInput
                                                label="Phone Number"
                                                name="phone"
                                                icon={<Phone />}
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="+1 234 567 890"
                                            />
                                            <FormInput
                                                label="Password"
                                                name="password"
                                                type="password"
                                                icon={<Lock />}
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="••••••••"
                                            />
                                        </div>

                                        <Button
                                            onClick={nextStep}
                                            className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg group"
                                        >
                                            Next Step <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div className="text-center mb-8">
                                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-200/50 dark:border-purple-500/30 bg-purple-50/50 dark:bg-purple-500/10 px-4 py-1.5 text-sm font-medium text-purple-700 dark:text-purple-300">
                                                <Building2 className="h-4 w-4" />
                                                <span>Step 2: Organization Info</span>
                                            </div>
                                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Organization Details</h1>
                                            <p className="text-gray-600 dark:text-gray-400">Tell us about your school group or organization</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2">
                                                <FormInput
                                                    label="Organization Name"
                                                    name="organizationName"
                                                    icon={<Building2 />}
                                                    value={formData.organizationName}
                                                    onChange={handleChange}
                                                    placeholder="Global School Group"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <FormInput
                                                    label="Street Address"
                                                    name="address"
                                                    icon={<MapPin />}
                                                    value={formData.address}
                                                    onChange={handleChange}
                                                    placeholder="123 Education St"
                                                />
                                            </div>
                                            <FormInput
                                                label="City"
                                                name="city"
                                                icon={<Building2 />}
                                                value={formData.city}
                                                onChange={handleChange}
                                                placeholder="New York"
                                            />
                                            <FormInput
                                                label="State"
                                                name="state"
                                                icon={<Globe />}
                                                value={formData.state}
                                                onChange={handleChange}
                                                placeholder="NY"
                                            />
                                            <FormInput
                                                label="Pincode"
                                                name="pincode"
                                                icon={<MapPin />}
                                                value={formData.pincode}
                                                onChange={handleChange}
                                                placeholder="10001"
                                            />
                                            <FormInput
                                                label="Country"
                                                name="country"
                                                icon={<Globe />}
                                                value={formData.country}
                                                onChange={handleChange}
                                                placeholder="USA"
                                            />
                                        </div>

                                        <div className="flex gap-4">
                                            <Button
                                                variant="outline"
                                                onClick={prevStep}
                                                className="flex-1 h-12 rounded-xl dark:border-white/10 dark:hover:bg-white/5"
                                            >
                                                <ChevronLeft className="mr-2 h-5 w-5" /> Back
                                            </Button>
                                            <Button
                                                onClick={handleSubmit}
                                                disabled={isSubmitting}
                                                className="flex-[2] h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg"
                                            >
                                                {isSubmitting ? "Registering..." : "Complete Registration"}
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 3 && (
                                    <motion.div
                                        key="step3"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-8 space-y-6"
                                    >
                                        <div className="relative mx-auto w-24 h-24 mb-6">
                                            <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl" />
                                            <CheckCircle2 className="relative w-24 h-24 text-green-500" />
                                        </div>
                                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Welcome to LearnXChain!</h1>
                                        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                                            Your organization <strong>{formData.organizationName}</strong> has been successfully registered. You can now start managing your school branches.
                                        </p>
                                        <div className="pt-8">
                                            <Button
                                                onClick={() => router.push("/login")}
                                                className="w-full h-14 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-2xl transition-all text-lg font-bold"
                                            >
                                                Go to Dashboard <ArrowRight className="ml-2 h-6 w-6" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Progress Bar */}
                            {step < 3 && (
                                <div className="mt-10 flex gap-2">
                                    <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-white/10'}`} />
                                    <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-white/10'}`} />
                                </div>
                            )}
                        </div>

                        {step < 3 && (
                            <p className="mt-8 text-center text-gray-600 dark:text-gray-400">
                                Already have an account?{" "}
                                <Link href="/login" className="text-indigo-600 font-semibold hover:underline">Sign in</Link>
                            </p>
                        )}
                    </motion.div>
                </div>
                <Footer />
            </div>
        </>
    );
}

function FormInput({ label, name, icon, value, onChange, placeholder, type = "text" }: any) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900 dark:text-white ml-1">{label}</label>
            <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5">
                    {icon}
                </div>
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="w-full rounded-xl border-2 border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 pl-12 pr-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-gray-400"
                    required
                />
            </div>
        </div>
    );
}
