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
    Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Animated, { FadeInDown, FadeInUp, Layout } from "react-native-reanimated";
import { PageHeader } from "@/components/PageHeader";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";
import { LeaderboardEntry } from "@/lib/types/student";

function LeaderboardPage() {
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState<"class" | "global">("class");
    const [rankings, setRankings] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchRankings = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setIsLoading(true);

        try {
            const response = await api.get<LeaderboardEntry[]>(
                `/api/v1/dashboard/student/leaderboard?type=${activeTab}`
            );
            setRankings(response as any || []);
        } catch (error) {
            console.error("Error fetching rankings:", error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchRankings();
    }, [fetchRankings]);

    const onRefresh = useCallback(() => {
        fetchRankings(true);
    }, [fetchRankings]);

    const top3 = rankings.slice(0, 3);
    const others = rankings.slice(3);

    return (
        <View style={styles.container}>
            <PageHeader title="Leaderboard" subtitle="Top Performers" />

            <View style={styles.tabWrapper}>
                <BlurView intensity={20} tint="light" style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === "class" && styles.activeTab]}
                        onPress={() => setActiveTab("class")}
                    >
                        <Text style={[styles.tabText, activeTab === "class" && styles.activeTabText]}>My Class</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === "global" && styles.activeTab]}
                        onPress={() => setActiveTab("global")}
                    >
                        <Text style={[styles.tabText, activeTab === "global" && styles.activeTabText]}>Global</Text>
                    </TouchableOpacity>
                </BlurView>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                    paddingBottom: insets.bottom + 80,
                }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
                }
            >
                {isLoading ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loadingText}>Fetching rankings...</Text>
                    </View>
                ) : rankings.length > 0 ? (
                    <View style={styles.contentContainer}>
                        {/* Podium Section */}
                        <View style={styles.podiumContainer}>
                            {/* Rank 2 */}
                            {top3[1] && (
                                <Animated.View entering={FadeInUp.delay(300)} style={[styles.podiumItem, styles.podiumRank2]}>
                                    <View style={styles.podiumAvatarWrapper}>
                                        <View style={[styles.podiumAvatar, { borderColor: '#C0C0C0' }]}>
                                            <Text style={styles.podiumAvatarText}>{top3[1].student.user.name.charAt(0)}</Text>
                                        </View>
                                        <View style={[styles.podiumBadge, { backgroundColor: '#C0C0C0' }]}>
                                            <Text style={styles.podiumBadgeText}>2</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.podiumName} numberOfLines={1}>{top3[1].student.user.name.split(' ')[0]}</Text>
                                    <View style={styles.podiumScoreContainer}>
                                        <Text style={styles.podiumScore}>{activeTab === "class" ? top3[1].academicScore : top3[1].enhancementScore}</Text>
                                        <Text style={styles.podiumScoreUnit}>PTS</Text>
                                    </View>
                                </Animated.View>
                            )}

                            {/* Rank 1 */}
                            {top3[0] && (
                                <Animated.View entering={FadeInUp.delay(100)} style={[styles.podiumItem, styles.podiumRank1]}>
                                    <View style={styles.podiumAvatarWrapper}>
                                        <LinearGradient
                                            colors={['#FFD700', '#FFA500']}
                                            style={styles.podiumAvatarGlow}
                                        />
                                        <View style={[styles.podiumAvatar, styles.podiumAvatarLarge, { borderColor: '#FFD700' }]}>
                                            <Text style={[styles.podiumAvatarText, styles.podiumAvatarTextLarge]}>{top3[0].student.user.name.charAt(0)}</Text>
                                        </View>
                                        <View style={[styles.podiumBadge, styles.podiumBadgeLarge, { backgroundColor: '#FFD700' }]}>
                                            <Ionicons name="trophy" size={14} color="#FFFFFF" />
                                        </View>
                                    </View>
                                    <Text style={[styles.podiumName, styles.podiumNameLarge]} numberOfLines={1}>{top3[0].student.user.name.split(' ')[0]}</Text>
                                    <View style={styles.podiumScoreContainer}>
                                        <Text style={[styles.podiumScore, styles.podiumScoreLarge]}>{activeTab === "class" ? top3[0].academicScore : top3[0].enhancementScore}</Text>
                                        <Text style={styles.podiumScoreUnit}>PTS</Text>
                                    </View>
                                </Animated.View>
                            )}

                            {/* Rank 3 */}
                            {top3[2] && (
                                <Animated.View entering={FadeInUp.delay(500)} style={[styles.podiumItem, styles.podiumRank3]}>
                                    <View style={styles.podiumAvatarWrapper}>
                                        <View style={[styles.podiumAvatar, { borderColor: '#CD7F32' }]}>
                                            <Text style={styles.podiumAvatarText}>{top3[2].student.user.name.charAt(0)}</Text>
                                        </View>
                                        <View style={[styles.podiumBadge, { backgroundColor: '#CD7F32' }]}>
                                            <Text style={styles.podiumBadgeText}>3</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.podiumName} numberOfLines={1}>{top3[2].student.user.name.split(' ')[0]}</Text>
                                    <View style={styles.podiumScoreContainer}>
                                        <Text style={styles.podiumScore}>{activeTab === "class" ? top3[2].academicScore : top3[2].enhancementScore}</Text>
                                        <Text style={styles.podiumScoreUnit}>PTS</Text>
                                    </View>
                                </Animated.View>
                            )}
                        </View>

                        {/* Others List */}
                        <View style={styles.listSection}>
                            {others.map((entry, index) => {
                                const rank = index + 4;
                                const score = activeTab === "class" ? entry.academicScore : entry.enhancementScore;

                                return (
                                    <Animated.View
                                        key={entry.id}
                                        entering={FadeInDown.delay(600 + index * 50)}
                                        layout={Layout.springify()}
                                        style={styles.rankCard}
                                    >
                                        <View style={styles.rankNumberContainer}>
                                            <Text style={styles.rankNumber}>#{rank}</Text>
                                        </View>

                                        <View style={styles.userInfo}>
                                            <View style={styles.avatarPlaceholder}>
                                                <Text style={styles.avatarText}>{entry.student.user.name.charAt(0)}</Text>
                                            </View>
                                            <View>
                                                <Text style={styles.userName}>{entry.student.user.name}</Text>
                                                <View style={styles.trendContainer}>
                                                    <Ionicons name="caret-up" size={12} color={COLORS.success} />
                                                    <Text style={styles.trendText}>+2 positions</Text>
                                                </View>
                                            </View>
                                        </View>

                                        <View style={styles.scoreItem}>
                                            <Text style={styles.scoreValue}>{score || 0}</Text>
                                            <Text style={styles.scoreLabel}>PTS</Text>
                                        </View>
                                    </Animated.View>
                                );
                            })}
                        </View>
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconContainer}>
                            <Ionicons name="stats-chart" size={48} color={COLORS.textMuted} />
                        </View>
                        <Text style={styles.emptyText}>No rankings available yet</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    tabWrapper: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 16,
    },
    tabContainer: {
        flexDirection: "row",
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        padding: 4,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 16,
        alignItems: "center",
    },
    activeTab: {
        backgroundColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    tabText: {
        fontSize: 14,
        fontFamily: "Inter_600SemiBold",
        color: COLORS.textSecondary,
    },
    activeTabText: {
        color: "#FFFFFF",
    },
    contentContainer: {
        flex: 1,
    },
    podiumContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 32,
        gap: 12,
    },
    podiumItem: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    podiumRank1: {
        height: 200,
        paddingTop: 24,
        zIndex: 2,
        transform: [{ scale: 1.05 }],
        backgroundColor: COLORS.surface,
        shadowColor: "#FFD700",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    podiumRank2: {
        height: 170,
        zIndex: 1,
    },
    podiumRank3: {
        height: 160,
        zIndex: 1,
    },
    podiumAvatarWrapper: {
        position: 'relative',
        marginBottom: 12,
    },
    podiumAvatarGlow: {
        position: 'absolute',
        top: -4,
        left: -4,
        right: -4,
        bottom: -4,
        borderRadius: 36,
        opacity: 0.3,
    },
    podiumAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.background,
        borderWidth: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    podiumAvatarLarge: {
        width: 72,
        height: 72,
        borderRadius: 36,
    },
    podiumAvatarText: {
        fontSize: 20,
        fontFamily: "Inter_700Bold",
        color: COLORS.textPrimary,
    },
    podiumAvatarTextLarge: {
        fontSize: 24,
    },
    podiumBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.surface,
    },
    podiumBadgeLarge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        bottom: -2,
        right: -2,
    },
    podiumBadgeText: {
        fontSize: 12,
        fontFamily: "Inter_800ExtraBold",
        color: "#FFFFFF",
    },
    podiumName: {
        fontSize: 13,
        fontFamily: "Inter_700Bold",
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    podiumNameLarge: {
        fontSize: 15,
    },
    podiumScoreContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 2,
    },
    podiumScore: {
        fontSize: 18,
        fontFamily: "Inter_800ExtraBold",
        color: COLORS.primary,
    },
    podiumScoreLarge: {
        fontSize: 22,
    },
    podiumScoreUnit: {
        fontSize: 10,
        fontFamily: "Inter_600SemiBold",
        color: COLORS.textMuted,
    },
    listSection: {
        paddingHorizontal: 16,
        gap: 12,
    },
    rankCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.surface,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    rankNumberContainer: {
        width: 40,
        alignItems: "center",
    },
    rankNumber: {
        fontSize: 14,
        fontFamily: "Inter_700Bold",
        color: COLORS.textMuted,
    },
    userInfo: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    avatarPlaceholder: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: COLORS.background,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    avatarText: {
        fontSize: 16,
        fontFamily: "Inter_700Bold",
        color: COLORS.primary,
    },
    userName: {
        fontSize: 15,
        fontFamily: "Inter_600SemiBold",
        color: COLORS.textPrimary,
    },
    trendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    trendText: {
        fontSize: 11,
        fontFamily: "Inter_500Medium",
        color: COLORS.success,
    },
    scoreItem: {
        alignItems: "flex-end",
    },
    scoreValue: {
        fontSize: 18,
        fontFamily: "Inter_800ExtraBold",
        color: COLORS.textPrimary,
    },
    scoreLabel: {
        fontSize: 10,
        fontFamily: "Inter_700Bold",
        color: COLORS.textMuted,
        letterSpacing: 0.5,
    },
    loaderContainer: {
        paddingVertical: 100,
        alignItems: "center",
    },
    loadingText: {
        marginTop: 16,
        fontSize: 14,
        fontFamily: "Inter_600SemiBold",
        color: COLORS.textMuted,
    },
    emptyState: {
        alignItems: "center",
        padding: 60,
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 30,
        backgroundColor: COLORS.surface,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    emptyText: {
        fontSize: 15,
        fontFamily: "Inter_500Medium",
        color: COLORS.textMuted,
    },
});

export default LeaderboardPage;
