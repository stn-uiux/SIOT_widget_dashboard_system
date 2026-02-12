
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
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

const MapWidget: React.FC<MapWidgetProps> = ({ lat, lng, zoom = 13, provider = 'osm' }) => {

    // Future implementation for Google/Naver maps switching
    if (provider === 'google') {
        return <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500 font-bold">Google Maps Placeholder (API Key Required)</div>;
    }
    if (provider === 'naver') {
        return <div className="flex items-center justify-center h-full bg-green-50 text-green-600 font-bold">Naver Maps Placeholder (Client ID Required)</div>;
    }

    return (
        <div className="h-full w-full relative z-0">
            <MapContainer
                center={[lat, lng]}
                zoom={zoom}
                scrollWheelZoom={false}
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
                <MapUpdater lat={lat} lng={lng} zoom={zoom} />
            </MapContainer>

            {/* Overlay to prevent map interaction conflict with grid dragging if needed, 
          but usually z-index management handles this. 
          For now, we keep it simple. */}
        </div>
    );
};

export default MapWidget;
