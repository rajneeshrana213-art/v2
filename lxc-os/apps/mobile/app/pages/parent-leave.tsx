import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PageHeader } from "@/components/PageHeader";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { format } from "date-fns";

const STATUS_CONFIG: Record<string, { color: string; bg: string }> = {
  PENDING: { color: COLORS.warning, bg: "#FEF3C7" },
  APPROVED: { color: COLORS.success, bg: "#DCFCE7" },
  REJECTED: { color: COLORS.error, bg: "#FEE2E2" },
};

export default function ParentLeaveScreen() {
  const { activeStudentId } = useAuth();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fromDate: format(new Date(), "yyyy-MM-dd"),
    toDate: format(new Date(), "yyyy-MM-dd"),
    reason: "",
    leaveType: "SICK",
  });

  const LEAVE_TYPES = ["SICK", "PERSONAL", "FAMILY", "OTHER"];

  const fetchData = useCallback(async () => {
    if (!activeStudentId) return;
    try {
      const res = await api.get(`/api/v1/dashboard/parent/leave?studentId=${activeStudentId}`);
      const arr = (res as any)?.data ?? (Array.isArray(res) ? res : []);
      setLeaves(arr);
    } catch (e) {
      console.error("Parent leave fetch error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeStudentId]);

  useEffect(() => { fetchData(); }, [fetchData]);
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const handleSubmit = async () => {
    if (!form.reason.trim()) {
      Alert.alert("Required", "Please enter a reason for leave.");
      return;
    }
    if (!activeStudentId) return;
    setSubmitting(true);
    try {
      await api.post("/api/v1/dashboard/parent/leave", { ...form, studentId: activeStudentId });
      setShowModal(false);
      setForm({ fromDate: format(new Date(), "yyyy-MM-dd"), toDate: format(new Date(), "yyyy-MM-dd"), reason: "", leaveType: "SICK" });
      fetchData();
      Alert.alert("Success", "Leave request submitted successfully.");
    } catch (e) {
      Alert.alert("Error", "Failed to submit leave request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <PageHeader title="Apply Leave" />
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      </View>
    );
  }

  const pending = leaves.filter(l => l.status === "PENDING").length;
  const approved = leaves.filter(l => l.status === "APPROVED").length;

  return (
    <View style={styles.container}>
      <PageHeader title="Apply Leave" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {!activeStudentId ? (
          <View style={styles.emptyCard}>
            <Ionicons name="person-outline" size={40} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No child selected</Text>
          </View>
        ) : (
          <>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: COLORS.warning }]}>{pending}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: COLORS.success }]}>{approved}</Text>
                <Text style={styles.statLabel}>Approved</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: COLORS.textPrimary }]}>{leaves.length}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
            </View>

            <Pressable style={styles.applyBtn} onPress={() => setShowModal(true)}>
              <Ionicons name="add-circle-outline" size={20} color="#fff" />
              <Text style={styles.applyBtnText}>Apply for Leave</Text>
            </Pressable>

            {leaves.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="calendar-outline" size={40} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>No leave requests</Text>
                <Text style={styles.emptySubtext}>Tap "Apply for Leave" to submit a request</Text>
              </View>
            ) : (
              leaves.map(leave => {
                const cfg = STATUS_CONFIG[leave.status] ?? STATUS_CONFIG.PENDING;
                return (
                  <View key={leave.id} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View style={styles.typeTag}>
                        <Text style={styles.typeText}>{leave.leaveType ?? leave.type ?? "Leave"}</Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                        <Text style={[styles.statusText, { color: cfg.color }]}>{leave.status}</Text>
                      </View>
                    </View>
                    <Text style={styles.reasonText} numberOfLines={2}>{leave.reason}</Text>
                    <View style={styles.dateRow}>
                      <Ionicons name="calendar-outline" size={13} color={COLORS.textMuted} />
                      <Text style={styles.dateText}>
                        {leave.fromDate ? format(new Date(leave.fromDate), "dd MMM") : "-"}
                        {" → "}
                        {leave.toDate ? format(new Date(leave.toDate), "dd MMM yyyy") : "-"}
                      </Text>
                    </View>
                    {leave.remark && (
                      <Text style={styles.remarkText}>Remark: {leave.remark}</Text>
                    )}
                  </View>
                );
              })
            )}
          </>
        )}
      </ScrollView>

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Apply for Leave</Text>
              <Pressable onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={22} color={COLORS.textPrimary} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>Leave Type</Text>
              <View style={styles.typeRow}>
                {LEAVE_TYPES.map(lt => (
                  <Pressable
                    key={lt}
                    style={[styles.typeChip, form.leaveType === lt && styles.typeChipActive]}
                    onPress={() => setForm(f => ({ ...f, leaveType: lt }))}
                  >
                    <Text style={[styles.typeChipText, form.leaveType === lt && styles.typeChipTextActive]}>
                      {lt}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.fieldLabel}>From Date</Text>
              <TextInput
                style={styles.input}
                value={form.fromDate}
                onChangeText={v => setForm(f => ({ ...f, fromDate: v }))}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={COLORS.textMuted}
              />
              <Text style={styles.fieldLabel}>To Date</Text>
              <TextInput
                style={styles.input}
                value={form.toDate}
                onChangeText={v => setForm(f => ({ ...f, toDate: v }))}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={COLORS.textMuted}
              />
              <Text style={styles.fieldLabel}>Reason *</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                value={form.reason}
                onChangeText={v => setForm(f => ({ ...f, reason: v }))}
                placeholder="Reason for leave..."
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={3}
              />
              <Pressable style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
                {submitting
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.submitText}>Submit Request</Text>
                }
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  statCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, alignItems: "center",
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  statValue: { fontSize: 22, fontWeight: "700" },
  statLabel: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  applyBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, backgroundColor: COLORS.primary, borderRadius: 12, padding: 14, marginBottom: 16,
  },
  applyBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 10,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  typeTag: {
    backgroundColor: COLORS.primaryLight + "22", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3,
  },
  typeText: { fontSize: 12, color: COLORS.primary, fontWeight: "600" },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  statusText: { fontSize: 12, fontWeight: "600" },
  reasonText: { fontSize: 14, color: COLORS.textPrimary, marginBottom: 8 },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  dateText: { fontSize: 13, color: COLORS.textSecondary },
  remarkText: { fontSize: 12, color: COLORS.textMuted, fontStyle: "italic", marginTop: 6 },
  emptyCard: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 32,
    alignItems: "center", marginTop: 20,
  },
  emptyText: { fontSize: 15, color: COLORS.textMuted, marginTop: 12 },
  emptySubtext: { fontSize: 13, color: COLORS.textMuted, marginTop: 4, textAlign: "center" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modal: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, maxHeight: "85%",
  },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 16, fontWeight: "700", color: COLORS.textPrimary },
  fieldLabel: { fontSize: 13, fontWeight: "600", color: COLORS.textSecondary, marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 10,
    padding: 12, fontSize: 14, color: COLORS.textPrimary, backgroundColor: COLORS.background,
  },
  textarea: { height: 80, textAlignVertical: "top" },
  typeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  typeChip: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  typeChipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + "15" },
  typeChipText: { fontSize: 13, color: COLORS.textSecondary },
  typeChipTextActive: { color: COLORS.primary, fontWeight: "600" },
  submitBtn: {
    backgroundColor: COLORS.primary, borderRadius: 12,
    padding: 14, alignItems: "center", marginTop: 20, marginBottom: 8,
  },
  submitText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
