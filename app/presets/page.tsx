'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDS } from '@/lib/store';

const ALL_COMPS = [
  { key: 'button',     label: 'Button' },
  { key: 'input',      label: 'Input' },
  { key: 'textarea',   label: 'Textarea' },
  { key: 'select',     label: 'Select' },
  { key: 'checkbox',   label: 'Checkbox' },
  { key: 'radio',      label: 'Radio' },
  { key: 'toggle',     label: 'Toggle' },
  { key: 'badge',      label: 'Badge' },
  { key: 'chip',       label: 'Chip' },
  { key: 'card',       label: 'Card' },
  { key: 'alert',      label: 'Alert' },
  { key: 'toast',      label: 'Toast' },
  { key: 'tab',        label: 'Tab' },
  { key: 'avatar',     label: 'Avatar' },
  { key: 'tooltip',    label: 'Tooltip' },
  { key: 'spinner',    label: 'Spinner' },
  { key: 'skeleton',   label: 'Skeleton' },
  { key: 'progress',   label: 'Progress' },
  { key: 'pagination', label: 'Pagination' },
  { key: 'divider',    label: 'Divider' },
];

interface ApiPreset {
  designYu: boolean;
  version: string;
  preset: { id: string; name: string; createdAt: string; updatedAt?: string };
  palettes: Record<string, Record<string, string>>;
  components: Record<string, unknown>;
}

