import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Activity, Globe, Shield, RefreshCw, Trash2, Download,
  AlertTriangle, Info, XCircle, ChevronDown, ChevronUp, Clock,
} from 'lucide-react';
import { UiLanguage } from '../types';

interface LogsViewProps { uiLang: UiLanguage; }

interface LogEntry {
  id: number;
  ts: string;
  type: 'http' | 'ip' | 'security';
  level: 'info' | 'warn' | 'error';
  ip?: string;
  method?: string;
  path?: string;
  status?: number;
  duration_ms?: number;
  user_agent?: string;
  message?: string;
  extra?: string;
}

const TAB_CONFIG = [
  { key: 'http',     label: 'HTTP Logları',      icon: Activity, color: 'text-blue-600',    activeBg: 'bg-blue-50 border-blue-200' },
  { key: 'ip',       label: 'IP Erişim Logları', icon: Globe,    color: 'text-purple-600',  activeBg: 'bg-purple-50 border-purple-200' },
  { key: 'security', label: 'Güvenlik Logları',  icon: Shield,   color: 'text-red-600',     activeBg: 'bg-red-50 border-red-200' },
] as const;
type TabKey = typeof TAB_CONFIG[number]['key'];

const LEVEL_STYLE: Record<string, { bg: string; text: string; icon: any }> = {
  info:  { bg: 'bg-emerald-50',  text: 'text-emerald-700', icon: Info },
  warn:  { bg: 'bg-amber-50',    text: 'text-amber-700',   icon: AlertTriangle },
  error: { bg: 'bg-red-50',      text: 'text-red-700',     icon: XCircle },
};

const METHOD_COLOR: Record<string, string> = {
  GET:    'bg-blue-100 text-blue-700',
  POST:   'bg-emerald-100 text-emerald-700',
  PUT:    'bg-amber-100 text-amber-700',
  PATCH:  'bg-orange-100 text-orange-700',
  DELETE: 'bg-red-100 text-red-700',
};

