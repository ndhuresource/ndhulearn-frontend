// src/pages/NdhuScene.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import "../styles/ndhu.css";

/** 單一長幅場景（左右滑） + 手繪地圖風 + 多元人群 + 互動面板 + 可關閉 */
export default function NdhuScene({ onClose }) {
  // 8 段，每段 1200px → 9600px 世界寬度
  const SECTIONS = 8;
  const SEG_W = 1200;
  const WORLD_W = SECTIONS * SEG_W;

  const worldRef = useRef(null);
  const [visible, setVisible] = useState(true);
  const [active, setActive] = useState(null); // 目前開啟的地標 key（或 null）

  // 讓直向滾輪也可以水平滑
  useEffect(() => {
    const el = worldRef.current;
    if (!el) return;
    const onWheel = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        el.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // ESC 關閉資訊面板（沒有面板時就關閉整個場景）
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (active) setActive(null);
        else handleClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  // 地標資料（插圖型別、標籤、簡介、標籤 pill）
  const PLACES = useMemo(
    () => ({
      gate:           { label: "前門",           desc: "東華入口廣場，兩側行道樹與迎賓廣場。", tags: ["入口", "地標"] },
      lake:           { label: "蓮華池",         desc: "湖面開闊、可見蓮葉與水鳥，是散步與慢跑的熱門路線。", tags: ["步道", "景觀"] },
      lib:            { label: "圖書館",         desc: "典藏豐富、採自然光、中庭閱讀區舒適。", tags: ["自習", "借閱"] },
      sac:            { label: "學生活動中心",   desc: "社團據點與活動空間，假日常有展演。", tags: ["社團", "活動"] },
      dorms:          { label: "宿舍群",         desc: "宿舍與生活機能集中區，步行可達餐飲商店。", tags: ["住宿"] },
      "zhixue-st":    { label: "志學街",         desc: "人氣美食一條街，奶茶、鹽酥雞、點心樣樣有。", tags: ["美食", "夜間"] },
      "zhixue-station": { label: "志學車站",    desc: "鄰近校園的火車站，通學交通樞紐。", tags: ["交通"] },
    }),
    []
  );

  // 地標位置（左→右）
  const landmarks = useMemo(
    () => [
      { x: SEG_W * 0 + 90,  key: "gate" },
      { x: SEG_W * 1 + 160, key: "lake" },
      { x: SEG_W * 2 + 120, key: "lib" },
      { x: SEG_W * 3 + 60,  key: "sac" },
      { x: SEG_W * 4 + 200, key: "dorms" },
      { x: SEG_W * 6 + 120, key: "zhixue-st" },
      { x: SEG_W * 7 + 160, key: "zhixue-station" },
    ],
    []
  );

  const jump = (x) => worldRef.current?.scrollTo({ left: x, behavior: "smooth" });

  const handleClose = () => {
    if (onClose) onClose();
    else setVisible(false);
  };

  if (!visible) return null;

  const activeMeta = active ? PLACES[active] : null;

  return (
    <div
      className="ndhu-world"
      ref={worldRef}
      style={{ '--worldWpx': `${WORLD_W}px` }} // 一定要 px，動畫才會動
    >
      {/* 右上角關閉 */}
      <button
        className="ndhu-close"
        aria-label="關閉"
        onClick={handleClose}
        title="關閉"
      >
        ×
      </button>

      <div className="world-content">
        {/* 紙質感 + 遠景 */}
        <PaperTexture />
        <WorldSVG width={WORLD_W} height={600} />

        {/* 一條長長的馬路 */}
        <div className="world-road" aria-hidden />

        {/* 手繪風建物插圖（可點擊開啟資訊面板） */}
        {landmarks.map((lm) => {
          const meta = PLACES[lm.key] || { label: lm.key };
          return (
            <IlloSlot
              key={lm.key}
              x={lm.x}
              w={420}
              h={240}
              label={meta.label}
              onOpen={() => setActive(lm.key)}
            >
              <Illo type={lm.key} />
            </IlloSlot>
          );
        })}

        {/* 雙向人流（更精緻、可互動：移入暫停；點擊會小跳一下） */}
        <PeopleSpawner count={20} dir="right" lane="low" />
        <PeopleSpawner count={18} dir="left"  lane="high" />

        {/* 地標錨點（可點跳） */}
        {landmarks.map((m) => {
          const meta = PLACES[m.key];
          return (
            <button
              key={m.key}
              className="world-mark"
              style={{ left: `${m.x}px` }}
              onClick={() => jump(m.x)}
              title={meta.label}
            >
              {meta.label}
            </button>
          );
        })}
      </div>

      {/* 底部微型進度條（可點） */}
      <div className="world-progress">
        {landmarks.map((m) => (
          <span key={m.key} className="tick" onClick={() => jump(m.x)} />
        ))}
      </div>

      {/* 互動資訊面板（點地標開啟） */}
      {activeMeta && (
        <>
          <div className="sheet-mask" onClick={() => setActive(null)} />
          <aside className="sheet" aria-labelledby="sheet-title" role="dialog">
            <div className="sheet-header">
              <h3 id="sheet-title">{activeMeta.label}</h3>
              <button
                className="sheet-close"
                aria-label="關閉資訊"
                onClick={() => setActive(null)}
                title="關閉"
              >
                ×
              </button>
            </div>
            <div className="sheet-body">
              <div className="sheet-illo">
                <Illo type={active} />
              </div>
              <p className="sheet-desc">{activeMeta.desc}</p>
              <div className="sheet-tags">
                {(activeMeta.tags || []).map((t) => (
                  <span key={t} className="tag">{t}</span>
                ))}
              </div>
            </div>
            <div className="sheet-actions">
              <button className="btn" onClick={() => jump(landmarks.find(l => l.key === active).x)}>
                導航到這裡
              </button>
              <button className="btn ghost" onClick={() => setActive(null)}>
                我知道了
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}

/* ─────────────────── 人物（多元） ─────────────────── */

function PeopleSpawner({ count = 10, dir = "right", lane = "low" }) {
  // 權重池（人類較多，含動物與自行車）
  const POOL = [
    "man","woman","man","woman",
    "cyclist_m","cyclist_f",
    "dog","rabbit","pheasant",
    "man","woman"
  ];
  const y = lane === "high" ? "16vh" : "11vh";

  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const variant = POOL[Math.floor(Math.random() * POOL.length)] || "man";
        const isCyclist = variant.startsWith("cyclist");
        const base = isCyclist ? 14 : 20; // 秒
        const duration = base + Math.random() * 8;
        const delay = Math.random() * 18;
        const colors =
          variant === "man" || variant === "woman" || isCyclist
            ? makeColors()
            : undefined;

        // 小互動：點擊角色會小跳一下（CSS 里用 .pop）
        const onClick = (e) => {
          const el = e.currentTarget;
          el.classList.remove("pop");
          void el.offsetWidth;
          el.classList.add("pop");
        };

        return (
          <div
            key={`${dir}-${i}-${variant}`}
            className={`char ${dir === "left" ? "left" : "right"}`}
            style={{ animationDuration: `${duration}s`, animationDelay: `${delay}s`, '--y': y }}
            onClick={onClick}
            title="點我打招呼 👋"
          >
            <div className="bob">
              {variant === "man"       && <HumanSVG gender="m" colors={colors} />}
              {variant === "woman"     && <HumanSVG gender="f" colors={colors} />}
              {variant === "cyclist_m" && <CyclistSVG gender="m" colors={colors} />}
              {variant === "cyclist_f" && <CyclistSVG gender="f" colors={colors} />}
              {variant === "dog"       && <DogSVG />}
              {variant === "rabbit"    && <RabbitSVG />}
              {variant === "pheasant"  && <PheasantSVG />}
            </div>
          </div>
        );
      })}
    </>
  );
}

/* ─────────────────── 背景（紙質感 + 草地 + 遠山） ─────────────────── */

function PaperTexture() {
  return (
    <svg className="paper" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
      <defs>
        <filter id="paperNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 0.35" />
          </feComponentTransfer>
        </filter>
      </defs>
      <rect x="0" y="0" width="100" height="100" filter="url(#paperNoise)" />
    </svg>
  );
}

function WorldSVG({ width, height }) {
  const W = width;
  const H = height;
  return (
    <svg className="svg world-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"  stopColor="#dfefff" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#sky)" />
      {/* 遠山（帶墨線） */}
      {Array.from({ length: Math.ceil(W / 360) }).map((_, i) => (
        <path
          key={i}
          d={`M${i * 360} 430 L ${i * 360 + 180} 270 L ${i * 360 + 360} 430 Z`}
          fill="#c6d3e0"
          stroke="#2b2d42"
          strokeWidth="1.2"
          opacity=".5"
        />
      ))}
      {/* 草地層 */}
      <rect y={H - 120} width={W} height="120" fill="#cbe9be" />
      <rect y={H - 80}  width={W} height="80"  fill="#b5dca8" />
    </svg>
  );
}

/* ─────────────────── 手繪插圖群 ─────────────────── */

function IlloSlot({ x = 0, w = 420, h = 240, label = "", onOpen, children }) {
  return (
    <div className="illo-slot" style={{ left: x, width: w, height: h }}>
      <button
        className="illo-label hotspot"
        onClick={onOpen}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen?.()}
      >
        {label}
      </button>
      <div
        className="illo-box"
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e)=> (e.key === "Enter" || e.key === " ") && onOpen?.()}
      >
        {children}
      </div>
    </div>
  );
}

