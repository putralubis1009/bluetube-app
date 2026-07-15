"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation"; 
import { videoData } from "./database"; // Mengambil data dari gudang pusat

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const kataKunci = searchParams.get('cari') || ""; 
  const [activeGenre, setActiveGenre] = useState('all');
  
  const genres = [
    { id: 'all', label: 'Semua Kategori' },
    { id: 'BARAT', label: 'BARAT' },
    { id: 'JEPANG', label: 'JEPANG' },
    { id: 'INDO', label: 'INDO' },
    { id: 'VIRAL', label: 'VIRAL' },
  ];

  const filteredVideos = videoData.filter(video => {
    const cocokKategori = activeGenre === 'all' || video.genre === activeGenre;
    const cocokKataKunci = video.title.toLowerCase().includes(kataKunci.toLowerCase());
    return cocokKategori && cocokKataKunci;
  });

  const handlePlayVideo = (video) => {
    const query = new URLSearchParams({
      title: video.title,
      genre: video.genre,
      url: video.url,
      thumb: video.thumb
    }).toString();
    router.push(`/nonton?${query}`);
  };

  return (
    <main>
      <div className="flex gap-2.5 overflow-x-auto pb-3 mb-6 scrollbar-hide">
        {genres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => setActiveGenre(genre.id)}
            className={`px-4 md:px-5 py-2 rounded-full whitespace-nowrap text-sm font-['Poppins'] transition-all duration-300 border ${
              activeGenre === genre.id 
                ? 'bg-[#00f0ff] text-[#03050a] font-semibold border-[#00f0ff]' 
                : 'bg-[#0a1128]/50 text-slate-400 border-[#00f0ff]/30 hover:bg-[#00f0ff] hover:text-[#03050a] hover:border-[#00f0ff]'
            }`}
          >
            {genre.label}
          </button>
        ))}
      </div>

      <h3 className="mb-5 text-lg font-semibold text-white border-l-4 border-[#00f0ff] pl-3">
        {kataKunci ? `Hasil Pencarian: "${kataKunci}"` : "Jelajahi Beranda"}
      </h3>

      {filteredVideos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5">
          {filteredVideos.map((item, index) => (
            <div 
              key={index} 
              onClick={() => handlePlayVideo(item)}
              className="bg-[#0a1128]/40 border border-white/5 rounded-xl overflow-hidden hover:-translate-y-1.5 hover:border-[#00f0ff] hover:shadow-[0_10px_25px_rgba(0,240,255,0.15)] transition-all duration-300 cursor-pointer"
            >
              <div className="h-[100px] md:h-[130px] bg-[#0a1128] w-full relative group">
                <img src={item.thumb} alt={item.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="p-2 md:p-4 relative z-10">
                <h3 className="text-[#f8fafc] text-[11px] md:text-[14px] mb-2 line-clamp-2 leading-snug">{item.title}</h3>
                <span className="text-[9px] md:text-[11px] font-semibold text-[#00ff9d] bg-[#00ff9d]/10 px-2 py-1 rounded-md border border-[#00ff9d]/20">
                  {item.genre}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-[#0a1128]/20 rounded-xl border border-white/5">
          <p className="text-slate-400">Video tidak ditemukan.</p>
        </div>
      )}
    </main>
  );
}

export default function Home() {
  return <Suspense><HomeContent /></Suspense>;
}