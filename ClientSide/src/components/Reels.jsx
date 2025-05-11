// src/components/Reels.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllPosts, toggleLike } from '../redux/ApiCalls/postApiCall';
import { toggleSavePost, toggleFollow } from '../redux/ApiCalls/UserApiCall';
import { Link, useNavigate } from 'react-router-dom';
import { FaHeart, FaComment, FaBookmark } from 'react-icons/fa';

const Reels = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { posts } = useSelector(state => state.post);
  const currentUser = useSelector(state => state.auth.user);

  // 1) fetch all posts
  useEffect(() => {
    dispatch(getAllPosts());
  }, [dispatch]);

  // 2) helper to detect video URLs
  const isVideo = url => {
    try {
      return /\.(mp4|mov|avi|webm)$/i.test(new URL(url).pathname);
    } catch {
      return false;
    }
  };

  // 3) only public videos
  const reels = (posts || []).filter(
    p => isVideo(p.media?.[0]) && p.user?.isAccountPrivate === false
  );

  // 4) build a Set of followed user-IDs for fast lookup
  const followingIds = new Set(
    (currentUser?.following || []).map(f => f?.user?.toString())
  );

  return (
    <div
      className="h-screen overflow-y-scroll snap-y snap-mandatory"
      style={{ scrollSnapType: 'y mandatory' }}
    >
      {reels.map(post => {
        const liked     = post.likes.includes(currentUser._id);
        const saved     = (currentUser.savedPosts || []).includes(post._id);
        const following = followingIds.has(post.user._id);
        const isOwner   = post.user._id === currentUser._id;

        return (
          <div
            key={post._id}
            className="relative h-screen snap-start bg-black"
            style={{ scrollSnapAlign: 'start' }}
          >
            {/* video */}
            <video
              src={post.media[0]}
              autoPlay
              loop
              muted
              className="w-full h-full object-cover"
            />

            {/* right-side icons */}
            <div className="absolute top-1/4 right-4 flex flex-col items-center space-y-6 text-white">
              {/* like */}
              <button
                onClick={() => dispatch(toggleLike(post._id))}
                className="flex flex-col items-center"
              >
                <FaHeart className={`text-3xl ${liked ? 'text-red-500' : ''}`} />
                <span className="text-sm">{post.likes.length}</span>
              </button>

              {/* comment */}
              <button
                onClick={() => navigate(`/post/${post._id}`)}
                className="flex flex-col items-center"
              >
                <FaComment className="text-3xl" />
                <span className="text-sm">{post.comments.length}</span>
              </button>

              {/* save */}
              <button
                onClick={() => dispatch(toggleSavePost(post._id))}
                className="flex flex-col items-center"
              >
                <FaBookmark className={`text-3xl ${saved ? 'text-yellow-400' : ''}`} />
              </button>
            </div>

            {/* bottom overlay */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <Link to={`/profile/${post.user._id}`} className="flex items-center gap-3">
                  <img
                    src={post.user.profilePhoto.url}
                    alt={post.user.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span className="font-semibold">{post.user.username}</span>
                </Link>
              </div>

              {/* follow / following (only if not your own reel) */}
              {!isOwner && (
                <button
                  onClick={() => dispatch(toggleFollow(post.user._id))}
                  className={`px-3 py-1 rounded text-sm ${
                    following ? 'bg-gray-300 text-black' : 'bg-red-500 text-white'
                  }`}
                >
                  {following ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
          </div>
        );
      })}

      {reels.length === 0 && (
        <div className="h-full flex items-center justify-center text-gray-500">
          No public reels to show.
        </div>
      )}
    </div>
  );
};

export default Reels;
