import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FiThumbsUp, 
  FiMessageCircle, 
  FiUserPlus, 
  FiAlertTriangle, 
  FiEye,
  FiCheck,
  FiX,
  FiShare
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { fetchNotifications, markNotificationsRead } from '../redux/ApiCalls/NotificationApiCall';
import { respondFollowRequest } from '../redux/ApiCalls/UserApiCall';

export default function NotificationsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list } = useSelector(s => s.notification);
  const { user } = useSelector(s => s.auth);

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
      case 'follow_accept':
      case 'follow_reject':
        return navigate(`/profile/${n.actor._id}`);
      default:
        return null;
    }
  };

  const handleFollowRequest = async (requesterId, action) => {
    try {
      await dispatch(respondFollowRequest(requesterId, action));
    } catch (err) {
      console.error("Failed to respond to follow request:", err);
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
      case 'follow_request': return <FiUserPlus className="text-xl text-blue-500" />;
      case 'follow_accept':  return <FiCheck className="text-xl text-green-500" />;
      case 'follow_reject':  return <FiX className="text-xl text-red-500" />;
      case 'share':       return <FiShare className="text-xl" />;
      default:            return <FiEye className="text-xl" />;
    }
  };

  const notificationText = (type) => {
    switch (type) {
      case 'warning': 
        return `(Warning #${user.warnings}) We deleted your Post/Story for policy violation.`;
      case 'like': 
        return 'liked your post';
      case 'comment': 
        return 'commented on your post';
      case 'follow': 
        return 'started following you';
      case 'message': 
        return 'sent you a message';
      case 'story_like': 
        return 'liked your story';
      case 'follow_request': 
        return 'sent you a follow request';
      case 'follow_accept': 
        return 'accepted your follow request';
      case 'follow_reject': 
        return 'rejected your follow request';
      case 'share': 
        return 'shared your post';
      default: 
        return '';
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
                className={`flex items-start p-3 rounded ${
                  !n.read ? 'bg-gray-100' : ''
                } ${n.type !== 'follow_request' ? 'cursor-pointer hover:bg-white' : ''}`}
                onClick={n.type !== 'follow_request' ? () => handleClick(n) : undefined}
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
                      {notificationText(n.type, n.actor?.username)}
                    </span>
                  </div>
                  
                  {/* Follow Request Buttons */}
                  {n.type === 'follow_request' && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleFollowRequest(n.actor._id, 'accept')}
                        className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        <FiCheck /> Accept
                      </button>
                      <button
                        onClick={() => handleFollowRequest(n.actor._id, 'reject')}
                        className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        <FiX /> Reject
                      </button>
                    </div>
                  )}
                  
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