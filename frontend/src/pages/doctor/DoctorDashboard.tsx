import { useAuth } from '../../hooks/useAuth';
import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, HeartPulse, FileText, AlertTriangle, ShieldCheck, Clock, User } from 'lucide-react';

interface Appointment {
  id: string;
  appointment_date: string;
  time_slot: string;
  status: string;
  reason: string;
  patient?: { profile?: { full_name: string } };
}

interface EmergencyCase {
  id: string;
  status: string;
  priority: string;
}

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [emergencies, setEmergencies] = useState<EmergencyCase[]>([]);

  useEffect(() => {
    api.get<Appointment[]>('/appointments').then(r => setAppointments(r.data)).catch(() => {});
    api.get<EmergencyCase[]>('/triage').then(r => setEmergencies(r.data)).catch(() => {});
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter(a => a.appointment_date === today && a.status === 'scheduled');
  const activeEmergencies = emergencies.filter(e => e.status === 'queued');
  const scheduledTotal = appointments.filter(a => a.status === 'scheduled');

  const formatTime = (t: string) => {
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  return (
    <div className="space-y-8">
      {/* Greeting Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Welcome, {user?.full_name}</h2>
          <p className="text-slate-500 text-sm mt-1">Review clinical alerts, emergency queue, and active outpatient records.</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3.5 py-1.5 border border-emerald-200 rounded-lg text-xs font-semibold shadow-xs">
          <ShieldCheck className="h-4 w-4" /> CDSS System Verified
        </div>
      </div>

      {/* Clinical Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div onClick={() => navigate('/doctor/appointments')} className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-center gap-4 cursor-pointer hover:border-blue-200 hover:shadow-sm transition-all">
          <div className="h-10 w-10 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center text-blue-600 shadow-xs">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Visits</p>
            <p className="text-xl font-bold text-slate-800 mt-0.5">{todayAppts.length} Scheduled</p>
          </div>
        </div>

        <div onClick={() => navigate('/doctor/emergency')} className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-center gap-4 cursor-pointer hover:border-red-200 hover:shadow-sm transition-all">
          <div className="h-10 w-10 bg-red-50 border border-red-100 rounded-lg flex items-center justify-center text-red-600 shadow-xs">
            <HeartPulse className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Emergency Queue</p>
            <p className="text-xl font-bold text-slate-800 mt-0.5">{activeEmergencies.length} Active</p>
          </div>
        </div>

        <div onClick={() => navigate('/doctor/patients')} className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-center gap-4 cursor-pointer hover:border-teal-200 hover:shadow-sm transition-all">
          <div className="h-10 w-10 bg-teal-50 border border-teal-100 rounded-lg flex items-center justify-center text-teal-600 shadow-xs">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">My Appointments</p>
            <p className="text-xl font-bold text-slate-800 mt-0.5">{scheduledTotal.length} Pending</p>
          </div>
        </div>

        <div onClick={() => navigate('/doctor/prescriptions')} className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-center gap-4 cursor-pointer hover:border-amber-200 hover:shadow-sm transition-all">
          <div className="h-10 w-10 bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-center text-amber-600 shadow-xs">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Prescriptions</p>
            <p className="text-xl font-bold text-slate-800 mt-0.5">Write Rx</p>
          </div>
        </div>
      </div>

      {/* Main Clinical Outlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Appointments */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">Today's Consultation Queue</h3>
            <button onClick={() => navigate('/doctor/appointments')} className="text-xs text-medical-600 hover:underline font-semibold">View All →</button>
          </div>

          {todayAppts.length === 0 ? (
            <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400 flex flex-col items-center justify-center min-h-[180px]">
              <Calendar className="h-8 w-8 text-slate-300 mb-2" />
              <p className="text-sm font-semibold">No appointments scheduled for today</p>
              <p className="text-xs text-slate-400 mt-1">New check-ins will automatically pop up here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayAppts.map(appt => (
                <div key={appt.id} className="flex items-center gap-4 p-3.5 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="h-9 w-9 bg-medical-50 border border-medical-100 rounded-lg flex items-center justify-center text-medical-600 shrink-0">
                    <User className="h-4.5 w-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800">{appt.patient?.profile?.full_name || 'Patient'}</p>
                    <p className="text-xs text-slate-400 truncate">{appt.reason || 'No reason specified'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" /> {formatTime(appt.time_slot)}
                    </p>
                    <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-bold uppercase">Scheduled</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Emergency Triage Quick View */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-800">Critical Priority Queue</h3>
            <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Emergency</span>
          </div>

          {activeEmergencies.length === 0 ? (
            <div className="border border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-400 flex flex-col items-center justify-center min-h-[180px]">
              <AlertTriangle className="h-8 w-8 text-red-300 mb-2" />
              <p className="text-sm font-semibold text-slate-650">Emergency Queue Clear</p>
              <p className="text-xs text-slate-400 mt-1">High severity patients registered by reception will trigger here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeEmergencies.slice(0, 4).map(e => (
                <div key={e.id} className={`p-3 rounded-lg border text-xs font-semibold ${
                  e.priority === 'Critical' ? 'bg-red-50 border-red-200 text-red-700' :
                  e.priority === 'High' ? 'bg-orange-50 border-orange-200 text-orange-700' :
                  'bg-amber-50 border-amber-200 text-amber-700'
                }`}>
                  {e.priority} Priority
                </div>
              ))}
              <button onClick={() => navigate('/doctor/emergency')} className="w-full text-xs text-center text-medical-600 hover:underline font-semibold pt-1">
                View Emergency Queue →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
