import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Linking,
  Dimensions,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn, FadeInDown, SlideInUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { UpdateInfo } from "@/lib/use-app-update-check";

const { width } = Dimensions.get("window");

interface AppUpdateModalProps {
  updateInfo: UpdateInfo;
}

export function AppUpdateModal({ updateInfo }: AppUpdateModalProps) {
  const [visible, setVisible] = useState(true);

  const { isForceUpdate, currentVersion, clientVersion, downloadUrl, whatsNew } = updateInfo;

  const handleUpdate = async () => {
    try {
      await Linking.openURL(downloadUrl);
    } catch {
      // If store link can't open, do nothing
    }
  };

  const handleDismiss = () => {
    if (!isForceUpdate) setVisible(false);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleDismiss}
    >
      {/* Blurred backdrop */}
      <Animated.View entering={FadeIn.duration(300)} style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleDismiss} />

        <Animated.View entering={SlideInUp.springify().damping(18).stiffness(120)} style={styles.sheet}>
          {/* Top gradient strip */}
          <LinearGradient
            colors={["#4F46E5", "#7C3AED"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBar}
          >
            {/* Icon */}
            <View style={styles.iconCircle}>
              <Ionicons name="rocket-outline" size={34} color="#fff" />
            </View>

            {/* Close button — only for optional updates */}
            {!isForceUpdate && (
              <Pressable onPress={handleDismiss} style={styles.closeBtn} hitSlop={12}>
                <Ionicons name="close" size={20} color="rgba(255,255,255,0.8)" />
              </Pressable>
            )}
          </LinearGradient>

          {/* Content */}
          <Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.body}>
            {/* Badge */}
            <View style={[styles.badge, isForceUpdate ? styles.badgeForce : styles.badgeOptional]}>
              <Ionicons
                name={isForceUpdate ? "alert-circle" : "arrow-up-circle-outline"}
                size={13}
                color={isForceUpdate ? "#EF4444" : "#4F46E5"}
              />
              <Text style={[styles.badgeText, isForceUpdate ? styles.badgeTextForce : styles.badgeTextOptional]}>
                {isForceUpdate ? "Required Update" : "New Update Available"}
              </Text>
            </View>

            <Text style={styles.title}>
              {isForceUpdate ? "Update Required" : "LearnXChain v" + currentVersion}
            </Text>
            <Text style={styles.subtitle}>
              {isForceUpdate
                ? "Your version is no longer supported. Please update to continue."
                : "A new version is available with improvements and bug fixes."}
            </Text>

            {/* Version row */}
            <View style={styles.versionRow}>
              <View style={styles.versionChip}>
                <Text style={styles.versionLabel}>Current</Text>
                <Text style={styles.versionNum}>v{clientVersion}</Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color="#94A3B8" />
              <View style={[styles.versionChip, styles.versionChipNew]}>
                <Text style={[styles.versionLabel, { color: "#4F46E5" }]}>Latest</Text>
                <Text style={[styles.versionNum, { color: "#4F46E5" }]}>v{currentVersion}</Text>
              </View>
            </View>

            {/* What's new */}
            {!!whatsNew && (
              <View style={styles.whatsNewBox}>
                <View style={styles.whatsNewHeader}>
                  <Ionicons name="sparkles" size={14} color="#7C3AED" />
                  <Text style={styles.whatsNewTitle}>What's new</Text>
                </View>
                <Text style={styles.whatsNewText}>{whatsNew}</Text>
              </View>
            )}

            {/* CTA Button */}
            <Pressable
              onPress={handleUpdate}
              style={({ pressed }) => [styles.updateBtn, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
            >
              <LinearGradient
                colors={["#4F46E5", "#7C3AED"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.updateBtnGradient}
              >
                <Ionicons name="download-outline" size={18} color="#fff" />
                <Text style={styles.updateBtnText}>
                  {Platform.OS === "ios" ? "Update on App Store" : "Update on Play Store"}
                </Text>
              </LinearGradient>
            </Pressable>

            {/* Skip button — only for optional updates */}
            {!isForceUpdate && (
              <Pressable onPress={handleDismiss} style={styles.skipBtn}>
                <Text style={styles.skipText}>Maybe later</Text>
              </Pressable>
            )}
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
    width: "100%",
    paddingBottom: Platform.OS === "ios" ? 34 : 24,
  },
  gradientBar: {
    height: 160,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.35)",
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 16,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeOptional: { backgroundColor: "#EEF2FF" },
  badgeForce:    { backgroundColor: "#FEF2F2" },
  badgeText:     { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  badgeTextOptional: { color: "#4F46E5" },
  badgeTextForce:    { color: "#EF4444" },

  title: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#64748B",
    lineHeight: 21,
  },

  versionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  versionChip: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  versionChipNew: {
    backgroundColor: "#EEF2FF",
    borderColor: "#C7D2FE",
  },
  versionLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: "#94A3B8",
    marginBottom: 2,
  },
  versionNum: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#1E293B",
  },

  whatsNewBox: {
    backgroundColor: "#F8FAFF",
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: "#7C3AED",
    gap: 6,
  },
  whatsNewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  whatsNewTitle: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    color: "#7C3AED",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  whatsNewText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#475569",
    lineHeight: 19,
  },

  updateBtn: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 4,
  },
  updateBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
  },
  updateBtnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },

  skipBtn: {
    alignItems: "center",
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#94A3B8",
  },
});
