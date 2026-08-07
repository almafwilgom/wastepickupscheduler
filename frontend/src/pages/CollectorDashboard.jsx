import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import PickupCard from '../components/PickupCard';
import { 
  Truck, RefreshCw, CheckCircle2, Clock, MapPin, 
  Sparkles, Leaf, Calendar, ArrowRight, User, Phone
} from 'lucide-react';

export default function CollectorDashboard() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successToast, setSuccessToast] = useState('');

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
      await apiRequest(`/pickups/${pickupId}/status`, 'PUT', { status: newStatus }, token);
      setSuccessToast(`Stop marked as ${newStatus.replace('_', ' ')}!`);
      fetchAssignedRoute();
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const activeRouteCount = pickups.filter((p) => p.status === 'SCHEDULED' || p.status === 'IN_PROGRESS').length;
  const completedCount = pickups.filter((p) => p.status === 'COMPLETED').length;

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
                Driver Console: <span className="text-green-600 dark:text-green-400">{user?.name}</span> 🚛
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Your assigned route manifest for today is ready. Start routes and update stops.
              </p>
            </div>
            
            <button
              onClick={fetchAssignedRoute}
              className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 shadow-sm transition-all flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync Assigned Stops</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-black text-slate-800 dark:text-white">{activeRouteCount}</div>
                <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Active Route Stops</div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-black text-slate-800 dark:text-white">{completedCount}</div>
                <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Completed Stops</div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-black text-slate-800 dark:text-white">{pickups.length}</div>
                <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Route Stops</div>
              </div>
            </div>
          </div>

          {/* Quick Route Manifest View */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-850 dark:text-white">Assigned Shift Manifest Stops</h3>
              <button 
                onClick={() => setActiveTab('requests')}
                className="text-xs font-bold text-green-700 dark:text-green-400 hover:underline flex items-center gap-1"
              >
                <span>Open route manifest</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-500">Syncing manifest...</div>
            ) : pickups.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center space-y-2">
                <Truck className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="font-bold text-sm">No pickup stops assigned</h4>
                <p className="text-xs text-slate-400">All routes cleared. You will receive system notifications when new stops are assigned.</p>
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
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">Route Manifest Stops</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Review map route addresses, driver notes, and toggle statuses.</p>
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
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-left">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Dispatch Alerts</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Timeline of route modifications and dispatch assignments.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              <div className="py-4 flex gap-4 text-left">
                <div className="w-9 h-9 shrink-0 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600">
                  <Truck className="w-4.5 h-4.5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">Route synchronized. Shift active.</p>
                  <div className="text-[10px] text-slate-400 font-bold">Today</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE SUB-VIEW */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-left">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Driver Profile</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Your registered collector credentials.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-5 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="w-16 h-16 rounded-full bg-blue-105 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center font-bold text-2xl">
                {user?.name?.slice(0, 2).toUpperCase()}
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h3>
                <span className="text-xs bg-blue-500/10 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">{user?.role}</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email address</span>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user?.email}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone contact</span>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user?.phone || 'No phone'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS SUB-VIEW */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-left">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Collector Preferences</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Configure your route notifications settings.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm text-left">
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
