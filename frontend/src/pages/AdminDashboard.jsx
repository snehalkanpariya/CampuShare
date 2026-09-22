import React, { useState, useEffect } from 'react';
import {
  getAuthorizedStudentsApi,
  addAuthorizedStudentApi,
  revokeAuthorizedStudentApi
} from '../config/api';
import { ShieldCheck, UserPlus, Search, UserX, CheckCircle, Clock, AlertTriangle, RefreshCw, LogOut } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function AdminDashboard({ onNavigate, onLogout }) {
  const { t } = useLanguage();
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    enrollmentNumber: '',
    email: '',
    allowedRole: 'JUNIOR',
    status: 'APPROVED'
  });

  const fetchStudents = async (query = '') => {
    setLoading(true);
    setError('');
    try {
      const data = await getAuthorizedStudentsApi(query);
      setStudents(data);
    } catch (err) {
      setError(err.message || 'Failed to load authorized students list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStudents(searchQuery);
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await addAuthorizedStudentApi(formData);
      setSuccess(`Student ${formData.enrollmentNumber} successfully authorized!`);
      setFormData({
        enrollmentNumber: '',
        email: '',
        allowedRole: 'JUNIOR',
        status: 'APPROVED'
      });
      fetchStudents();
    } catch (err) {
      setError(err.message || 'Failed to authorize student');
    }
  };

  const handleRevoke = async (id, enrollment) => {
    if (!window.confirm(`Are you sure you want to REVOKE authorization for enrollment number ${enrollment}?`)) {
      return;
    }

    try {
      await revokeAuthorizedStudentApi(id);
      setSuccess(`Authorization for ${enrollment} has been REVOKED.`);
      fetchStudents();
    } catch (err) {
      setError(err.message || 'Failed to revoke authorization');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 w-fit"><CheckCircle size={12}/> APPROVED</span>;
      case 'USED':
        return <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 w-fit"><Clock size={12}/> REGISTERED</span>;
      case 'REVOKED':
        return <span className="bg-rose-100 text-rose-800 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 w-fit"><UserX size={12}/> REVOKED</span>;
      default:
        return <span className="bg-stone-100 text-stone-800 text-xs px-2 py-0.5 rounded">{status}</span>;
    }
  };

  const totalCount = students.length;
  const approvedCount = students.filter(s => s.status === 'APPROVED').length;
  const registeredCount = students.filter(s => s.status === 'USED').length;
  const revokedCount = students.filter(s => s.status === 'REVOKED').length;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-stone-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight font-serif">
                {t('adminDashboardTitle', 'Admin Authorization Portal')}
              </h1>
              <p className="text-xs text-stone-400 font-medium">
                {t('adminDashboardSubtitle', 'CampusShare Pre-Approved Student Registration Control')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchStudents()}
            className="bg-stone-800 hover:bg-stone-700 text-stone-300 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border border-stone-700 transition-all cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> {t('refreshList', 'Refresh List')}
          </button>

          <button
            onClick={onLogout}
            className="bg-red-600/90 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border border-red-500/50 shadow-md transition-all cursor-pointer"
          >
            <LogOut size={15} /> {t('logout', 'Logout')}
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-rose-50 text-rose-700 p-4 rounded-2xl text-sm font-semibold border border-rose-200 flex items-center gap-2">
          <AlertTriangle size={18} /> {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl text-sm font-semibold border border-emerald-200 flex items-center gap-2">
          <CheckCircle size={18} /> {success}
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-xs font-bold uppercase text-stone-400">{t('totalAuthorized', 'Total Authorized')}</span>
          <div className="text-2xl font-black text-stone-800">{totalCount}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-xs font-bold uppercase text-emerald-500">{t('approved', 'Approved')}</span>
          <div className="text-2xl font-black text-emerald-600">{approvedCount}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-xs font-bold uppercase text-blue-500">{t('registered', 'Registered (Used)')}</span>
          <div className="text-2xl font-black text-blue-600">{registeredCount}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-xs font-bold uppercase text-rose-500">{t('revoked', 'Revoked')}</span>
          <div className="text-2xl font-black text-rose-600">{revokedCount}</div>
        </div>
      </div>

      {/* Add Student Form */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
          <UserPlus size={20} className="text-amber-600" /> {t('addStudent', 'Authorize New Student Registration')}
        </h2>
        <form onSubmit={handleAddStudent} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-stone-600 mb-1">
              {t('enrollmentNumber', 'Enrollment Number')}
            </label>
            <input
              type="text"
              required
              placeholder={t('enrollmentPlaceholder', 'e.g. 250160450049')}
              value={formData.enrollmentNumber}
              onChange={(e) => {
                const enr = e.target.value;
                setFormData({
                  ...formData,
                  enrollmentNumber: enr,
                  email: enr ? `${enr.toLowerCase()}.gvp@gujaratvidyapith.org` : ''
                });
              }}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 outline-none text-sm font-medium focus:border-amber-500 font-mono uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-stone-600 mb-1">
              {t('identifierLabel', 'Institutional Email')}
            </label>
            <input
              type="email"
              required
              placeholder="250160450049.gvp@gujaratvidyapith.org"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 outline-none text-sm font-medium focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-stone-600 mb-1">
              {t('allowedRole', 'Allowed Role')}
            </label>
            <select
              value={formData.allowedRole}
              onChange={(e) => setFormData({ ...formData, allowedRole: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 outline-none text-sm font-medium focus:border-amber-500 bg-white"
            >
              <option value="JUNIOR">JUNIOR (OTP Verification)</option>
              <option value="SENIOR">SENIOR (OCR Verification)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserPlus size={16} /> {t('addStudent', 'Authorize Student')}
            </button>
          </div>
        </form>
      </div>

      {/* Student List & Search */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-lg font-bold text-stone-800">
            {t('adminDashboardTitle', 'Authorized Students List')}
          </h2>
          <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search size={16} className="absolute left-3 top-3 text-stone-400" />
              <input
                type="text"
                placeholder={t('searchStudents', 'Search enrollment or email...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-stone-300 text-xs outline-none focus:border-amber-500"
              />
            </div>
            <button type="submit" className="bg-stone-800 text-white text-xs px-3.5 py-1.5 rounded-xl font-bold cursor-pointer">
              {t('searchShort', 'Search')}
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-[11px] font-extrabold uppercase text-stone-400 bg-stone-50">
                <th className="p-3">{t('enrollmentNumber', 'Enrollment No')}</th>
                <th className="p-3">{t('identifierLabel', 'Email Address')}</th>
                <th className="p-3">{t('allowedRole', 'Role')}</th>
                <th className="p-3">{t('condition', 'Status')}</th>
                <th className="p-3">Authorized By</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs font-medium">
              {students.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-stone-400 font-semibold">
                    No pre-authorized student records found. Add students using the form above.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-stone-50/50 transition-all">
                    <td className="p-3 font-mono font-bold text-stone-900">{student.enrollmentNumber}</td>
                    <td className="p-3 text-stone-600">{student.email}</td>
                    <td className="p-3 font-bold text-stone-700">{student.allowedRole}</td>
                    <td className="p-3">{getStatusBadge(student.status)}</td>
                    <td className="p-3 text-stone-500">{student.authorizedBy || 'ADMIN'}</td>
                    <td className="p-3 text-right">
                      {student.status !== 'REVOKED' ? (
                        <button
                          onClick={() => handleRevoke(student.id, student.enrollmentNumber)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-1 rounded-lg font-bold text-xs border border-rose-200 flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <UserX size={13} /> {t('actionRevoke', 'Revoke')}
                        </button>
                      ) : (
                        <span className="text-stone-400 text-xs italic">{t('statusRevoked', 'Revoked')}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
