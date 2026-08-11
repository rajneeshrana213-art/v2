import { useState, useCallback, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    RefreshControl,
    ActivityIndicator,
    Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { format } from "date-fns";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/PageHeader";

interface FeeItem {
    id: string;
    title: string;
    amount: number;
    dueDate: string;
    status: "PAID" | "UNPAID" | "OVERDUE";
}

interface PaymentHistory {
    id: string;
    amount: number;
    date: string;
    method: string;
    invoiceUrl?: string;
    receiptUrl?: string;
}

interface FeeData {
    totalPending: number;
    pendingFees: FeeItem[];
    paymentHistory: PaymentHistory[];
}

export default function ParentFeesPage() {
    const insets = useSafeAreaInsets();
    const { activeStudentId } = useAuth();
    const [data, setData] = useState<FeeData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async (isRefresh = false) => {
        if (!activeStudentId) return;
        if (isRefresh) setRefreshing(true); else setLoading(true);
        try {
            const res = await api.get<FeeData>(`/api/v1/dashboard/parent/fees?studentId=${activeStudentId}`);
            setData(res as any);
        } catch (e) {
            console.error("Failed to fetch fees:", e);
            Alert.alert("Error", "Could not load fee information.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [activeStudentId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handlePayNow = () => {
        Alert.alert(
            "Payment Gateway",
            "This will redirect you to a secure payment gateway. Continue?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Continue", onPress: () => Alert.alert("Coming Soon", "Razorpay integration for mobile is in progress.") }
            ]
        );
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <PageHeader title="Fees & Payments" subtitle="Manage school dues and history" />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} tintColor={COLORS.primary} />}
            >
                {/* Total Dues Card */}
                <Animated.View entering={FadeInDown.delay(100)}>
                    <LinearGradient
                        colors={[COLORS.primary, "#6366F1"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.duesCard}
                    >
                        <View style={styles.duesHeader}>
                            <View style={styles.duesIconBox}>
                                <Ionicons name="wallet-outline" size={24} color="#FFF" />
                            </View>
                            <Text style={styles.duesLabel}>TOTAL PENDING DUES</Text>
                        </View>
                        <Text style={styles.duesAmount}>₹{(data?.totalPending || 0).toLocaleString()}</Text>
                        
                        {data?.totalPending ? data.totalPending > 0 && (
                            <Pressable style={styles.payBtn} onPress={handlePayNow}>
                                <Text style={styles.payBtnText}>Pay Now</Text>
                                <Ionicons name="arrow-forward" size={18} color={COLORS.primary} />
                            </Pressable>
                        ) : null}
                    </LinearGradient>
                </Animated.View>

                {/* Fee Schedule */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Fee Schedule</Text>
                    {data?.pendingFees && data.pendingFees.length > 0 ? (
                        data.pendingFees.map((fee, idx) => (
                            <Animated.View key={fee.id} entering={FadeInDown.delay(200 + idx * 50)} style={styles.feeItem}>
                                <View style={[styles.statusIndicator, { backgroundColor: fee.status === "PAID" ? COLORS.success : fee.status === "OVERDUE" ? COLORS.error : COLORS.warning }]} />
                                <View style={styles.feeInfo}>
                                    <Text style={styles.feeTitle}>{fee.title}</Text>
                                    <Text style={styles.feeDate}>Due: {format(new Date(fee.dueDate), "MMM dd, yyyy")}</Text>
                                </View>
                                <View style={styles.feeRight}>
                                    <Text style={styles.feeAmount}>₹{fee.amount.toLocaleString()}</Text>
                                    <Text style={[styles.feeStatusText, { color: fee.status === "PAID" ? COLORS.success : fee.status === "OVERDUE" ? COLORS.error : COLORS.warning }]}>
                                        {fee.status}
                                    </Text>
                                </View>
                            </Animated.View>
                        ))
                    ) : (
                        <View style={styles.emptyBox}>
                            <Ionicons name="checkmark-done-circle-outline" size={48} color={COLORS.success} />
                            <Text style={styles.emptyText}>All dues are cleared!</Text>
                        </View>
                    )}
                </View>

                {/* Payment History */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payment History</Text>
                    {data?.paymentHistory && data.paymentHistory.length > 0 ? (
                        data.paymentHistory.map((payment, idx) => (
                            <Animated.View key={payment.id} entering={FadeInUp.delay(300 + idx * 50)} style={styles.historyItem}>
                                <View style={styles.historyIcon}>
                                    <Ionicons name="card-outline" size={20} color={COLORS.textSecondary} />
                                </View>
                                <View style={styles.historyInfo}>
                                    <Text style={styles.historyMethod}>{payment.method}</Text>
                                    <Text style={styles.historyDate}>{format(new Date(payment.date), "MMM dd, yyyy")}</Text>
                                </View>
                                <Text style={styles.historyAmount}>₹{payment.amount.toLocaleString()}</Text>
                            </Animated.View>
                        ))
                    ) : (
                        <View style={styles.emptyBox}>
                            <Ionicons name="receipt-outline" size={48} color={COLORS.border} />
                            <Text style={styles.emptyText}>No payment history found.</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFF" },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    scrollView: { padding: 16 },
    duesCard: {
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 6,
    },
    duesHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
    duesIconBox: { width: 44, height: 44, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
    duesLabel: { fontSize: 12, fontFamily: "Inter_700Bold", color: "rgba(255,255,255,0.8)", letterSpacing: 1 },
    duesAmount: { fontSize: 32, fontFamily: "Inter_800ExtraBold", color: "#FFF", marginBottom: 20 },
    payBtn: {
        backgroundColor: "#FFF",
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        alignSelf: "flex-start",
    },
    payBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: COLORS.primary },
    section: { marginBottom: 32 },
    sectionTitle: { fontSize: 18, fontFamily: "Inter_800ExtraBold", color: COLORS.textPrimary, marginBottom: 16 },
    feeItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF",
        borderRadius: 18,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#F1F5F9",
    },
    statusIndicator: { width: 4, height: 32, borderRadius: 2, marginRight: 16 },
    feeInfo: { flex: 1 },
    feeTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: COLORS.textPrimary },
    feeDate: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
    feeRight: { alignItems: "flex-end" },
    feeAmount: { fontSize: 16, fontFamily: "Inter_800ExtraBold", color: COLORS.textPrimary },
    feeStatusText: { fontSize: 10, fontFamily: "Inter_700Bold", marginTop: 4, textTransform: "uppercase" },
    historyItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF",
        borderRadius: 18,
        padding: 16,
        marginBottom: 12,
    },
    historyIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#F8FAFF", alignItems: "center", justifyContent: "center", marginRight: 16 },
    historyInfo: { flex: 1 },
    historyMethod: { fontSize: 14, fontFamily: "Inter_700Bold", color: COLORS.textPrimary },
    historyDate: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
    historyAmount: { fontSize: 15, fontFamily: "Inter_700Bold", color: COLORS.success },
    emptyBox: { alignItems: "center", paddingVertical: 40, backgroundColor: "#FFF", borderRadius: 20, borderStyle: "dashed", borderWidth: 1, borderColor: COLORS.border },
    emptyText: { marginTop: 12, fontSize: 14, color: COLORS.textMuted, fontFamily: "Inter_500Medium" },
});
