/**
 * InAppNotification — Custom foreground push notification banner
 *
 * Slides in from the top when a push arrives while the app is open.
 * Auto-dismisses after 4 seconds. Tappable to deep-link to the target screen.
 *
 * USAGE in _layout.tsx:
 *   import InAppNotification, { showInAppNotification } from "@/components/InAppNotification";
 *   // Register the show function with NotificationService:
 *   NotificationService.setInAppNotifyFn(showInAppNotification);
 *   // Render once in the root layout:
 *   <InAppNotification />
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import NotificationService from "@/lib/notifications/NotificationService";

interface NotificationData {
  title: string;
  body:  string;
  data?: Record<string, any>;
}

// Global setter — NotificationService calls this to show the banner
let _setGlobalNotification: ((n: NotificationData | null) => void) | null = null;

export function showInAppNotification(n: NotificationData) {
  _setGlobalNotification?.(n);
}

export default function InAppNotification() {
  const insets     = useSafeAreaInsets();
  const [current, setCurrent] = useState<NotificationData | null>(null);
  const translateY = useRef(new Animated.Value(-120)).current;
  const timer      = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Register with the global setter
  useEffect(() => {
    _setGlobalNotification = setCurrent;
    return () => { _setGlobalNotification = null; };
  }, []);

  // Register with NotificationService
  useEffect(() => {
    NotificationService.setInAppNotifyFn(showInAppNotification);
  }, []);

  const dismiss = useCallback(() => {
    Animated.timing(translateY, {
      toValue:         -120,
      duration:        300,
      useNativeDriver: true,
    }).start(() => setCurrent(null));
    if (timer.current) clearTimeout(timer.current);
  }, [translateY]);

  useEffect(() => {
    if (!current) return;

    // Slide in
    Animated.spring(translateY, {
      toValue:         0,
      useNativeDriver: true,
      tension:         80,
      friction:        10,
    }).start();

    // Auto-dismiss after 4s
    timer.current = setTimeout(dismiss, 4000);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [current, dismiss, translateY]);

  if (!current) return null;

  const handleTap = () => {
    const route = NotificationService.getDeepLinkRoute(current.data);
    dismiss();
    if (route) setTimeout(() => router.push(route as any), 300);
  };

  const topOffset = insets.top + (Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) : 0);

  return (
    <Animated.View
      style={[styles.container, { top: topOffset, transform: [{ translateY }] }]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.92}
        onPress={handleTap}
      >
        {/* Icon circle */}
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>🔔</Text>
        </View>

        {/* Text */}
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>{current.title}</Text>
          <Text style={styles.body}  numberOfLines={2}>{current.body}</Text>
        </View>

        {/* Dismiss X */}
        <TouchableOpacity onPress={dismiss} style={styles.closeBtn} hitSlop={12}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position:  "absolute",
    left:      12,
    right:     12,
    zIndex:    9999,
  },
  card: {
    flexDirection:    "row",
    alignItems:       "center",
    backgroundColor:  "#1e1b4b",  // deep indigo
    borderRadius:     16,
    paddingVertical:  12,
    paddingHorizontal: 14,
    shadowColor:      "#000",
    shadowOffset:     { width: 0, height: 6 },
    shadowOpacity:    0.25,
    shadowRadius:     12,
    elevation:        10,
    gap:              10,
  },
  iconCircle: {
    width:           40,
    height:          40,
    borderRadius:    20,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems:      "center",
    justifyContent:  "center",
  },
  iconText: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize:   14,
    fontWeight: "700",
    color:      "#e0e7ff",
    marginBottom: 2,
  },
  body: {
    fontSize:  12,
    color:     "#a5b4fc",
    lineHeight: 17,
  },
  closeBtn: {
    padding: 4,
  },
  closeText: {
    color:    "#818cf8",
    fontSize: 14,
    fontWeight: "600",
  },
});
