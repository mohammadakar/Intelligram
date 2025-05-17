import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: localStorage.getItem("userinfo")
        ? JSON.parse(localStorage.getItem("userinfo"))
        : null,
        newUser: null,
        isEmailVerified: false,
        loading: false,
        error: null,
    },
    reducers: {
        login(state, action) {
        state.user = action.payload;
        localStorage.setItem("userinfo", JSON.stringify(state.user));
        },
        logout(state) {
            localStorage.removeItem("userinfo");
            state.user = null;
        },
        register(state, action) {
        state.newUser = action.payload;
        },
        verifyEmailStart(state) {
        state.loading = true;
        state.error = null;
        },
        verifyEmailSuccess(state) {
        state.loading = false;
        state.isEmailVerified = true;
        state.error = null;
        },
        verifyEmailFailure(state, action) {
        state.loading = false;
        state.error = action.payload;
        },
        setFollowing(state, action) {
            state.user.following = action.payload;
        },
        setAuthSavedPosts(state, action) {
            if (state.user) state.user.savedPosts = action.payload;
        },
        setFollowers(state, action) {
            state.user.followers = action.payload;
            localStorage.setItem("userinfo", JSON.stringify(state.user));
        },
    },
});

const authReducer = authSlice.reducer;
const authActions = authSlice.actions;

export { authActions, authReducer };
