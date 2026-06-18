'use client';

import { useState, useEffect, useRef } from 'react';
import { useDS } from '@/lib/store';
import { isValidHex, getContrastColor } from '@/lib/colorUtils';
import type { PaletteKey, Shade, BaseColorKey, GroupColor, SemanticItem } from '@/lib/types';

const SHADES: Shade[] = [100, 200, 300, 400, 500, 600, 700, 800, 900];

const BASE_DEFS: { key: BaseColorKey; label: string }[] = [
  { key: 'white',   label: 'White'   },
  { key: 'black',   label: 'Black'   },
  { key: 'rose',    label: 'Rose'    },
  { key: 'pink',    label: 'Pink'    },
  { key: 'fuchsia', label: 'Fuchsia' },
  { key: 'purple',  label: 'Purple'  },
  { key: 'violet',  label: 'Violet'  },
  { key: 'indigo',  label: 'Indigo'  },
  { key: 'blue',    label: 'Blue'    },
  { key: 'sky',     label: 'Sky'     },
  { key: 'cyan',    label: 'Cyan'    },
  { key: 'teal',    label: 'Teal'    },
  { key: 'emerald', label: 'Emerald' },
  { key: 'green',   label: 'Green'   },
  { key: 'lime',    label: 'Lime'    },
  { key: 'yellow',  label: 'Yellow'  },
  { key: 'amber',   label: 'Amber'   },
  { key: 'orange',  label: 'Orange'  },
  { key: 'red',     label: 'Red'     },
  { key: 'stone',   label: 'Stone'   },
  { key: 'neutral', label: 'Neutral' },
  { key: 'zinc',    label: 'Zinc'    },
  { key: 'gray',    label: 'Gray'    },
  { key: 'slate',   label: 'Slate'   },
];

/* ── 스워치 셀 (로컬 state로 타이핑 지원) ─────────────── */
function SwatchCell({
  color,
  shade,
  onChange,
}: {
  color: string;
  shade: Shade;
  onChange: (hex: string) => void;
}) {
  const [draft, setDraft] = useState(color.replace('#', ''));
  const textColor = getContrastColor(color);

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
        style={{ fontSize: 13 }}
      />
    </div>
  );
}

