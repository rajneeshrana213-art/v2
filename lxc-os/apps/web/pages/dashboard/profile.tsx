import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Lock, Eye, EyeOff, ShieldCheck, UserCog, Mail, Building2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { useAuth } from "@/lib/context/AuthContext";
import client from "@/lib/api/client";
import { toast } from "react-toastify";
import { Loader } from "@/components/ui/feedback/Loader";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  const handlePasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    if (!passwordForm.oldPassword || !passwordForm.newPassword) {
      toast.error("Please fill all password fields");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    try {
      setIsUpdatingPassword(true);
      await client.post("/v1/auth/change-password", {
        userId: user.userId,
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });

      toast.success("Password updated successfully");
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      const message =
        error?.response?.data?.error ||
        error?.message ||
        "Failed to update password";
      toast.error(message);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const [username, setUsername] = useState((user as any)?.userName || "");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername((user as any).userName || "");
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdatingProfile(true);
      await client.post("/v1/auth/update-profile", { userName: username });
      toast.success("Username updated! Please re-login to see changes in all areas.");
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to update username");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  if (loading || !user) {
    return (
      <DashboardLayout role="admin">
        <div className="flex h-96 items-center justify-center">
          <Loader size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  const roleLabel = user.role?.charAt(0).toUpperCase() + user.role?.slice(1);

  return (
    <>
      <Head>
        <title>Profile - LearnXChain Dashboard</title>
      </Head>
      <DashboardLayout role={user.role as any}>
        <div className="space-y-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
                Profile
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage your personal information and secure your account.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {/* Basic Information */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4 dark:border-white/10 dark:bg-gray-900/60">
              <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                Basic information
              </h2>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Your name, email, and login identity.
              </p>
              <div className="mt-4 space-y-4 text-sm">
                <div>
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                    <UserCog className="h-3 w-3" />
                    <span>Full Name</span>
                  </div>
                  <div className="mt-1 text-gray-900 dark:text-gray-50">
                    {user.name || "—"}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                    <Mail className="h-3 w-3" />
                    <span>Email Address</span>
                  </div>
                  <div className="mt-1 text-gray-900 dark:text-gray-50">
                    {(user as any).email || "—"}
                  </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="pt-2 border-t border-gray-200 dark:border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                      <ShieldCheck className="h-3 w-3" />
                      <span>Username</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Set a username"
                      className="flex-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-900 dark:border-white/10 dark:bg-gray-900 dark:text-white"
                    />
                    <button
                      type="submit"
                      disabled={isUpdatingProfile || username === (user as any).userName}
                      className="rounded-lg bg-indigo-600 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {isUpdatingProfile ? "..." : "SET"}
                    </button>
                  </div>
                  <p className="mt-1 text-[10px] text-gray-400">Login with this instead of email</p>
                </form>

                <div>
                  <div className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Role
                  </div>
                  <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                    {roleLabel}
                  </div>
                </div>
              </div>
            </div>

            {/* Preferences / Account Summary */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4 dark:border-white/10 dark:bg-gray-900/60">
              <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                Account summary
              </h2>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Quick overview of how your account is configured.
              </p>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>Theme</span>
                  <span className="rounded-full bg-gray-900 px-2 py-0.5 text-xs text-white dark:bg-gray-100 dark:text-gray-900">
                    Managed from dashboard header
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Authentication</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                    <ShieldCheck className="h-3 w-3" />
                    Active session
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Notifications</span>
                  <span className="text-xs text-gray-600 dark:text-gray-300">
                    Managed by school admin
                  </span>
                </div>
              </div>
            </div>

            {/* Security: Update Password */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4 dark:border-white/10 dark:bg-gray-900/60">
              <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                Security
              </h2>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Update your password to keep your account secure.
              </p>
              <form onSubmit={handleUpdatePassword} className="mt-4 space-y-3 text-sm">
                <div className="space-y-1">
                  <label
                    htmlFor="oldPassword"
                    className="text-xs font-medium text-gray-700 dark:text-gray-300"
                  >
                    Current password
                  </label>
                  <div className="relative">
                    <input
                      id="oldPassword"
                      name="oldPassword"
                      type={showOldPassword ? "text" : "password"}
                      value={passwordForm.oldPassword}
                      onChange={handlePasswordChange}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-white/10 dark:bg-gray-900 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-900/40"
                      placeholder="Enter current password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword((v) => !v)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                    >
                      {showOldPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="newPassword"
                    className="text-xs font-medium text-gray-700 dark:text-gray-300"
                  >
                    New password
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-white/10 dark:bg-gray-900 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-900/40"
                      placeholder="At least 8 characters"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((v) => !v)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="confirmPassword"
                    className="text-xs font-medium text-gray-700 dark:text-gray-300"
                  >
                    Confirm new password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-white/10 dark:bg-gray-900 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-900/40"
                      placeholder="Re-enter new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
                >
                  <Lock className="h-4 w-4" />
                  {isUpdatingPassword ? "Updating..." : "Update password"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
