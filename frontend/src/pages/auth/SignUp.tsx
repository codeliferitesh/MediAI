import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Activity, Mail, Lock, User, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';

export const SignUp = () => {
  const { role: routeRole } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor' | 'receptionist' | 'admin'>('patient');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (routeRole && ['patient', 'doctor', 'receptionist', 'admin'].includes(routeRole)) {
      setRole(routeRole as any);
    }
  }, [routeRole]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const { error: signUpError } = await signup(fullName, email, password, role);

      if (signUpError) {
        throw new Error(signUpError);
      }

      setSuccess(true);
      setFullName('');
      setEmail('');
      
      // Auto-redirect to login after signup
      setTimeout(() => {
        navigate(`/login/${role}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please verify email formatting.');
    } finally {
      setLoading(false);
    }
  };

  const getThemeColors = () => {
    switch (role) {
      case 'doctor':
        return {
          title: 'Doctor Portal Sign Up',
          button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
          border: 'border-blue-100',
          icon: 'text-blue-600 bg-blue-50/60 border-blue-100',
          link: 'text-blue-650 hover:text-blue-750',
          ring: 'focus:ring-blue-500 focus:border-blue-500'
        };
      case 'receptionist':
        return {
          title: 'Receptionist Desk Sign Up',
          button: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-500',
          border: 'border-amber-100',
          icon: 'text-amber-600 bg-amber-50/60 border-amber-100',
          link: 'text-amber-650 hover:text-amber-750',
          ring: 'focus:ring-amber-500 focus:border-amber-500'
        };
      case 'admin':
        return {
          title: 'Administrator Sign Up',
          button: 'bg-purple-650 hover:bg-purple-700 focus:ring-purple-500',
          border: 'border-purple-100',
          icon: 'text-purple-650 bg-purple-50/60 border-purple-100',
          link: 'text-purple-650 hover:text-purple-750',
          ring: 'focus:ring-purple-500 focus:border-purple-500'
        };
      default:
        return {
          title: 'Patient Portal Sign Up',
          button: 'bg-teal-600 hover:bg-teal-700 focus:ring-teal-500',
          border: 'border-teal-100',
          icon: 'text-teal-600 bg-teal-50/60 border-teal-100',
          link: 'text-teal-650 hover:text-teal-750',
          ring: 'focus:ring-teal-500 focus:border-teal-500'
        };
    }
  };

  const theme = getThemeColors();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex flex-col items-center">
          <div className={`h-12 w-12 border rounded-xl flex items-center justify-center mb-4 shadow-sm ${theme.icon}`}>
            <Activity className="h-6 w-6" />
          </div>
          <h2 className="text-center text-2xl font-extrabold text-slate-900 tracking-tight">
            {theme.title}
          </h2>
          <p className="mt-2 text-center text-xs text-slate-400">
            Create new credentials for MediAI CDSS Portal
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-650 rounded-lg p-3 text-xs font-semibold text-center shadow-3xs">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-xs font-semibold text-center flex items-center justify-center gap-1.5 shadow-3xs">
            <ShieldCheck className="h-4.5 w-4.5" /> Registry Authorized! Redirecting to login...
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
          <div className="space-y-4">
            <div>
              <label htmlFor="full-name" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="full-name"
                  name="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 text-sm placeholder-slate-400 bg-slate-50 focus:bg-white transition-colors ${theme.ring}`}
                  placeholder="Jane Miller"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email-address" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 text-sm placeholder-slate-400 bg-slate-50 focus:bg-white transition-colors ${theme.ring}`}
                  placeholder="jane.miller@hospital.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 text-sm placeholder-slate-400 bg-slate-50 focus:bg-white transition-colors ${theme.ring}`}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label htmlFor="role-select" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Assigned System Role
              </label>
              <select
                id="role-select"
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className={`block w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 bg-slate-50 focus:bg-white transition-colors font-semibold text-slate-700 ${theme.ring}`}
              >
                <option value="patient">Patient Portal</option>
                <option value="doctor">Doctor Clinic Portal</option>
                <option value="receptionist">Receptionist Desk Portal</option>
                <option value="admin">System Administrator</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading || success}
              className={`group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-semibold rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition-colors shadow-xs ${theme.button}`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="flex items-center gap-1">
                  Authorize Registration <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full flex justify-center items-center gap-1.5 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Portal Selection
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-xs text-slate-455">
            Already have an account?{' '}
            <Link to={`/login/${role}`} className={`font-semibold ${theme.link} transition-colors`}>
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
