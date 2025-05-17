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
    }
  }
});

const chatActions = chatSlice.actions;
const chatReducer = chatSlice.reducer;

export { chatActions, chatReducer };
