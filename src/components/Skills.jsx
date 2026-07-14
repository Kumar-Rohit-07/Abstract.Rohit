import React, { useEffect, useRef, useState, useCallback } from "react";

/* ---------------------------------------------------------------
   Skills.jsx — Space Shooter Edition (Realistic 3D-shaded build)
   - Heading "SKILLS" top-center: same font (Bebas Neue) + same
     per-letter mouse-tracking tilt/scale/glow effect as About.jsx
     / Home.jsx hero text.
   - Full space-themed canvas game underneath:
       - deep starfield (3 parallax layers) + a diagonal Milky-Way-style
         dust band (dense star cluster, dark dust-lane patches, purple/
         blue/pink nebula glows at each end) + occasional shooting stars
       - a detailed 3D-shaded fighter ship that follows the mouse
       - click (or press SPACE) to fire lasers
       - meteoroids are round brown 3D spheres (directional lighting,
         terminator shading, stippled surface grain, rim-lit craters)
         drifting toward the ship, each carrying a skill name; shoot
         one to destroy it
       - once every meteoroid is destroyed: "MISSION COMPLETE"
         banner flashes, then "UI/UX DESIGNER" fades in center
         screen with the same letter-tracking effect as the
         heading.
--------------------------------------------------------------- */

const SKILLS = [
  "Figma",
  "React",
  "MongoDB",
  "Git",
  "HTML",
  "JavaScript",
  "Tailwind CSS",
  "Node.js",
  "Express",
  "CSS3",
  "Python",
  "Photoshop",
  "Premiere Pro",
  "Blender",
];

// ---- letter-tracking effect settings (shared by heading + reveal text) ----
const LETTER_LERP = 0.08;
const LETTER_MAX_ROTATE = 18;
const LETTER_MAX_SCALE = 1.22;
const LETTER_INFLUENCE_RADIUS = 140;
// ----------------------------------------------------------------------

// ---- ship settings ----
const SHIP_SIZE = 32;        // half-width of the ship, px
const SHIP_EASE = 0.14;      // how quickly the ship catches up to the mouse
const SHIP_BOTTOM_MARGIN = 96; // px from bottom of stage
// -----------------------

// ---- bullet settings ----
const BULLET_SPEED = 10;     // px/frame
const BULLET_RADIUS = 3.5;
const FIRE_COOLDOWN_MS = 180; // minimum time between shots
// --------------------------

// ---- meteor settings ----
const METEOR_RADIUS_MIN = 46;
const METEOR_RADIUS_MAX = 62;
const METEOR_SPEED_MIN = 0.5;
const METEOR_SPEED_MAX = 1.2;
const METEOR_DRIFT_MAX = 0.35;
const LIGHT_ANGLE = -2.35; // radians, direction the "sun" shines from (upper-left-ish)
// --------------------------

// ---- misc ----
const PARTICLE_COUNT = 16;
const PARTICLE_LIFE = 42; // frames
const STAR_LAYER_1_COUNT = 110; // far, tiny, slow
const STAR_LAYER_2_COUNT = 60;  // mid
const STAR_LAYER_3_COUNT = 24;  // near, bigger, faster (parallax)
const COMPLETE_BANNER_MS = 2200;
// --------------

function useLetterTracking(containerRef, selector, mouseRef, deps = []) {
  const rafRef = useRef(null);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const letters = container.querySelectorAll(selector);
    const targets = Array.from(letters).map(() => ({ rx: 0, ry: 0, scale: 1 }));
    const currents = Array.from(letters).map(() => ({ rx: 0, ry: 0, scale: 1 }));
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
          const influence = Math.max(0, 1 - dist / LETTER_INFLUENCE_RADIUS);

          targets[i].rx = -dy * influence * (LETTER_MAX_ROTATE / 80);
          targets[i].ry = dx * influence * (LETTER_MAX_ROTATE / 80);
          targets[i].scale = 1 + influence * (LETTER_MAX_SCALE - 1);
        } else {
          targets[i].rx = 0;
          targets[i].ry = 0;
          targets[i].scale = 1;
        }

        currents[i].rx = lerp(currents[i].rx, targets[i].rx, LETTER_LERP);
        currents[i].ry = lerp(currents[i].ry, targets[i].ry, LETTER_LERP);
        currents[i].scale = lerp(currents[i].scale, targets[i].scale, LETTER_LERP);

        el.style.transform = `perspective(400px) rotateX(${currents[i].rx}deg) rotateY(${currents[i].ry}deg) scale(${currents[i].scale})`;
        el.style.color = currents[i].scale > 1.05
          ? `hsl(51, 100%, ${50 + (currents[i].scale - 1) * 120}%)`
          : "#FFD700";
        el.style.textShadow = currents[i].scale > 1.05
          ? `0 0 ${20 * (currents[i].scale - 1) * 4}px rgba(255,215,0,0.7)`
          : "0 0 60px rgba(255,215,0,0.4)";
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, selector, mouseRef, ...deps]);
}

