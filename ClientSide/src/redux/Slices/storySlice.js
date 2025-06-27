import { createSlice } from '@reduxjs/toolkit';

const storySlice = createSlice({
  name: 'story',
  initialState: { stories: [] },
  reducers: {
    setStories(state, action) {
      state.stories = action.payload;
    },
    updateLikes(state, action) {
      const { storyId, likes } = action.payload;
      const s = state.stories.find(s => s._id === storyId);
      if (s) s.likes = likes;
    },
    removeStory(state, action) {
      state.stories = state.stories.filter(s => s._id !== action.payload);
    },
  }
});

export const storyActions = storySlice.actions;
export const storyReducer = storySlice.reducer;
