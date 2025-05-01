import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  posts: [],
  newPost: null,
  loading: false,
  error: null,
  post: null,
  postComments: [],
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
    },
    updateLikes(state, action) {
      const { postId, likes } = action.payload;
      if (state.post && state.post._id === postId) {
        state.post.likes = likes;
      }
      state.posts = state.posts.map(p =>
        p._id === postId ? { ...p, likes } : p
      );
    },
    setPostComments(state, action) {
      state.postComments = action.payload;
    },
    addComment(state, action) {
      state.postComments.push(action.payload);
    },
    addCommentToPost(state, action) {
      const { postId, comment } = action.payload;
      if (state.post && state.post._id === postId) {
        state.post.comments.push(comment);
      }
    },
    updateComment(state, action) {
      const { commentId, text } = action.payload;
      const c = state.postComments.find(c => c._id === commentId);
      if (c) c.text = text;
      if (state.post) {
        const c2 = state.post.comments.find(c => c._id === commentId);
        if (c2) c2.text = text;
      }
    },
    deleteComment(state, action) {
      const commentId = action.payload;
      state.postComments = state.postComments.filter(c => c._id !== commentId);
      if (state.post) {
        state.post.comments = state.post.comments.filter(c => c._id !== commentId);
      }
    },
    deletePost(state, action) {
      const id = action.payload;
      state.posts = state.posts.filter(p => p._id !== id);
      if (state.post && state.post._id === id) {
        state.post = null;
      }
    },
  }
});

export const postActions = postSlice.actions;
export const postReducer = postSlice.reducer;
