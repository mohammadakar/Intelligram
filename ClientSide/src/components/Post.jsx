import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaHeart, FaComment, FaMapMarkerAlt, FaTag } from 'react-icons/fa';
import { getPostById } from '../redux/ApiCalls/postApiCall';
import { getUserbyId } from '../redux/ApiCalls/UserApiCall';

const Post = () => {
  const { postId } = useParams();
  const dispatch = useDispatch();
  const { post } = useSelector(state => state.post);
  
  useEffect(() => {
    dispatch(getPostById(postId));
  }, [dispatch, postId]);

  useEffect(() => { 
    if (post?.user) {
      dispatch(getUserbyId(post.user));
    }
  }, [dispatch, post?.user]);
  const user= useSelector(state => state.user.userById);

  return (
    <div className="max-w-4xl mx-auto bg-white min-h-screen p-4">
      {/* Post Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to={`/profile/${post?.user?._id}`} className="flex items-center gap-4">
          <img 
            src={user?.profilePhoto?.url} 
            alt="Profile" 
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h2 className="font-semibold">{user?.username}</h2>
            {post?.location && (
              <div className="flex items-center gap-1 text-gray-600">
                <FaMapMarkerAlt className="text-sm" />
                <span className="text-sm">{post.location}</span>
              </div>
            )}
          </div>
        </Link>
      </div>

      {/* Tags */}
      {post?.tags?.length > 0 && (
        <div className="flex items-center gap-2 mb-4 text-blue-600">
          <FaTag className="text-lg" />
          {post.tags.map((tag, index) => (
            <Link 
              key={tag._id} 
              to={`/profile/${tag._id}`}
              className="text-sm hover:underline"
            >
              {tag.username}{index < post.tags.length - 1 ? ', ' : ''}
            </Link>
          ))}
        </div>
      )}

      {/* Media */}
      <div className="mb-6">
        {post?.media[0]?.includes('video') ? (
          <video 
            controls 
            className="w-full h-auto max-h-[600px] object-contain bg-black"
          >
            <source src={post.media[0]} type="video/mp4" />
          </video>
        ) : (
          <img 
            src={post?.media[0]} 
            alt="Post content" 
            className="w-full h-auto max-h-[600px] object-contain bg-black"
          />
        )}
      </div>

      {/* Likes and Comments */}
      <div className="flex items-center gap-6 text-gray-600">
        <div className="flex items-center gap-2">
          <FaHeart className="text-xl cursor-pointer hover:text-red-500" />
          <span>{post?.likes?.length || 0}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaComment className="text-xl cursor-pointer hover:text-blue-500" />
          <span>{post?.comments?.length || 0}</span>
        </div>
      </div>

      {/* Caption */}
      {post?.caption && (
        <div className="mt-4">
          <p className="text-gray-800">
            <span className="font-semibold">{post.user.username}</span>
            {' '}{post.caption}
          </p>
        </div>
      )}
    </div>
  );
};

export default Post;