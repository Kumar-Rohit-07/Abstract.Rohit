import { useState, useRef, useCallback, useEffect } from "react";
import "./Project.css";
import capzyyImg from "../assets/capzyy.png";
import spodifyVideo from "../assets/spodify.MP4";
import clientVideo from "../assets/client.MOV";
import podcastVideo from "../assets/podcast.MOV";
import "../utils/Audiounlock"; // registers the site-wide click/tap/key listeners

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

/* One card in the carousel: handles its own 3D tilt + hover video playback */
function Card({ project, onOpenVideo }) {
  const cardRef = useRef(null);
  const videoRef = useRef(null);
  const frame = useRef(null);
  const isVideo = project.type === "video";

  const handleMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;

    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;

      const rotateY = (px - 0.5) * 16;
      const rotateX = (0.5 - py) * 16;

      card.style.setProperty("--rx", `${rotateX}deg`);
      card.style.setProperty("--ry", `${rotateY}deg`);
      card.style.setProperty("--mx", `${px * 100}%`);
      card.style.setProperty("--my", `${py * 100}%`);
    });
  }, []);

  const handleEnter = useCallback(() => {
    if (isVideo && videoRef.current) {
      videoRef.current.play().catch(() => { });
    }
  }, [isVideo]);

  const handleLeave = useCallback(() => {
    const card = cardRef.current;
    if (card) {
      card.style.setProperty("--rx", `0deg`);
      card.style.setProperty("--ry", `0deg`);
    }
    if (isVideo && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isVideo]);

  const handleClick = () => {
    if (isVideo) {
      onOpenVideo(project.video);
    } else if (project.link) {
      window.open(project.link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <article
      className="proj-card"
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onClick={handleClick}
      tabIndex={0}
      role="button"
      aria-label={isVideo ? `Watch ${project.title}` : `View ${project.title}`}
    >
      <div className="proj-card__glow" aria-hidden="true" />
      <div className="proj-card__inner">
        <div className="proj-card__top">
          <span className="proj-card__id">{String(project.id).padStart(2, "0")}</span>
          <span className="proj-card__category">{project.category}</span>
        </div>

        <div className="proj-card__thumb">
          {isVideo ? (
            <>
              <video
                ref={videoRef}
                src={project.video}
                className="proj-card__media"
                muted
                loop
                playsInline
                preload="metadata"
              />
              <div className="proj-card__play" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path d="M8 5v14l11-7z" fill="currentColor" />
                </svg>
              </div>
            </>
          ) : (
            <img
              src={project.image}
              alt={project.title}
              className="proj-card__media"
              loading="lazy"
            />
          )}
        </div>

        <h3 className="proj-card__title">{project.title}</h3>
        <p className="proj-card__desc">{project.description}</p>

        <span className="proj-card__link">
          {isVideo ? "Watch video" : "View project"}
          <svg viewBox="0 0 24 24" width="13" height="13">
            {isVideo ? (
              <path d="M8 5v14l11-7z" fill="currentColor" />
            ) : (
              <path
                d="M7 17L17 7M17 7H8M17 7v9"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </svg>
        </span>
      </div>
    </article>
  );
}

export default function Project() {
  const [openVideo, setOpenVideo] = useState(null);

  const headingRef = useRef(null);
  const mouseRef = useRef(null);
  const letterRafRef = useRef(null);
  const sectionRef = useRef(null);
  const endSentinelRef = useRef(null);
  const cueFiredRef = useRef(false);

  // duplicate the list so the marquee loops seamlessly at -50%
  const loopItems = [...projects, ...projects];

  // ---- fire a cue once the visitor is nearing the end of the Projects
  // section, so the Contact page (rendered further down the same
  // scrolling page) can start priming its video ahead of time instead
  // of waiting until it's fully in view. ----
  useEffect(() => {
    const sentinel = endSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !cueFiredRef.current) {
            cueFiredRef.current = true;
            window.dispatchEvent(new Event("contact-video-cue"));
          }
        });
      },
      // rootMargin pulls the trigger point up so it fires a bit BEFORE
      // the sentinel is actually visible — i.e. "just before the end"
      { threshold: 0, rootMargin: "0px 0px -20% 0px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // ambient magnetic letter-tilt effect on the "PROJECTS" heading
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
        el.style.color =
          currents[i].scale > 1.05
            ? `hsl(42, 100%, ${50 + (currents[i].scale - 1) * 120}%)`
            : "#d4a537";
        el.style.textShadow =
          currents[i].scale > 1.05
            ? `0 0 ${20 * (currents[i].scale - 1) * 4}px rgba(212,165,55,0.7)`
            : "0 0 60px rgba(212,165,55,0.35)";
      });

      letterRafRef.current = requestAnimationFrame(animate);
    };

    letterRafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(letterRafRef.current);
  }, []);

  const handleSectionMouseMove = (e) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };
  };
  const handleSectionMouseLeave = () => {
    mouseRef.current = null;
  };

  const headingLetters = "PROJECTS".split("").map((char, i) => (
    <span key={i} className="proj-letter">
      {char}
    </span>
  ));

  return (
    <section
      className="project-section"
      id="projects"
      ref={sectionRef}
      onMouseMove={handleSectionMouseMove}
      onMouseLeave={handleSectionMouseLeave}
    >
      <div className="project-section__noise" aria-hidden="true" />
      <div className="project-section__vignette" aria-hidden="true" />
      <div className="project-bg-text" aria-hidden="true">
        UI/UX DESIGNER
      </div>

      <header className="project-section__header">
        <span className="project-section__eyebrow">Selected Work</span>
        <h2 className="project-section__title" ref={headingRef}>
          {headingLetters}
        </h2>
        <p className="project-section__sub">
          Hover a card to pause and tilt it toward you — click to open the
          site or watch the video.
        </p>
      </header>

      <div className="marquee">
        <div className="marquee__track">
          {loopItems.map((project, i) => (
            <Card
              project={project}
              key={`${project.id}-${i}`}
              onOpenVideo={setOpenVideo}
            />
          ))}
        </div>
      </div>

      {/* invisible marker near the bottom of the section — used only to
          detect "the visitor is about to leave Projects" */}
      <div ref={endSentinelRef} className="project-end-sentinel" aria-hidden="true" />

      {openVideo && (
        <div className="video-modal" onClick={() => setOpenVideo(null)}>
          <div
            className="video-modal-inner"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="video-modal-close"
              onClick={() => setOpenVideo(null)}
              aria-label="Close video"
            >
              ✕
            </button>
            <video src={openVideo} controls autoPlay />
          </div>
        </div>
      )}
    </section>
  );
}