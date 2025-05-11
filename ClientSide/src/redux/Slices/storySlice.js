import { createSlice } from '@reduxjs/toolkit';

const storySlice = createSlice({
  name: 'story',
  initialState: { stories: [] },
  reducers: {
    setStories(state, action) {
      state.stories = action.payload;
    },
  }
});

export const storyActions = storySlice.actions;
export const storyReducer = storySlice.reducer;
