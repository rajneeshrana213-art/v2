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
  Alert,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { PageHeader } from "@/components/PageHeader";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";
import { Homework, HomeworkResponse } from "@/lib/types/student";
import { BottomNav } from "@/components/BottomNav";
import { ParentBottomNav } from "@/components/ParentBottomNav";
import { TeacherBottomNav } from "@/components/TeacherBottomNav";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useAuth } from "@/lib/auth-context";
import Animated, { FadeInUp, FadeInDown, Layout } from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

type SubmissionStatus = "pending" | "submitted" | "late" | "reviewed";

const STATUS_CONFIG: Record<SubmissionStatus, { label: string; color: string; bg: string; icon: keyof typeof Ionicons.glyphMap }> = {
  pending: { label: "Pending", color: "#F59E0B", bg: "#FEF3C7", icon: "time-outline" },
  submitted: { label: "Submitted", color: COLORS.primary, bg: COLORS.primary + "15", icon: "checkmark-circle-outline" },
  late: { label: "Late", color: "#EF4444", bg: "#FEE2E2", icon: "alert-circle-outline" },
  reviewed: { label: "Reviewed", color: "#10B981", bg: "#DCFCE7", icon: "checkmark-done-outline" },
};

const SUBJECT_THEMES: Record<string, { primary: string; secondary: string }> = {
  Mathematics: { primary: "#3B82F6", secondary: "#DBEAFE" },
  Physics: { primary: "#8B5CF6", secondary: "#EDE9FE" },
  English: { primary: "#10B981", secondary: "#D1FAE5" },
  Chemistry: { primary: "#F59E0B", secondary: "#FEF3C7" },
  Hindi: { primary: "#EC4899", secondary: "#FCE7F3" },
  "Computer Science": { primary: "#06B6D4", secondary: "#CFFAFE" },
  Default: { primary: COLORS.primary, secondary: COLORS.primary + "15" },
};

