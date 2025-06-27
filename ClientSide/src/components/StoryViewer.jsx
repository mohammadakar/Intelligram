import { useState, useEffect, useRef } from 'react';
import { FaTimes, FaTrash, FaHeart, FaEye, FaEllipsisH } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { toast } from 'react-toastify';
import {
  toggleStoryLike,
  viewStory,
  fetchStoryViews,
  deleteStory
} from '../redux/ApiCalls/storyApiCall';
import { getOrCreateChat, sendMessage } from '../redux/ApiCalls/chatApiCall';
import ReportModal from './ReportModal';
import swal from "sweetalert";
dayjs.extend(relativeTime);

const StoryViewer = ({ stories = [], user, onClose }) => {
  const [idx, setIdx] = useState(0);
  const [viewList, setViewList] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [reportOpen, setReportOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [videoDuration, setVideoDuration] = useState(5000);
  const total = stories.length;
  const dispatch = useDispatch();
  const currentUser = useSelector(s => s.auth.user);
  const isOwner = user._id === currentUser._id;
  const replyInputRef = useRef();
  const videoRef = useRef();

  const currentStory = stories[idx] || {};
  const { _id, url, type, caption, location, tags = [], createdAt, likes = [] } = currentStory;
  const isVideo = type === 'video';

  const handleVideoLoaded = () => {
    if (videoRef.current) {
      const duration = Math.max(videoRef.current.duration * 1000, 3000);
      setVideoDuration(duration);
    }
  };

  useEffect(() => {
    if (total === 0 || isPaused) return;
    const storyId = stories[idx]._id;
    dispatch(viewStory(storyId));

    let timer;
    if (!isVideo) {
      timer = setTimeout(() => {
        if (idx < total - 1) setIdx(i => i + 1);
        else onClose();
      }, 5000);
    } else if (videoRef.current) {
      videoRef.current.play().catch(console.error);
    }

    return () => clearTimeout(timer);
  }, [idx, total, stories, dispatch, onClose, isPaused, isVideo]);

  useEffect(() => {
    if (!isVideo || !videoRef.current) return;
    const video = videoRef.current;
    const onEnded = () => {
      if (idx < total - 1) setIdx(i => i + 1);
      else onClose();
    };
    video.addEventListener('ended', onEnded);
    return () => video.removeEventListener('ended', onEnded);
  }, [idx, total, onClose, isVideo]);

  if (!user || total === 0) return null;

  const { profilePhoto, username } = user;
  const hasLiked = likes.includes(currentUser._id);

  const openViews = async () => {
    setIsPaused(true);
    if (isVideo && videoRef.current) videoRef.current.pause();
    const viewers = await dispatch(fetchStoryViews(_id));
    const unique = {};
    viewers.forEach(v => {
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
    if (isVideo && videoRef.current) videoRef.current.play();
  };

  const handleReply = async () => {
    if (!replyText.trim() || isSending) return;
    try {
      setIsSending(true);
      const chatRes = await dispatch(getOrCreateChat(user._id));
      const chat = chatRes.payload || chatRes.data;
      if (chat?._id) {
        await dispatch(sendMessage({
          chatId: chat._id,
          content: replyText,
          media: [url],
          type: isVideo ? 'video' : 'image'
        }));
        setReplyText('');
        toast.success('Reply sent!');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to send reply');
    } finally {
      setIsSending(false);
      replyInputRef.current?.blur();
    }
  };

  const handleLike = () => dispatch(toggleStoryLike(_id));

  const handleDelete = async () => {
    try {
      swal({
      title: "Delete this story?",
      text: "This cannot be undone",
      icon: "warning",
      buttons: ["Cancel", "Delete"],
      dangerMode: true
    }).then(ok => ok &&  dispatch(deleteStory(_id)));
      
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete story');
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-r from-blue-600 to-purple-600 bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="relative bg-black rounded-lg overflow-hidden w-full max-w-sm h-full max-h-[90vh] flex flex-col">

        {/* progress + header */}
        <div className="absolute top-0 left-0 right-0 flex flex-col p-2 space-y-1 z-30">
          <div className="flex gap-1">
            {stories.map((_, i) => (
              <div key={i}
                   className={`flex-1 h-1 rounded ${i <= idx ? 'bg-white' : 'bg-white/40'}`} />
            ))}
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <img src={profilePhoto.url} alt={username}
                   className="w-8 h-8 rounded-full object-cover" />
              <div className="text-white text-sm">
                <div className="font-semibold">{username}</div>
                <div className="text-xs opacity-80">{dayjs(createdAt).fromNow()}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isOwner && (
                <button onClick={() => {
                  setIsPaused(true);
                  isVideo && videoRef.current?.pause();
                  setReportOpen(true);
                }}
                        className="p-1 text-white hover:text-red-400">
                  <FaEllipsisH size={16} />
                </button>
              )}
              {isOwner && (
                <button onClick={handleDelete}
                        className="p-1 text-white hover:text-red-500">
                  <FaTrash size={16} />
                </button>
              )}
              <button onClick={onClose} className="p-1 text-white">
                <FaTimes size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* caption / tags / location */}
        {(caption || tags.length || location) && (
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-white rounded-lg p-2 space-y-1 max-w-xs w-11/12 text-center z-20 max-h-[30vh] overflow-y-auto">
            {caption && <div className="text-gray-800 text-sm break-words">{caption}</div>}
            {tags.length > 0 && (
              <div className="text-blue-600 text-xs">
                {tags.map((u, i) => (
                  <span key={u._id}>{u.username}{i < tags.length - 1 ? ', ' : ''}</span>
                ))}
              </div>
            )}
            {location && <div className="text-gray-500 text-xs">📍 {location}</div>}
          </div>
        )}

        {/* media */}
        <div className="flex-grow flex items-center justify-center mt-2">
          {isVideo ? (
            <video ref={videoRef} autoPlay loop={false} muted playsInline
                   className="max-h-full max-w-full"
                   onLoadedMetadata={handleVideoLoaded}>
              <source src={url} />
            </video>
          ) : (
            <img src={url} alt="" className="max-h-full max-w-full object-contain" />
          )}
        </div>

        {/* bottom bar */}
        <div className="flex items-center p-2 bg-black bg-opacity-75">
          {isOwner ? (
            <button onClick={openViews}
                    className="flex items-center gap-2 text-white px-3 py-1 bg-gray-700 rounded-full">
              <FaEye /> Viewers
            </button>
          ) : (
            <>
              <input ref={replyInputRef} type="text" placeholder="Send a reply…"
                     className="flex-grow rounded-full px-4 py-2 text-sm bg-white"
                     value={replyText}
                     onChange={e => setReplyText(e.target.value)}
                     onFocus={() => setIsPaused(true)}
                     onBlur={() => setIsPaused(false)}
                     disabled={isSending} />
              <button onClick={handleReply}
                      className="ml-2 text-white"
                      disabled={isSending}>
                {isSending ? 'Sending...' : 'Reply'}
              </button>
              <button onClick={handleLike}
                      className={`ml-2 text-xl ${hasLiked ? 'text-red-500' : 'text-white'}`}>
                <FaHeart />
              </button>
            </>
          )}
        </div>

        {/* nav arrows */}
        {idx > 0 && (
          <button onClick={() => !isPaused && setIdx(i => i - 1)}
                  className="absolute inset-y-0 left-2 flex items-center text-white text-3xl z-10">
            ‹
          </button>
        )}
        {idx < total - 1 && (
          <button onClick={() => !isPaused && setIdx(i => i + 1)}
                  className="absolute inset-y-0 right-2 flex items-center text-white text-3xl z-10">
            ›
          </button>
        )}
      </div>

      {/* viewers list */}
      {viewList && (
        <div className="fixed inset-0 bg-gradient-to-r from-blue-600 to-purple-600 bg-opacity-75 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg p-4 max-w-xs w-full space-y-3">
            <h3 className="font-semibold">Seen by</h3>
            <ul className="space-y-2 max-h-64 overflow-y-auto">
              {viewList.map(v => (
                <li key={v._id} className="flex items-center gap-2">
                  <img src={v.profilePhoto.url} alt={v.username}
                       className="w-6 h-6 rounded-full object-cover" />
                  <span className="flex-1">{v.username}</span>
                  {v.liked && <FaHeart className="text-red-500 text-sm mr-1" />}
                  <span className="text-xs text-gray-500">{dayjs(v.viewedAt).fromNow()}</span>
                </li>
              ))}
            </ul>
            <button onClick={closeViews} className="mt-2 w-full text-center text-blue-600">
              Close
            </button>
          </div>
        </div>
      )}

      {/* report modal */}
      {reportOpen && (
        <ReportModal
          referenceId={_id}
          type="story"
          onClose={() => {
            setReportOpen(false);
            setIsPaused(false);
            isVideo && videoRef.current?.play();
          }}
        />
      )}
    </div>
  );
};

export default StoryViewer;
