import React, { useState } from 'react';
import { Calendar, Play, Clock, Shield, ArrowRight, Leaf, Users, Trash2, Globe, Sparkles } from 'lucide-react';

export default function LandingPage({ setCurrentTab }) {
  const [bagsRecyclables, setBagsRecyclables] = useState(4);
  const [bagsOrganic, setBagsOrganic] = useState(2);

  // Carbon and energy conversions
  const co2Saved = (bagsRecyclables * 2.4 + bagsOrganic * 1.5).toFixed(1);
  const energyGenerated = (bagsOrganic * 3.2).toFixed(1);
  const ecoPoints = (bagsRecyclables * 15 + bagsOrganic * 10);

  return (
    <div className="relative min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
      
      {/* Hero Section Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center space-y-8 flex flex-col items-center">
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 text-xs font-bold uppercase tracking-wider">
          <Leaf className="w-4 h-4 text-green-600 dark:text-green-500" /> Clean Today, Green Tomorrow
        </div>
        
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          Smart Waste Pickup <br />
          <span className="text-green-700 dark:text-green-400">for a Cleaner Tomorrow</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
          Schedule your waste pickups easily, get real-time updates, and help keep our community clean and green.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => setCurrentTab('login')}
            className="px-6 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 hover:border-slate-300 dark:hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            <span>How It Works</span>
            <Play className="w-4 h-4 fill-current" />
          </button>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-slate-600 dark:text-slate-400 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="font-semibold">Easy Scheduling</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="font-semibold">Real-time Updates</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="font-semibold">Eco-Friendly</span>
          </div>
        </div>

      </div>

        {/* Four Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-20">
          {[
            {
              title: 'Real-time Updates',
              desc: 'Get notified about your upcoming and completed pickups.',
              icon: Clock,
            },
            {
              title: 'Track Collection',
              desc: 'Track your waste collection status in real-time.',
              icon: Shield,
            },
            {
              title: 'Eco Friendly',
              desc: 'We promote recycling and proper waste management.',
              icon: Leaf,
            },
          ].map((card, i) => (
            <div
              key={i}
              className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 p-6 rounded-2xl space-y-4 hover:shadow-lg transition-all duration-300 group text-left"
            >
              <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-950/30 flex items-center justify-center text-green-700 dark:text-green-400">
                <card.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">{card.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{card.desc}</p>
              <button
                onClick={() => setCurrentTab('register')}
                className="text-xs font-bold text-green-700 dark:text-green-400 hover:text-green-600 flex items-center gap-1 group-hover:translate-x-1 transition-all"
              >
                <span>Learn More</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Interactive Feature: Recycling Eco Savings Calculator */}
        <div className="mt-20 bg-slate-50 dark:bg-slate-800/20 border border-slate-200/60 dark:border-slate-700/60 p-6 sm:p-10 rounded-3xl text-left space-y-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-green-600" /> Interactive Eco Tool
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Estimate Your Weekly Environmental Savings</h2>
            <p className="text-sm text-slate-550 dark:text-slate-400 max-w-2xl leading-relaxed">
              Drag the sliders below to specify your estimated weekly waste bags and see how much carbon dioxide emission you divert and how many energy equivalents you generate.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Inputs */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Weekly Recyclable Bags</span>
                  <span className="font-mono font-black text-green-600 dark:text-green-400">{bagsRecyclables} Bags</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="15" 
                  value={bagsRecyclables} 
                  onChange={(e) => setBagsRecyclables(parseInt(e.target.value))}
                  className="w-full accent-green-600 cursor-pointer"
                />
                <p className="text-[10px] text-slate-450 dark:text-slate-500">Includes: Plastics, aluminum beverage cans, papers, cardboard packaging.</p>
              </div>

              <div className="space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Weekly Organic / Compost Bags</span>
                  <span className="font-mono font-black text-green-600 dark:text-green-400">{bagsOrganic} Bags</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="15" 
                  value={bagsOrganic} 
                  onChange={(e) => setBagsOrganic(parseInt(e.target.value))}
                  className="w-full accent-green-600 cursor-pointer"
                />
                <p className="text-[10px] text-slate-450 dark:text-slate-500">Includes: Food waste scrap, yard trimmings, leaves, organic mulch materials.</p>
              </div>
            </div>

            {/* Calculations results */}
            <div className="lg:col-span-6 grid sm:grid-cols-3 gap-4">
              <div className="bg-green-500/5 dark:bg-green-950/20 border border-green-550/20 dark:border-green-800/40 p-5 rounded-2xl space-y-2 text-center">
                <Leaf className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto" />
                <div className="text-3xl font-black text-slate-800 dark:text-white font-mono">{co2Saved}</div>
                <div className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">CO2 Saved (kg)</div>
              </div>

              <div className="bg-green-500/5 dark:bg-green-950/20 border border-green-550/20 dark:border-green-800/40 p-5 rounded-2xl space-y-2 text-center">
                <Globe className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto" />
                <div className="text-3xl font-black text-slate-800 dark:text-white font-mono">{energyGenerated}</div>
                <div className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Clean Energy (kWh)</div>
              </div>

              <div className="bg-green-500/5 dark:bg-green-950/20 border border-green-550/20 dark:border-green-800/40 p-5 rounded-2xl space-y-2 text-center">
                <Sparkles className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto" />
                <div className="text-3xl font-black text-slate-800 dark:text-white font-mono">{ecoPoints}</div>
                <div className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Estimated EcoPoints</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section with Earth Banner */}
        <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 rounded-3xl p-8 mt-20 flex flex-col lg:flex-row items-center justify-between gap-10">
          
          {/* Earth / Message block */}
          <div className="flex items-center gap-5 lg:max-w-md">
            <div className="w-16 h-16 shrink-0 bg-green-100 dark:bg-green-950/50 rounded-full flex items-center justify-center text-green-700 dark:text-green-400">
              <Globe className="w-9 h-9 animate-spin-slow" />
            </div>
            <p className="text-slate-700 dark:text-slate-300 font-semibold text-lg leading-snug text-left">
              Together, we can build a cleaner and greener community!
            </p>
          </div>

          {/* Stats details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full lg:w-auto text-left">
            {[
              { val: '1,245+', label: 'Happy Users', icon: Users },
              { val: '3,452+', label: 'Pickups Completed', icon: Trash2 },
              { val: '2.5 Ton', label: 'Waste Recycled', icon: Leaf },
              { val: '15+', label: 'Communities Served', icon: Globe },
            ].map((stat, i) => (
              <div key={i} className="space-y-1">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white">
                  {stat.val}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

        </div>

    </div>
  );
}
