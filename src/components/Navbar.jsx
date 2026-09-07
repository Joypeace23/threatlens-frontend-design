import React, { useState, useRef, useEffect } from 'react';
import { ShieldAlert, FolderKanban, Sliders, LogIn, LogOut, Activity, Sun, Moon, Palette } from 'lucide-react';

export const ACCENT_PRESETS = [
  { id: 'teal', label: 'Teal', swatch: '#17c3c5' },
  { id: 'indigo', label: 'Indigo', swatch: '#6366f1' },
  { id: 'rose', label: 'Rose', swatch: '#f43f6e' },
  { id: 'emerald', label: 'Emerald', swatch: '#10b981' },
  { id: 'amber', label: 'Amber', swatch: '#f5a524' },
  { id: 'sky', label: 'Sky', swatch: '#0ea5e9' },
];

export default function Navbar({
  activeTab,
  setActiveTab,
  backendOnline,
  user,
  onOpenAuthModal,
  onLogout,
  mode,
  onToggleMode,
  accentTheme,
  setAccentTheme,
}) {
  const tabs = [
    { id: 'scanner', label: 'Scan & Investigate', icon: ShieldAlert },
    { id: 'cases', label: 'Case Linker', icon: FolderKanban },
    { id: 'settings', label: 'Governance & Vault', icon: Sliders },
  ];

  const [paletteOpen, setPaletteOpen] = useState(false);
  const paletteRef = useRef(null);

  useEffect(() => {
    if (!paletteOpen) return;
    const onClick = (e) => {
      if (paletteRef.current && !paletteRef.current.contains(e.target)) setPaletteOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [paletteOpen]);

  return (
    <header className="relative z-40 sticky top-0 px-4 sm:px-6 py-4">
      <div className="glass max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 rounded-2xl px-4 py-3">
        <button type="button" className="flex items-center gap-3 text-left" onClick={() => setActiveTab('scanner')}>
          <div className="bg-accent shadow-accent rounded-xl p-2.5 text-slate-950"><ShieldAlert className="w-6 h-6" /></div>
          <div><div className="flex items-center gap-2"><span className="font-black text-xl tracking-tight">ThreatLens</span><span className="text-[10px] font-bold tracking-wider px-2 py-1 rounded-full border border-accent/30 text-accent">V2.0</span></div><p className="text-[11px] text-slate-400 font-mono tracking-wide">DETECT. TRACE. PROVE.</p></div>
        </button>
        <nav className="order-3 md:order-2 w-full md:w-auto flex items-center gap-1 overflow-x-auto glass-strong rounded-xl p-1" aria-label="Primary navigation">
          {tabs.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => setActiveTab(id)} className={`flex shrink-0 items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === id ? 'bg-accent text-slate-950 shadow-accent' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><Icon className="w-4 h-4" /><span>{label}</span></button>)}
        </nav>
        <div className="order-2 md:order-3 flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-slate-950/40 border border-white/10 text-[10px] font-mono"><Activity className={`w-3.5 h-3.5 ${backendOnline ? 'text-emerald-400' : 'text-rose-400'}`} /><span className={backendOnline ? 'text-emerald-300' : 'text-rose-300'}>{backendOnline ? 'ENGINE ONLINE' : 'ENGINE OFFLINE'}</span></div>

          {/* Live accent palette switcher */}
          <div className="relative" ref={paletteRef}>
            <button
              type="button"
              onClick={() => setPaletteOpen((o) => !o)}
              title="Change accent color"
              aria-haspopup="true"
              aria-expanded={paletteOpen}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 border border-white/10 transition"
            >
              <Palette className="w-4 h-4" />
            </button>
            {paletteOpen && (
              <div className="absolute right-0 mt-2 glass-strong rounded-xl p-3 w-44 z-50 float-in">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">Accent color</p>
                <div className="grid grid-cols-3 gap-2">
                  {ACCENT_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => { setAccentTheme(p.id); setPaletteOpen(false); }}
                      title={p.label}
                      className={`h-9 rounded-lg border-2 transition-transform hover:scale-105 ${accentTheme === p.id ? 'border-white' : 'border-transparent'}`}
                      style={{ background: p.swatch }}
                    >
                      <span className="sr-only">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dark / bright mode toggle */}
          <button
            type="button"
            onClick={onToggleMode}
            title={mode === 'light' ? 'Switch to dark mode' : 'Switch to bright mode'}
            aria-label={mode === 'light' ? 'Switch to dark mode' : 'Switch to bright mode'}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 border border-white/10 transition"
          >
            {mode === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {user ? <div className="flex items-center gap-2 glass-strong rounded-xl p-1.5 pl-3"><div className="text-right"><div className="text-xs font-bold leading-tight">{user.full_name || user.email.split('@')[0]}</div><div className="text-[10px] font-mono uppercase text-accent">{user.role}</div></div><button type="button" onClick={onLogout} title="Log out" className="p-2 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-400/10"><LogOut className="w-4 h-4" /></button></div> : <button type="button" onClick={onOpenAuthModal} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-accent text-slate-950 text-xs font-bold shadow-accent hover:brightness-110 transition"><LogIn className="w-3.5 h-3.5" /><span className="hidden sm:inline">Sign in / Sign up</span><span className="sm:hidden">Sign in</span></button>}
        </div>
      </div>
    </header>
  );
}
