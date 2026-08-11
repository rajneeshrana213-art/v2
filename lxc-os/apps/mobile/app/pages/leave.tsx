import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Modal,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Pressable,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { PageHeader } from "@/components/PageHeader";
import { BottomNav } from "@/components/BottomNav";
import { ParentBottomNav } from "@/components/ParentBottomNav";
import { TeacherBottomNav } from "@/components/TeacherBottomNav";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";
import { LeaveRequest } from "@/lib/types/student";
import { useAuth } from "@/lib/auth-context";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  APPROVED: { label: "Approved", color: COLORS.success, bg: "#DCFCE7" },
  PENDING: { label: "Pending", color: COLORS.warning, bg: "#FEF3C7" },
  REJECTED: { label: "Rejected", color: COLORS.error, bg: "#FEE2E2" },
};

function LeavePage() {
  const insets = useSafeAreaInsets();
  const { user, activeStudentId } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [reason, setReason] = useState("");
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLeaves = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setIsLoading(true);

    try {
      let response;
      if (user?.role === "parent") {
        if (!activeStudentId) return;
        response = await api.get<LeaveRequest[]>(`/api/v1/dashboard/parent/leave?studentId=${activeStudentId}`);
      } else if (user?.role === "teacher") {
        response = await api.get<LeaveRequest[]>("/api/v1/dashboard/teacher/leaves");
      } else {
        response = await api.get<LeaveRequest[]>("/api/v1/dashboard/student/leave");
      }
      setLeaves(response as any || []);
    } catch (error) {
      console.error("Error fetching leaves:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves, activeStudentId]);

  const onRefresh = useCallback(() => {
    fetchLeaves(true);
  }, [fetchLeaves]);

  const handleSubmit = async () => {
    if (!fromDate || !toDate || !reason) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const leaveEndpoint = user?.role === "teacher"
        ? "/api/v1/dashboard/teacher/leaves"
        : "/api/v1/dashboard/student/leave";
      await api.post(leaveEndpoint, {
        fromDate: fromDate?.toISOString(),
        toDate: toDate?.toISOString(),
        reason,
      });
      Alert.alert("Success", "Leave request submitted successfully");
      setModalVisible(false);
      resetForm();
      fetchLeaves();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setReason("");
    setFromDate(null);
    setToDate(null);
  };

  const summary = {
    approved: leaves.filter(l => l.status === "APPROVED").length,
    pending: leaves.filter(l => l.status === "PENDING").length,
    rejected: leaves.filter(l => l.status === "REJECTED").length,
  };

  return (
    <View style={styles.container}>
      <PageHeader title="Leave Requests" subtitle="Manage Leaves" />
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
        {/* Hero Section */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.heroContainer}>
          <LinearGradient
            colors={[COLORS.primary, '#6366f1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroHeader}>
              <View style={styles.heroIconContainer}>
                <Ionicons name="calendar" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.heroLabel}>Total Leaves Applied</Text>
            </View>
            <Text style={styles.heroValue}>{leaves.length}</Text>
            {user?.role !== "parent" && (
              <TouchableOpacity
                style={styles.heroActionBtn}
                onPress={() => setModalVisible(true)}
              >
                <Text style={styles.heroActionText}>Request New Leave</Text>
                <Ionicons name="add" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          </LinearGradient>
        </Animated.View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <Animated.View entering={FadeInDown.delay(200)} style={styles.statItem}>
            <BlurView intensity={20} tint="light" style={styles.glassCard}>
              <View style={[styles.statIconContainer, { backgroundColor: COLORS.success + '15' }]}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              </View>
              <Text style={styles.statLabel}>Approved</Text>
              <Text style={styles.statValue}>{summary.approved}</Text>
            </BlurView>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(300)} style={styles.statItem}>
            <BlurView intensity={20} tint="light" style={styles.glassCard}>
              <View style={[styles.statIconContainer, { backgroundColor: COLORS.warning + '15' }]}>
                <Ionicons name="time" size={20} color={COLORS.warning} />
              </View>
              <Text style={styles.statLabel}>Pending</Text>
              <Text style={styles.statValue}>{summary.pending}</Text>
            </BlurView>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(400)} style={styles.statItem}>
            <BlurView intensity={20} tint="light" style={styles.glassCard}>
              <View style={[styles.statIconContainer, { backgroundColor: COLORS.error + '15' }]}>
                <Ionicons name="close-circle" size={20} color={COLORS.error} />
              </View>
              <Text style={styles.statLabel}>Rejected</Text>
              <Text style={styles.statValue}>{summary.rejected}</Text>
            </BlurView>
          </Animated.View>
        </View>

        {/* List Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Past Requests</Text>
          {isLoading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Fetching leaves...</Text>
            </View>
          ) : leaves.length > 0 ? (
            leaves.map((leave, idx) => {
              const statusCfg = STATUS_CONFIG[leave.status] || STATUS_CONFIG.PENDING;
              const formattedFrom = format(new Date(leave.fromDate), "MMM d, yyyy");
              const formattedTo = format(new Date(leave.toDate), "MMM d, yyyy");
              const appliedDate = format(new Date(leave.createdAt), "MMM d, yyyy");

              return (
                <Animated.View
                  key={leave.id || idx}
                  entering={FadeInUp.delay(500 + idx * 100)}
                  style={styles.leaveCard}
                >
                  <View style={styles.leaveCardHeader}>
                    <View style={styles.leaveTypeInfo}>
                      <View style={[styles.indicator, { backgroundColor: statusCfg.color }]} />
                      <Text style={styles.leaveCardTitle}>Medical/Personal Leave</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                      <Text style={[styles.statusBadgeText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
                    </View>
                  </View>

                  <View style={styles.leaveCardBody}>
                    <View style={styles.dateRangeRow}>
                      <View style={styles.dateBlock}>
                        <Text style={styles.dateLabel}>From</Text>
                        <Text style={styles.dateValue}>{formattedFrom}</Text>
                      </View>
                      <View style={styles.dateSeparator}>
                        <Ionicons name="arrow-forward" size={16} color={COLORS.textMuted} />
                      </View>
                      <View style={styles.dateBlock}>
                        <Text style={styles.dateLabel}>To</Text>
                        <Text style={styles.dateValue}>{formattedTo}</Text>
                      </View>
                    </View>

                    <View style={styles.reasonBlock}>
                      <Ionicons name="document-text-outline" size={16} color={COLORS.textMuted} />
                      <Text style={styles.reasonText} numberOfLines={2}>{leave.reason}</Text>
                    </View>
                  </View>

                  <View style={styles.leaveCardFooter}>
                    <Text style={styles.appliedOnText}>Applied on {appliedDate}</Text>
                    {leave.status === "PENDING" && (
                      <TouchableOpacity style={styles.cancelBtn}>
                        <Text style={styles.cancelBtnText}>Cancel</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </Animated.View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="calendar-outline" size={32} color={COLORS.textMuted} />
              </View>
              <Text style={styles.emptyStateText}>No leave history found.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {user?.role === "parent" ? <ParentBottomNav /> : user?.role === "teacher" ? <TeacherBottomNav /> : <BottomNav />}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 16 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Apply for Leave</Text>
              <Pressable onPress={() => { setModalVisible(false); resetForm(); }}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </Pressable>
            </View>

            <Text style={styles.fieldLabel}>From Date</Text>
            <Pressable
              onPress={() => setShowFromPicker(true)}
              style={styles.datePickerButton}
            >
              <Text style={[styles.datePickerText, !fromDate && { color: COLORS.textMuted }]}>
                {fromDate ? format(fromDate, "MMM d, yyyy") : "Select Start Date"}
              </Text>
              <Ionicons name="calendar-outline" size={20} color={COLORS.textSecondary} />
            </Pressable>

            {showFromPicker && (
              <DateTimePicker
                value={fromDate || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
                minimumDate={new Date()}
                onChange={(event, selectedDate) => {
                  setShowFromPicker(false);
                  if (selectedDate) setFromDate(selectedDate);
                }}
              />
            )}

            <Text style={styles.fieldLabel}>To Date</Text>
            <Pressable
              onPress={() => setShowToPicker(true)}
              style={styles.datePickerButton}
            >
              <Text style={[styles.datePickerText, !toDate && { color: COLORS.textMuted }]}>
                {toDate ? format(toDate, "MMM d, yyyy") : "Select End Date"}
              </Text>
              <Ionicons name="calendar-outline" size={20} color={COLORS.textSecondary} />
            </Pressable>

            {showToPicker && (
              <DateTimePicker
                value={toDate || fromDate || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
                minimumDate={fromDate || new Date()}
                onChange={(event, selectedDate) => {
                  setShowToPicker(false);
                  if (selectedDate) setToDate(selectedDate);
                }}
              />
            )}

            <Text style={styles.fieldLabel}>Reason</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Enter reason for leave..."
              placeholderTextColor={COLORS.textMuted}
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={3}
            />

            <Pressable
              onPress={handleSubmit}
              style={[styles.submitButton, isSubmitting && { opacity: 0.7 }]}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Request</Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  heroContainer: {
    padding: 16,
  },
  heroCard: {
    padding: 24,
    borderRadius: 32,
    elevation: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  heroIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 0.5,
  },
  heroValue: {
    fontSize: 48,
    fontFamily: "Inter_800ExtraBold",
    color: "#FFFFFF",
    marginVertical: 12,
  },
  heroActionBtn: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  heroActionText: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: COLORS.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  glassCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: COLORS.textPrimary,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  leaveCard: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  leaveCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  leaveTypeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  indicator: {
    width: 4,
    height: 16,
    borderRadius: 2,
  },
  leaveCardTitle: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: COLORS.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: 10,
    fontFamily: "Inter_800ExtraBold",
    letterSpacing: 0.5,
  },
  leaveCardBody: {
    gap: 16,
  },
  dateRangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  dateBlock: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: COLORS.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  dateValue: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: COLORS.textPrimary,
  },
  dateSeparator: {
    opacity: 0.3,
  },
  reasonBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 16,
  },
  reasonText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  leaveCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  appliedOnText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: COLORS.textMuted,
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.error + '10',
  },
  cancelBtnText: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    color: COLORS.error,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Inter_800ExtraBold",
    color: COLORS.textPrimary,
  },
  fieldLabel: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: COLORS.textSecondary,
    marginBottom: 10,
    marginTop: 16,
  },
  datePickerButton: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  datePickerText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: COLORS.textPrimary,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
    backgroundColor: COLORS.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: COLORS.textPrimary,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 32,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  loaderContainer: {
    paddingVertical: 60,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: COLORS.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
    backgroundColor: COLORS.surface,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: COLORS.textMuted,
  },
});

export default LeavePage;
