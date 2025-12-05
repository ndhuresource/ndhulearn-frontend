import React, { useState } from "react";
import { getCourses, setCourses, getCurrentUser } from "../utils/db";
import RatingStars from "./RatingStars";
import "../styles/Courses.css";

export default function ReviewForm({ courseId, onClose, onSaved }) {
  const me = getCurrentUser();
  const [rating, setRating] = useState(0);
  const [anonymous, setAnonymous] = useState(false);
  const [comment, setComment] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!rating || !comment.trim()) return;

    const list = getCourses();
    const i = list.findIndex(c => c.id === courseId);
    if (i < 0) return;

    list[i].reviews.push({
      id: `r_${Date.now()}`,
      rating,
      comment: comment.trim(),
      authorId: me?.id ?? null,
      authorName: anonymous || !me ? "匿名" : me.displayName,
      authorAvatar: anonymous || !me ? "👤" : me.avatar,
      anonymous: !!anonymous,
      createdAt: Date.now(),
      deleted: false
    });

    setCourses(list);
    onSaved?.();
    onClose?.();
  };

  return (
    <div className="modal">
      <div className="modal-card">
        <div className="modal-head">
          <h3>新增評價</h3>
          <button className="btn-ghost" onClick={onClose}>關閉</button>
        </div>

        <form className="modal-body" onSubmit={submit}>
          <div className="row">
            <label>評分</label>
            <RatingStars value={rating} onChange={setRating} />
          </div>
          <div className="row">
            <label>評論</label>
            <textarea rows={5} value={comment} onChange={e=>setComment(e.target.value)} />
          </div>
          <label className="check">
            <input type="checkbox" checked={anonymous} onChange={e=>setAnonymous(e.target.checked)} />
            匿名
          </label>

          <div className="modal-foot">
            <button className="btn-primary" type="submit">送出</button>
            <button className="btn-ghost" type="button" onClick={onClose}>取消</button>
          </div>
        </form>
      </div>
    </div>
  );
}
