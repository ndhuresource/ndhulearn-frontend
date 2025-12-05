// src/components/CourseCard.jsx
import React, { useMemo, useState } from "react";
import { getCourses, setCourses, getCurrentUser } from "../utils/db";
import useLoginGate from "../hooks/useLoginGate";
import StarRating from "./StarRating";
import NoteDetailModal from "./NoteDetailModal";
import EmojiAvatar from "./EmojiAvatar";
import { getNoteAgg, markDownloaded } from "../lib/noteRatings";

/* utils */
function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}
function fmt(ts) {
  try {
    const d = new Date(ts);
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${String(
      d.getHours()
    ).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  } catch {
    return "";
  }
}
function courseAgg(reviews) {
  const arr = (reviews || []).filter(
    (r) => typeof r.starsOverall === "number" && r.starsOverall > 0
  );
  const count = arr.length;
  const avg = count
    ? Math.round(
        (arr.reduce((s, r) => s + Number(r.starsOverall || 0), 0) / count) * 10
      ) / 10
    : 0;
  return { avg, count };
}

/* main */
export default function CourseCard({ course, onChange }) {
  const me = getCurrentUser();
  const gate = useLoginGate();

  const [openNote, setOpenNote] = useState(null);
  const [openCourseReview, setOpenCourseReview] = useState(false);

  // 收合開關（預設隱藏）
  const [showNotes, setShowNotes] = useState(false);
  const [showReviews, setShowReviews] = useState(false);

  const [comment, setComment] = useState("");
  const [isAnon, setIsAnon] = useState(false);

  const notes = useMemo(
    () =>
      Array.isArray(course.notes)
        ? course.notes
            .slice()
            .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        : [],
    [course.notes]
  );
  const reviews = useMemo(
    () =>
      Array.isArray(course.reviews)
        ? course.reviews
            .slice()
            .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        : [],
    [course.reviews]
  );
  const overall = useMemo(() => courseAgg(reviews), [reviews]);

  const refreshCourse = () => onChange?.();

  // 課程留言（需登入）
  const submitComment = (e) => {
    e.preventDefault();
    const u = gate();
    if (!u) return;
    const text = comment.trim();
    if (!text) return;

    const list = getCourses();
    const idx = list.findIndex((c) => c.id === course.id);
    if (idx === -1) return;

    const cur = { ...list[idx] };
    const arr = Array.isArray(cur.reviews) ? cur.reviews.slice() : [];

    const userName =
      isAnon ? "匿名" : u?.name || u?.email?.split("@")[0] || "使用者";
    arr.push({
      id: `rv_${Date.now()}`,
      userName,
      userEmail: u?.email || null,
      isAnon: !!isAnon,
      comment: text,
      createdAt: Date.now(),
    });

    cur.reviews = arr;
    list[idx] = cur;
    setCourses(list);
    setComment("");
    setIsAnon(false);
    refreshCourse();
  };

  // 點附件→標記可評分（本機）
  const handleOpenAttachment = (noteId) => {
    if (me?.email) markDownloaded(noteId, me.email);
  };

  return (
    <div style={css.card}>
      {/* 抬頭：左課名，右整體星等 + 新增評價（單帳號唯一、可更新） */}
      <div style={css.header}>
        <div>
          <h3 style={{ margin: 0 }}>{course.name}</h3>
          <div style={{ color: "#666", fontSize: 14 }}>
            老師：{course.teacher || "—"}　/　科系：{course.subject || "—"}　/　年級：
            {course.grade || "—"}
          </div>
        </div>

        <div style={css.headRight}>
          <div style={css.aggRow}>
            <StarRating value={overall.avg} readOnly size={16} />
            <b>{overall.avg.toFixed(1)} / 5</b>
            <span style={{ color: "#777" }}>・{overall.count} 則評價</span>
          </div>
          <button
            style={css.btnBlue}
            onClick={() => gate() && setOpenCourseReview(true)}
          >
            新增評價
          </button>
        </div>
      </div>

      {/* 考古題 / 筆記（收合） */}
      <div>
        <div style={css.sectionBar}>
          <h4 style={{ margin: 0 }}>
            考古題 / 筆記
            <span style={css.countText}>（{notes.length}）</span>
          </h4>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              style={css.btnGhostSm}
              onClick={() => setShowNotes((s) => !s)}
            >
              {showNotes ? "收起" : "展開"}
            </button>
            <AddNoteButton course={course} onCreated={refreshCourse} />
          </div>
        </div>

        {showNotes &&
          (notes.length === 0 ? (
            <div style={{ color: "#999", fontSize: 14 }}>
              目前沒有資料，搶先分享吧！
            </div>
          ) : (
            notes.map((note) => {
              const agg = getNoteAgg(note.id);
              const isOwner =
                me?.email && note.uploader?.email === me.email;
              return (
                <div key={note.id} style={css.noteItem}>
                  <div style={css.noteTop}>
                    <div style={{ display: "grid", gap: 4 }}>
                      <div style={{ fontWeight: 700 }}>
                        {note.title || "未命名筆記"}
                        {(note.uploader?.name || note.uploader?.email) && (
                          <span style={css.by}>
                            （by {note.uploader?.name || note.uploader?.email}）
                          </span>
                        )}
                      </div>
                      <div style={css.noteAgg}>
                        <StarRating value={agg.avg || 0} readOnly size={14} />
                        <span style={{ fontWeight: 700 }}>
                          {(agg.avg || 0).toFixed(1)} / 5
                        </span>
                        <span>・{agg.count || 0} 則評價</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        style={css.btnBlueSm}
                        onClick={() => setOpenNote(note)}
                      >
                        查看 / 評價
                      </button>
                      {isOwner && (
                        <button
                          style={css.btnGhostSm}
                          onClick={() => removeNote(course.id, note.id)}
                        >
                          刪除
                        </button>
                      )}
                    </div>
                  </div>

                  {(note.files?.length || note.link) ? (
                    <div style={css.attachRow}>
                      {note.link && (
                        <a
                          href={note.link}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => handleOpenAttachment(note.id)}
                          style={css.link}
                        >
                          🔗 雲端連結
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
                            onClick={() => handleOpenAttachment(note.id)}
                            style={css.link}
                          >
                            📎 {f.name || "附件"}
                          </a>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })
          ))}
      </div>

      {/* 評論（收合） */}
      <div style={{ marginTop: 8 }}>
        <div style={css.sectionBar}>
          <h4 style={{ margin: 0 }}>
            評論<span style={css.countText}>（{reviews.length}）</span>
          </h4>
          <button
            style={css.btnGhostSm}
            onClick={() => setShowReviews((s) => !s)}
          >
            {showReviews ? "收起" : "展開"}
          </button>
        </div>

        {showReviews &&
          (reviews.length === 0 ? (
            <div style={{ color: "#888" }}>尚無留言，搶先分享吧！</div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {reviews.map((r) => (
                <div key={r.id} style={css.review}>
                  <div
                    style={{ display: "flex", gap: 10, alignItems: "flex-start" }}
                  >
                    <EmojiAvatar emoji="🙂" size={28} />
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 4,
                        }}
                      >
                        <div style={{ color: "#333", fontWeight: 600 }}>
                          {r.userName || "匿名"}
                        </div>
                        <div style={{ color: "#999", fontSize: 12 }}>
                          {fmt(r.createdAt)}
                        </div>
                      </div>
                      {typeof r.starsOverall === "number" &&
                        r.starsOverall > 0 && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              marginBottom: 4,
                            }}
                          >
                            <StarRating value={r.starsOverall} readOnly size={14} />
                            <span style={{ color: "#555" }}>
                              {r.starsOverall} / 5
                            </span>
                          </div>
                        )}
                      {r.comment && (
                        <div style={{ whiteSpace: "pre-wrap", color: "#222" }}>
                          {r.comment}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}

        {/* 留言輸入維持常駐 */}
        {!me?.email ? (
          <div style={{ marginTop: 8, color: "#d32f2f" }}>請先登入後才能留言。</div>
        ) : (
          <form
            onSubmit={submitComment}
            style={{ display: "grid", gap: 8, marginTop: 8 }}
          >
            <label style={{ fontWeight: 600 }}>留言</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="留下你的想法…"
              rows={3}
              style={css.textarea}
            />
            <label
              style={{ display: "flex", alignItems: "center", gap: 6, color: "#555" }}
            >
              <input
                type="checkbox"
                checked={isAnon}
                onChange={(e) => setIsAnon(e.target.checked)}
              />
              匿名
            </label>
            <div>
              <button type="submit" style={css.btnBlue}>
                送出留言
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 彈窗們 */}
      <NoteDetailModal
        open={!!openNote}
        note={openNote}
        onClose={() => setOpenNote(null)}
        onRated={() => refreshCourse()}
      />
      {openCourseReview && (
        <CourseReviewModal
          course={course}
          onClose={() => setOpenCourseReview(false)}
          onSaved={refreshCourse}
        />
      )}
    </div>
  );
}

/* 課程整體評價（單帳號唯一：若已有則覆寫） */
function CourseReviewModal({ course, onClose, onSaved }) {
  const gate = useLoginGate();
  const [stars, setStars] = useState(0);
  const [text, setText] = useState("");
  const [isAnon, setIsAnon] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    const u = gate();
    if (!u) return;
    const s = Math.max(1, Math.min(5, Number(stars) || 0));

    const list = getCourses();
    const idx = list.findIndex((c) => c.id === course.id);
    if (idx === -1) return;
    const cur = { ...list[idx] };
    const arr = Array.isArray(cur.reviews) ? cur.reviews.slice() : [];

    const userName =
      isAnon ? "匿名" : u?.name || u?.email?.split("@")[0] || "使用者";

    // 單帳號唯一：如已評過（有 starsOverall）→ 覆寫
    const existIdx = arr.findIndex(
      (r) => r.userEmail === u.email && typeof r.starsOverall === "number"
    );
    const payload = {
      id: existIdx >= 0 ? arr[existIdx].id : `rv_${Date.now()}`,
      userName,
      userEmail: u.email,
      isAnon: !!isAnon,
      starsOverall: s,
      comment: text.trim(),
      createdAt: Date.now(),
    };
    if (existIdx >= 0) arr[existIdx] = payload;
    else arr.push(payload);

    cur.reviews = arr;
    list[idx] = cur;
    setCourses(list);
    onSaved?.();
    onClose?.();
  };

  return (
    <div style={css.backdrop} onClick={onClose}>
      <div style={css.modal} onClick={(e) => e.stopPropagation()}>
        <div style={css.modalHead}>
          <h3 style={{ margin: 0 }}>新增課程評價</h3>
          <button style={css.btnGhost} onClick={onClose}>
            關閉
          </button>
        </div>
        <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
          <div>
            <label style={css.label}>整體評分</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <StarRating value={stars} onChange={setStars} size={20} />
              <span style={{ color: "#555" }}>{stars || 0} / 5</span>
            </div>
          </div>
          <div>
            <label style={css.label}>評語（可選）</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              placeholder="想說點什麼？"
              style={css.textarea}
            />
          </div>
          <label
            style={{ display: "flex", alignItems: "center", gap: 6, color: "#555" }}
          >
            <input
              type="checkbox"
              checked={isAnon}
              onChange={(e) => setIsAnon(e.target.checked)}
            />
            匿名
          </label>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button type="button" style={css.btnGhost} onClick={onClose}>
              取消
            </button>
            <button type="submit" style={css.btnBlue}>
              送出
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* 上傳筆記 */
function AddNoteButton({ course, onCreated }) {
  const gate = useLoginGate();
  const [open, setOpen] = useState(false);
  const tryOpen = () => {
    if (!gate()) return;
    setOpen(true);
  };
  return (
    <>
      <button style={css.btnBlueSm} onClick={tryOpen}>
        新增考古題 / 筆記
      </button>
      {open && (
        <AddNoteModal
          courseId={course.id}
          onClose={() => setOpen(false)}
          onCreated={onCreated}
        />
      )}
    </>
  );
}
function AddNoteModal({ courseId, onClose, onCreated }) {
  const me = getCurrentUser();
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);

  const onPick = async (e) => {
    const list = Array.from(e.target.files || []);
    if (!list.length) return;
    setBusy(true);
    const acc = [];
    for (const f of list) {
      const dataUrl = await readAsDataURL(f);
      acc.push({ name: f.name, dataUrl, type: f.type });
    }
    setFiles((p) => [...p, ...acc]);
    setBusy(false);
  };

  const submit = (e) => {
    e.preventDefault();
    const name = title.trim();
    if (!name && !link && files.length === 0) {
      alert("請至少填寫標題或附上連結/檔案");
      return;
    }
    const list = getCourses();
    const idx = list.findIndex((c) => c.id === courseId);
    if (idx === -1) return;
    const cur = { ...list[idx] };
    const arr = Array.isArray(cur.notes) ? cur.notes.slice() : [];

    arr.unshift({
      id: `note_${Date.now()}`,
      title: name || "未命名筆記",
      link: link.trim() || "",
      files,
      uploader: {
        email: me?.email || null,
        name: me?.name || me?.email?.split("@")[0] || "使用者",
      },
      createdAt: Date.now(),
    });

    cur.notes = arr;
    list[idx] = cur;
    setCourses(list);
    onCreated?.();
    onClose?.();
  };

  return (
    <div style={css.backdrop} onClick={onClose}>
      <div style={css.modal} onClick={(e) => e.stopPropagation()}>
        <div style={css.modalHead}>
          <h3 style={{ margin: 0 }}>新增考古題 / 筆記</h3>
          <button style={css.btnGhost} onClick={onClose}>
            關閉
          </button>
        </div>
        <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
          <div>
            <label style={css.label}>標題</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={css.input}
              placeholder="例如：期中重點整理"
            />
          </div>
          <div>
            <label style={css.label}>雲端連結（可選）</label>
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              style={css.input}
              placeholder="https://..."
            />
          </div>
          <div>
            <label style={css.label}>上傳檔案（可多選，可空）</label>
            <input type="file" multiple onChange={onPick} />
            {busy && <div style={{ color: "#666", fontSize: 12 }}>讀取中…</div>}
            {!!files.length && (
              <div
                style={{
                  marginTop: 6,
                  color: "#555",
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                {files.map((f, i) => (
                  <span key={i}>📎 {f.name}</span>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button type="button" style={css.btnGhost} onClick={onClose}>
              取消
            </button>
            <button type="submit" style={css.btnBlue}>
              建立
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* helpers */
function removeNote(courseId, noteId) {
  // eslint-disable-next-line no-restricted-globals
  if (!confirm("確定要刪除此筆記？")) return;
  const list = getCourses();
  const idx = list.findIndex((c) => c.id === courseId);
  if (idx === -1) return;
  const cur = { ...list[idx] };
  cur.notes = (cur.notes || []).filter((n) => n.id !== noteId);
  list[idx] = cur;
  setCourses(list);
}

/* styles */
const css = {
  card: {
    border: "1px solid #eaeaea",
    borderRadius: 12,
    padding: 16,
    display: "grid",
    gap: 14,
    background: "#fff",
  },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  headRight: { display: "grid", gap: 6, justifyItems: "end" },
  aggRow: { display: "flex", alignItems: "center", gap: 6 },
  sectionBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    margin: "6px 0 10px",
  },
  countText: { color: "#777", fontWeight: 400, fontSize: 13, marginLeft: 6 },

  noteItem: {
    background: "#f9fafb",
    border: "1px solid #eef0f2",
    borderRadius: 10,
    padding: 12,
    display: "grid",
    gap: 8,
    marginBottom: 10,
  },
  noteTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  noteAgg: { display: "flex", alignItems: "center", gap: 8, color: "#555" },
  by: { color: "#999", marginLeft: 8, fontWeight: 400, fontSize: 12 },
  attachRow: { display: "flex", gap: 10, flexWrap: "wrap", color: "#555", marginTop: 6 },
  link: { textDecoration: "none", color: "#1976d2" },

  review: { background: "#f9fafb", border: "1px solid #eef0f2", borderRadius: 10, padding: "10px 12px" },

  input: { width: "100%", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 10px", outline: "none" },
  textarea: { width: "100%", border: "1px solid #e2e8f0", borderRadius: 8, padding: 10, outline: "none" },
  label: { display: "block", marginBottom: 4, fontWeight: 600 },

  btnBlue: { background: "#1976d2", color: "#fff", border: "none", borderRadius: 8, padding: "8px 12px", cursor: "pointer" },
  btnBlueSm: { background: "#1976d2", color: "#fff", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer" },
  btnGhost: { background: "transparent", border: "1px solid #ddd", borderRadius: 8, padding: "8px 12px", cursor: "pointer" },
  btnGhostSm: { background: "transparent", border: "1px solid #ddd", borderRadius: 8, padding: "6px 10px", cursor: "pointer" },

  backdrop: { position: "fixed", inset: 0, background: "rgba(0,0,0,.35)", display: "grid", placeItems: "center", zIndex: 60 },
  modal: { width: "min(560px,95vw)", background: "#fff", borderRadius: 14, padding: 16, boxShadow: "0 14px 40px rgba(0,0,0,.2)", display: "grid", gap: 10 },
  modalHead: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
};