function LetterSpans({ words, className }) {
  return words.map((word, wi) =>
    word === " " ? (
      <span key={`space-${wi}`} style={{ display: "inline-block", width: "0.28em" }} />
    ) : (
      <span key={`word-${wi}`} style={{ display: "inline-flex" }}>
        {word.split("").map((char, ci) => (
          <span
            key={`${wi}-${ci}`}
            className={className}
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
}

function wrapSkillText(text, maxCharsPerLine = 10) {
  const words = text.split(" ");
  if (words.length === 1) return [text];
  const lines = [];
  let current = "";
  words.forEach((w) => {
    const test = current ? `${current} ${w}` : w;
    if (test.length > maxCharsPerLine && current) {
      lines.push(current);
      current = w;
    } else {
      current = test;
    }
  });
  if (current) lines.push(current);
  return lines;
}

export default function Skills() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const headingRef = useRef(null);
  const revealRef = useRef(null);

  const mouseRef = useRef(null);       // viewport-space, for letter tracking
  const canvasMouseXRef = useRef(null); // canvas-space x, for ship steering
  const rafRef = useRef(null);
  const lastShotRef = useRef(0);
  const completedTriggeredRef = useRef(false);

  const shipRef = useRef({ x: 0, y: 0 });
  const bulletsRef = useRef([]);
  const meteorsRef = useRef([]);
  const particlesRef = useRef([]);
  const starsRef = useRef({ layer1: [], layer2: [], layer3: [] });
  const galaxyRef = useRef(null);
  const shootingStarRef = useRef(null);
  const nextShootingStarRef = useRef(0);

  const [totalDestroyed, setTotalDestroyed] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showReveal, setShowReveal] = useState(false);

  useLetterTracking(headingRef, ".skills-heading-letter", mouseRef);
  useLetterTracking(revealRef, ".reveal-letter", mouseRef, [showReveal]);

  const rand = (min, max) => min + Math.random() * (max - min);

  const makeMeteor = useCallback((skill, width) => {
    const radius = rand(METEOR_RADIUS_MIN, METEOR_RADIUS_MAX);

    // craters: concave pockmarks, each shaded with a shadow pit + a bright
    // rim on the light-facing edge to fake real 3D depth on a round body
    const craters = Array.from({ length: (rand(5, 9)) | 0 }, () => ({
      ox: rand(-radius * 0.62, radius * 0.62),
      oy: rand(-radius * 0.62, radius * 0.62),
      r: rand(radius * 0.08, radius * 0.22),
    }));

    // fine stippled grain scattered across the whole disc for a dusty,
    // weathered rock texture (uniform disk distribution)
    const speckles = Array.from({ length: 80 }, () => {
      const a = rand(0, Math.PI * 2);
      const r = Math.sqrt(Math.random()) * radius * 0.94;
      return {
        ox: Math.cos(a) * r,
        oy: Math.sin(a) * r,
        r: rand(0.6, 2.4),
        shade: rand(-1, 1), // <0 darker fleck, >0 lighter fleck
      };
    });

    return {
      skill,
      radius,
      x: rand(radius, Math.max(radius + 1, width - radius)),
      y: -radius - rand(0, 500),
      vy: rand(METEOR_SPEED_MIN, METEOR_SPEED_MAX),
      vx: rand(-METEOR_DRIFT_MAX, METEOR_DRIFT_MAX),
      rotation: rand(0, Math.PI * 2),
      rotSpeed: rand(-0.01, 0.01),
      craters,
      speckles,
      destroyed: false,
    };
  }, []);

  const initGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = canvas.width / (window.devicePixelRatio || 1);
    meteorsRef.current = SKILLS.map((skill) => makeMeteor(skill, width));
    bulletsRef.current = [];
    particlesRef.current = [];
    completedTriggeredRef.current = false;
    setTotalDestroyed(0);
    setGameCompleted(false);
    setShowReveal(false);
  }, [makeMeteor]);

  const spawnParticles = (x, y) => {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = rand(0, Math.PI * 2);
      const speed = rand(1, 4.5);
      particlesRef.current.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: PARTICLE_LIFE,
        maxLife: PARTICLE_LIFE,
        size: rand(2, 4.5),
        hue: rand(20, 45), // orange-yellow range
      });
    }
  };

  const fireBullet = useCallback(() => {
    const now = performance.now();
    if (now - lastShotRef.current < FIRE_COOLDOWN_MS) return;
    lastShotRef.current = now;
    const ship = shipRef.current;
    bulletsRef.current.push({
      x: ship.x,
      y: ship.y - SHIP_SIZE,
      vy: -BULLET_SPEED,
    });
  }, []);

  // ---------------- main game canvas loop ----------------
  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    const ctx = canvas.getContext("2d");

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const makeStars = () => {
      starsRef.current.layer1 = Array.from({ length: STAR_LAYER_1_COUNT }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: rand(0.3, 0.9),
        alpha: rand(0.2, 0.55),
        speed: rand(0.04, 0.1),
        phase: rand(0, Math.PI * 2),
      }));
      starsRef.current.layer2 = Array.from({ length: STAR_LAYER_2_COUNT }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: rand(0.9, 1.7),
        alpha: rand(0.4, 0.8),
        speed: rand(0.15, 0.32),
        phase: rand(0, Math.PI * 2),
      }));
      starsRef.current.layer3 = Array.from({ length: STAR_LAYER_3_COUNT }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: rand(1.4, 2.6),
        alpha: rand(0.55, 1),
        speed: rand(0.35, 0.6),
        phase: rand(0, Math.PI * 2),
        hue: rand(190, 260),
      }));

      // ---- Milky-Way style dust band running diagonally across the scene ----
      // Built in a local (band) coordinate space: lx runs along the band's
      // length, ly is the perpendicular offset from its centerline. We
      // rotate/translate into this space once per frame when drawing.
      const bandLength = Math.max(width, height) * 1.7;
      const bandThickness = Math.min(width, height) * 0.62;

      // dark dust-lane patches: irregular dark blobs clustered near the
      // centerline, breaking up the glow the way real interstellar dust does
      const dustPatches = Array.from({ length: 22 }, () => {
        const lx = rand(-bandLength * 0.46, bandLength * 0.46);
        const ly = ((Math.random() + Math.random() + Math.random()) / 3 - 0.5) * bandThickness * 0.7;
        return { lx, ly, r: rand(bandThickness * 0.08, bandThickness * 0.22), alpha: rand(0.35, 0.7) };
      });

      // dense star cluster concentrated along the band (triangular
      // distribution around the centerline so it thins out toward the edges)
      const bandStars = Array.from({ length: 420 }, () => {
        const lx = rand(-bandLength * 0.5, bandLength * 0.5);
        const ly = ((Math.random() + Math.random()) / 2 - 0.5) * bandThickness;
        const warm = Math.random() < 0.12;
        return {
          lx, ly,
          r: rand(0.4, warm ? 1.8 : 1.3),
          alpha: rand(0.3, 0.95),
          phase: rand(0, Math.PI * 2),
          hue: warm ? rand(25, 45) : rand(190, 220),
          sat: warm ? 70 : 25,
        };
      });

      // soft colored nebula glows near each end of the band, echoing the
      // purple / blue-pink glow seen where dust catches nearby starlight
      const glows = [
        { lx: -bandLength * 0.34, ly: -bandThickness * 0.06, r: bandThickness * 0.9, hue: "150,90,220", alpha: 0.16 },
        { lx: -bandLength * 0.30, ly: bandThickness * 0.1, r: bandThickness * 0.5, hue: "210,110,230", alpha: 0.10 },
        { lx: bandLength * 0.36, ly: bandThickness * 0.02, r: bandThickness * 0.85, hue: "70,140,230", alpha: 0.16 },
        { lx: bandLength * 0.32, ly: -bandThickness * 0.08, r: bandThickness * 0.45, hue: "230,120,170", alpha: 0.12 },
      ];

      galaxyRef.current = {
        cx: width * 0.48,
        cy: height * 0.5,
        angle: 0.52, // ~30°, diagonal like the Milky Way band in the reference photo
        length: bandLength,
        thickness: bandThickness,
        dustPatches,
        bandStars,
        glows,
      };
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
      makeStars();

      shipRef.current.x = width / 2;
      shipRef.current.y = height - SHIP_BOTTOM_MARGIN;

      if (meteorsRef.current.length === 0) {
        meteorsRef.current = SKILLS.map((skill) => makeMeteor(skill, width));
      }
    };

    // ---------------- realistic 3D-shaded fighter ship ----------------
    const drawShip = (x, y, t) => {
      ctx.save();
      ctx.translate(x, y);

      const s = SHIP_SIZE;

      // subtle bank/roll based on horizontal velocity for a "flying" feel
      const targetX = canvasMouseXRef.current !== null ? canvasMouseXRef.current : x;
      const roll = Math.max(-0.22, Math.min(0.22, (targetX - x) * 0.01));

      // twin engine exhaust plumes (flicker)
      const flameLen = 16 + Math.sin(t * 22) * 6 + Math.random() * 5;
      [-1, 1].forEach((side) => {
        const ex = side * s * 0.34;
        const ey = s * 0.62;
        const flameGrad = ctx.createLinearGradient(ex, ey, ex, ey + flameLen);
        flameGrad.addColorStop(0, "rgba(190,230,255,0.95)");
        flameGrad.addColorStop(0.35, "rgba(120,190,255,0.75)");
        flameGrad.addColorStop(0.7, "rgba(80,120,255,0.4)");
        flameGrad.addColorStop(1, "rgba(60,80,255,0)");
        ctx.beginPath();
        ctx.moveTo(ex - 4.2, ey);
        ctx.lineTo(ex, ey + flameLen);
        ctx.lineTo(ex + 4.2, ey);
        ctx.closePath();
        ctx.fillStyle = flameGrad;
        ctx.fill();
      });

      ctx.save();
      ctx.rotate(roll);

      // ---- swept wings (drawn first, sit behind the fuselage) ----
      [-1, 1].forEach((side) => {
        ctx.save();
        ctx.scale(side, 1);
        ctx.beginPath();
        ctx.moveTo(s * 0.12, -s * 0.02);
        ctx.lineTo(s * 0.95, s * 0.62);
        ctx.lineTo(s * 0.78, s * 0.72);
        ctx.lineTo(s * 0.16, s * 0.32);
        ctx.closePath();
        const wingGrad = ctx.createLinearGradient(0, -s * 0.1, s * 0.9, s * 0.7);
        wingGrad.addColorStop(0, "#d7e6f2");
        wingGrad.addColorStop(0.5, "#8fa9c2");
        wingGrad.addColorStop(1, "#3d4f63");
        ctx.fillStyle = wingGrad;
        ctx.fill();
        ctx.strokeStyle = "rgba(10,20,30,0.55)";
        ctx.lineWidth = 1;
        ctx.stroke();
        // wingtip light
        ctx.beginPath();
        ctx.arc(s * 0.94, s * 0.60, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = side > 0 ? "#5ef0a0" : "#ff5e5e";
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
      });

      // ---- engine nacelles ----
      [-1, 1].forEach((side) => {
        ctx.save();
        ctx.translate(side * s * 0.34, s * 0.36);
        const nacelleGrad = ctx.createLinearGradient(-6, -14, 6, 20);
        nacelleGrad.addColorStop(0, "#c9d6e0");
        nacelleGrad.addColorStop(0.5, "#7c8fa0");
        nacelleGrad.addColorStop(1, "#2c3a47");
        ctx.beginPath();
        ctx.ellipse(0, 4, 6.2, 16, 0, 0, Math.PI * 2);
        ctx.fillStyle = nacelleGrad;
        ctx.fill();
        ctx.strokeStyle = "rgba(10,20,30,0.5)";
        ctx.lineWidth = 0.8;
        ctx.stroke();
        // engine glow ring
        ctx.beginPath();
        ctx.ellipse(0, 14, 4.6, 3, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(160,220,255,0.9)";
        ctx.shadowColor = "#9fe0ff";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
      });

      // ---- main fuselage (nose to tail), lit from upper-left for volume ----
      ctx.beginPath();
      ctx.moveTo(0, -s * 1.05); // nose tip
      ctx.bezierCurveTo(s * 0.22, -s * 0.7, s * 0.30, -s * 0.1, s * 0.24, s * 0.4);
      ctx.lineTo(s * 0.14, s * 0.66); // tail right
      ctx.lineTo(-s * 0.14, s * 0.66); // tail left
      ctx.lineTo(-s * 0.24, s * 0.4);
      ctx.bezierCurveTo(-s * 0.30, -s * 0.1, -s * 0.22, -s * 0.7, 0, -s * 1.05);
      ctx.closePath();

      const hullGrad = ctx.createLinearGradient(-s * 0.3, -s, s * 0.3, s * 0.6);
      hullGrad.addColorStop(0, "#f3fbff");
      hullGrad.addColorStop(0.28, "#bcd9ec");
      hullGrad.addColorStop(0.6, "#6f93ad");
      hullGrad.addColorStop(1, "#354a5c");
      ctx.fillStyle = hullGrad;
      ctx.shadowColor = "rgba(120,200,255,0.55)";
      ctx.shadowBlur = 16;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(10,25,35,0.6)";
      ctx.lineWidth = 1.1;
      ctx.stroke();

      // dorsal spine / panel line for extra dimensionality
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.9);
      ctx.lineTo(0, s * 0.55);
      ctx.strokeStyle = "rgba(20,35,45,0.35)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // small panel seams
      [0.15, -0.15].forEach((off) => {
        ctx.beginPath();
        ctx.moveTo(off * s, -s * 0.35);
        ctx.lineTo(off * s * 1.3, s * 0.35);
        ctx.strokeStyle = "rgba(20,35,45,0.22)";
        ctx.lineWidth = 0.7;
        ctx.stroke();
      });

      // ---- cockpit canopy (glassy dome with reflection) ----
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.32, s * 0.155, s * 0.32, 0, 0, Math.PI * 2);
      const cockGrad = ctx.createRadialGradient(-s * 0.05, -s * 0.5, 1, 0, -s * 0.32, s * 0.34);
      cockGrad.addColorStop(0, "#e8fbff");
      cockGrad.addColorStop(0.35, "#7fd8f5");
      cockGrad.addColorStop(0.75, "#1c7fac");
      cockGrad.addColorStop(1, "#0a3a52");
      ctx.fillStyle = cockGrad;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 0.8;
      ctx.stroke();
      // glass highlight streak
      ctx.beginPath();
      ctx.ellipse(-s * 0.045, -s * 0.5, s * 0.045, s * 0.12, -0.3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.65)";
      ctx.fill();
      ctx.restore();

      // nose light
      ctx.beginPath();
      ctx.arc(0, -s * 1.0, 1.6, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "#bfe9ff";
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.restore(); // end roll
      ctx.restore();
    };

    // ---------------- simplified skill icon badge (shown inside each meteor) ----------------
    const drawSkillIcon = (skill, cx, cy, r) => {
      ctx.save();
      ctx.translate(cx, cy);

      const badge = (color) => {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 5;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(255,255,255,0.35)";
        ctx.lineWidth = 1;
        ctx.stroke();
      };

      const monogram = (text, color = "#ffffff", weight = 800, sizeMul = 0.8) => {
        ctx.fillStyle = color;
        ctx.font = `${weight} ${Math.max(9, Math.round(r * sizeMul))}px Rajdhani, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, 0, r * 0.04);
      };

      switch (skill) {
        case "Figma": {
          badge("#1e1e1e");
          const s = r * 0.34;
          ctx.fillStyle = "#0ACF83"; ctx.beginPath(); ctx.arc(0, r * 0.35, s, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#A259FF"; ctx.beginPath(); ctx.arc(s * 0.9, -r * 0.05, s, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#F24E1E"; ctx.beginPath(); ctx.arc(-s * 0.9, -r * 0.05, s, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#FF7262"; ctx.beginPath(); ctx.arc(0, -r * 0.45, s, 0, Math.PI * 2); ctx.fill();
          break;
        }
        case "React": {
          badge("#0b1320");
          ctx.strokeStyle = "#61DAFB";
          ctx.lineWidth = Math.max(1.2, r * 0.09);
          for (let i = 0; i < 3; i++) {
            ctx.save();
            ctx.rotate((Math.PI / 3) * i);
            ctx.beginPath();
            ctx.ellipse(0, 0, r * 0.78, r * 0.3, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          }
          ctx.fillStyle = "#61DAFB";
          ctx.beginPath();
          ctx.arc(0, 0, r * 0.16, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case "MongoDB": {
          badge("#0b3c25");
          ctx.fillStyle = "#47A248";
          ctx.beginPath();
          ctx.moveTo(0, -r * 0.75);
          ctx.quadraticCurveTo(r * 0.55, -r * 0.1, 0, r * 0.78);
          ctx.quadraticCurveTo(-r * 0.55, -r * 0.1, 0, -r * 0.75);
          ctx.fill();
          ctx.strokeStyle = "#eafff0";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, r * 0.15);
          ctx.lineTo(0, r * 0.65);
          ctx.stroke();
          break;
        }
        case "Git": {
          badge("#3a1c12");
          const pts = [[-r * 0.35, r * 0.3], [r * 0.35, r * 0.3], [0, -r * 0.4]];
          ctx.strokeStyle = "#F05033";
          ctx.lineWidth = Math.max(1, r * 0.08);
          ctx.beginPath();
          ctx.moveTo(pts[0][0], pts[0][1]); ctx.lineTo(pts[2][0], pts[2][1]);
          ctx.moveTo(pts[1][0], pts[1][1]); ctx.lineTo(pts[2][0], pts[2][1]);
          ctx.stroke();
          ctx.fillStyle = "#F05033";
          pts.forEach(([px, py]) => {
            ctx.beginPath(); ctx.arc(px, py, r * 0.14, 0, Math.PI * 2); ctx.fill();
          });
          break;
        }
        case "HTML": {
          badge("#E44D26");
          monogram("</>", "#ffffff", 800, 0.56);
          break;
        }
        case "JavaScript": {
          badge("#F7DF1E");
          monogram("JS", "#1a1a1a", 800, 0.72);
          break;
        }
        case "Tailwind CSS": {
          badge("#0e2430");
          ctx.strokeStyle = "#38BDF8";
          ctx.lineWidth = Math.max(1.4, r * 0.14);
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(-r * 0.6, -r * 0.05);
          ctx.quadraticCurveTo(-r * 0.3, -r * 0.35, 0, -r * 0.05);
          ctx.quadraticCurveTo(r * 0.3, r * 0.25, r * 0.6, -r * 0.05);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(-r * 0.6, r * 0.35);
          ctx.quadraticCurveTo(-r * 0.3, r * 0.05, 0, r * 0.35);
          ctx.quadraticCurveTo(r * 0.3, r * 0.65, r * 0.6, r * 0.35);
          ctx.stroke();
          break;
        }
        case "Node.js": {
          badge("#123a1d");
          ctx.strokeStyle = "#539E43";
          ctx.lineWidth = Math.max(1.2, r * 0.1);
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const a = (Math.PI / 3) * i - Math.PI / 2;
            const px = Math.cos(a) * r * 0.68;
            const py = Math.sin(a) * r * 0.68;
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
          monogram("N", "#539E43", 800, 0.5);
          break;
        }
        case "Express": {
          badge("#12141a");
          monogram("ex", "#ffffff", 700, 0.64);
          break;
        }
        case "CSS3": {
          badge("#173177");
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(-r * 0.4, -r * 0.55);
          ctx.lineTo(-r * 0.32, r * 0.5);
          ctx.lineTo(0, r * 0.68);
          ctx.lineTo(r * 0.32, r * 0.5);
          ctx.lineTo(r * 0.4, -r * 0.55);
          ctx.closePath();
          ctx.stroke();
          monogram("3", "#5680E9", 800, 0.6);
          break;
        }
        case "Python": {
          badge("#0d2438");
          ctx.fillStyle = "#3776AB";
          ctx.beginPath();
          ctx.ellipse(-r * 0.18, -r * 0.2, r * 0.5, r * 0.38, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#FFD43B";
          ctx.beginPath();
          ctx.ellipse(r * 0.18, r * 0.2, r * 0.5, r * 0.38, 0, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case "Photoshop": {
          badge("#001e36");
          monogram("Ps", "#31A8FF", 800, 0.6);
          break;
        }
        case "Premiere Pro": {
          badge("#00005b");
          monogram("Pr", "#9999FF", 800, 0.6);
          break;
        }
        case "Blender": {
          badge("#2b1200");
          ctx.strokeStyle = "#F5792A";
          ctx.lineWidth = Math.max(2, r * 0.22);
          ctx.beginPath();
          ctx.arc(0, r * 0.05, r * 0.42, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = "#F5792A";
          ctx.beginPath();
          ctx.arc(-r * 0.1, -r * 0.42, r * 0.16, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        default: {
          badge("#333333");
          monogram(skill.slice(0, 2).toUpperCase());
        }
      }

      ctx.restore();
    };

    // ---------------- realistic 3D-shaded meteoroid ----------------
    const drawMeteor = (m) => {
      ctx.save();
      ctx.translate(m.x, m.y);
      ctx.rotate(m.rotation);

      // perfectly circular silhouette — a round brown meteoroid
      ctx.beginPath();
      ctx.arc(0, 0, m.radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.save();
      ctx.clip();

      // base brown sphere color, lit from LIGHT_ANGLE so the circle reads as
      // a 3D ball rather than a flat disc
      const lightX = Math.cos(LIGHT_ANGLE) * m.radius * 1.1;
      const lightY = Math.sin(LIGHT_ANGLE) * m.radius * 1.1;
      const baseGrad = ctx.createRadialGradient(
        lightX * 0.55, lightY * 0.55, m.radius * 0.05,
        0, 0, m.radius * 1.2
      );
      baseGrad.addColorStop(0, "#d1ac7d");
      baseGrad.addColorStop(0.32, "#a8804f");
      baseGrad.addColorStop(0.65, "#7a5738");
      baseGrad.addColorStop(1, "#2e1f13");
      ctx.fillStyle = baseGrad;
      ctx.fillRect(-m.radius, -m.radius, m.radius * 2, m.radius * 2);

      // dark terminator shadow on the side away from the light — this is
      // what sells the round, spherical (not flat) look
      const shadowGrad = ctx.createRadialGradient(
        -lightX * 0.55, -lightY * 0.55, m.radius * 0.1,
        -lightX * 0.55, -lightY * 0.55, m.radius * 1.25
      );
      shadowGrad.addColorStop(0, "rgba(20,10,5,0.6)");
      shadowGrad.addColorStop(1, "rgba(20,10,5,0)");
      ctx.fillStyle = shadowGrad;
      ctx.fillRect(-m.radius, -m.radius, m.radius * 2, m.radius * 2);

      // fine stippled grain across the whole surface for a dusty rock texture
      m.speckles.forEach((s) => {
        ctx.beginPath();
        ctx.arc(s.ox, s.oy, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.shade < 0
          ? `rgba(35,22,12,${0.12 + Math.abs(s.shade) * 0.18})`
          : `rgba(230,200,150,${0.08 + s.shade * 0.14})`;
        ctx.fill();
      });

      // craters: concave feel via a dark pit + a bright rim on the
      // light-facing edge, so each pockmark reads as a real dent
      m.craters.forEach((c) => {
        ctx.save();
        ctx.translate(c.ox, c.oy);

        const pitGrad = ctx.createRadialGradient(
          lightX * 0.02, lightY * 0.02, c.r * 0.05,
          0, 0, c.r
        );
        pitGrad.addColorStop(0, "rgba(0,0,0,0.05)");
        pitGrad.addColorStop(0.6, "rgba(0,0,0,0.35)");
        pitGrad.addColorStop(1, "rgba(0,0,0,0.55)");
        ctx.beginPath();
        ctx.arc(0, 0, c.r, 0, Math.PI * 2);
        ctx.fillStyle = pitGrad;
        ctx.fill();

        const rimAngle = Math.atan2(lightY, lightX) + Math.PI;
        ctx.beginPath();
        ctx.arc(
          Math.cos(rimAngle) * c.r * 0.6,
          Math.sin(rimAngle) * c.r * 0.6,
          c.r * 0.42, 0, Math.PI * 2
        );
        ctx.fillStyle = "rgba(255,235,205,0.18)";
        ctx.fill();

        ctx.restore();
      });

      // subtle specular highlight, like light glancing off a curved surface
      ctx.beginPath();
      ctx.ellipse(lightX * 0.5, lightY * 0.5, m.radius * 0.22, m.radius * 0.14, LIGHT_ANGLE, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,240,210,0.18)";
      ctx.fill();

      ctx.restore(); // undo clip

      // crisp rim: bright sliver on the lit edge, dark sliver on the shadow edge
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, m.radius, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,225,180,0.3)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.strokeStyle = "rgba(0,0,0,0.55)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      ctx.restore();

      // skill icon badge, centered inside the rock, always upright regardless
      // of the meteor's rotation
      drawSkillIcon(m.skill, m.x, m.y, m.radius * 0.52);

      // skill name caption, below the rock (upright, not rotated)
      const lines = wrapSkillText(m.skill);
      ctx.save();
      ctx.font = "600 12px Rajdhani, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const lineHeight = 13;
      const startY = m.y + m.radius + 14;
      lines.forEach((line, i) => {
        const ly = startY + i * lineHeight;
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(0,0,0,0.7)";
        ctx.strokeText(line, m.x, ly);
        ctx.fillStyle = "#ffffff";
        ctx.fillText(line, m.x, ly);
      });
      ctx.restore();
    };

    // ---------------- realistic-ish deep space background ----------------
    const drawBackground = (t, tt) => {
      // deep space gradient (subtle blue-violet falloff, not flat black)
      const bgGrad = ctx.createRadialGradient(
        width * 0.5, height * 0.15, 0,
        width * 0.5, height * 0.85, Math.max(width, height) * 1.1
      );
      bgGrad.addColorStop(0, "#0d0c1c");
      bgGrad.addColorStop(0.55, "#07060f");
      bgGrad.addColorStop(1, "#020204");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // ---- diagonal Milky-Way dust band (photo-reference look) ----
      const g = galaxyRef.current;
      if (g) {
        ctx.save();
        ctx.translate(g.cx, g.cy);
        ctx.rotate(g.angle);

        // soft overall glow of the band itself
        const bandGrad = ctx.createLinearGradient(0, -g.thickness / 2, 0, g.thickness / 2);
        bandGrad.addColorStop(0, "rgba(150,160,200,0)");
        bandGrad.addColorStop(0.5, "rgba(160,170,205,0.09)");
        bandGrad.addColorStop(1, "rgba(150,160,200,0)");
        ctx.fillStyle = bandGrad;
        ctx.fillRect(-g.length / 2, -g.thickness / 2, g.length, g.thickness);

        // colored nebula glows near each end (purple one side, blue/pink the other)
        g.glows.forEach((gl) => {
          const pulse = 0.9 + Math.sin(tt * 0.12 + gl.lx) * 0.1;
          const grad = ctx.createRadialGradient(gl.lx, gl.ly, 0, gl.lx, gl.ly, gl.r * pulse);
          grad.addColorStop(0, `rgba(${gl.hue},${gl.alpha})`);
          grad.addColorStop(1, `rgba(${gl.hue},0)`);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(gl.lx, gl.ly, gl.r * pulse, 0, Math.PI * 2);
          ctx.fill();
        });

        // dense star cluster running along the band
        g.bandStars.forEach((s) => {
          const twinkle = 0.6 + Math.sin(tt * 1.8 + s.phase) * 0.4;
          ctx.beginPath();
          ctx.arc(s.lx, s.ly, s.r, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${s.hue}, ${s.sat}%, 88%, ${s.alpha * twinkle})`;
          ctx.fill();
        });

        // dark dust-lane patches breaking up the glow, like the real Milky Way's
        // silhouetted dust clouds cutting across the bright band
        g.dustPatches.forEach((d) => {
          const dg = ctx.createRadialGradient(d.lx, d.ly, 0, d.lx, d.ly, d.r);
          dg.addColorStop(0, `rgba(4,3,7,${d.alpha})`);
          dg.addColorStop(1, "rgba(4,3,7,0)");
          ctx.fillStyle = dg;
          ctx.beginPath();
          ctx.arc(d.lx, d.ly, d.r, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.restore();
      }

      // parallax star layers (twinkle + slow downward drift, nearer = faster/brighter)
      [starsRef.current.layer1, starsRef.current.layer2].forEach((layer) => {
        layer.forEach((s) => {
          s.y += s.speed;
          if (s.y > height) { s.y = 0; s.x = Math.random() * width; }
          const twinkle = 0.6 + Math.sin(tt * 2 + s.phase) * 0.4;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${s.alpha * twinkle})`;
          ctx.fill();
        });
      });
      // nearest star layer gets a faint color tint + soft glow for depth
      starsRef.current.layer3.forEach((s) => {
        s.y += s.speed;
        if (s.y > height) { s.y = 0; s.x = Math.random() * width; }
        const twinkle = 0.7 + Math.sin(tt * 1.6 + s.phase) * 0.3;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue}, 90%, 88%, ${s.alpha * twinkle})`;
        ctx.shadowColor = `hsla(${s.hue}, 90%, 75%, 0.8)`;
        ctx.shadowBlur = s.r * 2.2;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // occasional shooting star streak
      if (t > nextShootingStarRef.current && !shootingStarRef.current) {
        shootingStarRef.current = {
          x: rand(width * 0.1, width * 0.9),
          y: rand(0, height * 0.3),
          vx: rand(-6, -3),
          vy: rand(3, 5.5),
          life: 40,
        };
      }
      const sh = shootingStarRef.current;
      if (sh) {
        ctx.save();
        const grad = ctx.createLinearGradient(sh.x, sh.y, sh.x - sh.vx * 6, sh.y - sh.vy * 6);
        grad.addColorStop(0, "rgba(255,255,255,0.95)");
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sh.x, sh.y);
        ctx.lineTo(sh.x - sh.vx * 6, sh.y - sh.vy * 6);
        ctx.stroke();
        ctx.restore();
        sh.x += sh.vx;
        sh.y += sh.vy;
        sh.life -= 1;
        if (sh.life <= 0) {
          shootingStarRef.current = null;
          nextShootingStarRef.current = t + rand(2500, 7000);
        }
      }

      // subtle vignette for cinematic depth
      const vignette = ctx.createRadialGradient(
        width / 2, height / 2, Math.min(width, height) * 0.35,
        width / 2, height / 2, Math.max(width, height) * 0.75
      );
      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(1, "rgba(0,0,0,0.45)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);
    };

    const step = (t) => {
      ctx.clearRect(0, 0, width, height);

      const tt = t / 1000;
      drawBackground(t, tt);

      // ship follows mouse (eased)
      const ship = shipRef.current;
      const targetX = canvasMouseXRef.current !== null ? canvasMouseXRef.current : width / 2;
      ship.x += (Math.min(Math.max(targetX, SHIP_SIZE), width - SHIP_SIZE) - ship.x) * SHIP_EASE;
      ship.y = height - SHIP_BOTTOM_MARGIN;
      drawShip(ship.x, ship.y, tt);

      // bullets
      bulletsRef.current.forEach((b) => { b.y += b.vy; });
      bulletsRef.current = bulletsRef.current.filter((b) => b.y > -20);
      bulletsRef.current.forEach((b) => {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(b.x, b.y - 9);
        ctx.lineTo(b.x, b.y + 9);
        ctx.strokeStyle = "#7CF9FF";
        ctx.lineWidth = 3;
        ctx.shadowColor = "#7CF9FF";
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.restore();
      });

      // meteors
      meteorsRef.current.forEach((m) => {
        m.y += m.vy;
        m.x += m.vx;
        m.rotation += m.rotSpeed;
        if (m.x < m.radius) { m.x = m.radius; m.vx *= -1; }
        if (m.x > width - m.radius) { m.x = width - m.radius; m.vx *= -1; }
        if (m.y - m.radius > height) {
          m.y = -m.radius - rand(0, 200);
          m.x = rand(m.radius, Math.max(m.radius + 1, width - m.radius));
        }
        drawMeteor(m);
      });

      // collisions: bullets vs meteors
      const survivingBullets = [];
      bulletsRef.current.forEach((b) => {
        let hit = false;
        for (let i = 0; i < meteorsRef.current.length; i++) {
          const m = meteorsRef.current[i];
          const dx = b.x - m.x;
          const dy = b.y - m.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < m.radius + BULLET_RADIUS) {
            spawnParticles(m.x, m.y);
            meteorsRef.current.splice(i, 1);
            hit = true;
            setTotalDestroyed((c) => c + 1);
            break;
          }
        }
        if (!hit) survivingBullets.push(b);
      });
      bulletsRef.current = survivingBullets;

      // particles
      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.life -= 1;
      });
      particlesRef.current = particlesRef.current.filter((p) => p.life > 0);
      particlesRef.current.forEach((p) => {
        const alpha = p.life / p.maxLife;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${alpha})`;
        ctx.fill();
      });

      // check completion
      if (meteorsRef.current.length === 0 && !completedTriggeredRef.current) {
        completedTriggeredRef.current = true;
        setGameCompleted(true);
        setTimeout(() => setShowReveal(true), COMPLETE_BANNER_MS);
      }

      rafRef.current = requestAnimationFrame(step);
    };

    resize();
    rafRef.current = requestAnimationFrame(step);

    const ro = new ResizeObserver(resize);
    ro.observe(section);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [makeMeteor]);

  // fire on spacebar
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        fireBullet();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [fireBullet]);

  const handleMouseMove = (e) => {
    const rect = sectionRef.current.getBoundingClientRect();
    canvasMouseXRef.current = e.clientX - rect.left;
    mouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseLeave = () => {
    canvasMouseXRef.current = null;
    mouseRef.current = null;
  };

  const handleReset = () => {
    initGame();
  };

  const remaining = SKILLS.length - totalDestroyed;

  return (
    <section
      className="skills-wrap"
      id="skills"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={fireBullet}
    >
      <canvas ref={canvasRef} className="skills-canvas" />
      <div className="skills-fade-top" />
      <div className="skills-fade-bottom" />

      <div className="skills-header">
        <h2 className="skills-heading" ref={headingRef}>
          <LetterSpans words={["SKILLS"]} className="skills-heading-letter" />
        </h2>
        <p className="pop-it-text">Destroy the meteors to reveal my skills!</p>
        <p className="skills-instructions">Move mouse to steer • Click or press SPACE to fire</p>
        {!gameCompleted && (
          <p className="skills-counter">{remaining} meteor{remaining !== 1 ? "s" : ""} remaining</p>
        )}
      </div>

      {gameCompleted && !showReveal && (
        <div className="complete-banner">
          <span className="mission-word mission-left">MISSION</span>
          <span className="mission-word mission-right">COMPLETE</span>
        </div>
      )}

      {showReveal && (
        <div className="reveal-overlay">
          <h3 className="reveal-text" ref={revealRef}>
            <LetterSpans words={["UI/UX", " ", "DESIGNER"]} className="reveal-letter" />
          </h3>
          <button className="skills-reset-btn" onClick={(e) => { e.stopPropagation(); handleReset(); }}>
            Play again
          </button>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@500;600;700&display=swap');

        .skills-wrap {
          position: relative;
          background: #050510;
          min-height: 100vh;
          padding: 0;
          overflow: hidden;
          cursor: crosshair;
        }

        .skills-canvas {
          position: absolute;
          inset: 0;
          z-index: 0;
          width: 100%;
          height: 100%;
          display: block;
        }

        /* Vintage black edge fades — blend the section smoothly into the
           page above and below on scroll, instead of a hard cut-off edge */
        .skills-fade-top,
        .skills-fade-bottom {
          position: absolute;
          left: 0;
          right: 0;
          height: clamp(90px, 14vh, 180px);
          z-index: 1;
          pointer-events: none;
        }
        .skills-fade-top {
          top: 0;
          background: linear-gradient(
            to bottom,
            #000000 0%,
            rgba(0,0,0,0.75) 30%,
            rgba(0,0,0,0.35) 65%,
            rgba(0,0,0,0) 100%
          );
        }
        .skills-fade-bottom {
          bottom: 0;
          background: linear-gradient(
            to top,
            #000000 0%,
            rgba(0,0,0,0.75) 30%,
            rgba(0,0,0,0.35) 65%,
            rgba(0,0,0,0) 100%
          );
        }

        .skills-header {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-top: 70px;
          pointer-events: none;
        }

        .skills-heading {
          font-family: 'Bebas Neue', sans-serif;
          color: #FFD700;
          font-size: clamp(2.6rem, 5vw, 4.2rem);
          letter-spacing: 0.03em;
          line-height: 1;
          margin: 0 0 10px 0;
          text-shadow: 0 0 60px rgba(255,215,0,0.4);
          display: flex;
          flex-direction: row;
          justify-content: center;
          text-align: center;
        }
        .skills-heading-letter {
          display: inline-block;
          will-change: transform, color, text-shadow;
        }

        .pop-it-text {
          font-family: 'Rajdhani', sans-serif;
          color: rgba(255,255,255,0.75);
          font-size: 1.05rem;
          letter-spacing: 0.02em;
          font-weight: 600;
          margin: 0 0 4px 0;
          text-align: center;
        }

        .skills-instructions {
          font-family: 'Rajdhani', sans-serif;
          color: rgba(255,255,255,0.4);
          font-size: 0.85rem;
          letter-spacing: 0.03em;
          margin: 0 0 10px 0;
          text-align: center;
        }

        .skills-counter {
          font-family: 'Rajdhani', sans-serif;
          color: #7CF9FF;
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          margin: 0;
          text-shadow: 0 0 12px rgba(124,249,255,0.6);
        }

        .complete-banner {
          position: absolute;
          inset: 0;
          z-index: 3;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 22px;
          overflow: hidden;
          pointer-events: none;
        }
        .mission-word {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2.2rem, 6vw, 4.5rem);
          letter-spacing: 0.08em;
          color: #FFD700;
          text-shadow: 0 0 40px rgba(255,215,0,0.7);
          white-space: nowrap;
        }
        .mission-left {
          animation: slideInLeft 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards,
                     completePulse 1.1s ease-in-out 0.8s infinite;
        }
        .mission-right {
          animation: slideInRight 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards,
                     completePulse 1.1s ease-in-out 0.8s infinite;
        }
        @keyframes slideInLeft {
          from { transform: translateX(-140vw); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(140vw); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }
        @keyframes completePulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.06); opacity: 0.85; }
        }

        .reveal-overlay {
          position: absolute;
          inset: 0;
          z-index: 4;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 26px;
          background: rgba(5,5,16,0.7);
          animation: fadeIn 0.6s ease forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .reveal-text {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2.6rem, 7vw, 5.5rem);
          letter-spacing: 0.03em;
          text-shadow: 0 0 60px rgba(255,215,0,0.4);
          display: flex;
          flex-direction: row;
          justify-content: center;
          text-align: center;
          color: #FFD700;
          transform: scale(0);
          animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes popIn {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
        .reveal-letter {
          display: inline-block;
          will-change: transform, color, text-shadow;
          cursor: crosshair;
        }

        .skills-reset-btn {
          padding: 12px 32px;
          border: 2px solid #fff;
          border-radius: 50px;
          background: transparent;
          color: #fff;
          font-family: 'Rajdhani', sans-serif;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease;
        }
        .skills-reset-btn:hover {
          background: #FFD700;
          border-color: #FFD700;
          color: #000;
        }

        @media (max-width: 700px) {
          .skills-instructions { font-size: 0.75rem; }
        }
      `}</style>
    </section>
  );
}