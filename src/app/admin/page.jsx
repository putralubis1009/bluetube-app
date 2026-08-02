'use client';
import { useState } from 'react';

export default function AdminPanel() {
  const [status, setStatus] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('Sabar Bang, lagi nyimpan data ni...');

    // Ambil semua data dari form
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title');
    const genre = formData.get('genre');
    const thumb = formData.get('thumb');
    const url = formData.get('url');

    // Nembak ke jalur API kita
    const res = await fetch('/api/videos', {
      method: 'POST',
      body: JSON.stringify({ title, genre, thumb, url }),
      headers: { 'Content-Type': 'application/json' }
    });

    if (res.ok) {
      setStatus('Mantap kali! Video sukses masuk database.');
      e.currentTarget.reset(); // Kosongkan form biar bisa lanjut nambah yang lain
    } else {
      setStatus('Alamak, ada error sikit. Coba cek lagi Bang.');
    }
  }

  return (
    <div className="p-8 max-w-md mx-auto mt-10 bg-white rounded shadow-md text-black">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Tambah Video Baru</h1>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        {/* Input Title */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">Judul Video (Title)</label>
          <input 
            type="text" 
            name="title" 
            required 
            className="border border-gray-300 p-2 w-full rounded" 
            placeholder="Ketik judul videonya..." 
          />
        </div>

        {/* Input Genre */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">Genre</label>
          <input 
            type="text" 
            name="genre" 
            required 
            className="border border-gray-300 p-2 w-full rounded" 
            placeholder="Misal: Action, Drama, dll..." 
          />
        </div>

        {/* Input Thumbnail */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">Thumbnail (Thumb)</label>
          <input 
            type="text" 
            name="thumb" 
            required 
            className="border border-gray-300 p-2 w-full rounded" 
            placeholder="Link URL gambar cover videonya..." 
          />
        </div>
        
        {/* Input URL Video */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">URL R2 (master.m3u8)</label>
          <input 
            type="text" 
            name="url" 
            required 
            className="border border-gray-300 p-2 w-full rounded" 
            placeholder="https://r2.abang.com/video/master.m3u8" 
          />
        </div>
        
        <button 
          type="submit" 
          className="bg-blue-600 text-white p-2 rounded mt-4 hover:bg-blue-700 font-bold"
        >
          Simpan ke Database
        </button>
      </form>

      {/* Pesan status bakalan nongol di sini */}
      {status && <p className="mt-4 font-semibold text-center text-blue-600">{status}</p>}
    </div>
  );
}