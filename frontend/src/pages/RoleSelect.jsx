import React from 'react';
import { GraduationCap, UserCheck, ArrowRight, ArrowLeft, Mail, FileCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function RoleSelect({ onNavigate }) {
  const { t } = useLanguage();

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <button 
        onClick={() => onNavigate('welcome')}
        className="flex items-center gap-2 text-stone-500 font-bold text-sm hover:text-stone-800 transition-colors cursor-pointer"
      >
        <ArrowLeft size={18} /> {t('back', 'Back')}
      </button>

      <div className="text-center space-y-2">
        <h2 className="text-3xl font-extrabold font-serif text-terracotta">
          {t('selectRoleTitle', 'Select Your Student Role')}
        </h2>
        <p className="text-stone-600 font-bold text-sm max-w-xl mx-auto">
          {t('selectRoleDesc', 'Choose your enrollment category to proceed with institutional verification.')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Active Student (Has GVP Email) */}
        <div
          onClick={() => onNavigate('junior-register')}
          className="bg-white rounded-3xl p-8 border-2 border-stone-200 shadow-md hover:border-blue-500 hover:shadow-xl cursor-pointer transition-all flex flex-col justify-between text-center group"
        >
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Mail size={48} />
            </div>
            <h3 className="text-xl font-extrabold text-stone-800 mb-2">
              {t('juniorCardTitle', 'Junior Student')}
            </h3>
            <p className="text-xs font-semibold text-stone-500 mb-6 leading-relaxed">
              {t('juniorRoleDesc', 'Instant verification via institutional email OTP (<enrollment>.gvp@gujaratvidyapith.org).')}
            </p>
          </div>

          <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-extrabold text-xs w-full flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer">
            <GraduationCap size={18} /> {t('juniorCardTitle', 'Junior Student')} <ArrowRight size={16} />
          </button>
        </div>

        {/* Completed Course / Senior (Marksheet OCR) */}
        <div
          onClick={() => onNavigate('senior-register')}
          className="bg-white rounded-3xl p-8 border-2 border-stone-200 shadow-md hover:border-terracotta hover:shadow-xl cursor-pointer transition-all flex flex-col justify-between text-center group"
        >
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-gold-light text-gold flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileCheck size={48} />
            </div>
            <h3 className="text-xl font-extrabold text-stone-800 mb-2">
              {t('seniorCardTitle', 'Senior Student')}
            </h3>
            <p className="text-xs font-semibold text-stone-500 mb-6 leading-relaxed">
              {t('seniorRoleDesc', 'Privacy-first zero-storage Marksheet OCR identity verification.')}
            </p>
          </div>

          <button className="bg-terracotta hover:bg-terracotta-hover text-white px-5 py-3 rounded-2xl font-extrabold text-xs w-full flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer">
            <UserCheck size={18} /> {t('seniorCardTitle', 'Senior Student')} <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <div className="text-center text-xs font-bold text-stone-500 pt-4">
        {t('alreadyHaveAccount', 'Already have a registered account?')}{' '}
        <button
          onClick={() => onNavigate('login')}
          className="text-terracotta font-extrabold hover:underline cursor-pointer"
        >
          {t('loginHere', 'Login here')}
        </button>
      </div>
    </div>
  );
}
