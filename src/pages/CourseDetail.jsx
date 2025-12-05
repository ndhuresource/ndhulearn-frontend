import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { courseService } from "../services/courseService";
import { resourceService } from "../services/resourceService"; 
import ResourceUploadModal from "../components/ResourceUploadModal"; 
import "../styles/Courses.css";

// 🔥 1. 加入後端網址與圖片處理函式
const API_URL = "http://localhost:5000"; 

const getFullImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  if (path.length < 10 && !path.includes("/")) return path; 
  return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

// Star rating component (保持不變)
const StarRating = ({ score, interactive = false, onChange, size = 16 }) => {
  return (
    <div style={{ display: 'flex', color: '#fbbf24', cursor: interactive ? 'pointer' : 'default', lineHeight: 1 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span 
          key={star} 
          onClick={() => interactive && onChange && onChange(star)}
          style={{ fontSize: `${size}px`, marginRight: 2 }}
        >
          {star <= Math.round(score) ? '★' : '☆'}
        </span>
      ))}
    </div>
  );
};

// Calculate average score (保持不變)
const calcAvg = (ratings) => {
  if (!ratings || ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, r) => {
    const itemAvg = (r.completeness + r.accuracy + r.relevance + r.readability + r.credibility) / 5;
    return acc + itemAvg;
  }, 0);
  return (sum / ratings.length).toFixed(1);
};

// Calculate 5 dimensions average (保持不變)
const calcDimensions = (ratings) => {
  if (!ratings || ratings.length === 0) return null;
  const count = ratings.length;
  const sums = ratings.reduce((acc, r) => ({
    comp: acc.comp + r.completeness,
    accu: acc.accu + r.accuracy,
    rel: acc.rel + r.relevance,
    read: acc.read + r.readability,
    cred: acc.cred + r.credibility
  }), { comp: 0, accu: 0, rel: 0, read: 0, cred: 0 });
  
  return {
    completeness: (sums.comp / count).toFixed(1),
    accuracy: (sums.accu / count).toFixed(1),
    relevance: (sums.rel / count).toFixed(1),
    readability: (sums.read / count).toFixed(1),
    credibility: (sums.cred / count).toFixed(1)
  };
};

