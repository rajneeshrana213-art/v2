import { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  RefreshControl,
  Platform,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
let CameraView: any = null;
let Camera: any = null;
try {
  const ExpoCamera = require("expo-camera");
  CameraView = ExpoCamera.CameraView;
  Camera = ExpoCamera.Camera;
} catch (e) {
  console.warn("ExpoCamera module not found. Native features will be disabled.");
}
import { router } from "expo-router";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp, FadeIn, FadeOut } from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { Svg, Defs, Rect, Mask, Ellipse, Line } from "react-native-svg";

import { PageHeader } from "@/components/PageHeader";
import { TeacherBottomNav } from "@/components/TeacherBottomNav";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";
import { getISTDateParts, getISTDayOfWeek, getISTNowParts } from "@/lib/date-utils";

const { width, height } = Dimensions.get("window");

// --- Types ---
interface AttendanceDay {
  date: string;
  status: "PRESENT" | "ABSENT" | "HALF_DAY" | "NONE";
  type: string;
  matched: boolean;
  selfieImageUrl: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface MonthlyAttendance {
  month: number;
  year: number;
  calendar: AttendanceDay[];
  summary: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    halfDays: number;
    attendancePercentage: number;
  };
}

interface AttendanceStatus {
  markedToday: boolean;
  faceRegistered: boolean;
  attemptsUsed: number;
  attemptsRemaining: number;
  maxAttempts: number;
  isLocked: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  PRESENT: "#10B981",
  ABSENT: "#EF4444",
  HALF_DAY: "#F59E0B",
  NONE: "transparent",
};

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

// Oval geometry constants — single source of truth used by BOTH the mask and the guide border
const OVAL_CX = width / 2;
const OVAL_CY = height * 0.40;   // position in upper-center for selfie
const OVAL_RX = width * 0.38;    // horizontal radius
const OVAL_RY = height * 0.27;   // vertical radius
const OVAL_BOTTOM = OVAL_CY + OVAL_RY; // absolute y pixel of oval bottom edge

const CameraOverlay = () => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <Svg height="100%" width="100%">
      <Defs>
        <Mask id="faceMask" x="0" y="0" height="100%" width="100%">
          <Rect height="100%" width="100%" fill="#fff" />
          <Ellipse
            cx={OVAL_CX}
            cy={OVAL_CY}
            rx={OVAL_RX}
            ry={OVAL_RY}
            fill="#000"
          />
        </Mask>
      </Defs>

      {/* Dark vignette with face cutout */}
      <Rect
        height="100%"
        width="100%"
        fill="rgba(0,0,0,0.68)"
        mask="url(#faceMask)"
      />

      {/* Dashed guide border — drawn in the SAME SVG so it's always pixel-perfect aligned */}
      <Ellipse
        cx={OVAL_CX}
        cy={OVAL_CY}
        rx={OVAL_RX}
        ry={OVAL_RY}
        fill="none"
        stroke="rgba(255,255,255,0.85)"
        strokeWidth={2.5}
        strokeDasharray="10 7"
      />

      {/* Four corner accent ticks for a modern biometric look */}
      {[
        [OVAL_CX - OVAL_RX + 4, OVAL_CY - 10, OVAL_CX - OVAL_RX + 4, OVAL_CY + 10],  // left-mid top
        [OVAL_CX + OVAL_RX - 4, OVAL_CY - 10, OVAL_CX + OVAL_RX - 4, OVAL_CY + 10],  // right-mid top
      ].map(([x1, y1, x2, y2], i) => (
        <Line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="rgba(255,255,255,0.5)" strokeWidth={1.5} />
      ))}
    </Svg>

    {/* Instruction label — anchored just below the oval bottom */}
    <View style={[styles.guideLabel, { top: OVAL_BOTTOM + 18 }]}>
      <Text style={styles.guideText}>Center your face in the oval</Text>
    </View>
  </View>
);

