import { useState, useRef, useEffect } from 'react';
import { FiMessageCircle, FiX } from 'react-icons/fi';

export default function ChatbotLauncher() {
  const [visible, setVisible] = useState(false);

  const [pos, setPos] = useState({ x: null, y: null });

  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const buttonRef = useRef(null);

  function onMouseDown(e) {
    e.preventDefault();
    dragging.current = true;

    const rect = buttonRef.current.getBoundingClientRect();
    offset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  function onMouseMove(e) {
    if (!dragging.current) return;
    const newX = e.clientX - offset.current.x;
    const newY = e.clientY - offset.current.y;
    setPos({ x: newX, y: newY });
  }

  function onMouseUp() {
    dragging.current = false;
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  }

  useEffect(() => {
    function onResize() {
      if (pos.x !== null && pos.y !== null) {
        const maxX = window.innerWidth - 56; 
        const maxY = window.innerHeight - 56; 
        setPos({
          x: Math.min(pos.x, maxX),
          y: Math.min(pos.y, maxY)
        });
      }
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [pos]);

  const toggleChat = () => {
    setVisible(v => !v);
  };

  return (
    <>
      {/* Draggable launcher button */}
      <div
        ref={buttonRef}
        onMouseDown={onMouseDown}
        onClick={toggleChat}
        style={
          pos.x !== null && pos.y !== null
            ? { left: pos.x, top: pos.y, bottom: 'auto', right: 'auto' }
            : {}
        }
        className={`
          fixed
          ${pos.x === null && pos.y === null ? 'bottom-6 right-6' : ''}
          z-50
          w-14 h-14 bg-gradient-to-tr from-blue-600 to-purple-600
          text-white rounded-full shadow-lg flex items-center justify-center
          cursor-pointer select-none
        `}
      >
        <FiMessageCircle size={28} />
      </div>

      
      {visible && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-gradient-to-tr from-blue-600 to-purple-600 bg-opacity-50 p-4">
          <div className="relative w-full max-w-md h-[80vh] bg-white rounded-lg overflow-hidden shadow-xl">
            
            <button
              onClick={toggleChat}
              className="absolute top-2 right-2 text-gray-700 hover:text-gray-900"
            >
              <FiX size={24} />
            </button>

            
            <iframe
              title="Botpress Chatbot"
              src="https://cdn.botpress.cloud/webchat/v2.4/shareable.html?configUrl=https://files.bpcontent.cloud/2025/05/27/19/20250527192221-9A9WW2QX.json"
              className="w-full h-full border-none"
            />
          </div>
        </div>
      )}
    </>
  );
}
