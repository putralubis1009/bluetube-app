import { NextResponse } from 'next/server';
import Redis from 'ioredis';

// Membaca REDIS_URL dari file .env.local untuk koneksi
const redis = new Redis(process.env.REDIS_URL);

export async function POST(request) {
  try {
    const body = await request.json();
    const { videoUrl } = body;

    if (!videoUrl) {
      return NextResponse.json({ error: 'URL Video diperlukan' }, { status: 400 });
    }

    // Fungsi incr() dari ioredis akan otomatis mencatat/menambah view +1
    const newViews = await redis.incr(`views:${videoUrl}`);

    // Mengembalikan angka terbaru ke layar website
    return NextResponse.json({ views: newViews }, { status: 200 });

  } catch (error) {
    console.error("Database Redis Error:", error);
    return NextResponse.json({ error: 'Gagal memproses database' }, { status: 500 });
  }
}