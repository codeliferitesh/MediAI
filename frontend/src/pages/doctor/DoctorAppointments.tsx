import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Calendar, Clock, User, CheckCircle2, XCircle } from 'lucide-react';

interface Appointment {
  id: string;
  appointment_date: string;
  time_slot: string;
  status: string;
  reason: string;
  notes: string;
  patient_id: string;
  patient?: {
    profile?: { full_name: string; email: string };
    blood_type: string;
    gender: string;
    phone_number: string;
  };
}

export const DoctorAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.get<Appointment[]>('/appointments');
      setAppointments(res.data);
    } catch (e) {
      console.error('Failed to fetch appointments:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleUpdateStatus = async (apptId: string, newStatus: string) => {
    try {
      await api.put(`/appointments/${apptId}?appt_status=${newStatus}`);
      fetchAppointments();
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

  const counts = {
    all: appointments.length,
    scheduled: appointments.filter(a => a.status === 'scheduled').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatTime = (timeStr: string) => {
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h);
    return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  const today = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter(a => a.appointment_date === today && a.status === 'scheduled');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">My Appointment Schedule</h2>
        <p className="text-slate-500 text-sm mt-1">View and manage all patient consultations assigned to you.</p>
      </div>

      {/* Today's highlight */}
      {todayAppts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <Calendar className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-bold text-blue-800">
              {todayAppts.length} appointment{todayAppts.length > 1 ? 's' : ''} scheduled for today
            </p>
            <p className="text-xs text-blue-600 mt-0.5">
              {todayAppts.map(a => a.patient?.profile?.full_name || 'Patient').join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'scheduled', 'completed', 'cancelled'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${filter === tab ? 'bg-medical-600 text-white border-medical-600' : 'bg-white text-slate-500 border-slate-200 hover:border-medical-300'}`}
          >
            {tab} <span className="ml-1 opacity-70">({counts[tab]})</span>
          </button>
        ))}
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-8 h-8 border-4 border-medical-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">Loading your schedule...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center">
            <Calendar className="h-10 w-10 text-slate-300 mb-3" />
            <p className="font-semibold text-sm">No {filter === 'all' ? '' : filter} appointments found</p>
            <p className="text-xs mt-1 text-slate-400">Patient-booked appointments will appear here automatically.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase">Patient</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase">Date & Time</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase">Reason</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase">Status</th>
                  <th className="px-5 py-3 text-right text-xs font-bold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filtered.map(appt => (
                  <tr key={appt.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-medical-50 border border-medical-100 rounded-lg flex items-center justify-center text-medical-600 shrink-0">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            {appt.patient?.profile?.full_name || 'Patient Record'}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {appt.patient?.gender || ''}{appt.patient?.blood_type ? ` · ${appt.patient.blood_type}` : ''}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-slate-800">{formatDate(appt.appointment_date)}</p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" /> {formatTime(appt.time_slot)}
                      </p>
                    </td>
                    <td className="px-5 py-4 max-w-[200px]">
                      <p className="text-sm text-slate-600 truncate">{appt.reason || '—'}</p>
                      {appt.notes && (
                        <p className="text-[10px] text-slate-400 mt-0.5 truncate italic">{appt.notes}</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 border rounded text-[10px] uppercase font-bold tracking-wider ${getStatusStyle(appt.status)}`}>
                        {appt.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {appt.status === 'scheduled' && (
                        <div className="flex gap-3 justify-end items-center">
                          <button
                            onClick={() => handleUpdateStatus(appt.id, 'completed')}
                            className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 hover:underline font-semibold"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Complete
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(appt.id, 'cancelled')}
                            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 hover:underline font-semibold"
                          >
                            <XCircle className="h-3.5 w-3.5" /> Cancel
                          </button>
                        </div>
                      )}
                      {appt.status !== 'scheduled' && (
                        <span className="text-xs text-slate-400 italic">No actions</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
