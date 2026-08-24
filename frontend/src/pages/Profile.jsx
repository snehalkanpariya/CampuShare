import React, { useState } from 'react';
import { ShieldCheck, Mail, Hash, Award, Lock, KeyRound, CheckCircle2, ShieldAlert, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import { changePasswordApi } from '../config/api';

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

  // Change Password State
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!oldPassword) {
      setError('Please enter your current password.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    if (oldPassword === newPassword) {
      setError('New password must be different from your current password.');
      return;
    }

    setLoading(true);

    try {
      const targetIdentifier = currentUser.email || currentUser.enrollmentNumber || currentUser.id || '';
      const res = await changePasswordApi({
        email: targetIdentifier,
        oldPassword: oldPassword,
        newPassword: newPassword
      });

      setSuccessMsg(res.message || 'Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Failed to change password. Please verify your current password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto space-y-6">
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

        {/* Change Password Card / Accordion */}
        <div className="border-t border-stone-100 pt-6">
          <button
            type="button"
            onClick={() => {
              setShowPasswordForm(!showPasswordForm);
              setError('');
              setSuccessMsg('');
            }}
            className="w-full flex items-center justify-between p-4 bg-stone-50 hover:bg-stone-100 rounded-2xl border border-stone-200 transition-all cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <KeyRound size={20} />
              </div>
              <div>
                <h3 className="font-extrabold text-stone-800 text-base">Change Password</h3>
                <p className="text-xs text-stone-500 font-medium">Update your profile account password</p>
              </div>
            </div>
            <div className="text-stone-400">
              {showPasswordForm ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </button>

          {showPasswordForm && (
            <div className="mt-4 p-5 bg-stone-50 rounded-2xl border border-stone-200 animate-fade-in space-y-4">
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs font-bold border border-red-200 flex items-center gap-2">
                  <ShieldAlert size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl text-xs font-bold border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-3 text-stone-400" />
                    <input
                      type={showOldPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter current password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-300 focus:border-terracotta outline-none text-sm font-medium bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-3 text-stone-400 hover:text-stone-600 cursor-pointer"
                    >
                      {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-3 text-stone-400" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="Minimum 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-300 focus:border-terracotta outline-none text-sm font-medium bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-3 text-stone-400 hover:text-stone-600 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-3 text-stone-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-300 focus:border-terracotta outline-none text-sm font-medium bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-stone-400 hover:text-stone-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading || !oldPassword || !newPassword || !confirmPassword}
                    className="flex-1 bg-terracotta hover:bg-terracotta-hover text-white py-2.5 rounded-xl font-bold text-sm shadow-md transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? 'Updating Password...' : 'Update Password'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setOldPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setError('');
                      setSuccessMsg('');
                    }}
                    className="py-2.5 px-4 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl font-bold text-sm transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
