import React, { useState, useEffect } from 'react';
import {
  Cpu, Save, CheckCircle2, AlertCircle, Key, Sparkles, Sliders, ShieldCheck, RefreshCw,
  Plus, Trash2, Zap, Gift, Search, HelpCircle, MessageSquare
} from 'lucide-react';
import { UiLanguage } from '../types';

interface AiSettingsViewProps {
  uiLang: UiLanguage;
}

interface OpenRouterModel {
  id: string;
  name: string;
  description: string;
  isFree: boolean;
  context_length: number;
}

interface CustomFaqItem {
  id: string;
  question: string;
  answer: string;
}

export const AiSettingsView: React.FC<AiSettingsViewProps> = () => {
  const [apiKeys, setApiKeys] = useState<string[]>(['']);
  const [model, setModel] = useState('openrouter/free');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [temperature, setTemperature] = useState(0.2);
  const [maxTokens, setMaxTokens] = useState(350);
  const [enabled, setEnabled] = useState(true);

  // FAQ options
  const [faqMode, setFaqMode] = useState<'hybrid' | 'manual' | 'ai'>('hybrid');
  const [customFaqs, setCustomFaqs] = useState<CustomFaqItem[]>([]);

  const [modelsList, setModelsList] = useState<OpenRouterModel[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelSearch, setModelSearch] = useState('');
  const [filterFreeOnly, setFilterFreeOnly] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('azexbuy_admin_token') : null;
  const authHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };

  const fetchSettingsAndModels = async () => {
    setLoading(true);
    try {
      // 1. Fetch settings
      const res = await fetch('/api/ai-settings', { headers: authHeaders });
      const data = await res.json();
      if (res.ok) {
        if (Array.isArray(data.api_keys) && data.api_keys.length > 0) {
          setApiKeys(data.api_keys);
        } else if (data.api_key) {
          setApiKeys([data.api_key]);
        } else {
          setApiKeys(['']);
        }
        setModel(data.model || 'openrouter/free');
        setSystemPrompt(data.system_prompt || '');
        setTemperature(data.temperature ?? 0.2);
        setMaxTokens(data.max_tokens ?? 350);
        setEnabled(data.enabled ?? true);
        setFaqMode(data.faq_mode || 'hybrid');
        if (Array.isArray(data.custom_faqs) && data.custom_faqs.length > 0) {
          setCustomFaqs(data.custom_faqs);
        } else {
          setCustomFaqs([
            { id: '1', question: 'Orta Dəhliz tranzit müddətləri və Ələt Limanı marşrutları', answer: 'Trans-Xəzər Beynəlxalq Nəqliyyat Marşrutu (Orta Dəhliz):\n• Bakı (Ələt) - Qara dəniz: 24-36 saat\n• Bakı - Türkiyə: 3-5 gün\n• Qara dəniz - Aİ: 2-3 gün.' },
            { id: '2', question: 'Azərbaycan fındığı üçün HS kodu və ixrac standartları', answer: '🌰 Azərbaycan Fındığı (HS: 0802.22):\n• Mənşə: Zaqatala-Şəki\n• Kalibr: 11-13mm, 13-15mm | Nəmlik < 5.5% | AQTA, EUR.1, ISO 22000.' },
            { id: '3', question: 'Incoterms 2020: FOB Bakı və CIF Konstansa fərqi', answer: 'FOB: Satıcı Ələt limanında malları gəmiyə yükləyir, daşımanı alıcı ödəyir.\nCIF: AZEXBUY və ya satıcı dəniz daşımasını və sığortasını hədəf limana qədər qarşılayır.' },
            { id: '4', question: 'AQTA Fitosanitar və EUR.1 mənşə sertifikatları qaydaları', answer: 'AQTA kənd təsərrüfatı və qida məhsulları üçün icbaridir. EUR.1 Avropa İttifaqına güzəştli tarif, CT-1 isə MDB-yə rüsumsuz ixrac üçündür.' },
          ]);
        }
      }

      // 2. Fetch OpenRouter models
      fetchModels();
    } catch (err: any) {
      setErrorMsg(err.message || 'Məlumat yüklənə bilmədi.');
    } finally {
      setLoading(false);
    }
  };

  const fetchModels = async () => {
    setModelsLoading(true);
    try {
      const res = await fetch('/api/ai-models');
      const list = await res.json();
      if (Array.isArray(list)) {
        setModelsList(list);
      }
    } catch (err) {
      console.warn('Failed to load dynamic models list', err);
    } finally {
      setModelsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsAndModels();
  }, []);

  const handleAddKey = () => {
    if (apiKeys.length >= 10) {
      setErrorMsg('Maksimum 10 ədəd API açarı əlavə edə bilərsiniz.');
      return;
    }
    setApiKeys([...apiKeys, '']);
  };

  const handleRemoveKey = (index: number) => {
    if (apiKeys.length === 1) {
      setApiKeys(['']);
      return;
    }
    setApiKeys(apiKeys.filter((_, i) => i !== index));
  };

  const handleKeyChange = (index: number, val: string) => {
    const updated = [...apiKeys];
    updated[index] = val;
    setApiKeys(updated);
  };

  const handleAddFaq = () => {
    setCustomFaqs([
      ...customFaqs,
      { id: `faq-${Date.now()}`, question: '', answer: '' },
    ]);
  };

  const handleRemoveFaq = (index: number) => {
    setCustomFaqs(customFaqs.filter((_, i) => i !== index));
  };

  const handleFaqChange = (index: number, field: 'question' | 'answer', val: string) => {
    const updated = [...customFaqs];
    updated[index] = { ...updated[index], [field]: val };
    setCustomFaqs(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMsg('');
    setErrorMsg('');

    try {
      const cleanedKeys = apiKeys.map((k) => k.trim()).filter(Boolean);
      const cleanedFaqs = customFaqs.filter((f) => f.question.trim().length > 0);

      const res = await fetch('/api/ai-settings', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          provider: 'openrouter',
          api_keys: cleanedKeys,
          model,
          system_prompt: systemPrompt,
          temperature,
          max_tokens: maxTokens,
          faq_mode: faqMode,
          custom_faqs: cleanedFaqs,
          enabled,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSavedMsg(`✅ Parametrlər uğurla saxlanıldı (${cleanedKeys.length} API açarı, ${cleanedFaqs.length} hazır sual).`);
        setTimeout(() => setSavedMsg(''), 4000);
      } else {
        throw new Error(data.error || 'Saxlanarkən xəta baş verdi');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Xəta baş verdi');
    } finally {
      setSaving(false);
    }
  };

  // Filter models for selection
  const filteredModels = modelsList.filter((m) => {
    const matchesSearch =
      !modelSearch ||
      m.id.toLowerCase().includes(modelSearch.toLowerCase()) ||
      m.name.toLowerCase().includes(modelSearch.toLowerCase());
    const matchesFree = !filterFreeOnly || m.isFree;
    return matchesSearch && matchesFree;
  });

  const activeKeysCount = apiKeys.filter((k) => k.trim().length > 0).length;

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center gap-3 text-slate-500 text-sm">
        <RefreshCw className="w-5 h-5 animate-spin text-brandNavy" />
        <span>OpenRouter & Smart Load Balancer parametrləri yüklənir...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-200 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-600 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">OpenRouter AI & Trade Desk Qaydaları</h2>
            <p className="text-xs text-slate-500">
              Model qoşulma tələbi, 10 ədəd açar hovuzu, pulsuz modellər və hazır sualların tənzimlənməsi
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeKeysCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              Model Qoşulub ({activeKeysCount} Açar Aktiv)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              <AlertCircle className="w-3.5 h-3.5" />
              Model Qoşulmayıb (Trade Desk Deaktivdir)
            </span>
          )}
        </div>
      </div>

      {savedMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{savedMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Pool of API Keys (Up to 10 keys with round robin balancing) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Key className="w-4 h-4 text-purple-600" />
                <span>OpenRouter API Açarları (Model Qoşulması)</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Model qoşulmadan saytda Trade Desk çatı açılmır. 10-dək açar əlavə edərək kvotanı bərabər paylaya bilərsiniz.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddKey}
              disabled={apiKeys.length >= 10}
              className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 disabled:opacity-50 text-purple-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Açar Əlavə Et ({apiKeys.length}/10)</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {apiKeys.map((keyVal, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-6 text-[11px] font-mono text-slate-400 font-bold text-center">
                  #{idx + 1}
                </span>
                <input
                  type="password"
                  value={keyVal}
                  onChange={(e) => handleKeyChange(idx, e.target.value)}
                  placeholder={`sk-or-v1-xxxxxxxxxxxxxxxxxxxx (Açar ${idx + 1})`}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono bg-slate-50 focus:bg-white focus:border-brandNavy focus:outline-none"
                />
                {apiKeys.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveKey(idx)}
                    className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                    title="Açarı sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11.5px] text-slate-600">
            <span className="font-semibold text-slate-800">Qeyd:</span> Əgər heç bir API açarı daxil edilməyibsə və ya deaktiv edilibsə, istifadəçilərə modelin hələ qoşulmadığı və ya birbaşa rəhbərliyə e-poçtla müraciət etmələri bildirilir.
          </div>
        </div>

        {/* Model Selection with Free Prioritization */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>OpenRouter Modeli</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Aşağıdakı pulsuz (0$) və ya premium modellərdən birini təyin edin.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFilterFreeOnly(!filterFreeOnly)}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  filterFreeOnly
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Gift className="w-3.5 h-3.5" />
                <span>Yalnız Pulsuz (Free)</span>
              </button>
              <button
                type="button"
                onClick={fetchModels}
                disabled={modelsLoading}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                title="Modelləri yenilə"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${modelsLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Quick Filter Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={modelSearch}
              onChange={(e) => setModelSearch(e.target.value)}
              placeholder="Model adına və ya ID-yə görə axtarın..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-brandNavy"
            />
          </div>

          {/* Model Select Box */}
          <div className="space-y-2">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:border-brandNavy focus:outline-none"
            >
              <optgroup label="Tövsiyə Olunan Pulsuz Modellər (0$ Free)">
                <option value="openrouter/free">🌟 openrouter/free (Ağıllı Pulsuz Router — Avtomatik)</option>
                <option value="google/gemma-4-31b-it:free">Google: Gemma 4 31B (Pulsuz / Free)</option>
                <option value="google/gemma-4-26b-a4b-it:free">Google: Gemma 4 26B A4B (Pulsuz / Free)</option>
                <option value="nvidia/nemotron-3.5-lightning:free">NVIDIA: Nemotron 3.5 Lightning (Pulsuz / Free)</option>
                <option value="nvidia/nemotron-3-ultra-550b-a55b:free">NVIDIA: Nemotron 3 Ultra 550B (Pulsuz / Free)</option>
                <option value="thinkingmachines/inkling-2-small:free">Thinking Machines: Inkling 2 Small (Pulsuz / Free)</option>
              </optgroup>
              <optgroup label="Bütün Digər Modellər">
                {filteredModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.isFree ? '🎁 [PULSUZ] ' : ''}{m.name} ({m.id})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* FAQ Management: AI vs Manual */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-purple-600" />
                <span>Hazır Sualların İdarə Edilməsi (FAQ)</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                İstifadəçiyə təqdim olunan hazır sualları əl ilə müəyyən edə və ya AI-nin mövzuya uyğun cavablandırmasını təyin edə bilərsiniz.
              </p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setFaqMode('manual')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  faqMode === 'manual' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Əl ilə (Manual)
              </button>
              <button
                type="button"
                onClick={() => setFaqMode('ai')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  faqMode === 'ai' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Yalnız AI Təhlil
              </button>
              <button
                type="button"
                onClick={() => setFaqMode('hybrid')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  faqMode === 'hybrid' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Hibrid (Tövsiyə)
              </button>
            </div>
          </div>

          {/* Custom FAQ Items List */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Çatda Görünən Hazır Suallar və Cavabları:</span>
              <button
                type="button"
                onClick={handleAddFaq}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Yeni Sual Əlavə Et</span>
              </button>
            </div>

            {customFaqs.map((faq, idx) => (
              <div key={faq.id || idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-xs font-mono font-bold text-purple-700">Q{idx + 1}</span>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => handleFaqChange(idx, 'question', e.target.value)}
                      placeholder="Hazır Sual (məs: Orta Dəhliz tranzit müddətləri nə qədərdir?)"
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:border-brandNavy"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFaq(idx)}
                    className="w-7 h-7 text-slate-400 hover:text-rose-600 rounded flex items-center justify-center cursor-pointer"
                    title="Sualı sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={faq.answer}
                  onChange={(e) => handleFaqChange(idx, 'answer', e.target.value)}
                  placeholder="Dəqiq cavab və ya qeyd (boş buraxılarsa klikləndikdə AI dərhal cavablayacaq)..."
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:border-brandNavy font-sans leading-relaxed"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Token Optimization & Anti-Slop Parameters */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-600" />
            <span>Token Qənaəti & Sürət Parametrləri</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Maksimum Token Limiti</label>
                <span className="text-xs font-mono font-bold text-brandNavy">{maxTokens} token</span>
              </div>
              <input
                type="range"
                min="150"
                max="600"
                step="25"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                className="w-full accent-brandNavy cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">
                250-350 token cavabların qısa, dəqiq və sürətli olmasını təmin edir, israfın qarşısını alır.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Temperatur</label>
                <span className="text-xs font-mono font-bold text-brandNavy">{temperature}</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.8"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-brandNavy cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">
                0.2 temperatur ticarət məlumatlarında (HS kodları, sənədlər) ən yüksək dəqiqliyi verir.
              </p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-brandNavy hover:bg-brandNavyDark disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Yadda saxlanılır...' : 'Bütün Parametrləri Yadda Saxla'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
