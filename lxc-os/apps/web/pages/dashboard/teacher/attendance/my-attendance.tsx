import Head from "next/head";
import { useEffect, useRef, useState, useCallback } from "react";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import client from "@/lib/api/client";
import {
    Calendar, CheckCircle2, XCircle, AlertCircle,
    ChevronLeft, ChevronRight, Camera, MapPin, ScanFace, X,
    Zap, ShieldCheck, TriangleAlert, LockKeyhole
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Loader } from "@/components/ui/feedback/Loader";
import { toast } from "react-toastify";
import { formatISTDateKey, getISTNowParts } from "@/lib/utils/date-utils";

interface AttendanceDay {
    date: string;
    status: string;
    type: string;
    matched: boolean;
    selfieImageUrl: string | null;
    latitude: number | null;
    longitude: number | null;
    verificationLatencyMs: number | null;
}

interface MonthlyAttendance {
    month: number;
    year: number;
    calendar: AttendanceDay[];
    summary: { totalDays: number; presentDays: number; absentDays: number; halfDays: number; attendancePercentage: number };
}

interface AttendanceStatus {
    markedToday: boolean;
    attemptsUsed: number;
    attemptsRemaining: number;
    maxAttempts: number;
    isLocked: boolean;
}

export default function TeacherMyAttendancePage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<MonthlyAttendance | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [attStatus, setAttStatus] = useState<AttendanceStatus | null>(null);

    const [showModal, setShowModal] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [geoStatus, setGeoStatus] = useState<"acquiring" | "ok" | "error">("acquiring");
    const [geoCoords, setGeoCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [marking, setMarking] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const countdownRef = useRef<NodeJS.Timeout | null>(null);

    const today = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    const isCurrentMonth =
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getFullYear() === today.getFullYear();

    // Fetch monthly attendance data
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await client.get(`/v1/attendance/my-attendance?month=${month}&year=${year}`);
            setData(res.data);
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to load attendance data");
        } finally {
            setLoading(false);
        }
    }, [month, year]);

    // Fetch today's attempt status
    const fetchStatus = useCallback(async () => {
        try {
            const res = await client.get("/v1/attendance/status");
            setAttStatus(res.data);
        } catch { /* non-fatal */ }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);
    useEffect(() => { if (isCurrentMonth) fetchStatus(); }, [isCurrentMonth, fetchStatus]);
    useEffect(() => () => { if (countdownRef.current) clearTimeout(countdownRef.current); }, []);

    const navigateMonth = (dir: "prev" | "next") =>
        setCurrentDate(prev => { const d = new Date(prev); d.setMonth(dir === "prev" ? prev.getMonth() - 1 : prev.getMonth() + 1); return d; });

    // ─── Modal ────────────────────────────────────────────────────────────────
    const openModal = () => {
        setShowModal(true);
        setGeoStatus("acquiring");
        setGeoCoords(null);
        setCountdown(null);

        navigator.geolocation?.getCurrentPosition(
            pos => { setGeoCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setGeoStatus("ok"); },
            () => setGeoStatus("error"),
            { timeout: 8000, maximumAge: 30000 }
        );

        navigator.mediaDevices
            .getUserMedia({ video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }, audio: false })
            .then(ms => {
                setStream(ms);
                if (videoRef.current) { videoRef.current.srcObject = ms; videoRef.current.play().catch(() => { }); }
            })
            .catch(() => toast.error("Could not access camera — please allow camera permission."));
    };

    const closeModal = () => {
        if (countdownRef.current) { clearTimeout(countdownRef.current); countdownRef.current = null; }
        stream?.getTracks().forEach(t => t.stop());
        setStream(null);
        setShowModal(false);
        setCountdown(null);
    };

    const startCountdown = () => {
        if (!stream) { toast.error("Camera not ready. Please reopen the modal."); return; }
        setCountdown(3);
    };

    useEffect(() => {
        if (countdown === null) return;
        if (countdown > 0) {
            countdownRef.current = setTimeout(() => setCountdown(c => (c ?? 0) - 1), 1000);
        } else {
            captureAndMark();
        }
        return () => { if (countdownRef.current) clearTimeout(countdownRef.current); };
    }, [countdown]);

    const captureAndMark = async () => {
        setCountdown(null);
        if (!canvasRef.current || !videoRef.current) return;
        await new Promise(r => requestAnimationFrame(r));
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;

        canvasRef.current.width = videoRef.current.videoWidth || 640;
        canvasRef.current.height = videoRef.current.videoHeight || 480;
        ctx.drawImage(videoRef.current, 0, 0);

        // Brightness guard
        const sample = ctx.getImageData(0, 0, Math.min(80, canvasRef.current.width), Math.min(80, canvasRef.current.height));
        const avg = sample.data.reduce((s, v, i) => i % 4 === 3 ? s : s + v, 0) / (sample.data.length * 0.75);
        if (avg < 8) { toast.error("Camera frame is too dark. Try in better lighting."); return; }

        const selfieBase64 = canvasRef.current.toDataURL("image/jpeg", 0.92);
        setMarking(true);
        try {
            const res = await fetch("/api/v1/attendance/mark", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ selfieBase64, latitude: geoCoords?.lat ?? 0, longitude: geoCoords?.lng ?? 0 }),
            });
            const json = await res.json();

            if (res.status === 409) { toast.info("ℹ️ Attendance already marked for today."); closeModal(); return; }
            if (res.status === 429) { toast.error(`🔒 ${json.message}`); closeModal(); await fetchStatus(); return; }
            if (!res.ok) throw new Error(json.message || "Failed");

            toast.success(`✅ Attendance marked! Verified in ${json.verificationLatencyMs}ms`);
            closeModal();
            await Promise.all([fetchData(), fetchStatus()]);
        } catch (err: any) {
            await fetchStatus(); // refresh attempt counter after every failure
            const msg = err.message || "Failed to mark attendance";
            if (msg.toLowerCase().includes("no face")) toast.error("😕 No face detected — centre your face, good lighting, look straight.");
            else if (msg.toLowerCase().includes("face verification")) toast.error(`❌ ${msg}`);
            else if (msg.toLowerCase().includes("200m") || msg.toLowerCase().includes("premises")) toast.error("📍 You must be within 200m of your registered location.");
            else if (msg.toLowerCase().includes("timed out")) toast.error("⏱️ AI service timed out. Try again.");
            else if (msg.toLowerCase().includes("offline")) toast.error("🔴 AI face service is offline. Contact your admin.");
            else toast.error(msg);
        } finally {
            setMarking(false);
        }
    };

    // ─── Calendar helpers ──────────────────────────────────────────────────────
    const getDaysInMonth = (date: Date) => {
        const y = date.getFullYear(), m = date.getMonth();
        const firstDay = new Date(y, m, 1);
        const lastDay = new Date(y, m + 1, 0);
        const days: (Date | null)[] = [];
        for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
        for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(y, m, d));
        return days;
    };

    const getAttendanceForDate = (date: Date): AttendanceDay | null => {
        if (!data) return null;
        const key = formatISTDateKey(date);
        return data.calendar.find(r => formatISTDateKey(new Date(r.date)) === key) || null;
    };

    const getStatusColor = (status: string) => {
        if (status === "PRESENT") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800";
        if (status === "ABSENT") return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-300 dark:border-red-800";
        return "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500 border-gray-300 dark:border-gray-700";
    };

    const days = getDaysInMonth(currentDate);
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const todayAlreadyMarked =
        attStatus?.markedToday ??
        (isCurrentMonth &&
            !!data?.calendar.some(r => formatISTDateKey(new Date(r.date)) === formatISTDateKey(today)));
    const isLocked = attStatus?.isLocked ?? false;
    const btnDisabled = !isCurrentMonth || todayAlreadyMarked || isLocked;

    // Attempt bar colour
    const attemptColor = !attStatus ? "bg-emerald-500" :
        attStatus.attemptsRemaining <= 1 ? "bg-red-500" :
            attStatus.attemptsRemaining <= 2 ? "bg-amber-500" : "bg-emerald-500";

    if (loading) return (
        <DashboardLayout role="teacher">
            <div className="flex h-[60vh] items-center justify-center"><Loader size="lg" /></div>
        </DashboardLayout>
    );

    return (
        <>
            <Head><title>My Attendance - Teacher Dashboard</title></Head>
            <DashboardLayout role="teacher">
                <div className="w-full mx-auto space-y-6 pb-8">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">My Attendance</h1>
                            <p className="text-sm text-gray-500 font-medium mt-1">Biometric face verification · 200m geo-fence · Daily record</p>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                            {/* Month navigator */}
                            <div className="flex items-center gap-2">
                                <button onClick={() => navigateMonth("prev")} className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                                    <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                </button>
                                <div className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10">
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                                </div>
                                <button onClick={() => navigateMonth("next")} className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                                    <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                </button>
                            </div>

                            {/* Mark Attendance button */}
                            <button
                                onClick={btnDisabled ? undefined : openModal}
                                disabled={btnDisabled}
                                title={!isCurrentMonth ? "Navigate to current month" : isLocked ? "Locked — too many failed attempts today" : undefined}
                                className={cn(
                                    "flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg",
                                    todayAlreadyMarked ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 cursor-not-allowed"
                                        : isLocked ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 cursor-not-allowed shadow-none"
                                            : !isCurrentMonth ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed shadow-none"
                                                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30 hover:scale-105"
                                )}
                            >
                                {isLocked ? <><LockKeyhole className="h-4 w-4" /> Locked Today</>
                                    : todayAlreadyMarked ? <><CheckCircle2 className="h-4 w-4" /> Already Marked</>
                                        : !isCurrentMonth ? <><Calendar className="h-4 w-4" /> Current Month Only</>
                                            : <><ScanFace className="h-4 w-4" /> Mark Attendance</>}
                            </button>
                        </div>
                    </div>

                    {/* Today's attempt status banner — only on current month */}
                    {isCurrentMonth && attStatus && !attStatus.markedToday && (
                        <div className={cn(
                            "rounded-2xl border p-4",
                            attStatus.isLocked
                                ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/30"
                                : attStatus.attemptsRemaining <= 2
                                    ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/30"
                                    : "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/30"
                        )}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    {attStatus.isLocked
                                        ? <LockKeyhole className="h-4 w-4 text-red-600 dark:text-red-400" />
                                        : attStatus.attemptsRemaining <= 2
                                            ? <TriangleAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                            : <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                    }
                                    <span className={cn("text-sm font-bold",
                                        attStatus.isLocked ? "text-red-700 dark:text-red-400"
                                            : attStatus.attemptsRemaining <= 2 ? "text-amber-700 dark:text-amber-400"
                                                : "text-indigo-700 dark:text-indigo-400"
                                    )}>
                                        {attStatus.isLocked
                                            ? `🔒 Account locked — too many failed attempts today. Resets at midnight.`
                                            : `${attStatus.attemptsRemaining} verification attempt${attStatus.attemptsRemaining !== 1 ? "s" : ""} remaining today`}
                                    </span>
                                </div>
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                                    {attStatus.attemptsUsed} / {attStatus.maxAttempts} used
                                </span>
                            </div>
                            {/* Attempt bar */}
                            <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                <div
                                    className={cn("h-full rounded-full transition-all duration-500", attemptColor)}
                                    style={{ width: `${(attStatus.attemptsRemaining / attStatus.maxAttempts) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Already marked banner */}
                    {isCurrentMonth && attStatus?.markedToday && (
                        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/30 bg-emerald-50 dark:bg-emerald-900/20 p-4 flex items-center gap-3">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <div>
                                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Attendance marked for today ✓</p>
                                <p className="text-xs text-emerald-600/70 dark:text-emerald-500">Your face was verified and location confirmed within 200m.</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30">
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Stat Cards */}
                    {data && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: "Present Days", value: data.summary.presentDays, icon: <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />, bg: "bg-emerald-100 dark:bg-emerald-900/30" },
                                { label: "Absent Days", value: data.summary.absentDays, icon: <XCircle className="h-5 w-5 text-red-500 dark:text-red-400" />, bg: "bg-red-100 dark:bg-red-900/30" },
                                { label: "Half Days", value: data.summary.halfDays, icon: <AlertCircle className="h-5 w-5 text-amber-500 dark:text-amber-400" />, bg: "bg-amber-100 dark:bg-amber-900/30" },
                                { label: "Attendance %", value: `${data.summary.attendancePercentage}%`, icon: <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />, bg: "bg-indigo-100 dark:bg-indigo-900/30" },
                            ].map(card => (
                                <div key={card.label} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">{card.label}</p>
                                            <p className="text-2xl font-black text-gray-900 dark:text-white">{card.value}</p>
                                        </div>
                                        <div className={cn("p-3 rounded-xl", card.bg)}>{card.icon}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Calendar */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl p-6">
                        <div className="grid grid-cols-7 gap-2 mb-4">
                            {weekDays.map(d => <div key={d} className="text-center text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 py-2">{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                            {days.map((date, idx) => {
                                if (!date) return <div key={idx} className="aspect-square" />;
                                const att = getAttendanceForDate(date);
                                const isToday = date.toDateString() === today.toDateString();
                                const isPast = date < today && !isToday;
                                const isSel = selectedDate?.toDateString() === date.toDateString();
                                return (
                                    <div key={date.toISOString()} onClick={() => setSelectedDate(date)}
                                        className={cn(
                                            "aspect-square rounded-xl border-2 p-2 cursor-pointer transition-all hover:scale-105",
                                            isToday && "ring-2 ring-indigo-500 ring-offset-2",
                                            isSel && "ring-2 ring-indigo-300 dark:ring-indigo-600",
                                            att ? getStatusColor(att.status)
                                                : isPast ? "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                                                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                                        )}>
                                        <div className="flex flex-col h-full">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className={cn("text-sm font-bold",
                                                    isToday && "text-indigo-600 dark:text-indigo-400",
                                                    !isToday && att && "text-current",
                                                    !isToday && !att && "text-gray-400 dark:text-gray-500"
                                                )}>{date.getDate()}</span>
                                                {att && <div className="text-xs">{att.status === "PRESENT" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}</div>}
                                            </div>
                                            {att && <div className="text-[9px] font-bold uppercase mt-auto hidden md:block opacity-70">{att.type === "HALF_DAY" ? "Half" : att.status}</div>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Selected Date Detail */}
                    {selectedDate && (() => {
                        const att = getAttendanceForDate(selectedDate);
                        return (
                            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                    {selectedDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                                </h3>
                                {!att ? (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                        <p className="font-semibold">No attendance record for this date</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Status</h4>
                                            <div className="space-y-2">
                                                {[
                                                    { label: "Attendance", value: att.status, chip: getStatusColor(att.status) },
                                                    { label: "Type", plain: att.type?.replace("_", " ") },
                                                    { label: "Face Match", value: att.matched ? "✓ Verified" : "✗ Failed", chip: att.matched ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700" },
                                                ].map(row => (
                                                    <div key={row.label} className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                                                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{row.label}</span>
                                                        {row.plain ? <span className="text-sm font-bold text-gray-900 dark:text-white">{row.plain}</span>
                                                            : <span className={cn("text-xs font-bold px-2 py-1 rounded-lg", row.chip)}>{row.value}</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Verification</h4>
                                            <div className="space-y-2">
                                                {att.verificationLatencyMs != null && (
                                                    <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                                                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1"><Zap className="h-3.5 w-3.5" /> AI Latency</span>
                                                        <span className={cn("text-xs font-bold px-2 py-1 rounded-lg",
                                                            att.verificationLatencyMs < 3000 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                                                        )}>{att.verificationLatencyMs}ms</span>
                                                    </div>
                                                )}
                                                {att.latitude && att.longitude && (
                                                    <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
                                                        <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                                                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                                                            {Number(att.latitude).toFixed(5)}, {Number(att.longitude).toFixed(5)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Selfie</h4>
                                            {att.selfieImageUrl
                                                ? <img src={att.selfieImageUrl} alt="Selfie" className="rounded-2xl w-full aspect-square object-cover border-2 border-gray-200 dark:border-white/10" />
                                                : <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-400">No selfie stored</div>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })()}

                    {/* Bottom Stats */}
                    {data && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: "Total Recorded", value: data.summary.totalDays },
                                { label: "Present", value: data.summary.presentDays },
                                { label: "Absent", value: data.summary.absentDays },
                                { label: "Half Days", value: data.summary.halfDays },
                            ].map(s => (
                                <div key={s.label} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl p-4">
                                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">{s.label}</p>
                                    <p className="text-xl font-black text-gray-900 dark:text-white">{s.value}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ─── Mark Attendance Modal ─── */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                                        <ShieldCheck className="h-5 w-5 text-indigo-500" /> Mark Attendance
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-0.5">Biometric face scan · 200m geo-fence</p>
                                </div>
                                <button onClick={closeModal} disabled={marking} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                {/* Attempts Remaining — IN MODAL */}
                                {attStatus && !attStatus.isLocked && (
                                    <div className={cn(
                                        "rounded-xl p-3 flex items-center justify-between",
                                        attStatus.attemptsRemaining <= 1 ? "bg-red-50 dark:bg-red-900/20"
                                            : attStatus.attemptsRemaining <= 2 ? "bg-amber-50 dark:bg-amber-900/20"
                                                : "bg-indigo-50 dark:bg-indigo-900/20"
                                    )}>
                                        <span className={cn("text-xs font-bold flex items-center gap-1.5",
                                            attStatus.attemptsRemaining <= 1 ? "text-red-700 dark:text-red-400"
                                                : attStatus.attemptsRemaining <= 2 ? "text-amber-700 dark:text-amber-400"
                                                    : "text-indigo-700 dark:text-indigo-400"
                                        )}>
                                            {attStatus.attemptsRemaining <= 2 && <TriangleAlert className="h-3.5 w-3.5" />}
                                            {attStatus.attemptsRemaining} attempt{attStatus.attemptsRemaining !== 1 ? "s" : ""} remaining today
                                        </span>
                                        {/* Mini progress dots */}
                                        <div className="flex gap-1">
                                            {Array.from({ length: attStatus.maxAttempts }).map((_, i) => (
                                                <div key={i} className={cn("w-2 h-2 rounded-full",
                                                    i < attStatus.attemptsRemaining
                                                        ? attStatus.attemptsRemaining <= 1 ? "bg-red-500"
                                                            : attStatus.attemptsRemaining <= 2 ? "bg-amber-500" : "bg-indigo-500"
                                                        : "bg-gray-300 dark:bg-gray-600"
                                                )} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Camera feed */}
                                <div className="relative rounded-2xl overflow-hidden bg-black aspect-video w-full">
                                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                                    <canvas ref={canvasRef} className="hidden" />
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className={cn(
                                            "w-40 h-48 rounded-full border-4 border-dashed transition-colors duration-300",
                                            countdown !== null ? "border-yellow-400 animate-pulse" : "border-white/60"
                                        )} />
                                    </div>
                                    {countdown !== null && countdown > 0 && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <span className="text-white text-8xl font-black drop-shadow-2xl select-none">{countdown}</span>
                                        </div>
                                    )}
                                    {countdown === 0 && <div className="absolute inset-0 bg-white/20 pointer-events-none" />}
                                </div>

                                {/* Tips */}
                                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-xs text-amber-700 dark:text-amber-400 font-medium flex gap-2">
                                    <span>💡</span>
                                    <span>Centre your face in the oval · Good lighting · Look straight · Hold still during countdown</span>
                                </div>

                                {/* Geo status */}
                                <div className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold",
                                    geoStatus === "ok" ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                                        : geoStatus === "error" ? "bg-red-50 dark:bg-red-900/20 text-red-600"
                                            : "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                                )}>
                                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                                    {geoStatus === "ok" && geoCoords ? `📍 ${geoCoords.lat.toFixed(5)}, ${geoCoords.lng.toFixed(5)}`
                                        : geoStatus === "error" ? "⚠️ Location unavailable — attendance may be rejected"
                                            : "Acquiring your location..."}
                                </div>

                                {/* Capture button */}
                                <button
                                    onClick={startCountdown}
                                    disabled={marking || countdown !== null}
                                    className={cn(
                                        "w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm transition-all",
                                        marking || countdown !== null
                                            ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                                            : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 hover:scale-[1.02]"
                                    )}
                                >
                                    {marking ? <><Loader variant="white" /><span>Verifying face...</span></>
                                        : countdown !== null ? <span>Capturing in {countdown}...</span>
                                            : <><Camera className="h-4 w-4" /><span>Capture &amp; Verify</span></>}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </DashboardLayout>
        </>
    );
}
