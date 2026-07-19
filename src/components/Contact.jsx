import { useState, useRef, useEffect } from "react";
import emailjs from "@emailjs/browser";
import contactBg from "../assets/content-king-bg.png";

// ============================================================
//  REAL CONTACT DETAILS
// ============================================================
const CONTACT_EMAIL = "rohit933448@gmail.com";
const CONTACT_PHONE = "+91 9031562501";
const CONTACT_LOCATION = "Jamshedpur, Jharkhand";

// ============================================================
//  EMAILJS CONFIG  —  https://www.emailjs.com
//  1. Sign up, add an Email Service (connect your Gmail).
//  2. Create an Email Template with variables:
//     {{from_name}}, {{from_email}}, {{message}}
//  3. Paste your Service ID / Template ID / Public Key below.
// ============================================================
const EMAILJS_SERVICE_ID = "service_oxragre";
const EMAILJS_TEMPLATE_ID = "template_5d89hrx";
const EMAILJS_PUBLIC_KEY = "x4K8hH6cs0EBurgRR";

const SOCIALS = [
  { label: "GitHub", href: "https://github.com/Kumar-Rohit-07", icon: "github" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/rohit-kumar-1b15a8254/", icon: "linkedin" },
  { label: "Instagram", href: "https://www.instagram.com/_.r0hit._08/", icon: "instagram" },
];

const ICONS = {
  github: (
    <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.5 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.46-1.2-1.11-1.52-1.11-1.52-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.9 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.64-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.32.1-2.75 0 0 .84-.28 2.75 1.05a9.32 9.32 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.43.2 2.49.1 2.75.64.72 1.03 1.63 1.03 2.75 0 3.93-2.35 4.79-4.58 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.5A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2z" />
  ),
  linkedin: (
    <path d="M6.94 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM3.2 8.75h3.5V21H3.2V8.75zM9.5 8.75h3.36v1.68h.05c.47-.88 1.6-1.8 3.3-1.8 3.53 0 4.18 2.32 4.18 5.35V21h-3.5v-5.87c0-1.4-.03-3.2-1.95-3.2-1.96 0-2.26 1.53-2.26 3.1V21H9.5V8.75z" />
  ),
  instagram: (
    <path d="M12 2.2c3.2 0 3.58.01 4.85.07 1.17.05 1.97.24 2.43.4a4.9 4.9 0 0 1 1.77 1.15 4.9 4.9 0 0 1 1.15 1.77c.16.46.35 1.26.4 2.43.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.24 1.97-.4 2.43a4.9 4.9 0 0 1-1.15 1.77 4.9 4.9 0 0 1-1.77 1.15c-.46.16-1.26.35-2.43.4-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.97-.24-2.43-.4a4.9 4.9 0 0 1-1.77-1.15 4.9 4.9 0 0 1-1.15-1.77c-.16-.46-.35-1.26-.4-2.43C2.21 15.58 2.2 15.2 2.2 12s.01-3.58.07-4.85c.05-1.17.24-1.97.4-2.43A4.9 4.9 0 0 1 3.82 3c.5-.5 1.05-.87 1.77-1.15.46-.16 1.26-.35 2.43-.4C9.29 2.21 9.67 2.2 12 2.2zm0 1.8c-3.15 0-3.5.01-4.73.07-1.03.05-1.6.22-1.97.36-.5.19-.85.42-1.22.79-.37.37-.6.72-.79 1.22-.14.37-.31.94-.36 1.97-.06 1.23-.07 1.58-.07 4.73s.01 3.5.07 4.73c.05 1.03.22 1.6.36 1.97.19.5.42.85.79 1.22.37.37.72.6 1.22.79.37.14.94.31 1.97.36 1.23.06 1.58.07 4.73.07s3.5-.01 4.73-.07c1.03-.05 1.6-.22 1.97-.36.5-.19.85-.42 1.22-.79.37-.37.6-.72.79-1.22.14-.37.31-.94.36-1.97.06-1.23.07-1.58.07-4.73s-.01-3.5-.07-4.73c-.05-1.03-.22-1.6-.36-1.97a3.1 3.1 0 0 0-.79-1.22 3.1 3.1 0 0 0-1.22-.79c-.37-.14-.94-.31-1.97-.36-1.23-.06-1.58-.07-4.73-.07zm0 4.3a5.7 5.7 0 1 1 0 11.4 5.7 5.7 0 0 1 0-11.4zm0 1.8a3.9 3.9 0 1 0 0 7.8 3.9 3.9 0 0 0 0-7.8zm5.9-1.98a1.33 1.33 0 1 1-2.66 0 1.33 1.33 0 0 1 2.66 0z" />
  ),
};

// ---- heading letter-tracking settings (same values used on About.jsx "ABOUT ME") ----
const HEADING_LERP = 0.08;
const HEADING_MAX_ROTATE = 18;
const HEADING_MAX_SCALE = 1.22;
const HEADING_INFLUENCE_RADIUS = 140;
// --------------------------------------------------------------------------------

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle");

  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const rawMouseRef = useRef(null);
  const headingRafRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: form.name,
          from_email: form.email,
          message: form.message,
          to_email: CONTACT_EMAIL,
        },
        { publicKey: EMAILJS_PUBLIC_KEY }
      );
      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      console.error("EmailJS send failed:", err?.text || err?.message || err);
      setStatus("error");
    }
  };

  // ---------------- GET IN TOUCH letter mouse tracking (mirrors About.jsx heading effect) ----------------
  useEffect(() => {
    const headingEl = headingRef.current;
    if (!headingEl) return;

    const letters = headingEl.querySelectorAll(".contact-heading-letter");
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

  // split "GET IN TOUCH" into individual letter spans, same pattern as About.jsx
  const headingText = ["GET", " ", "IN", " ", "TOUCH"];
  const headingLetterSpans = headingText.map((word, wi) =>
    word === " "
      ? <span key={`space-${wi}`} style={{ display: "inline-block", width: "0.28em" }} />
      : (
        <span key={`word-${wi}`} style={{ display: "inline-flex" }}>
          {word.split("").map((char, ci) => (
            <span
              key={`${wi}-${ci}`}
              className="contact-heading-letter"
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
    <section id="contact" className="contact-page" ref={sectionRef}>
      <div
        className="contact-shell"
        onMouseMove={(e) => { rawMouseRef.current = { x: e.clientX, y: e.clientY }; }}
        onMouseLeave={() => { rawMouseRef.current = null; }}
      >
        <div className="contact-bg" />
        <div className="contact-bg-overlay" />

        <div className="contact-shell-inner">
          <header className="reveal-heading">
            <h1 className="contact-heading" ref={headingRef}>
              {headingLetterSpans}
            </h1>
            <p>Got a project in mind? Here's how to reach me.</p>
          </header>

          <div className="reveal-boxes">
            <div className="contact-info">
              <div className="info-row">
                <span className="info-label">Email</span>
                <a className="info-value" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              </div>
              <div className="info-row">
                <span className="info-label">Phone</span>
                <a className="info-value" href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`}>{CONTACT_PHONE}</a>
              </div>
              <div className="info-row">
                <span className="info-label">Location</span>
                <span className="info-value">{CONTACT_LOCATION}</span>
              </div>

              <div className="info-divider" />

              <div className="social-row">
                {SOCIALS.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="social-btn" aria-label={s.label}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">{ICONS[s.icon]}</svg>
                  </a>
                ))}
              </div>

              <div className="availability">
                <span className="pulse-dot" />
                Currently available for freelance &amp; full-time work
              </div>
            </div>

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="field">
                <input type="text" name="name" id="name" required value={form.name} onChange={handleChange} placeholder=" " />
                <label htmlFor="name">Your name</label>
              </div>
              <div className="field">
                <input type="email" name="email" id="email" required value={form.email} onChange={handleChange} placeholder=" " />
                <label htmlFor="email">Your email</label>
              </div>
              <div className="field">
                <textarea name="message" id="message" rows={4} required value={form.message} onChange={handleChange} placeholder=" " />
                <label htmlFor="message">Tell me about your project</label>
              </div>
              <button type="submit" className="submit-btn" disabled={status === "sending"}>
                <span>
                  {status === "sending"
                    ? "Sending…"
                    : status === "sent"
                    ? "Message sent!"
                    : "Send Message"}
                </span>
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {status === "sent" && (
                <p className="form-note">Thanks! Your message has been sent — I'll get back to you soon.</p>
              )}
              {status === "error" && (
                <p className="form-note form-note-error">
                  Something went wrong sending your message. Please try again, or email me directly at{" "}
                  <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Poppins:wght@400;500;600&display=swap');

        .contact-page {
          --gold: #ffd700;
          --red: #ff2b33;
          --text: #f2f0eb;
          --text-dim: #9a968e;
          --panel-border: rgba(255, 255, 255, 0.08);

          position: relative;
          min-height: 100vh;
          width: 100%;
          background: #0a0a0a;
          color: var(--text);
          font-family: 'Poppins', system-ui, -apple-system, sans-serif;
        }

        /* ===== Normal contact page (black theme + blended background) ===== */
        .contact-shell {
          position: relative;
          min-height: 100vh;
          width: 100%;
          overflow: hidden;
          animation: fade-in 0.6s ease;
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .contact-bg {
          position: absolute;
          inset: 0;
          background-image: url(${contactBg});
          background-size: cover;
          background-position: center;
          opacity: 0.4;
          filter: grayscale(15%) contrast(1.05);
          z-index: 0;
        }

        .contact-bg-overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
          background:
            radial-gradient(ellipse at 50% 20%, rgba(10,8,8,0.35) 0%, rgba(10,8,8,0.85) 60%, rgba(6,4,4,0.97) 100%),
            linear-gradient(180deg, rgba(6,4,4,0.9) 0%, rgba(6,4,4,0.55) 20%, rgba(6,4,4,0.55) 70%, rgba(6,4,4,0.95) 100%);
        }

        .contact-shell-inner {
          position: relative;
          z-index: 2;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3rem;
          padding: 8vh 6vw;
        }

        .reveal-heading { text-align: center; }
        .contact-heading {
          margin: 0;
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2.75rem, 6vw, 5rem);
          letter-spacing: 0.05em;
          line-height: 1;
          color: var(--gold);
          text-shadow: 0 0 60px rgba(255, 215, 0, 0.4);
          display: flex;
          flex-direction: row;
          justify-content: center;
        }
        .contact-heading-letter {
          display: inline-block;
          will-change: transform, color, text-shadow;
          cursor: crosshair;
        }
        .reveal-heading p {
          margin: 0.75rem 0 0;
          color: var(--text-dim);
        }

        /* ===== boxes: row-aligned side by side ===== */
        .reveal-boxes {
          display: flex;
          flex-direction: row;
          flex-wrap: nowrap;
          gap: 1.5rem;
          justify-content: center;
          align-items: stretch;
          width: 100%;
          max-width: 900px;
        }

        .contact-info,
        .contact-form {
          border: 1px solid var(--panel-border);
          background: rgba(12, 10, 11, 0.92);
          border-radius: 18px;
          padding: clamp(1.5rem, 2.4vw, 2.25rem);
          flex: 1 1 0;
          min-width: 0;
        }

        .info-row {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          padding: 0.75rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .info-row:first-child { padding-top: 0; }
        .info-label {
          font-size: 0.68rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--text-dim);
        }
        .info-value {
          font-size: 1rem;
          color: var(--text);
          text-decoration: none;
          transition: color 0.2s ease;
          word-break: break-word;
        }
        a.info-value:hover { color: var(--red); }

        .info-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.08);
          margin: 1.2rem 0;
        }

        .social-row { display: flex; gap: 0.65rem; margin-bottom: 1.4rem; }
        .social-btn {
          display: grid;
          place-items: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid var(--panel-border);
          color: var(--text);
          background: rgba(255, 255, 255, 0.04);
          transition: border-color 0.25s ease, box-shadow 0.25s ease, color 0.25s ease, transform 0.15s ease;
        }
        .social-btn:hover {
          border-color: var(--red);
          color: var(--red);
          box-shadow: 0 0 18px rgba(255, 43, 51, 0.3);
          transform: translateY(-2px);
        }

        .availability {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          font-size: 0.82rem;
          color: var(--text-dim);
          line-height: 1.4;
        }
        .pulse-dot {
          position: relative;
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #3ddc7a;
          flex: none;
        }
        .pulse-dot::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 1px solid #3ddc7a;
          animation: pulse-ring 2.2s ease-out infinite;
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.6); opacity: 0.8; }
          100% { transform: scale(1.9); opacity: 0; }
        }

        .contact-form { display: flex; flex-direction: column; gap: 1.3rem; }
        .field { position: relative; }
        .field input, .field textarea {
          width: 100%;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--panel-border);
          border-radius: 10px;
          padding: 1.1rem 0.9rem 0.55rem;
          color: var(--text);
          font-family: inherit;
          font-size: 0.96rem;
          outline: none;
          resize: vertical;
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .field textarea { min-height: 110px; }
        .field input:focus, .field textarea:focus {
          border-color: var(--red);
          box-shadow: 0 0 0 3px rgba(255, 43, 51, 0.14);
        }
        .field label {
          position: absolute;
          left: 0.9rem;
          top: 0.95rem;
          color: var(--text-dim);
          font-size: 0.94rem;
          pointer-events: none;
          transform-origin: left top;
          transition: transform 0.18s ease, color 0.18s ease, top 0.18s ease;
        }
        .field input:focus + label,
        .field input:not(:placeholder-shown) + label,
        .field textarea:focus + label,
        .field textarea:not(:placeholder-shown) + label {
          transform: translateY(-0.55rem) scale(0.78);
          color: var(--red);
          top: 0.55rem;
        }

        .submit-btn {
          align-self: flex-start;
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.8rem 1.4rem;
          border-radius: 999px;
          border: 1px solid var(--gold);
          background: transparent;
          color: var(--gold);
          font-family: inherit;
          font-weight: 600;
          font-size: 0.9rem;
          letter-spacing: 0.02em;
          cursor: pointer;
          transition: background 0.25s ease, color 0.25s ease, box-shadow 0.25s ease, transform 0.15s ease;
        }
        .submit-btn:hover {
          background: var(--gold);
          color: #14100a;
          box-shadow: 0 0 28px rgba(255, 215, 0, 0.3);
        }
        .submit-btn:active { transform: scale(0.97); }
        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .submit-btn svg { transition: transform 0.2s ease; }
        .submit-btn:hover svg { transform: translateX(3px); }

        .form-note { margin: 0; font-size: 0.8rem; color: var(--text-dim); }
        .form-note-error { color: var(--red); }

        /* ===== Responsive: stack the boxes only on small screens ===== */
        @media (max-width: 760px) {
          .reveal-boxes {
            flex-direction: column;
          }
        }
      `}</style>
    </section>
  );
}