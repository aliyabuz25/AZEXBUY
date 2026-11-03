import { GoogleGenAI } from '@google/genai';
import { Locale } from '../types';

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  category?: 'hs-code' | 'logistics' | 'incoterms' | 'readiness' | 'general';
}

const DEFAULT_TRADE_KNOWLEDGE = [
  {
    keywords: ['hazelnut', 'fındıq', 'фундук', '080222', '0802'],
    response: {
      EN: '🌰 **Azerbaijani Hazelnuts (HS Code: 0802.22)**\n- **Origin:** Zaqatala-Sheki-Gakh agricultural belt (Ata-Baba variety).\n- **Annual Export Capacity:** 24,000+ MT.\n- **Quality Specs:** Caliber 11-13mm, 13-15mm | Moisture < 5.5% | Aflatoxin B1 < 2ppb (EU compliant).\n- **Standard Incoterms:** FCA Baku/Zaqatala, CIF Constanta/Hamburg, DAP Europe.\n- **Certifications Required:** AQTA Phytosanitary, EUR.1 / CT-1 Certificate of Origin, ISO 22000, Halal.\n- **Logistics Route:** Middle Corridor rail via BTK or truck via Georgia (7-12 days to Central Europe).',
      AZ: '🌰 **Azərbaycan Fındığı (HS Kodu: 0802.22)**\n- **Mənşə:** Zaqatala-Şəki-Qax bölgəsi (Ata-Baba növü).\n- **İllik İxrac Gücü:** 24,000+ Ton.\n- **Keyfiyyət:** Kalibr 11-13mm, 13-15mm | Nəmlik < 5.5% | Aflatoksin B1 < 2ppb (Aİ standartı).\n- **Tövsiyə olunan Incoterms:** FCA Zaqatala/Bakı, CIF Konstansa/Hamburq, DAP Avropa.\n- **Tələb olunan sertifikatlar:** AQTA Fitosanitar, EUR.1 / CT-1 Mənşə Sertifikatı, ISO 22000, Halal.\n- **Logistika Marşrutu:** Orta Dəhliz (BTK dəmiryolu və ya Gürcüstan üzərindən avtonəqliyyat, 7-12 gün).',
      RU: '🌰 **Азербайджанский фундук (Код ТН ВЭД: 0802.22)**\n- **Происхождение:** Загатала-Шекинский пояс (сорт Ата-Баба).\n- **Экспортная мощность:** 24,000+ тонн/год.\n- **Спецификации:** Калибр 11-13мм, 13-15мм | Влажность < 5.5% | Афлатоксин B1 < 2ppb.\n- **Инкотермс:** FCA Загатала, CIF Констанца, DAP Европа.\n- **Сертификация:** Фитосанитарный сертификат AQTA, СТ-1 / EUR.1, ISO 22000, Халяль.',
    },
  },
  {
    keywords: ['pomegranate', 'nar', 'гранат', '081090', 'goychay', 'göyçay'],
    response: {
      EN: '🍎 **Azerbaijani Pomegranate & Juices (HS Code: 0810.90 / 2009.89)**\n- **Origin:** Goychay & Shirvan Valley (Guloysha, Bala Mursal varieties).\n- **Export Capacity:** 45,000 MT fresh fruit, 12,000 MT NFC cold-pressed direct juice.\n- **Quality Specs:** Brix 14-16% | Size 300g-600g | 100% natural without added sugar.\n- **Incoterms:** CIF Mersin / Poti / Constanta, DAP Eastern Europe.\n- **Certifications:** GLOBALG.A.P., AQTA, ISO 22000, Kosher, Halal.\n- **Logistics:** Reefer containers (+2°C to +4°C) via Port of Alat / Poti.',
      AZ: '🍎 **Azərbaycan Narı və Təbii Nar Şirələri (HS Kodu: 0810.90 / 2009.89)**\n- **Mənşə:** Göyçay və Şirvan düzü (Gülövşə, Bala Mürsəl növləri).\n- **İxrac Gücü:** 45,000 Ton təzə nar, 12,000 Ton birbaşa sıxılmış təbii şirə.\n- **Keyfiyyət:** Brix 14-16% | Çəki 300q-600q | Şəkərsiz, 100% təbii.\n- **Tövsiyə olunan Incoterms:** CIF Mersin / Poti / Konstansa, DAP Şərqi Avropa.\n- **Sertifikatlar:** GLOBALG.A.P., AQTA Fitosanitar, ISO 22000, Halal.\n- **Logistika:** Refrijerator konteynerlər (+2°C ... +4°C).',
      RU: '🍎 **Азербайджанский гранат и сок (Код ТН ВЭД: 0810.90 / 2009.89)**\n- **Происхождение:** Гёйчай (сорта Гюлейша, Бала Мюрсель).\n- **Объем:** 45,000 тонн свежих плодов, 12,000 тонн сока прямого отжима.\n- **Стандарты:** Брикс 14-16% | Сертификаты GLOBALG.A.P., AQTA, ISO 22000.',
    },
  },
  {
    keywords: ['middle corridor', 'orta dəhliz', 'titr', 'marşrut', 'logistics', 'route', 'alat', 'transit'],
    response: {
      EN: '🚢 **Trans-Caspian International Transport Route (Middle Corridor / TITR)**\n- **Key Hub:** Baku International Sea Trade Port (Alat Port) — 15M MT throughput.\n- **Transit Times:**\n  * China/Central Asia -> Baku: 5-8 Days\n  * Baku -> Black Sea Ports (Poti/Batumi): 24-36 Hours (Rail/Road)\n  * Black Sea -> EU (Constanta/Burgas): 2-3 Days\n  * Baku -> Türkiye (via BTK railway): 3-5 Days\n- **Key Advantages:** 3x faster than sea shipping through Suez, immune to Red Sea disruptions, unified customs clearance with Azerbaijan Green Corridor.',
      AZ: '🚢 **Trans-Xəzər Beynəlxalq Nəqliyyat Marşrutu (Orta Dəhliz / TITR)**\n- **Əsas Qovşaq:** Bakı Beynəlxalq Dəniz Ticarət Limanı (Ələt) — 15 milyon ton illik ötürücülük.\n- **Tranzit Müddətləri:**\n  * Mərkəzi Asiya -> Bakı: 5-8 Gün\n  * Bakı -> Qara dəniz limanları (Poti/Batumi): 24-36 Saat (Dəmiryolu/Avtomobil)\n  * Qara dəniz -> Aİ (Konstansa/Burqas): 2-3 Gün\n  * Bakı -> Türkiyə (Bakı-Tbilisi-Qars BTK xətti ilə): 3-5 Gün\n- **Üstünlüklər:** Süveyş dəniz yolundan 3 dəfə sürətli, Qırmızı dəniz risklərindən azad, Yaşıl Dəhliz sürətli gömrük rəsmiləşdirilməsi.',
      RU: '🚢 **Срединный коридор (ТМТМ / Средний маршрут)**\n- **Центральный узел:** Бакинский международный морской торговый порт (Алят).\n- **Сроки доставки:** Баку -> Порты Черного моря (Поти/Батуми): 24-36 часов; Баку -> Турция (по ж/д БТК): 3-5 дней; Черное море -> ЕС (Констанца): 2-3 дня.',
    },
  },
  {
    keywords: ['incoterms', 'cif', 'fob', 'fca', 'dap', 'exw'],
    response: {
      EN: '📋 **Incoterms 2020 Guidance for Azerbaijan Exports**\n- **FCA (Baku/Factory):** Best for buyers arranging multimodal freight along the Middle Corridor.\n- **FOB (Port of Baku / Alat):** Seller covers local transport and loading onto vessel; buyer handles Caspian sea freight.\n- **CIF (Constanta / Mersin / Poti):** AZEXBUY covers freight and maritime insurance to the buyer\'s designated Black Sea / Mediterranean port.\n- **DAP (Delivered at Place):** Delivered directly to the buyer\'s terminal/warehouse in Europe, Türkiye, or GCC before import duties.',
      AZ: '📋 **Azərbaycan İxracı üçün Incoterms 2020 Bələdçisi**\n- **FCA (Bakı/Zavod):** Orta Dəhliz üzrə öz nəqliyyatını təşkil edən beynəlxalq alıcılar üçün ən əlverişli seçim.\n- **FOB (Bakı / Ələt Limanı):** Satıcı malları Ələt limanına çatdırır və gəmiyə yükləyir; dəniz daşımasını alıcı ödəyir.\n- **CIF (Konstansa / Mersin / Poti):** AZEXBUY malların sığortasını və təyinat limanına qədər dəniz fraxtını tam təmin edir.\n- **DAP (Təyinat Məntəqəsində Çatdırılma):** Mallar alıcının Avropa və ya Körfəzdəki anbarının qapısına qədər çatdırılır.',
      RU: '📋 **Инкотермс 2020 для экспорта из Азербайджана**\n- **FCA (Баку):** Идеально при самостоятельной мультимодальной логистике покупателя.\n- **CIF (Констанца / Мерсин):** Поставка с оплатой фрахта и страховки до порта покупателя.\n- **DAP:** Доставка непосредственно до склада покупателя в ЕС или СНГ.',
    },
  },
  {
    keywords: ['certification', 'aqta', 'sertifikat', 'eur.1', 'ct-1', 'gömrük', 'customs', 'standart'],
    response: {
      EN: '🛡️ **Institutional Certification & Export Documentation**\n- **Phytosanitary & Food Safety:** Issued by the Food Safety Agency of the Republic of Azerbaijan (AQTA) — mandatory for all agri-food exports.\n- **Certificates of Origin:**\n  * **CT-1:** Zero-tariff access to CIS and Eurasian Economic Union countries.\n  * **EUR.1:** Preferential tariff treatment for European Union trading partners.\n  * **General Form:** For global shipments to GCC, Asia, and the Americas.\n- **Green Corridor ("Yaşıl Dəhliz"):** Fast-track digital customs processing with pre-arrival electronic declarations, eliminating customs transit delays.',
      AZ: '🛡️ **Rəsmi Sertifikatlaşdırma və İxrac Sənədləri**\n- **Qida Təhlükəsizliyi və Fitosanitar:** Azərbaycan Respublikasının Qida Təhlükəsizliyi Agentliyi (AQTA) tərəfindən verilir — bütün kənd təsərrüfatı və ərzaq malları üçün icbaridir.\n- **Mənşə Sertifikatları:**\n  * **CT-1 Forması:** MDB ölkələrinə rüsumsuz ixrac imkanı.\n  * **EUR.1:** Avropa İttifaqı ölkələrinə güzəştli tarif rejimi.\n  * **Ümumi Forma:** Körfəz (GCC), Asiya və Amerika bazarları üçün.\n- **Yaşıl Dəhliz:** Dövlət Gömrük Komitəsinin elektron sistemi ilə sürətli rəsmiləşdirmə.',
      RU: '🛡️ **Сертификация и экспортная документация Азербайджана**\n- **AQTA:** Сертификаты безопасности пищевой продукции и фитосанитарные сертификаты.\n- **Сертификаты происхождения:** СТ-1 (беспошлинный ввоз в СНГ), EUR.1 (преференции в ЕС), общая форма.\n- **Зеленый коридор:** Ускоренное электронное таможенное декларирование.',
    },
  },
];

