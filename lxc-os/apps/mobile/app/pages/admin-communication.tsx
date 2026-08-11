import { useState, useCallback, useEffect } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Modal,
  TextInput, ActivityIndicator, RefreshControl, Alert, ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { PageHeader } from "@/components/PageHeader";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";

interface Announcement {
  id: string;
  title: string;
  content: string;
  targetAudience?: string;
  createdAt: string;
  author?: { name: string };
}

const AUDIENCES = ["ALL", "STUDENTS", "TEACHERS", "PARENTS", "STAFF"];

export default function AdminCommunicationPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [audience, setAudience] = useState("ALL");
  const [saving, setSaving] = useState(false);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await api.get<any>("/api/v1/admin/dashboard/announcements");
      const data = (res as any)?.announcements ?? (res as any)?.data ?? (Array.isArray(res) ? res : []);
      setAnnouncements(data);
    } catch (err) { console.error("Announcements fetch failed:", err); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);
  const onRefresh = useCallback(() => { setRefreshing(true); fetchAnnouncements(); }, [fetchAnnouncements]);

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    try {
      await api.post("/api/v1/admin/dashboard/announcements", { title: title.trim(), content: content.trim(), targetAudience: audience });
      setShowModal(false);
      setTitle(""); setContent(""); setAudience("ALL");
      fetchAnnouncements();
    } catch { Alert.alert("Error", "Failed to send announcement"); }
    finally { setSaving(false); }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete", "Remove this announcement?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        try { await api.delete(`/api/v1/admin/dashboard/announcements/${id}`); fetchAnnouncements(); }
        catch { Alert.alert("Error", "Failed to delete"); }
      }},
    ]);
  };

  const AUDIENCE_COLORS: Record<string, string> = { ALL: COLORS.primary, STUDENTS: "#10B981", TEACHERS: "#8B5CF6", PARENTS: "#F59E0B", STAFF: "#EC4899" };

  const renderItem = ({ item, index }: { item: Announcement; index: number }) => {
    const audienceColor = AUDIENCE_COLORS[item.targetAudience ?? "ALL"] ?? COLORS.primary;
    return (
      <Animated.View entering={FadeInDown.delay(index * 40).springify()} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.badge, { backgroundColor: audienceColor + "20" }]}>
            <Text style={[styles.badgeText, { color: audienceColor }]}>{item.targetAudience ?? "ALL"}</Text>
          </View>
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={16} color={COLORS.error} />
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.content} numberOfLines={3}>{item.content}</Text>
        <View style={styles.cardFooter}>
          {item.author ? <Text style={styles.sub}>{item.author.name}</Text> : null}
          <Text style={styles.sub}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <PageHeader title="Communication" subtitle="Announcements" rightAction={{ icon: "add-circle-outline", onPress: () => setShowModal(true) }} />
      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      ) : (
        <FlatList
          data={announcements}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={<View style={styles.center}><Ionicons name="chatbubbles-outline" size={48} color={COLORS.textMuted} /><Text style={styles.emptyText}>No announcements yet</Text></View>}
        />
      )}

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Announcement</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}><Ionicons name="close" size={24} color={COLORS.textPrimary} /></TouchableOpacity>
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Title *</Text>
            <TextInput style={styles.input} placeholder="Announcement title" placeholderTextColor={COLORS.textMuted} value={title} onChangeText={setTitle} />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Content *</Text>
            <TextInput style={[styles.input, { height: 120 }]} placeholder="Write your announcement…" placeholderTextColor={COLORS.textMuted} value={content} onChangeText={setContent} multiline />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Target Audience</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {AUDIENCES.map((a) => (
                <TouchableOpacity key={a} style={[styles.audiencePill, audience === a && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]} onPress={() => setAudience(a)}>
                  <Text style={[styles.audienceText, audience === a && { color: "#fff" }]}>{a}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <TouchableOpacity style={[styles.submitBtn, (!title || !content || saving) && styles.submitDisabled]} onPress={handleCreate} disabled={!title || !content || saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Send Announcement</Text>}
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 40, gap: 12 },
  card: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  title: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: COLORS.textPrimary, marginBottom: 6 },
  content: { fontSize: 13, fontFamily: "Inter_400Regular", color: COLORS.textSecondary, lineHeight: 20, marginBottom: 10 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between" },
  sub: { fontSize: 11, fontFamily: "Inter_400Regular", color: COLORS.textMuted },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  deleteBtn: { padding: 4 },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium", color: COLORS.textMuted },
  modal: { flex: 1, backgroundColor: COLORS.surface, padding: 24, paddingTop: 32 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  modalTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: COLORS.textPrimary },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: COLORS.textPrimary, marginBottom: 8 },
  input: { backgroundColor: COLORS.background, borderRadius: 12, padding: 14, fontSize: 14, fontFamily: "Inter_400Regular", color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border },
  audiencePill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  audienceText: { fontSize: 12, fontFamily: "Inter_500Medium", color: COLORS.textSecondary },
  submitBtn: { backgroundColor: COLORS.primary, borderRadius: 14, padding: 16, alignItems: "center", marginTop: 8 },
  submitDisabled: { opacity: 0.5 },
  submitText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
});
