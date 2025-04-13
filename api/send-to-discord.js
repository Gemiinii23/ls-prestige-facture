import { IncomingForm } from "formidable";
import fs from "fs";
import fetch from "node-fetch";
import FormData from "form-data"; // Make sure to use the correct `FormData` class

export const config = {
  api: {
    bodyParser: false, // Disable the default body parser to handle raw data
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const form = new IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parsing error:", err);
      return res.status(500).send("Form parsing failed");
    }

    try {
      const file = files.file?.[0]; 
      if (!file || !file.filepath) {
        throw new Error("File not found in request");
      }

      const webhookUrl = process.env.REACT_APP_DISCORD_WEBHOOK_URL;
      const stream = fs.createReadStream(file.filepath);

      const formData = new FormData();
      formData.append("file", stream, file.originalFilename || "facture.pdf");

      const response = await fetch(webhookUrl, {
        method: "POST",
        body: formData,
        headers: formData.getHeaders(), 
      });

      if (!response.ok) {
        throw new Error(`Discord responded with ${response.status}`);
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Sending to Discord failed:", error);
      res.status(500).send("Failed to send to Discord");
    }
  });
}
