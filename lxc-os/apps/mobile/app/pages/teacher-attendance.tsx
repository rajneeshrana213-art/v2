import { useState, useCallback, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    RefreshControl,
    ActivityIndicator,
    Alert,
    Image,
    Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
    FadeInDown,
    FadeInUp,
    FadeInRight,
    Layout,
} from "react-native-reanimated";
import { router } from "expo-router";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";
import { TeacherBottomNav } from "@/components/TeacherBottomNav";
import { format } from "date-fns";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ClassInfo {
    id: string;
    name: string;
    Section: { id: string; name: string }[];
    isMarked: boolean;
}
interface StudentInfo {
    id: string;
    rollNo: string;
    user: { name: string; profilePic: string | null };
}
type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";

const STATUS_CONFIG: Record<
    AttendanceStatus,
    { label: string; color: string; bg: string; icon: keyof typeof Ionicons.glyphMap }
> = {
    PRESENT: { label: "Present", color: "#10B981", bg: "#ECFDF5", icon: "checkmark-circle" },
    ABSENT: { label: "Absent", color: "#EF4444", bg: "#FEF2F2", icon: "close-circle" },
    LATE: { label: "Late", color: "#F59E0B", bg: "#FFFBEB", icon: "time" },
};
const STATUS_ORDER: AttendanceStatus[] = ["PRESENT", "ABSENT", "LATE"];
const { width } = Dimensions.get("window");

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TeacherAttendancePage() {
    const insets = useSafeAreaInsets();
    const [classes, setClasses] = useState<ClassInfo[]>([]);
    const [classesLoading, setClassesLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
    const [students, setStudents] = useState<StudentInfo[]>([]);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
    const [submitting, setSubmitting] = useState(false);

    const fetchClasses = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true); else setClassesLoading(true);
        try {
            const data = await api.get<ClassInfo[]>("/api/v1/dashboard/teacher/attendance/classes");
            setClasses((data as any) || []);
        } catch (e) { console.error(e); }
        finally { setClassesLoading(false); setRefreshing(false); }
    }, []);

    useEffect(() => { fetchClasses(); }, [fetchClasses]);

    const handleSelectClass = useCallback(async (cls: ClassInfo) => {
        if (cls.isMarked) {
            Alert.alert("Already Marked", "Attendance for this class has already been marked today.");
            return;
        }
        setSelectedClass(cls);
        setStudentsLoading(true);
        setAttendance({});
        try {
            const data = await api.get<StudentInfo[]>(
                `/api/v1/dashboard/teacher/attendance/students?classId=${cls.id}`
            );
            const list = (data as any) || [];
            setStudents(list);
            const def: Record<string, AttendanceStatus> = {};
            list.forEach((s: StudentInfo) => { def[s.id] = "PRESENT"; });
            setAttendance(def);
        } catch (e) {
            Alert.alert("Error", "Could not load students for this class.");
        } finally { setStudentsLoading(false); }
    }, []);

    const cycleStatus = useCallback((studentId: string) => {
        setAttendance(prev => {
            const idx = STATUS_ORDER.indexOf(prev[studentId] || "PRESENT");
            return { ...prev, [studentId]: STATUS_ORDER[(idx + 1) % 3] };
        });
    }, []);

    const markAll = useCallback((status: AttendanceStatus) => {
        const updated: Record<string, AttendanceStatus> = {};
        students.forEach(s => { updated[s.id] = status; });
        setAttendance(updated);
    }, [students]);

    const handleSubmit = useCallback(async () => {
        if (!selectedClass) return;
        setSubmitting(true);
        try {
            await api.post("/api/v1/dashboard/teacher/attendance/submit", {
                classId: selectedClass.id,
                students: students.map(s => ({
                    studentId: s.id,
                    present: attendance[s.id] === "PRESENT",
                    status: attendance[s.id] || "PRESENT",
                })),
                date: new Date().toISOString(),
            });
            Alert.alert("Attendance Submitted!", `${selectedClass.name} — all ${students.length} students marked.`, [
                { text: "Back to Classes", onPress: () => { setSelectedClass(null); fetchClasses(); } },
            ]);
        } catch (e: any) {
            Alert.alert("Error", e?.message || "Failed to submit attendance.");
        } finally { setSubmitting(false); }
    }, [selectedClass, students, attendance, fetchClasses]);

    const counts = {
        present: Object.values(attendance).filter(s => s === "PRESENT").length,
        absent: Object.values(attendance).filter(s => s === "ABSENT").length,
        late: Object.values(attendance).filter(s => s === "LATE").length,
    };

    // ── STEP 1: Class Selection ─────────────────────────────────────────────────
    if (!selectedClass) {
        return (
            <View style={styles.root}>
                {/* Gradient header */}
                <LinearGradient
                    colors={["#4F46E5", "#7C3AED", "#9333EA"]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={[styles.header, { paddingTop: insets.top + 20 }]}
                >
                    <Pressable onPress={() => router.back()} style={styles.headerBackBtn}>
                        <Ionicons name="arrow-back" size={20} color="#fff" />
                    </Pressable>
                    <View style={{ flex: 1, alignItems: "center" }}>
                        <Text style={styles.headerTitle}>Attendance</Text>
                        <Text style={styles.headerDate}>{format(new Date(), "EEEE, MMMM d, yyyy")}</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </LinearGradient>

                {classesLoading ? (
                    <View style={styles.loaderBox}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loaderText}>Loading classes…</Text>
                    </View>
                ) : (
                    <ScrollView
                        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 130 }}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={() => fetchClasses(true)} tintColor="#4F46E5" />
                        }
                    >
                        {/* Info pill */}
                        <View style={styles.infoPill}>
                            <Ionicons name="information-circle-outline" size={15} color="#4F46E5" />
                            <Text style={styles.infoPillText}>Tap a class to mark today&apos;s attendance</Text>
                        </View>

                        {classes.length === 0 ? (
                            <View style={styles.emptyBox}>
                                <View style={styles.emptyIconWrap}>
                                    <Ionicons name="school-outline" size={36} color={COLORS.textMuted} />
                                </View>
                                <Text style={styles.emptyTitle}>No classes assigned</Text>
                                <Text style={styles.emptySubtitle}>Contact admin to assign classes.</Text>
                            </View>
                        ) : (
                            classes.map((cls, idx) => (
                                <Animated.View key={cls.id} entering={FadeInDown.delay(idx * 70)} layout={Layout.springify()}>
                                    <Pressable
                                        onPress={() => handleSelectClass(cls)}
                                        style={({ pressed }) => [styles.classCard, pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 }]}
                                    >
                                        {/* Left color accent */}
                                        <View style={[styles.classAccent, { backgroundColor: cls.isMarked ? "#10B981" : "#4F46E5" }]} />

                                        <View style={[styles.classIconCircle, { backgroundColor: cls.isMarked ? "#ECFDF5" : "#EEF2FF" }]}>
                                            <Ionicons name="people" size={22} color={cls.isMarked ? "#10B981" : "#4F46E5"} />
                                        </View>

                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.className}>{cls.name}</Text>
                                            {cls.Section?.length > 0 && (
                                                <Text style={styles.classSub}>
                                                    {cls.Section.map(s => `Sec ${s.name}`).join("  ·  ")}
                                                </Text>
                                            )}
                                        </View>

                                        <View style={[styles.statusPill, { backgroundColor: cls.isMarked ? "#ECFDF5" : "#FFFBEB", borderColor: cls.isMarked ? "#10B981" : "#F59E0B" }]}>
                                            <View style={[styles.statusDot, { backgroundColor: cls.isMarked ? "#10B981" : "#F59E0B" }]} />
                                            <Text style={[styles.statusPillText, { color: cls.isMarked ? "#10B981" : "#F59E0B" }]}>
                                                {cls.isMarked ? "Marked" : "Pending"}
                                            </Text>
                                        </View>

                                        <Ionicons name="chevron-forward" size={18} color="#CBD5E1" style={{ marginLeft: 6 }} />
                                    </Pressable>
                                </Animated.View>
                            ))
                        )}
                    </ScrollView>
                )}
                <TeacherBottomNav />
            </View>
        );
    }

    // ── STEP 2: Student Marking ─────────────────────────────────────────────────
    return (
        <View style={styles.root}>
            {/* Gradient header */}
            <LinearGradient
                colors={["#4F46E5", "#7C3AED", "#9333EA"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={[styles.header, { paddingTop: insets.top + 20 }]}
            >
                <Pressable onPress={() => setSelectedClass(null)} style={styles.headerBackBtn}>
                    <Ionicons name="arrow-back" size={20} color="#fff" />
                </Pressable>
                <View style={{ flex: 1, alignItems: "center" }}>
                    <Text style={styles.headerTitle}>{selectedClass.name}</Text>
                    <Text style={styles.headerDate}>{format(new Date(), "EEEE, MMM d")}</Text>
                </View>
                <View style={{ width: 40 }} />
            </LinearGradient>

            {studentsLoading ? (
                <View style={styles.loaderBox}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loaderText}>Loading students…</Text>
                </View>
            ) : (
                <>
                    {/* Stat cards */}
                    <Animated.View entering={FadeInDown.duration(400)} style={styles.statsRow}>
                        {[
                            { label: "Present", value: counts.present, color: "#10B981", bg: "#ECFDF5", icon: "checkmark-circle" as const },
                            { label: "Absent", value: counts.absent, color: "#EF4444", bg: "#FEF2F2", icon: "close-circle" as const },
                            { label: "Late", value: counts.late, color: "#F59E0B", bg: "#FFFBEB", icon: "time" as const },
                            { label: "Total", value: students.length, color: "#4F46E5", bg: "#EEF2FF", icon: "people" as const },
                        ].map(s => (
                            <View key={s.label} style={[styles.statCard, { backgroundColor: s.bg }]}>
                                <Ionicons name={s.icon} size={20} color={s.color} />
                                <Text style={[styles.statVal, { color: s.color }]}>{s.value}</Text>
                                <Text style={styles.statLbl}>{s.label}</Text>
                            </View>
                        ))}
                    </Animated.View>

                    {/* Mark All row */}
                    <Animated.View entering={FadeInDown.delay(100)} style={styles.markAllRow}>
                        <Text style={styles.markAllLbl}>Mark all:</Text>
                        {STATUS_ORDER.map(st => {
                            const cfg = STATUS_CONFIG[st];
                            return (
                                <Pressable
                                    key={st}
                                    onPress={() => markAll(st)}
                                    style={[styles.markAllBtn, { backgroundColor: cfg.bg, borderColor: cfg.color }]}
                                >
                                    <Ionicons name={cfg.icon} size={13} color={cfg.color} />
                                    <Text style={[styles.markAllBtnText, { color: cfg.color }]}>{cfg.label}</Text>
                                </Pressable>
                            );
                        })}
                    </Animated.View>

                    {/* Students */}
                    <ScrollView
                        style={{ flex: 1 }}
                        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 180, paddingTop: 8 }}
                        showsVerticalScrollIndicator={false}
                    >
                        {students.length === 0 ? (
                            <View style={styles.emptyBox}>
                                <View style={styles.emptyIconWrap}>
                                    <Ionicons name="people-outline" size={36} color={COLORS.textMuted} />
                                </View>
                                <Text style={styles.emptyTitle}>No students in this class</Text>
                            </View>
                        ) : (
                            students.map((student, idx) => {
                                const st = attendance[student.id] || "PRESENT";
                                const cfg = STATUS_CONFIG[st];
                                const avatarUrl =
                                    student.user.profilePic ||
                                    `https://api.dicebear.com/7.x/initials/png?seed=${encodeURIComponent(student.user.name)}&backgroundColor=4f46e5&textColor=ffffff`;

                                return (
                                    <Animated.View
                                        key={student.id}
                                        entering={FadeInRight.delay(idx * 35)}
                                        layout={Layout.springify()}
                                    >
                                        <Pressable
                                            onPress={() => cycleStatus(student.id)}
                                            style={({ pressed }) => [
                                                styles.studentCard,
                                                pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 },
                                            ]}
                                        >
                                            {/* Color left bar */}
                                            <View style={[styles.studentAccent, { backgroundColor: cfg.color }]} />

                                            {/* Roll number */}
                                            <View style={[styles.rollBox, { backgroundColor: cfg.color + "18" }]}>
                                                <Text style={[styles.rollNum, { color: cfg.color }]}>{student.rollNo}</Text>
                                            </View>

                                            {/* Avatar */}
                                            <Image source={{ uri: avatarUrl }} style={styles.avatar} />

                                            {/* Name */}
                                            <View style={{ flex: 1, marginLeft: 10 }}>
                                                <Text style={styles.studentName} numberOfLines={1}>{student.user.name}</Text>
                                                <Text style={styles.tapHint}>Tap to change</Text>
                                            </View>

                                            {/* Status chip */}
                                            <View style={[styles.chip, { backgroundColor: cfg.bg, borderColor: cfg.color }]}>
                                                <Ionicons name={cfg.icon} size={14} color={cfg.color} />
                                                <Text style={[styles.chipText, { color: cfg.color }]}>{cfg.label}</Text>
                                            </View>
                                        </Pressable>
                                    </Animated.View>
                                );
                            })
                        )}
                    </ScrollView>

                    {/* Submit */}
                    <Animated.View
                        entering={FadeInUp.delay(200)}
                        style={[styles.submitWrap, { paddingBottom: insets.bottom + 90 }]}
                    >
                        <Pressable
                            onPress={handleSubmit}
                            disabled={submitting || students.length === 0}
                            style={({ pressed }) => [
                                { opacity: submitting || students.length === 0 ? 0.6 : 1 },
                                pressed && { transform: [{ scale: 0.97 }] },
                            ]}
                        >
                            <LinearGradient
                                colors={["#4F46E5", "#7C3AED"]}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                style={styles.submitBtn}
                            >
                                {submitting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Ionicons name="checkmark-done-circle" size={22} color="#fff" />
                                        <Text style={styles.submitText}>Submit Attendance  ·  {students.length} students</Text>
                                    </>
                                )}
                            </LinearGradient>
                        </Pressable>
                    </Animated.View>
                </>
            )}

            <TeacherBottomNav />
        </View>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F8FAFF" },

    // Header
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingBottom: 22,
        gap: 8,
    },
    headerBackBtn: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.18)",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff" },
    headerDate: { fontSize: 11, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.72)", marginTop: 2 },

    // Info pill
    infoPill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
        backgroundColor: "#EEF2FF",
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 9,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#C7D2FE",
    },
    infoPillText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#4F46E5", flex: 1 },

    // Class card
    classCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        marginBottom: 12,
        overflow: "hidden",
        shadowColor: "#94A3B8",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 3,
        gap: 12,
        paddingVertical: 16,
        paddingRight: 16,
    },
    classAccent: { width: 5, alignSelf: "stretch" },
    classIconCircle: {
        width: 46,
        height: 46,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    className: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#1E293B" },
    classSub: { fontSize: 11, fontFamily: "Inter_500Medium", color: "#94A3B8", marginTop: 3 },
    statusPill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        borderWidth: 1,
    },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusPillText: { fontSize: 11, fontFamily: "Inter_700Bold" },

    // Stats
    statsRow: {
        flexDirection: "row",
        marginHorizontal: 16,
        marginTop: 16,
        gap: 8,
    },
    statCard: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 12,
        borderRadius: 14,
        gap: 3,
    },
    statVal: { fontSize: 20, fontFamily: "Inter_700Bold" },
    statLbl: { fontSize: 9, fontFamily: "Inter_600SemiBold", color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.4 },

    // Mark all
    markAllRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 16,
        marginTop: 12,
        marginBottom: 4,
    },
    markAllLbl: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#94A3B8" },
    markAllBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 11,
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 1,
    },
    markAllBtnText: { fontSize: 11, fontFamily: "Inter_700Bold" },

    // Student card
    studentCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        marginBottom: 9,
        overflow: "hidden",
        shadowColor: "#94A3B8",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
        paddingVertical: 12,
        paddingRight: 14,
        gap: 0,
    },
    studentAccent: { width: 4, alignSelf: "stretch", marginRight: 10 },
    rollBox: {
        width: 34,
        height: 34,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    rollNum: { fontSize: 11, fontFamily: "Inter_700Bold" },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 12,
        marginLeft: 10,
    },
    studentName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#1E293B" },
    tapHint: { fontSize: 10, fontFamily: "Inter_400Regular", color: "#CBD5E1", marginTop: 1 },
    chip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 1.5,
    },
    chipText: { fontSize: 11, fontFamily: "Inter_700Bold" },

    // Submit
    submitWrap: {
        paddingHorizontal: 16,
        paddingTop: 12,
        backgroundColor: "#F8FAFF",
        borderTopWidth: 1,
        borderTopColor: "#E2E8F0",
    },
    submitBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        paddingVertical: 16,
        borderRadius: 16,
    },
    submitText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },

    // Common
    loaderBox: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
    loaderText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#94A3B8" },
    emptyBox: { alignItems: "center", paddingVertical: 60, gap: 12 },
    emptyIconWrap: {
        width: 72, height: 72, borderRadius: 24,
        backgroundColor: "#F1F5F9",
        alignItems: "center", justifyContent: "center",
    },
    emptyTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#1E293B" },
    emptySubtitle: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#94A3B8", textAlign: "center" },
});
