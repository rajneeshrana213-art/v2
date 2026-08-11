import { useState, useEffect } from 'react';
import Head from 'next/head';
import DashboardLayout from '@/components/dashboard/layout/DashboardLayout';
import { useApi } from '@/hooks/useApi';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { ArrowLeft, ArrowRight, User, MapPin, Briefcase, FileText, Upload, X, CheckCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import Loader from '@/components/ui/feedback/Loader';
import { decodeId } from "@/lib/utils/hashId";

const steps = [
    { id: 1, title: 'Personal Info', icon: User },
    { id: 2, title: 'Address Info', icon: MapPin },
    { id: 3, title: 'Employment Info', icon: Briefcase },
    { id: 4, title: 'Documents', icon: FileText },
];

export default function EditEmployeePage() {
    const router = useRouter();
    const { id: rawId } = router.query;
    const id = rawId ? decodeId(rawId as string) : undefined;
    const { get, put, loading } = useApi();
    const [currentStep, setCurrentStep] = useState(1);
    const [initialLoading, setInitialLoading] = useState(true);

    // Form State
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        gender: 'MALE',
        bloodType: '',

        address: '',
        city: '',
        state: '',
        country: 'India',
        pincode: '',

        employeeType: 'SUPPORT',
        company: 'LearnXChain',
    });

    const [profilePic, setProfilePic] = useState<File | null>(null);
    const [documents, setDocuments] = useState<File[]>([]);
    const [profilePreview, setProfilePreview] = useState<string | null>(null);
    const [existingDocuments, setExistingDocuments] = useState<any[]>([]);

    useEffect(() => {
        if (id) {
            fetchEmployeeDetails();
        }
    }, [id]);

    const fetchEmployeeDetails = async () => {
        try {
            const data: any = await get(`/v1/superadmin/employees/${id}`);
            if (data) {
                setFormData({
                    fullName: data.user.name,
                    email: data.user.email,
                    phone: data.user.phone,
                    gender: data.user.sex,
                    bloodType: data.user.bloodType || '',

                    address: data.user.address,
                    city: data.user.city,
                    state: data.user.state,
                    country: data.user.country,
                    pincode: data.user.pincode,

                    employeeType: data.employeeType,
                    company: data.company,
                });
                setProfilePreview(data.user.profilePic);
                setExistingDocuments(data.documents || []);
            }
        } catch (error) {
            toast.error('Failed to fetch employee details');
        } finally {
            setInitialLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 2 * 1024 * 1024) {
                toast.error('File size must be less than 2MB');
                return;
            }
            setProfilePic(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDocumentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setDocuments(prev => [...prev, ...files]);
        }
    };

    const removeDocument = (index: number) => {
        setDocuments(prev => prev.filter((_, i) => i !== index));
    };

    const validateStep = (step: number) => {
        if (step === 1) {
            if (!formData.fullName || !formData.email || !formData.phone) {
                toast.error('Please fill in all required fields');
                return false;
            }
        } else if (step === 2) {
            if (!formData.address || !formData.city || !formData.state || !formData.pincode) {
                toast.error('Please fill in all required fields');
                return false;
            }
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, steps.length));
        }
    };

    const handlePrev = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        toast.dismiss();
        const data = new FormData();

        Object.keys(formData).forEach(key => {
            const value = (formData as any)[key];
            if (value !== '' && value !== null && value !== undefined) {
                data.append(key, value);
            }
        });

        if (profilePic) {
            data.append('profilePic', profilePic);
        }

        documents.forEach((doc) => {
            data.append('documents', doc);
        });

        try {
            await put(`/v1/superadmin/employees/${id}`, data);
            toast.success('Employee updated successfully');
            router.push('/dashboard/superadmin/employees');
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Failed to update employee');
        }
    };

    if (initialLoading) {
        return (
            <DashboardLayout role="superadmin">
                <div className="flex h-[80vh] items-center justify-center">
                    <Loader className="" />
                </div>
            </DashboardLayout>
        );
    }


    return (
        <DashboardLayout role="superadmin">
            <Head>
                <title>Edit Employee - LearnXChain</title>
            </Head>

            <div className="mx-auto max-w-4xl space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Employee</h1>
                    <p className="text-gray-500 dark:text-gray-400">Update employee profile details</p>
                </div>

                {/* Stepper */}
                <div className="relative flex items-center justify-between rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-900">
                    <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-gray-200 dark:bg-gray-700" />
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = step.id === currentStep;
                        const isCompleted = step.id < currentStep;

                        return (
                            <div key={step.id} className="relative z-10 flex flex-col items-center gap-2 bg-white px-2 dark:bg-gray-900">
                                <div className={clsx(
                                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                                    isActive ? "border-indigo-600 bg-indigo-600 text-white" :
                                        isCompleted ? "border-indigo-600 bg-white text-indigo-600 dark:bg-gray-900" :
                                            "border-gray-300 bg-white text-gray-400 dark:border-gray-600 dark:bg-gray-900"
                                )}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <span className={clsx(
                                    "text-xs font-medium",
                                    isActive ? "text-indigo-600 dark:text-indigo-400" :
                                        isCompleted ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500"
                                )}>{step.title}</span>
                            </div>
                        )
                    })}
                </div>

                {/* Form Content */}
                <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-gray-900">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3>

                                    {/* Profile Pic */}
                                    <div className="flex items-center gap-6">
                                        <div className="relative h-24 w-24 overflow-hidden rounded-full border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                                            {profilePreview ? (
                                                <img src={profilePreview} alt="Preview" className="h-full w-full object-cover" />
                                            ) : (
                                                <User className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 text-gray-400" />
                                            )}
                                        </div>
                                        <div>
                                            <input
                                                type="file"
                                                id="profilePic"
                                                className="hidden"
                                                accept="image/png, image/jpeg"
                                                onChange={handleProfilePicChange}
                                            />
                                            <label
                                                htmlFor="profilePic"
                                                className="cursor-pointer rounded-lg bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400"
                                            >
                                                Change Photo
                                            </label>
                                            <p className="mt-2 text-xs text-gray-500">Supported formats: JPG, PNG (Max 2MB)</p>
                                        </div>
                                    </div>

                                    <div className="grid gap-6 sm:grid-cols-2">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name *</label>
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleInputChange}
                                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address *</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number *</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800"
                                                placeholder="+91 98765 43210"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
                                            <select
                                                name="gender"
                                                value={formData.gender}
                                                onChange={handleInputChange}
                                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800"
                                            >
                                                <option value="MALE">Male</option>
                                                <option value="FEMALE">Female</option>
                                                <option value="OTHERS">Others</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Blood Type</label>
                                            <select
                                                name="bloodType"
                                                value={formData.bloodType}
                                                onChange={handleInputChange}
                                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800"
                                            >
                                                <option value="">Select Blood Type</option>
                                                <option value="A+">A+</option>
                                                <option value="A-">A-</option>
                                                <option value="B+">B+</option>
                                                <option value="B-">B-</option>
                                                <option value="O+">O+</option>
                                                <option value="O-">O-</option>
                                                <option value="AB+">AB+</option>
                                                <option value="AB-">AB-</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Address Information</h3>
                                    <div className="grid gap-6">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Address *</label>
                                            <input
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800"
                                                placeholder="123 Main St, Apartment 4B"
                                            />
                                        </div>
                                        <div className="grid gap-6 sm:grid-cols-2">
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">City *</label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleInputChange}
                                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">State *</label>
                                                <input
                                                    type="text"
                                                    name="state"
                                                    value={formData.state}
                                                    onChange={handleInputChange}
                                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Country *</label>
                                                <input
                                                    type="text"
                                                    name="country"
                                                    value={formData.country}
                                                    readOnly
                                                    className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-4 py-2.5 text-gray-500 outline-none dark:border-gray-700 dark:bg-gray-800/50"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Pincode *</label>
                                                <input
                                                    type="text"
                                                    name="pincode"
                                                    value={formData.pincode}
                                                    onChange={handleInputChange}
                                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Employment Information</h3>
                                    <div className="grid gap-6 sm:grid-cols-2">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Employee Type / Designation</label>
                                            <select
                                                name="employeeType"
                                                value={formData.employeeType}
                                                onChange={handleInputChange}
                                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800"
                                            >
                                                <option value="SUPPORT"> SUPPORT</option>
                                                <option value="HR_MANAGER">HR MANAGER</option>
                                                <option value="ACCOUNTANT">ACCOUNTANT</option>
                                                <option value="SALES_MANAGER">SALES MANAGER</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Company</label>
                                            <input
                                                type="text"
                                                name="company"
                                                value={formData.company}
                                                readOnly
                                                className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-4 py-2.5 text-gray-500 outline-none dark:border-gray-700 dark:bg-gray-800/50"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 4 && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upload Documents</h3>

                                    {/* Existing Documents */}
                                    {existingDocuments.length > 0 && (
                                        <div className="mb-4">
                                            <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Existing Documents</h4>
                                            <div className="space-y-2">
                                                {existingDocuments.map((doc, idx) => (
                                                    <div key={idx} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-white/5">
                                                        <FileText className="h-4 w-4 text-indigo-500" />
                                                        <span className="text-sm text-gray-700 dark:text-gray-300">{doc.fileName}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-800">
                                        <input
                                            type="file"
                                            id="documents"
                                            multiple
                                            className="hidden"
                                            onChange={handleDocumentsChange}
                                        />
                                        <label htmlFor="documents" className="cursor-pointer">
                                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                            <p className="mt-4 text-sm font-medium text-gray-900 dark:text-white">Click to upload new documents</p>
                                            <p className="mt-2 text-xs text-gray-500">Resume, Contracts, ID Proofs etc.</p>
                                        </label>
                                    </div>

                                    {documents.length > 0 && (
                                        <div className="space-y-3">
                                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Selected Files</h4>
                                            {documents.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
                                                    <div className="flex items-center gap-3">
                                                        <FileText className="h-5 w-5 text-indigo-500" />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
                                                            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => removeDocument(index)}
                                                        className="rounded-full p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="mt-8 flex justify-between pt-6 border-t border-gray-100 dark:border-gray-800">
                        <button
                            onClick={handlePrev}
                            disabled={currentStep === 1}
                            className={clsx(
                                "flex items-center rounded-xl px-6 py-2.5 text-sm font-medium transition-all",
                                currentStep === 1
                                    ? "cursor-not-allowed text-gray-300 dark:text-gray-600"
                                    : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/5"
                            )}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </button>

                        {currentStep < steps.length ? (
                            <button
                                onClick={handleNext}
                                className="flex items-center rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-500 hover:shadow-indigo-500/25 active:scale-95"
                            >
                                Next Step
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex items-center rounded-xl bg-green-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-green-500 hover:shadow-green-500/25 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader className="" /> : <CheckCircle className="ml-2 h-4 w-4" />}
                                {loading ? 'Updating...' : 'Update Employee'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
