import React, { useState } from "react";
import { getCourses, setCourses, getCurrentUser } from "../utils/db";
import "../styles/Courses.css";

/**
 * type: "考古題" | "筆記"
 * url: 可填 GDrive/雲端連結；text: 可貼重點
 */
export default function MaterialForm({ courseId, onClose, onSaved }) {
  const me = getCurrentUser();
  const [type, setType] = useState("考古題");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [anonymous, setAnonymous] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const list = getCourses();
    const i = list.findIndex(c => c.id === courseId);
    if (i < 0) return;

    list[i].materials.push({
      id: `m_${Date.now()}`,
      type, title: title.trim(),
      url: url.trim() || "",
      text: text.trim() || "",
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
          <h3>新增考古題 / 筆記</h3>
          <button className="btn-ghost" onClick={onClose}>關閉</button>
        </div>

        <form className="modal-body" onSubmit={submit}>
          <div className="row grid2">
            <div>
              <label>類型</label>
              <select value={type} onChange={e=>setType(e.target.value)}>
                <option>考古題</option>
                <option>筆記</option>
              </select>
            </div>
            <div>
              <label>標題</label>
              <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="例如：112 上 期中考題 / 熱傳筆記" />
            </div>
          </div>

          <div className="row">
            <label>連結（選填）</label>
            <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="貼上雲端連結（Google Drive/Dropbox）" />
          </div>

          <div className="row">
            <label>內文（選填）</label>
            <textarea rows={5} value={text} onChange={e=>setText(e.target.value)} placeholder="重點、作業提醒、出題方向…" />
          </div>

          <label className="check">
            <input type="checkbox" checked={anonymous} onChange={e=>setAnonymous(e.target.checked)} />
            匿名分享
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
