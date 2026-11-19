import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../hooks/useLocation';
import { useSOS } from '../hooks/useSOS';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, getMessagingInstance } from '../firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { LogOut, ShieldAlert, HeartHandshake, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import NotificationBanner from '../components/NotificationBanner';
import SOSModal from '../components/SOSModal';
import LiveMap from '../components/LiveMap';
import AdminPanel from '../components/AdminPanel';

export default function Home() {
  const { userData, logout } = useAuth();
  const navigate = useNavigate();
  const { position, error: locationError } = useLocation();
  const { activeEvent, loading: sosLoading } = useSOS();
  
  const [isSOSModalOpen, setIsSOSModalOpen] = useState(false);
  const [requestingHelp, setRequestingHelp] = useState(false);

  // FCM Setup
  useEffect(() => {
    if (!userData?.uid) return;

    const setupFCM = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const messaging = await getMessagingInstance();
          if (messaging) {
            const token = await getToken(messaging, {
              vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY // Will work even if empty in Spark plan, just won't receive push
            });
            
            if (token) {
              const collection = userData.role === 'guest' ? 'guests' : 'users';
              await updateDoc(doc(db, collection, userData.uid), { fcmToken: token });
              
              onMessage(messaging, (payload) => {
                toast((t) => (
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <p className="font-bold">{payload.notification.title}</p>
                      <p className="text-sm">{payload.notification.body}</p>
                    </div>
                  </div>
                ), { duration: 5000, position: 'top-center' });
              });
            }
          }
        }
      } catch (err) {
        console.log('FCM setup failed/unsupported:', err);
      }
    };

    setupFCM();
  }, [userData?.uid, userData?.role]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      toast.error('Failed to log out');
    }
  };

  const handleHelpRequest = async () => {
    if (!userData?.uid) return;
    setRequestingHelp(true);
    try {
      await updateDoc(doc(db, 'locations', userData.uid), {
        needsHelp: true,
        updatedAt: serverTimestamp()
      });
      toast.success('Help requested! You are marked on the map.');
    } catch (err) {
      toast.error('Failed to request help');
    }
    setRequestingHelp(false);
  };

  if (!userData) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-sos-blue/30 border-t-sos-blue rounded-full animate-spin"></div>
      </div>
    );
  }

  const activeSOSExists = activeEvent != null;

  return (
    <div className="min-h-screen bg-dark-900 text-white font-sans flex flex-col relative">
      <NotificationBanner />

      {/* Top Bar */}
      <header className="px-6 py-4 glass border-b border-white/5 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sos-red to-sos-orange flex items-center justify-center shadow-lg shadow-sos-red/20">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">
              Safe<span className="text-transparent bg-clip-text bg-gradient-to-r from-sos-red to-sos-orange">Signal</span>
            </h1>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-400">{userData.name}</span>
              <span className="text-gray-600">•</span>
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-gray-300 capitalize">
                {userData.role.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Location Status */}
        {locationError && (
          <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 px-4 py-3 rounded-xl text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>Location access denied. For your safety, please enable GPS tracking in your browser settings so responders can find you.</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => setIsSOSModalOpen(true)}
            className="sos-btn h-48 md:h-64 rounded-3xl bg-gradient-to-br from-sos-red to-red-700 shadow-xl shadow-sos-red/20 flex flex-col items-center justify-center gap-4 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="relative z-10 text-center">
              <ShieldAlert className="w-20 h-20 text-white mx-auto mb-4 drop-shadow-md" />
              <h2 className="text-4xl font-black text-white tracking-widest drop-shadow-md">SOS</h2>
              <p className="text-red-100 font-medium mt-2">EMERGENCY ALERT</p>
            </div>
          </button>

          <button
            onClick={handleHelpRequest}
            disabled={!activeSOSExists || requestingHelp}
            className={`h-48 md:h-64 rounded-3xl flex flex-col items-center justify-center gap-4 transition-all duration-300 ${
              activeSOSExists
                ? 'help-btn bg-gradient-to-br from-sos-yellow to-orange-500 shadow-xl shadow-sos-yellow/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                : 'bg-dark-800 border border-white/5 text-gray-600 cursor-not-allowed opacity-80'
            }`}
          >
            <div className="relative z-10 text-center">
              <HeartHandshake className={`w-20 h-20 mx-auto mb-4 ${activeSOSExists ? 'text-white drop-shadow-md' : 'text-gray-600'}`} />
              <h2 className={`text-4xl font-black tracking-widest ${activeSOSExists ? 'text-white drop-shadow-md' : 'text-gray-600'}`}>HELP</h2>
              <p className={`font-medium mt-2 ${activeSOSExists ? 'text-orange-100' : 'text-gray-600'}`}>
                {activeSOSExists ? 'REQUEST RESCUE' : 'NO ACTIVE EMERGENCY'}
              </p>
            </div>
          </button>
        </div>

        {/* Map Section */}
        <div id="live-map" className="scroll-mt-24">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sos-green animate-pulse"></span>
            Live Operations Map
          </h3>
          <LiveMap activeEvent={activeEvent} />
        </div>

        {/* Management & Status Panel */}
        <div className="mt-8 pt-8 border-t border-white/10">
          <h3 className="text-xl font-bold text-white mb-6">
            {userData.role === 'guest' ? 'Network Status' : 'Management Dashboard'}
          </h3>
          <AdminPanel activeEvent={activeEvent} />
        </div>

      </main>

      <SOSModal isOpen={isSOSModalOpen} onClose={() => setIsSOSModalOpen(false)} />
    </div>
  );
}
