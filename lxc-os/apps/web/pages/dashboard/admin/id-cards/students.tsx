import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { useEffect, useRef, useState } from "react";
import client from "@/lib/api/client";
import { ChevronLeft, Printer, Download, Users, Layers, Search, User, Phone, Mail, MapPin, Shield, CheckSquare, Square } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Loader } from "@/components/ui/feedback/Loader";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

// ─── Templates ───────────────────────────────────────────────────────────────

function ClassicBlueCard({ s }: { s: any }) {
  return (
    <div style={{ width: 340, height: 214, fontFamily: "'Segoe UI', sans-serif", background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.12)", border: "1px solid #e5e7eb", position: "relative" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#1e40af,#3b82f6)", padding: "10px 14px 8px", display: "flex", alignItems: "center", gap: 8 }}>
        {s.school?.schoolLogo
          ? <img src={s.school.schoolLogo} style={{ width: 28, height: 28, borderRadius: 6, objectFit: "contain", background: "#fff" }} />
          : <div style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}><Shield size={16} color="#fff" /></div>}
        <div>
          <div style={{ color: "#fff", fontWeight: 900, fontSize: 11, letterSpacing: "0.04em", lineHeight: 1.2 }}>{s.school?.schoolName || "School Name"}</div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 8, letterSpacing: "0.1em", textTransform: "uppercase" }}>Student Identity Card</div>
        </div>
        <div style={{ marginLeft: "auto", background: "rgba(255,255,255,0.15)", borderRadius: 6, padding: "2px 8px" }}>
          <div style={{ color: "#fff", fontSize: 8, fontWeight: 700, letterSpacing: "0.05em" }}>2024–25</div>
        </div>
      </div>
      {/* Body */}
      <div style={{ display: "flex", padding: "12px 14px", gap: 12, flex: 1 }}>
        {/* Photo */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ width: 72, height: 84, borderRadius: 10, overflow: "hidden", border: "3px solid #1e40af", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {s.user?.profilePic
              ? <img src={s.user.profilePic} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <User size={32} color="#1e40af" />}
          </div>
          <div style={{ marginTop: 4, textAlign: "center", background: "#1e40af", color: "#fff", borderRadius: 4, padding: "2px 4px", fontSize: 8, fontWeight: 800 }}>STUDENT</div>
        </div>
        {/* Details */}
        <div style={{ flex: 1, overflow: "hidden" }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: "#1e3a8a", lineHeight: 1.2, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.user?.name}</div>
          <div style={{ fontSize: 9, color: "#6b7280", marginBottom: 8 }}>Class: <b style={{ color: "#1e40af" }}>{s.class?.name}</b></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {[
              { label: "Adm No", value: s.admissionNo || "—" },
              { label: "Roll", value: s.academicRecords?.[0]?.rollNumber || "—" },
              { label: "Phone", value: s.user?.phone || "—" },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", gap: 4, fontSize: 9 }}>
                <span style={{ color: "#9ca3af", width: 36, flexShrink: 0 }}>{item.label}:</span>
                <span style={{ color: "#374151", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Footer */}
      <div style={{ background: "#f8fafc", borderTop: "1px solid #e2e8f0", padding: "5px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 8, color: "#94a3b8", letterSpacing: "0.06em" }}>ID: {(s.id || "").slice(0, 8).toUpperCase()}</div>
        <div style={{ display: "flex", gap: 3 }}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map(i => <div key={i} style={{ width: 3, height: 14, background: i % 2 === 0 ? "#1e40af" : "#93c5fd", borderRadius: 1 }} />)}
        </div>
        <div style={{ fontSize: 8, color: "#94a3b8" }}>VALID 2024-25</div>
      </div>
    </div>
  );
}

function ModernDarkCard({ s }: { s: any }) {
  return (
    <div style={{ width: 340, height: 214, fontFamily: "'Segoe UI', sans-serif", background: "linear-gradient(145deg,#0f172a,#1e293b)", borderRadius: 16, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.35)", position: "relative" }}>
      <div style={{ position: "absolute", top: -40, right: -40, width: 140, height: 140, borderRadius: "50%", background: "rgba(245,158,11,0.08)" }} />
      <div style={{ position: "absolute", bottom: -20, left: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(99,102,241,0.08)" }} />
      {/* Accent line */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg,#f59e0b,#fbbf24,#f59e0b)" }} />
      <div style={{ padding: "16px 18px", height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
        {/* Top */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div>
            <div style={{ color: "#f59e0b", fontSize: 8, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 2 }}>Student ID</div>
            <div style={{ color: "#f1f5f9", fontSize: 11, fontWeight: 900, letterSpacing: "0.02em" }}>{s.school?.schoolName || "School"}</div>
          </div>
          <div style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 8, padding: "3px 10px" }}>
            <div style={{ color: "#f59e0b", fontSize: 8, fontWeight: 800, letterSpacing: "0.08em" }}>2024 – 25</div>
          </div>
        </div>
        {/* Middle */}
        <div style={{ display: "flex", gap: 14, flex: 1 }}>
          <div style={{ flexShrink: 0 }}>
            <div style={{ width: 68, height: 80, borderRadius: 12, overflow: "hidden", border: "2px solid #f59e0b", background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {s.user?.profilePic ? <img src={s.user.profilePic} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <User size={30} color="#f59e0b" />}
            </div>
            <div style={{ marginTop: 6, textAlign: "center", background: "#f59e0b", borderRadius: 4, padding: "2px 6px" }}>
              <div style={{ fontSize: 7, fontWeight: 900, color: "#0f172a", letterSpacing: "0.1em" }}>STUDENT</div>
            </div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 5 }}>
            <div style={{ color: "#f1f5f9", fontSize: 14, fontWeight: 900, lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.user?.name}</div>
            <div style={{ color: "#f59e0b", fontSize: 9, fontWeight: 700 }}>Class {s.class?.name}</div>
            {[
              { label: "Adm No", val: s.admissionNo || "—" },
              { label: "Roll No", val: s.academicRecords?.[0]?.rollNumber || "—" },
              { label: "Contact", val: s.user?.phone || "—" },
            ].map(r => (
              <div key={r.label} style={{ display: "flex", gap: 6, fontSize: 9 }}>
                <span style={{ color: "#64748b", width: 40, flexShrink: 0 }}>{r.label}:</span>
                <span style={{ color: "#cbd5e1", fontWeight: 700 }}>{r.val}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Bottom */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          <div style={{ fontSize: 7.5, color: "#475569", letterSpacing: "0.05em" }}>ID: {(s.id || "").slice(0, 10).toUpperCase()}</div>
          <div style={{ display: "flex", gap: 2 }}>
            {[...Array(12)].map((_, i) => <div key={i} style={{ width: 2, height: i % 3 === 0 ? 12 : i % 2 === 0 ? 8 : 10, background: "#f59e0b", borderRadius: 1, opacity: 0.6 + (i % 3) * 0.13 }} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

function GradientCard({ s }: { s: any }) {
  return (
    <div style={{ width: 340, height: 214, fontFamily: "'Segoe UI', sans-serif", background: "linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#a78bfa 100%)", borderRadius: 16, overflow: "hidden", boxShadow: "0 8px 32px rgba(99,102,241,0.4)", position: "relative" }}>
      <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
      <div style={{ position: "absolute", bottom: -20, left: 60, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
      <div style={{ padding: "14px 16px", height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 8, padding: 5, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {s.school?.schoolLogo ? <img src={s.school.schoolLogo} style={{ width: 20, height: 20, objectFit: "contain" }} /> : <Shield size={14} color="#fff" />}
          </div>
          <div>
            <div style={{ color: "#fff", fontSize: 11, fontWeight: 900, letterSpacing: "0.02em" }}>{s.school?.schoolName || "School"}</div>
            <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 7.5, letterSpacing: "0.1em", textTransform: "uppercase" }}>Identity Card • 2024–25</div>
          </div>
        </div>
        {/* Body */}
        <div style={{ display: "flex", gap: 12, flex: 1 }}>
          <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
            <div style={{ width: 70, height: 82, borderRadius: 12, overflow: "hidden", border: "3px solid rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {s.user?.profilePic ? <img src={s.user.profilePic} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <User size={28} color="rgba(255,255,255,0.8)" />}
            </div>
            <div style={{ background: "rgba(255,255,255,0.25)", borderRadius: 20, padding: "2px 10px" }}>
              <span style={{ color: "#fff", fontSize: 7.5, fontWeight: 800, letterSpacing: "0.08em" }}>STUDENT</span>
            </div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 5 }}>
            <div style={{ color: "#fff", fontSize: 15, fontWeight: 900, lineHeight: 1.1, textShadow: "0 1px 3px rgba(0,0,0,0.15)" }}>{s.user?.name}</div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 9, fontWeight: 700 }}>Class {s.class?.name}</div>
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: "5px 10px", display: "flex", flexDirection: "column", gap: 3 }}>
              {[
                { l: "Adm No", v: s.admissionNo || "—" },
                { l: "Roll No", v: s.academicRecords?.[0]?.rollNumber || "—" },
                { l: "Phone", v: s.user?.phone || "—" },
              ].map(r => (
                <div key={r.l} style={{ display: "flex", fontSize: 8.5 }}>
                  <span style={{ color: "rgba(255,255,255,0.55)", width: 38, flexShrink: 0 }}>{r.l}:</span>
                  <span style={{ color: "#fff", fontWeight: 700 }}>{r.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Footer */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: 7, marginTop: 7, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 7.5, color: "rgba(255,255,255,0.5)" }}>ID: {(s.id || "").slice(0, 8).toUpperCase()}</div>
          <div style={{ fontSize: 7.5, color: "rgba(255,255,255,0.5)" }}>VALID: 2024 – 2025</div>
        </div>
      </div>
    </div>
  );
}

function MinimalCard({ s }: { s: any }) {
  return (
    <div style={{ width: 340, height: 214, fontFamily: "'Segoe UI', sans-serif", background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.09)", border: "1.5px solid #e2e8f0", position: "relative" }}>
      {/* Left accent bar */}
      <div style={{ position: "absolute", top: 0, left: 0, width: 5, height: "100%", background: "linear-gradient(180deg,#0ea5e9,#06b6d4)" }} />
      <div style={{ padding: "14px 16px 12px 20px", height: "100%", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
        {/* Top */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 8, color: "#0ea5e9", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 1 }}>Student Identity Card</div>
            <div style={{ fontSize: 11.5, color: "#0f172a", fontWeight: 900, letterSpacing: "0.01em" }}>{s.school?.schoolName || "School"}</div>
          </div>
          {s.school?.schoolLogo
            ? <img src={s.school.schoolLogo} style={{ width: 32, height: 32, objectFit: "contain" }} />
            : <div style={{ width: 32, height: 32, borderRadius: 8, border: "1.5px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}><Shield size={16} color="#0ea5e9" /></div>}
        </div>
        {/* Divider */}
        <div style={{ height: 1, background: "linear-gradient(90deg,#0ea5e9,transparent)", marginBottom: 10 }} />
        {/* Content */}
        <div style={{ display: "flex", gap: 14, flex: 1 }}>
          <div style={{ flexShrink: 0 }}>
            <div style={{ width: 68, height: 80, borderRadius: 8, overflow: "hidden", border: "2px solid #e2e8f0", background: "#f0f9ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {s.user?.profilePic ? <img src={s.user.profilePic} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <User size={28} color="#0ea5e9" />}
            </div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#0f172a", lineHeight: 1.2, marginBottom: 1 }}>{s.user?.name}</div>
              <div style={{ fontSize: 9, color: "#64748b", fontWeight: 600, marginBottom: 8 }}>Class {s.class?.name}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px 8px" }}>
              {[
                { l: "Adm No", v: s.admissionNo || "—" },
                { l: "Roll No", v: s.academicRecords?.[0]?.rollNumber || "—" },
                { l: "Phone", v: s.user?.phone || "—" },
                { l: "Session", v: "2024–25" },
              ].map(r => (
                <div key={r.l} style={{ fontSize: 8.5 }}>
                  <div style={{ color: "#94a3b8", fontSize: 7.5, lineHeight: 1 }}>{r.l}</div>
                  <div style={{ color: "#334155", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Footer */}
        <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 7.5, color: "#94a3b8" }}>ID: {(s.id || "").slice(0, 10).toUpperCase()}</div>
          <div style={{ display: "flex", gap: 2 }}>{[...Array(10)].map((_, i) => <div key={i} style={{ width: 3, height: i % 2 === 0 ? 10 : 14, background: "#0ea5e9", opacity: 0.4 + (i % 3) * 0.2, borderRadius: 1 }} />)}</div>
        </div>
      </div>
    </div>
  );
}

function BoldGreenCard({ s }: { s: any }) {
  return (
    <div style={{ width: 340, height: 214, fontFamily: "'Segoe UI', sans-serif", background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 4px 24px rgba(16,185,129,0.2)", border: "1.5px solid #d1fae5", position: "relative" }}>
      {/* Header bar */}
      <div style={{ background: "linear-gradient(135deg,#059669,#10b981)", padding: "9px 14px", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 7, padding: 4 }}>
          {s.school?.schoolLogo ? <img src={s.school.schoolLogo} style={{ width: 20, height: 20, objectFit: "contain" }} /> : <Shield size={14} color="#fff" />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#fff", fontSize: 11, fontWeight: 900, letterSpacing: "0.02em" }}>{s.school?.schoolName || "School Name"}</div>
          <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 7.5, letterSpacing: "0.1em", textTransform: "uppercase" }}>Student Identity Card</div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.18)", borderRadius: 6, padding: "2px 8px" }}>
          <div style={{ color: "#fff", fontSize: 7.5, fontWeight: 800 }}>2024–25</div>
        </div>
      </div>
      <div style={{ padding: "10px 14px", display: "flex", gap: 12 }}>
        {/* Photo */}
        <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ width: 72, height: 84, borderRadius: 10, overflow: "hidden", border: "3px solid #10b981", background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {s.user?.profilePic ? <img src={s.user.profilePic} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <User size={30} color="#059669" />}
          </div>
          <div style={{ background: "#059669", borderRadius: 4, padding: "2px 7px" }}>
            <div style={{ color: "#fff", fontSize: 7.5, fontWeight: 900, letterSpacing: "0.06em" }}>STUDENT</div>
          </div>
        </div>
        {/* Info */}
        <div style={{ flex: 1, overflow: "hidden" }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: "#064e3b", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 1 }}>{s.user?.name}</div>
          <div style={{ fontSize: 9, color: "#059669", fontWeight: 800, marginBottom: 8, letterSpacing: "0.04em" }}>Class {s.class?.name}</div>
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "6px 10px", display: "flex", flexDirection: "column", gap: 4 }}>
            {[
              { l: "Admission No", v: s.admissionNo || "—" },
              { l: "Roll Number", v: s.academicRecords?.[0]?.rollNumber || "—" },
              { l: "Contact", v: s.user?.phone || "—" },
            ].map(r => (
              <div key={r.l} style={{ display: "flex", gap: 5, fontSize: 8.5 }}>
                <span style={{ color: "#6ee7b7", width: 70, flexShrink: 0 }}>{r.l}:</span>
                <span style={{ color: "#065f46", fontWeight: 800 }}>{r.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Footer */}
      <div style={{ background: "#f0fdf4", borderTop: "1px solid #d1fae5", padding: "4px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 7.5, color: "#6ee7b7" }}>ID: {(s.id || "").slice(0, 8).toUpperCase()}</div>
        <div style={{ display: "flex", gap: 2 }}>{[...Array(10)].map((_, i) => <div key={i} style={{ width: 3, height: i % 2 === 0 ? 10 : 14, background: "#10b981", opacity: 0.5 + (i % 3) * 0.17, borderRadius: 1 }} />)}</div>
        <div style={{ fontSize: 7.5, color: "#6ee7b7" }}>VALID 2024–25</div>
      </div>
    </div>
  );
}

const TEMPLATES = [
  { id: "classic", label: "Classic Blue", Component: ClassicBlueCard },
  { id: "dark", label: "Modern Dark", Component: ModernDarkCard },
  { id: "gradient", label: "Gradient Violet", Component: GradientCard },
  { id: "minimal", label: "Minimal Cyan", Component: MinimalCard },
  { id: "green", label: "Bold Green", Component: BoldGreenCard },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StudentIdCardsPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("classic");
  const [previewStudent, setPreviewStudent] = useState<any>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    client.get("/v1/dashboard/admin/classes").then(r => setClasses(r.data)).catch(() => toast.error("Failed to load classes"));
  }, []);

  const loadStudents = async (classId: string) => {
    setSelectedClass(classId);
    setStudents([]); setSelected(new Set()); setPreviewStudent(null);
    if (!classId) return;
    setLoading(true);
    try {
      const r = await client.get(`/v1/admin/id-cards/students?classId=${classId}`);
      setStudents(r.data);
      setPreviewStudent(r.data[0] || null);
    } catch { toast.error("Failed to load students"); }
    finally { setLoading(false); }
  };

  const Template = TEMPLATES.find(t => t.id === selectedTemplate)!.Component;

  const toggleSelect = (id: string) => setSelected(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const toggleAll = () => {
    if (selected.size === filteredStudents.length) setSelected(new Set());
    else setSelected(new Set(filteredStudents.map(s => s.id)));
  };

  const filteredStudents = students.filter(s =>
    s.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    (s.admissionNo || "").toLowerCase().includes(search.toLowerCase())
  );

  const printCards = async (toPrint: any[]) => {
    if (!toPrint.length) return toast.error("No cards to print");
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><style>
      @page{margin:5mm;size:A4}
      body{margin:0;background:#fff}
      .grid{display:grid;grid-template-columns:1fr 1fr;gap:8mm;padding:5mm}
      .card-wrap{page-break-inside:avoid}
    </style></head><body><div class="grid" id="cards"></div><script>
      window.onload=()=>{window.print();window.close();}
    </script></body></html>`);
    const grid = w.document.getElementById("cards")!;
    for (const s of toPrint) {
      const wrap = w.document.createElement("div");
      wrap.className = "card-wrap";
      wrap.setAttribute("data-id", s.id);
      grid.appendChild(wrap);
    }
    w.document.close();
    toast.success(`Printing ${toPrint.length} card(s)…`);
  };

  const handleBulkPrint = () => {
    const toPrint = selected.size > 0 ? students.filter(s => selected.has(s.id)) : filteredStudents;
    if (!toPrint.length) return toast.error("No students to print");

    const printWindow = window.open("", "_blank")!;
    if (!printWindow) return;

    const templateId = selectedTemplate;
    const htmlCards = toPrint.map(s => buildCardHtml(s, templateId)).join("");

    printWindow.document.write(`<!DOCTYPE html><html><head>
      <style>
        @page{margin:5mm;size:A4 portrait}
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#fff;font-family:'Segoe UI',sans-serif}
        .grid{display:grid;grid-template-columns:repeat(2,340px);gap:8mm;justify-content:center;padding:8mm}
        .card-wrap{page-break-inside:avoid}
      </style>
    </head><body>
      <div class="grid">${htmlCards}</div>
      <script>window.onload=()=>{window.print();}<\/script>
    </body></html>`);
    printWindow.document.close();
  };

  const handleExportPDF = async () => {
    const toPrint = selected.size > 0 ? students.filter(s => selected.has(s.id)) : filteredStudents.slice(0, 1);
    if (!toPrint.length || !previewStudent) return;

    const el = document.getElementById("id-card-preview");
    if (!el) return;
    try {
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: null });
      const pdf = new jsPDF("l", "mm", [91, 57]);
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, 91, 57);
      pdf.save(`ID_Card_${previewStudent.user?.name}.pdf`);
      toast.success("PDF exported!");
    } catch { toast.error("Export failed"); }
  };

  return (
    <>
      <Head>
        <title>Student ID Cards | Admin | LearnXChain</title>
        <style>{`@media print{body *{visibility:hidden}.print-area,.print-area *{visibility:visible}.print-area{position:fixed;top:0;left:0;width:100%}}`}</style>
      </Head>
      <DashboardLayout role="admin">
        <div className="space-y-6 pb-12">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/admin/students">
                <button className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                  <ChevronLeft className="h-5 w-5 text-gray-500" />
                </button>
              </Link>
              <div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white">Student ID Cards</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Generate professional identity cards for students</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleExportPDF} disabled={!previewStudent}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-all shadow-sm">
                <Download className="h-4 w-4" /> Export PDF
              </button>
              <button onClick={handleBulkPrint} disabled={!students.length}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-40 transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20">
                <Printer className="h-4 w-4" />
                {selected.size > 0 ? `Print ${selected.size} Cards` : "Print All"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Panel */}
            <div className="lg:col-span-1 space-y-4">
              {/* Class selector */}
              <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-gray-900 p-5 shadow-sm">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Select Class</label>
                <select value={selectedClass} onChange={e => loadStudents(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-800 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors">
                  <option value="">— Choose Class —</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* Template selector */}
              <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-gray-900 p-5 shadow-sm">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 block">Card Template</label>
                <div className="space-y-2">
                  {TEMPLATES.map(t => (
                    <button key={t.id} onClick={() => setSelectedTemplate(t.id)}
                      className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all border ${selectedTemplate === t.id
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                        : "border-transparent hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400"}`}>
                      <div className={`h-5 w-5 rounded-full flex-shrink-0 ${t.id === "classic" ? "bg-blue-500" : t.id === "dark" ? "bg-slate-800" : t.id === "gradient" ? "bg-gradient-to-br from-indigo-500 to-violet-500" : t.id === "minimal" ? "bg-cyan-400" : "bg-emerald-500"}`} />
                      {t.label}
                      {selectedTemplate === t.id && <CheckSquare className="h-4 w-4 ml-auto text-indigo-500" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Student list */}
              {students.length > 0 && (
                <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-50 dark:border-white/5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{students.length} Students</span>
                      <button onClick={toggleAll} className="text-xs font-bold text-indigo-600 hover:text-indigo-500">
                        {selected.size === filteredStudents.length ? "Deselect All" : "Select All"}
                      </button>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
                        className="w-full h-8 pl-8 pr-3 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-gray-800 dark:text-white text-xs focus:outline-none" />
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-gray-50 dark:divide-white/5">
                    {filteredStudents.map(s => (
                      <div key={s.id}
                        className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${previewStudent?.id === s.id ? "bg-indigo-50 dark:bg-indigo-900/20" : ""}`}
                        onClick={() => setPreviewStudent(s)}>
                        <div onClick={e => { e.stopPropagation(); toggleSelect(s.id); }}
                          className={`h-4 w-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${selected.has(s.id) ? "bg-indigo-600 border-indigo-600" : "border-gray-300 dark:border-white/20"}`}>
                          {selected.has(s.id) && <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <div className="h-7 w-7 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {s.user?.profilePic ? <img src={s.user.profilePic} className="h-full w-full object-cover" /> : <User className="h-3.5 w-3.5 text-gray-400" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-800 dark:text-white truncate">{s.user?.name}</p>
                          <p className="text-[10px] text-gray-400">{s.admissionNo}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Preview Panel */}
            <div className="lg:col-span-3">
              <div className="rounded-3xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-gray-950 p-8 min-h-[500px] flex flex-col items-center justify-center gap-8">
                {loading ? (
                  <div className="flex flex-col items-center gap-4">
                    <Loader size="lg" />
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">Loading students…</p>
                  </div>
                ) : !previewStudent ? (
                  <div className="text-center space-y-3">
                    <div className="h-20 w-20 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 mx-auto flex items-center justify-center shadow-lg">
                      <Users className="h-8 w-8 text-gray-300" />
                    </div>
                    <p className="text-gray-400 font-bold">Select a class to preview ID cards</p>
                  </div>
                ) : (
                  <>
                    {/* Single preview */}
                    <div className="text-center space-y-2">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Preview: {previewStudent.user?.name}</p>
                      <div id="id-card-preview">
                        <Template s={previewStudent} />
                      </div>
                    </div>

                    {/* Thumbnail grid of all */}
                    {students.length > 1 && (
                      <div className="w-full">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 text-center">All Cards Preview</p>
                        <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-1">
                          {filteredStudents.map(s => (
                            <div key={s.id}
                              onClick={() => setPreviewStudent(s)}
                              className={`cursor-pointer transition-all ${previewStudent?.id === s.id ? "ring-2 ring-indigo-500 rounded-xl" : "hover:ring-2 hover:ring-gray-300 rounded-xl"}`}
                              style={{ transform: "scale(0.52)", transformOrigin: "top left", width: 340, height: 214, flexShrink: 0 }}>
                              <Template s={s} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}

function buildCardHtml(s: any, templateId: string): string {
  const name = s.user?.name || "Student";
  const cls = s.class?.name || "";
  const adm = s.admissionNo || "—";
  const roll = s.academicRecords?.[0]?.rollNumber || "—";
  const phone = s.user?.phone || "—";
  const photo = s.user?.profilePic || "";
  const school = s.school?.schoolName || "School";
  const shortId = (s.id || "").slice(0, 8).toUpperCase();

  const photoTag = photo
    ? `<img src="${photo}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit"/>`
    : `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>`;

  if (templateId === "classic") return `<div class="card-wrap"><div style="width:340px;height:214px;font-family:sans-serif;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 2px 8px rgba(0,0,0,.1)"><div style="background:linear-gradient(135deg,#1e40af,#3b82f6);padding:9px 14px;display:flex;align-items:center;gap:8px"><div><div style="color:#fff;font-weight:900;font-size:11px">${school}</div><div style="color:rgba(255,255,255,.7);font-size:7.5px;letter-spacing:.1em;text-transform:uppercase">Student Identity Card</div></div><div style="margin-left:auto;background:rgba(255,255,255,.15);border-radius:5px;padding:2px 7px"><div style="color:#fff;font-size:7.5px;font-weight:700">2024–25</div></div></div><div style="display:flex;padding:10px 14px;gap:12px"><div style="width:72px;height:84px;border-radius:10px;overflow:hidden;border:3px solid #1e40af;background:#eff6ff;display:flex;align-items:center;justify-content:center;flex-shrink:0">${photoTag}</div><div style="flex:1;overflow:hidden"><div style="font-size:13px;font-weight:900;color:#1e3a8a;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${name}</div><div style="font-size:8.5px;color:#6b7280;margin-bottom:8px">Class: <b style="color:#1e40af">${cls}</b></div><div style="font-size:8.5px;color:#374151"><b>Adm:</b> ${adm} &nbsp; <b>Roll:</b> ${roll}</div><div style="font-size:8.5px;color:#374151;margin-top:3px"><b>Phone:</b> ${phone}</div></div></div><div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:5px 14px;display:flex;justify-content:space-between"><div style="font-size:7.5px;color:#94a3b8">ID: ${shortId}</div><div style="font-size:7.5px;color:#94a3b8">VALID 2024-25</div></div></div></div>`;

  return `<div class="card-wrap"><div style="width:340px;height:214px;font-family:sans-serif;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:14px;overflow:hidden;padding:14px 16px;box-sizing:border-box"><div style="color:rgba(255,255,255,.65);font-size:7.5px;letter-spacing:.1em;text-transform:uppercase;margin-bottom:2px">Student Identity Card</div><div style="color:#fff;font-size:11px;font-weight:900;margin-bottom:10px">${school}</div><div style="display:flex;gap:12px"><div style="width:68px;height:80px;border-radius:10px;overflow:hidden;border:2px solid rgba(255,255,255,.6);flex-shrink:0;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center">${photoTag}</div><div style="color:#fff;flex:1"><div style="font-size:14px;font-weight:900;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${name}</div><div style="font-size:9px;opacity:.8;margin-bottom:6px">Class ${cls}</div><div style="font-size:8.5px;opacity:.85"><b>Adm:</b> ${adm} &nbsp; <b>Roll:</b> ${roll}<br/><b>Phone:</b> ${phone}</div></div></div><div style="margin-top:8px;border-top:1px solid rgba(255,255,255,.2);padding-top:6px;display:flex;justify-content:space-between"><div style="font-size:7.5px;color:rgba(255,255,255,.5)">ID: ${shortId}</div><div style="font-size:7.5px;color:rgba(255,255,255,.5)">2024–25</div></div></div></div>`;
}
