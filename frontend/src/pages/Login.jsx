import React, { useState } from 'react';
import { loginApi } from '../config/api';
import { Lock, Mail, ArrowRight, ShieldAlert } from 'lucide-react';
import CharkhaLogo from '../components/CharkhaLogo';
import { useLanguage } from '../context/LanguageContext';

export default function Login({ onNavigate, setCurrentUser }) {
  const { t } = useLanguage();
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

      const isAdmin = result.user.role === 'ADMIN' || (result.user.roles && result.user.roles.includes('ADMIN'));
      setCurrentUser({
        ...result.user,
        roles: result.user.roles || (isAdmin ? ['ADMIN'] : [result.user.role]),
        verified: true
      });

      onNavigate(isAdmin ? 'admin-dashboard' : 'dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Invalid credentials or unverified account.');
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
            {t('loginTitle', 'CampuShare Login')}
          </h2>
          <p className="text-xs text-stone-500 font-medium mt-1">
            {t('loginSubtitle', 'Sign in with your Gujarat Vidyapith credentials')}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-xs font-bold border border-red-200 space-y-2 animate-fade-in">
            <div className="flex items-center gap-2 text-sm font-extrabold">
              <ShieldAlert size={18} /> Login Unsuccessful
            </div>
            <div>{error}</div>
            {error.toLowerCase().includes('not verified') && (
              <button
                type="button"
                onClick={() => onNavigate('role-select')}
                className="mt-2 bg-terracotta text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-sm cursor-pointer"
              >
                {t('completeVerification', 'Complete Verification Now')}
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
              {t('identifierLabel', 'GVP Email or Enrollment Number')}
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-3 text-stone-400" />
              <input
                type="text"
                required
                placeholder={t('identifierPlaceholder', '24MCA001 or 250160450013')}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-terracotta outline-none text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600">
                {t('password', 'Password')}
              </label>
              <button
                type="button"
                onClick={() => onNavigate('forgot-password')}
                className="text-xs text-terracotta font-bold hover:underline"
              >
                {t('forgotPassword', 'Forgot Password?')}
              </button>
            </div>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-3 text-stone-400" />
              <input
                type="password"
                required
                placeholder={t('passwordPlaceholder', 'Enter password')}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-terracotta outline-none text-sm font-medium"
              />
            </div>
          </div>

          <div className="bg-amber-50/80 border border-amber-200/70 p-2.5 rounded-xl text-[11px] text-amber-900 leading-snug">
            💡 <strong>Authorized by Admin?</strong> Sign in with your <strong>Enrollment Number</strong> and password (default is your Enrollment Number).
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-terracotta hover:bg-terracotta-hover text-white py-3.5 rounded-full font-bold text-base shadow-lg shadow-terracotta/25 flex items-center justify-center gap-2 transition-all mt-4 disabled:opacity-50 cursor-pointer"
          >
            {loading ? t('processing', 'Authenticating...') : t('loginButton', 'Sign In')} <ArrowRight size={18} />
          </button>
        </form>

        <div className="text-center text-xs font-bold text-stone-500 pt-2 border-t border-stone-100">
          {t('noAccount', "Don't have an account?")}{' '}
          <button
            type="button"
            onClick={() => onNavigate('role-select')}
            className="text-terracotta font-extrabold hover:underline cursor-pointer"
          >
            {t('registerNow', 'Register now')}
          </button>
        </div>
      </div>
    </div>
  );
}
