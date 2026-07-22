import { NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "T8599769359:AAGohi5rYqCBn1L6nXS5GDam4KViKjyFonk"; 
const PASSWORD_AKSES = "227980"; 
const TELEGRAM_PRIBADI_KAMU = "BluetubeIDofficial"; // Tanpa @

async function sendTelegramAPI(method, payload) {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function POST(request) {
  try {
    const body = await request.json();

    // ==========================================
    // 1. JIKA ADA PESAN TEKS MASUK (/start)
    // ==========================================
    if (body.message && body.message.text) {
      const chatId = body.message.chat.id;
      const replyMarkup = {
        inline_keyboard: [
          [ { text: "🎬 Ajukan Rekomendasi Genre Film", url: `https://t.me/${TELEGRAM_PRIBADI_KAMU}` } ],
          [ { text: "🔑 Dapatkan Password", callback_data: "req_password" } ]
        ]
      };

      await sendTelegramAPI('sendMessage', {
        chat_id: chatId,
        text: "Selamat datang di *BLUETUBEID* 🚀\nSilahkan pilih tujuan kamu di bawah ini:",
        parse_mode: 'Markdown',
        reply_markup: replyMarkup
      });
      return NextResponse.json({ ok: true });
    }

    // ==========================================
    // 2. JIKA ADA KLIK TOMBOL (Callback Query)
    // ==========================================
    if (body.callback_query) {
      const chatId = body.callback_query.message.chat.id;
      const messageId = body.callback_query.message.message_id;
      const data = body.callback_query.data;
      const callbackId = body.callback_query.id;

      // Hentikan loading di tombol user secepatnya
      await sendTelegramAPI('answerCallbackQuery', {
        callback_query_id: callbackId,
      });

      // --- ALUR JIKA KLIK "DAPATKAN PASSWORD" ---
      if (data === "req_password") {
        
        // TAHAP 1: Tampilkan HANYA link Linsumgo (Tanpa tombol SUDAH)
        const step1Markup = {
          inline_keyboard: [
            [ { text: "🌐 Buka Linsumgo.com", url: "https://linsumgo.com" } ]
          ]
        };

        await sendTelegramAPI('editMessageText', {
          chat_id: chatId,
          message_id: messageId,
          text: "Untuk mendapatkan password, silakan klik link di bawah ini dan *baca artikel selama 10 detik*.\n\n⏳ _Mohon tunggu, tombol konfirmasi akan muncul dalam 10 detik..._",
          parse_mode: 'Markdown',
          reply_markup: step1Markup
        });

        // JEDA WAKTU (DELAY) SELAMA 10 DETIK (10000 milidetik)
        await new Promise(resolve => setTimeout(resolve, 10000));

        // TAHAP 2: Munculkan tombol "SUDAH" setelah 10 detik
        const step2Markup = {
          inline_keyboard: [
            [ { text: "🌐 Buka Linsumgo.com", url: "https://linsumgo.com" } ],
            [ { text: "✅ SUDAH", callback_data: "confirm_read" } ] // Tombol SUDAH ditambahkan
          ]
        };

        await sendTelegramAPI('editMessageText', {
          chat_id: chatId,
          message_id: messageId,
          text: "Untuk mendapatkan password, silakan klik link di bawah ini dan *baca artikel selama 10 detik*.\n\n✨ Silakan klik tombol *SUDAH* jika kamu telah selesai.",
          parse_mode: 'Markdown',
          reply_markup: step2Markup
        });
      }

      // --- ALUR JIKA KLIK "SUDAH" ---
      if (data === "confirm_read") {
        await sendTelegramAPI('editMessageText', {
          chat_id: chatId,
          message_id: messageId,
          text: `Terima kasih! 🎉\n\nPassword untuk akses website adalah:\n\`${PASSWORD_AKSES}\`\n\n_Salin password di atas dan kembali ke website._`,
          parse_mode: 'Markdown'
        });
      }
    }

    return NextResponse.json({ ok: true });
    
  } catch (error) {
    console.error("Error Webhook:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}