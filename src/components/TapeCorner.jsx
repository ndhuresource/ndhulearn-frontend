import React from "react";

export default function TapeCorner({ x = "0", y = "0", rotate = -15 }) {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: "100px",
        height: "32px",
        backgroundColor: "rgba(255, 255, 255, 0.35)", // 半透明白
        border: "1px solid rgba(255, 255, 255, 0.6)",
        transform: `rotate(${rotate}deg)`,
        boxShadow: "0 2px 5px rgba(0,0,0,0.08)", // 淡淡陰影
        pointerEvents: "none", // 讓滑鼠可以穿透它點擊下方的東西
        zIndex: 10,
        backdropFilter: "blur(2px)" // 毛玻璃效果
      }}
    />
  );
}