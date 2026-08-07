import React from 'react';
import { Shield, Users, Leaf, Globe, Heart, Award, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  const values = [
    {
      title: 'Sustainability First',
      desc: 'Every decision we make is guided by its environmental impact. We strive to divert maximum waste from landfills to recycling pipelines.',
      icon: Leaf,
      color: 'text-green-600 bg-green-50 dark:bg-green-950/30'
    },
    {
      title: 'Community Empowerment',
      desc: 'Providing citizens and local municipalities with the tools they need to build cleaner, healthier neighborhoods together.',
      icon: Users,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30'
    },
    {
      title: 'Global Responsibility',
      desc: 'Optimizing logistics routes to reduce carbon emissions from collection vehicles and promote circular economy metrics.',
      icon: Globe,
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30'
    }
  ];

  const benefits = [
    {
      title: 'Streamlined Pickup Scheduling',
      desc: 'Residents can request and manage waste pickups with clear timeslots, reducing confusion and missed collections.',
      icon: Shield,
      color: 'text-green-600 bg-green-50 dark:bg-green-950/30'
    },
    {
      title: 'Live Status Notifications',
      desc: 'Automatic updates keep users informed of driver arrival, pickup completion, and service changes in real-time.',
      icon: Heart,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30'
    },
    {
      title: 'Data-Driven Efficiency',
      desc: 'The platform helps route planners and administrators reduce service gaps while tracking waste diversion performance.',
      icon: Globe,
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30'
    }
  ];

  return (
    <div className="relative min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-green-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        
        {/* Mission Statement Hero */}
        <section className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 text-xs font-bold uppercase tracking-wider">
            <Award className="w-4 h-4" /> Our Mission
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            We are redefining municipal <br />
            <span className="text-green-700 dark:text-green-400">waste logistics</span>
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
            Waste Pickup Scheduler is a smart web platform dedicated to optimizing waste collection, facilitating seamless communication between residents and municipal dispatchers, and driving carbon reduction.
          </p>
        </section>

        {/* Core Values */}
        <section className="space-y-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Our Core Values</h2>
            <p className="text-slate-505 dark:text-slate-400 text-sm mt-2 max-w-md mx-auto">The principles that guide our product development and community partnerships.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((v, i) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 p-6 rounded-2xl space-y-4 text-left">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${v.color}`}>
                  <v.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">{v.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Platform Benefits */}
        <section className="space-y-12 border-t border-slate-100 dark:border-slate-800/80 pt-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Why this platform works</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-2xl mx-auto">
              A practical capstone-ready solution built to improve waste pickup coordination, transparency, and operational performance for residents and service teams.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((item, i) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 p-6 rounded-2xl space-y-4 text-left">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color}`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">{item.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-12 border-t border-slate-100 dark:border-slate-800/80 pt-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Built for practical use</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-2xl mx-auto">
              This capstone project demonstrates a full-stack system capable of handling scheduling, tracking, and communication for municipal waste services.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 p-8 rounded-3xl">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Resident-friendly scheduling</h3>
              <p className="mt-4 text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                Users can request pickups, view status updates, and manage their service details through a responsive interface.
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 p-8 rounded-3xl">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Clear operational visibility</h3>
              <p className="mt-4 text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                Collectors and administrators gain visibility into pickup assignments and notification status for better route management.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
