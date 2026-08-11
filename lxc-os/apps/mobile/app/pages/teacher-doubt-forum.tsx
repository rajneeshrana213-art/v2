import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Platform,
    RefreshControl,
    ActivityIndicator,
    Pressable,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    TouchableOpacity,
    Alert,
    Image,
    Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Animated, { FadeInDown, FadeInUp, ZoomIn } from "react-native-reanimated";
import { router } from "expo-router";
import { format } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { TeacherBottomNav } from "@/components/TeacherBottomNav";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";

// ── Types ──────────────────────────────────────────────────────────────────────
interface DoubtItem {
    id: string;
    title: string;
    content: string;
    status: "OPEN" | "ANSWERED" | "CLOSED";
    priority: "LOW" | "MEDIUM" | "HIGH";
    isPinned: boolean;
    isLocked: boolean;
    createdAt: string;
    user: { name: string; profilePic?: string };
    subject: { id: string; name: string } | null;
    class: { id: string; name: string } | null;
    _count: { replies: number };
}

interface DoubtReply {
    id: string;
    content: string;
    createdAt: string;
    votes?: number;
    upvotes?: number;
    user: { name: string; profilePic?: string };
    role?: string;
}

interface DoubtDetail extends DoubtItem {
    replies: DoubtReply[];
}

const STATUS_COLORS: Record<string, string> = {
    OPEN: "#F59E0B",
    ANSWERED: "#10B981",
    CLOSED: "#6B7280",
};

const dicebear = (name: string) =>
    `https://api.dicebear.com/7.x/initials/png?seed=${encodeURIComponent(name)}&backgroundColor=4F46E5&textColor=ffffff&fontSize=38&size=64`;

