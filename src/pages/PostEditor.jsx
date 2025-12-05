import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forumService } from "../services/forumService";
import "../styles/Board.css";
// 也可以引入 Market.css 來共用樣式
import "./Market.css"; 

export default function PostEditor() {
  const nav = useNavigate();
  const me = JSON.parse(localStorage.getItem("currentUser") || "null");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // 功能狀態
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  // 投票相關狀態
  const [withPoll, setWithPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState(["", ""]);

  if (!me) return null;

  // 圖片處理
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // 投票選項處理
  const handleOptionChange = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const addOption = () => {
    if (pollOptions.length >= 4) return alert("最多只能設定 4 個選項");
    setPollOptions([...pollOptions, ""]);
  };

  const removeOption = (index) => {
    if (pollOptions.length <= 2) return;
    setPollOptions(pollOptions.filter((_, i) => i !== index));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return alert("請輸入標題和內容");

    let finalOptions = null;
    if (withPoll) {
      finalOptions = pollOptions.filter(o => o.trim() !== "");
      if (finalOptions.length < 2) return alert("投票至少需要兩個有效選項");
    }

    setIsLoading(true);

    try {
      await forumService.createPost(
        title, 
        content, 
        finalOptions, 
        isAnonymous, 
        image        
      );
      
      alert("發文成功！");
      nav("/board", { replace: true });
    } catch (error) {
      console.error(error);
      alert("發文失敗");
    } finally {
      setIsLoading(false);
    }
  };

  // 定義共用的輸入框樣式
  const inputStyle = {
    width: '100%',
    padding: '12px 15px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s',
    marginBottom: '20px',
    fontFamily: 'inherit'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 'bold',
    color: '#334155',
    fontSize: '15px'
  };

  return (
    <div className="board-wrap" style={{ maxWidth: 800, margin: '40px auto' }}>
      
      {/* 頂部標題列 (已移除取消按鈕) */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        {/* 原本的「取消」按鈕已刪除 */}
        <h2 style={{ margin: 0, fontSize: '24px', color: '#1e293b' }}>新增文章</h2>
      </div>

      {/* 主要編輯卡片 */}
      <form onSubmit={submit} style={{ background: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        
        {/* 1. 圖片上傳區塊 */}
        <div className="form-group">
          <label style={labelStyle}>封面圖片 (選填)</label>
          {!preview ? (
            <label className="image-upload-area" style={{display:'flex', flexDirection:'column', alignItems:'center', padding:20, border:'2px dashed #cbd5e1', borderRadius:8, cursor:'pointer', color:'#64748b'}}>
              <input 
                type="file" accept="image/*" 
                onChange={handleImageChange} style={{ display: 'none' }} 
              />
              <span style={{fontSize: '24px', marginBottom: '5px'}}>📷</span>
              <span>點擊上傳圖片</span>
            </label>
          ) : (
            <div className="image-upload-area" style={{padding: 10, background: '#fff', border:'1px solid #eee', borderRadius:8, position:'relative'}}>
              <div className="image-preview-container" style={{textAlign:'center'}}>
                <img src={preview} alt="預覽" className="image-preview" style={{maxWidth:'100%', maxHeight: 300, borderRadius: 8}} />
                <button 
                  type="button" 
                  className="remove-image-btn" 
                  onClick={() => { setImage(null); setPreview(null); }}
                  style={{position:'absolute', top:5, right:5, background:'rgba(0,0,0,0.5)', color:'#fff', border:'none', borderRadius:'50%', width:24, height:24, cursor:'pointer'}}
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 2. 標題 */}
        <div>
          <label style={labelStyle}>標題</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="請輸入一個吸引人的標題..."
            disabled={isLoading}
            style={inputStyle}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
          />
        </div>

        {/* 3. 內容 */}
        <div>
          <label style={labelStyle}>內容</label>
          <textarea
            rows={12}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="分享你的想法、問題或經驗..."
            disabled={isLoading}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
          />
        </div>

        {/* 4. 功能設定區塊 (投票 & 匿名) */}
        <div style={{ marginTop: 10, padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none', marginBottom: 15 }}>
            <div style={{ 
              width: 40, height: 24, background: withPoll ? '#3b82f6' : '#cbd5e1', 
              borderRadius: 20, position: 'relative', transition: '0.3s' 
            }}>
              <div style={{ 
                width: 18, height: 18, background: '#fff', borderRadius: '50%', 
                position: 'absolute', top: 3, left: withPoll ? 19 : 3, transition: '0.3s' 
              }} />
              <input type="checkbox" checked={withPoll} onChange={e => setWithPoll(e.target.checked)} style={{display:'none'}} />
            </div>
            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#334155' }}>📊 發起投票</span>
          </label>

          {withPoll && (
            <div style={{ marginTop: 20, paddingLeft: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {pollOptions.map((opt, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ color: '#64748b', fontWeight: '500', width: 20 }}>{i + 1}.</span>
                    <input 
                      style={{ ...inputStyle, marginBottom: 0, padding: '10px' }}
                      placeholder={`選項 ${i + 1}`} 
                      value={opt} 
                      onChange={(e) => handleOptionChange(i, e.target.value)}
                      disabled={isLoading}
                    />
                    {pollOptions.length > 2 && (
                      <button 
                        type="button" 
                        onClick={() => removeOption(i)} 
                        style={{ background: '#fee2e2', border: 'none', borderRadius: '50%', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ef4444', flexShrink: 0 }}
                        title="刪除此選項"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 15 }}>
                {pollOptions.length < 4 ? (
                  <button 
                    type="button" 
                    onClick={addOption} 
                    style={{ background: '#fff', border: '1px solid #3b82f6', color: '#3b82f6', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
                  >
                    ＋ 新增選項
                  </button>
                ) : (
                  <div></div>
                )}
                <small style={{ color: '#94a3b8' }}>最多 4 個選項</small>
              </div>
            </div>
          )}

          <div style={{ height: 1, background: '#e2e8f0', margin: '15px 0' }} />

          {/* 匿名開關 */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none', color: '#64748b' }}>
            <input 
              type="checkbox" 
              checked={isAnonymous} 
              onChange={(e) => setIsAnonymous(e.target.checked)} 
              style={{ width: 18, height: 18, accentColor: '#3b82f6' }}
            />
            <span>匿名發文 (您的名稱將顯示為「匿名」)</span>
          </label>
        </div>

        {/* 5. 底部按鈕 */}
        <div style={{ marginTop: 40, display: 'flex', justifyContent: 'flex-end', gap: 15 }}>
          <button 
            type="button" 
            onClick={() => nav(-1)} 
            disabled={isLoading} 
            style={{ 
              padding: '12px 24px', borderRadius: '8px', border: 'none', background: '#f1f5f9', 
              color: '#475569', fontSize: '16px', cursor: 'pointer', fontWeight: '500' 
            }}
          >
            取消
          </button>
          <button 
            type="submit" 
            disabled={isLoading}
            style={{ 
              padding: '12px 30px', borderRadius: '8px', border: 'none', background: '#3b82f6', 
              color: '#fff', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold',
              boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.5)'
            }}
          >
            {isLoading ? "發布中..." : "確認發布"}
          </button>
        </div>

      </form>
    </div>
  );
}