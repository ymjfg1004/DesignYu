'use client';

import { useState, useEffect, useRef } from 'react';
import { useDS } from '@/lib/store';
import { isValidHex, getContrastColor } from '@/lib/colorUtils';
import type { PaletteKey, Shade, SemanticItem } from '@/lib/types';

const SHADES: Shade[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

/* ── 스워치 셀 (로컬 state로 타이핑 지원) ─────────────── */
function SwatchCell({
  color,
  shade,
  tag,
  onChange,
}: {
  color: string;
  shade: Shade;
  tag?: string;
  onChange: (hex: string) => void;
}) {
  const [draft, setDraft] = useState(color.replace('#', ''));
  const textColor = getContrastColor(color);
  const isUnused = !tag || tag === 'new';

  // 외부(색상 피커 등)에서 color가 바뀌면 draft도 동기화
  useEffect(() => {
    setDraft(color.replace('#', ''));
  }, [color]);

  return (
    <div className="flex flex-col gap-1">
      <div className="relative group">
        <div
          className="w-full rounded-md border border-black/5 cursor-pointer flex flex-col items-center justify-end pb-1"
          style={{ background: color, height: 40 }}
        >
          <span className="text-[9px] font-bold leading-none" style={{ color: textColor }}>
            {shade}
          </span>
        </div>
        <input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      <input
        type="text"
        value={draft}
        maxLength={6}
        onChange={(e) => {
          const raw = e.target.value.replace('#', '');
          setDraft(raw);
          if (raw.length === 6 && isValidHex(`#${raw}`)) onChange(`#${raw}`);
        }}
        onBlur={() => {
          // blur 시 유효하지 않으면 원래 값으로 복원
          if (!isValidHex(`#${draft}`)) setDraft(color.replace('#', ''));
        }}
        className="w-full font-mono text-gray-600 border border-gray-200 rounded px-1 py-1.5 focus:outline-none focus:border-blue-400 text-center bg-white hover:border-gray-300 transition-colors"
        style={{ fontSize: 14 }}
      />
      {tag && (
        <p
          title={tag}
          className={`text-center break-words leading-tight ${isUnused ? 'text-gray-300' : 'text-gray-600 font-semibold'}`}
          style={{ fontSize: 10 }}
        >
          {tag}
        </p>
      )}
    </div>
  );
}

/* ── 공통 스워치 그리드 ───────────────────────────────── */
function SwatchGrid({
  scale,
  tags,
  onSwatchChange,
}: {
  scale: Record<Shade, string>;
  tags?: Partial<Record<Shade, string>>;
  onSwatchChange: (shade: Shade, hex: string) => void;
}) {
  return (
    <div className="grid grid-cols-10 gap-1.5">
      {SHADES.map((shade) => (
        <SwatchCell
          key={shade}
          color={scale[shade]}
          shade={shade}
          tag={tags?.[shade]}
          onChange={(hex) => onSwatchChange(shade, hex)}
        />
      ))}
    </div>
  );
}

const FIXED_SEMANTIC = ['primary', 'info', 'success', 'error', 'warning'];

/* ── 시맨틱 팔레트 카드 (동적) ───────────────────────── */
function SemanticCard({
  item,
  canRemove,
  canDrag,
  dragHandleProps,
}: {
  item: SemanticItem;
  canRemove: boolean;
  canDrag: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}) {
  const { setSemanticBase, setSemanticSwatch, autoGenerateSemantic, setSemanticLabel, setSemanticEmoji, removeSemantic } = useDS();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow group/sem">
      <div className="flex items-center gap-3 mb-3">
        {/* 드래그 핸들 */}
        {canDrag ? (
          <div
            {...dragHandleProps}
            className="flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 px-0.5 select-none"
          >
            <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor">
              <circle cx="3" cy="3" r="1.5"/><circle cx="7" cy="3" r="1.5"/>
              <circle cx="3" cy="8" r="1.5"/><circle cx="7" cy="8" r="1.5"/>
              <circle cx="3" cy="13" r="1.5"/><circle cx="7" cy="13" r="1.5"/>
            </svg>
          </div>
        ) : (
          <div className="flex-shrink-0 w-[18px]" />
        )}
        {/* 이모지 피커 */}
        <div className="relative flex-shrink-0">
          <input
            type="text"
            value={item.emoji}
            maxLength={2}
            onChange={(e) => setSemanticEmoji(item.id, e.target.value)}
            className="w-8 h-8 text-center text-lg border-0 bg-transparent focus:outline-none cursor-text p-0"
          />
        </div>
        {/* 베이스 컬러 피커 */}
        <div className="relative flex-shrink-0">
          <div className="w-7 h-7 rounded-lg border border-black/10 cursor-pointer" style={{ background: item.base }} />
          <input type="color" value={item.base} onChange={(e) => setSemanticBase(item.id, e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={item.label}
              onChange={(e) => setSemanticLabel(item.id, e.target.value)}
              className="text-xs font-bold text-gray-800 border-0 bg-transparent focus:outline-none p-0 w-32"
            />
            <span className="text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-bold">시맨틱</span>
          </div>
          <p className="text-[10px] font-mono text-gray-400 mt-0.5">{item.base}</p>
        </div>
        <button onClick={() => autoGenerateSemantic(item.id)}
          className="px-2.5 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0">
          자동생성
        </button>
        {canRemove ? (
          <button
            onClick={() => removeSemantic(item.id)}
            className="w-6 h-6 flex items-center justify-center rounded-full text-gray-300 hover:bg-red-50 hover:text-red-500 text-xs transition-colors flex-shrink-0"
          >
            ✕
          </button>
        ) : (
          <div className="w-6 flex-shrink-0" />
        )}
      </div>
      <SwatchGrid scale={item.scale} onSwatchChange={(sh, hex) => setSemanticSwatch(item.id, sh, hex)} />
    </div>
  );
}

const SINGLE_SWATCH_KEYS: PaletteKey[] = ['white', 'black'];

/* ── 베이스 팔레트 카드 ───────────────────────────────── */
function PaletteCard({
  palKey,
  label,
  canRemove,
  onRemove,
}: {
  palKey: PaletteKey;
  label: string;
  canRemove: boolean;
  onRemove: () => void;
}) {
  const { palettes, setBase, setSwatchColor, autoGenerate, setBaseLabel } = useDS();
  const [draft, setDraft] = useState('');
  const pal = palettes[palKey];
  if (!pal) return null;

  const isSingle = SINGLE_SWATCH_KEYS.includes(palKey);

  useEffect(() => { setDraft(pal.base.replace('#', '')); }, [pal.base]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow group/pal">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 px-0.5 select-none">
          <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor">
            <circle cx="3" cy="3" r="1.5"/><circle cx="7" cy="3" r="1.5"/>
            <circle cx="3" cy="8" r="1.5"/><circle cx="7" cy="8" r="1.5"/>
            <circle cx="3" cy="13" r="1.5"/><circle cx="7" cy="13" r="1.5"/>
          </svg>
        </div>
        <div className="relative flex-shrink-0">
          <div className="w-7 h-7 rounded-lg border border-black/10 cursor-pointer" style={{ background: pal.base }} />
          <input type="color" value={pal.base} onChange={(e) => setBase(palKey, e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
        </div>
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={label}
            onChange={(e) => setBaseLabel(palKey, e.target.value)}
            className="text-xs font-bold text-gray-800 border-0 bg-transparent focus:outline-none p-0 w-full"
          />
          <input type="text" value={draft} maxLength={6}
            onChange={(e) => {
              const raw = e.target.value.replace('#', '');
              setDraft(raw);
              if (raw.length === 6 && isValidHex(`#${raw}`)) setBase(palKey, `#${raw}`);
            }}
            onBlur={() => { if (!isValidHex(`#${draft}`)) setDraft(pal.base.replace('#', '')); }}
            className="text-[10px] font-mono text-gray-400 w-full border-0 bg-transparent focus:outline-none p-0 mt-0.5 block" />
        </div>
        {!isSingle && (
          <button onClick={() => autoGenerate(palKey)}
            className="px-2.5 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0">
            자동생성
          </button>
        )}
        {canRemove ? (
          <button
            onClick={onRemove}
            className="w-6 h-6 flex items-center justify-center rounded-full text-gray-300 hover:bg-red-50 hover:text-red-500 text-xs transition-colors flex-shrink-0 opacity-0 group-hover/pal:opacity-100"
          >
            ✕
          </button>
        ) : (
          <div className="w-6 flex-shrink-0" />
        )}
      </div>
      {!isSingle && (
        <div className="mt-3">
          <SwatchGrid scale={pal.scale} tags={pal.tags} onSwatchChange={(sh, hex) => setSwatchColor(palKey, sh, hex)} />
        </div>
      )}
    </div>
  );
}

/* ── 온/오프 토글 스위치 ──────────────────────────────── */
function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${
        checked ? 'bg-blue-600' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-4' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

/* ── 드롭 위치 표시선 ─────────────────────────────────── */
function DropLine() {
  return <div className="h-1 my-0.5 rounded-full bg-blue-500" />;
}

/* ── 메인 페이지 ──────────────────────────────────────── */
type DragItem = { type: 'semantic' | 'base'; key: string };
type DropTarget = { key: string; pos: 'before' | 'after' };

export default function ColorsPage() {
  const {
    semanticList, addSemantic, reorderSemantic, convertSemanticToBase,
    baseColorList, addBaseColor, removeBaseColor, resetBaseColors, reorderBaseColors, convertBaseToSemantic,
    statusColorsEnabled, setStatusColorsEnabled,
  } = useDS();
  const dragItem = useRef<DragItem | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);

  const computePos = (e: React.DragEvent<HTMLElement>): 'before' | 'after' => {
    const rect = e.currentTarget.getBoundingClientRect();
    return e.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
  };
  const clearDrag = () => { dragItem.current = null; setDropTarget(null); };

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">컬러 시스템</h1>
        <p className="text-sm text-gray-500 mt-1">기본 색상을 선택하거나 직접 입력하면 50~900 스케일이 자동 생성됩니다.</p>
      </div>

      {(() => {
        const FIXED_BOTTOM = ['info', 'success', 'error', 'warning'];
        const dynamicItems = semanticList.filter((i) => !FIXED_BOTTOM.includes(i.id));
        const fixedItems = semanticList.filter((i) => FIXED_BOTTOM.includes(i.id));

        const renderCard = (item: SemanticItem) => {
          const canDrag = !FIXED_SEMANTIC.includes(item.id);
          const canRemove = canDrag;
          const isTarget = dropTarget?.key === item.id;
          return (
            <div key={item.id}>
              {isTarget && dropTarget.pos === 'before' && <DropLine />}
              <div
                draggable={canDrag}
                onDragStart={() => { dragItem.current = { type: 'semantic', key: item.id }; }}
                onDragOver={(e) => {
                  const d = dragItem.current;
                  if ((d?.type === 'semantic' && canDrag) || d?.type === 'base') {
                    e.preventDefault();
                    setDropTarget({ key: item.id, pos: computePos(e) });
                  }
                }}
                onDragEnd={clearDrag}
                onDrop={() => {
                  const d = dragItem.current;
                  const pos = dropTarget?.pos ?? 'before';
                  if (d?.type === 'semantic' && canDrag && d.key !== item.id) {
                    reorderSemantic(d.key, item.id, pos);
                  } else if (d?.type === 'base') {
                    convertBaseToSemantic(d.key, item.id, pos);
                  }
                  clearDrag();
                }}
              >
                <SemanticCard item={item} canRemove={canRemove} canDrag={canDrag} dragHandleProps={{ draggable: false }} />
              </div>
              {isTarget && dropTarget.pos === 'after' && <DropLine />}
            </div>
          );
        };

        return (
          <>
            {/* ── 시맨틱 컬러 (primary + dynamic) ── */}
            <div className="mb-10">
              <SectionHeader title="시맨틱 컬러" desc="컴포넌트에서 직접 사용하는 의미 기반 색상">
                <button
                  onClick={addSemantic}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
                >
                  + 추가
                </button>
              </SectionHeader>
              <div
                className="grid grid-cols-1 gap-3"
                onDragOver={(e) => { if (dragItem.current?.type === 'base') e.preventDefault(); }}
                onDrop={() => {
                  if (dragItem.current?.type === 'base') convertBaseToSemantic(dragItem.current.key);
                  clearDrag();
                }}
              >
                {dynamicItems.map(renderCard)}
              </div>
            </div>

            {/* ── 상태 컬러 (fixed bottom) ── */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-700">상태 컬러</span>
                  <span className="text-xs text-gray-400">— 고정</span>
                </div>
                <ToggleSwitch checked={statusColorsEnabled} onChange={setStatusColorsEnabled} />
              </div>
              {statusColorsEnabled && (
                <div className="grid grid-cols-1 gap-3">
                  {fixedItems.map(renderCard)}
                </div>
              )}
            </div>
          </>
        );
      })()}

      {/* ── 베이스 컬러 ──────────────────────────────── */}
      <div>
        <SectionHeader title="베이스 컬러" desc="파로스/스텔라 컬러 시스템 — 헥사값 아래 작은 글씨는 피그마 실사용 태그(예: $bg, $border2)">
          <div className="flex items-center gap-2">
            <button
              onClick={resetBaseColors}
              title="추가·삭제한 내용을 초기 상태로 되돌립니다"
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 6a4 4 0 1 1 .8 2.4" strokeLinecap="round"/><path d="M2 3v3h3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              초기화
            </button>
            <button
              onClick={addBaseColor}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              + 추가
            </button>
          </div>
        </SectionHeader>
        <div
          className="grid grid-cols-1 gap-3"
          onDragOver={(e) => { if (dragItem.current?.type === 'semantic') e.preventDefault(); }}
          onDrop={() => {
            if (dragItem.current?.type === 'semantic') convertSemanticToBase(dragItem.current.key);
            clearDrag();
          }}
        >
          {baseColorList.map(({ key, label }) => {
            const isTarget = dropTarget?.key === key;
            return (
            <div key={key}>
              {isTarget && dropTarget.pos === 'before' && <DropLine />}
              <div
                draggable
                onDragStart={() => { dragItem.current = { type: 'base', key }; }}
                onDragOver={(e) => {
                  const d = dragItem.current;
                  if (d?.type === 'base' || d?.type === 'semantic') {
                    e.preventDefault();
                    setDropTarget({ key, pos: computePos(e) });
                  }
                }}
                onDragEnd={clearDrag}
                onDrop={() => {
                  const d = dragItem.current;
                  const pos = dropTarget?.pos ?? 'before';
                  if (d?.type === 'base' && d.key !== key) reorderBaseColors(d.key, key, pos);
                  else if (d?.type === 'semantic') convertSemanticToBase(d.key, key, pos);
                  clearDrag();
                }}
              >
                <PaletteCard
                  palKey={key}
                  label={label}
                  canRemove={baseColorList.length > 1}
                  onRemove={() => removeBaseColor(key)}
                />
              </div>
              {isTarget && dropTarget.pos === 'after' && <DropLine />}
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-gray-700">{title}</span>
        <span className="text-xs text-gray-400">— {desc}</span>
      </div>
      {children}
    </div>
  );
}