export async function askTradeAI(
  prompt: string,
  locale: Locale = 'EN',
  customApiKey?: string
): Promise<string> {
  const activeKey =
    customApiKey ||
    (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
    (typeof window !== 'undefined' && localStorage.getItem('azexbuy_gemini_key')) ||
    '';

  // If a valid Google Gemini API key format (typically starts with AIzaSy) is supplied, attempt live call
  if (activeKey && activeKey.startsWith('AIzaSy')) {
    try {
      const ai = new GoogleGenAI({ apiKey: activeKey });
      const systemInstruction = `You are the Sovereign Trade Advisor for AZEXBUY (Azerbaijan Export & Sourcing Facilitation Platform).
You assist international B2B buyers and Azerbaijani export manufacturers.
Provide concise, authoritative advice citing:
- HS Codes (e.g. 0802.22 for Ata-Baba hazelnuts, 0810.90 for Goychay pomegranates, 2515 for Dashkasan marble, 5701 for carpets, 7306 for steel pipes).
- Middle Corridor (TITR) logistics routes via Baku Alat Port and Baku-Tbilisi-Kars (BTK) railway.
- Incoterms 2020 (FOB Baku, CIF Constanta/Mersin, DAP Europe, FCA).
- Mandatory certifications: AQTA Food Safety, CT-1 / EUR.1 Certificate of Origin, ISO 22000, Halal.
Answer in the user's requested language (${locale}).`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `${systemInstruction}\n\nUser Question: ${prompt}`,
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (err: unknown) {
      console.warn('Gemini live call error, falling back to sovereign trade knowledge:', err);
    }
  }

  // Sovereign Knowledge Base Fallback
  const lower = prompt.toLowerCase();
  for (const item of DEFAULT_TRADE_KNOWLEDGE) {
    if (item.keywords.some((k) => lower.includes(k))) {
      const langKey = locale === 'AZ' ? 'AZ' : locale === 'RU' ? 'RU' : 'EN';
      return item.response[langKey] || item.response.EN;
    }
  }

  // Generic Sovereign Trade response
  if (locale === 'AZ') {
    return `🏛️ **AZEXBUY İxrac və Tədarük Mərkəzi**\n\nSorğunuz qeydə alındı. AZEXBUY Azərbaycanın istehsalçılarını beynəlxalq alıcılarla birləşdirir:\n- **Əsas İxrac Məhsulları:** Fındıq (HS 080222), Nar və Təbii Şirələr (HS 081090), Xurma (HS 081070), Xalçalar (HS 5701), Daşkəsən Mərməri (HS 2515), Polad Borular (HS 7306).\n- **Logistika:** Trans-Xəzər Beynəlxalq Nəqliyyat Marşrutu (Orta Dəhliz), Bakı Ələt Limanı və BTK dəmiryolu.\n- **Sertifikatlaşdırma:** AQTA Fitosanitar, EUR.1 / CT-1 Mənşə Sertifikatı və Yaşıl Dəhliz gömrük sistemi.\n\nZəhmət olmasa, maraqlandığınız məhsul adı, HS kodu və ya çatdırılma ölkəsini qeyd edin.`;
  }
  if (locale === 'RU') {
    return `🏛️ **Экспортный шлюз AZEXBUY**\n\nМы координируем экспорт сертифицированной азербайджанской продукции:\n- **Флагманские категории:** Фундук (ТН ВЭД 080222), гранат и соки прямого отжима (081090), мрамор (2515), ковры (5701), стальной прокат (7306).\n- **Транспорт:** Срединный коридор через Бакинский порт Алят и ж/д Баку-Тбилиси-Карс.\n- **Сертификаты:** Фитосанитарный контроль AQTA, СТ-1, EUR.1.`;
  }

  return `🏛️ **AZEXBUY Sovereign Digital Trade Gateway**\n\nAZEXBUY connects verified Azerbaijani manufacturers directly with international procurement officers:\n- **Flagship Export Commodities:** Shelled Hazelnuts (HS 0802.22), Goychay Pomegranates & Juice (HS 0810.90), Dried Persimmons (HS 0810.70), Dashkasan Marble (HS 2515), Hand-Woven Carpets (HS 5701), Structural Steel (HS 7306).\n- **Strategic Middle Corridor Route:** Through Baku Alat Port & BTK Railway (7-12 days to Europe, 3-5 days to Türkiye).\n- **Institutional Compliance:** AQTA Phytosanitary, EUR.1 / CT-1 Certificates of Origin, and Green Corridor customs clearance.\n\nPlease specify a product, HS code, or destination port to receive detailed tariff and transit estimates.`;
}
