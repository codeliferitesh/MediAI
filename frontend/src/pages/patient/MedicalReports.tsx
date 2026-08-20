import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { FileText, Upload, CheckCircle2, AlertCircle, Eye, X, Loader2 } from 'lucide-react';

interface MedicalReport {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  status: string;
  uploaded_at: string;
  extracted_text?: string;
}

interface AIAnalysis {
  id: string;
  key_findings: string[];
  abnormal_values: Record<string, string>;
  observations: string[];
  suggested_questions: string[];
  summary_text: string;
}

export const MedicalReports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    if (!user) return;
    try {
      const response = await api.get<MedicalReport[]>(`/reports/patient/${user.id}`);
      setReports(response.data);
    } catch (err) {
      console.error("Failed to load reports:", err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [user]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user) return;
    
    setError(null);
    setUploading(true);
    const file = files[0];
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post(`/reports/upload?patient_id=${user.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchReports();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Upload failed. Verify file type (PDF/JPG/PNG) and size limit (<5MB).");
    } finally {
      setUploading(false);
    }
  };

  const handleViewAnalysis = async (report: MedicalReport) => {
    setSelectedReport(report);
    setLoadingAnalysis(true);
    setAnalysis(null);
    try {
      const response = await api.get<AIAnalysis>(`/reports/${report.id}/analysis`);
      setAnalysis(response.data);
    } catch (err) {
      console.error("No analysis found or failed to load:", err);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const getFileUrl = (path: string) => {
    if (path.startsWith("uploads/")) {
      return `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/${path}`;
    }
    // Supabase storage relative URL can be fetched via signed urls, 
    // but for demo, standard endpoint fallback handles local paths.
    return "#";
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Clinical Lab Reports</h2>
          <p className="text-slate-500 text-sm mt-1">Upload clinical files to view structured summaries powered by Google Gemini CDSS.</p>
        </div>
        
        {/* Upload Button */}
        <label className="flex items-center gap-2 bg-medical-600 hover:bg-medical-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer shadow-xs self-start sm:self-center">
          {uploading ? (
            <Loader2 className="h-4.5 w-4.5 animate-spin" />
          ) : (
            <Upload className="h-4.5 w-4.5" />
          )}
          {uploading ? "Analyzing File..." : "Upload Laboratory Report"}
          <input type="file" onChange={handleFileUpload} accept=".pdf,.png,.jpg,.jpeg" className="hidden" disabled={uploading} />
        </label>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-650 text-sm p-4 rounded-xl flex items-center gap-2 shadow-xs">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Reports Grid */}
      {reports.length === 0 ? (
        <div className="border border-dashed border-slate-200 rounded-xl p-12 text-center text-slate-450 flex flex-col items-center justify-center min-h-[300px] bg-white shadow-xs">
          <FileText className="h-12 w-12 text-slate-350 mb-3" />
          <p className="text-base font-bold text-slate-700">No laboratory files uploaded yet</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
            Upload blood panels, discharge summaries, or urine tests to instantly index findings, run OCR scanners, and extract clinical charts.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <div key={report.id} className="bg-white rounded-xl border border-slate-100 shadow-xs hover:shadow-md hover:border-slate-250 transition-all p-5 flex flex-col justify-between h-48">
              <div className="flex gap-4">
                <div className="h-10 w-10 bg-medical-50 border border-medical-100 rounded-lg flex items-center justify-center text-medical-600 shrink-0 shadow-sm">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-800 text-sm truncate">{report.file_name}</h3>
                  <p className="text-xs text-slate-400 mt-1">Uploaded: {new Date(report.uploaded_at).toLocaleDateString()}</p>
                  <p className="text-[10px] text-slate-450 mt-0.5">Size: {(report.file_size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Checked
                </span>
                
                <button
                  onClick={() => handleViewAnalysis(report)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-medical-600 hover:text-medical-700 transition-colors"
                >
                  <Eye className="h-4 w-4" /> View AI Insights
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Analysis */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 rounded-t-2xl">
              <div>
                <h3 className="font-extrabold text-slate-800 text-lg">AI Report Summary Analysis</h3>
                <p className="text-slate-450 text-xs truncate max-w-md mt-0.5">{selectedReport.file_name}</p>
              </div>
              <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {loadingAnalysis ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="h-10 w-10 text-medical-600 animate-spin" />
                  <p className="text-sm font-semibold text-slate-500">Retrieving AI insights...</p>
                </div>
              ) : !analysis ? (
                <div className="text-center text-slate-450 py-12">
                  <AlertCircle className="h-10 w-10 text-slate-350 mx-auto mb-2" />
                  <p className="text-sm font-semibold">Insights Unavailable</p>
                  <p className="text-xs text-slate-400 mt-1">This report is pending analysis or lacks OCR text.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Summary Text */}
                  <div className="bg-medical-50/30 border border-medical-200/40 rounded-xl p-4 text-sm text-slate-700 leading-relaxed shadow-sm">
                    <span className="font-bold text-medical-800 block mb-1">Clinical Overview</span>
                    {analysis.summary_text}
                  </div>

                  {/* Abnormal values */}
                  {Object.keys(analysis.abnormal_values).length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Abnormal Test Metrics</span>
                      <div className="border border-slate-100 rounded-xl overflow-hidden shadow-xs">
                        <table className="min-w-full divide-y divide-slate-100">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase">Test Parameter</th>
                              <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase">Reported Value</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {Object.entries(analysis.abnormal_values).map(([metric, val]) => (
                              <tr key={metric} className="hover:bg-slate-50/50">
                                <td className="px-4 py-2.5 text-sm font-semibold text-slate-750">{metric}</td>
                                <td className="px-4 py-2.5 text-sm text-red-600 font-bold">{val}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Findings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Key Findings</span>
                      <ul className="list-disc list-inside text-sm text-slate-650 space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-150">
                        {analysis.key_findings.map((f, idx) => (
                          <li key={idx} className="leading-relaxed">{f}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Suggested doctor questions</span>
                      <ul className="list-disc list-inside text-sm text-slate-650 space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-150">
                        {analysis.suggested_questions.map((q, idx) => (
                          <li key={idx} className="leading-relaxed">{q}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* View raw file */}
                  {selectedReport.file_path && (
                    <div className="border-t border-slate-100 pt-4 flex gap-4">
                      {selectedReport.file_path.startsWith("uploads/") && (
                        <a
                          href={getFileUrl(selectedReport.file_path)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-xs font-bold text-medical-600 hover:text-medical-700 transition-colors"
                        >
                          <Eye className="h-4.5 w-4.5" /> View Uploaded Laboratory File
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
