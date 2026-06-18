'use client';

import { useState } from 'react';
import { useDS } from '@/lib/store';

export default function ExportPage() {
  const { exportJSON } = useDS();
  const [copied, setCopied] = useState(false);

  const json = JSON.stringify(exportJSON(), null, 2);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'design-system.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">JSON 내보내기</h1>
        <p className="text-sm text-gray-500 mt-1">현재 디자인 시스템 설정을 JSON으로 내보냅니다. Figma 플러그인에서 불러와 사용하세요.</p>
      </div>

      <div className="flex gap-3 mb-4">
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          {copied ? '✅ 복사됨!' : '📋 클립보드 복사'}
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white text-sm font-semibold rounded-lg hover:bg-gray-900 transition-colors"
        >
          ⬇️ JSON 다운로드
        </button>
      </div>

      <div className="bg-gray-900 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-700">
          <span className="text-xs font-mono text-gray-400">design-system.json</span>
          <span className="text-xs text-gray-500">{(new TextEncoder().encode(json).length / 1024).toFixed(1)} KB</span>
        </div>
        <pre className="text-xs font-mono text-green-300 p-5 overflow-auto max-h-[60vh] leading-relaxed">
          {json}
        </pre>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
        <strong>💡 사용 방법:</strong> 위 JSON을 다운로드하거나 복사한 뒤, Figma 플러그인 UI의 &quot;JSON 가져오기&quot; 기능에 붙여넣기 하면 설정이 적용됩니다.
      </div>
    </div>
  );
}
