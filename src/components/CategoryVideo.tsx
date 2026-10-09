import { useEffect, useRef, useState } from "react";

interface Props {
  src: string | null;
}

export default function CategoryVideo({ src }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentSrc, setCurrentSrc] = useState<string | null>(src);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (src === currentSrc) return;

    setFading(true);
    const timer = setTimeout(() => {
      setCurrentSrc(src);
      setFading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [src, currentSrc]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay may be blocked before user interaction; that's fine
      });
    }
  }, [currentSrc]);

  if (!currentSrc) return null;

  return (
    <div className={`category-video ${fading ? "fading" : ""}`}>
      <video
        ref={videoRef}
        key={currentSrc}
        src={currentSrc}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />
      <div className="category-video-overlay" />
    </div>
  );
}