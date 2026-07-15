import "./globals.css";
import SearchBar from "./SearchBar"; // <- Memanggil komponen SearchBar

export const metadata = {
  title: "BLUETUBEID - Premium Video",
  description: "Website streaming video premium",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#03050a] text-[#e4e4e7] font-['Poppins'] min-h-screen">
        
        <div className="w-full max-w-7xl mx-auto px-4 py-5 md:px-6">
          <nav className="flex flex-col md:flex-row justify-between items-center pb-5 border-b border-[#00f0ff]/15 mb-6 gap-4 md:gap-0">
            
            <div className="flex items-center gap-3 cursor-pointer">
              <img 
                src="https://bluetubeid.xyz/wp-content/uploads/2026/07/Gemini_Generated_Image_weti0iweti0iweti.webp" 
                alt="BLUETUBEID Logo" 
                className="h-[38px] md:h-[50px] w-auto object-contain"
              />
              <h1 className="m-0 text-[32px] md:text-[42px] font-bold tracking-[3px] uppercase text-white leading-tight drop-shadow-[0_4px_15px_rgba(255,255,255,0.15)]">
                BLUE<span className="text-[#00f0ff] drop-shadow-[0_0_10px_rgba(0,240,255,0.7)]">TUBEID</span>
              </h1>
            </div>

            <div className="w-full md:max-w-[400px] relative">
              {/* --- KOTAK PENCARIAN ASLI DIPASANG DI SINI --- */}
              <SearchBar />
            </div>
            
          </nav>

          {children}
        </div>

      </body>
    </html>
  );
}