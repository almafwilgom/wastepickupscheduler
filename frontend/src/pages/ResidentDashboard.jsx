import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import PickupCard from '../components/PickupCard';
import ProfileEditor from '../components/ProfileEditor';
import { 
  Calendar, RefreshCw, CheckCircle2, Clock, Trash2, 
  Sparkles, Leaf, PlusCircle, ArrowRight, User, Phone, MapPin, 
  ShieldAlert, Settings, Bell, Circle, Truck, Navigation, Check, CheckCheck
} from 'lucide-react';

/**
 * Visual Status Tracker Component (Phase 12 requirement)
 */
function VisualStatusTracker({ pickup }) {
  const steps = [
    { id: 'PENDING', label: 'Request Submitted', icon: Clock },
    { id: 'ASSIGNED', label: 'Collector Assigned', icon: User },
    { id: 'ACCEPTED', label: 'Accepted', icon: CheckCircle2 },
    { id: 'ON_THE_WAY', label: 'On The Way', icon: Navigation },
    { id: 'COLLECTED', label: 'Collected', icon: Check },
    { id: 'COMPLETED', label: 'Completed', icon: CheckCircle2 },
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'PENDING': return 0;
      case 'ASSIGNED': return 1;
      case 'ACCEPTED':
      case 'SCHEDULED':
      case 'IN_PROGRESS': return 2;
      case 'ON_THE_WAY': return 3;
      case 'COLLECTED': return 4;
      case 'COMPLETED': return 5;
      default: return -1;
    }
  };

  const currentIndex = getStepIndex(pickup.status);

  if (pickup.status === 'CANCELLED') {
    return (
      <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
        <ShieldAlert className="w-4 h-4" /> This pickup request was cancelled.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl space-y-4 shadow-sm text-left">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 font-mono">#WPS-{pickup._id?.slice(-4).toUpperCase()}</span>
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            {pickup.wasteType} Waste Collection
          </span>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400">
          Status: {pickup.status.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Prominent On The Way banner (Phase 20) */}
      {pickup.status === 'ON_THE_WAY' && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs font-bold flex items-center gap-3 animate-pulse">
          <Truck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <div>
            <div className="text-sm font-black">🚛 Collector is On The Way!</div>
            <p className="text-[11px] font-medium opacity-90 mt-0.5">
              Your waste pickup collector is currently traveling to your address. Please ensure your waste bins are ready outside!
            </p>
          </div>
        </div>
      )}

      {/* Collector Info Display (Phase 12 & Phase 20) */}
      {pickup.collector && (
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-600 font-bold flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400">Assigned Driver</div>
              <div className="font-bold text-slate-900 dark:text-white">{pickup.collector.name}</div>
            </div>
          </div>
          {pickup.collector.phone && (
            <a
              href={`tel:${pickup.collector.phone}`}
              className="px-3 py-1.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Phone className="w-3.5 h-3.5" /> Call Collector ({pickup.collector.phone})
            </a>
          )}
        </div>
      )}

      {/* Step Progress Line */}
      <div className="pt-2">
        <div className="grid grid-cols-6 gap-1 relative">
          {steps.map((step, idx) => {
            const isDone = idx <= currentIndex;
            const isCurrent = idx === currentIndex;
            const Icon = step.icon;

            return (
              <div key={step.id} className="flex flex-col items-center text-center gap-1.5 group">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs transition-all z-10 ${
                    isDone
                      ? 'bg-green-600 text-white shadow-md shadow-green-600/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  } ${isCurrent ? 'ring-4 ring-green-500/20 scale-110' : ''}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span
                  className={`text-[9px] sm:text-[10px] font-semibold leading-tight ${
                    isDone ? 'text-slate-900 dark:text-slate-200' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function ResidentDashboard() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [pickups, setPickups] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successToast, setSuccessToast] = useState('');

  // Schedule pickup form state
  const [formData, setFormData] = useState({
    wasteType: 'RECYCLABLE',
    scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    timeSlot: 'MORNING (8AM - 12PM)',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    postalCode: user?.address?.postalCode || '',
    notes: '',
  });

  const fetchPickups = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/pickups/my-pickups', 'GET', null, token);
      setPickups(res.pickups || []);
    } catch (err) {
      console.error('Failed to load pickup history:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await apiRequest('/notifications', 'GET', null, token);
      setNotifications(res.notifications || []);
    } catch (err) {
      console.warn(err);
    }
  };

  const handleMarkNotificationRead = async (id) => {
    try {
      await apiRequest(`/notifications/${id}/read`, 'PUT', null, token);
      setNotifications(prev => prev.map(n => (n._id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await apiRequest('/notifications/read-all', 'PUT', null, token);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setSuccessToast('All notifications marked as read');
      setTimeout(() => setSuccessToast(''), 3000);
    } catch (err) {
      alert(`Failed to mark all as read: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchPickups();
    fetchNotifications();
  }, []);

  const handleCreatePickupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        wasteType: formData.wasteType,
        scheduledDate: formData.scheduledDate,
        timeSlot: formData.timeSlot,
        address: {
          street: formData.street || user?.address?.street || '',
          city: formData.city || user?.address?.city || '',
          postalCode: formData.postalCode || user?.address?.postalCode || '',
        },
        notes: formData.notes,
      };

      await apiRequest('/pickups', 'POST', payload, token);
      setSuccessToast('Pickup scheduled successfully!');
      setFormData({
        wasteType: 'RECYCLABLE',
        scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        timeSlot: 'MORNING (8AM - 12PM)',
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        postalCode: user?.address?.postalCode || '',
        notes: '',
      });
      fetchPickups();
      fetchNotifications();
      setTimeout(() => setSuccessToast(''), 4000);
      setActiveTab('overview');
    } catch (err) {
      alert(`Error submitting pickup request: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPickup = async (pickupId) => {
    if (!window.confirm('Are you sure you want to cancel this pickup request?')) return;
    try {
      await apiRequest(`/pickups/${pickupId}/cancel`, 'PUT', null, token);
      setSuccessToast('Pickup cancelled successfully.');
      fetchPickups();
      fetchNotifications();
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err) {
      alert(`Failed to cancel: ${err.message}`);
    }
  };

  const pendingCount = pickups.filter((p) => p.status === 'PENDING').length;
  const scheduledCount = pickups.filter((p) => p.status === 'ASSIGNED' || p.status === 'ACCEPTED' || p.status === 'SCHEDULED' || p.status === 'ON_THE_WAY' || p.status === 'IN_PROGRESS').length;
  const completedCount = pickups.filter((p) => p.status === 'COMPLETED' || p.status === 'COLLECTED').length;

  const activePickup = pickups.find(p => p.status !== 'COMPLETED' && p.status !== 'CANCELLED');

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-green-600 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 animate-slide-in">
          <Sparkles className="w-5 h-5 text-green-200" />
          <span className="font-semibold text-sm">{successToast}</span>
        </div>
      )}

      {/* OVERVIEW SUB-VIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8 text-left">
          
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm transition-all duration-300">
            <div className="text-left">
              <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">
                Welcome back, <span className="text-green-600 dark:text-green-400">{user?.name}</span>! 👋
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Schedule waste pickups, track assigned collectors, and receive SMS alerts when collectors are on the way.
              </p>
            </div>
            
            <button
              onClick={() => setActiveTab('schedule')}
              className="px-5 py-3 rounded-2xl bg-green-600 hover:bg-green-500 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Schedule New Pickup</span>
            </button>
          </div>

          {/* Active Pickup Progress Tracker (Phase 12 requirement) */}
          {activePickup && (
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-850 dark:text-white">Active Pickup Progress</h3>
              <VisualStatusTracker pickup={activePickup} />
            </div>
          )}

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-800 dark:text-white">{scheduledCount}</div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Pickup Routes</div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-800 dark:text-white">{pendingCount}</div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Requests</div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-800 dark:text-white">{completedCount}</div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Pickups</div>
              </div>
            </div>
          </div>

          {/* Pickup requests list */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-850 dark:text-white">Your Recent Collection Requests</h3>
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-500">Syncing stops...</div>
            ) : pickups.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center space-y-2">
                <Leaf className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="font-bold text-sm">No scheduled pickups</h4>
                <p className="text-xs text-slate-400">Request a collection when you need to dispose recyclable or organic waste.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pickups.slice(0, 3).map((p) => (
                  <div key={p._id} className="relative group">
                    <PickupCard pickup={p} userRole="RESIDENT" />
                    {p.status === 'PENDING' && (
                      <button
                        onClick={() => handleCancelPickup(p._id)}
                        className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
                        title="Cancel Request"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* SCHEDULE PICKUP FORM */}
      {activeTab === 'schedule' && (
        <div className="max-w-2xl mx-auto space-y-6 text-left">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Schedule New Waste Collection</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Specify waste type, scheduled date, pickup window, and address instructions.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-md">
            <form onSubmit={handleCreatePickupSubmit} className="space-y-6">
              
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Waste Classification *
                </label>
                <select
                  value={formData.wasteType}
                  onChange={(e) => setFormData({ ...formData, wasteType: e.target.value })}
                  className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-green-500 transition-colors"
                >
                  <option value="RECYCLABLE">♻️ Recyclables (Paper, Plastics, Metal Cans)</option>
                  <option value="ORGANIC">🌱 Organic / Garden Waste</option>
                  <option value="GENERAL">🗑️ General Household Waste</option>
                  <option value="BULK">📦 Bulk Furniture / Heavy Appliances</option>
                  <option value="HAZARDOUS">⚠️ Hazardous Chemicals / E-waste</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Date of Pickup *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-green-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Preferred Time Window *
                  </label>
                  <select
                    value={formData.timeSlot}
                    onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-green-500 transition-colors"
                  >
                    <option value="MORNING (8AM - 12PM)">MORNING (8AM - 12PM)</option>
                    <option value="AFTERNOON (12PM - 4PM)">AFTERNOON (12PM - 4PM)</option>
                    <option value="EVENING (4PM - 7PM)">EVENING (4PM - 7PM)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Pickup Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Street address (e.g. 123 Main Street)"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-green-500 mb-2.5 transition-colors"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="City (e.g. Jos)"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="py-2 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-green-500 transition-colors"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Postal Code (e.g. 930001)"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="py-2 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-green-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Special Notes / Gate Codes
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="E.g., waste bin placed near driveway gate."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    <span>Confirm & Schedule Request</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* REQUESTS HISTORY SUB-VIEW */}
      {activeTab === 'requests' && (
        <div className="space-y-6 text-left">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">Your Pickup Requests</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Review status updates and track collector assignments.</p>
            </div>
            <button
              onClick={fetchPickups}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title="Refresh queue"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500 text-sm">Synchronizing your history...</div>
          ) : pickups.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
              <Trash2 className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">No requests found</h3>
              <button 
                onClick={() => setActiveTab('schedule')}
                className="mt-3 text-xs bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl font-bold transition-all"
              >
                Schedule New Request
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pickups.map((p) => (
                <div key={p._id} className="relative group">
                  <PickupCard pickup={p} userRole="RESIDENT" />
                  {p.status === 'PENDING' && (
                    <button
                      onClick={() => handleCancelPickup(p._id)}
                      className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
                      title="Cancel Request"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* NOTIFICATIONS TIMELINE SUB-VIEW */}
      {activeTab === 'notifications' && (
        <div className="max-w-2xl mx-auto space-y-6 text-left">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">Notifications & Alerts</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Review alerts, updates, and schedule assignments.</p>
            </div>
            {notifications.some(n => !n.isRead) && (
              <button
                onClick={handleMarkAllNotificationsRead}
                className="px-4 py-2.5 rounded-2xl bg-green-600 hover:bg-green-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <CheckCheck className="w-4 h-4" /> Mark All as Read
              </button>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">No notifications yet</div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    onClick={() => handleMarkNotificationRead(n._id)}
                    className={`py-4 flex gap-4 cursor-pointer transition-colors p-3 rounded-2xl ${n.isRead ? 'opacity-70 hover:bg-slate-50 dark:hover:bg-slate-850' : 'bg-green-50/50 dark:bg-green-950/20 hover:bg-green-50 dark:hover:bg-green-950/30'}`}
                  >
                    <div className="w-9 h-9 shrink-0 rounded-full bg-green-100 dark:bg-green-950/40 border border-green-200 dark:border-green-800 flex items-center justify-center text-green-600 dark:text-green-400">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm ${n.isRead ? 'text-slate-700 dark:text-slate-300 font-normal' : 'text-slate-900 dark:text-white font-bold'}`}>
                          {n.message}
                        </p>
                        {!n.isRead && (
                          <span className="bg-green-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0">NEW</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold">
                        {new Date(n.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* PROFILE SUB-VIEW */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl mx-auto space-y-6 text-left">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Your Profile & Avatar</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Update your personal details, collection address, and profile picture.</p>
          </div>
          <ProfileEditor />
        </div>
      )}

      {/* SETTINGS SUB-VIEW */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl mx-auto space-y-6 text-left">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Account Settings</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Configure your notification limits and credentials.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">Portal Preferences</h3>
              
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Push Notifications</div>
                  <p className="text-[10px] text-slate-400">Receive browser alerts for scheduled pickups.</p>
                </div>
                <input type="checkbox" defaultChecked className="accent-green-600 w-4 h-4" />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">SMS Alerts</div>
                  <p className="text-[10px] text-slate-400">Receive text notifications on pickup arrival.</p>
                </div>
                <input type="checkbox" defaultChecked className="accent-green-600 w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
