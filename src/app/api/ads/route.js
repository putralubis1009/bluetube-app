// src/app/api/ads/route.js
import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI; // Pastikan URL MongoDB kamu ada di file .env
const client = new MongoClient(uri);

// MENGAMBIL DATA IKLAN (Untuk User & Admin)
export async function GET() {
  try {
    await client.connect();
    const db = client.db('bluetube'); // Sesuaikan nama database kamu
    const ads = await db.collection('ads').find({}).toArray();
    return NextResponse.json(ads);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data iklan' }, { status: 500 });
  }
}

// MENAMBAH IKLAN BARU (Untuk Admin)
export async function POST(req) {
  try {
    const { link, url } = await req.json();
    await client.connect();
    const db = client.db('bluetube');
    
    const result = await db.collection('ads').insertOne({ link, url, createdAt: new Date() });
    return NextResponse.json({ success: true, message: 'Iklan berhasil ditambahkan' });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menambah iklan' }, { status: 500 });
  }
}

// MENGHAPUS IKLAN (Untuk Admin)
export async function DELETE(req) {
  try {
    const { id } = await req.json();
    await client.connect();
    const db = client.db('bluetube');
    
    await db.collection('ads').deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true, message: 'Iklan berhasil dihapus' });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus iklan' }, { status: 500 });
  }
}