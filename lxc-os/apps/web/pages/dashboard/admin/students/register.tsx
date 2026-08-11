
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

// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from "@/components/ui/select";
import { ChevronRight, ChevronLeft, User, Users, BookOpen, HeartPulse, CheckCircle2, AlertCircle, Upload, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { LimitExceededModal } from "@/components/dashboard/admin/membership/LimitExceededModal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerStudentSchema } from "@/lib/validations/admin/registration";
import client from "@/lib/api/client";
// import { toast } from "sonner";
import { Input } from "@/components/ui/forms/input";
import { toast } from "react-toastify";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { LocationSelector } from "@/components/common/LocationSelector";
import { Loader } from "@/components/ui/feedback/Loader";
import { decodeId } from "@/lib/utils/hashId";
import { formatISTDateKey } from "@/lib/utils/date-utils";

const steps = [
    { id: 1, title: "Personal", icon: User },
    { id: 2, title: "Parent/Guardian", icon: Users },
    { id: 3, title: "Academic", icon: BookOpen },
    { id: 4, title: "Additional", icon: HeartPulse },
];

const Label = (props: any) => <label {...props} />;

export default function StudentRegistrationPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [classes, setClasses] = useState<any[]>([]);
    const [academicYears, setAcademicYears] = useState<any[]>([]);
    const [isCompleted, setIsCompleted] = useState(false);
    const [profilePic, setProfilePic] = useState<File | null>(null);
    const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [loadingClasses, setLoadingClasses] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);
    const [studentId, setStudentId] = useState<string | null>(null);
    const [fetchingStudent, setFetchingStudent] = useState(false);

    const form = useForm({
        resolver: zodResolver(registerStudentSchema),
        defaultValues: {
            status: "ACTIVE",
            areSiblingStudying: "No",
            sex: "MALE",
            bloodType: "O+",
            country: "India",
        }
    });

    const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error("Please select an image file");
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size should be less than 5MB");
            return;
        }

        setProfilePic(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setProfilePicPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const { formState: { errors }, watch, trigger, setValue } = form;

    useEffect(() => {
        const fetchData = async () => {
            setLoadingClasses(true);
            try {
                // Fetch classes
                try {
                    const classesRes = await client.get("/v1/dashboard/admin/classes");
                    const classesData = classesRes?.data;

                    if (Array.isArray(classesData)) {
                        const sortedClasses = [...classesData].sort((a: any, b: any) =>
                            a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
                        );
                        setClasses(sortedClasses as any);
                    }
                } catch (classError: any) {
                    console.error("Classes fetch error:", classError);
                }

                // Fetch academic years
                try {
                    const ayRes = await client.get("/v1/admin/settings/academic-years");
                    const academicYearsData = ayRes?.data;

                    if (Array.isArray(academicYearsData)) {
                        setAcademicYears(academicYearsData as any);
                        if (academicYearsData.length > 0 && !isEditMode) {
                            setValue("academicYear", academicYearsData[0].year);
                        }
                    }
                } catch (ayError: any) {
                    console.error("Academic years fetch error:", ayError);
                }
            } catch (err: any) {
                console.error("Failed to fetch dependencies:", err);
            } finally {
                setLoadingClasses(false);
            }
        };
        fetchData();
    }, [setValue, isEditMode]);

    // Detect edit mode and fetch student data
    const [isCheckingLimit, setIsCheckingLimit] = useState(true);
    const [isLimitExceeded, setIsLimitExceeded] = useState(false);
    const [limitData, setLimitData] = useState({ current: 0, allowed: 0 });

    useEffect(() => {
        // Only check usage on explicitly creating a new entry
        if (!router.query.edit) {
            checkUsageLimit();
        } else {
            setIsCheckingLimit(false);
        }
    }, [router.query.edit]);

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

    useEffect(() => {
        const { edit } = router.query;
        if (edit && typeof edit === 'string') {
            const decodedEdit = decodeId(edit);
            setIsEditMode(true);
            setStudentId(decodedEdit);
            setIsCompleted(false);
            setCurrentStep(1);
            fetchStudentData(decodedEdit);
        } else {
            setIsEditMode(false);
            setStudentId(null);
            setIsCompleted(false);
            setCurrentStep(1);
            form.reset({
                status: "ACTIVE",
                areSiblingStudying: "No",
                sex: "MALE",
                bloodType: "O+",
                country: "India",
            });
            setProfilePicPreview(null);
        }
    }, [router.query.edit]);

    const fetchStudentData = async (id: string) => {
        setFetchingStudent(true);
        try {
            const response = await client.get(`/v1/dashboard/admin/students/${id}`);
            if (response.data.success) {
                const student = response.data.data;
                const userData = student.user || {};
                const parentData = student.parent || {};
                const parentUser = parentData.user || {};

                // Map database fields to form fields
                const formData = {
                    name: userData.name || "",
                    email: userData.email || "",
                    phone: userData.phone || "",
                    sex: userData.sex || "MALE",
                    dateOfBirth: student.dateOfBirth ? formatISTDateKey(new Date(student.dateOfBirth)) : "",
                    bloodType: userData.bloodType || "O+",

                    guardianName: parentUser.name || student.guardianName || "",
                    guardianEmail: parentUser.email || student.guardianEmail || "",
                    guardianPhone: parentUser.phone || student.guardianPhone || "",
                    guardianRelation: student.guardianRelation || "Father",

                    classId: student.classId || "",
                    academicYear: student.academicYear || "",
                    section: student.section || "",
                    rollNo: student.rollNo || "",
                    admissionDate: student.admissionDate ? formatISTDateKey(new Date(student.admissionDate)) : "",

                    Religion: student.Religion || "Hindu",
                    allergies: student.allergies || "None",
                    medicalCondition: student.medicalCondition || "None",
                    currentAddress: student.currentAddress || userData.address || "",
                    country: userData.country || "India",
                    state: userData.state || "",
                    city: userData.city || "",
                    pincode: userData.pincode || "",
                    status: student.status || "ACTIVE",
                };

                form.reset(formData);
                if (userData.profilePic) {
                    setProfilePicPreview(userData.profilePic);
                }
            }
        } catch (error: any) {
            console.error("Failed to fetch student data:", error);
            toast.error("Failed to load student data");
        } finally {
            setFetchingStudent(false);
        }
    };

    const handleNext = async () => {
        let fieldsToValidate: any[] = [];
        if (currentStep === 1) {
            fieldsToValidate = ["name", "email", "phone", "sex", "dateOfBirth", "bloodType"];
        } else if (currentStep === 2) {
            fieldsToValidate = ["guardianName", "guardianEmail", "guardianPhone", "guardianRelation"];
        } else if (currentStep === 3) {
            fieldsToValidate = ["classId", "academicYear", "rollNo", "admissionDate"];
        }

        const isValid = await trigger(fieldsToValidate as any);
        if (isValid) {
            setCurrentStep(prev => Math.min(prev + 1, steps.length));
        } else {
            toast.error("Please fix validation errors before proceeding");
        }
    };

    const onSubmit = async (data: any) => {
        try {
            setLoading(true);

            // Validate step 4 fields before submission
            const step4Fields = ["Religion", "allergies", "medicalCondition", "currentAddress", "country", "state", "city", "pincode"];
            const step4Valid = await trigger(step4Fields as any);

            if (!step4Valid) {
                toast.error("Please fix validation errors in the Additional Information section");
                setLoading(false);
                return;
            }

            // Create FormData for file upload
            const formData = new FormData();

            // Append all form fields
            Object.keys(data).forEach(key => {
                if (data[key] !== undefined && data[key] !== null && data[key] !== "") {
                    // Convert dates and other objects to strings if needed
                    if (data[key] instanceof Date) {
                        formData.append(key, data[key].toISOString());
                    } else {
                        formData.append(key, String(data[key]));
                    }
                }
            });

            // Append profile picture if selected
            if (profilePic) {
                formData.append("profilePic", profilePic);
            }

            console.log("Submitting form data...", Object.fromEntries(formData.entries()));

            let response;
            if (isEditMode && studentId) {
                response = await client.put(`/v1/dashboard/admin/students/${studentId}`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
            } else {
                response = await client.post("/v1/dashboard/admin/students", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
            }

            console.log("Submission response:", response);

            if (response.data.success) {
                toast.success(isEditMode ? "Student updated successfully!" : "Student registered successfully!");
                setIsCompleted(true);
                router.push("/dashboard/admin/students");
            } else {
                toast.error(response.data.error || "Operation failed. Please try again.");
            }
        } catch (err: any) {
            console.error("Registration failed:", err);
            console.error("Error details:", err.response?.data);
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || "Registration failed. Please check your details.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (isCompleted) {
        return (
            <DashboardLayout role="admin">
                <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-6">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="h-24 w-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-lg shadow-emerald-500/20"
                    >
                        <CheckCircle2 className="h-12 w-12" />
                    </motion.div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                            {isEditMode ? "Update Complete!" : "Registration Complete!"}
                        </h2>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            {isEditMode
                                ? "The student profile has been updated successfully."
                                : "The student and parent accounts have been created. Notifications are being sent to their registered contact info."
                            }
                        </p>
                    </div>
                    <Button onClick={() => router.push("/dashboard/admin/students")} className="bg-indigo-600">
                        Back to Directory
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <>
            <Head>
                <title>Student Registration - LearnXChain</title>
            </Head>
            <DashboardLayout role="admin">
                <div className="w-full space-y-8 pb-10">
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
                                {isEditMode ? "Edit Student" : "New Admission"}
                            </h1>
                        </div>
                        <p className="text-gray-500 pl-14">
                            {isEditMode ? "Update student profile and academic details" : "Register a new student and configure their academic profile"}
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

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 relative">
                        <Card className="border-none shadow-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-md relative overflow-hidden">
                            <AnimatePresence>
                                {fetchingStudent && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm"
                                    >
                                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 border border-gray-100 dark:border-gray-700">
                                            <div className="relative">
                                                <Loader size="lg" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">Fetching Student Data</p>
                                                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Please wait a moment</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

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
                                                <Label className="text-indigo-600 font-bold flex items-center gap-2 tracking-widest uppercase text-[10px]"><User className="h-4 w-4" /> Personal Information</Label>
                                            </div>

                                            {/* Profile Picture Upload */}
                                            <div className="space-y-2 md:col-span-2">
                                                <Label>Profile Picture</Label>
                                                <div className="flex items-center gap-4">
                                                    <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                        {profilePicPreview ? (
                                                            <img src={profilePicPreview} alt="Profile" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <ImageIcon className="h-8 w-8 text-gray-400" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <label htmlFor="profilePic" className="cursor-pointer">
                                                            <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                                <Upload className="h-4 w-4" />
                                                                <span className="text-sm">Upload Photo</span>
                                                            </div>
                                                            <input
                                                                type="file"
                                                                id="profilePic"
                                                                className="hidden"
                                                                accept="image/*"
                                                                onChange={handleProfilePicChange}
                                                                disabled={uploading}
                                                            />
                                                        </label>
                                                        <p className="text-xs text-gray-500 mt-1">Max 5MB, JPG/PNG</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="name">Full Name *</Label>
                                                <Input id="name" {...form.register("name")} placeholder="John Doe" />
                                                {errors.name && <p className="text-rose-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.name.message as string}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email Address *</Label>
                                                <Input id="email" type="email" {...form.register("email")} placeholder="john@example.com" />
                                                {errors.email && <p className="text-rose-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.email.message as string}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="phone">Phone Number *</Label>
                                                <Input id="phone" {...form.register("phone")} placeholder="+1234567890" />
                                                {errors.phone && <p className="text-rose-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.phone.message as string}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Gender *</Label>
                                                <Select onValueChange={(v: any) => setValue("sex", v as any)} value={watch("sex")}>
                                                    <SelectTrigger className={errors.sex ? "border-rose-500" : ""}>
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

                                            <div className="space-y-2">
                                                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                                                <Input id="dateOfBirth" type="date" {...form.register("dateOfBirth")} className={errors.dateOfBirth ? "border-rose-500" : ""} />
                                                {errors.dateOfBirth && <p className="text-rose-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.dateOfBirth.message as string}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Blood Type *</Label>
                                                <Select
                                                    onValueChange={(v: string) => setValue("bloodType", v)}
                                                    value={watch("bloodType") || undefined}
                                                >
                                                    <SelectTrigger className={errors.bloodType ? "border-rose-500" : ""}>
                                                        <SelectValue placeholder="Select Blood Type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="O+">O+</SelectItem>
                                                        <SelectItem value="O-">O-</SelectItem>
                                                        <SelectItem value="A+">A+</SelectItem>
                                                        <SelectItem value="A-">A-</SelectItem>
                                                        <SelectItem value="B+">B+</SelectItem>
                                                        <SelectItem value="B-">B-</SelectItem>
                                                        <SelectItem value="AB+">AB+</SelectItem>
                                                        <SelectItem value="AB-">AB-</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {errors.bloodType && <p className="text-rose-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.bloodType.message as string}</p>}
                                            </div>
                                        </motion.div>
                                    )}

                                    {currentStep === 2 && (
                                        <motion.div
                                            key="step2"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-6"
                                        >
                                            <div className="grid gap-6 md:grid-cols-2">
                                                <div className="space-y-4 md:col-span-2">
                                                    <Label className="text-indigo-600 font-bold flex items-center gap-2 tracking-widest uppercase text-[10px]"><Users className="h-4 w-4" /> Parent/Guardian Information</Label>
                                                    <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30">
                                                        <p className="text-[10px] text-indigo-700 dark:text-indigo-300 font-medium">Guardian email will be used for parent account detection. If already exists, this student will be linked to the existing parent.</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="guardianName">Parent/Guardian Name *</Label>
                                                    <Input id="guardianName" {...form.register("guardianName")} placeholder="Full Name" />
                                                    {errors.guardianName && <p className="text-rose-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.guardianName.message as string}</p>}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="guardianRelation">Relationship *</Label>
                                                    <Select onValueChange={(v: string) => setValue("guardianRelation", v)} value={watch("guardianRelation") || undefined}>
                                                        <SelectTrigger className={errors.guardianRelation ? "border-rose-500" : ""}>
                                                            <SelectValue placeholder="Select Relationship" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Father">Father</SelectItem>
                                                            <SelectItem value="Mother">Mother</SelectItem>
                                                            <SelectItem value="Guardian">Guardian</SelectItem>
                                                            <SelectItem value="Other">Other</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.guardianRelation && <p className="text-rose-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.guardianRelation.message as string}</p>}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="guardianEmail">Email Address *</Label>
                                                    <Input id="guardianEmail" type="email" {...form.register("guardianEmail")} placeholder="parent@example.com" />
                                                    {errors.guardianEmail && <p className="text-rose-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.guardianEmail.message as string}</p>}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="guardianPhone">Phone Number *</Label>
                                                    <Input id="guardianPhone" {...form.register("guardianPhone")} placeholder="+1234567890" />
                                                    {errors.guardianPhone && <p className="text-rose-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.guardianPhone.message as string}</p>}
                                                </div>
                                            </div>
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
                                                <Label className="text-indigo-600 font-bold flex items-center gap-2 tracking-widest uppercase text-[10px]"><BookOpen className="h-4 w-4" /> Academic Configuration</Label>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Assign Class *</Label>
                                                {loadingClasses ? (
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <Loader size="sm" />
                                                        <span>Loading classes...</span>
                                                    </div>
                                                ) : (
                                                    <Select
                                                        onValueChange={(v: string) => setValue("classId", v)}
                                                        value={watch("classId") || undefined}
                                                    >
                                                        <SelectTrigger className={errors.classId ? "border-rose-500" : ""}>
                                                            <SelectValue placeholder={classes.length === 0 ? "No classes available - Create classes first" : "Select Class"}>
                                                                {classes.find((c: any) => c.id === watch("classId"))?.name}
                                                            </SelectValue>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {classes.length === 0 ? (
                                                                <SelectItem value="no-classes" disabled >No classes available - Please create classes first</SelectItem>
                                                            ) : (
                                                                classes.map((c: any) => (
                                                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                                                ))
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                                {errors.classId && <p className="text-rose-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.classId.message as string}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Assigned Section</Label>
                                                <Select
                                                    onValueChange={(v: string) => setValue("section", v)}
                                                    value={watch("section") || undefined}
                                                >
                                                    <SelectTrigger disabled={!watch("classId")} className={errors.section ? "border-rose-500" : ""}>
                                                        <SelectValue placeholder={!watch("classId") ? "Select class first" : "Select Section"}>
                                                            {((classes.find((c: any) => c.id === watch("classId")) as any)?.Section || [])
                                                                .find((s: any) => s.id === watch("section"))?.name}
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {((classes.find((c: any) => c.id === watch("classId")) as any)?.Section || []).map((s: any) => (
                                                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Academic Session *</Label>
                                                <Select
                                                    onValueChange={(v: string) => setValue("academicYear", v)}
                                                    value={watch("academicYear") || undefined}
                                                >
                                                    <SelectTrigger className={errors.academicYear ? "border-rose-500" : ""}>
                                                        <SelectValue placeholder={academicYears.length === 0 ? "No academic years available" : "Select Year"} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {academicYears.length === 0 ? (
                                                            <SelectItem value="no-years" disabled>No academic years available</SelectItem>
                                                        ) : (
                                                            academicYears.map((ay: any) => (
                                                                <SelectItem key={ay.id} value={ay.year}>{ay.year}</SelectItem>
                                                            ))
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                {errors.academicYear && <p className="text-rose-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.academicYear.message as string}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="rollNo">Assign Roll Number *</Label>
                                                <Input id="rollNo" {...form.register("rollNo")} placeholder="e.g. 21" className={errors.rollNo ? "border-rose-500" : ""} />
                                                {errors.rollNo && <p className="text-rose-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.rollNo.message as string}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="admissionDate">Admission Date *</Label>
                                                <Input id="admissionDate" type="date" {...form.register("admissionDate")} className={errors.admissionDate ? "border-rose-500" : ""} />
                                                {errors.admissionDate && <p className="text-rose-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.admissionDate.message as string}</p>}
                                            </div>
                                        </motion.div>
                                    )}

                                    {currentStep === 4 && (
                                        <motion.div
                                            key="step4"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-8"
                                        >
                                            <div className="grid gap-6 md:grid-cols-2">
                                                <div className="space-y-4 md:col-span-2">
                                                    <Label className="text-indigo-600 font-bold flex items-center gap-2 tracking-widest uppercase text-[10px]"><HeartPulse className="h-4 w-4" /> Health & Demographics</Label>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Religion *</Label>
                                                    <Select
                                                        onValueChange={(v: string) => setValue("Religion", v)}
                                                        value={watch("Religion") || undefined}
                                                    >
                                                        <SelectTrigger className={errors.Religion ? "border-rose-500" : ""}>
                                                            <SelectValue placeholder="Select Religion" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Hindu">Hindu</SelectItem>
                                                            <SelectItem value="Muslim">Muslim</SelectItem>
                                                            <SelectItem value="Christian">Christian</SelectItem>
                                                            <SelectItem value="Sikh">Sikh</SelectItem>
                                                            <SelectItem value="Buddhist">Buddhist</SelectItem>
                                                            <SelectItem value="Jain">Jain</SelectItem>
                                                            <SelectItem value="Parsi">Parsi</SelectItem>
                                                            <SelectItem value="Jewish">Jewish</SelectItem>
                                                            <SelectItem value="Other">Other</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.Religion && <p className="text-rose-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.Religion.message as string}</p>}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Allergies *</Label>
                                                    <Select
                                                        onValueChange={(v: string) => setValue("allergies", v)}
                                                        value={watch("allergies") || undefined}
                                                    >
                                                        <SelectTrigger className={errors.allergies ? "border-rose-500" : ""}>
                                                            <SelectValue placeholder="Select Allergy" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="None">None</SelectItem>
                                                            <SelectItem value="Peanuts">Peanuts</SelectItem>
                                                            <SelectItem value="Dust">Dust</SelectItem>
                                                            <SelectItem value="Pollen">Pollen</SelectItem>
                                                            <SelectItem value="Milk">Milk</SelectItem>
                                                            <SelectItem value="Eggs">Eggs</SelectItem>
                                                            <SelectItem value="Fish">Fish</SelectItem>
                                                            <SelectItem value="Shellfish">Shellfish</SelectItem>
                                                            <SelectItem value="Soy">Soy</SelectItem>
                                                            <SelectItem value="Wheat">Wheat</SelectItem>
                                                            <SelectItem value="Tree Nuts">Tree Nuts</SelectItem>
                                                            <SelectItem value="Medication">Medication</SelectItem>
                                                            <SelectItem value="Latex">Latex</SelectItem>
                                                            <SelectItem value="Insect Stings">Insect Stings</SelectItem>
                                                            <SelectItem value="Other">Other</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.allergies && <p className="text-rose-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.allergies.message as string}</p>}
                                                </div>
                                                <div className="space-y-2 md:col-span-2">
                                                    <Label htmlFor="medicalCondition">Medical Condition (Enter 'None' if applicable) *</Label>
                                                    <Input id="medicalCondition" {...form.register("medicalCondition")} placeholder="Any chronic conditions..." className={errors.medicalCondition ? "border-rose-500" : ""} />
                                                    {errors.medicalCondition && <p className="text-rose-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.medicalCondition.message as string}</p>}
                                                </div>
                                            </div>

                                            <div className="grid gap-6 md:grid-cols-2 pt-6 border-t border-gray-100 dark:border-gray-800">
                                                <div className="space-y-4 md:col-span-2">
                                                    <Label className="text-gray-400 font-bold tracking-widest uppercase text-[10px]">Address Information</Label>
                                                </div>
                                                <div className="space-y-2 md:col-span-2">
                                                    <Label htmlFor="currentAddress">Residential Address *</Label>
                                                    <Input id="currentAddress" {...form.register("currentAddress")} placeholder="House/Flat No., Street, Area" className={errors.currentAddress ? "border-rose-500" : ""} />
                                                    {errors.currentAddress && <p className="text-rose-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.currentAddress.message as string}</p>}
                                                </div>
                                                <div className="md:col-span-2">
                                                    <LocationSelector
                                                        control={form.control}
                                                        setValue={form.setValue}
                                                        watch={form.watch}
                                                        errors={form.formState.errors}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="pincode">Pincode *</Label>
                                                    <Input
                                                        id="pincode"
                                                        {...form.register("pincode")}
                                                        placeholder="e.g. 400001"
                                                        type="text"
                                                        maxLength={6}
                                                        pattern="[0-9]{6}"
                                                        className={errors.pincode ? "border-rose-500" : ""}
                                                    />
                                                    {errors.pincode && <p className="text-rose-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.pincode.message as string}</p>}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
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
                                    <Button type="button" onClick={handleNext} className="bg-indigo-600 hover:bg-indigo-700 min-w-[120px]">
                                        Next Step <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        disabled={loading}
                                        onClick={async (e) => {
                                            e.preventDefault();
                                            console.log("Complete Registration clicked");
                                            // Validate all fields including step 4
                                            const step4Fields = ["Religion", "allergies", "medicalCondition", "currentAddress", "country", "state", "city", "pincode"];
                                            const allFields = [...step4Fields, "name", "email", "phone", "sex", "dateOfBirth", "bloodType", "guardianName", "guardianEmail", "guardianPhone", "guardianRelation", "classId", "academicYear", "rollNo", "admissionDate"];
                                            const isValid = await trigger(allFields as any);
                                            console.log("Form validation result:", isValid);
                                            console.log("Form errors:", form.formState.errors);
                                            if (isValid) {
                                                const formData = form.getValues();
                                                console.log("Form data:", formData);
                                                await onSubmit(formData);
                                            } else {
                                                toast.error("Please fix all validation errors before submitting");
                                                // Scroll to first error
                                                const firstError = Object.keys(form.formState.errors)[0];
                                                if (firstError) {
                                                    const element = document.querySelector(`[name="${firstError}"], #${firstError}`);
                                                    if (element) {
                                                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                    }
                                                }
                                            }
                                        }}
                                        className="bg-indigo-600 hover:bg-indigo-700 min-w-[140px] shadow-lg shadow-indigo-500/20"
                                    >
                                        {loading ? (
                                            <><Loader size="sm" variant="white" /> {isEditMode ? "Updating..." : "Finalizing..."}</>
                                        ) : (
                                            <>{isEditMode ? "Update Student" : "Complete Registration"} <CheckCircle2 className="ml-2 h-4 w-4" /></>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </Card>
                    </form>
                </div>
            </DashboardLayout>
        </>
    );
}
