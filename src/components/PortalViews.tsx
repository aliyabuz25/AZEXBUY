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
    const matchesCat = categoryFilter === 'all' || p.categoryKey === categoryFilter;
    const matchesIncoterm = incotermFilter === 'ALL' || p.incoterms.includes(incotermFilter);
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      getLocalizedText(p.name, locale).toLowerCase().includes(q) ||
      p.hsCode.includes(q) ||
      getLocalizedText(p.originRegion, locale).toLowerCase().includes(q);
    return matchesCat && matchesIncoterm && matchesSearch;
  });

  return (
    <section className="py-8 bg-slate-50/60 min-h-[70vh]">
      <div className="custom-container space-y-6">
        {/* Top Banner */}
        <div className="bg-brandNavy text-white rounded-lg p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <span className="text-[11px] font-bold tracking-widest uppercase text-amber-300 block mb-1">
              NATIONAL EXPORT COMMODITY REGISTRY · HS-6 VERIFIED
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {strings[locale].featuredProducts.heading}
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
                    <div className="absolute top-2.5 left-2.5 bg-brandNavy/90 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded tabular-nums">
                      HS: {product.hsCode}
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

                  {/* Unboxed Metadata per Sovereign Design */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1">
                    <span>{getLocalizedText(product.categoryLabel, locale)}</span>
                    <span>·</span>
                    <span className="tabular-nums">{product.verifiedSuppliersCount} Verified Producers</span>
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
                      <span className="font-mono font-semibold text-brandNavy">
                        {product.incoterms.join(' / ')}
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
                    <span>{strings[locale].featuredProducts.requestProduct}</span>
                    <i className="fa-solid fa-arrow-right text-[10px]"></i>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
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
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300 block">
              HS CODE: {product.hsCode} · {getLocalizedText(product.categoryLabel, locale)}
            </span>
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
                  {product.certifications.join(' · ')}
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                  Incoterms® 2020
                </span>
                <span className="font-mono font-bold text-brandNavy">
                  {product.incoterms.join(' · ')}
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
              <span>{strings[locale].featuredProducts.requestProduct}</span>
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
            <span className="text-[11px] font-bold uppercase tracking-widest text-brandGreen block">
              OPERATIONS DESK · LEAD MANAGEMENT & SMART MATCHING
            </span>
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
                      <span className="font-mono text-xs font-bold text-brandNavy">{rfq.id}</span>
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
                        <span className="font-mono font-bold text-brandNavy tabular-nums">
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
                        <span className="font-mono font-bold text-brandGreen tabular-nums">
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
                      <span className="text-[11px] text-slate-500 font-mono">HS: {p.hsCode}</span>
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
  onNavigate: (v: ViewMode) => void;
}

export const SubpagePortalView: React.FC<SubpagePortalProps> = ({
  activeView,
  locale,
  onOpenRFQ,
  onOpenProducer,
  onNavigate,
}) => {
  const { strings, buyerSteps: cmsBuyerSteps, producerSteps: cmsProducerSteps, services: cmsServices } = useLocalization();
  const [selectedBuyerStep, setSelectedBuyerStep] = useState<number>(1);
  const [selectedProducerStep, setSelectedProducerStep] = useState<number>(1);
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const activeBuyerStepObj = cmsBuyerSteps.find((s: any) => s.number === selectedBuyerStep) || cmsBuyerSteps[0];
  const activeProducerStepObj =
    cmsProducerSteps.find((s: any) => s.number === selectedProducerStep) || cmsProducerSteps[0];

  if (!cmsBuyerSteps.length || !cmsProducerSteps.length) return null;

  if (activeView === 'buyers' || activeView === 'how-it-works') {
    return (
      <section className="py-8 bg-slate-50/70">
        <div className="custom-container space-y-8">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#0f3156] to-[#1a497d] text-white rounded-xl p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <span className="text-[11px] font-bold uppercase tracking-widest text-blue-200 block mb-1">
                INTERNATIONAL BUYER FACILITATION & DUAL-TRACK PIPELINE
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
                {activeView === 'buyers'
                  ? strings[locale].bilateral.buyersTitle
                  : strings[locale].howItWorks.heading}
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
                {strings[locale].bilateral.buyersDesc}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={onOpenRFQ}
                className="bg-brandGreen hover:bg-brandGreenDark text-white text-xs font-bold px-5 py-3 rounded cursor-pointer flex items-center gap-2"
              >
                <span>Launch Buyer RFQ Desk</span>
                <i className="fa-solid fa-arrow-right text-[10px]"></i>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('products')}
                className="bg-white/10 hover:bg-white/20 border border-white/30 text-white text-xs font-bold px-4 py-3 rounded cursor-pointer"
              >
                Browse HS-6 Catalog
              </button>
            </div>
          </div>

          {/* Interactive Track A: Buyers 7-Step Inspector */}
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700 block">
                  TRACK A — {strings[locale].howItWorks.forBuyersLabel} (7 STEPS)
                </span>
                <p className="text-xs text-slate-500">
                  {strings[locale].howItWorks.clickStepHint}
                </p>
              </div>
              <span className="text-xs font-bold text-brandNavy bg-blue-50 px-3 py-1 rounded tabular-nums">
                Average RFQ Match SLA: &lt; 48 Hours
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 mb-6">
              {cmsBuyerSteps.map((step) => {
                const active = step.number === selectedBuyerStep;
                return (
                  <button
                    key={step.number}
                    type="button"
                    onClick={() => setSelectedBuyerStep(step.number)}
                    className={`p-3 rounded border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      active
                        ? 'bg-brandNavy text-white border-brandNavy shadow-sm'
                        : 'bg-slate-50 hover:bg-blue-50/50 text-slate-800 border-slate-200'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center mb-2 tabular-nums ${
                        active ? 'bg-brandGreen text-white' : 'bg-blue-600 text-white'
                      }`}
                    >
                      {step.number}
                    </span>
                    <span className="text-xs font-bold leading-snug">{getLocalizedText(step.title, locale)}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Buyer Step Detail Panel */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              <div className="lg:col-span-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block mb-1">
                  {activeBuyerStepObj.authority} · SLA: {activeBuyerStepObj.sla}
                </span>
                <h3 className="text-lg font-extrabold text-brandNavy mb-2">
                  {getLocalizedText(activeBuyerStepObj.detailTitle, locale)}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {getLocalizedText(activeBuyerStepObj.description, locale)}
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded p-4 flex flex-col justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Official Phase Deliverable
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {getLocalizedText(activeBuyerStepObj.deliverable, locale)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onOpenRFQ}
                  className="w-full bg-brandNavy hover:bg-brandNavyDark text-white text-xs font-bold py-2 px-3 rounded cursor-pointer"
                >
                  Start Step {activeBuyerStepObj.number} Now →
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Track B: Producers 10-Phase Inspector */}
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-brandGreen block">
                  TRACK B — {strings[locale].howItWorks.forProducersLabel} (10 PHASES)
                </span>
                <p className="text-xs text-slate-500">
                  End-to-end export readiness, certification, and international logistics pipeline for Azerbaijani manufacturers.
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenProducer}
                className="text-xs font-bold text-brandGreen hover:underline cursor-pointer"
              >
                Register Facility in Producer Pipeline →
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2 mb-6">
              {cmsProducerSteps.map((step) => {
                const active = step.number === selectedProducerStep;
                return (
                  <button
                    key={step.number}
                    type="button"
                    onClick={() => setSelectedProducerStep(step.number)}
                    className={`p-2.5 rounded border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      active
                        ? 'bg-brandGreen text-white border-brandGreen shadow-sm'
                        : 'bg-slate-50 hover:bg-emerald-50/60 text-slate-800 border-slate-200'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center mb-1.5 tabular-nums ${
                        active ? 'bg-brandNavy text-white' : 'bg-brandGreen text-white'
                      }`}
                    >
                      {step.number}
                    </span>
                    <span className="text-[11px] font-bold leading-tight">{getLocalizedText(step.title, locale)}</span>
                  </button>
                );
              })}
            </div>

            <div className="bg-emerald-50/50 border border-emerald-200 rounded-lg p-5 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              <div className="lg:col-span-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brandGreen block mb-1">
                  {activeProducerStepObj.authority} · Timeline: {activeProducerStepObj.sla}
                </span>
                <h3 className="text-lg font-extrabold text-brandNavy mb-2">
                  {getLocalizedText(activeProducerStepObj.detailTitle, locale)}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {getLocalizedText(activeProducerStepObj.description, locale)}
                </p>
              </div>
              <div className="bg-white border border-emerald-200 rounded p-4 flex flex-col justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Verified Output
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {getLocalizedText(activeProducerStepObj.deliverable, locale)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onOpenProducer}
                  className="w-full bg-brandGreen hover:bg-brandGreenDark text-white text-xs font-bold py-2 px-3 rounded cursor-pointer"
                >
                  Apply for Producer Onboarding →
                </button>
              </div>
            </div>
          </div>

          {/* Incoterms 2020 Matrix */}
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h2 className="text-lg font-extrabold text-brandNavy mb-1">
              Incoterms® 2020 Export & Logistics Responsibility Matrix
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Standardized delivery terms supported across all AZEXBUY purchase contracts via Port of Baku (Alat), BTK Railway, and TIR corridors.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {INCOTERMS_GUIDE.map((ic) => (
                <div key={ic.code} className="border border-slate-200 rounded p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-extrabold text-brandNavy bg-blue-50 px-2.5 py-0.5 rounded">
                      {ic.code}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">Incoterms® 2020</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{ic.name}</h4>
                  <p className="text-[11px] text-slate-600">
                    <strong>AZEXBUY / Exporter:</strong> {ic.sellerScope}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    <strong>Best For:</strong> {ic.recommendedFor}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (activeView === 'producers' || activeView === 'services') {
    return (
      <section className="py-8 bg-slate-50/70">
        <div className="custom-container space-y-8">
          <div className="bg-gradient-to-r from-[#08261f] to-[#007e62] text-white rounded-xl p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-200 block mb-1">
                PRODUCER EXPORT ACCELERATION & STRUCTURED TRADE SERVICES
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
                {activeView === 'producers'
                  ? strings[locale].bilateral.producersTitle
                  : strings[locale].services.heading}
              </h1>
              <p className="text-xs sm:text-sm text-emerald-50 leading-relaxed">
                {strings[locale].bilateral.producersDesc}
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

          {/* 4 Core Services Detailed Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cmsServices.map((srv) => (
              <div
                key={srv.id}
                className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-full ${srv.colorClass} text-white flex items-center justify-center text-xl shadow-sm`}
                    >
                      <i className={srv.iconClass}></i>
                    </div>
                    <span className="text-xs font-bold text-slate-500 tabular-nums">
                      SLA: {srv.turnaround}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-brandNavy mb-1">
                    {getLocalizedText(srv.title, locale)}
                  </h3>
                  <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                    {getLocalizedText(srv.subtitle, locale)}
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {srv.items.map((it, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-brandGreen"></span>
                        <span>{getLocalizedText(it, locale)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">
                    Key Institutional Deliverables
                  </span>
                  <ul className="space-y-1 text-xs text-slate-700 mb-4">
                    {srv.deliverables.map((d, i) => (
                      <li key={i} className="font-semibold">
                        · {getLocalizedText(d, locale)}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={onOpenRFQ}
                    className="text-xs font-bold text-brandNavy hover:text-brandGreen flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Request {getLocalizedText(srv.title, locale)} Mandate</span>
                    <i className="fa-solid fa-arrow-right text-[10px]"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 5th Service Pillar from PRD: Outsourced Export Department */}
          <div className="bg-brandNavy text-white rounded-lg p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <span className="text-[11px] font-bold uppercase tracking-widest text-amber-300 block mb-1">
                {strings[locale].services.outsourcedBadge}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold mb-2">
                {strings[locale].services.outsourcedTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {strings[locale].services.outsourcedDesc}
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenProducer}
              className="bg-brandGreen hover:bg-brandGreenDark text-white text-xs font-bold px-5 py-3 rounded shrink-0 cursor-pointer"
            >
              {strings[locale].services.outsourcedCta} →
            </button>
          </div>
        </div>
      </section>
    );
  }

  // About / Insights / Contact Unified Institutional View
  return (
    <section className="py-8 bg-slate-50/70">
      <div className="custom-container space-y-8">
        {/* Strategic KPIs from PRD Section 7 */}
        <div className="bg-brandNavy text-white rounded-xl p-6 sm:p-8">
          <span className="text-[11px] font-bold uppercase tracking-widest text-amber-300 block mb-1">
            SOVEREIGN TRADE INFRASTRUCTURE · MIDDLE CORRIDOR NEXUS
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">
            Azerbaijan Export & Trade Intelligence Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 max-w-2xl mb-6">
            Anchored by the Baku International Sea Trade Port at Alat, the Baku-Tbilisi-Kars (BTK) railway, and 14 regional agro-industrial clusters, AZEXBUY connects Eurasian supply chains with institutional assurance.
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
        </div>

        {/* Middle Corridor Multimodal Routes */}
        <div className="bg-white border border-slate-200 rounded-lg p-6">
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
                <p className="text-xs font-mono text-slate-600">{route.path}</p>
                <div className="text-[11px] text-slate-500 pt-1">
                  <strong>Mode:</strong> {route.mode} · <strong>Key Cargo:</strong>{' '}
                  {route.idealCommodities}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Direct Institutional Correspondence Desk */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-brandGreen block mb-1">
              INSTITUTIONAL CORRESPONDENCE DESK
            </span>
            <h2 className="text-xl font-extrabold text-brandNavy mb-2">
              Contact AZEXBUY Trade Facilitation Authority
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              For bilateral trade delegations, state procurement tenders, customs green-corridor inquiries, or escrow settlement structuring, reach our Baku headquarters directly.
            </p>
            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex items-start gap-3">
                <i className="fa-solid fa-location-dot text-brandNavy mt-0.5"></i>
                <div>
                  <strong className="block text-slate-900">Headquarters Address</strong>
                  <span>{strings[locale].footer.hqAddress}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <i className="fa-solid fa-phone text-brandNavy mt-0.5"></i>
                <div>
                  <strong className="block text-slate-900">Direct Trade Desk Telephone</strong>
                  <span className="tabular-nums">+994 (12) 404 85 00 · +994 (50) 290 45 00</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <i className="fa-solid fa-envelope text-brandNavy mt-0.5"></i>
                <div>
                  <strong className="block text-slate-900">Official Electronic Dispatch</strong>
                  <span>desk@azexbuy.az · procurement@azexbuy.az</span>
                </div>
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
                  onClick={() => setContactSubmitted(false)}
                  className="text-xs font-bold text-brandNavy underline cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setContactSubmitted(true);
                }}
                className="space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Full Name & Title *"
                    className="h-10 px-3 text-xs border border-slate-300 rounded w-full"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Organization / Ministry *"
                    className="h-10 px-3 text-xs border border-slate-300 rounded w-full"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="email"
                    required
                    placeholder="Official Email *"
                    className="h-10 px-3 text-xs border border-slate-300 rounded w-full"
                  />
                  <select className="h-10 px-3 text-xs border border-slate-300 rounded w-full font-semibold text-slate-700">
                    <option>Buyer Sourcing Inquiry</option>
                    <option>Producer Onboarding & Audit</option>
                    <option>Outsourced Export Department</option>
                    <option>Middle Corridor Logistics Quote</option>
                  </select>
                </div>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe your commodity inquiry, target HS code, or partnership proposal..."
                  className="p-3 text-xs border border-slate-300 rounded w-full"
                />
                <button
                  type="submit"
                  className="w-full bg-brandNavy hover:bg-brandNavyDark text-white text-xs font-bold py-2.5 rounded cursor-pointer"
                >
                  Dispatch Official Inquiry →
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
