import type { CSSProperties } from "react";

// 所有按钮共用的基础骨架：对齐、圆角、边框基线、字重。
export const buttonBase: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  borderRadius: 18,
  border: "1px solid transparent",
  cursor: "pointer",
  fontWeight: 500,
  lineHeight: 1.2,
  flexShrink: 0,
};

// 小号文字按钮：用于次要工具按钮、弹窗底部短按钮。
export const buttonSm: CSSProperties = {
  ...buttonBase,
  minHeight: 32,
  padding: "6px 10px",
  fontSize: 13,
};

// 中号文字按钮：默认按钮尺寸，适合大多数主操作和普通操作。
export const buttonMd: CSSProperties = {
  ...buttonBase,
  minHeight: 40,
  padding: "10px 12px",
  fontSize: 14,
};

// 大号文字按钮：用于更强调的主操作，当前项目里还未大面积使用。
export const buttonLg: CSSProperties = {
  ...buttonBase,
  minHeight: 44,
  padding: "12px 14px",
  fontSize: 15,
};

// 主按钮外观：深色底，表示最主要、最应该点击的操作。
export const buttonPrimary: CSSProperties = {
  background: "var(--text)",
  color: "var(--text-invert)",
  border: "1px solid var(--border-strong)",
};

// 次按钮外观：透明底 + 强边框，用于清晰但不抢主按钮的操作。
export const buttonSecondary: CSSProperties = {
  background: "transparent",
  color: "var(--text)",
  border: "1px solid var(--border-strong)",
};

// 幽灵按钮外观：透明底 + 弱边框，用于更轻量的次级操作。
export const buttonGhost: CSSProperties = {
  background: "transparent",
  color: "var(--text)",
  border: "1px solid var(--border)",
};

// 染色按钮外观：带轻微强调底色，适合“有提示感但不是主按钮”的操作。
export const buttonTinted: CSSProperties = {
  background: "rgba(var(--accent-rgb), 0.2)",
  color: "var(--text)",
  border: "1px solid var(--border)",
};

// 危险按钮外观：带风险提示的删除/危险操作按钮。
export const buttonDanger: CSSProperties = {
  background: "rgba(120, 32, 32, 0.08)",
  color: "var(--text)",
  border: "1px solid #5a2a2a",
};

// 图标按钮的基础骨架：继承按钮系统，但去掉文字按钮的内边距。
export const iconButtonBase: CSSProperties = {
  ...buttonBase,
  padding: 0,
};

// 小号图标按钮：适合卡片角落、删除这类紧凑操作。
export const iconButtonSm: CSSProperties = {
  ...iconButtonBase,
  width: 30,
  height: 30,
};

// 中号图标按钮：默认图标按钮尺寸，适合工具栏、面板头部。
export const iconButtonMd: CSSProperties = {
  ...iconButtonBase,
  minWidth: 36,
  minHeight: 36,
};

// 大号图标按钮：用于更显眼的图标操作，当前项目里还未大面积使用。
export const iconButtonLg: CSSProperties = {
  ...iconButtonBase,
  minWidth: 42,
  minHeight: 42,
};

// 图标遮罩基础样式：把 SVG 当作蒙版并跟随当前文字颜色显示。
export const iconMaskBase: CSSProperties = {
  display: "inline-block",
  backgroundColor: "currentColor",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskPosition: "center",
  maskPosition: "center",
  WebkitMaskSize: "contain",
  maskSize: "contain",
  flexShrink: 0,
};

// 根据传入 SVG 路径生成遮罩图标样式，size 表示图标本体尺寸。
export function maskedIconStyle(iconSrc: string, size = 18): CSSProperties {
  return {
    ...iconMaskBase,
    width: size,
    height: size,
    WebkitMaskImage: `url(${iconSrc})`,
    maskImage: `url(${iconSrc})`,
  };
}
