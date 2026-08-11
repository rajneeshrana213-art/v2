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
    Linking,
    TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useLocalSearchParams, router } from "expo-router";
import { format } from "date-fns";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";
import { TeacherBottomNav } from "@/components/TeacherBottomNav";

interface Submission {
    id: string;
    file: string;
    submittedAt: string;
    feedback: string | null;
    score: number | null;
    student: {
        id: string;
        user: {
            name: string;
            profilePic: string | null;
        }
    }
}

interface HomeworkDetail {
    id: string;
    title: string;
    description: string | null;
    dueDate: string;
    status: string;
    class: { name: string };
    subject: { name: string };
    HomeworkSubmission: Submission[];
}

export default function HomeworkSubmissionsPage() {
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams();
    
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [gradingData, setGradingData] = useState({ score: "", feedback: "" });
    const [submittingGrade, setSubmittingGrade] = useState(false);
    const [homework, setHomework] = useState<HomeworkDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true); else setLoading(true);
        try {
            const data = await api.get<HomeworkDetail>(`/api/v1/dashboard/teacher/homework/${id}`);
            setHomework(data as any);
        } catch (e: any) {
            console.error(e);
            Alert.alert("Error", "Could not load submissions.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) fetchData();
    }, [id, fetchData]);

    const openFile = (url: string) => {
        if (!url) return;
        Linking.openURL(url).catch(() => {
            Alert.alert("Error", "Could not open file.");
        });
    };

    const handleGradeSubmit = async () => {
        if (!gradingData.score) {
            Alert.alert("Error", "Please enter a score");
            return;
        }

        setSubmittingGrade(true);
        try {
            await api.patch(`/api/v1/dashboard/teacher/homework/submissions/${selectedSubmission?.id}`, gradingData);
            Alert.alert("Success", "Submission graded successfully!");
            setSelectedSubmission(null);
            fetchData();
        } catch (error: any) {
            Alert.alert("Error", error.message || "Grading failed");
        } finally {
            setSubmittingGrade(false);
        }
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.loaderBox}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loaderText}>Loading submissions...</Text>
            </View>
        );
    }

    if (!homework) {
        return (
            <View style={styles.loaderBox}>
                <Text>Homework not found.</Text>
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
                    <Text style={styles.headerTitle} numberOfLines={1}>{homework.title}</Text>
                    <Text style={styles.headerDate}>{homework.class.name} · {homework.subject.name}</Text>
                </View>
                <View style={{ width: 40 }} />
            </LinearGradient>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 120 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} tintColor={COLORS.primary} />
                }
            >
                <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Submissions ({homework.HomeworkSubmission.length})</Text>
                    <Text style={styles.dueInfo}>Due: {format(new Date(homework.dueDate), "PPP")}</Text>
                </View>

                {homework.HomeworkSubmission.length === 0 ? (
                    <View style={styles.emptyBox}>
                        <Ionicons name="cloud-upload-outline" size={48} color="#CBD5E1" />
                        <Text style={styles.emptyTitle}>No submissions yet</Text>
                        <Text style={styles.emptySubtitle}>Students haven&apos;t uploaded any files for this homework.</Text>
                    </View>
                ) : (
                    homework.HomeworkSubmission.map((sub: Submission, idx: number) => (
                        <Animated.View 
                            key={sub.id} 
                            entering={FadeInDown.delay(idx * 100)}
                            style={styles.submissionCard}
                        >
                            <View style={styles.cardHeader}>
                                <Image
                                    source={{ uri: sub.student.user.profilePic || `https://api.dicebear.com/7.x/initials/png?seed=${sub.student.user.name}&backgroundColor=4F46E5` }}
                                    style={styles.avatar}
                                />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.studentName}>{sub.student.user.name}</Text>
                                    <Text style={styles.subDate}>Submitted {format(new Date(sub.submittedAt), "MMM d, h:mm a")}</Text>
                                </View>
                                <Pressable 
                                    onPress={() => {
                                        setSelectedSubmission(sub);
                                        setGradingData({ score: sub.score?.toString() || "", feedback: sub.feedback || "" });
                                    }}
                                    style={styles.gradeBadge}
                                >
                                    <Text style={styles.gradeBadgeText}>{sub.score !== null ? `${sub.score}/100` : "Grade"}</Text>
                                </Pressable>
                            </View>

                            <Pressable 
                                onPress={() => openFile(sub.file)}
                                style={({ pressed }) => [styles.fileBtn, pressed && { opacity: 0.7 }]}
                            >
                                <Ionicons name="document-attach" size={20} color={COLORS.primary} />
                                <Text style={styles.fileBtnText} numberOfLines={1}>View Submission File</Text>
                                <Ionicons name="open-outline" size={16} color={COLORS.primary} />
                            </Pressable>

                            {(sub.score !== null || sub.feedback) && (
                                <View style={styles.gradingInfo}>
                                    {sub.score !== null && <Text style={styles.scoreText}>Score: {sub.score}</Text>}
                                    {sub.feedback && <Text style={styles.feedbackText}>{sub.feedback}</Text>}
                                </View>
                            )}
                        </Animated.View>
                    ))
                )}
            </ScrollView>

            {/* Grading Modal */}
            <View>
                {selectedSubmission && (
                    <View style={styles.modalOverlay}>
                        <Animated.View entering={FadeInDown} style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
                            <View style={styles.modalHeader}>
                                <View>
                                    <Text style={styles.modalTitle}>Grade Submission</Text>
                                    <Text style={styles.modalSubtitle}>{selectedSubmission.student.user.name}</Text>
                                </View>
                                <Pressable onPress={() => setSelectedSubmission(null)} style={styles.modalClose}>
                                    <Ionicons name="close" size={24} color="#64748B" />
                                </Pressable>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Score (Out of 100)</Text>
                                <TextInput
                                    style={styles.scoreInput}
                                    value={gradingData.score}
                                    onChangeText={(val: string) => setGradingData({ ...gradingData, score: val })}
                                    placeholder="e.g. 85"
                                    keyboardType="numeric"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Feedback</Text>
                                <TextInput
                                    style={styles.feedbackInput}
                                    value={gradingData.feedback}
                                    onChangeText={(val: string) => setGradingData({ ...gradingData, feedback: val })}
                                    placeholder="Enter constructive feedback..."
                                    multiline
                                    numberOfLines={4}
                                />
                            </View>

                            <Pressable 
                                style={[styles.saveGradeBtn, submittingGrade && { opacity: 0.7 }]} 
                                onPress={handleGradeSubmit}
                                disabled={submittingGrade}
                            >
                                {submittingGrade ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveGradeText}>Save Grade</Text>}
                            </Pressable>
                        </Animated.View>
                    </View>
                )}
            </View>

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
    
    loaderBox: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
    loaderText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#94A3B8" },

    infoSection: { marginBottom: 20 },
    sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#1E293B" },
    dueInfo: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#64748B", marginTop: 4 },

    submissionCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#94A3B8",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 3,
    },
    cardHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
    avatar: { width: 44, height: 44, borderRadius: 14 },
    studentName: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#1E293B" },
    subDate: { fontSize: 11, fontFamily: "Inter_500Medium", color: "#94A3B8", marginTop: 2 },
    
    gradeBadge: {
        backgroundColor: COLORS.primary + "10",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    gradeBadgeText: { fontSize: 12, fontFamily: "Inter_700Bold", color: COLORS.primary },

    fileBtn: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#EEF2FF",
        padding: 12,
        borderRadius: 12,
        gap: 10,
        borderWidth: 1,
        borderColor: "#C7D2FE",
    },
    fileBtnText: { flex: 1, fontSize: 14, fontFamily: "Inter_600SemiBold", color: COLORS.primary },
    
    gradingInfo: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
    },
    scoreText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#10B981", marginBottom: 4 },
    feedbackText: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#64748B", lineHeight: 18 },

    emptyBox: { alignItems: "center", paddingVertical: 60, gap: 12 },
    emptyTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#1E293B" },
    emptySubtitle: { fontSize: 14, fontFamily: "Inter_500Medium", color: "#94A3B8", textAlign: "center", paddingHorizontal: 40 },

    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
        zIndex: 1000,
    },
    modalContent: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
    },
    modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
    modalTitle: { fontSize: 20, fontFamily: "Inter_800ExtraBold", color: "#1E293B" },
    modalSubtitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#64748B", marginTop: 2 },
    modalClose: { padding: 4 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#64748B", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
    scoreInput: { backgroundColor: "#F8FAFF", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "#E2E8F0", fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#1E293B" },
    feedbackInput: { backgroundColor: "#F8FAFF", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "#E2E8F0", fontSize: 15, fontFamily: "Inter_500Medium", color: "#1E293B", textAlignVertical: "top", height: 120 },
    saveGradeBtn: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 18, alignItems: "center", marginTop: 12, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    saveGradeText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
});
