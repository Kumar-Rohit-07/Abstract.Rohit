import React, { useRef, useState, useCallback, useEffect } from "react";
import meself from "../assets/meself.png";
import ironmanImg from "../assets/ironman.png";

/**
 * About.jsx
 * -----------------------------------------------------------------------
 * - NORMAL STATE: only the portrait (meself) is visible. Iron Man is
 *   fully hidden (opacity 0) — not just clipped, actually invisible.
 * - HOVER: a circular "lens" hole is punched through the portrait at
 *   the cursor position (via CSS mask), and Iron Man fades in behind
 *   it — so Iron Man is ONLY ever visible inside that lens circle.
 * - Background: canvas-based dash-noise field — hundreds of tiny
 *   randomly-rotated red tick marks covering the whole section, subtly
 *   shimmering, that brighten and shift toward magenta/pink the closer
 *   they are to the cursor, and constantly wander in random directions
 *   — replaces the old static CSS grid.
 * - 2D white light overlays the canvas using screen blend mode, adding
 *   an extra soft highlight on top of the cursor-reactive dash glow.
 * - Heading ("ABOUT ME"): same Bebas Neue / yellow-glow treatment as
 *   the hero "UI/UX DESIGNER" text, with the same per-letter
 *   mouse-tracking tilt/scale/glow effect.
 * -----------------------------------------------------------------------
 */

// ---- lens settings ----
const LENS_RADIUS = 20;
const LENS_DISPERSION = 0;
const LENS_GLOW = 0;
const TRACK_MOUSE = 59;
// ------------------------

// ---- Iron Man image placement ----
const IRONMAN_OBJECT_POSITION = "center 22%";
const IRONMAN_SCALE = 1.25;
// -----------------------------------

// ---- dash-noise background settings ----
const DASH_DENSITY = 500;          // px^2 per dash (lower = denser field)
const DASH_MIN_LEN = 3;             // px
const DASH_MAX_LEN = 9;             // px
const DASH_BASE_COLOR = [180, 0, 30];   // r,g,b — resting dash color (red)
const DASH_HOT_COLOR = [255, 0, 255];   // r,g,b — color near the cursor (magenta/pink)
const DASH_HOT_RADIUS = 100;        // px radius of cursor influence
const DASH_ALPHA_MIN = 0.03;        // resting minimum alpha
const DASH_ALPHA_MAX = 0.15;        // resting maximum alpha
const DASH_FLICKER_SPEED = 1.1;     // speed of the subtle shimmer animation
const DASH_MAX_SPEED = 1.0;         // top speed of random wander (px/frame)
const DASH_MIN_SPEED = 0.2;         // floor speed — guarantees dashes never stall
const DASH_JITTER = 0.08;           // how much random acceleration is applied each frame (higher = more erratic)
const DASH_GLOW_BLUR = 2;           // base glow, increases near cursor
// ------------------------------------------------

// ---- heading letter-tracking settings (matches hero "UI/UX DESIGNER") ----
const HEADING_LERP = 0.08;
const HEADING_MAX_ROTATE = 18;
const HEADING_MAX_SCALE = 1.22;
const HEADING_INFLUENCE_RADIUS = 140;
// ---------------------------------------------------------------------

