'use client';

import { useDS } from '@/lib/store';
import type { PaletteKey, Shade } from '@/lib/types';

export function ComponentPreview({ compKey }: { compKey: string }) {
  const { components, palettes } = useDS();
  const s = (components as Record<string, Record<string, unknown>>)[compKey] ?? {};

  const gc = (palKey: PaletteKey | null, shade: Shade, opacity = 100): string => {
    if (!palKey) return 'transparent';
    const hex = palettes[palKey]?.scale[shade] ?? '#ccc';
    if (opacity >= 100) return hex;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${opacity / 100})`;
  };

  const num = (key: string, fallback = 0) => Number(s[key] ?? fallback);
  const pal = (key: string) => s[key] as PaletteKey | null;
  const shd = (key: string, fallback: Shade = 500) => (s[key] as Shade) ?? fallback;

  const Label = ({ text }: { text: string }) => (
    <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">{text}</div>
  );
  const Row = ({ children }: { children: React.ReactNode }) => (
    <div className="flex flex-wrap gap-3 mb-6 items-center">{children}</div>
  );

  return (
    <div className="p-8">
      <h3 className="text-sm font-bold text-gray-400 mb-6 uppercase tracking-widest">Live Preview</h3>

      {/* ─── BUTTON ─── */}
      {compKey === 'button' && (() => {
        type BSz = { name: string; h: number; px: number; py: number; fs: number };
        const bs = s as { borderRadius: number; sizes: BSz[]; variants: Record<string, { bg: PaletteKey | null; bgShade: Shade; border: PaletteKey | null; borderShade: Shade }> };
        const sizes: BSz[] = bs.sizes ?? [];
        type SC = { bgColor: PaletteKey|null; bgShade: Shade; bgOpacity?: number; borderColor: PaletteKey|null; borderShade: Shade; borderOpacity?: number; textColor: PaletteKey|null; textShade: Shade; textOpacity?: number };
        type BV = { default?: SC; hover?: SC; active?: SC; disabled?: SC };
        const fallbackSC: SC = { bgColor: null, bgShade: 500, borderColor: null, borderShade: 500, textColor: 'white', textShade: 500 };
        const stateStyle = (sc: SC) => ({
          bg: sc.bgColor ? gc(sc.bgColor, sc.bgShade, sc.bgOpacity ?? 100) : 'transparent',
          border: sc.borderColor ? gc(sc.borderColor, sc.borderShade, sc.borderOpacity ?? 100) : (sc.bgColor ? gc(sc.bgColor, sc.bgShade, sc.bgOpacity ?? 100) : 'transparent'),
          color: sc.textColor ? gc(sc.textColor, sc.textShade, sc.textOpacity ?? 100) : '#000000',
        });
        const STATE_LABELS = ['Default', 'Hover', 'Active', 'Disabled'] as const;
        return Object.entries(bs.variants).map(([vname, v]) => {
          const bv = v as BV;
          return (
            <div key={vname} className="mb-8">
              <Label text={vname} />
              {/* 헤더 행 */}
              <div className="flex items-center mb-2" style={{ gap: 30 }}>
                <span className="w-6 flex-shrink-0" />
                {STATE_LABELS.map((stLabel) => (
                  <span key={stLabel} className="text-[10px] text-gray-400 w-16">{stLabel}</span>
                ))}
              </div>
              {/* 사이즈별 행 */}
              {sizes.map((sz) => (
                <div key={sz.name} className="flex items-center mb-2" style={{ gap: 30 }}>
                  <span className="text-[10px] text-gray-400 w-6 flex-shrink-0">{sz.name}</span>
                  {STATE_LABELS.map((stLabel) => {
                    const stKey = stLabel.toLowerCase() as keyof BV;
                    const sc = bv[stKey] ?? fallbackSC;
                    const { bg, border, color } = stateStyle(sc);
                    return (
                      <div key={stLabel} className="w-16 flex justify-start">
                        <button
                          style={{
                            height: sz.h,
                            paddingLeft: sz.px,
                            paddingRight: sz.px,
                            paddingTop: sz.py,
                            paddingBottom: sz.py,
                            fontSize: sz.fs,
                            borderRadius: bs.borderRadius,
                            background: bg,
                            border: `1.5px solid ${border}`,
                            color,
                            cursor: 'default',
                            fontWeight: 600,
                            minWidth: sz.h,
                          }}
                        >
                          {sz.name}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          );
        });
      })()}

      {/* ─── INPUT ─── */}
      {compKey === 'input' && (() => {
        type IS = { name: string; height: number; paddingX: number; fontSize: number; borderRadius: number; defaultBgColor: PaletteKey|null; defaultBgShade: Shade; defaultBgOpacity?: number; borderColor: PaletteKey|null; borderShade: Shade; borderOpacity?: number; defaultTextColor: PaletteKey|null; defaultTextShade: Shade; defaultTextOpacity?: number; focusBgColor: PaletteKey|null; focusBgShade: Shade; focusBgOpacity?: number; focusColor: PaletteKey|null; focusShade: Shade; focusOpacity?: number; focusTextColor: PaletteKey|null; focusTextShade: Shade; focusTextOpacity?: number; errorBgColor: PaletteKey|null; errorBgShade: Shade; errorBgOpacity?: number; errorColor: PaletteKey|null; errorShade: Shade; errorOpacity?: number; errorTextColor: PaletteKey|null; errorTextShade: Shade; errorTextOpacity?: number; disabledBgColor: PaletteKey|null; disabledBgShade: Shade; disabledBgOpacity?: number; disabledColor: PaletteKey|null; disabledShade: Shade; disabledOpacity?: number; disabledTextColor: PaletteKey|null; disabledTextShade: Shade; disabledTextOpacity?: number; readonlyBgColor: PaletteKey|null; readonlyBgShade: Shade; readonlyBgOpacity?: number; readonlyColor: PaletteKey|null; readonlyShade: Shade; readonlyOpacity?: number; readonlyTextColor: PaletteKey|null; readonlyTextShade: Shade; readonlyTextOpacity?: number };
        const sets = (s.sets ?? []) as IS[];
        const STATES = (set: IS) => [
          { label: 'Default',  border: gc(set.borderColor,   set.borderShade,   set.borderOpacity   ?? 100), bg: gc(set.defaultBgColor,  set.defaultBgShade,  set.defaultBgOpacity  ?? 100), color: gc(set.defaultTextColor,  set.defaultTextShade,  set.defaultTextOpacity  ?? 100), disabled: false },
          { label: 'Focused',  border: gc(set.focusColor,    set.focusShade,    set.focusOpacity    ?? 100), bg: gc(set.focusBgColor,    set.focusBgShade,    set.focusBgOpacity    ?? 100), color: gc(set.focusTextColor,    set.focusTextShade,    set.focusTextOpacity    ?? 100), disabled: false },
          { label: 'Error',    border: gc(set.errorColor,    set.errorShade,    set.errorOpacity    ?? 100), bg: gc(set.errorBgColor,    set.errorBgShade,    set.errorBgOpacity    ?? 100), color: gc(set.errorTextColor,    set.errorTextShade,    set.errorTextOpacity    ?? 100), disabled: false },
          { label: 'Disabled', border: gc(set.disabledColor, set.disabledShade, set.disabledOpacity ?? 100), bg: gc(set.disabledBgColor, set.disabledBgShade, set.disabledBgOpacity ?? 100), color: gc(set.disabledTextColor, set.disabledTextShade, set.disabledTextOpacity ?? 100), disabled: true  },
          { label: 'Readonly', border: gc(set.readonlyColor, set.readonlyShade, set.readonlyOpacity ?? 100), bg: gc(set.readonlyBgColor, set.readonlyBgShade, set.readonlyBgOpacity ?? 100), color: gc(set.readonlyTextColor, set.readonlyTextShade, set.readonlyTextOpacity ?? 100), disabled: false },
        ];
        return (
          <>
            {sets.map((set, si) => (
              <div key={si} className="mb-6">
                <Label text={set.name} />
                <Row>
                  {STATES(set).map((st) => (
                    <input
                      key={st.label}
                      placeholder={st.label}
                      disabled={st.disabled}
                      readOnly
                      style={{
                        height: set.height,
                        paddingLeft: set.paddingX,
                        paddingRight: set.paddingX,
                        fontSize: set.fontSize,
                        borderRadius: set.borderRadius,
                        border: `1.5px solid ${st.border}`,
                        outline: 'none',
                        background: st.bg,
                        color: st.color,
                        WebkitTextFillColor: st.color,
                        width: 140,
                        opacity: 1,
                      }}
                    />
                  ))}
                </Row>
              </div>
            ))}
          </>
        );
      })()}

      {/* ─── TEXTAREA ─── */}
      {compKey === 'textarea' && (() => {
        const required = !!s.required;
        const showCharCount = !!s.showCharCount;
        const maxChars = Number(s.maxChars ?? 100);
        const sampleText = '안녕하세요. 이것은 샘플 텍스트입니다.';
        const currentLen = sampleText.length;
        const primaryColor = palettes['primary']?.scale[500] ?? '#3b82f6';
        return (
          <>
            <div className="mb-3 flex items-center gap-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Textarea</span>
              {required && <span style={{ color: '#ef4444', fontSize: 13, lineHeight: 1 }}>*</span>}
            </div>
            <textarea
              defaultValue={sampleText}
              style={{
                height: num('height', 100),
                paddingLeft: num('paddingX', 12),
                paddingRight: num('paddingX', 12),
                paddingTop: num('paddingY', 10),
                paddingBottom: num('paddingY', 10),
                fontSize: num('fontSize', 14),
                borderRadius: num('borderRadius', 8),
                border: `1.5px solid ${gc(pal('borderColor'), shd('borderShade', 300))}`,
                resize: 'vertical',
                outline: 'none',
                width: 280,
              }}
            />
            {showCharCount && (
              <div style={{ width: 280, display: 'flex', justifyContent: 'flex-end', gap: 2, marginTop: 4, fontSize: 12 }}>
                <span style={{ color: primaryColor, fontWeight: 500 }}>{currentLen}</span>
                <span style={{ color: '#9ca3af' }}>/</span>
                <span style={{ color: '#9ca3af' }}>{maxChars}</span>
              </div>
            )}
          </>
        );
      })()}

      {/* ─── SELECT ─── */}
      {compKey === 'select' && (() => {
        const r = num('borderRadius', 8);
        const h = num('height', 40);
        const px = num('paddingX', 12);
        const fs = num('fontSize', 14);
        const iconSvg = String(s.iconSvg ?? '').trim();
        const iconSize = num('iconSize', 16);
        const iconColor = iconSvg ? gc(pal('iconColor'), shd('iconShade', 400)) : undefined;
        const states = [
          { label: 'Default',  bg: gc(pal('defaultBgColor'), shd('defaultBgShade', 500), num('defaultBgOpacity', 100) || 100), border: gc(pal('borderColor'), shd('borderShade', 300), num('borderOpacity', 100) || 100), color: gc(pal('defaultTextColor'), shd('defaultTextShade', 900), num('defaultTextOpacity', 100) || 100), disabled: false, opacity: 1 },
          { label: 'Focused',  bg: gc(pal('focusBgColor'), shd('focusBgShade', 500), num('focusBgOpacity', 100) || 100), border: gc(pal('focusColor'), shd('focusShade', 500), num('focusOpacity', 100) || 100), color: gc(pal('focusTextColor'), shd('focusTextShade', 900), num('focusTextOpacity', 100) || 100), disabled: false, opacity: 1 },
          { label: 'Error',    bg: gc(pal('errorBgColor'), shd('errorBgShade', 500), num('errorBgOpacity', 100) || 100), border: gc(pal('errorColor'), shd('errorShade', 500), num('errorOpacity', 100) || 100), color: gc(pal('errorTextColor'), shd('errorTextShade', 900), num('errorTextOpacity', 100) || 100), disabled: false, opacity: 1 },
          { label: 'Disabled', bg: gc(pal('disabledBgColor'), shd('disabledBgShade', 100), num('disabledBgOpacity', 100) || 100), border: gc(pal('disabledColor'), shd('disabledShade', 200), num('disabledOpacity', 100) || 100), color: gc(pal('disabledTextColor'), shd('disabledTextShade', 400), num('disabledTextOpacity', 100) || 100), disabled: true, opacity: 1 },
        ];
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
            {states.map(st => (
              <div key={st.label}>
                <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6, fontWeight: 600 }}>{st.label}</div>
                <div style={{ position: 'relative', width: 140, display: 'inline-block' }}>
                  <select
                    disabled={st.disabled}
                    style={{
                      height: h, paddingLeft: px, paddingRight: px + 24, fontSize: fs,
                      borderRadius: r, border: `1.5px solid ${st.border}`,
                      background: st.bg, color: st.color,
                      outline: 'none', width: '100%',
                      appearance: 'none', WebkitAppearance: 'none',
                      WebkitTextFillColor: st.color,
                      cursor: st.disabled ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <option>text</option>
                    <option>옵션 1</option>
                    <option>옵션 2</option>
                  </select>
                  {iconSvg ? (
                    <span
                      style={{ position: 'absolute', right: px, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex', alignItems: 'center', color: iconColor, width: iconSize, height: iconSize }}
                      dangerouslySetInnerHTML={{ __html: iconSvg.replace(/<svg([^>]*)>/, `<svg$1 width="${iconSize}" height="${iconSize}" style="display:block">`) }}
                    />
                  ) : (
                    <svg style={{ position: 'absolute', right: px, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: st.color }} width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M2 4l4 4 4-4"/>
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* ─── CHECKBOX ─── */}
      {compKey === 'checkbox' && (() => {
        const sz = num('size', 18);
        const radius = num('borderRadius', 4);
        const activeColor = gc(pal('checkedColor'), shd('checkedShade'));
        const disabledColor = pal('disabledColor') ? gc(pal('disabledColor'), shd('disabledShade')) : null;
        const disabledOpacity = num('disabledOpacity', 100) / 100;
        const disabledBg = disabledColor ?? '#e5e7eb';
        const disabledBorder = disabledColor ?? '#d1d5db';
        const showLabel = s['showLabel'] !== false;

        const CheckBox = ({ state }: { state: 'unchecked' | 'checked' | 'indeterminate' | 'disabled-unchecked' | 'disabled-checked' | 'disabled-indeterminate' }) => {
          const isDisabled = state.startsWith('disabled');
          const isChecked = state === 'checked' || state === 'disabled-checked';
          const isIndet = state === 'indeterminate' || state === 'disabled-indeterminate';
          const bg = isDisabled ? (isChecked || isIndet ? disabledBg : '#fff') : isChecked || isIndet ? activeColor : '#fff';
          const border = isDisabled ? disabledBorder : isChecked || isIndet ? activeColor : '#ccc';
          return (
            <div style={{ width: sz, height: sz, borderRadius: radius, border: `1.5px solid ${border}`, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {isChecked && <svg width="10" height="8" viewBox="0 0 10 8"><polyline points="1,4 4,7 9,1" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              {isIndet && <svg width={sz * 0.5} height="2" viewBox="0 0 10 2"><line x1="0" y1="1" x2="10" y2="1" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>}
            </div>
          );
        };

        const states: Array<{ state: 'unchecked' | 'checked' | 'indeterminate' | 'disabled-unchecked' | 'disabled-checked' | 'disabled-indeterminate'; label: string }> = [
          { state: 'unchecked',           label: '미선택' },
          { state: 'checked',             label: '선택됨' },
          { state: 'indeterminate',       label: '다중선택' },
          { state: 'disabled-unchecked',  label: '비활성' },
          { state: 'disabled-checked',    label: '비활성 선택' },
          { state: 'disabled-indeterminate', label: '비활성 다중' },
        ];

        return (
          <>
            <Label text="Checkbox" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              {states.map(({ state, label }) => (
                <label key={state} style={{ display: 'flex', alignItems: 'center', gap: showLabel ? 8 : 0, cursor: state.startsWith('disabled') ? 'not-allowed' : 'pointer', fontSize: num('fontSize', 14), opacity: state.startsWith('disabled') ? disabledOpacity : 1 }}>
                  <CheckBox state={state} />
                  {showLabel && label}
                </label>
              ))}
            </div>
          </>
        );
      })()}

      {/* ─── RADIO ─── */}
      {compKey === 'radio' && (() => {
        const sz = num('size', 18);
        const activeColor = gc(pal('checkedColor'), shd('checkedShade'));
        const disabledColor = pal('disabledColor') ? gc(pal('disabledColor'), shd('disabledShade')) : null;
        const disabledOpacity = num('disabledOpacity', 100) / 100;
        const showLabel = s['showLabel'] !== false;

        const RadioDot = ({ checked, disabled }: { checked: boolean; disabled: boolean }) => (
          <div style={{
            width: sz, height: sz, borderRadius: '50%', flexShrink: 0,
            border: `1.5px solid ${disabled ? (disabledColor ?? '#d1d5db') : checked ? activeColor : '#ccc'}`,
            background: disabled ? '#f3f4f6' : '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {checked && <div style={{ width: '50%', height: '50%', borderRadius: '50%', background: disabled ? (disabledColor ?? '#9ca3af') : activeColor }} />}
          </div>
        );

        const states = [
          { checked: false, disabled: false, label: '미선택' },
          { checked: true,  disabled: false, label: '선택됨' },
          { checked: false, disabled: true,  label: '비활성' },
          { checked: true,  disabled: true,  label: '비활성 선택' },
        ];

        return (
          <>
            <Label text="Radio" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              {states.map(({ checked, disabled, label }) => (
                <label key={label} style={{ display: 'flex', alignItems: 'center', gap: showLabel ? 8 : 0, cursor: disabled ? 'not-allowed' : 'pointer', fontSize: num('fontSize', 14), opacity: disabled ? disabledOpacity : 1 }}>
                  <RadioDot checked={checked} disabled={disabled} />
                  {showLabel && label}
                </label>
              ))}
            </div>
          </>
        );
      })()}

      {/* ─── TOGGLE ─── */}
      {compKey === 'toggle' && (() => {
        const w = num('width', 44);
        const h = num('height', 24);
        const dot = h - 6;
        const showLabel = s['showLabel'] !== false;

        const stateColors = {
          on:     { bg: gc(pal('onBgColor'),     shd('onBgShade'),     num('onBgOpacity', 100)),     dot: gc(pal('onDotColor'),     shd('onDotShade')) },
          off:    { bg: gc(pal('offBgColor'),    shd('offBgShade'),    num('offBgOpacity', 100)),    dot: gc(pal('offDotColor'),    shd('offDotShade')) },
          onDis:  { bg: gc(pal('onDisBgColor'),  shd('onDisBgShade'),  num('onDisBgOpacity', 100)),  dot: gc(pal('onDisDotColor'),  shd('onDisDotShade')) },
          offDis: { bg: gc(pal('offDisBgColor'), shd('offDisBgShade'), num('offDisBgOpacity', 100)), dot: gc(pal('offDisDotColor'), shd('offDisDotShade')) },
        };

        const Track = ({ on, disabled }: { on: boolean; disabled: boolean }) => {
          const key = disabled ? (on ? 'onDis' : 'offDis') : (on ? 'on' : 'off');
          const colors = stateColors[key];
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: showLabel ? 8 : 0 }}>
              <div style={{
                width: w, height: h, borderRadius: h / 2,
                background: colors.bg,
                position: 'relative', cursor: disabled ? 'not-allowed' : 'pointer', transition: 'background .2s',
              }}>
                <div style={{
                  position: 'absolute', top: 3, left: on ? w - dot - 3 : 3,
                  width: dot, height: dot, borderRadius: '50%',
                  background: colors.dot, boxShadow: '0 1px 3px rgba(0,0,0,.15)', transition: 'left .2s',
                }} />
              </div>
              {showLabel && <span style={{ fontSize: 13, color: '#555' }}>{disabled ? (on ? 'ON' : 'OFF') + ' (비활성)' : on ? 'ON' : 'OFF'}</span>}
            </div>
          );
        };

        return (
          <>
            <Label text="Toggle" />
            <Row>
              <Track on={true}  disabled={false} />
              <Track on={false} disabled={false} />
              <Track on={true}  disabled={true} />
              <Track on={false} disabled={true} />
            </Row>
          </>
        );
      })()}

      {/* ─── BADGE ─── */}
      {compKey === 'badge' && (() => {
        type BV = { name: string; bgColor: PaletteKey|null; bgShade: Shade; bgOpacity: number; textColor: PaletteKey|null; textShade: Shade; textOpacity: number };
        const variants: BV[] = (s.variants as BV[]) ?? [];
        return (
          <>
            <Label text="Badge" />
            <Row>
              {variants.map((v, i) => (
                <span key={i} style={{
                  display: 'inline-block',
                  paddingLeft: num('paddingX', 8), paddingRight: num('paddingX', 8),
                  paddingTop: num('paddingY', 3), paddingBottom: num('paddingY', 3),
                  fontSize: num('fontSize', 12),
                  borderRadius: num('borderRadius', 99),
                  background: gc(v.bgColor, v.bgShade ?? 100, v.bgOpacity ?? 100),
                  color: gc(v.textColor, v.textShade ?? 700, v.textOpacity ?? 100),
                  fontWeight: 600,
                  letterSpacing: '.02em',
                  whiteSpace: 'nowrap',
                }}>
                  {v.name}
                </span>
              ))}
            </Row>
          </>
        );
      })()}

      {/* ─── CHIP ─── */}
      {compKey === 'chip' && (() => {
        type CV = { name: string; bgColor: PaletteKey|null; bgShade: Shade; bgOpacity: number; textColor: PaletteKey|null; textShade: Shade; textOpacity: number; borderColor: PaletteKey|null; borderShade: Shade };
        const variants: CV[] = (s.variants as CV[]) ?? [];
        return (
          <>
            <Label text="Chip" />
            <Row>
              {variants.map((v, i) => (
                <span key={i} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  paddingLeft: num('paddingX', 12), paddingRight: num('paddingX', 12),
                  paddingTop: num('paddingY', 6), paddingBottom: num('paddingY', 6),
                  fontSize: num('fontSize', 13),
                  borderRadius: num('borderRadius', 99),
                  background: gc(v.bgColor, v.bgShade ?? 100, v.bgOpacity ?? 100),
                  color: gc(v.textColor, v.textShade ?? 700, v.textOpacity ?? 100),
                  border: `1px solid ${gc(v.borderColor, v.borderShade ?? 200)}`,
                  cursor: 'pointer',
                }}>
                  {v.name}
                  <span style={{ fontSize: 12, opacity: 0.6 }}>×</span>
                </span>
              ))}
            </Row>
          </>
        );
      })()}

      {/* ─── CARD ─── */}
      {compKey === 'card' && (() => {
        const btn = (components as Record<string, Record<string, unknown>>)['button'] ?? {};
        const btnVariantName = (s.btnVariant as string) ?? 'Primary';
        const btnVariants = (btn.variants as Record<string, Record<string, Record<string, unknown>>>) ?? {};
        const btnDef = btnVariants[btnVariantName]?.['default'] ?? {};
        const btnRadius = Number(btn.borderRadius ?? 8);
        const btnSize = (btn.sizes as Array<Record<string,number>>)?.[1] ?? { h: 40, px: 16, fs: 14 };
        const btnBg = gc(btnDef.bgColor as PaletteKey|null, (btnDef.bgShade as Shade) ?? 500, Number(btnDef.bgOpacity ?? 100));
        const btnText = gc(btnDef.textColor as PaletteKey|null, (btnDef.textShade as Shade) ?? 500, Number(btnDef.textOpacity ?? 100));
        const btnBorder = btnDef.borderColor ? gc(btnDef.borderColor as PaletteKey, (btnDef.borderShade as Shade) ?? 500, Number(btnDef.borderOpacity ?? 100)) : 'transparent';
        return (
          <>
            <Label text="Card" />
            <div style={{
              paddingLeft: num('paddingX', 20), paddingRight: num('paddingX', 20),
              paddingTop: num('paddingY', 20), paddingBottom: num('paddingY', 20),
              borderRadius: num('borderRadius', 12),
              background: '#fff',
              boxShadow: `0 2px 12px rgba(0,0,0,${num('shadowOpacity', 8) / 100})`,
              width: 280, display: 'flex', flexDirection: 'column', gap: num('gap', 12),
            }}>
              <div style={{ height: 120, borderRadius: 8, background: '#f3f4f6' }} />
              <div style={{ fontWeight: 700, fontSize: num('titleFontSize', 16), color: '#111' }}>카드 제목</div>
              <div style={{ fontSize: num('bodyFontSize', 13), color: '#6b7280', lineHeight: 1.6 }}>카드 본문 내용이 들어가는 영역입니다. 설명을 이곳에 작성합니다.</div>
              <button style={{
                background: btnBg, color: btnText,
                border: `1px solid ${btnBorder}`,
                borderRadius: btnRadius,
                height: btnSize.h, paddingLeft: btnSize.px, paddingRight: btnSize.px,
                fontSize: btnSize.fs, cursor: 'pointer', fontWeight: 600,
              }}>더 보기</button>
            </div>
          </>
        );
      })()}

      {/* ─── ALERT ─── */}
      {compKey === 'alert' && (
        <>
          {(['success', 'warning', 'error', 'primary'] as PaletteKey[]).map((pk) => (
            <div key={pk}
              style={{
                paddingLeft: num('paddingX', 16),
                paddingRight: num('paddingX', 16),
                paddingTop: num('paddingY', 12),
                paddingBottom: num('paddingY', 12),
                marginBottom: 12,
                borderRadius: num('borderRadius', 8),
                background: palettes[pk]?.scale[100] ?? '#eee',
                borderLeft: `4px solid ${palettes[pk]?.scale[500] ?? '#999'}`,
                fontSize: num('fontSize', 14),
                color: palettes[pk]?.scale[800] ?? '#333',
                fontWeight: 500,
              }}
            >
              {pk === 'success' ? '✅' : pk === 'warning' ? '⚠️' : pk === 'error' ? '❌' : 'ℹ️'} {pk} 알림 메시지 예시입니다.
            </div>
          ))}
        </>
      )}

      {/* ─── TOAST ─── */}
      {compKey === 'toast' && (() => {
        type TV = { name: string; icon: string; bgColor: PaletteKey|null; bgShade: Shade; bgOpacity: number; textColor: PaletteKey|null; textShade: Shade; textOpacity: number };
        const variants: TV[] = (s.variants as TV[]) ?? [];
        return (
          <>
            <Label text="Toast" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {variants.map((v, i) => (
                <div key={i} style={{
                  paddingLeft: num('paddingX', 16), paddingRight: num('paddingX', 16),
                  paddingTop: num('paddingY', 12), paddingBottom: num('paddingY', 12),
                  borderRadius: num('borderRadius', 10),
                  background: gc(v.bgColor, v.bgShade ?? 800, v.bgOpacity ?? 100),
                  fontSize: num('fontSize', 14),
                  color: gc(v.textColor, v.textShade ?? 500, v.textOpacity ?? 100),
                  fontWeight: 500,
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  boxShadow: '0 4px 16px rgba(0,0,0,.15)',
                  minWidth: 240, justifyContent: 'space-between',
                }}>
                  <span>{v.icon} {v.name} 토스트 메시지</span>
                  <span style={{ cursor: 'pointer', opacity: 0.7 }}>×</span>
                </div>
              ))}
            </div>
          </>
        );
      })()}

      {/* ─── TAB ─── */}
      {compKey === 'tab' && (() => {
        type TS = { type: string; label: string; fontSize: number; paddingX: number; paddingY: number; borderRadius: number; activeColor: PaletteKey|null; activeShade: Shade; activeBgColor: PaletteKey|null; activeBgShade: Shade; inactiveColor?: PaletteKey|null; inactiveShade?: Shade; trackColor?: PaletteKey|null; trackShade?: Shade };
        const styles: TS[] = (s.styles as TS[]) ?? [];
        const tabLabels = ['홈', '프로필', '설정', '알림'];
        const inactiveColor = '#6b7280';

        const renderStyle = (st: TS) => {
          const { type, fontSize: fs, paddingX: px, paddingY: py, borderRadius: r } = st;
          const activeColor = gc(st.activeColor, st.activeShade ?? 500);
          const activeBg = st.activeBgColor ? gc(st.activeBgColor, st.activeBgShade ?? 100) : '#fff';
          const inactiveCol = st.inactiveColor ? gc(st.inactiveColor, st.inactiveShade ?? 400) : '#6b7280';
          const trackCol = st.trackColor ? gc(st.trackColor, st.trackShade ?? 200) : '#e5e7eb';

          if (type === 'line') return (
            <div style={{ display: 'inline-flex', borderBottom: `2px solid ${trackCol}` }}>
              {tabLabels.map((label, i) => (
                <div key={label} style={{
                  paddingLeft: px, paddingRight: px, paddingTop: py, paddingBottom: py,
                  fontSize: fs, fontWeight: i === 0 ? 700 : 500, cursor: 'pointer',
                  borderBottom: i === 0 ? `2px solid ${activeColor}` : '2px solid transparent',
                  marginBottom: -2, color: i === 0 ? activeColor : inactiveCol,
                }}>{label}</div>
              ))}
            </div>
          );
          if (type === 'pill') return (
            <div style={{ display: 'inline-flex', gap: 4, padding: 4 }}>
              {tabLabels.map((label, i) => (
                <div key={label} style={{
                  paddingLeft: px, paddingRight: px, paddingTop: py * 0.75, paddingBottom: py * 0.75,
                  fontSize: fs, fontWeight: i === 0 ? 700 : 500, cursor: 'pointer',
                  borderRadius: r, background: i === 0 ? activeBg : 'transparent',
                  color: i === 0 ? activeColor : inactiveCol,
                }}>{label}</div>
              ))}
            </div>
          );
          if (type === 'box') return (
            <div style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 2 }}>
              {tabLabels.map((label, i) => (
                <div key={label} style={{
                  paddingLeft: px, paddingRight: px, paddingTop: py, paddingBottom: py,
                  fontSize: fs, fontWeight: i === 0 ? 700 : 500, cursor: 'pointer',
                  borderRadius: `${r}px ${r}px 0 0`,
                  background: i === 0 ? activeBg : trackCol,
                  color: i === 0 ? activeColor : inactiveCol,
                  border: i === 0 ? '1px solid #e5e7eb' : '1px solid transparent',
                  borderBottom: i === 0 ? `1px solid ${activeBg}` : 'none',
                  marginBottom: i === 0 ? -1 : 0, position: 'relative' as const,
                }}>{label}</div>
              ))}
            </div>
          );
          if (type === 'segment') return (
            <div style={{ display: 'inline-flex', background: trackCol, borderRadius: r + 4, padding: 4, gap: 2 }}>
              {tabLabels.map((label, i) => (
                <div key={label} style={{
                  paddingLeft: px, paddingRight: px, paddingTop: py * 0.75, paddingBottom: py * 0.75,
                  fontSize: fs, fontWeight: i === 0 ? 700 : 500, cursor: 'pointer',
                  borderRadius: r,
                  background: i === 0 ? activeBg : 'transparent',
                  color: i === 0 ? activeColor : inactiveCol,
                  boxShadow: i === 0 ? '0 1px 4px rgba(0,0,0,.10)' : 'none',
                }}>{label}</div>
              ))}
            </div>
          );
          return null;
        };

        return (
          <>
            {styles.map((st) => (
              <div key={st.type} style={{ marginBottom: 28 }}>
                <Label text={st.label} />
                {renderStyle(st)}
              </div>
            ))}
          </>
        );
      })()}

      {/* ─── AVATAR ─── */}
      {compKey === 'avatar' && (
        <>
          <Label text="Avatar" />
          <Row>
            {(['sizeS', 'sizeM', 'sizeL', 'sizeXL'] as const).map((sk) => {
              const sz = num(sk, sk === 'sizeS' ? 32 : sk === 'sizeM' ? 40 : sk === 'sizeL' ? 56 : 72);
              return (
                <div key={sk} style={{ width: sz, height: sz, borderRadius: '50%', background: gc(pal('bgColor'), shd('bgShade', 400)), display: 'flex', alignItems: 'center', justifyContent: 'center', color: gc(pal('textColor'), shd('textShade', 500)), fontWeight: 700, fontSize: sz * 0.38 }}>
                  유
                </div>
              );
            })}
          </Row>
        </>
      )}

      {/* ─── TOOLTIP ─── */}
      {compKey === 'tooltip' && (
        <>
          <Label text="Tooltip" />
          <div style={{ position: 'relative', display: 'inline-block', margin: '40px 20px' }}>
            <button style={{ padding: '8px 16px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer' }}>
              마우스를 올려보세요
            </button>
            <div
              style={{
                position: 'absolute',
                bottom: 'calc(100% + 8px)',
                left: '50%',
                transform: 'translateX(-50%)',
                paddingLeft: num('paddingX', 10),
                paddingRight: num('paddingX', 10),
                paddingTop: num('paddingY', 6),
                paddingBottom: num('paddingY', 6),
                borderRadius: num('borderRadius', 6),
                background: '#111827',
                color: '#fff',
                fontSize: num('fontSize', 12),
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 12px rgba(0,0,0,.15)',
              }}
            >
              툴팁 텍스트
            </div>
          </div>
        </>
      )}

      {/* ─── SPINNER ─── */}
      {compKey === 'spinner' && (
        <>
          <Label text="Spinner" />
          <Row>
            {(['sizeS', 'sizeM', 'sizeL'] as const).map((sk) => {
              const sz = num(sk, sk === 'sizeS' ? 20 : sk === 'sizeM' ? 32 : 48);
              const sw = num('strokeWidth', 3);
              return (
                <div key={sk} style={{ width: sz, height: sz }}>
                  <svg viewBox="0 0 50 50" style={{ animation: 'spin 1s linear infinite', width: sz, height: sz }}>
                    <circle cx="25" cy="25" r="20" fill="none" stroke={pal('bgColor') ? gc(pal('bgColor'), shd('bgShade', 200)) : '#e5e7eb'} strokeWidth={sw * 50 / sz} />
                    <circle cx="25" cy="25" r="20" fill="none" stroke={gc(pal('activeColor'), shd('activeShade', 500))} strokeWidth={sw * 50 / sz} strokeDasharray="30 70" strokeLinecap="round" />
                  </svg>
                </div>
              );
            })}
          </Row>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </>
      )}

      {/* ─── SKELETON ─── */}
      {compKey === 'skeleton' && (
        <>
          <Label text="Skeleton" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 300 }}>
            {[100, 80, 60].map((w, i) => (
              <div key={i}
                style={{
                  height: num('height', 16),
                  borderRadius: num('borderRadius', 8),
                  width: `${w}%`,
                  background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite',
                }}
              />
            ))}
          </div>
          <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
        </>
      )}

      {/* ─── PROGRESS ─── */}
      {compKey === 'progress' && (
        <>
          <Label text="Progress" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: 300 }}>
            {[25, 60, 90].map((pct) => (
              <div key={pct}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6b7280', marginBottom: 4 }}>
                  <span>진행률</span><span>{pct}%</span>
                </div>
                <div style={{ height: num('height', 8), borderRadius: num('borderRadius', 99), background: '#f3f4f6', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, borderRadius: num('borderRadius', 99), background: gc('primary', 500), transition: 'width .5s' }} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ─── PAGINATION ─── */}
      {compKey === 'pagination' && (() => {
        const sz = num('size', 36);
        const fs = num('fontSize', 14);
        const r  = num('borderRadius', 8);
        const gap = num('gap', 4);
        const showFL = s['showFirstLast'] !== false;
        const activeCol   = gc(pal('activeColor'),   shd('activeShade',   500));
        const activeBg    = gc(pal('activeBgColor'), shd('activeBgShade', 500));
        const inactiveCol = pal('inactiveColor') ? gc(pal('inactiveColor'), shd('inactiveShade', 700)) : '#374151';
        const borderCol   = pal('borderColor')   ? gc(pal('borderColor'),   shd('borderShade',   200)) : '#e5e7eb';

        const pages = [...(showFL ? ['«'] : []), '‹', '1', '2', '3', '...', '10', '›', ...(showFL ? ['»'] : [])];

        const Btn = ({ label, active = false }: { label: string; active?: boolean }) => (
          <div style={{
            width: sz, height: sz, borderRadius: r, cursor: 'pointer',
            border: `1px solid ${active ? activeBg : borderCol}`,
            background: active ? activeBg : '#fff',
            color: active ? activeCol : inactiveCol,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: fs, fontWeight: active ? 700 : 400,
            flexShrink: 0,
          }}>{label}</div>
        );

        return (
          <>
            <Label text="Pagination" />
            <div style={{ display: 'flex', alignItems: 'center', gap, flexWrap: 'wrap' }}>
              {pages.map((label, i) => (
                <Btn key={i} label={label} active={label === '2'} />
              ))}
            </div>
          </>
        );
      })()}

      {/* ─── DIVIDER ─── */}
      {compKey === 'divider' && (
        <>
          <Label text="Divider" />
          <div style={{ width: 320 }}>
            <div style={{ marginBottom: 20, fontSize: 14, color: '#374151' }}>위 콘텐츠</div>
            <div style={{ height: num('height', 1), background: gc(pal('color'), shd('colorShade', 200)), borderRadius: 2 }} />
            <div style={{ marginTop: 20, fontSize: 14, color: '#374151' }}>아래 콘텐츠</div>
          </div>
        </>
      )}
    </div>
  );
}
