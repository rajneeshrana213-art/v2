import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { useEffect, useState } from "react";
import client from "@/lib/api/client";
import {
    User,
    ChevronLeft,
    Mail,
    Phone,
    Calendar,
    ShieldCheck,
    Lock,
    Eye,
    EyeOff,
    BookOpen,
    School,
    Award
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Loader } from "@/components/ui/feedback/Loader";

export default function TeacherProfilePage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await client.get("/v1/dashboard/teacher");
                setData(res.data?.personalInfo);
            } catch (error) {
                console.error("Failed to fetch teacher profile", error);
                toast.error("Failed to load profile data");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (passwordForm.newPassword.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        try {
            setIsUpdatingPassword(true);
            // Assuming the common change-password endpoint works for all roles
            await client.post("/v1/auth/change-password", {
                oldPassword: passwordForm.oldPassword,
                newPassword: passwordForm.newPassword,
            });
            toast.success("Password updated successfully");
            setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to update password");
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    return (
        <>
            <Head>
                <title>Teacher Profile - LearnXChain</title>
            </Head>
            <DashboardLayout role="teacher">
                <div className="space-y-8 pb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/teacher">
                            <button className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Teacher Profile</h1>
                            <p className="text-sm text-gray-500">View and manage your professional records.</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex h-40 items-center justify-center">
                            <Loader size="lg" />
                        </div>
                    ) : (
                        <div className="grid gap-8 lg:grid-cols-3">
                            {/* Profile Card */}
                            <div className="lg:col-span-1 space-y-6">
                                <div className="rounded-[40px] border border-gray-100 bg-white p-8 text-center dark:border-white/5 dark:bg-gray-900 shadow-xl shadow-gray-100/50 dark:shadow-none">
                                    <div className="relative mx-auto h-32 w-32 mb-6">
                                        <div className="h-full w-full rounded-[32px] bg-indigo-50 flex items-center justify-center overflow-hidden dark:bg-indigo-900/20 border-4 border-white dark:border-gray-800">
                                            {data?.profilePic ? (
                                                <img src={data.profilePic} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <User className="h-12 w-12 text-indigo-400" />
                                            )}
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 p-2 bg-indigo-600 rounded-xl border-4 border-white dark:border-gray-900 shadow-lg">
                                            <Award className="h-4 w-4 text-white" />
                                        </div>
                                    </div>
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">{data?.name}</h2>
                                    <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Official Teacher Profile</p>

                                    <div className="mt-8 grid grid-cols-1 gap-4 border-t border-gray-50 dark:border-white/5 pt-8">
                                        <div className="flex flex-wrap gap-2 justify-center">
                                            {data?.subjects?.map((subject: string, idx: number) => (
                                                <span key={idx} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-tight dark:bg-indigo-950/30 dark:text-indigo-400">
                                                    {subject}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Details */}
                                <div className="rounded-[40px] border border-gray-100 bg-white p-8 dark:border-white/5 dark:bg-gray-900 shadow-sm">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        Contact Information
                                    </h3>
                                    <div className="space-y-6">
                                        <ProfileItem icon={Mail} label="Professional Email" value={data?.email || "N/A"} />
                                        <ProfileItem icon={Phone} label="Direct Contact" value={data?.phone || "N/A"} />
                                        <ProfileItem icon={School} label="Current School" value={data?.school || "LearnXChain Academy"} />
                                    </div>
                                </div>
                            </div>

                            {/* Records & Security */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="rounded-[40px] border border-gray-100 bg-white p-8 dark:border-white/5 dark:bg-gray-900 shadow-sm">
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-8 border-b border-gray-50 dark:border-white/5 pb-4">
                                        Professional Record
                                    </h3>
                                    <div className="grid gap-y-8 sm:grid-cols-2">
                                        <div className="space-y-6">
                                            <ProfileDetail label="Date of Joining" value={data?.dateOfJoin ? format(new Date(data.dateOfJoin), "MMMM d, yyyy") : "N/A"} icon={Calendar} />
                                            <ProfileDetail label="Employment Type" value="FULL-TIME" icon={ShieldCheck} />
                                        </div>
                                        <div className="space-y-6">
                                            <ProfileDetail label="Teacher Status" value="ACTIVE" icon={Award} color="text-emerald-500" />
                                            <ProfileDetail label="Primary Subject" value={data?.subjects?.[0] || "N/A"} icon={BookOpen} />
                                        </div>
                                    </div>
                                </div>

                                {/* Security Change Password */}
                                <div className="rounded-[40px] border border-gray-100 bg-white p-8 dark:border-white/5 dark:bg-gray-900 shadow-sm">
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-8">Account Security</h3>
                                    <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Current Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showOldPassword ? "text" : "password"}
                                                    name="oldPassword"
                                                    value={passwordForm.oldPassword}
                                                    onChange={handlePasswordChange}
                                                    className="w-full rounded-2xl bg-gray-50 py-3 pl-4 pr-12 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-white/5 dark:text-white"
                                                    required
                                                />
                                                <button type="button" onClick={() => setShowOldPassword(!showOldPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                                    {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">New Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showNewPassword ? "text" : "password"}
                                                    name="newPassword"
                                                    value={passwordForm.newPassword}
                                                    onChange={handlePasswordChange}
                                                    className="w-full rounded-2xl bg-gray-50 py-3 pl-4 pr-12 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-white/5 dark:text-white"
                                                    required
                                                />
                                                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Confirm New Password</label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={passwordForm.confirmPassword}
                                                onChange={handlePasswordChange}
                                                className="w-full rounded-2xl bg-gray-50 py-3 px-4 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-white/5 dark:text-white"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isUpdatingPassword}
                                            className="w-full mt-2 rounded-2xl bg-indigo-600 py-4 text-[10px] font-black uppercase tracking-widest text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {isUpdatingPassword ? (
                                                <>
                                                    <Loader size="sm" variant="white" />
                                                    Processing...
                                                </>
                                            ) : "Update Security Settings"}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </>
    );
}

function ProfileItem({ icon: Icon, label, value }: any) {
    return (
        <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-2xl bg-gray-50 flex items-center justify-center dark:bg-gray-800">
                <Icon className="h-5 w-5 text-gray-400" />
            </div>
            <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
        </div>
    );
}

function ProfileDetail({ label, value, icon: Icon, color }: any) {
    return (
        <div className="flex items-start gap-4">
            <div className="p-3 bg-gray-50 rounded-2xl dark:bg-gray-800">
                <Icon className="h-6 w-6 text-gray-400" />
            </div>
            <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-0.5">{label}</p>
                <p className={`text-base font-black ${color || "text-gray-900 dark:text-white"}`}>{value}</p>
            </div>
        </div>
    );
}
