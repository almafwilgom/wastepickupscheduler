import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import PickupCard from '../components/PickupCard';
import { 
  Truck, RefreshCw, CheckCircle2, Clock, MapPin, 
  Sparkles, Leaf, Calendar, ArrowRight, User, Phone, Lock, AlertCircle, KeyRound, Shield
} from 'lucide-react';

export default function CollectorDashboard() {
  const { user, token, login } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successToast, setSuccessToast] = useState('');

  // Password Change Modal State (Phase 7 requirement)
  const [mustChangePass, setMustChangePass] = useState(user?.mustChangePassword || false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [submittingPass, setSubmittingPass] = useState(false);

  const fetchAssignedRoute = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/pickups/assigned', 'GET', null, token);
      setPickups(res.pickups || []);
    } catch (err) {
      console.error('Error loading collector route:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedRoute();
  }, []);

  const handleStatusChange = async (pickupId, newStatus) => {
    try {
      let endpoint = `/pickups/${pickupId}/status`;
      if (newStatus === 'ACCEPTED') endpoint = `/pickups/${pickupId}/accept`;
      if (newStatus === 'ON_THE_WAY') endpoint = `/pickups/${pickupId}/on-the-way`;
      if (newStatus === 'COLLECTED') endpoint = `/pickups/${pickupId}/collected`;
      if (newStatus === 'COMPLETED') endpoint = `/pickups/${pickupId}/completed`;

      const method = endpoint === `/pickups/${pickupId}/status` ? 'PUT' : 'PATCH';

      const res = await apiRequest(endpoint, method, { status: newStatus }, token);
      
      const toastMsg = res.message || `Pickup status updated to ${newStatus.replace('_', ' ')}`;
      setSuccessToast(toastMsg);
      fetchAssignedRoute();
      setTimeout(() => setSuccessToast(''), 5000);
    } catch (err) {
      alert(`Failed to update pickup status: ${err.message}`);
    }
  };

  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    setPassError('');

    if (newPassword.length < 6) {
      setPassError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('Passwords do not match.');
      return;
    }

    setSubmittingPass(true);
    try {
      const res = await apiRequest('/auth/change-password', 'POST', { newPassword }, token);
      setSuccessToast('Password updated successfully! Welcome to your collector console.');
      setMustChangePass(false);
      // Update local user object
      if (user) {
        login({ ...user, mustChangePassword: false }, token);
      }
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err) {
      setPassError(err.message || 'Failed to update password.');
    } finally {
      setSubmittingPass(false);
    }
  };

  // Metrics (Phase 8 requirement)
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysPickupsCount = pickups.filter(p => new Date(p.scheduledDate).toISOString().split('T')[0] === todayStr).length;
  const pendingAssignedCount = pickups.filter(p => p.status === 'ASSIGNED' || p.status === 'PENDING').length;
  const activeRouteCount = pickups.filter(p => p.status === 'ACCEPTED' || p.status === 'SCHEDULED' || p.status === 'ON_THE_WAY' || p.status === 'IN_PROGRESS').length;
  const completedCount = pickups.filter(p => p.status === 'COMPLETED' || p.status === 'COLLECTED').length;

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-green-600 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 animate-slide-in">
          <Sparkles className="w-5 h-5 text-green-200" />
          <span className="font-semibold text-sm">{successToast}</span>
        </div>
      )}

      {/* FORCED FIRST-LOGIN PASSWORD CHANGE MODAL (Phase 7) */}
      {mustChangePass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-left animate-slide-in">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mx-auto mb-3">
                <KeyRound className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Set Your Permanent Password</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                You logged in with a temporary password created by Admin. Please create a new password to access your collector route dashboard.
              </p>
            </div>

            {passError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Enter new password (min 6 chars)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-200 text-xs focus:outline-none focus:border-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-200 text-xs focus:outline-none focus:border-green-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingPass}
                className="w-full py-3 px-4 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-xs shadow-lg shadow-green-600/20 transition-all mt-2"
              >
                {submittingPass ? 'Updating Password...' : 'Save New Password & Access Dashboard'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* OVERVIEW SUB-VIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8 text-left">
          
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm transition-all duration-300">
            <div className="text-left">
              <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">
                Driver Console: <span className="text-green-600 dark:text-green-400">{user?.name}</span> 🚛
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Your assigned route manifest is ready. Review details, click "On The Way" to trigger resident SMS, and mark stops collected.
              </p>
              {user?.vehicleNumber && (
                <div className="mt-2 text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                  Vehicle: <span className="text-slate-800 dark:text-slate-200">{user?.vehicleType || 'Truck'} ({user?.vehicleNumber})</span>
                </div>
              )}
            </div>
            
            <button
              onClick={fetchAssignedRoute}
              className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 shadow-sm transition-all flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync Assigned Stops</span>
            </button>
          </div>

          {/* Quick Metrics (Phase 8 Dashboard Statistics) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl flex items-center gap-3.5 shadow-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">{todaysPickupsCount}</div>
                <div className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Pickups</div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl flex items-center gap-3.5 shadow-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">{pendingAssignedCount}</div>
                <div className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Pickups</div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl flex items-center gap-3.5 shadow-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">{activeRouteCount}</div>
                <div className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Upcoming Routes</div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl flex items-center gap-3.5 shadow-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">{completedCount}</div>
                <div className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Pickups</div>
              </div>
            </div>
          </div>

          {/* Route Manifest Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-850 dark:text-white">Assigned Shift Manifest Stops</h3>
              <button 
                onClick={() => setActiveTab('requests')}
                className="text-xs font-bold text-green-700 dark:text-green-400 hover:underline flex items-center gap-1"
              >
                <span>Open full route manifest</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-500">Syncing manifest...</div>
            ) : pickups.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center space-y-2">
                <Truck className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="font-bold text-sm">No pickup stops assigned</h4>
                <p className="text-xs text-slate-400">All routes cleared. You will receive system notifications when new stops are assigned by Admin dispatchers.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pickups.slice(0, 3).map((p) => (
                  <PickupCard
                    key={p._id}
                    pickup={p}
                    userRole="COLLECTOR"
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* REQUESTS (ROUTE MANIFEST) SUB-VIEW */}
      {activeTab === 'requests' && (
        <div className="space-y-6 text-left">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">Route Manifest Stops</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Review address locations, resident phone contacts, and perform route updates.</p>
            </div>
            <button
              onClick={fetchAssignedRoute}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500 text-sm">Syncing route queues...</div>
          ) : pickups.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
              <Truck className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-lg font-bold text-slate-850 dark:text-white">All Clear</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">No scheduled route stops assigned to your driver ID today.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pickups.map((p) => (
                <PickupCard
                  key={p._id}
                  pickup={p}
                  userRole="COLLECTOR"
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* NOTIFICATIONS TIMELINE SUB-VIEW */}
      {activeTab === 'notifications' && (
        <div className="max-w-2xl mx-auto space-y-6 text-left">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Dispatch Alerts</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Timeline of route modifications and dispatch assignments.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              <div className="py-4 flex gap-4">
                <div className="w-9 h-9 shrink-0 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600">
                  <Truck className="w-4.5 h-4.5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">Route synchronized. Collector shift active.</p>
                  <div className="text-[10px] text-slate-400 font-bold">Today</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE SUB-VIEW */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl mx-auto space-y-6 text-left">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Driver Profile</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Your registered collector credentials.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-5 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center font-bold text-2xl">
                {user?.name?.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h3>
                <span className="text-xs bg-blue-500/10 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">{user?.role}</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email address</span>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user?.email}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone contact</span>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user?.phone || 'No phone'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vehicle Details</span>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user?.vehicleType || 'Truck'} ({user?.vehicleNumber || 'No plate'})</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assigned Zone</span>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user?.assignedArea || 'General Municipal Zone'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS SUB-VIEW */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl mx-auto space-y-6 text-left">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Collector Preferences</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Configure your route notifications settings.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">SMS Route Updates</div>
                  <p className="text-[10px] text-slate-400">Receive sms updates for newly assigned dispatch routes.</p>
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
