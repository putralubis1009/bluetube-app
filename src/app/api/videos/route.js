import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';


// Ambil link rahasia dari file .env
const uri = process.env.MONGODB_URI;

export async function POST(request) {
  // Bikin alat koneksi baru
  const client = new MongoClient(uri);

  try {
    // Nangkap data dari form abang
    const body = await request.json();
    const { title, genre, thumb, url } = body;

    // Mulai buka pintu ke MongoDB
    await client.connect();
    
    // Tentukan nama database (bluetube) dan nama tempat nyimpannya (videos)
    const db = client.db('bluetube');
    const collection = db.collection('videos');

    // Tembak datanya ke MongoDB!
    const result = await collection.insertOne({
      title,
      genre,
      thumb,
      url,
      createdAt: new Date(), // Sekalian nyatat waktu upload
    });

    console.log("Paten Bang! Data sukses mendarat di MongoDB:", result);
    return NextResponse.json({ message: 'Sukses nyimpan ke MongoDB!' }, { status: 200 });
    
  } catch (error) {
    console.error("Alamak, error masukin data:", error);
    return NextResponse.json({ error: 'Gagal nyimpan' }, { status: 500 });
  } finally {
    // Tutup pintunya lagi biar server nggak berat
    await client.close();
  }
}