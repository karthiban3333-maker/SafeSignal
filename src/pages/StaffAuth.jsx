import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Shield, ArrowLeft, HardHat, LogIn, UserPlus, Search, Building2, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StaffAuth() {
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCompanySearch, setShowCompanySearch] = useState(false);
  const [staffUid, setStaffUid] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const { registerStaff, login, setStaffCompany } = useAuth();
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
        navigate('/home');
      } else {
        const uid = await registerStaff(formData.name, formData.email, formData.password);
        setStaffUid(uid);
        setShowCompanySearch(true);
        toast.success('Account created! Now select your company.');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Authentication failed');
    }
    setLoading(false);
  };

  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (term.length < 2) {
      setCompanies([]);
      return;
    }
    setSearchLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'companies'));
      const results = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.companyName?.toLowerCase().includes(term.toLowerCase())) {
          results.push({ id: doc.id, ...data });
        }
      });
      setCompanies(results);
    } catch (err) {
      console.error(err);
      toast.error('Error searching companies');
    }
    setSearchLoading(false);
  };

  const handleSelectCompany = async (companyId) => {
    try {
      await setStaffCompany(staffUid, companyId);
      toast.success('Joined company successfully!');
      navigate('/home');
    } catch (err) {
      console.error(err);
      toast.error('Failed to join company');
    }
  };

  if (showCompanySearch) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-sos-blue/8 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-sos-blue to-cyan-500 mb-4">
              <Search className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Find Your Company</h2>
            <p className="text-gray-400">Search and select the company you belong to</p>
          </div>

          <div className="glass rounded-2xl p-8">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="input-dark pl-12"
                placeholder="Type company name..."
                autoFocus
              />
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {searchLoading && (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-sos-blue/30 border-t-sos-blue rounded-full animate-spin mx-auto"></div>
                </div>
              )}
              {!searchLoading && companies.length === 0 && searchTerm.length >= 2 && (
                <div className="text-center py-8 text-gray-500">
                  <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No companies found</p>
                </div>
              )}
              {companies.map((company) => (
                <button
                  key={company.id}
                  onClick={() => handleSelectCompany(company.id)}
                  className="w-full glass rounded-xl p-4 text-left hover:border-sos-blue/30 transition-all duration-300 group flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-white font-semibold group-hover:text-sos-blue transition-colors">
                      {company.companyName}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">Admin: {company.adminName}</p>
                  </div>
                  <Check className="w-5 h-5 text-gray-600 group-hover:text-sos-blue transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-sos-blue/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-sos-blue to-cyan-500 mb-4">
            <HardHat className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            {isLogin ? 'Staff Login' : 'Staff Registration'}
          </h2>
          <p className="text-gray-400">
            {isLogin ? 'Sign in to your staff account' : 'Create your account and join a company'}
          </p>
        </div>

        <div className="glass rounded-xl p-1 flex mb-8">
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
              !isLogin ? 'bg-gradient-to-r from-sos-blue to-cyan-500 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" /> Register
          </button>
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
              isLogin ? 'bg-gradient-to-r from-sos-blue to-cyan-500 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" /> Login
          </button>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-sm text-gray-400 mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-dark"
                placeholder="Jane Smith"
                required={!isLogin}
              />
            </div>
          )}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-dark"
              placeholder="staff@company.com"
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
                {isLogin ? 'Sign In' : 'Create Account'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
