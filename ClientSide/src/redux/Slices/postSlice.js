import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  posts: [],
  newPost: null,
  loading: false,
  error: null,
  post: null,
};

const postSlice = createSlice({
  name: 'post',
  initialState,
  reducers: {
    setPosts(state, action) {
      state.posts = action.payload;
    },
    setNewPost(state, action) {
      state.newPost = action.payload;
    },
    setPost(state, action) {
      state.post = action.payload;
    },
    createPostStart(state) {
      state.loading = true;
      state.error = null;
    },
    createPostSuccess(state, action) {
      state.loading = false;
      state.posts.unshift(action.payload);
    },
    createPostFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    }
  }
});

export const postActions = postSlice.actions;
export const postReducer = postSlice.reducer;
