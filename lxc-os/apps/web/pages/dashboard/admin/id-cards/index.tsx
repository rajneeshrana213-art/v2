import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import React, { useEffect, useRef, useState } from "react";
import client from "@/lib/api/client";
import {
  ChevronLeft, Printer, Download, Users, Search,
  User, Shield, CheckSquare, GraduationCap, BookOpen, CreditCard,
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Loader } from "@/components/ui/feedback/Loader";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function subjectList(t: any, max = 3) {
  const arr = (t.subjects || []).slice(0, max).map((s: any) => s.name);
  return arr.length ? arr.join(" · ") : "—";
}
function classList(t: any, max = 2) {
  const arr = (t.classes || []).slice(0, max).map((c: any) => c.name);
  return arr.length ? arr.join(", ") : "—";
}

// ─── Student Templates ────────────────────────────────────────────────────────

function ClassicBlueCard({ s }: { s: any }) {
  return (
    <div style={{ width: 340, height: 214, fontFamily: "'Inter', 'Segoe UI', sans-serif", background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0", position: "relative" }}>
      <div style={{ background: "linear-gradient(135deg,#1e40af,#3b82f6)", padding: "8px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: "3px solid #fbbf24" }}>
        <div style={{ background: "#fff", padding: 3, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.1)", flexShrink: 0 }}>
          {s.school?.schoolLogo
            ? <img src={s.school.schoolLogo} style={{ width: 28, height: 28, objectFit: "contain" }} />
            : <Shield size={18} color="#1e40af" />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: 12, letterSpacing: "-0.01em", lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.school?.schoolName || "School Name"}</div>
          <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 7.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Student Identity Card</div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 6, padding: "3px 8px", border: "1px solid rgba(255,255,255,0.2)" }}>
          <div style={{ color: "#fff", fontSize: 8, fontWeight: 800 }}>{s.activeYear || "2024–25"}</div>
        </div>
      </div>
      <div style={{ display: "flex", padding: "10px 18px", gap: 18 }}>
        <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: 78, height: 88, borderRadius: 10, overflow: "hidden", border: "2.5px solid #1e40af", background: "#f1f5f9" }}>
            {s.user?.profilePic ? <img src={s.user.profilePic} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><User size={36} color="#cbd5e1" /></div>}
          </div>
          <div style={{ marginTop: 4, width: "100%", textAlign: "center", background: "#1e40af", color: "#fff", borderRadius: 4, padding: "2px 0", fontSize: 8, fontWeight: 900, letterSpacing: "0.05em" }}>STUDENT</div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: "#1e3a8a", lineHeight: 1.1, marginBottom: 1 }}>{s.user?.name}</div>
            <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700 }}>Class: <span style={{ color: "#1e40af" }}>{s.class?.name?.replace(/class/i, "").trim()}</span></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "60px 1fr", rowGap: 3, alignItems: "center" }}>
            {[
              { label: "ADM NO", value: s.admissionNo || "—" },
              { label: "ROLL NO", value: s.academicRecords?.[0]?.rollNumber || "—" },
              { label: "CONTACT", value: s.user?.phone || "—" },
            ].map(item => (
              <React.Fragment key={item.label}>
                <div style={{ fontSize: 7.5, color: "#94a3b8", fontWeight: 800, letterSpacing: "0.02em" }}>{item.label}</div>
                <div style={{ fontSize: 10, color: "#334155", fontWeight: 700 }}>{item.value}</div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 26, background: "#f8fafc", borderTop: "1px solid #e2e8f0", padding: "0 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 8, color: "#64748b", fontWeight: 800, fontFamily: "monospace" }}>{s.user?.userName || (s.id || "").slice(0, 8).toUpperCase()}</div>
        <div style={{ display: "flex", gap: 2.5, opacity: 0.5 }}>
          {[...Array(10)].map((_, i) => <div key={i} style={{ width: 2.5, height: i % 3 === 0 ? 12 : 8, background: "#1e40af", borderRadius: 1 }} />)}
        </div>
        <div style={{ fontSize: 8, color: "#64748b", fontWeight: 800 }}>VALID {s.activeYear || "2024–25"}</div>
      </div>
    </div>
  );
}

function ModernDarkStudentCard({ s }: { s: any }) {
  return (
    <div style={{ width: 340, height: 214, fontFamily: "'Inter', sans-serif", background: "linear-gradient(145deg,#0f172a,#1e293b)", borderRadius: 20, overflow: "hidden", boxShadow: "0 15px 40px rgba(0,0,0,0.4)", position: "relative" }}>
      <div style={{ position: "absolute", top: -50, right: -50, width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg,#f59e0b,#fbbf24,#f59e0b)" }} />
      <div style={{ padding: "16px 22px", height: "100%", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: "#f59e0b", fontSize: 8, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 3 }}>Student Identification</div>
            <div style={{ color: "#f1f5f9", fontSize: 13, fontWeight: 900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.school?.schoolName || "School"}</div>
          </div>
          <div style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 10, padding: "4px 12px", marginLeft: 12 }}>
            <div style={{ color: "#f59e0b", fontSize: 10, fontWeight: 800 }}>{s.activeYear || "2024–25"}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 18, flex: 1 }}>
          <div style={{ flexShrink: 0 }}>
            <div style={{ width: 80, height: 92, borderRadius: 16, overflow: "hidden", border: "2.5px solid #f59e0b", background: "#0f172a", boxShadow: "0 8px 15px rgba(0,0,0,0.3)" }}>
              {s.user?.profilePic ? <img src={s.user.profilePic} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><User size={38} color="#1e293b" /></div>}
            </div>
            <div style={{ marginTop: 8, textAlign: "center", background: "#f59e0b", borderRadius: 6, padding: "3px 0" }}>
              <div style={{ fontSize: 8, fontWeight: 900, color: "#0f172a", letterSpacing: "0.05em" }}>STUDENT</div>
            </div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ marginBottom: 10 }}>
              <div style={{ color: "#fff", fontSize: 18, fontWeight: 900, lineHeight: 1.1, marginBottom: 2 }}>{s.user?.name}</div>
              <div style={{ color: "#f59e0b", fontSize: 11, fontWeight: 800 }}>Class {s.class?.name?.replace(/class/i, "").trim()}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "60px 1fr", rowGap: 5 }}>
              {[
                { label: "ADM NO", val: s.admissionNo || "—" },
                { label: "ROLL NO", val: s.academicRecords?.[0]?.rollNumber || "—" },
                { label: "CONTACT", val: s.user?.phone || "—" }
              ].map(r => (
                <React.Fragment key={r.label}>
                  <div style={{ color: "#64748b", fontSize: 8, fontWeight: 800 }}>{r.label}</div>
                  <div style={{ color: "#cbd5e1", fontSize: 10, fontWeight: 700 }}>{r.val}</div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
          <div style={{ fontSize: 9, color: "#475569", fontWeight: 800, fontFamily: "monospace" }}>{s.user?.userName || (s.id || "").slice(0, 10).toUpperCase()}</div>
          <div style={{ display: "flex", gap: 2.5 }}>
            {[...Array(14)].map((_, i) => (
              <div key={i} style={{ width: 2, height: i % 3 === 0 ? 14 : i % 2 === 0 ? 8 : 11, background: "#f59e0b", borderRadius: 1, opacity: 0.6 }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function GradientVioletCard({ s }: { s: any }) {
  return (
    <div style={{ width: 340, height: 214, fontFamily: "'Inter', sans-serif", background: "linear-gradient(135deg,#4f46e5 0%,#7c3aed 50%,#9333ea 100%)", borderRadius: 20, overflow: "hidden", boxShadow: "0 15px 40px rgba(79,70,229,0.3)", position: "relative" }}>
      <div style={{ position: "absolute", top: -40, right: -40, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
      <div style={{ padding: "16px 22px", height: "100%", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 8, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 3 }}>Student Identification</div>
            <div style={{ color: "#fff", fontSize: 13, fontWeight: 900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.school?.schoolName || "School"}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 10, padding: "4px 12px", marginLeft: 12 }}>
            <div style={{ color: "#fff", fontSize: 10, fontWeight: 800 }}>{s.activeYear || "2024–25"}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 18, flex: 1 }}>
          <div style={{ flexShrink: 0 }}>
            <div style={{ width: 80, height: 92, borderRadius: 16, overflow: "hidden", border: "2.5px solid rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.1)", boxShadow: "0 8px 20px rgba(0,0,0,0.2)" }}>
              {s.user?.profilePic ? <img src={s.user.profilePic} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><User size={38} color="rgba(255,255,255,0.5)" /></div>}
            </div>
            <div style={{ marginTop: 8, textAlign: "center", background: "#fff", borderRadius: 6, padding: "3px 0" }}>
              <div style={{ fontSize: 8, fontWeight: 900, color: "#4f46e5", letterSpacing: "0.05em" }}>STUDENT</div>
            </div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ marginBottom: 10 }}>
              <div style={{ color: "#fff", fontSize: 18, fontWeight: 900, lineHeight: 1.1, marginBottom: 2 }}>{s.user?.name}</div>
              <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 11, fontWeight: 800 }}>Class {s.class?.name?.replace(/class/i, "").trim()}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "60px 1fr", rowGap: 5 }}>
              {[
                { label: "ADM NO", val: s.admissionNo || "—" },
                { label: "ROLL NO", val: s.academicRecords?.[0]?.rollNumber || "—" },
                { label: "CONTACT", val: s.user?.phone || "—" }
              ].map(r => (
                <React.Fragment key={r.label}>
                  <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 8, fontWeight: 800 }}>{r.label}</div>
                  <div style={{ color: "#fff", fontSize: 10, fontWeight: 700 }}>{r.val}</div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.6)", fontWeight: 800, fontFamily: "monospace" }}>{s.user?.userName || (s.id || "").slice(0, 10).toUpperCase()}</div>
          <div style={{ display: "flex", gap: 3 }}>
            {[...Array(12)].map((_, i) => (
              <div key={i} style={{ width: 3, height: i % 2 === 0 ? 12 : 8, background: "#fff", borderRadius: 1, opacity: 0.4 }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const STUDENT_TEMPLATES = [
  { id: "classic", label: "Classic Blue", Component: ClassicBlueCard, dot: "bg-blue-600" },
  { id: "dark", label: "Modern Dark", Component: ModernDarkStudentCard, dot: "bg-slate-800" },
  { id: "gradient", label: "Gradient Violet", Component: GradientVioletCard, dot: "bg-violet-500" },
];

// ─── Teacher Templates ────────────────────────────────────────────────────────

function ClassicNavyCard({ t }: { t: any }) {
  return (
    <div style={{ width: 340, height: 214, fontFamily: "'Inter', sans-serif", background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 12px 30px rgba(0,0,0,0.12)", border: "1px solid #e2e8f0", position: "relative" }}>
      <div style={{ background: "linear-gradient(135deg,#0f172a,#334155)", padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: "3px solid #1e40af" }}>
        <div style={{ background: "#fff", padding: 3, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(0,0,0,0.15)", flexShrink: 0 }}>
          {t.school?.schoolLogo
            ? <img src={t.school.schoolLogo} style={{ width: 30, height: 30, objectFit: "contain" }} />
            : <Shield size={18} color="#0f172a" />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: 12, letterSpacing: "-0.01em", lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.school?.schoolName || "School Name"}</div>
          <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 7.5, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>Faculty Identity Card</div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 6, padding: "3px 8px", border: "1px solid rgba(255,255,255,0.2)" }}>
          <div style={{ color: "#fff", fontSize: 8, fontWeight: 800 }}>{t.activeYear || "2024–25"}</div>
        </div>
      </div>
      <div style={{ display: "flex", padding: "12px 20px", gap: 18 }}>
        <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: 80, height: 92, borderRadius: 10, overflow: "hidden", border: "2.5px solid #0f172a", background: "#f1f5f9", boxShadow: "0 4px 12px rgba(15,23,42,0.15)" }}>
            {t.user?.profilePic ? <img src={t.user.profilePic} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><User size={38} color="#cbd5e1" /></div>}
          </div>
          <div style={{ marginTop: 6, width: "100%", textAlign: "center", background: "#0f172a", color: "#fff", borderRadius: 4, padding: "2px 0", fontSize: 8, fontWeight: 900, letterSpacing: "0.05em" }}>FACULTY</div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: "#0f172a", lineHeight: 1.1, marginBottom: 1 }}>{t.user?.name}</div>
            <div style={{ fontSize: 9, color: "#64748b", fontWeight: 800 }}>Dept: <span style={{ color: "#1e40af" }}>{t.department?.name || "Academics"}</span></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "60px 1fr", rowGap: 3.5, alignItems: "center" }}>
            {[
              { label: "EMP ID", value: t.teacherSchoolId || "—" },
              { label: "TEACHES", value: subjectList(t, 1) },
              { label: "CONTACT", value: t.user?.phone || "—" },
            ].map(item => (
              <React.Fragment key={item.label}>
                <div style={{ fontSize: 7.5, color: "#94a3b8", fontWeight: 800, letterSpacing: "0.02em" }}>{item.label}</div>
                <div style={{ fontSize: 9.5, color: "#334155", fontWeight: 700 }}>{item.value}</div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 28, background: "#f8fafc", borderTop: "1px solid #e2e8f0", padding: "0 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 8, color: "#64748b", fontWeight: 800, fontFamily: "monospace", letterSpacing: "0.05em" }}>{t.user?.userName || (t.id || "").slice(0, 8).toUpperCase()}</div>
        <div style={{ display: "flex", gap: 3, opacity: 0.6 }}>
          {[...Array(10)].map((_, i) => <div key={i} style={{ width: 2.5, height: i % 3 === 0 ? 12 : 8, background: "#0f172a", borderRadius: 1 }} />)}
        </div>
        <div style={{ fontSize: 8, color: "#64748b", fontWeight: 800 }}>VALID {t.activeYear || "2024–25"}</div>
      </div>
    </div>
  );
}

function ModernGoldCard({ t }: { t: any }) {
  return (
    <div style={{ width: 340, height: 214, fontFamily: "'Inter', sans-serif", background: "linear-gradient(145deg,#0f172a,#1e293b)", borderRadius: 20, overflow: "hidden", boxShadow: "0 15px 40px rgba(0,0,0,0.4)", position: "relative" }}>
      <div style={{ position: "absolute", top: -50, right: -50, width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle, rgba(234,179,8,0.12) 0%, transparent 70%)" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg,#eab308,#facc15,#eab308)" }} />
      <div style={{ padding: "14px 22px", height: "100%", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: "#eab308", fontSize: 8, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 2 }}>Faculty Identification</div>
            <div style={{ color: "#f1f5f9", fontSize: 12, fontWeight: 900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.school?.schoolName || "School"}</div>
          </div>
          <div style={{ background: "rgba(234,179,8,0.15)", border: "1px solid rgba(234,179,8,0.3)", borderRadius: 8, padding: "3px 10px", marginLeft: 12 }}>
            <div style={{ color: "#eab308", fontSize: 9, fontWeight: 800 }}>{t.activeYear || "2024–25"}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, flex: 1 }}>
          <div style={{ flexShrink: 0 }}>
            <div style={{ width: 78, height: 88, borderRadius: 12, overflow: "hidden", border: "2.5px solid #eab308", background: "#0f172a", boxShadow: "0 8px 15px rgba(0,0,0,0.3)" }}>
              {t.user?.profilePic ? <img src={t.user.profilePic} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><User size={36} color="#1e293b" /></div>}
            </div>
            <div style={{ marginTop: 6, textAlign: "center", background: "#eab308", borderRadius: 4, padding: "2px 0" }}>
              <div style={{ fontSize: 8, fontWeight: 900, color: "#0f172a", letterSpacing: "0.05em" }}>FACULTY</div>
            </div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ marginBottom: 8 }}>
              <div style={{ color: "#fff", fontSize: 16, fontWeight: 900, lineHeight: 1.1, marginBottom: 1 }}>{t.user?.name}</div>
              <div style={{ color: "#eab308", fontSize: 9, fontWeight: 800 }}>{t.department?.name || "Academics"}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "60px 1fr", rowGap: 3.5 }}>
              {[
                { label: "EMP ID", val: t.teacherSchoolId || "—" },
                { label: "TEACHES", val: subjectList(t, 1) },
                { label: "CONTACT", val: t.user?.phone || "—" }
              ].map(r => (
                <React.Fragment key={r.label}>
                  <div style={{ color: "#64748b", fontSize: 7.5, fontWeight: 800 }}>{r.label}</div>
                  <div style={{ color: "#cbd5e1", fontSize: 9.5, fontWeight: 700 }}>{r.val}</div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          <div style={{ fontSize: 8, color: "#475569", fontWeight: 800, fontFamily: "monospace" }}>{t.user?.userName || (t.id || "").slice(0, 10).toUpperCase()}</div>
          <div style={{ display: "flex", gap: 2.5 }}>
            {[...Array(12)].map((_, i) => (
              <div key={i} style={{ width: 2, height: i % 3 === 0 ? 12 : i % 2 === 0 ? 7 : 10, background: "#eab308", borderRadius: 1, opacity: 0.6 }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ExecutivePurpleCard({ t }: { t: any }) {
  return (
    <div style={{ width: 340, height: 214, fontFamily: "'Inter', sans-serif", background: "linear-gradient(135deg,#4c1d95 0%,#7c3aed 50%,#8b5cf6 100%)", borderRadius: 20, overflow: "hidden", boxShadow: "0 15px 40px rgba(124,58,237,0.3)", position: "relative" }}>
      <div style={{ position: "absolute", top: -40, right: -40, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
      <div style={{ padding: "14px 22px", height: "100%", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 8, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 2 }}>Faculty Identification</div>
            <div style={{ color: "#fff", fontSize: 12, fontWeight: 900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.school?.schoolName || "School"}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 8, padding: "3px 10px", marginLeft: 12 }}>
            <div style={{ color: "#fff", fontSize: 9, fontWeight: 800 }}>{t.activeYear || "2024–25"}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, flex: 1 }}>
          <div style={{ flexShrink: 0 }}>
            <div style={{ width: 78, height: 88, borderRadius: 12, overflow: "hidden", border: "2.5px solid rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.1)", boxShadow: "0 8px 20px rgba(0,0,0,0.2)" }}>
              {t.user?.profilePic ? <img src={t.user.profilePic} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><User size={36} color="rgba(255,255,255,0.5)" /></div>}
            </div>
            <div style={{ marginTop: 6, textAlign: "center", background: "#fff", borderRadius: 4, padding: "2px 0" }}>
              <div style={{ fontSize: 8, fontWeight: 900, color: "#7c3aed", letterSpacing: "0.05em" }}>FACULTY</div>
            </div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ marginBottom: 8 }}>
              <div style={{ color: "#fff", fontSize: 16, fontWeight: 900, lineHeight: 1.1, marginBottom: 1 }}>{t.user?.name}</div>
              <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 9, fontWeight: 800 }}>{t.department?.name || "Academics"}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "60px 1fr", rowGap: 3.5 }}>
              {[
                { label: "EMP ID", val: t.teacherSchoolId || "—" },
                { label: "TEACHES", val: subjectList(t, 1) },
                { label: "CONTACT", val: t.user?.phone || "—" }
              ].map(r => (
                <React.Fragment key={r.label}>
                  <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 7.5, fontWeight: 800 }}>{r.label}</div>
                  <div style={{ color: "#fff", fontSize: 9.5, fontWeight: 700 }}>{r.val}</div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.6)", fontWeight: 800, fontFamily: "monospace" }}>{t.user?.userName || (t.id || "").slice(0, 10).toUpperCase()}</div>
          <div style={{ display: "flex", gap: 3 }}>
            {[...Array(10)].map((_, i) => (
              <div key={i} style={{ width: 2.5, height: i % 2 === 0 ? 10 : 7, background: "#fff", borderRadius: 1, opacity: 0.4 }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const TEACHER_TEMPLATES = [
  { id: "navy", label: "Classic Navy", Component: ClassicNavyCard, dot: "bg-blue-800" },
  { id: "gold", label: "Modern Gold", Component: ModernGoldCard, dot: "bg-amber-500" },
  { id: "purple", label: "Executive Violet", Component: ExecutivePurpleCard, dot: "bg-violet-600" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = "students" | "teachers";

export default function IdCardsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("students");

  // ── Student state
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStudentTemplate, setSelectedStudentTemplate] = useState("classic");
  const [previewStudent, setPreviewStudent] = useState<any>(null);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [studentSearch, setStudentSearch] = useState("");
  const [studentsLoading, setStudentsLoading] = useState(false);

  // ── Teacher state
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedTeacherTemplate, setSelectedTeacherTemplate] = useState("navy");
  const [previewTeacher, setPreviewTeacher] = useState<any>(null);
  const [selectedTeachers, setSelectedTeachers] = useState<Set<string>>(new Set());
  const [teacherSearch, setTeacherSearch] = useState("");
  const [teachersLoading, setTeachersLoading] = useState(false);

  // Load classes on mount
  useEffect(() => {
    client.get("/v1/dashboard/admin/classes").then(r => setClasses(r.data)).catch(() => toast.error("Failed to load classes"));
  }, []);

  // Load teachers when tab switches
  useEffect(() => {
    if (activeTab === "teachers" && teachers.length === 0) {
      setTeachersLoading(true);
      client.get("/v1/admin/id-cards/teachers")
        .then(r => { setTeachers(r.data); setPreviewTeacher(r.data[0] || null); })
        .catch(() => toast.error("Failed to load teachers"))
        .finally(() => setTeachersLoading(false));
    }
  }, [activeTab]);

  // Load students by class
  const loadStudents = async (classId: string) => {
    setSelectedClass(classId);
    setStudents([]); setSelectedStudents(new Set()); setPreviewStudent(null);
    if (!classId) return;
    setStudentsLoading(true);
    try {
      const r = await client.get(`/v1/admin/id-cards/students?classId=${classId}`);
      setStudents(r.data);
      setPreviewStudent(r.data[0] || null);
    } catch { toast.error("Failed to load students"); }
    finally { setStudentsLoading(false); }
  };

  // ── Student helpers
  const filteredStudents = students.filter(s =>
    s.user?.name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
    (s.admissionNo || "").toLowerCase().includes(studentSearch.toLowerCase())
  );

  const toggleStudent = (id: string) => setSelectedStudents(prev => {
    const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next;
  });
  const toggleAllStudents = () => {
    if (selectedStudents.size === filteredStudents.length) setSelectedStudents(new Set());
    else setSelectedStudents(new Set(filteredStudents.map(s => s.id)));
  };

  // ── Teacher helpers
  const filteredTeachers = teachers.filter(t =>
    t.user?.name?.toLowerCase().includes(teacherSearch.toLowerCase()) ||
    (t.employeeId || "").toLowerCase().includes(teacherSearch.toLowerCase())
  );

  const toggleTeacher = (id: string) => setSelectedTeachers(prev => {
    const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next;
  });
  const toggleAllTeachers = () => {
    if (selectedTeachers.size === filteredTeachers.length) setSelectedTeachers(new Set());
    else setSelectedTeachers(new Set(filteredTeachers.map(t => t.id)));
  };

  // ── Print helpers
  const handleStudentBulkPrint = () => {
    const toPrint = selectedStudents.size > 0 ? students.filter(s => selectedStudents.has(s.id)) : filteredStudents;
    if (!toPrint.length) return toast.error("No students to print");
    const w = window.open("", "_blank")!;
    const cards = toPrint.map(s => buildStudentCardHtml(s, selectedStudentTemplate)).join("");
    w.document.write(`<!DOCTYPE html><html><head><style>@page{margin:5mm;size:A4 portrait}*{box-sizing:border-box;margin:0;padding:0}body{background:#fff;font-family:'Segoe UI',sans-serif}.grid{display:grid;grid-template-columns:repeat(2,340px);gap:8mm;justify-content:center;padding:8mm}.card-wrap{page-break-inside:avoid}</style></head><body><div class="grid">${cards}</div><script>window.onload=()=>{window.print();}<\/script></body></html>`);
    w.document.close();
  };

  const handleTeacherBulkPrint = () => {
    const toPrint = selectedTeachers.size > 0 ? teachers.filter(t => selectedTeachers.has(t.id)) : filteredTeachers;
    if (!toPrint.length) return toast.error("No teachers to print");
    const w = window.open("", "_blank")!;
    const cards = toPrint.map(t => buildTeacherCardHtml(t, selectedTeacherTemplate)).join("");
    w.document.write(`<!DOCTYPE html><html><head><style>@page{margin:5mm;size:A4 portrait}*{box-sizing:border-box;margin:0;padding:0}body{background:#fff;font-family:'Segoe UI',sans-serif}.grid{display:grid;grid-template-columns:repeat(2,340px);gap:8mm;justify-content:center;padding:8mm}.card-wrap{page-break-inside:avoid}</style></head><body><div class="grid">${cards}</div><script>window.onload=()=>{window.print();}<\/script></body></html>`);
    w.document.close();
  };

  const handleStudentExportPDF = async () => {
    if (!previewStudent) return;
    const el = document.getElementById("student-card-preview");
    if (!el) return;
    try {
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: null });
      const pdf = new jsPDF("l", "mm", [91, 57]);
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, 91, 57);
      pdf.save(`ID_Card_${previewStudent.user?.name}.pdf`);
      toast.success("PDF exported!");
    } catch { toast.error("Export failed"); }
  };

  const handleTeacherExportPDF = async () => {
    if (!previewTeacher) return;
    const el = document.getElementById("teacher-card-preview");
    if (!el) return;
    try {
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: null });
      const pdf = new jsPDF("l", "mm", [91, 57]);
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, 91, 57);
      pdf.save(`ID_Card_${previewTeacher.user?.name}.pdf`);
      toast.success("PDF exported!");
    } catch { toast.error("Export failed"); }
  };

  const StudentTemplate = STUDENT_TEMPLATES.find(t => t.id === selectedStudentTemplate)!.Component;
  const TeacherTemplate = TEACHER_TEMPLATES.find(t => t.id === selectedTeacherTemplate)!.Component;

  const isStudents = activeTab === "students";

  return (
    <>
      <Head>
        <title>ID Cards | Admin | LearnXChain</title>
        <style>{`@media print{body *{visibility:hidden}.print-area,.print-area *{visibility:visible}.print-area{position:fixed;top:0;left:0;width:100%}}`}</style>
      </Head>
      <DashboardLayout role="admin">
        <div className="space-y-6 pb-12">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/admin">
                <button className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                  <ChevronLeft className="h-5 w-5 text-gray-500" />
                </button>
              </Link>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <CreditCard className="h-5 w-5 text-indigo-500" />
                  <h1 className="text-2xl font-black text-gray-900 dark:text-white">ID Cards</h1>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Generate professional identity cards for students and faculty</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={isStudents ? handleStudentExportPDF : handleTeacherExportPDF}
                disabled={isStudents ? !previewStudent : !previewTeacher}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-all shadow-sm"
              >
                <Download className="h-4 w-4" /> Export PDF
              </button>
              <button
                onClick={isStudents ? handleStudentBulkPrint : handleTeacherBulkPrint}
                disabled={isStudents ? !students.length : !teachers.length}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-40 transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20"
              >
                <Printer className="h-4 w-4" />
                {isStudents
                  ? (selectedStudents.size > 0 ? `Print ${selectedStudents.size} Cards` : "Print All")
                  : (selectedTeachers.size > 0 ? `Print ${selectedTeachers.size} Cards` : "Print All")}
              </button>
            </div>
          </div>

          {/* Tab Bar */}
          <div className="flex gap-1 p-1 rounded-2xl bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-white/10 w-fit">
            {([
              { key: "students" as Tab, label: "Students", icon: GraduationCap, count: students.length },
              { key: "teachers" as Tab, label: "Teachers", icon: BookOpen, count: teachers.length },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab.key
                    ? "bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                {tab.count > 0 && (
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400" : "bg-gray-200 dark:bg-gray-700 text-gray-400"}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ─────────────── STUDENTS PANEL ─────────────── */}
          {activeTab === "students" && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left */}
              <div className="lg:col-span-1 space-y-4">
                <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-gray-900 p-5 shadow-sm">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Select Class</label>
                  <select value={selectedClass} onChange={e => loadStudents(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-800 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500">
                    <option value="">— Choose Class —</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-gray-900 p-5 shadow-sm">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 block">Card Template</label>
                  <div className="space-y-2">
                    {STUDENT_TEMPLATES.map(tmpl => (
                      <button key={tmpl.id} onClick={() => setSelectedStudentTemplate(tmpl.id)}
                        className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all border ${selectedStudentTemplate === tmpl.id ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400" : "border-transparent hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400"}`}>
                        <div className={`h-5 w-5 rounded-full flex-shrink-0 ${tmpl.dot}`} />
                        {tmpl.label}
                        {selectedStudentTemplate === tmpl.id && <CheckSquare className="h-4 w-4 ml-auto text-indigo-500" />}
                      </button>
                    ))}
                  </div>
                </div>

                {students.length > 0 && (
                  <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-50 dark:border-white/5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{students.length} Students</span>
                        <button onClick={toggleAllStudents} className="text-xs font-bold text-indigo-600 hover:text-indigo-500">
                          {selectedStudents.size === filteredStudents.length ? "Deselect All" : "Select All"}
                        </button>
                      </div>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                        <input value={studentSearch} onChange={e => setStudentSearch(e.target.value)} placeholder="Search…"
                          className="w-full h-8 pl-8 pr-3 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-gray-800 dark:text-white text-xs focus:outline-none" />
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-gray-50 dark:divide-white/5">
                      {filteredStudents.map(s => (
                        <div key={s.id}
                          className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 ${previewStudent?.id === s.id ? "bg-indigo-50 dark:bg-indigo-900/20" : ""}`}
                          onClick={() => setPreviewStudent(s)}>
                          <div onClick={e => { e.stopPropagation(); toggleStudent(s.id); }}
                            className={`h-4 w-4 rounded border flex-shrink-0 flex items-center justify-center ${selectedStudents.has(s.id) ? "bg-indigo-600 border-indigo-600" : "border-gray-300 dark:border-white/20"}`}>
                            {selectedStudents.has(s.id) && <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
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

              {/* Right: Preview */}
              <div className="lg:col-span-3">
                <div className="rounded-3xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-gray-950 p-8 min-h-[500px] flex flex-col items-center justify-center gap-8">
                  {studentsLoading ? (
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
                      <div className="text-center space-y-2">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Preview: {previewStudent.user?.name}</p>
                        <div id="student-card-preview">
                          <StudentTemplate s={previewStudent} />
                        </div>
                      </div>
                      {students.length > 1 && (
                        <div className="w-full">
                          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 text-center">All Cards Preview</p>
                          <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-1">
                            {filteredStudents.map(s => (
                              <div key={s.id} onClick={() => setPreviewStudent(s)}
                                className={`cursor-pointer transition-all ${previewStudent?.id === s.id ? "ring-2 ring-indigo-500 rounded-xl" : "hover:ring-2 hover:ring-gray-300 rounded-xl"}`}
                                style={{ transform: "scale(0.52)", transformOrigin: "top left", width: 340, height: 214, flexShrink: 0 }}>
                                <StudentTemplate s={s} />
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
          )}

          {/* ─────────────── TEACHERS PANEL ─────────────── */}
          {activeTab === "teachers" && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left */}
              <div className="lg:col-span-1 space-y-4">
                <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-gray-900 p-5 shadow-sm">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 block">Card Template</label>
                  <div className="space-y-2">
                    {TEACHER_TEMPLATES.map(tmpl => (
                      <button key={tmpl.id} onClick={() => setSelectedTeacherTemplate(tmpl.id)}
                        className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all border ${selectedTeacherTemplate === tmpl.id ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400" : "border-transparent hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400"}`}>
                        <div className={`h-5 w-5 rounded-full flex-shrink-0 ${tmpl.dot}`} />
                        {tmpl.label}
                        {selectedTeacherTemplate === tmpl.id && <CheckSquare className="h-4 w-4 ml-auto text-indigo-500" />}
                      </button>
                    ))}
                  </div>
                </div>

                {teachersLoading ? (
                  <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-gray-900 p-6 flex items-center justify-center">
                    <Loader size="md" />
                  </div>
                ) : (
                  <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-50 dark:border-white/5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{teachers.length} Teachers</span>
                        <button onClick={toggleAllTeachers} className="text-xs font-bold text-indigo-600 hover:text-indigo-500">
                          {selectedTeachers.size === filteredTeachers.length && filteredTeachers.length > 0 ? "Deselect All" : "Select All"}
                        </button>
                      </div>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                        <input value={teacherSearch} onChange={e => setTeacherSearch(e.target.value)} placeholder="Search…"
                          className="w-full h-8 pl-8 pr-3 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-gray-800 dark:text-white text-xs focus:outline-none" />
                      </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-white/5">
                      {filteredTeachers.length === 0 && <div className="p-6 text-center text-xs text-gray-400 font-medium">No teachers found</div>}
                      {filteredTeachers.map(t => (
                        <div key={t.id}
                          className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 ${previewTeacher?.id === t.id ? "bg-indigo-50 dark:bg-indigo-900/20" : ""}`}
                          onClick={() => setPreviewTeacher(t)}>
                          <div onClick={e => { e.stopPropagation(); toggleTeacher(t.id); }}
                            className={`h-4 w-4 rounded border flex-shrink-0 flex items-center justify-center ${selectedTeachers.has(t.id) ? "bg-indigo-600 border-indigo-600" : "border-gray-300 dark:border-white/20"}`}>
                            {selectedTeachers.has(t.id) && <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <div className="h-7 w-7 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {t.user?.profilePic ? <img src={t.user.profilePic} className="h-full w-full object-cover" /> : <User className="h-3.5 w-3.5 text-gray-400" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-800 dark:text-white truncate">{t.user?.name}</p>
                            <p className="text-[10px] text-gray-400 truncate">{subjectList(t, 1)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Preview */}
              <div className="lg:col-span-3">
                <div className="rounded-3xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-gray-950 p-8 min-h-[500px] flex flex-col items-center justify-center gap-8">
                  {!previewTeacher && !teachersLoading ? (
                    <div className="text-center space-y-3">
                      <div className="h-20 w-20 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 mx-auto flex items-center justify-center shadow-lg">
                        <Users className="h-8 w-8 text-gray-300" />
                      </div>
                      <p className="text-gray-400 font-bold">No teachers found. Add teachers first.</p>
                    </div>
                  ) : previewTeacher && (
                    <>
                      <div className="text-center space-y-2">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Preview: {previewTeacher.user?.name}</p>
                        <div id="teacher-card-preview">
                          <TeacherTemplate t={previewTeacher} />
                        </div>
                      </div>
                      {teachers.length > 1 && (
                        <div className="w-full">
                          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 text-center">All Cards Preview</p>
                          <div className="flex flex-wrap gap-4 max-h-96 overflow-y-auto justify-center">
                            {filteredTeachers.map(t => (
                              <div key={t.id} onClick={() => setPreviewTeacher(t)}
                                className={`cursor-pointer transition-all rounded-xl overflow-hidden flex-shrink-0 ${previewTeacher?.id === t.id ? "ring-2 ring-indigo-500" : "hover:ring-2 hover:ring-gray-300"}`}
                                style={{ width: 176, height: 111 }}>
                                <div style={{ transform: "scale(0.517)", transformOrigin: "top left", width: 340, height: 214, pointerEvents: "none" }}>
                                  <TeacherTemplate t={t} />
                                </div>
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
          )}

        </div>
      </DashboardLayout>
    </>
  );
}

// ─── Print HTML builders ──────────────────────────────────────────────────────

function buildStudentCardHtml(s: any, templateId: string): string {
  const name = s.user?.name || "Student";
  const cls = s.class?.name || "";
  const adm = s.admissionNo || "—";
  const roll = s.academicRecords?.[0]?.rollNumber || "—";
  const phone = s.user?.phone || "—";
  const photo = s.user?.profilePic || "";
  const school = s.school?.schoolName || "School";
  const year = s.activeYear || "2024–25";
  const footerId = s.user?.userName || (s.id || "").slice(0, 8).toUpperCase();
  const photoTag = photo ? `<img src="${photo}" style="width:100%;height:100%;object-fit:cover"/>` : `<div style="width:30px;height:30px;background:#eff6ff;border-radius:50%;display:flex;align-items:center;justify-content:center"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e40af" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg></div>`;
  return `<div class="card-wrap"><div style="width:340px;height:214px;font-family:sans-serif;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;position:relative"><div style="background:linear-gradient(135deg,#1e40af,#3b82f6);padding:12px 16px;display:flex;align-items:center;gap:12px;border-bottom:4px solid #fbbf24"><div style="color:#fff;font-weight:800;font-size:13px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${school}</div><div style="background:rgba(255,255,255,0.15);border-radius:6px;padding:3px 8px;border:1px solid rgba(255,255,255,0.25);color:#fff;font-size:8px;font-weight:800">${year}</div></div><div style="display:flex;padding:18px 20px;gap:20px"><div><div style="width:84px;height:100px;border-radius:12px;overflow:hidden;border:3px solid #1e40af;background:#f1f5f9;display:flex;align-items:center;justify-content:center">${photoTag}</div><div style="margin-top:8px;text-align:center;background:#1e40af;color:#fff;border-radius:6px;padding:3px 0;font-size:9px;font-weight:900">STUDENT</div></div><div style="flex:1"><div style="font-size:18px;font-weight:900;color:#1e3a8a;line-height:1.1;margin-bottom:2px">${name}</div><div style="font-size:11px;color:#64748b;font-weight:700;margin-bottom:12px">Class: <span style="color:#1e40af">${cls.replace(/class/i, "").trim()}</span></div><div style="display:grid;grid-template-columns:65px 1fr;row-gap:5px"><div style="font-size:8px;color:#94a3b8;font-weight:800">ADM NO</div><div style="font-size:11px;color:#334155;font-weight:700">${adm}</div><div style="font-size:8px;color:#94a3b8;font-weight:800">ROLL NO</div><div style="font-size:11px;color:#334155;font-weight:700">${roll}</div><div style="font-size:8px;color:#94a3b8;font-weight:800">CONTACT</div><div style="font-size:11px;color:#334155;font-weight:700">${phone}</div></div></div></div><div style="position:absolute;bottom:0;left:0;right:0;height:36px;background:#f8fafc;border-top:1px solid #e2e8f0;padding:0 16px;display:flex;justify-content:space-between;align-items:center"><div style="font-size:9px;color:#64748b;font-weight:800;font-family:monospace">${footerId}</div><div style="font-size:9px;color:#64748b;font-weight:800">VALID ${year}</div></div></div></div>`;
}

function buildTeacherCardHtml(t: any, templateId: string): string {
  const name = t.user?.name || "Teacher";
  const school = t.school?.schoolName || "School";
  const empId = t.teacherSchoolId || "—";
  const subjects = subjectList(t, 1);
  const classes = classList(t);
  const year = t.activeYear || "2024–25";
  const footerId = t.user?.userName || (t.id || "").slice(0, 8).toUpperCase();
  const photoEl = t.user?.profilePic ? `<img src="${t.user.profilePic}" style="width:100%;height:100%;object-fit:cover">` : `<div style="width:30px;height:30px;background:#f1f5f9;border-radius:50%;display:flex;align-items:center;justify-content:center"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg></div>`;
  return `<div class="card-wrap"><div style="width:340px;height:214px;font-family:sans-serif;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;position:relative"><div style="background:linear-gradient(135deg,#0f172a,#334155);padding:12px 16px;display:flex;align-items:center;gap:12px;border-bottom:4px solid #1e40af"><div style="color:#fff;font-weight:800;font-size:13px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${school}</div><div style="background:rgba(255,255,255,0.15);border-radius:6px;padding:3px 8px;border:1px solid rgba(255,255,255,0.25);color:#fff;font-size:8px;font-weight:800">${year}</div></div><div style="display:flex;padding:18px 20px;gap:20px"><div><div style="width:84px;height:100px;border-radius:12px;overflow:hidden;border:3px solid #0f172a;background:#f1f5f9;display:flex;align-items:center;justify-content:center">${photoEl}</div><div style="margin-top:8px;text-align:center;background:#0f172a;color:#fff;border-radius:6px;padding:3px 0;font-size:9px;font-weight:900">FACULTY</div></div><div style="flex:1"><div style="font-size:17px;font-weight:900;color:#0f172a;line-height:1.1;margin-bottom:2px">${name}</div><div style="font-size:10px;color:#64748b;font-weight:800;margin-bottom:12px">Department: <span style="color:#1e40af">${t.department?.name || "Academics"}</span></div><div style="display:grid;grid-template-columns:65px 1fr;row-gap:5px"><div style="font-size:8px;color:#94a3b8;font-weight:800">EMP ID</div><div style="font-size:11px;color:#334155;font-weight:700">${empId}</div><div style="font-size:8px;color:#94a3b8;font-weight:800">TEACHES</div><div style="font-size:11px;color:#334155;font-weight:700">${subjects}</div><div style="font-size:8px;color:#94a3b8;font-weight:800">CONTACT</div><div style="font-size:11px;color:#334155;font-weight:700">${t.user?.phone || "—"}</div></div></div></div><div style="position:absolute;bottom:0;left:0;right:0;height:36px;background:#f8fafc;border-top:1px solid #e2e8f0;padding:0 16px;display:flex;justify-content:space-between;align-items:center"><div style="font-size:9px;color:#64748b;font-weight:800;font-family:monospace">${footerId}</div><div style="font-size:9px;color:#64748b;font-weight:800">VALID ${year}</div></div></div></div>`;
}
