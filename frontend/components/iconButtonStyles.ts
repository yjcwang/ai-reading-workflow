import type { CSSProperties } from "react";

// 图标本体的基础样式，只负责把 SVG 蒙版按当前文字色显示出来。
export const iconMaskBase: CSSProperties = {
  display: "inline-block",
  backgroundColor: "currentColor",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskPosition: "center",
  maskPosition: "center",
  WebkitMaskSize: "contain",
  maskSize: "contain",
};

// 所有图标按钮共享的基础布局：居中、圆角、可点击。
export const iconButtonBase: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 14,
  cursor: "pointer",
};

// 中号图标按钮，适合大多数工具栏和弹窗右上角按钮。
export const iconButtonMd: CSSProperties = {
  ...iconButtonBase,
  minWidth: 36,
  minHeight: 36,
  padding: 8,
};

// 小号图标按钮，主要用于卡片角落这种更克制的删除按钮。
export const iconButtonSm: CSSProperties = {
  ...iconButtonBase,
  width: 30,
  height: 30,
  padding: 6,
};

// 透明背景的普通图标按钮，适合删除、关闭这类次级操作。
export const iconButtonGhost: CSSProperties = {
  ...iconButtonMd,
  background: "transparent",
  color: "var(--text)",
  border: "1px solid var(--border)",
};

// 透明背景但边框更明显，适合面板头部工具按钮。
export const iconButtonGhostStrong: CSSProperties = {
  ...iconButtonMd,
  background: "transparent",
  color: "var(--text)",
  border: "1px solid var(--border-strong)",
};

// 带轻微强调底色的图标按钮，适合 Add 这类需要一点提示的操作。
export const iconButtonTinted: CSSProperties = {
  ...iconButtonMd,
  background: "rgba(var(--accent-rgb), 0.2)",
  color: "var(--text)",
  border: "1px solid var(--border)",
};

// 根据传入的 SVG 路径生成图标样式，size 控制图标本体大小。
export function maskedIconStyle(iconSrc: string, size = 18): CSSProperties {
  return {
    ...iconMaskBase,
    width: size,
    height: size,
    WebkitMaskImage: `url(${iconSrc})`,
    maskImage: `url(${iconSrc})`,
  };
}
