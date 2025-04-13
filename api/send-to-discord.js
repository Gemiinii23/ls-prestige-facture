import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false, // Needed for file uploads
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhookUrl = process.env.REACT_APP_DISCORD_WEBHOOK_URL;

  const form = new formidable.IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parse error:', err);
      return res.status(500).json({ error: 'Failed to parse form' });
    }

    const pdfFile = files.file;
    if (!pdfFile) {
      return res.status(400).json({ error: 'No file provided' });
    }

    try {
      const fileStream = fs.createReadStream(pdfFile.filepath);

      const discordRes = await fetch(webhookUrl, {
        method: 'POST',
        body: (() => {
          const formData = new FormData();
          formData.append('file', fileStream, 'facture.pdf');
          return formData;
        })(),
      });

      if (!discordRes.ok) {
        throw new Error(`Discord error: ${discordRes.status}`);
      }

      res.status(200).json({ success: true });
    } catch (err) {
      console.error('Discord upload failed:', err);
      res.status(500).json({ error: 'Failed to send PDF to Discord' });
    }
  });
}
