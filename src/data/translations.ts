import { Locale, ProductItem, ServicePillar, StepItem, AboutPageContent, TeamMember } from '../types';

export const HERO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB9ZWqLLmb30gHFdTBf7cfY60pAMzYSTWRn2keRDZ7k8a3eQicd1I5xuOR1U44ux_eyOl79BjhxRaXdEbzovzXexqRo8oDy3gVECJAAKnDsq1DYgw7oR-p-U-VjFeMqmdwPl27SJVIP7hTVWchM1LYBR1EY2hy5C8iSkUcytv0qKVFgxmbifXswWW8UTnyUsQw5XBb81qNG2tremLOg_k5EPGCl-K_AWwSN8UQ3T1EN7HyePk3pvGD9';

export const BUYER_CARD_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCHfBjlFdQNaNAsP2RbAdqbBzskyL-GFgkaTpjwu0U6iT-t0tvmdQxrsHV7DOVkxLI4TCvj6qWpEawxqKJPqQE9f5GeXtwvTu7-fs3s495aRNM41LY0ardk4_DhtXk2RrKbiZgwssXvlrrI_EThET-4vRXO-9SbspxRcE3KXflGW-LnO8LzAq_bYYS10R-r010CzBLBwMqbd6slv40ntEvn3OyeauJszJaHkxnHTcGCq-0XAIDQmj6_';

export const PRODUCER_CARD_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDgrvRVBxN_YV05A8C2ZBQC2V2WHmgN9IrmvxhBvoVre7FKYjEbaR95Ew5PqX6-T-FG67u-0fHLCX6KeLtUrAkBIiJfWZGu7t3Ez2RyKvMerWTAHV1ROVLxhP4wE2oqLK-k9t1i6hrPmq-YJ-GDzjbqNDrNf2-SyjbXUmuQAJa5ScuKsRahZQdVKWyzFzRNPNYzxr3XOkiIb2BLWy4KJO-b-RWiNaaRqebQkQINqnQZfyBkDjpvxMId';

export const BUYER_HERO_IMAGE =
  'https://images.unsplash.com/photo-1494412574643-71b2511b1f07?w=1600&q=80';
export const PRODUCER_HERO_IMAGE =
  'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1600&q=80';

export const WHY_AZERBAIJAN_IMAGE =
  'https://lh3.googleusercontent.com/aida/AEtjO1WtUBR_2hOeUbRABsre_R7H-yW12FldWdxDp_6_abkiZuNwgF3fMTiwxdQCKdfEbdEWa-6CSQc0bQgUbjojei2itk13mAz_e09yOnKuFWP_7AO2BpMiNUQByyYnqtrPMywT0b4g4COdLkLc5_L75NtOsKv5OOgHz7VdAMCF-WDWgmhqccS9HdQKKY8cwD4AeVg_Z5AczT8rfvCVFXyJrgDuQKAsNiyYL54OeN2_HoFxHi9ltf4bUcbHSmM';

export const HOW_IT_WORKS_BUYERS_IMAGE =
  'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80';

export const HOW_IT_WORKS_SELLERS_IMAGE =
  'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80';

export const PRODUCTS_CATALOG: ProductItem[] = [
  {
    id: 'hazelnut-080222',
    featured: true,
    hsCode: '080222',
    categoryKey: 'agro',
    name: {
      EN: 'Hazelnut',
      AZ: 'Fındıq Ləpəsi',
      RU: 'Фундук очищенный',
    },
    categoryLabel: {
      EN: 'Agriculture & Food',
      AZ: 'Kənd Təsərrüfatı və Qida',
      RU: 'Сельское хозяйство и продукты',
    },
    shortDesc: {
      EN: 'Extra-grade shelled natural & roasted Ata-Baba hazelnuts from Zaqatala-Sheki orchards.',
      AZ: 'Zaqatala-Şəki bağlarından ekstra növlü təbii və qovrulmuş Ata-Baba fındıq ləpəsi.',
      RU: 'Очищенный натуральный и обжаренный фундук сорта Ата-Баба высшего качества из Загаталы и Шеки.',
    },
    originRegion: {
      EN: 'Zaqatala – Sheki Economic Region',
      AZ: 'Zaqatala – Şəki İqtisadi Rayonu',
      RU: 'Загатало-Шекинский экономический район',
    },
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD6iP6ACTY6rFPAXNJlK_W-AfkWR_1OBE8I3wLkCwVMAlQIyNvxAXxK1kYe6-itoVecrpqtsSok0_wQ1QnYyWcn40Hikz269v2ag3TbKrY9lfqw3mEVtR-I0GvclcQXFDi0q_xVPYMdzpIFMaXwgeJEs4gwsCpcf-Dn7Df8QGIeKoSael0DxSBY2ZpmoWYe8Ynhio_Q0dONzHarqS9Kp31IStn01T44xVmJ90B5TY2WFQr7mOmo4Ucq',
    minOrderQty: '20 MT (1x 20ft FCL)',
    annualCapacity: '24,000 MT',
    verifiedSuppliersCount: 38,
    incoterms: ['FCA', 'FOB', 'CIF', 'DAP'],
    certifications: ['ISO 22000', 'FSSC 22000', 'AQTA Phytosanitary', 'EUR.1 / CT-1', 'Halal'],
    leadTimeDays: '7–12 Days',
    packaging: {
      EN: '25kg / 50kg vacuum foil bags in corrugated cartons or 800kg big-bags',
      AZ: '25kq / 50kq vakuum folqa kisələr və ya 800kq biq-bəqlər',
      RU: 'Вакуумные пакеты по 25/50 кг в картонных коробах или биг-бэги по 800 кг',
    },
    gradeSpecs: {
      EN: 'Caliber 11–13mm, 13–15mm | Moisture < 5.5% | Aflatoxin B1 < 2ppb (EU Standard)',
      AZ: 'Kalibr 11–13mm, 13–15mm | Nəmlik < 5.5% | Aflatoksin B1 < 2ppb (Aİ Standartı)',
      RU: 'Калибр 11–13мм, 13–15мм | Влажность < 5.5% | Афлатоксин B1 < 2ppb (Стандарт ЕС)',
    },
  },
  {
    id: 'pomegranate-081090',
    featured: true,
    hsCode: '081090',
    categoryKey: 'agro',
    name: {
      EN: 'Pomegranate',
      AZ: 'Göyçay Narı',
      RU: 'Гранат свежий и сок прямого отжима',
    },
    categoryLabel: {
      EN: 'Agriculture & Food',
      AZ: 'Kənd Təsərrüfatı və Qida',
      RU: 'Сельское хозяйство и продукты',
    },
    shortDesc: {
      EN: 'Goychay Guloysha & Bala Mursal fresh export pomegranates and NFC cold-pressed concentrate.',
      AZ: 'Göyçay Gülöyşə və Bala Mürsəl təzə ixrac narı və soyuq sıxım NFC şirə konsentratı.',
      RU: 'Свежие гранаты сортов Гюлейша и Бала Мюрсаль из Гёйчая и концентрат холодного отжима.',
    },
    originRegion: {
      EN: 'Central Aran (Goychay – Kurdamir)',
      AZ: 'Mərkəzi Aran (Göyçay – Kürdəmir)',
      RU: 'Центральный Аран (Гёйчай – Кюрдамир)',
    },
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDHo5g8iKevybJcG4jlFPGTNzuPMU2721wxSfNRS3s0FmbZeA3YW4AxkdXtyhH_55x-4s5Uh_5-S2-S3LVPexC1O1ahPg_Hgeeion6snYi_eyi7MNDXh5coR3k9acztB4DSA_PV9JjS_JAitpfDEAmO4UUbAUjAs0VuwpjvFbKeEaRXeqGiJ2JKU_vHqlhTa6Meil6iamn-3I_33E-Y7Tii2hclP8mfc_jBNp_gJSQpmbKniKtPJu5s',
    minOrderQty: '18 MT (Reefer 40ft)',
    annualCapacity: '45,000 MT',
    verifiedSuppliersCount: 42,
    incoterms: ['FCA', 'FOB', 'CIF', 'DAP'],
    certifications: ['GLOBALG.A.P.', 'ISO 22000', 'USDA Organic', 'EU Organic', 'AQTA'],
    leadTimeDays: '5–9 Days',
    packaging: {
      EN: '4.5kg / 5kg open-top euro trays with modified atmosphere liner (Reefer +5°C)',
      AZ: '4.5kq / 5kq modifikasiya olunmuş atmosfer örtüklü avro-lotoklar (+5°C)',
      RU: 'Евролотки по 4.5 / 5 кг с вкладышем модифицированной атмосферы (Реф +5°C)',
    },
    gradeSpecs: {
      EN: 'Fruit weight 350g–650g | Brix > 16.5° | Zero cold-chain break certification',
      AZ: 'Meyvə çəkisi 350q–650q | Brix > 16.5° | Fasiləsiz soyuq zəncir zəmanəti',
      RU: 'Вес плода 350–650 г | Brix > 16.5° | Сертификация непрерывной холодовой цепи',
    },
  },
  {
    id: 'carpet-5701',
    featured: true,
    hsCode: '5701',
    categoryKey: 'textile',
    name: {
      EN: 'Carpet',
      AZ: 'Azərbaycan Xalçası',
      RU: 'Азербайджанские ковры',
    },
    categoryLabel: {
      EN: 'Textile & Apparel',
      AZ: 'Tekstil və Xalçaçılıq',
      RU: 'Текстиль и ковры',
    },
    shortDesc: {
      EN: 'Hand-knotted wool and silk Azerbaijani carpets alongside high-density commercial woven looms.',
      AZ: 'Əl ilə toxunmuş yun və ipək Azərbaycan xalçaları və yüksək sıxlıqlı sənaye xalça məmulatları.',
      RU: 'Шерстяные и шелковые азербайджанские ковры ручной работы и коммерческий ковровый текстиль.',
    },
    originRegion: {
      EN: 'Quba, Karabakh, Shirvan & Baku',
      AZ: 'Quba, Qarabağ, Şirvan və Bakı',
      RU: 'Губа, Карабах, Ширван и Баку',
    },
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDtNJYRxE2w63MPzGdjf8CPD9AEFm8HRgiA_8S4bLzI4JlWkzMSr7mOrBFN0clACdJ8Z4fdPmTxcUeQZoVHwM8X0BSrp3Ge5V1rjnXGei5GwaARNkgff5T_0xspZitbC-LuPEjlYnoFGRTUx9-xnXkSS6296Qbk6OBMxFoPcu45Ph_IWPgxe8ghwkwSRb4DFc747hiqPs4hl6mD0u0fkbzXC86IW3Go3l5Gt49vsGvyFE6w27cyqJpi',
    minOrderQty: '50 m² / Custom Lot',
    annualCapacity: '180,000 m²',
    verifiedSuppliersCount: 19,
    incoterms: ['EXW', 'FCA', 'CIF', 'DAP', 'DDP'],
    certifications: ['UNESCO Heritage Passport', 'OEKO-TEX Standard 100', 'Certificate of Origin'],
    leadTimeDays: '10–21 Days',
    packaging: {
      EN: 'Moisture-proof breathable tyvek roll sleeve with reinforced export crating',
      AZ: 'Nəmə davamlı qoruyucu örtük və gücləndirilmiş ixrac qablaşdırması',
      RU: 'Влагозащитный дышащий чехол Tyvek с усиленной экспортной обрешеткой',
    },
    gradeSpecs: {
      EN: '100% highland virgin wool / Sheki mulberry silk | 160,000–350,000 knots/m² | Natural vegetal dyes',
      AZ: '100% təbii dağ yunu / Şəki ipəyi | 160,000–350,000 ilmə/m² | Təbii boyalar',
      RU: '100% горная шерсть / шекинский шелк | 160 000–350 000 узлов/м² | Натуральные красители',
    },
  },
  {
    id: 'marble-2515',
    featured: true,
    hsCode: '2515',
    categoryKey: 'construction',
    name: {
      EN: 'Marble',
      AZ: 'Mərmər və Travertin',
      RU: 'Мрамор и строительный камень',
    },
    categoryLabel: {
      EN: 'Construction Materials',
      AZ: 'Tikinti Materialları',
      RU: 'Строительные материалы',
    },
    shortDesc: {
      EN: 'Dashkasan crystalline marble, Nakhchivan travertine slabs, and architectural Aglay limestone.',
      AZ: 'Daşkəsən kristal mərməri, Naxçıvan travertin plitələri və memarlıq Ağlay daşı.',
      RU: 'Дашкесанский кристаллический мрамор, нахчыванский травертин и архитектурный камень Аглай.',
    },
    originRegion: {
      EN: 'Dashkasan, Nakhchivan & Qaradagh',
      AZ: 'Daşkəsən, Naxçıvan və Qaradağ',
      RU: 'Дашкесан, Нахчыван и Гарадаг',
    },
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD03XXHtlryKOF4P13Jsyapcx1cJC4md04R7W4OmhEOlilzH3GXC84pohKdFeZC2E26PSlasR8hsE1ZhUMI_m0G3EvLUmCLYXAFuMf-8fVmPxAaSz6rXZE5DhZfy_GWTdrnj6b_8WD4Q3Rrvlu3AYTUq_hrwc41KTaORWxIqz41fZ3sVhVp_icHS5yhXQKuIuOFb0jjF16nF7IcXL9rWJ5SplYRdK1DWGo-wlLK2UlgnkEWl6JIaR20',
    minOrderQty: '250 m² (1x 20ft Heavy FCL)',
    annualCapacity: '650,000 m²',
    verifiedSuppliersCount: 24,
    incoterms: ['EXW', 'FCA', 'FOB', 'CIF', 'DAP'],
    certifications: ['CE EN 1469', 'ISO 9001:2015', 'Radiation Safety Class I', 'ASTM C503'],
    leadTimeDays: '12–18 Days',
    packaging: {
      EN: 'ISPM-15 heat-treated fumigated wooden A-frames and reinforced slab bundles',
      AZ: 'ISPM-15 standartlı fumiqasiya olunmuş taxta A-karkaslar və plitə bağlamaları',
      RU: 'Термообработанные деревянные А-стойки стандарта ISPM-15 и усиленные пачки слэбов',
    },
    gradeSpecs: {
      EN: '20mm / 30mm calibrated slabs & cut-to-size tiles | Mirror-polished, honed, or brushed finish',
      AZ: '20mm / 30mm kalibrlənmiş plitələr | Cilalanmış, mat və ya teksturalı səth',
      RU: 'Калиброванные слэбы 20 / 30 мм и плитка в размер | Полированная, лощеная или брашированная',
    },
  },
  {
    id: 'sunflower-oil-151219',
    featured: true,
    hsCode: '151219',
    categoryKey: 'agro',
    name: {
      EN: 'Sunflower Oil',
      AZ: 'Günəbaxan Yağı',
      RU: 'Подсолнечное масло рафинированное',
    },
    categoryLabel: {
      EN: 'Agriculture & Food',
      AZ: 'Kənd Təsərrüfatı və Qida',
      RU: 'Сельское хозяйство и продукты',
    },
    shortDesc: {
      EN: 'Refined winterized deodorized (RBDW) sunflower and corn edible oils in PET and flexitanks.',
      AZ: 'PET qablaşdırma və fleksitanklarda rafinə edilmiş dezodorasiya olunmuş (RBDW) günəbaxan yağı.',
      RU: 'Рафинированное дезодорированное вымороженное подсолнечное масло в ПЭТ-бутылках и флекситанках.',
    },
    originRegion: {
      EN: 'Baku & Sumgayit Food Processing Cluster',
      AZ: 'Bakı və Sumqayıt Qida Sənaye Klasteri',
      RU: 'Пищевой промышленный кластер Баку и Сумгайыта',
    },
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC5UBl6ky2E1o6RbrVtIlz6xdPHcSBD7sd8H309gALUQoxK5e7r7Jx8q159V1clhGMbdLSh4P9jCngmrLKo1SRNMt8pOyjcZAA6ESFVNV4ezFkDuGcGpnQTuFuS1mN_y1GCw0fUeMaghixWmXvDOKyonKRvDbft5TQiqBmLD-rRRmW-WA8ynGJG10G8Glm_TPlhHHVb7hRwLDWJ8xhd-hOjeMKGIxnS1XfZVRCXaB1IDAY3cUYFZPhn',
    minOrderQty: '22 MT (1x Flexitank / FCL)',
    annualCapacity: '110,000 MT',
    verifiedSuppliersCount: 14,
    incoterms: ['FCA', 'FOB', 'CIF', 'DAP'],
    certifications: ['IFS Food', 'BRCGS', 'ISO 22000', 'Halal', 'Kosher'],
    leadTimeDays: '7–14 Days',
    packaging: {
      EN: '1L, 2L, 5L retail PET bottles (private label supported) or 24,000L bulk flexitanks',
      AZ: '1L, 2L, 5L PET şüşələr (Private Label dəstəyi) və ya 24,000L fleksitanklar',
      RU: 'ПЭТ-бутылки 1л, 2л, 5л (поддержка СТМ / Private Label) или наливные флекситанки 24 000 л',
    },
    gradeSpecs: {
      EN: 'Free Fatty Acid (FFA) < 0.1% | Peroxide Value < 1.0 meq/kg | Moisture < 0.05%',
      AZ: 'Sərbəst Yağ Turşusu (FFA) < 0.1% | Peroksid ədədi < 1.0 meq/kq | Nəmlik < 0.05%',
      RU: 'Свободные жирные кислоты < 0.1% | Перекисное число < 1.0 мэкв/кг | Влажность < 0.05%',
    },
  },
  {
    id: 'metal-products-7306',
    featured: true,
    hsCode: '7306',
    categoryKey: 'metals',
    name: {
      EN: 'Metal Products',
      AZ: 'Metal və Polad Məmulatları',
      RU: 'Металлопродукция и стальные трубы',
    },
    categoryLabel: {
      EN: 'Metals & Industrial',
      AZ: 'Metallurgiya və Sənaye',
      RU: 'Металлургия и промышленность',
    },
    shortDesc: {
      EN: 'Seamless & ERW structural steel pipes, reinforcement rebar, and Sumgayit primary aluminum.',
      AZ: 'Tikişsiz və qaynaqlı polad borular, inşaat armaturu və Sumqayıt ilkin alüminium profilləri.',
      RU: 'Бесшовные и электросварные стальные трубы, арматурный прокат и алюминиевые профили.',
    },
    originRegion: {
      EN: 'Sumgayit & Ganja Industrial Parks',
      AZ: 'Sumqayıt və Gəncə Sənaye Parkları',
      RU: 'Промышленные парки Сумгайыта и Гянджи',
    },
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDGgRuRr9uJiYiCy0AeiN7FvX1CWCTQLdRAG2TJXnfii1yXyI2WeKI6wMo6E8nydnbcUg27wH11AYMDuRy4WLTd0MRbPlzPT3f1Wzw2BN132jDlE2pKhDZ_BpSyUWXlgaEpX1_ukFt7IpSBL9Cnc3ILMPL8scPCgkSNob0PCSAa30dUKuSc0TBkoYnhfmiO58w10Zuz4eKBXbVNTk92SLbvxAconUj8wUxkDU7y1H7Ks3do6--khlfP',
    minOrderQty: '25 MT (Rail Wagon / FCL)',
    annualCapacity: '420,000 MT',
    verifiedSuppliersCount: 21,
    incoterms: ['EXW', 'FCA', 'FOB', 'CIF', 'DAP'],
    certifications: ['API Spec 5L / 5CT', 'EN 10219', 'DIN 10080', 'ISO 9001', 'Mill Test 3.1'],
    leadTimeDays: '10–20 Days',
    packaging: {
      EN: 'Hexagonal steel-strapped bundles with beveled plastic end caps and anti-corrosion coating',
      AZ: 'Polad lentlə bərkidilmiş altıbucaqlı bağlamalar, qoruyucu qapaqlar və antikorroziv örtük',
      RU: 'Шестигранные пачки со стальной обвязкой, торцевыми заглушками и антикоррозийным покрытием',
    },
    gradeSpecs: {
      EN: 'S235JR / S355J2H structural steel | B500B / B500C rebar | 6060 / 6063-T6 aluminum alloys',
      AZ: 'S235JR / S355J2H konstruksiya poladı | B500B / B500C armatur | 6060 / 6063-T6 alüminium',
      RU: 'Конструкционная сталь S235JR / S355J2H | Арматура B500B | Алюминиевый сплав 6063-T6',
    },
  },
  // Additional Catalog Commodities for Full Catalog View
  {
    id: 'persimmon-081070',
    featured: false,
    hsCode: '081070',
    categoryKey: 'agro',
    name: {
      EN: 'Persimmons & Dried Fruit',
      AZ: 'Xurma və Quru Meyvələr',
      RU: 'Хурма свежая и сухофрукты',
    },
    categoryLabel: {
      EN: 'Agriculture & Food',
      AZ: 'Kənd Təsərrüfatı və Qida',
      RU: 'Сельское хозяйство и продукты',
    },
    shortDesc: {
      EN: 'Fresh Hachiya & Fuyu persimmons and solar-dehydrated gourmet persimmon slices from Goychay-Agdash.',
      AZ: 'Göyçay-Ağdaş bölgəsindən təzə Hachiya və Fuyu xurması və qurudulmuş xurma dilimləri.',
      RU: 'Свежая хурма сортов Хачия и Фую и вяленые дольки хурмы из региона Гёйчай-Агдаш.',
    },
    originRegion: {
      EN: 'Goychay – Agdash – Balakan',
      AZ: 'Göyçay – Ağdaş – Balakən',
      RU: 'Гёйчай – Агдаш – Балакен',
    },
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDHo5g8iKevybJcG4jlFPGTNzuPMU2721wxSfNRS3s0FmbZeA3YW4AxkdXtyhH_55x-4s5Uh_5-S2-S3LVPexC1O1ahPg_Hgeeion6snYi_eyi7MNDXh5coR3k9acztB4DSA_PV9JjS_JAitpfDEAmO4UUbAUjAs0VuwpjvFbKeEaRXeqGiJ2JKU_vHqlhTa6Meil6iamn-3I_33E-Y7Tii2hclP8mfc_jBNp_gJSQpmbKniKtPJu5s',
    minOrderQty: '19 MT (Reefer FCL)',
    annualCapacity: '130,000 MT',
    verifiedSuppliersCount: 47,
    incoterms: ['FCA', 'CIF', 'DAP'],
    certifications: ['GLOBALG.A.P.', 'AQTA Phytosanitary', 'ISO 22000'],
    leadTimeDays: '5–8 Days',
    packaging: {
      EN: 'Single-layeralveolar plastic crates (3.5kg–7kg) and 500g retail dried fruit pouches',
      AZ: 'Təkqat alveol plastik yeşiklər (3.5kq–7kq) və 500q pərakəndə quru meyvə paketləri',
      RU: 'Однорядные пластиковые ящики с ячейками (3.5–7 кг) и крафт-пакеты по 500 г',
    },
    gradeSpecs: {
      EN: 'Caliber 65mm+ | Firmness > 5.5 kg/cm² | Zero astringency post-treatment',
      AZ: 'Kalibr 65mm+ | Bərklik > 5.5 kq/sm² | Ağızbüzücülüksüz şirin sort',
      RU: 'Калибр 65мм+ | Плотность > 5.5 кг/см² | Полное удаление терпкости',
    },
  },
  {
    id: 'cotton-yarn-5205',
    featured: false,
    hsCode: '5205',
    categoryKey: 'textile',
    name: {
      EN: 'Combed Cotton Yarn',
      AZ: 'Darama Pambıq İplik',
      RU: 'Гребенная хлопчатобумажная пряжа',
    },
    categoryLabel: {
      EN: 'Textile & Apparel',
      AZ: 'Tekstil və Xalçaçılıq',
      RU: 'Текстиль и ковры',
    },
    shortDesc: {
      EN: 'Ring-spun and open-end 100% long-staple Azerbaijani cotton yarn from Mingachevir & Sumgayit mills.',
      AZ: 'Mingəçevir və Sumqayıt tekstil parklarından 100% uzunlifli Azərbaycan pambıq ipliyi.',
      RU: 'Кольцевая и пневмомеханическая 100% хлопковая пряжа из Мингячевира и Сумгайыта.',
    },
    originRegion: {
      EN: 'Mingachevir Industrial Park & Barda',
      AZ: 'Mingəçevir Sənaye Parkı və Bərdə',
      RU: 'Мингячевирский промышленный парк и Барда',
    },
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDtNJYRxE2w63MPzGdjf8CPD9AEFm8HRgiA_8S4bLzI4JlWkzMSr7mOrBFN0clACdJ8Z4fdPmTxcUeQZoVHwM8X0BSrp3Ge5V1rjnXGei5GwaARNkgff5T_0xspZitbC-LuPEjlYnoFGRTUx9-xnXkSS6296Qbk6OBMxFoPcu45Ph_IWPgxe8ghwkwSRb4DFc747hiqPs4hl6mD0u0fkbzXC86IW3Go3l5Gt49vsGvyFE6w27cyqJpi',
    minOrderQty: '20 MT (1x 40ft HC)',
    annualCapacity: '35,000 MT',
    verifiedSuppliersCount: 16,
    incoterms: ['FCA', 'FOB', 'CIF', 'DAP'],
    certifications: ['OEKO-TEX Standard 100', 'BCI Cotton', 'ISO 9001', 'EUR.1'],
    leadTimeDays: '8–14 Days',
    packaging: {
      EN: 'Waxed paper cones (1.89kg each) packed in palletized export cartons or PP bags',
      AZ: 'Mumlanmış kağız konuslar (1.89kq) paletlənmiş ixrac qutularında',
      RU: 'Вощеные конусы по 1.89 кг на европаллетах в экспортном гофрокартоне',
    },
    gradeSpecs: {
      EN: 'Ne 20/1, Ne 24/1, Ne 30/1, Ne 40/1 Combed & Carded | Uster 5%–25% quality class',
      AZ: 'Ne 20/1, Ne 24/1, Ne 30/1, Ne 40/1 Karde və Kome | Uster 5%–25% keyfiyyət sinfi',
      RU: 'Номера Ne 20/1, 24/1, 30/1, 40/1 кардная и гребенная | Стандарт Uster 5–25%',
    },
  },
  {
    id: 'urea-polymer-310210',
    featured: false,
    hsCode: '310210',
    categoryKey: 'chemicals',
    name: {
      EN: 'Prilled & Granular Urea + Polymers',
      AZ: 'Karbamid və Polipropilen Qranulları',
      RU: 'Карбамид гранулированный и полимеры',
    },
    categoryLabel: {
      EN: 'Metals & Industrial',
      AZ: 'Kimya və Sənaye',
      RU: 'Химия и промышленность',
    },
    shortDesc: {
      EN: '46.2% Nitrogen granular agricultural urea and high-density polyethylene/polypropylene resins from Sumgayit Chemical Park.',
      AZ: 'Sumqayıt Kimya Sənaye Parkından 46.2% azotlu dənəvər karbamid və polietilen/polipropilen qranulları.',
      RU: 'Гранулированный карбамид (азот 46.2%) и первичный полипропилен/полиэтилен из Сумгайыта.',
    },
    originRegion: {
      EN: 'Sumgayit Chemical Industrial Park',
      AZ: 'Sumqayıt Kimya Sənaye Parkı',
      RU: 'Сумгайытский химический промышленный парк',
    },
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDGgRuRr9uJiYiCy0AeiN7FvX1CWCTQLdRAG2TJXnfii1yXyI2WeKI6wMo6E8nydnbcUg27wH11AYMDuRy4WLTd0MRbPlzPT3f1Wzw2BN132jDlE2pKhDZ_BpSyUWXlgaEpX1_ukFt7IpSBL9Cnc3ILMPL8scPCgkSNob0PCSAa30dUKuSc0TBkoYnhfmiO58w10Zuz4eKBXbVNTk92SLbvxAconUj8wUxkDU7y1H7Ks3do6--khlfP',
    minOrderQty: '100 MT (Rail / Bulk Vessel)',
    annualCapacity: '650,000 MT',
    verifiedSuppliersCount: 11,
    incoterms: ['FCA', 'FOB', 'CIF', 'DAP'],
    certifications: ['REACH Registered', 'ISO 9001', 'ISO 14001', 'SGS Inspection Certificate'],
    leadTimeDays: '10–16 Days',
    packaging: {
      EN: '50kg woven PP bags with PE inner liner or 1,000kg UV-stabilized bulk FIBC bags',
      AZ: '50kq polipropilen kisələr və ya 1,000kq UB-davamlı biq-bəqlər',
      RU: 'Полипропиленовые мешки по 50 кг с ПЭ-вкладышем или МКР биг-бэги по 1000 кг',
    },
    gradeSpecs: {
      EN: 'Total Nitrogen ≥ 46.2% | Biuret ≤ 0.8% | Granule size 2–4mm ≥ 95%',
      AZ: 'Ümumi Azot ≥ 46.2% | Biuret ≤ 0.8% | Qranul ölçüsü 2–4mm ≥ 95%',
      RU: 'Массовая доля азота ≥ 46.2% | Биурет ≤ 0.8% | Гранулометрический состав 2–4 мм ≥ 95%',
    },
  },
];

