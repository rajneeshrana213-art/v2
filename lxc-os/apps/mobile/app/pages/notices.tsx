import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  Dimensions,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Animated, { FadeInDown, FadeInUp, FadeInRight, Layout } from "react-native-reanimated";
import { PageHeader } from "@/components/PageHeader";
import { BottomNav } from "@/components/BottomNav";
import { ParentBottomNav } from "@/components/ParentBottomNav";
import { TeacherBottomNav } from "@/components/TeacherBottomNav";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";
import { Notice } from "@/lib/types/student";
import { useAuth } from "@/lib/auth-context";

type NoticeCategory = "all" | "event" | "academic" | "meeting" | "admin" | "holiday";

const CATEGORY_CONFIG: Record<string, { label: string; color: string; bg: string; icon: keyof typeof Ionicons.glyphMap }> = {
  event: { label: "Event", color: "#8B5CF6", bg: "#F3E8FF", icon: "trophy-outline" },
  academic: { label: "Academic", color: "#3B82F6", bg: "#EFF6FF", icon: "school-outline" },
  meeting: { label: "Meeting", color: "#F59E0B", bg: "#FEF3C7", icon: "people-outline" },
  admin: { label: "Admin", color: "#6B7280", bg: "#F3F4F6", icon: "settings-outline" },
  holiday: { label: "Holiday", color: "#22C55E", bg: "#DCFCE7", icon: "sunny-outline" },
  Default: { label: "General", color: COLORS.primary, bg: COLORS.primaryLight, icon: "megaphone-outline" },
};

const FILTER_OPTIONS: { key: NoticeCategory; label: string }[] = [
  { key: "all", label: "All" },
  { key: "event", label: "Events" },
  { key: "academic", label: "Academic" },
  { key: "meeting", label: "Meetings" },
  { key: "admin", label: "Admin" },
  { key: "holiday", label: "Holidays" },
];

