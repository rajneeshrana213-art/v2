import { useState, useCallback, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { PageHeader } from "@/components/PageHeader";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";

interface ClassOption { id: string; name: string }
interface TimetableEntry {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  subject?: { name: string };
  teacher?: { user: { name: string } };
  room?: string;
}

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const DAY_SHORT: Record<string, string> = { MONDAY: "Mon", TUESDAY: "Tue", WEDNESDAY: "Wed", THURSDAY: "Thu", FRIDAY: "Fri", SATURDAY: "Sat" };
const DAY_COLORS = ["#1A73B5", "#10B981", "#8B5CF6", "#F59E0B", "#EC4899", "#06B6D4"];

export default function AdminTimetablePage() {
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [selectedDay, setSelectedDay] = useState("MONDAY");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchClasses = useCallback(async () => {
    try {
      const res = await api.get<any>("/api/v1/dashboard/admin/classes");
      const data = (res as any)?.classes ?? (res as any)?.data ?? (Array.isArray(res) ? res : []);
      setClasses(data);
      if (data.length > 0) setSelectedClass(data[0].id);
    } catch (err) { console.error("Classes fetch failed:", err); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  const fetchTimetable = useCallback(async () => {
    if (!selectedClass) return;
    try {
      const res = await api.get<any>(`/api/v1/dashboard/admin/timetable?classId=${selectedClass}`);
      const data = (res as any)?.timetable ?? (res as any)?.data ?? (Array.isArray(res) ? res : []);
      setEntries(data);
    } catch (err) { console.error("Timetable fetch failed:", err); }
    finally { setRefreshing(false); }
  }, [selectedClass]);

  useEffect(() => { fetchClasses(); }, [fetchClasses]);
  useEffect(() => { if (selectedClass) fetchTimetable(); }, [selectedClass, fetchTimetable]);

  const onRefresh = useCallback(() => { setRefreshing(true); fetchTimetable(); }, [fetchTimetable]);

  const dayEntries = entries.filter((e) => e.day === selectedDay).sort((a, b) => a.startTime.localeCompare(b.startTime));

  if (loading) return <View style={[styles.container, styles.center]}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  return (
    <View style={styles.container}>
      <PageHeader title="Timetable" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.classScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {classes.map((c) => (
          <TouchableOpacity key={c.id} style={[styles.classPill, selectedClass === c.id && styles.classPillActive]} onPress={() => setSelectedClass(c.id)}>
            <Text style={[styles.classPillText, selectedClass === c.id && styles.classPillTextActive]}>{c.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.dayRow}>
        {DAYS.map((d, i) => (
          <TouchableOpacity key={d} style={[styles.dayTab, selectedDay === d && { backgroundColor: DAY_COLORS[i] }]} onPress={() => setSelectedDay(d)}>
            <Text style={[styles.dayText, selectedDay === d && { color: "#fff", fontFamily: "Inter_700Bold" }]}>{DAY_SHORT[d]}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {dayEntries.length === 0 ? (
          <View style={styles.center}><Ionicons name="calendar-outline" size={48} color={COLORS.textMuted} /><Text style={styles.emptyText}>No periods on {DAY_SHORT[selectedDay]}</Text></View>
        ) : dayEntries.map((e, i) => (
          <Animated.View key={e.id} entering={FadeInDown.delay(i * 50).springify()} style={styles.periodCard}>
            <View style={styles.timeCol}>
              <Text style={styles.timeText}>{e.startTime}</Text>
              <View style={styles.timeLine} />
              <Text style={styles.timeText}>{e.endTime}</Text>
            </View>
            <View style={styles.periodInfo}>
              <Text style={styles.subject}>{e.subject?.name ?? "Free Period"}</Text>
              {e.teacher ? <Text style={styles.periodSub}>{e.teacher.user.name}</Text> : null}
              {e.room ? <Text style={styles.periodSub}><Ionicons name="location-outline" size={11} /> {e.room}</Text> : null}
            </View>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 40, gap: 12 },
  classScroll: { maxHeight: 52, marginBottom: 4 },
  classPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  classPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  classPillText: { fontSize: 13, fontFamily: "Inter_500Medium", color: COLORS.textSecondary },
  classPillTextActive: { color: "#fff", fontFamily: "Inter_600SemiBold" },
  dayRow: { flexDirection: "row", paddingHorizontal: 16, gap: 6, marginVertical: 10 },
  dayTab: { flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: COLORS.surface, alignItems: "center", justifyContent: "center" },
  dayText: { fontSize: 11, fontFamily: "Inter_500Medium", color: COLORS.textSecondary },
  periodCard: { flexDirection: "row", backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  timeCol: { width: 54, alignItems: "center", gap: 4 },
  timeText: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: COLORS.primary },
  timeLine: { flex: 1, width: 2, backgroundColor: COLORS.border, borderRadius: 1, minHeight: 20 },
  periodInfo: { flex: 1, marginLeft: 14 },
  subject: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: COLORS.textPrimary, marginBottom: 4 },
  periodSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: COLORS.textMuted, marginTop: 1 },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium", color: COLORS.textMuted },
});
