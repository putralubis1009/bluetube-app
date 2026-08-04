import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { videoData } from '../../database'; // Mengambil data lama dari database.js

// Ambil link rahasia dari file .env
const uri = process.env.MONGODB_URI;

// FUNGSI GET: Menggabungkan data MongoDB dan data lama database.js
export async function GET() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('bluetube');
    
    // 1. Ambil video baru dari MongoDB, urutkan dari yang terbaru
    const mongoVideos = await db.collection('videos').find({}).sort({ createdAt: -1 }).toArray();
    
    // Format _id MongoDB agar jadi string
    const formattedMongoVideos = mongoVideos.map(vid => ({
      ...vid,
      _id: vid._id.toString(),
    }));

    // 2. Format data lama dari database.js supaya punya _id tiruan
    const formattedStaticVideos = videoData.map((vid, index) => ({
      ...vid,
      _id: `static-${index}`,
    }));

    // 3. GABUNGKAN: Data baru dari MongoDB ditaruh di atas, data lama di bawahnya
    const semuaVideo = [...formattedMongoVideos, ...formattedStaticVideos];

    return NextResponse.json(semuaVideo, { status: 200 });
  } catch (error) {
    console.error("Alamak, gagal ambil data dari MongoDB:", error);
    
    // Fallback: Jika koneksi database gagal, minimal tampilkan data lama
    const fallbackVideos = videoData.map((vid, index) => ({
      ...vid,
      _id: `static-${index}`,
    }));
    return NextResponse.json(fallbackVideos, { status: 200 });
  } finally {
    await client.close();
  }
}

// FUNGSI POST: SUDAH DIGEMBOK SISI SERVER
export async function POST(request) {
  const client = new MongoClient(uri);

  try {
    const body = await request.json();
    
    // TANGKAP PASSWORD DARI FORM ADMIN JUGA
    const { title, genre, thumb, url, password } = body;

    // SATPAM JALUR BELAKANG: Cek apakah password cocok dengan yang ada di Vercel
    if (password !== process.env.ADMIN_PASSWORD) {
      console.log("Ada penyusup nyoba masuk pakai password salah!");
      return NextResponse.json({ error: 'Password Salah! Akses Ditolak.' }, { status: 401 });
    }

    // Kalau password benar, baru buka pintu ke MongoDB
    await client.connect();
    const db = client.db('bluetube');
    const collection = db.collection('videos');

    const result = await collection.insertOne({
      title,
      genre,
      thumb,
      url,
      createdAt: new Date(),
    });

    console.log("Paten Bang! Data sukses mendarat di MongoDB:", result);
    return NextResponse.json({ message: 'Sukses nyimpan ke MongoDB!' }, { status: 200 });
    
  } catch (error) {
    console.error("Alamak, error masukin data:", error);
    return NextResponse.json({ error: 'Gagal nyimpan' }, { status: 500 });
  } finally {
    await client.close();
  }
}