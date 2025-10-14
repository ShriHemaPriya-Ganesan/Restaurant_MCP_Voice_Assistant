import React, { useState } from 'react';
import { useSpeech, speak } from '../hooks/useSpeech';
import './VoiceAssistant.css';

export const VoiceAssistant: React.FC = () => {
  const [reply, setReply] = useState('');
  const [tableId, setTableId] = useState<number | undefined>();
  const { transcript, listening, start, stop } = useSpeech(async (text) => {
    // Fetch reply from backend
    const resp = await fetch('/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, table_id: tableId }),
    });
    const data = await resp.json();
    setReply(data.reply || '(no reply)');
    speak(data.reply || '');
  });

  return (
    <div className="assistant-container">
      <div className="assistant-card">
        <h2 className="assistant-title">🎤 Restaurant AI Assistant</h2>

        <div className="assistant-inputs">
          <input
            type="number"
            className="assistant-input"
            placeholder="Table Number"
            value={tableId ?? ''}
            onChange={(e) => setTableId(Number(e.target.value))}
          />
        </div>

        <div className="mic-section">
          <button
            className={`mic-button ${listening ? 'active' : ''}`}
            onClick={listening ? stop : start}
          >
            <span className="mic-icon">🎙️</span>
          </button>
          <p className="mic-status">
            {listening ? 'Listening...' : 'Click to speak your order'}
          </p>
        </div>

        <div className="assistant-chat">
          <div className="chat-bubble user">
            <strong>You:</strong> {transcript || '—'}
          </div>
          <div className="chat-bubble bot">
            <strong>Assistant:</strong> {reply || '—'}
          </div>
        </div>
      </div>
    </div>
  );
};
