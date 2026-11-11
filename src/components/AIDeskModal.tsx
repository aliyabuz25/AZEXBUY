import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Locale } from '../types';

interface AIDeskModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  onOpenRFQ?: () => void;
  onOpenProducer?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'desk' | 'user';
  text: string;
  timestamp: string;
}

interface FaqItem {
  q: string;
  a: string;
}

const DEFAULT_FAQS: Record<Locale, FaqItem[]> = {
  AZ: [
    {
      q: 'Orta Dəhliz tranzit müddətləri və Ələt Limanı marşrutları',
      a: 'Trans-Xəzər Beynəlxalq Nəqliyyat Marşrutu (Orta Dəhliz):\n• Bakı (Ələt Limanı) — Qara Dəniz (Poti/Batumi): 24-36 saat (dəmiryolu/avto)\n• Bakı — Türkiyə (BTK dəmiryolu): 3-5 gün\n• Qara dəniz — Avropa İttifaqı (Konstansa/Burqas): 2-3 gün\nYaşıl Dəhliz sistemi ilə sürətli gömrük rəsmiləşdirilməsi təmin olunur.',
    },
    {
      q: 'Azərbaycan fındığı üçün HS kodu və ixrac standartları',
      a: '🌰 Azərbaycan Fındığı (HS Kodu: 0802.22):\n• Mənşə: Zaqatala-Şəki-Qax zonası (Ata-Baba növü)\n• Keyfiyyət: Kalibr 11-13mm, 13-15mm | Nəmlik < 5.5% | Aflatoksin B1 < 2ppb\n• Sertifikatlar: AQTA Fitosanitar, EUR.1 / CT-1 Mənşə, ISO 22000, Halal.',
    },
    {
      q: 'Incoterms 2020: FOB Bakı və CIF Konstansa fərqi nədir?',
      a: '• FOB (Ələt Limanı / Bakı): Satıcı malları limana çatdırır və gəmiyə yükləyir. Əsas daşıma və sığortanı alıcı qarşılayır.\n• CIF (Konstansa / Mersin): AZEXBUY və ya satıcı dəniz daşıma xərclərini və dəniz sığortasını təyinat limanına qədər ödəyir.',
    },
    {
      q: 'AQTA Fitosanitar və EUR.1 mənşə sertifikatları qaydaları',
      a: 'AQTA sertifikatı kənd təsərrüfatı və qida məhsulları üçün icbaridir. EUR.1 sertifikatı Avropa İttifaqına güzəştli ixrac üçün, CT-1 sertifikatı isə MDB ölkələrinə rüsumsuz ixrac üçün təqdim edilir.',
    },
    {
      q: 'Yerli istehsalçılar ixrac masasına necə qoşulur?',
      a: 'Yerli istehsalçılar platformada "İstehsalçı kimi müraciət" bölməsindən və ya birbaşa bu çat vasitəsilə müraciət edərək AZEXBUY qlobal tərəfdaşlıq və ixrac auditinə qoşula bilərlər.',
    },
  ],
  TR: [
    {
      q: 'Orta Koridor transit süreleri ve Alat Limanı rotaları',
      a: 'Trans-Hazar Uluslararası Taşımacılık Güzergahı (Orta Koridor):\n• Bakü (Alat Limanı) — Karadeniz (Poti/Batum): 24-36 saat\n• Bakü — Türkiye (BTK demiryolu): 3-5 gün\n• Karadeniz — AB (Köstence): 2-3 gün\nYeşil Koridor ile hızlı gümrükleme sağlanmaktadır.',
    },
    {
      q: 'Azerbaycan fındığı için GTİP / HS kodu ve kalite şartları',
      a: '🌰 Azerbaycan Fındığı (HS: 0802.22):\n• Menşei: Zaqatala-Şeki bölgesi (Ata-Baba çeşidi)\n• Kalibre 11-13mm, 13-15mm | Nem < %5.5 | Aflatoksin B1 < 2ppb\n• Sertifikalar: AQTA Bitki Sağlığı, EUR.1 / CT-1, ISO 22000, Helal.',
    },
    {
      q: 'Incoterms 2020: FOB Bakü ve CIF Köstence farkı',
      a: '• FOB (Bakü/Alat): Satıcı malları limanda gemiye yükler; navlun ve sigorta alıcıya aittir.\n• CIF (Köstence / Mersin): Satıcı navlun ve deniz sigortasını hedef limana kadar karşılar.',
    },
    {
      q: 'AQTA Bitki Sağlığı ve Menşe Belgeleri gereksinimleri',
      a: 'Gıda ve tarım ürünlerinde AQTA sertifikası zorunludur. AB için EUR.1, BDT ülkeleri için CT-1 menşe belgeleri düzenlenir.',
    },
    {
      q: 'Yerli üreticiler ihracat masasına nasıl katılır?',
      a: 'Yerli üreticiler sitedeki Üretici Başvuru formunu doldurarak veya bu sohbetten doğrudan mesaj ileterek ihracat masasına kaydolabilir.',
    },
  ],
  EN: [
    {
      q: 'Middle Corridor transit times & Alat Port routes',
      a: 'Trans-Caspian International Transport Route (TITR / Middle Corridor):\n• Baku (Alat Port) -> Black Sea Ports (Poti/Batumi): 24-36 hours\n• Baku -> Türkiye (via BTK railway): 3-5 days\n• Black Sea -> EU (Constanta/Burgas): 2-3 days\nStreamlined digital customs clearance via Azerbaijan Green Corridor.',
    },
    {
      q: 'HS Code & export specifications for Azerbaijani hazelnuts',
      a: '🌰 Azerbaijani Hazelnuts (HS Code: 0802.22):\n• Origin: Zaqatala-Sheki-Gakh region (Ata-Baba variety)\n• Specs: Caliber 11-13mm, 13-15mm | Moisture < 5.5% | Aflatoxin B1 < 2ppb\n• Certificates: AQTA Phytosanitary, EUR.1 / CT-1 Origin, ISO 22000, Halal.',
    },
    {
      q: 'Incoterms 2020: FOB Baku vs CIF Constanta difference',
      a: '• FOB (Baku / Alat Port): Seller loads cargo onboard vessel at Baku; buyer pays sea freight and maritime insurance.\n• CIF (Constanta / Mersin): AZEXBUY covers sea freight and marine insurance to buyer\'s destination port.',
    },
    {
      q: 'AQTA Phytosanitary & EUR.1 origin certification rules',
      a: 'Mandatory AQTA Phytosanitary approval for agri-food exports. EUR.1 provides preferential tariffs to EU markets; CT-1 provides zero-duty entry across CIS.',
    },
    {
      q: 'How do local producers join the export desk?',
      a: 'Producers can submit their company portfolio through the Producer portal or leave a direct message right here in this chat.',
    },
  ],
  RU: [
    {
      q: 'Сроки транзита по Среднему коридору и Порт Алят',
      a: 'ТМТМ (Средний коридор):\n• Баку (Порт Алят) — Черное море (Поти/Батуми): 24-36 часов\n• Баку — Турция (ж/д БТК): 3-5 дней\n• Черное море — ЕС (Констанца): 2-3 дня.',
    },
    {
      q: 'Код ТН ВЭД и стандарты для азербайджанского фундука',
      a: '🌰 Азербайджанский фундук (ТН ВЭД: 0802.22):\n• Происхождение: Загатала-Шеки (сорт Ата-Баба)\n• Калибр 11-13мм, 13-15мм | Влажность < 5.5% | Афлатоксин B1 < 2ppb\n• Сертификация: AQTA, СТ-1 / EUR.1, ISO 22000.',
    },
    {
      q: 'Инкотермс 2020: Сравнение FOB Баку и CIF Констанца',
      a: '• FOB (Баку/Алят): Погрузка на борт в порту отправления за счет продавца, фрахт за счет покупателя.\n• CIF (Констанца): Продавец оплачивает морской фрахт и страхование до порта назначения.',
    },
    {
      q: 'Правила фитосанитарного контроля AQTA и EUR.1 / СТ-1',
      a: 'AQTA обязателен для агропродукции. СТ-1 дает право беспошлинного ввоза в СНГ, EUR.1 — преференциальный режим в ЕС.',
    },
    {
      q: 'Как производителям подключиться к экспортному столу?',
      a: 'Заполните заявку на странице для производителей или отправьте сообщение здесь в чате.',
    },
  ],
  AR: [
    {
      q: 'أوقات العبور عبر الممر الأوسط وميناء ألات',
      a: 'الممر الأوسط الدولي:\n• باكو (ميناء ألات) إلى موانئ البحر الأسود: 24-36 ساعة\n• باكو إلى تركيا (سكة حديد BTK): 3-5 أيام\n• البحر الأسود إلى الاتحاد الأوروبي: 2-3 أيام.',
    },
    {
      q: 'رمز النظام المنسق ومواصفات البندق الأذربيجاني',
      a: '🌰 البندق الأذربيجاني (HS: 0802.22):\n• المنشأ: زاغاتالا - شاكي\n• الحجم 11-13 ملم | الرطوبة < 5.5% | شهادات AQTA و EUR.1 و Halal.',
    },
    {
      q: 'شروط التجارة 2020: FOB باكو مقابل CIF مرسين',
      a: 'FOB باكو: يتحمل المشتري الشحن البحري والتأمين.\nCIF مرسين: يغطي البائع تكاليف الشحن البحري والتأمين حتى ميناء الوجهة.',
    },
    {
      q: 'شهادات الصحة النباتية AQTA وشهادة المنşأ',
      a: 'شهادة AQTA إلزامية للصادرات الغذائية والزراعية من أذربيجان.',
    },
    {
      q: 'كيف ينضم المنتجون المحليون لمكتب التصدير؟',
      a: 'يمكن للمنتجين تقديم طلب عبر الموقع أو ترك رسالة هنا في المحادثة مباشرة.',
    },
  ],
  ES: [
    {
      q: 'Tiempos de tránsito del Corredor Medio y Puerto de Alat',
      a: 'Ruta Internacional Transcaspiana:\n• Bakú (Puerto de Alat) -> Puertos del Mar Negro: 24-36 horas\n• Bakú -> Turquía (BTK): 3-5 días\n• Mar Negro -> UE (Constanza): 2-3 días.',
    },
    {
      q: 'Código arancelario (HS) y especificaciones de avellanas',
      a: '🌰 Avellanas de Azerbaiyán (HS: 0802.22):\n• Calibre 11-13mm, 13-15mm | Humedad < 5.5% | AQTA, EUR.1, ISO 22000.',
    },
    {
      q: 'Incoterms 2020: Diferencia entre FOB Bakú y CIF Constanza',
      a: '• FOB Bakú: El comprador cubre el flete marítimo.\n• CIF Constanza: AZEXBUY cubre flete y seguro hasta el puerto de destino.',
    },
    {
      q: 'Certificados fitosanitarios AQTA y origen EUR.1',
      a: 'Inspección oficial AQTA para productos agrícolas. EUR.1 para exportación preferencial a la UE.',
    },
    {
      q: '¿Cómo unirse al escritorio de exportación?',
      a: 'Complete el formulario para productores o envíenos un mensaje directo en este chat.',
    },
  ],
};

