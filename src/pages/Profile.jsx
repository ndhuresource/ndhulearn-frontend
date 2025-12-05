import React, { useEffect, useState, useMemo } from "react";
import { userService } from "../services/userService";
import "../styles/Auth.css";

// 分類標籤
const TABS = [
  { key: "頭貼", label: "頭貼" },
  { key: "外框", label: "外框" },
  { key: "徽章", label: "徽章" },
  { key: "主題", label: "主題" },
];

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("頭貼");

  // --- 資料狀態 ---
  const [user, setUser] = useState(null);       // 原始使用者資料
  const [inventory, setInventory] = useState([]); // 使用者的背包 (所有已購物品)

  // --- 表單編輯狀態 ---
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // --- 預覽狀態 (Preview) ---
  const [previewAvatar, setPreviewAvatar] = useState("");     // 頭貼 (URL/Emoji)
  const [previewFrame, setPreviewFrame] = useState(null);     // 外框 (物件)
  const [previewBadge, setPreviewBadge] = useState(null);     // 徽章 (物件)
  const [previewTheme, setPreviewTheme] = useState(null);     // 主題 (物件)

  // 1. 初始化：抓取個人資料 & 背包
  useEffect(() => {
    const initProfile = async () => {
      try {
        const userData = await userService.getProfile();
        setUser(userData);
        setUsername(userData.username || "");
        
        const invRes = await userService.getInventory();
        let myItems = [];
        if (invRes.success) {
          myItems = invRes.data;
          setInventory(myItems);
        }

        setPreviewAvatar(userData.avatar_url || "🙂");
        
        if (userData.avatar_frame_id) {
          const frame = myItems.find(i => i.id === userData.avatar_frame_id);
          setPreviewFrame(frame || null);
        }
        if (userData.badge_id) {
          const badge = myItems.find(i => i.id === userData.badge_id);
          setPreviewBadge(badge || null);
        }
        if (userData.theme_id) {
          const theme = myItems.find(i => i.id === userData.theme_id);
          setPreviewTheme(theme || null);
        }

      } catch (error) {
        console.error("讀取失敗", error);
      } finally {
        setLoading(false);
      }
    };
    initProfile();
  }, []);

  // 2. 處理物品點擊
  const handleItemClick = (item) => {
    if (item.item_type === "頭貼") {
      setPreviewAvatar(item.item_url);
    } else if (item.item_type === "外框") {
      setPreviewFrame(prev => (prev?.id === item.id ? null : item));
    } else if (item.item_type === "徽章") {
      setPreviewBadge(prev => (prev?.id === item.id ? null : item));
    } else if (item.item_type === "主題") {
      setPreviewTheme(prev => (prev?.id === item.id ? null : item));
    }
  };

  // 3. 儲存變更
  const handleSave = async () => {
    try {
      const payload = {
        username: username,
        password: password || undefined,
        avatarUrl: previewAvatar,
        avatarFrameId: previewFrame ? previewFrame.id : null,
        badgeId: previewBadge ? previewBadge.id : null,
        themeId: previewTheme ? previewTheme.id : null,
      };

      // 呼叫後端更新
      const res = await userService.updateProfile(payload); // 假設後端回傳更新後的 user 物件在 res.data
      
      alert("儲存成功！");

      // 更新本地 Storage (這一步會觸發 App.jsx 的變色邏輯)
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
      
      // 我們需要把後端回傳的 themeStyles (如果有) 也存進去
      // 但 updateProfile 的回傳可能沒有 themeStyles，所以我們可以手動從 previewTheme 構建
      let newThemeStyles = null;
      if (previewTheme) {
         newThemeStyles = previewTheme.item_url;
      }

      const nextUser = { 
        ...currentUser, 
        ...res.data, // 合併後端回傳的最新資料
        username: username, 
        avatar_url: previewAvatar,
        themeStyles: newThemeStyles // 🔥 重要：更新主題樣式，讓 Navbar 變色
      };
      
      localStorage.setItem("currentUser", JSON.stringify(nextUser));
      window.dispatchEvent(new Event("user:changed"));
      
    } catch (error) {
      console.error(error);
      alert("儲存失敗");
    }
  };

  // 4. 每日簽到
  const handleCheckIn = async () => {
    try {
      const res = await userService.checkIn();
      alert(`簽到成功！獲得 ${res.points_earned || 10} 點`);
      setUser(prev => ({ ...prev, current_points: res.current_points }));
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
      localStorage.setItem("currentUser", JSON.stringify({ ...currentUser, points: res.current_points }));
      window.dispatchEvent(new Event("user:changed"));
    } catch (error) {
      alert(error.response?.data?.message || "簽到失敗");
    }
  };

  const currentTabItems = useMemo(() => {
    return inventory.filter(i => i.item_type === activeTab);
  }, [inventory, activeTab]);

  if (loading) return <div style={{padding:40, textAlign:'center'}}>載入中...</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
      
      <div style={{ background: '#fff', borderRadius: 16, padding: 40, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', gap: 50, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        
        {/* 左側：即時預覽區 */}
        <div style={{ flex: 1, minWidth: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          
          <div style={{ position: 'relative', width: 140, height: 140 }}>
            <div 
              style={{ 
                position: 'absolute', inset: 0, borderRadius: '50%', pointerEvents: 'none', zIndex: 2,
                boxShadow: previewFrame ? previewFrame.item_url : 'none' 
              }} 
            />
            <div style={{ 
              width: '100%', height: '100%', borderRadius: '50%', background: '#f5f5f5', 
              fontSize: 70, display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', border: '1px solid #eee'
            }}>
               {previewAvatar.startsWith('http') || previewAvatar.includes('/') ? (
                 <img src={previewAvatar} alt="avatar" style={{width:'100%', height:'100%', objectFit:'cover'}} />
               ) : (
                 previewAvatar
               )}
            </div>
          </div>

          <div style={{ minHeight: 40, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {previewBadge ? (
               <div style={{ 
                 background: 'var(--brand, #2196f3)', color: '#fff', padding: '4px 12px', borderRadius: 20, 
                 fontSize: 14, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 5,
                 boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
               }}>
                 <span style={{ fontSize: 18 }}>{previewBadge.item_url}</span>
                 <span>{previewBadge.item_name}</span>
               </div>
            ) : (
              <span style={{ color: '#ccc', fontSize: 13 }}>未裝備徽章</span>
            )}
          </div>
          
          <div style={{ textAlign: 'center', width: '100%', borderTop: '1px solid #eee', paddingTop: 20 }}>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#f57f17' }}>🪙 {user?.current_points || 0}</div>
            <div style={{ fontSize: 13, color: '#999', marginBottom: 15 }}>目前持有積分</div>
            <button className="btn-primary" onClick={handleCheckIn} style={{ width: '100%', borderRadius: 8 }}>
              📅 每日簽到
            </button>
          </div>
        </div>

        {/* 右側：資料編輯 & 背包 */}
        <div style={{ flex: 2, minWidth: 300 }}>
          <h2 style={{ marginTop: 0, marginBottom: 20, fontSize: 24, borderBottom: '1px solid #eee', paddingBottom: 10 }}>
            個人檔案設定
          </h2>

          <div style={{ display: 'grid', gap: 15, marginBottom: 30 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold', color: '#555' }}>Email (不可修改)</label>
              <input value={user?.email || ""} disabled style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #ddd', background: '#f9f9f9', color: '#888' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold', color: '#555' }}>名字 (暱稱)</label>
              <input 
                value={username} 
                onChange={e => setUsername(e.target.value)}
                placeholder="你的顯示名稱" 
                style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #ddd' }} 
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold', color: '#555' }}>修改密碼 (可選)</label>
              <input 
                type="password"
                value={password} 
                onChange={e => setPassword(e.target.value)}
                placeholder="留白則不變更" 
                style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #ddd' }} 
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <label style={{ fontWeight: 'bold', color: '#555' }}>我的背包 (點擊裝備預覽)</label>
              
              <div style={{ display: 'flex', gap: 5 }}>
                {TABS.map(t => (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    style={{
                      padding: '5px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13,
                      background: activeTab === t.key ? 'var(--brand, #2196f3)' : '#eee', // 按鈕也跟隨主題色
                      color: activeTab === t.key ? '#fff' : '#666'
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ 
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: 10, 
              background: '#f8f9fa', padding: 15, borderRadius: 12, minHeight: 120 
            }}>
              {currentTabItems.length > 0 ? (
                currentTabItems.map(item => {
                  let isSelected = false;
                  if (activeTab === "頭貼") isSelected = previewAvatar === item.item_url;
                  if (activeTab === "外框") isSelected = previewFrame?.id === item.id;
                  if (activeTab === "徽章") isSelected = previewBadge?.id === item.id;
                  if (activeTab === "主題") isSelected = previewTheme?.id === item.id;

                  // 🔥🔥🔥 新增：解析主題顏色 (用於預覽)
                  let themePreviewBg = "#eee";
                  if (activeTab === "主題") {
                    try {
                        const vars = JSON.parse(item.item_url);
                        if (vars["--brand"] && vars["--brand2"]) {
                            themePreviewBg = `linear-gradient(135deg, ${vars["--brand"]}, ${vars["--brand2"]})`;
                        } else {
                            themePreviewBg = vars["--brand"] || "#9aa6ff";
                        }
                    } catch(e) {}
                  }

                  return (
                    <button 
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      title={item.item_name}
                      style={{ 
                        aspectRatio: '1/1', 
                        border: isSelected ? '2px solid var(--brand, #2196f3)' : '1px solid #eee', // 邊框跟隨主題色
                        borderRadius: 10, background: '#fff', cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        position: 'relative', overflow: 'hidden'
                      }}
                    >
                       {activeTab === "頭貼" && <div style={{fontSize: 28}}>{item.item_url}</div>}
                       {activeTab === "徽章" && <div style={{fontSize: 28}}>{item.item_url}</div>}
                       {activeTab === "外框" && <div style={{width: 30, height: 30, borderRadius: '50%', boxShadow: item.item_url, background:'#eee'}} />}
                       
                       {/* 🔥 修改：顯示主題色塊 */}
                       {activeTab === "主題" && (
                           <div style={{ width: '100%', height: '100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                               <div style={{ width: 24, height: 24, borderRadius: '50%', background: themePreviewBg, marginBottom: 4, border:'1px solid rgba(0,0,0,0.1)' }} />
                               <div style={{ fontSize: 10, fontWeight:'bold', color:'#555' }}>{item.item_name}</div>
                           </div>
                       )}
                       
                       {isSelected && (
                         <div style={{position:'absolute', bottom:0, right:0, background:'var(--brand, #2196f3)', color:'#fff', fontSize:10, padding:'2px 4px', borderTopLeftRadius:6}}>
                           ✓
                         </div>
                       )}
                    </button>
                  );
                })
              ) : (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#999', fontSize: 14, paddingTop: 30 }}>
                  還沒有{activeTab}喔，去<a href="/store" style={{color:'var(--brand, #2196f3)'}}>積分商店</a>逛逛吧！
                </div>
              )}
            </div>
            
            <div style={{ marginTop: 5, fontSize: 12, color: '#888', textAlign: 'right' }}>
              * 選擇後請記得點擊下方「儲存變更」
            </div>
          </div>

          <div style={{ marginTop: 30, textAlign: 'right' }}>
            <button 
              className="btn-primary" 
              onClick={handleSave} 
              style={{ padding: '12px 30px', fontSize: 16, borderRadius: 8, boxShadow: '0 4px 14px rgba(0,0,0,0.1)' }}
            >
              💾 儲存所有變更
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}