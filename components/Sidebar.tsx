'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useDS } from '@/lib/store';

const COMP_ITEMS = [
  { key: 'button',     label: 'Button',     icon: '🔘' },
  { key: 'input',      label: 'Input',      icon: '📝' },
  { key: 'textarea',   label: 'Textarea',   icon: '📄' },
  { key: 'select',     label: 'Select',     icon: '📋' },
  { key: 'checkbox',   label: 'Checkbox',   icon: '☑️' },
  { key: 'radio',      label: 'Radio',      icon: '🔵' },
  { key: 'toggle',     label: 'Toggle',     icon: '🔀' },
  { key: 'badge',      label: 'Badge',      icon: '🏷️' },
  { key: 'chip',       label: 'Chip',       icon: '💠' },
  { key: 'card',       label: 'Card',       icon: '🃏' },
  { key: 'alert',      label: 'Alert',      icon: '⚠️' },
  { key: 'toast',      label: 'Toast',      icon: '🔔' },
  { key: 'tab',        label: 'Tab',        icon: '🗂️' },
  { key: 'avatar',     label: 'Avatar',     icon: '👤' },
  { key: 'tooltip',    label: 'Tooltip',    icon: '💬' },
  { key: 'spinner',    label: 'Spinner',    icon: '⏳' },
  { key: 'skeleton',   label: 'Skeleton',   icon: '🦴' },
  { key: 'progress',   label: 'Progress',   icon: '📊' },
  { key: 'pagination', label: 'Pagination', icon: '📑' },
  { key: 'divider',    label: 'Divider',    icon: '➖' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { savePreset, presets } = useDS();
  const [saving, setSaving] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saved, setSaved] = useState(false);

  const navLink = (href: string, label: string, icon: string) => {
    const active = pathname === href || (href !== '/' && pathname.startsWith(href));
    return (
      <Link
        key={href}
        href={href}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
          active
            ? 'bg-blue-50 text-blue-700 font-semibold'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        <span>{icon}</span>
        <span>{label}</span>
      </Link>
    );
  };

  const handleSave = () => {
    const name = saveName.trim() || `프리셋 ${presets.length + 1}`;
    savePreset(name);
    setSaved(true);
    setSaving(false);
    setSaveName('');
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col h-full overflow-y-auto flex-shrink-0">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-gray-100">
        <h1 className="text-sm font-bold text-gray-900">🎨 Design Yu</h1>
        <p className="text-xs text-gray-400 mt-0.5">Design System Manager</p>
      </div>

      {/* 저장 버튼 */}
      <div className="px-3 py-3 border-b border-gray-100">
        {saving ? (
          <div className="flex gap-1">
            <input
              autoFocus
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setSaving(false); }}
              placeholder="프리셋 이름"
              className="flex-1 min-w-0 text-xs border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-blue-400"
            />
            <button onClick={handleSave} className="text-xs bg-blue-500 text-white px-2 py-1.5 rounded-md hover:bg-blue-600 flex-shrink-0">저장</button>
            <button onClick={() => setSaving(false)} className="text-xs text-gray-400 hover:text-gray-600 px-1">✕</button>
          </div>
        ) : (
          <button
            onClick={() => setSaving(true)}
            className={`w-full text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors ${
              saved
                ? 'bg-green-50 text-green-600 border border-green-200'
                : 'bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 border border-gray-200 hover:border-blue-300'
            }`}
          >
            {saved ? '✓ 저장됨' : '💾 현재 설정 저장'}
          </button>
        )}
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {/* Top nav */}
        <div className="mb-3">
          {navLink('/colors', '컬러 시스템', '🎨')}
          {navLink('/icons', '아이콘', '✦')}
          {navLink('/lucide', 'Lucide Icons', '◈')}
          {navLink('/export', 'JSON 내보내기', '📦')}
          {navLink('/presets', `프리셋 목록${presets.length > 0 ? ` (${presets.length})` : ''}`, '🗂')}
        </div>

        <div className="px-2 mb-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Components</span>
        </div>

        {COMP_ITEMS.map((c) =>
          navLink(`/components/${c.key}`, c.label, c.icon)
        )}
      </nav>
    </aside>
  );
}
