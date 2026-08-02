import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

// Ambil link rahasia dari file .env
const uri = process.env.MONGODB_URI;

// 1. FUNGSI GET: Buat narik/menampilkan video ke beranda website
export async function GET() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('bluetube');
    // Ambil semua video, diurutkan dari yang paling baru di-upload
    const videos = await db.collection('videos').find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(videos, { status: 200 });
  } catch (error) {
    console.error("Alamak, gagal ambil data:", error);
    return NextResponse.json({ error: 'Gagal ambil data' }, { status: 500 });
  } finally {
    await client.close();
  }
}

// 2. FUNGSI POST: Buat nyimpan video baru dari halaman admin
export async function POST(request) {
  const client = new MongoClient(uri);

  try {
    const body = await request.json();
    const { title, genre, thumb, url } = body;

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