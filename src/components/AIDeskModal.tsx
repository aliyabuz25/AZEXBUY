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

const FAQ_LIST: Record<Locale, { q: string; a: string }[]> = {
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
      q: 'شهادات الصحة النباتية AQTA وشهادة المنشأ',
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
  const getGreeting = () => {
    switch (locale) {
      case 'AZ':
        return 'Salam! AZEXBUY İxrac və Təchizat Masasına xoş gəlmisiniz. Sizə necə kömək edə bilərik? Aşağıdakı hazır mövzulardan birini seçə və ya bizə birbaşa mesajınızı yaza bilərsiniz.';
      case 'TR':
        return 'Merhaba! AZEXBUY İhracat ve Tedarik Masasına hoş geldiniz. Size nasıl yardımcı olabiliriz? Aşağıdaki hazır sorulardan seçebilir veya doğrudan mesajınızı iletebilirsiniz.';
      case 'RU':
        return 'Здравствуйте! Добро пожаловать в центр поддержки AZEXBUY. Выберите готовый вопрос ниже или напишите нам сообщение.';
      default:
        return 'Hello! Welcome to AZEXBUY Trade & Sourcing Desk. How can we help you today? Choose a question below or send us a direct message.';
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

  // Form states for sending message to manager
  const [userMessage, setUserMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [step, setStep] = useState<'chat' | 'ask_email' | 'sending' | 'sent'>('chat');
  const [errorMsg, setErrorMsg] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, step]);

  // Reset or re-greet if locale changes while closed
  useEffect(() => {
    if (!isOpen) {
      setStep('chat');
      setErrorMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const faqs = FAQ_LIST[locale] || FAQ_LIST.EN;

  const handleSelectFaq = (item: { q: string; a: string }) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: item.q,
      timestamp: time,
    };
    const deskReply: ChatMessage = {
      id: `desk-${Date.now() + 1}`,
      sender: 'desk',
      text: item.a,
      timestamp: time,
    };
    const followUp: ChatMessage = {
      id: `desk-follow-${Date.now() + 2}`,
      sender: 'desk',
      text:
        locale === 'AZ'
          ? 'Bu mövzuda xüsusi sorğunuz və ya sifarişiniz varsa, zəhmət olmasa aşağıdan mesajınızı və əlaqə e-poçtunuzu qeyd edin — rəhbərliyə və ticarət menecerimizə çatdırılacaq.'
          : locale === 'TR'
          ? 'Bu konuda özel bir sorunuz veya talebiniz varsa lütfen mesajınızı ve e-posta adresinizi bırakın — ticaret yöneticimize anında iletilecektir.'
          : locale === 'RU'
          ? 'Если у вас есть индивидуальный запрос, пожалуйста, напишите ваше сообщение и email ниже — мы передадим его менеджеру.'
          : 'If you have a custom inquiry or order, please leave your message and email below — it will be delivered directly to our desk manager.',
      timestamp: time,
    };

    setMessages((prev) => [...prev, userMsg, deskReply, followUp]);
  };

  const handleStartMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userMessage.trim()) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `usr-msg-${Date.now()}`,
      sender: 'user',
      text: userMessage.trim(),
      timestamp: time,
    };
    const deskPrompt: ChatMessage = {
      id: `desk-prompt-${Date.now() + 1}`,
      sender: 'desk',
      text:
        locale === 'AZ'
          ? 'Mesajınız qəbul edildi. Rəhbərliyin və ixrac menecerimizin sizinlə dərhal əlaqə saxlaması üçün zəhmət olmasa e-poçt ünvanınızı və adınızı daxil edin.'
          : locale === 'TR'
          ? 'Mesajınız alındı. Yöneticimizin size en kısa sürede dönüş yapabilmesi için lütfen adınızı ve e-posta adresinizi giriniz.'
          : locale === 'RU'
          ? 'Ваше сообщение принято. Пожалуйста, укажите ваше имя и email для оперативной связи с менеджером.'
          : 'Thank you for your message. Please provide your name and email address so our trade manager can reply to you promptly.',
      timestamp: time,
    };

    setMessages((prev) => [...prev, userMsg, deskPrompt]);
    setStep('ask_email');
    setErrorMsg('');
  };

  const handleSendToManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail.trim()) {
      setErrorMsg(
        locale === 'AZ'
          ? 'Zəhmət olmasa e-poçt ünvanınızı daxil edin.'
          : locale === 'TR'
          ? 'Lütfen e-posta adresinizi giriniz.'
          : 'Please enter your email address.'
      );
      return;
    }

    setStep('sending');
    setErrorMsg('');

    try {
      // Send directly to AZEXBUY contact & notification system
      const res = await fetch('/api/azexbuy/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: userName.trim() || (locale === 'AZ' ? 'Onlayn Çat Ziyarətçisi' : 'Online Chat Visitor'),
          organization: 'Trade Desk Live Chat',
          email: userEmail.trim(),
          inquiryType: 'Trade Desk Live Inquiry',
          message: userMessage.trim() || 'Salam, Trade Desk vasitəsilə sorğu göndərildi.',
        }),
      });

      if (!res.ok) {
        throw new Error('Server error');
      }

      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const confirmMsg: ChatMessage = {
        id: `desk-success-${Date.now()}`,
        sender: 'desk',
        text:
          locale === 'AZ'
            ? `✅ Təşəkkür edirik! Mesajınız və sorğunuz rəhbərliyə (${userEmail}) ünvanı ilə uğurla çatdırıldı. Ən qısa zamanda sizinlə əlaqə saxlanılacaq.`
            : locale === 'TR'
            ? `✅ Teşekkür ederiz! Mesajınız yöneticiye başarıyla iletildi (${userEmail}). En kısa sürede sizinle iletişime geçilecektir.`
            : locale === 'RU'
            ? `✅ Спасибо! Ваше сообщение отправлено руководству (${userEmail}). Мы свяжемся с вами в ближайшее время.`
            : `✅ Thank you! Your message has been sent to our desk management (${userEmail}). Our team will get back to you shortly.`,
        timestamp: time,
      };

      setMessages((prev) => [...prev, confirmMsg]);
      setStep('sent');
      setUserMessage('');
      setUserEmail('');
      setUserName('');
    } catch (err) {
      console.error(err);
      setErrorMsg(
        locale === 'AZ'
          ? 'Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin və ya info@azexbuy.com ilə əlaqə saxlayın.'
          : 'Failed to send message. Please try again or reach out to info@azexbuy.com.'
      );
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
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0f3156]"></span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold tracking-tight">AZEXBUY Trade Desk</h4>
              </div>
              <p className="text-[11px] text-emerald-300 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{locale === 'AZ' ? 'Onlayn Dəstək' : locale === 'TR' ? 'Çevrimiçi Destek' : 'Online Desk'}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-200 hover:text-white transition-colors cursor-pointer"
            aria-label="Close chat"
          >
            <i className="fa-solid fa-xmark text-xs"></i>
          </button>
        </div>

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

          {/* FAQ Quick Selection Chips inside stream if on chat step */}
          {step === 'chat' && (
            <div className="pt-1 pb-2 space-y-1.5">
              <span className="text-[10.5px] font-semibold text-slate-500 uppercase tracking-wider block px-1">
                {locale === 'AZ' ? 'Tez-tez verilən suallar:' : locale === 'TR' ? 'Hazır Sorular:' : 'Suggested topics:'}
              </span>
              <div className="flex flex-col gap-1.5">
                {faqs.map((faq, idx) => (
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
            <form onSubmit={handleStartMessage} className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  placeholder={
                    locale === 'AZ'
                      ? 'Rəhbərliyə sual və ya mesajınızı yazın...'
                      : locale === 'TR'
                      ? 'Yöneticiye iletmek için mesajınızı yazın...'
                      : 'Type your message for our desk manager...'
                  }
                  className="flex-1 h-10 px-3.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0f3156] focus:bg-white transition-all"
                />
                <button
                  type="submit"
                  disabled={!userMessage.trim()}
                  className="h-10 w-10 bg-[#0f3156] hover:bg-[#081c33] disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0"
                  aria-label="Send"
                >
                  <i className="fa-solid fa-paper-plane text-xs"></i>
                </button>
              </div>
              <div className="flex items-center justify-between px-1 text-[10px] text-slate-400">
                <span>{locale === 'AZ' ? 'Mesajınız birbaşa rəhbərliyə çatdırılacaq' : 'Messages are routed to management'}</span>
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
                  <span>{locale === 'AZ' ? 'Əlaqə Məlumatı' : 'Contact Information'}</span>
                  <button
                    type="button"
                    onClick={() => setStep('chat')}
                    className="text-slate-400 hover:text-slate-600 text-[10px]"
                  >
                    {locale === 'AZ' ? 'Geri' : 'Back'}
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
                  placeholder={locale === 'AZ' ? 'E-poçt ünvanınız (mütləq)' : 'Your email address (required)'}
                  className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0f3156]"
                />
                {errorMsg && <p className="text-[10px] text-red-500 font-medium">{errorMsg}</p>}
                <button
                  type="submit"
                  className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <i className="fa-solid fa-paper-plane text-[11px]"></i>
                  <span>{locale === 'AZ' ? 'Rəhbərliyə Göndər' : 'Send to Manager'}</span>
                </button>
              </div>
            </form>
          )}

          {step === 'sending' && (
            <div className="py-3 flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
              <i className="fa-solid fa-circle-notch animate-spin text-emerald-600"></i>
              <span>{locale === 'AZ' ? 'Rəhbərliyə yönləndirilir...' : 'Sending to management...'}</span>
            </div>
          )}

          {step === 'sent' && (
            <div className="text-center py-2 space-y-1.5">
              <p className="text-[11px] text-emerald-600 font-bold">
                {locale === 'AZ' ? 'Mesajınız uğurla çatdırıldı!' : 'Message successfully sent!'}
              </p>
              <button
                type="button"
                onClick={() => setStep('chat')}
                className="text-[11px] text-[#0f3156] font-semibold underline cursor-pointer"
              >
                {locale === 'AZ' ? 'Yeni sual ver' : 'Ask another question'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
