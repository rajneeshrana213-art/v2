import React, { useState, useEffect } from "react";
import { Search, Users, FileText, Download, CheckCircle2, School as SchoolIcon, Info } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/forms/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import client from "@/lib/api/client";
import { useAuth } from "@/lib/context/AuthContext";
import { cn } from "@/lib/utils";
import Loader from '@/components/ui/feedback/Loader';

export default function DocumentIssuer() {
    const { user } = useAuth();
    const isSuperAdmin = user?.role === "superadmin";

    const [templates, setTemplates] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [schools, setSchools] = useState<any[]>([]);

    const [selectedSchool, setSelectedSchool] = useState("");
    const [schoolSearch, setSchoolSearch] = useState("");
    const [selectedTemplate, setSelectedTemplate] = useState("");
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedStudent, setSelectedStudent] = useState("");

    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        if (isSuperAdmin) {
            fetchSchools();
        } else {
            fetchInitialData();
        }
    }, [isSuperAdmin]);

    useEffect(() => {
        if (selectedSchool) {
            fetchInitialData(selectedSchool);
        }
    }, [selectedSchool]);

    useEffect(() => {
        if (selectedClass && selectedClass !== "all") {
            fetchStudents(selectedClass);
        }
    }, [selectedClass]);

    const fetchSchools = async () => {
        try {
            setLoading(true);
            const res = await client.get("/v1/superadmin/schools?limit=1000");
            console.log("DocumentIssuer: Fetched schools response:", res.data);
            const fetchedSchools = res.data.data || [];
            console.log("DocumentIssuer: Schools array:", fetchedSchools);
            setSchools(fetchedSchools);
        } catch (err) {
            console.error("DocumentIssuer: Failed to load schools", err);
            toast.error("Failed to load schools");
        } finally {
            setLoading(false);
        }
    };

    const fetchInitialData = async (schoolId?: string) => {
        try {
            setLoading(true);
            const params = schoolId ? { schoolId } : {};
            const [templatesRes, classesRes] = await Promise.all([
                client.get("/v1/dashboard/admin/documents/templates", { params }),
                client.get("/v1/dashboard/admin/classes", { params })
            ]);
            setTemplates(templatesRes.data);
            setClasses(classesRes.data);

            // Reset dependent selects
            setSelectedTemplate("");
            setSelectedClass("");
            setSelectedStudent("");
            setStudents([]);
        } catch (err: any) {
            toast.error("Failed to load setup data");
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async (classId: string) => {
        try {
            const params = isSuperAdmin ? { classId, schoolId: selectedSchool, limit: 100 } : { classId, limit: 100 };
            const response = await client.get(`/v1/dashboard/admin/students`, { params });
            setStudents(response.data.data);
        } catch (err) {
            toast.error("Failed to load students");
        }
    };

    const handleGenerate = async () => {
        if (!selectedTemplate) return toast.error("Please select a template");
        if (!selectedStudent) return toast.error("Please select a student");

        try {
            setGenerating(true);
            const response = await client.post("/v1/dashboard/admin/documents/generate", {
                templateId: selectedTemplate,
                targetUserId: students.find(s => s.id === selectedStudent)?.user?.id || selectedStudent,
                schoolId: isSuperAdmin ? selectedSchool : undefined,
                data: {} // Custom data can be added here
            });

            toast.success("Document generated successfully!");
            window.open(response.data.pdfUrl, '_blank');
        } catch (err: any) {
            toast.error(err.message || "Generation failed");
        } finally {
            setGenerating(false);
        }
    };

    const filteredSchools = (schools || []).filter(s =>
        (s?.schoolName || "").toLowerCase().includes((schoolSearch || "").toLowerCase())
    );

    return (
        <div className="space-y-4 md:space-y-8 min-h-[600px]">
            {isSuperAdmin && (
                <Card className="border-none shadow-sm bg-indigo-50/30 dark:bg-indigo-900/10 backdrop-blur-sm border border-indigo-100/50 dark:border-indigo-800/20 !overflow-visible rounded-[1.5rem] md:rounded-[2.5rem]">
                    <CardHeader className="pb-4 p-4 md:p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div>
                                <CardTitle className="text-lg md:text-xl font-black uppercase tracking-tight flex items-center gap-2 dark:text-white">
                                    <SchoolIcon className="h-5 w-5 md:h-6 md:w-6 text-indigo-600 dark:text-indigo-400" />
                                    Select Target School
                                </CardTitle>
                                <CardDescription className="text-xs md:text-sm dark:text-gray-400 font-medium pt-1">Choose a school to issue documents for</CardDescription>
                            </div>
                            {selectedSchool && (
                                <Badge className="bg-indigo-600 text-white border-none px-3 py-1 rounded-full text-[9px] md:text-[10px] font-black tracking-widest uppercase w-fit">
                                    Active Context
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 pt-0">
                        <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                            <SelectTrigger className="w-full h-12 md:h-14 rounded-xl md:rounded-2xl border-indigo-100 dark:border-indigo-800/50 bg-white dark:bg-slate-950 text-sm md:text-base font-bold shadow-sm">
                                <SelectValue placeholder="Select a school to continue...">
                                    {schools.find(s => s.id === selectedSchool)?.schoolName}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-gray-200 dark:border-white/10 shadow-2xl max-h-[300px]">
                                {filteredSchools.length === 0 ? (
                                    <div className="py-8 text-center text-sm text-gray-500 font-medium">No schools found</div>
                                ) : (
                                    filteredSchools.map((school) => (
                                        <SelectItem
                                            key={school.id}
                                            value={school.id}
                                            className="rounded-xl py-3 px-4 focus:bg-indigo-50 dark:focus:bg-indigo-900/20 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-xs shrink-0">
                                                    {school.schoolName.charAt(0)}
                                                </div>
                                                <div className="flex flex-col text-left">
                                                    <span className="font-bold text-gray-900 dark:text-white capitalize leading-tight">{school.schoolName.toLowerCase()}</span>
                                                    <span className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">{school.city || "System"}</span>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>
            )}

            <div className={cn(
                "grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 transition-all duration-500",
                isSuperAdmin && !selectedSchool ? "opacity-30 pointer-events-none grayscale scale-[0.98]" : "opacity-100"
            )}>
                <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[1.5rem] md:rounded-[2rem] !overflow-visible group hover:shadow-2xl transition-all duration-300">
                    <CardHeader className="pb-4 pt-6 md:pt-8 px-5 md:px-8">
                        <CardTitle className="text-lg md:text-xl flex items-center gap-3 font-black uppercase tracking-tight dark:text-white">
                            <div className="h-10 w-10 rounded-xl md:rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                                <FileText className="h-5 w-5" />
                            </div>
                            1. Select Document
                        </CardTitle>
                        <CardDescription className="text-xs md:text-sm dark:text-gray-400">Choose the template you want to issue</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 px-5 md:px-8 pb-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em]">Document Template</label>
                            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                                <SelectTrigger className="h-11 md:h-12 rounded-xl md:rounded-2xl border-gray-200 dark:border-white/10 dark:bg-slate-950 shadow-sm text-sm">
                                    <SelectValue placeholder="Select a template...">
                                        {templates.find(t => t.id === selectedTemplate)?.name}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl dark:border-white/10 shadow-2xl">
                                    {templates.length === 0 ? (
                                        <div className="p-4 text-center text-sm text-gray-400">No templates available</div>
                                    ) : (
                                        templates.map(t => (
                                            <SelectItem key={t.id} value={t.id} className="rounded-xl">
                                                <div className="flex flex-col items-start py-1">
                                                    <span className="font-bold text-gray-900 dark:text-white text-sm">{t.name}</span>
                                                    <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">{t.type} - {t.category}</span>
                                                </div>
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedTemplate && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl md:rounded-2xl border border-indigo-100 dark:border-indigo-800/30"
                            >
                                <h4 className="text-[10px] font-black text-indigo-900 dark:text-indigo-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                    <CheckCircle2 className="h-3 w-3" /> Template Confirmed
                                </h4>
                                <p className="text-[10px] md:text-xs text-indigo-700 dark:text-indigo-300 font-medium leading-relaxed">
                                    {templates.find(t => t.id === selectedTemplate)?.description || "Ready to generate documents."}
                                </p>
                            </motion.div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[1.5rem] md:rounded-[2rem] !overflow-visible group hover:shadow-2xl transition-all duration-300">
                    <CardHeader className="pb-4 pt-6 md:pt-8 px-5 md:px-8">
                        <CardTitle className="text-lg md:text-xl flex items-center gap-3 font-black uppercase tracking-tight dark:text-white">
                            <div className="h-10 w-10 rounded-xl md:rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                                <Users className="h-5 w-5" />
                            </div>
                            2. Select Recipient
                        </CardTitle>
                        <CardDescription className="text-xs md:text-sm dark:text-gray-400">Choose who to issue this document to</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5 md:space-y-6 px-5 md:px-8 pb-8">
                        <div className="grid grid-cols-1 gap-5 md:gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em]">Class</label>
                                <Select value={selectedClass} onValueChange={setSelectedClass}>
                                    <SelectTrigger className="h-11 md:h-12 rounded-xl md:rounded-2xl border-gray-200 dark:border-white/10 dark:bg-slate-950 shadow-sm text-sm">
                                        <SelectValue placeholder="Select class...">
                                            {classes.find(c => c.id === selectedClass)?.name}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl dark:border-white/10 shadow-2xl">
                                        {classes.length === 0 ? (
                                            <div className="p-4 text-center text-sm text-gray-400">No classes found</div>
                                        ) : (
                                            classes.map(c => (
                                                <SelectItem key={c.id} value={c.id} className="rounded-xl font-bold">{c.name}</SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em]">Student</label>
                                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                                    <SelectTrigger disabled={!selectedClass} className="h-11 md:h-12 rounded-xl md:rounded-2xl border-gray-200 dark:border-white/10 dark:bg-slate-950 shadow-sm disabled:opacity-50 text-sm">
                                        <SelectValue placeholder={selectedClass ? "Select student..." : "Select class first"}>
                                            {students.find(s => s.id === selectedStudent)?.user?.name}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl dark:border-white/10 shadow-2xl max-h-[300px]">
                                        {students.length === 0 ? (
                                            <div className="p-4 text-center text-sm text-gray-400">No students found</div>
                                        ) : (
                                            students.map(s => (
                                                <SelectItem key={s.id} value={s.id} className="rounded-xl">
                                                    <div className="flex items-center gap-2 py-0.5">
                                                        <span className="font-bold text-gray-900 dark:text-white text-sm">{s.user?.name}</span>
                                                        <span className="text-[9px] bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded-md font-mono">#{s.admissionNo}</span>
                                                    </div>
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="pt-2 flex items-start gap-2 text-[9px] md:text-[10px] text-gray-400 dark:text-slate-500 italic leading-tight">
                            <Info className="h-3 w-3 shrink-0 mt-0.5" />
                            <span>Documents exported in High Quality A4 PDF with verification.</span>
                        </div>

                        <Button
                            className="w-full h-12 md:h-14 gap-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow-xl shadow-indigo-200 dark:shadow-none uppercase font-black tracking-[0.2em] text-[10px] md:text-xs transition-all active:scale-[0.98] rounded-xl md:rounded-2xl"
                            onClick={handleGenerate}
                            disabled={generating || !selectedStudent || !selectedTemplate}
                        >
                            {generating ? (
                                <>
                                    <Loader className="" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Download className="h-4 w-4" />
                                    Generate
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>

    );
}
