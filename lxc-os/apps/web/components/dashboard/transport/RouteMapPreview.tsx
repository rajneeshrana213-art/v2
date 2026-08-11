import { useEffect, useRef } from 'react';
import L from 'leaflet';

interface Stop {
    id: string;
    name: string;
    latitude?: number | null;
    longitude?: number | null;
}

interface RouteMapPreviewProps {
    stops: Stop[];
}

const getCustomIcon = (index: number) => {
    // We can use a custom SVG for numbered markers if we want, or just a default marker
    return new L.Icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
};

export default function RouteMapPreview({ stops }: RouteMapPreviewProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMap = useRef<L.Map | null>(null);

    useEffect(() => {
        if (!mapRef.current) return;

        // Initialize map only once
        if (!leafletMap.current) {
            leafletMap.current = L.map(mapRef.current).setView([28.6139, 77.2090], 10);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(leafletMap.current);
        }

        const map = leafletMap.current;

        // Clear existing layers
        map.eachLayer((layer) => {
            if (layer instanceof L.Marker || layer instanceof L.Polyline) {
                map.removeLayer(layer);
            }
        });

        // Filter valid stops
        const validStops = stops.filter(s => s.latitude && s.longitude) as Array<Stop & { latitude: number, longitude: number }>;

        if (validStops.length > 0) {
            const latlngs: L.LatLngExpression[] = validStops.map(s => [s.latitude, s.longitude]);

            // Draw Polyline Route
            L.polyline(latlngs, { color: '#4f46e5', weight: 4, opacity: 0.8, dashArray: '10, 10' }).addTo(map);

            // Draw Markers
            validStops.forEach((stop, index) => {
                const isStart = index === 0;
                const isEnd = index === validStops.length - 1;

                L.marker([stop.latitude, stop.longitude], { icon: getCustomIcon(index) })
                    .addTo(map)
                    .bindPopup(`
                    <div style="font-family: inherit; text-align: center;">
                        <div style="font-size: 10px; font-weight: bold; color: #6b7280; text-transform: uppercase;">Stop ${index + 1}</div>
                        <div style="font-size: 14px; font-weight: bold; color: #111827; margin-top: 2px;">${stop.name}</div>
                        ${isStart ? '<div style="margin-top: 4px; display: inline-block; background: #10b981; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px;">START</div>' : ''}
                        ${isEnd && !isStart ? '<div style="margin-top: 4px; display: inline-block; background: #ef4444; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px;">END</div>' : ''}
                    </div>
                 `);
            });

            // Auto-fit bounds
            const bounds = L.latLngBounds(latlngs);
            if (validStops.length > 1) {
                map.fitBounds(bounds, { padding: [50, 50] });
            } else {
                map.setView(latlngs[0], 14);
            }
        }

        return () => {
            // Cleanup if completely unmounting
            if (leafletMap.current) {
                leafletMap.current.off();
                leafletMap.current.remove();
                leafletMap.current = null;
            }
        };
    }, [stops]);

    return <div ref={mapRef} style={{ height: '100%', width: '100%', borderRadius: '1.5rem', zIndex: 0 }} />;
}
