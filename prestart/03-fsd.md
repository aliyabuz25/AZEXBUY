# AZEXBUY — FSD

Versiya: 0.1 | Tarix: 23.10.2026 | Status: layihə. M/D/T mənası [SRS](02-srs.md) sənədindədir. Aşağıdakı mənbədə verilməmiş davranışlar **texniki təklifdir**, OQ-10 ilə təsdiq tələb edir.

## FS-01 — Səhifələr və CTA (FR-01, FR-02, FR-12)

Ana səhifə iki auditoriyanı ayırır. Buy CTA alıcı formasına, Export CTA istehsalçı formasına aparır. Formaya keçid üçün ən çox iki naviqasiya kliki; ayrıca CTA ilə birbaşa keçid üstün tutulur. Request a Quote üçün alıcı sorğusu təklif olunur; iki auditoriya seçimi alternativi OQ-08-dədir.

Əlaqədə mənbə dəyərləri: `info@azexbuy.com`, `+994 10 509 19 59`, Bakı, Nərimanov rayonu, Qarabağ küçəsi 22, Alliance Business Center. Bunlar ilkin mənbə dəyərləridir, təsdiqlənmiş xəritə koordinatı deyil. Embed dəqiq təsdiqlənməyibsə uydurma marker yayımlanmasın; buraxılış OQ-06 ilə bloklanır.

## FS-02 — Alıcı forması (FR-03, FR-07)

**Məcburi, DEC-14:** şirkət adı, şirkət ölkəsi, əlaqəli şəxsin adı, email; məhsul adı, spesifikasiya, miqdar və vahid; təyinat ölkəsi/şəhəri.

**Könüllü:** website, vəzifə, telefon/WhatsApp, qablaşdırma tələbi, tələb edilən sertifikatlar, arzu edilən çatdırılma tarixi, Incoterm, əlavə qeydlər.

Məhsul səhifəsindən girişdə məhsul və kateqoriya avtomatik doldurulur, mənbə məhsul ID-si saxlanır. Əlavə detallar alıcıdan alınır. Ümumi sorğuda sərbəst məhsul adı mümkündür; kateqoriya seçim sahəsi matching üçün **təklifdir**. Kateqoriyası bilinməyən sərbəst sorğunu saxta uyğunluqla tamamlamamaq; əməkdaş təsnif edə bilsin.

Validasiya təklifi: boşluqları təmizlə, email/URL formatını yoxla, miqdarı müsbət rəqəm və vahidlə tələb et; mətn uzunluqları və tarix sərhədləri OQ-10. Məhsul ID-si serverdə mövcud/yayımlanmış məhsula qarşı yoxlanılsın; istifadəçi parametrini etibarlı saymaq olmaz. Xəta sahə yanında, altı dildə göstərilsin, daxil edilmiş dəyərlər qorunsun.

## FS-03 — İstehsalçı forması (FR-04)

### Şirkət

Məcburi: şirkət adı, VÖEN/qeydiyyat nömrəsi, əlaqəli şəxs, email və telefon. Könüllü: website, mövcud ixrac bazarları, hədəf bazarlar, dəstək xidmətləri. Azərbaycan istehsalçısı auditoriyası səbəbindən VÖEN formatı/alternativ xarici qeydiyyat davranışı OQ-10-da qalır.

Xidmət seçimləri: Buyer Search, Market Research, Export Support, Documentation, Certification, Customs, Logistics, Full Export Management. Çoxseçimli təqdimat texniki təklifdir.

### Təkrarlanan məhsul bloku

Ən azı bir məhsul; “Məhsul əlavə et” ilə çoxsaylı blok. Hər blok üçün məcburi: ad, kateqoriya, təsvir, spesifikasiya, MOQ/vahid, istehsal gücü/vahid və aylıq/illik dövr.

Könüllü: HS kodu, qiymət aralığı və valyuta/Incoterm, istehsal müddəti (lead time), ödəniş şərtləri, sertifikat adları, tələb olunan icazələr, fayllar. **İstehsal gücünün dövrü məcburidir; lead time ayrıca könüllü sahədir.** Minimum/maximum qiymət göstərilərsə düzgün sıra yoxlanması texniki təklifdir.

Ekranda blok silmə/addımlı bölmələr istifadə oluna bilər; mərhələli UI, maksimum məhsul sayı və saxlanmış yarımçıq forma dəstəyi təsdiqlənməyib. İctimai kabinet, qaralama müraciəti saxlamaq və sonradan redaktə linki əhatədə deyil.

## FS-04 — Fayllar (FR-05, NFR-02)

