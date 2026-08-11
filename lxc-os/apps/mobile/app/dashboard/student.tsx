import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Image,
  Dimensions,
  TextInput,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { StatusBar } from "expo-status-bar";
import Animated, {
  FadeInUp,
  FadeInRight,
  Layout,
  FadeInDown,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useAuth } from "@/lib/auth-context";
import { COLORS } from "@/constants/colors";
import { DashboardStats } from "@/components/DashboardStats";
import { QuickAction } from "@/components/QuickAction";
import { BottomNav } from "@/components/BottomNav";
import { api } from "@/lib/api";
import { StudentDashboardData } from "@/lib/types/student";
import { format } from "date-fns";
import { makeISTDateTime, formatISTDateKey } from "@/lib/date-utils";

const { width } = Dimensions.get("window");

export default function StudentDashboard() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<StudentDashboardData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await api.get<StudentDashboardData>("/api/v1/dashboard/student");
      setDashboardData(response as any);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
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
      "pyqs": "/pages/pyqs",
      "enhancement": "/pages/enhancement",
      "leaderboard": "/pages/leaderboard",
      "my-progress": "/pages/my-progress",
      "doubts": "/pages/doubts",
      "browse_books": "/pages/browse_books",
      "my_books": "/pages/my_books",
      "fees": "/pages/fees",
      "attendance": "/pages/attendance",
      "exams": "/pages/exams",
      "leave": "/pages/leave",
      "timetable": "/pages/timetable",
      "homework": "/pages/homework",
      "notices": "/pages/notices",
      "profile": "/pages/profile",
      "live-tracking": "/pages/live-tracking",
      "tickets": "/pages/tickets",
    };

    const route = routeMap[key] || `/pages/${key}`;
    router.push(route as any);
  }, []);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    const query = searchQuery.toLowerCase().trim();
    const searchableRoutes: Record<string, string> = {
      "homework": "/pages/homework",
      "hw": "/pages/homework",
      "attendance": "/pages/attendance",
      "exam": "/pages/exams",
      "exams": "/pages/exams",
      "result": "/pages/exams",
      "results": "/pages/exams",
      "pyq": "/pages/pyqs",
      "pyqs": "/pages/pyqs",
      "fee": "/pages/fees",
      "fees": "/pages/fees",
      "leave": "/pages/leave",
      "leaves": "/pages/leave",
      "rank": "/pages/leaderboard",
      "leaderboard": "/pages/leaderboard",
      "enhance": "/pages/enhancement",
      "enhancement": "/pages/enhancement",
      "notice": "/pages/notices",
      "notices": "/pages/notices",
      "timetable": "/pages/timetable",
      "schedule": "/pages/timetable",
      "profile": "/pages/profile",
      "account": "/pages/profile",
      "books": "/pages/browse_books",
      "library": "/pages/browse_books",
      "doubt": "/pages/doubts",
      "doubts": "/pages/doubts",
      "ticket": "/pages/tickets",
      "tickets": "/pages/tickets",
      "support": "/pages/tickets",
    };

    const targetRoute = searchableRoutes[query];
    if (targetRoute) {
      router.push(targetRoute as any);
      setSearchQuery(""); // Clear after navigation
    } else {
      // You could route to a generic generic search page here later
      // router.push({ pathname: "/pages/search", params: { q: searchQuery } });
      alert(`No direct action found for "${searchQuery}". Try searching for 'exams', 'homework', etc.`);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const stats = dashboardData?.stats;
  const personalInfo = dashboardData?.personalInfo;

  const QUICK_ACTIONS = [
    { key: "homework", label: "Homework", icon: "document-text-outline" as const, color: "#3B82F6" },
    { key: "attendance", label: "Attendance", icon: "checkbox-outline" as const, color: "#22C55E" },
    { key: "exams", label: "Result", icon: "ribbon-outline" as const, color: "#8B5CF6" },
    { key: "pyqs", label: "PYQs", icon: "layers-outline" as const, color: "#F59E0B" },
    { key: "fees", label: "Fees", icon: "card-outline" as const, color: "#EC4899" },
    { key: "leave", label: "Leave", icon: "calendar-clear-outline" as const, color: "#6366F1" },
    { key: "leaderboard", label: "Rank", icon: "trophy-outline" as const, color: "#F43F5E" },
    { key: "enhancement", label: "Enhance", icon: "bulb-outline" as const, color: "#06B6D4" },
    { key: "notices", label: "Notices", icon: "megaphone-outline" as const, color: "#10B981" },
    { key: "my-progress", label: "Progress", icon: "trending-up-outline" as const, color: "#6366F1" },
    { key: "live-tracking", label: "Bus Track", icon: "bus-outline" as const, color: "#06B6D4" },
    { key: "tickets", label: "Support", icon: "help-buoy-outline" as const, color: "#EF4444" },
  ];

  const SEARCHABLE_ITEMS = [
    { key: "homework", label: "Homework & Assignments", icon: "document-text-outline" },
    { key: "attendance", label: "Attendance Records", icon: "checkbox-outline" },
    { key: "exams", label: "Exams & Results", icon: "ribbon-outline" },
    { key: "pyqs", label: "Previous Year Questions", icon: "layers-outline" },
    { key: "fees", label: "Fee Management", icon: "card-outline" },
    { key: "leave", label: "Leave Applications", icon: "calendar-clear-outline" },
    { key: "leaderboard", label: "Leaderboard & Rank", icon: "trophy-outline" },
    { key: "enhancement", label: "Skill Enhancement", icon: "bulb-outline" },
    { key: "notices", label: "Notices & Announcements", icon: "megaphone-outline" },
    { key: "timetable", label: "Timetable & Schedule", icon: "time-outline" },
    { key: "profile", label: "My Profile", icon: "person-outline" },
    { key: "browse_books", label: "Library & Books", icon: "book-outline" },
    { key: "doubts", label: "Doubt Forum", icon: "help-circle-outline" },
    { key: "tickets", label: "Support Tickets", icon: "help-buoy-outline" },
  ];

  const searchResults = searchQuery.trim() ? SEARCHABLE_ITEMS.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.key.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Top Navigation Bar */}
      <View style={[styles.navBar, { paddingTop: insets.top + 5 }]}>
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.navLogo}
          resizeMode="contain"
        />
        <View style={styles.navRight}>
          <Pressable
            style={styles.navBtn}
            onPress={() => router.push("/pages/notices")}
          >
            <Ionicons name="notifications-outline" size={24} color={COLORS.textPrimary} />
            {dashboardData?.notices && dashboardData.notices.length > 0 && <View style={styles.notifDot} />}
          </Pressable>
          <Pressable
            style={styles.navBtn}
            onPress={() => router.push("/pages/profile")}
          >
            <Ionicons name="person-outline" size={24} color={COLORS.textPrimary} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 100, // Extra space for BottomNav
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* Hero Section */}
        <Animated.View
          entering={FadeInDown.duration(800)}
          style={styles.heroContainer}
        >
          <LinearGradient
            colors={COLORS.gradients.premium as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <View style={styles.heroContent}>
              <View style={styles.userInfo}>
                <Text style={styles.heroGreeting}>Welcome back,</Text>
                <Text style={styles.heroName}>{personalInfo?.name || user?.name || "Student"}</Text>
                <View style={styles.heroBadge}>
                  <Text style={styles.heroBadgeText}>
                    {personalInfo?.class || "Class"} • Roll {personalInfo?.rollNo || "N/A"}
                  </Text>
                </View>
              </View>
              <View style={styles.heroAvatarContainer}>
                {personalInfo?.profilePic ? (
                  <Image source={{ uri: personalInfo.profilePic }} style={styles.heroAvatarImage} />
                ) : (
                  <View style={styles.heroAvatar}>
                    <Ionicons name="person" size={32} color={COLORS.primary} />
                  </View>
                )}
                <View style={styles.onlineDot} />
              </View>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <BlurView intensity={30} tint="light" style={styles.searchBlur}>
                <Ionicons name="search-outline" size={20} color="#FFFFFF" style={styles.searchIcon} />
                <TextInput
                  placeholder="Search resources, lessons..."
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  returnKeyType="search"
                  onSubmitEditing={handleSearch}
                />
              </BlurView>
            </View>
          </LinearGradient>
        </Animated.View>

        <View style={styles.contentPadding}>
          {searchQuery.trim().length > 0 ? (
            <View style={styles.searchResultsContainer}>
              <Text style={styles.sectionTitle}>Search Results</Text>
              {searchResults.length > 0 ? (
                searchResults.map((item, index) => (
                  <Animated.View key={item.key} entering={FadeInUp.delay(index * 50)}>
                    <Pressable
                      style={({ pressed }) => [styles.searchResultItem, pressed && { opacity: 0.7 }]}
                      onPress={() => {
                        setSearchQuery("");
                        handleAction(item.key);
                      }}
                    >
                      <View style={styles.searchResultIcon}>
                        <Ionicons name={item.icon as any} size={20} color={COLORS.primary} />
                      </View>
                      <Text style={styles.searchResultText}>{item.label}</Text>
                      <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
                    </Pressable>
                  </Animated.View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="search-outline" size={40} color={COLORS.textMuted} />
                  <Text style={styles.emptyText}>No matching features found</Text>
                </View>
              )}
            </View>
          ) : (
            <>
              {/* Stats Section */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Overview</Text>
              </View>
              <DashboardStats
                attendance={stats?.attendancePercentage ? `${Math.round(stats.attendancePercentage)}%` : "0%"}
                pendingHW={stats?.pendingHomework || 0}
                examsSoon={stats?.upcomingExamsCount || 0}
                feeStatus={stats?.feePendingAmount && stats.feePendingAmount > 0 ? `₹${stats.feePendingAmount}` : "Paid"}
              />

              {/* Quick Actions Grid */}
              <Text style={styles.sectionTitle}>Services</Text>
              <View style={styles.actionsGrid}>
                {QUICK_ACTIONS.map((action, idx) => (
                  <Animated.View
                    key={action.key}
                    entering={FadeInUp.delay(300 + (idx * 50))}
                    style={styles.gridItem}
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

              {/* Today's Schedule */}
              <View style={[styles.sectionHeader, { marginTop: 10 }]}>
                <Text style={styles.sectionTitle}>Next Sessions</Text>
                <Pressable onPress={() => router.push("/pages/timetable")}>
                  <Text style={styles.seeAll}>Full Schedule</Text>
                </Pressable>
              </View>

              {dashboardData?.todaySchedule && dashboardData.todaySchedule.length > 0 ? (
                <View style={styles.timelineContainer}>
                  {dashboardData.todaySchedule.slice(0, 3).map((cls, index) => {
                    const makeDate = (value: string) => {
                      if (value.includes("T")) return new Date(value);
                      return makeISTDateTime(formatISTDateKey(new Date()), value);
                    };
                    const startTime = makeDate(cls.startTime);
                    const endTime = makeDate(cls.endTime);
                    const now = new Date();
                    const isOngoing = now >= startTime && now <= endTime;
                    const isPast = now > endTime;

                    return (
                      <Animated.View
                        layout={Layout.springify()}
                        entering={FadeInUp.delay(600 + (index * 100))}
                        key={`${cls.subject}-${index}`}
                        style={styles.timelineItem}
                      >
                        <View style={styles.timelineSidebar}>
                          <Text style={[styles.timelineTime, isOngoing && styles.activeText]}>
                            {format(startTime, "HH:mm")}
                          </Text>
                          <View style={styles.timelineLineWrapper}>
                            <View style={[
                              styles.timelineDot,
                              isOngoing && styles.activeDot,
                              isPast && styles.pastDot
                            ]} />
                            {index < 2 && <View style={styles.timelineLine} />}
                          </View>
                        </View>

                        <View style={[
                          styles.classCard,
                          isOngoing && styles.activeCard
                        ]}>
                          <View style={styles.classHeader}>
                            <View style={styles.classTitleGroup}>
                              <Text style={styles.classSubject}>{cls.subject}</Text>
                              <Text style={styles.classTeacher}>{cls.teacher}{cls.class ? ` • ${cls.class}` : ""}</Text>
                            </View>
                            {isOngoing && (
                              <View style={styles.liveBadge}>
                                <View style={styles.livePulse} />
                                <Text style={styles.liveText}>LIVE</Text>
                              </View>
                            )}
                          </View>
                          <View style={styles.classFooter}>
                            <View style={styles.footerItem}>
                              <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
                              <Text style={styles.footerText}>
                                {format(startTime, "h:mm a")}
                              </Text>
                            </View>
                            {cls.room !== "N/A" && (
                              <View style={styles.footerItem}>
                                <Ionicons name="location-outline" size={14} color={COLORS.textMuted} />
                                <Text style={styles.footerText}>Room {cls.room}</Text>
                              </View>
                            )}
                          </View>
                        </View>
                      </Animated.View>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="sparkles-outline" size={40} color={COLORS.textMuted} />
                  <Text style={styles.emptyText}>You&apos;re all set for today!</Text>
                </View>
              )}

              {/* Bottom Grid */}
              <View style={styles.gridRow}>
                <Animated.View entering={FadeInUp.delay(800)} style={styles.gridCol}>
                  <Text style={styles.sectionTitleSmall}>Exam Prep</Text>
                  <View style={styles.premiumCard}>
                    {dashboardData?.upcomingExams && dashboardData.upcomingExams.length > 0 ? (
                      dashboardData.upcomingExams.slice(0, 1).map((exam, idx) => (
                        <View key={idx}>
                          <Text style={styles.cardHighlight}>{typeof exam.subject === "string" ? exam.subject : exam.subject.name}</Text>
                          <Text style={styles.cardSubText}>{format(new Date(exam.scheduleDate), "MMM d")}</Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.cardPlaceholder}>All clear!</Text>
                    )}
                  </View>
                </Animated.View>
                <Animated.View entering={FadeInUp.delay(900)} style={styles.gridCol}>
                  <Text style={styles.sectionTitleSmall}>Latest Brief</Text>
                  <View style={[styles.premiumCard, { borderLeftColor: "#EC4899" }]}>
                    {dashboardData?.notices && dashboardData.notices.length > 0 ? (
                      dashboardData.notices.slice(0, 1).map((notice, idx) => (
                        <View key={idx}>
                          <Text style={styles.cardHighlight} numberOfLines={1}>{notice.title}</Text>
                          <Text style={styles.cardSubText}>Recent</Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.cardPlaceholder}>No news</Text>
                    )}
                  </View>
                </Animated.View>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Fully Fledged Bottom Nav */}
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centerContent: { justifyContent: "center", alignItems: "center" },
  contentPadding: { paddingHorizontal: 20 },

  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: COLORS.background,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    zIndex: 10,
  },
  navRight: { flexDirection: "row", gap: 12 },
  navBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  navLogo: { height: 44, width: 140 },
  notifDot: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
    borderWidth: 1.5,
    borderColor: COLORS.surface,
  },

  heroContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 30,
    overflow: "hidden",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  heroGradient: {
    padding: 24,
    paddingBottom: 28,
  },
  heroContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  userInfo: { flex: 1 },
  heroGreeting: { fontSize: 14, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.7)" },
  heroName: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#FFFFFF", marginTop: 4 },
  heroBadge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 10
  },
  heroBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#FFFFFF" },
  heroAvatarContainer: { position: "relative" },
  heroAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  heroAvatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.secondary,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  searchContainer: {
    borderRadius: 15,
    overflow: "hidden",
  },
  searchBlur: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    height: 46,
  },
  searchIcon: { marginRight: 10 },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },

  sectionTitle: { fontSize: 19, fontFamily: "Inter_700Bold", color: COLORS.textPrimary, marginBottom: 16 },
  sectionTitleSmall: { fontSize: 16, fontFamily: "Inter_700Bold", color: COLORS.textPrimary, marginBottom: 12 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  seeAll: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: COLORS.primary },

  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginHorizontal: -5,
    marginBottom: 24,
  },
  gridItem: {
    width: (width - 40) / 3,
    paddingHorizontal: 5,
    alignItems: "center",
    marginBottom: 20,
  },

  timelineContainer: { marginBottom: 24 },
  timelineItem: { flexDirection: "row", gap: 16, marginBottom: 12 },
  timelineSidebar: { alignItems: "center", width: 45 },
  timelineTime: { fontSize: 13, fontFamily: "Inter_700Bold", color: COLORS.textSecondary },
  activeText: { color: COLORS.primary },
  timelineLineWrapper: { alignItems: "center", flex: 1, marginTop: 10 },
  timelineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.border, zIndex: 1 },
  activeDot: { backgroundColor: COLORS.primary, width: 14, height: 14, borderRadius: 7 },
  pastDot: { backgroundColor: COLORS.secondary },
  timelineLine: { width: 1.5, flex: 1, backgroundColor: COLORS.border, marginVertical: 4 },

  classCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  activeCard: { borderColor: COLORS.primary + "40", backgroundColor: "#F0F9FF" },
  classHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  classTitleGroup: { flex: 1 },
  classSubject: { fontSize: 15, fontFamily: "Inter_700Bold", color: COLORS.textPrimary },
  classTeacher: { fontSize: 12, fontFamily: "Inter_400Regular", color: COLORS.textSecondary, marginTop: 1 },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4
  },
  livePulse: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.error },
  liveText: { fontSize: 10, fontFamily: "Inter_800ExtraBold", color: COLORS.error },
  classFooter: { flexDirection: "row", gap: 20 },
  footerItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  footerText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: COLORS.textMuted },

  gridRow: { flexDirection: "row", gap: 15, marginBottom: 10 },
  gridCol: { flex: 1 },
  premiumCard: {
    backgroundColor: COLORS.surface,
    padding: 18,
    borderRadius: 20,
    borderLeftWidth: 5,
    borderLeftColor: COLORS.primary,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHighlight: { fontSize: 14, fontFamily: "Inter_700Bold", color: COLORS.textPrimary },
  cardSubText: { fontSize: 12, fontFamily: "Inter_500Medium", color: COLORS.textMuted, marginTop: 4 },
  cardPlaceholder: { fontSize: 12, fontFamily: "Inter_400Regular", color: COLORS.textMuted, fontStyle: "italic" },

  emptyState: {
    padding: 30,
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: "dashed",
    gap: 12
  },
  emptyText: { fontSize: 14, fontFamily: "Inter_500Medium", color: COLORS.textMuted },

  searchResultsContainer: {
    paddingTop: 10,
    paddingBottom: 40,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchResultIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  searchResultText: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: COLORS.textPrimary,
  },
});
