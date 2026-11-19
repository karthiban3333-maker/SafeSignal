import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, ArrowLeft, Building2, LogIn, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CompanyAuth() {
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    adminName: '',
    companyName: '',
    email: '',
    password: ''
  });
  const { registerCompany, login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success('Welcome back!');
      } else {
        await registerCompany(formData.adminName, formData.companyName, formData.email, formData.password);
        toast.success('Company registered successfully!');
      }
      navigate('/home');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Authentication failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sos-purple/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-sos-blue/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-sos-purple to-indigo-600 mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            {isLogin ? 'Company Login' : 'Register Company'}
          </h2>
          <p className="text-gray-400">
            {isLogin ? 'Sign in to your admin account' : 'Create your company emergency network'}
          </p>
        </div>

        {/* Toggle */}
        <div className="glass rounded-xl p-1 flex mb-8">
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
              !isLogin ? 'bg-gradient-to-r from-sos-purple to-indigo-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" /> Register
          </button>
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
              isLogin ? 'bg-gradient-to-r from-sos-purple to-indigo-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" /> Login
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-5">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Admin Name</label>
                <input
                  type="text"
                  name="adminName"
                  value={formData.adminName}
                  onChange={handleChange}
                  className="input-dark"
                  placeholder="John Doe"
                  required={!isLogin}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="input-dark"
                  placeholder="Acme Corporation"
                  required={!isLogin}
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-dark"
              placeholder="admin@company.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input-dark"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                {isLogin ? 'Sign In' : 'Create Company'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
