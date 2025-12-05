// src/pages/HelpDisclaimer.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import StickerBadge from "../components/StickerBadge";
import TapeCorner from "../components/TapeCorner";
import BackToTop from "../components/BackToTop";

// 🔥 修改 1: 更新章節列表，加入「積分與商店」與「帳號註銷」，並重新編號
const SECTIONS = [
  { id: "general",    title: "一、通用規範" },
  { id: "courses",    title: "二、課程評價板" },
  { id: "board",      title: "三、聊天版" },
  { id: "market",     title: "四、買賣版" },
  { id: "points",     title: "五、積分與商店" },      // ✨ 新增
  { id: "ip",         title: "六、著作權與個資" },    // 原本是五
  { id: "disclaimer", title: "七、免責聲明（總則）" },  // 原本是六
  { id: "change",     title: "八、變更與聯絡" },      // 原本是七
  { id: "account",    title: "九、帳號註銷" },        // ✨ 新增
];

export default function HelpDisclaimer() {
  const [active, setActive] = useState(SECTIONS[0].id);
  const wrapRef = useRef(null);

  // 目前章節高亮
  useEffect(() => {
    const nodes = SECTIONS.map(s => document.getElementById(s.id)).filter(Boolean);
    if (!nodes.length) return;
    const obs = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "0px 0px -65% 0px", threshold: [0, 0.2, 0.6, 1] }
    );
    nodes.forEach(n => obs.observe(n));
    return () => obs.disconnect();
  }, []);

  const toc = useMemo(() => SECTIONS.map(s => ({ ...s, active: active === s.id })), [active]);

  const offsetTopPx = () => {
    const nb = getComputedStyle(document.documentElement).getPropertyValue("--nb-h");
    const n = parseInt(nb);
    return Number.isFinite(n) ? n + 10 : 14;
  };

  const smoothTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - offsetTopPx();
    window.scrollTo({ top, behavior: "smooth" });
  };

  const goTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <main style={{ minHeight: "100vh" }}>
      <style>{pageCss}</style>

      {/* 頂部標題卡 */}
      <header className="y2k-card full-header">
        <TapeCorner x="18px" y="-10px" />
        <div className="header-row">
          <h2 className="title">
            使用說明 & 免責聲明 <span className="y2k-sparkle" aria-hidden="true" />
          </h2>
          <div className="badges">
            <StickerBadge tone="baby">校園平台</StickerBadge>
            <StickerBadge tone="mint">社群守則</StickerBadge>
            <StickerBadge tone="lav">權利保障</StickerBadge>
          </div>
        </div>
        <p className="subtitle">請先閱讀下列規範後再使用平台功能。</p>
      </header>

      {/* ★★ 寬版版面：左 TOC + 右內容 ★★ */}
      <div className="help-page" ref={wrapRef}>
        {/* 側邊 TOC（桌面） */}
        <aside className="help-toc" aria-label="快速導覽（目錄）">
          <nav>
            {toc.map(s => (
              <button
                key={s.id}
                className={"toc-item" + (s.active ? " is-active" : "")}
                aria-current={s.active ? "location" : undefined}
                onClick={() => smoothTo(s.id)}
              >
                {s.title}
              </button>
            ))}
          </nav>
        </aside>

        {/* 右側內容：包一層 wrapper 讓內文能置中 + 控制行長 */}
        <div className="help-content-wrapper">
          <section className="help-content">
            {/* 重要提醒 */}
            <div className="y2k-card callout">
              <div className="y2k-perf" />
              <div className="callout-row">
                <span className="dot" aria-hidden="true" />
                <div className="chat y2k-sticker y2k-sticker--banana">
                  本平台未經授權請勿上傳具有個人資料以及著作權保護的內容。
                </div>
              </div>
            </div>

            {/* 行動版 TOC（折疊） */}
            <details className="y2k-card mobile-toc">
              <summary className="y2k-btn">快速導覽</summary>
              <div className="mobile-toc-list">
                {SECTIONS.map(s => (
                  <button key={s.id} className="y2k-tab" onClick={() => smoothTo(s.id)}>
                    {s.title}
                  </button>
                ))}
              </div>
            </details>

            {/* 一～九章節 */}
            <Section id="general" title="一、通用規範">
              <ul className="ul">
                <li>友善理性、尊重多元；禁止人身攻擊、歧視、騷擾、暴力與違法內容。</li>
                <li>不得散布個資（學號、電話、Email、住址等）；必要時請打馬賽克。</li>
                <li>任何侵權（課本/付費教材/PDF/題庫/完整講義等）不得上傳。</li>
                <li>違規將移除或隱藏，情節重大者得停權並保留法律追訴權。</li>
              </ul>
            </Section>

            <Section id="courses" title="二、課程評價板">
              <Sub title="（1）瀏覽與搜尋">
                <ul className="ul">
                  <li>使用上方「學院/科系/班別/學制/類型/關鍵字」篩選功能搜尋課程，點卡片可查看：<b>期中期末考古題、筆記</b>。</li>
                </ul>
              </Sub>
              <Sub title="（2）發佈內容">
                <ul className="ul">
                  <li>新增考古題／筆記：<b>需擁有授權</b>；不可張貼付費平台/教科書/未授權講義等。</li>
                  <li>檔案請先移除個資與未授權頁面，或進行馬賽克處理。</li>
                </ul>
              </Sub>
              <Sub title={<span>（3）<span className="y2k-sticker y2k-sticker--lav" style={{fontWeight:900}}>上傳前必勾選</span></span>}>
                <ul className="ul">
                  <li><b>「我已告知授課教師，並取得同意把資料公開於平台」</b>（未勾選無法送出）。</li>
                </ul>
              </Sub>
              <Sub title="（4）檢舉與下架">
                <ul className="ul">
                  <li>遇到侵權或不當內容，請參考 八、變更與聯絡，寫明理由與聯絡方式。</li>
                  <li>流程：先行隱藏 → 通知上傳者/檢舉者 → 復核與處置。</li>
                </ul>
              </Sub>
            </Section>

            <Section id="board" title="三、聊天版">
              <Sub title="（1）可發佈內容">
                <ul className="ul">
                  <li>校園生活情報、系上活動、學習討論、揪團與經驗分享等。</li>
                </ul>
              </Sub>
              <Sub title="（2）禁止事項">
                <ul className="ul">
                  <li>人身攻擊、歧視、影射個人/社團；散布個資；散播謠言或未經證實資訊。</li>
                  <li>張貼侵權內容（全文貼書籍、付費內容、未經授權文字/圖片/影音）。</li>
                </ul>
              </Sub>
              <Sub title="（3）檢舉處理">
                <ul className="ul">
                  <li>同課程評價板流程；必要時會與系所/校方單位合作處理。</li>
                </ul>
              </Sub>
            </Section>

            <Section id="market" title="四、買賣版">
              <Sub title="（1）刊登規範">
                <ul className="ul">
                  <li>需提供：品項名稱、照片、描述、價格、聯絡方式。</li>
                  <li>禁止：違禁品、侵權品（盜版書/影音/軟體）、藥品、動物、武器與其他法規限制品。</li>
                </ul>
              </Sub>
              <Sub title="（2）交易安全">
                <ul className="ul">
                  <li>平台<b>非</b>買賣仲介、不代收款，請謹慎查證、注意詐騙。</li>
                  <li>面交請選擇明亮公共場所；郵寄請保留寄件證明與對話紀錄。</li>
                </ul>
              </Sub>
            </Section>

            {/* ✨ 新增區塊：五、積分與商店 */}
            <Section id="points" title="五、積分與商店">
              <Sub title="（1）積分獲取">
                <ul className="ul">
                  <li><b>每日簽到</b>：登入後進行簽到，可獲得 <b>10 點</b> 積分（每個帳號每日限簽到一次）。</li>
                  <li><b>資源分享</b>：於課程評價板上傳有效的考古題或筆記，每成功分享一篇將獲得 <b>20 點</b> 積分。</li>
                </ul>
              </Sub>
              <Sub title="（2）積分商店">
                <ul className="ul">
                  <li>積分可用於「積分商店」購買個性化商品（如頭貼、外框、徽章與介面主題等）。</li>
                  <li>購買後系統將依商品價格自動扣除個人帳號中的積分，已購買商品將綁定於帳號中。</li>
                </ul>
              </Sub>
            </Section>

            {/* 🔥 修改：原本的 五 改為 六 */}
            <Section id="ip" title="六、著作權與個資">
              <ul className="ul">
                <li>上傳者須確認合法授權並註明來源；侵權內容將移除並配合權利人處理。</li>
                <li>請勿上傳含個資之檔案；涉個資爭議將優先下架以保護當事人。</li>
              </ul>
            </Section>

            {/* 🔥 修改：原本的 六 改為 七 */}
            <Section id="disclaimer" title="七、免責聲明（總則）">
              <ul className="ul">
                <li>平台內容由使用者產生，僅代表張貼者個人觀點，不代表校方或平台立場。</li>
                <li>平台不保證內容之正確性/完整性/即時性；使用者應自行判斷並承擔風險。</li>
                <li>平台得基於品質與法遵，進行編輯、隱藏、刪除、停權或其他管理措施。</li>
                <li>使用平台即表示同意本頁規範；平台得視情況調整並以本頁公告為準。</li>
              </ul>
            </Section>

            {/* 🔥 修改：原本的 七 改為 八 */}
            <Section id="change" title="八、變更與聯絡">
              <ul className="ul">
                <li>規範若更新，將於本頁公告生效。</li>
                <li>如需聯繫管理員或行使權利，請聯絡我們，我們的Email：ndhu.resource.service@gmail.com。</li>
              </ul>
            </Section>

            {/* ✨ 新增區塊：九、帳號註銷 */}
            <Section id="account" title="九、帳號註銷">
               <ul className="ul">
                <li>若您希望註銷本平台帳號，請參考「<a href="#change" onClick={(e)=>{e.preventDefault(); smoothTo("change");}} style={{color: 'inherit', textDecoration: 'underline'}}>八、變更與聯絡</a>」中的聯絡方式。</li>
                <li>請使用註冊時的信箱來信告知，管理員在核對身分後將協助您進行帳號刪除作業。</li>
              </ul>
            </Section>

            {/* 底部回到頂部 */}
            <div style={{ display:"flex", justifyContent:"flex-end", marginTop: 10 }}>
              <button className="y2k-btn" onClick={goTop}>回到頂部</button>
            </div>
          </section>
        </div>
      </div>

      {/* 右下角懸浮回頂 */}
      <BackToTop />
    </main>
  );
}

