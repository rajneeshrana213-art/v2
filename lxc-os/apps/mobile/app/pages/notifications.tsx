import { useState, useCallback, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { format } from "date-fns";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";
import { TeacherBottomNav } from "@/components/TeacherBottomNav";
import { ParentBottomNav } from "@/components/ParentBottomNav";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/PageHeader";

interface Notification {
    id: string;
    message: string;
    type: string;
    status: string;
    createdAt: string;
}

export default function NotificationsPage() {
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true); else setLoading(true);
        try {
            const data = await api.get<Notification[]>("/api/v1/dashboard/notifications");
            setNotifications((data as any) || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getIcon = (type: string) => {
        switch (type) {
            case "EMAIL": return "mail-outline";
            case "SMS": return "chatbubble-outline";
            case "WHATSAPP": return "logo-whatsapp";
            case "FCM": return "notifications-outline";
            default: return "information-circle-outline";
        }
    };

    return (
        <View style={styles.container}>
            <PageHeader title="Notifications" subtitle="History of sent and received alerts" />

            {loading && !refreshing ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} />
                    }
                >
                    {notifications.length === 0 ? (
                        <View style={styles.empty}>
                            <Ionicons name="notifications-off-outline" size={64} color={COLORS.textMuted} />
                            <Text style={styles.emptyText}>No notification history</Text>
                        </View>
                    ) : (
                        notifications.map((notif, idx) => (
                            <Animated.View
                                key={notif.id}
                                entering={FadeInDown.delay(idx * 50)}
                                style={styles.card}
                            >
                                <View style={styles.iconContainer}>
                                    <Ionicons name={getIcon(notif.type)} size={24} color={COLORS.primary} />
                                </View>
                                <View style={styles.content}>
                                    <View style={styles.header}>
                                        <Text style={styles.type}>{notif.type}</Text>
                                        <Text style={styles.date}>{format(new Date(notif.createdAt), "MMM d, h:mm a")}</Text>
                                    </View>
                                    <Text style={styles.message}>{notif.message}</Text>
                                    <View style={[styles.statusBadge, { backgroundColor: notif.status === "SENT" ? "#ECFDF5" : "#FEF2F2" }]}>
                                        <Text style={[styles.statusText, { color: notif.status === "SENT" ? "#10B981" : "#EF4444" }]}>
                                            {notif.status}
                                        </Text>
                                    </View>
                                </View>
                            </Animated.View>
                        ))
                    )}
                </ScrollView>
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

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFF" },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    scrollView: { flex: 1 },
    scrollContent: { padding: 16 },
    card: {
        backgroundColor: "#FFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: "row",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.primaryLight,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    content: { flex: 1 },
    header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
    type: { fontSize: 12, fontFamily: "Inter_700Bold", color: COLORS.primary, textTransform: "uppercase" },
    date: { fontSize: 11, color: COLORS.textMuted },
    message: { fontSize: 14, color: COLORS.textPrimary, lineHeight: 20, marginBottom: 8 },
    statusBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    statusText: { fontSize: 10, fontFamily: "Inter_700Bold" },
    empty: { alignItems: "center", marginTop: 100 },
    emptyText: { fontSize: 16, color: COLORS.textMuted, marginTop: 16 },
});
