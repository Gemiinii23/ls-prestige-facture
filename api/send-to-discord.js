// /api/send-to-discord.js
import formidable from "formidable";
import fs from "fs";
import FormData from "form-data";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Formidable error:", err);
      return res.status(500).json({ error: "Error parsing form data" });
    }

    const file = files.file;
    if (!file) return res.status(400).json({ error: "No file provided" });

    try {
      const formData = new FormData();
      formData.append("file", fs.createReadStream(file.filepath));
      formData.append("payload_json", JSON.stringify({ content: "📎 Nouvelle facture en pièce jointe" }));

      const response = await fetch(process.env.WEBHOOK_URL, {
        method: "POST",
        body: formData,
        headers: formData.getHeaders(),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }

      res.status(200).json({ success: true });
    } catch (e) {
      console.error("Sending to Discord failed:", e);
      res.status(500).json({ error: "Failed to send to Discord" });
    }
  });
}
