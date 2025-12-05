import React, { useEffect, useState } from "react";
import StarRating from "./StarRating";
import { DIMENSIONS } from "../lib/ratingDims";
import { upsertCourseReview, getCourseAgg } from "../lib/courseReviews";

export default function CourseReviewModal({ open, onClose, courseId, onSaved }) {
  const cur = JSON.parse(localStorage.getItem("currentUser") || "null");
  const [overall, setOverall] = useState(0);
  const [dims, setDims] = useState({});
  const [comment, setComment] = useState("");
  const [anonymous, setAnonymous] = useState(false);

  useEffect(() => {
    if (!open) return;
    const agg = getCourseAgg(courseId);
    const me = cur?.email ? agg.reviews.find(r => r.userEmail === cur.email) : null;
    if (me) { setOverall(me.overall||0); setDims(me.dims||{}); setComment(me.comment||""); setAnonymous(!!me.anonymous); }
    else { setOverall(0); setDims({}); setComment(""); setAnonymous(false); }
  }, [open, courseId, cur?.email]);

  const setDim = (k, v) => setDims(prev => ({ ...prev, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    if (!cur?.email) return alert("請先登入再評價");
    if (!overall)   return alert("請選擇『整體』星數");
    const agg = upsertCourseReview(courseId, { userEmail: cur.email, overall, dims, comment, anonymous });
    onSaved && onSaved(agg);
    onClose && onClose();
  };

  if (!open) return null;

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.35)", display:"grid", placeItems:"center", zIndex:1000 }} onClick={onClose}>
      <div onClick={(e)=>e.stopPropagation()} style={{ width:680, maxWidth:"92vw", background:"#fff", borderRadius:12, padding:16, display:"grid", gap:12 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <h3 style={{ margin:0 }}>新增評價</h3>
          <button onClick={onClose} style={{ border:"1px solid #ddd", background:"#fff", borderRadius:8, padding:"6px 10px" }}>關閉</button>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:72, color:"#555" }}>整體</div>
          <StarRating value={overall} onChange={setOverall} size={28} />
        </div>

        <div style={{ display:"grid", gap:10 }}>
          {DIMENSIONS.map(d => (
            <div key={d.key} style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:160, color:"#555" }}>{d.label}</div>
              <StarRating value={dims[d.key] || 0} onChange={(v)=>setDim(d.key, v)} size={22} />
            </div>
          ))}
        </div>

        <div>
          <div style={{ marginBottom:6, color:"#555" }}>評論</div>
          <textarea value={comment} onChange={(e)=>setComment(e.target.value)} rows={4}
            style={{ width:"100%", border:"1px solid #ddd", borderRadius:8, padding:10, resize:"vertical" }}
            placeholder="想說什麼都可以（選填）" />
        </div>

        <label style={{ display:"inline-flex", alignItems:"center", gap:8 }}>
          <input type="checkbox" checked={anonymous} onChange={(e)=>setAnonymous(e.target.checked)} />
          匿名
        </label>

        <div style={{ display:"flex", gap:10 }}>
          <button onClick={submit} style={{ background:"#1976d2", color:"#fff", border:"none", borderRadius:8, padding:"8px 14px" }}>送出</button>
          <button onClick={onClose}  style={{ background:"#f3f4f6", color:"#333", border:"none", borderRadius:8, padding:"8px 14px" }}>取消</button>
        </div>
      </div>
    </div>
  );
}
