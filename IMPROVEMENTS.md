# AZEXBUY — Təkmilləşdirmələr və Əsaslandırma Hesabatı

**Tarix:** 25 Oktyabr 2026  
**Layihə:** AZEXBUY — Azərbaycan İxrac və Tədarük Portalı  
**Versiya:** 0.1.0  

---

## 1. Paket və Qurulum Səhvlərinin Aradan Qaldırılması (Dependencies & Build)

### Niyə edildi?
- `package.json` faylında yer alan `esbuild: "^0.25.0"` asılılığı müasir `vite: "^8.3.0"` ilə peer-dependency münaqişəsi (ERESOLVE) yaradırdı və layihədə `npm install` əmri xəta ilə dayanırdı.
- Layihənin adı defolt `react-example` olaraq qalmışdı.
- `vite.config.ts`-də köhnəlmiş `__dirname` istifadəsi Vite v8 konsolunda xəbərdarlıq yaradırdı.

### Nə edildi?
- `esbuild` münaqişəsi aradan qaldırıldı, asılılıqlar təmiz şəkildə quraşdırıldı (`npm install`).
- Layihə adı `azexbuy`, versiyası `0.1.0` olaraq yeniləndi.
- `vite.config.ts` müasir ESM standartına (`fileURLToPath(import.meta.url)`) uyğunlaşdırıldı və Vite vasitəsilə `process.env.GEMINI_API_KEY` dəyişənlərinin təhlükəsiz ötürülməsi təmin edildi.
- `tsc --noEmit` və `npm run build` testləri 100% uğurla nəticələndi.

---

## 2. 6 Dilli Beynəlxalq Dəstək və Ərəb Dili üçün RTL (Multilingual & RTL)

### Niyə edildi?
- Müştəri anketində və texniki spesifikasiyada (`prestart/01-project-brief.md`, `SRC-01/Q06`) layihənin ilk buraxılışda **6 dildə** fəaliyyət göstərməsi (`EN`, `AZ`, `TR`, `RU`, `AR`, `ES`) və ərəb dili üçün **sağdan sola (RTL)** interfeys tələb olunurdu. Əvvəlki kod yalnız 3 dili (`EN`, `AZ`, `RU`) dəstəkləyirdi.
- Azərbaycanın əsas ixrac tərəfdaşları olan Türkiyə (`TR`), Körfəz və Yaxın Şərq ölkələri (`AR`), habelə İspan/Latın bazarları (`ES`) üçün dil bazası zəruri idi.

### Nə edildi?
- `src/types.ts` daxilində `Locale` tipi `'EN' | 'AZ' | 'TR' | 'RU' | 'AR' | 'ES'` olaraq müəyyən edildi.
- `src/data/translations.ts`-də Türkcə (`TR`), Ərəbcə (`AR`) və İspanca (`ES`) tam korporativ tərcümələr əlavə edildi.
- `getLocalizedText` təhlükəsiz tərcümə funksiyası yazıldı (istənilən dildə mətn çatışmadıqda avtomatik `EN` və ya `AZ` mətninə keçir, proqramın çökməsinin qarşısını alır).
- `src/App.tsx`-də ərəb dili (`AR`) seçildikdə `document.documentElement.dir = 'rtl'` və `lang = 'ar'` avtomatik tətbiq olunur.
- Naviqasiya panelində və mobil menyuda 6 dilli rahat seçim bloku yerləşdirildi.

---

## 3. Google Gemini Süni İntellekt İxrac və Sourcing Masası (AI Trade Desk)

### Niyə edildi?
- Təqdim olunan Google AI Studio açarı və `@google/genai` paketi kod daxilində əlaqələndirilməmişdi.
- Beynəlxalq alıcılar üçün Azərbaycanın ixrac məhsulları üzrə HS (GTİP) kodlarını, Orta Dəhliz (TİTR) tranzit müddətlərini, Incoterms 2020 şərtlərini və AQTA fitosanitar tələblərini dərhal izah edən rəqəmsal məsləhətçiyə ehtiyac var idi.

