import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Mail,
  Hash,
  Lock,
  KeyRound,
  CheckCircle2,
  ShieldAlert,
  Eye,
  EyeOff,
  Edit3,
  User,
  BookOpen,
  GraduationCap,
  Building2,
  Layers,
  FileText,
  UploadCloud,
  ChevronDown,
  ChevronUp,
  LogOut
} from 'lucide-react';
import {
  changePasswordApi,
  updateProfileApi,
  getUserProfileApi,
  verifyMarksheetApi
} from '../config/api';
import {
  getFacultyNames,
  getDepartmentsByFaculty,
  getFacultyByDepartment,
  getCoursesByDepartment,
  getAvailableSemesters
} from '../config/academicData';
import { useLanguage } from '../context/LanguageContext';

export default function Profile({ currentUser, onLogout, onNavigate }) {
  const { t } = useLanguage();

  if (!currentUser) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-stone-800">Please login to view profile</h2>
      </div>
    );
  }

  const isAdmin = currentUser.role === 'ADMIN' || (currentUser.roles && currentUser.roles.includes('ADMIN'));

  // Initial academic defaults
  const initialDepartment = currentUser.department || (isAdmin ? 'Campus Administration' : 'Computer Science');
  const initialFaculty = currentUser.faculty || (isAdmin ? 'Executive Administration' : getFacultyByDepartment(initialDepartment));
  const initialCourse = currentUser.course || (isAdmin ? 'N/A' : 'MCA');

  const [userProfile, setUserProfile] = useState({
    id: currentUser.id || '',
    name: currentUser.name || (isAdmin ? 'System Administrator' : 'Gujarat Vidyapith Student'),
    email: currentUser.email || (isAdmin ? 'admin@gujaratvidyapith.org' : 'student@gujaratvidyapith.org'),
    enrollmentNumber: currentUser.enrollmentNumber || (isAdmin ? 'ADMIN001' : 'N/A'),
    faculty: initialFaculty,
    department: initialDepartment,
    course: initialCourse,
    semester: currentUser.semester || (isAdmin ? null : 1),
    role: isAdmin ? 'ADMIN' : (currentUser.role || 'STUDENT'),
    verificationStatus: 'VERIFIED',
    verified: true
  });

  // Edit Profile State
  const facultyList = getFacultyNames();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(userProfile.name);
  const [editFaculty, setEditFaculty] = useState(userProfile.faculty);
  const [editDepartment, setEditDepartment] = useState(userProfile.department);
  const [editCourse, setEditCourse] = useState(userProfile.course);
  const [editSemester, setEditSemester] = useState(userProfile.semester || 1);

  // Senior Department Change Marksheet State
  const [marksheetFile, setMarksheetFile] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccessMsg, setEditSuccessMsg] = useState('');

  // Password State
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');

  // Cascading lists for students
  const editDepartmentList = getDepartmentsByFaculty(editFaculty);
  const editCourseList = getCoursesByDepartment(editDepartment);
  const isSeniorUser = !isAdmin && String(userProfile.role).toUpperCase().includes('SENIOR');
  const isDeptChanged = isSeniorUser && editDepartment !== userProfile.department;
  const editSemesterList = getAvailableSemesters(editCourse, isSeniorUser);

  const handleEditFacultyChange = (newFaculty) => {
    setEditFaculty(newFaculty);
    const depts = getDepartmentsByFaculty(newFaculty);
    const newDept = depts[0] || 'Computer Science';
    setEditDepartment(newDept);
    const crs = getCoursesByDepartment(newDept);
    const newCourse = crs[0]?.code || 'MCA';
    setEditCourse(newCourse);
    const sems = getAvailableSemesters(newCourse, isSeniorUser);
    setEditSemester(sems[0] || 1);
  };

  const handleEditDepartmentChange = (newDept) => {
    setEditDepartment(newDept);
    const crs = getCoursesByDepartment(newDept);
    const newCourse = crs[0]?.code || 'MCA';
    setEditCourse(newCourse);
    const sems = getAvailableSemesters(newCourse, isSeniorUser);
    setEditSemester(sems[0] || 1);
  };

  const handleEditCourseChange = (newCourse) => {
    setEditCourse(newCourse);
    const sems = getAvailableSemesters(newCourse, isSeniorUser);
    setEditSemester(sems[0] || 1);
  };

  // Fetch updated profile data silently on mount
  useEffect(() => {
    async function fetchProfileData() {
      const token = localStorage.getItem('campus_token');
      if (!token) return;

      try {
        const data = await getUserProfileApi(token);
        if (data) {
          const dept = data.department || userProfile.department;
          const fac = data.faculty || userProfile.faculty;
          const crs = data.course || userProfile.course;

          setUserProfile((prev) => ({
            ...prev,
            id: data.id || prev.id,
            name: data.name || prev.name,
            email: data.email || prev.email,
            enrollmentNumber: data.enrollmentNumber || prev.enrollmentNumber,
            faculty: fac,
            department: dept,
            course: crs,
            semester: data.semester !== undefined ? data.semester : prev.semester,
            role: data.role || prev.role,
            verificationStatus: data.verificationStatus || prev.verificationStatus
          }));

          setEditName(data.name || editName);
          setEditFaculty(fac);
          setEditDepartment(dept);
          setEditCourse(crs);
          if (data.semester !== undefined) {
            setEditSemester(data.semester);
          }
        }
      } catch (e) {
        // Silently continue
      }
    }
    fetchProfileData();
  }, []);

  const handleStartEdit = () => {
    setEditName(userProfile.name);
    setEditFaculty(userProfile.faculty);
    setEditDepartment(userProfile.department);
    setEditCourse(userProfile.course);
    setEditSemester(userProfile.semester || 1);
    setEditError('');
    setEditSuccessMsg('');
    setMarksheetFile(null);
    setIsEditing(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditSuccessMsg('');

    if (!editName || !editName.trim()) {
      setEditError('Name cannot be empty.');
      return;
    }

    if (!isAdmin) {
      if (!editDepartment || !editDepartment.trim()) {
        setEditError('Department cannot be empty.');
        return;
      }
      const semNum = parseInt(editSemester, 10);
      if (isNaN(semNum) || semNum < 1 || semNum > 10) {
        setEditError('Semester must be a valid number between 1 and 10.');
        return;
      }

      if (isDeptChanged && !marksheetFile) {
        setEditError('Senior students changing Department must upload a Marksheet document for verification.');
        return;
      }
    }

    setEditLoading(true);

    try {
      if (isDeptChanged && marksheetFile) {
        const verifyFormData = new FormData();
        verifyFormData.append('file', marksheetFile);
        verifyFormData.append('name', editName.trim());
        verifyFormData.append('enrollmentNumber', userProfile.enrollmentNumber);

        const verifyRes = await verifyMarksheetApi(verifyFormData);
        if (!verifyRes.success) {
          throw new Error(verifyRes.message || 'Marksheet verification failed for department change.');
        }
      }

      const payload = {
        name: editName.trim(),
        faculty: isAdmin ? 'Executive Administration' : editFaculty,
        department: editDepartment.trim(),
        course: isAdmin ? null : editCourse,
        semester: isAdmin ? null : parseInt(editSemester, 10)
      };

      const updatedData = await updateProfileApi(payload);

      const updatedProfile = {
        ...userProfile,
        name: updatedData.name || editName.trim(),
        faculty: updatedData.faculty || payload.faculty,
        department: updatedData.department || payload.department,
        course: updatedData.course || payload.course,
        semester: updatedData.semester !== undefined ? updatedData.semester : payload.semester
      };
      setUserProfile(updatedProfile);

      try {
        const savedUserStr = localStorage.getItem('campus_user');
        if (savedUserStr) {
          const savedUserObj = JSON.parse(savedUserStr);
          localStorage.setItem(
            'campus_user',
            JSON.stringify({
              ...savedUserObj,
              name: updatedProfile.name,
              department: updatedProfile.department
            })
          );
        }
      } catch (e) {
        // Ignored
      }

      setEditSuccessMsg(t('profileUpdated', 'Profile updated successfully!'));
      setIsEditing(false);
      setMarksheetFile(null);
    } catch (err) {
      setEditError(err.message || 'Failed to update profile data.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccessMsg('');

    if (!oldPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      const targetIdentifier = userProfile.email || userProfile.enrollmentNumber || currentUser.id || '';
      const res = await changePasswordApi({
        email: targetIdentifier,
        oldPassword,
        newPassword
      });

      setPasswordSuccessMsg(res.message || 'Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password. Please verify current password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-stone-200 space-y-6">
        
        {/* Global Notifications */}
        {editSuccessMsg && (
          <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl text-xs font-bold border border-emerald-200 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 size={18} className="shrink-0" />
            <span>{editSuccessMsg}</span>
          </div>
        )}

        {/* PROFILE HEADER */}
        <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-stone-100 pb-6">
          <div className={`w-20 h-20 rounded-full text-white flex items-center justify-center text-3xl font-extrabold shadow-lg shrink-0 ${
            isAdmin ? 'bg-stone-900 text-amber-400' : 'bg-terracotta'
          }`}>
            {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap mb-1">
              <h2 className="text-2xl font-extrabold text-stone-800">{userProfile.name}</h2>
              {isAdmin ? (
                <span className="bg-amber-100 text-amber-900 px-3 py-0.5 rounded-full text-xs font-extrabold flex items-center gap-1 border border-amber-300">
                  <ShieldCheck size={14} className="text-amber-700" /> {t('adminBadge', 'AUTHORIZED CAMPUS ADMINISTRATOR')}
                </span>
              ) : (
                <span className="bg-emerald-100 text-emerald-800 px-3 py-0.5 rounded-full text-xs font-extrabold flex items-center gap-1">
                  <ShieldCheck size={14} /> {t('verifiedBadge', 'VERIFIED')}
                </span>
              )}
            </div>

            <div className="text-sm font-bold text-stone-600">
              {isAdmin ? t('adminDesignation', 'Campus Administration / Faculty Authority') : `${userProfile.role} — ${userProfile.course || userProfile.department}`}
            </div>
            
            {!isAdmin && (
              <div className="text-xs font-medium text-stone-400">
                {userProfile.department} Department (Semester {userProfile.semester || 1})
              </div>
            )}
          </div>

          {!isEditing && (
            <div className="flex items-center gap-2 shrink-0 self-center sm:self-start flex-wrap">
              {isAdmin && onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('admin-dashboard')}
                  className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-sm"
                >
                  <ShieldAlert size={14} /> Admin Portal
                </button>
              )}
              <button
                type="button"
                onClick={handleStartEdit}
                className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-800 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-sm"
              >
                <Edit3 size={15} /> {t('editProfile', 'Edit Profile')}
              </button>
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 px-3.5 py-2 rounded-xl text-xs font-extrabold border border-rose-200 transition-all cursor-pointer shadow-sm"
                >
                  <LogOut size={14} /> {t('logout', 'Logout')}
                </button>
              )}
            </div>
          )}
        </div>

        {/* ADMIN AUTHORITY NOTICE (NO MARKSHEET REQUIRED) */}
        {isAdmin && (
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900 font-medium">
            <ShieldCheck size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold block text-amber-950 mb-0.5">Pre-Authorized Administrative Authority</span>
              {t('authorityVerifiedNotice', 'Official Authority: Authorized to manage students, inspect listings, and enforce campus policies. Marksheet verification not required.')}
            </div>
          </div>
        )}

        {/* EDIT PROFILE FORM */}
        {isEditing ? (
          <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-extrabold text-stone-800 text-base flex items-center gap-2">
                <Edit3 size={18} className="text-terracotta" /> {t('editProfile', 'Edit Profile')}
              </h3>
            </div>

            {editError && (
              <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs font-bold border border-red-200 flex items-center gap-2">
                <ShieldAlert size={16} className="shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  {t('fullName', 'Full Name')}
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-3 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-terracotta outline-none text-sm font-medium bg-white"
                  />
                </div>
              </div>

              {/* Administrative vs Student Department */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  {isAdmin ? 'Administrative Department / Authority' : t('department', 'Department')}
                </label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3.5 top-3 text-stone-400" />
                  {isAdmin ? (
                    <input
                      type="text"
                      required
                      value={editDepartment}
                      onChange={(e) => setEditDepartment(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-terracotta outline-none text-sm font-medium bg-white"
                    />
                  ) : (
                    <select
                      value={editDepartment}
                      onChange={(e) => handleEditDepartmentChange(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-terracotta outline-none text-sm font-medium bg-white"
                    >
                      {editDepartmentList.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Student Only: Faculty, Course, Semester & Marksheet Re-verification */}
              {!isAdmin && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                      {t('faculty', 'Faculty')}
                    </label>
                    <select
                      value={editFaculty}
                      onChange={(e) => handleEditFacultyChange(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-terracotta outline-none text-sm font-medium bg-white"
                    >
                      {facultyList.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                        {t('course', 'Course')}
                      </label>
                      <select
                        value={editCourse}
                        onChange={(e) => handleEditCourseChange(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-terracotta outline-none text-sm font-medium bg-white"
                      >
                        {editCourseList.map((c) => (
                          <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                        {t('semester', 'Semester')}
                      </label>
                      <select
                        value={editSemester}
                        onChange={(e) => setEditSemester(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-terracotta outline-none text-sm font-medium bg-white"
                      >
                        {editSemesterList.map((sem) => (
                          <option key={sem} value={sem}>Semester {sem}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Marksheet OCR Upload prompt ONLY IF Senior student changes department */}
                  {isDeptChanged && (
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-extrabold text-amber-900">
                        <FileText size={16} /> Marksheet Re-Verification Required for Department Switch
                      </div>
                      <p className="text-[11px] text-stone-600">
                        Please attach your official marksheet for the new department.
                      </p>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.png"
                        onChange={(e) => setMarksheetFile(e.target.files?.[0] || null)}
                        className="text-xs text-stone-600 file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-800"
                      />
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  disabled={editLoading || !editName.trim()}
                  className="flex-1 bg-terracotta hover:bg-terracotta-hover text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  {editLoading ? 'Saving Changes...' : t('saveChanges', 'Save Profile Changes')}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="py-3 px-5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl font-bold text-sm transition-all cursor-pointer"
                >
                  {t('cancel', 'Cancel')}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* READ-ONLY PROFILE DISPLAY */
          <div className="space-y-3 font-bold text-sm">
            <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <div className="flex items-center gap-2 text-stone-500">
                <User size={18} /> {t('fullName', 'Name')}
              </div>
              <span className="text-stone-800 font-extrabold">{userProfile.name}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <div className="flex items-center gap-2 text-stone-500">
                <Mail size={18} /> Official Email
              </div>
              <span className="text-stone-800 font-extrabold">{userProfile.email}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <div className="flex items-center gap-2 text-stone-500">
                <Hash size={18} /> {isAdmin ? 'Authority ID' : t('enrollmentNumber', 'Enrollment Number')}
              </div>
              <span className="text-stone-800 font-extrabold">{userProfile.enrollmentNumber}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <div className="flex items-center gap-2 text-stone-500">
                <Building2 size={18} /> {isAdmin ? 'Administrative Department' : t('department', 'Department')}
              </div>
              <span className="text-stone-800 font-extrabold">{userProfile.department}</span>
            </div>

            {/* ONLY DISPLAYED FOR STUDENTS (NOT FOR ADMIN) */}
            {!isAdmin && (
              <>
                <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-200">
                  <div className="flex items-center gap-2 text-stone-500">
                    <Building2 size={18} /> {t('faculty', 'Faculty')}
                  </div>
                  <span className="text-stone-800 font-extrabold">{userProfile.faculty}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                    <div className="flex items-center gap-2 text-stone-500 mb-1 text-xs font-bold uppercase">
                      <Layers size={16} /> {t('course', 'Course')}
                    </div>
                    <span className="text-stone-800 font-extrabold text-base">{userProfile.course || 'MCA'}</span>
                  </div>

                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                    <div className="flex items-center gap-2 text-stone-500 mb-1 text-xs font-bold uppercase">
                      <GraduationCap size={16} /> {t('semester', 'Semester')}
                    </div>
                    <span className="text-stone-800 font-extrabold text-base">Semester {userProfile.semester || 1}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* CHANGE PASSWORD COLLAPSIBLE FORM */}
        <div className="border-t border-stone-200 pt-4">
          <button
            type="button"
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="w-full flex items-center justify-between p-4 bg-stone-50 hover:bg-stone-100 rounded-2xl border border-stone-200 text-stone-800 font-extrabold text-xs transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <KeyRound size={16} className="text-terracotta" />
              <span>{t('changePassword', 'Change Password')}</span>
            </div>
            {showPasswordForm ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showPasswordForm && (
            <form onSubmit={handleChangePassword} className="mt-4 p-6 bg-stone-50 rounded-2xl border border-stone-200 space-y-4 animate-fade-in text-xs font-bold">
              {passwordError && (
                <div className="bg-red-50 text-red-700 p-3 rounded-xl border border-red-200 flex items-center gap-2">
                  <ShieldAlert size={16} />
                  <span>{passwordError}</span>
                </div>
              )}
              {passwordSuccessMsg && (
                <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>{passwordSuccessMsg}</span>
                </div>
              )}

              <div>
                <label className="block uppercase tracking-wider text-stone-600 mb-1">{t('oldPassword', 'Old Password')}</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-3 text-stone-400" />
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-300 bg-white"
                  />
                  <button type="button" onClick={() => setShowOldPassword(!showOldPassword)} className="absolute right-3.5 top-3 text-stone-400">
                    {showOldPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-wider text-stone-600 mb-1">{t('newPassword', 'New Password')}</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-3 text-stone-400" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-300 bg-white"
                  />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3.5 top-3 text-stone-400">
                    {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-wider text-stone-600 mb-1">{t('confirmNewPassword', 'Confirm New Password')}</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-3 text-stone-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-300 bg-white"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3.5 top-3 text-stone-400">
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full bg-stone-900 hover:bg-stone-800 text-white py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                {passwordLoading ? 'Updating...' : t('updatePasswordBtn', 'Update Password')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
