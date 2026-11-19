import { useState, useEffect } from 'react';
import { doc, updateDoc, collection, query, where, onSnapshot, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Shield, Clock, User, MapPin, AlertTriangle, CheckCircle2, Siren } from 'lucide-react';
import toast from 'react-hot-toast';
import QRGenerator from './QRGenerator';

export default function AdminPanel({ activeEvent }) {
  const { userData } = useAuth();
  const [users, setUsers] = useState([]);
  const [showQR, setShowQR] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    if (!userData?.companyId) return;

    const q = query(
      collection(db, 'locations'),
      where('companyId', '==', userData.companyId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setUsers(list);
    });

    return unsubscribe;
  }, [userData?.companyId]);

  const updateStatus = async (newStatus) => {
    if (!activeEvent?.id) return;
    setStatusUpdating(true);
    try {
      await updateDoc(doc(db, 'sos_events', activeEvent.id), { status: newStatus });
      
      if (newStatus === 'resolved') {
        // Reset everyone's needsHelp to false
        const locationsSnap = await getDocs(
          query(collection(db, 'locations'), where('companyId', '==', userData.companyId), where('needsHelp', '==', true))
        );
        if (!locationsSnap.empty) {
          const batch = writeBatch(db);
          locationsSnap.forEach((docSnap) => {
            batch.update(docSnap.ref, { needsHelp: false });
          });
          await batch.commit();
        }
        toast.success('Emergency Resolved! All members marked safe.');
      } else {
        toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
      }
    } catch (err) {
      console.error('Status update failed:', err);
      toast.error('Failed to update status');
    }
    setStatusUpdating(false);
  };

  const getTimeSince = (timestamp) => {
    if (!timestamp) return 'Just now';
    const seconds = Math.floor((Date.now() - timestamp.toDate?.().getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'not_resolved':
        return <span className="status-not-resolved px-3 py-1 rounded-full text-xs font-semibold">🔴 Not Resolved</span>;
      case 'on_rescue':
        return <span className="status-on-rescue px-3 py-1 rounded-full text-xs font-semibold">🟠 On Rescue</span>;
      case 'resolved':
        return <span className="status-resolved px-3 py-1 rounded-full text-xs font-semibold">✅ Resolved</span>;
      default:
        return null;
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'company_admin': return <span className="text-purple-400 text-xs font-medium">👑 Admin</span>;
      case 'staff': return <span className="text-blue-400 text-xs font-medium">👷 Staff</span>;
      default: return <span className="text-green-400 text-xs font-medium">🏃 Guest</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Active SOS Event Card */}
      {activeEvent && (
        <div className="glass rounded-2xl p-6 border border-sos-red/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sos-red/20 flex items-center justify-center">
                <Siren className="w-5 h-5 text-sos-red" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Active Emergency</h3>
                <p className="text-sm text-gray-400">{activeEvent.type?.toUpperCase()} — By {activeEvent.triggeredByName}</p>
              </div>
            </div>
            {getStatusBadge(activeEvent.status)}
          </div>

          {activeEvent.customMessage && (
            <div className="bg-white/5 rounded-xl p-3 mb-4">
              <p className="text-sm text-gray-300">"{activeEvent.customMessage}"</p>
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-400 mb-5">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" /> {getTimeSince(activeEvent.timestamp)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" /> {activeEvent.location?.lat?.toFixed(4)}, {activeEvent.location?.lng?.toFixed(4)}
            </span>
          </div>

          {/* Status Controls */}
          {userData.role !== 'guest' && (
            <div className="flex gap-2">
              <button
                onClick={() => updateStatus('not_resolved')}
                disabled={statusUpdating || activeEvent.status === 'not_resolved'}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  activeEvent.status === 'not_resolved'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-white/5 text-gray-400 hover:bg-red-500/10 hover:text-red-400'
                }`}
              >
                <AlertTriangle className="w-4 h-4" /> Not Resolved
              </button>
              <button
                onClick={() => updateStatus('on_rescue')}
                disabled={statusUpdating || activeEvent.status === 'on_rescue'}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  activeEvent.status === 'on_rescue'
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : 'bg-white/5 text-gray-400 hover:bg-orange-500/10 hover:text-orange-400'
                }`}
              >
                <Shield className="w-4 h-4" /> On Rescue
              </button>
              <button
                onClick={() => updateStatus('resolved')}
                disabled={statusUpdating || activeEvent.status === 'resolved'}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  activeEvent.status === 'resolved'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-white/5 text-gray-400 hover:bg-green-500/10 hover:text-green-400'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" /> Resolved
              </button>
            </div>
          )}
        </div>
      )}

      {/* QR Code Section (Admin only) */}
      {userData?.role === 'company_admin' && (
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Guest QR Code</h3>
            <button
              onClick={() => setShowQR(!showQR)}
              className="px-4 py-2 bg-gradient-to-r from-sos-purple to-indigo-600 rounded-xl text-sm text-white font-medium hover:opacity-90 transition-all"
            >
              {showQR ? 'Hide QR' : 'Show QR'}
            </button>
          </div>
          {showQR && <QRGenerator companyId={userData.companyId} />}
        </div>
      )}

      {/* Online Users Table */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <User className="w-5 h-5 text-sos-blue" />
          <h3 className="text-lg font-bold text-white">Online Members ({users.length})</h3>
        </div>

        {users.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <User className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>No members online</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                  <th className="pb-3 pr-4">Name</th>
                  <th className="pb-3 pr-4">Role</th>
                  <th className="pb-3 pr-4">Location</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u.id} className="group">
                    <td className="py-3 pr-4">
                      <span className="text-sm text-white font-medium">{u.name}</span>
                    </td>
                    <td className="py-3 pr-4">{getRoleBadge(u.role)}</td>
                    <td className="py-3 pr-4">
                      <span className="text-xs text-gray-500">
                        {u.lat?.toFixed(4)}, {u.lng?.toFixed(4)}
                      </span>
                    </td>
                    <td className="py-3">
                      {u.needsHelp ? (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-semibold">
                          🆘 Needs Help
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                          ✅ Safe
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