export const SERVICES_PILLARS: ServicePillar[] = [
  {
    id: 'market-access',
    iconClass: 'fa-solid fa-leaf',
    colorClass: 'bg-emerald-500',
    linkColorClass: 'text-brandGreen',
    title: {
      EN: 'Market Access',
      AZ: 'Bazarlara Çıxış',
      RU: 'Доступ к рынкам',
      TR: 'Pazarlara Erişim',
      AR: 'الوصول إلى الأسواق',
      ES: 'Acceso a Mercados',
    },
    subtitle: {
      EN: 'Strategic export route modeling, tariff analysis, destination regulatory alignment, and target market intelligence to open your products into priority global corridors.',
      AZ: 'Strateji ixrac marşrutlarının modelləşdirilməsi, tarif təhlili, hədəf ölkələrin tənzimləyici uyğunluğu və bazar intellekti ilə məhsullarınızı prioritet qlobal dəhlizlərə açma.',
      RU: 'Моделирование экспортных маршрутов, тарифный анализ, соответствие регуляторным требованиям стран назначения и аналитика целевых рынков для выхода на приоритетные глобальные коридоры.',
      TR: 'Stratejik ihracat koridoru modellemesi, tarif analizi, hedef ülkelerin mevzuat uyumu ve pazar istihbaratıyla ürünlerinizi öncelikli küresel koridorlara açma.',
      AR: 'نمذجة مسارات التصدير الاستراتيجية، وتحليل التعريفات الجمركية، والتوافق التنظيمي لبلدان الوجهة، وذكاء السوق للوصول إلى الممرات العالمية ذات الأولوية.',
      ES: 'Modelado de rutas de exportación estratégicas, análisis arancelario, alineación regulatoria de los destinos y inteligencia de mercado para abrir sus productos a los corredores globales prioritarios.',
    },
    items: [
      { EN: 'Market Research', AZ: 'Bazar Araşdırması', RU: 'Исследование рынков', TR: 'Pazar Araştırması', AR: 'أبحاث السوق', ES: 'Investigación de Mercados' },
      { EN: 'Target Market Selection', AZ: 'Hədəf Bazar Seçimi', RU: 'Выбор целевых рынков', TR: 'Hedef Pazar Seçimi', AR: 'اختيار الأسواق المستهدفة', ES: 'Selección de Mercados Objetivo' },
      { EN: 'Export Potential Analysis', AZ: 'İxrac Potensialının Təhlili', RU: 'Анализ экспортного потенциала', TR: 'İhracat Potansiyeli Analizi', AR: 'تحليل إمكانات التصدير', ES: 'Análisis del Potencial de Exportación' },
      { EN: 'Market Entry Strategy', AZ: 'Bazara Giriş Strategiyası', RU: 'Стратегия выхода на рынок', TR: 'Pazara Giriş Stratejisi', AR: 'استراتيجية دخول السوق', ES: 'Estrategia de Entrada al Mercado' },
    ],
    deliverables: [
      {
        EN: 'HS-6 Tariff & Preferential Duty Matrix (EU GSP+, CIS FTA, Turkey PTA)',
        AZ: 'HS-6 Tarif və Güzəştli Gömrük Matrisi (Aİ, MDB, Türkiyə)',
        RU: 'Матрица тарифов и преференциальных пошлин по коду ТН ВЭД',
        TR: 'HS-6 Tarif ve Tercihli Gümrük Matrisi (AB GSP+, DTÖ FTA, Türkiye STA)',
        AR: 'مصفوفة التعريفات الجمركية والتفضيلية (GSP+ للاتحاد الأوروبي، FTA لرابطة الدول المستقلة، PTA لتركيا)',
        ES: 'Matriz de tarifas y derechos arancelarios preferenciales (GSP+ UE, FTA de la CIS, PTA de Turquía)',
      },
      {
        EN: 'Competitor Landed-Cost Benchmark Report',
        AZ: 'Rəqiblərin Çatdırılma Qiyməti Hesabatı',
        RU: 'Отчет по себестоимости с учетом логистики конкурентов',
        TR: 'Rakiplerin Teslimat Maliyeti Karşılaştırma Raporu',
        AR: 'تقرير مقارنة التكلفة الإجمالية للمنافسين',
        ES: 'Informe de Coste Completo de la Competencia',
      },
    ],
    turnaround: '5 Business Days',
  },
  {
    id: 'buyer-sales',
    iconClass: 'fa-regular fa-address-book',
    colorClass: 'bg-sky-600',
    linkColorClass: 'text-sky-600',
    title: {
      EN: 'Buyer & Sales',
      AZ: 'Alıcı Axtarışı və Satış',
      RU: 'Поиск покупателей и продажи',
      TR: 'Alıcı ve Satış',
      AR: 'البحث عن المشتريات والمبيعات',
      ES: 'Compra y Venta',
    },
    subtitle: {
      EN: 'Direct B2B matchmaking with vetted international procurement desks, regional distributors, and retail chains — from qualified buyer sourcing to contract-ready negotiation support.',
      AZ: 'Yoxlanılmış beynəlxalq satınalma mərkəzləri, regional distribyutorlar və ticarət şəbəkələri ilə birbaşa B2B əlaqələr — təsdiq edilmiş alıcı axtarışından müqaviləyə hazır danışıq dəstəyinə qədər.',
      RU: 'Прямой B2B-подбор проверенных международных закупщиков, дистрибьюторов и торговых сетей — от скрининга контрагентов до поддержки переговоров на стадии заключения контракта.',
      TR: 'Doğrulanmış uluslararası satın alma masaları, bölgesel dağıtıcılar ve perakende zincirleriyle doğrudan B2B eşleştirme — nitelikli alıcı bulmadan sözleşmeye hazır pazarlık desteğine kadar.',
      AR: 'تطابق تجاري مباشر (B2B) مع مكاتب المشتريات الدولية والدistributors الإقليمية وسلاسل التجزئة — من تصفية المشترين المؤهلين إلى دعم التفاوض حتى توقيع العقود.',
      ES: 'Intermediación B2B directa con despachos de compras internacionales verificados, distribuidores regionales y cadenas minoristas: desde la captación de compradores cualificados hasta el apoyo en negociaciones listos para firmar.',
    },
    items: [
      { EN: 'Buyer Search', AZ: 'Alıcı Axtarışı', RU: 'Поиск покупателей', TR: 'Alıcı Araması', AR: 'البحث عن المشترين', ES: 'Búsqueda de Compradores' },
      { EN: 'Buyer Verification', AZ: 'Alıcıların Yoxlanılması', RU: 'Проверка контрагентов (KYB)', TR: 'Alıcı Doğrulama', AR: 'توثيق المشترين (KYB)', ES: 'Verificación de Compradores' },
      { EN: 'Distributor Search', AZ: 'Distribütor Axtarışı', RU: 'Поиск дистрибьюторов', TR: 'Dağıtıcı Araması', AR: 'البحث عن الموزعين', ES: 'Búsqueda de Distribuidores' },
      { EN: 'Lead Generation', AZ: 'Potensial Müştəri Cəlbi', RU: 'Лидогенерация B2B', TR: 'Potansiyel Müşteri Üretimi', AR: 'توليد العملاء المحتملين B2B', ES: 'Generación de Leads' },
      { EN: 'B2B Meetings', AZ: 'B2B Görüşlərin Təşkili', RU: 'Организация B2B-встреч', TR: 'B2B Görüş Organizasyonu', AR: 'تنظيم اجتماعات B2B', ES: 'Reuniones B2B' },
      { EN: 'Negotiation Support', AZ: 'Danışıqların Dəstəklənməsi', RU: 'Сопровождение переговоров', TR: 'Müzakere Desteği', AR: 'دعم التفاوض', ES: 'Apoyo en Negociaciones' },
    ],
    deliverables: [
      {
        EN: 'KYB-Verified Buyer Shortlist & Creditworthiness Dossier',
        AZ: 'KYB-təsdiqli Alıcı Siyahısı və Ödəmə Qabiliyyəti Dosyesi',
        RU: 'Досье проверенных закупщиков с финансовым скорингом',
        TR: 'KYB Doğrulamalı Alıcı Listesi ve Ödeme Gücü Dosyası',
        AR: 'قائمة المشترين الموثقين مع ملف جدارة الائتمان',
        ES: 'Lista de Compradores Verificados y Dossier de Solvencia',
      },
      {
        EN: 'Multilingual Commercial Offer & Sample Dispatch Coordination',
        AZ: 'Çoxdilli Kommersiya Təklifi və Nümunə Göndərişi Koordinasiyası',
        RU: 'Мультиязычное коммерческое предложение и отправка образцов',
        TR: 'Çok Dilli Ticari Teklif ve Numune Gönderimi Koordinasyonu',
        AR: 'عرض تجاري متعدد اللغات وتنسيق إرسال العينات',
        ES: 'Oferta Comercial Multilingüe y Coordinación de Envío de Muestras',
      },
    ],
    turnaround: '48 Hours (RFQ Match)',
  },
  {
    id: 'export-management',
    iconClass: 'fa-solid fa-boxes-stacked',
    colorClass: 'bg-purple-600',
    linkColorClass: 'text-purple-600',
    title: {
      EN: 'Export Management',
      AZ: 'İxracın İdarə Edilməsi',
      RU: 'Управление экспортом',
      TR: 'İhracat Yönetimi',
      AR: 'إدارة التصدير',
      ES: 'Gestión de Exportación',
    },
    subtitle: {
      EN: 'Complete regulatory compliance, phytosanitary certification, origin documentation, and customs clearance — end-to-end export administration handled for you.',
      AZ: 'Tam tənzimləyici uyğunluq, fitosanitar sertifikatlaşdırma, mənşə sənədləri və gömrük rəsmiləşdirilməsi — uçdan-uca ixrac idarəetməsi sizin yerinizə görülür.',
      RU: 'Полное нормативное сопровождение, фитосанитарная сертификация, оформление сертификатов происхождения и таможенное оформление — весь экспортный администрирующий цикл под ключ.',
      TR: 'Kapsamlı mevzuat uyumu, bitki sağlığı sertifikasyonu, menşe belgeleri ve gümrük işlemleri — uçtan uca ihracat idaresi sizin adınıza yürütülür.',
      AR: 'اتساق تنظيمي شامل، وشهادات الصحة النباتية، ووثائق المنشأ، والجمارك — إدارة التصدير من البداية إلى النهاية من أجلكم.',
      ES: 'Cumplimiento normativo completo, certificación fitosanitaria, documentación de origen y despacho aduanero: toda la administración exportadora de principio a fin.',
    },
    items: [
      { EN: 'Documentation', AZ: 'Sənədləşmə', RU: 'Экспортная документация', TR: 'Dokümantasyon', AR: 'الوثائق', ES: 'Documentación' },
      { EN: 'Certification & Compliance', AZ: 'Sertifikatlaşdırma və Uyğunluq', RU: 'Сертификация и комплаенс', TR: 'Sertifikasyon ve Uygunluk', AR: 'الشهادات والامتثال', ES: 'Certificación y Cumplimiento' },
      { EN: 'Permits & Approvals', AZ: 'İcazələr və Təsdiqlər', RU: 'Разрешения и лицензии', TR: 'İzinler ve Onaylar', AR: 'الترخيص والموافقات', ES: 'Permisos y Aprobaciones' },
      { EN: 'Customs Clearance', AZ: 'Gömrük Rəsmiləşdirilməsi', RU: 'Таможенная очистка', TR: 'Gümrük İşlemleri', AR: 'إجراءات الجمارك', ES: 'Despacho Aduanero' },
    ],
    deliverables: [
      {
        EN: 'AQTA Phytosanitary, CT-1 / EUR.1 Origin & SGS Pre-Shipment Inspection',
        AZ: 'AQTA Fitosanitar, CT-1 / EUR.1 Mənşə və SGS Yükləməöncəsi İnspeksiya',
        RU: 'Фитосанитарный сертификат AQTA, сертификат происхождения и инспекция SGS',
        TR: 'AQTA Bitki Sağlığı, CT-1 / EUR.1 Menşe ve SGS Yükleme Öncesi Muayene',
        AR: 'شهادة الصحة النباتية AQTA، وشهادة المنشأ CT-1 / EUR.1، وفحص SGS قبل الشحن',
        ES: 'Certificado Fitosanitario AQTA, Origen CT-1 / EUR.1 y Inspección Pre-Embarque SGS',
      },
      {
        EN: 'Electronic Customs Declaration (DGK Green Corridor Filing)',
        AZ: 'Elektron Gömrük Bəyannaməsi (DGK Yaşıl Dəhliz Rəsmiləşdirilməsi)',
        RU: 'Электронная таможенная декларация (Зеленый коридор ГТК)',
        TR: 'Elektron Gümrük Beyannamesi (DGK Yeşil Koridor Beyanı)',
        AR: 'إقرار جمركي إلكتروني (تقديم ممر أخضر)',
        ES: 'Declaración Aduanera Electrónica (Presentación Corredor Verde)',
      },
    ],
    turnaround: '2–4 Business Days',
  },
  {
    id: 'logistics',
    iconClass: 'fa-solid fa-truck-fast',
    colorClass: 'bg-amber-500',
    linkColorClass: 'text-amber-500',
    title: {
      EN: 'Logistics',
      AZ: 'Beynəlxalq Logistika',
      RU: 'Международная логистика',
      TR: 'Uluslararası Lojistik',
      AR: 'اللوجستيات الدولية',
      ES: 'Logística Internacional',
    },
    subtitle: {
      EN: 'Multimodal freight across the Middle Corridor (TITR), the Port of Baku at Alat, and the BTK Railway — road, sea, air and rail under one Incoterms-aligned service.',
      AZ: 'Orta Dəhliz (TİTR), Ələt Bakı Beynəlxalq Dəniz Ticarət Limanı və BTQ dəmir yolu üzrə multimodal daşıma — avtomobil, dəniz, hava və dəmir yolu bir Incoterms uyumlu xidmət çərçivəsində.',
      RU: 'Мультимодальные перевозки по Среднему коридору (ТМТМ), через Порт Баку (Алят) и ж/д БТК — авто, море, авиа и ж/д в единой Incoterms-условии.',
      TR: 'Orta Koridor (TİTR), Alat\'daki Bakü Limanı ve BTK demiryolu üzerinden multimodal taşımacılık — karayolu, deniz, hava ve demiryolu tek Incoterms uyumlu hizmet içinde.',
      AR: 'نقل متعدد الوسائط عبر الممر الأوسط (TITR)، وميناء باكو في العلات، وسكة حديد باكو-تبليسي-قارص — برًا وبحرًا وجوًا وسككًا ضمن خدمة Incoterms موحدة.',
      ES: 'Flete multimodal a través del Corredor Central (TITR), el Puerto de Bakú en Alat y el ferrocarril BTK: carretera, mar, aire y tren bajo un servicio unificado conforme a Incoterms.',
    },
    items: [
      { EN: 'Road Freight', AZ: 'Avtomobil Daşımaları (TIR)', RU: 'Автоперевозки (TIR / Реф)', TR: 'Kara Taşımacılığı (TIR)', AR: 'الشحن البري (TIR)', ES: 'Flete Terrestre (TIR)' },
      { EN: 'Sea Freight', AZ: 'Dəniz Daşımaları (Xəzər / Qara dəniz)', RU: 'Морской фрахт (Каспий / Черное море)', TR: 'Deniz Taşımacılığı (Hazar / Karadeniz)', AR: 'الشحن البحري (البحر الكاسبي / البحر الأسود)', ES: 'Flete Marítimo (Caspio / Mar Negro)' },
      { EN: 'Air Freight', AZ: 'Hava Karqo Daşımaları', RU: 'Авиакарго (Heydar Aliyev Int. Hub)', TR: 'Hava Kargo Taşımacılığı', AR: 'الشحن الجوي (Heydar Aliyev Int. Hub)', ES: 'Flete Aéreo' },
      { EN: 'Rail Freight', AZ: 'Dəmir Yolu Daşımaları (BTQ)', RU: 'Ж/д перевозки (БТК / Север-Юг)', TR: 'Demiryolu Taşımacılığı (BTK)', AR: 'الشحن بالسكك الحديدية (BTK)', ES: 'Flete Ferroviario (BTK)' },
      { EN: 'Warehousing', AZ: 'Anbar və Soyuducu Saxlama', RU: 'Складирование и бондовые терминалы', TR: 'Depolama ve Soğuk Zincir Saklama', AR: 'التخزين والسلاسل الباردة', ES: 'Almacenamiento y Cadenas de Frío' },
      { EN: 'Insurance', AZ: 'Yük Sığortası (CMR / All-Risk)', RU: 'Страхование грузов (All-Risk)', TR: 'Yük Sigortası (CMR / All-Risk)', AR: 'تأمين الشحنات (CMR / All-Risk)', ES: 'Seguro de Carga (CMR / All-Risk)' },
    ],
    deliverables: [
      {
        EN: 'Incoterms 2020 Multimodal Routing & Container Slot Guarantee',
        AZ: 'Incoterms 2020 Multimodal Marşrut və Konteyner Yeri Zəmanəti',
        RU: 'Мультимодальная маршрутизация по Incoterms 2020 и бронь контейнеров',
        TR: 'Incoterms 2020 Multimodal Rotalama ve Konteyner Yer Garantisi',
        AR: 'توجيه متعدد الوسائط وفق Incoterms 2020 وضمان حجز الحاويات',
        ES: 'Enrutamiento Multimodal según Incoterms 2020 y Garantía de Espacio en Contenedores',
      },
      {
        EN: 'Cold-Chain Telemetry & 110% CIF Marine Cargo Insurance Policy',
        AZ: 'Soyuq Zəncir Telemetriyası və 110% CIF Yük Sığortası Polisi',
        RU: 'Телеметрия холодовой цепи и страховой полис CIF 110%',
        TR: 'Soğuk Zincir Telemetrisi ve 110% CIF Deniz Yük Sigortası Poliçesi',
        AR: 'تقنيات تتبع سلسلة التبريد وبوليصة تأمين شحن بحري CIF 110%',
        ES: 'Telemetría de la Cadena de Frío y Póliza de Seguro Marítimo CIF 110%',
      },
    ],
    turnaround: '24 Hours Freight Quote',
  },
];

