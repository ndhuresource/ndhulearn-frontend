import React from "react";

export default function StickerBadge({ children, tone = "gray" }) {
  // 定義幾種顏色主題
  const themes = {
    baby: { bg: "#e0f2fe", color: "#0369a1", border: "#bae6fd" }, // 藍色
    mint: { bg: "#dcfce7", color: "#15803d", border: "#bbf7d0" }, // 綠色
    lav:  { bg: "#f3e8ff", color: "#7e22ce", border: "#e9d5ff" }, // 紫色
    gray: { bg: "#f3f4f6", color: "#374151", border: "#e5e7eb" }, // 灰色
  };

  const style = themes[tone] || themes.gray;

  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 8px",
        fontSize: "12px",
        fontWeight: "bold",
        borderRadius: "6px",
        backgroundColor: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        marginRight: "6px",
      }}
    >
      {children}
    </span>
  );
}