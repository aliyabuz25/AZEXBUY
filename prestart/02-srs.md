# AZEXBUY — SRS

Versiya: 0.1 | Tarix: 23.10.2026 | Status: layihə spesifikasiyası.

## 1. Oxuma qaydası

**M:** mənbədə açıq tələb. **D:** bu söhbətdə təsdiqlənmiş qərar. **T:** analitik/texniki təklif; müştəri tələbi kimi təqdim edilmir, OQ-10 ilə qəbul edilməlidir. Bir tələbin M/D olması onun artıq proqramda reallaşdırıldığı və ya UAT-dan keçdiyi demək deyil. Bütün tələblərin mənbə əlaqələri [izlənəbilənlikdə](08-source-traceability.md), davranışları [FSD-də](03-fsd.md), yoxlamaları [qəbul sənədində](06-acceptance-criteria.md) verilib.

## 2. Funksional tələblər

### İctimai sayt

- **FR-01 [M] — Sayt quruluşu:** alıcı/istehsalçı, xidmətlər, proses, kataloq, haqqımızda, Insights, əlaqə və hüquqi keçidlər təqdim edilsin; ixrac şöbəsi xidməti itirilməsin. Ayrı səhifə/blok bölgüsü IA-01 layihəsidir.
- **FR-02 [M] — İki əsas CTA:** alıcı və ixracatçı uyğun formaya maksimum iki naviqasiya kliki ilə çatsın. Formanın daxili addımları bu say deyil.
- **FR-03 [M] — Alıcı müraciəti:** Q03-dəki şirkət, məhsul, logistika və əlaqə məlumatları toplansın.
- **FR-04 [M,D] — İstehsalçı müraciəti:** şirkət və birdən çox məhsul, ixrac/ticarət məlumatı, xidmət ehtiyacı qəbul edilsin. Hər məhsul ayrıca saxlanılsın.
- **FR-05 [M,D] — Fayllar:** məhsul şəkilləri və PDF kataloq qəbul edilsin; sertifikat PDF-ləri də dəstəklənsin. Son say/ölçü limitləri OQ-01-dədir.
- **FR-06 [M] — Kataloq:** kateqoriya siyahısı, kateqoriyanın məhsulları və ayrıca məhsul detalları olsun; təsvir, şəkil, spesifikasiya, MOQ, qablaşdırma, uyğun sertifikat məlumatları göstərilsin.
- **FR-07 [M] — Məhsul sorğusu:** məhsul CTA-sı forma kontekstinə məhsul və kateqoriyanı əvvəlcədən əlavə etsin; naməlum məhsul üçün ümumi sorğu mümkün olsun.
- **FR-08 [D] — Axtarış:** ictimai yayımlanmış məhsullar adı/kateqoriyası üzrə axtarılsın. Qaralamalar nəticəyə düşməsin. Sinonim, fuzzy və dillərarası axtarış əhatəyə daxil deyil.
- **FR-09 [M] — Sorğu əsaslı model:** səbət, onlayn alış və ictimai qiymət göstərilməsin; təchizatçının birbaşa kontaktları ictimai məhsula çıxmasın.
- **FR-10 [M,D] — Lokalizasiya:** en ilkin olmaqla az/en/tr/ar/ru/es sayt və formaları olsun; ərəb görünüşü RTL olsun; komanda tərcümə hazırlasın, müştəri təsdiqləsin.
- **FR-11 [M,D] — Qəbul və bildiriş:** etibarlı müraciət bazada saxlanılsın, komanda emailinə bildiriş göndərilsin, istifadəçiyə qəbul mesajı göstərilsin. 24 saat və təklif zəmanəti verilməsin. Bildiriş hədəfi OQ-03.
- **FR-12 [M] — Əlaqə və xəritə:** mənbədəki əlaqə məlumatları və responsive Google Maps embed göstərilsin. Dəqiq marker OQ-06 ilə təsdiqlənsin.

### Daxili idarəetmə

- **FR-13 [M] — Lead siyahısı:** Buyer/Supplier ayrımı və New/In Progress/Contacted/Closed statusları ilə müraciətlər görünsün.
- **FR-14 [M] — Lead detalları:** formanın bütün məlumatları, hər məhsul, daxili fayllar, qeydlər və məsul şəxs idarə olunsun.
- **FR-15 [D] — Namizəd təklifi:** alıcı məhsulu/kateqoriyasına görə bütün istehsalçı müraciətlərindən namizədlər göstərilsin; yoxlanma vəziyyəti açıq görünsün. MOQ/sertifikat/bazar uyğunluğuna komanda qərar versin. Uyğunluq faizi və avtomatik deal olmasın.
- **FR-16 [D] — CMS:** məhsullar, kateqoriyalar və Insights məqalələri admin paneldən əlavə/redaktə edilsin; dil variantları idarə olunsun. Digər statik səhifələr üçün tam page-builder tələb edilmir.
- **FR-17 [D] — Məhsul qaralaması:** istehsalçının hər məhsulundan mənbəyə bağlı qaralama yaransın, yalnız admin təsdiqindən sonra yayımlansın. İctimai sahələr icazəli siyahı ilə ayrılmalıdır.
- **FR-18 [D] — İki rol:** administrator bütün məlumatlar və istifadəçi/səlahiyyət idarəetməsi ilə; əməkdaş lead/məzmun işi ilə məşğul olsun, istifadəçi/səlahiyyət idarə etməsin. Yayımlama təsdiqi administratora aiddir.
- **FR-19 [D] — Parametrlər:** konfiqurasiya edilən açıq məsələlər admin paneldən dəyişdirilsin; tiplər, təhlükəsiz sərhədlər, aktivlik və son dəyişiklik görünsün.
- **FR-20 [D] — Qərar reyestri:** qərar gözləyən biznes/hüquqi/texniki mövzular təsvir, məsul, status, qərar qeydi, təsdiq sübutu və bloklanan modul/buraxılışla göstərilsin. Parametr doldurmaq təsdiq əvəzi deyil.
- **FR-21 [T] — Daxili giriş:** ictimai qeydiyyatsız, fərdi hesablarla giriş; girişsiz müraciət, fayl və idarəetmə endpoint-lərinə çıxış qadağan olunsun. Hesab bərpası/session siyasəti OQ-10.
- **FR-22 [T] — Jurnal:** lead statusu/təyinatı, yayımlama, yoxlanma etiketi, parametr və qərar dəyişikliklərinin aktoru və vaxtı qeyd edilsin; məxfi dəyərlər loga yazılmasın.

