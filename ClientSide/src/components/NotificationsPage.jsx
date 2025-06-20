import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiThumbsUp, FiMessageCircle, FiUserPlus, FiAlertTriangle, FiEye } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { fetchNotifications, markNotificationsRead } from '../redux/ApiCalls/NotificationApiCall';

export default function NotificationsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list } = useSelector(s => s.notification);

  useEffect(() => {
    dispatch(fetchNotifications());
    dispatch(markNotificationsRead());
  }, [dispatch]);

  const handleClick = n => {
    switch (n.type) {
      case 'warning':
        return null;
      case 'like':
      case 'comment':
        return navigate(`/post/${n.reference}`);
      case 'message':
        return navigate('/chat');
      case 'follow':
        return navigate(`/profile/${n.actor._id}`);
      default:
        return null;
    }
  };

  const iconFor = type => {
    switch (type) {
      case 'warning':     return <FiAlertTriangle className="text-xl text-red-500" />;
      case 'like':        return <FiThumbsUp className="text-xl" />;
      case 'comment':     return <FiMessageCircle className="text-xl" />;
      case 'follow':      return <FiUserPlus className="text-xl" />;
      case 'message':     return <FiMessageCircle className="text-xl" />;
      case 'story_like':  return <FiThumbsUp className="text-xl" />;
      default:            return <FiEye className="text-xl" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-lg font-semibold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded p-1 text-center">Notifications</h1>
      {list.length === 0
        ? <p className="text-gray-500">You have no notifications yet.</p>
        : <div className="space-y-2">
            {list?.map(n => (
              <div
                key={n._id}
                onClick={() => handleClick(n)}
                className={`flex items-start p-3 rounded cursor-pointer hover:bg-white ${
                  !n.read ? 'bg-gray-100' : ''
                }`}
              >
                <img
                  src={n?.actor?.profilePhoto?.url}
                  alt={n?.actor?.username}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    {iconFor(n?.type)}
                    <strong>{n.actor?.username}</strong>
                    <span className="text-gray-600">
                      {n.type === 'warning'
                        ? `(Warning #${n.actor.warnings}) We deleted your Post/Story for policy violation.`
                        : ({
                            like:       'liked your post',
                            comment:    'commented on your post',
                            follow:     'started following you',
                            message:    'sent you a message',
                            story_like: 'liked your story'
                          })[n.type]
                      }
                    </span>
                  </div>
                  {n.type === 'warning' && n.mediaUrl && (
                    <img
                      src={n.mediaUrl}
                      alt=""
                      className="mt-2 w-32 h-20 object-cover rounded"
                    />
                  )}
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
      }
    </div>
  );
}
