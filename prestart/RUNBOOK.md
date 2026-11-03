# AZEXBUY prestart — baxış, dəyişiklik və təhvil qaydası

Versiya: 0.1 | Tarix: 23.10.2026. Bu, sənəd paketinin istifadə qaydasıdır; tətbiq deploy runbook-u deyil.

## Baxış

1. README və mənbə analizindən başlayın; DOCX/PDF səhifə nömrələrinin fərqini nəzərə alın.
2. Brief-də əhatə/büdcə/tarixi, SRS-də M/D/T kateqoriyalarını yoxlayın.
3. FSD və axınları rol, məlumat məxfiliyi, çoxməhsullu müraciət və admin nəşr təsdiqi baxımından nəzərdən keçirin.
4. OQ reyestrini məsul şəxslərə bölün. Konfiqurasiya olanları parametrlərə, qərarları sübut tələb edən reyestrə xəritələyin.
5. Təsdiqlənmiş texniki qərardan sonra qəbul meyarlarını build/UAT planına çevirin. İcra olunmayan testi Pass işarələməyin.

## Dəyişiklik

Hər dəyişiklikdə: qərar verən, tarix, mənbə/DEC/OQ, dəyişən FR/FS/AC və büdcə/tarix təsiri qeyd edilsin. İlkin mənbə səssiz yenidən yazılmasın. Yeni scope ayrıca təsdiqlənsin. Əvvəlki qərarı ləğv etmək üçün səbəb və onu əvəz edən qərar göstərilsin.

Admin panel qurulanda OQ-01–OQ-11 ilkin məsələlər kimi daxil edilməlidir; həll edilməmiş məlumatlar hazır konfiqurasiya kimi göstərilməməlidir. Sənəd reyestri ilə proqram reyestri üçün sinxronlaşdırma məsulu ayrıca təyin olunmalıdır; bu paket avtomatik sync aləti yaratmır.

## Yoxlama qeydi — 23.10.2026

- Paket 11 Markdown faylından ibarətdir: README, bu RUNBOOK və 00–08 sənədləri.
- Mənbə analizi, Brief, SRS/FSD, IA, axın, qəbul, qərar və traceability sənədləri yazılıb.
- 11 fayl birbaşa oxuma ilə müstəqil nəzərdən keçirilib; paketdaxili 27 keçidin hədəfi yaradılmış fayl adları ilə tutuşdurulub. Xarici/orijinal aktivlərə 3 keçid bu review daxilində yenidən yoxlanılmayıb.
- FR-01–FR-22 üçün FS və AC əlaqələri, NFR-01–NFR-08 üçün QA əlaqələri yoxlanıb. Review zamanı iki NFR-in FS istinadı tamamlanıb: FS-14 əməliyyat/retention təklifi, AC-23 əlavə qəbul ssenarisi. Matching və audit üçün çatışmayan konkret mənfi hallar AC-15/22-yə əlavə edilib və dəyişən hissələr yenidən oxunub.
- Son struktur: 22 FR, 8 NFR, 14 FS, 8 FLOW, 23 AC və 8 QA; bu saylar testlərin keçməsi deyil, sənəd əhatəsidir.
- Mənbədən gələn və sonradan təsdiqlənən tələblər texniki təkliflərdən ayrılıb.
- Fayl limitləri, hüquqi/retention, infra və dil detalları açıq saxlanıb; konkret rəqəmlər özbaşına təsdiqlənməyib.
- Public qiymət/kontakt qadağası ilə daxili supplier məlumatları ayrı saxlanıb.
- Plan/orijinal mənbələrə dəyişiklik nəzərdə tutulmayıb. Proqram kodu və real UAT nəticəsi yoxdur.

Alət məhdudiyyəti: kataloq üzrə Glob/Grep axtarışı xəta verdiyi üçün bütün workspace inventarı və avtomatik link/ID skript yoxlaması aparıldığı iddia edilmir. Birbaşa oxuma və sənəd mətnlərinin tutuşdurulması ilə yoxlanılan nəticə təhvil xülasəsində göstərilir.

## Rollback

Bu dəyişiklik yalnız yeni `prestart` sənədləridir. Geri alma tələb olunarsa yalnız bu işdə yaradılmış 11 fayl müəyyənləşdirilərək ayrıca razılıqla arxivləşdirilə/silinə bilər; `docs`, orijinal screenshot və plan faylına toxunulmur. İstifadəçinin sonrakı dəyişiklikləri olan fayllar kor-koranə silinməməlidir.
