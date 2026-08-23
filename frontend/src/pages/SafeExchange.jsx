import React, { useState } from 'react';
import { MapPin, ShieldCheck, Clock, CheckCircle2, QrCode, AlertCircle, Calendar, Send, Shield, Lock } from 'lucide-react';
import { getItems } from '../utils/itemStorage';

export default function SafeExchange({ currentUser, onNavigate }) {
  const [selectedHub, setSelectedHub] = useState('hub-1');
  const [selectedItem, setSelectedItem] = useState('');
  const [handoverTime, setHandoverTime] = useState('');
  const [handoverDate, setHandoverDate] = useState('');
  const [passGenerated, setPassGenerated] = useState(null);

  const items = getItems();

  const safeHubs = [
    {
      id: 'hub-1',
      name: 'Central Library Gate',
      location: 'Main Academic Block Entrance',
      status: 'High Security (CCTV)',
      timings: '8:00 AM – 8:00 PM',
      bestFor: 'Books, Exam Papers & Notes',
      icon: '📚',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300'
    },
    {
      id: 'hub-2',
      name: 'Anand Niketan Eco Square',
      location: 'Gujarat Vidyapith Heritage Lawn',
      status: 'Campus Security Patrol',
      timings: '9:00 AM – 6:00 PM',
      bestFor: 'Charkha, Khadi Crafts & Room Decor',
      icon: '🧶',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300'
    },
    {
      id: 'hub-3',
      name: 'Hostel Block A/B Reception Desk',
      location: 'Residential Hostel Main Lounge',
      status: 'Warden Desk 24/7',
      timings: 'Open 24 Hours',
      bestFor: 'Kettles, Desk Lamps & Appliances',
      icon: '🔌',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300'
    },
    {
      id: 'hub-4',
      name: 'Tech Lab 3 Entrance',
      location: 'Engineering Building 2nd Floor',
      status: 'Faculty Supervised Area',
      timings: '9:00 AM – 5:00 PM',
      bestFor: 'MacBooks, Laptops & Robotics Projects',
      icon: '💻',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-300'
    }
  ];

  const handleGeneratePass = (e) => {
    e.preventDefault();
    if (!selectedItem) {
      alert('Please select an item for exchange.');
      return;
    }
    const hubObj = safeHubs.find(h => h.id === selectedHub);
    const itemObj = items.find(i => i.id === selectedItem) || { name: 'Campus Item' };
    const passCode = 'GVP-SAFE-' + Math.floor(1000 + Math.random() * 9000);

    setPassGenerated({
      passCode,
      itemName: itemObj.name || itemObj.title,
      hubName: hubObj.name,
      hubLocation: hubObj.location,
      date: handoverDate || 'Today',
      time: handoverTime || '4:00 PM',
      ownerName: itemObj.ownerName || 'Verified Student'
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl p-6 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-extrabold text-emerald-200 w-fit mb-2">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span>Zero-Risk Campus Peer Handover</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold font-serif">
            Safe Campus Exchange Hub
          </h2>
          <p className="text-xs md:text-sm text-emerald-100 font-medium max-w-2xl mt-1 leading-relaxed">
            All exchanges are protected by verified GVP student credentials. Meet at CCTV-monitored campus spots for safe, transparent handovers.
          </p>
        </div>

        <button
          onClick={() => onNavigate('dashboard')}
          className="bg-white text-emerald-900 hover:bg-emerald-50 px-5 py-2.5 rounded-2xl font-bold text-xs shadow-md shrink-0 transition-all"
        >
          Browse Marketplace
        </button>
      </div>

      {/* Safety Verification Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
            <Shield size={20} />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-stone-800">1. Verified Student ID</h4>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              Only verified juniors & seniors can request or list items.
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-blue-100 text-blue-800 shrink-0">
            <MapPin size={20} />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-stone-800">2. Monitored Meeting Hubs</h4>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              Pickups happen at CCTV library gates & warden desks.
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 shrink-0">
            <Lock size={20} />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-stone-800">3. In-Person Inspection</h4>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              Inspect product condition in person before confirming handover.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Hub Selector & Schedule Exchange Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Campus Safe Hubs List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-extrabold text-stone-800 font-serif">
            Designated Safe Campus Pickup Spots
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {safeHubs.map((hub) => {
              const isSelected = selectedHub === hub.id;
              return (
                <div
                  key={hub.id}
                  onClick={() => setSelectedHub(hub.id)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                      : 'bg-white border-stone-200 hover:border-emerald-300 shadow-sm'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{hub.icon}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${hub.badgeColor}`}>
                        {hub.status}
                      </span>
                    </div>

                    <h4 className="text-base font-extrabold text-stone-800">{hub.name}</h4>
                    <p className="text-xs text-stone-500 font-medium mt-0.5">{hub.location}</p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-stone-100 text-xs font-medium text-stone-600">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">Hours:</span>
                      <span className="font-semibold">{hub.timings}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">Best for:</span>
                      <span className="font-semibold text-emerald-800">{hub.bestFor}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Schedule Safe Handover Form */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-stone-800 flex items-center gap-2">
            <QrCode className="text-terracotta" size={20} />
            Schedule Safe Exchange
          </h3>
          <p className="text-xs text-stone-500 font-medium">
            Generate a verified Security Pass to present during campus pickup.
          </p>

          {passGenerated ? (
            <div className="bg-emerald-50 border border-emerald-300 p-5 rounded-2xl space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-800">SAFE PASS GENERATED</span>
                <CheckCircle2 size={18} className="text-emerald-600" />
              </div>

              <div className="bg-white p-4 rounded-xl text-center border border-emerald-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-stone-400">Handover Pass Code</span>
                <div className="text-xl font-extrabold font-mono text-emerald-900 tracking-wider">
                  {passGenerated.passCode}
                </div>
              </div>

              <div className="text-xs space-y-1 text-stone-700 font-medium">
                <div><strong>Item:</strong> {passGenerated.itemName}</div>
                <div><strong>Meeting Spot:</strong> {passGenerated.hubName} ({passGenerated.hubLocation})</div>
                <div><strong>Time:</strong> {passGenerated.date} at {passGenerated.time}</div>
                <div><strong>Sharer:</strong> {passGenerated.ownerName}</div>
              </div>

              <button
                onClick={() => setPassGenerated(null)}
                className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-all border border-stone-200"
              >
                Schedule Another Handover
              </button>
            </div>
          ) : (
            <form onSubmit={handleGeneratePass} className="space-y-3">
              <div>
                <label className="block text-xs font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                  Select Item to Exchange *
                </label>
                <select
                  value={selectedItem}
                  onChange={(e) => setSelectedItem(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold focus:outline-none focus:border-terracotta bg-white"
                  required
                >
                  <option value="">-- Choose Item --</option>
                  {items.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name || item.title} ({item.price})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                  Selected Meeting Hub
                </label>
                <input
                  type="text"
                  readOnly
                  value={safeHubs.find(h => h.id === selectedHub)?.name || 'Central Library Gate'}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-xs font-bold text-stone-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-stone-500 mb-1">Date</label>
                  <input
                    type="date"
                    value={handoverDate}
                    onChange={(e) => setHandoverDate(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-stone-200 text-xs font-medium focus:outline-none focus:border-terracotta"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-500 mb-1">Preferred Time</label>
                  <input
                    type="time"
                    value={handoverTime}
                    onChange={(e) => setHandoverTime(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-stone-200 text-xs font-medium focus:outline-none focus:border-terracotta"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-2"
              >
                <Send size={15} />
                <span>Generate Verified Safe Pass</span>
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
}
