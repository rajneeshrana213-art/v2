import { useState, useCallback, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { StatusBar } from "expo-status-bar";
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeInLeft,
  FadeInRight,
  Layout,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/lib/auth-context";
import { COLORS } from "@/constants/colors";
import { QuickAction } from "@/components/QuickAction";
import { TeacherBottomNav } from "@/components/TeacherBottomNav";
import { api } from "@/lib/api";
import { TeacherDashboardData } from "@/lib/types/teacher";
import { format } from "date-fns";

const { width } = Dimensions.get("window");
const IS_TABLET = width > 768;
const COLUMN_COUNT = IS_TABLET ? 4 : 3;

const QUICK_ACTIONS = [
  { key: "attendance", label: "Attendance", icon: "checkbox-outline" as const, color: "#22C55E", priority: true },
  { key: "classes", label: "My Classes", icon: "school-outline" as const, color: "#3B82F6", priority: true },
  { key: "homework", label: "Homework", icon: "document-text-outline" as const, color: "#8B5CF6", priority: true },
  { key: "timetable", label: "Timetable", icon: "calendar-outline" as const, color: "#F59E0B", priority: true },
  { key: "exam", label: "Exams", icon: "ribbon-outline" as const, color: "#EC4899" },
  { key: "pyq", label: "PYQs", icon: "layers-outline" as const, color: "#6366F1" },
  { key: "leave", label: "My Leave", icon: "calendar-clear-outline" as const, color: "#F43F5E" },
  { key: "student_leaves", label: "Std. Leaves", icon: "people-outline" as const, color: "#06B6D4" },
  { key: "doubts", label: "Doubts", icon: "help-circle-outline" as const, color: "#F59E0B" },
  { key: "enhancement", label: "Enhancement", icon: "flash-outline" as const, color: "#6366F1" },
  { key: "my-attendance", label: "Self Attendance", icon: "scan-outline" as const, color: "#4F46E5" },
  { key: "tickets", label: "Tickets", icon: "help-buoy-outline" as const, color: "#EF4444" },

];

export default function TeacherDashboard() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<TeacherDashboardData | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await api.get<TeacherDashboardData>("/api/v1/dashboard/teacher");
      setDashboardData(response as any);
    } catch (error) {
      console.error("Failed to fetch teacher dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleAction = useCallback((key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const routeMap: Record<string, string> = {
      attendance: "/pages/teacher-attendance",
      classes: "/pages/classes",
      homework: "/pages/teacher-homework",
      pyq: "/pages/teacher-pyq",
      exam: "/pages/teacher-exams",
      student_leaves: "/pages/student_leaves",
      doubt_forum: "/pages/teacher-doubt-forum",
      "doubt-forum": "/pages/teacher-doubt-forum",
      doubts: "/pages/teacher-doubt-forum",
      "my-attendance": "/pages/my-attendance",
      "tickets": "/pages/tickets",
      communication: "/pages/communication",
      notices: "/pages/notices",
      leave: "/pages/leave",
      enhancement: "/pages/teacher-enhancement",
      "live-tools": "/pages/live-tools",
    };
    const route = routeMap[key] || `/pages/${key}`;
    router.push(route as any);
  }, []);

  const getGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const stats = [
    {
      label: "Today's Classes",
      value: dashboardData?.stats.todayClasses.toString() || "0",
      color: "#3B82F6",
      icon: "book-outline" as const,
    },
    {
      label: "Attendance",
      value: dashboardData?.stats.attendancePending ? "Pending" : "Marked",
      color: dashboardData?.stats.attendancePending ? "#F59E0B" : COLORS.success,
      icon: "checkbox-outline" as const,
    },
    {
      label: "HW to Review",
      value: dashboardData?.stats.homeworkToReview.toString() || "0",
      color: "#8B5CF6",
      icon: "document-text-outline" as const,
    },
    {
      label: "Notices",
      value: dashboardData?.stats.noticesCount.toString() || "0",
      color: COLORS.success,
      icon: "megaphone-outline" as const,
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* Modern Hero Header */}
        <View style={styles.heroWrapper}>
          <LinearGradient
            colors={["#1A73B5", "#3BA5D9"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.heroGradient, { paddingTop: insets.top + 20 }]}
          >
            <View style={styles.heroContent}>
              <View style={styles.userInfo}>
                <Animated.Text entering={FadeInLeft.delay(100)} style={styles.heroGreeting}>
                  {getGreeting},
                </Animated.Text>
                <Animated.Text entering={FadeInLeft.delay(200)} style={styles.heroName}>
                  {dashboardData?.personalInfo.name || user?.name || "Teacher"}
                </Animated.Text>
                <Animated.View entering={FadeInLeft.delay(300)} style={styles.heroBadge}>
                  <Text style={styles.heroBadgeText}>
                    {dashboardData?.personalInfo.subjects.slice(0, 2).join(", ") || "Lead Instructor"}
                  </Text>
                </Animated.View>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Pressable
                  style={styles.actionCircle}
                  onPress={() => router.push("/pages/notifications" as any)}
                >
                  <Ionicons name="notifications-outline" size={22} color="#FFF" />
                  {dashboardData?.stats.noticesCount ? <View style={styles.actionDot} /> : null}
                </Pressable>
                <Pressable
                  style={styles.avatarWrapper}
                  onPress={() => router.push("/pages/profile" as any)}
                >
                  <Image
                    source={{
                      uri: dashboardData?.personalInfo.profilePic ||
                        `https://api.dicebear.com/7.x/initials/png?seed=${encodeURIComponent(dashboardData?.personalInfo.name || user?.name || "T")}&backgroundColor=ffffff&textColor=1A73B5`,
                    }}
                    style={styles.avatarImage}
                  />
                </Pressable>
              </View>
            </View>

            {/* Glassmorphism Stats Card */}
            <Animated.View entering={FadeInUp.delay(400)} style={styles.statsCard}>
              {stats.map((stat, idx) => (
                <View key={idx} style={[styles.statItem, idx === stats.length - 1 && { borderRightWidth: 0 }]}>
                  <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </Animated.View>
          </LinearGradient>
        </View>

        <View style={styles.bodyContent}>
          {/* Quick Actions Grid */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
            </View>
            <View style={styles.actionsGrid}>
              {QUICK_ACTIONS.map((action, idx) => (
                <Animated.View
                  key={action.key}
                  entering={FadeInDown.delay(100 + idx * 30)}
                  layout={Layout.springify()}
                  style={[styles.gridItem, { width: (width - 48) / COLUMN_COUNT }]}
                >
                  <QuickAction
                    label={action.label}
                    icon={action.icon}
                    color={action.color}
                    onPress={() => handleAction(action.key)}
                  />
                </Animated.View>
              ))}
            </View>
          </View>

          {/* Today's Schedule */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Today&apos;s Schedule</Text>
                <Text style={styles.sectionSubtitle}>{format(new Date(), "EEEE, MMM d")}</Text>
              </View>
              <Pressable
                style={styles.seeAllBtn}
                onPress={() => router.push("/pages/timetable" as any)}
              >
                <Text style={styles.seeAllText}>Full View</Text>
                <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
              </Pressable>
            </View>

            {dashboardData?.todaySchedule && dashboardData.todaySchedule.length > 0 ? (
              dashboardData.todaySchedule.map((cls, index) => (
                <Animated.View
                  key={index}
                  entering={FadeInRight.delay(200 + index * 100)}
                  style={styles.scheduleCard}
                >
                  <View style={[styles.scheduleIndicator, { backgroundColor: COLORS.primary }]} />
                  <View style={styles.scheduleInfo}>
                    <View style={styles.scheduleHeader}>
                      <Text style={styles.scheduleTime}>
                        {format(new Date(cls.startTime), "hh:mm a")}
                      </Text>
                      <View style={styles.roomBadge}>
                        <Ionicons name="location-outline" size={10} color={COLORS.primary} />
                        <Text style={styles.roomText}>{cls.room !== "N/A" ? cls.room : "Online"}</Text>
                      </View>
                    </View>
                    <Text style={styles.scheduleClass}>{cls.class}</Text>
                    <Text style={styles.scheduleSubject}>{cls.subject}</Text>
                  </View>
                  <Pressable
                    style={styles.attendanceAction}
                    onPress={() => router.push("/pages/teacher-attendance" as any)}
                  >
                    <Ionicons name="checkbox" size={24} color={COLORS.primary} />
                  </Pressable>
                </Animated.View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="calendar-clear-outline" size={30} color={COLORS.textMuted} />
                </View>
                <Text style={styles.emptyStateTitle}>No Classes Today</Text>
                <Text style={styles.emptyStateText}>Enjoy your free time or prepare for tomorrow.</Text>
              </View>
            )}
          </View>

          {/* Student Interactions (Doubts & Submissions) */}
          {(dashboardData?.recentDoubts?.length || 0) > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Doubts</Text>
                <Pressable onPress={() => router.push("/pages/teacher-doubt-forum" as any)}>
                  <Text style={styles.seeAllText}>View All</Text>
                </Pressable>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                {dashboardData?.recentDoubts?.map((doubt, idx) => (
                  <Animated.View
                    key={doubt.id}
                    entering={FadeInDown.delay(300 + idx * 100)}
                    style={styles.interactionCard}
                  >
                    <View style={styles.interactionHeader}>
                      <Image
                        source={{ uri: doubt.user?.profilePic || "https://ui-avatars.com/api/?name=" + doubt.user?.name }}
                        style={styles.miniAvatar}
                      />
                      <View style={{ flex: 1, marginLeft: 8 }}>
                        <Text style={styles.interactionUser}>{doubt.user?.name}</Text>
                        <Text style={styles.interactionMeta}>{doubt.subject?.name}</Text>
                      </View>
                    </View>
                    <Text style={styles.interactionText} numberOfLines={2}>{doubt.content}</Text>
                    <Pressable
                      style={styles.interactionButton}
                      onPress={() => router.push("/pages/teacher-doubt-forum" as any)}
                    >
                      <Text style={styles.interactionButtonText}>Resolve Now</Text>
                    </Pressable>
                  </Animated.View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Recent Submissions */}
          {(dashboardData?.recentSubmissions?.length || 0) > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Submissions</Text>
                <Pressable onPress={() => router.push("/pages/teacher-homework" as any)}>
                  <Text style={styles.seeAllText}>Review All</Text>
                </Pressable>
              </View>
              <View style={styles.submissionsContainer}>
                {dashboardData?.recentSubmissions?.map((sub, idx) => (
                  <Animated.View
                    key={sub.id}
                    entering={FadeInUp.delay(400 + idx * 50)}
                    style={styles.submissionRow}
                  >
                    <Image
                      source={{ uri: sub.student?.user?.profilePic || "https://ui-avatars.com/api/?name=" + sub.student?.user?.name }}
                      style={styles.rowAvatar}
                    />
                    <View style={styles.rowInfo}>
                      <Text style={styles.rowTitle}>{sub.student?.user?.name}</Text>
                      <Text style={styles.rowSubtitle}>{sub.homework?.title}</Text>
                    </View>
                    <View style={{ alignItems: "flex-end", gap: 4 }}>
                      <Text style={styles.rowTime}>{format(new Date(sub.submittedAt), "MMM d")}</Text>
                      <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
                    </View>
                  </Animated.View>
                ))}
              </View>
            </View>
          )}

          {/* Latest Notices */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Latest Notices</Text>
              <Pressable onPress={() => router.push("/pages/notices" as any)}>
                <Text style={styles.seeAllText}>See All</Text>
              </Pressable>
            </View>
            {dashboardData?.notices?.length ? (
              dashboardData.notices?.map((notice, idx) => (
                <Animated.View
                  key={notice.id}
                  entering={FadeInUp.delay(500 + idx * 50)}
                  style={styles.noticeCard}
                >
                  <View style={styles.noticeIconBox}>
                    <Ionicons name="megaphone" size={18} color={COLORS.primary} />
                  </View>
                  <View style={styles.noticeContent}>
                    <Text style={styles.noticeTitle} numberOfLines={1}>{notice.title}</Text>
                    <Text style={styles.noticeDate}>{format(new Date(notice.createdAt), "MMMM d, yyyy")}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.border} />
                </Animated.View>
              ))
            ) : (
              <View style={styles.emptyNotice}>
                <Text style={styles.emptyText}>No new notices today</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <TeacherBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // Hero Section
  heroWrapper: {
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: { elevation: 8 },
    }),
  },
  heroGradient: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  heroContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
  },
  userInfo: { flex: 1 },
  heroGreeting: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.8)",
  },
  heroName: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    marginTop: 2,
    letterSpacing: -0.5,
  },
  heroBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
    alignSelf: "flex-start",
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  heroBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  actionCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  actionDot: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF4D4D",
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  avatarWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
    padding: 2,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
  },

  // Stats Card
  statsCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 24,
    padding: 20,
    marginTop: -10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 15,
      },
      android: { elevation: 6 },
    }),
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "rgba(0,0,0,0.05)",
  },
  statValue: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: "center",
  },

  // Body Content
  bodyContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  seeAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  seeAllText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: COLORS.primary,
    marginRight: 4,
  },

  // Grid
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
  },
  gridItem: {
    paddingHorizontal: 8,
    marginBottom: 20,
  },

  // Schedule Card
  scheduleCard: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  scheduleIndicator: {
    width: 4,
    height: "80%",
    borderRadius: 2,
    marginRight: 16,
  },
  scheduleInfo: { flex: 1 },
  scheduleHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  scheduleTime: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: COLORS.textMuted,
  },
  roomBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  roomText: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    color: COLORS.primary,
  },
  scheduleClass: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: COLORS.textPrimary,
  },
  scheduleSubject: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: COLORS.textSecondary,
  },
  attendanceAction: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
  },

  // Interactions (Doubts)
  horizontalScroll: {
    paddingRight: 20,
    gap: 16,
  },
  interactionCard: {
    width: width * 0.75,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  interactionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  miniAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.border,
  },
  interactionUser: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: COLORS.textPrimary,
  },
  interactionMeta: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: COLORS.textMuted,
  },
  interactionText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  interactionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  interactionButtonText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },

  // Submissions Row
  submissionsContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  submissionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  rowAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.border,
  },
  rowInfo: {
    flex: 1,
    marginLeft: 12,
  },
  rowTitle: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: COLORS.textPrimary,
  },
  rowSubtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: COLORS.textMuted,
  },
  rowAction: {
    alignItems: "flex-end",
    gap: 4,
  },
  rowTime: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: COLORS.textMuted,
  },

  // Notices
  noticeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  noticeIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  noticeContent: { flex: 1 },
  noticeTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: COLORS.textPrimary,
  },
  noticeDate: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Empty States
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: "dashed",
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: COLORS.textPrimary,
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 4,
  },
  emptyNotice: {
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: COLORS.textMuted,
  },
});
