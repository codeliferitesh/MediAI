import React, { useState } from 'react';
import { api } from '../../services/api';
import { User, Mail, Calendar, Phone, Activity, CheckCircle, AlertTriangle } from 'lucide-react';

export const Registrations = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const password = 'PatientPass123!'; // default placeholder password
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [phone, setPhone] = useState('');
  const [bloodType, setBloodType] = useState('O+');
  const [history, setHistory] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      // Create patient account profile and clinical details in one request
      await api.post('/patients', {
        full_name: fullName,
        email,
        password,
        date_of_birth: dob || null,
        gender,
        phone_number: phone,
        blood_type: bloodType,
        medical_history: history
      });
      
      setSuccess(true);
      // Reset form fields
      setFullName('');
      setEmail('');
      setDob('');
      setPhone('');
      setHistory('');
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed. Verify if email is already taken.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Onboard Outpatient</h2>
        <p className="text-slate-500 text-sm mt-1">Register new patient profiles and record intake medical details.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-6 md:p-8 space-y-6">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
          <User className="h-5 w-5 text-medical-600" /> Patient Registry Form
        </h3>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-2xs">
            <CheckCircle className="h-5 w-5" /> Patient registered successfully and medical records created!
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-650 p-4 rounded-xl text-sm font-medium flex items-center gap-2 shadow-2xs">
            <AlertTriangle className="h-5 w-5 shrink-0" /> <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-450">
                  <User className="h-4.5 w-4.5" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full pl-9 border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-medical-500 focus:bg-white transition-colors"
                  placeholder="Jane Miller"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-450">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-9 border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-medical-500 focus:bg-white transition-colors"
                  placeholder="jane.m@example.com"
                />
              </div>
            </div>

            {/* DOB */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date of Birth</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-450">
                  <Calendar className="h-4.5 w-4.5" />
                </div>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="block w-full pl-9 border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-medical-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-450">
                  <Phone className="h-4.5 w-4.5" />
                </div>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full pl-9 border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-medical-500 focus:bg-white transition-colors"
                  placeholder="555-0122"
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="block w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-medical-500 focus:bg-white transition-colors"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Blood Type */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Blood Type</label>
              <select
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                className="block w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-medical-500 focus:bg-white transition-colors"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          {/* Medical History */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Known Allergies & Clinical History</label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none text-slate-450">
                <Activity className="h-4.5 w-4.5" />
              </div>
              <textarea
                value={history}
                onChange={(e) => setHistory(e.target.value)}
                rows={4}
                className="block w-full pl-9 border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-medical-500 focus:bg-white transition-colors"
                placeholder="Include previous surgeries, hypertension levels, chronic conditions..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-medical-600 hover:bg-medical-700 text-white py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm"
          >
            {loading ? "Registering account..." : "Complete Registry"}
          </button>
        </form>
      </div>
    </div>
  );
};
