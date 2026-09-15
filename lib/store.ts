import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateScale } from './colorUtils';
import type { Palette, PaletteKey, Shade, SemanticItem, DesignSystemData, InputSet, BaseColorItem } from './types';

// 파로스/스텔라 컬러 시스템 (Figma: PHAROS 제품 디자인 > 24526:82154) 기준 값
const PALETTE_DEFAULTS: Record<PaletteKey, string> = {
  primary:   '#003879',
  secondary: '#8b5cf6',
  info:      '#0ea5e9',
  success:   '#10b981',
  error:    '#ef4444',
  warning:   '#f59e0b',
  white:     '#ffffff',
  black:     '#000000',
  gray:      '#888888',
  slate:     '#9198b3',
  blue:      '#82a3ff',
  sky:       '#3b93e8',
  red:       '#ff2828',
  orange:    '#ff8500',
  green:     '#33c481',
  mint:      '#1fb2a9',
};

const TAILWIND_SCALES: Partial<Record<PaletteKey, Record<Shade, string>>> = {
  white: { 50:'#ffffff', 100:'#ffffff', 200:'#ffffff', 300:'#ffffff', 400:'#ffffff', 500:'#ffffff', 600:'#ffffff', 700:'#ffffff', 800:'#ffffff', 900:'#ffffff' },
  black: { 50:'#000000', 100:'#000000', 200:'#000000', 300:'#000000', 400:'#000000', 500:'#000000', 600:'#000000', 700:'#000000', 800:'#000000', 900:'#000000' },
  primary: { 50:'#e8eff9', 100:'#e8eff9', 200:'#c6d6eb', 300:'#9bb6d6', 400:'#6690c0', 500:'#3a6ba5', 600:'#1d5090', 700:'#003879', 800:'#002c5f', 900:'#001e42' },
  gray:    { 50:'#fbfbfb', 100:'#f5f5f5', 200:'#e4e4e4', 300:'#cccccc', 400:'#aaaaaa', 500:'#888888', 600:'#666666', 700:'#444444', 800:'#222222', 900:'#111111' },
  slate:   { 50:'#f8f9fb', 100:'#f1f2f5', 200:'#e1e5ea', 300:'#d3d6e1', 400:'#b1b6cb', 500:'#9198b3', 600:'#656e95', 700:'#4c5476', 800:'#353b55', 900:'#222739' },
  blue:    { 50:'#f8f9ff', 100:'#ecf1ff', 200:'#e6ecff', 300:'#cfdaff', 400:'#a8c1ff', 500:'#82a3ff', 600:'#376cfb', 700:'#2854d2', 800:'#1d3ea6', 900:'#142b78' },
  sky:     { 50:'#edf6ff', 100:'#e3f2fd', 200:'#bfdfff', 300:'#94caff', 400:'#63aef5', 500:'#3b93e8', 600:'#2178ce', 700:'#155fa8', 800:'#0d4780', 900:'#083055' },
  red:     { 50:'#ffebeb', 100:'#ffd4d4', 200:'#ffbcbc', 300:'#ffa3a3', 400:'#ff6b6b', 500:'#ff2828', 600:'#e51b1b', 700:'#c21414', 800:'#9b0f0f', 900:'#700b0b' },
  orange:  { 50:'#fff4e5', 100:'#ffe4c2', 200:'#ffce94', 300:'#ffb35c', 400:'#ff9c2e', 500:'#ff8500', 600:'#e06f00', 700:'#b85a00', 800:'#8f4600', 900:'#663200' },
  green:   { 50:'#ecf9f3', 100:'#d4f2e3', 200:'#a8e6c7', 300:'#79d0a1', 400:'#51cd8f', 500:'#33c481', 600:'#27a566', 700:'#1d8652', 800:'#15663e', 900:'#0e492c' },
  mint:    { 50:'#e3fffd', 100:'#c9f7f3', 200:'#a3ede7', 300:'#75ded6', 400:'#41c9c0', 500:'#1fb2a9', 600:'#159690', 700:'#0f7a75', 800:'#0a5d59', 900:'#06423f' },
};

