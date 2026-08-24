import React, { useState } from 'react';
import { registerSeniorApi } from '../config/api';
import { UserCheck, ArrowLeft, Lock, User, Hash } from 'lucide-react';

export default function SeniorRegister({ onNavigate, setVerificationData }) {
  const [formData, setFormData] = useState({
    name: '',
    enrollmentNumber: '',
    department: 'MCA',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedEnrollment = formData.enrollmentNumber.trim();
    if (!/^\d{12}$/.test(trimmedEnrollment)) {
      setError('Enrollment number must be exactly 12 digits (e.g. 250160450049)');
      return;
    }

    setLoading(true);

    try {
      const result = await registerSeniorApi({
        ...formData,
        enrollmentNumber: trimmedEnrollment
      });
      setVerificationData({
        enrollmentNumber: trimmedEnrollment,
        name: formData.name,
        email: result.email,
        role: 'SENIOR'
      });
      onNavigate('senior-upload');
    } catch (err) {
      setError(err.message || 'Senior registration failed');
    } finally {
      setLoading(false);
    }
  };

  const autoEmail = formData.enrollmentNumber.trim() 
    ? `${formData.enrollmentNumber.trim().toLowerCase()}.gvp@gujaratvidyapith.org` 
    : '250160450049.gvp@gujaratvidyapith.org';

  return (
    <div className="p-6 max-w-lg mx-auto space-y-4">
      <button 
        onClick={() => onNavigate('role-select')}
        className="flex items-center gap-2 text-stone-500 font-bold text-sm hover:text-stone-800"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div className="bg-white rounded-3xl p-8 shadow-xl border border-stone-200">
        <div className="flex items-center gap-4 mb-6 border-b border-stone-100 pb-4">
          <div className="w-16 h-16 rounded-2xl bg-gold-light text-gold flex items-center justify-center shrink-0">
            <UserCheck size={36} />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-stone-800">Senior Registration</h2>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3.5 rounded-xl text-sm font-semibold mb-4">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">Full Name (As on Marksheet)</label>
            <div className="relative">
              <User size={18} className="absolute left-3.5 top-3 text-stone-400" />
              <input
                type="text"
                required
                placeholder="DHRUVI GIRISHBHAI MALAVIYA"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-terracotta outline-none text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">Enrollment Number (12 Digits)</label>
            <div className="relative">
              <Hash size={18} className="absolute left-3.5 top-3 text-stone-400" />
              <input
                type="text"
                required
                maxLength={12}
                placeholder="250160450049"
                value={formData.enrollmentNumber}
                onChange={(e) => setFormData({ ...formData, enrollmentNumber: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-terracotta outline-none text-sm font-medium"
              />
            </div>
            <div className="text-xs text-stone-500 font-semibold mt-1.5">
              GVP Account ID: {autoEmail}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">Department</label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-stone-300 outline-none text-sm font-medium bg-white"
            >
              <option value="MCA">MCA (Master of Computer Application)</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Arts">Arts & Humanities</option>
              <option value="Science">Science</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-3 text-stone-400" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-terracotta outline-none text-sm font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-terracotta hover:bg-terracotta-hover text-white py-3 rounded-full font-bold text-base shadow-lg shadow-terracotta/25 transition-all mt-4 disabled:opacity-50"
          >
            {loading ? 'Initiating Registration...' : 'Register & Proceed to Upload'}
          </button>
        </form>
      </div>
    </div>
  );
}
