import { useDispatch } from 'react-redux';
import { toggleLike }  from '../redux/ApiCalls/postApiCall';
import { toggleSavePost } from '../redux/ApiCalls/UserApiCall';
import { Link, useNavigate } from 'react-router-dom';
import { FaHeart, FaComment, FaBookmark, FaTag } from 'react-icons/fa';

const PostCard = ({ post, currentUser }) => {
  const dispatch = useDispatch();
  const nav      = useNavigate();
  const isVideo  = url => /\.(mp4|mov|avi|webm)$/i.test(new URL(url).pathname);
  const hasLiked = post?.likes?.includes(currentUser?._id);
  const hasSaved = currentUser?.savedPosts?.includes(post?._id);

  return (
    <div className="bg-white border rounded-lg overflow-hidden mb-6 max-w-md mx-auto">
      {/* header: author + tags */}
      <div className="flex items-center px-4 py-2">
        <Link to={`/profile/${post.user._id}`} className="flex items-center gap-2">
          <img
            src={post.user.profilePhoto.url}
            alt={post.user.username}
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="font-medium">{post.user.username}</span>
        </Link>
        {post.tags.length > 0 && (
          <div className="flex items-center ml-2 text-sm text-blue-600">
            <FaTag className="mr-1" />
            {post.tags.map((u,i) => (
              <Link key={u._id} to={`/profile/${u._id}`} className="hover:underline">
                {u.username}{i < post.tags.length - 1 ? ', ' : ''}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* location */}
      {post.location && (
        <div className="px-4 text-gray-500 text-sm">{post.location}</div>
      )}

      {/* media */}
      <div className="w-full h-64 bg-black flex items-center justify-center">
        {isVideo(post.media[0])
          ? <video src={post.media[0]} controls className="max-h-full max-w-full object-contain" />
          : <img src={post.media[0]} alt="" className="w-full h-full object-cover" />
        }
      </div>

      {/* actions */}
      <div className="flex items-center px-4 py-2 space-x-4">
        <button
          onClick={() => dispatch(toggleLike(post._id))}
          className={`text-2xl ${hasLiked ? 'text-red-500' : 'text-gray-500'}`}
        ><FaHeart /></button>
        <span className="text-sm">{post.likes.length}</span>

        <button
          onClick={() => nav(`/post/${post._id}`)}
          className="text-2xl text-gray-500"
        ><FaComment /></button>
        <span className="text-sm">{post.comments.length}</span>

        <button
          onClick={() => dispatch(toggleSavePost(post._id))}
          className={`ml-auto text-2xl ${hasSaved ? 'text-yellow-400' : 'text-gray-500'}`}
        ><FaBookmark /></button>
      </div>

      {/* caption */}
      {post.caption && (
        <div className="px-4 pb-2 text-gray-800">
          <span className="font-semibold mr-1">{post.user.username}</span>
          {post.caption}
        </div>
      )}

      {/* last two comments + “view all” */}
      {post.comments.length > 0 && (
        <div className="px-4 pb-4 text-sm space-y-1">
          {post.comments.slice(-2).map(c => (
            <div key={c._id}>
              <span className="font-semibold">{c.user.username}</span> {c.text}
            </div>
          ))}
          {post.comments.length > 2 && (
            <button
              onClick={() => nav(`/post/${post._id}`)}
              className="text-gray-500 hover:underline text-xs"
            >
              View all {post.comments.length} comments
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default PostCard;
