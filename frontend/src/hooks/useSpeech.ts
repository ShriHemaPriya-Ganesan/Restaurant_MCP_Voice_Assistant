import { useRef, useState } from 'react';

export function useSpeech(onFinal: (text: string) => void) {
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const SpeechRecognition: any =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  function start() {
    if (!SpeechRecognition) return alert('Browser not supported. Use Chrome.');
    const rec = new SpeechRecognition();
    rec.lang = 'en-US';
    rec.interimResults = true;
    rec.continuous = false;

    rec.onresult = (e: any) => {
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
      }
      if (final) {
        setTranscript(final);
        onFinal(final);
      }
    };

    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
  }

  function stop() {
    recognitionRef.current?.stop();
  }

  return { transcript, listening, start, stop };
}

export function speak(text: string) {
  if (!text) return;
  const ut = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(ut);
}
