import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { MqttService } from './services/mqtt';
import { DeviceService } from './services/device';
import { apiRouter } from './routes/api';
import multer from 'multer';
import { spawn } from 'child_process';
import { newRecognizer } from './services/speech';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true
  }
});

const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
app.use(express.json());

// Voice command endpoint: upload audio (supports various formats), transcribe via Vosk
const upload = multer({ storage: multer.memoryStorage() });
app.post('/api/speech', upload.single('audio'), (req, res) => {
  if (!req.file || !req.file.buffer) {
    return res.status(400).json({ error: 'No audio file provided' });
  }
  const sampleRate = parseInt(process.env.VOSK_SAMPLE_RATE || '16000', 10);
  const recognizer = newRecognizer(sampleRate);

  // Convert audio to raw PCM s16le using ffmpeg
  const ffmpeg = spawn('ffmpeg', [
    '-loglevel', 'error',
    '-i', 'pipe:0',
    '-ar', sampleRate.toString(),
    '-ac', '1',
    '-f', 's16le',
    'pipe:1',
  ]);
  ffmpeg.on('error', err => {
    console.error(`ffmpeg spawn error: ${err}`);
    res.status(500).json({ error: 'Audio processing error' });
  });
  ffmpeg.stderr.on('data', data => console.error(`ffmpeg stderr: ${data}`));

  ffmpeg.stdout.on('data', chunk => recognizer.acceptWaveform(chunk));
  ffmpeg.stdout.on('end', () => {
    const result = recognizer.finalResult();
    res.json({ text: result.text });
  });

  // Pipe uploaded audio to ffmpeg
  ffmpeg.stdin.end(req.file.buffer);
});

const deviceService = new DeviceService();
const mqttService = new MqttService(deviceService, io);

app.use('/api', apiRouter(deviceService, mqttService));

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  mqttService.connect();
});