import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { marketplaceService } from "../services/marketplaceService";
import "./Market.css";

// 後端網址
import { API_BASE_URL } from "../api/axiosClient"; 

// 輔助函式
const getFullImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  if (path.length < 10 && !path.includes("/")) return path; 
  return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

export default function MarketBoard() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); 
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const result = await marketplaceService.getPosts();
      const dataList = Array.isArray(result) ? result : (result.data || []);
      setPosts(dataList);
    } catch (error) {
      console.error("讀取失敗:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    if (filterType !== 'all' && post.type !== filterType) return false;
    if (searchTerm && !post.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="mkt-wrap" style={{ maxWidth: 1200 }}>
      {/* 1. 頭部區塊 */}
      <div className="market-header">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div>
            <h1 style={{margin: 0, fontSize: '28px', color: '#1e293b'}}>🛒 校園買賣版</h1>
            <p style={{margin: '5px 0 0', color: '#64748b'}}>二手教科書、生活用品、徵求物品...</p>
          </div>
          <Link to="/market/new" className="btn-post-fab">＋ 我要刊登</Link>
        </div>

        {/* 2. 搜尋與篩選 */}
        <div className="market-actions">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input 
              className="search-input" 
              placeholder="搜尋商品..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-tabs">
            {['all', 'selling', 'buying'].map(type => (
              <button 
                key={type}
                className={`filter-tab ${filterType === type ? 'active' : ''}`}
                onClick={() => setFilterType(type)}
              >
                {type === 'all' ? '全部' : type === 'selling' ? '只看販售' : '只看徵求'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. 商品列表 */}
      {loading ? (
        <div style={{textAlign:'center', padding: 40, color: '#999'}}>載入中...</div>
      ) : (
        <div className="market-grid">
          {filteredPosts.length === 0 ? (
            <div style={{gridColumn: '1/-1', textAlign:'center', padding: 60, background: '#f8fafc', borderRadius: 12, color: '#94a3b8'}}>
              沒有找到相關貼文 🍃
            </div>
          ) : (
            filteredPosts.map(post => {
              const user = post.is_anonymous ? null : post.User;
              
              const rawAvatar = user?.avatar_url || "🙂"; 
              const isImageAvatar = rawAvatar.includes('/') || rawAvatar.startsWith('http') || rawAvatar.startsWith('data:');
              const avatarSrc = isImageAvatar ? getFullImageUrl(rawAvatar) : rawAvatar;

              const frameStyle = user?.avatarFrame ? user.avatarFrame.item_url : null;
              const badgeEmoji = user?.badge ? user.badge.item_url : null;
              
              const postImageUrl = post.image_url ? getFullImageUrl(post.image_url) : null;

              return (
                <Link to={`/market/posts/${post.id}`} key={post.id} className="market-card">
                  
                  {/* 圖片區 */}
                  <div className="card-image-wrap" style={{ height: 200, overflow: 'hidden', position: 'relative' }}>
                    {!!post.is_sold && <div className="card-badge badge-sold">SOLD OUT</div>}
                    {!post.is_sold && (
                      <div className={`card-badge ${post.type === 'buying' ? 'badge-buy' : 'badge-sell'}`}>
                        {post.type === 'buying' ? '徵求' : '販售'}
                      </div>
                    )}
                    {postImageUrl ? (
                      <img src={postImageUrl} alt={post.title} className="card-image" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                    ) : (
                      <div className="no-image-placeholder" style={{width:'100%', height:'100%', background:'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center', fontSize: 50}}>
                        {post.type === 'buying' ? '🙋‍♂️' : '📦'}
                      </div>
                    )}
                  </div>

                  {/* 內容區 */}
                  <div className="card-content" style={{padding: '16px'}}>
                    <h3 className="card-title" style={{margin:'0 0 8px 0', fontSize:'18px', lineHeight: 1.4, height: '2.8em', overflow:'hidden', textOverflow:'ellipsis', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical'}}>
                        {post.title}
                    </h3>
                    
                    {post.price != null ? (
                      <div className="card-price" style={{fontSize:'18px', fontWeight:'bold', color:'#e11d48', marginBottom:'12px'}}>
                        NT$ {Number(post.price).toLocaleString()}
                      </div>
                    ) : (
                      <div className="card-price" style={{fontSize:'16px', color:'#64748b', marginBottom:'12px'}}>
                        {post.type === 'buying' ? '預算不限' : '面議'}
                      </div>
                    )}

                    <div className="card-footer" style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid #f1f5f9', paddingTop:'12px'}}>
                      
                      <div className="user-info" style={{display:'flex', alignItems:'center', gap:'12px'}}>
                        
                        {/* 1. 頭貼區塊 */}
                        <div style={{ position: 'relative', width: 42, height: 42, flexShrink: 0 }}>
                          <div style={{ 
                            width: '100%', height: '100%', borderRadius: '50%', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: '#e2e8f0', overflow: 'hidden', 
                            border: '2px solid #fff', 
                            fontSize: '24px', 
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

                        {/* 🔥🔥🔥 修改處：水平對齊與間距調整 🔥🔥🔥 */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                          
                          {/* 名字 */}
                          <span style={{fontSize:'14px', color:'#334155', fontWeight:500}}>
                              {post.is_anonymous ? '匿名' : (user?.username || '匿名')}
                          </span>

                          {/* 徽章 */}
                          {!post.is_anonymous && badgeEmoji && (
                            <span 
                              style={{ 
                                fontSize: '16px', // 稍微縮小一點點，讓它跟文字高度更協調
                                lineHeight: 1, 
                                // 移除 paddingTop，確保它是真正的垂直置中
                              }} 
                              title="使用者徽章"
                            >
                              {badgeEmoji}
                            </span>
                          )}
                        </div>

                      </div>
                      
                      <span style={{fontSize:'12px', color:'#94a3b8'}}>
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}