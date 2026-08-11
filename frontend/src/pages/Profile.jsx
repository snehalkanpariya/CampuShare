import React from 'react';
import { ShieldCheck, Mail, Hash, Award } from 'lucide-react';

export default function Profile({ currentUser }) {
  if (!currentUser) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold">Please login to view profile</h2>
      </div>
    );
  }

  const role = currentUser.role || 'GVP Student';
  const name = currentUser.name || 'Gujarat Vidyapith Student';
  const email = currentUser.email || 'student@gujaratvidyapith.org';
  const enrollment = currentUser.enrollmentNumber || 'N/A';
  const dept = currentUser.department || 'MCA';
  const isVerified = currentUser.verified !== false;

  return (
    <div className="p-8 max-w-xl mx-auto">
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-stone-200 space-y-6">
        {/* Profile Header */}
        <div className="flex items-center gap-5 border-b border-stone-100 pb-6">
          <div className="w-20 h-20 rounded-full bg-terracotta text-white flex items-center justify-center text-3xl font-extrabold shadow-lg shrink-0">
            {name.charAt(0).toUpperCase()}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-extrabold text-stone-800">{name}</h2>
              {isVerified && (
                <span className="bg-emerald-100 text-emerald-800 px-3 py-0.5 rounded-full text-xs font-extrabold flex items-center gap-1">
                  <ShieldCheck size={14} /> VERIFIED
                </span>
              )}
            </div>
            <div className="text-sm font-bold text-stone-500">
              {role} — {dept} Department
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3 font-bold text-sm">
          <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-200">
            <div className="flex items-center gap-2 text-stone-500">
              <Mail size={18} /> Official Email
            </div>
            <span className="text-stone-800">{email}</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-200">
            <div className="flex items-center gap-2 text-stone-500">
              <Hash size={18} /> Enrollment Number
            </div>
            <span className="text-stone-800">{enrollment}</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-200">
            <div className="flex items-center gap-2 text-stone-500">
              <Award size={18} /> Verification Status
            </div>
            <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-extrabold">
              VERIFIED ({role === 'JUNIOR' ? 'EMAIL OTP' : 'MARKSHEET OCR'})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