function statusColor(s?: number) {
  if (!s) return 'text-slate-400';
  if (s < 300) return 'text-emerald-600 font-bold';
  if (s < 400) return 'text-blue-600 font-bold';
  if (s < 500) return 'text-amber-600 font-bold';
  return 'text-red-600 font-bold';
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s əvvəl`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}dəq əvvəl`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}s əvvəl`;
  return new Date(iso).toLocaleDateString('az-AZ', { day: '2-digit', month: 'short' });
}

function fullTime(iso: string) {
  return new Date(iso).toLocaleString('az-AZ', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

export const LogsView: React.FC<LogsViewProps> = () => {
  const [tab, setTab] = useState<TabKey>('http');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const token = () => localStorage.getItem('octotech_admin_jwt') || '';
  const authH = () => ({ Authorization: `Bearer ${token()}` });

  const load = useCallback(async (t?: TabKey) => {
    setLoading(true);
    try {
      const r = await fetch(`/api/logs?type=${t || tab}&limit=300`, { headers: authH() });
      if (r.ok) {
        setLogs(await r.json());
        setLastUpdate(new Date());
      }
    } catch {}
    setLoading(false);
  }, [tab]);

  useEffect(() => {
    load(tab);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (autoRefresh) {
      intervalRef.current = setInterval(() => load(tab), 10000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [tab, autoRefresh]);

  const clearLogs = async () => {
    if (!confirm(`${tab} loglarını silmək istədiyinizə əminsiniz?`)) return;
    await fetch(`/api/logs?type=${tab}`, { method: 'DELETE', headers: authH() });
    load();
  };

  const exportLogs = () => {
    const csv = [
      'ID,Tarix,Tip,Səviyyə,IP,Metod,Path,Status,Müddət(ms),Mesaj',
      ...filtered.map(l => [
        l.id, l.ts, l.type, l.level, l.ip || '', l.method || '',
        `"${(l.path || '').replace(/"/g, '""')}"`,
        l.status || '', l.duration_ms || '',
        `"${(l.message || '').replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${tab}-logs-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = logs.filter(l => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (l.ip || '').includes(s) || (l.path || '').toLowerCase().includes(s) ||
      (l.message || '').toLowerCase().includes(s) || (l.user_agent || '').toLowerCase().includes(s) ||
      String(l.status || '').includes(s);
  });

  const counts = { info: 0, warn: 0, error: 0 };
  logs.forEach(l => counts[l.level as keyof typeof counts]++);

  const currentTab = TAB_CONFIG.find(t => t.key === tab)!;

  return (
    <div className="flex flex-col h-full bg-slate-50">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#0f3156] rounded-lg flex items-center justify-center">
            <Activity className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900">Sistem Logları</h1>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {lastUpdate ? `${timeAgo(lastUpdate.toISOString())} yeniləndi` : 'Yüklənir...'}
              {autoRefresh && <span className="text-emerald-500 ml-1.5">● Canlı (10s)</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="IP, path, mesaj axtar..."
            className="h-8 px-3 text-xs border border-slate-200 bg-slate-50 focus:outline-none focus:border-[#0f3156] w-52 rounded-md" />
          <button onClick={() => setAutoRefresh(p => !p)}
            className={`h-8 px-3 text-xs font-semibold rounded-md border transition-colors ${autoRefresh ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-slate-500 border-slate-200'}`}>
            {autoRefresh ? '● Canlı' : 'Canlı'}
          </button>
          <button onClick={() => load()} disabled={loading}
            className="h-8 w-8 flex items-center justify-center border border-slate-200 hover:bg-slate-100 text-slate-500 rounded-md">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={exportLogs} title="CSV Export"
            className="h-8 w-8 flex items-center justify-center border border-slate-200 hover:bg-slate-100 text-slate-500 rounded-md">
            <Download className="w-3.5 h-3.5" />
          </button>
          <button onClick={clearLogs} title="Logları sil"
            className="h-8 w-8 flex items-center justify-center border border-red-200 hover:bg-red-50 text-red-400 rounded-md">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-white border-b border-slate-100 px-6 py-2 flex items-center gap-6 shrink-0">
        <span className="text-xs text-slate-500"><span className="font-bold text-slate-800">{logs.length}</span> log</span>
        <div className="w-px h-4 bg-slate-200" />
        <span className="text-xs text-emerald-600 flex items-center gap-1"><Info className="w-3 h-3" /> <span className="font-bold">{counts.info}</span> info</span>
        <span className="text-xs text-amber-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> <span className="font-bold">{counts.warn}</span> xəbərdarlıq</span>
        <span className="text-xs text-red-600 flex items-center gap-1"><XCircle className="w-3 h-3" /> <span className="font-bold">{counts.error}</span> xəta</span>
        {search && <span className="text-xs text-slate-400">{filtered.length} nəticə</span>}
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 px-6 flex gap-1 shrink-0">
        {TAB_CONFIG.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
              tab === t.key ? 'border-[#0f3156] text-[#0f3156]' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}>
            <t.icon className={`w-3.5 h-3.5 ${tab === t.key ? 'text-[#0f3156]' : t.color}`} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Log list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400">
            <Activity className="w-8 h-8 mb-2 text-slate-200" />
            <p className="text-xs">{loading ? 'Yüklənir...' : 'Log tapılmadı'}</p>
          </div>
        )}

        <div className="divide-y divide-slate-100">
          {filtered.map(l => {
            const lvl = LEVEL_STYLE[l.level] || LEVEL_STYLE.info;
            const LvlIcon = lvl.icon;
            const isExpanded = expandedId === l.id;

            return (
              <div key={l.id} className={`bg-white hover:bg-slate-50/50 transition-colors ${l.level === 'warn' ? 'border-l-2 border-l-amber-400' : l.level === 'error' ? 'border-l-2 border-l-red-400' : ''}`}>
                <button onClick={() => setExpandedId(isExpanded ? null : l.id)}
                  className="w-full px-5 py-2.5 flex items-center gap-3 text-left">

                  {/* Level icon */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${lvl.bg}`}>
                    <LvlIcon className={`w-3 h-3 ${lvl.text}`} />
                  </div>

                  {/* Time */}
                  <div className="w-20 shrink-0">
                    <div className="text-[10px] text-slate-400">{timeAgo(l.ts)}</div>
                  </div>

                  {/* IP */}
                  {l.ip && (
                    <div className="w-28 shrink-0">
                      <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">{l.ip}</span>
                    </div>
                  )}

                  {/* Method + Status (HTTP logs) */}
                  {l.method && (
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${METHOD_COLOR[l.method] || 'bg-slate-100 text-slate-600'}`}>
                        {l.method}
                      </span>
                      {l.status && <span className={`text-xs ${statusColor(l.status)}`}>{l.status}</span>}
                      {l.duration_ms != null && <span className="text-[10px] text-slate-400">{l.duration_ms}ms</span>}
                    </div>
                  )}

                  {/* Path or message */}
                  <div className="flex-1 min-w-0">
                    {l.path && (
                      <span className="text-xs font-mono text-slate-700 truncate block">{l.path}</span>
                    )}
                    {l.message && (
                      <span className={`text-xs truncate block ${l.level === 'warn' ? 'text-amber-700' : l.level === 'error' ? 'text-red-700' : 'text-slate-600'}`}>
                        {l.message}
                      </span>
                    )}
                  </div>

                  {/* Expand */}
                  <div className="shrink-0 text-slate-300">
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-5 pb-3 pt-1 bg-slate-50 border-t border-slate-100">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Tam tarix</div>
                        <div className="font-mono text-slate-700 text-[11px]">{fullTime(l.ts)}</div>
                      </div>
                      {l.ip && (
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">IP ünvanı</div>
                          <div className="font-mono text-slate-700">{l.ip}</div>
                        </div>
                      )}
                      {l.status && (
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">HTTP Status</div>
                          <div className={statusColor(l.status)}>{l.status}</div>
                        </div>
                      )}
                      {l.duration_ms != null && (
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Müddət</div>
                          <div className="text-slate-700">{l.duration_ms}ms</div>
                        </div>
                      )}
                    </div>
                    {l.user_agent && (
                      <div className="mt-2">
                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">User Agent</div>
                        <div className="text-[11px] font-mono text-slate-500 bg-white border border-slate-200 px-2 py-1.5 rounded break-all">{l.user_agent}</div>
                      </div>
                    )}
                    {l.extra && (
                      <div className="mt-2">
                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Əlavə məlumat</div>
                        <pre className="text-[11px] font-mono text-slate-600 bg-white border border-slate-200 px-2 py-1.5 rounded overflow-x-auto">
                          {JSON.stringify(JSON.parse(l.extra), null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
