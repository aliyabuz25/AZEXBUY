import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Plus, Search, Filter } from 'lucide-react';
import { RecordItem, UiLanguage } from '../types';

interface DataRecordsViewProps {
  records: RecordItem[];
  onAddRecord: (title: string) => Promise<void>;
  uiLang: UiLanguage;
}

export const DataRecordsView: React.FC<DataRecordsViewProps> = ({
  records,
  onAddRecord,
  uiLang
}) => {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const filtered = records.filter(r => 
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.source.toLowerCase().includes(search.toLowerCase()) ||
    r.author.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await onAddRecord(newTitle.trim());
    setNewTitle('');
    setShowModal(false);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <Database className="w-5 h-5 text-slate-700" />
            <span>Məlumat Bazası & Qeydlər</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Bütün saytların məzmununu mərkəzləşdirilmiş şəkildə idarə edin.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="h-9 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Yeni Qeyd Əlavə Et</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs">
        {/* Search Header */}
        <div className="p-3 border-b border-slate-100 flex items-center justify-between">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Qeydlərdə axtarış..."
              className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-900"
            />
          </div>
          <span className="text-xs text-slate-500">
            Cəmi: {filtered.length} qeyd
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-4">ID</th>
                <th className="py-2.5 px-4">Başlıq</th>
                <th className="py-2.5 px-4">Mənbə</th>
                <th className="py-2.5 px-4">Müəllif / Tarix</th>
                <th className="py-2.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Axtarışa uyğun heç bir məlumat qeydi tapılmadı.
                  </td>
                </tr>
              ) : (
                filtered.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{row.id}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">{row.title}</td>
                    <td className="py-3 px-4 text-slate-500">{row.source}</td>
                    <td className="py-3 px-4 text-slate-500">{row.author} • <span className="text-slate-400">{row.date}</span></td>
                    <td className="py-3 px-4 text-right">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10.5px] font-medium capitalize ${
                        row.status === 'published' ? 'bg-slate-100 text-slate-800 border border-slate-200/80' :
                        row.status === 'synced' ? 'bg-slate-50 text-slate-700 border border-slate-200/60' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-200 space-y-4"
          >
            <h3 className="text-sm font-semibold text-slate-900">Yeni Məzmun Qeydi</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Qeydin başlığı..."
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-900"
                autoFocus
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50"
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800"
                >
                  Əlavə et
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
