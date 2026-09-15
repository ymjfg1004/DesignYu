export type Shade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
export type ColorScale = Record<Shade, string>;

export interface Palette {
  base: string;
  scale: ColorScale;
}

// bg / border 그룹의 단일 컬러칩
export interface GroupColor {
  label: string;
  hex: string;
}

// 동적 시맨틱 컬러 항목
export interface SemanticItem {
  id: string;
  label: string;
  emoji: string;
  base: string;
  scale: ColorScale;
}

// Semantic tokens (컴포넌트 설정에서 사용)
export type SemanticKey = 'primary' | 'secondary' | 'info' | 'success' | 'error' | 'warning';

// Base color palettes (Tailwind-style)
export type BaseColorKey =
  | 'white' | 'black'
  | 'rose' | 'pink' | 'fuchsia' | 'purple' | 'violet' | 'indigo'
  | 'blue' | 'sky' | 'cyan' | 'teal' | 'emerald' | 'green' | 'lime'
  | 'yellow' | 'amber' | 'orange' | 'red'
  | 'stone' | 'neutral' | 'zinc' | 'gray' | 'slate';

// (string & {})는 리터럴 자동완성은 유지하면서 커스텀 베이스 컬러 키(예: 'custom-172...')도 허용
export type PaletteKey = SemanticKey | BaseColorKey | (string & {});

// 베이스 컬러 목록의 한 줄(순서 + 표시 이름) — 팔레트 데이터 자체는 palettes[key]에 저장
export interface BaseColorItem {
  key: string;
  label: string;
}

export interface ButtonStateColors {
  bgColor: PaletteKey | null; bgShade: Shade; bgOpacity: number;
  borderColor: PaletteKey | null; borderShade: Shade; borderOpacity: number;
  textColor: PaletteKey | null; textShade: Shade; textOpacity: number;
}

export interface ButtonVariant {
  default: ButtonStateColors;
  hover: ButtonStateColors;
  active: ButtonStateColors;
  disabled: ButtonStateColors;
}

export interface ButtonSize {
  name: string;
  h: number;
  px: number;
  py: number;
  fs: number;
}

export interface ButtonSettings {
  borderRadius: number;
  variants: Record<string, ButtonVariant>;
  sizes: ButtonSize[];
}

export interface SelectSettings {
  borderRadius: number;
  height: number;
  paddingX: number;
  fontSize: number;
  iconSvg?: string;
  iconSize?: number;
  iconColor?: PaletteKey | null;
  iconShade?: Shade;
  // default
  defaultBgColor: PaletteKey | null; defaultBgShade: Shade; defaultBgOpacity: number; borderColor: PaletteKey | null; borderShade: Shade; borderOpacity: number; defaultTextColor: PaletteKey | null; defaultTextShade: Shade; defaultTextOpacity: number;
  // focused
  focusBgColor: PaletteKey | null; focusBgShade: Shade; focusBgOpacity: number; focusColor: PaletteKey | null; focusShade: Shade; focusOpacity: number; focusTextColor: PaletteKey | null; focusTextShade: Shade; focusTextOpacity: number;
  // error
  errorBgColor: PaletteKey | null; errorBgShade: Shade; errorBgOpacity: number; errorColor: PaletteKey | null; errorShade: Shade; errorOpacity: number; errorTextColor: PaletteKey | null; errorTextShade: Shade; errorTextOpacity: number;
  // disabled
  disabledBgColor: PaletteKey | null; disabledBgShade: Shade; disabledBgOpacity: number; disabledColor: PaletteKey | null; disabledShade: Shade; disabledOpacity: number; disabledTextColor: PaletteKey | null; disabledTextShade: Shade; disabledTextOpacity: number;
}

export interface InputSet {
  name: string;
  height: number;
  paddingX: number;
  fontSize: number;
  borderRadius: number;
  // default
  defaultBgColor: PaletteKey | null; defaultBgShade: Shade; defaultBgOpacity: number; borderColor: PaletteKey | null; borderShade: Shade; borderOpacity: number; defaultTextColor: PaletteKey | null; defaultTextShade: Shade; defaultTextOpacity: number;
  // focused
  focusBgColor: PaletteKey | null; focusBgShade: Shade; focusBgOpacity: number; focusColor: PaletteKey | null; focusShade: Shade; focusOpacity: number; focusTextColor: PaletteKey | null; focusTextShade: Shade; focusTextOpacity: number;
  // error
  errorBgColor: PaletteKey | null; errorBgShade: Shade; errorBgOpacity: number; errorColor: PaletteKey | null; errorShade: Shade; errorOpacity: number; errorTextColor: PaletteKey | null; errorTextShade: Shade; errorTextOpacity: number;
  // disabled
  disabledBgColor: PaletteKey | null; disabledBgShade: Shade; disabledBgOpacity: number; disabledColor: PaletteKey | null; disabledShade: Shade; disabledOpacity: number; disabledTextColor: PaletteKey | null; disabledTextShade: Shade; disabledTextOpacity: number;
  // readonly
  readonlyBgColor: PaletteKey | null; readonlyBgShade: Shade; readonlyBgOpacity: number; readonlyColor: PaletteKey | null; readonlyShade: Shade; readonlyOpacity: number; readonlyTextColor: PaletteKey | null; readonlyTextShade: Shade; readonlyTextOpacity: number;
}

export interface InputSettings {
  sets: InputSet[];
}

export interface CardSettings {
  borderRadius: number;
  paddingX: number;
  paddingY: number;
  gap: number;
  shadowOpacity: number;
}

export interface SimpleSettings {
  borderRadius?: number;
  height?: number;
  required?: boolean;
  showCharCount?: boolean;
  maxChars?: number;
  paddingX?: number;
  paddingY?: number;
  fontSize?: number;
  gap?: number;
  size?: number;
  width?: number;
  strokeWidth?: number;
  shadowOpacity?: number;
  sizeS?: number;
  sizeM?: number;
  sizeL?: number;
  sizeXL?: number;
  checkedColor?: PaletteKey;
  checkedShade?: Shade;
  onColor?: PaletteKey;
  onShade?: Shade;
  color?: PaletteKey;
  colorShade?: Shade;
  borderColor?: PaletteKey;
  borderShade?: Shade;
  focusColor?: PaletteKey;
  focusShade?: Shade;
  errorColor?: PaletteKey;
  errorShade?: Shade;
}

export type ComponentSettings = ButtonSettings | InputSettings | SelectSettings | CardSettings | SimpleSettings;

export interface DesignSystemData {
  semanticList: SemanticItem[];
  palettes: Record<PaletteKey, Palette>;
  bgGroup: GroupColor[];
  borderGroup: GroupColor[];
  baseColorList: BaseColorItem[];
  components: Record<string, ComponentSettings>;
}
