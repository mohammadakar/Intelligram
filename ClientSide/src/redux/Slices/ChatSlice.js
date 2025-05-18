// src/redux/Slices/chatSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  list:       [],   // all your chats
  activeChat: null // the one you’re chatting in
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChatList(state, action) {
      state.list = action.payload;
    },
    setActiveChat(state, action) {
      state.activeChat = action.payload;
    },
    appendMessage(state, action) {
      if (state.activeChat && state.activeChat._id === action.payload.chat) {
        state.activeChat.messages.push(action.payload);
      }
      // refresh in list
      state.list = state.list.map(c =>
        c._id === action.payload.chat
          ? { ...c, messages: [...c.messages, action.payload], updatedAt: action.payload.createdAt }
          : c
      );
    },
    updateMessage(state, action) {
      const msg = action.payload;
      const chat = state.activeChat;
      if (chat && chat._id === msg.chat) {
        chat.messages = chat.messages.map(m => m._id === msg._id ? msg : m);
      }
      state.list = state.list.map(c =>
        c._id === msg.chat
          ? { ...c, messages: c.messages.map(m => m._id === msg._id ? msg : m) }
          : c
      );
    },
    removeMessage(state, action) {
      const id = action.payload;
      if (state.activeChat) {
        state.activeChat.messages = state.activeChat.messages.filter(m => m._id !== id);
      }
      state.list = state.list.map(c => ({
        ...c,
        messages: c.messages.filter(m => m._id !== id),
      }));
    },
    removeChat(state, action) {
      const chatId = action.payload;
      state.list = state.list.filter(c => c._id !== chatId);
      if (state.activeChat?._id === chatId) {
        state.activeChat = null;
      }
    },
  }
});

const chatActions = chatSlice.actions;
const chatReducer = chatSlice.reducer;

export { chatActions, chatReducer };
