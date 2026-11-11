import React, { useState, useEffect } from 'react';
import {
  Cpu, Save, CheckCircle2, AlertCircle, Key, Sparkles, Sliders, ShieldCheck, RefreshCw,
  Plus, Trash2, Layers, Zap, Gift, Search
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

export const AiSettingsView: React.FC<AiSettingsViewProps> = () => {
  const [apiKeys, setApiKeys] = useState<string[]>(['']);
  const [model, setModel] = useState('openrouter/free');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [temperature, setTemperature] = useState(0.2);
  const [maxTokens, setMaxTokens] = useState(350);
  const [enabled, setEnabled] = useState(true);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMsg('');
    setErrorMsg('');

    try {
      const cleanedKeys = apiKeys.map((k) => k.trim()).filter(Boolean);
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
          enabled,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSavedMsg(`✅ ${cleanedKeys.length} ədəd API açarı və model parametrləri uğurla yadda saxlanıldı (Smart Load Balancer aktivdir).`);
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
            <h2 className="text-xl font-bold text-slate-900">OpenRouter AI & Smart Load Balancer</h2>
            <p className="text-xs text-slate-500">
              10-dək API açarı arasında ağıllı kvota paylanması, pulsuz (free) modellər və minimum token istifadəsi
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeKeysCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              {activeKeysCount} Açar Aktiv (Load Balanced)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <AlertCircle className="w-3.5 h-3.5" />
              Açar Yoxdur
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
                <span>OpenRouter API Açarları Hovuzu (Pool)</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                10-dək fərqli OpenRouter açarı əlavə edə bilərsiniz. Hər sorğu açarlar arasında bərabər bölüşdürülür (Round-Robin), biri limitə düşərsə digərinə avtomatik keçir.
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

          <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 flex items-center justify-between text-[11.5px] text-purple-900">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-600 shrink-0" />
              <span><b>Zəmanətli Yük Balansı:</b> Sorğular növbə ilə paylanır, token israfı olmur və pulsuz limitlər 10 qat artırılır.</span>
            </div>
          </div>
        </div>

        {/* Model Selection with Free Prioritization */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>OpenRouter Model Seçimi</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Bütün OpenRouter modelləri arasından seçim edin. Pulsuz və qənaətli modellər xüsusi vurğulanıb.
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
              placeholder="Model adına və ya ID-yə görə axtarın (məs. free, gemini, gemma, nemotron)..."
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
              <optgroup label="Tövsiyə Olunan Ən Yaxşı Pulsuz Modellər (Zero Cost)">
                <option value="openrouter/free">🌟 openrouter/free (Avtomatik Ən Yaxşı Pulsuz Model Seçicisi)</option>
                <option value="google/gemma-4-31b-it:free">Google: Gemma 4 31B (Pulsuz / Free)</option>
                <option value="google/gemma-4-26b-a4b-it:free">Google: Gemma 4 26B A4B (Pulsuz / Free)</option>
                <option value="nvidia/nemotron-3.5-lightning:free">NVIDIA: Nemotron 3.5 Lightning (Pulsuz / Free)</option>
                <option value="nvidia/nemotron-3-ultra-550b-a55b:free">NVIDIA: Nemotron 3 Ultra 550B (Pulsuz / Free)</option>
                <option value="thinkingmachines/inkling-2-small:free">Thinking Machines: Inkling 2 Small (Pulsuz / Free)</option>
              </optgroup>
              <optgroup label="Bütün Axtarılan Modellər">
                {filteredModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.isFree ? '🎁 [PULSUZ] ' : ''}{m.name} ({m.id})
                  </option>
                ))}
              </optgroup>
            </select>

            <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700">Seçilmiş Model:</span>
              <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-brandNavy font-bold">{model}</span>
              {model.includes(':free') || model === 'openrouter/free' ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">0$ Pulsuz</span>
              ) : null}
            </div>
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
                <label className="text-xs font-bold text-slate-700">Maksimum Token Limiti (Cavab Uzunluğu)</label>
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
                Az token (250-350) botun uzun şablon və lazımsız sözlər yazmasının qarşısını alır, cavabı 2-3 saniyədə çatdırır və kvotanı qoruyur.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Temperatur (Dəqiqlik)</label>
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
                Aşağı temperatur (0.1 - 0.2) ticarət məlumatlarında (HS kodlar, Incoterms, limanlar) dəqiqliyi təmin edir.
              </p>
            </div>
          </div>

          {/* System Prompt Customization */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">
                Sistem Təlimatı (Anti-AI-Slop & Dəqiq İxrac Masası Təlimatı)
              </label>
              <button
                type="button"
                onClick={() => setSystemPrompt('')}
                className="text-[11px] text-purple-700 hover:underline cursor-pointer font-medium"
              >
                Defolt Təlimata Qaytar
              </button>
            </div>
            <textarea
              rows={4}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Boş buraxdıqda ticarət portalının rəsmi, dəqiq və süni intellekt şablonlarından (slop) təmizlənmiş defolt sistemi işə düşür."
              className="w-full p-3 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:border-brandNavy focus:outline-none font-mono leading-relaxed"
            />
            <p className="text-[11px] text-slate-500">
              Defolt təlimat şablon ("əlbəttə", "əziz müştəri", "sizə necə kömək edə bilərəm") cümlələri qadağan edir, son 3 mesajı saxlayaraq prompt tokenlərini 70% azaldır.
            </p>
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
