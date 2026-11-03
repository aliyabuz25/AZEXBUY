# AZEXBUY — qərarlar, parametrlər və açıq məsələlər

Versiya: 0.1 | 23.10.2026 | Status: ilkin admin qərar reyestri. Buradakı qeyd tətbiqdə artıq yaradılmış hesab edilmir. Məsul tərəflər təklif olunan rol səviyyəsidir, adı təsdiqlənmiş təyinat deyil.

## Təsdiqlənmiş qərarlar — SRC-05

- **DEC-01:** sistem məhsul/kateqoriya əsasında təchizatçı namizədi təklif edir, son qərarı komanda verir.
- **DEC-02:** məhsul, kateqoriya, Insights admin CMS-dən əlavə/redaktə edilir.
- **DEC-03:** ilkin matching yalnız məhsul/kateqoriya; MOQ/sertifikat/bazar yoxlaması insandadır.
- **DEC-04:** sayt/formalar ilk buraxılışda altı dildə; tərcüməni komanda hazırlayır, müştəri təsdiqləyir.
- **DEC-05:** bütün istehsalçı müraciətləri namizəd bazasıdır, verifikasiya vəziyyəti açıq görünür.
- **DEC-06:** hər istehsalçı məhsulundan qaralama; yalnız administrator təsdiqindən sonra public nəşr.
- **DEC-07:** 3 000 AZN bütün razılaşdırılmış işlər üçün sabit layihə büdcəsi; təkrarlanan xərclər ayrıca.
- **DEC-08:** 31.10.2026 hədəf tarixdir; mümkünlük ayrıca qiymətləndirilir.
- **DEC-09:** bir müraciətdə çoxsaylı məhsul; producer prosesində screenshot-dakı 10 addım əsasdır.
- **DEC-10:** kataloqda ad/kateqoriya axtarışı; qəbul mesajında 24 saat/təchizatçı vədi yoxdur.
- **DEC-11:** baza texniki SEO; reytinq zəmanəti/davamlı SEO yoxdur.
- **DEC-12:** iki rol: administrator və əməkdaş; istifadəçi/səlahiyyət idarəsi administratora aiddir.
- **DEC-13:** bütün konfiqurasiya edilən məsələlər admin parametrlərindən, digər açıq qərarlar admin qərar reyestrindən izlənir.
- **DEC-14:** FS-02/FS-03-də göstərilən baza məcburi sahələr qəbul edilib. Şəkil/kataloqla yanaşı sertifikat PDF-i yükləməsi də istənilib; limitlər ayrıca təsdiqlənməyib.
- **DEC-15:** analizdən sonra sənədləşdirməyə keçid və bu paketə başlamaq təsdiqlənib. Bu qərar proqramın qurulmasına və bütün texniki təkliflərin qəbuluna bərabər deyil.

Sual alətinin köhnə identifikatorla qaytardığı matching/CMS cavabları sertifikat limiti və ya əvvəlki təsdiq qapısı üçün yeni razılıq sayılmayıb. Sonrakı açıq mətnli admin yanaşması və “davam edə bilərsən” göstərişi sənədləşdirmə icazəsini aydınlaşdırıb.

## Admin panel üçün ilkin açıq qərarlar

### OQ-01 — Fayl limitləri və sərt təhlükəsiz hədlər

Status: Təsdiq gözləyir. Məsul: müştəri əməliyyat məsulu + texniki məsul. Bağlı: FR-05, FR-19, CFG-02, NFR-02.

İlkin təklif: hər məhsula 5 JPG/PNG/WebP, hər biri 5 MB; müraciətə 1 PDF kataloq, 20 MB; hər məhsula 5 PDF sertifikat, hər biri 10 MB. Bu rəqəmlər təsdiq deyil. Çoxməhsullu müraciətin ümumi byte/fayl sayı və server sərt maksimumu ayrıca müəyyən edilsin.

