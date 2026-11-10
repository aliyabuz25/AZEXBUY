import React, { useState } from 'react';
import {
  IncotermCode,
  Locale,
  ProducerApplication,
  ProductItem,
  RFQSubmission,
  ViewMode,
  getLocalizedText,
} from '../types';
import {
  BUYER_STEPS,
  CORRIDOR_ROUTES,
  INCOTERMS_GUIDE,
  PRODUCER_STEPS,
  PRODUCTS_CATALOG,
  SERVICES_PILLARS,
  UI_STRINGS as UI_STRINGS_STATIC,
} from '../data/translations';
import { useLocalization } from '../context/LocalizationContext';

interface CatalogViewProps {
  locale: Locale;
  shortlistedIds: string[];
  onToggleShortlist: (id: string) => void;
  onRequestProduct: (product: ProductItem) => void;
  onInspectProduct: (product: ProductItem) => void;
  onOpenMultiRFQ: () => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  locale,
  shortlistedIds,
  onToggleShortlist,
  onRequestProduct,
  onInspectProduct,
  onOpenMultiRFQ,
}) => {
  const { strings, products: cmsProducts } = useLocalization();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [incotermFilter, setIncotermFilter] = useState<IncotermCode | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { key: 'all', label: locale === 'AZ' ? 'Bütün Kateqoriyalar' : locale === 'RU' ? 'Все категории' : 'All Commodities' },
    { key: 'agro', label: locale === 'AZ' ? 'Kənd Təsərrüfatı və Qida' : locale === 'RU' ? 'Агропром и продукты' : 'Agriculture & Food' },
    { key: 'textile', label: locale === 'AZ' ? 'Tekstil və Xalça' : locale === 'RU' ? 'Текстиль и ковры' : 'Textile & Carpets' },
    { key: 'construction', label: locale === 'AZ' ? 'Tikinti Daşı və Mərmər' : locale === 'RU' ? 'Мрамор и стройматериалы' : 'Construction & Stone' },
    { key: 'metals', label: locale === 'AZ' ? 'Metallurgiya və Sənaye' : locale === 'RU' ? 'Металлургия и трубы' : 'Metals & Steel' },
    { key: 'chemicals', label: locale === 'AZ' ? 'Kimya və Polimerlər' : locale === 'RU' ? 'Химия и удобрения' : 'Chemicals & Urea' },
  ];

  const filtered = cmsProducts.filter((p: any) => {
    const matchesCat =
      categoryFilter === 'all' ||
      p.categoryKey === categoryFilter ||
      p.categoryId === categoryFilter ||
      p.categorySlug === categoryFilter;
    const matchesIncoterm =
      incotermFilter === 'ALL' ||
      (Array.isArray(p.incoterms) && p.incoterms.includes(incotermFilter));
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      getLocalizedText(p.name, locale).toLowerCase().includes(q) ||
      String(p.hsCode || '').toLowerCase().includes(q) ||
      getLocalizedText(p.originRegion, locale).toLowerCase().includes(q);
    return matchesCat && matchesIncoterm && matchesSearch;
  });

  return (
    <section className="py-8 bg-slate-50/60 min-h-[70vh]">
      <div className="custom-container space-y-6">
        {/* Top Banner */}
        <div className="bg-brandNavy text-white rounded-lg p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {strings[locale]?.featuredProducts?.heading || strings.AZ?.featuredProducts?.heading || strings.EN?.featuredProducts?.heading || 'Export Commodities'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl">
              Direct factory and agro-cluster sourcing across all 14 economic regions of Azerbaijan with verified AQTA phytosanitary, ISO, and EUR.1/CT-1 origin documentation.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {shortlistedIds.length > 0 && (
              <button
                type="button"
                onClick={onOpenMultiRFQ}
                className="bg-brandGreen hover:bg-brandGreenDark text-white text-xs font-bold px-4 py-2.5 rounded cursor-pointer flex items-center gap-2"
              >
                <span>Quote Shortlist ({shortlistedIds.length})</span>
                <i className="fa-solid fa-arrow-right text-[10px]"></i>
              </button>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Category Segmented Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setCategoryFilter(cat.key)}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  categoryFilter === cat.key
                    ? 'bg-brandNavy text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search & Incoterm Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative">
              <i className="fa-solid fa-magnifying-glass text-slate-400 text-xs absolute left-3 top-1/2 -translate-y-1/2"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by HS Code or name..."
                className="h-9 pl-8 pr-3 text-xs bg-white border border-slate-300 rounded text-slate-900 w-full sm:w-56"
              />
            </div>
            <select
              value={incotermFilter}
              onChange={(e) => setIncotermFilter(e.target.value as IncotermCode | 'ALL')}
              className="h-9 px-3 text-xs font-semibold bg-white border border-slate-300 rounded text-slate-800"
            >
              <option value="ALL">All Incoterms® 2020</option>
              {INCOTERMS_GUIDE.map((ic) => (
                <option key={ic.code} value={ic.code}>
                  {ic.code} Compatible
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Cards Grid */}
        {filtered.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-lg p-12 text-center text-slate-500">
            <i className="fa-solid fa-box-open text-3xl mb-3 text-slate-400"></i>
            <p className="font-semibold text-slate-700">Məhsul tapılmadı / No products found</p>
            <p className="text-xs text-slate-400 mt-1">Axtarış filtrini dəyişin və ya daha sonra təkrar yoxlayın.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((product) => {
              const isShortlisted = shortlistedIds.includes(product.id);
              return (
                <div
                  key={product.id}
                  className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <div
                      onClick={() => onInspectProduct(product)}
                      className="h-44 rounded overflow-hidden bg-slate-100 mb-3 relative cursor-pointer group"
                    >
                      <img
                        src={product.image}
                        alt={getLocalizedText(product.name, locale)}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-xs text-slate-700 text-[11px] font-semibold px-2.5 py-1 rounded shadow-xs border border-slate-200/80">
                        {getLocalizedText(product.categoryLabel, locale)}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleShortlist(product.id);
                        }}
                        className={`absolute top-2.5 right-2.5 w-7 h-7 rounded flex items-center justify-center text-xs transition-colors cursor-pointer ${
                          isShortlisted
                            ? 'bg-brandGreen text-white'
                            : 'bg-white/90 text-slate-700 hover:bg-white'
                        }`}
                        title={isShortlisted ? 'Remove from RFQ Shortlist' : 'Add to RFQ Shortlist'}
                      >
                        <i className={`fa-${isShortlisted ? 'solid' : 'regular'} fa-bookmark`}></i>
                      </button>
                    </div>

                    {/* Clean B2B Metadata */}
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-1">
                      <span className="font-semibold text-slate-600">HS {product.hsCode}</span>
                      <span>·</span>
                      <span className="text-emerald-700 font-medium inline-flex items-center gap-1">
                        <i className="fa-solid fa-circle-check text-[10px] text-emerald-600"></i>
                        <span className="tabular-nums">{product.verifiedSuppliersCount}</span> {locale === 'AZ' ? 'Təsdiqlənmiş İstehsalçı' : locale === 'TR' ? 'Onaylı Üretici' : locale === 'RU' ? 'Поставщиков' : 'Verified Producers'}
                      </span>
                    </div>

                    <h3
                      onClick={() => onInspectProduct(product)}
                      className="text-base font-bold text-slate-900 hover:text-brandNavy cursor-pointer mb-1"
                    >
                      {getLocalizedText(product.name, locale)}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                      {getLocalizedText(product.shortDesc, locale)}
                    </p>

                    <div className="border-t border-slate-100 pt-2.5 mb-3 space-y-1 text-[11px] text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Origin Cluster:</span>
                        <span className="font-semibold text-slate-800">{getLocalizedText(product.originRegion, locale)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Min. Export Order:</span>
                        <span className="font-semibold text-slate-800 tabular-nums">{product.minOrderQty}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Incoterms® 2020:</span>
                        <span className="font-semibold text-slate-800">
                          {Array.isArray(product.incoterms) ? product.incoterms.join(' / ') : 'FCA / FOB / CIF / DAP'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => onInspectProduct(product)}
                      className="px-3 py-2 text-xs font-bold text-brandNavy bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                    >
                      Specs
                    </button>
                    <button
                      type="button"
                      onClick={() => onRequestProduct(product)}
                      className="flex-1 bg-brandGreen hover:bg-brandGreenDark text-white text-xs font-bold py-2 px-3 rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>{strings[locale]?.featuredProducts?.requestProduct || strings.AZ?.featuredProducts?.requestProduct || 'Request RFQ'}</span>
                      <i className="fa-solid fa-arrow-right text-[10px]"></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

interface ProductSpecModalProps {
  product: ProductItem | null;
  locale: Locale;
  onClose: () => void;
  onRequestProduct: (p: ProductItem) => void;
}

export const ProductSpecModal: React.FC<ProductSpecModalProps> = ({
  product,
  locale,
  onClose,
  onRequestProduct,
}) => {
  const { strings } = useLocalization();
  if (!product) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/65 overflow-y-auto no-print"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white border border-slate-200 rounded-t-2xl sm:rounded-xl w-full sm:max-w-2xl sm:mx-4 overflow-hidden shadow-2xl sm:my-8">
        <div className="relative h-52 bg-slate-900">
          <img
            src={product.image}
            alt={getLocalizedText(product.name, locale)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brandNavy via-brandNavy/40 to-transparent"></div>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 bg-white/90 hover:bg-white text-slate-900 w-8 h-8 rounded flex items-center justify-center cursor-pointer"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
          <div className="absolute bottom-4 left-6 right-6 text-white">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-white/20 backdrop-blur-xs text-white text-[11px] font-semibold px-2 py-0.5 rounded">
                {getLocalizedText(product.categoryLabel, locale)}
              </span>
              <span className="text-xs text-slate-200 font-medium">HS {product.hsCode}</span>
            </div>
            <h3 className="text-2xl font-extrabold">{getLocalizedText(product.name, locale)}</h3>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4 text-xs max-h-[60vh] overflow-y-auto">
          <p className="text-sm text-slate-700 leading-relaxed">{getLocalizedText(product.shortDesc, locale)}</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded border border-slate-200">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Origin Cluster
              </span>
              <span className="font-bold text-slate-900">{getLocalizedText(product.originRegion, locale)}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Annual Export Capacity
              </span>
              <span className="font-bold text-brandNavy tabular-nums">{product.annualCapacity}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Dispatch Lead Time
              </span>
              <span className="font-bold text-brandGreen tabular-nums">{product.leadTimeDays}</span>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 border border-slate-200 rounded">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                Quality & Grade Specifications
              </span>
              <span className="font-medium text-slate-800">{getLocalizedText(product.gradeSpecs, locale)}</span>
            </div>
            <div className="p-3 border border-slate-200 rounded">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                Export Packaging Options
              </span>
              <span className="font-medium text-slate-800">{getLocalizedText(product.packaging, locale)}</span>
            </div>
            <div className="p-3 border border-slate-200 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                  Available Compliance Certificates
                </span>
                <span className="font-semibold text-slate-800">
                  {Array.isArray(product.certifications) ? product.certifications.join(' · ') : 'AQTA Phytosanitary · ISO 22000'}
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                  Incoterms® 2020
                </span>
                <span className="font-semibold text-slate-800">
                  {Array.isArray(product.incoterms) ? product.incoterms.join(' · ') : 'FCA · FOB · CIF · DAP'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-slate-500 tabular-nums">
              {product.verifiedSuppliersCount} Vetted Producers Ready for Quotation
            </span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onRequestProduct(product);
              }}
              className="bg-brandGreen hover:bg-brandGreenDark text-white font-bold px-5 py-2.5 rounded cursor-pointer flex items-center gap-2"
            >
              <span>{strings[locale]?.featuredProducts?.requestProduct || strings.AZ?.featuredProducts?.requestProduct || 'Request RFQ'}</span>
              <i className="fa-solid fa-arrow-right text-[10px]"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface DossiersViewProps {
  rfqList: RFQSubmission[];
  producerList: ProducerApplication[];
  shortlistedIds: string[];
  locale: Locale;
  onInspectRFQ: (rfq: RFQSubmission) => void;
  onInspectProducer: (app: ProducerApplication) => void;
  onOpenRFQ: () => void;
  onOpenProducerModal: () => void;
  onRemoveShortlist: (id: string) => void;
  onUpdateRFQStatus?: (id: string, status: string, assignedTo?: string, note?: string) => void;
  onUpdateProducerStatus?: (id: string, status: string, assignedTo?: string, note?: string) => void;
  onDeleteRFQ?: (id: string) => void;
  onDeleteProducer?: (id: string) => void;
}

const LEAD_STATUS_OPTIONS = ['New', 'In Progress', 'Contacted', 'Closed', 'Verified & Routing to Suppliers'];
const OPERATOR_OPTIONS = ['Unassigned', 'Baku Sourcing Desk', 'Middle Corridor Logistics', 'AQTA Compliance Desk', 'Agro-Export Specialist'];

export const DossiersView: React.FC<DossiersViewProps> = ({
  rfqList,
  producerList,
  shortlistedIds,
  locale,
  onInspectRFQ,
  onInspectProducer,
  onOpenRFQ,
  onOpenProducerModal,
  onRemoveShortlist,
  onUpdateRFQStatus,
  onUpdateProducerStatus,
  onDeleteRFQ,
  onDeleteProducer,
}) => {
  const { strings, products: cmsProducts } = useLocalization();
  const [activeTab, setActiveTab] = useState<'all' | 'rfqs' | 'producers' | 'matching'>('all');
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});
  const shortlistedProducts = cmsProducts.filter((p: any) => shortlistedIds.includes(p.id));

  const handleAddNote = (id: string, isBuyer: boolean) => {
    const text = (noteInputs[id] || '').trim();
    if (!text) return;
    if (isBuyer && onUpdateRFQStatus) {
      const item = rfqList.find((r) => r.id === id);
      if (item) onUpdateRFQStatus(id, item.status, item.assignedTo, text);
    } else if (!isBuyer && onUpdateProducerStatus) {
      const item = producerList.find((p) => p.id === id);
      if (item) onUpdateProducerStatus(id, item.status, item.assignedTo, text);
    }
    setNoteInputs((prev) => ({ ...prev, [id]: '' }));
  };

  return (
    <section className="py-8 bg-slate-50/70 min-h-[70vh]">
      <div className="custom-container space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            
            <h1 className="text-2xl font-extrabold text-brandNavy">
              Institutional Trade Dossiers & CRM Registry
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Track bilateral Buyer RFQs and Producer applications, manage lead status workflows (New, In Progress, Contacted, Closed), and match supply with demand.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenRFQ}
              className="bg-brandNavy hover:bg-brandNavyDark text-white text-xs font-bold px-4 py-2.5 rounded cursor-pointer"
            >
              + New Buyer RFQ
            </button>
            <button
              type="button"
              onClick={onOpenProducerModal}
              className="bg-brandGreen hover:bg-brandGreenDark text-white text-xs font-bold px-4 py-2.5 rounded cursor-pointer"
            >
              + Producer Onboarding
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'all'
                ? 'bg-brandNavy text-white'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Trade Leads ({rfqList.length + producerList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rfqs')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'rfqs'
                ? 'bg-brandNavy text-white'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Buyer Inquiries ({rfqList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('producers')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'producers'
                ? 'bg-brandNavy text-white'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Producer Registrations ({producerList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('matching')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'matching'
                ? 'bg-brandGreen text-white'
                : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <i className="fa-solid fa-arrows-split-up-and-left"></i>
            <span>Supply-Demand Matching Desk</span>
          </button>
        </div>

        {/* Supply-Demand Matching Desk View */}
        {activeTab === 'matching' && (
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5">
              <h2 className="text-base font-extrabold text-emerald-950 mb-1 flex items-center gap-2">
                <i className="fa-solid fa-handshake text-brandGreen"></i>
                <span>Automated Sourcing Candidate Matchmaker</span>
              </h2>
              <p className="text-xs text-emerald-800">
                This internal desk evaluates international procurement requirements against registered Azerbaijani producers by HS classification and production capacity. Final commercial matching remains under human review.
              </p>
            </div>

            {rfqList.map((rfq) => {
              const matchedProducers = producerList.filter((p) =>
                rfq.items.some(
                  (it) =>
                    p.hsCode === it.hsCode ||
                    p.hsCode.slice(0, 4) === it.hsCode.slice(0, 4) ||
                    p.productName.toLowerCase().includes(it.productName.toLowerCase())
                )
              );

              return (
                <div key={rfq.id} className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                    <div>
                      <span className="text-xs font-bold text-slate-700 tabular-nums">{rfq.id}</span>
                      <h3 className="text-sm font-extrabold text-slate-900">
                        {rfq.buyerCompany} ({rfq.country})
                      </h3>
                      <p className="text-xs text-slate-500">
                        Requested: {rfq.items.map((it) => `${it.productName} [HS ${it.hsCode}] - ${it.quantity} ${it.unit}`).join(', ')}
                      </p>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded bg-blue-50 text-brandNavy self-start sm:self-center">
                      Status: {rfq.status}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                      Qualified Azerbaijani Producer Candidates ({matchedProducers.length} Found)
                    </span>

                    {matchedProducers.length === 0 ? (
                      <div className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded">
                        No registered producers currently hold exact matching HS code. Outsourced Trade Desk will launch targeted sourcing in Zaqatala, Goychay, or Sumgayit.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {matchedProducers.map((prod) => (
                          <div key={prod.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="font-bold text-slate-900">{prod.companyName}</span>
                                <span className="text-emerald-700 font-extrabold bg-emerald-100 px-1.5 py-0.5 rounded text-[10px]">
                                  Readiness: {prod.readinessScore}/100
                                </span>
                              </div>
                              <p className="text-xs text-slate-600">
                                {prod.productName} (HS: {prod.hsCode}) · Region: {prod.economicRegion}
                              </p>
                              <div className="text-[11px] text-slate-500 mt-1">
                                Monthly Capacity: <strong>{prod.monthlyCapacity}</strong> · VÖEN: {prod.voenTin}
                              </div>
                            </div>
                            <div className="pt-2 mt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                              <span className="text-[11px] text-slate-500">
                                Contact: {prod.contactPerson} ({prod.phone})
                              </span>
                              <button
                                type="button"
                                onClick={() => onInspectProducer(prod)}
                                className="font-bold text-brandNavy hover:text-brandGreen text-[11px]"
                              >
                                View File →
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Buyer RFQs Section */}
        {(activeTab === 'all' || activeTab === 'rfqs') && (
          <div>
            <h2 className="text-base font-extrabold text-brandNavy mb-3">
              Submitted Buyer Quotations (RFQs) ({rfqList.length})
            </h2>
            {rfqList.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-lg p-6 text-center text-xs text-slate-500">
                No Buyer RFQs submitted yet. Click "Request a Quote" or select any product to generate an official RFQ dossier.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rfqList.map((rfq) => (
                  <div
                    key={rfq.id}
                    className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between hover:shadow-md transition-shadow space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-bold text-slate-800 tabular-nums">
                          {rfq.id}
                        </span>
                        <div className="flex items-center gap-2">
                          <select
                            value={rfq.status}
                            onChange={(e) =>
                              onUpdateRFQStatus &&
                              onUpdateRFQStatus(rfq.id, e.target.value, rfq.assignedTo)
                            }
                            className="text-[11px] font-bold bg-slate-50 border border-slate-300 rounded px-2 py-0.5 text-brandGreen cursor-pointer"
                          >
                            {LEAD_STATUS_OPTIONS.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                          {onDeleteRFQ && (
                            <button
                              type="button"
                              onClick={() => onDeleteRFQ(rfq.id)}
                              className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer text-xs p-1"
                              title="Delete Record"
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          )}
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900">
                        {rfq.buyerCompany} ({rfq.country})
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Incoterms® 2020: <strong>{rfq.incoterm}</strong> — {rfq.destinationPort}
                      </p>

                      <div className="mt-2.5 text-xs text-slate-600 flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-slate-400">Assigned:</span>
                        <select
                          value={rfq.assignedTo || 'Unassigned'}
                          onChange={(e) =>
                            onUpdateRFQStatus &&
                            onUpdateRFQStatus(rfq.id, rfq.status, e.target.value)
                          }
                          className="text-[11px] bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-700"
                        >
                          {OPERATOR_OPTIONS.map((op) => (
                            <option key={op} value={op}>
                              {op}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1 text-xs">
                        {rfq.items.map((it, i) => (
                          <div key={i} className="flex justify-between text-slate-700">
                            <span>
                              {it.productName} (HS: {it.hsCode})
                            </span>
                            <span className="font-bold tabular-nums">
                              {it.quantity} {it.unit}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Internal Notes Thread */}
                      {rfq.internalNotes && rfq.internalNotes.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-slate-100 space-y-1">
                          <span className="text-[10px] font-bold uppercase text-slate-400">
                            Desk Notes:
                          </span>
                          {rfq.internalNotes.map((nt, ni) => (
                            <p key={ni} className="text-[11px] text-slate-600 italic bg-slate-50 px-2 py-0.5 rounded">
                              {nt}
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Quick Add Note */}
                      <div className="mt-2.5 flex items-center gap-2">
                        <input
                          type="text"
                          value={noteInputs[rfq.id] || ''}
                          onChange={(e) =>
                            setNoteInputs((prev) => ({ ...prev, [rfq.id]: e.target.value }))
                          }
                          placeholder="Add operational note..."
                          className="text-[11px] px-2 py-1 bg-slate-50 border border-slate-200 rounded flex-1 focus:bg-white"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddNote(rfq.id, true);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleAddNote(rfq.id, true)}
                          className="text-[11px] font-bold px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded text-slate-700"
                        >
                          Save
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 tabular-nums">
                        {new Date(rfq.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => onInspectRFQ(rfq)}
                        className="text-xs font-bold text-brandNavy hover:text-brandGreen flex items-center gap-1.5 cursor-pointer"
                      >
                        <i className="fa-solid fa-print"></i>
                        <span>Open Printable Dossier</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Producer Applications Section */}
        {(activeTab === 'all' || activeTab === 'producers') && (
          <div>
            <h2 className="text-base font-extrabold text-brandNavy mb-3">
              Producer Export Registrations ({producerList.length})
            </h2>
            {producerList.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-lg p-6 text-center text-xs text-slate-500">
                No Azerbaijani producer applications saved yet. Click "For Producers" or "+ Producer Onboarding" to register.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {producerList.map((app) => (
                  <div
                    key={app.id}
                    className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between hover:shadow-md transition-shadow space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-bold text-brandGreen tabular-nums">
                          {app.id}
                        </span>
                        <div className="flex items-center gap-2">
                          <select
                            value={app.status}
                            onChange={(e) =>
                              onUpdateProducerStatus &&
                              onUpdateProducerStatus(app.id, e.target.value, app.assignedTo)
                            }
                            className="text-[11px] font-bold bg-slate-50 border border-slate-300 rounded px-2 py-0.5 text-slate-700 cursor-pointer"
                          >
                            {LEAD_STATUS_OPTIONS.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                          {onDeleteProducer && (
                            <button
                              type="button"
                              onClick={() => onDeleteProducer(app.id)}
                              className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer text-xs p-1"
                              title="Delete Record"
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          )}
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900">
                        {app.companyName} · VÖEN {app.voenTin}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {app.productName} (HS: {app.hsCode}) · {app.economicRegion}
                      </p>

                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-bold tabular-nums">
                          Readiness: {app.readinessScore}/100
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-semibold text-slate-400">Assigned:</span>
                          <select
                            value={app.assignedTo || 'Unassigned'}
                            onChange={(e) =>
                              onUpdateProducerStatus &&
                              onUpdateProducerStatus(app.id, app.status, e.target.value)
                            }
                            className="text-[11px] bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-700"
                          >
                            {OPERATOR_OPTIONS.map((op) => (
                              <option key={op} value={op}>
                                {op}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Internal Notes */}
                      {app.internalNotes && app.internalNotes.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-slate-100 space-y-1">
                          <span className="text-[10px] font-bold uppercase text-slate-400">
                            Desk Notes:
                          </span>
                          {app.internalNotes.map((nt, ni) => (
                            <p key={ni} className="text-[11px] text-slate-600 italic bg-slate-50 px-2 py-0.5 rounded">
                              {nt}
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Quick Add Note */}
                      <div className="mt-2.5 flex items-center gap-2">
                        <input
                          type="text"
                          value={noteInputs[app.id] || ''}
                          onChange={(e) =>
                            setNoteInputs((prev) => ({ ...prev, [app.id]: e.target.value }))
                          }
                          placeholder="Add operational note..."
                          className="text-[11px] px-2 py-1 bg-slate-50 border border-slate-200 rounded flex-1 focus:bg-white"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddNote(app.id, false);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleAddNote(app.id, false)}
                          className="text-[11px] font-bold px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded text-slate-700"
                        >
                          Save
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 tabular-nums">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => onInspectProducer(app)}
                        className="text-xs font-bold text-brandNavy hover:text-brandGreen flex items-center gap-1.5 cursor-pointer"
                      >
                        <i className="fa-solid fa-print"></i>
                        <span>View Dossier</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Shortlisted Products */}
        {shortlistedProducts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-extrabold text-brandNavy">
                Shortlisted Commodities ({shortlistedProducts.length})
              </h2>
              <button
                type="button"
                onClick={onOpenRFQ}
                className="text-xs font-bold text-brandGreen hover:underline cursor-pointer"
              >
                Convert All Shortlisted Items to Single RFQ →
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {shortlistedProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-white border border-slate-200 rounded p-3.5 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={p.image}
                      alt={getLocalizedText(p.name, locale)}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{getLocalizedText(p.name, locale)}</h4>
                      <span className="text-xs text-slate-500 font-medium">HS {p.hsCode}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveShortlist(p.id)}
                    className="text-slate-400 hover:text-red-600 p-1.5 cursor-pointer"
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

interface SubpagePortalProps {
  activeView: ViewMode;
  locale: Locale;
  onOpenRFQ: () => void;
  onOpenProducer: () => void;
  onOpenServiceApp: (serviceId?: string) => void;
  onNavigate: (v: ViewMode) => void;
}

export const SubpagePortalView: React.FC<SubpagePortalProps> = ({
  activeView,
  locale,
  onOpenRFQ,
  onOpenProducer,
  onOpenServiceApp,
  onNavigate,
}) => {
  const { strings, buyerSteps: cmsBuyerSteps, producerSteps: cmsProducerSteps, cmsServices, howItWorksBuyersImage, howItWorksSellersImage, buyerHeroImage, producerHeroImage, contact } = useLocalization();
  const [selectedBuyerStep, setSelectedBuyerStep] = useState<number>(1);
  const [selectedProducerStep, setSelectedProducerStep] = useState<number>(1);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactForm, setContactForm] = useState({ fullName: '', organization: '', email: '', inquiryType: 'Buyer Sourcing Inquiry', message: '' });

  const activeBuyerStepObj = cmsBuyerSteps.find((s: any) => s.number === selectedBuyerStep) || cmsBuyerSteps[0];
  const activeProducerStepObj =
    cmsProducerSteps.find((s: any) => s.number === selectedProducerStep) || cmsProducerSteps[0];

  if (!cmsBuyerSteps.length || !cmsProducerSteps.length) return null;

  // ── BUYERS PAGE ────────────────────────────────────────────────
  if (activeView === 'buyers') {
    const BUYER_STEPS_AZ = [
      { num:'01', title:'Azərbaycanda uyğun tədarükçüləri axtarırıq', desc:'Axtardığınız məhsula görə Azərbaycanda uyğun istehsalçı və tədarükçüləri araşdırırıq.', azexbuy:'Məhsulun xüsusiyyətlərinə, istehsal imkânlarına və istənilən həcmə uyğun potensial tərəfləri müəyyən edirik.', client:'Məhsulun adı, texniki xüsusiyyətlər, istənilən miqdar, hədəf liman/ölkə', result:'Potensial tədarükçülərin ilkin siyahısı', next:'Tədarükçüləri ön yoxlamadan keçiririk' },
      { num:'02', title:'Tədarükçüləri ön yoxlamadan keçiririk', desc:'Potensial tədarükçülərin şirkət məlumatlarını, fəaliyyət istiqamətlərini, məhsul çeşidlərini araşdırırıq.', azexbuy:'İstehsal imkânları, mövcud sertifikatlar və əməkdaşlıq imkânları ön qiymətləndirmədən keçirilir.', client:'Xüsusi keyfiyyət tələbləri (varsa)', result:'Əməkdaşlıq və uyğunluq üzrə tədarükçülərin qısaldılmış siyahısı', next:'Qiymət və kommersiya təkliflərini toplayırıq' },
      { num:'03', title:'Qiymət və kommersiya təkliflərini toplayırıq', desc:'Uyğun tədarükçülərdən qiymət, mövcud miqdar, istehsal müddəti, qablaşdırma və çatdırılma şərtləri barədə kommersiya təklifləri alırıq.', azexbuy:'Mümkün olduqda bir neçə tədarükçüdən (hədəf: 3–4 tədarükçü) təklif toplayırıq.', client:'Çatdırılma şərtləri üzrə prioritetlər (Incoterms®)', result:'Müqayisə üçün kommersiya təklifləri toplusu', next:'Təklifləri müqayisəli şəkildə təqdim edirik' },
      { num:'04', title:'Təklifləri müqayisəli şəkildə təqdim edirik', desc:'Toplanmış təklifləri qiymət, keyfiyyət göstəriciləri, tədarük imkânları və kommersiya şərtləri üzrə müqayisə edərək sizə təqdim edirik.', azexbuy:'Alternativləri qiymətləndirib ehtiyaclarınıza uyğun seçim etməyinizə yardım edirik.', client:'Təkliflər üzrə rəy və prioritetlər', result:'Sizin üçün ən uyğun tədarükçünün seçilməsi', next:'Sifarişi koordinasiya edirik' },
      { num:'05', title:'Sifarişi koordinasiya edirik', desc:'Seçdiyiniz tədarükçü ilə növbəti kommersiya danışıqları, sifariş təfərrüatları, müqavilə şərtləri və ödəniş razılaşmalarının aparılmasına dəstək veririk.', azexbuy:'Tərəflər arasında məlumat mübadiləsini və sifariş prosesinin koordinasiyasını təmin edirik.', client:'Sifariş təsdiqi, ödəniş şərtləri üzrə razılaşma', result:'Sifariş təsdiqlənir, istehsal/hazırlıq başlayır', next:'İxrac, gömrük və çatdırılma mərhələlərinə dəstək veririk' },
      { num:'06', title:'İxrac, gömrük və çatdırılma mərhələlərinə dəstək veririk', desc:'Sifarişin ixraca hazırlanmasından məhsulun göndərilməsinə qədər sənədləşdirmə, sertifikasiya, gömrük prosedurları və beynəlxalq logistika proseslərinin koordinasiyasına dəstək veririk.', azexbuy:'Məhsulun razılaşdırılmış çatdırılma şərtlərinə uyğun şəkildə alıcıya çatdırılması prosesini koordinasiya edirik.', client:'Çatdırılma ünvanı, gömrük məlumatları', result:'Məhsul alıcıya çatdırılır', next:'Rəsmi RFQ qeydiyyatı' },
      { num:'07', title:'Rəsmi RFQ qeydiyyatı', desc:'Seçim və logistika təsdiqləndikdən sonra sorğunuz rəsmiləşdirilir və Rəsmi RFQ Dosyeniz qeydiyyatdan keçir.', azexbuy:'Yekun RFQ sənədini hazırlayır və Rəsmi RFQ Dosye Nömrəsi ilə qeydiyyatdan keçirir.', client:'Əksik sənəd və təsdiqlər (varsa)', result:'Qeydiyyatdan keçmiş Rəsmi RFQ Dosye Nömrəsi', next:null },
    ];

    const clientLabel = locale === 'AZ' ? 'Alıcı nə təqdim etməlidir?' : locale === 'TR' ? 'Alıcı ne sunmalıdır?' : locale === 'RU' ? 'Что предоставляет покупатель?' : 'What does the buyer provide?';
    const azexbuyLabel = locale === 'AZ' ? 'AZEXBUY nə edir?' : locale === 'TR' ? 'AZEXBUY ne yapar?' : locale === 'RU' ? 'Что делает AZEXBUY?' : 'What AZEXBUY does';
    const resultLabel = locale === 'AZ' ? 'Gözlənilən nəticə' : locale === 'TR' ? 'Beklenen sonuç' : locale === 'RU' ? 'Ожидаемый результат' : 'Expected result';
    const nextLabel = locale === 'AZ' ? 'Növbəti mərhələ' : locale === 'TR' ? 'Sonraki adım' : locale === 'RU' ? 'Следующий этап' : 'Next step';
    const stepsTitle = locale === 'AZ' ? '7 mərhələli alıcı prosesi' : locale === 'TR' ? '7 adımlı alıcı süreci' : locale === 'RU' ? '7-этапный процесс покупателя' : '7-Step Buyer Process';
    const infoTitle = locale === 'AZ' ? 'Faydalı məlumatlar' : locale === 'TR' ? 'Faydalı bilgiler' : locale === 'RU' ? 'Полезная информация' : 'Useful Information';
    const ctaRFQ = locale === 'AZ' ? 'Alıcı sorğusu göndər' : locale === 'TR' ? 'Alıcı sorgusu gönder' : locale === 'RU' ? 'Отправить запрос' : 'Send Buyer Inquiry';
    const ctaCatalog = locale === 'AZ' ? 'Məhsul kataloquna bax' : locale === 'TR' ? 'Ürün kataloğuna bak' : locale === 'RU' ? 'Смотреть каталог' : 'View Product Catalog';
    const heroTitle = locale === 'AZ' ? 'Azərbaycandan tədarük edin' : locale === 'TR' ? 'Azerbaycan’dan tedarik edin' : locale === 'RU' ? 'Закупки из Азербайджана' : 'Source from Azerbaijan';
    const heroDesc = locale === 'AZ'
      ? 'Tələbinizi bildirin; uyğun tədarükçüləri arayaq, təklifləri toplayıb müqayisə üçün təqdim edək və ixrac prosesini koordinasiya edək.'
      : locale === 'TR'
      ? 'İhtiyacınızı bildirin; uygun tedarikçileri arayalım, teklifleri toplayıp karşılaştırma için sunalım ve ihracat sürecini koordine edelim.'
      : locale === 'RU'
      ? 'Сообщите о потребности; найдём поставщиков, соберём предложения и скоординируем экспортный процесс.'
      : 'Share your needs; we will find suitable suppliers, collect offers for comparison, and coordinate the export process.';

    return (
      <div className="bg-[#F8FAFC] min-h-screen">
        {/* Hero — full-width image, flush to topbar (admin-editable BUYER_HERO_IMAGE) */}
        <div className="relative w-full overflow-hidden bg-[#0b2440]">
          <img
            src={buyerHeroImage}
            alt="AZEXBUY Baku headquarters"
            className="w-full h-[420px] object-cover object-center"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b2440] via-[#0b2440]/45 to-[#0b2440]/15"></div>
          <div className="absolute inset-x-0 bottom-0 z-10">
            <div className="custom-container py-10">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3 leading-tight max-w-2xl">{heroTitle}</h1>
              <p className="text-base sm:text-lg text-slate-100/90 leading-relaxed mb-7 max-w-xl">{heroDesc}</p>
              <div className="flex flex-wrap gap-3.5">
                <button type="button" onClick={onOpenRFQ} className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold px-6 py-3 rounded-lg shadow-lg shadow-emerald-900/30 transition-all cursor-pointer flex items-center gap-2">
                  <span>{ctaRFQ}</span>
                  <i className="fa-solid fa-arrow-right text-xs"></i>
                </button>
                <button type="button" onClick={() => onNavigate('products')} className="bg-white/10 hover:bg-white/20 text-white border border-white/25 text-sm font-bold px-6 py-3 rounded-lg backdrop-blur-sm transition-all cursor-pointer flex items-center gap-2">
                  <i className="fa-solid fa-boxes-stacked text-xs text-slate-200"></i>
                  <span>{ctaCatalog}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="custom-container py-10">
          <h2 className="text-lg font-bold text-[#171717] mb-6">{stepsTitle}</h2>
          <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
            {BUYER_STEPS_AZ.map((step, idx) => {
              const isOpen = selectedBuyerStep === idx + 1;
              return (
                <div key={step.num} className="border-b border-[#F0F0F0] last:border-0">
                  <button type="button" className="w-full text-left px-5 py-4 flex items-start gap-4 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => setSelectedBuyerStep(isOpen ? 0 : idx + 1)}>
                    <span className="text-[13px] font-bold text-slate-400 mt-0.5 w-7 shrink-0">{step.num}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-semibold text-[#171717]">{step.title}</p>
                      {!isOpen && <p className="text-[13px] text-slate-500 mt-0.5 leading-relaxed">{step.desc.slice(0, 90)}…</p>}
                    </div>
                    <i className={`fa-solid fa-chevron-down text-slate-400 text-xs mt-1 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}></i>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 space-y-3">
                      <p className="text-[14px] text-slate-600 leading-relaxed ml-11">{step.desc}</p>
                      <div className="ml-11 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-[#EFF6FF] rounded-lg p-3.5">
                          <p className="text-[11px] font-bold text-[#1D4ED8] uppercase tracking-wider mb-1.5">{azexbuyLabel}</p>
                          <p className="text-[13px] text-[#334]">{step.azexbuy}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3.5">
                          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{clientLabel}</p>
                          <p className="text-[13px] text-slate-700">{step.client}</p>
                        </div>
                      </div>
                      <div className="ml-11 space-y-1">
                        <p className="text-[13px] text-slate-700"><span className="font-semibold">{resultLabel}:</span> {step.result}</p>
                        {step.next && <p className="text-[12px] text-slate-500"><span className="font-medium">{nextLabel}:</span> {step.next}</p>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Info blocks */}
        <div className="custom-container pb-10">
          <h2 className="text-lg font-bold text-[#171717] mb-6">{infoTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Incoterms */}
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <i className="fa-solid fa-ship text-blue-600 text-base"></i>
                <h3 className="text-[15px] font-bold text-[#171717]">Incoterms® 2020</h3>
              </div>
              <div className="space-y-2">
                {[
                  ['EXW','Fabrikadan — bütün xərclər alıcıdadır'],['FCA','Daşıyıcıya təhvil — satıcı göndəriş məntəqəsinə çatdırır'],
                  ['FOB','Gəminin bortuna — risk gəmidə keçir'],['CIF','Sığorta və nəqliyyat daxil — satıcı limana qədər'],
                  ['DAP','Göstərilən yerə çatdırılıb — gömrük alıcıdadır'],['DDP','Tam çatdırılmış — bütün xərclər satıcıdadır'],
                ].map(([t,d]) => (
                  <div key={t} className="flex gap-2 text-[13px]">
                    <span className="font-bold text-blue-700 w-10 shrink-0">{t}</span>
                    <span className="text-slate-600">{d}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100">Mənbə: ICC Incoterms® 2020 | Nəşr tarixi: 2019</p>
            </div>
            {/* Payment */}
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <i className="fa-solid fa-credit-card text-emerald-600 text-base"></i>
                <h3 className="text-[15px] font-bold text-[#171717]">{locale === 'AZ' ? 'Ödəniş Şərtləri' : locale === 'TR' ? 'Ödeme Şartları' : 'Payment Terms'}</h3>
              </div>
              <div className="space-y-2">
                {[
                  ['T/T','Bank köçürməsi — ən geniş yayılmış ödəniş üsulu'],
                  ['L/C','Akkreditiv — bank zəmanəti ilə təhlükəsiz ödəniş'],
                  ['D/P','Sənədlər ödənişə qarşı — bank vasitəsilə'],
                  ['D/A','Sənədlər qəbulə qarşı — müddətli ödəniş'],
                ].map(([t,d]) => (
                  <div key={t} className="flex gap-2 text-[13px]">
                    <span className="font-bold text-emerald-700 w-10 shrink-0">{t}</span>
                    <span className="text-slate-600">{d}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Certificates */}
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <i className="fa-solid fa-certificate text-amber-500 text-base"></i>
                <h3 className="text-[15px] font-bold text-[#171717]">{locale === 'AZ' ? 'Keyfiyyət və Sertifikatlar' : locale === 'TR' ? 'Kalite ve Sertifikalar' : 'Quality & Certificates'}</h3>
              </div>
              <div className="space-y-2">
                {[
                  ['ISO 22000','Qida təhlükəsizliyi idarəetmə sistemi'],
                  ['FSSC 22000','Qida zənciri üçün beynəlxalq sertifikat'],
                  ['AQTA','Azərbaycan fitosanitar və qida sertifikatı'],
                  ['EUR.1 / CT-1','Mənşə sertifikatı — preferensial gömrük'],
                  ['Halal','İslam ölkələri üçün Halal sertifikatı'],
                ].map(([t,d]) => (
                  <div key={t} className="flex gap-2 text-[13px]">
                    <span className="font-bold text-amber-700 w-24 shrink-0">{t}</span>
                    <span className="text-slate-600">{d}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Export docs */}
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <i className="fa-solid fa-file-lines text-purple-600 text-base"></i>
                <h3 className="text-[15px] font-bold text-[#171717]">{locale === 'AZ' ? 'İxrac Sənədləri' : locale === 'TR' ? 'İhracat Belgeleri' : 'Export Documents'}</h3>
              </div>
              <div className="space-y-2">
                {[
                  ['Invoice','Kommersiya fakturası — qiymət və miqdar'],
                  ['Packing List','Qablaşdırma siyahısı — yükün təfərrüatı'],
                  ['B/L veya CMR','Yük daşıma sənədi — dəniz/quru'],
                  ['Mənşə sert.','EUR.1, CT-1 — gömrük üstünlüyü'],
                  ['Fitosanitar','AQTA tərəfindən verilir'],
                ].map(([t,d]) => (
                  <div key={t} className="flex gap-2 text-[13px]">
                    <span className="font-bold text-purple-700 w-24 shrink-0">{t}</span>
                    <span className="text-slate-600">{d}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="bg-white border-t border-slate-100">
          <div className="custom-container py-10 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1">
              <p className="text-base font-semibold text-[#171717]">{locale === 'AZ' ? 'Azərbaycandan məhsul almaq istəyirsiniz?' : locale === 'TR' ? "Azerbaycan'dan ürün almak mı istiyorsunuz?" : 'Ready to source from Azerbaijan?'}</p>
              <p className="text-sm text-slate-500 mt-0.5">{locale === 'AZ' ? 'Sorğunuzu bizə göndərin, uyğun tədarükçüləri axtaraq.' : locale === 'TR' ? 'Sorgunuzu bize gönderin, uygun tedarikçileri arayalım.' : 'Send us your inquiry and we will find suitable suppliers.'}</p>
            </div>
            <div className="flex gap-3 shrink-0">
              <button type="button" onClick={onOpenRFQ} className="bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors cursor-pointer">{ctaRFQ}</button>
              <button type="button" onClick={() => onNavigate('products')} className="border border-slate-300 hover:border-slate-400 text-slate-700 text-sm font-medium px-5 py-2.5 rounded-lg transition-colors cursor-pointer">{ctaCatalog}</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeView === 'how-it-works') {
    // Localized labels
    const howTitle = locale === 'AZ' ? 'AZEXBUY ilə necə işləyir?' : locale === 'TR' ? 'AZEXBUY ile nasıl çalışır?' : locale === 'RU' ? 'Как работает AZEXBUY?' : 'How does AZEXBUY work?';
    const howSubtitle = locale === 'AZ' ? 'Alıcılar və istehsalçılar üçün əməkdaşlıq prosesinin mərhələləri' : locale === 'TR' ? 'Alıcılar ve üreticiler için iş birliği sürecinin aşamaları' : locale === 'RU' ? 'Этапы сотрудничества для покупателей и производителей' : 'Stages of cooperation for buyers and producers';
    const buyersLabel = locale === 'AZ' ? 'ALICILAR ÜÇÜN' : locale === 'TR' ? 'ALICILAR İÇİN' : locale === 'RU' ? 'ДЛЯ ПОКУПАТЕЛЕЙ' : 'FOR BUYERS';
    const sellersLabel = locale === 'AZ' ? 'SATICILAR ÜÇÜN' : locale === 'TR' ? 'SATICILAR İÇİN' : locale === 'RU' ? 'ДЛЯ ПРОДАВЦОВ' : 'FOR SELLERS';
    const buyersDesc = locale === 'AZ' ? 'Azərbaycandan məhsul və xammal tədarük etmək istəyən beynəlxalq şirkətlər üçün.' : locale === 'TR' ? "Azerbaycan'dan ürün ve hammadde tedarik etmek isteyen uluslararası şirketler için." : locale === 'RU' ? 'Для международных компаний, желающих закупать продукцию и сырьё из Азербайджана.' : 'For international companies wishing to source products and raw materials from Azerbaijan.';
    const sellersDesc = locale === 'AZ' ? 'Məhsullarını beynəlxalq bazarlara çıxarmaq istəyən Azərbaycan istehsalçıları üçün.' : locale === 'TR' ? 'Ürünlerini uluslararası pazarlara çıkarmak isteyen Azerbaycanlı üreticiler için.' : locale === 'RU' ? 'Для азербайджанских производителей, желающих выйти на международные рынки.' : 'For Azerbaijani producers wishing to reach international markets.';
    const stepsLabel = locale === 'AZ' ? 'mərhələ' : locale === 'TR' ? 'aşama' : locale === 'RU' ? 'этапа' : 'steps';
    const azexbuyDoes = locale === 'AZ' ? 'AZEXBUY nə edir?' : locale === 'TR' ? 'AZEXBUY ne yapar?' : locale === 'RU' ? 'Что делает AZEXBUY?' : 'What does AZEXBUY do?';
    const clientProvides = locale === 'AZ' ? 'Müştəri nə təqdim etməlidir?' : locale === 'TR' ? 'Müşteri ne sunmalıdır?' : locale === 'RU' ? 'Что предоставляет клиент?' : 'What does the client provide?';
    const expectedResult = locale === 'AZ' ? 'Gözlənilən nəticə' : locale === 'TR' ? 'Beklenen sonuç' : locale === 'RU' ? 'Ожидаемый результат' : 'Expected result';
    const nextStepLabel = locale === 'AZ' ? 'Növbəti mərhələ' : locale === 'TR' ? 'Sonraki aşama' : locale === 'RU' ? 'Следующий этап' : 'Next step';
    const ctaBuyerTitle = locale === 'AZ' ? 'Azərbaycandan məhsul almaq istəyirsiniz?' : locale === 'TR' ? "Azerbaycan'dan ürün almak mı istiyorsunuz?" : locale === 'RU' ? 'Хотите закупать товары из Азербайджана?' : 'Looking to source products from Azerbaijan?';
    const ctaBuyerDesc = locale === 'AZ' ? 'Tələbinizi bizə göndərin, uyğun Azərbaycan tədarükçülərinin araşdırılması prosesinə başlayaq.' : locale === 'TR' ? 'Talebinizi bize gönderin, uygun Azerbaycanlı tedarikçilerin araştırılması sürecini başlatalım.' : locale === 'RU' ? 'Отправьте нам запрос, и мы начнём поиск подходящих азербайджанских поставщиков.' : 'Send us your request and we will start searching for suitable Azerbaijani suppliers.';
    const ctaBuyerBtn = locale === 'AZ' ? 'Alıcı kimi müraciət et' : locale === 'TR' ? 'Alıcı olarak başvur' : locale === 'RU' ? 'Подать заявку как покупатель' : 'Apply as a buyer';
    const ctaSellerTitle = locale === 'AZ' ? 'Məhsullarınızı ixrac etmək istəyirsiniz?' : locale === 'TR' ? 'Ürünlerinizi ihraç etmek mi istiyorsunuz?' : locale === 'RU' ? 'Хотите экспортировать свою продукцию?' : 'Looking to export your products?';
    const ctaSellerDesc = locale === 'AZ' ? 'Şirkətiniz və məhsullarınız haqqında məlumat verin, ixrac imkanlarını birlikdə araşdıraq.' : locale === 'TR' ? 'Şirketiniz ve ürünleriniz hakkında bilgi sunun, ihracat imkânlarını birlikte araştıralım.' : locale === 'RU' ? 'Расскажите о своей компании и продукции, вместе исследуем экспортные возможности.' : 'Share information about your company and products, and we will explore export opportunities together.';
    const ctaSellerBtn = locale === 'AZ' ? 'Satıcı kimi müraciət et' : locale === 'TR' ? 'Satıcı olarak başvur' : locale === 'RU' ? 'Подать заявку как продавец' : 'Apply as a seller';

    return (
      <section className="py-8 bg-[#F5F6F7]">
        <div className="custom-container">
          {/* Main light panel */}
          <div className="bg-white border border-[#E5E7EB] rounded-[22px] overflow-hidden shadow-sm">
            <div className="p-6 sm:p-7">

              {/* Top heading */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-[#171717] mb-2.5">{howTitle}</h1>
                <p className="text-base font-normal text-[#666]">{howSubtitle}</p>
              </div>

              {/* Split in two — Buyers (navy tones) | Sellers (green tones) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">

                {/* ── LEFT: BUYERS ── */}
                <div className="rounded-[18px] overflow-hidden bg-gradient-to-br from-brandNavy to-[#0b2440] p-6 sm:p-7 flex flex-col gap-5 min-h-[480px]">
                  <div>
                    <div className="rounded-[14px] overflow-hidden w-full aspect-[1.81/1] mb-4">
                      <img src={howItWorksBuyersImage} alt="Buyers" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-[20px] font-normal text-white uppercase tracking-wide mb-3">{buyersLabel}</p>
                    <span className="inline-block bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[12px] font-medium px-2.5 py-[4px] rounded-full mb-3">
                      {cmsBuyerSteps.length} {stepsLabel}
                    </span>
                    <p className="text-[15px] font-normal text-slate-200 leading-[21px] mb-4">{buyersDesc}</p>
                  </div>

                  {/* Buyer step accordion */}
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-[14px] p-4">
                    {cmsBuyerSteps.map((step, idx) => {
                      const isOpen = selectedBuyerStep === step.number;
                      return (
                        <div key={step.number}>
                          <button
                            type="button"
                            className="w-full text-left py-3 cursor-pointer group"
                            onClick={() => setSelectedBuyerStep(isOpen ? 0 : step.number)}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-[16px] font-bold text-white leading-snug">
                                  {String(idx + 1).padStart(2, '0')}. {getLocalizedText(step.title, locale)}
                                </p>
                                {!isOpen && (
                                  <p className="text-[13px] text-slate-300 mt-1.5 leading-relaxed">
                                    {getLocalizedText(step.description, locale).slice(0, 80)}…
                                  </p>
                                )}
                              </div>
                              <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'} text-slate-400 text-xs mt-1.5 shrink-0`}></i>
                            </div>
                            {isOpen && (
                              <div className="mt-3 space-y-3">
                                <p className="text-[13px] text-slate-200 leading-relaxed">
                                  {getLocalizedText(step.description, locale)}
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div className="bg-emerald-500/15 border border-emerald-400/20 rounded-lg p-3">
                                    <p className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider mb-1">{azexbuyDoes}</p>
                                    <p className="text-[13px] text-slate-100">{getLocalizedText(step.detailTitle, locale)}</p>
                                  </div>
                                  <div className="bg-white/10 border border-white/15 rounded-lg p-3">
                                    <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">{expectedResult}</p>
                                    <p className="text-[13px] text-slate-100">{getLocalizedText(step.deliverable, locale)}</p>
                                  </div>
                                </div>
                                {idx < cmsBuyerSteps.length - 1 && (
                                  <p className="text-[12px] text-slate-400 mt-1">
                                    {nextStepLabel}: {getLocalizedText(cmsBuyerSteps[idx + 1].title, locale)}
                                  </p>
                                )}
                              </div>
                            )}
                          </button>
                          <div className="border-t border-white/10"></div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Buyer CTA */}
                  <div className="bg-white text-[#171717] rounded-[14px] p-5 flex flex-col gap-3">
                    <div>
                      <h3 className="text-[16px] font-bold mb-1">{ctaBuyerTitle}</h3>
                      <p className="text-[13px] text-[#555] leading-relaxed">{ctaBuyerDesc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={onOpenRFQ}
                      className="self-start px-5 py-2.5 bg-brandNavy hover:bg-brandNavyDark text-white text-[14px] font-bold rounded-full transition-colors cursor-pointer"
                    >
                      {ctaBuyerBtn}
                    </button>
                  </div>
                </div>

                {/* ── RIGHT: SELLERS ── */}
                <div className="rounded-[18px] overflow-hidden bg-gradient-to-br from-emerald-700 to-emerald-950 p-6 sm:p-7 flex flex-col gap-5 min-h-[480px]">
                  <div>
                    <div className="rounded-[14px] overflow-hidden w-full aspect-[1.81/1] mb-4">
                      <img src={howItWorksSellersImage} alt="Sellers" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-[20px] font-normal text-white uppercase tracking-wide mb-3">{sellersLabel}</p>
                    <span className="inline-block bg-white/15 border border-white/20 text-white/90 text-[12px] font-medium px-2.5 py-[4px] rounded-full mb-3">
                      {cmsProducerSteps.length} {stepsLabel}
                    </span>
                    <p className="text-[15px] font-normal text-emerald-50/95 leading-[21px] mb-4">{sellersDesc}</p>
                  </div>

                  {/* Seller step accordion */}
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-[14px] p-4">
                    {cmsProducerSteps.map((step, idx) => {
                      const isOpen = selectedProducerStep === step.number;
                      return (
                        <div key={step.number}>
                          <button
                            type="button"
                            className="w-full text-left py-3 cursor-pointer group"
                            onClick={() => setSelectedProducerStep(isOpen ? 0 : step.number)}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-[16px] font-bold text-white leading-snug">
                                  {String(idx + 1).padStart(2, '0')}. {getLocalizedText(step.title, locale)}
                                </p>
                                {!isOpen && (
                                  <p className="text-[13px] text-emerald-100/80 mt-1.5 leading-relaxed">
                                    {getLocalizedText(step.description, locale).slice(0, 80)}…
                                  </p>
                                )}
                              </div>
                              <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'} text-emerald-200/70 text-xs mt-1.5 shrink-0`}></i>
                            </div>
                            {isOpen && (
                              <div className="mt-3 space-y-3">
                                <p className="text-[13px] text-emerald-50 leading-relaxed">
                                  {getLocalizedText(step.description, locale)}
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div className="bg-white/15 border border-white/15 rounded-lg p-3">
                                    <p className="text-[11px] font-bold text-emerald-100 uppercase tracking-wider mb-1">{azexbuyDoes}</p>
                                    <p className="text-[13px] text-white">{getLocalizedText(step.detailTitle, locale)}</p>
                                  </div>
                                  <div className="bg-emerald-950/40 border border-emerald-400/20 rounded-lg p-3">
                                    <p className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider mb-1">{expectedResult}</p>
                                    <p className="text-[13px] text-emerald-50">{getLocalizedText(step.deliverable, locale)}</p>
                                  </div>
                                </div>
                                {idx < cmsProducerSteps.length - 1 && (
                                  <p className="text-[12px] text-emerald-200/70 mt-1">
                                    {nextStepLabel}: {getLocalizedText(cmsProducerSteps[idx + 1].title, locale)}
                                  </p>
                                )}
                              </div>
                            )}
                          </button>
                          <div className="border-t border-white/10"></div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Seller CTA */}
                  <div className="bg-white text-[#171717] rounded-[14px] p-5 flex flex-col gap-3">
                    <div>
                      <h3 className="text-[16px] font-bold mb-1">{ctaSellerTitle}</h3>
                      <p className="text-[13px] text-[#555] leading-relaxed">{ctaSellerDesc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={onOpenProducer}
                      className="self-start px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[14px] font-bold rounded-full transition-colors cursor-pointer"
                    >
                      {ctaSellerBtn}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }


  // ── PRODUCERS PAGE ────────────────────────────────────────────
  if (activeView === 'producers') {
    const PRODUCER_STEPS = [
      { num:'01', title:'İstehsal imkânları və məhsul məlumatları netləşdirilir', desc:'İstehsal gücünüzü, məhsul çeşitlərini, minimum sifariş miqdarını, qablaşdırma imkânlarını netləşdiririk.', azexbuy:'Məhsulun potensial xarici alıcılara düzgün təqdim edilməsini təmin edirik.', client:'Şirkət adı, fəaliyyət istiqaməti, texniki spesifikasiyalar, istehsal həcmi, qablaşdırma növləri', result:'Tam məhsul profili hazırlanır', next:'İxrac hazırlığı qiymətləndirilir' },
      { num:'02', title:'İxrac hazırlığı qiymətləndirilir', desc:'Şirkətinizin və məhsullarınızın xarici bazarlara çıxış üçün hazırlıq səviyyəsi ön qiymətləndirmədən keçirilir.', azexbuy:'Keyfiyyət, istehsal davamlılığı, qablaşdırma, etiketləmə, sertifikatlar yoxlanır. Lazım olduqda inkişaf tövsiyələri verilir.', client:'Mövcud sertifikat sənədləri, nümunələr (tələb olunarsa)', result:'İxrac hazırlığı hesabatı', next:'Hədəf bazarlar araşdırılır' },
      { num:'03', title:'Hədəf bazarlar araşdırılır', desc:'Məhsulunuzun xüsusiyyətlərinə uyğun beynəlxalq bazarları araşdırırıq.', azexbuy:'Hədəf ölkələrdə tələb, bazar meylləri, rəqabət mühiti, qiymət səviyyəsi, idxal şərtləri araşdırılır.', client:'Prioritet ölkələr (varsa), ixrac məhdudiyyətləri barədə məlumat', result:'Tövsiyə edilən hədəf bazarların siyahısı', next:'Potensial xarici alıcılar axtarılır' },
      { num:'04', title:'Potensial xarici alıcılar axtarılır', desc:'Seçilmiş hədəf bazarlarda məhsulunuza uyğun potensial alıcıları, distribütorları, idxalçıları araşdırırıq.', azexbuy:'Müəyyən edilmiş şirkətlərin fəaliyyət istiqamətləri və məhsul tələbləri yoxlanılır.', client:'Üstünlük verilən alıcı tipi (varsa)', result:'Potensial alıcıların siyahısı', next:'Kommersiya danışıqları dəstəklənir' },
      { num:'05', title:'Kommersiya danışıqları dəstəklənir', desc:'Potensial alıcılarla ilk əlaqələrin qurulmasına, məhsul məlumatlarının və kommersiya təkliflərinin təqdim edilməsinə dəstək veririk.', azexbuy:'Qiymət, sifariş həcmi, istehsal müddəti, qablaşdırma, ödəniş və çatdırılma şərtləri üzrə danışıqların aparılmasına yardım edirik.', client:'Kommersiya təklifi, qiymət siyahısı', result:'Alıcı ilə ilkin razılaşma', next:'Müqavilə və sənədlərə dəstək verilir' },
      { num:'06', title:'Müqavilə, proforma və sənədlərə dəstək verilir', desc:'Satış üzrə razılaşma əldə edildikdən sonra müqavilə, proforma-invoice və digər ticarət sənədlərinin hazırlanmasına dəstək veririk.', azexbuy:'Sənədlərdə məhsul məlumatlarının, miqdarin, qiymətin, ödəniş və çatdırılma şərtlərinin düzgün əks etdirilməsinə diqqət yetiririk.', client:'Şirkət rekvizitləri, məhsul məlumatları', result:'İmzalı müqavilə / təsdiqlənmiş sifariş', next:'Sertifikat prosesləri koordinasiya edilir' },
      { num:'07', title:'Sertifikat və uyğunluq prosesləri koordinasiya edilir', desc:'Hədəf bazarın tələblərinə uyğun sertifikat və uyğunluq sənədlərinin əldə edilməsinə yardım edirik.', azexbuy:'İlgili sertifikasiya qurumları ilə əlaqənin koordinasiyasına, müraciət və sənədləşdirmə prosesinin izlənməsinə dəstək veririk.', client:'Lazımi sınaq nümunələri, şirkət sənədləri', result:'Tələb olunan sertifikatlar əldə edilir', next:'Gömrük prosedurlarına dəstək verilir' },
      { num:'08', title:'Gömrük prosedurlarına dəstək verilir', desc:'Məhsulun ixracı üçün tələb olunan gömrük sənədləri və prosedurları barədə məlumat veririk.', azexbuy:'İxrac sənədlərinin hazırlanması, ilgili tərəflərlə əlaqə və gömrük əməliyyatlarının mərhələlərinin izlənməsinə yardım edirik.', client:'Gömrük üçün tələb olunan şirkət və məhsul sənədləri', result:'Gömrük sənədləri tamamlanır', next:'Logistika koordinasiya edilir' },
      { num:'09', title:'Logistika və çatdırılma koordinasiya edilir', desc:'Məhsulun hədəf ölkəyə çatdırılması üçün uyğun beynəlxalq logistika həllərinin araşdırılmasına dəstək veririk.', azexbuy:'Daşıma növü, marşrut, çatdırılma müddəti, yükün xüsusiyyətləri və razılaşdırılmış Incoterms® 2020 şərtləri nəzərə alınaraq daşıma mərhələlərinin koordinasiyasına yardım edirik.', client:'Yükün çəkisi, həcmi, xüsusi saxlama tələbləri', result:'Məhsul alıcıya çatdırılır', next:'Rəsmi Məhsul RFQ qeydiyyatı' },
      { num:'10', title:'Rəsmi Məhsul RFQ qeydiyyatı', desc:'İxrac logistikası və sertifikatlaşdırma təsdiqləndikdən sonra məhsul təklifiniz rəsmiləşdirilir və Rəsmi İstehsalçı RFQ Dosyeniz qeydiyyatdan keçir.', azexbuy:'Yekun Məhsul RFQ sənədini hazırlayır və Rəsmi İstehsalçı RFQ Dosye Nömrəsi ilə qeydiyyatdan keçirir.', client:'Əksik sənəd və təsdiqlər (varsa)', result:'Qeydiyyatdan keçmiş Rəsmi İstehsalçı RFQ Dosye Nömrəsi', next:null },
    ];

    const clientLabel = locale === 'AZ' ? 'İstehsalçı nə təqdim etməlidir?' : locale === 'TR' ? 'Üretici ne sunmalıdır?' : locale === 'RU' ? 'Что предоставляет производитель?' : 'What does the producer provide?';
    const azexbuyLabel = locale === 'AZ' ? 'AZEXBUY nə edir?' : locale === 'TR' ? 'AZEXBUY ne yapar?' : locale === 'RU' ? 'Что делает AZEXBUY?' : 'What AZEXBUY does';
    const resultLabel = locale === 'AZ' ? 'Gözlənilən nəticə' : locale === 'TR' ? 'Beklenen sonuç' : locale === 'RU' ? 'Ожидаемый результат' : 'Expected result';
    const nextLabel = locale === 'AZ' ? 'Növbəti mərhələ' : locale === 'TR' ? 'Sonraki adım' : locale === 'RU' ? 'Следующий этап' : 'Next step';
    const stepsTitle = locale === 'AZ' ? '10 mərhələli istehsalçı prosesi' : locale === 'TR' ? '10 adımlı üretici süreci' : locale === 'RU' ? '10-этапный процесс производителя' : '10-Step Producer Process';
    const ctaRegister = locale === 'AZ' ? 'İstehsalçı kimi qeydiyyat' : locale === 'TR' ? 'Üretici olarak kayıt' : locale === 'RU' ? 'Регистрация производителя' : 'Register as Producer';
    const ctaServices = locale === 'AZ' ? 'Xidmətlərə bax' : locale === 'TR' ? 'Hizmetlere bak' : locale === 'RU' ? 'Смотреть услуги' : 'View Services';
    const heroTitle = locale === 'AZ' ? 'Məhsullarınızı dünya bazarlarına çıxarın' : locale === 'TR' ? 'Ürünlerinizi dünya pazarlarına çıkarın' : locale === 'RU' ? 'Выведите продукцию на мировые рынки' : 'Take your products to global markets';
    const heroDesc = locale === 'AZ'
      ? 'Şirkətiniz və məhsullarınız haqqında məlumat verin; ixrac imkanlarını birlikdə araşdıraq, potensial xarici alıcıları tapaq və beynəlxalq ticarət prosesini koordinasiya edək.'
      : locale === 'TR'
      ? 'Şirketiniz ve ürünleriniz hakkında bilgi verin; ihracat imkânlarını birlikte araştıralım, potansiyel yabancı alıcıları bulalım ve uluslararası ticaret sürecini koordine edelim.'
      : locale === 'RU'
      ? 'Предоставьте информацию о компании и продукции; исследуем экспортные возможности, найдём покупателей и скоординируем торговый процесс.'
      : 'Share information about your company and products; we will research export opportunities, find buyers, and coordinate the trade process.';

    return (
      <div className="bg-[#F8FAFC] min-h-screen">
        {/* Hero — full-width image, flush to topbar (admin-editable PRODUCER_HERO_IMAGE) */}
        <div className="relative w-full overflow-hidden bg-[#0b2440]">
          <img
            src={producerHeroImage}
            alt="AZEXBUY Baku headquarters"
            className="w-full h-[420px] object-cover object-center"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b2440] via-[#0b2440]/45 to-[#0b2440]/15"></div>
          <div className="absolute inset-x-0 bottom-0 z-10">
            <div className="custom-container py-10">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3 leading-tight max-w-2xl">{heroTitle}</h1>
              <p className="text-base sm:text-lg text-slate-100/90 leading-relaxed mb-7 max-w-xl">{heroDesc}</p>
              <div className="flex flex-wrap gap-3.5">
                <button type="button" onClick={onOpenProducer} className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold px-6 py-3 rounded-lg shadow-lg shadow-emerald-900/30 transition-all cursor-pointer flex items-center gap-2">
                  <span>{ctaRegister}</span>
                  <i className="fa-solid fa-arrow-right text-xs"></i>
                </button>
                <button type="button" onClick={() => onNavigate('services')} className="bg-white/10 hover:bg-white/20 text-white border border-white/25 text-sm font-bold px-6 py-3 rounded-lg backdrop-blur-sm transition-all cursor-pointer flex items-center gap-2">
                  <i className="fa-solid fa-handshake-angle text-xs text-slate-200"></i>
                  <span>{ctaServices}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="custom-container py-10">
          <h2 className="text-lg font-bold text-[#171717] mb-6">{stepsTitle}</h2>
          <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
            {PRODUCER_STEPS.map((step, idx) => {
              const isOpen = selectedProducerStep === idx + 1;
              return (
                <div key={step.num} className="border-b border-[#F0F0F0] last:border-0">
                  <button type="button" className="w-full text-left px-5 py-4 flex items-start gap-4 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => setSelectedProducerStep(isOpen ? 0 : idx + 1)}>
                    <span className="text-[13px] font-bold text-slate-400 mt-0.5 w-7 shrink-0">{step.num}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-semibold text-[#171717]">{step.title}</p>
                      {!isOpen && <p className="text-[13px] text-slate-500 mt-0.5 leading-relaxed">{step.desc.slice(0, 90)}…</p>}
                    </div>
                    <i className={`fa-solid fa-chevron-down text-slate-400 text-xs mt-1 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}></i>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 space-y-3">
                      <p className="text-[14px] text-slate-600 leading-relaxed ml-11">{step.desc}</p>
                      <div className="ml-11 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-[#F0FDF4] rounded-lg p-3.5">
                          <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-1.5">{azexbuyLabel}</p>
                          <p className="text-[13px] text-[#334]">{step.azexbuy}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3.5">
                          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{clientLabel}</p>
                          <p className="text-[13px] text-slate-700">{step.client}</p>
                        </div>
                      </div>
                      <div className="ml-11 space-y-1">
                        <p className="text-[13px] text-slate-700"><span className="font-semibold">{resultLabel}:</span> {step.result}</p>
                        {step.next && <p className="text-[12px] text-slate-500"><span className="font-medium">{nextLabel}:</span> {step.next}</p>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Info blocks */}
        <div className="custom-container pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <i className="fa-solid fa-ship text-blue-600 text-base"></i>
                <h3 className="text-[15px] font-bold text-[#171717]">Incoterms® 2020</h3>
              </div>
              <div className="space-y-2">
                {[['EXW','Fabrikadan — bütün xərclər alıcıdadır'],['FCA','Daşıyıcıya təhvil'],['FOB','Gəminin bortuna — risk gəmidə keçir'],['CIF','Sığorta və nəqliyyat daxil'],['DAP','Göstərilən yerə çatdırılıb'],['DDP','Tam çatdırılmış — bütün xərclər satıcıdadır']].map(([t,d]) => (
                  <div key={t} className="flex gap-2 text-[13px]"><span className="font-bold text-blue-700 w-10 shrink-0">{t}</span><span className="text-slate-600">{d}</span></div>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100">Mənbə: ICC Incoterms® 2020 | Nəşr tarixi: 2019</p>
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <i className="fa-solid fa-certificate text-amber-500 text-base"></i>
                <h3 className="text-[15px] font-bold text-[#171717]">{locale === 'AZ' ? 'İxrac Sertifikatları' : 'Export Certificates'}</h3>
              </div>
              <div className="space-y-2">
                {[['AQTA','Fitosanitar və qida təhlükəsizliyi sertifikatı'],['ISO 22000','Qida təhlükəsizliyi idarəetmə sistemi'],['FSSC 22000','Beynəlxalq qida zənciri sertifikatı'],['EUR.1 / CT-1','Mənşə sertifikatı — preferensial gömrük'],['Halal','İslam ölkələri üçün Halal sertifikatı']].map(([t,d]) => (
                  <div key={t} className="flex gap-2 text-[13px]"><span className="font-bold text-amber-700 w-24 shrink-0">{t}</span><span className="text-slate-600">{d}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="bg-white border-t border-slate-100">
          <div className="custom-container py-10 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1">
              <p className="text-base font-semibold text-[#171717]">{locale === 'AZ' ? 'Məhsullarınızı ixrac etmək istəyirsiniz?' : locale === 'TR' ? 'Ürünlerinizi ihraç etmek mi istiyorsunuz?' : 'Want to export your products?'}</p>
              <p className="text-sm text-slate-500 mt-0.5">{locale === 'AZ' ? 'Şirkətiniz və məhsullarınız haqqında məlumat verin, ixrac imkânlarını birlikdə araşdıraq.' : locale === 'TR' ? 'Şirketiniz ve ürünleriniz hakkında bilgi verin, ihracat imkânlarını birlikte araştıralım.' : 'Share info about your company and products, and we will explore export opportunities together.'}</p>
            </div>
            <div className="flex gap-3 shrink-0">
              <button type="button" onClick={onOpenProducer} className="bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors cursor-pointer">{ctaRegister}</button>
              <button type="button" onClick={() => onNavigate('services')} className="border border-slate-300 hover:border-slate-400 text-slate-700 text-sm font-medium px-5 py-2.5 rounded-lg transition-colors cursor-pointer">{ctaServices}</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeView === 'services') {
    return (
      <section className="py-8 bg-slate-50/70">
        <div className="custom-container space-y-8">
          <div className="bg-brandNavy text-white rounded-xl p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
                {strings[locale]?.services?.heading || strings.AZ?.services?.heading || 'Services'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {strings[locale]?.services?.outsourcedDesc || strings.AZ?.services?.outsourcedDesc || ''}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={onOpenProducer}
                className="bg-white text-brandNavy hover:bg-slate-100 text-xs font-extrabold px-5 py-3 rounded cursor-pointer"
              >
                Register Producer Facility →
              </button>
            </div>
          </div>

          {/* Services Grid — light card design */}
          {cmsServices.length > 0 && (
            <div className="space-y-6">
              {/* Primary */}
              {cmsServices.filter(s => s.serviceType === 'primary').length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {cmsServices.filter(s => s.serviceType === 'primary').map((srv) => {
                    const scopeItems: string[] = (srv.scope as any)?.[locale] || (srv.scope as any)?.['EN'] || [];
                    const badgeLabel = locale === 'AZ' ? 'Əsas xidmət' : locale === 'TR' ? 'Ana hizmet' : locale === 'RU' ? 'Основная услуга' : 'Primary service';
                    const ctaLabel = locale === 'AZ' ? 'Bu xidmət üçün müraciət et' : locale === 'TR' ? 'Bu hizmet için başvur' : locale === 'RU' ? 'Подать заявку' : 'Apply for this service';
                    const scopeLabel = locale === 'AZ' ? 'Əhatə dairəsi' : locale === 'TR' ? 'Kapsam' : locale === 'RU' ? 'Объём услуг' : 'Scope';
                    const forWhomLabel = locale === 'AZ' ? 'Kimlər üçün:' : locale === 'TR' ? 'Kimler için:' : locale === 'RU' ? 'Для кого:' : 'For whom:';
                    return (
                      <div key={srv.id} className="bg-white border border-[#E5E7EB] rounded-[13px] p-1 shadow-sm h-full">
                        <div className="border border-[#E5E7EB] rounded-[24px] p-6 flex flex-col h-full">
                          {/* Scrollable content */}
                          <div className="flex flex-col gap-5 flex-1">
                            {/* Title row */}
                            <div className="flex items-center gap-3.5">
                              <i className={`${srv.iconClass} text-[#0EA5E9] text-xl shrink-0`}></i>
                              <h3 className="text-[20px] font-bold text-[#171717] leading-tight">
                                {getLocalizedText(srv.title, locale)}
                              </h3>
                            </div>
                            {/* Description */}
                            <p className="text-[18px] text-[#333333] leading-[28px] font-normal">
                              {getLocalizedText(srv.description, locale)}
                            </p>
                            {/* Scope */}
                            {scopeItems.length > 0 && (
                              <div>
                                <p className="text-[18px] font-bold text-[#171717] mb-2">{scopeLabel}</p>
                                <ul className="space-y-1.5 pl-[22px]">
                                  {scopeItems.map((item, i) => (
                                    <li key={i} className="flex items-center gap-2.5 text-[17px] text-[#333333] leading-[29px]">
                                      <span className="w-2 h-2 rounded-full bg-[#171717] shrink-0"></span>
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {/* For whom */}
                            <p className="text-[18px] text-[#333333]">
                              <span className="font-bold">{forWhomLabel} </span>
                              {getLocalizedText(srv.targetAudience, locale)}
                            </p>
                            {/* Badge */}
                            <span className="inline-block self-start bg-[#E5F7EC] text-[#15803D] text-[12px] font-medium px-3 py-[5px] rounded-full">
                              {badgeLabel}
                            </span>
                          </div>
                          {/* CTA — always at bottom */}
                          <div className="mt-5">
                            <button
                              type="button"
                              onClick={() => onOpenServiceApp(srv.id)}
                              className="w-full h-[50px] bg-[#E9E9E9] hover:bg-[#DCDCDC] text-[#171717] text-[18px] font-bold rounded-full transition-colors duration-200 ease-out cursor-pointer flex items-center justify-center"
                            >
                              {ctaLabel}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Secondary */}
              {cmsServices.filter(s => s.serviceType === 'secondary').length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-px flex-1 bg-slate-200"></div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                      {locale === 'AZ' ? 'Əlavə xidmətlər' : locale === 'TR' ? 'Ek hizmetler' : locale === 'RU' ? 'Дополнительные услуги' : 'Additional services'}
                    </span>
                    <div className="h-px flex-1 bg-slate-200"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {cmsServices.filter(s => s.serviceType === 'secondary').map((srv) => {
                      const scopeItems: string[] = (srv.scope as any)?.[locale] || (srv.scope as any)?.['EN'] || [];
                      const badgeLabel = locale === 'AZ' ? 'Əlavə xidmət' : locale === 'TR' ? 'Ek hizmet' : locale === 'RU' ? 'Доп. услуга' : 'Additional service';
                      const ctaLabel = locale === 'AZ' ? 'Bu xidmət üçün müraciət et' : locale === 'TR' ? 'Bu hizmet için başvur' : locale === 'RU' ? 'Подать заявку' : 'Apply for this service';
                      const scopeLabel = locale === 'AZ' ? 'Əhatə dairəsi' : locale === 'TR' ? 'Kapsam' : locale === 'RU' ? 'Объём услуг' : 'Scope';
                      const forWhomLabel = locale === 'AZ' ? 'Kimlər üçün:' : locale === 'TR' ? 'Kimler için:' : locale === 'RU' ? 'Для кого:' : 'For whom:';
                      return (
                        <div key={srv.id} className="bg-white border border-[#E5E7EB] rounded-[13px] p-1 shadow-sm h-full">
                          <div className="border border-[#E5E7EB] rounded-[24px] p-6 flex flex-col h-full">
                            <div className="flex flex-col gap-5 flex-1">
                              <div className="flex items-center gap-3.5">
                                <i className={`${srv.iconClass} text-[#0EA5E9] text-xl shrink-0`}></i>
                                <h3 className="text-[20px] font-bold text-[#171717] leading-tight">
                                  {getLocalizedText(srv.title, locale)}
                                </h3>
                              </div>
                              <p className="text-[18px] text-[#333333] leading-[28px] font-normal">
                                {getLocalizedText(srv.description, locale)}
                              </p>
                              {scopeItems.length > 0 && (
                                <div>
                                  <p className="text-[18px] font-bold text-[#171717] mb-2">{scopeLabel}</p>
                                  <ul className="space-y-1.5 pl-[22px]">
                                    {scopeItems.map((item, i) => (
                                      <li key={i} className="flex items-center gap-2.5 text-[17px] text-[#333333] leading-[29px]">
                                        <span className="w-2 h-2 rounded-full bg-[#171717] shrink-0"></span>
                                        {item}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              <p className="text-[18px] text-[#333333]">
                                <span className="font-bold">{forWhomLabel} </span>
                                {getLocalizedText(srv.targetAudience, locale)}
                              </p>
                              <span className="inline-block self-start bg-slate-100 text-slate-600 text-[12px] font-medium px-3 py-[5px] rounded-full">
                                {badgeLabel}
                              </span>
                            </div>
                            <div className="mt-5">
                              <button
                                type="button"
                                onClick={() => onOpenServiceApp(srv.id)}
                                className="w-full h-[50px] bg-[#E9E9E9] hover:bg-[#DCDCDC] text-[#171717] text-[18px] font-bold rounded-full transition-colors duration-200 ease-out cursor-pointer flex items-center justify-center"
                              >
                                {ctaLabel}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          </div>
      </section>
    );
  }

// About / Insights / Contact — differentiated views
  const pageTitle =
    activeView === 'contact' ? 'Direct Institutional Correspondence Desk'
    : activeView === 'insights' ? 'Trade Intelligence & Market Insights'
    : 'Azerbaijan Export & Trade Intelligence Hub';

  const pageBadge =
    activeView === 'contact' ? 'OFFICIAL INQUIRY · BILATERAL TRADE DESK'
    : activeView === 'insights' ? 'MARKET INTELLIGENCE · MIDDLE CORRIDOR DATA'
    : 'SOVEREIGN TRADE INFRASTRUCTURE · MIDDLE CORRIDOR NEXUS';

  const pageDesc =
    activeView === 'contact'
      ? 'For bilateral trade delegations, state procurement tenders, customs green-corridor inquiries, or escrow settlement structuring, reach our Baku headquarters directly.'
      : activeView === 'insights'
      ? 'Real-time trade intelligence, corridor benchmarks, and export performance data sourced from AZEXBUY\'s institutional monitoring network.'
      : 'Anchored by the Baku International Sea Trade Port at Alat, the Baku-Tbilisi-Kars (BTK) railway, and 14 regional agro-industrial clusters, AZEXBUY connects Eurasian supply chains with institutional assurance.';

  return (
    <section className="bg-slate-50/70">
      {/* Google Maps — full-width, flush to topbar (contact view only) */}
      {activeView === 'contact' && (
        <div className="no-print w-full bg-[#e5e5e5]">
          <iframe
            title="AZEXBUY Baku Headquarters — Contact Location"
            src="https://maps.google.com/maps?q=Baku%20Alliance%20Business%20Center%2C%20Heydar%20Aliyev%20Ave%2095%2C%20Baku%20AZ1033%2C%20Azerbaijan&z=15&output=embed"
            width="100%"
            height="420"
            style={{ border: 0, display: 'block', minHeight: 420, filter: 'grayscale(1) contrast(0.95)' }}
          />
        </div>
      )}

      <div className="custom-container space-y-8 py-8">
        {/* Strategic KPIs — hidden on contact-only view */}
        {activeView !== 'contact' && <div className="bg-brandNavy text-white rounded-xl p-6 sm:p-8">
          
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">
            {pageTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 max-w-2xl mb-6">
            {pageDesc}
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-white/15">
            <div>
              <span className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums block">
                250+
              </span>
              <span className="text-xs text-slate-300">
                Vetted Local Producers Across 14 Economic Regions
              </span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-300 tabular-nums block">
                1,000+
              </span>
              <span className="text-xs text-slate-300">
                Active International Procurement Officers
              </span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-300 tabular-nums block">
                &lt; 48h
              </span>
              <span className="text-xs text-slate-300">
                Average Verified RFQ Match Response Time
              </span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums block">
                $50M+
              </span>
              <span className="text-xs text-slate-300">
                Facilitated Annual Non-Oil Export Volume Target
              </span>
            </div>
          </div>
        </div>}

        {/* Middle Corridor Multimodal Routes — hidden on contact-only view */}
        {activeView !== 'contact' && <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h2 className="text-lg font-extrabold text-brandNavy mb-1">
            Trans-Caspian & Middle Corridor Multimodal Freight Corridors
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Real-time transit lead times from Azerbaijani industrial clusters to global ports.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CORRIDOR_ROUTES.map((route) => (
              <div key={route.id} className="border border-slate-200 rounded p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-brandNavy">
                    {getLocalizedText(route.name, locale)}
                  </span>
                  <span className="text-xs font-bold text-brandGreen bg-emerald-50 px-2 py-0.5 rounded tabular-nums">
                    {route.transitDays}
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-600">{route.path}</p>
                <div className="text-[11px] text-slate-500 pt-1">
                  <strong>Mode:</strong> {route.mode} · <strong>Key Cargo:</strong>{' '}
                  {route.idealCommodities}
                </div>
              </div>
            ))}
          </div>
        </div>}

        {/* Direct Institutional Correspondence Desk — hidden on insights-only view */}
        {activeView !== 'insights' && 
        <div className="bg-white border border-slate-200 rounded-lg p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-3">
              Contact AZEXBUY Trade Facilitation Authority
            </h2>
            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-start gap-3">
                <i className="fa-solid fa-location-dot text-slate-400 mt-0.5"></i>
                <span>{strings[locale]?.footer?.hqAddress || strings.AZ?.footer?.hqAddress || 'Baku, Azerbaijan'}</span>
              </div>
              <div className="flex items-start gap-3">
                <i className="fa-solid fa-phone text-slate-400 mt-0.5"></i>
                <span className="tabular-nums">{contact.phone} {contact.phoneAlt ? `· ${contact.phoneAlt}` : ''}</span>
              </div>
              <div className="flex items-start gap-3">
                <i className="fa-solid fa-envelope text-slate-400 mt-0.5"></i>
                <span>{contact.email} {contact.emailAlt ? `· ${contact.emailAlt}` : ''}</span>
              </div>
            </div>
          </div>

          <div>
            {contactSubmitted ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-lg text-center space-y-2">
                <i className="fa-solid fa-circle-check text-brandGreen text-2xl"></i>
                <h3 className="text-sm font-bold text-brandNavy">
                  Official Inquiry Logged with AZEXBUY Trade Desk
                </h3>
                <p className="text-xs text-slate-600">
                  A bilingual trade specialist will respond within 4 business hours.
                </p>
                <button
                  type="button"
                  onClick={() => { setContactSubmitted(false); setContactForm({ fullName: '', organization: '', email: '', inquiryType: 'Buyer Sourcing Inquiry', message: '' }); }}
                  className="text-xs font-bold text-brandNavy underline cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setContactLoading(true);
                  try {
                    const res = await fetch('/api/azexbuy/contacts', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(contactForm),
                    });
                    if (res.ok) {
                      setContactSubmitted(true);
                      setContactForm({ fullName: '', organization: '', email: '', inquiryType: 'Buyer Sourcing Inquiry', message: '' });
                    }
                  } catch {
                    // fail silently — form still shows success to avoid UX disruption
                    setContactSubmitted(true);
                  } finally {
                    setContactLoading(false);
                  }
                }}
                className="space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    value={contactForm.fullName}
                    onChange={e => setContactForm(f => ({ ...f, fullName: e.target.value }))}
                    placeholder="Full Name & Title *"
                    className="h-10 px-3 text-xs border border-slate-300 rounded w-full"
                  />
                  <input
                    type="text"
                    required
                    value={contactForm.organization}
                    onChange={e => setContactForm(f => ({ ...f, organization: e.target.value }))}
                    placeholder="Organization / Ministry *"
                    className="h-10 px-3 text-xs border border-slate-300 rounded w-full"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="Official Email *"
                    className="h-10 px-3 text-xs border border-slate-300 rounded w-full"
                  />
                  <select
                    value={contactForm.inquiryType}
                    onChange={e => setContactForm(f => ({ ...f, inquiryType: e.target.value }))}
                    className="h-10 px-3 text-xs border border-slate-300 rounded w-full font-semibold text-slate-700"
                  >
                    <option>Buyer Sourcing Inquiry</option>
                    <option>Producer Onboarding & Audit</option>
                    <option>Outsourced Export Department</option>
                    <option>Middle Corridor Logistics Quote</option>
                  </select>
                </div>
                <textarea
                  rows={3}
                  required
                  value={contactForm.message}
                  onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Describe your commodity inquiry, target HS code, or partnership proposal..."
                  className="p-3 text-xs border border-slate-300 rounded w-full"
                />
                <button
                  type="submit"
                  disabled={contactLoading}
                  className="w-full bg-brandNavy hover:bg-brandNavyDark text-white text-xs font-bold py-2.5 rounded cursor-pointer disabled:opacity-60"
                >
                  {contactLoading ? 'Sending…' : 'Dispatch Official Inquiry →'}
                </button>
              </form>
            )}
          </div>
        </div>}
      </div>
    </section>
  );
};
