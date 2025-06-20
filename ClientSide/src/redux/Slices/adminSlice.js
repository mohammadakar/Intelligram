import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  users: [],
  posts: [],
  reports: [],
  stories:  []
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setUsers(state, action) {
      state.users = action.payload;
    },
    setPosts(state, action) {
      state.posts = action.payload;
    },
    setReports(state, action) {
      state.reports = action.payload;
    },
    setStories(state, action) {
      state.stories = action.payload;
    },
  }
});

export const adminActions = adminSlice.actions;
export const adminReducer = adminSlice.reducer;
