import React, { useState, useEffect, useCallback } from 'react';
import {
  Mail, Save, CheckCircle, XCircle, RefreshCw, Eye, EyeOff,
  Send, Server, Shield, ChevronDown, ChevronUp, AlertCircle, Clock,
  FileText, Check, HelpCircle
} from 'lucide-react';
import { UiLanguage } from '../types';

interface SmtpSettingsViewProps { uiLang: UiLanguage; }

interface AccountSmtpConfig {
  host?: string;
  port?: string;
  secure?: boolean;
  user?: string;
  password?: string;
  from_name?: string;
  from_email?: string;
  enabled?: boolean;
  has_password?: boolean;
}

interface SmtpForm {
  host: string;
  port: string;
  secure: boolean;
  user: string;
  password: string;
  from_name: string;
  from_email: string;
  notify_email: string;
  enabled: boolean;
  rfq_email: string;
  producer_email: string;
  contact_email: string;
  info_email: string;
  akbar_email: string;
  sales_email: string;
  export_email: string;
  sourcing_email: string;
  logistics_email: string;
  procurement_email: string;
  partnerships_email: string;
  support_email: string;
  finance_email: string;
  ahmed_email: string;
  email_routes?: Record<string, AccountSmtpConfig>;
}

interface EmailLog {
  id: string;
  created_at: string;
  recipient: string;
  subject: string;
  status: 'sent' | 'failed' | 'skipped';
  error_message?: string | null;
}

const EMPTY_FORM: SmtpForm = {
  host: '',
  port: '587',
  secure: false,
  user: '',
  password: '',
  from_name: 'AZEXBUY',
  from_email: '',
  notify_email: 'info@azexbuy.com',
  enabled: false,
  rfq_email: 'procurement@azexbuy.com',
  producer_email: 'export@azexbuy.com',
  contact_email: 'info@azexbuy.com',
  info_email: 'info@azexbuy.com',
  akbar_email: 'akbar@azexbuy.com',
  sales_email: 'sales@azexbuy.com',
  export_email: 'export@azexbuy.com',
  sourcing_email: 'sourcing@azexbuy.com',
  logistics_email: 'logistics@azexbuy.com',
  procurement_email: 'procurement@azexbuy.com',
  partnerships_email: 'partnerships@azexbuy.com',
  support_email: 'support@azexbuy.com',
  finance_email: 'finance@azexbuy.com',
  ahmed_email: 'ahmed@azexbuy.com',
  email_routes: {},
};

const PRESETS = [
  { label: 'Gmail', host: 'smtp.gmail.com', port: '587', secure: false },
  { label: 'Outlook / 365', host: 'smtp.office365.com', port: '587', secure: false },
  { label: 'Yandex', host: 'smtp.yandex.com', port: '465', secure: true },
  { label: 'Zoho', host: 'smtp.zoho.com', port: '587', secure: false },
  { label: 'Webmail / cPanel', host: 'mail.azexbuy.com', port: '465', secure: true },
  { label: 'SendGrid', host: 'smtp.sendgrid.net', port: '587', secure: false },
];

const DEPARTMENTS = [
  { key: 'info_email', email: 'info@azexbuy.com', title: 'Ümumi Müraciətlər & Desk' },
  { key: 'procurement_email', email: 'procurement@azexbuy.com', title: 'Alıcı RFQ & Tədarük' },
  { key: 'export_email', email: 'export@azexbuy.com', title: 'İxracat & İstehsalçılar' },
  { key: 'sales_email', email: 'sales@azexbuy.com', title: 'Satış & Yeni Müqavilələr' },
  { key: 'logistics_email', email: 'logistics@azexbuy.com', title: 'Daşınma & Orta Dəhliz' },
  { key: 'sourcing_email', email: 'sourcing@azexbuy.com', title: 'Təchizatçı Sourcing' },
  { key: 'partnerships_email', email: 'partnerships@azexbuy.com', title: 'Qlobal Tərəfdaşlıq' },
  { key: 'support_email', email: 'support@azexbuy.com', title: 'Müştəri Dəstəyi' },
  { key: 'finance_email', email: 'finance@azexbuy.com', title: 'Maliyyə & Hesablaşma' },
  { key: 'akbar_email', email: 'akbar@azexbuy.com', title: 'Akbar (Şəxsi İş Poçtu)' },
  { key: 'ahmed_email', email: 'ahmed@azexbuy.com', title: 'Ahmed (Əməliyyatlar)' },
];