Konfiqurasiya qrupları:
- məhsul şəkilləri: JPG/PNG/WebP;
- müraciət üzrə kataloq: PDF;
- məhsul üzrə sertifikatlar: PDF, daxili giriş.

İlkin müzakirədə şəkil üçün 5 ədəd/5 MB, kataloq üçün 1 ədəd/20 MB təklif olunub; istifadəçi sertifikat PDF-i də istəyib, amma həmin cavab bütün limitləri ayrıca təsdiqləmir. Sertifikat üçün 5 ədəd/10 MB də təsdiqlənməyib. **Heç biri qəti limit deyil**: OQ-01 və CFG-02 ilə admin təsdiqi tələb olunur.

Fayllar başlanğıcda daxili storage-dadır. Şəkil də yalnız adminin ictimai məhsul üçün ayrıca təsdiqindən sonra public variant ola bilər. Sertifikat PDF-inin özü və şirkət kataloqu avtomatik yayımlanmasın. Public sertifikat adı fakt yoxlamasından sonra daxil edilir.

Fayl tipi/say/ölçü xətası sahədə göstərilsin. Client yoxlaması ilə kifayətlənməsin. Validasiya/təmizləmə tamamlanmamış faylı endirməyə/yayımlamağa icazə verilməsin. Hücuma qarşı sərt üst hədlər proqram/infra səviyyəsindədir; panel onları artıra bilməz. Dəqiq hədlər OQ-01/OQ-10.

## FS-05 — Göndərmə və bildiriş (FR-11, NFR-03)

Təklif edilən ardıcıllıq:
1. Server validasiyası, fayl yoxlaması və təhlükəsiz qəbul.
2. Lead, şirkət/məhsullar və fayl əlaqələrinin saxlanması; istehsalçı üçün hər məhsula bir bağlı qaralama.
3. Saxlanma tamamlandıqdan sonra qəbul mesajı: “Müraciətiniz qəbul edildi. Komandamız sizinlə əlaqə saxlayacaq.” Dillərə uyğun mətn.
4. Komandaya bildiriş işi. Email mümkün qədər admin detalına keçid və lead ID-si versin, faylları/daxili qiyməti əlavə kimi yaymasın.

DB xətasında uğur göstərilməsin. Email xətasında saxlanmış müraciət qəbul edilmiş qalır; adminə çatdırılma xətası və yenidən göndərmə imkanı təklif olunur. İstifadəçi email təsdiqi anketin şirkətə bildiriş tələbi ilə eyni deyil; ayrıca avtomatik cavab emaili təsdiqlənmiş əhatə deyil.

Dublikat klik/göndərmə üçün idempotency təklif olunur: eyni qəbul açarı yeni lead və məhsul qaralamaları yaratmasın. İkinci, həqiqətən yeni müraciət isə avtomatik itirilməsin. Saxlanmamış müvəqqəti faylların təmizlənməsi texniki təklifdir.

## FS-06 — Kataloq və axtarış (FR-06, FR-08, FR-09)

Yalnız yayımlanmış məhsul və dil variantları ictimai görünür. Məhsul adı, təsvir, spesifikasiya, mənşə, MOQ, qablaşdırma, güc/lead time və sertifikat adları yalnız yoxlanmış dəyərlərlə göstərilir. Olmayan məlumat üçün uydurma ISO/HS/MOQ əlavə edilmir. Qiymət və təchizatçı kontaktları heç bir public cavab, metadata və ya axtarış indeksinə daxil edilmir.

Axtarış aktiv dildə məhsul adı və kateqoriya adı üzrədir; nəticəsiz vəziyyət ümumi sorğu CTA-sı verir. Kateqoriya filtrinin axtarışla birgə istifadəsi, səhifələnmə və sıralama OQ-10 texniki detallarına aiddir. Qaralamalar, SupplierProduct qeydləri və daxili məlumatlar axtarılmır.

## FS-07 — Lead idarəetməsi (FR-13, FR-14)

Buyer/Supplier ayrı görünüş, status/məsul şəxs üzrə filtr və qəbul vaxtı sıralaması təklif olunur. Detalda orijinal müraciət, bütün məhsullar, daxili fayllar, qeydlər və məsul görünür. Lead statusları: New, In Progress, Contacted, Closed. Bunlar satış uğuruna və ya təchizatçı verifikasiyasına bərabər deyil.

Yeni lead ilkin New vəziyyətindədir. Status dəyişmə, yenidən açma, Closed səbəbi və keçid məhdudiyyətləri OQ-10; sərt ardıcıllıq mənbədə müəyyən edilməyib. Qeydlər daxili qalır. Aktiv əməkdaşa təyinat, deaktiv istifadəçidə təyinat davranışı və məlumat redaktəsinin jurnalı texniki təklifdir.

