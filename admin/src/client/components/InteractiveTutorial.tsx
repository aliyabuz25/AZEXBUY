import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutGrid, 
  Layers, 
  Search, 
  Database, 
  Palette, 
  Terminal, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  X,
  Compass,
  ArrowRight,
  ShieldCheck,
  Globe,
  Clock
} from 'lucide-react';
import { UiLanguage } from '../types';

interface InteractiveTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  uiLang?: UiLanguage;
}

interface TutorialStep {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  highlight: string;
  icon: React.FC<{ className?: string }>;
  tag: string;
  mockupType: 'dashboard' | 'tabs' | 'seo' | 'records' | 'theme' | 'command';
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'dashboard',
    badge: 'Mərhələ 01 / 06',
    title: 'Canlı İcmal & Real Göstəricilər',
    subtitle: 'Sistemin anlıq vəziyyəti və dinamik metrikalar',
    description: 'Panelə daxil olduqda ilk qarşılaşdığınız mərkəzi canlı icmaldır. Burada saytın real məlumat bazası qeydləri, Google axtarış sisteminə uyğun hesablanan real SEO skoru, yüklənmiş medianın disk həcmi və 4-dilli tərcümə aktivləri əks olunur.',
    highlight: 'Bütün rəqəmlər və qrafiklər sistemin real SQLite bazasından anlıq hesablanır.',
    icon: LayoutGrid,
    tag: 'İcmal & Metrikalar',
    mockupType: 'dashboard'
  },
  {
    id: 'tabs',
    badge: 'Mərhələ 02 / 06',
    title: 'Çoxlu Vərəqlər (Multi-Tab Workspace)',
    subtitle: 'Eyni anda paralel modullarda çevik iş rejimi',
    description: 'Müasir brauzer vərəqləri kimi eyni vaxtda birdən çox bölməni (SEO Menecer, Media, Məlumat Bazası, Ayarlar) açıq saxlaya bilərsiniz. Vərəqləri bağlaya, "+" düyməsi ilə yenisini əlavə edə və aralarında sərbəst keçid edə bilərsiniz.',
    highlight: 'Aktiv vərəq vəziyyəti avtomatik yadda saxlanılır və səhifə yeniləndikdə itmir.',
    icon: Layers,
    tag: 'Vərəqlər & Naviqasiya',
    mockupType: 'tabs'
  },
  {
    id: 'seo',
    badge: 'Mərhələ 03 / 06',
    title: 'Axtarış & Real Google SERP İdarəetməsi',
    subtitle: 'Meta başlıqlar, kanonik linklər və robot qaydaları',
    description: 'Meta Title, Meta Description, Canonical URL və OpenGraph sosial şəbəkə parametrlərini real vaxtda redaktə edin. Canlı Google axtarış önizləməsi və real-time SEO diaqnostikası səhifənizi axtarış mühərrikləri üçün ən ideal hala gətirir.',
    highlight: 'Robot indeksləmə qaydaları və sitemap parametrləri anlıq yenilənir.',
    icon: Search,
    tag: 'Axtarış & SEO',
    mockupType: 'seo'
  },
  {
    id: 'records',
    badge: 'Mərhələ 04 / 06',
    title: 'Məzmun, Media & 4-Dilli Lokalizasiya',
    subtitle: 'Baza sətirləri, Multer media və çoxdilli mərkəz',
    description: 'Bütün saytın məzmun sətirlərini mərkəzləşdirilmiş cədvəldən idarə edin. Media bölməsində faylları sürükləyib (Drag & Drop) yükləyin və URL-i tək kliklə kopyalayın. Lokalizasiya mərkəzində Azərbaycan, Türk, Rus və İngilis dillərində mətnləri canlı tənzimləyin.',
    highlight: 'Yüklənmiş aktivlər Multer mühərriki vasitəsilə təhlükəsiz qorunur.',
    icon: Database,
    tag: 'Məzmun & Dillər',
    mockupType: 'records'
  },
  {
    id: 'theme',
    badge: 'Mərhələ 05 / 06',
    title: '8 Rəng Teması & Təhlükəsiz Sistem Yeniləməsi',
    subtitle: 'Fərdi vizual üslublar, SQLite backup və atomik yeniləmə',
    description: 'Yuxarıdakı "Tema" menyusundan 8 yüksək keyfiyyətli flat rəng sxemindən birini (Nordic, Emerald, Cyber, Obsidian, Amber və s.) seçə bilərsiniz. Bütün saytın tam nüsxəsini tək kliklə .sqlite formatında endirə və rəsmi mərkəzdən qorunan rejimdə sistemi yeniləyə bilərsiniz.',
    highlight: 'Yenilənmələr zamanı mövcud məlumat bazası və fayllar 100% toxunulmaz qalır.',
    icon: Palette,
    tag: 'Temalar & Yeniləmə',
    mockupType: 'theme'
  },
  {
    id: 'command',
    badge: 'Mərhələ 06 / 06',
    title: 'Sürətli Əmr Palitrası (CMD+K) & Sessiya',
    subtitle: 'Sürətli qısayollar, dairəvi PFP və aktiv sessiya taymeri',
    description: 'İstənilən vaxt klaviaturadan CMD+K (və ya Ctrl+K) basaraq bütün menyular, temalar və funksiyalar arasında anlıq axtarış edin. Sol altdakı tema rənglərinə uyğun dairəvi profil şəklinizdən sessiya vaxtınızı izləyin və təhlükəsiz çıxış (Logout) edin.',
    highlight: 'Sistem Apple SF Pro şrifti və tam stabil arxitektura ilə təchiz edilib.',
    icon: Terminal,
    tag: 'Sürətli İdarəetmə',
    mockupType: 'command'
  }
];

