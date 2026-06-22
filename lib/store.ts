import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateScale } from './colorUtils';
import type { Palette, PaletteKey, Shade, GroupColor, SemanticItem, DesignSystemData, InputSet } from './types';

const PALETTE_DEFAULTS: Record<PaletteKey, string> = {
  primary:   '#3b82f6',
  secondary: '#8b5cf6',
  info:      '#0ea5e9',
  success:   '#10b981',
  error:    '#ef4444',
  warning:   '#f59e0b',
  white:     '#ffffff',
  black:     '#000000',
  rose:      '#f43f5e',
  pink:      '#ec4899',
  fuchsia:   '#d946ef',
  purple:    '#a855f7',
  violet:    '#8b5cf6',
  indigo:    '#6366f1',
  blue:      '#3b82f6',
  sky:       '#0ea5e9',
  cyan:      '#06b6d4',
  teal:      '#14b8a6',
  emerald:   '#10b981',
  green:     '#22c55e',
  lime:      '#84cc16',
  yellow:    '#eab308',
  amber:     '#f59e0b',
  orange:    '#f97316',
  red:       '#ef4444',
  stone:     '#78716c',
  neutral:   '#737373',
  zinc:      '#71717a',
  gray:      '#6b7280',
  slate:     '#64748b',
};

const TAILWIND_SCALES: Partial<Record<PaletteKey, Record<Shade, string>>> = {
  white: { 100:'#ffffff', 200:'#ffffff', 300:'#ffffff', 400:'#ffffff', 500:'#ffffff', 600:'#ffffff', 700:'#ffffff', 800:'#ffffff', 900:'#ffffff' },
  black: { 100:'#000000', 200:'#000000', 300:'#000000', 400:'#000000', 500:'#000000', 600:'#000000', 700:'#000000', 800:'#000000', 900:'#000000' },
  rose:    { 100:'#ffe4e6', 200:'#fecdd3', 300:'#fda4af', 400:'#fb7185', 500:'#f43f5e', 600:'#e11d48', 700:'#be123c', 800:'#9f1239', 900:'#881337' },
  pink:    { 100:'#fce7f3', 200:'#fbcfe8', 300:'#f9a8d4', 400:'#f472b6', 500:'#ec4899', 600:'#db2777', 700:'#be185d', 800:'#9d174d', 900:'#831843' },
  fuchsia: { 100:'#fae8ff', 200:'#f5d0fe', 300:'#f0abfc', 400:'#e879f9', 500:'#d946ef', 600:'#c026d3', 700:'#a21caf', 800:'#86198f', 900:'#701a75' },
  purple:  { 100:'#f3e8ff', 200:'#e9d5ff', 300:'#d8b4fe', 400:'#c084fc', 500:'#a855f7', 600:'#9333ea', 700:'#7e22ce', 800:'#6b21a8', 900:'#581c87' },
  violet:  { 100:'#ede9fe', 200:'#ddd6fe', 300:'#c4b5fd', 400:'#a78bfa', 500:'#8b5cf6', 600:'#7c3aed', 700:'#6d28d9', 800:'#5b21b6', 900:'#4c1d95' },
  indigo:  { 100:'#e0e7ff', 200:'#c7d2fe', 300:'#a5b4fc', 400:'#818cf8', 500:'#6366f1', 600:'#4f46e5', 700:'#4338ca', 800:'#3730a3', 900:'#312e81' },
  blue:    { 100:'#dbeafe', 200:'#bfdbfe', 300:'#93c5fd', 400:'#60a5fa', 500:'#3b82f6', 600:'#2563eb', 700:'#1d4ed8', 800:'#1e40af', 900:'#1e3a8a' },
  sky:     { 100:'#e0f2fe', 200:'#bae6fd', 300:'#7dd3fc', 400:'#38bdf8', 500:'#0ea5e9', 600:'#0284c7', 700:'#0369a1', 800:'#075985', 900:'#0c4a6e' },
  cyan:    { 100:'#cffafe', 200:'#a5f3fc', 300:'#67e8f9', 400:'#22d3ee', 500:'#06b6d4', 600:'#0891b2', 700:'#0e7490', 800:'#155e75', 900:'#164e63' },
  teal:    { 100:'#ccfbf1', 200:'#99f6e4', 300:'#5eead4', 400:'#2dd4bf', 500:'#14b8a6', 600:'#0d9488', 700:'#0f766e', 800:'#115e59', 900:'#134e4a' },
  emerald: { 100:'#d1fae5', 200:'#a7f3d0', 300:'#6ee7b7', 400:'#34d399', 500:'#10b981', 600:'#059669', 700:'#047857', 800:'#065f46', 900:'#064e3b' },
  green:   { 100:'#dcfce7', 200:'#bbf7d0', 300:'#86efac', 400:'#4ade80', 500:'#22c55e', 600:'#16a34a', 700:'#15803d', 800:'#166534', 900:'#14532d' },
  lime:    { 100:'#ecfccb', 200:'#d9f99d', 300:'#bef264', 400:'#a3e635', 500:'#84cc16', 600:'#65a30d', 700:'#4d7c0f', 800:'#3f6212', 900:'#365314' },
  yellow:  { 100:'#fef9c3', 200:'#fef08a', 300:'#fde047', 400:'#facc15', 500:'#eab308', 600:'#ca8a04', 700:'#a16207', 800:'#854d0e', 900:'#713f12' },
  amber:   { 100:'#fef3c7', 200:'#fde68a', 300:'#fcd34d', 400:'#fbbf24', 500:'#f59e0b', 600:'#d97706', 700:'#b45309', 800:'#92400e', 900:'#78350f' },
  orange:  { 100:'#ffedd5', 200:'#fed7aa', 300:'#fdba74', 400:'#fb923c', 500:'#f97316', 600:'#ea580c', 700:'#c2410c', 800:'#9a3412', 900:'#7c2d12' },
  red:     { 100:'#fee2e2', 200:'#fecaca', 300:'#fca5a5', 400:'#f87171', 500:'#ef4444', 600:'#dc2626', 700:'#b91c1c', 800:'#991b1b', 900:'#7f1d1d' },
  stone:   { 100:'#f5f5f4', 200:'#e7e5e4', 300:'#d6d3d1', 400:'#a8a29e', 500:'#78716c', 600:'#57534e', 700:'#44403c', 800:'#292524', 900:'#1c1917' },
  neutral: { 100:'#f5f5f5', 200:'#e5e5e5', 300:'#d4d4d4', 400:'#a3a3a3', 500:'#737373', 600:'#525252', 700:'#404040', 800:'#262626', 900:'#171717' },
  zinc:    { 100:'#f4f4f5', 200:'#e4e4e7', 300:'#d4d4d8', 400:'#a1a1aa', 500:'#71717a', 600:'#52525b', 700:'#3f3f46', 800:'#27272a', 900:'#18181b' },
  gray:    { 100:'#f3f4f6', 200:'#e5e7eb', 300:'#d1d5db', 400:'#9ca3af', 500:'#6b7280', 600:'#4b5563', 700:'#374151', 800:'#1f2937', 900:'#111827' },
  slate:   { 100:'#f1f5f9', 200:'#e2e8f0', 300:'#cbd5e1', 400:'#94a3b8', 500:'#64748b', 600:'#475569', 700:'#334155', 800:'#1e293b', 900:'#0f172a' },
};

