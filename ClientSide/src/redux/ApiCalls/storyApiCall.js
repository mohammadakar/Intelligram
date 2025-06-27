import request from '../../utils/request';
import { toast } from 'react-toastify';
import { storyActions } from '../Slices/storySlice';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { app } from '../../firebase';

export function getStories() {
  return async (dispatch, getState) => {
    try {
      const token = getState().auth.user.token;
      const res   = await request.get("/api/stories", {
        headers: { Authorization: `Bearer ${token}` }
      });
      dispatch(storyActions.setStories(res.data));
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to load stories");
    }
  };
}

export function uploadStories(uploadFiles) {
  return async (dispatch, getState) => {
    try {
      const storage = getStorage(app);
      const uploaded = [];

      for (let { file, caption, location, tags } of uploadFiles) {
        const path = `stories/${Date.now()}-${file.name}`;
        const storageRef = ref(storage, path);
        const task = uploadBytesResumable(storageRef, file);

        await new Promise((res, rej) => {
          task.on('state_changed', null, rej, async () => {
            const url = await getDownloadURL(task.snapshot.ref);
            uploaded.push({ 
              url, 
              type: file.type,
              caption, 
              location, 
              tags 
            });
            res();
          });
        });
      }

      const token = getState().auth.user.token;
      await request.post('/api/stories', { stories: uploaded }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      dispatch(getStories());
      toast.success('Stories uploaded');
    } catch (err) {
      toast.error(err.message || 'Failed to upload stories');
    }
  };
}

export function toggleStoryLike(storyId) {
  return async (dispatch, getState) => {
    try {
      const token = getState().auth.user.token;
      const res   = await request.post(
        `/api/stories/${storyId}/like`, {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(storyActions.updateLikes({
        storyId,
        likes: res.data.likes
      }));
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to like story");
    }
  };
}

export function viewStory(storyId) {
  return async (dispatch, getState) => {
    try {
      const token = getState().auth.user.token;
      await request.post(
        `/api/stories/${storyId}/view`, {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      toast.error(err || "viewStory failed");
    }
  };
}

export function fetchStoryViews(storyId) {
  return async (dispatch, getState) => {
    try {
      const token = getState().auth.user.token;
      const res = await request.get(
        `/api/stories/${storyId}/views`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to fetch viewers");
      return [];
    }
  };
}

export function deleteStory(storyId) {
  return async (dispatch, getState) => {
    try {
      const token = getState().auth.user.token;
      await request.delete(
        `/api/stories/${storyId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(storyActions.removeStory(storyId));
      toast.success("Story deleted successfully");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete story");
      throw err;
    }
  };
}
