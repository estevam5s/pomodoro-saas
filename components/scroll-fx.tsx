"use client";
import { useEffect, useRef } from "react";

// Efeito de scroll roxo (estilo pytrack): barra de progresso no topo + glow ambiente
// que intensifica ao rolar. Inline-styles → portável (Tailwind v3/v4, Next e Vite).
export function ScrollFX() {
  const barRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const p = max > 0 ? Math.min(1, doc.scrollTop / max) : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      if (glowRef.current) glowRef.current.style.opacity = String(0.35 + p * 0.5);
    };
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
  }, []);
  return (
    <>
      <div ref={barRef} aria-hidden style={{ position: "fixed", left: 0, right: 0, top: 0, height: 3, transformOrigin: "left", transform: "scaleX(0)", zIndex: 60, background: "linear-gradient(90deg,#7c3aed,#d946ef,#7c3aed)" }} />
      <div ref={glowRef} aria-hidden style={{ position: "fixed", left: 0, right: 0, top: 0, height: 420, zIndex: -10, pointerEvents: "none", filter: "blur(110px)", opacity: 0.35, transition: "opacity .3s", background: "radial-gradient(60% 100% at 50% 0%, rgba(147,51,234,.55), transparent 70%)" }} />
    </>
  );
}
