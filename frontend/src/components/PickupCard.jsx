import React from 'react';
import { Calendar, Clock, MapPin, Trash2, Truck, AlertTriangle, CheckCircle2, User } from 'lucide-react';

export default function PickupCard({ pickup, onStatusChange, onAssign, collectors = [], userRole }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20"><Clock className="w-3.5 h-3.5" /> Pending</span>;
      case 'SCHEDULED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20"><Truck className="w-3.5 h-3.5" /> Scheduled</span>;
      case 'IN_PROGRESS':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20"><Truck className="w-3.5 h-3.5 animate-pulse" /> In Progress</span>;
      case 'COMPLETED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle2 className="w-3.5 h-3.5" /> Completed</span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20"><AlertTriangle className="w-3.5 h-3.5" /> Cancelled</span>;
      default:
        return null;
    }
  };

  const getWasteTypeBadge = (type) => {
    const colors = {
      ORGANIC: 'bg-emerald-950 text-emerald-300 border-emerald-800',
      RECYCLABLE: 'bg-cyan-950 text-cyan-300 border-cyan-800',
      HAZARDOUS: 'bg-rose-950 text-rose-300 border-rose-800',
      BULK: 'bg-amber-950 text-amber-300 border-amber-800',
      GENERAL: 'bg-slate-800 text-slate-300 border-slate-700',
    };
    return (
      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${colors[type] || colors.GENERAL}`}>
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

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            {getWasteTypeBadge(pickup.wasteType)}
            <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">#{pickup._id?.slice(-6)}</span>
          </div>
          {getStatusBadge(pickup.status)}
        </div>

        <div className="space-y-2 mb-4 text-sm text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-medium">
            <Calendar className="w-4 h-4 text-eco-500 dark:text-eco-400 shrink-0" />
            <span>{formattedDate}</span>
          </div>
          
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
            <span>{pickup.timeSlot}</span>
          </div>

          <div className="flex items-start gap-2 text-slate-500 dark:text-slate-400">
            <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
            <span>
              {pickup.address?.street}, {pickup.address?.city} {pickup.address?.postalCode}
            </span>
          </div>

          {pickup.notes && (
            <p className="mt-2 text-xs italic text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-950/40 p-2 rounded-lg border border-slate-200 dark:border-slate-800/60">
              "{pickup.notes}"
            </p>
          )}

          {pickup.collector && (
            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-eco-500 dark:text-eco-400" /> Driver: <strong className="text-slate-800 dark:text-slate-200">{pickup.collector.name || 'Assigned Driver'}</strong>
              </span>
              {pickup.collector.phone && <span>{pickup.collector.phone}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Action Controls for Collector or Admin */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
        {userRole === 'ADMIN' && pickup.status !== 'COMPLETED' && pickup.status !== 'CANCELLED' && (
          <div className="w-full flex items-center gap-2">
            <select
              onChange={(e) => onAssign && onAssign(pickup._id, e.target.value)}
              defaultValue={pickup.collector?._id || ''}
              className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-eco-500 transition-colors"
            >

              <option value="">Assign Driver...</option>
              {collectors.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.phone || 'No phone'})
                </option>
              ))}
            </select>
          </div>
        )}

        {userRole === 'COLLECTOR' && pickup.status !== 'COMPLETED' && pickup.status !== 'CANCELLED' && (
          <div className="flex items-center gap-2 w-full">
            {pickup.status === 'SCHEDULED' && (
              <button
                onClick={() => onStatusChange(pickup._id, 'IN_PROGRESS')}
                className="w-full text-xs font-semibold py-1.5 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-all"
              >
                Start Pickup Route
              </button>
            )}
            {pickup.status === 'IN_PROGRESS' && (
              <button
                onClick={() => onStatusChange(pickup._id, 'COMPLETED')}
                className="w-full text-xs font-semibold py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all"
              >
                Mark Completed
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