Blok: upload implementasiyasının yekun konfiqi və canlı qəbulu. Təsdiq sübutu: limit cədvəli, texniki tutum yoxlaması və təsdiqləyən şəxs. Həll: CFG-02-ni təhlükəsiz hədlər daxilində doldurmaq və test etmək.

### OQ-02 — Hüquqi mətnlər və məlumatın saxlanması

Status: Məlumat gözləyir. Məsul: müştərinin səlahiyyətli/hüquqi tərəfi. Bağlı: NFR-08, FR-19/20, CFG-05.

Privacy/Terms, məlumat toplama hüquqi əsası, lazım olan razılıq mətni, şəxsi məlumat saxlanması/silinməsi, üçüncü tərəf xəritə/cookie davranışı təsdiqlənsin. Avtomatik silmə funksiyası ayrıca qərar olmadan əhatəyə daxil deyil.

Blok: real şəxsi məlumatla ictimai buraxılış və hüquqi səhifələrin təsdiqi. Sübut: versiyalı təsdiqlənmiş mətn və siyasət. Parametrə gün sayı yazmaq hüquqi təsdiq deyil.

### OQ-03 — Bildiriş hədəfi və email infrastrukturu

Status: Açıq. Məsul: müştəri əməliyyat/IT + texniki məsul. Bağlı: FR-11, CFG-01.

Anket info@/request@ alternativi verir, məzmun `info@azexbuy.com` göstərir. Bildiriş ünvanı, göndərən domen, provayder, çatdırılma girişi və test qəbul edən şəxs təsdiqlənsin. Public əlaqə emaili avtomatik notification konfiqi sayılmır.

Blok: email inteqrasiyasının qəbul testi/canlı buraxılışı. Sübut: test lead-in qəbul edilməsi, təhlükəsiz secret yerləşdirilməsi; secret reyestrə yazılmır.

### OQ-04 — Hosting, domen və təkrarlanan xərclər

Status: Açıq. Məsul: müştəri büdcə/IT + texniki məsul. Bağlı: NFR-01/07.

Hosting/storage/email/domen sahibi, xidmət səviyyəsi, aylıq xərclər və ödəniş məsulu seçilməyib. Stack/provayder bu paketdə seçilmir.

Blok: yerləşdirmə arxitekturası və buraxılış. Sübut: təsdiqlənmiş təklif, mülkiyyət və giriş planı. Adi admin parametri deyil; panel qərar qeydi saxlayır.

### OQ-05 — Hədəf tarixə çatdırılma və qəbul planı

Status: Açıq. Məsul: layihə rəhbəri + müştəri qərar verəni. Bağlı: DEC-07/08.

31.10.2026 hədəfi üçün iş bölgüsü, altı dil təhvil/təsdiq vaxtı, test və go/no-go planı hazırlanmalıdır. Sabit büdcə mümkünlüyün texniki sübutu deyil; əhatə dəyişiklikləri ayrıca təsdiqlənir.

Blok: zəmanətli təqvim öhdəliyi və buraxılış təsdiqi. Sübut: real iş planı və imzalı/təsdiqli qəbul məsulları.

### OQ-06 — Dəqiq xəritə və əlaqə təsdiqi

Status: Təsdiq gözləyir. Məsul: müştəri əməliyyat məsulu. Bağlı: FR-12, CFG-03.

Qarabağ küçəsi 22 / Alliance Business Center, email və telefon təsdiqlənsin; dəqiq Google Maps nöqtəsi/embed identifikatoru verilsin. Ünvan əsasında təxminən marker qoyulmasın.

Blok: əlaqə səhifəsi/xəritə qəbulu. Sübut: təsdiqlənmiş nöqtə və əlaqə məlumatı.

### OQ-07 — Brend, real kataloq və aktiv hüquqları

Status: Məlumat gözləyir. Məsul: müştəri məzmun məsulu; tərcümə layihə komandasında. Bağlı: FR-06/16/17, CFG-03.