export const BUYER_STEPS: StepItem[] = [
  {
    number: 1,
    title: {
      EN: 'We find suppliers',
      AZ: 'Təchizatçıları tapırıq',
      RU: 'Подбор производителей',
    },
    detailTitle: {
      EN: 'Step 1: National Cluster Supplier Sourcing',
      AZ: 'Addım 1: Milli İstehsal Klasterlərindən Təchizatçı Seçimi',
      RU: 'Шаг 1: Поиск по реестру производителей Азербайджана',
    },
    description: {
      EN: 'Our trade specialists match your target commodity against 250+ vetted Azerbaijani manufacturers across all 14 economic regions.',
      AZ: 'Ticarət mütəxəssislərimiz hədəf əmtəənizi 14 iqtisadi rayon üzrə 250+ yoxlanılmış Azərbaycan istehsalçısı ilə uyğunlaşdırır.',
      RU: 'Наши эксперты сопоставляют вашу целевую commodity с базой из 250+ проверенных фабрик и агрохолдингов в 14 экономических районах.',
    },
    deliverable: {
      EN: 'Matched Production Capacity Matrix',
      AZ: 'Uyğunlaşdırılmış İstehsal Gücü Matrisi',
      RU: 'Матрица производственных мощностей поставщиков',
    },
    sla: '12–24 Hours',
    authority: 'National Producer Registry Division',
  },
  {
    number: 2,
    title: {
      EN: 'We verify suppliers',
      AZ: 'Təchizatçıları yoxlayırıq',
      RU: 'Верификация и аудит',
    },
    detailTitle: {
      EN: 'Step 2: Compliance & Capacity Audit',
      AZ: 'Addım 2: Uyğunluq və İstehsal Gücünün Auditi',
      RU: 'Шаг 2: Проверка сертификатов и аудит мощностей',
    },
    description: {
      EN: 'We audit current stock readiness, ISO/HACCP/GLOBALG.A.P. validity, VOEN tax standing, and past export performance.',
      AZ: 'Cari anbar hazırlığını, ISO/HACCP/GLOBALG.A.P. sertifikatlarını, VÖEN vergi statusunu və ixrac tarixçəsini yoxlayırıq.',
      RU: 'Проверяем наличие товара на складе, действующие сертификаты ISO/GLOBALG.A.P., налоговый статус VÖEN и экспортную историю.',
    },
    deliverable: {
      EN: 'Supplier Verification & Lab Assay Certificate',
      AZ: 'Təchizatçı Yoxlama Aktı və Laboratoriya Sertifikatı',
      RU: 'Акт верификации поставщика и протокол лабораторных испытаний',
    },
    sla: '24 Hours',
    authority: 'AZEXBUY Quality & Compliance Directorate',
  },
  {
    number: 3,
    title: {
      EN: 'You receive quotations',
      AZ: 'Qiymət təklifləri alırsınız',
      RU: 'Получение котировок',
    },
    detailTitle: {
      EN: 'Step 3: Standardized Comparative Quotations',
      AZ: 'Addım 3: Standartlaşdırılmış Müqayisəli Qiymət Təklifləri',
      RU: 'Шаг 3: Сравнительная таблица коммерческих предложений',
    },
    description: {
      EN: 'Receive transparent, apples-to-apples proforma quotations broken down by ex-works price, export clearance, and freight to your port.',
      AZ: 'Zavod qiyməti, gömrük rəsmiləşdirilməsi və təyinat limanına daşıma xərcləri göstərilməklə şəffaf müqayisəli təkliflər əldə edin.',
      RU: 'Вы получаете прозрачные сопоставимые котировки с разбивкой стоимости EXW, таможни и фрахта до порта назначения.',
    },
    deliverable: {
      EN: 'Comparative Bid Sheet (FOB / CIF / DAP)',
      AZ: 'Müqayisəli Qiymət Cədvəli (FOB / CIF / DAP)',
      RU: 'Сводная ведомость котировок (FOB / CIF / DAP)',
    },
    sla: 'Within 48 Hours',
    authority: 'AZEXBUY Commercial Desk',
  },
  {
    number: 4,
    title: {
      EN: 'You select the best option',
      AZ: 'Ən uyğun variantı seçirsiniz',
      RU: 'Выбор лучшего партнера',
    },
    detailTitle: {
      EN: 'Step 4: Partner Selection & Contract Structuring',
      AZ: 'Addım 4: Tərəfdaş Seçimi və Müqavilənin Bağlanması',
      RU: 'Шаг 4: Выбор поставщика и заключение контракта',
    },
    description: {
      EN: 'Inspect physical samples if required, finalize payment terms (L/C, Escrow, TT), and execute a bilingual international sales contract.',
      AZ: 'Lazım gələrsə fiziki nümunələri yoxlayın, ödəniş şərtlərini (Akkreditiv, Eskrou, köçürmə) təsdiqləyin və beynəlxalq müqavilə imzalayın.',
      RU: 'Согласование образцов, условий оплаты (аккредитив L/C, эскроу, банковский перевод) и подписание международного контракта.',
    },
    deliverable: {
      EN: 'ICC-Compliant International Purchase Contract',
      AZ: 'BTP-Uyğun Beynəlxalq Alqı-Satqı Müqaviləsi',
      RU: 'Международный контракт купли-продажи по стандарту ICC',
    },
    sla: '1–3 Days',
    authority: 'Legal & Trade Finance Desk',
  },
  {
    number: 5,
    title: {
      EN: 'We coordinate the order',
      AZ: 'Sifarişi koordinasiya edirik',
      RU: 'Координация заказа',
    },
    detailTitle: {
      EN: 'Step 5: Production Oversight & Pre-Shipment Inspection',
      AZ: 'Addım 5: İstehsala Nəzarət və Yükləməöncəsi İnspeksiya',
      RU: 'Шаг 5: Контроль производства и предотгрузочная инспекция',
    },
    description: {
      EN: 'Our field inspectors monitor grading, labeling, palletization, and container stuffing with photographic and weight bridge logs.',
      AZ: 'Sahə inspektorlarımız çeşidləmə, markalanma, paletləmə və konteyner yüklənməsinə foto və tərəzi protokolları ilə nəzarət edir.',
      RU: 'Полевые инспекторы контролируют калибровку, маркировку, паллетирование и погрузку с фотоотчетом и весовыми талонами.',
    },
    deliverable: {
      EN: 'Pre-Shipment Quality & Stuffing Dossier',
      AZ: 'Yükləməöncəsi Keyfiyyət və Konteyner Aktı',
      RU: 'Предотгрузочный инспекционный отчет и упаковочный лист',
    },
    sla: 'Per Production Schedule',
    authority: 'Field Inspection & AQTA Liaison Unit',
  },
  {
    number: 6,
    title: {
      EN: 'We manage export & delivery',
      AZ: 'İxrac və çatdırılmanı idarə edirik',
      RU: 'Экспорт и доставка',
    },
    detailTitle: {
      EN: 'Step 6: Customs Clearance & Multimodal Delivery',
      AZ: 'Addım 6: Gömrük Rəsmiləşdirilməsi və Multimodal Çatdırılma',
      RU: 'Шаг 6: Таможенное оформление и доставка до склада',
    },
    description: {
      EN: 'Complete export customs clearance, certificate issuance (CT-1 / EUR.1 / Phytosanitary), and tracked transit to your destination.',
      AZ: 'Tam ixrac gömrük rəsmiləşdirilməsi, sertifikatların (CT-1 / EUR.1 / Fitosanitar) verilməsi və təyinat nöqtəsinə izlənən çatdırılma.',
      RU: 'Полная экспортная таможенная очистка, выпуск сертификатов и отслеживаемая мультимодальная доставка до вашего терминала.',
    },
    deliverable: {
      EN: 'Full Original Bill of Lading / CMR / SMGS Pack',
      AZ: 'Tam Orijinal Konosament / CMR / SMGS Sənəd Paketi',
      RU: 'Полный комплект отгрузочных документов (B/L, CMR, СМГС)',
    },
    sla: 'End-to-End Tracked',
    authority: 'Multimodal Logistics Operations Center',
  },
  {
    number: 7,
    title: {
      EN: 'Submit the official RFQ',
      AZ: 'Rəsmi RFQ göndərin',
      RU: 'Отправка официального RFQ',
    },
    detailTitle: {
      EN: 'Step 7: Final RFQ & Official Dossier Registration',
      AZ: 'Addım 7: Yekun RFQ və Rəsmi Dosye Qeydiyyatı',
      RU: 'Шаг 7: Итоговая RFQ и регистрация официального досье',
    },
    description: {
      EN: 'Once supplier selection and order logistics are confirmed, we formalize your request via the AZEXBUY RFQ Desk and register your Sovereign RFQ Dossier.',
      AZ: 'Təchizatçı seçimi və sifariş logistikası təsdiqləndikdən sonra sorğunuzu AZEXBUY RFQ Masası vasitəsilə rəsmiləşdirib Rəsmi RFQ Dosyenizi qeydiyyatdan keçiririk.',
      RU: 'После подтверждения выбора поставщика и логистики заказа мы оформляем ваш запрос через стол заявок AZEXBUY и регистрируем ваше официальное досье RFQ.',
    },
    deliverable: {
      EN: 'Registered Sovereign RFQ Dossier Number',
      AZ: 'Qeydiyyatdan Keçmiş Rəsmi RFQ Dosye Nömrəsi',
      RU: 'Зарегистрированный номер досье заявки RFQ',
    },
    sla: 'Instant (< 15 mins)',
    authority: 'AZEXBUY Procurement Facilitation Desk',
  },
];

export const PRODUCER_STEPS: StepItem[] = [
  {
    number: 1,
    title: { EN: 'Export readiness', AZ: 'İxraca hazırlıq', RU: 'Оценка готовности' },
    detailTitle: {
      EN: 'Phase 1: Export Readiness Diagnostic',
      AZ: 'Mərhələ 1: İxraca Hazırlıq Diaqnostikası',
      RU: 'Этап 1: Аудит экспортной готовности',
    },
    description: {
      EN: 'Diagnostic review of packaging durability, shelf-life, multilingual labeling, and international food/industrial safety standards.',
      AZ: 'Qablaşdırma davamlılığı, saxlama müddəti, çoxdilli markalanma və beynəlxalq təhlükəsizlik standartlarının diaqnostikası.',
      RU: 'Диагностика упаковки, сроков хранения, маркировки и соответствия международным стандартам качества.',
    },
    deliverable: { EN: 'Export Readiness Scorecard', AZ: 'İxraca Hazırlıq Qiymətləndirməsi', RU: 'Карта экспортной готовности' },
    sla: 'Days 1–2',
    authority: 'Standards & Readiness Advisory',
  },
  {
    number: 2,
    title: { EN: 'Market selection', AZ: 'Bazar seçimi', RU: 'Выбор рынков' },
    detailTitle: {
      EN: 'Phase 2: Target Export Market Selection',
      AZ: 'Mərhələ 2: Hədəf İxrac Bazarlarının Seçilməsi',
      RU: 'Этап 2: Выбор приоритетных стран экспорта',
    },
    description: {
      EN: 'Identify highest-margin destination markets (EU, GCC, CIS, Asia) based on tariff preferences and seasonal price windows.',
      AZ: 'Tarif güzəştləri və mövsümi qiymət pəncərələrinə əsasən ən yüksək marjalı bazarların (Aİ, Körfəz, MDB, Asiya) müəyyən edilməsi.',
      RU: 'Определение наиболее маржинальных рынков сбыта (ЕС, Персидский залив, СНГ, Азия) с учетом таможенных преференций.',
    },
    deliverable: { EN: 'Target Market Route Map', AZ: 'Hədəf Bazar Yol Xəritəsi', RU: 'Дорожная карта целевых рынков' },
    sla: 'Days 3–4',
    authority: 'Trade Intelligence Unit',
  },
  {
    number: 3,
    title: { EN: 'Buyer search', AZ: 'Alıcı axtarışı', RU: 'Поиск покупателей' },
    detailTitle: {
      EN: 'Phase 3: International Buyer Outreach',
      AZ: 'Mərhələ 3: Beynəlxalq Alıcıların Cəlb Edilməsi',
      RU: 'Этап 3: Таргетированный поиск импортеров',
    },
    description: {
      EN: 'Active promotion of your commodity specifications to 1,000+ registered international procurement officers and retail chains.',
      AZ: 'Məhsul spesifikasiyalarınızın 1,000+ qeydiyyatdan keçmiş beynəlxalq satınalma menecerinə və ticarət şəbəkələrinə təqdimatı.',
      RU: 'Прямое продвижение вашей продукции среди 1000+ верифицированных зарубежных закупщиков и торговых сетей.',
    },
    deliverable: { EN: 'Qualified Buyer Inquiry List', AZ: 'Təsdiqlənmiş Alıcı Sorğuları', RU: 'Реестр целевых запросов импортеров' },
    sla: 'Week 1',
    authority: 'Global Sales & Matchmaking Desk',
  },
  {
    number: 4,
    title: { EN: 'B2B negotiation', AZ: 'B2B danışıqlar', RU: 'B2B переговоры' },
    detailTitle: {
      EN: 'Phase 4: B2B Negotiation & Contracting',
      AZ: 'Mərhələ 4: B2B Danışıqlar və Müqavilə',
      RU: 'Этап 4: B2B-переговоры и контрактация',
    },
    description: {
      EN: 'Our multilingual trade managers facilitate price negotiations, sample approval, and secure payment structuring.',
      AZ: 'Çoxdilli ticarət menecerlərimiz qiymət danışıqlarını, nümunə təsdiqini və təhlükəsiz ödəniş şərtlərini idarə edir.',
      RU: 'Наши эксперты ведут переговоры на языке покупателя, согласуют образцы и защищенные условия расчетов.',
    },
    deliverable: { EN: 'Signed Export Supply Contract', AZ: 'İmzalanmış İxrac Müqaviləsi', RU: 'Подписанный экспортный контракт' },
    sla: 'Weeks 1–2',
    authority: 'Outsourced Export Department',
  },
  {
    number: 5,
    title: { EN: 'Documentation', AZ: 'Sənədləşmə', RU: 'Документация' },
    detailTitle: {
      EN: 'Phase 5: Export Documentation Dossier',
      AZ: 'Mərhələ 5: İxrac Sənədləri Paketi',
      RU: 'Этап 5: Подготовка пакета документов',
    },
    description: {
      EN: 'Preparation of Commercial Invoice, Packing List, International Sales Contract registration, and banking export declarations.',
      AZ: 'Kommersiya İnvoysu, Qablaşdırma Vərəqi, Beynəlxalq Müqavilə qeydiyyatı və bank ixrac sənədlərinin hazırlanması.',
      RU: 'Формирование инвойса, упаковочного листа, паспорта сделки и товаросопроводительных спецификаций.',
    },
    deliverable: { EN: 'Verified Commercial Dossier', AZ: 'Təsdiqlənmiş Kommersiya Paketi', RU: 'Полный коммерческий пакет' },
    sla: '24 Hours',
    authority: 'Export Documentation Desk',
  },
  {
    number: 6,
    title: { EN: 'Certification', AZ: 'Sertifikatlaşdırma', RU: 'Сертификация' },
    detailTitle: {
      EN: 'Phase 6: Origin & Sanitary Certification',
      AZ: 'Mərhələ 6: Mənşə və Fitosanitar Sertifikatlaşdırma',
      RU: 'Этап 6: Оформление сертификатов',
    },
    description: {
      EN: 'Obtaining Certificate of Origin (Form CT-1, EUR.1, General), AQTA Phytosanitary/Veterinary certificates, and lab reports.',
      AZ: 'Mənşə Sertifikatı (CT-1, EUR.1), AQTA Fitosanitar/Baytarlıq sertifikatları və laboratoriya protokollarının alınması.',
      RU: 'Получение сертификатов происхождения (СТ-1, EUR.1), фитосанитарных сертификатов AQTA и протоколов анализа.',
    },
    deliverable: { EN: 'Official Export Certificates', AZ: 'Rəsmi İxrac Sertifikatları', RU: 'Государственные сертификаты экспорта' },
    sla: '1–2 Days',
    authority: 'AQTA / KOBİA / Chamber Liaison',
  },
  {
    number: 7,
    title: { EN: 'Customs', AZ: 'Gömrük', RU: 'Таможня' },
    detailTitle: {
      EN: 'Phase 7: Customs Clearance & Green Corridor',
      AZ: 'Mərhələ 7: Gömrük Rəsmiləşdirilməsi və Yaşıl Dəhliz',
      RU: 'Этап 7: Таможенное декларирование',
    },
    description: {
      EN: 'Electronic export declaration submission, HS tariff verification, customs seal application, and export incentive filing.',
      AZ: 'Elektron ixrac bəyannaməsinin təqdim edilməsi, HS kod təsdiqi, gömrük plombunun vurulması və ixrac təşviqi müraciəti.',
      RU: 'Подача электронной экспортной декларации, наложение таможенных пломб и оформление возврата экспортных субсидий.',
    },
    deliverable: { EN: 'Released Customs Declaration', AZ: 'Buraxılış Gömrük Bəyannaməsi', RU: 'Выпуск грузовой таможенной декларации' },
    sla: 'Same Day',
    authority: 'Licensed Customs Brokerage Unit',
  },
  {
    number: 8,
    title: { EN: 'Logistics', AZ: 'Logistika', RU: 'Логистика' },
    detailTitle: {
      EN: 'Phase 8: Multimodal Freight Dispatch',
      AZ: 'Mərhələ 8: Multimodal Nəqliyyat Göndərişi',
      RU: 'Этап 8: Отгрузка и мультимодальный транзит',
    },
    description: {
      EN: 'Dispatch via refrigerated TIR, Baku-Tbilisi-Kars rail wagon, Caspian Ro-Ro/container vessel, or air cargo charter.',
      AZ: 'Soyuducu TİR, Bakı-Tbilisi-Qars dəmir yolu vaqonu, Xəzər gəmisi və ya hava karqo vasitəsilə göndəriş.',
      RU: 'Отправка рефрижераторами TIR, ж/д составами БТК, морскими контейнерами через Порт Алят или авиафрахтом.',
    },
    deliverable: { EN: 'Live GPS & Transit Manifest', AZ: 'Canlı GPS və Tranzit Manifesti', RU: 'Транзитный манифест и GPS-трекинг' },
    sla: 'Per Corridor',
    authority: 'Middle Corridor Freight Desk',
  },
  {
    number: 9,
    title: { EN: 'Delivery', AZ: 'Çatdırılma', RU: 'Доставка' },
    detailTitle: {
      EN: 'Phase 9: Final Delivery & Settlement Release',
      AZ: 'Mərhələ 9: Yekun Çatdırılma və Hesablaşma',
      RU: 'Этап 9: Приемка груза и закрытие расчетов',
    },
    description: {
      EN: 'Confirmed handover at destination port or warehouse, proof of delivery (POD) verification, and final export proceeds settlement.',
      AZ: 'Təyinat limanında və ya anbarda təhvil-təslim, çatdırılma təsdiqi (POD) və yekun ixrac vəsaitinin hesablaşması.',
      RU: 'Передача груза покупателю в порту или на складе назначения, подписание POD и зачисление экспортной выручки.',
    },
    deliverable: { EN: 'Signed POD & Settlement Advice', AZ: 'Təsdiqlənmiş Təhvil Aktı və Ödəniş', RU: 'Акт приемки POD и валютный расчет' },
    sla: 'Contract Complete',
    authority: 'Settlement & Trade Finance Desk',
  },
  {
    number: 10,
    title: { EN: 'Submit the product RFQ', AZ: 'Məhsul RFQ göndərin', RU: 'Отправка RFQ продукта' },
    detailTitle: {
      EN: 'Phase 10: Final Product RFQ & Dossier Registration',
      AZ: 'Mərhələ 10: Yekun Məhsul RFQ və Dosye Qeydiyyatı',
      RU: 'Этап 10: Итоговая RFQ продукции и регистрация досье',
    },
    description: {
      EN: 'Once export logistics and certification are confirmed, we formalize your product offer via the AZEXBUY RFQ Desk and register your official Producer RFQ Dossier.',
      AZ: 'İxrac logistikası və sertifikatlaşdırma təsdiqləndikdən sonra məhsul təklifinizi AZEXBUY RFQ Masası vasitəsilə rəsmiləşdirib Rəsmi İstehsalçı RFQ Dosyenizi qeydiyyatdan keçiririk.',
      RU: 'После подтверждения экспортной логистики и сертификации мы оформляем ваше предложение продукции через стол заявок AZEXBUY и регистрируем официальное досье RFQ производителя.',
    },
    deliverable: { EN: 'Registered Producer RFQ Dossier Number', AZ: 'Qeydiyyatdan Keçmiş İstehsalçı RFQ Dosye Nömrəsi', RU: 'Зарегистрированный номер досье RFQ производителя' },
    sla: 'Instant (< 15 mins)',
    authority: 'AZEXBUY Producer Onboarding Desk',
  },
];

