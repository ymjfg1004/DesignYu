'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { LUCIDE_ICONS } from '@/lib/lucide-icons';
import type { PaletteKey, Shade } from '@/lib/types';
import { useDS } from '@/lib/store';

const DEFAULTS = { palKey: 'gray' as PaletteKey, shade: 700 as Shade, size: 24, strokeWidth: 1.5 };
const PAGE_SIZE = 200;

const ICON_LINKS = [
  { name: 'SVG Repo', url: 'https://www.svgrepo.com', desc: '무료 SVG 아이콘 수십만 개', color: '#6366f1' },
  { name: 'Iconify', url: 'https://iconify.design', desc: 'Material, Lucide, Tabler 등 통합', color: '#f59e0b' },
  { name: 'Lucide Icons', url: 'https://lucide.dev', desc: '깔끔한 라인 아이콘 · SVG 복사 가능', color: '#ec4899' },
  { name: 'Tabler Icons', url: 'https://tabler.io/icons', desc: 'UI/UX에 인기 · 5,000개 이상', color: '#0ea5e9' },
  { name: 'Google Material Symbols', url: 'https://fonts.google.com/icons', desc: '구글 공식 · Filled / Outlined / Rounded', color: '#22c55e' },
  { name: 'Phosphor Icons', url: 'https://phosphoricons.com', desc: '두께 조절 · 다양한 스타일 제공', color: '#f97316' },
];

function applyProps(raw: string, size: number, strokeWidth: number, color: string): string {
  return raw
    .replace(/<svg([^>]*)width="[^"]*"/, '<svg$1')
    .replace(/<svg([^>]*)height="[^"]*"/, '<svg$1')
    .replace(/<svg/, `<svg width="${size}" height="${size}" style="display:block;color:${color}"`)
    .replace(/fill="(?!none)[^"]*"/g, 'fill="currentColor"')
    .replace(/stroke="(?!none)[^"]*"/g, 'stroke="currentColor"')
    .replace('</svg>', `<style>path,circle,rect,line,polyline,polygon,ellipse{stroke-width:${strokeWidth}}</style></svg>`);
}

