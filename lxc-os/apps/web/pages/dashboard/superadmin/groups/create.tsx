import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import DashboardLayout from '@/components/dashboard/layout/DashboardLayout';
import client from '@/lib/api/client';
import { decodeId } from '@/lib/utils/hashId';
import { Building, User, MapPin, ChevronRight, ChevronLeft, Check, Upload, X, ArrowLeft } from 'lucide-react';
import { LocationSelector } from '@/components/common/LocationSelector';
import { useRouter } from 'next/router';
import { useApi } from '@/hooks/useApi';
import Link from 'next/link';
import { Loader } from '@/components/ui/feedback/Loader';

// Schema Validation
const createGroupSchema = z.object({
    // Step 1
    organizationName: z.string().min(1, "Organization name is required"),

    // Step 2
    adminName: z.string().min(1, "Admin name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(1, "Phone number is required"),
    sex: z.enum(["MALE", "FEMALE", "OTHER"], { required_error: "Gender is required" }),
    bloodType: z.string().min(1, "Blood type is required"),

    // Step 3
    address: z.string().min(1, "Address is required"),
    country: z.string().min(1, "Country is required"),
    state: z.string().min(1, "State is required"),
    city: z.string().min(1, "City is required"),
    pincode: z.string().min(1, "Pincode is required"),
});

type CreateGroupFormData = z.infer<typeof createGroupSchema>;

const InputField = ({ label, error, register, name, type = "text", placeholder, options, disabled = false }: any) => (
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
                disabled={disabled}
                className={`w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 text-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:placeholder-gray-500 dark:focus:ring-blue-500/40${disabled ? ' opacity-60 cursor-not-allowed' : ''}`}
            />
        )}
        {error && <p className="text-red-500 text-xs ml-1">{error.message}</p>}
    </div>
);

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
    { id: 0, title: "Org Details", icon: Building },
    { id: 1, title: "Administrator", icon: User },
    { id: 2, title: "Location", icon: MapPin },
];