export const UI_STRINGS: Record<
  Locale,
  {
    nav: {
      home: string;
      forBuyers: string;
      forProducers: string;
      services: string;
      products: string;
      howItWorks: string;
      aboutUs: string;
      insights: string;
      contact: string;
      requestQuote: string;
      dossiers: string;
    };
    hero: {
      kicker: string;
      title: string;
      subtitle: string;
      buyLabel: string;
      buyAction: string;
      exportLabel: string;
      exportAction: string;
    };
    whyAzexbuy: {
      heading: string;
      items: { title: string; desc: string; metric: string }[];
    };
    bilateral: {
      buyersTag: string;
      buyersTitle: string;
      buyersDesc: string;
      buyersBtn: string;
      producersTag: string;
      producersTitle: string;
      producersDesc: string;
      producersBtn: string;
    };
    services: {
      heading: string;
      subheading: string;
      learnMore: string;
      outsourcedTitle: string;
      outsourcedBadge: string;
      outsourcedDesc: string;
      outsourcedCta: string;
    };
    howItWorks: {
      heading: string;
      subheading: string;
      seeFullProcess: string;
      forBuyersLabel: string;
      forProducersLabel: string;
      clickStepHint: string;
    };
    featuredProducts: {
      heading: string;
      subheading: string;
      viewAll: string;
      requestProduct: string;
      hsCodeLabel: string;
    };
    whyAzerbaijan: {
      heading: string;
      desc: string;
      learnMore: string;
      features: { line1: string; line2: string; detail: string }[];
    };
    footer: {
      description: string;
      hqTitle: string;
      hqAddress: string;
      quickLinks: string;
      complianceTitle: string;
      rights: string;
      contactUs: string;
    };
  }
