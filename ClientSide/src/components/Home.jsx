import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllPosts } from '../redux/ApiCalls/postApiCall';
import HomeStories from '../components/HomeStories';
import PostCard from '../components/PostCard';
import { FiBell, FiMessageSquare } from 'react-icons/fi';

const HomePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const { posts } = useSelector(s => s.post);

  useEffect(() => {
    dispatch(getAllPosts());
  }, [dispatch]);

  const feed = posts
    .filter(p =>
      p.user._id === user._id ||
      user.following.some(f => f.user === p.user._id)
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="w-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-sm py-3 px-4 flex justify-between items-center sticky top-0 z-40">
        <h1 className="text-lg font-bold text-black">Intelligram</h1>
        <div className="flex gap-4 items-center text-xl text-gray-600">
          <button
            className="hover:text-blue-600 transition"
            onClick={() => alert("Notifications page coming soon!")}
          >
            <FiBell />
          </button>
          <button
            className="hover:text-green-600 transition"
            onClick={() => alert("Chat page coming soon!")}
          >
            <FiMessageSquare />
          </button>
        </div>
      </div>

      <HomeStories />

      <div className="max-w-2xl mx-auto space-y-6 p-4">
        {feed.length ? (
          feed.map(post => <PostCard key={post._id} post={post} />)
        ) : (
          <p className="text-center text-gray-500">No posts to show yet.</p>
        )}
      </div>
    </div>
  );
};

export default HomePage;
