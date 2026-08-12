import React from 'react';
import { Calendar, Clock, MapPin, Trash2, Truck, AlertTriangle, CheckCircle2, User, Phone, Navigation, Check } from 'lucide-react';

export default function PickupCard({ pickup, onStatusChange, onAssign, collectors = [], userRole }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"><Clock className="w-3.5 h-3.5" /> Pending</span>;
      case 'ASSIGNED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"><User className="w-3.5 h-3.5" /> Assigned</span>;
      case 'ACCEPTED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20"><CheckCircle2 className="w-3.5 h-3.5" /> Accepted</span>;
      case 'SCHEDULED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"><Truck className="w-3.5 h-3.5" /> Scheduled</span>;
      case 'IN_PROGRESS':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"><Truck className="w-3.5 h-3.5 animate-pulse" /> In Progress</span>;
      case 'ON_THE_WAY':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-600/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 animate-pulse"><Navigation className="w-3.5 h-3.5" /> 🚛 On The Way</span>;
      case 'COLLECTED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20"><Check className="w-3.5 h-3.5" /> Collected</span>;
      case 'COMPLETED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"><CheckCircle2 className="w-3.5 h-3.5" /> Completed</span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"><AlertTriangle className="w-3.5 h-3.5" /> Cancelled</span>;
      default:
        return null;
    }
  };

  const getWasteTypeBadge = (type) => {
    const colors = {
      ORGANIC: 'bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 border-emerald-800/60',
      RECYCLABLE: 'bg-cyan-950/40 text-cyan-600 dark:text-cyan-300 border-cyan-800/60',
      HAZARDOUS: 'bg-rose-950/40 text-rose-600 dark:text-rose-300 border-rose-800/60',
      BULK: 'bg-amber-950/40 text-amber-600 dark:text-amber-300 border-amber-800/60',
      GENERAL: 'bg-slate-800/40 text-slate-600 dark:text-slate-300 border-slate-700/60',
    };
    return (
      <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${colors[type] || colors.GENERAL}`}>
        {type}
      </span>
    );
  };

  const formattedDate = new Date(pickup.scheduledDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Filter available collectors to put them first in dropdown
  const sortedCollectors = [...collectors].sort((a, b) => {
    if (a.availabilityStatus === 'AVAILABLE' && b.availabilityStatus !== 'AVAILABLE') return -1;
    if (a.availabilityStatus !== 'AVAILABLE' && b.availabilityStatus === 'AVAILABLE') return 1;
    return 0;
  });

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-lg flex flex-col justify-between text-left">
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            {getWasteTypeBadge(pickup.wasteType)}
            <span className="text-xs text-slate-400 dark:text-slate-500 font-mono font-bold">#WPS-{pickup._id?.slice(-4).toUpperCase()}</span>
          </div>
          {getStatusBadge(pickup.status)}
        </div>

        {/* Resident / Contact Info if viewed by Collector or Admin */}
        {pickup.resident && (userRole === 'COLLECTOR' || userRole === 'ADMIN') && (
          <div className="mb-3 pb-3 border-b border-slate-100 dark:border-slate-800/60 space-y-1">
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
              <span>{pickup.resident.name}</span>
            </div>
            {pickup.resident.phone && (
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <a href={`tel:${pickup.resident.phone}`} className="hover:underline font-semibold text-green-700 dark:text-green-400">
                  {pickup.resident.phone}
                </a>
              </div>
            )}
          </div>
        )}

        <div className="space-y-2 mb-4 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-medium">
            <Calendar className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
            <span>{formattedDate}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{pickup.timeSlot}</span>
          </div>

          <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300 font-medium">
            <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>
              {pickup.address?.street}, {pickup.address?.city} {pickup.address?.postalCode}
            </span>
          </div>

          {pickup.notes && (
            <p className="mt-2 text-xs italic text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-950/40 p-2 rounded-lg border border-slate-200 dark:border-slate-800/60">
              "{pickup.notes}"
            </p>
          )}

          {pickup.collector && userRole !== 'COLLECTOR' && (
            <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800/60 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-blue-500" /> Driver: <strong className="text-slate-800 dark:text-slate-200">{pickup.collector.name || 'Assigned Collector'}</strong>
                </span>
                {pickup.collector.phone && (
                  <a href={`tel:${pickup.collector.phone}`} className="text-green-600 dark:text-green-400 font-semibold hover:underline">
                    {pickup.collector.phone}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Controls for Admin */}
      {userRole === 'ADMIN' && pickup.status !== 'COMPLETED' && pickup.status !== 'CANCELLED' && (
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Assign Collector
          </label>
          <select
            onChange={(e) => onAssign && onAssign(pickup._id, e.target.value)}
            defaultValue={pickup.collector?._id || ''}
            className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-green-500 transition-colors"
          >
            <option value="">Select Available Collector...</option>
            {sortedCollectors.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} {c.availabilityStatus === 'AVAILABLE' ? '✅ (Available)' : `⚠️ (${c.availabilityStatus})`} - {c.phone || 'No phone'}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Action Controls for Collector (Sequential Lifecycle) */}
      {userRole === 'COLLECTOR' && pickup.status !== 'COMPLETED' && pickup.status !== 'CANCELLED' && (
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
          {pickup.status === 'ASSIGNED' && (
            <button
              onClick={() => onStatusChange(pickup._id, 'ACCEPTED')}
              className="w-full py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Accept Pickup Assignment
            </button>
          )}

          {(pickup.status === 'ACCEPTED' || pickup.status === 'SCHEDULED') && (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onStatusChange(pickup._id, 'ON_THE_WAY')}
                className="py-2.5 px-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1"
              >
                <Navigation className="w-3.5 h-3.5" /> On The Way
              </button>
              <button
                onClick={() => onStatusChange(pickup._id, 'COLLECTED')}
                className="py-2.5 px-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1"
              >
                <Check className="w-3.5 h-3.5" /> Mark Collected
              </button>
            </div>
          )}

          {pickup.status === 'ON_THE_WAY' && (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onStatusChange(pickup._id, 'COLLECTED')}
                className="py-2.5 px-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1"
              >
                <Check className="w-3.5 h-3.5" /> Mark Collected
              </button>
              <button
                onClick={() => onStatusChange(pickup._id, 'COMPLETED')}
                className="py-2.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Complete Pickup
              </button>
            </div>
          )}

          {pickup.status === 'COLLECTED' && (
            <button
              onClick={() => onStatusChange(pickup._id, 'COMPLETED')}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Mark Final Completed
            </button>
          )}
        </div>
      )}
    </div>
  );
}
