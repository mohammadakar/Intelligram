// client/src/components/NotificationsPage.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchNotifications,
  markNotificationsRead,
} from "../redux/ApiCalls/NotificationApiCall";
import { respondFollowRequest } from "../redux/ApiCalls/UserApiCall";
import {
  FiThumbsUp,
  FiMessageCircle,
  FiUserPlus,
  FiCheckCircle,
  FiXCircle,
  FiSun,
} from "react-icons/fi";

export default function NotificationsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list } = useSelector((s) => s.notification);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      await dispatch(fetchNotifications());
      await dispatch(markNotificationsRead());
      setLoading(false);
    }
    loadAll();
  }, [dispatch]);

  const handleNavigate = (n) => {
    switch (n.type) {
      case "like":
      case "comment":
        return navigate(`/post/${n.reference}`);
      case "message":
        return navigate("/chat");
      case "story_like":
        return navigate(`/post/${n.reference}`);
      case "follow_accept":
        // If someone accepted your request, view their profile:
        return navigate(`/profile/${n.actor._id}`);
      default:
        return null;
    }
  };

  const iconFor = (type) => {
    switch (type) {
      case "like":
      case "story_like":
        return <FiThumbsUp className="text-xl" />;
      case "comment":
      case "message":
        return <FiMessageCircle className="text-xl" />;
      case "follow_request":
      case "follow_accept":
      case "follow_reject":
        return <FiUserPlus className="text-xl" />;
      default:
        return <FiSun className="text-xl" />;
    }
  };

  const handleAccept = async (n) => {
    await dispatch(respondFollowRequest(n.actor._id, "accept"));
    await dispatch(fetchNotifications());
  };
  const handleReject = async (n) => {
    await dispatch(respondFollowRequest(n.actor._id, "reject"));
    await dispatch(fetchNotifications());
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <h1 className="px-4 py-2 border-b font-semibold text-lg bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl">
        Notifications
      </h1>

      {loading && (
        <div className="p-4 text-gray-500">Loading notifications…</div>
      )}
      {!loading && list.length === 0 && (
        <p className="p-4 text-gray-500">You have no notifications yet.</p>
      )}

      <div className="divide-y">
        {list.map((n) => (
          <div
            key={n._id}
            className="relative flex items-start gap-3 px-4 py-3 hover:bg-gray-100"
          >
            <img
              src={n.actor.profilePhoto.url}
              alt={n.actor.username}
              className="w-8 h-8 rounded-full object-cover"
            />

            <div className="flex-1">
              <div className="flex items-center gap-1">
                {iconFor(n.type)}
                <span className="font-medium">{n.actor.username}</span>{" "}
                <span className="text-gray-600">
                  {n.type === "like" && "liked your post"}
                  {n.type === "comment" && "commented on your post"}
                  {n.type === "story_like" && "liked your story"}
                  {n.type === "message" && "sent you a message"}
                  {n.type === "follow_request" && "requested to follow you"}
                  {n.type === "follow_accept" && "accepted your follow request"}
                  {n.type === "follow_reject" && "rejected your follow request"}
                  {n.type === "admin" && "took admin action"}
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {new Date(n.createdAt).toLocaleString()}
              </div>

              {n.type === "follow_request" && (
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => handleAccept(n)}
                    className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    <FiCheckCircle /> Accept
                  </button>
                  <button
                    onClick={() => handleReject(n)}
                    className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    <FiXCircle /> Reject
                  </button>
                </div>
              )}
            </div>

            {/* If not a follow_request, clicking row navigates */}
            {n.type !== "follow_request" && (
              <button
                onClick={() => handleNavigate(n)}
                className="absolute inset-0 w-full h-full"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
