import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { useEffect, useRef, useState } from "react";
import client from "@/lib/api/client";
import {
  ChevronLeft, Printer, Download, Users, Search,
  User, BookOpen, CheckSquare, Square, Briefcase, Award, GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Loader } from "@/components/ui/feedback/Loader";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

// ─── Helpers ────────────────────────────────────────────────────────────────

function subjectList(t: any, max = 3) {
  const arr = (t.subjects || []).slice(0, max).map((s: any) => s.name);
  return arr.length ? arr.join(" · ") : "—";
}
function classList(t: any, max = 2) {
  const arr = (t.classes || []).slice(0, max).map((c: any) => c.name);
  return arr.length ? arr.join(", ") : "—";
}

// ─── Templates ──────────────────────────────────────────────────────────────

function ClassicNavyCard({ t }: { t: any }) {
  return (
    <div style={{ width: 340, height: 214, fontFamily: "'Segoe UI', sans-serif", background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.12)", border: "1px solid #e5e7eb", position: "relative" }}>
      <div style={{ background: "linear-gradient(135deg,#1e3a8a,#2563eb)", padding: "10px 14px 8px", display: "flex", alignItems: "center", gap: 8 }}>
        {t.school?.schoolLogo
          ? <img src={t.school.schoolLogo} style={{ width: 28, height: 28, borderRadius: 6, objectFit: "contain", background: "#fff" }} />
          : <div style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}><GraduationCap size={16} color="#fff" /></div>}
        <div>
          <div style={{ color: "#fff", fontWeight: 900, fontSize: 11, letterSpacing: "0.04em", lineHeight: 1.2 }}>{t.school?.schoolName || "School Name"}</div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 8, letterSpacing: "0.1em", textTransform: "uppercase" }}>Faculty Identity Card</div>
        </div>
        <div style={{ marginLeft: "auto", background: "rgba(255,255,255,0.15)", borderRadius: 6, padding: "2px 8px" }}>
          <div style={{ color: "#fff", fontSize: 8, fontWeight: 700, letterSpacing: "0.05em" }}>2024–25</div>
        </div>
      </div>
      <div style={{ display: "flex", padding: "12px 14px", gap: 12 }}>
        <div style={{ flexShrink: 0 }}>
          <div style={{ width: 72, height: 84, borderRadius: 10, overflow: "hidden", border: "3px solid #1e3a8a", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {t.user?.profilePic ? <img src={t.user.profilePic} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <User size={32} color="#1e3a8a" />}
          </div>
          <div style={{ marginTop: 4, textAlign: "center", background: "#1e3a8a", color: "#fff", borderRadius: 4, padding: "2px 4px", fontSize: 8, fontWeight: 800 }}>FACULTY</div>
        </div>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: "#1e3a8a", lineHeight: 1.2, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.user?.name}</div>
          <div style={{ fontSize: 9, color: "#6b7280", marginBottom: 6 }}>Teaches: <b style={{ color: "#2563eb" }}>{subjectList(t)}</b></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {[
              { label: "Emp ID", value: t.employeeId || "—" },
              { label: "Classes", value: classList(t) },
              { label: "Phone", value: t.user?.phone || "—" },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", gap: 4, fontSize: 9 }}>
                <span style={{ color: "#9ca3af", width: 40, flexShrink: 0 }}>{item.label}:</span>
                <span style={{ color: "#374151", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ background: "#f8fafc", borderTop: "1px solid #e2e8f0", padding: "5px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 8, color: "#94a3b8", letterSpacing: "0.06em" }}>ID: {(t.id || "").slice(0, 8).toUpperCase()}</div>
        <div style={{ display: "flex", gap: 3 }}>{[0, 1, 2, 3, 4, 5, 6, 7].map(i => <div key={i} style={{ width: 3, height: 14, background: i % 2 === 0 ? "#1e3a8a" : "#93c5fd", borderRadius: 1 }} />)}</div>
        <div style={{ fontSize: 8, color: "#94a3b8" }}>VALID 2024–25</div>
      </div>
    </div>
  );
}

function ModernGoldCard({ t }: { t: any }) {
  return (
    <div style={{ width: 340, height: 214, fontFamily: "'Segoe UI', sans-serif", background: "linear-gradient(145deg,#0f172a,#1e293b)", borderRadius: 16, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.35)", position: "relative" }}>
      <div style={{ position: "absolute", top: -40, right: -40, width: 140, height: 140, borderRadius: "50%", background: "rgba(245,158,11,0.08)" }} />
      <div style={{ position: "absolute", bottom: -20, left: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(251,191,36,0.06)" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg,#f59e0b,#fbbf24,#f59e0b)" }} />
      <div style={{ padding: "14px 18px", height: "100%", display: "flex", flexDirection: "column", position: "relative", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div>
            <div style={{ color: "#f59e0b", fontSize: 8, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 2 }}>Faculty ID Card</div>
            <div style={{ color: "#f1f5f9", fontSize: 11, fontWeight: 900, letterSpacing: "0.02em" }}>{t.school?.schoolName || "School"}</div>
          </div>
          <div style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 8, padding: "3px 10px" }}>
            <div style={{ color: "#f59e0b", fontSize: 8, fontWeight: 800 }}>2024–25</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 14, flex: 1 }}>
          <div style={{ flexShrink: 0 }}>
            <div style={{ width: 68, height: 80, borderRadius: 12, overflow: "hidden", border: "2px solid #f59e0b", background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {t.user?.profilePic ? <img src={t.user.profilePic} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <User size={30} color="#f59e0b" />}
            </div>
            <div style={{ marginTop: 6, textAlign: "center", background: "#f59e0b", borderRadius: 4, padding: "2px 6px" }}>
              <div style={{ fontSize: 7, fontWeight: 900, color: "#0f172a", letterSpacing: "0.1em" }}>TEACHER</div>
            </div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 5 }}>
            <div style={{ color: "#f1f5f9", fontSize: 13, fontWeight: 900, lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.user?.name}</div>
            <div style={{ color: "#f59e0b", fontSize: 8.5, fontWeight: 700 }}>{subjectList(t, 2)}</div>
            {[
              { label: "Emp ID", val: t.employeeId || "—" },
              { label: "Classes", val: classList(t) },
              { label: "Contact", val: t.user?.phone || "—" },
            ].map(r => (
              <div key={r.label} style={{ display: "flex", gap: 6, fontSize: 8.5 }}>
                <span style={{ color: "#64748b", width: 40, flexShrink: 0 }}>{r.label}:</span>
                <span style={{ color: "#cbd5e1", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.val}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 7, display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
          <div style={{ fontSize: 7.5, color: "#475569" }}>ID: {(t.id || "").slice(0, 10).toUpperCase()}</div>
          <div style={{ display: "flex", gap: 2 }}>{[...Array(12)].map((_, i) => <div key={i} style={{ width: 2, height: i % 3 === 0 ? 12 : i % 2 === 0 ? 8 : 10, background: "#f59e0b", borderRadius: 1, opacity: 0.6 + (i % 3) * 0.13 }} />)}</div>
        </div>
      </div>
    </div>
  );
}

function GradientEmeraldCard({ t }: { t: any }) {
  return (
    <div style={{ width: 340, height: 214, fontFamily: "'Segoe UI', sans-serif", background: "linear-gradient(135deg,#047857 0%,#059669 55%,#10b981 100%)", borderRadius: 16, overflow: "hidden", boxShadow: "0 8px 32px rgba(5,150,105,0.35)", position: "relative" }}>
      <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
      <div style={{ position: "absolute", bottom: -20, left: 60, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
      <div style={{ padding: "13px 16px", height: "100%", display: "flex", flexDirection: "column", position: "relative", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 8, padding: 5 }}>
            {t.school?.schoolLogo ? <img src={t.school.schoolLogo} style={{ width: 20, height: 20, objectFit: "contain" }} /> : <GraduationCap size={14} color="#fff" />}
          </div>
          <div>
            <div style={{ color: "#fff", fontSize: 11, fontWeight: 900, letterSpacing: "0.02em" }}>{t.school?.schoolName || "School"}</div>
            <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 7.5, letterSpacing: "0.1em", textTransform: "uppercase" }}>Faculty Card · 2024–25</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, flex: 1 }}>
          <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
            <div style={{ width: 70, height: 82, borderRadius: 12, overflow: "hidden", border: "3px solid rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {t.user?.profilePic ? <img src={t.user.profilePic} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <User size={28} color="rgba(255,255,255,0.8)" />}
            </div>
            <div style={{ background: "rgba(255,255,255,0.25)", borderRadius: 20, padding: "2px 10px" }}>
              <span style={{ color: "#fff", fontSize: 7.5, fontWeight: 800, letterSpacing: "0.08em" }}>TEACHER</span>
            </div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 5 }}>
            <div style={{ color: "#fff", fontSize: 14, fontWeight: 900, lineHeight: 1.1, textShadow: "0 1px 3px rgba(0,0,0,0.15)" }}>{t.user?.name}</div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 8.5, fontWeight: 700, marginBottom: 2 }}>{subjectList(t, 2)}</div>
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: "5px 10px", display: "flex", flexDirection: "column", gap: 3 }}>
              {[
                { l: "Emp ID", v: t.employeeId || "—" },
                { l: "Classes", v: classList(t) },
                { l: "Phone", v: t.user?.phone || "—" },
              ].map(r => (
                <div key={r.l} style={{ display: "flex", fontSize: 8.5 }}>
                  <span style={{ color: "rgba(255,255,255,0.55)", width: 42, flexShrink: 0 }}>{r.l}:</span>
                  <span style={{ color: "#fff", fontWeight: 700 }}>{r.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: 6, marginTop: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 7.5, color: "rgba(255,255,255,0.5)" }}>ID: {(t.id || "").slice(0, 8).toUpperCase()}</div>
          <div style={{ fontSize: 7.5, color: "rgba(255,255,255,0.5)" }}>VALID: 2024–2025</div>
        </div>
      </div>
    </div>
  );
}

function MinimalRedCard({ t }: { t: any }) {
  return (
    <div style={{ width: 340, height: 214, fontFamily: "'Segoe UI', sans-serif", background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.09)", border: "1.5px solid #fecaca", position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: 5, height: "100%", background: "linear-gradient(180deg,#dc2626,#ef4444)" }} />
      <div style={{ padding: "14px 16px 12px 20px", height: "100%", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 8, color: "#dc2626", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 1 }}>Faculty Identity Card</div>
            <div style={{ fontSize: 11.5, color: "#0f172a", fontWeight: 900, letterSpacing: "0.01em" }}>{t.school?.schoolName || "School"}</div>
          </div>
          {t.school?.schoolLogo
            ? <img src={t.school.schoolLogo} style={{ width: 32, height: 32, objectFit: "contain" }} />
            : <div style={{ width: 32, height: 32, borderRadius: 8, border: "1.5px solid #fecaca", display: "flex", alignItems: "center", justifyContent: "center" }}><GraduationCap size={16} color="#dc2626" /></div>}
        </div>
        <div style={{ height: 1, background: "linear-gradient(90deg,#dc2626,transparent)", marginBottom: 9 }} />
        <div style={{ display: "flex", gap: 14, flex: 1 }}>
          <div style={{ flexShrink: 0 }}>
            <div style={{ width: 68, height: 80, borderRadius: 8, overflow: "hidden", border: "2px solid #fecaca", background: "#fff5f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {t.user?.profilePic ? <img src={t.user.profilePic} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <User size={28} color="#dc2626" />}
            </div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#0f172a", lineHeight: 1.2, marginBottom: 1 }}>{t.user?.name}</div>
              <div style={{ fontSize: 8.5, color: "#dc2626", fontWeight: 700, marginBottom: 6 }}>{subjectList(t, 2)}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px 8px" }}>
              {[
                { l: "Emp ID", v: t.employeeId || "—" },
                { l: "Session", v: "2024–25" },
                { l: "Classes", v: classList(t) },
                { l: "Phone", v: t.user?.phone || "—" },
              ].map(r => (
                <div key={r.l} style={{ fontSize: 8.5 }}>
                  <div style={{ color: "#94a3b8", fontSize: 7.5, lineHeight: 1 }}>{r.l}</div>
                  <div style={{ color: "#334155", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 7.5, color: "#94a3b8" }}>ID: {(t.id || "").slice(0, 10).toUpperCase()}</div>
          <div style={{ display: "flex", gap: 2 }}>{[...Array(10)].map((_, i) => <div key={i} style={{ width: 3, height: i % 2 === 0 ? 10 : 14, background: "#dc2626", opacity: 0.4 + (i % 3) * 0.2, borderRadius: 1 }} />)}</div>
        </div>
      </div>
    </div>
  );
}

function ExecutivePurpleCard({ t }: { t: any }) {
  return (
    <div style={{ width: 340, height: 214, fontFamily: "'Segoe UI', sans-serif", background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 4px 24px rgba(124,58,237,0.18)", border: "1.5px solid #ede9fe", position: "relative" }}>
      <div style={{ background: "linear-gradient(135deg,#6d28d9,#7c3aed)", padding: "9px 14px", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 7, padding: 4 }}>
          {t.school?.schoolLogo ? <img src={t.school.schoolLogo} style={{ width: 20, height: 20, objectFit: "contain" }} /> : <GraduationCap size={14} color="#fff" />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#fff", fontSize: 11, fontWeight: 900, letterSpacing: "0.02em" }}>{t.school?.schoolName || "School Name"}</div>
          <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 7.5, letterSpacing: "0.1em", textTransform: "uppercase" }}>Faculty Identity Card</div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.18)", borderRadius: 6, padding: "2px 8px" }}>
          <div style={{ color: "#fff", fontSize: 7.5, fontWeight: 800 }}>2024–25</div>
        </div>
      </div>
      <div style={{ padding: "10px 14px", display: "flex", gap: 12 }}>
        <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ width: 72, height: 84, borderRadius: 10, overflow: "hidden", border: "3px solid #7c3aed", background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {t.user?.profilePic ? <img src={t.user.profilePic} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <User size={30} color="#6d28d9" />}
          </div>
          <div style={{ background: "#6d28d9", borderRadius: 4, padding: "2px 7px" }}>
            <div style={{ color: "#fff", fontSize: 7.5, fontWeight: 900, letterSpacing: "0.06em" }}>TEACHER</div>
          </div>
        </div>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: "#3b0764", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 1 }}>{t.user?.name}</div>
          <div style={{ fontSize: 8.5, color: "#7c3aed", fontWeight: 800, marginBottom: 6, letterSpacing: "0.04em" }}>{subjectList(t, 2)}</div>
          <div style={{ background: "#faf5ff", border: "1px solid #ede9fe", borderRadius: 8, padding: "6px 10px", display: "flex", flexDirection: "column", gap: 4 }}>
            {[
              { l: "Employee ID", v: t.employeeId || "—" },
              { l: "Classes", v: classList(t) },
              { l: "Contact", v: t.user?.phone || "—" },
            ].map(r => (
              <div key={r.l} style={{ display: "flex", gap: 5, fontSize: 8.5 }}>
                <span style={{ color: "#c4b5fd", width: 68, flexShrink: 0 }}>{r.l}:</span>
                <span style={{ color: "#4c1d95", fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ background: "#faf5ff", borderTop: "1px solid #ede9fe", padding: "4px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 7.5, color: "#c4b5fd" }}>ID: {(t.id || "").slice(0, 8).toUpperCase()}</div>
        <div style={{ display: "flex", gap: 2 }}>{[...Array(10)].map((_, i) => <div key={i} style={{ width: 3, height: i % 2 === 0 ? 10 : 14, background: "#7c3aed", opacity: 0.5 + (i % 3) * 0.17, borderRadius: 1 }} />)}</div>
        <div style={{ fontSize: 7.5, color: "#c4b5fd" }}>VALID 2024–25</div>
      </div>
    </div>
  );
}

const TEMPLATES = [
  { id: "navy", label: "Classic Navy", Component: ClassicNavyCard, dot: "bg-blue-800" },
  { id: "gold", label: "Modern Gold", Component: ModernGoldCard, dot: "bg-amber-500" },
  { id: "emerald", label: "Gradient Emerald", Component: GradientEmeraldCard, dot: "bg-emerald-500" },
  { id: "red", label: "Minimal Red", Component: MinimalRedCard, dot: "bg-red-500" },
  { id: "purple", label: "Executive Violet", Component: ExecutivePurpleCard, dot: "bg-violet-600" },
];

// ─── Pure-HTML builder for bulk print ────────────────────────────────────────

function buildCardHtml(t: any, templateId: string): string {
  const name = t.user?.name || "";
  const school = t.school?.schoolName || "School";
  const logo = t.school?.schoolLogo || "";
  const photo = t.user?.profilePic || "";
  const phone = t.user?.phone || "—";
  const empId = t.employeeId || "—";
  const subjects = subjectList(t);
  const classes = classList(t);
  const shortId = (t.id || "").slice(0, 8).toUpperCase();
  const bars = Array.from({ length: 8 }, (_, i) => `<div style="width:3px;height:14px;background:${i % 2 === 0 ? "#1e3a8a" : "#93c5fd"};border-radius:1px;display:inline-block;margin:0 1px"></div>`).join("");
  const photoEl = photo ? `<img src="${photo}" style="width:100%;height:100%;object-fit:cover">` : `<div style="color:#999;font-size:10px">No Photo</div>`;
  const logoEl = logo ? `<img src="${logo}" style="width:20px;height:20px;object-fit:contain">` : "";

  const templates: Record<string, string> = {
    navy: `<div style="width:340px;height:214px;font-family:'Segoe UI',sans-serif;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;position:relative">
      <div style="background:linear-gradient(135deg,#1e3a8a,#2563eb);padding:10px 14px 8px;display:flex;align-items:center;gap:8px">
        <div style="width:28px;height:28px;border-radius:6px;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center">${logoEl}</div>
        <div><div style="color:#fff;font-weight:900;font-size:11px">${school}</div><div style="color:rgba(255,255,255,0.7);font-size:8px;letter-spacing:0.1em;text-transform:uppercase">Faculty Identity Card</div></div>
        <div style="margin-left:auto;background:rgba(255,255,255,0.15);border-radius:6px;padding:2px 8px"><div style="color:#fff;font-size:8px;font-weight:700">2024–25</div></div>
      </div>
      <div style="display:flex;padding:12px 14px;gap:12px">
        <div><div style="width:72px;height:84px;border-radius:10px;overflow:hidden;border:3px solid #1e3a8a;background:#eff6ff;display:flex;align-items:center;justify-content:center">${photoEl}</div>
        <div style="margin-top:4px;text-align:center;background:#1e3a8a;color:#fff;border-radius:4px;padding:2px 4px;font-size:8px;font-weight:800">FACULTY</div></div>
        <div style="flex:1;overflow:hidden">
          <div style="font-size:13px;font-weight:900;color:#1e3a8a;line-height:1.2;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${name}</div>
          <div style="font-size:9px;color:#6b7280;margin-bottom:6px">Teaches: <b style="color:#2563eb">${subjects}</b></div>
          <div style="font-size:9px;display:flex;flex-direction:column;gap:4px">
            <div><span style="color:#9ca3af;width:40px;display:inline-block">Emp ID:</span><b style="color:#374151">${empId}</b></div>
            <div><span style="color:#9ca3af;width:40px;display:inline-block">Classes:</span><b style="color:#374151">${classes}</b></div>
            <div><span style="color:#9ca3af;width:40px;display:inline-block">Phone:</span><b style="color:#374151">${phone}</b></div>
          </div>
        </div>
      </div>
      <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:5px 14px;display:flex;justify-content:space-between;align-items:center">
        <div style="font-size:8px;color:#94a3b8">ID: ${shortId}</div>
        <div>${bars}</div>
        <div style="font-size:8px;color:#94a3b8">VALID 2024–25</div>
      </div>
    </div>`,
  };

  return `<div class="card-wrap">${templates[templateId] || templates.navy}</div>`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TeacherIdCardsPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("navy");
  const [previewTeacher, setPreviewTeacher] = useState<any>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    setLoading(true);
    try {
      const r = await client.get("/v1/admin/id-cards/teachers");
      setTeachers(r.data);
      setPreviewTeacher(r.data[0] || null);
    } catch { toast.error("Failed to load teachers"); }
    finally { setLoading(false); }
  };

  const Template = TEMPLATES.find(t => t.id === selectedTemplate)!.Component;

  const toggleSelect = (id: string) => setSelected(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const toggleAll = () => {
    if (selected.size === filteredTeachers.length) setSelected(new Set());
    else setSelected(new Set(filteredTeachers.map(t => t.id)));
  };

  const filteredTeachers = teachers.filter(t =>
    t.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    (t.employeeId || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleBulkPrint = () => {
    const toPrint = selected.size > 0 ? teachers.filter(t => selected.has(t.id)) : filteredTeachers;
    if (!toPrint.length) return toast.error("No teachers to print");
    const printWindow = window.open("", "_blank")!;
    if (!printWindow) return;
    const htmlCards = toPrint.map(t => buildCardHtml(t, selectedTemplate)).join("");
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

  return (
    <>
      <Head>
        <title>Teacher ID Cards | Admin | LearnXChain</title>
        <style>{`@media print{body *{visibility:hidden}.print-area,.print-area *{visibility:visible}.print-area{position:fixed;top:0;left:0;width:100%}}`}</style>
      </Head>
      <DashboardLayout role="admin">
        <div className="space-y-6 pb-12">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/admin/teachers">
                <button className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                  <ChevronLeft className="h-5 w-5 text-gray-500" />
                </button>
              </Link>
              <div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white">Teacher ID Cards</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Generate professional identity cards for faculty</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleExportPDF} disabled={!previewTeacher}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-all shadow-sm">
                <Download className="h-4 w-4" /> Export PDF
              </button>
              <button onClick={handleBulkPrint} disabled={!teachers.length}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-40 transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20">
                <Printer className="h-4 w-4" />
                {selected.size > 0 ? `Print ${selected.size} Cards` : "Print All"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Panel */}
            <div className="lg:col-span-1 space-y-4">
              {/* Template selector */}
              <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-gray-900 p-5 shadow-sm">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 block">Card Template</label>
                <div className="space-y-2">
                  {TEMPLATES.map(tmpl => (
                    <button key={tmpl.id} onClick={() => setSelectedTemplate(tmpl.id)}
                      className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all border ${selectedTemplate === tmpl.id
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                        : "border-transparent hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400"}`}>
                      <div className={`h-5 w-5 rounded-full flex-shrink-0 ${tmpl.dot}`} />
                      {tmpl.label}
                      {selectedTemplate === tmpl.id && <CheckSquare className="h-4 w-4 ml-auto text-indigo-500" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Teacher list */}
              {loading ? (
                <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-gray-900 p-6 flex items-center justify-center">
                  <Loader size="md" />
                </div>
              ) : (
                <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-50 dark:border-white/5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{teachers.length} Teachers</span>
                      <button onClick={toggleAll} className="text-xs font-bold text-indigo-600 hover:text-indigo-500">
                        {selected.size === filteredTeachers.length && filteredTeachers.length > 0 ? "Deselect All" : "Select All"}
                      </button>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
                        className="w-full h-8 pl-8 pr-3 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-gray-800 dark:text-white text-xs focus:outline-none" />
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-white/5">
                    {filteredTeachers.length === 0 && (
                      <div className="p-6 text-center text-xs text-gray-400 font-medium">No teachers found</div>
                    )}
                    {filteredTeachers.map(t => (
                      <div key={t.id}
                        className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${previewTeacher?.id === t.id ? "bg-indigo-50 dark:bg-indigo-900/20" : ""}`}
                        onClick={() => setPreviewTeacher(t)}>
                        <div onClick={e => { e.stopPropagation(); toggleSelect(t.id); }}
                          className={`h-4 w-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${selected.has(t.id) ? "bg-indigo-600 border-indigo-600" : "border-gray-300 dark:border-white/20"}`}>
                          {selected.has(t.id) && <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
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

            {/* Preview Panel */}
            <div className="lg:col-span-3">
              <div className="rounded-3xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-gray-950 p-8 min-h-[500px] flex flex-col items-center justify-center gap-8">
                {!previewTeacher && !loading ? (
                  <div className="text-center space-y-3">
                    <div className="h-20 w-20 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 mx-auto flex items-center justify-center shadow-lg">
                      <Users className="h-8 w-8 text-gray-300" />
                    </div>
                    <p className="text-gray-400 font-bold">No teachers found. Add teachers first.</p>
                  </div>
                ) : previewTeacher && (
                  <>
                    {/* Single preview */}
                    <div className="text-center space-y-2">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Preview: {previewTeacher.user?.name}</p>
                      <div id="teacher-card-preview">
                        <Template t={previewTeacher} />
                      </div>
                    </div>

                    {/* Thumbnail grid */}
                    {teachers.length > 1 && (
                      <div className="w-full">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 text-center">All Cards Preview</p>
                        <div className="flex flex-wrap gap-4 max-h-96 overflow-y-auto justify-center">
                          {filteredTeachers.map(t => (
                            <div key={t.id}
                              onClick={() => setPreviewTeacher(t)}
                              className={`cursor-pointer transition-all rounded-xl overflow-hidden flex-shrink-0 ${previewTeacher?.id === t.id ? "ring-2 ring-indigo-500" : "hover:ring-2 hover:ring-gray-300"}`}
                              style={{ width: 176, height: 111 }}>
                              <div style={{ transform: "scale(0.517)", transformOrigin: "top left", width: 340, height: 214, pointerEvents: "none" }}>
                                <Template t={t} />
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

          {/* Stats bar */}
          {teachers.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Faculty", value: teachers.length, icon: Users, color: "text-indigo-600" },
                { label: "Selected", value: selected.size, icon: CheckSquare, color: "text-emerald-600" },
                { label: "With Photo", value: teachers.filter(t => t.user?.profilePic).length, icon: User, color: "text-amber-600" },
                { label: "Subjects", value: [...new Set(teachers.flatMap(t => (t.subjects || []).map((s: any) => s.name)))].length, icon: BookOpen, color: "text-violet-600" },
              ].map(s => (
                <div key={s.label} className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-gray-900 p-4 flex items-center gap-4 shadow-sm">
                  <div className={`h-10 w-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center ${s.color}`}>
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xl font-black text-gray-900 dark:text-white">{s.value}</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