function makePalette(key: PaletteKey): Palette {
  const base = PALETTE_DEFAULTS[key];
  const preset = TAILWIND_SCALES[key];
  return { base, scale: preset ?? generateScale(base) };
}

const DEFAULT_SEMANTIC_LIST: SemanticItem[] = [
  { id: 'primary',   label: 'Primary',   emoji: '🔵', base: '#3b82f6', scale: { 100:'#dbeafe', 200:'#bfdbfe', 300:'#93c5fd', 400:'#60a5fa', 500:'#3b82f6', 600:'#2563eb', 700:'#1d4ed8', 800:'#1e40af', 900:'#1e3a8a' } },
  { id: 'secondary', label: 'Secondary', emoji: '🟣', base: '#8b5cf6', scale: { 100:'#ede9fe', 200:'#ddd6fe', 300:'#c4b5fd', 400:'#a78bfa', 500:'#8b5cf6', 600:'#7c3aed', 700:'#6d28d9', 800:'#5b21b6', 900:'#4c1d95' } },
  { id: 'info',      label: 'Info',      emoji: 'ℹ️', base: '#0ea5e9', scale: { 100:'#e0f2fe', 200:'#bae6fd', 300:'#7dd3fc', 400:'#38bdf8', 500:'#0ea5e9', 600:'#0284c7', 700:'#0369a1', 800:'#075985', 900:'#0c4a6e' } },
  { id: 'success',   label: 'Success',   emoji: '✅', base: '#10b981', scale: { 100:'#d1fae5', 200:'#a7f3d0', 300:'#6ee7b7', 400:'#34d399', 500:'#10b981', 600:'#059669', 700:'#047857', 800:'#065f46', 900:'#064e3b' } },
  { id: 'error',    label: 'Error',     emoji: '🔴', base: '#ef4444', scale: { 100:'#fee2e2', 200:'#fecaca', 300:'#fca5a5', 400:'#f87171', 500:'#ef4444', 600:'#dc2626', 700:'#b91c1c', 800:'#991b1b', 900:'#7f1d1d' } },
  { id: 'warning',   label: 'Warning',   emoji: '⚠️', base: '#f59e0b', scale: { 100:'#fef3c7', 200:'#fde68a', 300:'#fcd34d', 400:'#fbbf24', 500:'#f59e0b', 600:'#d97706', 700:'#b45309', 800:'#92400e', 900:'#78350f' } },
];

