import React, { useEffect, useRef, useState } from 'react'

// 簡單的本地聊天室
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : initialValue
    } catch {
      return initialValue
    }
  })
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])
  return [value, setValue]
}

export default function ChatBoard() {
  const [messages, setMessages] = useLocalStorage('chat_messages', [])
  const [text, setText] = useState('')
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    const content = text.trim()
    if (!content) return
    const msg = {
      id: Date.now(),
      sender: '我',
      content,
      ts: new Date().toISOString(),
    }
    setMessages(prev => [...prev, msg])
    setText('')
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const clearAll = () => {
    if (confirm('清空所有訊息？')) setMessages([])
  }

  return (
    <div className="panel chat">
      <div className="panel-header">
        <h2>💬 聊天板</h2>
        <div className="chat-actions">
          <button className="btn small" onClick={clearAll}>清空</button>
        </div>
      </div>

      <div className="chat-window">
        {messages.map(m => (
          <div className="bubble-row" key={m.id}>
            <div className="avatar" title={m.sender}>🙂</div>
            <div className="bubble">
              <div className="meta">
                <span className="name">{m.sender}</span>
                <span className="time">{new Date(m.ts).toLocaleString()}</span>
              </div>
              <div className="content">{m.content}</div>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="chat-input">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="輸入訊息… (Enter 送出, Shift+Enter 換行)"
        />
        <button className="btn primary" onClick={handleSend}>送出</button>
      </div>
    </div>
  )
}
