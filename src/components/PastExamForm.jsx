import React, { useState } from "react";
import "../styles/PastExamForm.css";   // ✅ 修正

export default function PastExamForm({ onSubmit }) {
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !link.trim()) return;
    onSubmit({ title: title.trim(), link: link.trim() });
    setTitle("");
    setLink("");
  };

  return (
    <form className="exam-form" onSubmit={handleSubmit}>
      <h4>新增考古題</h4>
      <div className="exam-group">
        <label>標題</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="exam-group">
        <label>下載連結</label>
        <input value={link} onChange={(e) => setLink(e.target.value)} />
      </div>
      <button type="submit" className="exam-btn">
        新增
      </button>
    </form>
  );
}
