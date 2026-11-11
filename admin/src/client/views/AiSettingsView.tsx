import React, { useState, useEffect } from 'react';
import {
  Cpu, Save, CheckCircle2, AlertCircle, Key, Sparkles, Sliders, ShieldCheck, RefreshCw
} from 'lucide-react';
import { UiLanguage } from '../types';

interface AiSettingsViewProps {
  uiLang: UiLanguage;
}

const POPULAR_MODELS = [
  { id: 'google/gemini-2.5-flash', name: 'Google Gemini 2.5 Flash (Sürətli & Dəqiq — Tövsiyə Olunur)' },
  { id: 'google/gemini-2.5-pro', name: 'Google Gemini 2.5 Pro (Dərin Analitik Ticarət)' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Anthropic Claude 3.5 Sonnet (Yüksək İntellekt)' },
  { id: 'openai/gpt-4o-mini', name: 'OpenAI GPT-4o Mini (Kompakt & Qənaətli)' },
  { id: 'openai/gpt-4o', name: 'OpenAI GPT-4o (Güclü Flagship)' },
  { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Meta Llama 3.3 70B (Açıq Mənbəli Sürətli)' },
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3 (Sürətli Ticarət İntellekti)' },
];

export const AiSettingsView: React.FC<AiSettingsViewProps> = () => {
  const [apiKey, setApiKey] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [model, setModel] = useState('google/gemini-2.5-flash');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [temperature, setTemperature] = useState(0.2);
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('azexbuy_admin_token') : null;
  const authHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai-settings', { headers: authHeaders });
      const data = await res.json();
      if (res.ok) {
        setHasKey(data.has_key);
        setModel(data.model || 'google/gemini-2.5-flash');
        setSystemPrompt(data.system_prompt || '');
        setTemperature(data.temperature ?? 0.2);
        setEnabled(data.enabled ?? true);
        if (data.api_key) {
          setApiKey(data.api_key);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Məlumat yüklənə bilmədi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMsg('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/ai-settings', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          provider: 'openrouter',
          api_key: apiKey,
          model,
          system_prompt: systemPrompt,
          temperature,
          enabled,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSavedMsg('✅ OpenRouter parametrləri və API açarı uğurla yadda saxlanıldı.');
        setHasKey(Boolean(apiKey && !apiKey.startsWith('••••') ? apiKey : hasKey));
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

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center gap-3 text-slate-500 text-sm">
        <RefreshCw className="w-5 h-5 animate-spin text-brandNavy" />
        <span>AI & OpenRouter parametrləri yüklənir...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-600 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">OpenRouter AI Konfiqurasiyası</h2>
            <p className="text-xs text-slate-500">
              Trade Desk üçün vahid OpenRouter API açarı və model seçimi (AI Slop aradan qaldırılıb)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasKey ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              API Açarı Aktiv
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <AlertCircle className="w-3.5 h-3.5" />
              Açar Tələb Olunur
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

      <form onSubmit={handleSave} className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        {/* API Key */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <Key className="w-4 h-4 text-slate-500" />
            <span>OpenRouter API Açarı (sk-or-v1-...)</span>
          </label>
          <div className="relative">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono bg-slate-50 focus:bg-white focus:border-brandNavy focus:outline-none transition-all"
            />
          </div>
          <p className="text-[11px] text-slate-500">
            Açarı daxil etdikdən sonra bütün sayt ziyarətçiləri üçün Trade Desk canlı AI dəstəyi server üzərindən güvənli şəkildə təmin edilir. Açar brauzer tərəfində heç vaxt görünmür.
          </p>
        </div>

        {/* Model Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>OpenRouter Modeli</span>
          </label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:border-brandNavy focus:outline-none transition-all"
          >
            {POPULAR_MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.id})
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] text-slate-400">Və ya fərdi model ID yazın:</span>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. google/gemini-2.5-flash"
              className="flex-1 px-3 py-1 rounded-lg border border-slate-200 text-xs font-mono"
            />
          </div>
        </div>

        {/* Temperature & Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-slate-500" />
                <span>Temperatur (Dəqiqlik vs Yaradıcılıq)</span>
              </label>
              <span className="text-xs font-mono font-bold text-brandNavy">{temperature}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-brandNavy cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0.0 (Faktiki & Sərt)</span>
              <span>0.2 (Tövsiyə olunan Ticarət)</span>
              <span>1.0 (Yaradıcı)</span>
            </div>
          </div>

          <div className="space-y-2 flex flex-col justify-center">
            <label className="text-xs font-bold text-slate-800">Trade Desk AI Statusu</label>
            <div className="flex items-center gap-3 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="rounded text-brandNavy focus:ring-0 w-4 h-4"
                />
                <span className="font-medium">Canlı AI Çat Aktivdir</span>
              </label>
            </div>
          </div>
        </div>

        {/* System Prompt Customization */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
            <span>Sistem Təlimatı (AI Slop-un qarşısını alan qaydalar)</span>
            <button
              type="button"
              onClick={() => setSystemPrompt('')}
              className="text-[11px] text-slate-400 hover:text-slate-600 underline font-normal"
            >
              Defolt qaydalara qaytar
            </button>
          </label>
          <textarea
            rows={5}
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="Boş buraxdıqda ticarət portalının rəsmi, dəqiq və süni intellekt şablonlarından (slop) təmizlənmiş defolt sistemi işə düşür."
            className="w-full p-3 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:border-brandNavy focus:outline-none font-mono leading-relaxed"
          />
          <p className="text-[11px] text-slate-500">
            Defolt təlimat çat-botun şablon ("əziz istifadəçi", "sizə kömək etməkdən şadam") danışmasını qadağan edir və yalnız rəsmi ixrac məlumatları, HS kodları, Incoterms və rəhbərlik əlaqələrini təqdim edir.
          </p>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-brandNavy hover:bg-brandNavyDark disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Yadda saxlanılır...' : 'Parametrləri Yadda Saxla'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
