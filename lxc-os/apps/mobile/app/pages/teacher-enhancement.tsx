import { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    Pressable,
    Image,
   
    Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { api } from "@/lib/api";
import { COLORS } from "@/constants/colors";

// No unused Dimensions variables

export default function TeacherEnhancementPage() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"quiz" | "article">("quiz");
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true); else setLoading(true);
        try {
            // Reusing student endpoint for now but ideally teacher should have their own
            // For now, we show what's available in the hub
            const endpoint = activeTab === "quiz" ? "quiz" : "article";
            const res = await api.get(`api/v1/dashboard/student/enhancement?type=${endpoint}`);
            setData((res as any) || []);
        } catch (error) {
            console.error("Error fetching enhancement data:", error);
            Alert.alert("Error", "Failed to load content.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const renderHeader = () => (
        <LinearGradient
            colors={["#4F46E5", "#7C3AED"]}
            style={[styles.header, { paddingTop: insets.top + 20 }]}
        >
            <View style={styles.headerTop}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </Pressable>
                <View style={{ flex: 1, marginLeft: 16 }}>
                    <Text style={styles.headerTitle}>Enhancement Hub</Text>
                    <Text style={styles.headerSubtitle}>Manage quizzes & articles</Text>
                </View>
                <Pressable 
                    style={styles.addBtn}
                    onPress={() => Alert.alert("Coming Soon", "Creation from mobile is being implemented.")}
                >
                    <Ionicons name="add" size={24} color="#FFF" />
                </Pressable>
            </View>

            <View style={styles.tabContainer}>
                <Pressable 
                    onPress={() => setActiveTab("quiz")}
                    style={[styles.tab, activeTab === "quiz" && styles.activeTab]}
                >
                    <Text style={[styles.tabText, activeTab === "quiz" && styles.activeTabText]}>Quizzes</Text>
                </Pressable>
                <Pressable 
                    onPress={() => setActiveTab("article")}
                    style={[styles.tab, activeTab === "article" && styles.activeTab]}
                >
                    <Text style={[styles.tabText, activeTab === "article" && styles.activeTabText]}>Articles</Text>
                </Pressable>
            </View>
        </LinearGradient>
    );

    return (
        <View style={styles.container}>
            {renderHeader()}

            {loading && !refreshing ? (
                <View style={styles.centerBox}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} />
                    }
                >
                    {data.length > 0 ? (
                        data.map((item, idx) => (
                            <Animated.View 
                                key={item.id} 
                                entering={FadeInDown.delay(idx * 50)}
                                style={styles.itemCard}
                            >
                                <Image 
                                    source={{ uri: item.thumbnail || "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=200&auto=format&fit=crop" }} 
                                    style={styles.thumbnail}
                                />
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
                                    <View style={styles.itemMeta}>
                                        <Text style={styles.metaText}>{item.subject?.name || "General"}</Text>
                                        <View style={styles.dot} />
                                        <Text style={styles.metaText}>
                                            {activeTab === "quiz" ? `${item.questions?.length || 0} Qs` : "Article"}
                                        </Text>
                                    </View>
                                </View>
                                <Pressable 
                                    style={styles.menuBtn}
                                    onPress={() => Alert.alert("Actions", "What would you like to do?", [
                                        { text: "View Analytics" },
                                        { text: "Delete", style: "destructive" },
                                        { text: "Cancel", style: "cancel" }
                                    ])}
                                >
                                    <Ionicons name="ellipsis-vertical" size={18} color={COLORS.textMuted} />
                                </Pressable>
                            </Animated.View>
                        ))
                    ) : (
                        <View style={styles.emptyBox}>
                            <Ionicons name="documents-outline" size={64} color={COLORS.border} />
                            <Text style={styles.emptyText}>No {activeTab}s found</Text>
                            <Text style={styles.emptySub}>Create one to get started</Text>
                        </View>
                    )}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFC" },
    header: {
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTop: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    addBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 22,
        fontFamily: "Inter_700Bold",
        color: "#FFF",
    },
    headerSubtitle: {
        fontSize: 14,
        fontFamily: "Inter_400Regular",
        color: "rgba(255,255,255,0.8)",
    },
    tabContainer: {
        flexDirection: "row",
        backgroundColor: "rgba(255,255,255,0.15)",
        borderRadius: 12,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: "center",
        borderRadius: 10,
    },
    activeTab: {
        backgroundColor: "#FFF",
    },
    tabText: {
        fontSize: 14,
        fontFamily: "Inter_600SemiBold",
        color: "rgba(255,255,255,0.8)",
    },
    activeTabText: {
        color: "#4F46E5",
    },
    scrollContent: {
        padding: 20,
    },
    centerBox: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    itemCard: {
        flexDirection: "row",
        backgroundColor: "#FFF",
        borderRadius: 16,
        padding: 12,
        marginBottom: 12,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#F1F5F9",
    },
    thumbnail: {
        width: 60,
        height: 60,
        borderRadius: 12,
        backgroundColor: "#F1F5F9",
    },
    itemInfo: {
        flex: 1,
        marginLeft: 12,
    },
    itemTitle: {
        fontSize: 15,
        fontFamily: "Inter_700Bold",
        color: COLORS.textPrimary,
    },
    itemMeta: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    metaText: {
        fontSize: 12,
        fontFamily: "Inter_400Regular",
        color: COLORS.textMuted,
    },
    dot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: COLORS.border,
        marginHorizontal: 6,
    },
    menuBtn: {
        padding: 8,
    },
    emptyBox: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 80,
    },
    emptyText: {
        fontSize: 18,
        fontFamily: "Inter_700Bold",
        color: COLORS.textPrimary,
        marginTop: 16,
    },
    emptySub: {
        fontSize: 14,
        fontFamily: "Inter_400Regular",
        color: COLORS.textMuted,
        marginTop: 4,
    },
});
