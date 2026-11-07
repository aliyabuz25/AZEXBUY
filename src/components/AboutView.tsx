import React, { useState } from 'react';
import { Locale, ViewMode } from '../types';

interface AboutViewProps {
  locale: Locale;
  onOpenRFQ: () => void;
  onOpenProducer: () => void;
  onNavigate: (v: ViewMode) => void;
}

// ─── Data ───────────────────────────────────────────────────────────────────────

const ACTIVITIES = [
  {
    icon: 'fa-solid fa-globe',
    color: 'bg-blue-600',
    title: 'İhracatın Geliştirilmesi',
    titleEN: 'Export Development',
    desc: 'Azerbaycanlı üreticilerin ürünleri için pazar imkânlarının araştırılması, hedef ülkelerin belirlenmesi və ihracat strategiyasının formalaşdırılmasına dəstək.',
    descEN: 'Market research for Azerbaijani producers, target country identification and export strategy development support.',
  },
  {
    icon: 'fa-solid fa-handshake',
    color: 'bg-emerald-600',
    title: 'Uluslararası Alıcıların Bulunması',
    titleEN: 'Finding International Buyers',
    desc: 'Yerli ürünlere uygun yabancı alıcıların, ithalatçıların, distribütörlerin ve ticari tarafların araştırılması.',
    descEN: 'Research and identification of foreign buyers, importers, distributors and trade partners suitable for local products.',
  },
  {
    icon: 'fa-solid fa-magnifying-glass',
    color: 'bg-violet-600',
    title: 'Tedarikçi ve Ürün Arama',
    titleEN: 'Supplier & Product Search',
    desc: 'Azerbaycan\'dan ürün almak isteyen yabancı şirketler için uygun üretici ve tedarikçilerin belirlenmesi.',
    descEN: 'Identifying suitable manufacturers and suppliers in Azerbaijan for foreign companies seeking to source products.',
  },
  {
    icon: 'fa-solid fa-comments',
    color: 'bg-amber-600',
    title: 'Ticari İlişkilerin Kurulması',
    titleEN: 'Building Trade Relations',
    desc: 'Alıcı ve satıcı arasında ilk temasların oluşturulması, ticari tekliflerin toplanması ve görüşmelerin koordinasyonu.',
    descEN: 'Establishing initial contacts between buyers and sellers, collecting trade offers and coordinating negotiations.',
  },
  {
    icon: 'fa-solid fa-truck',
    color: 'bg-cyan-600',
    title: 'İhracat ve Lojistik Desteği',
    titleEN: 'Export & Logistics Support',
    desc: 'Ticari evraklar, sertifikasyon, gümrük prosedürleri ve uluslararası taşıma aşamalarının koordinasyonu.',
    descEN: 'Coordination of trade documentation, certification, customs procedures and international shipping stages.',
  },
];

const VALUES = [
  {
    icon: 'fa-solid fa-user-check',
    color: 'text-blue-600 bg-blue-50',
    title: 'Müşteri Odaklılık',
    titleEN: 'Client Focus',
    desc: 'Her başvuru müşterinin somut ihtiyaçları ve ticari amaçları esasında değerlendirilir.',
    descEN: 'Every request is evaluated based on the client\'s specific needs and commercial objectives.',
  },
  {
    icon: 'fa-solid fa-eye',
    color: 'text-emerald-600 bg-emerald-50',
    title: 'Şeffaflık',
    titleEN: 'Transparency',
    desc: 'İş birliğinin aşamaları, hizmetin kapsamı ve tarafların yükümlülükleri hakkında net bilgi sunarız.',
    descEN: 'We provide clear information about the stages of cooperation, scope of services and obligations of parties.',
  },
  {
    icon: 'fa-solid fa-briefcase',
    color: 'text-violet-600 bg-violet-50',
    title: 'Profesyonellik',
    titleEN: 'Professionalism',
    desc: 'Uluslararası ticaret süreçlerine sistemli ve sorumlu yaklaşırız.',
    descEN: 'We approach international trade processes systematically and responsibly.',
  },
  {
    icon: 'fa-solid fa-link',
    color: 'text-amber-600 bg-amber-50',
    title: 'Güvenilir İş Birliği',
    titleEN: 'Reliable Partnership',
    desc: 'Alıcılar, üreticiler ve ticari taraflar arasında uzun vadeli iş birliği ilişkilerinin kurulmasını önemli sayarız.',
    descEN: 'We consider building long-term cooperation relationships between buyers, producers and trade parties as essential.',
  },
  {
    icon: 'fa-solid fa-sliders',
    color: 'text-cyan-600 bg-cyan-50',
    title: 'Esneklik',
    titleEN: 'Flexibility',
    desc: 'Farklı ürün kategorilerine, pazarlara ve müşteri taleplerine uygun yaklaşım uygularız.',
    descEN: 'We apply tailored approaches for different product categories, markets and client needs.',
  },
  {
    icon: 'fa-solid fa-seedling',
    color: 'text-green-600 bg-green-50',
    title: 'Sürdürülebilir Gelişim',
    titleEN: 'Sustainable Development',
    desc: 'Hizmet modelimizi, iş birliği imkânlarımızı ve uluslararası faaliyet yönlerimizi geliştirmeyi hedefleriz.',
    descEN: 'We aim to continuously improve our service model, cooperation opportunities and international activity directions.',
  },
];

