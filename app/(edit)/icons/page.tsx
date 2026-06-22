'use client';

import { useState, useEffect, useRef } from 'react';
import { ICONS } from '@/lib/icons';
import type { PaletteKey, Shade } from '@/lib/types';
import { useDS } from '@/lib/store';

const DEFAULTS = { palKey: 'gray' as PaletteKey, shade: 700 as Shade, size: 24, strokeWidth: 1.5 };
const MAIN_ICONS = ICONS.filter(i => i.category !== 'System');
const SYSTEM_ICONS = ICONS.filter(i => i.category === 'System');
const LAYOUT_KEY = 'icon-layout-v1';

type IconMeta = { raw: string; isColored: boolean; isStroke: boolean };
type CatGroup = { id: string; name: string; files: string[] };
type Layout = { uncategorized: string[]; cats: CatGroup[] };

function isColoredSvg(text: string): boolean {
  const vals = [...[...text.matchAll(/fill="([^"]+)"/g)].map(m => m[1]), ...[...text.matchAll(/stroke="([^"]+)"/g)].map(m => m[1])].filter(v => v !== 'none');
  const isGray = (v: string) => {
    const l = v.toLowerCase();
    if (['#000','#000000','black','#fff','#ffffff','white','currentcolor'].includes(l)) return true;
    const m = l.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/);
    if (m) { const r=parseInt(m[1],16),g=parseInt(m[2],16),b=parseInt(m[3],16); return Math.abs(r-g)<20&&Math.abs(g-b)<20&&Math.abs(r-b)<20; }
    return false;
  };
  return vals.some(v => !isGray(v));
}

function isStrokeSvg(text: string): boolean {
  return [...text.matchAll(/stroke="([^"]+)"/g)].some(m => m[1] !== 'none');
}

function applyProps(raw: string, size: number, strokeWidth: number, applyColor: boolean): string {
  let s = raw
    .replace(/<svg([^>]*)width="[^"]*"/, '<svg$1')
    .replace(/<svg([^>]*)height="[^"]*"/, '<svg$1')
    .replace(/<svg/, `<svg width="${size}" height="${size}" style="display:block"`);
  if (applyColor) {
    s = s
      .replace(/fill="(?!none)[^"]*"/g, 'fill="currentColor"')
      .replace(/stroke="(?!none)[^"]*"/g, 'stroke="currentColor"')
      .replace(/stroke-width="[^"]*"/g, `stroke-width="${strokeWidth}"`);
    s = s.replace('</svg>', `<style>path,circle,rect,line,polyline,polygon,ellipse{stroke-width:${strokeWidth}}</style></svg>`);
  }
  return s;
}

function loadLayout(): Layout {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(LAYOUT_KEY);
      if (saved) {
        const p: Layout = JSON.parse(saved);
        const all = new Set([...p.uncategorized, ...p.cats.flatMap(c => c.files)]);
        const newFiles = MAIN_ICONS.map(i => i.file).filter(f => !all.has(f));
        return { ...p, uncategorized: [...p.uncategorized, ...newFiles] };
      }
    } catch {}
  }
  return { uncategorized: MAIN_ICONS.map(i => i.file), cats: [] };
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

function IconCell({ name, meta, color, size, strokeWidth, copied, onCopy, dragMode }: {
  name: string; meta: IconMeta; color: string; size: number; strokeWidth: number;
  copied: boolean; onCopy: () => void; dragMode?: boolean;
}) {
  const svg = applyProps(meta.raw, size, strokeWidth, !meta.isColored);
  return (
    <div onClick={onCopy} title={name} className={`group flex flex-col items-center gap-2 p-3 rounded-xl border transition-all select-none
      ${dragMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
      ${copied ? 'border-blue-400 bg-blue-50' : 'border-gray-100 bg-white hover:border-blue-300 hover:bg-blue-50'}`}>
      <div style={{ color: meta.isColored ? undefined : color, width: size, height: size, flexShrink: 0 }}
        dangerouslySetInnerHTML={{ __html: svg }} />
      <span className={`text-[9px] text-center leading-tight break-all w-full ${copied ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600'}`}>
        {copied ? '복사됨!' : name}
      </span>
    </div>
  );
}

