import { useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  Dimensions,
  Image,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { COLORS } from "@/constants/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SIDEBAR_WIDTH = Math.min(SCREEN_WIDTH * 0.78, 320);

export interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

export interface SidebarItem {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  badge?: string;
  active?: boolean;
}

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
  sections: SidebarSection[];
  onItemPress: (key: string) => void;
  userName: string;
  userRole: string;
  activeItem?: string;
}

export function Sidebar({
  visible,
  onClose,
  sections,
  onItemPress,
  userName,
  userRole,
  activeItem,
}: SidebarProps) {
  const insets = useSafeAreaInsets();
  const translateX = useSharedValue(-SIDEBAR_WIDTH);
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateX.value = withTiming(0, { duration: 280 });
      overlayOpacity.value = withTiming(1, { duration: 280 });
    } else {
      translateX.value = withTiming(-SIDEBAR_WIDTH, { duration: 250 });
      overlayOpacity.value = withTiming(0, { duration: 250 });
    }
  }, [visible]);

  const sidebarStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const handleItemPress = useCallback(
    (key: string) => {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onItemPress(key);
    },
    [onItemPress]
  );

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[
          styles.sidebar,
          { width: SIDEBAR_WIDTH },
          sidebarStyle,
        ]}
      >
        <View
          style={[
            styles.sidebarHeader,
            { paddingTop: Platform.OS === "web" ? 67 + 16 : insets.top + 16 },
          ]}
        >
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.sidebarLogo}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.sidebarUserName}>{userName}</Text>
            <Text style={styles.sidebarUserRole}>{userRole}</Text>
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingBottom: Platform.OS === "web" ? 34 + 16 : insets.bottom + 16,
          }}
          showsVerticalScrollIndicator={false}
        >
          {sections.map((section) => (
            <View key={section.title} style={styles.sidebarSection}>
              <Text style={styles.sidebarSectionTitle}>{section.title}</Text>
              {section.items.map((item) => {
                const isActive = activeItem === item.key;
                return (
                  <Pressable
                    key={item.key}
                    style={[
                      styles.sidebarItem,
                      isActive && styles.sidebarItemActive,
                    ]}
                    onPress={() => handleItemPress(item.key)}
                  >
                    <Ionicons
                      name={item.icon}
                      size={20}
                      color={isActive ? COLORS.primary : COLORS.textSecondary}
                    />
                    <Text
                      style={[
                        styles.sidebarItemLabel,
                        isActive && styles.sidebarItemLabelActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {item.badge && (
                      <View style={styles.sidebarBadge}>
                        <Text style={styles.sidebarBadgeText}>{item.badge}</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
    zIndex: 998,
  },
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: COLORS.surface,
    zIndex: 999,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  sidebarHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sidebarLogo: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  sidebarUserName: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: COLORS.textPrimary,
  },
  sidebarUserRole: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: COLORS.textMuted,
    marginTop: 1,
  },
  sidebarSection: {
    paddingTop: 16,
    paddingHorizontal: 12,
  },
  sidebarSectionTitle: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    color: COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  sidebarItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 2,
  },
  sidebarItemActive: {
    backgroundColor: COLORS.primaryLight,
  },
  sidebarItemLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: COLORS.textSecondary,
  },
  sidebarItemLabelActive: {
    color: COLORS.primary,
    fontFamily: "Inter_600SemiBold",
  },
  sidebarBadge: {
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  sidebarBadgeText: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
});
