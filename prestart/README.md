# AZEXBUY — prestart

Versiya: 0.1 | Tarix: 23.10.2026 | Status: mənbələr analiz edilib, sənədləşdirməyə keçid təsdiqlənib; paket yekun müştəri və implementasiya təsdiqinə təqdim edilən layihədir.

## Məqsəd və əhatə

Anket, DOCX, PDF, screenshot və sonrakı istifadəçi qərarlarını Brief, SRS, FSD və qəbul bazasına çevirmək. Bu qovluq işlək sayt/admin panel deyil. Kod, stack, hosting və real UAT nəticəsi yaradılmayıb. Orijinal mənbələr və plan faylı dəyişdirilməyib.

## Oxuma ardıcıllığı

1. [Mənbə analizi](00-source-analysis.md) — mənbələr, yoxlama əhatəsi, fərqlər və məhdudiyyətlər.
2. [Project Brief](01-project-brief.md) — biznes məqsədi, MVP, büdcə və hədəf tarix.
3. [SRS](02-srs.md) — ID-li tələblər, məlumat anlayışları və qeyri-funksional ehtiyaclar.
4. [FSD](03-fsd.md) — forma, kataloq, matching, lead/CMS, admin parametrləri və qərar reyestrinin davranışı.
5. [Sayt xəritəsi və məzmun](04-sitemap-content.md) — IA-01, naviqasiya, səhifələr və altı dil.
6. [İstifadəçi axınları](05-user-flows.md) — əsas/alternativ/xəta axınları.
7. [Qəbul meyarları](06-acceptance-criteria.md) — AC/QA və UAT qaydası; hələ icra olunmayıb.
8. [Qərarlar və açıq məsələlər](07-open-questions-assumptions.md) — DEC, OQ və adminə daşınacaq ilkin qeydlər.
9. [Mənbə izlənəbilənliyi](08-source-traceability.md) — mənbə → tələb → davranış → qəbul əlaqəsi.
10. [Baxış və təhvil qaydası](RUNBOOK.md) — sənəd review-su, dəyişiklik və yoxlama nəticəsi.

## Status işarələri

- **M:** mənbədə açıq tələb.
- **D / DEC:** bu söhbətdə dəqiqləşdirilmiş qərar; ayrıca müştəri imzası iddiası deyil.
- **T:** analitik/texniki təklif; qəbul gözləyir.
- **OQ:** açıq qərar və blokladığı mərhələ.
- **CFG:** admin paneldə konfiqurasiya edilən parametr qrupu.
- **FR/NFR, FS, FLOW, AC/QA:** tələb, davranış, axın və qəbul istinadları.

Konfiqurasiya dəyəri hüquqi/biznes təsdiqinin yerini tutmur. Sərbəst admin konfiqurasiyası təhlükəsizlik hədlərini aşa bilməz. Bütün açıq məsələlər işlək tətbiq hazır olduqda admin “Qərar gözləyən məsələlər” bölməsində görünməlidir; bu sənədlərdə təsvir edilməsi onların artıq proqramda mövcud olması demək deyil.

## Əsas qərarlar

Altı dil, en ilkin; komanda tərcüməsi/müştəri təsdiqi. Çoxməhsullu supplier forması, hər məhsula qaralama, admin nəşr təsdiqi. Bütün supplier müraciətlərindən məhsul/kateqoriya üzrə namizəd təklifi, açıq verifikasiya etiketi; son yoxlama insandadır. CMS, iki daxili rol, kataloq axtarışı, baza texniki SEO. 3 000 AZN sabit layihə büdcəsi; 31.10.2026 hədəfi mümkünlük təsdiqi deyil.

Səbət, ictimai qiymət, ödəniş, public şəxsi kabinet, AI/tam avtomatik matching, mobil tətbiq və geniş CRM əhatədə deyil.

## Yekun təsdiq üçün

OQ-01–OQ-11 üzrə məsul şəxslər və bloklayıcı qərarlar tamamlanmalı; texniki T təklifləri nəzərdən keçirilməli; müştəri məzmun/tərcümə və UAT səlahiyyətlərini təsdiqləməlidir. Sənəd paketinin yazılması bu addımların yerinə yetirilməsi deyil.
