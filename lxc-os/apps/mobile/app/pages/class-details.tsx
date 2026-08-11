import { useState, useCallback, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    RefreshControl,
    ActivityIndicator,
    Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { router, useLocalSearchParams } from "expo-router";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";
import { format } from "date-fns";

// No unused Dimensions variables

interface Student {
    id: string;
    rollNo: string;
    user: {
        name: string;
        profilePic: string | null;
        email: string;
    };
}

interface ScheduleItem {
    day: string;
    startTime: string;
    endTime: string;
    subject: string;
}

export default function ClassDetailsPage() {
    const insets = useSafeAreaInsets();
    const { id, name } = useLocalSearchParams();
    const [activeTab, setActiveTab] = useState<"students" | "schedule">("students");
    const [students, setStudents] = useState<Student[]>([]);
    const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true); else setLoading(true);
        try {
            const [studentsRes, timetableRes] = await Promise.all([
                api.get(`/api/v1/dashboard/teacher/attendance/students?classId=${id}`),
                api.get("/api/v1/dashboard/teacher/timetable")
            ]);

            setStudents((studentsRes as any) || []);
            
            // Filter timetable for this class
            const fullTimetable = (timetableRes as any) || [];
            const classSchedule = fullTimetable.filter((item: any) => item.class === name);
            setSchedule(classSchedule);
        } catch (e) {
            console.error("Failed to fetch class details:", e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [id, name]);

    useEffect(() => {
        if (id) fetchData();
    }, [fetchData, id]);

    const renderHeader = () => (
        <LinearGradient
            colors={[COLORS.primary, "#6366F1"]}
            style={[styles.header, { paddingTop: insets.top + 20 }]}
        >
            <View style={styles.headerTop}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </Pressable>
                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle}>{name}</Text>
                    <Text style={styles.headerSubtitle}>Class Details & Students</Text>
                </View>
            </View>

            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{students.length}</Text>
                    <Text style={styles.statLabel}>Students</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{schedule.length}</Text>
                    <Text style={styles.statLabel}>Lessons/Wk</Text>
                </View>
            </View>
        </LinearGradient>
    );

    const renderTabs = () => (
        <View style={styles.tabsContainer}>
            <Pressable
                onPress={() => setActiveTab("students")}
                style={[styles.tab, activeTab === "students" && styles.activeTab]}
            >
                <Ionicons 
                    name="people" 
                    size={20} 
                    color={activeTab === "students" ? COLORS.primary : COLORS.textMuted} 
                />
                <Text style={[styles.tabText, activeTab === "students" && styles.activeTabText]}>
                    Students
                </Text>
            </Pressable>
            <Pressable
                onPress={() => setActiveTab("schedule")}
                style={[styles.tab, activeTab === "schedule" && styles.activeTab]}
            >
                <Ionicons 
                    name="calendar" 
                    size={20} 
                    color={activeTab === "schedule" ? COLORS.primary : COLORS.textMuted} 
                />
                <Text style={[styles.tabText, activeTab === "schedule" && styles.activeTabText]}>
                    Schedule
                </Text>
            </Pressable>
        </View>
    );

    return (
        <View style={styles.container}>
            {renderHeader()}
            {renderTabs()}

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
                    {activeTab === "students" ? (
                        <View style={styles.listContainer}>
                            {students.length > 0 ? (
                                students.map((student, idx) => (
                                    <Animated.View 
                                        key={student.id}
                                        entering={FadeInDown.delay(idx * 50)}
                                    >
                                        <Pressable 
                                            onPress={() => router.push({ pathname: "/pages/student-analytics", params: { id: student.id } } as any)}
                                            style={({ pressed }) => [styles.studentCard, pressed && { opacity: 0.7 }]}
                                        >
                                            <View style={styles.rollNoBox}>
                                                <Text style={styles.rollNoText}>{student.rollNo}</Text>
                                            </View>
                                            <Image 
                                                source={{ uri: student.user.profilePic || "https://ui-avatars.com/api/?name=" + student.user.name }} 
                                                style={styles.avatar} 
                                            />
                                            <View style={styles.studentInfo}>
                                                <Text style={styles.studentName}>{student.user.name}</Text>
                                                <Text style={styles.studentEmail}>{student.user.email}</Text>
                                            </View>
                                            <Ionicons name="chevron-forward" size={16} color={COLORS.border} />
                                        </Pressable>
                                    </Animated.View>
                                ))
                            ) : (
                                <View style={styles.emptyBox}>
                                    <Ionicons name="people-outline" size={48} color={COLORS.border} />
                                    <Text style={styles.emptyText}>No students found</Text>
                                </View>
                            )}
                        </View>
                    ) : (
                        <View style={styles.listContainer}>
                            {schedule.length > 0 ? (
                                schedule.map((item, idx) => (
                                    <Animated.View 
                                        key={idx}
                                        entering={FadeInRight.delay(idx * 50)}
                                        style={styles.scheduleItem}
                                    >
                                        <View style={styles.dayBadge}>
                                            <Text style={styles.dayText}>{item.day.substring(0, 3)}</Text>
                                        </View>
                                        <View style={styles.lessonInfo}>
                                            <Text style={styles.subjectText}>{item.subject}</Text>
                                            <Text style={styles.timeText}>
                                                {format(new Date(item.startTime), "p")} - {format(new Date(item.endTime), "p")}
                                            </Text>
                                        </View>
                                        <Ionicons name="time-outline" size={18} color={COLORS.primary} />
                                    </Animated.View>
                                ))
                            ) : (
                                <View style={styles.emptyBox}>
                                    <Ionicons name="calendar-outline" size={48} color={COLORS.border} />
                                    <Text style={styles.emptyText}>No lessons scheduled</Text>
                                </View>
                            )}
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
        paddingBottom: 24,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
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
    headerInfo: { marginLeft: 16 },
    headerTitle: {
        fontSize: 24,
        fontFamily: "Inter_700Bold",
        color: "#FFF",
    },
    headerSubtitle: {
        fontSize: 14,
        fontFamily: "Inter_400Regular",
        color: "rgba(255,255,255,0.8)",
    },
    statsRow: {
        flexDirection: "row",
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
    },
    statItem: { flex: 1, alignItems: "center" },
    statValue: {
        fontSize: 18,
        fontFamily: "Inter_700Bold",
        color: "#FFF",
    },
    statLabel: {
        fontSize: 10,
        fontFamily: "Inter_500Medium",
        color: "rgba(255,255,255,0.7)",
        textTransform: "uppercase",
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 24,
        backgroundColor: "rgba(255,255,255,0.2)",
    },
    tabsContainer: {
        flexDirection: "row",
        padding: 6,
        backgroundColor: "#FFF",
        marginHorizontal: 20,
        marginTop: -25,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    tab: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    activeTab: {
        backgroundColor: "#EEF2FF",
    },
    tabText: {
        fontSize: 14,
        fontFamily: "Inter_600SemiBold",
        color: COLORS.textMuted,
    },
    activeTabText: {
        color: COLORS.primary,
    },
    scrollContent: {
        padding: 20,
        paddingTop: 10,
    },
    centerBox: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    listContainer: { gap: 12 },
    studentCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF",
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#F1F5F9",
    },
    rollNoBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: "#F1F5F9",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    rollNoText: {
        fontSize: 12,
        fontFamily: "Inter_700Bold",
        color: COLORS.textPrimary,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#F1F5F9",
    },
    studentInfo: {
        flex: 1,
        marginLeft: 12,
    },
    studentName: {
        fontSize: 15,
        fontFamily: "Inter_700Bold",
        color: COLORS.textPrimary,
    },
    studentEmail: {
        fontSize: 12,
        fontFamily: "Inter_400Regular",
        color: COLORS.textMuted,
        marginTop: 2,
    },
    scheduleItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF",
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#F1F5F9",
    },
    dayBadge: {
        width: 45,
        height: 45,
        borderRadius: 12,
        backgroundColor: "#EEF2FF",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    dayText: {
        fontSize: 14,
        fontFamily: "Inter_700Bold",
        color: COLORS.primary,
        textTransform: "uppercase",
    },
    lessonInfo: { flex: 1 },
    subjectText: {
        fontSize: 16,
        fontFamily: "Inter_700Bold",
        color: COLORS.textPrimary,
    },
    timeText: {
        fontSize: 13,
        fontFamily: "Inter_400Regular",
        color: COLORS.textMuted,
        marginTop: 4,
    },
    emptyBox: {
        alignItems: "center",
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        fontFamily: "Inter_500Medium",
        color: COLORS.textMuted,
        marginTop: 12,
    },
});
