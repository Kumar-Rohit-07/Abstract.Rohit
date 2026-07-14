import { useState, useRef, useCallback } from "react";

// Real contact details / links
const CONTACT_EMAIL = "rohit933448@gmail.com";
const CONTACT_PHONE = "+91 9031562501";
const CONTACT_LOCATION = "Jamshedpur, Jharkhand";

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

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | sent

  const sectionRef = useRef(null);
  const rafRef = useRef(null);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      // Lightweight no-backend option: opens the visitor's mail client
      // pre-filled with their message. Swap this for EmailJS / Formspree /
      // your own API route whenever you wire up real delivery.
      const subject = encodeURIComponent(`Portfolio inquiry from ${form.name || "a visitor"}`);
      const body = encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`);
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
      setStatus("sent");
    },
    [form]
  );

  // ---- Gesture-driven background: a soft glow that follows the
  // pointer (mouse move) or finger (touch move / drag) across the section.
  const updateGlow = useCallback((clientX, clientY) => {
    const node = sectionRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      node.style.setProperty("--gx", `${x}%`);
      node.style.setProperty("--gy", `${y}%`);
    });
  }, []);

  const handlePointerMove = useCallback(
    (e) => {
      updateGlow(e.clientX, e.clientY);
    },
    [updateGlow]
  );

  const handleTouchMove = useCallback(
    (e) => {
      const t = e.touches && e.touches[0];
      if (!t) return;
      updateGlow(t.clientX, t.clientY);
    },
    [updateGlow]
  );

  return (
    <section
      id="contact"
      className="contact-page"
      ref={sectionRef}
      onMouseMove={handlePointerMove}
      onTouchMove={handleTouchMove}
    >
      <div className="gesture-glow" aria-hidden="true" />
      <div className="contact-inner">
        <header className="contact-header">
          <span className="contact-eyebrow">Say hello</span>
          <h1 className="contact-heading">GET IN TOUCH</h1>
          <p className="contact-sub">
            Got a project, a role, or just an idea worth talking through? My inbox is open.
          </p>
        </header>

        <div className="contact-grid">
          {/* ---------- left: contact info ---------- */}
          <div className="contact-info">
            <div className="info-row">
              <span className="info-label">Email</span>
              <a className="info-value" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
            </div>
            <div className="info-row">
              <span className="info-label">Phone</span>
              <a className="info-value" href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`}>
                {CONTACT_PHONE}
              </a>
            </div>
            <div className="info-row">
              <span className="info-label">Location</span>
              <span className="info-value">{CONTACT_LOCATION}</span>
            </div>

            <div className="info-divider" />

            <div className="social-row">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-btn"
                  aria-label={s.label}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    {ICONS[s.icon]}
                  </svg>
                </a>
              ))}
            </div>

            <div className="availability">
              <span className="pulse-dot" />
              Currently available for freelance &amp; full-time work
            </div>
          </div>

          {/* ---------- right: form ---------- */}
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="field">
              <input
                type="text"
                name="name"
                id="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder=" "
              />
              <label htmlFor="name">Your name</label>
            </div>

            <div className="field">
              <input
                type="email"
                name="email"
                id="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder=" "
              />
              <label htmlFor="email">Your email</label>
            </div>

            <div className="field">
              <textarea
                name="message"
                id="message"
                rows={5}
                required
                value={form.message}
                onChange={handleChange}
                placeholder=" "
              />
              <label htmlFor="message">Tell me about your project</label>
            </div>

            <button type="submit" className="submit-btn">
              <span>{status === "sent" ? "Opening your mail app…" : "Send Message"}</span>
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path
                  d="M5 12h14M13 6l6 6-6 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {status === "sent" && (
              <p className="form-note">
                Your mail app should open with the message ready — hit send there to reach me.
              </p>
            )}
          </form>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Poppins:wght@400;500;600&display=swap');

        .contact-page {
          --bg: #0a0a0a;
          --panel: #141416;
          --panel-border: rgba(255, 255, 255, 0.08);
          --text: #f2f0eb;
          --text-dim: #9a968e;
          --gold: #ffd700;
          --red: #b31f24;
          --gx: 50%;
          --gy: 30%;

          position: relative;
          min-height: 100vh;
          width: 100%;
          background: radial-gradient(ellipse at top, #2a2a2e 0%, #17171a 45%, #0a0a0a 100%);
          color: var(--text);
          overflow: hidden;
          padding: 8vh 6vw 10vh;
          font-family: 'Poppins', system-ui, -apple-system, sans-serif;
        }

        /* ===== Gesture-driven glow layer =====
           Follows the mouse (or finger, on touch devices) around the
           section. Sits above the base gradient but below the content. */
        .gesture-glow {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background: radial-gradient(
            300px circle at var(--gx) var(--gy),
            rgba(255, 215, 0, 0.16),
            rgba(179, 31, 36, 0.08) 40%,
            transparent 70%
          );
          transition: background-position 0.05s linear;
          mix-blend-mode: screen;
        }

        .contact-inner {
          position: relative;
          z-index: 3;
          max-width: 1100px;
          margin: 0 auto;
        }

        /* ===== Header ===== */
        .contact-header {
          text-align: center;
          margin-bottom: 6vh;
        }

        .contact-eyebrow {
          display: inline-block;
          font-size: 0.75rem;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: var(--gold);
          opacity: 0.85;
          margin-bottom: 0.9rem;
        }

        .contact-heading {
          margin: 0;
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2.75rem, 7vw, 5.25rem);
          letter-spacing: 0.05em;
          line-height: 1;
          color: var(--gold);
          text-shadow: 0 0 60px rgba(255, 215, 0, 0.4);
        }

        .contact-sub {
          max-width: 46ch;
          margin: 1.1rem auto 0;
          color: var(--text-dim);
          font-size: 1rem;
          line-height: 1.6;
        }

        /* ===== Grid layout ===== */
        .contact-grid {
          display: grid;
          grid-template-columns: 0.85fr 1.15fr;
          gap: clamp(1.5rem, 4vw, 3.5rem);
          align-items: start;
        }

        @media (max-width: 860px) {
          .contact-grid {
            grid-template-columns: 1fr;
          }
        }

        /* ===== Left: info panel ===== */
        .contact-info {
          border: 1px solid var(--panel-border);
          background: rgba(20, 20, 22, 0.55);
          border-radius: 18px;
          padding: clamp(1.5rem, 3vw, 2.25rem);
          backdrop-filter: blur(6px);
        }

        .info-row {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          padding: 0.85rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .info-row:first-child {
          padding-top: 0;
        }

        .info-label {
          font-size: 0.7rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--text-dim);
        }

        .info-value {
          font-size: 1.02rem;
          color: var(--text);
          text-decoration: none;
          transition: color 0.2s ease;
          word-break: break-word;
        }

        a.info-value:hover {
          color: var(--gold);
        }

        .info-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.08);
          margin: 1.4rem 0;
        }

        .social-row {
          display: flex;
          gap: 0.65rem;
          margin-bottom: 1.6rem;
        }

        .social-btn {
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 1px solid var(--panel-border);
          color: var(--text);
          background: rgba(255, 255, 255, 0.03);
          transition: border-color 0.25s ease, box-shadow 0.25s ease, color 0.25s ease, transform 0.15s ease;
        }

        .social-btn:hover {
          border-color: var(--gold);
          color: var(--gold);
          box-shadow: 0 0 18px rgba(255, 215, 0, 0.25);
          transform: translateY(-2px);
        }

        .availability {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          font-size: 0.85rem;
          color: var(--text-dim);
          line-height: 1.4;
        }

        .pulse-dot {
          position: relative;
          width: 8px;
          height: 8px;
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
          0% {
            transform: scale(0.6);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.9);
            opacity: 0;
          }
        }

        /* ===== Right: form ===== */
        .contact-form {
          border: 1px solid var(--panel-border);
          background: rgba(20, 20, 22, 0.55);
          border-radius: 18px;
          padding: clamp(1.5rem, 3vw, 2.25rem);
          backdrop-filter: blur(6px);
          display: flex;
          flex-direction: column;
          gap: 1.4rem;
        }

        .field {
          position: relative;
        }

        .field input,
        .field textarea {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--panel-border);
          border-radius: 10px;
          padding: 1.1rem 0.9rem 0.55rem;
          color: var(--text);
          font-family: inherit;
          font-size: 0.98rem;
          outline: none;
          resize: vertical;
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
        }

        .field textarea {
          min-height: 120px;
        }

        .field input:focus,
        .field textarea:focus {
          border-color: var(--gold);
          box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.12);
        }

        .field label {
          position: absolute;
          left: 0.9rem;
          top: 0.95rem;
          color: var(--text-dim);
          font-size: 0.95rem;
          pointer-events: none;
          transform-origin: left top;
          transition: transform 0.18s ease, color 0.18s ease, top 0.18s ease;
        }

        .field input:focus + label,
        .field input:not(:placeholder-shown) + label,
        .field textarea:focus + label,
        .field textarea:not(:placeholder-shown) + label {
          transform: translateY(-0.55rem) scale(0.78);
          color: var(--gold);
          top: 0.55rem;
        }

        .submit-btn {
          align-self: flex-start;
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.85rem 1.5rem;
          border-radius: 999px;
          border: 1px solid var(--gold);
          background: transparent;
          color: var(--gold);
          font-family: inherit;
          font-weight: 600;
          font-size: 0.92rem;
          letter-spacing: 0.02em;
          cursor: pointer;
          transition: background 0.25s ease, color 0.25s ease, box-shadow 0.25s ease, transform 0.15s ease;
        }

        .submit-btn:hover {
          background: var(--gold);
          color: #14100a;
          box-shadow: 0 0 28px rgba(255, 215, 0, 0.35);
        }

        .submit-btn:active {
          transform: scale(0.97);
        }

        .submit-btn svg {
          transition: transform 0.2s ease;
        }

        .submit-btn:hover svg {
          transform: translateX(3px);
        }

        .form-note {
          margin: 0;
          font-size: 0.82rem;
          color: var(--text-dim);
        }

        /* ===== Reduced motion ===== */
        @media (prefers-reduced-motion: reduce) {
          .gesture-glow {
            display: none;
          }
          .pulse-dot::after {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}