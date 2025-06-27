import { useState } from "react";
import { useDispatch } from "react-redux";
import { toggleLike, deletePost, editPost } from "../redux/ApiCalls/postApiCall";
import { toggleSavePost, sharePost } from "../redux/ApiCalls/UserApiCall";
import { Link, useNavigate } from "react-router-dom";
import { FaHeart, FaComment, FaBookmark, FaTag, FaEllipsisH, FaTrash, FaShare, FaEdit } from "react-icons/fa";
import swal from "sweetalert";
import ReportModal from "./ReportModal";
import Select from "react-select";
import NominatimAutocomplete from "./NominatimAutocomplete";
import { toast } from "react-toastify";

const PostCard = ({ post, refreshPosts }) => {
  const currentUser = JSON.parse(localStorage.getItem("userinfo"));
  const dispatch = useDispatch();
  const nav = useNavigate();
  const [reportOpen, setReportOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCaption, setEditCaption] = useState(post?.caption || "");
  const [editLocation, setEditLocation] = useState(post?.location || "");
  const [editTags, setEditTags] = useState(
    post.tags?.map(u => ({ value: u._id, label: u?.username })) || []
  );

  const isOwner = currentUser?._id === post?.user._id;
  const hasLiked = post?.likes?.includes(currentUser?._id);
  const hasSaved = (currentUser?.savedPosts || []).includes(post?._id);
  const isShared = currentUser?.sharedPosts?.includes(post?._id);

  const isVideo = url => /\.(mp4|mov|avi|webm)$/i.test(new URL(url).pathname);

  const handleDelete = () => {
    swal({
      title: "Delete this post?",
      text: "This cannot be undone",
      icon: "warning",
      buttons: ["Cancel", "Delete"],
      dangerMode: true
    }).then(ok => {
      if (ok) {
        dispatch(deletePost(post?._id));
        refreshPosts?.();
      }
    });
  };

  const handleShareToggle = () => {
    dispatch(sharePost(post?._id));
    setIsMenuOpen(false);
    toast.success(isShared ? "Post unshared" : "Post shared to your profile");
  };

  const handleEditSave = async () => {
    await dispatch(editPost(post._id, {
      caption: editCaption,
      location: editLocation,
      tags: editTags.map(t => t.value)
    }));
    setShowEditModal(false);
    toast.success("Post updated");
    refreshPosts?.();
  };

  return (
    <div className="bg-white border rounded-lg overflow-hidden mb-6 max-w-md mx-auto">
      {/* header */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <Link
            to={isOwner ? "/profile" : `/profile/${post.user?._id}`}
            className="flex items-center gap-2"
          >
            <img
              src={post?.user.profilePhoto.url}
              alt={post?.user.username}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="font-medium">{post?.user.username}</span>
          </Link>
          {post?.tags.length > 0 && (
            <div className="flex items-center ml-2 text-sm text-blue-600">
              <FaTag className="mr-1" />
              {post.tags.map((u, i) => (
                <Link key={u._id} to={`/profile/${u._id}`} className="hover:underline">
                  {u.username}{i < post.tags.length - 1 ? ", " : ""}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1 text-gray-600 hover:text-gray-800"
          >
            <FaEllipsisH />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
              {isOwner ? (
                <>
                  <button
                    onClick={() => { setShowEditModal(true); setIsMenuOpen(false); }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center"
                  >
                    <FaEdit className="mr-2" /> Edit Post
                  </button>
                  <button
                    onClick={() => { handleDelete(); setIsMenuOpen(false); }}
                    className="block w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 flex items-center"
                  >
                    <FaTrash className="mr-2" /> Delete Post
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleShareToggle}
                    className={`block w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center ${isShared ? "text-red-500" : ""}`}
                  >
                    {isShared ? (
                      <><FaTrash className="mr-2" /> Unshare Post</>
                    ) : (
                      <><FaShare className="mr-2" /> Share Post</>
                    )}
                  </button>
                  <button
                    onClick={() => { setReportOpen(true); setIsMenuOpen(false); }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Report Post
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* media */}
      <div className="w-full h-64 bg-black flex items-center justify-center">
        {isVideo(post.media[0]) ? (
          <video
            src={post.media[0]}
            controls
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <img
            src={post.media[0]}
            alt=""
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* actions */}
      <div className="flex items-center px-4 py-2 space-x-4">
        <button
          onClick={() => dispatch(toggleLike(post._id))}
          className={`text-2xl ${hasLiked ? "text-red-500" : "text-gray-500"}`}
        >
          <FaHeart />
        </button>
        <span className="text-sm">{post.likes.length}</span>

        <button
          onClick={() => nav(`/post/${post._id}`)}
          className="text-2xl text-gray-500"
        >
          <FaComment />
        </button>
        <span className="text-sm">{post.comments.length}</span>

        <button
          onClick={() => dispatch(toggleSavePost(post._id))}
          className={`ml-auto text-2xl ${hasSaved ? "text-yellow-400" : "text-gray-500"}`}
        >
          <FaBookmark />
        </button>
      </div>

      {/* caption */}
      {post.caption && (
        <div className="px-4 pb-2 text-gray-800">
          <span className="font-semibold mr-1">{post.user.username}</span>
          {post.caption}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gradient-to-r from-blue-600 to-purple-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
            <h2 className="text-xl font-semibold">Edit Post</h2>
            <NominatimAutocomplete onSelect={s => setEditLocation(s.display_name)} />
            <p className="text-sm text-gray-600">Current: {editLocation}</p>
            <textarea
              className="w-full border rounded px-3 py-2"
              placeholder="Caption"
              value={editCaption}
              onChange={e => setEditCaption(e.target.value)}
            />
            <Select
              options={currentUser.following.map(f => ({ value: f.user, label: f.username }))}
              isMulti
              value={editTags}
              onChange={setEditTags}
              placeholder="Tag friends…"
            />
            <div className="flex justify-end gap-2">
              <button onClick={handleEditSave} className="bg-blue-500 text-white px-4 py-2 rounded">
                Save
              </button>
              <button onClick={() => setShowEditModal(false)} className="text-gray-600 hover:underline">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* report modal */}
      {!isOwner && reportOpen && (
        <ReportModal
          referenceId={post?._id}
          type="post"
          onClose={() => setReportOpen(false)}
        />
      )}
    </div>
  );
}

export default PostCard;