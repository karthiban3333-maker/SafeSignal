import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, ArrowLeft, Smartphone, User, DoorOpen, Phone, Scan } from 'lucide-react';
import toast from 'react-hot-toast';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function GuestLogin() {
  const [searchParams, setSearchParams] = useSearchParams();
  const companyId = searchParams.get('cid') || '';
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    roomNumber: '',
    mobile: ''
  });
  const { guestLogin } = useAuth();
  const navigate = useNavigate();

  // Initialize QR Scanner when no companyId is present
  useEffect(() => {
    if (!companyId) {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        false
      );

      scanner.render(
        (decodedText) => {
          try {
            // Check if it's a valid URL with our cid parameter
            const url = new URL(decodedText);
            const cid = url.searchParams.get('cid');
            if (cid) {
              scanner.clear();
              toast.success('QR Code scanned successfully!');
              setSearchParams({ cid });
            } else {
              // Maybe they scanned just the raw ID somehow
              if (decodedText.length > 5) {
                scanner.clear();
                setSearchParams({ cid: decodedText });
              } else {
                toast.error("Invalid SafeSignal QR code");
              }
            }
          } catch (e) {
            // Not a URL, check if it's just a raw ID string
            if (decodedText.length > 5 && !decodedText.includes(' ')) {
              scanner.clear();
              setSearchParams({ cid: decodedText });
            } else {
              toast.error("Unrecognized QR code format");
            }
          }
        },
        (errorMessage) => {
          // Ignore frequent scanning errors
        }
      );

      return () => {
        scanner.clear().catch(console.error);
      };
    }
  }, [companyId, setSearchParams]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyId) {
      toast.error('Invalid QR code — no company ID found');
      return;
    }
    setLoading(true);
    try {
      await guestLogin(formData.name, formData.roomNumber, formData.mobile, companyId);
      toast.success('Welcome! You\'re now connected.');
      navigate('/home');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sos-green/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-sos-green to-emerald-500 mb-4">
            {companyId ? <Smartphone className="w-8 h-8 text-white" /> : <Scan className="w-8 h-8 text-white" />}
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Guest Access</h2>
          <p className="text-gray-400">
            {companyId ? 'Enter your details to join the emergency network' : 'Scan the company QR code to continue'}
          </p>
        </div>

        {!companyId ? (
          <div className="glass rounded-2xl p-6">
            <style>{`
              /* Styling for the html5-qrcode scanner to fit dark theme */
              #qr-reader { border: none !important; border-radius: 1rem; overflow: hidden; }
              #qr-reader img { display: none !important; }
              #qr-reader__dashboard_section_csr span { color: #fff !important; }
              #qr-reader__dashboard_section_swaplink { color: #34c759 !important; text-decoration: none; }
              #html5-qrcode-button-camera-permission, #html5-qrcode-button-camera-start, #html5-qrcode-button-camera-stop {
                background: #34c759; color: white; border: none; padding: 8px 16px; border-radius: 8px; margin: 5px; cursor: pointer; font-weight: bold;
              }
              #html5-qrcode-anchor-scan-type-change { color: #34c759 !important; text-decoration: none; display: block; margin-top: 10px; }
            `}</style>
            <div id="qr-reader" className="w-full bg-white/5 rounded-xl overflow-hidden"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-5 animate-fade-in">
            <div className="flex items-center gap-2 px-3 py-2 bg-sos-green/10 border border-sos-green/20 rounded-lg mb-2">
              <Shield className="w-4 h-4 text-sos-green" />
              <span className="text-sm text-sos-green font-mono break-all">ID: {companyId}</span>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" /> Your Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-dark"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                <DoorOpen className="w-4 h-4" /> Room Number
              </label>
              <input
                type="text"
                name="roomNumber"
                value={formData.roomNumber}
                onChange={handleChange}
                className="input-dark"
                placeholder="e.g. 301"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" /> Mobile Number
              </label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                className="input-dark"
                placeholder="10-digit mobile number"
                required
                pattern="[0-9]{10}"
                title="Enter a valid 10-digit mobile number"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-sos-green to-emerald-500 rounded-xl text-white font-semibold hover:opacity-90 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Join Emergency Network
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
