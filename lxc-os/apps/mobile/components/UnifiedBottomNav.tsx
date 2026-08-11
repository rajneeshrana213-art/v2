import React, { useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";
import { router, usePathname } from "expo-router";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  interpolate,
} from "react-native-reanimated";

export interface NavItem {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}

interface UnifiedBottomNavProps {
  items: NavItem[];
}

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 120,
  mass: 0.8,
};

const UnifiedNavItem: React.FC<{
  item: NavItem;
  active: boolean;
  itemWidth: number;
}> = ({ item, active, itemWidth }) => {
  const activeAnim = useSharedValue(active ? 1 : 0);
  
  useEffect(() => {
    activeAnim.value = withSpring(active ? 1 : 0, SPRING_CONFIG);
  }, [active]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(activeAnim.value, [0, 1], [1, 1.2]) },
      { translateY: interpolate(activeAnim.value, [0, 1], [0, -2]) },
    ],
    opacity: interpolate(activeAnim.value, [0, 1], [0.6, 1]),
  }));

  const animatedBubbleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: activeAnim.value }],
    opacity: activeAnim.value,
  }));

  const handlePress = () => {
    if (!active) {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      router.push(item.route as any);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.navItem, { width: itemWidth }]}
    >
      <View style={styles.iconWrapper}>
        <Animated.View style={[styles.bubble, animatedBubbleStyle]} />
        <Animated.View style={animatedIconStyle}>
          <Ionicons
            name={active ? (item.icon.replace("-outline", "") as any) : item.icon}
            size={26}
            color={active ? COLORS.primary : "#64748B"}
          />
        </Animated.View>
      </View>
      <Text
        numberOfLines={1}
        style={[styles.navLabel, active && styles.activeLabel]}
      >
        {item.label}
      </Text>
    </Pressable>
  );
};

export const UnifiedBottomNav: React.FC<UnifiedBottomNavProps> = ({ items }) => {
  const pathname = usePathname();
  const { width: windowWidth } = useWindowDimensions();
  
  const isLargeScreen = windowWidth > 768;
  const navWidth = isLargeScreen ? 560 : windowWidth * 0.92;
  const itemWidth = navWidth / items.length;

  const activeIndex = useMemo(() => {
    const exactIdx = items.findIndex((item) => pathname === item.route);
    if (exactIdx !== -1) return exactIdx;

    const matches = items
      .map((item, index) => ({
        index,
        route: item.route,
        match: pathname.startsWith(item.route) && item.route !== "/" && item.route !== "/dashboard",
      }))
      .filter((m) => m.match)
      .sort((a, b) => b.route.length - a.route.length);

    return matches.length > 0 ? matches[0].index : 0;
  }, [pathname, items]);

  return (
    <View style={[styles.container, { width: navWidth }]}>
      <BlurView intensity={Platform.OS === 'ios' ? 45 : 100} tint="light" style={styles.blurWrapper}>
        <View style={styles.content}>
          {items.map((item, index) => (
            <UnifiedNavItem
              key={item.route}
              item={item}
              active={activeIndex === index}
              itemWidth={itemWidth}
            />
          ))}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 34 : 24,
    alignSelf: "center",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.6)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.12,
        shadowRadius: 30,
      },
      android: {
        elevation: 12,
      },
      web: {
        boxShadow: "0 15px 45px rgba(0,0,0,0.1)",
      }
    }),
    overflow: "hidden",
  },
  blurWrapper: {
    paddingVertical: 12,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    height: 64,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  bubble: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(26, 115, 181, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(26, 115, 181, 0.15)",
  },
  navLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#64748B",
    opacity: 0.8,
  },
  activeLabel: {
    color: COLORS.primary,
    opacity: 1,
    fontFamily: "Inter_700Bold",
  },
});