> = {
  EN: {
    nav: {
      home: 'Home',
      forBuyers: 'For Buyers',
      forProducers: 'For Producers',
      services: 'Services',
      products: 'Products',
      howItWorks: 'How It Works',
      aboutUs: 'About Us',
      insights: 'Insights',
      contact: 'Contact',
      requestQuote: 'Request a Quote',
      dossiers: 'Dossiers',
    },
    hero: {
      kicker: 'AZEXBUY',
      title: 'Connecting Azerbaijani Products with Global Buyers',
      subtitle:
        'We help international buyers source high-quality Azerbaijani products and support local producers in reaching global markets.',
      buyLabel: 'I WANT TO BUY',
      buyAction: 'Find a Supplier',
      exportLabel: 'I WANT TO EXPORT',
      exportAction: 'Find a Buyer',
    },
    whyAzexbuy: {
      heading: 'Why AZEXBUY?',
      items: [
        {
          title: 'Verified Suppliers',
          desc: 'We work only with trusted Azerbaijani manufacturers.',
          metric: '250+ Certified Facilities',
        },
        {
          title: 'Global Buyer Access',
          desc: 'We connect you with international buyers.',
          metric: '42 Export Destinations',
        },
        {
          title: 'Market Intelligence',
          desc: 'Data-driven insights for better decisions.',
          metric: 'HS-6 Tariff & Route Data',
        },
        {
          title: 'End-to-End Export',
          desc: 'From sourcing to delivery, we manage the process.',
          metric: 'Incoterms 2020 Desk',
        },
        {
          title: 'International Logistics',
          desc: 'Reliable and efficient transportation solutions.',
          metric: 'Middle Corridor Hub',
        },
      ],
    },
    bilateral: {
      buyersTag: 'FOR BUYERS',
      buyersTitle: 'Source From Azerbaijan',
      buyersDesc:
        "Tell us what you need. We'll find verified suppliers, compare offers and manage the export process.",
      buyersBtn: 'Find a Supplier',
      producersTag: 'FOR PRODUCERS',
      producersTitle: 'Take Your Products Global',
      producersDesc:
        'We help Azerbaijani manufacturers find international buyers and manage the export process from order to final delivery.',
      producersBtn: 'Find a Buyer',
    },
    services: {
      heading: 'Our Services',
      subheading: 'Comprehensive support for your export and sourcing needs.',
      learnMore: 'Learn More',
      outsourcedTitle: 'Outsourced Export Department (Turnkey Trade Desk)',
      outsourcedBadge: 'INSTITUTIONAL MANDATE',
      outsourcedDesc:
        'For Azerbaijani producers seeking complete international trade representation without establishing expensive foreign branches—we act as your dedicated multilingual export division.',
      outsourcedCta: 'Appoint AZEXBUY as Your Export Desk',
    },
    howItWorks: {
      heading: 'How It Works',
      subheading: 'A simple process from request to delivery.',
      seeFullProcess: 'See Full Process',
      forBuyersLabel: 'For Buyers',
      forProducersLabel: 'For Producers',
      clickStepHint: 'Select any phase number to inspect institutional SLA, required documents, and verification protocol.',
    },
    featuredProducts: {
      heading: 'Featured Products',
      subheading: 'Explore a selection of high-quality Azerbaijani products.',
      viewAll: 'View All Products',
      requestProduct: 'Request This Product',
      hsCodeLabel: 'HS Code:',
    },
    whyAzerbaijan: {
      heading: 'Why Azerbaijan?',
      desc: 'Strategic location, rich resources and growing export potential make Azerbaijan an ideal hub for international trade.',
      learnMore: 'Learn More',
      features: [
        {
          line1: 'Strategic',
          line2: 'Location',
          detail: 'Nexus of the Trans-Caspian Middle Corridor linking Europe, Central Asia, CIS, and MENA via Port of Baku (Alat) and BTK Railway.',
        },
        {
          line1: 'Diverse',
          line2: 'Industries',
          detail: '9 climatic zones supporting premium agriculture alongside Sumgayit chemical parks, metallurgy, textiles, and natural stone.',
        },
        {
          line1: 'Quality',
          line2: 'Products',
          detail: 'ISO 22000, GLOBALG.A.P., OEKO-TEX, and API-certified manufacturing backed by strict AQTA phytosanitary traceability.',
        },
        {
          line1: 'Growing',
          line2: 'Export Ecosystem',
          detail: 'Modern free economic zones (AFEZ), green customs corridors, and preferential trade regimes with CIS, Turkey, and EU GSP+.',
        },
      ],
    },
    footer: {
      description:
        'Sovereign Trade & Sourcing Infrastructure Authority connecting verified Azerbaijani manufacturers with institutional global procurement desks.',
      hqTitle: 'Headquarters & Trade Desk',
      hqAddress: 'Baku Alliance Business Center, Heydar Aliyev Ave 95, Baku AZ1033, Republic of Azerbaijan',
      quickLinks: 'Platform & Portals',
      complianceTitle: 'Trade Standards & Governance',
      rights: '© 2026 AZEXBUY Consortium — Azerbaijan Export & Sourcing Facilitation Platform. All rights reserved.',
      contactUs: 'Contact Us',
    },
  },
  AZ: {
    nav: {
      home: 'Ana Səhifə',
      forBuyers: 'Alıcılar Üçün',
      forProducers: 'İstehsalçılar Üçün',
      services: 'Xidmətlər',
      products: 'Məhsullar',
      howItWorks: 'Necə İşləyir',
      aboutUs: 'Haqqımızda',
      insights: 'Analitika',
      contact: 'Əlaqə',
      requestQuote: 'Qiymət Sorğusu',
      dossiers: 'Dosyelər',
    },
    hero: {
      kicker: 'AZEXBUY',
      title: 'Azərbaycan Məhsullarını Qlobal Alıcılarla Birləşdiririk',
      subtitle:
        'Biz beynəlxalq alıcılara yüksək keyfiyyətli Azərbaycan məhsullarını tədarük etməkdə və yerli istehsalçılara qlobal bazarlara çıxmaqda dəstək oluruq.',
      buyLabel: 'ALMAQ İSTƏYİRƏM',
      buyAction: 'Təchizatçı Tap',
      exportLabel: 'İXRAC ETMƏK İSTƏYİRƏM',
      exportAction: 'Alıcı Tap',
    },
    whyAzexbuy: {
      heading: 'Niyə AZEXBUY?',
      items: [
        {
          title: 'Yoxlanılmış Təchizatçılar',
          desc: 'Yalnız etibarlı Azərbaycan istehsalçıları ilə işləyirik.',
          metric: '250+ Sertifikatlı Müəssisə',
        },
        {
          title: 'Qlobal Alıcı Çıxışı',
          desc: 'Sizi beynəlxalq satınalma şəbəkələri ilə əlaqələndiririk.',
          metric: '42 İxrac Ölkəsi',
        },
        {
          title: 'Bazar Analitikası',
          desc: 'Daha dəqiq qərarlar üçün məlumat əsaslı təhlillər.',
          metric: 'HS-6 Tarif və Marşrut Bazası',
        },
        {
          title: 'Tam İxrac İdarəetməsi',
          desc: 'Tədarükdən çatdırılmaya qədər bütün prosesi idarə edirik.',
          metric: 'Incoterms 2020 Masası',
        },
        {
          title: 'Beynəlxalq Logistika',
          desc: 'Etibarlı və səmərəli multimodal nəqliyyat həlləri.',
          metric: 'Orta Dəhliz Mərkəzi',
        },
      ],
    },
    bilateral: {
      buyersTag: 'ALICILAR ÜÇÜN',
      buyersTitle: 'Azərbaycandan Tədarük Edin',
      buyersDesc:
        'Ehtiyacınızı bizə bildirin. Yoxlanılmış təchizatçıları tapacaq, təklifləri müqayisə edəcək və ixrac prosesini idarə edəcəyik.',
      buyersBtn: 'Təchizatçı Tap',
      producersTag: 'İSTEHSALÇILAR ÜÇÜN',
      producersTitle: 'Məhsullarınızı Dünyaya Çıxarın',
      producersDesc:
        'Azərbaycan istehsalçılarına beynəlxalq alıcılar tapmaqda və sifarişdən yekun çatdırılmaya qədər ixracı idarə etməkdə kömək edirik.',
      producersBtn: 'Alıcı Tap',
    },
    services: {
      heading: 'Xidmətlərimiz',
      subheading: 'İxrac və tədarük ehtiyaclarınız üçün hərtərəfli institusional dəstək.',
      learnMore: 'Ətraflı',
      outsourcedTitle: 'Xarici İxrac Departamenti (Tam Təmsilçilik Masası)',
      outsourcedBadge: 'İNSTİTUSİONAL MANDAT',
      outsourcedDesc:
        'Xaricdə bahalı nümayəndəliklər açmadan tam beynəlxalq ticarət təmsilçiliyi axtaran Azərbaycan istehsalçıları üçün peşəkar çoxdilli ixrac şöbəsi kimi fəaliyyət göstəririk.',
      outsourcedCta: 'İxrac Departamentini Aktivləşdir',
    },
    howItWorks: {
      heading: 'Necə İşləyir',
      subheading: 'Sorğudan çatdırılmaya qədər sadə və şəffaf proses.',
      seeFullProcess: 'Tam Prosesə Bax',
      forBuyersLabel: 'Alıcılar Üçün',
      forProducersLabel: 'İstehsalçılar Üçün',
      clickStepHint: 'İnstitusional reqlament, tələb olunan sənədlər və müddətlə tanış olmaq üçün istənilən mərhələni seçin.',
    },
    featuredProducts: {
      heading: 'Seçilmiş Məhsullar',
      subheading: 'Yüksək keyfiyyətli Azərbaycan ixrac məhsulları ilə tanış olun.',
      viewAll: 'Bütün Məhsullar',
      requestProduct: 'Bu Məhsulu Sifariş Et',
      hsCodeLabel: 'HS Kodu:',
    },
    whyAzerbaijan: {
      heading: 'Niyə Azərbaycan?',
      desc: 'Strateji mövqe, zəngin resurslar və artan ixrac potensialı Azərbaycanı beynəlxalq ticarət üçün ideal mərkəzə çevirir.',
      learnMore: 'Ətraflı',
      features: [
        {
          line1: 'Strateji',
          line2: 'Mövqe',
          detail: 'Bakı Limanı (Ələt) və BTQ dəmir yolu vasitəsilə Avropa, Mərkəzi Asiya və Yaxın Şərqi birləşdirən Orta Dəhliz mərkəzi.',
        },
        {
          line1: 'Çoxşaxəli',
          line2: 'Sənaye',
          detail: '9 iqlim qurşağında kənd təsərrüfatı ilə yanaşı Sumqayıt kimya parkları, metallurgiya, tekstil və təbii daş sənayesi.',
        },
        {
          line1: 'Keyfiyyətli',
          line2: 'Məhsullar',
          detail: 'AQTA fitosanitar izlənilməsi ilə dəstəklənən ISO 22000, GLOBALG.A.P., OEKO-TEX və API sertifikatlı istehsalat.',
        },
        {
          line1: 'Böyüyən',
          line2: 'İxrac Ekosistemi',
          detail: 'Ələt Azad İqtisadi Zonası, yaşıl gömrük dəhlizi və MDB, Türkiyə və Aİ GSP+ ilə güzəştli ticarət rejimləri.',
        },
      ],
    },
    footer: {
      description:
        'Yoxlanılmış Azərbaycan istehsalçılarını qlobal korporativ satınalma mərkəzləri ilə birləşdirən milli ixrac və tədarük platforması.',
      hqTitle: 'Baş Ofis və Ticarət Masası',
      hqAddress: 'Bakı Alyans Biznes Mərkəzi, Heydər Əliyev pr. 95, Bakı AZ1033, Azərbaycan Respublikası',
      quickLinks: 'Platforma Bölmələri',
      complianceTitle: 'Ticarət Standartları',
      rights: '© 2026 AZEXBUY Konsorsiumu — Azərbaycan İxrac və Tədarük Platforması. Bütün hüquqlar qorunur.',
      contactUs: 'Bizimlə Əlaqə',
    },
  },
  RU: {
    nav: {
      home: 'Главная',
      forBuyers: 'Покупателям',
      forProducers: 'Производителям',
      services: 'Услуги',
      products: 'Продукция',
      howItWorks: 'Как это работает',
      aboutUs: 'О платформе',
      insights: 'Аналитика',
      contact: 'Контакты',
      requestQuote: 'Запросить котировку',
      dossiers: 'Досье',
    },
    hero: {
      kicker: 'AZEXBUY',
      title: 'Связываем продукцию Азербайджана с мировыми закупщиками',
      subtitle:
        'Помогаем международным компаниям закупать качественную азербайджанскую продукцию и поддерживаем местных производителей при выходе на мировые рынки.',
      buyLabel: 'Я ХОЧУ КУПИТЬ',
      buyAction: 'Найти поставщика',
      exportLabel: 'Я ХОЧУ ЭКСПОРТИРОВАТЬ',
      exportAction: 'Найти покупателя',
    },
    whyAzexbuy: {
      heading: 'Почему AZEXBUY?',
      items: [
        {
          title: 'Проверенные поставщики',
          desc: 'Работаем только с сертифицированными производителями Азербайджана.',
          metric: '250+ проверенных фабрик',
        },
        {
          title: 'Глобальная сеть закупщиков',
          desc: 'Прямой выход на международных корпоративных импортеров.',
          metric: '42 страны экспорта',
        },
        {
          title: 'Торговая аналитика',
          desc: 'Данные по тарифам, ТН ВЭД и маршрутам для точных решений.',
          metric: 'База тарифов ТН ВЭД',
        },
        {
          title: 'Экспорт под ключ',
          desc: 'От подбора поставщика до таможни и доставки на ваш склад.',
          metric: 'Сопровождение Incoterms 2020',
        },
        {
          title: 'Международная логистика',
          desc: 'Надежные мультимодальные решения по Среднему коридору.',
          metric: 'Хаб Среднего коридора',
        },
      ],
    },
    bilateral: {
      buyersTag: 'ДЛЯ ПОКУПАТЕЛЕЙ',
      buyersTitle: 'Закупки из Азербайджана',
      buyersDesc:
        'Сообщите нам ваши требования. Мы подберем проверенных производителей, сравним оферты и организуем экспорт под ключ.',
      buyersBtn: 'Найти поставщика',
      producersTag: 'ДЛЯ ПРОИЗВОДИТЕЛЕЙ',
      producersTitle: 'Выведите продукцию на мировой рынок',
      producersDesc:
        'Помогаем азербайджанским фабрикам и агрокластерам находить зарубежных покупателей и сопровождаем сделку до доставки.',
      producersBtn: 'Найти покупателя',
    },
    services: {
      heading: 'Наши услуги',
      subheading: 'Комплексная институциональная поддержка экспорта и международных закупок.',
      learnMore: 'Подробнее',
      outsourcedTitle: 'Внешний отдел экспорта (Торговое представительство под ключ)',
      outsourcedBadge: 'ИНСТИТУЦИОНАЛЬНЫЙ МАНДАТ',
      outsourcedDesc:
        'Для производителей Азербайджана, которым требуется полноценный международный отдел продаж без затрат на зарубежные филиалы — берем на себя ВЭД, переговоры и контрактацию.',
      outsourcedCta: 'Подключить внешний отдел экспорта',
    },
    howItWorks: {
      heading: 'Как это работает',
      subheading: 'Прозрачный регламентированный процесс от заявки до поставки.',
      seeFullProcess: 'Весь процесс',
      forBuyersLabel: 'Для покупателей',
      forProducersLabel: 'Для производителей',
      clickStepHint: 'Нажмите на любой номер этапа, чтобы открыть регламент SLA, список документов и орган верификации.',
    },
    featuredProducts: {
      heading: 'Экспортный каталог',
      subheading: 'Ключевые экспортные товары и сырье из регионов Азербайджана.',
      viewAll: 'Все товары',
      requestProduct: 'Запросить продукт',
      hsCodeLabel: 'Код ТН ВЭД:',
    },
    whyAzerbaijan: {
      heading: 'Почему Азербайджан?',
      desc: 'Стратегическое расположение, богатые ресурсы и развитая экспортная инфраструктура делают Азербайджан ключевым торговым хабом Евразии.',
      learnMore: 'Подробнее',
      features: [
        {
          line1: 'Стратегическая',
          line2: 'локация',
          detail: 'Узел Транскаспийского Среднего коридора (ТМТМ), связывающий Европу, Центральную Азию и Ближний Восток через Порт Алят и ж/д БТК.',
        },
        {
          line1: 'Развитая',
          line2: 'индустрия',
          detail: '9 климатических зон для агропрома, Сумгайытский химический парк, металлургия, текстильные кластеры и природный камень.',
        },
        {
          line1: 'Высокое',
          line2: 'качество',
          detail: 'Сертификация ISO 22000, GLOBALG.A.P., OEKO-TEX и API при государственном фитосанитарном контроле AQTA.',
        },
        {
          line1: 'Экспортная',
          line2: 'экосистема',
          detail: 'Свободная экономическая зона Алят (AFEZ), зеленый таможенный коридор и преференциальные режимы со странами СНГ, Турцией и ЕС.',
        },
      ],
    },
    footer: {
      description:
        'Национальная платформа содействия экспорту и международным закупкам, соединяющая производителей Азербайджана с мировыми импортерами.',
      hqTitle: 'Штаб-квартира и Торговый стол',
      hqAddress: 'Baku Alliance Business Center, пр. Гейдара Алиева 95, Баку AZ1033, Азербайджанская Республика',
      quickLinks: 'Разделы платформы',
      complianceTitle: 'Стандарты и комплаенс',
      rights: '© 2026 Консорциум AZEXBUY — Платформа экспорта и закупок Азербайджана. Все права защищены.',
      contactUs: 'Свяжитесь с нами',
    },
  },
  TR: {
    nav: {
      home: 'Ana Sayfa',
      forBuyers: 'Alıcılar İçin',
      forProducers: 'Üreticiler İçin',
      services: 'Hizmetler',
      products: 'Ürünler',
      howItWorks: 'Nasıl Çalışır',
      aboutUs: 'Hakkımızda',
      insights: 'Analizler',
      contact: 'İletişim',
      requestQuote: 'Teklif İste',
      dossiers: 'Ticaret Dosyaları',
    },
    hero: {
      kicker: 'AZERBAYCAN RESMİ İHRACAT VE TEDARİK AĞI',
      title: 'Azerbaycan İhracatında Güvenilir Çözüm Ortağınız',
      subtitle:
        'Uluslararası kurumsal alıcıları doğrulanmış Azerbaycan üreticileriyle buluşturuyor, Orta Koridor üzerinden tedarikten nihai teslimata kadar tüm süreci koordine ediyoruz.',
      buyLabel: 'ÜRÜN ALMAK İSTİYORUM',
      buyAction: 'Tedarikçi Bul',
      exportLabel: 'İHRACAT YAPMAK İSTİYORUM',
      exportAction: 'Alıcı Bul',
    },
    whyAzexbuy: {
      heading: 'Neden AZEXBUY?',
      items: [
        {
          title: 'Doğrulanmış Üreticiler',
          desc: 'Yalnızca denetlenmiş ve sertifikalı Azerbaycan üreticileriyle çalışıyoruz.',
          metric: '250+ Akredite Tesis',
        },
        {
          title: 'Küresel Alıcı Erişimi',
          desc: 'Ürünlerinizi uluslararası kurumsal tedarik ağlarıyla buluşturuyoruz.',
          metric: '42 İhracat Pazarı',
        },
        {
          title: 'Pazar İstihbaratı',
          desc: 'Doğru kararlar için veri odaklı tarife ve rota analizleri sunuyoruz.',
          metric: 'HS-6 Tarife Veritabanı',
        },
        {
          title: 'Uçtan Uca İhracat Yönetimi',
          desc: 'Tedarikten gümrüklemeye ve lojistiğe kadar tüm aşamaları üstleniyoruz.',
          metric: 'Incoterms 2020 Masası',
        },
        {
          title: 'Uluslararası Lojistik',
          desc: 'Orta Koridor ve Bakü-Tiflis-Kars hattı ile güvenilir multimodal çözümler.',
          metric: 'Orta Koridor Transit Merkezi',
        },
      ],
    },
    bilateral: {
      buyersTag: 'ALICILAR İÇİN',
      buyersTitle: 'Azerbaycan’dan Güvenle Tedarik Edin',
      buyersDesc:
        'Talebinizi iletin; doğrulanmış üreticileri bulalım, teklifleri karşılaştıralım ve ihracat sürecini sizin adınıza yönetelim.',
      buyersBtn: 'Tedarikçi Bul',
      producersTag: 'ÜRETİCİLER İÇİN',
      producersTitle: 'Ürünlerinizi Dünya Pazarlarına Taşıyın',
      producersDesc:
        'Azerbaycanlı üreticilerin küresel alıcılara ulaşmasına ve siparişten teslime kadar tüm ihracat sürecini yönetmesine yardımcı oluyoruz.',
      producersBtn: 'Alıcı Bul',
    },
    services: {
      heading: 'Hizmetlerimiz',
      subheading: 'İhracat ve tedarik süreçleriniz için kapsamlı kurumsal destek.',
      learnMore: 'Detaylar',
      outsourcedTitle: 'Dış Kaynaklı İhracat Departmanı (Anahtar Teslim Masa)',
      outsourcedBadge: 'KURUMSAL MANDAT',
      outsourcedDesc:
        'Yurt dışında pahalı ofisler açmadan doğrudan küresel satış yapmak isteyen Azerbaycanlı üreticiler için çok dilli ihracat departmanı olarak hizmet veriyoruz.',
      outsourcedCta: 'İhracat Departmanını Başlat',
    },
    howItWorks: {
      heading: 'Nasıl Çalışır',
      subheading: 'Talepten teslimata kadar şeffaf, hızlı ve güvenli ticaret süreci.',
      seeFullProcess: 'Tüm Süreci İncele',
      forBuyersLabel: 'Alıcılar İçin Yol Haritası (7 Adım)',
      forProducersLabel: 'Üreticiler İçin Yol Haritası (10 Aşama)',
      clickStepHint: 'SLA sürelerini ve yetkili kurumları görmek için herhangi bir adıma tıklayın.',
    },
    featuredProducts: {
      heading: 'Öne Çıkan İhracat Kataloğu',
      subheading: 'Azerbaycan bölgelerinden doğrudan tedarik edilen yüksek kaliteli ürünler.',
      viewAll: 'Tüm Ürünleri İncele',
      requestProduct: 'Bu Ürün İçin Teklif Al',
      hsCodeLabel: 'GTİP / HS Kodu:',
    },
    whyAzerbaijan: {
      heading: 'Neden Azerbaycan?',
      desc: 'Stratejik konumu, verimli toprakları ve modern sanayi altyapısıyla Azerbaycan, Avrasya’nın en hızlı büyüyen ticaret kapısıdır.',
      learnMore: 'Detaylı Bilgi',
      features: [
        {
          line1: 'Stratejik',
          line2: 'Konum',
          detail: 'Orta Koridor (TITR) kavşağında Bakü Alat Limanı ve BTK demiryolu ile Avrupa ve Asya’ya doğrudan bağlantı.',
        },
        {
          line1: 'Çeşitli',
          line2: 'Sanayi',
          detail: '9 farklı iklim kuşağında yüksek kaliteli tarım ürünleri, Sumgayıt sanayi parkları, metal ve doğal taş.',
        },
        {
          line1: 'Yüksek',
          line2: 'Kalite',
          detail: 'AQTA gıda güvenliği denetimleri, ISO 22000, Helal ve CE uygunluk sertifikasyonu.',
        },
        {
          line1: 'İhracat',
          line2: 'Ekosistemi',
          detail: 'Alat Serbest Ticaret Bölgesi (AFEZ), Dijital Yeşil Koridor gümrükleme ve serbest ticaret anlaşmaları.',
        },
      ],
    },
    footer: {
      description:
        'Azerbaycan üreticilerini uluslararası kurumsal alıcılarla buluşturan egemen dijital ihracat ve tedarik platformu.',
      hqTitle: 'Genel Merkez & Ticaret Masası',
      hqAddress: 'Baku Alliance Business Center, Haydar Aliyev Cad. 95, Bakü AZ1033, Azerbaycan',
      quickLinks: 'Hızlı Bağlantılar',
      complianceTitle: 'Uyumluluk ve Standartlar',
      rights: '© 2026 AZEXBUY Konsorsiyumu — Azerbaycan İhracat ve Tedarik Portalı. Tüm hakları saklıdır.',
      contactUs: 'İletişim',
    },
  },
  AR: {
    nav: {
      home: 'الرئيسية',
      forBuyers: 'للمشترين',
      forProducers: 'للمنتجين',
      services: 'الخدمات',
      products: 'المنتجات',
      howItWorks: 'كيف يعمل',
      aboutUs: 'من نحن',
      insights: 'التقارير والرؤى',
      contact: 'اتصل بنا',
      requestQuote: 'طلب عرض سعر',
      dossiers: 'ملفات التجارة',
    },
    hero: {
      kicker: 'البوابة الرقمية الرسمية لصادرات وتوريد أذربيجان',
      title: 'شريككم المؤسسي الموثوق للتصدير والتوريد من أذربيجان',
      subtitle:
        'نربط مسؤولي المشتريات والشركات العالمية بأفضل المصنعين والمنتجين المعتمدين في أذربيجان مع تنسيق لوجستي كامل عبر الممر الأوسط.',
      buyLabel: 'أريد الشراء',
      buyAction: 'البحث عن مورد',
      exportLabel: 'أريد التصدير',
      exportAction: 'البحث عن مشترٍ',
    },
    whyAzexbuy: {
      heading: 'لماذا AZEXBUY؟',
      items: [
        {
          title: 'موردون موثقون',
          desc: 'نتعامل حصرياً مع منتجين معتمدين ومفحوصين في أذربيجان.',
          metric: '250+ مصنع معتمد',
        },
        {
          title: 'وصول للمشترين عالمياً',
          desc: 'ربط مباشر مع شبكات المشتريات الدولية وسلاسل الإمداد.',
          metric: '42 وجهة تصدير',
        },
        {
          title: 'دراسات السوق والتعريفات',
          desc: 'بيانات دقيقة للتعريفات الجمركية ومسارات النقل الدولي.',
          metric: 'قاعدة بيانات HS-6',
        },
        {
          title: 'إدارة تصدير شاملة',
          desc: 'إشراف كامل من إعداد البضائع حتى الشحن والتخليص النهائي.',
          metric: 'مكتب شروط التجارة 2020',
        },
        {
          title: 'لوجستيات دولية',
          desc: 'حلول شحن متعددة الوسائط موثوقة عبر الممر الأوسط وميناء باكو.',
          metric: 'مركز الممر الأوسط',
        },
      ],
    },
    bilateral: {
      buyersTag: 'للمشترين الدوليين',
      buyersTitle: 'توريد معتمد ومباشر من أذربيجان',
      buyersDesc:
        'شاركنا متطلباتكم؛ سنحدد الموردين المعتمدين، ونقارن عروض الأسعار، وندير إجراءات التصدير والتسليم نيابة عنكم.',
      buyersBtn: 'ابحث عن مورد',
      producersTag: 'للمنتجين المحليين',
      producersTitle: 'انطلق بمنتجاتك إلى الأسواق العالمية',
      producersDesc:
        'نساعد المصنعين في أذربيجان على الوصول إلى مشترين دوليين موثوقين وإدارة كامل خطوات التصدير من العقد إلى التسليم.',
      producersBtn: 'ابحث عن مشترٍ',
    },
    services: {
      heading: 'خدماتنا المؤسسية',
      subheading: 'دعم استراتيجي وتنفيذي شامل لعمليات التصدير والتوريد الدولي.',
      learnMore: 'المزيد',
      outsourcedTitle: 'قسم التصدير الخارجي المتكامل',
      outsourcedBadge: 'تفويض مؤسسي',
      outsourcedDesc:
        'نعمل كفريق تصدير احترافي متعدد اللغات للمنتجين في أذربيجان، متكفلين بالمفاوضات الدولية دون الحاجة لفتح مكاتب مكلفة في الخارج.',
      outsourcedCta: 'تفعيل قسم التصدير',
    },
    howItWorks: {
      heading: 'كيف نعمل',
      subheading: 'إجراءات واضحة وسريعة من استلام الطلب حتى التسليم النهائي.',
      seeFullProcess: 'عرض العملية كاملة',
      forBuyersLabel: 'مسار المشترين (7 خطوات)',
      forProducersLabel: 'مسار المنتجين (10 مراحل)',
      clickStepHint: 'انقر على أي مرحلة لعرض مدة التنفيذ والمستندات المطلوبة.',
    },
    featuredProducts: {
      heading: 'كتالوج الصادرات الرئيسي',
      subheading: 'منتجات استراتيجية عالية الجودة مباشرة من مناطق الإنتاج في أذربيجان.',
      viewAll: 'عرض الكتالوج بالكامل',
      requestProduct: 'طلب تسعير لهذا المنتج',
      hsCodeLabel: 'رمز النظام المنسق (HS):',
    },
    whyAzerbaijan: {
      heading: 'لماذا أذربيجان؟',
      desc: 'بموقعها الاستراتيجي على الممر الأوسط وثرواتها الطبيعية وصناعاتها المتطورة، تمثل أذربيجان بوابة التوريد المثالية.',
      learnMore: 'اكتشف المزيد',
      features: [
        {
          line1: 'موقع',
          line2: 'استراتيجي',
          detail: 'ملتقى طرق التجارة بين آسيا وأوروبا عبر ميناء باكو ألات وخط سكة حديد باكو-تبليسي-كارس.',
        },
        {
          line1: 'تنوع',
          line2: 'صناعي',
          detail: 'منتجات زراعية فريدة عبر 9 مناطق مناخية، مجمعات سومقاييت للصناعات الكيماوية والصلب والرخام.',
        },
        {
          line1: 'معايير',
          line2: 'عالية',
          detail: 'رقابة غذائية صارمة من وكالة AQTA وشهادات ISO 22000 وشهادات حلال المعتمدة دولياً.',
        },
        {
          line1: 'بيئة',
          line2: 'تصدير متقدمة',
          detail: 'منطقة ألات الحرة (AFEZ) والممر الجمركي الأخضر واتفاقيات التجارة الحرة الإقليمية.',
        },
      ],
    },
    footer: {
      description:
        'المنصة الوطنية الميسرة للتصدير والتوريد الدولي، تربط المنتجين في أذربيجان بكبرى الشركات حول العالم.',
      hqTitle: 'المقر الرئيسي ومكتب التداول',
      hqAddress: 'مركز باكو ألاينس للأعمال، شارع حيدر علييف 95، باكو AZ1033، جمهورية أذربيجان',
      quickLinks: 'روابط المنصة',
      complianceTitle: 'الامتثال والمعايير الدولية',
      rights: '© 2026 تحالف AZEXBUY — منصة التصدير والتوريد الأذربيجانية. جميع الحقوق محفوظة.',
      contactUs: 'اتصل بنا',
    },
  },
  ES: {
    nav: {
      home: 'Inicio',
      forBuyers: 'Para Compradores',
      forProducers: 'Para Productores',
      services: 'Servicios',
      products: 'Productos',
      howItWorks: 'Cómo Funciona',
      aboutUs: 'Sobre Nosotros',
      insights: 'Análisis y Noticias',
      contact: 'Contacto',
      requestQuote: 'Solicitar Cotización',
      dossiers: 'Expedientes Comerciales',
    },
    hero: {
      kicker: 'PORTAL SOBERANO DE EXPORTACIÓN Y SUMINISTRO DE AZERBAIYÁN',
      title: 'Su Socio Institucional de Confianza para el Suministro desde Azerbaiyán',
      subtitle:
        'Conectamos a compradores internacionales con productores verificados de Azerbaiyán, coordinando contratos, certificaciones y logística a lo largo del Corredor Medio.',
      buyLabel: 'QUIERO COMPRAR',
      buyAction: 'Buscar Proveedor',
      exportLabel: 'QUIERO EXPORTAR',
      exportAction: 'Buscar Comprador',
    },
    whyAzexbuy: {
      heading: '¿Por qué AZEXBUY?',
      items: [
        {
          title: 'Proveedores Verificados',
          desc: 'Trabajamos exclusivamente con productores inspeccionados y certificados.',
          metric: '250+ Plantas Auditadas',
        },
        {
          title: 'Alcance Global de Compradores',
          desc: 'Acceso directo a redes internacionales de compras corporativas.',
          metric: '42 Destinos de Exportación',
        },
        {
          title: 'Inteligencia de Mercado',
          desc: 'Análisis arancelarios y de rutas para optimizar decisiones comerciales.',
          metric: 'Base de Datos HS-6',
        },
        {
          title: 'Gestión Integral de Exportación',
          desc: 'Coordinamos desde la negociación hasta el despacho aduanero y la entrega.',
          metric: 'Mesa Incoterms 2020',
        },
        {
          title: 'Logística Internacional',
          desc: 'Soluciones multimodales fiables a través del Corredor Medio y el Puerto de Bakú.',
          metric: 'Centro de Tránsito TITR',
        },
      ],
    },
    bilateral: {
      buyersTag: 'PARA COMPRADORES',
      buyersTitle: 'Abastecimiento Confiable desde Azerbaiyán',
      buyersDesc:
        'Comparta sus especificaciones; identificamos proveedores homologados, comparamos ofertas y gestionamos el despacho completo.',
      buyersBtn: 'Buscar Proveedor',
      producersTag: 'PARA PRODUCTORES',
      producersTitle: 'Lleve sus Productos al Mercado Global',
      producersDesc:
        'Asistimos a los fabricantes azerbaiyanos a conectar con importadores y gestionar todo el proceso de exportación.',
      producersBtn: 'Buscar Comprador',
    },
    services: {
      heading: 'Nuestros Servicios',
      subheading: 'Soporte institucional integral para sus requerimientos de exportación y suministro.',
      learnMore: 'Saber Más',
      outsourcedTitle: 'Departamento de Exportación Externalizado',
      outsourcedBadge: 'MANDATO INSTITUCIONAL',
      outsourcedDesc:
        'Operamos como su equipo comercial internacional multilingüe, gestionando negociaciones y ventas sin incurrir en costes fijos en el extranjero.',
      outsourcedCta: 'Activar Departamento',
    },
    howItWorks: {
      heading: 'Cómo Funciona',
      subheading: 'Proceso ágil, estructurado y transparente desde la solicitud hasta el destino final.',
      seeFullProcess: 'Ver Proceso Completo',
      forBuyersLabel: 'Ruta para Compradores (7 Pasos)',
      forProducersLabel: 'Ruta para Productores (10 Fases)',
      clickStepHint: 'Haga clic en cualquier paso para ver tiempos de respuesta (SLA) y documentos requeridos.',
    },
    featuredProducts: {
      heading: 'Catálogo de Exportación',
      subheading: 'Materias primas y productos de alta calidad originarios de las regiones de Azerbaiyán.',
      viewAll: 'Ver Todo el Catálogo',
      requestProduct: 'Cotizar este Producto',
      hsCodeLabel: 'Código Arancelario (HS):',
    },
    whyAzerbaijan: {
      heading: '¿Por qué Azerbaiyán?',
      desc: 'Ubicación privilegiada en el Corredor Medio, rica producción agroindustrial y logística moderna como nexo euroasiático.',
      learnMore: 'Conozca Más',
      features: [
        {
          line1: 'Ubicación',
          line2: 'Estratégica',
          detail: 'Eje del Corredor Medio (TITR) que conecta Asia y Europa a través del Puerto de Alat y el ferrocarril BTK.',
        },
        {
          line1: 'Industrias',
          line2: 'Diversas',
          detail: '9 zonas climáticas para agricultura de alta gama, polímeros de Sumgayit, metales y piedra natural.',
        },
        {
          line1: 'Calidad',
          line2: 'Certificada',
          detail: 'Inspección fitosanitaria AQTA, certificaciones ISO 22000, GlobalG.A.P., Halal y CE.',
        },
        {
          line1: 'Ecosistema',
          line2: 'de Exportación',
          detail: 'Zona Franca de Alat (AFEZ), Corredor Aduanero Verde y acuerdos de libre comercio.',
        },
      ],
    },
    footer: {
      description:
        'Puerta de enlace soberana para la facilitación del comercio exterior y aprovisionamiento entre Azerbaiyán y el mundo.',
      hqTitle: 'Sede Central y Mesa Comercial',
      hqAddress: 'Baku Alliance Business Center, Av. Heydar Aliyev 95, Bakú AZ1033, Azerbaiyán',
      quickLinks: 'Enlaces Rápidos',
      complianceTitle: 'Cumplimiento y Normativa',
      rights: '© 2026 Consorcio AZEXBUY — Plataforma de Exportación y Suministro de Azerbaiyán. Todos los derechos reservados.',
      contactUs: 'Contáctenos',
    },
  },
};

export const INCOTERMS_GUIDE = [
  {
    code: 'EXW' as const,
    name: 'Ex Works (Named Factory / Agro-Cluster)',
    sellerScope: 'Packaging & export-ready palletization at factory gate (Zaqatala, Goychay, Sumgayit).',
    buyerScope: 'Loading, domestic haulage, export customs, main freight, insurance, and destination import.',
    recommendedFor: 'Buyers with existing Azerbaijan freight forwarders or consolidated TIR fleets.',
  },
  {
    code: 'FCA' as const,
    name: 'Free Carrier (Baku Dry Port / BTK Rail Terminal)',
    sellerScope: 'Export customs clearance (DGK Green Corridor), AQTA phytosanitary & CT-1/EUR.1 certificates, handover to carrier.',
    buyerScope: 'Main rail/road/air carriage, transit insurance, and destination import clearance.',
    recommendedFor: 'Standard containerized rail (BTK) and road (TIR) shipments to CIS, Turkey, and Europe.',
  },
  {
    code: 'FOB' as const,
    name: 'Free On Board (Port of Baku at Alat / Poti / Batumi)',
    sellerScope: 'Full export clearance, domestic transit to port, terminal handling (THC), and loading onboard vessel.',
    buyerScope: 'Maritime freight, marine insurance, and destination discharge.',
    recommendedFor: 'Bulk urea, structural steel, marble slabs, and multi-container sea shipments.',
  },
  {
    code: 'CIF' as const,
    name: 'Cost, Insurance & Freight (Named Destination Port)',
    sellerScope: 'All export formalities, sea/multimodal freight to destination port, and 110% All-Risk marine insurance.',
    buyerScope: 'Destination port unloading, import customs duties, and inland haulage.',
    recommendedFor: 'Global enterprise buyers in MENA, EU Mediterranean ports, and Asia.',
  },
  {
    code: 'DAP' as const,
    name: 'Delivered At Place (Buyer Warehouse / Terminal)',
    sellerScope: 'Turnkey door-to-door multimodal logistics via Middle Corridor right to buyer warehouse (unloading excluded).',
    buyerScope: 'Import customs clearance, local VAT/tariffs, and final unloading at destination dock.',
    recommendedFor: 'European and GCC retail chains ordering cold-chain pomegranates, hazelnuts, and sunflower oil.',
  },
  {
    code: 'DDP' as const,
    name: 'Delivered Duty Paid (Full Turnkey Delivery)',
    sellerScope: 'End-to-end delivery including export & destination customs clearance via AZEXBUY Outsourced Trade Desk.',
    buyerScope: 'Receiving goods at designated facility.',
    recommendedFor: 'High-value Azerbaijani carpets, bespoke architectural stone, and sample consignments.',
  },
];

