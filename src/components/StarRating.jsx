import React, { useMemo } from "react";

export default function StarRating({
  value = 0,            // 當前分數 (0~5)
  onChange,             // (newValue:number) => void
  size = 24,
  readOnly = false,
  color = "#FFC107",
  gap = 4,
  title,
}) {
  const stars = useMemo(() => {
    const arr = [];
    for (let i = 1; i <= 5; i++) arr.push(i);
    return arr;
  }, []);

  return (
    <div style={{ display: "inline-flex", gap }} title={title}>
      {stars.map((i) => {
        const filled = i <= Math.round(value);
        return (
          <button
            key={i}
            type="button"
            disabled={readOnly}
            onClick={() => !readOnly && onChange && onChange(i)}
            style={{
              width: size,
              height: size,
              lineHeight: `${size}px`,
              fontSize: size * 0.9,
              border: "none",
              background: "transparent",
              cursor: readOnly ? "default" : "pointer",
              color: filled ? color : "#ddd",
              padding: 0,
            }}
            aria-label={`${i} 星`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
