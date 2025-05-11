// src/components/FollowingList.jsx
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toggleFollow } from '../redux/ApiCalls/UserApiCall';

const FollowingList=()=> {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <h2 className="text-xl font-bold mb-4">Users You Follow</h2>
      {user.following.length === 0 ? (
        <p className="text-gray-500">You’re not following anyone yet.</p>
      ) : (
        <ul className="space-y-4">
          {user.following.map(f => (
            <li key={f.user} className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <img
                  src={f.profilePhoto.url}
                  alt={f.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="font-medium">{f.username}</span>
              </div>
              <button
                onClick={() => dispatch(toggleFollow(f.user))}
                className="text-sm bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
              >
                Unfollow
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default FollowingList;