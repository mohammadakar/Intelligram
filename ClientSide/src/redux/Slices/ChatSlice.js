// src/redux/Slices/chatSlice.js
import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    list: [],          // all chats
    activeChat: null,  // currently open chat
  },
  reducers: {
    setChats(state, action) {
      state.list = action.payload;
    },
    setActiveChat(state, action) {
      state.activeChat = action.payload;
      // also ensure it’s in list
      const idx = state.list.findIndex(c => c._id === action.payload._id);
      if (idx === -1) state.list.unshift(action.payload);
      else state.list[idx] = action.payload;
    },
    appendMessage(state, { payload }) {
      const { chatId, message } = payload;
      if (state.activeChat && state.activeChat._id === chatId) {
        state.activeChat.messages.push(message);
      }
      const chat = state.list.find(c => c._id === chatId);
      if (chat) {
        chat.messages.push(message);
      }
    },
    updateMessage(state, { payload }) {
      const { chatId, message } = payload;
      [state.activeChat, ...state.list].forEach(chat => {
        if (chat && chat._id === chatId) {
          const msgIdx = chat.messages.findIndex(m => m._id === message._id);
          if (msgIdx !== -1) chat.messages[msgIdx] = message;
        }
      });
    },
    removeMessage(state, { payload }) {
      const { chatId, messageId } = payload;
      [state.activeChat, ...state.list].forEach(chat => {
        if (chat && chat._id === chatId) {
          chat.messages = chat.messages.filter(m => m._id !== messageId);
        }
      });
    },
    removeChat(state, action) {
      state.list = state.list.filter(c => c._id !== action.payload);
      if (state.activeChat?._id === action.payload) {
        state.activeChat = null;
      }
    }
  }
});

export const chatActions = chatSlice.actions;
export const chatReducer = chatSlice.reducer;