// 피그마 각 셀 하단의 사용처 캡션 ("new" = 아직 미사용, 그 외는 실제 사용되는 토큰/위치명)
const TAILWIND_TAGS: Partial<Record<PaletteKey, Partial<Record<Shade, string>>>> = {
  primary: { 50:'new', 100:'new', 200:'new', 300:'new', 400:'new', 500:'new', 600:'new', 700:'main', 800:'new', 900:'new' },
  gray:   { 50:'일반이체 bg', 100:'new', 200:'border2', 300:'border3', 400:'icoColor', 500:'black3', 600:'black6', 700:'black4', 800:'default', 900:'black1' },
  slate:  { 50:'new', 100:'bg', 200:'border', 300:'grid-bg5', 400:'new', 500:'grid-bg6', 600:'grid-bg7', 700:'new', 800:'new', 900:'new' },
  blue:   { 50:'grid-bg10', 100:'grid-bg9', 200:'blue2', 300:'new', 400:'new', 500:'blue', 600:'primary2', 700:'new', 800:'new', 900:'new' },
  sky:    { 50:'hover', 100:'.cell-proc-qty', 200:'active', 300:'new', 400:'new', 500:'new', 600:'primary2', 700:'new', 800:'new', 900:'new' },
  red:    { 50:'grid-bg13', 100:'new', 200:'red2 · grid-bg1', 300:'grid-bg12', 400:'new', 500:'red', 600:'new', 700:'new', 800:'new', 900:'new' },
  orange: { 50:'new', 100:'new', 200:'new', 300:'new', 400:'new', 500:'로고', 600:'new', 700:'new', 800:'new', 900:'new' },
  green:  { 50:'new', 100:'new', 200:'new', 300:'grid-bg3', 400:'new', 500:'green', 600:'new', 700:'new', 800:'new', 900:'new' },
  mint:   { 50:'grid-bg8', 100:'new', 200:'new', 300:'new', 400:'new', 500:'new', 600:'new', 700:'new', 800:'new', 900:'new' },
};

function makePalette(key: PaletteKey): Palette {
  const base = PALETTE_DEFAULTS[key];
  const preset = TAILWIND_SCALES[key];
  const tags = TAILWIND_TAGS[key];
  return { base, scale: preset ?? generateScale(base), ...(tags ? { tags } : {}) };
}

const DEFAULT_SEMANTIC_LIST: SemanticItem[] = [
  { id: 'primary',   label: 'Primary',   emoji: '🔵', base: '#003879', scale: { 50:'#e8eff9', 100:'#e8eff9', 200:'#c6d6eb', 300:'#9bb6d6', 400:'#6690c0', 500:'#3a6ba5', 600:'#1d5090', 700:'#003879', 800:'#002c5f', 900:'#001e42' } },
  { id: 'secondary', label: 'Secondary', emoji: '🟣', base: '#8b5cf6', scale: { 50:'#f5f3ff', 100:'#ede9fe', 200:'#ddd6fe', 300:'#c4b5fd', 400:'#a78bfa', 500:'#8b5cf6', 600:'#7c3aed', 700:'#6d28d9', 800:'#5b21b6', 900:'#4c1d95' } },
  { id: 'info',      label: 'Info',      emoji: 'ℹ️', base: '#0ea5e9', scale: { 50:'#f0f9ff', 100:'#e0f2fe', 200:'#bae6fd', 300:'#7dd3fc', 400:'#38bdf8', 500:'#0ea5e9', 600:'#0284c7', 700:'#0369a1', 800:'#075985', 900:'#0c4a6e' } },
  { id: 'success',   label: 'Success',   emoji: '✅', base: '#10b981', scale: { 50:'#ecfdf5', 100:'#d1fae5', 200:'#a7f3d0', 300:'#6ee7b7', 400:'#34d399', 500:'#10b981', 600:'#059669', 700:'#047857', 800:'#065f46', 900:'#064e3b' } },
  { id: 'error',    label: 'Error',     emoji: '🔴', base: '#ef4444', scale: { 50:'#fef2f2', 100:'#fee2e2', 200:'#fecaca', 300:'#fca5a5', 400:'#f87171', 500:'#ef4444', 600:'#dc2626', 700:'#b91c1c', 800:'#991b1b', 900:'#7f1d1d' } },
  { id: 'warning',   label: 'Warning',   emoji: '⚠️', base: '#f59e0b', scale: { 50:'#fffbeb', 100:'#fef3c7', 200:'#fde68a', 300:'#fcd34d', 400:'#fbbf24', 500:'#f59e0b', 600:'#d97706', 700:'#b45309', 800:'#92400e', 900:'#78350f' } },
];

