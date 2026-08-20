import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { Pill, FileText, Printer, Calendar, Clock } from 'lucide-react';

interface Medication {
  id: string;
  name: string;
  generic_name: string;
  category: string;
  description: string;
}

interface PrescriptionItem {
  id: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  medication: Medication;
}

interface Doctor {
  id: string;
  profile: {
    full_name: string;
  };
  specialization: string;
}

interface Prescription {
  id: string;
  notes: string;
  created_at: string;
  doctor: Doctor;
  items: PrescriptionItem[];
}

export const Prescriptions = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [activePrescription, setActivePrescription] = useState<Prescription | null>(null);

  const fetchPrescriptions = async () => {
    if (!user) return;
    try {
      const response = await api.get<Prescription[]>(`/prescriptions/patient/${user.id}`);
      setPrescriptions(response.data);
      if (response.data.length > 0) {
        setActivePrescription(response.data[0]);
      }
    } catch (err) {
      console.error("Failed to load prescriptions:", err);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [user]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Print-only CSS style */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
            padding: 30px;
          }
        }
      `}} />

      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Clinical Prescriptions</h2>
        <p className="text-slate-500 text-sm mt-1">Review active medications, doctor instructions, and print official Rx sheets.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Prescriptions History List */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Prescriptions History</h3>
          
          {prescriptions.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm border border-dashed border-slate-150 rounded-xl">
              <Pill className="h-8 w-8 text-slate-350 mx-auto mb-2" />
              <p className="font-semibold">No active prescriptions</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {prescriptions.map((pr) => (
                <button
                  key={pr.id}
                  onClick={() => setActivePrescription(pr)}
                  className={`w-full text-left p-3.5 rounded-lg border transition-all flex items-center gap-3.5 ${
                    activePrescription?.id === pr.id
                      ? 'border-medical-500 bg-medical-50/30'
                      : 'border-slate-150 hover:bg-slate-50/50'
                  }`}
                >
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border shadow-xs ${
                    activePrescription?.id === pr.id
                      ? 'bg-medical-100 border-medical-200 text-medical-600'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}>
                    <Pill className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">
                      Dr. {pr.doctor?.profile?.full_name || "Clinic Doctor"}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Date: {new Date(pr.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Active Prescription Details / Printable Rx Sheet */}
        <div className="lg:col-span-2 space-y-6">
          {activePrescription ? (
            <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-6 md:p-8 space-y-6 flex flex-col justify-between min-h-[500px]">
              {/* Header Details */}
              <div id="print-area" className="space-y-6">
                <div className="flex justify-between items-start border-b border-slate-100 pb-5">
                  <div className="space-y-1">
                    <h3 className="text-lg font-extrabold text-slate-800">OFFICIAL PRESCRIPTION RECORD</h3>
                    <p className="text-xs text-slate-400">MediAI Intelligent Outpatient Clinic</p>
                    <p className="text-[10px] text-slate-450 mt-1 font-mono">ID: {activePrescription.id}</p>
                  </div>
                  <div className="text-right">
                    <button
                      onClick={handlePrint}
                      className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-650 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-xs print:hidden"
                    >
                      <Printer className="h-4 w-4" /> Print Rx Sheet
                    </button>
                  </div>
                </div>

                {/* Patient/Doctor metadata */}
                <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-150 text-sm text-slate-700">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Patient Details</span>
                    <p className="font-bold text-slate-800">{user?.full_name}</p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Prescriber</span>
                    <p className="font-bold text-slate-800">
                      Dr. {activePrescription.doctor?.profile?.full_name || "Hospital Staff"}
                    </p>
                    <p className="text-xs text-slate-500">{activePrescription.doctor?.specialization || "General Medicine"}</p>
                  </div>
                </div>

                {/* Prescription Items */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Prescribed Medications</span>
                  <div className="border border-slate-100 rounded-xl overflow-hidden shadow-xs">
                    <table className="min-w-full divide-y divide-slate-100">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase">Medication</th>
                          <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase">Dosage</th>
                          <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase">Frequency</th>
                          <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase">Duration</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white text-sm text-slate-700">
                        {activePrescription.items.map((item) => (
                          <React.Fragment key={item.id}>
                            <tr className="hover:bg-slate-50/30">
                              <td className="px-4 py-2.5 font-bold text-slate-800">
                                {item.medication?.name || "Generic Drug"}
                                <span className="block text-[10px] text-slate-400 font-normal">
                                  {item.medication?.generic_name}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 font-medium">{item.dosage}</td>
                              <td className="px-4 py-2.5 flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5 text-slate-400" /> {item.frequency}
                              </td>
                              <td className="px-4 py-2.5 font-medium">{item.duration}</td>
                            </tr>
                            {item.instructions && (
                              <tr className="bg-slate-50/30">
                                <td colSpan={4} className="px-4 py-1.5 text-xs text-slate-500 italic">
                                  Direction: {item.instructions}
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Notes */}
                {activePrescription.notes && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Clinical Notes / Directives</span>
                    <p className="text-sm text-slate-650 bg-slate-50/50 p-4 rounded-xl border border-slate-150 leading-relaxed italic">
                      "{activePrescription.notes}"
                    </p>
                  </div>
                )}
              </div>
              
              <div className="border-t border-slate-100 pt-6 mt-8 flex justify-between items-center text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" /> Issue Date: {new Date(activePrescription.created_at).toLocaleDateString()}
                </span>
                <span className="font-semibold text-slate-450">MediAI Clinical Decision Support System</span>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-12 text-center text-slate-400 flex flex-col items-center justify-center min-h-[500px]">
              <FileText className="h-10 w-10 text-slate-300 mb-2" />
              <p className="text-sm font-semibold">Select a prescription to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
