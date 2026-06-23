'use client';

import { useRef, useState, useEffect } from 'react';
import { useDS } from '@/lib/store';
import type { PaletteKey, Shade, Palette, SimpleSettings } from '@/lib/types';

function PaletteSelect({
  value,
  onChange,
  paletteKeys,
  palettes,
  includeNone,
  className,
}: {
  value: PaletteKey | null;
  onChange: (v: PaletteKey | null) => void;
  paletteKeys: PaletteKey[];
  palettes: Record<PaletteKey, Palette>;
  includeNone?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
    else setQuery('');
  }, [open]);

  const chipColor = (k: PaletteKey | null) => {
    if (!k) return 'transparent';
    return palettes[k]?.scale[500] ?? palettes[k]?.base ?? '#ccc';
  };

  const filtered = paletteKeys.filter((k) => k.toLowerCase().includes(query.toLowerCase()));
  const showNone = includeNone && '없음'.includes(query);
  const label = value ?? '없음';

  return (
    <div ref={ref} className={`relative ${className ?? ''}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 w-full text-xs border border-gray-200 rounded-md px-1.5 py-1 focus:outline-none focus:border-blue-400 bg-white hover:border-gray-300 text-left"
      >
        <span
          className="w-3 h-3 rounded-sm border border-black/10 flex-shrink-0"
          style={{ background: chipColor(value) }}
        />
        <span className="truncate flex-1">{label}</span>
        <svg className="w-3 h-3 text-gray-400 flex-shrink-0" viewBox="0 0 12 12" fill="currentColor">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        </svg>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="p-1.5 border-b border-gray-100">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="검색..."
              className="w-full text-xs px-2 py-1 border border-gray-200 rounded focus:outline-none focus:border-blue-400"
            />
          </div>
          <div className="max-h-44 overflow-y-auto">
            {showNone && (
              <button
                type="button"
                onClick={() => { onChange(null); setOpen(false); }}
                className={`flex items-center gap-1.5 w-full px-2 py-1.5 text-xs hover:bg-gray-50 text-left ${value === null ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
              >
                <span className="w-3 h-3 rounded-sm border border-gray-200 flex-shrink-0" style={{ background: 'transparent' }} />
                없음
              </button>
            )}
            {filtered.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => { onChange(k); setOpen(false); }}
                className={`flex items-center gap-1.5 w-full px-2 py-1.5 text-xs hover:bg-gray-50 text-left ${value === k ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
              >
                <span
                  className="w-3 h-3 rounded-sm border border-black/10 flex-shrink-0"
                  style={{ background: chipColor(k) }}
                />
                {k}
              </button>
            ))}
            {filtered.length === 0 && !showNone && (
              <p className="text-xs text-gray-400 px-3 py-2">결과 없음</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const SEMANTIC_IDS = new Set(['primary', 'secondary', 'info', 'success', 'error', 'warning']);
const SHADES: Shade[] = [100, 200, 300, 400, 500, 600, 700, 800, 900];

const COMP_LABELS: Record<string, string> = {
  button: '🔘 Button', input: '📝 Input', textarea: '📄 Textarea', select: '📋 Select',
  checkbox: '☑️ Checkbox', radio: '🔵 Radio', toggle: '🔀 Toggle', badge: '🏷️ Badge',
  chip: '💠 Chip', card: '🃏 Card', alert: '⚠️ Alert', toast: '🔔 Toast',
  tab: '🗂️ Tab', avatar: '👤 Avatar', tooltip: '💬 Tooltip', spinner: '⏳ Spinner',
  skeleton: '🦴 Skeleton', progress: '📊 Progress', pagination: '📑 Pagination', divider: '➖ Divider',
};

function Section({ title, children, onDelete, onRename, renameValue, dragHandleProps, columnHeaders }: {
  title: string; children: React.ReactNode;
  onDelete?: () => void; onRename?: (name: string) => void; renameValue?: string;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  columnHeaders?: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <div className={`flex items-center justify-between mb-3 ${dragHandleProps ? 'bg-gray-700 rounded px-2 py-1.5 -mx-2' : ''}`}>
        <div className="flex items-center gap-1.5">
          {dragHandleProps && (
            <div
              {...dragHandleProps}
              className="flex flex-col gap-[3px] cursor-grab active:cursor-grabbing px-0.5 py-1 text-white/50 hover:text-white transition-colors"
              title="드래그로 순서 변경"
            >
              <span className="block w-3 h-px bg-current rounded" />
              <span className="block w-3 h-px bg-current rounded" />
              <span className="block w-3 h-px bg-current rounded" />
            </div>
          )}
          <p className={`text-[12px] font-bold uppercase tracking-widest ${dragHandleProps ? 'text-gray-400' : 'text-gray-600'}`}>{title}</p>
          {onRename && renameValue !== undefined && (
            <input
              type="text"
              defaultValue={renameValue}
              key={renameValue}
              onBlur={(e) => { if (e.target.value.trim()) onRename(e.target.value.trim()); }}
              onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
              className={`text-[12px] font-bold tracking-widest bg-transparent border-0 border-b border-dashed focus:outline-none w-20 py-0 ${dragHandleProps ? 'text-white border-white/40 focus:border-white' : 'text-gray-600 border-gray-300 focus:border-blue-400'}`}
            />
          )}
        </div>
        {columnHeaders && <div className="flex-1 flex justify-end pr-1">{columnHeaders}</div>}
        {onDelete && (
          <button onClick={() => { if (window.confirm('삭제하시겠습니까?')) onDelete(); }} className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] transition-colors ${dragHandleProps ? 'text-white/50 hover:bg-white/20 hover:text-white' : 'text-gray-300 hover:bg-red-50 hover:text-red-400'}`}>✕</button>
        )}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function NumRow({ label, value, onChange, min = 0, max = 200, unit = 'px' }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; unit?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-600">{label}</span>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-16 text-right text-xs border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:border-blue-400"
        />
        <span className="text-[10px] text-gray-400 w-5">{unit}</span>
      </div>
    </div>
  );
}

