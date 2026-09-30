import React from 'react';
import { MapPin, ShieldCheck, Clock, Users, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SafeExchange({ currentUser, onNavigate }) {
  const safeZones = [
    {
      id: 1,
      name: 'Gujarat Vidyapith Central Library Gate',
      desc: 'CCTV monitored main foyer entrance, ideal for daytime book & note handovers.',
      timings: '8:00 AM – 7:00 PM',
      popular: 'Books, PYQs, Stationery',
      status: 'High Security'
    },
    {
      id: 2,
      name: 'Sadbhavna Mandap & Heritage Quad',
      desc: 'Spacious central open pavilion with active student presence and security guards.',
      timings: '9:00 AM – 6:00 PM',
      popular: 'Charkhas, Hardware Projects',
      status: 'Recommended'
    },
    {
      id: 3,
      name: 'Hostel Block A Common Room & Gate',
      desc: 'Designated hostel exchange desk with hostel warden visibility.',
      timings: '5:00 PM – 9:00 PM',
      popular: 'Kettles, Desk Lamps, Hostel Needs',
      status: 'Hostel Verified'
    },
    {
      id: 4,
      name: 'Campus Cycle Stand #1 (Near Main Gate)',
      desc: 'Wide open paved area with space for inspecting and test-riding bicycles.',
      timings: '7:00 AM – 8:00 PM',
      popular: 'Bicycles & Sports Kit',
      status: 'Open Area'
    }
  ];

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold tracking-wide">
            <ShieldCheck size={14} className="text-emerald-300" />
            <span>Campus Safety Verified</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif">Campus Safe Exchange Zones</h1>
          <p className="text-sm text-emerald-100 font-medium leading-relaxed">
            CampuShare protects seniors and juniors by recommending pre-verified campus meeting spots with CCTV and faculty/guard presence. Never meet outside campus boundaries.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('dashboard')}
              className="bg-white text-emerald-900 hover:bg-emerald-50 px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <span>Browse Items to Exchange</span>
              <ArrowRight size={14} />
            </button>
            <button
              onClick={() => onNavigate('requests')}
              className="bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 rounded-xl font-bold text-xs backdrop-blur-md transition-all flex items-center gap-2"
            >
              <span>View Exchange Requests</span>
            </button>
          </div>
        </div>
      </div>

      {/* Campus Map Points */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-stone-800 font-serif">Verified Campus Handover Spots</h2>
          <span className="text-xs font-semibold text-stone-400">4 Monitored Zones</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {safeZones.map((zone) => (
            <div key={zone.id} className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm hover:shadow-md transition-all space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-stone-800">{zone.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium mt-0.5">
                      <Clock size={12} />
                      <span>{zone.timings}</span>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {zone.status}
                </span>
              </div>

              <p className="text-xs text-stone-600 font-medium leading-relaxed">
                {zone.desc}
              </p>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="text-stone-400 font-medium">Commonly exchanged:</span>
                <span className="font-bold text-stone-700">{zone.popular}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Protocol */}
      <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 space-y-3">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
          <AlertCircle size={18} className="text-amber-700" />
          <span>CampuShare Handover Safety Code:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-amber-900 font-medium">
          <div className="flex items-start gap-2">
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
            <span>Always inspect item condition in daylight before confirming.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
            <span>Verify student enrollment ID / GVP badge in person.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
            <span>Mark 'Exchange Completed' in app once handover is done.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
