import { useState, useCallback, useEffect } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Modal,
  TextInput, ActivityIndicator, RefreshControl, ScrollView, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { PageHeader } from "@/components/PageHeader";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";

type TxType = "ALL" | "INCOME" | "EXPENSE" | "FEE";

interface Transaction {
  id: string;
  type: "INCOME" | "EXPENSE" | "FEE";
  source?: string;
  category?: { name: string };
  date: string;
  amount: number;
  description: string;
  paymentMethod: string;
  invoiceNumber?: string;
}

interface Summary { totalIncome: number; totalExpense: number; netBalance: number }

const TX_COLORS: Record<string, string> = { INCOME: COLORS.success, EXPENSE: COLORS.error, FEE: COLORS.primary };
const TX_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = { INCOME: "arrow-down-circle", EXPENSE: "arrow-up-circle", FEE: "school" };
const FILTERS: TxType[] = ["ALL", "INCOME", "EXPENSE", "FEE"];

export default function AdminAccountsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<TxType>("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [txType, setTxType] = useState<"INCOME" | "EXPENSE">("INCOME");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: "1", limit: "50" });
      if (filter !== "ALL") params.set("type", filter);
      const [txRes, sumRes] = await Promise.allSettled([
        api.get<any>(`/api/v1/finance/transactions?${params}`),
        api.get<any>("/api/v1/finance/accounts/summary"),
      ]);
      if (txRes.status === "fulfilled") {
        const d = txRes.value as any;
        setTransactions(Array.isArray(d) ? d : d?.transactions ?? d?.data ?? []);
      }
      if (sumRes.status === "fulfilled") setSummary(sumRes.value as any);
    } catch (err) { console.error("Accounts fetch failed:", err); }
    finally { setLoading(false); setRefreshing(false); }
  }, [filter]);

  useEffect(() => { setLoading(true); fetchData(); }, [filter]);
  const onRefresh = useCallback(() => { setRefreshing(true); fetchData(); }, [fetchData]);

  const handleAddTransaction = async () => {
    if (!amount || !description) return;
    setSaving(true);
    try {
      await api.post("/api/v1/finance/transactions", {
        type: txType,
        amount: parseFloat(amount),
        description: description.trim(),
        paymentMethod,
        date: new Date().toISOString(),
      });
      setShowAddModal(false);
      setAmount(""); setDescription("");
      fetchData();
    } catch { Alert.alert("Error", "Failed to add transaction"); }
    finally { setSaving(false); }
  };

  const renderSummary = () => {
    if (!summary) return null;
    return (
      <View style={styles.summaryRow}>
        {[
          { label: "Income", value: summary.totalIncome, color: COLORS.success, icon: "trending-up" as const },
          { label: "Expense", value: summary.totalExpense, color: COLORS.error, icon: "trending-down" as const },
          { label: "Balance", value: summary.netBalance, color: COLORS.primary, icon: "wallet" as const },
        ].map((s) => (
          <View key={s.label} style={[styles.summaryCard, { borderLeftColor: s.color }]}>
            <Ionicons name={s.icon} size={16} color={s.color} />
            <Text style={[styles.summaryValue, { color: s.color }]}>
              ₹{Math.abs(s.value).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </Text>
            <Text style={styles.summaryLabel}>{s.label}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderItem = ({ item, index }: { item: Transaction; index: number }) => {
    const color = TX_COLORS[item.type];
    const icon = TX_ICONS[item.type];
    const isExpense = item.type === "EXPENSE";
    return (
      <Animated.View entering={FadeInDown.delay(index * 30).springify()} style={styles.txCard}>
        <View style={[styles.txIcon, { backgroundColor: color + "15" }]}>
          <Ionicons name={icon} size={22} color={color} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.txDesc} numberOfLines={1}>{item.description}</Text>
          <Text style={styles.txSub}>
            {item.category?.name ?? item.source ?? item.type} · {item.paymentMethod}
          </Text>
          <Text style={styles.txDate}>{new Date(item.date).toLocaleDateString("en-IN")}</Text>
        </View>
        <Text style={[styles.txAmount, { color }]}>
          {isExpense ? "−" : "+"}₹{item.amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
        </Text>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <PageHeader
        title="Accounts"
        subtitle="Transactions & ledger"
        rightAction={{ icon: "add-circle-outline", onPress: () => setShowAddModal(true) }}
      />

      {renderSummary()}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {FILTERS.map((f) => (
          <TouchableOpacity key={f} style={[styles.filterPill, filter === f && styles.filterPillActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="receipt-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No transactions found</Text>
            </View>
          }
        />
      )}

      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Transaction</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Ionicons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          <View style={styles.typeRow}>
            {(["INCOME", "EXPENSE"] as const).map((t) => (
              <TouchableOpacity key={t} style={[styles.typeBtn, txType === t && { backgroundColor: TX_COLORS[t], borderColor: TX_COLORS[t] }]} onPress={() => setTxType(t)}>
                <Text style={[styles.typeBtnText, txType === t && { color: "#fff" }]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Amount (₹) *</Text>
            <TextInput style={styles.input} placeholder="0.00" placeholderTextColor={COLORS.textMuted} value={amount} onChangeText={setAmount} keyboardType="numeric" />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput style={styles.input} placeholder="What is this for?" placeholderTextColor={COLORS.textMuted} value={description} onChangeText={setDescription} />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Payment Method</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {["CASH", "UPI", "BANK_TRANSFER", "CHEQUE", "CARD"].map((m) => (
                <TouchableOpacity key={m} style={[styles.methodPill, paymentMethod === m && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]} onPress={() => setPaymentMethod(m)}>
                  <Text style={[styles.methodText, paymentMethod === m && { color: "#fff" }]}>{m.replace("_", " ")}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: TX_COLORS[txType] }, (!amount || !description || saving) && styles.submitDisabled]}
            onPress={handleAddTransaction}
            disabled={!amount || !description || saving}
          >
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Add {txType}</Text>}
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 40, gap: 12 },
  summaryRow: { flexDirection: "row", paddingHorizontal: 16, gap: 10, marginBottom: 8 },
  summaryCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, gap: 3, borderLeftWidth: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  summaryValue: { fontSize: 15, fontFamily: "Inter_700Bold" },
  summaryLabel: { fontSize: 10, fontFamily: "Inter_500Medium", color: COLORS.textMuted },
  filterScroll: { maxHeight: 48, marginBottom: 4 },
  filterPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  filterPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { fontSize: 12, fontFamily: "Inter_500Medium", color: COLORS.textSecondary },
  filterTextActive: { color: "#fff", fontFamily: "Inter_600SemiBold" },
  txCard: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  txIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  txDesc: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: COLORS.textPrimary },
  txSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: COLORS.textMuted, marginTop: 2 },
  txDate: { fontSize: 10, fontFamily: "Inter_400Regular", color: COLORS.textMuted, marginTop: 1 },
  txAmount: { fontSize: 15, fontFamily: "Inter_700Bold" },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium", color: COLORS.textMuted },
  modal: { flex: 1, backgroundColor: COLORS.surface, padding: 24, paddingTop: 32 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: COLORS.textPrimary },
  typeRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  typeBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: "center", borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.background },
  typeBtnText: { fontSize: 13, fontFamily: "Inter_700Bold", color: COLORS.textSecondary },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: COLORS.textPrimary, marginBottom: 8 },
  input: { backgroundColor: COLORS.background, borderRadius: 12, padding: 14, fontSize: 14, fontFamily: "Inter_400Regular", color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border },
  methodPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  methodText: { fontSize: 12, fontFamily: "Inter_500Medium", color: COLORS.textSecondary },
  submitBtn: { borderRadius: 14, padding: 16, alignItems: "center", marginTop: 8 },
  submitDisabled: { opacity: 0.5 },
  submitText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
});
