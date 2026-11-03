# AZEXBUY — sayt xəritəsi və məzmun

Versiya: 0.1 | 23.10.2026 | Status: IA-01 — informasiya arxitekturası layihəsi. Mənbələr bölmələrin varlığını dəstəkləyir; aşağıdakı URL-lər təklifdir, təsdiqlənmiş routing müqaviləsi deyil. Dil prefiksi/slug siyasəti OQ-09.

## İctimai xəritə

1. **Ana səhifə** — `/`: Hero, iki CTA, Niyə AZEXBUY, alıcı/istehsalçı kartları, xidmət xülasəsi, proses, seçilmiş məhsullar, Why Azerbaijan; əlaqə/final CTA/footer. Screenshot-dakı sıx mətn mobil üçün eyni ölçüdə köçürülməsin.
2. **Alıcılar üçün** — `/for-buyers`: sourcing dəyəri, xidmət mərhələləri, 7 addım və alıcı sorğusuna keçid.
3. **İstehsalçılar üçün** — `/for-producers`: ixrac dəstəyi, 10 addımlı proses və istehsalçı müraciəti.
4. **Xidmətlər** — `/services`: Market Access, Buyer & Sales, Export Management, Logistics. Hər biri üçün ayrıca səhifə sayı təsdiqlənməyib; ilk variant eyni səhifədə bölmələrdir.
5. **Kənar ixrac şöbəsi** — `/outsourced-export-department`: tam/qismən dəstək, istehsalçı CTA-sı; Services altında keçid. Ayrı URL əvəzinə bölmə qərarı OQ-08.
6. **Məhsullar** — `/products`; kateqoriya `/products/category/{slug}`; detal `/products/{slug}`. Kateqoriya, axtarış, nəticəsiz vəziyyət və ümumi sorğu keçidi.
7. **Necə işləyir** — `/how-it-works`: buyer 7, producer 10 addım. Hər addım əməliyyat xidməti təsviridir, portal statusu deyil.
8. **Haqqımızda** — `/about`: mənbədəki yanaşma və missiya; sübutsuz rəqəm, müştəri loqosu və sertifikat əlavə olunmasın.
9. **Insights** — `/insights`; məqalə `/insights/{slug}`; dörd kateqoriya. Məqalə ayrı detal səhifəsi CMS/SEO üçün təklifdir.
10. **Əlaqə** — `/contact`: ünvan, email, telefon, xəritə və auditoriya CTA-ları. Üçüncü ayrıca ümumi əlaqə formasının sahələri mənbədə verilməyib; ilkin həll iki mövcud formaya yönləndirmədir, OQ-08 təsdiqi gözləyir.
11. **Alıcı müraciəti** — `/request/buyer`: ümumi və məhsul kontekstli eyni forma.
12. **İstehsalçı müraciəti** — `/request/supplier`: şirkət və çoxsaylı məhsullar.
13. **Privacy Policy / Terms of Service** — `/privacy`, `/terms`: müştərinin təsdiq etdiyi hüquqi mətnlər; başlıqdan hüquqi sənəd uydurulmasın.

## Naviqasiya

Header screenshot üzrə: Home, For Buyers, For Producers, Services, Products, How It Works, About Us, Insights, Contact; kataloq axtarışı və Request a Quote. Mobil menyu və əsas CTA görünürlüğü layihələndiriləcək. Footer sürətli keçidlər, şirkət təsviri, təsdiqlənmiş əlaqə, sosial URL-lər və hüquqi keçidlər. Boş sosial keçidlər yayımlanmasın.

## Kataloq məzmun modeli

Mətn mənbəsində ilkin kateqoriya nümunələri: Food Products, Construction Materials, Packaging, Industrial Products, Agriculture; Chemicals şərtlidir. Bunlar yekun taxonomy deyil (OQ-07). Food daxilində Honey, Dried Fruits, Juices, Nuts, Oils nümunələrdir.

Screenshot seçilmiş məhsullarında fındıq, nar, xalça, mərmər, günəbaxan yağı və metal məhsulları görünür. Bunlar avtomatik real kataloq və təsdiqlənmiş HS kodu deyil. Kataloq kateqoriyaları ilə screenshot etiketləri eyniləşdirilmədən əvvəl taxonomy razılaşdırılsın.

Hər məhsula: təsdiqlənmiş ad, şəkillər, qısa/ətraflı təsvir, spesifikasiya, mənşə, MOQ/vahid, qablaşdırma, faktiki sertifikat adları; varsa HS, güc və lead time. Məhsul CTA-sı sorğuya aparır. Daxili qiymət/şirkət kontaktı/supplier faylı public deyil.

## Proses mətnləri

Buyer mənbə ardıcıllığı: tələbi bildir → istehsalçı tapılır → yoxlanır → təkliflər → seçim → sifariş/istehsal koordinasiyası → ixrac/çatdırılma.

Producer üçün istifadəçi screenshot-dakı 10 addımı seçib. Vizualdan oxunan redaksiya bazası: məhsul təqdimatı, ixrac hazırlığı, bazar seçimi, buyer axtarışı, B2B əlaqə, sənədləşmə, sertifikatlaşdırma, gömrük, logistika, çatdırılma. Bu adlar yekun tərcümə deyil; nömrələrin xırda yazısındakı qeyri-aydınlıq kopyalanmasın. Danışıqların bu quruluşa daxil edilmə yeri və son mətn OQ-08 ilə təsdiqlənsin.

## Insights başlanğıc materialı

Kateqoriyalar: Export Guides, Market Insights, Trade Knowledge, Industry Updates.

Mənbədəki beş yazı: Azərbaycandan ixrac necə edilir; Xarici alıcıları necə tapmaq olar; Incoterms nədir; Azərbaycanın ən çox ixrac etdiyi məhsullar; Beynəlxalq bazara giriş strategiyası. Mətnlər redaksiya və fakt yoxlamasından keçməlidir. Incoterms məsuliyyət xülasələri hüquqi/müqavilə tövsiyəsi kimi genişləndirilməsin; statistik iddialar mənbəsiz fakt sayılmasın.

## Daxili panel xəritəsi — URL-lər təklifdir

- `/admin`: lead və bloklayıcı qərar xülasəsi.
- `/admin/leads/buyers`, `/admin/leads/suppliers`, `/admin/leads/{id}`: siyahı, detallar, qeydlər, təyinat, məhsullar, fayllar, namizədlər.
- `/admin/content/products`, `/admin/content/categories`, `/admin/content/insights`: CMS və dil variantları; qaralama/təsdiq.
- `/admin/settings`: CFG-01–CFG-05.
- `/admin/decisions`: OQ-01–OQ-11, məsul/status/sübut/bloklayıcılar.
- `/admin/users`: administrator üçün hesab/səlahiyyət.

## Altı dil və təhvil məsuliyyətləri

en/az/tr/ar/ru/es üçün eyni funksiya əhatəsi; ar RTL. Layihə komandası UI, forma, validasiya, təsdiq mesajı və sayt məzmununu tərcümə edir; müştəri təsdiqləyir. Admin UI-nin altı dil olması ayrıca tələb deyil (OQ-09). Real məhsul faktı, şəkil hüququ, sertifikat sübutu və hüquqi mətnin etibarlılığı müştərinin təsdiqindən asılıdır.

Logo, rənglərin dəqiq kodları, font lisenziyası və şəkil hüquqları OQ-07-dir. Screenshot-dan loqo/şəkil kəsib yekun lisenziyalı aktiv saymaq olmaz.
