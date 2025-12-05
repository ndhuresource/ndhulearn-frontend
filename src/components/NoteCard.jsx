// src/components/NoteCard.jsx
import React from "react";
import StarRating from "./StarRating";
import NoteRatingPanel from "./NoteRatingPanel";
import { getNoteRating, markDownloaded } from "../lib/notesStore";

export default function NoteCard({ note }) {
  // note: { id, title, fileUrl? }
  const { avg, count } = getNoteRating(note.id);
  const cur = JSON.parse(localStorage.getItem("currentUser") || "null");

  const onDownload = () => {
    // 這裡放你的實際下載流程：
    // 1) 若有檔案網址：window.open(note.fileUrl, "_blank")
    // 2) 或你原本的 fetch / a[download]
    // 示範先直接標記已下載：
    markDownloaded(note.id, cur?.email || "guest");
    alert(`已標記下載：${note.title}，你現在可以評分了！`);
  };

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #eee",
        borderRadius: 12,
        padding: 16,
        display: "grid",
        gap: 12,
      }}
    >
      {/* 標題 + 平均星等 + 數量 + 下載 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0 }}>{note.title}</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <StarRating value={avg} readOnly size={16} />
          <span style={{ color: "#777", fontSize: 12 }}>({count})</span>
          <button
            onClick={onDownload}
            style={{
              marginLeft: 8,
              padding: "6px 10px",
              border: 0,
              borderRadius: 8,
              background: "#1976d2",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            下載
          </button>
        </div>
      </div>

      {/* 評分面板（下載後才能提交） */}
      <NoteRatingPanel noteId={note.id} />
    </div>
  );
}
