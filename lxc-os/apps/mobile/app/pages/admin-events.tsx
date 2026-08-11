import { useState, useCallback, useEffect } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Modal,
  TextInput, ActivityIndicator, RefreshControl, Alert, ScrollView,
  KeyboardAvoidingView, Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import DateTimePicker from "@react-native-community/datetimepicker";
import { PageHeader } from "@/components/PageHeader";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";
import { format, isPast } from "date-fns";

interface SchoolEvent {
  id: string;
  title: string;
  description?: string;
  venue?: string;
  startDate: string;
  endDate?: string;
  type?: string;
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  ACADEMIC: COLORS.primary,
  CULTURAL: "#EC4899",
  SPORTS: COLORS.success,
  HOLIDAY: "#F59E0B",
  EXAM: COLORS.error,
  OTHER: "#6B7280",
};

export default function AdminEventsPage() {
  const insets = useSafeAreaInsets();
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"upcoming" | "past">("upcoming");
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [venue, setVenue] = useState("");
  const [eventDate, setEventDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await api.get<any>("/api/v1/admin/dashboard/events");
      const data = Array.isArray(res) ? res : (res as any)?.events ?? (res as any)?.data ?? [];
      setEvents(data);
    } catch (err) {
      console.error("Events fetch failed:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEvents();
  }, [fetchEvents]);

  const filtered = events.filter((e) => {
    const past = isPast(new Date(e.startDate));
    return filter === "past" ? past : !past;
  });

  const handleCreate = async () => {
    if (!title.trim()) { Alert.alert("Required", "Please enter event title."); return; }
    setSubmitting(true);
    try {
      await api.post("/api/v1/admin/dashboard/events", {
        title, description, venue, startDate: eventDate.toISOString(),
      });
      setTitle(""); setDescription(""); setVenue(""); setEventDate(new Date());
      setShowModal(false);
      fetchEvents();
    } catch { Alert.alert("Error", "Failed to create event."); }
    finally { setSubmitting(false); }
  };

  const handleDelete = (e: SchoolEvent) => {
    Alert.alert("Delete Event", `Delete "${e.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/api/v1/admin/dashboard/events/${e.id}`);
            setEvents((prev) => prev.filter((x) => x.id !== e.id));
          } catch { Alert.alert("Error", "Failed to delete event."); }
        },
      },
    ]);
  };

  const renderItem = ({ item, index }: { item: SchoolEvent; index: number }) => {
    const color = EVENT_TYPE_COLORS[item.type ?? "OTHER"] ?? "#6B7280";
    return (
      <Animated.View entering={FadeInDown.delay(index * 40).springify()} style={styles.card}>
        <View style={[styles.dateBox, { backgroundColor: color + "15" }]}>
          <Text style={[styles.dateDay, { color }]}>{format(new Date(item.startDate), "dd")}</Text>
          <Text style={[styles.dateMon, { color }]}>{format(new Date(item.startDate), "MMM")}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.eventTitle}>{item.title}</Text>
          {item.venue ? (
            <View style={styles.venueRow}>
              <Ionicons name="location-outline" size={12} color={COLORS.textMuted} />
              <Text style={styles.venue}>{item.venue}</Text>
            </View>
          ) : null}
          {item.description ? <Text style={styles.desc} numberOfLines={2}>{item.description}</Text> : null}
          {item.type ? (
            <View style={[styles.typeBadge, { backgroundColor: color + "20" }]}>
              <Text style={[styles.typeText, { color }]}>{item.type}</Text>
            </View>
          ) : null}
        </View>
        <TouchableOpacity onPress={() => handleDelete(item)} style={{ padding: 4, marginLeft: 4 }}>
          <Ionicons name="trash-outline" size={15} color={COLORS.error} />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <PageHeader title="Events" rightAction={{ icon: "add", onPress: () => setShowModal(true) }} />

      <View style={styles.filterRow}>
        {(["upcoming", "past"] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="calendar-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No {filter} events</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <View style={[styles.modalContainer, { paddingTop: insets.top + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Event</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
              <Text style={styles.fieldLabel}>Title *</Text>
              <TextInput style={styles.input} placeholder="Event title" placeholderTextColor={COLORS.textMuted} value={title} onChangeText={setTitle} />

              <Text style={styles.fieldLabel}>Date</Text>
              <TouchableOpacity style={[styles.input, styles.datePicker]} onPress={() => setShowPicker(true)}>
                <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
                <Text style={{ color: COLORS.textPrimary, fontFamily: "Inter_500Medium" }}>
                  {format(eventDate, "dd MMM yyyy")}
                </Text>
              </TouchableOpacity>
              {showPicker && (
                <DateTimePicker
                  value={eventDate}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(_, d) => { setShowPicker(false); if (d) setEventDate(d); }}
                />
              )}

              <Text style={styles.fieldLabel}>Venue</Text>
              <TextInput style={styles.input} placeholder="Location / venue" placeholderTextColor={COLORS.textMuted} value={venue} onChangeText={setVenue} />

              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput style={[styles.input, styles.textArea]} placeholder="Event details…" placeholderTextColor={COLORS.textMuted} value={description} onChangeText={setDescription} multiline numberOfLines={4} textAlignVertical="top" />

              <TouchableOpacity style={styles.submitBtn} onPress={handleCreate} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Create Event</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 40, gap: 12 },
  filterRow: { flexDirection: "row", paddingHorizontal: 16, gap: 10, marginBottom: 8 },
  filterBtn: { flex: 1, paddingVertical: 9, borderRadius: 12, backgroundColor: COLORS.surface, alignItems: "center", borderWidth: 1, borderColor: COLORS.border },
  filterBtnActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  filterText: { fontSize: 13, fontFamily: "Inter_500Medium", color: COLORS.textMuted },
  filterTextActive: { color: COLORS.primary, fontFamily: "Inter_600SemiBold" },
  card: { flexDirection: "row", alignItems: "flex-start", backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  dateBox: { width: 48, height: 52, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  dateDay: { fontSize: 20, fontFamily: "Inter_700Bold" },
  dateMon: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  eventTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: COLORS.textPrimary, marginBottom: 4 },
  venueRow: { flexDirection: "row", alignItems: "center", gap: 3, marginBottom: 3 },
  venue: { fontSize: 11, fontFamily: "Inter_400Regular", color: COLORS.textMuted },
  desc: { fontSize: 12, fontFamily: "Inter_400Regular", color: COLORS.textSecondary, lineHeight: 18, marginBottom: 6 },
  typeBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  typeText: { fontSize: 10, fontFamily: "Inter_700Bold" },
  fab: { position: "absolute", bottom: 30, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center", shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
  modalContainer: { flex: 1, backgroundColor: COLORS.surface },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: COLORS.textPrimary },
  fieldLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: COLORS.textPrimary, marginBottom: 8 },
  input: { backgroundColor: COLORS.background, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, fontFamily: "Inter_400Regular", color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16 },
  datePicker: { flexDirection: "row", alignItems: "center", gap: 10 },
  textArea: { height: 100, paddingTop: 12 },
  submitBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  submitBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium", color: COLORS.textMuted },
});
