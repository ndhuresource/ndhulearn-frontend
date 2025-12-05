import React, { useEffect, useMemo, useState } from "react";
import StarRating from "./StarRating";
import {
  getNoteAgg,
  upsertNoteRating,
  getNoteRatings,
  canRate,
} from "../lib/noteRatings";
import { getCurrentUser } from "../utils/db";

export default function NoteDetailModal({ open, note, onClose, onRated }) {
  const me = getCurrentUser();
  const noteId = note?.id || null;

  // 聚合（平均） + 列表
  const [agg, setAgg] = useState({ avg: 0, count: 0, avgByDim: {}, list: [] });

  // 我自己的編輯狀態（可覆寫）
  const [stars, setStars] = useState({
    completeness: 0,
    accuracy: 0,
    relevance: 0,
    readability: 0,
    credibility: 0,
  });
  const [overall, setOverall] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [isAnon, setIsAnon] = useState(false);
  const [busy, setBusy] = useState(false);

  // 是否已完成「點開附件/連結」的下載憑證
  const okToRate = useMemo(() => {
    if (!me?.email || !noteId) return false;
    return canRate(noteId, me.email);
  }, [me?.email, noteId]);

  useEffect(() => {
    if (!open || !noteId) return;
    refreshAgg();

    // 把「我自己的舊評分」帶入（同帳號只有一筆，可覆寫）
    const mine =
      getNoteRatings(noteId).find((r) => r.email === me?.email) || null;
    if (mine) {
      setStars({
        completeness: Number(mine.stars?.completeness || 0),
        accuracy: Number(mine.stars?.accuracy || 0),
        relevance: Number(mine.stars?.relevance || 0),
        readability: Number(mine.stars?.readability || 0),
        credibility: Number(mine.stars?.credibility || 0),
      });
      setOverall(Number(mine.overall || 0));
      setCommentText(mine.comment || "");
      setIsAnon(!!mine.isAnon);
    } else {
      setStars({
        completeness: 0,
        accuracy: 0,
        relevance: 0,
        readability: 0,
        credibility: 0,
      });
      setOverall(0);
      setCommentText("");
      setIsAnon(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, noteId]);

  function refreshAgg() {
    if (!noteId) return;
    const a = getNoteAgg(noteId) || {};
    setAgg({
      avg: Number(a.avg || 0),
      count: Number(a.count || 0),
      avgByDim: a.avgByDim || {},
      list: Array.isArray(a.list) ? a.list : [],
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!me?.email) {
      alert("請先登入再評分 / 留言");
      return;
    }
    if (!okToRate) {
      alert("請先開啟一次『雲端連結或附件』，完成後才可評分/留言。");
      return;
    }

    const anyStar =
      Number(stars.completeness) > 0 ||
      Number(stars.accuracy) > 0 ||
      Number(stars.relevance) > 0 ||
      Number(stars.readability) > 0 ||
      Number(stars.credibility) > 0 ||
      Number(overall) > 0;

    if (!anyStar && !commentText.trim()) {
      alert("請至少給任一面向/整體評分，或留下留言。");
      return;
    }

    setBusy(true);
    upsertNoteRating(noteId, me, {
      stars,
      overall: Number(overall || 0),
      comment: commentText,
      isAnon,
    });
    setBusy(false);

    refreshAgg();
    onRated?.();
    alert("已儲存！");
  }

  if (!open || !note) return null;

  return (
    <div style={S.backdrop} onClick={onClose}>
      <div style={S.card} onClick={(e) => e.stopPropagation()}>
        {/* 標題 + 檔案/連結 */}
        <div style={S.head}>
          <div style={{ display: "grid", gap: 6 }}>
            <div style={{ fontWeight: 800, fontSize: 18 }}>
              {note.title || "未命名筆記"}
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {note.link && (
                <a href={note.link} target="_blank" rel="noreferrer">
                  📎 {note.link}
                </a>
              )}
              {(note.files || []).map((f, i) => {
                const href = f.dataUrl || f.url;
                const isDataUrl = !!f.dataUrl;
                return (
                  <a
                    key={i}
                    href={href}
                    {...(isDataUrl
                      ? { download: f.name }
                      : { target: "_blank", rel: "noreferrer" })}
                  >
                    📄 {f.name || "附件"}
                  </a>
                );
              })}
            </div>
          </div>
          <button onClick={onClose} style={S.ghost}>
            關閉
          </button>
        </div>

        {/* 我的評分/留言（不顯示頂部平均，避免視覺混淆） */}
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8 }}>
          <Field labelText="內容完整性">
            <StarRating
              value={Number(stars.completeness || 0)}
              onChange={(v) =>
                setStars((s) => ({ ...s, completeness: Number(v || 0) }))
              }
            />
          </Field>
          <Field labelText="內容準確性">
            <StarRating
              value={Number(stars.accuracy || 0)}
              onChange={(v) =>
                setStars((s) => ({ ...s, accuracy: Number(v || 0) }))
              }
            />
          </Field>
          <Field labelText="內容相關性">
            <StarRating
              value={Number(stars.relevance || 0)}
              onChange={(v) =>
                setStars((s) => ({ ...s, relevance: Number(v || 0) }))
              }
            />
          </Field>
          <Field labelText="易讀性">
            <StarRating
              value={Number(stars.readability || 0)}
              onChange={(v) =>
                setStars((s) => ({ ...s, readability: Number(v || 0) }))
              }
            />
          </Field>
          <Field labelText="來源可信度">
            <StarRating
              value={Number(stars.credibility || 0)}
              onChange={(v) =>
                setStars((s) => ({ ...s, credibility: Number(v || 0) }))
              }
            />
          </Field>

          <Field labelText="整體評分">
            <StarRating
              value={Number(overall || 0)}
              onChange={(v) => setOverall(Number(v || 0))}
            />
          </Field>

          <div>
            <label style={S.labelBlock}>留言（可選）</label>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={3}
              placeholder="開啟一次附件或連結後才可評分 / 留言"
              style={S.textarea}
            />
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input
                type="checkbox"
                checked={isAnon}
                onChange={(e) => setIsAnon(e.target.checked)}
              />
              匿名
            </label>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button type="button" style={S.ghost} onClick={onClose}>
              取消
            </button>
            <button type="submit" style={S.primary} disabled={busy}>
              {busy ? "送出中…" : "送出"}
            </button>
          </div>
        </form>

        {/* 所有評價（包含各面向平均） */}
        <div style={{ marginTop: 14 }}>
          <h4 style={{ margin: "6px 0" }}>所有評價</h4>

          <div style={S.summaryBox}>
            <RowAvg labelText="整體評分" val={Number(agg.avg || 0)} count={agg.count} />
            <RowAvg
              labelText="內容完整性"
              val={Number(agg.avgByDim?.completeness || 0)}
            />
            <RowAvg
              labelText="內容準確性"
              val={Number(agg.avgByDim?.accuracy || 0)}
            />
            <RowAvg
              labelText="內容相關性"
              val={Number(agg.avgByDim?.relevance || 0)}
            />
            <RowAvg
              labelText="易讀性"
              val={Number(agg.avgByDim?.readability || 0)}
            />
            <RowAvg
              labelText="來源可信度"
              val={Number(agg.avgByDim?.credibility || 0)}
            />
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {agg.list
              .slice()
              .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
              .map((r) => (
                <div key={r.id} style={S.reviewItem}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{r.by || "匿名"}</div>
                    <div style={{ color: "#999", fontSize: 12 }}>
                      {formatTs(r.updatedAt || r.createdAt)}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <StarRating value={Number(r.overall || 0)} readOnly size={14} />
                    <span style={{ color: "#555" }}>
                      {Number(r.overall || 0).toFixed(1)} / 5
                    </span>
                  </div>
                  {r.comment ? (
                    <div style={{ whiteSpace: "pre-wrap", marginTop: 4 }}>
                      {r.comment}
                    </div>
                  ) : null}
                </div>
              ))}
            {agg.list.length === 0 && (
              <div style={{ color: "#777" }}>尚無評價</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- 小元件（避免命名衝突都用 labelText） ---------------- */
function Field({ labelText, children }) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <label style={S.labelStrong}>{labelText}</label>
      <div>{children}</div>
    </div>
  );
}
function RowAvg({ labelText, val, count }) {
  const v = Number(val || 0);
  return (
    <div style={S.rowAvg}>
      <div>{labelText}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <StarRating value={v} readOnly size={14} />
        <span style={{ minWidth: 60 }}>
          {v.toFixed(1)} / 5{typeof count === "number" ? `（${count} 則）` : ""}
        </span>
      </div>
    </div>
  );
}

/* ---------------- 工具 ---------------- */
function formatTs(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}/${m}/${da} ${hh}:${mm}`;
}

/* ---------------- 樣式 ---------------- */
const S = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.35)",
    display: "grid",
    placeItems: "center",
    zIndex: 80,
  },
  card: {
    width: "min(900px, 95vw)",
    maxHeight: "85vh",
    overflow: "auto",
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #eef0f2",
    padding: 14,
    display: "grid",
    gap: 10,
  },
  head: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  labelStrong: { fontWeight: 700 },
  labelBlock: { display: "block", fontWeight: 700, marginBottom: 4 },
  textarea: {
    width: "100%",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: 10,
    outline: "none",
  },
  primary: {
    background: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "8px 12px",
    cursor: "pointer",
  },
  ghost: {
    background: "transparent",
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: "6px 12px",
    cursor: "pointer",
  },
  summaryBox: {
    border: "1px solid #eef0f2",
    borderRadius: 10,
    padding: 10,
    display: "grid",
    gap: 6,
    marginBottom: 10,
  },
  rowAvg: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reviewItem: {
    background: "#f9fafb",
    border: "1px solid #eef0f2",
    borderRadius: 10,
    padding: "10px 12px",
  },
};
