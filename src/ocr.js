import { createWorker } from 'tesseract.js';

async function getTextFromImage(imageFile) {
  const worker = await createWorker('eng'); // 'eng' for English
  const ret = await worker.recognize(imageFile);
  await worker.terminate();
  return ret.data.text;
}