import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReports } from '../../redux/ApiCalls/adminApiCall';
import { useNavigate } from 'react-router-dom';
import WarnModal from './WarnModal';

export default function ReportsTable() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const reports = useSelector(s => s.admin.reports);
  const [warningReport, setWarningReport] = useState(null);

  useEffect(() => {
    dispatch(fetchReports());
  }, [dispatch]);

  return (
    <div>
      <h2 className="text-2xl mb-4">All Reports</h2>
      <table className="w-full bg-white rounded shadow">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-2">Reporter</th>
            <th className="p-2">Type</th>
            <th className="p-2">Reason</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports?.map(r => (
            <tr key={r._id} className="border-t">
              <td className="p-2 flex items-center gap-2">
                <img
                  src={r.reporter?.profilePhoto.url}
                  alt={r.reporter?.username}
                  className="w-8 h-8 rounded-full"
                />
                {r.reporter?.username}
              </td>
              <td className="p-2">{r.type}</td>
              <td className="p-2">{r.description}</td>
              <td className="p-2 space-x-2">
                {
                  r.type === 'post'?
                <button
                  onClick={() => navigate(
                    `/post/${r.referenceId}`
                  )}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  View
                </button>:<></>
               }
                <button
                  onClick={() => setWarningReport(r)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Warn
                </button>
              </td>
            </tr>
          ))}
          {reports.length === 0 && (
            <tr>
              <td colSpan="4" className="p-4 text-center text-gray-500">
                No reports found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {warningReport && (
        <WarnModal
          report={warningReport}
          onClose={() => setWarningReport(null)}
        />
      )}
    </div>
  );
}