function Illo({ type }) {
  switch (type) {
    case "gate":             return <GateIllo />;
    case "lake":             return <LakeIllo />;
    case "lib":              return <LibraryIllo />;
    case "sac":              return <StudentCenterIllo />;
    case "dorms":            return <DormsIllo />;
    case "zhixue-st":        return <StreetIllo />;
    case "zhixue-station":   return <StationIllo />;
    default:                 return <GenericBuildingIllo />;
  }
}

const INK = "#2b2d42";

function GateIllo() {
  return (
    <svg viewBox="0 0 360 240" width="100%" height="100%">
      <rect x="10" y="182" width="340" height="36" fill="#d6dbc7" stroke={INK} strokeWidth="2.5" />
      <rect x="60" y="120" width="26" height="74" rx="6" fill="#d0c7b7" stroke={INK} strokeWidth="2.5" />
      <rect x="274" y="120" width="26" height="74" rx="6" fill="#d0c7b7" stroke={INK} strokeWidth="2.5" />
      <rect x="86" y="128" width="188" height="16" rx="6" fill="#f1eadc" stroke={INK} strokeWidth="2.5" />
      <text x="180" y="118" textAnchor="middle" fontSize="16" fontWeight="800" fill={INK}>NDHU</text>
      <circle cx="36" cy="164" r="24" fill="#8ec07c" stroke={INK} strokeWidth="2" />
      <rect x="32" y="164" width="8" height="18" fill="#8b5a2b" stroke={INK} strokeWidth="1.5" />
      <circle cx="324" cy="164" r="24" fill="#8ec07c" stroke={INK} strokeWidth="2" />
      <rect x="320" y="164" width="8" height="18" fill="#8b5a2b" stroke={INK} strokeWidth="1.5" />
    </svg>
  );
}
function LakeIllo() {
  return (
    <svg viewBox="0 0 360 240" width="100%" height="100%">
      <defs>
        <linearGradient id="water" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#b7e3f4" />
          <stop offset="100%" stopColor="#dff6ff" />
        </linearGradient>
      </defs>
      <ellipse cx="180" cy="165" rx="130" ry="62" fill="url(#water)" stroke={INK} strokeWidth="2.5" />
      <ellipse cx="180" cy="165" rx="100" ry="46" fill="none" stroke="#8dd3e7" strokeWidth="2" opacity=".6" />
      <ellipse cx="180" cy="165" rx="70"  ry="30" fill="none" stroke="#8dd3e7" strokeWidth="2" opacity=".5" />
      {Array.from({ length: 5 }).map((_, i) => (
        <g key={i} transform={`translate(${120 + i * 36}, ${145 + (i%2)*10})`}>
          <circle r="6" fill="#88c057" stroke={INK} strokeWidth="1.5" />
          <circle cx="10" r="6" fill="#88c057" stroke={INK} strokeWidth="1.5" />
          <circle cx="5" cy="-6" r="4" fill="#f87171" stroke={INK} strokeWidth="1.2" />
        </g>
      ))}
    </svg>
  );
}
function LibraryIllo() {
  return (
    <svg viewBox="0 0 360 240" width="100%" height="100%">
      <rect x="40" y="115" width="280" height="96" rx="10" fill="#f1f4ff" stroke={INK} strokeWidth="2.5" />
      <path d="M32 118 L180 62 L328 118 Z" fill="#e5e9ff" stroke={INK} strokeWidth="2.5" />
      {Array.from({ length: 5 }).map((_, c) => (
        <g key={c} transform={`translate(${60 + c * 50}, 132)`}>
          {Array.from({ length: 3 }).map((_, r) => (
            <rect key={r} x="0" y={r * 28} width="34" height="18" rx="4" fill="#ffffff" stroke="#cbd5ff" strokeWidth="1.5" />
          ))}
        </g>
      ))}
      <text x="180" y="106" textAnchor="middle" fontWeight="800" fontSize="14" fill="#5160a3">圖書館</text>
    </svg>
  );
}
function StudentCenterIllo() {
  return (
    <svg viewBox="0 0 360 240" width="100%" height="100%">
      <rect x="50" y="126" width="260" height="82" rx="10" fill="#ffe6cc" stroke={INK} strokeWidth="2.5" />
      <rect x="70" y="142" width="220" height="44" fill="#fff6e9" stroke="#f3caa9" strokeWidth="1.8" />
      <text x="180" y="120" textAnchor="middle" fontWeight="800" fontSize="14" fill="#b26c2f">學生活動中心</text>
    </svg>
  );
}
function DormsIllo() {
  return (
    <svg viewBox="0 0 360 240" width="100%" height="100%">
      {Array.from({ length: 3 }).map((_, i) => (
        <g key={i} transform={`translate(${40 + i * 100}, 120)`}>
          <rect width="80" height="88" rx="10" fill="#ffd9c2" stroke={INK} strokeWidth="2" />
          <rect x="12" y="18" width="56" height="24" fill="#fff" stroke="#f2b79b" />
          <rect x="12" y="48" width="56" height="24" fill="#fff" stroke="#f2b79b" />
        </g>
      ))}
      <text x="180" y="116" textAnchor="middle" fontWeight="800" fontSize="13" fill="#a66d4a">宿舍群</text>
    </svg>
  );
}
function StreetIllo() {
  return (
    <svg viewBox="0 0 360 240" width="100%" height="100%">
      {Array.from({ length: 4 }).map((_, i) => (
        <g key={i} transform={`translate(${30 + i * 80}, 132)`}>
          <rect width="70" height="74" rx="8" fill="#ffe3e3" stroke={INK} strokeWidth="2.2" />
          <rect x="6" y="8" width="58" height="18" rx="6" fill="#111" />
          <text x="35" y="22" textAnchor="middle" fontSize="12" fill="#fff" fontWeight="800">
            {["奶茶","鹽酥雞","點心","志學街"][i]}
          </text>
          <rect x="10" y="36" width="50" height="30" fill="#fff" stroke="#ffc9c9" strokeWidth="1.6" />
        </g>
      ))}
    </svg>
  );
}
function StationIllo() {
  return (
    <svg viewBox="0 0 360 240" width="100%" height="100%">
      <rect x="40" y="138" width="280" height="74" rx="12" fill="#22324a" stroke={INK} strokeWidth="2.5" />
      <rect x="60" y="150" width="240" height="36" rx="6" fill="#122237" />
      <text x="180" y="174" textAnchor="middle" fill="#8dd6ff" fontWeight="800" fontSize="16">志學車站</text>
      <path d="M40 138 L180 108 L320 138 Z" fill="#334761" stroke={INK} strokeWidth="2.5" />
    </svg>
  );
}
function GenericBuildingIllo() {
  return (
    <svg viewBox="0 0 360 240" width="100%" height="100%">
      <rect x="70" y="128" width="220" height="84" rx="10" fill="#e8f0ff" stroke={INK} strokeWidth="2.5" />
      <path d="M60 128 L180 96 L300 128 Z" fill="#dbe6ff" stroke={INK} strokeWidth="2.5" />
    </svg>
  );
}

