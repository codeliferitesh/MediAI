import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Users, User, ShieldAlert, HeartPulse } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface PortalCard {
  role: 'patient' | 'doctor' | 'receptionist' | 'admin';
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  theme: string;
  accent: string;
}

export const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate(`/${user.role}`, { replace: true });
    }
  }, [user, navigate]);

  const portals: PortalCard[] = [
    {
      role: 'patient',
      title: 'Patient Portal',
      description: 'Access medical history files, schedule doctor consultations, or launch symptom checkers.',
      icon: User,
      theme: 'hover:border-teal-400 hover:shadow-teal-50 bg-teal-50/20 text-teal-650 border-teal-100',
      accent: 'bg-teal-500'
    },
    {
      role: 'doctor',
      title: 'Doctor Portal',
      description: 'Review emergency triage priority queues, analyze patient lab charts, and write prescriptions.',
      icon: Stethoscope,
      theme: 'hover:border-blue-400 hover:shadow-blue-50 bg-blue-50/20 text-blue-650 border-blue-100',
      accent: 'bg-blue-600'
    },
    {
      role: 'receptionist',
      title: 'Receptionist Desk',
      description: 'Manage outpatient check-ins, organize schedule calendars, and log emergency vital signs.',
      icon: Users,
      theme: 'hover:border-amber-400 hover:shadow-amber-50 bg-amber-50/20 text-amber-650 border-amber-100',
      accent: 'bg-amber-500'
    },
    {
      role: 'admin',
      title: 'System Administrator',
      description: 'Configure clinical departments, manage system security profiles, and inspect audit logs.',
      icon: ShieldAlert,
      theme: 'hover:border-purple-400 hover:shadow-purple-50 bg-purple-50/20 text-purple-650 border-purple-100',
      accent: 'bg-purple-650'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full mx-auto space-y-10">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="h-14 w-14 bg-medical-50 border border-medical-100 rounded-2xl flex items-center justify-center text-medical-600 shadow-md">
            <HeartPulse className="h-8 w-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Welcome to MediAI
          </h1>
          <p className="max-w-md text-slate-500 text-sm md:text-base leading-relaxed">
            Intelligent Hospital Management & Clinical Decision Support System. Please select your access portal below.
          </p>
        </div>

        {/* Portal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {portals.map((portal) => {
            const Icon = portal.icon;
            return (
              <button
                key={portal.role}
                onClick={() => navigate(`/login/${portal.role}`)}
                className={`w-full text-left bg-white p-6 rounded-2xl border transition-all cursor-pointer flex gap-5 group hover:-translate-y-1 hover:shadow-lg ${portal.theme}`}
              >
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm transition-transform group-hover:scale-105 ${portal.accent}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-extrabold text-slate-805 text-lg group-hover:text-slate-950 transition-colors">
                    {portal.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {portal.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