export default function CourseDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

  const [showUploadModal, setShowUploadModal] = useState(false); 
  const [viewResource, setViewResource] = useState(null); 
  
  // 排序狀態
  const [sortType, setSortType] = useState('newest'); 

  const [ratingForm, setRatingForm] = useState({
    completeness: 0, accuracy: 0, relevance: 0, readability: 0, credibility: 0, comment: "", isAnonymous: false
  });

  const fetchDetail = async () => {
    try {
      const result = await courseService.getCourseById(id);
      setCourse(result);
    } catch (error) {
      console.error(error);
      alert("載入失敗");
      nav("/courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDetail(); }, [id]);

  const handleDownload = async () => {
    if (!currentUser) return alert("請先登入");
    
    try {
      const data = await resourceService.getDownloadUrl(viewResource.id);
      const fileUrl = data.downloadUrl;
      const fileName = data.fileName || viewResource.title; 

      const response = await fetch(fileUrl);
      const blob = await response.blob();
      
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);

      alert("下載成功！(已記錄下載歷史，您現在可以評價了)");
      
      await fetchDetail();
      setViewResource(prev => ({ ...prev, hasDownloaded: true }));
      
    } catch (error) {
      console.error(error);
      if (viewResource?.file_path) {
         window.open(viewResource.file_path, '_blank');
      } else {
         alert("下載失敗");
      }
    }
  };

  const handleSubmitRating = async () => {
    if (!currentUser) return alert("請先登入");
    const { completeness, accuracy, relevance, readability, credibility } = ratingForm;
    if (!completeness || !accuracy || !relevance || !readability || !credibility) {
      return alert("請完成所有 5 個維度的評分");
    }

    try {
      await courseService.submitRating({ resourceId: viewResource.id, ...ratingForm });
      alert("評價成功！");
      setRatingForm({ completeness: 0, accuracy: 0, relevance: 0, readability: 0, credibility: 0, comment: "", isAnonymous: false });
      
      const updatedCourse = await courseService.getCourseById(id);
      setCourse(updatedCourse);
      const updatedRes = updatedCourse.resources.find(r => r.id === viewResource.id);
      setViewResource(updatedRes);
    } catch (error) {
      alert(error.response?.data?.message || "評價失敗");
    }
  };

  // 刪除資源功能
  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm("確定要刪除這個資源嗎？此操作無法復原。")) return;
    try {
      await courseService.deleteResource(resourceId);
      alert("資源已刪除");
      fetchDetail(); 
    } catch (error) {
      console.error("刪除失敗", error);
      alert("刪除失敗，請稍後再試");
    }
  };

  // 🔥 新增：刪除評價功能
  const handleDeleteRating = async (ratingId) => {
    if (!window.confirm("確定要刪除這則評價嗎？")) return;
    try {
      // 呼叫 courseService.deleteRating (稍後需要在 service 中新增)
      await courseService.deleteRating(ratingId);
      alert("評價已刪除");
      
      // 更新資料
      const updatedCourse = await courseService.getCourseById(id);
      setCourse(updatedCourse);
      // 同步更新當前查看的資源詳情 (因為評價列表在裡面)
      const updatedRes = updatedCourse.resources.find(r => r.id === viewResource.id);
      setViewResource(updatedRes);
      
    } catch (error) {
      console.error("刪除評價失敗", error);
      alert("刪除評價失敗，請稍後再試");
    }
  };

  const tagBaseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '28px',
    padding: '0 12px',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '500',
    whiteSpace: 'nowrap'
  };

  if (loading) return <div style={{padding:40, textAlign:'center'}}>載入中...</div>;
  if (!course) return null;

  const info = course.curriculums?.[0] || {};
  const deptName = info.department?.name || "通識/其他";
  const groupName = info.group?.name || "";
  const rawResources = course.resources || [];

  const sortedResources = [...rawResources].sort((a, b) => {
    if (sortType === 'newest') {
      return new Date(b.created_at) - new Date(a.created_at);
    } else if (sortType === 'rating') {
      const avgA = parseFloat(calcAvg(a.resourceRatings));
      const avgB = parseFloat(calcAvg(b.resourceRatings));
      return avgB - avgA;
    } else if (sortType === 'downloads') {
      return (b.download_count || 0) - (a.download_count || 0);
    }
    return 0;
  });

  return (
    <div className="courses-wrap">
      <div style={{ marginBottom: 20 }}>
        <button className="btn-ghost" onClick={() => nav("/courses")}>← 回課程列表</button>
      </div>

      {/* Course Info Card */}
      <div className="course-card" style={{ background: '#fff', padding: 30, borderRadius: 12, border: '1px solid #eef1f7', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: '0 0 12px 0', fontSize: 28, color: '#333' }}>{course.name}</h1>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ ...tagBaseStyle, background: '#f5f5f5', color: '#555', fontFamily: 'monospace', fontWeight: 'bold' }}>{course.id}</span>
              <span style={{ ...tagBaseStyle, background: '#e3f2fd', color: '#1976d2' }}>{deptName}</span>
              {groupName && <span style={{ ...tagBaseStyle, background: '#e0f2f1', color: '#00695c' }}>{groupName}</span>}
              <span style={{ ...tagBaseStyle, background: '#f3e5f5', color: '#7b1fa2' }}>{course.course_level}</span>
              <span style={{ 
                ...tagBaseStyle, 
                background: info.type === '必修' ? '#ffebee' : '#e8f5e9', 
                color: info.type === '必修' ? '#c62828' : '#2e7d32',
                fontWeight: 'bold'
              }}>
                {info.type}
              </span>
            </div>
          </div>
          <button className="btn-primary" onClick={() => setShowUploadModal(true)}>＋ 上傳資源</button>
        </div>
      </div>

      {/* Resource List */}
      <div style={{ background: '#fff', padding: 20, borderRadius: 12, border: '1px solid #eef1f7' }}>
        
        {/* 標題列與篩選 */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          borderBottom: '1px solid #eee', 
          paddingBottom: 15 
        }}>
          <h3 style={{ margin: 0 }}>📂 學習資源 ({sortedResources.length})</h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, color: '#666' }}>排序方式：</span>
            <select 
              value={sortType} 
              onChange={(e) => setSortType(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '14px',
                cursor: 'pointer',
                outline: 'none',
                color: '#333'
              }}
            >
              <option value="newest">📅 最新發佈</option>
              <option value="rating">⭐ 綜合評分</option>
              <option value="downloads">📥 下載次數</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 15, marginTop: 15 }}>
          {sortedResources.map(res => {
            const avg = calcAvg(res.resourceRatings);
            
            const uploader = res.is_anonymous ? null : res.uploader;
            const rawAvatar = uploader?.avatar_url || "🙂";
            const isImageAvatar = rawAvatar.includes('/') || rawAvatar.startsWith('http') || rawAvatar.startsWith('data:');
            const avatarSrc = isImageAvatar ? getFullImageUrl(rawAvatar) : rawAvatar;
            const frameStyle = uploader?.avatarFrame ? uploader.avatarFrame.item_url : null;
            const badgeEmoji = uploader?.badge ? uploader.badge.item_url : null;

            const isMyResource = currentUser && currentUser.id === res.uploader_id;

            return (
              <div key={res.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '20px', border: '1px solid #eee', borderRadius: 12, background: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.02)', position: 'relative' }}>
                <div style={{ flex: 1 }}>
                  
                  {/* 使用者資訊區 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    
                    {/* 頭貼區塊 */}
                    <div style={{ position: 'relative', width: 48, height: 48, flexShrink: 0 }}>
                      <div style={{ 
                        width: '100%', height: '100%', borderRadius: '50%', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: '#e2e8f0', overflow: 'hidden', 
                        border: '2px solid #fff', 
                        fontSize: '28px', 
                        boxShadow: (!res.is_anonymous && frameStyle) ? frameStyle : '0 1px 2px rgba(0,0,0,0.1)'
                      }}>
                        {res.is_anonymous ? '?' : (
                           isImageAvatar
                           ? <img src={avatarSrc} alt="avatar" style={{width:'100%', height:'100%', objectFit:'cover'}}/> 
                           : <span role="img" aria-label="avatar">{avatarSrc}</span> 
                        )}
                      </div>
                    </div>

                    {/* 名字與徽章 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>
                          {res.is_anonymous ? "匿名提供" : (uploader?.username || "未知")}
                        </span>
                        
                        {!res.is_anonymous && badgeEmoji && (
                          <span style={{ fontSize: '18px', lineHeight: 1, position: 'relative', top: '-2px' }} title="使用者徽章">
                            {badgeEmoji}
                          </span>
                        )}
                    </div>
                  </div>

                  {/* 資源標題 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <h3 style={{ margin: 0, fontSize: 20, color: '#1e293b', lineHeight: 1.4 }}>{res.title}</h3>
                      <span style={{ fontSize: 12, fontWeight: 'normal', background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: 4 }}>
                        {res.resource_type}
                      </span>
                  </div>

                  {/* 評分資訊 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#fff9c4', padding: '4px 10px', borderRadius: 12 }}>
                      <span style={{ fontWeight: 'bold', color: '#f57f17', fontSize: 13 }}>綜合評分 {avg}</span>
                      <StarRating score={avg} />
                      <span style={{ color: '#666', fontSize: 12 }}>({res.resourceRatings?.length || 0})</span>
                    </div>
                  </div>

                  {/* 底部資訊 */}
                  <div style={{ fontSize: 13, color: '#666' }}>
                    👨‍🏫 {res.teacher || "未知教師"} ・ 📅 {res.year || "未知年份"}年 ・ 📥 {res.download_count} 下載 
                  </div>
                  
                  {res.description && <div style={{ fontSize: 14, color: '#444', marginTop: 10, lineHeight: 1.5 }}>{res.description}</div>}
                </div>
                
                {/* 右側按鈕區 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginLeft: 20, alignSelf: 'flex-start' }}>
                  {isMyResource && (
                    <button 
                      onClick={() => handleDeleteResource(res.id)}
                      style={{ 
                        alignSelf: 'flex-end',
                        background: '#fee2e2', 
                        color: '#ef4444', 
                        border: 'none', 
                        borderRadius: '50%', 
                        width: 32, 
                        height: 32, 
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '16px',
                        marginBottom: 5 
                      }}
                      title="刪除資源"
                    >
                      🗑️
                    </button>
                  )}
                  <button className="btn-primary tiny" onClick={() => setViewResource(res)}>查看</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resource Detail Modal */}
      {viewResource && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 12, width: '90%', maxWidth: 700, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            
            <div style={{ padding: 20, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>{viewResource.title}</h3>
              <button className="btn-ghost" onClick={() => setViewResource(null)}>關閉</button>
            </div>

            <div style={{ padding: 20, overflowY: 'auto' }}>
              
              <div style={{ marginBottom: 15 }}>
                <button className="btn-primary" onClick={handleDownload} style={{ width: '100%', padding: '12px', fontSize: 16 }}>
                  📥 下載檔案
                </button>
              </div>
              
              <div style={{ background: '#f5f7fa', padding: 15, borderRadius: 8, marginBottom: 20 }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: 16, color: '#333' }}>📊 綜合評價</h4>
                {(() => {
                  const dims = calcDimensions(viewResource.resourceRatings);
                  if (!dims) return <div style={{ color: '#666', fontSize: 13 }}>尚無評價資料</div>;
                  
                  const dimLabels = [
                    { key: 'completeness', label: '完整性', val: dims.completeness },
                    { key: 'accuracy', label: '準確性', val: dims.accuracy },
                    { key: 'relevance', label: '相關性', val: dims.relevance },
                    { key: 'readability', label: '易讀性', val: dims.readability },
                    { key: 'credibility', label: '可信度', val: dims.credibility },
                  ];

                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 20px' }}>
                      {dimLabels.map(d => (
                        <div key={d.key} style={{ display: 'flex', alignItems: 'center', fontSize: 14 }}>
                          <span style={{ minWidth: 50, color: '#555' }}>{d.label}</span>
                          <StarRating score={d.val} size={14} />
                          <span style={{ marginLeft: 6, fontWeight: 'bold', color: '#333' }}>{d.val}</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              <h4 style={{ marginBottom: 10 }}>使用者評價 ({viewResource.resourceRatings?.length || 0})</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {viewResource.resourceRatings && viewResource.resourceRatings.map(r => {
                  const rUser = r.is_anonymous ? null : r.user;
                  const rRawAvatar = rUser?.avatar_url || "🙂";
                  const rIsImage = rRawAvatar.includes('/') || rRawAvatar.startsWith('http');
                  const rAvatarSrc = rIsImage ? getFullImageUrl(rRawAvatar) : rRawAvatar;
                  const rFrameStyle = rUser?.avatarFrame ? rUser.avatarFrame.item_url : null;
                  const rBadge = rUser?.badge ? rUser.badge.item_url : null;

                  // 🔥 判斷是否為自己的評價
                  const isMyRating = currentUser && currentUser.id === r.user_id;

                  return (
                    <div key={r.id} style={{ border: '1px solid #eee', padding: 15, borderRadius: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ position: 'relative', width: 40, height: 40, flexShrink: 0 }}>
                            <div style={{ 
                              width: '100%', height: '100%', borderRadius: '50%', 
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: '#f1f5f9', overflow: 'hidden', 
                              border: '2px solid #fff',
                              fontSize: '22px', 
                              boxShadow: (!r.is_anonymous && rFrameStyle) ? rFrameStyle : '0 1px 2px rgba(0,0,0,0.1)'
                            }}>
                              {r.is_anonymous ? "👻" : (
                                rIsImage 
                                ? <img src={rAvatarSrc} alt="avatar" style={{width:'100%', height:'100%', objectFit:'cover'}}/>
                                : <span role="img" aria-label="avatar">{rAvatarSrc}</span>
                              )}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontWeight: 'bold', color: '#1367c2', fontSize: 15 }}>
                              {r.is_anonymous ? "匿名" : (rUser?.username || "使用者")}
                            </span>
                            
                            {!r.is_anonymous && rBadge && (
                              <span style={{ fontSize: '16px', lineHeight: 1, position: 'relative', top: '-2px' }} title="使用者徽章">
                                {rBadge}
                              </span>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                          <span style={{ color: '#999', fontSize: 12 }}>{new Date(r.rating_time).toLocaleDateString()}</span>
                          
                          {/* 🔥 新增：評價刪除按鈕 (在右下角) */}
                          {isMyRating && (
                            <button 
                              onClick={() => handleDeleteRating(r.id)}
                              style={{ 
                                background: 'none', border: 'none', cursor: 'pointer', 
                                opacity: 0.6, fontSize: '14px', padding: 0, transition: '0.2s'
                              }}
                              title="刪除評價"
                              onMouseEnter={(e) => e.target.style.opacity = 1}
                              onMouseLeave={(e) => e.target.style.opacity = 0.6}
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px 10px', marginBottom: 10, background: '#f9f9f9', padding: 8, borderRadius: 6 }}>
                        <div style={{ fontSize: 12, display: 'flex', alignItems: 'center' }}><span style={{marginRight:4, color:'#666'}}>完整:</span> <StarRating score={r.completeness} size={12} /></div>
                        <div style={{ fontSize: 12, display: 'flex', alignItems: 'center' }}><span style={{marginRight:4, color:'#666'}}>準確:</span> <StarRating score={r.accuracy} size={12} /></div>
                        <div style={{ fontSize: 12, display: 'flex', alignItems: 'center' }}><span style={{marginRight:4, color:'#666'}}>相關:</span> <StarRating score={r.relevance} size={12} /></div>
                        <div style={{ fontSize: 12, display: 'flex', alignItems: 'center' }}><span style={{marginRight:4, color:'#666'}}>易讀:</span> <StarRating score={r.readability} size={12} /></div>
                        <div style={{ fontSize: 12, display: 'flex', alignItems: 'center' }}><span style={{marginRight:4, color:'#666'}}>可信:</span> <StarRating score={r.credibility} size={12} /></div>
                      </div>

                      <div style={{ color: '#333', lineHeight: 1.5 }}>{r.comment || "（未填寫文字評論）"}</div>
                    </div>
                  );
                })}
              </div>

              <div style={{ borderTop: '1px solid #eee', paddingTop: 20 }}>
                <h4>新增評價</h4>
                {/* ...評價表單保持不變... */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                  {['completeness:完整性', 'accuracy:準確性', 'relevance:相關性', 'readability:易讀性', 'credibility:可信度'].map(item => {
                    const [key, label] = item.split(':');
                    return (
                      <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 14 }}>{label}</span>
                        <StarRating 
                          score={ratingForm[key]} 
                          interactive={true} 
                          size={20}
                          onChange={(v) => setRatingForm({...ratingForm, [key]: v})} 
                        />
                      </div>
                    );
                  })}
                </div>
                <textarea 
                  className="b-textarea" 
                  rows={2} 
                  placeholder="寫下你的評論..." 
                  value={ratingForm.comment}
                  onChange={(e) => setRatingForm({...ratingForm, comment: e.target.value})} 
                  style={{ width: '100%', marginBottom: 10, padding: 8 }}
                />
                
                <label style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 15, cursor: 'pointer', fontSize: 14 }}>
                  <input 
                    type="checkbox" 
                    checked={ratingForm.isAnonymous} 
                    onChange={(e) => setRatingForm({...ratingForm, isAnonymous: e.target.checked})} 
                  />
                  <span>匿名評價</span>
                </label>

                <button className="btn-primary" onClick={handleSubmitRating} style={{ width: '100%' }}>送出評價</button>
                <div style={{ fontSize: 12, color: '#999', marginTop: 5, textAlign: 'center' }}>* 需先下載檔案才能評價</div>
              </div>

            </div>
          </div>
        </div>
      )}

      {showUploadModal && (
        <ResourceUploadModal 
          courseId={course.id} 
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            fetchDetail(); 
            setShowUploadModal(false);
          }}
        />
      )}
    </div>
  );
}