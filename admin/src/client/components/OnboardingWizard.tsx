import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { UiLanguage } from '../types';

interface OnboardingWizardProps {
  isOpen: boolean;
  onComplete: (data: any) => void;
  uiLang: UiLanguage;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  isOpen,
  onComplete,
  uiLang
}) => {
  const [step, setStep] = useState<number>(1);
  const [brandName, setBrandName] = useState('Octotech Store');
  const [brandDomain, setBrandDomain] = useState('');
  const [industry, setIndustry] = useState('E-ticarət & Onlayn Mağaza');
  const [engine, setEngine] = useState('Next.js + Headless Engine');

  const [adminName, setAdminName] = useState('Admin');
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminEmail, setAdminEmail] = useState('admin@octotech.az');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminRole, setAdminRole] = useState('Super Admin (Tam Səlahiyyət)');

  const [systemLang, setSystemLang] = useState<UiLanguage>(uiLang);
  const [multerSize, setMulterSize] = useState(25);
  const [multerMime, setMulterMime] = useState('image/jpeg,image/png,image/webp,image/svg+xml,application/pdf');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin || `${window.location.protocol}//${window.location.host}`;
      setBrandDomain(origin);
    }
  }, []);

  if (!isOpen) return null;

  const handleNextFrom1 = () => {
    if (!brandName.trim()) {
      setErrorMsg('Zəhmət olmasa marka adını daxil edin.');
      return;
    }
    setErrorMsg('');
    setStep(2);
  };

  const handleNextFrom2 = () => {
    if (!adminName.trim() || !adminEmail.trim()) {
      setErrorMsg('Zəhmət olmasa admin adı və e-poçtunu daxil edin.');
      return;
    }
    if (!adminUsername.trim() || adminUsername.trim().length < 3) {
      setErrorMsg('İstifadəçi adı ən az 3 simvol olmalıdır.');
      return;
    }
    setErrorMsg('');
    setStep(3);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrorMsg('');
    const payload = {
      site: {
        name: brandName.trim(),
        domain: brandDomain || window.location.origin,
        type: engine,
        endpoint: `${brandDomain || window.location.origin}/api/v1`
      },
      admin: {
        fullName: adminName.trim(),
        username: adminUsername.trim() || 'admin',
        email: adminEmail.trim(),
        role: adminRole,
        password: adminPassword.trim() || undefined
      },
      uploadConfig: {
        maxFileSizeMB: Number(multerSize) || 20,
        allowedMimeTypes: multerMime.trim(),
        uploadDir: 'uploads'
      },
      industry
    };

    try {
      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        onComplete({ ...data.data, systemLang });
      } else {
        setErrorMsg(data.error || 'Quraşdırma zamanı xəta baş verdi');
      }
    } catch (err) {
      setErrorMsg('Serverlə əlaqə qurularkən xəta baş verdi');
    } finally {
      setSubmitting(false);
    }
  };

  // 3D Card Stacking Physics:
  // Step 1: Card 1 active, Card 2 & 3 underneath
  // Step 2: Card 1 flipped away to top-left, Card 2 active, Card 3 underneath
  // Step 3: Card 1 & 2 flipped away to top-left, Card 3 active
  const getCardAnimation = (cardIndex: number) => {
    if (step === cardIndex) {
      return {
        x: 0,
        y: 0,
        z: 30,
        rotateZ: 0,
        rotateY: 0,
        scale: 1,
        opacity: 1,
        filter: 'blur(0px)',
        pointerEvents: 'auto' as const,
        zIndex: 30
      };
    } else if (cardIndex < step) {
      // Discarded to top-left ("sol tepeye çevrilsin")
      const offset = (step - cardIndex);
      return {
        x: -450 - offset * 80,
        y: -90 - offset * 40,
        z: 20 - offset * 5,
        rotateZ: -28 - offset * 6,
        rotateY: 10,
        scale: 0.84 - offset * 0.05,
        opacity: 0,
        filter: 'blur(3px)',
        pointerEvents: 'none' as const,
        zIndex: 25 - offset
      };
    } else {
      // Underneath in the deck ("altından çıxsın")
      const depth = cardIndex - step;
      return {
        x: 0,
        y: depth * 16,
        z: -depth * 25,
        rotateZ: depth % 2 === 1 ? 1.9 : -2.1,
        rotateY: 0,
        scale: 1 - depth * 0.04,
        opacity: Math.max(0.7, 1 - depth * 0.12),
        filter: 'blur(0px)',
        pointerEvents: 'none' as const,
        zIndex: 20 - depth * 5
      };
    }
  };

  const springTransition = {
    type: 'spring' as const,
    stiffness: 140,
    damping: 18,
    mass: 0.8
  };

  return (
    <div className="fixed inset-0 z-[99999] w-screen h-screen bg-white flex items-center justify-center overflow-hidden select-none">
      <div className="relative w-full max-w-[560px] h-[490px] px-4 perspective-[1800px]">
        
        {/* ================= CARD 1: BREND & SAYT ================= */}
        <motion.div
          animate={getCardAnimation(1)}
          transition={springTransition}
          className="absolute inset-0 bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-9 flex flex-col justify-between shadow-[0_30px_70px_-15px_rgba(15,23,42,0.11)]"
        >
          <div>
            <h2 className="text-[22px] font-semibold text-slate-900 tracking-tight">Brendinizi Tanıdaq</h2>
            <p className="text-[13px] text-slate-500 mt-1">Admin paneli hansı marka və sayt üçün formalaşdırırıq?</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-5">
              <div>
                <label className="block text-[12px] font-medium text-slate-700 mb-1.5">Marka / Layihə Adı *</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Məs: Octotech Store"
                  className="w-full h-10 px-3.5 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-slate-700 mb-1.5">Saytın Domeni *</label>
                <input
                  type="text"
                  value={brandDomain}
                  onChange={(e) => setBrandDomain(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full h-10 px-3.5 rounded-lg border border-slate-200 bg-white text-[12.5px] font-mono text-slate-700 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-slate-700 mb-1.5">Sənaye / Təyinat</label>
                <div className="relative">
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full h-10 px-3.5 pr-9 appearance-none rounded-lg border border-slate-200 bg-white text-[13px] text-slate-900 font-medium cursor-pointer focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                  >
                    <option value="E-ticarət & Onlayn Mağaza">E-ticarət & Onlayn Mağaza</option>
                    <option value="Korporativ Şirkət Portalı">Korporativ Şirkət Portalı</option>
                    <option value="Xəbər & Media Platforması">Xəbər & Media Platforması</option>
                    <option value="SaaS & Proqram Təminatı">SaaS & Proqram Təminatı</option>
                    <option value="Fərdi / Xüsusi Layihə">Fərdi / Xüsusi Layihə</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-slate-700 mb-1.5">Mühərrik Növü</label>
                <div className="relative">
                  <select
                    value={engine}
                    onChange={(e) => setEngine(e.target.value)}
                    className="w-full h-10 px-3.5 pr-9 appearance-none rounded-lg border border-slate-200 bg-white text-[13px] text-slate-900 font-medium cursor-pointer focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                  >
                    <option value="Next.js + Headless Engine">Next.js + Headless Engine</option>
                    <option value="Shopify Storefront">Shopify Storefront</option>
                    <option value="WordPress REST API">WordPress REST API</option>
                    <option value="Node.js Custom API">Node.js Custom API</option>
                    <option value="Supabase / PostgreSQL">Supabase / PostgreSQL</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {errorMsg && step === 1 && (
              <p className="text-[12px] text-rose-500 font-medium mt-3">{errorMsg}</p>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
            <div />
            <button
              onClick={handleNextFrom1}
              className="h-10 px-5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-medium flex items-center gap-2 shadow-sm transition-all hover:translate-y-[-1px]"
            >
              <span>Növbəti</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* ================= CARD 2: ADMIN SETUP ================= */}
        <motion.div
          animate={getCardAnimation(2)}
          transition={springTransition}
          className="absolute inset-0 bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-9 flex flex-col justify-between shadow-[0_30px_70px_-15px_rgba(15,23,42,0.11)]"
        >
          <div className="overflow-y-auto max-h-[340px] pr-1">
            <h2 className="text-[22px] font-semibold text-slate-900 tracking-tight">Admin Hesabını Quraşdıraq</h2>
            <p className="text-[13px] text-slate-500 mt-1">Sistemi idarə edəcək əsas inzibatçını müəyyən edin.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-5">
              <div>
                <label className="block text-[12px] font-medium text-slate-700 mb-1.5">Ad və Soyad *</label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Məs: Əli Əliyev"
                  className="w-full h-10 px-3.5 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-slate-700 mb-1.5">İstifadəçi Adı *</label>
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                  placeholder="admin"
                  className="w-full h-10 px-3.5 rounded-lg border border-slate-200 bg-white text-[13px] font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-slate-700 mb-1.5">E-poçt Ünvanı *</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@octotech.az"
                  className="w-full h-10 px-3.5 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-slate-700 mb-1.5">İnzibatçı Şifrəsi</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Şifrə təyin edin"
                  className="w-full h-10 px-3.5 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-slate-700 mb-1.5">Sistemdəki Rol</label>
                <div className="relative">
                  <select
                    value={adminRole}
                    onChange={(e) => setAdminRole(e.target.value)}
                    className="w-full h-10 px-3.5 pr-9 appearance-none rounded-lg border border-slate-200 bg-white text-[13px] text-slate-900 font-medium cursor-pointer focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                  >
                    <option value="Super Admin (Tam Səlahiyyət)">Super Admin (Tam Səlahiyyət)</option>
                    <option value="Texniki Menecer (CTO / Dev)">Texniki Menecer (CTO / Dev)</option>
                    <option value="Məzmun & SEO Meneceri">Məzmun & SEO Meneceri</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {errorMsg && step === 2 && (
              <p className="text-[12px] text-rose-500 font-medium mt-3">{errorMsg}</p>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
            <button
              onClick={() => setStep(1)}
              className="h-10 px-4 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-[13px] font-medium flex items-center gap-1.5 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Geri</span>
            </button>
            <button
              onClick={handleNextFrom2}
              className="h-10 px-5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-medium flex items-center gap-2 shadow-sm transition-all hover:translate-y-[-1px]"
            >
              <span>Növbəti</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* ================= CARD 3: MULTER & SYSTEM ================= */}
        <motion.div
          animate={getCardAnimation(3)}
          transition={springTransition}
          className="absolute inset-0 bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-9 flex flex-col justify-between shadow-[0_30px_70px_-15px_rgba(15,23,42,0.11)]"
        >
          <div>
            <h2 className="text-[22px] font-semibold text-slate-900 tracking-tight">Sistem & Multer Ayarları</h2>
            <p className="text-[13px] text-slate-500 mt-1">Panelin dilini və fayl saxlama qaydalarını tənzimləyin.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-5">
              <div>
                <label className="block text-[12px] font-medium text-slate-700 mb-1.5">Əsas Panel Dili</label>
                <div className="relative">
                  <select
                    value={systemLang}
                    onChange={(e) => setSystemLang(e.target.value as UiLanguage)}
                    className="w-full h-10 px-3.5 pr-9 appearance-none rounded-lg border border-slate-200 bg-white text-[13px] text-slate-900 font-medium cursor-pointer focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                  >
                    <option value="az">Azərbaycan dili (Standart)</option>
                    <option value="tr">Türkçe</option>
                    <option value="ru">Русский</option>
                    <option value="en">English</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-slate-700 mb-1.5">Maksimum Fayl Həcmi (MB)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={multerSize}
                  onChange={(e) => setMulterSize(Number(e.target.value))}
                  className="w-full h-10 px-3.5 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[12px] font-medium text-slate-700 mb-1.5">İcazə Verilən Fayl Növləri (MIME)</label>
                <input
                  type="text"
                  value={multerMime}
                  onChange={(e) => setMulterMime(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-lg border border-slate-200 bg-white text-[12.5px] font-mono text-slate-700 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                />
              </div>
            </div>

            {errorMsg && step === 3 && (
              <p className="text-[12px] text-rose-500 font-medium mt-3">{errorMsg}</p>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
            <button
              onClick={() => setStep(2)}
              className="h-10 px-4 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-[13px] font-medium flex items-center gap-1.5 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Geri</span>
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="h-10 px-5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-medium flex items-center gap-2 shadow-sm transition-all hover:translate-y-[-1px] disabled:opacity-60"
            >
              <span>{submitting ? 'Yüklənir...' : 'Sistemi Başlat'}</span>
              <Check className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
};