export const SmtpSettingsView: React.FC<SmtpSettingsViewProps> = () => {
  const [form, setForm] = useState<SmtpForm>({ ...EMPTY_FORM });
  const [hasStoredPassword, setHasStoredPassword] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [testing, setTesting] = useState(false);
  const [testMsg, setTestMsg] = useState<{ ok: boolean; msg: string } | null>(null);
  const [testTo, setTestTo] = useState('');

  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Per-account customization accordion
  const [expandedAcc, setExpandedAcc] = useState<string | null>(null);
  const [showAccPw, setShowAccPw] = useState<Record<string, boolean>>({});

  const getToken = () =>
    (typeof window !== 'undefined'
      ? localStorage.getItem('octotech_admin_jwt') ||
        sessionStorage.getItem('octotech_admin_jwt') ||
        localStorage.getItem('azexbuy_admin_token')
      : '') || '';

  const authH = useCallback(() => {
    const t = getToken();
    return {
      'Content-Type': 'application/json',
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
    };
  }, []);

  // Fetch settings & logs
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/smtp-settings', { headers: authH() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const d = await res.json();
      if (d && !d.error) {
        setHasStoredPassword(Boolean(d.password));
        setForm({
          host: d.host || '',
          port: String(d.port || 587),
          secure: Boolean(d.secure),
          user: d.user || '',
          password: d.password || '',
          from_name: d.from_name || 'AZEXBUY',
          from_email: d.from_email || '',
          notify_email: d.notify_email || 'info@azexbuy.com',
          enabled: Boolean(d.enabled),
          rfq_email: d.rfq_email || 'procurement@azexbuy.com',
          producer_email: d.producer_email || 'export@azexbuy.com',
          contact_email: d.contact_email || 'info@azexbuy.com',
          info_email: d.info_email || 'info@azexbuy.com',
          akbar_email: d.akbar_email || 'akbar@azexbuy.com',
          sales_email: d.sales_email || 'sales@azexbuy.com',
          export_email: d.export_email || 'export@azexbuy.com',
          sourcing_email: d.sourcing_email || 'sourcing@azexbuy.com',
          logistics_email: d.logistics_email || 'logistics@azexbuy.com',
          procurement_email: d.procurement_email || 'procurement@azexbuy.com',
          partnerships_email: d.partnerships_email || 'partnerships@azexbuy.com',
          support_email: d.support_email || 'support@azexbuy.com',
          finance_email: d.finance_email || 'finance@azexbuy.com',
          ahmed_email: d.ahmed_email || 'ahmed@azexbuy.com',
          email_routes: d.email_routes || {},
        });
        if (!testTo && d.notify_email) {
          setTestTo(d.notify_email);
        }
      }
    } catch (err: any) {
      console.error('[SMTP Settings Load Error]:', err);
      setErrorMsg('SMTP ayarları yüklənə bilmədi: ' + (err?.message || 'Server xətası'));
    } finally {
      setLoading(false);
    }
  }, [authH, testTo]);

  const fetchEmailLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch('/api/email-logs', { headers: authH() });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setLogs(data);
      }
    } catch (e) {
      console.error('[Email Logs Load Error]:', e);
    } finally {
      setLoadingLogs(false);
    }
  }, [authH]);

  useEffect(() => {
    fetchSettings();
    fetchEmailLogs();
  }, [fetchSettings, fetchEmailLogs]);

  const handleSave = async () => {
    setSaving(true);
    setSavedMsg('');
    setErrorMsg('');
    try {
      const res = await fetch('/api/smtp-settings', {
        method: 'POST',
        headers: authH(),
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSavedMsg('Bütün SMTP parametrləri uğurla saxlanıldı!');
        setHasStoredPassword(Boolean(form.password));
        setTimeout(() => setSavedMsg(''), 4000);
      } else {
        throw new Error(data.error || 'Saxlama xətası');
      }
    } catch (err: any) {
      setErrorMsg('Ayarları saxlayarkən xəta: ' + (err?.message || 'Server xətası'));
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async (overrideTo?: string, departmentEmail?: string) => {
    const destination = (overrideTo || testTo || form.notify_email || form.user || '').trim();
    if (!destination) {
      setTestMsg({ ok: false, msg: 'Zəhmət olmasa test e-poçt ünvanı daxil edin' });
      return;
    }

    setTesting(true);
    setTestMsg(null);
    try {
      const res = await fetch('/api/smtp-test', {
        method: 'POST',
        headers: authH(),
        body: JSON.stringify({
          host: form.host,
          port: form.port,
          secure: form.secure,
          user: form.user,
          password: form.password,
          from_name: form.from_name,
          from_email: form.from_email || form.user,
          to: destination,
          departmentEmail,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestMsg({ ok: true, msg: data.message || `Test məktubu ${destination} ünvanına uğurla çatdırıldı!` });
        fetchEmailLogs();
      } else {
        setTestMsg({ ok: false, msg: data.error || 'Bağlantı xətası baş verdi' });
      }
    } catch (e: any) {
      setTestMsg({ ok: false, msg: e?.message || 'Şəbəkə xətası baş verdi' });
    } finally {
      setTesting(false);
    }
  };

  const applyPreset = (p: typeof PRESETS[0]) => {
    setForm(f => ({
      ...f,
      host: p.host,
      port: p.port,
      secure: p.secure,
    }));
  };

  const handlePortChange = (val: string) => {
    const portClean = val.trim();
    const shouldSecure = portClean === '465';
    setForm(f => ({
      ...f,
      port: portClean,
      secure: portClean === '465' ? true : (portClean === '587' || portClean === '25' ? false : f.secure),
    }));
  };

  const updateAccountRoute = (emailAddress: string, field: keyof AccountSmtpConfig, val: any) => {
    const key = emailAddress.toLowerCase().trim();
    setForm(f => {
      const routes = { ...(f.email_routes || {}) };
      const current = routes[key] || {};
      routes[key] = { ...current, [field]: val };
      return { ...f, email_routes: routes };
    });
  };

  const F = ({
    label,
    name,
    placeholder,
    type = 'text',
    helperText
  }: {
    label: string;
    name: keyof SmtpForm;
    placeholder?: string;
    type?: string;
    helperText?: string;
  }) => (
    <div>
      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1 font-mono">
        {label}
      </label>
      <input
        type={type}
        value={String(form[name] || '')}
        onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
        placeholder={placeholder}
        className="w-full h-9 text-xs bg-slate-50 border border-slate-200 px-3 focus:outline-none focus:border-[#0f3156] focus:bg-white rounded-lg text-slate-900 font-medium transition-colors"
      />
      {helperText && <p className="text-[10px] text-slate-400 mt-1">{helperText}</p>}
    </div>
  );

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center gap-3 text-xs text-slate-500">
        <RefreshCw className="w-5 h-5 animate-spin text-[#0f3156]" />
        <span>SMTP ayarları yüklənir...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans">
      {/* Top action header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0f3156] text-white flex items-center justify-center shadow-xs shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900">
                SMTP Server &amp; E-poçt Bildirişləri
              </h1>
              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                form.enabled
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}>
                {form.enabled ? 'Aktivdir' : 'Deaktivdir'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Sayt üzərindən daxil olan RFQ, İstehsalçı qeydiyyatları və Xidmət müraciətlərinin e-poçtla çatdırılması
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {savedMsg && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-pulse">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> {savedMsg}
            </span>
          )}
          {errorMsg && (
            <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-500" /> {errorMsg}
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="h-9 px-4 flex items-center gap-1.5 text-xs font-bold bg-[#0f3156] hover:bg-[#1a4a7a] text-white rounded-lg transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saving ? 'Saxlanılır...' : 'Ayarları Saxla'}</span>
          </button>
        </div>
      </div>

      {/* Main scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-6xl mx-auto w-full">

        {/* Master ON/OFF Switch */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between shadow-xs">
          <div className="space-y-0.5">
            <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>E-poçt Bildirişlərini Göndər</span>
              <span className={`w-2 h-2 rounded-full ${form.enabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
            </div>
            <p className="text-xs text-slate-500">
              Bu seçim aktiv olduqda, müştəri hər hansı formu doldurduqda dərhal müvafiq departamentə və adminə e-poçt çatdırılır.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setForm(f => ({ ...f, enabled: !f.enabled }))}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              form.enabled ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                form.enabled ? 'left-6.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        {/* Global SMTP Server Settings */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-[#0f3156]" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Əsas (Qlobal) SMTP Server Parametrləri
              </h2>
            </div>

            {/* Provider quick presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-400 font-medium mr-1">Hazır Provayderlər:</span>
              {PRESETS.map(p => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="px-2.5 py-1 text-xs border border-slate-200 hover:border-[#0f3156] hover:bg-slate-50 hover:text-[#0f3156] rounded-md transition-colors text-slate-600 cursor-pointer font-medium"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Host & Port */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <F
                label="SMTP Server (Host)"
                name="host"
                placeholder="məs: mail.azexbuy.com və ya smtp.gmail.com"
                helperText="Poçt xidmətinizin çıxan poçt (SMTP) server ünvanı"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1 font-mono">
                Port
              </label>
              <input
                type="text"
                value={form.port}
                onChange={e => handlePortChange(e.target.value)}
                placeholder="587 və ya 465"
                className="w-full h-9 text-xs bg-slate-50 border border-slate-200 px-3 focus:outline-none focus:border-[#0f3156] focus:bg-white rounded-lg text-slate-900 font-medium"
              />
              <p className="text-[10px] text-slate-400 mt-1">Standart: 587 (STARTTLS) və ya 465 (SSL)</p>
            </div>
          </div>

          {/* Username & Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <F
              label="İstifadəçi Adı (Username / Email)"
              name="user"
              placeholder="məs: desk@azexbuy.com və ya info@azexbuy.com"
            />
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase font-mono">
                  Şifrə (Password / App Password)
                </label>
                {hasStoredPassword && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Bazada saxlanılıb
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder={hasStoredPassword ? '•••••••• (Dəyişmək istəmirsinizsə boş buraxın)' : 'Poçt şifrəsi'}
                  className="w-full h-9 text-xs bg-slate-50 border border-slate-200 px-3 pr-10 focus:outline-none focus:border-[#0f3156] focus:bg-white rounded-lg text-slate-900 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  title={showPw ? 'Şifrəni gizlə' : 'Şifrəni göstər'}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* SSL/TLS checkbox */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, secure: !f.secure }))}
              className={`w-9 h-5 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                form.secure ? 'bg-[#0f3156]' : 'bg-slate-200'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                  form.secure ? 'left-4.5' : 'left-0.5'
                }`}
              />
            </button>
            <label
              className="text-xs font-medium text-slate-700 cursor-pointer select-none"
              onClick={() => setForm(f => ({ ...f, secure: !f.secure }))}
            >
              SSL / TLS Təhlükəsiz Bağlantı (Port 465 üçün tövsiyə edilir, Port 587 üçün STARTTLS avtomatik tətbiq olunur)
            </label>
          </div>
        </div>

        {/* Sender & Notification Address Config */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="text-xs font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2">
            Göndərən Məlumatları və Admin Bildiriş Ünvanı
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <F
              label="Göndərən Adı (From Name)"
              name="from_name"
              placeholder="AZEXBUY Trade Desk"
              helperText="E-poçt alan şəxsin 'Göndərən' bölməsində görəcəyi ad"
            />
            <F
              label="Göndərən E-poçt (From Email)"
              name="from_email"
              placeholder="noreply@azexbuy.com və ya info@azexbuy.com"
              helperText="Məktubun göndərildiyi rəsmi email (Boş qalsa istifadəçi adı istifadə olunur)"
            />
          </div>
          <div>
            <F
              label="Admin Əsas Bildiriş E-poçtu (Bütün Sorğuların Kopyası)"
              name="notify_email"
              placeholder="info@azexbuy.com və ya desk@azexbuy.com"
              helperText="Sayt üzərindən daxil olan bütün sorğu və bildirişlər bu ünvana göndəriləcək"
            />
          </div>
        </div>

        {/* Live SMTP Connection Test Tool */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div>
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-600" />
              <span>Canlı SMTP Əlaqə &amp; Göndərmə Testi</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Yuxarıda daxil edilmiş parametrləri yoxlamaq üçün istənilən e-poçt ünvanına dərhal test məktubu göndərin.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="email"
              value={testTo}
              onChange={e => setTestTo(e.target.value)}
              placeholder="test-unvani@azexbuy.com"
              className="flex-1 h-9 text-xs bg-slate-50 border border-slate-200 px-3 focus:outline-none focus:border-[#0f3156] focus:bg-white rounded-lg text-slate-900 font-medium"
            />
            <button
              type="button"
              onClick={() => handleTest()}
              disabled={testing || !form.host || !form.user}
              className="h-9 px-5 flex items-center justify-center gap-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg disabled:opacity-40 cursor-pointer shadow-2xs transition-colors shrink-0"
            >
              {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>{testing ? 'Yoxlanılır & Göndərilir...' : 'Test Məktubu Göndər'}</span>
            </button>
          </div>

          {testMsg && (
            <div className={`p-3 rounded-lg border text-xs flex items-center gap-2.5 ${
              testMsg.ok
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              {testMsg.ok ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span className="font-medium leading-relaxed">{testMsg.msg}</span>
            </div>
          )}
        </div>

        {/* Department-specific Routing & Custom SMTP */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div>
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-600" />
              <span>Departamentlər üzrə E-poçt Yönləndirməsi &amp; Fərdi Serverlər</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Hər bir fəaliyyət növü üçün alıcı e-poçtunu təyin edə və istəsəniz həmin departament üçün fərdi SMTP server parametrləri qura bilərsiniz.
            </p>
          </div>

          <div className="space-y-3">
            {DEPARTMENTS.map((dept) => {
              const currentEmail = String(form[dept.key as keyof SmtpForm] || dept.email);
              const customCfg = form.email_routes?.[currentEmail.toLowerCase().trim()] || {};
              const isExpanded = expandedAcc === dept.key;
              const hasCustom = Boolean(customCfg.host && customCfg.user);

              return (
                <div key={dept.key} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                  <div
                    onClick={() => setExpandedAcc(isExpanded ? null : dept.key)}
                    className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${hasCustom ? 'bg-purple-600' : 'bg-slate-300'}`} />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">{dept.title}</span>
                        <span className="text-[11px] font-mono text-slate-500">{currentEmail}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      {hasCustom && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                          Xüsusi SMTP Aktivdir
                        </span>
                      )}
                      <button type="button" className="text-slate-400 p-1">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 border-t border-slate-100 bg-slate-50/60 space-y-4">
                      {/* Department Email field */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1 font-mono">
                          Departament E-poçt Ünvanı
                        </label>
                        <input
                          type="email"
                          value={String(form[dept.key as keyof SmtpForm] || '')}
                          onChange={e => setForm(f => ({ ...f, [dept.key]: e.target.value }))}
                          className="w-full h-8 text-xs bg-white border border-slate-200 px-3 rounded-lg text-slate-900 focus:outline-none focus:border-[#0f3156]"
                        />
                      </div>

                      <div className="pt-2 border-t border-slate-200/80">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-purple-900 mb-3">
                          <input
                            type="checkbox"
                            checked={Boolean(customCfg.enabled)}
                            onChange={(e) => updateAccountRoute(currentEmail, 'enabled', e.target.checked)}
                            className="rounded text-purple-600"
                          />
                          <span>Bu departament üçün fərdi SMTP server istifadə et</span>
                        </label>

                        {customCfg.enabled && (
                          <div className="space-y-3 bg-white p-3.5 rounded-lg border border-purple-100">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="sm:col-span-2">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">
                                  Xüsusi Server (Host)
                                </label>
                                <input
                                  type="text"
                                  value={customCfg.host || ''}
                                  onChange={(e) => updateAccountRoute(currentEmail, 'host', e.target.value)}
                                  placeholder="mail.azexbuy.com və ya smtp.office365.com"
                                  className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 rounded text-slate-900 focus:outline-none focus:border-[#0f3156]"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">
                                  Port
                                </label>
                                <input
                                  type="text"
                                  value={customCfg.port || '587'}
                                  onChange={(e) => updateAccountRoute(currentEmail, 'port', e.target.value)}
                                  placeholder="587 və ya 465"
                                  className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 rounded text-slate-900 focus:outline-none focus:border-[#0f3156]"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">
                                  İstifadəçi adı
                                </label>
                                <input
                                  type="text"
                                  value={customCfg.user || ''}
                                  onChange={(e) => updateAccountRoute(currentEmail, 'user', e.target.value)}
                                  placeholder={currentEmail}
                                  className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 rounded text-slate-900 focus:outline-none focus:border-[#0f3156]"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">
                                  Şifrə
                                </label>
                                <div className="relative">
                                  <input
                                    type={showAccPw[dept.key] ? 'text' : 'password'}
                                    value={customCfg.password || ''}
                                    onChange={(e) => updateAccountRoute(currentEmail, 'password', e.target.value)}
                                    placeholder="Fərdi şifrə"
                                    className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 pr-8 rounded text-slate-900 focus:outline-none focus:border-[#0f3156]"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowAccPw(p => ({ ...p, [dept.key]: !p[dept.key] }))}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                                  >
                                    {showAccPw[dept.key] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                                <input
                                  type="checkbox"
                                  checked={Boolean(customCfg.secure)}
                                  onChange={(e) => updateAccountRoute(currentEmail, 'secure', e.target.checked)}
                                  className="rounded text-[#0f3156]"
                                />
                                <span>SSL/TLS (Port 465)</span>
                              </label>

                              <button
                                type="button"
                                onClick={() => handleTest(currentEmail, currentEmail)}
                                disabled={testing || !customCfg.host || !customCfg.user}
                                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded cursor-pointer disabled:opacity-40 transition-colors"
                              >
                                Bu Şöbədən Test Göndər
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Real-time Email Logs Table */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-600" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Son E-poçt Göndəriş Logları (Audit)
              </h2>
            </div>
            <button
              type="button"
              onClick={fetchEmailLogs}
              disabled={loadingLogs}
              className="px-3 py-1 text-xs border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin' : ''}`} />
              <span>Yenilə</span>
            </button>
          </div>

          {logs.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              Hələ heç bir e-poçt qeydə alınmayıb.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-mono text-[10px] uppercase">
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Alıcı</th>
                    <th className="py-2.5 px-3">Mövzu</th>
                    <th className="py-2.5 px-3">Tarix</th>
                    <th className="py-2.5 px-3">Qeyd / Xəta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.slice(0, 15).map(l => (
                    <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          l.status === 'sent'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : l.status === 'failed'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {l.status === 'sent' ? 'Göndərildi' : l.status === 'failed' ? 'Xəta' : 'Buraxıldı'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-800 font-medium whitespace-nowrap">
                        {l.recipient}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 max-w-xs truncate font-medium">
                        {l.subject}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                        {new Date(l.created_at).toLocaleString('az-AZ')}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 max-w-sm truncate text-[11px]">
                        {l.error_message || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Bottom Save Action */}
        <div className="flex justify-end pb-8">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="h-10 px-8 flex items-center gap-2 text-xs font-bold bg-[#0f3156] hover:bg-[#1a4a7a] text-white rounded-xl disabled:opacity-50 cursor-pointer shadow-sm transition-colors"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Bütün SMTP Parametrlərini Yadda Saxla</span>
          </button>
        </div>

      </div>
    </div>
  );
};
