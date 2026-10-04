// api/webhook.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const body = req.body;
    // Itemku mengirim data dalam array data atau langsung
    const orders = body.data || [body];

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    for (const order of orders) {
      const orderId = order.order_id || 'N/A';
      const orderNumber = order.order_number || 'OD...';
      const gameName = order.game_name || 'Game';
      const productName = order.product_name || 'Produk';
      const price = order.price || 0;
      const buyerName = order.buyer_name || 'Pembeli';

      // Format Pesan Notifikasi untuk Telegram
      const message = `🚨 *PESANAN BARU ITEMKU MASUK!* 🚨\n\n` +
                      `🆔 *Order ID:* ${orderId} (${orderNumber})\n` +
                      `🎮 *Game:* ${gameName}\n` +
                      `📦 *Produk:* ${productName}\n` +
                      `💰 *Harga:* Rp ${price.toLocaleString('id-ID')}\n` +
                      `👤 *Pembeli:* ${buyerName}\n` +
                      `⚡ *Status:* REQUIRE_PROCESS\n\n` +
                      `_Segera proses pesanan di dashboard toko Anda!_`;

      // Kirim otomatis ke Telegram Bot Anda
      if (botToken && chatId) {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown'
          })
        });
      }
    }

    return res.status(200).json({ success: true, message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
