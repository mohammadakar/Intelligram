// src/components/Reels.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllPosts } from '../redux/ApiCalls/postApiCall';
import { FaHeart, FaComment, FaShare, FaBookmark } from 'react-icons/fa';

const Reels = () => {
  const dispatch = useDispatch();
  const { posts } = useSelector(state => state.post);

  // 1) Fetch all posts
  useEffect(() => {
    dispatch(getAllPosts());
  }, [dispatch]);
console.log(posts);

  // 2) Filter down to public videos
  const reels = posts?.filter(p => {
    const url = p?.media?.[0] || '';
    console.log(url);
    
    const isVideo = () => {
        if (!url) return false;
        try {
          const pathname = new URL(url).pathname;
          return pathname.match(/\.(mp4|mov|avi|webm)$/i);
        } catch {
          return false;
        }
      };
    
    return (
      isVideo &&
      p.user &&
      p.user.isAccountPrivate === false
    );
  });
  console.log(reels);
  

  return (
    <div
      className="h-screen overflow-y-scroll snap-y snap-mandatory"
      style={{ scrollSnapType: 'y mandatory' }}
    >
      {reels.map(post => (
        <div
          key={post?._id}
          className="relative h-screen snap-start bg-black"
          style={{ scrollSnapAlign: 'start' }}
        >
          {/* Video */}
          <video
            src={post?.media[0]}
            autoPlay
            loop
            muted
            className="w-full h-full object-cover"
          />

          {/* Right-side icons */}
          <div className="absolute top-1/4 right-4 flex flex-col items-center space-y-6 text-white">
            <button className="flex flex-col items-center">
              <FaHeart className="text-3xl" />
              <span className="text-sm">{post?.likes.length}</span>
            </button>
            <button className="flex flex-col items-center">
              <FaComment className="text-3xl" />
              <span className="text-sm">{post?.comments.length}</span>
            </button>
            <button>
              <FaShare className="text-3xl" />
            </button>
            <button>
              <FaBookmark className="text-3xl" />
            </button>
          </div>

          {/* Bottom overlay with user + caption */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            {/* User info */}
            <div className="flex items-center gap-3 mb-2">
              <img
                src={post?.user.profilePhoto.url}
                alt={post?.user.username}
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="font-semibold">{post?.user?.username}</span>
              <button className="ml-4 px-2 py-1 bg-red-500 rounded text-xs">
                Follow
              </button>
            </div>
            {/* Caption */}
            {post.caption && (
              <p className="text-sm mb-1 line-clamp-2">{post?.caption}</p>
            )}
            {/* (Optional) Music/Audio info */}
            {post.audioTrack && (
              <p className="text-xs opacity-75">{post?.audioTrack}</p>
            )}
          </div>
        </div>
      ))}

      {reels.length === 0 && (
        <div className="h-full flex items-center justify-center text-gray-500">
          No public reels to show.
        </div>
      )}
    </div>
  );
};

export default Reels;
