import React, { useState } from 'react';
import { Locale, ViewMode, getLocalizedText } from '../types';
import { useLocalization } from '../context/LocalizationContext';

interface AboutViewProps {
  locale: Locale;
  onOpenRFQ: () => void;
  onOpenProducer: () => void;
  onNavigate: (v: ViewMode) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ locale, onOpenRFQ, onOpenProducer, onNavigate }) => {
  const { about } = useLocalization();
  const [activeActivity, setActiveActivity] = useState<number | null>(null);

  // Helper for localized text
  const t = (textObj: any): string => {
    return getLocalizedText(textObj, locale);
  };

  return (
    <div className="bg-white">

      {/* ═══════════════════════════════════════════════════════════
          01 — WHO WE ARE (Biz Kimik?)
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-20 border-b border-gray-100">
        <div className="custom-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div>
              <span className="text-[11px] font-extrabold tracking-widest uppercase text-brandGreen block mb-3">
                {t(about.whoWeAre.badge)}
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-brandNavy leading-tight mb-6">
                {t(about.whoWeAre.title)}
              </h1>
              <p className="text-base text-gray-700 leading-relaxed mb-5">
                {t(about.whoWeAre.p1)}
              </p>
              <p className="text-sm text-gray-600 leading-relaxed mb-5">
                {t(about.whoWeAre.p2)}
              </p>
              <p className="text-sm text-gray-600 leading-relaxed mb-8">
                {t(about.whoWeAre.p3)}
              </p>

              {/* Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(about.whoWeAre.pillars || []).map((p, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="w-8 h-8 rounded bg-brandNavy/10 flex items-center justify-center shrink-0">
                      <i className={`${p.icon} text-brandNavy text-sm`}></i>
                    </div>
                    <span className="text-xs font-semibold text-gray-800 leading-snug">{t(p.label)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Image */}
            <div className="relative rounded-2xl overflow-hidden h-80 lg:h-[480px] shadow-xl group">
              <img
                src={about.whoWeAre.image || 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&q=80'}
                alt="International trade and logistics"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brandNavy/80 via-brandNavy/30 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-white text-sm sm:text-base font-bold leading-snug block mb-1">
                  {t(about.whoWeAre.imageTagline)}
                </span>
                <span className="text-brandGreen text-xs font-semibold">
                  {t(about.whoWeAre.imageSub)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          02 — ACTIVITIES (Fəaliyyətimiz)
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-14 bg-slate-50/60 border-b border-gray-100">
        <div className="custom-container">
          <div className="max-w-2xl mb-10">
            <span className="text-[11px] font-extrabold tracking-widest uppercase text-brandGreen block mb-2">
              {t(about.activities.badge)}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brandNavy mb-3">
              {t(about.activities.title)}
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {t(about.activities.desc)}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {(about.activities.items || []).map((act, i) => (
              <div
                key={i}
                className={`bg-white border rounded-xl p-5 cursor-pointer transition-all hover:shadow-md ${
                  activeActivity === i ? 'border-brandNavy shadow-md ring-1 ring-brandNavy/20' : 'border-gray-200'
                }`}
                onClick={() => setActiveActivity(activeActivity === i ? null : i)}
              >
                <div className={`w-12 h-12 rounded-xl ${act.color || 'bg-brandNavy'} text-white flex items-center justify-center text-xl mb-4 shadow-sm`}>
                  <i className={act.icon}></i>
                </div>
                <h3 className="text-sm font-extrabold text-gray-900 mb-2 leading-snug">
                  {t(act.title)}
                </h3>
                <p className={`text-xs text-gray-500 leading-relaxed transition-all overflow-hidden ${
                  activeActivity === i ? 'max-h-60' : 'max-h-12 line-clamp-3'
                }`}>
                  {t(act.desc)}
                </p>
                <button
                  type="button"
                  className="mt-3 text-[10px] font-bold text-brandNavy hover:text-brandGreen flex items-center gap-1 cursor-pointer"
                >
                  <span>{activeActivity === i ? (locale === 'AZ' ? 'Az göstər' : locale === 'TR' ? 'Daha az' : locale === 'RU' ? 'Свернуть' : 'Show less') : (locale === 'AZ' ? 'Ətraflı' : locale === 'TR' ? 'Devamını oku' : locale === 'RU' ? 'Подробнее' : 'Read more')}</span>
                  <i className={`fa-solid fa-chevron-${activeActivity === i ? 'up' : 'down'} text-[8px]`}></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          03 — MISSION & VISION (Missiya və Vizyon)
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-14 border-b border-gray-100">
        <div className="custom-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Mission */}
            <div className="relative rounded-2xl overflow-hidden min-h-[320px] flex items-end shadow-md">
              <img
                src={about.missionVision.missionImage || 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80'}
                alt="Mission"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-brandNavy/85 backdrop-blur-[1px]"></div>
              <div className="relative z-10 p-8">
                <span className="text-[10px] font-extrabold tracking-widest uppercase text-brandGreen block mb-2">
                  {t(about.missionVision.missionBadge)}
                </span>
                <h2 className="text-xl font-extrabold text-white mb-3">
                  {t(about.missionVision.missionTitle)}
                </h2>
                <p className="text-sm text-white/90 leading-relaxed">
                  {t(about.missionVision.missionDesc)}
                </p>
              </div>
            </div>

            {/* Vision */}
            <div className="relative rounded-2xl overflow-hidden min-h-[320px] flex items-end shadow-md">
              <img
                src={about.missionVision.visionImage || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80'}
                alt="Vision"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-emerald-950/85 backdrop-blur-[1px]"></div>
              <div className="relative z-10 p-8">
                <span className="text-[10px] font-extrabold tracking-widest uppercase text-emerald-300 block mb-2">
                  {t(about.missionVision.visionBadge)}
                </span>
                <h2 className="text-xl font-extrabold text-white mb-3">
                  {t(about.missionVision.visionTitle)}
                </h2>
                <p className="text-sm text-white/90 leading-relaxed">
                  {t(about.missionVision.visionDesc)}
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          04 — HOW WE WORK (Xidmət Modelimiz)
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-14 bg-slate-50/60 border-b border-gray-100">
        <div className="custom-container">
          <div className="max-w-2xl mb-10">
            <span className="text-[11px] font-extrabold tracking-widest uppercase text-brandGreen block mb-2">
              {t(about.serviceModel.badge)}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brandNavy mb-3">
              {t(about.serviceModel.title)}
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {t(about.serviceModel.desc)}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(about.serviceModel.steps || []).map((s, i) => (
              <div key={i} className={`${s.bgColor || 'bg-slate-50'} border ${s.borderColor || 'border-slate-200'} rounded-xl p-6 relative overflow-hidden shadow-sm`}>
                <div className={`w-12 h-12 ${s.color || 'bg-brandNavy'} text-white rounded-xl flex items-center justify-center text-xl mb-4 shadow-sm`}>
                  <i className={s.icon}></i>
                </div>
                <div className="absolute top-4 right-4 text-5xl font-black text-gray-200 select-none leading-none opacity-60">
                  {s.step}
                </div>
                <h3 className="text-base font-extrabold text-gray-900 mb-2 relative z-10">{t(s.title)}</h3>
                <p className="text-sm text-gray-600 leading-relaxed relative z-10">{t(s.desc)}</p>
              </div>
            ))}
          </div>

          {about.serviceModel.bottomNote && (
            <div className="mt-8 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <p className="text-sm text-gray-600 leading-relaxed flex items-start gap-3">
                <i className="fa-solid fa-circle-check text-brandGreen text-base mt-0.5 shrink-0"></i>
                <span>{t(about.serviceModel.bottomNote)}</span>
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          05 — SECTORS (Fəaliyyət Sahələri)
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-14 border-b border-gray-100">
        <div className="custom-container">
          <div className="max-w-2xl mb-10">
            <span className="text-[11px] font-extrabold tracking-widest uppercase text-brandGreen block mb-2">
              {t(about.sectors.badge)}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brandNavy mb-3">
              {t(about.sectors.title)}
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {t(about.sectors.desc)}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {(about.sectors.items || []).map((s, i) => (
              <div key={i} className="group relative rounded-xl overflow-hidden h-48 cursor-pointer shadow-sm">
                <img
                  src={s.image}
                  alt={t(s.title)}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className={`w-8 h-8 ${s.color || 'bg-brandNavy'} rounded-lg text-white flex items-center justify-center text-xs mb-2 shadow`}>
                    <i className={s.icon}></i>
                  </div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-white leading-snug">{t(s.title)}</h3>
                  <p className="text-[11px] text-white/75 leading-tight mt-1 line-clamp-2">{t(s.desc)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          06 — VALUES (Dəyərlərimiz)
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-14 bg-slate-50/60 border-b border-gray-100">
        <div className="custom-container">
          <div className="max-w-2xl mb-10">
            <span className="text-[11px] font-extrabold tracking-widest uppercase text-brandGreen block mb-2">
              {t(about.values.badge)}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brandNavy mb-3">
              {t(about.values.title)}
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {t(about.values.desc)}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {(about.values.items || []).map((v, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className={`w-11 h-11 ${v.color || 'text-brandNavy bg-brandNavy/10'} rounded-xl flex items-center justify-center text-xl mb-4`}>
                  <i className={v.icon}></i>
                </div>
                <h3 className="text-sm font-extrabold text-gray-900 mb-2">{t(v.title)}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{t(v.desc)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          07 — PARTNERSHIP MODEL (İş Birliyi Modeli)
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-14 border-b border-gray-100">
        <div className="custom-container">
          <div className="max-w-2xl mb-10">
            <span className="text-[11px] font-extrabold tracking-widest uppercase text-brandGreen block mb-2">
              {t(about.partnership.badge)}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brandNavy mb-3">
              {t(about.partnership.title)}
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {t(about.partnership.desc)}
            </p>
          </div>

          {/* Hub & Spoke Diagram */}
          <div className="relative">
            {/* Center hub */}
            <div className="flex justify-center mb-8">
              <div className="bg-brandNavy text-white rounded-2xl px-8 py-4 text-center shadow-lg border border-slate-700/50">
                <div className="flex items-center gap-2.5 justify-center mb-1">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 100 100">
                    <circle cx="50" cy="20" fill="#009775" r="14"/>
                    <circle cx="80" cy="50" fill="#3b82f6" r="14"/>
                    <circle cx="50" cy="80" fill="#e63946" r="14"/>
                    <circle cx="20" cy="50" fill="#f4a261" r="14"/>
                  </svg>
                  <span className="text-lg font-black tracking-tight text-white">AZEXBUY</span>
                </div>
                <span className="text-[10px] text-brandGreen font-bold uppercase tracking-wider block">Trade Facilitation Gateway</span>
              </div>
            </div>

            {/* Partner cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {(about.partnership.items || []).map((p, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow relative">
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-px h-5 bg-gray-200 hidden lg:block"></div>
                  <div className={`w-11 h-11 ${p.color || 'bg-brandNavy'} text-white rounded-xl flex items-center justify-center text-xl mb-4 shadow-sm`}>
                    <i className={p.icon}></i>
                  </div>
                  <h3 className="text-sm font-extrabold text-gray-900 mb-2 leading-snug">{t(p.title)}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{t(p.desc)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          08 — GROWTH (Gələcəyə Baxış)
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-14 bg-slate-50/60 border-b border-gray-100">
        <div className="custom-container">
          <div className="max-w-2xl mb-10">
            <span className="text-[11px] font-extrabold tracking-widest uppercase text-brandGreen block mb-2">
              {t(about.growth.badge)}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brandNavy mb-3">
              {t(about.growth.title)}
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {t(about.growth.desc)}
            </p>
          </div>

          <div className="space-y-4">
            {(about.growth.items || []).map((g, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 flex items-start gap-5 hover:shadow-md transition-shadow">
                <div className="shrink-0 w-14 h-14 rounded-xl bg-brandNavy/5 border border-brandNavy/10 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-extrabold text-brandNavy/40 leading-none">{g.num}</span>
                  <i className={`${g.icon} text-brandNavy text-lg mt-0.5`}></i>
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900 mb-1">{t(g.title)}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{t(g.desc)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          10 — CTA (İş Birliyinə Dəvət)
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 bg-brandNavy">
        <div className="custom-container text-center">
          <span className="text-[11px] font-extrabold tracking-widest uppercase text-brandGreen block mb-3">
            {t(about.cta.badge)}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 max-w-2xl mx-auto leading-tight">
            {t(about.cta.title)}
          </h2>
          <p className="text-sm text-blue-200 mb-8 max-w-xl mx-auto leading-relaxed">
            {t(about.cta.desc)}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={onOpenRFQ}
              className="flex items-center gap-2.5 bg-white text-brandNavy font-extrabold text-sm px-7 py-3.5 rounded-full hover:bg-blue-50 transition-all shadow-lg cursor-pointer"
            >
              <i className="fa-solid fa-cart-shopping text-brandNavy"></i>
              <span>{t(about.cta.buyerBtn)}</span>
            </button>
            <button
              type="button"
              onClick={onOpenProducer}
              className="flex items-center gap-2.5 bg-brandGreen text-white font-extrabold text-sm px-7 py-3.5 rounded-full hover:bg-brandGreenDark transition-all shadow-lg cursor-pointer"
            >
              <i className="fa-solid fa-seedling"></i>
              <span>{t(about.cta.producerBtn)}</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('contact')}
              className="flex items-center gap-2 border border-white/30 text-white font-bold text-sm px-6 py-3.5 rounded-full hover:border-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <i className="fa-solid fa-envelope text-xs"></i>
              <span>{t(about.cta.contactBtn)}</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};