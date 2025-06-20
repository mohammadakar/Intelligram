import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, makeAdmin, deleteUser } from '../../redux/ApiCalls/adminApiCall';

export default function UsersTable() {
  const dispatch = useDispatch();
  const users = useSelector(s => s.admin.users);

  useEffect(() => { dispatch(fetchUsers()); }, [dispatch]);

  return (
    <div>
      <h2 className="text-2xl mb-4">All Users</h2>
      <table className="w-full bg-white rounded-lg overflow-hidden">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2">Avatar</th>
            <th>Username</th>
            <th>Warnings</th>
            <th>Is Admin</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id} className="border-t">
              <td className="p-2">
                <img src={u.profilePhoto.url} alt="" className="w-10 h-10 rounded-full"/>
              </td>
              <td>{u.username}</td>
              <td>{u.warnings || 0}</td>
              <td>{u.isAdmin ? 'Yes' : 'No'}</td>
              <td className="space-x-2">
                {!u.isAdmin && <button 
                  onClick={()=>dispatch(makeAdmin(u._id))}
                  className="px-2 py-1 bg-blue-600 text-white rounded"
                >Promote</button>}
                <button 
                  onClick={()=>dispatch(deleteUser(u._id))}
                  className="px-2 py-1 bg-red-600 text-white rounded"
                >Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
