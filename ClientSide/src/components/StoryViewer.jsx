// src/components/StoryViewer.jsx
import { useState, useEffect } from 'react';
import { FaTimes, FaHeart, FaEye } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  toggleStoryLike,
  viewStory,
  fetchStoryViews
} from '../redux/ApiCalls/storyApiCall';
import { getOrCreateChat, sendMessage } from '../redux/ApiCalls/chatApiCall';
dayjs.extend(relativeTime);

const StoryViewer = ({ stories = [], user, onClose }) => {
  const [idx, setIdx] = useState(0);
  const [viewList, setViewList] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const total = stories.length;
  const dispatch = useDispatch();
  const currentUser = useSelector(s => s.auth.user);
  const isOwner = user._id === currentUser._id;

  // record view & auto-advance after 5s (unless paused)
  useEffect(() => {
    if (total === 0 || isPaused) return;
    const sid = stories[idx]._id;
    dispatch(viewStory(sid));
    const timer = setTimeout(() => {
      if (idx < total - 1) setIdx(i => i + 1);
      else onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [idx, total, stories, dispatch, onClose, isPaused]);

  if (!user || total === 0) return null;

  const { profilePhoto, username } = user;
  const {
    _id,
    url,
    caption,
    location,
    tags = [],
    createdAt,
    likes = []
  } = stories[idx];
  const hasLiked = likes.includes(currentUser._id);

  const openViews = async () => {
    setIsPaused(true);
    const viewersRaw = await dispatch(fetchStoryViews(_id));
    // dedupe and flag liked
    const unique = {};
    viewersRaw.forEach(v => {
      if (!unique[v._id]) {
        unique[v._id] = {
          _id: v._id,
          username: v.username,
          profilePhoto: v.profilePhoto,
          viewedAt: v.viewedAt,
          liked: likes.includes(v._id)
        };
      }
    });
    setViewList(Object.values(unique));
  };

  const closeViews = () => {
    setViewList(null);
    setIsPaused(false);
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    // 1) get or create the chat
    const res = await dispatch(getOrCreateChat(user._id));
    const chat = res.data;            // our thunk returns axios res
    if (chat?._id) {
      // 2) send a message with the story URL as media
      await dispatch(sendMessage(chat._id, replyText, url));
      setReplyText('');
    }
  };

  const handleLike = () => {
    dispatch(toggleStoryLike(_id));
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-r from-blue-600 to-purple-600 bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="relative bg-black rounded-lg overflow-hidden w-full max-w-sm h-full max-h-[90vh] flex flex-col">
        {/* progress & header */}
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

        {/* caption/tags/location box */}
        {(caption || tags.length > 0 || location) && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg p-2 space-y-1 max-w-xs w-11/12 text-center z-10">
            {caption && (
              <div className="text-gray-800 text-sm break-words">{caption}</div>
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
              <div className="text-gray-500 text-xs">📍 {location}</div>
            )}
          </div>
        )}

        {/* media */}
        <div className="flex-grow flex items-center justify-center">
          {/\.(mp4|mov|avi|webm)$/i.test(url) ? (
            <video autoPlay loop controls className="max-h-full max-w-full">
              <source src={url} type="video/mp4" />
            </video>
          ) : (
            <img
              src={url}
              alt=""
              className="max-h-full max-w-full object-contain"
            />
          )}
        </div>

        {/* bottom bar */}
        <div className="flex items-center p-2 bg-black bg-opacity-75">
          {isOwner ? (
            <button
              onClick={openViews}
              className="flex items-center gap-2 text-white px-3 py-1 bg-gray-700 rounded-full"
            >
              <FaEye /> Viewers
            </button>
          ) : (
            <>
              <input
                type="text"
                placeholder="Send a reply…"
                className="flex-grow rounded-full px-4 py-2 text-sm bg-white"
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
              />
              <button
                onClick={handleReply}
                className="ml-2 text-white"
              >
                Reply
              </button>
              <button
                onClick={handleLike}
                className={`ml-2 text-xl ${hasLiked ? 'text-red-500' : 'text-white'}`}
              >
                <FaHeart />
              </button>
            </>
          )}
        </div>

        {/* nav arrows */}
        {idx > 0 && (
          <button
            onClick={() => { if (!isPaused) setIdx(i => i - 1); }}
            className="absolute inset-y-0 left-2 flex items-center text-white text-3xl"
          >‹</button>
        )}
        {idx < total - 1 && (
          <button
            onClick={() => { if (!isPaused) setIdx(i => i + 1); }}
            className="absolute inset-y-0 right-2 flex items-center text-white text-3xl"
          >›</button>
        )}
      </div>

      {/* viewers pop-up */}
      {viewList && (
        <div className="fixed inset-0 bg-gradient-to-r from-blue-600 to-purple-600 bg-opacity-75 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg p-4 max-w-xs w-full space-y-3">
            <h3 className="font-semibold">Seen by</h3>
            <ul className="space-y-2 max-h-64 overflow-y-auto">
              {viewList.map(v => (
                <li key={v._id} className="flex items-center gap-2">
                  <img
                    src={v.profilePhoto.url}
                    alt={v.username}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="flex-1">{v.username}</span>
                  {v.liked && <FaHeart className="text-red-500 text-sm mr-1" />}
                  <span className="text-xs text-gray-500">
                    {dayjs(v.viewedAt).fromNow()}
                  </span>
                </li>
              ))}
            </ul>
            <button
              onClick={closeViews}
              className="mt-2 w-full text-center text-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryViewer;
