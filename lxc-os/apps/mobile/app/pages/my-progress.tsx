import { useState, useCallback, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Dimensions,
    RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { format } from "date-fns";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { BottomNav } from "@/components/BottomNav";
import { Ionicons } from "@expo/vector-icons";

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

export default function MyProgressPage() {
    const insets = useSafeAreaInsets();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            // Using the existing teacher-scoped student-analytics endpoint as it works for the student too
            const res = await api.get<AnalyticsData>(`/api/v1/dashboard/student/analytics`);
            setData(res as any);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading && !refreshing) {
        return (
            <View style={[styles.container, styles.centerBox]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    const attendanceColor = (rate: number) => {
        if (rate >= 85) return COLORS.success;
        if (rate >= 75) return COLORS.warning;
        return COLORS.error;
    };

    return (
        <View style={styles.container}>
            <PageHeader title="My Progress" subtitle="Learning Insights" />
            
            <ScrollView 
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} tintColor={COLORS.primary} />}
            >
                {/* Attendance Summary */}
                <Animated.View entering={FadeInDown.delay(100)} style={styles.section}>
                    <Text style={styles.sectionTitle}>Attendance Overview</Text>
                    <View style={styles.glassCard}>
                        <View style={styles.attendanceHeader}>
                            <View>
                                <Text style={styles.attendanceValue}>{data?.attendanceRate || 0}%</Text>
                                <Text style={styles.attendanceLabel}>Overall Attendance</Text>
                            </View>
                            <View style={[styles.attendanceIcon, { backgroundColor: attendanceColor(data?.attendanceRate || 0) + "20" }]}>
                                <Ionicons name="calendar" size={24} color={attendanceColor(data?.attendanceRate || 0)} />
                            </View>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { 
                                width: `${data?.attendanceRate || 0}%`, 
                                backgroundColor: attendanceColor(data?.attendanceRate || 0) 
                            }]} />
                        </View>
                        <Text style={styles.attendanceTip}>
                            {data?.attendanceRate && data.attendanceRate >= 85 ? "Excellent! Keep maintaining your streak." : "Try to attend more classes to stay on track."}
                        </Text>
                    </View>
                </Animated.View>

                {/* Subject Wise Performance */}
                <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
                    <Text style={styles.sectionTitle}>Performance by Subject</Text>
                    <View style={styles.chartCard}>
                        {data?.examResults && data.examResults.length > 0 ? (
                            data.examResults.map((result, idx) => (
                                <View key={idx} style={styles.subjectRow}>
                                    <View style={styles.subjectInfo}>
                                        <Text style={styles.subjectName}>{result.subject}</Text>
                                        <Text style={styles.subjectScore}>{result.score}/{result.total}</Text>
                                    </View>
                                    <View style={styles.subjectBarBg}>
                                        <View style={[styles.subjectBarFill, { width: `${(result.score / result.total) * 100}%` }]} />
                                    </View>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.emptyText}>No exam results available yet.</Text>
                        )}
                    </View>
                </Animated.View>

                {/* Recent Assessments */}
                <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Assessments</Text>
                    {data?.examResults && data.examResults.length > 0 ? (
                        data.examResults.slice(0, 5).map((result, idx) => (
                            <Animated.View key={idx} entering={FadeInUp.delay(idx * 100)} style={styles.assessmentItem}>
                                <View style={styles.assessmentIcon}>
                                    <Ionicons name="ribbon" size={20} color={COLORS.primary} />
                                </View>
                                <View style={styles.assessmentContent}>
                                    <Text style={styles.assessmentSubject}>{result.subject}</Text>
                                    <Text style={styles.assessmentDate}>{format(new Date(result.date), "MMM d, yyyy")}</Text>
                                </View>
                                <View style={styles.assessmentScoreBox}>
                                    <Text style={styles.assessmentScoreText}>{Math.round((result.score / result.total) * 100)}%</Text>
                                </View>
                            </Animated.View>
                        ))
                    ) : (
                        <View style={styles.emptyBox}>
                            <Ionicons name="document-text-outline" size={40} color={COLORS.border} />
                            <Text style={styles.emptyText}>No recent assessments found.</Text>
                        </View>
                    )}
                </Animated.View>
            </ScrollView>

            <BottomNav />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    centerBox: { justifyContent: "center", alignItems: "center" },
    section: { paddingHorizontal: 16, marginTop: 24 },
    sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: COLORS.textPrimary, marginBottom: 16 },
    
    glassCard: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 20, borderWidth: 1, borderColor: COLORS.border, elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
    attendanceHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
    attendanceValue: { fontSize: 32, fontFamily: "Inter_900Black", color: COLORS.textPrimary },
    attendanceLabel: { fontSize: 13, fontFamily: "Inter_500Medium", color: COLORS.textSecondary },
    attendanceIcon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    progressBarBg: { height: 8, backgroundColor: COLORS.background, borderRadius: 4, overflow: "hidden" },
    progressBarFill: { height: "100%", borderRadius: 4 },
    attendanceTip: { fontSize: 12, fontFamily: "Inter_400Regular", color: COLORS.textMuted, marginTop: 12, fontStyle: "italic" },

    chartCard: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 20, borderWidth: 1, borderColor: COLORS.border },
    subjectRow: { marginBottom: 16 },
    subjectInfo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
    subjectName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: COLORS.textPrimary },
    subjectScore: { fontSize: 12, fontFamily: "Inter_700Bold", color: COLORS.primary },
    subjectBarBg: { height: 6, backgroundColor: COLORS.background, borderRadius: 3, overflow: "hidden" },
    subjectBarFill: { height: "100%", backgroundColor: COLORS.primary, borderRadius: 3 },

    assessmentItem: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", padding: 14, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
    assessmentIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: COLORS.primary + "10", alignItems: "center", justifyContent: "center" },
    assessmentContent: { flex: 1, marginLeft: 12 },
    assessmentSubject: { fontSize: 14, fontFamily: "Inter_700Bold", color: COLORS.textPrimary },
    assessmentDate: { fontSize: 11, fontFamily: "Inter_400Regular", color: COLORS.textMuted, marginTop: 2 },
    assessmentScoreBox: { backgroundColor: COLORS.primaryLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    assessmentScoreText: { fontSize: 12, fontFamily: "Inter_800ExtraBold", color: COLORS.primary },

    emptyBox: { alignItems: "center", paddingVertical: 40, gap: 12 },
    emptyText: { fontSize: 14, fontFamily: "Inter_500Medium", color: COLORS.textMuted },
});
