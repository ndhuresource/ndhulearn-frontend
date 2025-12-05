// src/pages/NotesDemo.jsx
import React from "react";
import NoteCard from "../components/NoteCard";

const mockNotes = [
  { id: "note-aaa", title: "資料結構 期中筆記", fileUrl: "#" },
  { id: "note-bbb", title: "離散數學 小抄", fileUrl: "#" },
];

export default function NotesDemo() {
  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "16px 12px", display: "grid", gap: 20 }}>
      <h2>筆記清單（示範頁）</h2>
      {mockNotes.map((n) => (
        <NoteCard key={n.id} note={n} />
      ))}
    </div>
  );
}
