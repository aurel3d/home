import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { MqttService } from './services/mqtt';
import { DeviceService } from './services/device';
import { apiRouter } from './routes/api';
import multer from 'multer';
import wav from 'wav';
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

// Voice command endpoint: upload WAV audio, transcribe via Vosk
const upload = multer({ storage: multer.memoryStorage() });
app.post('/api/speech', upload.single('audio'), (req, res) => {
  if (!req.file || !req.file.buffer) {
    return res.status(400).json({ error: 'No audio file provided' });
  }
  const reader = new wav.Reader();
  reader.on('format', (format) => {
    const recognizer = newRecognizer(format.sampleRate);
    reader.on('data', (data) => recognizer.acceptWaveform(data));
    reader.on('end', () => {
      const result = recognizer.finalResult();
      res.json({ text: result.text });
    });
  });
  reader.on('error', (err) => res.status(500).json({ error: err.message }));
  reader.end(req.file.buffer);
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