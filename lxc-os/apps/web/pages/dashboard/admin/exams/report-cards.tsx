import { useEffect, useState } from "react";
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/forms/select";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import {
  ChevronLeft, Printer, Download, Trophy, Award, FileText,
  Zap, Layers, CheckSquare, Loader2,
} from "lucide-react";
import client from "@/lib/api/client";
import { toast } from "react-toastify";
import Link from "next/link";
import { Loader } from "@/components/ui/feedback/Loader";

// ─── Theme definitions ────────────────────────────────────────────────────────

const THEMES = {
  indigo: {
    id: "indigo", label: "Classic Indigo",
    dot: "bg-indigo-600",
    header: "#4f46e5", headerDark: "#3730a3",
    accent: "#6366f1", accentLight: "#eef2ff",
    text: "#312e81", tableHead: "#1e1b4b",
    footerBg: "#f8fafc", footerBorder: "#e0e7ff",
    badge: "#e0e7ff", badgeText: "#3730a3",
  },
  navy: {
    id: "navy", label: "Royal Navy",
    dot: "bg-blue-800",
    header: "#1e3a8a", headerDark: "#1e40af",
    accent: "#2563eb", accentLight: "#eff6ff",
    text: "#1e3a8a", tableHead: "#0f172a",
    footerBg: "#f0f9ff", footerBorder: "#bfdbfe",
    badge: "#dbeafe", badgeText: "#1e3a8a",
  },
  green: {
    id: "green", label: "Nature Green",
    dot: "bg-emerald-600",
    header: "#047857", headerDark: "#065f46",
    accent: "#059669", accentLight: "#ecfdf5",
    text: "#064e3b", tableHead: "#022c22",
    footerBg: "#f0fdf4", footerBorder: "#bbf7d0",
    badge: "#d1fae5", badgeText: "#065f46",
  },
  maroon: {
    id: "maroon", label: "Executive Maroon",
    dot: "bg-red-800",
    header: "#9f1239", headerDark: "#881337",
    accent: "#be123c", accentLight: "#fff1f2",
    text: "#881337", tableHead: "#4c0519",
    footerBg: "#fff1f2", footerBorder: "#fecdd3",
    badge: "#fce7f3", badgeText: "#9f1239",
  },
} as const;

type ThemeKey = keyof typeof THEMES;

// ─── Reusable report card HTML (inline styles) for print window ───────────────

