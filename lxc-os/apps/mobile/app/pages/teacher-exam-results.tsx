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
    TextInput,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, Layout } from "react-native-reanimated";
import { useLocalSearchParams, router } from "expo-router";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";
import { TeacherBottomNav } from "@/components/TeacherBottomNav";

interface Student {
    id: string;
    user: {
        name: string;
    };
    results: { score: number }[];
}

interface ExamData {
    id: string;
    title: string;
    totalMarks: number;
    isPublished: boolean;
    class: { name: string };
    subject: { name: string };
}

export default function TeacherExamResultsPage() {
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams();

    const [exam, setExam] = useState<ExamData | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [scores, setScores] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [saving, setSaving] = useState(false);

    const fetchData = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true); else setLoading(true);
        try {
            const res = await api.get<{ exam: ExamData, students: Student[] }>(`/api/v1/dashboard/teacher/exam/${id}/results`);
            const data = res as any;
            setExam(data.exam);
            setStudents(data.students);

            // Pre-fill existing scores
            const initial: Record<string, string> = {};
            data.students.forEach((s: any) => {
                if (s.results?.[0]) {
                    initial[s.id] = String(s.results[0].score);
                }
            });
            setScores(initial);
        } catch (e: any) {
            console.error(e);
            Alert.alert("Error", "Could not load exam data.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) fetchData();
    }, [id, fetchData]);

    const handleSave = async () => {
        const results = students
            .filter(s => scores[s.id] !== undefined && scores[s.id] !== "")
            .map(s => ({ studentId: s.id, score: parseInt(scores[s.id]) }));

        if (results.length === 0) {
            Alert.alert("Error", "Enter at least one score");
            return;
        }

        // Validate
        const total = exam?.totalMarks ?? 100;
        for (const r of results) {
            if (isNaN(r.score) || r.score < 0 || r.score > total) {
                Alert.alert("Error", `Scores must be between 0 and ${total}`);
                return;
            }
        }

        setSaving(true);
        try {
            await api.post(`/api/v1/dashboard/teacher/exam/${id}/results`, { results });
            Alert.alert("Success", "Results saved successfully");
            fetchData();
        } catch (e: any) {
            Alert.alert("Error", e.message || "Failed to save results");
        } finally {
            setSaving(false);
        }
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.loaderBox}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loaderText}>Loading students...</Text>
            </View>
        );
    }

    if (!exam) {
        return (
            <View style={styles.loaderBox}>
                <Text>Exam not found.</Text>
                <Pressable onPress={() => router.back()} style={{ marginTop: 10 }}>
                    <Text style={{ color: COLORS.primary }}>Go Back</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={styles.root}>
            <LinearGradient
                colors={["#4F46E5", "#7C3AED", "#9333EA"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={[styles.header, { paddingTop: insets.top + 20 }]}
            >
                <Pressable onPress={() => router.back()} style={styles.headerBackBtn}>
                    <Ionicons name="arrow-back" size={20} color="#fff" />
                </Pressable>
                <View style={{ flex: 1, alignItems: "center" }}>
                    <Text style={styles.headerTitle} numberOfLines={1}>{exam.title}</Text>
                    <Text style={styles.headerDate}>{exam.class.name} · {exam.subject.name}</Text>
                </View>
                <Pressable onPress={handleSave} disabled={saving} style={styles.saveBtn}>
                    {saving ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="save-outline" size={20} color="#fff" />}
                </Pressable>
            </LinearGradient>

            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 120 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} tintColor={COLORS.primary} />
                    }
                >
                    <View style={styles.infoSection}>
                        <View>
                            <Text style={styles.sectionTitle}>Marks Entry</Text>
                            <Text style={styles.dueInfo}>Max Marks: {exam.totalMarks}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: exam.isPublished ? "#ECFDF5" : "#FFFBEB" }]}>
                            <Text style={[styles.statusText, { color: exam.isPublished ? "#10B981" : "#F59E0B" }]}>
                                {exam.isPublished ? "Published" : "Draft"}
                            </Text>
                        </View>
                    </View>

                    {students.map((student, idx) => (
                        <Animated.View key={student.id} entering={FadeInDown.delay(idx * 30)} layout={Layout.springify()}>
                            <View style={styles.studentCard}>
                                <View style={styles.studentInfo}>
                                    <View style={styles.avatar}>
                                        <Text style={styles.avatarText}>{student.user.name.charAt(0)}</Text>
                                    </View>
                                    <Text style={styles.studentName}>{student.user.name}</Text>
                                </View>
                                <View style={styles.inputBox}>
                                    <TextInput
                                        style={styles.scoreInput}
                                        value={scores[student.id] || ""}
                                        onChangeText={(val) => setScores({ ...scores, [student.id]: val })}
                                        placeholder="0"
                                        keyboardType="numeric"
                                        maxLength={3}
                                    />
                                    <Text style={styles.maxText}>/ {exam.totalMarks}</Text>
                                </View>
                            </View>
                        </Animated.View>
                    ))}

                    <Pressable 
                        style={[styles.bottomSaveBtn, saving && { opacity: 0.7 }]} 
                        onPress={handleSave}
                        disabled={saving}
                    >
                        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.bottomSaveText}>Save All Results</Text>}
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>

            <TeacherBottomNav />
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F8FAFF" },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingBottom: 22,
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
    saveBtn: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.18)",
        alignItems: "center",
        justifyContent: "center",
    },
    
    loaderBox: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
    loaderText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#94A3B8" },

    infoSection: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
    sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#1E293B" },
    dueInfo: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#64748B", marginTop: 4 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 11, fontFamily: "Inter_700Bold" },

    studentCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        padding: 16,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: "#F1F5F9",
    },
    studentInfo: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
    avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#EEF2FF", alignItems: "center", justifyContent: "center" },
    avatarText: { fontSize: 14, fontFamily: "Inter_700Bold", color: COLORS.primary },
    studentName: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#1E293B" },
    
    inputBox: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#F8FAFF", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0" },
    scoreInput: { fontSize: 16, fontFamily: "Inter_700Bold", color: COLORS.primary, width: 40, textAlign: "center", padding: 0 },
    maxText: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#94A3B8" },

    bottomSaveBtn: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 16, alignItems: "center", marginTop: 20 },
    bottomSaveText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
});
