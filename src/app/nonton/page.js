"use client";
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { videoData } from "../database";

function HlsVideoPlayer({ src }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null); // Gunakan ref untuk menyimpan instance HLS
  const [levels, setLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(-1);
  const [lastTap, setLastTap] = useState(0);

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
    };
  }, [src]);

  // Handle Play/Pause, Skip/Rewind
  const handleContainerClick = (e) => {
    const now = Date.now();
    if (now - lastTap < 300) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      videoRef.current.currentTime += (x < rect.width / 2) ? -5 : 5;
      setLastTap(0);
    } else {
      setLastTap(now);
      videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause();
    }
  };

  // Handle Change Quality
  const changeQuality = (index) => {
    setCurrentLevel(index);
    if (hlsRef.current) {
      hlsRef.current.currentLevel = index;
    }
  };

  return (
    <div className="relative group w-full h-full">
      <div className="absolute inset-0 z-10 cursor-pointer" onClick={handleContainerClick} />
      
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

  const relatedVideos = videoData.filter(v => v.genre === genre && v.url !== videoUrl).slice(0, 8);

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <button onClick={() => router.push('/')} className="mb-6 px-5 py-2 rounded-full border border-[#00ff9d] text-[#00ff9d] text-sm hover:bg-[#00ff9d] hover:text-[#03050a] transition-all">
        &#8592; Kembali
      </button>

      <div className="bg-black rounded-xl border border-[#00f0ff]/20 overflow-hidden mb-6 relative aspect-video">
        {videoUrl ? <HlsVideoPlayer src={videoUrl} /> : <div className="absolute inset-0 flex items-center justify-center text-red-500">Video tidak ditemukan!</div>}
      </div>

      <div className="p-5 bg-[#0a1128]/80 border border-[#00f0ff]/10 rounded-xl">
        <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
        <span className="text-xs font-bold text-[#03050a] bg-[#00f0ff] px-3 py-1 rounded-md">{genre}</span>
      </div>

      {relatedVideos.length > 0 && (
        <div className="mt-10">
          <h3 className="mb-5 text-lg font-semibold text-white border-l-4 border-[#00f0ff] pl-3">Rekomendasi</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedVideos.map((item, i) => (
              <div key={i} onClick={() => router.push(`/nonton?url=${encodeURIComponent(item.url)}&title=${encodeURIComponent(item.title)}&genre=${encodeURIComponent(item.genre)}&thumb=${encodeURIComponent(item.thumb)}`)} className="cursor-pointer">
                <img src={item.thumb} className="rounded-lg w-full h-24 object-cover" />
                <h3 className="text-sm mt-2 text-white truncate">{item.title}</h3>
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