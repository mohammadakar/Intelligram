import { toast } from 'react-toastify';
import request from '../../utils/request';
import { adminActions } from '../Slices/adminSlice';


// Users
export function fetchUsers() {
  return async (dispatch,getState) => {
    try {
      const token = getState().auth.user.token;
      const { data } = await request.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      dispatch(adminActions.setUsers(data));
    } catch (err) {
      toast.error(err || 'Failed to load users');
    }
  };
}
export function makeAdmin(userId) {
  return async (dispatch,getState) => {
    try {
      const token = getState().auth.user.token;
      await request.put(`/api/admin/users/${userId}/make-admin`,{}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('User promoted to admin');
      dispatch(fetchUsers());
    } catch {
      toast.error('Failed to promote user');
    }
  };
}
export function deleteUser(userId) {
  return async (dispatch,getState) => {
    try {
      const token = getState().auth.user.token;
      await request.delete(`/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('User deleted');
      dispatch(fetchUsers());
    } catch {
      toast.error('Failed to delete user');
    }
  };
}

// Posts
export function fetchPosts() {
  return async (dispatch,getState) => {
    try {
      const token = getState().auth.user.token;
      const { data } = await request.get('/api/admin/posts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      dispatch(adminActions.setPosts(data));
    } catch {
      toast.error('Failed to load posts');
    }
  };
}
export function deleteAdminPost(postId) {
  return async (dispatch,getState) => {
    try {
      const token = getState().auth.user.token;
      await request.delete(`/api/admin/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Post deleted');
      dispatch(fetchPosts());
    } catch {
      toast.error('Failed to delete post');
    }
  };
}
export function deleteAdminComment(postId, commentId) {
  return async (dispatch , getState)=> {
    try {
      const token = getState().auth.user.token;
      await request.delete(`/api/admin/posts/${postId}/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Comment deleted');
      dispatch(fetchPosts());
    } catch {
      toast.error('Failed to delete comment');
    }
  };
}

// Reports
export function fetchReports() {
  return async (dispatch,getState) => {
    try {
      const token = getState().auth.user.token;
      const { data } = await request.get('/api/admin/reports', {
        headers: { Authorization: `Bearer ${token}` }
      });
      dispatch(adminActions.setReports(data));
    } catch {
      toast.error('Failed to load reports');
    }
  };
}
export function warnReport(reportId) {
  return async (dispatch,getState) => {
    try {
      const token = getState().auth.user.token;
      await request.put(`/api/admin/reports/${reportId}/warn`,{}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('User warned');
      dispatch(fetchReports());
    } catch {
      toast.error('Failed to send warning');
    }
  };
}

//stories
export function fetchAdminStories() {
  return async (dispatch, getState) => {
    try {
      const token = getState().auth.user.token;
      const res = await request.get('/api/admin/stories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      dispatch(adminActions.setStories(res.data));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load stories');
    }
  };
}

export function deleteAdminStory(storyId) {
  return async (dispatch, getState) => {
    try {
      const token = getState().auth.user.token;
      await request.delete(`/api/admin/stories/${storyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Story deleted');
      dispatch(fetchAdminStories());
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete story');
    }
  };
}