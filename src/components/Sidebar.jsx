import React from 'react';
import { ShieldAlert, ScanSearch, FolderKanban, Scale, Settings2, LogOut, LogIn, Activity } from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  backendOnline,
  user,
  onOpenAuthModal,
  onLogout,
  onOpenSettings,
}) {
  const items = [
    { id: 'scanner', label: 'Console', icon: ScanSearch },
    { id: 'cases', label: 'Cases', icon: FolderKanban },
    { id: 'settings', label: 'Vault', icon: Scale },
  ];

  return (
    <aside className="relative z-30 hidden md:flex flex-col items-center py-5 px-2.5 w-[84px] shrink-0">
      <div className="glass glass-strong flex flex-col items-center gap-3 rounded-[2rem] py-5 px-2.5 h-full w-full">
        <button
          type="button"
          onClick={() => setActiveTab('scanner')}
          className="accent-gradient shadow-accent rounded-2xl p-2.5 text-white mb-2"
          title="ThreatLens"
        >
          <ShieldAlert className="w-5 h-5" />
        </button>

        <nav className="flex flex-col items-center gap-2 flex-1" aria-label="Primary">
          {items.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              title={label}
              onClick={() => setActiveTab(id)}
              className={`sidebar-icon ${activeTab === id ? 'active' : ''}`}
            >
              <Icon className="w-[18px] h-[18px]" />
              <span className="sr-only">{label}</span>
            </button>
          ))}
        </nav>

        <button
          type="button"
          onClick={onOpenSettings}
          title="Open settings"
          className="sidebar-icon"
        >
          <Settings2 className="w-[18px] h-[18px]" />
          <span className="sr-only">Settings</span>
        </button>

        <div
          className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-400 glow-pulse' : 'bg-rose-400'}`}
          title={backendOnline ? 'Engine online' : 'Engine offline'}
        />

        {user ? (
          <button type="button" onClick={onLogout} title="Log out" className="sidebar-icon">
            <LogOut className="w-4 h-4" />
          </button>
        ) : (
          <button type="button" onClick={onOpenAuthModal} title="Sign in" className="sidebar-icon">
            <LogIn className="w-4 h-4" />
          </button>
        )}
        <Activity className="w-3.5 h-3.5 text-slate-500" />
      </div>
    </aside>
  );
}
