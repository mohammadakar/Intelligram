// src/components/Admin/PostsTable.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPosts, deleteAdminPost } from '../../redux/ApiCalls/adminApiCall';
import { Link } from 'react-router-dom';
import videoimage from '../../vidimage/vd2.avif';

export default function PostsTable() {
  const dispatch = useDispatch();
  const posts    = useSelector(s => s.admin.posts);

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  const isVideo = url => {
    if (!url) return false;
    try {
      const pathname = new URL(url).pathname;
      return /\.(mp4|mov|avi|webm)$/i.test(pathname);
    } catch {
      return false;
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">All Posts</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full table-fixed border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="w-1/6 p-2 text-left">Owner</th>
              <th className="w-1/4 p-2 text-left">Caption</th>
              <th className="w-1/6 p-2 text-left">Media</th>
              <th className="w-1/12 p-2 text-center">Likes</th>
              <th className="w-1/12 p-2 text-center">Comments</th>
              <th className="w-1/6 p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map(p => (
              <tr key={p._id} className="border-t hover:bg-gray-50">
                <td className="p-2 flex items-center gap-2">
                  <img
                    src={p.user.profilePhoto.url}
                    alt={p.user.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="truncate">{p.user.username}</span>
                </td>
                <td className="p-2 truncate">{p.caption || '—'}</td>
                <td className="p-2 text-center">
                  {isVideo(p.media[0])
                    ? (
                      <img
                        src={videoimage}
                        alt="Video placeholder"
                        className="inline-block w-10 h-10 object-cover rounded"
                      />
                    )
                    : (
                      <img
                        src={p.media[0]}
                        alt=""
                        className="inline-block w-10 h-10 object-cover rounded"
                      />
                    )}
                </td>
                <td className="p-2 text-center">{p.likes.length}</td>
                <td className="p-2 text-center">{p.comments.length}</td>
                <td className="p-2 text-center space-x-1">
                  <Link
                    to={`/post/${p._id}`}
                    className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-green-600 text-sm"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => dispatch(deleteAdminPost(p._id))}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  No posts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
