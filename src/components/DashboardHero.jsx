import React, { useMemo, useState } from 'react';
import { ShieldCheck, MailX, AlertTriangle, Activity, Radar } from 'lucide-react';

function buildSeries(emails, range) {
  const now = Date.now();
  const buckets = range === 'daily' ? 12 : range === 'weekly' ? 7 : 12;
  const span = range === 'daily' ? 24 * 3600e3 : range === 'weekly' ? 7 * 24 * 3600e3 : 30 * 24 * 3600e3;
  const step = span / buckets;
  const phishing = Array(buckets).fill(0);
  const spam = Array(buckets).fill(0);
  emails.forEach((em) => {
    const t = new Date(em.created_at || Date.now()).getTime();
    const idx = Math.min(buckets - 1, Math.max(0, Math.floor((t - (now - span)) / step)));
    if (t < now - span) return;
    const high = em.risk_level === 'Critical' || em.risk_level === 'High' || (em.risk_score || 0) >= 60;
    if (high) phishing[idx] += 1;
    else spam[idx] += 1;
  });
  if (emails.length === 0) {
    return {
      phishing: [2, 3, 2, 4, 3, 5, 4, 6, 5, 4, 5, 6].slice(0, buckets),
      spam: [4, 5, 6, 5, 7, 6, 8, 7, 6, 8, 7, 9].slice(0, buckets),
      demo: true,
    };
  }
  return { phishing, spam, demo: false };
}

function toPath(values, w, h, pad) {
  const max = Math.max(1, ...values);
  return values
    .map((v, i) => {
      const x = pad + (i / Math.max(1, values.length - 1)) * (w - pad * 2);
      const y = h - pad - (v / max) * (h - pad * 2);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}

function toArea(values, w, h, pad) {
  const line = toPath(values, w, h, pad);
  return `${line} L ${w - pad} ${h - pad} L ${pad} ${h - pad} Z`;
}

export default function DashboardHero({ emails, user }) {
  const [range, setRange] = useState('weekly');
  const stats = useMemo(() => {
    const total = emails.length;
    const blocked = emails.filter((e) => (e.risk_score || 0) >= 40).length;
    const critical = emails.filter((e) => e.risk_level === 'Critical' || e.risk_level === 'High').length;
    const avg = total ? Math.round(emails.reduce((s, e) => s + (e.risk_score || 0), 0) / total) : 0;
    const safety = total ? Math.max(12, Math.min(99, Math.round(100 - avg * 0.72 - critical * 4))) : 93;
    return { total, blocked, critical, avg, safety };
  }, [emails]);

  const series = useMemo(() => buildSeries(emails, range), [emails, range]);
  const w = 640;
  const h = 220;
  const pad = 18;
  const pPath = toPath(series.phishing, w, h, pad);
  const sPath = toPath(series.spam, w, h, pad);
  const pArea = toArea(series.phishing, w, h, pad);
  const sArea = toArea(series.spam, w, h, pad);
  const gauge = 220 - (stats.safety / 100) * 220;

  const cards = [
    { label: 'Scanned', value: stats.total, hint: 'Messages in queue', icon: Activity, tone: 'from-fuchsia-500/30' },
    { label: 'Blocked', value: stats.blocked, hint: 'Elevated risk', icon: MailX, tone: 'from-violet-500/30' },
    { label: 'High / Critical', value: stats.critical, hint: 'Needs analyst review', icon: AlertTriangle, tone: 'from-orange-400/30' },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map(({ label, value, hint, icon: Icon, tone }, i) => (
          <div key={label} className={`glass hover-lift rounded-[1.5rem] p-5 reveal reveal-delay-${i + 1} relative overflow-hidden`}>
            <div className={`absolute -right-6 -top-8 w-28 h-28 rounded-full bg-gradient-to-br ${tone} to-transparent blur-2xl`} />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">{label}</p>
                <p className="text-3xl font-black mt-1">{value}</p>
                <p className="text-[11px] text-slate-400 mt-1">{hint}</p>
              </div>
              <div className="w-11 h-11 rounded-2xl glass-strong grid place-items-center text-accent">
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 glass rounded-[1.6rem] p-5 relative overflow-hidden reveal">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <h3 className="text-sm font-bold">Threat detection trends</h3>
              <p className="text-[11px] text-slate-400">Phishing volume vs. lower-risk spam</p>
            </div>
            <div className="flex gap-1 p-1 rounded-full bg-black/25 border border-white/10">
              {['daily', 'weekly', 'monthly'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRange(r)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold capitalize ${range === r ? 'bg-accent text-white shadow-accent' : 'text-slate-400'}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          {series.demo && (
            <p className="text-[10px] text-slate-500 mb-1">Preview curve until incidents are scanned.</p>
          )}
          <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[200px]">
            <defs>
              <linearGradient id="fillP" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.45" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="fillS" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent-2)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="var(--accent-2)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={sArea} fill="url(#fillS)" />
            <path d={pArea} fill="url(#fillP)" />
            <path d={sPath} fill="none" stroke="var(--accent-2)" strokeWidth="3" className="chart-line" />
            <path d={pPath} fill="none" stroke="var(--accent)" strokeWidth="3" className="chart-line" />
          </svg>
          <div className="flex gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-full bg-accent inline-block" /> Phishing / high risk</span>
            <span className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: 'var(--accent-2)' }} /> Lower-risk volume</span>
          </div>
        </div>

        <div className="glass glass-accent rounded-[1.6rem] p-5 flex flex-col reveal reveal-delay-2 relative overflow-hidden">
          <div className="absolute right-[-20%] top-[-20%] w-40 h-40 rounded-full border border-white/20 radar-sweep opacity-40" />
          <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
            <Radar className="w-4 h-4" />
            {user ? `Welcome back, ${user.full_name?.split(' ')[0] || 'analyst'}` : 'Security posture'}
          </div>
          <div className="relative mx-auto my-3 w-44 h-28">
            <svg viewBox="0 0 180 110" className="w-full h-full">
              <path d="M20 100 A70 70 0 0 1 160 100" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="12" strokeLinecap="round" />
              <path
                d="M20 100 A70 70 0 0 1 160 100"
                fill="none"
                stroke="url(#g1)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray="220"
                strokeDashoffset={gauge}
                className="gauge-arc"
              />
              <defs>
                <linearGradient id="g1" x1="0" x2="1">
                  <stop offset="0%" stopColor="var(--accent)" />
                  <stop offset="100%" stopColor="var(--accent-2)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
              <span className="text-3xl font-black leading-none">{stats.safety}</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-300">Safety score</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-300/90 text-center leading-relaxed">
            Composite of queue volume, average risk, and critical incidents. Keep scanning to tighten the score.
          </p>
          <div className="mt-auto pt-3 flex items-center justify-center gap-2 text-[11px] text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5" /> Evidence vault ready
          </div>
        </div>
      </div>
    </div>
  );
}
