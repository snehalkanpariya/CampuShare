import React, { useState } from 'react';
import { MapPin, ShieldCheck, KeyRound, CheckCircle2, AlertCircle, ArrowRight, Clock, Video } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function SafeExchange({ currentUser }) {
  const { t } = useLanguage();

  const [inputCode, setInputCode] = useState('');
  const [activeCode, setActiveCode] = useState('739201');
  const [verifyStatus, setVerifyStatus] = useState(null); // 'success' | 'error' | null

  const safeZones = [
    {
      id: 1,
      name: t('zone1Title', 'Central Library Foyer'),
      desc: t('zone1Desc', 'Main entrance lobby with security post, CCTV surveillance, and daylight lighting.'),
      badge: 'CCTV Monitored',
      timing: '8:00 AM - 7:00 PM',
      color: 'border-emerald-200 bg-emerald-50/50'
    },
    {
      id: 2,
      name: t('zone2Title', 'Mahadev Desai Bhavan Pavilion'),
      desc: t('zone2Desc', 'Open campus pavilion opposite the administrative offices.'),
      badge: 'Staff Presence',
      timing: '9:00 AM - 6:00 PM',
      color: 'border-blue-200 bg-blue-50/50'
    },
    {
      id: 3,
      name: t('zone3Title', 'Student Canteen Plaza'),
      desc: t('zone3Desc', 'Bustling central student area with ample seating and high peer activity.'),
      badge: 'High Footfall',
      timing: '8:30 AM - 8:00 PM',
      color: 'border-amber-200 bg-amber-50/50'
    },
    {
      id: 4,
      name: t('zone4Title', 'Main Campus Gate 1'),
      desc: t('zone4Desc', 'Near campus security checkpoint, ideal for day commuters.'),
      badge: 'Security Post',
      timing: '24/7 Guarded',
      color: 'border-stone-200 bg-stone-50'
    }
  ];

  const handleVerifyCode = (e) => {
    e.preventDefault();
    if (inputCode.trim() === activeCode) {
      setVerifyStatus('success');
    } else {
      setVerifyStatus('error');
    }
  };

  const handleGenerateNewCode = () => {
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setActiveCode(randomCode);
    setInputCode('');
    setVerifyStatus(null);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold font-serif text-stone-800">
              {t('safeExchangeTitle', 'Campus Safe Exchange Zones')}
            </h1>
            <p className="text-xs text-stone-500 font-medium">
              {t('safeExchangeSubtitle', 'Official Gujarat Vidyapith designated meeting zones for handovers')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-2 rounded-2xl text-xs font-bold">
          <Video size={16} /> Campus Security Protected
        </div>
      </div>

      {/* 4-Step Handshake Protocol Engine */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 shadow-lg space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400">
          {t('handshakeWorkflowTitle', 'State-Driven 4-Step Handshake Protocol')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-stone-800/80 p-4 rounded-2xl border border-stone-700">
            <div className="text-xs font-black text-amber-400 mb-1">STATE 1</div>
            <div className="font-extrabold text-sm">{t('step1', '1. Item Listed')}</div>
            <div className="text-[11px] text-stone-400 mt-1">Senior uploads verified academic gear to catalog.</div>
          </div>

          <div className="bg-stone-800/80 p-4 rounded-2xl border border-stone-700">
            <div className="text-xs font-black text-amber-400 mb-1">STATE 2</div>
            <div className="font-extrabold text-sm">{t('step2', '2. Reserved')}</div>
            <div className="text-[11px] text-stone-400 mt-1">Junior reserves item. System generates 6-digit handshake OTP.</div>
          </div>

          <div className="bg-stone-800/80 p-4 rounded-2xl border border-stone-700">
            <div className="text-xs font-black text-amber-400 mb-1">STATE 3</div>
            <div className="font-extrabold text-sm">{t('step3', '3. Safe Meeting')}</div>
            <div className="text-[11px] text-stone-400 mt-1">Students meet at GVP safe zone. Junior inspects gear.</div>
          </div>

          <div className="bg-emerald-950/80 p-4 rounded-2xl border border-emerald-700">
            <div className="text-xs font-black text-emerald-400 mb-1">STATE 4</div>
            <div className="font-extrabold text-sm text-emerald-300">{t('step4', '4. OTP Verified')}</div>
            <div className="text-[11px] text-stone-300 mt-1">Code verified in app. Handover finalized & logged.</div>
          </div>
        </div>
      </div>

      {/* Simulator & Safe Zones Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Designated Meeting Zones List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-extrabold font-serif text-stone-800 flex items-center gap-2">
            <MapPin size={20} className="text-terracotta" /> Designated Safe Pickup Zones
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {safeZones.map((zone) => (
              <div
                key={zone.id}
                className={`p-5 rounded-3xl border shadow-sm space-y-2 ${zone.color}`}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-extrabold text-stone-800 text-base">{zone.name}</h3>
                  <span className="bg-white px-2.5 py-0.5 rounded-full text-[10px] font-extrabold text-stone-700 border border-stone-200">
                    {zone.badge}
                  </span>
                </div>
                <p className="text-xs text-stone-600 font-medium">{zone.desc}</p>
                <div className="pt-2 text-[11px] font-bold text-stone-500 flex items-center gap-1">
                  <Clock size={13} /> Recommended Hours: {zone.timing}
                </div>
              </div>
            ))}
          </div>

          {/* Safety Tips Card */}
          <div className="bg-amber-50 p-5 rounded-3xl border border-amber-200 space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-900">
              {t('safetyTipsTitle', 'Campus Handover Safety Rules')}
            </h3>
            <ul className="text-xs text-stone-700 space-y-1 font-medium list-disc pl-4">
              <li>{t('safetyTip1', 'Always meet in designated safe zones during daylight hours.')}</li>
              <li>{t('safetyTip2', 'Inspect the academic item condition thoroughly before completing the exchange.')}</li>
              <li>{t('safetyTip3', 'Never share payments before meeting in person.')}</li>
            </ul>
          </div>
        </div>

        {/* 6-Digit OTP Pickup Code Interactive Simulator */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-md space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-terracotta mb-2">
              <KeyRound size={24} />
              <h3 className="font-extrabold text-stone-800 text-base">
                {t('simulatorTitle', '6-Digit Handshake Pickup Code')}
              </h3>
            </div>
            <p className="text-xs text-stone-500 font-medium mb-4">
              Simulate buyer pickup verification. Current active reservation code for demo:
            </p>

            {/* Generated Code Badge */}
            <div className="bg-stone-100 p-4 rounded-2xl text-center border border-stone-200 mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                Seller's Handover Code
              </span>
              <span className="text-3xl font-black font-mono text-terracotta tracking-widest block">
                {activeCode}
              </span>
              <button
                type="button"
                onClick={handleGenerateNewCode}
                className="text-[10px] font-bold text-stone-500 hover:text-stone-800 underline mt-2"
              >
                Generate New Code
              </button>
            </div>

            {/* Verification Form */}
            <form onSubmit={handleVerifyCode} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                  {t('enterPickupCode', 'Enter Seller 6-Digit Code')}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="e.g. 739201"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  className="w-full text-center tracking-widest text-lg font-mono font-bold p-2.5 rounded-xl border border-stone-300 focus:border-terracotta outline-none bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-terracotta hover:bg-terracotta-hover text-white py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                {t('verifyCodeBtn', 'Verify Handshake & Complete Transfer')}
              </button>
            </form>

            {/* Feedback Alerts */}
            {verifyStatus === 'success' && (
              <div className="mt-3 bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-200 text-xs font-bold flex items-center gap-2 animate-fade-in">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <span>Handshake Successful! Item status changed to COMPLETED.</span>
              </div>
            )}
            {verifyStatus === 'error' && (
              <div className="mt-3 bg-rose-50 text-rose-700 p-3 rounded-xl border border-rose-200 text-xs font-bold flex items-center gap-2 animate-fade-in">
                <AlertCircle size={18} className="text-rose-600 shrink-0" />
                <span>Invalid code. Match the 6-digit seller code above.</span>
              </div>
            )}
          </div>

          <div className="text-[11px] text-stone-400 font-medium text-center pt-2 border-t border-stone-100">
            Gujarat Vidyapith Peer-to-Peer Protocol
          </div>
        </div>
      </div>
    </div>
  );
}
