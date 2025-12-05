import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { marketplaceService } from "../services/marketplaceService";
import "./Market.css"; 

// 🔥 1. 加入後端網址與圖片處理函式
import { API_BASE_URL } from "../api/axiosClient"; 

const getFullImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  if (path.length < 10 && !path.includes("/")) return path; 
  return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

export default function MarketDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 留言相關狀態
  const [comment, setComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // 取得當前使用者
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const data = await marketplaceService.getPostById(id);
      setPost(data);
    } catch (error) {
      console.error(error);
      alert("載入失敗或文章已刪除");
      nav("/market");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkSold = async () => {
    const actionText = post.type === 'selling' ? '已售出' : '已徵得';
    if (!window.confirm(`確定要將此商品標記為「${actionText}」嗎？\n此操作無法復原。`)) return;

    try {
      await marketplaceService.markAsSold(id);
      alert("狀態更新成功！");
      fetchPost(); 
    } catch (error) {
      console.error(error);
      alert("操作失敗，請稍後再試");
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return alert("請先登入才能留言！");
    if (!comment.trim()) return alert("請輸入留言內容");

    setSubmitting(true);
    try {
      await marketplaceService.addComment(id, comment, isAnonymous);
      setComment(""); 
      setIsAnonymous(false); 
      fetchPost(); 
    } catch (error) {
      console.error("留言錯誤:", error);
      alert("留言失敗，請檢查網路連線或稍後再試");
    } finally {
      setSubmitting(false);
    }
  };

  // 🔥 新增：刪除留言功能
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("確定要刪除這則留言嗎？")) return;
    try {
      // 注意：如果 marketplaceService 還沒有 deleteComment 函式，稍後需要補上
      await marketplaceService.deleteComment(commentId);
      fetchPost(); 
    } catch (error) {
      console.error(error);
      alert("刪除留言失敗");
    }
  };

  if (loading) return <div style={{padding: 40, textAlign: 'center'}}>載入中...</div>;
  if (!post) return null;

  const isOwner = currentUser && currentUser.id === post.user_id;

  // 準備使用者資料
  const user = post.is_anonymous ? null : post.User;
  
  const rawAvatar = user?.avatar_url || "🙂"; 
  const isImageAvatar = rawAvatar.includes('/') || rawAvatar.startsWith('http') || rawAvatar.startsWith('data:');
  const avatarSrc = isImageAvatar ? getFullImageUrl(rawAvatar) : rawAvatar;

  const frameStyle = user?.avatarFrame ? user.avatarFrame.item_url : null;
  const badgeEmoji = user?.badge ? user.badge.item_url : null;

  // 商品圖片處理
  const postImageUrl = post.image_url ? getFullImageUrl(post.image_url) : null;

  return (
    <div className="mkt-wrap" style={{ maxWidth: 1000 }}>
      <button className="btn-cancel" onClick={() => nav("/market")} style={{ marginBottom: 20 }}>
        ← 返回列表
      </button>

      {/* 商品資訊卡片 */}
      <div className="mkt-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'start' }}>
        
        {/* 左側：圖片區 */}
        <div style={{ background: '#f8fafc', borderRadius: 12, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, border: '1px solid #eee', position: 'relative' }}>
          
          {post.is_sold ? (
            <div className="card-badge badge-sold" style={{ position: 'absolute', zIndex: 10 }}>
              {post.type === 'selling' ? 'SOLD OUT' : 'ACQUIRED'}
            </div>
          ) : null}

          {postImageUrl ? (
            <img src={postImageUrl} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          ) : (
            <div style={{ fontSize: 100, opacity: 0.2 }}>📦</div>
          )}
        </div>

        {/* 右側：資訊區 */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <span className={`card-badge ${post.type === 'buying' ? 'badge-buy' : 'badge-sell'}`} style={{ position: 'static' }}>
                {post.type === 'buying' ? '徵求' : '販售'}
              </span>
              {post.is_sold ? <span className="card-badge badge-sold" style={{ position: 'static', background: '#333' }}>交易結束</span> : null}
            </div>

            {isOwner && !post.is_sold && (
              <button onClick={handleMarkSold} className="btn-mark-sold">
                {post.type === 'selling' ? '💰 標記已售出' : '🤝 標記已徵得'}
              </button>
            )}
          </div>

          <h1 style={{ fontSize: 28, margin: '0 0 15px 0', color: '#1e293b', lineHeight: 1.3 }}>{post.title}</h1>
          
          <div style={{ fontSize: 28, fontWeight: '800', color: '#d32f2f', marginBottom: 20 }}>
            {post.price ? `NT$ ${Number(post.price).toLocaleString()}` : (post.type === 'buying' ? '預算不限' : '面議')}
          </div>

          {/* 發文者資訊 (頭貼+外框+徽章) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '20px 0', borderTop: '1px solid #eee', borderBottom: '1px solid #eee', marginBottom: 20 }}>
            
            {/* 1. 頭貼區塊 */}
            <div style={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
              <div style={{ 
                width: '100%', height: '100%', borderRadius: '50%', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#e2e8f0', overflow: 'hidden', 
                border: '2px solid #fff', 
                fontSize: '32px', 
                boxShadow: (!post.is_anonymous && frameStyle) ? frameStyle : '0 1px 2px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease'
              }}>
                {post.is_anonymous ? '?' : (
                   isImageAvatar
                   ? <img src={avatarSrc} alt="avatar" style={{width:'100%', height:'100%', objectFit:'cover'}}/> 
                   : <span role="img" aria-label="avatar">{avatarSrc}</span> 
                )}
              </div>
            </div>

            {/* 2. 名字與徽章區塊 */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ fontWeight: 'bold', fontSize: 18, color: '#1e293b' }}>
                  {post.is_anonymous ? "匿名使用者" : (post.User?.username || "未知使用者")}
                </div>
                
                {!post.is_anonymous && badgeEmoji && (
                  <span 
                    style={{ 
                      fontSize: '20px', 
                      lineHeight: 1, 
                      position: 'relative', 
                      top: '-3px' 
                    }} 
                    title="使用者徽章"
                  >
                    {badgeEmoji}
                  </span>
                )}
              </div>
              
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                刊登於 {new Date(post.created_at).toLocaleString()}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 10, fontWeight: 'bold', color: '#333' }}>📝 商品說明 / 聯絡方式：</div>
          <div style={{ 
            whiteSpace: 'pre-wrap', 
            lineHeight: 1.8, 
            color: '#334155', 
            minHeight: 120,
            background: '#f9f9f9',
            padding: 15,
            borderRadius: 8,
            flex: 1 
          }}>
            {post.content}
          </div>
        </div>
      </div>

      {/* 留言區 */}
      <div className="mkt-card" style={{ marginTop: 30, padding: 30 }}>
        <h3 style={{ margin: '0 0 20px 0' }}>💬 留言提問 ({post.comments?.length || 0})</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 30 }}>
          {post.comments && post.comments.length > 0 ? (
            post.comments.map(c => {
               const cUser = c.is_anonymous ? null : c.commenter;
               const cRawAvatar = cUser?.avatar_url || "🙂";
               const cIsImage = cRawAvatar.includes('/') || cRawAvatar.startsWith('http');
               const cAvatarSrc = cIsImage ? getFullImageUrl(cRawAvatar) : cRawAvatar;
               const cFrameStyle = cUser?.avatarFrame ? cUser.avatarFrame.item_url : null;
               const cBadge = cUser?.badge ? cUser.badge.item_url : null;

               // 🔥 判斷是否為自己的留言
               const isMyComment = currentUser && (
                   currentUser.id == c.user_id || 
                   currentUser.id == c.UserId || 
                   currentUser.id == c.commenter?.id
               );

               return (
                <div key={c.id} style={{ display: 'flex', gap: 15 }}>
                  
                  {/* 留言者頭貼 */}
                  <div style={{ position: 'relative', width: 40, height: 40, flexShrink: 0 }}>
                    <div style={{ 
                      width: '100%', height: '100%', borderRadius: '50%', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: '#f1f5f9', overflow: 'hidden',
                      fontSize: '20px',
                      boxShadow: (!c.is_anonymous && cFrameStyle) ? cFrameStyle : 'none'
                    }}>
                      {c.is_anonymous ? "👻" : (
                        cIsImage 
                        ? <img src={cAvatarSrc} alt="avatar" style={{width:'100%', height:'100%', objectFit:'cover'}}/>
                        : <span>{cAvatarSrc}</span>
                      )}
                    </div>
                  </div>

                  <div style={{ flex: 1, background: '#f8fafc', padding: '12px 16px', borderRadius: 12 }}>
                    
                    {/* 🔥 修改這裡：讓時間跟刪除按鈕垂直排列在右側 */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div style={{display:'flex', alignItems:'center', gap: 4}}>
                        <span style={{ fontWeight: 'bold', fontSize: 14 }}>
                          {c.is_anonymous ? "匿名使用者" : (cUser?.username || "未知")}
                        </span>
                        
                        {!c.is_anonymous && cBadge && (
                          <span 
                            style={{
                              fontSize: '14px', 
                              lineHeight: 1, 
                              position: 'relative', 
                              top: '-2px'
                            }}
                          >
                            {cBadge}
                          </span>
                        )}
                      </div>
                      
                      {/* 右側：時間與刪除按鈕 */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                          <span style={{ fontSize: 12, color: '#94a3b8' }}>{new Date(c.created_at).toLocaleString()}</span>
                          
                          {isMyComment && (
                              <button 
                                onClick={() => handleDeleteComment(c.id)}
                                style={{ 
                                    background: 'none', border: 'none', cursor: 'pointer', 
                                    opacity: 0.6, fontSize: '14px', padding: 0, transition: '0.2s'
                                }}
                                title="刪除留言"
                                onMouseEnter={(e) => e.target.style.opacity = 1}
                                onMouseLeave={(e) => e.target.style.opacity = 0.6}
                              >
                                  🗑️
                              </button>
                          )}
                      </div>
                    </div>

                    <div style={{ lineHeight: 1.5, color: '#334155' }}>{c.content}</div>
                  </div>
                </div>
               );
            })
          ) : (
            <div style={{ color: '#94a3b8', fontStyle: 'italic', padding: 10 }}>目前還沒有留言，有些問題想問嗎？</div>
          )}
        </div>

        {/* 留言輸入區 */}
        {currentUser ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <textarea 
              className="form-textarea" 
              placeholder="輸入你的留言..." 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={submitting}
              rows={3} 
              style={{ width: '100%', resize: 'none' }}
            />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', userSelect: 'none', color: '#64748b' }}>
                <input 
                  type="checkbox" 
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                />
                <span>匿名留言</span>
              </label>

              <button 
                type="button" 
                className="btn-submit" 
                style={{ width: 'auto', padding: '10px 30px', flex: 'none' }} 
                disabled={submitting}
                onClick={handleCommentSubmit}
              >
                {submitting ? "..." : "送出"}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 20, background: '#f1f5f9', borderRadius: 8 }}>
            請 <a href="/login" style={{ color: '#2563eb', fontWeight: 'bold' }}>登入</a> 後參與討論
          </div>
        )}
      </div>
    </div>
  );
}