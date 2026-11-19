import { useState } from 'react';
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { sendEmergencySMS } from '../utils/sendSMS';
import { Flame, Cross, Swords, HelpCircle, X, AlertTriangle, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const sosTypes = [
  { type: 'fire', label: 'Fire', icon: Flame, color: 'from-red-600 to-orange-500', bg: 'bg-red-500/20', border: 'border-red-500/30' },
  { type: 'medical', label: 'Medical', icon: Cross, color: 'from-blue-600 to-cyan-500', bg: 'bg-blue-500/20', border: 'border-blue-500/30' },
  { type: 'violence', label: 'Violence', icon: Swords, color: 'from-purple-600 to-pink-500', bg: 'bg-purple-500/20', border: 'border-purple-500/30' },
  { type: 'others', label: 'Others', icon: HelpCircle, color: 'from-gray-600 to-gray-400', bg: 'bg-gray-500/20', border: 'border-gray-500/30' },
];

export default function SOSModal({ isOpen, onClose }) {
  const { userData } = useAuth();
  const [selectedType, setSelectedType] = useState(null);
  const [customMessage, setCustomMessage] = useState('');
  const [sending, setSending] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!selectedType) {
      toast.error('Please select an emergency type');
      return;
    }
    if (selectedType === 'others' && !customMessage.trim()) {
      toast.error('Please describe the emergency');
      return;
    }

    setSending(true);
    try {
      // Get current location
      let location = { lat: 13.0827, lng: 80.2707 }; // default
      try {
        const pos = await new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
        );
        location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      } catch {
        console.warn('Could not get location, using default');
      }

      // Create SOS event
      await addDoc(collection(db, 'sos_events'), {
        companyId: userData.companyId,
        triggeredBy: userData.uid,
        triggeredByName: userData.name || 'Unknown',
        type: selectedType,
        customMessage: selectedType === 'others' ? customMessage : '',
        location,
        status: 'not_resolved',
        timestamp: serverTimestamp()
      });

      // Show OS notification
      if (Notification.permission === 'granted') {
        new Notification('🚨 EMERGENCY SOS', {
          body: `${selectedType.toUpperCase()} emergency reported by ${userData.name}`,
          requireInteraction: true,
          vibrate: [300, 100, 300, 100, 300]
        });
      }

      // Send SMS to all company members
      try {
        const guestsSnap = await getDocs(
          query(collection(db, 'guests'), where('companyId', '==', userData.companyId))
        );
        const usersSnap = await getDocs(
          query(collection(db, 'users'), where('companyId', '==', userData.companyId))
        );

        const mobiles = [];
        guestsSnap.forEach(doc => {
          const d = doc.data();
          if (d.mobile) mobiles.push(d.mobile);
        });
        usersSnap.forEach(doc => {
          const d = doc.data();
          if (d.mobile) mobiles.push(d.mobile);
        });

        const uniqueMobiles = [...new Set(mobiles)].filter(m => m.length === 10);
        if (uniqueMobiles.length > 0) {
          const msg = `🚨 EMERGENCY ALERT: ${selectedType.toUpperCase()} reported by ${userData.name}. Check SafeSignal app immediately.`;
          await sendEmergencySMS(uniqueMobiles, msg);
        }
      } catch (smsErr) {
        console.error('SMS send error:', smsErr);
      }

      toast.success('🚨 SOS Alert sent to all members!');
      onClose();
      setSelectedType(null);
      setCustomMessage('');
    } catch (err) {
      console.error(err);
      toast.error('Failed to send SOS');
    }
    setSending(false);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg glass-strong rounded-3xl p-8 animate-fade-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-sos-red/20 border border-sos-red/30 mb-4">
            <AlertTriangle className="w-8 h-8 text-sos-red animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-white">SELECT EMERGENCY TYPE</h2>
          <p className="text-gray-400 text-sm mt-2">Choose the type of emergency to alert all members</p>
        </div>

        {/* SOS Type Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {sosTypes.map(({ type, label, icon: Icon, color, bg, border }) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`relative p-6 rounded-2xl border transition-all duration-300 text-center group ${
                selectedType === type
                  ? `${bg} ${border} scale-[1.02]`
                  : 'border-white/5 hover:border-white/15 bg-white/3'
              }`}
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${color} mb-3 group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-white font-semibold">{label}</p>
              {selectedType === type && (
                <div className="absolute top-2 right-2 w-3 h-3 bg-white rounded-full"></div>
              )}
            </button>
          ))}
        </div>

        {/* Custom message for "Others" */}
        {selectedType === 'others' && (
          <div className="mb-6 animate-fade-in">
            <label className="block text-sm text-gray-400 mb-2">Describe the emergency</label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="input-dark resize-none h-24"
              placeholder="What's happening?..."
              autoFocus
            />
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={sending || !selectedType}
          className="w-full py-4 bg-gradient-to-r from-sos-red to-red-600 rounded-xl text-white font-bold text-lg hover:opacity-90 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {sending ? (
            <>
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Sending Alert...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              SEND SOS ALERT
            </>
          )}
        </button>
      </div>
    </div>
  );
}
