import { FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { warnReport } from '../../redux/ApiCalls/adminApiCall';

export default function WarnModal({ report, onClose }) {
  const dispatch = useDispatch();
  const { referenceId, type } = report;

  const handleWarn = async () => {
    await dispatch(warnReport(report._id));
    onClose();
  };

  // for preview, fetch the media URL client-side – you could also include it in `report` via populate
  const mediaUrl = report.type === 'post'
    ? report.postMedia
    : report.storyMedia;

  return (
    <div className="fixed inset-0 bg-gradient-to-r from-blue-600 to-purple-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg overflow-hidden max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Send Warning</h3>
          <button onClick={onClose}><FaTimes /></button>
        </div>
        {mediaUrl && (
          <div className="p-4">
            {type === 'post' ? (
              <img src={mediaUrl} className="w-full object-cover rounded" />
            ) : (
              <video src={mediaUrl} controls className="w-full rounded" />
            )}
          </div>
        )}
        <div className="p-4">
          <p className="mb-4">
            This will send a warning to the user:<br/>
            “We deleted your {type} because it violates our policy.”
          </p>
          <button
            onClick={handleWarn}
            className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
          >
            Send Warning
          </button>
        </div>
      </div>
    </div>
  );
}
