import express from "express";
import multer from "multer";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import pdfParse from "pdf-parse"; // To parse PDF content
import Tesseract from "tesseract.js"; // OCR library

// Initialize Google Generative AI (Gemini API)
const genAI = new GoogleGenerativeAI("YOUR_GEMINI_API_KEY");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Set up file upload using multer (in-memory storage)
const upload = multer({ storage: multer.memoryStorage() });

// Initialize express
const app = express();
app.use(cors()); // Enable CORS for frontend communication

// Perform OCR on image-based PDF content
const performOCR = async (imageBuffer) => {
  return new Promise((resolve, reject) => {
    Tesseract.recognize(imageBuffer, "eng", {
      logger: (m) => console.log(m),
    })
      .then(({ data: { text } }) => resolve(text))
      .catch((err) => reject(err));
  });
};

// Endpoint to process the PDF file, extract text, and convert to HTML
const processPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    const pdfBuffer = req.file.buffer;

    // Parse PDF to extract content (assuming it's image-based)
    const parsedPDF = await pdfParse(pdfBuffer);
    const imageBuffer = parsedPDF.image; // Extract image buffer

    // Perform OCR to extract text from the image
    const extractedText = await performOCR(imageBuffer);

    // Send the extracted text to the Gemini API for HTML generation
    const prompt = `Convert the following extracted text to HTML: \n${extractedText}`;
    const result = await model.generateContent(prompt);

    // Get the generated response from the Gemini API
    const response = result.response;
    const generatedHTML = response.text;

    // Send the result back to the frontend
    res.json({ originalText: extractedText, aiResponse: generatedHTML });
  } catch (err) {
    console.error(err);
    res.status(500).send("Unexpected Error!!!");
  }
};

// Route to upload the PDF file
app.post("/test", upload.single("file"), processPDF);

// Start the server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
