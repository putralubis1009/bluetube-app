import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { password } = await request.json();
    
    // Ganti password rahasia sesuai keinginanmu di sini
    const PASSWORD_BOCIL = "227980"; 

    if (password === PASSWORD_BOCIL) {
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