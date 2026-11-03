# AZEXBUY — mənbə və tələb izlənəbilənliyi

Versiya: 0.1 | 23.10.2026. Mənbə açarları [00-source-analysis.md](00-source-analysis.md), DEC/OQ açarları [07-open-questions-assumptions.md](07-open-questions-assumptions.md) sənədindədir. FR/NFR [SRS](02-srs.md), FS [FSD](03-fsd.md), FLOW [axınlar](05-user-flows.md), AC/QA [qəbul](06-acceptance-criteria.md) sənədindədir.

## Funksional zəncirlər

- **FR-01:** SRC-03/s.1–25 + SRC-04; DEC-09 → FS-01, IA-01 → FLOW-01/02/06 → AC-01. Bölmə/URL seçimləri OQ-08-dir.
- **FR-02:** SRC-01/Q05 + SRC-03/s.1,3–4 → FS-01 → FLOW-01/02 → AC-02.
- **FR-03:** SRC-01/Q03 + DEC-14 → FS-02 → FLOW-01 → AC-03.
- **FR-04:** SRC-01/Q03 + DEC-09/14 → FS-03 → FLOW-02 → AC-04.
- **FR-05:** SRC-01/Q03 + DEC-14 → FS-04 → FLOW-02 → AC-05; limitlər OQ-01, təhlükəsizlik NFR-02.
- **FR-06:** SRC-03/s.11–18 + SRC-04 → FS-06 → FLOW-06 → AC-06; nümunə məhsullar OQ-07.
- **FR-07:** SRC-03/s.12–18 → FS-02 → FLOW-01/06 → AC-07.
- **FR-08:** SRC-04 axtarış işarəsi + DEC-10 → FS-06 → FLOW-06 → AC-08.
- **FR-09:** SRC-03/s.13–16 → FS-06/09 → FLOW-05/06 → AC-09.
- **FR-10:** SRC-01/Q06 + DEC-04 → FS-10 → FLOW-01/02/05 → AC-10; URL/fallback OQ-09.
- **FR-11:** SRC-01/Q04 + DEC-10 → FS-05 → FLOW-01/02 → AC-11; notification hədəfi OQ-03. DEC-10 ilkin 24 saat vədini əvəz edir.
- **FR-12:** SRC-03/s.22–25 → FS-01 → IA-01 Contact → AC-12; dəqiq xəritə OQ-06.
- **FR-13:** SRC-01/Q04 → FS-07 → FLOW-03 → AC-13.
- **FR-14:** SRC-01/Q04 → FS-07 → FLOW-03 → AC-14.
- **FR-15:** SRC-01/Q04-dəki qarışıq matching ifadəsi DEC-01/03/05 ilə dəqiqləşib → FS-08 → FLOW-04 → AC-15. Tam auto/AI matching daxil deyil.
- **FR-16:** DEC-02/04 → FS-09 → FLOW-05 → AC-16.
- **FR-17:** DEC-06/09 → FS-09 → FLOW-02/05 → AC-17.
- **FR-18:** DEC-12 + DEC-06 nəşr təsdiqi → FS-11 → FLOW-03/05/07/08 → AC-18; alt-hüquqlar OQ-10 təklifidir.
- **FR-19:** DEC-13 → FS-12, CFG-01–CFG-05 → FLOW-07 → AC-19. Limit/hüquqi dəyərlər özbaşına təsdiqlənməyib.
- **FR-20:** DEC-13 → FS-13, OQ-01–OQ-11 → FLOW-08 → AC-20.
- **FR-21 [T]:** daxili və məxfi məlumat tələbindən çıxan texniki giriş təklifi → FS-11 → FLOW-03 → AC-21; OQ-10 təsdiqi.
- **FR-22 [T]:** idarəetmə izinin texniki təklifi → FS-11–13 → FLOW-03/07/08 → AC-22; OQ-10 təsdiqi.

## Qeyri-funksional zəncirlər

- **NFR-01 [T]:** FR-09/18/21-in təhlükəsiz reallaşdırılması → FS-06/09/11 → QA-01, AC-09/18/21.
- **NFR-02 [T]:** FR-05/19 daxili upload və konfiqurasiya sərhədi → FS-04/12 → QA-02, AC-05/19.
- **NFR-03 [T]:** SRC-01/Q04 saxlanma/bildiriş ehtiyacının etibarlı davranışı → FS-05 → QA-03, AC-11.
- **NFR-04 [M,T]:** SRC-03/s.23 responsive xəritə, SRC-01/Q05 aydın UX; sayt boyu əlçatanlıq hədəfi texniki təklif → FS-01/02/03/10 → QA-04.
- **NFR-05 [D]:** cavabsız SRC-01/Q10, sonradan DEC-11 → FS-10 → QA-05.
- **NFR-06 [T]:** SRC-01/Q06 + DEC-04-dən çıxan dil QA davranışları → FS-10 → QA-06, AC-10.
- **NFR-07 [T]:** əməliyyat/performance/backup təklifi → FS-14, OQ-04/10 → QA-07.
- **NFR-08 [T]:** FR-03/04 şəxsi məlumat toplanması və SRC-03/s.25 hüquqi keçidlər → FS-12/14, OQ-02/10, CFG-05 → QA-08.

## Digər mənbələrin taleyi

- SRC-01/Q01: Brief problem/dəyər təklifi; funksiyanın avtomatik icrası deyil.
- SRC-01/Q02/Q07: əməliyyat xidməti yönümlü veb MVP və mobil tətbiqin xaric edilməsi.
- SRC-01/Q08 + DEC-07/08: Brief büdcə/hədəf; OQ-04/05 asılılıqları.
- SRC-01/Q09: OQ-11; şəxslər arasında söhbət tam imza matrisi sayılmır.
- SRC-03/s.5–11: xidmətlər və kənar ixrac şöbəsi IA-01-də saxlanılıb; gömrük/logistika avtomatlaşdırmasına çevrilməyib.
- SRC-03/s.19–22: beş yazı CMS başlanğıc məzmunudur; fakt yoxlaması OQ-07/08.
- SRC-04 Why Azerbaijan və 10 producer addımı: IA-01 və OQ-08; xırda yazılar fakt kimi təxmin edilməyib.
- SRC-02/SRC-03: bölmə səviyyəsində uyğun mətnlər, iki ayrı təsdiq deyil.

## İnzibati açıqların taleyi

OQ-01 → CFG-02; OQ-02 → CFG-05 və hüquqi qərar; OQ-03 → CFG-01; OQ-06 → CFG-03; OQ-07 sosial/əlaqə hissəsi → CFG-03; tərcümə mesajları → CFG-04. OQ-04/05/08/09/10/11 yalnız sadə parametr deyil, qərar/sübut tələb edir. Bütün OQ-lər FR-20 reyestrində görünməlidir.

Bu xəritə analitik əhatə yoxlamasıdır; proqram testlərinin keçməsi və bütün mənbələrin simvol səviyyəsində diff-i deyil.
