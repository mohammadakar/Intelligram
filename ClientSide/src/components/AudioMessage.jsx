import { useRef, useState } from "react";
import { FaPause, FaPlay } from "react-icons/fa";

const AudioMessage = ({ url }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex items-center">
      <button 
        onClick={togglePlay}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white mr-2"
      >
        {isPlaying ? <FaPause size={12} /> : <FaPlay size={12} />}
      </button>
      
      <div className="flex items-end h-6">
        {/* Waveform visualization */}
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className="w-1 bg-blue-400 mx-px"
            style={{ 
              height: `${Math.floor(Math.random() * 12) + 4}px`,
              opacity: `${0.2 + (i / 20)}`
            }}
          />
        ))}
      </div>
      
      <audio 
        ref={audioRef} 
        src={url} 
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
    </div>
  );
};

export default AudioMessage;