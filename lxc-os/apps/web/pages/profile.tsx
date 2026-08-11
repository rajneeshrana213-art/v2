import Head from 'next/head';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import Navbar from '@/components/home/navbar/Navbar';
import Footer from '@/components/home/footer/Footer';
import { useAuth } from '@/lib/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/forms/input';
import { User, Mail, Shield, Trash2, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import client from '@/lib/api/client';
import { toast } from 'react-toastify';

export default function ProfilePage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  const handleDeleteRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await client.post('/v1/user/delete-request', { reason });
      toast.success('Account deletion request submitted successfully.');
      setShowConfirm(false);
      setReason('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0B0E14]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>User Profile - LearnXChain</title>
        <meta name="description" content="View your profile and manage account settings." />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/50 to-white dark:from-[#0A0E14] dark:via-[#0F1419] dark:to-[#0A0E14]">
        <Navbar />

        <main className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px]" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px]" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-10">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 font-outfit">My Profile</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage your personal information and account security.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {/* User Overview Card */}
              <Card className="md:col-span-1 h-fit shadow-xl border-gray-200/50 dark:border-white/10">
                <CardContent className="pt-6 flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white p-1">
                      {user.profilePic ? (
                        <img src={user.profilePic} alt={user.name} className="h-full w-full rounded-full object-cover border-2 border-white dark:border-gray-800" />
                      ) : (
                        <User className="h-12 w-12" />
                      )}
                    </div>
                    <div className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-800" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{user.userName || `@${user.name.toLowerCase().replace(/\s+/g, '')}`}</p>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-xs font-semibold capitalize">
                    <Shield className="h-3 w-3" />
                    {user.role}
                  </div>
                </CardContent>
              </Card>

              {/* Account Details Card */}
              <div className="md:col-span-2 space-y-8">
                <Card className="shadow-xl border-gray-200/50 dark:border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                       <User className="h-4 w-4 text-indigo-500" />
                       Personal Information
                    </CardTitle>
                    <CardDescription>Basic details associated with your account.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Full Name</p>
                      <p className="text-sm text-gray-900 dark:text-white font-medium">{user.name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email Address</p>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <p className="text-sm text-gray-900 dark:text-white font-medium">{user.email}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Account Role</p>
                      <p className="text-sm text-gray-900 dark:text-white font-medium capitalize">{user.role}</p>
                    </div>
                    {user.schoolName && (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Institution</p>
                        <p className="text-sm text-gray-900 dark:text-white font-medium">{user.schoolName}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Account Actions / Danger Zone */}
                <Card accent="rose" className="shadow-xl border-red-100 dark:border-red-900/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <AlertTriangle className="h-4 w-4" />
                      Danger Zone
                    </CardTitle>
                    <CardDescription>Actions that are permanent or require administrative review.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30">
                      <div>
                        <h4 className="text-sm font-bold text-red-900 dark:text-red-300">Request Account Deletion</h4>
                        <p className="text-xs text-red-700 dark:text-red-400/80 mt-1">This will notify administrators to delete all your data permanently.</p>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="px-6 shadow-lg shadow-red-500/20"
                        onClick={() => setShowConfirm(true)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                        Request Deletion
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        </main>

        <Footer />

        {/* Confirmation Modal */}
        <AnimatePresence>
          {showConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowConfirm(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-[2rem] p-8 shadow-2xl border border-gray-200 dark:border-white/10"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400 mb-6">
                    <AlertTriangle className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Are you absolutely sure?</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                    Account deletion is permanent. All your schools, records, and data will be lost forever. 
                    Administrators will review your request before final deletion.
                  </p>

                  <form onSubmit={handleDeleteRequest} className="w-full space-y-6">
                    <Input 
                      label="Reason for deletion (Optional)" 
                      placeholder="Tell us why you're leaving..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                    <div className="flex flex-col gap-3">
                      <Button 
                        type="submit" 
                        variant="destructive" 
                        className="w-full py-6 text-base font-bold"
                        loading={isSubmitting}
                      >
                        Confirm Request
                      </Button>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        className="w-full"
                        onClick={() => setShowConfirm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
