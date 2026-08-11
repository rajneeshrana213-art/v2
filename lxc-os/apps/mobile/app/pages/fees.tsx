import { useState, useCallback, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Platform,
    RefreshControl,
    ActivityIndicator,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import * as WebBrowser from "expo-web-browser";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { PageHeader } from "@/components/PageHeader";
import { BottomNav } from "@/components/BottomNav";
import { ParentBottomNav } from "@/components/ParentBottomNav";
import { TeacherBottomNav } from "@/components/TeacherBottomNav";
import { RazorpayCheckout } from "@/components/RazorpayCheckout";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";
import { FeeData } from "@/lib/types/student";
import { format } from "date-fns";
import { useAuth } from "@/lib/auth-context";

function FeesPage() {
    const insets = useSafeAreaInsets();
    const { user, activeStudentId } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [feeData, setFeeData] = useState<FeeData | null>(null);
    const [showPayModal, setShowPayModal] = useState(false);
    const [payAmount, setPayAmount] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    // Razorpay State
    const [orderData, setOrderData] = useState<any>(null);
    const [showCheckout, setShowCheckout] = useState(false);

    const fetchFees = useCallback(async () => {
        try {
            let response;
            if (user?.role === "parent") {
                if (!activeStudentId) return;
                response = await api.get<FeeData>(`/api/v1/dashboard/parent/fees?studentId=${activeStudentId}`);
            } else {
                response = await api.get<FeeData>("/api/v1/dashboard/student/fees");
            }

            // The api.get returns ApiResponse<T>, but logically the backend returns the object directly.
            // Based on lint feedback, we need to handle the structure correctly.
            const data = response as any;
            setFeeData(data);
            if (data?.totalPending > 0) {
                setPayAmount(data.totalPending.toString());
            }
        } catch (error) {
            console.error("Failed to fetch fees:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchFees();
    }, [fetchFees]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchFees();
    }, [fetchFees]);

    const handleViewReceipt = async (url?: string) => {
        if (!url) {
            Alert.alert("Error", "Receipt not available yet. Please check back later.");
            return;
        }
        await WebBrowser.openBrowserAsync(url);
    };

    const handleInitiatePayment = async () => {
        const amount = parseFloat(payAmount);
        if (isNaN(amount) || amount <= 0) {
            Alert.alert("Invalid Amount", "Please enter a valid amount to pay.");
            return;
        }

        const pending = feeData?.totalPending || 0;
        const minAmt = Math.ceil(pending * 0.20);
        if (amount < minAmt && pending > 0) {
            Alert.alert("Minimum Payment", `Minimum payment allowed is ₹${minAmt.toLocaleString()} (20% of dues).`);
            return;
        }

        if (amount > pending) {
            Alert.alert("Amount Exceeded", `You cannot pay more than the pending amount of ₹${pending.toLocaleString()}.`);
            return;
        }

        try {
            setIsProcessing(true);
            const response = (await api.post("/api/v1/finance/collect/create-order", {
                studentId: feeData?.personalInfo?.id,
                schoolId: feeData?.personalInfo?.schoolId,
                amount: amount,
                paymentMethod: "ONLINE"
            })) as any;

            if (response.error) {
                throw new Error(typeof response.error === 'string' ? response.error : "Failed to create order");
            }

            console.log("Razorpay Order Created:", response.orderId);
            console.log("Razorpay Key Type:", response.keyId?.startsWith('rzp_test') ? 'TEST' : 'LIVE');

            setOrderData(response);
            setShowPayModal(false);
            setShowCheckout(true);
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to initiate payment. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePaymentSuccess = async (data: any) => {
        try {
            setIsProcessing(true);
            setShowCheckout(false);

            const response = (await api.post("/api/v1/finance/collect/verify-payment", {
                ...data,
                studentId: feeData?.personalInfo?.id,
                schoolId: feeData?.personalInfo?.schoolId,
                userId: feeData?.personalInfo?.userId,
                shouldSendReceipt: true
            })) as any;

            if (response.success) {
                Alert.alert("Success", "Payment verified successfully. Your receipt is being generated.");
                fetchFees(); // Refresh data
            } else {
                throw new Error(typeof response.error === 'string' ? response.error : "Verification failed");
            }
        } catch (error: any) {
            Alert.alert("Verification Error", "Payment was successful but verification failed. Please contact support with your Payment ID.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading && !refreshing) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    const pendingAmount = feeData?.totalPending || 0;
    const minRequired = Math.ceil(pendingAmount * 0.20);
    const transactionFee = parseFloat(payAmount) > 0 ? (parseFloat(payAmount) * 0.02) : 0;
    const totalToPay = (parseFloat(payAmount) || 0) + transactionFee;

    return (
        <View style={styles.container}>
            <PageHeader title="Fees & Billing" subtitle="Manage your academic finances" />

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                    paddingBottom: insets.bottom + 80,
                }}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
            >
                {/* Hero Gradient Card */}
                <Animated.View entering={FadeInDown.delay(100)} style={styles.heroContainer}>
                    <LinearGradient
                        colors={[COLORS.primary, '#6366f1']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.heroCard}
                    >
                        <View style={styles.heroHeader}>
                            <View style={styles.heroIconContainer}>
                                <Ionicons name="wallet" size={24} color="#FFFFFF" />
                            </View>
                            <Text style={styles.heroLabel}>Total Pending Balance</Text>
                        </View>
                        <Text style={styles.heroValue}>₹ {pendingAmount.toLocaleString()}</Text>
                        <TouchableOpacity
                            style={styles.heroActionBtn}
                            onPress={() => setShowPayModal(true)}
                        >
                            <Text style={styles.heroActionText}>Pay Outstanding</Text>
                            <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
                        </TouchableOpacity>
                    </LinearGradient>
                </Animated.View>

                {/* Glassmorphic Stats Grid */}
                <View style={styles.statsGrid}>
                    <Animated.View entering={FadeInDown.delay(200)} style={styles.statItem}>
                        <View style={[styles.statIconContainer, { backgroundColor: COLORS.success + '15' }]}>
                            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                        </View>
                        <Text style={styles.statLabel}>Total Paid</Text>
                        <Text style={styles.statValue}>₹ {(feeData?.totalPaid || 0).toLocaleString()}</Text>
                    </Animated.View>
                    <Animated.View entering={FadeInDown.delay(300)} style={styles.statItem}>
                        <View style={[styles.statIconContainer, { backgroundColor: COLORS.warning + '15' }]}>
                            <Ionicons name="layers" size={20} color={COLORS.warning} />
                        </View>
                        <Text style={styles.statLabel}>Assigned</Text>
                        <Text style={styles.statValue}>₹ {(feeData?.totalAssigned || 0).toLocaleString()}</Text>
                    </Animated.View>
                </View>

                {/* Payment Guidelines Card */}
                <Animated.View entering={FadeInDown.delay(350)} style={styles.guidelinesContainer}>
                    <BlurView intensity={20} tint="light" style={styles.guidelinesCard}>
                        <View style={styles.guidelinesHeader}>
                            <Ionicons name="information-circle" size={18} color={COLORS.primary} />
                            <Text style={styles.guidelinesTitle}>Payment Guidelines</Text>
                        </View>
                        <View style={styles.guidelineRow}>
                            <View style={styles.guidelineDot} />
                            <Text style={styles.guidelineText}>
                                Minimum payable amount is <Text style={styles.guidelineBold}>20% of total dues</Text> (₹ {minRequired.toLocaleString()}).
                            </Text>
                        </View>
                        <View style={styles.guidelineRow}>
                            <View style={styles.guidelineDot} />
                            <Text style={styles.guidelineText}>
                                A <Text style={styles.guidelineBold}>2% gateway fee</Text> applies to all online transactions.
                            </Text>
                        </View>
                    </BlurView>
                </Animated.View>

                {/* Pending Invoices Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Upcoming Installments</Text>
                    {feeData?.pendingFees && feeData.pendingFees.length > 0 ? (
                        feeData.pendingFees.map((fee, idx) => (
                            <Animated.View
                                key={fee.id || idx}
                                entering={FadeInUp.delay(400 + idx * 100)}
                                style={styles.feeCard}
                            >
                                <View style={[styles.feeCardIcon, { backgroundColor: COLORS.error + '10' }]}>
                                    <Ionicons name="alert-circle" size={24} color={COLORS.error} />
                                </View>
                                <View style={styles.feeCardContent}>
                                    <Text style={styles.feeCardTitle}>{fee.name || "Tuition Fee"}</Text>
                                    <Text style={styles.feeCardDate}>Due: {fee.dueDate ? format(new Date(fee.dueDate), "MMM d, yyyy") : 'TBA'}</Text>
                                    <Text style={styles.feeCardStatus}>{fee.status}</Text>
                                </View>
                                <View style={styles.feeCardRight}>
                                    <Text style={styles.feeCardAmount}>₹ {fee.amount.toLocaleString()}</Text>
                                    <View style={styles.statusBadge}>
                                        <Text style={styles.statusText}>DUE</Text>
                                    </View>
                                </View>
                            </Animated.View>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIconContainer}>
                                <Ionicons name="receipt-outline" size={32} color={COLORS.textMuted} />
                            </View>
                            <Text style={styles.emptyStateText}>No pending invoices found.</Text>
                        </View>
                    )}
                </View>

                {/* Payment History Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Transactional History</Text>
                    {feeData?.paymentHistory && feeData.paymentHistory.length > 0 ? (
                        feeData.paymentHistory.map((payment, idx) => (
                            <Animated.View
                                key={payment.id || idx}
                                entering={FadeInUp.delay(600 + idx * 50)}
                                style={styles.historyCard}
                            >
                                <View style={styles.historyHeader}>
                                    <View style={styles.historyMethodContainer}>
                                        <Ionicons
                                            name={payment.method === 'ONLINE' ? "card" : "cash"}
                                            size={16}
                                            color={COLORS.textMuted}
                                        />
                                        <Text style={styles.historyMethodText}>{payment.method || "CASH"} PAYMENT</Text>
                                    </View>
                                    <View style={[
                                        styles.historyStatusBadge,
                                        { backgroundColor: payment.status === 'COMPLETED' ? COLORS.success + '15' : COLORS.warning + '15' }
                                    ]}>
                                        <Text style={[
                                            styles.historyStatusText,
                                            { color: payment.status === 'COMPLETED' ? COLORS.success : COLORS.warning }
                                        ]}>
                                            {payment.status}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.historyBody}>
                                    <View>
                                        <Text style={styles.historyAmount}>₹ {payment.amount.toLocaleString()}</Text>
                                        <Text style={styles.historyDate}>{payment.date ? format(new Date(payment.date), "MMMM d, yyyy") : "—"}</Text>
                                    </View>
                                    <View style={styles.historyActions}>
                                        {payment.status === 'COMPLETED' && (
                                            <TouchableOpacity
                                                style={styles.receiptBtn}
                                                onPress={() => handleViewReceipt(payment.receiptUrl || payment.invoiceUrl)}
                                            >
                                                <Ionicons name="download-outline" size={18} color={COLORS.primary} />
                                                <Text style={styles.receiptBtnText}>Receipt</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>

                                {payment.invoiceNumber && (
                                    <View style={styles.historyFooter}>
                                        <Ionicons name="document-text-outline" size={12} color={COLORS.textMuted} />
                                        <Text style={styles.invoiceText}>Invoice: {payment.invoiceNumber}</Text>
                                    </View>
                                )}
                            </Animated.View>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>You haven&apos;t made any payments yet.</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Payment Modal */}
            <Modal
                visible={showPayModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowPayModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
                    <Animated.View entering={FadeInUp} style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Secure Payment</Text>
                            <TouchableOpacity onPress={() => setShowPayModal(false)}>
                                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalLabel}>Amount to Pay</Text>
                        <View style={styles.inputContainer}>
                            <Text style={styles.currencyPrefix}>₹</Text>
                            <TextInput
                                style={styles.input}
                                value={payAmount}
                                onChangeText={setPayAmount}
                                keyboardType="numeric"
                                placeholder="0.00"
                                placeholderTextColor={COLORS.textMuted}
                            />
                        </View>

                        <View style={styles.modalAmountPreview}>
                            <View style={styles.amountDetail}>
                                <Text style={styles.amountLabel}>Base Amount</Text>
                                <Text style={styles.amountValue}>₹ {(parseFloat(payAmount) || 0).toLocaleString()}</Text>
                            </View>
                            <View style={styles.amountDetail}>
                                <Text style={styles.amountLabel}>Gateway Fee (2%)</Text>
                                <Text style={styles.amountValue}>+ ₹ {transactionFee.toFixed(2)}</Text>
                            </View>
                            <View style={[styles.amountDetail, styles.totalDetail]}>
                                <Text style={styles.totalLabel}>Grand Total</Text>
                                <Text style={styles.totalValue}>₹ {totalToPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                            </View>
                        </View>

                        {/* Test Mode Helper */}
                        {orderData?.keyId?.startsWith('rzp_test') && (
                            <View style={styles.testModeHelper}>
                                <View style={styles.testModeBadge}>
                                    <Ionicons name="flask" size={14} color="#FFFFFF" />
                                    <Text style={styles.testModeBadgeText}>RAZORPAY TEST MODE ACTIVE</Text>
                                </View>
                                <Text style={styles.testModeTitle}>Please use Test Credentials:</Text>
                                <View style={styles.testCredentialRow}>
                                    <Text style={styles.testCredentialLabel}>UPI:</Text>
                                    <Text style={styles.testCredentialValue}>success@razorpay</Text>
                                </View>
                                <View style={styles.testCredentialRow}>
                                    <Text style={styles.testCredentialLabel}>Card:</Text>
                                    <Text style={styles.testCredentialValue}>4111 1111 1111 1111 (OTP: 1234)</Text>
                                </View>
                                <Text style={styles.testModeWarning}>Real UPI IDs will fail with &quot;Please use another method&quot;.</Text>
                            </View>
                        )}
                        

                        <View style={styles.modalInfoBox}>
                            <Ionicons name="shield-checkmark" size={16} color={COLORS.primary} />
                            <Text style={styles.modalInfoText}>Secure Encryption via Razorpay</Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.modalPayBtn, isProcessing && styles.modalPayBtnDisabled]}
                            onPress={handleInitiatePayment}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <>
                                    <Text style={styles.modalPayBtnText}>Proceed to Checkout</Text>
                                    <Ionicons name="lock-closed" size={16} color="#FFFFFF" />
                                </>
                            )}
                        </TouchableOpacity>

                        <Text style={styles.modalFooterText}>
                            Instant receipt will be available after successful verification.
                        </Text>
                    </Animated.View>
                </View>
            </Modal>

            {/* Razorpay WebView */}
            {orderData && (
                <RazorpayCheckout
                    visible={showCheckout}
                    orderId={orderData.orderId}
                    keyId={orderData.keyId}
                    amount={orderData.amount}
                    currency={orderData.currency}
                    name="LearnXChain Fees"
                    description={`Fee Payment for ${feeData?.personalInfo?.name}`}
                    prefill={{
                        name: feeData?.personalInfo?.name,
                        email: feeData?.personalInfo?.email,
                        contact: feeData?.personalInfo?.phone
                    }}
                    onSuccess={handlePaymentSuccess}
                    onFailure={(error) => {
                        Alert.alert("Payment Failed", error.description || "The transaction was unsuccessful.");
                        setShowCheckout(false);
                    }}
                    onClose={() => setShowCheckout(false)}
                />
            )}

                        {user?.role === "parent" ? (
                <ParentBottomNav />
            ) : user?.role === "teacher" ? (
                <TeacherBottomNav />
            ) : (
                <BottomNav />
            )}
        </View>
    );
}

export default FeesPage;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    centerContent: {
        justifyContent: "center",
        alignItems: "center",
    },
    heroContainer: {
        padding: 16,
    },
    heroCard: {
        padding: 24,
        borderRadius: 32,
        elevation: 12,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    heroHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
    },
    heroIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroLabel: {
        fontSize: 14,
        fontFamily: "Inter_600SemiBold",
        color: 'rgba(255,255,255,0.9)',
        letterSpacing: 0.5,
    },
    heroValue: {
        fontSize: 36,
        fontFamily: "Inter_800ExtraBold",
        color: "#FFFFFF",
        marginVertical: 12,
    },
    heroActionBtn: {
        backgroundColor: "#FFFFFF",
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 8,
    },
    heroActionText: {
        fontSize: 15,
        fontFamily: "Inter_700Bold",
        color: COLORS.primary,
    },
    guidelinesContainer: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    guidelinesCard: {
        padding: 16,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderWidth: 1,
        borderColor: COLORS.primary + '20',
        overflow: 'hidden',
    },
    guidelinesHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    guidelinesTitle: {
        fontSize: 14,
        fontFamily: "Inter_700Bold",
        color: COLORS.textPrimary,
    },
    guidelineRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        marginBottom: 6,
    },
    guidelineDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.primary,
        marginTop: 6,
    },
    guidelineText: {
        flex: 1,
        fontSize: 12,
        fontFamily: "Inter_500Medium",
        color: COLORS.textSecondary,
        lineHeight: 18,
    },
    guidelineBold: {
        fontFamily: "Inter_700Bold",
        color: COLORS.primary,
    },
    statsGrid: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 12,
        marginBottom: 24,
    },
    statItem: {
        flex: 1,
        backgroundColor: COLORS.surface,
        padding: 16,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    statIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    statLabel: {
        fontSize: 12,
        fontFamily: "Inter_600SemiBold",
        color: COLORS.textMuted,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 16,
        fontFamily: "Inter_700Bold",
        color: COLORS.textPrimary,
    },
    section: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: "Inter_700Bold",
        color: COLORS.textPrimary,
        marginBottom: 16,
    },
    feeCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        padding: 20,
        borderRadius: 28,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 12,
        alignItems: 'center',
    },
    feeCardIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    feeCardContent: {
        flex: 1,
    },
    feeCardTitle: {
        fontSize: 16,
        fontFamily: "Inter_700Bold",
        color: COLORS.textPrimary,
    },
    feeCardDate: {
        fontSize: 12,
        fontFamily: "Inter_500Medium",
        color: COLORS.textMuted,
        marginTop: 2,
    },
    feeCardStatus: {
        fontSize: 11,
        fontFamily: "Inter_600SemiBold",
        color: COLORS.primary,
        marginTop: 4,
    },
    feeCardRight: {
        alignItems: 'flex-end',
    },
    feeCardAmount: {
        fontSize: 17,
        fontFamily: "Inter_800ExtraBold",
        color: COLORS.textPrimary,
    },
    statusBadge: {
        backgroundColor: COLORS.error + '10',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginTop: 4,
    },
    statusText: {
        fontSize: 10,
        fontFamily: "Inter_800ExtraBold",
        color: COLORS.error,
        letterSpacing: 0.5,
    },
    historyCard: {
        backgroundColor: COLORS.surface,
        padding: 20,
        borderRadius: 28,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 16,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    historyMethodContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    historyMethodText: {
        fontSize: 11,
        fontFamily: "Inter_700Bold",
        color: COLORS.textMuted,
        letterSpacing: 1,
    },
    historyStatusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    historyStatusText: {
        fontSize: 10,
        fontFamily: "Inter_800ExtraBold",
        letterSpacing: 0.5,
    },
    historyBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    historyAmount: {
        fontSize: 20,
        fontFamily: "Inter_800ExtraBold",
        color: COLORS.textPrimary,
    },
    historyDate: {
        fontSize: 12,
        fontFamily: "Inter_500Medium",
        color: COLORS.textMuted,
        marginTop: 4,
    },
    historyActions: {
        flexDirection: 'row',
        gap: 8,
    },
    receiptBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: COLORS.primary + '10',
    },
    receiptBtnText: {
        fontSize: 13,
        fontFamily: "Inter_700Bold",
        color: COLORS.primary,
    },
    historyFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    invoiceText: {
        fontSize: 11,
        fontFamily: "Inter_600SemiBold",
        color: COLORS.textMuted,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        backgroundColor: COLORS.surface,
        borderRadius: 28,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
    },
    emptyIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyStateText: {
        fontSize: 14,
        fontFamily: "Inter_500Medium",
        color: COLORS.textMuted,
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: 36,
        borderTopRightRadius: 36,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 44 : 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: "Inter_800ExtraBold",
        color: COLORS.textPrimary,
    },
    modalLabel: {
        fontSize: 13,
        fontFamily: "Inter_700Bold",
        color: COLORS.textMuted,
        marginBottom: 12,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        borderRadius: 20,
        paddingHorizontal: 20,
        borderWidth: 2,
        borderColor: COLORS.primary + '30',
        marginBottom: 16,
    },
    currencyPrefix: {
        fontSize: 24,
        fontFamily: "Inter_800ExtraBold",
        color: COLORS.textPrimary,
        marginRight: 8,
    },
    input: {
        flex: 1,
        height: 60,
        fontSize: 24,
        fontFamily: "Inter_800ExtraBold",
        color: COLORS.textPrimary,
    },
    modalAmountPreview: {
        backgroundColor: COLORS.background,
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.primary + '10',
    },
    amountDetail: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
    },
    amountLabel: {
        fontSize: 13,
        fontFamily: "Inter_500Medium",
        color: COLORS.textSecondary,
    },
    amountValue: {
        fontSize: 14,
        fontFamily: "Inter_700Bold",
        color: COLORS.textPrimary,
    },
    totalDetail: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    totalLabel: {
        fontSize: 15,
        fontFamily: "Inter_700Bold",
        color: COLORS.textPrimary,
    },
    totalValue: {
        fontSize: 20,
        fontFamily: "Inter_800ExtraBold",
        color: COLORS.primary,
    },
    testModeHelper: {
        backgroundColor: '#FFFBEB',
        borderRadius: 20,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#FEF3C7',
    },
    testModeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#D97706',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginBottom: 12,
    },
    testModeBadgeText: {
        fontSize: 10,
        fontFamily: "Inter_800ExtraBold",
        color: "#FFFFFF",
    },
    testModeTitle: {
        fontSize: 13,
        fontFamily: "Inter_700Bold",
        color: '#92400E',
        marginBottom: 8,
    },
    testCredentialRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 4,
    },
    testCredentialLabel: {
        fontSize: 12,
        fontFamily: "Inter_600SemiBold",
        color: '#B45309',
        width: 40,
    },
    testCredentialValue: {
        fontSize: 12,
        fontFamily: "Inter_700Bold",
        color: '#1F2937',
    },
    testModeWarning: {
        fontSize: 11,
        fontFamily: "Inter_500Medium",
        color: '#B45309',
        fontStyle: 'italic',
        marginTop: 8,
    },
    modalInfoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: COLORS.primary + '08',
        padding: 12,
        borderRadius: 12,
        marginBottom: 24,
    },
    modalInfoText: {
        fontSize: 12,
        fontFamily: "Inter_600SemiBold",
        color: COLORS.primary,
    },
    modalPayBtn: {
        backgroundColor: COLORS.primary,
        height: 60,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 16,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    modalPayBtnDisabled: {
        opacity: 0.6,
    },
    modalPayBtnText: {
        fontSize: 16,
        fontFamily: "Inter_700Bold",
        color: "#FFFFFF",
    },
    modalFooterText: {
        fontSize: 11,
        fontFamily: "Inter_400Regular",
        color: COLORS.textMuted,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
});
