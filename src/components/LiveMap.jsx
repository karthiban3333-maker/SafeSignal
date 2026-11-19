import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue with webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function createCustomIcon(color, emoji, size = 36) {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: ${color};
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${size * 0.45}px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.4);
        position: relative;
      ">
        ${emoji}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

function createSOSIcon() {
  return L.divIcon({
    className: 'sos-marker',
    html: `
      <div style="position: relative; width: 50px; height: 50px;">
        <div style="
          position: absolute; inset: 0;
          border-radius: 50%;
          background: rgba(255, 45, 85, 0.3);
          animation: pulse-ring 1.5s ease-out infinite;
        "></div>
        <div style="
          position: absolute; inset: 8px;
          border-radius: 50%;
          background: rgba(255, 45, 85, 0.5);
          animation: pulse-ring 1.5s ease-out infinite 0.3s;
        "></div>
        <div style="
          position: absolute; inset: 14px;
          border-radius: 50%;
          background: #ff2d55;
          border: 3px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
          color: white;
          box-shadow: 0 0 20px rgba(255, 45, 85, 0.6);
        ">🚨</div>
      </div>
    `,
    iconSize: [50, 50],
    iconAnchor: [25, 25],
    popupAnchor: [0, -25],
  });
}

// Auto-recenter component
function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], 16, { animate: true });
    }
  }, [center?.lat, center?.lng]);
  return null;
}

export default function LiveMap({ activeEvent }) {
  const { userData } = useAuth();
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    if (!userData?.companyId) return;

    const q = query(
      collection(db, 'locations'),
      where('companyId', '==', userData.companyId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const locs = [];
      snapshot.forEach((doc) => {
        locs.push({ id: doc.id, ...doc.data() });
      });
      setLocations(locs);
    });

    return unsubscribe;
  }, [userData?.companyId]);

  const getMarkerIcon = (loc) => {
    if (loc.needsHelp) return createCustomIcon('#ff3b30', '🆘', 40);
    switch (loc.role) {
      case 'company_admin': return createCustomIcon('#af52de', '👑', 38);
      case 'staff': return createCustomIcon('#007aff', '👷', 36);
      default: return createCustomIcon('#34c759', '🏃', 34);
    }
  };

  const center = useMemo(() => {
    if (activeEvent?.location) return activeEvent.location;
    if (locations.length > 0) return { lat: locations[0].lat, lng: locations[0].lng };
    return { lat: 13.0827, lng: 80.2707 };
  }, [activeEvent?.location, locations]);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'company_admin': return '🟣 Admin';
      case 'staff': return '🔵 Staff';
      case 'guest': return '🟢 Guest';
      default: return '⚪ User';
    }
  };

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-white/10" style={{ height: '400px' }}>
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
        .custom-marker, .sos-marker { background: none !important; border: none !important; }
      `}</style>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={16}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapRecenter center={activeEvent?.location || center} />

        {/* SOS Origin Marker */}
        {activeEvent?.location && (
          <>
            <Circle
              center={[activeEvent.location.lat, activeEvent.location.lng]}
              radius={100}
              pathOptions={{
                color: '#ff2d55',
                fillColor: '#ff2d55',
                fillOpacity: 0.1,
                weight: 2,
                dashArray: '5, 10',
              }}
            />
            <Marker
              position={[activeEvent.location.lat, activeEvent.location.lng]}
              icon={createSOSIcon()}
            >
              <Popup>
                <div className="text-center">
                  <p className="font-bold text-sos-red text-sm">🚨 SOS ORIGIN</p>
                  <p className="text-xs mt-1">{activeEvent.type?.toUpperCase()} Emergency</p>
                  <p className="text-xs text-gray-400">By: {activeEvent.triggeredByName}</p>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* User Location Markers */}
        {locations.map((loc) => (
          <Marker
            key={loc.id}
            position={[loc.lat, loc.lng]}
            icon={getMarkerIcon(loc)}
          >
            <Popup>
              <div>
                <p className="font-bold text-sm text-white">{loc.name}</p>
                <p className="text-xs text-gray-300">{getRoleBadge(loc.role)}</p>
                {loc.needsHelp && (
                  <p className="text-xs text-red-400 font-bold mt-1">⚠️ NEEDS HELP</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
