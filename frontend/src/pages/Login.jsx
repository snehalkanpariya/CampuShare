import React, { useState } from 'react';
import { loginApi } from '../config/api';
import { Lock, Mail, ArrowRight, ShieldAlert } from 'lucide-react';
import CharkhaLogo from '../components/CharkhaLogo';

export default function Login({ onNavigate, setCurrentUser }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await loginApi(formData);
      
      localStorage.setItem('campus_token', result.token);
      localStorage.setItem('campus_user', JSON.stringify(result.user));

      setCurrentUser({
        ...result.user,
        verified: true
      });

      onNavigate('dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Invalid credentials or unverified student account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-stone-200 space-y-6">
        <div className="text-center">
          <CharkhaLogo size={64} className="mx-auto mb-3" />
          <h2 className="text-3xl font-extrabold font-serif text-terracotta">
            CampuShare Login
          </h2>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-xs font-bold border border-red-200 space-y-2">
            <div className="flex items-center gap-2 text-sm font-extrabold">
              <ShieldAlert size={18} /> Login Unsuccessful
            </div>
            <div>{error}</div>
            {error.toLowerCase().includes('not verified') && (
              <button
                type="button"
                onClick={() => onNavigate('role-select')}
                className="mt-2 bg-terracotta text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-sm"
              >
                Complete Verification Now
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
              GVP Email or Enrollment Number
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-3 text-stone-400" />
              <input
                type="text"
                required
                placeholder="250160450049 or 250160450049.gvp@gujaratvidyapith.org"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-terracotta outline-none text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600">Password</label>
              <button
                type="button"
                onClick={() => onNavigate('forgot-password')}
                className="text-xs text-terracotta font-bold hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-3 text-stone-400" />
              <input
                type="password"
                required
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-terracotta outline-none text-sm font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-terracotta hover:bg-terracotta-hover text-white py-3.5 rounded-full font-bold text-base shadow-lg shadow-terracotta/25 flex items-center justify-center gap-2 transition-all mt-4 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={18} />
          </button>
        </form>

        <div className="text-center text-xs font-bold text-stone-500 pt-2 border-t border-stone-100">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => onNavigate('role-select')}
            className="text-terracotta font-extrabold hover:underline"
          >
            Register Student
          </button>
        </div>
      </div>
    </div>
  );
}
