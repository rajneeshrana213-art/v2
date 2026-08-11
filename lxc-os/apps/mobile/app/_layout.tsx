import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { useAppUpdateCheck } from "@/lib/use-app-update-check";
import { AppUpdateModal } from "@/components/AppUpdateModal";
import InAppNotification from "@/components/InAppNotification";
import NotificationService from "@/lib/notifications/NotificationService";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false, headerBackTitle: "Back" }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="forgot-password" />

      {/* Role dashboards */}
      <Stack.Screen name="dashboard/driver" />
      <Stack.Screen name="dashboard/student" />
      <Stack.Screen name="dashboard/teacher" />
      <Stack.Screen name="dashboard/parent" />

      {/* Admin tab screens */}
      <Stack.Screen name="dashboard/admin/index" />
      <Stack.Screen name="dashboard/admin/students" />
      <Stack.Screen name="dashboard/admin/teachers" />
      <Stack.Screen name="dashboard/admin/attendance" />
      <Stack.Screen name="dashboard/admin/finance" />
      <Stack.Screen name="dashboard/admin/more" />

      {/* Standard pages */}
      <Stack.Screen name="pages/attendance" />
      <Stack.Screen name="pages/exams" />
      <Stack.Screen name="pages/homework" />
      <Stack.Screen name="pages/leave" />
      <Stack.Screen name="pages/notices" />
      <Stack.Screen name="pages/profile" />
      <Stack.Screen name="pages/timetable" />
      <Stack.Screen name="pages/pyqs" />
      <Stack.Screen name="pages/enhancement" />
      <Stack.Screen name="pages/leaderboard" />
      <Stack.Screen name="pages/doubts" />
      <Stack.Screen name="pages/browse_books" />
      <Stack.Screen name="pages/my_books" />
      <Stack.Screen name="pages/fees" />
      <Stack.Screen name="pages/classes" />
      <Stack.Screen name="pages/student_leaves" />
      <Stack.Screen name="pages/pickup" />
      <Stack.Screen name="pages/route" />
      <Stack.Screen name="pages/quiz_detail" />
      <Stack.Screen name="pages/article_detail" />
      <Stack.Screen name="pages/communication" />
      <Stack.Screen name="pages/change_password" />
      <Stack.Screen name="pages/bus" />
      <Stack.Screen name="pages/teacher-attendance" />
      <Stack.Screen name="pages/teacher-homework" />
      <Stack.Screen name="pages/teacher-doubt-forum" />
      <Stack.Screen name="pages/teacher-pyq" />
      <Stack.Screen name="pages/my-attendance" />
      <Stack.Screen name="pages/homework-submissions" />

      {/* Admin pages — original 12 */}
      <Stack.Screen name="pages/admin-classes" />
      <Stack.Screen name="pages/admin-staff" />
      <Stack.Screen name="pages/admin-notices" />
      <Stack.Screen name="pages/admin-events" />
      <Stack.Screen name="pages/admin-leave" />
      <Stack.Screen name="pages/admin-exams" />
      <Stack.Screen name="pages/admin-transport" />
      <Stack.Screen name="pages/admin-settings" />
      <Stack.Screen name="pages/admin-hostel" />
      <Stack.Screen name="pages/admin-library" />
      <Stack.Screen name="pages/admin-alumni" />
      <Stack.Screen name="pages/admin-reports" />

      {/* Admin pages — new 10 */}
      <Stack.Screen name="pages/admin-subjects" />
      <Stack.Screen name="pages/admin-parents" />
      <Stack.Screen name="pages/admin-hrm" />
      <Stack.Screen name="pages/admin-timetable" />
      <Stack.Screen name="pages/admin-holidays" />
      <Stack.Screen name="pages/admin-tickets" />
      <Stack.Screen name="pages/admin-communication" />
      <Stack.Screen name="pages/admin-promotion" />
      <Stack.Screen name="pages/admin-feedback" />
      <Stack.Screen name="pages/admin-roles" />
      <Stack.Screen name="pages/admin-accounts" />
      <Stack.Screen name="pages/admin-membership" />
      <Stack.Screen name="pages/admin-documents" />
      <Stack.Screen name="pages/admin-registrations" />
      <Stack.Screen name="pages/admin-collect-fees" />
      <Stack.Screen name="pages/admin-fee-setup" />
      <Stack.Screen name="pages/admin-student-fees" />

      {/* Parent-specific pages */}
      <Stack.Screen name="pages/parent-attendance" />
      <Stack.Screen name="pages/parent-exams" />
      <Stack.Screen name="pages/parent-homework" />
      <Stack.Screen name="pages/parent-leave" />

      {/* Live tracking */}
      <Stack.Screen name="pages/live-tracking" />
    </Stack>
  );
}

/** Initialise push notifications once user is authenticated. */
function NotificationInit() {
  const { user } = useAuth();
  const initialised = useRef(false);

  useEffect(() => {
    if (!user || initialised.current) return;
    initialised.current = true;

    // Fire-and-forget: never block navigation
    NotificationService.init().catch(err =>
      console.warn("[FCM] init error:", err)
    );

    const removeForeground = NotificationService.setupForegroundHandler();
    const removeTap        = NotificationService.setupNotificationResponseHandler();

    return () => {
      removeForeground();
      removeTap();
    };
  }, [user]);

  return null;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Check for app updates on every launch (runs in background, never blocks startup)
  const { updateInfo } = useAppUpdateCheck();

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView>
          <KeyboardProvider>
            <AuthProvider>
              {/* FCM init — fires once after login, never blocks UI */}
              <NotificationInit />
              <RootLayoutNav />
              {/* In-app notification banner (foreground pushes) */}
              <InAppNotification />
              {/* Update prompt if a newer build is available */}
              {updateInfo?.updateAvailable && (
                <AppUpdateModal updateInfo={updateInfo} />
              )}
            </AuthProvider>
          </KeyboardProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
