import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PageHeader } from "@/components/PageHeader";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";

type TabKey = "heads" | "groups";

export default function AdminFeeSetupScreen() {
  const [tab, setTab] = useState<TabKey>("groups");
  const [feeHeads, setFeeHeads] = useState<any[]>([]);
  const [feeGroups, setFeeGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalType, setModalType] = useState<"head" | "group">("group");
  const [form, setForm] = useState({ name: "", description: "", frequency: "MONTHLY" });

  const FREQUENCIES = ["MONTHLY", "QUARTERLY", "ANNUALLY", "ONE_TIME"];

  const fetchAll = useCallback(async () => {
    try {
      const [headsRes, groupsRes] = await Promise.all([
        api.get("/api/v1/finance/fee-heads"),
        api.get("/api/v1/finance/fee-groups"),
      ]);
      setFeeHeads((headsRes as any)?.data ?? (Array.isArray(headsRes) ? headsRes : []));
      setFeeGroups((groupsRes as any)?.data ?? (Array.isArray(groupsRes) ? groupsRes : []));
    } catch (e) {
      console.error("Fee setup fetch error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  const onRefresh = () => { setRefreshing(true); fetchAll(); };

  const openAdd = (type: "head" | "group") => {
    setModalType(type);
    setForm({ name: "", description: "", frequency: "MONTHLY" });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      Alert.alert("Required", "Please enter a name.");
      return;
    }
    setSubmitting(true);
    try {
      if (modalType === "head") {
        await api.post("/api/v1/finance/fee-heads", { name: form.name, description: form.description });
      } else {
        await api.post("/api/v1/finance/fee-groups", { name: form.name, frequency: form.frequency });
      }
      setShowModal(false);
      fetchAll();
    } catch (e) {
      Alert.alert("Error", "Failed to save. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (type: "head" | "group", id: string) => {
    Alert.alert("Delete", "Are you sure you want to delete this?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try {
            if (type === "head") await api.delete(`/api/v1/finance/fee-heads?id=${id}`);
            fetchAll();
          } catch (e) {
            Alert.alert("Error", "Failed to delete.");
          }
        }
      }
    ]);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <PageHeader title="Fee Setup" />
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PageHeader title="Fee Setup" />
      <View style={styles.tabBar}>
        {(["groups", "heads"] as TabKey[]).map(t => (
          <Pressable key={t} style={[styles.tabBtn, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === "groups" ? "Fee Groups" : "Fee Heads"}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {tab === "groups" && (
          <>
            <Pressable style={styles.addBtn} onPress={() => openAdd("group")}>
              <Ionicons name="add-circle-outline" size={18} color="#fff" />
              <Text style={styles.addBtnText}>Add Fee Group</Text>
            </Pressable>

            {feeGroups.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="layers-outline" size={40} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>No fee groups yet</Text>
              </View>
            ) : feeGroups.map(g => (
              <View key={g.id} style={styles.card}>
                <View style={styles.cardLeft}>
                  <View style={styles.iconBox}>
                    <Ionicons name="layers-outline" size={20} color={COLORS.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{g.name}</Text>
                    <View style={styles.freqBadge}>
                      <Text style={styles.freqText}>{g.frequency ?? "N/A"}</Text>
                    </View>
                    {g.feeHeads && g.feeHeads.length > 0 && (
                      <Text style={styles.cardMeta}>{g.feeHeads.length} heads assigned</Text>
                    )}
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
              </View>
            ))}
          </>
        )}

        {tab === "heads" && (
          <>
            <Pressable style={styles.addBtn} onPress={() => openAdd("head")}>
              <Ionicons name="add-circle-outline" size={18} color="#fff" />
              <Text style={styles.addBtnText}>Add Fee Head</Text>
            </Pressable>

            {feeHeads.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="list-outline" size={40} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>No fee heads yet</Text>
              </View>
            ) : feeHeads.map(h => (
              <View key={h.id} style={styles.card}>
                <View style={styles.cardLeft}>
                  <View style={[styles.iconBox, { backgroundColor: "#EEF2FF" }]}>
                    <Ionicons name="pricetag-outline" size={20} color="#6366F1" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{h.name}</Text>
                    {h.description && <Text style={styles.cardMeta}>{h.description}</Text>}
                  </View>
                </View>
                <Pressable onPress={() => handleDelete("head", h.id)} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                </Pressable>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalType === "head" ? "New Fee Head" : "New Fee Group"}
              </Text>
              <Pressable onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={22} color={COLORS.textPrimary} />
              </Pressable>
            </View>

            <Text style={styles.fieldLabel}>Name *</Text>
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={v => setForm(f => ({ ...f, name: v }))}
              placeholder={modalType === "head" ? "e.g. Tuition Fee" : "e.g. Term 1 Fees"}
              placeholderTextColor={COLORS.textMuted}
            />

            {modalType === "head" && (
              <>
                <Text style={styles.fieldLabel}>Description</Text>
                <TextInput
                  style={[styles.input, { height: 70, textAlignVertical: "top" }]}
                  value={form.description}
                  onChangeText={v => setForm(f => ({ ...f, description: v }))}
                  placeholder="Optional description"
                  placeholderTextColor={COLORS.textMuted}
                  multiline
                />
              </>
            )}

            {modalType === "group" && (
              <>
                <Text style={styles.fieldLabel}>Frequency</Text>
                <View style={styles.freqRow}>
                  {FREQUENCIES.map(freq => (
                    <Pressable
                      key={freq}
                      style={[styles.freqChip, form.frequency === freq && styles.freqChipActive]}
                      onPress={() => setForm(f => ({ ...f, frequency: freq }))}
                    >
                      <Text style={[styles.freqChipText, form.frequency === freq && styles.freqChipTextActive]}>
                        {freq.replace("_", " ")}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}

            <Pressable style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
              {submitting
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.submitText}>Save</Text>
              }
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  tabBar: {
    flexDirection: "row", backgroundColor: COLORS.surface,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  tabBtn: { flex: 1, paddingVertical: 13, alignItems: "center" },
  tabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  tabText: { fontSize: 14, color: COLORS.textMuted, fontWeight: "500" },
  tabTextActive: { color: COLORS.primary, fontWeight: "600" },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  addBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: COLORS.primary, borderRadius: 12, padding: 13, marginBottom: 14,
  },
  addBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  card: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 10,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  cardLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  iconBox: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: COLORS.primaryLight + "22", alignItems: "center", justifyContent: "center",
  },
  cardTitle: { fontSize: 14, fontWeight: "600", color: COLORS.textPrimary },
  cardMeta: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  freqBadge: {
    backgroundColor: "#EDE9FE", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2,
    alignSelf: "flex-start", marginTop: 3,
  },
  freqText: { fontSize: 11, color: "#7C3AED", fontWeight: "600" },
  deleteBtn: { padding: 6 },
  emptyCard: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 32,
    alignItems: "center", marginTop: 10,
  },
  emptyText: { fontSize: 15, color: COLORS.textMuted, marginTop: 12 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modal: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20,
  },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 16, fontWeight: "700", color: COLORS.textPrimary },
  fieldLabel: { fontSize: 13, fontWeight: "600", color: COLORS.textSecondary, marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 10,
    padding: 12, fontSize: 14, color: COLORS.textPrimary, backgroundColor: COLORS.background,
  },
  freqRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  freqChip: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 7,
  },
  freqChipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + "15" },
  freqChipText: { fontSize: 12, color: COLORS.textSecondary },
  freqChipTextActive: { color: COLORS.primary, fontWeight: "600" },
  submitBtn: {
    backgroundColor: COLORS.primary, borderRadius: 12,
    padding: 14, alignItems: "center", marginTop: 20,
  },
  submitText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
