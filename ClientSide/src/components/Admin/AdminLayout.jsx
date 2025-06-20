import { useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiUsers, FiImage, FiAlertCircle } from 'react-icons/fi';
import { fetchUsers, fetchPosts, fetchReports, fetchAdminStories } from '../../redux/ApiCalls/adminApiCall';
import { logoutUser } from '../../redux/ApiCalls/UserApiCall';

export default function AdminLayout() {
  const dispatch = useDispatch();
  const { users, posts, reports ,stories} = useSelector(s => s.admin);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchPosts());
    dispatch(fetchReports());
    dispatch(fetchAdminStories());
  }, [dispatch]);

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 bg-white border-r p-4 space-y-4">
        <NavLink to="users"     className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded">
          <FiUsers /> Users ({users.length})
        </NavLink>
        <NavLink to="posts"     className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded">
          <FiImage /> Posts ({posts.length})
        </NavLink>
        <NavLink to="stories"   className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded">
          <FiAlertCircle /> Stories ({stories.length})
        </NavLink>
        <NavLink to="reports"   className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded">
          <FiAlertCircle /> Reports ({reports.length})
        </NavLink>
        <button
            onClick={() => dispatch(logoutUser())}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-red-700 mt-auto w-full"
          >
            Logout
          </button>
      </aside>
      <main className="flex-1 p-6 bg-gray-50">
        <Outlet/>
      </main>
    </div>
  );
}
