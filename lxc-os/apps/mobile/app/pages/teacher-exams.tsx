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
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { format } from "date-fns";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";
import { TeacherBottomNav } from "@/components/TeacherBottomNav";
import { PageHeader } from "@/components/PageHeader";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ClassInfo { id: string; name: string; }
interface SubjectInfo { id: string; name: string; classId: string; }
interface ExamItem {
    id: string;
    title: string;
    scheduleDate: string;
    startTime: string;
    endTime: string;
    totalMarks: number;
    passMark: number | null;
    isPublished: boolean;
    class: { name: string };
    subject: { name: string };
    _count: { results: number };
}

const { height } = Dimensions.get("window");

// ─── Component ────────────────────────────────────────────────────────────────
export default function TeacherExamsPage() {
    const router = useRouter();

    const [exams, setExams] = useState<ExamItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Metadata
    const [classes, setClasses] = useState<ClassInfo[]>([]);
    const [subjects, setSubjects] = useState<SubjectInfo[]>([]);

    // Create modal state
    const [showModal, setShowModal] = useState(false);
    const [title, setTitle] = useState("");
    const [examType, setExamType] = useState("Weekly Test");
    const [scheduleDate, setScheduleDate] = useState<Date>(new Date(Date.now() + 86400000 * 7));
    const [startTime, setStartTime] = useState<Date>(new Date());
    const [endTime, setEndTime] = useState<Date>(new Date(Date.now() + 3600000 * 3));
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);
    const [selectedClassId, setSelectedClassId] = useState("");
    const [selectedSubjectId, setSelectedSubjectId] = useState("");
    const [totalMarks, setTotalMarks] = useState("100");
    const [passMark, setPassMark] = useState("33");
    const [duration, setDuration] = useState("60");
    const [roomNumber, setRoomNumber] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const EXAM_TYPES = ["Weekly Test", "Biweekly Test", "Monthly Assessment", "Unit Test", "Custom"];

    const filteredSubjects = subjects.filter(s => s.classId === selectedClassId);

    const fetchExams = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true); else setLoading(true);
        try {
            const data = await api.get<ExamItem[]>("/api/v1/dashboard/teacher/exams");
            setExams((data as any) || []);
        } catch (error) { console.error(error); }
        finally { setLoading(false); setRefreshing(false); }
    }, []);

    const fetchMetadata = useCallback(async () => {
        try {
            const data = await api.get<{ classes: ClassInfo[]; subjects: SubjectInfo[] }>(
                "/api/v1/dashboard/teacher/homework/metadata"
            );
            const d = data as any;
            setClasses(d.classes || []);
            setSubjects(d.subjects || []);
        } catch (error) { console.error(error); }
    }, []);

    useEffect(() => {
        fetchExams();
        fetchMetadata();
    }, [fetchExams, fetchMetadata]);

    const handleCreateExam = async () => {
        if (!title || !selectedClassId || !selectedSubjectId) {
            Alert.alert("Error", "Please fill required fields");
            return;
        }

        setSubmitting(true);
        try {
            await api.post("/api/v1/dashboard/teacher/exams", {
                title: `${examType}: ${title}`,
                classId: selectedClassId,
                subjectId: selectedSubjectId,
                scheduleDate: scheduleDate.toISOString(),
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                totalMarks: parseInt(totalMarks),
                passMark: parseInt(passMark),
                duration: parseInt(duration),
                roomNumber: roomNumber ? parseInt(roomNumber) : undefined,
            });
            Alert.alert("Success", "Exam created successfully");
            setShowModal(false);
            fetchExams();
            // Reset
            setTitle("");
            setSelectedClassId("");
            setSelectedSubjectId("");
            setRoomNumber("");
        } catch (e: any) {
            Alert.alert("Error", e.message || "Failed to create exam");
        } finally {
            setSubmitting(false);
        }
    };

    const togglePublish = async (examId: string, currentStatus: boolean) => {
        try {
            await api.patch(`/api/v1/dashboard/teacher/exams?id=${examId}`, {
                publish: !currentStatus
            });
            fetchExams();
        } catch (error) { console.error(error); Alert.alert("Error", "Failed to update status"); }
    };

    const deleteExam = (examId: string) => {
        Alert.alert("Delete Exam", "Are you sure? This action cannot be undone.", [
            { text: "Cancel", style: "cancel" },
            { 
                text: "Delete", 
                style: "destructive",
                onPress: async () => {
                    try {
                        await api.delete(`/api/v1/dashboard/teacher/exams?id=${examId}`);
                        fetchExams();
                    } catch (error) { console.error(error); Alert.alert("Error", "Failed to delete exam"); }
                }
            }
        ]);
    };

    return (
        <View style={styles.container}>
            <PageHeader title="Manage Exams" subtitle="Schedule and publish assessments" />

            <ScrollView
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchExams(true)} />}
            >
                <Pressable style={styles.createBtn} onPress={() => setShowModal(true)}>
                    <LinearGradient colors={[COLORS.primary, "#6366F1"]} style={styles.createBtnGradient}>
                        <Ionicons name="add-circle-outline" size={24} color="#FFF" />
                        <Text style={styles.createBtnText}>Create New Exam</Text>
                    </LinearGradient>
                </Pressable>

                {loading ? (
                    <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
                ) : exams.length > 0 ? (
                    exams.map((exam, idx) => (
                        <Animated.View key={exam.id} entering={FadeInUp.delay(idx * 50)} style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View>
                                    <Text style={styles.cardClass}>{exam.class.name}</Text>
                                    <Text style={styles.cardSubject}>{exam.subject.name}</Text>
                                </View>
                                <View style={[styles.statusBadge, { backgroundColor: exam.isPublished ? "#ECFDF5" : "#FFFBEB" }]}>
                                    <Text style={[styles.statusText, { color: exam.isPublished ? "#10B981" : "#F59E0B" }]}>
                                        {exam.isPublished ? "Published" : "Draft"}
                                    </Text>
                                </View>
                            </View>

                            <Text style={styles.cardTitle}>{exam.title}</Text>

                            <View style={styles.cardMeta}>
                                <View style={styles.metaItem}>
                                    <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} />
                                    <Text style={styles.metaText}>{format(new Date(exam.scheduleDate), "MMM d, yyyy")}</Text>
                                </View>
                                <View style={styles.metaItem}>
                                    <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
                                    <Text style={styles.metaText}>
                                        {format(new Date(exam.startTime), "hh:mm a")}
                                    </Text>
                                </View>
                                <View style={styles.metaItem}>
                                    <Ionicons name="ribbon-outline" size={14} color={COLORS.textMuted} />
                                    <Text style={styles.metaText}>{exam.totalMarks} Marks</Text>
                                </View>
                            </View>

                            <View style={styles.cardActions}>
                                <Pressable style={styles.actionBtn} onPress={() => router.push({ pathname: "/pages/teacher-exam-results", params: { id: exam.id } } as any)}>
                                    <Ionicons name="stats-chart-outline" size={18} color={COLORS.primary} />
                                    <Text style={styles.actionBtnText}>Results</Text>
                                </Pressable>
                                <Pressable style={styles.actionBtn} onPress={() => togglePublish(exam.id, exam.isPublished)}>
                                    <Ionicons name={exam.isPublished ? "eye-off-outline" : "eye-outline"} size={18} color="#64748B" />
                                    <Text style={[styles.actionBtnText, { color: "#64748B" }]}>{exam.isPublished ? "Unpublish" : "Publish"}</Text>
                                </Pressable>
                                <Pressable style={styles.actionBtn} onPress={() => deleteExam(exam.id)}>
                                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                                    <Text style={[styles.actionBtnText, { color: "#EF4444" }]}>Delete</Text>
                                </Pressable>
                            </View>
                        </Animated.View>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="document-text-outline" size={48} color={COLORS.border} />
                        <Text style={styles.emptyText}>No exams scheduled yet</Text>
                    </View>
                )}
            </ScrollView>

            {/* Create Modal */}
            <Modal visible={showModal} animationType="slide" transparent>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Create Exam</Text>
                            <Pressable onPress={() => setShowModal(false)}>
                                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
                            </Pressable>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.label}>EXAM TYPE</Text>
                            <View style={styles.pickerContainer}>
                                {EXAM_TYPES.map(type => (
                                    <Pressable key={type} style={[styles.chip, examType === type && styles.chipActive]} onPress={() => setExamType(type)}>
                                        <Text style={[styles.chipText, examType === type && styles.chipTextActive]}>{type}</Text>
                                    </Pressable>
                                ))}
                            </View>

                            <Text style={styles.label}>EXAM TITLE</Text>
                            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. Weekly Test – Chapter 5" placeholderTextColor={COLORS.textMuted} />

                            <View style={styles.row}>
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <Text style={styles.label}>CLASS</Text>
                                    <View style={styles.pickerContainer}>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                            {classes.map(c => (
                                                <Pressable key={c.id} style={[styles.chip, selectedClassId === c.id && styles.chipActive]} onPress={() => setSelectedClassId(c.id)}>
                                                    <Text style={[styles.chipText, selectedClassId === c.id && styles.chipTextActive]}>{c.name}</Text>
                                                </Pressable>
                                            ))}
                                        </ScrollView>
                                    </View>
                                </View>
                            </View>

                            <Text style={styles.label}>SUBJECT</Text>
                            <View style={styles.pickerContainer}>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    {filteredSubjects.length > 0 ? filteredSubjects.map(s => (
                                        <Pressable key={s.id} style={[styles.chip, selectedSubjectId === s.id && styles.chipActive]} onPress={() => setSelectedSubjectId(s.id)}>
                                            <Text style={[styles.chipText, selectedSubjectId === s.id && styles.chipTextActive]}>{s.name}</Text>
                                        </Pressable>
                                    )) : <Text style={styles.hintText}>Select a class first</Text>}
                                </ScrollView>
                            </View>

                            <View style={styles.row}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>DATE</Text>
                                    <Pressable style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
                                        <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
                                        <Text style={styles.dateBtnText}>{format(scheduleDate, "dd-MM-yyyy")}</Text>
                                    </Pressable>
                                </View>
                            </View>

                            <View style={styles.row}>
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <Text style={styles.label}>START TIME</Text>
                                    <Pressable style={styles.dateBtn} onPress={() => setShowStartTimePicker(true)}>
                                        <Ionicons name="time-outline" size={20} color={COLORS.primary} />
                                        <Text style={styles.dateBtnText}>{format(startTime, "hh:mm a")}</Text>
                                    </Pressable>
                                </View>
                                <View style={{ flex: 1, marginLeft: 8 }}>
                                    <Text style={styles.label}>END TIME</Text>
                                    <Pressable style={styles.dateBtn} onPress={() => setShowEndTimePicker(true)}>
                                        <Ionicons name="time-outline" size={20} color={COLORS.primary} />
                                        <Text style={styles.dateBtnText}>{format(endTime, "hh:mm a")}</Text>
                                    </Pressable>
                                </View>
                            </View>

                            <View style={styles.row}>
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <Text style={styles.label}>TOTAL MARKS</Text>
                                    <TextInput style={styles.input} value={totalMarks} onChangeText={setTotalMarks} keyboardType="numeric" />
                                </View>
                                <View style={{ flex: 1, marginLeft: 8 }}>
                                    <Text style={styles.label}>PASS MARK</Text>
                                    <TextInput style={styles.input} value={passMark} onChangeText={setPassMark} keyboardType="numeric" />
                                </View>
                            </View>

                            <View style={styles.row}>
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <Text style={styles.label}>DURATION (MIN)</Text>
                                    <TextInput style={styles.input} value={duration} onChangeText={setDuration} keyboardType="numeric" />
                                </View>
                                <View style={{ flex: 1, marginLeft: 8 }}>
                                    <Text style={styles.label}>ROOM NO.</Text>
                                    <TextInput style={styles.input} value={roomNumber} onChangeText={setRoomNumber} placeholder="—" placeholderTextColor={COLORS.textMuted} keyboardType="numeric" />
                                </View>
                            </View>

                            <Pressable style={[styles.submitBtn, submitting && { opacity: 0.7 }]} onPress={handleCreateExam} disabled={submitting}>
                                {submitting ? <ActivityIndicator color="#FFF" /> : (
                                    <View style={styles.submitBtnContent}>
                                        <Ionicons name="save-outline" size={20} color="#FFF" />
                                        <Text style={styles.submitBtnText}>Create Exam</Text>
                                    </View>
                                )}
                            </Pressable>
                        </ScrollView>

                        {showDatePicker && (
                            <DateTimePicker value={scheduleDate} mode="date" display="default" onChange={(e, d) => { setShowDatePicker(false); if (d) setScheduleDate(d); }} />
                        )}
                        {showStartTimePicker && (
                            <DateTimePicker value={startTime} mode="time" display="default" onChange={(e, d) => { setShowStartTimePicker(false); if (d) setStartTime(d); }} />
                        )}
                        {showEndTimePicker && (
                            <DateTimePicker value={endTime} mode="time" display="default" onChange={(e, d) => { setShowEndTimePicker(false); if (d) setEndTime(d); }} />
                        )}
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            <TeacherBottomNav />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    createBtn: { marginBottom: 20 },
    createBtnGradient: { padding: 16, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
    createBtnText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_700Bold" },
    card: { backgroundColor: "#FFF", borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
    cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
    cardClass: { fontSize: 12, fontFamily: "Inter_700Bold", color: COLORS.primary, textTransform: "uppercase" },
    cardSubject: { fontSize: 16, fontFamily: "Inter_800ExtraBold", color: COLORS.textPrimary },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 11, fontFamily: "Inter_700Bold" },
    cardTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: COLORS.textSecondary, marginBottom: 16 },
    cardMeta: { flexDirection: "row", gap: 16, marginBottom: 16, flexWrap: "wrap" },
    metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
    metaText: { fontSize: 12, fontFamily: "Inter_500Medium", color: COLORS.textMuted },
    cardActions: { flexDirection: "row", borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12, gap: 16 },
    actionBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
    actionBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: COLORS.primary },
    emptyState: { padding: 40, alignItems: "center" },
    emptyText: { marginTop: 12, color: COLORS.textMuted, fontSize: 14 },

    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
    modalContent: { backgroundColor: "#FFF", borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: height * 0.85 },
    modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
    modalTitle: { fontSize: 20, fontFamily: "Inter_800ExtraBold", color: COLORS.textPrimary },
    label: { fontSize: 11, fontFamily: "Inter_700Bold", color: COLORS.textMuted, marginBottom: 8, marginTop: 16, letterSpacing: 0.5 },
    input: { backgroundColor: COLORS.background, padding: 14, borderRadius: 12, fontSize: 15, fontFamily: "Inter_500Medium", borderWidth: 1, borderColor: COLORS.border, color: COLORS.textPrimary },
    pickerContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
    chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
    chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    chipText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: COLORS.textSecondary },
    chipTextActive: { color: "#FFF" },
    row: { flexDirection: "row", marginTop: 8 },
    dateBtn: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: COLORS.background, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
    dateBtnText: { fontSize: 15, fontFamily: "Inter_500Medium", color: COLORS.textPrimary },
    submitBtn: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 16, alignItems: "center", marginTop: 32, marginBottom: 20 },
    submitBtnContent: { flexDirection: "row", alignItems: "center", gap: 8 },
    submitBtnText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_700Bold" },
    hintText: { fontSize: 12, color: COLORS.textMuted, fontFamily: "Inter_400Regular", marginLeft: 4, marginTop: 4 },
});
