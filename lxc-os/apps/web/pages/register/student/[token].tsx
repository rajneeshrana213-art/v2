
import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { User, Users, Home, HeartPulse, BookOpen, ChevronRight, ChevronLeft, CheckCircle2, GraduationCap, School as SchoolIcon, Moon, Sun, AlertCircle } from 'lucide-react';
import { publicRegisterStudentSchema } from "@/lib/validations/admin/registration";
import { Input } from "@/components/ui/forms/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "react-toastify";
import { useTheme } from "@/hooks/useTheme";
import { useLocation } from "@/hooks/useLocation";
import Loader from '@/components/ui/feedback/Loader';

const steps = [
    { id: 1, title: "Personal", icon: User },
    { id: 2, title: "Parents & Guardian", icon: Users },
    { id: 3, title: "Address", icon: Home },
    { id: 4, title: "Academic", icon: BookOpen },
    { id: 5, title: "Health", icon: HeartPulse },
];

export default function PublicRegistrationPage() {
    const router = useRouter();
    const { token } = router.query;
    const { theme, toggleTheme, mounted } = useTheme();
    const { city: autoCity, region: autoRegion, country_name: autoCountry, postal, loading: locationLoading } = useLocation();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [schoolInfo, setSchoolInfo] = useState<any>(null);
    const [classes, setClasses] = useState<any[]>([]);
    const [isCompleted, setIsCompleted] = useState(false);

    const form = useForm({
        resolver: zodResolver(publicRegisterStudentSchema),
        defaultValues: {
            sex: "MALE",
            bloodType: "O+",
            medicalCondition: "None",
            allergies: "None",
            country: "India",
        }
    });

    const { formState: { errors }, setValue, watch, trigger } = form;

    // Auto-fill location details when they are fetched
    useEffect(() => {
        if (autoCity) setValue("city", autoCity);
        if (autoRegion) setValue("state", autoRegion);
        if (autoCountry) setValue("country", autoCountry);
        if (postal) setValue("pincode", postal);
    }, [autoCity, autoRegion, autoCountry, postal, setValue]);

    const INDIAN_STATES = [
        "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
        "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa",
        "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka",
        "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
        "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim",
        "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
    ];

    const STATE_CITIES: Record<string, string[]> = {
        "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur"],
        "Delhi": ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi"],
        "Karnataka": ["Bengaluru", "Mysuru", "Hubballi", "Dharwad", "Mangaluru", "Belagavi"],
        "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli"],
        "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar"],
        "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Meerut", "Varanasi", "Prayagraj"],
        "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri"],
        "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur"],
        "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar"],
        "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia"],
        "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda"],
        "Haryana": ["Faridabad", "Gurugram", "Panipat", "Ambala", "Yamunanagar"],
        "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain"],
        "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool"],
        "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Kollam", "Thrissur"],
        "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon"],
        "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur"],
        "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Rajnandgaon"],
        "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar"],
        "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rudrapur"],
        "Himachal Pradesh": ["Shimla", "Dharamshala", "Solan", "Mandi", "Nahan"],
        "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
        "Tripura": ["Agartala", "Udaipur", "Dharmanagar", "Kailasahar", "Ambassa"],
        "Manipur": ["Imphal", "Thoubal", "Bishnupur", "Churachandpur", "Ukhrul"],
        "Meghalaya": ["Shillong", "Tura", "Jowai", "Nongpoh", "Williamnagar"],
        "Mizoram": ["Aizawl", "Lunglei", "Saiha", "Champhai", "Kolasib"],
        "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha"],
        "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Aalo", "Tezu"],
        "Sikkim": ["Gangtok", "Namchi", "Geyzing", "Mangan", "Singtam"],
    };

    useEffect(() => {
        if (!router.isReady) return;

        if (token) {
            validateToken();
        } else {
            setLoading(false);
        }
    }, [router.isReady, token]);

    const validateToken = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/v1/public/registration/validate?token=${token}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Invalid registration link");
            }

            setSchoolInfo(data);
            setClasses(data.classes || []);
            setValue("schoolId", data.schoolId);
            setValue("academicYear", data.academicYear?.year || "");
        } catch (err: any) {
            console.error("Token validation error:", err);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleNext = async () => {
        let fieldsToValidate: any[] = [];
        if (currentStep === 1) fieldsToValidate = ["name", "email", "phone", "sex", "dateOfBirth", "bloodType"];
        else if (currentStep === 2) fieldsToValidate = ["guardianName", "guardianEmail", "guardianPhone", "guardianRelation"];
        else if (currentStep === 3) fieldsToValidate = ["currentAddress", "city", "state", "country", "pincode"];
        else if (currentStep === 4) fieldsToValidate = ["classId", "academicYear"];

        const isValid = await trigger(fieldsToValidate as any);
        if (isValid) {
            setCurrentStep(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            toast.error("Please fix validation errors before proceeding");
        }
    };

    const onSubmit = async (data: any) => {
        // Perform final validation check for all steps
        const allFields = [
            "name", "email", "phone", "sex", "dateOfBirth", "bloodType",
            "guardianName", "guardianEmail", "guardianPhone", "guardianRelation",
            "currentAddress", "city", "state", "country", "pincode",
            "classId", "academicYear",
            "medicalCondition", "allergies"
        ];

        const isValid = await trigger(allFields as any);

        if (!isValid) {
            toast.error("Please fix all validation errors before submitting");
            const firstError = Object.keys(errors)[0];
            if (firstError) {
                const element = document.querySelector(`[name="${firstError}"], #${firstError}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
            return;
        }

        try {
            setSubmitting(true);

            // Proactively include class name for cleaner display in admin
            const selectedClass = classes.find(c => c.id === data.classId);
            const enrichedData = {
                ...data,
                className: selectedClass?.name
            };

            const response = await fetch("/api/v1/public/registration/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, formData: enrichedData })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to submit registration");
            }

            setIsCompleted(true);
            toast.success("Registration request submitted successfully!");
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || !mounted) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
                <div className="flex flex-col items-center gap-4">
                    <Loader size="lg" />
                    <p className="text-xs font-black text-slate-500 dark:text-slate-400 animate-pulse uppercase tracking-[0.3em] ml-1">Loading Portal</p>
                </div>
            </div>
        );
    }

    if (!schoolInfo) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-300">
                <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full border border-slate-100 dark:border-slate-800">
                    <div className="h-16 w-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <GraduationCap className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Invalid Link</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">The registration link you are trying to access is invalid or has expired.</p>
                    <button onClick={() => window.location.href = '/'} className="w-full px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90 transition-opacity">
                        Go Home
                    </button>
                    <p className="mt-6 text-[10px] text-slate-400 uppercase tracking-widest font-mono truncate px-4">Token: {token}</p>
                </div>
            </div>
        );
    }

    if (isCompleted) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <Card className="max-w-lg w-full border-none shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                        <div className="h-40 bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            >
                                <div className="h-20 w-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-inner ring-4 ring-white/10">
                                    <CheckCircle2 className="h-10 w-10 text-white" />
                                </div>
                            </motion.div>
                        </div>
                        <CardContent className="p-10 text-center space-y-8">
                            <div className="space-y-3">
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Submission Successful!</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
                                    Your application for <strong className="text-indigo-600 dark:text-indigo-400">{schoolInfo.schoolName}</strong> has been received.
                                </p>
                            </div>
                            <div className="p-6 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
                                <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
                                    We will review your details and contact you via email shortly.
                                </p>
                            </div>
                            <Button 
                                onClick={() => {
                                    window.close();
                                    // Fallback for primary tabs where window.close() is blocked
                                    setTimeout(() => {
                                        window.location.href = '/';
                                    }, 300);
                                }} 
                                className="w-full py-6 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 shadow-xl text-md font-bold transition-all"
                            >
                                Close & Return Home
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-indigo-500/30 selection:text-indigo-600 dark:selection:text-indigo-300 transition-colors duration-300">
            <Head>
                <title>Registration - {schoolInfo.schoolName}</title>
            </Head>

            {/* Premium Header */}
            <div className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 lg:px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white shrink-0">
                            {schoolInfo.schoolLogo ? (
                                <img src={schoolInfo.schoolLogo} alt={schoolInfo.schoolName} className="h-full w-full object-cover rounded-xl" />
                            ) : (
                                <SchoolIcon className="h-5 w-5" />
                            )}
                        </div>
                        <div className="flex flex-col hidden sm:flex">
                            <span className="text-sm lg:text-md font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">{schoolInfo.schoolName}</span>
                            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest mt-1">Student Data Portal</span>
                        </div>
                    </div>

                    <button
                        onClick={toggleTheme}
                        className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:scale-105 transition-all shadow-sm"
                        aria-label="Toggle Theme"
                    >
                        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-4 lg:px-6 py-8 lg:py-16">
                <div className="grid lg:grid-cols-[280px_1fr] gap-8 lg:gap-16 items-start">

                    {/* Stepper Side - Desktop */}
                    <aside className="sticky top-28 space-y-8 hidden lg:block">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-none uppercase tracking-tighter">Registration Form</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium tracking-wide">Step {currentStep} of {steps.length}</p>
                        </div>

                        <div className="space-y-1 relative">
                            {/* Connecting Line */}
                            <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-slate-200 dark:bg-slate-800 -z-10" />

                            {steps.map((step) => {
                                const Icon = step.icon;
                                const isActive = currentStep === step.id;
                                const isCompleted = currentStep > step.id;

                                return (
                                    <div key={step.id} className="flex items-center gap-4 group py-2">
                                        <div className={`
                                            h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-300 border-4 border-slate-50 dark:border-slate-950 z-10
                                            ${isActive ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/30 scale-110' :
                                                isCompleted ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-600 group-hover:text-indigo-400 border border-slate-200 dark:border-slate-800'}
                                        `}>
                                            {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-600'}`}>Step 0{step.id}</span>
                                            <span className={`text-sm font-bold transition-colors ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-600'}`}>{step.title}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </aside>

                    {/* Form Side */}
                    <div className="space-y-6 lg:space-y-8 w-full max-w-2xl lg:max-w-none mx-auto">

                        {/* Mobile Stepper */}
                        <div className="lg:hidden space-y-4">
                            <div className="flex items-center justify-between">
                                <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Step {currentStep}: {steps[currentStep - 1].title}</h1>
                                <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-slate-500 dark:text-slate-400">{currentStep}/{steps.length}</span>
                            </div>
                            <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-600 transition-all duration-500 ease-out"
                                    style={{ width: `${(currentStep / steps.length) * 100}%` }}
                                />
                            </div>
                        </div>

                        <form 
                            onSubmit={form.handleSubmit(onSubmit)} 
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
                                    e.preventDefault();
                                }
                            }}
                            className="space-y-8"
                        >
                            <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2rem] overflow-hidden ring-1 ring-slate-200/50 dark:ring-white/5 transition-all duration-300">
                                <CardContent className="p-6 md:p-10 lg:p-12">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={currentStep}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                            className="space-y-8"
                                        >
                                            {/* Step 1: Personal */}
                                            {currentStep === 1 && (
                                                <div className="space-y-6">
                                                    <div className="grid gap-6">
                                                        <Input
                                                            label="Student Full Name"
                                                            placeholder="e.g. John Doe"
                                                            required
                                                            {...form.register("name")}
                                                            className={errors.name ? "border-rose-500" : ""}
                                                            containerClassName="bg-slate-50/50 dark:bg-slate-950/30"
                                                        />
                                                        <div className="grid md:grid-cols-2 gap-6">
                                                              <Input label="Email Address" type="email" placeholder="john@example.com" required {...form.register("email")} error={errors.email?.message as string} className={errors.email ? "border-rose-500" : ""} containerClassName="bg-slate-50/50 dark:bg-slate-950/30" />
                                                              <Input label="Phone Number" placeholder="+1 234 567 890" required {...form.register("phone")} error={errors.phone?.message as string} className={errors.phone ? "border-rose-500" : ""} containerClassName="bg-slate-50/50 dark:bg-slate-950/30" />
                                                        </div>
                                                        <div className="grid md:grid-cols-3 gap-6">
                                                            <div className="space-y-2">
                                                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Gender</label>
                                                                <Select onValueChange={(v) => setValue("sex", v as any)} value={watch("sex")}>
                                                                    <SelectTrigger className={`w-full rounded-xl h-11 bg-slate-50 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 ${errors.sex ? "border-rose-500" : "border-slate-200 dark:border-slate-800"}`}>
                                                                        <SelectValue placeholder="Select Gender">
                                                                            {watch("sex") ? (watch("sex") === "MALE" ? "Male" : watch("sex") === "FEMALE" ? "Female" : "Other") : ""}
                                                                        </SelectValue>
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="MALE">Male</SelectItem>
                                                                        <SelectItem value="FEMALE">Female</SelectItem>
                                                                        <SelectItem value="OTHERS">Other</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                {errors.sex && <p className="text-rose-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.sex.message as string}</p>}
                                                            </div>
                                                            <Input label="Date of Birth" type="date" required {...form.register("dateOfBirth")} error={errors.dateOfBirth?.message as string} className={errors.dateOfBirth ? "border-rose-500" : ""} />
                                                            <div className="space-y-2">
                                                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Blood Type</label>
                                                                <Select onValueChange={(v) => setValue("bloodType", v)} value={watch("bloodType")}>
                                                                    <SelectTrigger className={`w-full rounded-xl h-11 bg-slate-50 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 ${errors.bloodType ? "border-rose-500" : "border-slate-200 dark:border-slate-800"}`}>
                                                                        <SelectValue placeholder="Select Type" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map(t => (
                                                                            <SelectItem key={t} value={t}>{t}</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                {errors.bloodType && <p className="text-rose-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.bloodType.message as string}</p>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Step 2: Parent or Guardian */}
                                            {currentStep === 2 && (
                                                <>
                                                    <div className="space-y-8">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-1 w-6 bg-indigo-600 rounded-full" />
                                                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Parent or Guardian Details</h3>
                                                        </div>

                                                        <div className="grid gap-6">
                                                            <Input
                                                                label="Full Name"
                                                                placeholder="Parent/Guardian Name"
                                                                required
                                                                {...form.register("guardianName")}
                                                                error={errors.guardianName?.message as string}
                                                                className={errors.guardianName ? "border-rose-500" : ""}
                                                                containerClassName="bg-slate-50/50 dark:bg-slate-950/30"
                                                            />

                                                            <div className="grid md:grid-cols-2 gap-6">
                                                                <Input
                                                                    label="Email Address"
                                                                    type="email"
                                                                    placeholder="parent@example.com"
                                                                    required
                                                                    {...form.register("guardianEmail")}
                                                                    error={errors.guardianEmail?.message as string}
                                                                    className={errors.guardianEmail ? "border-rose-500" : ""}
                                                                    containerClassName="bg-slate-50/50 dark:bg-slate-950/30"
                                                                />
                                                                <Input
                                                                    label="Phone Number"
                                                                    placeholder="+1..."
                                                                    required
                                                                    {...form.register("guardianPhone")}
                                                                    error={errors.guardianPhone?.message as string}
                                                                    className={errors.guardianPhone ? "border-rose-500" : ""}
                                                                    containerClassName="bg-slate-50/50 dark:bg-slate-950/30"
                                                                />
                                                            </div>

                                                            <div className="space-y-2">
                                                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Relationship to Student</label>
                                                                <Select onValueChange={(v) => setValue("guardianRelation", v)} value={watch("guardianRelation")}>
                                                                    <SelectTrigger className={`w-full rounded-xl h-11 bg-slate-50/50 dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 ${errors.guardianRelation ? "border-rose-500" : "border-slate-200 dark:border-slate-800"}`}>
                                                                        <SelectValue placeholder="Select Relation" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {["Father", "Mother", "Brother", "Sister", "Uncle", "Aunt", "Grandparent", "Other"].map(r => (
                                                                            <SelectItem key={r} value={r}>{r}</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                {errors.guardianRelation && <p className="text-rose-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.guardianRelation.message as string}</p>}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="p-6 rounded-2xl bg-indigo-50/30 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-900/30">
                                                        <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70 font-medium italic">
                                                            Note: This will be the primary contact person for all school communications.
                                                        </p>
                                                    </div>
                                                </>

                                            )}

                                            {/* Step 3: Address */}
                                            {currentStep === 3 && (
                                                <div className="space-y-6">
                                                    <div className="grid gap-6">
                                                        <Input label="Full Address" placeholder="House No, Street, Landmark" required {...form.register("currentAddress")} error={errors.currentAddress?.message as string} className={errors.currentAddress ? "border-rose-500" : ""} containerClassName="bg-slate-50/50 dark:bg-slate-950/30" />

                                                        <div className="grid md:grid-cols-2 gap-6">
                                                            <div className="space-y-2">
                                                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Country</label>
                                                                <Select onValueChange={(v) => setValue("country", v)} value={watch("country")}>
                                                                    <SelectTrigger className={`w-full rounded-xl h-11 bg-slate-50 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 ${errors.country ? "border-rose-500" : "border-slate-200 dark:border-slate-800"}`}>
                                                                        <SelectValue placeholder="Select Country" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {["India", "United States", "United Kingdom", "Canada", "Australia", "Other"].map(c => (
                                                                            <SelectItem key={c} value={c}>{c}</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                {errors.country && <p className="text-rose-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.country.message as string}</p>}
                                                            </div>

                                                            <div className="space-y-2">
                                                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">State</label>
                                                                {watch("country") === "India" ? (
                                                                    <Select onValueChange={(v) => setValue("state", v)} value={watch("state")}>
                                                                        <SelectTrigger className={`w-full rounded-xl h-11 bg-slate-50 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 ${errors.state ? "border-rose-500" : "border-slate-200 dark:border-slate-800"}`}>
                                                                            <SelectValue placeholder="Select State" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {INDIAN_STATES.map(s => (
                                                                                <SelectItem key={s} value={s}>{s}</SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                ) : (
                                                                    <Input placeholder="Enter State" {...form.register("state")} error={errors.state?.message as string} className={errors.state ? "border-rose-500" : ""} />
                                                                )}
                                                                {errors.state && <p className="text-rose-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.state.message as string}</p>}
                                                            </div>
                                                        </div>

                                                        <div className="grid md:grid-cols-2 gap-6">
                                                            <div className="space-y-2">
                                                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">City</label>
                                                                {STATE_CITIES[watch("state")] ? (
                                                                    <Select onValueChange={(v) => setValue("city", v)} value={watch("city")}>
                                                                        <SelectTrigger className={`w-full rounded-xl h-11 bg-slate-50 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 ${errors.city ? "border-rose-500" : "border-slate-200 dark:border-slate-800"}`}>
                                                                            <SelectValue placeholder="Select City" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {STATE_CITIES[watch("state")].map(c => (
                                                                                <SelectItem key={c} value={c}>{c}</SelectItem>
                                                                            ))}
                                                                            <SelectItem value="Other">Other</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                ) : (
                                                                    <Input placeholder="Enter City" {...form.register("city")} error={errors.city?.message as string} className={errors.city ? "border-rose-500" : ""} />
                                                                )}
                                                                {errors.city && <p className="text-rose-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.city.message as string}</p>}
                                                                {watch("city") === "Other" && (
                                                                    <Input
                                                                        placeholder="Specify City"
                                                                        className="mt-2"
                                                                        onChange={(e: any) => setValue("city", e.target.value)}
                                                                    />
                                                                )}
                                                            </div>
                                                            <Input label="Pincode" placeholder="000000" required {...form.register("pincode")} error={errors.pincode?.message as string} className={errors.pincode ? "border-rose-500" : ""} containerClassName="bg-slate-50/50 dark:bg-slate-950/30" />
                                                        </div>
                                                    </div>
                                                    {locationLoading && (
                                                        <div className="flex items-center gap-3 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest animate-pulse">
                                                            <Loader size="sm" />
                                                            <span>Syncing Location Details...</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Step 4: Academic */}
                                            {currentStep === 4 && (
                                                <div className="space-y-6">
                                                    <div className="grid gap-6 p-6 md:p-8 border-2 border-dashed border-indigo-100 dark:border-indigo-900/40 rounded-3xl bg-indigo-50/30 dark:bg-indigo-900/10">
                                                        <div className="space-y-4">
                                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                                <GraduationCap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                                                Select Grade for Admission
                                                            </label>
                                                            <div className="grid gap-3">
                                                                {classes.map((c) => (
                                                                    <label key={c.id} className={`
                                                                        flex items-center justify-between p-4 rounded-2xl cursor-pointer border-2 transition-all duration-300
                                                                        ${watch("classId") === c.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/30' : (errors.classId ? 'border-rose-500/50 dark:bg-slate-950 text-slate-700 dark:text-slate-300' : 'bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-700')}
                                                                    `}>
                                                                        <span className="font-bold">{c.name}</span>
                                                                        <input type="radio" value={c.id} className="hidden" {...form.register("classId")} />
                                                                        <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${watch("classId") === c.id ? 'bg-white border-white' : (errors.classId ? 'border-rose-400' : 'border-slate-300 dark:border-slate-700')}`}>
                                                                            {watch("classId") === c.id && <div className="h-2.5 w-2.5 bg-indigo-600 rounded-full" />}
                                                                        </div>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                            {errors.classId && <p className="text-rose-500 text-xs mt-1 flex items-center gap-1 font-bold uppercase tracking-widest"><AlertCircle className="h-3 w-3" /> {errors.classId.message as string}</p>}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Academic Year</label>
                                                        <div className={`h-14 flex items-center px-6 bg-slate-100 dark:bg-slate-900 rounded-2xl font-black text-slate-600 dark:text-slate-300 tracking-widest ${errors.academicYear ? "border border-rose-500" : ""}`}>
                                                            {schoolInfo.academicYear?.year || "2024-2025"}
                                                        </div>
                                                        <input type="hidden" {...form.register("academicYear")} />
                                                        {errors.academicYear && <p className="text-rose-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.academicYear.message as string}</p>}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Step 5: Health */}
                                            {currentStep === 5 && (
                                                <div className="space-y-6">
                                                    <div className="grid gap-6">
                                                        <div className="p-6 rounded-3xl bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20">
                                                            <p className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                                <HeartPulse className="h-4 w-4" /> Medical Disclosure
                                                            </p>
                                                            <div className="grid gap-6">
                                                                <Input label="Medical Conditions" placeholder="Chronic illnesses (if any)" {...form.register("medicalCondition")} error={errors.medicalCondition?.message as string} className={errors.medicalCondition ? "border-rose-500" : ""} containerClassName="bg-white/50 dark:bg-slate-950/30" />
                                                                <Input label="Allergies" placeholder="Allergies (if any)" {...form.register("allergies")} error={errors.allergies?.message as string} className={errors.allergies ? "border-rose-500" : ""} containerClassName="bg-white/50 dark:bg-slate-950/30" />
                                                            </div>
                                                        </div>
                                                        <div className="p-8 text-center space-y-4 rounded-[2.5rem] bg-indigo-600 dark:bg-indigo-700 text-white shadow-xl shadow-indigo-500/20">
                                                            <CheckCircle2 className="h-12 w-12 mx-auto text-indigo-200" />
                                                            <div className="space-y-2">
                                                                <h4 className="text-xl font-black uppercase tracking-tight">Almost Ready!</h4>
                                                                <p className="text-indigo-100 text-sm opacity-90 leading-relaxed font-medium max-w-sm mx-auto">By submitting this form, you certify that all information provided is accurate and you agree to the school's terms of admission.</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                        </motion.div>
                                    </AnimatePresence>
                                </CardContent>

                                <div className="px-6 md:px-12 py-6 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between backdrop-blur-md">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setCurrentStep(prev => prev - 1)}
                                        disabled={currentStep === 1 || submitting}
                                        className="rounded-xl h-11 lg:h-12 pl-2 pr-6 font-bold text-slate-500 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-white"
                                    >
                                        <ChevronLeft className="h-5 w-5 mr-1" /> Previous
                                    </Button>

                                    {currentStep < steps.length ? (
                                        <Button
                                            type="button"
                                            onClick={handleNext}
                                            className="rounded-xl lg:rounded-2xl h-12 lg:h-14 px-8 lg:px-10 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 text-white font-black uppercase tracking-widest group transition-all hover:scale-105 active:scale-95"
                                        >
                                            Continue <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    ) : (
                                        <Button
                                            type="submit"
                                            disabled={submitting}
                                            className="rounded-xl lg:rounded-2xl h-12 lg:h-14 px-8 lg:px-12 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 text-white font-black uppercase tracking-widest disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
                                        >
                                            {submitting ? (
                                                <div className="flex items-center gap-2">
                                                    <Loader size="sm" variant="white" />
                                                    <span>Processing...</span>
                                                </div>
                                            ) : (
                                                <>Submit Application <ChevronRight className="h-4 w-4 ml-2" /></>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        </form>
                    </div>
                </div>
            </main>

            {/* Premium Footer */}
            <footer className="py-8 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm mt-12">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-slate-400 dark:text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">&copy; {new Date().getFullYear()} LearnXChain Enrollment Cloud. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

