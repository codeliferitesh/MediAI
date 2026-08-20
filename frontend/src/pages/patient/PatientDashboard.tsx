import { useAuth } from '../../hooks/useAuth';
import { Calendar, FileText, Pill, Stethoscope, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PatientDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-medical-600 to-medical-700 rounded-2xl p-6 md:p-8 text-white shadow-sm relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 translate-y-4">
          <Stethoscope className="h-64 w-64" />
        </div>
        <div className="relative z-10 max-w-xl space-y-3">
          <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Patient Portal</span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Hello, {user?.full_name}</h2>
          <p className="text-white/80 text-sm md:text-base font-medium leading-relaxed">
            Welcome to your MediAI dashboard. Access your personal medical history, review AI diagnostic report summaries, or book clinical consultations.
          </p>
        </div>
      </div>

      {/* Grid Quick Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/patient/symptoms" className="group bg-white p-5 rounded-xl border border-slate-100 shadow-xs hover:shadow-md hover:border-medical-200 transition-all flex flex-col justify-between h-40">
          <div className="h-10 w-10 bg-medical-50 border border-medical-100 rounded-lg flex items-center justify-center text-medical-600 group-hover:bg-medical-600 group-hover:text-white transition-colors">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-base">Symptom Checker</h3>
            <p className="text-xs text-slate-400 mt-1">Start a conversational AI clinical triage session.</p>
          </div>
        </Link>

        <Link to="/patient/reports" className="group bg-white p-5 rounded-xl border border-slate-100 shadow-xs hover:shadow-md hover:border-medical-200 transition-all flex flex-col justify-between h-40">
          <div className="h-10 w-10 bg-medical-50 border border-medical-100 rounded-lg flex items-center justify-center text-medical-600 group-hover:bg-medical-600 group-hover:text-white transition-colors">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-base">Medical Reports</h3>
            <p className="text-xs text-slate-400 mt-1">Upload files to extract and summarize lab findings.</p>
          </div>
        </Link>

        <Link to="/patient/prescriptions" className="group bg-white p-5 rounded-xl border border-slate-100 shadow-xs hover:shadow-md hover:border-medical-200 transition-all flex flex-col justify-between h-40">
          <div className="h-10 w-10 bg-medical-50 border border-medical-100 rounded-lg flex items-center justify-center text-medical-600 group-hover:bg-medical-600 group-hover:text-white transition-colors">
            <Pill className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-base">Prescriptions</h3>
            <p className="text-xs text-slate-400 mt-1">Review active medications and interactions warnings.</p>
          </div>
        </Link>

        <Link to="/patient/appointments" className="group bg-white p-5 rounded-xl border border-slate-100 shadow-xs hover:shadow-md hover:border-medical-200 transition-all flex flex-col justify-between h-40">
          <div className="h-10 w-10 bg-medical-50 border border-medical-100 rounded-lg flex items-center justify-center text-medical-600 group-hover:bg-medical-600 group-hover:text-white transition-colors">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-base">Appointments</h3>
            <p className="text-xs text-slate-400 mt-1">Book or manage scheduled consultations.</p>
          </div>
        </Link>
      </div>

      {/* CDSS Advisory Notice */}
      <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-4 flex gap-3 text-slate-700">
        <Shield className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm">
          <span className="font-bold text-amber-850">Clinical Advisory:</span> MediAI is a Clinical Decision Support System designed as an diagnostic helper. AI outputs do not represent a final medical diagnosis or substitute qualified professional consultation. Always seek direct medical guidance.
        </div>
      </div>
    </div>
  );
};
