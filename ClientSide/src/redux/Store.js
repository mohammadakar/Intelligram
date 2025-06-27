import {configureStore} from "@reduxjs/toolkit";
import { authReducer } from "./Slices/AuthSlice";
import { passwordReducer } from "./Slices/PasswordSlice";
import { postReducer } from "./Slices/postSlice";
import { userReducer } from "./Slices/UserSlice";
import { storyReducer } from "./Slices/storySlice";
import { notificationReducer } from "./Slices/notificationSlice";
import { adminReducer } from "./Slices/adminSlice";
import { chatReducer } from "./Slices/chatSlice";

const store = configureStore({
    reducer:{
        auth:authReducer,
        password:passwordReducer,
        post:postReducer,
        user:userReducer,
        story:storyReducer,
        chat:chatReducer,
        notification:notificationReducer,
        admin:adminReducer
    }
});

export default store;