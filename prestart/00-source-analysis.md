# AZEXBUY — mənbə analizi

Versiya: 0.1 | Tarix: 23.10.2026 | Status: sənədləşdirmə bazası; yekun müştəri/UAT təsdiqi deyil.

## Mənbə reyestri

- **SRC-01:** [Anket](https://brief.octotech.az/brief/67003370e70a4807). 22.10.2026 tarixində dinamik yüklənən görünən müsahibə oxunub. Formaya cavab göndərilməyib. Müsahibənin gələcək dəyişiklikləri bu versiyaya avtomatik aid deyil.
- **SRC-02:** [DOCX](../docs/Veb%20sayt%20məlumatları.docx). Orijinal dəyişdirilmədən LibreOffice 26.8.1.1 ilə PDF-ə çevrilib; 28 səhifənin tam çıxarılan mətni oxunub. Müvəqqəti nəticə `/tmp/azexbuy-docx-analysis/Veb sayt məlumatları.pdf` yolundadır; bu yol daimi arxiv deyil.
- **SRC-03:** [Təqdim edilmiş PDF](../docs/Veb%20sayt%20məlumatları.pdf). 25 səhifənin tam çıxarılan mətni oxunub. Aşağıdakı səhifə istinadları bu PDF-ə aiddir.
- **SRC-04:** [Screenshot](/home/aliv/.cursor/projects/home-aliv-Desktop-Projeler-AZEXBUY/assets/WhatsApp_Image_2026-10-04_at_16.57.19-ffd794cb-d63c-41b6-901b-1f3f8231df23.jpg). Desktop ana səhifə referansı; mobil ekran və işlək prototip deyil. Xırda HS kodları və qeyri-aydın yazılar dəqiq məlumat kimi köçürülmür.
- **SRC-05:** Bu söhbətdə 23.10.2026 tarixinə qədər verilən istifadəçi qərarları: [qərar reyestri](07-open-questions-assumptions.md). Bunlar layihə tərəfinin dəqiqləşdirmələridir; ayrıca son müştəri imzası olduğu iddia edilmir.

## Anket istinad açarı

- **Q01:** problem və hazırkı həll yolları.
- **Q02:** əməliyyat xidməti yönümlü MVP, alıcı/istehsalçı məlumatlarının toplanması.
- **Q03:** iki formanın sahələri və fayllar.
- **Q04:** təsdiq mesajı, bazada saxlanma, email, admin statusları, qeydlər, təyinat və matching.
- **Q05:** korporativ dizayn, iki əsas CTA, formaya maksimum iki klik.
- **Q06:** altı dil, ilkin ingilis dili.
- **Q07:** yalnız veb sayt.
- **Q08:** 3 000 AZN və nisbi buraxılış tarixi.
- **Q09:** Əkbər Bağırovun Əli Vəlizadə ilə danışması; tam təsdiq səlahiyyəti matrisi deyil.
- **Q10:** SEO sualı; cavab yoxdur.

Müsahibə aparanın sualları və tövsiyələri avtomatik müştəri cavabı sayılmır. Müştərinin cavab sahəsinə daxil etdiyi geniş mətn istək sübutudur, lakin mətndəki nümunələr real məhsul faktı deyil.

## DOCX–PDF müqayisəsi

Bölmə səviyyəsində uyğunluq: Hero; Niyə AZEXBUY; alıcı/istehsalçı; dörd xidmət; proses; kənar ixrac şöbəsi; kataloq modeli; məhsul şablonu; haqqımızda; Insights və beş məqalə; əlaqə/xəritə; final CTA/footer.

DOCX-dən çevrilmiş PDF-də 28, təqdim edilmiş PDF-də 25 səhifə var. Sətir bölgüsü, səhifələnmə, marker və emoji görünüşü fərqlənir. Oxunan əsas mətn və biznes tələblərində bölmə səviyyəsində məna fərqi müəyyən edilməyib. Bu, avtomatik simvol diff-i, bayt eyniliyi və ya pixel-perfect render uyğunluğu iddiası deyil. İki format eyni məzmun ailəsinin nüsxələri kimi qəbul edilir, iki müstəqil təsdiq kimi yox.

DOCX arxiv inventarında 12 çıxarılan adi fayl, media faylı yoxdur. Əlaqələrdə iki `mailto:info@azexbuy.com` keçidi var. Cədvəl/drawing yoxluğu ayrıca təsdiqlənməyib. Mətnin oxunmasına mane olan ilkin oxuyucu limiti PDF çevirməsi ilə aradan qaldırılıb.

## PDF üzrə bölmə xəritəsi

- S.1–2: Hero və beş üstünlük.
- S.3–4: alıcı və istehsalçı xidmət mətnləri.
- S.5–6: Market Access, Buyer & Sales, Export Management, Logistics.
- S.7–9: alıcı üçün 7, istehsalçı üçün 8 proses addımı.
- S.9–11: Outsourced Export Department.
- S.11–14: kateqoriya əsaslı kataloq, məhsul səhifəsi, sorğu; qiymət/səbət yoxdur.
- S.15–18: məhsul şablonu, MOQ, qablaşdırma, sertifikat nümunələri; təchizatçı kontaktlarının gizliliyi.
- S.18–19: haqqımızda.
- S.19–22: Insights, dörd kateqoriya və beş məqalə.
- S.22–25: əlaqə, xəritə, final CTA, footer, hüquqi keçidlər.

## Screenshot-un əhatəsi və fərqlər

Naviqasiya: Home, For Buyers, For Producers, Services, Products, How It Works, About Us, Insights, Contact; axtarış işarəsi və Request a Quote. Ana səhifədə iki CTA, beş üstünlük, iki auditoriya kartı, dörd xidmət, proses, seçilmiş məhsullar və Why Azerbaijan bloku görünür.

- İstehsalçı üçün screenshot 10 addım, mətn 8 addım verir. **DEC-09:** 10 addımlı vizual quruluş seçilib. Dəqiq son adlar OQ-08 ilə redaksiya təsdiqi gözləyir; uydurulmuş mətn qəti tələb deyil.
- Axtarış davranışı mətn mənbələrində yox idi. **DEC-10:** yalnız məhsul adı/kateqoriya üzrə kataloq axtarışı.
- Why Azerbaijan ayrıca mətn mənbəsində tam yazılmayıb. OQ-08: son məzmun və yerləşmə.
- Mətn mənbəsindəki ixrac şöbəsi xidməti, əlaqə və legal hissələrin screenshot-da görünməməsi onların ləğvi deyil.
- Screenshot-dakı nümunə məhsullar və HS kodları real kataloq təsdiqi deyil.

## Analitik nəticələr

1. Sayt əməliyyat komandasına lead toplayır; ticarət, sertifikatlaşdırma, gömrük və daşıma proqram daxilində avtomatik icra edilmir.
2. İctimai qiymət yoxdur; istehsalçı qiymət aralığının daxili saxlanması ilə ziddiyyət yaranmır.
3. Formanı göndərmək təchizatçının yoxlanmış olduğunu sübut etmir. Matching namizədi kommersiya uyğunluğu zəmanəti deyil.
4. CMS, sadə matching, çoxməhsullu müraciət və qaralama yaradılması sonrakı söhbətdə dəqiqləşdirilmiş əhatədir.
5. Sertifikat, MOQ, istehsal gücü və məhsul üstünlükləri nümunədir; fakt və sertifikat sübutları admin tərəfindən yoxlanmalıdır.
6. Privacy/Terms mətnləri, dəqiq xəritə, sosial URL-lər və real kataloq mənbələrdə tam deyil. Bunlar admin qərar reyestrinə daşınacaq.
7. Altı dil və layihə komandası tərəfindən tərcümə öhdəliyi var; bütün mətnlərin təsdiqi və ərəb RTL QA-sı buraxılış asılılığıdır.

## Məhdudiyyət və təsdiq qapısı

Dörd təqdim olunmuş mənbə yoxlanıb. Glob/Grep alətlərinin kataloq axtarış xətası səbəbindən `docs` daxilində başqa fayl olmadığı sübut edilmir. Dəqiq məhsul/şəkil məlumatları və screenshot-un xırda yazıları təsdiqlənmiş fakt deyil.

İstifadəçi təkrar dəqiqləşdirmələrdən sonra konfiqurasiya olunan məsələlərin admin parametrlərinə, qalan qərarların admin qərar reyestrinə daxil edilməsini istəyib və sənədləşdirməyə keçidi təsdiqləyib. Bu təsdiq tətbiqin hazırlanmasına və bütün açıq qərarların həllinə bərabər deyil.
