'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDS } from '@/lib/store';

interface ApiPreset {
  designYu: boolean;
  version: string;
  preset: { id: string; name: string; createdAt: string; updatedAt?: string };
  palettes: Record<string, Record<string, string>>;
  components: Record<string, unknown>;
  semanticList?: unknown[];
  bgGroup?: unknown[];
  borderGroup?: unknown[];
  pluginComponents?: Record<string, unknown>;
}

export default function HomePage() {
  const router = useRouter();
  const { presets, deletePreset, startNewSet, openSet } = useDS();
  const [apiPresets, setApiPresets] = useState<ApiPreset[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const fetchApiPresets = useCallback((silent = false) => {
    if (!silent) setSyncing(true);
    fetch('/api/presets')
      .then((r) => r.json())
      .then((data: ApiPreset[]) => setApiPresets(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => { if (!silent) setSyncing(false); });
  }, []);

  useEffect(() => {
    fetchApiPresets();
    // 플러그인 등 다른 곳에서 저장한 세트가 자동 반영되도록 주기적 동기화(조용히)
    const t = setInterval(() => fetchApiPresets(true), 5000);
    return () => clearInterval(t);
  }, [fetchApiPresets]);

  const apiIds = new Set(apiPresets.map((p) => p.preset.id));
  const localOnly = presets.filter((p) => !apiIds.has(p.id));

  const unified = [
    ...apiPresets.map((ap) => ({ id: ap.preset.id, name: ap.preset.name, createdAt: ap.preset.createdAt, source: 'api' as const, apiData: ap })),
    ...localOnly.map((p) => ({ id: p.id, name: p.name, createdAt: p.createdAt, source: 'local' as const, apiData: undefined })),
  ];

  const handleCreate = () => {
    const name = newName.trim() || `디자인 세트 ${unified.length + 1}`;
    startNewSet(name);
    setNewName('');
    setCreating(false);
    router.push('/colors');
  };

  const handleOpen = (item: typeof unified[0]) => {
    if (item.apiData) {
      openSet(item.apiData as Parameters<typeof openSet>[0]);
    } else {
      // 로컬 전용: 이름/컴포넌트만 복원
      startNewSet(item.name);
      openSet({ preset: { id: item.id, name: item.name } });
    }
    router.push('/colors');
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deletePreset(id);
    setApiPresets((prev) => prev.filter((p) => p.preset.id !== id));
  };

  const fmt = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-bold text-gray-900">🎨 디자인 세트</h1>
          <button onClick={() => fetchApiPresets()} disabled={syncing} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
            <span className={syncing ? 'animate-spin' : ''}>↻</span> {syncing ? '동기화 중…' : '새로고침'}
          </button>
        </div>
        <p className="text-sm text-gray-400 mb-6">컬러 시스템·컴포넌트·아이콘을 한 벌로 묶어 관리합니다. 웹과 Figma 플러그인이 같은 세트를 공유합니다.</p>

        {/* 생성 */}
        <div className="mb-8">
          {creating ? (
            <div className="flex gap-2">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(false); }}
                placeholder="디자인 세트 이름 (예: A 디자인)"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              />
              <button onClick={handleCreate} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg">생성</button>
              <button onClick={() => setCreating(false)} className="px-2 text-gray-400 hover:text-gray-600">✕</button>
            </div>
          ) : (
            <button onClick={() => setCreating(true)} className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm font-semibold text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors">
              + 디자인 세트 생성
            </button>
          )}
        </div>

        {/* 목록 */}
        {unified.length === 0 ? (
          <div className="text-center py-16 text-gray-300 text-sm">저장된 디자인 세트가 없습니다</div>
        ) : (
          <div className="flex flex-col gap-3">
            {unified.map((item) => (
              <div
                key={item.id}
                onClick={() => handleOpen(item)}
                className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center gap-4 cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {fmt(item.createdAt)}
                    {item.source === 'api'
                      ? <span className="ml-2 text-blue-400">● 동기화됨</span>
                      : <span className="ml-2 text-amber-400">● 로컬만</span>}
                  </p>
                </div>
                <span className="text-xs text-gray-300 group-hover:text-gray-500">편집 →</span>
                <button
                  onClick={(e) => handleDelete(e, item.id)}
                  className="px-2.5 py-1.5 text-xs text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
