import React from 'react';
import { useSpeechRecognition } from 'react-speech-kit';

function SpeechToText({ inputRef, updateFunc }) {
  const { listen, listening, stop } = useSpeechRecognition({
    onResult: (result) => {
      updateFunc(inputRef?.current?.value + '\n' + result);
    },
  });

  return (
    <div>
      <button onMouseDown={listen} onMouseUp={stop}>
        🎤 Dictate
      </button>
      {listening && <span className="text-white">Go ahead I'm listening</span>}
    </div>
  );
}

export default SpeechToText;
