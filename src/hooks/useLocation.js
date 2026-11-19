import { useState, useEffect, useRef } from 'react';
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

export function useLocation() {
  const { userData } = useAuth();
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const watchRef = useRef(null);
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    if (!userData?.companyId || !userData?.uid) return;

    if (!navigator.geolocation) {
      setError('Geolocation is not supported');
      return;
    }

    const updateFirestore = async (lat, lng) => {
      const now = Date.now();
      // Throttle updates to every 10 seconds
      if (now - lastUpdateRef.current < 10000) return;
      lastUpdateRef.current = now;

      try {
        await setDoc(doc(db, 'locations', userData.uid), {
          lat,
          lng,
          uid: userData.uid,
          name: userData.name || 'Unknown',
          role: userData.role || 'guest',
          companyId: userData.companyId,
          needsHelp: false,
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (err) {
        console.error('Error updating location:', err);
      }
    };

    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition({ lat: latitude, lng: longitude });
        updateFirestore(latitude, longitude);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError(err.message);
        // Use a default location if geolocation fails
        const defaultLat = 13.0827;
        const defaultLng = 80.2707;
        setPosition({ lat: defaultLat, lng: defaultLng });
        updateFirestore(defaultLat, defaultLng);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000
      }
    );

    return () => {
      if (watchRef.current !== null) {
        navigator.geolocation.clearWatch(watchRef.current);
      }
      // Clean up location doc on unmount
      if (userData?.uid) {
        deleteDoc(doc(db, 'locations', userData.uid)).catch(() => {});
      }
    };
  }, [userData?.uid, userData?.companyId]);

  return { position, error };
}
