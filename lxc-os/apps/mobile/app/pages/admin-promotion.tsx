import { useState, useCallback, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { PageHeader } from "@/components/PageHeader";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";

interface ClassOption { id: string; name: string; studentsCount?: number }

export default function AdminPromotionPage() {
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoting, setPromoting] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, { promoted: number; failed: number }>>({});

  const fetchClasses = useCallback(async () => {
    try {
      const res = await api.get<any>("/api/v1/dashboard/admin/classes");
      const data = (res as any)?.classes ?? (res as any)?.data ?? (Array.isArray(res) ? res : []);
      setClasses(data);
    } catch (err) { console.error("Classes fetch failed:", err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchClasses(); }, [fetchClasses]);

  const handlePromote = (cls: ClassOption) => {
    Alert.alert(
      "Promote Students",
      `Promote all eligible students from ${cls.name} to the next class? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Promote", style: "destructive", onPress: async () => {
          setPromoting(cls.id);
          try {
            const res = await api.post<any>("/api/v1/admin/student-promotion", { classId: cls.id });
            const promoted = (res as any)?.promoted ?? 0;
            const failed = (res as any)?.failed ?? 0;
            setResults((prev) => ({ ...prev, [cls.id]: { promoted, failed } }));
            Alert.alert("Done", `${promoted} students promoted successfully.${failed > 0 ? ` ${failed} failed.` : ""}`);
          } catch {
            Alert.alert("Error", "Failed to promote students. Please try again.");
          } finally {
            setPromoting(null);
          }
        }},
      ]
    );
  };

  if (loading) return <View style={[styles.container, styles.center]}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  return (
    <View style={styles.container}>
      <PageHeader title="Student Promotion" subtitle="Promote to next class" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
          <Text style={styles.infoText}>
            Promote students at the end of the academic year. Students who have passed all required subjects will be moved to the next class.
          </Text>
        </View>
        <Text style={styles.sectionTitle}>Select Class to Promote</Text>
        {classes.map((cls, i) => {
          const result = results[cls.id];
          return (
            <Animated.View key={cls.id} entering={FadeInDown.delay(i * 40).springify()}>
              <View style={styles.classCard}>
                <View style={[styles.iconBox, { backgroundColor: COLORS.primaryLight }]}>
                  <Ionicons name="school-outline" size={22} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={styles.className}>{cls.name}</Text>
                  {cls.studentsCount != null ? <Text style={styles.sub}>{cls.studentsCount} students</Text> : null}
                  {result && (
                    <Text style={[styles.sub, { color: COLORS.success, marginTop: 4 }]}>
                      ✓ {result.promoted} promoted{result.failed > 0 ? `, ${result.failed} failed` : ""}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  style={[styles.promoteBtn, promoting === cls.id && styles.promoteBtnDisabled]}
                  onPress={() => handlePromote(cls)}
                  disabled={!!promoting || !!result}
                >
                  {promoting === cls.id
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text style={styles.promoteBtnText}>{result ? "Done" : "Promote"}</Text>
                  }
                </TouchableOpacity>
              </View>
            </Animated.View>
          );
        })}
        {classes.length === 0 && (
          <View style={styles.center}>
            <Ionicons name="school-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No classes available</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 40, gap: 12 },
  infoCard: { flexDirection: "row", gap: 10, backgroundColor: COLORS.primaryLight, borderRadius: 12, padding: 14, marginBottom: 20, alignItems: "flex-start" },
  infoText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: COLORS.primary, lineHeight: 20 },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: COLORS.textPrimary, marginBottom: 14 },
  classCard: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  iconBox: { width: 46, height: 46, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  className: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: COLORS.textPrimary },
  sub: { fontSize: 12, fontFamily: "Inter_400Regular", color: COLORS.textMuted, marginTop: 2 },
  promoteBtn: { backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9 },
  promoteBtnDisabled: { opacity: 0.5 },
  promoteBtnText: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#fff" },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium", color: COLORS.textMuted },
});
