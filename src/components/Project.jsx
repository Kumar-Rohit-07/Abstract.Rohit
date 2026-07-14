import { useState, useEffect, useCallback, useRef } from "react";
import "./Project.css";
import capzyyImg from "../assets/capzyy.png";
import spodifyVideo from "../assets/spodify.mp4";
import clientVideo from "../assets/client.mov";
import podcastVideo from "../assets/podcast.mov";

// Single project card.
// image: place image files inside your /public folder, then reference it as "/capzyy.png"
//        (or import it from your assets folder if you prefer bundling instead of /public)
// video: same idea — import from assets, or reference from /public for large files
// link: the live site URL (only used for type: "image" projects)
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
    title: "Spodie",
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

  const goNext = useCallback(() => {
    setDirection("next");
    setActiveIndex((i) => (i + 1) % total);
  }, [total]);

  const goPrev = useCallback(() => {
    setDirection("prev");
    setActiveIndex((i) => (i - 1 + total) % total);
  }, [total]);

  // optional: arrow key support
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

  // returns a slot label ("prev" | "active" | "next" | "hidden") for each project
  const getSlot = (index) => {
    if (index === activeIndex) return "active";
    if (index === (activeIndex - 1 + total) % total) return "prev";
    if (index === (activeIndex + 1) % total) return "next";
    return "hidden";
  };

  return (
    <section className="projects-page" ref={sectionRef}>
      <h1 className="projects-heading">
        <span className="heading-line">PROJECTS</span>
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
          background: radial-gradient(ellipse at top, #2a2a2e 0%, #17171a 45%, #0a0a0a 100%) !important;
        }
      `}</style>
    </section>
  );
}