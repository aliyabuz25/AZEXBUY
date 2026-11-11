import React, { useState, useEffect } from 'react';
import {
  Mail, Save, CheckCircle, XCircle, RefreshCw, Eye, EyeOff,
  Send, Wifi, WifiOff, Info, ChevronDown, ChevronUp, Server, Shield
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
}

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
  email_routes?: Record<string, AccountSmtpConfig>;
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
  email_routes: {},
};

const PRESETS = [
  { label: 'Gmail', host: 'smtp.gmail.com', port: '587', secure: false },
  { label: 'Outlook', host: 'smtp-mail.outlook.com', port: '587', secure: false },
  { label: 'Yahoo', host: 'smtp.mail.yahoo.com', port: '465', secure: true },
  { label: 'Zoho', host: 'smtp.zoho.com', port: '587', secure: false },
  { label: 'SendGrid', host: 'smtp.sendgrid.net', port: '587', secure: false },
  { label: 'Mailgun', host: 'smtp.mailgun.org', port: '587', secure: false },
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
  const [form, setForm] = useState<SmtpForm>({ ...EMPTY });
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [testing, setTesting] = useState(false);
  const [testMsg, setTestMsg] = useState<{ ok: boolean; msg: string } | null>(null);
  const [testTo, setTestTo] = useState('');
  const [loading, setLoading] = useState(true);

  // Per-account customization accordion
  const [expandedAcc, setExpandedAcc] = useState<string | null>(null);
  const [showAccPw, setShowAccPw] = useState<Record<string, boolean>>({});

  const token = typeof window !== 'undefined' ? localStorage.getItem('azexbuy_admin_token') : null;
  const authH = () => ({
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  });

  useEffect(() => {
    fetch('/api/smtp-settings', { headers: authH() })
      .then(r => r.json())
      .then(d => {
        if (d && !d.error) {
          setForm({
            host: d.host || '',
            port: String(d.port || 587),
            secure: Boolean(d.secure),
            user: d.user || '',
            password: d.password || '',
            from_name: d.from_name || 'AZEXBUY',
            from_email: d.from_email || '',
            notify_email: d.notify_email || '',
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
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSavedMsg('');
    try {
      const r = await fetch('/api/smtp-settings', {
        method: 'POST',
        headers: authH(),
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (d.success) {
        setSavedMsg('✅ Bütün qlobal və fərdi SMTP parametrləri uğurla saxlanıldı');
        setTimeout(() => setSavedMsg(''), 4000);
      }
    } catch {
      setSavedMsg('Xəta baş verdi');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testTo) return;
    setTesting(true);
    setTestMsg(null);
    try {
      const r = await fetch('/api/smtp-test', {
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
          to: testTo,
        }),
      });
      const d = await r.json();
      if (d.success) setTestMsg({ ok: true, msg: 'Test məktubu göndərildi!' });
      else setTestMsg({ ok: false, msg: d.error || 'Bağlantı xətası' });
    } catch (e: any) {
      setTestMsg({ ok: false, msg: e.message || 'Xəta baş verdi' });
    } finally {
      setTesting(false);
    }
  };

  const applyPreset = (p: typeof PRESETS[0]) => {
    setForm(f => ({ ...f, host: p.host, port: p.port, secure: p.secure }));
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

  const F = ({ label, name, placeholder }: { label: string; name: keyof SmtpForm; placeholder?: string }) => (
    <div>
      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{label}</label>
      <input
        type="text"
        value={String(form[name] || '')}
        onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
        placeholder={placeholder}
        className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 focus:outline-none focus:border-[#0f3156] rounded-sm text-slate-900"
      />
    </div>
  );

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center gap-2 text-xs text-slate-400">
        <RefreshCw className="w-4 h-4 animate-spin" /> Yüklənir...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0f3156]/10 flex items-center justify-center text-[#0f3156]">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800">SMTP Server & Çoxsaylı Poçt Quraşdırması</h1>
            <p className="text-[11px] text-slate-400">Qlobal göndərici və ya hər departament üçün fərqli server, port və şifrə</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {savedMsg && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" /> {savedMsg}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="h-8 px-4 flex items-center gap-1.5 text-xs font-bold bg-[#0f3156] hover:bg-[#081c33] text-white rounded-lg transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Ayarları Saxla
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Enable toggle */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-2xs">
          <div>
            <div className="text-xs font-bold text-slate-800">E-poçt Bildirişlərini Aktiv Et</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Yeni RFQ, İstehsalçı qeydiyyatları və Trade Desk sorğularında avtomatik e-poçt göndərilir</div>
          </div>
          <button
            onClick={() => setForm(f => ({ ...f, enabled: !f.enabled }))}
            className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${form.enabled ? 'bg-[#0f3156]' : 'bg-slate-200'}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.enabled ? 'left-5' : 'left-0.5'}`} />
          </button>
        </div>

        {/* Global SMTP Config */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
              <Server className="w-4 h-4 text-[#0f3156]" />
              <span>Əsas (Qlobal) SMTP Server</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map(p => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="h-6 px-2.5 text-[11px] border border-slate-200 hover:border-[#0f3156] hover:text-[#0f3156] rounded-md transition-colors text-slate-600 cursor-pointer font-medium"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <F label="SMTP Host" name="host" placeholder="smtp.gmail.com və ya mail.azexbuy.com" />
            </div>
            <F label="Port" name="port" placeholder="587 və ya 465" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <F label="İstifadəçi adı / E-poçt" name="user" placeholder="noreply@azexbuy.com" />
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Şifrə / App Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Şifrə"
                  className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 pr-8 focus:outline-none focus:border-[#0f3156] rounded-sm text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, secure: !f.secure }))}
              className={`w-8 h-4 rounded-full transition-colors relative shrink-0 cursor-pointer ${form.secure ? 'bg-[#0f3156]' : 'bg-slate-200'}`}
            >
              <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all ${form.secure ? 'left-4' : 'left-0.5'}`} />
            </button>
            <label className="text-xs text-slate-700 cursor-pointer" onClick={() => setForm(f => ({ ...f, secure: !f.secure }))}>
              SSL/TLS (Port 465 üçün aktivləşdirin)
            </label>
          </div>
        </div>

        {/* PER-ACCOUNT DEDICATED SMTP CONFIGURATOR */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-2xs">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-600" />
              <span>Hər E-poçt Üçün Fərqli Server, Port & Şifrə (Per-Account SMTP)</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              İstənilən departament poçtu üçün fərdi SMTP serveri təyin edə bilərsiniz. Fərdi parametr daxil edilmədikdə yuxarıdakı Əsas SMTP istifadə olunur.
            </p>
          </div>

          <div className="space-y-2">
            {DEPARTMENTS.map((dept) => {
              const currentEmail = String(form[dept.key as keyof SmtpForm] || dept.email);
              const customCfg = form.email_routes?.[currentEmail.toLowerCase().trim()] || {};
              const isExpanded = expandedAcc === dept.key;
              const hasCustom = Boolean(customCfg.host && customCfg.user);

              return (
                <div key={dept.key} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                  <div
                    onClick={() => setExpandedAcc(isExpanded ? null : dept.key)}
                    className="p-3 bg-white flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${hasCustom ? 'bg-purple-600' : 'bg-slate-300'}`} />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">{dept.title}</span>
                        <span className="text-[11px] font-mono text-slate-500">{currentEmail}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasCustom && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                          Fərdi SMTP Aktiv
                        </span>
                      )}
                      <button type="button" className="text-slate-400 hover:text-slate-600 p-1">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 border-t border-slate-200 bg-white space-y-3 animate-in fade-in duration-100">
                      <div className="text-[11px] text-purple-900 bg-purple-50 p-2.5 rounded-lg border border-purple-100">
                        Bu şöbəyə göndərilən və ya onun adından çıxan e-poçtlar üçün aşağıdakı xüsusi server istifadə olunacaq:
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Xüsusi Server (Host)</label>
                          <input
                            type="text"
                            value={customCfg.host || ''}
                            onChange={(e) => updateAccountRoute(currentEmail, 'host', e.target.value)}
                            placeholder="mail.azexbuy.com və ya smtp.office365.com"
                            className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 rounded text-slate-900 focus:outline-none focus:border-[#0f3156]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Port</label>
                          <input
                            type="text"
                            value={customCfg.port || '587'}
                            onChange={(e) => updateAccountRoute(currentEmail, 'port', e.target.value)}
                            placeholder="587"
                            className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 rounded text-slate-900 focus:outline-none focus:border-[#0f3156]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">İstifadəçi adı (Username / Email)</label>
                          <input
                            type="text"
                            value={customCfg.user || ''}
                            onChange={(e) => updateAccountRoute(currentEmail, 'user', e.target.value)}
                            placeholder={currentEmail}
                            className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 rounded text-slate-900 focus:outline-none focus:border-[#0f3156]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Xüsusi Şifrə (Password)</label>
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

                      <div className="flex items-center gap-3 pt-1">
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                          <input
                            type="checkbox"
                            checked={Boolean(customCfg.secure)}
                            onChange={(e) => updateAccountRoute(currentEmail, 'secure', e.target.checked)}
                            className="rounded text-[#0f3156]"
                          />
                          <span>SSL/TLS (Port 465)</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Global From & Notify */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-2xs">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">Ümumi Göndərici & Bildiriş</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <F label="Göndərici Adı" name="from_name" placeholder="AZEXBUY" />
            <F label="Göndərici E-poçt" name="from_email" placeholder="noreply@azexbuy.com" />
          </div>
          <div>
            <F label="Bildirişlərin Kopyası (Admin Alıcı E-poçtu)" name="notify_email" placeholder="admin@azexbuy.com" />
          </div>
        </div>

        {/* Test Send */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-2xs">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">SMTP Bağlantı Testi</div>
          <div className="flex gap-2">
            <input
              type="email"
              value={testTo}
              onChange={e => setTestTo(e.target.value)}
              placeholder="test@example.com"
              className="flex-1 h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 focus:outline-none focus:border-[#0f3156] rounded-lg text-slate-900"
            />
            <button
              type="button"
              onClick={handleTest}
              disabled={testing || !form.host || !form.user}
              className="h-8 px-4 flex items-center gap-1.5 text-xs font-bold border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg disabled:opacity-40 cursor-pointer"
            >
              {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Test Məktubu Göndər
            </button>
          </div>
          {testMsg && (
            <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg border ${testMsg.ok ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
              {testMsg.ok ? <CheckCircle className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
              {testMsg.msg}
            </div>
          )}
        </div>

        {/* Save button bottom */}
        <div className="flex justify-end pb-6">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="h-9 px-6 flex items-center gap-2 text-xs font-bold bg-[#0f3156] hover:bg-[#081c33] text-white rounded-lg disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Bütün Parametrləri Yadda Saxla
          </button>
        </div>
      </div>
    </div>
  );
};
