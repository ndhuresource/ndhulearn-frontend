import React from "react";

export default function RatingStars({ value = 0, onChange, readonly }) {
  const v = Math.round(Number(value) * 10) / 10;
  return (
    <div style={{ fontSize: "1.15rem", userSelect: "none" }}>
      {[1,2,3,4,5].map(n => {
        const filled = n <= v;
        return (
          <span
            key={n}
            style={{ cursor: readonly ? "default" : "pointer", color: filled ? "#FFD14D" : "#ccc" }}
            onClick={()=> !readonly && onChange?.(n)}
          >★</span>
        );
      })}
    </div>
  );
}
