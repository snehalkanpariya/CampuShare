import React, { useState } from 'react';
import { registerJuniorApi } from '../config/api';
import { GraduationCap, ArrowLeft, Lock, User, Hash } from 'lucide-react';

export default function JuniorRegister({ onNavigate, setVerificationData }) {
  const [formData, setFormData] = useState({
    name: '',
    enrollmentNumber: '',
    department: 'MCA',
    year: '1st Year',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await registerJuniorApi(formData);
      setVerificationData({
        enrollmentNumber: formData.enrollmentNumber,
        email: result.email,
        name: formData.name,
        role: 'JUNIOR'
      });
      onNavigate('junior-otp');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const autoEmail = formData.enrollmentNumber 
    ? `${formData.enrollmentNumber.toLowerCase()}.gvp@gujaratvidyapith.org` 
    : 'enrollment.gvp@gujaratvidyapith.org';

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
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <GraduationCap size={36} />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-stone-800">Junior Registration</h2>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3.5 rounded-xl text-sm font-semibold mb-4">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">Full Name</label>
            <div className="relative">
              <User size={18} className="absolute left-3.5 top-3 text-stone-400" />
              <input
                type="text"
                required
                placeholder="Snehal Kanpariya"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-blue-500 outline-none text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">Enrollment Number</label>
            <div className="relative">
              <Hash size={18} className="absolute left-3.5 top-3 text-stone-400" />
              <input
                type="text"
                required
                placeholder="24MCA001"
                value={formData.enrollmentNumber}
                onChange={(e) => setFormData({ ...formData, enrollmentNumber: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-blue-500 outline-none text-sm font-medium"
              />
            </div>
            <div className="text-xs text-sage font-bold mt-1.5">
              ✉️ {autoEmail}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 outline-none text-sm font-medium bg-white"
              >
                <option value="MCA">MCA</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Arts">Arts & Gujarati</option>
                <option value="Science">Science</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">Academic Year</label>
              <select
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 outline-none text-sm font-medium bg-white"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
              </select>
            </div>
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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-blue-500 outline-none text-sm font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-full font-bold text-base shadow-lg shadow-blue-500/25 transition-all mt-4 disabled:opacity-50"
          >
            {loading ? 'Initiating Registration...' : 'Register & Send OTP Email'}
          </button>
        </form>
      </div>
    </div>
  );
}
