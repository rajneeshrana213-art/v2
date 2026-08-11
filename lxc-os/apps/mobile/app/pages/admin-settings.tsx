import { useState, useCallback, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, TextInput, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PageHeader } from "@/components/PageHeader";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";

interface SchoolSettings {
  id: string;
  schoolName: string;
  schoolCode?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  board?: string;
  medium?: string;
  principalName?: string;
}

interface AcademicYear { id: string; year: string; isCurrent: boolean }

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<SchoolSettings>>({});
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const [settingsRes, yearsRes] = await Promise.allSettled([
        api.get<SchoolSettings>("/api/v1/admin/settings/school"),
        api.get<AcademicYear[]>("/api/v1/admin/settings/academic-years"),
      ]);
      if (settingsRes.status === "fulfilled") {
        const d = settingsRes.value as any;
        setSettings(d);
        setForm(d);
      }
      if (yearsRes.status === "fulfilled") {
        const d = yearsRes.value as any;
        setAcademicYears(Array.isArray(d) ? d : d?.years ?? d?.data ?? []);
      }
    } catch (err) {
      console.error("Settings fetch failed:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/api/v1/admin/settings/school", form);
      setSettings((prev) => prev ? { ...prev, ...form } : null);
      setEditing(false);
      Alert.alert("Saved", "School settings updated successfully.");
    } catch {
      Alert.alert("Error", "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const currentYear = academicYears.find((y) => y.isCurrent);

  const fields: { key: keyof SchoolSettings; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: "schoolName", label: "School Name", icon: "school-outline" },
    { key: "schoolCode", label: "School Code", icon: "barcode-outline" },
    { key: "address", label: "Address", icon: "location-outline" },
    { key: "phone", label: "Phone", icon: "call-outline" },
    { key: "email", label: "Email", icon: "mail-outline" },
    { key: "website", label: "Website", icon: "globe-outline" },
    { key: "board", label: "Board / Affiliation", icon: "ribbon-outline" },
    { key: "medium", label: "Medium", icon: "language-outline" },
    { key: "principalName", label: "Principal", icon: "person-outline" },
  ];

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PageHeader
        title="Settings"
        rightAction={editing
          ? { icon: "close", onPress: () => { setEditing(false); setForm(settings ?? {}); } }
          : { icon: "pencil", onPress: () => setEditing(true) }
        }
      />

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {currentYear && (
          <View style={styles.yearCard}>
            <Ionicons name="calendar" size={18} color={COLORS.primary} />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.yearLabel}>Current Academic Year</Text>
              <Text style={styles.yearValue}>{currentYear.year}</Text>
            </View>
          </View>
        )}

        {academicYears.length > 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Academic Years</Text>
            <View style={styles.yearsRow}>
              {academicYears.map((y) => (
                <View
                  key={y.id}
                  style={[styles.yearChip, y.isCurrent && styles.yearChipActive]}
                >
                  <Text style={[styles.yearChipText, y.isCurrent && styles.yearChipTextActive]}>
                    {y.year} {y.isCurrent ? "✓" : ""}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>School Information</Text>
          {fields.map((f) => (
            <View key={f.key} style={styles.fieldRow}>
              <View style={styles.fieldIcon}>
                <Ionicons name={f.icon} size={16} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>{f.label}</Text>
                {editing ? (
                  <TextInput
                    style={styles.fieldInput}
                    value={String(form[f.key] ?? "")}
                    onChangeText={(v) => setForm((prev) => ({ ...prev, [f.key]: v }))}
                    placeholder={`Enter ${f.label.toLowerCase()}`}
                    placeholderTextColor={COLORS.textMuted}
                  />
                ) : (
                  <Text style={styles.fieldValue}>
                    {settings?.[f.key] ? String(settings[f.key]) : "—"}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {editing && (
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={18} color="#fff" />
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { alignItems: "center", justifyContent: "center" },
  yearCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: COLORS.primaryLight, borderRadius: 14, padding: 16, marginBottom: 16,
  },
  yearLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: COLORS.textSecondary },
  yearValue: { fontSize: 17, fontFamily: "Inter_700Bold", color: COLORS.primary },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontFamily: "Inter_700Bold", color: COLORS.textPrimary, marginBottom: 10 },
  yearsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  yearChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  yearChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  yearChipText: { fontSize: 12, fontFamily: "Inter_500Medium", color: COLORS.textSecondary },
  yearChipTextActive: { color: "#fff" },
  fieldRow: {
    flexDirection: "row", alignItems: "flex-start",
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 8,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  fieldIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: COLORS.primaryLight, alignItems: "center", justifyContent: "center", marginRight: 12, marginTop: 2 },
  fieldLabel: { fontSize: 11, fontFamily: "Inter_500Medium", color: COLORS.textMuted, marginBottom: 3 },
  fieldValue: { fontSize: 14, fontFamily: "Inter_500Medium", color: COLORS.textPrimary },
  fieldInput: {
    fontSize: 14, fontFamily: "Inter_500Medium", color: COLORS.textPrimary,
    borderBottomWidth: 1, borderBottomColor: COLORS.primary, paddingBottom: 2,
  },
  saveBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 14, marginTop: 8,
  },
  saveBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
});
