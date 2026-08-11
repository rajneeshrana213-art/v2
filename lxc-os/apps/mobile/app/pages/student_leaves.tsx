import { useState, useCallback, useEffect, useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    RefreshControl,
    ActivityIndicator,
    Alert,
    Dimensions,
    TextInput,
    Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, Layout } from "react-native-reanimated";
import { router } from "expo-router";
import { format, differenceInDays } from "date-fns";
import { api } from "@/lib/api";
import { TeacherBottomNav } from "@/components/TeacherBottomNav";

// ── Types ──────────────────────────────────────────────────────────────────────
interface LeaveRequest {
    id: string;
    reason: string;
    fromDate: string;
    toDate: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    isApproved: "PENDING" | "APPROVED" | "REJECTED";
    createdAt: string;
    user: {
        name: string;
        email: string;
        student: {
            rollNo: string;
            class: { name: string };
        } | null;
    };
}

const STATUS_MAP = {
    PENDING: { label: "Pending", color: "#F59E0B", bg: "#FFFBEB", border: "#FDE68A", dot: "#F59E0B" },
    APPROVED: { label: "Approved", color: "#10B981", bg: "#ECFDF5", border: "#A7F3D0", dot: "#10B981" },
    REJECTED: { label: "Rejected", color: "#EF4444", bg: "#FEF2F2", border: "#FECACA", dot: "#EF4444" },
};

const FILTER_TABS = ["ALL", "PENDING", "APPROVED", "REJECTED"] as const;
type FilterType = typeof FILTER_TABS[number];

const dicebearAvatar = (name: string) =>
    `https://api.dicebear.com/7.x/initials/png?seed=${encodeURIComponent(name)}&backgroundColor=4F46E5&textColor=ffffff&fontSize=38&size=64`;

