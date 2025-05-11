// src/components/FollowersList.jsx
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeFollower } from '../redux/ApiCalls/UserApiCall';

const FollowersList=()=> {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <h2 className="text-xl font-bold mb-4">Your Followers</h2>
      {user.followers.length === 0 ? (
        <p className="text-gray-500">You have no followers.</p>
      ) : (
        <ul className="space-y-4">
          {user.followers.map(f => (
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
                onClick={() => dispatch(removeFollower(f.user))}
                className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default FollowersList;
