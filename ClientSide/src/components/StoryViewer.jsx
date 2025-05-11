// src/components/StoryViewer.jsx
import { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

export default function StoryViewer({ stories = [], user, onClose }) {
  const [idx, setIdx] = useState(0);
  const total = stories.length;

  // auto-advance every 5s
  useEffect(() => {
    const timer = setTimeout(() => {
      if (idx < total - 1) setIdx(i => i + 1);
      else onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [idx, total, onClose]);

  if (!user || total === 0) return null;

  const { profilePhoto, username } = user;
  const { url, caption, location, tags = [], createdAt } = stories[idx];

  return (
    <div className="fixed inset-0 bg-gradient-to-r from-blue-600 to-purple-600 bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="relative bg-black rounded-lg overflow-hidden w-full max-w-sm h-full max-h-[90vh] flex flex-col">
        {/* Progress + header (unchanged) */}
        <div className="absolute top-0 left-0 right-0 flex flex-col p-2 space-y-1">
          <div className="flex gap-1">
            {stories.map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-1 rounded ${i <= idx ? 'bg-white' : 'bg-white/40'}`}
              />
            ))}
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <img
                src={profilePhoto.url}
                alt={username}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="text-white text-sm">
                <div className="font-semibold">{username}</div>
                <div className="text-xs opacity-80">{dayjs(createdAt).fromNow()}</div>
              </div>
            </div>
            <button onClick={onClose} className="p-1 text-white">
              <FaTimes size={16} />
            </button>
          </div>
        </div>

        
        {(caption || tags.length > 0 || location) && (
          <div className="mt-14 absolute top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg p-2 space-y-1 max-w-xs w-11/12 text-center">
            {caption && (
              <div className="text-gray-800 text-sm break-words">
                {caption}
              </div>
            )}
            {tags.length > 0 && (
              <div className="text-blue-600 text-xs">
                
                {tags.map((u, i) => (
                  <span key={u._id}>
                    {u.username}{i < tags.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </div>
            )}
            {location && (
              <div className="text-gray-500 text-xs">
                📍 {location}
              </div>
            )}
          </div>
        )}

        {/* Media (unchanged) */}
        <div className="flex-grow flex items-center justify-center">
          {/\.(mp4|mov|avi|webm)$/i.test(url) ? (
            <video src={url} autoPlay loop muted className="max-h-full max-w-full" />
          ) : (
            <img src={url} alt="" className="max-h-full max-w-full object-contain" />
          )}
        </div>

        {/* Navigation arrows (unchanged) */}
        {idx > 0 && (
          <button
            onClick={() => setIdx(i => i - 1)}
            className="absolute inset-y-0 left-2 flex items-center text-white text-3xl"
          >
            ‹
          </button>
        )}
        {idx < total - 1 && (
          <button
            onClick={() => setIdx(i => i + 1)}
            className="absolute inset-y-0 right-2 flex items-center text-white text-3xl"
          >
            ›
          </button>
        )}
      </div>
    </div>
  );
}
