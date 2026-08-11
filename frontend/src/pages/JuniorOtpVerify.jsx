import React, { useState } from 'react';
import { verifyOtpApi } from '../config/api';
import { Mail } from 'lucide-react';

export default function JuniorOtpVerify({ verificationData, onNavigate, setResultData }) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const email = verificationData?.email || '24mca001.gvp@gujaratvidyapith.org';

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await verifyOtpApi({ email, otp: otp.trim() });
      setResultData({
        success: true,
        message: result.message || 'Email OTP verified successfully!',
        verificationMethod: 'EMAIL',
        verifiedAt: new Date().toLocaleString(),
        email
      });
      onNavigate('verification-result');
    } catch (err) {
      setError(err.message || 'OTP verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-stone-200 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
          <Mail size={44} />
        </div>

        <h2 className="text-2xl font-extrabold text-stone-800">Verify Email OTP</h2>
        <div className="text-sm font-bold text-stone-700 bg-stone-100 p-2.5 rounded-xl">
          {email}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            required
            maxLength={6}
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full py-3 px-4 rounded-2xl border-2 border-stone-300 focus:border-blue-500 text-center font-extrabold text-2xl tracking-[10px] outline-none shadow-inner"
          />

          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-full font-bold text-base shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
          >
            {loading ? 'Verifying OTP...' : 'Verify OTP'}
          </button>
        </form>
      </div>
    </div>
  );
}
