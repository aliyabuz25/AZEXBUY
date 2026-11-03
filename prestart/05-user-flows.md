# AZEXBUY — istifadəçi axınları

Versiya: 0.1 | 23.10.2026 | Status: layihə. Mənbədə verilməyən xəta/bərpa detalları FSD üzrə texniki təklifdir. Diaqram əvəzinə addımlı təsvir istifadə olunur.

## FLOW-01 — Alıcı sorğusu (FR-02, FR-03, FR-07, FR-11)

1. Ziyarətçi ilkin en və ya seçdiyi dildə sayta daxil olur.
2. Buy CTA və ya məhsul CTA-sından formaya keçir; məhsul kontekstində ad/kateqoriya əvvəlcədən dolur.
3. Məcburi sahələri və istəyə görə logistika/ticarət detallarını daxil edir.
4. Server validasiyası uğurludursa Buyer lead bazada saxlanır.
5. Uğur mesajı görünür; konkret cavab vaxtı/təklif vədi yoxdur; komandaya bildiriş işi yaranır.
6. Əməkdaş lead-i açır, təsnifat lazım olarsa kateqoriyanı müəyyən edir, məsul təyin edir və insan əməliyyatı başlayır.

Alternativlər: kataloqda olmayan məhsul ümumi sorğu ilə təqdim olunur; etibarsız sahə yerində izah edilir; DB xətası qəbul edilməmiş vəziyyət kimi görünür; email xətası saxlanmış lead-i ləğv etmir. Təkrar göndərmə açarı eyni lead-i təkrarlamamalıdır (T).

## FLOW-02 — Çoxməhsullu istehsalçı müraciəti (FR-04, FR-05, FR-11, FR-17)

1. Export CTA istehsalçı formasını açır.
2. Şirkət/əlaqə və bir və ya daha çox məhsul bloku doldurulur; xidmət ehtiyacları seçilir.
3. Şəkil, kataloq, sertifikat faylları təsdiqlənmiş limit daxilində əlavə olunur. Limit qərarı yoxdursa istehsal mühiti hazır sayılmır.
4. Validasiya uğurlu olduqda Supplier lead və hər SupplierProduct ayrı saxlanır.
5. Hər məhsul üçün bağlı, ictimai olmayan qaralama yaranır. Şirkət avtomatik yoxlanmış olmur.
6. Qəbul mesajı və komanda bildirişi; əməkdaş məhsulları nəzərdən keçirir.

Alternativlər: məhsul bloku silinir; ən azı bir məhsul qalmalıdır (T); səhv fayl ayrıca göstərilir; qismən saxlanma və itmiş qaralama aşkar edilərsə uğur kimi maskalanmır. Yeni müraciəti əvvəlki şirkətlə avtomatik birləşdirmək yoxdur.

## FLOW-03 — Lead üzərində iş (FR-13, FR-14, FR-18, FR-22)

1. Daxili istifadəçi fərdi hesabla daxil olur.
2. Buyer/Supplier siyahısından detalı açır.
3. Məlumat/faylları nəzərdən keçirir, qeyd yazır, məsul təyin edir.
4. New/In Progress/Contacted/Closed statusunu iş vəziyyətinə uyğun dəyişir; yoxlanma etiketi ayrıca qalır.
5. Dəyişiklik aktor/vaxtla qeyd olunur (T).

İcazəsiz giriş serverdə rədd edilir; deaktiv məsula təyinat qaydası OQ-10; Closed satış uğurunun sübutu deyil. Sərt status keçid diaqramı hələ təsdiqlənməyib.

## FLOW-04 — Namizədlərin təklifi (FR-15)

1. Əməkdaş buyer tələbini və məhsul/kateqoriya təsnifatını açır.
2. Sistem bütün SupplierProduct müraciətləri arasında həmin məhsul/kateqoriya üzrə namizədləri tapır.
3. Mənbə müraciət, şirkət, məhsul və yoxlanma vəziyyəti göstərilir; qaralama public olmasa da namizəd ola bilər.
4. Əməkdaş MOQ, istehsal gücü, sertifikat və bazarları özü yoxlayır, daxili qeyd aparır.
5. Əlaqə və kommersiya davamı komandanın əməliyyatıdır.

Təsnifat yoxdursa əməkdaşdan tələb olunur; nəticə yoxdursa bu açıq bildirilir. Sistem yoxlanmamış müraciəti “uyğunluğu təsdiqlənmiş supplier” adlandırmır, avtomatik kontakt/təklif göndərmir.

## FLOW-05 — Məhsul/məqalənin nəşri (FR-16, FR-17, FR-09, FR-10)

1. Əməkdaş formadan yaranan və ya özü yaratdığı qaralamanı açır.
2. İctimai icazəli sahələri, real məhsul məlumatlarını, şəkil hüquqlarını və tərcümələri hazırlayır.
3. Administrator mənbə və məzmunu yoxlayır; daxili qiymət/kontakt/faylın public olmadığını yoxlayır.
4. Təsdiqdən sonra uyğun dil variantı yayımlanır, public kataloq/axtarış/SEO-ya daxil olur.
5. Redaktə və yenidən təsdiq qaydası FSD təklifinə uyğun tətbiq olunur.

Əməkdaş birbaşa yayımlaya bilməz. Çatışmayan dilin fallback-i OQ-09; hüquqi və fakt yoxlaması bitməyibsə təsdiq verilməməlidir. Uyğun olmayan qaralama saxlanır/arxivlənir, ictimai görünmür (T).

## FLOW-06 — Kataloq axtarışı (FR-06–FR-08)

Kateqoriya/axtarış → yalnız public nəticələr → məhsul detalı → əvvəlcədən dolu buyer sorğusu → FLOW-01. Nəticə yoxdursa ümumi sorğu CTA-sı; admin lead-i public nəticəyə daxil edilmir.

## FLOW-07 — Parametr dəyişikliyi (FR-19, FR-22)

1. Administrator parametri və təsdiq vəziyyətini açır.
2. Tip və sərt təhlükəsiz hədlər daxilində dəyər daxil edir.
3. Dəyişiklik yoxlanır, aktor/vaxtla saxlanır; CFG-01 üçün test bildirişi aparılır (T).
4. Əlaqəli qərar varsa ayrıca təsdiq sübutu tələb olunur; dəyər girişi OQ-ni avtomatik həll etmir.

Səhv dəyər aktiv əvvəlki parametri korlamır. Əvvəlki təhlükəsiz dəyərə dönüş təklifdir. Secret dəyəri paneldə açıq görünmür.

## FLOW-08 — Açıq qərarın həlli (FR-20)

1. Administrator/əməkdaş reyestrdə məsələni, məsul tərəfi və blokladığı mərhələni görür.
2. Əməkdaş əlavə məlumat/qeyd təqdim edir (alt-səlahiyyət T).
3. Səlahiyyətli qərar verən biznes/hüquqi/texniki qərarı təsdiqləyir; administrator qərar/sübut/vaxtı qeyd edir.
4. Məsələ yalnız əsaslandırılmış təsdiqlə həll statusuna keçir; uyğun parametr/məzmun ayrıca yenilənir.
5. Buraxılış məsulu bütün bloklayıcıları nəzərdən keçirir və go/no-go qərarı verir.

Sübut yoxdursa həll statusu rədd edilir (T). Təxirəsalma təsdiq deyil. Qərar dəyişibsə səbəblə yenidən açılır. Avtomatik deploy bloklayıcısı əhatəyə daxil deyil.
