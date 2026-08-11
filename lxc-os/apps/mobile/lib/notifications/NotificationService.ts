/**
 * NotificationService — Mobile FCM Integration
 * Uses expo-notifications (Expo dev-client + EAS builds).
 */

import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { router } from "expo-router";
import { api } from "@/lib/api";           // ← use api.post(), not named export
import Constants from "expo-constants";

// ─── Configure foreground behaviour ──────────────────────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert:  true,
    shouldPlaySound:  true,
    shouldSetBadge:   true,
    shouldShowBanner: true,
    shouldShowList:   true,
  }),
});

// ─── Deep link screen map ─────────────────────────────────────────────────────
const SCREEN_MAP: Record<string, string> = {
  fees:       "/pages/fees",
  homework:   "/pages/homework",
  attendance: "/pages/my-attendance",
  bus:        "/pages/bus-tracking",
  notices:    "/pages/notices",
  exams:      "/pages/exams",
  chat:       "/pages/communication",
  timetable:  "/pages/timetable",
  leaves:     "/pages/leave",
  results:    "/pages/exams",
};

export function getDeepLinkRoute(data?: Record<string, unknown>): string | null {
  const screen = data?.screen as string | undefined;
  if (!screen) return null;
  return SCREEN_MAP[screen] ?? null;
}

// ─── Permission ───────────────────────────────────────────────────────────────
async function requestPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

// ─── Token registration ───────────────────────────────────────────────────────
async function registerForPushNotifications(): Promise<string | null> {
  try {
    const hasPermission = await requestPermission();
    if (!hasPermission) {
      console.warn("[FCM] Push notification permission denied");
      return null;
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    let token: string | null = null;

    if (projectId) {
      const result = await Notifications.getExpoPushTokenAsync({ projectId });
      token = result.data;
    } else {
      // Raw device token (works with direct FCM in production builds)
      const result = await Notifications.getDevicePushTokenAsync();
      token = (result as { type: string; data: string }).data ?? null;
    }

    if (!token) return null;

    // Register with backend — fire-and-forget
    api.post("/api/v1/notification/register-token", {
      token,
      deviceInfo: Platform.OS,
    }).catch((err: unknown) =>
      console.warn("[FCM] Token registration failed:", err)
    );

    return token;
  } catch (err: unknown) {
    console.warn("[FCM] registerForPushNotifications error:", err);
    return null;
  }
}

// ─── Android channel (required for Android 8+) ───────────────────────────────
async function setupAndroidChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("default", {
    name:             "LearnXChain",
    importance:       Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor:       "#6366F1",
    sound:            "default",
    enableVibrate:    true,
    showBadge:        true,
  });
}

// ─── In-app notification fn (set by InAppNotification component) ──────────────
type InAppNotifyFn = (n: { title: string; body: string; data?: Record<string, any> }) => void;
let _notifyFn: InAppNotifyFn | null = null;

export function setInAppNotifyFn(fn: InAppNotifyFn) {
  _notifyFn = fn;
}

// ─── Foreground listener ──────────────────────────────────────────────────────
function setupForegroundHandler(): () => void {
  const sub = Notifications.addNotificationReceivedListener(notification => {
    const { title, body } = notification.request.content;
    const data = notification.request.content.data as Record<string, any>;
    if (_notifyFn && title && body) {
      _notifyFn({ title, body, data });
    }
  });
  return () => sub.remove();
}

// ─── Tap handler (background / killed state) ──────────────────────────────────
function setupNotificationResponseHandler(): () => void {
  const sub = Notifications.addNotificationResponseReceivedListener(response => {
    const data = response.notification.request.content.data as Record<string, unknown> | undefined;
    const route = getDeepLinkRoute(data);
    if (route) setTimeout(() => router.push(route as never), 500);
  });
  return () => sub.remove();
}

// ─── Handle app launched by tapping a notification ───────────────────────────
async function handleInitialNotification() {
  const initial = await Notifications.getLastNotificationResponseAsync();
  if (initial) {
    const data = initial.notification.request.content.data as Record<string, unknown> | undefined;
    const route = getDeepLinkRoute(data);
    if (route) setTimeout(() => router.push(route as never), 1000);
  }
}

// ─── Main init ───────────────────────────────────────────────────────────────
async function init(): Promise<void> {
  await setupAndroidChannel();
  await registerForPushNotifications();
  await handleInitialNotification();
}

const NotificationService = {
  init,
  requestPermission,
  registerForPushNotifications,
  setupForegroundHandler,
  setupNotificationResponseHandler,
  setInAppNotifyFn,
  getDeepLinkRoute,
};

export default NotificationService;
