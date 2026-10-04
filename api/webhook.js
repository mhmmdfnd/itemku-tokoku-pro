export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const itemkuHeader = req.headers['x-itemku'];
    const orderPayload = req.body;

    console.log('Received Tokoku Webhook from Itemku Header:', itemkuHeader);
    console.log('Order Data Payload:', JSON.stringify(orderPayload));

    // Extract order details from Tokoku API callback structure
    const orders = orderPayload?.data || [];

    // Send notifications to Telegram & WhatsApp asynchronously
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (telegramToken && chatId) {
      for (const order of orders) {
        const text = `🚨 *ORDER BARU ITEMKU MASUK!*\n\n` +
                     `📦 *No. Order:* \`${order.order_number}\`\n` +
                     `🎮 *Game:* ${order.game_name}\n` +
                     `🛍️ *Produk:* ${order.product_name}\n` +
                     `💰 *Pendapatan:* Rp ${order.order_income?.toLocaleString('id-ID')}\n` +
                     `👤 *Pembeli:* ${order.buyer_name}\n` +
                     `📋 *Required Info:* \`${order.required_information}\`\n\n` +
                     `_Segera proses di Dashboard Itemku Pro!_`;

        await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: text,
            parse_mode: 'Markdown'
          })
        });
      }
    }

    // Return HTTP 200 OK as required by Itemku documentation
    return res.status(200).json({ success: true, statusCode: 'SUCCESS', message: 'Webhook received and processed' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}