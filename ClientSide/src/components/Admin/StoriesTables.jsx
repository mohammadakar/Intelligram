import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminStories, deleteAdminStory } from '../../redux/ApiCalls/adminApiCall';

export default function StoriesTable() {
  const dispatch = useDispatch();
  const stories = useSelector(s => s.admin.stories);

  useEffect(() => {
    dispatch(fetchAdminStories());
  }, [dispatch]);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md mt-6">
      <h2 className="text-2xl font-semibold mb-6">All Stories</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="w-1/6 px-4 py-2 text-left">User</th>
              <th className="w-1/12 px-4 py-2 text-center">Type</th>
              <th className="w-1/4 px-4 py-2 text-left">Created At</th>
              <th className="w-1/4 px-4 py-2 text-center">Preview</th>
              <th className="w-1/6 px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stories.map(s => (
              <tr key={s._id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 flex items-center gap-3 whitespace-nowrap mt-3.5">
                  <img
                    src={s.user?.profilePhoto.url}
                    alt={s.user?.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="font-medium">{s.user?.username}</span>
                </td>
                <td className="px-4 py-3 text-center capitalize">{s.type}</td>
                <td className="px-4 py-3">
                  {new Date(s.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-center">
                  {s.type === 'video' ? (
                    <video
                      src={s.url}
                      muted
                      loop
                      className="mx-auto w-24 h-16 object-cover rounded"
                    />
                  ) : (
                    <img
                      src={s.url}
                      className="mx-auto w-24 h-16 object-cover rounded"
                      alt="story preview"
                    />
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => dispatch(deleteAdminStory(s._id))}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {stories.length === 0 && (
              <tr>
                <td colSpan="5" className="px-4 py-6 text-center text-gray-500">
                  No stories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
