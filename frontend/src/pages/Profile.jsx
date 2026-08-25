<<<<<<< Updated upstream
import React, { useState, useEffect } from 'react';
import { getUserProfileApi } from '../config/api';
import { ShieldCheck, Mail, Hash, UserCheck, BookOpen, Calendar, Edit3, User, Loader2 } from 'lucide-react';
=======
import React, { useState } from 'react';
import { ShieldCheck, Mail, Hash, Award, Lock, KeyRound, CheckCircle2, ShieldAlert, Eye, EyeOff, ChevronDown, ChevronUp, Edit3, User, BookOpen, GraduationCap } from 'lucide-react';
import { changePasswordApi, updateProfileApi } from '../config/api';
>>>>>>> Stashed changes

export default function Profile({ currentUser }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      const token = localStorage.getItem('campus_token');
      if (!token) {
        if (currentUser) {
          setProfile(currentUser);
        } else {
          setError('Please log in to view your profile.');
        }
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getUserProfileApi(token);
        setProfile(data);
        setError('');
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        if (currentUser) {
          setProfile(currentUser);
        } else {
          setError(err.message || 'Failed to load profile data.');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [currentUser]);

  if (loading) {
    return (
<<<<<<< Updated upstream
      <div className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-terracotta mb-4" size={40} />
        <p className="text-stone-600 font-bold">Loading profile information...</p>
=======
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-stone-800">Please login to view profile</h2>
>>>>>>> Stashed changes
      </div>
    );
  }

<<<<<<< Updated upstream
  if (error && !profile) {
    return (
      <div className="p-8 max-w-md mx-auto text-center">
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-stone-200 space-y-4">
          <div className="text-4xl mb-2">👤</div>
          <h2 className="text-xl font-extrabold text-stone-800">Profile Unavailable</h2>
          <p className="text-sm text-stone-500 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  const name = profile?.name || 'GVP Student';
  const email = profile?.email || 'N/A';
  const enrollment = profile?.enrollmentNumber || 'N/A';
  const role = profile?.role || 'Junior';
  const department = profile?.department || 'MCA';
  const semester = profile?.semester || '2';
  const isVerified = profile?.verified !== false;
  const verificationStatus = profile?.verificationStatus || (isVerified ? 'VERIFIED' : 'PENDING');
  const profilePicture = profile?.profilePicture;
=======
  // Local state for live profile details
  const [userProfile, setUserProfile] = useState({
    name: currentUser.name || 'Gujarat Vidyapith Student',
    email: currentUser.email || 'student@gujaratvidyapith.org',
    enrollmentNumber: currentUser.enrollmentNumber || 'N/A',
    department: currentUser.department || 'MCA',
    semester: currentUser.semester || 1,
    role: currentUser.role || 'GVP Student',
    verificationStatus: currentUser.verificationStatus || 'VERIFIED',
    verified: currentUser.verified !== false
  });

  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(userProfile.name);
  const [editDepartment, setEditDepartment] = useState(userProfile.department);
  const [editSemester, setEditSemester] = useState(userProfile.semester);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccessMsg, setEditSuccessMsg] = useState('');

  // Change Password State
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

  // Open Edit Profile form
  const handleStartEdit = () => {
    setEditName(userProfile.name);
    setEditDepartment(userProfile.department);
    setEditSemester(userProfile.semester || 1);
    setEditError('');
    setEditSuccessMsg('');
    setIsEditing(true);
  };

  // Submit Edit Profile Form
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditSuccessMsg('');

    if (!editName || !editName.trim()) {
      setEditError('Name cannot be empty.');
      return;
    }

    if (!editDepartment || !editDepartment.trim()) {
      setEditError('Department cannot be empty.');
      return;
    }

    const semNum = parseInt(editSemester, 10);
    if (isNaN(semNum) || semNum < 1 || semNum > 10) {
      setEditError('Semester must be a valid number between 1 and 10.');
      return;
    }

    setEditLoading(true);

    try {
      const updatedData = await updateProfileApi({
        name: editName.trim(),
        department: editDepartment.trim(),
        semester: semNum
      });

      // Update local profile state
      const updatedProfile = {
        ...userProfile,
        name: updatedData.name || editName.trim(),
        department: updatedData.department || editDepartment.trim(),
        semester: updatedData.semester !== undefined ? updatedData.semester : semNum
      };
      setUserProfile(updatedProfile);

      // Persist in localStorage session
      try {
        const savedUserStr = localStorage.getItem('campus_user');
        if (savedUserStr) {
          const savedUserObj = JSON.parse(savedUserStr);
          localStorage.setItem('campus_user', JSON.stringify({
            ...savedUserObj,
            name: updatedProfile.name,
            department: updatedProfile.department,
            semester: updatedProfile.semester
          }));
        }
      } catch (e) {
        // Ignored
      }

      setEditSuccessMsg('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      if (err.message && err.message.includes('Unauthorized')) {
        setEditError('401 Unauthorized: Session expired. Please log in again.');
      } else if (err.message && err.message.includes('not found')) {
        setEditError('404 User Not Found: User profile could not be located.');
      } else {
        setEditError(err.message || '400 Bad Request: Failed to update profile data.');
      }
    } finally {
      setEditLoading(false);
    }
  };

  // Submit Change Password Form
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

    if (oldPassword === newPassword) {
      setPasswordError('New password must be different from your current password.');
      return;
    }

    setPasswordLoading(true);

    try {
      const targetIdentifier = userProfile.email || userProfile.enrollmentNumber || currentUser.id || '';
      const res = await changePasswordApi({
        email: targetIdentifier,
        oldPassword: oldPassword,
        newPassword: newPassword
      });

      setPasswordSuccessMsg(res.message || 'Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password. Please verify your current password.');
    } finally {
      setPasswordLoading(false);
    }
  };
>>>>>>> Stashed changes

  return (
    <div className="p-8 max-w-xl mx-auto">
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-stone-200 space-y-6">
<<<<<<< Updated upstream
        
        {/* Title & Header */}
        <div className="text-center pb-4 border-b border-stone-100">
          <h1 className="text-2xl font-extrabold font-serif text-stone-800 flex items-center justify-center gap-2">
            <span>👤</span> Profile
          </h1>
        </div>

        {/* Profile Avatar & Primary Info */}
        <div className="flex items-center gap-5 pb-6 border-b border-stone-100">
          {profilePicture ? (
            <img
              src={profilePicture}
              alt={name}
              className="w-20 h-20 rounded-full object-cover shadow-lg border-2 border-terracotta shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-terracotta text-white flex items-center justify-center text-3xl font-extrabold shadow-lg shrink-0">
              {name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl font-extrabold text-stone-800">{name}</h2>
              {isVerified && (
                <span className="bg-emerald-100 text-emerald-800 px-3 py-0.5 rounded-full text-xs font-extrabold flex items-center gap-1">
                  <ShieldCheck size={14} /> ✓ Verified
                </span>
              )}
            </div>
            <p className="text-sm font-bold text-stone-500">
              {role} — {department} Department
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="space-y-3 font-bold text-sm">
          {/* Name */}
          <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-200">
            <div className="flex items-center gap-2 text-stone-500">
              <User size={18} /> Name
            </div>
            <span className="text-stone-800 font-extrabold">{name}</span>
          </div>

          {/* Email */}
          <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-200">
            <div className="flex items-center gap-2 text-stone-500">
              <Mail size={18} /> Email
            </div>
            <span className="text-stone-800 font-extrabold">{email}</span>
          </div>

          {/* Enrollment */}
          <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-200">
            <div className="flex items-center gap-2 text-stone-500">
              <Hash size={18} /> Enrollment
            </div>
            <span className="text-stone-800 font-extrabold">{enrollment}</span>
          </div>

          {/* Role & Department */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <div className="flex items-center gap-2 text-stone-500 mb-1 text-xs font-bold uppercase">
                <UserCheck size={16} /> Role
              </div>
              <span className="text-stone-800 font-extrabold text-base">{role}</span>
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <div className="flex items-center gap-2 text-stone-500 mb-1 text-xs font-bold uppercase">
                <BookOpen size={16} /> Department
              </div>
              <span className="text-stone-800 font-extrabold text-base">{department}</span>
            </div>
          </div>

          {/* Semester */}
          <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-200">
            <div className="flex items-center gap-2 text-stone-500">
              <Calendar size={18} /> Semester
            </div>
            <span className="text-stone-800 font-extrabold">{semester}</span>
          </div>

          {/* Verification Status */}
          <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-200">
            <div className="flex items-center gap-2 text-stone-500">
              <ShieldCheck size={18} /> Verification
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1 ${
              isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {isVerified ? '✓ Verified' : verificationStatus}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-3.5 px-6 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2"
=======

        {/* Global Notifications */}
        {editSuccessMsg && (
          <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl text-xs font-bold border border-emerald-200 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 size={18} className="shrink-0" />
            <span>{editSuccessMsg}</span>
          </div>
        )}

        {/* Profile Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-terracotta text-white flex items-center justify-center text-3xl font-extrabold shadow-lg shrink-0">
              {userProfile.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-extrabold text-stone-800">{userProfile.name}</h2>
                {userProfile.verified && (
                  <span className="bg-emerald-100 text-emerald-800 px-3 py-0.5 rounded-full text-xs font-extrabold flex items-center gap-1">
                    <ShieldCheck size={14} /> VERIFIED
                  </span>
                )}
              </div>
              <div className="text-sm font-bold text-stone-500">
                {userProfile.role} — {userProfile.department} Department {userProfile.semester ? `(Semester ${userProfile.semester})` : ''}
              </div>
            </div>
          </div>

          {!isEditing && (
            <button
              type="button"
              onClick={handleStartEdit}
              className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-800 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-sm shrink-0"
            >
              <Edit3 size={15} /> Edit Profile
            </button>
          )}
        </div>

        {/* EDIT PROFILE FORM MODE */}
        {isEditing ? (
          <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-extrabold text-stone-800 text-base flex items-center gap-2">
                <Edit3 size={18} className="text-terracotta" /> Edit Profile Information
              </h3>
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Allowed Fields Only</span>
            </div>

            {editError && (
              <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs font-bold border border-red-200 flex items-center gap-2">
                <ShieldAlert size={16} className="shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Name (Editable) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-3 text-stone-400" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-terracotta outline-none text-sm font-medium bg-white"
                  />
                </div>
              </div>

              {/* Department (Editable) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Department
                </label>
                <div className="relative">
                  <BookOpen size={16} className="absolute left-3.5 top-3 text-stone-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. MCA, Computer Science"
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-terracotta outline-none text-sm font-medium bg-white"
                  />
                </div>
              </div>

              {/* Semester (Editable) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Semester (1 - 10)
                </label>
                <div className="relative">
                  <GraduationCap size={16} className="absolute left-3.5 top-3 text-stone-400" />
                  <input
                    type="number"
                    required
                    min={1}
                    max={10}
                    placeholder="e.g. 2"
                    value={editSemester}
                    onChange={(e) => setEditSemester(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-terracotta outline-none text-sm font-medium bg-white"
                  />
                </div>
              </div>

              {/* READ-ONLY PROTECTED FIELDS DISPLAY */}
              <div className="pt-2 border-t border-stone-200 space-y-2">
                <div className="text-xs font-extrabold text-stone-400 uppercase tracking-wider mb-2">
                  Protected System Fields (Read-Only)
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-stone-100 rounded-xl border border-stone-200">
                    <span className="block text-stone-400 font-bold">Email</span>
                    <span className="font-extrabold text-stone-700 truncate block">{userProfile.email}</span>
                  </div>

                  <div className="p-3 bg-stone-100 rounded-xl border border-stone-200">
                    <span className="block text-stone-400 font-bold">Enrollment No.</span>
                    <span className="font-extrabold text-stone-700 block">{userProfile.enrollmentNumber}</span>
                  </div>

                  <div className="p-3 bg-stone-100 rounded-xl border border-stone-200">
                    <span className="block text-stone-400 font-bold">Role</span>
                    <span className="font-extrabold text-stone-700 block">{userProfile.role}</span>
                  </div>

                  <div className="p-3 bg-stone-100 rounded-xl border border-stone-200">
                    <span className="block text-stone-400 font-bold">Verification</span>
                    <span className="font-extrabold text-emerald-700 block">{userProfile.verificationStatus || 'VERIFIED'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  disabled={editLoading || !editName.trim() || !editDepartment.trim()}
                  className="flex-1 bg-terracotta hover:bg-terracotta-hover text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  {editLoading ? 'Saving Changes...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditError('');
                  }}
                  className="py-3 px-5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl font-bold text-sm transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* READ-ONLY DISPLAY MODE */
          <div className="space-y-3 font-bold text-sm">
            <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <div className="flex items-center gap-2 text-stone-500">
                <Mail size={18} /> Official Email
              </div>
              <span className="text-stone-800 font-extrabold">{userProfile.email}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <div className="flex items-center gap-2 text-stone-500">
                <Hash size={18} /> Enrollment Number
              </div>
              <span className="text-stone-800 font-extrabold">{userProfile.enrollmentNumber}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <div className="flex items-center gap-2 text-stone-500">
                <BookOpen size={18} /> Department & Semester
              </div>
              <span className="text-stone-800 font-extrabold">
                {userProfile.department} {userProfile.semester ? `(Sem ${userProfile.semester})` : ''}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <div className="flex items-center gap-2 text-stone-500">
                <Award size={18} /> Verification Status
              </div>
              <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-extrabold">
                VERIFIED ({userProfile.role === 'JUNIOR' ? 'EMAIL OTP' : 'MARKSHEET OCR'})
              </span>
            </div>
          </div>
        )}

        {/* Change Password Accordion */}
        <div className="border-t border-stone-100 pt-6">
          <button
            type="button"
            onClick={() => {
              setShowPasswordForm(!showPasswordForm);
              setPasswordError('');
              setPasswordSuccessMsg('');
            }}
            className="w-full flex items-center justify-between p-4 bg-stone-50 hover:bg-stone-100 rounded-2xl border border-stone-200 transition-all cursor-pointer text-left"
>>>>>>> Stashed changes
          >
            <Edit3 size={18} /> Edit Profile
          </button>
<<<<<<< Updated upstream
=======

          {showPasswordForm && (
            <div className="mt-4 p-5 bg-stone-50 rounded-2xl border border-stone-200 animate-fade-in space-y-4">
              {passwordError && (
                <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs font-bold border border-red-200 flex items-center gap-2">
                  <ShieldAlert size={16} className="shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              {passwordSuccessMsg && (
                <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl text-xs font-bold border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>{passwordSuccessMsg}</span>
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
                    disabled={passwordLoading || !oldPassword || !newPassword || !confirmPassword}
                    className="flex-1 bg-terracotta hover:bg-terracotta-hover text-white py-2.5 rounded-xl font-bold text-sm shadow-md transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {passwordLoading ? 'Updating Password...' : 'Update Password'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setOldPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setPasswordError('');
                      setPasswordSuccessMsg('');
                    }}
                    className="py-2.5 px-4 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl font-bold text-sm transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
>>>>>>> Stashed changes
        </div>

      </div>
    </div>
  );
}
