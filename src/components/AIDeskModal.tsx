import React, { useState, useEffect, useRef } from 'react';
import { Locale } from '../types';
import { askTradeAI, AIChatMessage } from '../services/aiService';

interface AIDeskModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  onOpenRFQ: () => void;
  onOpenProducer: () => void;
}

const QUICK_PROMPTS = {
  EN: [
    'Middle Corridor transit times & Alat Port routes',
    'HS Code & specs for Azerbaijani hazelnuts (080222)',
    'Incoterms 2020: FOB Baku vs CIF Constanta',
    'AQTA Phytosanitary & EUR.1 export certificates',
    'How do local producers join the export desk?',
  ],
  AZ: [
    'Orta Dəhliz tranzit müddətləri və Ələt Limanı marşrutları',
    'Azərbaycan fındığı üçün HS kodu və keyfiyyət standartları',
    'Incoterms 2020: FOB Bakı və CIF Konstansa fərqi',
    'AQTA Fitosanitar və EUR.1 mənşə sertifikatları qaydaları',
    'Yerli istehsalçılar ixrac masasına necə qoşulur?',
  ],
  TR: [
    'Orta Koridor transit süreleri ve Alat Limanı rotaları',
    'Azerbaycan fındığı için GTİP / HS kodu ve ihracat şartları',
    'Incoterms 2020: FOB Bakü ve CIF Mersin karşılaştırması',
    'AQTA bitki sağlığı ve menşe belgesi (EUR.1 / CT-1) gereksinimleri',
    'Yerli üreticiler ihracat departmanına nasıl başvurur?',
  ],
  RU: [
    'Сроки транзита по Среднему коридору через Порт Алят',
    'Код ТН ВЭД и стандарты для азербайджанского фундука (080222)',
    'Инкотермс 2020: Сравнение FOB Баку и CIF Констанца',
    'Фитосанитарный контроль AQTA и сертификаты происхождения',
    'Как производителям подключить внешний отдел экспорта?',
  ],
  AR: [
    'أوقات العبور عبر الممر الأوسط وميناء باكو ألات',
    'رمز النظام المنسق (HS) ومواصفات البندق الأذربيجاني',
    'شروط التجارة 2020: مقارنة بين FOB باكو و CIF مرسين',
    'شهادات الصحة النباتية AQTA وشهادة المنشأ EUR.1',
    'كيف ينضم المنتجون المحليون لمكتب التصدير؟',
  ],
  ES: [
    'Tiempos de tránsito del Corredor Medio y Puerto de Alat',
    'Código arancelario (HS) de avellanas de Azerbaiyán (080222)',
    'Incoterms 2020: Diferencias entre FOB Bakú y CIF Constanza',
    'Certificados fitosanitarios AQTA y origen EUR.1 / CT-1',
    '¿Cómo pueden los fabricantes acceder al escritorio de exportación?',
  ],
};