function buildReportHtml(d: any, themeKey: ThemeKey): string {
  const th = THEMES[themeKey];
  const grades = d.subjectGrades || [];
  const totalMax = grades.reduce((a: number, g: any) => a + g.totalMax, 0);
  const totalObt = grades.reduce((a: number, g: any) => a + g.totalObtained, 0);
  const pct = totalMax > 0 ? ((totalObt / totalMax) * 100).toFixed(1) : "0.0";
  const getGrade = (p: number) => p >= 90 ? "A+" : p >= 80 ? "A" : p >= 70 ? "B+" : p >= 60 ? "B" : "C";

  const rows = grades.map((g: any) => {
    const gp = (g.totalObtained / g.totalMax) * 100;
    const gc = getGrade(gp);
    const rowBg = gp >= 80 ? "#f0fdf4" : gp >= 60 ? "#f0f9ff" : "#fffbeb";
    const gradeBg = gp >= 80 ? "#d1fae5" : gp >= 60 ? "#dbeafe" : "#fef3c7";
    const gradeText = gp >= 80 ? "#065f46" : gp >= 60 ? "#1e3a8a" : "#92400e";
    return `<tr style="background:${rowBg}">
      <td style="padding:10px 16px;font-weight:800;color:#1e293b;font-size:11px">${g.subject}<br><span style="color:#94a3b8;font-size:9px;font-weight:600">Code: ${g.code || "—"}</span></td>
      <td style="padding:10px 16px;text-align:center;color:#64748b;font-weight:700;font-size:11px">${g.totalMax}</td>
      <td style="padding:10px 16px;text-align:center;color:${th.accent};font-weight:900;font-size:11px">${g.totalObtained}</td>
      <td style="padding:10px 16px;text-align:right"><span style="background:${gradeBg};color:${gradeText};padding:3px 10px;border-radius:6px;font-size:10px;font-weight:900">${gc}</span></td>
    </tr>`;
  }).join("");

  const logoHtml = d.student.school?.schoolLogo
    ? `<img src="${d.student.school.schoolLogo}" style="width:64px;height:64px;object-fit:contain">`
    : `<div style="width:64px;height:64px;background:rgba(255,255,255,0.2);border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:900;color:rgba(255,255,255,0.7)">🏫</div>`;

  const photoHtml = d.student.user?.profilePic
    ? `<img src="${d.student.user.profilePic}" style="width:100%;height:100%;object-fit:cover">`
    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:22px">👤</div>`;

  return `<div class="report-page" style="width:210mm;min-height:297mm;background:white;padding:14mm 14mm 10mm;box-sizing:border-box;position:relative;font-family:'Segoe UI',sans-serif;color:#1e293b">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,${th.header},${th.headerDark});border-radius:16px;padding:20px 24px;display:flex;align-items:center;gap:20px;margin-bottom:20px">
      ${logoHtml}
      <div style="flex:1">
        <div style="color:rgba(255,255,255,0.65);font-size:9px;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:3px">Official Academic Transcript</div>
        <div style="color:white;font-size:22px;font-weight:900;letter-spacing:-0.02em">${d.student.school?.schoolName || "School"}</div>
        <div style="color:rgba(255,255,255,0.6);font-size:10px;margin-top:2px">Academic Session 2024–2025</div>
      </div>
      <div style="text-align:right">
        <div style="background:rgba(255,255,255,0.15);border-radius:10px;padding:8px 16px;display:inline-block;margin-bottom:6px">
          <div style="color:white;font-size:11px;font-weight:900">SESSION 2024–25</div>
        </div>
        <div style="color:rgba(255,255,255,0.5);font-size:9px">ID: ${(d.student.id || "").slice(0, 10).toUpperCase()}</div>
      </div>
    </div>

    <!-- Student Info -->
    <div style="background:#f8fafc;border-radius:12px;padding:16px 20px;margin-bottom:18px;display:flex;gap:20px;align-items:flex-start;border:1.5px solid #e2e8f0">
      <div style="width:72px;height:86px;border-radius:10px;overflow:hidden;border:2.5px solid ${th.accent};flex-shrink:0;background:#f1f5f9">${photoHtml}</div>
      <div style="flex:1;display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div>
          <div style="font-size:9px;color:#94a3b8;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:2px">Student Name</div>
          <div style="font-size:18px;font-weight:900;color:#0f172a;line-height:1.1">${d.student.user?.name || "—"}</div>
          <div style="margin-top:5px;display:inline-block;background:${th.badge};color:${th.badgeText};padding:2px 10px;border-radius:6px;font-size:9px;font-weight:900">ID: ${d.student.admissionNo || "—"}</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          ${[
            ["Class", d.student.class?.name || "—"],
            ["Section", d.student.section || "A"],
            ["Email", d.student.user?.email || "—"],
            ["Phone", d.student.user?.phone || "—"],
          ].map(([l, v]) => `<div><div style="font-size:8px;color:#94a3b8;font-weight:800;text-transform:uppercase;margin-bottom:2px">${l}</div><div style="font-size:10px;font-weight:700;color:#334155">${v}</div></div>`).join("")}
        </div>
      </div>
    </div>

    <!-- Grades Table -->
    <div style="margin-bottom:18px">
      <div style="font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:0.18em;color:${th.accent};margin-bottom:8px;display:flex;align-items:center;gap:6px">▶ Performance Matrix</div>
      <div style="border-radius:12px;overflow:hidden;border:1.5px solid #e2e8f0">
        <table style="width:100%;border-collapse:collapse;font-family:'Segoe UI',sans-serif">
          <thead>
            <tr style="background:${th.tableHead}">
              <th style="padding:10px 16px;text-align:left;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:white">Subject Domain</th>
              <th style="padding:10px 16px;text-align:center;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.7)">Max Marks</th>
              <th style="padding:10px 16px;text-align:center;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.7)">Obtained</th>
              <th style="padding:10px 16px;text-align:right;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.7)">Grade</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
          <tfoot>
            <tr style="background:${th.accentLight}">
              <td style="padding:12px 16px;font-weight:900;font-size:11px;color:${th.text}">Aggregate Total</td>
              <td style="padding:12px 16px;text-align:center;font-weight:900;color:#64748b;font-size:11px">${totalMax}</td>
              <td style="padding:12px 16px;text-align:center;font-weight:900;font-size:14px;color:${th.accent}">${totalObt}</td>
              <td style="padding:12px 16px;text-align:right"><span style="background:${th.header};color:white;padding:4px 14px;border-radius:8px;font-size:12px;font-weight:900">${pct}%</span></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Footer Stats -->
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:24px">
      ${[
        ["Attendance", `${d.attendanceRate || "—"}%`, "Consistent"],
        ["Class Rank", `${d.overallRank || "—"}`, "Position"],
        ["Final Grade", getGrade(parseFloat(pct)), "Overall"],
      ].map(([l, v, s]) => `<div style="background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:12px;padding:14px;text-align:center">
        <div style="font-size:8px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;margin-bottom:4px">${l}</div>
        <div style="font-size:22px;font-weight:900;color:${th.text}">${v}</div>
        <div style="font-size:8px;font-weight:700;color:${th.accent};text-transform:uppercase;margin-top:3px">${s}</div>
      </div>`).join("")}
    </div>

    <!-- Signatures -->
    <div style="display:flex;justify-content:space-between;padding-top:16px;border-top:2px solid #e2e8f0;margin-top:auto">
      <div style="width:140px;text-align:center">
        <div style="height:1.5px;background:#cbd5e1;margin-bottom:6px"></div>
        <div style="font-size:8px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8">Class Teacher</div>
        <div style="font-size:9px;font-weight:700;color:#475569;margin-top:2px">Digitally Verified</div>
      </div>
      <div style="text-align:center">
        <div style="width:44px;height:44px;border-radius:50%;background:${th.accentLight};border:2px solid ${th.accent};display:flex;align-items:center;justify-content:center;margin:0 auto 4px;font-size:18px">🏆</div>
        <div style="font-size:8px;font-weight:900;text-transform:uppercase;color:${th.accent}">${d.student.school?.schoolName?.substring(0, 20) || "School"}</div>
      </div>
      <div style="width:140px;text-align:center">
        <div style="height:1.5px;background:#cbd5e1;margin-bottom:6px"></div>
        <div style="font-size:8px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8">Principal</div>
        <div style="font-size:9px;font-weight:700;color:#475569;margin-top:2px">Official Seal</div>
      </div>
    </div>
  </div>`;
}

