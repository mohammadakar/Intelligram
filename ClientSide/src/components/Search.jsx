// src/components/Search.jsx
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchUsers } from '../redux/ApiCalls/UserApiCall';
import { getAllPosts } from '../redux/ApiCalls/postApiCall';
import { Link } from 'react-router-dom';
import { FaVideo } from 'react-icons/fa';
import videoPoster from '../vidimage/vd2.avif';

const Search = () => {
  const dispatch        = useDispatch();
  const { usersReturned } = useSelector(state => state.user);
  const { posts }       = useSelector(state => state.post);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all posts on mount
  useEffect(() => {
    dispatch(getAllPosts());
  }, [dispatch]);

  const handleSearch = () => {
    if (searchQuery.trim() === '') return;
    dispatch(searchUsers(searchQuery));
  };

  // Only show public posts, sorted newest first
  const publicPosts = posts
    .filter(p => p?.user?.isAccountPrivate === false)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const isVideo = url => {
    if (!url) return false;
    try {
      return /\.(mp4|mov|avi|webm)$/i.test(new URL(url).pathname);
    } catch {
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 max-w-4xl mx-auto space-y-6">
      {/* Search Bar */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="flex-grow border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:border-blue-300 bg-white"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Search
        </button>
      </div>

      {/* User Results */}
      {usersReturned.length > 0 && (
        <div className="space-y-2 bg-white">
          {usersReturned.map(user => (
            <Link
              key={user._id}
              to={`/profile/${user._id}`}
              className="flex items-center gap-3 p-2 border-b hover:bg-gray-50 rounded bg-white"
            >
              <img
                src={user.profilePhoto.url}
                alt={user.username}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold text-gray-800">{user.username}</h3>
                <p className="text-sm text-gray-500">
                  {user.followers.length} followers | {user.following.length} following
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Explore Public Posts */}
      <div className="bg-white">
        <h3 className="text-xl font-semibold mb-2 text-gray-800">Explore</h3>
        {publicPosts.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 md:gap-4">
            {publicPosts.map(post => (
              <Link
                key={post._id}
                to={`/post/${post._id}`}
                className="aspect-square relative overflow-hidden rounded-lg bg-white group"
              >
                {isVideo(post.media[0]) ? (
                  <video
                    className="w-full h-full object-cover"
                    src={post.media[0]}
                    poster={videoPoster}
                    muted
                    preload="metadata"
                  />
                ) : (
                  <img
                    src={post.media[0]}
                    alt="post"
                    className="w-full h-full object-cover"
                  />
                )}
                {isVideo(post.media[0]) && (
                  <FaVideo className="absolute top-2 right-2 text-white text-2xl drop-shadow-lg" />
                )}
                <div className="hidden group-hover:flex absolute inset-0 bg-black/50 items-center justify-center gap-4 text-white">
                  <span>❤️ {post.likes?.length || 0}</span>
                  <span>💬 {post.comments?.length || 0}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center">No public posts yet.</p>
        )}
      </div>
    </div>
  );
};

export default Search;
