import React from 'react';
import { ShieldAlert, Radar, Fingerprint, FileCheck2, ArrowRight, Activity } from 'lucide-react';

const CAPABILITIES = [
  { icon: Radar, title: 'Scan', desc: 'Header + body threat scoring' },
  { icon: Fingerprint, title: 'Trace', desc: 'Origin hop geolocation' },
  { icon: FileCheck2, title: 'Attest', desc: 'Tamper-proof evidence chain' },
];

export default function WelcomeScreen({ onEnter, backendOnline, user }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-8 overflow-y-auto">
      <div className="absolute inset-0 app-orbs cyber-grid" aria-hidden="true" />

      <div className="relative glass glass-strong rounded-[2rem] w-full max-w-2xl p-8 sm:p-12 text-center float-in">
        <div className="relative mx-auto mb-8 h-28 w-28">
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-accent/40 ring-spin" aria-hidden="true" />
          <div className="absolute inset-2 rounded-full accent-gradient glow-pulse blur-md opacity-60" aria-hidden="true" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-accent shadow-accent rounded-2xl p-4 text-white">
              <ShieldAlert className="w-10 h-10" />
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/30 text-accent text-[10px] font-bold tracking-wider uppercase mb-4">
          <Activity className={`w-3 h-3 ${backendOnline ? 'text-emerald-400' : 'text-rose-400'}`} />
          {backendOnline ? 'Detection engine online' : 'Engine warming up'}
        </div>

        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white text-balance">
          {user ? `Welcome back, ${user.full_name?.split(' ')[0] || user.email.split('@')[0]}` : 'Welcome to ThreatLens'}
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-md mx-auto leading-relaxed">
          Modern email threat intelligence. Upload a suspicious message and get an explainable risk verdict, origin trace, and court-ready evidence.
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CAPABILITIES.map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className={`glass rounded-2xl p-4 hover-lift reveal reveal-delay-${i + 1}`}>
              <div className="mx-auto w-10 h-10 rounded-xl flex items-center justify-center text-accent border border-accent/25 bg-white/5 mb-3">
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-sm font-bold text-white">{title}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{desc}</div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onEnter}
          className="group mt-9 inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-accent text-white font-bold shadow-accent hover:brightness-110 transition"
        >
          Enter console
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>

        <p className="mt-5 text-[11px] text-slate-500">
          Drag the floating gear anywhere — click it to theme the glass console.
        </p>
      </div>
    </div>
  );
}
