import { useState, useEffect } from 'react';
import { useDispatch, useSelector }   from 'react-redux';
import { getStories }                 from '../redux/ApiCalls/storyApiCall';
import StoryViewer                    from './StoryViewer';
import StoryUploader                  from './StoryUploader';
import { FaPlus }                     from 'react-icons/fa';

export default function HomeStories() {
  const dispatch     = useDispatch();
  const { stories }  = useSelector(s => s.story);
  const current      = useSelector(s => s.auth.user);
  const [viewId, setViewId]       = useState(null);
  const [uploaderOpen, setUp]     = useState(false);

  useEffect(() => { dispatch(getStories()); }, [dispatch]);

  // group by user
  const byUser = stories.reduce((map, s) => {
    (map[s.user._id] ||= []).push(s);
    return map;
  }, {});
  const entries = Object.entries(byUser);

  return (
    <>
      <div className="flex overflow-x-auto p-4 bg-white border-b space-x-4">
        {/* Your story “+” circle */}
        <div onClick={() => setUp(true)} className="cursor-pointer flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
            <FaPlus className="text-white text-xl" />
          </div>
          <p className="text-xs mt-1">Your Story</p>
        </div>

        {/* Followed users’ stories */}
        {entries.map(([uid, userStories]) => {
          const { username, profilePhoto } = userStories[0].user;
          return (
            <div
              key={uid}
              onClick={() => setViewId(uid)}
              className="cursor-pointer flex flex-col items-center"
            >
              <div className="w-16 h-16 p-0.5 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600">
                <img
                  src={profilePhoto.url}
                  alt={username}
                  className="w-full h-full rounded-full border-2 border-white object-cover"
                />
              </div>
              <p className="text-xs mt-1">{uid === current._id ? 'You' : username}</p>
            </div>
          );
        })}
      </div>

      {/* Story viewer modal */}
      {viewId && (
        <StoryViewer
          stories={byUser[viewId]}
          user={byUser[viewId][0].user}
          onClose={() => setViewId(null)}
        />
      )}

      {/* Story uploader modal */}
      {uploaderOpen && <StoryUploader onClose={() => setUp(false)} />}
    </>
  );
}
