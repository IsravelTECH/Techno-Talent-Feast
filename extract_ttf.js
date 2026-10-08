import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function extract() {
  const buf = fs.readFileSync('E:/Techno School/TTF Booklet 2026 Final.pdf');
  const uint8 = new Uint8Array(buf);
  const parser = new PDFParse(uint8);
  const textResult = await parser.getText();
  
  console.log('Result type:', typeof textResult, Object.keys(textResult));
  const fullText = typeof textResult === 'string' ? textResult : (textResult.text || JSON.stringify(textResult, null, 2));
  fs.writeFileSync('extracted_ttf_booklet.txt', fullText, 'utf-8');
  console.log('Successfully saved to extracted_ttf_booklet.txt, length:', fullText.length);
}

extract().catch(console.error);
