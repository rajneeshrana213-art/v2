import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LiveMapProps {
    trips: any[];
    selectedTripId?: string | null;
    route?: any;
    followMode?: boolean;
    currentUserLocation?: { lat: number; lng: number } | null;
    targetStopId?: string | null;
}

export default function LiveMap({
    trips,
    selectedTripId,
    route,
    followMode = false,
    currentUserLocation,
    targetStopId,
    onLocateMe
}: LiveMapProps & { onLocateMe?: () => void }) {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMap = useRef<L.Map | null>(null);
    const markersRef = useRef<{ [key: string]: L.Marker }>({});
    const userMarkerRef = useRef<L.Marker | null>(null);
    const stopsMarkersRef = useRef<L.Marker[]>([]);
    const polylineRef = useRef<L.Polyline | null>(null);
    const immediateMissionRef = useRef<L.Polyline | null>(null);
    const userToStopPathRef = useRef<L.Polyline | null>(null);
    const remainingPolylineRef = useRef<L.Polyline | null>(null);
    const actualPathRef = useRef<L.Polyline | null>(null);
    const tetherRef = useRef<L.Polyline | null>(null);
    const animationFrameRefs = useRef<{ [key: string]: number }>({});
    const hasAutoCentered = useRef(false);

    // Efficiency Refs
    const lastRouteIdRef = useRef<string | null>(null);
    const lastSelectedId = useRef<string | null>(null);
    const isFirstLoad = useRef(true);

    // --- 1. Bus Icon Definition ---
    const getBusIcon = (heading: number) => L.divIcon({
        className: 'custom-bus-icon-container',
        html: `
            <div style="position: relative; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;">
                <div class="bus-ping" style="
                    position: absolute;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: rgba(245, 158, 11, 0.2);
                    border: 2px solid rgba(245, 158, 11, 0.4);
                "></div>
                
                <div style="
                    position: relative;
                    width: 28px;
                    height: 48px;
                    background: #fbbf24;
                    border: 3px solid #b45309;
                    border-radius: 8px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.4);
                    transform: rotate(${heading}deg);
                    transition: transform 0.6s cubic-bezier(0.1, 0, 0.1, 1);
                    z-index: 10;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    overflow: hidden;
                ">
                    <div style="width: 100%; height: 10px; background: #334155; margin-top: 2px; border-bottom: 1px solid #b45309;"></div>
                    <div style="flex: 1; width: 100%; display: flex; flex-direction: column; gap: 5px; padding-top: 6px;">
                        <div style="width: 70%; height: 2px; background: rgba(0,0,0,0.1); margin: 0 auto;"></div>
                        <div style="width: 70%; height: 2px; background: rgba(0,0,0,0.1); margin: 0 auto;"></div>
                        <div style="width: 70%; height: 2px; background: rgba(0,0,0,0.1); margin: 0 auto;"></div>
                    </div>
                </div>
            </div>
        `,
        iconSize: [60, 60],
        iconAnchor: [30, 30],
    });

    const userIcon = L.divIcon({
        className: 'custom-user-icon',
        html: `
            <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
                <div class="user-ping" style="
                    position: absolute;
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    background: rgba(59, 130, 246, 0.2);
                    border: 2px solid rgba(59, 130, 246, 0.4);
                "></div>
                <div style="
                    position: relative;
                    width: 14px;
                    height: 14px;
                    background: #3b82f6;
                    border: 2px solid white;
                    border-radius: 50%;
                    box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
                    z-index: 10;
                "></div>
            </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
    });

    const stopIcon = L.divIcon({
        className: 'custom-stop-icon',
        html: `<div style="background-color: white; width: 16px; height: 16px; border-radius: 50%; border: 4px solid #6366f1; box-shadow: 0 2px 8px rgba(0,0,0,0.2);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
    });

    const nextStopIcon = L.divIcon({
        className: 'custom-next-stop-icon',
        html: `<div style="background-color: #f59e0b; width: 26px; height: 26px; border-radius: 50%; border: 4px solid white; box-shadow: 0 0 15px rgba(245, 158, 11, 0.5); display: flex; align-items: center; justify-content: center; animation: marker-ping 2s infinite;">
                 <div style="width: 10px; height: 10px; border-radius: 50%; background: white;"></div>
               </div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
    });

    // --- 2. Smoothing Logic ---
    const smoothMove = (id: string, marker: L.Marker, target: L.LatLng) => {
        const start = marker.getLatLng();
        if (start.equals(target)) return;
        if (animationFrameRefs.current[id]) cancelAnimationFrame(animationFrameRefs.current[id]);

        const startT = performance.now();
        const duration = followMode ? 500 : 3000;

        const frame = (now: number) => {
            const p = Math.min((now - startT) / duration, 1);
            const ep = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
            marker.setLatLng([
                start.lat + (target.lat - start.lat) * ep,
                start.lng + (target.lng - start.lng) * ep
            ]);
            if (p < 1) animationFrameRefs.current[id] = requestAnimationFrame(frame);
        };
        animationFrameRefs.current[id] = requestAnimationFrame(frame);
    };

    // --- 3. Main Effect ---
    useEffect(() => {
        if (!mapRef.current) return;

        if (!leafletMap.current) {
            leafletMap.current = L.map(mapRef.current, {
                zoomControl: false,
                attributionControl: false
            }).setView([20.5937, 78.9629], 5);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(leafletMap.current);
            setTimeout(() => leafletMap.current?.invalidateSize(), 500);
        }

        const map = leafletMap.current;

        // --- User Marker ---
        if (currentUserLocation) {
            const uPos = L.latLng(currentUserLocation.lat, currentUserLocation.lng);
            if (userMarkerRef.current) {
                userMarkerRef.current.setLatLng(uPos);
            } else {
                userMarkerRef.current = L.marker(uPos, {
                    icon: userIcon,
                    zIndexOffset: 2000
                }).addTo(map).bindPopup("<b>Your Current Location</b>");

                if (!hasAutoCentered.current) {
                    map.setView(uPos, 16);
                    hasAutoCentered.current = true;
                }
            }
        } else if (userMarkerRef.current) {
            userMarkerRef.current.remove();
            userMarkerRef.current = null;
        }

        if (trips.length === 0) return;

        // Data Selection
        let activeTrip = trips.find(t => t.id === selectedTripId);
        if (!activeTrip || !activeTrip.tripLocations?.[0]) {
            activeTrip = trips.find(t => t.tripLocations?.[0]) || trips[0];
        }

        const loc = activeTrip?.tripLocations?.[0];
        const effectiveRoute = route || activeTrip?.route;
        const currentRouteId = effectiveRoute?.id || null;

        // --- Route & Stops (Static items) ---
        if (effectiveRoute?.busStops?.length > 0) {
            const stopsChanged = currentRouteId !== lastRouteIdRef.current;

            if (stopsChanged) {
                const stops = [...effectiveRoute.busStops]
                    .filter(s => (s.latitude || s.lat) && (s.longitude || s.lng))
                    .sort((a, b) => (a.order || 0) - (b.order || 0));

                if (stops.length > 0) {
                    const stopCoords: L.LatLngExpression[] = stops.map(s => [s.latitude || s.lat, s.longitude || s.lng]);

                    // Update or create main polyline
                    if (polylineRef.current) {
                        polylineRef.current.setLatLngs(stopCoords);
                    } else {
                        polylineRef.current = L.polyline(stopCoords, {
                            color: '#4f46e5',
                            weight: 6,
                            opacity: 0.15,
                            lineJoin: 'round'
                        }).addTo(map);
                    }

                    // Update stop markers - ONLY if route changed to prevent flickering
                    stopsMarkersRef.current.forEach(m => m.remove());
                    stopsMarkersRef.current = stops.map((s, i) => {
                        return L.marker([s.latitude || s.lat, s.longitude || s.lng], {
                            icon: stopIcon,
                            zIndexOffset: 10
                        }).addTo(map).bindPopup(`<b>Stop ${i + 1}: ${s.name}</b>`);
                    });
                }
                lastRouteIdRef.current = currentRouteId;
            }
        } else if (lastRouteIdRef.current) {
            // Clear route visual if no route provided
            if (polylineRef.current) polylineRef.current.setLatLngs([]);
            stopsMarkersRef.current.forEach(m => m.remove());
            stopsMarkersRef.current = [];
            lastRouteIdRef.current = null;
        }

        // --- Dynamic Paths (Mission, Actual Path, & Tether) ---
        if (effectiveRoute?.busStops?.length > 0 && loc) {
            const stops = [...effectiveRoute.busStops]
                .filter(s => (s.latitude || s.lat) && (s.longitude || s.lng))
                .sort((a, b) => (a.order || 0) - (b.order || 0));

            const busPos = L.latLng(loc.latitude || loc.lat, loc.longitude || loc.lng);
            let minD = Infinity;
            let nextIdx = 0;
            let nearestPointOnRoute: L.LatLng = L.latLng(stops[0].latitude || stops[0].lat, stops[0].longitude || stops[0].lng);

            stops.forEach((s, i) => {
                const stopPos = L.latLng(s.latitude || s.lat, s.longitude || s.lng);
                const d = busPos.distanceTo(stopPos);
                if (d < minD) {
                    minD = d;
                    nextIdx = i;
                    nearestPointOnRoute = stopPos;
                }
            });

            // Adjust nextIdx if we've passed the "nearest" stop
            if (minD < 150 && nextIdx < stops.length - 1) nextIdx++;

            // 1. Mission Path (Bus to Next Stop)
            const immediateCoords: L.LatLngExpression[] = [
                [busPos.lat, busPos.lng],
                [stops[nextIdx].latitude || stops[nextIdx].lat, stops[nextIdx].longitude || stops[nextIdx].lng]
            ];

            if (immediateMissionRef.current) {
                immediateMissionRef.current.setLatLngs(immediateCoords);
            } else {
                immediateMissionRef.current = L.polyline(immediateCoords, {
                    color: '#f59e0b',
                    weight: 8,
                    opacity: 1,
                    className: 'mission-path-style'
                }).addTo(map);
            }

            // 2. Tether Path (Bus to nearest point on planned route)
            const tetherCoords: L.LatLngExpression[] = [
                [busPos.lat, busPos.lng],
                [nearestPointOnRoute.lat, nearestPointOnRoute.lng]
            ];
            if (tetherRef.current) {
                tetherRef.current.setLatLngs(tetherCoords);
            } else {
                tetherRef.current = L.polyline(tetherCoords, {
                    color: '#f59e0b',
                    weight: 2,
                    dashArray: '5, 8',
                    opacity: 0.8
                }).addTo(map);
            }

            // 3. Remaining Route (Dashed progress)
            const remainingCoords: L.LatLngExpression[] = stops.slice(nextIdx).map(s => [s.latitude || s.lat, s.longitude || s.lng]);
            if (remainingPolylineRef.current) {
                remainingPolylineRef.current.setLatLngs(remainingCoords);
            } else {
                remainingPolylineRef.current = L.polyline(remainingCoords, {
                    color: '#6366f1',
                    weight: 4,
                    opacity: 0.5,
                    dashArray: '1, 12'
                }).addTo(map);
            }

            // 4. Actual Traveled Path (Historical Breadcrumbs) - Reverse for chronological order
            const historicCoords = [...(activeTrip.tripLocations || [])]
                .filter((l: any) => (l.latitude || l.lat) && (l.longitude || l.lng))
                .reverse()
                .map((l: any) => [l.latitude || l.lat, l.longitude || l.lng]) as L.LatLngExpression[];

            if (actualPathRef.current) {
                actualPathRef.current.setLatLngs(historicCoords);
            } else {
                actualPathRef.current = L.polyline(historicCoords, {
                    color: '#14b8a6', // Teal
                    weight: 3,
                    opacity: 0.6,
                    lineCap: 'round',
                    className: 'actual-path-style'
                }).addTo(map);
            }

            // Update Next Stop marker icon specifically
            stopsMarkersRef.current.forEach((m, i) => {
                const isNext = i === nextIdx;
                const isUserTarget = stops[i].id === targetStopId;
                const isPassed = i < nextIdx;

                m.setIcon(isNext ? nextStopIcon : stopIcon);
                m.setOpacity(isPassed ? 0.3 : 1);
                m.setZIndexOffset(isNext || isUserTarget ? 100 : 0);
            });
        }

        // --- User-to-Stop Path ---
        if (currentUserLocation && effectiveRoute?.busStops?.length > 0) {
            const stops = effectiveRoute.busStops;
            const targetStop = targetStopId ? stops.find((s: any) => s.id === targetStopId) : stops[0];
            if (targetStop) {
                const userPath: L.LatLngExpression[] = [
                    [currentUserLocation.lat, currentUserLocation.lng],
                    [targetStop.latitude || targetStop.lat, targetStop.longitude || targetStop.lng]
                ];
                if (userToStopPathRef.current) {
                    userToStopPathRef.current.setLatLngs(userPath);
                } else {
                    userToStopPathRef.current = L.polyline(userPath, {
                        color: '#3b82f6', weight: 4, dashArray: '8, 12', opacity: 0.6
                    }).addTo(map);
                }
            }
        } else if (userToStopPathRef.current) {
            userToStopPathRef.current.remove();
            userToStopPathRef.current = null;
        }

        // --- Bus Markers ---
        const activeIds = new Set(trips.map(t => t.id));
        Object.keys(markersRef.current).forEach(id => {
            if (!activeIds.has(id)) {
                markersRef.current[id].remove();
                delete markersRef.current[id];
            }
        });

        trips.forEach(t => {
            const tLoc = t.tripLocations?.[0];
            if (!tLoc) return;
            const pos = L.latLng(tLoc.latitude || tLoc.lat, tLoc.longitude || tLoc.lng);
            const heading = tLoc.heading || 0;

            if (markersRef.current[t.id]) {
                smoothMove(t.id, markersRef.current[t.id], pos);
                // Only update icon if it's the selected one or on significant change to avoid micro-flicker
                markersRef.current[t.id].setIcon(getBusIcon(heading));
            } else {
                markersRef.current[t.id] = L.marker(pos, {
                    icon: getBusIcon(heading),
                    zIndexOffset: 1000
                }).addTo(map);
            }
        });

        // --- Smarter Centering ---
        if (loc && (loc.latitude || loc.lat)) {
            const p = L.latLng(loc.latitude || loc.lat, loc.longitude || loc.lng);
            const selectionChanged = selectedTripId !== lastSelectedId.current;

            if (followMode) {
                map.setView(p, map.getZoom(), { animate: true });
            } else if (selectionChanged || isFirstLoad.current) {
                if (currentUserLocation) {
                    const bounds = L.latLngBounds([p, L.latLng(currentUserLocation.lat, currentUserLocation.lng)]);
                    map.flyToBounds(bounds, { padding: [100, 100], duration: 1.5 });
                } else {
                    map.flyTo(p, Math.max(map.getZoom(), 16), { duration: 1.5 });
                }
                lastSelectedId.current = selectedTripId || null;
                isFirstLoad.current = false;
            }
        }

    }, [trips, selectedTripId, route, followMode, currentUserLocation, targetStopId]);

    return (
        <div style={{ height: '100%', width: '100%', position: 'relative', zIndex: 1 }}>
            <div ref={mapRef} style={{ height: '100%', width: '100%' }} className="bg-slate-50" />
            <style jsx global>{`
                .mission-path-glow {
                    stroke-linecap: round;
                    filter: drop-shadow(0 0 6px #f59e0b);
                }
                .actual-path-style {
                    stroke-linecap: round;
                    filter: drop-shadow(0 0 4px rgba(20, 184, 166, 0.4));
                }
                .bus-ping, .user-ping {
                    animation: bus-ping-anim 2s infinite;
                }
                @keyframes bus-ping-anim {
                    0% { transform: scale(0.8); opacity: 0.8; }
                    100% { transform: scale(1.5); opacity: 0; }
                }
                @keyframes marker-ping {
                    0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
                    70% { box-shadow: 0 0 0 15px rgba(245, 158, 11, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
                }
                .actual-path-style {
                    filter: drop-shadow(0 0 4px #14b8a6);
                    stroke-dasharray: 8, 12;
                    animation: path-flow 2s linear infinite;
                }
                .mission-path-style {
                    filter: drop-shadow(0 0 6px #f59e0b);
                }
                @keyframes path-flow {
                    from { stroke-dashoffset: 20; }
                    to { stroke-dashoffset: 0; }
                }
                .leaflet-container {
                    border-radius: 3rem;
                    overflow: hidden;
                    background: #f8fafc !important;
                }
                .leaflet-marker-icon.leaflet-div-icon,
                .leaflet-marker-icon.custom-bus-icon-container,
                .leaflet-marker-icon.custom-user-icon,
                .leaflet-marker-icon.custom-stop-icon,
                .leaflet-marker-icon.custom-next-stop-icon {
                    background: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                }
                .locate-me-btn {
                    position: absolute;
                    bottom: 24px;
                    right: 24px;
                    z-index: 1000;
                    width: 52px;
                    height: 52px;
                    background: white;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
                    cursor: pointer;
                    border: 1px solid rgba(0,0,0,0.05);
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    color: #4f46e5;
                }
                .locate-me-btn:hover {
                    transform: scale(1.1) translateY(-2px);
                    box-shadow: 0 15px 30px rgba(79, 70, 229, 0.2);
                    color: #4338ca;
                }
                .locate-me-btn:active {
                    transform: scale(0.9);
                }
                .map-legend {
                    position: absolute;
                    top: 16px;
                    right: 16px;
                    z-index: 1000;
                    padding: 8px 12px;
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(12px);
                    border-radius: 14px;
                    border: 1px solid rgba(0,0,0,0.05);
                    box-shadow: 0 4px 15px rgba(0,0,0,0.08);
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    max-width: 140px;
                }
                @media (max-width: 768px) {
                    .map-legend {
                        top: auto;
                        bottom: 80px;
                        right: 16px;
                        padding: 6px 10px;
                        max-width: 120px;
                    }
                }
                .dark .map-legend {
                    background: rgba(15, 23, 42, 0.95);
                    border-color: rgba(255,255,255,0.08);
                }
                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 8px;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.03em;
                    color: #475569;
                }
                .dark .legend-item { color: #94a3b8; }
                .legend-color {
                    width: 8px;
                    height: 8px;
                    border-radius: 2px;
                    flex-shrink: 0;
                }
            `}</style>

            <div className="map-legend hidden md:flex">
                <div className="legend-item">
                    <div className="legend-color bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                    <span>Planned Route</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                    <span>Active Mission</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]" />
                    <span>Actual Path</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color border-2 border-dashed border-amber-500" />
                    <span>Route Tether</span>
                </div>
            </div>

            {currentUserLocation && (
                <button
                    onClick={() => {
                        if (leafletMap.current && currentUserLocation) {
                            leafletMap.current.flyTo(
                                [currentUserLocation.lat, currentUserLocation.lng],
                                17,
                                { duration: 1.5 }
                            );
                            if (onLocateMe) onLocateMe();
                        }
                    }}
                    className="locate-me-btn"
                    title="Center on my location"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M3 12h3m12 0h3M12 3v3m0 12v3" /></svg>
                </button>
            )}
        </div>
    );
}