## 3. Məlumat modeli — məntiqi təklif

DB/ORM seçimi deyil; FR-03–FR-20 üçün anlayış xəritəsidir.

- **Lead:** ID, Buyer/Supplier tipi, mənbə səhifə/məhsul, dil, şirkət/əlaqə, status, məsul, qəbul vaxtı.
- **BuyerRequirement:** məhsul adı, seçilmiş kateqoriya/məhsul ID-si varsa, mətn spesifikasiyası, miqdar/vahid, logistika tələbləri. Kateqoriya məlum deyilsə daxili təsnifat tələb olunur.
- **SupplierCompany:** müraciət şirkəti, qeydiyyat nömrəsi, kontaktlar, bazarlar; avtomatik eyniləşdirmə yoxdur.
- **SupplierProduct:** həmin müraciətə bağlı məhsulun təsvir, MOQ, güc, ticarət, sertifikat və xidmət məlumatları.
- **VerificationState:** təchizatçı üçün yoxlanma vəziyyəti; lead statusundan ayrıdır. İlkin dəyər “Yoxlanmayıb”; son status sözlüyü OQ-10.
- **ProductDraft/PublicProduct:** mənbə SupplierProduct əlaqəsi, publik sahələr, dil variantları, təsdiq və yayım statusu. Bir təchizatçı məhsulundan yaranma ümumi kataloqun avtomatik dublikat birləşməsi deyil.
- **Category/Article:** dil variantları, nəşr statusu və SEO məlumatı.
- **Attachment:** məhsul/müraciət əlaqəsi, tip, ölçü, saxlanma açarı, giriş səviyyəsi.
- **Note/Assignment/Notification:** daxili qeydlər, məsul təyinatı, bildiriş vəziyyəti.
- **User/Role, Setting, DecisionItem, AuditEvent:** idarəetmə və nəzarət.

Şirkət dublikatları və bir şirkətin çox müraciətinin birləşdirilməsi avtomatik nəzərdə tutulmur. Şirkət üzrə matching nəticələrinin qruplaşdırılması FSD-də təklifdir.

## 4. Qeyri-funksional tələblər

- **NFR-01 [T] — Məxfilik və səlahiyyət:** serverdə rol yoxlaması, HTTPS, təhlükəsiz giriş və məxfi saxlanma; gizlədilmiş UI təhlükəsizlik sayılmır. İctimai serializasiya icazəli sahələrlə olsun.
- **NFR-02 [T] — Fayl təhlükəsizliyi:** uzantı ilə yanaşı faktiki fayl tipi, say və ölçü yoxlansın; təhlükəsiz ad, icra olunmayan storage və autentifikasiyalı əldəetmə olsun. Malware yoxlamasının üsulu OQ-10. Administrator təhlükəsiz maksimumu aşa bilməsin.
- **NFR-03 [T] — Etibarlılıq:** saxlanma uğursuzdursa uğur mesajı verilməsin; email xətası saxlanmış lead-i silməsin. Yenidən cəhd və dublikat göndərmə idarəsi FSD təklifidir.
- **NFR-04 [M,T] — Responsive/əlçatanlıq:** mobil uyğunluq, form label-ları, klaviatura və görünən xəta mesajları. WCAG 2.2 AA hədəfi texniki təklifdir, sertifikasiya iddiası deyil.
- **NFR-05 [D] — Texniki SEO:** yayımlanmış səhifələr indekslənə bilsin; metadata, sitemap, canonical və dil variantları üçün hreflang olsun; admin/qaralamalar indekslənməsin. Sıralama zəmanəti yoxdur.
- **NFR-06 [T] — Tərcümə keyfiyyəti:** altı dildə UI və formalar; RTL-də istiqamət və qarışıq email/telefon dəyərləri yoxlansın. Lead-in orijinal mətnini avtomatik tərcümə etmək tələb deyil.
- **NFR-07 [T] — Performans və əməliyyat:** şəkil optimizasiyası, ölçülə bilən yüklənmə testi, backup/bərpa, monitorinq və xəta görünürlüğü. Rəqəmsal SLO, backup tezliyi və bərpa müddəti OQ-10-da qərar gözləyir.
- **NFR-08 [T] — Məxfilik siyasəti:** saxlama müddəti, razılıq mətni, silmə və hüquqi əsas OQ-02 ilə razılaşdırılmalıdır; heç bir müddət özbaşına hüquqi öhdəlik kimi qoyulmur.

## 5. Sərhədlər və asılılıqlar

Sabit büdcə və hədəf tarix [Brief](01-project-brief.md) sənədindədir; mümkünlük sübutu deyil. Real kataloq, tərcümə təsdiqləri, hüquqi mətnlər, email/hosting girişləri və dəqiq xəritə buraxılış asılılıqlarıdır. [Qərar reyestri](07-open-questions-assumptions.md) ilkin admin qeydləri kimi tətbiqə daşınmalıdır. Texnoloji stack və provayder seçilməyib.