/* ── 공통 스워치 그리드 ───────────────────────────────── */
function SwatchGrid({
  scale,
  onSwatchChange,
}: {
  scale: Record<Shade, string>;
  onSwatchChange: (shade: Shade, hex: string) => void;
}) {
  return (
    <div className="grid grid-cols-9 gap-1.5">
      {SHADES.map((shade) => (
        <SwatchCell
          key={shade}
          color={scale[shade]}
          shade={shade}
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
function PaletteCard({ palKey, label }: { palKey: PaletteKey; label: string }) {
  const { palettes, setBase, setSwatchColor, autoGenerate } = useDS();
  const [draft, setDraft] = useState('');
  const pal = palettes[palKey];
  if (!pal) return null;

  const isSingle = SINGLE_SWATCH_KEYS.includes(palKey);

  useEffect(() => { setDraft(pal.base.replace('#', '')); }, [pal.base]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <div className="w-7 h-7 rounded-lg border border-black/10 cursor-pointer" style={{ background: pal.base }} />
          <input type="color" value={pal.base} onChange={(e) => setBase(palKey, e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-bold text-gray-800">{label}</span>
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
      </div>
      {!isSingle && (
        <div className="mt-3">
          <SwatchGrid scale={pal.scale} onSwatchChange={(sh, hex) => setSwatchColor(palKey, sh, hex)} />
        </div>
      )}
    </div>
  );
}

/* ── BG / Border 단일 컬러칩 ─────────────────────────── */
function GroupChip({
  item,
  idx,
  group,
  canRemove,
}: {
  item: GroupColor;
  idx: number;
  group: 'bg' | 'border';
  canRemove: boolean;
}) {
  const { setGroupColor, setGroupLabel, removeGroupColor } = useDS();
  const [draft, setDraft] = useState(item.hex.replace('#', ''));
  const textColor = getContrastColor(item.hex);

  useEffect(() => { setDraft(item.hex.replace('#', '')); }, [item.hex]);

  return (
    <div className="flex flex-col gap-1 w-28 group/chip">
      {/* 컬러 박스 + 삭제 버튼 */}
      <div className="relative">
        {/* 색상 피커 영역 */}
        <div
          className="w-full rounded-lg border border-black/10 cursor-pointer"
          style={{ background: item.hex, height: 56 }}
        />
        <input
          type="color"
          value={item.hex}
          onChange={(e) => setGroupColor(group, idx, e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        {/* 삭제 버튼 — color input 위에 z-10으로 올려서 클릭 가능 */}
        {canRemove && (
          <button
            onClick={() => removeGroupColor(group, idx)}
            className="absolute top-1 right-1 z-10 w-5 h-5 flex items-center justify-center rounded-full bg-black/20 hover:bg-red-500 text-white text-[10px] font-bold opacity-0 group-hover/chip:opacity-100 transition-opacity"
          >
            ✕
          </button>
        )}
      </div>
      {/* 이름 */}
      <input
        type="text"
        value={item.label}
        onChange={(e) => setGroupLabel(group, idx, e.target.value)}
        className="w-full text-xs font-semibold text-gray-700 border-0 bg-transparent focus:outline-none p-0 text-center"
        placeholder="이름"
      />
      {/* Hex 입력 */}
      <input
        type="text"
        value={draft}
        maxLength={6}
        onChange={(e) => {
          const raw = e.target.value.replace('#', '');
          setDraft(raw);
          if (raw.length === 6 && isValidHex(`#${raw}`)) setGroupColor(group, idx, `#${raw}`);
        }}
        onBlur={() => { if (!isValidHex(`#${draft}`)) setDraft(item.hex.replace('#', '')); }}
        className="w-full font-mono text-gray-600 border border-gray-200 rounded px-1 py-1 focus:outline-none focus:border-blue-400 text-center bg-white hover:border-gray-300 transition-colors"
        style={{ fontSize: 12 }}
      />
    </div>
  );
}

/* ── BG / Border 그룹 섹션 ───────────────────────────── */
function GroupSection({ group, title, desc }: { group: 'bg' | 'border'; title: string; desc: string }) {
  const store = useDS();
  const items = store[`${group}Group`];

  return (
    <div className="mb-10">
      <SectionHeader title={title} desc={desc}>
        <button
          onClick={() => store.addGroupColor(group)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
        >
          + 추가
        </button>
      </SectionHeader>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex flex-wrap gap-4">
          {items.map((item, idx) => (
            <GroupChip key={idx} item={item} idx={idx} group={group} canRemove={items.length > 1} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── 메인 페이지 ──────────────────────────────────────── */
export default function ColorsPage() {
  const { semanticList, addSemantic, reorderSemantic } = useDS();
  const dragId = useRef<string | null>(null);

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">컬러 시스템</h1>
        <p className="text-sm text-gray-500 mt-1">기본 색상을 선택하거나 직접 입력하면 100~900 스케일이 자동 생성됩니다.</p>
      </div>

      {(() => {
        const FIXED_BOTTOM = ['info', 'success', 'error', 'warning'];
        const dynamicItems = semanticList.filter((i) => !FIXED_BOTTOM.includes(i.id));
        const fixedItems = semanticList.filter((i) => FIXED_BOTTOM.includes(i.id));

        const renderCard = (item: SemanticItem) => {
          const canDrag = !FIXED_SEMANTIC.includes(item.id);
          const canRemove = canDrag;
          return (
            <div
              key={item.id}
              draggable={canDrag}
              onDragStart={() => { dragId.current = item.id; }}
              onDragOver={(e) => { if (canDrag) e.preventDefault(); }}
              onDrop={() => {
                if (dragId.current && dragId.current !== item.id && canDrag) {
                  reorderSemantic(dragId.current, item.id);
                }
                dragId.current = null;
              }}
            >
              <SemanticCard item={item} canRemove={canRemove} canDrag={canDrag} dragHandleProps={{ draggable: false }} />
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
              <div className="grid grid-cols-1 gap-3">
                {dynamicItems.map(renderCard)}
              </div>
            </div>

            {/* ── BG / Border ── */}
            <GroupSection group="bg"     title="BG"     desc="배경 색상 — 페이지, 카드, 인터랙션 영역 등" />
            <GroupSection group="border" title="Border" desc="테두리 색상 — 인풋, 카드, 구분선 등" />

            {/* ── 상태 컬러 (fixed bottom) ── */}
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-bold text-gray-700">상태 컬러</span>
                <span className="text-xs text-gray-400">— 고정</span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {fixedItems.map(renderCard)}
              </div>
            </div>
          </>
        );
      })()}

      {/* ── 베이스 컬러 ──────────────────────────────── */}
      <div>
        <SectionHeader title="베이스 컬러" desc="Tailwind 기반 전체 컬러 팔레트" />
        <div className="grid grid-cols-1 gap-3">
          {BASE_DEFS.map(({ key, label }) => (
            <PaletteCard key={key} palKey={key} label={label} />
          ))}
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
