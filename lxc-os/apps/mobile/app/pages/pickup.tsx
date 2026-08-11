import { useState, useEffect, useCallback, useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Platform,
    RefreshControl,
    ActivityIndicator,
    Pressable,
    TouchableOpacity,
    Alert,
    Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { PageHeader } from "@/components/PageHeader";
import { DriverBottomNav } from "@/components/DriverBottomNav";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";
import { DriverDashboardData, Trip } from "@/lib/types/driver";
import { BlurView } from "expo-blur";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

interface StudentPickup {
    id: string;
    name: string;
    stopName: string;
    parentPhone: string;
    status?: "BOARDED" | "ALIGHTED" | "MISSED" | "PENDING";
}

export default function PickupPage() {
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState<{ students: StudentPickup[]; tripId: string | null }>({ students: [], tripId: null });
    const [activeTrip, setActiveTrip] = useState<Trip | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const overview = await api.get<DriverDashboardData>("/api/v1/dashboard/driver/overview");
            const driverData = overview as any as DriverDashboardData;
            setActiveTrip(driverData.activeTrip);

            const routeId = driverData.activeTrip?.routeId || driverData.assignedRoute?.id;

            if (routeId) {
                const studentsRes = await api.get<StudentPickup[]>(`/api/v1/dashboard/driver/pickup?routeId=${routeId}`);
                const students = studentsRes as any as StudentPickup[];

                let mergedStudents = students.map(s => ({ ...s, status: "PENDING" as const }));

                if (driverData.activeTrip?.busAttendance) {
                    const attendanceMap = new Map();
                    driverData.activeTrip.busAttendance.forEach((a: any) => attendanceMap.set(a.studentId, a.status));
                    mergedStudents = mergedStudents.map(s => ({
                        ...s,
                        status: (attendanceMap.get(s.id) || "PENDING") as any
                    }));
                }

                setData({ students: mergedStudents, tripId: driverData.activeTrip?.id || null });
            }
        } catch (error) {
            console.error("Failed to fetch pickup data:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const updateStatus = async (studentId: string, status: string) => {
        if (!data.tripId) {
            Alert.alert("No Active Trip", "Please start a trip from the dashboard first.");
            return;
        }

        if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        try {
            await api.patch("/api/v1/dashboard/driver/pickup", {
                tripId: data.tripId,
                studentId,
                status
            });

            setData(prev => ({
                ...prev,
                students: prev.students.map(s => s.id === studentId ? { ...s, status: status as any } : s)
            }));
        } catch {
            Alert.alert("Update Failed", "Could not update student status.");
        }
    };

    const stats = useMemo(() => {
        const total = data.students.length;
        const boarded = data.students.filter(s => s.status === "BOARDED").length;
        const alighted = data.students.filter(s => s.status === "ALIGHTED").length;
        const missed = data.students.filter(s => s.status === "MISSED").length;
        const done = activeTrip?.type === 'MORNING' ? boarded : alighted;
        return { total, done, missed };
    }, [data.students, activeTrip]);

    if (loading && !refreshing) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <PageHeader 
                title="Student Manifest" 
                subtitle={activeTrip ? `${activeTrip.type} SHIFT ACTIVE` : "CHECKLIST"} 
            />

            {/* Premium Stats Bar */}
            <Animated.View entering={FadeInUp} style={styles.statsContainer}>
                <BlurView intensity={30} tint="light" style={styles.statsBlur}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>TOTAL</Text>
                        <Text style={styles.statValue}>{stats.total}</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statLabel, { color: COLORS.success }]}>{activeTrip?.type === 'MORNING' ? 'PICKED' : 'DROPPED'}</Text>
                        <Text style={[styles.statValue, { color: COLORS.success }]}>{stats.done}</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statLabel, { color: COLORS.error }]}>MISSED</Text>
                        <Text style={[styles.statValue, { color: COLORS.error }]}>{stats.missed}</Text>
                    </View>
                </BlurView>
            </Animated.View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: insets.bottom + 100 },
                ]}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={COLORS.primary} />}
            >
                {data.students.length > 0 ? (
                    data.students.map((student, idx) => {
                        const isMorning = activeTrip?.type === 'MORNING';
                        const isDone = student.status === (isMorning ? 'BOARDED' : 'ALIGHTED');
                        const isMissed = student.status === 'MISSED';

                        return (
                            <Animated.View key={student.id} entering={FadeInDown.delay(idx * 50)}>
                                <View style={[styles.studentCard, isDone && styles.cardDone, isMissed && styles.cardMissed]}>
                                    <View style={styles.cardHeader}>
                                        <View style={[styles.avatarBox, { backgroundColor: isDone ? COLORS.success + '15' : isMissed ? COLORS.error + '15' : COLORS.primaryLight }]}>
                                            <Text style={[styles.avatarText, { color: isDone ? COLORS.success : isMissed ? COLORS.error : COLORS.primary }]}>
                                                {student.name.charAt(0)}
                                            </Text>
                                        </View>
                                        <View style={styles.studentInfo}>
                                            <Text style={styles.studentNameText}>{student.name}</Text>
                                            <View style={styles.stopRow}>
                                                <Ionicons name="location-sharp" size={12} color={COLORS.textMuted} />
                                                <Text style={styles.stopNameText}>{student.stopName}</Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity
                                            style={styles.contactBtn}
                                            onPress={() => {
                                                if (student.parentPhone && student.parentPhone !== "---") {
                                                    Linking.openURL(`tel:${student.parentPhone}`);
                                                } else {
                                                    Alert.alert("Notice", "Emergency contact not registered.");
                                                }
                                            }}
                                        >
                                            <Ionicons name="call" size={20} color={COLORS.primary} />
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.actionButtons}>
                                        <Pressable
                                            style={({ pressed }) => [
                                                styles.actionBtn,
                                                styles.checkBtn,
                                                isDone && styles.btnActiveSuccess,
                                                pressed && { opacity: 0.8 }
                                            ]}
                                            onPress={() => updateStatus(student.id, isMorning ? 'BOARDED' : 'ALIGHTED')}
                                        >
                                            <Ionicons 
                                                name={isMorning ? "bus" : "home"} 
                                                size={18} 
                                                color={isDone ? "#fff" : COLORS.success} 
                                            />
                                            <Text style={[styles.btnText, isDone && { color: '#fff' }]}>
                                                {isMorning ? 'Picked Up' : 'Dropped'}
                                            </Text>
                                        </Pressable>

                                        <Pressable
                                            style={({ pressed }) => [
                                                styles.actionBtn,
                                                styles.missBtn,
                                                isMissed && styles.btnActiveError,
                                                pressed && { opacity: 0.8 }
                                            ]}
                                            onPress={() => updateStatus(student.id, "MISSED")}
                                        >
                                            <Ionicons 
                                                name="close-circle" 
                                                size={18} 
                                                color={isMissed ? "#fff" : COLORS.error} 
                                            />
                                            <Text style={[styles.btnText, isMissed && { color: '#fff' }]}>Missed</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            </Animated.View>
                        );
                    })
                ) : (
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconBox}>
                            <Ionicons name="people-outline" size={48} color={COLORS.textMuted} />
                        </View>
                        <Text style={styles.emptyTitleText}>No Students</Text>
                        <Text style={styles.emptySubText}>There are no students assigned to this route manifest.</Text>
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
    
    statsContainer: { marginHorizontal: 20, marginTop: 10, borderRadius: 24, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
    statsBlur: { flexDirection: 'row', padding: 20, alignItems: 'center', justifyContent: 'space-around', backgroundColor: 'rgba(255,255,255,0.7)' },
    statItem: { alignItems: 'center' },
    statLabel: { fontSize: 10, fontFamily: 'Inter_800ExtraBold', color: COLORS.textSecondary, letterSpacing: 1, marginBottom: 4 },
    statValue: { fontSize: 24, fontFamily: 'Inter_800ExtraBold', color: COLORS.textPrimary },
    statDivider: { width: 1, height: 30, backgroundColor: COLORS.border },

    studentCard: { backgroundColor: COLORS.surface, borderRadius: 28, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, elevation: 2 },
    cardDone: { borderColor: COLORS.success + '40', backgroundColor: COLORS.success + '05' },
    cardMissed: { borderColor: COLORS.error + '40', backgroundColor: COLORS.error + '05' },
    
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 18 },
    avatarBox: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 22, fontFamily: 'Inter_800ExtraBold' },
    studentInfo: { flex: 1 },
    studentNameText: { fontSize: 17, fontFamily: 'Inter_700Bold', color: COLORS.textPrimary },
    stopRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    stopNameText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: COLORS.textSecondary },
    contactBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },

    actionButtons: { flexDirection: 'row', gap: 12 },
    actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 18, borderWidth: 1 },
    checkBtn: { borderColor: COLORS.success + '30', backgroundColor: COLORS.success + '10' },
    missBtn: { borderColor: COLORS.error + '30', backgroundColor: COLORS.error + '10' },
    btnActiveSuccess: { backgroundColor: COLORS.success, borderColor: COLORS.success },
    btnActiveError: { backgroundColor: COLORS.error, borderColor: COLORS.error },
    btnText: { fontSize: 14, fontFamily: 'Inter_700Bold', color: COLORS.textPrimary },

    emptyContainer: { alignItems: 'center', marginTop: 100, gap: 16 },
    emptyIconBox: { width: 80, height: 80, borderRadius: 30, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
    emptyTitleText: { fontSize: 20, fontFamily: 'Inter_800ExtraBold', color: COLORS.textPrimary },
    emptySubText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: COLORS.textMuted, textAlign: 'center', paddingHorizontal: 40 },
});
