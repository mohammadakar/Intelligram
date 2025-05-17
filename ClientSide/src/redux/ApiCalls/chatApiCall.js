// src/redux/ApiCalls/chatApiCall.js
import request from '../../utils/request';
import { toast } from 'react-toastify';
import { chatActions } from '../Slices/ChatSlice';

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
