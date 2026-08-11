import { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Dimensions,
    Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { api } from "@/lib/api";
import { COLORS } from "@/constants/colors";
import { Quiz } from "@/lib/types/student";

const { width } = Dimensions.get("window");

export default function QuizDetail() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { id } = useLocalSearchParams();

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchQuiz = useCallback(async () => {
        if (!id) return;
        try {
            const res = await api.get<Quiz>(`api/v1/dashboard/student/enhancement/quiz?id=${id}`);
            setQuiz(res as any);
            if (res) {
                setTimeLeft((res as any).timeLimit * 60);
            }
        } catch (error) {
            console.error("Error fetching quiz:", error);
            Alert.alert("Error", "Failed to load quiz");
            router.back();
        } finally {
            setLoading(false);
        }
    }, [id, router]);

    useEffect(() => {
        fetchQuiz();
    }, [fetchQuiz]);

    useEffect(() => {
        if (timeLeft > 0 && !submitted && !loading) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && !submitted && !loading && quiz) {
            handleSubmit();
        }
    }, [timeLeft, submitted, loading, quiz]);

    const handleOptionSelect = (questionId: string, option: string) => {
        if (submitted) return;
        setAnswers(prev => ({ ...prev, [questionId]: option }));
    };

    const handleSubmit = async () => {
        if (submitted || isSubmitting) return;

        // Validation: confirm if not all questions are answered
        if (quiz && Object.keys(answers).length < quiz.questions.length && timeLeft > 0) {
            Alert.alert(
                "Incomplete Quiz",
                "You haven't answered all questions. Are you sure you want to submit?",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Submit Anyway", onPress: performSubmit }
                ]
            );
        } else {
            performSubmit();
        }
    };

    const performSubmit = async () => {
        setIsSubmitting(true);
        try {
            const res = await api.post("api/v1/dashboard/student/enhancement/quiz", {
                quizId: id,
                answers
            });
            setResult(res);
            setSubmitted(true);
        } catch (error) {
            console.error("Error submitting quiz:", error);
            Alert.alert("Error", "Failed to submit quiz");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Preparing your challenge...</Text>
            </View>
        );
    }

    if (result && quiz) {
        const percentage = Math.round((result.score / quiz.points) * 100);
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.resultContent}>
                    <View style={styles.resultIconContainer}>
                        <Ionicons name="trophy" size={60} color="#FBBF24" />
                    </View>
                    <Text style={styles.resultTitle}>Quiz Completed!</Text>
                    <Text style={styles.resultSubtitle}>{quiz.title}</Text>

                    <View style={styles.resultGrid}>
                        <View style={styles.resultCard}>
                            <Text style={styles.resultLabel}>Accuracy</Text>
                            <Text style={styles.resultValue}>{percentage}%</Text>
                        </View>
                        <View style={[styles.resultCard, { backgroundColor: COLORS.primary + "10" }]}>
                            <Text style={[styles.resultLabel, { color: COLORS.primary }]}>XP Earned</Text>
                            <Text style={[styles.resultValue, { color: COLORS.primary }]}>+{result.score}</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.backButton as any}
                        onPress={() => router.replace("/pages/enhancement")}
                    >
                        <Text style={styles.backButtonText as any}>Back to Hub</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={[styles.navHeader, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerIconButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <View style={styles.timerContainer}>
                    <Ionicons
                        name="time"
                        size={20}
                        color={timeLeft < 60 ? COLORS.error : COLORS.primary}
                    />
                    <Text style={[styles.timerText, timeLeft < 60 && { color: COLORS.error }]}>
                        {formatTime(timeLeft)}
                    </Text>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.pageTitle}>{quiz?.title}</Text>
                <Text style={styles.pageSubtitle}>Choose the correct option for each question</Text>

                {quiz?.questions.map((q, index) => (
                    <View key={q.id} style={styles.questionCard}>
                        <View style={styles.questionNumberBadge}>
                            <Text style={styles.questionNumberText}>{index + 1}</Text>
                        </View>
                        <Text style={styles.questionText}>{q.questionText}</Text>

                        <View style={styles.optionsContainer}>
                            {q.options.map((opt, oIdx) => {
                                const isSelected = answers[q.id] === opt;
                                return (
                                    <TouchableOpacity
                                        key={oIdx}
                                        style={[styles.optionButton, isSelected && styles.selectedOptionButton]}
                                        onPress={() => handleOptionSelect(q.id, opt)}
                                    >
                                        <View style={[styles.radioButton, isSelected && styles.selectedRadioButton]}>
                                            {isSelected && <View style={styles.radioButtonInner} />}
                                        </View>
                                        <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                                            {opt}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                ))}

                <TouchableOpacity
                    style={[styles.submitButton, isSubmitting && { opacity: 0.7 }]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.submitButtonText}>Submit Quiz</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F9FAFB" },
    centerContainer: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#FFF" },
    loadingText: { marginTop: 12, fontSize: 14, color: COLORS.textMuted, fontFamily: "Inter_500Medium" },
    navHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingBottom: 10,
        backgroundColor: "#FFF",
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerIconButton: { padding: 8 },
    timerContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.surface,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        gap: 6,
    },
    timerText: { fontSize: 16, fontFamily: "Inter_700Bold", color: COLORS.textPrimary },
    pageTitle: { fontSize: 24, fontFamily: "Inter_800ExtraBold", color: "#111827", marginTop: 10 },
    pageSubtitle: { fontSize: 14, fontFamily: "Inter_500Medium", color: "#6B7280", marginBottom: 24 },
    questionCard: {
        backgroundColor: "#FFF",
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#F3F4F6",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    questionNumberBadge: {
        position: "absolute",
        top: -12,
        left: 20,
        width: 30,
        height: 30,
        borderRadius: 8,
        backgroundColor: COLORS.primary,
        alignItems: "center",
        justifyContent: "center",
        elevation: 3,
    },
    questionNumberText: { color: "#FFF", fontSize: 14, fontFamily: "Inter_800ExtraBold" },
    questionText: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#1F2937", marginTop: 10, marginBottom: 20, lineHeight: 26 },
    optionsContainer: { gap: 12 },
    optionButton: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 16,
        backgroundColor: "#F9FAFB",
        borderWidth: 1,
        borderColor: "#F3F4F6",
    },
    selectedOptionButton: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary + "05",
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#D1D5DB",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    selectedRadioButton: {
        borderColor: COLORS.primary,
    },
    radioButtonInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.primary,
    },
    optionText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#4B5563" },
    selectedOptionText: { color: COLORS.primary },
    submitButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: "center",
        marginTop: 20,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    submitButtonText: { color: "#FFF", fontSize: 18, fontFamily: "Inter_800ExtraBold" },

    // Result Styles
    resultContent: { flex: 1, alignItems: "center", justifyContent: "center", padding: 30 },
    resultIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#FEF3C7",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 24,
    },
    resultTitle: { fontSize: 28, fontFamily: "Inter_800ExtraBold", color: "#111827", marginBottom: 4 },
    resultSubtitle: { fontSize: 16, fontFamily: "Inter_500Medium", color: "#6B7280", textAlign: "center", marginBottom: 32 },
    resultGrid: { flexDirection: "row", gap: 16, marginBottom: 40 },
    resultCard: {
        flex: 1,
        backgroundColor: "#F3F4F6",
        padding: 20,
        borderRadius: 24,
        alignItems: "center",
    },
    resultLabel: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#9CA3AF", textTransform: "uppercase", marginBottom: 8 },
    resultValue: { fontSize: 24, fontFamily: "Inter_800ExtraBold", color: "#111827" },
    backButton: {
        backgroundColor: "#111827",
        width: "100%",
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: "center",
    },
    backButtonText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_700Bold" }
});