// ── Component ─────────────────────────────────────────────────────────────────
export default function StudentLeavesPage() {
    const insets = useSafeAreaInsets();

    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<FilterType>("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [processing, setProcessing] = useState<string | null>(null); // leaveId being actioned

    // ── Fetch ────────────────────────────────────────────────────────────────────
    const fetchLeaves = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true); else setLoading(true);
        try {
            const data = await api.get<LeaveRequest[]>("/api/v1/dashboard/teacher/student-leaves");
            setLeaves((data as any) || []);
        } catch (e) {
            console.error("Leaves fetch error:", e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchLeaves(); }, []);

    // ── Approve / Reject ─────────────────────────────────────────────────────────
    const handleAction = useCallback((leave: LeaveRequest, newStatus: "APPROVED" | "REJECTED") => {
        const verb = newStatus === "APPROVED" ? "Approve" : "Reject";
        Alert.alert(
            `${verb} Leave`,
            `${verb} leave request for ${leave.user.name}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: verb,
                    style: newStatus === "REJECTED" ? "destructive" : "default",
                    onPress: async () => {
                        setProcessing(leave.id);
                        try {
                            await api.patch("/api/v1/dashboard/teacher/student-leaves", {
                                leaveId: leave.id,
                                status: newStatus,
                            });
                            setLeaves(prev =>
                                prev.map(l =>
                                    l.id === leave.id
                                        ? { ...l, status: newStatus, isApproved: newStatus }
                                        : l
                                )
                            );
                        } catch (e: any) {
                            Alert.alert("Error", e?.message || "Failed to update leave.");
                        } finally {
                            setProcessing(null);
                        }
                    },
                },
            ]
        );
    }, []);

    // ── Derived ──────────────────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        let list = leaves;
        if (filter !== "ALL") list = list.filter(l => l.status === filter || l.isApproved === filter);
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            list = list.filter(l =>
                l.user.name.toLowerCase().includes(q) ||
                l.user.student?.class.name.toLowerCase().includes(q) ||
                l.user.student?.rollNo?.toLowerCase().includes(q) ||
                l.reason.toLowerCase().includes(q)
            );
        }
        return list;
    }, [leaves, filter, searchQuery]);

    const pendingCount = leaves.filter(l => (l.status || l.isApproved) === "PENDING").length;
    const approvedCount = leaves.filter(l => (l.status || l.isApproved) === "APPROVED").length;
    const rejectedCount = leaves.filter(l => (l.status || l.isApproved) === "REJECTED").length;

    // ── Render ───────────────────────────────────────────────────────────────────
    return (
        <View style={styles.root}>

            {/* Header */}
            <LinearGradient
                colors={["#0F766E", "#0891B2", "#0284C7"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={[styles.header, { paddingTop: insets.top + 20 }]}
            >
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={20} color="#fff" />
                </Pressable>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>Student Leaves</Text>
                    <Text style={styles.headerSub}>Review and manage leave requests</Text>
                </View>
                <View style={[styles.pendingBadge, pendingCount === 0 && { opacity: 0 }]}>
                    <Text style={styles.pendingBadgeText}>{pendingCount}</Text>
                </View>
            </LinearGradient>

            {/* Stats */}
            {!loading && (
                <Animated.View entering={FadeInDown.duration(350)} style={styles.statsRow}>
                    {[
                        { label: "Pending", value: pendingCount, color: "#F59E0B", bg: "#FFFBEB", icon: "time-outline" as const },
                        { label: "Approved", value: approvedCount, color: "#10B981", bg: "#ECFDF5", icon: "checkmark-circle-outline" as const },
                        { label: "Rejected", value: rejectedCount, color: "#EF4444", bg: "#FEF2F2", icon: "close-circle-outline" as const },
                        { label: "Total", value: leaves.length, color: "#6366F1", bg: "#EEF2FF", icon: "list-outline" as const },
                    ].map(s => (
                        <View key={s.label} style={[styles.statCard, { backgroundColor: s.bg }]}>
                            <Ionicons name={s.icon} size={16} color={s.color} />
                            <Text style={[styles.statVal, { color: s.color }]}>{s.value}</Text>
                            <Text style={styles.statLbl}>{s.label}</Text>
                        </View>
                    ))}
                </Animated.View>
            )}

            {/* Search + Filter */}
            <View style={styles.searchRow}>
                <View style={styles.searchBox}>
                    <Ionicons name="search" size={15} color="#94A3B8" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by name, class, reason…"
                        placeholderTextColor="#CBD5E1"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <Pressable onPress={() => setSearchQuery("")}>
                            <Ionicons name="close-circle" size={15} color="#CBD5E1" />
                        </Pressable>
                    )}
                </View>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterScroll}
                contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
            >
                {FILTER_TABS.map(f => (
                    <Pressable
                        key={f}
                        onPress={() => setFilter(f)}
                        style={[styles.filterChip, filter === f && styles.filterChipActive]}
                    >
                        {f !== "ALL" && (
                            <View style={[styles.filterDot, { backgroundColor: STATUS_MAP[f]?.dot }]} />
                        )}
                        <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>
                            {f === "ALL" ? "All" : STATUS_MAP[f].label}
                            {f !== "ALL" && ` (${f === "PENDING" ? pendingCount : f === "APPROVED" ? approvedCount : rejectedCount})`}
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>

            {/* List */}
            {loading ? (
                <View style={styles.loaderBox}>
                    <ActivityIndicator size="large" color="#0891B2" />
                    <Text style={styles.loaderText}>Loading leave requests…</Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: insets.bottom + 140 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => fetchLeaves(true)} tintColor="#0891B2" />
                    }
                >
                    {filtered.length === 0 ? (
                        <View style={styles.emptyBox}>
                            <View style={styles.emptyIcon}>
                                <Ionicons name="document-text-outline" size={40} color="#CBD5E1" />
                            </View>
                            <Text style={styles.emptyTitle}>No leave requests</Text>
                            <Text style={styles.emptySubtitle}>
                                {filter === "ALL"
                                    ? "No students have submitted leave requests yet."
                                    : `No ${STATUS_MAP[filter as keyof typeof STATUS_MAP].label.toLowerCase()} leave requests.`}
                            </Text>
                        </View>
                    ) : (
                        filtered.map((leave, idx) => {
                            const statusKey = (leave.status || leave.isApproved) as keyof typeof STATUS_MAP;
                            const status = STATUS_MAP[statusKey] || STATUS_MAP.PENDING;
                            const isPending = statusKey === "PENDING";
                            const isProcessing = processing === leave.id;

                            const fromDate = new Date(leave.fromDate);
                            const toDate = new Date(leave.toDate);
                            const days = differenceInDays(toDate, fromDate) + 1;

                            return (
                                <Animated.View key={leave.id} entering={FadeInDown.delay(idx * 50)} layout={Layout.springify()}>
                                    <View style={styles.leaveCard}>
                                        {/* Left strip */}
                                        <View style={[styles.cardStrip, { backgroundColor: status.color }]} />

                                        <View style={{ flex: 1, padding: 14 }}>
                                            {/* Top row */}
                                            <View style={styles.cardTopRow}>
                                                {/* Avatar + info */}
                                                <Image
                                                    source={{ uri: dicebearAvatar(leave.user.name) }}
                                                    style={styles.avatar}
                                                />
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.studentName} numberOfLines={1}>{leave.user.name}</Text>
                                                    <View style={styles.studentMeta}>
                                                        {leave.user.student?.class?.name && (
                                                            <View style={styles.metaChip}>
                                                                <Ionicons name="school-outline" size={10} color="#64748B" />
                                                                <Text style={styles.metaChipText}>{leave.user.student.class.name}</Text>
                                                            </View>
                                                        )}
                                                        {leave.user.student?.rollNo && (
                                                            <View style={styles.metaChip}>
                                                                <Ionicons name="id-card-outline" size={10} color="#64748B" />
                                                                <Text style={styles.metaChipText}>Roll {leave.user.student.rollNo}</Text>
                                                            </View>
                                                        )}
                                                    </View>
                                                </View>
                                                {/* Status badge */}
                                                <View style={[styles.statusBadge, { backgroundColor: status.bg, borderColor: status.border }]}>
                                                    <View style={[styles.statusDot, { backgroundColor: status.dot }]} />
                                                    <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                                                </View>
                                            </View>

                                            {/* Reason */}
                                            <View style={styles.reasonBox}>
                                                <Ionicons name="chatbubble-ellipses-outline" size={13} color="#94A3B8" />
                                                <Text style={styles.reasonText} numberOfLines={2}>{leave.reason}</Text>
                                            </View>

                                            {/* Duration */}
                                            <View style={styles.durationRow}>
                                                <View style={styles.durationItem}>
                                                    <Ionicons name="calendar-outline" size={12} color="#0891B2" />
                                                    <Text style={styles.durationLabel}>From</Text>
                                                    <Text style={styles.durationVal}>{format(fromDate, "MMM d, yyyy")}</Text>
                                                </View>
                                                <View style={styles.durationArrow}>
                                                    <Ionicons name="arrow-forward" size={14} color="#CBD5E1" />
                                                </View>
                                                <View style={styles.durationItem}>
                                                    <Ionicons name="calendar" size={12} color="#0891B2" />
                                                    <Text style={styles.durationLabel}>To</Text>
                                                    <Text style={styles.durationVal}>{format(toDate, "MMM d, yyyy")}</Text>
                                                </View>
                                                <View style={[styles.daysBadge]}>
                                                    <Text style={styles.daysText}>{days} day{days !== 1 ? "s" : ""}</Text>
                                                </View>
                                            </View>

                                            <Text style={styles.appliedDate}>
                                                Applied {format(new Date(leave.createdAt), "MMM d, yyyy · h:mm a")}
                                            </Text>

                                            {/* Actions for pending */}
                                            {isPending && (
                                                <View style={styles.actionRow}>
                                                    <Pressable
                                                        onPress={() => handleAction(leave, "APPROVED")}
                                                        disabled={isProcessing}
                                                        style={[styles.actionBtn, styles.approveBtn, isProcessing && { opacity: 0.5 }]}
                                                    >
                                                        {isProcessing ? (
                                                            <ActivityIndicator size="small" color="#10B981" />
                                                        ) : (
                                                            <>
                                                                <Ionicons name="checkmark" size={16} color="#10B981" />
                                                                <Text style={[styles.actionBtnText, { color: "#10B981" }]}>Approve</Text>
                                                            </>
                                                        )}
                                                    </Pressable>
                                                    <Pressable
                                                        onPress={() => handleAction(leave, "REJECTED")}
                                                        disabled={isProcessing}
                                                        style={[styles.actionBtn, styles.rejectBtn, isProcessing && { opacity: 0.5 }]}
                                                    >
                                                        {isProcessing ? (
                                                            <ActivityIndicator size="small" color="#EF4444" />
                                                        ) : (
                                                            <>
                                                                <Ionicons name="close" size={16} color="#EF4444" />
                                                                <Text style={[styles.actionBtnText, { color: "#EF4444" }]}>Reject</Text>
                                                            </>
                                                        )}
                                                    </Pressable>
                                                </View>
                                            )}
                                        </View>
                                    </View>
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

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F0FDFA" },

    header: {
        flexDirection: "row", alignItems: "center", gap: 12,
        paddingHorizontal: 16, paddingBottom: 22,
    },
    backBtn: {
        width: 38, height: 38, borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.18)",
        alignItems: "center", justifyContent: "center",
    },
    headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" },
    headerSub: { fontSize: 12, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.72)", marginTop: 2 },
    pendingBadge: {
        minWidth: 28, height: 28, borderRadius: 14,
        backgroundColor: "#EF4444",
        alignItems: "center", justifyContent: "center",
        paddingHorizontal: 6,
    },
    pendingBadgeText: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#fff" },

    statsRow: {
        flexDirection: "row", marginHorizontal: 16, marginTop: 16, gap: 8,
    },
    statCard: {
        flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 12, gap: 2,
    },
    statVal: { fontSize: 18, fontFamily: "Inter_700Bold" },
    statLbl: { fontSize: 8, fontFamily: "Inter_600SemiBold", color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.4 },

    searchRow: { paddingHorizontal: 16, marginTop: 14, marginBottom: 4 },
    searchBox: {
        flexDirection: "row", alignItems: "center", gap: 10,
        backgroundColor: "#FFFFFF", borderRadius: 14,
        borderWidth: 1, borderColor: "#E2E8F0",
        paddingHorizontal: 14, paddingVertical: 11,
        shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    },
    searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium", color: "#1E293B" },

    filterScroll: { paddingVertical: 8 },
    filterChip: {
        flexDirection: "row", alignItems: "center", gap: 6,
        paddingHorizontal: 14, paddingVertical: 7,
        borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0",
        backgroundColor: "#FFFFFF",
    },
    filterChipActive: { backgroundColor: "#0891B2", borderColor: "#0891B2" },
    filterDot: { width: 7, height: 7, borderRadius: 4 },
    filterChipText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#64748B" },
    filterChipTextActive: { color: "#fff" },

    loaderBox: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
    loaderText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#94A3B8" },
    emptyBox: { alignItems: "center", paddingVertical: 80, gap: 12 },
    emptyIcon: { width: 80, height: 80, borderRadius: 28, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center", marginBottom: 4 },
    emptyTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#1E293B" },
    emptySubtitle: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#94A3B8", textAlign: "center", paddingHorizontal: 32 },

    leaveCard: {
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
        borderRadius: 18, marginBottom: 12,
        overflow: "hidden",
        shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.09, shadowRadius: 10, elevation: 3,
    },
    cardStrip: { width: 5 },

    cardTopRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 },
    avatar: { width: 44, height: 44, borderRadius: 14, backgroundColor: "#EEF2FF" },
    studentName: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#1E293B", marginBottom: 5 },
    studentMeta: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
    metaChip: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#F8FAFF", borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3, borderWidth: 1, borderColor: "#E2E8F0" },
    metaChipText: { fontSize: 10, fontFamily: "Inter_500Medium", color: "#64748B" },

    statusBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1 },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { fontSize: 11, fontFamily: "Inter_700Bold" },

    reasonBox: { flexDirection: "row", alignItems: "flex-start", gap: 7, backgroundColor: "#F8FAFF", borderRadius: 10, padding: 10, marginBottom: 10 },
    reasonText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium", color: "#475569", lineHeight: 18 },

    durationRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
    durationItem: { flexDirection: "row", alignItems: "center", gap: 4 },
    durationArrow: { flex: 1, alignItems: "center" },
    durationLabel: { fontSize: 10, fontFamily: "Inter_500Medium", color: "#94A3B8" },
    durationVal: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#1E293B" },
    daysBadge: { backgroundColor: "#ECFEFF", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: "#A5F3FC" },
    daysText: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#0891B2" },
    appliedDate: { fontSize: 10, fontFamily: "Inter_400Regular", color: "#CBD5E1", marginBottom: 10 },

    actionRow: { flexDirection: "row", gap: 10 },
    actionBtn: {
        flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
        gap: 6, paddingVertical: 10, borderRadius: 12, borderWidth: 1,
    },
    approveBtn: { backgroundColor: "#ECFDF5", borderColor: "#A7F3D0" },
    rejectBtn: { backgroundColor: "#FEF2F2", borderColor: "#FECACA" },
    actionBtnText: { fontSize: 13, fontFamily: "Inter_700Bold" },
});
