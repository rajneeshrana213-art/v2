import { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Platform,
    RefreshControl,
    ActivityIndicator,
    Pressable,
    TouchableOpacity,
    Image,
    Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import Animated, { FadeInDown, FadeInUp, Layout } from "react-native-reanimated";
import { api } from "@/lib/api";
import { Quiz, Article, EnhancementStats } from "@/lib/types/student";
import { COLORS } from "@/constants/colors";

const { width } = Dimensions.get("window");

export default function EnhancementPage() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"quiz" | "article">("quiz");
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setIsLoading(true);

        try {
            const [qRes, aRes] = await Promise.all([
                api.get(`api/v1/dashboard/student/enhancement?type=quiz`),
                api.get(`api/v1/dashboard/student/enhancement?type=article`)
            ]);
            setQuizzes(qRes as any || []);
            setArticles(aRes as any || []);
        } catch (error) {
            console.error("Error fetching enhancement data:", error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onRefresh = useCallback(() => {
        fetchData(true);
    }, [fetchData]);

    const renderHeader = () => (
        <LinearGradient
            colors={[COLORS.primary, "#6366F1"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.header, { paddingTop: insets.top + 20 }]}
        >
            <View style={styles.headerTop}>
                <View style={styles.zapIcon}>
                    <Ionicons name="flash" size={24} color="#FBBF24" />
                </View>
                <View style={{ flex: 1, marginLeft: 16 }}>
                    <Text style={styles.headerTitle}>Enhancement Hub</Text>
                    <Text style={styles.headerSubtitle}>Master your skills daily</Text>
                </View>
            </View>

            <View style={styles.statsRow}>
                <BlurView intensity={20} tint="light" style={styles.statCard}>
                    <Text style={styles.statLabel}>Quizzes Taken</Text>
                    <Text style={styles.statValue}>
                        {quizzes.filter(q => q.quizResults.length > 0).length}
                    </Text>
                </BlurView>
                <BlurView intensity={20} tint="light" style={styles.statCard}>
                    <Text style={styles.statLabel}>Articles Read</Text>
                    <Text style={styles.statValue}>
                        {articles.filter(a => a.NewspaperSubmission.length > 0).length}
                    </Text>
                </BlurView>
            </View>
        </LinearGradient>
    );

    const renderTabs = () => (
        <View style={styles.tabsWrapper}>
            <BlurView intensity={20} tint="light" style={styles.tabsContainer}>
                <TouchableOpacity
                    onPress={() => setActiveTab("quiz")}
                    style={[styles.tab, activeTab === "quiz" && styles.activeTab]}
                >
                    <Ionicons
                        name="help-circle"
                        size={18}
                        color={activeTab === "quiz" ? "#FFFFFF" : COLORS.textSecondary}
                    />
                    <Text style={[styles.tabText, activeTab === "quiz" && styles.activeTabText]}>
                        Quizzes
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setActiveTab("article")}
                    style={[styles.tab, activeTab === "article" && styles.activeTab]}
                >
                    <Ionicons
                        name="book"
                        size={18}
                        color={activeTab === "article" ? "#FFFFFF" : COLORS.textSecondary}
                    />
                    <Text style={[styles.tabText, activeTab === "article" && styles.activeTabText]}>
                        Articles
                    </Text>
                </TouchableOpacity>
            </BlurView>
        </View>
    );

    const renderQuizCard = (quiz: Quiz, index: number) => {
        const isCompleted = quiz.quizResults.length > 0;
        return (
            <Animated.View
                key={quiz.id}
                entering={FadeInDown.delay(index * 100)}
                layout={Layout.springify()}
            >
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.subjectBadge, { backgroundColor: COLORS.primary + "15" }]}>
                            <Text style={styles.subjectText}>{quiz.subject?.name || "General"}</Text>
                        </View>
                        {isCompleted && (
                            <View style={styles.completedBadge}>
                                <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
                                <Text style={styles.completedText}>Done</Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.cardTitle}>{quiz.title}</Text>

                    <View style={styles.cardDetails}>
                        <View style={styles.detailItem}>
                            <Ionicons name="time-outline" size={16} color={COLORS.textMuted} />
                            <Text style={styles.detailText}>{quiz.timeLimit}m</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Ionicons name="flash-outline" size={16} color="#FBBF24" />
                            <Text style={styles.detailText}>{quiz.points} XP</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.cardButton, isCompleted && styles.completedButton]}
                        onPress={() => router.push({ pathname: "/pages/quiz_detail", params: { id: quiz.id } })}
                    >
                        <Text style={[styles.cardButtonText, isCompleted && styles.completedButtonText]}>
                            {isCompleted ? "Retake Quiz" : "Start Quiz"}
                        </Text>
                        <Ionicons
                            name="arrow-forward"
                            size={18}
                            color={isCompleted ? COLORS.textMuted : "#FFF"}
                        />
                    </TouchableOpacity>
                </View>
            </Animated.View>
        );
    };

    const renderArticleCard = (article: Article, index: number) => {
        const isCompleted = article.NewspaperSubmission.length > 0;
        return (
            <Animated.View
                key={article.id}
                entering={FadeInDown.delay(index * 100)}
                layout={Layout.springify()}
            >
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.subjectBadge, { backgroundColor: "#E0F2FE" }]}>
                            <Text style={[styles.subjectText, { color: "#0369A1" }]}>
                                {article.submissionType}
                            </Text>
                        </View>
                        {isCompleted && (
                            <View style={styles.completedBadge}>
                                <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
                                <Text style={styles.completedText}>Read</Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.cardTitle}>{article.title}</Text>
                    <Text style={styles.cardSnippet} numberOfLines={2}>
                        {article.content}
                    </Text>

                    <TouchableOpacity
                        style={[styles.cardButton, { backgroundColor: isCompleted ? COLORS.background : COLORS.success }]}
                        onPress={() => router.push({ pathname: "/pages/article_detail", params: { id: article.id } })}
                    >
                        <Text style={[styles.cardButtonText, { color: isCompleted ? COLORS.textMuted : "#FFF" }]}>
                            {isCompleted ? "Already Read" : "Read Article"}
                        </Text>
                        <Ionicons
                            name="arrow-forward"
                            size={18}
                            color={isCompleted ? COLORS.textMuted : "#FFF"}
                        />
                    </TouchableOpacity>
                </View>
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            {renderHeader()}
            <ScrollView
                style={styles.content}
                contentContainerStyle={{
                    paddingBottom: insets.bottom + 100,
                }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
                }
            >
                <Animated.View entering={FadeInUp.delay(200)}>
                    <LinearGradient
                        colors={["#4F46E5", "#7C3AED"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.challengeCard}
                    >
                        <View style={{ flex: 1 }}>
                            <Text style={styles.challengeTitle}>Weekly Achievement</Text>
                            <Text style={styles.challengeSubtitle}>
                                Finish 3 quizzes and 2 articles for 500 XP!
                            </Text>
                            <View style={styles.progressRow}>
                                <View style={styles.progressBar}>
                                    <View style={[styles.progressFill, { width: "60%" }]} />
                                </View>
                                <Text style={styles.progressPercent}>60%</Text>
                            </View>
                        </View>
                        <View style={styles.challengeIcon}>
                            <Ionicons name="trophy" size={32} color="rgba(255,255,255,0.4)" />
                        </View>
                    </LinearGradient>
                </Animated.View>

                {renderTabs()}

                {isLoading ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                    </View>
                ) : (
                    <View style={styles.listContainer}>
                        {activeTab === "quiz"
                            ? quizzes.map((q, i) => renderQuizCard(q, i))
                            : articles.map((a, i) => renderArticleCard(a, i))}

                        {((activeTab === "quiz" && quizzes.length === 0) ||
                            (activeTab === "article" && articles.length === 0)) && (
                                <View style={styles.emptyState}>
                                    <Ionicons name="sparkles-outline" size={48} color={COLORS.textMuted} />
                                    <Text style={styles.emptyText}>All caught up! Check back later.</Text>
                                </View>
                            )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 30,
        borderBottomLeftRadius: 36,
        borderBottomRightRadius: 36,
    },
    headerTop: { flexDirection: "row", alignItems: "center" },
    zapIcon: {
        width: 50,
        height: 50,
        borderRadius: 16,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: "Inter_800ExtraBold",
        color: "#FFF",
    },
    headerSubtitle: {
        fontSize: 14,
        fontFamily: "Inter_500Medium",
        color: "rgba(255, 255, 255, 0.8)",
    },
    statsRow: {
        flexDirection: "row",
        marginTop: 24,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        borderRadius: 20,
        padding: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    statLabel: {
        fontSize: 12,
        fontFamily: "Inter_600SemiBold",
        color: "rgba(255, 255, 255, 0.7)",
        marginBottom: 4,
    },
    statValue: {
        fontSize: 20,
        fontFamily: "Inter_800ExtraBold",
        color: "#FFF",
    },
    content: { flex: 1, padding: 20 },
    challengeCard: {
        flexDirection: "row",
        borderRadius: 24,
        padding: 20,
        alignItems: "center",
        marginBottom: 24,
        elevation: 4,
        shadowColor: "#4F46E5",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
    },
    challengeTitle: {
        fontSize: 16,
        fontFamily: "Inter_800ExtraBold",
        color: "#FFFFFF",
        marginBottom: 4,
    },
    challengeSubtitle: {
        fontSize: 12,
        fontFamily: "Inter_500Medium",
        color: "rgba(255, 255, 255, 0.8)",
        marginBottom: 12,
    },
    progressRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    progressBar: {
        flex: 1,
        height: 6,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        borderRadius: 3,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#FFFFFF",
        borderRadius: 3,
    },
    progressPercent: {
        fontSize: 10,
        fontFamily: "Inter_700Bold",
        color: "#FFFFFF",
    },
    challengeIcon: { marginLeft: 10 },
    tabsWrapper: {
        marginBottom: 24,
    },
    tabsContainer: {
        flexDirection: "row",
        backgroundColor: COLORS.surface,
        padding: 4,
        borderRadius: 18,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    tab: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        borderRadius: 14,
        gap: 8,
    },
    activeTab: {
        backgroundColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    tabText: {
        fontSize: 14,
        fontFamily: "Inter_700Bold",
        color: COLORS.textSecondary,
    },
    activeTabText: {
        color: "#FFF",
    },
    listContainer: { gap: 16 },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    subjectBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    subjectText: {
        fontSize: 11,
        fontFamily: "Inter_700Bold",
        color: COLORS.primary,
        textTransform: "uppercase",
    },
    completedBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.success + "15",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 4,
    },
    completedText: {
        fontSize: 12,
        fontFamily: "Inter_700Bold",
        color: COLORS.success,
    },
    cardTitle: {
        fontSize: 19,
        fontFamily: "Inter_800ExtraBold",
        color: COLORS.textPrimary,
        marginBottom: 10,
    },
    cardSnippet: {
        fontSize: 14,
        fontFamily: "Inter_400Regular",
        color: COLORS.textSecondary,
        lineHeight: 22,
        marginBottom: 20,
    },
    cardDetails: {
        flexDirection: "row",
        gap: 16,
        marginBottom: 24,
    },
    detailItem: { flexDirection: "row", alignItems: "center", gap: 6 },
    detailText: {
        fontSize: 13,
        fontFamily: "Inter_600SemiBold",
        color: COLORS.textMuted,
    },
    cardButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        borderRadius: 16,
        gap: 8,
    },
    cardButtonText: {
        fontSize: 15,
        fontFamily: "Inter_700Bold",
        color: "#FFF",
    },
    completedButton: {
        backgroundColor: COLORS.background,
    },
    completedButtonText: {
        color: COLORS.textMuted,
    },
    loaderContainer: {
        paddingVertical: 60,
        alignItems: 'center',
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 15,
        fontFamily: "Inter_600SemiBold",
        color: COLORS.textMuted,
    },
});
