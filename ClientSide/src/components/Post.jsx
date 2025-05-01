import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  FaHeart,
  FaComment,
  FaMicrophone,
  FaPaperPlane,
  FaTrash,
  FaEdit
} from 'react-icons/fa';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import {
  getPostById,
  toggleLike,
  getPostComments,
  addComment,
  editComment,
  deleteComment,
  deletePost
} from '../redux/ApiCalls/postApiCall';
import { getUserbyId } from '../redux/ApiCalls/UserApiCall';
import swal from 'sweetalert';

const Post = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { post, postComments } = useSelector(state => state.post);
  const currentUser = useSelector(state => state.auth.user);

  const [commentText, setCommentText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const activeRecordingPostRef = useRef(null);
  const commentInputRef = useRef();

  // Speech-to-text setup
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Load post and comments
  useEffect(() => {
    dispatch(getPostById(postId));
    dispatch(getPostComments(postId));
  }, [dispatch, postId]);

  // Load author data
  useEffect(() => {
    if (post?.user) dispatch(getUserbyId(post.user));
  }, [dispatch, post?.user]);

  // Sync transcript when this post is recording
  useEffect(() => {
    if (activeRecordingPostRef.current === postId && transcript) {
      setCommentText(transcript);
    }
  }, [transcript, postId]);

  // Clear recording flag when speech ends
  useEffect(() => {
    if (!listening && activeRecordingPostRef.current === postId) {
      activeRecordingPostRef.current = null;
    }
  }, [listening, postId]);

  const author = useSelector(state => state.user.userById);

  const isVideo = url => {
    if (!url) return false;
    try {
      return /(\.(mp4|mov|avi|webm))$/i.test(new URL(url).pathname);
    } catch {
      return false;
    }
  };

  const handleLike = () => dispatch(toggleLike(post._id));
  const hasLiked = post?.likes.includes(currentUser._id);

  const startListening = () => {
    if (!browserSupportsSpeechRecognition) return;
    resetTranscript();
    activeRecordingPostRef.current = postId;
    SpeechRecognition.startListening({ continuous: false });
    commentInputRef.current?.focus();
  };

  const handleCommentSubmit = e => {
    e.preventDefault();
    if (!commentText.trim()) return;
    dispatch(addComment(post._id, commentText));
    setCommentText('');
    resetTranscript();
  };

  const handleEditClick = (id, text) => {
    setEditingId(id);
    setEditingText(text);
  };
  const handleEditSubmit = id => {
    dispatch(editComment(post._id, id, editingText));
    setEditingId(null);
    setEditingText('');
  };

  const handleCommentDelete = id => {
    swal({
      title: "Are you sure?",
      text: "You will not be able to recover this comment!",
      icon: "warning",
      buttons: ["Cancel", "Delete"],
      dangerMode: true
    }).then(willDelete => {
      if (willDelete) dispatch(deleteComment(post._id, id));
    });
  };

  const handlePostDelete = () => {
    swal({
      title: "Delete this post?",
      text: "You will not be able to recover this post!",
      icon: "warning",
      buttons: ["Cancel", "Delete"],
      dangerMode: true
    }).then(willDelete => {
      if (willDelete) {
        dispatch(deletePost(post._id));
        navigate('/profile');
      }
    });
  };

  if (!post || !author) return <div>Loading…</div>;

  const mediaUrl = post.media[0];
  const isOwner = post.user === currentUser._id || currentUser.isAdmin;

  return (
    <div className="min-h-screen max-w-4xl mx-auto bg-white p-4 space-y-6">
      {/* Header with delete */}
      <div className="flex items-center justify-between">
        <Link to={`/profile/${author._id}`} className="flex items-center gap-3">
          <img
            src={author.profilePhoto?.url}
            alt={author.username}
            className="w-12 h-12 rounded-full object-cover"
          />
          <h2 className="font-semibold">{author.username}</h2>
        </Link>
        {isOwner && (
          <button onClick={handlePostDelete} className="text-red-500 hover:text-red-700">
            <FaTrash size={20} />
          </button>
        )}
      </div>

      {/* Media display */}
      <div>
        {isVideo(mediaUrl) ? (
          <video controls className="w-full rounded-lg">
            <source src={mediaUrl} type="video/mp4" />
          </video>
        ) : (
          <img
            src={mediaUrl}
            alt="Post content"
            className="w-full rounded-lg object-contain"
          />
        )}
      </div>

      {/* Likes & comments count */}
      <div className="flex items-center gap-6 text-gray-700">
        <button onClick={handleLike} className="inline-flex items-center space-x-2 focus:outline-none">
          <FaHeart className={`text-2xl ${hasLiked ? 'text-red-500' : 'text-gray-500'}`} />
          <span>{post.likes.length}</span>
        </button>
        <button onClick={() => commentInputRef.current?.focus()} className="inline-flex items-center space-x-2 focus:outline-none">
          <FaComment className="text-2xl text-gray-500" />
          <span>{post.comments.length}</span>
        </button>
      </div>

      {/* Caption */}
      {post.caption && (
        <div>
          <p className="text-gray-800">
            <span className="font-semibold mr-1">{author.username}</span>
            {post.caption}
          </p>
        </div>
      )}

      {/* Comment input */}
      <form onSubmit={handleCommentSubmit} className="flex items-center gap-2">
        <button
          type="button"
          onClick={startListening}
          className={`text-xl focus:outline-none ${
            listening && activeRecordingPostRef.current === postId
              ? 'text-red-500'
              : 'text-gray-500'
          }`}
        >
          <FaMicrophone />
        </button>
        <input
          ref={commentInputRef}
          type="text"
          value={commentText}
          onChange={e => setCommentText(e.target.value)}
          placeholder="Add a comment…"
          className="flex-grow border border-gray-300 rounded-lg px-3 py-2 focus:ring focus:border-blue-300"
        />
        <button type="submit" className="text-xl text-blue-600 focus:outline-none">
          <FaPaperPlane />
        </button>
      </form>

      {/* Comments or placeholder */}
      {postComments.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <p className="text-gray-500 text-lg">Be the first to comment on this post</p>
        </div>
      ) : (
        <div className="space-y-4">
          {postComments.map(c => (
            <div key={c._id} className="flex items-start gap-3">
              <Link to={`/profile/${c.user._id}`} className="flex-shrink-0">
                <img
                  src={c.user.profilePhoto?.url}
                  alt={c.user.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
              </Link>
              <div className="flex-1">
                <span className="font-semibold mr-2">{c.user.username}</span>
                {editingId === c._id ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      className="flex-grow border p-1 rounded"
                      value={editingText}
                      onChange={e => setEditingText(e.target.value)}
                    />
                    <button
                      onClick={() => handleEditSubmit(c._id)}
                      className="text-sm text-blue-600"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <p className="mt-1">{c.text}</p>
                )}
              </div>
              {(c.user._id === currentUser._id || post.user === currentUser._id) && (
                <div className="flex flex-col items-center gap-1 ml-2 text-gray-500">
                  {c.user._id === currentUser._id && (
                    <button onClick={() => handleEditClick(c._id, c.text)}>
                      <FaEdit />
                    </button>
                  )}
                  <button onClick={() => handleCommentDelete(c._id)}>
                    <FaTrash />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Post;
