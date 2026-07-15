"use client";
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { videoData } from "../database"; // Mengambil data dari gudang pusat

function HlsVideoPlayer({ src }) {
  const videoRef = useRef(null);
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;
    let hls;
    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    }
    return () => { if (hls) hls.destroy(); };
  }, [src]);
  return <video ref={videoRef} controls className="absolute top-0 left-0 w-full h-full bg-black outline-none" playsInline />;
}

function PlayerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const title = searchParams.get('title') || "Memuat...";
  const genre = searchParams.get('genre') || "Premium";
  const videoUrl = searchParams.get('url') || "";

  const relatedVideos = videoData.filter(v => v.genre === genre && v.url !== videoUrl).slice(0, 8);

  return (
    <div className="max-w-6xl mx-auto py-6">
      <button onClick={() => router.push('/')} className="mb-6 px-5 py-2 rounded-full border border-[#00ff9d] text-[#00ff9d] text-sm hover:bg-[#00ff9d] hover:text-[#03050a] transition-all">
        &#8592; Kembali
      </button>

      <div className="bg-black rounded-xl border border-[#00f0ff]/20 overflow-hidden mb-6 relative">
        <div className="w-full relative pt-[56.25%] bg-gray-900">
          {videoUrl ? <HlsVideoPlayer src={videoUrl} /> : <div className="absolute inset-0 flex items-center justify-center text-red-500">Error!</div>}
        </div>
        <div className="p-5 bg-[#0a1128]/80 border-t border-[#00f0ff]/10">
          <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
          <span className="text-xs font-bold text-[#03050a] bg-[#00f0ff] px-3 py-1 rounded-md">{genre}</span>
        </div>
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