/* ─────────────────── 角色 SVG（更精緻 + 微互動） ─────────────────── */
function HumanSVG({ gender = "m", colors = defaultColors() }) {
  const { shirt, pants, skin, hair } = colors;
  return (
    <svg viewBox="0 0 120 140" className="svg-char">
      <g className="body">
        <circle cx="60" cy="26" r="12" fill={skin}/>
        {gender === "m" ? (
          <path d="M48,28 C48,16 72,16 72,28 C72,20 48,20 48,28 Z" fill={hair} />
        ) : (
          <path d="M44,30 C44,16 76,16 76,30 C76,40 70,46 60,46 C50,46 44,40 44,30 Z" fill={hair} />
        )}
        <path d="M48 46 h24 v38 h-24 z" fill={shirt}/>
        <g className="arm-right"><rect x="70" y="58" width="10" height="24" rx="5" fill={skin}/></g>
        <g className="arm-left"><rect  x="40" y="58" width="10" height="24" rx="5" fill={skin}/></g>
        <g className="leg-left"><rect  x="50" y="84" width="10" height="30" rx="5" fill={pants}/></g>
        <g className="leg-right"><rect x="60" y="84" width="10" height="30" rx="5" fill={pants}/></g>
        <g className="shoe-left"><rect  x="46" y="112" width="18" height="6" rx="3" fill="#111"/></g>
        <g className="shoe-right"><rect x="56" y="112" width="18" height="6" rx="3" fill="#111"/></g>
      </g>
    </svg>
  );
}
function CyclistSVG({ gender = "m", colors = defaultColors() }) {
  const { shirt, pants, skin, hair } = colors;
  return (
    <svg viewBox="0 0 180 140" className="svg-char">
      <g className="bike">
        {/* 輪子不旋轉（CSS 已關閉 animation） */}
        <circle className="wheel" cx="50" cy="110" r="20" stroke="#111" strokeWidth="6" fill="none"/>
        <circle className="wheel" cx="130" cy="110" r="20" stroke="#111" strokeWidth="6" fill="none"/>
        <path d="M50 110 L80 90 L110 110 L130 110 M80 90 L100 84" stroke="#0ea5e9" strokeWidth="6" fill="none"/>
      </g>
      <g className="rider">
        <circle cx="88" cy="42" r="12" fill={skin}/>
        {gender === "m" ? (
          <path d="M80,42 C80,34 96,34 96,42 C96,36 80,36 80,42 Z" fill={hair} />
        ) : (
          <path d="M78,44 C78,32 98,32 98,44 C98,52 94,56 88,56 C82,56 78,52 78,44 Z" fill={hair} />
        )}
        <rect x="76" y="54" width="24" height="20" rx="6" fill={shirt}/>
        <rect x="86" y="74" width="10" height="30" rx="5" fill={pants}/>
        <rect x="98" y="74" width="10" height="30" rx="5" fill={pants}/>
      </g>
    </svg>
  );
}
function DogSVG(){
  return (
    <svg viewBox="0 0 96 64" className="svg-char dog">
      <rect x="16" y="22" width="50" height="22" rx="10" fill="#b45309" />
      <circle cx="70" cy="30" r="12" fill="#b45309" />
      <circle cx="74" cy="28" r="3" fill="#111827" />
      <path d="M12 30 L20 22 L20 38 Z" fill="#7c2d12" />
      <rect x="24" y="44" width="6" height="12" rx="3" fill="#7c2d12" />
      <rect x="42" y="44" width="6" height="12" rx="3" fill="#7c2d12" />
      {/* tail */}
      <path className="tail" d="M28 28 q-12 -6 -18 0" stroke="#7c2d12" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  );
}
function RabbitSVG(){
  return (
    <svg viewBox="0 0 88 68" className="svg-char rabbit">
      <ellipse cx="40" cy="44" rx="26" ry="18" fill="#f5f5f4" />
      <circle cx="64" cy="38" r="12" fill="#f5f5f4" />
      <circle cx="68" cy="36" r="3" fill="#ef4444" />
      <rect className="ear" x="24" y="18" width="8" height="20" rx="4" fill="#f5f5f4" />
      <rect className="ear" x="32" y="16" width="8" height="22" rx="4" fill="#f5f5f4" />
      <rect x="28" y="40" width="6" height="10" rx="3" fill="#d6d3d1" />
    </svg>
  );
}
function PheasantSVG(){
  return (
    <svg viewBox="0 0 108 56" className="svg-char pheasant">
      {/* 尾羽 */}
      <path d="M16 32 C6 26 6 24 4 22 C18 22 30 26 40 30"
            stroke="#5b3a1a" strokeWidth="8" fill="none" />
      {/* 身體 */}
      <ellipse cx="48" cy="34" rx="20" ry="12" fill="#a16207" />
      {/* 頭部 */}
      <g className="head">
        <circle cx="66" cy="28" r="8" fill="#065f46" />
        <circle cx="66" cy="28" r="5" fill="#fff" />
        <circle cx="68" cy="28" r="4" fill="#065f46" />
        <path d="M74 28 L82 26 L74 24 Z" fill="#f59e0b" />
        <circle cx="70" cy="26" r="1.8" fill="#111827" />
      </g>
      {/* 腿 */}
      <path d="M46 42 L42 48 M54 42 L50 48"
            stroke="#b45309" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/* ─────────────────── 色彩工具 ─────────────────── */
function makeColors() {
  const SHIRTS = ["#2563eb","#16a34a","#dc2626","#9333ea","#f59e0b","#0ea5e9","#374151","#e11d48","#059669"];
  const PANTS  = ["#1f2937","#334155","#4b5563","#3f3f46","#065f46","#78350f"];
  const SKIN   = ["#f8d6c2","#eec1a7","#d39b7c","#a97461","#8d5b4a"];
  const HAIR   = ["#111827","#6b7280","#a16207","#92400e","#0f172a"];
  const pick = (arr) => arr[Math.floor(Math.random()*arr.length)];
  return { shirt: pick(SHIRTS), pants: pick(PANTS), skin: pick(SKIN), hair: pick(HAIR) };
}
function defaultColors() {
  return { shirt: '#2563eb', pants: '#334155', skin: '#eec1a7', hair: '#111827' };
}
