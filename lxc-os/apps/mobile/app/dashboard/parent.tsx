import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  RefreshControl,
  ActivityIndicator,
  Image,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "@/lib/auth-context";
import { COLORS } from "@/constants/colors";
import { ParentBottomNav } from "@/components/ParentBottomNav";
import { api } from "@/lib/api";
import { Child, ParentDashboardData } from "@/lib/types/parent";
import { format } from "date-fns";
import Animated, { FadeInDown, FadeInUp, ZoomIn } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

const { width } = Dimensions.get("window");

export default function ParentDashboard() {
  const insets = useSafeAreaInsets();
  const { user, logout, setActiveStudentId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildIdx, setSelectedChildIdx] = useState(0);
  const [dashboardData, setDashboardData] = useState<ParentDashboardData | null>(null);

  const fetchDashboardData = useCallback(async (studentId: string) => {
    try {
      const resp = await api.get<ParentDashboardData>(`/api/v1/dashboard/parent/overview?studentId=${studentId}`);
      setDashboardData(resp as any);
    } catch (error) {
      console.error("Failed to fetch child dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchChildren = useCallback(async () => {
    try {
      const resp = await api.get<Child[]>("/api/v1/dashboard/parent/children");
      setChildren(resp as any);
      if (resp && (resp as any).length > 0) {
        setActiveStudentId((resp as any)[0].id);
        fetchDashboardData((resp as any)[0].id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Failed to fetch children:", error);
      setLoading(false);
    }
  }, [fetchDashboardData, setActiveStudentId]);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (children.length > 0) {
      fetchDashboardData(children[selectedChildIdx].id);
    } else {
      fetchChildren();
    }
  }, [children, selectedChildIdx, fetchChildren, fetchDashboardData]);

  const handleLogout = useCallback(async () => {
    await logout();
    router.replace("/login");
  }, [logout]);

  const selectChild = (index: number) => {
    setSelectedChildIdx(index);
    setLoading(true);
    setActiveStudentId(children[index].id);
    fetchDashboardData(children[index].id);
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const stats = [
    { label: "Attendance", value: `${dashboardData?.stats.attendancePercentage || 0}%`, color: "#3B82F6", bg: COLORS.surface, icon: "checkbox-outline" as const },
    { label: "Pending HW", value: dashboardData?.stats.pendingHomework.toString() || "0", color: "#F59E0B", bg: COLORS.surface, icon: "document-text-outline" as const },
    { label: "Fee Status", value: dashboardData?.stats.feeStatus || "N/A", color: COLORS.success, bg: COLORS.surface, icon: "card-outline" as const },
    { label: "Due", value: `₹ ${Math.round(dashboardData?.stats.feePendingAmount || 0).toLocaleString()}`, color: "#8B5CF6", bg: COLORS.surface, icon: "alert-circle-outline" as const },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: Platform.OS === "web" ? 67 + 24 : insets.top + 24,
          paddingBottom: Platform.OS === "web" ? 34 + 100 : insets.bottom + 100,
          paddingHorizontal: 24,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>Hello, {user?.name || "Parent"}</Text>
            <Text style={styles.subGreeting}>Parent Dashboard</Text>
          </View>
          <Pressable 
            style={styles.notifBtn}
            onPress={() => router.push("/pages/notifications" as any)}
          >
            <Ionicons name="notifications-outline" size={22} color={COLORS.textPrimary} />
            {dashboardData?.notices && dashboardData.notices.length > 0 && <View style={styles.notifDot} />}
          </Pressable>
        </Animated.View>

        {/* Child Selector */}
        {children.length > 0 && (
          <Animated.View entering={FadeInDown.delay(200)}>
            <Text style={styles.sectionLabel}>Select Child</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.childSelector}>
              {children.map((c, i) => {
                const isActive = selectedChildIdx === i;
                return (
                  <Pressable
                    key={c.id}
                    style={[styles.childChip, isActive && styles.childChipActive]}
                    onPress={() => selectChild(i)}
                  >
                    {isActive ? (
                      <LinearGradient
                        colors={[COLORS.primary, '#6366f1']}
                        style={styles.childAvatar}
                      >
                        {c.profilePic ? (
                          <Image source={{ uri: c.profilePic }} style={styles.childAvatarImage} />
                        ) : (
                          <Text style={[styles.childAvatarText, { color: "#fff" }]}>{c.name[0]}</Text>
                        )}
                      </LinearGradient>
                    ) : (
                      <View style={[styles.childAvatar, { backgroundColor: COLORS.primaryLight }]}>
                        {c.profilePic ? (
                          <Image source={{ uri: c.profilePic }} style={styles.childAvatarImage} />
                        ) : (
                          <Text style={styles.childAvatarText}>{c.name[0]}</Text>
                        )}
                      </View>
                    )}
                    <View>
                      <Text style={[styles.childChipName, isActive && styles.childChipNameActive]}>{c.name}</Text>
                      <Text style={styles.childChipClass}>{c.className}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Animated.View>
        )}

        {dashboardData ? (
          <>
            {/* Status Grid */}
            <Animated.View entering={FadeInDown.delay(300)} style={styles.statusWidgets}>
              {stats.map((stat, idx) => (
                <View key={idx} style={[styles.statusWidget, { backgroundColor: stat.bg }]}>
                  <View style={[styles.statIconBox, { backgroundColor: stat.color + '15' }]}>
                    <Ionicons name={stat.icon} size={20} color={stat.color} />
                  </View>
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <Text style={[styles.statusValue, { color: stat.color }]}>{stat.value}</Text>
                    <Text style={styles.statusLabel}>{stat.label}</Text>
                  </View>
                </View>
              ))}
            </Animated.View>

            {/* Attendance Progress Card */}
            <Animated.View entering={FadeInUp.delay(400)} style={{ marginBottom: 24 }}>
              <LinearGradient
                colors={[COLORS.primary, '#6366f1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.attendanceScoreCard}
              >
                <View style={styles.attendanceScoreHeader}>
                  <View>
                    <Text style={styles.attendanceScoreTitle}>Attendance Progress</Text>
                    <Text style={styles.attendanceScoreValue}>Your child&apos;s dedication consistency.</Text>
                  </View>
                  <View style={styles.attendanceScoreLabelBox}>
                    <Text style={styles.attendanceScoreLabel}>
                      {dashboardData.stats.attendancePercentage >= 90 ? "Excellent" : dashboardData.stats.attendancePercentage >= 75 ? "Good" : "Needs Review"}
                    </Text>
                  </View>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${dashboardData.stats.attendancePercentage}%` }]} />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                  <Text style={styles.attendanceFooterText}>Poor</Text>
                  <Text style={[styles.attendanceFooterText, { color: '#FFF' }]}>{dashboardData.stats.attendancePercentage}% Excellence</Text>
                </View>
              </LinearGradient>
            </Animated.View>

            {/* Quick Links */}
            <Animated.View entering={FadeInUp.delay(500)}>
              <Text style={styles.sectionTitle}>Quick Links</Text>
              <View style={styles.quickLinksGrid}>
                {[
                  { title: "Homework", icon: "document-text-outline", route: "/pages/parent-homework", color: "#F59E0B" },
                  { title: "Exams", icon: "ribbon-outline", route: "/pages/parent-exams", color: "#EC4899" },
                  { title: "Fees", icon: "card-outline", route: "/pages/parent-fees", color: "#8B5CF6" },
                  { title: "Progress", icon: "trending-up-outline", route: "/pages/parent-analytics", color: "#6366F1" },
                  { title: "Notices", icon: "megaphone-outline", route: "/pages/notices", color: "#06B6D4" },
                  { title: "Leave", icon: "calendar-clear-outline", route: "/pages/parent-leave", color: "#3B82F6" },
                  { title: "Bus Track", icon: "bus-outline", route: "/pages/live-tracking", color: "#22C55E" },
                  { title: "Support", icon: "help-buoy-outline", route: "/pages/tickets", color: "#EF4444" },
                ].map((item, idx) => (
                  <Pressable
                    key={idx}
                    style={({ pressed }) => [styles.quickLinkBtn, pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }]}
                    onPress={() => router.push(item.route as any)}
                  >
                    <View style={[styles.quickLinkIcon, { backgroundColor: item.color + "15" }]}>
                      <Ionicons name={item.icon as any} size={24} color={item.color} />
                    </View>
                    <Text style={styles.quickLinkText}>{item.title}</Text>
                  </Pressable>
                ))}
              </View>
            </Animated.View>

            {/* Notices */}
            <Animated.View entering={FadeInUp.delay(600)}>
              <Text style={styles.sectionTitle}>School Updates</Text>
              {dashboardData.notices && dashboardData.notices.length > 0 ? (
                dashboardData.notices.map((notice, idx) => (
                  <Animated.View key={notice.id || idx} entering={FadeInUp.delay(650 + idx * 50)} style={styles.noticeCard}>
                    <View style={[styles.noticeIcon, { backgroundColor: COLORS.primary + "15" }]}>
                      <Ionicons name="megaphone" size={20} color={COLORS.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.noticeTitle} numberOfLines={1}>{notice.title}</Text>
                      <Text style={styles.noticeDate}>{notice.publishDate ? format(new Date(notice.publishDate), "MMM d, yyyy") : format(new Date(notice.createdAt), "MMM d, yyyy")}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={COLORS.border} />
                  </Animated.View>
                ))
              ) : (
                <View style={styles.emptyCard}>
                  <Ionicons name="notifications-off-outline" size={32} color={COLORS.border} />
                  <Text style={styles.emptyText}>No recent updates.</Text>
                </View>
              )}
            </Animated.View>

            {/* Recent Homework */}
            <Animated.View entering={FadeInUp.delay(700)}>
              <Text style={styles.sectionTitle}>Recent Homework</Text>
              {dashboardData.recentHomework && dashboardData.recentHomework.length > 0 ? (
                dashboardData.recentHomework.map((hw, idx) => (
                  <Animated.View key={hw.id || idx} entering={FadeInUp.delay(750 + idx * 50)} style={styles.hwCard}>
                    <View style={[styles.hwStatus, hw.status === "Submitted" ? { backgroundColor: COLORS.success } : { backgroundColor: COLORS.warning }]}>
                      <Ionicons name={hw.status === "Submitted" ? "checkmark" : "time"} size={14} color="#fff" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.hwTitle}>{hw.title}</Text>
                      <Text style={styles.hwSubject}>{hw.subject}</Text>
                    </View>
                    <View style={[styles.hwBadge, hw.status === "Submitted" ? { backgroundColor: COLORS.success + "15" } : { backgroundColor: COLORS.warning + "15" }]}>
                      <Text style={[styles.hwBadgeText, hw.status === "Submitted" ? { color: COLORS.success } : { color: COLORS.warning }]}>
                        {hw.status}
                      </Text>
                    </View>
                  </Animated.View>
                ))
              ) : (
                <View style={styles.emptyCard}>
                  <Ionicons name="document-text-outline" size={32} color={COLORS.border} />
                  <Text style={styles.emptyText}>No recent homework.</Text>
                </View>
              )}
            </Animated.View>
          </>
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons name="alert-circle-outline" size={48} color={COLORS.border} />
            <Text style={styles.emptyText}>Could not load child data.</Text>
          </View>
        )}
      </ScrollView>

      <ParentBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 },
  greeting: { fontSize: 24, fontFamily: "Inter_800ExtraBold", color: COLORS.textPrimary, letterSpacing: -0.5 },
  subGreeting: { fontSize: 13, fontFamily: "Inter_500Medium", color: COLORS.textSecondary, marginTop: 2, textTransform: "uppercase", letterSpacing: 1 },
  notifBtn: { width: 48, height: 48, borderRadius: 16, backgroundColor: COLORS.surface, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: COLORS.border, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  notifDot: { position: "absolute", top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.error, borderWidth: 2, borderColor: COLORS.surface },

  sectionLabel: { fontSize: 11, fontFamily: "Inter_700Bold", color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 },
  childSelector: { marginHorizontal: -4, marginBottom: 24 },
  childChip: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: COLORS.surface, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12, marginHorizontal: 4, borderWidth: 1, borderColor: COLORS.border, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
  childChipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight, shadowOpacity: 0.1, shadowColor: COLORS.primary },
  childAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  childAvatarImage: { width: "100%", height: "100%", resizeMode: "cover" },
  childAvatarText: { fontSize: 16, fontFamily: "Inter_800ExtraBold", color: COLORS.primary },
  childChipName: { fontSize: 15, fontFamily: "Inter_700Bold", color: COLORS.textPrimary },
  childChipNameActive: { color: COLORS.primary },
  childChipClass: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: COLORS.textMuted, marginTop: 2 },

  statusWidgets: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  statusWidget: { width: "48%", flexGrow: 1, flexBasis: "46%", borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: "center", gap: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  statIconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statusValue: { fontSize: 20, fontFamily: "Inter_800ExtraBold" },
  statusLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: COLORS.textSecondary, marginTop: 2 },

  attendanceScoreCard: { borderRadius: 24, padding: 24, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  attendanceScoreHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  attendanceScoreTitle: { fontSize: 18, fontFamily: "Inter_800ExtraBold", color: "#FFF" },
  attendanceScoreValue: { fontSize: 12, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.8)", marginTop: 4 },
  attendanceScoreLabelBox: { backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  attendanceScoreLabel: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#FFF" },
  progressBarBg: { height: 8, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 4, overflow: "hidden" },
  progressBarFill: { height: "100%", backgroundColor: "#FFF", borderRadius: 4 },
  attendanceFooterText: { fontSize: 10, fontFamily: "Inter_700Bold", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 0.5 },

  sectionTitle: { fontSize: 18, fontFamily: "Inter_800ExtraBold", color: COLORS.textPrimary, marginBottom: 16, letterSpacing: -0.5 },

  quickLinksGrid: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    justifyContent: "flex-start",
    marginHorizontal: -6,
    marginBottom: 28 
  },
  quickLinkBtn: { 
    width: (width - 48) / 3, 
    paddingHorizontal: 6,
    backgroundColor: COLORS.surface, 
    borderRadius: 20, 
    paddingVertical: 18, 
    alignItems: "center", 
    gap: 10, 
    marginBottom: 12,
  },
  quickLinkIcon: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  quickLinkText: { fontSize: 11, fontFamily: "Inter_700Bold", color: COLORS.textPrimary, textAlign: "center" },

  noticeCard: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: COLORS.surface, borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 6, elevation: 1 },
  noticeIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  noticeTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: COLORS.textPrimary },
  noticeDate: { fontSize: 12, fontFamily: "Inter_500Medium", color: COLORS.textMuted, marginTop: 4 },

  hwCard: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: COLORS.surface, borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 6, elevation: 1 },
  hwStatus: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  hwTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: COLORS.textPrimary },
  hwSubject: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: COLORS.textMuted, marginTop: 4, textTransform: "uppercase", letterSpacing: 0.5 },
  hwBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  hwBadgeText: { fontSize: 11, fontFamily: "Inter_800ExtraBold" },

  emptyCard: { padding: 32, backgroundColor: COLORS.surface, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 20, borderWidth: 1, borderColor: COLORS.border, borderStyle: "dashed" },
  emptyText: { marginTop: 12, fontSize: 14, fontFamily: "Inter_500Medium", color: COLORS.textMuted, textAlign: "center" },
});
