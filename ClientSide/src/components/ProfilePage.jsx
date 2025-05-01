import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSettings, FiEdit } from 'react-icons/fi';
import { BsGrid3X3 } from 'react-icons/bs';
import { FaVideo } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { getAllPosts } from '../redux/ApiCalls/postApiCall';
import { updateBio } from '../redux/ApiCalls/UserApiCall';
import videoPoster from '../vidimage/vd2.avif';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { posts } = useSelector(state => state.post);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState(user?.bio || '');
  
  useEffect(() => {
    dispatch(getAllPosts());
  }, [dispatch]);

  useEffect(() => {
    setBioText(user?.bio || '');
  }, [user?.bio]);

  const handleUpdateBio = () => {
    dispatch(updateBio(bioText));
    setIsEditingBio(false);
  };

  // Filter posts belonging to the user
  const userPosts = posts.filter(post => post?.user?._id === user?._id);

  const isVideo = (url) => {
    if (!url) return false;
    try {
      const pathname = new URL(url).pathname;
      return pathname.match(/\.(mp4|mov|avi|webm)$/i);
    } catch {
      return false;
    }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-4xl mx-auto px-4 py-4 bg-white">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
        <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200">
          <img 
            src={user?.profilePhoto.url} 
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Profile Info */}
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-2xl font-light">{user?.username}</h2>
            <button 
              className="p-2 hover:bg-gray-100 rounded-full"
              onClick={() => {/* Navigate to settings */}}
            >
              <FiSettings className="text-xl" />
            </button>
          </div>

          <div className="flex gap-8 mb-4">
            <div>
              <span className="font-semibold">{userPosts.length}</span> posts
            </div>
            <div>
              <span className="font-semibold">{user?.followers?.length}</span> followers
            </div>
            <div>
              <span className="font-semibold">{user?.following?.length}</span> following
            </div>
          </div>

          {/* Bio Section with Edit */}
          <div className="relative">
            {isEditingBio ? (
              <div className="flex flex-col gap-2">
                <textarea
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  rows="3"
                  placeholder="Write your bio..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdateBio}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditingBio(false)}
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="whitespace-pre-line">{user?.bio}</p>
                <button 
                  onClick={() => setIsEditingBio(true)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <FiEdit className="text-sm" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center border-t">
        <button className="flex items-center gap-2 px-4 py-4 border-t border-black font-semibold">
          <BsGrid3X3 />
          POSTS
        </button>
      </div>

      {/* Main Content Area for Posts */}
      <div className="flex-grow">
        {userPosts.length > 0 ? (
          <div className="grid grid-cols-3 gap-1 md:gap-6">
            {userPosts.map((post) => (
              <Link 
                to={`/post/${post._id}`} 
                className="aspect-square relative group overflow-hidden"
                key={post._id}
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

                {/* Video icon overlay on video posts */}
                {isVideo(post?.media[0]) && (
                  <FaVideo 
                    className="absolute top-2 right-2 text-white text-2xl drop-shadow-lg"
                  />
                )}

                <div className="hidden group-hover:flex absolute inset-0 bg-black/50 items-center justify-center gap-6 text-white">
                  <span>❤️ {post.likes?.length || 0}</span>
                  <span>💬 {post.comments?.length || 0}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          // Empty state message when there are no posts
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No posts yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
