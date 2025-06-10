import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllPosts } from '../redux/ApiCalls/postApiCall';
import HomeStories from '../components/HomeStories';
import PostCard from '../components/PostCard';
import { FiBell, FiMessageSquare } from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';
import { markNotificationsRead } from '../redux/ApiCalls/NotificationApiCall';
import ChatbotLauncher from './ChatbotLauncher';


const HomePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const { posts } = useSelector(s => s.post);
  const { list: notifications } = useSelector(s => s.notification);
  const unreadCount = notifications.filter(n => !n.read).length;

  const location = useLocation();

  // Fetch feed posts
  useEffect(() => {
    dispatch(getAllPosts());
  }, [dispatch]);

  // If we just navigated to /notifications, mark all as read
  useEffect(() => {
    if (location.pathname === '/notifications' && unreadCount > 0) {
      dispatch(markNotificationsRead());
    }
  }, [location.pathname, unreadCount, dispatch]);

  const feed = posts
    .filter(p =>
      p.user._id === user._id ||
      user.following.some(f => f.user === p.user._id)
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* top bar */}
      <div className="w-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-sm py-3 px-4 flex justify-between items-center sticky top-0 z-40">
        <h1 className="text-lg font-bold text-black">Intelligram</h1>
        <div className="flex gap-4 items-center text-xl text-gray-600">
          {/* Bell now has its own relative context */}
          <Link
            to="/notifications"
            className="relative hover:text-blue-600 transition"
          >
            <FiBell />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </Link>

          <Link to="/chat" className="hover:text-green-600 transition">
            <FiMessageSquare />
          </Link>
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

      {/* Botpress floating chat widget */}
      <ChatbotLauncher />
    </div>
  );
};

export default HomePage;