const SECTORS = [
  { icon: 'fa-solid fa-wheat-awn', color: 'bg-green-700', title: 'Tarım ve Gıda', titleEN: 'Agriculture & Food', desc: 'Meyveler, fındık, tahıllar, işlenmiş gıdalar ve tarım ürünleri.', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80' },
  { icon: 'fa-solid fa-industry', color: 'bg-blue-700', title: 'İşleme Sanayisi', titleEN: 'Processing Industry', desc: 'Gıda işleme, ambalajlama ve sanayi üretimi.', image: 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=400&q=80' },
  { icon: 'fa-solid fa-building', color: 'bg-slate-600', title: 'İnşaat Malzemeleri', titleEN: 'Construction Materials', desc: 'Mermer, granit, kireçtaşı ve inşaat taşları.', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80' },
  { icon: 'fa-solid fa-cogs', color: 'bg-gray-700', title: 'Sanayi Ürünleri', titleEN: 'Industrial Products', desc: 'Metal, çelik, boru ve sanayi imalat ürünleri.', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80' },
  { icon: 'fa-solid fa-flask', color: 'bg-purple-700', title: 'Kimya ve Hammadde', titleEN: 'Chemicals & Raw Materials', desc: 'Polimer, gübre, petrokimya ve kimyasal ürünler.', image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&q=80' },
  { icon: 'fa-solid fa-bolt', color: 'bg-yellow-600', title: 'Elektrik ve Elektronik', titleEN: 'Electrical & Electronics', desc: 'Kablo, ekipman ve elektrik malzemeleri.', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80' },
  { icon: 'fa-solid fa-shirt', color: 'bg-pink-600', title: 'Tekstil ve Hafif Sanayi', titleEN: 'Textile & Light Industry', desc: 'Halı, kumaş, ipek ve tekstil ürünleri.', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80' },
  { icon: 'fa-solid fa-box-open', color: 'bg-orange-600', title: 'Diğer İhracat Ürünleri', titleEN: 'Other Export Products', desc: 'İhracat potansiyeline sahip diğer ürün kategorileri.', image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&q=80' },
];

const PARTNERS = [
  { icon: 'fa-solid fa-factory', color: 'bg-blue-600', title: 'Azerbaycanlı Üreticiler ve İhracatçılar', titleEN: 'Azerbaijani Producers & Exporters', desc: 'Ürünlerini yabancı pazarlara çıkarmak, potansiyel alıcılar bulmak ve ihracat imkânlarını genişletmek isteyen şirketler.' },
  { icon: 'fa-solid fa-ship', color: 'bg-emerald-600', title: 'Uluslararası Alıcılar ve İthalatçılar', titleEN: 'International Buyers & Importers', desc: 'Azerbaycan\'dan ürün, hammadde ve sanayi malları almak için uygun tedarikçi arayan şirketler.' },
  { icon: 'fa-solid fa-store', color: 'bg-violet-600', title: 'Distribütörler ve Toptan Satış', titleEN: 'Distributors & Wholesale', desc: 'Yeni ürün kategorileri ve tedarik kaynaklarıyla iş birliği yapmak isteyen ticari taraflar.' },
  { icon: 'fa-solid fa-network-wired', color: 'bg-amber-600', title: 'Ticari ve Hizmet Tarafları', titleEN: 'Trade & Service Partners', desc: 'Lojistik, sertifikasyon, gümrük, kalite denetimi ve diğer ilgili alanlarda faaliyet gösteren potansiyel hizmet sağlayıcılar.' },
];

const GROWTH_ITEMS = [
  { num: '01', icon: 'fa-solid fa-earth-americas', title: 'Yeni Uluslararası Pazarlara Çıkış', desc: 'Azerbaycan ürünleri için yeni ülke ve bölgelerde ticari imkânların araştırılması.' },
  { num: '02', icon: 'fa-solid fa-network-wired', title: 'Ortaklık Ağının Genişletilmesi', desc: 'Yabancı alıcılar, distribütörler, tedarikçiler ve hizmet sağlayıcılarla iş birliği ilişkilerinin gelişimi.' },
  { num: '03', icon: 'fa-solid fa-layer-group', title: 'Hizmet Portföyünün Genişletilmesi', desc: 'Pazar araştırması, satın alma, ihracat ve lojistik koordinasyonu üzere hizmet imkânlarının artırılması.' },
  { num: '04', icon: 'fa-solid fa-laptop-code', title: 'Dijital Hizmetlerin Gelişimi', desc: 'Müşteri başvurularının, ürün bilgilerinin ve ticari sorguların daha sistemli yönetilmesi.' },
  { num: '05', icon: 'fa-solid fa-chart-pie', title: 'Sektörler Üzere İhtisaslaşma', desc: 'Çeşitli ürün kategorilerinin ve ihracat yönlerinin gelişimine uygun hizmet modelinin şekillendirilmesi.' },
];

// ─── Component ──────────────────────────────────────────────────────────────────

export const AboutView: React.FC<AboutViewProps> = ({ locale, onOpenRFQ, onOpenProducer, onNavigate }) => {
  const [activeActivity, setActiveActivity] = useState<number | null>(null);

  const L = (az: string, tr: string, en: string, ru: string) =>
    locale === 'AZ' ? az : locale === 'TR' ? tr : locale === 'RU' ? ru : en;

  return (
    <div className="bg-white">

      {/* ═══════════════════════════════════════════════════════════
          01 — WHO WE ARE
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-20 border-b border-gray-100">
        <div className="custom-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div>
              <span className="text-[11px] font-extrabold tracking-widest uppercase text-brandGreen block mb-3">
                AZEXBUY · {L('KORPORATİV PROFİL', 'KURUMSAL PROFİL', 'CORPORATE PROFILE', 'КОРПОРАТИВНЫЙ ПРОФИЛЬ')}
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-brandNavy leading-tight mb-6">
                {L('Biz kimik?', 'Biz kimiz?', 'Who are we?', 'Кто мы?')}
              </h1>
              <p className="text-base text-gray-700 leading-relaxed mb-5">
                {L(
                  'AZEXBUY, Azərbaycan istehsalçıları ilə beynəlxalq bazarlar arasında ticarət əlaqələrinin qurulmasına, yerli məhsulların xarici alıcılara təqdim edilməsinə və beynəlxalq satınalma imkanlarının inkişafına dəstək verən ixracat və satınalma xidmətləri şirkətidir.',
                  'AZEXBUY, Azerbaycanlı üreticilerle uluslararası pazarlar arasında ticari ilişkilerin kurulmasına, yerli ürünlerin yabancı alıcılara sunulmasına ve uluslararası satın alma imkânlarının gelişmesine destek veren ihracat ve satın alma hizmetleri şirketidir.',
                  'AZEXBUY is an export and procurement services company supporting the establishment of trade relations between Azerbaijani producers and international markets, the presentation of local products to foreign buyers, and the development of international procurement opportunities.',
                  'AZEXBUY — компания экспортных и закупочных услуг, содействующая установлению торговых отношений между азербайджанскими производителями и международными рынками.'
                )}
              </p>
              <p className="text-sm text-gray-600 leading-relaxed mb-5">
                {L(
                  'Fəaliyyətimiz yerli istehsalçıların xarici bazarlara çıxış imkanlarının araşdırılmasını, potensial alıcıların tapılmasını, xarici şirkətlər üçün Azərbaycanda uyğun istehsalçı və tədarükçülərin müəyyənləşdirilməsini, ticarət təkliflərinin toplanmasını və beynəlxalq ticarət proseslərinin koordinasiyasını əhatə edir.',
                  'Faaliyetimiz yerli üreticilerin yabancı pazarlara çıkış imkânlarının araştırılmasını, potansiyel alıcıların bulunmasını, yabancı şirketler için Azerbaycan\'da uygun üretici ve tedarikçilerin belirlenmesini, ticari tekliflerin toplanmasını ve uluslararası ticaret süreçlerinin koordinasyonunu kapsar.',
                  'Our activities encompass researching market access opportunities for local producers, finding potential buyers, identifying suitable manufacturers and suppliers in Azerbaijan for foreign companies, collecting trade offers, and coordinating international trade processes.',
                  'Наша деятельность охватывает исследование возможностей выхода на зарубежные рынки, поиск потенциальных покупателей, определение подходящих производителей для иностранных компаний и координацию международных торговых процессов.'
                )}
              </p>
              <p className="text-sm text-gray-600 leading-relaxed mb-8">
                {L(
                  'Biz istehsalçılar, ixracatçılar, idxalatçılar və beynəlxalq ticarət tərəfləri arasında əlaqələrin qurulmasına kömək edərək Azərbaycan məhsullarının qlobal bazarlarda tanınmasına və yeni iş imkanlarının yaranmasına töhfə verməyi hədəfləyirik.',
                  'Biz üreticiler, ihracatçılar, ithalatçılar ve uluslararası ticari taraflar arasında ilişkilerin kurulmasına yardımcı olarak Azerbaycan ürünlerinin küresel pazarlarda tanınmasına ve yeni iş imkânlarının oluşmasına katkı vermeyi hedefliyoruz.',
                  'By facilitating connections between producers, exporters, importers and international trade parties, we aim to contribute to the global recognition of Azerbaijani products and the creation of new business opportunities.',
                  'Содействуя установлению связей между производителями, экспортёрами, импортёрами и международными торговыми сторонами, мы стремимся способствовать глобальному признанию азербайджанской продукции.'
                )}
              </p>

              {/* Three pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: 'fa-solid fa-arrow-up-right-dots', label: L('İxracatın İnkişafı', 'İhracatın Geliştirilmesi', 'Export Development', 'Развитие экспорта') },
                  { icon: 'fa-solid fa-magnifying-glass-location', label: L('Alıcı və Tədarükçü Axtarışı', 'Alıcı ve Tedarikçi Arama', 'Buyer & Supplier Search', 'Поиск покупателей и поставщиков') },
                  { icon: 'fa-solid fa-arrows-spin', label: L('Ticarət Proseslərinin Koordinasiyası', 'Ticaret Süreçlerinin Koordinasyonu', 'Trade Process Coordination', 'Координация торговых процессов') },
                ].map((p, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="w-8 h-8 rounded bg-brandNavy/10 flex items-center justify-center shrink-0">
                      <i className={`${p.icon} text-brandNavy text-sm`}></i>
                    </div>
                    <span className="text-xs font-semibold text-gray-800 leading-snug">{p.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Image */}
            <div className="relative rounded-2xl overflow-hidden h-80 lg:h-[480px] shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80"
                alt="International trade and logistics"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brandNavy/60 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-white text-sm font-bold leading-snug block">
                  Azerbaycan ürünlerini uluslararası pazarlara taşıyoruz
                </span>
                <span className="text-white/70 text-xs">Azerbaijan → Global Markets</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          02 — ACTIVITIES (Faaliyetimiz)
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-14 bg-slate-50/60 border-b border-gray-100">
        <div className="custom-container">
          <div className="max-w-2xl mb-10">
            <span className="text-[11px] font-extrabold tracking-widest uppercase text-brandGreen block mb-2">
              {L('FƏALİYYƏTİMİZ', 'FAALİYETİMİZ', 'OUR ACTIVITIES', 'НАША ДЕЯТЕЛЬНОСТЬ')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brandNavy mb-3">
              {L('Nə ilə məşğuluq?', 'Ne ile meşgulüz?', 'What do we do?', 'Чем мы занимаемся?')}
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {L(
                'AZEXBUY beynəlxalq ticarət əməliyyatlarının müxtəlif mərhələlərində şirkətlərə dəstək göstərir. Fəaliyyətimiz həm Azərbaycan istehsalçılarının ixracat imkanlarının inkişafını, həm də xarici şirkətlərin Azərbaycandan məhsul və tədarükçü tapmasını əhatə edir.',
                'AZEXBUY uluslararası ticaret işlemlerinin çeşitli aşamalarında şirketlere destek gösterir. Faaliyetimiz hem Azerbaycanlı üreticilerin ihracat imkânlarının geliştirilmesini, hem de yabancı şirketlerin Azerbaycan\'dan ürün ve tedarikçi bulmasını kapsar.',
                'AZEXBUY supports companies at various stages of international trade operations. Our activities cover both developing export opportunities for Azerbaijani producers and helping foreign companies find products and suppliers in Azerbaijan.',
                'AZEXBUY поддерживает компании на различных этапах международных торговых операций, охватывая как развитие экспортных возможностей, так и помощь иностранным компаниям в поиске продуктов и поставщиков.'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {ACTIVITIES.map((act, i) => (
              <div
                key={i}
                className={`bg-white border rounded-xl p-5 cursor-pointer transition-all hover:shadow-md ${
                  activeActivity === i ? 'border-brandNavy shadow-md' : 'border-gray-200'
                }`}
                onClick={() => setActiveActivity(activeActivity === i ? null : i)}
              >
                <div className={`w-12 h-12 rounded-xl ${act.color} text-white flex items-center justify-center text-xl mb-4`}>
                  <i className={act.icon}></i>
                </div>
                <h3 className="text-sm font-extrabold text-gray-900 mb-2 leading-snug">
                  {locale === 'AZ' ? (act.titleEN.replace('Export Development','İxracatın İnkişafı').replace('Finding International Buyers','Beynəlxalq Alıcıların Tapılması').replace('Supplier & Product Search','Tədarükçü Axtarışı').replace('Building Trade Relations','Ticarət Əlaqələrinin Qurulması').replace('Export & Logistics Support','İxracat və Logistika Dəstəyi')) : locale === 'TR' ? act.title : locale === 'RU' ? act.titleEN : act.titleEN}
                </h3>
                <p className={`text-xs text-gray-500 leading-relaxed transition-all overflow-hidden ${
                  activeActivity === i ? 'max-h-40' : 'max-h-12 line-clamp-3'
                }`}>
                  {locale === 'AZ' ? act.desc : act.descEN}
                </p>
                <button
                  type="button"
                  className="mt-3 text-[10px] font-bold text-brandNavy hover:text-brandGreen flex items-center gap-1 cursor-pointer"
                >
                  <span>{activeActivity === i ? L('Az göstər','Daha az','Show less','Свернуть') : L('Ətraflı','Devamını oku','Read more','Подробнее')}</span>
                  <i className={`fa-solid fa-chevron-${activeActivity === i ? 'up' : 'down'} text-[8px]`}></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          03 — MISSION & VISION
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-14 border-b border-gray-100">
        <div className="custom-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Mission */}
            <div className="relative rounded-2xl overflow-hidden min-h-[300px] flex items-end">
              <img
                src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80"
                alt="Mission"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-brandNavy/80"></div>
              <div className="relative z-10 p-8">
                <span className="text-[10px] font-extrabold tracking-widest uppercase text-brandGreen block mb-2">
                  {L('MİSSİYAMIZ', 'MİSYONUMUZ', 'OUR MISSION', 'НАША МИССИЯ')}
                </span>
                <h2 className="text-xl font-extrabold text-white mb-3">{L('Nə üçün varıq?', 'Neden varız?', 'Why do we exist?', 'Зачем мы существуем?')}</h2>
                <p className="text-sm text-white/85 leading-relaxed">
                  {L(
                    'Azərbaycan istehsalçılarının beynəlxalq bazarlara çıxış imkanlarını genişləndirmək, yerli məhsulların xarici alıcılara təqdim edilməsini asanlaşdırmaq və beynəlxalq şirkətlərin Azərbaycandan etibarlı tədarük imkanlarını araşdırmasına kömək etmək.',
                    'Azerbaycanlı üreticilerin uluslararası pazarlara çıkış imkânlarını genişletmek, yerli ürünlerin yabancı alıcılara sunulmasını kolaylaştırmak ve uluslararası şirketlerin Azerbaycan\'dan güvenilir tedarik imkânlarını araştırmasına yardımcı olmaktır.',
                    'To expand market access opportunities for Azerbaijani producers, facilitate the presentation of local products to foreign buyers, and help international companies explore reliable sourcing options from Azerbaijan.',
                    'Расширять возможности выхода азербайджанских производителей на международные рынки, облегчать представление местной продукции иностранным покупателям и помогать международным компаниям исследовать надёжные варианты закупок из Азербайджана.'
                  )}
                </p>
              </div>
            </div>

            {/* Vision */}
            <div className="relative rounded-2xl overflow-hidden min-h-[300px] flex items-end">
              <img
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80"
                alt="Vision"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-emerald-900/80"></div>
              <div className="relative z-10 p-8">
                <span className="text-[10px] font-extrabold tracking-widest uppercase text-emerald-300 block mb-2">
                  {L('VİZİYAMIZ', 'VİZYONUMUZ', 'OUR VISION', 'НАШЕ ВИДЕНИЕ')}
                </span>
                <h2 className="text-xl font-extrabold text-white mb-3">{L('Hara gedirik?', 'Nereye gidiyoruz?', 'Where are we heading?', 'Куда мы движемся?')}</h2>
                <p className="text-sm text-white/85 leading-relaxed">
                  {L(
                    'Azərbaycan məhsullarının beynəlxalq ticarətdə daha geniş tanınmasına, yerli istehsalçıların qlobal bazarlarda yeni ticarət imkanları əldə etməsinə və xarici şirkətlərin Azərbaycan tədarük bazarına çıxışının asanlaşmasına töhfə verən etibarlı beynəlxalq ticarət xidmətləri şirkəti olmaq.',
                    'Azerbaycan ürünlerinin uluslararası ticarette daha geniş tanınmasına, yerli üreticilerin küresel pazarlarda yeni ticari imkânlar elde etmesine ve yabancı şirketlerin Azerbaycan tedarik pazarına çıkışının kolaylaşmasına katkı veren güvenilir uluslararası ticaret hizmetleri şirketi olmaktır.',
                    'To become a trusted international trade services company contributing to wider recognition of Azerbaijani products, helping local producers gain new commercial opportunities in global markets, and facilitating foreign companies\' access to the Azerbaijani supply market.',
                    'Стать надёжной компанией международных торговых услуг, способствующей более широкому признанию азербайджанской продукции и облегчению доступа иностранных компаний к азербайджанскому рынку поставок.'
                  )}
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          04 — HOW WE WORK (Hizmet Modeli)
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-14 bg-slate-50/60 border-b border-gray-100">
        <div className="custom-container">
          <div className="max-w-2xl mb-10">
            <span className="text-[11px] font-extrabold tracking-widest uppercase text-brandGreen block mb-2">
              {L('XİDMƏT MODELİMİZ', 'HİZMET MODELİMİZ', 'OUR SERVICE MODEL', 'НАША МОДЕЛЬ ОБСЛУЖИВАНИЯ')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brandNavy mb-3">
              {L('Biz necə işləyirik?', 'Biz nasıl çalışıyoruz?', 'How do we work?', 'Как мы работаем?')}
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {L(
                'AZEXBUY-un xidmət modeli müştərilərin ehtiyacına əsaslanan fərdi yanaşma üzərində qurulur. Hər müraciət məhsulun xüsusiyyətlərinə, istənilən həcmə, hədəf bazara və ticarət şərtlərinə uyğun qiymətləndirilir.',
                'AZEXBUY\'un hizmet modeli müşterilerin ihtiyacına dayalı bireysel yaklaşım üzerine kurulur. Her başvuru ürünün özelliklerine, istenen hacme, hedef pazara ve ticari şartlara uygun değerlendirilir.',
                'AZEXBUY\'s service model is built on an individual approach based on client needs. Each application is evaluated according to the product\'s characteristics, desired volume, target market and commercial terms.',
                'Сервисная модель AZEXBUY построена на индивидуальном подходе, основанном на потребностях клиентов. Каждая заявка оценивается в соответствии с характеристиками продукта, желаемым объёмом и целевым рынком.'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                icon: 'fa-solid fa-search',
                color: 'bg-blue-600',
                borderColor: 'border-blue-200',
                bgColor: 'bg-blue-50',
                title: 'Araştırma ve Değerlendirme',
                desc: 'Müşterilerin ihtiyacını, ürününü, pazar imkânlarını ve potansiyel taraflarını araştırıyoruz.',
              },
              {
                step: '02',
                icon: 'fa-solid fa-handshake',
                color: 'bg-emerald-600',
                borderColor: 'border-emerald-200',
                bgColor: 'bg-emerald-50',
                title: 'İletişim ve Ticari İş Birliği',
                desc: 'Uygun tarafları belirliyor, ilişkilerin kurulmasına ve tekliflerin mutabık kalınmasına yardımcı oluyoruz.',
              },
              {
                step: '03',
                icon: 'fa-solid fa-clipboard-check',
                color: 'bg-violet-600',
                borderColor: 'border-violet-200',
                bgColor: 'bg-violet-50',
                title: 'İcra Aşamalarının Koordinasyonu',
                desc: 'Evraklandırma, uygunluk, gümrük ve lojistik süreçlerinin koordinasyonuna destek veriyoruz.',
              },
            ].map((s, i) => (
              <div key={i} className={`${s.bgColor} border ${s.borderColor} rounded-xl p-6 relative`}>
                <div className={`w-12 h-12 ${s.color} text-white rounded-xl flex items-center justify-center text-xl mb-4`}>
                  <i className={s.icon}></i>
                </div>
                <div className="absolute top-4 right-4 text-5xl font-black text-gray-200 select-none leading-none">{s.step}</div>
                <h3 className="text-base font-extrabold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-white border border-gray-200 rounded-xl p-6">
            <p className="text-sm text-gray-600 leading-relaxed">
              Biz yalnız tarafları buluşturmakla yetinmeyerek, iş birliğinin çeşitli aşamalarında bilgi alışverişinin, ticari tekliflerin ve süreçlerin koordinasyonuna destek veriyoruz.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          05 — SECTORS (Faaliyet Alanları)
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-14 border-b border-gray-100">
        <div className="custom-container">
          <div className="max-w-2xl mb-10">
            <span className="text-[11px] font-extrabold tracking-widest uppercase text-brandGreen block mb-2">
              {L('FƏALİYYƏT SAHƏLƏR', 'FAALİYET ALANLARIMIZ', 'OUR SECTORS', 'НАШИ СЕКТОРЫ')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brandNavy mb-3">
              {L('Müxtəlif sektorlar üzrə beynəlxalq ticarət imkanları', 'Çeşitli sektörler üzere uluslararası ticaret imkânları', 'International trade opportunities across various sectors', 'Международные торговые возможности в различных секторах')}
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {L(
                'AZEXBUY müxtəlif məhsul və sənaye yönləri üzrə yerli istehsalçılarla xarici alıcılar arasında əməkdaşlıq imkanlarının araşdırılmasını hədəfləyir.',
                'AZEXBUY çeşitli ürün ve sanayi yönleri üzere yerli üreticilerle yabancı alıcılar arasında iş birliği imkânlarının araştırılmasını hedefler.',
                'AZEXBUY aims to research cooperation opportunities between local producers and foreign buyers across various product and industrial directions.',
                'AZEXBUY стремится исследовать возможности сотрудничества между местными производителями и иностранными покупателями в различных товарных и отраслевых направлениях.'
              )}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {SECTORS.map((s, i) => (
              <div key={i} className="group relative rounded-xl overflow-hidden h-44 cursor-pointer">
                <img
                  src={s.image}
                  alt={s.titleEN}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className={`w-7 h-7 ${s.color} rounded text-white flex items-center justify-center text-xs mb-1.5`}>
                    <i className={s.icon}></i>
                  </div>
                  <h3 className="text-xs font-extrabold text-white leading-snug">{s.title}</h3>
                  <p className="text-[10px] text-white/70 leading-tight mt-0.5 line-clamp-2">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          06 — VALUES (Değerlerimiz)
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-14 bg-slate-50/60 border-b border-gray-100">
        <div className="custom-container">
          <div className="max-w-2xl mb-10">
            <span className="text-[11px] font-extrabold tracking-widest uppercase text-brandGreen block mb-2">
              {L('DƏYƏRLƏRİMİZ', 'DEĞERLERİMİZ', 'OUR VALUES', 'НАШИ ЦЕННОСТИ')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brandNavy mb-3">
              {L('Fəaliyyətimizin əsas prinsipləri', 'Faaliyetimizin temel prensipleri', 'Core principles of our activity', 'Основные принципы нашей деятельности')}
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {L(
                'AZEXBUY-un fəaliyyətində etibarlı əməkdaşlıq, peşəkar yanaşma, şəffaf ünsiyyət və müştəri ehtiyaclarının düzgün anlaşılması əsas prinsiplərdir.',
                'AZEXBUY\'un faaliyetinde güvenilir iş birliği, profesyonel yaklaşım, şeffaf iletişim ve müşteri ihtiyaçlarının doğru anlaşılması temel prensiplerdir.',
                'The core principles of AZEXBUY\'s activity are reliable cooperation, a professional approach, transparent communication and a correct understanding of client needs.',
                'Основными принципами деятельности AZEXBUY являются надёжное сотрудничество, профессиональный подход, прозрачная коммуникация и правильное понимание потребностей клиентов.'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {VALUES.map((v, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className={`w-11 h-11 ${v.color} rounded-xl flex items-center justify-center text-xl mb-4`}>
                  <i className={v.icon}></i>
                </div>
                <h3 className="text-sm font-extrabold text-gray-900 mb-2">{locale === 'TR' ? v.title : v.titleEN}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{locale === 'AZ' ? v.desc : v.descEN}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          07 — PARTNERSHIP MODEL (İş Birliği Modeli)
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-14 border-b border-gray-100">
        <div className="custom-container">
          <div className="max-w-2xl mb-10">
            <span className="text-[11px] font-extrabold tracking-widest uppercase text-brandGreen block mb-2">
              İŞ BİRLİĞİ MODELİMİZ
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brandNavy mb-3">Kimlerle iş birliği yapıyoruz?</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              AZEXBUY uluslararası ticarette yer alan çeşitli iş sahipleriyle iş birliği imkânlarını geliştirmeye yöneliktir.
            </p>
          </div>

          {/* Hub & Spoke Diagram */}
          <div className="relative">
            {/* Center hub */}
            <div className="flex justify-center mb-8">
              <div className="bg-brandNavy text-white rounded-2xl px-8 py-4 text-center shadow-lg">
                <div className="flex items-center gap-2 justify-center mb-1">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 100 100">
                    <circle cx="50" cy="20" fill="#009775" r="14"/>
                    <circle cx="80" cy="50" fill="#3b82f6" r="14"/>
                    <circle cx="50" cy="80" fill="#e63946" r="14"/>
                    <circle cx="20" cy="50" fill="#f4a261" r="14"/>
                  </svg>
                  <span className="text-lg font-extrabold tracking-tight">AZEXBUY</span>
                </div>
                <span className="text-[10px] text-blue-200 uppercase tracking-wider">Trade Facilitation Hub</span>
              </div>
            </div>

            {/* Partner cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {PARTNERS.map((p, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow relative">
                  {/* Connector line indicator */}
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-px h-5 bg-gray-200 hidden lg:block"></div>
                  <div className={`w-11 h-11 ${p.color} text-white rounded-xl flex items-center justify-center text-xl mb-4`}>
                    <i className={p.icon}></i>
                  </div>
                  <h3 className="text-sm font-extrabold text-gray-900 mb-2 leading-snug">{p.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          08 — GROWTH (Gelişim Yönlerimiz)
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-14 bg-slate-50/60 border-b border-gray-100">
        <div className="custom-container">
          <div className="max-w-2xl mb-10">
            <span className="text-[11px] font-extrabold tracking-widest uppercase text-brandGreen block mb-2">
              GELİŞİM YÖNLERİMİZ
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brandNavy mb-3">Geleceğe bakış</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              AZEXBUY'un gelişim stratejisi uluslararası ticaret hizmetlerinin genişletilmesi, yeni pazarlarda iş birliği imkânlarının oluşturulması ve yerli üreticilerin ihracat faaliyetinin desteklenmesi üzerine kuruludur.
            </p>
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3 inline-flex items-center gap-2">
              <i className="fa-solid fa-flag text-xs"></i>
              Bunlar onaylanmış başarılar değil, stratejik hedeflerdir.
            </p>
          </div>

          <div className="space-y-4">
            {GROWTH_ITEMS.map((g, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 flex items-start gap-5 hover:shadow-md transition-shadow">
                <div className="shrink-0 w-14 h-14 rounded-xl bg-brandNavy/5 border border-brandNavy/10 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-extrabold text-brandNavy/40 leading-none">{g.num}</span>
                  <i className={`${g.icon} text-brandNavy text-lg mt-0.5`}></i>
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900 mb-1">{g.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{g.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          09 — TEAM PLACEHOLDER (Ekip)
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-10 border-b border-gray-100 bg-white">
        <div className="custom-container">
          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 text-center">
            <i className="fa-solid fa-users text-3xl text-slate-300 mb-3"></i>
            <h3 className="text-base font-bold text-slate-500 mb-1">Ekip ve Şirket Bilgileri</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Yönetim ekibi, görevler ve şirket bilgileri AZEXBUY tarafından onaylandıktan sonra bu bölümde yayınlanacaktır.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          10 — CTA (İş Birliğine Davet)
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 bg-brandNavy">
        <div className="custom-container text-center">
          <span className="text-[11px] font-extrabold tracking-widest uppercase text-brandGreen block mb-3">
            {L('ƏMƏKDAŞLIĞA DƏVƏT', 'İŞ BİRLİĞİNE DAVET', 'INVITATION TO COOPERATE', 'ПРИГЛАШЕНИЕ К СОТРУДНИЧЕСТВУ')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 max-w-2xl mx-auto leading-tight">
            {L('Gəlin, beynəlxalq ticarətdə yeni imkanlar yaradaq.', 'Gelin, uluslararası ticarette yeni imkânlar yaratalım.', 'Let\'s create new opportunities in international trade.', 'Давайте создавать новые возможности в международной торговле.')}
          </h2>
          <p className="text-sm text-blue-200 mb-8 max-w-xl mx-auto leading-relaxed">
            {L(
              'İstər Azərbaycan məhsullarını beynəlxalq bazarlara çıxarmaq, istərsə də Azərbaycandan etibarlı tədarükçü tapmaq istəyin, AZEXBUY əməkdaşlıq imkanlarını araşdırmaq üçün sizinlə əlaqə saxlamağa hazırdır.',
              'İster Azerbaycan ürünlerini uluslararası pazarlara çıkarmak, isterse de Azerbaycan\'dan güvenilir tedarikçi bulmak isteyin, AZEXBUY iş birliği imkânlarını araştırmak için sizinle iletişim kurmaya hazırdır.',
              'Whether you want to bring Azerbaijani products to international markets or find reliable suppliers from Azerbaijan, AZEXBUY is ready to connect with you to explore cooperation opportunities.',
              'Хотите ли вы вывести азербайджанскую продукцию на международные рынки или найти надёжных поставщиков из Азербайджана — AZEXBUY готов связаться с вами для изучения возможностей сотрудничества.'
            )}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={onOpenRFQ}
              className="flex items-center gap-2.5 bg-white text-brandNavy font-extrabold text-sm px-7 py-3.5 rounded-full hover:bg-blue-50 transition-all shadow-lg cursor-pointer"
            >
              <i className="fa-solid fa-cart-shopping text-brandNavy"></i>
              <span>{L('Alıcı kimi müraciət et', 'Alıcı olarak başvur', 'Apply as a buyer', 'Подать заявку как покупатель')}</span>
            </button>
            <button
              type="button"
              onClick={onOpenProducer}
              className="flex items-center gap-2.5 bg-brandGreen text-white font-extrabold text-sm px-7 py-3.5 rounded-full hover:bg-brandGreenDark transition-all shadow-lg cursor-pointer"
            >
              <i className="fa-solid fa-seedling"></i>
              <span>{L('İstehsalçı kimi müraciət et', 'Üretici olarak başvur', 'Apply as a producer', 'Подать заявку как производитель')}</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('contact')}
              className="flex items-center gap-2 border border-white/30 text-white font-bold text-sm px-6 py-3.5 rounded-full hover:border-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <i className="fa-solid fa-envelope text-xs"></i>
              <span>{L('Bizimlə əlaqə saxlayın', 'Bizimle iletişim kurun', 'Contact us', 'Свяжитесь с нами')}</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
