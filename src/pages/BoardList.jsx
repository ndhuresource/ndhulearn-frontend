import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Board.css";
// 1. 引入服務
import { forumService } from "../services/forumService";
import EmojiAvatar from "../components/EmojiAvatar";

// 🔥 1. 加入後端網址與圖片處理函式
const API_URL = "http://localhost:5000"; 

const getFullImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  if (path.length < 10 && !path.includes("/")) return path; 
  return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

// 簡單的時間格式化函數
function fmt(ts) {
  try {
    const d = new Date(ts);
    return d.toLocaleString(); 
  } catch { return ""; }
}

export default function BoardList() {
  const nav = useNavigate();
  const [posts, setPosts] = useState([]);
  const [kw, setKw] = useState(""); 
  const [loading, setLoading] = useState(true);

  // 排序狀態
  const [sortType, setSortType] = useState("newest");

  useEffect(() => {
    fetchPosts();
  }, [sortType]); 

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const result = await forumService.getPosts(kw, sortType);
      if (result.success) {
        setPosts(result.data);
      }
    } catch (error) {
      console.error("無法讀取聊天版資料", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      fetchPosts();
    }
  };

  const goNew = () => {
    const me = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!me) {
      alert("請先登入才能發文喔！");
      nav("/login");
    } else {
      nav("/board/new");
    }
  };

  if (loading && posts.length === 0) return <div style={{padding: 20}}>載入中...</div>;

  return (
    <div className="board-wrap">
      {/* 工具列 */}
      <div className="board-bar" style={{ gap: ".5rem", alignItems: 'center' }}>
        <input
          className="board-search"
          placeholder="搜尋標題 / 內容 (按 Enter 搜尋)"
          value={kw}
          onChange={(e)=>setKw(e.target.value)}
          onKeyDown={handleSearch}
        />
        <button className="btn-primary" onClick={goNew} style={{ flexShrink: 0 }}>＋ 發文</button>
        
        <select 
          value={sortType} 
          onChange={(e) => setSortType(e.target.value)}
          style={{ 
            padding: '8px 12px', 
            borderRadius: '6px', 
            border: '1px solid #ddd', 
            cursor: 'pointer',
            backgroundColor: 'white',
            outline: 'none',
            flexShrink: 0
          }}
        >
          <option value="newest">🕒 最新發佈</option>
          <option value="likes">❤️ 依愛心數</option>
          <option value="comments">💬 依留言數</option>
        </select>
      </div>

      {posts.length === 0 ? (
        <div className="board-empty">目前尚無文章，來當第一個發文者吧！</div>
      ) : (
        <div className="board-list">
          {posts.map((p) => {
            // 解析作者資訊
            const author = p.author || {};
            const displayName = p.is_anonymous ? "匿名使用者" : (author.username || "未知使用者");
            
            // 處理頭貼
            const rawAvatar = author.avatar_url || "🙂";
            const isImage = rawAvatar.includes('/') || rawAvatar.startsWith('http');
            const avatarSrc = isImage ? getFullImageUrl(rawAvatar) : rawAvatar;
            
            const finalAvatar = p.is_anonymous ? "👻" : avatarSrc; 
            const isFinalImage = p.is_anonymous ? false : isImage;

            // 🔥🔥🔥 這裡解析外框與徽章 (跟 PostDetail 一樣) 🔥🔥🔥
            const frameStyle = author.avatarFrame ? author.avatarFrame.item_url : null;
            const badgeEmoji = author.badge ? author.badge.item_url : null;

            return (
              <Link key={p.id} to={`/board/${p.id}`} className="post-card">
                {/* 作者列 */}
                <div className="b-card-header" style={{ alignItems: 'center' }}>
                  <div className="b-author" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    
                    {/* 🔥 1. 頭貼區塊：放大至 40px 並加入外框支援 */}
                    <div style={{ 
                      position: 'relative', 
                      width: 40, height: 40, 
                      borderRadius: '50%', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: '#f1f5f9', overflow: 'hidden',
                      // 如果不是匿名且有外框，顯示外框 (box-shadow)
                      boxShadow: (!p.is_anonymous && frameStyle) ? frameStyle : 'none',
                      flexShrink: 0
                    }}>
                      {isFinalImage ? (
                        <img src={finalAvatar} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                      ) : (
                        <EmojiAvatar emoji={finalAvatar} size={24} />
                      )}
                    </div>

                    {/* 🔥 2. 名字與徽章 */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span className="b-name" style={{ fontSize: 15, fontWeight: 'bold', color: '#333' }}>
                            {displayName}
                          </span>
                          
                          {/* 顯示徽章 */}
                          {!p.is_anonymous && badgeEmoji && (
                            <span style={{ fontSize: '16px', lineHeight: 1, position: 'relative', top: '-1px' }}>
                              {badgeEmoji}
                            </span>
                          )}
                       </div>
                       {/* 將時間移到名字下方顯示，版面較整齊 */}
                       <div className="b-time" style={{ fontSize: 12, color: '#999' }}>{fmt(p.created_at)}</div>
                    </div>
                  </div>

                </div>

                <div className="post-title" style={{ marginTop: 10, fontSize: 18, fontWeight: 'bold' }}>
                  {p.title}
                </div>

                <div className="post-content" style={{ marginTop: 6, color: '#555' }}>
                  {/* 只顯示前 80 個字 */}
                  {p.content.length > 80 ? p.content.substring(0, 80) + "..." : p.content}
                </div>

                <div className="post-meta" style={{ display:'flex', gap: 15, alignItems:"center", marginTop: 12, color: '#666', fontSize: 13 }}>
                  <span>💬 留言 {p.comment_count || 0}</span>
                  <span>❤️ {p.like_count || 0}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}