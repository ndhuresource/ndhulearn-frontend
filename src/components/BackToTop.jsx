import React, { useState, useEffect } from "react";

export default function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // 滾動超過 300px 就顯示按鈕
      setShow(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!show) return null;

  return (
    <button
      onClick={scrollToTop}
      style={{
        position: "fixed",
        bottom: "30px",
        right: "30px",
        width: "45px",
        height: "45px",
        borderRadius: "50%",
        backgroundColor: "#2563eb", // 藍色背景
        color: "white",
        border: "none",
        fontSize: "20px",
        cursor: "pointer",
        boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
        transition: "transform 0.2s",
      }}
      onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.1)"}
      onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
      title="回到頂部"
    >
      ↑
    </button>
  );
}