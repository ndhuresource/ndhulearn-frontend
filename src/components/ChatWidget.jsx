// src/components/ChatWidget.jsx
import React, { useState } from "react";
import "./ChatWidget.css";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "您好！我是 AI 客服，有什麼可以幫您？" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { from: "user", text: input }]);

    // 簡易回答，可改接 API
    let reply = "我還在學習，請再試試看～";
    if (input.includes("課程")) reply = "您可以到課程評價板查看評價！";
    if (input.includes("買")) reply = "前往買賣板可以刊登或查看商品！";

    setMessages((prev) => [...prev, { from: "bot", text: reply }]);
    setInput("");
  };

  return (
    <div className="chat-widget">
      {open ? (
        <div className="chat-box">
          <div className="chat-header" onClick={() => setOpen(false)}>
            AI 客服
          </div>
          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.from}`}>{m.text}</div>
            ))}
          </div>
          <div className="chat-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="輸入訊息..."
            />
            <button onClick={handleSend}>送出</button>
          </div>
        </div>
      ) : (
        <button className="chat-toggle" onClick={() => setOpen(true)}>💬</button>
      )}
    </div>
  );
}