function HomeworkPage() {
  const insets = useSafeAreaInsets();
  const { user, activeStudentId } = useAuth();
  const [activeTab, setActiveTab] = useState<"pending" | "completed">("pending");
  const [homework, setHomework] = useState<Homework[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedItem, setSelectedItem] = useState<Homework | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchHomework = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setIsLoading(true);

    try {
      if (user?.role === "parent") {
        if (!activeStudentId) return;
        const response = await api.get<HomeworkResponse>(`/api/v1/dashboard/parent/homework?studentId=${activeStudentId}`);
        setHomework((response as any) || []);
      } else if (user?.role === "teacher") {
        const response = await api.get<HomeworkResponse>("/api/v1/dashboard/teacher/homework");
        setHomework((response as any).homework || (response as any) || []);
      } else {
        const response = await api.get<HomeworkResponse>("api/v1/dashboard/student/homework");
        setHomework((response as any).homework || []);
      }
    } catch (error) {
      console.error("Error fetching homework:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHomework();
  }, [fetchHomework, activeStudentId]);

  const onRefresh = useCallback(() => fetchHomework(true), [fetchHomework]);

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "*/*", copyToCacheDirectory: true });
      if (!result.canceled) setSelectedFile(result);
    } catch (err) {
      Alert.alert("Error", "Failed to pick document");
    }
  };

  const handleSubmit = async () => {
    if (!selectedItem || !selectedFile || selectedFile.canceled) return;
    setIsSubmitting(true);
    try {
      const fileAsset = selectedFile.assets[0];
      const response = await fetch(fileAsset.uri);
      const blob = await response.blob();
      const fileData = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      await api.post("api/v1/dashboard/student/homework/submit", {
        itemId: selectedItem.id,
        type: selectedItem.type,
        file: fileData,
        fileName: fileAsset.name
      });

      Alert.alert("Success", "Homework submitted successfully");
      setModalVisible(false);
      setSelectedFile(null);
      fetchHomework();
    } catch (err: any) {
      Alert.alert("Error", "Failed to submit homework");
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingItems = homework.filter((h) => h.status === "Not Submitted");
  const completedItems = homework.filter((h) => h.status === "Submitted");
  const progressPercent = homework.length > 0 ? (completedItems.length / homework.length) * 100 : 0;
  const displayItems = activeTab === "pending" ? pendingItems : completedItems;

  return (
    <View style={styles.container}>
      <PageHeader title="Homework" subtitle={`${pendingItems.length} Assignments Due`} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        <Animated.View entering={FadeInDown.duration(600)} style={styles.heroSection}>
          <LinearGradient colors={[COLORS.primary, "#4F46E5"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View>
                <Text style={styles.progressTitle}>Overall Progress</Text>
                <Text style={styles.progressSubtitle}>{completedItems.length} of {homework.length} Completed</Text>
              </View>
              <View style={styles.progressPercentBadge}>
                <Text style={styles.progressPercentText}>{Math.round(progressPercent)}%</Text>
              </View>
            </View>
            <View style={styles.progressBarBg}>
              <Animated.View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
            </View>
          </LinearGradient>
        </Animated.View>

        <View style={styles.tabContainer}>
          <BlurView intensity={80} style={styles.tabBlur}>
            <Pressable onPress={() => setActiveTab("pending")} style={[styles.tab, activeTab === "pending" && styles.tabActive]}>
              <Text style={[styles.tabText, activeTab === "pending" && styles.tabTextActive]}>Pending</Text>
              {pendingItems.length > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{pendingItems.length}</Text></View>}
            </Pressable>
            <Pressable onPress={() => setActiveTab("completed")} style={[styles.tab, activeTab === "completed" && styles.tabActive]}>
              <Text style={[styles.tabText, activeTab === "completed" && styles.tabTextActive]}>Completed</Text>
            </Pressable>
          </BlurView>
        </View>

        <View style={styles.listContainer}>
          {isLoading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
          ) : displayItems.length > 0 ? (
            displayItems.map((item, index) => {
              const theme = SUBJECT_THEMES[item.subject] || SUBJECT_THEMES.Default;
              const status: SubmissionStatus = item.status === "Submitted" ? "submitted" : "pending";
              const statusCfg = STATUS_CONFIG[status];

              return (
                <Animated.View key={item.id} entering={FadeInUp.delay(index * 100)} layout={Layout.springify()} style={styles.cardWrapper}>
                  <Pressable style={styles.hwCard} onPress={() => { setSelectedItem(item); setModalVisible(true); }}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.secondary }]}>
                      <Ionicons name="document-text" size={24} color={theme.primary} />
                    </View>
                    <View style={styles.cardContent}>
                      <View style={styles.cardHeader}>
                        <Text style={[styles.subjectText, { color: theme.primary }]}>{item.subject}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                          <Text style={[styles.statusLabel, { color: statusCfg.color }]}>{statusCfg.label}</Text>
                        </View>
                      </View>
                      <Text style={styles.hwTitle} numberOfLines={1}>{item.title}</Text>
                      <View style={styles.cardFooter}>
                        <View style={styles.footerItem}>
                          <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} />
                          <Text style={styles.footerText}>{new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
                        </View>
                        <View style={styles.footerItem}>
                          <Ionicons name="layers-outline" size={14} color={COLORS.textMuted} />
                          <Text style={styles.footerText}>{item.type}</Text>
                        </View>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={COLORS.border} />
                  </Pressable>
                </Animated.View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle-outline" size={64} color={COLORS.border} />
              <Text style={styles.emptyText}>All assignments completed!</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {user?.role === "parent" ? <ParentBottomNav /> : user?.role === "teacher" ? <TeacherBottomNav /> : <BottomNav />}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderClose}>
              <View style={styles.modalIndicator} />
              <Pressable onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </Pressable>
            </View>

            {selectedItem && (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <Text style={styles.modalSubject}>{selectedItem.subject}</Text>
                <Text style={styles.modalTitle}>{selectedItem.title}</Text>

                <View style={styles.modalMetaRow}>
                  <View style={styles.modalMetaBox}>
                    <Text style={styles.modalMetaLabel}>Due Date</Text>
                    <Text style={styles.modalMetaValue}>{new Date(selectedItem.dueDate).toLocaleDateString()}</Text>
                  </View>
                  <View style={styles.modalMetaBox}>
                    <Text style={styles.modalMetaLabel}>Type</Text>
                    <Text style={styles.modalMetaValue}>{selectedItem.type}</Text>
                  </View>
                </View>

                <Text style={styles.descLabel}>Instructions</Text>
                <Text style={styles.descValue}>{selectedItem.description}</Text>

                <View style={styles.submissionContainer}>
                  <Text style={styles.submitLabel}>Submit Work</Text>

                  {user?.role === "parent" ? (
                    <Text style={{ fontSize: 14, color: COLORS.textMuted, fontFamily: "Inter_500Medium" }}>
                      Submissions can only be made from the student account.
                    </Text>
                  ) : (
                    <>
                      <Pressable style={[styles.fileBox, !!selectedFile && styles.fileBoxActive]} onPress={handlePickFile}>
                        <Ionicons name={selectedFile ? "document-attach" : "cloud-upload-outline"} size={32} color={selectedFile ? COLORS.primary : COLORS.textMuted} />
                        <Text style={styles.fileText}>{selectedFile?.assets?.[0]?.name || "Upload PDF or Image"}</Text>
                      </Pressable>

                      <Pressable
                        style={[styles.mainSubmitBtn, (!selectedFile || isSubmitting) && styles.submitBtnDisabled]}
                        disabled={!selectedFile || isSubmitting}
                        onPress={handleSubmit}
                      >
                        {isSubmitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>Hand In Assignment</Text>}
                      </Pressable>
                    </>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  heroSection: { padding: 16 },
  progressCard: { borderRadius: 24, padding: 24, elevation: 8, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  progressTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#FFFFFF", marginBottom: 4 },
  progressSubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)" },
  progressPercentBadge: { backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  progressPercentText: { fontSize: 16, fontFamily: "Inter_800ExtraBold", color: "#FFFFFF" },
  progressBarBg: { height: 8, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 4, overflow: "hidden" },
  progressBarFill: { height: "100%", backgroundColor: "#FFFFFF", borderRadius: 4 },

  tabContainer: { paddingHorizontal: 16, marginBottom: 20 },
  tabBlur: { flexDirection: "row", borderRadius: 16, padding: 4, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.5)", borderWidth: 1, borderColor: COLORS.border },
  tab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10, borderRadius: 12, gap: 8 },
  tabActive: { backgroundColor: "#FFFFFF", elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  tabText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: COLORS.textMuted },
  tabTextActive: { color: COLORS.textPrimary },
  badge: { backgroundColor: "#EF4444", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 10, fontFamily: "Inter_800ExtraBold", color: "#FFFFFF" },

  listContainer: { paddingHorizontal: 16 },
  cardWrapper: { marginBottom: 12 },
  hwCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 20, padding: 12, borderWidth: 1, borderColor: COLORS.border },
  iconContainer: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  cardContent: { flex: 1, marginLeft: 12 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  subjectText: { fontSize: 11, fontFamily: "Inter_700Bold", textTransform: "uppercase", letterSpacing: 0.5 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusLabel: { fontSize: 10, fontFamily: "Inter_700Bold" },
  hwTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: COLORS.textPrimary, marginBottom: 6 },
  cardFooter: { flexDirection: "row", gap: 12 },
  footerItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  footerText: { fontSize: 12, fontFamily: "Inter_500Medium", color: COLORS.textMuted },

  emptyState: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: COLORS.textMuted },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 32, borderTopRightRadius: 32, height: height * 0.85 },
  modalHeaderClose: { alignItems: "center", padding: 12 },
  modalIndicator: { width: 40, height: 5, backgroundColor: COLORS.border, borderRadius: 3, marginBottom: 12 },
  closeBtn: { position: "absolute", right: 20, top: 20, padding: 4 },
  modalBody: { padding: 24 },
  modalSubject: { fontSize: 12, fontFamily: "Inter_700Bold", color: COLORS.primary, textTransform: "uppercase", marginBottom: 8 },
  modalTitle: { fontSize: 24, fontFamily: "Inter_800ExtraBold", color: COLORS.textPrimary, marginBottom: 24 },
  modalMetaRow: { flexDirection: "row", gap: 16, marginBottom: 32 },
  modalMetaBox: { flex: 1, backgroundColor: COLORS.background, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border },
  modalMetaLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: COLORS.textMuted, textTransform: "uppercase", marginBottom: 4 },
  modalMetaValue: { fontSize: 14, fontFamily: "Inter_700Bold", color: COLORS.textPrimary },
  descLabel: { fontSize: 14, fontFamily: "Inter_700Bold", color: COLORS.textPrimary, marginBottom: 8 },
  descValue: { fontSize: 15, fontFamily: "Inter_400Regular", color: COLORS.textSecondary, lineHeight: 24, marginBottom: 32 },

  submissionContainer: { backgroundColor: COLORS.background, padding: 20, borderRadius: 24, borderWidth: 1, borderColor: COLORS.border },
  submitLabel: { fontSize: 16, fontFamily: "Inter_700Bold", color: COLORS.textPrimary, marginBottom: 16 },
  fileBox: { height: 120, borderRadius: 20, borderStyle: "dashed", borderWidth: 2, borderColor: COLORS.border, alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20 },
  fileBoxActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + "05" },
  fileText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: COLORS.textMuted },
  mainSubmitBtn: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 16, alignItems: "center", elevation: 4 },
  submitBtnDisabled: { backgroundColor: COLORS.border },
  submitBtnText: { color: "#FFFFFF", fontSize: 16, fontFamily: "Inter_700Bold" },
});

export default HomeworkPage;
