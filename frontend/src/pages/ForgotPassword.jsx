import React, { useState } from 'react';
import { ArrowLeft, KeyRound, Mail, CheckCircle2, Lock, ShieldAlert, Key, GraduationCap, UserCheck, UploadCloud, Hash, User } from 'lucide-react';
import { forgotPasswordApi, resetPasswordApi, resetPasswordSeniorApi } from '../config/api';

export default function ForgotPassword({ onNavigate }) {
  const [role, setRole] = useState('JUNIOR'); // 'JUNIOR' or 'SENIOR'
  const [step, setStep] = useState(1);

  // Junior State
  const [email, setEmail] = useState('');
  const [targetEmail, setTargetEmail] = useState('');
  const [otp, setOtp] = useState('');

  // Senior State
  const [enrollmentNumber, setEnrollmentNumber] = useState('');
  const [name, setName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // Common Passwords
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setStep(1);
    setError('');
    setInfoMessage('');
  };

  const handleJuniorSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    const trimmedInput = email.trim();
    let finalEmail = trimmedInput;
    if (/^\d{12}$/.test(trimmedInput)) {
      finalEmail = `${trimmedInput.toLowerCase()}.gvp@gujaratvidyapith.org`;
    } else if (!/^\d{12}\.gvp@gujaratvidyapith\.org$/i.test(trimmedInput)) {
      setError('Please enter a valid 12-digit enrollment number (e.g. 250160450049) or GVP email (250160450049.gvp@gujaratvidyapith.org)');
      return;
    }

    setLoading(true);

    try {
      const res = await forgotPasswordApi({ email: finalEmail });
      setTargetEmail(res.email || finalEmail);
      setInfoMessage(res.message || `Password reset OTP sent to ${res.email || finalEmail}`);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please check your email or enrollment number.');
    } finally {
      setLoading(false);
    }
  };

  const handleJuniorResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await resetPasswordApi({
        email: targetEmail || email,
        otp: otp.trim(),
        newPassword
      });
      setInfoMessage(res.message || 'Password reset successfully!');
      setStep(3);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please check the OTP and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSeniorResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedEnrollment = enrollmentNumber.trim();
    if (!/^\d{12}$/.test(trimmedEnrollment)) {
      setError('Enrollment number must be exactly 12 digits (e.g. 250160450049)');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!selectedFile) {
      setError('Please upload your official Gujarat Vidyapith Marksheet PDF or image file for OCR verification.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('enrollmentNumber', trimmedEnrollment);
      formData.append('name', name.trim());
      formData.append('newPassword', newPassword);
      formData.append('file', selectedFile);

      const res = await resetPasswordSeniorApi(formData);
      setInfoMessage(res.message || 'Senior password reset successfully via Marksheet OCR Verification!');
      setStep(3);
    } catch (err) {
      setError(err.message || 'Failed to reset Senior password via Marksheet verification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in p-6 max-w-lg mx-auto">
      <button 
        onClick={() => onNavigate('login')}
        className="flex items-center gap-2 text-stone-500 font-bold text-sm hover:text-stone-800 mb-4 cursor-pointer"
      >
        <ArrowLeft size={18} /> Back to Login
      </button>

      <div className="bg-white rounded-3xl p-8 shadow-xl border border-stone-200">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
            <KeyRound size={32} />
          </div>
          <h2 className="text-2xl font-extrabold text-stone-800">
            {step === 3 ? 'Password Changed' : 'Reset Password'}
          </h2>
          <p className="text-xs text-stone-500 font-medium mt-1">
            {step === 3 
              ? 'Your password has been successfully updated.' 
              : role === 'JUNIOR' 
                ? 'Junior Students: Reset via GVP Email OTP.' 
                : 'Senior Students: Reset via Gujarat Vidyapith Marksheet OCR.'}
          </p>
        </div>

        {/* Role Toggle Selector (Only visible at step 1) */}
        {step === 1 && (
          <div className="flex bg-stone-100 p-1 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => handleRoleChange('JUNIOR')}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                role === 'JUNIOR' ? 'bg-blue-600 text-white shadow-md' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <GraduationCap size={16} /> Junior Student (Email OTP)
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('SENIOR')}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                role === 'SENIOR' ? 'bg-terracotta text-white shadow-md' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <UserCheck size={16} /> Senior Student (Marksheet OCR)
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 p-3.5 rounded-2xl text-xs font-bold border border-red-200 mb-4 flex items-center gap-2">
            <ShieldAlert size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {infoMessage && step === 2 && (
          <div className="bg-emerald-50 text-emerald-700 p-3.5 rounded-2xl text-xs font-bold border border-emerald-200 mb-4 flex items-center gap-2">
            <CheckCircle2 size={18} className="shrink-0" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* JUNIOR FLOW - STEP 1 */}
        {role === 'JUNIOR' && step === 1 && (
          <form onSubmit={handleJuniorSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                GVP Email or 12-Digit Enrollment No.
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-3 text-stone-400" />
                <input
                  type="text"
                  required
                  placeholder="250160450049 or 250160450049.gvp@gujaratvidyapith.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-blue-500 outline-none text-sm font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-full font-bold text-base shadow-lg shadow-blue-500/25 transition-all mt-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Sending OTP...' : 'Send Password Reset OTP'}
            </button>
          </form>
        )}

        {/* JUNIOR FLOW - STEP 2 */}
        {role === 'JUNIOR' && step === 2 && (
          <form onSubmit={handleJuniorResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                Enter 6-Digit OTP
              </label>
              <div className="relative">
                <Key size={18} className="absolute left-3.5 top-3 text-stone-400" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-blue-500 outline-none text-sm font-bold tracking-widest"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                New Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-3 text-stone-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-blue-500 outline-none text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-3 text-stone-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-blue-500 outline-none text-sm font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6 || !newPassword || !confirmPassword}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-full font-bold text-base shadow-lg shadow-blue-500/25 transition-all mt-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setError('');
                setInfoMessage('');
              }}
              className="w-full text-center text-xs text-stone-500 font-bold hover:underline cursor-pointer pt-2"
            >
              Resend OTP or Change Email
            </button>
          </form>
        )}

        {/* SENIOR FLOW - STEP 1 (OCR Reset) */}
        {role === 'SENIOR' && step === 1 && (
          <form onSubmit={handleSeniorResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                12-Digit Enrollment Number
              </label>
              <div className="relative">
                <Hash size={18} className="absolute left-3.5 top-3 text-stone-400" />
                <input
                  type="text"
                  required
                  maxLength={12}
                  placeholder="250160450049"
                  value={enrollmentNumber}
                  onChange={(e) => setEnrollmentNumber(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-terracotta outline-none text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                Full Name (As registered / on Marksheet)
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-3 text-stone-400" />
                <input
                  type="text"
                  required
                  placeholder="DHRUVI GIRISHBHAI MALAVIYA"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-terracotta outline-none text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                New Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-3 text-stone-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-terracotta outline-none text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-3 text-stone-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-terracotta outline-none text-sm font-medium"
                />
              </div>
            </div>

            {/* Marksheet Upload Box */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                Upload Gujarat Vidyapith Marksheet (PDF/Image)
              </label>
              <div className={`border-2 dashed rounded-2xl p-4 text-center cursor-pointer relative transition-all ${
                selectedFile ? 'bg-emerald-50 border-emerald-400' : 'bg-stone-50 border-stone-300 hover:border-terracotta'
              }`}>
                <input
                  type="file"
                  required
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <UploadCloud size={32} className={`mx-auto mb-1 ${selectedFile ? 'text-emerald-600' : 'text-stone-400'}`} />
                {selectedFile ? (
                  <div className="text-xs font-bold text-emerald-700">📄 {selectedFile.name}</div>
                ) : (
                  <div className="text-xs font-bold text-stone-600">
                    Click to select Gujarat Vidyapith Marksheet for OCR Verification
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !selectedFile}
              className="w-full bg-terracotta hover:bg-terracotta-hover text-white py-3.5 rounded-full font-bold text-base shadow-lg shadow-terracotta/25 transition-all mt-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Verifying Marksheet & Resetting...' : 'Verify Marksheet & Reset Password'}
            </button>
          </form>
        )}

        {/* STEP 3 - SUCCESS FOR ALL ROLES */}
        {step === 3 && (
          <div className="text-center space-y-4">
            <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2">
              <CheckCircle2 size={22} />
              <span>{infoMessage || 'Password reset successfully!'}</span>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="w-full bg-terracotta hover:bg-terracotta-hover text-white py-3 rounded-full font-bold text-base shadow-lg shadow-terracotta/25 cursor-pointer"
            >
              Return to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
