import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PageHeader } from "@/components/PageHeader";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";

type PaymentMethod = "CASH" | "UPI" | "CARD" | "BANK_TRANSFER" | "CHEQUE" | "DD";

const METHODS: { key: PaymentMethod; label: string; icon: string; color: string }[] = [
  { key: "CASH", label: "Cash", icon: "cash-outline", color: "#10B981" },
  { key: "UPI", label: "UPI / QR", icon: "qr-code-outline", color: "#7C3AED" },
  { key: "CARD", label: "Card", icon: "card-outline", color: "#3B82F6" },
  { key: "BANK_TRANSFER", label: "Bank Transfer", icon: "business-outline", color: "#0891B2" },
  { key: "CHEQUE", label: "Cheque", icon: "document-text-outline", color: "#D97706" },
  { key: "DD", label: "Demand Draft", icon: "document-outline", color: "#EA580C" },
];

export default function AdminCollectFeesScreen() {
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [dues, setDues] = useState<any>(null);
  const [duesLoading, setDuesLoading] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [collecting, setCollecting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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

  const selectStudent = async (s: any) => {
    setSelected(s);
    setStudents([]);
    setSearch(s.name ?? "");
    setDuesLoading(true);
    try {
      const res = await api.get(`/api/v1/finance/ledger/${s.id}`);
      const data = (res as any)?.data ?? res;
      setDues(data);
      const outstanding = data?.outstanding ?? data?.balance ?? 0;
      setAmount(outstanding > 0 ? String(outstanding) : "");
    } catch (e) {
      console.error("Dues fetch error:", e);
    } finally {
      setDuesLoading(false);
    }
  };

  const handleCollect = async () => {
    if (!selected) { Alert.alert("Error", "Please select a student."); return; }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount."); return;
    }
    setCollecting(true);
    try {
      await api.post("/api/v1/finance/collect", {
        studentId: selected.id,
        amount: Number(amount),
        paymentMethod: method,
        notes,
      });
      setShowSuccess(true);
      setAmount("");
      setNotes("");
      setSelected(null);
      setDues(null);
      setSearch("");
    } catch (e) {
      Alert.alert("Error", "Failed to collect payment. Please try again.");
    } finally {
      setCollecting(false);
    }
  };

  return (
    <View style={styles.container}>
      <PageHeader title="Collect Fees" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Search Student</Text>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={v => { setSearch(v); if (!v) { setSelected(null); setDues(null); } }}
              placeholder="Search by name or admission no..."
              placeholderTextColor={COLORS.textMuted}
              returnKeyType="search"
            />
            {searchLoading && <ActivityIndicator size="small" color={COLORS.primary} />}
          </View>

          {students.length > 0 && (
            <View style={styles.dropdown}>
              {students.map(s => (
                <Pressable key={s.id} style={styles.dropdownItem} onPress={() => selectStudent(s)}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>{(s.name ?? "S")[0].toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.studentName}>{s.name}</Text>
                    <Text style={styles.studentMeta}>
                      {s.admissionNumber ?? s.rollNo ?? ""} {s.className ? `• ${s.className}` : ""}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {selected && (
          <>
            <View style={styles.studentCard}>
              <View style={styles.studentCardLeft}>
                <View style={[styles.avatarCircle, { backgroundColor: COLORS.primaryLight + "33" }]}>
                  <Text style={[styles.avatarText, { color: COLORS.primary }]}>
                    {(selected.name ?? "S")[0].toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={styles.cardName}>{selected.name}</Text>
                  <Text style={styles.cardMeta}>
                    {selected.admissionNumber ?? ""} {selected.className ? `• ${selected.className}` : ""}
                  </Text>
                </View>
              </View>
              <Pressable onPress={() => { setSelected(null); setDues(null); setSearch(""); setAmount(""); }}>
                <Ionicons name="close-circle" size={22} color={COLORS.textMuted} />
              </Pressable>
            </View>

            {duesLoading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading dues...</Text>
              </View>
            ) : dues && (
              <View style={styles.duesCard}>
                <View style={styles.duesRow}>
                  <Text style={styles.duesLabel}>Total Fees</Text>
                  <Text style={styles.duesValue}>₹{dues.totalFees ?? dues.total ?? 0}</Text>
                </View>
                <View style={styles.duesRow}>
                  <Text style={styles.duesLabel}>Paid</Text>
                  <Text style={[styles.duesValue, { color: COLORS.success }]}>₹{dues.paid ?? dues.totalPaid ?? 0}</Text>
                </View>
                <View style={[styles.duesRow, styles.duesHighlight]}>
                  <Text style={[styles.duesLabel, { fontWeight: "700" }]}>Outstanding</Text>
                  <Text style={[styles.duesValue, { color: COLORS.error, fontSize: 18, fontWeight: "700" }]}>
                    ₹{dues.outstanding ?? dues.balance ?? 0}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment Method</Text>
              <View style={styles.methodGrid}>
                {METHODS.map(m => (
                  <Pressable
                    key={m.key}
                    style={[styles.methodCard, method === m.key && { borderColor: m.color, borderWidth: 2 }]}
                    onPress={() => setMethod(m.key)}
                  >
                    <View style={[styles.methodIcon, { backgroundColor: m.color + "22" }]}>
                      <Ionicons name={m.icon as any} size={22} color={m.color} />
                    </View>
                    <Text style={[styles.methodLabel, method === m.key && { color: m.color, fontWeight: "700" }]}>
                      {m.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Amount (₹)</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="Enter amount"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notes (optional)</Text>
              <TextInput
                style={[styles.amountInput, { height: 70, textAlignVertical: "top" }]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Any additional notes..."
                placeholderTextColor={COLORS.textMuted}
                multiline
              />
            </View>

            <Pressable style={styles.collectBtn} onPress={handleCollect} disabled={collecting}>
              {collecting
                ? <ActivityIndicator color="#fff" />
                : <>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                  <Text style={styles.collectBtnText}>Collect Payment</Text>
                </>
              }
            </Pressable>
          </>
        )}
      </ScrollView>

      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.successOverlay}>
          <View style={styles.successModal}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={60} color={COLORS.success} />
            </View>
            <Text style={styles.successTitle}>Payment Collected!</Text>
            <Text style={styles.successSub}>The payment has been recorded successfully.</Text>
            <Pressable style={styles.successBtn} onPress={() => setShowSuccess(false)}>
              <Text style={styles.successBtnText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: "600", color: COLORS.textSecondary, marginBottom: 8 },
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
  avatarCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "#E5E7EB", alignItems: "center", justifyContent: "center",
  },
  avatarText: { fontSize: 15, fontWeight: "700", color: COLORS.textSecondary },
  studentName: { fontSize: 14, fontWeight: "600", color: COLORS.textPrimary },
  studentMeta: { fontSize: 12, color: COLORS.textMuted },
  studentCard: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: COLORS.primary + "40",
  },
  studentCardLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  cardName: { fontSize: 15, fontWeight: "600", color: COLORS.textPrimary },
  cardMeta: { fontSize: 12, color: COLORS.textMuted },
  loadingBox: { flexDirection: "row", alignItems: "center", gap: 10, justifyContent: "center", padding: 20 },
  loadingText: { fontSize: 14, color: COLORS.textSecondary },
  duesCard: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 16,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  duesRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  duesHighlight: {
    marginTop: 4, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  duesLabel: { fontSize: 14, color: COLORS.textSecondary },
  duesValue: { fontSize: 14, fontWeight: "600", color: COLORS.textPrimary },
  methodGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  methodCard: {
    width: "30%", backgroundColor: COLORS.surface, borderRadius: 10,
    padding: 10, alignItems: "center", borderWidth: 1, borderColor: COLORS.border,
  },
  methodIcon: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", marginBottom: 6 },
  methodLabel: { fontSize: 11, color: COLORS.textSecondary, textAlign: "center" },
  amountInput: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
    fontSize: 16, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border,
  },
  collectBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: COLORS.success, borderRadius: 14, padding: 16, marginTop: 4,
  },
  collectBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  successOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" },
  successModal: {
    backgroundColor: COLORS.surface, borderRadius: 20, padding: 32, alignItems: "center", width: "80%",
  },
  successIcon: { marginBottom: 12 },
  successTitle: { fontSize: 20, fontWeight: "700", color: COLORS.textPrimary, marginBottom: 8 },
  successSub: { fontSize: 14, color: COLORS.textSecondary, textAlign: "center", marginBottom: 20 },
  successBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 32 },
  successBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
});