export default function CreateOrganization() {
    const router = useRouter();
    const encodedEditId = router.query.edit as string | undefined;
    const editId = encodedEditId ? decodeId(encodedEditId) : undefined;
    const isEditing = !!editId;
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingEdit, setIsLoadingEdit] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [orgLogo, setOrgLogo] = useState<File | null>(null);
    const [orgLogoPreview, setOrgLogoPreview] = useState<string | null>(null);
    const [profilePic, setProfilePic] = useState<File | null>(null);
    const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors }, reset, trigger, control, setValue, watch } = useForm<CreateGroupFormData>({
        resolver: zodResolver(createGroupSchema),
        mode: "onChange"
    });

    useEffect(() => {
        if (!isEditing || !router.isReady || !editId) return;
        (async () => {
            setIsLoadingEdit(true);
            try {
                const res = await client.get(`/v1/superadmin/groups/${editId}`);
                const { name, owner, logo } = res.data;
                setValue('organizationName', name || '');
                setValue('adminName', owner?.name || '');
                setValue('email', owner?.email || '');
                setValue('phone', owner?.phone || '');
                setValue('sex', owner?.sex === 'OTHERS' ? 'OTHER' : (owner?.sex || ''));
                setValue('bloodType', owner?.bloodType || '');
                setValue('address', owner?.address || '');
                setValue('city', owner?.city || '');
                setValue('state', owner?.state || '');
                setValue('country', owner?.country || '');
                setValue('pincode', owner?.pincode || '');
                if (logo) setOrgLogoPreview(logo);
                if (owner?.profilePic) setProfilePicPreview(owner.profilePic);
            } catch {
                toast.error('Failed to load organization data. Please try again.');
            } finally {
                setIsLoadingEdit(false);
            }
        })();
    }, [router.isReady, editId]);

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

    const onSubmit: SubmitHandler<CreateGroupFormData> = async (data) => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                formData.append(key, value);
            });
            if (orgLogo) formData.append('organizationLogo', orgLogo);
            if (profilePic) formData.append('profilePic', profilePic);

            if (isEditing) {
                await client.put(`/v1/superadmin/groups/edit/${editId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                toast.success('Organization updated successfully!');
            } else {
                const response = await client.post('/v1/superadmin/groups/create', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                const { generatedPassword } = response.data;
                toast.success(
                    <SuccessToast password={generatedPassword} />,
                    { autoClose: false, closeOnClick: false }
                );
            }

            router.push('/dashboard/superadmin/groups');
        } catch (error: any) {
            console.error(error);
            const message = error.response?.data?.message ||
                (isEditing ? 'Failed to update organization' : 'Failed to create organization');
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const nextStep = async () => {
        let isValid = false;
        if (currentStep === 0) {
            isValid = await trigger(['organizationName']);
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

    return (
        <DashboardLayout role="superadmin">
            <div className="w-full space-y-8 p-4 lg:p-8">
                <Link href="/dashboard/superadmin/groups" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Organizations
                </Link>

                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
                        {isEditing ? 'Edit Organization' : 'Register New Organization'}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        {isEditing
                            ? 'Update organization details and administrator information.'
                            : 'Create a new school group account and assign an administrator.'}
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

                <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-800 p-6 md:p-8 min-h-[500px]">
                    {isLoadingEdit && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
                            <Loader size="lg" />
                            <span className="text-sm text-gray-500 dark:text-gray-400">Loading organization data...</span>
                        </div>
                    )}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 h-full flex flex-col justify-between">
                        <div className="flex-1">
                            {currentStep === 0 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 border-b dark:border-gray-800 pb-3 mb-6">
                                        Organization Details
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputField
                                            label="Organization Name"
                                            name="organizationName"
                                            register={register}
                                            error={errors.organizationName}
                                            placeholder="e.g. LearnX Global Group"
                                        />
                                        <FileUpload
                                            label="Organization Logo"
                                            onChange={(e) => handleFileChange(e, setOrgLogo, setOrgLogoPreview)}
                                            previewUrl={orgLogoPreview}
                                            onRemove={() => { setOrgLogo(null); setOrgLogoPreview(null); }}
                                        />
                                    </div>
                                </div>
                            )}

                            {currentStep === 1 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 border-b dark:border-gray-800 pb-3 mb-6">
                                        Group Administrator Details
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <InputField label="Admin Name" name="adminName" register={register} error={errors.adminName} placeholder="Full Name" />
                                            <div>
                                                <InputField label="Email Address" name="email" type="email" register={register} error={errors.email} placeholder="admin@group.com" disabled={isEditing} />
                                                {isEditing && (
                                                    <p className="text-xs text-amber-500 dark:text-amber-400 mt-1 ml-1">
                                                        Email cannot be changed after registration.
                                                    </p>
                                                )}
                                            </div>
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
                                        <FileUpload
                                            label="Profile Picture"
                                            onChange={(e) => handleFileChange(e, setProfilePic, setProfilePicPreview)}
                                            previewUrl={profilePicPreview}
                                            onRemove={() => { setProfilePic(null); setProfilePicPreview(null); }}
                                        />
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
                                            <LocationSelector
                                                control={control}
                                                setValue={setValue}
                                                watch={watch}
                                                errors={errors}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2">
                                                <InputField label="Street Address" name="address" register={register} error={errors.address} placeholder="123 Corporate Way" />
                                            </div>
                                            <InputField label="Pincode/Zip" name="pincode" register={register} error={errors.pincode} placeholder="Postal Code" />
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
                                                <span>{isEditing ? 'Updating...' : 'Creating Organization...'}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>{isEditing ? 'Update Organization' : 'Create Organization'}</span>
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

const SuccessToast = ({ password }: { password: string }) => (
    <div className='space-y-2'>
        <p className='font-bold text-base'>Organization Created Successfully!</p>
        <div className='bg-white/10 p-3 rounded-lg border border-white/20'>
            <p className='text-xs opacity-80 mb-1'>Admin Password (Sent to Email):</p>
            <p className='font-mono text-lg tracking-wider font-bold select-all'>{password}</p>
        </div>
        <p className='text-xs opacity-70'>Please copy this password now.</p>
    </div>
);
