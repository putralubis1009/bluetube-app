// src/app/api/verify-admin/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { password } = await request.json();
    
    // ⬇️ Ganti password khusus Admin di sini ⬇️
    const PASSWORD_ADMIN = "admin100902"; 

    if (password === PASSWORD_ADMIN) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, message: "Password salah! Akses ditolak." }, 
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server." }, 
      { status: 500 }
    );
  }
}