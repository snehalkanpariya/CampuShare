import React from 'react';
import { GraduationCap, UserCheck, ArrowRight, ArrowLeft } from 'lucide-react';

export default function RoleSelect({ onNavigate }) {
  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <button 
        onClick={() => onNavigate('welcome')}
        className="flex items-center gap-2 text-stone-500 font-bold text-sm hover:text-stone-800 transition-colors"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div className="text-center">
        <h2 className="text-3xl font-extrabold font-serif text-terracotta">
          Select Verification Role
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {/* Junior */}
        <div
          onClick={() => onNavigate('junior-register')}
          className="bg-white rounded-3xl p-8 border-2 border-stone-200 shadow-md hover:border-blue-500 hover:shadow-xl cursor-pointer transition-all flex flex-col items-center text-center group"
        >
          <div className="w-28 h-28 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <GraduationCap size={64} />
          </div>
          <h3 className="text-2xl font-bold mb-6">Junior Student</h3>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-bold text-sm w-full flex items-center justify-center gap-2 shadow-md">
            Register Junior <ArrowRight size={18} />
          </button>
        </div>

        {/* Senior */}
        <div
          onClick={() => onNavigate('senior-register')}
          className="bg-white rounded-3xl p-8 border-2 border-stone-200 shadow-md hover:border-terracotta hover:shadow-xl cursor-pointer transition-all flex flex-col items-center text-center group"
        >
          <div className="w-28 h-28 rounded-full bg-gold-light text-gold flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <UserCheck size={64} />
          </div>
          <h3 className="text-2xl font-bold mb-6">Senior Student</h3>
          <button className="bg-terracotta hover:bg-terracotta-hover text-white px-6 py-3 rounded-full font-bold text-sm w-full flex items-center justify-center gap-2 shadow-md">
            Register Senior <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