function ShadeSelect({
  value,
  onChange,
  palValue,
  palettes,
  className,
}: {
  value: Shade;
  onChange: (v: Shade) => void;
  palValue: PaletteKey | null;
  palettes: Record<PaletteKey, Palette>;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const chip = (s: Shade) => palValue ? (palettes[palValue]?.scale[s] ?? '#ccc') : '#e5e7eb';

  return (
    <div ref={ref} className={`relative ${className ?? ''}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 w-full text-xs border border-gray-200 rounded-md px-1.5 py-1 focus:outline-none focus:border-blue-400 bg-white hover:border-gray-300"
      >
        <span className="w-3 h-3 rounded-sm border border-black/10 flex-shrink-0" style={{ background: chip(value) }} />
        <span className="flex-1 text-center">{value}</span>
        <svg className="w-3 h-3 text-gray-400 flex-shrink-0" viewBox="0 0 12 12" fill="currentColor">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        </svg>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 right-0 w-20 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {SHADES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => { onChange(s); setOpen(false); }}
              className={`flex items-center gap-1.5 w-full px-2 py-1.5 text-xs hover:bg-gray-50 text-left ${value === s ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
            >
              <span className="w-3 h-3 rounded-sm border border-black/10 flex-shrink-0" style={{ background: chip(s) }} />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ColorRow({ label, palValue, shadeValue, opacity, onPalChange, onShadeChange, onOpacityChange, includeNone = false, palettes, paletteKeys }: {
  label: string;
  palValue: PaletteKey | null;
  shadeValue: Shade;
  opacity?: number;
  onPalChange: (v: PaletteKey | null) => void;
  onShadeChange: (v: Shade) => void;
  onOpacityChange?: (v: number) => void;
  includeNone?: boolean;
  palettes: Record<PaletteKey, Palette>;
  paletteKeys: PaletteKey[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] text-gray-400">{label}</span>
      <div className="flex items-center gap-1.5">
        <PaletteSelect value={palValue} onChange={onPalChange} paletteKeys={paletteKeys} palettes={palettes} includeNone={includeNone} className="flex-1 min-w-0" />
        {palValue !== null && <ShadeSelect value={shadeValue} onChange={onShadeChange} palValue={palValue} palettes={palettes} className="w-[68px] flex-shrink-0" />}
        {palValue !== null && onOpacityChange && (
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <input type="number" min={0} max={100} value={opacity ?? 100}
              onChange={(e) => onOpacityChange(Math.min(100, Math.max(0, Number(e.target.value))))}
              className="w-10 text-right text-xs border border-gray-200 rounded-md px-1 py-1 focus:outline-none focus:border-blue-400" />
            <span className="text-xs text-gray-400">%</span>
          </div>
        )}
      </div>
    </div>
  );
}

function HexRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-600">{label}</span>
      <div className="flex items-center gap-1.5">
        <div className="w-3.5 h-3.5 rounded-sm border border-gray-200 flex-shrink-0" style={{ background: value }} />
        <input
          type="text"
          defaultValue={value.replace('#', '')}
          key={value}
          maxLength={6}
          onBlur={(e) => { const v = e.target.value.replace('#', ''); if (v.length === 6) onChange(`#${v}`); }}
          onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
          className="w-20 text-xs font-mono border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:border-blue-400 text-right"
        />
      </div>
    </div>
  );
}

function StateHexRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-gray-400 w-10 flex-shrink-0">{label}</span>
      <div className="w-4 h-4 rounded border border-gray-200 flex-shrink-0" style={{ background: value }} />
      <input
        type="text"
        defaultValue={value.replace('#', '')}
        key={value}
        maxLength={6}
        onBlur={(e) => { const v = e.target.value.replace('#', ''); if (v.length === 6) onChange(`#${v}`); }}
        onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
        className="flex-1 text-xs font-mono border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:border-blue-400"
      />
    </div>
  );
}

function StateColorRow({ label, palValue, shadeValue, opacity, onPalChange, onShadeChange, onOpacityChange, palettes, paletteKeys }: {
  label: string; palValue: PaletteKey | null; shadeValue: Shade; opacity: number;
  onPalChange: (v: PaletteKey | null) => void; onShadeChange: (v: Shade) => void; onOpacityChange: (v: number) => void;
  palettes: Record<PaletteKey, Palette>;
  paletteKeys: PaletteKey[];
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-gray-400 w-10 flex-shrink-0">{label}</span>
      <PaletteSelect value={palValue} onChange={onPalChange} paletteKeys={paletteKeys} palettes={palettes} includeNone className="flex-1" />
      {palValue !== null && <ShadeSelect value={shadeValue} onChange={onShadeChange} palValue={palValue} palettes={palettes} className="w-20 flex-shrink-0" />}
      {palValue !== null && (
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <input
            type="number" min={0} max={100} value={opacity}
            onChange={(e) => onOpacityChange(Math.min(100, Math.max(0, Number(e.target.value))))}
            className="w-10 text-right text-xs border border-gray-200 rounded-md px-1 py-1 focus:outline-none focus:border-blue-400"
          />
          <span className="text-xs text-gray-400">%</span>
        </div>
      )}
    </div>
  );
}

export function ComponentForm({ compKey }: { compKey: string }) {
  const { components, palettes, updateComponent, semanticList } = useDS();
  const s = (components as Record<string, Record<string, unknown>>)[compKey] ?? {};
  const upd = (patch: Record<string, unknown>) => updateComponent(compKey, patch);
  const dragIdx = useRef<number | null>(null);
  type SC = { bgColor: PaletteKey|null; bgShade: Shade; bgOpacity: number; borderColor: PaletteKey|null; borderShade: Shade; borderOpacity: number; textColor: PaletteKey|null; textShade: Shade; textOpacity: number };
  const [stateClipboard, setStateClipboard] = useState<SC | null>(null);
  const [undoHistory, setUndoHistory] = useState<Record<string, SC[]>>({});

  // 컬러 시스템에 등록된 키만 노출: 시맨틱 먼저, 그 다음 베이스 팔레트
  const semanticKeys = semanticList
    .map((i) => i.id)
    .filter((id) => id in palettes) as PaletteKey[];
  const baseKeys = Object.keys(palettes).filter((k) => !SEMANTIC_IDS.has(k)) as PaletteKey[];
  const availablePaletteKeys: PaletteKey[] = [...semanticKeys, ...baseKeys];

  const num = (key: string, fallback = 0) => Number(s[key] ?? fallback);
  const pal = (key: string) => s[key] as PaletteKey | null;
  const shd = (key: string) => (s[key] as Shade) ?? 500;

  return (
    <div className="p-5">
      <h2 className="text-sm font-bold text-gray-900 mb-5">{COMP_LABELS[compKey] ?? compKey}</h2>

      {/* ─── BUTTON ─── */}
      {compKey === 'button' && (() => {
        type BSz = { name: string; h: number; px: number; py: number; fs: number };
        const bs = s as { borderRadius: number; sizes: BSz[]; variants: Record<string, { bg: PaletteKey|null; bgShade: Shade; border: PaletteKey|null; borderShade: Shade }> };
        const sizes: BSz[] = bs.sizes ?? [];
        const updSize = (i: number, patch: Partial<BSz>) => {
          const next = sizes.map((sz, j) => j === i ? { ...sz, ...patch } : sz);
          upd({ sizes: next });
        };
        return (
          <>
            <Section title="공통">
              <NumRow label="Corner Radius" value={bs.borderRadius} onChange={(v) => upd({ borderRadius: v })} max={100} />
            </Section>
            {sizes.map((sz, i) => (
              <Section
                key={i}
                title="Size —"
                onDelete={sizes.length > 1 ? () => upd({ sizes: sizes.filter((_, j) => j !== i) }) : undefined}
                onRename={(name) => updSize(i, { name })}
                renameValue={sz.name}
                dragHandleProps={{
                  draggable: true,
                  onDragStart: () => { dragIdx.current = i; },
                  onDragOver: (e) => { e.preventDefault(); },
                  onDrop: () => {
                    const from = dragIdx.current;
                    if (from === null || from === i) return;
                    const next = [...sizes];
                    const [moved] = next.splice(from, 1);
                    next.splice(i, 0, moved);
                    upd({ sizes: next });
                    dragIdx.current = null;
                  },
                }}
              >
                <NumRow label="Height"    value={sz.h}  onChange={(v) => updSize(i, { h: v  })} max={80} />
                <NumRow label="Padding X" value={sz.px} onChange={(v) => updSize(i, { px: v })} max={60} />
                <NumRow label="Padding Y" value={sz.py} onChange={(v) => updSize(i, { py: v })} max={40} />
                <NumRow label="Font Size" value={sz.fs} onChange={(v) => updSize(i, { fs: v })} max={24} />
              </Section>
            ))}
            <button
              onClick={() => upd({ sizes: [...sizes, { name: `${sizes.length + 1}`, h: 40, px: 16, py: 0, fs: 14 }] })}
              className="w-full py-1.5 text-[11px] font-semibold text-gray-400 border border-dashed border-gray-200 rounded-lg hover:border-blue-300 hover:text-blue-500 transition-colors mb-6"
            >
              + Size 추가
            </button>
            {(() => {
              const variantEntries = Object.entries(bs.variants);
              return variantEntries.map(([vname, v], idx) => {
                const canDelete = variantEntries.length > 1;
                const handleDelete = canDelete ? () => {
                  const next = { ...bs.variants };
                  delete next[vname];
                  upd({ variants: next });
                } : undefined;
                const handleRename = (newName: string) => {
                  if (newName === vname || bs.variants[newName]) return;
                  const entries = Object.entries(bs.variants);
                  const next = Object.fromEntries(entries.map(([k, val]) => [k === vname ? newName : k, val]));
                  upd({ variants: next });
                };
                return (
                  <Section
                    key={vname}
                    title="Variant —"
                    onDelete={handleDelete}
                    onRename={handleRename}
                    renameValue={vname}
                    dragHandleProps={{
                      draggable: true,
                      onDragStart: () => { dragIdx.current = idx; },
                      onDragOver: (e) => { e.preventDefault(); },
                      onDrop: () => {
                        const from = dragIdx.current;
                        if (from === null || from === idx) return;
                        const entries = Object.entries(bs.variants);
                        const [moved] = entries.splice(from, 1);
                        entries.splice(idx, 0, moved);
                        upd({ variants: Object.fromEntries(entries) });
                        dragIdx.current = null;
                      },
                    }}
                  >
                    {(() => {
                      const gcols = { gridTemplateColumns: '42px minmax(0,1fr) 80px 52px', gap: '0 4px' };
                      const IB = ({ title, onClick, disabled, ac, children }: { title: string; onClick: () => void; disabled: boolean; ac: string; children: React.ReactNode }) => (
                        <button title={title} onClick={onClick} disabled={disabled} className={`w-5 h-5 flex items-center justify-center rounded transition-colors flex-shrink-0 ${disabled ? 'text-gray-300 cursor-not-allowed' : ac}`}>{children}</button>
                      );
                      return (
                        <>
                          {([
                            { label: 'Default',  stateKey: 'default'  },
                            { label: 'Hover',    stateKey: 'hover'    },
                            { label: 'Active',   stateKey: 'active'   },
                            { label: 'Disabled', stateKey: 'disabled' },
                          ] as const).map(({ label, stateKey }) => {
                            const st: SC = ((v as Record<string, unknown>)[stateKey] as SC) ?? { bgColor: null, bgShade: 500 as Shade, bgOpacity: 100, borderColor: null, borderShade: 500 as Shade, borderOpacity: 100, textColor: 'white' as PaletteKey, textShade: 500 as Shade, textOpacity: 100 };
                            const histKey = `${vname}:${stateKey}`;
                            const updSt = (patch: Partial<SC>) => {
                              setUndoHistory(prev => ({ ...prev, [histKey]: [...(prev[histKey] ?? []), st] }));
                              upd({ variants: { ...bs.variants, [vname]: { ...v, [stateKey]: { ...st, ...patch } } } });
                            };
                            const canUndo = (undoHistory[histKey]?.length ?? 0) > 0;
                            const handleUndo = () => {
                              const history = undoHistory[histKey] ?? [];
                              if (!history.length) return;
                              const prev = history[history.length - 1];
                              setUndoHistory(h => ({ ...h, [histKey]: h[histKey].slice(0, -1) }));
                              upd({ variants: { ...bs.variants, [vname]: { ...v, [stateKey]: prev } } });
                            };
                            const rows = [
                              { rowLabel: 'BG',     pal: st.bgColor,     shade: st.bgShade,     op: st.bgOpacity     ?? 100, setPal: (p: PaletteKey|null) => updSt({ bgColor: p }),     setShade: (sh: Shade) => updSt({ bgShade: sh }),     setOp: (o: number) => updSt({ bgOpacity: o })     },
                              { rowLabel: 'Border', pal: st.borderColor, shade: st.borderShade, op: st.borderOpacity ?? 100, setPal: (p: PaletteKey|null) => updSt({ borderColor: p }), setShade: (sh: Shade) => updSt({ borderShade: sh }), setOp: (o: number) => updSt({ borderOpacity: o }) },
                              { rowLabel: 'Text',   pal: st.textColor,   shade: st.textShade,   op: st.textOpacity   ?? 100, setPal: (p: PaletteKey|null) => updSt({ textColor: p }),   setShade: (sh: Shade) => updSt({ textShade: sh }),   setOp: (o: number) => updSt({ textOpacity: o })   },
                            ];
                            return (
                              <div key={stateKey} className="mb-3">
                                <div className="flex items-center gap-1 mb-1">
                                  <span className="text-[13px] font-bold text-gray-600">{label}</span>
                                  <IB title="되돌리기" onClick={handleUndo} disabled={!canUndo} ac="text-gray-500 hover:text-orange-500 hover:bg-orange-50">
                                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 6a4 4 0 104 -4H4"/><path d="M4 1L2 3l2 2"/></svg>
                                  </IB>
                                  <div className="flex-1" />
                                  <IB title="복사" onClick={() => setStateClipboard({ ...st })} disabled={false} ac="text-gray-500 hover:text-blue-500 hover:bg-blue-50">
                                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="4" width="7" height="7" rx="1"/><path d="M3 8H2a1 1 0 01-1-1V2a1 1 0 011-1h5a1 1 0 011 1v1"/></svg>
                                  </IB>
                                  <IB title="붙여넣기" onClick={() => stateClipboard && updSt({ ...stateClipboard })} disabled={!stateClipboard} ac="text-gray-500 hover:text-green-500 hover:bg-green-50">
                                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="8" height="8" rx="1"/><path d="M3 3V2a1 1 0 011-1h5a1 1 0 011 1v6a1 1 0 01-1 1H8"/></svg>
                                  </IB>
                                </div>
                                {rows.map((row) => (
                                  <div key={row.rowLabel} className="grid items-center mb-0.5" style={gcols}>
                                    <span className="text-[11px] text-gray-400">{row.rowLabel}</span>
                                    <PaletteSelect value={row.pal} onChange={row.setPal} paletteKeys={availablePaletteKeys} palettes={palettes} includeNone />
                                    <div className={row.pal === null ? 'invisible' : ''}>
                                      <ShadeSelect value={row.shade} onChange={row.setShade} palValue={row.pal} palettes={palettes} className="w-full" />
                                    </div>
                                    <div className={`flex items-center gap-0.5 ${row.pal === null ? 'invisible' : ''}`}>
                                      <input type="number" min={0} max={100} value={row.op} onChange={(e) => row.setOp(Math.min(100, Math.max(0, Number(e.target.value))))} className="w-full text-right text-[10px] border border-gray-200 rounded px-0.5 py-1 focus:outline-none focus:border-blue-400" />
                                      <span className="text-xs text-gray-400 flex-shrink-0">%</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            );
                          })}
                        </>
                      );
                    })()}
                  </Section>
                );
              });
            })()}
            <button
              onClick={() => {
                const idx = Object.keys(bs.variants).length + 1;
                const name = `Variant ${idx}`;
                const defSt = { bgColor: null, bgShade: 500 as Shade, borderColor: 'primary' as PaletteKey, borderShade: 500 as Shade, textColor: 'primary' as PaletteKey, textShade: 500 as Shade };
                upd({ variants: { ...bs.variants, [name]: { default: defSt, hover: defSt, active: defSt, disabled: defSt } } });
              }}
              className="w-full py-1.5 text-[11px] font-semibold text-gray-400 border border-dashed border-gray-200 rounded-lg hover:border-blue-300 hover:text-blue-500 transition-colors"
            >
              + Variant 추가
            </button>
          </>
        );
      })()}

      {/* ─── INPUT ─── */}
      {compKey === 'input' && (() => {
        type IS = { name: string; height: number; paddingX: number; fontSize: number; borderRadius: number; defaultBgColor: PaletteKey|null; defaultBgShade: Shade; borderColor: PaletteKey|null; borderShade: Shade; defaultTextColor: PaletteKey|null; defaultTextShade: Shade; focusBgColor: PaletteKey|null; focusBgShade: Shade; focusColor: PaletteKey|null; focusShade: Shade; focusTextColor: PaletteKey|null; focusTextShade: Shade; errorBgColor: PaletteKey|null; errorBgShade: Shade; errorColor: PaletteKey|null; errorShade: Shade; errorTextColor: PaletteKey|null; errorTextShade: Shade; disabledBgColor: PaletteKey|null; disabledBgShade: Shade; disabledColor: PaletteKey|null; disabledShade: Shade; disabledTextColor: PaletteKey|null; disabledTextShade: Shade; readonlyBgColor: PaletteKey|null; readonlyBgShade: Shade; readonlyColor: PaletteKey|null; readonlyShade: Shade; readonlyTextColor: PaletteKey|null; readonlyTextShade: Shade };
        const sets = (s.sets ?? []) as IS[];
        const updSet = (idx: number, patch: object) => {
          const next = sets.map((item, i) => i === idx ? { ...item, ...patch } : item);
          upd({ sets: next });
        };
        return (
          <>
            {sets.map((set, idx) => (
              <Section
                key={idx}
                title="Set —"
                onDelete={sets.length > 1 ? () => upd({ sets: sets.filter((_, i) => i !== idx) }) : undefined}
                onRename={(name) => updSet(idx, { name })}
                renameValue={set.name}
                dragHandleProps={{
                  draggable: true,
                  onDragStart: () => { dragIdx.current = idx; },
                  onDragOver: (e) => { e.preventDefault(); },
                  onDrop: () => {
                    const from = dragIdx.current;
                    if (from === null || from === idx) return;
                    const next = [...sets];
                    const [moved] = next.splice(from, 1);
                    next.splice(idx, 0, moved);
                    upd({ sets: next });
                    dragIdx.current = null;
                  },
                }}
              >
                <NumRow label="Height"        value={set.height}       onChange={(v) => updSet(idx, { height: v })}       max={200} />
                <NumRow label="Padding X"     value={set.paddingX}     onChange={(v) => updSet(idx, { paddingX: v })}     max={60} />
                <NumRow label="Font Size"     value={set.fontSize}     onChange={(v) => updSet(idx, { fontSize: v })}     max={24} />
                <NumRow label="Corner Radius" value={set.borderRadius} onChange={(v) => updSet(idx, { borderRadius: v })} max={100} />
                {(() => {
                  const IB2 = ({ title, onClick, disabled, ac, children }: { title: string; onClick: () => void; disabled: boolean; ac: string; children: React.ReactNode }) => (
                    <button title={title} onClick={onClick} disabled={disabled} className={`w-5 h-5 flex items-center justify-center rounded transition-colors flex-shrink-0 ${disabled ? 'text-gray-300 cursor-not-allowed' : ac}`}>{children}</button>
                  );
                  const stateList = [
                    { label: 'Default',  bgPal: 'defaultBgColor'  as const, bgSh: 'defaultBgShade'  as const, borderPal: 'borderColor'   as const, borderSh: 'borderShade'   as const, textPal: 'defaultTextColor'  as const, textSh: 'defaultTextShade'  as const },
                    { label: 'Focused',  bgPal: 'focusBgColor'    as const, bgSh: 'focusBgShade'    as const, borderPal: 'focusColor'    as const, borderSh: 'focusShade'    as const, textPal: 'focusTextColor'    as const, textSh: 'focusTextShade'    as const },
                    { label: 'Error',    bgPal: 'errorBgColor'    as const, bgSh: 'errorBgShade'    as const, borderPal: 'errorColor'    as const, borderSh: 'errorShade'    as const, textPal: 'errorTextColor'    as const, textSh: 'errorTextShade'    as const },
                    { label: 'Disabled', bgPal: 'disabledBgColor' as const, bgSh: 'disabledBgShade' as const, borderPal: 'disabledColor' as const, borderSh: 'disabledShade' as const, textPal: 'disabledTextColor' as const, textSh: 'disabledTextShade' as const },
                    { label: 'Readonly', bgPal: 'readonlyBgColor' as const, bgSh: 'readonlyBgShade' as const, borderPal: 'readonlyColor' as const, borderSh: 'readonlyShade' as const, textPal: 'readonlyTextColor' as const, textSh: 'readonlyTextShade' as const },
                  ];
                  const opMap: Record<string, string> = {
                    defaultBgColor: 'defaultBgOpacity', borderColor: 'borderOpacity', defaultTextColor: 'defaultTextOpacity',
                    focusBgColor: 'focusBgOpacity', focusColor: 'focusOpacity', focusTextColor: 'focusTextOpacity',
                    errorBgColor: 'errorBgOpacity', errorColor: 'errorOpacity', errorTextColor: 'errorTextOpacity',
                    disabledBgColor: 'disabledBgOpacity', disabledColor: 'disabledOpacity', disabledTextColor: 'disabledTextOpacity',
                    readonlyBgColor: 'readonlyBgOpacity', readonlyColor: 'readonlyOpacity', readonlyTextColor: 'readonlyTextOpacity',
                  };
                  return (
                    <>
                      {stateList.map(({ label, bgPal, bgSh, borderPal, borderSh, textPal, textSh }) => {
                        const bgOpKey = opMap[bgPal] as keyof typeof set;
                        const borderOpKey = opMap[borderPal] as keyof typeof set;
                        const textOpKey = opMap[textPal] as keyof typeof set;
                        const ist: SC = { bgColor: set[bgPal], bgShade: set[bgSh], bgOpacity: (set[bgOpKey] as number) ?? 100, borderColor: set[borderPal], borderShade: set[borderSh], borderOpacity: (set[borderOpKey] as number) ?? 100, textColor: set[textPal], textShade: set[textSh], textOpacity: (set[textOpKey] as number) ?? 100 };
                        const histKey = `input:${idx}:${label}`;
                        const updISt = (patch: Partial<SC>) => {
                          setUndoHistory(prev => ({ ...prev, [histKey]: [...(prev[histKey] ?? []), ist] }));
                          updSet(idx, { [bgPal]: patch.bgColor ?? ist.bgColor, [bgSh]: patch.bgShade ?? ist.bgShade, [bgOpKey]: patch.bgOpacity ?? ist.bgOpacity, [borderPal]: patch.borderColor ?? ist.borderColor, [borderSh]: patch.borderShade ?? ist.borderShade, [borderOpKey]: patch.borderOpacity ?? ist.borderOpacity, [textPal]: patch.textColor ?? ist.textColor, [textSh]: patch.textShade ?? ist.textShade, [textOpKey]: patch.textOpacity ?? ist.textOpacity });
                        };
                        const canUndo = (undoHistory[histKey]?.length ?? 0) > 0;
                        const handleUndo = () => {
                          const history = undoHistory[histKey] ?? [];
                          if (!history.length) return;
                          const prev = history[history.length - 1];
                          setUndoHistory(h => ({ ...h, [histKey]: h[histKey].slice(0, -1) }));
                          updSet(idx, { [bgPal]: prev.bgColor, [bgSh]: prev.bgShade, [bgOpKey]: prev.bgOpacity, [borderPal]: prev.borderColor, [borderSh]: prev.borderShade, [borderOpKey]: prev.borderOpacity, [textPal]: prev.textColor, [textSh]: prev.textShade, [textOpKey]: prev.textOpacity });
                        };
                        const irows = [
                          { rowLabel: 'BG',     pal: set[bgPal],     shade: set[bgSh],     op: (set[bgOpKey]     as number) ?? 100, setPal: (p: PaletteKey|null) => updISt({ bgColor: p }),     setShade: (sh: Shade) => updISt({ bgShade: sh }),     setOp: (o: number) => updISt({ bgOpacity: o })     },
                          { rowLabel: 'Border', pal: set[borderPal], shade: set[borderSh], op: (set[borderOpKey] as number) ?? 100, setPal: (p: PaletteKey|null) => updISt({ borderColor: p }), setShade: (sh: Shade) => updISt({ borderShade: sh }), setOp: (o: number) => updISt({ borderOpacity: o }) },
                          { rowLabel: 'Text',   pal: set[textPal],   shade: set[textSh],   op: (set[textOpKey]   as number) ?? 100, setPal: (p: PaletteKey|null) => updISt({ textColor: p }),   setShade: (sh: Shade) => updISt({ textShade: sh }),   setOp: (o: number) => updISt({ textOpacity: o })   },
                        ];
                        const gcols3 = { gridTemplateColumns: '42px minmax(0,1fr) 80px 52px', gap: '0 4px' };
                        return (
                          <div key={label} className="mb-3">
                            <div className="flex items-center gap-1 mb-1">
                              <span className="text-[13px] font-bold text-gray-600">{label}</span>
                              <IB2 title="되돌리기" onClick={handleUndo} disabled={!canUndo} ac="text-gray-500 hover:text-orange-500 hover:bg-orange-50">
                                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 6a4 4 0 104 -4H4"/><path d="M4 1L2 3l2 2"/></svg>
                              </IB2>
                              <div className="flex-1" />
                              <IB2 title="복사" onClick={() => setStateClipboard({ ...ist })} disabled={false} ac="text-gray-500 hover:text-blue-500 hover:bg-blue-50">
                                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="4" width="7" height="7" rx="1"/><path d="M3 8H2a1 1 0 01-1-1V2a1 1 0 011-1h5a1 1 0 011 1v1"/></svg>
                              </IB2>
                              <IB2 title="붙여넣기" onClick={() => stateClipboard && updISt({ ...stateClipboard })} disabled={!stateClipboard} ac="text-gray-500 hover:text-green-500 hover:bg-green-50">
                                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="8" height="8" rx="1"/><path d="M3 3V2a1 1 0 011-1h5a1 1 0 011 1v6a1 1 0 01-1 1H8"/></svg>
                              </IB2>
                            </div>
                            {irows.map((row) => (
                              <div key={row.rowLabel} className="grid items-center mb-0.5" style={gcols3}>
                                <span className="text-[11px] text-gray-400">{row.rowLabel}</span>
                                <PaletteSelect value={row.pal} onChange={row.setPal} paletteKeys={availablePaletteKeys} palettes={palettes} includeNone />
                                <div className={row.pal === null ? 'invisible' : ''}>
                                  <ShadeSelect value={row.shade} onChange={row.setShade} palValue={row.pal} palettes={palettes} className="w-full" />
                                </div>
                                <div className={`flex items-center gap-0.5 ${row.pal === null ? 'invisible' : ''}`}>
                                  <input type="number" min={0} max={100} value={row.op} onChange={(e) => row.setOp(Math.min(100, Math.max(0, Number(e.target.value))))} className="w-full text-right text-[10px] border border-gray-200 rounded px-0.5 py-1 focus:outline-none focus:border-blue-400" />
                                  <span className="text-xs text-gray-400 flex-shrink-0">%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </>
                  );
                })()}
              </Section>
            ))}
            <button
              onClick={() => upd({ sets: [...sets, { name: `Set ${sets.length + 1}`, height: 40, paddingX: 12, fontSize: 14, borderRadius: 4, defaultBgColor: 'white' as PaletteKey, defaultBgShade: 500 as Shade, borderColor: 'gray' as PaletteKey, borderShade: 300 as Shade, defaultTextColor: 'gray' as PaletteKey, defaultTextShade: 900 as Shade, focusBgColor: 'white' as PaletteKey, focusBgShade: 500 as Shade, focusColor: 'primary' as PaletteKey, focusShade: 500 as Shade, focusTextColor: 'gray' as PaletteKey, focusTextShade: 900 as Shade, errorBgColor: 'white' as PaletteKey, errorBgShade: 500 as Shade, errorColor: 'error' as PaletteKey, errorShade: 500 as Shade, errorTextColor: 'gray' as PaletteKey, errorTextShade: 900 as Shade, disabledBgColor: 'gray' as PaletteKey, disabledBgShade: 100 as Shade, disabledColor: 'gray' as PaletteKey, disabledShade: 200 as Shade, disabledTextColor: 'gray' as PaletteKey, disabledTextShade: 400 as Shade, readonlyBgColor: 'gray' as PaletteKey, readonlyBgShade: 100 as Shade, readonlyColor: 'gray' as PaletteKey, readonlyShade: 300 as Shade, readonlyTextColor: 'gray' as PaletteKey, readonlyTextShade: 500 as Shade }] })}
              className="w-full py-1.5 text-[11px] font-semibold text-gray-400 border border-dashed border-gray-200 rounded-lg hover:border-blue-300 hover:text-blue-500 transition-colors mb-6"
            >
              + Set 추가
            </button>
          </>
        );
      })()}

      {/* ─── TEXTAREA ─── */}
      {compKey === 'textarea' && (
        <>
          <Section title="크기">
            <NumRow label="Height"        value={num('height')}       onChange={(v) => upd({ height: v })}       max={200} />
            <NumRow label="Padding X"     value={num('paddingX')}     onChange={(v) => upd({ paddingX: v })}     max={60} />
            <NumRow label="Padding Y"     value={num('paddingY')}     onChange={(v) => upd({ paddingY: v })}     max={60} />
            <NumRow label="Font Size"     value={num('fontSize')}     onChange={(v) => upd({ fontSize: v })}     max={24} />
            <NumRow label="Corner Radius" value={num('borderRadius')} onChange={(v) => upd({ borderRadius: v })} max={100} />
          </Section>
          <Section title="컬러">
            <ColorRow label="보더 (기본)" palValue={pal('borderColor')} shadeValue={shd('borderShade')}
              onPalChange={(p) => upd({ borderColor: p })} onShadeChange={(sh) => upd({ borderShade: sh })} palettes={palettes} paletteKeys={availablePaletteKeys} />
          </Section>
          <Section title="옵션">
            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-gray-600">필수 (*)</span>
              <input type="checkbox" checked={!!s.required} onChange={(e) => upd({ required: e.target.checked })} className="w-4 h-4 accent-blue-500" />
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-gray-600">글자 수 표시</span>
              <input type="checkbox" checked={!!s.showCharCount} onChange={(e) => upd({ showCharCount: e.target.checked })} className="w-4 h-4 accent-blue-500" />
            </div>
            {!!s.showCharCount && (
              <NumRow label="최대 글자" value={Number(s.maxChars ?? 100)} onChange={(v) => upd({ maxChars: v })} max={9999} />
            )}
          </Section>
        </>
      )}

      {/* ─── SELECT ─── */}
      {compKey === 'select' && (() => {
        const opMap: Record<string, string> = {
          defaultBgColor: 'defaultBgOpacity', borderColor: 'borderOpacity', defaultTextColor: 'defaultTextOpacity',
          focusBgColor: 'focusBgOpacity', focusColor: 'focusOpacity', focusTextColor: 'focusTextOpacity',
          errorBgColor: 'errorBgOpacity', errorColor: 'errorOpacity', errorTextColor: 'errorTextOpacity',
          disabledBgColor: 'disabledBgOpacity', disabledColor: 'disabledOpacity', disabledTextColor: 'disabledTextOpacity',
        };
        type SK = keyof typeof s;
        const stateList = [
          { label: 'Default',  bgPal: 'defaultBgColor'  as const, bgSh: 'defaultBgShade'  as const, borderPal: 'borderColor'  as const, borderSh: 'borderShade'  as const, textPal: 'defaultTextColor'  as const, textSh: 'defaultTextShade'  as const },
          { label: 'Focused',  bgPal: 'focusBgColor'    as const, bgSh: 'focusBgShade'    as const, borderPal: 'focusColor'    as const, borderSh: 'focusShade'    as const, textPal: 'focusTextColor'    as const, textSh: 'focusTextShade'    as const },
          { label: 'Error',    bgPal: 'errorBgColor'    as const, bgSh: 'errorBgShade'    as const, borderPal: 'errorColor'    as const, borderSh: 'errorShade'    as const, textPal: 'errorTextColor'    as const, textSh: 'errorTextShade'    as const },
          { label: 'Disabled', bgPal: 'disabledBgColor' as const, bgSh: 'disabledBgShade' as const, borderPal: 'disabledColor' as const, borderSh: 'disabledShade' as const, textPal: 'disabledTextColor' as const, textSh: 'disabledTextShade' as const },
        ];
        const IBS = ({ title, onClick, disabled, ac, children }: { title: string; onClick: () => void; disabled: boolean; ac: string; children: React.ReactNode }) => (
          <button title={title} onClick={onClick} disabled={disabled} className={`w-5 h-5 flex items-center justify-center rounded transition-colors flex-shrink-0 ${disabled ? 'text-gray-300 cursor-not-allowed' : ac}`}>{children}</button>
        );
        return (
          <>
            <Section title="크기">
              <NumRow label="Height"        value={num('height')}       onChange={(v) => upd({ height: v })}       max={200} />
              <NumRow label="Padding X"     value={num('paddingX')}     onChange={(v) => upd({ paddingX: v })}     max={60} />
              <NumRow label="Font Size"     value={num('fontSize')}     onChange={(v) => upd({ fontSize: v })}     max={24} />
              <NumRow label="Corner Radius" value={num('borderRadius')} onChange={(v) => upd({ borderRadius: v })} max={100} />
            </Section>
            {stateList.map(({ label, bgPal, bgSh, borderPal, borderSh, textPal, textSh }) => {
              const bgOpKey = opMap[bgPal] as SK;
              const borderOpKey = opMap[borderPal] as SK;
              const textOpKey = opMap[textPal] as SK;
              type SC2 = { bgColor: PaletteKey|null; bgShade: Shade; bgOpacity: number; borderColor: PaletteKey|null; borderShade: Shade; borderOpacity: number; textColor: PaletteKey|null; textShade: Shade; textOpacity: number };
              const ist: SC2 = { bgColor: s[bgPal] as PaletteKey|null, bgShade: s[bgSh] as Shade, bgOpacity: (s[bgOpKey] as number) ?? 100, borderColor: s[borderPal] as PaletteKey|null, borderShade: s[borderSh] as Shade, borderOpacity: (s[borderOpKey] as number) ?? 100, textColor: s[textPal] as PaletteKey|null, textShade: s[textSh] as Shade, textOpacity: (s[textOpKey] as number) ?? 100 };
              const histKey = `select:${label}`;
              const updISt = (patch: Partial<SC2>) => {
                setUndoHistory(prev => ({ ...prev, [histKey]: [...(prev[histKey] ?? []), ist] }));
                upd({ [bgPal]: patch.bgColor ?? ist.bgColor, [bgSh]: patch.bgShade ?? ist.bgShade, [bgOpKey]: patch.bgOpacity ?? ist.bgOpacity, [borderPal]: patch.borderColor ?? ist.borderColor, [borderSh]: patch.borderShade ?? ist.borderShade, [borderOpKey]: patch.borderOpacity ?? ist.borderOpacity, [textPal]: patch.textColor ?? ist.textColor, [textSh]: patch.textShade ?? ist.textShade, [textOpKey]: patch.textOpacity ?? ist.textOpacity });
              };
              const canUndo = (undoHistory[histKey]?.length ?? 0) > 0;
              const handleUndo = () => {
                const history = undoHistory[histKey] ?? [];
                if (!history.length) return;
                const prev = history[history.length - 1];
                setUndoHistory(h => ({ ...h, [histKey]: h[histKey].slice(0, -1) }));
                upd({ [bgPal]: prev.bgColor, [bgSh]: prev.bgShade, [bgOpKey]: prev.bgOpacity, [borderPal]: prev.borderColor, [borderSh]: prev.borderShade, [borderOpKey]: prev.borderOpacity, [textPal]: prev.textColor, [textSh]: prev.textShade, [textOpKey]: prev.textOpacity });
              };
              const gcols4 = { gridTemplateColumns: '42px minmax(0,1fr) 80px 52px', gap: '0 4px' };
              const irows = [
                { rowLabel: 'BG',     pal: s[bgPal] as PaletteKey|null,     shade: s[bgSh] as Shade,     op: (s[bgOpKey]     as number) ?? 100, setPal: (p: PaletteKey|null) => updISt({ bgColor: p }),     setShade: (sh: Shade) => updISt({ bgShade: sh }),     setOp: (o: number) => updISt({ bgOpacity: o })     },
                { rowLabel: 'Border', pal: s[borderPal] as PaletteKey|null, shade: s[borderSh] as Shade, op: (s[borderOpKey] as number) ?? 100, setPal: (p: PaletteKey|null) => updISt({ borderColor: p }), setShade: (sh: Shade) => updISt({ borderShade: sh }), setOp: (o: number) => updISt({ borderOpacity: o }) },
                { rowLabel: 'Text',   pal: s[textPal] as PaletteKey|null,   shade: s[textSh] as Shade,   op: (s[textOpKey]   as number) ?? 100, setPal: (p: PaletteKey|null) => updISt({ textColor: p }),   setShade: (sh: Shade) => updISt({ textShade: sh }),   setOp: (o: number) => updISt({ textOpacity: o })   },
              ];
              return (
                <div key={label} className="mb-3">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-[13px] font-bold text-gray-600">{label}</span>
                    <IBS title="되돌리기" onClick={handleUndo} disabled={!canUndo} ac="text-gray-500 hover:text-orange-500 hover:bg-orange-50">
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 6a4 4 0 104 -4H4"/><path d="M4 1L2 3l2 2"/></svg>
                    </IBS>
                    <div className="flex-1" />
                    <IBS title="복사" onClick={() => setStateClipboard({ ...ist })} disabled={false} ac="text-gray-500 hover:text-blue-500 hover:bg-blue-50">
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="4" width="7" height="7" rx="1"/><path d="M3 8H2a1 1 0 01-1-1V2a1 1 0 011-1h5a1 1 0 011 1v1"/></svg>
                    </IBS>
                    <IBS title="붙여넣기" onClick={() => stateClipboard && updISt({ ...stateClipboard })} disabled={!stateClipboard} ac="text-gray-500 hover:text-green-500 hover:bg-green-50">
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="8" height="8" rx="1"/><path d="M3 3V2a1 1 0 011-1h5a1 1 0 011 1v6a1 1 0 01-1 1H8"/></svg>
                    </IBS>
                  </div>
                  {irows.map((row) => (
                    <div key={row.rowLabel} className="grid items-center mb-0.5" style={gcols4}>
                      <span className="text-[11px] text-gray-400">{row.rowLabel}</span>
                      <PaletteSelect value={row.pal} onChange={row.setPal} paletteKeys={availablePaletteKeys} palettes={palettes} includeNone />
                      <div className={row.pal === null ? 'invisible' : ''}>
                        <ShadeSelect value={row.shade} onChange={row.setShade} palValue={row.pal} palettes={palettes} className="w-full" />
                      </div>
                      <div className={`flex items-center gap-0.5 ${row.pal === null ? 'invisible' : ''}`}>
                        <input type="number" min={0} max={100} value={row.op} onChange={(e) => row.setOp(Math.min(100, Math.max(0, Number(e.target.value))))} className="w-full text-right text-[10px] border border-gray-200 rounded px-0.5 py-1 focus:outline-none focus:border-blue-400" />
                        <span className="text-xs text-gray-400 flex-shrink-0">%</span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </>
        );
      })()}

      {/* ─── BADGE ─── */}
      {compKey === 'badge' && (() => {
        type BV = { name: string; bgColor: PaletteKey|null; bgShade: Shade; bgOpacity: number; textColor: PaletteKey|null; textShade: Shade; textOpacity: number };
        const variants: BV[] = (s.variants as BV[]) ?? [];
        const updVariants = (next: BV[]) => upd({ variants: next });
        const gcols = { gridTemplateColumns: '42px minmax(0,1fr) 80px 52px', gap: '0 4px' };
        return (
          <>
            <Section title="크기">
              <NumRow label="Padding X"     value={num('paddingX')}     onChange={(v) => upd({ paddingX: v })}     max={40} />
              <NumRow label="Padding Y"     value={num('paddingY')}     onChange={(v) => upd({ paddingY: v })}     max={20} />
              <NumRow label="Font Size"     value={num('fontSize')}     onChange={(v) => upd({ fontSize: v })}     max={20} />
              <NumRow label="Corner Radius" value={num('borderRadius')} onChange={(v) => upd({ borderRadius: v })} max={100} />
            </Section>
            {variants.map((v, idx) => (
              <div key={idx} className="mb-3">
                <div className="flex items-center gap-1 mb-1">
                  <input
                    value={v.name}
                    onChange={(e) => updVariants(variants.map((vv, i) => i === idx ? { ...vv, name: e.target.value } : vv))}
                    className="text-[13px] font-bold text-gray-600 bg-transparent border-none outline-none flex-1 min-w-0"
                  />
                  {variants.length > 1 && (
                    <button onClick={() => updVariants(variants.filter((_, i) => i !== idx))} className="w-5 h-5 flex items-center justify-center rounded text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors flex-shrink-0">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M1 1l8 8M9 1L1 9"/></svg>
                    </button>
                  )}
                </div>
                {[
                  { rowLabel: 'BG',   pal: v.bgColor,   shade: v.bgShade,   op: v.bgOpacity   ?? 100, setPal: (p: PaletteKey|null) => updVariants(variants.map((vv,i)=>i===idx?{...vv,bgColor:p}:vv)),   setShade: (sh: Shade)=>updVariants(variants.map((vv,i)=>i===idx?{...vv,bgShade:sh}:vv)),   setOp: (o:number)=>updVariants(variants.map((vv,i)=>i===idx?{...vv,bgOpacity:o}:vv))   },
                  { rowLabel: 'Text', pal: v.textColor, shade: v.textShade, op: v.textOpacity ?? 100, setPal: (p: PaletteKey|null) => updVariants(variants.map((vv,i)=>i===idx?{...vv,textColor:p}:vv)), setShade: (sh: Shade)=>updVariants(variants.map((vv,i)=>i===idx?{...vv,textShade:sh}:vv)), setOp: (o:number)=>updVariants(variants.map((vv,i)=>i===idx?{...vv,textOpacity:o}:vv)) },
                ].map((row) => (
                  <div key={row.rowLabel} className="grid items-center mb-0.5" style={gcols}>
                    <span className="text-[11px] text-gray-400">{row.rowLabel}</span>
                    <PaletteSelect value={row.pal} onChange={row.setPal} paletteKeys={availablePaletteKeys} palettes={palettes} includeNone />
                    <div className={row.pal === null ? 'invisible' : ''}>
                      <ShadeSelect value={row.shade} onChange={row.setShade} palValue={row.pal} palettes={palettes} className="w-full" />
                    </div>
                    <div className={`flex items-center gap-0.5 ${row.pal === null ? 'invisible' : ''}`}>
                      <input type="number" min={0} max={100} value={row.op} onChange={(e) => row.setOp(Math.min(100, Math.max(0, Number(e.target.value))))} className="w-full text-right text-[10px] border border-gray-200 rounded px-0.5 py-1 focus:outline-none focus:border-blue-400" />
                      <span className="text-xs text-gray-400 flex-shrink-0">%</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <button
              onClick={() => updVariants([...variants, { name: `Variant ${variants.length + 1}`, bgColor: 'primary' as PaletteKey, bgShade: 100 as Shade, bgOpacity: 100, textColor: 'primary' as PaletteKey, textShade: 700 as Shade, textOpacity: 100 }])}
              className="w-full py-1.5 text-[11px] font-semibold text-gray-400 border border-dashed border-gray-200 rounded-lg hover:border-blue-300 hover:text-blue-500 transition-colors"
            >
              + Variant 추가
            </button>
          </>
        );
      })()}

      {/* ─── CHIP ─── */}
      {compKey === 'chip' && (() => {
        type CV = { name: string; bgColor: PaletteKey|null; bgShade: Shade; bgOpacity: number; textColor: PaletteKey|null; textShade: Shade; textOpacity: number; borderColor: PaletteKey|null; borderShade: Shade };
        const variants: CV[] = (s.variants as CV[]) ?? [];
        const updVariants = (next: CV[]) => upd({ variants: next });
        return (
          <>
            <Section title="크기">
              <NumRow label="Padding X"     value={num('paddingX')}     onChange={(v) => upd({ paddingX: v })}     max={40} />
              <NumRow label="Padding Y"     value={num('paddingY')}     onChange={(v) => upd({ paddingY: v })}     max={20} />
              <NumRow label="Font Size"     value={num('fontSize')}     onChange={(v) => upd({ fontSize: v })}     max={20} />
              <NumRow label="Corner Radius" value={num('borderRadius')} onChange={(v) => upd({ borderRadius: v })} max={100} />
            </Section>
            {variants.map((v, idx) => (
              <div key={idx} className="mb-3">
                <div className="flex items-center gap-1 mb-1">
                  <input value={v.name} onChange={(e) => updVariants(variants.map((x, i) => i === idx ? { ...x, name: e.target.value } : x))}
                    className="text-[13px] font-bold text-gray-600 bg-transparent border-none outline-none flex-1 min-w-0" />
                  {variants.length > 1 && (
                    <button onClick={() => updVariants(variants.filter((_, i) => i !== idx))}
                      className="text-gray-300 hover:text-red-400 text-xs px-1">×</button>
                  )}
                </div>
                {[
                  { rowLabel: 'BG', palKey: 'bgColor', shdKey: 'bgShade', opKey: 'bgOpacity' },
                  { rowLabel: 'Text', palKey: 'textColor', shdKey: 'textShade', opKey: 'textOpacity' },
                  { rowLabel: 'Border', palKey: 'borderColor', shdKey: 'borderShade', opKey: null },
                ].map(({ rowLabel, palKey, shdKey, opKey }) => {
                  const palVal = (v[palKey as keyof CV] ?? null) as PaletteKey | null;
                  const shdVal = (v[shdKey as keyof CV] ?? 500) as Shade;
                  const opVal = opKey ? (v[opKey as keyof CV] ?? 100) as number : undefined;
                  return (
                    <div key={rowLabel} className="grid items-center mb-0.5" style={{ gridTemplateColumns: '42px minmax(0,1fr) 80px 52px', gap: '0 4px' }}>
                      <span className="text-[11px] text-gray-400">{rowLabel}</span>
                      <PaletteSelect value={palVal} onChange={(p) => updVariants(variants.map((x, i) => i === idx ? { ...x, [palKey]: p } : x))}
                        palettes={palettes} paletteKeys={availablePaletteKeys} includeNone className="flex-1 min-w-0" />
                      {palVal !== null && <ShadeSelect value={shdVal} onChange={(sh) => updVariants(variants.map((x, i) => i === idx ? { ...x, [shdKey]: sh } : x))}
                        palValue={palVal} palettes={palettes} className="w-[68px]" />}
                      {palVal !== null && opKey && (
                        <div className="flex items-center gap-0.5">
                          <input type="number" min={0} max={100} value={opVal ?? 100}
                            onChange={(e) => updVariants(variants.map((x, i) => i === idx ? { ...x, [opKey]: Number(e.target.value) } : x))}
                            className="w-10 text-right text-xs border border-gray-200 rounded px-1 py-0.5 focus:outline-none focus:border-blue-400" />
                          <span className="text-xs text-gray-400">%</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
            <button onClick={() => updVariants([...variants, { name: `Variant ${variants.length + 1}`, bgColor: 'primary', bgShade: 100, bgOpacity: 100, textColor: 'primary', textShade: 700, textOpacity: 100, borderColor: 'primary', borderShade: 200 }])}
              className="w-full text-xs text-gray-400 hover:text-blue-500 border border-dashed border-gray-200 hover:border-blue-300 rounded-md py-1.5 transition-colors">
              + Variant 추가
            </button>
          </>
        );
      })()}

      {/* ─── CARD ─── */}
      {compKey === 'card' && (() => {
        const btnVariants = Object.keys((components as Record<string, Record<string, unknown>>)['button']?.['variants'] as object ?? {});
        const curBtnVariant = (s.btnVariant as string) ?? btnVariants[0] ?? 'Primary';
        return (
          <>
            <Section title="크기">
              <NumRow label="Padding X"      value={num('paddingX')}      onChange={(v) => upd({ paddingX: v })}      max={80} />
              <NumRow label="Padding Y"      value={num('paddingY')}      onChange={(v) => upd({ paddingY: v })}      max={80} />
              <NumRow label="Gap"            value={num('gap')}           onChange={(v) => upd({ gap: v })}           max={40} />
              <NumRow label="Corner Radius"  value={num('borderRadius')}  onChange={(v) => upd({ borderRadius: v })}  max={40} />
              <NumRow label="Title Font Size" value={num('titleFontSize', 16)} onChange={(v) => upd({ titleFontSize: v })} max={32} />
              <NumRow label="Body Font Size"  value={num('bodyFontSize', 13)}  onChange={(v) => upd({ bodyFontSize: v })}  max={24} />
            </Section>
            <Section title="그림자">
              <NumRow label="Shadow Opacity" value={num('shadowOpacity')} onChange={(v) => upd({ shadowOpacity: v })} max={40} unit="%" />
            </Section>
            <Section title="버튼">
              <div className="flex items-center justify-between py-1">
                <span className="text-xs text-gray-600">Variant</span>
                <select
                  value={curBtnVariant}
                  onChange={(e) => upd({ btnVariant: e.target.value })}
                  className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:border-blue-400"
                >
                  {btnVariants.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </Section>
          </>
        );
      })()}

      {/* ─── ALERT ─── */}
      {compKey === 'alert' && (
        <Section title="크기">
          <NumRow label="Padding X"     value={num('paddingX')}     onChange={(v) => upd({ paddingX: v })}     max={60} />
          <NumRow label="Padding Y"     value={num('paddingY')}     onChange={(v) => upd({ paddingY: v })}     max={40} />
          <NumRow label="Font Size"     value={num('fontSize')}     onChange={(v) => upd({ fontSize: v })}     max={24} />
          <NumRow label="Corner Radius" value={num('borderRadius')} onChange={(v) => upd({ borderRadius: v })} max={40} />
        </Section>
      )}

      {/* ─── TOAST ─── */}
      {compKey === 'toast' && (() => {
        type TV = { name: string; icon: string; bgColor: PaletteKey|null; bgShade: Shade; bgOpacity: number; textColor: PaletteKey|null; textShade: Shade; textOpacity: number };
        const variants: TV[] = (s.variants as TV[]) ?? [];
        const updVariants = (next: TV[]) => upd({ variants: next });
        return (
          <>
            <Section title="크기">
              <NumRow label="Padding X"     value={num('paddingX')}     onChange={(v) => upd({ paddingX: v })}     max={60} />
              <NumRow label="Padding Y"     value={num('paddingY')}     onChange={(v) => upd({ paddingY: v })}     max={40} />
              <NumRow label="Font Size"     value={num('fontSize')}     onChange={(v) => upd({ fontSize: v })}     max={24} />
              <NumRow label="Corner Radius" value={num('borderRadius')} onChange={(v) => upd({ borderRadius: v })} max={40} />
            </Section>
            {variants.map((v, idx) => (
              <div key={idx} className="mb-3">
                <div className="flex items-center gap-1 mb-1">
                  <input value={v.icon} onChange={(e) => updVariants(variants.map((x, i) => i === idx ? { ...x, icon: e.target.value } : x))}
                    className="text-sm w-8 text-center bg-transparent border border-gray-200 rounded px-1 py-0.5 focus:outline-none" />
                  <input value={v.name} onChange={(e) => updVariants(variants.map((x, i) => i === idx ? { ...x, name: e.target.value } : x))}
                    className="text-[13px] font-bold text-gray-600 bg-transparent border-none outline-none flex-1 min-w-0" />
                  {variants.length > 1 && (
                    <button onClick={() => updVariants(variants.filter((_, i) => i !== idx))}
                      className="text-gray-300 hover:text-red-400 text-xs px-1">×</button>
                  )}
                </div>
                {[
                  { rowLabel: 'BG',   palKey: 'bgColor',   shdKey: 'bgShade',   opKey: 'bgOpacity' },
                  { rowLabel: 'Text', palKey: 'textColor', shdKey: 'textShade', opKey: 'textOpacity' },
                ].map(({ rowLabel, palKey, shdKey, opKey }) => {
                  const palVal = (v[palKey as keyof TV] ?? null) as PaletteKey | null;
                  const shdVal = (v[shdKey as keyof TV] ?? 500) as Shade;
                  const opVal  = (v[opKey  as keyof TV] ?? 100) as number;
                  return (
                    <div key={rowLabel} className="grid items-center mb-0.5" style={{ gridTemplateColumns: '42px minmax(0,1fr) 80px 52px', gap: '0 4px' }}>
                      <span className="text-[11px] text-gray-400">{rowLabel}</span>
                      <PaletteSelect value={palVal} onChange={(p) => updVariants(variants.map((x, i) => i === idx ? { ...x, [palKey]: p } : x))}
                        palettes={palettes} paletteKeys={availablePaletteKeys} includeNone className="flex-1 min-w-0" />
                      {palVal !== null && <ShadeSelect value={shdVal} onChange={(sh) => updVariants(variants.map((x, i) => i === idx ? { ...x, [shdKey]: sh } : x))}
                        palValue={palVal} palettes={palettes} className="w-[68px]" />}
                      {palVal !== null && (
                        <div className="flex items-center gap-0.5">
                          <input type="number" min={0} max={100} value={opVal}
                            onChange={(e) => updVariants(variants.map((x, i) => i === idx ? { ...x, [opKey]: Number(e.target.value) } : x))}
                            className="w-10 text-right text-xs border border-gray-200 rounded px-1 py-0.5 focus:outline-none focus:border-blue-400" />
                          <span className="text-xs text-gray-400">%</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
            <button onClick={() => updVariants([...variants, { name: `Toast ${variants.length + 1}`, icon: '🔔', bgColor: 'gray', bgShade: 800, bgOpacity: 100, textColor: 'white', textShade: 500, textOpacity: 100 }])}
              className="w-full text-xs text-gray-400 hover:text-blue-500 border border-dashed border-gray-200 hover:border-blue-300 rounded-md py-1.5 transition-colors">
              + Variant 추가
            </button>
          </>
        );
      })()}

      {/* ─── TAB ─── */}
      {compKey === 'tab' && (() => {
        type TS = { type: string; label: string; fontSize: number; paddingX: number; paddingY: number; borderRadius: number; activeColor: PaletteKey|null; activeShade: Shade; activeBgColor: PaletteKey|null; activeBgShade: Shade; inactiveColor: PaletteKey|null; inactiveShade: Shade; trackColor: PaletteKey|null; trackShade: Shade };
        const styles: TS[] = (s.styles as TS[]) ?? [];
        const updStyles = (next: TS[]) => upd({ styles: next });
        const updStyle = (idx: number, patch: Partial<TS>) => updStyles(styles.map((st, i) => i === idx ? { ...st, ...patch } : st));
        const trackLabels: Record<string, string> = { line: '라인 트랙', box: '비활성 탭 BG', segment: '트랙 BG' };
        return (
          <>
            {styles.map((st, idx) => (
              <div key={st.type} className="mb-4">
                <div className="flex items-center gap-1 mb-2">
                  <span className="text-[13px] font-bold text-gray-600">{st.label}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <NumRow label="Font Size"     value={st.fontSize}     onChange={(v) => updStyle(idx, { fontSize: v })}     max={24} />
                  <NumRow label="Padding X"     value={st.paddingX}     onChange={(v) => updStyle(idx, { paddingX: v })}     max={40} />
                  <NumRow label="Padding Y"     value={st.paddingY}     onChange={(v) => updStyle(idx, { paddingY: v })}     max={30} />
                  <NumRow label="Corner Radius" value={st.borderRadius} onChange={(v) => updStyle(idx, { borderRadius: v })} max={99} />
                  <ColorRow label="Active 텍스트" palValue={st.activeColor} shadeValue={st.activeShade}
                    onPalChange={(p) => updStyle(idx, { activeColor: p })} onShadeChange={(sh) => updStyle(idx, { activeShade: sh })}
                    palettes={palettes} paletteKeys={availablePaletteKeys} />
                  {st.type !== 'line' && (
                    <ColorRow label="Active BG" palValue={st.activeBgColor} shadeValue={st.activeBgShade}
                      onPalChange={(p) => updStyle(idx, { activeBgColor: p })} onShadeChange={(sh) => updStyle(idx, { activeBgShade: sh })}
                      palettes={palettes} paletteKeys={availablePaletteKeys} includeNone />
                  )}
                  <ColorRow label="기본 텍스트" palValue={st.inactiveColor} shadeValue={st.inactiveShade}
                    onPalChange={(p) => updStyle(idx, { inactiveColor: p })} onShadeChange={(sh) => updStyle(idx, { inactiveShade: sh })}
                    palettes={palettes} paletteKeys={availablePaletteKeys} includeNone />
                  {trackLabels[st.type] && (
                    <ColorRow label={trackLabels[st.type]} palValue={st.trackColor} shadeValue={st.trackShade}
                      onPalChange={(p) => updStyle(idx, { trackColor: p })} onShadeChange={(sh) => updStyle(idx, { trackShade: sh })}
                      palettes={palettes} paletteKeys={availablePaletteKeys} includeNone />
                  )}
                </div>
                {idx < styles.length - 1 && <div className="mt-3 border-t border-gray-100" />}
              </div>
            ))}
          </>
        );
      })()}

      {/* ─── AVATAR ─── */}
      {compKey === 'avatar' && (
        <>
          <Section title="크기 (px)">
            <NumRow label="S"  value={num('sizeS')}  onChange={(v) => upd({ sizeS: v })}  max={80} />
            <NumRow label="M"  value={num('sizeM')}  onChange={(v) => upd({ sizeM: v })}  max={100} />
            <NumRow label="L"  value={num('sizeL')}  onChange={(v) => upd({ sizeL: v })}  max={120} />
            <NumRow label="XL" value={num('sizeXL')} onChange={(v) => upd({ sizeXL: v })} max={160} />
          </Section>
          <Section title="컬러">
            <ColorRow label="BG" palValue={pal('bgColor')} shadeValue={shd('bgShade')}
              onPalChange={(p) => upd({ bgColor: p })} onShadeChange={(sh) => upd({ bgShade: sh })}
              palettes={palettes} paletteKeys={availablePaletteKeys} />
            <ColorRow label="텍스트" palValue={pal('textColor')} shadeValue={shd('textShade')}
              onPalChange={(p) => upd({ textColor: p })} onShadeChange={(sh) => upd({ textShade: sh })}
              palettes={palettes} paletteKeys={availablePaletteKeys} />
          </Section>
        </>
      )}

      {/* ─── CHECKBOX ─── */}
      {compKey === 'checkbox' && (
        <>
          <Section title="크기">
            <NumRow label="Size"          value={num('size')}         onChange={(v) => upd({ size: v })}         min={12} max={32} />
            <NumRow label="Font Size"     value={num('fontSize')}     onChange={(v) => upd({ fontSize: v })}     max={24} />
            <NumRow label="Corner Radius" value={num('borderRadius')} onChange={(v) => upd({ borderRadius: v })} max={16} />
          </Section>
          <Section title="컬러">
            <ColorRow label="Checked" palValue={pal('checkedColor')} shadeValue={shd('checkedShade')}
              onPalChange={(p) => upd({ checkedColor: p })} onShadeChange={(sh) => upd({ checkedShade: sh })} palettes={palettes} paletteKeys={availablePaletteKeys} />
            <ColorRow label="Disabled" palValue={pal('disabledColor')} shadeValue={shd('disabledShade')} opacity={num('disabledOpacity', 100)}
              onPalChange={(p) => upd({ disabledColor: p })} onShadeChange={(sh) => upd({ disabledShade: sh })} onOpacityChange={(v) => upd({ disabledOpacity: v })} palettes={palettes} paletteKeys={availablePaletteKeys} includeNone />
          </Section>
          <Section title="옵션">
            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-gray-600">텍스트 표시</span>
              <input type="checkbox" checked={s.showLabel !== false} onChange={(e) => upd({ showLabel: e.target.checked })} className="w-4 h-4 accent-blue-500" />
            </div>
          </Section>
        </>
      )}

      {/* ─── RADIO ─── */}
      {compKey === 'radio' && (
        <>
          <Section title="크기">
            <NumRow label="Size"      value={num('size')}     onChange={(v) => upd({ size: v })}     min={12} max={32} />
            <NumRow label="Font Size" value={num('fontSize')} onChange={(v) => upd({ fontSize: v })} max={24} />
          </Section>
          <Section title="컬러">
            <ColorRow label="Selected" palValue={pal('checkedColor')} shadeValue={shd('checkedShade')}
              onPalChange={(p) => upd({ checkedColor: p })} onShadeChange={(sh) => upd({ checkedShade: sh })} palettes={palettes} paletteKeys={availablePaletteKeys} />
            <ColorRow label="Disabled" palValue={pal('disabledColor')} shadeValue={shd('disabledShade')} opacity={num('disabledOpacity', 100)}
              onPalChange={(p) => upd({ disabledColor: p })} onShadeChange={(sh) => upd({ disabledShade: sh })} onOpacityChange={(v) => upd({ disabledOpacity: v })} palettes={palettes} paletteKeys={availablePaletteKeys} includeNone />
          </Section>
          <Section title="옵션">
            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-gray-600">텍스트 표시</span>
              <input type="checkbox" checked={s.showLabel !== false} onChange={(e) => upd({ showLabel: e.target.checked })} className="w-4 h-4 accent-blue-500" />
            </div>
          </Section>
        </>
      )}

      {/* ─── TOGGLE ─── */}
      {compKey === 'toggle' && (
        <>
          <Section title="크기">
            <NumRow label="Track Width"  value={num('width')}  onChange={(v) => upd({ width: v })}  min={24} max={80} />
            <NumRow label="Track Height" value={num('height')} onChange={(v) => upd({ height: v })} min={16} max={48} />
          </Section>
          {[
            { label: 'On', bgPal: 'onBgColor', bgShd: 'onBgShade', bgOp: 'onBgOpacity', dotPal: 'onDotColor', dotShd: 'onDotShade' },
            { label: 'Off', bgPal: 'offBgColor', bgShd: 'offBgShade', bgOp: 'offBgOpacity', dotPal: 'offDotColor', dotShd: 'offDotShade' },
            { label: 'On (비활성)', bgPal: 'onDisBgColor', bgShd: 'onDisBgShade', bgOp: 'onDisBgOpacity', dotPal: 'onDisDotColor', dotShd: 'onDisDotShade' },
            { label: 'Off (비활성)', bgPal: 'offDisBgColor', bgShd: 'offDisBgShade', bgOp: 'offDisBgOpacity', dotPal: 'offDisDotColor', dotShd: 'offDisDotShade' },
          ].map(({ label, bgPal, bgShd, bgOp, dotPal, dotShd }) => (
            <div key={label} className="mb-3">
              <div className="flex items-center gap-1 mb-1">
                <span className="text-[13px] font-bold text-gray-600">{label}</span>
              </div>
              <ColorRow label="BG" palValue={pal(bgPal)} shadeValue={shd(bgShd)} opacity={num(bgOp, 100)}
                onPalChange={(p) => upd({ [bgPal]: p })} onShadeChange={(sh) => upd({ [bgShd]: sh })} onOpacityChange={(v) => upd({ [bgOp]: v })}
                palettes={palettes} paletteKeys={availablePaletteKeys} />
              <ColorRow label="Circle" palValue={pal(dotPal)} shadeValue={shd(dotShd)}
                onPalChange={(p) => upd({ [dotPal]: p })} onShadeChange={(sh) => upd({ [dotShd]: sh })}
                palettes={palettes} paletteKeys={availablePaletteKeys} />
            </div>
          ))}
          <Section title="옵션">
            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-gray-600">텍스트 표시</span>
              <input type="checkbox" checked={s.showLabel !== false} onChange={(e) => upd({ showLabel: e.target.checked })} className="w-4 h-4 accent-blue-500" />
            </div>
          </Section>
        </>
      )}

      {/* ─── SPINNER ─── */}
      {compKey === 'spinner' && (
        <>
          <Section title="크기">
            <NumRow label="Size S"       value={num('sizeS')}       onChange={(v) => upd({ sizeS: v })}       min={12} max={48} />
            <NumRow label="Size M"       value={num('sizeM')}       onChange={(v) => upd({ sizeM: v })}       min={16} max={64} />
            <NumRow label="Size L"       value={num('sizeL')}       onChange={(v) => upd({ sizeL: v })}       min={20} max={80} />
            <NumRow label="Stroke Width" value={num('strokeWidth')} onChange={(v) => upd({ strokeWidth: v })} min={1} max={8} />
          </Section>
          <Section title="컬러">
            <ColorRow label="Active" palValue={pal('activeColor')} shadeValue={shd('activeShade')}
              onPalChange={(p) => upd({ activeColor: p })} onShadeChange={(sh) => upd({ activeShade: sh })}
              palettes={palettes} paletteKeys={availablePaletteKeys} />
            <ColorRow label="BG" palValue={pal('bgColor')} shadeValue={shd('bgShade')}
              onPalChange={(p) => upd({ bgColor: p })} onShadeChange={(sh) => upd({ bgShade: sh })}
              palettes={palettes} paletteKeys={availablePaletteKeys} includeNone />
          </Section>
        </>
      )}

      {/* ─── SKELETON / PROGRESS ─── */}
      {(compKey === 'skeleton' || compKey === 'progress') && (
        <Section title="크기">
          <NumRow label="Height"        value={num('height')}       onChange={(v) => upd({ height: v })}       min={2} max={40} />
          <NumRow label="Corner Radius" value={num('borderRadius')} onChange={(v) => upd({ borderRadius: v })} max={100} />
        </Section>
      )}

      {/* ─── PAGINATION ─── */}
      {compKey === 'pagination' && (
        <>
          <Section title="크기">
            <NumRow label="Button Size"   value={num('size')}         onChange={(v) => upd({ size: v })}         min={24} max={64} />
            <NumRow label="Font Size"     value={num('fontSize')}     onChange={(v) => upd({ fontSize: v })}     max={20} />
            <NumRow label="Corner Radius" value={num('borderRadius')} onChange={(v) => upd({ borderRadius: v })} max={100} />
            <NumRow label="간격 (Gap)"    value={num('gap', 4)}       onChange={(v) => upd({ gap: v })}          max={20} />
          </Section>
          <Section title="컬러">
            <ColorRow label="Active 텍스트" palValue={pal('activeColor')} shadeValue={shd('activeShade')}
              onPalChange={(p) => upd({ activeColor: p })} onShadeChange={(sh) => upd({ activeShade: sh })}
              palettes={palettes} paletteKeys={availablePaletteKeys} />
            <ColorRow label="Active BG" palValue={pal('activeBgColor')} shadeValue={shd('activeBgShade')}
              onPalChange={(p) => upd({ activeBgColor: p })} onShadeChange={(sh) => upd({ activeBgShade: sh })}
              palettes={palettes} paletteKeys={availablePaletteKeys} />
            <ColorRow label="기본 텍스트" palValue={pal('inactiveColor')} shadeValue={shd('inactiveShade')}
              onPalChange={(p) => upd({ inactiveColor: p })} onShadeChange={(sh) => upd({ inactiveShade: sh })}
              palettes={palettes} paletteKeys={availablePaletteKeys} includeNone />
            <ColorRow label="테두리" palValue={pal('borderColor')} shadeValue={shd('borderShade')}
              onPalChange={(p) => upd({ borderColor: p })} onShadeChange={(sh) => upd({ borderShade: sh })}
              palettes={palettes} paletteKeys={availablePaletteKeys} includeNone />
          </Section>
          <Section title="옵션">
            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-gray-600">첫/마지막 페이지 버튼 (&lt;&lt; &gt;&gt;)</span>
              <input type="checkbox" checked={s.showFirstLast !== false} onChange={(e) => upd({ showFirstLast: e.target.checked })} className="w-4 h-4 accent-blue-500" />
            </div>
          </Section>
        </>
      )}

      {/* ─── TOOLTIP ─── */}
      {compKey === 'tooltip' && (
        <Section title="크기">
          <NumRow label="Padding X"     value={num('paddingX')}     onChange={(v) => upd({ paddingX: v })}     max={30} />
          <NumRow label="Padding Y"     value={num('paddingY')}     onChange={(v) => upd({ paddingY: v })}     max={20} />
          <NumRow label="Font Size"     value={num('fontSize')}     onChange={(v) => upd({ fontSize: v })}     max={18} />
          <NumRow label="Corner Radius" value={num('borderRadius')} onChange={(v) => upd({ borderRadius: v })} max={20} />
        </Section>
      )}

      {/* ─── DIVIDER ─── */}
      {compKey === 'divider' && (
        <>
          <Section title="크기">
            <NumRow label="Height" value={num('height')} onChange={(v) => upd({ height: v })} min={1} max={8} />
          </Section>
          <Section title="컬러">
            <ColorRow label="색상" palValue={pal('color')} shadeValue={shd('colorShade')}
              onPalChange={(p) => upd({ color: p })} onShadeChange={(sh) => upd({ colorShade: sh })} palettes={palettes} paletteKeys={availablePaletteKeys} />
          </Section>
        </>
      )}
    </div>
  );
}
