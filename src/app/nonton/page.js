"use client";
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { videoData } from "../database";

function HlsVideoPlayer({ src }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const clickTimeoutRef = useRef(null);
  const [levels, setLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(-1);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    if (Hls.isSupported()) {
      hlsRef.current = new Hls({
        startLevel: 0,
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
      video.src = src;
    }

    return () => { 
      if (hlsRef.current) hlsRef.current.destroy(); 
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    };
  }, [src]);

  const handleContainerClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const isLeft = clickX < rect.width / 2;

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      
      if (videoRef.current) {
        videoRef.current.currentTime += isLeft ? -5 : 5;
      }
    } else {
      clickTimeoutRef.current = setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause();
        }
        clickTimeoutRef.current = null;
      }, 250);
    }
  };

  const changeQuality = (index) => {
    setCurrentLevel(index);
    if (hlsRef.current) {
      hlsRef.current.currentLevel = index;
    }
  };

  return (
    <div className="relative group w-full h-full">
      <div 
        className="absolute top-0 left-0 right-0 bottom-16 z-10 cursor-pointer" 
        onClick={handleContainerClick} 
      />
      
      <video 
        ref={videoRef} 
        controls 
        className="w-full h-full bg-black outline-none" 
        playsInline 
      />

      <div className="absolute top-4 right-4 z-20">
        <select 
          onChange={(e) => changeQuality(parseInt(e.target.value))}
          value={currentLevel}
          className="bg-black/70 text-white text-xs px-2 py-1 rounded border border-white/20 outline-none"
        >
          <option value="-1">Auto</option>
          {levels.map((level, index) => (
            <option key={index} value={index}>{level.height}p</option>
          ))}
        </select>
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

      {/* --- BANNER ANIMASI WEBM (SANGAT RINGAN) --- */}
      <div className="w-full max-w-[800px] mx-auto mb-6 relative group">
        <a href="https://barges88.click/register/J6409PQB" target="_blank" rel="noopener noreferrer" className="block w-full">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            // pointer-events-none memastikan klik pada video akan diteruskan ke link <a>
            className="w-full h-auto rounded-xl border border-white/10 group-hover:border-[#00f0ff] group-hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all duration-300 block pointer-events-none"
          >
            {/* GANTI src DENGAN NAMA FILE WEBM ANDA DI FOLDER PUBLIC */}
            <source src="https://cdn.bluetubeid.xyz/Desaintanpajudul-ezgif.com-gif-to-webm-converter.webm" />
          </video>
        </a>
      </div>
      {/* --------------------------------- */}

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
  return <Suspense><PlayerContent /></Suspense>;
}