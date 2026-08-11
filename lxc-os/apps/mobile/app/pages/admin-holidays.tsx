import { useState, useCallback, useEffect } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Modal,
  TextInput, ActivityIndicator, RefreshControl, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { PageHeader } from "@/components/PageHeader";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";

interface Holiday {
  id: string;
  name: string;
  date: string;
  type?: string;
  description?: string;
}

const TYPE_COLORS: Record<string, string> = { NATIONAL: "#EF4444", REGIONAL: "#F59E0B", SCHOOL: "#8B5CF6", OPTIONAL: "#10B981" };

export default function AdminHolidaysPage() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchHolidays = useCallback(async () => {
    try {
      const res = await api.get<any>("/api/v1/admin/dashboard/holidays");
      const data = (res as any)?.holidays ?? (res as any)?.data ?? (Array.isArray(res) ? res : []);
      setHolidays(data);
    } catch (err) { console.error("Holidays fetch failed:", err); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchHolidays(); }, [fetchHolidays]);
  const onRefresh = useCallback(() => { setRefreshing(true); fetchHolidays(); }, [fetchHolidays]);

  const handleCreate = async () => {
    if (!name.trim() || !date.trim()) return;
    setSaving(true);
    try {
      await api.post("/api/v1/admin/dashboard/holidays", { name: name.trim(), date, description: description.trim() });
      setShowModal(false);
      setName(""); setDate(""); setDescription("");
      fetchHolidays();
    } catch (err) { Alert.alert("Error", "Failed to create holiday"); }
    finally { setSaving(false); }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert("Delete Holiday", `Remove "${name}" from the list?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        try {
          await api.delete(`/api/v1/admin/dashboard/holidays/${id}`);
          fetchHolidays();
        } catch { Alert.alert("Error", "Failed to delete holiday"); }
      }},
    ]);
  };

  const renderItem = ({ item, index }: { item: Holiday; index: number }) => {
    const typeColor = TYPE_COLORS[item.type ?? ""] ?? COLORS.primary;
    const dateObj = new Date(item.date);
    return (
      <Animated.View entering={FadeInDown.delay(index * 40).springify()} style={styles.card}>
        <View style={styles.dateBox}>
          <Text style={styles.dateDay}>{dateObj.getDate()}</Text>
          <Text style={styles.dateMon}>{dateObj.toLocaleString("default", { month: "short" })}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={styles.name}>{item.name}</Text>
          {item.description ? <Text style={styles.sub}>{item.description}</Text> : null}
          {item.type ? (
            <View style={[styles.badge, { backgroundColor: typeColor + "15" }]}>
              <Text style={[styles.badgeText, { color: typeColor }]}>{item.type}</Text>
            </View>
          ) : null}
        </View>
        <TouchableOpacity onPress={() => handleDelete(item.id, item.name)} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={18} color={COLORS.error} />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <PageHeader title="Holidays" rightAction={{ icon: "add-circle-outline", onPress: () => setShowModal(true) }} />
      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      ) : (
        <FlatList
          data={holidays}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={<View style={styles.center}><Ionicons name="calendar-outline" size={48} color={COLORS.textMuted} /><Text style={styles.emptyText}>No holidays scheduled</Text></View>}
        />
      )}

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Holiday</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}><Ionicons name="close" size={24} color={COLORS.textPrimary} /></TouchableOpacity>
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Holiday Name *</Text>
            <TextInput style={styles.input} placeholder="e.g. Independence Day" placeholderTextColor={COLORS.textMuted} value={name} onChangeText={setName} />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Date * (YYYY-MM-DD)</Text>
            <TextInput style={styles.input} placeholder="2025-08-15" placeholderTextColor={COLORS.textMuted} value={date} onChangeText={setDate} />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput style={[styles.input, { height: 80 }]} placeholder="Optional description…" placeholderTextColor={COLORS.textMuted} value={description} onChangeText={setDescription} multiline />
          </View>
          <TouchableOpacity style={[styles.submitBtn, (!name || !date || saving) && styles.submitDisabled]} onPress={handleCreate} disabled={!name || !date || saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Add Holiday</Text>}
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 40, gap: 12 },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  dateBox: { width: 48, height: 52, borderRadius: 12, backgroundColor: COLORS.primaryLight, alignItems: "center", justifyContent: "center" },
  dateDay: { fontSize: 20, fontFamily: "Inter_700Bold", color: COLORS.primary },
  dateMon: { fontSize: 10, fontFamily: "Inter_500Medium", color: COLORS.primary, marginTop: -2 },
  name: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: COLORS.textPrimary },
  sub: { fontSize: 11, fontFamily: "Inter_400Regular", color: COLORS.textMuted, marginTop: 2 },
  badge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginTop: 4 },
  badgeText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  deleteBtn: { padding: 8 },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium", color: COLORS.textMuted },
  modal: { flex: 1, backgroundColor: COLORS.surface, padding: 24, paddingTop: 32 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  modalTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: COLORS.textPrimary },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: COLORS.textPrimary, marginBottom: 6 },
  input: { backgroundColor: COLORS.background, borderRadius: 12, padding: 14, fontSize: 14, fontFamily: "Inter_400Regular", color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border },
  submitBtn: { backgroundColor: COLORS.primary, borderRadius: 14, padding: 16, alignItems: "center", marginTop: 8 },
  submitDisabled: { opacity: 0.5 },
  submitText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
});