function PaletteSelectSimple({ value, onChange, palettes, paletteKeys }: {
  value: PaletteKey; onChange: (v: PaletteKey) => void;
  palettes: Record<PaletteKey, { scale: Record<number, string> }>; paletteKeys: PaletteKey[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, []);
  const color = palettes[value]?.scale[500] ?? '#888';
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1.5 border border-gray-200 rounded px-2 py-1 text-xs bg-white hover:border-gray-300">
        <span className="w-3 h-3 rounded-sm border border-black/10 flex-shrink-0" style={{ background: color }} />
        <span>{value}</span>
        <svg className="w-3 h-3 text-gray-400" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4l4 4 4-4" strokeLinecap="round"/></svg>
      </button>
      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto w-40">
          {paletteKeys.map(k => (
            <button key={k} onClick={() => { onChange(k); setOpen(false); }} className={`flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-gray-50 ${k === value ? 'bg-blue-50 text-blue-600' : ''}`}>
              <span className="w-3 h-3 rounded-sm border border-black/10 flex-shrink-0" style={{ background: palettes[k]?.scale[500] ?? '#ccc' }} />
              {k}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LucidePage() {
  const { palettes } = useDS();
  const paletteKeys = Object.keys(palettes) as PaletteKey[];

  const [palKey, setPalKey] = useState<PaletteKey>(DEFAULTS.palKey);
  const [shade, setShade] = useState<Shade>(DEFAULTS.shade);
  const [size, setSize] = useState(DEFAULTS.size);
  const [strokeWidth, setStrokeWidth] = useState(DEFAULTS.strokeWidth);
  const [strokeInput, setStrokeInput] = useState(String(DEFAULTS.strokeWidth));
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const [svgCache, setSvgCache] = useState<Record<string, string>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  const color = palettes[palKey]?.scale[shade] ?? '#374151';
  const shades: Shade[] = [100, 200, 300, 400, 500, 600, 700, 800, 900];

  const filtered = useMemo(() =>
    search === '' ? LUCIDE_ICONS : LUCIDE_ICONS.filter(n => n.includes(search.toLowerCase().replace(/\s+/g, '-'))),
    [search]
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageIcons = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  useEffect(() => { setPage(0); }, [search]);

  useEffect(() => {
    pageIcons.forEach(name => {
      if (svgCache[name]) return;
      fetch(`/icons/lucide/${name}.svg`).then(r => r.text()).then(raw =>
        setSvgCache(prev => prev[name] ? prev : { ...prev, [name]: raw })
      );
    });
  }, [pageIcons.join(',')]);

  const goPage = (p: number) => {
    setPage(p);
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopy = (name: string) => {
    const raw = svgCache[name]; if (!raw) return;
    const doClip = async () => { try { await navigator.clipboard.writeText(raw); } catch { const el = document.createElement('textarea'); el.value = raw; el.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el); } };
    doClip(); setCopied(name); setTimeout(() => setCopied(null), 1500);
  };

  const handleStrokeInput = (v: string) => {
    setStrokeInput(v); const n = parseFloat(v);
    if (!isNaN(n) && n >= 0.5 && n <= 10) setStrokeWidth(n);
  };

  const isDefault = palKey === DEFAULTS.palKey && shade === DEFAULTS.shade && size === DEFAULTS.size && strokeWidth === DEFAULTS.strokeWidth;
  const handleReset = () => { setPalKey(DEFAULTS.palKey); setShade(DEFAULTS.shade); setSize(DEFAULTS.size); setStrokeWidth(DEFAULTS.strokeWidth); setStrokeInput(String(DEFAULTS.strokeWidth)); };

  // 페이지 번호 배열 (최대 7개 표시)
  const pageNums = useMemo(() => {
    const delta = 2;
    const range: number[] = [];
    for (let i = Math.max(0, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) range.push(i);
    if (range[0] > 0) { range.unshift(-1); range.unshift(0); }
    if (range[range.length - 1] < totalPages - 1) { range.push(-1); range.push(totalPages - 1); }
    return range;
  }, [page, totalPages]);

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 bg-white flex-shrink-0 flex-wrap">
        <h1 className="text-sm font-bold text-gray-700">
          Lucide <span className="text-gray-400 font-normal">({filtered.length.toLocaleString()})</span>
        </h1>

        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 16 16"><circle cx="6.5" cy="6.5" r="4.5"/><path d="M11 11l3 3" strokeLinecap="round"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="검색..." className="pl-7 pr-3 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 w-36" />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">컬러</span>
          <PaletteSelectSimple value={palKey} onChange={setPalKey} palettes={palettes} paletteKeys={paletteKeys} />
          <div className="flex gap-0.5">
            {shades.map(s => (
              <button key={s} onClick={() => setShade(s)} className={`w-5 h-5 rounded border transition-all ${shade === s ? 'border-blue-500 scale-110' : 'border-transparent hover:border-gray-300'}`} style={{ background: palettes[palKey]?.scale[s] ?? '#ccc' }} title={String(s)} />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">크기</span>
          <input type="range" min={12} max={64} step={2} value={size} onChange={e => setSize(Number(e.target.value))} className="w-20 accent-blue-500" />
          <span className="text-xs text-gray-600 w-8">{size}px</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">선 두께</span>
          <input type="number" min={0.5} max={10} step={0.5} value={strokeInput}
            onChange={e => handleStrokeInput(e.target.value)} onBlur={() => setStrokeInput(String(strokeWidth))}
            className="w-14 px-2 py-1 text-xs border border-gray-200 rounded text-center focus:outline-none focus:border-blue-400" />
        </div>

        <button onClick={handleReset} disabled={isDefault}
          className={`flex items-center gap-1 px-2 py-1 text-xs rounded-lg border transition-all ${isDefault ? 'border-gray-100 text-gray-300 cursor-default' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 6a4 4 0 1 1 .8 2.4" strokeLinecap="round"/><path d="M2 3v3h3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          초기화
        </button>
      </div>

      {/* Scrollable content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {/* Grid */}
        <div className="px-5 py-5">
          <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))' }}>
            {pageIcons.map(name => {
              const raw = svgCache[name];
              const svg = raw ? applyProps(raw, size, strokeWidth, color) : '';
              const isCopied = copied === name;
              return (
                <button key={name} onClick={() => handleCopy(name)} title={name}
                  className={`group flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${isCopied ? 'border-blue-400 bg-blue-50' : 'border-gray-100 bg-white hover:border-blue-300 hover:bg-blue-50'}`}>
                  {raw ? (
                    <div style={{ width: size, height: size, flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: svg }} />
                  ) : (
                    <div style={{ width: size, height: size }} className="bg-gray-100 rounded animate-pulse" />
                  )}
                  <span className={`text-[9px] text-center leading-tight break-all w-full ${isCopied ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600'}`}>
                    {isCopied ? '복사됨!' : name}
                  </span>
                </button>
              );
            })}
          </div>
          {filtered.length === 0 && <div className="text-center text-gray-400 text-sm mt-20">검색 결과 없음</div>}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 py-4">
            <button onClick={() => goPage(0)} disabled={page === 0} className="px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50">«</button>
            <button onClick={() => goPage(page - 1)} disabled={page === 0} className="px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50">‹</button>
            {pageNums.map((n, i) =>
              n === -1
                ? <span key={`dot-${i}`} className="px-1 text-gray-400 text-xs">…</span>
                : <button key={n} onClick={() => goPage(n)}
                    className={`w-8 h-7 text-xs rounded-lg border transition-all ${n === page ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-200 hover:bg-gray-50 text-gray-600'}`}>
                    {n + 1}
                  </button>
            )}
            <button onClick={() => goPage(page + 1)} disabled={page === totalPages - 1} className="px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50">›</button>
            <button onClick={() => goPage(totalPages - 1)} disabled={page === totalPages - 1} className="px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50">»</button>
          </div>
        )}

        {/* Icon resource banners */}
        <div className="px-5 pb-8 mt-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">아이콘 리소스</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {ICON_LINKS.map(link => (
              <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm transition-all group">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: link.color }} />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-700 group-hover:text-blue-600 transition-colors truncate">{link.name}</p>
                  <p className="text-[10px] text-gray-400 leading-tight mt-0.5 truncate">{link.desc}</p>
                </div>
                <svg className="w-3 h-3 text-gray-300 group-hover:text-blue-400 flex-shrink-0 ml-auto transition-colors" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 10L10 2M5 2h5v5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
