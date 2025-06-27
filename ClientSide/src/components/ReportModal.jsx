import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { submitReport } from '../redux/ApiCalls/reportApiCall';

export default function ReportModal({ referenceId, type, onClose }) {
  const dispatch = useDispatch();
  const [description, setDescription] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    if (!description.trim()) return;

    await dispatch(submitReport({
      referenceId,
      type,
      description
    }));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-r from-blue-600 to-purple-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6 space-y-4">
        <h2 className="text-lg font-semibold">Report this {type}</h2>
        <textarea
          rows="4"
          className="w-full border rounded p-2"
          placeholder="Please describe why you’re reporting this..."
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Send Report
          </button>
        </div>
      </div>
    </div>
  );
}
