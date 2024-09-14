document.getElementById("pdfForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const pdfFile = document.getElementById("pdfFile").files[0];
    if (!pdfFile) {
      alert("Please upload a PDF file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", pdfFile);

    try {
      // Send the PDF file to the server for OCR and Gemini processing
      const response = await fetch("https://resume-parser-1-sq00.onrender.com/test", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process the file.");
      }

      const result = await response.json();

      // Display the original extracted text and the generated HTML in the textarea
      document.getElementById("htmlResult").value = `Extracted Text:\n${result.originalText}\n\nGenerated HTML:\n${result.aiResponse}`;
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while processing the file.");
    }
});
