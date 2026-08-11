import { useState, useCallback, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useLocalSearchParams } from "expo-router";
import { format } from "date-fns";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";

const { width } = Dimensions.get("window");

interface ExamResult {
    subject: string;
    score: number;
    total: number;
    date: string;
}

interface AnalyticsData {
    student: {
        id: string;
        user: { name: string; profilePic: string | null };
    };
    attendanceRate: number;
    attendanceHistory: { date: string; present: boolean }[];
    examResults: ExamResult[];
}

export default function StudentAnalyticsPage() {
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get<AnalyticsData>(`/api/v1/dashboard/teacher/student-analytics?id=${id}`);
            setData(res as any);
        } catch {
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) fetchData();
    }, [id, fetchData]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!data) return null;

    return (
        <View style={styles.container}>
            <PageHeader title="Performance Analytics" subtitle={`Analysis for ${data.student.user.name}`} />
            
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
            >
                {/* Stats Summary */}
                <View style={styles.summaryRow}>
                    <Animated.View entering={FadeInDown.delay(100)} style={styles.statCard}>
                        <Text style={styles.statLabel}>Attendance</Text>
                        <Text style={[styles.statValue, { color: data.attendanceRate > 75 ? COLORS.success : COLORS.warning }]}>
                            {data.attendanceRate}%
                        </Text>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${data.attendanceRate}%`, backgroundColor: data.attendanceRate > 75 ? COLORS.success : COLORS.warning }]} />
                        </View>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(200)} style={styles.statCard}>
                        <Text style={styles.statLabel}>Avg. Score</Text>
                        <Text style={styles.statValue}>
                            {data.examResults.length > 0 
                                ? Math.round(data.examResults.reduce((acc, curr) => acc + (curr.score / curr.total), 0) / data.examResults.length * 100)
                                : 0}%
                        </Text>
                        <Text style={styles.statSub}>Across {data.examResults.length} exams</Text>
                    </Animated.View>
                </View>

                {/* Exam Performance Chart (Visual) */}
                <Animated.View entering={FadeInUp.delay(300)} style={styles.section}>
                    <Text style={styles.sectionTitle}>Subject-wise Performance</Text>
                    <View style={styles.chartContainer}>
                        {data.examResults.map((result, idx) => (
                            <View key={idx} style={styles.chartBarRow}>
                                <Text style={styles.subjectLabel} numberOfLines={1}>{result.subject}</Text>
                                <View style={styles.barContainer}>
                                    <View style={[styles.barFill, { width: `${(result.score / result.total) * 100}%` }]}>
                                        <LinearGradient
                                            colors={["#4F46E5", "#818CF8"]}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={StyleSheet.absoluteFill}
                                        />
                                    </View>
                                </View>
                                <Text style={styles.scoreText}>{result.score}/{result.total}</Text>
                            </View>
                        ))}
                    </View>
                </Animated.View>

                {/* Recent Exams List */}
                <Animated.View entering={FadeInUp.delay(400)} style={styles.section}>
                    <Text style={styles.sectionTitle}>Exam History</Text>
                    {data.examResults.map((result, idx) => (
                        <View key={idx} style={styles.historyItem}>
                            <View style={styles.historyDot} />
                            <View style={styles.historyContent}>
                                <Text style={styles.historySubject}>{result.subject}</Text>
                                <Text style={styles.historyDate}>{format(new Date(result.date), "MMM d, yyyy")}</Text>
                            </View>
                            <View style={[styles.historyScore, { backgroundColor: (result.score / result.total) >= 0.4 ? "#ECFDF5" : "#FEF2F2" }]}>
                                <Text style={[styles.historyScoreText, { color: (result.score / result.total) >= 0.4 ? "#10B981" : "#EF4444" }]}>
                                    {Math.round((result.score / result.total) * 100)}%
                                </Text>
                            </View>
                        </View>
                    ))}
                </Animated.View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFF" },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    scrollView: { padding: 16 },
    summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
    statCard: {
        backgroundColor: "#FFF",
        borderRadius: 20,
        padding: 20,
        width: (width - 48) / 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    statLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: COLORS.textSecondary, marginBottom: 8 },
    statValue: { fontSize: 24, fontFamily: "Inter_800ExtraBold", color: COLORS.textPrimary },
    statSub: { fontSize: 10, color: COLORS.textMuted, marginTop: 4 },
    progressBar: { height: 4, backgroundColor: "#F3F4F6", borderRadius: 2, marginTop: 12, overflow: "hidden" },
    progressFill: { height: "100%", borderRadius: 2 },
    section: { marginBottom: 32 },
    sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: COLORS.textPrimary, marginBottom: 16 },
    chartContainer: { backgroundColor: "#FFF", borderRadius: 20, padding: 20, elevation: 2 },
    chartBarRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
    subjectLabel: { width: 80, fontSize: 12, color: COLORS.textSecondary },
    barContainer: { flex: 1, height: 8, backgroundColor: "#F3F4F6", borderRadius: 4, marginHorizontal: 12, overflow: "hidden" },
    barFill: { height: "100%", borderRadius: 4 },
    scoreText: { width: 45, fontSize: 11, fontFamily: "Inter_700Bold", color: COLORS.textPrimary, textAlign: "right" },
    historyItem: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
    historyDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary, marginRight: 16 },
    historyContent: { flex: 1 },
    historySubject: { fontSize: 14, fontFamily: "Inter_700Bold", color: COLORS.textPrimary },
    historyDate: { fontSize: 12, color: COLORS.textMuted },
    historyScore: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    historyScoreText: { fontSize: 12, fontFamily: "Inter_700Bold" },
});
