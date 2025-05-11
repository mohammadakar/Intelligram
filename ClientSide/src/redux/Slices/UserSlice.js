import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  bio: '',
  userById: null,
  usersReturned:[],
  searchedUser: null,
  savedPosts:[]
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setBio(state, action) {
      state.bio = action.payload
  },
  setUserById(state, action) {
      state.userById = action.payload
  },
  setUsersReturned(state, action) {
      state.usersReturned = action.payload
  },
  setSearchedUser(state, action) {
      state.searchedUser = action.payload
  },
  setSavedPosts(state, action) {
      state.savedPosts = action.payload;
  }
}
});

export const userActions = userSlice.actions;
export const userReducer = userSlice.reducer;
