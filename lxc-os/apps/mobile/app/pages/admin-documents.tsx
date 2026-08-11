import { useState, useCallback, useEffect } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Modal,
  ActivityIndicator, RefreshControl, ScrollView, Alert, TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { PageHeader } from "@/components/PageHeader";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";

type Tab = "templates" | "history";

interface Template { id: string; name: string; type: string; description?: string; fields?: string[] }
interface DocHistory {
  id: string;
  documentType?: string;
  template?: { name: string };
  student?: { user: { name: string }; admissionNo?: string };
  generatedAt: string;
  status: string;
}

const TEMPLATE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  BONAFIDE: "document-text",
  TRANSFER: "swap-horizontal",
  CHARACTER: "shield-checkmark",
  FEE_RECEIPT: "receipt",
  ID_CARD: "card",
  REPORT_CARD: "clipboard",
  MARKSHEET: "school",
  CONDUCT: "happy",
};

const STATUS_COLORS: Record<string, string> = { GENERATED: COLORS.success, PENDING: COLORS.warning, FAILED: COLORS.error };

export default function AdminDocumentsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("templates");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [history, setHistory] = useState<DocHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showGenModal, setShowGenModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [studentId, setStudentId] = useState("");
  const [generating, setGenerating] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [tRes, hRes] = await Promise.allSettled([
        api.get<any>("/api/v1/dashboard/admin/documents/templates"),
        api.get<any>("/api/v1/dashboard/admin/documents/history"),
      ]);
      if (tRes.status === "fulfilled") {
        const d = tRes.value as any;
        setTemplates(Array.isArray(d) ? d : d?.templates ?? d?.data ?? []);
      }
      if (hRes.status === "fulfilled") {
        const d = hRes.value as any;
        setHistory(Array.isArray(d) ? d : d?.history ?? d?.data ?? []);
      }
    } catch (err) { console.error("Documents fetch failed:", err); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  const onRefresh = useCallback(() => { setRefreshing(true); fetchData(); }, [fetchData]);

  const handleGenerate = async () => {
    if (!selectedTemplate || !studentId.trim()) return;
    setGenerating(true);
    try {
      await api.post("/api/v1/dashboard/admin/documents/generate", {
        templateId: selectedTemplate.id,
        studentId: studentId.trim(),
      });
      setShowGenModal(false);
      setStudentId("");
      setSelectedTemplate(null);
      setActiveTab("history");
      fetchData();
      Alert.alert("Success", "Document generated successfully.");
    } catch { Alert.alert("Error", "Failed to generate document."); }
    finally { setGenerating(false); }
  };

  const renderTemplate = ({ item, index }: { item: Template; index: number }) => {
    const icon = TEMPLATE_ICONS[item.type] ?? "document-outline";
    return (
      <Animated.View entering={FadeInDown.delay(index * 40).springify()}>
        <TouchableOpacity
          style={styles.templateCard}
          onPress={() => { setSelectedTemplate(item); setShowGenModal(true); }}
          activeOpacity={0.85}
        >
          <View style={[styles.iconBox, { backgroundColor: COLORS.primaryLight }]}>
            <Ionicons name={icon} size={22} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.templateName}>{item.name}</Text>
            <Text style={styles.templateType}>{item.type.replace(/_/g, " ")}</Text>
            {item.description ? <Text style={styles.templateDesc} numberOfLines={1}>{item.description}</Text> : null}
          </View>
          <View style={styles.generateBtn}>
            <Ionicons name="print-outline" size={16} color={COLORS.primary} />
            <Text style={styles.generateBtnText}>Generate</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderHistory = ({ item, index }: { item: DocHistory; index: number }) => {
    const statusColor = STATUS_COLORS[item.status] ?? COLORS.textMuted;
    return (
      <Animated.View entering={FadeInDown.delay(index * 30).springify()} style={styles.histCard}>
        <View style={[styles.iconBox, { backgroundColor: statusColor + "15" }]}>
          <Ionicons name="document-text-outline" size={20} color={statusColor} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.templateName}>{item.template?.name ?? item.documentType ?? "Document"}</Text>
          {item.student ? (
            <Text style={styles.templateType}>
              {item.student.user.name}
              {item.student.admissionNo ? ` · ${item.student.admissionNo}` : ""}
            </Text>
          ) : null}
          <Text style={styles.histDate}>{new Date(item.generatedAt).toLocaleString("en-IN")}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <PageHeader title="Documents" subtitle="Certificates & records" />
      <View style={styles.tabRow}>
        {([["templates", "Templates", "layers-outline"], ["history", "Issuance Log", "time-outline"]] as const).map(([key, label, icon]) => (
          <TouchableOpacity key={key} style={[styles.tab, activeTab === key && styles.tabActive]} onPress={() => setActiveTab(key)}>
            <Ionicons name={icon} size={15} color={activeTab === key ? COLORS.primary : COLORS.textMuted} />
            <Text style={[styles.tabText, activeTab === key && styles.tabTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      ) : activeTab === "templates" ? (
        <FlatList
          data={templates}
          keyExtractor={(i) => i.id}
          renderItem={renderTemplate}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={<View style={styles.center}><Ionicons name="document-outline" size={48} color={COLORS.textMuted} /><Text style={styles.emptyText}>No templates configured</Text></View>}
        />
      ) : (
        <FlatList
          data={history}
          keyExtractor={(i) => i.id}
          renderItem={renderHistory}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={<View style={styles.center}><Ionicons name="time-outline" size={48} color={COLORS.textMuted} /><Text style={styles.emptyText}>No documents generated yet</Text></View>}
        />
      )}

      <Modal visible={showGenModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Generate Document</Text>
            <TouchableOpacity onPress={() => { setShowGenModal(false); setStudentId(""); }}>
              <Ionicons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          {selectedTemplate && (
            <View style={styles.selectedTemplateCard}>
              <Ionicons name={TEMPLATE_ICONS[selectedTemplate.type] ?? "document-outline"} size={24} color={COLORS.primary} />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.selectedTemplateName}>{selectedTemplate.name}</Text>
                <Text style={styles.selectedTemplateType}>{selectedTemplate.type.replace(/_/g, " ")}</Text>
              </View>
            </View>
          )}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Student ID / Admission No. *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter student ID or admission number"
              placeholderTextColor={COLORS.textMuted}
              value={studentId}
              onChangeText={setStudentId}
              autoCapitalize="none"
            />
          </View>
          <TouchableOpacity
            style={[styles.generateFullBtn, (!studentId.trim() || generating) && styles.generateDisabled]}
            onPress={handleGenerate}
            disabled={!studentId.trim() || generating}
          >
            {generating ? <ActivityIndicator color="#fff" /> : (
              <>
                <Ionicons name="print-outline" size={18} color="#fff" />
                <Text style={styles.generateFullBtnText}>Generate & Save</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 40, gap: 12 },
  tabRow: { flexDirection: "row", paddingHorizontal: 16, gap: 10, marginBottom: 10 },
  tab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 12, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  tabActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  tabText: { fontSize: 12, fontFamily: "Inter_500Medium", color: COLORS.textMuted },
  tabTextActive: { color: COLORS.primary, fontFamily: "Inter_600SemiBold" },
  templateCard: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  iconBox: { width: 46, height: 46, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  templateName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: COLORS.textPrimary },
  templateType: { fontSize: 11, fontFamily: "Inter_500Medium", color: COLORS.textSecondary, marginTop: 2 },
  templateDesc: { fontSize: 11, fontFamily: "Inter_400Regular", color: COLORS.textMuted, marginTop: 1 },
  generateBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: COLORS.primaryLight, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10 },
  generateBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: COLORS.primary },
  histCard: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  histDate: { fontSize: 10, fontFamily: "Inter_400Regular", color: COLORS.textMuted, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium", color: COLORS.textMuted },
  modal: { flex: 1, backgroundColor: COLORS.surface, padding: 24, paddingTop: 32 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: COLORS.textPrimary },
  selectedTemplateCard: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.primaryLight, borderRadius: 14, padding: 14, marginBottom: 20 },
  selectedTemplateName: { fontSize: 14, fontFamily: "Inter_700Bold", color: COLORS.primary },
  selectedTemplateType: { fontSize: 11, fontFamily: "Inter_500Medium", color: COLORS.primary, opacity: 0.7, marginTop: 2 },
  fieldGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: COLORS.textPrimary, marginBottom: 8 },
  input: { backgroundColor: COLORS.background, borderRadius: 12, padding: 14, fontSize: 14, fontFamily: "Inter_400Regular", color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border },
  generateFullBtn: { backgroundColor: COLORS.primary, borderRadius: 14, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 8 },
  generateDisabled: { opacity: 0.5 },
  generateFullBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
});
