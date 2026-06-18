'use client';

import { use } from 'react';
import { useDS } from '@/lib/store';
import { ComponentForm } from '@/components/ComponentForm';
import { ComponentPreview } from '@/components/ComponentPreview';

export default function ComponentPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = use(params);
  const { components } = useDS();

  if (!(key in components)) {
    return <div className="p-8 text-gray-400">컴포넌트를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="flex h-full">
      {/* Left: Settings form */}
      <div className="w-[360px] border-r border-gray-200 bg-white overflow-y-auto flex-shrink-0">
        <ComponentForm compKey={key} />
      </div>

      {/* Right: Live preview */}
      <div className="flex-1 bg-gray-50 overflow-y-auto">
        <ComponentPreview compKey={key} />
      </div>
    </div>
  );
}
