import React, { useEffect, useRef, useState } from 'react';
import {
  Settings,
  Palette,
  Sun,
  Moon,
  EyeOff,
  Trash2,
  CheckCircle2,
  Sparkles,
  Move,
  X,
  Layers,
} from 'lucide-react';
import { ACCENT_PRESETS } from '../theme';
import { getSettings, updateRetention } from '../api/client';

const POS_KEY = 'threatlens-fab-pos';

export default function FloatingSettings({
  open,
  setOpen,
  accentTheme,
  setAccentTheme,
  mode,
  setMode,
  maskPii,
  setMaskPii,
  glassLevel,
  setGlassLevel,
  motion,
  setMotion,
}) {
  const [pos, setPos] = useState(() => {
    try {
      const raw = window.localStorage.getItem(POS_KEY);
      return raw ? JSON.parse(raw) : { x: null, y: null };
    } catch {
      return { x: null, y: null };
    }
  });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef({ active: false, ox: 0, oy: 0, moved: false });
  const fabRef = useRef(null);
  const [retentionDays, setRetentionDays] = useState(90);
  const [loading, setLoading] = useState(false);
  const [purgeResult, setPurgeResult] = useState(null);

  useEffect(() => {
    getSettings()
      .then((data) => {
        if (data.retention_days) setRetentionDays(data.retention_days);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (pos.x == null) return;
    window.localStorage.setItem(POS_KEY, JSON.stringify(pos));
  }, [pos]);

  const clamp = (x, y) => {
    const size = 56;
    const maxX = window.innerWidth - size - 8;
    const maxY = window.innerHeight - size - 8;
    return { x: Math.max(8, Math.min(maxX, x)), y: Math.max(8, Math.min(maxY, y)) };
  };

  const onPointerDown = (e) => {
    const el = fabRef.current;
    if (!el) return;
    el.setPointerCapture(e.pointerId);
    const rect = el.getBoundingClientRect();
    dragRef.current = {
      active: true,
      ox: e.clientX - rect.left,
      oy: e.clientY - rect.top,
      moved: false,
    };
    setDragging(true);
  };

  const onPointerMove = (e) => {
    if (!dragRef.current.active) return;
    const next = clamp(e.clientX - dragRef.current.ox, e.clientY - dragRef.current.oy);
    if (Math.abs(next.x - (pos.x ?? window.innerWidth - 88)) > 4 || Math.abs(next.y - (pos.y ?? window.innerHeight - 88)) > 4) {
      dragRef.current.moved = true;
    }
    setPos(next);
  };

  const onPointerUp = () => {
    const wasDrag = dragRef.current.moved;
    dragRef.current.active = false;
    setDragging(false);
    if (!wasDrag) setOpen((v) => !v);
  };

  const handleRetention = async () => {
    setLoading(true);
    setPurgeResult(null);
    try {
      const res = await updateRetention(retentionDays);
      setPurgeResult(res.purge_result);
    } catch (err) {
      alert('Retention update failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fromLeft = pos.x == null ? true : pos.x > window.innerWidth / 2;
  const style =
    pos.x == null
      ? { right: 24, bottom: 24 }
      : { left: pos.x, top: pos.y };

  return (
    <>
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-[70] bg-slate-950/35 backdrop-blur-[2px]"
          aria-label="Close settings"
          onClick={() => setOpen(false)}
        />
      )}

      <button
        ref={fabRef}
        type="button"
        aria-label="Dashboard settings"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={style}
        className={`settings-fab glass glass-accent fixed z-[80] w-14 h-14 rounded-full grid place-items-center text-white shadow-accent ${dragging ? 'dragging' : ''}`}
      >
        <Settings className={`w-6 h-6 ${open ? 'ring-spin' : ''}`} />
      </button>

      {open && (
        <div
          className={`fixed z-[85] w-[min(380px,calc(100vw-24px))] max-h-[min(86vh,720px)] overflow-y-auto glass glass-strong rounded-[1.75rem] p-5 ${fromLeft ? 'spring-in' : 'spring-in-left'}`}
          style={
            pos.x == null
              ? { right: 92, bottom: 24 }
              : fromLeft
                ? { right: Math.max(12, window.innerWidth - pos.x + 8), top: Math.min(pos.y, window.innerHeight - 80) }
                : { left: pos.x + 64, top: Math.min(pos.y, window.innerHeight - 80) }
          }
          role="dialog"
          aria-label="Console settings"
        >
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-accent font-bold">Configurator</div>
              <h2 className="text-lg font-black">Look &amp; operations</h2>
              <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                <Move className="w-3 h-3" /> Drag the gear anywhere on screen
              </p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="p-2 rounded-xl hover:bg-white/10 text-slate-400">
              <X className="w-4 h-4" />
            </button>
          </div>

          <section className="mb-5">
            <h3 className="text-xs font-bold flex items-center gap-1.5 mb-2">
              <Palette className="w-3.5 h-3.5 text-accent" /> Accent color
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {ACCENT_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  title={p.label}
                  onClick={() => setAccentTheme(p.id)}
                  className={`h-11 rounded-xl border-2 transition-transform hover:scale-105 ${accentTheme === p.id ? 'border-white scale-105' : 'border-transparent'}`}
                  style={{ background: p.swatch, boxShadow: accentTheme === p.id ? `0 0 18px ${p.swatch}` : undefined }}
                >
                  <span className="sr-only">{p.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="mb-5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMode('dark')}
              className={`flex items-center gap-2 p-3 rounded-2xl border text-xs font-semibold ${mode === 'dark' ? 'border-accent bg-white/10' : 'border-white/10'}`}
            >
              <Moon className="w-4 h-4" /> Dark
            </button>
            <button
              type="button"
              onClick={() => setMode('light')}
              className={`flex items-center gap-2 p-3 rounded-2xl border text-xs font-semibold ${mode === 'light' ? 'border-accent bg-white/10' : 'border-white/10'}`}
            >
              <Sun className="w-4 h-4" /> Light
            </button>
          </section>

          <section className="mb-5">
            <h3 className="text-xs font-bold flex items-center gap-1.5 mb-2">
              <Layers className="w-3.5 h-3.5 text-accent" /> Glass intensity
            </h3>
            <div className="flex gap-1 p-1 rounded-2xl bg-black/20 border border-white/10">
              {['low', 'medium', 'high'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setGlassLevel(lvl)}
                  className={`flex-1 py-2 rounded-xl text-[11px] font-bold capitalize ${glassLevel === lvl ? 'bg-accent text-white shadow-accent' : 'text-slate-400'}`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </section>

          <section className="mb-5">
            <h3 className="text-xs font-bold flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-accent" /> Motion
            </h3>
            <div className="flex gap-1 p-1 rounded-2xl bg-black/20 border border-white/10">
              {['on', 'off'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMotion(m)}
                  className={`flex-1 py-2 rounded-xl text-[11px] font-bold capitalize ${motion === m ? 'bg-accent text-white' : 'text-slate-400'}`}
                >
                  {m === 'on' ? 'Full' : 'Reduced'}
                </button>
              ))}
            </div>
          </section>

          <section className="mb-5 p-3.5 rounded-2xl border border-white/10 bg-white/5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold flex items-center gap-1.5">
                  <EyeOff className="w-3.5 h-3.5 text-accent" /> Mask PII in PDFs
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Redact phones, cards, and usernames on export.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={maskPii} onChange={(e) => setMaskPii(e.target.checked)} className="sr-only peer" />
                <span className="w-11 h-6 rounded-full bg-slate-700 peer-checked:bg-accent after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
              </label>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-bold flex items-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5 text-amber-300" /> Raw email retention
            </h3>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="365"
                value={retentionDays}
                onChange={(e) => setRetentionDays(parseInt(e.target.value, 10) || 30)}
                className="auth-input w-20 font-mono"
              />
              <span className="text-xs text-slate-400">days</span>
              <button
                type="button"
                onClick={handleRetention}
                disabled={loading}
                className="ml-auto px-3 py-2 rounded-xl bg-white/10 text-xs font-semibold border border-white/10"
              >
                {loading ? 'Applying...' : 'Apply'}
              </button>
            </div>
            {purgeResult && (
              <div className="p-2.5 rounded-xl bg-emerald-400/10 border border-emerald-400/25 text-emerald-300 text-[11px] flex gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Purged {purgeResult.purged_count} records. Hashes retained.
              </div>
            )}
          </section>

          <button
            type="button"
            onClick={() => {
              setPos({ x: null, y: null });
              window.localStorage.removeItem(POS_KEY);
            }}
            className="mt-4 w-full text-[11px] text-slate-500 hover:text-slate-300"
          >
            Reset button position
          </button>
        </div>
      )}
    </>
  );
}
