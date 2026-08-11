import { useState, useCallback, useEffect } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Modal,
  ActivityIndicator, RefreshControl, ScrollView, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { PageHeader } from "@/components/PageHeader";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";

type Filter = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

interface RegistrationRequest {
  id: string;
  status: string;
  submittedAt: string;
  formData?: {
    studentName?: string;
    className?: string;
    parentName?: string;
    phone?: string;
    email?: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
  };
  academicYear?: { year: string };
  registrationLink?: { token: string };
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: COLORS.warning,
  APPROVED: COLORS.success,
  REJECTED: COLORS.error,
  UNDER_REVIEW: COLORS.primary,
};
const FILTERS: Filter[] = ["ALL", "PENDING", "APPROVED", "REJECTED"];

export default function AdminRegistrationsPage() {
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [selected, setSelected] = useState<RegistrationRequest | null>(null);
  const [processing, setProcessing] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: "1", limit: "50" });
      if (filter !== "ALL") params.set("status", filter);
      const res = await api.get<any>(`/api/v1/admin/core/registration/requests?${params}`);
      const data = (res as any)?.requests ?? (res as any)?.data ?? (Array.isArray(res) ? res : []);
      setRequests(data);
    } catch (err) { console.error("Registrations fetch failed:", err); }
    finally { setLoading(false); setRefreshing(false); }
  }, [filter]);

  useEffect(() => { setLoading(true); fetchRequests(); }, [filter]);
  const onRefresh = useCallback(() => { setRefreshing(true); fetchRequests(); }, [fetchRequests]);

  const handleApprove = async (id: string) => {
    setProcessing(true);
    try {
      await api.post(`/api/v1/admin/core/registration/requests/${id}/approve`, {});
      setSelected(null);
      fetchRequests();
      Alert.alert("Approved", "Student registration has been approved.");
    } catch { Alert.alert("Error", "Failed to approve registration."); }
    finally { setProcessing(false); }
  };

  const handleReject = async (id: string) => {
    Alert.alert("Reject Registration", "Are you sure you want to reject this application?", [
      { text: "Cancel", style: "cancel" },
      { text: "Reject", style: "destructive", onPress: async () => {
        setProcessing(true);
        try {
          await api.post(`/api/v1/admin/core/registration/requests/${id}/reject`, {});
          setSelected(null);
          fetchRequests();
        } catch { Alert.alert("Error", "Failed to reject registration."); }
        finally { setProcessing(false); }
      }},
    ]);
  };

  const renderItem = ({ item, index }: { item: RegistrationRequest; index: number }) => {
    const statusColor = STATUS_COLORS[item.status] ?? COLORS.textMuted;
    const name = item.formData?.studentName ?? "Unknown Student";
    return (
      <Animated.View entering={FadeInDown.delay(index * 40).springify()}>
        <TouchableOpacity style={styles.card} onPress={() => setSelected(item)} activeOpacity={0.85}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.name}>{name}</Text>
            {item.formData?.className ? <Text style={styles.sub}>Class: {item.formData.className}</Text> : null}
            {item.formData?.parentName ? <Text style={styles.sub}>Parent: {item.formData.parentName}</Text> : null}
            {item.academicYear ? <Text style={styles.sub}>AY: {item.academicYear.year}</Text> : null}
            <Text style={styles.date}>{new Date(item.submittedAt).toLocaleDateString("en-IN")}</Text>
          </View>
          <View style={{ alignItems: "flex-end", gap: 6 }}>
            <View style={[styles.badge, { backgroundColor: statusColor + "20" }]}>
              <Text style={[styles.badgeText, { color: statusColor }]}>{item.status}</Text>
            </View>
            {item.status === "PENDING" && (
              <View style={styles.actionRow}>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.success + "20" }]} onPress={() => handleApprove(item.id)}>
                  <Ionicons name="checkmark" size={14} color={COLORS.success} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.error + "20" }]} onPress={() => handleReject(item.id)}>
                  <Ionicons name="close" size={14} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;

  return (
    <View style={styles.container}>
      <PageHeader title="Registrations" subtitle={pendingCount > 0 ? `${pendingCount} pending review` : "Admission requests"} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {FILTERS.map((f) => (
          <TouchableOpacity key={f} style={[styles.filterPill, filter === f && styles.filterPillActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
            {f === "PENDING" && pendingCount > 0 && filter !== f && (
              <View style={styles.filterDot} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="clipboard-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No registration requests</Text>
            </View>
          }
        />
      )}

      <Modal visible={!!selected} animationType="slide" presentationStyle="pageSheet">
        {selected && (
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Application Details</Text>
              <TouchableOpacity onPress={() => setSelected(null)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {selected.formData && Object.entries(selected.formData).map(([key, value]) => (
                value ? (
                  <View key={key} style={styles.detailRow}>
                    <Text style={styles.detailKey}>{key.replace(/([A-Z])/g, " $1").trim()}</Text>
                    <Text style={styles.detailValue}>{String(value)}</Text>
                  </View>
                ) : null
              ))}
              {selected.academicYear && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey}>Academic Year</Text>
                  <Text style={styles.detailValue}>{selected.academicYear.year}</Text>
                </View>
              )}
            </ScrollView>
            {selected.status === "PENDING" && (
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: COLORS.error }]}
                  onPress={() => handleReject(selected.id)}
                  disabled={processing}
                >
                  {processing ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.modalBtnText}>Reject</Text>}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: COLORS.success }]}
                  onPress={() => handleApprove(selected.id)}
                  disabled={processing}
                >
                  {processing ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.modalBtnText}>Approve & Enroll</Text>}
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 40, gap: 12 },
  filterScroll: { maxHeight: 48, marginBottom: 8 },
  filterPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, position: "relative" },
  filterPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { fontSize: 12, fontFamily: "Inter_500Medium", color: COLORS.textSecondary },
  filterTextActive: { color: "#fff", fontFamily: "Inter_600SemiBold" },
  filterDot: { position: "absolute", top: 4, right: 4, width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.error },
  card: { flexDirection: "row", alignItems: "flex-start", backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primaryLight, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 18, fontFamily: "Inter_700Bold", color: COLORS.primary },
  name: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: COLORS.textPrimary },
  sub: { fontSize: 11, fontFamily: "Inter_400Regular", color: COLORS.textMuted, marginTop: 2 },
  date: { fontSize: 10, fontFamily: "Inter_400Regular", color: COLORS.textMuted, marginTop: 3 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  actionRow: { flexDirection: "row", gap: 6 },
  actionBtn: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium", color: COLORS.textMuted },
  modal: { flex: 1, backgroundColor: COLORS.surface, padding: 24, paddingTop: 32 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: COLORS.textPrimary },
  detailRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  detailKey: { fontSize: 11, fontFamily: "Inter_500Medium", color: COLORS.textMuted, textTransform: "capitalize", marginBottom: 3 },
  detailValue: { fontSize: 14, fontFamily: "Inter_500Medium", color: COLORS.textPrimary },
  modalActions: { flexDirection: "row", gap: 12, paddingTop: 16 },
  modalBtn: { flex: 1, borderRadius: 14, padding: 15, alignItems: "center" },
  modalBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
});
