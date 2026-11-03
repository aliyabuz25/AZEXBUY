# AZEXBUY — qəbul meyarları və UAT

Versiya: 0.1 | 23.10.2026 | Status: test spesifikasiyası; testlərin artıq keçirildiyi iddia edilmir. Hər AC eyni nömrəli FR ilə bağlıdır. T işarəli davranışların meyarları OQ-10 təsdiqindən sonra icra bazasına çevrilir.

## Funksional qəbul

- **AC-01 / FR-01 / FS-01:** Given təsdiqlənmiş IA-01 və məzmun, When istifadəçi naviqasiya edir, Then bütün razılaşdırılmış bölmələrə çatır; mətn mənbəsindəki ixrac şöbəsi və legal keçidlər itmir. OQ-08 həll edilməyibsə bu test yekun keçmiş sayıla bilməz.
- **AC-02 / FR-02 / FS-01:** Given desktop və mobil ana səhifə, When Buy və Export CTA-ları ayrıca yoxlanır, Then uyğun formaya maksimum iki naviqasiya kliki tələb olunur; yanlış auditoriya forması açılmır.
- **AC-03 / FR-03 / FS-02:** Given məcburi sahələri boş və sonra düzgün doldurulmuş buyer forması, When submit edilir, Then birinci halda sahə xətaları və saxlanmış dəyərlər, ikinci halda bütün təqdim edilən məlumatlarla bir Buyer lead yaranır. Miqdar/vahid, email və təyinat səhvləri ayrıca yoxlanır.
- **AC-04 / FR-04 / FS-03:** Given eyni müraciətdə iki müxtəlif məhsul, When supplier forması göndərilir, Then bir Supplier lead, iki ayrı məhsul və sahələrarası düzgün əlaqələr yaranır; bir məhsulun məlumatı digərinə qarışmır. Sıfır məhsul və çatışmayan güc dövrü rədd edilir (T).
- **AC-05 / FR-05 / FS-04:** Given adminin təsdiqlədiyi CFG-02, When icazəli, saxta uzantılı, çoxsaylı və limiti aşan fayllar yüklənir, Then yalnız təhlükəsiz qaydaya uyğun fayllar qəbul olunur; sərhəd ölçüsü və sərhədi aşan ölçü ayrıca test edilir. Limit qərarı olmadan nəticə Pass deyil, Blocked-dir. Daxili sertifikat URL-i autentifikasiyasız açılmır.
- **AC-06 / FR-06 / FS-06:** Given public məhsul və qaralama, When kateqoriya/detail açılır, Then yalnız yayımlanmış obyekt görünür; yalnız real təsdiqlənmiş məlumatlar göstərilir, boş sertifikata ISO uydurulmur.
- **AC-07 / FR-07 / FS-02:** Given konkret məhsul detalı, When Request düyməsi seçilir, Then məhsul/kateqoriya forma və saxlanmış lead kontekstində doğrudur. Saxta/silinmiş məhsul ID-si server yoxlamasından keçmir (T); naməlum məhsula ümumi sorğu mümkündür.
- **AC-08 / FR-08 / FS-06:** Given public məhsullar və daxili qaralamalar, When aktiv dildə ad/kateqoriya axtarılır, Then public uyğun nəticələr göstərilir, daxili obyektlər yox; nəticəsiz halda ümumi sorğu keçidi var.
- **AC-09 / FR-09 / FS-06/09:** Given daxili qiymət, kontakt, kataloq və sertifikat PDF-i olan SupplierProduct, When ictimai məhsul/HTML/API/metadata/axtarış cavabı yoxlanır, Then qiymət, birbaşa təchizatçı kontaktı və məxfi fayllar çıxmır; səbət, Buy now və checkout yoxdur.
- **AC-10 / FR-10 / FS-10:** Given yeni sessiya və altı dil seçimi, When sayt və hər iki forma hər dildə yoxlanır, Then ilkin en, tam tərcümə edilmiş mətn/validasiya/qəbul mesajı və ar üçün düzgün RTL var. Fallback və URL qaydaları OQ-09 təsdiqinə uyğun test edilir; avtomatik lead tərcüməsi gözlənilmir.
- **AC-11 / FR-11 / FS-05:** Given etibarlı müraciət, When saxlama uğurludur, Then qəbul mesajında 24 saat/təklif zəmanəti yoxdur və komanda bildirişi yaranır. Given DB xətası, Then saxta uğur yoxdur. Given email xətası, Then saxlanmış lead qalır və admin xətanı görür; retry siyasəti T-dir. Eyni qəbul açarı ilə təkrar sorğu bir lead/qaralama dəsti yaradır (T).
- **AC-12 / FR-12 / FS-01:** Given OQ-06 ilə təsdiqlənmiş əlaqə və xəritə, When mobil/desktop contact səhifəsi açılır, Then həmin nöqtə və əlaqə dəyərləri görünür; responsive iframe daşmır. Təxmin edilmiş koordinatla test keçmiş sayılmır.
- **AC-13 / FR-13 / FS-07:** Given Buyer və Supplier lead-lər, When admin siyahıları açır, Then tiplər ayrıdır və dörd razılaşdırılmış status görünür; status yoxlanma etiketi ilə qarışmır.
- **AC-14 / FR-14 / FS-07:** Given çoxməhsullu lead, When əməkdaş detalı açır, qeyd əlavə edib məsul təyin edir, Then bütün məhsul/fayllar düzgün əlaqədə görünür, qeyd və təyinat saxlanır və public çıxmır. Deaktiv məsul siyasəti OQ-10 ilə yoxlanır.
- **AC-15 / FR-15 / FS-08:** Given eyni kateqoriyalı yoxlanmış və yoxlanmamış supplier müraciətləri, When buyer üçün namizədlər açılır, Then hər ikisi mənbə və düzgün yoxlanma etiketi ilə görünür. Public nəşr edilməmiş SupplierProduct da kateqoriya uyğun olduqda namizəd olur. Başqa kateqoriyalı məhsul nəticəyə düşmür; dəqiq məhsul təsnifatı olan sorğu üçün təsdiqlənmiş əlaqə qaydası yoxlanır (T, OQ-10). Eyni kateqoriyada fərqli MOQ/sertifikat/bazar dəyərləri namizədi avtomatik kənarlaşdırmır və uyğunluğu təsdiqləmir; faiz balı verilmir. Nəticəsiz və təsnifatsız hallar aydın göstərilir; avtomatik xarici email/kontakt paylaşımı yoxdur.
- **AC-16 / FR-16 / FS-09:** Given administrator/əməkdaş hesabı, When məhsul, kateqoriya və məqalə/dil variantı əlavə-redaktə olunur, Then məlumat saxlanır; public görünüş nəşr icazəsinə tabedir. Tam statik page-builder gözlənilmir.
- **AC-17 / FR-17 / FS-09:** Given iki məhsullu supplier müraciəti, When qəbul edilir, Then iki mənbəyə bağlı qaralama yaranır və public görünmür. When administrator məzmunu təsdiqləyib yayımlayır, Then icazəli məlumatlar public olur; daxili qiymət/kontakt/fayllar avtomatik köçmür. Əməkdaş nəşri birbaşa icra edə bilmir.
- **AC-18 / FR-18 / FS-11:** Given əməkdaş, When istifadəçi/rol idarəsinə və nəşr təsdiqinə UI və birbaşa sorğu ilə çıxmağa çalışır, Then server rədd edir. Given administrator, Then icazəli əməliyyatlar işləyir. Parametr/qərar üzrə alt-səlahiyyətlər T-dir.
- **AC-19 / FR-19 / FS-12:** Given admin parametrləri, When tipə zidd və sərt maksimumdan yüksək dəyər yazılır, Then dəyişiklik rədd olunur və əvvəlki dəyər qalır (T). Blank/təsdiqsiz parametr hazır kimi görünmür. Email test edilə bilir; secret açıq görünmür. Parametr dəyişməsi hüquqi qərarı avtomatik həll etmir.
- **AC-20 / FR-20 / FS-13:** Given OQ-01–OQ-11 ilkin qeydləri, When reyestr açılır, Then məsul/status/qərar/sübut/bloklanan mərhələ görünür. When sübutsuz həll statusuna keçid edilir, Then rədd edilir (T). Təsdiqlənmiş qərar aktor/vaxtla saxlanır, yenidən açma səbəbi itmir. Bu funksiya avtomatik deploy veto deyil.
- **AC-21 / FR-21 / FS-11 [T]:** Given girişsiz və icazəsi olmayan sessiya, When admin API/fayl/detail sorğulanır, Then məzmun verilmir. İctimai qeydiyyat yoxdur; giriş/bərpa/session testləri OQ-10 siyasətinə uyğun aparılır.
- **AC-22 / FR-22 / FS-11–13 [T]:** Given lead statusu, məsul şəxs təyinatı, təchizatçı verifikasiya etiketi, parametr, nəşr və qərar dəyişikliklərinin hər biri ayrıca, When saxlanır, Then hər hadisə tipi aktor və vaxtla jurnalda görünür; password/token və məxfi fayl məzmunu loga düşmür.
- **AC-23 / FS-14 [T]:** Given təsdiqlənmiş OQ-02/04/10 əməliyyat və retention proseduru, When backup bərpası, xəta bildirişi və seçilmiş saxlama/silmə proseduru test olunur, Then nəticə razılaşdırılmış meyarlara uyğun sübutla qeydə alınır. Siyasət/üsul hələ seçilməyibsə nəticə Blocked-dir; sadəcə CFG-05 dəyəri ilə Pass verilmir.

