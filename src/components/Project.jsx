import { useState, useEffect, useCallback, useRef } from "react";
import "./Project.css";
import capzyyImg from "../assets/capzyy.png";
import spodifyVideo from "../assets/spodify.mp4";
import clientVideo from "../assets/client.MOV";
import podcastVideo from "../assets/podcast.MOV";

const projects = [
  {
    id: 1,
    title: "Capzyy",
    category: "E-commerce",
    description: "India's premium cap brand. Built loud. Worn louder.",
    image: capzyyImg,
    link: "https://capzyy.com",
    type: "image",
  },
  {
    id: 2,
    title: "Spodif",
    category: "Video",
    description: "Spotify-inspired music app walkthrough.",
    video: spodifyVideo,
    type: "video",
  },
  {
    id: 3,
    title: "Client Project",
    category: "Video",
    description: "Client showcase video.",
    video: clientVideo,
    type: "video",
  },
  {
    id: 4,
    title: "Podcast",
    category: "Video",
    description: "Podcast highlight reel.",
    video: podcastVideo,
    type: "video",
  },
];

export default function Project() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState("next");
  const [videoOpen, setVideoOpen] = useState(false);
  const total = projects.length;

  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const mouseRef = useRef(null);
  const letterRafRef = useRef(null);

  const goNext = useCallback(() => {
    setDirection("next");
    setActiveIndex((i) => (i + 1) % total);
  }, [total]);

  const goPrev = useCallback(() => {
    setDirection("prev");
    setActiveIndex((i) => (i - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    const onKey = (e) => {
      if (videoOpen) {
        if (e.key === "Escape") setVideoOpen(false);
        return;
      }
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, videoOpen]);

  const getSlot = (index) => {
    if (index === activeIndex) return "active";
    if (index === (activeIndex - 1 + total) % total) return "prev";
    if (index === (activeIndex + 1) % total) return "next";
    return "hidden";
  };

  useEffect(() => {
    const headingEl = headingRef.current;
    if (!headingEl) return;

    const letters = headingEl.querySelectorAll(".proj-letter");
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
          : "#FFD700";
        el.style.textShadow = currents[i].scale > 1.05
          ? `0 0 ${20 * (currents[i].scale - 1) * 4}px rgba(255,215,0,0.7)`
          : "0 0 60px rgba(255,215,0,0.4)";
      });

      letterRafRef.current = requestAnimationFrame(animate);
    };

    letterRafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(letterRafRef.current);
  }, []);

  const onMouseMove = (e) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseLeave = () => {
    mouseRef.current = null;
  };

  const headingLetters = "PROJECTS".split("").map((char, i) => (
    <span
      key={i}
      className="proj-letter"
      style={{
        display: "inline-block",
        transition: "color 0.15s",
        willChange: "transform, color",
        transformOrigin: "center center",
      }}
    >
      {char}
    </span>
  ));

  return (
    <section
      id="projects"
      className="projects-page"
      ref={sectionRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <h1 className="projects-heading" ref={headingRef}>
        <span className="heading-line">{headingLetters}</span>
        <span className="heading-index">
          {String(activeIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </h1>

      <div className="stack-container">
        {total > 1 && (
          <button
            type="button"
            className="nav-btn nav-left"
            onClick={goPrev}
            aria-label="Previous project"
          >
            <svg viewBox="0 0 24 24" width="22" height="22">
              <path d="M15 4L7 12l8 8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        <div className="card-stack">
          {projects.map((project, index) => {
            const slot = getSlot(index);
            if (slot === "hidden") return null;
            const isVideo = project.type === "video";

            return (
              <article
                key={project.id}
                className={`project-card slot-${slot}`}
                onClick={() => {
                  if (isVideo && slot === "active") setVideoOpen(true);
                }}
              >
                <div className="card-image-wrap">
                  {isVideo ? (
                    <video
                      src={project.video}
                      className="card-image"
                      muted
                      loop
                      autoPlay
                      playsInline
                      style={{ cursor: slot === "active" ? "pointer" : "default" }}
                    />
                  ) : (
                    <img src={project.image} alt={project.title} className="card-image" loading="lazy" />
                  )}
                  <div className="card-gradient" />
                  {isVideo && slot === "active" && (
                    <div className="play-overlay" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="28" height="28">
                        <path d="M8 5v14l11-7z" fill="currentColor" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="card-content">
                  <span className="card-category">{project.category}</span>
                  <h2 className="card-title">{project.title}</h2>
                  <p className="card-description">{project.description}</p>

                  {slot === "active" && (
                    isVideo ? (
                      <button
                        type="button"
                        className="card-link"
                        onClick={(e) => {
                          e.stopPropagation();
                          setVideoOpen(true);
                        }}
                      >
                        Watch Video
                        <svg viewBox="0 0 24 24" width="14" height="14">
                          <path d="M8 5v14l11-7z" fill="currentColor" />
                        </svg>
                      </button>
                    ) : (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="card-link"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Project
                        <svg viewBox="0 0 24 24" width="14" height="14">
                          <path d="M7 17L17 7M17 7H8M17 7v9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </a>
                    )
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {total > 1 && (
          <button
            type="button"
            className="nav-btn nav-right"
            onClick={goNext}
            aria-label="Next project"
          >
            <svg viewBox="0 0 24 24" width="22" height="22">
              <path d="M9 4l8 8-8 8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      {total > 1 && (
        <div className="dots">
          {projects.map((project, index) => (
            <button
              key={project.id}
              type="button"
              className={`dot ${index === activeIndex ? "dot-active" : ""}`}
              onClick={() => {
                setDirection(index > activeIndex ? "next" : "prev");
                setActiveIndex(index);
              }}
              aria-label={`Go to ${project.title}`}
            />
          ))}
        </div>
      )}

      {videoOpen && (
        <div className="video-modal" onClick={() => setVideoOpen(false)}>
          <div className="video-modal-inner" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="video-modal-close"
              onClick={() => setVideoOpen(false)}
              aria-label="Close video"
            >
              ✕
            </button>
            <video src={projects[activeIndex].video} controls autoPlay />
          </div>
        </div>
      )}

      <style>{`
        .projects-page {
          position: relative;
          overflow: hidden;
          background-color: #0a0a0a;
          background-image:
            repeating-linear-gradient(45deg, rgba(255,255,255,0.07) 0px, rgba(255,255,255,0.00) 1px, transparent 1px, transparent 90px),
            repeating-linear-gradient(-45deg, rgba(255,255,255,0.07) 0px, rgba(255,255,255,0.00) 1px, transparent 1px, transparent 90px),
            repeating-linear-gradient(45deg, rgba(255,215,0,0.05) 0px, rgba(255,215,0,0.05) 1px, transparent 1px, transparent 450px),
            repeating-linear-gradient(-45deg, rgba(255,215,0,0.05) 0px, rgba(255,215,0,0.05) 1px, transparent 1px, transparent 450px),
            repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px 45px, rgba(0,0,0,0.35) 45px 90px),
            repeating-linear-gradient(-45deg, rgba(255,255,255,0.02) 0px 45px, rgba(0,0,0,0.25) 45px 90px),
            radial-gradient(ellipse at top, #2a2a2e 0%, #17171a 45%, #0a0a0a 100%) !important;
          background-blend-mode: screen, screen, screen, screen, overlay, overlay, normal;
        }

        .projects-heading,
        .stack-container,
        .dots {
          position: relative;
          z-index: 2;
        }

        .proj-letter {
          display: inline-block;
          will-change: transform, color, text-shadow;
          cursor: crosshair;
          color: #FFD700;
          text-shadow: 0 0 60px rgba(255,215,0,0.4);
        }
      `}</style>
    </section>
  );
}