// src/app/admin/ads/page.js
"use client";
import { useState, useEffect } from "react";

export default function AdminAds() {
  // --- STATE KUNCI KEAMANAN (Wajib FALSE di awal) ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // --- STATE DATA IKLAN ---
  const [ads, setAds] = useState([]);
  const [link, setLink] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // --- FUNGSI VERIFIKASI KE API ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsVerifying(true);

    try {
      const response = await fetch('/api/verify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });

      const data = await response.json();

      if (data.success) {
        setIsLoggedIn(true);
      } else {
        alert("⚠️ Password Salah! Akses Ditolak.");
        setPasswordInput("");
      }
    } catch (error) {
      alert("Terjadi kesalahan koneksi saat memeriksa password.");
    } finally {
      setIsVerifying(false);
    }
  };

  // --- FUNGSI AMBIL DATA IKLAN ---
  const fetchAds = async () => {
    try {
      const res = await fetch("/api/ads");
      const data = await res.json();
      setAds(data);
    } catch (error) {
      console.error("Gagal mengambil data iklan", error);
    }
  };

  // Hanya ambil data iklan jika SUDAH LOGIN
  useEffect(() => {
    if (isLoggedIn) {
      fetchAds();
    }
  }, [isLoggedIn]);

  // --- FUNGSI TAMBAH IKLAN ---
  const handleAddAd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ link, url }),
      });
      setLink("");
      setUrl("");
      fetchAds();
    } catch (error) {
      alert("Gagal menambahkan iklan");
    } finally {
      setLoading(false);
    }
  };

  // --- FUNGSI HAPUS IKLAN ---
  const handleDeleteAd = async (id) => {
    if (!confirm("Yakin ingin menghapus banner iklan ini?")) return;
    try {
      await fetch("/api/ads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchAds();
    } catch (error) {
      alert("Gagal menghapus iklan");
    }
  };

  // ==========================================
  // TAMPILAN 1: LAYAR KUNCI (BELUM LOGIN)
  // ==========================================
  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-transparent px-4">
        <form 
          onSubmit={handleLogin} 
          className="bg-[#0a1128] p-8 rounded-2xl border border-[#00f0ff]/30 shadow-[0_0_30px_rgba(0,240,255,0.1)] w-full max-w-sm text-center mt-10"
        >
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 bg-[#00f0ff]/10 rounded-full flex items-center justify-center border border-[#00f0ff]/40">
              <span className="text-2xl">🔒</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Akses Terbatas</h2>
          <p className="text-slate-400 text-sm mb-6">Sistem diamankan. Masukkan password admin.</p>
          
          <input
            type="password"
            required
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="Password..."
            className="w-full p-4 mb-4 bg-[#03050a] border border-white/20 rounded-xl focus:border-[#00f0ff] outline-none text-white text-center tracking-widest transition-all"
            autoFocus
          />
          
          <button 
            type="submit" 
            disabled={isVerifying}
            className="w-full py-3.5 bg-[#00f0ff] text-[#03050a] font-bold rounded-xl hover:bg-white transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] disabled:opacity-50"
          >
            {isVerifying ? 'Memeriksa...' : 'Buka Panel Admin'}
          </button>
        </form>
      </div>
    );
  }

  // ==========================================
  // TAMPILAN 2: PANEL ADMIN (SUDAH LOGIN)
  // ==========================================
  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 text-white min-h-screen bg-transparent mt-5">
      
      {/* Header & Tombol Logout */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-[#00f0ff]">Panel Admin Iklan (Ads)</h1>
        <button 
          onClick={() => {
            setIsLoggedIn(false);
            setPasswordInput("");
          }}
          className="px-4 py-2 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors text-sm font-bold"
        >
          Keluar (Logout)
        </button>
      </div>

      {/* --- FORM TAMBAH IKLAN --- */}
      <form onSubmit={handleAddAd} className="bg-[#0a1128] p-6 rounded-xl border border-white/10 mb-12 shadow-lg">
        <div className="mb-5">
          <label className="block mb-2 text-sm font-semibold text-slate-300">Link Tujuan (Saat Diklik)</label>
          <input 
            type="url" required value={link} onChange={(e) => setLink(e.target.value)}
            placeholder="Contoh: https://barges88..." 
            className="w-full p-3 bg-[#03050a] border border-white/20 rounded-lg focus:border-[#00f0ff] outline-none text-white transition-colors"
          />
        </div>
        <div className="mb-6">
          <label className="block mb-2 text-sm font-semibold text-slate-300">URL Gambar / Video Banner (.jpg, .webm, .mp4)</label>
          <input 
            type="url" required value={url} onChange={(e) => setUrl(e.target.value)}
            placeholder="Contoh: https://cdn.bluetubeid.xyz/banner.webm" 
            className="w-full p-3 bg-[#03050a] border border-white/20 rounded-lg focus:border-[#00f0ff] outline-none text-white transition-colors"
          />
        </div>
        <button disabled={loading} type="submit" className="px-8 py-3 bg-[#00f0ff] text-[#03050a] font-bold rounded-lg hover:bg-white transition-all disabled:opacity-50">
          {loading ? "Menyimpan..." : "+ Tambah Iklan"}
        </button>
      </form>

      {/* --- DAFTAR IKLAN TERDAFTAR --- */}
      <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
        <h2 className="text-2xl font-bold text-white border-l-4 border-[#00f0ff] pl-3">Daftar Iklan Aktif</h2>
        <span className="bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30 px-4 py-1.5 rounded-full text-sm font-bold">Total: {ads.length} Iklan</span>
      </div>

      {/* Tampilan Jika Kosong */}
      {ads.length === 0 ? (
        <div className="text-center py-16 bg-[#0a1128]/50 rounded-xl border border-dashed border-white/20">
          <p className="text-slate-400">Belum ada iklan yang terdaftar. Silakan tambahkan melalui form di atas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map((ad, index) => {
            const isVideo = ad.url.match(/\.(webm|mp4)$/i);
            return (
              <div key={ad._id} className="bg-[#0a1128] p-4 rounded-xl border border-white/10 relative group hover:border-[#00f0ff]/50 transition-all shadow-lg">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-[#03050a] bg-[#00f0ff] px-2 py-1 rounded">Slot #{index + 1}</span>
                  <button onClick={() => handleDeleteAd(ad._id)} className="bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500 hover:text-white px-3 py-1 rounded-md text-xs font-bold transition-all">
                    Hapus
                  </button>
                </div>
                <div className="w-full aspect-[21/9] bg-black rounded-lg overflow-hidden mb-4 border border-white/5 flex items-center justify-center relative">
                  {isVideo ? (
                    <video autoPlay loop muted playsInline className="w-full h-auto object-cover"><source src={ad.url} /></video>
                  ) : (
                    <img src={ad.url} alt="Banner Preview" className="w-full h-auto object-cover" />
                  )}
                </div>
                <div className="bg-[#03050a] p-3 rounded-lg border border-white/5">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-semibold">Link Tujuan</p>
                  <a href={ad.link} target="_blank" rel="noopener noreferrer" className="text-sm text-[#00f0ff] hover:underline truncate block">{ad.link}</a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}