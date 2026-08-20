import React, { useState } from 'react';
import { api } from '../../services/api';
import { HeartPulse, Activity, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TriageResult {
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  risk_score: number;
  reasoning: string;
}

export const EmergencyTriage = () => {
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [heartRate, setHeartRate] = useState<number | ''>('');
  const [bloodPressure, setBloodPressure] = useState('120/80');
  const [spo2, setSpo2] = useState<number | ''>(98);
  const [temperature, setTemperature] = useState<number | ''>(37.0);
  const [painLevel, setPainLevel] = useState<number>(0);
  const [symptoms, setSymptoms] = useState('');
  const [consciousness, setConsciousness] = useState('Alert');
  const [respDiff, setRespDiff] = useState(false);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmitTriage = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const response = await api.post<TriageResult>('/emergency/priority', {
        name,
        age: Number(age),
        heart_rate: Number(heartRate),
        blood_pressure: bloodPressure,
        spo2: Number(spo2),
        temperature: Number(temperature),
        pain_level: painLevel,
        symptoms,
        consciousness_status: consciousness,
        respiratory_difficulty: respDiff
      });
      setResult(response.data);
      
      // Reset Form fields
      setName('');
      setAge('');
      setHeartRate('');
      setSymptoms('');
    } catch (err: any) {
      setError(err.response?.data?.detail || "Triage processing failed. Verify vital formats.");
    } finally {
      setLoading(false);
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-500 text-white';
      case 'High': return 'bg-amber-500 text-white';
      case 'Medium': return 'bg-blue-500 text-white';
      default: return 'bg-emerald-500 text-white';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Outpatient Emergency Triage Intake</h2>
        <p className="text-slate-500 text-sm mt-1">Register incoming trauma/acute patients to calculate priority triage levels.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Vitals Form */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-xs p-6 md:p-8 space-y-6">
          <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-medical-600" /> Intake Vital Parameters
          </h3>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-650 p-4 rounded-xl text-sm font-medium flex items-center gap-2 shadow-2xs">
              <AlertTriangle className="h-5 w-5 shrink-0" /> <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmitTriage} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Patient Name (Trauma / Outpatient)</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-medical-500 focus:bg-white transition-colors"
                  placeholder="John Doe"
                />
              </div>

              {/* Age */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Age</label>
                <input
                  type="number"
                  required
                  value={age}
                  onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                  className="block w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-medical-500 focus:bg-white transition-colors"
                  placeholder="45"
                />
              </div>

              {/* Heart Rate */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Heart Rate (bpm)</label>
                <input
                  type="number"
                  required
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value === '' ? '' : Number(e.target.value))}
                  className="block w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-medical-500 focus:bg-white transition-colors"
                  placeholder="80"
                />
              </div>

              {/* BP */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Blood Pressure (Systolic/Diastolic)</label>
                <input
                  type="text"
                  required
                  value={bloodPressure}
                  onChange={(e) => setBloodPressure(e.target.value)}
                  className="block w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-medical-500 focus:bg-white transition-colors"
                  placeholder="120/80"
                />
              </div>

              {/* SpO2 */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Oxygen Saturation (SpO2 %)</label>
                <input
                  type="number"
                  required
                  value={spo2}
                  onChange={(e) => setSpo2(e.target.value === '' ? '' : Number(e.target.value))}
                  className="block w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-medical-500 focus:bg-white transition-colors"
                  placeholder="98"
                />
              </div>

              {/* Temp */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Core Temperature (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value === '' ? '' : Number(e.target.value))}
                  className="block w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-medical-500 focus:bg-white transition-colors"
                  placeholder="37.0"
                />
              </div>

              {/* Consciousness */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Consciousness status</label>
                <select
                  value={consciousness}
                  onChange={(e) => setConsciousness(e.target.value)}
                  className="block w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-medical-500 focus:bg-white transition-colors"
                >
                  <option value="Alert">Alert (Fully oriented)</option>
                  <option value="Confused">Confused / Disoriented</option>
                  <option value="Lethargic">Lethargic / Somnolent</option>
                  <option value="Unresponsive">Unresponsive / Comatose</option>
                </select>
              </div>

              {/* Pain scale */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pain Scale (0 - 10)</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={painLevel}
                  onChange={(e) => setPainLevel(Number(e.target.value))}
                  className="block w-full mt-2 accent-medical-600"
                />
                <span className="text-xs font-bold text-slate-550 block mt-1">Severity: {painLevel}/10</span>
              </div>
            </div>

            {/* Symptoms */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Acute Symptoms description</label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={3}
                required
                className="block w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-medical-500 focus:bg-white transition-colors"
                placeholder="Describe patient's chief complaints..."
              />
            </div>

            {/* Respiratory difficulty check */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="resp"
                checked={respDiff}
                onChange={(e) => setRespDiff(e.target.checked)}
                className="h-4 w-4 rounded border-slate-350 text-medical-600 focus:ring-medical-500 accent-medical-600"
              />
              <label htmlFor="resp" className="text-sm font-semibold text-slate-700">Patient displays active respiratory difficulty / labor breathing</label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-medical-600 hover:bg-medical-700 text-white py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm"
            >
              {loading ? "Calculating triage scores..." : "Submit to Triage Priority Engine"}
            </button>
          </form>
        </div>

        {/* CDSS Scoring Results */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-6 space-y-6">
          <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Activity className="h-5 w-5 text-medical-600" /> Triage Evaluation
          </h3>

          {!result ? (
            <div className="text-center text-slate-400 py-16 border border-dashed border-slate-150 rounded-xl p-4">
              <ShieldCheck className="h-8 w-8 text-emerald-500 mx-auto mb-2 animate-pulse" />
              <p className="text-sm font-semibold">Triage engine standby</p>
              <p className="text-xs text-slate-400 mt-1">Submit patient vitals on the left to compute immediate safety priorities.</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm font-semibold flex items-center gap-1.5 shadow-xs">
                <CheckCircle className="h-4.5 w-4.5" /> Calculated successfully!
              </div>

              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-sm font-medium text-slate-500">Calculated Priority</span>
                <span className={`px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getPriorityStyle(result.priority)}`}>
                  {result.priority}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Triage Score</span>
                <div className="text-3xl font-extrabold text-slate-800">{result.risk_score.toFixed(1)} <span className="text-xs text-slate-400 font-medium">/ 100</span></div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Clinical Triggers</span>
                <p className="text-xs text-slate-650 bg-slate-50 border border-slate-150 p-3 rounded-lg leading-relaxed">
                  {result.reasoning}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <Link
                  to="/doctor/emergency"
                  className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-slate-800 hover:bg-slate-900 transition-colors shadow-sm"
                >
                  Open Emergency Queue
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
