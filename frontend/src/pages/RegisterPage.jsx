import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { UserPlus, Mail, Lock, User, Phone, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage({ setCurrentTab }) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    street: '',
    city: '',
    postalCode: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: { street: formData.street, city: formData.city, postalCode: formData.postalCode },
      };
      const res = await apiRequest('/auth/register', 'POST', payload);
      login(res.user, res.token);
      setCurrentTab('dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-200 text-sm focus:outline-none focus:border-eco-500 transition-colors';
  const labelClass =
    'block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5';

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg glass-card p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl transition-all duration-300">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-eco-500/10 border border-eco-500/20 flex items-center justify-center text-eco-500 dark:text-eco-400 mx-auto mb-3">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Create Your Account</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Join the municipal waste management platform</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name & Email */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Jane Doe"
                  className={`${inputClass} pl-9 pr-3`}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="jane@example.com"
                  className={`${inputClass} pl-9 pr-3`}
                />
              </div>
            </div>
          </div>

          {/* Password & Phone */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className={`${inputClass} pl-9 pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className={labelClass}>Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 019-2834"
                  className={`${inputClass} pl-9 pr-3`}
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className={labelClass}>Pickup Address (Street, City, Zip)</label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="123 Eco Way"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                className={`col-span-1 px-3 ${inputClass}`}
              />
              <input
                type="text"
                placeholder="Greenfield"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className={`col-span-1 px-3 ${inputClass}`}
              />
              <input
                type="text"
                placeholder="90210"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                className={`col-span-1 px-3 ${inputClass}`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-eco-500 hover:bg-eco-400 text-slate-950 font-bold text-sm shadow-lg shadow-eco-500/20 transition-all mt-4"
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Already registered?{' '}
          <button
            onClick={() => setCurrentTab('login')}
            className="text-eco-600 dark:text-eco-400 hover:underline font-semibold"
          >
            Sign In Here
          </button>
        </div>
      </div>
    </div>
  );
}
