import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, AlertCircle, RefreshCw, ChevronDown, ShieldCheck } from 'lucide-react';

export interface EmailOption {
  email: string;
  name: string;
  dept: string;
}

export const SYSTEM_NOTIFICATION_EMAILS: EmailOption[] = [
  { email: 'procurement@azexbuy.com', name: 'Satınalma & RFQ Masası', dept: 'Satınalma' },
  { email: 'export@azexbuy.com', name: 'İxrac Masası & İstehsalçılar', dept: 'İxrac' },
  { email: 'info@azexbuy.com', name: 'Ümumi İnformasiya & Qəbul', dept: 'Ümumi' },
  { email: 'sales@azexbuy.com', name: 'Beynəlxalq Satış & B2B', dept: 'Satış' },
  { email: 'logistics@azexbuy.com', name: 'Logistika & Orta Dəhliz', dept: 'Logistika' },
  { email: 'sourcing@azexbuy.com', name: 'Məhsul Axtarışı (Sourcing)', dept: 'Təchizat' },
  { email: 'akbar@azexbuy.com', name: 'Əkbər (Ticarət Rəhbəri)', dept: 'Rəhbərlik' },
  { email: 'ahmed@azexbuy.com', name: 'Əhməd (Əməliyyatlar Masası)', dept: 'Əməliyyat' },
  { email: 'support@azexbuy.com', name: 'Müştəri Dəstəyi & Trade Desk AI', dept: 'Dəstək' },
  { email: 'partnerships@azexbuy.com', name: 'Strateji Tərəfdaşlıqlar', dept: 'Tərəfdaşlıq' },
  { email: 'finance@azexbuy.com', name: 'Maliyyə & Mühasibatlıq', dept: 'Maliyyə' },
];

interface ModalEmailSelectorProps {
  value?: string;
  onChange: (email: string) => void;
  defaultEmail?: string;
  modalName: string;
  helpText?: string;
}

export const ModalEmailSelector: React.FC<ModalEmailSelectorProps> = ({
  value,
  onChange,
  defaultEmail = 'info@azexbuy.com',
  modalName,
  helpText,
}) => {
  const currentEmail = (value || defaultEmail).trim();
  const isPredefined = SYSTEM_NOTIFICATION_EMAILS.some(
    (opt) => opt.email.toLowerCase() === currentEmail.toLowerCase()
  );

  const [isCustom, setIsCustom] = useState<boolean>(!isPredefined && Boolean(value));
  const [customValue, setCustomValue] = useState<string>(!isPredefined ? currentEmail : '');
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setTestResult(null);
    if (val === '__custom__') {
      setIsCustom(true);
      if (customValue) onChange(customValue);
    } else {
      setIsCustom(false);
      onChange(val);
    }
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomValue(val);
    onChange(val);
  };

  const handleSendTestEmail = async () => {
    const targetEmail = (isCustom ? customValue : currentEmail).trim();
    if (!targetEmail || !targetEmail.includes('@')) {
      setTestResult({
        success: false,
        message: 'Zəhmət olmasa düzgün e-poçt ünvanı seçin və ya daxil edin.',
      });
      return;
    }

    try {
      setTesting(true);
      setTestResult(null);
      const token =
        localStorage.getItem('octotech_admin_jwt') ||
        sessionStorage.getItem('octotech_admin_jwt') ||
        '';

      const res = await fetch('/api/smtp-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: targetEmail,
          departmentEmail: targetEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'SMTP test xətası baş verdi');
      }

      setTestResult({
        success: true,
        message: `✓ Test məktubu "${targetEmail}" ünvanına uğurla göndərildi! SMTP problemsiz işləyir.`,
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Xəta: ${err.message || 'Serverlə əlaqə qurula bilmədi'}`,
      });
    } finally {
      setTesting(false);
    }
  };

  const selectedOption = SYSTEM_NOTIFICATION_EMAILS.find(
    (opt) => opt.email.toLowerCase() === currentEmail.toLowerCase()
  );

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-xs space-y-3.5">
      {/* Header with Title and SMTP Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Bildirişlərin Göndəriləcəyi E-poçt Ünvanı
              <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                SMTP İnteqrasiyası
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {helpText ||
                `Ziyarətçi saytda "${modalName}" formasını göndərdikdə bildiriş məktubu birbaşa bu ünvana çatdırılır.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>SMTP Bağlantısı Aktiv</span>
        </div>
      </div>

      {/* Dropdown & Action Row */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
        <div className={isCustom ? 'sm:col-span-5' : 'sm:col-span-8'}>
          <div className="relative">
            <select
              value={isCustom ? '__custom__' : currentEmail}
              onChange={handleSelectChange}
              className="w-full h-9 pl-3 pr-8 text-xs font-semibold bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-[#0f3156] focus:ring-1 focus:ring-[#0f3156]/20 transition-all cursor-pointer appearance-none shadow-2xs"
            >
              {SYSTEM_NOTIFICATION_EMAILS.map((opt) => (
                <option key={opt.email} value={opt.email}>
                  {opt.email} — {opt.name} ({opt.dept})
                </option>
              ))}
              <option value="__custom__">+ Başqa fərdi e-poçt ünvanı daxil et...</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {isCustom && (
          <div className="sm:col-span-4">
            <input
              type="email"
              value={customValue}
              onChange={handleCustomChange}
              placeholder="nümunə@azexbuy.com və ya fərdi ünvan"
              className="w-full h-9 px-3 text-xs bg-white border border-blue-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#0f3156] focus:ring-1 focus:ring-[#0f3156]/20 shadow-2xs font-mono"
            />
          </div>
        )}

        <div className={isCustom ? 'sm:col-span-3' : 'sm:col-span-4'}>
          <button
            type="button"
            onClick={handleSendTestEmail}
            disabled={testing}
            className="w-full h-9 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
            title="Seçilmiş ünvana SMTP vasitəsilə dərhal test bildirişi göndər"
          >
            {testing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Göndərilir...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Test Göndər</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Selected Email Details & Dept Hint */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>
            Hazırkı qəbul ünvanı:{' '}
            <b className="text-slate-800 font-mono select-all">
              {isCustom ? customValue || '—' : currentEmail}
            </b>
            {selectedOption && (
              <span className="ml-1 text-slate-500">({selectedOption.name})</span>
            )}
          </span>
        </div>
      </div>

      {/* Test Notification Result Banner */}
      {testResult && (
        <div
          className={`p-3 rounded-lg text-xs flex items-start gap-2.5 transition-all ${
            testResult.success
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {testResult.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <span className="leading-relaxed">{testResult.message}</span>
        </div>
      )}
    </div>
  );
};
