import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { forumService } from "../services/forumService";
import "../styles/Board.css";

// 🔥 1. 加入後端網址與圖片處理函式
const API_URL = "http://localhost:5000"; 

const getFullImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  if (path.length < 10 && !path.includes("/")) return path; 
  return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

// 簡單的時間格式化
function fmt(ts) {
  if (!ts) return "";
  try { return new Date(ts).toLocaleString(); } 
  catch { return ""; }
}

export default function PostDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 留言輸入相關狀態
  const [commentText, setCommentText] = useState("");
  const [isCommentAnonymous, setIsCommentAnonymous] = useState(false); 
  const [isSubmittingComment, setIsSubmittingComment] = useState(false); 
  
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const result = await forumService.getPostById(id);
      if (result.success) {
        setPost(result.data);
      } else {
        alert("文章不存在");
        nav("/board");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!currentUser) return alert("請先登入");
    try {
      const res = await forumService.toggleLike(id); 
      if (res.success) {
        setPost(prev => ({
          ...prev,
          isLiked: res.isLiked,
          like_count: res.likeCount
        }));
      }
    } catch (error) {
      console.error("點讚失敗", error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("確定要刪除這篇貼文嗎？此操作無法復原。")) return;
    try {
      const res = await forumService.deletePost(id);
      if (res.success) {
        alert("刪除成功");
        nav("/board");
      }
    } catch (error) {
      alert("刪除失敗");
    }
  };

  // 刪除留言功能
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("確定要刪除這則留言嗎？")) return;
    try {
      await forumService.deleteComment(commentId);
      fetchPost();
    } catch (error) {
      console.error(error);
      alert("刪除留言失敗，請稍後再試");
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!currentUser) return alert("請先登入");
    if (!commentText.trim()) return;

    setIsSubmittingComment(true);

    try {
      await forumService.addComment(id, commentText, isCommentAnonymous);
      setCommentText(""); 
      setIsCommentAnonymous(false); 
      fetchPost(); 
    } catch (error) {
      alert("留言失敗");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleVote = async (optionId) => {
    if (!currentUser) return alert("請先登入");
    try {
      await forumService.votePoll(optionId);
      alert("投票成功！");
      fetchPost();
    } catch (error) {
      alert(error.response?.data?.message || "投票失敗");
    }
  };

  if (loading) return <div style={{padding:40, textAlign:'center'}}>載入中...</div>;
  if (!post) return null;

  const author = post.author || {};
  const rawAvatar = author.avatar_url || "🙂";
  const isImageAvatar = rawAvatar.includes('/') || rawAvatar.startsWith('http');
  const avatarSrc = isImageAvatar ? getFullImageUrl(rawAvatar) : rawAvatar;
  const frameStyle = author.avatarFrame ? author.avatarFrame.item_url : null;
  const badgeEmoji = author.badge ? author.badge.item_url : null;

  const isOwner = currentUser && currentUser.id === post.user_id;
  const postImageUrl = post.image_url ? getFullImageUrl(post.image_url) : null;

  return (
    <div className="board-wrap" style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
      <button className="btn-ghost" onClick={() => nav("/board")} style={{ marginBottom: 15 }}>
        ← 回聊天列表
      </button>

      {/* 文章卡片 */}
      <article style={{ background: '#fff', borderRadius: 12, border: '1px solid #eef1f7', padding: 30, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        
        {/* 作者資訊 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative', width: 48, height: 48 }}>
              <div style={{ 
                width: '100%', height: '100%', borderRadius: '50%', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#f1f5f9', overflow: 'hidden', 
                border: '2px solid #fff', fontSize: '28px',
                boxShadow: (!post.is_anonymous && frameStyle) ? frameStyle : '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                {post.is_anonymous ? "👻" : (
                   isImageAvatar 
                   ? <img src={avatarSrc} alt="avatar" style={{width:'100%', height:'100%', objectFit:'cover'}}/>
                   : <span role="img">{avatarSrc}</span>
                )}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontWeight: 'bold', fontSize: 16, color: '#333' }}>
                  {post.is_anonymous ? "匿名使用者" : (author.username || "未知使用者")}
                </span>
                {!post.is_anonymous && badgeEmoji && (
                  <span style={{ fontSize: '18px', lineHeight: 1, position: 'relative', top: '-2px' }}>
                    {badgeEmoji}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 13, color: '#999' }}>{fmt(post.created_at)}</div>
            </div>
          </div>

          {isOwner && (
            <button onClick={handleDelete} className="btn-danger tiny" style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 12px', borderRadius: 6, cursor: 'pointer' }}>
              🗑️ 刪除
            </button>
          )}
        </div>

        <h1 style={{ fontSize: 24, margin: '0 0 20px 0', color: '#1e293b' }}>{post.title}</h1>
        
        {postImageUrl && (
          <div style={{ marginBottom: 30, textAlign: 'center', background: '#f5f7fa', padding: 15, borderRadius: 10, border: '1px solid #eef1f7' }}>
            <img 
              src={postImageUrl} 
              alt={post.title} 
              style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: 8, objectFit: 'contain' }} 
            />
          </div>
        )}

        <div style={{ fontSize: 16, lineHeight: 1.8, color: '#334155', whiteSpace: 'pre-wrap', marginBottom: 30 }}>
          {post.content}
        </div>

        {post.pollOptions && post.pollOptions.length > 0 && (
          <div style={{ background: '#f8fafc', padding: 20, borderRadius: 12, marginBottom: 30, border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 15px 0' }}>📊 投票活動</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {post.pollOptions.map(opt => (
                <div key={opt.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', padding: '12px 15px', borderRadius: 8, border: '1px solid #eef1f7' }}>
                  <span>{opt.option_text}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                    <span style={{ fontSize: 14, color: '#64748b' }}>{opt.vote_count} 票</span>
                    <button className="btn-primary tiny" onClick={() => handleVote(opt.id)}>投票</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 20, borderTop: '1px solid #eee', paddingTop: 20 }}>
          <button 
            onClick={handleLike}
            style={{ 
              display: 'flex', alignItems: 'center', gap: 6, 
              background: post.isLiked ? '#fecaca' : '#f1f5f9', 
              color: post.isLiked ? '#dc2626' : '#64748b',
              border: 'none', padding: '8px 16px', borderRadius: 20, cursor: 'pointer', transition: '0.2s'
            }}
          >
            <span>{post.isLiked ? '❤️' : '🤍'}</span>
            <span style={{ fontWeight: 'bold' }}>{post.like_count || 0}</span>
          </button>
          
          <div style={{ color: '#94a3b8', fontSize: 14 }}>
            💬 {post.comments?.length || 0} 則留言
          </div>
        </div>
      </article>

      {/* 留言區 */}
      <div style={{ marginTop: 30, padding: 30, background: '#fff', borderRadius: 12, border: '1px solid #eef1f7', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: 18 }}>💬 留言區 ({post.comments?.length || 0})</h3>

        {/* 留言列表 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 30 }}>
          {post.comments && post.comments.length > 0 ? (
            post.comments.map((c) => {
              const cUser = c.commenter || {};
              const isAnon = c.is_anonymous || false; 
              
              const cRawAvatar = cUser.avatar_url || "🙂";
              const cIsImage = cRawAvatar.includes('/') || cRawAvatar.startsWith('http');
              const cAvatarSrc = cIsImage ? getFullImageUrl(cRawAvatar) : cRawAvatar;
              const cFrameStyle = cUser.avatarFrame ? cUser.avatarFrame.item_url : null;
              const cBadge = cUser.badge ? cUser.badge.item_url : null;

              // 🔥🔥🔥 修正：更聰明的 ID 檢查邏輯 🔥🔥🔥
              // 1. 使用 == 來允許字串與數字比較 (例如 "1" == 1 會通過)
              // 2. 檢查 c.user_id, c.UserId, c.commenter.id 等多種常見欄位
              const isMyComment = currentUser && (
                  currentUser.id == c.user_id || 
                  currentUser.id == c.UserId || 
                  currentUser.id == c.commenter?.id
              );

              // 如果你想在開發人員工具(F12)確認 ID 是什麼，可以打開下面這行註解：
              // console.log("我的ID:", currentUser?.id, "留言ID:", c.user_id, c.UserId, "是否匹配:", isMyComment);

              return (
                <div key={c.id} style={{ display: 'flex', gap: 15 }}>
                  
                  {/* 頭貼 */}
                  <div style={{ position: 'relative', width: 40, height: 40, flexShrink: 0 }}>
                    <div style={{ 
                      width: '100%', height: '100%', borderRadius: '50%', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: '#f1f5f9', overflow: 'hidden', fontSize: '20px',
                      boxShadow: (!isAnon && cFrameStyle) ? cFrameStyle : 'none'
                    }}>
                      {isAnon ? "👻" : (
                        cIsImage 
                        ? <img src={cAvatarSrc} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}}/>
                        : <span>{cAvatarSrc}</span>
                      )}
                    </div>
                  </div>

                  {/* 內容氣泡區 */}
                  <div style={{ flex: 1, background: '#f8fafc', padding: '12px 16px', borderRadius: 12 }}>
                    
                    {/* 頂部資訊列 */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      
                      {/* 名字與徽章 */}
                      <div style={{display:'flex', alignItems:'center', gap: 4}}>
                        <span style={{ fontWeight: 'bold', fontSize: 14, color: '#333' }}>
                          {isAnon ? "匿名使用者" : (cUser.username || "未知")}
                        </span>
                        {!isAnon && cBadge && (
                          <span style={{ fontSize: '14px', lineHeight: 1, position: 'relative', top: '-2px' }}>
                            {cBadge}
                          </span>
                        )}
                      </div>

                      {/* 時間與刪除按鈕 */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>{fmt(c.created_at)}</span>
                        
                        {/* 這裡顯示垃圾桶按鈕 */}
                        {isMyComment && (
                          <button 
                             onClick={() => handleDeleteComment(c.id)}
                             style={{ 
                               background: 'none', border: 'none', cursor: 'pointer', 
                               fontSize: '14px', opacity: 0.5, transition: 'opacity 0.2s', padding: 0 
                             }}
                             title="刪除留言"
                             onMouseEnter={(e) => e.target.style.opacity = 1}
                             onMouseLeave={(e) => e.target.style.opacity = 0.5}
                          >
                             🗑️
                          </button>
                        )}
                      </div>

                    </div>
                    
                    {/* 內容 */}
                    <div style={{ lineHeight: 1.5, color: '#334155' }}>{c.content}</div>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ color: '#94a3b8', fontStyle: 'italic', padding: 10 }}>目前還沒有留言，有些問題想問嗎？</div>
          )}
        </div>

        {/* 留言輸入框 */}
        {currentUser ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <textarea 
              className="form-textarea" 
              placeholder="輸入你的留言..." 
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={isSubmittingComment}
              rows={3} 
              style={{ width: '100%', resize: 'none', borderRadius: 8, padding: 12, border: '1px solid #e2e8f0' }}
            />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', userSelect: 'none', color: '#64748b', fontSize: 14 }}>
                <input 
                  type="checkbox" 
                  checked={isCommentAnonymous}
                  onChange={(e) => setIsCommentAnonymous(e.target.checked)}
                  disabled={isSubmittingComment}
                  style={{ accentColor: '#3b82f6' }}
                />
                <span>匿名留言</span>
              </label>

              <button 
                type="button" 
                style={{ 
                    background: '#2563eb', 
                    color: '#fff', 
                    border: 'none', 
                    padding: '10px 30px',
                    borderRadius: 6, 
                    cursor: 'pointer', 
                    fontSize: 14,
                    width: 'auto',
                    flex: 'none'
                }} 
                disabled={!commentText.trim() || isSubmittingComment}
                onClick={submitComment}
              >
                {isSubmittingComment ? "..." : "送出"}
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