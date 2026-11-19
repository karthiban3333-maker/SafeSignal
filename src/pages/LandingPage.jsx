import { useNavigate } from 'react-router-dom';
import { Shield, Building2, HardHat, Smartphone } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  const roles = [
    {
      title: 'Company Admin',
      description: 'Register your company and manage emergency responses',
      icon: Building2,
      color: 'from-sos-purple to-indigo-600',
      glowColor: 'rgba(175, 82, 222, 0.3)',
      path: '/company-auth'
    },
    {
      title: 'Staff',
      description: 'Join your company\'s emergency network as staff',
      icon: HardHat,
      color: 'from-sos-blue to-cyan-500',
      glowColor: 'rgba(0, 122, 255, 0.3)',
      path: '/staff-auth'
    },
    {
      title: 'Guest',
      description: 'Scan QR code to join emergency network',
      icon: Smartphone,
      color: 'from-sos-green to-emerald-500',
      glowColor: 'rgba(52, 199, 89, 0.3)',
      path: '/guest-login'
    }
  ];

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-sos-red/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-sos-purple/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sos-blue/3 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 text-center mb-12 animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-sos-red to-sos-orange mb-6 shadow-lg shadow-sos-red/20">
          <Shield className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-5xl font-black text-white mb-3 tracking-tight">
          Safe<span className="text-transparent bg-clip-text bg-gradient-to-r from-sos-red to-sos-orange">Signal</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-md">
          Emergency SOS & Safety Platform — Real-time alerts, live tracking, instant communication
        </p>
      </div>

      {/* Role Cards */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        {roles.map((role, index) => (
          <button
            key={role.title}
            onClick={() => navigate(role.path)}
            className="group glass rounded-2xl p-8 text-left transition-all duration-500 hover:scale-105 hover:border-white/20 animate-fade-in"
            style={{
              animationDelay: `${index * 150}ms`,
              animationFillMode: 'both'
            }}
          >
            <div
              className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${role.color} mb-5 transition-all duration-500 group-hover:shadow-lg`}
              style={{ '--tw-shadow-color': role.glowColor }}
            >
              <role.icon className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300">
              {role.title}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {role.description}
            </p>
            <div className="mt-5 flex items-center text-sm text-gray-500 group-hover:text-white/70 transition-colors">
              <span>Get started</span>
              <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="relative z-10 mt-12 text-center text-gray-600 text-sm">
        <p>Built for emergencies. Powered by real-time technology.</p>
      </div>
    </div>
  );
}
