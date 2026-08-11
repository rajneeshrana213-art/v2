import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  RefreshControl,
  ActivityIndicator,
  Image,
  Alert,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "@/lib/auth-context";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";
import { DriverDashboardData } from "@/lib/types/driver";
import * as Location from "expo-location";
import { DriverBottomNav } from "@/components/DriverBottomNav";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  Easing
} from "react-native-reanimated";
import { getISTHours } from "@/lib/date-utils";

const { width } = Dimensions.get('window');

const QUICK_LINKS = [
  { key: "pickup", label: "Students", icon: "people", color: "#3B82F6", route: "/pages/pickup" },
  { key: "route", label: "Route", icon: "map", color: "#8B5CF6", route: "/pages/route" },
  // { key: "notices", label: "Notices", icon: "megaphone", color: "#F59E0B", route: "/pages/notices" },
  { key: "tickets", label: "Support", icon: "help-buoy", color: "#EF4444", route: "/pages/tickets" },
  // { key: "profile", label: "Profile", icon: "person", color: "#10B981", route: "/pages/profile" },
  // { key: "chat", label: "Chat", icon: "chatbubble-ellipses", color: "#6366F1", route: "/pages/communication" },
];

export default function DriverDashboard() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<DriverDashboardData | null>(null);

  // Animation for live tracking
  const pulseValue = useSharedValue(1);

  useEffect(() => {
    pulseValue.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [pulseValue]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseValue.value }],
    opacity: 1.5 - pulseValue.value
  }));

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await api.get<DriverDashboardData>("/api/v1/dashboard/driver/overview");
      setDashboardData(response as any);
    } catch (error) {
      console.error("Failed to fetch driver dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;

    const startLocationTracking = async () => {
      if (!dashboardData?.activeTrip?.id) return;

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Location permission denied");
        return;
      }

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10,
          timeInterval: 5000,
        },
        async (location) => {
          try {
            await api.post("/api/v1/transport/tracking/driver/location", {
              tripId: dashboardData.activeTrip!.id,
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              speed: location.coords.speed,
              heading: location.coords.heading,
              timestamp: new Date(location.timestamp).toISOString()
            });
          } catch (error) {
            console.warn("Location update failed:", error);
          }
        }
      );
    };

    if (dashboardData?.activeTrip) {
      startLocationTracking();
    }

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [dashboardData?.activeTrip, dashboardData?.activeTrip?.id]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleQuickLink = useCallback((item: typeof QUICK_LINKS[0]) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (item.route) {
      router.push(item.route as any);
    }
  }, []);

  const startTrip = useCallback(async (type: "MORNING" | "RETURN") => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      if (!dashboardData?.assignedRoute?.id) {
        Alert.alert("No Route Assigned", "Please contact school administration.");
        return;
      }

      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "Location access is required.");
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });

      await api.post("/api/v1/dashboard/driver/trip/start", {
        routeId: dashboardData.assignedRoute.id,
        type: type,
        initialLocation: {
          lat: location.coords.latitude,
          lng: location.coords.longitude
        }
      });

      await fetchDashboardData();
      router.push("/pages/route");

    } catch {
      Alert.alert("Error", "Could not start trip.");
    } finally {
      setLoading(false);
    }
  }, [dashboardData, fetchDashboardData]);

  const endTrip = useCallback(async () => {
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      if (!dashboardData?.activeTrip?.id) return;
      await api.post("/api/v1/dashboard/driver/trip/end", {
        tripId: dashboardData.activeTrip.id
      });
      fetchDashboardData();
    } catch (error) {
      console.error("Failed to end trip:", error);
    }
  }, [dashboardData, fetchDashboardData]);

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const isActive = !!dashboardData?.activeTrip;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Background Glow */}
      <View style={styles.backgroundGlow} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 }
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* Header Section */}
        <View style={styles.headerRow}>
          <View style={styles.profileSection}>
            <Image
              source={{ uri: dashboardData?.profilePic || `https://api.dicebear.com/7.x/initials/png?seed=${dashboardData?.driverName || user?.name}&backgroundColor=4F46E5` }}
              style={styles.profilePic}
            />
            <View>
              <Text style={styles.greetingText}>
                {getISTHours(new Date()) < 12 ? '☀️ Good Morning' : getISTHours(new Date()) < 17 ? '⛅ Good Afternoon' : '🌙 Good Evening'}
              </Text>
              <Text style={styles.userNameText}>{dashboardData?.driverName || user?.name || "Driver"}</Text>
            </View>
          </View>
          
          <Pressable
            style={({ pressed }) => [styles.sosButton, pressed && { opacity: 0.8 }]}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              Alert.alert("SOS Emergency", "Send alert to school headquarters?", [
                { text: "Cancel", style: "cancel" },
                { text: "SEND SOS", style: "destructive", onPress: () => Alert.alert("Sent", "Emergency broadcast sent.") }
              ]);
            }}
          >
            <LinearGradient
              colors={['#EF4444', '#DC2626']}
              style={styles.sosGradient}
            >
              <Ionicons name="warning" size={18} color="#fff" />
              <Text style={styles.sosText}>SOS</Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Status Card */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.statusCard}>
          <LinearGradient
            colors={[isActive ? COLORS.success : COLORS.primary, isActive ? '#22C55E' : '#6366F1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statusGradient}
          >
            <View style={styles.statusHeader}>
              <View style={styles.vehicleInfo}>
                <View style={styles.busIconBox}>
                  <Ionicons name="bus" size={24} color="#fff" />
                </View>
                <View>
                  <Text style={styles.vehicleLabelText}>Assigned Vehicle</Text>
                  <Text style={styles.vehicleIdText}>{dashboardData?.busNumber || "N/A"}</Text>
                </View>
              </View>
              <BlurView intensity={30} tint="light" style={styles.statusBadge}>
                <View style={[styles.statusDot, isActive && { backgroundColor: '#4ADE80' }]} />
                <Text style={styles.statusBadgeText}>{isActive ? 'ONLINE' : 'OFFLINE'}</Text>
              </BlurView>
            </View>

            <View style={styles.divider} />

            <View style={styles.statusFooter}>
              <View style={styles.routeInfo}>
                <Ionicons name="map-outline" size={16} color="rgba(255,255,255,0.7)" />
                <Text style={styles.routeText} numberOfLines={1}>
                  {dashboardData?.assignedRoute?.name || "No Route Assigned"}
                </Text>
              </View>
              {isActive && (
                <View style={styles.tripTypeBadge}>
                  <Text style={styles.tripTypeText}>{dashboardData.activeTrip?.type}</Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Live Tracking / Start Trip Section */}
        {!isActive ? (
          <Animated.View entering={FadeInUp.delay(200)} style={styles.controlContainer}>
            <Text style={styles.sectionTitleText}>Start Your Shift</Text>
            <View style={styles.shiftActions}>
              <Pressable
                style={({ pressed }) => [styles.shiftCard, styles.morningCard, pressed && { transform: [{ scale: 0.98 }] }]}
                onPress={() => startTrip("MORNING")}
                disabled={!dashboardData?.assignedRoute}
              >
                <View style={styles.shiftIconBox}>
                  <Ionicons name="sunny" size={28} color="#F59E0B" />
                </View>
                <Text style={styles.shiftTitle}>Morning Shift</Text>
                <Text style={styles.shiftSub}>Pickup & Drop to School</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.shiftCard, styles.eveningCard, pressed && { transform: [{ scale: 0.98 }] }]}
                onPress={() => startTrip("RETURN")}
                disabled={!dashboardData?.assignedRoute}
              >
                <View style={styles.shiftIconBox}>
                  <Ionicons name="moon" size={28} color="#8B5CF6" />
                </View>
                <Text style={styles.shiftTitle}>Return Shift</Text>
                <Text style={styles.shiftSub}>School to Home Drop</Text>
              </Pressable>
            </View>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInUp.delay(200)} style={styles.liveTrackingCard}>
            <View style={styles.liveHeaderRow}>
              <View style={styles.liveIndicatorRow}>
                <Animated.View style={[styles.pulseCircle, pulseStyle]} />
                <View style={styles.activeLiveDot} />
                <Text style={styles.liveTrackingText}>LIVE TRACKING ACTIVE</Text>
              </View>
              <TouchableOpacity
                onPress={endTrip}
                style={styles.stopTripButton}
              >
                <Ionicons name="stop-circle" size={18} color="#fff" />
                <Text style={styles.stopTripText}>End Trip</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.trackingInfoBox}>
              <View style={styles.trackingIconContainer}>
                <Ionicons name="navigate" size={32} color={COLORS.primary} />
              </View>
              <Text style={styles.trackingStatusMain}>GPS Relay Active</Text>
              <Text style={styles.trackingStatusSub}>Providing real-time updates to parents</Text>
            </View>
          </Animated.View>
        )}

        {/* Quick Actions Grid */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitleText}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {QUICK_LINKS.map((item, idx) => (
              <Animated.View key={item.key} entering={FadeInDown.delay(300 + idx * 50)}>
                <Pressable
                  style={({ pressed }) => [styles.actionItem, pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] }]}
                  onPress={() => handleQuickLink(item)}
                >
                  <View style={[styles.actionIconBox, { backgroundColor: item.color + '15' }]}>
                    <Ionicons name={item.icon as any} size={24} color={item.color} />
                  </View>
                  <Text style={styles.actionLabel}>{item.label}</Text>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Support Section */}
        <Animated.View entering={FadeInDown.delay(600)} style={styles.footerNote}>
          <BlurView intensity={10} style={styles.securityBadge}>
            <Ionicons name="shield-checkmark" size={16} color={COLORS.success} />
            <Text style={styles.securityBadgeText}>Enterprise Security Active</Text>
          </BlurView>
        </Animated.View>
      </ScrollView>

      <DriverBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { justifyContent: "center", alignItems: "center" },
  scrollContent: { paddingHorizontal: 20 },
  backgroundGlow: {
    position: 'absolute',
    top: -150,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: COLORS.primaryLight,
    opacity: 0.3,
  },
  
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  profileSection: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  profilePic: { width: 52, height: 52, borderRadius: 16, borderWidth: 2, borderColor: '#fff' },
  greetingText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: COLORS.textSecondary },
  userNameText: { fontSize: 22, fontFamily: 'Inter_800ExtraBold', color: COLORS.textPrimary },
  
  sosButton: { borderRadius: 14, overflow: 'hidden', elevation: 4, shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  sosGradient: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10 },
  sosText: { color: '#fff', fontSize: 13, fontFamily: 'Inter_700Bold' },

  statusCard: { borderRadius: 28, overflow: 'hidden', elevation: 8, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 15, marginBottom: 24 },
  statusGradient: { padding: 24 },
  statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  vehicleInfo: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  busIconBox: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  vehicleLabelText: { fontSize: 12, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.8)' },
  vehicleIdText: { fontSize: 20, fontFamily: 'Inter_800ExtraBold', color: '#fff' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.1)' },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  statusBadgeText: { fontSize: 10, fontFamily: 'Inter_800ExtraBold', color: '#fff' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 16 },
  statusFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  routeInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  routeText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#fff' },
  tripTypeBadge: { backgroundColor: '#fff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  tripTypeText: { fontSize: 10, fontFamily: 'Inter_800ExtraBold', color: COLORS.primary },

  sectionTitleText: { fontSize: 18, fontFamily: 'Inter_700Bold', color: COLORS.textPrimary, marginBottom: 16 },
  controlContainer: { marginBottom: 24 },
  shiftActions: { flexDirection: 'row', gap: 12 },
  shiftCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 24, padding: 20, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: COLORS.border, elevation: 2 },
  morningCard: { borderColor: '#F59E0B30' },
  eveningCard: { borderColor: '#8B5CF630' },
  shiftIconBox: { width: 56, height: 56, borderRadius: 20, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  shiftTitle: { fontSize: 15, fontFamily: 'Inter_700Bold', color: COLORS.textPrimary },
  shiftSub: { fontSize: 10, fontFamily: 'Inter_500Medium', color: COLORS.textMuted, textAlign: 'center' },

  liveTrackingCard: { backgroundColor: COLORS.surface, borderRadius: 28, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: COLORS.success + '40', elevation: 4 },
  liveHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  liveIndicatorRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  activeLiveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.success },
  liveTrackingText: { fontSize: 11, fontFamily: 'Inter_800ExtraBold', color: COLORS.success, letterSpacing: 0.5 },
  pulseCircle: { position: 'absolute', left: -4, width: 16, height: 16, borderRadius: 8, backgroundColor: COLORS.success, opacity: 0.3 },
  stopTripButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.error, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  stopTripText: { color: '#fff', fontSize: 12, fontFamily: 'Inter_700Bold' },
  trackingInfoBox: { backgroundColor: COLORS.background, borderRadius: 20, padding: 24, alignItems: 'center', gap: 8, borderStyle: 'dashed', borderWidth: 1, borderColor: COLORS.border },
  trackingIconContainer: { width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  trackingStatusMain: { fontSize: 16, fontFamily: 'Inter_700Bold', color: COLORS.textPrimary },
  trackingStatusSub: { fontSize: 13, fontFamily: 'Inter_400Regular', color: COLORS.textMuted, textAlign: 'center' },

  quickActionsContainer: { marginBottom: 24 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionItem: { width: (width - 40 - 12) / 2, backgroundColor: COLORS.surface, borderRadius: 22, padding: 16, alignItems: 'center', gap: 10, borderWidth: 1, borderColor: COLORS.border },
  actionIconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: 13, fontFamily: 'Inter_700Bold', color: COLORS.textPrimary },

  footerNote: { alignItems: 'center', marginTop: 8 },
  securityBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.5)' },
  securityBadgeText: { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: COLORS.textMuted },
});
