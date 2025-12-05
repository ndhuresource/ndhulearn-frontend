// src/components/ResourceUploadModal.jsx
import React, { useState } from "react";
import { resourceService } from "../services/resourceService";

export default function ResourceUploadModal({ courseId, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔥 新增狀態：控制流程與同意書
  const [showConsent, setShowConsent] = useState(false); // 是否顯示版權同意頁
  const [isAgreed, setIsAgreed] = useState(false);       // 是否已勾選同意

  const [formData, setFormData] = useState({
    title: "",
    teacher: "", 
    year: new Date().getFullYear(),
    resource_type: "筆記",
    grade_level: "學士",
    description: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  // 步驟 1: 基本驗證，通過後顯示同意書
  const handlePreSubmit = (e) => {
    e.preventDefault();
    if (!file) return alert("請選擇檔案！");
    if (!formData.title) return alert("請輸入資源標題");
    if (!formData.teacher) return alert("請輸入授課教師");

    // 驗證通過，切換到同意書畫面
    setShowConsent(true);
  };

  // 步驟 2: 真正的上傳邏輯
  const handleFinalSubmit = async () => {
    if (!isAgreed) return alert("請先勾選同意聲明");

    setLoading(true);

    const data = new FormData();
    data.append("file", file);
    data.append("course_id", courseId);
    data.append("title", formData.title);
    data.append("teacher", formData.teacher);
    data.append("year", formData.year);
    data.append("resource_type", formData.resource_type);
    data.append("grade_level", formData.grade_level);
    data.append("description", formData.description);

    try {
      await resourceService.upload(data);
      alert("上傳成功！感謝您的無私分享，已獲得 20 點積分作為獎勵！🎉");
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error) {
      console.error(error);
      alert("上傳失敗：" + (error.response?.data?.message || "請稍後再試"));
      // 失敗後可以選擇留著畫面或是關閉，這裡我們先不關閉，讓用戶重試
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3>{showConsent ? "⚠️ 版權聲明確認" : "📤 上傳學習資源"}</h3>
          <button onClick={onClose} style={styles.closeBtn}>×</button>
        </div>

        {/* 根據 showConsent 狀態切換顯示內容 */}
        {!showConsent ? (
          // ── 畫面 A: 填寫表單 ──
          <form onSubmit={handlePreSubmit} style={styles.form}>
            <div style={styles.field}>
              <label>選擇檔案 (PDF/圖片/Zip)</label>
              <input type="file" onChange={handleFileChange} required />
            </div>

            <div style={styles.field}>
              <label>資源標題</label>
              <input 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                placeholder="例如：112-1 期中考考古題"
                required 
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label>授課教師</label>
              <input 
                name="teacher" 
                value={formData.teacher} 
                onChange={handleChange} 
                placeholder="例如：王小明"
                required 
                style={styles.input}
              />
            </div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label>類型</label>
                <select name="resource_type" value={formData.resource_type} onChange={handleChange} style={styles.input}>
                  <option value="筆記">筆記</option>
                  <option value="期中">期中考</option>
                  <option value="期末">期末考</option>
                </select>
              </div>

              <div style={styles.field}>
                <label>年份</label>
                <input 
                  type="number" 
                  name="year" 
                  value={formData.year} 
                  onChange={handleChange} 
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.field}>
              <label>描述 / 備註</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                placeholder="老師的出題風格、筆記重點..."
                rows={3}
                style={styles.input}
              />
            </div>

            <button type="submit" style={styles.submitBtn}>
              下一步：確認上傳
            </button>
          </form>
        ) : (
          // ── 畫面 B: 版權同意書 ──
          <div style={styles.consentBox}>
            <div style={styles.warningIcon}>🛡️</div>
            <h4 style={{margin: '10px 0', color: '#d32f2f'}}>智慧財產權提醒</h4>
            
            <p style={{lineHeight: '1.6', color: '#555', fontSize: '15px'}}>
              為了維護良好的學術環境並保護知識產權，<br/>
              請確認您上傳的資源符合以下規定：
            </p>
            
            <ul style={{textAlign: 'left', color: '#666', fontSize: '14px', margin: '15px 0', paddingLeft: '20px'}}>
              <li>請勿上傳未經授權的教授授課講義、投影片原檔。</li>
              <li>請勿上傳市售教科書的掃描檔或電子書。</li>
              <li>筆記內容應為您個人的學習整理。</li>
              <li>若是考古題，請確認教授同意公開。</li>
            </ul>

            <div style={styles.checkboxContainer}>
              <input 
                type="checkbox" 
                id="agree-check"
                checked={isAgreed} 
                onChange={(e) => setIsAgreed(e.target.checked)} 
                style={{width: '18px', height: '18px', cursor: 'pointer'}}
              />
              <label htmlFor="agree-check" style={{cursor: 'pointer', fontWeight: 'bold', userSelect: 'none'}}>
                我已徵得授課教師或知識產權所有者同意
              </label>
            </div>

            <div style={styles.row}>
              <button 
                onClick={() => setShowConsent(false)} 
                style={{...styles.submitBtn, background: '#9e9e9e', flex: 1}}
              >
                返回修改
              </button>
              <button 
                onClick={handleFinalSubmit} 
                disabled={!isAgreed || loading}
                style={{
                  ...styles.submitBtn, 
                  background: isAgreed ? '#2e7d32' : '#ccc', 
                  flex: 1,
                  cursor: isAgreed ? 'pointer' : 'not-allowed'
                }}
              >
                {loading ? "上傳中..." : "確認上傳"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(0,0,0,0.5)", zIndex: 1000,
    display: "flex", alignItems: "center", justifyContent: "center"
  },
  modal: {
    background: "white", padding: "24px", borderRadius: "12px",
    width: "90%", maxWidth: "500px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
    maxHeight: "90vh", overflowY: "auto"
  },
  header: {
    display: "flex", justifyContent: "space-between", marginBottom: "20px"
  },
  closeBtn: {
    background: "none", border: "none", fontSize: "24px", cursor: "pointer"
  },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  field: { display: "flex", flexDirection: "column", gap: "6px", flex: 1 },
  row: { display: "flex", gap: "10px" },
  input: {
    padding: "8px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "14px"
  },
  submitBtn: {
    padding: "12px", background: "#2563eb", color: "white", border: "none",
    borderRadius: "6px", cursor: "pointer", fontWeight: "bold", marginTop: "10px",
    fontSize: "15px", transition: "0.2s"
  },
  // 同意書相關樣式
  consentBox: {
    textAlign: "center", display: "flex", flexDirection: "column", gap: "15px", padding: "10px 0"
  },
  warningIcon: {
    fontSize: "48px", marginBottom: "0px"
  },
  checkboxContainer: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", 
    background: "#f9f9f9", padding: "15px", borderRadius: "8px", border: "1px solid #eee",
    marginTop: "10px", marginBottom: "10px"
  }
};