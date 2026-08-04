"use client";
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { videoData } from "../database";

// --- FORMAT WAKTU ---
const formatTime = (timeInSeconds) => {
  if (isNaN(timeInSeconds)) return "00:00";
  const h = Math.floor(timeInSeconds / 3600);
  const m = Math.floor((timeInSeconds % 3600) / 60);
  const s = Math.floor(timeInSeconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

function HlsVideoPlayer({ src }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hlsRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  // States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  // HLS Settings States
  const [levels, setLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(-1);
  const [showSettings, setShowSettings] = useState(false);

  // Initialize HLS / Video
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    if (Hls.isSupported()) {
      hlsRef.current = new Hls({
        startLevel: -1, // Auto by default
        maxBufferLength: 30,
        enableWorker: true,
        lowLatencyMode: true,
      });
      
      hlsRef.current.loadSource(src);
      hlsRef.current.attachMedia(video);
      
      hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
        setLevels(hlsRef.current.levels);
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Fallback iOS Native
      video.src = src;
    }

    return () => { 
      if (hlsRef.current) hlsRef.current.destroy(); 
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [src]);

  // Video Event Listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };
    const onLoadedMetadata = () => setDuration(video.duration);

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
    };
  }, []);

  // Control Visibility (Hide after 3s of inactivity)
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  };

  const handleMouseLeave = () => {
    if (isPlaying) setShowControls(false);
  };

  // Player Actions
  const togglePlay = () => {
    if (videoRef.current) {
      videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause();
    }
  };

  const skipTime = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    videoRef.current.volume = val;
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      videoRef.current.volume = volume > 0 ? volume : 1;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  // Fix Fullscreen untuk semua device termasuk iOS
  const toggleFullscreen = () => {
    const container = containerRef.current;
    const video = videoRef.current;

    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen(); // Safari Desktop
      } else if (video.webkitEnterFullscreen) {
        video.webkitEnterFullscreen(); // iOS iPhone Fallback
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const handleProgressScrub = (e) => {
    const newTime = parseFloat(e.target.value);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const changeQuality = (index) => {
    setCurrentLevel(index);
    if (hlsRef.current) {
      hlsRef.current.currentLevel = index;
    }
    setShowSettings(false);
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full bg-black group overflow-hidden select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleMouseMove}
    >
      <video 
        ref={videoRef} 
        className="w-full h-full object-contain outline-none" 
        playsInline 
        onClick={togglePlay}
        // Controls bawaan dimatikan agar diganti UI custom
        controls={false}
      />

      {/* --- HITBOX AREA UNTUK DOUBLE TAP (KIRI, TENGAH, KANAN) --- */}
      <div className="absolute inset-0 z-10 flex text-white opacity-0 transition-opacity">
        {/* Kiri - Mundur 10s */}
        <div className="w-1/3 h-full cursor-pointer" onDoubleClick={() => skipTime(-10)} />
        {/* Tengah - Play/Pause murni */}
        <div className="w-1/3 h-full cursor-pointer flex items-center justify-center" onClick={togglePlay} />
        {/* Kanan - Maju 10s */}
        <div className="w-1/3 h-full cursor-pointer" onDoubleClick={() => skipTime(10)} />
      </div>

      {/* --- KONTROL BAWAH (YOUTUBE STYLE) --- */}
      <div 
        className={`absolute bottom-0 left-0 right-0 z-20 px-4 pt-16 pb-2 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 ${
          showControls || !isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* PROGRESS BAR (COMPLEX) */}
        <div className="relative w-full h-2 group/progress cursor-pointer flex items-center mb-3">
          {/* Background Bar */}
          <div className="absolute w-full h-1 bg-white/30 rounded-full transition-all group-hover/progress:h-1.5" />
          {/* Buffer Bar */}
          <div 
            className="absolute h-1 bg-white/50 rounded-full transition-all group-hover/progress:h-1.5"
            style={{ width: `${(buffered / duration) * 100}%` }}
          />
          {/* Current Progress Bar */}
          <div 
            className="absolute h-1 bg-[#00f0ff] rounded-full transition-all group-hover/progress:h-1.5 z-10"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
          {/* Invisible Range Input untuk Dragging/Scrubbing akurat */}
          <input 
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            onChange={handleProgressScrub}
            className="absolute w-full h-full opacity-0 cursor-pointer z-20"
          />
          {/* Thumb Indicator (Titik) */}
          <div 
            className="absolute h-3.5 w-3.5 bg-[#00f0ff] rounded-full scale-0 group-hover/progress:scale-100 transition-transform z-30 shadow-lg pointer-events-none"
            style={{ left: `calc(${(currentTime / duration) * 100}% - 7px)` }}
          />
        </div>

        {/* BOTTOM BUTTONS */}
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            {/* Play/Pause Button */}
            <button onClick={togglePlay} className="hover:text-[#00f0ff] transition-colors">
              {isPlaying ? (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>

            {/* Volume Control */}
            <div className="hidden sm:flex items-center gap-2 group/vol relative">
              <button onClick={toggleMute} className="hover:text-[#00f0ff] transition-colors">
                {isMuted || volume === 0 ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                )}
              </button>
              <input 
                type="range" min="0" max="1" step="0.05" value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-0 opacity-0 group-hover/vol:w-20 group-hover/vol:opacity-100 transition-all duration-300 origin-left cursor-pointer accent-[#00f0ff]"
              />
            </div>

            {/* Timer */}
            <div className="text-sm font-medium tracking-wide">
              {formatTime(currentTime)} <span className="text-white/50">/</span> {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center gap-4 relative">
            {/* Settings (Quality) Menu */}
            {levels.length > 0 && (
              <div className="relative">
                {showSettings && (
                  <div className="absolute bottom-10 right-0 bg-[#1a1a1a]/95 backdrop-blur-md rounded-lg py-2 min-w-[120px] border border-white/10 shadow-2xl z-50">
                    <div className="px-4 py-1.5 text-xs text-white/50 font-bold border-b border-white/10 mb-1">Kualitas</div>
                    <button 
                      onClick={() => changeQuality(-1)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition-colors ${currentLevel === -1 ? 'text-[#00f0ff] font-bold' : 'text-white'}`}
                    >
                      Auto
                    </button>
                    {levels.map((level, index) => (
                      <button 
                        key={index} 
                        onClick={() => changeQuality(index)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition-colors ${currentLevel === index ? 'text-[#00f0ff] font-bold' : 'text-white'}`}
                      >
                        {level.height}p
                      </button>
                    ))}
                  </div>
                )}
                <button onClick={() => setShowSettings(!showSettings)} className="hover:text-[#00f0ff] transition-colors p-1 hover:rotate-45 duration-300">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.73,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.49-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></svg>
                </button>
              </div>
            )}

            {/* Fullscreen Button */}
            <button onClick={toggleFullscreen} className="hover:text-[#00f0ff] transition-colors p-1">
              {isFullscreen ? (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlayerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const title = searchParams.get('title') || "Memuat...";
  const genre = searchParams.get('genre') || "Premium";
  const videoUrl = searchParams.get('url') || "";

  const [viewers, setViewers] = useState(0);

  useEffect(() => {
    if (videoUrl) {
      const catatView = async () => {
        try {
          const response = await fetch('/api/views', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ videoUrl: videoUrl })
          });
          
          const data = await response.json();
          if (data.views) {
            setViewers(data.views);
          }
        } catch (error) {
          console.error("Gagal mengambil data views:", error);
        }
      };

      catatView();
    }
  }, [videoUrl]);

  const relatedVideos = videoData.filter(v => v.genre === genre && v.url !== videoUrl).slice(0, 8);

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <button onClick={() => router.push('/')} className="mb-6 px-5 py-2 rounded-full border border-[#00ff9d] text-[#00ff9d] text-sm hover:bg-[#00ff9d] hover:text-[#03050a] transition-all">
        &#8592; Kembali
      </button>

      {/* --- BANNER ANIMASI WEBM --- */}
      <div className="w-full max-w-[800px] mx-auto mb-6 relative group">
        <a href="https://barges88.click/register/J6409PQB" target="_blank" rel="noopener noreferrer" className="block w-full">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-auto rounded-xl border border-white/10 group-hover:border-[#00f0ff] group-hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all duration-300 block pointer-events-none"
          >
            <source src="https://cdn.bluetubeid.xyz/Desaintanpajudul-ezgif.com-gif-to-webm-converter.webm" />
          </video>
        </a>
      </div>

      {/* CONTAINER VIDEO */}
      <div className="bg-black rounded-xl border border-[#00f0ff]/20 overflow-hidden mb-6 relative aspect-video shadow-[0_0_30px_rgba(0,240,255,0.1)]">
        {videoUrl ? <HlsVideoPlayer src={videoUrl} /> : <div className="absolute inset-0 flex items-center justify-center text-red-500">Video tidak ditemukan!</div>}
      </div>

      <div className="p-5 bg-[#0a1128]/80 border border-[#00f0ff]/10 rounded-xl">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-3 gap-2">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          
          <div className="flex items-center gap-2 text-[#00ff9d] bg-[#00ff9d]/10 px-3 py-1.5 rounded-lg border border-[#00ff9d]/20 w-fit">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm font-semibold tracking-wide">
              {viewers.toLocaleString('id-ID')} Views
            </span>
          </div>
        </div>
        
        <span className="text-xs font-bold text-[#03050a] bg-[#00f0ff] px-3 py-1 rounded-md">{genre}</span>
      </div>

      {relatedVideos.length > 0 && (
        <div className="mt-10">
          <h3 className="mb-5 text-lg font-semibold text-white border-l-4 border-[#00f0ff] pl-3">Rekomendasi</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedVideos.map((item, i) => (
              <div key={i} onClick={() => router.push(`/nonton?url=${encodeURIComponent(item.url)}&title=${encodeURIComponent(item.title)}&genre=${encodeURIComponent(item.genre)}&thumb=${encodeURIComponent(item.thumb)}`)} className="cursor-pointer group">
                <div className="h-[100px] w-full relative overflow-hidden rounded-lg bg-black">
                  <img src={item.thumb} className="absolute inset-0 w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                </div>
                <h3 className="text-sm mt-2 text-slate-200 group-hover:text-[#00f0ff] truncate transition-colors">{item.title}</h3>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function NontonPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-white">Memuat Player...</div>}>
      <PlayerContent />
    </Suspense>
  );
}