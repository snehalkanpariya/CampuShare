import React, { useState, useEffect } from 'react';
import { getUserProfileApi } from '../config/api';
import { ShieldCheck, Mail, Hash, UserCheck, BookOpen, Calendar, Edit3, User, Loader2 } from 'lucide-react';

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
      <div className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-terracotta mb-4" size={40} />
        <p className="text-stone-600 font-bold">Loading profile information...</p>
      </div>
    );
  }

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

  return (
    <div className="p-8 max-w-xl mx-auto">
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-stone-200 space-y-6">
        
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
          >
            <Edit3 size={18} /> Edit Profile
          </button>
        </div>

      </div>
    </div>
  );
}
