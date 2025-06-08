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
    if (!navigator.mediaDevices?.getUserMedia) {
      error.value = 'Audio capture not supported in this browser';
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/wav; codecs=pcm' });
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
      error.value = e.message || 'Could not start audio capture';
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