export default function MyAttendancePage() {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<MonthlyAttendance | null>(null);
  const [attStatus, setAttStatus] = useState<AttendanceStatus | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [marking, setMarking] = useState(false);
  
  const [showCamera, setShowCamera] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownInterval = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentParts = getISTDateParts(currentDate);
  const month = currentParts.month;
  const year = currentParts.year;
  const nowParts = getISTNowParts();
  const today = new Date();
  const isCurrentMonth =
    currentParts.month === nowParts.month &&
    currentParts.year === nowParts.year;

  const fetchData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const [attendanceRes, statusRes] = await Promise.all([
        api.get<MonthlyAttendance>(`/api/v1/attendance/my-attendance?month=${month}&year=${year}`),
        isCurrentMonth ? api.get<AttendanceStatus>("/api/v1/attendance/status") : Promise.resolve(null),
      ]);
      
      setData(attendanceRes as any);
      if (statusRes) setAttStatus(statusRes as any);
    } catch (error) {
      console.error("Failed to fetch attendance data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [month, year, isCurrentMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(true);
  }, [fetchData]);

  // --- Camera Logic ---
  const startCamera = async () => {
    if (!Camera) {
      Alert.alert("Module Missing", "The Camera module is not installed in this build. Please rebuild the app with expo-camera.");
      return;
    }
    const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
    const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();

    if (cameraStatus !== "granted" || locationStatus !== "granted") {
      Alert.alert("Permissions Required", "Camera and Location permissions are needed to mark attendance.");
      return;
    }

    setShowCamera(true);
    setCountdown(3);
  };

  useEffect(() => {
    if (showCamera && countdown !== null) {
      if (countdown > 0) {
        countdownInterval.current = setTimeout(() => {
          setCountdown(c => (c ? c - 1 : 0));
        }, 1000);
      } else {
        captureAndVerify();
      }
    }
    return () => {
      if (countdownInterval.current) clearTimeout(countdownInterval.current);
    };
  }, [showCamera, countdown]);

  const captureAndVerify = async () => {
    if (!cameraRef.current) return;
    
    setMarking(true);
    try {
      // 1. Capture Image
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
        shutterSound: true,
      });

      if (!photo?.base64) throw new Error("Could not capture photo");

      // 2. Get Location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // 3. Submit
      await api.post("/api/v1/attendance/mark", {
        selfieBase64: `data:image/jpeg;base64,${photo.base64}`,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      setShowCamera(false);
      setCountdown(null);
      Alert.alert("\u2705 Success", "Attendance marked successfully! Face verified and location confirmed.");
      fetchData();
    } catch (error: any) {
      console.error("Verification error:", error);
      const msg: string = error.message || "Verification failed";

      // Timeout: keep camera open and let user retry
      const isTimeout = msg.includes("timed out") || msg.includes("warming up");
      const isOffline = msg.includes("offline") || msg.includes("not configured");

      if (isTimeout || isOffline) {
        // Don’t close camera — reset countdown so user can retry
        setCountdown(null);
        Alert.alert(
          isTimeout ? "\u23f1\ufe0f Face Server Warming Up" : "\uD83D\uDCF5 AI Service Offline",
          isTimeout
            ? "The face recognition server is starting up (can take 20-30s). Tap \"Try Again\" to retry."
            : "The AI service is currently offline. Please contact your school admin.",
          isOffline
            ? [{ text: "OK", onPress: () => { setShowCamera(false); setCountdown(null); } }]
            : [
                { text: "Cancel", style: "cancel", onPress: () => { setShowCamera(false); setCountdown(null); } },
                { text: "Try Again", onPress: () => setCountdown(3) },
              ]
        );
      } else {
        // Real failure (wrong face, locked, geo-fence, etc.) — close camera
        setShowCamera(false);
        setCountdown(null);
        Alert.alert("Verification Failed", msg || "Ensure you are in good lighting and within the school premises.");
        // Refresh status to get updated attempt counts
        fetchData();
      }
    } finally {
      setMarking(false);
    }
  };

  // --- Calendar Helpers ---
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = getISTDayOfWeek(monthStart);
  const calendarDays = [...Array(startDay).fill(null), ...daysInMonth];

  const getDayAttendance = (date: Date): AttendanceDay | null => {
    if (!data) return null;
    const key = format(date, "yyyy-MM-dd");
    return data.calendar.find((r) => format(new Date(r.date), "yyyy-MM-dd") === key) || null;
  };

  const navigateMonth = (dir: "prev" | "next") => {
    setCurrentDate((d) => (dir === "prev" ? subMonths(d, 1) : addMonths(d, 1)));
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const todayMarked = attStatus?.markedToday;
  const isLocked = attStatus?.isLocked;

  return (
    <View style={styles.container}>
      <PageHeader title="My Attendance" subtitle="Biometric & Geo-fenced" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Stats */}
        <Animated.View entering={FadeInDown} style={styles.headerCard}>
          <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={styles.headerGradient}>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.headerTitle}>{format(currentDate, "MMMM yyyy")}</Text>
                <Text style={styles.headerSubtitle}>{data?.summary.attendancePercentage}% Attendance Rate</Text>
              </View>
              <View style={styles.monthNav}>
                <Pressable onPress={() => navigateMonth("prev")} style={styles.navBtn}><Ionicons name="chevron-back" size={20} color="#FFF" /></Pressable>
                <Pressable onPress={() => navigateMonth("next")} style={styles.navBtn}><Ionicons name="chevron-forward" size={20} color="#FFF" /></Pressable>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}><Text style={styles.statVal}>{data?.summary.presentDays}</Text><Text style={styles.statLbl}>Present</Text></View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}><Text style={styles.statVal}>{data?.summary.absentDays}</Text><Text style={styles.statLbl}>Absent</Text></View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}><Text style={styles.statVal}>{data?.summary.halfDays}</Text><Text style={styles.statLbl}>Half Day</Text></View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Mark Attendance Button/Banner */}
        {isCurrentMonth && (
          <Animated.View entering={FadeInUp.delay(200)} style={styles.actionContainer}>
            {todayMarked ? (
              <View style={[styles.statusBanner, styles.successBanner]}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.statusTitle}>Attendance Marked</Text>
                  <Text style={styles.statusSub}>Verified via Face Recognition.</Text>
                </View>
              </View>
            ) : isLocked ? (
              <View style={[styles.statusBanner, styles.errorBanner]}>
                <Ionicons name="lock-closed" size={24} color="#EF4444" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.statusTitle}>Account Locked</Text>
                  <Text style={styles.statusSub}>Max attempts reached today.</Text>
                </View>
              </View>
            ) : attStatus?.faceRegistered === false ? (
              <View style={[styles.statusBanner, styles.warningBanner]}>
                <Ionicons name="alert-circle" size={24} color="#F59E0B" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.statusTitle}>Face Not Registered</Text>
                  <Text style={styles.statusSub}>Please contact your admin for face enrollment.</Text>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={startCamera}
                disabled={marking}
                style={({ pressed }) => [styles.markBtn, pressed && { transform: [{ scale: 0.98 }] }]}
              >
                <LinearGradient colors={["#4F46E5", "#7C3AED"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.markBtnGradient}>
                  {marking ? <ActivityIndicator color="#FFF" /> : (
                    <><Ionicons name="scan" size={22} color="#FFF" /><Text style={styles.markBtnText}>Verify Face & Mark Attendance</Text></>
                  )}
                </LinearGradient>
              </Pressable>
            )}
            
            {attStatus && !todayMarked && !isLocked && (
              <View style={styles.attemptsInfo}>
                <Text style={styles.attemptsText}>{attStatus.attemptsRemaining} / {attStatus.maxAttempts} attempts left</Text>
                <View style={styles.attemptsBg}>
                  <View style={[styles.attemptsFill, { width: `${(attStatus.attemptsRemaining / attStatus.maxAttempts) * 100}%`, backgroundColor: attStatus.attemptsRemaining <= 1 ? "#EF4444" : "#4F46E5" }]} />
                </View>
              </View>
            )}
          </Animated.View>
        )}

        {/* Calendar View */}
        <Animated.View entering={FadeInUp.delay(400)} style={styles.calendarCard}>
          <View style={styles.calendarGrid}>
            {DAY_LABELS.map((label, idx) => (
              <View key={`label-${idx}`} style={styles.calendarDayLabel}><Text style={styles.calendarDayLabelText}>{label}</Text></View>
            ))}
            {calendarDays.map((date, idx) => {
              const att = date ? getDayAttendance(date) : null;
              const isToday = date && isSameDay(date, today);
              return (
                <View key={`day-${idx}`} style={styles.calendarCell}>
                  {date ? (
                    <View style={[styles.dayCircle, isToday && styles.todayCircle, att && { backgroundColor: STATUS_COLORS[att.status] || COLORS.border }]}>
                      <Text style={[styles.dayText, att && { color: "#FFF" }, isToday && !att && { color: COLORS.primary }]}>{format(date, "d")}</Text>
                    </View>
                  ) : <View style={styles.emptyDay} />}
                </View>
              );
            })}
          </View>
        </Animated.View>

        <View style={styles.tipsSection}>
          <View style={styles.tipCard}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#10B981" />
            <Text style={styles.tipText}>Verification requires a clear selfie and active location data within 50m of the school.</Text>
          </View>
        </View>
      </ScrollView>

      {/* --- In-App Camera Modal --- */}
      <Modal visible={showCamera} animationType="slide" transparent={false}>
        <View style={styles.cameraContainer}>
          <CameraView 
            ref={cameraRef}
            style={StyleSheet.absoluteFill} 
            facing="front"
            autofocus="on"
          />
          <CameraOverlay />
          
          {/* Top Bar */}
          <View style={[styles.cameraHeader, { paddingTop: insets.top + 10 }]}>
            <Pressable onPress={() => setShowCamera(false)} style={styles.closeBtn}>
              <Ionicons name="close" size={28} color="#FFF" />
            </Pressable>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>Biometric Verification</Text>
            </View>
            <View style={{ width: 44 }} />
          </View>

          {/* Countdown / Action UI — sits at bottom of screen */}
          <View style={styles.cameraFooter}>
            {countdown !== null && countdown > 0 ? (
              // Big countdown number
              <Animated.Text entering={FadeIn.duration(200)} exiting={FadeOut} style={styles.countdownText}>
                {countdown}
              </Animated.Text>
            ) : marking ? (
              // Processing state
              <View style={styles.processingBox}>
                <ActivityIndicator size="large" color="#FFF" />
                <Text style={styles.processingText}>Verifying…</Text>
              </View>
            ) : (
              // Manual shutter button (shown only when countdown is null)
              <Pressable onPress={captureAndVerify} style={styles.shutterBtn}>
                <View style={styles.shutterInner} />
              </Pressable>
            )}
            <Text style={styles.cameraHint}>
              {marking ? "Face recognition in progress" : countdown !== null && countdown > 0 ? "Hold still…" : "Tap to capture"}
            </Text>
          </View>
        </View>
      </Modal>

      <TeacherBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { justifyContent: "center", alignItems: "center" },
  headerCard: { margin: 16, borderRadius: 24, overflow: "hidden", elevation: 8, shadowColor: "#4F46E5", shadowOpacity: 0.2, shadowRadius: 12 },
  headerGradient: { padding: 20 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#FFF" },
  headerSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  monthNav: { flexDirection: "row", gap: 8 },
  navBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  statsRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 10 },
  statItem: { alignItems: "center" },
  statVal: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#FFF" }, statLbl: { fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 4, textTransform: "uppercase" },
  statDivider: { width: 1, height: "60%", backgroundColor: "rgba(255,255,255,0.2)", alignSelf: "center" },
  actionContainer: { paddingHorizontal: 16, marginBottom: 20 },
  markBtn: { borderRadius: 16, overflow: "hidden", elevation: 4 },
  markBtnGradient: { paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  markBtnText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_700Bold" },
  statusBanner: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 16, borderWidth: 1 },
  successBanner: { backgroundColor: "#ECFDF5", borderColor: "#10B981" },
  errorBanner: { backgroundColor: "#FEF2F2", borderColor: "#EF4444" },
  warningBanner: { backgroundColor: "#FFFBEB", borderColor: "#F59E0B" },
  statusTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#1E293B" },
  statusSub: { fontSize: 12, color: "#64748B", marginTop: 2 },
  attemptsInfo: { marginTop: 12 },
  attemptsText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#64748B", textAlign: "right", marginBottom: 6 },
  attemptsBg: { height: 6, backgroundColor: "#E2E8F0", borderRadius: 3, overflow: "hidden" },
  attemptsFill: { height: "100%", borderRadius: 3 },
  calendarCard: { marginHorizontal: 16, padding: 20, backgroundColor: COLORS.surface, borderRadius: 24, borderWidth: 1, borderColor: COLORS.border },
  calendarGrid: { flexDirection: "row", flexWrap: "wrap" },
  calendarDayLabel: { width: "14.28%", alignItems: "center", paddingBottom: 12 },
  calendarDayLabelText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: COLORS.textMuted },
  calendarCell: { width: "14.28%", alignItems: "center", paddingVertical: 6 },
  dayCircle: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "#F8FAFF" },
  todayCircle: { borderWidth: 2, borderColor: COLORS.primary },
  dayText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: COLORS.textPrimary },
  emptyDay: { width: 36, height: 36 },
  tipsSection: { padding: 16 },
  tipCard: { flexDirection: "row", gap: 12, backgroundColor: "#F0FDF4", padding: 16, borderRadius: 16, borderLeftWidth: 4, borderLeftColor: "#10B981" },
  tipText: { flex: 1, fontSize: 12, color: "#166534", lineHeight: 18, fontFamily: "Inter_500Medium" },

  // Camera Styles
  cameraContainer: { flex: 1, backgroundColor: "#000" },
  cameraHeader: { position: "absolute", top: 0, left: 0, right: 0, flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, zIndex: 10 },
  closeBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" },
  typeBadge: { backgroundColor: "rgba(79, 70, 229, 0.9)", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  typeBadgeText: { color: "#FFF", fontSize: 12, fontFamily: "Inter_700Bold" },
  cameraFooter: { position: "absolute", bottom: 50, left: 0, right: 0, alignItems: "center", gap: 16 },
  countdownText: { fontSize: 96, fontFamily: "Inter_900Black", color: "#FFF", textShadowColor: "rgba(0,0,0,0.6)", textShadowOffset: { width: 0, height: 4 }, textShadowRadius: 12 },
  processingBox: { alignItems: "center", gap: 10 },
  processingText: { color: "#FFF", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  shutterBtn: { width: 76, height: 76, borderRadius: 38, backgroundColor: "rgba(255,255,255,0.25)", padding: 4, borderWidth: 3, borderColor: "#FFF" },
  shutterInner: { flex: 1, borderRadius: 38, backgroundColor: "#FFF" },
  cameraHint: { color: "rgba(255,255,255,0.9)", fontSize: 13, fontFamily: "Inter_600SemiBold", backgroundColor: "rgba(0,0,0,0.45)", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },

  // Guide label — positioned absolutely just below the SVG oval bottom edge (OVAL_BOTTOM + 18)
  guideLabel: { position: "absolute", left: 0, right: 0, alignItems: "center" },
  guideText: { color: "#FFF", fontSize: 14, fontFamily: "Inter_600SemiBold", backgroundColor: "rgba(0,0,0,0.35)", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, overflow: "hidden" },
});
