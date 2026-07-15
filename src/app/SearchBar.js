"use client";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const router = useRouter();

  // Fungsi untuk menangkap ketikan dan mengubah URL
  const handleSearch = (e) => {
    const text = e.target.value;
    if (text) {
      router.push(`/?cari=${text}`);
    } else {
      router.push(`/`);
    }
  };

  return (
    <input
      type="text"
      onChange={handleSearch}
      placeholder="Cari video premium..."
      className="w-full px-5 py-3 bg-[#0a1128]/60 border border-[#00ff9d] rounded-full text-white text-sm focus:outline-none focus:ring-0 focus:shadow-[0_0_15px_rgba(0,255,157,0.3)] focus:bg-[#0a1128]/90 transition-all placeholder-gray-400"
    />
  );
}