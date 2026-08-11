
import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, User, Briefcase, Building2, Globe, CheckCircle2, AlertCircle, UserCircle, MapPin, Upload, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { LimitExceededModal } from "@/components/dashboard/admin/membership/LimitExceededModal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerTeacherSchema } from "@/lib/validations/admin/teacher";
import client from "@/lib/api/client";
import { Input } from "@/components/ui/forms/input";
import { toast } from "react-toastify";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useAuth } from "@/lib/context/AuthContext";
import { LocationSelector } from "@/components/common/LocationSelector";
import { Loader } from "@/components/ui/feedback/Loader";
import { decodeId } from "@/lib/utils/hashId";
import { formatISTDateKey, getISTDateString } from "@/lib/utils/date-utils";


const steps = [
    { id: 1, title: "Identity", icon: User },
    { id: 2, title: "Family & Location", icon: MapPin },
    { id: 3, title: "Employment", icon: Briefcase },
];

const Label = (props: any) => <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block" {...props} />;

export default function TeacherRegistrationPage() {
    const router = useRouter();
    const { edit: editRaw } = router.query;
    const edit = editRaw && typeof editRaw === 'string' ? decodeId(editRaw) : editRaw;
    const [isCheckingLimit, setIsCheckingLimit] = useState(true);
    const [isLimitExceeded, setIsLimitExceeded] = useState(false);
    const [limitData, setLimitData] = useState({ current: 0, allowed: 0 });

    useEffect(() => {
        // Only check usage on explicitly creating a new entry
        if (!edit) {
            checkUsageLimit();
        } else {
            setIsCheckingLimit(false);
        }
    }, [edit]);

    const checkUsageLimit = async () => {
        try {
            const res = await client.get("/v1/dashboard/admin/usage-stats");
            const stats = res.data.data;
            const totalAllowed = stats.allowedUsers + stats.bonusUsers;

            if (stats.model === 'MODEL_B' && stats.currentUsers >= totalAllowed) {
                setLimitData({ current: stats.currentUsers, allowed: totalAllowed });
                setIsLimitExceeded(true);
            }
        } catch (error) {
            console.error("Failed to check usage limit", error);
        } finally {
            setIsCheckingLimit(false);
        }
    };

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [registeredData, setRegisteredData] = useState<any>(null);
    const [profilePic, setProfilePic] = useState<File | null>(null);
    const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);

    const form = useForm({
        resolver: zodResolver(registerTeacherSchema),
        defaultValues: {
            sex: "MALE",
            bloodType: "O+",
            maritalStatus: "UNMARRIED",
            country: "India",
            status: "ACTIVE",
            contractType: "Full Time",
            salary: 0,
            schoolId: "",
            userName: "", // Will be auto-generated if empty
            img: "",
            address: "",
            city: "",
            state: "",
            pincode: "",
            qualification: "",
            workExperience: "",
            languagesKnown: "",
            fatherName: "",
            motherName: "",
        }
    });

    const { formState: { errors }, watch, trigger, setValue, reset, control } = form;

    const { user, loading: authLoading } = useAuth();

    // Fetch school ID from session/context if possible
    useEffect(() => {
        if (!authLoading && user?.schoolId) {
            setValue("schoolId", user.schoolId);
        }
    }, [user, authLoading, setValue]);

    // Handle Edit Mode
    useEffect(() => {
        const fetchTeacher = async () => {
            if (edit) {
                try {
                    setIsInitialLoading(true);
                    const response = await client.get(`/v1/dashboard/admin/teachers/${edit}`);
                    const teacherData = response.data.data;

                    // Flatten the response for the form
                    reset({
                        ...teacherData,
                        ...teacherData.user,
                        dateOfBirth: teacherData.dateOfBirth ? formatISTDateKey(new Date(teacherData.dateOfBirth)) : "",
                        dateofJoin: teacherData.dateofJoin ? formatISTDateKey(new Date(teacherData.dateofJoin)) : "",
                        schoolId: teacherData.schoolId,
                    });
                    if (teacherData.user?.profilePic) {
                        setProfilePicPreview(teacherData.user.profilePic);
                    }
                } catch (err: any) {
                    toast.error("Failed to load teacher details for editing");
                    console.error(err);
                } finally {
                    setIsInitialLoading(false);
                }
            }
        };

        fetchTeacher();
    }, [edit, reset]);



    const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error("Please select an image file");
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error("Image size should be less than 2MB");
            return;
        }

        setProfilePic(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setProfilePicPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleNext = async (e?: React.MouseEvent | React.KeyboardEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        let fieldsToValidate: any[] = [];
        if (currentStep === 1) {
            fieldsToValidate = ["name", "email", "phone", "sex", "dateOfBirth", "bloodType"];
        } else if (currentStep === 2) {
            fieldsToValidate = ["fatherName", "motherName", "maritalStatus", "languagesKnown", "address", "city", "state", "pincode", "country"];
        } else if (currentStep === 3) {
            fieldsToValidate = ["dateofJoin", "qualification", "workExperience"];
        }

        const isValid = await trigger(fieldsToValidate);
        if (isValid) {
            setCurrentStep(prev => Math.min(prev + 1, steps.length));
        } else {
            const activeErrors = fieldsToValidate.filter(field => (errors as any)[field]);
            if (activeErrors.length > 0) {
                if (errors.schoolId) {
                    toast.error("School ID is missing. Please contact support.");
                } else {
                    toast.error(`Please fix validation errors in: ${activeErrors.join(", ")}`);
                }
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
            if (currentStep < steps.length) {
                e.preventDefault();
                handleNext(e);
            }
        }
    };

    const onSubmit = async (data: any) => {
        try {
            setLoading(true);

            const formData = new FormData();

            // Append all form fields to FormData
            Object.keys(data).forEach(key => {
                const value = data[key];
                if (value !== undefined && value !== null && value !== "") {
                    if (value instanceof Date) {
                        formData.append(key, value.toISOString());
                    }
                    else if (typeof value === 'boolean') {
                        formData.append(key, String(value));
                    }
                    else {
                        formData.append(key, String(value));
                    }
                }
            });

            // Append profile picture if selected
            if (profilePic) {
                formData.append("profilePic", profilePic);
            }

            const response = edit
                ? await client.patch(`/v1/dashboard/admin/teachers/${edit}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                })
                : await client.post("/v1/dashboard/admin/teachers", formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });

            if (response.data.success) {
                toast.success(edit ? "Teacher updated successfully!" : "Teacher registered successfully!");
                setRegisteredData(response.data.data);
                setIsCompleted(true);
            }
        } catch (err: any) {
            console.error("Registration failed:", err);
            toast.error(err.response?.data?.error || "Registration failed. Please check your details.");
        } finally {
            setLoading(false);
        }
    };

    const onFormError = (errs: any) => {
        if (currentStep !== steps.length) return;

        console.log("Form submission errors:", errs);
        const errorFields = Object.keys(errs);
        const errorMessages = errorFields.map(field => `${field}: ${errs[field]?.message}`).join(", ");

        console.error("Missing/Invalid Fields:", errorMessages);

        if (errs.schoolId) {
            toast.error("Internal Error: School ID is missing");
        } else {
            toast.error(`Validation Error in: ${errorFields.join(", ")}`);
        }
    };

    if (isCompleted) {
        return (
            <DashboardLayout role="admin">
                <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-6">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="h-24 w-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 shadow-lg shadow-indigo-500/20"
                    >
                        <CheckCircle2 className="h-12 w-12" />
                    </motion.div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Registration Complete!</h2>
                        <div className="text-gray-500 max-w-sm mx-auto space-y-4">
                            <p>The teacher account has been created successfully.</p>
                            {registeredData?.user?.userName && (
                                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Generated Username</p>
                                    <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">{registeredData.user.userName}</p>
                                </div>
                            )}
                            <p>An email with login credentials has been sent to their registered email address.</p>
                        </div>
                    </div>
                    <Button onClick={() => router.push("/dashboard/admin/teachers")} className="bg-indigo-600">
                        Back to Directory
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    if (isCheckingLimit) {
        return (
            <DashboardLayout role="admin">
                <div className="flex items-center justify-center h-[70vh]">
                    <Loader />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <>
            <Head>
                <title>Teacher Registration - LearnXChain</title>
            </Head>

            <LimitExceededModal
                isOpen={isLimitExceeded}
                onClose={() => {
                    setIsLimitExceeded(false);
                    router.push("/dashboard/admin/teachers");
                }}
                currentUsers={limitData.current}
                allowedUsers={limitData.allowed}
                userType="Teacher"
            />

            <DashboardLayout role="admin">
                <div className="w-full mx-auto space-y-8 pb-10">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.back()}
                                className="h-10 w-10 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700/50 rounded-xl"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                {edit ? "Edit Teacher Details" : "Add New Teacher"}
                            </h1>
                        </div>
                        <p className="text-gray-500 pl-14">
                            {edit ? "Update faculty information" : "Onboard a new faculty member and set up their profile"}
                        </p>
                    </div>

                    {/* Stepper */}
                    <div className="relative">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-800 -translate-y-1/2" />
                        <div className="relative flex justify-between">
                            {steps.map((step) => {
                                const Icon = step.icon;
                                const active = currentStep === step.id;
                                const completed = currentStep > step.id;

                                return (
                                    <div key={step.id} className="flex flex-col items-center gap-2">
                                        <div className={`relative h-10 w-10 rounded-full flex items-center justify-center z-10 transition-all duration-300 ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' :
                                            completed ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-gray-900 text-gray-400 border-2 border-gray-200 dark:border-gray-800'
                                            }`}>
                                            {completed ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${active ? 'text-indigo-600' : 'text-gray-400'}`}>
                                            {step.title}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <form
                        onSubmit={form.handleSubmit(onSubmit, onFormError)}
                        onKeyDown={handleKeyDown}
                        className="space-y-6"
                    >
                        {/* Hidden fields for validation */}
                        <input type="hidden" {...form.register("schoolId")} />
                        <input type="hidden" {...form.register("sex")} />
                        <input type="hidden" {...form.register("maritalStatus")} />
                        <input type="hidden" {...form.register("languagesKnown")} />
                        <input type="hidden" {...form.register("qualification")} />
                        <input type="hidden" {...form.register("contractType")} />
                        <input type="hidden" {...form.register("city")} />
                        <input type="hidden" {...form.register("state")} />
                        <input type="hidden" {...form.register("country")} />

                        <Card className="border-none shadow-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-md">
                            <CardContent className="p-8">
                                <AnimatePresence mode="wait">
                                    {currentStep === 1 && (
                                        <motion.div
                                            key="step1"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="grid gap-6 md:grid-cols-2"
                                        >
                                            <div className="space-y-4 md:col-span-2">
                                                <Label className="text-indigo-600 font-bold flex items-center gap-2 tracking-widest uppercase text-[10px]"><User className="h-4 w-4" /> Identity & Contact</Label>
                                            </div>

                                            <div className="md:col-span-2 flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl bg-gray-50/50 dark:bg-gray-900/50 space-y-4">
                                                <div className="relative group">
                                                    <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                                                        {profilePicPreview ? (
                                                            <img src={profilePicPreview} alt="Profile" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <img
                                                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${watch("name") || 'default'}`}
                                                                alt="Avatar"
                                                                className="h-full w-full object-cover opacity-80"
                                                            />
                                                        )}
                                                    </div>
                                                    <label htmlFor="profilePic" className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                                                        <Upload className="h-8 w-8 text-white" />
                                                        <input
                                                            type="file"
                                                            id="profilePic"
                                                            className="hidden"
                                                            accept="image/*"
                                                            onChange={handleProfilePicChange}
                                                        />
                                                    </label>
                                                </div>
                                                <div className="text-center space-y-1">
                                                    <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest">Profile Photo</p>
                                                    <p className="text-[10px] text-gray-500 font-medium">Click to upload or use auto-generated fallback</p>
                                                </div>
                                            </div>

                                            <Input
                                                id="name"
                                                label="Full Name *"
                                                {...form.register("name")}
                                                placeholder="Jane Smith"
                                                error={errors.name?.message as string}
                                            />

                                            {/* Username hidden as per requirement - generated on backend */}
                                            <div className="hidden">
                                                <Label htmlFor="userName">Username</Label>
                                                <Input id="userName" {...form.register("userName")} />
                                            </div>

                                            <Input
                                                id="email"
                                                label="Email Address *"
                                                type="email"
                                                {...form.register("email")}
                                                placeholder="jane@school.com"
                                                error={errors.email?.message as string}
                                            />

                                            <Input
                                                id="phone"
                                                label="Phone Number *"
                                                {...form.register("phone")}
                                                placeholder="+1234567890"
                                                error={errors.phone?.message as string}
                                                onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    e.target.value = e.target.value.replace(/[^0-9+]/g, '');
                                                }}
                                                maxLength={15}
                                            />

                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-medium text-gray-700 dark:text-slate-200">Gender *</Label>
                                                <Select onValueChange={(v: any) => setValue("sex", v as any)} defaultValue={watch("sex")}>
                                                    <SelectTrigger className={errors.sex ? "border-rose-500/70 ring-2 ring-rose-500/60" : ""}>
                                                        <SelectValue placeholder="Select Gender" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="MALE">Male</SelectItem>
                                                        <SelectItem value="FEMALE">Female</SelectItem>
                                                        <SelectItem value="OTHERS">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {errors.sex && <p className="text-rose-300 text-[11px]">{errors.sex.message as string}</p>}
                                            </div>

                                            <Input
                                                id="dateOfBirth"
                                                label="Date of Birth *"
                                                type="date"
                                                max={getISTDateString()}
                                                {...form.register("dateOfBirth")}
                                                error={errors.dateOfBirth?.message as string}
                                            />

                                            <Input
                                                id="bloodType"
                                                label="Blood Group *"
                                                {...form.register("bloodType")}
                                                placeholder="O+"
                                                error={errors.bloodType?.message as string}
                                            />
                                        </motion.div>
                                    )}

                                    {currentStep === 2 && (
                                        <motion.div
                                            key="step2"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="grid gap-6 md:grid-cols-2"
                                        >
                                            <div className="space-y-4 md:col-span-2">
                                                <Label className="text-indigo-600 font-bold flex items-center gap-2 tracking-widest uppercase text-[10px]"><MapPin className="h-4 w-4" /> Family & Location</Label>
                                            </div>

                                            <Input
                                                id="fatherName"
                                                label="Father's Name *"
                                                {...form.register("fatherName")}
                                                error={errors.fatherName?.message as string}
                                            />

                                            <Input
                                                id="motherName"
                                                label="Mother's Name *"
                                                {...form.register("motherName")}
                                                error={errors.motherName?.message as string}
                                            />

                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-medium text-gray-700 dark:text-slate-200">Marital Status *</Label>
                                                <Select onValueChange={(v: any) => setValue("maritalStatus", v as any)} defaultValue={watch("maritalStatus")}>
                                                    <SelectTrigger className={errors.maritalStatus ? "border-rose-500/70 ring-2 ring-rose-500/60" : ""}>
                                                        <SelectValue placeholder="Select Status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="MARRIED">Married</SelectItem>
                                                        <SelectItem value="UNMARRIED">Unmarried</SelectItem>
                                                        <SelectItem value="DIVORCED">Divorced</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {errors.maritalStatus && <p className="text-rose-300 text-[11px]">{errors.maritalStatus.message as string}</p>}
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-medium text-gray-700 dark:text-slate-200">Languages Known *</Label>
                                                <Select onValueChange={(v: any) => setValue("languagesKnown", v as any)} defaultValue={watch("languagesKnown")}>
                                                    <SelectTrigger className={errors.languagesKnown ? "border-rose-500/70 ring-2 ring-rose-500/60" : ""}>
                                                        <SelectValue placeholder="Select Languages" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="English">English</SelectItem>
                                                        <SelectItem value="Hindi">Hindi</SelectItem>
                                                        <SelectItem value="English, Hindi">English, Hindi</SelectItem>
                                                        <SelectItem value="Spanish">Punjabi</SelectItem>
                                                        {/* <SelectItem value="French">French</SelectItem> */}
                                                        <SelectItem value="Others">Others</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {errors.languagesKnown && <p className="text-rose-300 text-[11px]">{errors.languagesKnown.message as string}</p>}
                                            </div>

                                            <div className="md:col-span-2">
                                                <LocationSelector
                                                    control={control}
                                                    setValue={setValue}
                                                    watch={watch}
                                                    errors={errors}
                                                />
                                            </div>
                                            <Input
                                                id="address"
                                                label="Residential Address *"
                                                {...form.register("address")}
                                                placeholder="123 Street, Area"
                                                error={errors.address?.message as string}
                                                containerClassName="md:col-span-2"
                                            />

                                            <Input
                                                id="pincode"
                                                label="Pincode *"
                                                {...form.register("pincode")}
                                                error={errors.pincode?.message as string}
                                                onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    e.target.value = e.target.value.replace(/[^0-9]/g, '');
                                                }}
                                                maxLength={6}
                                            />
                                        </motion.div>
                                    )}

                                    {currentStep === 3 && (
                                        <motion.div
                                            key="step3"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="grid gap-6 md:grid-cols-2"
                                        >
                                            <div className="space-y-4 md:col-span-2">
                                                <Label className="text-indigo-600 font-bold flex items-center gap-2 tracking-widest uppercase text-[10px]"><Briefcase className="h-4 w-4" /> Employment Details</Label>
                                            </div>

                                            <Input
                                                id="dateofJoin"
                                                label="Date of Joining *"
                                                type="date"
                                                max={getISTDateString()}
                                                {...form.register("dateofJoin")}
                                                error={errors.dateofJoin?.message as string}
                                            />

                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-medium text-gray-700 dark:text-slate-200">Qualification *</Label>
                                                <Select onValueChange={(v: any) => setValue("qualification", v as any)} defaultValue={watch("qualification")}>
                                                    <SelectTrigger className={errors.qualification ? "border-rose-500/70 ring-2 ring-rose-500/60" : ""}>
                                                        <SelectValue placeholder="Select Qualification" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Graduate">Graduate</SelectItem>
                                                        <SelectItem value="Post Graduate">Post Graduate</SelectItem>
                                                        <SelectItem value="B.Ed">B.Ed</SelectItem>
                                                        <SelectItem value="M.Ed">M.Ed</SelectItem>
                                                        <SelectItem value="PhD">PhD</SelectItem>
                                                        <SelectItem value="Diploma">Diploma</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {errors.qualification && <p className="text-rose-300 text-[11px]">{errors.qualification.message as string}</p>}
                                            </div>

                                            <Input
                                                id="workExperience"
                                                label="Work Experience *"
                                                {...form.register("workExperience")}
                                                placeholder="5 Years"
                                                error={errors.workExperience?.message as string}
                                            />

                                            {/* Salary & Prev School details hidden as per requirement */}

                                            <Input
                                                id="panNumber"
                                                label="PAN Number"
                                                {...form.register("panNumber")}
                                                error={errors.panNumber?.message as string}
                                            />

                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-medium text-gray-700 dark:text-slate-200">Contract Type *</Label>
                                                <Select onValueChange={(v: string) => setValue("contractType", v)} defaultValue={watch("contractType")}>
                                                    <SelectTrigger className={errors.contractType ? "border-rose-500/70 ring-2 ring-rose-500/60" : ""}>
                                                        <SelectValue placeholder="Select Type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Full Time">Full Time</SelectItem>
                                                        <SelectItem value="Part Time">Part Time</SelectItem>
                                                        <SelectItem value="Contract">Contract</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {errors.contractType && <p className="text-rose-300 text-[11px]">{errors.contractType.message as string}</p>}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Steps 4 and 5 (Banking & Social) are unreachable and hidden as per requirements */}
                                </AnimatePresence>
                                {isInitialLoading && (
                                    <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-[100] rounded-3xl">
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader size="lg" />
                                            <p className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest">Loading Teacher Data...</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>

                            <div className="flex items-center justify-between p-8 pt-0">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                                    disabled={currentStep === 1 || loading}
                                >
                                    <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                                </Button>

                                {currentStep < steps.length ? (
                                    <Button type="button" onClick={(e) => handleNext(e)} className="bg-indigo-600 hover:bg-indigo-700 min-w-[120px]">
                                        Next Step <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 min-w-[140px] shadow-lg shadow-indigo-500/20">
                                        {loading ? (
                                            <><Loader size="sm" variant="white" /> Onboarding...</>
                                        ) : (
                                            <>Complete Onboarding <CheckCircle2 className="ml-2 h-4 w-4" /></>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </Card>
                    </form>
                </div>
            </DashboardLayout >
        </>
    );
}
