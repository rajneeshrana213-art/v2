import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

interface QuickActionProps {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    onPress: () => void;
}

export const QuickAction: React.FC<QuickActionProps> = ({ label, icon, color, onPress }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.92);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
    };

    return (
        <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onPress}
        >
            <Animated.View style={[styles.container, animatedStyle]}>
                <View style={[styles.iconBox, { backgroundColor: COLORS.surface }]}>
                    <View style={[styles.innerGlow, { backgroundColor: color + "10" }]} />
                    <Ionicons name={icon} size={26} color={color} />
                </View>
                <Text style={styles.label} numberOfLines={2}>{label}</Text>
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        width: "100%",
        gap: 10,
    },
    iconBox: {
        width: 60,
        height: 60,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: COLORS.cardShadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.8)",
        position: "relative",
        overflow: "hidden",
    },
    innerGlow: {
        position: "absolute",
        width: "100%",
        height: "100%",
    },
    label: {
        fontSize: 12,
        fontFamily: "Inter_600SemiBold",
        color: COLORS.textPrimary,
        textAlign: "center",
    },
});
