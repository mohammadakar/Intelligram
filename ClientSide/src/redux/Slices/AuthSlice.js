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
    },
});

const authReducer = authSlice.reducer;
const authActions = authSlice.actions;

export { authActions, authReducer };
