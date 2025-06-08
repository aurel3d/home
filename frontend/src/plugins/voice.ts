import { ref, watch } from 'vue';
import axios from 'axios';
import { useDeviceStore } from '@/stores/device';

export function useVoice() {
  const listening = ref(false);
  const transcript = ref('');
  const error = ref('');
  let mediaRecorder: MediaRecorder | null = null;
  let chunks: BlobPart[] = [];

  const start = async () => {
    error.value = '';
    transcript.value = '';
    // Clear previous errors and transcript
    if (!navigator.mediaDevices?.getUserMedia) {
      error.value = 'Audio capture not supported in this browser';
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(stream);
      } catch (e: any) {
        // Handle MediaRecorder init errors
        if (e.name === 'NotFoundError') {
          error.value = 'No microphone found. Please connect a microphone and try again.';
        } else if (e.name === 'NotAllowedError' || e.name === 'SecurityError') {
          error.value = 'Microphone access denied. Please allow microphone access in your browser.';
        } else if (e.name === 'NotSupportedError') {
          error.value = 'MediaRecorder is not supported in this browser.';
        } else {
          error.value = e.message || 'Could not start recording';
        }
        return;
      }
      mediaRecorder = recorder;
      mediaRecorder.ondataavailable = (e) => { chunks.push(e.data); };
      mediaRecorder.onstop = async () => {
        listening.value = false;
        const blob = new Blob(chunks, { type: 'audio/wav' });
        chunks = [];
        try {
          const form = new FormData();
          form.append('audio', blob, 'speech.wav');
          const response = await axios.post('/api/speech', form, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          transcript.value = response.data.text;
          handleCommand(transcript.value);
        } catch (e: any) {
          error.value = e.message || 'Speech recognition error';
        }
      };
      chunks = [];
      mediaRecorder.start();
      listening.value = true;
    } catch (e: any) {
      if (e instanceof DOMException) {
        switch (e.name) {
          case 'NotAllowedError':
          case 'SecurityError':
            error.value = 'Microphone access denied. Please allow microphone access in your browser.';
            break;
          case 'NotFoundError':
            error.value = 'No microphone found. Please connect a microphone and try again.';
            break;
          case 'NotReadableError':
            error.value = 'Microphone is already in use by another application.';
            break;
          case 'InvalidStateError':
            error.value = 'Recording failed to start. Please try again.';
            break;
          default:
            error.value = e.message;
        }
      } else {
        error.value = e.message || 'Could not start audio capture';
      }
    }
  };

  const stop = () => {
    if (mediaRecorder && listening.value) {
      mediaRecorder.stop();
    }
  };

  const handleCommand = async (text: string) => {
    const ds = useDeviceStore();
    await ds.fetchDevices();
    const lower = text.toLowerCase();
    if (lower.includes('turn on light') || lower.includes('allume la lumière')) {
      for (const device of ds.devices) {
        if (device.type === 'light') {
          ds.controlDevice(device.id, { on: true });
        }
      }
    }
    // TODO: extend with more commands
  };

  return { listening, transcript, error, start, stop };
}