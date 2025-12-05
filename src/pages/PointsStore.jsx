import React, { useEffect, useState } from "react";
import { userService } from "../services/userService"; 

// 對應資料庫 item_type 的分類
const TABS = [
  { key: "頭貼", label: "頭貼" },
  { key: "外框", label: "外框" },
  { key: "徽章", label: "徽章" },
  { key: "主題", label: "主題" },
];

export default function PointsStore() {
  const [tab, setTab] = useState("頭貼");
  const [me, setMe] = useState(null);
  const [items, setItems] = useState([]);      
  const [inventory, setInventory] = useState([]); 
  const [loading, setLoading] = useState(true);

  // 1. 初始化
  useEffect(() => {
    const initStore = async () => {
      try {
        const userData = await userService.getProfile();
        setMe(userData);
        localStorage.setItem("currentUser", JSON.stringify(userData));

        const shopRes = await userService.getShopItems();
        if (shopRes.success) {
          setItems(shopRes.data);
        }

        try {
          const invRes = await userService.getInventory();
          if (invRes.success) {
            const ownedIds = invRes.data.map(item => item.id);
            setInventory(ownedIds);
          }
        } catch (e) {
          console.warn("背包載入異常", e);
        }

      } catch (error) {
        console.error("商店初始化失敗", error);
      } finally {
        setLoading(false);
      }
    };

    initStore();
  }, []);

  // 2. 購買功能
  const buy = async (item) => {
    if (!me) return;
    if ((me.current_points || me.points || 0) < item.price) {
      alert("積分不足！快去簽到或上傳資源賺取積分吧。");
      return;
    }

    if (!window.confirm(`確定要花費 ${item.price} 積分購買「${item.item_name}」嗎？`)) return;

    try {
      await userService.purchaseItem(item.id);
      alert("購買成功！");
      
      const newPoints = (me.current_points || me.points) - item.price;
      const newUser = { ...me, current_points: newPoints, points: newPoints };
      setMe(newUser);
      localStorage.setItem("currentUser", JSON.stringify(newUser));
      
      setInventory([...inventory, item.id]);
      window.dispatchEvent(new Event("user:changed"));

    } catch (error) {
      console.error(error);
      alert("購買失敗：" + (error.response?.data?.message || "請稍後再試"));
    }
  };

  // 3. 裝備功能
  const equip = async (item) => {
    try {
      let payload = {};
      let alertMsg = `已換上「${item.item_name}」！`;

      if (tab === "頭貼") {
        payload = { avatarUrl: item.item_url };
      } else if (tab === "外框") {
        payload = { avatarFrameId: item.id };
      } else if (tab === "徽章") {
        payload = { badgeId: item.id };
      } else if (tab === "主題") {
        payload = { themeId: item.id };
      }

      const res = await userService.updateProfile(payload);
      
      // 立即更新主題顏色邏輯
      let newThemeStyles = me.themeStyles;
      if (tab === "主題") {
        newThemeStyles = item.item_url;
      }

      const updatedUser = { 
        ...me, 
        ...res.data,
        themeStyles: newThemeStyles 
      }; 
      
      setMe(updatedUser);
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("user:changed"));
      
      alert(alertMsg);

    } catch (error) {
      console.error(error);
      alert("裝備失敗：" + (error.response?.data?.message || "請稍後再試"));
    }
  };

  const displayList = items.filter(i => i.item_type === tab);

  // CSS 樣式修正
  const css = `
    :root{ --ink:#0e1330; --muted:#6b7280; --line:#e5e7eb; --brand:#216fff; --brand2:#2a7bff; --ok:#16a34a; --bad:#ef4444; --card:rgba(255,255,255,.95); --bg:#f6f8ff; --shadow-sm:0 8px 24px -8px rgba(14,22,42,.12); }
    
    .ps-page { 
      padding: 0 20px 40px 20px; 
      max-width: 1000px; 
      margin: 0 auto; 
    }
    
    .ps-main-card {
      background: #fff;
      border-radius: 24px;
      padding: 40px;
      padding-bottom: 80px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      margin-top: 20px;
    }

    .ps-head{ display:flex; align-items:center; gap:20px; flex-wrap:wrap; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #eee; }
    .ps-title{ font-weight:1000; font-size:1.8rem; letter-spacing:.4px; color: #333; }
    
    .ps-points{ margin-left:auto; display:inline-flex; align-items:center; gap:.5rem; padding:.6rem 1rem; border-radius:999px; font-weight:900; color:#e65100; background:#fff3e0; border:1px solid #ffe0b2; }
    .ps-points .dot{ width:12px; height:12px; border-radius:50%; background:#ff9800; display:inline-block; }
    
    .ps-tabs{ display:flex; gap:.8rem; flex-wrap:wrap; }
    
    .ps-tab{ border:1px solid #eee; background:#f5f5f5; color:#666; font-weight:bold; padding:.6rem 1.2rem; border-radius:12px; cursor:pointer; transition:all .2s; }
    .ps-tab:hover{ transform:translateY(-1px); background:#eee; }
    .ps-tab.is-active{ background:var(--brand, #2196f3); border-color:var(--brand, #2196f3); color:#fff; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
    
    /* 🔥 修改：增加上下間距 (row-gap) 至 50px */
    .ps-grid{ 
      display:grid; 
      gap: 50px 30px; /* 上下 50px, 左右 30px */
      grid-template-columns:repeat(auto-fill, minmax(200px,1fr)); 
    }
    
    .ps-card-wrap{ animation: fadeIn 0.5s ease forwards; }

    .ps-card{ 
      position:relative; 
      background:#fff; 
      border:1px solid #eee; 
      border-radius:16px; 
      padding:20px; 
      box-shadow: 0 4px 12px rgba(0,0,0,0.05); 
      transition:transform .16s ease; 
      text-align:center;
      height: 100%; 
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .ps-card:hover{ transform:translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.08); border-color:var(--brand, #b3e5fc); }

    .ps-preview{ display:grid; place-items:center; margin-bottom:15px; height: 80px; }
    .ps-avatar{ width:80px; height:80px; border-radius:50%; display:grid; place-items:center; font-size:40px; background:#f3f4f6; }
    .ps-frame{ width:80px; height:80px; border-radius:50%; background:#f3f4f6; }
    .ps-theme{ width:88px; height:40px; border-radius:10px; border:1px solid var(--line); }
    
    .ps-name{ font-weight:900; font-size: 1.1rem; margin-bottom:8px; color: #333; }
    .ps-cost{ font-size:13px; color:#666; margin-bottom: 15px; line-height: 1.4; }
    
    .ps-badges{ position:absolute; top:12px; right:12px; display:flex; gap:6px; }
    .ps-badge{ padding: 4px 8px; border-radius:6px; font-size:11px; font-weight:bold; color:#fff; }
    .ps-badge.owned{ background:#4caf50; }
    .ps-badge.using{ background:var(--brand, #2196f3); }
    .ps-badge.need{ background:#ff5252; }

    .ps-actions { margin-top: auto; width: 100%; }
    .ps-actions .btn{ width:100%; padding: 10px; border:none; border-radius:10px; cursor:pointer; font-weight:bold; background:var(--brand, #2196f3); color:#fff; box-shadow: 0 4px 10px rgba(0,0,0,0.1); transition: transform 0.1s; }
    .ps-actions .btn:active { transform: scale(0.98); }
    .ps-actions .btn:disabled{ opacity:.6; cursor:not-allowed; filter:grayscale(1); background: #ccc; box-shadow: none; }
    
    .ps-empty{ text-align:center; padding:40px; color:#999; font-size: 1.1rem; grid-column: 1 / -1; }
    @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  `;

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>載入商店中...</div>;
  if (!me) return <div style={{ padding: 40, textAlign: 'center' }}>請先登入。</div>;

  return (
    <div className="ps-page">
      <style>{css}</style>
      
      <div className="ps-main-card">
        
        <div className="ps-head">
          <div className="ps-title">✨ 積分商店</div>
          <div className="ps-points">
            <span className="dot" /> 我的積分：{me.current_points || me.points || 0}
          </div>
        </div>

        <div style={{ marginBottom: 30 }}>
            <div className="ps-tabs">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  className={"ps-tab" + (tab === t.key ? " is-active" : "")}
                  onClick={() => setTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>
        </div>

        <div className="ps-wrap">
          {displayList.length === 0 ? (
            <div className="ps-empty">目前沒有商品～</div>
          ) : (
            <div className="ps-grid">
              {displayList.map((item) => {
                const isOwned = inventory.includes(item.id);
                
                let isUsing = false;
                if (tab === "頭貼") isUsing = me.avatar_url === item.item_url;
                else if (tab === "外框") isUsing = me.avatar_frame_id === item.id;
                else if (tab === "徽章") isUsing = me.badge_id === item.id;
                else if (tab === "主題") isUsing = me.theme_id === item.id;

                const canAfford = (me.current_points || me.points || 0) >= item.price;
                
                let themeBg = "#9aa6ff";
                if (tab === "主題" && item.item_url && item.item_url.startsWith("{")) {
                  try {
                      const vars = JSON.parse(item.item_url);
                      const b1 = vars["--brand"];
                      const b2 = vars["--brand2"];
                      if(b1 && b2) themeBg = `linear-gradient(90deg, ${b1}, ${b2})`;
                  } catch(e) {}
                }

                return (
                  <div key={item.id} className="ps-card-wrap">
                    <article className="ps-card">
                      <div className="ps-badges">
                        {isUsing && <span className="ps-badge using">使用中</span>}
                        {isOwned && !isUsing && <span className="ps-badge owned">已擁有</span>}
                        {!isOwned && item.price > 0 && !canAfford && <span className="ps-badge need">積分不足</span>}
                      </div>

                      <div className="ps-preview">
                        {tab === "頭貼" && <div className="ps-avatar">{item.item_url || "🙂"}</div>}
                        {tab === "徽章" && <div style={{ fontSize: 40 }}>{item.item_url}</div>}
                        {tab === "外框" && <div className="ps-frame" style={{ boxShadow: item.item_url }} />}
                        {tab === "主題" && <div className="ps-theme" style={{ background: themeBg }} />}
                      </div>

                      <div>
                        <div className="ps-name">{item.item_name}</div>
                        <div className="ps-cost">{item.description}</div>
                        {item.price > 0 && <div style={{color:'#f57c00', fontWeight:'bold', marginBottom: 10}}>🪙 {item.price}</div>}
                      </div>

                      <div className="ps-actions">
                        {isOwned ? (
                          <button className="btn" disabled={isUsing} onClick={() => equip(item)}>
                            {isUsing ? "使用中" : "裝備"}
                          </button>
                        ) : (
                          <button className="btn" disabled={!canAfford} onClick={() => buy(item)}>
                            購買
                          </button>
                        )}
                      </div>
                    </article>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}