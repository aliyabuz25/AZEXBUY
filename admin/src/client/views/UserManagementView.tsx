import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Plus, Trash2, RefreshCw, CheckCircle, XCircle,
  Eye, EyeOff, ShieldCheck, UserCog, Edit2, Lock,
} from 'lucide-react';
import { UiLanguage } from '../types';

interface UserManagementViewProps { uiLang: UiLanguage; }

interface AdminUser {
  id: string;
  createdAt: string;
  fullName: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
}

const ROLES = ['Super Admin', 'Admin', 'Editor', 'Viewer'];

const ROLE_COLORS: Record<string, string> = {
  'Super Admin': 'bg-red-50 text-red-700 border-red-200',
  'Admin':       'bg-purple-50 text-purple-700 border-purple-200',
  'Editor':      'bg-blue-50 text-blue-700 border-blue-200',
  'Viewer':      'bg-slate-100 text-slate-600 border-slate-200',
};

const EMPTY_FORM = { fullName: '', username: '', email: '', password: '', role: 'Editor' };

export const UserManagementView: React.FC<UserManagementViewProps> = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [formError, setFormError] = useState('');
  const [formSaving, setFormSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<AdminUser & { password: string }>>({});
  const [editShowPw, setEditShowPw] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const flash = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 2500); };

  const token = () => localStorage.getItem('octotech_admin_jwt') || '';
  const authH = () => ({ Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin-users', { headers: authH() });
      if (r.ok) setUsers(await r.json());
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    setFormError('');
    if (!form.fullName.trim() || !form.username.trim() || !form.email.trim() || !form.password.trim()) {
      setFormError('Bütün sahələr mütləqdir.'); return;
    }
    if (form.password.length < 4) { setFormError('Şifrə minimum 4 simvol olmalıdır.'); return; }
    setFormSaving(true);
    const r = await fetch('/api/admin-users', {
      method: 'POST',
      headers: authH(),
      body: JSON.stringify(form),
    });
    const data = await r.json();
    if (!r.ok) { setFormError(data.error || 'Xəta baş verdi.'); setFormSaving(false); return; }
    setForm({ ...EMPTY_FORM });
    setShowForm(false);
    setFormSaving(false);
    flash('İstifadəçi uğurla yaradıldı.');
    load();
  };

  const handlePatch = async (id: string, patch: any) => {
    await fetch(`/api/admin-users/${id}`, {
      method: 'PATCH',
      headers: authH(),
      body: JSON.stringify(patch),
    });
    load();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" istifadəçisini silmək istəyirsiniz?`)) return;
    await fetch(`/api/admin-users/${id}`, { method: 'DELETE', headers: authH() });
    flash('İstifadəçi silindi.');
    load();
  };

  const handleEditSave = async () => {
    if (!editId) return;
    const patch: any = {};
    if (editData.fullName !== undefined) patch.fullName = editData.fullName;
    if (editData.username !== undefined && editData.username.trim().length >= 3) patch.username = editData.username;
    if (editData.email !== undefined) patch.email = editData.email;
    if (editData.role !== undefined) patch.role = editData.role;
    if (editData.password && editData.password.length >= 4) patch.password = editData.password;
    const r = await fetch(`/api/admin-users/${editId}`, {
      method: 'PATCH', headers: authH(), body: JSON.stringify(patch),
    });
    const data = await r.json();
    if (!r.ok) { flash(data.error || 'Xəta baş verdi.'); return; }
    setEditId(null);
    setEditData({});
    flash('Dəyişikliklər saxlandı.');
    load();
  };

  const fmt = (iso?: string) => {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleDateString('az-AZ', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return iso; }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-[#0f3156] flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900">İstifadəçi İdarəetməsi</h1>
            <p className="text-[10px] text-slate-500">Admin hesabları — əlavə et, düzənlə, sil</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {successMsg && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-sm">
              <CheckCircle className="w-3 h-3" />{successMsg}
            </div>
          )}
          <button onClick={load} disabled={loading}
            className="h-7 px-3 flex items-center gap-1.5 text-xs font-medium border border-slate-200 hover:bg-slate-100 rounded-sm text-slate-600">
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Yenilə
          </button>
          <button onClick={() => { setShowForm(true); setFormError(''); }}
            className="h-7 px-3 flex items-center gap-1.5 text-xs font-bold bg-[#0f3156] text-white hover:bg-[#081c33] rounded-sm">
            <Plus className="w-3 h-3" /> Yeni Admin
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">

        {/* Create form */}
        {showForm && (
          <div className="bg-white border border-slate-200 rounded p-5 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Yeni Admin Hesabı</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-700">
                <XCircle className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Ad Soyad', key: 'fullName', type: 'text', placeholder: 'Ali Həsənov' },
                { label: 'İstifadəçi Adı', key: 'username', type: 'text', placeholder: 'alihasanov' },
                { label: 'E-poçt', key: 'email', type: 'email', placeholder: 'ali@azexbuy.az' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{f.label}</label>
                  <input type={f.type} value={(form as any)[f.key]} placeholder={f.placeholder}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 focus:outline-none focus:border-[#0f3156] rounded-sm" />
                </div>
              ))}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Şifrə</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={form.password} placeholder="Min 4 simvol"
                    onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 pr-8 focus:outline-none focus:border-[#0f3156] rounded-sm" />
                  <button type="button" onClick={() => setShowPw(p => !p)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                    {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Rol</label>
                <select value={form.role} onChange={e => setForm(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2 focus:outline-none focus:border-[#0f3156] rounded-sm">
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
            {formError && <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-sm">{formError}</p>}
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setShowForm(false)}
                className="h-7 px-3 text-xs text-slate-600 border border-slate-200 hover:bg-slate-100 rounded-sm">Ləğv et</button>
              <button onClick={handleCreate} disabled={formSaving}
                className="h-7 px-4 text-xs font-bold bg-[#0f3156] text-white hover:bg-[#081c33] rounded-sm flex items-center gap-1.5">
                {formSaving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                Yarat
              </button>
            </div>
          </div>
        )}

        {/* Users table */}
        <div className="bg-white border border-slate-200 rounded overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Admin Hesabları ({users.length})</span>
          </div>

          {users.length === 0 && !loading && (
            <div className="py-12 text-center text-xs text-slate-400">
              <Users className="w-8 h-8 mx-auto mb-2 text-slate-200" />
              Heç bir istifadəçi tapılmadı
            </div>
          )}

          <div className="divide-y divide-slate-100">
            {users.map(u => (
              <div key={u.id} className="px-4 py-3 space-y-3">
                {/* User row */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${u.isActive ? 'bg-[#0f3156] text-white' : 'bg-slate-200 text-slate-500'}`}>
                      {u.fullName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900">{u.fullName}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 border rounded-sm font-semibold ${ROLE_COLORS[u.role] || ROLE_COLORS['Viewer']}`}>
                          {u.role}
                        </span>
                        {!u.isActive && <span className="text-[10px] px-1.5 py-0.5 bg-red-50 border border-red-200 text-red-600 rounded-sm font-semibold">Deaktiv</span>}
                        {u.id === 'admin-root' && <span className="text-[10px] px-1.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-sm font-semibold flex items-center gap-1"><ShieldCheck className="w-2.5 h-2.5" />Root</span>}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        @{u.username} · {u.email} · Yaradıldı: {fmt(u.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => {
                      if (editId === u.id) { setEditId(null); setEditData({}); }
                      else { setEditId(u.id); setEditData({ fullName: u.fullName, username: u.username, email: u.email, role: u.role, password: '' }); }
                    }} className="h-7 px-2 flex items-center gap-1 text-xs text-slate-600 border border-slate-200 hover:bg-slate-100 rounded-sm">
                      <Edit2 className="w-3 h-3" /> Düzənlə
                    </button>
                    <button onClick={() => handlePatch(u.id, { isActive: !u.isActive })}
                      className={`h-7 px-2 flex items-center gap-1 text-xs border rounded-sm ${u.isActive ? 'text-amber-600 border-amber-200 hover:bg-amber-50' : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'}`}>
                      <UserCog className="w-3 h-3" />
                      {u.isActive ? 'Deaktiv et' : 'Aktiv et'}
                    </button>
                    {u.id !== 'admin-root' && (
                      <button onClick={() => handleDelete(u.id, u.fullName)}
                        className="h-7 px-2 flex items-center gap-1 text-xs text-red-600 border border-red-200 hover:bg-red-50 rounded-sm">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Inline edit form */}
                {editId === u.id && (
                  <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-3">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                      <Edit2 className="w-3 h-3" /> Hesabı Düzənlə
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Ad Soyad</label>
                        <input value={editData.fullName || ''} onChange={e => setEditData(d => ({ ...d, fullName: e.target.value }))}
                          className="w-full h-7 text-xs bg-white border border-slate-200 px-2 focus:outline-none focus:border-[#0f3156] rounded-sm" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">İstifadəçi Adı</label>
                        <input value={editData.username || ''} onChange={e => setEditData(d => ({ ...d, username: e.target.value }))}
                          placeholder="min 3 simvol"
                          className="w-full h-7 text-xs bg-white border border-slate-200 px-2 focus:outline-none focus:border-[#0f3156] rounded-sm" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">E-poçt</label>
                        <input value={editData.email || ''} onChange={e => setEditData(d => ({ ...d, email: e.target.value }))}
                          className="w-full h-7 text-xs bg-white border border-slate-200 px-2 focus:outline-none focus:border-[#0f3156] rounded-sm" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Rol</label>
                        <select value={editData.role || 'Editor'} onChange={e => setEditData(d => ({ ...d, role: e.target.value }))}
                          className="w-full h-7 text-xs bg-white border border-slate-200 px-2 focus:outline-none focus:border-[#0f3156] rounded-sm">
                          {ROLES.map(r => <option key={r}>{r}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> Yeni Şifrə
                        </label>
                        <div className="relative">
                          <input type={editShowPw ? 'text' : 'password'} value={editData.password || ''} placeholder="Dəyişməmək üçün boş burax"
                            onChange={e => setEditData(d => ({ ...d, password: e.target.value }))}
                            className="w-full h-7 text-xs bg-white border border-slate-200 px-2 pr-7 focus:outline-none focus:border-[#0f3156] rounded-sm" />
                          <button type="button" onClick={() => setEditShowPw(p => !p)}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                            {editShowPw ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setEditId(null); setEditData({}); }}
                        className="h-7 px-3 text-xs text-slate-600 border border-slate-200 hover:bg-slate-100 rounded-sm">Ləğv et</button>
                      <button onClick={handleEditSave}
                        className="h-7 px-4 text-xs font-bold bg-[#0f3156] text-white hover:bg-[#081c33] rounded-sm flex items-center gap-1.5">
                        <CheckCircle className="w-3 h-3" /> Saxla
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
