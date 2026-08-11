import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";

const { width } = Dimensions.get("window");

interface StatCardProps {
    label: string;
    value: string | number;
    icon: keyof typeof Ionicons.glyphMap;
    colors: string[];
    index: number;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, colors, index }) => {
    return (
        <Animated.View
            entering={FadeInDown.delay(index * 100).duration(600)}
            style={styles.cardWrapper}
        >
            <LinearGradient
                colors={colors as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statCard}
            >
                <View style={styles.cardContent}>
                    <View style={styles.iconContainer}>
                        <Ionicons name={icon} size={22} color="#FFFFFF" />
                    </View>
                    <View>
                        <Text style={styles.statValue}>{value}</Text>
                        <Text style={styles.statLabel}>{label}</Text>
                    </View>
                </View>
            </LinearGradient>
        </Animated.View>
    );
};

interface DashboardStatsProps {
    attendance: string | number;
    pendingHW: number;
    examsSoon: number;
    feeStatus: string | number;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
    attendance,
    pendingHW,
    examsSoon,
    feeStatus,
}) => {
    const statItems = [
        { label: "Attendance", value: attendance, icon: "checkbox-outline" as const, colors: COLORS.gradients.primary },
        { label: "Homework", value: pendingHW, icon: "document-text-outline" as const, colors: ["#F59E0B", "#D97706"] },
        { label: "Exams", value: examsSoon, icon: "ribbon-outline" as const, colors: ["#8B5CF6", "#6D28D9"] },
        { label: "Fees", value: feeStatus, icon: "card-outline" as const, colors: COLORS.gradients.secondary },
    ];

    return (
        <View style={styles.statsGrid}>
            {statItems.map((item, idx) => (
                <StatCard key={item.label} {...item} index={idx} />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        marginBottom: 24,
    },
    cardWrapper: {
        width: (width - 52) / 2,
        borderRadius: 20,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
    },
    statCard: {
        borderRadius: 20,
        padding: 16,
        height: 100,
        overflow: "hidden",
    },
    cardContent: {
        flex: 1,
        justifyContent: "space-between",
    },
    iconContainer: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: "rgba(255, 255, 255, 0.25)",
        alignItems: "center",
        justifyContent: "center",
    },
    statValue: {
        fontSize: 22,
        fontFamily: "Inter_700Bold",
        color: "#FFFFFF",
    },
    statLabel: {
        fontSize: 12,
        fontFamily: "Inter_500Medium",
        color: "rgba(255, 255, 255, 0.85)",
        marginTop: 2,
    },
});
