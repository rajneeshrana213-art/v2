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
    Modal,
    TextInput,
    Platform,
    Dimensions,
    KeyboardAvoidingView,
    Linking,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp, Layout } from "react-native-reanimated";
import { router } from "expo-router";
import { format, differenceInDays, isPast } from "date-fns";
import { api } from "@/lib/api";
import { TeacherBottomNav } from "@/components/TeacherBottomNav";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ClassInfo { id: string; name: string; }
interface SubjectInfo { id: string; name: string; classId: string; }
interface HomeworkItem {
    id: string;
    title: string;
    description: string | null;
    dueDate: string;
    status: string;
    class: { name: string };
    subject: { name: string };
    _count: { HomeworkSubmission: number };
    attachment: string | null;
    createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    PENDING: { label: "Pending", color: "#4F46E5", bg: "#EEF2FF" },
    SUBMITTED: { label: "Submitted", color: "#F59E0B", bg: "#FFFBEB" },
    GRADED: { label: "Graded", color: "#10B981", bg: "#ECFDF5" },
    OVERDUE: { label: "Overdue", color: "#EF4444", bg: "#FEF2F2" },
};

const SUBJECT_COLORS = [
    "#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#EC4899",
];

const { height } = Dimensions.get("window");

// ─── Component ────────────────────────────────────────────────────────────────
export default function TeacherHomeworkPage() {
    const insets = useSafeAreaInsets();

    // ── List state ──
    const [homeworks, setHomeworks] = useState<HomeworkItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<"ALL" | "PENDING" | "SUBMITTED" | "GRADED" | "OVERDUE">("ALL");

    // ── Metadata ──
    const [classes, setClasses] = useState<ClassInfo[]>([]);
    const [subjects, setSubjects] = useState<SubjectInfo[]>([]);

    // ── Create modal state ──
    const [showModal, setShowModal] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState<Date>(new Date(Date.now() + 86400000 * 3));
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedClassId, setSelectedClassId] = useState("");
    const [selectedSubjectId, setSelectedSubjectId] = useState("");
    const [attachment, setAttachment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const filteredSubjects = subjects.filter(s => s.classId === selectedClassId);

    // ── Fetch list ──────────────────────────────────────────────────────────────
    const fetchHomework = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true); else setLoading(true);
        try {
            const data = await api.get<HomeworkItem[]>("/api/v1/dashboard/teacher/homework");
            setHomeworks((data as any) || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); setRefreshing(false); }
    }, []);

    // ── Fetch metadata (classes + subjects) ─────────────────────────────────────
    const fetchMetadata = useCallback(async () => {
        try {
            const data = await api.get<{ classes: ClassInfo[]; subjects: SubjectInfo[] }>(
                "/api/v1/dashboard/teacher/homework/metadata"
            );
            const d = data as any;
            setClasses(d?.classes || []);
            setSubjects(d?.subjects || []);
            if (d?.classes?.length > 0) setSelectedClassId(d.classes[0].id);
        } catch (e) { console.error(e); }
    }, []);

    useEffect(() => { 
        fetchHomework(); 
        fetchMetadata(); 
    }, [fetchHomework, fetchMetadata]);

    // ── Create homework ─────────────────────────────────────────────────────────
    const handleCreate = useCallback(async () => {
        if (!title.trim()) return Alert.alert("Missing field", "Please enter a title.");
        if (!selectedClassId) return Alert.alert("Missing field", "Please select a class.");
        if (!selectedSubjectId) return Alert.alert("Missing field", "Please select a subject.");

        // Validate: due date must not be in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dueDate);
        due.setHours(0, 0, 0, 0);
        if (due < today) {
            return Alert.alert(
                "Invalid Due Date",
                "Due date cannot be in the past. Please select today or a future date."
            );
        }

        setSubmitting(true);
        try {
            await api.post("/api/v1/dashboard/teacher/homework", {
                title: title.trim(),
                description: description.trim() || undefined,
                dueDate: dueDate.toISOString(),
                classId: selectedClassId,
                subjectId: selectedSubjectId,
                attachment: attachment.trim() || undefined,
            });
            Alert.alert("Created!", "Homework assigned successfully.");
            setShowModal(false);
            resetForm();
            fetchHomework();
        } catch (e: any) {
            Alert.alert("Error", e?.message || "Failed to create homework.");
        } finally { setSubmitting(false); }
    }, [title, description, dueDate, selectedClassId, selectedSubjectId, attachment, fetchHomework]);

    const resetForm = () => {
        setTitle(""); setDescription("");
        setDueDate(new Date(Date.now() + 86400000 * 3));
        setSelectedSubjectId("");
    };

    // ── Update status ───────────────────────────────────────────────────────────
    const updateStatus = useCallback(async (hw: HomeworkItem, newStatus: string) => {
        try {
            await api.put(`/api/v1/dashboard/teacher/homework/${hw.id}`, { status: newStatus });
            setHomeworks(prev => prev.map(h => h.id === hw.id ? { ...h, status: newStatus } : h));
        } catch (e: any) {
            Alert.alert("Error", e?.message || "Failed to update status.");
        }
    }, []);

    // ── Derived data ────────────────────────────────────────────────────────────
    const filtered = homeworks.filter(h => filter === "ALL" || h.status === filter);
    const pendingCount = homeworks.filter(h => h.status === "PENDING" || h.status === "SUBMITTED").length;
    const completedCount = homeworks.filter(h => h.status === "GRADED").length;

    const getDueDiff = (dueDate: string) => {
        const d = new Date(dueDate);
        if (isPast(d)) return { text: "Overdue", color: "#EF4444" };
        const days = differenceInDays(d, new Date());
        if (days === 0) return { text: "Due today", color: "#F59E0B" };
        if (days === 1) return { text: "Due tomorrow", color: "#F97316" };
        return { text: `${days} days left`, color: "#10B981" };
    };

    // ─── Render ─────────────────────────────────────────────────────────────────
    return (
        <View style={styles.root}>

            {/* ── Header ── */}
            <LinearGradient
                colors={["#4F46E5", "#7C3AED", "#9333EA"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={[styles.header, { paddingTop: insets.top + 20 }]}
            >
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={20} color="#fff" />
                </Pressable>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>Homework</Text>
                    <Text style={styles.headerSub}>Assign and manage homework</Text>
                </View>
                <Pressable onPress={() => setShowModal(true)} style={styles.addBtn}>
                    <Ionicons name="add" size={22} color="#fff" />
                </Pressable>
            </LinearGradient>

            {/* ── Stats ── */}
            {!loading && (
                <Animated.View entering={FadeInDown.duration(350)} style={styles.statsRow}>
                    {[
                        { label: "Total", value: homeworks.length, color: "#4F46E5", bg: "#EEF2FF", icon: "document-text" as const },
                        { label: "Active", value: pendingCount, color: "#F59E0B", bg: "#FFFBEB", icon: "time" as const },
                        { label: "Reviewed", value: completedCount, color: "#10B981", bg: "#ECFDF5", icon: "checkmark-circle" as const },
                    ].map(s => (
                        <View key={s.label} style={[styles.statCard, { backgroundColor: s.bg }]}>
                            <Ionicons name={s.icon} size={18} color={s.color} />
                            <Text style={[styles.statVal, { color: s.color }]}>{s.value}</Text>
                            <Text style={styles.statLbl}>{s.label}</Text>
                        </View>
                    ))}
                </Animated.View>
            )}

            {/* ── Filter tabs ── */}
            <Animated.View entering={FadeInDown.delay(100)} style={styles.filterRow}>
                {(["ALL", "PENDING", "SUBMITTED", "GRADED", "OVERDUE"] as const).map(f => (
                    <Pressable
                        key={f}
                        onPress={() => setFilter(f)}
                        style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
                    >
                        <Text style={[styles.filterBtnText, filter === f && styles.filterBtnTextActive]}>
                            {f === "ALL" ? "All" : f === "PENDING" ? "Pending" : f === "SUBMITTED" ? "Submitted" : f === "GRADED" ? "Graded" : "Overdue"}
                        </Text>
                    </Pressable>
                ))}
            </Animated.View>

            {/* ── List ── */}
            {loading ? (
                <View style={styles.loaderBox}>
                    <ActivityIndicator size="large" color="#4F46E5" />
                    <Text style={styles.loaderText}>Loading homework…</Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 140, paddingTop: 8 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => fetchHomework(true)} tintColor="#4F46E5" />
                    }
                >
                    {filtered.length === 0 ? (
                        <View style={styles.emptyBox}>
                            <View style={styles.emptyIcon}>
                                <Ionicons name="document-text-outline" size={40} color="#CBD5E1" />
                            </View>
                            <Text style={styles.emptyTitle}>No homework yet</Text>
                            <Text style={styles.emptySubtitle}>Tap the + button to assign homework to your class.</Text>
                            <Pressable onPress={() => setShowModal(true)} style={styles.emptyCreateBtn}>
                                <Ionicons name="add-circle" size={18} color="#4F46E5" />
                                <Text style={styles.emptyCreateBtnText}>Create Homework</Text>
                            </Pressable>
                        </View>
                    ) : (
                        filtered.map((hw, idx) => {
                            let displayStatus = hw.status;
                            // If there are submissions, show as SUBMITTED even if status is PENDING
                            if (displayStatus === "PENDING" && (hw._count?.HomeworkSubmission ?? 0) > 0) {
                                displayStatus = "SUBMITTED";
                            }
                            
                            const statusCfg = STATUS_CONFIG[displayStatus] || STATUS_CONFIG.PENDING;
                            const due = getDueDiff(hw.dueDate);
                            const accentColor = SUBJECT_COLORS[idx % SUBJECT_COLORS.length];

                            return (
                                <Animated.View key={hw.id} entering={FadeInDown.delay(idx * 60)} layout={Layout.springify()}>
                                    <Pressable 
                                        onPress={() => router.push({ pathname: "/pages/homework-submissions", params: { id: hw.id } })}
                                        style={({ pressed }) => [
                                            styles.hwCard,
                                            pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 }
                                        ]}
                                    >
                                        {/* Left accent */}
                                        <View style={[styles.hwAccent, { backgroundColor: accentColor }]} />

                                        <View style={{ flex: 1, padding: 14 }}>
                                            {/* Top row */}
                                            <View style={styles.hwTopRow}>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.hwTitle} numberOfLines={2}>{hw.title}</Text>
                                                    <View style={styles.hwMeta}>
                                                        <View style={styles.hwMetaItem}>
                                                            <Ionicons name="school-outline" size={12} color="#94A3B8" />
                                                            <Text style={styles.hwMetaText}>{hw.class?.name}</Text>
                                                        </View>
                                                        <View style={styles.hwMetaSep} />
                                                        <View style={styles.hwMetaItem}>
                                                            <Ionicons name="book-outline" size={12} color="#94A3B8" />
                                                            <Text style={styles.hwMetaText}>{hw.subject?.name}</Text>
                                                        </View>
                                                    </View>
                                                </View>
                                                {/* Status badge */}
                                                <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                                                    <View style={[styles.statusDot, { backgroundColor: statusCfg.color }]} />
                                                    <Text style={[styles.statusText, { color: statusCfg.color }]}>
                                                        {displayStatus === "PENDING" && (hw._count?.HomeworkSubmission ?? 0) > 0 ? "Submitted" : statusCfg.label}
                                                    </Text>
                                                </View>
                                            </View>

                                            {/* Description */}
                                            {hw.description ? (
                                                <Text style={styles.hwDesc} numberOfLines={2}>{hw.description}</Text>
                                            ) : null}

                                            {/* Bottom row */}
                                            <View style={styles.hwBottomRow}>
                                                <View style={styles.hwInfoChips}>
                                                    {/* Due date */}
                                                    <View style={[styles.dueChip, { backgroundColor: due.color + "15" }]}>
                                                        <Ionicons name="calendar" size={11} color={due.color} />
                                                        <Text style={[styles.dueChipText, { color: due.color }]}>{due.text}</Text>
                                                    </View>
                                                    {/* Submissions */}
                                                    <View style={styles.subChip}>
                                                        <Ionicons name="cloud-upload-outline" size={11} color="#64748B" />
                                                        <Text style={styles.subChipText}>{hw._count?.HomeworkSubmission ?? 0} submissions</Text>
                                                    </View>
                                                </View>

                                                {/* Mark as graded */}
                                                {hw.status !== "GRADED" && (
                                                    <Pressable
                                                        onPress={() => updateStatus(hw, "GRADED")}
                                                        style={styles.markBtn}
                                                    >
                                                        <Ionicons name="checkmark-done" size={14} color="#10B981" />
                                                        <Text style={styles.markBtnText}>Mark graded</Text>
                                                    </Pressable>
                                                )}
                                            </View>

                                            <Text style={styles.hwDate}>
                                                Assigned {format(new Date(hw.createdAt), "MMM d, yyyy")}  ·  Due {format(new Date(hw.dueDate), "MMM d, yyyy")}
                                            </Text>
                                            
                                            {/* Teacher's uploaded attachment */}
                                            {hw.attachment && (
                                                <Pressable 
                                                    onPress={() => {
                                                        Linking.openURL(hw.attachment!).catch(() => Alert.alert("Error", "Could not open attachment."));
                                                    }}
                                                    style={styles.attachmentBtn}
                                                >
                                                    <Ionicons name="document-attach" size={14} color="#4F46E5" />
                                                    <Text style={styles.attachmentBtnText}>View My Attachment</Text>
                                                </Pressable>
                                            )}
                                        </View>
                                    </Pressable>
                                </Animated.View>
                            );
                        })
                    )}
                </ScrollView>
            )}

            {/* ── FAB ── */}
            <Animated.View entering={FadeInUp.delay(300)} style={[styles.fab, { bottom: insets.bottom + 90 }]}>
                <Pressable
                    onPress={() => setShowModal(true)}
                    style={({ pressed }) => [styles.fabBtn, pressed && { transform: [{ scale: 0.93 }] }]}
                >
                    <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={styles.fabGradient}>
                        <Ionicons name="add" size={26} color="#fff" />
                    </LinearGradient>
                </Pressable>
            </Animated.View>

            <TeacherBottomNav />

            {/* ════════════════════════════════════════════════════════════════
           CREATE MODAL
      ════════════════════════════════════════════════════════════════ */}
            <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                >
                    <Pressable style={styles.modalOverlay} onPress={() => setShowModal(false)} />
                    <View style={[styles.modalSheet, { paddingBottom: insets.bottom + 16 }]}>

                        {/* Drag handle */}
                        <View style={styles.dragHandle} />

                        {/* Modal Header */}
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>Assign Homework</Text>
                                <Text style={styles.modalSubtitle}>Fill in the details below</Text>
                            </View>
                            <Pressable onPress={() => setShowModal(false)} style={styles.closeBtn}>
                                <Ionicons name="close" size={20} color="#64748B" />
                            </Pressable>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>

                            {/* Title */}
                            <Text style={styles.fieldLabel}>Title <Text style={{ color: "#EF4444" }}>*</Text></Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Chapter 5 exercise problems"
                                placeholderTextColor="#CBD5E1"
                                value={title}
                                onChangeText={setTitle}
                            />

                            {/* Description */}
                            <Text style={styles.fieldLabel}>Description <Text style={{ color: "#94A3B8" }}>(optional)</Text></Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Add details, page numbers, resources…"
                                placeholderTextColor="#CBD5E1"
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />

                            {/* Class Picker */}
                            <Text style={styles.fieldLabel}>Class <Text style={{ color: "#EF4444" }}>*</Text></Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                                <View style={{ flexDirection: "row", gap: 8 }}>
                                    {classes.map(cls => (
                                        <Pressable
                                            key={cls.id}
                                            onPress={() => { setSelectedClassId(cls.id); setSelectedSubjectId(""); }}
                                            style={[
                                                styles.optionChip,
                                                selectedClassId === cls.id && styles.optionChipActive,
                                            ]}
                                        >
                                            <Text style={[styles.optionChipText, selectedClassId === cls.id && styles.optionChipTextActive]}>
                                                {cls.name}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </ScrollView>

                            {/* Subject Picker */}
                            <Text style={styles.fieldLabel}>Subject <Text style={{ color: "#EF4444" }}>*</Text></Text>
                            {filteredSubjects.length === 0 ? (
                                <Text style={styles.noDataText}>
                                    {selectedClassId ? "No subjects for this class" : "Select a class first"}
                                </Text>
                            ) : (
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                                    <View style={{ flexDirection: "row", gap: 8 }}>
                                        {filteredSubjects.map(sub => (
                                            <Pressable
                                                key={sub.id}
                                                onPress={() => setSelectedSubjectId(sub.id)}
                                                style={[
                                                    styles.optionChip,
                                                    selectedSubjectId === sub.id && styles.optionChipActive,
                                                ]}
                                            >
                                                <Text style={[styles.optionChipText, selectedSubjectId === sub.id && styles.optionChipTextActive]}>
                                                    {sub.name}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                </ScrollView>
                            )}

                            {/* Due Date */}
                            <Text style={styles.fieldLabel}>Due Date <Text style={{ color: "#EF4444" }}>*</Text></Text>
                            <Pressable onPress={() => setShowDatePicker(true)} style={styles.datePickerBtn}>
                                <Ionicons name="calendar-outline" size={18} color="#4F46E5" />
                                <Text style={styles.datePickerText}>{format(dueDate, "EEEE, MMM d yyyy")}</Text>
                                <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
                            </Pressable>

                            {showDatePicker && (
                                <DateTimePicker
                                    value={dueDate}
                                    mode="date"
                                    display={Platform.OS === "ios" ? "inline" : "default"}
                                    minimumDate={new Date()}
                                    onChange={(_, d) => { setShowDatePicker(false); if (d) setDueDate(d); }}
                                />
                            )}

                            {/* Attachment */}
                            <Text style={styles.fieldLabel}>Attachment URL <Text style={{ color: "#94A3B8" }}>(optional)</Text></Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="link-outline" size={18} color="#64748B" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.inputWithIcon}
                                    placeholder="https://example.com/file.pdf"
                                    placeholderTextColor="#CBD5E1"
                                    value={attachment}
                                    onChangeText={setAttachment}
                                    autoCapitalize="none"
                                />
                            </View>

                            {/* Submit */}
                            <Pressable
                                onPress={handleCreate}
                                disabled={submitting}
                                style={({ pressed }) => [styles.createBtn, submitting && { opacity: 0.6 }, pressed && { transform: [{ scale: 0.97 }] }]}
                            >
                                <LinearGradient colors={["#4F46E5", "#7C3AED"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.createBtnGradient}>
                                    {submitting ? <ActivityIndicator color="#fff" /> : (
                                        <>
                                            <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                            <Text style={styles.createBtnText}>Assign Homework</Text>
                                        </>
                                    )}
                                </LinearGradient>
                            </Pressable>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F8FAFF" },

    // Header
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
    addBtn: {
        width: 38, height: 38, borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.25)",
        alignItems: "center", justifyContent: "center",
    },

    // Stats
    statsRow: {
        flexDirection: "row", marginHorizontal: 16, marginTop: 16, gap: 10,
    },
    statCard: {
        flex: 1, alignItems: "center", paddingVertical: 12,
        borderRadius: 14, gap: 3,
    },
    statVal: { fontSize: 20, fontFamily: "Inter_700Bold" },
    statLbl: { fontSize: 9, fontFamily: "Inter_600SemiBold", color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.4 },

    // Filters
    filterRow: {
        flexDirection: "row", marginHorizontal: 16,
        marginTop: 14, marginBottom: 4,
        backgroundColor: "#FFFFFF",
        borderRadius: 14, padding: 4,
        borderWidth: 1, borderColor: "#E2E8F0",
        shadowColor: "#94A3B8",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06, shadowRadius: 6,
        elevation: 2,
    },
    filterBtn: {
        flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 11,
    },
    filterBtnActive: { backgroundColor: "#4F46E5" },
    filterBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#94A3B8" },
    filterBtnTextActive: { color: "#fff" },

    // List
    loaderBox: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
    loaderText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#94A3B8" },
    emptyBox: { alignItems: "center", paddingVertical: 80, gap: 12 },
    emptyIcon: {
        width: 80, height: 80, borderRadius: 28,
        backgroundColor: "#F1F5F9",
        alignItems: "center", justifyContent: "center", marginBottom: 4,
    },
    emptyTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#1E293B" },
    emptySubtitle: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#94A3B8", textAlign: "center", paddingHorizontal: 32 },
    emptyCreateBtn: {
        flexDirection: "row", alignItems: "center", gap: 8,
        marginTop: 8, backgroundColor: "#EEF2FF",
        borderRadius: 14, paddingHorizontal: 20, paddingVertical: 12,
        borderWidth: 1, borderColor: "#C7D2FE",
    },
    emptyCreateBtnText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#4F46E5" },

    // Homework card
    hwCard: {
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        marginBottom: 12,
        overflow: "hidden",
        shadowColor: "#94A3B8",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.09, shadowRadius: 10,
        elevation: 3,
    },
    hwAccent: { width: 5 },
    hwTopRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 6 },
    hwTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#1E293B", flex: 1 },
    hwMeta: { flexDirection: "row", alignItems: "center", marginTop: 4, flexWrap: "wrap" },
    hwMetaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
    hwMetaText: { fontSize: 11, fontFamily: "Inter_500Medium", color: "#94A3B8" },
    hwMetaSep: { width: 1, height: 10, backgroundColor: "#E2E8F0", marginHorizontal: 6 },
    hwDesc: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#64748B", lineHeight: 18, marginBottom: 10 },
    hwBottomRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
    hwInfoChips: { flexDirection: "row", gap: 8, flexWrap: "wrap", flex: 1 },
    hwDate: { fontSize: 10, fontFamily: "Inter_400Regular", color: "#CBD5E1", marginBottom: 6 },
    attachmentBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#EEF2FF",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        alignSelf: "flex-start",
        marginTop: 4,
    },
    attachmentBtnText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#4F46E5" },

    statusBadge: {
        flexDirection: "row", alignItems: "center", gap: 5,
        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
    },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { fontSize: 11, fontFamily: "Inter_700Bold" },

    dueChip: {
        flexDirection: "row", alignItems: "center", gap: 4,
        paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
    },
    dueChipText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
    subChip: {
        flexDirection: "row", alignItems: "center", gap: 4,
        paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
        backgroundColor: "#F8FAFF",
    },
    subChipText: { fontSize: 11, fontFamily: "Inter_500Medium", color: "#64748B" },

    markBtn: {
        flexDirection: "row", alignItems: "center", gap: 5,
        backgroundColor: "#ECFDF5", borderRadius: 10,
        paddingHorizontal: 10, paddingVertical: 5,
        borderWidth: 1, borderColor: "#A7F3D0",
    },
    markBtnText: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#10B981" },

    // FAB
    fab: { position: "absolute", right: 20 },
    fabBtn: { borderRadius: 18 },
    fabGradient: {
        width: 56, height: 56, borderRadius: 18,
        alignItems: "center", justifyContent: "center",
        shadowColor: "#4F46E5", shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
    },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
    modalSheet: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 32, borderTopRightRadius: 32,
        padding: 24,
        maxHeight: height * 0.88,
        shadowColor: "#000", shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.12, shadowRadius: 24, elevation: 20,
    },
    dragHandle: {
        width: 40, height: 4, borderRadius: 2,
        backgroundColor: "#E2E8F0",
        alignSelf: "center", marginBottom: 20,
    },
    modalHeader: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start",
        marginBottom: 24,
    },
    modalTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#1E293B" },
    modalSubtitle: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#94A3B8", marginTop: 3 },
    closeBtn: {
        width: 36, height: 36, borderRadius: 12,
        backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center",
    },

    // Form fields
    fieldLabel: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#475569", marginBottom: 8 },
    input: {
        backgroundColor: "#F8FAFF", borderRadius: 14,
        borderWidth: 1, borderColor: "#E2E8F0",
        paddingHorizontal: 16, paddingVertical: 13,
        fontSize: 14, fontFamily: "Inter_500Medium", color: "#1E293B",
        marginBottom: 18,
    },
    textArea: { height: 110, textAlignVertical: "top" },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8FAFF",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        paddingHorizontal: 12,
        marginBottom: 20,
    },
    inputIcon: { marginRight: 8 },
    inputWithIcon: {
        flex: 1,
        height: 48,
        fontSize: 14,
        color: "#1E293B",
        fontFamily: "Inter_500Medium",
    },

    optionChip: {
        paddingHorizontal: 16, paddingVertical: 9, borderRadius: 12,
        borderWidth: 1, borderColor: "#E2E8F0",
        backgroundColor: "#F8FAFF",
    },
    optionChipActive: { backgroundColor: "#4F46E5", borderColor: "#4F46E5" },
    optionChipText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#64748B" },
    optionChipTextActive: { color: "#FFFFFF" },

    noDataText: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#94A3B8", marginBottom: 16 },

    datePickerBtn: {
        flexDirection: "row", alignItems: "center", gap: 12,
        backgroundColor: "#EEF2FF", borderRadius: 14,
        borderWidth: 1, borderColor: "#C7D2FE",
        paddingHorizontal: 16, paddingVertical: 14, marginBottom: 24,
    },
    datePickerText: { flex: 1, fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#4F46E5" },

    createBtn: { borderRadius: 16, marginTop: 8 },
    createBtnGradient: {
        flexDirection: "row", alignItems: "center", justifyContent: "center",
        gap: 10, paddingVertical: 16, borderRadius: 16,
    },
    createBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
});
