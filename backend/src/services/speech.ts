import { Model, Recognizer } from 'vosk';
import path from 'path';
import fs from 'fs';

let speechModel: Model;

// Initialize and cache the Vosk model
export function initSpeechModel(): Model {
  if (speechModel) return speechModel;
  // Allow overriding model path via env var
  const modelPath = process.env.VOSK_MODEL_PATH || path.resolve(__dirname, '../../models/vosk-model-small-fr');
  if (!fs.existsSync(modelPath)) {
    console.error(`Vosk model not found at ${modelPath}. Please download the French model and set VOSK_MODEL_PATH accordingly.`);
    process.exit(1);
  }
  speechModel = new Model(modelPath);
  console.log(`Loaded Vosk model from ${modelPath}`);
  return speechModel;
}

// Create a new Recognizer for a given sample rate
export function newRecognizer(sampleRate: number): Recognizer {
  const model = initSpeechModel();
  return new Recognizer({ model, sampleRate });
}