export default function PresetsPage() {
  const { presets, palettes, savePreset, loadPreset, deletePreset, renamePreset, updateComponent } = useDS();
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [exportSel, setExportSel] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [apiPresets, setApiPresets] = useState<ApiPreset[]>([]);
  const [syncing, setSyncing] = useState(false);

  const fetchApiPresets = useCallback(() => {
    setSyncing(true);
    fetch('/api/presets')
      .then(r => r.json())
      .then((data: ApiPreset[]) => setApiPresets(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setSyncing(false));
  }, []);

  useEffect(() => { fetchApiPresets(); }, [fetchApiPresets]);

  // Merge: API presets are source of truth; Zustand adds any local-only ones
  const apiIds = new Set(apiPresets.map(p => p.preset.id));
  const localOnly = presets.filter(p => !apiIds.has(p.id));

  // Unified list: API presets first (newest first), then local-only
  const unified: Array<{ id: string; name: string; createdAt: string; source: 'api' | 'local'; apiData?: ApiPreset; components: Record<string, unknown> }> = [
    ...apiPresets.map(ap => ({ id: ap.preset.id, name: ap.preset.name, createdAt: ap.preset.createdAt, source: 'api' as const, apiData: ap, components: ap.components })),
    ...localOnly.map(p => ({ id: p.id, name: p.name, createdAt: p.createdAt, source: 'local' as const, components: p.components as Record<string, unknown> })),
  ];

  const handleSave = () => {
    const name = newName.trim() || `프리셋 ${unified.length + 1}`;
    savePreset(name);
    setNewName('');
    setTimeout(fetchApiPresets, 300);
  };

  const handleLoad = (item: typeof unified[0]) => {
    if (item.source === 'api' && item.apiData) {
      // Prefer pluginComponents if present (latest plugin edits), else use components
      const raw = item.apiData as ApiPreset & { pluginComponents?: Record<string, unknown> };
      const comps = raw.pluginComponents ?? item.apiData.components;
      Object.entries(comps).forEach(([key, val]) => {
        updateComponent(key, val as Record<string, unknown>);
      });
    } else {
      loadPreset(item.id);
    }
    setLoadedId(item.id);
    setTimeout(() => setLoadedId(null), 1500);
  };

  const handleDelete = (item: typeof unified[0]) => {
    deletePreset(item.id);
    setApiPresets(prev => prev.filter(p => p.preset.id !== item.id));
  };

  const handleRename = (id: string) => {
    if (editName.trim()) renamePreset(id, editName.trim());
    setEditingId(null);
    setTimeout(fetchApiPresets, 300);
  };

  const openExport = (id: string) => {
    if (exportingId === id) { setExportingId(null); return; }
    setExportingId(id);
    const sel: Record<string, boolean> = {};
    ALL_COMPS.forEach(c => { sel[c.key] = true; });
    setExportSel(sel);
  };

  const toggleComp = (key: string) => setExportSel(s => ({ ...s, [key]: !s[key] }));

  const handleCopy = useCallback((item: typeof unified[0]) => {
    const simplePalettes: Record<string, Record<string, string>> = {};
    if (item.source === 'api' && item.apiData) {
      Object.assign(simplePalettes, item.apiData.palettes);
    } else {
      Object.entries(palettes).forEach(([k, pal]) => {
        simplePalettes[k] = Object.fromEntries(Object.entries(pal.scale).map(([sh, hex]) => [sh, hex]));
      });
    }
    const components: Record<string, unknown> = {};
    ALL_COMPS.forEach(c => {
      if (exportSel[c.key] && item.components[c.key] !== undefined) {
        components[c.key] = item.components[c.key];
      }
    });
    const json = JSON.stringify({ designYu: true, version: '1', preset: { id: item.id, name: item.name, exportedAt: new Date().toISOString() }, palettes: simplePalettes, components }, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, [palettes, exportSel]);

  const fmt = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  };

  const selectedCount = Object.values(exportSel).filter(Boolean).length;

  return (
    <div className="max-w-2xl mx-auto px-8 py-10">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-bold text-gray-900">프리셋 관리</h1>
        <button onClick={fetchApiPresets} disabled={syncing} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
          <span className={syncing ? 'animate-spin' : ''}>↻</span> {syncing ? '동기화 중…' : '새로고침'}
        </button>
      </div>
      <p className="text-sm text-gray-400 mb-2">웹과 Figma 플러그인이 같은 프리셋을 공유합니다.</p>
      <p className="text-xs text-blue-500 mb-6">API: <code className="bg-blue-50 px-1 rounded">http://localhost:3001/api/presets</code> — 플러그인에서 이 주소로 불러오기/저장 가능</p>

      {/* 저장 */}
      <div className="flex gap-2 mb-8">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder="프리셋 이름 (예: A컴포넌트)"
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
        />
        <button onClick={handleSave} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg transition-colors">
          현재 설정 저장
        </button>
      </div>

      {/* 목록 */}
      {unified.length === 0 ? (
        <div className="text-center py-16 text-gray-300 text-sm">저장된 프리셋이 없습니다</div>
      ) : (
        <div className="flex flex-col gap-3">
          {unified.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors">
              <div className="px-5 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  {editingId === item.id ? (
                    <input
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleRename(item.id); if (e.key === 'Escape') setEditingId(null); }}
                      onBlur={() => handleRename(item.id)}
                      className="text-sm font-semibold text-gray-800 bg-transparent border-b border-blue-400 outline-none w-full"
                    />
                  ) : (
                    <button
                      onClick={() => { setEditingId(item.id); setEditName(item.name); }}
                      className="text-sm font-semibold text-gray-800 hover:text-blue-500 truncate text-left w-full"
                    >
                      {item.name}
                    </button>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">
                    {fmt(item.createdAt)}
                    {item.source === 'api'
                      ? <span className="ml-2 text-blue-400">● 동기화됨</span>
                      : <span className="ml-2 text-amber-400">● 로컬만</span>}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => openExport(item.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                      exportingId === item.id
                        ? 'bg-violet-50 text-violet-600 border-violet-300'
                        : 'bg-gray-50 hover:bg-violet-50 text-gray-600 hover:text-violet-600 border-gray-200 hover:border-violet-300'
                    }`}
                  >
                    Figma 내보내기
                  </button>
                  <button
                    onClick={() => handleLoad(item)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      loadedId === item.id ? 'bg-green-100 text-green-600' : 'bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    {loadedId === item.id ? '✓ 적용됨' : '불러오기'}
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="px-3 py-1.5 text-xs text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    삭제
                  </button>
                </div>
              </div>

              {/* Figma 내보내기 패널 */}
              {exportingId === item.id && (
                <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
                  <p className="text-xs font-semibold text-gray-500 mb-3">내보낼 컴포넌트 선택</p>
                  <div className="grid grid-cols-4 gap-1.5 mb-4">
                    {ALL_COMPS.map(c => (
                      <label key={c.key} className="flex items-center gap-1.5 cursor-pointer group">
                        <input type="checkbox" checked={exportSel[c.key] ?? true} onChange={() => toggleComp(c.key)} className="w-3 h-3 accent-violet-500" />
                        <span className="text-xs text-gray-600 group-hover:text-gray-900">{c.label}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const all = ALL_COMPS.every(c => exportSel[c.key]);
                        const next: Record<string, boolean> = {};
                        ALL_COMPS.forEach(c => { next[c.key] = !all; });
                        setExportSel(next);
                      }}
                      className="text-xs text-gray-400 hover:text-gray-600 underline"
                    >
                      {ALL_COMPS.every(c => exportSel[c.key]) ? '전체 해제' : '전체 선택'}
                    </button>
                    <span className="text-xs text-gray-400">{selectedCount}개 선택됨</span>
                    <div className="flex-1" />
                    <button
                      onClick={() => handleCopy(item)}
                      disabled={selectedCount === 0}
                      className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                        copiedId === item.id ? 'bg-green-100 text-green-600' : 'bg-violet-500 hover:bg-violet-600 text-white disabled:bg-gray-200 disabled:text-gray-400'
                      }`}
                    >
                      {copiedId === item.id ? '✓ 복사됨' : 'JSON 클립보드 복사'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">또는 플러그인에서 <code className="bg-gray-100 px-1 rounded">http://localhost:3001/api/presets</code> 로 직접 불러오기</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
