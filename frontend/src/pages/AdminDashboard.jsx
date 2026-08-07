import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import PickupCard from '../components/PickupCard';
import { 
  ShieldCheck, Users, Truck, RefreshCw, Layers, 
  CheckCircle2, Clock, Sparkles, User, Settings, ArrowRight,
  ListFilter
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [pickups, setPickups] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [successToast, setSuccessToast] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pickupsRes, collectorsRes] = await Promise.all([
        apiRequest('/pickups/all', 'GET', null, token),
        apiRequest('/auth/collectors', 'GET', null, token),
      ]);
      setPickups(pickupsRes.pickups || []);
      setCollectors(collectorsRes.collectors || []);
    } catch (err) {
      console.error('Failed to load admin dispatch data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignCollector = async (pickupId, collectorId) => {
    if (!collectorId) return;
    try {
      await apiRequest(`/pickups/${pickupId}/assign`, 'PUT', { collectorId }, token);
      setSuccessToast('Collector driver assigned successfully!');
      fetchData();
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err) {
      alert(`Assignment failed: ${err.message}`);
    }
  };

  const filteredPickups = filterStatus === 'ALL'
    ? pickups
    : pickups.filter((p) => p.status === filterStatus);

  const pendingCount = pickups.filter((p) => p.status === 'PENDING').length;
  const scheduledCount = pickups.filter((p) => p.status === 'SCHEDULED' || p.status === 'IN_PROGRESS').length;
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
          
          {/* Welcome Banner */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm">
            <div className="text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 text-xs font-semibold mb-2">
                <ShieldCheck className="w-3.5 h-3.5" /> Dispatch Center Console
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                Municipal Logistics Dispatch Portal
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Monitor route metrics, assign collectors to unassigned requests, and manage municipal queues.
              </p>
            </div>

            <button
              onClick={fetchData}
              className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 shadow-sm transition-all flex items-center gap-2 shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Queues</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-black text-slate-800 dark:text-white">{pendingCount}</div>
                <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Unassigned requests</div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Truck className="w-6 h-6 animate-pulse" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-black text-slate-800 dark:text-white">{scheduledCount}</div>
                <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Active Routes</div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-black text-slate-800 dark:text-white">{completedCount}</div>
                <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Completed Pickups</div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Users className="w-6 h-6 animate-bounce" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-black text-slate-800 dark:text-white">{collectors.length}</div>
                <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Active Drivers</div>
              </div>
            </div>
          </div>

          {/* Quick Dispatch Queue List */}
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-850 dark:text-white">Active Dispatch Queue Stops</h3>
              <button 
                onClick={() => setActiveTab('requests')}
                className="text-xs font-bold text-green-700 dark:text-green-400 hover:underline flex items-center gap-1"
              >
                <span>Open dispatch manifest</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-500">Loading queues...</div>
            ) : pickups.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center space-y-2">
                <Layers className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="font-bold text-sm">All queues are clear</h4>
                <p className="text-xs text-slate-400">All collection stops are completed or cancelled.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pickups.slice(0, 3).map((p) => (
                  <PickupCard
                    key={p._id}
                    pickup={p}
                    userRole="ADMIN"
                    collectors={collectors}
                    onAssign={handleAssignCollector}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* DISPATCH QUEUE HISTORY SUB-VIEW */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">Dispatch Queue Manifest</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Filter list to assign collectors to unassigned stops.</p>
            </div>
            <button
              onClick={fetchData}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors self-end sm:self-auto"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Filters List */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-400 mr-2 flex items-center gap-1"><ListFilter className="w-3.5 h-3.5" /> Filter:</span>
            {['ALL', 'PENDING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  filterStatus === st
                    ? 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-850'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500 text-sm">Syncing dispatch queue database...</div>
          ) : filteredPickups.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
              <Layers className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-lg font-bold text-slate-850 dark:text-white">All Clear</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">No scheduled route stops found matching filter.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPickups.map((p) => (
                <PickupCard
                  key={p._id}
                  pickup={p}
                  userRole="ADMIN"
                  collectors={collectors}
                  onAssign={handleAssignCollector}
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
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Admin Logs</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Timeline of route modifications and collector activities.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              <div className="py-4 flex gap-4 text-left">
                <div className="w-9 h-9 shrink-0 rounded-xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center text-purple-600">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">Municipal dispatch console active. Ready for driver routing.</p>
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
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Dispatcher Profile</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Your registered municipal dispatcher details.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-5 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="w-16 h-16 rounded-full bg-purple-105 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800 flex items-center justify-center font-bold text-2xl">
                {user?.name?.slice(0, 2).toUpperCase()}
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h3>
                <span className="text-xs bg-purple-500/10 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">{user?.role}</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email address</span>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS SUB-VIEW */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-left">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Admin Settings</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Configure dispatcher alert configurations.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm text-left">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">System Logs Emails</div>
                  <p className="text-[10px] text-slate-400">Receive weekly compilation emails of all completed municipal collections.</p>
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
