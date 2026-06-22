'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { useDS } from '@/lib/store';

const NAV = [
  { href: '/colors', label: '컬러 시스템', icon: '🎨', match: (p: string) => p.startsWith('/colors') },
  { href: '/icons',  label: '아이콘',     icon: '✦',  match: (p: string) => p.startsWith('/icons') },
  { href: '/lucide', label: 'Lucide Icons', icon: '◈', match: (p: string) => p.startsWith('/lucide') },
  { href: '/export', label: 'JSON 내보내기', icon: '📦', match: (p: string) => p.startsWith('/export') },
];

const COMP_ITEMS = [
  { key: 'button', label: 'Button', icon: '🔘' }, { key: 'input', label: 'Input', icon: '📝' },
  { key: 'textarea', label: 'Textarea', icon: '📄' }, { key: 'select', label: 'Select', icon: '📋' },
  { key: 'checkbox', label: 'Checkbox', icon: '☑️' }, { key: 'radio', label: 'Radio', icon: '🔵' },
  { key: 'toggle', label: 'Toggle', icon: '🔀' }, { key: 'badge', label: 'Badge', icon: '🏷️' },
  { key: 'chip', label: 'Chip', icon: '💠' }, { key: 'card', label: 'Card', icon: '🃏' },
  { key: 'alert', label: 'Alert', icon: '⚠️' }, { key: 'toast', label: 'Toast', icon: '🔔' },
  { key: 'tab', label: 'Tab', icon: '🗂️' }, { key: 'avatar', label: 'Avatar', icon: '👤' },
  { key: 'tooltip', label: 'Tooltip', icon: '💬' }, { key: 'spinner', label: 'Spinner', icon: '⏳' },
  { key: 'skeleton', label: 'Skeleton', icon: '🦴' }, { key: 'progress', label: 'Progress', icon: '📊' },
  { key: 'pagination', label: 'Pagination', icon: '📑' }, { key: 'divider', label: 'Divider', icon: '➖' },
];

export default function EditLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentSetName, saveCurrentSet } = useDS();
  const [name, setName] = useState(currentSetName);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    saveCurrentSet(name);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const navLink = (href: string, label: string, icon: string, active: boolean) => (
    <Link
      key={href}
      href={href}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
        active ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </Link>
  );

  return (
    <div className="flex h-full overflow-hidden">
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col h-full overflow-y-auto flex-shrink-0">
        {/* 헤더: 목록 / 세트 이름 */}
        <div className="px-4 py-3 border-b border-gray-100">
          <button
            onClick={() => router.push('/')}
            className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1 mb-2"
          >
            ← 목록
          </button>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="디자인 세트 이름"
            className="w-full text-sm font-bold text-gray-900 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-blue-400 outline-none py-0.5"
          />
        </div>

        {/* 저장 */}
        <div className="px-3 py-3 border-b border-gray-100">
          <button
            onClick={handleSave}
            className={`w-full text-sm font-semibold py-2 px-3 rounded-lg transition-colors ${
              saved ? 'bg-green-100 text-green-600' : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {saved ? '✓ 저장됨' : '💾 저장'}
          </button>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5">
          <div className="mb-3">
            {NAV.map((n) => navLink(n.href, n.label, n.icon, n.match(pathname)))}
          </div>

          <div className="px-2 mb-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Components</span>
          </div>
          {COMP_ITEMS.map((c) =>
            navLink(`/components/${c.key}`, c.label, c.icon, pathname === `/components/${c.key}`)
          )}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
