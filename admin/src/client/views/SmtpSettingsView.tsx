import React, { useState, useEffect } from 'react';
import {
  Mail, Save, CheckCircle, XCircle, RefreshCw, Eye, EyeOff,
  Send, Wifi, WifiOff, Info,
} from 'lucide-react';
import { UiLanguage } from '../types';

interface SmtpSettingsViewProps { uiLang: UiLanguage; }

interface SmtpForm {
  host: string; port: string; secure: boolean;
  user: string; password: string;
  from_name: string; from_email: string;
  notify_email: string; enabled: boolean;
  rfq_email: string; producer_email: string; contact_email: string;
  info_email: string; akbar_email: string; sales_email: string;
  export_email: string; sourcing_email: string; logistics_email: string;
  procurement_email: string; partnerships_email: string; support_email: string;
  finance_email: string; ahmed_email: string;
}

const EMPTY: SmtpForm = {
  host: '', port: '587', secure: false,
  user: '', password: '',
  from_name: 'AZEXBUY', from_email: '',
  notify_email: '', enabled: false,
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
};

const PRESETS = [
  { label: 'Gmail', host: 'smtp.gmail.com', port: '587', secure: false },
  { label: 'Outlook', host: 'smtp-mail.outlook.com', port: '587', secure: false },
  { label: 'Yahoo', host: 'smtp.mail.yahoo.com', port: '465', secure: true },
  { label: 'Zoho', host: 'smtp.zoho.com', port: '587', secure: false },
  { label: 'SendGrid', host: 'smtp.sendgrid.net', port: '587', secure: false },
  { label: 'Mailgun', host: 'smtp.mailgun.org', port: '587', secure: false },
];

