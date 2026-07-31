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
  const itemsPerPage = 10;

  // --- STATE UNTUK LOCK & MODAL PASSWORD ---
  const [isBocilUnlocked, setIsBocilUnlocked] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    { id: 'BOCIL', label: 'BOCIL 🔒' }, // Ikon gembok indikator
  ];

  // 1. FILTER VIDEO PINTAR: Mencakup pengecekan urutan kata bebas dan lintas kategori
  const filteredVideos = videoData.filter(video => {
    // Sembunyikan genre BOCIL jika di "Semua Kategori"
    if (activeGenre === 'all' && video.genre === 'BOCIL') {
      return false;
    }

    // Cek Kategori (Sesuai tombol menu yang diklik)
    const cocokKategori = activeGenre === 'all' || video.genre === activeGenre;

    // Cek Kata Kunci (Pencarian Luas)
    const searchTerms = kataKunci.toLowerCase().split(' ').filter(term => term.length > 0);
    const textToSearch = `${video.title} ${video.genre}`.toLowerCase();
    
    // Jika kotak pencarian kosong, anggap cocok. Jika ada isinya, cek apakah semua kata ada di textToSearch
    const cocokKataKunci = searchTerms.length === 0 || searchTerms.every(term => textToSearch.includes(term));

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

  // 2. LOGIKA KLIK KATEGORI
  const handleGenreClick = (genreId) => {
    if (genreId === 'BOCIL' && !isBocilUnlocked) {
      // Tampilkan Modal Password jika belum unlocked
      setShowPasswordModal(true);
      setErrorMessage('');
      setPasswordInput('');
    } else {
      setActiveGenre(genreId);
    }
  };

  // 3. LOGIKA VERIFIKASI PASSWORD
  const handleVerifyPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });

      const data = await response.json();

      if (data.success) {
        setIsBocilUnlocked(true);
        setActiveGenre('BOCIL');
        setShowPasswordModal(false);
      } else {
        setErrorMessage(data.message || 'Password salah!');
      }
    } catch (error) {
      setErrorMessage('Terjadi kesalahan koneksi.');
    } finally {
      setIsLoading(false);
    }
  };

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
      {/* Genre Container */}
      <div className="flex flex-wrap gap-2.5 mb-6">
        {genres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => handleGenreClick(genre.id)}
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
                {/* PERUBAHAN THUMBNAIL DI SINI: Menggunakan object-contain & bg-black agar foto tidak terpotong */}
                <div className="h-[120px] md:h-[150px] bg-black w-full relative group flex items-center justify-center overflow-hidden">
                  <img 
                    src={item.thumb} 
                    alt={item.title} 
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" 
                  />
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
      )}

      {/* --- MODAL POPUP PASSWORD IN-SCREEN --- */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0a1128] border border-[#00f0ff]/40 rounded-2xl p-6 md:p-8 w-full max-w-md shadow-[0_0_50px_rgba(0,240,255,0.2)] transition-all">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              🔒 Konten Terkunci
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              Kategori ini dilindungi. Silakan dapatkan password melalui Bot Telegram kami terlebih dahulu.
            </p>

            <a
              href="https://t.me/BluetubeidBOT" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 mb-6 rounded-xl bg-[#0088cc]/10 border border-[#0088cc]/50 text-[#0088cc] hover:bg-[#0088cc] hover:text-white font-semibold text-sm transition-all"
            >
              ✈️ Klik Disini Untuk Meminta Password^^
            </a>

            <form onSubmit={handleVerifyPassword} className="space-y-4">
              <div>
                <input 
                  type="password" 
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Masukkan Password..."
                  autoFocus
                  className="w-full px-4 py-3 bg-[#03050a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] transition-all"
                />
                {errorMessage && (
                  <p className="text-red-400 text-xs mt-2">{errorMessage}</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 text-sm transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !passwordInput}
                  className="px-5 py-2.5 rounded-xl bg-[#00f0ff] text-[#03050a] font-semibold text-sm hover:shadow-[0_0_15px_rgba(0,240,255,0.5)] disabled:opacity-50 transition-all"
                >
                  {isLoading ? 'Memeriksa...' : 'Buka Akses'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="mt-20 py-10 border-t border-white/10 text-center">
        <div className="flex flex-col items-center gap-3">
          <img 
            src="/Gemini_Generated_Image_weti0iweti0iweti.webp" 
            alt="Logo Bluetube" 
            className="h-24 w-auto opacity-90 hover:opacity-100 transition-opacity" 
          />
          <p className="text-slate-500 text-sm font-['Poppins']">
            &copy; {new Date().getFullYear()} Bluetube. All rights reserved.
          </p>
          <p className="text-slate-600 text-xs">BLUETUBEID</p>
        </div>
      </footer>
    </main>
  );
}

export default function Home() {
  return <Suspense><HomeContent /></Suspense>;
}