const DEFAULT_BG_GROUP: GroupColor[] = [
  { label: 'BG 1', hex: '#ffffff' },
  { label: 'BG 2', hex: '#f8fafc' },
];

const DEFAULT_BORDER_GROUP: GroupColor[] = [
  { label: 'Border 1', hex: '#e2e8f0' },
  { label: 'Border 2', hex: '#94a3b8' },
];

const defaultComponents = {
  button: { borderRadius: 8,
    sizes: [ { name: 'S', h: 32, px: 12, py: 0, fs: 12 }, { name: 'M', h: 40, px: 16, py: 0, fs: 14 }, { name: 'L', h: 48, px: 20, py: 0, fs: 16 } ],
    variants: {
      Primary:   { default: { bgColor: 'primary' as PaletteKey, bgShade: 500 as Shade, bgOpacity: 100, borderColor: null, borderShade: 500 as Shade, borderOpacity: 100, textColor: 'white' as PaletteKey, textShade: 500 as Shade, textOpacity: 100 }, hover: { bgColor: 'primary' as PaletteKey, bgShade: 600 as Shade, bgOpacity: 100, borderColor: null, borderShade: 500 as Shade, borderOpacity: 100, textColor: 'white' as PaletteKey, textShade: 500 as Shade, textOpacity: 100 }, active: { bgColor: 'primary' as PaletteKey, bgShade: 700 as Shade, bgOpacity: 100, borderColor: null, borderShade: 500 as Shade, borderOpacity: 100, textColor: 'white' as PaletteKey, textShade: 500 as Shade, textOpacity: 100 }, disabled: { bgColor: 'gray' as PaletteKey, bgShade: 200 as Shade, bgOpacity: 100, borderColor: null, borderShade: 500 as Shade, borderOpacity: 100, textColor: 'gray' as PaletteKey, textShade: 400 as Shade, textOpacity: 100 } },
      Secondary: { default: { bgColor: null, bgShade: 500 as Shade, bgOpacity: 100, borderColor: 'primary' as PaletteKey, borderShade: 500 as Shade, borderOpacity: 100, textColor: 'primary' as PaletteKey, textShade: 500 as Shade, textOpacity: 100 }, hover: { bgColor: 'primary' as PaletteKey, bgShade: 100 as Shade, bgOpacity: 100, borderColor: 'primary' as PaletteKey, borderShade: 500 as Shade, borderOpacity: 100, textColor: 'primary' as PaletteKey, textShade: 500 as Shade, textOpacity: 100 }, active: { bgColor: 'primary' as PaletteKey, bgShade: 200 as Shade, bgOpacity: 100, borderColor: 'primary' as PaletteKey, borderShade: 600 as Shade, borderOpacity: 100, textColor: 'primary' as PaletteKey, textShade: 600 as Shade, textOpacity: 100 }, disabled: { bgColor: null, bgShade: 500 as Shade, bgOpacity: 100, borderColor: 'gray' as PaletteKey, borderShade: 200 as Shade, borderOpacity: 100, textColor: 'gray' as PaletteKey, textShade: 400 as Shade, textOpacity: 100 } },
      Ghost:     { default: { bgColor: null, bgShade: 500 as Shade, bgOpacity: 100, borderColor: null, borderShade: 500 as Shade, borderOpacity: 100, textColor: 'primary' as PaletteKey, textShade: 500 as Shade, textOpacity: 100 }, hover: { bgColor: 'primary' as PaletteKey, bgShade: 100 as Shade, bgOpacity: 100, borderColor: null, borderShade: 500 as Shade, borderOpacity: 100, textColor: 'primary' as PaletteKey, textShade: 500 as Shade, textOpacity: 100 }, active: { bgColor: 'primary' as PaletteKey, bgShade: 200 as Shade, bgOpacity: 100, borderColor: null, borderShade: 500 as Shade, borderOpacity: 100, textColor: 'primary' as PaletteKey, textShade: 600 as Shade, textOpacity: 100 }, disabled: { bgColor: null, bgShade: 500 as Shade, bgOpacity: 100, borderColor: null, borderShade: 500 as Shade, borderOpacity: 100, textColor: 'gray' as PaletteKey, textShade: 400 as Shade, textOpacity: 100 } },
      Error:     { default: { bgColor: 'error' as PaletteKey, bgShade: 500 as Shade, bgOpacity: 100, borderColor: null, borderShade: 500 as Shade, borderOpacity: 100, textColor: 'white' as PaletteKey, textShade: 500 as Shade, textOpacity: 100 }, hover: { bgColor: 'error' as PaletteKey, bgShade: 600 as Shade, bgOpacity: 100, borderColor: null, borderShade: 500 as Shade, borderOpacity: 100, textColor: 'white' as PaletteKey, textShade: 500 as Shade, textOpacity: 100 }, active: { bgColor: 'error' as PaletteKey, bgShade: 700 as Shade, bgOpacity: 100, borderColor: null, borderShade: 500 as Shade, borderOpacity: 100, textColor: 'white' as PaletteKey, textShade: 500 as Shade, textOpacity: 100 }, disabled: { bgColor: 'gray' as PaletteKey, bgShade: 200 as Shade, bgOpacity: 100, borderColor: null, borderShade: 500 as Shade, borderOpacity: 100, textColor: 'gray' as PaletteKey, textShade: 400 as Shade, textOpacity: 100 } },
    },
  },
  input: { sets: [
    { name: 'Default', height: 40, paddingX: 12, fontSize: 14, borderRadius: 8,
      defaultBgColor: 'white' as PaletteKey,   defaultBgShade: 500 as Shade, defaultBgOpacity: 100, borderColor: 'gray'    as PaletteKey, borderShade: 300 as Shade, borderOpacity: 100, defaultTextColor: 'gray'  as PaletteKey, defaultTextShade: 900 as Shade, defaultTextOpacity: 100,
      focusBgColor:   'white' as PaletteKey,   focusBgShade:   500 as Shade, focusBgOpacity:   100, focusColor:  'primary' as PaletteKey, focusShade:  500 as Shade, focusOpacity:  100, focusTextColor:   'gray'  as PaletteKey, focusTextShade:   900 as Shade, focusTextOpacity:   100,
      errorBgColor:   'white' as PaletteKey,   errorBgShade:   500 as Shade, errorBgOpacity:   100, errorColor:  'error'   as PaletteKey, errorShade:  500 as Shade, errorOpacity:  100, errorTextColor:   'gray'  as PaletteKey, errorTextShade:   900 as Shade, errorTextOpacity:   100,
      disabledBgColor:'gray'  as PaletteKey,   disabledBgShade:100 as Shade, disabledBgOpacity:100, disabledColor:'gray'   as PaletteKey, disabledShade:200 as Shade, disabledOpacity:100, disabledTextColor:'gray' as PaletteKey, disabledTextShade:400 as Shade, disabledTextOpacity:100,
      readonlyBgColor:'gray'  as PaletteKey,   readonlyBgShade:100 as Shade, readonlyBgOpacity:100, readonlyColor:'gray'   as PaletteKey, readonlyShade:300 as Shade, readonlyOpacity:100, readonlyTextColor:'gray' as PaletteKey, readonlyTextShade:500 as Shade, readonlyTextOpacity:100,
    },
  ] as InputSet[] },
  textarea:   { borderRadius: 8,   height: 96,  paddingX: 12, paddingY: 10, fontSize: 14, borderColor: 'gray' as PaletteKey, borderShade: 300 as Shade, required: false, showCharCount: false, maxChars: 100 },
  select: {
    borderRadius: 8, height: 40, paddingX: 12, fontSize: 14,
    iconSvg: '', iconSize: 16, iconColor: 'gray' as PaletteKey, iconShade: 400 as Shade,
    defaultBgColor: 'white' as PaletteKey, defaultBgShade: 500 as Shade, defaultBgOpacity: 100, borderColor: 'gray' as PaletteKey, borderShade: 300 as Shade, borderOpacity: 100, defaultTextColor: 'gray' as PaletteKey, defaultTextShade: 900 as Shade, defaultTextOpacity: 100,
    focusBgColor: 'white' as PaletteKey, focusBgShade: 500 as Shade, focusBgOpacity: 100, focusColor: 'primary' as PaletteKey, focusShade: 500 as Shade, focusOpacity: 100, focusTextColor: 'gray' as PaletteKey, focusTextShade: 900 as Shade, focusTextOpacity: 100,
    errorBgColor: 'white' as PaletteKey, errorBgShade: 500 as Shade, errorBgOpacity: 100, errorColor: 'error' as PaletteKey, errorShade: 500 as Shade, errorOpacity: 100, errorTextColor: 'gray' as PaletteKey, errorTextShade: 900 as Shade, errorTextOpacity: 100,
    disabledBgColor: 'gray' as PaletteKey, disabledBgShade: 100 as Shade, disabledBgOpacity: 100, disabledColor: 'gray' as PaletteKey, disabledShade: 200 as Shade, disabledOpacity: 100, disabledTextColor: 'gray' as PaletteKey, disabledTextShade: 400 as Shade, disabledTextOpacity: 100,
  },
  checkbox:   { borderRadius: 4,   size: 18,    fontSize: 14, checkedColor: 'primary' as PaletteKey, checkedShade: 500 as Shade },
  radio:      { size: 18,          fontSize: 14, checkedColor: 'primary' as PaletteKey, checkedShade: 500 as Shade },
  toggle:     { width: 44, height: 24,
    onBgColor: 'primary' as PaletteKey, onBgShade: 500 as Shade, onBgOpacity: 100,
    onDotColor: 'white' as PaletteKey, onDotShade: 500 as Shade,
    offBgColor: 'gray' as PaletteKey, offBgShade: 300 as Shade, offBgOpacity: 100,
    offDotColor: 'white' as PaletteKey, offDotShade: 500 as Shade,
    onDisBgColor: 'primary' as PaletteKey, onDisBgShade: 200 as Shade, onDisBgOpacity: 100,
    onDisDotColor: 'white' as PaletteKey, onDisDotShade: 500 as Shade,
    offDisBgColor: 'gray' as PaletteKey, offDisBgShade: 200 as Shade, offDisBgOpacity: 100,
    offDisDotColor: 'white' as PaletteKey, offDisDotShade: 500 as Shade,
  },
  badge:      { borderRadius: 100, paddingX: 8,  paddingY: 3,  fontSize: 12,
    variants: [
      { name: 'Primary', bgColor: 'primary', bgShade: 100, bgOpacity: 100, textColor: 'primary', textShade: 700, textOpacity: 100 },
      { name: 'Success', bgColor: 'success', bgShade: 100, bgOpacity: 100, textColor: 'success', textShade: 700, textOpacity: 100 },
      { name: 'Warning', bgColor: 'warning', bgShade: 100, bgOpacity: 100, textColor: 'warning', textShade: 700, textOpacity: 100 },
      { name: 'Error',   bgColor: 'error',   bgShade: 100, bgOpacity: 100, textColor: 'error',   textShade: 700, textOpacity: 100 },
      { name: 'Neutral', bgColor: 'gray',    bgShade: 100, bgOpacity: 100, textColor: 'gray',    textShade: 700, textOpacity: 100 },
    ],
  },
  chip:       { borderRadius: 100, paddingX: 12, paddingY: 6,  fontSize: 13,
    variants: [
      { name: '디자인', bgColor: 'primary' as PaletteKey, bgShade: 100 as Shade, bgOpacity: 100, textColor: 'primary' as PaletteKey, textShade: 700 as Shade, textOpacity: 100, borderColor: 'primary' as PaletteKey, borderShade: 200 as Shade },
      { name: '개발',   bgColor: 'success' as PaletteKey, bgShade: 100 as Shade, bgOpacity: 100, textColor: 'success' as PaletteKey, textShade: 700 as Shade, textOpacity: 100, borderColor: 'success' as PaletteKey, borderShade: 200 as Shade },
      { name: '기획',   bgColor: 'warning' as PaletteKey, bgShade: 100 as Shade, bgOpacity: 100, textColor: 'warning' as PaletteKey, textShade: 700 as Shade, textOpacity: 100, borderColor: 'warning' as PaletteKey, borderShade: 200 as Shade },
      { name: '마케팅', bgColor: 'error'   as PaletteKey, bgShade: 100 as Shade, bgOpacity: 100, textColor: 'error'   as PaletteKey, textShade: 700 as Shade, textOpacity: 100, borderColor: 'error'   as PaletteKey, borderShade: 200 as Shade },
    ],
  },
  card:       { borderRadius: 12,  paddingX: 20, paddingY: 20, gap: 12, shadowOpacity: 8, titleFontSize: 16, bodyFontSize: 13, btnVariant: 'Primary' },
  alert:      { borderRadius: 8,   paddingX: 16, paddingY: 14, fontSize: 14 },
  toast:      { borderRadius: 10,  paddingX: 16, paddingY: 14, fontSize: 14,
    variants: [
      { name: 'Success', icon: '✅', bgColor: 'success' as PaletteKey, bgShade: 800 as Shade, bgOpacity: 100, textColor: 'white' as PaletteKey, textShade: 500 as Shade, textOpacity: 100 },
      { name: 'Error',   icon: '❌', bgColor: 'error'   as PaletteKey, bgShade: 700 as Shade, bgOpacity: 100, textColor: 'white' as PaletteKey, textShade: 500 as Shade, textOpacity: 100 },
      { name: 'Info',    icon: 'ℹ️', bgColor: 'gray'    as PaletteKey, bgShade: 800 as Shade, bgOpacity: 100, textColor: 'white' as PaletteKey, textShade: 500 as Shade, textOpacity: 100 },
    ],
  },
  tab: {
    styles: [
      { type: 'line',    label: 'Line',    fontSize: 14, paddingX: 16, paddingY: 10, borderRadius: 8,
        activeColor: 'primary' as PaletteKey, activeShade: 500 as Shade, activeBgColor: null as PaletteKey|null, activeBgShade: 100 as Shade,
        inactiveColor: 'gray' as PaletteKey, inactiveShade: 400 as Shade,
        trackColor: 'gray' as PaletteKey, trackShade: 200 as Shade },
      { type: 'pill',    label: 'Pill',    fontSize: 14, paddingX: 16, paddingY: 10, borderRadius: 99,
        activeColor: 'primary' as PaletteKey, activeShade: 500 as Shade, activeBgColor: 'primary' as PaletteKey, activeBgShade: 100 as Shade,
        inactiveColor: 'gray' as PaletteKey, inactiveShade: 400 as Shade,
        trackColor: null as PaletteKey|null, trackShade: 200 as Shade },
      { type: 'box',     label: 'Box',     fontSize: 14, paddingX: 16, paddingY: 10, borderRadius: 8,
        activeColor: 'primary' as PaletteKey, activeShade: 500 as Shade, activeBgColor: null as PaletteKey|null, activeBgShade: 100 as Shade,
        inactiveColor: 'gray' as PaletteKey, inactiveShade: 400 as Shade,
        trackColor: 'gray' as PaletteKey, trackShade: 100 as Shade },
      { type: 'segment', label: 'Segment', fontSize: 14, paddingX: 16, paddingY: 10, borderRadius: 8,
        activeColor: 'primary' as PaletteKey, activeShade: 500 as Shade, activeBgColor: null as PaletteKey|null, activeBgShade: 100 as Shade,
        inactiveColor: 'gray' as PaletteKey, inactiveShade: 400 as Shade,
        trackColor: 'gray' as PaletteKey, trackShade: 200 as Shade },
    ],
  },
  avatar:     { sizeS: 32,         sizeM: 40,   sizeL: 48,    sizeXL: 64, bgColor: 'primary' as PaletteKey, bgShade: 400 as Shade, textColor: 'white' as PaletteKey, textShade: 500 as Shade },
  tooltip:    { borderRadius: 6,   paddingX: 10, paddingY: 6,  fontSize: 12 },
  spinner:    { sizeS: 16,         sizeM: 24,   sizeL: 32,    strokeWidth: 2, activeColor: 'primary' as PaletteKey, activeShade: 500 as Shade, bgColor: 'gray' as PaletteKey, bgShade: 200 as Shade },
  skeleton:   { borderRadius: 8,   height: 16 },
  progress:   { borderRadius: 100, height: 8 },
  pagination: { borderRadius: 8, size: 36, fontSize: 14, gap: 4, showFirstLast: true,
    activeColor: 'white' as PaletteKey, activeShade: 500 as Shade,
    activeBgColor: 'primary' as PaletteKey, activeBgShade: 500 as Shade,
    inactiveColor: 'gray' as PaletteKey, inactiveShade: 700 as Shade,
    borderColor: 'gray' as PaletteKey, borderShade: 200 as Shade,
  },
  divider:    { height: 1,         color: 'gray' as PaletteKey, colorShade: 200 as Shade },
};