const DEFAULT_BASE_COLOR_LIST: BaseColorItem[] = [
  { key: 'white',  label: 'White'  },
  { key: 'black',  label: 'Black'  },
  { key: 'gray',   label: 'Gray'   },
  { key: 'slate',  label: 'Slate'  },
  { key: 'blue',   label: 'Blue'   },
  { key: 'sky',    label: 'Sky'    },
  { key: 'red',    label: 'Red'    },
  { key: 'orange', label: 'Orange' },
  { key: 'green',  label: 'Green'  },
  { key: 'mint',   label: 'Mint'   },
];

const defaultComponents = {
  button: { borderRadius: 4,
    sizes: [ { name: 'S', h: 24, px: 8, py: 0, fs: 12 }, { name: 'M', h: 32, px: 12, py: 0, fs: 14 }, { name: 'L', h: 40, px: 16, py: 0, fs: 16 } ],
    variants: {
      Primary:   { default: { bgColor: 'primary' as PaletteKey, bgShade: 500 as Shade, bgOpacity: 100, borderColor: null, borderShade: 500 as Shade, borderOpacity: 100, textColor: 'white' as PaletteKey, textShade: 500 as Shade, textOpacity: 100 }, hover: { bgColor: 'primary' as PaletteKey, bgShade: 600 as Shade, bgOpacity: 100, borderColor: null, borderShade: 500 as Shade, borderOpacity: 100, textColor: 'white' as PaletteKey, textShade: 500 as Shade, textOpacity: 100 }, active: { bgColor: 'primary' as PaletteKey, bgShade: 700 as Shade, bgOpacity: 100, borderColor: null, borderShade: 500 as Shade, borderOpacity: 100, textColor: 'white' as PaletteKey, textShade: 500 as Shade, textOpacity: 100 }, disabled: { bgColor: 'gray' as PaletteKey, bgShade: 200 as Shade, bgOpacity: 100, borderColor: null, borderShade: 500 as Shade, borderOpacity: 100, textColor: 'gray' as PaletteKey, textShade: 400 as Shade, textOpacity: 100 } },
      Secondary: { default: { bgColor: null, bgShade: 500 as Shade, bgOpacity: 100, borderColor: 'primary' as PaletteKey, borderShade: 500 as Shade, borderOpacity: 100, textColor: 'primary' as PaletteKey, textShade: 500 as Shade, textOpacity: 100 }, hover: { bgColor: 'primary' as PaletteKey, bgShade: 100 as Shade, bgOpacity: 100, borderColor: 'primary' as PaletteKey, borderShade: 500 as Shade, borderOpacity: 100, textColor: 'primary' as PaletteKey, textShade: 500 as Shade, textOpacity: 100 }, active: { bgColor: 'primary' as PaletteKey, bgShade: 200 as Shade, bgOpacity: 100, borderColor: 'primary' as PaletteKey, borderShade: 600 as Shade, borderOpacity: 100, textColor: 'primary' as PaletteKey, textShade: 600 as Shade, textOpacity: 100 }, disabled: { bgColor: null, bgShade: 500 as Shade, bgOpacity: 100, borderColor: 'gray' as PaletteKey, borderShade: 200 as Shade, borderOpacity: 100, textColor: 'gray' as PaletteKey, textShade: 400 as Shade, textOpacity: 100 } },
      Ghost:     { default: { bgColor: null, bgShade: 500 as Shade, bgOpacity: 100, borderColor: null, borderShade: 500 as Shade, borderOpacity: 100, textColor: 'primary' as PaletteKey, textShade: 500 as Shade, textOpacity: 100 }, hover: { bgColor: 'primary' as PaletteKey, bgShade: 100 as Shade, bgOpacity: 100, borderColor: null, borderShade: 500 as Shade, borderOpacity: 100, textColor: 'primary' as PaletteKey, textShade: 500 as Shade, textOpacity: 100 }, active: { bgColor: 'primary' as PaletteKey, bgShade: 200 as Shade, bgOpacity: 100, borderColor: null, borderShade: 500 as Shade, borderOpacity: 100, textColor: 'primary' as PaletteKey, textShade: 600 as Shade, textOpacity: 100 }, disabled: { bgColor: null, bgShade: 500 as Shade, bgOpacity: 100, borderColor: null, borderShade: 500 as Shade, borderOpacity: 100, textColor: 'gray' as PaletteKey, textShade: 400 as Shade, textOpacity: 100 } },
      Error:     { default: { bgColor: 'error' as PaletteKey, bgShade: 500 as Shade, bgOpacity: 100, borderColor: null, borderShade: 500 as Shade, borderOpacity: 100, textColor: 'white' as PaletteKey, textShade: 500 as Shade, textOpacity: 100 }, hover: { bgColor: 'error' as PaletteKey, bgShade: 600 as Shade, bgOpacity: 100, borderColor: null, borderShade: 500 as Shade, borderOpacity: 100, textColor: 'white' as PaletteKey, textShade: 500 as Shade, textOpacity: 100 }, active: { bgColor: 'error' as PaletteKey, bgShade: 700 as Shade, bgOpacity: 100, borderColor: null, borderShade: 500 as Shade, borderOpacity: 100, textColor: 'white' as PaletteKey, textShade: 500 as Shade, textOpacity: 100 }, disabled: { bgColor: 'gray' as PaletteKey, bgShade: 200 as Shade, bgOpacity: 100, borderColor: null, borderShade: 500 as Shade, borderOpacity: 100, textColor: 'gray' as PaletteKey, textShade: 400 as Shade, textOpacity: 100 } },
    },
  },
  input: { sets: [
    { name: 'Default', height: 40, paddingX: 12, fontSize: 14, borderRadius: 4,
      defaultBgColor: 'white' as PaletteKey,   defaultBgShade: 500 as Shade, defaultBgOpacity: 100, borderColor: 'gray'    as PaletteKey, borderShade: 300 as Shade, borderOpacity: 100, defaultTextColor: 'gray'  as PaletteKey, defaultTextShade: 900 as Shade, defaultTextOpacity: 100,
      focusBgColor:   'white' as PaletteKey,   focusBgShade:   500 as Shade, focusBgOpacity:   100, focusColor:  'primary' as PaletteKey, focusShade:  500 as Shade, focusOpacity:  100, focusTextColor:   'gray'  as PaletteKey, focusTextShade:   900 as Shade, focusTextOpacity:   100,
      errorBgColor:   'white' as PaletteKey,   errorBgShade:   500 as Shade, errorBgOpacity:   100, errorColor:  'error'   as PaletteKey, errorShade:  500 as Shade, errorOpacity:  100, errorTextColor:   'gray'  as PaletteKey, errorTextShade:   900 as Shade, errorTextOpacity:   100,
      disabledBgColor:'gray'  as PaletteKey,   disabledBgShade:100 as Shade, disabledBgOpacity:100, disabledColor:'gray'   as PaletteKey, disabledShade:200 as Shade, disabledOpacity:100, disabledTextColor:'gray' as PaletteKey, disabledTextShade:400 as Shade, disabledTextOpacity:100,
      readonlyBgColor:'gray'  as PaletteKey,   readonlyBgShade:100 as Shade, readonlyBgOpacity:100, readonlyColor:'gray'   as PaletteKey, readonlyShade:300 as Shade, readonlyOpacity:100, readonlyTextColor:'gray' as PaletteKey, readonlyTextShade:500 as Shade, readonlyTextOpacity:100,
    },
  ] as InputSet[] },
  textarea:   { borderRadius: 4,   height: 96,  paddingX: 12, paddingY: 10, fontSize: 14, borderColor: 'gray' as PaletteKey, borderShade: 300 as Shade, required: false, showCharCount: false, maxChars: 100 },
  select: {
    borderRadius: 4, height: 40, paddingX: 12, fontSize: 14,
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
  badge:      { borderRadius: 4, paddingX: 8,  paddingY: 3,  fontSize: 12,
    variants: [
      { name: 'Primary', bgColor: 'primary', bgShade: 100, bgOpacity: 100, textColor: 'primary', textShade: 700, textOpacity: 100 },
      { name: 'Success', bgColor: 'success', bgShade: 100, bgOpacity: 100, textColor: 'success', textShade: 700, textOpacity: 100 },
      { name: 'Warning', bgColor: 'warning', bgShade: 100, bgOpacity: 100, textColor: 'warning', textShade: 700, textOpacity: 100 },
      { name: 'Error',   bgColor: 'error',   bgShade: 100, bgOpacity: 100, textColor: 'error',   textShade: 700, textOpacity: 100 },
      { name: 'Neutral', bgColor: 'gray',    bgShade: 100, bgOpacity: 100, textColor: 'gray',    textShade: 700, textOpacity: 100 },
    ],
  },
  chip:       { borderRadius: 4, paddingX: 12, paddingY: 6,  fontSize: 13,
    variants: [
      { name: '디자인', bgColor: 'primary' as PaletteKey, bgShade: 100 as Shade, bgOpacity: 100, textColor: 'primary' as PaletteKey, textShade: 700 as Shade, textOpacity: 100, borderColor: 'primary' as PaletteKey, borderShade: 200 as Shade },
      { name: '개발',   bgColor: 'success' as PaletteKey, bgShade: 100 as Shade, bgOpacity: 100, textColor: 'success' as PaletteKey, textShade: 700 as Shade, textOpacity: 100, borderColor: 'success' as PaletteKey, borderShade: 200 as Shade },
      { name: '기획',   bgColor: 'warning' as PaletteKey, bgShade: 100 as Shade, bgOpacity: 100, textColor: 'warning' as PaletteKey, textShade: 700 as Shade, textOpacity: 100, borderColor: 'warning' as PaletteKey, borderShade: 200 as Shade },
      { name: '마케팅', bgColor: 'error'   as PaletteKey, bgShade: 100 as Shade, bgOpacity: 100, textColor: 'error'   as PaletteKey, textShade: 700 as Shade, textOpacity: 100, borderColor: 'error'   as PaletteKey, borderShade: 200 as Shade },
    ],
  },
  card:       { borderRadius: 4,  paddingX: 20, paddingY: 20, gap: 12, shadowOpacity: 8, titleFontSize: 16, bodyFontSize: 13, btnVariant: 'Primary' },
  alert:      { borderRadius: 4,   paddingX: 16, paddingY: 14, fontSize: 14 },
  toast:      { borderRadius: 4,  paddingX: 16, paddingY: 14, fontSize: 14,
    variants: [
      { name: 'Success', icon: '✅', bgColor: 'success' as PaletteKey, bgShade: 800 as Shade, bgOpacity: 100, textColor: 'white' as PaletteKey, textShade: 500 as Shade, textOpacity: 100 },
      { name: 'Error',   icon: '❌', bgColor: 'error'   as PaletteKey, bgShade: 700 as Shade, bgOpacity: 100, textColor: 'white' as PaletteKey, textShade: 500 as Shade, textOpacity: 100 },
      { name: 'Info',    icon: 'ℹ️', bgColor: 'gray'    as PaletteKey, bgShade: 800 as Shade, bgOpacity: 100, textColor: 'white' as PaletteKey, textShade: 500 as Shade, textOpacity: 100 },
    ],
  },
  tab: {
    styles: [
      { type: 'line',    label: 'Line',    fontSize: 14, paddingX: 16, paddingY: 10, borderRadius: 4,
        activeColor: 'primary' as PaletteKey, activeShade: 500 as Shade, activeBgColor: null as PaletteKey|null, activeBgShade: 100 as Shade,
        inactiveColor: 'gray' as PaletteKey, inactiveShade: 400 as Shade,
        trackColor: 'gray' as PaletteKey, trackShade: 200 as Shade },
      { type: 'pill',    label: 'Pill',    fontSize: 14, paddingX: 16, paddingY: 10, borderRadius: 4,
        activeColor: 'primary' as PaletteKey, activeShade: 500 as Shade, activeBgColor: 'primary' as PaletteKey, activeBgShade: 100 as Shade,
        inactiveColor: 'gray' as PaletteKey, inactiveShade: 400 as Shade,
        trackColor: null as PaletteKey|null, trackShade: 200 as Shade },
      { type: 'box',     label: 'Box',     fontSize: 14, paddingX: 16, paddingY: 10, borderRadius: 4,
        activeColor: 'primary' as PaletteKey, activeShade: 500 as Shade, activeBgColor: null as PaletteKey|null, activeBgShade: 100 as Shade,
        inactiveColor: 'gray' as PaletteKey, inactiveShade: 400 as Shade,
        trackColor: 'gray' as PaletteKey, trackShade: 100 as Shade },
      { type: 'segment', label: 'Segment', fontSize: 14, paddingX: 16, paddingY: 10, borderRadius: 4,
        activeColor: 'primary' as PaletteKey, activeShade: 500 as Shade, activeBgColor: null as PaletteKey|null, activeBgShade: 100 as Shade,
        inactiveColor: 'gray' as PaletteKey, inactiveShade: 400 as Shade,
        trackColor: 'gray' as PaletteKey, trackShade: 200 as Shade },
    ],
  },
  avatar:     { sizeS: 32,         sizeM: 40,   sizeL: 48,    sizeXL: 64, bgColor: 'primary' as PaletteKey, bgShade: 400 as Shade, textColor: 'white' as PaletteKey, textShade: 500 as Shade },
  tooltip:    { borderRadius: 4,   paddingX: 10, paddingY: 6,  fontSize: 12 },
  spinner:    { sizeS: 16,         sizeM: 24,   sizeL: 32,    strokeWidth: 2, activeColor: 'primary' as PaletteKey, activeShade: 500 as Shade, bgColor: 'gray' as PaletteKey, bgShade: 200 as Shade },
  skeleton:   { borderRadius: 4,   height: 16 },
  progress:   { borderRadius: 4, height: 8 },
  pagination: { borderRadius: 4, size: 36, fontSize: 14, gap: 4, showFirstLast: true,
    activeColor: 'white' as PaletteKey, activeShade: 500 as Shade,
    activeBgColor: 'primary' as PaletteKey, activeBgShade: 500 as Shade,
    inactiveColor: 'gray' as PaletteKey, inactiveShade: 700 as Shade,
    borderColor: 'gray' as PaletteKey, borderShade: 200 as Shade,
  },
  divider:    { height: 1,         color: 'gray' as PaletteKey, colorShade: 200 as Shade },
};

interface DSStore {
  semanticList: SemanticItem[];
  palettes: Record<PaletteKey, Palette>;
  baseColorList: BaseColorItem[];
  statusColorsEnabled: boolean;
  components: typeof defaultComponents;

  // 시맨틱 컬러 액션
  setSemanticBase: (id: string, hex: string) => void;
  setSemanticSwatch: (id: string, shade: Shade, hex: string) => void;
  autoGenerateSemantic: (id: string) => void;
  setSemanticLabel: (id: string, label: string) => void;
  setSemanticEmoji: (id: string, emoji: string) => void;
  addSemantic: () => void;
  removeSemantic: (id: string) => void;
  reorderSemantic: (fromId: string, toId: string, position?: 'before' | 'after') => void;
  convertSemanticToBase: (id: string, targetKey?: string, position?: 'before' | 'after') => void;

  // 베이스 팔레트 액션
  setBase: (key: PaletteKey, hex: string) => void;
  setSwatchColor: (key: PaletteKey, shade: Shade, hex: string) => void;
  autoGenerate: (key: PaletteKey) => void;
  setBaseLabel: (key: string, label: string) => void;
  addBaseColor: () => void;
  removeBaseColor: (key: string) => void;
  resetBaseColors: () => void;
  reorderBaseColors: (fromKey: string, toKey: string, position?: 'before' | 'after') => void;
  convertBaseToSemantic: (key: string, targetId?: string, position?: 'before' | 'after') => void;
  setStatusColorsEnabled: (v: boolean) => void;

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
  baseColorList?: BaseColorItem[];
  components?: Record<string, unknown>;
  pluginComponents?: Record<string, unknown>;
}

const ALL_KEYS = Object.keys(PALETTE_DEFAULTS) as PaletteKey[];

// 외부(플러그인 등) 컴포넌트 데이터를 기본 구조 위에 병합 — 누락된 필드(예: tab.styles) 보존
function normalizeComponents(incoming?: Record<string, unknown> | null): typeof defaultComponents {
  const base = JSON.parse(JSON.stringify(defaultComponents)) as Record<string, Record<string, unknown>>;
  if (incoming && typeof incoming === 'object') {
    Object.keys(base).forEach((k) => {
      const inc = incoming[k];
      if (inc && typeof inc === 'object' && !Array.isArray(inc)) {
        base[k] = { ...base[k], ...(inc as Record<string, unknown>) };
      }
    });
  }
  return base as unknown as typeof defaultComponents;
}

export const useDS = create<DSStore>()(
  persist(
    (set, get) => ({
      semanticList: DEFAULT_SEMANTIC_LIST,
      palettes: Object.fromEntries(ALL_KEYS.map((k) => [k, makePalette(k)])) as Record<PaletteKey, Palette>,
      baseColorList: DEFAULT_BASE_COLOR_LIST,
      statusColorsEnabled: true,
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

      reorderSemantic: (fromId, toId, position = 'before') =>
        set((s) => {
          const list = [...s.semanticList];
          const fromIdx = list.findIndex((i) => i.id === fromId);
          if (fromIdx === -1) return s;
          const [moved] = list.splice(fromIdx, 1);
          let toIdx = list.findIndex((i) => i.id === toId);
          if (toIdx === -1) return s;
          if (position === 'after') toIdx += 1;
          list.splice(toIdx, 0, moved);
          return { semanticList: list };
        }),

      convertSemanticToBase: (id, targetKey, position = 'before') =>
        set((s) => {
          const item = s.semanticList.find((i) => i.id === id);
          if (!item) return s;
          if (s.baseColorList.some((b) => b.key === id)) return s;
          const list = [...s.baseColorList];
          let pos = targetKey ? list.findIndex((b) => b.key === targetKey) : -1;
          if (pos === -1) pos = list.length;
          else if (position === 'after') pos += 1;
          list.splice(pos, 0, { key: id, label: item.label });
          return {
            semanticList: s.semanticList.filter((i) => i.id !== id),
            baseColorList: list,
            palettes: { ...s.palettes, [id]: { base: item.base, scale: item.scale } },
          };
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

      setBaseLabel: (key, label) =>
        set((s) => ({
          baseColorList: s.baseColorList.map((b) => (b.key === key ? { ...b, label } : b)),
        })),

      addBaseColor: () =>
        set((s) => {
          let key = `custom-${Date.now()}`;
          while (key in s.palettes) key = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
          const defaultHex = '#6366f1';
          const n = s.baseColorList.length + 1;
          return {
            baseColorList: [...s.baseColorList, { key, label: `Custom ${n}` }],
            palettes: { ...s.palettes, [key]: { base: defaultHex, scale: generateScale(defaultHex) } },
          };
        }),

      removeBaseColor: (key) =>
        set((s) => {
          if (s.baseColorList.length <= 1) return s;
          const nextPalettes = { ...s.palettes };
          delete nextPalettes[key];
          return {
            baseColorList: s.baseColorList.filter((b) => b.key !== key),
            palettes: nextPalettes,
          };
        }),

      resetBaseColors: () =>
        set((s) => {
          const pals = { ...s.palettes };
          // 커스텀으로 추가했던 베이스 컬러는 팔레트에서도 함께 제거
          const defaultKeys = new Set(DEFAULT_BASE_COLOR_LIST.map((b) => b.key));
          s.baseColorList.forEach((b) => { if (!defaultKeys.has(b.key)) delete pals[b.key]; });
          DEFAULT_BASE_COLOR_LIST.forEach((b) => { pals[b.key] = makePalette(b.key); });
          return {
            baseColorList: JSON.parse(JSON.stringify(DEFAULT_BASE_COLOR_LIST)),
            palettes: pals,
          };
        }),

      reorderBaseColors: (fromKey, toKey, position = 'before') =>
        set((s) => {
          const list = [...s.baseColorList];
          const fromIdx = list.findIndex((b) => b.key === fromKey);
          if (fromIdx === -1) return s;
          const [moved] = list.splice(fromIdx, 1);
          let toIdx = list.findIndex((b) => b.key === toKey);
          if (toIdx === -1) return s;
          if (position === 'after') toIdx += 1;
          list.splice(toIdx, 0, moved);
          return { baseColorList: list };
        }),

      convertBaseToSemantic: (key, targetId, position = 'before') =>
        set((s) => {
          const baseItem = s.baseColorList.find((b) => b.key === key);
          const pal = s.palettes[key];
          if (!baseItem || !pal) return s;
          if (s.semanticList.some((i) => i.id === key)) return s;
          const FIXED_BOTTOM = ['info', 'success', 'error', 'warning'];
          const nextSemanticList = [...s.semanticList];
          let pos = targetId ? nextSemanticList.findIndex((i) => i.id === targetId) : -1;
          if (pos === -1) {
            const fixedIdx = nextSemanticList.findIndex((i) => FIXED_BOTTOM.includes(i.id));
            pos = fixedIdx === -1 ? nextSemanticList.length : fixedIdx;
          } else if (position === 'after') {
            pos += 1;
          }
          const newItem: SemanticItem = { id: key, label: baseItem.label, emoji: '🎨', base: pal.base, scale: pal.scale };
          nextSemanticList.splice(pos, 0, newItem);
          return {
            baseColorList: s.baseColorList.filter((b) => b.key !== key),
            semanticList: nextSemanticList,
          };
        }),

      setStatusColorsEnabled: (v) => set({ statusColorsEnabled: v }),

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
            baseColorList: s.baseColorList,
          }),
        }).catch(() => {});
      },
      loadPreset: (id) =>
        set((s) => {
          const preset = s.presets.find((p) => p.id === id);
          return preset ? { components: normalizeComponents(preset.components as Record<string, unknown>) } : {};
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
          baseColorList: JSON.parse(JSON.stringify(DEFAULT_BASE_COLOR_LIST)),
          statusColorsEnabled: true,
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
            // 이전 세트에서 남은 키가 섞이지 않도록, 불러오는 세트의 palettes로 완전히 교체
            const pals: Record<string, Palette> = {};
            Object.entries(data.palettes).forEach(([k, scale]) => {
              const sc = scale as Record<string, string>;
              const base = sc['500'] ?? s.palettes[k]?.base ?? Object.values(sc)[0];
              if (!base) return;
              // 과거(50 shade 추가 이전)에 저장된 프리셋은 일부 shade가 누락될 수 있어 생성값으로 보완
              pals[k] = { base, scale: { ...generateScale(base), ...sc } as Record<Shade, string> };
            });
            next.palettes = pals as Record<PaletteKey, Palette>;
          }
          if (data.semanticList) {
            next.semanticList = data.semanticList.map((item) => ({
              ...item,
              scale: { ...generateScale(item.base), ...item.scale },
            }));
          }
          if (data.baseColorList) next.baseColorList = data.baseColorList;
          const comps = data.pluginComponents ?? data.components;
          if (comps) next.components = normalizeComponents(comps as Record<string, unknown>);
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
            baseColorList: s.baseColorList,
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
        baseColorList: get().baseColorList,
        components: get().components,
      }),
    }),
    {
      // v29 -> v30: 파로스/스텔라 컬러 시스템으로 베이스 컬러 전면 교체(불필요 키 삭제, BG/Border 그룹 제거) — 예전 저장값과 구조가 달라 새 버전 키로 분리
      name: 'design-yu-store-v30',
      // 저장된 상태를 불러올 때 컴포넌트를 기본 구조 위에 병합 — 과거에 깨진(tab.styles, 50 shade 누락 등) 데이터 복구
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<DSStore>;
        const palettes = p.palettes
          ? (Object.fromEntries(
              Object.entries(p.palettes).map(([k, pal]) => [
                k,
                {
                  base: pal.base,
                  scale: { ...generateScale(pal.base), ...pal.scale },
                  // tags는 사용자가 편집할 수 없는 코드 쪽 표시용 메타데이터라 항상 최신 기본값을 사용
                  ...(current.palettes[k]?.tags ? { tags: current.palettes[k]?.tags } : {}),
                },
              ])
            ) as Record<PaletteKey, Palette>)
          : current.palettes;
        const semanticList = p.semanticList
          ? p.semanticList.map((item) => ({ ...item, scale: { ...generateScale(item.base), ...item.scale } }))
          : current.semanticList;
        return {
          ...current,
          ...p,
          palettes,
          semanticList,
          components: normalizeComponents(p.components as Record<string, unknown> | undefined),
        };
      },
    }
  )
);