/* —— 小型結構元件 —— */
function Section({ id, title, children }) {
  return (
    <section id={id} className="y2k-card section">
      <div className="section-head">
        <h3 className="section-title">{title}</h3>
        <a
          className="anchor"
          href={`#${id}`}
          aria-label={`${title} 的章節連結`}
          onClick={(e) => {
            e.preventDefault();
            const el = document.getElementById(id);
            if (!el) return;
            const top = el.getBoundingClientRect().top + window.scrollY - 10;
            window.scrollTo({ top, behavior: "smooth" });
            history.replaceState({}, "", `#${id}`);
          }}
        >#</a>
      </div>
      <div className="section-body">{children}</div>
    </section>
  );
}
function Sub({ title, children }) {
  return (
    <div className="sub">
      <h4 className="sub-title">{title}</h4>
      <div>{children}</div>
    </div>
  );
}

/* —— 本頁專用樣式 —— */
const pageCss = `
/* Header */
.full-header{
  max-width: 1280px; margin: 0 auto; padding: 16px 18px;
  position: relative; margin-top: 16px; margin-bottom: 10px;
}
.header-row{ display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap; }
.title{ margin:0; font-weight:900; }
.subtitle{ margin:.25rem 0 0; color:#5b6b86; }

/* ====== 主要版面：寬 + 好讀 ====== */
.help-page{
  width: min(100%, 1280px);
  margin: 0 auto 24px;
  padding: 0 16px 24px;
  display: grid;
  grid-template-columns: 280px 1fr; /* 左 TOC + 右內容 */
  gap: 16px;
}

/* 左側 TOC：sticky */
.help-toc{
  position: sticky;
  top: calc(var(--nb-h, 56px) + 12px);
  height: fit-content;
  padding: 0; 
  border: none;
}
.help-toc nav{ display:grid; gap:6px; }
.toc-item{
  text-align:left; border:1px solid rgba(12,34,88,.18);
  background:linear-gradient(180deg,#fff,#f6f8ff);
  border-radius:10px; padding:8px 10px; font-weight:800; color:#1b2740;
  box-shadow: inset 0 1px 0 #fff, 0 3px 10px rgba(12,22,44,.06);
  transition: transform .06s ease, box-shadow .15s ease;
}
.toc-item:hover{ transform: translateY(-1px); box-shadow: 0 6px 14px rgba(12,22,44,.10); }
.toc-item.is-active{
  background:linear-gradient(180deg,#eaf2ff,#fff); color:#16346e; border-color: rgba(12,34,88,.28);
}

/* 右側內容 */
.help-content-wrapper{
  display: grid;
  grid-template-columns: 1fr min(78ch, 100%) 1fr; 
}
.help-content{
  grid-column: 2;
  background: rgba(255,255,255,.9);
  border: 2px solid rgba(0,0,0,.1);
  border-radius: 10px;
  box-shadow: 0 8px 28px rgba(12,22,44,.06);
  padding: 16px 18px;
  font-size: 15.5px;
  line-height: 1.85;
  color: #1f2937;
}

/* 行動版 TOC */
.mobile-toc{ display:none; padding: 10px; margin-bottom: 8px; }
.mobile-toc summary{ cursor:pointer; display:inline-flex; align-items:center; gap:8px; }
.mobile-toc[open] summary{ margin-bottom:10px; }
.mobile-toc-list{ display:flex; flex-wrap:wrap; gap:8px; }
.mobile-toc-list .y2k-tab{ padding:8px 12px; }

/* 章節卡與段落 */
.content{ display:grid; gap: 12px; }
.section{ padding: 14px 16px; }
.section-head{
  display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:8px;
}
.section-title{ margin:0; font-size: 20px; font-weight:900; }
.anchor{
  text-decoration:none; font-weight:900; color:#7a8aab; border:1px solid transparent; border-radius:8px; padding:0 6px;
}
.anchor:hover{ border-color: rgba(12,34,88,.24); background:#fff; }
.sub{ margin-top: 6px; }
.sub-title{ margin: 8px 0 6px; font-size: 16px; font-weight: 900; color:#23365e; }
.ul{ padding-left: 1.2em; line-height: 1.85; margin: 0; }
.ul li{ margin: .1em 0; }

/* 呼叫框 */
.callout{ padding: 12px 14px; margin-bottom: 12px; position:relative; }
.callout .callout-row{ display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.callout .dot{ width:10px; height:10px; border-radius:50%; background:#f59e0b; }

/* RWD */
@media (max-width: 920px){
  .help-page{ grid-template-columns: 1fr; }
  .help-toc{ position: static; order: -1; }
  .mobile-toc{ display:block; }
  .help-content-wrapper{ grid-template-columns: 1fr; }
  .help-content{ border-radius: 8px; }
}
`;