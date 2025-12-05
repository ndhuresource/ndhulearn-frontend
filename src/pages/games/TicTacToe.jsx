import React, { useState } from "react";
import "./games.css";

function calcWinner(s) {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (const [a,b,c] of lines) {
    if (s[a] && s[a] === s[b] && s[a] === s[c]) return s[a];
  }
  return null;
}

export default function TicTacToe() {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const winner = calcWinner(squares);

  const onClick = (i) => {
    if (winner || squares[i]) return;
    const next = squares.slice();
    next[i] = xIsNext ? "X" : "O";
    setSquares(next);
    setXIsNext(!xIsNext);
  };

  const reset = () => {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
  };

  return (
    <div className="games-wrap">
      <h2>圈圈叉叉（TicTacToe）</h2>
      <p className="games-sub">兩人對戰：{winner ? `勝者：${winner}` : `輪到：${xIsNext ? "X" : "O"}`}</p>

      <div className="ttt-grid">
        {squares.map((v,i) => (
          <button key={i} className="ttt-cell" onClick={() => onClick(i)}>
            {v}
          </button>
        ))}
      </div>

      <button className="ttt-reset" onClick={reset}>重新開始</button>
    </div>
  );
}
