import React, { useEffect, useRef, useState } from 'react'

// 輕量版「打地鼠」遊戲
export default function GameBoard() {
  const [running, setRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(15)
  const [score, setScore] = useState(0)
  const [activeIndex, setActiveIndex] = useState(-1)
  const timerRef = useRef(null)
  const popRef = useRef(null)

  // 倒數計時
  useEffect(() => {
    if (!running) return
    if (timeLeft <= 0) {
      endGame()
      return
    }
    timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(timerRef.current)
  }, [running, timeLeft])

  // 隨機跳出地鼠
  useEffect(() => {
    if (!running) return
    popRef.current = setInterval(() => {
      setActiveIndex(Math.floor(Math.random() * 9))
    }, 700)
    return () => clearInterval(popRef.current)
  }, [running])

  const startGame = () => {
    if (running) return
    setScore(0)
    setTimeLeft(15)
    setRunning(true)
  }

  const pauseGame = () => {
    setRunning(false)
    clearTimeout(timerRef.current)
    clearInterval(popRef.current)
  }

  const endGame = () => {
    clearTimeout(timerRef.current)
    clearInterval(popRef.current)
    setRunning(false)
    setActiveIndex(-1)
  }

  const resetGame = () => {
    pauseGame()
    setScore(0)
    setTimeLeft(15)
    setActiveIndex(-1)
  }

  const handleHit = (idx) => {
    if (!running) return
    if (idx === activeIndex) {
      setScore(s => s + 1)
      setActiveIndex(-1)
    } else {
      setScore(s => (s > 0 ? s - 1 : 0))
    }
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>🎯 遊戲板</h2>
        <div className="metrics">
          <span>⏱️ 倒數：{timeLeft}s</span>
          <span>🏆 分數：{score}</span>
          <span className={running ? 'status on' : 'status off'}>
            {running ? '進行中' : '已停止'}
          </span>
        </div>
      </div>

      <div className="board">
        {Array.from({ length: 9 }).map((_, i) => (
          <button
            key={i}
            className={i === activeIndex ? 'cell active' : 'cell'}
            onClick={() => handleHit(i)}
          >
            {i === activeIndex ? '🐹' : ''}
          </button>
        ))}
      </div>

      <div className="controls">
        <button onClick={startGame} className="btn primary">開始 / 繼續</button>
        <button onClick={pauseGame} className="btn">暫停</button>
        <button onClick={resetGame} className="btn danger">重置</button>
      </div>

      {!running && timeLeft === 0 && (
        <div className="result">
          <strong>遊戲結束！</strong> 最終分數：{score} 分
          <div className="tip">按「開始 / 繼續」重新開局</div>
        </div>
      )}
    </div>
  )
}
