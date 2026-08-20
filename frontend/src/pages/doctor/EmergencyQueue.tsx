import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { HeartPulse, ShieldCheck, Thermometer } from 'lucide-react';

interface EmergencyCase {
  id: string;
  name: string;
  age: number;
  heart_rate: number;
  blood_pressure: string;
  spo2: number;
  temperature: number;
  pain_level: number;
  symptoms: string;
  consciousness_status: string;
  respiratory_difficulty: boolean;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  risk_score: number;
  reasoning: string;
  status: 'queued' | 'treating' | 'discharged';
  created_at: string;
}

export const EmergencyQueue = () => {
  const [cases, setCases] = useState<EmergencyCase[]>([]);

  const fetchQueue = async () => {
    try {
      const response = await api.get<EmergencyCase[]>('/emergency/queue');
      setCases(response.data);
    } catch (err) {
      console.error("Failed to load emergency queue:", err);
    }
  };

  useEffect(() => {
    fetchQueue();
    // Poll every 10 seconds to keep waiting list live
    const interval = setInterval(fetchQueue, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (caseId: string, newStatus: string) => {
    try {
      await api.put(`/emergency/${caseId}/status?status_select=${newStatus}`);
      fetchQueue();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-500 text-white shadow-red-200 border-red-500';
      case 'High': return 'bg-amber-500 text-white shadow-amber-100 border-amber-500';
      case 'Medium': return 'bg-blue-500 text-white border-blue-500';
      default: return 'bg-emerald-500 text-white border-emerald-500';
    }
  };

  const getPriorityRowBorder = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'border-l-4 border-l-red-500';
      case 'High': return 'border-l-4 border-l-amber-500';
      case 'Medium': return 'border-l-4 border-l-blue-500';
      default: return 'border-l-4 border-l-emerald-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Emergency Triage Queue</h2>
          <p className="text-slate-500 text-sm mt-1">Live outpatient triage, automatically sorted by vital risk severity levels.</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs">
          <ShieldCheck className="h-4.5 w-4.5" /> Clinical Triage Protocol Active
        </div>
      </div>

      {cases.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-xl p-12 text-center text-slate-450 flex flex-col items-center justify-center min-h-[360px] shadow-xs">
          <HeartPulse className="h-12 w-12 text-slate-300 mb-3" />
          <p className="text-base font-bold text-slate-700">Emergency queue is clear</p>
          <p className="text-xs text-slate-400 mt-1">Newly onboarded triage cases will automatically trigger on this desk.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cases.map((cs) => (
            <div
              key={cs.id}
              className={`bg-white rounded-xl border border-slate-100 shadow-xs p-6 ${getPriorityRowBorder(cs.priority)} flex flex-col lg:flex-row justify-between gap-6 items-start lg:items-center`}
            >
              {/* Patient Basic Info */}
              <div className="space-y-2 max-w-sm">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${getPriorityStyle(cs.priority)}`}>
                    {cs.priority}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Score: {cs.risk_score.toFixed(0)}/100
                  </span>
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-850 text-base">{cs.name}</h3>
                  <p className="text-xs text-slate-450 mt-0.5">Age: {cs.age} | Symptoms: <span className="text-slate-500 font-semibold">{cs.symptoms}</span></p>
                </div>
                <div className="text-xs text-slate-650 bg-slate-50 border border-slate-150 p-2.5 rounded-lg italic">
                  "{cs.reasoning}"
                </div>
              </div>

              {/* Vitals Signs display */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50/50 p-4 border border-slate-150 rounded-xl max-w-lg w-full text-xs text-slate-650">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Heart Rate</span>
                  <p className="font-extrabold text-slate-800 text-sm flex items-center gap-1">
                    <HeartPulse className="h-4 w-4 text-red-500" /> {cs.heart_rate} bpm
                  </p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Blood Pressure</span>
                  <p className="font-extrabold text-slate-800 text-sm">{cs.blood_pressure} mmHg</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Oxygen SpO2</span>
                  <p className="font-extrabold text-slate-800 text-sm">{cs.spo2}%</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Temperature</span>
                  <p className="font-extrabold text-slate-800 text-sm flex items-center gap-0.5">
                    <Thermometer className="h-4 w-4 text-indigo-500" /> {cs.temperature}°C
                  </p>
                </div>
              </div>

              {/* Triage Status & Actions */}
              <div className="flex flex-row lg:flex-col gap-3.5 items-end justify-between w-full lg:w-auto border-t lg:border-t-0 border-slate-100 pt-4 lg:pt-0">
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Status</span>
                  <span className={`inline-block px-2.5 py-0.5 border rounded text-[10px] uppercase font-bold tracking-wider mt-1 ${
                    cs.status === 'treating'
                      ? 'bg-amber-50 text-amber-700 border-amber-250 animate-pulse'
                      : 'bg-red-50 text-red-700 border-red-250'
                  }`}>
                    {cs.status}
                  </span>
                </div>

                <div className="flex gap-2">
                  {cs.status === 'queued' ? (
                    <button
                      onClick={() => handleUpdateStatus(cs.id, 'treating')}
                      className="bg-medical-600 hover:bg-medical-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-xs"
                    >
                      Treat Patient
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateStatus(cs.id, 'discharged')}
                      className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-650 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-xs"
                    >
                      Discharge
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