function NoticesPage() {
  const insets = useSafeAreaInsets();
  const { user, activeStudentId } = useAuth();
  const [activeFilter, setActiveFilter] = useState<NoticeCategory>("all");
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const fetchNotices = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setIsLoading(true);

    try {
      let response;
      if (user?.role === "parent") {
        if (!activeStudentId) return;
        response = await api.get<Notice[]>(`/api/v1/dashboard/parent/notices?studentId=${activeStudentId}`);
      } else if (user?.role === "teacher") {
        response = await api.get<Notice[]>("/api/v1/dashboard/teacher/notices");
      } else {
        response = await api.get<Notice[]>("/api/v1/dashboard/student/notices");
      }
      setNotices(response as any || []);
    } catch (error) {
      console.error("Error fetching notices:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices, activeStudentId]);

  const onRefresh = useCallback(() => {
    fetchNotices(true);
  }, [fetchNotices]);

  const filteredNotices = activeFilter === "all"
    ? notices
    : notices.filter((n) => n.category?.toLowerCase() === activeFilter);

  const handleNoticeClick = async (notice: Notice) => {
    setSelectedNotice(notice);
    setIsModalVisible(true);

    if (!notice.isRead) {
      try {
        let readEndpoint = `/api/v1/dashboard/student/notices/${notice.id}/read`;
        if (user?.role === "parent") {
          readEndpoint = `/api/v1/dashboard/parent/notices/${notice.id}/read?studentId=${activeStudentId}`;
        } else if (user?.role === "teacher") {
          readEndpoint = `/api/v1/dashboard/teacher/notices/${notice.id}/read`;
        }
        await api.patch(readEndpoint, {});
        setNotices(prev => prev.map(n => n.id === notice.id ? { ...n, isRead: true } : n));
      } catch (error) {
        console.error("Error marking notice as read:", error);
      }
    }
  };

  const unreadCount = notices.filter(n => !n.isRead).length;

  return (
    <View style={styles.container}>
      <PageHeader title="Notices" subtitle="Stay Updated" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* Modern Hero Section */}
        <Animated.View entering={FadeInUp.duration(600)} style={styles.heroContainer}>
          <LinearGradient
            colors={[COLORS.primary, "#6366F1"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <View style={styles.heroContent}>
              <View>
                <Text style={styles.heroTitle}>Important Updates</Text>
                <Text style={styles.heroSubtitle}>
                  {unreadCount > 0 ? `You have ${unreadCount} unread notices` : "All caught up!"}
                </Text>
              </View>
              <View style={styles.heroIconContainer}>
                <Ionicons name="megaphone" size={32} color="#FFFFFF" />
                {unreadCount > 0 && <View style={styles.heroBadge} />}
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Glassmorphic Filters */}
        <View style={styles.filterWrapper}>
          <BlurView intensity={20} tint="light" style={styles.filterContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersScrollContent}
            >
              {FILTER_OPTIONS.map((filter, index) => {
                const isActive = activeFilter === filter.key;
                return (
                  <Animated.View key={filter.key} entering={FadeInRight.delay(index * 100)}>
                    <TouchableOpacity
                      onPress={() => setActiveFilter(filter.key)}
                      style={[styles.filterChip, isActive && styles.filterChipActive]}
                    >
                      <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                        {filter.label}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </ScrollView>
          </BlurView>
        </View>

        <View style={styles.listSection}>
          {isLoading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Fetching notices...</Text>
            </View>
          ) : filteredNotices.length > 0 ? (
            filteredNotices.map((notice, index) => {
              const category = notice.category?.toLowerCase() || "Default";
              const catCfg = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.Default;
              const formattedDate = new Date(notice.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });

              return (
                <Animated.View
                  key={notice.id}
                  entering={FadeInDown.delay(index * 50 + 400)}
                  layout={Layout.springify()}
                >
                  <Pressable
                    onPress={() => handleNoticeClick(notice)}
                    style={({ pressed }) => [
                      styles.noticeCard,
                      !notice.isRead && styles.noticeCardUnread,
                      pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }
                    ]}
                  >
                    <View style={styles.noticeTop}>
                      <View style={[styles.catBadge, { backgroundColor: catCfg.bg + "40" }]}>
                        <Ionicons name={catCfg.icon} size={12} color={catCfg.color} />
                        <Text style={[styles.catBadgeText, { color: catCfg.color }]}>
                          {catCfg.label}
                        </Text>
                      </View>
                      <View style={styles.noticeRight}>
                        {!notice.isRead && notice.isRead !== undefined && <View style={styles.unreadDot} />}
                        <Text style={styles.noticeDate}>{formattedDate}</Text>
                      </View>
                    </View>
                    <Text style={styles.noticeTitle}>{notice.title}</Text>
                    <Text style={styles.noticeDesc} numberOfLines={2}>
                      {notice.description}
                    </Text>
                    <View style={styles.noticeFooter}>
                      {notice.creator && (
                        <View style={styles.authorRow}>
                          <Ionicons name="person-circle-outline" size={14} color={COLORS.textMuted} />
                          <Text style={styles.noticeAuthor}>{notice.creator.name}</Text>
                        </View>
                      )}
                      {notice.attachment && (
                        <View style={styles.attachmentBadge}>
                          <Ionicons name="attach" size={14} color={COLORS.primary} />
                          <Text style={styles.attachmentCount}>1 Attachment</Text>
                        </View>
                      )}
                      <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                    </View>
                  </Pressable>
                </Animated.View>
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBox}>
                <Ionicons name="megaphone-outline" size={32} color={COLORS.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>No notices found</Text>
              <Text style={styles.emptySubtitle}>All caught up with school updates!</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {user?.role === "parent" ? <ParentBottomNav /> : user?.role === "teacher" ? <TeacherBottomNav /> : <BottomNav />}

      {/* Notice Detail Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTop}>
                {selectedNotice && (
                  <View style={[
                    styles.catBadge,
                    { backgroundColor: (CATEGORY_CONFIG[selectedNotice.category?.toLowerCase() || "Default"] || CATEGORY_CONFIG.Default).bg }
                  ]}>
                    <Ionicons
                      name={(CATEGORY_CONFIG[selectedNotice.category?.toLowerCase() || "Default"] || CATEGORY_CONFIG.Default).icon}
                      size={12}
                      color={(CATEGORY_CONFIG[selectedNotice.category?.toLowerCase() || "Default"] || CATEGORY_CONFIG.Default).color}
                    />
                    <Text style={[
                      styles.catBadgeText,
                      { color: (CATEGORY_CONFIG[selectedNotice.category?.toLowerCase() || "Default"] || CATEGORY_CONFIG.Default).color }
                    ]}>
                      {(CATEGORY_CONFIG[selectedNotice.category?.toLowerCase() || "Default"] || CATEGORY_CONFIG.Default).label}
                    </Text>
                  </View>
                )}
                <TouchableOpacity
                  onPress={() => setIsModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.modalTitle}>{selectedNotice?.title}</Text>
              <View style={styles.modalMeta}>
                <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} />
                <Text style={styles.modalDate}>
                  {selectedNotice && new Date(selectedNotice.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                  })}
                </Text>
              </View>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalDesc}>{selectedNotice?.description}</Text>
              {selectedNotice?.attachment && (
                <View style={styles.attachmentSection}>
                  <Text style={styles.attachmentHeading}>Attachment</Text>
                  <TouchableOpacity 
                    style={styles.attachmentCard}
                    onPress={() => Linking.openURL(selectedNotice.attachment!)}
                  >
                    <View style={styles.attachmentIconBox}>
                      <Ionicons name="document-text" size={24} color={COLORS.primary} />
                    </View>
                    <View style={styles.attachmentInfo}>
                      <Text style={styles.attachmentName} numberOfLines={1}>
                        View Attachment
                      </Text>
                      <Text style={styles.attachmentSize}>Tap to open document</Text>
                    </View>
                    <Ionicons name="download-outline" size={20} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>
              )}

              {selectedNotice?.creator && (
                <View style={styles.modalFooter}>
                  <View style={styles.authorBadge}>
                    <Ionicons name="person-circle-outline" size={20} color={COLORS.primary} />
                    <Text style={styles.authorName}>Issued by {selectedNotice.creator.name}</Text>
                  </View>
                </View>
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

export default NoticesPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  heroContainer: {
    margin: 16,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  heroGradient: {
    padding: 24,
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 22,
    fontFamily: "Inter_800ExtraBold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "rgba(255, 255, 255, 0.8)",
  },
  heroIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  heroBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF4B4B',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  filterWrapper: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  filtersScrollContent: {
    gap: 8,
    paddingRight: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  filterChipText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  listSection: {
    paddingHorizontal: 16,
    gap: 12,
  },
  noticeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  noticeCardUnread: {
    borderColor: COLORS.primary + "40",
    backgroundColor: COLORS.primary + "05",
  },
  noticeTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  catBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  catBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    textTransform: 'uppercase',
  },
  noticeRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  noticeDate: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: COLORS.textMuted,
  },
  noticeTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  noticeDesc: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 14,
  },
  noticeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border + "40",
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  noticeAuthor: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: COLORS.textMuted,
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
  emptyContainer: {
    alignItems: "center",
    padding: 60,
  },
  emptyIconBox: {
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
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: COLORS.textMuted,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 32,
    width: "100%",
    maxHeight: "80%",
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  modalHeader: {
    marginBottom: 20,
  },
  modalHeaderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: "Inter_800ExtraBold",
    color: COLORS.textPrimary,
    lineHeight: 30,
    marginBottom: 12,
  },
  modalMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalDate: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: COLORS.textMuted,
  },
  modalBody: {
    marginBottom: 24,
  },
  modalDesc: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: COLORS.textSecondary,
    lineHeight: 26,
  },
  modalFooter: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border + "40",
  },
  authorBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.primary + "10",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  authorName: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: COLORS.primary,
  },
  doneButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  doneButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  attachmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary + "15",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  attachmentCount: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    color: COLORS.primary,
  },
  attachmentSection: {
    marginTop: 24,
  },
  attachmentHeading: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  attachmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  attachmentIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primary + "10",
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  attachmentInfo: {
    flex: 1,
  },
  attachmentName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  attachmentSize: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: COLORS.textMuted,
  },
});
