import React, { useState } from 'react';
import { api } from '../../services/api';
import { Send, Activity, ShieldAlert, Sparkles, HelpCircle, CheckCircle } from 'lucide-react';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

interface TriageResult {
  triage_priority: 'Critical' | 'High' | 'Medium' | 'Low';
  urgency_reasoning: string;
  follow_up_questions: string[];
  clinical_guidance: string;
}

export const SymptomChecker: React.FC = () => {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'ai', text: "Hello! Describe the symptoms you are experiencing. I will assess the clinical priority and provide guidance." }
  ]);
  const [triage, setTriage] = useState<TriageResult | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim() || loading) return;

    const userText = symptoms;
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setSymptoms('');
    setLoading(true);

    try {
      const response = await api.post<TriageResult>('/ai/symptoms', { symptoms: userText });
      const data = response.data;
      
      setMessages(prev => [
        ...prev,
        { 
          sender: 'ai', 
          text: `Based on your symptoms, I have categorized the triage priority as ${data.triage_priority}. Please review the clinical guidance panel.` 
        }
      ]);
      setTriage(data);
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'ai', text: "I encountered an issue analyzing your symptoms. Please ensure the clinical server is running." }]);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-500 text-white';
      case 'High': return 'bg-amber-500 text-white';
      case 'Medium': return 'bg-blue-500 text-white';
      default: return 'bg-emerald-500 text-white';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">AI Clinical Symptom Assistant</h2>
        <p className="text-slate-500 text-sm mt-1">Get immediate outpatient priority scoring and general emergency warnings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Chat Box */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-xs flex flex-col h-[520px]">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-slate-700">Clinical Conversation Stream</span>
            </div>
            <Sparkles className="h-4 w-4 text-medical-600" />
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[75%] rounded-2xl p-3.5 text-sm ${
                  msg.sender === 'user'
                    ? 'bg-medical-600 text-white rounded-tr-none'
                    : 'bg-slate-50 text-slate-750 border border-slate-150 rounded-tl-none'
                }`}>
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-none p-4 flex gap-1.5 items-center">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="p-4 border-t border-slate-100 flex gap-2">
            <input
              type="text"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="flex-1 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-medical-500 bg-slate-50 focus:bg-white transition-colors"
              placeholder="Describe your symptoms (e.g. fever, cough, chest tightness)..."
            />
            <button
              type="submit"
              disabled={loading || !symptoms.trim()}
              className="bg-medical-600 hover:bg-medical-700 text-white rounded-lg p-2.5 disabled:opacity-50 transition-colors shadow-sm flex items-center justify-center"
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </form>
        </div>

        {/* Diagnostic Panel */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-6 space-y-6 min-h-[480px]">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Activity className="h-5 w-5 text-medical-600" /> Triage Output
          </h3>

          {!triage ? (
            <div className="flex flex-col items-center justify-center text-center text-slate-450 h-64 border border-dashed border-slate-150 rounded-xl p-4">
              <ShieldAlert className="h-9 w-9 text-slate-300 mb-2" />
              <p className="text-sm font-semibold">Triage results pending</p>
              <p className="text-xs text-slate-400 mt-1">Describe your symptoms in the clinical stream to generate priority ratings.</p>
            </div>
          ) : (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">Triage Priority</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getPriorityColor(triage.triage_priority)}`}>
                  {triage.triage_priority}
                </span>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Clinical Reasoning</span>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 border border-slate-100 p-3 rounded-lg">
                  {triage.urgency_reasoning}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Follow-up Questions</span>
                <ul className="space-y-2 text-sm text-slate-650">
                  {triage.follow_up_questions.map((q, idx) => (
                    <li key={idx} className="flex gap-2 items-start">
                      <HelpCircle className="h-4.5 w-4.5 text-medical-500 shrink-0 mt-0.5" />
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Clinical Guidance</span>
                <div className="bg-medical-50/40 border border-medical-200/50 rounded-lg p-3 text-sm text-slate-700 flex gap-2.5">
                  <CheckCircle className="h-4.5 w-4.5 text-medical-650 shrink-0 mt-0.5" />
                  <p>{triage.clinical_guidance}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