## FS-08 — Sadə uyğunlaşdırma (FR-15)

Namizədlər bütün istehsalçı müraciətlərinin məhsullarından tapılır; public məhsulun yayımlanması şərt deyil. Deterministik kateqoriya/məhsul təsnifatı tətbiq olunur, AI/sərbəst mətn semantikası və uyğunluq balı yoxdur.

Təklif edilən qayda: dəqiq kataloq məhsuluna bağlı müraciətdə həmin məhsul təsnifatına, digər halda adminin təsdiqlədiyi kateqoriyaya uyğun SupplierProduct-lar namizəd olur. Məhsul adının eyni yazılması təkbaşına eynilik sübutu deyil. Public məhsul–SupplierProduct əlaqəsinin dəqiq təsnifatı OQ-10 ilə təsdiqlənməlidir.

Hər namizəddə şirkət, uyğun məhsul/kateqoriya, müraciət mənbəyi və yoxlanma etiketi göstərilir. İlkin vəziyyət “Yoxlanmayıb”; verifikasiya statusunu yalnız administrator sübut/qeydlə dəyişsin (texniki təklif). Bütün müraciətlər namizəd ola bilər; yoxlanılmamış qeydlər gizlədilməsin və yoxlanmış kimi təqdim edilməsin.

Komanda MOQ, güc, sertifikat, bazar və kommersiya şərtlərini özü yoxlayır. Namizədin seçilməsi avtomatik buyer emaili, kontakt paylaşılması və ya müqavilə yaratmır. Nəticəsiz/təsnifatsız vəziyyət açıq göstərilir. Şirkət üzrə qruplaşdırma təklifdir, avtomatik şirkət birləşdirməsi deyil.

## FS-09 — CMS və nəşr (FR-16, FR-17)

Kateqoriya, məhsul, məqalə üçün əlavə/redaktə və dil variantları. Təklif edilən vəziyyətlər Draft/Review/Published/Archived; son sözlük OQ-10. Əməkdaş qaralamanı hazırlayır, administrator təsdiqləyib yayımlayır. Təsdiq olmadan ictimai səhifə və indeks yaranmır.

Hər istehsalçı məhsulu ayrıca qaralama yaradır, mənbə ID-si saxlanır. Kopiyalanan sahələr icazəli siyahı ilədir: ad, təsvir, spesifikasiya, MOQ, qablaşdırma və təsdiq gözləyən şəkil/sertifikat adları. Şirkət kontaktı, daxili qiymət, payment terms, daxili fayllar və qeydlər public obyektə avtomatik daxil edilmir. Məlumat dəyişikliyi yayımlanmış məhsulu səssiz yeniləmir; yenidən təsdiq təklifi tətbiq olunur.

Bir neçə eyni məhsuldan yaranan qaralamaların birləşdirilməsi administratorun redaksiya qərarıdır, avtomatik dedup əhatədə deyil. Statik korporativ səhifələrin tam CMS/page-builder-i təsdiqlənməyib (OQ-08).

## FS-10 — Dillər və SEO (FR-10, NFR-05, NFR-06)

İlkin giriş en; istifadəçi altı dildən seçir. Dilin yadda saxlanması, URL modeli və çatışmayan tərcümə fallback-i OQ-09. Ərəb səhifəsi RTL, email/telefon kimi dəyərlər düzgün istiqamətdə göstərilir. Orijinal lead mətnləri olduğu kimi saxlanır.

Yayımlanmış səhifələrə metadata, canonical, uyğun dil cütləri üçün hreflang və sitemap daxil edilir; mövcud olmayan tərcümə üçün saxta URL olmaz. Admin, fayl endirmə və qaralamalar ictimai indekslənməsin; robots təkbaşına məxfilik mexanizmi deyil.

## FS-11 — Rollar və giriş (FR-18, FR-21, FR-22)

- Administrator: bütün lead/məzmun əməliyyatları, yayımlama təsdiqi, istifadəçi/rol, parametrlər və qərarların təsdiqi.
- Əməkdaş: lead-lər, fayllar, qeydlər/təyinat, namizədlər; kateqoriya/məhsul/məqalə qaralaması əlavə/redaktə. İstifadəçi/rol və yayımlama təsdiqi yoxdur.
- Təklif: əməkdaş parametrləri və qərarları oxusun, qərara qeyd əlavə etsin; parametr və qərar təsdiqini administrator etsin. Bu alt-səlahiyyət OQ-10-da təsdiq gözləyir.

Fərdi daxili hesablar, server tərəfində hüquq yoxlaması və jurnal. Silmə, hesab bərpası, session müddəti və MFA OQ-10 texniki qərarlarıdır; ictimai qeydiyyat yoxdur.

