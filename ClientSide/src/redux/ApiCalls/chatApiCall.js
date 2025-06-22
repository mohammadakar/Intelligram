import request from '../../utils/request';
import { toast } from 'react-toastify';
import { chatActions } from '../Slices/chatSlice';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from '../../firebase'; // Ensure this imports your Firebase app correctly

const storage = getStorage(app);

// 1) List my chats
export function listMyChats() {
  return async (dispatch, getState) => {
    try {
      const token = getState().auth.user.token;
      const res = await request.get('/api/chats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      dispatch(chatActions.setChats(res.data));
      return res;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load chats');
      throw err;
    }
  };
}

// 2) Get or create one-to-one chat
export function getOrCreateChat(otherId) {
  return async (dispatch, getState) => {
    try {
      const token = getState().auth.user.token;
      const res = await request.get(`/api/chats/${otherId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // set this as the active chat in Redux
      dispatch(chatActions.setActiveChat(res.data));
      return res;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to open chat');
      throw err;
    }
  };
}

// 3) Upload file to Firebase storage
export function uploadFile(file) {
  return async () => {
    try {
      const path = `chat_media/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, path);
      
      // Upload file
      await uploadBytes(storageRef, file);
      
      // Get download URL
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (err) {
      console.error("Error uploading file:", err);
      toast.error('Failed to upload file');
      throw err;
    }
  };
}

// 4) Send a message (text, media, or audio)
export function sendMessage({ chatId, content = '', media = [], type }) {
  return async (dispatch, getState) => {
    try {
      const token = getState().auth.user.token;
      
      const body = { 
        content: content.trim(), 
        media, 
        type: type || (media.length ? 'file' : 'text') 
      };
      
      const res = await request.post(
        `/api/chats/${chatId}/message`,
        body,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      dispatch(chatActions.appendMessage({ chatId, message: res.data }));
      return res;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
      throw err;
    }
  };
}

// 5) Edit a message
export function editMessage(chatId, messageId, content) {
  return async (dispatch, getState) => {
    try {
      const token = getState().auth.user.token;
      const res = await request.put(
        `/api/chats/${chatId}/messages/${messageId}`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(chatActions.updateMessage({ chatId, message: res.data }));
      return res;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to edit');
      throw err;
    }
  };
}

// 6) Delete a message
export function deleteMessage(chatId, messageId) {
  return async (dispatch, getState) => {
    try {
      const token = getState().auth.user.token;
      await request.delete(
        `/api/chats/${chatId}/messages/${messageId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(chatActions.removeMessage({ chatId, messageId }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
      throw err;
    }
  };
}

// 7) Delete an entire chat
export function deleteChat(chatId) {
  return async (dispatch, getState) => {
    try {
      const token = getState().auth.user.token;
      await request.delete(
        `/api/chats/${chatId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(chatActions.removeChat(chatId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete chat');
      throw err;
    }
  };
}