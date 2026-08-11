
import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    User,
    Phone,
    Mail,
    MapPin,
    Calendar,
    Briefcase,
    Building2,
    ChevronLeft,
    Edit,
    FileText,
    Clock,
    Globe,
    BookOpen,
    GraduationCap,
    Check,
    X,
    AlertCircle,
    MoreHorizontal
} from "lucide-react";
import client from "@/lib/api/client";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Loader } from "@/components/ui/feedback/Loader";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { decodeId, encodeId } from "@/lib/utils/hashId";

const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

export default function TeacherDetailsPage() {
    const router = useRouter();
    const { id: rawId } = router.query;
    const id = rawId ? decodeId(rawId as string) : undefined;
    const [teacher, setTeacher] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchTeacherDetails();
    }, [id]);

    const fetchTeacherDetails = async () => {
        try {
            setLoading(true);
            const response = await client.get(`/v1/dashboard/admin/teachers/${id}`);
            setTeacher(response.data.data);
        } catch (err: any) {
            toast.error(err.message || "Failed to load teacher details");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus: string) => {
        try {
            const formData = new FormData();
            formData.append('status', newStatus);

            await client.patch(`/v1/dashboard/admin/teachers/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setTeacher((prev: any) => ({ ...prev, status: newStatus }));
            toast.success(`Teacher status updated to ${newStatus}`);
        } catch (err: any) {
            toast.error(err.response?.data?.error || err.message || "Failed to update status");
        }
    };

    const handleExport = () => {
        if (!teacher) return;

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        doc.setFillColor(79, 70, 229);
        doc.rect(0, 0, pageWidth, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        doc.text("TEACHER PROFILE", 14, 25);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth - 14, 25, { align: 'right' });


        doc.setTextColor(31, 41, 55); // Gray-800
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("Personal Information", 14, 55);

        doc.setDrawColor(229, 231, 235);
        doc.line(14, 58, pageWidth - 14, 58);

        const personalInfo = [
            ["Full Name", teacher.user.name],
            ["Email Address", teacher.user.email],
            ["Phone Number", teacher.user.phone],
            ["Gender", teacher.user.sex],
            ["Blood Group", teacher.user.bloodType || "N/A"],
            ["Current Address", teacher.user.address || "N/A"]
        ];

        autoTable(doc, {
            startY: 62,
            body: personalInfo,
            theme: 'plain',
            styles: { fontSize: 10, cellPadding: 2 },
            columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } }
        });


        const nextY = (doc as any).lastAutoTable.finalY + 15;
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("Professional Details", 14, nextY);
        doc.line(14, nextY + 3, pageWidth - 14, nextY + 3);

        const profInfo = [
            ["Teacher ID", teacher.teacherSchoolId],
            ["Qualification", teacher.qualification],
            ["Work Experience", teacher.workExperience],
            ["Joining Date", teacher.dateofJoin ? new Date(teacher.dateofJoin).toLocaleDateString() : "N/A"],
            ["Status", teacher.status],
            ["Contract Type", teacher.contractType || "Full Time"]
        ];

        autoTable(doc, {
            startY: nextY + 7,
            body: profInfo,
            theme: 'plain',
            styles: { fontSize: 10, cellPadding: 2 },
            columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } }
        });


        if (teacher.lessons && teacher.lessons.length > 0) {
            const scheduleY = (doc as any).lastAutoTable.finalY + 15;
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("Academic Schedule", 14, scheduleY);
            doc.line(14, scheduleY + 3, pageWidth - 14, scheduleY + 3);

            const scheduleData = teacher.lessons.map((l: any) => [
                l.day,
                l.subject.name,
                l.class.name,
                `${new Date(l.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(l.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            ]);

            autoTable(doc, {
                startY: scheduleY + 7,
                head: [["Day", "Subject", "Class", "Time"]],
                body: scheduleData,
                headStyles: { fillColor: [79, 70, 229] },
                theme: 'striped',
                styles: { fontSize: 9 }
            });
        }

        doc.save(`${teacher.user.name.replace(/\s+/g, '_')}_Profile.pdf`);
        toast.success("Profile PDF exported successfully");
    };

    if (loading) {
        return (
            <DashboardLayout role="admin">
                <div className="flex items-center justify-center h-[50vh]">
                    <Loader size="lg" />
                </div>
            </DashboardLayout>
        );
    }

    if (!teacher) return null;

    const lessonsByDay = days.reduce((acc, day) => {
        acc[day] = teacher.lessons?.filter((l: any) => l.day === day) || [];
        return acc;
    }, {} as any);

    return (
        <>
            <Head>
                <title>{teacher.user.name} - Profile | LearnXChain</title>
            </Head>
            <DashboardLayout role="admin">
                <div className="space-y-6 max-w-7xl mx-auto pb-10">
                    <div className="flex items-center justify-between">
                        <Button variant="ghost" className="gap-2" onClick={() => router.back()}>
                            <ChevronLeft className="h-4 w-4" /> Back to Teachers
                        </Button>
                        <div className="flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-2 border-indigo-200 dark:border-gray-800 hover:bg-indigo-50 dark:hover:bg-gray-800">
                                        <MoreHorizontal className="h-4 w-4" /> Change Status
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 rounded-xl p-2 shadow-2xl border-none bg-white dark:bg-gray-900">
                                    <DropdownMenuItem className="rounded-lg text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50 dark:focus:bg-emerald-950/30 transition-colors cursor-pointer" onClick={() => handleStatusUpdate("ACTIVE")}>
                                        <Check className="mr-2 h-4 w-4" /> Mark Active
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="rounded-lg text-amber-600 focus:text-amber-600 focus:bg-amber-50 dark:focus:bg-amber-950/30 transition-colors cursor-pointer" onClick={() => handleStatusUpdate("INACTIVE")}>
                                        <X className="mr-2 h-4 w-4" /> Mark Inactive
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="rounded-lg text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/30 transition-colors cursor-pointer" onClick={() => handleStatusUpdate("SUSPENDED")}>
                                        <AlertCircle className="mr-2 h-4 w-4" /> Suspend Teacher
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
                                <FileText className="h-4 w-4" /> Export Info
                            </Button>
                            <Button size="sm" className="gap-2 bg-indigo-600" onClick={() => id && router.push(`/dashboard/admin/teachers/register?edit=${encodeId(id)}`)}>
                                <Edit className="h-4 w-4" /> Edit Record
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-1 space-y-6">
                            <Card className="border-none shadow-2xl bg-white dark:bg-gradient-to-br dark:from-indigo-600 dark:to-violet-700 text-gray-900 dark:text-white overflow-hidden transition-colors">
                                <CardContent className="p-8 flex flex-col items-center text-center">
                                    <div className="relative group">
                                        <div className="h-32 w-32 rounded-[2.5rem] bg-indigo-50 dark:bg-white/20 backdrop-blur-md flex items-center justify-center text-5xl font-extrabold border-4 border-white dark:border-white/30 shadow-xl overflow-hidden mb-6 text-indigo-600 dark:text-white transition-all group-hover:scale-105">
                                            {teacher.user.profilePic ? (
                                                <img src={teacher.user.profilePic} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                teacher.user.name.charAt(0)
                                            )}
                                        </div>
                                        <Badge className={`absolute -bottom-2 right-0 border-4 border-white dark:border-indigo-600 text-[10px] uppercase font-bold px-3 py-1 shadow-lg ${teacher.status?.toUpperCase() === 'ACTIVE' ? 'bg-emerald-500' : teacher.status?.toUpperCase() === 'INACTIVE' ? 'bg-amber-500' : 'bg-rose-500'}`}>
                                            {teacher.status}
                                        </Badge>
                                    </div>
                                    <h2 className="text-2xl font-black tracking-tight uppercase">{teacher.user.name}</h2>
                                    <p className="text-gray-500 dark:text-indigo-100/70 text-[10px] font-black uppercase tracking-widest mt-1 mb-4">{teacher.teacherSchoolId}</p>

                                    <div className="grid grid-cols-2 gap-4 w-full pt-6 border-t border-gray-100 dark:border-white/10">
                                        <div className="text-center">
                                            <p className="text-[10px] text-gray-400 dark:text-indigo-100/50 uppercase font-black tracking-widest mb-1">Joined</p>
                                            <p className="font-bold text-sm">{new Date(teacher.dateofJoin).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] text-gray-400 dark:text-indigo-100/50 uppercase font-black tracking-widest mb-1">Role</p>
                                            <p className="font-bold text-sm">Faculty</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-lg border-none">
                                <CardHeader>
                                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-gray-400">Primary Contact</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-gray-800 flex items-center justify-center text-indigo-600">
                                            <Phone className="h-4 w-4" />
                                        </div>
                                        <span className="font-medium text-gray-700 dark:text-gray-300">{teacher.user.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-gray-800 flex items-center justify-center text-indigo-600">
                                            <Mail className="h-4 w-4" />
                                        </div>
                                        <span className="font-medium text-gray-700 dark:text-gray-300 truncate">{teacher.user.email}</span>
                                    </div>
                                    <div className="flex items-start gap-3 text-sm">
                                        <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-gray-800 flex items-center justify-center text-indigo-600 shrink-0">
                                            <MapPin className="h-4 w-4" />
                                        </div>
                                        <span className="font-medium text-gray-700 dark:text-gray-300">{teacher.user.address}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Social Connections hidden as per requirement */}
                            {false && (
                                <Card className="shadow-lg border-none">
                                    <CardHeader>
                                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-gray-400">Social Connections</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex flex-wrap gap-4">
                                        {teacher.facebook && <SocialIcon href={teacher.facebook} icon={Globe} label="Facebook" />}
                                        {teacher.linkedin && <SocialIcon href={teacher.linkedin} icon={Globe} label="LinkedIn" />}
                                        {teacher.instagram && <SocialIcon href={teacher.instagram} icon={Globe} label="Instagram" />}
                                        {teacher.youtube && <SocialIcon href={teacher.youtube} icon={Globe} label="YouTube" />}
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            <Tabs defaultValue="schedule" className="w-full">
                                <TabsList className="bg-transparent border-b border-gray-100 dark:border-gray-800 w-full justify-start rounded-none h-12 p-0 gap-8">
                                    <TabsTrigger value="schedule" className="data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 border-b-2 border-transparent rounded-none px-0 h-12 text-sm font-bold bg-transparent shadow-none">Weekly Schedule</TabsTrigger>
                                    <TabsTrigger value="details" className="data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 border-b-2 border-transparent rounded-none px-0 h-12 text-sm font-bold bg-transparent shadow-none">Professional Details</TabsTrigger>
                                </TabsList>

                                <TabsContent value="schedule" className="pt-6 space-y-6">
                                    <div className="grid gap-4">
                                        {days.map((day) => (
                                            <div key={day} className="flex gap-4">
                                                <div className="w-24 shrink-0 pt-2 text-xs font-black text-gray-400 uppercase tracking-widest">{day}</div>
                                                <div className="flex-1 flex flex-wrap gap-3">
                                                    {lessonsByDay[day].length > 0 ? (
                                                        lessonsByDay[day].map((lesson: any) => (
                                                            <div key={lesson.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-xl shadow-sm min-w-[200px] hover:border-indigo-500 transition-colors group">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <Badge variant="soft" tone="info" className="text-[10px] font-bold uppercase tracking-tighter">
                                                                        {lesson.class.name}
                                                                    </Badge>
                                                                    <span className="text-[10px] text-gray-400 font-bold">{new Date(lesson.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                                </div>
                                                                <h4 className="text-sm font-bold text-gray-900 dark:text-white capitalize">{lesson.subject.name}</h4>
                                                                <div className="mt-2 flex items-center justify-between">
                                                                    <p className="text-[10px] text-gray-500 flex items-center gap-1 font-medium">
                                                                        <MapPin className="h-3 w-3" /> Room {lesson.class.roomNumber || 'N/A'}
                                                                    </p>
                                                                    <div className="h-2 w-2 rounded-full bg-indigo-500 group-hover:animate-pulse" />
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-[10px] text-gray-300 font-bold uppercase tracking-widest pt-2">No Lessons Assigned</div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>

                                <TabsContent value="details" className="pt-6 space-y-6">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <DetailItem icon={GraduationCap} label="Qualification" value={teacher.qualification} />
                                        <DetailItem icon={Briefcase} label="Experience" value={teacher.workExperience} />
                                        <DetailItem icon={Calendar} label="Date of Birth" value={new Date(teacher.dateOfBirth).toLocaleDateString()} />
                                        <DetailItem icon={Globe} label="Languages" value={teacher.languagesKnown} />
                                    </div>

                                    <Card className="shadow-lg border-none bg-indigo-50/20 dark:bg-gray-800/20">
                                        <CardHeader>
                                            <CardTitle className="text-sm font-bold tracking-widest uppercase text-indigo-600">Previous Employment</CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid gap-6 md:grid-cols-2">
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mb-1">Previous School</p>
                                                <p className="font-bold">{teacher.previousSchool}</p>
                                                <p className="text-sm text-gray-500 mt-2">{teacher.previousSchoolAddress}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mb-1">Reference Contact</p>
                                                <p className="text-sm font-bold">{teacher.previousSchoolPhone}</p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="shadow-lg border-none bg-gray-50/50 dark:bg-gray-800/50">
                                        <CardHeader>
                                            <CardTitle className="text-sm font-bold tracking-widest uppercase text-gray-500">Other Information</CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid gap-6 md:grid-cols-2">
                                            <DetailItem icon={User} label="Father's Name" value={teacher.fatherName} />
                                            <DetailItem icon={User} label="Mother's Name" value={teacher.motherName} />
                                            <DetailItem icon={FileText} label="PAN Number" value={teacher.panNumber || 'N/A'} />
                                            <DetailItem icon={Clock} label="Marital Status" value={teacher.maritalStatus} />
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="bank" className="pt-6 space-y-6">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <Card className="shadow-2xl border-none bg-emerald-500 dark:bg-emerald-600 text-white p-8 space-y-6 relative overflow-hidden group/salary transition-all hover:scale-[1.02]">
                                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/salary:opacity-20 transition-opacity">
                                                <CreditCard className="h-24 w-24 rotate-12" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Monthly Salary</p>
                                                <p className="text-4xl font-black tracking-tighter">₹{teacher.salary?.toLocaleString()}</p>
                                            </div>
                                            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/20">
                                                <div>
                                                    <p className="text-[10px] uppercase font-black opacity-60 tracking-widest">Contract</p>
                                                    <p className="font-bold text-sm">{teacher.contractType}</p>
                                                </div>
                                                <Button size="sm" variant="outline" className="text-emerald-500 bg-white border-white hover:bg-white/90 font-bold uppercase text-[10px] tracking-widest px-4 h-9 shadow-lg">View Payments</Button>
                                            </div>
                                        </Card>

                                        <Card className="shadow-lg border-none">
                                            <CardHeader>
                                                <CardTitle className="text-sm font-bold tracking-widest uppercase text-gray-400">Bank Details</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div>
                                                    <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Institution</p>
                                                    <p className="font-bold">{teacher.bankName}</p>
                                                    <p className="text-xs text-gray-500 font-medium">{teacher.branchName}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Account Number</p>
                                                    <p className="font-bold text-emerald-600 select-all">{teacher.accountNumber}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">IFSC Code</p>
                                                    <p className="font-bold uppercase select-all">{teacher.ifscCode}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}

function DetailItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
    return (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">{label}</p>
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{value}</p>
            </div>
        </div>
    );
}

function SocialIcon({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 w-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:bg-indigo-600 hover:text-white transition-all hover:scale-110 active:scale-95"
            title={label}
        >
            <Icon className="h-5 w-5" />
        </a>
    );
}

function CreditCard(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
    );
}
