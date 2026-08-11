import { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Platform,
    RefreshControl,
    ActivityIndicator,
    TouchableOpacity,
    Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { PageHeader } from "@/components/PageHeader";
import { DriverBottomNav } from "@/components/DriverBottomNav";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";
import { DriverDashboardData } from "@/lib/types/driver";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

interface RouteStop {
    id: string;
    name: string;
    latitude: number | null;
    longitude: number | null;
    students: { id: string }[];
}

export default function RoutePage() {
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stops, setStops] = useState<RouteStop[]>([]);
    const [routeName, setRouteName] = useState("Assigned Route");

    const fetchData = useCallback(async () => {
        try {
            const overview = await api.get<DriverDashboardData>("/api/v1/dashboard/driver/overview");
            const driverData = overview as any as DriverDashboardData;

            const routeId = driverData.activeTrip?.routeId || driverData.assignedRoute?.id;
            if (driverData.assignedRoute?.name) setRouteName(driverData.assignedRoute.name);

            if (routeId) {
                const stopsRes = await api.get<RouteStop[]>(`/api/v1/dashboard/driver/route?routeId=${routeId}`);
                setStops(stopsRes as any || []);
            }
        } catch (error) {
            console.error("Failed to fetch route data:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const openInMaps = (stop: RouteStop) => {
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = `${stop.latitude},${stop.longitude}`;
        const label = stop.name;
        const url = Platform.select({
            ios: `${scheme}${label}@${latLng}`,
            android: `${scheme}${latLng}(${label})`
        });

        if (url) {
            Linking.openURL(url);
        }
    };

    if (loading && !refreshing) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <PageHeader title="Route Sequence" subtitle={routeName.toUpperCase()} />

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: insets.bottom + 100 },
                ]}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={COLORS.primary} />}
            >
                {stops.length > 0 ? (
                    stops.map((stop, idx) => (
                        <Animated.View key={stop.id} entering={FadeInDown.delay(idx * 100)}>
                            <View style={styles.stopWrapper}>
                                {/* Timeline Component */}
                                <View style={styles.timelineContainer}>
                                    <LinearGradient
                                        colors={[COLORS.primary, COLORS.primaryLight]}
                                        style={styles.stepCircle}
                                    >
                                        <Text style={styles.stepIndexText}>{idx + 1}</Text>
                                    </LinearGradient>
                                    {idx < stops.length - 1 && <View style={styles.timelineLine} />}
                                </View>

                                {/* Content Card */}
                                <View style={styles.stopContentCard}>
                                    <View style={styles.stopInfo}>
                                        <Text style={styles.stopTitleText}>{stop.name}</Text>
                                        <View style={styles.passengerBadge}>
                                            <Ionicons name="people" size={14} color={COLORS.primary} />
                                            <Text style={styles.passengerText}>{stop.students.length} PASSENGERS</Text>
                                        </View>
                                    </View>
                                    
                                    <TouchableOpacity
                                        style={styles.navigationButton}
                                        onPress={() => openInMaps(stop)}
                                    >
                                        <LinearGradient
                                            colors={[COLORS.primary, '#4F46E5']}
                                            style={styles.navGradient}
                                        >
                                            <Ionicons name="navigate" size={18} color="#fff" />
                                        </LinearGradient>
                                        <Text style={styles.navButtonLabel}>GO</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Animated.View>
                    ))
                ) : (
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconCircle}>
                            <Ionicons name="map-outline" size={48} color={COLORS.textMuted} />
                        </View>
                        <Text style={styles.emptyHeading}>No Sequence Found</Text>
                        <Text style={styles.emptySubheading}>Check with dispatch for your assigned route sequence.</Text>
                    </View>
                )}
            </ScrollView>

            <DriverBottomNav />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    center: { justifyContent: "center", alignItems: "center" },
    scrollContent: { padding: 20 },

    stopWrapper: { flexDirection: 'row', gap: 20, marginBottom: 4 },
    timelineContainer: { alignItems: 'center', width: 32 },
    stepCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', zIndex: 2, elevation: 4, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
    stepIndexText: { fontSize: 14, fontFamily: 'Inter_800ExtraBold', color: '#fff' },
    timelineLine: { width: 3, flex: 1, backgroundColor: COLORS.primaryLight, marginVertical: -4, opacity: 0.5 },

    stopContentCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 24, padding: 18, marginBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 16, borderWidth: 1, borderColor: COLORS.border, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
    stopInfo: { flex: 1 },
    stopTitleText: { fontSize: 17, fontFamily: 'Inter_700Bold', color: COLORS.textPrimary, marginBottom: 6 },
    passengerBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primaryLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, alignSelf: 'flex-start' },
    passengerText: { fontSize: 10, fontFamily: 'Inter_800ExtraBold', color: COLORS.primary },

    navigationButton: { alignItems: 'center', gap: 6 },
    navGradient: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', elevation: 4 },
    navButtonLabel: { fontSize: 10, fontFamily: 'Inter_800ExtraBold', color: COLORS.primary },

    emptyContainer: { alignItems: 'center', marginTop: 100, gap: 16 },
    emptyIconCircle: { width: 84, height: 84, borderRadius: 32, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
    emptyHeading: { fontSize: 20, fontFamily: 'Inter_800ExtraBold', color: COLORS.textPrimary },
    emptySubheading: { fontSize: 14, fontFamily: 'Inter_400Regular', color: COLORS.textMuted, textAlign: 'center', paddingHorizontal: 40 },
});
