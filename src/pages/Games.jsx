// src/pages/Games.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./games/games.css";

const games = [
  {
    id: "tictactoe",
    title: "圈圈叉叉（TicTacToe）",
    desc: "兩人對戰，率先連成三子即勝！",
    to: "/games/tictactoe",
  },
  {
    id: "whack-a-mole",
    title: "打地鼠（Whack-A-Mole）",
    desc: "限時點擊地鼠，挑戰高分！",
    to: "/games/whack-a-mole",
  },
];

export default function Games() {
  return (
    <div className="games-wrap">
      <h2>🎮 遊戲板</h2>
      <p className="games-sub">選一個小遊戲開始玩吧！</p>

      <div className="games-grid">
        {games.map((g) => (
          <Link className="game-card" to={g.to} key={g.id}>
            <div className="game-card-title">{g.title}</div>
            <div className="game-card-desc">{g.desc}</div>
            <div className="game-card-cta">開始遊戲 →</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
