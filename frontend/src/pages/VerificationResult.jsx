import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function VerificationResult({ resultData, onNavigate }) {
  const { t } = useLanguage();
  const isSuccess = resultData?.success !== false;
  const method = resultData?.verificationMethod || 'EMAIL / MARKSHEET_OCR';
  const timestamp = resultData?.verifiedAt || new Date().toLocaleString();

  return (
    <div className="p-8 max-w-md mx-auto">
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-stone-200 text-center space-y-6">
        <div className={`w-20 h-20 rounded-full ${isSuccess ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'} flex items-center justify-center mx-auto`}>
          {isSuccess ? <CheckCircle2 size={48} /> : <span>❌</span>}
        </div>

        <h2 className={`text-3xl font-extrabold ${isSuccess ? 'text-emerald-700' : 'text-red-600'}`}>
          {isSuccess ? t('congratulations', 'Verification Successful!') : 'Verification Failed'}
        </h2>
        <p className="text-xs text-stone-500 font-medium">
          {isSuccess ? t('accountActivated', 'Your Gujarat Vidyapith student account has been verified and activated.') : resultData?.message}
        </p>

        {/* Status Card */}
        <div className="bg-stone-50 rounded-2xl p-5 text-left border border-stone-200 space-y-3 font-semibold text-sm">
          <div className="flex justify-between items-center">
            <span className="text-stone-500">Status:</span>
            <span className="bg-emerald-100 text-emerald-800 px-3 py-0.5 rounded-full text-xs font-extrabold">
              {t('verifiedBadge', 'VERIFIED')}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-stone-500">Method:</span>
            <span className="font-extrabold text-stone-800">{method}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-stone-500">Verified At:</span>
            <span className="text-xs text-stone-600">{timestamp}</span>
          </div>
        </div>

        <button
          onClick={() => onNavigate('login')}
          className="w-full bg-terracotta hover:bg-terracotta-hover text-white py-3.5 rounded-full font-bold text-base shadow-lg shadow-terracotta/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {t('login', 'Proceed to Login')} <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