export default function About() {
  const frameRef = useRef(null);
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const canvasRafId = useRef(null);
  const [hover, setHover] = useState(false);

  const target = useRef({ x: 50, y: 35 });
  const current = useRef({ x: 50, y: 35 });
  const rafId = useRef(null);
  const [pos, setPos] = useState({ x: 50, y: 35 });
  const mouse = useRef({ x: 0, y: 0 });

  // viewport-space mouse position (for the heading letter effect)
  const rawMouseRef = useRef(null);
  const headingRef = useRef(null);
  const headingRafRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const el = frameRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    target.current = {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
  }, []);


  useEffect(() => {
    const ease = 1 - Math.min(Math.max(TRACK_MOUSE / 100, 0), 0.95);
    const tick = () => {
      current.current.x += (target.current.x - current.current.x) * ease;
      current.current.y += (target.current.y - current.current.y) * ease;
      setPos({ x: current.current.x, y: current.current.y });
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId.current);
  }, []);


  // ---------------- dash-noise canvas ----------------
  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    const ctx = canvas.getContext("2d");

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const makeDashes = () => {
      const area = width * height;
      const count = Math.max(80, Math.floor(area / DASH_DENSITY));
      const arr = [];
      for (let i = 0; i < count; i++) {
        const heading = Math.random() * Math.PI * 2;
        const speed = DASH_MIN_SPEED + Math.random() * (DASH_MAX_SPEED - DASH_MIN_SPEED);
        arr.push({
          x: Math.random() * width,
          y: Math.random() * height,
          angle: Math.random() * Math.PI * 2,
          len: DASH_MIN_LEN + Math.random() * (DASH_MAX_LEN - DASH_MIN_LEN),
          alphaBase: DASH_ALPHA_MIN + Math.random() * (DASH_ALPHA_MAX - DASH_ALPHA_MIN),
          phase: Math.random() * Math.PI * 2,
          vx: Math.cos(heading) * speed,
          vy: Math.sin(heading) * speed,
        });
      }
      particlesRef.current = arr;
    };

    const resize = () => {
      const rect = section.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      makeDashes();
    };

    const step = () => {
      ctx.clearRect(0, 0, width, height);
      const dashes = particlesRef.current;
      const t = performance.now() / 1000;

      // cursor position in pixels (from the section-level mouse-light tracker)
      const cx = mouse.current.x;
      const cy = mouse.current.y;

      for (const d of dashes) {
        // ---- random-axis wander (Brownian-style, with a speed floor so it never stalls) ----
        d.vx += (Math.random() - 0.5) * DASH_JITTER;
        d.vy += (Math.random() - 0.5) * DASH_JITTER;

        let speed = Math.sqrt(d.vx * d.vx + d.vy * d.vy);

        if (speed > DASH_MAX_SPEED) {
          const scale = DASH_MAX_SPEED / speed;
          d.vx *= scale;
          d.vy *= scale;
          speed = DASH_MAX_SPEED;
        } else if (speed < DASH_MIN_SPEED) {
          // if it ever slows too much (or hits ~0), reboot it with a fresh random heading
          const headingAngle = speed < 0.0001 ? Math.random() * Math.PI * 2 : Math.atan2(d.vy, d.vx);
          d.vx = Math.cos(headingAngle) * DASH_MIN_SPEED;
          d.vy = Math.sin(headingAngle) * DASH_MIN_SPEED;
        }

        d.x += d.vx;
        d.y += d.vy;

        if (d.x < -10) d.x = width + 10;
        if (d.x > width + 10) d.x = -10;
        if (d.y < -10) d.y = height + 10;
        if (d.y > height + 10) d.y = -10;

        const dx = d.x - cx;
        const dy = d.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Mouse influence (0 → 1)
        const influence = Math.max(0, 1 - dist / DASH_HOT_RADIUS);

        // Interpolate color
        const r =
          DASH_BASE_COLOR[0] +
          (DASH_HOT_COLOR[0] - DASH_BASE_COLOR[0]) * influence;

        const g =
          DASH_BASE_COLOR[1] +
          (DASH_HOT_COLOR[1] - DASH_BASE_COLOR[1]) * influence;

        const b =
          DASH_BASE_COLOR[2] +
          (DASH_HOT_COLOR[2] - DASH_BASE_COLOR[2]) * influence;

        // Flicker
        const flicker =
          (Math.sin(t * DASH_FLICKER_SPEED + d.phase) + 1) * 0.04;

        // Alpha increases near mouse
        const alpha = Math.min(
          1,
          d.alphaBase + influence * 0.9 + flicker
        );

        const halfLen = d.len / 2;
        const cosA = Math.cos(d.angle);
        const sinA = Math.sin(d.angle);

        ctx.save();

        // Strong glow near cursor
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${0.3 + influence})`;
        ctx.shadowBlur = 2 + influence * 22;

        // Brighten particles near mouse
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;

        // Make them slightly thicker near cursor
        ctx.lineWidth = 0.8 + influence * 1.5;

        ctx.beginPath();
        ctx.moveTo(
          d.x - cosA * halfLen,
          d.y - sinA * halfLen
        );
        ctx.lineTo(
          d.x + cosA * halfLen,
          d.y + sinA * halfLen
        );
        ctx.stroke();

        ctx.restore();
      }

      canvasRafId.current = requestAnimationFrame(step);
    };

    resize();
    canvasRafId.current = requestAnimationFrame(step);

    const ro = new ResizeObserver(resize);
    ro.observe(section);

    return () => {
      cancelAnimationFrame(canvasRafId.current);
      ro.disconnect();
    };
  }, []);
  // -----------------------------------------------------------

  // ---------------- ABOUT ME letter mouse tracking (mirrors hero role effect) ----------------
  useEffect(() => {
    const headingEl = headingRef.current;
    if (!headingEl) return;

    const letters = headingEl.querySelectorAll(".about-heading-letter");
    const targets = Array.from(letters).map(() => ({ rx: 0, ry: 0, scale: 1 }));
    const currents = Array.from(letters).map(() => ({ rx: 0, ry: 0, scale: 1 }));

    const lerp = (a, b, t) => a + (b - a) * t;

    const animate = () => {
      const m = rawMouseRef.current;
      letters.forEach((el, i) => {
        if (m) {
          const rect = el.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dx = m.x - cx;
          const dy = m.y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const influence = Math.max(0, 1 - dist / HEADING_INFLUENCE_RADIUS);

          targets[i].rx = -dy * influence * (HEADING_MAX_ROTATE / 80);
          targets[i].ry = dx * influence * (HEADING_MAX_ROTATE / 80);
          targets[i].scale = 1 + influence * (HEADING_MAX_SCALE - 1);
        } else {
          targets[i].rx = 0;
          targets[i].ry = 0;
          targets[i].scale = 1;
        }

        currents[i].rx = lerp(currents[i].rx, targets[i].rx, HEADING_LERP);
        currents[i].ry = lerp(currents[i].ry, targets[i].ry, HEADING_LERP);
        currents[i].scale = lerp(currents[i].scale, targets[i].scale, HEADING_LERP);

        el.style.transform = `perspective(400px) rotateX(${currents[i].rx}deg) rotateY(${currents[i].ry}deg) scale(${currents[i].scale})`;
        el.style.color = currents[i].scale > 1.05
          ? `hsl(51, 100%, ${50 + (currents[i].scale - 1) * 120}%)`
          : "#FFD700";
        el.style.textShadow = currents[i].scale > 1.05
          ? `0 0 ${20 * (currents[i].scale - 1) * 4}px rgba(255,215,0,0.7)`
          : "0 0 60px rgba(255,215,0,0.4)";
      });

      headingRafRef.current = requestAnimationFrame(animate);
    };

    headingRafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(headingRafRef.current);
  }, []);
  // -----------------------------------------------------------

  // split "ABOUT ME" into individual letter spans, same pattern as the hero role text
  const headingText = ["ABOUT", " ", "ME"];
  const headingLetterSpans = headingText.map((word, wi) =>
    word === " "
      ? <span key={`space-${wi}`} style={{ display: "inline-block", width: "0.28em" }} />
      : (
        <span key={`word-${wi}`} style={{ display: "inline-flex" }}>
          {word.split("").map((char, ci) => (
            <span
              key={`${wi}-${ci}`}
              className="about-heading-letter"
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

  return (
    <section
      className="about-wrap"
      id="about"
      ref={sectionRef}
      onMouseMove={(e) => {
        const rect = sectionRef.current.getBoundingClientRect();
        mouse.current.x = e.clientX - rect.left;
        mouse.current.y = e.clientY - rect.top;
        rawMouseRef.current = { x: e.clientX, y: e.clientY };
      }}
      onMouseLeave={() => {
        rawMouseRef.current = null;
      }}
    >
      <canvas ref={canvasRef} className="particle-canvas" />

      {/* inert while LENS_DISPERSION is 0 */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id="lens-dispersion">
          <feColorMatrix
            type="matrix"
            values={`1 0 0 0 ${LENS_DISPERSION * 0.01}
                     0 1 0 0 0
                     0 0 1 0 ${-LENS_DISPERSION * 0.01}
                     0 0 0 1 0`}
          />
        </filter>
      </svg>

      <div className="about-inner">
        <div
          className={`photo-frame ${hover ? "is-hovering" : ""}`}
          ref={frameRef}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onMouseMove={handleMouseMove}
          style={{
            "--x": `${pos.x}%`,
            "--y": `${pos.y}%`,
            "--lens-radius": `${LENS_RADIUS}%`,
            "--lens-glow": `${LENS_GLOW}px`,
          }}
        >
          <img src={ironmanImg} alt="" className="photo-back" aria-hidden="true" />
          <img src={meself} alt="Portrait" className="photo-front" />
        </div>

        <div className="copy-block">
          <h2 className="heading" ref={headingRef}>
            {headingLetterSpans}
          </h2>
          <p className="body-text">
            I am a dedicated Video Editor with a strong passion for
            crafting intuitive and engaging digital experiences. With a
            deep understanding of user behavior and design principles, I
            focus on creating interfaces that are both visually appealing
            and highly functional. My approach combines creativity,
            research, and problem-solving to deliver seamless user
            journeys across web and mobile platforms. I enjoy
            transforming complex ideas into simple, user-friendly
            solutions that enhance usability and satisfaction.
            Continuously learning and adapting to new trends, I strive to
            stay ahead in the ever-evolving design landscape. My goal is
            to create meaningful experiences that not only meet user
            needs but also drive business growth and create lasting
            impressions.
          </p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Poppins:wght@400;500&display=swap');

        .about-wrap {
          position: relative;
          overflow: hidden;
          background: #0a0a0a;
          padding: 90px 8vw;
          min-height: 100vh;
          display: flex;
          align-items: center;
        }

        /* ---------- particle network canvas ---------- */
        .particle-canvas {
          position: absolute;
          inset: 0;
          z-index: 0;
          width: 100%;
          height: 100%;
          display: block;
          pointer-events: none;
        }

        /* ---------- mouse-tracked white light, overlays canvas via screen blend ---------- */
  
        .about-inner {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: minmax(260px, 420px) 1fr;
          gap: 6vw;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
        }
        @media (max-width: 860px) {
          .about-inner { grid-template-columns: 1fr; }
        }

        /* ---------- photo frame: circular, red border ---------- */
        .photo-frame {
          position: relative;
          aspect-ratio: 1 / 1;
          border-radius: 50%;
          overflow: hidden;
          background: transparent;
          border: 3px solid red;
          cursor: pointer;
          isolation: isolate;
        }

        .photo-back,
        .photo-front {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .photo-back {
          object-position: ${IRONMAN_OBJECT_POSITION};
          transform: scale(${IRONMAN_SCALE});
          filter: saturate(1.15) contrast(1.05);
          opacity: 0;
          transition: opacity 0.25s ease;
        }
        .photo-frame.is-hovering .photo-back {
          opacity: 1;
        }

        .photo-front {
          object-position: top center;
          filter: grayscale(1) contrast(1.05) drop-shadow(0 0 var(--lens-glow, 0px) rgba(255,255,255,0.6));
          background-color: #0a0a0a;
        }
        .photo-frame.is-hovering .photo-front {
          -webkit-mask-image: radial-gradient(
            circle at var(--x) var(--y),
            transparent 0,
            transparent var(--lens-radius),
            white calc(var(--lens-radius) + 1px),
            white 100%
          );
          mask-image: radial-gradient(
            circle at var(--x) var(--y),
            transparent 0,
            transparent var(--lens-radius),
            white calc(var(--lens-radius) + 1px),
            white 100%
          );
        }

        /* ---------- copy ---------- */
        .copy-block { max-width: 620px; }
        .heading {
          font-family: 'Bebas Neue', sans-serif;
          color: #FFD700;
          font-size: clamp(2.6rem, 5vw, 4.2rem);
          letter-spacing: 0.03em;
          line-height: 1;
          margin: 0 0 28px 0;
          text-shadow: 0 0 60px rgba(255,215,0,0.4);
          display: flex;
          flex-direction: row;
        }
        .about-heading-letter {
          display: inline-block;
          will-change: transform, color, text-shadow;
          cursor: crosshair;
        }
        .body-text {
          font-family: 'Poppins', sans-serif;
          color: #d9d9d9;
          font-size: 1.05rem;
          line-height: 1.85;
          font-weight: 400;
        }
      `}</style>
    </section>
  );
}