import React, { useEffect, useRef, useState } from "react";
import "./games.css";

export default function WhackAMole() {
  const [score, setScore] = useState(0);
  const [hole, setHole] = useState(-1);
  const [time, setTime] = useState(30);
  const timerRef = useRef(null);
  const moleRef = useRef(null);

  useEffect(() => {
    // 倒數計時
    if (time <= 0) return;
    timerRef.current = setTimeout(() => setTime((t) => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [time]);

  useEffect(() => {
    if (time <= 0) return;
    // 隨機出現地鼠
    moleRef.current = setInterval(() => {
      setHole(Math.floor(Math.random() * 9));
    }, 700);
    return () => clearInterval(moleRef.current);
  }, [time]);

  const hit = (idx) => {
    if (time <= 0) return;
    if (idx === hole) {
      setScore((s) => s + 1);
      setHole(-1);
    }
  };

  const reset = () => {
    setScore(0);
    setTime(30);
    setHole(-1);
  };

  return (
    <div className="games-wrap">
      <h2>打地鼠（Whack-A-Mole）</h2>
      <p className="games-sub">限時30秒　分數：{score}　剩餘：{time}s</p>

      <div className="wam-grid">
        {Array.from({ length: 9 }).map((_, i) => (
          <button
            key={i}
            className={`wam-cell ${i === hole ? "up" : ""}`}
            onClick={() => hit(i)}
          >
            {i === hole ? "🐹" : ""}
          </button>
        ))}
      </div>

      <button className="ttt-reset" onClick={reset}>重新開始</button>
    </div>
  );
}
