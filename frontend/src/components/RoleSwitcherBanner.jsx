import React, { useState } from 'react';
import { 
  Users, UserCheck, ShieldCheck, ArrowRightLeft, 
  HelpCircle, CheckCircle2, Bell, Sparkles, ChevronDown 
} from 'lucide-react';
import { DEMO_SENIOR, DEMO_JUNIOR, DEMO_USERS } from '../utils/demoUsers';

export default function RoleSwitcherBanner({ currentUser, onSwitchUser, onNavigate }) {
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const isJunior = currentUser?.role?.toLowerCase().includes('junior') || 
                   currentUser?.name?.toLowerCase().includes('aarav') ||
                   currentUser?.id === 'user-junior-1';

  const isSenior = currentUser?.role?.toLowerCase().includes('senior') || 
                   currentUser?.name?.toLowerCase().includes('rahul') ||
                   currentUser?.id === 'user-senior-1';

  return (
    <>
      {/* Top Interactive Evaluation & Role Switcher Bar */}
      <aside aria-label="Interactive Evaluation & Testing Bar" className="bg-stone-900 text-stone-200 px-4 py-2 text-xs border-b border-stone-800 flex flex-wrap items-center justify-between gap-3 sticky top-[57px] z-40 shadow-inner">
        {/* Left: Role indicator & Flow label */}
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-extrabold text-amber-300 uppercase tracking-wider text-[11px] flex items-center gap-1">
            <span>🎭 Interactive Test Mode:</span>
          </span>
          <span className="text-stone-300 hidden sm:inline text-[11px]">
            Viewing as <strong>{currentUser?.name || 'Aarav Shah'}</strong> ({currentUser?.role || 'Junior 1st Year'})
          </span>
        </div>

        {/* Center: Quick One-Click Switcher Buttons */}
        <div className="flex items-center gap-1.5 bg-stone-800/90 p-1 rounded-xl border border-stone-700">
          <button
            onClick={() => onSwitchUser(DEMO_JUNIOR)}
            className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1.5 ${
              isJunior
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-stone-400 hover:text-white hover:bg-stone-700/60'
            }`}
            title="Switch to Junior student persona (Aarav Shah)"
          >
            <span>🎒 Aarav (Junior 1st Year)</span>
            {isJunior && <span className="text-[10px] bg-amber-700 px-1.5 py-0.2 rounded font-mono">Active</span>}
          </button>

          <button
            onClick={() => onSwitchUser(DEMO_SENIOR)}
            className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1.5 ${
              isSenior
                ? 'bg-terracotta text-white shadow-sm'
                : 'text-stone-400 hover:text-white hover:bg-stone-700/60'
            }`}
            title="Switch to Senior item owner persona (Rahul Sharma)"
          >
            <span>🎓 Rahul (Senior Owner)</span>
            {isSenior && <span className="text-[10px] bg-amber-900/60 px-1.5 py-0.2 rounded font-mono">Active</span>}
          </button>
        </div>

        {/* Right: Flow Guide Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGuideModal(true)}
            className="flex items-center gap-1 text-[11px] font-bold text-amber-200 hover:text-white bg-stone-800 hover:bg-stone-700 px-2.5 py-1 rounded-lg transition-all border border-stone-700"
          >
            <HelpCircle size={13} className="text-amber-400" />
            <span>Workflow Guide (5 Steps)</span>
          </button>
        </div>
      </aside>

      {/* Workflow Modal */}
      {showGuideModal && (
        <div 
          className="fixed inset-0 z-[150] bg-stone-950/70 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowGuideModal(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200 text-stone-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🤝</span>
                <div>
                  <h3 className="text-base font-extrabold font-serif text-terracotta">
                    Peer-to-Peer Request & Notification Flow
                  </h3>
                  <p className="text-[11px] text-stone-500 font-medium">
                    How Junior & Senior students coordinate item sharing
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="text-stone-400 hover:text-stone-800 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Step Progression Diagram */}
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-terracotta text-white font-extrabold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-extrabold text-stone-800">1. View Item</h4>
                  <p className="text-stone-600 text-[11px] mt-0.5">
                    Click any item in the marketplace (e.g. <em>Exam Papers</em> or <em>MacBook</em>) to see photos, condition, price, and owner details.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-600 text-white font-extrabold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-extrabold text-stone-800">2. Request Item</h4>
                  <p className="text-stone-600 text-[11px] mt-0.5">
                    Click <strong>Request This Item 🤝</strong>. Choose your handover spot (e.g. Central Library Gate) and add a message note.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-extrabold text-stone-800">3. Owner Receives Request</h4>
                  <p className="text-stone-600 text-[11px] mt-0.5">
                    Switch to <strong>Rahul (Senior Owner)</strong>. The Bell icon rings with an unread badge and dropdown alert: <em>New Item Request 🤝</em>.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <h4 className="font-extrabold text-stone-800">4. Accept or Decline</h4>
                  <p className="text-stone-600 text-[11px] mt-0.5">
                    In <strong>Requests & Exchanges</strong>, Owner clicks <strong>Accept Request</strong>. The item turns to <em>Reserved</em> and the requester gets an acceptance notification!
                  </p>
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-teal-600 text-white font-extrabold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  5
                </div>
                <div>
                  <h4 className="font-extrabold text-stone-800">5. 🔔 Notifications & Chat & Handover</h4>
                  <p className="text-stone-600 text-[11px] mt-0.5">
                    Live chat between students to coordinate pickup, followed by <strong>Mark Handover Completed 🤝</strong>. Both students receive completion notifications and eco points!
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-5 py-2 bg-terracotta text-white rounded-xl font-bold text-xs shadow-md"
              >
                Got It, Let's Try!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
