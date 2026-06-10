const { PDFParse } = require("pdf-parse");

const parsePdfText = async (fileBuffer) => {
  try {
    const uint8Array = new Uint8Array(
      fileBuffer.buffer,
      fileBuffer.byteOffset,
      fileBuffer.byteLength
    );
    const parser = new PDFParse(uint8Array);
    const data = await parser.getText();
    return data.text;
  } catch (error) {
    console.error("PDF Parse Error details:", error);
    const parseError = new Error("Failed to parse resume PDF file content");
    parseError.statusCode = 400;
    throw parseError;
  }
};

module.exports = {
  parsePdfText,
};
