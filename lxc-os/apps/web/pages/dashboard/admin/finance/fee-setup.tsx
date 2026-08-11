import { useState, useMemo, useEffect } from "react";
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, ListChecks, Users, Plus, Save, Trash2, Edit2, Search, CheckCircle2, MoreVertical, Calendar, Settings2, AlertCircle, Info, ClipboardList, CreditCard, Building2, ArrowRight, Library, ArrowLeft } from 'lucide-react';
import client from "@/lib/api/client";
import { useAuth } from "@/lib/context/AuthContext";
import Link from "next/link";
import StudentSearchPicker from "@/components/dashboard/shared/StudentSearchPicker";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader } from "@/components/ui/feedback/Loader";



const GlassCard = ({ children, className = "", ...props }: any) => (
  <Card
    className={`overflow-hidden border-white/20 bg-white/70 shadow-xl backdrop-blur-xl transition-all duration-300 hover:shadow-2xl dark:border-white/10 dark:bg-slate-900/70 ${className}`}
    {...props}
  >
    {children}
  </Card>
);



type FeeHead = {
  id: string;
  name: string;
  description?: string | null;
  revenueAccountId: string;
  revenueAccount: { name: string; code: string };
  priority: number;
  isActive: boolean;
  type?: "RECURRING" | "ONE_TIME";
  frequency?: "MONTHLY" | "QUARTERLY" | "HALF_YEARLY" | "YEARLY" | "CUSTOM";
  isMandatory?: boolean;
  isConcessionEligible?: boolean;
};

type Account = {
  id: string;
  name: string;
  code: string;
  type: string;
};

type FeeStructure = {
  id: string;
  name: string;
  description?: string | null;
  academicYearId: string;
  classId?: string | null;
  isActive: boolean;
  class?: { name: string };
  feeHeadAmounts?: { amount: number; feeHeadId: string }[];
};

type AcademicYear = {
  id: string;
  year: string;
  isActive: boolean;
};

type SchoolClass = {
  id: string;
  name: string;
  Section?: { id: string; name: string }[];
};



export default function AdminFinanceFeeSetupPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();


  const { data: academicYears = [] } = useQuery({
    queryKey: ["academic-years", user?.schoolId],
    queryFn: async () => {
      const res = await client.get("/v1/admin/settings/academic-years");
      const data = res?.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.years)) return data.years;
      return [];
    },
    enabled: !!user?.schoolId
  });

  const activeYear = useMemo(() =>
    academicYears.find((y: AcademicYear) => y.isActive) || academicYears[0],
    [academicYears]);

  const [academicYearId, setAcademicYearId] = useState<string>("");
  const [activeTab, setActiveTab] = useState("session");


  useEffect(() => {
    if (activeYear?.id && !academicYearId) {
      setAcademicYearId(activeYear.id);
    }
  }, [activeYear, academicYearId]);

  const { data: accounts = [] } = useQuery({
    queryKey: ["revenue-accounts", user?.schoolId, academicYearId],
    queryFn: async () => {
      if (!academicYearId) return [];
      const res = await client.get<Account[]>("/v1/finance/accounts", {
        params: { academicYearId }
      });
      return res.data || [];
    },
    enabled: !!user?.schoolId && !!academicYearId
  });

  return (
    <>
      <Head>
        <title>Fee Setup – Admin | LearnXChain</title>
      </Head>
      <DashboardLayout role="admin">
        <div className="space-y-8 pb-20">
          <Link
            href="/dashboard/admin/finance"
            className="group inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Finance Dashboard
          </Link>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-white/80 to-blue-50/80 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-indigo-600 shadow-sm backdrop-blur-md dark:border-indigo-900/30 dark:from-indigo-950/40 dark:via-slate-900/40 dark:to-blue-950/40 dark:text-indigo-300">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500"></span>
                </span>
                Finance Engine Core
              </div>
              <div>
                <h1 className="bg-gradient-to-br from-gray-900 via-gray-700 to-gray-500 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent dark:from-white dark:via-gray-300 dark:to-gray-500 md:text-4xl">
                  Fee Setup & Configuration
                </h1>
                <p className="mt-2 max-w-2xl text-sm font-medium text-gray-500 dark:text-gray-400">
                  Architect your school's financial structure. Define custom fee heads, yearly groups,
                  and automate student assignments with the high-performance finance engine.
                </p>
              </div>
            </div>


          </div>

          <div className="w-full">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <div className="flex items-center justify-between">
                <TabsList className="grid h-12 w-full max-w-2xl grid-cols-4 gap-2 rounded-2xl bg-gray-100/80 p-1.5 backdrop-blur-sm dark:bg-slate-900/60">
                  <TabsTrigger value="session" className="rounded-xl px-4 py-2 text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">
                    1. Session Info
                  </TabsTrigger>
                  <TabsTrigger value="heads" className="rounded-xl px-4 py-2 text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">
                    2. Fee Heads
                  </TabsTrigger>
                  <TabsTrigger value="structure" className="rounded-xl px-4 py-2 text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">
                    3. Fee Structure
                  </TabsTrigger>
                  <TabsTrigger value="assignment" className="rounded-xl px-4 py-2 text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">
                    4. Assignment
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="session">
                <div className="grid gap-6 md:grid-cols-2">
                  <SessionInfoCard academicYear={activeYear} />
                  <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/30 p-8 text-center dark:border-indigo-900/30 dark:bg-indigo-950/10">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50">
                      <Calendar className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Step 1: Confirm Session</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Start by ensuring you are working in the correct academic session.
                      Changes made in the following steps will be applied to this session.
                    </p>
                    <div className="mt-6">
                      <button
                        onClick={() => setActiveTab("heads")}
                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500"
                      >
                        Proceed to Fee Heads
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="heads">
                <FeeHeadsPanel academicYearId={academicYearId} accounts={accounts} setActiveTab={setActiveTab} />
              </TabsContent>

              <TabsContent value="structure">
                <ClassWiseStructurePanel academicYearId={academicYearId} accounts={accounts} setActiveTab={setActiveTab} />
              </TabsContent>

              <TabsContent value="assignment">
                <StudentAssignmentPanel academicYearId={academicYearId} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}