// ── Component ─────────────────────────────────────────────────────────────────
export default function TeacherDoubtForum() {
    const insets = useSafeAreaInsets();

    // List state
    const [doubts, setDoubts] = useState<DoubtItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<{ status?: string }>({ status: "ALL" });
    const [searchQuery, setSearchQuery] = useState("");

    // Detail modal
    const [selectedDoubt, setSelectedDoubt] = useState<DoubtItem | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [doubtDetails, setDoubtDetails] = useState<DoubtDetail | null>(null);

    // Reply
    const [replyContent, setReplyContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ── Fetch list ────────────────────────────────────────────────────────────
    const fetchDoubts = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true); else setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (filter.status && filter.status !== "ALL") params.set("status", filter.status);
            if (searchQuery.trim()) params.set("search", searchQuery.trim());
            params.set("limit", "40");

            const res = await api.get<{ data: DoubtItem[] }>(
                `/api/v1/dashboard/teacher/doubt-forum?${params.toString()}`
            );
            setDoubts((res as any)?.data || []);
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); setRefreshing(false); }
    }, [filter, searchQuery]);

    useEffect(() => { fetchDoubts(); }, [fetchDoubts]);

    // ── Fetch detail ──────────────────────────────────────────────────────────
    const fetchDoubtDetail = useCallback(async (id: string) => {
        setDetailLoading(true);
        try {
            const res = await api.get<DoubtDetail>(`/api/v1/dashboard/teacher/doubt-forum/${id}`);
            setDoubtDetails((res as any) || null);
        } catch (e) { console.error(e); }
        finally { setDetailLoading(false); }
    }, []);

    // ── Post reply ────────────────────────────────────────────────────────────
    const handlePostReply = useCallback(async () => {
        if (!replyContent.trim() || !selectedDoubt) return;
        setIsSubmitting(true);
        try {
            await api.post("/api/v1/dashboard/teacher/doubt-forum", {
                doubtId: selectedDoubt.id,
                content: replyContent.trim(),
            });
            setReplyContent("");
            await fetchDoubtDetail(selectedDoubt.id);
            // Mark as answered in list
            setDoubts(prev => prev.map(d =>
                d.id === selectedDoubt.id
                    ? { ...d, status: "ANSWERED", _count: { replies: d._count.replies + 1 } }
                    : d
            ));
        } catch (e: any) {
            Alert.alert("Error", e?.message || "Failed to post reply");
        } finally { setIsSubmitting(false); }
    }, [replyContent, selectedDoubt, fetchDoubtDetail]);

    // ── Moderation ────────────────────────────────────────────────────────────
    const handleModerate = useCallback(async (action: "pin" | "lock" | "close" | "reopen") => {
        if (!doubtDetails) return;
        try {
            let body: any = {};
            if (action === "pin") body = { action: "pin" };
            else if (action === "lock") body = { action: "lock" };
            else if (action === "close") body = { status: "CLOSED" };
            else if (action === "reopen") body = { status: "OPEN" };

            const res = await api.patch(
                `/api/v1/dashboard/teacher/doubt-forum/${doubtDetails.id}`,
                body
            );
            const u = res as any;
            setDoubtDetails(prev => prev ? {
                ...prev,
                isPinned: u.isPinned ?? prev.isPinned,
                isLocked: u.isLocked ?? prev.isLocked,
                status: u.status ?? prev.status,
            } : prev);
            setDoubts(prev => prev.map(d => d.id === doubtDetails.id
                ? { ...d, isPinned: u.isPinned ?? d.isPinned, isLocked: u.isLocked ?? d.isLocked, status: u.status ?? d.status }
                : d
            ));
        } catch (e: any) {
            Alert.alert("Error", e?.message || "Action failed");
        }
    }, [doubtDetails]);

    // ── Vote ──────────────────────────────────────────────────────────────────
    const handleVote = useCallback(async (replyId: string, direction: 1 | -1) => {
        if (!doubtDetails) return;
        try {
            await api.patch(`/api/v1/dashboard/teacher/doubt-forum/${doubtDetails.id}`, {
                action: "vote-reply", replyId, direction,
            });
            fetchDoubtDetail(doubtDetails.id);
        } catch (e) { console.error(e); }
    }, [doubtDetails, fetchDoubtDetail]);

    // ── Derived ───────────────────────────────────────────────────────────────
    const stats = useMemo(() => ({
        total: doubts.length,
        open: doubts.filter(d => d.status === "OPEN").length,
        answered: doubts.filter(d => d.status === "ANSWERED").length,
        closed: doubts.filter(d => d.status === "CLOSED").length,
    }), [doubts]);

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <View style={styles.container}>
            <PageHeader title="Doubt Forum" subtitle="Manage Student Doubts" />

            {/* Hero Section */}
            <Animated.View entering={FadeInUp.duration(600)} style={styles.heroContainer}>
                <LinearGradient
                    colors={[COLORS.primary, "#6366F1"]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={styles.heroGradient}
                >
                    <View style={styles.heroContent}>
                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{stats.total}</Text>
                                <Text style={styles.statLabel}>Total</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{stats.open}</Text>
                                <Text style={styles.statLabel}>Open</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{stats.answered}</Text>
                                <Text style={styles.statLabel}>Answered</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{stats.closed}</Text>
                                <Text style={styles.statLabel}>Closed</Text>
                            </View>
                        </View>

                        <View style={styles.searchBar}>
                            <Ionicons name="search" size={20} color="rgba(255,255,255,0.7)" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search discussions..."
                                placeholderTextColor="rgba(255,255,255,0.6)"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                returnKeyType="search"
                                onSubmitEditing={() => fetchDoubts()}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery("")}>
                                    <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.6)" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </LinearGradient>
            </Animated.View>

            {/* Filter Bar */}
            <View style={styles.filterSection}>
                <BlurView intensity={20} tint="light" style={styles.filterBar}>
                    {(["ALL", "OPEN", "ANSWERED", "CLOSED"] as const).map(f => (
                        <Pressable
                            key={f}
                            style={[styles.filterChip, filter.status === f && styles.activeChip]}
                            onPress={() => setFilter({ status: f })}
                        >
                            <Text style={[styles.chipText, filter.status === f && styles.activeChipText]}>
                                {f === "ALL" ? "All" : f === "OPEN" ? "Open" : f === "ANSWERED" ? "Answered" : "Closed"}
                            </Text>
                        </Pressable>
                    ))}
                </BlurView>
            </View>

            {/* List */}
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => fetchDoubts(true)} tintColor={COLORS.primary} />
                }
            >
                {isLoading ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loadingText}>Loading doubts...</Text>
                    </View>
                ) : doubts.length > 0 ? (
                    <View style={styles.listContainer}>
                        {doubts.map((doubt, index) => (
                            <Animated.View key={doubt.id} entering={FadeInDown.delay(index * 80).duration(500)}>
                                <Pressable
                                    style={({ pressed }) => [styles.messageItem, pressed && { opacity: 0.95, transform: [{ scale: 0.98 }] }]}
                                    onPress={() => {
                                        setSelectedDoubt(doubt);
                                        setShowDetailModal(true);
                                        fetchDoubtDetail(doubt.id);
                                    }}
                                >
                                    {/* Pin/Lock flags */}
                                    {(doubt.isPinned || doubt.isLocked) && (
                                        <View style={styles.flagRow}>
                                            {doubt.isPinned && (
                                                <View style={styles.pinFlag}>
                                                    <Ionicons name="pin" size={10} color="#F59E0B" />
                                                    <Text style={[styles.flagText, { color: "#F59E0B" }]}>Pinned</Text>
                                                </View>
                                            )}
                                            {doubt.isLocked && (
                                                <View style={styles.lockFlag}>
                                                    <Ionicons name="lock-closed" size={10} color="#EF4444" />
                                                    <Text style={[styles.flagText, { color: "#EF4444" }]}>Locked</Text>
                                                </View>
                                            )}
                                        </View>
                                    )}

                                    <View style={styles.cardHeader}>
                                        <View style={styles.avatarRow}>
                                            <Image
                                                source={{ uri: doubt.user.profilePic || dicebear(doubt.user.name) }}
                                                style={styles.avatar}
                                            />
                                            <View>
                                                <Text style={styles.userName}>{doubt.user.name}</Text>
                                                <Text style={styles.timestamp}>
                                                    {format(new Date(doubt.createdAt), "MMM d, h:mm a")}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[doubt.status] + "20" }]}>
                                            <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[doubt.status] }]} />
                                            <Text style={[styles.statusText, { color: STATUS_COLORS[doubt.status] }]}>
                                                {doubt.status}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.cardBody}>
                                        <Text style={styles.doubtTitle}>{doubt.title}</Text>
                                        <Text style={styles.doubtBody} numberOfLines={2}>{doubt.content}</Text>
                                    </View>

                                    <View style={styles.cardFooter}>
                                        <View style={styles.subjectBadge}>
                                            <Ionicons name="library-outline" size={12} color={COLORS.primary} />
                                            <Text style={styles.subjectText}>
                                                {doubt.subject?.name || "General"}
                                            </Text>
                                        </View>
                                        {doubt.class && (
                                            <View style={[styles.subjectBadge, { backgroundColor: "#F0FDF4", marginLeft: 6 }]}>
                                                <Ionicons name="school-outline" size={12} color="#10B981" />
                                                <Text style={[styles.subjectText, { color: "#10B981" }]}>
                                                    {doubt.class.name}
                                                </Text>
                                            </View>
                                        )}
                                        <View style={styles.footerActions}>
                                            {doubt._count.replies > 0 && (
                                                <View style={styles.replyCounter}>
                                                    <Ionicons name="chatbubble-ellipses-outline" size={14} color={COLORS.textMuted} />
                                                    <Text style={styles.replyCountText}>{doubt._count.replies}</Text>
                                                </View>
                                            )}
                                            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                                        </View>
                                    </View>
                                </Pressable>
                            </Animated.View>
                        ))}
                    </View>
                ) : (
                    <Animated.View entering={ZoomIn} style={styles.emptyCard}>
                        <View style={styles.emptyIconBox}>
                            <Ionicons name="chatbubbles-outline" size={48} color={COLORS.textMuted} />
                        </View>
                        <Text style={styles.emptyTitle}>No doubts found</Text>
                        <Text style={styles.emptyText}>
                            {filter.status === "ALL"
                                ? "Students haven't posted any doubts yet."
                                : `No ${filter.status?.toLowerCase()} doubts. Try a different filter.`}
                        </Text>
                    </Animated.View>
                )}
            </ScrollView>

            <TeacherBottomNav />

            {/* ═══════════════════════════════════════
                 DOUBT DETAIL MODAL
            ═══════════════════════════════════════ */}
            <Modal visible={showDetailModal} animationType="slide" transparent={false}>
                <View style={styles.detailContainer}>
                    <BlurView intensity={40} tint="light" style={[styles.detailHeader, { paddingTop: insets.top + 10 }]}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => { setShowDetailModal(false); setSelectedDoubt(null); setDoubtDetails(null); }}
                        >
                            <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
                        </TouchableOpacity>
                        <View style={styles.headerTitleContainer}>
                            <Text style={styles.headerTitle} numberOfLines={1}>Discussion</Text>
                            <Text style={styles.headerSubtitle}>{selectedDoubt?.subject?.name || "General"}</Text>
                        </View>
                        {/* Moderation quick buttons */}
                        {doubtDetails && (
                            <View style={{ flexDirection: "row", gap: 8 }}>
                                <TouchableOpacity
                                    style={[styles.modQuickBtn, doubtDetails.isPinned && { backgroundColor: "#FFFBEB" }]}
                                    onPress={() => handleModerate("pin")}
                                >
                                    <Ionicons name="pin" size={16} color={doubtDetails.isPinned ? "#F59E0B" : "#94A3B8"} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modQuickBtn, doubtDetails.isLocked && { backgroundColor: "#FEF2F2" }]}
                                    onPress={() => handleModerate("lock")}
                                >
                                    <Ionicons name={doubtDetails.isLocked ? "lock-closed" : "lock-open"} size={16} color={doubtDetails.isLocked ? "#EF4444" : "#94A3B8"} />
                                </TouchableOpacity>
                                {doubtDetails.status !== "CLOSED" ? (
                                    <TouchableOpacity style={styles.resolveButton} onPress={() => handleModerate("close")}>
                                        <Ionicons name="checkmark-done" size={18} color={COLORS.success} />
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity style={[styles.resolveButton, { backgroundColor: "#EEF2FF" }]} onPress={() => handleModerate("reopen")}>
                                        <Ionicons name="lock-open-outline" size={18} color={COLORS.primary} />
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    </BlurView>

                    {detailLoading ? (
                        <View style={styles.centerLoader}>
                            <ActivityIndicator size="large" color={COLORS.primary} />
                            <Text style={styles.loaderText}>Loading discussion...</Text>
                        </View>
                    ) : doubtDetails ? (
                        <KeyboardAvoidingView
                            behavior={Platform.OS === "ios" ? "padding" : undefined}
                            style={{ flex: 1 }}
                        >
                            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
                                {/* Original Question */}
                                <Animated.View entering={FadeInUp} style={styles.questionCard}>
                                    <View style={styles.authorRow}>
                                        <Image
                                            source={{ uri: doubtDetails.user.profilePic || dicebear(doubtDetails.user.name) }}
                                            style={[styles.avatar, styles.smallAvatar]}
                                        />
                                        <View>
                                            <Text style={styles.authorName}>{doubtDetails.user.name}</Text>
                                            <Text style={styles.authorMeta}>
                                                {format(new Date(doubtDetails.createdAt), "MMM d, yyyy • h:mm a")}
                                            </Text>
                                        </View>
                                        <View style={styles.opBadge}>
                                            <Text style={styles.opText}>Student</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.detailTitleText}>{doubtDetails.title}</Text>
                                    <Text style={styles.detailContentText}>{doubtDetails.content}</Text>

                                    {/* Class & Subject */}
                                    <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
                                        {doubtDetails.subject && (
                                            <View style={styles.subjectBadge}>
                                                <Ionicons name="library-outline" size={11} color={COLORS.primary} />
                                                <Text style={styles.subjectText}>{doubtDetails.subject.name}</Text>
                                            </View>
                                        )}
                                        {doubtDetails.class && (
                                            <View style={[styles.subjectBadge, { backgroundColor: "#F0FDF4" }]}>
                                                <Ionicons name="school-outline" size={11} color="#10B981" />
                                                <Text style={[styles.subjectText, { color: "#10B981" }]}>{doubtDetails.class.name}</Text>
                                            </View>
                                        )}
                                    </View>
                                </Animated.View>

                                {/* Replies header */}
                                <View style={styles.repliesHeader}>
                                    <Text style={styles.repliesTitle}>
                                        Responses ({doubtDetails.replies?.length || 0})
                                    </Text>
                                </View>

                                {/* Replies */}
                                {(doubtDetails.replies || []).map((reply, idx) => (
                                    <Animated.View
                                        key={reply.id}
                                        entering={FadeInDown.delay(idx * 80)}
                                        style={[
                                            styles.replyCard,
                                            reply.role === "teacher" && styles.teacherReplyCard,
                                        ]}
                                    >
                                        <View style={styles.replyMain}>
                                            <View style={styles.authorRow}>
                                                <Image
                                                    source={{ uri: reply.user.profilePic || dicebear(reply.user.name) }}
                                                    style={[styles.avatar, styles.smallAvatar, { backgroundColor: reply.role === "teacher" ? "#EEF2FF" : "#F8FAFC" }]}
                                                />
                                                <View>
                                                    <View style={styles.nameRow}>
                                                        <Text style={styles.authorName}>{reply.user.name}</Text>
                                                        {reply.role === "teacher" && (
                                                            <View style={styles.teacherBadge}>
                                                                <Ionicons name="ribbon" size={10} color="#4F46E5" />
                                                                <Text style={styles.teacherBadgeText}>Teacher</Text>
                                                            </View>
                                                        )}
                                                    </View>
                                                    <Text style={styles.authorMeta}>
                                                        {format(new Date(reply.createdAt), "MMM d, h:mm a")}
                                                    </Text>
                                                </View>
                                            </View>
                                            <Text style={styles.replyContent}>{reply.content}</Text>
                                        </View>
                                        <View style={styles.voteBar}>
                                            <TouchableOpacity style={styles.voteBtn} onPress={() => handleVote(reply.id, 1)}>
                                                <Ionicons name="arrow-up" size={16} color={COLORS.textSecondary} />
                                            </TouchableOpacity>
                                            <Text style={styles.voteNumber}>{reply.upvotes || reply.votes || 0}</Text>
                                            <TouchableOpacity style={styles.voteBtn} onPress={() => handleVote(reply.id, -1)}>
                                                <Ionicons name="arrow-down" size={16} color={COLORS.textSecondary} />
                                            </TouchableOpacity>
                                        </View>
                                    </Animated.View>
                                ))}

                                {(!doubtDetails.replies || doubtDetails.replies.length === 0) && (
                                    <View style={styles.emptyThread}>
                                        <Ionicons name="hourglass-outline" size={40} color={COLORS.textMuted} />
                                        <Text style={styles.emptyThreadText}>No responses yet. Be the first to help!</Text>
                                    </View>
                                )}
                            </ScrollView>

                            {/* Reply Dock */}
                            {doubtDetails.status !== "CLOSED" ? (
                                <BlurView intensity={60} tint="light" style={[styles.replyDock, { paddingBottom: insets.bottom + 10 }]}>
                                    <View style={styles.replyDockContent}>
                                        <TextInput
                                            style={styles.replyDockInput}
                                            placeholder="Type your answer..."
                                            placeholderTextColor={COLORS.textMuted}
                                            multiline
                                            value={replyContent}
                                            onChangeText={setReplyContent}
                                        />
                                        <TouchableOpacity
                                            style={[styles.replySendBtn, !replyContent.trim() && styles.replySendDisabled]}
                                            onPress={handlePostReply}
                                            disabled={isSubmitting || !replyContent.trim()}
                                        >
                                            {isSubmitting
                                                ? <ActivityIndicator size="small" color="#FFF" />
                                                : <Ionicons name="send" size={20} color="#FFF" />
                                            }
                                        </TouchableOpacity>
                                    </View>
                                </BlurView>
                            ) : (
                                <View style={[styles.closedDock, { paddingBottom: insets.bottom + 20 }]}>
                                    <Ionicons name="lock-closed" size={16} color={COLORS.textMuted} />
                                    <Text style={styles.closedDockText}>
                                        {doubtDetails.isLocked ? "Discussion is locked" : "Discussion marked as resolved"}
                                    </Text>
                                </View>
                            )}
                        </KeyboardAvoidingView>
                    ) : null}
                </View>
            </Modal>
        </View>
    );
}

