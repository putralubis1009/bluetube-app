"use client";
import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation"; 
import { videoData } from "./database"; 

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const kataKunci = searchParams.get('cari') || ""; 
  const [activeGenre, setActiveGenre] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Jumlah item per halaman

  const genres = [
    { id: 'all', label: 'Semua Kategori' },
    { id: 'BARAT', label: 'BARAT' },
    { id: 'JEPANG', label: 'JEPANG' },
    { id: 'INDO', label: 'INDO' },
    { id: 'VIRAL', label: 'VIRAL' },
    { id: 'RUSIA', label: 'RUSIA' },
    { id: 'MAHASISWI', label: 'MAHASISWI' },
    { id: 'HIJAB', label: 'HIJAB' },
    { id: 'SMA', label: 'SMA' },
    { id: 'SELINGKUH', label: 'SELINGKUH' },
    { id: 'ASIA', label: 'ASIA' },
    { id: 'TOBRUT', label: 'TOBRUT' },
  ];

  // Filter video berdasarkan genre dan pencarian
  const filteredVideos = videoData.filter(video => {
    const cocokKategori = activeGenre === 'all' || video.genre === activeGenre;
    const cocokKataKunci = video.title.toLowerCase().includes(kataKunci.toLowerCase());
    return cocokKategori && cocokKataKunci;
  });

  // Reset ke halaman 1 jika filter atau pencarian berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [activeGenre, kataKunci]);

  // Logika Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVideos = filteredVideos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredVideos.length / itemsPerPage);

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
      {/* Genre Container dengan Flex Wrap */}
      <div className="flex flex-wrap gap-2.5 mb-6">
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

      {/* Grid Video */}
      {currentVideos.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5">
            {currentVideos.map((item, index) => (
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="px-4 py-2 bg-[#0a1128] border border-white/10 rounded-lg text-white text-sm hover:border-[#00f0ff] disabled:opacity-30 transition-all"
              >
                Prev
              </button>
              
              <span className="text-white text-sm px-3">
                {currentPage} / {totalPages}
              </span>

              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="px-4 py-2 bg-[#0a1128] border border-white/10 rounded-lg text-white text-sm hover:border-[#00f0ff] disabled:opacity-30 transition-all"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 bg-[#0a1128]/20 rounded-xl border border-white/5">
          <p className="text-slate-400">Video tidak ditemukan.</p>
        </div>
      )}{/* FOOTER */}
<footer className="mt-20 py-10 border-t border-white/10 text-center">
  <div className="flex flex-col items-center gap-3">
    {/* Pastikan file logo.png ada di folder 'public' */}
    <img src="/logo.png" alt="Logo Bluetube" className="h-12 w-auto opacity-80 hover:opacity-100 transition-opacity" />
    
    <p className="text-slate-500 text-sm font-['Poppins']">
      &copy; {new Date().getFullYear()} Bluetube. All rights reserved.
    </p>
    
    <p className="text-slate-600 text-xs">
      Build with BLUETUBEID 
    </p>
  </div>
</footer>
    </main>
  );
}

export default function Home() {
  return <Suspense><HomeContent /></Suspense>;
}