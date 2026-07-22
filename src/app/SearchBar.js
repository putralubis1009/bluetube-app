"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { videoData } from "./database"; // Pastikan path ini sesuai dengan lokasi database.js kamu

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const wrapperRef = useRef(null);

  // Daftar pencarian populer (Bisa kamu ganti teksnya sesuai selera)
  const popularSearches = ["Viral", "Mahasiswi", "Indo", "Jepang", "Tandem"];

  // Efek untuk mencari saran video saat user mengetik (Pencarian Luas)
  useEffect(() => {
    if (query.trim().length > 1) {
      // 1. Pecah apa yang diketik menjadi kata-kata terpisah (misal: "Viral SMA" jadi ["viral", "sma"])
      const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);

      const results = videoData
        .filter((video) => {
          if (video.genre === 'BOCIL') return false; // Tetap sembunyikan video rahasia
          
          // 2. Gabungkan Judul dan Genre agar jangkauan pencarian lebih luas
          const textToSearch = `${video.title} ${video.genre}`.toLowerCase();
          
          // 3. Pastikan setiap kata yang diketik ada di dalam gabungan teks tadi (urutan bebas)
          return searchTerms.every(term => textToSearch.includes(term));
        })
        .slice(0, 5); // Tetap batasi 5 saran
      
      setSuggestions(results);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  // Efek untuk menutup dropdown jika user mengklik di luar kotak pencarian
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fungsi saat tombol Enter atau logo Search ditekan
  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/?cari=${encodeURIComponent(query)}`);
      setIsFocused(false);
    } else {
      router.push(`/`); // Reset ke beranda jika dikosongkan
    }
  };

  // Fungsi saat user mengklik salah satu saran atau pencarian populer
  const handleSuggestionClick = (teks) => {
    setQuery(teks);
    router.push(`/?cari=${encodeURIComponent(teks)}`);
    setIsFocused(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full z-50">
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Cari video premium..."
          className="w-full px-5 py-2.5 bg-[#0a1128] border border-[#00f0ff]/30 text-white text-sm md:text-base rounded-full focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] transition-all placeholder-slate-500"
        />
        <button
          type="submit"
          className="absolute right-1 top-1/2 -translate-y-1/2 p-2 bg-[#00f0ff] text-[#03050a] rounded-full hover:bg-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </button>
      </form>

      {/* DROPDOWN MENU KECERDASAN PENCARIAN */}
      {isFocused && (
        <div className="absolute left-0 right-0 mt-2 bg-[#0a1128] border border-[#00f0ff]/20 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] overflow-hidden transition-all">
          
          {/* Kondisi 1: Kotak pencarian masih kosong (Tampilkan Trending) */}
          {query.trim().length === 0 && (
            <div className="p-4">
              <p className="text-xs font-semibold text-[#00f0ff] mb-3 flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 0 0-1.071-.136 9.742 9.742 0 0 0-3.539 6.176 7.547 7.547 0 0 1-1.705-1.715.75.75 0 0 0-1.152-.082A9 9 0 1 0 15.68 4.534a7.46 7.46 0 0 1-2.717-2.248ZM15.75 14.25a3.75 3.75 0 1 1-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 0 1 1.925-3.546 3.75 3.75 0 0 1 3.255 3.718Z" clipRule="evenodd" />
                </svg>
                Pencarian Populer Hari Ini
              </p>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((tag, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(tag)}
                    className="px-3 py-1.5 bg-white/5 hover:bg-[#00f0ff]/20 hover:text-[#00f0ff] border border-white/5 rounded-lg text-xs text-slate-300 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Kondisi 2: User sedang mengetik (Tampilkan Saran Auto-complete) */}
          {query.trim().length > 1 && suggestions.length > 0 && (
            <ul className="py-2">
              {suggestions.map((item, index) => (
                <li key={index}>
                  <button
                    type="button"
                    onClick={() => handleSuggestionClick(item.title)}
                    className="w-full text-left px-4 py-2.5 hover:bg-white/5 text-slate-300 hover:text-[#00f0ff] text-sm flex items-center gap-3 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 opacity-50">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                    <span className="truncate">{item.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Kondisi 3: Tidak ada hasil (Kosong) */}
          {query.trim().length > 1 && suggestions.length === 0 && (
            <div className="p-4 text-center text-xs text-slate-500">
              Tidak ada video yang cocok dengan "{query}"
            </div>
          )}

        </div>
      )}
    </div>
  );
}