import { FC } from 'react';

import Image from 'next/image';
import recordingGif from '/public/recording.gif'

interface SpeechToTextProps {
  content: string;
  updateFunc: (transcription: string) => void;
}

import { useSpeechRecognition } from 'react-speech-kit';

const SpeechToText: FC<SpeechToTextProps> = ({ content, updateFunc }) => {

  const { listen, listening, stop } = useSpeechRecognition({
    onResult: (result: string) => {
      updateFunc(content + result);
    }
  });

  const startListening = () => {
    listen({ interimResults: false, lang: 'en-US' });
  }

  return (
    <>
      {listening === false &&
        <div>
          <button
            onClick={startListening}
            className="pt-5 pb-5 mt-5 mb-5 text-xs h-32 w-32 md:w-32 md:text-base lg:w-48 bg-green-500 hover:bg-red-500 text-white font-bold py-2 rounded focus:outline-none focus:shadow-outline"
          >
            🎤 Dictate
          </button>
        </div>}

      {listening &&
        <div>
          <button onClick={stop} className="mx-2 text-xs w-16 md:w-32 md:text-base lg:w-48 bg-red-500 hover:bg-red-700 text-white font-bold py-2 rounded focus:outline-none focus:shadow-outline">
            Stop
          </button>
          <Image
            alt="Recording gif"
            width={75}
            height={75}
            src={recordingGif} />
        </div>
      }
    </>
  )
}

export default SpeechToText
