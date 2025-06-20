// src/components/Post.jsx
import { useEffect, useState, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch }      from "react-redux";
import {
  FaHeart, FaComment, FaMicrophone, FaPaperPlane,
  FaTrash, FaEdit, FaBookmark, FaTag, FaEllipsisH
} from "react-icons/fa";
import Select from "react-select";
import swal   from "sweetalert";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import NominatimAutocomplete from "./NominatimAutocomplete";
import {
  getPostById, getPostComments, toggleLike,
  addComment, editComment, deleteComment,
  deletePost, editPost
} from "../redux/ApiCalls/postApiCall";
import { toggleSavePost, getUserbyId } from "../redux/ApiCalls/UserApiCall";
import ReportModal from "./ReportModal";

export default function Post() {
  const { postId } = useParams();
  const navigate   = useNavigate();
  const dispatch   = useDispatch();
  const { post, postComments } = useSelector(s => s.post);
  const currentUser = useSelector(s => s.auth.user);
  const author      = useSelector(s => s.user.userById);

  // comment states
  const [commentText, setCommentText] = useState("");
  const [editingId, setEditingId]     = useState(null);
  const [editingText, setEditingText] = useState("");

  // edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCaption, setEditCaption]     = useState("");
  const [editLocation, setEditLocation]   = useState("");
  const [editTags, setEditTags]           = useState([]);

  // report modal
  const [reportOpen, setReportOpen]       = useState(false);

  // speech-to-text
  const activeRecordingPostRef = useRef(null);
  const commentInputRef        = useRef();
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition }
    = useSpeechRecognition();

  // fetch data
  useEffect(() => {
    dispatch(getPostById(postId));
    dispatch(getPostComments(postId));
  }, [dispatch, postId]);

  useEffect(() => {
    if (post?.user?._id) dispatch(getUserbyId(post.user._id));
  }, [dispatch, post]);

  // seed edit form
  useEffect(() => {
    if (post) {
      setEditCaption(post.caption || "");
      setEditLocation(post.location || "");
      setEditTags(post.tags?.map(u => ({ value: u._id, label: u.username })) || []);
    }
  }, [post]);

  // speech sync
  useEffect(() => {
    if (activeRecordingPostRef.current === postId && transcript) {
      setCommentText(transcript);
    }
  }, [transcript, postId]);
  useEffect(() => {
    if (!listening) activeRecordingPostRef.current = null;
  }, [listening]);

  if (!post || !author) return <div>Loading…</div>;

  const isVideo = url => {
    try { return /\.(mp4|mov|avi|webm)$/i.test(new URL(url).pathname); }
    catch { return false; }
  };
  const hasLiked = post.likes.includes(currentUser._id);
  const hasSaved = currentUser.savedPosts.includes(post._id);
  const isOwner  = post.user._id === currentUser._id || currentUser.isAdmin;

  // handlers
  const handleLike  = () => dispatch(toggleLike(post._id));
  const handleSave  = () => dispatch(toggleSavePost(post._id));
  const startListen = () => {
    if (!browserSupportsSpeechRecognition) return;
    resetTranscript();
    activeRecordingPostRef.current = postId;
    SpeechRecognition.startListening({ continuous: false });
    commentInputRef.current?.focus();
  };
  const submitComment = e => {
    e.preventDefault();
    if (!commentText.trim()) return;
    dispatch(addComment(post._id, commentText));
    setCommentText("");
    resetTranscript();
  };
  const editC = (id,text) => { setEditingId(id); setEditingText(text); };
  const saveC = id => { dispatch(editComment(post._id,id,editingText)); setEditingId(null); };
  const delC  = id => {
    swal({
      title: "Delete this comment?",
      text: "This cannot be undone",
      icon: "warning",
      buttons: ["Cancel","Delete"],
      dangerMode: true
    }).then(ok => ok && dispatch(deleteComment(post._id,id)));
  };
  const delP  = () => {
    swal({
      title: "Delete this post?",
      text: "This cannot be undone",
      icon: "warning",
      buttons: ["Cancel","Delete"],
      dangerMode: true
    }).then(ok => ok && dispatch(deletePost(post._id)) && navigate("/profile"));
  };
  const saveP = async () => {
    await dispatch(editPost(post._id,{
      caption: editCaption,
      location: editLocation,
      tags: editTags.map(t=>t.value)
    }));
    setShowEditModal(false);
    dispatch(getPostById(postId));
  };

  // tag options
  const tagOptions = (currentUser.following||[]).map(f => ({
    value:f.user, label:f.username
  }));

  return (
    <div className="min-h-screen max-w-4xl mx-auto bg-white p-4 space-y-6">

      {/* HEADER + report */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link to={`/profile/${author._id}`} className="flex items-center gap-2">
              <img
                src={author.profilePhoto.url}
                alt={author.username}
                className="w-10 h-10 rounded-full object-cover"
              />
            </Link>
            <span className="font-semibold text-lg">{author.username}</span>
            {post.tags.length>0 && <FaTag className="text-blue-600" />}
            {post.tags.map((u,i)=>(
              <Link
                key={u._id}
                to={`/profile/${u._id}`}
                className="text-blue-600 hover:underline text-sm"
              >{u.username}{i<post.tags.length-1?', ':''}</Link>
            ))}
          </div>
          {post.location && (
            <p className="text-gray-500 text-sm mt-1 ml-12">📍 {post.location}</p>
          )}
        </div>
        {currentUser._id !== post.user._id && (
          <button
            onClick={()=>setReportOpen(true)}
            className="p-1 text-gray-600 hover:text-red-600"
          ><FaEllipsisH/></button>
        )}
        {isOwner && (
          <div className="flex gap-2">
            <button onClick={()=>setShowEditModal(true)} className="text-blue-500 hover:text-blue-700">
              <FaEdit size={20}/>
            </button>
            <button onClick={delP} className="text-red-500 hover:text-red-700">
              <FaTrash size={20}/>
            </button>
          </div>
        )}
      </div>

      {/* MEDIA */}
      <div>
        {isVideo(post.media[0])
          ? <video controls className="w-full rounded-lg">
              <source src={post.media[0]} type="video/mp4"/>
            </video>
          : <img src={post.media[0]} alt="Post" className="w-full rounded-lg object-contain"/>
        }
      </div>

      {/* ACTIONS */}
      <div className="flex items-center gap-6 text-gray-700">
        <button onClick={handleLike} className="inline-flex items-center space-x-2">
          <FaHeart className={`text-2xl ${hasLiked?'text-red-500':'text-gray-500'}`}/>
          <span>{post.likes.length}</span>
        </button>
        <button onClick={()=>commentInputRef.current.focus()} className="inline-flex items-center space-x-2">
          <FaComment className="text-2xl text-gray-500"/>
          <span>{post.comments.length}</span>
        </button>
        <button onClick={handleSave} className="inline-flex items-center space-x-2">
          <FaBookmark className={`text-2xl ${hasSaved?'text-yellow-400':'text-gray-500'}`}/>
        </button>
      </div>

      {/* CAPTION */}
      {post.caption && (
        <p className="text-gray-800">
          <span className="font-semibold mr-1">{author.username}</span>
          {post.caption}
        </p>
      )}

      {/* COMMENT INPUT */}
      <form onSubmit={submitComment} className="flex items-center gap-2">
        <button type="button" onClick={startListen}
          className={`text-xl focus:outline-none ${listening?'text-red-500':'text-gray-500'}`}>
          <FaMicrophone/>
        </button>
        <input
          ref={commentInputRef}
          type="text"
          value={commentText}
          onChange={e=>setCommentText(e.target.value)}
          placeholder="Add a comment…"
          className="flex-grow border rounded-lg px-3 py-2 focus:ring focus:border-blue-300"
        />
        <button type="submit" className="text-xl text-blue-600"><FaPaperPlane/></button>
      </form>

      {/* COMMENTS */}
      {postComments.length===0
        ? <div className="flex items-center justify-center py-20">
            <p className="text-gray-500 text-lg">Be the first to comment</p>
          </div>
        : <div className="space-y-4">
            {postComments.map(c=>(
              <div key={c._id} className="flex items-start gap-3">
                <Link to={`/profile/${c.user._id}`} className="flex-shrink-0">
                  <img src={c.user.profilePhoto.url} alt="" className="w-8 h-8 rounded-full"/>
                </Link>
                <div className="flex-1">
                  <span className="font-semibold mr-2">{c.user.username}</span>
                  {editingId===c._id
                    ? <div className="flex items-center gap-2 mt-1">
                        <input
                          className="flex-grow border p-1 rounded"
                          value={editingText}
                          onChange={e=>setEditingText(e.target.value)}
                        />
                        <button onClick={()=>saveC(c._id)} className="text-blue-600">Save</button>
                      </div>
                    : <p className="mt-1">{c.text}</p>
                  }
                </div>
                {(c.user._id===currentUser._id||post.user._id===currentUser._id)&&(
                  <div className="flex flex-col items-center gap-1 ml-2 text-gray-500">
                    {c.user._id===currentUser._id&&(
                      <button onClick={()=>editC(c._id,c.text)}>
                        <FaEdit/>
                      </button>
                    )}
                    <button onClick={()=>delC(c._id)}>
                      <FaTrash/>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
      }

      {/* EDIT POST MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
            <h2 className="text-xl font-semibold">Edit Post</h2>
            <NominatimAutocomplete onSelect={s=>setEditLocation(s.display_name)}/>
            <p className="text-sm text-gray-600">Current: {editLocation}</p>
            <textarea
              className="w-full border rounded px-3 py-2"
              placeholder="Caption"
              value={editCaption}
              onChange={e=>setEditCaption(e.target.value)}
            />
            <Select
              options={tagOptions} isMulti value={editTags}
              onChange={setEditTags} placeholder="Tag friends…"
            />
            <div className="flex justify-end gap-2">
              <button onClick={saveP} className="bg-blue-500 text-white px-4 py-2 rounded">
                Save
              </button>
              <button onClick={()=>setShowEditModal(false)} className="text-gray-600 hover:underline">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REPORT MODAL */}
      {reportOpen && (
        <ReportModal
          referenceId={post._id}
          type="post"
          onClose={()=>setReportOpen(false)}
        />
      )}
    </div>
  );
}
