import React, { useState } from 'react';
import { Locale, ProductItem, ViewMode, getLocalizedText } from '../types';
import { useLocalization } from '../context/LocalizationContext';
import { SafeImage } from './SafeImage';

export interface FavoritesViewProps {
  locale: Locale;
  shortlistedIds: string[];
  onToggleShortlist: (id: string) => void;
  onRequestProduct: (product: ProductItem) => void;
  onInspectProduct: (product: ProductItem) => void;
  onOpenMultiRFQ: () => void;
  onNavigate: (view: ViewMode) => void;
  onClearAll?: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  locale,
  shortlistedIds,
  onToggleShortlist,
  onRequestProduct,
  onInspectProduct,
  onOpenMultiRFQ,
  onNavigate,
  onClearAll,
}) => {
  const { strings, products: cmsProducts } = useLocalization();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter only shortlisted products from CMS catalog
  const favoriteProducts = cmsProducts.filter((p: any) => shortlistedIds.includes(p.id));

  // Category list based on items in favorites
  const categories = [
    {
      key: 'all',
      label:
        locale === 'AZ'
          ? 'Hamısı'
          : locale === 'TR'
          ? 'Tümü'
          : locale === 'RU'
          ? 'Все'
          : locale === 'AR'
          ? 'الكل'
          : locale === 'ES'
          ? 'Todos'
          : 'All',
    },
    {
      key: 'industrial',
      label:
        locale === 'AZ'
          ? 'Sənaye & Tekstil'
          : locale === 'TR'
          ? 'Endüstri & Tekstil'
          : locale === 'RU'
          ? 'Промышленность'
          : locale === 'AR'
          ? 'الصناعة'
          : locale === 'ES'
          ? 'Industrial'
          : 'Industrial',
    },
    {
      key: 'agro',
      label:
        locale === 'AZ'
          ? 'Kənd Təsərrüfatı'
          : locale === 'TR'
          ? 'Tarım & Gıda'
          : locale === 'RU'
          ? 'Сельское хоз.'
          : locale === 'AR'
          ? 'الزراعة'
          : locale === 'ES'
          ? 'Agricultura'
          : 'Agriculture',
    },
    {
      key: 'construction',
      label:
        locale === 'AZ'
          ? 'Tikinti'
          : locale === 'TR'
          ? 'İnşaat'
          : locale === 'RU'
          ? 'Строительство'
          : locale === 'AR'
          ? 'البناء'
          : locale === 'ES'
          ? 'Construcción'
          : 'Construction',
    },
    {
      key: 'chemicals',
      label:
        locale === 'AZ'
          ? 'Kimya'
          : locale === 'TR'
          ? 'Kimya'
          : locale === 'RU'
          ? 'Химия'
          : locale === 'AR'
          ? 'الكيماويات'
          : locale === 'ES'
          ? 'Química'
          : 'Chemicals',
    },
    {
      key: 'packaging',
      label:
        locale === 'AZ'
          ? 'Qablaşdırma'
          : locale === 'TR'
          ? 'Ambalaj'
          : locale === 'RU'
          ? 'Упаковка'
          : locale === 'AR'
          ? 'التعبئة'
          : locale === 'ES'
          ? 'Embalaje'
          : 'Packaging',
    },
  ];

  const filteredFavorites = favoriteProducts.filter((p: any) => {
    // Category match
    if (selectedCategory !== 'all') {
      const matchCat =
        p.categoryKey === selectedCategory ||
        p.categoryId === selectedCategory ||
        p.categorySlug === selectedCategory ||
        (selectedCategory === 'industrial' && (p.categoryKey === 'textile' || p.categoryKey === 'metals' || p.categorySlug?.includes('industr'))) ||
        (selectedCategory === 'agro' && (p.categoryKey === 'agri' || p.categorySlug?.includes('agri') || p.categorySlug?.includes('agro') || p.categoryKey === 'food')) ||
        (selectedCategory === 'construction' && (p.categoryKey === 'construction' || p.categorySlug?.includes('construct'))) ||
        (selectedCategory === 'chemicals' && (p.categoryKey === 'chemicals' || p.categorySlug?.includes('chem'))) ||
        (selectedCategory === 'packaging' && (p.categoryKey === 'packaging' || p.categorySlug?.includes('pack')));
      if (!matchCat) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const name = getLocalizedText(p.name, locale).toLowerCase();
      const desc = getLocalizedText(p.shortDesc, locale).toLowerCase();
      const hs = (p.hsCode || '').toLowerCase();
      return name.includes(q) || desc.includes(q) || hs.includes(q);
    }

    return true;
  });

  const handleClearAll = () => {
    const confirmText =
      locale === 'TR'
        ? 'Tüm favori ürünleri listeden kaldırmak istediğinize emin misiniz?'
        : locale === 'AZ'
        ? 'Bütün favori məhsulları siyahıdan silmək istədiyinizdən əminsiniz?'
        : locale === 'RU'
        ? 'Вы уверены, что хотите удалить все товары из избранного?'
        : locale === 'AR'
        ? 'هل أنت متأكد أنك تريد إزالة جميع المنتجات من المفضلة؟'
        : locale === 'ES'
        ? '¿Estás seguro de que deseas eliminar todos los productos de favoritos?'
        : 'Are you sure you want to remove all items from favorites?';

    if (window.confirm(confirmText)) {
      if (onClearAll) {
        onClearAll();
      } else {
        favoriteProducts.forEach((p: any) => onToggleShortlist(p.id));
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      {/* Top Banner / Hero */}
      <div className="bg-gradient-to-b from-brandNavy via-brandNavy/95 to-slate-900 text-white pt-10 pb-12 sm:pt-14 sm:pb-16 border-b border-white/10">
        <div className="custom-container">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-slate-300/80 mb-6 font-medium">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <i className="fa-solid fa-house text-[10px]"></i>
              <span>{locale === 'TR' ? 'Ana Sayfa' : locale === 'AZ' ? 'Ana Səhifə' : 'Home'}</span>
            </button>
            <span className="text-slate-500">/</span>
            <button
              type="button"
              onClick={() => onNavigate('products')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              {locale === 'TR' ? 'Ürünler' : locale === 'AZ' ? 'Məhsullar' : 'Products'}
            </button>
            <span className="text-slate-500">/</span>
            <span className="text-rose-400 font-semibold flex items-center gap-1">
              <i className="fa-solid fa-heart text-[10px]"></i>
              {locale === 'TR' ? 'Favoriler' : locale === 'AZ' ? 'Favorilər' : 'Favorites'}
            </span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs font-semibold mb-3">
                <i className="fa-solid fa-heart text-xs"></i>
                <span>
                  {locale === 'TR'
                    ? 'Seçilmiş Ürün Listesi'
                    : locale === 'AZ'
                    ? 'Seçilmiş Məhsul Siyahısı'
                    : locale === 'RU'
                    ? 'Список избранных товаров'
                    : locale === 'AR'
                    ? 'قائمة المنتجات المختارة'
                    : locale === 'ES'
                    ? 'Lista de Productos Favoritos'
                    : 'Shortlisted Export Commodities'}
                </span>
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                  {favoriteProducts.length}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3">
                {locale === 'TR'
                  ? 'Favori Ürünlerim'
                  : locale === 'AZ'
                  ? 'Seçilmiş Favorilərim'
                  : locale === 'RU'
                  ? 'Избранные товары'
                  : locale === 'AR'
                  ? 'المنتجات المفضلة'
                  : locale === 'ES'
                  ? 'Mis Productos Favoritos'
                  : 'My Saved Favorites'}
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {locale === 'TR'
                  ? 'Beğendiğiniz Azerbaycan menşeli ihracat ürünleri burada toplanır. Dilediğiniz ürünleri inceleyebilir, toplu fiyat teklifi (RFQ) talebinde bulunabilirsiniz.'
                  : locale === 'AZ'
                  ? 'Bəyəndiyiniz Azərbaycan mənşəli ixrac məhsulları burada saxlanılır. Məhsulları incələyə, birbaşa və ya toplu qiymət təklifi (RFQ) sorğusu göndərə bilərsiniz.'
                  : locale === 'RU'
                  ? 'Здесь собраны выбранные вами экспортные товары из Азербайджана. Вы можете запросить консолидированное предложение (RFQ) по всем позициям сразу.'
                  : locale === 'AR'
                  ? 'يتم حفظ منتجات التصدير الأذربيجانية التي نالت إعجابك هنا. يمكنك مراجعتها أو طلب عرض أسعار مجمع لجميع العناصر دفعة واحدة.'
                  : locale === 'ES'
                  ? 'Aquí se guardan tus productos de exportación favoritos de Azerbaiyán. Puedes revisarlos o solicitar una cotización consolidada (RFQ).'
                  : 'Your hand-picked Azerbaijani export commodities. Review technical specs, remove items, or submit a consolidated RFQ for all items simultaneously.'}
              </p>
            </div>

            {/* Quick Actions */}
            {favoriteProducts.length > 0 && (
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={onOpenMultiRFQ}
                  className="px-5 py-3 rounded-xl bg-brandGreen hover:bg-brandGreenDark text-white font-bold text-sm transition-all duration-150 flex items-center gap-2 shadow-sm hover:shadow-md cursor-pointer"
                >
                  <i className="fa-solid fa-paper-plane text-xs"></i>
                  <span>
                    {locale === 'TR'
                      ? `Toplu RFQ Al (${favoriteProducts.length})`
                      : locale === 'AZ'
                      ? `Toplu RFQ Müraciəti (${favoriteProducts.length})`
                      : locale === 'RU'
                      ? `Консолидированный RFQ (${favoriteProducts.length})`
                      : locale === 'AR'
                      ? `طلب مجمع (${favoriteProducts.length})`
                      : locale === 'ES'
                      ? `RFQ Consolidado (${favoriteProducts.length})`
                      : `Consolidated RFQ (${favoriteProducts.length})`}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('products')}
                  className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-colors flex items-center gap-2 cursor-pointer border border-white/10"
                >
                  <i className="fa-solid fa-plus text-xs"></i>
                  <span>{locale === 'TR' ? 'Daha Fazla Ekle' : locale === 'AZ' ? 'Daha Çox Əlavə Et' : 'Add More'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="custom-container -mt-6">
        {favoriteProducts.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl p-8 sm:p-14 text-center border border-slate-200/80 shadow-xs max-w-2xl mx-auto mt-8">
            <div className="w-20 h-20 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-5 text-3xl shadow-inner border border-rose-100">
              <i className="fa-solid fa-heart animate-pulse"></i>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2.5">
              {locale === 'TR'
                ? 'Henüz favori ürününüz yok'
                : locale === 'AZ'
                ? 'Hələlik heç bir favori məhsulunuz yoxdur'
                : locale === 'RU'
                ? 'В избранном пока нет товаров'
                : locale === 'AR'
                ? 'لا توجد منتجات في المفضلة بعد'
                : locale === 'ES'
                ? 'Aún no tienes productos favoritos'
                : 'No favorite products yet'}
            </h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-8 leading-relaxed">
              {locale === 'TR'
                ? "Azerbaycan'ın yüksek kaliteli sanayi, tarım, kimya ve inşaat ürünlerini keşfedin. İlgilendiğiniz ürünlerin üzerindeki kalp (❤️) butonuna basarak favorilerinize ekleyebilirsiniz."
                : locale === 'AZ'
                ? 'Azərbaycanın yüksək keyfiyyətli sənaye, kənd təsərrüfatı, kimya və tikinti məhsullarını kəşf edin. Maraqlandığınız məhsul kartlarının üzərindəki ürək (❤️) düyməsinə klikləyərək buraya əlavə edə bilərsiniz.'
                : locale === 'RU'
                ? 'Откройте для себя экспортные товары Азербайджана и добавляйте их в избранное, нажимая на значок сердца на карточках.'
                : locale === 'AR'
                ? 'استكشف منتجات التصدير الأذربيجانية عالية الجودة وأضف المنتجات إلى قائمتك بالنقر فوق رمز القلب.'
                : locale === 'ES'
                ? 'Descubre productos de exportación de Azerbaiyán y guárdalos haciendo clic en el corazón de las tarjetas.'
                : "Explore Azerbaijan's top export products. Click the heart icon on any product card to shortlist it here for direct or consolidated quotation."}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('products')}
                className="px-6 py-3 rounded-xl bg-brandNavy hover:bg-brandNavyDark text-white text-sm font-semibold transition-all duration-150 flex items-center gap-2 cursor-pointer shadow-xs hover:shadow-md"
              >
                <i className="fa-solid fa-grid-2 text-xs"></i>
                <span>
                  {locale === 'TR'
                    ? 'Ürün Kataloğunu Keşfet'
                    : locale === 'AZ'
                    ? 'Məhsullar Kataloqunu Kəşf Et'
                    : locale === 'RU'
                    ? 'Перейти в каталог'
                    : locale === 'AR'
                    ? 'تصفح كتالوج المنتجات'
                    : locale === 'ES'
                    ? 'Explorar Catálogo'
                    : 'Explore Product Catalog'}
                </span>
                <i className="fa-solid fa-arrow-right text-xs ml-1"></i>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors cursor-pointer"
              >
                {locale === 'TR' ? 'Ana Sayfa' : locale === 'AZ' ? 'Ana Səhifə' : 'Home'}
              </button>
            </div>
          </div>
        ) : (
          /* Populated State */
          <div className="space-y-6">
            {/* Filter / Controls Bar */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Category pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                {categories.map((c) => {
                  const isActive = selectedCategory === c.key;
                  return (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => setSelectedCategory(c.key)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-brandNavy text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                      }`}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>

              {/* Search & Layout toggle */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="relative flex-1 sm:w-60">
                  <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      locale === 'TR'
                        ? 'Favorilerde ara...'
                        : locale === 'AZ'
                        ? 'Favorilərdə axtar...'
                        : 'Search favorites...'
                    }
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-brandNavy/30 bg-slate-50 focus:bg-white"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  )}
                </div>

                <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                      viewMode === 'grid' ? 'bg-white text-brandNavy shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
                    }`}
                    title="Grid view"
                  >
                    <i className="fa-solid fa-grid-2"></i>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                      viewMode === 'table' ? 'bg-white text-brandNavy shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
                    }`}
                    title="Table view"
                  >
                    <i className="fa-solid fa-list"></i>
                  </button>
                </div>

                {/* Clear all button */}
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title={
                    locale === 'TR'
                      ? 'Tüm favorileri temizle'
                      : locale === 'AZ'
                      ? 'Bütün favoriləri sil'
                      : 'Clear all favorites'
                  }
                >
                  <i className="fa-solid fa-trash text-xs"></i>
                </button>
              </div>
            </div>

            {/* If filtered list is empty */}
            {filteredFavorites.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-slate-200/80">
                <i className="fa-solid fa-filter-slash text-2xl text-slate-400 mb-2"></i>
                <p className="text-sm text-slate-600 font-medium">
                  {locale === 'TR'
                    ? 'Bu filtrelere uygun favori ürün bulunamadı.'
                    : locale === 'AZ'
                    ? 'Bu filtrlərə uyğun favori məhsul tapılmadı.'
                    : 'No favorite products matched the selected filter.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="mt-3 text-xs font-semibold text-brandNavy hover:underline cursor-pointer"
                >
                  {locale === 'TR' ? 'Filtreleri Sıfırla' : locale === 'AZ' ? 'Filtrləri Sıfırla' : 'Reset Filters'}
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              /* Grid Layout */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {filteredFavorites.map((product: any) => {
                  const localizedName = getLocalizedText(product.name, locale);
                  const localizedDesc = getLocalizedText(product.shortDesc, locale);
                  const originText =
                    getLocalizedText(product.origin, locale) ||
                    (locale === 'TR' ? 'Azerbaycan' : locale === 'AZ' ? 'Azərbaycan' : 'Azerbaijan');

                  return (
                    <div
                      key={product.id}
                      className="group bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden"
                    >
                      {/* Media container */}
                      <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
                        <SafeImage
                          src={product.image}
                          alt={localizedName}
                          fallbackIcon="fa-box"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Category pill */}
                        {product.category && (
                          <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-slate-900/70 backdrop-blur-md text-[10px] font-semibold text-white uppercase tracking-wider">
                            {product.category}
                          </div>
                        )}

                        {/* Interactive Favorite / Heart button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleShortlist(product.id);
                          }}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 hover:bg-white text-rose-500 hover:text-rose-600 shadow-xs hover:scale-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer z-10"
                          title={
                            locale === 'TR'
                              ? 'Favorilerden Kaldır'
                              : locale === 'AZ'
                              ? 'Favorilərdən Çıxar'
                              : 'Remove from Favorites'
                          }
                        >
                          <i className="fa-solid fa-heart text-sm"></i>
                        </button>

                        {/* Origin pill */}
                        <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-sm text-[10px] font-medium text-slate-700 shadow-2xs flex items-center gap-1">
                          <i className="fa-solid fa-location-dot text-[9px] text-brandGreen"></i>
                          <span>{originText}</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          {/* HS Code & MOQ chips */}
                          <div className="flex items-center gap-2 mb-2 text-[10px] font-semibold">
                            {product.hsCode && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono">
                                HS {product.hsCode}
                              </span>
                            )}
                            {product.moq && (
                              <span className="text-slate-400">
                                MOQ: <span className="text-slate-600 font-medium">{product.moq}</span>
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <h3
                            onClick={() => onInspectProduct(product)}
                            className="font-bold text-slate-900 hover:text-brandNavy transition-colors text-sm leading-snug line-clamp-1 cursor-pointer mb-1.5"
                            title={localizedName}
                          >
                            {localizedName}
                          </h3>

                          {/* Description */}
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                            {localizedDesc}
                          </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => onInspectProduct(product)}
                            className="h-9 px-3 text-xs font-semibold text-slate-700 hover:text-brandNavy bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer shrink-0"
                          >
                            {locale === 'TR' ? 'Detay' : locale === 'AZ' ? 'Detallar' : 'Specs'}
                          </button>
                          <button
                            type="button"
                            onClick={() => onRequestProduct(product)}
                            className="flex-1 h-9 px-4 bg-brandNavy hover:bg-brandNavyDark text-white text-xs font-semibold rounded-xl transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs"
                          >
                            <span>
                              {strings[locale]?.featuredProducts?.requestProduct ||
                                strings.AZ?.featuredProducts?.requestProduct ||
                                (locale === 'TR' ? 'Başvur' : locale === 'AZ' ? 'Müraciət Et' : 'Request RFQ')}
                            </span>
                            <i className="fa-solid fa-arrow-right text-[10px]"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Table Layout */
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-4 w-14"></th>
                        <th className="py-3 px-4">{locale === 'TR' ? 'Ürün' : locale === 'AZ' ? 'Məhsul' : 'Product'}</th>
                        <th className="py-3 px-4">HS Code</th>
                        <th className="py-3 px-4">{locale === 'TR' ? 'Kategori' : locale === 'AZ' ? 'Kateqoriya' : 'Category'}</th>
                        <th className="py-3 px-4">MOQ</th>
                        <th className="py-3 px-4">{locale === 'TR' ? 'Menşe' : locale === 'AZ' ? 'Mənşə' : 'Origin'}</th>
                        <th className="py-3 px-4 text-right">{locale === 'TR' ? 'İşlemler' : locale === 'AZ' ? 'Əməliyyatlar' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredFavorites.map((product: any) => {
                        const localizedName = getLocalizedText(product.name, locale);
                        const originText =
                          getLocalizedText(product.origin, locale) ||
                          (locale === 'TR' ? 'Azerbaycan' : locale === 'AZ' ? 'Azərbaycan' : 'Azerbaijan');

                        return (
                          <tr key={product.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-2.5 px-4">
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                                <SafeImage
                                  src={product.image}
                                  alt={localizedName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </td>
                            <td className="py-2.5 px-4 font-semibold text-slate-900">
                              <button
                                type="button"
                                onClick={() => onInspectProduct(product)}
                                className="hover:text-brandNavy text-left cursor-pointer"
                              >
                                {localizedName}
                              </button>
                            </td>
                            <td className="py-2.5 px-4 font-mono text-slate-600">{product.hsCode || '-'}</td>
                            <td className="py-2.5 px-4 text-slate-600">{product.category || '-'}</td>
                            <td className="py-2.5 px-4 text-slate-600">{product.moq || '-'}</td>
                            <td className="py-2.5 px-4 text-slate-600">{originText}</td>
                            <td className="py-2.5 px-4 text-right">
                              <div className="inline-flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => onInspectProduct(product)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                                >
                                  {locale === 'TR' ? 'Detay' : locale === 'AZ' ? 'Detallar' : 'Specs'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onRequestProduct(product)}
                                  className="px-3 py-1 rounded-lg bg-brandNavy hover:bg-brandNavyDark text-white font-semibold cursor-pointer"
                                >
                                  {locale === 'TR' ? 'Başvur' : locale === 'AZ' ? 'Müraciət' : 'RFQ'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onToggleShortlist(product.id)}
                                  className="p-1.5 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                                  title="Remove"
                                >
                                  <i className="fa-solid fa-heart"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Bottom Bulk Action Banner */}
            {favoriteProducts.length > 0 && (
              <div className="bg-linear-to-r from-brandNavy to-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-sm">
                <div>
                  <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
                    <i className="fa-solid fa-layer-group"></i>
                    <span>
                      {locale === 'TR' ? 'Toplu Teklif Talebi' : locale === 'AZ' ? 'Toplu Təklif Sorğusu' : 'Consolidated Request'}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-1">
                    {locale === 'TR'
                      ? `${favoriteProducts.length} adet favori ürününüz için tek seferde fiyat teklifi alın`
                      : locale === 'AZ'
                      ? `${favoriteProducts.length} ədəd favori məhsulunuz üçün vahid qiymət təklifi alın`
                      : `Request consolidated pricing for all ${favoriteProducts.length} selected commodities`}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300">
                    {locale === 'TR'
                      ? 'Her bir ürün için ayrı ayrı form doldurmak yerine tüm favorilerinizi tek bir RFQ dosyasında toplayıp ihracat departmanımıza iletebilirsiniz.'
                      : locale === 'AZ'
                      ? 'Hər məhsul üçün tək-tək form doldurmaq yerinə, bütün seçimlərinizi vahid RFQ sənədində birləşdirib ixrac masamıza göndərin.'
                      : 'Save time by consolidating all your selected export items into one verified multi-product RFQ submission.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onOpenMultiRFQ}
                  className="px-6 py-3.5 rounded-xl bg-brandGreen hover:bg-brandGreenDark text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md cursor-pointer shrink-0"
                >
                  <i className="fa-solid fa-paper-plane text-xs"></i>
                  <span>
                    {locale === 'TR' ? 'Hemen Toplu RFQ Gönder' : locale === 'AZ' ? 'İndi Toplu RFQ Göndər' : 'Submit Consolidated RFQ'}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