function SessionInfoCard({ academicYear }: { academicYear: AcademicYear | undefined }) {
  if (!academicYear) return null;

  return (
    <GlassCard className="border-indigo-100 ring-1 ring-indigo-500/5 dark:border-indigo-900/30">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 p-2 text-white shadow-lg shadow-indigo-500/20">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-base font-bold">Session Information</CardTitle>
            <CardDescription className="text-xs font-medium">Active academic timeframe</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl bg-gray-50/50 p-4 dark:bg-gray-950/50">
            <span className="text-sm font-medium text-gray-500">Academic Year</span>
            <Badge variant="soft" tone="info" className="px-3 py-1 font-black">
              {academicYear.year}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-100 p-4 dark:border-white/5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</p>
              <div className="mt-1 flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${academicYear.isActive ? "bg-emerald-500" : "bg-gray-300"}`} />
                <span className="text-sm font-bold">{academicYear.isActive ? "Processing Live" : "Inactive"}</span>
              </div>
            </div>
            <div className="rounded-xl border border-gray-100 p-4 dark:border-white/5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Engine Version</p>
              <div className="mt-1 flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-indigo-500" />
                <span className="text-sm font-bold text-indigo-600">V2.0 Core</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </GlassCard>
  );
}


function ClassWiseStructurePanel({ academicYearId, accounts, setActiveTab }: { academicYearId: string, accounts: Account[], setActiveTab: (tab: string) => void }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [classId, setClassId] = useState("");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: classes = [] } = useQuery({
    queryKey: ["classes", user?.schoolId],
    queryFn: async () => {
      const res = await client.get("/v1/dashboard/admin/classes");
      return res.data || [];
    },
    enabled: !!user?.schoolId
  });

  const { data: heads = [] } = useQuery({
    queryKey: ["fee-heads"],
    queryFn: async () => {
      const res = await client.get<FeeHead[]>("/v1/finance/fee-heads");
      return res.data || [];
    }
  });

  const { data: existingStructures = [], isLoading: loadingStructures } = useQuery({
    queryKey: ["fee-structures", user?.schoolId, academicYearId, classId],
    queryFn: async () => {
      if (!classId) return [];
      const res = await client.get<FeeStructure[]>("/v1/finance/fee-groups", {
        params: {
          schoolId: user!.schoolId,
          academicYearId,
          classId: classId === "all" ? undefined : classId,
        },
      });
      return res.data || [];
    },
    enabled: !!user?.schoolId && !!academicYearId && !!classId
  });

  const activeStructure = existingStructures[0];

  const { data: structureHeads = [], isLoading: loadingStructureHeads } = useQuery({
    queryKey: ["fee-group-heads", activeStructure?.id],
    queryFn: async () => {
      if (!activeStructure?.id) return [];
      const res = await client.get<{ feeHeadId: string; amount: number }[]>(
        `/v1/finance/fee-groups/${activeStructure.id}/heads`
      );
      return res.data?.map(h => ({ feeHeadId: h.feeHeadId, amount: h.amount })) || [];
    },
    enabled: !!activeStructure?.id
  });

  const [localHeads, setLocalHeads] = useState<{ feeHeadId: string; amount: number }[]>([]);

  useEffect(() => {
    if (structureHeads.length > 0) {
      setLocalHeads(structureHeads);
    } else {
      setLocalHeads([]);
    }
  }, [structureHeads]);

  const createMutation = useMutation({
    mutationFn: async (newData: any) => {
      const res = await client.post<FeeStructure>("/v1/finance/fee-groups", newData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fee-structures"] });
      toast.success("Structure initialized for class");
    }
  });

  const saveHeadsMutation = useMutation({
    mutationFn: async (payload: any) => {
      await client.post(`/v1/finance/fee-groups/${activeStructure.id}/heads`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fee-structures"] });
      queryClient.invalidateQueries({ queryKey: ["fee-group-heads", activeStructure.id] });
      toast.success("Class fee amounts updated");
    }
  });

  const handleInitialize = () => {
    if (!classId) return;
    const className = classes.find((c: any) => c.id === classId)?.name;
    createMutation.mutate({
      schoolId: user!.schoolId,
      academicYearId,
      name: `Standard Fee - ${className}`,
      classId,
    });
  };

  const updateAmount = (headId: string, amount: number) => {
    setLocalHeads(prev => {
      const exists = prev.find(h => h.feeHeadId === headId);
      if (exists) return prev.map(h => (h.feeHeadId === headId ? { ...h, amount } : h));
      return [...prev, { feeHeadId: headId, amount }];
    });
  };

  const removeHead = (headId: string) => {
    setLocalHeads(prev => prev.filter(h => h.feeHeadId !== headId));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <GlassCard className="border-indigo-100 h-fit ring-1 ring-indigo-500/5 dark:border-indigo-900/30">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 p-2 text-white shadow-lg shadow-indigo-500/20">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">Class Selection</CardTitle>
              <CardDescription className="text-xs font-medium">Select a class to configure its fees</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 h-72">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">Target Class</Label>
            <Select value={classId} onValueChange={setClassId}>
              <SelectTrigger className="h-12 rounded-xl border-gray-200 bg-white dark:border-white/10 dark:bg-gray-950">
                <SelectValue placeholder="Select Class">
                  {classes.find((c: any) => c.id === classId)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {classes.map((c: any) => (
                  <SelectItem key={c.id} value={c.id} className="font-bold">{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {classId && !activeStructure && !loadingStructures && (
            <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/50 p-6 text-center dark:border-amber-900/30 dark:bg-amber-950/20">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                No fee structure found for this class in current session.
              </p>
              <button
                onClick={handleInitialize}
                disabled={createMutation.isPending}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-amber-500/20 hover:bg-amber-500"
              >
                {createMutation.isPending ? <Loader size="sm" variant="white" /> : <Plus className="h-4 w-4" />}
                Initialize Class Structure
              </button>
            </div>
          )}

          {activeStructure && (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-6 dark:bg-emerald-950/10">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-emerald-900 dark:text-emerald-100">{activeStructure.name}</h4>
                  <p className="text-[10px] font-bold uppercase tracking-tighter text-emerald-600">Structure Active</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Total Amount</p>
                    <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                      ₹{localHeads.reduce((sum, h) => sum + h.amount, 0).toLocaleString()}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="rounded-lg p-2 hover:bg-white/50 dark:hover:bg-gray-800 transition-all">
                        <MoreVertical className="h-5 w-5 text-gray-400" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 backdrop-blur-xl">
                      <DropdownMenuItem onClick={() => setShowEditDialog(true)} className="flex cursor-pointer items-center p-2 text-sm font-medium">
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit Properties
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setShowDeleteDialog(true)}
                        className="flex cursor-pointer items-center p-2 text-sm font-medium text-rose-600 focus:text-rose-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Structure
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <EditFeeStructureDialog
                    structure={activeStructure}
                    open={showEditDialog}
                    onOpenChange={setShowEditDialog}
                  />
                  <DeleteFeeStructureDialog
                    structure={activeStructure}
                    open={showDeleteDialog}
                    onOpenChange={setShowDeleteDialog}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </GlassCard>

      <GlassCard className="border-indigo-100 ring-1 ring-indigo-500/5 dark:border-indigo-900/30">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 p-2 text-white shadow-lg shadow-indigo-500/20">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">Fee Heads & Amounts</CardTitle>
              <CardDescription className="text-xs font-medium">Define amounts for this class</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!classId ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[32px] bg-indigo-50/50 text-indigo-400 dark:bg-indigo-950/20">
                <ArrowRight className="h-10 w-10 -rotate-45 opacity-40" />
              </div>
              <h3 className="text-base font-black text-gray-900 dark:text-gray-100">Step 3A: Select Class</h3>
              <p className="mt-2 max-w-[240px] text-xs font-medium leading-relaxed text-gray-400">
                Pick a target class from the list on the left to begin setup.
              </p>
            </div>
          ) : !activeStructure ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[32px] bg-amber-50/50 text-amber-400 dark:bg-amber-950/20">
                <Layers className="h-10 w-10 opacity-40" />
              </div>
              <h3 className="text-base font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Setup Required</h3>
              <p className="mt-2 text-xs font-medium leading-relaxed text-gray-400">
                This class doesn't have a fee structure yet.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="group relative flex flex-col gap-3 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/30 via-white to-white p-5 transition-all hover:bg-white dark:border-indigo-900/40 dark:from-indigo-950/10 dark:via-gray-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
                      <Plus className="h-4 w-4" />
                    </div>
                    <Label className="text-[11px] font-black uppercase tracking-widest text-indigo-600">Quick Add Fee Head</Label>
                  </div>
                  <div className="flex h-5 items-center gap-1.5 rounded-full bg-indigo-50 px-2 text-[9px] font-black text-indigo-400 dark:bg-indigo-950/30">
                    <Info className="h-3 w-3" />
                    SELECT CATEGORY
                  </div>
                </div>
                <Select
                  value=""
                  onValueChange={(v) => {
                    if (v) updateAmount(v, 0);
                  }}
                >
                  <SelectTrigger className="h-12 border-indigo-100 bg-white/80 font-black text-indigo-600 shadow-sm transition-all focus:ring-2 focus:ring-indigo-500/20 dark:border-indigo-900/40 dark:bg-gray-950">
                    <SelectValue placeholder="Begin typing or select a head..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 z-[9999] backdrop-blur-2xl">
                    {heads.filter(h => !localHeads.find(lh => lh.feeHeadId === h.id)).length === 0 ? (
                      <div className="py-6 text-center text-[10px] font-bold text-gray-400">All available heads already added.</div>
                    ) : (
                      heads
                        .filter(h => !localHeads.find(lh => lh.feeHeadId === h.id))
                        .map(h => (
                          <SelectItem key={h.id} value={h.id} className="cursor-pointer font-bold">
                            {h.name}
                          </SelectItem>
                        ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between px-1 mb-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Mapped Fee Categories ({localHeads.length})</Label>
                  {localHeads.length > 0 && (
                    <span className="text-[10px] font-bold text-indigo-500 uppercase">Interactive List</span>
                  )}
                </div>

                <div className="max-h-[380px] space-y-2.5 overflow-y-auto pr-1 thin-scrollbar">
                  {localHeads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-100 bg-gray-50/30 py-12 dark:border-white/5 dark:bg-gray-900/30">
                      <CreditCard className="mb-3 h-8 w-8 text-gray-200" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">No components added</p>
                    </div>
                  ) : localHeads.map((lh, index) => {
                    const headInfo = heads.find(h => h.id === lh.feeHeadId);
                    return (
                      <div
                        key={lh.feeHeadId}
                        style={{ animationDelay: `${index * 50}ms` }}
                        className="animate-in fade-in slide-in-from-right-4 group flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md dark:border-white/5 dark:bg-gray-900/50 dark:hover:border-indigo-900/50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-950/40">
                            <CreditCard className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900 dark:text-gray-100 tracking-tight">{headInfo?.name || "Unknown Head"}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[9px] font-black uppercase tracking-tighter text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 rounded">
                                {headInfo?.revenueAccount?.code || "LEDGER"}
                              </span>
                              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter truncate max-w-[120px]">
                                {headInfo?.revenueAccount?.name}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-indigo-400">₹</span>
                            <Input
                              type="number"
                              value={lh.amount}
                              onChange={(e) => updateAmount(lh.feeHeadId, parseFloat(e.target.value) || 0)}
                              className="h-10 w-28 rounded-xl border-gray-100 bg-gray-50 pl-8 text-right text-sm font-black text-gray-900 transition-all hover:bg-white focus:bg-white focus:ring-indigo-500/20 dark:border-white/5 dark:bg-gray-950 dark:text-gray-100"
                            />
                          </div>
                          <button
                            onClick={() => removeHead(lh.feeHeadId)}
                            className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-300 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <div className="mt-8 flex items-center justify-between border-t p-6 dark:border-white/10">
          <div className="flex gap-3">
            {activeStructure && (
              <button
                onClick={() => saveHeadsMutation.mutate(localHeads)}
                disabled={saveHeadsMutation.isPending || loadingStructureHeads}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-6 text-xs font-black uppercase tracking-tighter text-indigo-600 shadow-sm border border-indigo-100 transition-all hover:bg-indigo-50 active:scale-95 disabled:opacity-50"
              >
                {saveHeadsMutation.isPending ? <Loader size="sm" variant="white" /> : <Save className="h-3 w-3" />}
                Save Changes
              </button>
            )}
          </div>
          <button
            onClick={() => setActiveTab("assignment")}
            className="flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-6 text-xs font-black uppercase tracking-tighter text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/40 active:scale-95"
          >
            Review & Deploy Assignments
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </GlassCard>
    </div>
  );
}





function FeeHeadsPanel({ accounts, academicYearId, setActiveTab }: { accounts: Account[], academicYearId: string, setActiveTab: (tab: string) => void }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [revenueAccountId, setRevenueAccountId] = useState("");
  const [priority, setPriority] = useState("0");
  const [type, setType] = useState<"RECURRING" | "ONE_TIME">("RECURRING");
  const [frequency, setFrequency] = useState<string>("MONTHLY");
  const [isMandatory, setIsMandatory] = useState(true);
  const [isConcessionEligible, setIsConcessionEligible] = useState(true);


  const { data: heads = [], isLoading: loading } = useQuery({
    queryKey: ["fee-heads"],
    queryFn: async () => {
      const res = await client.get<FeeHead[]>("/v1/finance/fee-heads");
      return res.data || [];
    }
  });


  const createMutation = useMutation({
    mutationFn: async (newData: any) => {
      const res = await client.post<FeeHead>("/v1/finance/fee-heads", newData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fee-heads"] });
      toast.success("Fee head registered");
      setName("");
      setDescription("");
      setRevenueAccountId("");
      setPriority("0");
      setType("RECURRING");
      setFrequency("MONTHLY");
      setIsMandatory(true);
      setIsConcessionEligible(true);
    },
    onError: (err: any) => toast.error(err?.response?.data?.error || "Registration failed")
  });


  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await client.delete(`/v1/finance/fee-heads`, { params: { id } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fee-heads"] });
      toast.success("Fee head removed successfully");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || "Failed to remove fee head");
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !revenueAccountId) return;
    createMutation.mutate({
      schoolId: user!.schoolId,
      name: name.trim(),
      description: description.trim() || undefined,
      revenueAccountId,
      priority: parseInt(priority) || 0,
      type,
      frequency: type === "RECURRING" ? frequency : "YEARLY", // ONE_TIME is essentially yearly/single
      isMandatory,
      isConcessionEligible,
    });
  };

  return (
    <GlassCard className="border-emerald-100 ring-1 ring-emerald-500/5 dark:border-emerald-900/30">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-2 text-white shadow-lg shadow-emerald-500/20">
            <ListChecks className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-base font-bold">Fee Heads</CardTitle>
            <CardDescription className="text-xs font-medium">Core financial categories</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleCreate} className="space-y-3 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/20 p-4 transition-all focus-within:border-emerald-400 dark:border-emerald-800/30 dark:bg-emerald-950/10">
          <div className="grid gap-3">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Head Name</Label>
              <Input
                placeholder="e.g. Tuition Fee"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 border-emerald-100 bg-white/80 placeholder:text-gray-300 dark:border-emerald-900/30 dark:bg-gray-900/80"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Revenue Account mapping</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Select value={revenueAccountId} onValueChange={setRevenueAccountId}>
                    <SelectTrigger className="h-10 border-emerald-100 bg-white/80 dark:border-emerald-900/30 dark:bg-gray-900/80">
                      <SelectValue placeholder="Select Account">
                        {accounts.find(a => a.id === revenueAccountId)?.name}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="backdrop-blur-xl">
                      {accounts.length === 0 ? (
                        <SelectItem value="none" disabled className="text-xs font-bold text-gray-400">
                          No accounts found for this year
                        </SelectItem>
                      ) : accounts.map((acc: Account) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          <span className="font-black text-emerald-600 mr-2">{acc.code}</span>
                          <span className="text-gray-500 font-medium dark:text-gray-400">{acc.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <ManageAccountsDialog academicYearId={academicYearId} accounts={accounts} />
                <CreateAccountDialog academicYearId={academicYearId} onAccountCreated={(id) => setRevenueAccountId(id)} />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Settlement Priority (0 = Highest)</Label>
              <Input
                type="number"
                min="0"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="h-10 border-emerald-100 bg-white/80 dark:border-emerald-900/30 dark:bg-gray-900/80"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Billing Type</Label>
                <Select value={type} onValueChange={(v: any) => setType(v)}>
                  <SelectTrigger className="h-10 border-emerald-100 bg-white/80 dark:border-emerald-900/30 dark:bg-gray-900/80">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RECURRING">Recurring</SelectItem>
                    <SelectItem value="ONE_TIME">One Time (Admission)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {type === "RECURRING" && (
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Frequency</Label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger className="h-10 border-emerald-100 bg-white/80 dark:border-emerald-900/30 dark:bg-gray-900/80">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                      <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                      <SelectItem value="HALF_YEARLY">Half Yearly</SelectItem>
                      <SelectItem value="YEARLY">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-4 px-1 py-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={isMandatory}
                  onChange={e => setIsMandatory(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-[10px] font-bold text-gray-500 uppercase group-hover:text-emerald-600">Mandatory</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={isConcessionEligible}
                  onChange={e => setIsConcessionEligible(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-[10px] font-bold text-gray-500 uppercase group-hover:text-emerald-600">Concession Eligible</span>
              </label>
            </div>
          </div>
          <button
            type="submit"
            disabled={createMutation.isPending || !name || !revenueAccountId}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500 hover:shadow-emerald-600/40 disabled:opacity-60"
          >
            {createMutation.isPending ? <Loader size="sm" variant="white" /> : <Plus className="h-4 w-4" />}
            Register Fee Head
          </button>
        </form>

        <div className="max-h-[400px] overflow-y-auto rounded-xl border border-emerald-100 bg-white/50 shadow-inner dark:border-white/5 dark:bg-gray-950/50">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader size="sm" variant="white" />
            </div>
          ) : heads.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="mb-2 rounded-full bg-emerald-50 p-3 dark:bg-emerald-950/30">
                <AlertCircle className="h-6 w-6 text-emerald-200" />
              </div>
              <p className="text-xs font-medium text-gray-400">No fee heads defined yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-white/5">
              {heads.map((head: FeeHead) => (
                <div
                  key={head.id}
                  className="group flex items-center justify-between p-3.5 transition-all hover:bg-emerald-50/40 dark:hover:bg-emerald-900/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                      <ListChecks className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{head.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-black text-[10px] text-emerald-500">
                          {head.revenueAccount?.code || accounts.find(a => a.id === head.revenueAccountId)?.code || "N/A"}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-gray-200" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                          {head.revenueAccount?.name || accounts.find(a => a.id === head.revenueAccountId)?.name || "Missing Account"}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-gray-200" />
                        <span className="h-1 w-1 rounded-full bg-gray-200" />
                        <span className="text-[10px] font-bold text-indigo-500 uppercase">
                          Priority: {head.priority}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-gray-200" />
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${head.type === "ONE_TIME" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                          {head.type || "RECURRING"}
                        </span>
                        {head.type === "RECURRING" && (
                          <span className="text-[9px] font-bold text-gray-400 ml-1">
                            ({head.frequency})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <EditFeeHeadDialog head={head} accounts={accounts} />
                    <DeleteFeeHeadDialog
                      head={head}
                      onDelete={(id) => deleteMutation.mutate(id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t pt-6 dark:border-white/10">
          <button
            onClick={() => setActiveTab("structure")}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all active:scale-95"
          >
            Confirm Heads & Set Amounts
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </CardContent>
    </GlassCard>
  );
}


function StudentAssignmentPanel({ academicYearId }: { academicYearId: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedStructureId, setSelectedStructureId] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);


  const { data: structures = [] } = useQuery({
    queryKey: ["fee-structures", user?.schoolId, academicYearId],
    queryFn: async () => {
      const res = await client.get<FeeStructure[]>("/v1/finance/fee-groups", {
        params: { schoolId: user?.schoolId, academicYearId },
      });
      return res.data || [];
    },
    enabled: !!user?.schoolId && !!academicYearId
  });


  const assignMutation = useMutation({
    mutationFn: async (payload: any) => {
      await client.post("/v1/finance/student-fee-plans", payload);
    },
    onSuccess: () => {
      toast.success("Fee plan assigned to student");
      setSelectedStudent(null);
      setSelectedStructureId("");
    },
    onError: (err: any) => toast.error(err?.response?.data?.error || "Assignment failed")
  });

  const handleAssign = () => {
    if (!selectedStudent || !selectedStructureId) return;
    assignMutation.mutate({
      schoolId: user!.schoolId,
      academicYearId,
      studentId: selectedStudent.id,
      feeStructureId: selectedStructureId,
    });
  };

  return (
    <GlassCard className="border-amber-100 ring-1 ring-amber-500/5 dark:border-amber-900/30">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-2 text-white shadow-lg shadow-amber-500/20">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-base font-bold">Student Assignment</CardTitle>
            <CardDescription className="text-xs font-medium">Map fee plans to students</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2 dark:border-white/10">
            <Label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Individual Assignment</Label>
            <BulkAssignClassDialog structures={structures} academicYearId={academicYearId} />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">Target Student</Label>
            <StudentSearchPicker onSelect={setSelectedStudent} className="w-full" />
            {selectedStudent && (
              <div className="flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 shadow-sm dark:border-indigo-900/30 dark:bg-indigo-950/30">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm dark:bg-gray-900">
                  <CheckCircle2 className="h-5 w-5 text-indigo-500" />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900 dark:text-gray-100">{selectedStudent.user?.name}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Roll: {selectedStudent.rollNo || "N/A"}</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">Academic Fee Plan</Label>
            <Select value={selectedStructureId} onValueChange={setSelectedStructureId}>
              <SelectTrigger className="h-12 rounded-xl bg-white/80 dark:bg-gray-900/80">
                <SelectValue placeholder="Choose structure to apply...">
                  {structures.find((s: any) => s.id === selectedStructureId)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="backdrop-blur-xl">
                {structures.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-400">No active structures</div>
                ) : structures.map((s: FeeStructure) => (
                  <SelectItem key={s.id} value={s.id}>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-indigo-600">{s.name}</span>
                      <Badge variant="outline" className="h-4 border-gray-200 text-[9px] font-black uppercase text-gray-400">
                        {s.feeHeadAmounts?.length || 0} heads
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <button
            onClick={handleAssign}
            disabled={assignMutation.isPending || !selectedStudent || !selectedStructureId}
            className={`group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-4 py-3.5 text-sm font-black transition-all shadow-lg ${assignMutation.isSuccess
              ? "bg-emerald-600 text-white shadow-emerald-500/20"
              : "bg-indigo-600 text-white shadow-indigo-500/20 hover:bg-indigo-500 hover:shadow-indigo-500/40 disabled:opacity-60 disabled:shadow-none"
              }`}
          >
            {assignMutation.isPending ? (
              <Loader size="sm" variant="white" />
            ) : assignMutation.isSuccess ? (
              <CheckCircle2 className="h-5 w-5 animate-bounce" />
            ) : (
              <>
                <Users className="h-5 w-5 transition-transform group-hover:scale-110" />
                <span>Finalize Assignment</span>
              </>
            )}
            {assignMutation.isSuccess && "Assignment Success"}
          </button>
        </div>

        <div className="rounded-xl bg-gray-50/80 p-4 text-center dark:bg-gray-900/50">
          <p className="text-[10px] font-black text-gray-400 leading-relaxed uppercase tracking-widest">
            <span className="text-indigo-500 mr-2">Pro Tip:</span> Use
            <span className="mx-2 text-gray-700 dark:text-gray-200 underline">Bulk Assign</span> for mass mapping via class or section.
          </p>
        </div>
      </CardContent>
    </GlassCard>
  );
}


function BulkAssignClassDialog({ structures, academicYearId }: { structures: FeeStructure[]; academicYearId: string; }) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ classId: "", sectionId: "", feeStructureId: "" });

  const { data: classes = [] } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const res = await client.get("/v1/dashboard/admin/classes");
      return res.data || [];
    },
    enabled: isOpen
  });

  const selectedClass = classes.find((c: any) => c.id === formData.classId);


  const bulkMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await client.post("/v1/finance/student-fee-plans/bulk", payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Bulk mapping complete");
      setIsOpen(false);
      setFormData({ classId: "", sectionId: "", feeStructureId: "" });
    },
    onError: () => toast.error("Bulk assignment failed")
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-tighter text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400">
          <Layers className="h-3.5 w-3.5" />
          Section Assignment
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md backdrop-blur-2xl">
        <DialogHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40">
            <Layers className="h-6 w-6" />
          </div>
          <DialogTitle className="text-xl font-black">Mass Assignment</DialogTitle>
          <DialogDescription className="text-xs font-medium">
            Map a fee structure to all students in a class or specific section.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Target Class</Label>
              <Select value={formData.classId} onValueChange={(v) => setFormData({ ...formData, classId: v, sectionId: "" })}>
                <SelectTrigger className="h-11 rounded-xl bg-white focus:ring-indigo-500 dark:bg-gray-950">
                  <SelectValue placeholder="Choose class">
                    {classes.find((c: any) => c.id === formData.classId)?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c: any) => (
                    <SelectItem key={c.id} value={c.id} className="font-bold">{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Specific Section</Label>
              <Select
                value={formData.sectionId}
                onValueChange={(v) => setFormData({ ...formData, sectionId: v })}
              >
                <SelectTrigger disabled={!formData.classId || !selectedClass?.Section?.length} className="h-11 rounded-xl bg-white dark:bg-gray-950">
                  <SelectValue placeholder={selectedClass?.Section?.length ? "All Sections" : "N/A"}>
                    {selectedClass?.Section?.find((s: any) => s.id === formData.sectionId)?.name || (formData.classId && !formData.sectionId ? "All Sections" : "")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="" className="font-bold">All Sections</SelectItem>
                  {selectedClass?.Section?.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Assigned Plan</Label>
            <Select value={formData.feeStructureId} onValueChange={(v) => setFormData({ ...formData, feeStructureId: v })}>
              <SelectTrigger className="h-12 rounded-xl bg-white font-bold text-indigo-600 focus:ring-indigo-500 dark:bg-gray-950">
                <SelectValue placeholder="Select plan to deploy...">
                  {structures.find((s: any) => s.id === formData.feeStructureId)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {structures.map((s: FeeStructure) => (
                  <SelectItem key={s.id} value={s.id} className="font-black text-indigo-600">{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <button
            onClick={() => bulkMutation.mutate({ academicYearId, ...formData })}
            disabled={bulkMutation.isPending || !formData.classId || !formData.feeStructureId}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-black text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 disabled:opacity-50"
          >
            {bulkMutation.isPending ? <Loader size="sm" variant="white" /> : <CheckCircle2 className="h-5 w-5" />}
            Confirm & Map Students
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


function EditFeeHeadDialog({ head, accounts }: { head: FeeHead, accounts: Account[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: head.name,
    revenueAccountId: head.revenueAccountId || (head.revenueAccount as any)?.id || "",
    isActive: head.isActive,
    priority: (head.priority || 0).toString()
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      await client.put(`/v1/finance/fee-heads?id=${head.id}`, {
        ...data,
        priority: parseInt(data.priority) || 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fee-heads"] });
      toast.success("Head updated");
      setIsOpen(false);
    },
    onError: (err: any) => toast.error(err?.response?.data?.error || "Update failed")
  });


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="rounded-lg p-2 text-gray-400 hover:bg-white hover:text-indigo-600 hover:shadow-sm dark:hover:bg-gray-800 transition-all">
          <Edit2 className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle>Edit Fee Head</DialogTitle>
          <DialogDescription>Modify settings for {head.name}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-1">
            <Label>Name</Label>
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Revenue Account Mapping</Label>
            <Select value={formData.revenueAccountId} onValueChange={(v) => setFormData({ ...formData, revenueAccountId: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select Account">
                  {accounts.find(a => a.id === formData.revenueAccountId)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {accounts.length === 0 ? (
                  <SelectItem value="none" disabled>No accounts found</SelectItem>
                ) : accounts.map((acc: Account) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    <span className="font-bold">{acc.code}</span> - {acc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Settlement Priority (0 = Highest)</Label>
            <Input
              type="number"
              min="0"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg dark:bg-gray-900/50">
            <input
              type="checkbox"
              className="h-5 w-5 rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              id="fh-active-edit"
            />
            <Label htmlFor="fh-active-edit" className="cursor-pointer font-bold text-sm">Active Category</Label>
          </div>
        </div>
        <DialogFooter>
          <button
            onClick={() => updateMutation.mutate(formData)}
            disabled={updateMutation.isPending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-500"
          >
            {updateMutation.isPending && <Loader size="sm" variant="white" />}
            Save Changes
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


function EditFeeStructureDialog({ structure, open, onOpenChange }: { structure: any, open: boolean, onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: structure.name,
    description: structure.description || "",
    isActive: structure.isActive
  });

  useEffect(() => {
    if (open) {
      setFormData({
        name: structure.name,
        description: structure.description || "",
        isActive: structure.isActive
      });
    }
  }, [open, structure]);

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      await client.put(`/v1/finance/fee-groups?id=${structure.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fee-structures"] });
      toast.success("Structure updated");
      onOpenChange(false);
    },
    onError: () => toast.error("Update failed")
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle>Edit Fee Structure</DialogTitle>
          <DialogDescription>Update high-level details for {structure.name}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-1">
            <Label>Structure Name</Label>
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>
          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg dark:bg-gray-900/50">
            <input
              type="checkbox"
              className="h-5 w-5 rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              id="fs-active-edit"
            />
            <Label htmlFor="fs-active-edit" className="cursor-pointer font-bold text-sm">Status: {formData.isActive ? "Active" : "Inactive"}</Label>
          </div>
        </div>
        <DialogFooter>
          <button
            onClick={() => updateMutation.mutate(formData)}
            disabled={updateMutation.isPending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-500"
          >
            {updateMutation.isPending && <Loader size="sm" variant="white" />}
            Update Structure
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteFeeStructureDialog({ structure, open, onOpenChange }: { structure: any, open: boolean, onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await client.delete(`/v1/finance/fee-groups?id=${structure.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fee-structures"] });
      toast.success("Structure deleted successfully");
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || "Deletion failed. Ensure no students assigned.");
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md backdrop-blur-2xl">
        <DialogHeader>
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-900/20">
            <Trash2 className="h-8 w-8" />
          </div>
          <DialogTitle className="text-xl font-black text-gray-900 dark:text-gray-100">Delete Fee Structure</DialogTitle>
          <DialogDescription className="pt-2 text-sm font-medium leading-relaxed text-gray-500 dark:text-gray-400">
            Are you sure you want to delete <span className="font-black text-rose-600">"{structure.name}"</span>?
            <br /><br />
            <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3 text-[11px] font-bold text-rose-700 dark:border-rose-900/30 dark:bg-rose-950/30">
              <span className="uppercase tracking-widest text-rose-800">Warning:</span> You can only delete structures that have no students assigned to them.
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 gap-3">
          <button
            onClick={() => onOpenChange(false)}
            className="flex-1 rounded-xl bg-gray-100 px-4 py-3 text-xs font-bold text-gray-600 transition-all hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            className="flex-1 rounded-xl bg-rose-600 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-rose-500/20 transition-all hover:bg-rose-500"
          >
            {deleteMutation.isPending ? <Loader size="sm" variant="white" /> : "Confirm Delete"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


function BulkDemandDialog({ academicYearId }: { academicYearId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [needsInit, setNeedsInit] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1 + "");
  const [year, setYear] = useState(new Date().getFullYear() + "");
  const { user } = useAuth();
  const handleGenerate = async () => {
    try {
      setLoading(true);
      const res = await client.post("/v1/finance/demand/generate", {
        academicYearId,
        month,
        year,
      });
      toast.success(res.data.message || "Demand posted successfully");
      setIsOpen(false);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || "Demand generation failed";
      toast.error(errorMsg);
      if (errorMsg.includes("STUDENT_RECEIVABLE") || errorMsg.includes("initialize chart")) {
        setNeedsInit(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInit = async () => {
    try {
      setInitializing(true);
      await client.post("/v1/finance/accounts/init", { academicYearId, schoolId: user?.schoolId });
      toast.success("Chart of accounts initialized!");
      setNeedsInit(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Initialization failed");
    } finally {
      setInitializing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => { setIsOpen(v); if (!v) setNeedsInit(false); }}>
      <DialogTrigger asChild>
        <button
          disabled={!academicYearId}
          className="rounded-xl bg-indigo-50 px-4 py-2 text-xs font-black uppercase tracking-tighter text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all dark:bg-indigo-500/10 disabled:opacity-50"
        >
          Post Monthly Dues
        </button>
      </DialogTrigger>
      <DialogContent className="backdrop-blur-2xl">
        <DialogHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40">
            <Calendar className="h-6 w-6" />
          </div>
          <DialogTitle className="text-xl font-black">Monthly Demand Posting</DialogTitle>
          <DialogDescription className="text-xs font-medium">
            This will record fee requirements in the ledger for ALL active students with assigned plans.
          </DialogDescription>
        </DialogHeader>

        {needsInit ? (
          <div className="my-6 rounded-xl border border-amber-100 bg-amber-50/50 p-4 dark:border-amber-900/30 dark:bg-amber-950/20">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <div className="space-y-2">
                <p className="text-xs font-bold text-amber-800 dark:text-amber-200">System Accounts Missing</p>
                <p className="text-[10px] leading-relaxed text-amber-700 dark:text-amber-400">
                  The finance module requires primary system accounts (Receivables, Advance, Cash) to be initialized for this session before posting dues.
                </p>
                <button
                  onClick={handleInit}
                  disabled={initializing}
                  className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-3 py-1.5 text-[10px] font-bold text-white shadow-sm hover:bg-amber-500 disabled:opacity-50"
                >
                  {initializing ? <Loader size="sm" /> : <Settings2 className="h-3 w-3" />}
                  Initialize System Accounts
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 py-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Target Month</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-gray-950">
                  <SelectValue>
                    {new Date(0, parseInt(month) - 1).toLocaleString('default', { month: 'long' })}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {[...Array(12)].map((_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {new Date(0, i).toLocaleString('default', { month: 'long' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Target Year</Label>
              <Input value={year} onChange={(e) => setYear(e.target.value)} type="number" className="h-11 rounded-xl bg-white dark:bg-gray-950" />
            </div>
          </div>
        )}

        <DialogFooter>
          {!needsInit && (
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-black text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500"
            >
              {loading ? <Loader size="sm" /> : <Layers className="h-5 w-5" />}
              Confirm & Post Dues
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateAccountDialog({ academicYearId, onAccountCreated }: { academicYearId: string, onAccountCreated?: (id: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ code: "", name: "" });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await client.post("/v1/finance/accounts", {
        ...data,
        schoolId: user?.schoolId,
        academicYearId,
        type: "INCOME"
      });
      return res.data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["revenue-accounts"] });
      toast.success("Revenue account created");
      if (data?.id) onAccountCreated?.(data.id);
      setFormData({ code: "", name: "" });
      setIsOpen(false);
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shadow-sm transition-all hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/30">
          <Plus className="h-5 w-5" />
        </button>
      </DialogTrigger>
      <DialogContent className="backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle>New Revenue Account</DialogTitle>
          <DialogDescription>Create a new ledger account for fee heads.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-1">
            <Label>Account Code</Label>
            <Input
              placeholder="e.g. REV001"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            />
          </div>
          <div className="space-y-1">
            <Label>Account Name</Label>
            <Input
              placeholder="e.g. Tuition Revenue"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <button
            onClick={() => createMutation.mutate(formData)}
            disabled={createMutation.isPending || !formData.code || !formData.name}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-emerald-500 disabled:opacity-50"
          >
            {createMutation.isPending && <Loader size="sm" variant="white" />}
            Create Account
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


function ManageAccountsDialog({ academicYearId, accounts }: { academicYearId: string, accounts: Account[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-sm transition-all hover:bg-indigo-600 hover:text-white dark:bg-indigo-950/30">
          <Settings2 className="h-5 w-5" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl backdrop-blur-2xl">
        <DialogHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40">
            <Library className="h-6 w-6" />
          </div>
          <DialogTitle className="text-xl font-black">Manage Revenue Accounts</DialogTitle>
          <DialogDescription className="text-xs font-medium">
            Edit or remove ledger accounts used for fee collections.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[400px] overflow-y-auto space-y-2 py-4">
          {accounts.length === 0 ? (
            <div className="py-10 text-center text-xs font-bold text-gray-400">No accounts found.</div>
          ) : accounts.map((acc) => (
            <div key={acc.id} className="group flex items-center justify-between rounded-xl border border-gray-100 bg-white/50 p-3.5 transition-all hover:bg-white dark:border-white/5 dark:bg-gray-900/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30">
                  <span className="text-[10px] font-black uppercase">{acc.code.substring(0, 3)}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{acc.name}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">{acc.code}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <EditAccountDialog account={acc} />
                <DeleteAccountDialog account={acc} />
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EditAccountDialog({ account }: { account: Account }) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ code: account.code, name: account.name });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      await client.put(`/v1/finance/accounts?id=${account.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["revenue-accounts"] });
      toast.success("Account updated successfully");
      setIsOpen(false);
    },
    onError: (err: any) => toast.error(err?.response?.data?.error || "Update failed")
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="rounded-lg p-2 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/30 transition-colors">
          <Edit2 className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle>Edit Account</DialogTitle>
          <DialogDescription>Update details for {account.name}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-1">
            <Label>Account Code</Label>
            <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} />
          </div>
          <div className="space-y-1">
            <Label>Account Name</Label>
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <button
            onClick={() => updateMutation.mutate(formData)}
            disabled={updateMutation.isPending || !formData.code || !formData.name}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-indigo-500 disabled:opacity-50"
          >
            {updateMutation.isPending && <Loader size="sm" variant="white" />}
            Save Changes
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteAccountDialog({ account }: { account: Account }) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await client.delete(`/v1/finance/accounts?id=${account.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["revenue-accounts"] });
      toast.success("Account deleted successfully");
      setIsOpen(false);
    },
    onError: (err: any) => toast.error(err?.response?.data?.error || "Deletion failed")
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="rounded-lg p-2 text-gray-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 transition-colors">
          <Trash2 className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md backdrop-blur-2xl">
        <DialogHeader>
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-900/20">
            <Trash2 className="h-8 w-8" />
          </div>
          <DialogTitle className="text-xl font-black text-gray-900 dark:text-gray-100">Delete Account</DialogTitle>
          <DialogDescription className="pt-2 text-sm font-medium leading-relaxed text-gray-500 dark:text-gray-400">
            Are you sure you want to delete <span className="font-black text-rose-600">"{account.name} ({account.code})"</span>?
            <br /><br />
            <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3 text-[11px] font-bold text-rose-700 dark:border-rose-900/30 dark:bg-rose-950/30">
              <span className="uppercase tracking-widest text-rose-800">Note:</span> You cannot delete accounts that are currently assigned to fee heads.
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 gap-3">
          <button
            onClick={() => setIsOpen(false)}
            className="flex-1 rounded-xl bg-gray-100 px-4 py-3 text-xs font-bold text-gray-600 transition-all hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            className="flex-1 rounded-xl bg-rose-600 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-rose-500/20 transition-all hover:bg-rose-500"
          >
            {deleteMutation.isPending ? <Loader size="sm" variant="white" /> : "Confirm Delete"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteFeeHeadDialog({ head, onDelete }: { head: FeeHead, onDelete: (id: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="rounded-lg p-2 text-gray-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 transition-colors">
          <Trash2 className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md backdrop-blur-2xl">
        <DialogHeader>
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-900/20">
            <Trash2 className="h-8 w-8" />
          </div>
          <DialogTitle className="text-xl font-black text-gray-900 dark:text-gray-100">Confirm Deletion</DialogTitle>
          <DialogDescription className="pt-2 text-sm font-medium leading-relaxed text-gray-500 dark:text-gray-400">
            Are you sure you want to delete <span className="font-black text-rose-600">"{head.name}"</span>?
            <br /><br />
            <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3 text-[11px] font-bold text-rose-700 dark:border-rose-900/30 dark:bg-rose-950/30">
              <span className="uppercase tracking-widest text-rose-800">Warning:</span> This will remove the category from all existing class-wise fee structures AND actual student assignments.
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 gap-3">
          <button
            onClick={() => setIsOpen(false)}
            className="flex-1 rounded-xl bg-gray-100 px-4 py-3 text-xs font-bold text-gray-600 transition-all hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
          >
            Go Back
          </button>
          <button
            onClick={() => {
              onDelete(head.id);
              setIsOpen(false);
            }}
            className="flex-1 rounded-xl bg-rose-600 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-rose-500/20 transition-all hover:bg-rose-500"
          >
            Confirm Delete
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
