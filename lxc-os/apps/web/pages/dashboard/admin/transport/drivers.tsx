import { useEffect, useState } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/forms/input";
import client from "@/lib/api/client";
import { AlertCircle, Bus, Mail, Phone, Plus, Trash2, Upload, User, Search, UserCheck } from "lucide-react";
import { Loader } from "@/components/ui/feedback/Loader";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/context/AuthContext";

interface DriverUser {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface Driver {
  id: string;
  license: string;
  schoolId: string;
  busId: string;
  profilePhoto?: string | null;
  licensePhoto?: string | null;
  user: DriverUser;
  bus?: {
    id: string;
    busNumber: string;
  } | null;
  createdAt: string;
}

interface BusItem {
  id: string;
  busNumber: string;
}

function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [buses, setBuses] = useState<BusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    license: "",
    schoolId: user?.schoolId || "",
    busId: "",
  });
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [driversRes, busesRes] = await Promise.all([
        client.get("/v1/transport/drivers"),
        client.get("/v1/transport/buses"),
      ]);
      setDrivers(driversRes.data);
      setBuses((busesRes.data || []).map((b: any) => ({ id: b.id, busNumber: b.busNumber })));
    } catch (err) {
      console.error("Failed to load drivers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (user?.schoolId) {
      setFormData(prev => ({ ...prev, schoolId: user.schoolId }));
    }
  }, [user?.schoolId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseFile) {
      alert("License photo is required");
      return;
    }
    if (!formData.busId) {
      alert("Please assign a bus");
      return;
    }
    setIsProcessing(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) fd.append(key, value);
      });
      if (user?.schoolId) fd.set("schoolId", user.schoolId);

      if (profileFile) fd.append("profilePic", profileFile);
      fd.append("licensePhoto", licenseFile);

      await client.post("/v1/transport/drivers/register", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setIsAddModalOpen(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      console.error("Create driver failed:", err);
      alert(err.response?.data?.error || "Failed to create driver");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      license: "",
      schoolId: user?.schoolId || "",
      busId: "",
    });
    setProfileFile(null);
    setLicenseFile(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this driver? This will also delete their login account.")) return;
    try {
      await client.delete(`/v1/transport/drivers/${id}`);
      setDrivers((prev) => prev.filter((d) => d.id !== id));
    } catch (err: any) {
      console.error("Delete driver failed:", err);
      alert(err.response?.data?.error || "Failed to delete driver");
    }
  };

  const filteredDrivers = drivers.filter((d) => {
    const q = searchQuery.toLowerCase();
    return (
      d.user.name.toLowerCase().includes(q) ||
      d.user.email.toLowerCase().includes(q) ||
      d.license.toLowerCase().includes(q) ||
      (d.bus?.busNumber || "").toLowerCase().includes(q)
    );
  });

  const columns: ColumnDef<Driver>[] = [
    {
      key: "user",
      header: "Driver",
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
            {row.profilePhoto ? (
              <img src={row.profilePhoto} className="h-full w-full rounded-2xl object-cover" alt="" />
            ) : (
              <User className="h-5 w-5" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {row.user.name}
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              LIC: {row.license}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact Intelligence",
      render: (_, row) => (
        <div className="space-y-1 text-xs font-medium">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <Phone className="h-3 w-3 text-emerald-500" />
            <span>{row.user.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <Mail className="h-3 w-3 text-indigo-500" />
            <span>{row.user.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: "bus",
      header: "Active Assignment",
      render: (_, row) =>
        row.bus ? (
          <Badge tone="warning" variant="soft" className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold">
            <Bus className="h-3 w-3" />
            {row.bus.busNumber}
          </Badge>
        ) : (
          <span className="text-[11px] font-medium text-gray-400 italic">No vehicle assigned</span>
        ),
    },
    {
      key: "actions",
      header: "",
      render: (_, row) => (
        <div className="flex justify-end pr-4">
          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400"
            onClick={() => handleDelete(row.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Head>
        <title>Transport Personnel - LearnXChain</title>
      </Head>
      <DashboardLayout role="admin">
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                Transport Personnel
              </h1>
              <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                Register and manage skilled drivers for your fleet.
              </p>
            </div>
            <Button
              className="flex items-center gap-2 rounded-[1.5rem] bg-indigo-600 px-6 py-6 text-sm font-bold text-white shadow-xl transition-all hover:scale-105 active:scale-95"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="h-5 w-5" />
              Register Driver
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            <Card className="rounded-[2.5rem] border-none bg-white p-6 shadow-xl shadow-gray-200/50 dark:bg-slate-900 dark:shadow-none">
              <CardContent className="p-0 flex flex-col items-center">
                <div className="mb-4 h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center dark:bg-indigo-900/30">
                  <UserCheck className="h-6 w-6 text-indigo-600" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Total Staff</p>
                <p className="text-3xl font-black text-gray-900 dark:text-white">{drivers.length}</p>
              </CardContent>
            </Card>
            {/* Additional quick stats can go here */}
          </div>

          <Card className="overflow-hidden rounded-[2.5rem] border-none bg-white/60 shadow-2xl shadow-gray-200/50 backdrop-blur-xl dark:bg-slate-950/40 dark:shadow-none">
            <CardHeader className="border-b border-gray-100 p-8 dark:border-white/5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative flex-1 max-w-md">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Search className="h-5 w-5" />
                  </div>
                  <Input
                    placeholder="Search by name, license, contact..."
                    className="h-14 rounded-2xl bg-gray-50/50 border-none pl-12 pr-6 text-sm font-medium focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex h-64 items-center justify-center">
                  <Loader size="xl" variant="primary" />
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={filteredDrivers}
                  className="border-none bg-transparent"
                  emptyState={
                    <div className="flex flex-col items-center gap-4 py-20 text-center text-gray-500">
                      <div className="h-20 w-20 rounded-[2rem] bg-gray-50 flex items-center justify-center dark:bg-white/5">
                        <User className="h-10 w-10 text-gray-300" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">No Personnel Registered</p>
                        <p className="text-sm font-medium">Add drivers to assign them to school vehicles.</p>
                      </div>
                    </div>
                  }
                />
              )}
            </CardContent>
          </Card>

          <AnimatePresence>
            {isAddModalOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsAddModalOpen(false)}
                  className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="relative w-full max-w-2xl overflow-hidden rounded-[3rem] border border-white/20 bg-white p-10 shadow-2xl dark:bg-slate-950"
                >
                  <div className="mb-8 flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                        Personnel Registration
                      </h3>
                      <p className="text-sm font-medium text-gray-500">
                        Create a secure driver profile and login credentials.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsAddModalOpen(false)}
                      className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-50 text-gray-400 hover:bg-gray-100 dark:bg-white/5"
                    >
                      <AlertCircle className="h-5 w-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Input
                        label="Full Name"
                        required
                        placeholder="Driver Name"
                        value={formData.name}
                        onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                      />
                      <Input
                        label="Mobile Number"
                        required
                        placeholder="+91 XXXXX XXXXX"
                        value={formData.phone}
                        onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                      />
                      <Input
                        label="Email Identity"
                        type="email"
                        required
                        placeholder="driver@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                      />
                      <Input
                        label="Home Address"
                        required
                        placeholder="Street, City, Pincode"
                        value={formData.address}
                        onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                      />
                      <Input
                        label="License Number"
                        required
                        placeholder="DL-XXXXXXXXXXXX"
                        value={formData.license}
                        onChange={(e) => setFormData((p) => ({ ...p, license: e.target.value }))}
                      />
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Assign Vehicle</label>
                        <select
                          className="h-14 w-full rounded-2xl border-none bg-gray-50/50 px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900/50 dark:text-white"
                          value={formData.busId}
                          onChange={(e) => setFormData((p) => ({ ...p, busId: e.target.value }))}
                          required
                        >
                          <option value="">Choose a bus</option>
                          {buses.map((b) => (
                            <option key={b.id} value={b.id}>{b.busNumber}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Profile Scan</label>
                        <label className="flex h-14 cursor-pointer items-center justify-between rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 px-6 text-xs font-bold text-gray-500 hover:bg-gray-100 dark:border-white/10 dark:bg-slate-900/50">
                          <span className="flex items-center gap-2">
                            <Upload className="h-4 w-4" />
                            {profileFile ? profileFile.name : "Passport Size Photo"}
                          </span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => setProfileFile(e.target.files?.[0] || null)} />
                        </label>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">License Verification</label>
                        <label className="flex h-14 cursor-pointer items-center justify-between rounded-2xl border-2 border-dashed border-emerald-500/30 bg-emerald-50/50 px-6 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/5 dark:text-emerald-400">
                          <span className="flex items-center gap-2">
                            <Upload className="h-4 w-4" />
                            {licenseFile ? licenseFile.name : "License Copy (Image)"}
                          </span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => setLicenseFile(e.target.files?.[0] || null)} />
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isProcessing}
                        onClick={() => setIsAddModalOpen(false)}
                        className="flex-1 rounded-2xl py-6 font-bold"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isProcessing}
                        className="flex-1 rounded-2xl bg-indigo-600 py-6 font-bold text-white shadow-lg"
                      >
                        {isProcessing ? <Loader size="sm" variant="white" /> : "Finalize Registration"}
                      </Button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </DashboardLayout>
    </>
  );
}

export default dynamic(() => Promise.resolve(DriversPage), { ssr: false });