export const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({
  isOpen,
  onClose,
  uiLang = 'az'
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Keyboard navigation: ArrowLeft, ArrowRight, Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        if (currentStepIndex < TUTORIAL_STEPS.length - 1) {
          setCurrentStepIndex(prev => prev + 1);
        } else {
          handleComplete();
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentStepIndex > 0) {
          setCurrentStepIndex(prev => prev - 1);
        }
      } else if (e.key === 'Escape') {
        handleComplete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex]);

  const handleNext = () => {
    if (currentStepIndex < TUTORIAL_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('octotech_tutorial_completed', 'true');
    }
    onClose();
  };

  if (!isOpen) return null;

  const currentStep = TUTORIAL_STEPS[currentStepIndex];
  const StepIcon = currentStep.icon;
  const progressPercent = Math.round(((currentStepIndex + 1) / TUTORIAL_STEPS.length) * 100);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-3 sm:p-6 select-none">
        {/* Semi-transparent Backdrop with Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleComplete}
          className="absolute inset-0 bg-black/65 backdrop-blur-xs"
        />

        {/* Modal Window: Flat, Köşeli, Apple SF Pro */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 12 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-none border border-slate-300 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Top Progress Line */}
          <div className="w-full h-1 bg-slate-200 dark:bg-slate-800">
            <motion.div 
              className="h-full bg-slate-900 dark:bg-white"
              initial={false}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>

          {/* Header Bar */}
          <div className="px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-slate-900 dark:bg-white inline-block" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono">
                Sistem Bələdçisi (Tutorial)
              </span>
              <span className="text-[11px] font-mono text-slate-500 font-semibold">
                [{currentStep.badge}]
              </span>
            </div>

            <button
              onClick={handleComplete}
              className="text-xs font-medium text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              title="Turu bağla"
            >
              <span>Burax</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Main Content Area */}
          <div className="p-6 sm:p-7 space-y-5">
            {/* Step Architectural Micro Preview */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono text-xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shrink-0">
                    <StepIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase text-slate-400">
                      Aktiv İnterfeys Bölməsi
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {currentStep.tag}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                  {currentStepIndex + 1} / {TUTORIAL_STEPS.length}
                </span>
              </div>

              {/* Dynamic Micro Graphic Representation */}
              {currentStep.mockupType === 'dashboard' && (
                <div className="grid grid-cols-4 gap-2 pt-1">
                  <div className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <span className="block text-[9px] text-slate-400 uppercase">Qeydlər</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">100% Real</span>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <span className="block text-[9px] text-slate-400 uppercase">SEO</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Dinamik</span>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <span className="block text-[9px] text-slate-400 uppercase">Media</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Fayl Həcmi</span>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <span className="block text-[9px] text-slate-400 uppercase">Dillər</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">4 Dil</span>
                  </div>
                </div>
              )}

              {currentStep.mockupType === 'tabs' && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-700 pb-1.5 overflow-x-auto">
                    <span className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 font-semibold text-[11px] text-slate-900 dark:text-white flex items-center gap-1.5">
                      <LayoutGrid className="w-3 h-3" /> Canlı İcmal
                    </span>
                    <span className="px-2.5 py-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 text-[11px] flex items-center gap-1.5">
                      <Search className="w-3 h-3" /> Axtarış & SEO
                    </span>
                    <span className="px-2 py-1 text-slate-400 text-[11px]">+</span>
                  </div>
                  <div className="text-[11px] text-slate-500 pt-1">
                    İstədiyiniz qədər vərəq açıb aralarında anlıq keçid edin.
                  </div>
                </div>
              )}

              {currentStep.mockupType === 'seo' && (
                <div className="space-y-2 pt-1">
                  <div className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1">
                    <div className="text-[10px] text-slate-400">google.com • Önizləmə</div>
                    <div className="text-xs font-bold text-blue-600 dark:text-blue-400">Səhifə Başlığı (Meta Title) | Rəsmi Portal</div>
                    <div className="text-[10.5px] text-slate-600 dark:text-slate-300">Axtarış sistemlərində görünəcək dolğun meta təsvir mətni...</div>
                  </div>
                </div>
              )}

              {currentStep.mockupType === 'records' && (
                <div className="space-y-1.5 pt-1">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <span className="block text-[9.5px] text-slate-400 uppercase">Məzmun</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Baza Sətirləri</span>
                    </div>
                    <div className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <span className="block text-[9.5px] text-slate-400 uppercase">Yükləmə</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Multer Engine</span>
                    </div>
                    <div className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <span className="block text-[9.5px] text-slate-400 uppercase">Tərcümələr</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">AZ, TR, RU, EN</span>
                    </div>
                  </div>
                </div>
              )}

              {currentStep.mockupType === 'theme' && (
                <div className="flex items-center gap-2 pt-1 overflow-x-auto">
                  <span className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs font-semibold">Nordic Glacier</span>
                  <span className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs font-semibold">Emerald</span>
                  <span className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs font-semibold">Obsidian Dark</span>
                  <span className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs font-semibold">Cyberpunk</span>
                  <span className="px-2 py-1 bg-slate-900 text-white text-xs font-bold">+4 Tema</span>
                </div>
              )}

              {currentStep.mockupType === 'command' && (
                <div className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-xs text-slate-700 dark:text-slate-300">Əmr axtarışı və sürətli naviqasiya...</span>
                  </div>
                  <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px] font-bold">
                    CMD + K
                  </span>
                </div>
              )}
            </div>

            {/* Step Texts */}
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                {currentStep.title}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {currentStep.description}
              </p>
            </div>

            {/* Step Key Highlight Box */}
            <div className="p-3 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-slate-700 dark:text-slate-300 shrink-0" />
              <span className="text-slate-700 dark:text-slate-200 font-medium">
                {currentStep.highlight}
              </span>
            </div>
          </div>

          {/* Stepper Footer Controls */}
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
            {/* Step Dots Indicators */}
            <div className="flex items-center gap-1.5">
              {TUTORIAL_STEPS.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`h-1.5 transition-all cursor-pointer ${
                    idx === currentStepIndex 
                      ? 'w-6 bg-slate-900 dark:bg-white' 
                      : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                  }`}
                  title={`${idx + 1}-ci mərhələyə keç`}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={currentStepIndex === 0}
                className="h-8 px-3 rounded-none border border-slate-300 dark:border-slate-700 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Geri</span>
              </button>

              <button
                onClick={handleNext}
                className="h-8 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white rounded-none text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {currentStepIndex === TUTORIAL_STEPS.length - 1 ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Turu Bitir və Başla</span>
                  </>
                ) : (
                  <>
                    <span>Növbəti</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
