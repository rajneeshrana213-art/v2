import { useState, useCallback, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    RefreshControl,
    ActivityIndicator,
  
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, Layout } from "react-native-reanimated";
import { router } from "expo-router";
// COLORS removed as unused
import { api } from "@/lib/api";
import { TeacherBottomNav } from "@/components/TeacherBottomNav";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Section { id: string; name: string; }
interface Subject { id: string; name: string; }
interface ClassData {
    id: string;
    name: string;
    Section: Section[];
    Subject: Subject[];
    _count: { students: number };
}

// Each class gets a unique color theme cycling through this list
const CLASS_THEMES = [
    { primary: "#4F46E5", bg: "#EEF2FF", light: "#C7D2FE" },
    { primary: "#10B981", bg: "#ECFDF5", light: "#A7F3D0" },
    { primary: "#F59E0B", bg: "#FFFBEB", light: "#FDE68A" },
    { primary: "#EF4444", bg: "#FEF2F2", light: "#FECACA" },
    { primary: "#8B5CF6", bg: "#F5F3FF", light: "#DDD6FE" },
    { primary: "#06B6D4", bg: "#ECFEFF", light: "#A5F3FC" },
];

// No unused Dimensions variables

// ─── Component ────────────────────────────────────────────────────────────────
export default function ClassesPage() {
    const insets = useSafeAreaInsets();
    const [classes, setClasses] = useState<ClassData[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const fetchClasses = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true); else setLoading(true);
        try {
            const data = await api.get<ClassData[]>("/api/v1/dashboard/teacher/classes");
            setClasses((data as any) || []);
        } catch (e) {
            console.error("Failed to load classes:", e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchClasses(); }, [fetchClasses]);

    const totalStudents = classes.reduce((acc, c) => acc + (c._count?.students || 0), 0);
    const totalSubjects = new Set(classes.flatMap(c => c.Subject.map(s => s.id))).size;

    return (
        <View style={styles.root}>

            {/* ── Gradient Header ── */}
            <LinearGradient
                colors={["#4F46E5", "#7C3AED", "#9333EA"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={[styles.header, { paddingTop: insets.top + 20 }]}
            >
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={20} color="#fff" />
                </Pressable>

                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>My Classes</Text>
                    <Text style={styles.headerSub}>All your assigned classes</Text>
                </View>
            </LinearGradient>

            {/* ── Summary bar ── */}
            {!loading && classes.length > 0 && (
                <Animated.View entering={FadeInDown.duration(400)} style={styles.summaryBar}>
                    {[
                        { icon: "school" as const, color: "#4F46E5", label: "Classes", value: classes.length },
                        { icon: "people" as const, color: "#10B981", label: "Students", value: totalStudents },
                        { icon: "book" as const, color: "#F59E0B", label: "Subjects", value: totalSubjects },
                    ].map(s => (
                        <View key={s.label} style={styles.summaryItem}>
                            <Ionicons name={s.icon} size={18} color={s.color} />
                            <Text style={[styles.summaryValue, { color: s.color }]}>{s.value}</Text>
                            <Text style={styles.summaryLabel}>{s.label}</Text>
                        </View>
                    ))}
                </Animated.View>
            )}

            {loading ? (
                <View style={styles.loaderBox}>
                    <ActivityIndicator size="large" color="#4F46E5" />
                    <Text style={styles.loaderText}>Loading classes…</Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 130 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => fetchClasses(true)} tintColor="#4F46E5" />
                    }
                >
                    {classes.length === 0 ? (
                        <View style={styles.emptyBox}>
                            <View style={styles.emptyIconBox}>
                                <Ionicons name="school-outline" size={40} color="#CBD5E1" />
                            </View>
                            <Text style={styles.emptyTitle}>No classes assigned</Text>
                            <Text style={styles.emptySubtitle}>Contact your admin to get classes assigned to you.</Text>
                        </View>
                    ) : (
                        classes.map((cls, idx) => {
                            const theme = CLASS_THEMES[idx % CLASS_THEMES.length];
                            const isExpanded = expandedId === cls.id;

                            return (
                                <Animated.View
                                    key={cls.id}
                                    entering={FadeInDown.delay(idx * 70)}
                                    layout={Layout.springify()}
                                    style={styles.cardWrapper}
                                >
                                    {/* ── Main Class Card ── */}
                                    <Pressable
                                        onPress={() => setExpandedId(isExpanded ? null : cls.id)}
                                        style={({ pressed }) => [
                                            styles.classCard,
                                            pressed && { transform: [{ scale: 0.97 }], opacity: 0.92 },
                                        ]}
                                    >
                                        {/* Color left accent bar */}
                                        <View style={[styles.accentBar, { backgroundColor: theme.primary }]} />

                                        {/* Class icon */}
                                        <View style={[styles.classIconBox, { backgroundColor: theme.bg }]}>
                                            <Ionicons name="school" size={24} color={theme.primary} />
                                        </View>

                                        {/* Class name & sections */}
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.className}>{cls.name}</Text>
                                            <Text style={styles.classSub} numberOfLines={1}>
                                                {cls.Section?.length > 0
                                                    ? cls.Section.map(s => `Sec ${s.name}`).join("  ·  ")
                                                    : "No sections assigned"}
                                            </Text>
                                        </View>

                                        {/* Student count badge */}
                                        <View style={[styles.countChip, { backgroundColor: theme.bg, borderColor: theme.light }]}>
                                            <Ionicons name="people" size={12} color={theme.primary} />
                                            <Text style={[styles.countText, { color: theme.primary }]}>
                                                {cls._count?.students ?? 0}
                                            </Text>
                                        </View>

                                        {/* Expand toggle */}
                                        <Ionicons
                                            name={isExpanded ? "chevron-up" : "chevron-down"}
                                            size={16}
                                            color="#CBD5E1"
                                            style={{ marginLeft: 6 }}
                                        />
                                    </Pressable>

                                    {/* ── Expanded Detail Panel ── */}
                                    {isExpanded && (
                                        <Animated.View entering={FadeInDown.duration(250)} style={styles.detailPanel}>

                                            {/* Subjects */}
                                            <View style={styles.detailSection}>
                                                <View style={styles.detailSectionHeader}>
                                                    <View style={[styles.detailSectionIcon, { backgroundColor: theme.bg }]}>
                                                        <Ionicons name="book" size={13} color={theme.primary} />
                                                    </View>
                                                    <Text style={[styles.detailSectionTitle, { color: theme.primary }]}>SUBJECTS</Text>
                                                </View>
                                                {cls.Subject?.length > 0 ? (
                                                    <View style={styles.tagsRow}>
                                                        {cls.Subject.map(subj => (
                                                            <View key={subj.id} style={[styles.subjectTag, { backgroundColor: theme.bg, borderColor: theme.light }]}>
                                                                <Text style={[styles.subjectTagText, { color: theme.primary }]}>{subj.name}</Text>
                                                            </View>
                                                        ))}
                                                    </View>
                                                ) : (
                                                    <Text style={styles.noDataText}>No subjects assigned</Text>
                                                )}
                                            </View>

                                            {/* Sections */}
                                            {cls.Section?.length > 0 && (
                                                <View style={styles.detailSection}>
                                                    <View style={styles.detailSectionHeader}>
                                                        <View style={[styles.detailSectionIcon, { backgroundColor: theme.bg }]}>
                                                            <Ionicons name="git-branch" size={13} color={theme.primary} />
                                                        </View>
                                                        <Text style={[styles.detailSectionTitle, { color: theme.primary }]}>SECTIONS</Text>
                                                    </View>
                                                    <View style={styles.tagsRow}>
                                                        {cls.Section.map(sec => (
                                                            <View key={sec.id} style={[styles.subjectTag, { backgroundColor: theme.bg, borderColor: theme.light }]}>
                                                                <Ionicons name="people-outline" size={12} color={theme.primary} />
                                                                <Text style={[styles.subjectTagText, { color: theme.primary }]}>Section {sec.name}</Text>
                                                            </View>
                                                        ))}
                                                    </View>
                                                </View>
                                            )}

                                            {/* Quick Action Buttons */}
                                            <View style={styles.actionRow}>
                                                <Pressable
                                                    onPress={() => router.push({ pathname: "/pages/class-details", params: { id: cls.id, name: cls.name } } as any)}
                                                    style={({ pressed }) => [styles.actionBtn, { backgroundColor: theme.primary, borderColor: theme.primary, opacity: pressed ? 0.8 : 1 }]}
                                                >
                                                    <Ionicons name="eye-outline" size={16} color="#FFF" />
                                                    <Text style={[styles.actionBtnText, { color: "#FFF" }]}>Full Details</Text>
                                                </Pressable>

                                                <Pressable
                                                    onPress={() => router.push("/pages/teacher-attendance" as any)}
                                                    style={({ pressed }) => [styles.actionBtn, { backgroundColor: theme.bg, borderColor: theme.light, opacity: pressed ? 0.8 : 1 }]}
                                                >
                                                    <Ionicons name="checkbox-outline" size={16} color={theme.primary} />
                                                    <Text style={[styles.actionBtnText, { color: theme.primary }]}>Attendance</Text>
                                                </Pressable>

                                                <Pressable
                                                    onPress={() => router.push("/pages/homework" as any)}
                                                    style={({ pressed }) => [styles.actionBtn, { backgroundColor: theme.bg, borderColor: theme.light, opacity: pressed ? 0.8 : 1 }]}
                                                >
                                                    <Ionicons name="document-text-outline" size={16} color={theme.primary} />
                                                    <Text style={[styles.actionBtnText, { color: theme.primary }]}>Homework</Text>
                                                </Pressable>

                                                <Pressable
                                                    onPress={() => router.push("/pages/timetable" as any)}
                                                    style={({ pressed }) => [styles.actionBtn, { backgroundColor: theme.bg, borderColor: theme.light, opacity: pressed ? 0.8 : 1 }]}
                                                >
                                                    <Ionicons name="calendar-outline" size={16} color={theme.primary} />
                                                    <Text style={[styles.actionBtnText, { color: theme.primary }]}>Schedule</Text>
                                                </Pressable>
                                            </View>
                                        </Animated.View>
                                    )}
                                </Animated.View>
                            );
                        })
                    )}
                </ScrollView>
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
        paddingHorizontal: 16,
        paddingBottom: 24,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    backBtn: {
        width: 38, height: 38, borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.18)",
        alignItems: "center", justifyContent: "center",
    },
    headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" },
    headerSub: { fontSize: 12, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.72)", marginTop: 2 },

    // Summary bar
    summaryBar: {
        flexDirection: "row",
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 4,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        overflow: "hidden",
        shadowColor: "#94A3B8",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    summaryItem: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 14,
        gap: 4,
        borderRightWidth: 1,
        borderRightColor: "#F1F5F9",
    },
    summaryValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
    summaryLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.4 },

    // Loader / Empty
    loaderBox: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
    loaderText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#94A3B8" },
    emptyBox: { alignItems: "center", paddingVertical: 80, gap: 12 },
    emptyIconBox: {
        width: 80, height: 80, borderRadius: 28,
        backgroundColor: "#F1F5F9",
        alignItems: "center", justifyContent: "center", marginBottom: 4,
    },
    emptyTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#1E293B" },
    emptySubtitle: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#94A3B8", textAlign: "center", paddingHorizontal: 32 },

    // Card wrapper
    cardWrapper: { marginBottom: 12 },

    // Main class card
    classCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        overflow: "hidden",
        paddingVertical: 16,
        paddingRight: 16,
        gap: 12,
        shadowColor: "#94A3B8",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 3,
    },
    accentBar: { width: 5, alignSelf: "stretch" },
    classIconBox: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    className: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#1E293B" },
    classSub: { fontSize: 11, fontFamily: "Inter_500Medium", color: "#94A3B8", marginTop: 3 },
    countChip: {
        flexDirection: "row", alignItems: "center", gap: 4,
        paddingHorizontal: 10, paddingVertical: 5,
        borderRadius: 10, borderWidth: 1,
    },
    countText: { fontSize: 12, fontFamily: "Inter_700Bold" },

    // Expanded detail panel
    detailPanel: {
        backgroundColor: "#FFFFFF",
        borderBottomLeftRadius: 18,
        borderBottomRightRadius: 18,
        paddingHorizontal: 18,
        paddingBottom: 16,
        marginTop: -4,
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
        shadowColor: "#94A3B8",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 14,
        elevation: 2,
    },
    detailSection: { marginTop: 14 },
    detailSectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
    detailSectionIcon: {
        width: 24, height: 24, borderRadius: 8,
        alignItems: "center", justifyContent: "center",
    },
    detailSectionTitle: { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 0.8 },
    tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    subjectTag: {
        flexDirection: "row", alignItems: "center", gap: 5,
        paddingHorizontal: 12, paddingVertical: 7,
        borderRadius: 10, borderWidth: 1,
    },
    subjectTagText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
    noDataText: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#94A3B8" },

    // Quick action buttons
    actionRow: { flexDirection: "row", gap: 8, marginTop: 16 },
    actionBtn: {
        flex: 1, flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 5, paddingVertical: 12,
        borderRadius: 14, borderWidth: 1,
    },
    actionBtnText: { fontSize: 11, fontFamily: "Inter_700Bold" },
});
