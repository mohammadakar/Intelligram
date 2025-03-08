import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  bio: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setBio(state, action) {
      state.bio = action.payload
  }
}
});

export const userActions = userSlice.actions;
export const userReducer = userSlice.reducer;
