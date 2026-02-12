

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon missing in production build
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

// Create a special icon for current location
let LocationIcon = L.divIcon({
    className: 'current-location-marker',
    html: `<div style="background-color: var(--primary-color); width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3); animation: pulse 2s infinite;"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapWidgetProps {
    lat: number;
    lng: number;
    zoom?: number;
    provider?: 'osm' | 'google' | 'naver';
}

// Component to update map view when props change
function MapUpdater({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng], zoom);
    }, [lat, lng, zoom, map]);
    return null;
}

// Custom Zoom Control to match design system
function MapControls({ onLocationFound }: { onLocationFound: (pos: [number, number]) => void }) {
    const map = useMap();
    const [loading, setLoading] = useState(false);

    const handleMyLocation = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                map.flyTo([latitude, longitude], 15);
                onLocationFound([latitude, longitude]);
                setLoading(false);
            },
            (error) => {
                console.error("Error getting location:", error);
                alert('Could not get your location. Please check permissions.');
                setLoading(false);
            },
            { enableHighAccuracy: true }
        );
    };

    return (
        <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
            <button
                onClick={handleMyLocation}
                disabled={loading}
                className="btn-base btn-surface p-0 rounded-xl shadow-premium !min-w-0 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform disabled:opacity-50"
                style={{ height: 'calc(var(--spacing) * 2)', width: 'calc(var(--spacing) * 2)' }}
                title="My Location"
            >
                <span className={`material-symbols-outlined ${loading ? 'animate-spin' : ''}`} style={{ fontSize: 'calc(var(--content-size) * 1.5)' }}>
                    {loading ? 'sync' : 'my_location'}
                </span>
            </button>
            <div className="flex flex-col gap-1">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        map.zoomIn();
                    }}
                    className="btn-base btn-surface p-0 rounded-xl shadow-premium !min-w-0 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                    style={{ height: 'calc(var(--spacing) * 2)', width: 'calc(var(--spacing) * 2)' }}
                    title="Zoom In"
                >
                    <span className="material-symbols-outlined" style={{ fontSize: 'calc(var(--content-size) * 1.5)' }}>add</span>
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        map.zoomOut();
                    }}
                    className="btn-base btn-surface p-0 rounded-xl shadow-premium !min-w-0 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                    style={{ height: 'calc(var(--spacing) * 2)', width: 'calc(var(--spacing) * 2)' }}
                    title="Zoom Out"
                >
                    <span className="material-symbols-outlined" style={{ fontSize: 'calc(var(--content-size) * 1.5)' }}>remove</span>
                </button>
            </div>
        </div>
    );
}

const MapWidget: React.FC<MapWidgetProps> = ({ lat, lng, zoom = 13, provider = 'osm' }) => {
    const [currentPos, setCurrentPos] = useState<[number, number] | null>(null);

    // Add pulse animation for current location
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.2); opacity: 0.7; }
                100% { transform: scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        return () => { document.head.removeChild(style); };
    }, []);

    // Future implementation for Google/Naver maps switching
    if (provider === 'google') {
        return <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500 font-bold">Google Maps Placeholder (API Key Required)</div>;
    }
    if (provider === 'naver') {
        return <div className="flex items-center justify-center h-full bg-green-50 text-green-600 font-bold">Naver Maps Placeholder (Client ID Required)</div>;
    }

    return (
        <div className="h-full w-full relative z-0 group/map">
            <MapContainer
                center={[lat, lng]}
                zoom={zoom}
                scrollWheelZoom={true}
                doubleClickZoom={true}
                style={{ height: '100%', width: '100%', borderRadius: 'inherit' }}
                zoomControl={false}
                attributionControl={false}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[lat, lng]}>
                    <Popup>
                        Selected Location <br /> {lat.toFixed(4)}, {lng.toFixed(4)}
                    </Popup>
                </Marker>

                {currentPos && (
                    <>
                        <Circle
                            center={currentPos}
                            radius={300} // radius in meters
                            pathOptions={{
                                fillColor: 'var(--primary-color)',
                                fillOpacity: 0.25,
                                color: 'var(--primary-color)',
                                weight: 2,
                                dashArray: '5, 10'
                            }}
                        />
                        <Marker position={currentPos} icon={LocationIcon}>
                            <Popup>You are here</Popup>
                        </Marker>
                    </>
                )}

                <MapUpdater lat={lat} lng={lng} zoom={zoom} />
                <MapControls onLocationFound={setCurrentPos} />
            </MapContainer>
        </div>
    );
};

export default MapWidget;



