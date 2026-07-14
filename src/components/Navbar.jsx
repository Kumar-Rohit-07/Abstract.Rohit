import { useState, useEffect, useCallback, useRef } from "react";

const NAV_LINKS = ["HOME", "ABOUT", "PROJECTS", "SKILLS", "CONTACT"];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Smooth-scrolls to the section whose id matches the clicked link
  // (e.g. "CONTACT" -> id="contact"), offsetting for the fixed navbar's
  // own height so the section heading isn't hidden underneath it.
  const scrollToSection = useCallback((link) => {
    const targetId = link.toLowerCase();
    const target = document.getElementById(targetId);

    if (!target) {
      // Section isn't on this page (or the id doesn't match yet) —
      // fail quietly instead of doing nothing silently forever.
      console.warn(`Navbar: no element with id="${targetId}" found.`);
      return;
    }

    const navHeight = navRef.current ? navRef.current.offsetHeight : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - navHeight;

    window.scrollTo({ top, behavior: "smooth" });
  }, []);

  const handleLinkClick = useCallback(
    (e, link) => {
      e.preventDefault();
      scrollToSection(link);
      setMenuOpen(false);
    },
    [scrollToSection]
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;500;600;700&display=swap');

        .navbar {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 48px;
          transition: all 0.4s ease;
          font-family: 'Rajdhani', sans-serif;
        }

        .navbar.scrolled {
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          padding: 14px 48px;
          border-bottom: 1px solid rgba(255, 215, 0, 0.15);
        }

        .nav-logo {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 30px;
          letter-spacing: 0.04em;
          text-decoration: none;
          color: #fff;
          cursor: pointer;
          transition: font-size 0.7s ease;
        }

        .nav-logo:hover {
          font-size: 34px;
        }

        .nav-logo span {
          color: #FFD700;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 40px;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .nav-links a {
          color: rgba(255,255,255,0.85);
          text-decoration: none;
          font-size: 16px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          position: relative;
          transition: color 0.25s, font-size 0.25s;
        }

        .nav-links a::after {
          content: '';
          position: absolute;
          bottom: -4px; left: 0;
          width: 0; height: 2px;
          background: #FFD700;
          transition: width 0.3s ease;
        }

        .nav-links a:hover {
          color: #FFD700;
          font-size: 19px;
        }

        .nav-links a:hover::after {
          width: 100%;
        }

        /* Hamburger for mobile */
        .nav-hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          cursor: pointer;
          background: none;
          border: none;
          padding: 4px;
        }

        .nav-hamburger span {
          display: block;
          width: 26px;
          height: 2px;
          background: #fff;
          transition: all 0.3s;
        }

        .nav-hamburger.open span:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }
        .nav-hamburger.open span:nth-child(2) {
          opacity: 0;
        }
        .nav-hamburger.open span:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }

        /* Mobile menu */
        .nav-mobile {
          display: none;
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.97);
          z-index: 999;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 40px;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .nav-mobile.open {
          display: flex;
        }

        .nav-mobile a {
          color: #fff;
          text-decoration: none;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 42px;
          letter-spacing: 0.08em;
          transition: color 0.2s;
        }

        .nav-mobile a:hover {
          color: #FFD700;
        }

        @media (max-width: 768px) {
          .navbar {
            padding: 16px 24px;
          }
          .nav-links {
            display: none;
          }
          .nav-hamburger {
            display: flex;
          }
        }
      `}</style>

      <nav className={`navbar${scrolled ? " scrolled" : ""}`} ref={navRef}>
        <a
          className="nav-logo"
          href="#home"
          onClick={(e) => handleLinkClick(e, "HOME")}
        >
          Abstract<span>.Rohit</span>
        </a>

        <ul className="nav-links">
          {NAV_LINKS.map((link) => (
            <li key={link}>
              <a href={`#${link.toLowerCase()}`} onClick={(e) => handleLinkClick(e, link)}>
                {link}
              </a>
            </li>
          ))}
        </ul>

        <button
          className={`nav-hamburger${menuOpen ? " open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      {/* Mobile fullscreen menu */}
      <ul className={`nav-mobile${menuOpen ? " open" : ""}`}>
        {NAV_LINKS.map((link) => (
          <li key={link}>
            <a href={`#${link.toLowerCase()}`} onClick={(e) => handleLinkClick(e, link)}>
              {link}
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}