export const CORRIDOR_ROUTES = [
  {
    id: 'titr-eu',
    name: {
      EN: 'Middle Corridor (TITR) -> Black Sea -> Central Europe',
      AZ: 'Orta Dəhliz (TİTR) -> Qara Dəniz -> Mərkəzi Avropa',
      RU: 'Средний коридор (ТМТМ) -> Черное море -> Центральная Европа',
    },
    path: 'Baku (Alat) -> Tbilisi -> Poti/Batumi -> Constanta -> Duisburg / Vienna',
    mode: 'Rail + Feeder Vessel / Ro-Ro',
    transitDays: '11–14 Days',
    idealCommodities: 'Hazelnuts (080222), Marble (2515), Cotton Yarn (5205), Steel (7306)',
  },
  {
    id: 'btk-med',
    name: {
      EN: 'Baku-Tbilisi-Kars (BTK) Railway -> Mersin -> Global Sea Ports',
      AZ: 'Bakı-Tbilisi-Qars (BTQ) Dəmir Yolu -> Mersin -> Qlobal Limanlar',
      RU: 'Ж/д Баку-Тбилиси-Карс (БТК) -> Порт Мерсин -> Мировые порты',
    },
    path: 'Sumgayit / Baku -> Akhalkalaki -> Kars -> Mersin Port -> MENA / EU / Americas',
    mode: 'Block Train + Deep-Sea Container',
    transitDays: '8–12 Days (to Mersin)',
    idealCommodities: 'Sunflower Oil (151219), Urea & Polymers (310210), Metal Profiles (7306)',
  },
  {
    id: 'caspian-ca',
    name: {
      EN: 'Trans-Caspian Sea Route -> Aktau / Turkmenbashi -> Central Asia',
      AZ: 'Trans-Xəzər Dəniz Xətti -> Aktau / Türkmənbaşı -> Mərkəzi Asiya',
      RU: 'Транскаспийский морской маршрут -> Актау / Туркменбаши -> ЦА',
    },
    path: 'Port of Baku (Alat) -> Aktau / Turkmenbashi -> Almaty / Tashkent',
    mode: 'Caspian Ro-Ro Ferry + Rail/TIR',
    transitDays: '4–7 Days',
    idealCommodities: 'Fresh Pomegranates (081090), Persimmons (081070), Processed Food',
  },
  {
    id: 'air-cargo-gyd',
    name: {
      EN: 'Heydar Aliyev Int. Cargo Hub (GYD) -> GCC, EU & East Asia',
      AZ: 'Heydər Əliyev Beynəlxalq Hava Karqo Mərkəzi (GYD) -> Körfəz, Aİ və Asiya',
      RU: 'Авиакарго хаб Баку (GYD) -> Персидский залив, ЕС и Азия',
    },
    path: 'Baku (GYD Silk Way Cargo Hub) -> Dubai / Frankfurt / Shanghai / London',
    mode: 'Direct Wide-Body Freighter',
    transitDays: '1–2 Days',
    idealCommodities: 'Hand-Knotted Silk Carpets (5701), Organic Fresh Produce, Commercial Samples',
  },
];

export const DEFAULT_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'tm-001',
    name: 'Ali Əhmədov',
    role: {
      AZ: 'Baş İcraçı Direktor',
      EN: 'Chief Executive Officer',
      TR: 'Genel Müdür',
      RU: 'Генеральный директор',
      AR: 'الرئيس التنفيذي',
      ES: 'Director Ejecutivo',
    },
    bio: {
      AZ: 'Beynəlxalq ticarət və ixrac sahəsində 15 ildən çox təcrübəyə malik. AZEXBUY-un quruluşundan bəri şirkətin inkişafına rəhbərlik edir.',
      EN: 'Over 15 years of experience in international trade and export. Leading the strategic growth and global partnerships of AZEXBUY.',
      TR: 'Uluslararası ticaret ve ihracat alanında 15 yılı aşkın deneyime sahip. AZEXBUY\'un kuruluşundan bu yana gelişimine liderlik etmektedir.',
      RU: 'Более 15 лет опыта в международной торговле и экспорте. Руководит стратегическим развитием и партнерствами AZEXBUY.',
      AR: 'أكثر من 15 عاماً من الخبرة في التجارة الدولية والتصدير. يقود التوسع والشركات الاستراتيجية لـ AZEXBUY.',
      ES: 'Más de 15 años de experiencia en comercio internacional y exportación. Lidera el desarrollo y las alianzas de AZEXBUY.',
    },
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    email: 'ceo@azexbuy.com',
    linkedin: 'https://linkedin.com',
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 'tm-002',
    name: 'Leyla Hüseynova',
    role: {
      AZ: 'İxrac Əməliyyatları Direktoru',
      EN: 'Director of Export Operations',
      TR: 'İhracat Operasyonları Direktörü',
      RU: 'Директор по экспортным операциям',
      AR: 'مديرة عمليات التصدير',
      ES: 'Directora de Operaciones de Exportación',
    },
    bio: {
      AZ: 'Sertifikasiya, gömrük prosedurları və beynəlxalq lojistika sahəsində ixtisaslaşmış. 10 ildən çox sahə təcrübəsi var.',
      EN: 'Specializes in product certification, customs regulations, and multimodal logistics across EU and GCC corridors.',
      TR: 'Sertifikasyon, gümrük prosedürleri ve uluslararası lojistik alanında uzmanlaşmış. 10 yılı aşkın saha tecrübesi bulunmaktadır.',
      RU: 'Специализируется на сертификации, таможенных процедурах и международной логистике по коридорам ЕС и Персидского залива.',
      AR: 'متخصصة في الشهادات والإجراءات الجمركية والخدمات اللوجستية الدولية متعددة الوسائط.',
      ES: 'Especializada en certificación, regulaciones aduaneras y logística internacional.',
    },
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
    email: 'export@azexbuy.com',
    linkedin: 'https://linkedin.com',
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 'tm-003',
    name: 'Murad Quliyev',
    role: {
      AZ: 'Bazar Araşdırması və Alıcı Əlaqələri',
      EN: 'Market Research & Buyer Relations',
      TR: 'Pazar Araştırması ve Alıcı İlişkileri',
      RU: 'Исследование рынков и работа с покупателями',
      AR: 'بحوث السوق وعلاقات المشترين',
      ES: 'Investigación de Mercado y Relaciones con Compradores',
    },
    bio: {
      AZ: 'Avropa, Körfəz və Asiya bazarlarında alıcı axtarışı və kommersiya danışıqlarında ixtisaslaşmışdır.',
      EN: 'Focuses on buyer sourcing, market intelligence, and structured commercial negotiations in European and Asian markets.',
      TR: 'Avrupa, Körfez ve Asya pazarlarında alıcı arama ve ticari müzakerelerde uzmanlaşmıştır.',
      RU: 'Специализируется на поиске покупателей, анализе рынков и коммерческих переговорах на европейских и азиатских рынках.',
      AR: 'متخصص في البحث عن المشترين والتفاوض التجاري في الأسواق الأوروبية وأسواق الخليج وآسيا.',
      ES: 'Especializado en búsqueda de compradores y negociaciones comerciales en mercados internacionales.',
    },
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
    email: 'buyers@azexbuy.com',
    linkedin: 'https://linkedin.com',
    sortOrder: 3,
    isActive: true,
  },
  {
    id: 'tm-004',
    name: 'Nərgiz Məmmədova',
    role: {
      AZ: 'Keyfiyyət və Uyğunluq Mütəxəssisi',
      EN: 'Quality & Compliance Specialist',
      TR: 'Kalite ve Uygunluk Uzmanı',
      RU: 'Специалист по качеству и соответствию',
      AR: 'أخصائية الجودة والامتثال',
      ES: 'Especialista en Calidad y Cumplimiento',
    },
    bio: {
      AZ: 'ISO, HACCP, Halal və GlobalGAP standartları üzrə yoxlama və akkreditasiya proseslərini idarə edir.',
      EN: 'Oversees product audit, AQTA phytosanitary licensing, and international conformity assessments (ISO, GlobalGAP, Halal).',
      TR: 'ISO, HACCP, Helal ve GlobalGAP standartları üzere denetim ve akreditasyon süreçlerini yönetir.',
      RU: 'Курирует проверку стандартов качества, фитосанитарные сертификаты AQTA и международный комплаенс.',
      AR: 'تشرف على معايير الجودة الدولية وتراخيص الامتثال (ISO, GlobalGAP, حلال).',
      ES: 'Gestiona auditorías de producto, normativas de calidad y acreditaciones internacionales.',
    },
    photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
    email: 'compliance@azexbuy.com',
    linkedin: 'https://linkedin.com',
    sortOrder: 4,
    isActive: true,
  },
];

