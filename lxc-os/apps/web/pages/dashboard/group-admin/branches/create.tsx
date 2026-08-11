import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import DashboardLayout from '@/components/dashboard/layout/DashboardLayout';
import client from '@/lib/api/client';
import { Building2, User, MapPin, ChevronRight, ChevronLeft, Check, Upload, X, ArrowLeft } from 'lucide-react';
import { LocationSelector } from '@/components/common/LocationSelector';
import { useRouter } from 'next/router';
import { useApi } from '@/hooks/useApi';
import Link from 'next/link';
import { Loader } from '@/components/ui/feedback/Loader';

// Schema Validation
const createBranchSchema = z.object({
    // Step 1
    schoolName: z.string().min(1, "Branch (School) name is required"),

    // Step 2
    adminName: z.string().min(1, "Admin name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(1, "Phone number is required"),
    sex: z.enum(["MALE", "FEMALE", "OTHERS"], { required_error: "Gender is required" }),
    bloodType: z.string().min(1, "Blood type is required"),

    // Step 3
    address: z.string().min(1, "Address is required"),
    country: z.string().min(1, "Country is required"),
    state: z.string().min(1, "State is required"),
    city: z.string().min(1, "City is required"),
    pincode: z.string().min(1, "Pincode is required"),
});

type CreateBranchFormData = z.infer<typeof createBranchSchema>;

// Input Component
const InputField = ({ label, error, register, name, type = "text", placeholder, options }: any) => (
    <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">{label}</label>
        {options ? (
            <div className="relative">
                <select
                    {...register(name)}
                    className="w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 text-sm transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:focus:ring-indigo-500/40 appearance-none"
                >
                    <option value="" className="dark:bg-gray-800">Select {label}</option>
                    {options.map((opt: string) => (
                        <option key={opt} value={opt} className="dark:bg-gray-800">{opt}</option>
                    ))}
                </select>
                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 rotate-90 pointer-events-none" />
            </div>
        ) : (
            <input
                type={type}
                {...register(name)}
                placeholder={placeholder}
                className="w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 text-sm transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:placeholder-gray-500 dark:focus:ring-indigo-500/40"
            />
        )}
        {error && <p className="text-red-500 text-xs ml-1">{error.message}</p>}
    </div>
);

// File Upload Component
const FileUpload = ({ label, onChange, previewUrl, onRemove }: { label: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, previewUrl: string | null, onRemove: () => void }) => (
    <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">{label}</label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-xl hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors bg-white/30 dark:bg-gray-800/30">
            {previewUrl ? (
                <div className="relative">
                    <img src={previewUrl} alt="Preview" className="h-32 w-32 object-cover rounded-lg shadow-md" />
                    <button
                        type="button"
                        onClick={onRemove}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                        <label className="relative cursor-pointer bg-transparent rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                            <span>Upload a file</span>
                            <input type="file" className="sr-only" onChange={onChange} accept="image/*" />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                    </div>
                </div>
            )}
        </div>
    </div>
);

const CreateBranch = () => {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [schoolLogo, setSchoolLogo] = useState<File | null>(null);
    const [profilePic, setProfilePic] = useState<File | null>(null);
    const [schoolLogoPreview, setSchoolLogoPreview] = useState<string | null>(null);
    const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        trigger,
        control,
        formState: { errors },
        setValue,
        watch,
    } = useForm<CreateBranchFormData>({
        resolver: zodResolver(createBranchSchema),
        mode: 'onChange'
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'profile') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === 'logo') {
                    setSchoolLogo(file);
                    setSchoolLogoPreview(reader.result as string);
                } else {
                    setProfilePic(file);
                    setProfilePicPreview(reader.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const nextStep = async () => {
        let fieldsToValidate: any[] = [];
        if (step === 1) fieldsToValidate = ['schoolName'];
        if (step === 2) fieldsToValidate = ['adminName', 'email', 'phone', 'sex', 'bloodType'];

        const isValid = await trigger(fieldsToValidate);
        if (isValid) setStep(s => s + 1);
    };

    const prevStep = () => setStep(s => s - 1);

    const onSubmit: SubmitHandler<CreateBranchFormData> = async (data) => {
        try {
            setIsSubmitting(true);
            const formData = new FormData();

            // Append all common fields
            Object.entries(data).forEach(([key, value]) => {
                formData.append(key, value as string);
            });

            // Append files
            if (schoolLogo) formData.append('schoolLogo', schoolLogo);
            if (profilePic) formData.append('profilePic', profilePic);

            const response = await client.post('/v1/group-admin/branches/create', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success("Branch registered successfully!");

            // Password display logic (similar to super admin)
            if (response.data.generatedPassword) {
                toast.info(`Temporary Password: ${response.data.generatedPassword}`, {
                    autoClose: false,
                    closeOnClick: false,
                    draggable: false
                });
            }

            router.push('/dashboard/group-admin/branches');
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Registration failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout role="group_admin">
            <div className="min-h-screen bg-gray-50/50 p-4 dark:bg-gray-900/50 md:p-8">
                <div className="mx-auto max-w-4xl">
                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <Link
                                href="/dashboard/group-admin/branches"
                                className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Branches
                            </Link>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Register New Branch</h1>
                            <p className="mt-1 text-gray-500 dark:text-gray-400">Add a new school branch to your organization group.</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-12">
                        <div className="flex justify-between relative">
                            {/* Connecting Line */}
                            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-800 -translate-y-1/2" />
                            <div
                                className="absolute top-1/2 left-0 h-0.5 bg-indigo-500 transition-all duration-300 -translate-y-1/2"
                                style={{ width: `${((step - 1) / 2) * 100}%` }}
                            />

                            {[
                                { s: 1, icon: Building2, label: "Branch Details" },
                                { s: 2, icon: User, label: "Administrator" },
                                { s: 3, icon: MapPin, label: "Location" }
                            ].map((item) => (
                                <div key={item.s} className="relative z-10 flex flex-col items-center">
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border-4 transition-all duration-300 ${step >= item.s
                                            ? 'border-indigo-500 bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                            : 'border-white bg-white text-gray-400 shadow-sm dark:border-gray-800 dark:bg-gray-900'
                                        }`}>
                                        <item.icon className="h-6 w-6" />
                                    </div>
                                    <span className={`mt-2 text-xs font-bold uppercase tracking-wider ${step >= item.s ? 'text-indigo-600' : 'text-gray-400'
                                        }`}>
                                        {item.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Form Card */}
                    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl shadow-indigo-500/5 dark:border-white/10 dark:bg-gray-900">
                        <form onSubmit={handleSubmit(onSubmit)} className="p-8 md:p-12">
                            {step === 1 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="grid gap-8 md:grid-cols-2">
                                        <div className="space-y-6">
                                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Branch Identity</h2>
                                            <InputField
                                                label="Branch (School) Name"
                                                name="schoolName"
                                                register={register}
                                                error={errors.schoolName}
                                                placeholder="e.g. Green Valley Branch"
                                            />
                                        </div>
                                        <FileUpload
                                            label="Branch Logo"
                                            onChange={(e) => handleFileChange(e, 'logo')}
                                            previewUrl={schoolLogoPreview}
                                            onRemove={() => { setSchoolLogo(null); setSchoolLogoPreview(null); }}
                                        />
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="grid gap-8 md:grid-cols-2">
                                        <div className="space-y-6">
                                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Admin Information</h2>
                                            <InputField label="Admin Name" name="adminName" register={register} error={errors.adminName} />
                                            <InputField label="Email Address" name="email" type="email" register={register} error={errors.email} />
                                            <InputField label="Phone Number" name="phone" register={register} error={errors.phone} />
                                            <div className="grid grid-cols-2 gap-4">
                                                <InputField label="Gender" name="sex" register={register} error={errors.sex} options={["MALE", "FEMALE", "OTHERS"]} />
                                                <InputField label="Blood Type" name="bloodType" register={register} error={errors.bloodType} />
                                            </div>
                                        </div>
                                        <FileUpload
                                            label="Admin Profile Picture"
                                            onChange={(e) => handleFileChange(e, 'profile')}
                                            previewUrl={profilePicPreview}
                                            onRemove={() => { setProfilePic(null); setProfilePicPreview(null); }}
                                        />
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Physical Location</h2>
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="md:col-span-2">
                                            <InputField label="Street Address" name="address" register={register} error={errors.address} />
                                        </div>
                                        <LocationSelector
                                            control={control}
                                            setValue={setValue}
                                            watch={watch}
                                            errors={errors}
                                        />
                                        <InputField label="Pincode" name="pincode" register={register} error={errors.pincode} />
                                    </div>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="mt-12 flex items-center justify-between border-t border-gray-100 pt-8 dark:border-white/5">
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    disabled={step === 1}
                                    className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-500 hover:text-indigo-600'
                                        }`}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous Step
                                </button>

                                {step < 3 ? (
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 hover:scale-[1.02] active:scale-95"
                                    >
                                        Next Step
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-10 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader className="h-4 w-4" />
                                                Registering...
                                            </>
                                        ) : (
                                            <>
                                                <Check className="h-4 w-4" />
                                                Complete Registration
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CreateBranch;
