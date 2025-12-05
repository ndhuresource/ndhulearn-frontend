// src/pages/MarketEditor.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { marketplaceService } from "../services/marketplaceService";
import "./Market.css";

export default function MarketEditor() {
  const nav = useNavigate();
  const me = JSON.parse(localStorage.getItem("currentUser") || "null");
  
  if (!me) return null; 

  const [type, setType] = useState("selling"); 
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [contact, setContact] = useState(""); 
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null); 
  const [preview, setPreview] = useState(null); 
  const [isAnonymous, setIsAnonymous] = useState(false); // 🔥 新增：匿名狀態
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !price || !contact.trim()) {
      return alert("請填寫標題、價格、聯絡方式");
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('price', price);
      formData.append('type', type);
      // 🔥 新增：傳送匿名設定
      formData.append('is_anonymous', isAnonymous);
      
      if (image) formData.append('image', image); 

      const finalContent = `
${description.trim()}

------------------
【聯絡方式】
${contact.trim()}
      `.trim();
      
      formData.append('content', finalContent);

      await marketplaceService.createPost(formData);
      
      alert("刊登成功！");
      nav("/market", { replace: true });

    } catch (error) {
      console.error(error);
      alert("刊登失敗：" + (error.response?.data?.message || "請稍後再試"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mkt-wrap" style={{ maxWidth: 680 }}>
      {/* 卡片式外框 */}
      <div className="mkt-card">
        <h2 className="mkt-title">
          {type === 'selling' ? '📦 刊登販售物品' : '🙋‍♂️ 刊登徵求物品'}
        </h2>
        
        <form onSubmit={submit}>
          
          {/* 1. 類型切換 (Tabs) */}
          <div className="form-group">
            <label className="form-label">刊登類型</label>
            <div className="type-tabs">
              <div 
                className={`type-tab ${type === 'selling' ? 'active' : ''}`}
                onClick={() => setType('selling')}
              >
                💰 我要販售
              </div>
              <div 
                className={`type-tab buying ${type === 'buying' ? 'active' : ''}`}
                onClick={() => setType('buying')}
              >
                🔍 我要徵求
              </div>
            </div>
          </div>

          {/* 2. 圖片上傳區塊 */}
          <div className="form-group">
            <label className="form-label">商品圖片 (選填)</label>
            
            {!preview ? (
              <label className="image-upload-area">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  style={{ display: 'none' }} 
                />
                <span style={{fontSize: '24px', marginBottom: '5px'}}>📷</span>
                <span>點擊選擇圖片</span>
                <span style={{fontSize: '12px', color: '#94a3b8'}}>支援 JPG, PNG, WebP</span>
              </label>
            ) : (
              <div className="image-upload-area" style={{padding: 10, background: '#fff', borderStyle: 'solid'}}>
                <div className="image-preview-container">
                  <img src={preview} alt="預覽" className="image-preview" />
                  <button 
                    type="button"
                    className="remove-image-btn"
                    onClick={() => { setImage(null); setPreview(null); }}
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3. 標題與價格 */}
          <div className="form-group">
            <label className="form-label">標題</label>
            <input 
              className="form-input"
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="例如：出清大一微積分課本、九成新" 
              disabled={isLoading} 
            />
          </div>

          <div className="form-group">
            <label className="form-label">價格 (新台幣)</label>
            <input 
              className="form-input"
              inputMode="numeric" 
              value={price} 
              onChange={e => setPrice(e.target.value.replace(/\D/g,""))} 
              placeholder="例如：500" 
              disabled={isLoading} 
            />
          </div>

          {/* 4. 聯絡與說明 */}
          <div className="form-group">
            <label className="form-label">聯絡方式</label>
            <input 
              className="form-input"
              value={contact} 
              onChange={e => setContact(e.target.value)} 
              placeholder="Line ID / 手機 / Email" 
              disabled={isLoading} 
            />
          </div>

          <div className="form-group">
            <label className="form-label">商品說明 / 備註</label>
            <textarea 
              className="form-textarea"
              rows={6} 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="請描述物品狀況、面交地點或其他細節..." 
              disabled={isLoading} 
            />
          </div>

          {/* 🔥 新增：匿名勾選框 */}
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none', color: '#64748b' }}>
              <input 
                type="checkbox" 
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                style={{ width: 18, height: 18 }}
              />
              <span>匿名刊登 (您的名稱將顯示為「匿名」)</span>
            </label>
          </div>

          {/* 5. 按鈕區 */}
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => nav(-1)} disabled={isLoading}>
              取消
            </button>
            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading ? "發佈中..." : "確認刊登"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}