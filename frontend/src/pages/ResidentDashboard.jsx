import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import PickupCard from '../components/PickupCard';
import { 
  Calendar, RefreshCw, CheckCircle2, Clock, Trash2, 
  Sparkles, Leaf, PlusCircle, ArrowRight, User, Phone, MapPin, 
  ShieldAlert, Settings, Bell, Circle
} from 'lucide-react';

export default function ResidentDashboard() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [pickups, setPickups] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
      setError('Failed to load your pickup history.');
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
          street: formData.street || user?.address?.street || '123 Main St',
          city: formData.city || user?.address?.city || 'Greenfield',
          postalCode: formData.postalCode || user?.address?.postalCode || '90210',
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
      await apiRequest(`/pickups/${pickupId}/status`, 'PUT', { status: 'CANCELLED' }, token);
      setSuccessToast('Pickup cancelled successfully.');
      fetchPickups();
      fetchNotifications();
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err) {
      alert(`Failed to cancel: ${err.message}`);
    }
  };

  const pendingCount = pickups.filter((p) => p.status === 'PENDING').length;
  const scheduledCount = pickups.filter((p) => p.status === 'SCHEDULED' || p.status === 'IN_PROGRESS').length;
  const completedCount = pickups.filter((p) => p.status === 'COMPLETED').length;

  // Simple simulated recycling score calculation (e.g. completed recyclable pickups * 15 points)
  const completedRecyclable = pickups.filter(p => p.status === 'COMPLETED' && p.wasteType === 'RECYCLABLE').length;
  const recyclingScore = Math.min(100, 25 + completedRecyclable * 15);

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
        <div className="space-y-8">
          
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm transition-all duration-300">
            <div className="text-left">
              <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">
                Welcome back, <span className="text-green-600 dark:text-green-400">{user?.name}</span>! 👋
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Your residential profile is active. Check collection updates and schedule requests.
              </p>
            </div>
            
            <button
              onClick={() => setActiveTab('schedule')}
              className="px-5 py-3 rounded-2xl bg-green-700 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Schedule New Pickup</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Metric 1 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-black text-slate-800 dark:text-white">{scheduledCount}</div>
                <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Scheduled Routes</div>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-black text-slate-800 dark:text-white">{pendingCount}</div>
                <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Pending Requests</div>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-black text-slate-800 dark:text-white">{completedCount}</div>
                <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Completed Stops</div>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400 flex items-center justify-center">
                <Leaf className="w-6 h-6 animate-bounce" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-black text-slate-800 dark:text-white">{recyclingScore}%</div>
                <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Eco Score</div>
              </div>
            </div>
          </div>

          {/* Activity Chart & Quick actions */}
          <div className="grid lg:grid-cols-12 gap-6">
            
            {/* Chart Area */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm text-left">
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-6">Simulated Monthly Recycling Activity</h3>
              
              {/* Custom SVG Bar Chart */}
              <div className="h-48 flex items-end justify-between gap-4 pt-4 border-b border-slate-100 dark:border-slate-800">
                {[
                  { month: 'Jan', val: 30 },
                  { month: 'Feb', val: 45 },
                  { month: 'Mar', val: 20 },
                  { month: 'Apr', val: 65 },
                  { month: 'May', val: 80 },
                  { month: 'Jun', val: 55 },
                  { month: 'Jul', val: recyclingScore },
                ].map((bar, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div 
                      style={{ height: `${bar.val}%` }}
                      className="w-full bg-green-100 hover:bg-green-500 dark:bg-green-950/40 dark:hover:bg-green-500/80 rounded-t-lg transition-all duration-300 relative"
                    >
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white px-1.5 py-0.5 rounded">
                        {bar.val}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 mt-1">{bar.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm text-left flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2">Need Assistance?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                  Access quick settings or view instructions to make waste recycling more efficient.
                </p>
              </div>

              <div className="space-y-2.5">
                <button 
                  onClick={() => setActiveTab('schedule')}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-bold">New Pickup form</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>

                <button 
                  onClick={() => setActiveTab('profile')}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-bold">Manage Profile</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

          </div>

          {/* Active pick-ups queue */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-850 dark:text-white text-left">Your Next Collection Stops</h3>
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-500">Syncing stops...</div>
            ) : pickups.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center space-y-2">
                <Leaf className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="font-bold text-sm">No scheduled pickups</h4>
                <p className="text-xs text-slate-400">All clean! Request a collection when you need to dispose recyclable or organic waste.</p>
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
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-left">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Schedule New Waste Collection</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Specify waste classification, date slot, and instructions.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-md">
            <form onSubmit={handleCreatePickupSubmit} className="space-y-6">
              
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Waste Classification
                </label>
                <select
                  value={formData.wasteType}
                  onChange={(e) => setFormData({ ...formData, wasteType: e.target.value })}
                  className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-green-500 transition-colors"
                >
                  <option value="RECYCLABLE">♻️ Recyclables (Paper, Plastics, Metal Cans)</option>
                  <option value="ORGANIC">🌱 Organic / Garden Compost Waste</option>
                  <option value="GENERAL">🗑️ General Non-Recyclable Waste</option>
                  <option value="BULK">📦 Bulk Furniture / Heavy Appliances</option>
                  <option value="HAZARDOUS">⚠️ Hazardous Chemicals / Electronics</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Date of Pickup
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
                    Preferred Time Window
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
                  Pickup Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="Street address (E.g. 123 Eco Avenue)"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-green-500 mb-2.5 transition-colors"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="py-2 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-green-500 transition-colors"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Postal Code"
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
                  placeholder="E.g., bins located near main driveway path."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-green-700 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
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
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">Your Pickup Requests</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Review status updates and route history of scheduled stops.</p>
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
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-left">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Notifications Alert Manifest</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Review alerts, updates and schedule assignments.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-slate-450 text-xs">No alerts matching notifications database</div>
              ) : (
                notifications.map((n) => (
                  <div key={n._id} className="py-4 flex gap-4 text-left">
                    <div className="w-9 h-9 shrink-0 rounded-xl bg-green-50 dark:bg-green-950/30 flex items-center justify-center text-green-600">
                      <Bell className="w-4.5 h-4.5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">{n.message}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                        <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                        {!n.isRead && (
                          <span className="bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded font-black uppercase text-[8px]">Unread</span>
                        )}
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
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-left">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Your Resident Profile</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Your registered details on the municipal portal.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-5 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 flex items-center justify-center font-bold text-2xl">
                {user?.name?.slice(0, 2).toUpperCase()}
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h3>
                <span className="text-xs bg-green-500/10 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">{user?.role}</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email address</span>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user?.email}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone contact</span>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user?.phone || 'No phone provided'}</p>
              </div>
              <div className="space-y-1 md:col-span-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Default Collection Address</span>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {user?.address?.street}, {user?.address?.city} {user?.address?.postalCode}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS SUB-VIEW */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-left">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Account Settings</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Configure your notification limits and credentials.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm text-left">
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
                <input type="checkbox" className="accent-green-600 w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