// ─── React preview component ──────────────────────────────────────────────────

function ReportCardPreview({ data: d, theme }: { data: any; theme: ThemeKey }) {
  const th = THEMES[theme];
  const grades = d.subjectGrades || [];
  const totalMax = grades.reduce((a: number, g: any) => a + g.totalMax, 0);
  const totalObt = grades.reduce((a: number, g: any) => a + g.totalObtained, 0);
  const pct = totalMax > 0 ? ((totalObt / totalMax) * 100).toFixed(1) : "0.0";
  const getGrade = (p: number) => p >= 90 ? "A+" : p >= 80 ? "A" : p >= 70 ? "B+" : p >= 60 ? "B" : "C";

  return (
    <div id="printable-report" className="w-full max-w-[760px] bg-white text-slate-900 shadow-2xl rounded-2xl overflow-hidden"
      style={{ aspectRatio: "1/1.41" }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg,${th.header},${th.headerDark})` }}
        className="p-6 flex items-center gap-5">
        <div className="h-16 w-16 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.15)" }}>
          {d.student.school?.schoolLogo
            ? <img src={d.student.school.schoolLogo} className="h-12 w-12 object-contain" />
            : <Trophy className="h-8 w-8 text-white" />}
        </div>
        <div className="flex-1">
          <div className="text-white/60 text-[9px] font-black uppercase tracking-widest mb-1">Official Academic Transcript</div>
          <h2 className="text-white text-2xl font-black tracking-tight leading-none">{d.student.school?.schoolName}</h2>
          <p className="text-white/50 text-xs mt-1">Academic Session 2024–2025</p>
        </div>
        <div className="text-right">
          <div className="text-white text-[10px] font-black uppercase bg-white/15 rounded-lg px-3 py-1 mb-2 inline-block">Session 2024–25</div>
          <p className="text-white/40 text-[9px]">ID: {(d.student.id || "").slice(0, 10).toUpperCase()}</p>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Student Info */}
        <div className="flex items-start gap-5 rounded-xl p-4 border border-slate-100 bg-slate-50">
          <div className="h-20 w-16 rounded-xl overflow-hidden border-2 flex-shrink-0" style={{ borderColor: th.accent }}>
            <img src={d.student.user?.profilePic || `https://ui-avatars.com/api/?name=${d.student.user?.name}&background=6366f1&color=fff`}
              className="h-full w-full object-cover" />
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-0.5">Student</p>
              <h4 className="text-xl font-black text-slate-900 leading-tight">{d.student.user?.name}</h4>
              <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-black" style={{ background: th.badge, color: th.badgeText }}>
                {d.student.admissionNo}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[["Class", d.student.class?.name], ["Section", d.student.section || "A"], ["Email", d.student.user?.email], ["Phone", d.student.user?.phone]].map(([l, v]) => (
                <div key={l}>
                  <p className="text-[7px] font-black uppercase text-slate-400 tracking-widest">{l}</p>
                  <p className="text-[10px] font-bold text-slate-700 truncate">{v || "—"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Grade Table */}
        <div>
          <div className="text-[9px] font-black uppercase tracking-widest mb-2 flex items-center gap-2" style={{ color: th.accent }}>
            <Award className="h-3 w-3" /> Performance Matrix
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-100">
            <table className="w-full">
              <thead>
                <tr style={{ background: th.tableHead }}>
                  {["Subject", "Max", "Obtained", "Grade"].map(h => (
                    <th key={h} className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-white/70 text-left last:text-right">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {grades.map((g: any, i: number) => {
                  const gp = (g.totalObtained / g.totalMax) * 100;
                  return (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-black text-slate-800 text-xs">{g.subject}</td>
                      <td className="px-4 py-3 text-center font-bold text-slate-400 text-xs">{g.totalMax}</td>
                      <td className="px-4 py-3 text-center font-black text-xs" style={{ color: th.accent }}>{g.totalObtained}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="px-2 py-0.5 rounded text-[9px] font-black"
                          style={{ background: gp >= 80 ? "#d1fae5" : gp >= 60 ? th.badge : "#fef3c7", color: gp >= 80 ? "#065f46" : gp >= 60 ? th.badgeText : "#92400e" }}>
                          {getGrade(gp)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: th.accentLight }}>
                  <td className="px-4 py-3 font-black text-xs" style={{ color: th.text }}>Aggregate</td>
                  <td className="px-4 py-3 text-center font-black text-slate-400 text-xs">{totalMax}</td>
                  <td className="px-4 py-3 text-center font-black text-sm" style={{ color: th.accent }}>{totalObt}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="px-3 py-1 rounded text-xs font-black text-white" style={{ background: th.header }}>{pct}%</span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[["Attendance", `${d.attendanceRate || "—"}%`], ["Class Rank", `${d.overallRank || "—"}`], ["Final Grade", getGrade(parseFloat(pct))]].map(([l, v]) => (
            <div key={l} className="text-center rounded-xl p-3 border border-slate-100 bg-slate-50">
              <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1">{l}</p>
              <p className="text-xl font-black" style={{ color: th.text }}>{v}</p>
            </div>
          ))}
        </div>

        {/* Signatures */}
        <div className="flex justify-between pt-4 border-t border-slate-200 mt-auto">
          {["Class Teacher", "Principal"].map(sig => (
            <div key={sig} className="w-32 text-center">
              <div className="h-px bg-slate-200 mb-2" />
              <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">{sig}</p>
              <p className="text-[9px] font-bold text-slate-500 mt-1">Digitally Verified</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReportCardsPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey>("indigo");
  const [loading, setLoading] = useState(true);
  const [fetchingStudents, setFetchingStudents] = useState(false);
  const [fetchingReport, setFetchingReport] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [bulkPrinting, setBulkPrinting] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [bulkTotal, setBulkTotal] = useState(0);

  useEffect(() => {
    client.get("/v1/dashboard/admin/classes")
      .then(r => setClasses(r.data))
      .catch(() => toast.error("Failed to load classes"))
      .finally(() => setLoading(false));
  }, []);

  const handleClassChange = async (classId: string) => {
    setSelectedClass(classId);
    setSelectedStudent("");
    setReportData(null);
    if (!classId) { setStudents([]); return; }
    setFetchingStudents(true);
    try {
      const res = await client.get("/v1/dashboard/admin/students", { params: { classId } });
      setStudents(res.data.data);
    } catch { toast.error("Failed to load students"); }
    finally { setFetchingStudents(false); }
  };

  const generateReport = async () => {
    if (!selectedStudent) return toast.error("Please select a student");
    setFetchingReport(true);
    try {
      const res = await client.get(`/v1/admin/exams/report-card/${selectedStudent}`);
      setReportData(res.data.data);
    } catch { toast.error("Failed to generate report card"); }
    finally { setFetchingReport(false); }
  };

  const handlePrint = () => { if (reportData) window.print(); };

  const handleExportPDF = async () => {
    if (!reportData) return;
    const element = document.getElementById("printable-report");
    if (!element) return;
    toast.info("Preparing PDF…");
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false, backgroundColor: "#ffffff" });
      const pdf = new jsPDF("p", "mm", "a4");
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
      pdf.save(`Report_${reportData.student.user.name}_2024-25.pdf`);
      toast.success("PDF downloaded!");
    } catch { toast.error("Export failed"); window.print(); }
  };

  const handleBulkPrint = async () => {
    if (!selectedClass || students.length === 0) return toast.error("Select a class first");
    setBulkPrinting(true);
    setBulkProgress(0);
    setBulkTotal(students.length);

    const allData: any[] = [];
    for (let i = 0; i < students.length; i++) {
      try {
        const res = await client.get(`/v1/admin/exams/report-card/${students[i].id}`);
        if (res.data.data) allData.push(res.data.data);
      } catch { /* skip student with no data */ }
      setBulkProgress(i + 1);
    }

    setBulkPrinting(false);

    if (allData.length === 0) return toast.error("No report data available for this class");

    const printWindow = window.open("", "_blank")!;
    if (!printWindow) return;

    const htmlPages = allData.map(d => buildReportHtml(d, selectedTheme)).join(
      '<div style="page-break-after:always"></div>'
    );

    printWindow.document.write(`<!DOCTYPE html><html><head>
      <meta charset="UTF-8">
      <style>
        @page{margin:0;size:A4 portrait}
        *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
        body{margin:0;background:#f0f0f0;font-family:'Segoe UI',sans-serif}
        .report-page{page-break-after:always;margin:10mm auto;box-shadow:0 4px 24px rgba(0,0,0,0.1)}
        @media print{body{background:white}.report-page{margin:0;box-shadow:none;border-radius:0!important}}
      </style>
    </head><body>
      ${htmlPages}
      <script>window.onload=()=>setTimeout(()=>{window.print();},400);<\/script>
    </body></html>`);
    printWindow.document.close();
    toast.success(`Printed ${allData.length} report card(s)`);
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex h-[80vh] items-center justify-center">
          <Loader size="xl" variant="primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <Head>
        <title>Report Card Generator | Admin | LearnXChain</title>
        <style>{`
          @media print {
            @page { margin:0; size:A4; }
            body { background:white!important; -webkit-print-color-adjust:exact!important; print-color-adjust:exact!important; }
            .no-print { display:none!important; }
            #printable-report { position:absolute!important; top:0!important; left:0!important; width:210mm!important; min-height:297mm!important; margin:0!important; padding:0!important; box-shadow:none!important; border:none!important; border-radius:0!important; }
            nav,aside,header,footer,.sidebar,.no-print { display:none!important; }
          }
        `}</style>
      </Head>

      <div className="space-y-8 pb-20">
        {/* Header */}
        <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/40 dark:bg-slate-900/40 p-8 rounded-[40px] border border-white/20 dark:border-white/5 backdrop-blur-xl shadow-sm">
          <div className="flex items-center gap-6">
            <Link href="/dashboard/admin/exams">
              <button className="h-12 w-12 rounded-2xl bg-white dark:bg-slate-950 border border-gray-100 dark:border-white/10 flex items-center justify-center shadow-sm hover:shadow-md transition-all">
                <ChevronLeft className="h-6 w-6 text-gray-500" />
              </button>
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Badge tone="accent" variant="soft" className="font-black text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full">Academic Documents</Badge>
              </div>
              <h1 className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white leading-tight">
                Report Card <span className="text-indigo-600 dark:text-indigo-400">Generator</span>
              </h1>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Generate and export performance records for students.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Button variant="outline" size="lg"
              className="bg-white dark:bg-slate-950 border-gray-200 dark:border-white/10 h-12 px-6 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm"
              onClick={handlePrint} disabled={!reportData}>
              <Printer className="h-4 w-4 mr-2 text-indigo-500" /> Print
            </Button>
            <Button size="lg"
              className="bg-slate-900 dark:bg-indigo-600 text-white h-12 px-6 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl"
              onClick={handleExportPDF} disabled={!reportData}>
              <Download className="h-4 w-4 mr-2" /> Export PDF
            </Button>
            <Button size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-6 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-200 dark:shadow-emerald-900/20"
              onClick={handleBulkPrint} disabled={!selectedClass || students.length === 0 || bulkPrinting}>
              {bulkPrinting
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {bulkProgress}/{bulkTotal}</>
                : <><Layers className="h-4 w-4 mr-2" /> Bulk Print Class</>}
            </Button>
          </div>
        </div>

        {/* Bulk progress */}
        {bulkPrinting && (
          <div className="no-print rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-900/20 p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-black text-emerald-700 dark:text-emerald-400">Generating report cards…</p>
              <p className="text-sm font-black text-emerald-600">{bulkProgress} / {bulkTotal}</p>
            </div>
            <div className="h-2 bg-emerald-100 dark:bg-emerald-800/40 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${bulkTotal > 0 ? (bulkProgress / bulkTotal) * 100 : 0}%` }} />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Panel */}
          <div className="lg:col-span-1 space-y-4 no-print">
            {/* Template selector */}
            <Card className="rounded-[28px] border-none shadow-lg bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-black tracking-tight">Card Template</CardTitle>
                <CardDescription className="text-[10px] uppercase tracking-widest font-bold">Choose a design style</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {(Object.values(THEMES) as typeof THEMES[ThemeKey][]).map(tmpl => (
                  <button key={tmpl.id} onClick={() => setSelectedTheme(tmpl.id as ThemeKey)}
                    className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all border ${selectedTheme === tmpl.id
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                      : "border-transparent hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400"}`}>
                    <div className={`h-5 w-5 rounded-full flex-shrink-0 ${tmpl.dot}`} />
                    {tmpl.label}
                    {selectedTheme === tmpl.id && <CheckSquare className="h-4 w-4 ml-auto text-indigo-500" />}
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Student Selector */}
            <Card className="rounded-[28px] border-none shadow-lg bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-black tracking-tight">Configuration</CardTitle>
                <CardDescription className="text-[10px] uppercase tracking-widest font-bold">Select student identity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Academic Class</label>
                  <Select value={selectedClass} onChange={e => handleClassChange(e.target.value)}
                    options={[{ label: "Select Class", value: "" }, ...classes.map(c => ({ label: `🏫 ${c.name}`, value: c.id }))]}
                    className="h-11 font-bold rounded-2xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Student</label>
                  <Select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}
                    disabled={!selectedClass || fetchingStudents}
                    options={[{ label: "Select Student", value: "" }, ...students.map(s => ({ label: `👤 ${s.user.name}`, value: s.id }))]}
                    className="h-11 font-bold rounded-2xl" />
                  {fetchingStudents && (
                    <div className="flex items-center gap-2 mt-1 ml-1">
                      <Loader size="sm" variant="primary" />
                      <p className="text-[10px] text-indigo-500 font-bold animate-pulse">Loading students…</p>
                    </div>
                  )}
                </div>
                <Button onClick={generateReport} disabled={!selectedStudent || fetchingReport}
                  className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95 transition-all">
                  {fetchingReport ? <Loader size="sm" variant="white" /> : <Zap className="h-4 w-4 mr-2 text-amber-400" />}
                  Generate Preview
                </Button>

                {students.length > 0 && (
                  <div className="pt-2 border-t border-gray-100 dark:border-white/5">
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Bulk Generation</p>
                    <Button onClick={handleBulkPrint} disabled={bulkPrinting}
                      className="w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest">
                      <Layers className="h-3.5 w-3.5 mr-1.5" />
                      Print All {students.length} Students
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          <div className="lg:col-span-3 min-h-[600px] rounded-[40px] bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-6 border-2 border-dashed border-gray-200 dark:border-white/5 relative overflow-hidden group">
            {!reportData && !fetchingReport && (
              <div className="text-center space-y-4 max-w-sm no-print">
                <div className="h-20 w-20 rounded-[30px] bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 mx-auto flex items-center justify-center shadow-lg transform rotate-6 transition-transform group-hover:rotate-0">
                  <FileText className="h-8 w-8 text-indigo-400" />
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">System Ready</h3>
                <p className="text-sm text-gray-500 font-medium">Select a class and student, then click "Generate Preview" to visualize the report card.</p>
              </div>
            )}
            {fetchingReport && (
              <div className="flex flex-col items-center gap-4 no-print">
                <Loader size="lg" variant="primary" />
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest animate-pulse">Assembling Report Card</p>
              </div>
            )}
            {reportData && (
              <ReportCardPreview data={reportData} theme={selectedTheme} />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