type GroupType = 'bg' | 'border';

interface DSStore {
  semanticList: SemanticItem[];
  palettes: Record<PaletteKey, Palette>;
  bgGroup: GroupColor[];
  borderGroup: GroupColor[];
  components: typeof defaultComponents;

  // 시맨틱 컬러 액션
  setSemanticBase: (id: string, hex: string) => void;
  setSemanticSwatch: (id: string, shade: Shade, hex: string) => void;
  autoGenerateSemantic: (id: string) => void;
  setSemanticLabel: (id: string, label: string) => void;
  setSemanticEmoji: (id: string, emoji: string) => void;
  addSemantic: () => void;
  removeSemantic: (id: string) => void;
  reorderSemantic: (fromId: string, toId: string) => void;

  // 베이스 팔레트 액션
  setBase: (key: PaletteKey, hex: string) => void;
  setSwatchColor: (key: PaletteKey, shade: Shade, hex: string) => void;
  autoGenerate: (key: PaletteKey) => void;

  // BG / Border 그룹 액션
  setGroupColor: (group: GroupType, idx: number, hex: string) => void;
  setGroupLabel: (group: GroupType, idx: number, label: string) => void;
  addGroupColor: (group: GroupType) => void;
  removeGroupColor: (group: GroupType, idx: number) => void;

