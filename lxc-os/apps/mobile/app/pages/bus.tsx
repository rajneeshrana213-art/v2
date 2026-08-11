import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Pressable,
    Dimensions,
    Platform,
} from "react-native";
import { WebView } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { PageHeader } from "@/components/PageHeader";
import { COLORS } from "@/constants/colors";
import { BottomNav } from "@/components/BottomNav";
import { ParentBottomNav } from "@/components/ParentBottomNav";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import * as Location from "expo-location";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import Animated, { FadeInUp, FadeInDown, FadeInRight, FadeInLeft, ZoomIn, Layout } from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

export default function BusTrackingPage() {
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const webViewRef = useRef<WebView>(null);

    const [loading, setLoading] = useState(true);
    const [activeTrips, setActiveTrips] = useState<any[]>([]);
    const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
    const [selectedTrip, setSelectedTrip] = useState<any>(null);

    // Fetch User Location
    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;

            let location = await Location.getCurrentPositionAsync({ accuracy: Location.LocationAccuracy.Balanced });
            setUserLocation(location);

            // Subscribe to updates
            const sub = await Location.watchPositionAsync(
                { accuracy: Location.Accuracy.Balanced, distanceInterval: 10 },
                (loc) => {
                    setUserLocation(loc);
                    // Push to WebView
                    webViewRef.current?.injectJavaScript(`updateUserLocation(${loc.coords.latitude}, ${loc.coords.longitude})`);
                }
            );
            return () => sub.remove();
        })();
    }, []);

    // Fetch Active Trips (Polling)
    const fetchTrips = useCallback(async () => {
        if (!user?.schoolId) return;
        try {
            const response = await api.get(`/api/v1/transport/trips/active?schoolId=${user.schoolId}`);
            // The api utility returns the data directly if it's an array or object
            const trips = (response as any) || [];
            setActiveTrips(trips);

            // Auto-select first trip if none selected
            if (trips.length > 0 && !selectedTrip) {
                setSelectedTrip(trips[0]);
            } else if (selectedTrip) {
                // Update selected trip data
                const updated = trips.find((t: any) => t.id === selectedTrip.id);
                if (updated) setSelectedTrip(updated);
            }

            // Sync with map
            webViewRef.current?.injectJavaScript(`updateBuses(${JSON.stringify(trips)})`);
        } catch (error) {
            console.warn("Failed to fetch trips:", error);
        } finally {
            setLoading(false);
        }
    }, [user?.schoolId, selectedTrip]);

    useEffect(() => {
        fetchTrips();
        const interval = setInterval(fetchTrips, 5000); // 5s polling
        return () => clearInterval(interval);
    }, [fetchTrips]);

    // Enhanced Map HTML
    const mapHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; }
          #map { height: 100vh; width: 100vw; background: #f8fafc; }
          .bus-marker {
            background-color: ${COLORS.primary};
            border: 3px solid white;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            transition: all 0.5s ease-in-out;
          }
          .user-marker {
            background-color: #3B82F6;
            border: 3px solid white;
            border-radius: 50%;
            width: 22px;
            height: 22px;
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0.1);
          }
          .pulse {
            animation: pulse-animation 2s infinite;
          }
          @keyframes pulse-animation {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
            70% { transform: scale(1); box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map', { zoomControl: false }).setView([28.6139, 77.2090], 14);
          L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png').addTo(map);

          let busMarkers = {};
          let userMarker = null;

          function updateUserLocation(lat, lng) {
            if (!userMarker) {
                const icon = L.divIcon({ className: '', html: '<div class="user-marker pulse"></div>', iconSize: [22, 22], iconAnchor: [11, 11] });
                userMarker = L.marker([lat, lng], { icon }).addTo(map);
            } else {
                userMarker.setLatLng([lat, lng]);
            }
          }

          function updateBuses(trips) {
            trips.forEach(trip => {
                const loc = trip.tripLocations?.[0];
                if (!loc) return;

                if (!busMarkers[trip.id]) {
                    const icon = L.divIcon({
                        className: '',
                        html: '<div class="bus-marker">🚌</div>',
                        iconSize: [36, 36],
                        iconAnchor: [18, 18]
                    });
                    busMarkers[trip.id] = L.marker([loc.latitude, loc.longitude], { icon }).addTo(map);
                } else {
                    busMarkers[trip.id].setLatLng([loc.latitude, loc.longitude]);
                }
            });

            // Cleanup inactive
            const tripIds = trips.map(t => t.id);
            Object.keys(busMarkers).forEach(id => {
                if (!tripIds.includes(id)) {
                    map.removeLayer(busMarkers[id]);
                    delete busMarkers[id];
                }
            });

            // Fit bounds if tracking multiple
            if (trips.length > 0) {
                const markers = Object.values(busMarkers);
                if (userMarker) markers.push(userMarker);
                
                const group = new L.featureGroup(markers);
                map.fitBounds(group.getBounds().pad(0.3), { animate: true });
            }
          }
        </script>
      </body>
    </html>
  `;

    return (
        <View style={styles.container}>
            <View style={styles.headerWrapper}>
                <PageHeader
                    title="Live Tracker"
                    subtitle={selectedTrip ? `Route: ${selectedTrip.route?.name}` : "School Transport"}
                    transparent
                />
            </View>

            <View style={styles.mapWrapper}>
                <WebView
                    ref={webViewRef}
                    originWhitelist={["*"]}
                    source={{ html: mapHtml }}
                    style={styles.map}
                    onLoadEnd={() => {
                        setLoading(false);
                        if (userLocation) {
                            webViewRef.current?.injectJavaScript(`updateUserLocation(${userLocation.coords.latitude}, ${userLocation.coords.longitude})`);
                        }
                        if (activeTrips.length > 0) {
                            webViewRef.current?.injectJavaScript(`updateBuses(${JSON.stringify(activeTrips)})`);
                        }
                    }}
                />

                {loading && (
                    <BlurView intensity={20} style={styles.loader}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loaderText}>Establishing satellite link...</Text>
                    </BlurView>
                )}
            </View>

            {/* Floating Info Overlay (Top) */}
            <Animated.View entering={FadeInDown.delay(400)} style={[styles.topOverlay, { top: insets.top + 100 }]}>
                <BlurView intensity={80} tint="light" style={styles.topCard}>
                    <View style={styles.tripStatusRow}>
                        <View style={styles.activeIndicator}>
                            <View style={[styles.pulseDot, activeTrips.length > 0 && { backgroundColor: COLORS.success }]} />
                            <Text style={styles.activeText}>{activeTrips.length} BUSES ACTIVE</Text>
                        </View>
                        <Pressable style={styles.refreshBtn} onPress={fetchTrips}>
                            <Ionicons name="refresh" size={16} color={COLORS.primary} />
                        </Pressable>
                    </View>
                </BlurView>
            </Animated.View>

            {/* Main Info Card (Bottom) */}
            <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 110 }]}>
                {selectedTrip ? (
                    <Animated.View entering={FadeInUp.springify()} layout={Layout.springify()} style={styles.infoCard}>
                        <BlurView intensity={95} tint="light" style={styles.glassCard}>
                            <View style={styles.cardHeader}>
                                <View style={styles.busInfo}>
                                    <View style={styles.busIconCircle}>
                                        <MaterialCommunityIcons name="bus-side" size={24} color="#FFF" />
                                    </View>
                                    <View>
                                        <Text style={styles.busModel}>{selectedTrip.bus?.busNumber || "Bus X"}</Text>
                                        <Text style={styles.routeLabel}>{selectedTrip.route?.name || "Regular Route"}</Text>
                                    </View>
                                </View>
                                <View style={styles.etaBox}>
                                    <View style={styles.liveBadge}>
                                        <Text style={styles.etaValue}>Live</Text>
                                    </View>
                                    <Text style={styles.etaLabel}>STATUS</Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.detailGrid}>
                                <View style={styles.detailCell}>
                                    <View style={styles.iconBox}>
                                        <Ionicons name="person" size={16} color={COLORS.primary} />
                                    </View>
                                    <View>
                                        <Text style={styles.cellLabel}>Driver</Text>
                                        <Text style={styles.cellValue}>{selectedTrip.driver?.user?.name || "Syncing..."}</Text>
                                    </View>
                                </View>
                                <View style={styles.detailCell}>
                                    <View style={styles.iconBox}>
                                        <Ionicons name="speedometer" size={16} color={COLORS.primary} />
                                    </View>
                                    <View>
                                        <Text style={styles.cellLabel}>Speed</Text>
                                        <Text style={styles.cellValue}>{selectedTrip.tripLocations?.[0]?.speed?.toFixed(0) || "0"} km/h</Text>
                                    </View>
                                </View>
                            </View>

                            <Pressable style={styles.actionBtn}>
                                <LinearGradient
                                    colors={[COLORS.primary, COLORS.primary + "CC"]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.gradientBtn}
                                >
                                    <Ionicons name="call" size={18} color="#FFF" />
                                    <Text style={styles.btnText}>Contact Transport Head</Text>
                                </LinearGradient>
                            </Pressable>
                        </BlurView>
                    </Animated.View>
                ) : (
                    <Animated.View entering={FadeInUp} style={styles.emptyCard}>
                        <BlurView intensity={80} style={styles.glassCard}>
                            <View style={styles.emptyContent}>
                                <View style={styles.emptyIconBox}>
                                    <Ionicons name="bus" size={32} color={COLORS.textMuted} />
                                </View>
                                <Text style={styles.emptyTitle}>No Active Trips</Text>
                                <Text style={styles.emptyText}>School buses are currently offline or in depot. Active tracking updates during school hours.</Text>
                            </View>
                        </BlurView>
                    </Animated.View>
                )}
            </View>

            {user?.role === "parent" ? <ParentBottomNav /> : <BottomNav />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    headerWrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    mapWrapper: { flex: 1 },
    map: { flex: 1 },
    loader: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 20,
    },
    loaderText: {
        marginTop: 15,
        fontSize: 14,
        fontWeight: "600",
        color: COLORS.primary,
        letterSpacing: 0.5,
    },
    topOverlay: {
        position: 'absolute',
        left: 20,
        right: 20,
        zIndex: 5,
    },
    topCard: {
        borderRadius: 20,
        padding: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.6)',
    },
    tripStatusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    activeIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    pulseDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.textMuted,
    },
    activeText: {
        fontSize: 11,
        fontWeight: '800',
        color: COLORS.textPrimary,
        letterSpacing: 1,
    },
    refreshBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 20,
        right: 20,
    },
    infoCard: {
        borderRadius: 30,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.7)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 8,
    },
    glassCard: {
        padding: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    busInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    busIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    busModel: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    routeLabel: {
        fontSize: 12,
        color: COLORS.textMuted,
        fontWeight: '600',
    },
    etaBox: {
        alignItems: 'flex-end',
    },
    liveBadge: {
        backgroundColor: COLORS.success + '20',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    etaValue: {
        fontSize: 14,
        fontWeight: '900',
        color: COLORS.success,
        textTransform: 'uppercase',
    },
    etaLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.textMuted,
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.05)',
        marginBottom: 16,
    },
    detailGrid: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 20,
    },
    detailCell: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    iconBox: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: COLORS.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cellLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: COLORS.textMuted,
    },
    cellValue: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    actionBtn: {
        borderRadius: 18,
        overflow: 'hidden',
    },
    gradientBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 54,
        gap: 12,
    },
    btnText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '700',
    },
    emptyCard: {
        borderRadius: 30,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.7)',
    },
    emptyContent: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    emptyIconBox: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(0,0,0,0.03)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    emptyText: {
        fontSize: 13,
        color: COLORS.textMuted,
        textAlign: 'center',
        paddingHorizontal: 30,
        lineHeight: 18,
    }
});
