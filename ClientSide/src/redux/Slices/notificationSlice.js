import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

const notificationSlice = createSlice({
  name: "notification",
  initialState: { list: [] },
  reducers: {
    setList(state, action) { state.list = action.payload; },
    markAllRead(state) { state.list.forEach(n=>n.read=true); },
    pushNotification(state, action) {
      state.list.unshift(action.payload);
      toast.info(`New ${action.payload.type}`); 
    },
    clearNotifications(state) {
      state.list = [];
    },
  }
});

export const notificationActions = notificationSlice.actions;
export const notificationReducer = notificationSlice.reducer;