export default function IconsPage() {
  const { palettes } = useDS();
  const paletteKeys = Object.keys(palettes) as PaletteKey[];

  const [palKey, setPalKey] = useState<PaletteKey>(DEFAULTS.palKey);
  const [shade, setShade] = useState<Shade>(DEFAULTS.shade);
  const [size, setSize] = useState(DEFAULTS.size);
  const [strokeWidth, setStrokeWidth] = useState(DEFAULTS.strokeWidth);
  const [strokeInput, setStrokeInput] = useState(String(DEFAULTS.strokeWidth));
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [metaMap, setMetaMap] = useState<Record<string, IconMeta>>({});
  const [dragMode, setDragMode] = useState(false);
  const [layout, setLayout] = useState<Layout>(loadLayout);
  const [sysSize, setSysSize] = useState(24);
  const [editingCat, setEditingCat] = useState<string | null>(null);

  const dragRef = useRef<{ file: string; fromCat: string } | null>(null);
  const [dragOverCat, setDragOverCat] = useState<string | null>(null);
  const [dragOverFile, setDragOverFile] = useState<string | null>(null);

  useEffect(() => {
    ICONS.forEach(icon => {
      fetch(`/icons/${icon.file}`).then(r => r.text()).then(raw => {
        const meta: IconMeta = { raw, isColored: isColoredSvg(raw), isStroke: isStrokeSvg(raw) };
        setMetaMap(prev => ({ ...prev, [icon.file]: meta }));
      });
    });
  }, []);

  useEffect(() => {
    localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout));
  }, [layout]);

  const color = palettes[palKey]?.scale[shade] ?? '#374151';
  const shades: Shade[] = [100, 200, 300, 400, 500, 600, 700, 800, 900];
  const isDefault = palKey === DEFAULTS.palKey && shade === DEFAULTS.shade && size === DEFAULTS.size && strokeWidth === DEFAULTS.strokeWidth;

  const handleReset = () => { setPalKey(DEFAULTS.palKey); setShade(DEFAULTS.shade); setSize(DEFAULTS.size); setStrokeWidth(DEFAULTS.strokeWidth); setStrokeInput(String(DEFAULTS.strokeWidth)); };
  const handleStrokeInput = (v: string) => { setStrokeInput(v); const n = parseFloat(v); if (!isNaN(n) && n >= 0.5 && n <= 10) setStrokeWidth(n); };

  const handleCopy = (file: string) => {
    const raw = metaMap[file]?.raw; if (!raw) return;
    const doClip = async () => { try { await navigator.clipboard.writeText(raw); } catch { const el = document.createElement('textarea'); el.value = raw; el.style.position = 'fixed'; el.style.opacity = '0'; document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el); } };
    doClip(); setCopied(file); setTimeout(() => setCopied(null), 1500);
  };

  // Drag handlers
  const onDragStart = (file: string, fromCat: string) => { dragRef.current = { file, fromCat }; };
  const onDragOver = (e: React.DragEvent, file: string | null, catId: string) => {
    e.preventDefault(); setDragOverCat(catId); setDragOverFile(file);
  };
  const onDrop = (e: React.DragEvent, targetFile: string | null, toCat: string) => {
    e.preventDefault(); setDragOverCat(null); setDragOverFile(null);
    if (!dragRef.current) return;
    const { file, fromCat } = dragRef.current; dragRef.current = null;
    if (file === targetFile) return;
    setLayout(prev => {
      const removeFrom = (files: string[]) => files.filter(f => f !== file);
      let next = { uncategorized: fromCat === 'uncategorized' ? removeFrom(prev.uncategorized) : prev.uncategorized, cats: prev.cats.map(c => c.id === fromCat ? { ...c, files: removeFrom(c.files) } : c) };
      const insertInto = (files: string[]) => { if (!targetFile) return [...files, file]; const idx = files.indexOf(targetFile); return idx < 0 ? [...files, file] : [...files.slice(0, idx), file, ...files.slice(idx)]; };
      if (toCat === 'uncategorized') return { ...next, uncategorized: insertInto(next.uncategorized) };
      return { ...next, cats: next.cats.map(c => c.id === toCat ? { ...c, files: insertInto(c.files) } : c) };
    });
  };

  // Category management
  const addCategory = () => {
    const id = Date.now().toString();
    setLayout(prev => ({ ...prev, cats: [...prev.cats, { id, name: '새 카테고리', files: [] }] }));
    setEditingCat(id);
  };
  const renameCategory = (id: string, name: string) => setLayout(prev => ({ ...prev, cats: prev.cats.map(c => c.id === id ? { ...c, name } : c) }));
  const deleteCategory = (id: string) => setLayout(prev => { const cat = prev.cats.find(c => c.id === id); return { uncategorized: [...prev.uncategorized, ...(cat?.files ?? [])], cats: prev.cats.filter(c => c.id !== id) }; });

  const filterFiles = (files: string[]) => search === '' ? files : files.filter(f => { const icon = ICONS.find(i => i.file === f); return icon?.name.toLowerCase().includes(search.toLowerCase()); });

  const renderGrid = (files: string[], catId: string) => (
    <div
      className={`grid gap-2 min-h-[60px] rounded-xl transition-colors ${dragOverCat === catId && dragOverFile === null ? 'bg-blue-50/50' : ''}`}
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))' }}
      onDragOver={e => onDragOver(e, null, catId)}
      onDrop={e => onDrop(e, null, catId)}
    >
      {filterFiles(files).map(file => {
        const icon = ICONS.find(i => i.file === file);
        const meta = metaMap[file];
        const isOver = dragOverCat === catId && dragOverFile === file;
        if (!icon) return null;
        return (
          <div key={file} className={`transition-all ${isOver && dragMode ? 'ring-2 ring-blue-400 ring-offset-1 rounded-xl' : ''}`}
            draggable={dragMode}
            onDragStart={() => onDragStart(file, catId)}
            onDragOver={e => onDragOver(e, file, catId)}
            onDrop={e => onDrop(e, file, catId)}
          >
            {meta ? (
              <IconCell name={icon.name} meta={meta} color={color} size={size} strokeWidth={strokeWidth}
                copied={copied === file} onCopy={() => handleCopy(file)} dragMode={dragMode} />
            ) : (
              <div className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 bg-white">
                <div style={{ width: size, height: size }} className="bg-gray-100 rounded animate-pulse" />
                <span className="text-[9px] text-gray-300">{icon.name}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const totalFiltered = filterFiles(layout.uncategorized).length + layout.cats.reduce((s, c) => s + filterFiles(c.files).length, 0);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Controls */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 bg-white flex-shrink-0 flex-wrap">
          <h1 className="text-sm font-bold text-gray-700">Icons <span className="text-gray-400 font-normal">({totalFiltered})</span></h1>

          <div className="relative">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 16 16"><circle cx="6.5" cy="6.5" r="4.5"/><path d="M11 11l3 3" strokeLinecap="round"/></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="검색..." className="pl-7 pr-3 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 w-28" />
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

          <button onClick={() => setDragMode(d => !d)}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border transition-all ml-auto ${dragMode ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
            <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 2v10M9 2v10M2 5h10M2 9h10" strokeLinecap="round"/></svg>
            순서 변경
          </button>
        </div>

        {/* Grid area */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {/* Uncategorized */}
          {renderGrid(layout.uncategorized, 'uncategorized')}

          {/* Custom categories */}
          {layout.cats.map(cat => (
            <div key={cat.id} className={`rounded-xl border-2 transition-colors p-3 ${dragOverCat === cat.id ? 'border-blue-300 bg-blue-50/30' : 'border-dashed border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-3">
                {editingCat === cat.id ? (
                  <input autoFocus defaultValue={cat.name} onBlur={e => { renameCategory(cat.id, e.target.value || cat.name); setEditingCat(null); }}
                    onKeyDown={e => { if (e.key === 'Enter') { renameCategory(cat.id, (e.target as HTMLInputElement).value || cat.name); setEditingCat(null); } }}
                    className="text-xs font-bold text-gray-600 border-b border-blue-400 outline-none bg-transparent px-0.5 w-32" />
                ) : (
                  <button onClick={() => setEditingCat(cat.id)} className="text-xs font-bold text-gray-500 hover:text-gray-700 uppercase tracking-widest">
                    {cat.name} <span className="font-normal">({filterFiles(cat.files).length})</span>
                  </button>
                )}
                <button onClick={() => deleteCategory(cat.id)} className="ml-auto text-gray-300 hover:text-red-400 transition-colors p-0.5">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 2l8 8M10 2l-8 8" strokeLinecap="round"/></svg>
                </button>
              </div>
              {renderGrid(cat.files, cat.id)}
            </div>
          ))}

          {/* Add category */}
          <button onClick={addCategory}
            className="flex items-center gap-2 w-full px-4 py-3 rounded-xl border-2 border-dashed border-gray-200 text-xs text-gray-400 hover:border-blue-300 hover:text-blue-400 transition-colors">
            <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 2v10M2 7h10" strokeLinecap="round"/></svg>
            카테고리 추가
          </button>
        </div>
      </div>

      {/* System sidebar */}
      <div className="w-48 border-l border-gray-100 flex flex-col flex-shrink-0 bg-gray-50/40">
        <div className="px-3 pt-3 pb-2 border-b border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">System</p>
          <div className="flex items-center gap-1.5">
            <input type="range" min={12} max={48} step={2} value={sysSize} onChange={e => setSysSize(Number(e.target.value))} className="flex-1 accent-blue-500" />
            <span className="text-[11px] text-gray-500 w-7 text-right">{sysSize}px</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(56px, 1fr))' }}>
            {SYSTEM_ICONS.map(icon => {
              const meta = metaMap[icon.file];
              const svg = meta ? applyProps(meta.raw, sysSize, 1.5, false) : '';
              return (
                <button key={icon.file} onClick={() => handleCopy(icon.file)} title={icon.name}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${copied === icon.file ? 'border-blue-400 bg-blue-50' : 'border-transparent hover:border-blue-200 hover:bg-white'}`}>
                  {meta ? <div dangerouslySetInnerHTML={{ __html: svg }} /> : <div style={{ width: sysSize, height: sysSize }} className="bg-gray-100 rounded animate-pulse" />}
                  <span className={`text-[8px] text-center leading-tight break-all w-full ${copied === icon.file ? 'text-blue-500' : 'text-gray-400'}`}>
                    {copied === icon.file ? '복사됨!' : icon.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
