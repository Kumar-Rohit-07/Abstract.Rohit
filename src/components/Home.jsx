import { useEffect, useRef } from "react";
import meself from "../assets/meself.png";
import ironman from "../assets/ironman.png";

export default function Home() {
  const sectionRef = useRef(null);
  const ironRef = useRef(null);
  const trailRef = useRef([]);
  const mouseRef = useRef(null);
  const rafRef = useRef(null);
  const starsCanvasRef = useRef(null);
  const blocksCanvasRef = useRef(null);
  const roleRef = useRef(null);
  const letterRafsRef = useRef([]);

  // ── Iron Man canvas mask ──────────────────────────────────────────────────
  useEffect(() => {
    const iron = ironRef.current;
    if (!iron) return;

    const maskCanvas = document.createElement("canvas");
    const ctx = maskCanvas.getContext("2d");

    const sync = () => {
      const rect = iron.getBoundingClientRect();
      maskCanvas.width = rect.width || iron.offsetWidth;
      maskCanvas.height = rect.height || iron.offsetHeight;
    };
    sync();
    window.addEventListener("resize", sync);

    const loop = () => {
      const W = maskCanvas.width;
      const H = maskCanvas.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "destination-out";

      const m = mouseRef.current;
      if (m) {
        const r = iron.getBoundingClientRect();
        const cx = (m.x - r.left) * (W / r.width);
        const cy = (m.y - r.top) * (H / r.height);
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80);
        g.addColorStop(0, "rgba(0,0,0,1)");
        g.addColorStop(0.6, "rgba(0,0,0,0.9)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.arc(cx, cy, 80, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }

      trailRef.current.forEach((pt) => {
        pt.radius += 3;
        pt.alpha = Math.max(0, 1 - pt.radius / pt.maxRadius);
        if (pt.alpha <= 0) return;
        const g = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, pt.radius);
        g.addColorStop(0, `rgba(0,0,0,${pt.alpha})`);
        g.addColorStop(0.5, `rgba(0,0,0,${pt.alpha * 0.75})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      });

      ctx.globalCompositeOperation = "source-over";
      trailRef.current = trailRef.current.filter((p) => p.alpha > 0);

      const url = maskCanvas.toDataURL();
      iron.style.maskImage = `url(${url})`;
      iron.style.webkitMaskImage = `url(${url})`;
      iron.style.maskSize = "100% 100%";
      iron.style.webkitMaskSize = "100% 100%";

      rafRef.current = requestAnimationFrame(loop);
    };

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", sync);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ── UI/UX DESIGNER letter mouse tracking ─────────────────────────────────
  useEffect(() => {
    const roleEl = roleRef.current;
    if (!roleEl) return;

    const letters = roleEl.querySelectorAll(".role-letter");
    const targets = Array.from(letters).map(() => ({ rx: 0, ry: 0, scale: 1 }));
    const currents = Array.from(letters).map(() => ({ rx: 0, ry: 0, scale: 1 }));

    const LERP = 0.08;
    const MAX_ROTATE = 18;
    const MAX_SCALE = 1.22;
    const INFLUENCE_RADIUS = 140;

    const lerp = (a, b, t) => a + (b - a) * t;

    const animate = () => {
      const m = mouseRef.current;
      letters.forEach((el, i) => {
        if (m) {
          const rect = el.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dx = m.x - cx;
          const dy = m.y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const influence = Math.max(0, 1 - dist / INFLUENCE_RADIUS);

          targets[i].rx = -dy * influence * (MAX_ROTATE / 80);
          targets[i].ry = dx * influence * (MAX_ROTATE / 80);
          targets[i].scale = 1 + influence * (MAX_SCALE - 1);
        } else {
          targets[i].rx = 0;
          targets[i].ry = 0;
          targets[i].scale = 1;
        }

        currents[i].rx = lerp(currents[i].rx, targets[i].rx, LERP);
        currents[i].ry = lerp(currents[i].ry, targets[i].ry, LERP);
        currents[i].scale = lerp(currents[i].scale, targets[i].scale, LERP);

        el.style.transform = `perspective(400px) rotateX(${currents[i].rx}deg) rotateY(${currents[i].ry}deg) scale(${currents[i].scale})`;
        el.style.color = currents[i].scale > 1.05
          ? `hsl(51, 100%, ${50 + (currents[i].scale - 1) * 120}%)`
          : "var(--yellow)";
        el.style.textShadow = currents[i].scale > 1.05
          ? `0 0 ${20 * (currents[i].scale - 1) * 4}px rgba(255,215,0,0.7)`
          : "0 0 60px rgba(255,215,0,0.4)";
      });

      letterRafsRef.current = requestAnimationFrame(animate);
    };

    letterRafsRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(letterRafsRef.current);
  }, []);

  // ── Animated dots ─────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = starsCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W, H, raf;

    const sync = () => {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };
    sync();
    window.addEventListener("resize", sync);

    const DOT_COUNT = 60;
    const dots = Array.from({ length: DOT_COUNT }, () => ({
      x: Math.random() * (W || window.innerWidth),
      y: Math.random() * (H || window.innerHeight),
      r: 0.5 + Math.random() * 1.2,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      alpha: 0.15 + Math.random() * 0.45,
      alphaDir: Math.random() > 0.5 ? 1 : -1,
      alphaSpeed: 0.001 + Math.random() * 0.003,
      dirTimer: Math.random() * 300,
      dirInterval: 150 + Math.random() * 300,
    }));

    const loop = () => {
      if (!W || !H) sync();
      ctx.clearRect(0, 0, W, H);
      dots.forEach((d) => {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0) d.x = W;
        if (d.x > W) d.x = 0;
        if (d.y < 0) d.y = H;
        if (d.y > H) d.y = 0;
        d.alpha += d.alphaDir * d.alphaSpeed;
        if (d.alpha >= 0.6) { d.alpha = 0.6; d.alphaDir = -1; }
        if (d.alpha <= 0.08) { d.alpha = 0.08; d.alphaDir = 1; }
        d.dirTimer++;
        if (d.dirTimer >= d.dirInterval) {
          d.vx = (Math.random() - 0.5) * 0.15;
          d.vy = (Math.random() - 0.5) * 0.15;
          d.dirTimer = 0;
          d.dirInterval = 150 + Math.random() * 300;
        }
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${d.alpha})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(loop);
    };

    loop();
    return () => { window.removeEventListener("resize", sync); cancelAnimationFrame(raf); };
  }, []);

  // ── Animated blocks ───────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = blocksCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W, H, raf;

    const sync = () => {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };
    sync();
    window.addEventListener("resize", sync);

    const makeBlock = (forceX) => {
      const goRight = Math.random() > 0.5;
      const h = 4 + Math.random() * 18;
      const w = 50 + Math.random() * 160;
      const speed = 0.12 + Math.random() * 0.3;
      const y = Math.random() * (H || window.innerHeight);
      const x = forceX !== undefined
        ? forceX
        : goRight ? -(w + 10) : (W || window.innerWidth) + 10;
      const palette = [
        `rgba(255,215,0,`,
        `rgba(255,255,255,`,
        `rgba(160,160,160,`,
      ];
      const colorBase = palette[Math.floor(Math.random() * palette.length)];
      const alpha = 0.03 + Math.random() * 0.10;
      return { x, y, w, h, speed, goRight, colorBase, alpha };
    };

    const blocks = [];
    for (let i = 0; i < 18; i++) {
      blocks.push(makeBlock(Math.random() * (window.innerWidth || 1200)));
    }

    let spawnTimer = 0;

    const loop = () => {
      if (!W || !H) sync();
      ctx.clearRect(0, 0, W, H);

      spawnTimer++;
      if (spawnTimer >= 90) {
        spawnTimer = 0;
        if (blocks.length < 22) blocks.push(makeBlock());
      }

      for (let i = blocks.length - 1; i >= 0; i--) {
        const b = blocks[i];
        b.x += b.goRight ? b.speed : -b.speed;
        if (b.goRight && b.x > W + 10) { blocks.splice(i, 1); continue; }
        if (!b.goRight && b.x + b.w < -10) { blocks.splice(i, 1); continue; }

        ctx.fillStyle = `${b.colorBase}${b.alpha})`;
        ctx.fillRect(b.x, b.y, b.w, b.h);

        const edgeAlpha = Math.min(b.alpha * 2.5, 0.4);
        ctx.fillStyle = `${b.colorBase}${edgeAlpha})`;
        if (b.goRight) ctx.fillRect(b.x + b.w - 2, b.y, 2, b.h);
        else ctx.fillRect(b.x, b.y, 2, b.h);
      }

      raf = requestAnimationFrame(loop);
    };

    loop();
    return () => { window.removeEventListener("resize", sync); cancelAnimationFrame(raf); };
  }, []);

  // ── Mouse handlers ────────────────────────────────────────────────────────
  const onMouseMove = (e) => {
    const iron = ironRef.current;
    if (!iron) return;
    mouseRef.current = { x: e.clientX, y: e.clientY };
    const r = iron.getBoundingClientRect();
    trailRef.current.push({
      x: e.clientX - r.left,
      y: e.clientY - r.top,
      radius: 0,
      maxRadius: 110 + Math.random() * 60,
      alpha: 1,
    });
    if (trailRef.current.length > 100) trailRef.current.shift();
  };

  const onMouseLeave = () => {
    mouseRef.current = null;
    trailRef.current = [];
  };

  // ── Split "UI/UX DESIGNER" into individual letter spans ──────────────────
  const roleText = ["VIDEO", " ", "EDITOR"];
  const roleLetterSpans = roleText.map((word, wi) =>
    word === " "
      ? <span key={`space-${wi}`} style={{ display: "inline-block", width: "15px" }} />
      : (
        <span key={`word-${wi}`} style={{ display: "inline-flex" }}>
          {word.split("").map((char, ci) => (
            <span
              key={`${wi}-${ci}`}
              className="role-letter"
              style={{
                display: "inline-block",
                transition: "color 0.15s",
                willChange: "transform, color",
                transformOrigin: "center center",
              }}
            >
              {char}
            </span>
          ))}
        </span>
      )
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@500;600;700&family=Barlow:wght@300;400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --yellow: #FFD700;
          --ff-heading: 'Bebas Neue', sans-serif;
          --ff-body: 'Rajdhani', sans-serif;
          --ff-para: 'Barlow', sans-serif;
        }
        html, body { background: #000; color: #fff; overflow-x: hidden; scroll-behavior: smooth; }

        #home {
          position: relative;
          width: 100%; height: 100vh; min-height: 620px;
          overflow: hidden;
          display: flex; align-items: center;
          background: #000;
          cursor: crosshair;
        }

        .blocks-canvas {
          position: absolute; inset: 0; z-index: 1; pointer-events: none;
          width: 100%; height: 100%; display: block;
        }

        .stars-canvas {
          position: absolute; inset: 0; z-index: 2; pointer-events: none;
          width: 100%; height: 100%; display: block;
        }

        .meself-img {
          position: absolute;
          top: 60px; left: 50%; transform: translateX(-50%);
          width: 340px; height: 100%;
          object-fit: cover; object-position: top center;
          z-index: 3; display: block;
        }

        .ironman-img {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover; object-position: center top;
          z-index: 4; display: block;
        }

        .hero-overlay {
          position: absolute; inset: 0; z-index: 5; pointer-events: none;
          background:
            linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.45) 24%, rgba(0,0,0,0) 46%, rgba(0,0,0,0.45) 74%, rgba(0,0,0,0.85) 100%),
            linear-gradient(to top,   rgba(0,0,0,0.80) 0%, rgba(0,0,0,0) 28%),
            linear-gradient(to bottom,rgba(0,0,0,0.60) 0%, rgba(0,0,0,0) 14%);
        }

        .hero-row {
          position: relative; z-index: 6;
          width: 100%; display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 0 56px;
          pointer-events: none;
          margin-top: -80px;
        }
        .hero-row a, .hero-row button { pointer-events: all; }

        /* LEFT SIDE */
        .hero-left {
          flex: 0 0 auto;
          max-width: 360px;
          margin-bottom: -1px;
        }

        /* ── Greeting: top → down, opacity 0→1 ── */
        .hero-greeting {
          font-family: var(--ff-body);
          font-size: 34px;
          font-weight: 700;
          color: #fff;
          letter-spacing: 0.02em;
          margin-bottom: 2px;
          opacity: 0;
          transform: translateY(-30px);
          animation: slideDown 0.7s 0.2s cubic-bezier(0.22,1,0.36,1) forwards;
        }

        /* ── Name: top → down, opacity 0→1, slight delay after greeting ── */
        .hero-name {
          font-family: var(--ff-body);
          font-size: 34px;
          font-weight: 700;
          color: #fff;
          letter-spacing: 0.01em;
          margin-bottom: 8px;
          line-height: 1.3;
          opacity: 0;
          transform: translateY(-30px);
          animation: slideDown 0.7s 0.38s cubic-bezier(0.22,1,0.36,1) forwards;
        }

        /* ── Role: no entry animation on wrapper, letters handle interaction ── */
        .hero-role {
          font-family: var(--ff-heading);
          font-size: 80px;
          color: var(--yellow);
          letter-spacing: 0.03em;
          line-height: 1;
          margin-bottom: 36px;
          text-shadow: 0 0 60px rgba(255,215,0,0.4);
          display: flex;
          flex-direction: row;
          gap: 15px;
          opacity: 0;
          transform: translateY(-30px);
          animation: slideDown 0.7s 0.52s cubic-bezier(0.22,1,0.36,1) forwards;
        }

        /* ── "View my work" button: bottom → up, opacity 0→1 ── */
        .hero-btn {
          display: inline-block; padding: 13px 36px;
          border: 2px solid #fff; border-radius: 50px;
          color: #fff; background: transparent;
          font-family: var(--ff-body); font-size: 15px; font-weight: 600;
          letter-spacing: 0.05em; text-decoration: none; cursor: pointer;
          transition: background 0.28s ease, border-color 0.28s ease, color 0.28s ease, box-shadow 0.28s ease, transform 0.28s ease;
          opacity: 0;
          animation: slideUp 0.65s 0.75s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        .hero-btn:hover {
          background: var(--yellow); border-color: var(--yellow);
          color: #000; box-shadow: 0 6px 28px rgba(255,215,0,0.38);
          transform: translateY(-2px);
        }

        .hero-gap { flex: 1; }

        /* RIGHT SIDE */
        .hero-right {
          flex: 0 0 auto;
          max-width: 340px;
          margin-right: 100px;
          margin-bottom: -1px;
        }

        /* ── Desc: right → original X, opacity 0→1 ── */
        .hero-desc {
          font-family: var(--ff-para);
          font-size: 18px;
          line-height: 1.7;
          color: rgba(255,255,255,0.82);
          margin-bottom: 36px;
          font-weight: 300;
          opacity: 0;
          transform: translateX(60px);
          animation: slideLeft 0.75s 0.5s cubic-bezier(0.22,1,0.36,1) forwards;
        }

        /* ── "Get in touch" button: bottom → up, opacity 0→1 ── */
        .hero-btn-touch {
          display: inline-block; padding: 13px 36px;
          border: 2px solid #fff; border-radius: 50px;
          color: #fff; background: transparent;
          font-family: var(--ff-body); font-size: 15px; font-weight: 600;
          letter-spacing: 0.05em; text-decoration: none; cursor: pointer;
          transition: background 0.28s ease, border-color 0.28s ease, color 0.28s ease, box-shadow 0.28s ease, transform 0.28s ease;
          opacity: 0;
          animation: slideUp 0.65s 0.82s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        .hero-btn-touch:hover {
          background: var(--yellow); border-color: var(--yellow);
          color: #000; box-shadow: 0 6px 28px rgba(255,215,0,0.38);
          transform: translateY(-2px);
        }

        /* ── Keyframes ── */
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-30px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideLeft {
          from { opacity: 0; transform: translateX(60px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* role-letter interactive styles */
        .role-letter {
          display: inline-block;
          will-change: transform, color, text-shadow;
          cursor: crosshair;
        }

        @media (max-width: 1024px) {
          .hero-row { padding: 0 28px; margin-top: -60px; }
          .hero-left { max-width: 280px; }
          .hero-right { max-width: 280px; margin-right: 16px; }
          .hero-greeting, .hero-name { font-size: 28px; }
          .hero-role { font-size: 56px; }
          .hero-desc { font-size: 16px; }
          .meself-img { width: 260px; }
        }
        @media (max-width: 700px) {
          #home { align-items: flex-end; padding-bottom: 48px; }
          .hero-row { flex-direction: column; align-items: center; gap: 20px; padding: 0 24px; margin-top: 0; }
          .hero-left, .hero-right { max-width: 100%; text-align: center; margin-right: 0; margin-bottom: 0; }
          .hero-greeting, .hero-name { font-size: 24px; }
          .hero-role { font-size: 46px; }
          .hero-desc { font-size: 15px; }
          .hero-gap { display: none; }
          .meself-img { width: 200px; }
        }
      `}</style>

      <section
        id="home"
        ref={sectionRef}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      >
        <canvas ref={blocksCanvasRef} className="blocks-canvas" />
        <canvas ref={starsCanvasRef} className="stars-canvas" />
        <img src={meself} className="meself-img" alt="Rohit Kumar Gupta" />
        <img src={ironman} className="ironman-img" ref={ironRef} alt="" />
        <div className="hero-overlay" />

        <div className="hero-row">
          <div className="hero-left">
            <p className="hero-greeting">Hello!</p>
            <p className="hero-name">I'm ROHIT KUMAR GUPTA</p>
            <div className="hero-role" ref={roleRef}>
              {roleLetterSpans}
            </div>
            <a href="#projects" className="hero-btn">view my work</a>
          </div>
          <div className="hero-gap" />
          <div className="hero-right">
            <p className="hero-desc">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
              ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
              aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
              pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
              culpa qui officia deserunt mollit anim id est laborum.
            </p>
            <a href="#contact" className="hero-btn-touch">Get In Touch</a>
          </div>
        </div>
      </section>
    </>
  );
}