export const AIDeskModal: React.FC<AIDeskModalProps> = ({
  isOpen,
  onClose,
  locale,
  onOpenRFQ,
  onOpenProducer,
}) => {
  const [modelConnected, setModelConnected] = useState<boolean | null>(null);
  const [faqMode, setFaqMode] = useState<string>('hybrid');
  const [customFaqs, setCustomFaqs] = useState<FaqItem[]>([]);

  const getGreeting = () => {
    switch (locale) {
      case 'AZ':
        return 'Salam! AZEXBUY İxrac və Təchizat Masasına xoş gəlmisiniz. Sizə necə kömək edə bilərik?';
      case 'TR':
        return 'Merhaba! AZEXBUY İhracat ve Tedarik Masasına hoş geldiniz. Size nasıl yardımcı olabiliriz?';
      case 'RU':
        return 'Здравствуйте! Добро пожаловать в центр поддержки AZEXBUY. Чем можем помочь?';
      default:
        return 'Hello! Welcome to AZEXBUY Trade & Sourcing Desk. How can we help you today?';
    }
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'init-1',
      sender: 'desk',
      text: getGreeting(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Form states
  const [userMessage, setUserMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [step, setStep] = useState<'chat' | 'ask_email' | 'sending' | 'sent'>('chat');
  const [errorMsg, setErrorMsg] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check backend AI status on mount / open
  useEffect(() => {
    if (isOpen) {
      fetch('/api/azexbuy/ai-status')
        .then((res) => res.json())
        .then((data) => {
          setModelConnected(Boolean(data.connected));
          setFaqMode(data.faq_mode || 'hybrid');
          if (Array.isArray(data.custom_faqs) && data.custom_faqs.length > 0) {
            setCustomFaqs(
              data.custom_faqs.map((f: any) => ({
                q: f.question,
                a: f.answer || '',
              }))
            );
          }
        })
        .catch(() => {
          setModelConnected(false);
        });
    }
  }, [isOpen]);

  // Auto scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, step, isAiThinking]);

  // Reset if closed
  useEffect(() => {
    if (!isOpen) {
      setStep('chat');
      setErrorMsg('');
      setIsAiThinking(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Decide FAQs list based on admin settings
  let activeFaqs: FaqItem[] = [];
  if (faqMode === 'manual' && customFaqs.length > 0) {
    activeFaqs = customFaqs;
  } else if (faqMode === 'hybrid' && customFaqs.length > 0) {
    activeFaqs = customFaqs;
  } else {
    activeFaqs = DEFAULT_FAQS[locale] || DEFAULT_FAQS.EN;
  }

  const handleSelectFaq = async (item: FaqItem) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: item.q,
      timestamp: time,
    };

    setMessages((prev) => [...prev, userMsg]);

    // If answer exists in manual/hybrid FAQ, show immediately
    if (item.a && item.a.trim().length > 0 && faqMode !== 'ai') {
      const deskReply: ChatMessage = {
        id: `desk-${Date.now() + 1}`,
        sender: 'desk',
        text: item.a,
        timestamp: time,
      };
      setMessages((prev) => [...prev, deskReply]);
    } else {
      // Answer is empty or faqMode is 'ai' -> AI dynamically answers this topic
      setIsAiThinking(true);
      try {
        const res = await fetch('/api/azexbuy/ai-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: item.q,
            history: messages,
            locale,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success && data.reply) {
          const aiReply: ChatMessage = {
            id: `desk-ai-${Date.now()}`,
            sender: 'desk',
            text: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prev) => [...prev, aiReply]);
        }
      } catch {
        // Fallback
      } finally {
        setIsAiThinking(false);
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = userMessage.trim();
    if (!query || isAiThinking) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `usr-msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: time,
    };

    setMessages((prev) => [...prev, userMsg]);
    setUserMessage('');
    setIsAiThinking(true);

    try {
      const res = await fetch('/api/azexbuy/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages,
          locale,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.reply) {
        const aiReply: ChatMessage = {
          id: `desk-ai-${Date.now()}`,
          sender: 'desk',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiReply]);
      } else {
        const fallbackMsg: ChatMessage = {
          id: `desk-fb-${Date.now()}`,
          sender: 'desk',
          text:
            locale === 'AZ'
              ? 'Mesajınız qəbul edildi. Ticarət menecerimizin sizinlə birbaşa əlaqə saxlaması üçün zəhmət olmasa e-poçt ünvanınızı qeyd edin.'
              : 'Thank you. Please leave your email address so our trade desk manager can respond to you directly.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, fallbackMsg]);
        setStep('ask_email');
      }
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `desk-fb-${Date.now()}`,
        sender: 'desk',
        text:
          locale === 'AZ'
            ? 'Mesajınız qəbul edildi. Ticarət menecerimizin cavab verməsi üçün zəhmət olmasa e-poçtunuzu qeyd edin.'
            : 'Your message was received. Please provide your email address so our team can follow up.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      setStep('ask_email');
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleSendToManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail.trim()) {
      setErrorMsg(locale === 'AZ' ? 'Zəhmət olmasa e-poçt ünvanınızı daxil edin.' : 'Please enter your email.');
      return;
    }

    setStep('sending');
    setErrorMsg('');

    try {
      const lastUserMsg = [...messages].reverse().find((m) => m.sender === 'user')?.text || 'Trade Desk Live Chat Sorğusu';
      const res = await fetch('/api/azexbuy/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: userName.trim() || (locale === 'AZ' ? 'Canlı Çat Ziyarətçisi' : 'Live Chat Visitor'),
          organization: 'Trade Desk Live Portal',
          email: userEmail.trim(),
          inquiryType: 'Trade Desk Live Inquiry',
          message: lastUserMsg,
        }),
      });

      if (!res.ok) throw new Error('Server error');

      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const confirmMsg: ChatMessage = {
        id: `desk-success-${Date.now()}`,
        sender: 'desk',
        text:
          locale === 'AZ'
            ? `✅ Təşəkkür edirik! Mesajınız rəhbərliyə çatdırıldı (${userEmail}). Ən qısa zamanda əlaqə saxlanılacaq.`
            : `✅ Thank you! Your inquiry was forwarded to our desk management (${userEmail}). We will contact you shortly.`,
        timestamp: time,
      };

      setMessages((prev) => [...prev, confirmMsg]);
      setStep('sent');
      setUserEmail('');
      setUserName('');
    } catch {
      setErrorMsg(locale === 'AZ' ? 'Xəta baş verdi. Yenidən cəhd edin.' : 'Failed to send. Please try again.');
      setStep('ask_email');
    }
  };

  return createPortal(
    <div className="fixed bottom-5 right-5 z-[99999] flex flex-col items-end pointer-events-auto font-sans">
      {/* Chat Window Container (Tawk.to Style) */}
      <div className="w-[92vw] sm:w-[380px] h-[540px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Modern Compact Header */}
        <div className="bg-[#0f3156] text-white px-4 py-3.5 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/20">
                <i className="fa-solid fa-headset text-sm"></i>
              </div>
              <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#0f3156] ${
                modelConnected ? 'bg-emerald-400' : 'bg-amber-400'
              }`}></span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold tracking-tight">AZEXBUY Trade Desk</h4>
              </div>
              <p className="text-[11px] font-medium flex items-center gap-1 text-slate-200">
                {modelConnected ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-emerald-300">
                      {locale === 'AZ' ? 'AI Model Aktiv' : 'AI Active'}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    <span className="text-amber-300">
                      {locale === 'AZ' ? 'Rəhbərlik Masası' : 'Desk Management'}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStep('ask_email')}
              title={locale === 'AZ' ? 'Rəhbərliyə mesaj göndər' : 'Leave message for management'}
              className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded-md text-[10px] font-semibold text-slate-200 transition-colors cursor-pointer"
            >
              {locale === 'AZ' ? 'Menecerə Yaz' : 'Contact Desk'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-200 hover:text-white transition-colors cursor-pointer"
              aria-label="Close chat"
            >
              <i className="fa-solid fa-xmark text-xs"></i>
            </button>
          </div>
        </div>

        {/* If model not connected banner */}
        {modelConnected === false && (
          <div className="bg-amber-50 border-b border-amber-200 px-3.5 py-2 text-[11px] text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <i className="fa-solid fa-triangle-exclamation text-amber-600"></i>
              <span>{locale === 'AZ' ? 'AI modeli hələ bağlanmayıb. Sorğularınızı birbaşa menecerə göndərə bilərsiniz.' : 'AI model is offline. Direct manager routing is active.'}</span>
            </div>
          </div>
        )}

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8fafc]/70 text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-xs ${
                  m.sender === 'user'
                    ? 'bg-[#0f3156] text-white rounded-br-xs font-medium'
                    : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">{m.timestamp}</span>
            </div>
          ))}

          {isAiThinking && (
            <div className="flex items-center gap-2 text-slate-500 text-[11px] p-2 bg-white/80 rounded-xl border border-slate-200 w-fit">
              <i className="fa-solid fa-circle-notch animate-spin text-emerald-600 text-xs"></i>
              <span>{locale === 'AZ' ? 'Dəqiq ticarət məlumatı hazırlanır...' : 'Analyzing trade data...'}</span>
            </div>
          )}

          {/* FAQ Quick Selection Chips inside stream */}
          {step === 'chat' && activeFaqs.length > 0 && (
            <div className="pt-1 pb-2 space-y-1.5">
              <span className="text-[10.5px] font-semibold text-slate-500 uppercase tracking-wider block px-1">
                {locale === 'AZ' ? 'Mövzu üzrə hazır suallar:' : locale === 'TR' ? 'Konuya Uygun Sorular:' : 'Suggested topics:'}
              </span>
              <div className="flex flex-col gap-1.5">
                {activeFaqs.map((faq, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectFaq(faq)}
                    className="text-left px-3 py-2 bg-white hover:bg-slate-50 hover:border-slate-300 border border-slate-200 rounded-xl text-slate-700 font-medium transition-all text-[11.5px] leading-snug cursor-pointer shadow-2xs flex items-center justify-between group"
                  >
                    <span>{faq.q}</span>
                    <i className="fa-solid fa-arrow-right text-[10px] text-slate-300 group-hover:text-[#0f3156] group-hover:translate-x-0.5 transition-all shrink-0 ml-2"></i>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Area */}
        <div className="p-3 bg-white border-t border-slate-100 shrink-0">
          {step === 'chat' && (
            <form onSubmit={modelConnected ? handleSendMessage : (e) => { e.preventDefault(); setStep('ask_email'); }} className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  placeholder={
                    !modelConnected
                      ? (locale === 'AZ' ? 'Menecerə mesaj yazmaq üçün klikləyin...' : 'Click to send message to management...')
                      : (locale === 'AZ' ? 'Sualınızı və ya tələbinizi yazın...' : 'Type your trade question or inquiry...')
                  }
                  className="flex-1 h-10 px-3.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0f3156] focus:bg-white transition-all"
                />
                <button
                  type="submit"
                  disabled={!userMessage.trim() || isAiThinking}
                  className="h-10 w-10 bg-[#0f3156] hover:bg-[#081c33] disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0"
                  aria-label="Send"
                >
                  <i className="fa-solid fa-paper-plane text-xs"></i>
                </button>
              </div>
              <div className="flex items-center justify-between px-1 text-[10px] text-slate-400">
                <button
                  type="button"
                  onClick={() => setStep('ask_email')}
                  className="text-slate-500 hover:text-[#0f3156] font-medium underline cursor-pointer"
                >
                  {locale === 'AZ' ? 'Rəhbərliyə birbaşa yaz' : 'Leave note for management'}
                </button>
                {onOpenRFQ && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenRFQ();
                    }}
                    className="text-[#0f3156] font-bold hover:underline cursor-pointer"
                  >
                    + RFQ
                  </button>
                )}
              </div>
            </form>
          )}

          {step === 'ask_email' && (
            <form onSubmit={handleSendToManager} className="space-y-2">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-700 font-semibold text-[11px]">
                  <span>{locale === 'AZ' ? 'Rəhbərliyə İletişim / Əlaqə' : 'Forward to Management'}</span>
                  <button
                    type="button"
                    onClick={() => setStep('chat')}
                    className="text-slate-400 hover:text-slate-600 text-[10px] cursor-pointer"
                  >
                    {locale === 'AZ' ? 'Çata Qayıt' : 'Back to chat'}
                  </button>
                </div>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder={locale === 'AZ' ? 'Adınız / Şirkət' : 'Your name / Company'}
                  className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0f3156]"
                />
                <input
                  type="email"
                  required
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder={locale === 'AZ' ? 'E-poçt ünvanınız (mütləq)' : 'Your email (required)'}
                  className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0f3156]"
                />
                {errorMsg && <p className="text-[10px] text-red-500 font-medium">{errorMsg}</p>}
                <button
                  type="submit"
                  className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <i className="fa-solid fa-paper-plane text-[11px]"></i>
                  <span>{locale === 'AZ' ? 'Rəhbərliyə Göndər' : 'Send to Management'}</span>
                </button>
              </div>
            </form>
          )}

          {step === 'sending' && (
            <div className="py-3 flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
              <i className="fa-solid fa-circle-notch animate-spin text-emerald-600"></i>
              <span>{locale === 'AZ' ? 'Rəhbərliyə yönləndirilir...' : 'Forwarding to management...'}</span>
            </div>
          )}

          {step === 'sent' && (
            <div className="text-center py-2 space-y-1.5">
              <p className="text-[11px] text-emerald-600 font-bold">
                {locale === 'AZ' ? 'Mesajınız uğurla çatdırıldı!' : 'Message successfully forwarded!'}
              </p>
              <button
                type="button"
                onClick={() => setStep('chat')}
                className="text-[11px] text-[#0f3156] font-semibold underline cursor-pointer"
              >
                {locale === 'AZ' ? 'Çata qayıt' : 'Back to chat'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
