// src/redux/ApiCalls/chatApiCall.js
import request from '../../utils/request';
import { toast } from 'react-toastify';
import { chatActions } from '../Slices/ChatSlice';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { app } from '../../firebase';

// Upload helper
async function uploadToFirebase(fileOrBlob, folder = "chat") {
  const storage = getStorage(app);
  const timestamp = Date.now();
  // if blob has no name, fallback:
  const name = fileOrBlob.name || `recording-${timestamp}.webm`;
  const path = `${folder}/${timestamp}-${name}`;
  const storageRef = ref(storage, path);
  const task = uploadBytesResumable(storageRef, fileOrBlob);
  await new Promise((res, rej) => task.on("state_changed", null, rej, res));
  return getDownloadURL(storageRef);
}

export function listMyChats() {
  return async (dispatch, getState) => {
    const token = getState().auth.user.token;
    const res = await request.get('/api/chats', {
      headers: { Authorization: `Bearer ${token}` }
    });
    dispatch(chatActions.setChatList(res.data));
  };
}

export function getOrCreateChat(otherUserId) {
  return async (dispatch, getState) => {
    const token = getState().auth.user.token;
    const res = await request.get(`/api/chats/${otherUserId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    dispatch(chatActions.setActiveChat(res.data));
  };
}

export function sendMessage(chatId, content) {
  return async (dispatch, getState) => {
    if (!content.trim()) return;
    try {
      const token = getState().auth.user.token;
      const res = await request.post(
        `/api/chats/${chatId}/message`,
        { type: 'text', content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(chatActions.setActiveChat(res.data));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send');
    }
  };
}

// edit your message
export function editMessage(chatId, messageId, content) {
  return async (dispatch, getState) => {
    const token = getState().auth.user.token;
    const res = await request.put(
      `/api/chats/${chatId}/messages/${messageId}`,
      { content },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    dispatch(chatActions.updateMessage(res.data));
    toast.success('Message edited');
  };
}

// unsend (delete) your message
export function deleteMessage(chatId, messageId) {
  return async (dispatch, getState) => {
    const token = getState().auth.user.token;
    await request.delete(`/api/chats/${chatId}/messages/${messageId}`, { headers: { Authorization: `Bearer ${token}` } });
    dispatch(chatActions.removeMessage(messageId));
    toast.success('Message unsent');
  };
}

// delete entire chat (only for yourself)
export function deleteChat(chatId) {
  return async (dispatch, getState) => {
    const token = getState().auth.user.token;
    await request.delete(`/api/chats/${chatId}`, { headers: { Authorization: `Bearer ${token}` } });
    dispatch(chatActions.removeChat(chatId));
    toast.success('Chat deleted');
  };
}

export function sendVoiceMessage(chatId, blob) {
  return async (dispatch, getState) => {
    try {
      const url = await uploadToFirebase(blob, "chat/voice");
      const token = getState().auth.user.token;
      const res = await request.post(
        `/api/chats/${chatId}/message`,
        { type: "voice", content: url },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(chatActions.appendMessage(res.data));
    } catch {
      toast.error("Failed to send voice message");
    }
  };
}

export function sendAttachment(chatId, file) {
  return async (dispatch, getState) => {
    try {
      const url = await uploadToFirebase(file, "chat/media");
      const token = getState().auth.user.token;
      const res = await request.post(
        `/api/chats/${chatId}/message`,
        { type: "media", content: url, mime: file.type },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(chatActions.appendMessage(res.data));
    } catch {
      toast.error("Failed to send attachment");
    }
  };
}