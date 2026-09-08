import React from 'react';
import { Bell, LogIn, LogOut, Search, ShieldAlert, ScanSearch, FolderKanban, Sliders } from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  backendOnline,
  user,
  onOpenAuthModal,
  onLogout,
  searchQuery,
  setSearchQuery,
}) {
  const tabs = [
    { id: 'scanner', label: 'Console', icon: ScanSearch },
    { id: 'cases', label: 'Cases', icon: FolderKanban },
    { id: 'settings', label: 'Vault', icon: Sliders },
  ];

  return (
    <header className="relative z-20 px-3 sm:px-5 pt-4 pb-2">
      <div className="glass flex flex-wrap items-center justify-between gap-3 rounded-[1.6rem] px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="md:hidden accent-gradient shadow-accent rounded-2xl p-2 text-white">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-black tracking-tight truncate">
              Email Threat Console
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">
              Detect · Trace · Prove
              <span className={`ml-2 ${backendOnline ? 'text-emerald-400' : 'text-rose-400'}`}>
                {backendOnline ? '● Engine live' : '● Engine offline'}
              </span>
            </p>
          </div>
        </div>

        <label className="search-pill flex items-center gap-2 px-4 py-2.5 w-full sm:w-[min(420px,42vw)] order-3 sm:order-none">
          <Search className="w-4 h-4 text-slate-500 shrink-0" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search incidents, senders, domains..."
            className="bg-transparent outline-none text-sm w-full placeholder:text-slate-500"
          />
        </label>

        <div className="flex items-center gap-2">
          <nav className="md:hidden flex items-center gap-1 glass-strong rounded-xl p-1">
            {tabs.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                type="button"
                title={label}
                onClick={() => setActiveTab(id)}
                className={`p-2 rounded-lg ${activeTab === id ? 'bg-accent text-white' : 'text-slate-400'}`}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </nav>

          <button
            type="button"
            className="relative p-2.5 rounded-full glass-strong text-slate-300 hover:text-white"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-400" />
          </button>

          {user ? (
            <div className="flex items-center gap-2 glass-strong rounded-full pl-3 pr-1.5 py-1">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-bold leading-tight">{user.full_name || user.email.split('@')[0]}</div>
                <div className="text-[10px] font-mono uppercase text-accent">{user.role}</div>
              </div>
              <div className="w-8 h-8 rounded-full accent-gradient grid place-items-center text-[11px] font-black text-white">
                {(user.full_name || user.email).slice(0, 1).toUpperCase()}
              </div>
              <button type="button" onClick={onLogout} title="Log out" className="p-2 rounded-full text-slate-400 hover:text-rose-300">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-accent text-white text-xs font-bold shadow-accent hover:brightness-110"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
