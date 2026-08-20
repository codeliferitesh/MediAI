import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Pill, Plus, Trash, AlertTriangle, ShieldCheck, CheckCircle2, User } from 'lucide-react';

interface Patient {
  id: string;
  profile: {
    full_name: string;
  };
}

interface Medication {
  id: string;
  name: string;
  generic_name: string;
  category: string;
  description: string;
}

interface SelectedMedication {
  medication_id: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  name: string;
}

interface InteractionWarning {
  medication_a: string;
  medication_b: string;
  severity: 'Severe' | 'Moderate' | 'Mild';
  warning_message: string;
}

export const Prescriptions: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  
  // Form fields
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedMeds, setSelectedMeds] = useState<SelectedMedication[]>([]);
  const [notes, setNotes] = useState('');
  
  // Current medication builder fields
  const [currentMedId, setCurrentMedId] = useState('');
  const [dosage, setDosage] = useState('500mg');
  const [frequency, setFrequency] = useState('Once daily');
  const [duration, setDuration] = useState('7 days');
  const [instructions, setInstructions] = useState('Take after food');
  
  // CDSS Alerts
  const [interactions, setInteractions] = useState<InteractionWarning[]>([]);
  
  // Submission flags
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [medRes] = await Promise.all([
        api.get<Medication[]>('/prescriptions/medications')
      ]);
      setMedications(medRes.data);
      if (medRes.data.length > 0) {
        setCurrentMedId(medRes.data[0].id);
      }
      
      // Load mock/real patients for selection
      api.get<Patient[]>('/patients/directory').then(res => {
        setPatients(res.data);
        if (res.data.length > 0) setSelectedPatientId(res.data[0].id);
      }).catch(() => {
        // Mock fallback patient list
        const mockPats = [
          { id: "3fa85f64-5717-4562-b3fc-2c963f66afa6", profile: { full_name: "Robert Jenkins" } },
          { id: "7ca95f64-5717-4562-b3fc-2c963f66af23", profile: { full_name: "Emily Miller" } }
        ];
        setPatients(mockPats);
        if (mockPats.length > 0) setSelectedPatientId(mockPats[0].id);
      });
    } catch (err) {
      console.error("Failed to load list details:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Recalculate drug interactions on-the-fly when meds list changes
  useEffect(() => {
    if (selectedMeds.length < 2) {
      setInteractions([]);
      return;
    }
    
    const medIds = selectedMeds.map(m => m.medication_id);
    api.post<InteractionWarning[]>('/prescriptions/check-interactions', medIds)
      .then(res => {
        setInteractions(res.data);
      })
      .catch(e => console.error("Interactions lookup failure:", e));
  }, [selectedMeds]);

  const handleAddMedication = () => {
    if (!currentMedId) return;
    const medDetails = medications.find(m => m.id === currentMedId);
    if (!medDetails) return;

    // Avoid duplicating same med in prescription list
    if (selectedMeds.some(m => m.medication_id === currentMedId)) {
      return;
    }

    const newItem: SelectedMedication = {
      medication_id: currentMedId,
      name: medDetails.name,
      dosage,
      frequency,
      duration,
      instructions
    };

    setSelectedMeds(prev => [...prev, newItem]);
  };

  const handleRemoveMedication = (index: number) => {
    setSelectedMeds(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMeds.length === 0 || !selectedPatientId) return;
    
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      await api.post('/prescriptions', {
        patient_id: selectedPatientId,
        notes,
        items: selectedMeds.map(m => ({
          medication_id: m.medication_id,
          dosage: m.dosage,
          frequency: m.frequency,
          duration: m.duration,
          instructions: m.instructions
        }))
      });
      setSuccess(true);
      setSelectedMeds([]);
      setNotes('');
    } catch (err: any) {
      setError(err.response?.data?.detail || "Prescription submission failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const hasSevereInteraction = interactions.some(i => i.severity === 'Severe');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Prescription Writer & Drug CDSS</h2>
        <p className="text-slate-500 text-sm mt-1">Compose patient prescriptions and review deterministic drug-to-drug interactions warnings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Prescription Builder */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-xs p-6 space-y-6">
          <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">Prescription Record Builder</h3>

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm font-semibold flex items-center gap-1.5 shadow-xs">
              <CheckCircle2 className="h-4.5 w-4.5" /> Digital prescription generated successfully!
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-650 p-3 rounded-lg text-sm font-medium flex items-center gap-1.5 shadow-xs">
              <AlertTriangle className="h-4.5 w-4.5" /> <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmitPrescription} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Select Patient</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="block w-full pl-9 border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-medical-500 focus:bg-white text-slate-700 font-semibold"
                  >
                    {patients.map((pat) => (
                      <option key={pat.id} value={pat.id}>{pat.profile.full_name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Added Meds List */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Prescribed Medication Items</span>
              {selectedMeds.length === 0 ? (
                <div className="text-center py-8 text-slate-400 border border-dashed border-slate-150 rounded-xl text-sm">
                  <Pill className="h-7 w-7 mx-auto mb-1 text-slate-350" />
                  <p>Add medications using the selector tool below.</p>
                </div>
              ) : (
                <div className="border border-slate-100 rounded-xl overflow-hidden shadow-2xs">
                  <table className="min-w-full divide-y divide-slate-100">
                    <tbody className="divide-y divide-slate-100 bg-white text-sm text-slate-700">
                      {selectedMeds.map((med, index) => (
                        <tr key={index} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3.5 font-bold text-slate-800">{med.name}</td>
                          <td className="px-4 py-3.5">{med.dosage} - {med.frequency} ({med.duration})</td>
                          <td className="px-4 py-3.5 text-xs text-slate-450 italic truncate max-w-[150px]">{med.instructions}</td>
                          <td className="px-4 py-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveMedication(index)}
                              className="text-red-500 hover:text-red-700 transition-colors p-1"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Med builder panel */}
            <div className="bg-slate-50/60 p-4 border border-slate-150 rounded-xl space-y-4">
              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Add Medication Tool</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Medication Name</label>
                  <select
                    value={currentMedId}
                    onChange={(e) => setCurrentMedId(e.target.value)}
                    className="block w-full border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-medical-500 text-slate-750 font-semibold"
                  >
                    {medications.map((m) => (
                      <option key={m.id} value={m.id}>{m.name} ({m.generic_name})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Dosage</label>
                    <input type="text" value={dosage} onChange={(e) => setDosage(e.target.value)} className="block w-full border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-sm focus:outline-none focus:ring-2" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Freq</label>
                    <input type="text" value={frequency} onChange={(e) => setFrequency(e.target.value)} className="block w-full border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-sm focus:outline-none focus:ring-2" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Dur</label>
                    <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)} className="block w-full border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-sm focus:outline-none focus:ring-2" />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-xs text-slate-500 mb-1">Intake Instructions</label>
                  <input type="text" value={instructions} onChange={(e) => setInstructions(e.target.value)} className="block w-full border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-sm focus:outline-none focus:ring-2" placeholder="e.g. Take after meals" />
                </div>
                <button
                  type="button"
                  onClick={handleAddMedication}
                  className="bg-medical-50 border border-medical-200 text-medical-600 hover:bg-medical-600 hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1 shrink-0"
                >
                  <Plus className="h-4 w-4" /> Add Item
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Clinical Directives / Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="block w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-medical-500 focus:bg-white text-slate-750"
                placeholder="Include general outpatient guidelines or diet restrictions..."
              />
            </div>

            <button
              type="submit"
              disabled={loading || selectedMeds.length === 0 || hasSevereInteraction}
              className="w-full bg-medical-600 hover:bg-medical-700 text-white py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm"
            >
              {loading ? "Issuing prescription..." : "Authorize and Sign prescription"}
            </button>
          </form>
        </div>

        {/* CDSS Drug Interactions Monitor Panel */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-6 space-y-6">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <AlertTriangle className="h-5 w-5 text-amber-500" /> CDSS Interactions Monitor
          </h3>

          {selectedMeds.length < 2 ? (
            <div className="text-center text-slate-400 py-12 border border-dashed border-slate-150 rounded-xl p-4">
              <ShieldCheck className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-semibold">Monitor idle</p>
              <p className="text-xs text-slate-400 mt-1">Add multiple medications to trigger active interaction scans.</p>
            </div>
          ) : interactions.length === 0 ? (
            <div className="bg-emerald-50/50 border border-emerald-250 p-4 rounded-xl text-center">
              <ShieldCheck className="h-9 w-9 text-emerald-650 mx-auto mb-1.5" />
              <p className="text-sm font-bold text-emerald-805">No Interactions Detected</p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">The prescribed combination shows no adverse clinical indicators. Safe to authorize.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {interactions.map((warn, index) => (
                <div
                  key={index}
                  className={`border p-4 rounded-xl space-y-2 ${
                    warn.severity === 'Severe'
                      ? 'bg-red-50/45 border-red-200 text-red-800'
                      : 'bg-amber-50/45 border-amber-250 text-amber-800'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm block">
                      {warn.medication_a} + {warn.medication_b}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                      warn.severity === 'Severe'
                        ? 'bg-red-500 text-white'
                        : 'bg-amber-500 text-white'
                    }`}>
                      {warn.severity}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-700 bg-white/70 p-2.5 rounded-lg border border-black/5">
                    {warn.warning_message}
                  </p>
                  {warn.severity === 'Severe' && (
                    <span className="text-[10px] text-red-500 font-extrabold block">
                      ⚠️ SEVERE CONFLICT: SUBMISSION IS LOCKED
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