export const AIDeskModal: React.FC<AIDeskModalProps> = ({
  isOpen,
  onClose,
  locale,
  onOpenRFQ,
  onOpenProducer,
}) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text:
        locale === 'AZ'
          ? 'Salam! Mən AZEXBUY Süni İntellekt İxrac və Sourcing Məsləhətçisiyəm. Azərbaycanın ixrac məhsulları, HS kodları, Orta Dəhliz logistikası, Incoterms və AQTA sertifikatlaşdırması üzrə sizə kömək edə bilərəm.'
          : locale === 'RU'
          ? 'Здравствуйте! Я ИИ-консультант по экспорту и закупкам AZEXBUY. Помогу вам с подбором товаров, кодами ТН ВЭД, маршрутами Среднего коридора, Инкотермс и сертификатами AQTA.'
          : 'Welcome to the AZEXBUY Sovereign Trade AI Desk. I can provide authoritative guidance on Azerbaijani export commodities, HS tariff codes, Middle Corridor logistics, Incoterms 2020, and institutional export compliance.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => {
    return localStorage.getItem('azexbuy_gemini_key') || '';
  });
  const [showSettings, setShowSettings] = useState(false);
  const [keySavedMsg, setKeySavedMsg] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || loading) return;

    const userMsg: AIChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setLoading(true);

    try {
      const reply = await askTradeAI(query, locale, apiKeyInput);
      const aiMsg: AIChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errReply: AIChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'assistant',
        text: 'Error processing inquiry. Please rephrase or contact the institutional desk at info@azexbuy.com.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errReply]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApiKey = () => {
    localStorage.setItem('azexbuy_gemini_key', apiKeyInput.trim());
    setKeySavedMsg('Key saved to local storage.');
    setTimeout(() => setKeySavedMsg(''), 3000);
  };

  const currentPrompts = QUICK_PROMPTS[locale] || QUICK_PROMPTS.EN;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 no-print"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white border border-slate-200 rounded-t-2xl sm:rounded-xl w-full sm:max-w-3xl sm:mx-4 h-[92vh] sm:h-[90vh] sm:max-h-[780px] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-brandNavy text-white px-4 sm:px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <i className="fa-solid fa-brain text-lg"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold tracking-tight">
                  AZEXBUY AI Trade & Sourcing Consultant
                </h3>
                <span className="text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                  Gemini Powered
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                HS-6 Tariffs · Middle Corridor Route Times · Incoterms 2020 · AQTA Export Standards
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="text-slate-300 hover:text-white p-1.5 rounded transition-colors text-xs font-semibold flex items-center gap-1 bg-white/10 hover:bg-white/20"
              title="AI Settings & API Key"
            >
              <i className="fa-solid fa-gear"></i>
              <span className="hidden sm:inline">Settings</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-300 hover:text-white p-1.5 rounded transition-colors"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>
        </div>

        {/* Optional AI Settings Panel */}
        {showSettings && (
          <div className="bg-slate-50 border-b border-slate-200 p-4 shrink-0 transition-all text-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="font-bold text-slate-800">Google Gemini API Key:</span>
                <p className="text-[11px] text-slate-500">
                  Connect your Google AI Studio API key (starts with AIzaSy) for live Gemini 2.5 generative reasoning. If left blank, sovereign rule-based trade intelligence is used automatically.
                </p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="px-3 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-900 w-full sm:w-64 font-mono"
                />
                <button
                  type="button"
                  onClick={handleSaveApiKey}
                  className="px-3 py-1.5 bg-brandNavy text-white rounded font-bold hover:bg-brandNavyDark whitespace-nowrap"
                >
                  Save
                </button>
              </div>
            </div>
            {keySavedMsg && <span className="text-emerald-600 font-bold block mt-1">{keySavedMsg}</span>}
          </div>
        )}

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${
                m.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 px-1">
                <span>{m.sender === 'user' ? 'You' : 'AZEXBUY Trade Desk AI'}</span>
                <span>·</span>
                <span>{m.timestamp}</span>
              </div>
              <div
                className={`max-w-[85%] rounded-xl p-3.5 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-brandNavy text-white rounded-br-none shadow-xs font-medium'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-2 text-slate-500 text-xs">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-spin">
                <i className="fa-solid fa-circle-notch text-xs"></i>
              </div>
              <span className="italic">Analyzing national tariff schedules & corridor data...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-[11px] shrink-0 no-scrollbar">
          <span className="text-slate-400 font-bold whitespace-nowrap shrink-0">
            Suggested:
          </span>
          {currentPrompts.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(p)}
              disabled={loading}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full whitespace-nowrap transition-colors cursor-pointer text-left shrink-0"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar & Actions */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask about HS codes, transit times, Incoterms, or AQTA certificates..."
              className="flex-1 h-11 px-4 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-brandNavy focus:bg-white"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!inputPrompt.trim() || loading}
              className="h-11 px-4 bg-brandNavy hover:bg-brandNavyDark text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer shrink-0"
            >
              <span>Send</span>
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </form>

          {/* Quick Action Buttons */}
          <div className="flex items-center justify-between pt-2.5 text-[11px] text-slate-500">
            <span>Direct Assistance:</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenRFQ();
                }}
                className="text-brandNavy font-bold hover:underline cursor-pointer"
              >
                + Create Official RFQ
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenProducer();
                }}
                className="text-brandGreen font-bold hover:underline cursor-pointer"
              >
                + Producer Export Audit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
