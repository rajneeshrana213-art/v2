
import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, User, Briefcase, CheckCircle2, Camera } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { LimitExceededModal } from "@/components/dashboard/admin/membership/LimitExceededModal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import client from "@/lib/api/client";
import { Input } from "@/components/ui/forms/input";
import { toast } from "react-toastify";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { registerAccountSchema, registerDriverSchema, registerStaffSchema, registerHostelSchema } from "@/lib/validations/admin/staff";
import { LocationSelector } from "@/components/common/LocationSelector";
import { Loader } from "@/components/ui/feedback/Loader";
import { decodeId } from "@/lib/utils/hashId";

type StaffFormValues = {
    role: string;
    name: string;
    userName: string;
    email: string;
    phone: string;
    sex: "MALE" | "FEMALE" | "OTHERS";
    bloodType: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    hostelName?: string;
    capacity?: string;
    license?: string;
    busId?: string;
};



const steps = [
    { id: 1, title: "Role & Account", icon: Briefcase },
    { id: 2, title: "Personal Details", icon: User },
    { id: 3, title: "Address & Contact", icon: User },
];

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const Label = (props: any) => <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block" {...props} />;

export default function StaffRegistrationPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [profilePic, setProfilePic] = useState<string | null>(null);
    const [licensePhoto, setLicensePhoto] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadingLicense, setUploadingLicense] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedRole, setSelectedRole] = useState("account");
    const editId = router.query.edit && typeof router.query.edit === 'string' ? decodeId(router.query.edit) : undefined;

    const form = useForm<StaffFormValues>({
        resolver: zodResolver(
            selectedRole === "driver" ? registerDriverSchema :
                selectedRole === "hostel" ? registerHostelSchema :
                    selectedRole === "staff" ? registerStaffSchema :
                        registerAccountSchema
        ) as any,
        defaultValues: {
            role: "account",
            name: "",
            email: "",
            phone: "",
            sex: "MALE",
            bloodType: "O+",
            address: "",
            city: "",
            state: "",
            country: "India",
            pincode: "",
            hostelName: "",
            capacity: "",
            license: "",
            busId: "",
        }
    });

    const { formState: { errors }, watch, trigger, setValue, reset } = form;


    const fetchStaffDetails = async (id: string) => {
        try {
            setLoading(true);

            const response = await client.get(`/v1/dashboard/admin/staff/${id}`);
            if (response.data.success) {
                const data = response.data.data;
                form.reset({
                    ...data,
                    capacity: data.capacity?.toString() || "",
                });
                setSelectedRole(data.role);
                if (data.profilePic) setProfilePic(data.profilePic);
                if (data.Driver?.licensePhoto) setLicensePhoto(data.Driver.licensePhoto);
            }
        } catch (err) {
            console.error("Failed to fetch staff details", err);
            toast.error("Failed to load staff details for editing");
        } finally {
            setLoading(false);
        }
    };

    const [isCheckingLimit, setIsCheckingLimit] = useState(true);
    const [isLimitExceeded, setIsLimitExceeded] = useState(false);
    const [limitData, setLimitData] = useState({ current: 0, allowed: 0 });

    useEffect(() => {
        // Only check usage on explicitly creating a new entry
        if (!editId) {
            checkUsageLimit();
        } else {
            setIsCheckingLimit(false);
        }
    }, [editId]);

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
        if (editId) {
            setIsEditMode(true);
            fetchStaffDetails(editId);
        }
    }, [editId]);

    const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", "school_management");

            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePic(reader.result as string);
                setUploading(false);
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error("Upload failed", err);
            toast.error("Failed to upload image");
            setUploading(false);
        }
    };

    const handleLicensePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploadingLicense(true);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLicensePhoto(reader.result as string);
                setUploadingLicense(false);
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error("License upload failed", err);
            toast.error("Failed to upload license image");
            setUploadingLicense(false);
        }
    };

    const handleNext = async (e?: React.MouseEvent | React.KeyboardEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        let fieldsToValidate: (keyof StaffFormValues)[] = [];

        if (currentStep === 1) {
            fieldsToValidate = ["role", "name", "email"];
            if (selectedRole === "driver") {
                fieldsToValidate.push("license");
            }
        } else if (currentStep === 2) {
            fieldsToValidate = ["phone", "sex", "bloodType"];
        } else if (currentStep === 3) {
            fieldsToValidate = ["address", "pincode", "city", "state", "country"];
        }

        const isValid = await trigger(fieldsToValidate);
        if (isValid) {
            setCurrentStep(prev => Math.min(prev + 1, steps.length));
        } else {
            const stepErrors = fieldsToValidate.filter(f => errors[f]);
            if (stepErrors.length > 0) {
                console.log("Validation failed for fields:", stepErrors, errors);
                toast.error(`Please fix validation errors in: ${stepErrors.join(", ")}`);
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

    const onFormError = (errors: any) => {
        if (currentStep !== steps.length) return;

        console.error("Form validation errors:", errors);
        const errorFields = Object.keys(errors);
        if (errorFields.length > 0) {
            toast.error(`Validation failed for: ${errorFields.join(", ")}`);
        }
    };

    const onSubmit = async (data: any) => {
        console.log("[StaffRegistration] Form Data:", data);

        try {
            setLoading(true);
            const payload = {
                ...data,
                profilePic: profilePic,
                licensePhoto: licensePhoto
            };

            const response = isEditMode
                ? await client.put(`/v1/dashboard/admin/staff/${editId}`, payload)
                : await client.post("/v1/dashboard/admin/staff", payload);



            if (response.data.success) {
                toast.success(isEditMode ? "Staff member updated successfully!" : "Staff member registered successfully!");
                setIsCompleted(true);
                router.push("/dashboard/admin/staff");
            }
        } catch (err: any) {
            console.error("Submission failed:", err);
            const errorData = err.response?.data?.error;

            if (Array.isArray(errorData)) {
                // Map Zod errors back to form fields
                const errorFields: string[] = [];
                errorData.forEach((error: any) => {
                    if (error.path && error.path.length > 0) {
                        const fieldName = error.path[0] as keyof StaffFormValues;
                        errorFields.push(fieldName);
                        form.setError(fieldName, {
                            type: "server",
                            message: error.message
                        });
                    }
                });

                // Helper to find which step the field belongs to
                const getStepForField = (field: string) => {
                    if (["role", "name", "email", "license"].includes(field)) return 1;
                    if (["phone", "sex", "bloodType"].includes(field)) return 2;
                    if (["address", "pincode", "city", "state", "country"].includes(field)) return 3;
                    return 1;
                };

                if (errorFields.length > 0) {
                    const firstErrorField = errorFields[0];
                    const errorStep = getStepForField(firstErrorField);
                    setCurrentStep(errorStep);
                    toast.error(`Please fix errors in: ${errorFields.join(", ")}`);
                } else {
                    toast.error("Please correct the highlighted errors.");
                }
            } else {
                toast.error(errorData || "Submission failed. Please check your details.");
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditMode && currentStep === 1 && !form.getValues("name")) {
        return (
            <DashboardLayout role="admin">
                <div className="flex items-center justify-center h-[50vh]">
                    <Loader size="lg" />
                </div>
            </DashboardLayout>
        );
    }

    if (isCompleted) {
        return (
            <DashboardLayout role="admin">
                <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-6">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="h-24 w-24 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-lg shadow-indigo-500/20"
                    >
                        <CheckCircle2 className="h-12 w-12" />
                    </motion.div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Registration Complete!</h2>
                        <p className="text-gray-500 max-w-sm mx-auto">The staff account has been created successfully. Credentials have been sent to their email.</p>
                    </div>
                    <Button onClick={() => router.push("/dashboard/admin/staff")} className="bg-indigo-600">
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
                <title>{isEditMode ? 'Edit Staff' : 'Add New Staff'} - LearnXChain</title>
            </Head>

            <LimitExceededModal
                isOpen={isLimitExceeded}
                onClose={() => {
                    setIsLimitExceeded(false);
                    router.push("/dashboard/admin/staff");
                }}
                currentUsers={limitData.current}
                allowedUsers={limitData.allowed}
                userType="Staff"
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
                                {isEditMode ? "Edit Staff Details" : "Add New Staff"}
                            </h1>
                        </div>
                        <p className="text-gray-500 pl-14">
                            {isEditMode ? "Update the information for this staff member" : "Onboard a new staff member and assign their role"}
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
                                            <div className="md:col-span-2 flex justify-center mb-4">
                                                <div className="relative group">
                                                    <div className="h-32 w-32 rounded-full border-4 border-indigo-100 dark:border-indigo-900/30 overflow-hidden bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                                                        {profilePic ? (
                                                            <img src={profilePic} alt="Profile" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <User className="h-16 w-16 text-gray-300" />
                                                        )}
                                                        {uploading && (
                                                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                                                <Loader size="sm" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <label className="absolute bottom-0 right-0 h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-indigo-700 transition-colors shadow-lg">
                                                        <Camera className="h-5 w-5" />
                                                        <input type="file" className="hidden" accept="image/*" onChange={handleProfilePicChange} />
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Staff Role *</Label>
                                                <Select
                                                    onValueChange={(v: any) => {
                                                        setValue("role", v);
                                                        setSelectedRole(v);
                                                    }}
                                                    value={selectedRole}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Role" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="account">Accountant</SelectItem>
                                                        <SelectItem value="academics">Academics</SelectItem>
                                                        <SelectItem value="transport">Transport Manager</SelectItem>
                                                        <SelectItem value="library">Librarian</SelectItem>
                                                        <SelectItem value="hostel">Hostel Warden</SelectItem>
                                                        <SelectItem value="driver">Driver</SelectItem>
                                                        <SelectItem value="staff">General Staff</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {errors.role && <p className="text-rose-500 text-[10px] font-bold mt-1 uppercase tracking-tight">{errors.role.message as string}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="name">Full Name *</Label>
                                                <Input id="name" {...form.register("name")} placeholder="John Doe" />
                                                {errors.name && <p className="text-rose-500 text-[10px] font-bold mt-1 uppercase tracking-tight">{errors.name.message as string}</p>}
                                            </div>



                                            <div className="space-y-2">

                                                <Label htmlFor="email">Email Address *</Label>
                                                <Input id="email" type="email" {...form.register("email")} placeholder="john@school.com" />
                                                {errors.email && <p className="text-rose-500 text-[10px] font-bold mt-1 uppercase tracking-tight">{errors.email.message as string}</p>}
                                            </div>

                                            {selectedRole === "hostel" && (
                                                <div className="md:col-span-2 p-4 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-xl">
                                                    <p className="text-sm text-indigo-600 dark:text-indigo-400">
                                                        Role set to <b>Hostel Warden</b>. Hostel details will be managed automatically.
                                                    </p>
                                                </div>
                                            )}

                                            {selectedRole === "driver" && (
                                                <>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="license">DL Number *</Label>
                                                        <Input id="license" {...form.register("license")} placeholder="ABC123456" />
                                                        {errors.license && <p className="text-rose-500 text-[10px] font-bold mt-1 uppercase tracking-tight">{errors.license.message as string}</p>}
                                                    </div>
                                                    <div className="space-y-4">
                                                        <Label>License Photo</Label>
                                                        <div className="relative group/license">
                                                            <div className="h-40 w-full rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-indigo-500/50">
                                                                {licensePhoto ? (
                                                                    <div className="relative h-full w-full">
                                                                        <img src={licensePhoto} alt="License" className="h-full w-full object-cover" />
                                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/license:opacity-100 transition-opacity flex items-center justify-center">
                                                                            <Camera className="h-8 w-8 text-white" />
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex flex-col items-center space-y-2 text-gray-400">
                                                                        <Camera className="h-8 w-8" />
                                                                        <span className="text-xs">Upload License Copy</span>
                                                                    </div>
                                                                )}
                                                                {uploadingLicense && (
                                                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                                                        <Loader size="sm" />
                                                                    </div>
                                                                )}
                                                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleLicensePhotoChange} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
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
                                            <div className="space-y-2">
                                                <Label htmlFor="phone">Phone Number *</Label>
                                                <Input id="phone" {...form.register("phone")} placeholder="+1234567890" />
                                                {errors.phone && <p className="text-rose-500 text-xs mt-1">{errors.phone.message as string}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Gender *</Label>
                                                <Select onValueChange={(v: any) => setValue("sex", v)} defaultValue={watch("sex")}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Gender" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="MALE">Male</SelectItem>
                                                        <SelectItem value="FEMALE">Female</SelectItem>
                                                        <SelectItem value="OTHERS">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {errors.sex && <p className="text-rose-500 text-[10px] font-bold mt-1 uppercase tracking-tight">{errors.sex.message as string}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="bloodType">Blood Group *</Label>
                                                <Select onValueChange={(v: any) => setValue("bloodType", v)} value={watch("bloodType")}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Blood Group" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {bloodGroups.map(bg => (
                                                            <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.bloodType && <p className="text-rose-500 text-[10px] font-bold mt-1 uppercase tracking-tight">{errors.bloodType.message as string}</p>}
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
                                            <div className="space-y-2 md:col-span-2">
                                                <Label htmlFor="address">Full Address *</Label>
                                                <Input id="address" {...form.register("address")} />
                                                {errors.address && <p className="text-rose-500 text-[10px] font-bold mt-1 uppercase tracking-tight">{errors.address.message as string}</p>}
                                            </div>
                                            <div className="md:col-span-2">
                                                <LocationSelector
                                                    control={form.control}
                                                    setValue={form.setValue}
                                                    watch={form.watch}
                                                    errors={errors}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="pincode">Pincode *</Label>
                                                <Input id="pincode" {...form.register("pincode")} />
                                                {errors.pincode && <p className="text-rose-500 text-[10px] font-bold mt-1 uppercase tracking-tight">{errors.pincode.message as string}</p>}
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
                                    <Button type="button" onClick={(e) => handleNext(e)} className="bg-indigo-600 hover:bg-indigo-700 min-w-[120px]">
                                        Next <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 min-w-[140px]">
                                        {loading ? (
                                            <><Loader size="sm" variant="white" /> {isEditMode ? "Updating..." : "Registering..."}</>
                                        ) : (
                                            <>{isEditMode ? "Update Staff" : "Register Staff"} <CheckCircle2 className="ml-2 h-4 w-4" /></>
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
