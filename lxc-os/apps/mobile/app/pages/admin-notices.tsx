import { useState, useCallback, useEffect } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Modal,
  TextInput, ActivityIndicator, RefreshControl, Alert, ScrollView, KeyboardAvoidingView, Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { PageHeader } from "@/components/PageHeader";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";
import { format } from "date-fns";

interface Notice {
  id: string;
  title: string;
  content: string;
  targetAudience: string;
  createdAt: string;
  author?: { name: string };
}

const AUDIENCE_OPTIONS = ["ALL", "STUDENTS", "TEACHERS", "STAFF", "PARENTS"];

const AUDIENCE_COLORS: Record<string, string> = {
  ALL: COLORS.primary,
  STUDENTS: "#8B5CF6",
  TEACHERS: COLORS.success,
  STAFF: "#F59E0B",
  PARENTS: "#EC4899",
};

export default function AdminNoticesPage() {
  const insets = useSafeAreaInsets();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [audience, setAudience] = useState("ALL");
  const [submitting, setSubmitting] = useState(false);

  const fetchNotices = useCallback(async () => {
    try {
      const res = await api.get<any>("/api/v1/admin/dashboard/notices");
      const data = Array.isArray(res) ? res : (res as any)?.notices ?? (res as any)?.data ?? [];
      setNotices(data);
    } catch (err) {
      console.error("Notices fetch failed:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchNotices(); }, [fetchNotices]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotices();
  }, [fetchNotices]);

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("Required", "Please fill in title and content.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/api/v1/admin/dashboard/notices", { title, content, targetAudience: audience });
      setTitle("");
      setContent("");
      setAudience("ALL");
      setShowModal(false);
      fetchNotices();
    } catch (err) {
      Alert.alert("Error", "Failed to create notice.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (n: Notice) => {
    Alert.alert("Delete Notice", `Delete "${n.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/api/v1/admin/dashboard/notices/${n.id}`);
            setNotices((prev) => prev.filter((x) => x.id !== n.id));
          } catch { Alert.alert("Error", "Failed to delete notice."); }
        },
      },
    ]);
  };

  const renderItem = ({ item, index }: { item: Notice; index: number }) => {
    const color = AUDIENCE_COLORS[item.targetAudience] ?? COLORS.primary;
    return (
      <Animated.View entering={FadeInDown.delay(index * 40).springify()} style={styles.card}>
        <View style={styles.cardTop}>
          <View style={[styles.audienceBadge, { backgroundColor: color + "20" }]}>
            <Text style={[styles.audienceText, { color }]}>{item.targetAudience}</Text>
          </View>
          <Text style={styles.date}>{format(new Date(item.createdAt), "dd MMM yyyy")}</Text>
          <TouchableOpacity onPress={() => handleDelete(item)} style={{ marginLeft: 6 }}>
            <Ionicons name="trash-outline" size={15} color={COLORS.error} />
          </TouchableOpacity>
        </View>
        <Text style={styles.noticeTitle}>{item.title}</Text>
        <Text style={styles.noticeContent} numberOfLines={3}>{item.content}</Text>
        {item.author ? <Text style={styles.author}>— {item.author.name}</Text> : null}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <PageHeader
        title="Notices"
        rightAction={{ icon: "add", onPress: () => setShowModal(true) }}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={notices}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="megaphone-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No notices yet</Text>
              <TouchableOpacity style={styles.createBtn} onPress={() => setShowModal(true)}>
                <Text style={styles.createBtnText}>Create First Notice</Text>
              </TouchableOpacity>
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
              <Text style={styles.modalTitle}>New Notice</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
              <Text style={styles.fieldLabel}>Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="Notice title"
                placeholderTextColor={COLORS.textMuted}
                value={title}
                onChangeText={setTitle}
              />

              <Text style={styles.fieldLabel}>Content *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Notice content…"
                placeholderTextColor={COLORS.textMuted}
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />

              <Text style={styles.fieldLabel}>Target Audience</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {AUDIENCE_OPTIONS.map((a) => (
                    <TouchableOpacity
                      key={a}
                      style={[styles.audienceChip, audience === a && { backgroundColor: COLORS.primary }]}
                      onPress={() => setAudience(a)}
                    >
                      <Text style={[styles.audienceChipText, audience === a && { color: "#fff" }]}>{a}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <TouchableOpacity style={styles.submitBtn} onPress={handleCreate} disabled={submitting}>
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitBtnText}>Post Notice</Text>
                )}
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
  card: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  cardTop: { flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 6 },
  audienceBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  audienceText: { fontSize: 10, fontFamily: "Inter_700Bold" },
  date: { flex: 1, fontSize: 11, fontFamily: "Inter_400Regular", color: COLORS.textMuted, textAlign: "right" },
  noticeTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: COLORS.textPrimary, marginBottom: 6 },
  noticeContent: { fontSize: 13, fontFamily: "Inter_400Regular", color: COLORS.textSecondary, lineHeight: 20 },
  author: { fontSize: 11, fontFamily: "Inter_400Regular", color: COLORS.textMuted, marginTop: 6, fontStyle: "italic" },
  fab: {
    position: "absolute", bottom: 30, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center",
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8,
  },
  modalContainer: { flex: 1, backgroundColor: COLORS.surface },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: COLORS.textPrimary },
  fieldLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: COLORS.textPrimary, marginBottom: 8 },
  input: {
    backgroundColor: COLORS.background, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, fontFamily: "Inter_400Regular", color: COLORS.textPrimary,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 16,
  },
  textArea: { height: 120, paddingTop: 12 },
  audienceChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border,
  },
  audienceChipText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: COLORS.textSecondary },
  submitBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  submitBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
  createBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10 },
  createBtnText: { color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 13 },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium", color: COLORS.textMuted },
});
