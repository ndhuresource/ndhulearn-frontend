import React from "react";

export default function EmojiAvatar({ emoji = "🙂", size = 36 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        background: "#f2f2f2",
        border: "1px solid #e5e5e5",
        fontSize: Math.round(size * 0.6),
        userSelect: "none",
      }}
      aria-label="emoji-avatar"
      title="emoji 頭貼"
    >
      {emoji}
    </div>
  );
}