## FS-12 — Admin parametrləri (FR-19)

Hər parametrdə açar, təsvir, tip, cari dəyər, mənbə/təsdiq vəziyyəti, validasiya, dəyişdirən/vaxt göstərilsin. Blank və qərar gözləyən dəyər işlək təsdiqlənmiş parametr kimi görünməsin.

- **CFG-01:** bildiriş email ünvan(lar)ı; sintaksis və test göndərişi; OQ-03 təsdiqi. SMTP/API secret-i açıq panel dəyəri deyil.
- **CFG-02:** fayl növləri, məhsul üzrə şəkil/sertifikat sayı və ölçüsü, müraciət üzrə kataloq limiti; yalnız deployment-in təhlükəsiz icazə verdiyi sərhədlərdə. OQ-01.
- **CFG-03:** şirkət email/telefon/ünvan/sosial URL və xəritə embed identifikatoru. İstənilən HTML/JS qəbul edilməsin; təhlükəsiz allowlist. OQ-06/OQ-07.
- **CFG-04:** təsdiq mesajları və sayt üçün təsdiqlənmiş dil mətnləri; vaxt/təklif zəmanəti özbaşına əlavə edilməsin. Dil dəstəyini söndürmək əhatə dəyişməsidir, adi konfiq deyil.
- **CFG-05:** məxfilik/saxlama siyasətinin təsdiqlənmiş müddət və sənəd versiyası; yalnız OQ-02 qərarından sonra aktivləşsin. Konfiqurasiya avtomatik silmə mühərriki tələb etmir; icra üsulu ayrıca texniki qərardır.

Parametr dəyişməsi nəzarətli, validasiyalı və jurnallı olsun. Əvvəlki təhlükəsiz dəyərə qaytarma təklif edilir. Hosting provayderi, sertifikatın doğruluğu və müqavilə büdcəsi adi parametr deyil.

## FS-13 — Qərar gözləyən məsələlər (FR-20)

[OQ reyestri](07-open-questions-assumptions.md) ilkin panel qeydlərinin bazasıdır. Sahələr: ID, başlıq, kateqoriya, təsvir, variant/təklif, məsul tərəf/şəxs, status, prioritet, bağlı FR/CFG, bloklanan mərhələ, qərar və sübut, təsdiqləyən/vaxt. Dəqiq təqvim son tarixi verilməyibsə uydurulmasın.

Təklif edilən statuslar: Açıq → Məlumat gözləyir → Təsdiq gözləyir → Həll edilib; yenidən açma və aid deyil səbəblə qeyd olunur. Lead/CMS statusları ilə qarışdırılmır.

Administrator təsdiq səlahiyyəti olan tərəfin qərarını sübutla qeyd edir; paneldə status dəyişmək hüquqi razılıq yaratmır. Həll üçün qərar, təsdiqləyən və sübut tələb olunsun. Bloklayıcıların dashboard-da görünməsi, filtr və sayğac texniki təklifdir. Mənbə bilinməyən qərar “həll edilib” sayıla bilməz.

MVP üçün avtomatik deployment veto/integrasiya tələb edilmir: panel buraxılış hazırlıq yoxlaması verir, faktiki go/no-go məsul şəxsin qərarıdır. Bloklayıcını gizlətmək və ya silmək həll deyil.

## FS-14 — Əməliyyat və məlumat siyasəti [T] (NFR-07, NFR-08)

Performans üçün hədəf mühit, dataset, eyni vaxtlı istifadəçi sayı və ölçü hədləri OQ-10 qərarına qədər açıqdır. Şəkillər ölçüyə uyğun optimallaşdırılsın; lead saxlanma/email çatdırılma xətaları monitorinqdə görünsün. Backup tezliyi, saxlanma müddəti, bərpa məsulu və bərpa sınağı OQ-04/10 ilə razılaşdırılmalıdır; uğurlu backup yazısı real bərpa sınağının əvəzi deyil.

Məlumatın saxlanması/silinməsi OQ-02 siyasətinə əsaslanmalıdır. CFG-05 təsdiqlənmiş siyasəti göstərir, özlüyündə silmə icrası deyil. Manual prosedur və ya avtomatlaşdırma seçimi OQ-02/10 qərarıdır; seçim olmadan məlumatın avtomatik silindiyi və ya retention uyğunluğunun təmin olunduğu iddia edilməsin. Təsdiqlənmiş prosedur lead, əlavə fayl, audit və backup nüsxələrinin əhatəsini, hüquqi saxlama istisnasını və əməliyyat sübutunu müəyyən etməlidir. İctimai buraxılışdan əvvəl seçilmiş üsul QA-08 ilə yoxlanmalıdır.
