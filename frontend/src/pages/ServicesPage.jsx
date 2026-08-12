import React from 'react';
import { 
  Recycle, Trash2, Box, Leaf, AlertTriangle, Truck, 
  Clock, ShieldCheck, ArrowRight, Sparkles, CheckCircle2, Phone 
} from 'lucide-react';

export default function ServicesPage({ setCurrentTab }) {
  const services = [
    {
      id: 'recyclable',
      title: 'Recyclables Collection',
      badge: 'Eco Friendly',
      badgeColor: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400',
      icon: Recycle,
      iconColor: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30',
      desc: 'Scheduled pickup and sorting for paper, cardboard, plastic bottles, glass containers, and metal cans. Diverted directly to municipal recycling centers.',
      features: ['Plastics & Polyethylene', 'Paper & Cardboard', 'Glass & Metal Cans', '100% Eco Diversion'],
    },
    {
      id: 'organic',
      title: 'Organic & Yard Compost Waste',
      badge: 'Green Energy',
      badgeColor: 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400',
      icon: Leaf,
      iconColor: 'text-green-600 bg-green-50 dark:bg-green-950/30',
      desc: 'Collection for kitchen food scraps, garden trimmings, tree cuttings, and compostable organic waste processed into agricultural fertilizer.',
      features: ['Garden & Lawn Trimmings', 'Kitchen Food Scraps', 'Compost Processing', 'Odor-Free Bin Guidelines'],
    },
    {
      id: 'general',
      title: 'General Household Waste',
      badge: 'Scheduled Weekly',
      badgeColor: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
      icon: Trash2,
      iconColor: 'text-slate-600 bg-slate-100 dark:bg-slate-800',
      desc: 'Reliable weekly or on-demand collection of everyday non-recyclable residential waste, ensuring clean and hygienic neighborhood environments.',
      features: ['Regular Doorstep Pickup', 'Sanitized Handling', 'Flexible Slot Windows', 'Real-Time Driver Tracking'],
    },
    {
      id: 'bulk',
      title: 'Bulk Item & Appliance Pickups',
      badge: 'On-Demand',
      badgeColor: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400',
      icon: Box,
      iconColor: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30',
      desc: 'Specialized heavy vehicle dispatch for old furniture, mattresses, renovation debris, and large home appliances that exceed standard bin capacity.',
      features: ['Furniture & Mattresses', 'Refrigerators & Washers', 'Renovation Debris', 'Heavy Loading Assistance'],
    },
    {
      id: 'hazardous',
      title: 'Hazardous & E-Waste Handling',
      badge: 'Certified Safe',
      badgeColor: 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400',
      icon: AlertTriangle,
      iconColor: 'text-rose-600 bg-rose-50 dark:bg-rose-950/30',
      desc: 'Safe and certified disposal of old computers, batteries, chemicals, electronics, fluorescent bulbs, and potentially hazardous household materials.',
      features: ['Electronics & Computers', 'Batteries & Chemicals', 'Certified Toxic Handling', 'Zero Groundwater Leaks'],
    },
    {
      id: 'dispatch',
      title: 'Municipal Fleet Dispatch Logistics',
      badge: 'Logistics Control',
      badgeColor: 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400',
      icon: Truck,
      iconColor: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30',
      desc: 'Comprehensive route management for municipal vehicle fleets, driver dispatching, status tracking, and SMS notifications for residential neighborhoods.',
      features: ['Automated Collector Routes', 'Driver Fleet Console', 'SMS Arrival Notifications', 'Real-Time Dispatch Metrics'],
    },
  ];

  return (
    <div className="relative min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300 text-left">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-green-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        
        {/* Page Header */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> Municipal Waste Services
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Comprehensive waste collection <br />
            <span className="text-green-600 dark:text-green-400">services for every need</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
            From scheduled household pickups and recycling to heavy appliance removal and live SMS tracking, explore our suite of waste management solutions.
          </p>
        </section>

        {/* Services Grid */}
        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((s) => {
            const Icon = s.icon;
            return (
              <div 
                key={s.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-7 rounded-3xl shadow-sm hover:shadow-xl hover:border-green-500/40 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${s.iconColor} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${s.badgeColor}`}>
                      {s.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    {s.title}
                  </h3>

                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                    {s.desc}
                  </p>

                  <div className="space-y-2 mb-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Key Features</div>
                    {s.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setCurrentTab && setCurrentTab('register')}
                  className="w-full py-3 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800 group-hover:bg-green-600 group-hover:text-white text-slate-800 dark:text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-2"
                >
                  <span>Schedule Collection</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </section>

        {/* How It Works Callout */}
        <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden border border-slate-800">
          <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8 space-y-4 text-left">
              <span className="text-xs font-bold text-green-400 uppercase tracking-wider">Ready to get started?</span>
              <h2 className="text-3xl sm:text-4xl font-black">Never miss a waste collection day again</h2>
              <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
                Register as a resident today to schedule pickups, track assigned collectors, and receive SMS alerts when your driver is on the way.
              </p>
            </div>

            <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col gap-3">
              <button
                onClick={() => setCurrentTab && setCurrentTab('register')}
                className="w-full py-3.5 px-6 rounded-2xl bg-green-600 hover:bg-green-500 text-white font-bold text-sm shadow-lg shadow-green-600/30 transition-all text-center"
              >
                Create Resident Account
              </button>
              <button
                onClick={() => setCurrentTab && setCurrentTab('contact')}
                className="w-full py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition-all text-center"
              >
                Contact Support
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
