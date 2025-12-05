// src/components/NoteRatingPanel.jsx
import React, { useEffect, useMemo, useState } from "react";
import StarRating from "./StarRating";
import { getNoteRating, rateNote, canRateNote, DIMENSIONS } from "../lib/notesStore";

export default function NoteRatingPanel({ noteId }) {
  const [data, setData] = useState(() => getNoteRating(noteId));
  const [overall, setOverall] = useState(0);
  const [dims, setDims] = useState({}); // { key: stars }
  const [comment, setComment] = useState("");

  const cur = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("currentUser") || "null"); }
    catch { return null; }
  }, []);

  useEffect(() => {
    // 初始化平均
    const agg = getNoteRating(noteId);
    setData(agg);

    // 若已評過，帶入我的上一筆
    const me = cur?.email
      ? (agg.ratings || []).find((r) => r.userEmail === cur.email)
      : null;
    if (me) {
      setOverall(me.overall || 0);
      setDims(me.dims || {});
      setComment(me.comment || "");
    }
  }, [noteId, cur?.email]);

  const downloaded = cur?.email ? canRateNote(noteId, cur.email) : false;

  const setDimStar = (key, val) =>
    setDims((prev) => ({ ...prev, [key]: val }));

  const onSubmit = (e) => {
    e.preventDefault();
    if (!cur?.email) return alert("請先登入再評分");
    if (!downloaded) return alert("需先下載檔案後才能評分唷！");
    if (!overall) return alert("請選擇『整體』星數");

    const next = rateNote(noteId, {
      userEmail: cur.email,
      overall,
      dims,
      comment,
    });
    setData(next);
    alert("感謝你的回饋！");
  };

  return (
    <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: 16, display: "grid", gap: 12 }}>
      {/* 整體平均 + 總數 */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <StarRating value={data.avg} readOnly size={22} />
        <strong style={{ fontSize: 18 }}>{data.avg.toFixed(1)}</strong>
        <span style={{ color: "#777" }}>（{data.count} 則評分）</span>
      </div>

      {/* 各面向平均 */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {DIMENSIONS.map((d) => (
          <div key={d.key} style={{ display: "flex", alignItems: "center", gap: 6, background: "#f7f7f7", borderRadius: 999, padding: "4px 10px" }}>
            <span style={{ fontSize: 12, color: "#555" }}>{d.label}</span>
            <StarRating value={data.avgByDim?.[d.key] || 0} readOnly size={16} />
          </div>
        ))}
      </div>

      {/* 我的評分表單 */}
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <strong>整體：</strong>
          <StarRating value={overall} onChange={setOverall} size={28} />
          {!downloaded && <span style={{ color: "#999" }}>（下載後才能評分）</span>}
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {DIMENSIONS.map((d) => (
            <div key={d.key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 170 }}>{d.label}</span>
              <StarRating
                value={dims[d.key] || 0}
                onChange={(v) => setDimStar(d.key, v)}
                size={22}
              />
            </div>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="可寫下簡短心得（選填）"
          style={{ border: "1px solid #ddd", borderRadius: 8, padding: 10, resize: "vertical" }}
        />

        <div>
          <button
            type="submit"
            style={{ border: 0, borderRadius: 8, padding: "8px 12px", background: "#1976d2", color: "#fff" }}
          >
            送出評分
          </button>
        </div>
      </form>

      {/* 評分清單 */}
      <div style={{ display: "grid", gap: 10 }}>
        {(data.ratings || []).length === 0 ? (
          <p style={{ color: "#777", margin: 0 }}>尚無評分，成為第一個回饋的人！</p>
        ) : (
          data.ratings
            .slice()
            .sort((a, b) => b.createdAt - a.createdAt)
            .map((r) => (
              <div key={`${r.userEmail}-${r.createdAt}`} style={{ borderTop: "1px solid #f0f0f0", paddingTop: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <StarRating value={r.overall || r.stars || 0} readOnly size={18} />
                  <span style={{ color: "#555" }}>{r.userEmail}</span>
                  <span style={{ color: "#999", fontSize: 12 }}>{new Date(r.createdAt).toLocaleString()}</span>
                </div>

                {/* 顯示該使用者給的各面向星等（若有） */}
                {!!r.dims && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                    {DIMENSIONS.map((d) =>
                      r.dims?.[d.key] ? (
                        <div key={d.key} style={{ display: "flex", alignItems: "center", gap: 6, background: "#fafafa", borderRadius: 8, padding: "2px 8px" }}>
                          <span style={{ fontSize: 12, color: "#666" }}>{d.label}</span>
                          <StarRating value={r.dims[d.key]} readOnly size={14} />
                        </div>
                      ) : null
                    )}
                  </div>
                )}

                {r.comment && <div style={{ whiteSpace: "pre-wrap", marginTop: 6 }}>{r.comment}</div>}
              </div>
            ))
        )}
      </div>
    </div>
  );
}
