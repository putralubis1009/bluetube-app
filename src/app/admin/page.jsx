"use client";
import { useState } from "react";

export default function AdminPage() {
  const [isLocked, setIsLocked] = useState(true);
  const [passwordInput, setPasswordInput] = useState("");
  const [savedPassword, setSavedPassword] = useState(""); // Nyimpan password ke memori
  const [loginError, setLoginError] = useState("");

  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [thumb, setThumb] = useState("");
  const [url, setUrl] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (!passwordInput) {
      setLoginError("Isi dulu passwordnya, Bang!");
      return;
    }
    // Form terbuka, tapi belum tentu bisa nyimpan. Penentunya nanti di API.
    setSavedPassword(passwordInput);
    setIsLocked(false);
    setLoginError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg("Loading...");
    try {
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Selipkan password ke paket data yang dikirim ke API
        body: JSON.stringify({ title, genre, thumb, url, password: savedPassword }),
      });

      const data = await res.json();

      // Kalau API bilang statusnya 401 (Unauthorized / Password Salah)
      if (res.status === 401) {
        setIsLocked(true); // Gembok lagi halamannya
        setPasswordInput("");
        setSavedPassword("");
        setLoginError("Password salah, Bang! Ketahuan kau nyusup ya.");
        setStatusMsg("");
      } else if (res.ok) {
        setStatusMsg("Mantap kali! Video sukses masuk database.");
        setTitle(""); setGenre(""); setThumb(""); setUrl("");
      } else {
        setStatusMsg(data.error || "Alamak, gagal nyimpan data.");
      }
    } catch (error) {
      setStatusMsg("Error jaringan, Bang.");
    }
  };

  if (isLocked) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl w-full max-w-sm shadow-[0_0_20px_rgba(0,136,204,0.3)]">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">🔒 Gembok Admin</h2>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Masukkan Password Rahasia
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-black"
                placeholder="Password..."
                autoFocus
              />
              {loginError && <p className="text-red-500 text-sm mt-2 font-medium">{loginError}</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-all"
            >
              Buka Pintu
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl w-full max-w-md">
        
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Tambah Video Baru</h2>
            <button 
              onClick={() => {
                setIsLocked(true);
                setPasswordInput("");
                setSavedPassword("");
              }} 
              className="text-sm text-red-500 font-semibold hover:underline bg-red-50 px-3 py-1 rounded-md"
            >
              🔒 Kunci Lagi
            </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Judul Video (Title)</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:border-blue-500 text-black" placeholder="Ketik judul videonya..." required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Genre</label>
            <input type="text" value={genre} onChange={(e) => setGenre(e.target.value)} className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:border-blue-500 text-black" placeholder="Misal: Action, Drama, dll..." required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Thumbnail (Thumb)</label>
            <input type="text" value={thumb} onChange={(e) => setThumb(e.target.value)} className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:border-blue-500 text-black" placeholder="Link URL gambar cover videonya..." required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">URL R2 (master.m3u8)</label>
            <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:border-blue-500 text-black" placeholder="https://r2.abang.com/video/master.m3u8" required />
          </div>
          
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-all mt-4">
            Simpan ke Database
          </button>
          
          {statusMsg && (
            <p className={`text-center font-semibold text-sm mt-3 ${statusMsg.includes("gagal") || statusMsg.includes("Error") ? "text-red-500" : "text-green-600"}`}>
              {statusMsg}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}