import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import PickupCard from '../components/PickupCard';
import ProfileEditor from '../components/ProfileEditor';
import { 
  ShieldCheck, Users, Truck, RefreshCw, Layers, 
  CheckCircle2, Clock, Sparkles, User, Settings, ArrowRight,
  ListFilter, Plus, Edit2, Power, UserPlus, X, AlertCircle, Check, MapPin, Phone
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [pickups, setPickups] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [successToast, setSuccessToast] = useState('');

  // Add Collector Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [collectorForm, setCollectorForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    vehicleType: 'Waste Collection Truck',
    vehicleNumber: '',
    assignedArea: '',
  });
  const [modalError, setModalError] = useState('');
  const [submittingCollector, setSubmittingCollector] = useState(false);

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

  const handleCreateCollectorSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setSubmittingCollector(true);
    try {
      await apiRequest('/auth/collectors', 'POST', collectorForm, token);
      setSuccessToast(`Collector account created for ${collectorForm.name}!`);
      setIsAddModalOpen(false);
      setCollectorForm({
        name: '',
        email: '',
        password: '',
        phone: '',
        vehicleType: 'Waste Collection Truck',
        vehicleNumber: '',
        assignedArea: '',
      });
      fetchData();
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err) {
      setModalError(err.message || 'Failed to create collector.');
    } finally {
      setSubmittingCollector(false);
    }
  };

  const handleToggleCollectorAvailability = async (collectorId, newStatus) => {
    try {
      await apiRequest(`/auth/collectors/${collectorId}`, 'PATCH', { availabilityStatus: newStatus }, token);
      setSuccessToast(`Collector status updated to ${newStatus}`);
      fetchData();
      setTimeout(() => setSuccessToast(''), 3000);
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const handleCancelPickup = async (pickupId) => {
    try {
      const res = await apiRequest(`/pickups/${pickupId}/cancel`, 'PUT', null, token);
      setSuccessToast(res.message || 'Pickup request cancelled successfully');
      fetchData();
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err) {
      alert(`Failed to cancel pickup: ${err.message}`);
    }
  };

  const handleToggleCollectorActive = async (collectorId, currentActive) => {
    try {
      await apiRequest(`/auth/collectors/${collectorId}`, 'PATCH', { isActive: !currentActive }, token);
      setSuccessToast(`Collector ${!currentActive ? 'activated' : 'deactivated'}`);
      fetchData();
      setTimeout(() => setSuccessToast(''), 3000);
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const filteredPickups = filterStatus === 'ALL'
    ? pickups
    : pickups.filter((p) => p.status === filterStatus);

  const pendingCount = pickups.filter((p) => p.status === 'PENDING').length;
  const assignedCount = pickups.filter((p) => p.status === 'ASSIGNED' || p.status === 'ACCEPTED').length;
  const activeRouteCount = pickups.filter((p) => p.status === 'SCHEDULED' || p.status === 'IN_PROGRESS' || p.status === 'ON_THE_WAY').length;
  const completedCount = pickups.filter((p) => p.status === 'COMPLETED').length;

  const inputClass =
    'w-full py-2 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-green-500 transition-colors';
  const labelClass =
    'block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1';

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
                <ShieldCheck className="w-3.5 h-3.5" /> Dispatch Operations Console
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                Waste Pickup Scheduler
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Monitor metrics, manage collectors, and assign route stops to active collectors.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => { setActiveTab('collectors'); setIsAddModalOpen(true); }}
                className="px-4 py-2.5 rounded-2xl bg-green-600 hover:bg-green-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Collector</span>
              </button>

              <button
                onClick={fetchData}
                className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 shadow-sm transition-all flex items-center gap-2 shrink-0"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Queues</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-black text-slate-800 dark:text-white">{pendingCount}</div>
                <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Unassigned Requests</div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Truck className="w-6 h-6 animate-pulse" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-black text-slate-800 dark:text-white">{activeRouteCount + assignedCount}</div>
                <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Active Pickup Routes</div>
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
                <Users className="w-6 h-6" />
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

      {/* COLLECTORS MANAGEMENT SUB-VIEW (Phase 4 & Phase 5 & Phase 18) */}
      {activeTab === 'collectors' && (
        <div className="space-y-6 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">Collector Management</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage driver accounts, vehicle assignments, availability, and active routes.</p>
            </div>
            
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-green-600 hover:bg-green-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Collector</span>
            </button>
          </div>

          {/* Collectors Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Collector Driver</th>
                    <th className="py-3.5 px-4">Contact Info</th>
                    <th className="py-3.5 px-4">Vehicle Details</th>
                    <th className="py-3.5 px-4">Assigned Area</th>
                    <th className="py-3.5 px-4">Availability</th>
                    <th className="py-3.5 px-4">Assigned Stops</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                  {collectors.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-slate-400">
                        No collectors created yet. Click <strong>+ Add Collector</strong> above to create your first collector driver.
                      </td>
                    </tr>
                  ) : (
                    collectors.map((c) => {
                      const assignedCount = pickups.filter(p => p.collector?._id === c._id && p.status !== 'COMPLETED' && p.status !== 'CANCELLED').length;
                      return (
                        <tr key={c._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition-colors">
                          <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-600 font-bold flex items-center justify-center">
                                {c.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white">{c.name}</div>
                                {c.mustChangePassword && (
                                  <span className="text-[9px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-1.5 py-0.5 rounded">
                                    Temp Password
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-slate-800 dark:text-slate-200 font-medium">{c.email}</div>
                            <div className="text-slate-400 text-[11px]">{c.phone || 'No phone'}</div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-semibold text-slate-800 dark:text-slate-200">{c.vehicleType || 'Collection Truck'}</div>
                            <div className="text-slate-400 font-mono text-[11px]">{c.vehicleNumber || 'Unregistered'}</div>
                          </td>
                          <td className="py-4 px-4 text-slate-700 dark:text-slate-300 font-medium">
                            {c.assignedArea || 'Municipal Sector'}
                          </td>
                          <td className="py-4 px-4">
                            <select
                              value={c.availabilityStatus || 'AVAILABLE'}
                              onChange={(e) => handleToggleCollectorAvailability(c._id, e.target.value)}
                              className="text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200 font-semibold"
                            >
                              <option value="AVAILABLE">AVAILABLE</option>
                              <option value="BUSY">BUSY</option>
                              <option value="OFF_DUTY">OFF DUTY</option>
                            </select>
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                              {assignedCount} active stop{assignedCount === 1 ? '' : 's'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <button
                              onClick={() => handleToggleCollectorActive(c._id, c.isActive !== false)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                c.isActive !== false
                                  ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100'
                                  : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100'
                              }`}
                            >
                              {c.isActive !== false ? 'Deactivate' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ADD COLLECTOR MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 text-left animate-slide-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-green-600" /> + Add Collector Account
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {modalError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCollectorSubmit} className="mt-4 space-y-4">
              <div>
                <label className={labelClass}>Collector Name *</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={collectorForm.name}
                  onChange={(e) => setCollectorForm({ ...collectorForm, name: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="john@collector.com"
                    value={collectorForm.email}
                    onChange={(e) => setCollectorForm({ ...collectorForm, email: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+23480..."
                    value={collectorForm.phone}
                    onChange={(e) => setCollectorForm({ ...collectorForm, phone: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Temporary Password *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={collectorForm.password}
                  onChange={(e) => setCollectorForm({ ...collectorForm, password: e.target.value })}
                  className={inputClass}
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Collector will be forced to change this password on first login.</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Vehicle Type</label>
                  <input
                    type="text"
                    placeholder="Waste Truck"
                    value={collectorForm.vehicleType}
                    onChange={(e) => setCollectorForm({ ...collectorForm, vehicleType: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Vehicle Number</label>
                  <input
                    type="text"
                    placeholder="PLT-123-AB"
                    value={collectorForm.vehicleNumber}
                    onChange={(e) => setCollectorForm({ ...collectorForm, vehicleNumber: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Assigned Zone / Area</label>
                <input
                  type="text"
                  placeholder="Jos South"
                  value={collectorForm.assignedArea}
                  onChange={(e) => setCollectorForm({ ...collectorForm, assignedArea: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCollector}
                  className="px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
                >
                  {submittingCollector ? 'Creating...' : 'Create Collector'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DISPATCH QUEUE MANIFEST SUB-VIEW */}
      {activeTab === 'requests' && (
        <div className="space-y-6 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">Dispatch Queue Manifest</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Assign available collectors to unassigned stops.</p>
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
            {['ALL', 'PENDING', 'ASSIGNED', 'ACCEPTED', 'SCHEDULED', 'ON_THE_WAY', 'COLLECTED', 'COMPLETED', 'CANCELLED'].map((st) => (
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
                  onCancel={handleCancelPickup}
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
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Admin Logs</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Timeline of route modifications and collector activities.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              <div className="py-4 flex gap-4">
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
        <div className="max-w-2xl mx-auto space-y-6 text-left">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Admin Dispatcher Profile</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Update your dispatcher contact details and profile picture.</p>
          </div>
          <ProfileEditor />
        </div>
      )}

      {/* SETTINGS SUB-VIEW */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl mx-auto space-y-6 text-left">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Admin Settings</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Configure dispatcher alert configurations.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
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
