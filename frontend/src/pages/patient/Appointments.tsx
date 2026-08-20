import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Calendar, Clock, CheckCircle2, AlertCircle, CalendarDays } from 'lucide-react';

interface Doctor {
  id: string;
  full_name: string;
  specialization: string;
  is_available: boolean;
  department_name: string;
}

interface Appointment {
  id: string;
  appointment_date: string;
  time_slot: string;
  status: string;
  reason: string;
  doctor?: {
    profile?: {
      full_name: string;
    };
    specialization: string;
  };
}

export const Appointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  
  // Form States
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [apptDate, setApptDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('09:00:00');
  const [reason, setReason] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [apptRes, docRes] = await Promise.all([
        api.get<Appointment[]>('/appointments'),
        api.get<Doctor[]>('/departments/doctors')
      ]);
      setAppointments(apptRes.data);
      setDoctors(docRes.data);
      if (docRes.data.length > 0) {
        setSelectedDoctorId(docRes.data[0].id);
      }
    } catch (err) {
      console.error("Failed to load appointments data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      await api.post('/appointments', {
        doctor_id: selectedDoctorId,
        appointment_date: apptDate,
        time_slot: timeSlot,
        reason
      });
      setSuccess(true);
      setReason('');
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Double-booking conflict! The doctor is unavailable at this slot.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (apptId: string) => {
    if (!window.confirm("Are you sure you want to delete this appointment slot?")) return;
    try {
      await api.delete(`/appointments/${apptId}`);
      fetchData();
    } catch (err) {
      console.error("Failed to delete appointment:", err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-250';
      case 'cancelled': return 'bg-red-50 text-red-750 border-red-250';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Clinical Schedulers</h2>
        <p className="text-slate-500 text-sm mt-1">Book consultations with clinical specialists and review schedule logs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Booking Form */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-6 space-y-5">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <CalendarDays className="h-5 w-5 text-medical-600" /> Book Consultation
          </h3>

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm font-semibold flex items-center gap-1.5 shadow-xs">
              <CheckCircle2 className="h-4.5 w-4.5" /> Consultation booked successfully!
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-650 p-3 rounded-lg text-sm font-medium flex items-center gap-1.5 shadow-xs">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" /> <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleBookAppointment} className="space-y-4.5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Select Doctor</label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="block w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-medical-500 focus:bg-white text-slate-700 font-semibold"
              >
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    Dr. {doc.full_name} ({doc.specialization}) - {doc.department_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Consultation Date</label>
              <input
                type="date"
                required
                value={apptDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setApptDate(e.target.value)}
                className="block w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-medical-500 focus:bg-white text-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Time Slot</label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="block w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-medical-500 focus:bg-white text-slate-700"
              >
                <option value="09:00:00">09:00 AM</option>
                <option value="10:00:00">10:00 AM</option>
                <option value="11:00:00">11:00 AM</option>
                <option value="14:00:00">02:00 PM</option>
                <option value="15:00:00">03:00 PM</option>
                <option value="16:00:00">04:00 PM</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Reason for Visit</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="block w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-medical-500 focus:bg-white text-slate-700"
                placeholder="Briefly describe your symptoms/reason..."
              />
            </div>

            <button
              type="submit"
              disabled={loading || !apptDate}
              className="w-full bg-medical-600 hover:bg-medical-700 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm"
            >
              {loading ? "Scheduling Consultation..." : "Schedule Appointment"}
            </button>
          </form>
        </div>

        {/* Appointments Schedule List */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-xs p-6 space-y-5">
          <h3 className="text-base font-bold text-slate-800">Your Booking Ledger</h3>
          
          {appointments.length === 0 ? (
            <div className="border border-dashed border-slate-150 rounded-xl p-8 text-center text-slate-400 min-h-[300px] flex flex-col items-center justify-center">
              <Calendar className="h-10 w-10 text-slate-300 mb-2" />
              <p className="font-semibold">No bookings recorded</p>
              <p className="text-xs text-slate-400 mt-1">Booked consultations will list here.</p>
            </div>
          ) : (
            <div className="border border-slate-100 rounded-xl overflow-hidden shadow-xs">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Doctor</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Date & Time</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Reason</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-sm text-slate-750">
                  {appointments.map((appt) => (
                    <tr key={appt.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-800">
                          Dr. {appt.doctor?.profile?.full_name || "Clinic Doctor"}
                        </p>
                        <p className="text-[10px] text-slate-400 font-normal">
                          {appt.doctor?.specialization}
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-slate-800">{new Date(appt.appointment_date).toLocaleDateString()}</p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="h-3.5 w-3.5" /> {appt.time_slot}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 max-w-[200px] truncate">{appt.reason || "N/A"}</td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 border rounded text-[10px] uppercase font-bold tracking-wider ${getStatusColor(appt.status)}`}>
                          {appt.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {appt.status === 'scheduled' && (
                          <button
                            onClick={() => handleDelete(appt.id)}
                            className="text-xs text-red-500 hover:text-red-750 hover:underline font-semibold"
                          >
                            Delete Slot
                          </button>
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
    </div>
  );
};
