import React, { useState } from 'react';
import { verifyMarksheetApi } from '../config/api';
import { UploadCloud, ShieldCheck, AlertCircle } from 'lucide-react';

export default function SeniorMarksheetUpload({ verificationData, onNavigate, setResultData }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const name = verificationData?.name || 'DHRUVI GIRISHBHAI MALAVIYA';
  const enrollmentNumber = verificationData?.enrollmentNumber || '250160450013';

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select your Gujarat Vidyapith Marksheet PDF or Image file.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('name', name);
      formData.append('enrollmentNumber', enrollmentNumber);

      const result = await verifyMarksheetApi(formData);

      if (result.success) {
        setResultData({
          success: true,
          message: result.message,
          verificationMethod: result.verificationMethod || 'MARKSHEET_OCR',
          enrollmentNumber: result.enrollmentNumber || enrollmentNumber,
          verifiedAt: new Date().toLocaleString(),
          name
        });
        onNavigate('verification-result');
      } else {
        setError(result.message || 'OCR Verification failed. Please ensure the uploaded document is your official Gujarat Vidyapith Marksheet.');
      }
    } catch (err) {
      setError(err.message || 'Failed to upload and verify marksheet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-lg mx-auto">
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-stone-200 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-gold-light text-gold flex items-center justify-center mx-auto">
          <ShieldCheck size={44} />
        </div>

        <h2 className="text-2xl font-extrabold text-stone-800">Marksheet OCR Verification</h2>

        {/* Profile Card Summary */}
        <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 text-sm flex justify-between font-bold">
          <span>{name}</span>
          <span className="text-terracotta">{enrollmentNumber}</span>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3.5 rounded-xl text-xs font-bold text-left flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0" />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4">
          <div className={`border-2 dashed rounded-2xl p-8 text-center cursor-pointer relative transition-all ${
            selectedFile ? 'bg-emerald-50 border-emerald-400' : 'bg-stone-50 border-stone-300 hover:border-terracotta'
          }`}>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <UploadCloud size={48} className={`mx-auto mb-3 ${selectedFile ? 'text-emerald-600' : 'text-stone-400'}`} />

            {selectedFile ? (
              <div>
                <div className="text-sm font-bold text-emerald-700">📄 {selectedFile.name}</div>
                <div className="text-xs text-stone-500 mt-1">{(selectedFile.size / 1024).toFixed(1)} KB</div>
              </div>
            ) : (
              <div className="text-sm font-bold text-stone-700">
                Click or drag marksheet here to upload
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !selectedFile}
            className="w-full bg-terracotta hover:bg-terracotta-hover text-white py-3.5 rounded-full font-bold text-base shadow-lg shadow-terracotta/25 transition-all disabled:opacity-50"
          >
            {loading ? 'Scanning & Verifying...' : 'Run Marksheet OCR Verification'}
          </button>
        </form>
      </div>
    </div>
  );
}