Son logo/font/rəng, ilkin məhsul sayı/taxonomy, real məhsul məlumatı, şəkil hüquqları, sertifikat sübutu, sosial URL-lər və təqdimetmə məsulu müəyyən edilsin. Screenshot HS kodu və nümunə MOQ mənbə faktı deyil.

Blok: məzmunun yekun nəşri və buraxılış. Sübut: təsdiqlənmiş aktiv/məhsul siyahısı və hüquq qeydləri.

### OQ-08 — Redaksiya və səhifə bölgüsü

Status: Təsdiq gözləyir. Məsul: müştəri + UX/məzmun məsulu. Bağlı: FR-01/02, FS-01, IA-01.

Producer 10 addımın son adları, danışıqların yeri, Why Azerbaijan mətni, xidmətlərin ayrıca səhifə/blok seçimi, ixrac şöbəsi URL-si, Quote CTA hədəfi, üçüncü əlaqə formasına ehtiyac və statik səhifə CMS əhatəsi təsdiqlənsin. Bunlar altı dildə tərcümədən əvvəl dondurulmalıdır.

Blok: informasiya arxitekturası və son mətn təsdiqi; yeni səhifə/CMS istəyi əhatə təsiri qiymətləndirilsin.

### OQ-09 — Lokalizasiya və admin dili detalları

Status: Açıq. Məsul: texniki/UX məsul + müştəri məzmun təsdiqi. Bağlı: FR-10, NFR-05/06.

Dil URL-ləri, slug, yadda saxlanma, çatışmayan tərcümə fallback-i, admin UI dili və altı dil üzrə reviewer-lər təsdiqlənsin. Altı ictimai dil əhatəsi artıq qərardır; azaldılması sadə parametr deyil.

Blok: routing/lokalizasiya yekun implementasiyası və dil qəbul testləri. Sübut: dil xəritəsi və review qeydləri.

### OQ-10 — Texniki davranış və təhlükəsizlik bazası

Status: Təsdiq gözləyir. Məsul: texniki məsul + məhsul sahibi. Bağlı: bütün T işarəli FR/NFR/FSD davranışları.

Alt qeydlərə bölünməsi təklif olunur: giriş/bərpa/session/MFA; status keçidləri və verifikasiya sözlüyü; əməkdaşın parametr/qərar hüquqları; matching təsnifat əlaqələri; mətn uzunluqları/formatlar; upload yoxlaması; idempotency/email retry; CMS status/redaksiya; audit; spam/rate limit; performans hədəfi; backup/bərpa və monitorinq. Konkret həll seçimi təsdiq gözləyir, təhlükəsizlik ehtiyacı gizlədilmir.

Blok: aid olan modulların build-ready təsdiqi və təhlükəsizlik/əməliyyat qəbulu. Sübut: texniki qərar qeydləri və test planı. Paneldə “həll edilib” qoymaq təkbaşına uyğunluq sertifikatı deyil.

### OQ-11 — Səlahiyyətli qərar və UAT məsulları

Status: Açıq. Məsul: müştəri sponsor + layihə rəhbəri. Bağlı: FR-20, bütün qəbul mərhələləri.

Əkbər Bağırov/Əli Vəlizadə əlaqəsi məlumdur; müqavilə, məzmun, hüquqi və yekun UAT təsdiqini kimin verəcəyi ayrıca yazılmalıdır. Açıq məsələlərə konkret şəxs təyin edilsin.

Blok: yekun imza və go/no-go. Sübut: təsdiq səlahiyyətləri siyahısı.

## İdarəetmə qaydası

Bu OQ-lər admin panelin “Qərar gözləyən məsələlər” bölməsində ilkin qeydlər kimi olmalıdır. Dəqiq tarix/şəxs bilinmirsə boş/“təyin edilməyib” saxlanır. Parametr dəyəri ilə qərar təsdiqi ayrıdır. Status/sübut qaydası FS-13-dədir. Texniki T təklifləri və açıq reyestr bu layihə sənədlərinin tamamlanmasını bloklamır, amma müvafiq implementasiya və canlı buraxılışın təsdiqini bloklaya bilər.