### Nə edildi?
- `src/services/aiService.ts` xidməti quruldu:
  - Google Gemini 2.5 Flash modeli inteqrasiya edildi.
  - API açarı olmadığı və ya formatı fərqli olduqda belə fasiləsiz işləyən daxili "Sovereign Trade Knowledge Base" ehtiyat bazası hazırlandı.
  - Zaqatala fındığı (HS 080222), Göyçay narı və şirəsi (HS 081090 / 200989), Daşkəsən mərməri (HS 2515), xalçalar (HS 5701), polad borular (HS 7306), Orta Dəhliz (Bakı Ələt Limanı, BTQ dəmir yolu) və AQTA/EUR.1 sertifikatları üzrə avtoritet cavablar təmin edildi.
- `src/components/AIDeskModal.tsx` interaktiv dialoq pəncərəsi yaradıldı:
  - Sürətli sual təklifləri (Quick Prompts).
  - Canlı sual-cavab sistemi.
  - İstifadəçinin öz AI Studio API açarını (`AIzaSy...`) daxil edə və saxlaya biləcəyi Settings paneli.
- Ekranın sağ alt hissəsində daimi "AI Trade Desk" düyməsi və Navbar-da birbaşa keçid yerləşdirildi.

---

## 4. Daxili Əməliyyat Masası və Ağıllı Uyğunlaşdırma (CRM & Matching Desk)

### Niyə edildi?
- Layihənin biznes modelinə görə (`prestart/01-project-brief.md`, `SRC-01/Q04`), daxili komanda alıcı və istehsalçı müraciətlərini statuslarla idarə etməli, məsul şəxs təyin etməli, qeydlər aparmalı və alıcı tələbləri ilə yerli istehsalçıları uyğunlaşdırmalıdır.

### Nə edildi?
- `DossiersView` komponenti tam institusional əməliyyat masasına çevrildi:
  - **İş axını statusları:** `New`, `In Progress`, `Contacted`, `Closed`, `Verified & Routing`.
  - **Məsul operator təyinatı:** `Baku Sourcing Desk`, `Middle Corridor Logistics`, `AQTA Compliance Desk`, `Agro-Export Specialist`.
  - **Daxili qeydlər (Desk Notes):** Hər bir lead üzrə komanda qeydlərinin saxlanması.
  - **Ağıllı Tələb-Təklif Uyğunlaşdırması (Smart Matching Desk):** Beynəlxalq alıcının sorğusundakı HS kodu və ya məhsul növü ilə sistemdəki yerli istehsalçıları avtomatik qarşılaşdırır, ixrac hazırlıq balını (Readiness Score) və əlaqə məlumatlarını daxili komandaya təqdim edir.

---

## 5. Vizual Təsdiq və İstifadəçi Rahatlığı (Toast Notification & UX)

### Niyə edildi?
- İstifadəçi formanı doldurub göndərdikdə və ya məhsulu siyahıya əlavə etdikdə prosesin uğurla icra edildiyinə dair vizual təsdiq çatmırdı.

### Nə edildi?
- `src/App.tsx`-də avtomatik yox olan, zərif "Toast Notification" bildiriş sistemi tətbiq edildi:
  - RFQ göndərildikdə,
  - İstehsalçı qeydiyyatdan keçdikdə,
  - Məhsul siyahıya əlavə edildikdə/silindikdə,
  - Lead statusu və ya qeydi yeniləndikdə dərhal istifadəçiyə məlumat verir.

---

## 6. Nəticə və Yoxlama

- **TypeScript Yoxlaması (`npm run lint`):** 0 xəta.
- **Vite İstehsalat Qurulumu (`npm run build`):** Uğurla tamamlandı.
- **Lokal Saxlanma (localStorage):** Bütün RFQ-lər, istehsalçı qeydiyyatları, seçilmiş dillər və qeydlər brauzer yaddaşında təhlükəsiz qorunur.