  updateComponent: (compKey: string, patch: Record<string, unknown>) => void;
  getColor: (palKey: PaletteKey | null | undefined, shade: Shade) => string;
  exportJSON: () => DesignSystemData;

  // 프리셋
  presets: Array<{ id: string; name: string; createdAt: string; components: typeof defaultComponents }>;
  savePreset: (name: string) => void;
  loadPreset: (id: string) => void;
  deletePreset: (id: string) => void;
  renamePreset: (id: string, name: string) => void;

  // 디자인 세트 (편집 컨텍스트)
  currentSetId: string | null;
  currentSetName: string;
  startNewSet: (name: string) => void;
  openSet: (data: FullPresetData) => void;
  saveCurrentSet: (name?: string) => string;
}

interface FullPresetData {
  preset?: { id?: string; name?: string };
  palettes?: Record<string, Record<string, string>>;
  semanticList?: SemanticItem[];
  bgGroup?: GroupColor[];
  borderGroup?: GroupColor[];
  components?: Record<string, unknown>;
  pluginComponents?: Record<string, unknown>;
}

const ALL_KEYS = Object.keys(PALETTE_DEFAULTS) as PaletteKey[];

export const useDS = create<DSStore>()(
  persist(
    (set, get) => ({
      semanticList: DEFAULT_SEMANTIC_LIST,
      palettes: Object.fromEntries(ALL_KEYS.map((k) => [k, makePalette(k)])) as Record<PaletteKey, Palette>,
      bgGroup: DEFAULT_BG_GROUP,
      borderGroup: DEFAULT_BORDER_GROUP,
      components: defaultComponents,

      setSemanticBase: (id, hex) =>
        set((s) => ({
          semanticList: s.semanticList.map((item) =>
            item.id === id ? { ...item, base: hex } : item
          ),
        })),

      setSemanticSwatch: (id, shade, hex) =>
        set((s) => ({
          semanticList: s.semanticList.map((item) =>
            item.id === id ? { ...item, scale: { ...item.scale, [shade]: hex } } : item
          ),
        })),

      autoGenerateSemantic: (id) =>
        set((s) => ({
          semanticList: s.semanticList.map((item) =>
            item.id === id ? { ...item, scale: generateScale(item.base) } : item
          ),
        })),

      setSemanticLabel: (id, label) =>
        set((s) => ({
          semanticList: s.semanticList.map((item) => item.id === id ? { ...item, label } : item),
        })),

      setSemanticEmoji: (id, emoji) =>
        set((s) => ({
          semanticList: s.semanticList.map((item) => item.id === id ? { ...item, emoji } : item),
        })),

      addSemantic: () =>
        set((s) => {
          const newId = `custom-${Date.now()}`;
          const FIXED_BOTTOM = ['info', 'success', 'error', 'warning'];
          const insertIdx = s.semanticList.findIndex((item) => FIXED_BOTTOM.includes(item.id));
          const pos = insertIdx === -1 ? s.semanticList.length : insertIdx;
          const dynamicCount = s.semanticList.filter((item) => !['primary', ...FIXED_BOTTOM].includes(item.id)).length;
          const newItem: SemanticItem = { id: newId, label: `Custom ${dynamicCount + 1}`, emoji: '🎨', base: '#6366f1', scale: generateScale('#6366f1') };
          const next = [...s.semanticList];
          next.splice(pos, 0, newItem);
          return { semanticList: next };
        }),

      removeSemantic: (id) => {
        const FIXED = ['primary', 'info', 'success', 'error', 'warning'];
        if (FIXED.includes(id)) return;
        set((s) => ({ semanticList: s.semanticList.filter((item) => item.id !== id) }));
      },

      reorderSemantic: (fromId: string, toId: string) =>
        set((s) => {
          const FIXED = ['primary', 'info', 'success', 'error', 'warning'];
          if (FIXED.includes(fromId) || FIXED.includes(toId)) return s;
          const list = [...s.semanticList];
          const fromIdx = list.findIndex((i) => i.id === fromId);
          const toIdx = list.findIndex((i) => i.id === toId);
          if (fromIdx === -1 || toIdx === -1) return s;
          const [moved] = list.splice(fromIdx, 1);
          list.splice(toIdx, 0, moved);
          return { semanticList: list };
        }),

      setBase: (key, hex) =>
        set((s) => ({ palettes: { ...s.palettes, [key]: { ...s.palettes[key], base: hex } } })),

      setSwatchColor: (key, shade, hex) =>
        set((s) => ({
          palettes: { ...s.palettes, [key]: { ...s.palettes[key], scale: { ...s.palettes[key].scale, [shade]: hex } } },
        })),

      autoGenerate: (key) =>
        set((s) => ({
          palettes: { ...s.palettes, [key]: { ...s.palettes[key], scale: generateScale(s.palettes[key].base) } },
        })),

      setGroupColor: (group, idx, hex) =>
        set((s) => ({
          [`${group}Group`]: s[`${group}Group`].map((c, i) => i === idx ? { ...c, hex } : c),
        })),

      setGroupLabel: (group, idx, label) =>
        set((s) => ({
          [`${group}Group`]: s[`${group}Group`].map((c, i) => i === idx ? { ...c, label } : c),
        })),

      addGroupColor: (group) =>
        set((s) => {
          const arr = s[`${group}Group`];
          const n = arr.length + 1;
          return {
            [`${group}Group`]: [...arr, { label: `${group === 'bg' ? 'BG' : 'Border'} ${n}`, hex: group === 'bg' ? '#ffffff' : '#e2e8f0' }],
          };
        }),

      removeGroupColor: (group, idx) =>
        set((s) => {
          const prefix = group === 'bg' ? 'BG' : 'Border';
          const filtered = s[`${group}Group`].filter((_, i) => i !== idx);
          // 번호 패턴("BG N", "Border N")인 항목은 순서대로 재번호
          const renumbered = filtered.map((c, i) => ({
            ...c,
            label: /^(BG|Border) \d+$/.test(c.label) ? `${prefix} ${i + 1}` : c.label,
          }));
          return { [`${group}Group`]: renumbered };
        }),

      updateComponent: (compKey, patch) =>
        set((s) => ({
          components: { ...s.components, [compKey]: { ...(s.components as Record<string, unknown>)[compKey] as object, ...patch } },
        })),

      presets: [],
      savePreset: (name) => {
        const s = get();
        const id = Date.now().toString();
        const createdAt = new Date().toISOString();
        const components = JSON.parse(JSON.stringify(s.components));
        const palettes: Record<string, Record<string, string>> = {};
        Object.entries(s.palettes).forEach(([k, pal]) => {
          palettes[k] = Object.fromEntries(Object.entries(pal.scale).map(([sh, hex]) => [sh, hex as string]));
        });
        set((prev) => ({
          presets: [...prev.presets, { id, name, createdAt, components }],
        }));
        fetch('/api/presets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            designYu: true, version: '1',
            preset: { id, name, createdAt },
            palettes, components,
            semanticList: s.semanticList,
            bgGroup: s.bgGroup,
            borderGroup: s.borderGroup,
          }),
        }).catch(() => {});
      },
      loadPreset: (id) =>
        set((s) => {
          const preset = s.presets.find((p) => p.id === id);
          return preset ? { components: preset.components } : {};
        }),
      deletePreset: (id) => {
        set((s) => ({ presets: s.presets.filter((p) => p.id !== id) }));
        fetch(`/api/presets/${id}`, { method: 'DELETE' }).catch(() => {});
      },
      renamePreset: (id, name) => {
        set((s) => ({ presets: s.presets.map((p) => p.id === id ? { ...p, name } : p) }));
        fetch(`/api/presets/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ preset: { name } }),
        }).catch(() => {});
      },

      currentSetId: null,
      currentSetName: '',

      startNewSet: (name) =>
        set({
          semanticList: JSON.parse(JSON.stringify(DEFAULT_SEMANTIC_LIST)),
          palettes: Object.fromEntries(ALL_KEYS.map((k) => [k, makePalette(k)])) as Record<PaletteKey, Palette>,
          bgGroup: JSON.parse(JSON.stringify(DEFAULT_BG_GROUP)),
          borderGroup: JSON.parse(JSON.stringify(DEFAULT_BORDER_GROUP)),
          components: JSON.parse(JSON.stringify(defaultComponents)),
          currentSetId: null,
          currentSetName: name,
        }),

      openSet: (data) =>
        set((s) => {
          const next: Partial<DSStore> = {
            currentSetId: data.preset?.id ?? null,
            currentSetName: data.preset?.name ?? '',
          };
          if (data.palettes) {
            const pals = { ...s.palettes };
            Object.entries(data.palettes).forEach(([k, scale]) => {
              if (!(k in pals)) return;
              const sc = scale as Record<string, string>;
              pals[k as PaletteKey] = { base: sc['500'] ?? pals[k as PaletteKey].base, scale: sc as unknown as Record<Shade, string> };
            });
            next.palettes = pals;
          }
          if (data.semanticList) next.semanticList = data.semanticList;
          if (data.bgGroup) next.bgGroup = data.bgGroup;
          if (data.borderGroup) next.borderGroup = data.borderGroup;
          const comps = data.pluginComponents ?? data.components;
          if (comps) next.components = comps as typeof defaultComponents;
          return next;
        }),

      saveCurrentSet: (name) => {
        const s = get();
        const id = s.currentSetId ?? Date.now().toString();
        const nm = (name ?? s.currentSetName).trim() || `디자인 세트 ${s.presets.length + 1}`;
        const createdAt = new Date().toISOString();
        const components = JSON.parse(JSON.stringify(s.components));
        const palettes: Record<string, Record<string, string>> = {};
        Object.entries(s.palettes).forEach(([k, pal]) => {
          palettes[k] = Object.fromEntries(Object.entries(pal.scale).map(([sh, hex]) => [sh, hex as string]));
        });
        set((prev) => {
          const exists = prev.presets.some((p) => p.id === id);
          const presets = exists
            ? prev.presets.map((p) => (p.id === id ? { ...p, name: nm, components } : p))
            : [...prev.presets, { id, name: nm, createdAt, components }];
          return { presets, currentSetId: id, currentSetName: nm };
        });
        fetch('/api/presets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            designYu: true, version: '1',
            preset: { id, name: nm, createdAt, updatedAt: createdAt },
            palettes, components,
            semanticList: s.semanticList,
            bgGroup: s.bgGroup,
            borderGroup: s.borderGroup,
          }),
        }).catch(() => {});
        return id;
      },

      getColor: (palKey, shade) => {
        if (!palKey) return 'transparent';
        return get().palettes[palKey]?.scale?.[shade] ?? get().palettes[palKey]?.base ?? '#cccccc';
      },

      exportJSON: () => ({
        semanticList: get().semanticList,
        palettes: get().palettes,
        bgGroup: get().bgGroup,
        borderGroup: get().borderGroup,
        components: get().components,
      }),
    }),
    { name: 'design-yu-store-v28' }
  )
);
