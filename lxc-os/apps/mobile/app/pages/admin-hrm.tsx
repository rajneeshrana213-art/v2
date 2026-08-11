import { useState, useCallback, useEffect } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { PageHeader } from "@/components/PageHeader";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";

type Tab = "employees" | "departments" | "payroll";

interface Employee { id: string; employeeId?: string; user: { name: string; email?: string }; designation?: { name: string }; department?: { name: string }; status: string }
interface Department { id: string; name: string; head?: { user: { name: string } }; _count?: { employees: number } }
interface Payroll { id: string; employee: { user: { name: string } }; month: number; year: number; netSalary: number; status: string }

const TABS: { key: Tab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "employees", label: "Employees", icon: "person-outline" },
  { key: "departments", label: "Departments", icon: "business-outline" },
  { key: "payroll", label: "Payroll", icon: "cash-outline" },
];

const STATUS_COLORS: Record<string, string> = { ACTIVE: COLORS.success, INACTIVE: COLORS.error, PAID: COLORS.success, PENDING: COLORS.warning, PROCESSING: COLORS.primary };

export default function AdminHrmPage() {
  const [activeTab, setActiveTab] = useState<Tab>("employees");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [payroll, setPayroll] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [eRes, dRes, pRes] = await Promise.allSettled([
        api.get<any>("/api/v1/admin/dashboard/hrm/employees"),
        api.get<any>("/api/v1/admin/dashboard/hrm/departments"),
        api.get<any>("/api/v1/admin/dashboard/hrm/payroll"),
      ]);
      if (eRes.status === "fulfilled") { const d = eRes.value as any; setEmployees(Array.isArray(d) ? d : d?.employees ?? d?.data ?? []); }
      if (dRes.status === "fulfilled") { const d = dRes.value as any; setDepartments(Array.isArray(d) ? d : d?.departments ?? d?.data ?? []); }
      if (pRes.status === "fulfilled") { const d = pRes.value as any; setPayroll(Array.isArray(d) ? d : d?.payroll ?? d?.data ?? []); }
    } catch (err) { console.error("HRM fetch failed:", err); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  const onRefresh = useCallback(() => { setRefreshing(true); fetchData(); }, [fetchData]);

  const renderEmployee = ({ item, index }: { item: Employee; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 30).springify()} style={styles.card}>
      <View style={styles.avatar}><Text style={styles.avatarText}>{item.user.name.charAt(0).toUpperCase()}</Text></View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.name}>{item.user.name}</Text>
        {item.designation ? <Text style={styles.sub}>{item.designation.name}</Text> : null}
        {item.department ? <Text style={styles.sub}>{item.department.name}</Text> : null}
        {item.employeeId ? <Text style={styles.sub}>ID: {item.employeeId}</Text> : null}
      </View>
      <View style={[styles.badge, { backgroundColor: (STATUS_COLORS[item.status] ?? COLORS.textMuted) + "20" }]}>
        <Text style={[styles.badgeText, { color: STATUS_COLORS[item.status] ?? COLORS.textMuted }]}>{item.status}</Text>
      </View>
    </Animated.View>
  );

  const renderDept = ({ item, index }: { item: Department; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 30).springify()} style={styles.card}>
      <View style={[styles.iconBox, { backgroundColor: "#8B5CF620" }]}>
        <Ionicons name="business" size={22} color="#8B5CF6" />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.name}>{item.name}</Text>
        {item.head ? <Text style={styles.sub}>Head: {item.head.user.name}</Text> : null}
      </View>
      <View style={[styles.badge, { backgroundColor: COLORS.primaryLight }]}>
        <Text style={[styles.badgeText, { color: COLORS.primary }]}>{item._count?.employees ?? 0} staff</Text>
      </View>
    </Animated.View>
  );

  const renderPayroll = ({ item, index }: { item: Payroll; index: number }) => {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return (
      <Animated.View entering={FadeInDown.delay(index * 30).springify()} style={styles.card}>
        <View style={[styles.iconBox, { backgroundColor: COLORS.success + "15" }]}>
          <Ionicons name="cash" size={20} color={COLORS.success} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.name}>{item.employee.user.name}</Text>
          <Text style={styles.sub}>{months[item.month - 1]} {item.year}</Text>
        </View>
        <View style={{ alignItems: "flex-end", gap: 4 }}>
          <Text style={styles.salary}>₹{item.netSalary.toLocaleString()}</Text>
          <View style={[styles.badge, { backgroundColor: (STATUS_COLORS[item.status] ?? COLORS.textMuted) + "20" }]}>
            <Text style={[styles.badgeText, { color: STATUS_COLORS[item.status] ?? COLORS.textMuted }]}>{item.status}</Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  const data = activeTab === "employees" ? employees : activeTab === "departments" ? departments : payroll;
  const render = activeTab === "employees" ? renderEmployee : activeTab === "departments" ? renderDept : renderPayroll;

  return (
    <View style={styles.container}>
      <PageHeader title="HRM" subtitle="Human Resources" />
      <View style={styles.tabRow}>
        {TABS.map((t) => (
          <TouchableOpacity key={t.key} style={[styles.tab, activeTab === t.key && styles.tabActive]} onPress={() => setActiveTab(t.key)}>
            <Ionicons name={t.icon} size={14} color={activeTab === t.key ? COLORS.primary : COLORS.textMuted} />
            <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      ) : (
        <FlatList
          data={data as any[]}
          keyExtractor={(i: any) => i.id}
          renderItem={render as any}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={<View style={styles.center}><Ionicons name="people-outline" size={48} color={COLORS.textMuted} /><Text style={styles.emptyText}>No data found</Text></View>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 40, gap: 12 },
  tabRow: { flexDirection: "row", paddingHorizontal: 16, gap: 8, marginBottom: 10 },
  tab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 9, borderRadius: 12, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  tabActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  tabText: { fontSize: 11, fontFamily: "Inter_500Medium", color: COLORS.textMuted },
  tabTextActive: { color: COLORS.primary, fontFamily: "Inter_600SemiBold" },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#8B5CF615", alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#8B5CF6" },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  name: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: COLORS.textPrimary },
  sub: { fontSize: 11, fontFamily: "Inter_400Regular", color: COLORS.textMuted, marginTop: 1 },
  salary: { fontSize: 14, fontFamily: "Inter_700Bold", color: COLORS.success },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium", color: COLORS.textMuted },
});
