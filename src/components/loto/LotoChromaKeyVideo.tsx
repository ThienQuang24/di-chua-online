import React, { useEffect, useRef, useState } from 'react';

interface LotoChromaKeyVideoProps {
  videoSrc?: string;
  fallbackImage: string;
  alt?: string;
  className?: string;
  isGreenScreen?: boolean;
  chromaKeyColor?: string; // hex color e.g. '#00FF00'
  tolerance?: number; // 0 - 100
  smoothness?: number; // 0 - 100
}

export const LotoChromaKeyVideo: React.FC<LotoChromaKeyVideoProps> = ({
  videoSrc,
  fallbackImage,
  alt = 'Vũ công biểu diễn',
  className = '',
  isGreenScreen = false,
  chromaKeyColor = '#00FF00',
  tolerance = 45,
  smoothness = 15,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [useFallback, setUseFallback] = useState(!videoSrc);
  const animFrameRef = useRef<number | null>(null);

  const isWebmAlpha = videoSrc?.endsWith('.webm');

  // Parse chroma key color to RGB
  const keyRgb = React.useMemo(() => {
    let hex = chromaKeyColor.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
    const num = parseInt(hex, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  }, [chromaKeyColor]);

  useEffect(() => {
    if (!videoSrc) {
      setUseFallback(true);
      return;
    }

    setUseFallback(false);
    setVideoLoaded(false);

    const video = videoRef.current;
    if (!video) return;

    video.src = videoSrc;
    video.load();

    const handleCanPlay = () => {
      setVideoLoaded(true);
      video.play().catch(() => {
        // Autoplay policy fallback
      });
    };

    const handleError = () => {
      console.warn(`[ChromaKeyVideo] Video failed to load: ${videoSrc}, falling back to image`);
      setUseFallback(true);
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [videoSrc]);

  // Real-time canvas chroma-key loop for Green Screen MP4
  useEffect(() => {
    if (!videoLoaded || useFallback || isWebmAlpha || !isGreenScreen) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let isActive = true;

    const renderFrame = () => {
      if (!isActive) return;

      if (video.readyState >= 2 && !video.paused && !video.ended) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth || 300;
          canvas.height = video.videoHeight || 400;
        }

        const width = canvas.width;
        const height = canvas.height;

        ctx.drawImage(video, 0, 0, width, height);

        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;
        const len = data.length;

        const targetR = keyRgb.r;
        const targetG = keyRgb.g;
        const targetB = keyRgb.b;

        const tolDist = (tolerance / 100) * 441.67; // max distance sqrt(255^2 * 3)
        const smoothDist = (smoothness / 100) * 100;

        for (let i = 0; i < len; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Euclidean distance in RGB color space
          const dr = r - targetR;
          const dg = g - targetG;
          const db = b - targetB;
          const dist = Math.sqrt(dr * dr + dg * dg + db * db);

          if (dist < tolDist) {
            data[i + 3] = 0; // Completely transparent
          } else if (dist < tolDist + smoothDist) {
            // Feather edge
            const alpha = ((dist - tolDist) / smoothDist) * 255;
            data[i + 3] = Math.min(data[i + 3], alpha);

            // De-spill green edges
            if (targetG > targetR && targetG > targetB) {
              data[i + 1] = Math.min(g, (r + b) / 2);
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
      }

      animFrameRef.current = requestAnimationFrame(renderFrame);
    };

    renderFrame();

    return () => {
      isActive = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [videoLoaded, useFallback, isWebmAlpha, isGreenScreen, keyRgb, tolerance, smoothness]);

  return (
    <div className={`relative flex items-center justify-center overflow-hidden ${className}`}>
      {/* Hidden Video Source */}
      {videoSrc && (
        <video
          ref={videoRef}
          crossOrigin="anonymous"
          playsInline
          muted
          loop
          autoPlay
          className={
            isWebmAlpha && videoLoaded && !useFallback
              ? 'w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.85)]'
              : 'hidden'
          }
        />
      )}

      {/* Chroma Key Canvas (Active for Green Screen MP4) */}
      {!isWebmAlpha && videoLoaded && !useFallback && isGreenScreen && (
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.85)]"
        />
      )}

      {/* Fallback Image or Loading Placeholder */}
      {(useFallback || !videoLoaded) && (
        <img
          src={fallbackImage}
          alt={alt}
          className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.85)]"
        />
      )}
    </div>
  );
};
