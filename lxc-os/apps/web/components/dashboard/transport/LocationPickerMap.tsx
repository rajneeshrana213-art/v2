import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationPickerMapProps {
    position: [number, number] | null;
    onPositionChange: (lat: number, lng: number) => void;
}

const getCustomIcon = () => new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

export default function LocationPickerMap({ position, onPositionChange }: LocationPickerMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMap = useRef<L.Map | null>(null);
    const marker = useRef<L.Marker | null>(null);

    // Use a ref for the callback so the click handler doesn't need to be re-bound
    const onPositionChangeRef = useRef(onPositionChange);
    useEffect(() => {
        onPositionChangeRef.current = onPositionChange;
    }, [onPositionChange]);

    useEffect(() => {
        if (!mapRef.current) return;

        if (!leafletMap.current) {
            // Initialize map
            const initialCenter: L.LatLngExpression = position || [28.6139, 77.2090];
            leafletMap.current = L.map(mapRef.current).setView(initialCenter, 14);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(leafletMap.current);

            if (position) {
                marker.current = L.marker(position, { icon: getCustomIcon() }).addTo(leafletMap.current);
            }

            leafletMap.current.on('click', (e: L.LeafletMouseEvent) => {
                onPositionChangeRef.current(e.latlng.lat, e.latlng.lng);
            });

            // Ensure tile layout is correct by invalidating size after mount
            setTimeout(() => {
                leafletMap.current?.invalidateSize();
            }, 100);
        }

        return () => {
            // Cleanup to prevent memory leaks and strict-mode issues
            if (leafletMap.current) {
                leafletMap.current.off();
                leafletMap.current.remove();
                leafletMap.current = null;
                marker.current = null;
            }
        };
    }, []); // Run only once on mount

    // Watch position changes to update marker and map center
    useEffect(() => {
        if (!leafletMap.current) return;

        if (position) {
            if (!marker.current) {
                marker.current = L.marker(position, { icon: getCustomIcon() }).addTo(leafletMap.current);
            } else {
                marker.current.setLatLng(position);
            }

            // Only flyTo if the new position is sufficiently different to avoid jitter
            // when updating from map clicks
            const mapCenter = leafletMap.current.getCenter();
            const distance = mapCenter.distanceTo(L.latLng(position[0], position[1]));
            if (distance > 50) { // 50 meters
                leafletMap.current.flyTo(position, 14, { animate: true });
            }
        } else {
            if (marker.current) {
                marker.current.remove();
                marker.current = null;
            }
        }
    }, [position]);

    return (
        <div style={{ height: '100%', width: '100%', position: 'relative' }}>
            <div ref={mapRef} style={{ height: '100%', width: '100%', borderRadius: '1.5rem', zIndex: 0 }} />
            <style jsx global>{`
                .leaflet-tile {
                    max-width: none !important;
                    max-height: none !important;
                }
                .leaflet-container {
                    height: 100% !important;
                    width: 100% !important;
                }
            `}</style>
        </div>
    );
}
