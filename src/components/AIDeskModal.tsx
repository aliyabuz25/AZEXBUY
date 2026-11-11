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
  a?: string;
}

const DEFAULT_FAQS: Record<Locale, FaqItem[]> = {
  AZ: [
    { q: 'Orta Dəhliz tranzit müddətləri və Ələt Limanı marşrutları' },
    { q: 'Azərbaycan fındığı üçün HS kodu və ixrac standartları' },
    { q: 'Incoterms 2020: FOB Bakı və CIF Konstansa fərqi nədir?' },
    { q: 'AQTA Fitosanitar və EUR.1 mənşə sertifikatları qaydaları' },
    { q: 'Yerli istehsalçılar ixrac masasına necə qoşulur?' },
  ],
  TR: [
    { q: 'Orta Koridor transit süreleri ve Alat Limanı rotaları' },
    { q: 'Azerbaycan fındığı için GTİP / HS kodu ve kalite şartları' },
    { q: 'Incoterms 2020: FOB Bakü ve CIF Köstence farkı' },
    { q: 'AQTA Bitki Sağlığı ve Menşe Belgeleri gereksinimleri' },
    { q: 'Yerli üreticiler ihracat masasına nasıl katılır?' },
  ],
  EN: [
    { q: 'Middle Corridor transit times & Alat Port routes' },
    { q: 'HS Code & export specifications for Azerbaijani hazelnuts' },
    { q: 'Incoterms 2020: FOB Baku vs CIF Constanta difference' },
    { q: 'AQTA Phytosanitary & EUR.1 origin certification rules' },
    { q: 'How do local producers join the export desk?' },
  ],
  RU: [
    { q: 'Сроки транзита по Среднему коридору и Порт Алят' },
    { q: 'Код ТН ВЭД и стандарты для азербайджанского фундука' },
    { q: 'Инкотермс 2020: Сравнение FOB Баку и CIF Констанца' },
    { q: 'Правила фитосанитарного контроля AQTA и EUR.1 / СТ-1' },
    { q: 'Как производителям подключиться к экспортному столу?' },
  ],
  AR: [
    { q: 'أوقات العبور عبر الممر الأوسط وميناء ألات' },
    { q: 'رمز النظام المنسق ومواصفات البندق الأذربيجاني' },
    { q: 'شروط التجارة 2020: FOB باكو مقابل CIF مرسين' },
    { q: 'شهادات الصحة النباتية AQTA وشهادة المنشأ' },
    { q: 'كيف ينضم المنتجون المحليون لمكتب التصدير؟' },
  ],
  ES: [
    { q: 'Tiempos de tránsito del Corredor Medio y Puerto de Alat' },
    { q: 'Código arancelario (HS) y especificaciones de avellanas' },
    { q: 'Incoterms 2020: Diferencia entre FOB Bakú y CIF Constanza' },
    { q: 'Certificados fitosanitarios AQTA y origen EUR.1' },
    { q: '¿Cómo unirse al escritorio de exportación?' },
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
  const [customFaqs, setCustomFaqs] = useState<FaqItem[]>([]);

  const getGreeting = () => {
    switch (locale) {
      case 'AZ':
        return 'Salam! AZEXBUY İxrac və Təchizat Masasına xoş gəlmisiniz. Sualınızı yazın və ya mövzulardan birini seçin:';
      case 'TR':
        return 'Merhaba! AZEXBUY İhracat ve Tedarik Masasına hoş geldiniz. Sorunuzu yazabilir veya konulardan seçebilirsiniz:';
      case 'RU':
        return 'Здравствуйте! Добро пожаловать в центр поддержки AZEXBUY. Задайте вопрос или выберите тему:';
      default:
        return 'Hello! Welcome to AZEXBUY Trade Desk. Ask any question or select a topic below:';
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

  const [userMessage, setUserMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [step, setStep] = useState<'chat' | 'ask_email' | 'sending' | 'sent'>('chat');
  const [errorMsg, setErrorMsg] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);

  // Check backend AI status on mount / open
  useEffect(() => {
    if (isOpen) {
      fetch('/api/azexbuy/ai-status')
        .then((res) => res.json())
        .then((data) => {
          setModelConnected(Boolean(data.connected));
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

  // Robust auto-scroll: always stick to the bottom smoothly when new messages or typing indicators arrive
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
    } else if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTo({
        top: chatScrollContainerRef.current.scrollHeight,
        behavior,
      });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom('smooth');
    }, 40);
    return () => clearTimeout(timer);
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

  // Decide FAQ list: custom from admin or default
  const activeFaqs: FaqItem[] =
    customFaqs.length > 0
      ? customFaqs
      : DEFAULT_FAQS[locale] || DEFAULT_FAQS.EN;

  // Execute AI query for any question (custom or prompt)
  const askAI = async (queryText: string) => {
    if (!queryText.trim() || isAiThinking) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: queryText.trim(),
      timestamp: time,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsAiThinking(true);
    setUserMessage('');

    try {
      const res = await fetch('/api/azexbuy/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: queryText.trim(),
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
        // Model offline or error -> prompt direct manager contact
        const fallbackMsg: ChatMessage = {
          id: `desk-fb-${Date.now()}`,
          sender: 'desk',
          text:
            locale === 'AZ'
              ? 'Sorğunuz qəbul edildi. Ticarət menecerimizin sizinlə birbaşa əlaqə saxlaması üçün zəhmət olmasa e-poçt ünvanınızı qeyd edin.'
              : 'Thank you. Please leave your email address so our trade desk manager can get back to you directly.',
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

  const handleSelectFaq = (faq: FaqItem) => {
    // If an explicit manual answer is set in admin, we can show it or let AI answer if empty
    if (faq.a && faq.a.trim().length > 0) {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [
        ...prev,
        { id: `usr-${Date.now()}`, sender: 'user', text: faq.q, timestamp: time },
        { id: `desk-${Date.now() + 1}`, sender: 'desk', text: faq.a!, timestamp: time },
      ]);
    } else {
      // AI answers the question directly
      askAI(faq.q);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userMessage.trim()) return;
    askAI(userMessage.trim());
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
      {/* Super-clean minimal chat window */}
      <div className="w-[94vw] sm:w-[370px] h-[520px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-150">
        
        {/* Minimal Clean Header */}
        <div className="bg-[#0f3156] text-white px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-xs">
                <i className="fa-solid fa-headset"></i>
              </div>
              <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-[#0f3156] ${
                modelConnected ? 'bg-emerald-400' : 'bg-amber-400'
              }`}></span>
            </div>
            <div>
              <h4 className="text-xs font-bold leading-tight">AZEXBUY Trade Desk</h4>
              <p className="text-[10px] text-slate-300">
                {modelConnected ? 'Online AI Assistant' : 'Management Desk'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setStep('ask_email')}
              title={locale === 'AZ' ? 'Rəhbərliyə mesaj göndər' : 'Leave message for management'}
              className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-[10px] font-medium text-slate-200 cursor-pointer"
            >
              {locale === 'AZ' ? 'Menecerə Yaz' : 'Contact'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-6 h-6 rounded-full hover:bg-white/15 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <i className="fa-solid fa-xmark text-xs"></i>
            </button>
          </div>
        </div>

        {/* Message Stream (Scroll Container) */}
        <div
          ref={chatScrollContainerRef}
          className="flex-1 overflow-y-auto p-3.5 space-y-2.5 bg-slate-50/60 text-xs"
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'} animate-in fade-in duration-100`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2 leading-relaxed text-[12px] ${
                  m.sender === 'user'
                    ? 'bg-[#0f3156] text-white rounded-br-xs font-medium'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs shadow-2xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>
              </div>
              <span className="text-[9px] text-slate-400 mt-0.5 px-1">{m.timestamp}</span>
            </div>
          ))}

          {/* Clean Typing Indicator */}
          {isAiThinking && (
            <div className="flex items-center gap-2 text-slate-500 text-[11px] px-3 py-2 bg-white rounded-2xl border border-slate-200/80 w-fit shadow-2xs animate-pulse">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>{locale === 'AZ' ? 'Cavab yazılır...' : 'Generating response...'}</span>
            </div>
          )}

          {/* Clean Suggested FAQ Chips */}
          {step === 'chat' && !isAiThinking && activeFaqs.length > 0 && (
            <div className="pt-2 pb-1 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                {locale === 'AZ' ? 'Hazır suallar:' : 'Suggested topics:'}
              </span>
              <div className="flex flex-col gap-1.5">
                {activeFaqs.map((faq, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectFaq(faq)}
                    className="text-left px-3 py-2 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200/90 rounded-xl text-slate-700 text-[11px] leading-snug cursor-pointer transition-all flex items-center justify-between group shadow-2xs"
                  >
                    <span>{faq.q}</span>
                    <i className="fa-solid fa-chevron-right text-[9px] text-slate-300 group-hover:text-[#0f3156] transition-colors ml-2 shrink-0"></i>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Anchor for automatic smooth scrolling */}
          <div ref={messagesEndRef} className="h-1" />
        </div>

        {/* Input Bar */}
        <div className="p-2.5 bg-white border-t border-slate-100 shrink-0">
          {step === 'chat' && (
            <form onSubmit={handleSendMessage} className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  placeholder={locale === 'AZ' ? 'Sualınızı yazın...' : 'Type your question...'}
                  className="flex-1 h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0f3156] focus:bg-white transition-all"
                />
                <button
                  type="submit"
                  disabled={!userMessage.trim() || isAiThinking}
                  className="h-9 w-9 bg-[#0f3156] hover:bg-[#081c33] disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0"
                  aria-label="Send"
                >
                  <i className="fa-solid fa-arrow-up text-xs"></i>
                </button>
              </div>
              <div className="flex items-center justify-between px-1 text-[10px] text-slate-400">
                <button
                  type="button"
                  onClick={() => setStep('ask_email')}
                  className="hover:text-slate-600 underline cursor-pointer"
                >
                  {locale === 'AZ' ? 'Menecerə e-poçt buraxın' : 'Leave note for management'}
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
                  className="w-full h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <i className="fa-solid fa-paper-plane text-[10px]"></i>
                  <span>{locale === 'AZ' ? 'Rəhbərliyə Göndər' : 'Send to Management'}</span>
                </button>
              </div>
            </form>
          )}

          {step === 'sending' && (
            <div className="py-2.5 flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
              <i className="fa-solid fa-circle-notch animate-spin text-emerald-600"></i>
              <span>{locale === 'AZ' ? 'Rəhbərliyə yönləndirilir...' : 'Forwarding to management...'}</span>
            </div>
          )}

          {step === 'sent' && (
            <div className="text-center py-2 space-y-1">
              <p className="text-[11px] text-emerald-600 font-bold">
                {locale === 'AZ' ? 'Mesajınız uğurla çatdırıldı!' : 'Message successfully forwarded!'}
              </p>
              <button
                type="button"
                onClick={() => setStep('chat')}
                className="text-[10px] text-[#0f3156] font-semibold underline cursor-pointer"
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
