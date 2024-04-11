import React from 'react';
import { useSpeechRecognition } from 'react-speech-kit';

function SpeechToText({ content, updateFunc }) {
  const { listen, listening, stop } = useSpeechRecognition({
    onResult: (result) => {
      updateFunc(content + '\n' + result);
    },
  });

  return (
    <div>
      <button onMouseDown={listen} onMouseUp={stop}>
        🎤 Dictate
      </button>
      {listening && <div>Go ahead I'm listening</div>}
    </div>
  );
}

export default SpeechToText;
