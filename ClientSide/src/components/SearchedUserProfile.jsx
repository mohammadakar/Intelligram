import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { SearchedUser, toggleFollow } from '../redux/ApiCalls/UserApiCall';
import { getAllPosts } from '../redux/ApiCalls/postApiCall';
import { BsGrid3X3 } from 'react-icons/bs';
import { FaVideo } from 'react-icons/fa';
import videoPoster from '../vidimage/vd2.avif';

const SearchedUserProfile = () => {
  const { userid } = useParams(); 
  const dispatch = useDispatch();
  const { posts } = useSelector(state => state.post);
  const searchedUser = useSelector(state => state.user.searchedUser);
  const currentUser = useSelector(state => state.auth.user);

  
  useEffect(() => {
    dispatch(SearchedUser(userid));
  }, [dispatch, userid]);

  
  useEffect(() => {
      dispatch(getAllPosts());
  }, [dispatch]);


  
  const handleFollowToggle = async () => {
    await dispatch(toggleFollow(userid));
    await dispatch(SearchedUser(userid));
  };

  if (!searchedUser) return <div>Loading...</div>;
  
  const userPosts = posts.filter(post => post?.user?._id === searchedUser?._id);

  const isVideo = (url) => {
    if (!url) return false;
    try {
      const pathname = new URL(url).pathname;
      return pathname.match(/\.(mp4|mov|avi|webm)$/i);
    } catch {
      return false;
    }
  };

  const isFollowing = currentUser?.following.some(f => f.user === userid);

  return (
    <div className="min-h-screen flex flex-col max-w-4xl mx-auto px-4 py-4 bg-white">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
        <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200">
          <img 
            src={searchedUser.profilePhoto?.url} 
            alt={searchedUser.username} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          {/* Username and Follow/Unfollow Button */}
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-2xl font-light">{searchedUser.username}</h2>
            {currentUser && currentUser._id !== searchedUser._id && (
              <button 
                onClick={handleFollowToggle}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                {isFollowing ? "Unfollow" : "Follow"}

              </button>
            )}
          </div>
          {/* Statistics: posts, followers, following */}
          <div className="flex gap-8 mb-4">
            <div>
              <span className="font-semibold">
                {userPosts ? userPosts.length : 0}
              </span> posts
            </div>
            <div>
              <span className="font-semibold">
                {searchedUser.followers?.length || 0}
              </span> followers
            </div>
            <div>
              <span className="font-semibold">
                {searchedUser.following?.length || 0}
              </span> following
            </div>
          </div>
          {/* Bio Section */}
          <p className="whitespace-pre-line">{searchedUser.bio}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center border-t">
        <button className="flex items-center gap-2 px-4 py-4 border-t border-black font-semibold">
          <BsGrid3X3 />
          POSTS
        </button>
      </div>

      {/* Posts Grid */}
      <div className="flex-grow">
        {userPosts.length > 0 ? (
          <div className="grid grid-cols-3 gap-1 md:gap-6">
            {userPosts.map((post) => (
              <Link 
                to={`/post/${post._id}`} 
                className="aspect-square relative group"
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
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No posts yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchedUserProfile;
