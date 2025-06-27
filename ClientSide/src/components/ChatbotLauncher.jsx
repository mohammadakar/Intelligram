import { useState, useRef, useEffect } from 'react';
import { FiMessageCircle, FiX } from 'react-icons/fi';

export default function ChatbotLauncher() {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: null, y: null });
  const [isDragging, setIsDragging] = useState(false);
  
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const buttonRef = useRef(null);
  const movedRef = useRef(false); 

  function onMouseDown(e) {
    e.preventDefault();
    startDrag(e.clientX, e.clientY);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  function onMouseMove(e) {
    updatePosition(e.clientX, e.clientY);
  }

  function onMouseUp() {
    endDrag();
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  }

  function onTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    startDrag(touch.clientX, touch.clientY);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
  }

  function onTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    updatePosition(touch.clientX, touch.clientY);
  }

  function onTouchEnd() {
    endDrag();
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchend', onTouchEnd);
  }

  function startDrag(clientX, clientY) {
    dragging.current = true;
    setIsDragging(true);
    movedRef.current = false;
    
    const rect = buttonRef.current.getBoundingClientRect();
    offset.current = {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function updatePosition(clientX, clientY) {
    if (!dragging.current) return;
    
    movedRef.current = true;
    
    const newX = clientX - offset.current.x;
    const newY = clientY - offset.current.y;
 
    const maxX = window.innerWidth - buttonRef.current.offsetWidth;
    const maxY = window.innerHeight - buttonRef.current.offsetHeight;
    
    setPos({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  }

  function endDrag() {
    dragging.current = false;
    setIsDragging(false);
  }

  useEffect(() => {
    function onResize() {
      if (pos.x !== null && pos.y !== null) {
        const maxX = window.innerWidth - buttonRef.current.offsetWidth;
        const maxY = window.innerHeight - buttonRef.current.offsetHeight;
        
        setPos({
          x: Math.min(pos.x, maxX),
          y: Math.min(pos.y, maxY)
        });
      }
    }
    
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [pos]);

  useEffect(() => {
    if (pos.x === null && pos.y === null) {
      const rightPosition = window.innerWidth - 80; // 56px + 24px margin
      const bottomPosition = window.innerHeight - 80;
      setPos({ x: rightPosition, y: bottomPosition });
    }
  }, [pos]);

  const toggleChat = () => {
    if (!isDragging && !movedRef.current) {
      setVisible(v => !v);
    }
  };

  return (
    <>
      {/* Draggable launcher button */}
      <div
        ref={buttonRef}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onClick={toggleChat}
        style={
          pos.x !== null && pos.y !== null
            ? { 
                left: `${pos.x}px`, 
                top: `${pos.y}px`,
                bottom: 'auto', 
                right: 'auto',
                touchAction: 'none'
              }
            : {}
        }
        className={`
          fixed
          ${pos.x === null && pos.y === null ? 'bottom-6 right-6' : ''}
          z-50
          w-14 h-14 bg-gradient-to-tr from-blue-600 to-purple-600
          text-white rounded-full shadow-lg flex items-center justify-center
          cursor-pointer select-none
          ${isDragging ? 'scale-110 transition-transform' : ''}
        `}
      >
        <FiMessageCircle size={28} />
      </div>

      {visible && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-gradient-to-tr from-blue-600 to-purple-600 bg-opacity-50 p-4">
          <div className="relative w-full max-w-md h-[80vh] bg-white rounded-lg overflow-hidden shadow-xl">
            <button
              onClick={() => setVisible(false)}
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