## Qeyri-funksional yoxlamalar

- **QA-01 / NFR-01:** HTTPS, server səlahiyyəti, public sahə allowlist-i; anonim və iki rol ilə mənfi testlər.
- **QA-02 / NFR-02:** MIME/format, traversal adları, təhlükəli fayl, ölçü/say sərhədləri, daxili URL və malware siyasəti; OQ-01/10 asılılığı.
- **QA-03 / NFR-03:** DB/email kəsilməsi, eyni sorğunun təkrarı, qismən uğursuz məhsul/qaralama, retry və orphan fayl vəziyyətləri.
- **QA-04 / NFR-04:** razılaşdırılan desktop/mobil ölçülər, klaviatura, label/focus, xəta oxunaqlılığı, kontrast; WCAG hədəfi T-dir, screen-reader sınağı olmadan tam əlçatanlıq iddiası yoxdur.
- **QA-05 / NFR-05:** public metadata/canonical/sitemap/hreflang, mövcud dil URL-ləri, admin/qaralama məxfiliyi; reytinq yox, texniki çıxış test edilir.
- **QA-06 / NFR-06:** altı dil üzrə reviewer qeydləri, RTL və qarışıq istiqamətli email/telefon, uzun mətnlə daşma.
- **QA-07 / NFR-07:** OQ-10-da razılaşdırılmış yük/performance ölçüləri, backup-dan bərpa və xəta monitorinqinin görünməsi; ölçüsüz “sürətlidir” nəticəsi yoxdur.
- **QA-08 / NFR-08:** təsdiqlənmiş hüquqi mətn/versiya, məlumat saxlama qərarı və real icra üsulunun uyğunluğu; təkcə gün sayı parametrinə əsasən Pass verilmir.

## UAT icra və buraxılış qaydası

Hər testdə: versiya/build, mühit, rol/dil, ilkin data, addımlar, gözlənən/faktiki nəticə, sübut, tester/vaxt və Pass/Fail/Blocked/Not run qeyd edilir. Bug prioriteti və qəbul imzası OQ-11 ilə razılaşdırılır.

Test dəsti: 6 dildə iki forma; çoxməhsullu supplier; naməlum məhsul buyer; yoxlanmış/yoxlanmamış namizəd; uyğun olmayan kateqoriya; public/draft məhsul; iki admin rol; icazəsiz fayl; DB/email xətası; parametr sərhədi; bloklayıcı OQ.

Go/no-go üçün kritik məlumat sızması və məlumat itkisi xətası bağlanmalı, buraxılışı bloklayan OQ-lər təsdiqlənməli, hüquqi və tərcümə məzmunu qəbul edilməli, email/hosting/backup yoxlanmalı və səlahiyyətli şəxsin qərarı qeyd olunmalıdır. Bu sənəd real UAT icrasının nəticəsi deyil.
