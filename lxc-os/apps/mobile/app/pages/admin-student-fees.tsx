import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { PageHeader } from "@/components/PageHeader";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";
import { format } from "date-fns";

export default function AdminStudentFeesScreen() {
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [ledger, setLedger] = useState<any>(null);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const searchStudents = useCallback(async () => {
    if (search.trim().length < 2) { setStudents([]); return; }
    setSearchLoading(true);
    try {
      const res = await api.get(`/api/v1/admin/core/students?search=${encodeURIComponent(search)}&limit=10`);
      const arr = (res as any)?.data ?? (Array.isArray(res) ? res : []);
      setStudents(arr);
    } catch (e) {
      console.error(e);
    } finally {
      setSearchLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(searchStudents, 400);
    return () => clearTimeout(t);
  }, [searchStudents]);

  const fetchLedger = useCallback(async (studentId: string) => {
    setLedgerLoading(true);
    try {
      const res = await api.get(`/api/v1/finance/ledger/${studentId}`);
      setLedger((res as any)?.data ?? res);
    } catch (e) {
      console.error("Ledger fetch error:", e);
    } finally {
      setLedgerLoading(false);
      setRefreshing(false);
    }
  }, []);

  const selectStudent = (s: any) => {
    setSelected(s);
    setStudents([]);
    setSearch(s.name ?? "");
    fetchLedger(s.id);
  };

  const onRefresh = () => {
    if (selected) { setRefreshing(true); fetchLedger(selected.id); }
  };

  const txnColor = (type: string) => {
    if (type === "PAYMENT" || type === "CREDIT") return COLORS.success;
    if (type === "DEBIT" || type === "FEE") return COLORS.error;
    return COLORS.textSecondary;
  };

  const txnIcon = (type: string) => {
    if (type === "PAYMENT" || type === "CREDIT") return "arrow-down-circle-outline";
    return "arrow-up-circle-outline";
  };

  return (
    <View style={styles.container}>
      <PageHeader title="Student Fee Ledger" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        <View style={styles.searchSection}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={v => { setSearch(v); if (!v) { setSelected(null); setLedger(null); } }}
              placeholder="Search student by name or admission no..."
              placeholderTextColor={COLORS.textMuted}
            />
            {searchLoading && <ActivityIndicator size="small" color={COLORS.primary} />}
          </View>

          {students.length > 0 && (
            <View style={styles.dropdown}>
              {students.map(s => (
                <Pressable key={s.id} style={styles.dropdownItem} onPress={() => selectStudent(s)}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{(s.name ?? "S")[0].toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.studentName}>{s.name}</Text>
                    <Text style={styles.studentMeta}>
                      {s.admissionNumber ?? ""} {s.className ? `• ${s.className}` : ""}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {selected && (
          <View style={styles.studentChip}>
            <View style={[styles.avatar, { backgroundColor: COLORS.primaryLight + "33" }]}>
              <Text style={[styles.avatarText, { color: COLORS.primary }]}>
                {(selected.name ?? "S")[0].toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.chipName}>{selected.name}</Text>
              <Text style={styles.chipMeta}>{selected.admissionNumber ?? ""} {selected.className ? `• ${selected.className}` : ""}</Text>
            </View>
            <Pressable onPress={() => { setSelected(null); setLedger(null); setSearch(""); }}>
              <Ionicons name="close-circle" size={22} color={COLORS.textMuted} />
            </Pressable>
          </View>
        )}

        {ledgerLoading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading ledger...</Text>
          </View>
        )}

        {ledger && !ledgerLoading && (
          <>
            <View style={styles.summaryGrid}>
              {[
                { label: "Total Fees", value: ledger.totalFees ?? ledger.total ?? 0, color: COLORS.textPrimary },
                { label: "Paid", value: ledger.paid ?? ledger.totalPaid ?? 0, color: COLORS.success },
                { label: "Outstanding", value: ledger.outstanding ?? ledger.balance ?? 0, color: COLORS.error },
                { label: "Concession", value: ledger.concession ?? 0, color: "#7C3AED" },
              ].map(s => (
                <View key={s.label} style={styles.summaryCard}>
                  <Text style={[styles.summaryValue, { color: s.color }]}>₹{s.value}</Text>
                  <Text style={styles.summaryLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            <Pressable
              style={styles.collectBtn}
              onPress={() => router.push("/pages/admin-collect-fees" as any)}
            >
              <Ionicons name="cash-outline" size={18} color="#fff" />
              <Text style={styles.collectBtnText}>Collect Payment</Text>
            </Pressable>

            <Text style={styles.sectionTitle}>Transaction History</Text>

            {(ledger.transactions ?? ledger.history ?? []).length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="receipt-outline" size={36} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>No transactions yet</Text>
              </View>
            ) : (ledger.transactions ?? ledger.history ?? []).map((txn: any, idx: number) => (
              <View key={txn.id ?? idx} style={styles.txnCard}>
                <View style={[styles.txnIcon, { backgroundColor: txnColor(txn.type) + "22" }]}>
                  <Ionicons name={txnIcon(txn.type) as any} size={20} color={txnColor(txn.type)} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.txnTitle}>{txn.description ?? txn.head ?? txn.type}</Text>
                  <Text style={styles.txnDate}>
                    {txn.date ? format(new Date(txn.date), "dd MMM yyyy") : ""}
                    {txn.method ? ` • ${txn.method}` : ""}
                  </Text>
                </View>
                <Text style={[styles.txnAmount, { color: txnColor(txn.type) }]}>
                  {txn.type === "PAYMENT" || txn.type === "CREDIT" ? "+" : "-"}₹{txn.amount}
                </Text>
              </View>
            ))}
          </>
        )}

        {!selected && !ledger && (
          <View style={styles.placeholder}>
            <Ionicons name="person-circle-outline" size={60} color={COLORS.textMuted} />
            <Text style={styles.placeholderText}>Search for a student to view their fee ledger</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  searchSection: { marginBottom: 12 },
  searchBox: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: COLORS.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.textPrimary },
  dropdown: {
    backgroundColor: COLORS.surface, borderRadius: 12, marginTop: 4,
    borderWidth: 1, borderColor: COLORS.border, overflow: "hidden",
  },
  dropdownItem: {
    flexDirection: "row", alignItems: "center", gap: 12, padding: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "#E5E7EB", alignItems: "center", justifyContent: "center",
  },
  avatarText: { fontSize: 15, fontWeight: "700", color: COLORS.textSecondary },
  studentName: { fontSize: 14, fontWeight: "600", color: COLORS.textPrimary },
  studentMeta: { fontSize: 12, color: COLORS.textMuted },
  studentChip: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, marginBottom: 14,
    borderWidth: 1, borderColor: COLORS.primary + "40",
  },
  chipName: { fontSize: 14, fontWeight: "600", color: COLORS.textPrimary },
  chipMeta: { fontSize: 12, color: COLORS.textMuted },
  loadingBox: { flexDirection: "row", alignItems: "center", gap: 10, justifyContent: "center", padding: 24 },
  loadingText: { fontSize: 14, color: COLORS.textSecondary },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 14 },
  summaryCard: {
    flex: 1, minWidth: "44%", backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, alignItems: "center",
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  summaryValue: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  summaryLabel: { fontSize: 12, color: COLORS.textMuted },
  collectBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, backgroundColor: COLORS.success, borderRadius: 12, padding: 13, marginBottom: 16,
  },
  collectBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  sectionTitle: { fontSize: 14, fontWeight: "600", color: COLORS.textSecondary, marginBottom: 10 },
  txnCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 10, padding: 12, marginBottom: 8,
  },
  txnIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  txnTitle: { fontSize: 13, fontWeight: "600", color: COLORS.textPrimary },
  txnDate: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  txnAmount: { fontSize: 15, fontWeight: "700" },
  emptyCard: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 32, alignItems: "center",
  },
  emptyText: { fontSize: 14, color: COLORS.textMuted, marginTop: 10 },
  placeholder: {
    alignItems: "center", justifyContent: "center", paddingVertical: 60, paddingHorizontal: 40,
  },
  placeholderText: { fontSize: 14, color: COLORS.textMuted, textAlign: "center", marginTop: 16, lineHeight: 20 },
});
