import { useState, useCallback, useEffect } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, ScrollView, TextInput,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { PageHeader } from "@/components/PageHeader";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";

interface Ticket {
  id: string;
  ticketNo?: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  category?: string;
  createdAt: string;
  assignedTo?: { name: string; role?: string };
}

const STATUS_COLORS: Record<string, string> = { OPEN: "#EF4444", IN_PROGRESS: "#F59E0B", RESOLVED: "#10B981", CLOSED: "#6B7280" };
const PRIORITY_COLORS: Record<string, string> = { HIGH: "#EF4444", MEDIUM: "#F59E0B", LOW: "#10B981", URGENT: "#7C3AED" };

export default function UserTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchTickets = useCallback(async () => {
    try {
      const res = await api.get<Ticket[]>("/api/v1/user/tickets");
      setTickets(Array.isArray(res) ? res : []);
    } catch (err) { console.error("Tickets fetch failed:", err); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { setLoading(true); fetchTickets(); }, []);
  const onRefresh = useCallback(() => { setRefreshing(true); fetchTickets(); }, [fetchTickets]);

  const handleCreateTicket = async () => {
    if (!newTitle.trim() || !newDescription.trim()) return;
    setCreating(true);
    try {
      await api.post("/api/v1/user/tickets", {
        title: newTitle,
        description: newDescription,
      });
      setModalVisible(false);
      setNewTitle("");
      setNewDescription("");
      onRefresh();
    } catch (err) {
      console.error("Failed to create ticket:", err);
    } finally {
      setCreating(false);
    }
  };

  const renderItem = ({ item, index }: { item: Ticket; index: number }) => {
    const statusColor = STATUS_COLORS[item.status] ?? COLORS.textMuted;
    const priorityColor = PRIORITY_COLORS[item.priority] ?? COLORS.textMuted;
    return (
      <Animated.View entering={FadeInDown.delay(index * 40).springify()} style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.ticketNo}>{item.ticketNo ? `#${item.ticketNo}` : `#${item.id.slice(-6)}`}</Text>
          <View style={{ flexDirection: "row", gap: 6 }}>
            <View style={[styles.badge, { backgroundColor: priorityColor + "20" }]}>
              <Text style={[styles.badgeText, { color: priorityColor }]}>{item.priority}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: statusColor + "20" }]}>
              <Text style={[styles.badgeText, { color: statusColor }]}>{item.status.replace("_", " ")}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.title}>{item.title}</Text>
        {item.description ? <Text style={styles.desc} numberOfLines={2}>{item.description}</Text> : null}
        <View style={styles.cardFooter}>
          <Text style={styles.sub}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          {item.assignedTo && <Text style={styles.sub}>Assigned to: {item.assignedTo.name}</Text>}
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <PageHeader title="Support Tickets" />
      
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.createButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.createButtonText}>Create New Ticket</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={<View style={styles.center}><Ionicons name="help-buoy-outline" size={48} color={COLORS.textMuted} /><Text style={styles.emptyText}>No tickets found</Text></View>}
        />
      )}

      {/* Create Ticket Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Support Ticket</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Subject / Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Brief description of the issue"
              placeholderTextColor={COLORS.textMuted}
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <Text style={styles.inputLabel}>Details</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Provide more details about your request..."
              placeholderTextColor={COLORS.textMuted}
              value={newDescription}
              onChangeText={setNewDescription}
              multiline
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.submitButton, (!newTitle || !newDescription || creating) && styles.submitButtonDisabled]}
              onPress={handleCreateTicket}
              disabled={!newTitle || !newDescription || creating}
            >
              {creating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Ticket</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 40, gap: 12 },
  actionRow: { paddingHorizontal: 16, paddingBottom: 10 },
  createButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: COLORS.primary, paddingVertical: 12, borderRadius: 12, gap: 8 },
  createButtonText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  card: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  ticketNo: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: COLORS.primary },
  title: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: COLORS.textPrimary, marginBottom: 4 },
  desc: { fontSize: 12, fontFamily: "Inter_400Regular", color: COLORS.textSecondary, marginBottom: 8 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between" },
  sub: { fontSize: 11, fontFamily: "Inter_400Regular", color: COLORS.textMuted },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium", color: COLORS.textMuted },
  
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: COLORS.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: COLORS.textPrimary },
  inputLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: COLORS.textPrimary, marginBottom: 8 },
  input: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 14, fontSize: 16, color: COLORS.textPrimary, fontFamily: "Inter_400Regular", marginBottom: 16 },
  textArea: { height: 120 },
  submitButton: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 12, alignItems: "center", marginTop: 10 },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
