import request from '../../utils/request';
import { toast } from 'react-toastify';

export function submitReport({ referenceId, type, description }) {
  return async (dispatch, getState) => {
    try {
      const token = getState().auth.user.token;
      await request.post(
        '/api/reports',
        { referenceId, type, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Report submitted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report');
    }
  };
}
