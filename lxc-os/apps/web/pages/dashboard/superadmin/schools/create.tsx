

import React, { useState, useEffect } from 'react';
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
import { decodeId } from '@/lib/utils/hashId';

// Schema Validation
const createSchoolSchema = z.object({
    // Step 1
    schoolName: z.string().min(1, "School name is required"),

    // Step 2
    adminName: z.string().min(1, "Admin name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(1, "Phone number is required"),
    // password: z.string().min(6), // Auto-generated
    sex: z.enum(["MALE", "FEMALE", "OTHER"], { required_error: "Gender is required" }),
    bloodType: z.string().min(1, "Blood type is required"),

    // Step 3
    address: z.string().min(1, "Address is required"),
    country: z.string().min(1, "Country is required"),
    state: z.string().min(1, "State is required"),
    city: z.string().min(1, "City is required"),
    pincode: z.string().min(1, "Pincode is required"),
});

type CreateSchoolFormData = z.infer<typeof createSchoolSchema>;

// Input Component (Unchanged)
const InputField = ({ label, error, register, name, type = "text", placeholder, options }: any) => (
    <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">{label}</label>
        {options ? (
            <div className="relative">
                <select
                    {...register(name)}
                    className="w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 text-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:focus:ring-blue-500/40 appearance-none"
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
                className="w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 text-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:placeholder-gray-500 dark:focus:ring-blue-500/40"
            />
        )}
        {error && <p className="text-red-500 text-xs ml-1">{error.message}</p>}
    </div>
);

// File Upload Component
const FileUpload = ({ label, onChange, previewUrl, onRemove }: { label: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, previewUrl: string | null, onRemove: () => void }) => (
    <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">{label}</label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-xl hover:border-blue-500 dark:hover:border-blue-500 transition-colors bg-white/30 dark:bg-gray-800/30">
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
                        <label className="relative cursor-pointer bg-transparent rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
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

const steps = [
    { id: 0, title: "School Details", icon: Building2 },
    { id: 1, title: "Administrator", icon: User },
    { id: 2, title: "Location", icon: MapPin },
];

export default function CreateOrEditSchool() {
    const router = useRouter();
    const { edit: editRaw } = router.query;
    const edit = editRaw && typeof editRaw === 'string' ? decodeId(editRaw) : editRaw;
    const isEditMode = !!edit;
    const { get, loading: fetchLoading } = useApi();

    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [schoolLogo, setSchoolLogo] = useState<File | null>(null);
    const [schoolLogoPreview, setSchoolLogoPreview] = useState<string | null>(null);
    const [profilePic, setProfilePic] = useState<File | null>(null);
    const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors }, reset, trigger, control, setValue, watch } = useForm<CreateSchoolFormData>({
        resolver: zodResolver(createSchoolSchema),
        mode: "onChange"
    });

    // Fetch existing data for edit mode
    useEffect(() => {
        if (isEditMode && typeof edit === 'string') {
            const fetchSchoolData = async () => {
                const data = await get(`/v1/superadmin/schools/${edit}`);
                if (data) {
                    // Normalize data structure if needed
                    reset({
                        schoolName: data.schoolName,
                        adminName: data.user?.name || '',
                        email: data.user?.email || '',
                        phone: data.user?.phone || '',
                        sex: data.user?.sex || 'MALE', // Provide default or fetch if available
                        bloodType: data.user?.bloodType || 'O+', // Provide default or fetch
                        address: data.address || '',
                        city: data.city || '',
                        state: data.state || '',
                        country: data.country || '',
                        pincode: data.pincode || '',
                    });

                    if (data.schoolLogo) setSchoolLogoPreview(data.schoolLogo);
                    if (data.user?.profilePic) setProfilePicPreview(data.user.profilePic);
                }
            };
            fetchSchoolData();
        }
    }, [edit, isEditMode, get, reset]);


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: Function, setPreview: Function) => {
        const file = e.target.files?.[0];
        if (file) {
            setFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmit: SubmitHandler<CreateSchoolFormData> = async (data) => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                formData.append(key, value);
            });
            // Append files if they are new Files objects
            if (schoolLogo) formData.append('schoolLogo', schoolLogo);
            if (profilePic) formData.append('profilePic', profilePic);

            let response;
            if (isEditMode) {
                response = await client.put(`/v1/superadmin/schools/${edit}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                toast.success('School updated successfully');
                router.push('/dashboard/superadmin/schools'); // Redirect after edit
            } else {
                response = await client.post('/v1/superadmin/schools/create', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                const { generatedPassword } = response.data;
                // Show success with password (only for create)
                toast.success(
                    <SuccessToast password={generatedPassword} />,
                    { autoClose: false, closeOnClick: false }
                );

                reset();
                setSchoolLogo(null);
                setSchoolLogoPreview(null);
                setProfilePic(null);
                setProfilePicPreview(null);
                setCurrentStep(0);
            }

        } catch (error: any) {
            console.error(error);
            const message = error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} school`;
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const nextStep = async () => {
        let isValid = false;
        if (currentStep === 0) {
            isValid = await trigger(['schoolName']);
        } else if (currentStep === 1) {
            isValid = await trigger(['adminName', 'email', 'phone', 'sex', 'bloodType']);
        }

        if (isValid) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const prevStep = () => {
        setCurrentStep((prev) => prev - 1);
    };

    if (fetchLoading && isEditMode) {
        return (
            <DashboardLayout role="superadmin">
                <div className="flex justify-center items-center h-screen">
                    <Loader size="lg" />
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout role="superadmin">
            <div className="w-full space-y-8 p-4 lg:p-8">

                {/* Navigation Back */}
                <Link href="/dashboard/superadmin/schools" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Schools
                </Link>

                {/* Header */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
                        {isEditMode ? 'Edit School' : 'Register New School'}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        {isEditMode ? 'Update school details and administrator information.' : 'Follow the steps to create a new school account.'}
                    </p>
                </div>

                {/* Stepper */}
                <div className="relative flex justify-between items-center w-full max-w-2xl mx-auto mb-10">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 dark:bg-gray-800 -z-10 rounded-full"></div>
                    <div
                        className="absolute top-1/2 left-0 h-1 bg-blue-600 dark:bg-blue-500 -z-10 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                    ></div>

                    {steps.map((step, index) => {
                        const isCompleted = currentStep > index;
                        const isCurrent = currentStep === index;

                        return (
                            <div key={step.id} className="flex flex-col items-center gap-2 px-2 min-w-[100px]">
                                <div
                                    className={`
                                        w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                                        ${isCompleted || isCurrent
                                            ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                            : 'border-gray-300 bg-white dark:bg-gray-900 dark:border-gray-700 text-gray-400'
                                        }
                                    `}
                                >
                                    {isCompleted ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                                </div>
                                <span className={`text-xs font-medium ${isCurrent ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}>
                                    {step.title}
                                </span>
                            </div>
                        );
                    })}
                </div>

                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-800 p-6 md:p-8 min-h-[500px]">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 h-full flex flex-col justify-between">

                        {/* Steps Content */}
                        <div className="flex-1">
                            {currentStep === 0 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 border-b dark:border-gray-800 pb-3 mb-6">
                                        School Details
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-6">
                                            <InputField
                                                label="School Name"
                                                name="schoolName"
                                                register={register}
                                                error={errors.schoolName}
                                                placeholder="e.g. Springfield High School"
                                            />
                                        </div>
                                        <div>
                                            <FileUpload
                                                label="School Logo"
                                                onChange={(e) => handleFileChange(e, setSchoolLogo, setSchoolLogoPreview)}
                                                previewUrl={schoolLogoPreview}
                                                onRemove={() => { setSchoolLogo(null); setSchoolLogoPreview(null); }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 1 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 border-b dark:border-gray-800 pb-3 mb-6">
                                        Administrator Details
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <InputField label="Admin Name" name="adminName" register={register} error={errors.adminName} placeholder="Full Name" />
                                            <InputField label="Email Address" name="email" type="email" register={register} error={errors.email} placeholder="admin@school.com" />
                                            <InputField label="Phone Number" name="phone" register={register} error={errors.phone} placeholder="+1 (555) 000-0000" />
                                            <div className="grid grid-cols-2 gap-4">
                                                <InputField
                                                    label="Gender"
                                                    name="sex"
                                                    register={register}
                                                    error={errors.sex}
                                                    options={["MALE", "FEMALE", "OTHER"]}
                                                />
                                                <InputField
                                                    label="Blood Type"
                                                    name="bloodType"
                                                    register={register}
                                                    error={errors.bloodType}
                                                    options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <FileUpload
                                                label="Profile Picture"
                                                onChange={(e) => handleFileChange(e, setProfilePic, setProfilePicPreview)}
                                                previewUrl={profilePicPreview}
                                                onRemove={() => { setProfilePic(null); setProfilePicPreview(null); }}
                                            />
                                            {!isEditMode && (
                                                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/50">
                                                    <p className="text-sm text-blue-800 dark:text-blue-300 flex items-center gap-2">
                                                        <Check className="w-4 h-4" />
                                                        Password will be auto-generated and sent to the admin.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 border-b dark:border-gray-800 pb-3 mb-6">
                                        Location & Address
                                    </h2>
                                    <div className="space-y-8">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Geographic Location</label>
                                            <div className="p-1">
                                                <LocationSelector
                                                    control={control}
                                                    setValue={setValue}
                                                    watch={watch}
                                                    errors={errors}
                                                />
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-100 dark:border-gray-800 pt-2"></div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2">
                                                <InputField label="Street Address" name="address" register={register} error={errors.address} placeholder="123 Education Lane" />
                                            </div>
                                            <div>
                                                <InputField label="Pincode/Zip" name="pincode" register={register} error={errors.pincode} placeholder="Postal Code" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Navigation Actions */}
                        <div className="flex justify-between pt-8 border-t border-gray-100 dark:border-gray-800 mt-6">
                            <button
                                type="button"
                                onClick={prevStep}
                                disabled={currentStep === 0}
                                className={`flex items-center px-6 py-2.5 rounded-xl text-sm font-medium transition-colors
                                    ${currentStep === 0
                                        ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Back
                            </button>

                            {currentStep < steps.length - 1 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="flex items-center px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-gray-200 dark:shadow-none"
                                >
                                    Next Step
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="group relative flex items-center justify-center py-2.5 px-8 text-white text-sm font-medium rounded-xl overflow-hidden transition-all hover:scale-105 active:scale-95 disabled:opacity-70 disabled:hover:scale-100 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-violet-600 to-blue-600 animate-gradient-xy"></div>
                                    <div className="relative flex items-center gap-2">
                                        {isLoading ? (
                                            <>
                                                <Loader size="sm" variant="white" />
                                                <span>{isEditMode ? 'Updating School...' : 'Creating School...'}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>{isEditMode ? 'Update School' : 'Create School'}</span>
                                                <Check className="w-4 h-4 ml-2" />
                                            </>
                                        )}
                                    </div>
                                </button>
                            )}
                        </div>

                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}

// Helper for Toast Message
const SuccessToast = ({ password }: { password: string }) => (
    <div className='space-y-2'>
        <p className='font-bold text-base'>School Created Successfully!</p>
        <div className='bg-white/10 p-3 rounded-lg border border-white/20'>
            <p className='text-xs opacity-80 mb-1'>Admin Password (Sent to Email):</p>
            <p className='font-mono text-lg tracking-wider font-bold select-all'>{password}</p>
        </div>
        <p className='text-xs opacity-70'>Please copy this password now.</p>
    </div>
);