export const SmtpSettingsView: React.FC<SmtpSettingsViewProps> = () => {
  const [form, setForm] = useState<SmtpForm>({ ...EMPTY });
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [testing, setTesting] = useState(false);
  const [testMsg, setTestMsg] = useState<{ ok: boolean; msg: string } | null>(null);
  const [testTo, setTestTo] = useState('');
  const [loading, setLoading] = useState(true);

  const token = () => localStorage.getItem('octotech_admin_jwt') || sessionStorage.getItem('octotech_admin_jwt') || '';
  const authH = () => ({ Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' });

  const flash = (msg: string) => { setSavedMsg(msg); setTimeout(() => setSavedMsg(''), 3000); };

  useEffect(() => {
    fetch('/api/smtp-settings', { headers: authH() })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d) setForm({
          host: d.host || '', port: String(d.port || 587), secure: Boolean(d.secure),
          user: d.user || '', password: d.password || '',
          from_name: d.from_name || 'AZEXBUY', from_email: d.from_email || '',
          notify_email: d.notify_email || '', enabled: Boolean(d.enabled),
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
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const r = await fetch('/api/smtp-settings', {
      method: 'POST', headers: authH(),
      body: JSON.stringify({ ...form, port: parseInt(form.port) || 587 }),
    });
    setSaving(false);
    if (r.ok) flash('SMTP ayarları saxlandı.');
    else flash('Xəta baş verdi.');
  };

  const handleTest = async () => {
    if (!testTo.trim()) { setTestMsg({ ok: false, msg: 'Test e-poçt ünvanı daxil edin.' }); return; }
    setTesting(true);
    setTestMsg(null);
    const r = await fetch('/api/smtp-test', {
      method: 'POST', headers: authH(),
      body: JSON.stringify({
        host: form.host, port: parseInt(form.port) || 587,
        secure: form.secure, user: form.user,
        password: form.password !== '••••••••' ? form.password : undefined,
        from_name: form.from_name, from_email: form.from_email,
        to: testTo,
      }),
    });
    const d = await r.json();
    setTestMsg({ ok: r.ok && d.success, msg: d.message || d.error || (r.ok ? 'Göndərildi' : 'Xəta') });
    setTesting(false);
  };

  const applyPreset = (p: typeof PRESETS[0]) => {
    setForm(f => ({ ...f, host: p.host, port: p.port, secure: p.secure }));
  };

  const F = ({ label, name, type = 'text', placeholder = '' }: { label: string; name: keyof SmtpForm; type?: string; placeholder?: string }) => (
    <div>
      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">{label}</label>
      <input
        type={name === 'password' ? (showPw ? 'text' : 'password') : type}
        value={form[name] as string}
        onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
        placeholder={placeholder}
        className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 focus:outline-none focus:border-[#0f3156] rounded-sm text-slate-900"
      />
    </div>
  );

  if (loading) return (
    <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
      <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Yüklənir...
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50/50">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-[#0f3156] flex items-center justify-center">
            <Mail className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900">SMTP E-poçt Ayarları</h1>
            <p className="text-[10px] text-slate-400">RFQ və İstehsalçı qeydiyyatlarında bildiriş e-poçtu göndərilir</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {savedMsg && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-sm">
              <CheckCircle className="w-3 h-3" />{savedMsg}
            </div>
          )}
          <div className={`flex items-center gap-1.5 text-[10px] font-medium px-2 py-1 rounded-sm border ${form.enabled ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-slate-400 bg-slate-100 border-slate-200'}`}>
            {form.enabled ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {form.enabled ? 'E-poçt aktiv' : 'E-poçt deaktiv'}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* Enable toggle */}
        <div className="bg-white border border-slate-200 rounded p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-800">E-poçt Bildirişlərini Aktiv Et</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Yeni RFQ və İstehsalçı qeydiyyatlarında avtomatik e-poçt göndərilir</div>
          </div>
          <button
            onClick={() => setForm(f => ({ ...f, enabled: !f.enabled }))}
            className={`w-10 h-5 rounded-full transition-colors relative ${form.enabled ? 'bg-[#0f3156]' : 'bg-slate-200'}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.enabled ? 'left-5' : 'left-0.5'}`} />
          </button>
        </div>

        {/* Provider presets */}
        <div className="bg-white border border-slate-200 rounded p-4 space-y-3">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Sürətli Konfiqurasiya</div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(p => (
              <button key={p.label} onClick={() => applyPreset(p)}
                className="h-7 px-3 text-xs border border-slate-200 hover:border-[#0f3156] hover:text-[#0f3156] rounded-sm transition-colors text-slate-600">
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* SMTP Config */}
        <div className="bg-white border border-slate-200 rounded p-4 space-y-4">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">SMTP Server</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <F label="SMTP Host" name="host" placeholder="smtp.gmail.com" />
            </div>
            <F label="Port" name="port" placeholder="587" />
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setForm(f => ({ ...f, secure: !f.secure }))}
              className={`w-8 h-4 rounded-full transition-colors relative shrink-0 ${form.secure ? 'bg-[#0f3156]' : 'bg-slate-200'}`}>
              <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all ${form.secure ? 'left-4' : 'left-0.5'}`} />
            </button>
            <label className="text-xs text-slate-700 cursor-pointer" onClick={() => setForm(f => ({ ...f, secure: !f.secure }))}>
              SSL/TLS (port 465 üçün aktiv et)
            </label>
          </div>
        </div>

        {/* Auth */}
        <div className="bg-white border border-slate-200 rounded p-4 space-y-4">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Kimlik Doğrulama</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <F label="İstifadəçi adı / E-poçt" name="user" placeholder="you@gmail.com" />
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Şifrə / App Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Gmail → App Passwords"
                  className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 pr-8 focus:outline-none focus:border-[#0f3156] rounded-sm text-slate-900"
                />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                  {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[9px] text-slate-400 mt-1">Gmail üçün: Google Hesabı → Təhlükəsizlik → App Passwords</p>
            </div>
          </div>
        </div>

        {/* Department Routing Emails */}
        <div className="bg-white border border-slate-200 rounded p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
              Şöbələr & Daxili E-poçt Yönləndirmələri (Routing)
            </div>
            <span className="text-[10px] text-slate-400">Gələn sorğular və bildirişlər müvafiq şöbələrə paylanır</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <F label="info@azexbuy.com (Ümumi müraciətlər)" name="info_email" placeholder="info@azexbuy.com" />
            <F label="akbar@azexbuy.com (Şəxsi iş e-poçtu)" name="akbar_email" placeholder="akbar@azexbuy.com" />
            <F label="ahmed@azexbuy.com (İkinci əməkdaş)" name="ahmed_email" placeholder="ahmed@azexbuy.com" />
            <F label="sales@azexbuy.com (Satış & Yeni müştərilər)" name="sales_email" placeholder="sales@azexbuy.com" />
            <F label="export@azexbuy.com (İxrac & İstehsalçılar)" name="export_email" placeholder="export@azexbuy.com" />
            <F label="sourcing@azexbuy.com (Məhsul & Təchizatçı)" name="sourcing_email" placeholder="sourcing@azexbuy.com" />
            <F label="logistics@azexbuy.com (Daşınma & Logistika)" name="logistics_email" placeholder="logistics@azexbuy.com" />
            <F label="procurement@azexbuy.com (Alıcı sorğuları / RFQ)" name="procurement_email" placeholder="procurement@azexbuy.com" />
            <F label="partnerships@azexbuy.com (Beynəlxalq tərəfdaşlıq)" name="partnerships_email" placeholder="partnerships@azexbuy.com" />
            <F label="support@azexbuy.com (Müştəri dəstəyi)" name="support_email" placeholder="support@azexbuy.com" />
            <F label="finance@azexbuy.com (Maliyyə & Ödənişlər)" name="finance_email" placeholder="finance@azexbuy.com" />
          </div>
        </div>

        {/* From & Notify */}
        <div className="bg-white border border-slate-200 rounded p-4 space-y-4">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Göndərici & Bildiriş</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <F label="Göndərici Adı" name="from_name" placeholder="AZEXBUY" />
            <F label="Göndərici E-poçt" name="from_email" placeholder="noreply@azexbuy.az" />
          </div>
          <div>
            <F label="Bildiriş E-poçtu (alıcı)" name="notify_email" placeholder="admin@azexbuy.az" />
            <div className="flex items-start gap-1.5 mt-1.5">
              <Info className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
              <p className="text-[9px] text-slate-400">Hər yeni RFQ və İstehsalçı qeydiyyatında bu e-poçtuna bildiriş göndərilir</p>
            </div>
          </div>
        </div>

        {/* Test */}
        <div className="bg-white border border-slate-200 rounded p-4 space-y-3">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Bağlantı Testi</div>
          <div className="flex gap-2">
            <input type="email" value={testTo} onChange={e => setTestTo(e.target.value)}
              placeholder="test@example.com"
              className="flex-1 h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 focus:outline-none focus:border-[#0f3156] rounded-sm text-slate-900" />
            <button onClick={handleTest} disabled={testing || !form.host || !form.user}
              className="h-8 px-4 flex items-center gap-1.5 text-xs font-bold border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-sm disabled:opacity-40">
              {testing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              Test E-poçtu Göndər
            </button>
          </div>
          {testMsg && (
            <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-sm border ${testMsg.ok ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
              {testMsg.ok ? <CheckCircle className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0" />}
              {testMsg.msg}
            </div>
          )}
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving}
            className="h-9 px-6 flex items-center gap-2 text-xs font-bold bg-[#0f3156] hover:bg-[#081c33] text-white rounded-sm disabled:opacity-50">
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Ayarları Saxla
          </button>
        </div>

      </div>
    </div>
  );
};
