import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { Camera, User, Phone, MapPin, Save, AlertCircle, Sparkles, Truck, Shield } from 'lucide-react';

export default function ProfileEditor() {
  const { user, token, login } = useAuth();

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    postalCode: user?.address?.postalCode || '',
    avatar: user?.avatar || '',
    vehicleType: user?.vehicleType || '',
    vehicleNumber: user?.vehicleNumber || '',
    assignedArea: user?.assignedArea || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Compress & resize avatar image using HTML5 Canvas
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (event) => {
      img.src = event.target.result;
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 300;
      const MAX_HEIGHT = 300;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setProfileData((prev) => ({ ...prev, avatar: compressedDataUrl }));
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const payload = {
        name: profileData.name,
        phone: profileData.phone,
        avatar: profileData.avatar,
        address: {
          street: profileData.street,
          city: profileData.city,
          postalCode: profileData.postalCode,
        },
      };

      if (user?.role === 'COLLECTOR') {
        payload.vehicleType = profileData.vehicleType;
        payload.vehicleNumber = profileData.vehicleNumber;
        payload.assignedArea = profileData.assignedArea;
      }

      const res = await apiRequest('/auth/profile', 'PUT', payload, token);
      if (res.user) {
        login(res.user, token);
        setSuccess('Profile details and picture updated successfully!');
        setTimeout(() => setSuccess(''), 4000);
      }
    } catch (err) {
      if (err.message && err.message.includes('404')) {
        setError('The new backend profile service is pending deployment. Please push your changes to GitHub (git push origin main) to update your Render server.');
      } else {
        setError(err.message || 'Failed to update profile.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full py-2.5 px-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-green-500 transition-colors';
  const labelClass =
    'block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm text-left">
      <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
        
        {/* Profile Picture Avatar Container */}
        <div className="relative group shrink-0">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 border-2 border-green-500/30 flex items-center justify-center font-bold text-3xl shadow-md">
            {profileData.avatar ? (
              <img src={profileData.avatar} alt={profileData.name} className="w-full h-full object-cover" />
            ) : (
              <span>{user?.name?.slice(0, 2).toUpperCase() || 'US'}</span>
            )}
          </div>

          <label 
            htmlFor="avatar-upload" 
            className="absolute bottom-0 right-0 bg-green-600 hover:bg-green-500 text-white p-2 rounded-full cursor-pointer shadow-lg transition-transform hover:scale-110"
            title="Upload Profile Picture"
          >
            <Camera className="w-4 h-4" />
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        </div>

        <div className="text-center sm:text-left space-y-1">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{user?.name}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
          <div className="pt-1 flex items-center justify-center sm:justify-start gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] bg-green-500/10 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
              {user?.role === 'ADMIN' && <Shield className="w-3 h-3 text-purple-500" />}
              {user?.role === 'COLLECTOR' && <Truck className="w-3 h-3 text-blue-500" />}
              {user?.role === 'RESIDENT' && <User className="w-3 h-3 text-green-600" />}
              <span>{user?.role} ACCOUNT</span>
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className={`${inputClass} pl-9`}
                placeholder="+2348012345678"
              />
            </div>
          </div>
        </div>

        {/* Address Fields */}
        <div className="space-y-2">
          <label className={labelClass}>Pickup & Service Address</label>
          <div className="relative mb-2">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={profileData.street}
              onChange={(e) => setProfileData({ ...profileData, street: e.target.value })}
              placeholder="Street (e.g. 123 Main Street)"
              className={`${inputClass} pl-9`}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              required
              value={profileData.city}
              onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
              placeholder="City (e.g. Jos)"
              className={inputClass}
            />
            <input
              type="text"
              required
              value={profileData.postalCode}
              onChange={(e) => setProfileData({ ...profileData, postalCode: e.target.value })}
              placeholder="Postal Code (e.g. 930001)"
              className={inputClass}
            />
          </div>
        </div>

        {/* Collector Specific Fields */}
        {user?.role === 'COLLECTOR' && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Collector Vehicle & Route Details</span>
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Vehicle Type</label>
                <input
                  type="text"
                  value={profileData.vehicleType}
                  onChange={(e) => setProfileData({ ...profileData, vehicleType: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Vehicle Number</label>
                <input
                  type="text"
                  value={profileData.vehicleNumber}
                  onChange={(e) => setProfileData({ ...profileData, vehicleNumber: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Assigned Zone</label>
                <input
                  type="text"
                  value={profileData.assignedArea}
                  onChange={(e) => setProfileData({ ...profileData, assignedArea: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-5 rounded-2xl bg-green-600 hover:bg-green-500 text-white font-bold text-sm shadow-lg shadow-green-600/20 transition-all flex items-center justify-center gap-2 mt-4"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Saving Profile...' : 'Save Profile Changes'}</span>
        </button>
      </form>
    </div>
  );
}