// ── Styles (mirrors student doubts.tsx exactly) ────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFC" },

    heroContainer: {
        marginHorizontal: 16, marginTop: 16,
        borderRadius: 24, overflow: "hidden",
        elevation: 8, shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20,
    },
    heroGradient: { padding: 24 },
    heroContent: { gap: 20 },
    statsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-around" },
    statItem: { alignItems: "center", flex: 1 },
    statValue: { fontSize: 26, fontWeight: "800", color: "#FFF" },
    statLabel: { fontSize: 11, color: "rgba(255,255,255,0.8)", marginTop: 4, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 },
    divider: { width: 1, height: 30, backgroundColor: "rgba(255,255,255,0.2)" },
    searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 16, paddingHorizontal: 16, height: 50, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
    searchInput: { flex: 1, marginLeft: 10, color: "#FFF", fontSize: 15 },

    filterSection: { marginTop: 16, paddingHorizontal: 16 },
    filterBar: { flexDirection: "row", padding: 6, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.7)", overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.3)", gap: 8 },
    filterChip: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 14 },
    activeChip: { backgroundColor: "#FFF", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    chipText: { fontSize: 13, fontWeight: "600", color: COLORS.textMuted },
    activeChipText: { color: COLORS.primary },

    listContainer: { padding: 16, gap: 16 },
    messageItem: { backgroundColor: "#FFF", borderRadius: 20, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 3, borderWidth: 1, borderColor: "rgba(0,0,0,0.03)" },

    flagRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
    pinFlag: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#FFFBEB", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: "#FDE68A" },
    lockFlag: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#FEF2F2", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: "#FECACA" },
    flagText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },

    cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
    avatarRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    avatar: { width: 44, height: 44, borderRadius: 15 },
    userName: { fontSize: 15, fontWeight: "700", color: COLORS.textPrimary },
    timestamp: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
    statusBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, gap: 6 },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { fontSize: 10, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 },

    cardBody: { marginBottom: 16 },
    doubtTitle: { fontSize: 17, fontWeight: "700", color: COLORS.textPrimary, marginBottom: 6, lineHeight: 22 },
    doubtBody: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },

    cardFooter: { flexDirection: "row", alignItems: "center", paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.03)" },
    subjectBadge: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.primary + "10", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, gap: 6 },
    subjectText: { fontSize: 12, fontWeight: "600", color: COLORS.primary },
    footerActions: { flexDirection: "row", alignItems: "center", gap: 12, marginLeft: "auto" },
    replyCounter: { flexDirection: "row", alignItems: "center", gap: 4 },
    replyCountText: { fontSize: 13, fontWeight: "600", color: COLORS.textMuted },

    loaderContainer: { paddingVertical: 80, alignItems: "center" },
    loadingText: { marginTop: 12, fontSize: 14, color: COLORS.textMuted },
    emptyCard: { marginTop: 60, alignItems: "center", paddingHorizontal: 40 },
    emptyIconBox: { width: 100, height: 100, borderRadius: 50, backgroundColor: "#FFF", justifyContent: "center", alignItems: "center", marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 },
    emptyTitle: { fontSize: 20, fontWeight: "700", color: COLORS.textPrimary, marginBottom: 8 },
    emptyText: { fontSize: 14, color: COLORS.textMuted, textAlign: "center", lineHeight: 20 },

    // Detail modal
    detailContainer: { flex: 1, backgroundColor: "#F8FAFC" },
    detailHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 16, gap: 12, borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.05)" },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#F1F5F9", justifyContent: "center", alignItems: "center" },
    headerTitleContainer: { flex: 1 },
    headerTitle: { fontSize: 18, fontWeight: "700", color: COLORS.textPrimary },
    headerSubtitle: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
    modQuickBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: "#F1F5F9", justifyContent: "center", alignItems: "center" },
    resolveButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.success + "15", justifyContent: "center", alignItems: "center" },

    centerLoader: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
    loaderText: { fontSize: 14, color: COLORS.textMuted },

    questionCard: { backgroundColor: "#FFF", margin: 16, borderRadius: 20, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
    authorRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
    smallAvatar: { width: 38, height: 38, borderRadius: 12 },
    authorName: { fontSize: 15, fontWeight: "700", color: COLORS.textPrimary },
    authorMeta: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
    nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    opBadge: { marginLeft: "auto", backgroundColor: COLORS.primary + "15", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    opText: { fontSize: 11, fontWeight: "700", color: COLORS.primary },
    detailTitleText: { fontSize: 20, fontWeight: "800", color: COLORS.textPrimary, marginBottom: 10, lineHeight: 26 },
    detailContentText: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22 },

    repliesHeader: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 12 },
    repliesTitle: { fontSize: 16, fontWeight: "700", color: COLORS.textPrimary },

    replyCard: { marginHorizontal: 16, marginBottom: 12, backgroundColor: "#FFF", borderRadius: 16, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
    teacherReplyCard: { borderLeftWidth: 3, borderLeftColor: COLORS.primary, backgroundColor: COLORS.primary + "04" },
    replyMain: { flex: 1 },
    teacherBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#EEF2FF", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    teacherBadgeText: { fontSize: 10, fontWeight: "700", color: "#4F46E5" },
    replyContent: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20, marginTop: 8 },
    voteBar: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.04)" },
    voteBtn: { padding: 4 },
    voteNumber: { fontSize: 14, fontWeight: "700", color: COLORS.textPrimary, minWidth: 20, textAlign: "center" },

    emptyThread: { alignItems: "center", paddingVertical: 40, gap: 12 },
    emptyThreadText: { fontSize: 14, color: COLORS.textMuted, textAlign: "center" },

    replyDock: { borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.06)", paddingTop: 12, paddingHorizontal: 16 },
    replyDockContent: { flexDirection: "row", alignItems: "flex-end", gap: 12, backgroundColor: "#FFF", borderRadius: 20, padding: 12, borderWidth: 1, borderColor: "#E2E8F0" },
    replyDockInput: { flex: 1, fontSize: 15, color: COLORS.textPrimary, maxHeight: 100 },
    replySendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, justifyContent: "center", alignItems: "center" },
    replySendDisabled: { opacity: 0.4 },

    closedDock: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 20, backgroundColor: "#F8FAFC", borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.06)" },
    closedDockText: { fontSize: 14, color: COLORS.textMuted },
});
