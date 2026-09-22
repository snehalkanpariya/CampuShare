import React, { useState } from 'react';
import { registerSeniorApi } from '../config/api';
import { UserCheck, ArrowLeft, Lock, User, Hash, BookOpen } from 'lucide-react';
import {
  getFacultyNames,
  getDepartmentsByFaculty,
  getCoursesByDepartment,
  getAvailableSemesters
} from '../config/academicData';
import { useLanguage } from '../context/LanguageContext';

export default function SeniorRegister({ onNavigate, setVerificationData }) {
  const { t } = useLanguage();
  const facultyList = getFacultyNames();
  const [faculty, setFaculty] = useState(facultyList[5] || facultyList[0]); // Default ICT
  const departmentList = getDepartmentsByFaculty(faculty);
  const [department, setDepartment] = useState(departmentList[0] || 'Computer Science');
  const courseList = getCoursesByDepartment(department);
  const [course, setCourse] = useState(courseList[0]?.code || 'MCA');
  const semesterList = getAvailableSemesters(course, true);

  const [formData, setFormData] = useState({
    name: '',
    enrollmentNumber: '',
    password: '',
    semester: semesterList[0] || 1
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFacultyChange = (newFaculty) => {
    setFaculty(newFaculty);
    const depts = getDepartmentsByFaculty(newFaculty);
    const newDept = depts[0] || '';
    setDepartment(newDept);
    const crs = getCoursesByDepartment(newDept);
    const newCourse = crs[0]?.code || 'MCA';
    setCourse(newCourse);
    const availableSems = getAvailableSemesters(newCourse, true);
    setFormData((prev) => ({ ...prev, semester: availableSems[0] || 1 }));
  };

  const handleDepartmentChange = (newDept) => {
    setDepartment(newDept);
    const crs = getCoursesByDepartment(newDept);
    const newCourse = crs[0]?.code || 'MCA';
    setCourse(newCourse);
    const availableSems = getAvailableSemesters(newCourse, true);
    setFormData((prev) => ({ ...prev, semester: availableSems[0] || 1 }));
  };

  const handleCourseChange = (newCourse) => {
    setCourse(newCourse);
    const availableSems = getAvailableSemesters(newCourse, true);
    setFormData((prev) => ({ ...prev, semester: availableSems[0] || 1 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        enrollmentNumber: formData.enrollmentNumber,
        faculty,
        department,
        course,
        semester: parseInt(formData.semester, 10),
        password: formData.password
      };

      const result = await registerSeniorApi(payload);
      setVerificationData({
        enrollmentNumber: formData.enrollmentNumber,
        name: formData.name,
        email: result.email,
        role: 'SENIOR'
      });
      onNavigate('senior-upload');
    } catch (err) {
      setError(err.message || 'Senior registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto space-y-4">
      <button 
        onClick={() => onNavigate('role-select')}
        className="flex items-center gap-2 text-stone-500 font-bold text-sm hover:text-stone-800 cursor-pointer"
      >
        <ArrowLeft size={18} /> {t('back', 'Back')}
      </button>

      <div className="bg-white rounded-3xl p-8 shadow-xl border border-stone-200">
        <div className="flex items-center gap-4 mb-6 border-b border-stone-100 pb-4">
          <div className="w-16 h-16 rounded-2xl bg-gold-light text-gold flex items-center justify-center shrink-0">
            <UserCheck size={36} />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-stone-800">
              {t('seniorRegisterTitle', 'Senior Registration')}
            </h2>
            <p className="text-xs text-stone-500 font-medium">
              {t('seniorRegisterSubtitle', 'Gujarat Vidyapith Graduating Senior Account')}
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3.5 rounded-xl text-sm font-semibold mb-4 animate-fade-in">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
              {t('fullName', 'Full Name')}
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3.5 top-3 text-stone-400" />
              <input
                type="text"
                required
                placeholder={t('namePlaceholder', 'Enter your official name')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-terracotta outline-none text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
              {t('enrollmentNumber', 'Enrollment Number')}
            </label>
            <div className="relative">
              <Hash size={18} className="absolute left-3.5 top-3 text-stone-400" />
              <input
                type="text"
                required
                placeholder={t('enrollmentPlaceholder', 'e.g. 24MCA001 or 250160450013')}
                value={formData.enrollmentNumber}
                onChange={(e) => setFormData({ ...formData, enrollmentNumber: e.target.value.trim() })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-terracotta outline-none text-sm font-medium font-mono uppercase"
              />
            </div>
          </div>

          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
            <div className="text-xs font-extrabold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen size={14} className="text-terracotta" /> {t('academicDetails', 'Academic Credentials')}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-500 mb-1">{t('faculty', 'Faculty')}</label>
              <select
                value={faculty}
                onChange={(e) => handleFacultyChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 outline-none text-sm font-medium bg-white"
              >
                {facultyList.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-500 mb-1">{t('department', 'Department')}</label>
              <select
                value={department}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 outline-none text-sm font-medium bg-white"
              >
                {departmentList.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-500 mb-1">{t('course', 'Course')}</label>
                <select
                  value={course}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 outline-none text-sm font-medium bg-white"
                >
                  {courseList.map((c) => (
                    <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-500 mb-1">{t('semester', 'Semester')}</label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 outline-none text-sm font-medium bg-white"
                >
                  {semesterList.map((sem) => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
              {t('password', 'Password')}
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-3 text-stone-400" />
              <input
                type="password"
                required
                placeholder={t('passwordPlaceholder', 'Minimum 6 characters')}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-terracotta outline-none text-sm font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-terracotta hover:bg-terracotta-hover text-white py-3.5 rounded-xl font-extrabold text-sm shadow-lg shadow-terracotta/25 transition-all mt-6 disabled:opacity-50 cursor-pointer"
          >
            {loading ? t('processing', 'Processing...') : t('continueToMarksheet', 'Continue to Marksheet OCR Upload')}
          </button>
        </form>
      </div>
    </div>
  );
}