export const ABOUT_PAGE_DEFAULT: AboutPageContent = {
  whoWeAre: {
    badge: {
      AZ: 'AZEXBUY · KORPORATİV PROFİL',
      EN: 'AZEXBUY · CORPORATE PROFILE',
      TR: 'AZEXBUY · KURUMSAL PROFİL',
      RU: 'AZEXBUY · КОРПОРАТИВНЫЙ ПРОФИЛЬ',
      AR: 'AZEXBUY · الملف المؤسسي',
      ES: 'AZEXBUY · PERFIL CORPORATIVO',
    },
    title: {
      AZ: 'Biz kimik?',
      EN: 'Who are we?',
      TR: 'Biz kimiz?',
      RU: 'Кто мы?',
      AR: 'من نحن؟',
      ES: '¿Quiénes somos?',
    },
    p1: {
      AZ: 'AZEXBUY, Azərbaycan istehsalçıları ilə beynəlxalq bazarlar arasında ticarət əlaqələrinin qurulmasına, yerli məhsulların xarici alıcılara təqdim edilməsinə və beynəlxalq satınalma imkanlarının inkişafına dəstək verən ixracat və satınalma xidmətləri şirkətidir.',
      EN: 'AZEXBUY is an export and procurement services company supporting the establishment of trade relations between Azerbaijani producers and international markets, the presentation of local products to foreign buyers, and the development of international procurement opportunities.',
      TR: 'AZEXBUY, Azerbaycanlı üreticilerle uluslararası pazarlar arasında ticari ilişkilerin kurulmasına, yerli ürünlerin yabancı alıcılara sunulmasına ve uluslararası satın alma imkânlarının gelişmesine destek veren ihracat ve satın alma hizmetleri şirketidir.',
      RU: 'AZEXBUY — компания экспортных и закупочных услуг, содействующая установлению торговых отношений между азербайджанскими производителями и международными рынками.',
      AR: 'AZEXBUY هي بوابة وشركة خدمات تصدير وشراء تدعم بناء العلاقات التجارية بين المنتجين الأذربيجانيين والأسواق العالمية.',
      ES: 'AZEXBUY es una empresa de servicios de exportación y adquisiciones que apoya el establecimiento de relaciones comerciales entre productores azerbaiyanos y mercados internacionales.',
    },
    p2: {
      AZ: 'Fəaliyyətimiz yerli istehsalçıların xarici bazarlara çıxış imkanlarının araşdırılmasını, potensial alıcıların tapılmasını, xarici şirkətlər üçün Azərbaycanda uyğun istehsalçı və tədarükçülərin müəyyənləşdirilməsini, ticarət təkliflərinin toplanmasını və beynəlxalq ticarət proseslərinin koordinasiyasını əhatə edir.',
      EN: 'Our activities encompass researching market access opportunities for local producers, finding potential buyers, identifying suitable manufacturers and suppliers in Azerbaijan for foreign companies, collecting trade offers, and coordinating international trade processes.',
      TR: 'Faaliyetimiz yerli üreticilerin yabancı pazarlara çıkış imkânlarının araştırılmasını, potansiyel alıcıların bulunmasını, yabancı şirketler için Azerbaycan\'da uygun üretici ve tedarikçilerin belirlenmesini, ticari tekliflerin toplanmasını ve uluslararası ticaret süreçlerinin koordinasyonunu kapsar.',
      RU: 'Наша деятельность охватывает исследование возможностей выхода на зарубежные рынки, поиск потенциальных покупателей, определение подходящих производителей для иностранных компаний и координацию международных торговых процессов.',
      AR: 'تشمل أنشطتنا دراسة فرص الوصول إلى الأسواق وتحديد الموردين المعتمدين وتنسيق المعاملات التجارية.',
      ES: 'Nuestras actividades abarcan la investigación de oportunidades de acceso al mercado, búsqueda de compradores y coordinación de procesos comerciales.',
    },
    p3: {
      AZ: 'Biz istehsalçılar, ixracatçılar, idxalatçılar və beynəlxalq ticarət tərəfləri arasında əlaqələrin qurulmasına kömək edərək Azərbaycan məhsullarının qlobal bazarlarda tanınmasına və yeni iş imkanlarının yaranmasına töhfə verməyi hədəfləyirik.',
      EN: 'By facilitating connections between producers, exporters, importers and international trade parties, we aim to contribute to the global recognition of Azerbaijani products and the creation of new business opportunities.',
      TR: 'Biz üreticiler, ihracatçılar, ithalatçılar ve uluslararası ticari taraflar arasında ilişkilerin kurulmasına yardımcı olarak Azerbaycan ürünlerinin küresel pazarlarda tanınmasına ve yeni iş imkânlarının oluşmasına katkı vermeyi hedefliyoruz.',
      RU: 'Содействуя установлению связей между производителями, экспортёрами, импортёрами и международными торговыми сторонами, мы стремимся способствовать глобальному признанию азербайджанской продукции.',
      AR: 'نهدف إلى تسهيل الروابط التجارية وتوسيع تواجد المنتجات الأذربيجانية على الخارطة العالمية.',
      ES: 'Al facilitar conexiones comerciales, nuestro objetivo es contribuir al reconocimiento global de los productos azerbaiyanos.',
    },
    pillars: [
      {
        icon: 'fa-solid fa-arrow-up-right-dots',
        label: {
          AZ: 'İxracatın İnkişafı',
          EN: 'Export Development',
          TR: 'İhracatın Geliştirilmesi',
          RU: 'Развитие экспорта',
          AR: 'تطوير الصادرات',
          ES: 'Desarrollo de Exportaciones',
        },
      },
      {
        icon: 'fa-solid fa-magnifying-glass-location',
        label: {
          AZ: 'Alıcı və Tədarükçü Axtarışı',
          EN: 'Buyer & Supplier Search',
          TR: 'Alıcı ve Tedarikçi Arama',
          RU: 'Поиск покупателей и поставщиков',
          AR: 'البحث عن المشترين والموردين',
          ES: 'Búsqueda de Compradores y Proveedores',
        },
      },
      {
        icon: 'fa-solid fa-arrows-spin',
        label: {
          AZ: 'Ticarət Proseslərinin Koordinasiyası',
          EN: 'Trade Process Coordination',
          TR: 'Ticaret Süreçlerinin Koordinasyonu',
          RU: 'Координация торговых процессов',
          AR: 'تنسيق العمليات التجارية',
          ES: 'Coordinación de Procesos Comerciales',
        },
      },
    ],
    image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&q=80',
    imageTagline: {
      AZ: 'Azərbaycan məhsullarını beynəlxalq bazarlara daşıyırıq',
      EN: 'Connecting Azerbaijani Products with Global Markets',
      TR: 'Azerbaycan ürünlerini uluslararası pazarlara taşıyoruz',
      RU: 'Выводим азербайджанскую продукцию на международные рынки',
      AR: 'نربط المنتجات الأذربيجانية بالأسواق العالمية',
      ES: 'Conectando productos azerbaiyanos con los mercados mundiales',
    },
    imageSub: {
      AZ: 'Azərbaycan → Qlobal Bazarlar',
      EN: 'Azerbaijan → Global Markets',
      TR: 'Azerbaycan → Küresel Pazarlar',
      RU: 'Азербайджан → Мировые рынки',
      AR: 'أذربيجان ← الأسواق العالمية',
      ES: 'Azerbaiyán → Mercados Globales',
    },
  },
  activities: {
    badge: {
      AZ: 'FƏALİYYƏTİMİZ',
      EN: 'OUR ACTIVITIES',
      TR: 'FAALİYETİMİZ',
      RU: 'НАША ДЕЯТЕЛЬНОСТЬ',
      AR: 'أنشطتنا',
      ES: 'NUESTRAS ACTIVIDADES',
    },
    title: {
      AZ: 'Nə ilə məşğuluq?',
      EN: 'What do we do?',
      TR: 'Ne ile meşgulüz?',
      RU: 'Чем мы занимаемся?',
      AR: 'ماذا نفعل؟',
      ES: '¿Qué hacemos?',
    },
    desc: {
      AZ: 'AZEXBUY beynəlxalq ticarət əməliyyatlarının müxtəlif mərhələlərində şirkətlərə dəstək göstərir. Fəaliyyətimiz həm Azərbaycan istehsalçılarının ixracat imkanlarının inkişafını, həm də xarici şirkətlərin Azərbaycandan məhsul və tədarükçü tapmasını əhatə edir.',
      EN: 'AZEXBUY supports companies at various stages of international trade operations. Our activities cover both developing export opportunities for Azerbaijani producers and helping foreign companies find products and suppliers in Azerbaijan.',
      TR: 'AZEXBUY uluslararası ticaret işlemlerinin çeşitli aşamalarında şirketlere destek gösterir. Faaliyetimiz hem Azerbaycanlı üreticilerin ihracat imkânlarının geliştirilmesini, hem de yabancı şirketlerin Azerbaycan\'dan ürün ve tedarikçi bulmasını kapsar.',
      RU: 'AZEXBUY поддерживает компании на различных этапах международных торговых операций, охватывая как развитие экспортных возможностей, так и помощь иностранным компаниям в поиске продуктов и поставщиков.',
      AR: 'تدعم AZEXBUY الشركات في مختلف مراحل التجارة الدولية عبر دراسات السوق والتوريد المباشر.',
      ES: 'AZEXBUY apoya a las empresas en diversas etapas de las operaciones de comercio internacional.',
    },
    items: [
      {
        icon: 'fa-solid fa-globe',
        color: 'bg-blue-600',
        title: {
          AZ: 'İxracatın İnkişafı',
          EN: 'Export Development',
          TR: 'İhracatın Geliştirilmesi',
          RU: 'Развитие экспорта',
          AR: 'تطوير الصادرات',
          ES: 'Desarrollo de Exportaciones',
        },
        desc: {
          AZ: 'Azərbaycanlı istehsalçıların məhsulları üçün bazar imkanlarının araşdırılması, hədəf ölkələrin müəyyənləşdirilməsi və ixrac strategiyasının formalaşdırılmasına dəstək.',
          EN: 'Market research for Azerbaijani producers, target country identification, and export strategy development support.',
          TR: 'Azerbaycanlı üreticilerin ürünleri için pazar imkânlarının araştırılması, hedef ülkelerin belirlenmesi ve ihracat stratejisinin oluşturulmasına destek.',
          RU: 'Исследование рыночных возможностей для азербайджанских производителей, определение целевых стран и поддержка экспортной стратегии.',
          AR: 'أبحاث السوق للمنتجين الأذربيجانيين وتحديد البلدان المستهدفة وصياغة استراتيجيات التصدير.',
          ES: 'Investigación de mercado para productores azerbaiyanos y desarrollo de estrategias de exportación.',
        },
      },
      {
        icon: 'fa-solid fa-handshake',
        color: 'bg-emerald-600',
        title: {
          AZ: 'Beynəlxalq Alıcıların Tapılması',
          EN: 'Finding International Buyers',
          TR: 'Uluslararası Alıcıların Bulunması',
          RU: 'Поиск международных покупателей',
          AR: 'إيجاد مشترين دوليين',
          ES: 'Búsqueda de Compradores Internacionales',
        },
        desc: {
          AZ: 'Yerli məhsullara uyğun xarici alıcıların, idxalatçıların, distribütorların və ticarət tərəfdaşlarının araşdırılması.',
          EN: 'Research and identification of foreign buyers, importers, distributors and trade partners suitable for local products.',
          TR: 'Yerli ürünlere uygun yabancı alıcıların, ithalatçıların, distribütörlerin ve ticari tarafların araştırılması.',
          RU: 'Поиск и подбор зарубежных покупателей, импортёров, дистрибьюторов и торговых партнеров.',
          AR: 'البحث وتحديد المشترين والمستوردين والموزعين الأجانب المناسبين للمنتجات المحلية.',
          ES: 'Identificación de compradores extranjeros, importadores y distribuidores adecuados para productos locales.',
        },
      },
      {
        icon: 'fa-solid fa-magnifying-glass',
        color: 'bg-violet-600',
        title: {
          AZ: 'Tədarükçü və Məhsul Axtarışı',
          EN: 'Supplier & Product Search',
          TR: 'Tedarikçi ve Ürün Arama',
          RU: 'Поиск поставщиков и товаров',
          AR: 'البحث عن الموردين والمنتجات',
          ES: 'Búsqueda de Proveedores y Productos',
        },
        desc: {
          AZ: 'Azərbaycandan məhsul almaq istəyən xarici şirkətlər üçün uyğun istehsalçı və tədarükçülərin müəyyənləşdirilməsi.',
          EN: 'Identifying suitable manufacturers and suppliers in Azerbaijan for foreign companies seeking to source products.',
          TR: 'Azerbaycan\'dan ürün almak isteyen yabancı şirketler için uygun üretici ve tedarikçilerin belirlenmesi.',
          RU: 'Определение подходящих производителей и поставщиков в Азербайджане для иностранных компаний.',
          AR: 'تحديد المصنعين والموردين الموثوقين في أذربيجان للشركات الدولية الراغبة في الشراء.',
          ES: 'Identificación de fabricantes y proveedores en Azerbaiyán para empresas extranjeras.',
        },
      },
      {
        icon: 'fa-solid fa-comments',
        color: 'bg-amber-600',
        title: {
          AZ: 'Ticarət Əlaqələrinin Qurulması',
          EN: 'Building Trade Relations',
          TR: 'Ticari İlişkilerin Kurulması',
          RU: 'Установление торговых связей',
          AR: 'بناء العلاقات التجارية',
          ES: 'Construcción de Relaciones Comerciales',
        },
        desc: {
          AZ: 'Alıcı və satıcı arasında ilk təmasların formalaşdırılması, kommersiya təkliflərinin toplanması və danışıqların koordinasiyası.',
          EN: 'Establishing initial contacts between buyers and sellers, collecting trade offers, and coordinating negotiations.',
          TR: 'Alıcı ve satıcı arasında ilk temasların oluşturulması, ticari tekliflerin toplanması ve görüşmelerin koordinasyonu.',
          RU: 'Установление первичных контактов между сторонами, сбор коммерческих предложений и координация переговоров.',
          AR: 'تأسيس الاتصالات الأولية وجمع العروض التجارية وتنسيق المفاوضات بين الأطراف.',
          ES: 'Establecimiento de contactos iniciales, recopilación de ofertas y coordinación de negociaciones.',
        },
      },
      {
        icon: 'fa-solid fa-truck',
        color: 'bg-cyan-600',
        title: {
          AZ: 'İxracat və Logistika Dəstəyi',
          EN: 'Export & Logistics Support',
          TR: 'İhracat ve Lojistik Desteği',
          RU: 'Экспортная и логистическая поддержка',
          AR: 'دعم التصدير والخدمات اللوجستية',
          ES: 'Apoyo a la Exportación y Logística',
        },
        desc: {
          AZ: 'Ticarət sənədləri, sertifikatlaşdırma, gömrük prosedurları və beynəlxalq daşıma mərhələlərinin koordinasiyası.',
          EN: 'Coordination of trade documentation, certification, customs procedures and international shipping stages.',
          TR: 'Ticari evraklar, sertifikasyon, gümrük prosedürleri ve uluslararası taşıma aşamalarının koordinasyonu.',
          RU: 'Координация торговой документации, сертификации, таможенных процедур и международных перевозок.',
          AR: 'تنسيق الوثائق التجارية والشهادات وإجراءات الجمارك والشحن الدولي.',
          ES: 'Coordinación de documentación comercial, certificación, aduanas y transporte internacional.',
        },
      },
    ],
  },
  missionVision: {
    missionBadge: {
      AZ: 'MİSSİYAMIZ',
      EN: 'OUR MISSION',
      TR: 'MİSYONUMUZ',
      RU: 'НАША МИССИЯ',
      AR: 'مهمتنا',
      ES: 'NUESTRA MISIÓN',
    },
    missionTitle: {
      AZ: 'Nə üçün varıq?',
      EN: 'Why do we exist?',
      TR: 'Neden varız?',
      RU: 'Зачем мы существуем?',
      AR: 'لماذا نحن هنا؟',
      ES: '¿Por qué existimos?',
    },
    missionDesc: {
      AZ: 'Azərbaycan istehsalçılarının beynəlxalq bazarlara çıxış imkanlarını genişləndirmək, yerli məhsulların xarici alıcılara təqdim edilməsini asanlaşdırmaq və beynəlxalq şirkətlərin Azərbaycandan etibarlı tədarük imkanlarını araşdırmasına kömək etmək.',
      EN: 'To expand market access opportunities for Azerbaijani producers, facilitate the presentation of local products to foreign buyers, and help international companies explore reliable sourcing options from Azerbaijan.',
      TR: 'Azerbaycanlı üreticilerin uluslararası pazarlara çıkış imkânlarını genişletmek, yerli ürünlerin yabancı alıcılara sunulmasını kolaylaştırmak ve uluslararası şirketlerin Azerbaycan\'dan güvenilir tedarik imkânlarını araştırmasına yardımcı olmaktır.',
      RU: 'Расширять возможности выхода азербайджанских производителей на международные рынки, облегчать представление местной продукции иностранным покупателям и помогать международным компаниям исследовать надёжные варианты закупок из Азербайджана.',
      AR: 'توسيع فرص الوصول إلى الأسواق للمنتجين المحليين وتسهيل التوريد للشركات الدولية.',
      ES: 'Ampliar las oportunidades de acceso a los mercados para productores azerbaiyanos y facilitar adquisiciones fiables.',
    },
    missionImage: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80',
    visionBadge: {
      AZ: 'VİZİYAMIZ',
      EN: 'OUR VISION',
      TR: 'VİZYONUMUZ',
      RU: 'НАШЕ ВИДЕНИЕ',
      AR: 'رؤيتنا',
      ES: 'NUESTRA VISIÓN',
    },
    visionTitle: {
      AZ: 'Hara gedirik?',
      EN: 'Where are we heading?',
      TR: 'Nereye gidiyoruz?',
      RU: 'Куда мы движемся?',
      AR: 'إلى أين نتجه؟',
      ES: '¿Hacia dónde nos dirigimos?',
    },
    visionDesc: {
      AZ: 'Azərbaycan məhsullarının beynəlxalq ticarətdə daha geniş tanınmasına, yerli istehsalçıların qlobal bazarlarda yeni ticarət imkanları əldə etməsinə və xarici şirkətlərin Azərbaycan tədarük bazarına çıxışının asanlaşmasına töhfə verən etibarlı beynəlxalq ticarət xidmətləri şirkəti olmaq.',
      EN: 'To become a trusted international trade services company contributing to wider recognition of Azerbaijani products, helping local producers gain new commercial opportunities in global markets, and facilitating foreign companies\' access to the Azerbaijani supply market.',
      TR: 'Azerbaycan ürünlerinin uluslararası ticarette daha geniş tanınmasına, yerli üreticilerin küresel pazarlarda yeni ticari imkânlar elde etmesine ve yabancı şirketlerin Azerbaycan tedarik pazarına çıkışının kolaylaşmasına katkı veren güvenilir uluslararası ticaret hizmetleri şirketi olmaktır.',
      RU: 'Стать надёжной компанией международных торговых услуг, способствующей более широкому признанию азербайджанской продукции и облегчению доступа иностранных компаний к азербайджанскому рынку поставок.',
      AR: 'أن نكون البوابة الأكثر موثوقية للتجارة الدولية للمنتجات الأذربيجانية عالمياً.',
      ES: 'Convertirnos en una empresa de servicios comerciales de referencia mundial para Azerbaiyán.',
    },
    visionImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
  },
  serviceModel: {
    badge: {
      AZ: 'XİDMƏT MODELİMİZ',
      EN: 'OUR SERVICE MODEL',
      TR: 'HİZMET MODELİMİZ',
      RU: 'НАША МОДЕЛЬ ОБСЛУЖИВАНИЯ',
      AR: 'نموذج خدماتنا',
      ES: 'NUESTRO MODELO DE SERVICIO',
    },
    title: {
      AZ: 'Biz necə işləyirik?',
      EN: 'How do we work?',
      TR: 'Biz nasıl çalışıyoruz?',
      RU: 'Как мы работаем?',
      AR: 'كيف نعمل؟',
      ES: '¿Cómo trabajamos?',
    },
    desc: {
      AZ: 'AZEXBUY-un xidmət modeli müştərilərin ehtiyacına əsaslanan fərdi yanaşma üzərində qurulur. Hər müraciət məhsulun xüsusiyyətlərinə, istənilən həcmə, hədəf bazara və ticarət şərtlərinə uyğun qiymətləndirilir.',
      EN: 'AZEXBUY\'s service model is built on an individual approach based on client needs. Each application is evaluated according to the product\'s characteristics, desired volume, target market and commercial terms.',
      TR: 'AZEXBUY\'un hizmet modeli müşterilerin ihtiyacına dayalı bireysel yaklaşım üzerine kurulur. Her başvuru ürünün özelliklerine, istenen hacme, hedef pazara ve ticari şartlara uygun değerlendirilir.',
      RU: 'Сервисная модель AZEXBUY построена на индивидуальном подходе, основанном на потребностях клиентов. Каждая заявка оценивается в соответствии с характеристиками продукта, желаемым объёмом и целевым рынком.',
      AR: 'يقوم نموذجنا على نهج مخصص يراعي حجم الطلب والمتطلبات التنظيمية وشروط التسليم الدولية.',
      ES: 'El modelo de servicio se basa en un enfoque individual adaptado a las necesidades de cada cliente.',
    },
    steps: [
      {
        step: '01',
        icon: 'fa-solid fa-search',
        color: 'bg-blue-600',
        borderColor: 'border-blue-200',
        bgColor: 'bg-blue-50',
        title: {
          AZ: 'Araşdırma və Qiymətləndirmə',
          EN: 'Research & Assessment',
          TR: 'Araştırma ve Değerlendirme',
          RU: 'Исследование и оценка',
          AR: 'البحث والتقييم',
          ES: 'Investigación y Evaluación',
        },
        desc: {
          AZ: 'Müştərilərin tələblərini, məhsulun texniki parametrlərini, bazar potensialını və uyğun tərəfləri araşdırırıq.',
          EN: 'We analyze customer needs, product specifications, market feasibility, and potential trading partners.',
          TR: 'Müşterilerin ihtiyacını, ürününü, pazar imkânlarını ve potansiyel taraflarını araştırıyoruz.',
          RU: 'Мы анализируем потребности клиентов, параметры продукта, возможности рынка и потенциальных партнеров.',
          AR: 'نحلل متطلبات العملاء ومواصفات المنتجات والشركاء المحتملين.',
          ES: 'Analizamos las necesidades del cliente, especificaciones del producto y viabilidad de mercado.',
        },
      },
      {
        step: '02',
        icon: 'fa-solid fa-handshake',
        color: 'bg-emerald-600',
        borderColor: 'border-emerald-200',
        bgColor: 'bg-emerald-50',
        title: {
          AZ: 'Əlaqə və Kommersiya İş Birliyi',
          EN: 'Communication & Matchmaking',
          TR: 'İletişim ve Ticari İş Birliği',
          RU: 'Коммуникация и сотрудничество',
          AR: 'التواصل والتعاون التجاري',
          ES: 'Comunicación y Cooperación Comercial',
        },
        desc: {
          AZ: 'Uyğun tərəfləri müəyyənləşdirir, əlaqələrin qurulmasına və kommersiya təkliflərinin uzlaşdırılmasına kömək edirik.',
          EN: 'We identify vetted counterparts, facilitate introductions, and assist in negotiating commercial terms.',
          TR: 'Uygun tarafları belirliyor, ilişkilerin kurulmasına ve tekliflerin mutabık kalınmasına yardımcı oluyoruz.',
          RU: 'Мы определяем подходящие стороны, содействуем контактам и согласованию предложений.',
          AR: 'نحدد الأطراف المعتمدة ونساعد في تقديم العروض والتفاوض.',
          ES: 'Identificamos contrapartes adecuadas, facilitamos contactos y mediación comercial.',
        },
      },
      {
        step: '03',
        icon: 'fa-solid fa-clipboard-check',
        color: 'bg-violet-600',
        borderColor: 'border-violet-200',
        bgColor: 'bg-violet-50',
        title: {
          AZ: 'İcra Mərhələlərinin Koordinasiyası',
          EN: 'Execution & Logistics Coordination',
          TR: 'İcra Aşamalarının Koordinasyonu',
          RU: 'Координация исполнения',
          AR: 'تنسيق التنفيذ والشحن',
          ES: 'Coordinación de Ejecución',
        },
        desc: {
          AZ: 'Sənədləşmə, sertifikasiya, gömrük və daşıma proseslərinin ardıcıl icrasına dəstək veririk.',
          EN: 'We provide full coordination for trade documentation, certification, export customs, and logistics dispatch.',
          TR: 'Evraklandırma, uygunluk, gümrük ve lojistik süreçlerinin koordinasyonuna destek veriyoruz.',
          RU: 'Мы обеспечиваем координацию документации, сертификации, таможни и логистических процессов.',
          AR: 'نوفر الدعم الكامل للوثائق الجمركية وشهادات المنشأ وإجراءات النقل.',
          ES: 'Damos soporte continuo en documentación, cumplimiento aduanero y transporte.',
        },
      },
    ],
    bottomNote: {
      AZ: 'Biz yalnız tərəfləri tapmaqla kifayətlənmir, əməkdaşlığın hər bir mərhələsində məlumat mübadiləsini və proseslərin şəffaf koordinasiyasını təmin edirik.',
      EN: 'We do not simply connect parties; we actively coordinate the information exchange, commercial offers, and execution milestones throughout the entire transaction lifecycle.',
      TR: 'Biz yalnız tarafları buluşturmakla yetinmeyerek, iş birliğinin çeşitli aşamalarında bilgi alışverişinin, ticari tekliflerin ve süreçlerin koordinasyonuna destek veriyoruz.',
      RU: 'Мы не просто соединяем стороны, но и поддерживаем обмен информацией, согласование предложений и координацию на всех этапах.',
      AR: 'لا نكتفي بالربط بين الأطراف بل نوفر المتابعة الكاملة وتنسيق التوريد خطوة بخطوة.',
      ES: 'No solo conectamos partes, sino que coordinamos activamente cada etapa del proceso comercial.',
    },
  },
  sectors: {
    badge: {
      AZ: 'FƏALİYYƏT SAHƏLƏRİ',
      EN: 'OUR SECTORS',
      TR: 'FAALİYET ALANLARIMIZ',
      RU: 'НАШИ СЕКТОРЫ',
      AR: 'القطاعات المستهدفة',
      ES: 'NUESTROS SECTORES',
    },
    title: {
      AZ: 'Müxtəlif sektorlar üzrə beynəlxalq ticarət imkanları',
      EN: 'International trade opportunities across diverse sectors',
      TR: 'Çeşitli sektörler üzere uluslararası ticaret imkânları',
      RU: 'Международные торговые возможности в различных секторах',
      AR: 'فرص تجارية دولية عبر مختلف القطاعات الصناعية والزراعية',
      ES: 'Oportunidades de comercio internacional en diversos sectores',
    },
    desc: {
      AZ: 'AZEXBUY müxtəlif məhsul və sənaye sahələri üzrə yerli istehsalçılarla xarici alıcılar arasında ticarət əlaqələrini inkişaf etdirir.',
      EN: 'AZEXBUY promotes export and supply matchmaking across key manufacturing and agricultural commodity sectors in Azerbaijan.',
      TR: 'AZEXBUY çeşitli ürün ve sanayi yönleri üzere yerli üreticilerle yabancı alıcılar arasında iş birliği imkânlarının araştırılmasını hedefler.',
      RU: 'AZEXBUY исследует возможности сотрудничества между местными производителями и иностранными покупателями по ключевым отраслям.',
      AR: 'تربط AZEXBUY بين المنتجين المحليين والمشترين الأجانب في قطاعات استراتيجية متعددة.',
      ES: 'AZEXBUY fomenta la cooperación entre productores locales y compradores internacionales.',
    },
    items: [
      {
        icon: 'fa-solid fa-wheat-awn',
        color: 'bg-green-700',
        title: { AZ: 'Kənd Təsərrüfatı və Qida', EN: 'Agriculture & Food', TR: 'Tarım ve Gıda', RU: 'Сельское хозяйство и продукты' },
        desc: { AZ: 'Fındıq, nar, xurma, pomidor, meyvə-tərəvəz və emal olunmuş qida məhsulları.', EN: 'Hazelnuts, pomegranates, persimmons, fresh fruits, vegetables, and processed food products.', TR: 'Meyveler, fındık, tahıllar, işlenmiş gıdalar ve tarım ürünleri.', RU: 'Фундук, гранаты, хурма, томаты и переработанная сельхозпродукция.' },
        image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80',
      },
      {
        icon: 'fa-solid fa-industry',
        color: 'bg-blue-700',
        title: { AZ: 'Emal Sənayesi', EN: 'Processing Industry', TR: 'İşleme Sanayisi', RU: 'Перерабатывающая промышленность' },
        desc: { AZ: 'Qida emalı, konservlər, şirələr və sənaye qablaşdırma materialları.', EN: 'Juice concentrates, canned goods, aseptic purees, and food packaging solutions.', TR: 'Gıda işleme, ambalajlama ve sanayi üretimi.', RU: 'Пищевая переработка, консервация, соки и промышленная тара.' },
        image: 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=400&q=80',
      },
      {
        icon: 'fa-solid fa-building',
        color: 'bg-slate-600',
        title: { AZ: 'Tikinti Materialları', EN: 'Construction Materials', TR: 'İnşaat Malzemeleri', RU: 'Строительные материалы' },
        desc: { AZ: 'Gips, bentonit, təbii daş, mərmər, sement və tikinti qarışıqları.', EN: 'Gypsum, bentonite, natural stone, marble, cement, and dry construction mixtures.', TR: 'Mermer, granit, kireçtaşı ve inşaat taşları.', RU: 'Гипс, бентонит, природный камень, цемент и строительные смеси.' },
        image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80',
      },
      {
        icon: 'fa-solid fa-cogs',
        color: 'bg-gray-700',
        title: { AZ: 'Sənaye və Metal', EN: 'Industrial & Metals', TR: 'Sanayi Ürünleri', RU: 'Промышленная продукция' },
        desc: { AZ: 'Polad borular, armatur, alüminium profillər və metal konstruksiyalar.', EN: 'Steel pipes, rebar, aluminum extrusions, and heavy metal fabrications.', TR: 'Metal, çelik, boru ve sanayi imalat ürünleri.', RU: 'Стальные трубы, арматура, алюминиевые профили и металлоконструкции.' },
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80',
      },
      {
        icon: 'fa-solid fa-flask',
        color: 'bg-purple-700',
        title: { AZ: 'Kimya və Xammal', EN: 'Chemicals & Raw Materials', TR: 'Kimya ve Hammadde', RU: 'Химия и сырье' },
        desc: { AZ: 'Polimerlər, karbamid, gübrələr, bitki ekstraktları və qatranlar.', EN: 'Polymers, urea fertilizer, licorice extracts, petrochemical compounds, and resins.', TR: 'Polimer, gübre, petrokimya ve kimyasal ürünler.', RU: 'Полимеры, карбамид, удобрения, экстракты солодки и нефтехимия.' },
        image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&q=80',
      },
      {
        icon: 'fa-solid fa-bolt',
        color: 'bg-yellow-600',
        title: { AZ: 'Elektrik və Avadanlıq', EN: 'Electrical & Equipment', TR: 'Elektrik ve Elektronik', RU: 'Электротехника' },
        desc: { AZ: 'Mis və alüminium kabellər, transformator hissələri və elektrik ləvazimatları.', EN: 'Copper/aluminum electrical cables, switchgear, and industrial electrical supplies.', TR: 'Kablo, ekipman ve elektrik malzemeleri.', RU: 'Кабели, трансформаторное оборудование и электротехника.' },
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80',
      },
      {
        icon: 'fa-solid fa-shirt',
        color: 'bg-pink-600',
        title: { AZ: 'Tekstil və Yüngül Sənaye', EN: 'Textiles & Light Industry', TR: 'Tekstil ve Hafif Sanayi', RU: 'Текстиль и легкая промышленность' },
        desc: { AZ: 'Əl xalçaları, xam ipək, pambıq ipliyi və sənaye toxuculuğu məhsulları.', EN: 'Hand-knotted silk carpets, raw silk, combed cotton yarn, and technical fabrics.', TR: 'Halı, kumaş, ipek ve tekstil ürünleri.', RU: 'Ковры ручной работы, шёлк, хлопчатобумажная пряжа и текстиль.' },
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
      },
      {
        icon: 'fa-solid fa-box-open',
        color: 'bg-orange-600',
        title: { AZ: 'Qablaşdırma və Digər Mallar', EN: 'Packaging & Bulk Commodities', TR: 'Diğer İhracat Ürünleri', RU: 'Упаковка и прочие товары' },
        desc: { AZ: 'Polipropilen kisələr, big-bag çantalar və xüsusi ixrac məhsulları.', EN: 'PP woven bags, FIBC bulk bags, corrugated cartons, and custom commodities.', TR: 'İhracat potansiyeline sahip diğer ürün kategorileri.', RU: 'Полипропиленовые мешки, биг-бэги и специализированные экспортные товары.' },
        image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&q=80',
      },
    ],
  },
  values: {
    badge: {
      AZ: 'DƏYƏRLƏRİMİZ',
      EN: 'OUR VALUES',
      TR: 'DEĞERLERİMİZ',
      RU: 'НАШИ ЦЕННОСТИ',
      AR: 'قيمنا المؤسسية',
      ES: 'NUESTROS VALORES',
    },
    title: {
      AZ: 'Fəaliyyətimizin əsas prinsipləri',
      EN: 'Core principles of our activity',
      TR: 'Faaliyetimizin temel prensipleri',
      RU: 'Основные принципы нашей деятельности',
      AR: 'المبادئ الأساسية لعملنا',
      ES: 'Principios fundamentales de nuestra actividad',
    },
    desc: {
      AZ: 'AZEXBUY-un fəaliyyətində etibarlı əməkdaşlıq, peşəkar yanaşma, şəffaf ünsiyyət və müştəri ehtiyaclarının düzgün anlaşılması əsas prinsiplərdir.',
      EN: 'The core principles of AZEXBUY\'s activity are reliable partnership, professional execution, transparent communication, and an accurate alignment with client requirements.',
      TR: 'AZEXBUY\'un faaliyetinde güvenilir iş birliği, profesyonel yaklaşım, şeffaf iletişim ve müşteri ihtiyaçlarının doğru anlaşılması temel prensiplerdir.',
      RU: 'Основными принципами деятельности AZEXBUY являются надёжное сотрудничество, профессиональный подход, прозрачная коммуникация и точное понимание потребностей клиентов.',
      AR: 'تقوم قيمنا على النزاهة والموثوقية والشفافية التامة والاحترافية.',
      ES: 'Los principios fundamentales son la cooperación fiable, enfoque profesional y comunicación transparente.',
    },
    items: [
      {
        icon: 'fa-solid fa-user-check',
        color: 'text-blue-600 bg-blue-50',
        title: { AZ: 'Müştəri Yönümlülük', EN: 'Client Focus', TR: 'Müşteri Odaklılık', RU: 'Клиентоориентированность' },
        desc: { AZ: 'Hər bir müraciət müştərinin konkret tələbatı və kommersiya məqsədləri əsasında fərdi dəyərləndirilir.', EN: 'Every request is assessed individually based on specific commercial targets and operational parameters.', TR: 'Her başvuru müşterinin somut ihtiyaçları ve ticari amaçları esasında değerlendirilir.', RU: 'Каждая заявка оценивается индивидуально на основе конкретных целей и потребностей.' },
      },
      {
        icon: 'fa-solid fa-eye',
        color: 'text-emerald-600 bg-emerald-50',
        title: { AZ: 'Şəffaflıq', EN: 'Transparency', TR: 'Şeffaflık', RU: 'Прозрачность' },
        desc: { AZ: 'Əməkdaşlığın bütün mərhələləri, xidmət həcmi və tərəflərin öhdəlikləri barədə aydın və dəqiq məlumat təqdim edirik.', EN: 'We ensure clear, upfront disclosure of service scopes, documentation milestones, and partner responsibilities.', TR: 'İş birliğinin aşamaları, hizmetin kapsamı ve tarafların yükümlülükleri hakkında net bilgi sunarız.', RU: 'Мы предоставляем ясную информацию обо всех этапах сделки, объёме услуг и обязательствах.' },
      },
      {
        icon: 'fa-solid fa-briefcase',
        color: 'text-violet-600 bg-violet-50',
        title: { AZ: 'Peşəkarlıq', EN: 'Professionalism', TR: 'Profesyonellik', RU: 'Профессионализм' },
        desc: { AZ: 'Beynəlxalq ticarət proseslərinə sistemli, dəqiq və məsuliyyətli yanaşma nümayiş etdiririk.', EN: 'We adhere to disciplined, international trade standards and regulatory compliance across all touchpoints.', TR: 'Uluslararası ticaret süreçlerine sistemli ve sorumlu yaklaşırız.', RU: 'Мы придерживаемся строгих стандартов международной торговли и нормативного комплаенса.' },
      },
      {
        icon: 'fa-solid fa-link',
        color: 'text-amber-600 bg-amber-50',
        title: { AZ: 'Etibarlı Tərəfdaşlıq', EN: 'Reliable Partnership', TR: 'Güvenilir İş Birliği', RU: 'Надёжное партнерство' },
        desc: { AZ: 'Alıcılar, istehsalçılar və lojistika tərəfdaşları arasında uzunmüddətli iş birliyinə xüsusi önəm veririk.', EN: 'We foster durable, long-term trade relationships among buyers, producers, and supply chain partners.', TR: 'Alıcılar, üreticiler ve ticari taraflar arasında uzun vadeli iş birliği ilişkilerinin kurulmasını önemli sayarız.', RU: 'Мы нацелены на долгосрочные доверительные отношения между покупателями и производителями.' },
      },
      {
        icon: 'fa-solid fa-sliders',
        color: 'text-cyan-600 bg-cyan-50',
        title: { AZ: 'Çeviklik', EN: 'Flexibility', TR: 'Esneklik', RU: 'Гибкость' },
        desc: { AZ: 'Müxtəlif məhsul kateqoriyalarına, fərqli bazarlara və xüsusi şərtlərə uyğun həllər tətbiq edirik.', EN: 'We adapt rapidly to diverse commodity requirements, unique buyer specifications, and market dynamics.', TR: 'Farklı ürün kategorilerine, pazarlara ve müşteri taleplerine uygun yaklaşım uygularız.', RU: 'Мы адаптируемся к специфике различных товаров, рынков и индивидуальных требований.' },
      },
      {
        icon: 'fa-solid fa-seedling',
        color: 'text-green-600 bg-green-50',
        title: { AZ: 'Davamlı İnkişaf', EN: 'Sustainable Development', TR: 'Sürdürülebilir Gelişim', RU: 'Устойчивое развитие' },
        desc: { AZ: 'Xidmət infrastrukturumuzu, tərəfdaşlıq şəbəkəmizi və rəqəmsal ticarət həllərimizi mütəmadi təkmilləşdiririk.', EN: 'We continuously evolve our digital trade infrastructure, knowledge bases, and corridor capabilities.', TR: 'Hizmet modelimizi, iş birliği imkânlarımızı ve uluslararası faaliyet yönlerimizi geliştirmeyi hedefleriz.', RU: 'Мы постоянно совершенствуем сервисные механизмы и цифровую торговую инфраструктуру.' },
      },
    ],
  },
  partnership: {
    badge: {
      AZ: 'İŞ BİRLİYİ MODELİMİZ',
      EN: 'PARTNERSHIP MODEL',
      TR: 'İŞ BİRLİĞİ MODELİMİZ',
      RU: 'МОДЕЛЬ СОТРУДНИЧЕСТВА',
      AR: 'نموذج الشراكة',
      ES: 'MODELO DE ASOCIACIÓN',
    },
    title: {
      AZ: 'Kimlərlə iş birliyi qururuq?',
      EN: 'Who do we partner with?',
      TR: 'Kimlerle iş birliği yapıyoruz?',
      RU: 'С кем мы сотрудничаем?',
      AR: 'مع من نتعاون؟',
      ES: '¿Con quién nos asociamos?',
    },
    desc: {
      AZ: 'AZEXBUY beynəlxalq ticarət zəncirində yer alan aparıcı bazar iştirakçıları ilə strateji əməkdaşlıq qurur.',
      EN: 'AZEXBUY acts as a neutral, trusted trade facilitator bridging key stakeholders across the international supply ecosystem.',
      TR: 'AZEXBUY uluslararası ticarette yer alan çeşitli iş sahipleriyle iş birliği imkânlarını geliştirmeye yöneliktir.',
      RU: 'AZEXBUY развивает сотрудничество с ключевыми участниками международной торговли и цепочек поставок.',
      AR: 'تبني AZEXBUY شراكات استراتيجية مع كافة أطراف سلاسل التوريد الدولية.',
      ES: 'AZEXBUY desarrolla la cooperación con los principales participantes del comercio internacional.',
    },
    items: [
      {
        icon: 'fa-solid fa-factory',
        color: 'bg-blue-600',
        title: { AZ: 'Azərbaycan İstehsalçıları və İxracatçıları', EN: 'Azerbaijani Producers & Exporters', TR: 'Azerbaycanlı Üreticiler ve İhracatçılar', RU: 'Азербайджанские производители и экспортёры' },
        desc: { AZ: 'Məhsullarını xarici bazarlara çıxarmaq, alıcı bazasını genişləndirmək və sabit ixrac sifarişləri almaq istəyən müəssisələr.', EN: 'Companies seeking international market entry, verified buyer channels, and scalable export order pipelines.', TR: 'Ürünlerini yabancı pazarlara çıkarmak, potansiyel alıcılar bulmak ve ihracat imkânlarını genişletmek isteyen şirketler.', RU: 'Предприятия, стремящиеся выйти на зарубежные рынки и расширить экспортные каналы.' },
      },
      {
        icon: 'fa-solid fa-ship',
        color: 'bg-emerald-600',
        title: { AZ: 'Beynəlxalq Alıcılar və İdxalatçılar', EN: 'International Buyers & Importers', TR: 'Uluslararası Alıcılar ve İthalatçılar', RU: 'Международные покупатели и импортёры' },
        desc: { AZ: 'Azərbaycandan rəqabətədavamlı xammal, aqrar və sənaye məhsulları almaq üçün etibarlı tədarükçü axtaran şirkətlər.', EN: 'Global procurement desks seeking audited direct manufacturers, consistent quality, and transparent landed cost pricing.', TR: 'Azerbaycan\'dan ürün, hammadde ve sanayi malları almak için uygun tedarikçi arayan şirketler.', RU: 'Компании, ищущие надежных поставщиков сельскохозяйственных и промышленных товаров в Азербайджане.' },
      },
      {
        icon: 'fa-solid fa-store',
        color: 'bg-violet-600',
        title: { AZ: 'Distribütorlar və Topdansatış Şəbəkələri', EN: 'Distributors & Wholesale Channels', TR: 'Distribütörler ve Toptan Satış', RU: 'Дистрибьюторы и оптовые сети' },
        desc: { AZ: 'Yeni məhsul kateqoriyaları və yüksək gəlirli tədarük mənbələri ilə ticarət əlaqələrini genişləndirən tərəflər.', EN: 'Regional distributors establishing proprietary product categories and direct supply pipelines from the South Caucasus.', TR: 'Yeni ürün kategorileri ve tedarik kaynaklarıyla iş birliği yapmak isteyen ticari taraflar.', RU: 'Торговые операторы, расширяющие дистрибьюторские портфели новыми категориями продукции.' },
      },
      {
        icon: 'fa-solid fa-network-wired',
        color: 'bg-amber-600',
        title: { AZ: 'Ticarət və Xidmət Tərəfdaşları', EN: 'Trade & Logistics Providers', TR: 'Ticari ve Hizmet Tarafları', RU: 'Торговые и логистические партнеры' },
        desc: { AZ: 'Lojistika, laboratoriya sınaqları, sertifikatlaşdırma, gömrük və keyfiyyət nəzarəti üzrə ixtisaslaşmış institutlar.', EN: 'Specialized freight forwarders, accredited testing labs (SGS/Bureau Veritas), customs brokers, and trade insurers.', TR: 'Lojistik, sertifikasyon, gümrük, kalite denetimi ve diğer ilgili alanlarda faaliyet gösteren potansiyel hizmet sağlayıcılar.', RU: 'Институты логистики, сюрвейерские компании, лаборатории и таможенные брокеры.' },
      },
    ],
  },
  growth: {
    badge: {
      AZ: 'STRATEJİ GƏLİŞİM',
      EN: 'STRATEGIC GROWTH',
      TR: 'GELİŞİM YÖNLERİMİZ',
      RU: 'СТРАТЕГИЧЕСКОЕ РАЗВИТИЕ',
      AR: 'التطور الاستراتيجي',
      ES: 'CRECIMIENTO ESTRATÉGICO',
    },
    title: {
      AZ: 'Gələcəyə baxış və strateji hədəflər',
      EN: 'Future outlook & strategic objectives',
      TR: 'Geleceğe bakış ve stratejik hedefler',
      RU: 'Взгляд в будущее и стратегические цели',
      AR: 'الرؤية المستقبلية والأهداف الاستراتيجية',
      ES: 'Visión de futuro y objetivos estratégicos',
    },
    desc: {
      AZ: 'AZEXBUY-un inkişaf strategiyası beynəlxalq ticarət xidmətlərinin genişləndirilməsi, yeni bazarlarda ticarət dəhlizlərinin açılması və rəqəmsal ticarət imkanlarının gücləndirilməsinə əsaslanır.',
      EN: 'AZEXBUY\'s roadmap focuses on scaling cross-border trade facilitation, opening multimodal Middle Corridor routes, and deploying AI-driven trade verification tools.',
      TR: 'AZEXBUY\'un gelişim stratejisi uluslararası ticaret hizmetlerinin genişletilmesi, yeni pazarlarda iş birliği imkânlarının oluşturulması ve yerli üreticilerin ihracat faaliyetinin desteklenmesi üzerine kuruludur.',
      RU: 'Стратегия развития AZEXBUY опирается на расширение сервисов международной торговли и освоение новых транспортных коридоров.',
      AR: 'ترتكز استراتيجيتنا على فتح ممرات تجارية جديدة وتوظيف الحلول الرقمية الذكية.',
      ES: 'La estrategia se basa en ampliar los servicios comerciales internacionales y abrir nuevas rutas.',
    },
    items: [
      {
        num: '01',
        icon: 'fa-solid fa-earth-americas',
        title: { AZ: 'Yeni Beynəlxalq Bazarlara Çıxış', EN: 'Expansion into New Markets', TR: 'Yeni Uluslararası Pazarlara Çıkış', RU: 'Выход на новые международные рынки' },
        desc: { AZ: 'Körfəz ölkələri, Mərkəzi Asiya və Avropa bazarlarında Azərbaycan məhsulları üçün yeni ticarət dəhlizlərinin formalaşdırılması.', EN: 'Developing structured export channels in GCC, Central Asian, and European Union commercial territories.', TR: 'Azerbaycan ürünleri için yeni ülke ve bölgelerde ticari imkânların araştırılması.', RU: 'Формирование торговых коридоров в странах Залива, Центральной Азии и ЕС.' },
      },
      {
        num: '02',
        icon: 'fa-solid fa-network-wired',
        title: { AZ: 'Tərəfdaşlıq Şəbəkəsinin Genişləndirilməsi', EN: 'Ecosystem & Partner Expansion', TR: 'Ortaklık Ağının Genişletilmesi', RU: 'Расширение партнёрской сети' },
        desc: { AZ: 'Qlobal alıcı şəbəkələri, ticarət palataları və logistika təchizatçıları ilə institusional əməkdaşlığın artırılması.', EN: 'Deepening institutional tie-ups with global procurement consortia, chambers of commerce, and maritime freight operators.', TR: 'Yabancı alıcılar, distribütörler, tedarikçiler ve hizmet sağlayıcılarla iş birliği ilişkilerinin gelişimi.', RU: 'Укрепление связей с закупочными ассоциациями, торговыми палатами и перевозчиками.' },
      },
      {
        num: '03',
        icon: 'fa-solid fa-layer-group',
        title: { AZ: 'Xidmət Portfelinin Şaxələndirilməsi', EN: 'Service Portfolio Diversification', TR: 'Hizmet Portföyünün Genişletilmesi', RU: 'Диверсификация портфеля услуг' },
        desc: { AZ: 'Bazar analitikası, KYB yoxlamaları, sığorta və maliyyə vasitəçiliyi sahəsində xidmət imkanlarının genişləndirilməsi.', EN: 'Adding specialized commodity escrow facilitation, KYB credit reporting, and trade finance advisory.', TR: 'Pazar araştırması, satın alma, ihracat ve lojistik koordinasyonu üzere hizmet imkânlarının artırılması.', RU: 'Внедрение аналитических отчётов, скоринга контрагентов и торгового финансирования.' },
      },
      {
        num: '04',
        icon: 'fa-solid fa-laptop-code',
        title: { AZ: 'Rəqəmsal Ticarət Həlləri', EN: 'Digital Trade & AI Verification', TR: 'Dijital Hizmetlerin Gelişimi', RU: 'Цифровые торговые сервисы' },
        desc: { AZ: 'Elektron RFQ sistemi, avtomatlaşdırılmış sənəd yoxlanışı və tədarük zənciri monitorinqinin tətbiqi.', EN: 'Deploying digital RFQ tracking, automated HS tariff compliance engines, and transparent order tracking.', TR: 'Müşteri başvurularının, ürün bilgilerinin ve ticari sorguların daha sistemli yönetilmesi.', RU: 'Внедрение электронного RFQ, автоматической проверки документов и мониторинга поставок.' },
      },
      {
        num: '05',
        icon: 'fa-solid fa-chart-pie',
        title: { AZ: 'Sektorlar Üzrə İxtisaslaşma', EN: 'Deep Sectoral Specialization', TR: 'Sektörler Üzere İhtisaslaşma', RU: 'Отраслевая специализация' },
        desc: { AZ: 'Aqrar xammal, polimerlər, metal və qida emalı üzrə ixtisaslaşmış ticarət komandalarının formalaşdırılması.', EN: 'Building dedicated commodity-specific trade desks for agro-industrial goods, chemicals, and construction materials.', TR: 'Çeşitli ürün kategorilerinin ve ihracat yönlerinin gelişimine uygun hizmet modelinin şekillendirilmesi.', RU: 'Формирование специализированных отраслевых десков по агропрому, химии и металлам.' },
      },
    ],
  },
  team: {
    badge: {
      AZ: 'PEŞƏKAR KOMANDA',
      EN: 'OUR LEADERSHIP & TEAM',
      TR: 'UZMAN EKİBİMİZ',
      RU: 'ПРОФЕССИОНАЛЬНАЯ КОМАНДА',
      AR: 'فريق القيادة والخبراء',
      ES: 'NUESTRO EQUIPO',
    },
    title: {
      AZ: 'Komandamızla Tanış Olun',
      EN: 'Meet Our Leadership & Team',
      TR: 'Ekibimizle Tanışın',
      RU: 'Познакомьтесь с нашей командой',
      AR: 'تعرف على فريق عملنا',
      ES: 'Conozca a Nuestro Equipo',
    },
    desc: {
      AZ: 'Beynəlxalq ticarət, ixrac əməliyyatları, sertifikasiya və satınalma üzrə təcrübəli komandamız.',
      EN: 'Experienced professionals in international trade, export compliance, commodity inspection, and global procurement.',
      TR: 'Uluslararası ticaret, ihracat operasyonları, sertifikasyon ve satın alma alanlarında deneyimli ekibimiz.',
      RU: 'Опытная команда специалистов по международной торговле, экспортному комплаенсу и закупкам.',
      AR: 'فريق عمل ذو خبرة عريقة في التجارة الدولية وعمليات التصدير وإدارة التوريد.',
      ES: 'Profesionales experimentados en comercio exterior, cumplimiento aduanero y adquisiciones globales.',
    },
  },
  cta: {
    badge: {
      AZ: 'ƏMƏKDAŞLIĞA DƏVƏT',
      EN: 'INVITATION TO COOPERATE',
      TR: 'İŞ BİRLİĞİNE DAVET',
      RU: 'ПРИГЛАШЕНИЕ К СОТРУДНИЧЕСТВУ',
      AR: 'دعوة للتعاون',
      ES: 'INVITACIÓN A COOPERAR',
    },
    title: {
      AZ: 'Gəlin, beynəlxalq ticarətdə yeni imkanlar yaradaq.',
      EN: 'Let\'s create new opportunities in international trade together.',
      TR: 'Gelin, uluslararası ticarette yeni imkânlar yaratalım.',
      RU: 'Давайте создавать новые возможности в международной торговле.',
      AR: 'معاً لنخلق فرصاً جديدة في التجارة الدولية.',
      ES: 'Creemos juntos nuevas oportunidades en el comercio internacional.',
    },
    desc: {
      AZ: 'İstər Azərbaycan məhsullarını beynəlxalq bazarlara çıxarmaq, istərsə də Azərbaycandan etibarlı tədarükçü tapmaq istəyin, AZEXBUY əməkdaşlıq imkanlarını araşdırmaq üçün sizinlə əlaqə saxlamağa hazırdır.',
      EN: 'Whether you want to bring Azerbaijani products to international markets or source reliably from vetted Azerbaijani manufacturers, AZEXBUY is ready to assist your commercial growth.',
      TR: 'İster Azerbaycan ürünlerini uluslararası pazarlara çıkarmak, isterse de Azerbaycan\'dan güvenilir tedarikçi bulmak isteyin, AZEXBUY iş birliği imkânlarını araştırmak için sizinle iletişim kurmaya hazırdır.',
      RU: 'Хотите ли вы вывести азербайджанскую продукцию на международные рынки или найти надёжных поставщиков из Азербайджана — AZEXBUY готов связаться с вами для изучения возможностей сотрудничества.',
      AR: 'سواء كنت ترغب في تصدير منتجاتك أو استيراد بضائع معتمدة من أذربيجان، فريقنا مستعد لخدمتكم.',
      ES: 'Tanto si desea exportar productos azerbaiyanos como abastecerse de fabricantes fiables, AZEXBUY está listo para colaborar.',
    },
    buyerBtn: {
      AZ: 'Alıcı kimi müraciət et',
      EN: 'Apply as a Buyer',
      TR: 'Alıcı olarak başvur',
      RU: 'Подать заявку как покупатель',
      AR: 'تقديم طلب كمشتري',
      ES: 'Solicitar como Comprador',
    },
    producerBtn: {
      AZ: 'İstehsalçı kimi müraciət et',
      EN: 'Apply as a Producer',
      TR: 'Üretici olarak başvur',
      RU: 'Подать заявку как производитель',
      AR: 'تقديم طلب كمنتج',
      ES: 'Solicitar como Productor',
    },
    contactBtn: {
      AZ: 'Bizimlə əlaqə saxlayın',
      EN: 'Contact Us',
      TR: 'Bizimle iletişim kurun',
      RU: 'Свяжитесь с нами',
      AR: 'اتصل بنا',
      ES: 'Contáctenos',
    },
  },
};

