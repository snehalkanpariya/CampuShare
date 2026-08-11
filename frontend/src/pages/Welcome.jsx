import React from 'react';
import { ArrowRight, GraduationCap, UserCheck, Sparkles, ShieldCheck } from 'lucide-react';

export default function Welcome({ onNavigate }) {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Hero Banner */}
      <div className="bg-white rounded-3xl p-10 shadow-lg border border-stone-200 text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-2 bg-sage-light text-sage px-4 py-1.5 rounded-full text-xs font-extrabold mb-6">
          <Sparkles size={16} /> Gujarat Vidyapith Student Marketplace
        </div>

        <h1 className="text-4xl font-extrabold font-serif text-terracotta mb-6 tracking-tight">
          Welcome to CampuShare | GVP
        </h1>

        <div className="flex justify-center gap-4 flex-wrap">
          <button
            onClick={() => onNavigate('role-select')}
            className="bg-terracotta hover:bg-terracotta-hover text-white px-8 py-3.5 rounded-full font-extrabold text-base flex items-center gap-3 shadow-lg shadow-terracotta/25 transition-all transform hover:-translate-y-0.5"
          >
            Create Student Account <ArrowRight size={20} />
          </button>

          <button
            onClick={() => onNavigate('login')}
            className="bg-white text-terracotta border-2 border-terracotta hover:bg-amber-50 px-8 py-3.5 rounded-full font-extrabold text-base transition-all"
          >
            Login to CampuShare
          </button>
        </div>
      </div>

      {/* Role Selection Large Icon Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Junior Student Option */}
        <div 
          onClick={() => onNavigate('junior-register')}
          className="bg-white rounded-3xl p-8 border-2 border-stone-200 shadow-md hover:border-blue-500 hover:shadow-xl cursor-pointer transition-all flex flex-col items-center justify-center text-center group"
        >
          <div className="w-24 h-24 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <GraduationCap size={56} />
          </div>
          <h3 className="text-2xl font-extrabold text-stone-800 mb-2">Junior Student</h3>
          <span className="text-xs font-bold text-sage bg-sage-light px-3 py-1 rounded-full">
            Email OTP Verification
          </span>
        </div>

        {/* Senior Student Option */}
        <div 
          onClick={() => onNavigate('senior-register')}
          className="bg-white rounded-3xl p-8 border-2 border-stone-200 shadow-md hover:border-terracotta hover:shadow-xl cursor-pointer transition-all flex flex-col items-center justify-center text-center group"
        >
          <div className="w-24 h-24 rounded-full bg-gold-light text-gold flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <UserCheck size={56} />
          </div>
          <h3 className="text-2xl font-extrabold text-stone-800 mb-2">Senior Student</h3>
          <span className="text-xs font-bold text-terracotta bg-terracotta-light px-3 py-1 rounded-full">
            Marksheet OCR AI
          </span>
        </div>
      </div>
    </div>
  );
}
