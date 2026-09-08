import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import EmailUploader from './components/EmailUploader';
import RiskScoreCard from './components/RiskScoreCard';
import ReasonList from './components/ReasonList';
import HopMap from './components/HopMap';
import ForensicChainViewer from './components/ForensicChainViewer';
import CasesView from './components/CasesView';
import SettingsModal from './components/SettingsModal';
import AuthModal from './components/AuthModal';
import AiBriefingCard from './components/AiBriefingCard';
import WelcomeScreen from './components/WelcomeScreen';
import FloatingSettings from './components/FloatingSettings';
import DashboardHero from './components/DashboardHero';
import {
  listEmails,
  getEmailDetail,
  deleteEmail,
  clearAllEmails,
  exportReportPdf,
  checkBackendHealth,
  getStoredUser,
  logoutUser,
} from './api/client';
import { Clock, Inbox, ChevronRight, Trash2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('scanner');
  const [backendOnline, setBackendOnline] = useState(false);
  const [emails, setEmails] = useState([]);
  const [currentEmail, setCurrentEmail] = useState(null);
  const [maskPii, setMaskPii] = useState(() => window.localStorage.getItem('threatlens-mask-pii') === '1');
  const [accentTheme, setAccentTheme] = useState(() => window.localStorage.getItem('threatlens-theme') || 'violet');
  const [mode, setMode] = useState(() => window.localStorage.getItem('threatlens-mode') || 'dark');
  const [glassLevel, setGlassLevel] = useState(() => window.localStorage.getItem('threatlens-glass') || 'medium');
  const [motion, setMotion] = useState(() => window.localStorage.getItem('threatlens-motion') || 'on');
  const [showWelcome, setShowWelcome] = useState(() => window.localStorage.getItem('threatlens-welcomed') !== '1');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const vaultRef = useRef(null);

  useEffect(() => {
    document.documentElement.dataset.theme = accentTheme;
    window.localStorage.setItem('threatlens-theme', accentTheme);
  }, [accentTheme]);

  useEffect(() => {
    document.documentElement.dataset.mode = mode;
    window.localStorage.setItem('threatlens-mode', mode);
  }, [mode]);

  useEffect(() => {
    document.documentElement.dataset.glass = glassLevel;
    window.localStorage.setItem('threatlens-glass', glassLevel);
  }, [glassLevel]);

  useEffect(() => {
    document.documentElement.dataset.motion = motion;
    window.localStorage.setItem('threatlens-motion', motion);
  }, [motion]);

  useEffect(() => {
    window.localStorage.setItem('threatlens-mask-pii', maskPii ? '1' : '0');
  }, [maskPii]);

  const enterConsole = () => {
    setShowWelcome(false);
    window.localStorage.setItem('threatlens-welcomed', '1');
  };

  const [user, setUser] = useState(getStoredUser());
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    checkHealthAndLoad();
  }, []);

  const checkHealthAndLoad = async () => {
    const isOnline = await checkBackendHealth();
    setBackendOnline(isOnline);

    try {
      const emailList = await listEmails();
      setEmails(emailList);
      if (emailList.length > 0) {
        loadEmail(emailList[0].id);
      }
    } catch (err) {
      console.error('Error fetching email queue:', err);
    }
  };

  const loadEmail = async (id) => {
    try {
      const detail = await getEmailDetail(id);
      setCurrentEmail(detail);
    } catch (err) {
      console.error(err);
    }
  };

  const handleScanComplete = (newEmail) => {
    setCurrentEmail(newEmail);
    listEmails().then((list) => setEmails(list));
    setActiveTab('scanner');
  };

  const handleExportPdf = async () => {
    if (!currentEmail) return;
    try {
      const blob = await exportReportPdf(currentEmail.id, maskPii);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ThreatLens_Forensic_Report_${currentEmail.id.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export PDF: ' + err.message);
    }
  };

  const handleDeleteEmail = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Delete this incident from the investigation queue?')) return;
    try {
      await deleteEmail(id);
      const updated = emails.filter((em) => em.id !== id);
      setEmails(updated);
      if (currentEmail?.id === id) {
        if (updated.length > 0) {
          loadEmail(updated[0].id);
        } else {
          setCurrentEmail(null);
        }
      }
    } catch (err) {
      alert('Failed to delete incident: ' + err.message);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all incidents from the queue?')) return;
    try {
      await clearAllEmails();
      setEmails([]);
      setCurrentEmail(null);
    } catch (err) {
      alert('Failed to clear queue: ' + err.message);
    }
  };

  const handleAuthSuccess = (userData) => {
    setUser({
      email: userData.email,
      role: userData.role,
      full_name: userData.full_name,
    });
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
  };

  const q = searchQuery.trim().toLowerCase();
  const visibleEmails = q
    ? emails.filter((em) =>
        [em.subject, em.sender, em.sender_domain, em.risk_level]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(q)
      )
    : emails;

  return (
    <div className="relative min-h-screen text-slate-100 flex">
      <div className="app-orbs cyber-grid" aria-hidden="true">
        <div className="orb-third" />
      </div>

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        backendOnline={backendOnline}
        user={user}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <div className="relative z-10 flex-1 min-w-0 flex flex-col">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          backendOnline={backendOnline}
          user={user}
          onOpenAuthModal={() => setAuthModalOpen(true)}
          onLogout={handleLogout}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {showWelcome && (
          <WelcomeScreen onEnter={enterConsole} backendOnline={backendOnline} user={user} />
        )}

        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />

        <main className="flex-1 px-3 sm:px-5 pb-8">
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-5">
            <div className="space-y-5 min-w-0">
              {activeTab === 'scanner' && <DashboardHero emails={emails} user={user} />}

              {activeTab === 'scanner' && (
                <div className="space-y-5">
                  <EmailUploader onScanComplete={handleScanComplete} />

                  {currentEmail && (
                    <div className="space-y-5">
                      <div className="glass rounded-[1.6rem] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover-lift">
                        <div>
                          <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
                            <span>INCIDENT ID:</span>
                            <span className="text-white font-bold">{currentEmail.id}</span>
                            <span>•</span>
                            <Clock className="w-3.5 h-3.5" />
                            <span>{new Date(currentEmail.created_at).toLocaleString()}</span>
                          </div>
                          <h2 className="text-xl font-black text-white mt-1">
                            {currentEmail.subject || '(No Subject)'}
                          </h2>
                          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                            <span>From: <b className="text-slate-200">{currentEmail.sender}</b></span>
                            {currentEmail.reply_to && (
                              <span>Reply-To: <b className="text-slate-300">{currentEmail.reply_to}</b></span>
                            )}
                            <span>Domain: <b className="text-accent">{currentEmail.sender_domain}</b></span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 self-start md:self-auto">
                          {currentEmail.case_id && (
                            <button
                              type="button"
                              onClick={() => setActiveTab('cases')}
                              className="px-3.5 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-2"
                            >
                              <span>Correlated case</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteEmail(currentEmail.id)}
                            className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>

                      <AiBriefingCard emailId={currentEmail.id} />

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        <RiskScoreCard
                          email={currentEmail}
                          onExport={handleExportPdf}
                          onVerifyChain={() => vaultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                        />
                        <div className="lg:col-span-2">
                          <ReasonList reasons={currentEmail.reasons || []} />
                        </div>
                      </div>

                      <HopMap hops={currentEmail.hops || []} />

                      <div ref={vaultRef}>
                        <ForensicChainViewer emailId={currentEmail.id} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'cases' && (
                <CasesView
                  onSelectEmail={(id) => {
                    loadEmail(id);
                    setActiveTab('scanner');
                  }}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsModal
                  maskPii={maskPii}
                  setMaskPii={setMaskPii}
                  accentTheme={accentTheme}
                  setAccentTheme={setAccentTheme}
                />
              )}
            </div>

            <aside className="space-y-4 xl:sticky xl:top-4 self-start">
              <div className="glass rounded-[1.6rem] p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                    <Inbox className="w-4 h-4 text-accent" />
                    Analyst feed
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">{visibleEmails.length}</span>
                </div>
                {visibleEmails.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">No incidents yet. Scan an email to populate the feed.</p>
                ) : (
                  <div className="space-y-2 max-h-[52vh] overflow-y-auto pr-1">
                    {visibleEmails.map((em) => {
                      const isSelected = currentEmail?.id === em.id;
                      return (
                        <div
                          key={em.id}
                          className={`rounded-2xl border p-2.5 transition ${
                            isSelected ? 'border-accent bg-white/10' : 'border-white/8 bg-black/20 hover:border-white/20'
                          }`}
                        >
                          <button type="button" onClick={() => { loadEmail(em.id); setActiveTab('scanner'); }} className="w-full text-left">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-2 h-2 rounded-full shrink-0 ${
                                  em.risk_level === 'Critical'
                                    ? 'bg-rose-500'
                                    : em.risk_level === 'High'
                                    ? 'bg-orange-500'
                                    : em.risk_level === 'Medium'
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                }`}
                              />
                              <span className="text-xs font-semibold truncate">{em.subject || em.sender}</span>
                            </div>
                            <div className="mt-1 text-[10px] font-mono text-slate-500 flex justify-between">
                              <span className="truncate">{em.sender}</span>
                              <span>{em.risk_score}</span>
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteEmail(em.id, e)}
                            className="mt-1 text-[10px] text-slate-500 hover:text-rose-400"
                          >
                            Remove
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
                {emails.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/25 text-xs font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear queue
                  </button>
                )}
              </div>
            </aside>
          </div>
        </main>

        <footer className="relative z-10 px-5 pb-4 text-center text-[11px] text-slate-500 font-mono">
          ThreatLens · Email threat detection · Smart India Hackathon 2026
        </footer>
      </div>

      <FloatingSettings
        open={settingsOpen}
        setOpen={setSettingsOpen}
        accentTheme={accentTheme}
        setAccentTheme={setAccentTheme}
        mode={mode}
        setMode={setMode}
        maskPii={maskPii}
        setMaskPii={setMaskPii}
        glassLevel={glassLevel}
        setGlassLevel={setGlassLevel}
        motion={motion}
        setMotion={setMotion}
      />
    </div>
  );
}
