import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

export function useSOS() {
  const { userData } = useAuth();
  const [activeEvent, setActiveEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userData?.companyId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'sos_events'),
      where('companyId', '==', userData.companyId),
      where('status', 'in', ['not_resolved', 'on_rescue'])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        // Fetch all active events and sort client-side to avoid composite index requirements
        const events = [];
        snapshot.forEach((doc) => {
          events.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort by timestamp descending
        events.sort((a, b) => {
          const timeA = a.timestamp?.toDate()?.getTime() || 0;
          const timeB = b.timestamp?.toDate()?.getTime() || 0;
          return timeB - timeA;
        });

        setActiveEvent(events[0]);
      } else {
        setActiveEvent(null);
      }
      setLoading(false);
    }, (err) => {
      console.error('SOS listener error:', err);
      setLoading(false);
    });

    return unsubscribe;
  }, [userData?.companyId]);

  return { activeEvent, loading };
}
